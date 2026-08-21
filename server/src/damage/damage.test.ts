/**
 * Unit tests for the deterministic damage engines — the numbers the whole
 * app hangs on. Run with `npm test -w server`.
 */
import { describe, it, expect } from "vitest";
import { paydayDamage, paydayAPR } from "./payday.ts";
import { fraudcallDamage, FRAUDCALL } from "./fraudcall.ts";
import { leaseDamage, LEASE_TOTAL } from "./lease.ts";
import { notarioDamage, NOTARIO_TOTAL } from "./notario.ts";
import { internshipDamage, INTERNSHIP } from "./internship.ts";
import { showcase, matches } from "./verify.ts";

describe("payday", () => {
  it("take = 5 fee terms on $400 = $300", () => {
    const r = paydayDamage("take");
    expect(r.damageDollars).toBe(300);
    // 5 per-term rows + 1 APR row
    expect(r.breakdown.filter((b) => b.amount === 60)).toHaveLength(5);
  });

  it("take upsold = 5 fee terms on $600 = $450", () => {
    expect(paydayDamage("take", { upsold: true }).damageDollars).toBe(450);
  });

  it("negotiated = one term = $60", () => {
    expect(paydayDamage("negotiated").damageDollars).toBe(60);
  });

  it("walk = -$300 protected", () => {
    expect(paydayDamage("walk").damageDollars).toBe(-300);
  });

  it("APR ≈ 391%", () => {
    expect(paydayAPR(400)).toBeCloseTo(391.07, 1);
    expect(paydayAPR(600)).toBeCloseTo(391.07, 1); // rate independent of principal
  });

  it("rejects unknown decisions", () => {
    expect(() => paydayDamage("shrug")).toThrow();
  });
});

describe("wolfram cross-check (pure parts)", () => {
  it("payday showcase reproduces the engine's APR", () => {
    const s = showcase("payday")!;
    expect(s.expected).toBeCloseTo(paydayAPR(400), 5);
    // the query is honest: evaluating it yields the same number
    // eslint-disable-next-line no-eval
    expect(eval(s.query.replace(/[^0-9+\-*/().]/g, ""))).toBeCloseTo(s.expected, 5);
  });

  it("internship showcase = loss / weekly pay", () => {
    const s = showcase("internship")!;
    expect(s.expected).toBeCloseTo(2165 / 350, 5);
  });

  it("lease showcase totals the planted clauses", () => {
    const s = showcase("lease")!;
    expect(s.expected).toBe(LEASE_TOTAL);
  });

  it("fraudcall has no computation to verify", () => {
    expect(showcase("fraudcall")).toBeNull();
  });

  it("matches() finds the number in Wolfram-style pod text", () => {
    expect(matches("391.0714285714286", 391.0714285714286)).toBe(true);
    expect(matches("Decimal approximation:\n391.071428...", 391.0714)).toBe(true);
    expect(matches("390", 391.0714)).toBe(false); // outside 0.1%
    expect(matches("no numbers here", 42)).toBe(false);
  });
});

describe("fraudcall", () => {
  it("transfer = full balance lost", () => {
    expect(fraudcallDamage("take").damageDollars).toBe(FRAUDCALL.balance);
  });
  it("hang up = full balance protected", () => {
    expect(fraudcallDamage("walk").damageDollars).toBe(-FRAUDCALL.balance);
  });
});

describe("internship (fake-check overpayment)", () => {
  it("pay the vendor = $2,165 (the $2,130 sent + $35 returned-item fee)", () => {
    const r = internshipDamage("take");
    expect(r.damageDollars).toBe(2165);
    expect(r.damageDollars).toBe(INTERNSHIP.vendorPayment + INTERNSHIP.returnedCheckFee);
  });

  it("the kept $350 nets to zero — it was provisional credit, not income", () => {
    const r = internshipDamage("take");
    const keepRow = r.breakdown.find((b) => b.label.includes("first week"));
    expect(keepRow).toBeDefined();
    expect(keepRow!.amount).toBe(0); // reversed with the check, never real money
  });

  it("the bounce mechanics are the buried rows", () => {
    const buried = internshipDamage("take").breakdown.filter((b) => b.buried);
    expect(buried.length).toBeGreaterThanOrEqual(3); // bounce, clawback, fee
  });

  it("waiting for the check to clear = $35 fee only", () => {
    expect(internshipDamage("negotiated").damageDollars).toBe(INTERNSHIP.returnedCheckFee);
  });

  it("block & report = -$2,165 protected", () => {
    expect(internshipDamage("walk").damageDollars).toBe(-2165);
  });

  it("rejects unknown decisions", () => {
    expect(() => internshipDamage("ghost")).toThrow();
  });
});


describe("notario (immigration-services fraud)", () => {
  it("sign as-is = $7,200 (1500 + 1200 + 4500)", () => {
    expect(NOTARIO_TOTAL).toBe(7200);
    expect(notarioDamage("take").damageDollars).toBe(7200);
  });

  it("striking the non-attorney paragraph removes the biggest cost", () => {
    const r = notarioDamage("negotiated", { challengedClauses: ["not_attorney"] });
    expect(r.damageDollars).toBe(2700);
  });

  it("striking all three paragraphs = $0", () => {
    const r = notarioDamage("negotiated", {
      challengedClauses: ["nonrefundable", "mail_redirect", "not_attorney"],
    });
    expect(r.damageDollars).toBe(0);
  });

  it("negotiating without challenging anything costs the same as signing", () => {
    expect(notarioDamage("negotiated").damageDollars).toBe(7200);
  });

  it("walk = -$7,200 protected", () => {
    expect(notarioDamage("walk").damageDollars).toBe(-7200);
  });

  it("every row is buried — the whole loss lives in the fine print", () => {
    expect(notarioDamage("take").breakdown.every((r) => r.buried)).toBe(true);
  });

  it("rejects unknown decisions", () => {
    expect(() => notarioDamage("shrug")).toThrow();
  });
});

describe("lease", () => {
  it("sign as-is = $2,850 (1600 + 350 + 900)", () => {
    expect(LEASE_TOTAL).toBe(2850);
    expect(leaseDamage("take").damageDollars).toBe(2850);
  });

  it("negotiated with amenity struck = $2,500", () => {
    const r = leaseDamage("negotiated", { challengedClauses: ["amenity_fee"] });
    expect(r.damageDollars).toBe(2500);
  });

  it("negotiated with all three struck = $0", () => {
    const r = leaseDamage("negotiated", {
      challengedClauses: ["auto_renewal", "amenity_fee", "repairs"],
    });
    expect(r.damageDollars).toBe(0);
  });

  it("negotiated with none struck = same as signing as-is", () => {
    expect(leaseDamage("negotiated").damageDollars).toBe(2850);
  });

  it("walk = -$2,850 protected", () => {
    expect(leaseDamage("walk").damageDollars).toBe(-2850);
  });
});
