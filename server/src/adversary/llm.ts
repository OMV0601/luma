/**
 * Live adversary: Anthropic Messages API with streaming. Emits text chunks
 * as they arrive while withholding the trailing [[beat:bN]] marker, which
 * is parsed server-side to advance the playbook beat.
 */
import Anthropic from "@anthropic-ai/sdk";
import { buildAdversaryPrompt } from "./prompt.ts";
import type { Playbook } from "../types.ts";

export const anthropic = new Anthropic();
export const ADVERSARY_MODEL = process.env.ADVERSARY_MODEL || "claude-sonnet-4-6";
export const hasApiKey = () => Boolean(process.env.ANTHROPIC_API_KEY);

const MARKER_RE = /\[\[beat:(b\d+)\]\]/;

export interface AdversaryResult {
  text: string; // marker stripped
  beatId: string | null; // from the marker, if present
}

/**
 * Stream the adversary's reply. `onDelta` receives user-visible text only —
 * a small tail is withheld until we're sure it isn't the beat marker.
 */
export async function streamLlmReply(
  persona: string,
  playbook: Playbook,
  currentBeat: number,
  history: { role: "adversary" | "user"; content: string }[],
  onDelta: (text: string) => void
): Promise<AdversaryResult> {
  const stream = anthropic.messages.stream({
    model: ADVERSARY_MODEL,
    max_tokens: 1024,
    thinking: { type: "disabled" }, // fast first token — this is live chat
    system: buildAdversaryPrompt(persona, playbook, currentBeat),
    messages: history.map((m) => ({
      role: m.role === "adversary" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    })),
  });

  let emitted = ""; // what the client has seen
  let full = ""; // everything received

  const flushSafe = () => {
    // Emit everything except a held-back tail that could be the start of
    // the marker. "[[beat:bNN]]" is ≤ 14 chars; hold 14, or from the first
    // "[[" if one is pending.
    const pendingStart = full.indexOf("[[", emitted.length);
    const safeEnd =
      pendingStart >= 0
        ? pendingStart
        : Math.max(emitted.length, full.length - 14);
    if (safeEnd > emitted.length) {
      onDelta(full.slice(emitted.length, safeEnd));
      emitted = full.slice(0, safeEnd);
    }
  };

  stream.on("text", (delta) => {
    full += delta;
    flushSafe();
  });

  await stream.finalMessage();

  // Parse + strip the marker, then flush whatever legitimate text remains.
  const match = full.match(MARKER_RE);
  const clean = full.replace(MARKER_RE, "").trimEnd();
  if (clean.length > emitted.length) onDelta(clean.slice(emitted.length));

  return { text: clean, beatId: match ? match[1] : null };
}
