/**
 * Scripted adversary — the no-API-key fallback. A deterministic state
 * machine that walks the same playbook with pre-written lines and
 * keyword-triggered branches (cost/APR questions, pushback, agreement,
 * silence, leaving). Same interface as the LLM path, so the entire demo
 * loop works offline.
 */
import type { Playbook } from "../types.ts";

export interface ScriptedState {
  beat: number; // index into playbook.beats
  lineUsed: Record<string, number>; // beatId -> lines consumed
  fired: string[]; // once-triggers already fired (by match source)
  leaveStage: number; // 0 = not tried to leave, 1 = final attempt made
  nudgeIdx: number;
  fillerIdx: number;
}

export const freshScriptedState = (): ScriptedState => ({
  beat: 0,
  lineUsed: {},
  fired: [],
  leaveStage: 0,
  nudgeIdx: 0,
  fillerIdx: 0,
});

const LEAVE_RE =
  /\b(walk(ing)? away|leav(e|ing)|i'?m (out|done|gone)|goodbye|bye|hang(ing)? up|no thanks?,? (i'?m|bye)|not interested,? (bye|goodbye)|forget it)\b/i;
const PUSHBACK_RE =
  /\b(no\b|not interested|too (expensive|much|high)|that'?s (a lot|crazy|insane|ridiculous)|i don'?t (want|like|trust)|stop|slow down|back off|pressur)/i;
const AGREE_RE =
  /\b(ok(ay)?\b|sure|sounds good|fine,? (let'?s|i'?ll)|deal\b|where do i sign|let'?s do it|yes\b|yeah\b|alright)\b/i;

export interface ScriptedReply {
  text: string;
  state: ScriptedState;
}

export function scriptedReply(
  playbook: Playbook,
  prevState: ScriptedState | null,
  userText: string
): ScriptedReply {
  const state: ScriptedState = prevState
    ? { ...prevState, lineUsed: { ...prevState.lineUsed }, fired: [...prevState.fired] }
    : freshScriptedState();
  const fb = playbook.fallback;
  const beats = playbook.beats;
  const text = userText.trim();

  const advance = () => {
    if (state.beat < beats.length - 1) state.beat += 1;
  };

  const nextBeatLine = (): string => {
    // Walk beats: deliver each beat's lines in order, advancing when a
    // beat's lines are exhausted; filler once everything has been said.
    for (let hops = 0; hops < beats.length; hops++) {
      const beatId = beats[state.beat].id;
      const lines = fb.beatLines[beatId] ?? [];
      const used = state.lineUsed[beatId] ?? 0;
      if (used < lines.length) {
        state.lineUsed[beatId] = used + 1;
        // Last line of the beat delivered -> the beat is made; move on.
        if (used + 1 >= lines.length) advance();
        return lines[used];
      }
      if (state.beat >= beats.length - 1) break;
      advance();
    }
    const filler = fb.filler[state.fillerIdx % fb.filler.length];
    state.fillerIdx += 1;
    return filler;
  };

  // 1) Trying to leave: one final attempt, then graceful acceptance.
  if (LEAVE_RE.test(text)) {
    const line = fb.leave[Math.min(state.leaveStage, 1)];
    state.leaveStage = Math.min(state.leaveStage + 1, 1);
    return { text: line, state };
  }

  // 2) Keyword triggers (cost/APR, clause challenges, accusations...).
  for (const t of fb.triggers) {
    if (t.once && state.fired.includes(t.match)) continue;
    if (new RegExp(t.match, "i").test(text)) {
      if (t.once) state.fired.push(t.match);
      if (t.advance) advance();
      return { text: t.reply, state };
    }
  }

  // 3) Silence / one-word replies get a nudge.
  if (text.length < 4) {
    const line = fb.nudges[state.nudgeIdx % fb.nudges.length];
    state.nudgeIdx += 1;
    return { text: line, state };
  }

  // 4) Generic pushback: concede the current beat and move to the next.
  if (PUSHBACK_RE.test(text)) {
    const beatId = beats[state.beat].id;
    state.lineUsed[beatId] = (fb.beatLines[beatId] ?? []).length; // spend it
    advance();
    return { text: nextBeatLine(), state };
  }

  // 5) Agreement keeps the script moving toward the close.
  if (AGREE_RE.test(text)) {
    return { text: nextBeatLine(), state };
  }

  // 6) Default: next line on the main path.
  return { text: nextBeatLine(), state };
}

/** True once the state machine has delivered every beat's material. */
export function scriptedBeatsComplete(playbook: Playbook, state: ScriptedState): boolean {
  return playbook.beats.every(
    (b) => (state.lineUsed[b.id] ?? 0) >= (playbook.fallback.beatLines[b.id] ?? []).length
  );
}
