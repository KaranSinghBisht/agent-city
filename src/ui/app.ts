/** Agent City app (GET /app). Blueprint Civic theme. Drives /city/run + /city/run/:id and the live City Ledger. */
import { FONTS, THEME_CSS } from "./theme.js";

/** Animated blueprint crosshair — empty state SVG. Now with sonar-ping ring. */
const CROSSHAIR = `<svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" style="display:block;margin:0 auto"><circle cx="32" cy="32" r="18" fill="none" stroke="var(--dim-line)" stroke-width="1" stroke-dasharray="3 4"/><circle cx="32" cy="32" r="18" fill="none" stroke="var(--ink-3)" stroke-width="0.75" opacity="0.4"><animate attributeName="r" values="18;32;18" dur="2.4s" begin="0.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" begin="0.8s" repeatCount="indefinite"/></circle><circle cx="32" cy="32" r="5" fill="none" stroke="var(--ink-3)" stroke-width="1"><animate attributeName="r" values="5;8;5" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite"/></circle><line x1="32" y1="4" x2="32" y2="22" stroke="var(--ink-3)" stroke-width="1"/><line x1="32" y1="42" x2="32" y2="60" stroke="var(--ink-3)" stroke-width="1"/><line x1="4" y1="32" x2="22" y2="32" stroke="var(--ink-3)" stroke-width="1"/><line x1="42" y1="32" x2="60" y2="32" stroke="var(--ink-3)" stroke-width="1"/></svg>`;

/** Ghost ledger rows shown in the idle empty state (Linear technique). */
const GHOST_BASE_ROWS = [
  { role: "ANALYST",    service: "Market intelligence via x402",        amount: "0.0005" },
  { role: "RESEARCHER", service: "On-chain data fetch &middot; Base",   amount: "0.0003" },
  { role: "SCOUT",      service: "Price feed &middot; Venice RPC",      amount: "0.0004" },
  { role: "WRITER",     service: "Report synthesis &middot; Venice AI", amount: "0.0002" },
  { role: "AUDITOR",    service: "Compliance &middot; ERC-7715 policy", amount: "0.0003" },
  { role: "NOTARY",     service: "Receipt notarisation &middot; Base",  amount: "0.0001" },
];

function ghostLedgerHTML(): string {
  const makeRow = (r: { role: string; service: string; amount: string }) =>
    `<tr class="row-settled ghost-row">` +
    `<td class="agent-col"><div class="role-name">${r.role}</div><div class="addr-sub">0x????&hellip;????</div></td>` +
    `<td class="svc-cell">${r.service}</td>` +
    `<td class="amt-cell">${r.amount} USDC</td>` +
    `<td class="status-cell"><span class="badge ok"><span class="dot ok"></span>SETTLED</span></td>` +
    `<td><span class="muted">&mdash;</span></td>` +
    `</tr>`;
  const single = GHOST_BASE_ROWS.map(makeRow).join("");
  // Scroll a BLOCK-LEVEL .ghost-track div (not a tbody) so overflow:hidden on
  // .ghost-viewport clips it reliably — table-internal transforms leak in Chrome.
  return `<div class="ghost-ledger" aria-hidden="true">` +
    `<div class="ledger-masthead"><div class="lm-inner">` +
    `<span class="lm-name">City Ledger &mdash; Preview</span>` +
    `<span class="lm-vol">Example run &middot; dispatch a goal to begin</span>` +
    `</div></div>` +
    `<div class="ghost-viewport"><div class="ghost-track">` +
    `<table class="ledger ghost-table"><tbody>${single}${single}</tbody></table>` +
    `</div></div></div>`;
}

export const APP_HTML = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Agent City &mdash; live demo</title>
${FONTS}
<style>${THEME_CSS}

/* ── nav ──────────────────────────────────────────── */
nav{
  position:sticky;top:0;z-index:50;
  background:var(--bg-2);border-bottom:2px solid var(--dim-line);
}
nav .container{
  display:flex;align-items:center;justify-content:space-between;
  height:54px;gap:16px;
}
.brand{
  display:flex;flex-direction:column;gap:1px;text-decoration:none;
}
.brand-name{
  font-family:var(--display);font-size:18px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink);line-height:1;
}
.brand-sub{
  font-family:var(--mono);font-size:9px;letter-spacing:.08em;
  text-transform:uppercase;color:var(--ink-3);
}
.banner{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

/* ── ticker tape ──────────────────────────────────── */
.ticker-strip{
  width:100%;height:28px;
  background:var(--bg-2);
  border-bottom:1px solid var(--dim-line);
  overflow:hidden;display:flex;align-items:center;
}
.ticker-inner{
  display:flex;align-items:center;white-space:nowrap;
  font-family:var(--mono);font-size:10px;color:var(--ink-3);
  letter-spacing:.05em;
  animation:ticker 40s linear infinite;will-change:transform;
}
.ticker-item{
  display:inline-flex;align-items:center;gap:8px;
  padding:0 20px;
  border-right:1px solid rgba(200,216,240,.12);
}
.ticker-settled{color:var(--ok)}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ── grant CTA bar ────────────────────────────────── */
.grant-bar{
  background:var(--surface);
  border-bottom:1px solid var(--dim-line);
  padding:7px 0;
}
.grant-bar .container{display:flex;align-items:center;gap:10px}
.grant-bar a{
  font-family:var(--mono);font-size:11px;font-weight:600;
  color:var(--signal);flex:1;letter-spacing:.04em;
}
.grant-bar a:hover{color:var(--ink)}

/* ── main grid ────────────────────────────────────── */
.app-grid{
  display:grid;grid-template-columns:296px 1fr;gap:0;
  min-height:calc(100vh - 54px - 28px - 34px);align-items:start;
}

/* ── left panel — specification sheet ────────────── */
.panel{
  position:sticky;top:116px;
  padding:0;display:flex;flex-direction:column;gap:0;
  border-right:1px solid var(--dim-line);
  height:calc(100vh - 116px);overflow-y:auto;
}

/* Spec sheet title block */
.spec-title-block{
  border-top:2px solid var(--dim-line);
  padding-top:4px;
  padding-left:14px;padding-right:14px;
  background:var(--bg-2);
}
.spec-title-block .stb-inner{
  border-top:1px solid var(--dim-line);
  padding:7px 0 9px;
  display:flex;align-items:baseline;justify-content:space-between;
}
.spec-title-block .stb-name{
  font-family:var(--display);font-size:12px;font-weight:700;
  letter-spacing:.18em;text-transform:uppercase;color:var(--ink);
}
.spec-title-block .stb-ref{
  font-family:var(--mono);font-size:9px;color:var(--ink-3);
  letter-spacing:.06em;text-transform:uppercase;
}

.panel-section{
  border-bottom:1px solid var(--dim-line);
  background:var(--surface);
}
.panel-section.grant-active{
  border-left:2px solid var(--signal);
}
.panel-head{
  padding:8px 14px;border-bottom:1px solid var(--dim-line);
  background:var(--bg-2);
  font-family:var(--mono);font-size:10px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);
  display:flex;align-items:center;justify-content:space-between;
}
.panel-body{padding:0}

/* key-value rows — full-width rules */
.brow{
  display:flex;justify-content:space-between;align-items:center;
  padding:9px 14px;border-bottom:1px solid var(--dim-line);
}
.brow:last-child{border-bottom:0}
.brow .k{color:var(--ink-3);font-size:11px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em}
.brow .v{font-family:var(--mono);font-size:11px;font-variant-numeric:tabular-nums;color:var(--ink)}

/* ── goal form ────────────────────────────────────── */
.form-label{
  display:block;
  font-family:var(--mono);font-size:10px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);
  padding:8px 14px 5px;border-bottom:1px solid var(--dim-line);
}
textarea#goal{
  width:100%;min-height:64px;resize:vertical;
  padding:9px 14px;background:var(--bg);
  border:0;border-bottom:1px solid var(--dim-line);
  color:var(--ink);font:14px/1.5 var(--body);display:block;
}
textarea#goal:focus{outline:none;background:var(--bg-2)}
textarea#goal:disabled{opacity:.4}
.form-actions{padding:10px 14px;display:flex;gap:8px}
.form-actions .btn{flex:1;font-size:11px;padding:9px 10px}

/* approve block — dim-line budget split */
.approve-block{
  border-top:1px solid var(--dim-line);
  border-left:2px solid var(--signal);
  background:var(--signal-dim);
  padding:12px 14px;
  animation:fadeUp .2s ease both;
}
.approve-block .ah{
  font-family:var(--mono);font-size:10px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;color:var(--signal);
  margin-bottom:8px;
}
.approve-block p{
  font-family:var(--body);font-size:12.5px;color:var(--ink-2);
  line-height:1.55;margin-bottom:10px;
}
.approve-block .acts{display:flex;gap:8px}

/* ── right: activity area ─────────────────────────── */
.activity{padding:16px 20px 64px}

/* Activity masthead */
.activity-masthead{
  border-top:2px solid var(--dim-line);
  padding-top:4px;margin-bottom:14px;
}
.activity-masthead .am-inner{
  border-top:1px solid var(--dim-line);padding:7px 0 8px;
  display:flex;align-items:center;justify-content:space-between;gap:12px;
}
.activity-masthead .am-name{
  font-family:var(--display);font-size:13px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--ink);
}

/* ── dispatch progress ────────────────────────────── */
.dispatch-state{margin-bottom:14px;display:none}
.dispatch-state.visible{display:block}
.dispatch-label{
  font-family:var(--mono);font-size:10px;font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;color:var(--signal);
  margin-bottom:5px;animation:blink 1.1s step-end infinite;
}
.dispatch-bar-track{height:2px;background:var(--dim-line);overflow:hidden}
.dispatch-bar-fill{
  height:100%;background:var(--signal);width:0;
  animation:dispatch-fill 5s ease-out forwards;
}
@keyframes dispatch-fill{0%{width:0}60%{width:62%}90%{width:78%}100%{width:78%}}

/* ── city log — streaming status lines (Vercel technique) ── */
.city-log{
  margin-top:8px;
  border:1px solid var(--dim-line);
  background:var(--bg);
  padding:8px 12px;
  max-height:140px;
  overflow:hidden;
  display:flex;flex-direction:column;gap:2px;
}
.city-log-line{
  font-family:var(--mono);font-size:10px;color:var(--ink-2);
  letter-spacing:.03em;line-height:1.5;
  opacity:0;
  animation:log-appear 0.12s ease forwards;
}
.city-log-line .ll-prefix{color:var(--ink-3)}
.city-log-line .ll-signal{color:var(--signal)}
@keyframes log-appear{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}

/* ── spend total counter ──────────────────────────── */
.spend-counter{
  display:none;margin-bottom:14px;
  padding:12px 14px;
  border:1px solid var(--dim-line);
  background:var(--surface);
}
.spend-counter.visible{display:block}
.spend-counter .sc-label{
  font-family:var(--mono);font-size:9px;font-weight:600;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);
  margin-bottom:4px;
}
.spend-counter .sc-total{
  font-family:var(--mono);font-size:22px;font-weight:600;
  font-variant-numeric:tabular-nums;color:var(--signal);
  letter-spacing:.02em;line-height:1;margin-bottom:8px;
}
.spend-counter .sc-track{height:2px;background:var(--dim-line);overflow:hidden}
.spend-counter .sc-fill{
  height:100%;background:var(--signal);
  transition:width .6s ease;min-width:0;
}

/* ── empty state ──────────────────────────────────── */
.empty{
  padding:28px 24px 20px;text-align:center;
  border:1px solid var(--dim-line);
  border-bottom:0;
  background:var(--surface);
  position:relative;z-index:1;
}
.empty .glyph{margin:0 auto 12px}
.empty .msg{
  font-family:var(--display);font-size:16px;font-weight:700;
  text-transform:uppercase;letter-spacing:.06em;color:var(--ink-2);
  margin-bottom:6px;
}
.empty .hint{
  font-family:var(--body);font-size:13px;color:var(--ink-3);
  max-width:40ch;margin:0 auto;line-height:1.6;
}

/* ── ghost ledger — Linear idle scroll technique ──── */
.ghost-ledger{
  opacity:0.28;
  pointer-events:none;
  user-select:none;
  border:1px solid var(--dim-line);
  border-top:0;
  position:relative;
  background:var(--bg);
}
/* Clipping viewport — a block-level .ghost-track scrolls inside it.
   overflow:hidden on a normal div clips reliably (unlike a transformed tbody). */
.ghost-viewport{
  position:relative;
  max-height:168px;
  overflow:hidden;
}
.ghost-track{
  animation:ghost-scroll 22s linear infinite;
  will-change:transform;
}
.ghost-table{border:0;width:100%}
/* Fade masks top + bottom so rows dissolve at both edges (never bleed out) */
.ghost-viewport::before,
.ghost-viewport::after{
  content:'';position:absolute;left:0;right:0;height:46px;
  pointer-events:none;z-index:1;
}
.ghost-viewport::before{top:0;background:linear-gradient(to top,transparent,var(--bg))}
.ghost-viewport::after{bottom:0;background:linear-gradient(to bottom,transparent,var(--bg))}
@keyframes ghost-scroll{
  from{transform:translateY(0)}
  to{transform:translateY(-50%)}
}

/* ── city ledger — drawing-sheet hero ────────────── */
.ledger-section{margin-bottom:0}

.ledger{width:100%;border-collapse:collapse;border:1px solid var(--dim-line)}
.ledger thead tr{
  background:var(--bg-2);
}
.ledger th{
  text-align:left;font-family:var(--mono);font-size:9px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);
  padding:8px 12px;border-bottom:2px solid var(--dim-line);
  border-right:1px solid var(--dim-line);
}
.ledger th:last-child{border-right:0}
.ledger td{
  padding:9px 12px;border-bottom:1px solid var(--dim-line);
  border-right:1px solid var(--dim-line);
  vertical-align:middle;font-size:12px;
}
.ledger td:last-child{border-right:0}
.ledger tr:last-child td{border-bottom:0}
.ledger tbody tr:hover td{background:var(--surface-2)}

/* Settled row — full signal-dim tint */
.ledger tr.row-settled td{background:var(--signal-dim)}
.ledger tr.row-settled:hover td{background:rgba(224,92,26,.22)}

/* Row settle flash — Rainbow on-chain confirmation technique */
@keyframes settle-flash{
  0%{background:rgba(224,92,26,.42)}
  100%{background:var(--signal-dim)}
}
.ledger tr.row-settle-flash td{
  animation:settle-flash .65s ease both;
}

/* Status cell — fixed width for stamp */
.ledger .status-cell{width:110px;overflow:hidden;text-align:center}

.ledger .mono{
  font-family:var(--mono);font-size:11px;
  font-variant-numeric:tabular-nums;color:var(--ink-2);
}
.ledger a{
  color:var(--signal);font-family:var(--mono);font-size:11px;font-weight:600;
  letter-spacing:.02em;
}
.ledger a:hover{color:var(--ink)}
.ledger .muted{color:var(--ink-3);font-family:var(--mono);font-size:10px}

/* Agent column */
.ledger .agent-col .role-name{
  font-family:var(--display);font-size:13px;font-weight:700;
  text-transform:uppercase;letter-spacing:.04em;color:var(--ink);
  line-height:1;
}
.ledger .agent-col .addr-sub{
  font-family:var(--mono);font-size:10px;color:var(--ink-3);
  font-variant-numeric:tabular-nums;margin-top:2px;
}

/* Amount column */
.ledger .amt-cell{
  font-family:var(--mono);font-size:13px;font-weight:600;
  font-variant-numeric:tabular-nums;color:var(--signal);
}
.ledger .amt-cell.muted{color:var(--ink-3);font-size:11px}

/* Service cell */
.ledger .svc-cell{
  font-family:var(--body);font-size:12px;color:var(--ink-2);
  max-width:200px;
}

/* Venice reasoning — italic annotation below service */
.reason-line{
  font-family:var(--mono);font-size:10px;color:var(--ink-3);
  font-style:italic;margin-top:3px;line-height:1.4;
}
.reason-line em{
  font-style:normal;color:var(--ink-3);letter-spacing:.04em;
}

/* ── agents section — drawing frames ─────────────── */
.agents-section{margin-top:1px;border:1px solid var(--dim-line);border-top:0}

.agents{padding:0}

/* Agent card — drawing frame, 2px border-radius = 0 */
.acard{
  display:grid;grid-template-columns:140px 1fr auto 120px;
  gap:12px;align-items:center;
  padding:10px 12px;border-bottom:1px solid var(--dim-line);
  border-top:2px solid var(--dim-line);
  position:relative;
  background:var(--surface);
}
.acard:first-child{border-top-width:1px}
.acard.mayor{border-top:2px solid var(--signal);background:var(--surface)}

/* Stagger entrance — Framer technique */
.acard-enter{
  opacity:0;
  transform:translateY(8px);
}
.acard-in{
  opacity:1;
  transform:none;
  transition:opacity .28s ease, transform .28s ease;
}

/* Title-block corner label */
.acard .role{
  font-family:var(--display);font-size:13px;font-weight:700;
  text-transform:uppercase;letter-spacing:.05em;color:var(--ink);
  line-height:1.1;
}
.acard .svc{
  font-family:var(--mono);font-size:10px;color:var(--ink-3);
  letter-spacing:.04em;margin-top:2px;
}

/* meta column */
.ar{display:flex;flex-direction:column;gap:3px}
.ar .meta{
  font-family:var(--mono);font-size:10px;color:var(--ink-3);
  font-variant-numeric:tabular-nums;
}
.ar .reason{
  font-family:var(--mono);font-size:10px;color:var(--ink-2);
  font-style:italic;line-height:1.4;
}
.ar .reason em{
  font-style:normal;color:var(--ink-3);
}

/* budget column */
.cap{display:flex;flex-direction:column;gap:4px;min-width:90px}
.cap .budget-label{
  font-family:var(--mono);font-size:10px;color:var(--ink-3);
  font-variant-numeric:tabular-nums;
}
.cap .budget-bar{height:2px;background:var(--dim-line);overflow:hidden}
.cap .budget-bar-fill{
  height:100%;background:var(--signal);
  transition:width .6s ease;min-width:2px;
}
.cap .budget-bar-fill.full{background:var(--bad)}

/* status column */
.agent-status-col{display:flex;flex-direction:column;align-items:flex-end;gap:5px}

/* summary row */
.summary{
  margin-top:14px;padding:12px 14px;
  display:flex;align-items:center;gap:10px;
  border:1px solid var(--dim-line);
  font-family:var(--mono);font-size:12px;
}
.summary.ok{
  border-left:2px solid var(--ok);background:var(--ok-dim);
  color:var(--ink);
}
.summary.bad{
  border-left:2px solid var(--bad);background:var(--bad-dim);
  color:var(--bad);
}

/* big = unused in JS but keep for compat */
.big{font-family:var(--mono);font-size:18px;font-weight:600;font-variant-numeric:tabular-nums}

@media(max-width:900px){
  .app-grid{grid-template-columns:1fr}
  .panel{position:static;border-right:0;border-bottom:1px solid var(--dim-line);height:auto;overflow:visible}
  .acard{grid-template-columns:1fr auto}
  .ar,.cap{display:none}
}
@media(max-width:480px){
  .activity{padding:12px 14px 48px}
  .ledger th,.ledger td{padding:7px 8px}
}

/* ════ MOTION + LUMINOSITY (app) ════ */

/* indeterminate dispatch loader arc (referenced inline on dispatch) */
@keyframes spin-arc{from{stroke-dashoffset:87.96}to{stroke-dashoffset:0}}

/* one-shot shell entrance on load — choreographed, not all-at-once */
nav,.ticker-strip,.grant-bar{animation:fadeUp .5s ease both}
.spec-title-block{animation:fadeUp .5s ease .05s both}
.panel-section{animation:fadeUp .5s ease .12s both}
.activity-masthead{animation:fadeUp .5s ease .18s both}
#out>.empty{animation:fadeUp .6s ease .24s both}

/* authority source glows (the Mayor card) */
.acard.mayor{box-shadow:0 0 26px rgba(224,92,26,.14)}

/* agent cards lift out of the sheet on hover */
.acard{transition:box-shadow .18s ease,border-color .18s ease}
.acard:hover{box-shadow:0 10px 26px rgba(0,0,0,.42);border-color:var(--ink-3);z-index:2}

/* settlement luminosity — the orange numbers glow */
.spend-counter .sc-total{text-shadow:0 0 20px rgba(224,92,26,.42)}
.ledger .amt-cell:not(.muted){text-shadow:0 0 12px rgba(224,92,26,.28)}
.stamp-settled{box-shadow:0 0 16px rgba(224,92,26,.22)}

/* ── Railway cursor depth-pool — CSS var set by JS ─ */
body{
  --mx:50vw;--my:50vh;
  background-image:
    radial-gradient(600px circle at var(--mx) var(--my),rgba(80,140,220,0.045) 0%,transparent 70%),
    repeating-linear-gradient(0deg,var(--grid) 0,var(--grid) 1px,transparent 1px,transparent 32px),
    repeating-linear-gradient(90deg,var(--grid) 0,var(--grid) 1px,transparent 1px,transparent 32px);
}

@media(prefers-reduced-motion:reduce){
  .ghost-track{animation:none}
  .city-log-line{animation:none;opacity:1}
  .acard-enter,.acard-in{opacity:1;transform:none;transition:none}
  .ledger tr.row-settle-flash td{animation:none}
}
</style></head>
<body>

<nav><div class="container">
  <a class="brand" href="/">
    <span class="brand-name">Agent City</span>
    <span class="brand-sub">MetaMask &middot; 1Shot &middot; Venice &mdash; Live</span>
  </a>
  <div class="banner" id="banner"></div>
  <button class="btn btn-danger" id="revoke">Revoke the city</button>
</div></nav>

<!-- Ticker tape: live payment feed -->
<div class="ticker-strip" id="ticker-strip" role="marquee" aria-label="Live payment feed">
  <div class="ticker-inner" id="ticker-inner">
    <span class="ticker-item ticker-settled">A2A REDELEGATION &middot; 0x24af&hellip;ae27 &middot; SETTLED</span>
    <span class="ticker-item ticker-settled">x402 + ERC-7710 &middot; 0xbbce&hellip;450b &middot; SETTLED</span>
    <span class="ticker-item ticker-settled">1SHOT MAINNET &middot; 0x0349&hellip;48bf &middot; SETTLED</span>
    <span class="ticker-item ticker-settled">ERC-7715 GRANT &middot; 0xaa84&hellip;197b &middot; SETTLED</span>
    <span class="ticker-item">The delegation IS the cap &middot; overspend reverts by construction</span>
    <span class="ticker-item ticker-settled">A2A REDELEGATION &middot; 0x24af&hellip;ae27 &middot; SETTLED</span>
    <span class="ticker-item ticker-settled">x402 + ERC-7710 &middot; 0xbbce&hellip;450b &middot; SETTLED</span>
    <span class="ticker-item ticker-settled">1SHOT MAINNET &middot; 0x0349&hellip;48bf &middot; SETTLED</span>
    <span class="ticker-item ticker-settled">ERC-7715 GRANT &middot; 0xaa84&hellip;197b &middot; SETTLED</span>
    <span class="ticker-item">The delegation IS the cap &middot; overspend reverts by construction</span>
  </div>
</div>

<!-- Grant CTA bar -->
<div class="grant-bar"><div class="container">
  <a href="/grant" id="grantcta">&#9312; Grant the city treasury a budget via MetaMask Advanced Permissions (ERC-7715) &rarr;</a>
</div></div>

<main class="container app-grid">

  <!-- Left sidebar — specification sheet -->
  <aside class="panel">

    <!-- Spec sheet title block — THE MAYOR -->
    <div class="spec-title-block">
      <div class="stb-inner">
        <span class="stb-name">The Mayor &mdash; Spec Sheet</span>
        <span class="stb-ref">Form: ERC-7715</span>
      </div>
    </div>

    <div class="panel-section" id="mayor-panel">
      <div class="panel-head">
        <span>Treasury Parameters</span>
      </div>
      <div class="panel-body">
        <div class="brow"><span class="k">Treasury</span><span class="v" id="m-treasury">&hellip;</span></div>
        <div class="brow"><span class="k">Master budget</span><span class="v" id="m-budget" style="color:var(--signal)">&hellip;</span></div>
        <div class="brow"><span class="k">Per-agent cap</span><span class="v" id="m-percap">&hellip;</span></div>
        <div class="brow"><span class="k">Budget root</span><span class="v" id="m-root">demo treasury</span></div>
        <div class="brow"><span class="k">Authority</span><span id="m-status">&hellip;</span></div>
      </div>
    </div>

    <div class="panel-section">
      <div class="panel-head">Commission the city</div>
      <span class="form-label">Goal</span>
      <textarea id="goal" placeholder="e.g. Produce a market brief on ETH"></textarea>
      <div class="form-actions">
        <button class="btn btn-primary cta-glow" id="rundemo">&#9654;&nbsp; Run the demo</button>
        <button class="btn" id="dispatch">Dispatch &rarr;</button>
      </div>
      <div id="approveWrap"></div>
    </div>

  </aside>

  <!-- Right: activity column -->
  <section class="activity">

    <!-- Engineering-drawing masthead -->
    <div class="activity-masthead">
      <div class="am-inner">
        <span class="am-name">The City &mdash; Transaction Log</span>
        <span id="runbadge"></span>
      </div>
    </div>

    <!-- Dispatch progress indicator + streaming log -->
    <div class="dispatch-state" id="dispatch-state">
      <div class="dispatch-label" id="dispatch-label">DISPATCHING &mdash; COMMISSIONING WORKERS</div>
      <div class="dispatch-bar-track"><div class="dispatch-bar-fill" id="dispatch-bar"></div></div>
      <!-- Vercel streaming log panel -->
      <div class="city-log" id="city-log"></div>
    </div>

    <!-- Live spend counter (shown when run is active) -->
    <div class="spend-counter" id="spend-counter">
      <div class="sc-label">Cumulative spend &mdash; settled on-chain</div>
      <div class="sc-total" id="spend-total">0.0000 USDC</div>
      <div class="sc-track"><div class="sc-fill" id="spend-fill" style="width:0%"></div></div>
    </div>

    <div id="out">
      <div class="empty">
        <div class="glyph">${CROSSHAIR}</div>
        <div class="msg">The city is idle.</div>
        <div class="hint">Give it a goal and dispatch &mdash; the Manager hires workers under capped sub-budgets, and each payment settles on-chain.</div>
      </div>
      <!-- Ghost ledger preview (Linear idle-scroll technique) -->
      ${ghostLedgerHTML()}
    </div>

  </section>

</main>

<script>
var $=function(s){return document.querySelector(s);};
var info=null,polling=false,revoked=false,seenTx=[];

/* ── seenRows — keyed by txHash|role for targeted DOM updates ── */
var seenRows={};

/* enable/disable both dispatch buttons together */
function busy(on){var d=$('#dispatch');if(d)d.disabled=on;var r=$('#rundemo');if(r)r.disabled=on;}

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
});}
function shrink(a){return a&&a!=='0x'?String(a).slice(0,6)+'…'+String(a).slice(-4):'—';}
function fmtUSDC(base){
  if(base==null||base==='')return'—';
  var n=Number(base)/1e6;if(isNaN(n))return String(base);
  var s=n.toFixed(4).replace(/0+$$/,'').replace(/\\.$$/,'');return s+' USDC';
}
function calcSpend(ledger){
  return ledger.reduce(function(s,e){return s+(e.status==='settled'?Number(e.amount||0):0);},0);
}

/* ── Stripe: animated counter (requestAnimationFrame ramp) ──── */
var _counterRaf=null;
function animateCounter(fromVal,toVal,durationMs){
  var el=$('#spend-total');if(!el)return;
  if(_counterRaf)cancelAnimationFrame(_counterRaf);
  var start=null;
  var from=Number(fromVal)||0;
  var to=Number(toVal)||0;
  function step(ts){
    if(!start)start=ts;
    var p=Math.min(1,(ts-start)/durationMs);
    var ease=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2; // easeInOutQuad
    var cur=from+(to-from)*ease;
    el.textContent=fmtUSDC(cur);
    if(p<1){_counterRaf=requestAnimationFrame(step);}
    else{el.textContent=fmtUSDC(to);_counterRaf=null;}
  }
  _counterRaf=requestAnimationFrame(step);
}
var _lastSpend=0;

/* ── Vercel: streaming log lines ─────────────────────────────── */
var _logInterval=null;
var LOG_LINES=[
  ['[CITY]','Commissioning the city…'],
  ['[CITY]','Hiring ANALYST via Venice reasoning'],
  ['[CITY]','Hiring RESEARCHER — on-chain data feed'],
  ['[CITY]','Hiring SCOUT — price aggregation'],
  ['[CITY]','Granting sub-budget 0.0005 USDC · ERC-7710'],
  ['[CITY]','ANALYST dispatched · x402 endpoint contacted'],
  ['[CITY]','Granting sub-budget 0.0003 USDC · ERC-7710'],
  ['[CITY]','RESEARCHER dispatched · Base Sepolia RPC'],
  ['[CITY]','Awaiting settlement · 1Shot relayer'],
  ['[CITY]','Granting sub-budget 0.0004 USDC · ERC-7710'],
  ['[CITY]','SCOUT dispatched · Venice Crypto-RPC'],
  ['[CITY]','Payments incoming · watching ledger…'],
];
var _logIdx=0;
function appendLog(prefix,text,isSignal){
  var log=$('#city-log');if(!log)return;
  var line=document.createElement('div');
  line.className='city-log-line';
  var pfxClass=isSignal?'ll-signal':'ll-prefix';
  line.innerHTML='<span class="'+pfxClass+'">'+esc(prefix)+'</span> '+esc(text);
  log.appendChild(line);
  /* keep at most 10 visible lines */
  while(log.children.length>10)log.removeChild(log.firstChild);
}
function startLogStream(){
  _logIdx=0;
  var log=$('#city-log');if(log)log.innerHTML='';
  _logInterval=setInterval(function(){
    if(_logIdx<LOG_LINES.length){
      var l=LOG_LINES[_logIdx++];
      appendLog(l[0],l[1],false);
    }
  },520);
}
function stopLogStream(){
  if(_logInterval){clearInterval(_logInterval);_logInterval=null;}
}

/* ── ticker tape ─────────────────────────────────────────────── */
function pushTicker(role,amount,status){
  var inner=$('#ticker-inner');if(!inner)return;
  var settled=status==='settled';
  var text=esc(role)+' &middot; '+esc(fmtUSDC(amount))+' &middot; '+esc(status.toUpperCase());
  var item=document.createElement('span');
  item.className='ticker-item'+(settled?' ticker-settled':'');
  item.innerHTML=text;
  inner.appendChild(item.cloneNode(true));
  inner.appendChild(item.cloneNode(true));
}

/* ── badges ──────────────────────────────────────────────────── */
var ST={queued:['QUEUED','warn'],hiring:['HIRING','run'],paying:['PAYING','run'],settled:['SETTLED','ok'],failed:['FAILED','bad']};
function badge(s){var m=ST[s]||['…','run'];return'<span class="badge '+m[1]+'"><span class="dot '+m[1]+'"></span>'+m[0]+'</span>';}
function rcpt(run,e){
  var h=e.txHash;if(!h||!/^0x[0-9a-fA-F]{64}$/.test(h))return'';
  var base=run.explorerTxBase||'';
  return base.slice(0,8)==='https://'
    ?'<a class="rcpt" href="'+esc(base+h)+'" target="_blank" rel="noopener">receipt &nearr;</a>'
    :'<span class="mono">'+esc(h.slice(0,10))+'…</span>';
}

/* ── load info / grant / policy ──────────────────────────────── */
async function loadInfo(){
  try{info=await (await fetch('/info')).json();}catch(e){info={mode:'dry-run',network:'?'};}
  var live=info.mode==='live';
  var h='<span class="badge '+(live?'ok':'warn')+'"><span class="dot '+(live?'live':'run')+'"></span>'+(live?'LIVE':'DRY-RUN')+'</span>';
  var netNames={baseSepolia:'Base Sepolia',base:'Base Mainnet'};
  h+=' <span class="pill">network <b>'+esc(netNames[info.network]||info.network||'?')+'</b></span>';
  $('#banner').innerHTML=h;
  if(info.treasury)$('#m-treasury').textContent=shrink(info.treasury);
  if(!live){
    busy(true);$('#goal').disabled=true;
    $('#out').innerHTML='<div style="border:2px solid var(--warn);outline:1px solid var(--warn);outline-offset:3px;padding:18px;background:var(--warn-dim)">'
      +'<div style="font-family:var(--display);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--warn);margin-bottom:8px">Notice &mdash; Demo Mode</div>'
      +'<p style="font-family:var(--body);font-size:13px;color:var(--ink-2);line-height:1.6">'
      +'Live mode requires .env credentials (PRIVATE_KEY, USDC_ADDRESS, ONESHOT_URL). '
      +'Start the server with a populated .env to run the city and watch payments settle on-chain. '
      +'The delegation tree, agent cards, and City Ledger are all operational in live mode.'
      +'</p></div>';
  }
}
async function loadGrant(){
  var g=null;
  try{g=await (await fetch('/city/grant')).json();}catch(e){g=null;}
  if(g&&g.active){
    $('#grantcta').textContent='ERC-7715 grant active — treasury authorized by '+shrink(g.delegator)+' (tap to re-grant)';
    $('#m-root').innerHTML='<span class="badge ok"><span class="dot ok"></span>ERC-7715 '+esc(shrink(g.delegator))+'</span>';
    var mp=$('#mayor-panel');if(mp)mp.classList.add('grant-active');
  }else{
    $('#m-root').textContent='demo treasury';
  }
}
async function loadPolicy(){
  var p=await (await fetch('/policy')).json();
  $('#m-budget').textContent=fmtUSDC(p.maxPerDay);
  $('#m-percap').textContent='≤ '+fmtUSDC(p.maxPerTx);
  revoked=!!p.revoked;
  $('#m-status').innerHTML=revoked
    ?'<span class="badge bad"><span class="dot bad"></span>REVOKED</span>'
    :'<span class="badge ok"><span class="dot ok"></span>ACTIVE</span>';
  if(revoked){busy(true);$('#goal').disabled=true;}
}

/* ── Framer stagger entrance on agent cards ──────────────────── */
function staggerCards(container){
  var cards=container.querySelectorAll('.acard');
  cards.forEach(function(el,i){
    el.classList.add('acard-enter');
    /* stagger cap at 350ms total */
    var delay=Math.min(i*70,350);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        el.style.transitionDelay=delay+'ms';
        el.classList.remove('acard-enter');
        el.classList.add('acard-in');
        /* clean up delay after transition ends */
        el.addEventListener('transitionend',function once(){
          el.style.transitionDelay='';
          el.removeEventListener('transitionend',once);
        });
      });
    });
  });
}

/* ── Rainbow: targeted row update with settle-flash ─────────── */
function rowKey(e){return e.txHash||('role:'+e.role);}

function updateOrCreateRow(tbody,run,e,isNew){
  var key=rowKey(e);
  var isSettled=e.status==='settled';
  var existing=tbody.querySelector('[data-rk="'+CSS.escape(key)+'"]');

  var statusHtml=isSettled?'<span class="stamp-settled">Settled</span>':badge(e.status);
  var rcptHtml=rcpt(run,e)||'<span class="muted">—</span>';

  if(existing){
    /* only update cells that may have changed */
    var prevSettled=existing.classList.contains('row-settled');
    var statusCell=existing.querySelector('.status-cell');
    var amtCell=existing.querySelector('.amt-cell');
    if(statusCell)statusCell.innerHTML=statusHtml;
    if(amtCell&&e.amount){
      amtCell.className='amt-cell';
      amtCell.innerHTML=esc(fmtUSDC(e.amount));
    }
    /* flash on newly settled */
    if(isSettled&&!prevSettled){
      existing.classList.add('row-settled');
      existing.classList.remove('row-settle-flash');
      /* force reflow to restart animation */
      void existing.offsetWidth;
      existing.classList.add('row-settle-flash');
      existing.addEventListener('animationend',function once(){
        existing.classList.remove('row-settle-flash');
        existing.removeEventListener('animationend',once);
      });
    }
    return;
  }

  /* create new row */
  var tr=document.createElement('tr');
  tr.setAttribute('data-rk',key);
  if(isSettled)tr.classList.add('row-settled');
  tr.innerHTML=
    '<td class="agent-col">'
    +'<div class="role-name">'+esc(e.role)+'</div>'
    +'<div class="addr-sub">'+esc(shrink(e.agent))+'</div>'
    +'</td>'
    +'<td class="svc-cell">'
    +esc(e.service||'—')
    +(e.reasoning?'<div class="reason-line"><em>[reason]</em> '+esc(e.reasoning)+'</div>':'')
    +(e.credit!=null?'<div class="reason-line">credit '+esc(e.credit)+' &middot; '+esc(e.tier||'')+'</div>':'')
    +(e.data?'<div class="reason-line">received: '+esc(e.data)+'</div>':'')
    +'</td>'
    +'<td class="amt-cell'+(e.amount?'':' muted')+'">'+esc(fmtUSDC(e.amount))+'</td>'
    +'<td class="status-cell">'+statusHtml+'</td>'
    +'<td>'+rcptHtml+'</td>';
  tbody.appendChild(tr);
}

/* ── render ──────────────────────────────────────────────────── */
function render(run){
  $('#runbadge').innerHTML=badge(run.status==='done'?'settled':run.status==='failed'?'failed':run.status||'run');

  var isGrant=run.authorityRoot==='grant';
  var spend=calcSpend(run.ledger);

  /* Stripe animated counter */
  var sc=$('#spend-counter');
  if(sc){
    sc.classList.add('visible');
    animateCounter(_lastSpend,spend,420);
    _lastSpend=spend;
    var budgetNum=parseFloat(($('#m-budget').textContent||'5').replace(' USDC',''))||5;
    var pctBudget=Math.min(100,Math.round(spend/1e6/budgetNum*100));
    var sf=$('#spend-fill');
    if(sf)sf.style.width=pctBudget+'%';
  }

  /* ticker */
  run.ledger.forEach(function(e){
    if(e.status==='settled'&&e.txHash&&seenTx.indexOf(e.txHash)<0){
      seenTx.push(e.txHash);
      pushTicker(e.role,e.amount,e.status);
    }
  });

  /* build DOM structure if it does not exist yet */
  var out=$('#out');
  var ledgerSection=out.querySelector('.ledger-section:not(.ghost-ledger)');
  var agentsSection=out.querySelector('.agents-section');

  if(!ledgerSection){
    /* first render — build skeleton, hide ghost */
    var ghost=out.querySelector('.ghost-ledger');
    if(ghost)ghost.style.display='none';

    out.innerHTML='';

    /* City Ledger */
    ledgerSection=document.createElement('div');
    ledgerSection.className='ledger-section';
    ledgerSection.innerHTML=
      '<div class="ledger-masthead"><div class="lm-inner">'
      +'<span class="lm-name">City Ledger &mdash; Transaction Log</span>'
      +'<span class="lm-vol" id="ledger-vol">Settled: —</span>'
      +'</div></div>'
      +'<table class="ledger" aria-label="City payment ledger">'
      +'<thead><tr>'
      +'<th>Agent</th><th>Service &amp; Reasoning</th><th>Amount</th>'
      +'<th class="status-cell">Status</th><th>Receipt</th>'
      +'</tr></thead>'
      +'<tbody id="ledger-body"></tbody>'
      +'</table>';
    out.appendChild(ledgerSection);

    /* Agents section */
    agentsSection=document.createElement('div');
    agentsSection.className='agents-section';
    agentsSection.innerHTML='<div class="agents" id="agents-body"></div>';
    out.appendChild(agentsSection);
  }

  /* update ledger volume label */
  var volEl=out.querySelector('#ledger-vol');
  if(volEl)volEl.textContent='Settled: '+fmtUSDC(spend);

  /* Rainbow: targeted row updates with settle-flash */
  var tbody=out.querySelector('#ledger-body');
  if(tbody){
    if(!run.ledger.length){
      if(!tbody.querySelector('[data-empty]')){
        var emptyTr=document.createElement('tr');
        emptyTr.setAttribute('data-empty','1');
        emptyTr.innerHTML='<td colspan="5" class="muted" style="padding:20px 12px;text-align:center">No payments yet &mdash; workers being commissioned&hellip;</td>';
        tbody.appendChild(emptyTr);
      }
    } else {
      var empty=tbody.querySelector('[data-empty]');
      if(empty)tbody.removeChild(empty);
      run.ledger.forEach(function(e){
        updateOrCreateRow(tbody,run,e,!seenRows[rowKey(e)]);
        seenRows[rowKey(e)]=true;
      });
    }
  }

  /* Agent cards */
  var abody=out.querySelector('#agents-body');
  if(abody){
    var mayorBudgetStr=($('#m-budget').textContent||'').replace(' USDC','');
    var mayorBudgetNum=parseFloat(mayorBudgetStr)||5;
    var mayorSpendPct=Math.min(100,Math.round(spend/1e6/mayorBudgetNum*100));

    /* Mayor card — always rebuild (tiny, no flash) */
    var mayorKey='__mayor__';
    var mayorEl=abody.querySelector('[data-rk="'+mayorKey+'"]');
    var mayorHtml=
      '<div><div class="role">Mayor</div><div class="svc">'+(isGrant?'your wallet':'demo treasury')+'</div></div>'
      +'<div class="ar"><span class="meta">'+esc(shrink(isGrant&&run.grantDelegator?run.grantDelegator:(info&&info.treasury)))+'</span></div>'
      +'<div class="cap">'
      +'<span class="budget-label">master ≤ '+esc($('#m-budget').textContent||'')+'</span>'
      +'<div class="budget-bar" role="progressbar" aria-valuenow="'+mayorSpendPct+'" aria-valuemax="100">'
      +'<div class="budget-bar-fill" style="width:'+mayorSpendPct+'%"></div>'
      +'</div></div>'
      +'<div class="agent-status-col"><span class="badge '+(isGrant?'ok':'warn')+'">'+(isGrant?'7715 grant':'treasury')+'</span></div>';
    if(!mayorEl){
      var mDiv=document.createElement('div');
      mDiv.className='acard mayor';
      mDiv.setAttribute('data-rk',mayorKey);
      mDiv.innerHTML=mayorHtml;
      abody.insertBefore(mDiv,abody.firstChild);
    } else {
      mayorEl.innerHTML=mayorHtml;
    }

    /* Worker cards — add new ones, update existing */
    var newCards=[];
    run.ledger.forEach(function(e){
      var wkey='worker:'+rowKey(e);
      var existing=abody.querySelector('[data-rk="'+CSS.escape(wkey)+'"]');
      var sub=Number(e.subCap||0);
      var amt=Number(e.amount||0);
      var pct=sub>0?Math.min(100,Math.round(amt/sub*100)):0;
      var isFull=pct>=90;
      var innerHtml=
        '<div><div class="role">'+esc(e.role)+'</div><div class="svc">'+esc(e.service||'service')+'</div></div>'
        +'<div class="ar">'
        +'<span class="meta">'+esc(shrink(e.agent))+'</span>'
        +(e.reasoning?'<span class="reason"><em>[reason]</em> '+esc(e.reasoning)+'</span>':'')
        +(e.credit!=null?'<span class="meta">credit '+esc(e.credit)+' &middot; '+esc(e.tier||'')+'</span>':'')
        +(e.data?'<span class="meta">received: '+esc(e.data)+'</span>':'')
        +'</div>'
        +'<div class="cap">'
        +'<span class="budget-label">'+esc(fmtUSDC(e.amount))+' / '+esc(fmtUSDC(e.subCap))+'</span>'
        +'<div class="budget-bar" role="progressbar" aria-valuenow="'+pct+'" aria-valuemax="100">'
        +'<div class="budget-bar-fill'+(isFull?' full':'')+'" style="width:'+pct+'%"></div>'
        +'</div></div>'
        +'<div class="agent-status-col">'+badge(e.status)+(rcpt(run,e)?'<br>'+rcpt(run,e):'')+'</div>';
      if(existing){
        existing.innerHTML=innerHtml;
      } else {
        var wDiv=document.createElement('div');
        wDiv.className='acard';
        wDiv.setAttribute('data-rk',wkey);
        wDiv.innerHTML=innerHtml;
        wDiv.classList.add('acard-enter');
        abody.appendChild(wDiv);
        newCards.push(wDiv);
      }
    });

    /* Framer stagger on newly added cards */
    if(newCards.length){
      newCards.forEach(function(el,i){
        var delay=Math.min(i*70,350);
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            el.style.transitionDelay=delay+'ms';
            el.classList.remove('acard-enter');
            el.classList.add('acard-in');
            el.addEventListener('transitionend',function once(){
              el.style.transitionDelay='';
              el.removeEventListener('transitionend',once);
            });
          });
        });
      });
    }
  }

  if(run.status==='done'||run.status==='failed'){
    var existSum=out.querySelector('.summary');
    if(!existSum){
      var sumDiv=document.createElement('div');
      sumDiv.className='summary '+(run.status==='done'?'ok':'bad');
      sumDiv.innerHTML='<span class="dot '+(run.status==='done'?'ok':'bad')+'"></span>'
        +esc(run.result||run.status);
      out.appendChild(sumDiv);
    }
  }
}

/* ── poll ────────────────────────────────────────────────────── */
async function poll(id){
  polling=true;
  var deadline=Date.now()+8*60000;
  while(Date.now()<deadline){
    var run;
    try{run=await (await fetch('/city/run/'+id)).json();}catch(e){break;}
    if(run.error){
      $('#out').innerHTML='<div class="summary bad"><span class="dot bad"></span>'+esc(run.error)+'</div>';
      break;
    }
    hideDispatchState();
    render(run);
    if(run.status==='done'||run.status==='failed')break;
    await new Promise(function(r){setTimeout(r,2000);});
  }
  polling=false;
  busy(revoked);
}

/* ── dispatch progress ───────────────────────────────────────── */
function showDispatchState(){
  $('#dispatch-state').classList.add('visible');
  var bar=$('#dispatch-bar');
  bar.style.animation='none';bar.offsetHeight;bar.style.animation='';
  startLogStream();
}
function hideDispatchState(){
  stopLogStream();
  $('#dispatch-state').classList.remove('visible');
}

/* ── approve flow ────────────────────────────────────────────── */
function showApprove(){
  if(revoked)return;
  $('#dispatch').style.display='none';
  $('#approveWrap').innerHTML=
    '<div class="approve-block">'
    +'<div class="ah">Authorize the city</div>'
    +'<p>Grant the city a master budget. The Manager re-delegates <strong>narrower</strong> capped sub-budgets to each worker &mdash; none can exceed its cap, and you can revoke anytime.</p>'
    +'<div class="acts">'
    +'<button class="btn btn-signal" id="go">Approve &amp; dispatch</button>'
    +'<button class="btn" id="cancel">Cancel</button>'
    +'</div></div>';
  $('#go').onclick=dispatch;
  $('#cancel').onclick=function(){
    $('#approveWrap').innerHTML='';
    $('#dispatch').style.display='';
  };
}

async function dispatch(){
  $('#approveWrap').innerHTML='';$('#dispatch').style.display='';
  busy(true);
  seenTx=[];seenRows={};
  _lastSpend=0;
  var goal=$('#goal').value.trim()||'Produce a market brief on ETH';

  /* Reset ticker */
  var inner=$('#ticker-inner');
  inner.innerHTML=
    '<span class="ticker-item">DISPATCHING &middot; LIVE &middot; hiring workers</span>'
    +'<span class="ticker-item">Payments incoming &middot; every settle appears here</span>'
    +'<span class="ticker-item">Sub-budgets being delegated &middot; ERC-7710 on-chain caps</span>'
    +'<span class="ticker-item">Venice AI reasoning &middot; zero-retention model active</span>'
    +'<span class="ticker-item">DISPATCHING &middot; LIVE &middot; hiring workers</span>'
    +'<span class="ticker-item">Payments incoming &middot; every settle appears here</span>'
    +'<span class="ticker-item">Sub-budgets being delegated &middot; ERC-7710 on-chain caps</span>'
    +'<span class="ticker-item">Venice AI reasoning &middot; zero-retention model active</span>';

  showDispatchState();
  $('#spend-counter').classList.remove('visible');

  /* Clear #out and show arc loader (ghost ledger already hidden on first render) */
  $('#out').innerHTML='<div style="border:1px solid var(--dim-line);padding:52px 24px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;background:var(--surface)"><svg width=40 height=40 viewBox="0 0 40 40" aria-hidden=true style="display:block"><circle cx=20 cy=20 r=14 fill=none stroke="var(--dim-line)" stroke-width=1.5 /><circle cx=20 cy=20 r=14 fill=none stroke="var(--signal)" stroke-width=1.5 stroke-dasharray=87.96 stroke-dashoffset=87.96 stroke-linecap=butt style="transform-origin:center;animation:spin-arc 1.3s ease-in-out infinite alternate"/><line x1=20 y1=6 x2=20 y2=10 stroke="var(--dim-line)" stroke-width=1 /><line x1=20 y1=30 x2=20 y2=34 stroke="var(--dim-line)" stroke-width=1 /><line x1=6 y1=20 x2=10 y2=20 stroke="var(--dim-line)" stroke-width=1 /><line x1=30 y1=20 x2=34 y2=20 stroke="var(--dim-line)" stroke-width=1 /></svg>'
    +'<div style="font-family:var(--display);font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ink)">Commissioning the city&hellip;</div>'
    +'<div style="font-family:var(--body);font-size:13px;color:var(--ink-3)">Hiring workers and granting capped sub-budgets. Payments will settle on-chain.</div></div>';

  try{
    var r=await fetch('/city/run',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({goal:goal})});
    var j=await r.json();
    if(!r.ok||!j.id){
      hideDispatchState();
      $('#out').innerHTML='<div class="summary bad"><span class="dot bad"></span>'+esc(j.error||('HTTP '+r.status))+'</div>';
      busy(revoked);return;
    }
    poll(j.id);
  }catch(e){
    hideDispatchState();
    $('#out').innerHTML='<div class="summary bad"><span class="dot bad"></span>'+esc(e.message)+'</div>';
    busy(revoked);
  }
}

$('#dispatch').onclick=showApprove;

/* One-click demo: prefill a goal if blank and dispatch immediately (skips the approve gate) */
var _rd=$('#rundemo');
if(_rd)_rd.onclick=function(){
  if(revoked)return;
  if(info&&info.mode!=='live')return;
  var g=$('#goal');if(g&&!g.value.trim())g.value='Produce a market brief on ETH';
  dispatch();
};

$('#revoke').onclick=async function(){
  if(!confirm('Revoke the whole city\\'s authority?'))return;
  await fetch('/revoke',{method:'POST'});
  loadPolicy();
};

/* ── Railway: cursor depth-pool ──────────────────────────────── */
(function(){
  var reduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(reduced)return;
  var ticking=false;
  document.addEventListener('mousemove',function(ev){
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(function(){
      document.documentElement.style.setProperty('--mx',ev.clientX+'px');
      document.documentElement.style.setProperty('--my',ev.clientY+'px');
      ticking=false;
    });
  },{passive:true});
})();

/* Pre-fill the goal so the field is never blank for a judge */
(function(){var g=$('#goal');if(g&&!g.value)g.value='Produce a market brief on ETH';})();

loadInfo();loadPolicy();loadGrant();
</script>
</body></html>`;
