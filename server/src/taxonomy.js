/**
 * The manipulation-tactic taxonomy.
 *
 * This is FoolProof's shared vocabulary: the adversary's playbook is written
 * in these terms, the referee classifies every adversary message against
 * them, and the debrief teaches them back to the user. Sourced from
 * documented patterns in FTC fraud reports, CFPB payday-lending studies,
 * and tenant-rights literature.
 */
export const TACTICS = [
  {
    id: "urgency_pressure",
    name: "Urgency Pressure",
    description:
      "Manufacturing a deadline so the target acts before thinking ('this offer expires today', 'funds are unrecoverable in 30 minutes').",
    defense: "Real institutions almost never require decisions in minutes. Slowing down is itself a defense.",
  },
  {
    id: "authority_impersonation",
    name: "Authority Impersonation",
    description:
      "Claiming to be a bank, government agency, or official to borrow their credibility ('this is the fraud department').",
    defense: "Hang up and call the institution back on the number printed on your card or statement — never a number the caller gives you.",
  },
  {
    id: "fee_burial",
    name: "Fee Burial",
    description:
      "Hiding or minimizing a cost inside friendly language, fine print, or a dense clause ('just a small service charge', clause 14 of 30).",
    defense: "Ask for every fee as a single annual dollar total, in writing, before agreeing to anything.",
  },
  {
    id: "rate_anchoring",
    name: "Rate Anchoring",
    description:
      "Comparing the deal to something even worse so it looks cheap ('cheaper than an overdraft fee').",
    defense: "Compare against the fair alternative (a credit union loan, a normal lease), never against the worst case they hand you.",
  },
  {
    id: "false_scarcity",
    name: "False Scarcity",
    description:
      "Inventing competition or limited supply to force a fast yes ('two other applicants are interested').",
    defense: "Scarcity you can't verify is a sales tactic. If it's gone tomorrow, it was never a good deal.",
  },
  {
    id: "isolation",
    name: "Isolation",
    description:
      "Telling the target not to consult anyone — family, bank staff, a lawyer — so nobody can interrupt the script.",
    defense: "'Don't tell anyone' is the single strongest scam signal that exists. Tell someone immediately.",
  },
  {
    id: "sunk_cost",
    name: "Sunk-Cost Pressure",
    description:
      "Using time or money already invested to keep the target moving ('you've already filled out the application').",
    defense: "Money and time already spent are gone either way. Only the next dollar matters.",
  },
  {
    id: "reciprocity_baiting",
    name: "Reciprocity Baiting",
    description:
      "Offering a small fake favor to create a sense of debt ('I'll waive the application fee just for you').",
    defense: "A discount on a bad deal is still a bad deal. Favors from strangers in negotiations are pricing tactics.",
  },
  {
    id: "complexity_flooding",
    name: "Complexity Flooding",
    description:
      "Drowning the target in jargon, case numbers, or paperwork so they stop reading and start trusting.",
    defense: "If you can't explain a clause back in one sentence, you haven't agreed to it — ask again or walk away.",
  },
  {
    id: "reassurance_framing",
    name: "Reassurance Framing",
    description:
      "Repeating that everything is normal, standard, and safe to suppress the target's alarm ('everyone does this', 'totally standard language').",
    defense: "Count the reassurances. Honest deals rarely need you to be soothed.",
  },
];

export const TACTIC_IDS = TACTICS.map((t) => t.id);

export function tacticById(id) {
  return TACTICS.find((t) => t.id === id);
}
