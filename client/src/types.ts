/** Client-side mirrors of the API payloads. */

export interface User {
  id: number;
  username: string;
  isGuest: boolean;
}

export interface Me {
  user: User | null;
  moneyProtected?: number;
  moneyLost?: number;
  roundsPlayed?: number;
  liveAdversary?: boolean;
}

export interface ScenarioCard {
  slug: string;
  title: string;
  setup: string;
  adversaryName: string;
  avatar: string;
  difficulty: string;
  supportsVoice: boolean;
  best: "case_closed" | "mark" | "unplayed";
}

export interface DecisionOption {
  id: string;
  label: string;
  kind: "take" | "negotiated" | "walk";
}

export interface LeaseClause {
  id: string;
  tacticId: string;
  label: string;
  start: number;
  end: number;
  cost: number;
}

export interface ScenarioDocument {
  title: string;
  /** short label for the in-round document button, e.g. "Lease" / "Agreement" */
  shortLabel?: string;
  text: string;
  clauses: LeaseClause[];
  /** plain-English one-liner per numbered clause ("1".."18") — the jargon translator */
  translations?: Record<string, string>;
}

export interface RoundScenario {
  slug: string;
  title: string;
  setup: string;
  adversaryName: string;
  avatar: string;
  supportsVoice: boolean;
  /** voice scenarios: the (spoofed) caller the phone screen displays */
  callerId: { name: string; number: string } | null;
  decisions: DecisionOption[];
  document: ScenarioDocument | null;
  beatCount: number;
}

export interface ChatMessage {
  id: number;
  role: "adversary" | "user";
  content: string;
  turnIndex: number;
  /** client-side: tactic ids the user flagged on this message */
  flagged?: string[];
}

export interface RoundStart {
  sessionId: number;
  scenario: RoundScenario;
  messages: ChatMessage[];
  liveAdversary: boolean;
}

export interface StreamDone {
  done: true;
  message: ChatMessage;
  beat: number;
  beatCount: number;
  decisionReady: boolean;
}

export interface Finding {
  id: number;
  tacticId: string;
  messageId: number | null;
  outcome: "caught" | "resisted" | "fell_for";
  evidenceQuote: string;
  explanation: string;
}

export interface BreakdownRow {
  label: string;
  amount: number;
  note: string;
  buried?: boolean;
}

export interface Verification {
  engine: "wolframalpha";
  query: string;
  claim: string;
  expected: number;
  result: string;
  verified: boolean;
}

export interface DebriefData {
  scenario: { slug: string; title: string; adversaryName: string; avatar: string };
  decision: string;
  decisionLabel: string;
  transcript: ChatMessage[];
  findings: Finding[];
  flags: { id: number; messageId: number; tacticId: string; correct: boolean | null }[];
  result: {
    damageDollars: number;
    breakdown: BreakdownRow[];
    headline: string;
    score: number;
    possible: number;
    verdict: "case_closed" | "mark";
  };
  neutralizingQuestions: string[];
  document: ScenarioDocument | null;
  /** independent Wolfram|Alpha cross-check of the key computation, if available */
  verification: Verification | null;
}

export interface RadarEntry {
  tacticId: string;
  name: string;
  attempts: number;
  caught: number;
  catchRate: number;
}

export interface ProfileData {
  moneyProtected: number;
  moneyLost: number;
  roundsPlayed: number;
  radar: RadarEntry[];
  history: {
    sessionId: number;
    scenario: string;
    slug: string;
    avatar: string;
    verdict: "case_closed" | "mark";
    damageDollars: number;
    score: number;
    possible: number;
    when: string;
  }[];
}

export interface CodexTactic {
  id: string;
  name: string;
  definition: string;
  example: string;
  counter: string;
  unlocked: boolean;
}
