# Agent City — demo flow + narration (the words to speak)

**Length target: ~2:20 (hard cap 3:00).** Talk like a person, not a pitch deck — contractions, short
sentences, a little edge. The climax is **negation**: the agent *trying* to spend and being *refused*.
(This script was reviewed by an adversarial critic; honesty fixes are baked in — every line below is
true to the code.)

**Before you hit record**
- `npm run dev` → http://localhost:8787 ; stage the grant once: `npm run grant:dev` (so `/app` shows
  *Budget root: ERC-7715*). Do every take in ONE server session (City Hall + reputation reset on restart).
- Have a **Basescan** tab ready. Confirm the 1Shot relayer is up (do one throwaway `Commission work` first).
- Honesty guardrails: the live run settles on **Base Sepolia**; the **mainnet** 1Shot proof is a separate
  tx (B-roll). Don't imply the Flask popup if you used `grant:dev`. Revoke is an **instant server-side
  cut-off** (no new spend clears) — do NOT call it an on-chain/"same-block" revocation; we don't submit one.

Each beat = **[SCREEN]** what you do · **SAY** the exact line.

---

### 0:00–0:12 — Hook (landing `/`)
**[SCREEN]** Land on `/`. The delegation tree draws itself; rest on the orange Mayor node.
**SAY:** "Giving an AI agent its own wallet is terrifying — one bad prompt and it drains the account. So I
built a spending firewall for agents. Two locks: a private AI decides *whether* to approve, an on-chain cap
decides the max. Neither one has to be trusted. Watch — I'm going to try to break it."

### 0:12–0:38 — Fund it with MetaMask (ERC-7715)
**[SCREEN]** Click the grant bar → MetaMask **Advanced Permissions** popup (or say it's pre-staged). Approve.
**SAY:** "First I fund it from MetaMask. This is an ERC-7715 Advanced Permission — five USDC a day, max. That
limit's not a setting in my code; it's enforced on-chain. And I can pull it back any second."
**[SCREEN]** Back on `/app`: Mayor panel shows **ERC-7715 · your wallet**.
**SAY:** "Now the city's treasury *is* my wallet — capped."

### 0:38–1:06 — Dispatch → A2A redelegation → the Venice gate approves
**[SCREEN]** Goal pre-filled "Produce a market brief on ETH". Click **▶ Commission work**.
**SAY:** "I give it a job and dispatch. Watch the order. The manager hires two workers and re-delegates a
*narrower* budget to each — that's ERC-7710, agent-to-agent — and the chain enforces the smaller cap, not
trust between agents. But before anyone spends a cent, the payment goes to a private Venice model —
zero-retention — that has to sign off."
**[SCREEN]** Point at the agent card: 🧠 reasoning line, then **⛨ gate: Venice APPROVED**.
**SAY:** "There — 'Venice approved: within cap, serves the goal.' Only *now* can the money move."

### 1:06–1:28 — x402 payment → 1Shot settlement → the receipt
**[SCREEN]** Ledger flips paying → **settled** (orange flash). Click **receipt ↗** → Basescan.
**SAY:** "Each worker pays a live pay-per-call service over x402, settled on Base through the 1Shot relayer —
gas in USDC, no ETH needed. And it's real: here's the actual transaction — the delegation redemption, the
USDC moving. Every payment is a receipt you can check yourself."

### 1:28–1:40 — The deliverable (the payoff)
**[SCREEN]** A signal-orange **Deliverable** block appears at the top of the log with the brief.
**SAY:** "And here's what I actually paid for — the brief itself. Venice wrote it from *only* what the agents
bought: that live ETH price, the sentiment read. I asked for a market brief; the agents earned it and produced one."

### 1:40–2:08 — 🔒 THE MONEY SHOT: try to make it misbehave
**[SCREEN]** Back to `/app`. Click **⚠ Try a bad spend**.
**SAY:** "Okay — now let me attack my own agent. I'm telling it to do something off-mission, nothing to do
with the job. Dispatch…"
**[SCREEN]** Cards go red: **⛨ gate: Venice BLOCKED**, ledger status **blocked**, receipt column empty.
**SAY:** "…and it's blocked. 'Venice blocked — goal violates the treasury mission.' Look at the ledger:
nothing settled, and there's *no transaction* — none. The money never moved, because the private model
refused it *before* the chain ever saw it. And if Venice is unreachable, it fails closed: no approval, no spend."

### 1:58–2:12 — Second lock + cut-off
**[SCREEN]** (Optional) gesture at the cap; then click **Revoke the city** → map dims red, dispatch disabled.
**SAY:** "That's lock one — the AI. Lock two is just math: even if you jailbroke the model into approving
something too big, the on-chain cap reverts it. And if I'm done — one click, revoke, and every agent is cut
off before its next spend can even start."

### 2:12–2:24 — Close (landing `/`)
**[SCREEN]** Back on `/`, cursor on "The delegation *is* the cap."
**SAY:** "That's the firewall. MetaMask delegations for the cap, a private Venice gate for the approval, 1Shot
for gasless settlement — all real, on Base. I gave an agent real money, and I never had to trust it."

---

### Optional B-roll (10–20s, if you want to hammer "not a mock")
**SAY (over terminal):** "Same loop from the command line — and on **mainnet**." Run `npm run city` (2 agents
paid, 🧠 reasoning, ⛨ gate verdicts, tx hashes), then flash the mainnet 1Shot tx `0x0349…448bf` on Basescan.
**SAY (one line, for the 1Shot track):** "Status comes from a signature-verified 1Shot webhook — Ed25519,
checked against their JWKS — with polling as the fallback." (Show `src/webhook.ts` / the `POST /webhooks/1shot`
route briefly; don't belabor it.)

### Load-bearing tech this flow must show (checklist)
- [ ] MetaMask **ERC-7715** Advanced Permission grant (the cap)
- [ ] **ERC-7710 A2A** redelegation — manager → worker narrower sub-budget (say "re-delegates" out loud)
- [ ] **Venice** private spend-gate — APPROVED on the good run, **BLOCKED** on the bad one (fail-closed)
- [ ] **x402** pay-per-call → settled as a 7710 redemption
- [ ] **1Shot** relayer settlement — gas in USDC, Basescan receipt (+ mainnet B-roll, + webhook one-liner)
- [ ] **Revoke** instant cut-off (server-side — not "on-chain/same-block")
- [ ] The **"no transaction"** beat — the single most memorable, un-copyable moment (do not cut)
