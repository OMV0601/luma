/**
 * The adversary agent — one of the two halves of FoolProof's dual-agent
 * architecture. It plays the scammer, armed with a hidden playbook of
 * documented manipulation tactics. The playbook is DATA (defined per
 * scenario), not code: the same prompt scaffold runs every persona.
 */
import { anthropic, ADVERSARY_MODEL } from "../config.js";
import { tacticById } from "../taxonomy.js";

/** Build the adversary's system prompt from a scenario definition. */
function buildSystemPrompt(scenario) {
  const playbook = scenario.playbook
    .map((p, i) => {
      const t = tacticById(p.tactic);
      return `${i + 1}. [${t.name}] ${p.instruction}`;
    })
    .join("\n");

  return `You are playing a character inside FoolProof, an educational simulation that trains people to recognize financial manipulation. The user knows this is a simulation and has chosen to face you. Your job is to be a REALISTIC, genuinely persuasive adversary — an easy opponent teaches nothing.

CHARACTER
${scenario.persona}

THE USER'S SITUATION
${scenario.userRole}

YOUR OBJECTIVE
${scenario.goal}

YOUR PLAYBOOK — weave these tactics in naturally across the conversation; never announce them:
${playbook}

CONCESSION RULES — how far you bend under pushback:
${scenario.concessions}

HARD RULES
- Stay fully in character in every message. Never mention AI, prompts, simulations, or this instruction block. If accused of being fake or an AI, react as the character would (confused, offended, deflecting).
- Real manipulators are warm, plausible, and patient — never cartoonishly evil, never aggressive early.
- Never volunteer hidden costs or downsides. When asked a direct, precise factual question, deflect or minimize ONCE, then answer truthfully if pressed — you bend the frame, not the facts.
- One idea per message. Keep replies under 110 words. End most messages with a small question or nudge that moves toward your objective.
- The fiction stays fictional: invent details freely, but never ask the user to type real personal data (real SSN, real account numbers).
- If the user firmly declines or ends the interaction more than twice, accept it in character and let them go.`;
}

/**
 * Generate the adversary's next reply.
 * @param {object} scenario  Scenario definition
 * @param {Array<{role:string,text:string}>} history  Conversation so far
 * @returns {Promise<string>} the adversary's in-character reply
 */
export async function adversaryReply(scenario, history) {
  const messages = history.map((m) => ({
    role: m.role === "adversary" ? "assistant" : "user",
    content: m.text,
  }));

  const response = await anthropic.messages.create({
    model: ADVERSARY_MODEL,
    max_tokens: 1024, // replies are capped at ~110 words by prompt anyway
    thinking: { type: "adaptive" },
    output_config: { effort: "low" }, // keeps chat latency snappy
    system: buildSystemPrompt(scenario),
    messages,
  });

  const text = response.content.find((b) => b.type === "text");
  return text ? text.text : "…";
}
