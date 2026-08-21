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
  /** short label for the in-round document button, e.g. "Lease" / "Agreement" */
  shortLabel?: string;
  text: string;
  clauses: LeaseClause[];
  /** plain-English one-liner per numbered clause ("1".."18") — the jargon translator */
  translations?: Record<string, string>;
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

/** One line item in a Scam Factory-generated damage spec. */
export interface GenericDamageRow {
  label: string;
  amount: number; // positive integer dollars (validated + rounded at generation)
  note: string;
  /** true = renders behind a redaction bar in the Evidence File */
  buried?: boolean;
  /** true = dropped from the bill under a "negotiated" decision */
  negotiable?: boolean;
}

/**
 * Frozen damage data for generated scenarios (damageModel: "generic").
 * Proposed once by the Scam Factory LLM call, validated, then treated as
 * deterministic input — headlines use {total}/{paid}/{avoided} placeholders
 * that the engine substitutes, so prose can never contradict arithmetic.
 */
export interface GenericDamageSpec {
  rows: GenericDamageRow[]; // 2..6
  headlines: { take: string; negotiated?: string; walk: string };
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
  /** present only on Scam Factory-generated scenarios (damageModel: "generic") */
  damageSpec?: GenericDamageSpec;
  /** voice scenarios: what the phone screen shows as the (spoofed) caller */
  callerId?: { name: string; number: string };
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
