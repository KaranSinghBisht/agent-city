# JUDGES.md — evidence map (Agent City)

A machine-readable map from each track/sponsor claim to its **source** (file + symbol),
a **runnable verify command**, and the **on-chain transaction or committed artifact** that backs it.
One section per track. Every claim here is written to match the code; known limitations are stated
plainly in each section and collected at the bottom.

- **Project:** Agent City — a spending firewall for autonomous AI agents.
- **Networks proven:** Base mainnet (8453) and Base Sepolia (84532).
- **Treasury / EIP-7702 root EOA:** `0x1DC366A33BaA610eA5A60Ba549f619126e590601`
- **Tests:** 57 across 13 files (`npm test`).
- **Typecheck:** `npm run typecheck` (tsc --noEmit, clean).

## Conventions

- **SOURCE** names a file plus a function/class/constant so it survives line drift.
- **VERIFY** commands are copy-pasteable. The pure-read ones (`grep`, `npm test`,
  `npx tsx scripts/fetch-proofs.ts`) need **no private key and no explorer key**.
  The `npm run prove*` / `npm run city` commands move real (sub-cent) USDC and need a funded
  `.env` (`RPC_URL`, `SIGNER_PRIVATE_KEY`, `VENICE_API_KEY`, `CHAIN`).
- **ON-CHAIN / ARTIFACT** points at a tx hash and the committed receipt JSON under `docs/proofs/`.
  `docs/proofs/*.json` are kept in-tree on purpose (un-ignored in `.gitignore`); regenerate or
  verify them from a clean checkout with `npx tsx scripts/fetch-proofs.ts`, which only calls
  `eth_getTransactionReceipt` / `eth_getCode` against public Base RPCs and never fabricates a file.

---

## MetaMask Smart Accounts — Smart Account + ERC-7710 delegation redemption

**CLAIM.** Every spend is a MetaMask Smart Account (`Implementation.Stateless7702`) ERC-7710
delegation redemption. A scoped `Erc20TransferAmount` delegation is the on-chain budget cap; the
1Shot relayer is the on-chain delegate that performs `redeemDelegations`.

**SOURCE.**
- Smart account (EIP-7702 in-place upgrade): `src/delegation/smartAccount.ts` —
  `createSmartAccountFromKey`, `createPrincipalAccount`, `isUpgraded`.
- Scoped budget delegation: `src/delegation/delegation.ts` — `buildBudgetDelegation`
  (`ScopeType.Erc20TransferAmount`).
- Permission context + executions the relayer redeems: `src/delegation/redeem.ts` —
  `toPermissionContext`, `buildTransferExecution`.
- Redemption path: `src/delegation/executor.ts` — `DelegatedExecutor.execute`
  (getCapabilities → estimate → send), `signingResolver`, `staticResolver`.

**VERIFY.**
```
npm test -- src/delegation/executor.test.ts src/delegation/redeem.test.ts
npm run prove        # signs a scoped delegation and redeems a 0.1 USDC transfer via 1Shot
```

**ON-CHAIN / ARTIFACT.** Base mainnet redemption
`0x0349304adead048d8392722e4b89b81914c42599f2fa250078ef0b1980c448bf`
(`docs/proofs/mainnet-1shot-redemption.json`, status success, 4 `RedeemedDelegation` events).
Treasury 7702 upgrade proof: `docs/proofs/account-code-base-mainnet.json` /
`account-code-base-sepolia.json` (`getCode` → `0xef0100…` designator).

---

## MetaMask Advanced Permissions — ERC-7715 grant bridge

**CLAIM.** A browser ERC-7715 Advanced-Permissions grant (`erc20-token-periodic`) is accepted at the
app boundary, its hex `context` validated and decoded with the Kit's `decodeDelegations`, and every
city payment then chains UNDER the grant so the city spends the **granting wallet's** funds, bounded
by the periodic enforcer.

**SOURCE.**
- Grant boundary (HTTP): `src/api.ts` — `POST /city/grant` handler, which calls `parseGrant`; the
  decoded grant is stored as `activeGrant` and threaded into each run via `grantChain` on
  `POST /city/run`.
- Validation + decode: `src/delegation/grantBridge.ts` — `parseGrant`, `findContext`, `isSigned`
  (hard caps on size/depth; requires the leaf to be delegated to the city agent; fully-signed chain).
- Chaining under the grant: `src/city/orchestrator.ts` — `buildSubBudget`
  (`grantChain[0]` becomes the parent of the principal's link).

**VERIFY.**
```
npm test -- src/delegation/grantBridge.test.ts
npm run prove:grant  # signs a grant in MetaMask's exact wire format (Kit encodeDelegations),
                     # runs it through the SAME parseGrant boundary, redeems UNDER it on-chain
```

**ON-CHAIN / ARTIFACT.** Redemption under a granted periodic context
`0xaa84871ebefcd49d61fa091c3ac9e77a5037e632ee588c3cacc38a42127c197b`
(`docs/proofs/erc7715-grant-redemption.json`, 6 `RedeemedDelegation` events). Full web flow under a
grant (`authorityRoot: "grant"`): `docs/proofs/city-run-grant-research-x402.json` (tx
`0x99a4…c28d6`) and `city-run-grant-analyst-x402.json` (tx `0x0ae2…3372`).

**KNOWN LIMITATION (stated honestly).** `prove:grant` and the `npm run grant:dev` flow sign the grant
with a local key in MetaMask's exact wire format and flow through the same `parseGrant` boundary a
real browser grant uses. We have **not** run the interactive MetaMask **Flask** popup end-to-end; the
popup produces the same context shape but is not part of a captured run. See README "MetaMask
integration — honest status."

---

## EIP-7702 — gasless upgrade-in-place

**CLAIM.** The signer EOA is upgraded in place to a stateless 7702 delegator, so the smart-account
address equals the EOA address, and the relayer redeems with at most one `authorizationList` entry.

**SOURCE.** `src/delegation/smartAccount.ts` — `buildUpgradeAuthorization` (`owner.signAuthorization`),
`isUpgraded` (matches `0xef0100` + impl), `impl7702`. Authorization is attached in
`src/delegation/executor.ts` — `DelegatedExecutor.execute` (`authorizationList`).

**VERIFY.**
```
npx tsx scripts/fetch-proofs.ts   # writes account-code-*.json from public RPC getCode (no key)
grep -n "ef0100" docs/proofs/account-code-base-mainnet.json
```

**ON-CHAIN / ARTIFACT.** `docs/proofs/account-code-base-mainnet.json` and
`account-code-base-sepolia.json` — `isEip7702Delegated: true`, `delegatedImplementation`
`0x63c0c19a282a1b52b07dd5a65b58948a07dae32b`.

---

## 1Shot API — permissionless relayer + signed-webhook status

**CLAIM (relayer).** Settlement is gasless through the 1Shot permissionless JSON-RPC relayer (no API
key, gas paid in USDC), via `getCapabilities → estimate7710Transaction → send7710Transaction →
getStatus`.

**SOURCE (relayer).** `src/relayer.ts` — `OneShotRelayer` (`getCapabilities`, `estimate`, `send`,
`getStatus`). Endpoint split by network: `src/chains.ts` — `MAINNET_RELAYER` / `TESTNET_RELAYER`.

**VERIFY (relayer).**
```
npm test -- src/relayer.test.ts   # request-building unit-tested with an injected fetcher
npm run prove                     # full estimate→send→getStatus to a 200 terminal status
```

**ON-CHAIN / ARTIFACT (relayer).** Base mainnet tx
`0x0349304adead048d8392722e4b89b81914c42599f2fa250078ef0b1980c448bf`
(`docs/proofs/mainnet-1shot-redemption.json`).

**CLAIM (webhook).** A 1Shot relayer webhook receiver verifies Ed25519/JWKS-signed status events and
feeds a PUSH-first inbox that `settle()` reads before polling. When a public callback URL is
configured the relayer is told where to POST; otherwise the orchestrator falls back to polling.

**SOURCE (webhook).**
- Signature verify: `src/webhook.ts` — `RelayerWebhookVerifier.verify` (canonical JSON sans
  `signature`, JWKS at `relayer.1shotapi.com/.well-known/jwks.json`, key-rotation refresh).
- Receiver + inbox: `src/api.ts` — `POST /webhooks/1shot` (rejects forged sigs with 401);
  `src/city/webhookInbox.ts` — `WebhookInbox.record` / `lookup`.
- PUSH-first read: `src/city/orchestrator.ts` — `settle` (reads `inbox.lookup` before
  `relayer.getStatus`).
- Outbound `destinationUrl`: `src/city/orchestrator.ts` — `hireAndPay` sets it from
  `config.webhookPublicUrl` (`src/config.ts` → env `WEBHOOK_PUBLIC_URL`); plumbed through
  `src/delegation/executor.ts` → `src/relayer.ts` `Send7710Params.destinationUrl`.

**VERIFY (webhook).**
```
npm test -- src/webhook.test.ts src/city/webhookInbox.test.ts
grep -n "destinationUrl" src/city/orchestrator.ts src/delegation/executor.ts src/relayer.ts
grep -n "webhookPublicUrl\|WEBHOOK_PUBLIC_URL" src/config.ts src/city/orchestrator.ts
```

**KNOWN LIMITATION (stated honestly).** The webhook receiver is implemented, signature-verified, and
unit-tested, and the orchestrator reads the inbox push-first. The outbound `destinationUrl` is sent
to the relayer **only when `WEBHOOK_PUBLIC_URL` is set**; the default demo leaves it unset and learns
status via the **polling fallback**. The end-to-end live signed event is proven by tests, not yet by
a captured production callback. See README "Honest scope notes — 1Shot status."

---

## Venice AI — private spend-gate + on-chain reads through Venice

**CLAIM (spend-gate).** Before any worker redelegates and spends, its spend INTENT is judged privately
by a Venice (zero-retention) model wrapped in a deterministic cap-guard. The on-chain action fires
only on approval; the gate **fails closed** (unavailable/unparseable verdict ⇒ spend held).

**SOURCE (spend-gate).** `src/city/spendGate.ts` — `buildSpendGate` (deterministic floor:
amount ≤ 0 and amount > subCap are rejected before any model call; then the Venice JSON verdict),
`parseVerdict`. Invoked in `src/city/orchestrator.ts` — `hireAndPay` (`deps.judge`; on any error the
verdict is forced to `{approved:false}`, never to approved).

**VERIFY (spend-gate).**
```
npm test -- src/city/spendGate.test.ts
npm run city   # live: each worker shows a gate verdict before its payment; an over-cap spend is held
```

**CLAIM (Venice as a core, multi-endpoint dependency).** Venice is used for (a) the private reasoning
model and (b) reading on-chain state THROUGH Venice Crypto-RPC. The x402 Market-Data service reads the
Chainlink ETH/USD feed on Base mainnet via Venice Crypto-RPC at purchase time, and the Sentiment
service line is written live by the Venice model from that price.

**SOURCE (Venice endpoints).**
- Reasoning client: `src/venice.ts` — `VeniceReasoner.complete` (OpenAI-compatible; `disable_thinking`
  suffix for clean JSON). Per-worker reasoning + final brief: `src/city/live.ts` —
  `buildCityReasoner`, `buildCityComposer`.
- Crypto-RPC: `src/veniceRpc.ts` — `VeniceCryptoRpc.rpc`, `erc20Balance`.
- Live service data through Venice: `src/city/services.ts` — `readEthUsd` (Chainlink
  `latestRoundData` via `VeniceCryptoRpc`), `marketData`, `sentiment`.

**VERIFY (Venice endpoints).**
```
npm test -- src/veniceRpc.test.ts
grep -n "VeniceCryptoRpc\|latestRoundData\|disable_thinking" src/city/services.ts src/venice.ts src/veniceRpc.ts
```

**MODEL.** Default `VENICE_MODEL=zai-org-glm-4.7` (`src/config.ts`), a Venice private
(zero-retention) text model; overridable via env. The deterministic cap floor in `buildSpendGate`
holds even if the model call fails (fail-closed), so the budget cannot be bypassed by a model outage.

---

## x402 — HTTP 402 pay-per-call settled as an ERC-7710 redemption

**CLAIM.** Worker agents buy from real HTTP 402 endpoints: `GET` → 402 + challenge → pay the required
USDC as an ERC-7710 redemption through 1Shot → retry with `X-PAYMENT` → 200 + resource. The payer
enforces a hard budget cap. The 402 gate requires a decodable `X-PAYMENT` envelope carrying a
`taskId`; final settlement is confirmed on-chain out-of-band.

**SOURCE.**
- x402 client + payer: `src/x402/client.ts` — `X402Client.fetch`, `selectRequirement`;
  `src/x402/payer.ts` — `DelegatedPayer.pay` (enforces `budget`, settles via the Executor);
  types in `src/x402/types.ts`.
- Service market: `src/city/services.ts` — `startCityServices`, `hasPaymentProof` (base64-decodes the
  `X-PAYMENT` envelope and requires a non-empty `payload.taskId` before returning 200).
- Orchestration of pay-per-call: `src/city/orchestrator.ts` — `hireAndPay` (X402Client → settle).

**VERIFY.**
```
npm test -- src/x402/x402.test.ts
npm run prove:x402   # 402 handshake + on-chain settlement; asserts the service received 0.05 USDC
```

**ON-CHAIN / ARTIFACT.** Base Sepolia tx
`0xbbcecb7cbe662462794cf5cee1c7dcbf3eba22b9669e902f5b8bfb3b1272450b`
(`docs/proofs/x402-pay-per-call-7710.json`, 4 `RedeemedDelegation` events; the test service received
exactly 0.05 USDC).

**KNOWN LIMITATION (stated honestly).** Settlement is an **ERC-7710 redemption** (the track thesis),
**not** canonical Coinbase x402 (EIP-3009 `transferWithAuthorization` verified by a facilitator); the
`X-PAYMENT` envelope is the project's own JSON shape. The 402 gate checks that the envelope decodes
and carries a `taskId`, but does not itself re-verify settlement before serving — settlement is
confirmed out-of-band via `balanceOf` / relayer status. Note: the standalone `scripts/prove-x402.ts`
demo server gates on mere `X-PAYMENT` header presence; the in-app market (`src/city/services.ts`)
uses the stricter `hasPaymentProof` decode. See README "Honest scope notes — x402."

---

## A2A — agents hire agents via capped redelegation chains

**CLAIM.** A Manager that holds a budget sub-delegates a **narrower** capped budget to a worker; the
child chains to the parent via `authority = hashDelegation(parent)`, so the worker can spend only
inside **both** caps. The redelegation chain itself is the coordination primitive — the chain
enforces the cap, not trust.

**SOURCE.** `src/delegation/redelegate.ts` — `buildRedelegation`
(`ScopeType.Erc20TransferAmount`, `parentDelegation`). Chain assembly principal → worker → relayer
(and under a grant: user → principal → worker → relayer): `src/city/orchestrator.ts` —
`buildSubBudget`. Standalone proof: `scripts/prove-redelegation.ts` — `buildA2AContext`
(parentCap 1 USDC, narrower childCap 0.5 USDC).

**VERIFY.**
```
npm test -- src/delegation/redelegate.test.ts
npm run prove:a2a    # signs principal →(≤1 USDC)→ manager →(≤0.5 USDC)→ relayer; redeems on-chain
```

**ON-CHAIN / ARTIFACT.** Base Sepolia tx
`0x24af8650b5690755e4dfad5d16947c06d753257348872c9bd73bbad8d6b2ae27`
(`docs/proofs/a2a-redelegation-chain.json`, 6 `RedeemedDelegation` events — root + narrower child).
3-link chains under a grant: `docs/proofs/city-run-grant-research-x402.json` /
`city-run-grant-analyst-x402.json` (8 `RedeemedDelegation` events each).

**KNOWN LIMITATION (stated honestly).** The on-chain proofs show **under-cap** spends being redeemed.
An over-subCap spend is rejected by the deterministic floor in `buildSpendGate` before any on-chain
work (and the `Erc20TransferAmount` enforcer would also revert it), but a captured **negative**
on-chain proof of an over-cap revert is not yet committed.

---

## Best Agent — bounded autonomous agent

**CLAIM.** Two agent shapes ship. (1) A single-agent planner loop — reason → propose → policy check →
**per-spend human-in-the-loop approval** → execute under a hard cap — used by `npm run demo` and the
`/runs` HTTP path. (2) The live Agent City flow — you authorize a budget up front, a Venice gate then
approves **each** spend, and you revoke the whole delegation tree in one click. The City flow does
**not** add a separate per-spend human pause on top of the Venice gate.

**SOURCE.**
- Single-agent HITL: `src/agent/planner.ts` — `Steward.consider` (sets `awaiting_approval` when policy
  `requiresApproval`), `Steward.approve` (human resumes/rejects); policy in `src/agent/policy.ts`
  (`checkPolicy`). HTTP surface: `src/api.ts` — `POST /runs/:id/approve`, `GET /runs/:id`. Driver:
  `scripts/demo-live.ts`.
- Live City flow (authorize up front, Venice gate per spend, one-click revoke): `src/api.ts` —
  `POST /city/run`, `POST /revoke` (`isRevoked` checked in `hireAndPay`); gate in
  `src/city/spendGate.ts`.

**VERIFY.**
```
npm test -- src/agent/planner.test.ts src/agent/policy.test.ts src/api.test.ts
npm run demo         # single-agent loop; pauses for approval before a spend
grep -n "awaiting_approval\|requiresApproval" src/agent/planner.ts src/agent/policy.ts
grep -n "runs/:id/approve\|/revoke" src/api.ts
```

**KNOWN LIMITATION (stated honestly).** Per-spend **human** approval lives in the single-agent
planner path (`npm run demo`, `/runs/:id/approve`). The City UI's pre-dispatch approve is a one-time
authorize-up-front toggle; per-spend gating in the City is done by the **Venice** spend-gate, with
revoke-all as the human control. The City worker loop is a deterministic orchestration, not a
model-planned loop.

---

## Best Feedback — developer-experience writeup

**CLAIM.** A grounded, reproducible developer-feedback writeup covers 1Shot, the MetaMask Smart
Accounts Kit, and Venice — each point tied to a concrete fix learned while building and redeeming real
delegations on Base Sepolia and Base mainnet.

**SOURCE.** `docs/FEEDBACK.md` (e.g. `getStatus.hash` empty vs `receipt.transactionHash`;
`permissionContext` must be `toRelayerJson`, not `encodeDelegations` hex; delegate `to` must be the
relayer `targetAddress`; one `authorizationList` entry per request; `Stateless7702` vs `Hybrid`;
chain order leaf→root; Venice `disable_thinking`; `privacy: private` ≠ TEE; Crypto-RPC slugs). Each
maps to code in `src/relayer.ts`, `src/relayerJson.ts`, `src/delegation/*`, `src/venice.ts`,
`src/veniceRpc.ts`.

**VERIFY.**
```
sed -n '1,80p' docs/FEEDBACK.md
npm run prove        # the writeup's claims are reproducible from the prove* scripts
```

---

## Discoverability — committed, file-only-verifiable proofs

**CLAIM.** Every load-bearing on-chain claim has a committed, machine-readable receipt under
`docs/proofs/`, regenerable read-only with no keys. A file-only reader can verify inclusion and the
`RedeemedDelegation` event counts without an explorer.

**SOURCE.** `scripts/fetch-proofs.ts` — `fetchReceiptProof`, `fetchAccountCodeProof`,
`countRedeemedDelegations`, `assertSpecsMatchReadme` (asserts each pinned hash appears in
`docs/proofs/README.md`); the receipt table in `docs/proofs/README.md`; `.gitignore` un-ignores
`docs/proofs/*.json`.

**VERIFY.**
```
npx tsx scripts/fetch-proofs.ts        # writes/refreshes docs/proofs/*.json from public RPC, no key
ls docs/proofs/*.json
```

**ON-CHAIN / ARTIFACT.** Eight receipt JSONs + two account-code JSONs, e.g.
`docs/proofs/mainnet-1shot-redemption.json`, `a2a-redelegation-chain.json`,
`x402-pay-per-call-7710.json`, `erc7715-grant-redemption.json`,
`city-run-grant-research-x402.json`, `city-run-grant-analyst-x402.json`.

---

## Known limitations (single list)

1. **MetaMask Flask popup not run end-to-end.** The ERC-7715 grant is proven via a local-key script
   that builds MetaMask's exact wire format and flows through the same `parseGrant` boundary; the
   interactive Flask popup itself was not captured. (`prove:grant`, `grant:dev`.)
2. **1Shot webhook push not captured live.** Receiver is verified + unit-tested and read push-first;
   the outbound `destinationUrl` fires only when `WEBHOOK_PUBLIC_URL` is set, so the default demo uses
   the polling fallback.
3. **x402 is ERC-7710 settlement, not canonical EIP-3009 x402.** The 402 gate requires a decodable
   `X-PAYMENT` envelope with a `taskId` (in-app market) but confirms settlement out-of-band, not in
   the gate. The standalone `prove-x402.ts` demo server gates on header presence only.
4. **No committed negative (over-cap revert) on-chain proof.** Over-cap spends are blocked by the
   deterministic floor and would revert at the enforcer, but only under-cap redemptions are pinned.
5. **City worker loop is deterministic orchestration.** Per-spend *human* approval is in the
   single-agent planner path; the City uses the Venice gate per spend plus one-click revoke-all.
6. **Reputation is recomputed in memory per server session** from settled-receipt quoted prices (the
   inputs are the on-chain receipts); it is not persisted.
