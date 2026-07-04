/**
 * The scoring engine. Takes the referee's per-trap verdicts (AI) and the
 * user's final decision, and produces the debrief numbers with plain
 * arithmetic (no AI): dollars lost, dollars protected, awareness score,
 * letter grade.
 *
 * Rules:
 * - Every trap has a deterministic dollar cost (computed in the scenario
 *   from finance.js). Framing traps cost $0 but count toward awareness.
 * - accept    -> you eat the cost of every trap you didn't neutralize.
 * - walk_away -> you lose nothing; everything you were exposed to counts
 *   as protected. But awareness still grades what you *understood*.
 */

const STATUS_POINTS = { missed: 0, spotted: 0.6, neutralized: 1 };

const GRADE_BANDS = [
  [90, "A"],
  [80, "B"],
  [68, "C"],
  [55, "D"],
  [0, "F"],
];

export function scoreRound(scenario, decision, judgment) {
  // Merge the referee's verdicts onto the scenario's trap definitions;
  // any trap the referee somehow omitted defaults to "missed".
  const verdicts = new Map(judgment.traps.map((t) => [t.trapId, t]));
  const traps = scenario.traps.map((def) => {
    const v = verdicts.get(def.id) || {
      status: "missed",
      evidence: "",
      explanation: "This trap was never engaged with.",
    };
    return { ...def, status: v.status, evidence: v.evidence, explanation: v.explanation };
  });

  const totalExposure = traps.reduce((sum, t) => sum + t.cost, 0);

  let moneyLost = 0;
  let moneyProtected = 0;
  if (decision === "accept") {
    for (const t of traps) {
      if (t.status === "neutralized") moneyProtected += t.cost;
      else moneyLost += t.cost;
    }
  } else {
    moneyProtected = totalExposure;
  }

  // Awareness: 0-100, purely from per-trap understanding.
  const awarenessRaw =
    traps.reduce((sum, t) => sum + STATUS_POINTS[t.status], 0) / traps.length;
  const awareness = Math.round(awarenessRaw * 100);

  // Final score: the decision sets the band, awareness sets position in it.
  // Accepting a predatory deal caps you at 55 no matter how sharp you were;
  // walking away floors you at 40 even if you understood nothing (instinct
  // counts for something), and full awareness takes you to 100.
  const finalScore =
    decision === "accept"
      ? Math.round(awarenessRaw * 55)
      : Math.round(40 + awarenessRaw * 60);

  const grade = GRADE_BANDS.find(([min]) => finalScore >= min)[1];

  return {
    decision,
    traps,
    totalExposure,
    moneyLost,
    moneyProtected,
    awareness,
    finalScore,
    grade,
    fairAlternative: scenario.fairAlternative,
    playerSummary: judgment.playerSummary,
    coachingTips: judgment.coachingTips,
  };
}
