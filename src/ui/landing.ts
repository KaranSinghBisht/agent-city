/** Landing page (GET /). Onyx theme. Agent City — an economy of agents that pay each other under caps. */
import { FONTS, THEME_CSS } from "./theme.js";

const LOGO = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="5" r="2.3" stroke="url(#lg)" stroke-width="1.6"/><circle cx="5" cy="18" r="2.3" stroke="url(#lg)" stroke-width="1.6"/><circle cx="19" cy="18" r="2.3" stroke="url(#lg)" stroke-width="1.6"/><path d="M11 6.7 6.2 15.6M13 6.7l4.8 8.9" stroke="url(#lg)" stroke-width="1.5"/><defs><linearGradient id="lg" x1="0" y1="0" x2="24" y2="24"><stop stop-color="#a99bff"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs></svg>`;

const TX_1SHOT = "https://basescan.org/tx/0x0349304adead048d8392722e4b89b81914c42599f2fa250078ef0b1980c448bf";
const TX_A2A = "https://sepolia.basescan.org/tx/0x24af8650b5690755e4dfad5d16947c06d753257348872c9bd73bbad8d6b2ae27";
const TX_X402 = "https://sepolia.basescan.org/tx/0xbbcecb7cbe662462794cf5cee1c7dcbf3eba22b9669e902f5b8bfb3b1272450b";

export const LANDING_HTML = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Agent City — an economy of AI agents that can't overspend</title>
<meta name="description" content="Agent City: AI agents hire and pay each other under cryptographic budgets. Sub-budgets via MetaMask delegations (A2A), payments via x402, gasless settlement via 1Shot. No agent can overspend."/>
${FONTS}
<style>${THEME_CSS}
nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);background:rgba(10,11,15,.72);border-bottom:1px solid var(--line)}
nav .container{display:flex;align-items:center;justify-content:space-between;height:64px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:-.01em;font-size:17px}
.navlinks{display:flex;align-items:center;gap:8px}
.navlinks a.tab{padding:8px 12px;border-radius:9px;color:var(--fg-2);font-size:14px;font-weight:500}
.navlinks a.tab:hover{color:var(--fg);background:var(--surface)}
section{padding:96px 0}
.hero{padding:84px 0 72px}
.hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:52px;align-items:center}
.hero h1{font-size:clamp(38px,5.4vw,60px);font-weight:800;margin:18px 0 0}
.hero .lede{margin-top:22px;font-size:18px;color:var(--fg-2);max-width:40ch}
.cta-row{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:34px}
.chip{display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;border:1px solid var(--line-2);background:var(--bg-2);font-size:13px;color:var(--fg-2);font-weight:500}

/* delegation tree visual */
.treecard{background:linear-gradient(180deg,var(--surface),#101219);border:1px solid var(--line-2);border-radius:20px;padding:26px 22px;
  box-shadow:0 30px 80px -40px var(--glow);animation:fadeUp .6s ease both}
.treecard .mlabel{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-2);font-weight:700;text-align:center;margin-bottom:18px}
.tree{display:flex;flex-direction:column;align-items:center}
.agent{background:var(--bg-2);border:1px solid var(--line-2);border-radius:12px;padding:11px 16px;text-align:center;min-width:188px;display:flex;flex-direction:column;gap:3px}
.agent .role{font-weight:600;font-size:14px}
.agent .cap{font-family:var(--mono);font-size:12px;color:var(--accent-2)}
.agent .pay{font-size:11px;color:var(--fg-3)}
.agent.top{border-color:rgba(139,124,255,.5);box-shadow:0 0 0 3px rgba(139,124,255,.08)}
.stem{width:2px;height:18px;background:var(--line-2)}
.branchlabel{font-size:12px;color:var(--fg-3);margin:8px 0}
.tier2{display:flex;gap:14px}
.agent.sm{min-width:152px;padding:10px 13px}
.enforced{margin-top:18px;color:var(--ok);font-weight:600;font-size:13px;text-align:center}

.shead{text-align:center;max-width:640px;margin:0 auto 52px}
.shead h2{font-size:clamp(28px,3.6vw,40px);font-weight:700}
.shead p{margin-top:14px;color:var(--fg-2);font-size:17px}

.steps{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
.step{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:20px}
.step .n{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-weight:700;font-size:14px;
  background:rgba(139,124,255,.14);color:var(--accent-2);margin-bottom:14px}
.step h3{font-size:15px;margin-bottom:7px}
.step p{font-size:13.5px;color:var(--fg-2);line-height:1.55}

.proof-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.proof{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:22px;display:flex;flex-direction:column;transition:.2s ease}
.proof:hover{border-color:var(--line-2);transform:translateY(-2px)}
.proof.hero-card{background:linear-gradient(180deg,#16132099,#101219);border-color:rgba(139,124,255,.35)}
.proof .tag{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--accent-2);margin-bottom:12px}
.proof h3{font-size:18px;margin-bottom:8px}
.proof p{font-size:14px;color:var(--fg-2);flex:1}
.proof .link{margin-top:16px;font-size:13.5px;font-weight:600;color:var(--accent-2);display:inline-flex;align-items:center;gap:6px}
.proof .link:hover{color:#fff}

.trust{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.trust .card h3{font-size:16px;margin-bottom:8px;display:flex;align-items:center;gap:9px}
.trust .card p{font-size:14px;color:var(--fg-2)}

.ctaband{background:linear-gradient(180deg,#13131f,#0e0f15);border:1px solid var(--line-2);border-radius:22px;padding:54px;text-align:center;box-shadow:0 40px 100px -50px var(--glow)}
.ctaband h2{font-size:clamp(26px,3.4vw,38px)}
.ctaband p{margin:14px auto 28px;color:var(--fg-2);max-width:48ch}

footer{border-top:1px solid var(--line);padding:40px 0;margin-top:40px}
footer .container{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
footer .fl{display:flex;gap:18px;color:var(--fg-3);font-size:14px}
footer .fl a:hover{color:var(--fg)}

@media(max-width:900px){
  section{padding:64px 0}.hero{padding:48px 0}
  .hero-grid{grid-template-columns:1fr;gap:40px}
  .steps{grid-template-columns:repeat(2,1fr)}
  .proof-grid,.trust{grid-template-columns:1fr}
  .ctaband{padding:36px 22px}
}
</style></head>
<body>

<nav><div class="container">
  <a class="brand" href="/">${LOGO} Agent City</a>
  <div class="navlinks">
    <a class="tab" href="#how">How it works</a>
    <a class="tab" href="#proof">Proof</a>
    <a class="btn btn-primary" href="/app">Enter the city →</a>
  </div>
</div></nav>

<header class="hero"><div class="container hero-grid">
  <div>
    <span class="eyebrow">MetaMask Smart Accounts · 1Shot · Venice</span>
    <h1>An economy of AI agents that <span class="grad">hire and pay each other.</span></h1>
    <p class="lede">Give one agent a budget. It hires specialists, hands each a smaller budget, and they pay for what they need — all on-chain. And not one of them can overspend. The limit is a MetaMask delegation, not a promise.</p>
    <div class="cta-row">
      <a class="btn btn-primary btn-lg" href="/app">Enter the city →</a>
      <a class="btn btn-lg" href="#proof">View the proof ↗</a>
    </div>
    <div class="chips">
      <span class="chip">● Capped sub-budgets (A2A)</span>
      <span class="chip">● Agents pay agents (x402)</span>
      <span class="chip">● Gasless via 1Shot</span>
      <span class="chip">● Private brains (Venice)</span>
    </div>
  </div>
  <div class="treecard">
    <div class="mlabel">The delegation tree</div>
    <div class="tree">
      <div class="agent top"><span class="role">Mayor · you</span><span class="cap">grants ≤ 5.00 USDC</span></div>
      <div class="stem"></div>
      <div class="agent"><span class="role">Manager agent</span><span class="cap">budget ≤ 5.00 USDC</span></div>
      <div class="branchlabel">re-delegates capped sub-budgets ↓</div>
      <div class="tier2">
        <div class="agent sm"><span class="role">Research agent</span><span class="cap">≤ 0.50 USDC</span><span class="pay">pays data API · x402</span></div>
        <div class="agent sm"><span class="role">Data agent</span><span class="cap">≤ 0.50 USDC</span><span class="pay">pays oracle · x402</span></div>
      </div>
      <div class="enforced">● every budget enforced on-chain — overspend reverts</div>
    </div>
  </div>
</div></header>

<section id="how"><div class="container">
  <div class="shead"><h2>How the city runs</h2>
    <p>A full agent economy where every transaction is bounded by cryptography, not trust.</p></div>
  <div class="steps">
    <div class="step"><div class="n">1</div><h3>Fund the city</h3><p>You grant a Manager agent a master budget — a MetaMask Smart Account delegation scoped to a hard cap.</p></div>
    <div class="step"><div class="n">2</div><h3>Hire specialists</h3><p>The Manager re-delegates <em>narrower</em> sub-budgets to worker agents. A worker can never exceed what it was handed.</p></div>
    <div class="step"><div class="n">3</div><h3>Agents pay agents</h3><p>Workers pay for data and services via x402 pay-per-call — settled gaslessly through 1Shot, gas in USDC.</p></div>
    <div class="step"><div class="n">4</div><h3>Bounded by crypto</h3><p>Every budget is an on-chain caveat. Overspend is impossible — the transaction simply reverts.</p></div>
    <div class="step"><div class="n">5</div><h3>Revoke the city</h3><p>Pull all authority in one click and the entire hierarchy goes dark instantly.</p></div>
  </div>
</div></section>

<section id="proof"><div class="container">
  <div class="shead"><h2>Proven on-chain — not a mock</h2>
    <p>The hard parts already work on Base. Tap through to the transactions.</p></div>
  <div class="proof-grid">
    <div class="proof hero-card"><div class="tag">Best A2A coordination</div><h3>Agents hire agents</h3>
      <p>A manager re-delegates a <em>narrower</em> budget to a worker. The chain enforces the smaller cap — coordination by cryptography, not trust.</p>
      <a class="link" href="${TX_A2A}" target="_blank" rel="noopener">View the redelegation tx ↗</a></div>
    <div class="proof hero-card"><div class="tag">Best x402 + ERC-7710</div><h3>Agents pay agents</h3>
      <p>A worker hits a real HTTP 402 paywalled service and settles the price as a bounded ERC-7710 redemption, then unlocks the resource.</p>
      <a class="link" href="${TX_X402}" target="_blank" rel="noopener">View the x402 payment tx ↗</a></div>
    <div class="proof"><div class="tag">Best 1Shot relayer</div><h3>Gasless settlement</h3>
      <p>Every payment redeems through 1Shot's permissionless relayer, gas paid in USDC. Proven on <b>Base mainnet</b>, not just testnet.</p>
      <a class="link" href="${TX_1SHOT}" target="_blank" rel="noopener">View mainnet tx ↗</a></div>
    <div class="proof"><div class="tag">Best Agent</div><h3>Bounded autonomy</h3>
      <p>Each agent runs a resumable planner — reason, propose, act — but only inside its cap, pausing for approval on anything that moves value.</p>
      <a class="link" href="/app">Enter the city →</a></div>
    <div class="proof"><div class="tag">Best use of Venice AI</div><h3>Private brains</h3>
      <p>Every agent reasons with Venice's zero-retention model and reads the chain through Venice's own Crypto-RPC.</p>
      <a class="link" href="/app">Enter the city →</a></div>
    <div class="proof" style="background:linear-gradient(180deg,#15131f,#101219);border-color:var(--line-2)">
      <div class="tag">The thesis</div><h3>The budget <em>is</em> the leash</h3>
      <p>Letting agents coordinate and spend is the unsolved part. Agent City solves it with on-chain caps — so autonomy never means unbounded risk.</p>
      <a class="link" href="/app">See it move money →</a></div>
  </div>
</div></section>

<section><div class="container">
  <div class="shead"><h2>Why you can trust a city of agents</h2></div>
  <div class="trust">
    <div class="card"><h3>🔑 No agent holds your keys</h3><p>Agents sign nothing on your behalf beyond the scoped delegations you grant down the tree.</p></div>
    <div class="card"><h3>⛓️ Every cap is cryptographic</h3><p>Budgets are on-chain caveats, not prompts. Exceed one and the transaction reverts — by construction.</p></div>
    <div class="card"><h3>⨯ Revoke the whole tree</h3><p>Pull authority at any level instantly. Cut the Manager and every worker beneath it loses power too.</p></div>
  </div>
</div></section>

<section style="padding-top:0"><div class="container">
  <div class="ctaband">
    <h2>Watch a city of agents transact under hard caps.</h2>
    <p>The live demo runs it on Base: the Manager hires workers, they pay via x402, 1Shot settles on-chain — and you can revoke the whole city.</p>
    <a class="btn btn-primary btn-lg" href="/app">Enter the city →</a>
  </div>
</div></section>

<footer><div class="container">
  <a class="brand" href="/">${LOGO} Agent City</a>
  <div class="fl">
    <a href="#how">How it works</a>
    <a href="#proof">Proof</a>
    <a href="/app">Enter the city</a>
    <span class="muted">Proven on Base Sepolia + Base mainnet</span>
  </div>
</div></footer>

</body></html>`;
