/**
 * FoolProof API server.
 *
 * Request flow per chat turn:
 *   user message -> adversary agent (roleplay reply)
 *                -> referee agent  (tactic classification of that reply)
 *                -> both returned to the client together.
 *
 * Round end:
 *   decision -> referee judge (per-trap verdicts, AI)
 *            -> scoring engine (dollar math + grade, deterministic)
 *            -> debrief returned.
 */
import express from "express";
import cors from "cors";
import { PORT } from "./config.js";
import { scenarioSummaries, scenarioById } from "./scenarios/index.js";
import { createSession, getSession } from "./store.js";
import { adversaryReply } from "./agents/adversary.js";
import { classify, judge } from "./agents/referee.js";
import { scoreRound } from "./scoring/score.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------------------- scenarios ---------------------------- */

app.get("/api/scenarios", (_req, res) => {
  res.json({ scenarios: scenarioSummaries() });
});

// The lease document (or any scenario document) — fetched on demand.
app.get("/api/scenarios/:id/document", (req, res) => {
  const scenario = scenarioById(req.params.id);
  if (!scenario?.document) return res.status(404).json({ error: "No document" });
  res.json({ document: scenario.document });
});

/* ---------------------------- sessions ----------------------------- */

app.post("/api/sessions", (req, res) => {
  const scenario = scenarioById(req.body?.scenarioId);
  if (!scenario) return res.status(400).json({ error: "Unknown scenarioId" });

  const session = createSession(scenario);
  // The opening line is scripted (deterministic scene-setting, demo-safe).
  session.messages.push({ role: "adversary", text: scenario.opening, annotations: [] });

  res.json({
    sessionId: session.id,
    scenario: {
      id: scenario.id,
      title: scenario.title,
      character: scenario.character,
      userRole: scenario.userRole,
      decisions: scenario.decisions,
      hasDocument: Boolean(scenario.document),
    },
    messages: session.messages,
  });
});

app.post("/api/sessions/:id/messages", async (req, res, next) => {
  try {
    const session = getSession(req.params.id);
    if (!session || session.status !== "active")
      return res.status(404).json({ error: "Session not found or finished" });
    const text = String(req.body?.text || "").trim();
    if (!text) return res.status(400).json({ error: "Empty message" });
    if (text.length > 2000)
      return res.status(400).json({ error: "Message too long" });

    const scenario = scenarioById(session.scenarioId);
    session.messages.push({ role: "user", text });

    // 1) Adversary replies in character.
    const reply = await adversaryReply(scenario, session.messages);

    // 2) Referee classifies that reply against the taxonomy.
    let annotations = [];
    try {
      annotations = await classify(scenario, session.messages, reply);
    } catch (err) {
      // A referee hiccup should never kill the conversation — the final
      // judge pass still covers the round.
      console.error("[referee.classify]", err.message);
    }

    const message = { role: "adversary", text: reply, annotations };
    session.messages.push(message);
    res.json({ message });
  } catch (err) {
    next(err);
  }
});

app.post("/api/sessions/:id/decision", async (req, res, next) => {
  try {
    const session = getSession(req.params.id);
    if (!session || session.status !== "active")
      return res.status(404).json({ error: "Session not found or finished" });

    const decision = req.body?.decision;
    if (!["accept", "walk_away"].includes(decision))
      return res.status(400).json({ error: "decision must be accept | walk_away" });

    const scenario = scenarioById(session.scenarioId);

    // Referee grades the round (AI) -> scoring engine prices it (math).
    const judgment = await judge(scenario, session.messages, decision);
    const debrief = scoreRound(scenario, decision, judgment);

    session.status = "finished";
    session.debrief = debrief;

    res.json({
      debrief,
      transcript: session.messages, // annotated replay for the debrief view
    });
  } catch (err) {
    next(err);
  }
});

/* --------------------------- error handling ------------------------ */

app.use((err, _req, res, _next) => {
  console.error("[server]", err);
  const status = err.status || 500;
  const message =
    err.status === 401
      ? "Anthropic API auth failed — set ANTHROPIC_API_KEY in server/.env"
      : err.message || "Internal error";
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`FoolProof API listening on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(
      "⚠ ANTHROPIC_API_KEY is not set — the SDK will fall back to an `ant auth login` profile if you have one, otherwise API calls will fail. Copy server/.env.example to server/.env."
    );
  }
});
