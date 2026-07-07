/**
 * Fake-check overpayment damage model — deterministic, no AI.
 * The classic student "dream job" scam: a counterfeit check for more than
 * you're owed, keep-your-cut framing, and the ask to forward the rest to a
 * "vendor". Reg CC makes deposited funds *provisionally* available in 1–2
 * days, but a counterfeit can take a week-plus to bounce — the scam lives
 * entirely inside that gap. When it bounces, the bank reverses the whole
 * provisional credit; the money you forwarded was real and is gone.
 */
import type { DamageResult, DamageBreakdownRow } from "../types.ts";

export const INTERNSHIP = {
  checkAmount: 2480, // the "equipment + first week" check
  keepAmount: 350, // "your first week's pay, up front"
  vendorPayment: 2130, // the real money forwarded to the "vendor"
  returnedCheckFee: 35, // your bank's returned-item fee
  bounceDay: 7, // when the counterfeit finally comes back
};

export function internshipDamage(decision: string): DamageResult {
  const { checkAmount, keepAmount, vendorPayment, returnedCheckFee, bounceDay } = INTERNSHIP;
  const totalLoss = vendorPayment + returnedCheckFee;

  const takeRows: DamageBreakdownRow[] = [
    {
      label: `Zelle to "TechSource Solutions" (day 2)`,
      amount: vendorPayment,
      note: "real money, gone — Zelle has no clawback for payments you authorize",
    },
    {
      label: `The check bounces (day ${bounceDay})`,
      amount: 0,
      note: `counterfeit — the bank reverses the full $${checkAmount.toLocaleString()} provisional credit`,
      buried: true,
    },
    {
      label: `Your $${keepAmount} "first week's pay"`,
      amount: 0,
      note: "clawed back with the reversal — it was your own provisional money all along",
      buried: true,
    },
    {
      label: "Returned-item fee",
      amount: returnedCheckFee,
      note: "your bank charges YOU for depositing a bad check",
      buried: true,
    },
  ];

  switch (decision) {
    case "take":
      return {
        damageDollars: totalLoss,
        breakdown: takeRows,
        headline: `The check was rubber. Day ${bounceDay} it bounced — the bank took back all $${checkAmount.toLocaleString()}, the $${vendorPayment.toLocaleString()} you sent is unrecoverable, and the "job" stopped answering.`,
      };
    case "negotiated":
      return {
        damageDollars: returnedCheckFee,
        breakdown: [
          {
            label: `Returned-item fee (day ${bounceDay})`,
            amount: returnedCheckFee,
            note: "the check bounced — but you hadn't sent a dollar",
          },
        ],
        headline: `You waited for the check to actually clear. It never did. A $${returnedCheckFee} fee, a story for the group chat — and $${vendorPayment.toLocaleString()} still in your account.`,
      };
    case "walk":
      return {
        damageDollars: -totalLoss,
        breakdown: takeRows.map((r) => ({ ...r, note: `avoided — ${r.note}` })),
        headline: `You blocked it. The "equipment vendor" was the cash-out — $${vendorPayment.toLocaleString()} of real money you never sent.`,
      };
    default:
      throw new Error(`internship: unknown decision "${decision}"`);
  }
}
