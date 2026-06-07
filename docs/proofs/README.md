# On-chain proofs

The load-bearing transactions behind "proven on-chain — not a mock." **Re-open every link before
submission** to confirm status / to / from / amounts / `getCode`. To capture fresh stdout, run e.g.
`CHAIN=base npm run prove | tee docs/proofs/mainnet-1shot.log` (the `*.log` files are git-ignored by
default; force-add the ones you want to pin).

Treasury / root EOA: **`0x1DC366A33BaA610eA5A60Ba549f619126e590601`** — EIP-7702-upgraded on Base **and**
Base Sepolia (`eth_getCode → 0xef010063c0c19a282a1b52b07dd5a65b58948a07dae32b`, the Stateless7702 impl).

| What | Network | Tx | gasUsed | Status |
|---|---|---|---|---|
| **1Shot mainnet redemption** | Base mainnet | [`0x0349304adead048d8392722e4b89b81914c42599f2fa250078ef0b1980c448bf`](https://basescan.org/tx/0x0349304adead048d8392722e4b89b81914c42599f2fa250078ef0b1980c448bf) | 304887 | 200 |
| **A2A redelegation chain** | Base Sepolia | [`0x24af8650b5690755e4dfad5d16947c06d753257348872c9bd73bbad8d6b2ae27`](https://sepolia.basescan.org/tx/0x24af8650b5690755e4dfad5d16947c06d753257348872c9bd73bbad8d6b2ae27) | 464459 | 200 |
| **x402 pay-per-call (7710)** | Base Sepolia | [`0xbbcecb7cbe662462794cf5cee1c7dcbf3eba22b9669e902f5b8bfb3b1272450b`](https://sepolia.basescan.org/tx/0xbbcecb7cbe662462794cf5cee1c7dcbf3eba22b9669e902f5b8bfb3b1272450b) | 304227 | 200 |
| **Agent City — Research agent buys Market-Data via x402** | Base Sepolia | [`0xc7df…c2b4`](https://sepolia.basescan.org/address/0x1DC366A33BaA610eA5A60Ba549f619126e590601) (see run log) | — | 200 |
| **Agent City — Analyst agent buys Sentiment via x402** | Base Sepolia | [`0x5b73…cb14`](https://sepolia.basescan.org/address/0x1DC366A33BaA610eA5A60Ba549f619126e590601) (see run log) | — | 200 |
| **City direct-transfer run (earlier)** | Base Sepolia | [`0xdc08d059bd2da569e49bbe58e41a127f79f574d4ffb1a27b650e2b904ae98781`](https://sepolia.basescan.org/tx/0xdc08d059bd2da569e49bbe58e41a127f79f574d4ffb1a27b650e2b904ae98781) · [`0xe5168741a18fc4d04e5a6560adcc6161351b73756732ab4c9ded55add61e764a`](https://sepolia.basescan.org/tx/0xe5168741a18fc4d04e5a6560adcc6161351b73756732ab4c9ded55add61e764a) | — | 200 |

The mainnet redemption moved the treasury USDC 2.00 → 1.99 (a ~0.01 USDC relayer fee, gas paid in USDC).
City runs each settle 2/2 worker payments of 0.05 USDC. Reproduce any of these with the matching
`npm run` command in the project README.

> Note: the two City x402 hashes above are abbreviated from a recorded run; capture the full hashes with
> `npm run city | tee docs/proofs/city-run.log` and update this table before submitting.
