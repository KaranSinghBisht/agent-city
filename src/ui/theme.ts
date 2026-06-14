/**
 * Blueprint Civic design system — shared CSS + font links.
 *
 * Aesthetic: engineering drawing brought to life. Deep navy field,
 * Barlow Condensed for all structural headings, JetBrains Mono for
 * every number and hash, dimension-line annotations for cap spans.
 * Signal orange (#E05C1A) for confirmed/settled state.
 * No purple. Square edges (radius 0). Selective luminosity only:
 * signal-orange glow lives on authority + settlement accents, never flat-everywhere.
 * Motion is choreographed (assemble / reveal / lift), never decorative.
 */

export const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&family=JetBrains+Mono:wght@400;600&display=block" rel="stylesheet">`;

export const THEME_CSS = `
:root{
  --bg:          #091525;
  --bg-2:        #0C1C30;
  --surface:     #0F2540;
  --surface-2:   #132B4A;
  --ink:         #C8D8F0;
  --ink-2:       #7A9BC4;
  --ink-3:       #3D6080;
  --dim-line:    #2A5080;
  --grid:        rgba(80,140,220,0.07);
  --signal:      #E05C1A;
  --signal-dim:  rgba(224,92,26,0.15);
  --ok:          #2DC98A;
  --ok-dim:      rgba(45,201,138,0.12);
  --warn:        #D4A820;
  --warn-dim:    rgba(212,168,32,0.12);
  --bad:         #D44040;
  --bad-dim:     rgba(212,64,64,0.12);
  --display:     "Barlow Condensed","Arial Narrow",sans-serif;
  --body:        "Barlow","Arial",sans-serif;
  --mono:        "JetBrains Mono","SFMono-Regular",Menlo,monospace;
  --maxw:        1100px;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{
  margin:0;
  background:var(--bg);
  background-image:
    repeating-linear-gradient(0deg,var(--grid) 0,var(--grid) 1px,transparent 1px,transparent 32px),
    repeating-linear-gradient(90deg,var(--grid) 0,var(--grid) 1px,transparent 1px,transparent 32px);
  color:var(--ink);
  font-family:var(--body);font-size:16px;line-height:1.6;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
  overflow-x:hidden;
}
a{color:inherit;text-decoration:none}
img,svg{display:block}
h1,h2,h3,h4{margin:0;font-family:var(--display);font-weight:700;line-height:1.1;color:var(--ink);text-transform:uppercase;letter-spacing:.04em}
p{margin:0}

.container{max-width:var(--maxw);margin:0 auto;padding:0 24px}
.mono{font-family:var(--mono);font-variant-numeric:tabular-nums}
.muted{color:var(--ink-3)}
.dim{color:var(--ink-2)}
.signal-color{color:var(--signal)}

/* Eyebrow — condensed mono annotation */
.eyebrow{
  font-family:var(--mono);font-size:10px;font-weight:600;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);
}

/* ── Dimension-line annotation ── */
/* Container: position:relative, display:flex, align-items:center */
/* Usage: <div class="dim-line"><span>LABEL</span></div>           */
.dim-line{
  position:relative;display:flex;align-items:center;justify-content:center;
  margin:10px 0;
}
.dim-line::before{
  content:'';display:block;position:absolute;
  top:50%;left:0;right:0;border-top:1px solid var(--dim-line);
}
.dim-line>span{
  position:relative;background:var(--bg);padding:0 8px;
  font-family:var(--mono);font-size:11px;color:var(--ink-3);
  letter-spacing:.06em;text-transform:uppercase;
}
.dim-line>span::before{
  content:'';position:absolute;top:-4px;left:0;
  width:1px;height:8px;background:var(--dim-line);
}
.dim-line>span::after{
  content:'';position:absolute;top:-4px;right:0;
  width:1px;height:8px;background:var(--dim-line);
}
/* On surfaces that are not --bg, override the span background */
.surface-dim-line .dim-line>span{background:var(--surface)}
.surface2-dim-line .dim-line>span{background:var(--surface-2)}

/* ── Buttons — square-edged blueprint style ── */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:10px 18px;border-radius:0;border:1px solid var(--dim-line);
  background:var(--surface);color:var(--ink);
  font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.06em;
  text-transform:uppercase;
  cursor:pointer;transition:border-color .12s,background .12s,color .12s;
  white-space:nowrap;text-align:center;
}
.btn:hover{border-color:var(--ink-2);background:var(--surface-2);color:var(--ink)}
.btn:active{background:var(--bg-2)}
.btn-primary{background:var(--signal);color:#fff;border-color:var(--signal)}
.btn-primary:hover{background:#c04d12;border-color:#c04d12;color:#fff}
.btn-signal{background:var(--signal);color:#fff;border-color:var(--signal)}
.btn-signal:hover{background:#c04d12;border-color:#c04d12}
.btn-ghost{background:transparent;border-color:transparent;color:var(--ink-2)}
.btn-ghost:hover{color:var(--ink);border-color:var(--dim-line)}
.btn-danger{background:transparent;border-color:rgba(212,64,64,.35);color:var(--bad)}
.btn-danger:hover{background:var(--bad-dim);border-color:var(--bad)}
.btn-lg{padding:13px 26px;font-size:13px}
.btn:disabled{opacity:.35;cursor:not-allowed}

/* ── Surfaces — drawing frames ── */
.card{
  background:var(--surface);border:1px solid var(--dim-line);
  border-radius:0;padding:20px 22px;
}

/* ── Key-value rows ── */
.brow{
  display:flex;justify-content:space-between;align-items:center;
  padding:10px 0;border-bottom:1px solid var(--dim-line);
}
.brow:last-child{border-bottom:0}
.brow .k{color:var(--ink-3);font-size:12px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em}
.brow .v{font-family:var(--mono);font-size:12px;font-variant-numeric:tabular-nums;color:var(--ink)}

/* ── Status badges — no pill radius ── */
.badge{
  display:inline-flex;align-items:center;gap:5px;
  padding:2px 7px;border-radius:0;
  font-family:var(--mono);font-size:10px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;
}
.badge.ok  {background:var(--ok-dim);  color:var(--ok);  border:1px solid rgba(45,201,138,.25)}
.badge.warn{background:var(--warn-dim);color:var(--warn);border:1px solid rgba(212,168,32,.25)}
.badge.bad {background:var(--bad-dim); color:var(--bad); border:1px solid rgba(212,64,64,.25)}
.badge.run {background:rgba(80,140,220,.1);color:#5098DC;border:1px solid rgba(80,140,220,.25)}
.badge.live{background:var(--ok-dim);  color:var(--ok);  border:1px solid rgba(45,201,138,.25)}

/* ── Pill (network chip) ── */
.pill{
  display:inline-flex;align-items:center;gap:6px;padding:3px 9px;
  border:1px solid var(--dim-line);background:var(--bg-2);
  font-family:var(--mono);font-size:10px;color:var(--ink-3);border-radius:0;
  text-transform:uppercase;letter-spacing:.05em;
}
.pill b{color:var(--ink-2);font-weight:600}

/* ── Status dot ── */
.dot{width:6px;height:6px;border-radius:50%;background:var(--ink-3);flex:none}
.dot.ok,.dot.live{background:var(--ok)}
.dot.run{background:#5098DC;animation:pulse 1.4s ease-in-out infinite}
.dot.bad{background:var(--bad)}
.dot.warn{background:var(--warn)}

/* ── Section divider: dimension-line style ── */
.section-rule{
  display:flex;align-items:center;gap:14px;margin-bottom:20px;
}
.section-rule::before,.section-rule::after{
  content:'';flex:1;height:1px;background:var(--dim-line);
}
.section-rule .sr-title{
  font-family:var(--mono);font-size:10px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--ink-3);white-space:nowrap;
}

/* ── Ledger title block (engineering drawing header) ── */
.ledger-masthead{
  border-top:2px solid var(--dim-line);
  padding-top:5px;margin-bottom:16px;
}
.ledger-masthead .lm-inner{
  border-top:1px solid var(--dim-line);padding:8px 0 10px;
  display:flex;align-items:baseline;justify-content:space-between;gap:16px;
}
.ledger-masthead .lm-name{
  font-family:var(--display);font-size:13px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--ink);
}
.ledger-masthead .lm-vol{
  font-family:var(--mono);font-size:10px;color:var(--ink-3);
  letter-spacing:.06em;text-transform:uppercase;
}

/* ── Double-rule notice box ── */
.notice-box{
  border:2px solid var(--dim-line);outline:1px solid var(--dim-line);
  outline-offset:3px;padding:16px 18px;background:var(--surface);
}
.notice-box.danger-notice{
  border-color:var(--bad);outline-color:var(--bad);
  background:var(--bad-dim);
}
.notice-box.warn-notice{
  border-color:var(--warn);outline-color:var(--warn);
  background:var(--warn-dim);
}
.notice-box .nb-head{
  font-family:var(--display);font-size:12px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--ink);margin-bottom:8px;
}
.notice-box.danger-notice .nb-head{color:var(--bad)}
.notice-box.warn-notice .nb-head{color:var(--warn)}

/* ── SETTLED stamp ── */
.stamp-settled{
  display:inline-block;
  transform:rotate(-18deg);
  border:2px solid var(--signal);
  outline:2px solid var(--signal);
  outline-offset:3px;
  padding:2px 8px;
  font-family:var(--display);font-weight:700;font-size:11px;
  letter-spacing:.18em;color:var(--signal);
  text-transform:uppercase;
  overflow:hidden;
}
.stamp-approved{
  display:inline-block;
  transform:rotate(-12deg);
  border:2px solid var(--ok);
  outline:2px solid var(--ok);
  outline-offset:3px;
  padding:2px 10px;
  font-family:var(--display);font-weight:700;font-size:14px;
  letter-spacing:.18em;color:var(--ok);
  text-transform:uppercase;
}
.stamp-rejected{
  display:inline-block;
  transform:rotate(-12deg);
  border:2px solid var(--bad);
  outline:2px solid var(--bad);
  outline-offset:3px;
  padding:2px 10px;
  font-family:var(--display);font-weight:700;font-size:14px;
  letter-spacing:.18em;color:var(--bad);
  text-transform:uppercase;
}

/* ── Receipt link ── */
.rcpt{font-size:12.5px;font-weight:600;color:var(--signal);font-family:var(--mono)}
.rcpt:hover{color:var(--ink)}

/* ── Animations ── */
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes spin-stroke{to{stroke-dashoffset:0}}

/* ════ MOTION + LUMINOSITY LAYER — cinematic blueprint ════ */

/* Reveal-on-scroll — a tiny IntersectionObserver toggles .in */
.reveal{
  opacity:0;transform:translateY(22px);
  transition:opacity .7s cubic-bezier(.22,.68,.16,1),
             transform .7s cubic-bezier(.22,.68,.16,1);
  will-change:opacity,transform;
}
.reveal.in{opacity:1;transform:none}
.reveal.d1{transition-delay:.07s}
.reveal.d2{transition-delay:.14s}
.reveal.d3{transition-delay:.21s}
.reveal.d4{transition-delay:.28s}
.reveal.d5{transition-delay:.35s}

/* Entrance keyframes */
@keyframes stampSlam{
  0%{opacity:0;transform:rotate(-18deg) scale(1.7)}
  55%{opacity:1}
  100%{opacity:1;transform:rotate(-18deg) scale(1)}
}
@keyframes glowBreathe{
  0%,100%{box-shadow:0 0 0 0 rgba(224,92,26,0)}
  50%{box-shadow:0 0 24px 0 rgba(224,92,26,.32)}
}

/* Depth — surfaces lift out of the drawing grid on hover */
.card,.proof-card,.spec-cell{
  transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;
}
.proof-card:hover{
  transform:translateY(-4px);
  box-shadow:0 16px 36px rgba(0,0,0,.5);
  border-color:var(--ink-3);position:relative;z-index:2;
}
.spec-cell:hover{
  box-shadow:inset 0 0 0 1px var(--ink-3),0 12px 28px rgba(0,0,0,.4);
  position:relative;z-index:2;
}

/* Signal glow accents — authority + settlement only */
.glow-signal{box-shadow:0 0 0 1px var(--signal),0 0 30px rgba(224,92,26,.30)}
.btn-primary,.btn-signal{box-shadow:0 0 18px rgba(224,92,26,.20)}
.btn-primary:hover,.btn-signal:hover{box-shadow:0 0 30px rgba(224,92,26,.48)}
.cta-glow{animation:glowBreathe 3.4s ease-in-out infinite}

/* SETTLED stamp slams in when its card reveals */
.reveal.in .stamp-settled{animation:stampSlam .55s cubic-bezier(.2,1.35,.4,1) both}

@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1!important;transform:none!important;transition:none!important}
  .cta-glow{animation:none!important}
  *{animation-duration:.001s!important;animation-iteration-count:1!important}
}

:focus-visible{outline:2px solid var(--signal);outline-offset:2px}
::selection{background:rgba(224,92,26,.22);color:var(--ink)}
`;
