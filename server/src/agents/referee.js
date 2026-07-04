/**
 * The referee agent — the second half of the dual-agent architecture, and
 * the answer to "isn't this just a chatbot wrapper?"
 *
 * Two jobs, both returning schema-validated JSON via structured outputs
 * (output_config.format), so responses are guaranteed parseable:
 *
 * 1. classify() — after every adversary message, tag which manipulation
 *    tactics it used, with exact quotes. Independent of the adversary, so
 *    the scammer never grades its own exam.
 * 2. judge()   — at round end, grade each of the scenario's hidden traps
 *    as missed / spotted / neutralized based on the full transcript.
 */
import { anthropic, REFEREE_MODEL } from "../config.js";
import { TACTICS, TACTIC_IDS } from "../taxonomy.js";

const TAXONOMY_TEXT = TACTICS.map(
  (t) => `- ${t.id}: ${t.name} — ${t.description}`
).join("\n");

/* ------------------------------------------------------------------ */
/* Live classification (per adversary message)                         */
/* ------------------------------------------------------------------ */

const CLASSIFY_SCHEMA = {
  type: "object",
  properties: {
    detections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tacticId: { type: "string", enum: TACTIC_IDS },
          quote: {
            type: "string",
            description: "Exact substring of the adversary message that instantiates the tactic",
          },
          explanation: {
            type: "string",
            description: "One sentence: why this quote is this tactic",
          },
        },
        required: ["tacticId", "quote", "explanation"],
        additionalProperties: false,
      },
    },
  },
  required: ["detections"],
  additionalProperties: false,
};

/**
 * Classify one adversary message against the tactic taxonomy.
 * @returns {Promise<Array<{tacticId,quote,explanation}>>}
 */
export async function classify(scenario, recentHistory, adversaryMessage) {
  const context = recentHistory
    .slice(-6)
    .map((m) => `${m.role === "adversary" ? scenario.character : "USER"}: ${m.text}`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: REFEREE_MODEL,
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: CLASSIFY_SCHEMA },
    },
    system: `You are the referee in FoolProof, a financial-manipulation training simulator. You watch a simulated scam conversation and classify manipulation attempts with precision. Only report tactics that are clearly present in the LATEST message — quality over quantity (0-3 detections is typical). Quotes must be exact substrings of the latest message.

TACTIC TAXONOMY:
${TAXONOMY_TEXT}`,
    messages: [
      {
        role: "user",
        content: `Scenario: ${scenario.title}. The adversary is: ${scenario.character}.

Recent conversation:
${context || "(conversation start)"}

LATEST ADVERSARY MESSAGE to classify:
"""
${adversaryMessage}
"""`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  return JSON.parse(text.text).detections;
}

/* ------------------------------------------------------------------ */
/* End-of-round judgment                                                */
/* ------------------------------------------------------------------ */

function judgeSchema(scenario) {
  return {
    type: "object",
    properties: {
      traps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            trapId: { type: "string", enum: scenario.traps.map((t) => t.id) },
            status: {
              type: "string",
              enum: ["missed", "spotted", "neutralized"],
              description:
                "missed = never noticed; spotted = called it out or asked the right question; neutralized = refused it outright or extracted a concession on it",
            },
            evidence: {
              type: "string",
              description: "Short quote from the USER showing the status (empty string if missed)",
            },
            explanation: { type: "string" },
          },
          required: ["trapId", "status", "evidence", "explanation"],
          additionalProperties: false,
        },
      },
      playerSummary: {
        type: "string",
        description: "2-3 sentences on how the user handled the encounter, addressed to them as 'you'",
      },
      coachingTips: {
        type: "array",
        items: { type: "string" },
        description: "2-3 concrete tips for next time",
      },
    },
    required: ["traps", "playerSummary", "coachingTips"],
    additionalProperties: false,
  };
}

/**
 * Grade the full round: one status per scenario trap, plus coaching.
 * @param {"accept"|"walk_away"} decision  the user's final decision
 */
export async function judge(scenario, history, decision) {
  const transcript = history
    .map((m) => `${m.role === "adversary" ? scenario.character : "USER"}: ${m.text}`)
    .join("\n\n");

  const trapList = scenario.traps
    .map(
      (t) =>
        `- ${t.id}: "${t.label}". How a user catches it: ${t.detection}`
    )
    .join("\n");

  const response = await anthropic.messages.create({
    model: REFEREE_MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: judgeSchema(scenario) },
    },
    system: `You are the referee in FoolProof, grading a completed training round. For EVERY trap listed, decide from the transcript whether the user missed it, spotted it, or neutralized it. Be fair but strict: vague suspicion is not "spotted" — the user must have engaged with the specific trap. "Neutralized" requires either an explicit refusal of that specific term/request, or a concession extracted from the adversary on it. Walking away neutralizes nothing by itself — grade what the user demonstrated they understood.

TACTIC TAXONOMY (for reference):
${TAXONOMY_TEXT}`,
    messages: [
      {
        role: "user",
        content: `Scenario: ${scenario.title} — adversary: ${scenario.character}.
Adversary's hidden objective: ${scenario.goal}

TRAPS TO GRADE:
${trapList}

USER'S FINAL DECISION: ${decision === "accept" ? scenario.decisions.accept : scenario.decisions.walkAway}

FULL TRANSCRIPT:
${transcript}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  return JSON.parse(text.text);
}
