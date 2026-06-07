# Steward — 3-minute demo video script

**Goal:** show MetaMask delegation working in the **main flow** (the hard gate), with Venice + 1Shot.
**Setup:** screen-record `npm run dev` (the dashboard) with a Basescan tab open in another window. Keep it ≤ 3:00.
**Tag** @MetaMaskDev in the post (Best Social) and mention #DevCookOff.

---

### Scene 1 — Hook (0:00–0:20)
**Show:** the Steward dashboard with the green **LIVE** banner.
**Say:** "This is Steward — an AI treasurer you can hand a budget to. Every other agent-with-a-wallet asks you to trust it with a key. Steward *can't* overspend — because the limit is a MetaMask delegation enforced on-chain, not by trust."

### Scene 2 — The cryptographic budget (0:20–0:50)
**Show:** the policy card (budget token, per-tx cap, daily cap, delegation **active**) and the banner (treasury + payee).
**Say:** "Here's the budget: USDC, a per-transaction cap, a daily cap. The agent holds a MetaMask Smart Account delegation scoped to exactly this. It physically cannot move more than I allowed."
> If you add the browser EIP-7715 grant later, show the MetaMask **"Grant permission"** prompt here — that's the strongest hard-gate moment.

### Scene 3 — Reason over on-chain data (0:50–1:30)
**Show:** click **Run**. Point to the prepended context line in the goal/audit.
**Say:** "I give it a goal. First it reads the chain — through *Venice's own Crypto-RPC* — to see the treasury balance. Then a private Venice model, zero data retention, reasons about it and proposes a specific, bounded spend." Point to the proposed `transfer` action.

### Scene 4 — Human approval gate (1:30–1:55)
**Show:** the **"Approval required"** box.
**Say:** "Anything that moves value pauses for me. The policy mirrors the on-chain cap, so the agent never even proposes something the chain would reject." Click **Approve**.

### Scene 5 — Gasless settlement via 1Shot (1:55–2:35)
**Show:** the relayer task line going **Submitted → Confirmed**; switch to the **Basescan** tab on the tx/address.
**Say:** "On approval it redeems the delegation through the 1Shot permissionless relayer — gas paid in USDC, the account upgraded via EIP-7702 — and settles on-chain. No ETH, no paymaster, no API key. Here's the confirmed transaction."

### Scene 6 — Revoke + close (2:35–3:00)
**Show:** click **Revoke all authority** → status **REVOKED**.
**Say:** "And I can kill all authority instantly. One build: private reasoning with Venice, bounded spending under a MetaMask delegation, gasless execution via 1Shot. The delegation *is* the product."

---

## Capture checklist (the judging hard gate lives here)
- [ ] LIVE banner on screen (proves real, not a mock)
- [ ] the on-chain context line (Venice Crypto-RPC reading the balance)
- [ ] the proposed spend + the **approval gate** clicked
- [ ] the **Basescan transaction** shown (MetaMask delegation redeemed on-chain — the hard gate)
- [ ] **revoke** shown
- [ ] ≤ 3:00 total

## Alternative B-roll
- A terminal running `npm run demo` end-to-end (reads → proposes → approves → `✅ Confirmed on-chain`) makes a clean 30-second insert proving the loop without UI.

---

## Bonus-track inserts — A2A + x402 (record these too)

These two tracks are **proven on-chain** but live in the CLI, not the web dashboard. Judges score what
they see — so capture a short terminal clip of each (≤ 30s) and either splice them in after Scene 5 or
attach as a short "bonus" tail. Each ends on a real Base Sepolia transaction.

### Insert A — Agent-to-agent redelegation (Best A2A Coordination)
**Run:** `npm run prove:a2a`
**Show:** the terminal building the 2-link chain, then `status 200`, then the tx hash → cut to Basescan on
tx `0x24af8650b5690755e4dfad5d16947c06d753257348872c9bd73bbad8d6b2ae27`.
**Say:** "Steward can also delegate to *other* agents — safely. A principal grants a manager a ≤ 1 USDC
budget; the manager re-delegates a *narrower* ≤ 0.5 USDC sub-budget to a worker. The chain enforces the
smaller cap on-chain — a sub-agent can never exceed what it was handed. Agent-to-agent coordination where
the limits are cryptographic, not trust."

### Insert B — x402 pay-per-call (settled via ERC-7710)
**Run:** `npm run prove:x402`
**Show:** the terminal: HTTP **402** challenge → payment → **200** + the resource, then "service received
0.05 USDC" → cut to Basescan on tx
`0xbbcecb7cbe662462794cf5cee1c7dcbf3eba22b9669e902f5b8bfb3b1272450b`.
**Say:** "And Steward pays for things autonomously. This hits a real HTTP 402 paywalled API; Steward
settles the 0.05 USDC price by redeeming its delegation through 1Shot — bounded by the same budget — then
gets the data. Pay-per-call for agents, enforced by the same on-chain limit."

> Keep the **core** video ≤ 3:00 telling the one story (the hard gate). Treat these as optional inserts or
> a short bonus tail so the A2A and x402 tracks have on-screen evidence.
