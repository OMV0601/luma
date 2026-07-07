/**
 * The 10-tactic manipulation taxonomy — FoolProof's shared vocabulary.
 * The adversary playbooks are written in these ids, the referee grades
 * against them, the flag picker offers them, and the codex teaches them.
 * Single source of truth, imported by both server and client.
 */
export interface Tactic {
  id: string;
  name: string;
  definition: string;
  /** Codex content: a real-world example of the tactic in the wild. */
  example: string;
  /** Codex content: the counter-move that defuses it. */
  counter: string;
}

export const TACTICS: Tactic[] = [
  {
    id: "urgency",
    name: "Urgency Pressure",
    definition: 'Artificial deadline to prevent thinking ("today only", "right now").',
    example: 'The IRS-impersonation call: "an officer is being dispatched to your address within the hour unless you pay now."',
    counter: "Real institutions give you days, not minutes. Say: \"If it's gone tomorrow, it was never real.\"",
  },
  {
    id: "scarcity",
    name: "False Scarcity",
    definition: 'Invented competition ("two other applicants").',
    example: 'Rental listings that always have "someone else coming to see it this afternoon" — for every unit, every week.',
    counter: "Scarcity you can't verify is a sales tactic. Ask for it in writing; watch it evaporate.",
  },
  {
    id: "authority",
    name: "Authority Impersonation",
    definition: 'Borrowed legitimacy ("bank security team", badge numbers).',
    example: "Imposter scams — the FTC's biggest fraud category — open with a spoofed caller ID and a badge number you can't check.",
    counter: "Hang up. Call back on the number printed on your card or statement — never a number the caller gives you.",
  },
  {
    id: "fee_burial",
    name: "Fee Burial",
    definition: 'Cost stated in a form designed to hide its true size ("$15 per $100").',
    example: 'Payday storefronts quote "$15 per $100" because "391% APR" would empty the store.',
    counter: 'Ask the one question the form is built to dodge: "What is the APR, and what is the total I will repay?"',
  },
  {
    id: "anchoring",
    name: "Rate Anchoring",
    definition: "A terrible number first, so bad looks good.",
    example: 'Dealership sticker at $34,000 so the "manager special" at $31,500 feels like a win over a car worth $28,000.',
    counter: "Compare to the fair alternative you researched — never to the first number they showed you.",
  },
  {
    id: "isolation",
    name: "Isolation",
    definition: '"Don\'t tell anyone / don\'t hang up / don\'t call the branch."',
    example: 'Grandparent scams instruct the victim: "don\'t tell mom and dad, they\'ll panic — just wire the bail money."',
    counter: '"Don\'t tell anyone" is the loudest scam signal that exists. Tell someone immediately.',
  },
  {
    id: "normalizing",
    name: "Reassurance Framing",
    definition: '"Everyone does this, it\'s totally standard."',
    example: 'Every predatory lease clause ever challenged: "that\'s standard language, hon, it\'s in every lease in the county."',
    counter: "Count the reassurances. Honest deals don't need you soothed. \"Standard\" is not the same as \"fair.\"",
  },
  {
    id: "sunk_cost",
    name: "Sunk-Cost Pressure",
    definition: '"You\'ve come this far / already filled the forms."',
    example: 'Timeshare presentations run 4 hours on purpose — by hour 3, leaving feels like wasting your whole day.',
    counter: "Time and money already spent are gone either way. Only the next dollar matters.",
  },
  {
    id: "reciprocity",
    name: "Reciprocity Bait",
    definition: 'Small favor first to create obligation ("I waived the application fee for you").',
    example: 'The "free" airport lounge pass that obligates you to sit through the credit-card pitch — and say yes.',
    counter: "A discount on a bad deal is still a bad deal. Unrequested favors in a negotiation are pricing tactics.",
  },
  {
    id: "flooding",
    name: "Complexity Flooding",
    definition: "Burying the decision in numbers/paperwork so you stop reading.",
    example: "The dealership four-square worksheet: price, trade-in, payment, and down payment shuffled until nothing is comparable.",
    counter: "One rule: if you can't explain a clause back in one sentence, you haven't agreed to it. Slow down or walk.",
  },
];

export const TACTIC_IDS = TACTICS.map((t) => t.id);

export function tacticName(id: string): string {
  return TACTICS.find((t) => t.id === id)?.name ?? id;
}
