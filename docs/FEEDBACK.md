# Developer feedback — MetaMask Smart Accounts × 1Shot × Venice

Grounded feedback from building **Steward** end-to-end and redeeming real delegations on **Base Sepolia
and Base mainnet** (not a mock). Each point below cost real debugging time, so each is a concrete fix.

---

## 1Shot permissionless relayer

**What worked great**
- A genuinely permissionless, keyless relayer where **gas is paid in USDC** is a killer primitive for agents.
  No paymaster, no API key, no native ETH — our signer held only USDC and still settled on mainnet.
- The estimate → send price-lock (`context`) flow is a clean way to quote fees deterministically.

**Friction / suggested fixes**
1. **`getStatus.hash` is always empty — the tx hash is in `receipt.transactionHash`.** This bit us twice.
   Either populate `.hash`, or document that `hash` is a placeholder and callers must read `receipt`.
2. **`receipt.blockHash` / `receipt.blockNumber` come back `0x000…0` / `null` even on a `200` (success).**
   Only `transactionHash`, `gasUsed`, and `logs` are populated. Surprising for anyone verifying inclusion.
3. **`permissionContext` must be structured signed-delegation JSON (`toRelayerJson`), not `encodeDelegations`
   hex.** The natural assumption (pass the encoded delegation bytes) is wrong and fails opaquely. One
   worked example in the docs would save hours.
4. **The delegate `to` must be the relayer's `targetAddress` from `getCapabilities`** — i.e. you delegate to
   the *relayer's* redemption account, not the worker. Non-obvious; worth stating loudly up front.
5. **Every bundle needs a manual fee transfer to `feeCollector` (≥ `minFee`)**, and the relayer infers the
   gas token from that leg. Easy to omit; the error when you do isn't self-explanatory.
6. **Only one `authorizationList` entry per request.** This blocks upgrading two fresh EOAs in one tx (e.g. a
   full A2A chain with a brand-new principal *and* manager). We worked around it by pre-upgrading the principal.
7. **Testnet is `relayer.1shotapi.dev`, mainnet is `relayer.1shotapi.com`.** A single base URL with a network
   param, or a prominent callout, would prevent silent "no capabilities for chain" failures.

## MetaMask Smart Accounts Kit (`@metamask/smart-accounts-kit`)

**What worked great**
- `ScopeType.Erc20TransferAmount` + redelegation via `parentDelegation` made a capped manager→worker
  sub-budget trivial to express — the chain enforces the *narrower* cap automatically. This is the whole
  product thesis and it Just Worked once wired correctly.
- EIP-7702 upgrade-in-place via `signAuthorization` is elegant; the impl address is stable across
  Base / Base Sepolia / Sepolia (`0x63c0…dae32b`).

**Friction / suggested fixes**
1. **`Implementation.Stateless7702` (with an `address:` param) vs `Hybrid` (with `deployParams`) wasn't
   obvious.** Most examples lean Hybrid; for the 7702 relayer path you need Stateless7702, and discovering
   that was trial-and-error. A "which Implementation do I want?" decision table would help a lot.
2. **Redemption requires the delegation chain ordered leaf→root (`[child, …, parent]`).** Getting the order
   wrong fails late and unclearly. Worth a one-line note next to `createDelegation`/`signDelegation`.

## Venice AI

**What worked great**
- A `privacy: private`, zero-retention reasoning model (`zai-org-glm-4.7`) is exactly right for a treasury
  agent — strategy never becomes training data. This is a real differentiator vs. mainstream LLM APIs.
- **Crypto-RPC (`/crypto/rpc/{network}`)** letting the agent read the chain *through Venice* is underrated —
  it collapses "private reasoning" and "on-chain context" into one trusted dependency.

**Friction / suggested fixes**
1. **Reasoning models emit thinking tokens that break JSON parsing.** We had to append a `disable_thinking`
   suffix to get clean structured output. Documenting this (or a `response_format: json` that suppresses
   it) would smooth agent use a lot.
2. **`privacy: private` ≠ TEE/E2EE.** The trait name reads stronger than it is (it's zero-retention, not
   confidential compute). Clearer trait naming / a capabilities note would set correct expectations.
3. **Crypto-RPC network slugs (`base-mainnet`, `base-sepolia`, `ethereum-sepolia`) had to be discovered.**
   A list in the docs (and surfacing them via an endpoint) would help.

---

*All claims above are reproducible from this repo: `npm run prove` (testnet + `CHAIN=base` mainnet),
`npm run prove:a2a`, `npm run prove:x402`, `npm run demo`.*
