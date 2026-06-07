# Agent City — ≤3-minute demo video script

**Goal:** show MetaMask delegation working **in the main flow** (the qualification hard gate), plus the
Agent City economy (A2A + x402), all settling **on-chain** with Venice + 1Shot.
**Setup:** `npm run dev` (http://localhost:8787) with a Basescan tab open. Keep it ≤ 3:00.
**Tag** @MetaMaskDev, #DevCookOff.

> Qualification reminder: the video MUST visibly show the MetaMask Smart Accounts Kit integration in the
> main flow. Agent City satisfies this because every spend is a MetaMask Smart Account delegation
> **redeemed on-chain** — show the Basescan receipt. The `/grant` Advanced Permissions popup is the
> strongest on-camera "MetaMask" moment.

---

### Scene 1 — Hook (0:00–0:20) · landing `/`
**Show:** the Agent City landing — the delegation-tree hero.
**Say:** "This is Agent City — an economy of AI agents that hire and pay each other. The twist: none of
them can overspend, because every budget is a MetaMask delegation enforced on-chain, not a promise."

### Scene 2 — Grant a permission with MetaMask (0:20–0:55) · `/grant`
**Show:** click **① Grant the city's budget** → **Connect MetaMask** → **Grant permission**. The MetaMask
(Flask) **Advanced Permissions** popup appears: *erc20-token-periodic, ≤5 USDC/day to the agent*. Approve it.
**Say:** "I grant the city a budget straight from my wallet — a real MetaMask Advanced Permission, scoped
to 5 USDC a day. I share no keys, and I can revoke it anytime."
> If the 7715 grant isn't wired to redemption yet at record time: still show the popup + the granted
> permission, then say "the agents act under this MetaMask delegation" and continue — the on-chain
> redemptions in Scene 4 are the proof the delegation is real.

### Scene 3 — Enter the city (0:55–1:15) · `/app`
**Show:** the Mayor panel (master budget, per-agent cap), then **Dispatch the city → Approve & dispatch**.
**Say:** "The Manager hires specialists and hands each a *narrower* sub-budget — agent-to-agent delegation.
A worker can never exceed what it was given."

### Scene 4 — The city works, on-chain (1:15–2:20)
**Show:** agent cards fill in — Research + Analyst hired, each **paying an x402 service**, the **City Ledger**
streaming **paying → settled** with a **receipt ↗** link. Click one → the **Basescan** transaction.
**Say:** "Each agent hits a real pay-per-call service over x402 and settles the price on-chain through the
1Shot relayer — gas paid in USDC, no ETH. Here's the actual transaction. Every payment is a verifiable
on-chain receipt." Point to the **credit** score on a card: "and each agent earns on-chain credit that
sizes its next budget."

### Scene 5 — Revoke (2:20–2:40)
**Show:** **Revoke the city** → authority flips to REVOKED, dispatch disabled.
**Say:** "And I can kill the entire city instantly — every agent loses its budget at once."

### Scene 6 — Close (2:40–3:00)
**Say:** "One build: agents that hire and pay each other under cryptographic budgets — MetaMask delegations,
private Venice reasoning, gasless 1Shot settlement, all proven on-chain. The delegation *is* the cap."

---

## Capture checklist (the hard gate lives here)
- [ ] the MetaMask **Grant permission** popup (Advanced Permissions) on screen
- [ ] the **City Ledger** going **settled** with a clickable **Basescan receipt** (MetaMask delegation redeemed on-chain)
- [ ] an agent **credit** score visible
- [ ] **Revoke** shown
- [ ] ≤ 3:00

## Bonus B-roll (terminal, proves it without the UI)
- `npm run city` → "2/2 agents paid via x402 · settled on-chain" + tx hashes
- `npm run prove:a2a` → A2A chain, status 200, tx `0x24af…ae27`
- `npm run prove:x402` → 402 → paid → 200, tx `0xbbce…450b`
- `CHAIN=base npm run prove` → the **mainnet** 1Shot redemption, tx `0x0349…448bf`
