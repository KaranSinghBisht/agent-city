/**
 * Fetch machine-verifiable, read-only proof artifacts for every load-bearing
 * transaction referenced in docs/proofs/README.md.
 *
 * Read-only: this script ONLY calls `eth_getTransactionReceipt` and `eth_getCode`
 * against public RPCs. It never signs, never spends, and needs no private key.
 * A file-only judge can run `npx tsx scripts/fetch-proofs.ts` and then verify the
 * on-chain claims from the committed docs/proofs/<label>.json files alone.
 *
 * For each tx it writes: txHash, network, status, blockNumber, gasUsed,
 * total log count, and the RedeemedDelegation-event count (DelegationManager
 * topic0). It also records `eth_getCode` for the treasury / EIP-7702 account on
 * each network — the `0xef0100…` prefix proves the 7702 upgrade.
 *
 * If any RPC call fails, the corresponding file is omitted and the failure is
 * logged to stderr — receipts are never fabricated.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { createPublicClient, http, type Hex } from "viem";

/** Public, key-less RPCs. */
const RPC = {
  "base-mainnet": "https://mainnet.base.org",
  "base-sepolia": "https://sepolia.base.org",
} as const;
type NetworkId = keyof typeof RPC;

/** Treasury / EIP-7702-upgraded root EOA (see docs/proofs/README.md). */
const TREASURY = "0x1DC366A33BaA610eA5A60Ba549f619126e590601" as Hex;

/** EIP-7702 delegation-designator prefix; full code is `0xef0100` + impl address. */
const EIP7702_PREFIX = "0xef0100";

/**
 * topic0 of DelegationManager `RedeemedDelegation`, from `@metamask/delegation-abis`
 * (bundled under @metamask/smart-accounts-kit). Verify it reproduces with:
 *
 *   node --input-type=module -e "import {abi} from '@metamask/smart-accounts-kit/node_modules/@metamask/delegation-abis/dist/abis/DelegationManager.mjs'; import {toEventSelector} from 'viem'; console.log(toEventSelector(abi.find(e=>e.name==='RedeemedDelegation')))"
 *
 * Hardcoded as a constant so this read-only script has no fragile deep-import.
 */
const REDEEMED_DELEGATION_TOPIC0 =
  "0x40dadaa36c6c2e3d7317e24757451ffb2d603d875f0ad5e92c5dd156573b1873" as Hex;

/**
 * One proof per row. `network` selects the RPC; `basescanHost` is asserted to
 * match the explorer link in docs/proofs/README.md so labels can never drift
 * away from the source-of-truth table.
 */
interface ProofSpec {
  label: string;
  txHash: Hex;
  network: NetworkId;
  basescanHost: "basescan.org" | "sepolia.basescan.org";
}

const PROOFS: ProofSpec[] = [
  {
    label: "mainnet-1shot-redemption",
    txHash: "0x0349304adead048d8392722e4b89b81914c42599f2fa250078ef0b1980c448bf",
    network: "base-mainnet",
    basescanHost: "basescan.org",
  },
  {
    label: "a2a-redelegation-chain",
    txHash: "0x24af8650b5690755e4dfad5d16947c06d753257348872c9bd73bbad8d6b2ae27",
    network: "base-sepolia",
    basescanHost: "sepolia.basescan.org",
  },
  {
    label: "x402-pay-per-call-7710",
    txHash: "0xbbcecb7cbe662462794cf5cee1c7dcbf3eba22b9669e902f5b8bfb3b1272450b",
    network: "base-sepolia",
    basescanHost: "sepolia.basescan.org",
  },
  {
    label: "erc7715-grant-redemption",
    txHash: "0xaa84871ebefcd49d61fa091c3ac9e77a5037e632ee588c3cacc38a42127c197b",
    network: "base-sepolia",
    basescanHost: "sepolia.basescan.org",
  },
  {
    label: "city-run-grant-research-x402",
    txHash: "0x99a42cac28c7e712cea4f72eabf9405e813b30cb4522fcba136669d7514c28d6",
    network: "base-sepolia",
    basescanHost: "sepolia.basescan.org",
  },
  {
    label: "city-run-grant-analyst-x402",
    txHash: "0x0ae293df761e5906b8aa02f0fcb95bf5d61606fb1aac28f19b5274b807cb3372",
    network: "base-sepolia",
    basescanHost: "sepolia.basescan.org",
  },
  {
    label: "city-direct-transfer-run-a",
    txHash: "0xdc08d059bd2da569e49bbe58e41a127f79f574d4ffb1a27b650e2b904ae98781",
    network: "base-sepolia",
    basescanHost: "sepolia.basescan.org",
  },
  {
    label: "city-direct-transfer-run-b",
    txHash: "0xe5168741a18fc4d04e5a6560adcc6161351b73756732ab4c9ded55add61e764a",
    network: "base-sepolia",
    basescanHost: "sepolia.basescan.org",
  },
];

const OUT_DIR = new URL("../docs/proofs/", import.meta.url);
const clients = {
  "base-mainnet": createPublicClient({ transport: http(RPC["base-mainnet"]) }),
  "base-sepolia": createPublicClient({ transport: http(RPC["base-sepolia"]) }),
} as const;

/** Assert every spec's hash + explorer host actually appears in the README. */
function assertSpecsMatchReadme(): void {
  const readme = readFileSync(new URL("README.md", OUT_DIR), "utf8");
  for (const spec of PROOFS) {
    const expected = `https://${spec.basescanHost}/tx/${spec.txHash}`;
    if (!readme.includes(expected)) {
      throw new Error(`README.md is missing the link this script claims to verify: ${expected}`);
    }
  }
}

function countRedeemedDelegations(logs: readonly { topics: readonly Hex[] }[]): number {
  return logs.filter((l) => l.topics[0] === REDEEMED_DELEGATION_TOPIC0).length;
}

interface ReceiptProof {
  label: string;
  txHash: Hex;
  network: NetworkId;
  explorer: string;
  status: "success" | "reverted";
  blockNumber: string;
  gasUsed: string;
  logCount: number;
  redeemedDelegationEvents: number;
  fetchedAt: string;
  rpc: string;
}

async function fetchReceiptProof(spec: ProofSpec): Promise<ReceiptProof> {
  const receipt = await clients[spec.network].getTransactionReceipt({ hash: spec.txHash });
  return {
    label: spec.label,
    txHash: spec.txHash,
    network: spec.network,
    explorer: `https://${spec.basescanHost}/tx/${spec.txHash}`,
    status: receipt.status,
    blockNumber: receipt.blockNumber.toString(),
    gasUsed: receipt.gasUsed.toString(),
    logCount: receipt.logs.length,
    redeemedDelegationEvents: countRedeemedDelegations(receipt.logs),
    fetchedAt: new Date().toISOString(),
    rpc: RPC[spec.network],
  };
}

interface AccountCodeProof {
  account: Hex;
  network: NetworkId;
  code: Hex;
  isEip7702Delegated: boolean;
  delegatedImplementation: Hex | null;
  fetchedAt: string;
  rpc: string;
}

async function fetchAccountCodeProof(network: NetworkId): Promise<AccountCodeProof> {
  const code = (await clients[network].getCode({ address: TREASURY })) ?? "0x";
  const isEip7702Delegated = code.toLowerCase().startsWith(EIP7702_PREFIX);
  return {
    account: TREASURY,
    network,
    code,
    isEip7702Delegated,
    delegatedImplementation: isEip7702Delegated ? (`0x${code.slice(EIP7702_PREFIX.length)}` as Hex) : null,
    fetchedAt: new Date().toISOString(),
    rpc: RPC[network],
  };
}

function write(label: string, data: unknown): void {
  const path = new URL(`${label}.json`, OUT_DIR);
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
  process.stdout.write(`wrote docs/proofs/${label}.json\n`);
}

async function main(): Promise<void> {
  assertSpecsMatchReadme();
  mkdirSync(OUT_DIR, { recursive: true });

  let failures = 0;

  // EIP-7702 getCode proof for the treasury on each network.
  for (const network of Object.keys(RPC) as NetworkId[]) {
    try {
      const proof = await fetchAccountCodeProof(network);
      write(`account-code-${network}`, proof);
      if (!proof.isEip7702Delegated) {
        process.stderr.write(`warning: ${network} treasury code is not 7702-delegated (${proof.code})\n`);
      }
    } catch (err) {
      failures += 1;
      process.stderr.write(`getCode failed on ${network}: ${(err as Error).message} — file omitted\n`);
    }
  }

  // One receipt proof per load-bearing transaction.
  for (const spec of PROOFS) {
    try {
      const proof = await fetchReceiptProof(spec);
      write(spec.label, proof);
      if (proof.status !== "success") {
        process.stderr.write(`warning: ${spec.label} status is ${proof.status}\n`);
      }
    } catch (err) {
      failures += 1;
      process.stderr.write(`receipt fetch failed for ${spec.label} (${spec.txHash}): ${(err as Error).message} — file omitted\n`);
    }
  }

  if (failures > 0) {
    process.stderr.write(`\n${failures} proof(s) could not be fetched and were omitted (no receipt fabricated).\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`\nAll ${PROOFS.length} receipts + 2 account-code proofs written to docs/proofs/.\n`);
}

main().catch((err) => {
  process.stderr.write(`fatal: ${(err as Error).message}\n`);
  process.exitCode = 1;
});
