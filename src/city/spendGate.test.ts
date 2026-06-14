import { describe, expect, it } from "vitest";

import type { Reasoner } from "../venice.js";
import { buildSpendGate, parseVerdict } from "./spendGate.js";

/** A fake Venice reasoner whose reply (or throw) is controlled per test. */
const fake = (fn: () => string): Reasoner => ({ complete: async () => fn() });

const base = {
  goal: "Produce a market brief on ETH",
  role: "Research agent",
  service: "Market-Data API",
};

describe("parseVerdict", () => {
  it("reads approve + reason from clean JSON", () => {
    expect(parseVerdict('{"approve":true,"reason":"ok"}')).toEqual({
      approved: true,
      reason: "ok",
    });
  });
  it("extracts JSON embedded in prose", () => {
    expect(
      parseVerdict('sure — {"approve":false,"reason":"too costly"} done'),
    ).toEqual({ approved: false, reason: "too costly" });
  });
  it("returns null on missing or invalid approve flag", () => {
    expect(parseVerdict("no json here")).toBeNull();
    expect(parseVerdict('{"reason":"x"}')).toBeNull();
  });
});

describe("buildSpendGate — deterministic floor", () => {
  it("denies an over-cap spend WITHOUT calling Venice", async () => {
    const gate = buildSpendGate(
      fake(() => {
        throw new Error("Venice must not be called once the floor denies");
      }),
    );
    const v = await gate({ ...base, amount: 600000n, subCap: 500000n });
    expect(v.approved).toBe(false);
    expect(v.reason).toMatch(/over sub-budget cap/);
  });

  it("denies a non-positive amount", async () => {
    const gate = buildSpendGate(fake(() => "{}"));
    expect((await gate({ ...base, amount: 0n, subCap: 500000n })).approved).toBe(
      false,
    );
  });
});

describe("buildSpendGate — Venice judgment", () => {
  it("approves when within cap and Venice approves", async () => {
    const gate = buildSpendGate(
      fake(() => '{"approve":true,"reason":"serves the goal"}'),
    );
    expect(await gate({ ...base, amount: 50000n, subCap: 500000n })).toEqual({
      approved: true,
      reason: "serves the goal",
    });
  });

  it("blocks when within cap but Venice denies", async () => {
    const gate = buildSpendGate(
      fake(() => '{"approve":false,"reason":"irrelevant purchase"}'),
    );
    const v = await gate({ ...base, amount: 50000n, subCap: 500000n });
    expect(v.approved).toBe(false);
    expect(v.reason).toBe("irrelevant purchase");
  });

  it("fails open to the deterministic floor on a Venice outage", async () => {
    const gate = buildSpendGate(
      fake(() => {
        throw new Error("Venice down");
      }),
    );
    const v = await gate({ ...base, amount: 50000n, subCap: 500000n });
    expect(v.approved).toBe(true);
    expect(v.reason).toMatch(/deterministic policy/);
  });

  it("fails open when Venice returns unparseable output", async () => {
    const gate = buildSpendGate(fake(() => "I think yes, maybe?"));
    expect((await gate({ ...base, amount: 50000n, subCap: 500000n })).approved).toBe(
      true,
    );
  });
});
