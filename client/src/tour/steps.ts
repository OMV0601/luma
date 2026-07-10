/**
 * The self-driving demo script — data, not code, like everything else here.
 * Each step optionally navigates, runs automated actions (the tour drives a
 * REAL round against the scripted/live adversary — nothing is mocked), then
 * spotlights one region and pauses on a popup until the viewer clicks Next.
 *
 * Selectors support a "::last" suffix (last match wins) for message bubbles.
 */

export interface TourAction {
  type: "click" | "type" | "wait-reply" | "ensure-guest" | "sleep";
  selector?: string;
  text?: string;
  ms?: number;
}

export interface TourStep {
  id: string;
  /** navigate here first (if not already there) */
  route?: string;
  /** selector that must exist before this step proceeds */
  waitFor?: string;
  /** how long to wait for waitFor/target before giving up */
  timeoutMs?: number;
  /** automated actions to perform before the popup shows */
  actions?: TourAction[];
  /** spotlight this element; omit for a centered narration card */
  target?: string;
  /** skip silently if the target never appears (e.g. Wolfram badge without a key) */
  optional?: boolean;
  title: string;
  body: string;
}

const PROBE_QUESTION =
  "Why would the equipment money go through my personal bank account?";

export const TOUR_STEPS: TourStep[] = [
  {
    id: "intro",
    route: "/",
    title: "THE CASE BRIEFING",
    body: "FoolProof is about to demo itself. It will take the cursor, play a real round against a scam character, and open the evidence. Nothing is mocked or pre-recorded — this is the live app. Read at your pace; Next advances, Esc bails out.",
  },
  {
    id: "problem",
    target: '[data-tour="hero"]',
    title: "THE PROBLEM",
    body: "Americans reported $15.9 billion lost to fraud last year — taken in live conversations, not pop quizzes. Financial literacy is taught passively, but money is lost actively. FoolProof trains the exact moment that costs you.",
  },
  {
    id: "subjects",
    target: '[data-tour="subjects"]',
    title: "THE WANTED WALL",
    body: "Every card is a playable scam with a real manipulation playbook — a payday counter, a fake recruiter, a bank imposter with full voice mode, a landlord with a poisoned lease, a toll-fee text. New scams ship as JSON, not code.",
  },
  {
    id: "enter",
    actions: [{ type: "ensure-guest" }],
    title: "MEET JORDAN",
    body: "The Dream Internship: the number-one scam hitting students right now — a dream job DM, a check in the mail, and a favor to repay. The tour will play the round for you. Watch the cursor.",
  },
  {
    id: "scene",
    route: "/round/internship",
    waitFor: '[data-tour="composer"]',
    target: '[data-tour="scene"]',
    title: "THE SCENE",
    body: "You're a student. You never applied to this. It pays double your friend's lifeguard job. Every scenario opens with the moment before the mistake.",
  },
  {
    id: "opening",
    target: '[data-tour="adversary-msg"]::last',
    title: "THE ADVERSARY",
    body: "Jordan is an AI character driven by a beat-by-beat playbook — recruiter warmth, HR-portal furniture, one hidden objective. Online it's a live Claude character; offline a scripted state machine runs the same playbook. The demo cannot break.",
  },
  {
    id: "probe",
    actions: [
      { type: "click", selector: '[data-tour="composer"]' },
      { type: "type", selector: '[data-tour="composer"]', text: PROBE_QUESTION },
      { type: "sleep", ms: 350 },
      { type: "click", selector: '[data-tour="send"]' },
      { type: "wait-reply" },
    ],
    target: '[data-tour="adversary-msg"]::last',
    title: "CORNERED ON SPECIFICS",
    body: "We asked the one question this scam can't survive. The playbook forces honest concessions when cornered precisely — \"it IS a little unusual\" — then re-anchors on the deadline. Real scammers do exactly this.",
  },
  {
    id: "flag-open",
    actions: [{ type: "click", selector: '[data-tour="flag-btn"]::last' }],
    // no waitFor: the picker only exists AFTER the click; target waits for it
    target: '[data-tour="flagpicker"]',
    title: "CALL IT OUT",
    body: "Any message can be flagged, live, with one of ten named manipulation tactics — the shared taxonomy the adversary plays, the referee grades, and the Codex teaches. Right call: caught in the act. Wrong call: stamped UNFOUNDED.",
  },
  {
    id: "flag-pick",
    actions: [
      { type: "click", selector: '[data-tour="tactic-flooding"]' },
      { type: "sleep", ms: 500 },
    ],
    target: '[data-tour="adversary-msg"]::last',
    title: "CAUGHT IN THE ACT",
    body: "The flag chip lands on the record. When the round is graded, a correct live flag upgrades the referee's finding — you didn't just survive the tactic, you named it mid-conversation.",
  },
  {
    id: "decide",
    actions: [{ type: "click", selector: '[data-tour="decision-take"]' }],
    // the debrief only exists AFTER the decision; target waits (referee may be slow live)
    timeoutMs: 30000,
    target: '[data-tour="damage"]',
    title: "WE TOOK THE DEAL — ON PURPOSE",
    body: "This is the Evidence File. The damage figure is not AI output: it's a deterministic TypeScript engine — the Reg CC fake-check timeline, 24 unit tests — that prices the mistake at $2,165. Losing here is the product working.",
  },
  {
    id: "breakdown",
    target: '[data-tour="breakdown"]',
    title: "THE ITEMIZED DAMAGE",
    body: "Day 2: you Zelle $2,130 of real money. Day 7: the check bounces and the bank claws back all $2,480 — including the $350 \"first week's pay,\" which was your own provisional credit all along. The buried mechanics un-redact themselves.",
  },
  {
    id: "verified",
    target: '[data-tour="verified"]',
    optional: true,
    timeoutMs: 2500,
    title: "INDEPENDENTLY CROSS-CHECKED",
    body: "The key computation is re-run by Wolfram|Alpha and compared against our engine at debrief time. Two independent systems, one number. If they ever disagreed, this badge would refuse to render.",
  },
  {
    id: "tape",
    target: '[data-tour="tape"]',
    title: "THE TAPE — ANNOTATED",
    body: "A second, independent AI grades the round — the scammer never grades its own exam. Every manipulation attempt is stamped in the margin: CAUGHT, RESISTED, or FELL FOR IT, each with the exact quote as evidence.",
  },
  {
    id: "radar",
    route: "/profile",
    waitFor: '[data-tour="radar"]',
    target: '[data-tour="radar"]',
    title: "STREET SMARTS",
    body: "The round you just watched is already on this profile: money protected vs lost, and a catch-rate radar across all ten tactics. Weak spots are visible, so the next round targets them. That's the retention loop.",
  },
  {
    id: "business",
    route: "/for-institutions",
    waitFor: '[data-tour="streams"]',
    target: '[data-tour="streams"]',
    title: "THE BUSINESS",
    body: "KnowBe4 built a multi-billion-dollar category on simulated phishing for employees. FoolProof is simulated fraud for customers: per-member licensing for banks and credit unions, per-seat for schools, freemium for families.",
  },
  {
    id: "close",
    title: "YOUR TURN",
    body: "Get scammed here — so it never happens out there. The Gauntlet is open: five adversaries, multiple endings each, and an Evidence File with your name on it.",
  },
];
