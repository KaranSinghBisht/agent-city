/**
 * Local demo server. Boots LIVE (real Venice reasoning + on-chain 1Shot execution
 * via the principal signer) when .env has the creds; otherwise falls back to a
 * keyless dry-run so the UI still runs offline. Run: npm run dev -> :8787
 */
import { serve } from "@hono/node-server";

import { DryRunExecutor } from "./agent/dryRunExecutor.js";
import type { Policy } from "./agent/policy.js";
import { createApi, type ApiDeps } from "./api.js";
import { resolveChain } from "./chains.js";
import { config } from "./config.js";
import { createLiveSteward } from "./live.js";
import { VeniceReasoner } from "./venice.js";

async function buildDeps(): Promise<ApiDeps> {
  try {
    const live = await createLiveSteward();
    process.stdout.write(
      `LIVE mode — treasury ${live.account.address} on ${config.chainName}\n`,
    );
    const explorerTxBase = resolveChain(config.chainName).isTestnet
      ? "https://sepolia.basescan.org/tx/"
      : "https://basescan.org/tx/";
    return {
      reasoner: live.reasoner,
      executor: live.executor,
      policy: live.policy,
      contextProvider: live.onchainContext,
      statusChecker: async (taskId: string) => {
        const s = await live.relayer.getStatus(taskId as `0x${string}`);
        const receiptHash = (
          s.receipt as { transactionHash?: string } | undefined
        )?.transactionHash;
        return { status: s.status, hash: s.hash || receiptHash };
      },
      info: {
        mode: "live",
        network: config.chainName,
        treasury: live.account.address,
        payee: live.owner.address,
        explorerTxBase,
      },
    };
  } catch (err) {
    process.stdout.write(
      `DRY-RUN mode (no live creds: ${(err as Error).message})\n`,
    );
    const { usdc } = resolveChain(config.chainName);
    const policy: Policy = {
      token: usdc,
      maxPerTx: 1_000_000n,
      maxPerDay: 5_000_000n,
      allowedTargets: new Set([usdc.toLowerCase()]),
    };
    return {
      reasoner: new VeniceReasoner(),
      executor: new DryRunExecutor(),
      policy,
      info: { mode: "dry-run", network: config.chainName },
    };
  }
}

buildDeps().then((deps) => {
  const app = createApi(deps);
  serve({ fetch: app.fetch, port: 8787 }, (i) => {
    process.stdout.write(`Steward on http://localhost:${i.port}\n`);
  });
});
