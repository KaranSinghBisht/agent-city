import { describe, expect, it } from "vitest";

import { buildTransferExecution, toPermissionContext, type SignedDelegation } from "./redeem.js";

describe("buildTransferExecution", () => {
  it("encodes an ERC-20 transfer (selector 0xa9059cbb), target=token, value 0", () => {
    const exec = buildTransferExecution(
      "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "0x1111111111111111111111111111111111111111",
      1_000_000n,
    );
    expect(exec.target).toBe("0x036CbD53842c5426634e7929541eC2318f3dCF7e");
    expect(exec.value).toBe("0");
    expect(exec.data.startsWith("0xa9059cbb")).toBe(true);
  });
});

describe("toPermissionContext", () => {
  it("returns a JSON-safe delegation chain (bigints -> 0x-hex)", () => {
    const signed = {
      delegate: "0xaaa",
      delegator: "0xbbb",
      authority: "0x00",
      caveats: [],
      salt: 255n,
      signature: "0x",
    } as unknown as SignedDelegation;

    const ctx = toPermissionContext(signed);
    expect(Array.isArray(ctx)).toBe(true);
    expect(ctx).toHaveLength(1);
    const first = ctx[0] as { salt?: unknown };
    expect(first.salt).toBe("0xff"); // 255n -> 0xff, JSON-safe
  });
});
