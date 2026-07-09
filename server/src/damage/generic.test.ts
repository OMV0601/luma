import { describe, it, expect } from "vitest";
import { genericDamage } from "./generic.ts";
import type { GenericDamageSpec } from "../types.ts";

const SPEC: GenericDamageSpec = {
  rows: [
    { label: "Upfront 'processing' fee", amount: 100, note: "wired, unrecoverable" },
    { label: "Buried monthly charge", amount: 250, note: "in clause 12", buried: true },
    { label: "Optional add-on", amount: 50, note: "droppable if challenged", negotiable: true },
  ],
  headlines: {
    take: "You'd pay {total} before noticing.",
    negotiated: "You paid {paid} but dodged {avoided}.",
    walk: "You walked away from {total} in damage.",
  },
};

describe("generic damage engine (Scam Factory scenarios)", () => {
  it("take = sum of all rows, breakdown preserved", () => {
    const r = genericDamage(SPEC, "take");
    expect(r.damageDollars).toBe(400);
    expect(r.breakdown).toHaveLength(3);
    expect(r.breakdown[1].buried).toBe(true);
    expect(r.headline).toBe("You'd pay $400 before noticing.");
  });

  it("negotiated drops negotiable rows; walk is negative with avoided notes", () => {
    const n = genericDamage(SPEC, "negotiated");
    expect(n.damageDollars).toBe(350);
    expect(n.breakdown).toHaveLength(2);
    expect(n.breakdown.some((row) => row.label === "Optional add-on")).toBe(false);
    expect(n.headline).toBe("You paid $350 but dodged $50.");

    const w = genericDamage(SPEC, "walk");
    expect(w.damageDollars).toBe(-400);
    expect(w.breakdown.every((row) => row.note.startsWith("avoided — "))).toBe(true);
    expect(w.headline).toBe("You walked away from $400 in damage.");
  });

  it("throws on unknown decision, missing spec, and negotiated-without-negotiable", () => {
    expect(() => genericDamage(SPEC, "invest")).toThrow(/unknown decision/);
    expect(() => genericDamage(undefined, "take")).toThrow(/missing/);
    const rigid: GenericDamageSpec = {
      rows: [{ label: "Fee", amount: 10, note: "n" }],
      headlines: { take: "t", walk: "w" },
    };
    expect(() => genericDamage(rigid, "negotiated")).toThrow(/no negotiable rows/);
  });
});
