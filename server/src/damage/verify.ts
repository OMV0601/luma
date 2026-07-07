/**
 * Wolfram|Alpha cross-check — independent verification of the damage math.
 *
 * The deterministic engines in this directory are the source of truth (unit
 * tested, run offline). This module sends each scenario's *showcase
 * computation* — built from the same constants the engine uses — to
 * Wolfram|Alpha and confirms the number matches. The Evidence File then
 * carries provenance: the figure was computed twice, by two independent
 * systems, and the AI never touched it.
 *
 * Fails closed: no WOLFRAM_APP_ID, network down, or a mismatch -> the
 * debrief simply omits the badge. The demo can never break on this.
 */
import { PAYDAY, paydayAPR } from "./payday.ts";
import { INTERNSHIP } from "./internship.ts";
import { LEASE, LEASE_TOTAL } from "./lease.ts";

export const hasWolfram = () => Boolean(process.env.WOLFRAM_APP_ID);

export interface Verification {
  engine: "wolframalpha";
  /** the exact expression sent to Wolfram|Alpha */
  query: string;
  /** what the number means, for the Evidence File caption */
  claim: string;
  /** the engine's own value (source of truth) */
  expected: number;
  /** the value Wolfram returned, as text */
  result: string;
  verified: boolean;
}

/** One showcase computation per damage model, from the engine's constants. */
export function showcase(model: string): { query: string; claim: string; expected: number } | null {
  switch (model) {
    case "payday": {
      const fee = (PAYDAY.principal / 100) * PAYDAY.feePer100;
      return {
        query: `(${fee}/${PAYDAY.principal})*(365/${PAYDAY.termDays})*100`,
        claim: `the effective APR hidden inside "$${PAYDAY.feePer100} per $100"`,
        expected: paydayAPR(PAYDAY.principal),
      };
    }
    case "internship": {
      const loss = INTERNSHIP.vendorPayment + INTERNSHIP.returnedCheckFee;
      return {
        query: `(${INTERNSHIP.vendorPayment}+${INTERNSHIP.returnedCheckFee})/${INTERNSHIP.keepAmount}`,
        claim: `weeks of the promised "$${INTERNSHIP.keepAmount}/week" it would take to earn back the loss`,
        expected: loss / INTERNSHIP.keepAmount,
      };
    }
    case "lease":
      return {
        query: LEASE.clauses.map((c) => c.cost).join("+"),
        claim: "the three planted clauses, totaled over the term",
        expected: LEASE_TOTAL,
      };
    default:
      // fraudcall's number is stated in the scene, not computed — no badge.
      return null;
  }
}

/** Any number in any result pod within 0.1% of expected counts as a match. */
export function matches(text: string, expected: number): boolean {
  const nums = text.match(/-?\d+(?:\.\d+)?/g) ?? [];
  return nums.some((n) => {
    const v = Number(n);
    return Number.isFinite(v) && Math.abs(v - expected) <= Math.max(Math.abs(expected) * 0.001, 0.005);
  });
}

async function queryWolfram(input: string): Promise<string | null> {
  const appid = process.env.WOLFRAM_APP_ID;
  if (!appid) return null;
  const url =
    `https://api.wolframalpha.com/v2/query?appid=${encodeURIComponent(appid)}` +
    `&input=${encodeURIComponent(input)}&output=json&format=plaintext&podtimeout=4`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      queryresult?: { success?: boolean; pods?: { title: string; subpods?: { plaintext?: string }[] }[] };
    };
    const pods = body.queryresult?.pods ?? [];
    // Prefer the result-ish pods, but keep everything as fallback evidence.
    const texts = pods
      .filter((p) => p.title !== "Input" && p.title !== "Input interpretation")
      .flatMap((p) => p.subpods ?? [])
      .map((s) => s.plaintext ?? "")
      .filter(Boolean);
    return texts.join("\n") || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* The showcase query per model is static, so one Wolfram call per model per
 * server lifetime; concurrent debriefs share the same in-flight promise. */
const cache = new Map<string, Promise<Verification | null>>();

export function verifyDamage(model: string): Promise<Verification | null> {
  const spec = showcase(model);
  if (!spec || !hasWolfram()) return Promise.resolve(null);

  let pending = cache.get(model);
  if (!pending) {
    pending = (async () => {
      const result = await queryWolfram(spec.query);
      if (!result) return null;
      const verified = matches(result, spec.expected);
      // A mismatch would mean one of the two systems is wrong — surface it
      // in the server log, never in the UI.
      if (!verified) console.error(`[verify] Wolfram mismatch for ${model}:`, spec.query, "->", result);
      return {
        engine: "wolframalpha" as const,
        query: spec.query,
        claim: spec.claim,
        expected: spec.expected,
        result: result.split("\n")[0] ?? result,
        verified,
      };
    })();
    cache.set(model, pending);
  }
  return pending;
}
