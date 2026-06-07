# Verifying Steward end-to-end (human checklist)

The build process verified this on Base Sepolia, but **you should run it yourself**. This is the checklist.

> Note: `.env` already contains a throwaway `SIGNER_PRIVATE_KEY` (the treasury), `RPC_URL` (Base Sepolia),
> `VENICE_API_KEY`, and `CHAIN=baseSepolia`. The treasury address is
> `0x1DC366A33BaA610eA5A60Ba549f619126e590601` and currently holds test USDC.

## 1. Static checks (no chain, no spend, no Venice)

```bash
npm install
npm run typecheck     # expect: no errors (exit 0)
npm test              # expect: Test Files 10 passed · Tests 41 passed
```

✅ **Pass:** typecheck clean, 41/41 tests pass.

## 2. Headless complete loop — `npm run demo`

Spends ~0.01 USDC (relayer fee) and transfers 0.05 USDC to the treasury itself (net ≈ −fee).

```bash
npm run demo
```

Watch for, in order:
- `Treasury smart account: 0x1DC3…0601`
- `On-chain state (read live through Venice Crypto-RPC): … holds ~19.x USDC`
- `PENDING (human gate): {"kind":"transfer", … "amount":"50000", …}` then `>>> approving`
- `executed … "taskId":"0x…"`
- `status 110` … `status 200` → `✅ Confirmed on-chain — the complete loop works.`

✅ **Pass:** ends with "✅ Confirmed on-chain."
🔎 **Cross-check on the explorer:** open
`https://sepolia.basescan.org/address/0x1DC366A33BaA610eA5A60Ba549f619126e590601`
→ you should see recent transactions and the USDC balance ticking down by the fee each run.

## 3. Web dashboard — `npm run dev`

```bash
npm run dev           # → http://localhost:8787
```

In the browser:
1. Banner shows **LIVE · baseSepolia · treasury … · payee …**.
2. The goal box is pre-filled. Click **Run**.
3. The audit trail fills in; a **"Approval required"** gate appears. Click **Approve**.
4. The "relayer task …" line advances **Submitted → Confirmed on-chain** (with a "view tx ↗" link if the relayer surfaces a hash).
5. Click **Revoke all authority** → status flips to **REVOKED** and Run is disabled.

✅ **Pass:** a run reaches "Confirmed on-chain"; revoke works.
⚠️ Each approved run spends ~0.01 USDC (fee) + 0.05 USDC transferred to the treasury itself.

> If `npm run dev` prints `DRY-RUN mode (...)` instead of `LIVE mode`, a cred is missing — check `.env`. In
> DRY-RUN the UI still works but execution is simulated (no chain).

## 4. Minimal de-risk — `npm run prove` (optional)

```bash
npm run prove
```

✅ **Pass:** ends with "✅ Confirmed on-chain."

## Troubleshooting

| Symptom | Fix |
|---|---|
| Venice `401` | Check `VENICE_API_KEY` + that the Venice account has a credit balance (venice.ai → API). |
| relayer "no capabilities for chain" | Confirm `CHAIN` is `baseSepolia` or `base`; the relayer host is auto-selected. |
| `4205 Insufficient Balance` / transfer reverts | Top up test USDC to the treasury address (faucet.circle.com → Base Sepolia). |
| `4204 Quote Expired` | Transient (estimate→send >45s). Re-run. |
| stuck at `status 110` | Testnet confirmation lag — the demo polls up to 5 min; or re-check later via the explorer. |
