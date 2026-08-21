/**
 * The self-driving demo script — data, not code, like everything else here.
 * Each step optionally navigates, runs automated actions (the tour drives a
 * REAL round against the scripted/live adversary — nothing is mocked), then
 * spotlights one region and shows a case-file popup.
 *
 * Two audiences share this one script:
 *   • AUTO  — the hands-free video demo. Plays every step (incl. autoOnly),
 *             types/clicks itself, and advances on a timer. For judges.
 *   • GUIDED — the self-guided tour. Skips autoOnly steps and waits for the
 *             viewer to press Next. For users exploring on their own.
 *
 * Selectors support a "::last" suffix (last match wins) for message bubbles.
 */

export interface TourAction {
  type: "click" | "type" | "wait-reply" | "ensure-guest" | "sleep";
  selector?: string;
  text?: string;
  ms?: number;
  /** skip this action (don't fail the step) if the selector never appears —
   *  for chains that differ by mode, e.g. "close the lease modal if open" */
  optional?: boolean;
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
  /** skip silently if the target/actions fail (e.g. Wolfram badge, voice) */
  optional?: boolean;
  /** only shown in the hands-free auto demo — the feature-showcase extras */
  autoOnly?: boolean;
  /** auto-mode dwell after the text finishes typing (ms); default scales with length */
  dwellMs?: number;
  title: string;
  body: string;
  /** override copy in auto mode (the two modes read differently) */
  bodyAuto?: string;
}

const PROBE_QUESTION =
  "Are you a licensed attorney? What is your bar number?";

export const TOUR_STEPS: TourStep[] = [
  {
    id: "intro",
    route: "/",
    title: "THE CASE BRIEFING",
    body: "This is a self-driving tour. It takes the cursor, plays a real round against a scam character, and opens the evidence — nothing is mocked or pre-recorded. Read at your pace: Next advances, Esc bails out.",
    bodyAuto:
      "Sit back — FoolProof is about to demo itself, hands-free. It takes the cursor, plays a real round against a live scam character, opens the evidence, and tours every feature. Nothing is mocked. Pause or Exit anytime; Esc quits.",
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
    body: "Every card is a playable scam with a real manipulation playbook — a payday counter, a fake recruiter, a bank imposter with full voice mode, a landlord with a poisoned lease, a toll-fee text, and an immigration-services \"notario.\" New scams ship as JSON, not code.",
  },
  {
    id: "enter",
    actions: [{ type: "ensure-guest" }],
    title: "MEET HÉCTOR",
    body: "The Notario: the scam that targets newcomers hardest. In most of Latin America a \"notario público\" IS a licensed attorney — here it means a man who can witness a signature. He never says he is a lawyer. He does not have to. The tour plays the round for you now.",
  },
  {
    id: "scene",
    // walk there like a person: header nav -> the Gauntlet -> open the case
    actions: [
      { type: "click", selector: '[data-tour="nav-gauntlet"]' },
      { type: "sleep", ms: 700 },
      { type: "click", selector: '[data-tour="open-the-notario"]' },
    ],
    target: '[data-tour="scene"]',
    title: "THE SCENE",
    body: "Your work permit is everything right now, and a cousin passed you his number. Every scenario opens on the moment before the mistake — the one you would actually be living.",
  },
  {
    id: "opening",
    target: '[data-tour="adversary-msg"]::last',
    title: "THE ADVERSARY",
    body: "Héctor is an AI character driven by a beat-by-beat playbook — community warmth, a framed commission on the wall, one hidden objective. Online it's a live Claude character; offline a scripted state machine runs the same playbook. The demo cannot break.",
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
    body: "We asked the one question this scam cannot survive. The playbook forces honest concessions when cornered precisely — no bar number, no DOJ accreditation, a notary may only witness signatures — and then he re-anchors on the deadline. Real ones do exactly this.",
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
      { type: "click", selector: '[data-tour="tactic-authority"]' },
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
    body: "This is the Evidence File. The damage figure is not AI output: it's a deterministic TypeScript engine, locked by 34 unit tests, that prices the mistake at $7,200. Losing here is the product working.",
  },
  {
    id: "breakdown",
    target: '[data-tour="breakdown"]',
    title: "THE ITEMIZED DAMAGE",
    body: "$1,500 cash with no receipt. $1,200 in \"filing fees\" for Form I-589 — which has no USCIS filing fee at all, so every dollar was invented. $4,500 to a real attorney to undo it. And the part that isn't money: a frivolous claim filed in your name can bar you for life.",
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
    id: "codex",
    autoOnly: true,
    actions: [{ type: "click", selector: '[data-tour="nav-codex"]' }],
    target: '[data-tour="codex"]',
    title: "THE TACTIC CODEX",
    body: "Every con is one of ten named moves. Entries unlock the moment a scammer runs one on you — we teach at the point of failure, never as a lesson module. Each opens with a real-world example and the counter-move that defuses it.",
  },
  {
    id: "radar",
    actions: [{ type: "click", selector: '[data-tour="nav-profile"]' }],
    target: '[data-tour="radar"]',
    title: "STREET SMARTS",
    body: "The round you just watched is already on this profile: money protected vs lost, and a catch-rate radar across all ten tactics. Weak spots are visible, so the next round targets them. That's the retention loop.",
  },
  {
    id: "accessibility",
    autoOnly: true,
    optional: true,
    actions: [{ type: "click", selector: '[data-tour="readable"]' }, { type: "sleep", ms: 600 }],
    target: '[data-tour="readable"]',
    title: "BUILT TO BE READ",
    body: "One tap swaps the entire app to Atkinson Hyperlegible — a typeface designed for low vision and dyslexia. Jargon already excludes people; the interface shouldn't pile on. Captions, keyboard nav, and reduced-motion are first-class too.",
  },
  {
    id: "voice-call",
    autoOnly: true,
    optional: true,
    // back to the Gauntlet wall, then open the Fraud Alert case — the ring
    // should be the consequence of a visible click, not an ambush
    actions: [
      { type: "click", selector: '[data-tour="nav-gauntlet"]' },
      { type: "sleep", ms: 700 },
      { type: "click", selector: '[data-tour="open-fraudcall"]' },
    ],
    timeoutMs: 12000,
    target: '[data-tour="incoming-call"]',
    title: "IT ALSO RINGS",
    body: "The costliest scams arrive by phone. This is the bank-imposter case — spoofed caller ID, a real ringtone, the panic script loaded. The most dangerous channel gets the full treatment, not a text box.",
  },
  {
    id: "voice-live",
    autoOnly: true,
    optional: true,
    actions: [{ type: "click", selector: '[data-tour="answer-call"]' }, { type: "sleep", ms: 1000 }],
    target: '[data-tour="call-screen"]',
    title: "A VOICE, LIVE CAPTIONS",
    body: "Answered. The scammer speaks aloud through the browser while every word renders as a live caption, a waveform pulses, and the call timer runs. Voice and text share one engine — and one referee grading the outcome.",
  },
  {
    id: "voice-win",
    autoOnly: true,
    optional: true,
    actions: [{ type: "click", selector: '[data-tour="hangup"]' }],
    timeoutMs: 30000,
    target: '[data-tour="damage"]',
    title: "THE BORING MOVE WINS",
    body: "Hang up, call the number on your card. That reflex just protected $4,800 — same evidence file, opposite outcome: a green CASE CLOSED instead of a red MARK.",
  },
  {
    id: "plain-english",
    autoOnly: true,
    optional: true,
    // from the fraud-call debrief: Gauntlet -> the Lease Signing -> open the
    // lease document -> flip it to Plain English, all on camera
    actions: [
      { type: "click", selector: '[data-tour="nav-gauntlet"]' },
      { type: "sleep", ms: 700 },
      { type: "click", selector: '[data-tour="open-lease"]' },
      { type: "click", selector: '[data-tour="doc-btn"]' },
      { type: "sleep", ms: 500 },
      { type: "click", selector: '[data-tour="plain-toggle"]' },
      { type: "sleep", ms: 500 },
    ],
    target: '[data-tour="lease-plain"]',
    title: "THE JARGON TRANSLATOR",
    body: "The landlord case hands you a real 18-clause lease. One tap rewrites every clause into plain English — and the traps expose themselves: the auto-renewal, the non-refundable fee, the repairs you'd secretly owe. Jargon is where the money hides.",
  },
  {
    id: "business",
    // close the lease doc + leave the round when arriving from the auto path
    // (both clicks skip silently in guided mode), then home -> institutions
    actions: [
      { type: "click", selector: '[data-tour="doc-close"]', optional: true },
      { type: "click", selector: '[data-tour="leave-round"]', optional: true },
      { type: "click", selector: '[data-tour="nav-home"]' },
      { type: "sleep", ms: 600 },
      { type: "click", selector: '[data-tour="link-institutions"]' },
    ],
    target: '[data-tour="streams"]',
    title: "THE BUSINESS",
    body: "KnowBe4 built a multi-billion-dollar category on simulated phishing for employees. FoolProof is simulated fraud for customers: per-member licensing for banks and credit unions, per-seat for schools, freemium for families.",
  },
  {
    id: "close",
    title: "YOUR TURN",
    body: "Get scammed here — so it never happens out there. The Gauntlet is open: five adversaries, multiple endings each, and an Evidence File with your name on it.",
    bodyAuto:
      "That's the whole loop — five adversaries, voice and document scams, a jargon translator, provable damage math, and an evidence file with your name on it. Get scammed here, so it never happens out there.",
  },
];
