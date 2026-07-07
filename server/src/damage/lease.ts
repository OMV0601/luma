/**
 * Lease damage model — deterministic, no AI.
 * 12-month term, $1,600 rent. Three planted clauses, each individually
 * priced; challenging a clause in-round removes its cost from "sign".
 */
import type { DamageResult, DamageBreakdownRow } from "../types.ts";

export const LEASE = {
  rent: 1600,
  clauses: [
    {
      id: "auto_renewal",
      label: "Auto-renewal penalty (clause 9)",
      cost: 1600,
      note: "auto-renews unless 90-day certified-mail notice — expected case: one month's rent charged at move-out",
    },
    {
      id: "amenity_fee",
      label: 'Non-refundable "amenity fee" (clause 14)',
      cost: 350,
      note: "due at signing, refundable never",
    },
    {
      id: "repairs",
      label: "Tenant pays all repairs under $500 (clause 17)",
      cost: 900,
      note: "$75/mo typical small-repair burden × 12 months",
    },
  ],
};

export const LEASE_TOTAL = LEASE.clauses.reduce((s, c) => s + c.cost, 0); // 2850

export function leaseDamage(
  decision: string,
  ctx: { challengedClauses?: string[] } = {}
): DamageResult {
  const challenged = new Set(ctx.challengedClauses ?? []);

  const rows = (filter: (challenged: boolean) => boolean): DamageBreakdownRow[] =>
    LEASE.clauses
      .filter((c) => filter(challenged.has(c.id)))
      .map((c) => ({ label: c.label, amount: c.cost, note: c.note, buried: true }));

  switch (decision) {
    case "take": {
      // "Sign as-is" — every clause bites.
      return {
        damageDollars: LEASE_TOTAL,
        breakdown: rows(() => true),
        headline: `Signed unread. The three clauses Marcus called "standard language" cost $${LEASE_TOTAL.toLocaleString()} over the term.`,
      };
    }
    case "negotiated": {
      const cost = LEASE.clauses
        .filter((c) => !challenged.has(c.id))
        .reduce((s, c) => s + c.cost, 0);
      const saved = LEASE_TOTAL - cost;
      return {
        damageDollars: cost,
        breakdown: [
          ...rows((isChallenged) => !isChallenged),
          ...LEASE.clauses
            .filter((c) => challenged.has(c.id))
            .map((c) => ({
              label: `${c.label} — STRUCK`,
              amount: 0,
              note: `challenged in the room: $${c.cost.toLocaleString()} removed`,
            })),
        ],
        headline:
          cost === 0
            ? `Every planted clause struck before signing. $${saved.toLocaleString()} protected with a pen.`
            : `You struck $${saved.toLocaleString()} of clauses — but the ones you missed still cost $${cost.toLocaleString()}.`,
      };
    }
    case "walk":
      return {
        damageDollars: -LEASE_TOTAL,
        breakdown: rows(() => true).map((r) => ({ ...r, note: `avoided — ${r.note}` })),
        headline: `You walked. A landlord who buries $${LEASE_TOTAL.toLocaleString()} in "standard language" will bury other things later.`,
      };
    default:
      throw new Error(`lease: unknown decision "${decision}"`);
  }
}
