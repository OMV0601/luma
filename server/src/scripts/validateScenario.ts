/**
 * Validation for Scam Factory-generated scenarios. Hand-rolled (no schema
 * dep) and collect-all-errors so a failed generation can be retried with
 * the complete error list appended to the prompt.
 *
 * The rules protect three hard invariants:
 * 1. The scripted-fallback state machine (adversary/scripted.ts) can walk
 *    the playbook — it dereferences fallback.beatLines unconditionally and
 *    compiles every trigger regex, so those must be complete and valid.
 * 2. The damage engine stays deterministic — integer dollar amounts within
 *    sane bounds (results.damage_dollars is an INTEGER column).
 * 3. The referee can grade — every beat tactic is one of the 10 real ids.
 */
import { TACTIC_IDS } from "../../../shared/tactics.ts";
import type { Beat, FallbackTree, GenericDamageSpec } from "../types.ts";

/** Shape the LLM must return (decisions are assembled by the CLI, not the LLM). */
export interface GeneratedScenario {
  title: string;
  adversaryName: string;
  avatar: string;
  difficulty: string;
  setup: string;
  persona: string;
  opening: string;
  beats: Beat[];
  escalation: string;
  guardrails: string[];
  neutralizingQuestions: string[];
  fallback: FallbackTree;
  damageSpec: GenericDamageSpec;
  decisionLabels: { take: string; negotiated?: string; walk: string };
}

type Result = { ok: true; value: GeneratedScenario } | { ok: false; errors: string[] };

const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

export function validateGenerated(raw: unknown): Result {
  const errors: string[] = [];
  const g = raw as Partial<GeneratedScenario>;
  const need = (cond: boolean, msg: string) => {
    if (!cond) errors.push(msg);
  };

  if (typeof raw !== "object" || raw === null) {
    return { ok: false, errors: ["output is not a JSON object"] };
  }

  /* ---- identity strings ---- */
  need(isStr(g.title) && g.title!.length <= 60, "title: required, ≤60 chars");
  need(isStr(g.adversaryName) && g.adversaryName!.length <= 40, "adversaryName: required, ≤40 chars");
  need(isStr(g.avatar) && g.avatar!.length <= 8 && !/\s/.test(g.avatar!), "avatar: required, a single emoji");
  need(isStr(g.difficulty) && g.difficulty!.length <= 30, "difficulty: required, ≤30 chars (uppercase stamp)");
  need(isStr(g.setup) && g.setup!.length <= 400, "setup: required, ≤400 chars");
  need(isStr(g.persona) && g.persona!.length >= 300 && g.persona!.length <= 1800, "persona: required, 300–1800 chars");
  need(isStr(g.opening), "opening: required");
  need(isStr(g.escalation), "escalation: required");
  need(Array.isArray(g.guardrails) && g.guardrails.length >= 2 && g.guardrails.every(isStr), "guardrails: ≥2 non-empty strings");
  need(
    Array.isArray(g.neutralizingQuestions) && g.neutralizingQuestions.length === 3 && g.neutralizingQuestions.every(isStr),
    "neutralizingQuestions: exactly 3 non-empty strings"
  );

  /* ---- beats ---- */
  const beats = Array.isArray(g.beats) ? g.beats : [];
  need(beats.length === 5, "beats: exactly 5 required");
  beats.forEach((b, i) => {
    need(b?.id === `b${i + 1}`, `beats[${i}].id: must be "b${i + 1}" (in order)`);
    need(isStr(b?.tactic) && TACTIC_IDS.includes(b.tactic), `beats[${i}].tactic: must be one of ${TACTIC_IDS.join(", ")}`);
    need(isStr(b?.goal), `beats[${i}].goal: required`);
    need(isStr(b?.sampleLine), `beats[${i}].sampleLine: required`);
    if (b?.concession !== undefined) {
      need(isStr(b.concession?.trigger) && isStr(b.concession?.mustAdmit), `beats[${i}].concession: trigger and mustAdmit both required`);
    }
  });
  need(beats.some((b) => b?.concession), "beats: at least one beat needs a concession (accurate numbers the character admits when cornered)");

  /* ---- fallback tree (scripted.ts dereferences all of this) ---- */
  const fb = g.fallback as FallbackTree | undefined;
  if (!fb || typeof fb !== "object") {
    errors.push("fallback: required object");
  } else {
    for (const b of beats) {
      if (!b?.id) continue;
      const lines = fb.beatLines?.[b.id];
      need(Array.isArray(lines) && lines.length >= 2 && lines.every(isStr), `fallback.beatLines.${b.id}: ≥2 non-empty lines`);
    }
    const triggers = Array.isArray(fb.triggers) ? fb.triggers : [];
    need(triggers.length >= 3 && triggers.length <= 8, "fallback.triggers: 3–8 required");
    triggers.forEach((t, i) => {
      need(isStr(t?.reply), `fallback.triggers[${i}].reply: required`);
      if (isStr(t?.match)) {
        try {
          new RegExp(t.match, "i");
        } catch {
          errors.push(`fallback.triggers[${i}].match: invalid regex "${t.match}"`);
        }
      } else {
        errors.push(`fallback.triggers[${i}].match: required regex source string`);
      }
    });
    need(Array.isArray(fb.nudges) && fb.nudges.length >= 2 && fb.nudges.every(isStr), "fallback.nudges: ≥2 non-empty strings");
    need(Array.isArray(fb.leave) && fb.leave.length === 2 && fb.leave.every(isStr), "fallback.leave: exactly 2 strings (final push, acceptance)");
    need(Array.isArray(fb.filler) && fb.filler.length >= 2 && fb.filler.every(isStr), "fallback.filler: ≥2 non-empty strings");
  }

  /* ---- damage spec (deterministic money math) ---- */
  const spec = g.damageSpec as GenericDamageSpec | undefined;
  if (!spec || typeof spec !== "object") {
    errors.push("damageSpec: required object");
  } else {
    const rows = Array.isArray(spec.rows) ? spec.rows : [];
    need(rows.length >= 2 && rows.length <= 6, "damageSpec.rows: 2–6 required");
    rows.forEach((r, i) => {
      need(isStr(r?.label), `damageSpec.rows[${i}].label: required`);
      need(isStr(r?.note), `damageSpec.rows[${i}].note: required`);
      const ok = typeof r?.amount === "number" && Number.isFinite(r.amount) && r.amount > 0 && r.amount <= 100_000;
      need(ok, `damageSpec.rows[${i}].amount: finite number, 0 < x ≤ 100000`);
      if (ok) r.amount = Math.round(r.amount); // INTEGER column
    });
    need(isStr(spec.headlines?.take) && isStr(spec.headlines?.walk), "damageSpec.headlines: take and walk required");
    const hasNegotiable = rows.some((r) => r?.negotiable);
    const hasNegotiatedLabel = isStr(g.decisionLabels?.negotiated);
    need(
      hasNegotiable === hasNegotiatedLabel,
      "negotiated: decisionLabels.negotiated and ≥1 negotiable row must appear together (or neither)"
    );
    if (hasNegotiable) need(isStr(spec.headlines?.negotiated), "damageSpec.headlines.negotiated: required when negotiable rows exist");
  }

  /* ---- decision labels ---- */
  need(isStr(g.decisionLabels?.take) && isStr(g.decisionLabels?.walk), "decisionLabels: take and walk labels required");

  return errors.length ? { ok: false, errors } : { ok: true, value: g as GeneratedScenario };
}
