/**
 * The AI Referee — the independent grader. Receives the transcript, the
 * taxonomy, the scenario's ground-truth beats, and the user's flags, and
 * returns strict JSON findings. The adversary never grades its own exam.
 *
 * Offline path: with no API key, a deterministic grader scores the round
 * from flags + keyword evidence, so the loop never depends on the network.
 */
import { anthropic, hasApiKey } from "./adversary/llm.ts";
import { TACTICS } from "../../shared/tactics.ts";
import type { Playbook, Finding } from "./types.ts";

const REFEREE_MODEL = process.env.REFEREE_MODEL || "claude-sonnet-4-6";

export interface TranscriptEntry {
  turnIndex: number;
  role: "adversary" | "user";
  content: string;
}

export interface FlagInput {
  messageTurnIndex: number;
  tacticId: string;
}

const TAXONOMY_TEXT = TACTICS.map((t) => `- ${t.id}: ${t.name} — ${t.definition}`).join("\n");

/* ------------------------------------------------------------------ */
/* LLM referee                                                          */
/* ------------------------------------------------------------------ */

function refereePrompt(
  playbook: Playbook,
  transcript: TranscriptEntry[],
  flags: FlagInput[],
  decision: string
): string {
  const beats = playbook.beats
    .map((b) => `- ${b.id}: tactic=${b.tactic} — ${b.goal}`)
    .join("\n");
  const flagText =
    flags.length === 0
      ? "(none)"
      : flags.map((f) => `- message ${f.messageTurnIndex}: flagged as "${f.tacticId}"`).join("\n");
  const convo = transcript
    .map((m) => `[${m.turnIndex}] ${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  return `You are the referee in FoolProof, a consumer-protection training simulator. Grade this completed round.

TACTIC TAXONOMY:
${TAXONOMY_TEXT}

GROUND-TRUTH PLAYBOOK (the tactics the adversary was running, in order):
${beats}

USER'S LIVE FLAGS (their "call it out" attempts during the round):
${flagText}

USER'S FINAL DECISION: ${decision}

GRADING RULES (apply exactly):
- One finding per playbook beat that was actually attempted in the transcript. Skip beats never attempted.
- outcome "caught": the user flagged the right tactic on the message where it happened, OR verbally called the tactic out, OR asked the neutralizing question that defuses it (e.g. asking for the APR defuses fee burial; "I'll call the number on my card" defuses authority impersonation).
- outcome "fell_for": the user complied with the beat's ask (agreed, accepted the framing, followed the instruction).
- outcome "resisted": didn't bite, but didn't name it either.
- messageIndex = the [n] index of the ADVERSARY message where the tactic attempt landed.
- evidenceQuote = a short exact quote from that adversary message.
- explanation = one sentence, addressed to the user as "you".

TRANSCRIPT:
${convo}

Return ONLY valid JSON, no code fences, exactly this shape:
{"findings":[{"tacticId":"...","messageIndex":0,"outcome":"caught|resisted|fell_for","evidenceQuote":"...","explanation":"..."}]}`;
}

function parseFindings(raw: string): Finding[] {
  const cleaned = raw
    .replace(/^```(json)?/m, "")
    .replace(/```\s*$/m, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed.findings)) throw new Error("no findings array");
  return parsed.findings;
}

async function llmReferee(
  playbook: Playbook,
  transcript: TranscriptEntry[],
  flags: FlagInput[],
  decision: string
): Promise<Finding[]> {
  const prompt = refereePrompt(playbook, transcript, flags, decision);
  const ask = async (extra?: string) => {
    const res = await anthropic.messages.create({
      model: REFEREE_MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: extra ? `${prompt}\n\n${extra}` : prompt }],
    });
    const block = res.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text : "";
  };

  try {
    return parseFindings(await ask());
  } catch {
    // One retry with an explicit instruction, per spec.
    return parseFindings(await ask("Your previous output was not valid JSON. Return only valid JSON."));
  }
}

/* ------------------------------------------------------------------ */
/* Offline deterministic referee                                       */
/* ------------------------------------------------------------------ */

/** Keyword evidence that a user "verbally caught" a tactic. */
const CATCH_PATTERNS: Record<string, RegExp> = {
  fee_burial: /\b(apr|annual|interest rate|percent|%|total.*(repay|pay ?back|owe)|every (fee|dollar|cost)|all (the )?fees|amenity)\b/i,
  urgency: /\b(deadline|rush|pressur|today only|why (now|the hurry)|take my time|not deciding today|slow down|wait (for|until|till).{0,24}clear|(fully|actually) clears?|10 (business )?days)\b/i,
  scarcity: /\b(other applicants?|other applications?|prove|verify|who else|if it'?s gone)\b/i,
  authority: /\b(call (the|my) bank|number on (my|the) card|verify you|badge|prove you|call back|not who you say|registered (business|address)|look (you|it|the company) up|main line|verify (the |this )?(company|job|role))\b/i,
  anchoring: /\b(don'?t need (six|the) hundred|just (the )?(four hundred|400)|no upsell|smaller amount|compare|credit union)\b/i,
  isolation: /\b(hang(ing)? up|tell (my|someone)|talk to (my|someone)|why can'?t i call|don'?t tell anyone|branch|teller|tell (the )?bank|mom|dad|parents?|counselor)\b/i,
  normalizing: /\b(standard (doesn'?t|isn'?t)|not normal|roll ?over.*(cost|trap|fee)|principal|still owe|clause 9|auto.?renew)\b/i,
  sunk_cost: /\b(sunk cost|doesn'?t matter (what|how much)|already (spent|invested).*(gone|irrelevant)|start over)\b/i,
  reciprocity: /\b(waiv|favor|discount.*(bad deal|still)|didn'?t ask (you )?for|no such thing as free|before i('ve)? (even )?(work|start)|pay me up ?front|why.{0,16}up ?front)\b/i,
  flooding: /\b(one sentence|plain english|explain (that|this|it)|slow(er)?|too (much|many)|clause 17|repairs?|read (it|this|the lease)|(my|personal) (own )?(bank )?account|through me|buy it (yourself|directly)|company (buy|pay)s?)\b/i,
};

function offlineReferee(
  playbook: Playbook,
  transcript: TranscriptEntry[],
  flags: FlagInput[],
  decision: string
): Finding[] {
  const userText = transcript.filter((m) => m.role === "user").map((m) => m.content).join(" \n ");
  const flaggedTactics = new Set(flags.map((f) => f.tacticId));
  const walked = decision === "walk";

  return playbook.beats.map((b, i) => {
    // Anchor the finding to the i-th adversary message (the scripted
    // adversary delivers beats in order), falling back to the last one.
    const advMsgs = transcript.filter((m) => m.role === "adversary");
    const anchor = advMsgs[Math.min(i, advMsgs.length - 1)];
    const caught =
      flaggedTactics.has(b.tactic) || (CATCH_PATTERNS[b.tactic]?.test(userText) ?? false);
    const outcome: Finding["outcome"] = caught ? "caught" : walked ? "resisted" : "fell_for";
    return {
      tacticId: b.tactic,
      messageIndex: anchor?.turnIndex ?? 0,
      outcome,
      evidenceQuote: (anchor?.content ?? "").slice(0, 140),
      explanation: caught
        ? `You named this move (or asked the question that defuses it) — that's a catch.`
        : walked
          ? `You didn't take the bait, but you never called it out either.`
          : `You went along with this one — it's the beat that did the damage.`,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function refereeRound(
  playbook: Playbook,
  transcript: TranscriptEntry[],
  flags: FlagInput[],
  decision: string
): Promise<{ findings: Finding[]; engine: "llm" | "scripted" }> {
  if (hasApiKey()) {
    try {
      const findings = await llmReferee(playbook, transcript, flags, decision);
      return { findings, engine: "llm" };
    } catch (err) {
      console.error("[referee] LLM grading failed, using offline grader:", err);
    }
  }
  return { findings: offlineReferee(playbook, transcript, flags, decision), engine: "scripted" };
}
