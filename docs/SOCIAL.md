# Steward — build-in-public thread (Best Social)

**Where:** X/Twitter, from your handle. **Tag** @MetaMaskDev, mention Venice + 1Shot, hashtag **#DevCookOff**.
**Attach:** the demo video (or a clip) to tweet 1 or tweet 8. **Pin** the thread.
**Do NOT** link the GitHub repo while it's private — point people at the demo video instead.

> ⚠️ Verify handles before posting: **@MetaMaskDev** (confirmed). Venice = likely **@AskVenice** — confirm.
> 1Shot — confirm their handle (search "1Shot API") before adding an @; otherwise just write "1Shot".

---

## Thread (8 tweets)

**1/**
Every "AI agent with a wallet" asks you to trust it with your keys.

I built the opposite: Steward 🛡️ — an AI treasurer that's *cryptographically incapable* of overspending.

The spending limit isn't a prompt. It's a @MetaMaskDev delegation enforced on-chain. #DevCookOff 🧵

**2/**
The flip: the agent never holds your keys.

You grant it a MetaMask Smart Account delegation scoped to an exact budget (≤ X USDC/day, one payee). It can spend only inside that — exceed it and the chain itself rejects the tx.

The delegation IS the product.

**3/**
It reasons privately.

Steward thinks with @AskVenice's zero-retention private model and reads the chain through Venice's own Crypto-RPC. Your treasury moves never become anyone's training data.

**4/**
It asks before spending.

Every value-moving action pauses for human approval — and the off-chain policy mirrors the on-chain cap, so the agent never even proposes what the chain would reject.

**5/**
It settles gaslessly.

On approval, Steward redeems the delegation through the 1Shot permissionless relayer: gas paid in USDC, the account upgraded via EIP-7702. No ETH, no paymaster, no API key.

**6/**
Agents can delegate to other agents — safely.

A manager re-delegates a narrower sub-budget to a worker (≤1 → ≤0.5 USDC). The chain enforces the smaller cap, not trust.

Proven on-chain: 0x24af…ae27

**7/**
And it pays for things itself.

Steward hits a real HTTP 402 paywalled API and settles the price as an ERC-7710 redemption — pay-per-call for agents, bounded by the same budget.

Proven on-chain: 0xbbce…450b

**8/**
Not a mock — the whole loop runs on Base: private reasoning → bounded spend → human approval → gasless settle → revoke anytime.

🛡️ Steward = @MetaMaskDev Smart Accounts + 1Shot + @AskVenice
#DevCookOff
▶️ [demo video link]

---

## One-tweet version (if you'd rather not thread)

Most "AI agents with wallets" want your keys. Steward 🛡️ wants none of them.

It's an AI treasurer that *physically can't* overspend — the limit is a @MetaMaskDev delegation enforced on-chain. Private reasoning via @AskVenice, gasless settle via 1Shot, revoke anytime.

#DevCookOff ▶️ [video]

---

## Posting notes
- **Best Social criterion (from the official rules):** you must tag **@MetaMaskDev** *and* showcase how
  **MetaMask Smart Accounts / Advanced Permissions** improved the UX of *obtaining permissions from the
  user*. Tweets 1–2 hit this (the scoped delegation IS that permission UX) — keep that framing front-and-center.
- Each tweet is ≤ 280 chars; trim if your client disagrees on the emoji counts.
- Best order: post tweet 1 with the video, then reply-chain 2→8.
- Replace `0x24af…ae27` / `0xbbce…450b` with full Basescan links if you want clickthrough.
- After posting, drop the thread URL back here so we can reference it in the HackQuest submission (Best Social).
