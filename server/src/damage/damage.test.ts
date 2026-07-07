/**
 * Unit tests for the deterministic damage engines — the numbers the whole
 * app hangs on. Run with `npm test -w server`.
 */
import { describe, it, expect } from "vitest";
import { paydayDamage, paydayAPR } from "./payday.ts";
import { fraudcallDamage, FRAUDCALL } from "./fraudcall.ts";
import { leaseDamage, LEASE_TOTAL } from "./lease.ts";

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

describe("fraudcall", () => {
  it("transfer = full balance lost", () => {
    expect(fraudcallDamage("take").damageDollars).toBe(FRAUDCALL.balance);
  });
  it("hang up = full balance protected", () => {
    expect(fraudcallDamage("walk").damageDollars).toBe(-FRAUDCALL.balance);
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
