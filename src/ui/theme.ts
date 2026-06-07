/**
 * Onyx design system — shared CSS + font links for the landing (/) and app (/app)
 * pages. Dark, Linear-grade, single violet accent. No build step: these are
 * plain strings inlined into each self-contained page served by the Hono API.
 */

export const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;

export const THEME_CSS = `
:root{
  --bg:#0a0b0f;--bg-2:#0e0f15;--surface:#14161e;--surface-2:#181b24;
  --line:#23262f;--line-2:#2c3040;
  --fg:#f4f5f8;--fg-2:#aeb4c4;--fg-3:#767d90;
  --accent:#8b7cff;--accent-2:#a99bff;--accent-ink:#0b0a1a;--glow:rgba(139,124,255,.35);
  --ok:#46d07f;--ok-bg:rgba(70,208,127,.12);
  --warn:#e3b341;--warn-bg:rgba(227,179,65,.12);
  --bad:#ff6b6b;--bad-bg:rgba(255,107,107,.12);
  --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;
  --sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  --maxw:1100px;--r:16px;--r-sm:11px;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--sans);font-size:16px;line-height:1.6;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:hidden}
body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:
  radial-gradient(58% 44% at 50% -8%,rgba(139,124,255,.20),transparent 70%),
  radial-gradient(40% 30% at 92% 4%,rgba(139,124,255,.08),transparent 60%)}
a{color:inherit;text-decoration:none}
img,svg{display:block}
h1,h2,h3{margin:0;font-weight:700;letter-spacing:-.02em;line-height:1.1}
p{margin:0}
.container{max-width:var(--maxw);margin:0 auto;padding:0 24px}
.mono{font-family:var(--mono)}
.muted{color:var(--fg-3)}
.dim{color:var(--fg-2)}
.accent{color:var(--accent-2)}
.eyebrow{font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-2)}
.grad{background:linear-gradient(180deg,#fff 30%,#bdb5ff);-webkit-background-clip:text;background-clip:text;color:transparent}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 18px;border-radius:12px;
  border:1px solid var(--line-2);background:var(--surface);color:var(--fg);font:600 15px/1 var(--sans);
  cursor:pointer;transition:.18s ease;white-space:nowrap;text-align:center}
.btn:hover{border-color:#3a3f52;background:var(--surface-2);transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.btn-primary{background:linear-gradient(180deg,var(--accent-2),var(--accent));color:var(--accent-ink);
  border:0;box-shadow:0 6px 24px -8px var(--glow)}
.btn-primary:hover{box-shadow:0 12px 32px -8px var(--glow);filter:brightness(1.04)}
.btn-ghost{background:transparent;border-color:transparent;color:var(--fg-2)}
.btn-ghost:hover{color:var(--fg);background:var(--surface)}
.btn-danger{background:transparent;border-color:rgba(255,107,107,.4);color:var(--bad)}
.btn-danger:hover{background:var(--bad-bg);border-color:var(--bad)}
.btn-lg{padding:14px 26px;font-size:16px;border-radius:14px}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none;filter:none}

/* surfaces */
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:22px}
.pill{display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:999px;border:1px solid var(--line-2);
  background:var(--bg-2);color:var(--fg-2);font-size:13px;font-weight:500}
.pill b{color:var(--fg);font-weight:600}
.badge{display:inline-flex;align-items:center;gap:6px;padding:3px 11px;border-radius:999px;font-size:12px;font-weight:600}
.badge.ok{background:var(--ok-bg);color:var(--ok)}
.badge.warn{background:var(--warn-bg);color:var(--warn)}
.badge.bad{background:var(--bad-bg);color:var(--bad)}
.badge.run{background:rgba(139,124,255,.14);color:var(--accent-2)}

/* status dot */
.dot{width:8px;height:8px;border-radius:50%;background:var(--fg-3);flex:none}
.dot.ok,.dot.live{background:var(--ok);box-shadow:0 0 0 3px var(--ok-bg)}
.dot.run{background:var(--warn);box-shadow:0 0 0 3px var(--warn-bg);animation:pulse 1.4s ease-in-out infinite}
.dot.bad{background:var(--bad);box-shadow:0 0 0 3px var(--bad-bg)}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
::selection{background:rgba(139,124,255,.3);color:#fff}
`;
