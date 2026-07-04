/**
 * Deterministic financial math. No AI anywhere in this file — every dollar
 * figure shown in a debrief is computed here with standard formulas, so the
 * numbers are auditable and repeatable.
 */

/**
 * Effective APR of a fixed-fee short-term loan (the standard payday formula
 * used by the CFPB): (fee / principal) * (365 / termDays) * 100.
 * e.g. $60 fee on $400 for 14 days -> 391.07%.
 */
export function effectiveAPR(fee, principal, termDays) {
  return (fee / principal) * (365 / termDays) * 100;
}

/**
 * Total fees paid across a payday rollover cycle: the original fee plus one
 * full fee per renewal. Rolling over never touches the principal, which is
 * exactly why the cycle is profitable.
 */
export function rolloverFees(feePerTerm, rollovers) {
  return feePerTerm * (1 + rollovers);
}

/**
 * Standard amortization of an installment loan. Used to show what a fair
 * alternative (e.g. a credit-union Payday Alternative Loan at 28-36% APR)
 * would cost on the same principal.
 * Returns { payment, totalPaid, totalInterest } rounded to cents.
 */
export function amortize(principal, annualRatePct, months) {
  const r = annualRatePct / 100 / 12; // monthly rate
  const payment =
    r === 0
      ? principal / months
      : (principal * r) / (1 - Math.pow(1 + r, -months));
  const totalPaid = payment * months;
  return {
    payment: round2(payment),
    totalPaid: round2(totalPaid),
    totalInterest: round2(totalPaid - principal),
  };
}

/** Cost of a recurring monthly fee over a number of months. */
export function recurringCost(monthlyFee, months) {
  return monthlyFee * months;
}

/** Extra rent paid over 12 months after a percentage increase. */
export function renewalIncreaseCost(monthlyRent, increasePct) {
  return round2(monthlyRent * (increasePct / 100) * 12);
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}

/** Format a number as US dollars for prompt/debrief text. */
export function usd(n) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
