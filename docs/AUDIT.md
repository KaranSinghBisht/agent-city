# Agent City — Lead Reviewer Audit & Action Plan

**Project:** Agent City (MetaMask x 1Shot x Venice Dev Cook-Off) — *earlier named Steward*
**Date:** 2026-06-07 · **Deadline:** 2026-06-15 10:59 UTC
**Inputs merged:** security audit (24 findings), adversarial verification (6 confirmed `isReal=true`), 3-judge panel.

---

## Verdict (honest)

> ⚠️ **Superseded on the ERC-7715 point** — this verdict was written before the grant was wired. The
> browser grant is now passed into the city run and redeemed under the granted context (`src/api.ts:235-251`
> → `src/delegation/grantBridge.ts` → `src/city/orchestrator.ts`; `npm run prove:grant`). Read the sentence
> below about the grant being "stored in `lastGrant` and never redeemed" as historical, not current.

Real, on-chain-proven delegation engine with an exceptionally honest BUILD_STATE — the 1Shot track is genuinely strong (testnet + mainnet, USDC gas, EIP-7702, RedeemedDelegation events) and the "the delegation IS the cap" thesis is sharp. But the project **cannot be filed today** (registration `canSubmit=false`, no demo video) and its **headline ERC-7715 "Advanced Permissions in the main flow" claim is non-functional**: the browser grant is stored in `lastGrant` and never redeemed — every proven flow uses a backend signer. There is also a real DOM XSS on the wallet-connected origin and an A2A cap-math bug that breaks the City Ledger under mainnet fees. Fix the non-code blockers first; they gate everything.

**Would it win as-is?** No — it cannot be submitted, and a judge clicking "Grant" gets a button with no consumer. **Fix first:** confirm HackQuest registration (Task #13) — nothing else matters if the entry cannot be filed.

---

## Per-judge scores

| Judge | Overall | Headline read |
|---|---|---|
| MetaMask Cook-Off judge (Best Agent + Smart Accounts/7715) | **6.5** | Qualifies on Smart Accounts (ERC-7710 + 7702, backend-signed), but does NOT win the ERC-7715 narrative it pitches — the wallet grant is never redeemed. |
| Tough-but-fair (independently verified every on-chain claim) | **7.8** | Top-quartile, carried by reproducible on-chain proof + radical honesty. Likely wins Best 1Shot; ceiling capped by demo-stub infra and unbuilt 7715 front door. |
| Pragmatic "does it WIN cash" judge | **7.0** | Top-3 potential in A2A + 1Shot IF the video ships against the real Agent City UI. As-is (no video, incomplete demo coverage, unconfirmed registration): does not place. |

### Track scores (consolidated)

| Track | Range | Note |
|---|---|---|
| **Best 1Shot Relayer** | **8–9** | Strongest. Proven testnet + mainnet, USDC gas, EIP-7702, feeCollector leg, estimate→rebuild-on-fee-change, Ed25519/JWKS webhook verifier (built + unit-tested). |
| **Best A2A Coordination** | **6–9** | On-chain primitive real (tx `0x24af…ae27`, 6 RedeemedDelegation events, capped redelegation). Capped at low end by "single process, no agent-to-agent messaging." |
| **Best x402 + ERC-7710** | **6–7** | 7710 settlement real on-chain (tx `0xbbce…450b`, service got 0.05 USDC). x402 protocol-conformance is approximate: gate is unauthenticated, X-PAYMENT shape self-invented, not EIP-3009. |
| **Best Use of Venice AI** | **7** | Real dual-endpoint (private reasoning + Crypto-RPC reads). "Private/zero-retention" is platform default, not engineered; reads are shallow (balanceOf only). |
| **Best Agent** | **6–7** | Real planner with HITL — but the true per-spend approval lives in the orphaned `/runs` path; the shipped Agent City UI dropped the pause. |
| **ERC-7715 end-to-end** | ~~2~~ → **wired** | *Original: "Scaffolded, not working. Grant button with no consumer."* **Now resolved** — grant is redeemed under its granted context (`src/api.ts:235-251`, `npm run prove:grant`). Remaining caveat: the interactive Flask popup itself was not run end-to-end (see Known limitations). |
| **Submission readiness** | **3** | `canSubmit=false` + no video. Gates everything. |

---

## ✅ Status update (post-audit) — what has since been fixed

> This audit was the action plan; most P0/P1 code items have since landed. The table below is the current
> truth, with the fixing file:ref. Items not listed here remain as written (see **Known limitations** at the
> end). The headline ERC-7715 verdict above ("grant never redeemed") is now **stale** — the grant is wired.

| Audit item | Status | Where it was fixed |
|---|---|---|
| **P0-3** ERC-7715 grant never reaches `runCity` / any executor | ✅ **Resolved** | `src/api.ts:235-251` snapshots the active grant and passes `grantChain: grant?.chain` into `runCity`; `src/delegation/grantBridge.ts:66` (`parseGrant` + Kit `decodeDelegations`) → `src/city/orchestrator.ts` chains workers under it. `npm run prove:grant` redeems under a granted periodic context on-chain. |
| **P0-5 / P1-3** DOM XSS in `rcpt()` + incomplete `esc()` | ✅ **Resolved** | `src/ui/app.ts:839` `esc()` now escapes `[&<>"']`; `src/ui/app.ts:930` validates `txHash` against `/^0x[0-9a-fA-F]{64}$/` and bails otherwise; rows built via `createElement`/`textContent`. |
| **P0-6** A2A cap-math floor too low (City Ledger reverts under mainnet fees) | ✅ **Resolved** | `src/city/live.ts:132` raised the floor to `0.5 + (score/100)*0.5` (0.50→1.00 USDC) so a fresh worker's cap comfortably covers work + relayer fee. |
| **P0-7 / P1-?** Webhook receiver unwired (`destinationUrl` set by no caller) | ✅ **Resolved (wired)** | `POST /webhooks/1shot` (`src/api.ts:113`) verifies Ed25519/JWKS and records into a push-first inbox (`src/city/webhookInbox.ts`) that `settle()` reads **before** polling (`src/city/orchestrator.ts:116-121`). Push is active when `WEBHOOK_PUBLIC_URL` is set; polling is the documented fallback. |
| **P0-8** No committed on-chain proof artifacts | ⚠️ **Partial** | `docs/proofs/` exists with a manifest README pinning the load-bearing tx hashes; each is openable on Basescan. Raw machine-readable receipt JSON/log files are being added — until they land, verify the listed hashes directly on the explorer. |
| **P1-9 / honesty** Two product names (Steward vs Agent City), stale test counts | ✅ **Resolved** | Renamed to **Agent City** across README, `docs/architecture.md`, `docs/TESTING.md`; counts corrected to **57 tests / 13 files**; `BUILD_STATE.md` carries a historical-log banner. |

The remaining open items (P0-4 grant wire-shape hardening, the x402 gate verifying payment, per-spend HITL
in the City flow, dead-code removal, duplication) are tracked under **Known limitations** at the foot of
this file. The text below is preserved verbatim as the original audit record.

---

## P0 — Must fix (blocks submission, breaks the demo, leaks data, or overclaims)

> Only REAL, verified issues. Non-code blockers first because they gate the prize.
> *(Historical audit record — see the Status update above for what has since been resolved.)*

1. **[BLOCKER · non-code] Confirm HackQuest registration — `canSubmit=false`** (Task #13). On HackQuest you must be registered to submit; none of the on-chain proof counts if the entry cannot be filed. Do this TODAY, before any code.

2. **[BLOCKER · non-code] Record the ≤3-min demo video** (Task #9) against the ACTUAL Agent City UI. Rules make the video the load-bearing artifact; MetaMask delegation must be visibly in the main flow. Show: `/grant` MetaMask prompt → `/app` dispatch → on-chain Basescan receipt → revoke.

3. **[OVERCLAIM / judging hard gate] Get ERC-7715 truly into the main flow, or stop claiming it.** `grant.ts` calls `wallet_requestExecutionPermissions` and POSTs to `/city/grant`, but `src/api.ts:206/227/228/230` only stores it in `lastGrant` and reads it back — verified it is **never** passed to `runCity`, `makeSpecs`, or any executor. The "Advanced Permissions in the main flow" pitch (landing copy, README) is a grant UI with no consumer. EITHER wire it (pass `lastGrant` into the city run and resolve via the already-built `staticResolver` in `src/delegation/executor.ts:39` — the mechanism exists, ~10–20 lines) OR remove the "main flow" claim from `src/ui/app.ts:67`, landing, and README. **This is the single biggest score-mover.** (Task #19)

4. **[OVERCLAIM] Fix the ERC-7715 wire shape in `grant.ts` (lines 103–116).** Verified against `@metamask/smart-accounts-kit` (`permissionRequestToRpc`): the Kit emits `chainId: toHex(chainId)` (hex quantity) but `grant.ts:104` sends `chainId: Number(cfg.chainId)` (decimal); the Kit emits expiry as `rules:[{type:'expiry',data:{timestamp}}]` but `grant.ts:105` sends a top-level `expiry` number with no `rules` array. A spec-conformant MetaMask decoder will reject or mis-read these. Fix: `chainId:'0x'+Number(cfg.chainId).toString(16)`, move expiry into a `rules` entry — or drop the raw RPC and use the Kit's `erc7715ProviderActions`. (`periodAmount` hex + `periodDuration` 86400 are already correct — leave them.) If P0-3 wires the grant, this MUST be correct or the front door fails against Flask.

5. **[SECURITY · high] DOM XSS in `rcpt()` (`src/ui/app.ts:123`, rendered via innerHTML at line 151).** Verified: the active branch builds `'<a href="'+base+e.txHash+'" …>'` with NO escaping; `e.txHash` is relayer-supplied (`orchestrator.ts:167` ← `relayer.getStatus()`, returned verbatim by `GET /city/run/:id` at `api.ts:199-203`). `esc()` (`app.ts:98`) only escapes `&<>`, not quotes. A relayer (or a swapped/compromised one — the client is URL-pluggable) returning `"><img src=x onerror=…>` executes script on the MetaMask-connected origin → forge approval clicks, suppress revoke, phish signatures. Fix: validate `/^0x[0-9a-fA-F]{64}$/.test(e.txHash)` and bail on failure; build the link via DOM API (`createElement`, `textContent`, `setAttribute`) not string concatenation. Same gap exists in `src/ui/grant.ts:77`.

6. **[CORRECTNESS · high] A2A cap math breaks the City Ledger under mainnet fees.** Verified: one `redeemDelegations` batch moves USDC TWICE under one delegation — fee→feeCollector + 0.05 work (`executor.ts:118-121`), both bound by `subCap` (`orchestrator.ts:65`, `maxAmount:subCap`). The on-chain `ERC20TransferAmountEnforcer` caps the CUMULATIVE transfer (fee + 0.05), but `DelegatedPayer` (`payer.ts:22`) validates only the 0.05 work amount against `subCap`. For a fresh worker `subCap = 0.2 + (0/100)*0.3 = 0.20 USDC` (`live.ts:65`), leaving only 0.15 USDC headroom for the fee. If the relayer fee > 0.15, the batch reverts → `settle()` returns 400/500 → every worker marked `failed`, while the off-chain check passes and masks the cause. (prove-redelegation.ts survives only because childCap 0.5 vs 0.1 transfer = 0.4 headroom.) Fix: raise the floor in `live.ts:65` so even a fresh worker's cap comfortably exceeds `payAmount + relayer fee` (e.g. `0.5 + (score/100)*0.5`), AND make `payer.ts` (or the orchestrator) include the fee in the budget check.

7. **[OVERCLAIM] Webhook "verifiable status" is unwired scaffolding.** Verified: `destinationUrl` is plumbed through `executor.ts:146` but set by NO caller (grep: only the definition + the relayer type); `RelayerWebhookVerifier` (`src/webhook.ts:58`) is imported only by its own test; every live/prove path polls `relayer.getStatus`. README:66 markets "webhook-verifiable status" as a live 1Shot differentiator and README:54 / `docs/architecture.md:19` diagram a push. A judge grepping for a wired `destinationUrl` finds none. Fix (pick one): (a) downgrade the wording to "webhook receiver implemented + unit-tested; live demo uses status polling; not wired end-to-end"; or (b) stand up a `POST /webhook` route that calls `RelayerWebhookVerifier.verify()`, pass `destinationUrl` from one prove script, and capture one Ed25519-verified event.

8. **[OVERCLAIM] Commit on-chain proof artifacts.** Verified: no `docs/proofs/` dir, no committed receipt/log/test pins the four load-bearing hashes (`0x651c…`, `0x46bf…`, `0x24af…ae27` gas 464459, `0xbbce…450b` gas 304227, `0x0349…448bf` gas 304887, `getCode 0xef0100…`). `*.log` is git-ignored; prove scripts write nothing to disk. The project's whole headline is "proven on-chain — not a mock," so a single stale/wrong hash collapses it. Fix: save each prove run's stdout + `relayer_getStatus` receipt JSON under `docs/proofs/*.log`, link from README, and re-open every Basescan link before submission to confirm status, to/from, transfer amounts, and `getCode`.

---

## P1 — Important (quality / correctness)

1. **[SECURITY · medium] Unauthenticated grant read/write at the HTTP boundary (`src/api.ts:206-230`).** Verified there is NO auth middleware (`grep .use(` empty). `GET /city/grant` returns the last user's wallet address + ERC-7715 context to any anonymous caller (info disclosure); `POST /city/grant` stores arbitrary uncapped JSON. **Right-sized to medium, not high:** the audit's "poisoned `lastGrant` feeds the value-moving path" is NOT realizable — `lastGrant` is never read by any executor (the "will redeem under it" text is an aspirational comment). Fix: scope grants per session behind a token, validate the body (address format, expected keys), cap size, or drop the GET entirely.

2. **[SECURITY · medium] State-changing routes have no auth / CSRF protection (`/revoke`, `/runs`, `/city/run`).** `revoked` is a process-global boolean any unauthenticated POST can flip, disabling the city for everyone until restart (DoS); spend-bearing routes have no auth/rate-limit/CORS. Blast radius is limited on a localhost demo, but it contradicts the "you control authority" narrative. Fix: gate state-changing routes behind a local shared secret or a custom header cross-origin forms cannot send; add a simple per-IP rate limit on spend routes.

3. **[SECURITY · medium] `esc()` is an incomplete escaper used as if complete** (`src/ui/app.ts:98`, duplicated `src/ui/grant.ts:77`). Escapes only `&<>`, not `"`/`'` — this is what makes P0-5 exploitable and silently unsafe for any future attribute interpolation. Fix: add `"`→`&quot;` and `'`→`&#39;`, or provide `escHtml()` + `escAttr()`; apply to both files.

4. **[CORRECTNESS · medium] City run concurrency + revoke gap (`src/api.ts:161-197`).** `runCity` is fire-and-forget (`void … .catch`); the global `roster`/`repStore`/x402 market are shared across runs (memoized via `cityBasePromise`), so overlapping `/city/run` calls corrupt each other's reputation-derived caps and ledger; a `/revoke` mid-run is not honored for queued workers. `onUpdate` is `() => undefined`, so progress is unobservable. Fix: serialize runs (in-flight lock), re-check `revoked` inside `hireAndPay` before each redemption, and wire `onUpdate` to persist mutations.

5. **[CORRECTNESS · medium] Settle timeout mislabels pending as failed (`orchestrator.ts:81-97`).** 100×3s = 5 min then returns `{status:0}`; caller treats !=200 as `failed` with no message AND records a reputation-lowering failed receipt. A still-pending mainnet tx is indistinguishable from a real failure. Fix: on timeout set `entry.status='pending'` with a distinct message and do NOT record a failed receipt for an unresolved tx.

6. **[CORRECTNESS · medium] Single-shot fee re-negotiation can under-fund the fee leg (`executor.ts:128-147`).** Re-estimate runs at most once, then sends unconditionally; the second estimate's `requiredPaymentAmount` is never compared against the rebuilt fee. Under mainnet gas movement this yields `InsufficientPayment` (4200) at send. Fix: bounded loop (≤3) on `build→estimate` keyed on `requiredPaymentAmount` until stable.

7. **[x402 · medium] The 402 gate is unauthenticated theater (`src/city/services.ts:55`, mirrored `scripts/prove-x402.ts:63`).** Verified: unlocks on the mere PRESENCE of any `X-PAYMENT` header — never decodes the proof, checks taskId, or confirms settlement. On-chain settlement IS real and checked out-of-band via balanceOf. Fix: state the limitation honestly in README, OR decode X-PAYMENT, pull taskId, and confirm `relayer_getStatus == 200` before returning 200.

8. **[CLAIMS · medium] Reputation credited from `spec.payAmount`, not the on-chain transfer (`orchestrator.ts:170`).** `reputation.ts`/`types.ts` claim credit is "recomputable from chain — not asserted," but the figure fed in is the off-chain quoted price. Fix: derive volume from the settled receipt, OR soften the wording.

9. **[DEMO COHERENCE · medium] Two products in one repo.** README + `docs/DEMO_SCRIPT.md` + `docs/TESTING.md` describe "STEWARD" (single treasurer, "Run" button, per-step approval box); the shipped UI is "AGENT CITY" (Mayor → Manager → workers, "Dispatch the city"). The 3-min script narrates a UI that no longer exists. Pick ONE story (Agent City is stronger) and rewrite the script + README to the actual `/grant → /app → dispatch → Basescan → revoke` flow. README also never mentions Agent City at all.

10. **[BEST AGENT · medium] HITL regressed in the City rewrite.** The old `/runs` path had true per-spend approval (`/runs/:id/approve` → `BoundedAgent.approve()`); the new `/city/run` path has a cosmetic one-time toggle and `runCity` has no pause/approve logic. The "bounded autonomy" moment a Best-Agent judge looks for is gone from the shipped UI. Consider restoring a visible approval pause in the City flow.

11. **[DUPLICATION · medium] Security-critical logic duplicated across `src/` and `scripts/`** (the audit lists several): `recordingExecutor` (verbatim in `orchestrator.ts:35` + `prove-x402.ts:47`), `buildSubBudget`/`buildA2AContext` (the A2A chain construction — the core security primitive — in `orchestrator.ts:46` + `prove-redelegation.ts:52`), relayer token-bootstrap (6 sites), and the status-poll loop (5 sites). A cap/ordering fix must be made in every copy or they silently diverge. Fix: extract shared helpers into `src/delegation/` and `src/relayer.ts`; scripts import them.

---

## P2 — Nice to have

1. **[CLAIMS · low] On-chain `maxAmount` = fee + work, not a round number.** A judge decoding the A2A delegation will read `feeAmount+0.1`, not a clean `0.5/1.0`. Clarify in the A2A/x402 narrative (no code change required).

2. **[CORRECTNESS · low] x402 double-charge on retry (`orchestrator.ts:139-155`).** If the retried GET returns non-200 after payment was already submitted (`sink.taskId` set, USDC moving), the entry is marked failed and no receipt path runs — money moves, ledger says it did not. Fix: treat a set `sink.taskId` as paid and settle on on-chain status, surfacing the service's non-200 separately.

3. **[INPUT · low] Unbounded `goal` body (`api.ts:100-104`, `166-170`).** Only a non-empty/truthiness check; fed straight into the LLM prompt (token/memory cost + prompt-injection surface). The policy gate + approval bound real spend, so low. Fix: cap at ~2000 chars, trim, pass as delimited user content; add a global body-size limit.

4. **[ON-CHAIN · low] `isUpgraded()` exact-match fragility (`smartAccount.ts:57-68`).** If an EOA was upgraded to a different impl, returns false and silently attempts a fresh 7702 auth (relayer caps at one), surfacing a confusing failure. Fix: when code is present but mismatched, throw a distinct "delegated to <other impl>" error.

5. **[DEAD CODE · low] Remove or justify:** `createVeniceCryptoRpc` + `nativeBalance` (`src/veniceRpc.ts:63-72`, zero callers); `OneShotRelayer.getFeeData` + its two types (`src/relayer.ts:82-97,151-153`, zero callers).

6. **[DUPLICATION · low] Triplicated UI helpers** (`esc`/`shrink`/`LOGO` across `app.ts`, `grant.ts`, `landing.ts`; `shrink` slice lengths already differ). Factor a shared `UI_SCRIPT_HELPERS` + `logo(idPrefix)` into `theme.ts`. Embedded inline JS also bypasses the strict TS checks the rest of the codebase enjoys.

7. **[FUNCTION LENGTH · low] Over the <50-line rule:** `DelegatedExecutor.execute()` (~72 lines, the one over-length core fn — extract `buildParams`/`estimateWithFee`); `prove-x402.ts main()` (97), `run-city.ts main()` (87), `prove-delegation/redelegation main()` (~80). The script ones largely dissolve once the shared helpers (P1-11) exist.

8. **[CLAIMS · low] Re-verify the three close gasUsed values** (304887 / 304227 / 292387) on Basescan; confirm the mainnet 304887 corresponds to `0x0349…448bf` and is not a transcription of the testnet number.

---

## To win — highest-leverage moves

**Non-code (do these FIRST — they gate the prize):**
1. **Confirm HackQuest registration** (`canSubmit=false`, Task #13) — TODAY. Existential.
2. **Record the ≤3-min video** (Task #9) against the real Agent City UI, with a visible MetaMask grant and at least one on-screen approval/settlement moment.
3. **Pick ONE product story** (Agent City) and rewrite `docs/DEMO_SCRIPT.md` + README to match the shipped `/grant → /app → dispatch → Basescan → revoke` flow.

**Code (in priority order):**
4. **Wire ERC-7715 into the main flow** — pass `lastGrant` into the city run and redeem via the existing `staticResolver`. This is the judging hard gate and the single biggest score-mover; it converts a "2/10 scaffolded" track into a real qualification and flips the headline claim from false to true. Fix the `grant.ts` wire shape (P0-4) in the same pass so it survives Flask.
5. **Fix the A2A cap-math floor** (`live.ts:65`) so the City Ledger actually settles on mainnet — otherwise the headline multi-agent demo shows 0/N and the strongest A2A narrative dies on camera.
6. **Fix the XSS + complete `esc()`** — cheap, removes the one real security finding on a wallet-connected origin before a security-minded judge looks.
7. **Commit `docs/proofs/*.log` + re-verify every Basescan hash** — protects the "proven on-chain" thesis that carries the whole submission; one wrong number erodes trust in all of it.
8. **Reconcile the webhook claim with reality** (downgrade copy or wire one event) — protects the strongest prize (Best 1Shot) from a "this is unwired scaffolding" finding.

**Net:** This is a top-quartile build whose ceiling is gated almost entirely by execution, not engineering. The on-chain proof and intellectual honesty are genuinely differentiating; the gap to a top-3 finish is (1) being submittable and (2) making the ERC-7715 front door real. Do those two and it competes for Best 1Shot + Best A2A with a credible shot at stacking Venice.

---

## Known limitations (current, honest)

The on-chain spine (1Shot redemption, EIP-7702 upgrade, A2A redelegation, x402-as-7710, ERC-7715 grant
redemption) is proven. These are the honest gaps a judge should know — none are hidden by the UI copy:

1. **Interactive MetaMask Flask popup not run end-to-end.** The ERC-7715 grant is wired and redeemed
   on-chain (`prove:grant`), but the live Flask Advanced-Permissions popup itself was not exercised
   end-to-end; the reproducible grant path is `npm run grant:dev` (synthetic grant, same bridge). The
   demo scripts call this out.
2. **The x402 402-gate is not payment-verifying.** `src/city/services.ts` returns the resource on the
   presence of an `X-PAYMENT` header; settlement is real but confirmed out-of-band (balanceOf / relayer
   status), not by the service decoding the proof. The UI/README describe this honestly (settlement is
   confirmed out-of-band, not "only after chain confirmation").
3. **No per-spend human pause in the live City flow.** The City `/app` flow uses the **Venice spend-gate**
   (auto-approve/block, fail-closed) plus the on-chain cap; the one-time "Approve & dispatch" toggle is a
   pre-dispatch confirm, not a per-spend HITL gate. True per-spend human approval lives only in the
   single-agent `npm run demo` planner (`src/agent/planner.ts`).
4. **Settlement scheme is the ERC-7710 redemption, not canonical Coinbase x402 (EIP-3009).** The X-PAYMENT
   payload shape is self-invented; the 7710 half is the real, on-chain part. Flagged in the README.
5. **Proof receipts.** `docs/proofs/` pins the load-bearing tx hashes (openable on Basescan); raw
   machine-readable receipt files are being filled in.
6. **Dead code / duplication** (P2 / P1-11): a few zero-caller exports and verbatim-duplicated helpers
   across `src/` and `scripts/` remain; non-load-bearing, tracked for cleanup.
