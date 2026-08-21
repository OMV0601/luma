/**
 * All API routes. Request flow per round:
 *   POST /api/round            -> session + scene intro + opening line
 *   POST /api/round/:id/message-> SSE stream of the adversary's reply
 *   POST /api/round/:id/flag   -> record a "call it out" attempt
 *   POST /api/round/:id/decide -> referee (AI) + damage engine (math) -> results
 *   GET  /api/debrief/:id      -> everything the Evidence File needs
 */
import { Router } from "express";
import type { Request, Response } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "./db.ts";
import { TACTICS } from "../../shared/tactics.ts";
import type { Playbook, Finding } from "./types.ts";
import { hasApiKey, streamLlmReply } from "./adversary/llm.ts";
import {
  scriptedReply,
  scriptedBeatsComplete,
  type ScriptedState,
} from "./adversary/scripted.ts";
import { refereeRound, type TranscriptEntry } from "./referee.ts";
import { runDamage, type DamageContext } from "./damage/index.ts";
import { verifyDamage } from "./damage/verify.ts";
import { hashPassword, verifyPassword, validateCredentials } from "./auth.ts";

export const api = Router();

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

function requireUser(req: Request, res: Response): number | null {
  const id = req.session.userId;
  if (!id) {
    res.status(401).json({ error: "Not logged in" });
    return null;
  }
  return id;
}

api.post("/signup", (req, res) => {
  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");
  const invalid = validateCredentials(username, password);
  if (invalid) return res.status(400).json({ error: invalid });

  const existing = db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .get();
  if (existing) return res.status(409).json({ error: "That codename is taken. Try another." });

  const user = db
    .insert(schema.users)
    .values({ username, passwordHash: hashPassword(password), isGuest: false, createdAt: new Date() })
    .returning()
    .get();
  req.session.userId = user.id;
  // isNew tells the client to launch the first-time walkthrough.
  res.json({ user: { id: user.id, username: user.username, isGuest: false }, isNew: true });
});

api.post("/login", (req, res) => {
  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  const user = db.select().from(schema.users).where(eq(schema.users.username, username)).get();
  // Same message for "no such user" and "wrong password" — don't leak which.
  if (!user || user.isGuest || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Wrong codename or password." });
  }
  req.session.userId = user.id;
  res.json({ user: { id: user.id, username: user.username, isGuest: false }, isNew: false });
});

api.post("/guest", (req, res) => {
  const username = `Guest-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const user = db
    .insert(schema.users)
    .values({ username, isGuest: true, createdAt: new Date() })
    .returning()
    .get();
  req.session.userId = user.id;
  res.json({ user: { id: user.id, username: user.username, isGuest: true } });
});

api.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

function tallies(userId: number) {
  const rows = db
    .select({ damage: schema.results.damageDollars })
    .from(schema.results)
    .innerJoin(schema.sessions, eq(schema.results.sessionId, schema.sessions.id))
    .where(eq(schema.sessions.userId, userId))
    .all();
  let moneyProtected = 0;
  let moneyLost = 0;
  for (const r of rows) {
    if (r.damage < 0) moneyProtected += -r.damage;
    else moneyLost += r.damage;
  }
  return { moneyProtected, moneyLost, roundsPlayed: rows.length };
}

api.get("/me", (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.json({ user: null });
  const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (!user) return res.json({ user: null });
  res.json({
    user: { id: user.id, username: user.username, isGuest: user.isGuest },
    ...tallies(userId),
    liveAdversary: hasApiKey(),
  });
});

/* ------------------------------------------------------------------ */
/* Scenarios (dossier cards)                                           */
/* ------------------------------------------------------------------ */

api.get("/scenarios", (req, res) => {
  const userId = req.session.userId;
  const rows = db.select().from(schema.scenarios).orderBy(schema.scenarios.orderIndex).all();

  // Best verdict per scenario for the stamp: CASE CLOSED > MARK > UNPLAYED.
  const bests = new Map<number, string>();
  if (userId) {
    const played = db
      .select({ scenarioId: schema.sessions.scenarioId, verdict: schema.results.verdict })
      .from(schema.results)
      .innerJoin(schema.sessions, eq(schema.results.sessionId, schema.sessions.id))
      .where(eq(schema.sessions.userId, userId))
      .all();
    for (const p of played) {
      const prev = bests.get(p.scenarioId);
      if (prev !== "case_closed") bests.set(p.scenarioId, p.verdict);
    }
  }

  res.json({
    scenarios: rows.map((s) => ({
      slug: s.slug,
      title: s.title,
      setup: s.setup,
      adversaryName: s.adversaryName,
      avatar: s.avatar,
      difficulty: s.difficulty,
      supportsVoice: s.supportsVoice,
      best: bests.get(s.id) ?? "unplayed",
    })),
  });
});

/* ------------------------------------------------------------------ */
/* Round lifecycle                                                     */
/* ------------------------------------------------------------------ */

api.post("/round", (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const slug = String(req.body?.scenarioId ?? "");
  const voiceMode = Boolean(req.body?.voiceMode);
  const scenario = db.select().from(schema.scenarios).where(eq(schema.scenarios.slug, slug)).get();
  if (!scenario) return res.status(400).json({ error: "Unknown scenario" });

  const playbook = scenario.playbook as Playbook;
  const session = db
    .insert(schema.sessions)
    .values({
      userId,
      scenarioId: scenario.id,
      voiceMode,
      rngSeed: Math.floor(Math.random() * 1e9),
      createdAt: new Date(),
    })
    .returning()
    .get();

  const opening = db
    .insert(schema.messages)
    .values({
      sessionId: session.id,
      role: "adversary",
      content: playbook.opening,
      turnIndex: 0,
      createdAt: new Date(),
    })
    .returning()
    .get();

  res.json({
    sessionId: session.id,
    scenario: {
      slug: scenario.slug,
      title: scenario.title,
      setup: scenario.setup,
      adversaryName: scenario.adversaryName,
      avatar: scenario.avatar,
      supportsVoice: scenario.supportsVoice,
      callerId: playbook.callerId ?? null,
      decisions: playbook.decisions,
      document: playbook.document ?? null,
      beatCount: playbook.beats.length,
    },
    messages: [
      { id: opening.id, role: opening.role, content: opening.content, turnIndex: 0 },
    ],
    liveAdversary: hasApiKey(),
  });
});

function loadRound(req: Request, res: Response) {
  const userId = requireUser(req, res);
  if (!userId) return null;
  const id = Number(req.params.id);
  const session = db.select().from(schema.sessions).where(eq(schema.sessions.id, id)).get();
  if (!session || session.userId !== userId) {
    res.status(404).json({ error: "Round not found" });
    return null;
  }
  const scenario = db
    .select()
    .from(schema.scenarios)
    .where(eq(schema.scenarios.id, session.scenarioId))
    .get()!;
  return { session, scenario, playbook: scenario.playbook as Playbook };
}

/** SSE helper: `data: {json}\n\n` frames over a fetch-readable stream. */
function sseInit(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  return (payload: unknown) => res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

api.post("/round/:id/message", async (req, res) => {
  const round = loadRound(req, res);
  if (!round) return;
  const { session, scenario, playbook } = round;
  if (session.status !== "active") return res.status(409).json({ error: "Round already decided" });

  const content = String(req.body?.content ?? "").trim().slice(0, 1500);
  if (!content) return res.status(400).json({ error: "Empty message" });

  const history = db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.sessionId, session.id))
    .orderBy(schema.messages.turnIndex)
    .all();
  const nextTurn = history.length;

  db.insert(schema.messages)
    .values({
      sessionId: session.id,
      role: "user",
      content,
      turnIndex: nextTurn,
      createdAt: new Date(),
    })
    .run();

  const send = sseInit(res);
  let replyText = "";
  let beatIndex = session.currentBeat;
  let scriptedState = (session.scriptedState as ScriptedState | null) ?? null;

  try {
    if (hasApiKey()) {
      const result = await streamLlmReply(
        scenario.persona,
        playbook,
        session.currentBeat,
        [...history.map((m) => ({ role: m.role as "adversary" | "user", content: m.content })), { role: "user", content }],
        (delta) => send({ delta })
      );
      replyText = result.text;
      if (result.beatId) {
        const idx = playbook.beats.findIndex((b) => b.id === result.beatId);
        if (idx >= 0) beatIndex = Math.max(beatIndex, idx);
      }
    } else {
      // Scripted fallback: same wire shape, word-chunked for typing feel.
      const result = scriptedReply(playbook, scriptedState, content);
      replyText = result.text;
      scriptedState = result.state;
      beatIndex = result.state.beat;
      // A beat of "typing…" before the reply starts — an instant answer
      // reads as robotic. (The live LLM path has real latency already.)
      await sleep(1100 + Math.floor(Math.random() * 800));
      for (const word of replyText.split(/(?<=\s)/)) {
        send({ delta: word });
        await sleep(24);
      }
    }
  } catch (err) {
    console.error("[adversary]", err);
    // Never strand the round: fall back to the scripted machine mid-stream.
    const result = scriptedReply(playbook, scriptedState, content);
    replyText = result.text;
    scriptedState = result.state;
    beatIndex = result.state.beat;
    send({ delta: replyText });
  }

  const saved = db
    .insert(schema.messages)
    .values({
      sessionId: session.id,
      role: "adversary",
      content: replyText,
      turnIndex: nextTurn + 1,
      createdAt: new Date(),
    })
    .returning()
    .get();

  const userTurns = history.filter((m) => m.role === "user").length + 1;
  const beatsComplete = hasApiKey()
    ? beatIndex >= playbook.beats.length - 1
    : scriptedState
      ? scriptedBeatsComplete(playbook, scriptedState)
      : false;

  db.update(schema.sessions)
    .set({ currentBeat: beatIndex, scriptedState })
    .where(eq(schema.sessions.id, session.id))
    .run();

  send({
    done: true,
    message: { id: saved.id, role: "adversary", content: replyText, turnIndex: saved.turnIndex },
    beat: beatIndex,
    beatCount: playbook.beats.length,
    decisionReady: beatsComplete || userTurns >= 14,
  });
  res.end();
});

api.post("/round/:id/flag", (req, res) => {
  const round = loadRound(req, res);
  if (!round) return;
  const { session } = round;
  if (session.status !== "active") return res.status(409).json({ error: "Round already decided" });

  const messageId = Number(req.body?.messageId);
  const tacticId = String(req.body?.tacticId ?? "");
  if (!TACTICS.some((t) => t.id === tacticId)) return res.status(400).json({ error: "Unknown tactic" });
  const message = db.select().from(schema.messages).where(eq(schema.messages.id, messageId)).get();
  if (!message || message.sessionId !== session.id || message.role !== "adversary")
    return res.status(400).json({ error: "Can only flag adversary messages" });

  const dup = db
    .select()
    .from(schema.flags)
    .where(and(eq(schema.flags.messageId, messageId), eq(schema.flags.tacticId, tacticId)))
    .get();
  if (dup) return res.json({ flag: { id: dup.id, messageId, tacticId } });

  const flag = db
    .insert(schema.flags)
    .values({ sessionId: session.id, messageId, tacticId, createdAt: new Date() })
    .returning()
    .get();
  res.json({ flag: { id: flag.id, messageId, tacticId } });
});

/* ------------------------------------------------------------------ */
/* Decision -> referee -> damage -> results                            */
/* ------------------------------------------------------------------ */

api.post("/round/:id/decide", async (req, res) => {
  const round = loadRound(req, res);
  if (!round) return;
  const { session, scenario, playbook } = round;
  if (session.status !== "active") return res.status(409).json({ error: "Round already decided" });

  const decision = String(req.body?.decision ?? "");
  if (!playbook.decisions.some((d) => d.id === decision))
    return res.status(400).json({ error: "Invalid decision for this scenario" });

  const messages = db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.sessionId, session.id))
    .orderBy(schema.messages.turnIndex)
    .all();
  const transcript: TranscriptEntry[] = messages.map((m) => ({
    turnIndex: m.turnIndex,
    role: m.role as "adversary" | "user",
    content: m.content,
  }));
  const flagRows = db.select().from(schema.flags).where(eq(schema.flags.sessionId, session.id)).all();
  const msgById = new Map(messages.map((m) => [m.id, m]));
  const flagInputs = flagRows.map((f) => ({
    messageTurnIndex: msgById.get(f.messageId)?.turnIndex ?? 0,
    tacticId: f.tacticId,
  }));

  // 1) Referee grades the round (LLM, or deterministic offline grader).
  const { findings } = await refereeRound(playbook, transcript, flagInputs, decision);

  // 2) A correct live flag upgrades its tactic to "caught" (merge rule),
  //    and flags get graded for the UNFOUNDED feedback.
  const beatTactics = new Set(playbook.beats.map((b) => b.tactic));
  for (const f of flagRows) {
    const turn = msgById.get(f.messageId)?.turnIndex ?? -1;
    const matching = findings.find(
      (fd) => fd.tacticId === f.tacticId && Math.abs(fd.messageIndex - turn) <= 1
    );
    const correct = Boolean(matching) || (beatTactics.has(f.tacticId) && Boolean(findings.find((fd) => fd.tacticId === f.tacticId)));
    db.update(schema.flags).set({ correct }).where(eq(schema.flags.id, f.id)).run();
    if (correct) {
      const fd = findings.find((x) => x.tacticId === f.tacticId);
      if (fd) fd.outcome = "caught";
    }
  }

  // 3) Fraud-call special rule: stayed on the line >10 user turns without
  //    transferring -> protected, but isolation graded as fell_for.
  const userTurnCount = transcript.filter((m) => m.role === "user").length;
  if (scenario.damageModel === "fraudcall" && decision === "walk" && userTurnCount > 10) {
    const iso = findings.find((f) => f.tacticId === "isolation");
    if (iso && iso.outcome !== "caught") {
      iso.outcome = "fell_for";
      iso.explanation = "You hung up eventually — but you obeyed 'stay on the line' for over ten turns first.";
    }
  }

  // 4) Deterministic damage context, derived from graded findings.
  const ctx: DamageContext = {};
  if (scenario.damageModel === "payday") {
    ctx.upsold = findings.some((f) => f.tacticId === "anchoring" && f.outcome === "fell_for") && decision === "take";
  }
  if ((scenario.damageModel === "lease" || scenario.damageModel === "notario") && playbook.document) {
    ctx.challengedClauses = playbook.document.clauses
      .filter((c) => findings.some((f) => f.tacticId === c.tacticId && f.outcome === "caught"))
      .map((c) => c.id);
  }
  if (scenario.damageModel === "generic") {
    // Scam Factory-generated scenarios carry their frozen damage spec in the playbook.
    ctx.spec = playbook.damageSpec;
  }

  let damage;
  try {
    damage = runDamage(scenario.damageModel, decision, ctx);
  } catch (err) {
    // Never let a bad model/decision take the server down mid-round.
    console.error("[damage] engine refused", scenario.damageModel, decision, err);
    return res.status(500).json({ error: "Could not score this round." });
  }

  // 5) Persist everything.
  db.update(schema.sessions)
    .set({ status: "decided", decision })
    .where(eq(schema.sessions.id, session.id))
    .run();

  const advByTurn = new Map(messages.filter((m) => m.role === "adversary").map((m) => [m.turnIndex, m.id]));
  for (const f of findings) {
    db.insert(schema.findings)
      .values({
        sessionId: session.id,
        tacticId: f.tacticId,
        messageId: advByTurn.get(f.messageIndex) ?? null,
        outcome: f.outcome,
        evidenceQuote: f.evidenceQuote,
        explanation: f.explanation,
      })
      .run();
  }

  const score = findings.filter((f) => f.outcome === "caught").length;
  const verdict = damage.damageDollars <= 0 ? "case_closed" : "mark";
  const result = db
    .insert(schema.results)
    .values({
      sessionId: session.id,
      damageDollars: damage.damageDollars,
      breakdown: damage.breakdown,
      headline: damage.headline,
      score,
      possible: playbook.beats.length,
      verdict,
      createdAt: new Date(),
    })
    .returning()
    .get();

  // 6) Codex unlocks for every tactic encountered.
  const existing = db
    .select({ tacticId: schema.codexUnlocks.tacticId })
    .from(schema.codexUnlocks)
    .where(eq(schema.codexUnlocks.userId, session.userId))
    .all()
    .map((r) => r.tacticId);
  for (const t of beatTactics) {
    if (!existing.includes(t)) {
      db.insert(schema.codexUnlocks)
        .values({ userId: session.userId, tacticId: t, unlockedAt: new Date() })
        .run();
    }
  }

  res.json({ resultId: result.id, sessionId: session.id });
});

/* ------------------------------------------------------------------ */
/* Debrief (Evidence File payload)                                     */
/* ------------------------------------------------------------------ */

api.get("/debrief/:sessionId", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const id = Number(req.params.sessionId);
  const session = db.select().from(schema.sessions).where(eq(schema.sessions.id, id)).get();
  if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
  const result = db.select().from(schema.results).where(eq(schema.results.sessionId, id)).get();
  if (!result) return res.status(404).json({ error: "Round not decided yet" });

  const scenario = db
    .select()
    .from(schema.scenarios)
    .where(eq(schema.scenarios.id, session.scenarioId))
    .get()!;
  const playbook = scenario.playbook as Playbook;
  const messages = db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.sessionId, id))
    .orderBy(schema.messages.turnIndex)
    .all();
  const findingRows = db.select().from(schema.findings).where(eq(schema.findings.sessionId, id)).all();
  const flagRows = db.select().from(schema.flags).where(eq(schema.flags.sessionId, id)).all();

  const decisionLabel =
    playbook.decisions.find((d) => d.id === session.decision)?.label ?? session.decision;

  // Independent cross-check of the damage math (cached; null without a key).
  const verification = await verifyDamage(scenario.damageModel);

  res.json({
    scenario: {
      slug: scenario.slug,
      title: scenario.title,
      adversaryName: scenario.adversaryName,
      avatar: scenario.avatar,
    },
    decision: session.decision,
    decisionLabel,
    transcript: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      turnIndex: m.turnIndex,
    })),
    findings: findingRows,
    flags: flagRows,
    result: {
      damageDollars: result.damageDollars,
      breakdown: result.breakdown,
      headline: result.headline,
      score: result.score,
      possible: result.possible,
      verdict: result.verdict,
    },
    neutralizingQuestions: playbook.neutralizingQuestions,
    document: playbook.document ?? null,
    verification,
  });
});

/* ------------------------------------------------------------------ */
/* Profile + codex                                                     */
/* ------------------------------------------------------------------ */

api.get("/profile", (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const sessionRows = db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.userId, userId))
    .all();
  const sessionIds = sessionRows.map((s) => s.id);

  const findingRows = sessionIds.length
    ? db.select().from(schema.findings).where(inArray(schema.findings.sessionId, sessionIds)).all()
    : [];

  const radar = TACTICS.map((t) => {
    const mine = findingRows.filter((f) => f.tacticId === t.id);
    const caught = mine.filter((f) => f.outcome === "caught").length;
    return {
      tacticId: t.id,
      name: t.name,
      attempts: mine.length,
      caught,
      catchRate: mine.length ? Math.round((caught / mine.length) * 100) : 0,
    };
  });

  const resultRows = sessionIds.length
    ? db
        .select()
        .from(schema.results)
        .where(inArray(schema.results.sessionId, sessionIds))
        .orderBy(desc(schema.results.createdAt))
        .all()
    : [];
  const scenarioById = new Map(
    db.select().from(schema.scenarios).all().map((s) => [s.id, s])
  );
  const sessionById = new Map(sessionRows.map((s) => [s.id, s]));

  res.json({
    ...tallies(userId),
    radar,
    history: resultRows.map((r) => {
      const sess = sessionById.get(r.sessionId)!;
      const scen = scenarioById.get(sess.scenarioId)!;
      return {
        sessionId: r.sessionId,
        scenario: scen.title,
        slug: scen.slug,
        avatar: scen.avatar,
        verdict: r.verdict,
        damageDollars: r.damageDollars,
        score: r.score,
        possible: r.possible,
        when: r.createdAt,
      };
    }),
  });
});

api.get("/codex", (req, res) => {
  const userId = req.session.userId;
  const unlocked = new Set(
    userId
      ? db
          .select({ tacticId: schema.codexUnlocks.tacticId })
          .from(schema.codexUnlocks)
          .where(eq(schema.codexUnlocks.userId, userId))
          .all()
          .map((r) => r.tacticId)
      : []
  );
  res.json({
    tactics: TACTICS.map((t) => ({ ...t, unlocked: unlocked.has(t.id) })),
  });
});
