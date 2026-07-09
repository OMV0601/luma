/**
 * THE SCAM FACTORY
 * ----------------
 * Real scam alert in, playable adversary out — one command:
 *
 *   npm run scam-factory -- "<pasted FTC alert / news text>"
 *   npm run scam-factory -- path/to/alert.txt
 *   flags: --dry (print, don't insert)   --slug <override>
 *
 * This is the moat made executable: a new scam that hits the news becomes
 * a new scenario in about a minute — content ops, not engineering. One
 * Claude call drafts the full scenario (persona, 5-beat playbook using the
 * real 10-tactic taxonomy, concessions with accurate numbers, a scripted
 * offline-fallback tree, and a damage spec); the code then VALIDATES it
 * (scripts/validateScenario.ts, one retry with the error list), assembles
 * the deterministic parts itself (decision ids, slug, ordering), freezes
 * the money math into playbook.damageSpec for the generic damage engine,
 * snapshots to src/generated/<slug>.json, and upserts the DB. The referee,
 * the scripted fallback, the Round UI, and the Evidence File all work on
 * the new scenario with zero further changes — everything downstream is
 * data-driven.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { anthropic, hasApiKey } from "../adversary/llm.ts";
import { db, schema } from "../db.ts";
import { TACTICS } from "../../../shared/tactics.ts";
import { SCENARIOS, upsertScenario } from "../seed.ts";
import { validateGenerated, type GeneratedScenario } from "./validateScenario.ts";
import type { DecisionOption, Playbook } from "../types.ts";

const MODEL =
  process.env.FACTORY_MODEL || process.env.REFEREE_MODEL || "claude-opus-4-8";

/* ------------------------------------------------------------------ */
/* CLI plumbing                                                        */
/* ------------------------------------------------------------------ */

function parseArgs() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const slugIdx = args.indexOf("--slug");
  const slugOverride = slugIdx >= 0 ? args[slugIdx + 1] : undefined;
  const rest = args.filter(
    (a, i) => a !== "--dry" && a !== "--slug" && (slugIdx < 0 || i !== slugIdx + 1)
  );
  let source = rest.join(" ").trim();
  if (rest.length === 1 && fs.existsSync(rest[0])) {
    source = fs.readFileSync(rest[0], "utf8");
  }
  return { source, dry, slugOverride };
}

function die(msg: string): never {
  console.error(`\n[scam-factory] ${msg}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Prompt                                                              */
/* ------------------------------------------------------------------ */

function buildPrompt(source: string): string {
  const taxonomy = TACTICS.map((t) => `- ${t.id}: ${t.name} — ${t.definition}`).join("\n");

  // Gold standard: the hand-written payday scenario, serialized, plus a
  // damageSpec written the way the generator must write one. Few-shot with
  // a real seed object teaches structure, tone, and fallback shape.
  const danny = SCENARIOS.find((s) => s.slug === "payday")!;
  const goldPlaybook = danny.playbook as Playbook;
  const gold = {
    title: danny.title,
    adversaryName: danny.adversaryName,
    avatar: danny.avatar,
    difficulty: danny.difficulty,
    setup: danny.setup,
    persona: danny.persona,
    opening: goldPlaybook.opening,
    beats: goldPlaybook.beats,
    escalation: goldPlaybook.escalation,
    guardrails: goldPlaybook.guardrails,
    neutralizingQuestions: goldPlaybook.neutralizingQuestions,
    fallback: goldPlaybook.fallback,
    damageSpec: {
      rows: [
        { label: "Term 1 fee (day 14)", amount: 60, note: "$15 per $100 on $400" },
        { label: "Rollover fees, typical 4-renewal cycle", amount: 240, note: "principal never shrinks — this is the product", buried: true },
        { label: "The $600 upsell's extra fees", amount: 150, note: "'a little cushion' costs 50% more per term", buried: true, negotiable: true },
      ],
      headlines: {
        take: "The typical borrower pays {total} in fees and still owes the principal.",
        negotiated: "You paid {paid} — and refused the {avoided} the cycle is built to extract.",
        walk: "You walked. Typical path avoided: {total} in fees.",
      },
    },
    decisionLabels: { take: "Take the loan", negotiated: "Take $400 only, pay in one term", walk: "Walk away" },
  };

  return `You design a training scenario for FoolProof, a consumer-protection simulator where an AI adversary runs a real, documented scam against a user so they learn to catch it safely. Build ONE complete scenario from this real scam alert:

=== SOURCE ALERT ===
${source}
=== END SOURCE ===

TACTIC TAXONOMY — every beat's "tactic" MUST be one of these ten ids, verbatim:
${taxonomy}

GOLD STANDARD — an existing hand-written scenario. Match this quality, tone, structure, and level of specificity exactly:
${JSON.stringify(gold, null, 2)}

FIELD REQUIREMENTS:
- title ≤60 chars; adversaryName; avatar = exactly one emoji; difficulty = 2–4 word UPPERCASE case-file stamp; setup = 2–3 sentences, second person, present tense, with concrete dollar stakes.
- persona ≈150 words, "You are …", with a tell and a soft spot like Danny's.
- opening: the adversary's first message.
- beats: EXACTLY 5, ids b1..b5 in order. 1–2 beats carry a concession { trigger, mustAdmit } where mustAdmit states accurate real numbers CONSISTENT with damageSpec rows — this is what makes the adversary honest-when-cornered.
- escalation: one sentence. guardrails: 2–3 scenario-specific rules. neutralizingQuestions: EXACTLY 3 — the questions that defuse this exact scam.
- fallback (offline scripted adversary): beatLines = 2 lines per beat keyed by beat id (b1..b5); triggers = 3–6 objects { match, reply, advance?, once? } where match is a valid case-insensitive regex source for the questions users actually ask (cost? is this a scam? can I verify?) — put once:true on the buried-number admission; nudges = 2–3 lines for a silent user; leave = exactly 2 strings (one final push, then graceful acceptance); filler = 2–3 lines.
- damageSpec: 2–6 rows with integer dollar amounts taken from the source alert where possible (medians/typical losses), buried:true on hidden costs, ≥1 negotiable row ONLY if a realistic partial-win exists; headlines for take/walk (and negotiated if negotiable rows exist) using {total}/{paid}/{avoided} placeholders — never literal totals.
- decisionLabels: { take, negotiated?, walk } — labels only, scenario-appropriate verbs ("Wire the money", "Hang up").

Return ONLY valid JSON, no code fences, no commentary — exactly the shape of the gold standard object above.`;
}

/* ------------------------------------------------------------------ */
/* Generation + parsing                                                */
/* ------------------------------------------------------------------ */

function extractJson(raw: string): unknown {
  const cleaned = raw.replace(/^```(json)?/m, "").replace(/```\s*$/m, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no JSON object in output");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function generate(source: string): Promise<GeneratedScenario> {
  const prompt = buildPrompt(source);
  let lastErrors: string[] = [];

  for (let attempt = 1; attempt <= 2; attempt++) {
    const messages: { role: "user" | "assistant"; content: string }[] = [
      { role: "user", content: prompt },
    ];
    if (attempt === 2) {
      messages.push({
        role: "user",
        content: `Your previous output failed validation:\n- ${lastErrors.join("\n- ")}\nReturn ONLY corrected valid JSON.`,
      });
    }
    console.log(`[scam-factory] drafting scenario (attempt ${attempt}, ${MODEL})…`);
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      messages,
    });
    const text = resp.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      lastErrors = ["model returned no text"];
      continue;
    }
    try {
      const parsed = extractJson(text.text);
      const result = validateGenerated(parsed);
      if (result.ok) return result.value;
      lastErrors = result.errors;
      console.warn(`[scam-factory] validation failed (${result.errors.length} issue(s))`);
    } catch (err) {
      lastErrors = [(err as Error).message];
      console.warn(`[scam-factory] parse failed: ${lastErrors[0]}`);
    }
  }
  die(`generation failed after retry:\n- ${lastErrors.join("\n- ")}`);
}

/* ------------------------------------------------------------------ */
/* Assembly (deterministic — the LLM never chooses these)              */
/* ------------------------------------------------------------------ */

function toSlug(title: string, override?: string): string {
  const base =
    override ??
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32);
  const taken = new Set(
    db.select({ slug: schema.scenarios.slug }).from(schema.scenarios).all().map((r) => r.slug)
  );
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

function assemble(g: GeneratedScenario, slugOverride?: string) {
  // Decision ids are damage-engine keys — always assembled here, never LLM-named.
  const decisions: DecisionOption[] = [
    { id: "take", label: g.decisionLabels.take, kind: "take" },
    ...(g.decisionLabels.negotiated
      ? [{ id: "negotiated", label: g.decisionLabels.negotiated, kind: "negotiated" as const }]
      : []),
    { id: "walk", label: g.decisionLabels.walk, kind: "walk" },
  ];

  const playbook: Playbook = {
    opening: g.opening,
    beats: g.beats,
    escalation: g.escalation,
    guardrails: [
      ...g.guardrails,
      "Never break character.",
      "Never volunteer the buried numbers unprompted.",
      "Never admit a tactic.",
      "If the user walks away, make one final attempt, then accept it.",
    ],
    neutralizingQuestions: g.neutralizingQuestions,
    decisions,
    fallback: g.fallback,
    damageSpec: g.damageSpec,
  };

  const maxOrder = db
    .select({ o: schema.scenarios.orderIndex })
    .from(schema.scenarios)
    .all()
    .reduce((m, r) => Math.max(m, r.o), 0);

  return {
    slug: toSlug(g.title, slugOverride),
    title: g.title,
    setup: g.setup,
    adversaryName: g.adversaryName,
    avatar: g.avatar,
    persona: g.persona,
    playbook,
    difficulty: g.difficulty,
    supportsVoice: false,
    damageModel: "generic",
    orderIndex: maxOrder + 1,
  };
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const { source, dry, slugOverride } = parseArgs();
  if (!hasApiKey()) die("ANTHROPIC_API_KEY required (server/.env) — the factory drafts with Claude.");
  if (source.length < 80) {
    die('need a scam description (≥80 chars):\n  npm run scam-factory -- "<pasted FTC alert text>"\n  npm run scam-factory -- path/to/alert.txt');
  }

  const started = Date.now();
  const generated = await generate(source);
  const scenario = assemble(generated, slugOverride);
  const total = generated.damageSpec.rows.reduce((s, r) => s + r.amount, 0);

  if (dry) {
    console.log(JSON.stringify(scenario, null, 2));
    return;
  }

  // Snapshot first (survives restarts; committed = ships to prod), then DB.
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "generated");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${scenario.slug}.json`), JSON.stringify(scenario, null, 2));
  upsertScenario(scenario);

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const line = "─".repeat(64);
  console.log(`\n${line}
  NEW CASE FILE OPENED — ${secs}s
${line}
  ${scenario.avatar}  ${scenario.title}
  Subject:    ${scenario.adversaryName}
  Stamp:      ${scenario.difficulty}
  Slug:       ${scenario.slug}

  PLAYBOOK`);
  (scenario.playbook as Playbook).beats.forEach((b) => {
    console.log(`    ${b.id}  ${b.tactic.padEnd(12)} ${b.goal}${b.concession ? "  [concession armed]" : ""}`);
  });
  console.log(`
  DAMAGE ON THE TABLE:  $${total.toLocaleString("en-US")}
  Offline fallback:     ready (${Object.keys((scenario.playbook as Playbook).fallback.beatLines).length} beats scripted)

  ▶ PLAY IT NOW:  http://localhost:5173/play?scenario=${scenario.slug}
${line}\n`);
}

main().catch((err) => die(err instanceof Error ? err.message : String(err)));
