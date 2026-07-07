/**
 * Payday damage model — deterministic, no AI.
 * $15 per $100 per 14-day term. "Take" models the CFPB-typical path of
 * 4 rollovers (5 fee terms total): the fee repeats, the principal never
 * shrinks. That repetition IS the product.
 */
import type { DamageResult, DamageBreakdownRow } from "../types.ts";

export const PAYDAY = {
  principal: 400,
  upsoldPrincipal: 600,
  feePer100: 15,
  termDays: 14,
  rollovers: 4, // typical path -> 5 fee terms total
};

export function paydayAPR(principal: number): number {
  const fee = (principal / 100) * PAYDAY.feePer100;
  return (fee / principal) * (365 / PAYDAY.termDays) * 100; // ≈ 391.07
}

export function paydayDamage(
  decision: string,
  ctx: { upsold?: boolean } = {}
): DamageResult {
  const P = ctx.upsold ? PAYDAY.upsoldPrincipal : PAYDAY.principal;
  const feePerTerm = (P / 100) * PAYDAY.feePer100;
  const terms = PAYDAY.rollovers + 1;
  const typicalFees = feePerTerm * terms;
  const apr = Math.round(paydayAPR(P) * 10) / 10;

  const perTermRows: DamageBreakdownRow[] = Array.from({ length: terms }, (_, i) => ({
    label: i === 0 ? `Term 1 fee (day 14)` : `Rollover ${i} fee (day ${(i + 1) * 14})`,
    amount: feePerTerm,
    note: i === 0 ? `$${PAYDAY.feePer100} per $100 on $${P}` : `principal still $${P} — untouched`,
    buried: i > 0, // the rollovers are the buried part of the deal
  }));

  switch (decision) {
    case "take":
      return {
        damageDollars: typicalFees,
        breakdown: [
          ...perTermRows,
          {
            label: "Effective APR",
            amount: 0,
            note: `${apr}% — the number "$${PAYDAY.feePer100} per $100" is built to hide`,
            buried: true,
          },
        ],
        headline: `The typical borrower rolls this loan ${PAYDAY.rollovers} times. You'd pay $${typicalFees} in fees and still owe the $${P}.`,
      };
    case "negotiated":
      return {
        damageDollars: feePerTerm,
        breakdown: [
          {
            label: "Term 1 fee — paid off in one term, no rollovers",
            amount: feePerTerm,
            note: `you dodged the rollover cycle ($${typicalFees - feePerTerm} of typical fees)`,
          },
        ],
        headline: `One term, one fee: $${feePerTerm}. Expensive — but you refused the cycle that costs the typical borrower $${typicalFees}.`,
      };
    case "walk":
      return {
        damageDollars: -typicalFees,
        breakdown: perTermRows.map((r) => ({ ...r, note: `avoided — ${r.note}` })),
        headline: `You walked. The typical path you avoided: $${typicalFees} in fees at ${apr}% APR.`,
      };
    default:
      throw new Error(`payday: unknown decision "${decision}"`);
  }
}
