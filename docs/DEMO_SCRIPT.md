# Agent City — ≤3-minute demo video script

**Thesis to sell:** a **spending firewall for AI agents** — *two locks* on every payment: a **private Venice
gate** that says *whether*, and a **MetaMask on-chain cap** that says *how much*. Neither trusted; both enforced.
**The "oh damn" is a moment of NEGATION the judge watches live — the agent trying to spend and being physically
stopped.** Don't show a city working; show a firewall refusing.

**Setup:** `npm run dev` (http://localhost:8787/app) + a Basescan tab. Stage a grant: `npm run grant:dev`.
Do all takes in ONE server session (City Hall stats + reputation reset on restart). Confirm the 1Shot relayer
is up right before recording. Keep it ≤ 2:30. **Tag** @MetaMaskDev, #DevCookOff.

> Qualification: the video MUST show the MetaMask Smart Accounts Kit in the MAIN FLOW. Satisfied because every
> spend is a MetaMask Smart Account delegation **redeemed on-chain** (show the Basescan receipt). The `/grant`
> Advanced Permissions popup is the strongest on-camera "MetaMask" moment.

## Track focus (be best in ONE, not present in six)
Primary **Best 1Shot** (your floor) + **Best A2A** (the swing). The demo also earns **Best Venice** via the
gate. Do **not** pitch Best Agent.

---

### 0:00–0:25 — SETUP: the nervous human
**Say:** "I'm giving an AI agent real money on Base — and then trying to make it misbehave. Watch it fail."
**Show:** `/app`. Point at the title: **Spending firewall**. Open `/grant` → grant the budget (honest fallback:
`npm run grant:dev` if Flask is flaky — same `parseGrant` path, proven on-chain). Back on `/app`: Mayor panel
shows **Budget root: ERC-7715 0x… (your wallet)**, the React Flow city map, ticker of real proof tx hashes.

### 0:25–1:05 — NORMAL PATH: both locks fire, in order
**Show:** click **▶ Commission work**. On the agent card / ledger, narrate the ORDER:
1. Venice **reasoning** line → **⛨ gate: Venice APPROVED**, *then*
2. ledger **paying → settled** (orange flash), *then*
3. click **receipt ↗** → Basescan **RedeemedDelegation** events.
**Say:** "The private model approved it *first*. Only then could the on-chain cap be redeemed. Approval is a
precondition, not a log line — and this is a real transaction, gas paid in USDC through 1Shot, no ETH."

### 1:05–1:45 — 🔒 MONEY SHOT: Lock 1 refuses (no competitor can copy this)
**Show:** click **⚠ Try a bad spend**. The agent cards go **red**, **⛨ gate: Venice BLOCKED** with its reason,
the ledger entries read **blocked** — and there is **NO transaction, no receipt, nothing on-chain**.
**Say:** "The agent wanted to spend. The private brain said no. Notice what's *missing* — there is no
transaction, because the money never got the chance to move. The block happened in private cognition, before
the chain ever saw it. And if Venice is unreachable, it fails **closed** — no approval, no spend."

### 1:45–2:10 — Lock 2: the math stops you even if you fool the AI
**Say:** "But what if you jailbreak the brain into approving something too big?" 
**Show:** the second lock — an over-cap amount reverts at the **ERC-7710** layer (the deterministic cap-floor +
the chain itself). "Two independent locks. Fool the AI and the math still stops you. The cap is enforced by the
chain, not by the agent's goodwill." (A2A: the Manager re-delegated each worker a *narrower* cap it cannot exceed.)

### 2:10–2:30 — Kill switch + close
**Show:** **Revoke the city** → the whole map dims red, dispatch disabled.
**Say:** "And if I trust none of it, one click revokes the whole tree — every agent is cut off before its next
spend can even start. Two locks on every agent payment: a private brain that must say *yes*, an on-chain cap
that says *how much*. I never trusted the agent. I didn't have to."

---

## Capture checklist
- [ ] MetaMask **Grant permission** popup (Advanced Permissions) on screen
- [ ] **⛨ gate: Venice APPROVED** → ledger **settled** → clickable **Basescan receipt** (delegation redeemed on-chain)
- [ ] 🔒 **⚠ Try a bad spend** → **Venice BLOCKED**, ledger **blocked**, **NO tx** (the climax)
- [ ] **Revoke** dims the city · ≤ 2:30

## Bonus B-roll (terminal — proves it without the UI; gate verdicts now print)
- `npm run city` → 2 agents paid via x402 + 🧠 Venice reasoning + **⛨ gate verdicts** + tx hashes
- `npm run prove:grant` → redeem under a granted ERC-7715 periodic context, tx `0xaa84…197b`
- `npm run prove:a2a` → A2A chain, status 200, tx `0x24af…ae27`
- `CHAIN=base npm run prove` → the **mainnet** 1Shot redemption, tx `0x0349…448bf`
