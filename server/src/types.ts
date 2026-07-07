/** Shared server-side types for playbooks, fallbacks, and grading. */

export interface Concession {
  trigger: string; // what the user must ask/do
  mustAdmit: string; // the accurate numbers the character must then state
}

export interface Beat {
  id: string;
  tactic: string; // tactic id from shared/tactics.ts
  goal: string;
  sampleLine?: string;
  concession?: Concession;
}

export interface LeaseClause {
  id: string; // auto_renewal | amenity_fee | repairs
  tacticId: string;
  label: string;
  /** character offsets into document.text so the UI can highlight */
  start: number;
  end: number;
  cost: number;
}

export interface ScenarioDocument {
  title: string;
  text: string;
  clauses: LeaseClause[];
}

export interface DecisionOption {
  id: string; // take | negotiated | walk (damage-engine keys)
  label: string;
  kind: "take" | "negotiated" | "walk";
}

/** Scripted no-API-key adversary: keyword-triggered branches + beat lines. */
export interface FallbackTrigger {
  /** case-insensitive regex source tested against the user message */
  match: string;
  reply: string;
  advance?: boolean; // move to the next beat after this reply
  once?: boolean; // fire at most once per round
}

export interface FallbackTree {
  /** main-path line(s) per beat, delivered when no trigger fires */
  beatLines: Record<string, string[]>;
  triggers: FallbackTrigger[];
  /** user goes quiet / one-word replies */
  nudges: string[];
  /** user tries to leave: final attempt, then acceptance */
  leave: [string, string];
  /** generic patter once beats are exhausted */
  filler: string[];
}

export interface Playbook {
  opening: string;
  beats: Beat[];
  escalation: string;
  guardrails: string[];
  neutralizingQuestions: string[];
  decisions: DecisionOption[];
  document?: ScenarioDocument;
  fallback: FallbackTree;
}

export interface Finding {
  tacticId: string;
  messageIndex: number;
  outcome: "caught" | "resisted" | "fell_for";
  evidenceQuote: string;
  explanation: string;
}

export interface DamageBreakdownRow {
  label: string;
  amount: number;
  note: string;
  /** true = this row renders behind a redaction bar in the Evidence File */
  buried?: boolean;
}

export interface DamageResult {
  damageDollars: number; // negative = protected
  breakdown: DamageBreakdownRow[];
  headline: string;
}
