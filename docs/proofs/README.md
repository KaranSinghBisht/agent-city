# On-chain proofs

The load-bearing transactions behind "proven on-chain — not a mock."

**Verify it yourself, no explorer key needed.** Every row below has a committed, machine-readable
receipt next to this file (`docs/proofs/<label>.json`), fetched read-only from the public Base RPCs.
Regenerate them any time with:

```
npx tsx scripts/fetch-proofs.ts
```

That script only calls `eth_getTransactionReceipt` and `eth_getCode` (no signing, no spending, no
private key) and writes one JSON per tx plus an `account-code-<network>.json` for the treasury. Each
receipt JSON records `status`, `blockNumber`, `gasUsed`, `logCount`, and `redeemedDelegationEvents`
(count of DelegationManager `RedeemedDelegation` logs, topic0
`0x40dadaa3…573b1873`). If an RPC call fails the script omits that file and exits non-zero — it never
fabricates a receipt. `*.log` capture files (e.g. `npm run prove | tee docs/proofs/mainnet-1shot.log`)
stay git-ignored; the `*.json` receipts are committed on purpose.

Treasury / root EOA: **`0x1DC366A33BaA610eA5A60Ba549f619126e590601`** — EIP-7702-upgraded on Base **and**
Base Sepolia (`eth_getCode → 0xef010063c0c19a282a1b52b07dd5a65b58948a07dae32b`, the Stateless7702 impl).
The `0xef0100` prefix is the EIP-7702 delegation designator; the trailing 20 bytes are the impl address.
Committed getCode proofs: [base-mainnet](./account-code-base-mainnet.json) ·
[base-sepolia](./account-code-base-sepolia.json).

`gasUsed` and `RedeemedDelegation` counts below were read from chain by `fetch-proofs.ts`; `Status`
shows the receipt `status` (`success` = on-chain `0x1`). "Receipt" links the committed JSON.

| What | Network | Tx | gasUsed | RedeemedDelegation logs | Status | Receipt |
|---|---|---|---|---|---|---|
| **1Shot mainnet redemption** | Base mainnet | [`0x0349304adead048d8392722e4b89b81914c42599f2fa250078ef0b1980c448bf`](https://basescan.org/tx/0x0349304adead048d8392722e4b89b81914c42599f2fa250078ef0b1980c448bf) | 304887 | 4 | success | [json](./mainnet-1shot-redemption.json) |
| **A2A redelegation chain** | Base Sepolia | [`0x24af8650b5690755e4dfad5d16947c06d753257348872c9bd73bbad8d6b2ae27`](https://sepolia.basescan.org/tx/0x24af8650b5690755e4dfad5d16947c06d753257348872c9bd73bbad8d6b2ae27) | 464459 | 6 | success | [json](./a2a-redelegation-chain.json) |
| **x402 pay-per-call (7710)** | Base Sepolia | [`0xbbcecb7cbe662462794cf5cee1c7dcbf3eba22b9669e902f5b8bfb3b1272450b`](https://sepolia.basescan.org/tx/0xbbcecb7cbe662462794cf5cee1c7dcbf3eba22b9669e902f5b8bfb3b1272450b) | 304227 | 4 | success | [json](./x402-pay-per-call-7710.json) |
| **ERC-7715 bridge — redeemed UNDER a granted `erc20-token-periodic` context** (`npm run prove:grant`) | Base Sepolia | [`0xaa84871ebefcd49d61fa091c3ac9e77a5037e632ee588c3cacc38a42127c197b`](https://sepolia.basescan.org/tx/0xaa84871ebefcd49d61fa091c3ac9e77a5037e632ee588c3cacc38a42127c197b) | 564488 | 6 | success | [json](./erc7715-grant-redemption.json) |
| **City run UNDER the grant — Research agent buys Market-Data via x402** (3-link chain: grant → manager→worker → worker→relayer, + Venice reasoning) | Base Sepolia | [`0x99a42cac28c7e712cea4f72eabf9405e813b30cb4522fcba136669d7514c28d6`](https://sepolia.basescan.org/tx/0x99a42cac28c7e712cea4f72eabf9405e813b30cb4522fcba136669d7514c28d6) | 743600 | 8 | success | [json](./city-run-grant-research-x402.json) |
| **City run UNDER the grant — Analyst agent buys Sentiment via x402** | Base Sepolia | [`0x0ae293df761e5906b8aa02f0fcb95bf5d61606fb1aac28f19b5274b807cb3372`](https://sepolia.basescan.org/tx/0x0ae293df761e5906b8aa02f0fcb95bf5d61606fb1aac28f19b5274b807cb3372) | 646122 | 8 | success | [json](./city-run-grant-analyst-x402.json) |
| **City direct-transfer run (earlier)** | Base Sepolia | [`0xdc08d059bd2da569e49bbe58e41a127f79f574d4ffb1a27b650e2b904ae98781`](https://sepolia.basescan.org/tx/0xdc08d059bd2da569e49bbe58e41a127f79f574d4ffb1a27b650e2b904ae98781) · [`0xe5168741a18fc4d04e5a6560adcc6161351b73756732ab4c9ded55add61e764a`](https://sepolia.basescan.org/tx/0xe5168741a18fc4d04e5a6560adcc6161351b73756732ab4c9ded55add61e764a) | 486371 · 486395 | 6 · 6 | success | [a](./city-direct-transfer-run-a.json) · [b](./city-direct-transfer-run-b.json) |

The mainnet redemption moved the treasury USDC 2.00 → 1.99 (a ~0.01 USDC relayer fee, gas paid in USDC).
City runs each settle 2/2 worker payments of 0.05 USDC. Reproduce any of these with the matching
`npm run` command in the project README.

The two "City run UNDER the grant" rows came from the full web flow (2026-06-10): a synthetic ERC-7715
grant in MetaMask's wire format POSTed to `/city/grant` (`npm run grant:dev`), validated + decoded by
`parseGrant`, then `/city/run` dispatched — `authorityRoot: "grant"`, both workers settled, each with a
Venice purchase-reasoning line in the ledger.
