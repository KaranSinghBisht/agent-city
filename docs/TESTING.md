# Verifying Agent City end-to-end (human checklist)

The build process verified this on Base Sepolia (and the 1Shot gate on Base mainnet), but **you should run
it yourself**. This is the checklist for the shipped product, **Agent City**.

> Note: `.env` already contains a throwaway `SIGNER_PRIVATE_KEY` (the treasury / Mayor), `RPC_URL`
> (Base Sepolia), `VENICE_API_KEY`, and `CHAIN=baseSepolia`. The treasury address is
> `0x1DC366A33BaA610eA5A60Ba549f619126e590601` and currently holds test USDC.

## 1. Static checks (no chain, no spend, no Venice)

```bash
npm install
npm run typecheck     # expect: no errors (exit 0)
npm test              # expect: Test Files 13 passed · Tests 57 passed
```

✅ **Pass:** typecheck clean, 57/57 tests across 13 files pass (`vitest run`).

## 2. Headless complete loop — `npm run city`

Runs Agent City from the command line: a Manager hires workers, re-delegates each a **narrower** capped
sub-budget (A2A), each clears the **Venice spend-gate**, pays a live x402 service, and settles on-chain.
Prints per-agent gate verdicts + tx hashes.

```bash
npm run city
```

Watch for, in order, per worker:
- `🧠` Venice reasoning line, then **⛨ gate: Venice APPROVED** (within cap, serves the goal)
- the x402 purchase → 1Shot settlement → `status 110` … `status 200`
- a Basescan-checkable tx hash for the redemption

✅ **Pass:** workers settle on-chain with gate verdicts printed.
🔎 **Cross-check on the explorer:** open
`https://sepolia.basescan.org/address/0x1DC366A33BaA610eA5A60Ba549f619126e590601`
→ recent transactions; the USDC balance ticks down by the relayer fee each run.

> `npm run demo` runs the **single-agent** planner path (`BoundedAgent`, `src/agent/planner.ts`) with a per-spend
> human-approval gate — a separate, older path from the live City flow. Use `npm run city` to exercise
> what the `/app` UI dispatches.

## 3. Web dashboard — `npm run dev`

```bash
npm run dev           # → http://localhost:8787
```

### 3a. (Optional) stage an ERC-7715 grant

The City runs under the treasury by default. To demo the **MetaMask ERC-7715 grant** front door:

- **In the browser:** open `http://localhost:8787/grant` and grant the budget. The interactive MetaMask
  **Flask** Advanced-Permissions popup is the strongest on-camera moment — but see the honesty note below.
- **Headless fallback:** `npm run grant:dev` posts a synthetic ERC-7715 grant to the dev server (same
  `parseGrant` / `decodeDelegations` bridge path, signed with the `.env` key — no Flask required).

> **Honesty note:** the interactive Flask popup itself has **not** been run end-to-end (see README). The
> reproducible grant path is `npm run grant:dev` (or `npm run prove:grant`, which redeems under a granted
> ERC-7715 periodic context on-chain). Do not infer a live Flask grant from a recording that used the fallback.

### 3b. Run the City

In the browser at `/app`:
1. Banner shows **LIVE · baseSepolia · treasury …**. If a grant is staged, the Mayor panel shows
   **Budget root: ERC-7715 · <your wallet>**.
2. Click **▶ Commission work**, then **Approve & dispatch** (a one-time pre-dispatch confirm toggle —
   there is **no** per-spend approval gate in the City flow; the Venice gate auto-approves each spend).
3. The streaming log + ledger fill in per worker: **⛨ gate: Venice APPROVED** → ledger flips
   **paying → settled** → a **receipt ↗** link to Basescan (the `RedeemedDelegation` events).
4. Click **⚠ Try a bad spend** → cards go red, **⛨ gate: Venice BLOCKED** with its reason, ledger entries
   read **blocked**, and there is **no transaction** (the money never moved — private cognition refused it).
5. Click **Revoke the city** → the map dims red and dispatch is disabled (instant server-side cut-off).

✅ **Pass:** a worker reaches **settled** with a Basescan receipt; the bad spend is **blocked** with no tx;
revoke disables dispatch.
⚠️ Each settled spend moves ~0.05 USDC (work transfer) + the relayer fee (gas in USDC).

> If `npm run dev` prints `DRY-RUN mode (...)` instead of `LIVE mode`, a cred is missing — check `.env`. In
> DRY-RUN the UI still works but execution is simulated (no chain).

## 4. On-chain proofs — `npm run prove*` (optional)

```bash
npm run prove          # base Sepolia 1Shot gate (CHAIN=base for the mainnet redemption)
npm run prove:a2a      # A2A redelegation chain (status 200)
npm run prove:x402     # x402 pay-per-call settled as a 7710 redemption
npm run prove:grant    # redeem under a granted ERC-7715 periodic context
```

✅ **Pass:** each ends with a status-200 on-chain confirmation and a tx hash you can open on Basescan.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Venice `401` | Check `VENICE_API_KEY` + that the Venice account has a credit balance (venice.ai → API). |
| relayer "no capabilities for chain" | Confirm `CHAIN` is `baseSepolia` or `base`; the relayer host is auto-selected. |
| `4205 Insufficient Balance` / transfer reverts | Top up test USDC to the treasury address (faucet.circle.com → Base Sepolia). |
| `4204 Quote Expired` | Transient (estimate→send >45s). Re-run. |
| stuck at `status 110` | Testnet confirmation lag — settle polls up to 5 min; or re-check later via the explorer. |
