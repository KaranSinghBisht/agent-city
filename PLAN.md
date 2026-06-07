# MetaMask Smart Accounts × 1Shot API × Venice AI — Dev Cook-Off — Build Plan

> **For the next Claude Code instance:** You are building a submission to win cash at the **MetaMask
> Dev Cook-Off** on HackQuest — **$14,000 pool**, deadline **June 15, 2026, 10:59 UTC** (= 3:59 AM
> PDT — a US-night cutoff, earlier than it looks; ~4:29 PM IST). This is
> web3 (account abstraction / ERC-7710 delegation). The single biggest strategic lever: **prizes
> stack** — one project can win a core track + Best Venice AI + Best 1Shot Relayer ≈ **$7,000**.
> The hard gate: **MetaMask Smart Accounts / delegated permissions must be in the main flow** of
> your demo, or you're disqualified from every track. Read this whole file, then start.

---

## At a glance

| | |
|---|---|
| **Official name** | MetaMask Smart Accounts Kit x 1Shot API x Venice AI Dev Cook-Off |
| **Host** | MetaMask Developer (Consensys) + 1Shot API + Venice AI |
| **URL** | https://www.hackquest.io/hackathons/MetaMask-Smart-Accounts-Kit-x-1Shot-API-x-Venice-AI-Dev-Cook-Off |
| **Platform** | HackQuest (NOT Devpost) |
| **Status** | OPEN · ~145 devs registered — **the smallest field of any hackathon in this campaign** (best odds-per-entrant) |
| **Submission deadline** | **June 15, 2026, 10:59 UTC** (CONFIRMED) = 3:59 AM PDT / 6:59 AM EDT / ~4:29 PM IST — a US-night cutoff, plan accordingly |
| **Winners** | June 22, 2026 |
| **Format** | Online; solo allowed; no stated team cap |
| **Community** | MetaMask Telegram https://t.me/+I2dliwXiqqYyYjMx · Consensys Discord https://discord.com/invite/consensys |

### Prizes ($14,000 total — and they STACK)
- **4 core tracks @ $3,000 each** (1st $1,500 / 2nd $1,000 / 3rd $500): **x402 + ERC-7710**,
  **Best Agent**, **Best A2A Coordination**, **Best Use of Venice AI**.
- **Best Use of 1Shot Permissionless Relayer — $1,000 USDC** (2 winners).
- Community: Best Social ($100×5), Best Feedback ($100×5).
- ⭐ **Stacking rule:** the Venice and 1Shot prizes are *add-ons* — your project must first qualify
  for a core build track (x402+7710, Agent, or A2A) to be eligible. **So a single project can win a
  core track ($3k) + Best Venice AI ($3k) + Best 1Shot Relayer ($1k) = up to $7,000.** This is the
  whole game plan.

---

## Required tech (hard requirements)

**Mandatory for ALL projects:** MetaMask **Smart Accounts Kit** *or* **Advanced Permissions
(ERC-7715)**, demonstrably working in the **main flow** of the demo video. (Signer-agnostic — use
MetaMask extension, Embedded Wallets, Dynamic, or Privy.)

1. **MetaMask Smart Accounts Kit** (formerly Delegation Toolkit) — Viem-based ERC-4337 account
   abstraction with **delegation** (ERC-7710: create/redeem delegations + **redelegation**) and
   **ERC-7715** advanced permissions. npm: `@metamask/smart-accounts-kit` (or legacy
   `@metamask/delegation-toolkit`). Docs: https://docs.metamask.io/smart-accounts-kit/. Free, no key.
2. **1Shot API — Permissionless Relayer** — executes EIP-7710 transactions with **gas paid in
   stablecoins**, supports EIP-7702 EOA→smart-account upgrade. **No API key needed.** Docs:
   https://docs.1shotapi.com/ · quickstart: https://1shotapi.com/docs/quickstarts/gas-sponsorship-eip7710.
   Installable agent skill: `npx skills add 1Shot-API/skills/public-relayer` (works in Claude Code).
3. **Venice AI API** — privacy-first, **OpenAI-compatible** inference. Base URL
   `https://api.venice.ai/api/v1` (drop-in OpenAI SDK; use Venice model IDs like
   `venice-uncensored`). Key: https://venice.ai/settings/api. Pay via a few $ of credits or **x402
   USDC on Base** (which also fits the hackathon theme). Docs: https://docs.venice.ai/.

---

## The winning project (recommended)

> **"AutoPilot Treasury" — an autonomous DCA / treasury agent with a Venice AI risk brain, executing
> on-chain under a scoped MetaMask permission, with gas paid in USDC via the 1Shot relayer.**
> Targets **Best Agent ($3k) + Best Venice AI ($3k) + Best 1Shot Relayer ($1k) = up to $7,000.**

**Why it wins:** It hits the exact thing the three sponsors want to see working together, with the
hard primitives (delegation, 7702-upgrade, stablecoin-gas relaying) front and center, and it stacks
three payable prizes in one build. It's achievable solo.

**Flow:**
1. User grants an **ERC-7715 "spend ≤ X USDC/day"** advanced permission to the agent.
2. A **Venice** model ingests market/on-chain data and decides *when/how much* to buy (a meaningful
   AI action that drives an on-chain transaction — not a bolted-on chatbot).
3. The agent executes the swap as an **ERC-7710 redemption**, with **gas paid in USDC through the
   1Shot permissionless relayer** (and uses **7702** to upgrade the EOA). Prefer relayer
   **webhooks** over polling for tx status — explicitly rewarded.
4. *(Stretch for A2A track too:)* the agent **redelegates** a smaller daily cap to a "rebalancer"
   sub-agent — that single addition makes you eligible for **Best A2A Coordination** as well.

### Backups
- **A2A "manager → worker" spending network** (max stacking): a manager holds a scoped permission
  and **redelegates** narrower caps to specialized workers; Venice is the manager's planner. Targets
  A2A + x402+7710 + Venice + 1Shot. Highest ceiling, highest effort.
- **x402 pay-per-use AI marketplace**: an x402-gated endpoint serving Venice inference; an agent
  buyer pays per request via an ERC-7710 permission with 1Shot settling gas in stablecoins. Most
  on-thesis combo of all three sponsors.

---

## Architecture

```
[ User wallet ] ──ERC-7715 grant (≤X USDC/day)──▶ [ Agent ]
                                                     │
                          [ Venice AI: decide buy ]  │  reads market/on-chain data
                                                     ▼
                              ERC-7710 redemption ──▶ [ 1Shot Permissionless Relayer ]
                                                          │  gas paid in USDC, 7702 upgrade,
                                                          ▼  webhook tx status
                                                     [ DEX swap on-chain ]
        (stretch) Agent ──redelegate ≤Y/day──▶ [ Rebalancer sub-agent ]  → A2A track
```

---

## Build plan

**Phase 0 — Setup (day 1)**
1. Register on HackQuest. Join the MetaMask Telegram. Watch the recorded 1Shot (May 26) + x402/7710
   (May 28) workshops.
2. In Claude Code, install the helper skills: `npx skills add 1Shot-API/skills/public-relayer` and
   pull the Venice skills repo (https://github.com/veniceai/skills).
3. Get a Venice API key; fund a few $ of credits (or set up x402 USDC on Base).

**Phase 1 — The hard part first (de-risk): delegation core**
4. Start from **Scaffold-ETH 2 + `@metamask/smart-accounts-kit`**. Get a **delegation redeeming on a
   testnet** before anything else — this is the gate; if it doesn't work, nothing else matters.

**Phase 2 — AI brain**
5. Wire **Venice** (one-line OpenAI baseURL swap) to make the buy/size decision from market data.
   Ensure it produces a *meaningful action*, then feeds the on-chain tx.

**Phase 3 — Relayer + 7702**
6. Route the ERC-7710 redemption through the **1Shot permissionless relayer** with gas in USDC; use
   **7702** to upgrade the account; subscribe to **webhooks** for status. (This is the
   under-contested $1k bonus — nail it.)

**Phase 4 — Stretch + submission**
7. Add **redelegation** to a sub-agent for the A2A track.
8. Record the demo video that **explicitly shows** the MetaMask integration in the main flow, the
   7710 redemption, the relayer tx, and the Venice call (the video is the load-bearing artifact).
9. Public repo + README. Submit via the HackQuest project flow before June 15.
10. **Free EV:** post a build thread on X tagging **@MetaMaskDev** with event hashtags (Best Social,
    $100×5) and submit thoughtful tooling feedback (Best Feedback, $100×5).

---

## Judging notes

Judges-only scoring, max 100 pts/judge; no published numeric weights. Effective priorities:
1. Does the MetaMask Smart Accounts / permissions integration **actually work in the main flow**? (hard gate)
2. Is the agentic/delegation story **central, not cosmetic**?
3. Did you exercise the spicy primitives correctly — **redelegation, x402, 7702-upgrade via 1Shot,
   webhooks**?
4. Does **Venice** produce a *meaningful* AI action that drives an on-chain decision?

---

## Pitfalls to avoid

- ❌ MetaMask as a login button — the main *flow* must use delegation/permissions, or you're out of
  every track.
- ❌ Venice as a throwaway chatbot — rules demand a "meaningful AI-powered output/action."
- ❌ Skipping the hard primitives — redelegation + 7702 + 1Shot webhooks are where the points and
  the **low-competition $1k bonus** live.
- ❌ A demo video that doesn't clearly *show* the integration working.

---

## Low-competition angles

- **Best Use of 1Shot Permissionless Relayer ($1,000, only 2 winners)** — fiddly 7702 + mainnet
  relayer + webhook path, so likely under-contested. Small field.
- **Webhooks over polling** — explicitly rewarded, almost nobody bothers.
- **A2A redelegation** — hardest core track, so fewer complete entries; a working demo stands out.

---

## Key links

- Hackathon: https://www.hackquest.io/hackathons/MetaMask-Smart-Accounts-Kit-x-1Shot-API-x-Venice-AI-Dev-Cook-Off
- MetaMask Smart Accounts Kit: https://docs.metamask.io/smart-accounts-kit/ · redelegation guide:
  https://docs.metamask.io/smart-accounts-kit/guides/delegation/create-redelegation/ · x402:
  https://docs.metamask.io/smart-accounts-kit/guides/x402/overview/
- 1Shot: https://docs.1shotapi.com/ · EIP-7710 quickstart: https://1shotapi.com/docs/quickstarts/gas-sponsorship-eip7710 · skill: `npx skills add 1Shot-API/skills/public-relayer`
- Venice: https://docs.venice.ai/ · models https://docs.venice.ai/models/overview · skills https://github.com/veniceai/skills
- 1Shot blog (context): https://1shotapi.com/blog/metamask-1shot-api-dev-cook-off
