/** Damage-engine dispatch: scenario.damageModel -> engine. */
import { paydayDamage } from "./payday.ts";
import { fraudcallDamage } from "./fraudcall.ts";
import { leaseDamage } from "./lease.ts";
import { internshipDamage } from "./internship.ts";
import type { DamageResult } from "../types.ts";

export interface DamageContext {
  upsold?: boolean;
  challengedClauses?: string[];
}

export function runDamage(
  model: string,
  decision: string,
  ctx: DamageContext = {}
): DamageResult {
  switch (model) {
    case "payday":
      return paydayDamage(decision, ctx);
    case "fraudcall":
      return fraudcallDamage(decision);
    case "lease":
      return leaseDamage(decision, ctx);
    case "internship":
      return internshipDamage(decision);
    default:
      throw new Error(`Unknown damage model "${model}"`);
  }
}
