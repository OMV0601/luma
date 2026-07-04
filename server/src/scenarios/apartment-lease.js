/**
 * Scenario 3 — "The First Apartment"
 *
 * A predatory lease with three expensive clauses buried in dense language,
 * plus sign-today pressure. This scenario includes an actual document the
 * user must read inside the chat flow — the jargon-translation focus area
 * living inside the game mechanic.
 */
import { recurringCost, renewalIncreaseCost, usd } from "../scoring/finance.js";

const RENT = 1400;
const AMENITY_FEE = 150; // monthly, clause 14
const RENEWAL_INCREASE_PCT = 8; // auto-renewal, clause 9
const RESTORATION_FEE = 500; // non-refundable, clause 17
const TENANCY_MONTHS = 24; // horizon used for cost math

const amenityCost = recurringCost(AMENITY_FEE, TENANCY_MONTHS); // 3600
const renewalCost = renewalIncreaseCost(RENT, RENEWAL_INCREASE_PCT); // 1344

export default {
  id: "apartment-lease",
  title: "The First Apartment",
  tagline: "The unit is great. The lease has three clauses that cost $5,400. Two other people are 'interested.'",
  character: "Diane — landlord, Birchwood Court",
  difficulty: "Advanced",
  userRole:
    "You're touring a $1,400/month one-bedroom at Birchwood Court — the best unit you've seen in weeks. Diane, the landlord, hands you the lease on a clipboard. Read it carefully (button above the chat) — everything she'd rather you skim is in there.",
  decisions: { accept: "Sign the lease", walkAway: "Decline & walk away" },

  opening:
    "So! What did I tell you — that afternoon light in the living room, you can't fake that. Listen, I'll be straight with you because I like you: I've got two other applications coming in tomorrow morning. But you were here first, and I believe in first-come-first-served. Here's the lease — it's all standard language, same one every landlord in the county uses. If you can sign today I'll even waive the $200 application fee. Take a look and let's get you those keys!",

  persona: `You are Diane, 58, a landlord who owns six units and has been doing this for twenty years. You are chatty, complimentary, and maternal — you call people "hon" and talk about the neighborhood. You treat the lease as a formality ("standard language") and get subtly wounded, then brisk, when clauses are questioned, as if the tenant is being paranoid.`,

  goal: `Get the tenant to sign today, with clauses 9 (auto-renewal at +8% unless 90-day certified-mail notice), 14 ($150/month mandatory "amenity & administration fee" on top of rent), and 17 ($500 non-refundable "restoration fee" deducted from the deposit regardless of condition) intact.`,

  document: {
    title: "Residential Lease Agreement — Birchwood Court, Unit 2B",
    note: "Excerpted clauses. The ones that matter are not at the top.",
    text: `RESIDENTIAL LEASE AGREEMENT — BIRCHWOOD COURT, UNIT 2B

1. PARTIES & PREMISES. This agreement is made between Birchwood Court Properties LLC ("Landlord") and the undersigned ("Tenant") for Unit 2B.

2. TERM. Twelve (12) months commencing on the first day of the month following execution.

3. RENT. Tenant shall pay base rent of $1,400.00 per month, due on the 1st, delinquent after the 3rd. Late payments incur a charge of $75 plus $10 per additional day.

4. SECURITY DEPOSIT. Tenant shall deposit $1,400.00 as security, held per applicable law, refundable subject to Sections 16 and 17 herein.

5.–8. [Occupancy, utilities, quiet enjoyment, maintenance — standard provisions.]

9. RENEWAL. This lease shall AUTOMATICALLY RENEW for successive twelve (12) month terms at one hundred eight percent (108%) of the then-current base rent, unless Tenant delivers written notice of non-renewal by certified mail received no fewer than ninety (90) days prior to term expiration. Notice by email, text, or ordinary mail shall not constitute effective notice.

10.–13. [Parking, pets, alterations, insurance — standard provisions.]

14. AMENITY & ADMINISTRATION FEE. In addition to base rent, Tenant shall pay a mandatory monthly amenity and administration fee of $150.00, covering common-area upkeep, administrative processing, and facility access. This fee is due with rent, is subject to the same late charges, and is not waivable in whole or in part.

15. [Entry and inspection — standard provisions.]

16. SURRENDER. Upon vacating, Tenant shall return the premises in the condition received, ordinary wear excepted.

17. RESTORATION FEE. Notwithstanding Section 16, a non-refundable restoration and turnover fee of $500.00 shall be deducted from the security deposit in all cases, irrespective of the condition of the premises, to cover Landlord's turnover costs.

18. ENTIRE AGREEMENT. This document constitutes the entire agreement; oral representations are of no effect.`,
  },

  playbook: [
    {
      tactic: "false_scarcity",
      instruction: `The "two other applications tomorrow morning" are your main lever. Reference them whenever the tenant slows down. They cannot be verified and you invented them.`,
    },
    {
      tactic: "reciprocity_baiting",
      instruction: `The waived $200 application fee is a gift you gave them — remind them of it if they get difficult ("I'm already waiving the application fee for you, hon").`,
    },
    {
      tactic: "complexity_flooding",
      instruction: `Wave at the lease as "the standard county form" and discourage close reading ("it's the same lease everyone signs, you'd need a law degree to get through clause by clause"). If they read anyway, act mildly hurt.`,
    },
    {
      tactic: "fee_burial",
      instruction: `Never volunteer clause 14. If asked about total monthly cost, say "rent is fourteen hundred" — the amenity fee is "separate from rent, it's a fee." Only concede the true $1,550/month total if they add it up themselves.`,
    },
    {
      tactic: "reassurance_framing",
      instruction: `Every questioned clause is "totally standard," "required by our insurance," or "in every lease in the county." The auto-renewal "protects you from rent shopping around you."`,
    },
    {
      tactic: "sunk_cost",
      instruction: `If they hesitate late in the conversation, remind them of the time they've spent touring, the application they filled out, and how hard the search has been.`,
    },
  ],

  concessions: `If the tenant specifically demands clause 14 be struck and credibly threatens to walk, agree to reduce the amenity fee to $75 — strike it entirely only if they hold firm after that. Refuse to touch clause 9 ("the auto-renewal is company policy — just send the letter") but if pressed twice, agree in writing to accept email notice. Clause 17 is non-negotiable ("that one's required by my insurance," which is false, but never admit it). If they walk, get brisk: "the other applicants won't nitpick, good luck out there."`,

  traps: [
    {
      id: "amenity_fee",
      tactic: "fee_burial",
      label: "Clause 14: rent is actually $1,550, not $1,400",
      detection:
        "User finds clause 14, computes the true monthly total, or challenges the mandatory fee.",
      cost: amenityCost,
      costLabel: `${usd(AMENITY_FEE)}/month × ${TENANCY_MONTHS} months of a typical tenancy`,
    },
    {
      id: "auto_renewal",
      tactic: "complexity_flooding",
      label: "Clause 9: auto-renews at +8% unless certified mail, 90 days out",
      detection:
        "User finds clause 9, questions the certified-mail-only notice, or asks what happens at the end of the term.",
      cost: renewalCost,
      costLabel: `+${RENEWAL_INCREASE_PCT}% on ${usd(RENT)} = ${usd(renewalCost)} extra in year two — and the notice window is designed to be missed`,
    },
    {
      id: "restoration_fee",
      tactic: "reassurance_framing",
      label: "Clause 17: $500 of your deposit is gone no matter what",
      detection:
        "User finds clause 17 or asks how the deposit interacts with the 'non-refundable' fee (which is unenforceable in many states — but only if you catch it).",
      cost: RESTORATION_FEE,
      costLabel: "deducted from your deposit regardless of the unit's condition",
    },
    {
      id: "sign_today",
      tactic: "false_scarcity",
      label: "The 'two other applicants' + waived fee = sign before reading",
      detection:
        "User declines to be rushed, asks to take the lease home, or names the scarcity/favor combo as pressure.",
      cost: 0,
      costLabel: "a framing trap — its whole job is to stop you reading clauses 9, 14, and 17",
    },
  ],

  financials: { RENT, AMENITY_FEE, RENEWAL_INCREASE_PCT, RESTORATION_FEE, TENANCY_MONTHS },

  fairAlternative: {
    label: "The same lease, read and negotiated",
    detail: `Striking clause 14, converting clause 9 to email notice, and contesting clause 17 saves ${usd(amenityCost + renewalCost + RESTORATION_FEE)} over two years — or walk, because a landlord who buries ${usd(AMENITY_FEE)}/mo in clause 14 will bury other things later.`,
  },
};
