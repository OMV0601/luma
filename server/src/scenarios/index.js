/**
 * Scenario registry. Adding a fourth scenario = writing one new file with a
 * persona, playbook, and traps, then listing it here — no engine changes.
 * That data-driven design is the scalability story.
 */
import paydayLoan from "./payday-loan.js";
import fraudCall from "./fraud-call.js";
import apartmentLease from "./apartment-lease.js";

export const SCENARIOS = [paydayLoan, fraudCall, apartmentLease];

export function scenarioById(id) {
  return SCENARIOS.find((s) => s.id === id);
}

/** Public-safe metadata for the scenario picker (no playbook/traps leaked). */
export function scenarioSummaries() {
  return SCENARIOS.map((s) => ({
    id: s.id,
    title: s.title,
    tagline: s.tagline,
    character: s.character,
    difficulty: s.difficulty,
    userRole: s.userRole,
    decisions: s.decisions,
    hasDocument: Boolean(s.document),
  }));
}
