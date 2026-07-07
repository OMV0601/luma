/**
 * Fraud-call damage model — deterministic, no AI.
 * The scene states a $4,800 checking balance. Authorized transfers to a
 * scammer's "safe account" are typically unrecoverable (FTC).
 */
import type { DamageResult } from "../types.ts";

export const FRAUDCALL = {
  balance: 4800,
};

export function fraudcallDamage(decision: string): DamageResult {
  const B = FRAUDCALL.balance;
  switch (decision) {
    case "take": // "Transfer the money"
      return {
        damageDollars: B,
        breakdown: [
          {
            label: "Wired to the 'secure holding account'",
            amount: B,
            note: "the account is the caller's — wire and crypto transfers are typically unrecoverable (FTC)",
            buried: true,
          },
          {
            label: "Bank reimbursement",
            amount: 0,
            note: "you authorized the transfer yourself — banks usually decline to reimburse authorized push payments",
          },
        ],
        headline: `$${B.toLocaleString()} gone. You moved it yourself, which is exactly why the bank won't bring it back.`,
      };
    case "walk": // "Hang up and call the number on my card"
      return {
        damageDollars: -B,
        breakdown: [
          {
            label: "Checking balance kept",
            amount: B,
            note: "verified independently — called the number printed on the card, not the caller's number",
          },
        ],
        headline: `$${B.toLocaleString()} protected. Four minutes on hold with the real bank beats a lifetime of regret.`,
      };
    default:
      throw new Error(`fraudcall: unknown decision "${decision}"`);
  }
}
