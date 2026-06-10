import {
  createDelegation,
  getSmartAccountsEnvironment,
  ScopeType,
} from "@metamask/smart-accounts-kit";
import {
  encodeDelegations,
  hashDelegation,
} from "@metamask/smart-accounts-kit/utils";
import { describe, expect, it } from "vitest";

import { randomSalt } from "./delegation.js";
import { parseGrant } from "./grantBridge.js";
import { toPermissionContext, type SignedDelegation } from "./redeem.js";
import { buildRedelegation } from "./redelegate.js";

const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const USER = "0x1111111111111111111111111111111111111111" as const;
const AGENT = "0x2222222222222222222222222222222222222222" as const;
const WORKER = "0x3333333333333333333333333333333333333333" as const;
const RELAYER = "0x4444444444444444444444444444444444444444" as const;
const SIG = ("0x" + "11".repeat(65)) as `0x${string}`;

/** A user-style grant: the same erc20-token-periodic scope MetaMask 7715 issues. */
function signedGrant(): SignedDelegation {
  const environment = getSmartAccountsEnvironment(84532);
  const grant = createDelegation({
    to: AGENT,
    from: USER,
    environment,
    salt: randomSalt(),
    scope: {
      type: ScopeType.Erc20PeriodTransfer,
      tokenAddress: USDC,
      periodAmount: 5_000_000n,
      periodDuration: 86_400,
      startDate: 1_700_000_000,
    },
  });
  return { ...grant, signature: SIG } as SignedDelegation;
}

describe("ERC-7715 grant bridge", () => {
  it("decodes a Kit-encoded grant context and identifies the delegator", () => {
    const grant = signedGrant();
    const context = encodeDelegations([grant]);

    // The exact body shape the /grant page POSTs after MetaMask responds.
    const parsed = parseGrant(
      { granted: [{ chainId: "0x14a34", context }], account: USER },
      AGENT,
    );

    expect(parsed.chain).toHaveLength(1);
    expect(parsed.delegator.toLowerCase()).toBe(USER.toLowerCase());
    expect(parsed.chain[0]?.delegate.toLowerCase()).toBe(AGENT.toLowerCase());
    expect(parsed.chain[0]?.signature).toBe(SIG);
    expect(parsed.context).toBe(context);
  });

  it("rejects grants made to a different agent", () => {
    const context = encodeDelegations([signedGrant()]);
    expect(() => parseGrant({ context }, WORKER)).toThrow(/not delegated/);
  });

  it("rejects unsigned chains, junk hex, and missing contexts", () => {
    const unsigned = { ...signedGrant(), signature: "0x" as `0x${string}` };
    const unsignedCtx = encodeDelegations([unsigned]);
    expect(() => parseGrant({ context: unsignedCtx }, AGENT)).toThrow(
      /not fully signed/,
    );
    expect(() => parseGrant({ context: "0xzz" }, AGENT)).toThrow(/valid hex/);
    expect(() => parseGrant({ context: "0xdeadbeef" }, AGENT)).toThrow(
      /did not decode/,
    );
    expect(() => parseGrant({ hello: "world" }, AGENT)).toThrow(/no permission/);
    expect(() =>
      parseGrant({ context: "0x" + "ab".repeat(70_000) }, AGENT),
    ).toThrow(/valid hex/);
  });

  it("chains a worker sub-budget UNDER the grant (3 links, linked by hash)", () => {
    const environment = getSmartAccountsEnvironment(84532);
    const grant = signedGrant();
    const parsed = parseGrant({ context: encodeDelegations([grant]) }, AGENT);

    // Mirror the orchestrator: agent -> worker chained under the grant leaf,
    // then worker -> relayer chained under that.
    const mid = buildRedelegation({
      environment,
      manager: AGENT,
      worker: WORKER,
      token: USDC,
      maxAmount: 1_000_000n,
      parent: parsed.chain[0] as SignedDelegation,
    });
    const midSigned = { ...mid, signature: SIG } as SignedDelegation;
    const leaf = buildRedelegation({
      environment,
      manager: WORKER,
      worker: RELAYER,
      token: USDC,
      maxAmount: 250_000n,
      parent: midSigned,
    });
    const leafSigned = { ...leaf, signature: SIG } as SignedDelegation;

    expect(mid.authority).toBe(hashDelegation(grant));
    expect(leaf.authority).toBe(hashDelegation(midSigned));

    const ctx = toPermissionContext([leafSigned, midSigned, ...parsed.chain]);
    expect(ctx).toHaveLength(3);
    const delegates = ctx.map((d) =>
      (d as { delegate: string }).delegate.toLowerCase(),
    );
    expect(delegates).toEqual(
      [RELAYER, WORKER, AGENT].map((a) => a.toLowerCase()),
    );
    expect((ctx[2] as { delegator: string }).delegator.toLowerCase()).toBe(
      USER.toLowerCase(),
    );
  });
});
