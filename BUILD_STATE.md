# BUILD STATE — Steward (MetaMask Cook-Off)

> Today 2026-06-06. **Deadline: June 15, 2026, 10:59 UTC** (~3:59 AM PT) — ~9 days.
> **Decisions (locked):** finish Steward (don't rebuild) · go **deep on the spine**
> (Best Agent + Best Venice + Best 1Shot ≈ up to $7k stacked) · creds available.
> Concept: Steward = a bounded AI workforce where the **MetaMask delegation IS the product**.

## ✅✅ SPINE COMPLETE & PROVEN ON-CHAIN (2026-06-06)
`npm run demo` runs the WHOLE product end-to-end and confirms on Base Sepolia: Venice reads the treasury
balance through its own **Crypto-RPC** → private **GLM 4.7** proposes a spend → **policy gate + human approval**
→ **1Shot relayer** redemption (USDC gas, EIP-7702) → **status 200 confirmed** (taskId `0x46bfbd10…96ae5`).
Every scoring track is exercised in one run. typecheck clean, 41/41 unit tests. ✅ `npm run dev` = LIVE web
dashboard (live banner, Venice on-chain context, approval gate, 1Shot tx status + Basescan link; keyless
DryRun fallback). ✅ webhook verifier (Ed25519/JWKS, `src/webhook.ts`). Remaining =
demo video (user records; `docs/DEMO_SCRIPT.md`) + HackQuest submit (MCP loaded). ✅ Mainnet 1Shot proven — see below.

## ✅✅ A2A REDELEGATION PROVEN ON-CHAIN (2026-06-07)
`npm run prove:a2a` (`scripts/prove-redelegation.ts`) redeems a **2-link redelegation chain** on Base
Sepolia: principal `0x1DC3…0601` →(root, ≤1 USDC)→ a fresh manager `0x0A1a…F620` →(redelegation, ≤0.5
USDC)→ the relayer `targetAddress`. Status **200**, tx
`0x24af8650b5690755e4dfad5d16947c06d753257348872c9bd73bbad8d6b2ae27`, gasUsed 464459.
**Independently verified:** the manager EOA was EIP-7702-upgraded on-chain (`getCode → 0xef0100…dae32b`),
consuming the single allowed `authorizationList` slot (the principal was already upgraded), and the
`RedeemedDelegation` events show BOTH links with their on-chain caps — root (`0xfff…fff` authority) @ 1.0
USDC and child (non-root authority `0x995d55…`) @ 0.5 USDC, the narrower sub-budget enforced by the chain
itself. The manager needs **zero funds/gas** (it only signs the auth + the delegation); tokens move from
the principal (root delegator) and gas is paid in USDC. This is the **Best A2A Coordination** primitive,
proven — not mocked. Reuses the same `DelegatedExecutor` + `staticResolver` path as the EIP-7715 browser demo.

## ✅✅ x402 + ERC-7710 PROVEN ON-CHAIN (2026-06-07)
`npm run prove:x402` (`scripts/prove-x402.ts`) stands up a real localhost **HTTP 402** paid endpoint and
pays it end-to-end on Base Sepolia: `X402Client` GETs the resource → 402 challenge → `DelegatedPayer`
settles the 0.05 USDC price as an **ERC-7710 redemption** through the same `DelegatedExecutor` → 1Shot
(gas in USDC) → client retries with `X-PAYMENT` → **200 + resource**. Status **200**, tx
`0xbbcecb7cbe662462794cf5cee1c7dcbf3eba22b9669e902f5b8bfb3b1272450b`, gasUsed 304227. **Self-verifying:**
a FRESH service address received exactly 50000 base units (0.05 USDC) on-chain. Key point: x402 was never
stale — `DelegatedPayer` depends only on the `Executor` interface, so the Jun-6 adapter rewrite applied to
it for free; it was simply never run live (unit tests inject `DryRunExecutor`). Settlement scheme is the
7710 redemption (the track thesis), not canonical Coinbase x402 (EIP-3009) — flagged honestly in the README.

## ✅✅ 1SHOT MAINNET REDEMPTION PROVEN (2026-06-07)
`CHAIN=base npm run prove` redeemed a scoped USDC delegation on **Base mainnet (8453)** through the 1Shot
permissionless relayer (`relayer.1shotapi.com`). Status **200**, tx
`0x0349304adead048d8392722e4b89b81914c42599f2fa250078ef0b1980c448bf`, gasUsed 304887. The signer
`0x1DC3…0601` was EIP-7702-upgraded **on mainnet** (`getCode → 0xef010063c0c19a…dae32b`) via the single
authorizationList slot; `RedeemedDelegation` emitted; gas paid in USDC (funded 2.0 → 1.99 = a 0.01 USDC
fee; the 0.1 work transfer was to-self / net-zero). targetAddress `0x26a5…199a`, feeCollector `0xE936…7604`.
This flips the last open on-chain item — **Best 1Shot ($1k) is now proven on mainnet**, not just testnet.
> Funding note: AgentCash can NOT fund an external signer (its `bridge` only moves between your own
> base/tempo/solana wallets; `fetch` only pays x402 APIs) — the signer was funded with 2 USDC from MetaMask.

## ⚠️ Reality check (corrects the earlier "all 5 tracks done, 30/30 green")
The 30/30 unit tests pass but **mock the network and assert the code's own (wrong) shapes**.
Verified against the authoritative 1Shot skill (`.agents/skills/public-relayer/`), the
delegation+relayer **adapter targets the wrong contract**. The agent brain, policy gate, Venice
client, x402 layer, and UI are sound — only the adapter needs a rewrite.

### The real 1Shot contract (source of truth: `.agents/skills/public-relayer/`)
- **Endpoints split by network:** testnet (84532 / 11155111) → `https://relayer.1shotapi.dev/relayers`;
  mainnet → `https://relayer.1shotapi.com/relayers`. (So we de-risk free on Base Sepolia first.)
- **Smart account = `Implementation.Stateless7702`** with `address:` param (NOT `Hybrid` + deployParams).
- **Delegation `to:` MUST be the relayer `targetAddress`** from `relayer_getCapabilities` — the relayer
  is the on-chain delegate. Fresh 32-byte `salt` per delegation.
- **`permissionContext` = array of structured signed delegations via `toRelayerJson()`** (NOT
  `encodeDelegations` hex).
- **Bundle:** `transactions:[{ permissionContext, executions }]`; `executions:[{ target, value, data }]`
  MUST include a **fee transfer to `feeCollector` (≥ `minFee`)** — the relayer reads it to pick the gas
  token — plus the work transfer; one delegation scoped to `feeAmount + workAmount`.
- **Flow:** getCapabilities → `relayer_estimate7710Transaction` (mock fee) → if `requiredPaymentAmount`
  ≠ mock, rebuild + re-sign → `relayer_send7710Transaction` with `context` (price-lock ~45s) → status via
  **webhook (`destinationUrl`, Ed25519 verified against `/.well-known/jwks.json`)** preferred over
  `relayer_getStatus({ id, logs })`. Statuses: 100/110/200/400/500. Run delegation bigints through `toRelayerJson`.
- **7702 upgrade:** `authorizationList` (≤1 entry) via
  `owner.signAuthorization({ chainId, contractAddress: env.implementations.EIP7702StatelessDeleGatorImpl, nonce })`.
  That impl address = **`0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B`** (same on Base / Base Sepolia / Sepolia).

## ✅ Done
- Verified the MetaMask SDK surface the code uses is REAL (exports exist in `@metamask/smart-accounts-kit@1.6.0`).
- Pulled the authoritative 1Shot skill → exact contract documented above.
- Foundation: `src/relayerJson.ts` (`toRelayerJson`) + `src/chains.ts` (per-network `relayerUrl`, Base
  mainnet, `isTestnet`).
- HackQuest MCP added (local config, `✓ Connected`) — **restart Claude Code to load its tools**
  (`projects:read/write/submit`, `opportunities:register`).

## ✅ Adapter rewrite DONE (typecheck clean, 34/34 green) — task #2
Rewrote to the real contract: `relayer.ts` (real method/payload shapes) · `smartAccount.ts`
(Stateless7702 + `buildUpgradeAuthorization`/`isUpgraded`) · `delegation.ts` (salt, `to=targetAddress`) ·
`redeem.ts` (`Execution7710 {target,…}` + `toPermissionContext` via `toRelayerJson`, dropped `encodeDelegations`) ·
`executor.ts` (estimate-first + mandatory fee leg) · `prove-delegation.ts` · all 4 mocked tests realigned.
**Key design:** the executor is path-agnostic via a `ContextResolver` — `signingResolver(account)` for the
local/prove path (signs a fresh scoped delegation per redemption), `staticResolver(grantedContext)` for the
EIP-7715 browser demo (reuses the wallet-granted periodic budget). tsc passing also validates the real SDK
call shapes (Stateless7702 account, `signAuthorization`, scoped `createDelegation`) — what the old hand-typed
relayer client hid.
**Honest scope:** unit tests still mock the relayer, so this proves correct *request shapes* + SDK types, NOT
the live on-chain round-trip. That is the prove run below.

## 🔜 Then (spine order)
1. ✅ **THE GATE PASSED — Base Sepolia, 2026-06-06.** `npm run prove` confirmed on-chain: status 200,
   two `RedeemedDelegation` events, gasUsed 292387. Independently verified — EOA
   `0x1DC366A33BaA610eA5A60Ba549f619126e590601` is EIP-7702 delegated to the stateless impl
   (`code 0xef0100…dae32b`) and USDC 20 → 19.99 (fee paid in USDC). taskId
   `0x651c8a2d43f419d98756064f433ffc7c6d38af276731a995d241ab9f9276b35d`.
   ▶ ✅ DONE — **Base mainnet** run proven 2026-06-07: status 200, tx `0x0349…448bf` (signer 7702-upgraded on mainnet, 0.01 USDC fee).
2. **1Shot track:** webhook receiver (Ed25519 / JWKS) as the tx-status source (low competition, rewarded).
3. **Demo = EIP-7715 browser flow** (MetaMask grants an `erc20-token-periodic` budget → agent redeems via
   relayer). This is the judging hard gate: "Advanced Permissions in the **main flow**."
4. ✅ **Venice brain LIVE & proven** — key set in `.env`, model pinned to `zai-org-glm-4.7`
   (privacy:private, zero-retention; NOT TEE/E2EE). Real agent loop confirmed end-to-end
   (propose→policy→approval→execute→finalize, clean JSON via the `disable_thinking` suffix).
   `src/veniceRpc.ts` Crypto-RPC client built + tested (37/37). ▶ Remaining: feed `/crypto/rpc`
   balance reads into the agent's context (the multi-endpoint differentiator) + optional x402-pay-for-inference.
5. **Submit:** ≤3-min demo video, architecture diagram, README, register + submit on HackQuest before deadline.
   Free EV: build thread tagging @MetaMaskDev (Best Social), tooling feedback (Best Feedback).

## 🙋 Human (Karan) — creds (full checklist in chat)
Testnet first: Venice key + ~$5 · throwaway pk · Base Sepolia RPC + test USDC (Circle faucet).
Then mainnet: Base mainnet RPC + ~$3–5 USDC → 1Shot prize run. Register on HackQuest. MetaMask Flask for the 7715 demo.
