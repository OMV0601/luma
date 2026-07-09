/**
 * Generic damage model — deterministic arithmetic over a damageSpec that a
 * Scam Factory-generated scenario carries in its playbook.
 *
 * The LLM proposes the spec ONCE at generation time (validated + rounded);
 * from then on every dollar figure is pure arithmetic on that frozen data —
 * same guarantee as the hand-written engines: the AI never invents a number
 * at grading time. Headlines use {total}/{paid}/{avoided} placeholders so
 * the prose can never contradict the math.
 */
import type { DamageResult } from "../types.ts";
import type { GenericDamageSpec } from "../types.ts";

function fill(template: string, vars: Record<string, number>): string {
  return template.replace(/\{(total|paid|avoided)\}/g, (_, k) =>
    `$${(vars[k] ?? 0).toLocaleString("en-US")}`
  );
}

export function genericDamage(
  spec: GenericDamageSpec | undefined,
  decision: string
): DamageResult {
  if (!spec || !Array.isArray(spec.rows) || spec.rows.length === 0) {
    throw new Error("generic: missing or empty damageSpec");
  }
  const total = spec.rows.reduce((s, r) => s + r.amount, 0);

  switch (decision) {
    case "take":
      return {
        damageDollars: total,
        breakdown: spec.rows.map(({ label, amount, note, buried }) => ({
          label,
          amount,
          note,
          buried,
        })),
        headline: fill(spec.headlines.take, { total }),
      };
    case "negotiated": {
      const kept = spec.rows.filter((r) => !r.negotiable);
      if (kept.length === spec.rows.length) {
        // validation prevents a "negotiated" decision existing without
        // negotiable rows — belt and suspenders.
        throw new Error("generic: negotiated decision with no negotiable rows");
      }
      const paid = kept.reduce((s, r) => s + r.amount, 0);
      return {
        damageDollars: paid,
        breakdown: kept.map(({ label, amount, note, buried }) => ({
          label,
          amount,
          note,
          buried,
        })),
        headline: fill(spec.headlines.negotiated ?? spec.headlines.take, {
          total,
          paid,
          avoided: total - paid,
        }),
      };
    }
    case "walk":
      return {
        damageDollars: -total,
        breakdown: spec.rows.map(({ label, amount, note, buried }) => ({
          label,
          amount,
          note: `avoided — ${note}`,
          buried,
        })),
        headline: fill(spec.headlines.walk, { total, avoided: total }),
      };
    default:
      throw new Error(`generic: unknown decision "${decision}"`);
  }
}
