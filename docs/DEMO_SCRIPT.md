# Agent City — ≤3-minute demo video script

**Goal:** show MetaMask delegation **in the main flow** (the qualification hard gate), the Agent City economy
(A2A redelegation + x402), and **Venice privately gating every on-chain spend** — all settling on-chain via 1Shot.
**Setup:** `npm run dev` (http://localhost:8787) + a Basescan tab. Stage a grant first: `npm run grant:dev`. Keep it ≤ 3:00.
**Tag** @MetaMaskDev, #DevCookOff.

> Qualification reminder: the video MUST visibly show the MetaMask Smart Accounts Kit in the main flow.
> Agent City satisfies this because every spend is a MetaMask Smart Account delegation **redeemed on-chain**
> (show the Basescan receipt). The `/grant` Advanced Permissions popup is the strongest on-camera "MetaMask" moment.

## What each beat is for (we aim to be best **in a track**, not to "hit all")
- **Best A2A Coordination** (primary) → Scene 3–4: Manager redelegates a *narrower* sub-budget to each worker.
- **Best x402 + ERC-7710** → Scene 4: each worker pays a real 402 service, settled as a 7710 redemption.
- **Best use of Venice AI** → Scene 4: the **spend-gate** — private Venice judgment *gates* the on-chain action.
- **Best 1Shot Relayer** → Scene 4: gasless settle on Base + the **Ed25519/JWKS webhook** as the status source.
- **Best Agent** → the whole loop runs under a hard cap with a human approval + private policy gate.

---

### Scene 1 — Hook (0:00–0:18) · landing `/`
**Show:** the landing — the delegation tree **draws itself**, then the **blueprint city skyline** (signal-orange 7715 treasury tower).
**Say:** "Agent City — an economy of AI agents that hire and pay each other. None of them can overspend, because
every budget is a MetaMask delegation enforced on-chain — not a promise."

### Scene 2 — Grant a permission with MetaMask (0:18–0:52) · `/grant`
**Show:** click the **ERC-7715 grant bar** → **Connect MetaMask** → **Grant permission**. The MetaMask (Flask)
**Advanced Permissions** popup appears: *erc20-token-periodic, ≤5 USDC/day to the agent*. Approve it.
**Say:** "I grant the city a budget straight from my wallet — a real MetaMask Advanced Permission, scoped to
5 USDC a day. The agent decodes the context, and every city payment chains under MY grant. No keys shared, revocable anytime."
> Flask fallback: if the popup misbehaves on camera, `npm run grant:dev` posts a synthetic grant through the
> same validation path; `/app` shows **Budget root: ERC-7715 grant**. Redemption-under-grant is proven on-chain
> regardless (`npm run prove:grant`, tx `0xaa84…197b`).

### Scene 3 — Enter the city (0:52–1:08) · `/app`
**Show:** the page is **alive on arrival** — the ticker scrolls our real proof tx hashes, a ghost "City Ledger —
Preview" shows a sample run, and the Mayor panel shows **Budget root: ERC-7715 grant 0x…**. Click **▶ Run the demo** (one click, no typing).
**Say:** "The city runs on MY granted budget. One click — the Manager hires specialists and hands each a
*narrower* sub-budget. That's agent-to-agent redelegation: a worker can never exceed what it was given."

### Scene 4 — The city works, on-chain (1:08–2:20)
**Show:** the streaming **city-log**, then agent cards fill in — each with a 🧠 **Venice reasoning** line, then a
**⛨ [gate] Venice approved** line, then the **City Ledger** going **paying → settled** (orange settle-flash), the
**spend counter** ticking, and a **receipt ↗**. Click one → the **Basescan** transaction (the RedeemedDelegation events).
**Say:** "Before any agent spends, its intent passes a **private Venice gate** — zero-retention reasoning that
approves the spend *before* the on-chain redelegation fires. Private cognition gating a trusted action. Then it
pays a real x402 service, settled as an ERC-7710 redemption through the **1Shot relayer** — gas in USDC, no ETH.
Status comes from a **signature-verified 1Shot webhook**, with polling as fallback. Here's the actual transaction —
a verifiable on-chain receipt." Point at **credit**: "each agent earns on-chain credit that sizes its next budget."

### Scene 5 — Revoke (2:20–2:38)
**Show:** **Revoke the city** → authority flips to REVOKED, dispatch disabled.
**Say:** "And I can kill the whole city instantly — every agent loses its budget at once."

### Scene 6 — Close (2:38–3:00)
**Say:** "One build: agents that hire and pay each other under cryptographic budgets — MetaMask delegations,
**private Venice spend-gates**, gasless 1Shot settlement, all proven on-chain. The delegation *is* the cap."

---

## Capture checklist (the hard gate lives here)
- [ ] the MetaMask **Grant permission** popup (Advanced Permissions) on screen
- [ ] a **⛨ Venice gate approved** line on an agent (private cognition → trusted action)
- [ ] the **City Ledger** going **settled** with a clickable **Basescan receipt** (delegation redeemed on-chain)
- [ ] an agent **credit** score visible · **Revoke** shown · ≤ 3:00

## Bonus B-roll (terminal — proves it without the UI)
- `npm run city` → "2/2 agents paid via x402 · settled on-chain" + 🧠 Venice reasoning + gate verdicts + tx hashes
- `npm run prove:grant` → redeem under a granted ERC-7715 periodic context, tx `0xaa84…197b`
- `npm run prove:a2a` → A2A chain, status 200, tx `0x24af…ae27`
- `npm run prove:x402` → 402 → paid → 200, tx `0xbbce…450b`
- `CHAIN=base npm run prove` → the **mainnet** 1Shot redemption, tx `0x0349…448bf`
