/**
 * Notario damage model — deterministic, no AI.
 *
 * Immigration-services fraud is priced by the contract, not the conversation:
 * three paragraphs in a "services agreement" carry the whole loss. Challenging
 * a paragraph in-round removes its cost, exactly like the lease model — the
 * point being that reading the document IS the defense.
 */
import type { DamageResult, DamageBreakdownRow } from "../types.ts";

export const NOTARIO = {
  clauses: [
    {
      id: "nonrefundable",
      label: 'Non-refundable "preparation fee" (¶4)',
      cost: 1500,
      note: "earned on receipt — you owe it even if the filing is denied, or if he quits",
    },
    {
      id: "mail_redirect",
      label: 'Unverifiable "filing fees" (¶6)',
      cost: 1200,
      note: "USCIS mail goes to his office and you waive copies — so you can never check that Form I-589 carries no filing fee at all",
    },
    {
      id: "not_attorney",
      label: "Remediation by a real attorney (¶9)",
      cost: 4500,
      note: "the same paragraph that admits he is not an attorney lets him choose your forms — what it costs to undo that, and a knowingly frivolous claim can bar relief for life",
    },
  ],
};

export const NOTARIO_TOTAL = NOTARIO.clauses.reduce((s, c) => s + c.cost, 0); // 7200

export function notarioDamage(
  decision: string,
  ctx: { challengedClauses?: string[] } = {}
): DamageResult {
  const challenged = new Set(ctx.challengedClauses ?? []);
  const rows = (keep: (isChallenged: boolean) => boolean): DamageBreakdownRow[] =>
    NOTARIO.clauses
      .filter((c) => keep(challenged.has(c.id)))
      .map((c) => ({ label: c.label, amount: c.cost, note: c.note, buried: true }));

  switch (decision) {
    case "take":
      return {
        damageDollars: NOTARIO_TOTAL,
        breakdown: rows(() => true),
        headline: `You paid a man who is not a lawyer $${NOTARIO_TOTAL.toLocaleString()} — and the asylum claim he signed in your name put you in front of an immigration judge.`,
      };
    case "negotiated": {
      const cost = NOTARIO.clauses
        .filter((c) => !challenged.has(c.id))
        .reduce((s, c) => s + c.cost, 0);
      const saved = NOTARIO_TOTAL - cost;
      return {
        damageDollars: cost,
        breakdown: [
          ...rows((isChallenged) => !isChallenged),
          ...NOTARIO.clauses
            .filter((c) => challenged.has(c.id))
            .map((c) => ({
              label: `${c.label} — STRUCK`,
              amount: 0,
              note: `you challenged it on the record: $${c.cost.toLocaleString()} removed`,
            })),
        ],
        headline:
          cost === 0
            ? `You made him put every paragraph in writing, and struck the three that mattered. $${saved.toLocaleString()} protected with a pen.`
            : `You struck $${saved.toLocaleString()} of the agreement — but the paragraphs you left standing still cost $${cost.toLocaleString()}.`,
      };
    }
    case "walk":
      return {
        damageDollars: -NOTARIO_TOTAL,
        breakdown: rows(() => true).map((r) => ({ ...r, note: `avoided — ${r.note}` })),
        headline: `You walked out and found an accredited representative. Typical path avoided: $${NOTARIO_TOTAL.toLocaleString()} — and a filing that can follow you for the rest of your life.`,
      };
    default:
      throw new Error(`notario: unknown decision "${decision}"`);
  }
}
