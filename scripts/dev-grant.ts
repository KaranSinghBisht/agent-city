/**
 * Post a SYNTHETIC ERC-7715 grant to a running dev server, so the grant-active
 * city flow can be exercised end-to-end without MetaMask Flask. The grant is
 * signed by the .env signer in MetaMask's exact wire format (erc20-token-periodic
 * scope, `encodeDelegations` context) and validated by the same /city/grant
 * boundary a real browser grant goes through.
 *
 * Usage:  npm run dev          # terminal 1
 *         npm run grant:dev    # terminal 2 — then dispatch at /app
 */
import { parseUnits } from "viem";

import { createDelegation, ScopeType } from "@metamask/smart-accounts-kit";
import { encodeDelegations } from "@metamask/smart-accounts-kit/utils";

import { randomSalt } from "../src/delegation/delegation.js";
import type { SignedDelegation } from "../src/delegation/redeem.js";
import { createPrincipalAccount } from "../src/delegation/smartAccount.js";

const BASE = process.env.APP_URL ?? "http://localhost:8787";

const log = (m: string): void => {
  process.stdout.write(m + "\n");
};

async function main(): Promise<void> {
  const cfg = (await (await fetch(`${BASE}/city/config`)).json()) as {
    chainId?: string;
    usdc?: `0x${string}`;
    agent?: `0x${string}`;
    error?: string;
  };
  if (!cfg.agent || !cfg.usdc) {
    throw new Error(`city config unavailable: ${cfg.error ?? "is the dev server running?"}`);
  }
  log(`City agent ${cfg.agent} · USDC ${cfg.usdc} · chain ${cfg.chainId}`);

  // The signer plays the granting wallet (it IS the agent account here — a
  // self-grant — which keeps the demo funded by the same treasury).
  const user = await createPrincipalAccount();
  const grant = createDelegation({
    to: cfg.agent,
    from: user.account.address,
    environment: user.account.environment,
    salt: randomSalt(),
    scope: {
      type: ScopeType.Erc20PeriodTransfer,
      tokenAddress: cfg.usdc,
      periodAmount: parseUnits("5", 6),
      periodDuration: 86_400,
      startDate: Math.floor(Date.now() / 1000) - 60,
    },
  });
  const signature = await user.account.signDelegation({ delegation: grant });
  const context = encodeDelegations([{ ...grant, signature } as SignedDelegation]);

  const res = await fetch(`${BASE}/city/grant`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ granted: [{ context }], account: user.account.address }),
  });
  const body = (await res.json()) as {
    ok: boolean;
    delegator?: string;
    links?: number;
    error?: string;
  };
  if (!res.ok || !body.ok) throw new Error(`grant rejected: ${body.error}`);
  log(
    `✅ Grant accepted — ${body.links}-link chain, delegator ${body.delegator}. ` +
      `City runs now chain under it (see /app).`,
  );
}

main().catch((err: unknown) => {
  process.stderr.write(`dev-grant failed: ${(err as Error).message}\n`);
  process.exitCode = 1;
});
