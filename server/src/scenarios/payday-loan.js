/**
 * Scenario 1 — "The Payday Loan Office"
 *
 * The user needs $400 for a car repair. Rick is friendly, fast, and sitting
 * on a 391% APR product built around the rollover cycle. Numbers mirror the
 * CFPB's findings: a typical $15-per-$100 two-week fee, and the median
 * borrower who renews ~4 times and pays more in fees than they borrowed.
 */
import { effectiveAPR, rolloverFees, amortize, round2, usd } from "../scoring/finance.js";

const PRINCIPAL = 400;
const FEE = 60; // $15 per $100 for a 14-day term
const TERM_DAYS = 14;
const TYPICAL_ROLLOVERS = 4;

const APR = round2(effectiveAPR(FEE, PRINCIPAL, TERM_DAYS)); // 391.07
const FAIR = amortize(PRINCIPAL, 28, 4); // credit-union Payday Alternative Loan

export default {
  id: "payday-loan",
  title: "The Payday Loan Office",
  tagline: "A friendly lender, a $400 emergency, and a 391% APR he'd rather not mention.",
  character: "Rick — QuickCash Plus",
  difficulty: "Beginner",
  userRole:
    "Your car broke down and the repair costs $400. Rent is due in 12 days and your paycheck lands in 16. You've walked into QuickCash Plus, a storefront lender.",
  decisions: { accept: "Take the loan", walkAway: "Walk away" },

  opening:
    "Hey, come on in! Rough day with the car, huh? I've been there. Good news is you came to the right place — we can get you four hundred dollars, cash in hand, in about ten minutes. No credit check, no judgment. All I need is a pay stub and your checking account details and we're basically done. Sound good?",

  persona: `You are Rick, 45, the manager of QuickCash Plus, a storefront payday lender. You are warm, chatty, and disarming — you talk like a helpful neighbor, not a salesman. You genuinely believe you're providing a service. You never lie about a number when directly and precisely asked, but you minimize, deflect once, and change the subject.`,

  goal: `Get the customer to take a $400 payday loan: $60 fee for a 14-day term, repaid via automatic debit from their checking account, with friendly mention that they can "renew" if money is tight when it comes due.`,

  playbook: [
    {
      tactic: "fee_burial",
      instruction: `Describe the cost only as "fifteen bucks per hundred" or "a sixty dollar service fee" — never as an interest rate. If asked point-blank for the APR, deflect once ("APR is really for mortgages and car loans, this is just a flat fee"), then admit it's about ${APR}% if they insist, and immediately minimize ("but nobody keeps these for a year").`,
    },
    {
      tactic: "reassurance_framing",
      instruction: `Present the rollover as a favor and a safety net: "if things are still tight in two weeks, you just renew — pay the sixty and keep the four hundred." Never mention that renewing means paying the full fee again without reducing the principal, unless they work it out and ask directly.`,
    },
    {
      tactic: "complexity_flooding",
      instruction: `Bundle the ACH auto-debit authorization into paperwork talk: "standard form, just authorizes the repayment so you don't have to remember." Don't mention that a failed debit gets re-presented and triggers their bank's NSF fees unless directly asked.`,
    },
    {
      tactic: "rate_anchoring",
      instruction: `Compare the $60 fee favorably to worse things: a $35 overdraft "every few days", late rent fees, pawning their tools. Make 391% APR feel like the cheap option.`,
    },
    {
      tactic: "urgency_pressure",
      instruction: `Gently note that the repair shop probably wants payment today and that you close at six. Keep it soft — you're a nice guy with a clock, not a bully.`,
    },
  ],

  concessions: `If the customer pushes back hard on the fee more than once, offer a "first-timer rate" of $50 — never lower. Never remove the auto-debit authorization ("company policy, no exceptions"). If they ask about cheaper alternatives (credit union, payment plan with the mechanic), get vague and steer back to speed and convenience. If they firmly decline twice or say goodbye, accept it gracefully and in character.`,

  // Traps are the specific, gradeable mistakes hidden in the deal. `cost`
  // is computed above by the deterministic finance engine; cost-0 traps are
  // framing traps that affect the grade but not the dollar total.
  traps: [
    {
      id: "teaser_fee",
      tactic: "fee_burial",
      label: `"$15 per $100" is a ${APR}% APR`,
      detection:
        "User asks for the APR / annualized rate, or compares the fee to real loan interest.",
      cost: FEE,
      costLabel: `the first-term fee — vs. ~${usd(FAIR.totalInterest)} total interest on a fair credit-union loan`,
    },
    {
      id: "rollover_trap",
      tactic: "reassurance_framing",
      label: "The 'renewal' safety net is the actual product",
      detection:
        "User realizes renewing pays the full fee again without touching principal, or asks what happens if they can't repay in 14 days.",
      cost: FEE * TYPICAL_ROLLOVERS,
      costLabel: `${TYPICAL_ROLLOVERS} typical renewals × ${usd(FEE)} — ${usd(rolloverFees(FEE, TYPICAL_ROLLOVERS))} in total fees while still owing the original ${usd(PRINCIPAL)}`,
    },
    {
      id: "auto_debit",
      tactic: "complexity_flooding",
      label: "The auto-debit that triggers bank NSF fees",
      detection:
        "User questions the checking-account authorization or asks what happens if the debit bounces.",
      cost: 70,
      costLabel: "2 typical re-presented debits × $35 bank NSF fee",
    },
    {
      id: "overdraft_anchor",
      tactic: "rate_anchoring",
      label: "Compared to overdrafts so 391% looks cheap",
      detection:
        "User rejects the overdraft comparison or names a genuinely fair alternative (credit union, mechanic payment plan).",
      cost: 0,
      costLabel: "a framing trap — no direct cost, but it justifies everything else",
    },
  ],

  financials: { PRINCIPAL, FEE, TERM_DAYS, APR, TYPICAL_ROLLOVERS },

  fairAlternative: {
    label: "Credit-union Payday Alternative Loan (PAL)",
    detail: `${usd(PRINCIPAL)} at 28% APR over 4 months: ${usd(FAIR.payment)}/mo, ${usd(FAIR.totalInterest)} total interest — vs. ${usd(rolloverFees(FEE, TYPICAL_ROLLOVERS))} in fees on the typical payday cycle.`,
  },
};
