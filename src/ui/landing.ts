/** Landing page (GET /). Blueprint Civic theme. */
import { FAVICON_LINK, FONTS, LOGO_MARK, THEME_CSS } from "./theme.js";

const TX_1SHOT = "https://basescan.org/tx/0x0349304adead048d8392722e4b89b81914c42599f2fa250078ef0b1980c448bf";
const TX_A2A   = "https://sepolia.basescan.org/tx/0x24af8650b5690755e4dfad5d16947c06d753257348872c9bd73bbad8d6b2ae27";
const TX_X402  = "https://sepolia.basescan.org/tx/0xbbcecb7cbe662462794cf5cee1c7dcbf3eba22b9669e902f5b8bfb3b1272450b";

/**
 * Blueprint engineering SVG — delegation tree as a technical drawing.
 * Dimension lines annotate cap spans between nodes.
 * Fonts embedded in SVG to match the page's Blueprint Civic palette.
 */
const DELEGATION_TREE = `<svg viewBox="0 0 360 310" width="360" height="310"
  aria-label="Delegation tree: Mayor grants Manager a 5 USDC cap; Manager sub-delegates 0.50 USDC each to Analyst and Research agents"
  role="img" style="display:block;max-width:100%">
  <defs>
    <marker id="tick-h" markerWidth="1" markerHeight="8" refX=".5" refY="4" orient="auto">
      <line x1=".5" y1="0" x2=".5" y2="8" stroke="#2A5080" stroke-width="1"/>
    </marker>
    <marker id="tick-v" markerWidth="8" markerHeight="1" refX="4" refY=".5" orient="auto">
      <line x1="0" y1=".5" x2="8" y2=".5" stroke="#2A5080" stroke-width="1"/>
    </marker>
  </defs>
  <style>
    .bp-box{fill:#0F2540;stroke:#2A5080;stroke-width:1}
    .bp-box.mayor-box{stroke:#E05C1A;stroke-width:1.5}
    .bp-title-bar{fill:#132B4A}
    .bp-label{font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:700;
      font-size:12px;fill:#C8D8F0;letter-spacing:.08em;text-transform:uppercase}
    .bp-sub{font-family:"JetBrains Mono","SFMono-Regular",Menlo,monospace;
      font-size:9.5px;fill:#7A9BC4;font-variant-numeric:tabular-nums}
    .bp-conn{stroke:#2A5080;stroke-width:1;fill:none;stroke-dasharray:4 3}
    .bp-conn-solid{stroke:#2A5080;stroke-width:1;fill:none}
    .bp-junc{fill:#2A5080}
    .bp-dim{stroke:#2A5080;stroke-width:.75;fill:none}
    .bp-dim-label{font-family:"JetBrains Mono","SFMono-Regular",Menlo,monospace;
      font-size:9px;fill:#3D6080;letter-spacing:.06em}
    .bp-signal{fill:#E05C1A}
    .bp-enforce{font-family:"JetBrains Mono","SFMono-Regular",Menlo,monospace;
      font-size:8.5px;fill:#E05C1A;letter-spacing:.07em}
    .bp-corner{fill:none;stroke:#2A5080;stroke-width:.75}

    /* ── Assembly: the drawing builds itself ── */
    .bp-box{transform-box:fill-box;transform-origin:center;opacity:0;
      animation:bpPop .55s cubic-bezier(.2,1.1,.3,1) .15s forwards}
    .bp-title-bar{opacity:0;animation:bpFade .4s ease .35s forwards}
    .bp-conn-solid,.bp-conn{stroke-dasharray:300;stroke-dashoffset:300;
      animation:bpDraw .75s ease .4s forwards}
    .bp-junc{opacity:0;animation:bpFade .3s ease 1s forwards}
    .bp-dim{opacity:0;animation:bpFade .5s ease 1.05s forwards}
    text{opacity:0;animation:bpFade .55s ease .8s forwards}
    .mayor-box{filter:drop-shadow(0 0 7px rgba(224,92,26,.5))}
    .bp-enforce{filter:drop-shadow(0 0 5px rgba(224,92,26,.6));
      animation:bpFade .6s ease 1.2s forwards}
    @keyframes bpDraw{to{stroke-dashoffset:0}}
    @keyframes bpFade{to{opacity:1}}
    @keyframes bpPop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
    @media(prefers-reduced-motion:reduce){
      .bp-box,.bp-title-bar,.bp-conn-solid,.bp-conn,.bp-junc,.bp-dim,text,.bp-enforce{
        animation:none!important;opacity:1!important;stroke-dashoffset:0!important}
    }
  </style>

  <!-- Drawing border / title block -->
  <rect x="2" y="2" width="356" height="306" fill="none" stroke="#2A5080" stroke-width=".75"/>
  <line x1="2" y1="286" x2="358" y2="286" stroke="#2A5080" stroke-width=".75"/>
  <text x="8" y="298" class="bp-dim-label">DWG: DELEGATION-TREE-01</text>
  <text x="352" y="298" text-anchor="end" class="bp-dim-label">SCALE: SCHEMATIC</text>

  <!-- Mayor node (signal-outlined) -->
  <rect x="94" y="14" width="172" height="48" class="bp-box mayor-box"/>
  <rect x="94" y="14" width="172" height="14" class="bp-title-bar"/>
  <text x="180" y="24" text-anchor="middle" class="bp-label" style="font-size:9px;fill:#E05C1A;letter-spacing:.1em">MAYOR — YOU</text>
  <text x="180" y="43" text-anchor="middle" class="bp-label">City Treasury</text>
  <text x="180" y="55" text-anchor="middle" class="bp-sub">ERC-7715 grant  &lt;= 5.00 USDC</text>

  <!-- Stem from Mayor -->
  <line x1="180" y1="62" x2="180" y2="84" class="bp-conn-solid"/>
  <rect x="178.5" y="82" width="3" height="3" class="bp-junc"/>

  <!-- Dimension line: mayor cap span (right side) -->
  <line x1="270" y1="14" x2="280" y2="14" class="bp-dim"/>
  <line x1="270" y1="62" x2="280" y2="62" class="bp-dim"/>
  <line x1="275" y1="14" x2="275" y2="62" class="bp-dim"
    marker-start="url(#tick-v)" marker-end="url(#tick-v)"/>
  <text x="283" y="42" class="bp-dim-label">5.00</text>
  <text x="283" y="52" class="bp-dim-label">USDC</text>

  <!-- Manager node -->
  <rect x="94" y="84" width="172" height="48" class="bp-box"/>
  <rect x="94" y="84" width="172" height="14" class="bp-title-bar"/>
  <text x="180" y="94" text-anchor="middle" class="bp-label" style="font-size:9px;fill:#7A9BC4;letter-spacing:.1em">MANAGER AGENT</text>
  <text x="180" y="113" text-anchor="middle" class="bp-label">Re-Delegates</text>
  <text x="180" y="125" text-anchor="middle" class="bp-sub">sub-budgets  &lt;= 5.00 USDC</text>

  <!-- Stem from Manager to branch -->
  <line x1="180" y1="132" x2="180" y2="156" class="bp-conn-solid"/>
  <rect x="178.5" y="154" width="3" height="3" class="bp-junc"/>

  <!-- Horizontal branch line -->
  <line x1="86" y1="156" x2="274" y2="156" class="bp-conn-solid"/>
  <rect x="84.5" y="154.5" width="3" height="3" class="bp-junc"/>
  <rect x="272.5" y="154.5" width="3" height="3" class="bp-junc"/>

  <!-- Left stem to Analyst -->
  <line x1="86" y1="156" x2="86" y2="178" class="bp-conn-solid"/>

  <!-- Right stem to Research -->
  <line x1="274" y1="156" x2="274" y2="178" class="bp-conn-solid"/>

  <!-- Dimension line: sub-cap span (between the two agents, line broken for the label) -->
  <line x1="175" y1="178" x2="185" y2="178" class="bp-dim"/>
  <line x1="175" y1="232" x2="185" y2="232" class="bp-dim"/>
  <line x1="180" y1="178" x2="180" y2="193" class="bp-dim" marker-start="url(#tick-v)"/>
  <line x1="180" y1="217" x2="180" y2="232" class="bp-dim" marker-end="url(#tick-v)"/>
  <text x="180" y="203" text-anchor="middle" class="bp-dim-label">0.50</text>
  <text x="180" y="213" text-anchor="middle" class="bp-dim-label">USDC</text>

  <!-- Analyst node -->
  <rect x="30" y="178" width="112" height="54" class="bp-box"/>
  <rect x="30" y="178" width="112" height="14" class="bp-title-bar"/>
  <text x="86" y="188" text-anchor="middle" class="bp-label" style="font-size:9px;fill:#7A9BC4;letter-spacing:.1em">ANALYST AGENT</text>
  <text x="86" y="207" text-anchor="middle" class="bp-label">Analysis</text>
  <text x="86" y="220" text-anchor="middle" class="bp-sub">sub-delegation</text>
  <text x="86" y="230" text-anchor="middle" class="bp-sub">&lt;= 0.50 USDC cap</text>

  <!-- Research node -->
  <rect x="218" y="178" width="112" height="54" class="bp-box"/>
  <rect x="218" y="178" width="112" height="14" class="bp-title-bar"/>
  <text x="274" y="188" text-anchor="middle" class="bp-label" style="font-size:9px;fill:#7A9BC4;letter-spacing:.1em">RESEARCH AGENT</text>
  <text x="274" y="207" text-anchor="middle" class="bp-label">Research</text>
  <text x="274" y="220" text-anchor="middle" class="bp-sub">sub-delegation</text>
  <text x="274" y="230" text-anchor="middle" class="bp-sub">&lt;= 0.50 USDC cap</text>

  <!-- Enforced annotation -->
  <text x="180" y="262" text-anchor="middle" class="bp-enforce">&#9632; ALL CAPS ENFORCED ON-CHAIN &#9632;</text>
  <text x="180" y="274" text-anchor="middle" class="bp-enforce">OVERSPEND REVERTS BY CONSTRUCTION</text>
</svg>`;

/** Blueprint elevation drawing of the city — the landing's establishing "picture". */
function citySkyline(): string {
  const base = 190;
  const buildings = [
    { x: 30, w: 64, h: 96 }, { x: 100, w: 48, h: 140 }, { x: 154, w: 78, h: 72 },
    { x: 240, w: 56, h: 168 }, { x: 304, w: 92, h: 112, signal: true }, { x: 404, w: 46, h: 150 },
    { x: 458, w: 70, h: 88 }, { x: 536, w: 60, h: 182 }, { x: 604, w: 84, h: 104 },
    { x: 696, w: 52, h: 144 }, { x: 756, w: 74, h: 80 }, { x: 838, w: 58, h: 166 },
    { x: 904, w: 80, h: 120 }, { x: 992, w: 50, h: 96 }, { x: 1050, w: 78, h: 150 }, { x: 1136, w: 38, h: 76 },
  ] as { x: number; w: number; h: number; signal?: boolean }[];
  const parts: string[] = [];
  for (const b of buildings) {
    const y = base - b.h;
    parts.push(`<rect class="sky-b${b.signal ? " sky-b-signal" : ""}" x="${b.x}" y="${y}" width="${b.w}" height="${b.h}"/>`);
    for (let wy = y + 12; wy < base - 8; wy += 16) {
      for (let wx = b.x + 9; wx < b.x + b.w - 7; wx += 14) {
        parts.push(`<rect class="sky-win${b.signal ? " sky-win-signal" : ""}" x="${wx}" y="${wy}" width="5" height="7"/>`);
      }
    }
    const cx = b.x + b.w / 2;
    if (b.signal) {
      parts.push(
        `<line class="sky-mast" x1="${cx}" y1="${y}" x2="${cx}" y2="${y - 26}"/>` +
        `<rect class="sky-flag" x="${cx}" y="${y - 26}" width="40" height="13"/>` +
        `<text class="sky-flagtext" x="${cx + 20}" y="${y - 16}" text-anchor="middle">7715</text>`);
    } else if (b.h > 150) {
      parts.push(`<line class="sky-antenna" x1="${cx}" y1="${y}" x2="${cx}" y2="${y - 13}"/>`);
    }
  }
  const hatch = Array.from({ length: 40 }, (_, i) => `<line class="sky-dim" x1="${i * 32}" y1="190" x2="${i * 32 - 9}" y2="199"/>`).join("");
  return `<svg viewBox="0 0 1200 222" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Blueprint elevation drawing of Agent City: a skyline with a signal-orange treasury tower flying an ERC-7715 flag">
    <style>
      .sky-b{fill:#0C1C30;stroke:#2A5080;stroke-width:1}
      .sky-b-signal{stroke:#E05C1A;stroke-width:1.4}
      .sky-win{fill:#1B3A5E}.sky-win-signal{fill:#7A3A1E}
      .sky-mast{stroke:#E05C1A;stroke-width:1}.sky-antenna{stroke:#3D6080;stroke-width:1}
      .sky-flag{fill:#E05C1A}
      .sky-flagtext{font-family:"JetBrains Mono",monospace;font-size:8px;fill:#0C1C30;font-weight:600;letter-spacing:.04em}
      .sky-ground{stroke:#2A5080;stroke-width:1}.sky-dim{stroke:#2A5080;stroke-width:.6}
      .sky-cap{font-family:"JetBrains Mono",monospace;font-size:9px;fill:#3D6080;letter-spacing:.1em}
    </style>
    <line class="sky-ground" x1="0" y1="190" x2="1200" y2="190"/>
    ${hatch}
    ${parts.join("")}
    <text class="sky-cap" x="14" y="216">FIG. 1 &mdash; AGENT CITY &middot; ELEVATION</text>
    <text class="sky-cap" x="1186" y="216" text-anchor="end">SCALE: SCHEMATIC</text>
  </svg>`;
}

export const LANDING_HTML = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Agent City &mdash; an economy of AI agents that cannot overspend</title>
<meta name="description" content="Agent City: AI agents hire and pay each other under cryptographic budgets enforced on-chain. Sub-budgets via MetaMask delegations (A2A), payments via x402, gasless settlement via 1Shot."/>
${FAVICON_LINK}
${FONTS}
<style>${THEME_CSS}

/* ── Nav ── */
nav{
  position:sticky;top:0;z-index:50;
  background:var(--bg-2);border-bottom:1px solid var(--dim-line);
}
nav .container{
  display:flex;align-items:center;
  justify-content:space-between;height:54px;
}
.brand{display:flex;flex-direction:row;align-items:center;gap:10px;text-decoration:none}
.brand-text{display:flex;flex-direction:column;gap:1px}
.brand-name{
  font-family:var(--display);font-size:20px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink);line-height:1;
}
.brand-sub{
  font-family:var(--mono);font-size:9px;letter-spacing:.08em;
  text-transform:uppercase;color:var(--ink-3);
}
.navlinks{display:flex;align-items:center;gap:4px}
.navlinks a.tab{
  padding:7px 11px;color:var(--ink-2);font-family:var(--mono);
  font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
}
.navlinks a.tab:hover{color:var(--ink)}

/* ── Hero ── */
.hero{padding:72px 0 64px;border-bottom:1px solid var(--dim-line);position:relative;overflow:hidden}
.hero::before{
  content:'';position:absolute;top:-120px;right:-80px;width:620px;height:620px;
  background:radial-gradient(circle,rgba(224,92,26,.14),rgba(224,92,26,0) 62%);
  pointer-events:none;z-index:0;
}
.hero .container{position:relative;z-index:1}
.hero-grid{
  display:grid;grid-template-columns:1fr .9fr;
  gap:56px;align-items:start;
}
.hero-section-label{
  font-family:var(--mono);font-size:10px;font-weight:600;
  letter-spacing:.12em;text-transform:uppercase;
  color:var(--ink-3);margin-bottom:20px;
}
.hero h1{
  font-family:var(--display);font-weight:700;text-transform:uppercase;
  font-size:clamp(38px,5.2vw,62px);line-height:.98;
  letter-spacing:.03em;margin:0 0 22px;color:var(--ink);
}
.hero h1 em{
  font-style:normal;color:var(--signal);
}
.hero .lede{
  font-family:var(--body);font-size:16px;color:var(--ink-2);
  max-width:44ch;line-height:1.65;margin-bottom:32px;font-weight:400;
}
.cta-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:32px}

/* Tech stack — dimension-line list */
.tech-dim-list{margin-top:8px}
.tech-dim-list .dim-line>span{background:var(--bg)}
.tech-dim-item{
  display:flex;align-items:baseline;gap:10px;
  padding:8px 0;border-bottom:1px solid var(--dim-line);
  font-family:var(--mono);font-size:11px;color:var(--ink-2);
  letter-spacing:.04em;
}
.tech-dim-item:last-child{border-bottom:0}
.tech-dim-item .ti-code{
  font-size:10px;color:var(--ink-3);flex:none;letter-spacing:.06em;
}

/* Tree drawing card */
.tree-card{
  border:1px solid var(--dim-line);background:var(--surface);padding:0;
  box-shadow:0 0 0 1px rgba(224,92,26,.08),0 24px 60px rgba(0,0,0,.5);
}
.tree-card-head{
  padding:8px 14px;border-bottom:1px solid var(--dim-line);
  display:flex;align-items:center;justify-content:space-between;
  background:var(--bg-2);
}
.tree-card-head .tc-label{
  font-family:var(--mono);font-size:10px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);
}
.tree-card-body{padding:20px;display:flex;justify-content:center;background:var(--bg);position:relative}
.tree-card-body::before{
  content:'';position:absolute;top:20%;left:50%;transform:translateX(-50%);
  width:240px;height:160px;
  background:radial-gradient(ellipse,rgba(224,92,26,.10),rgba(224,92,26,0) 70%);
  pointer-events:none;
}

/* ── City elevation band (establishing picture) ── */
.skyline-band{position:relative;overflow:hidden;border-bottom:1px solid var(--dim-line);background:var(--bg-2)}
.skyline-band svg{display:block;width:100%;height:auto}
.skyline-band::after{content:'';position:absolute;left:0;right:0;top:0;height:64px;background:linear-gradient(to bottom,var(--bg-2),transparent);pointer-events:none}

/* ── How it works ── */
section{padding:72px 0}
.section-label{
  font-family:var(--mono);font-size:10px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink-3);text-align:center;margin-bottom:12px;
}
.shead{max-width:560px;margin:0 auto 44px;text-align:center}
.shead h2{
  font-family:var(--display);font-weight:700;text-transform:uppercase;
  font-size:clamp(24px,3.2vw,36px);letter-spacing:.05em;color:var(--ink);
}
.shead p{margin-top:12px;color:var(--ink-2);font-size:15px;font-family:var(--body)}

/* Annotated two-column layout */
.annotated-grid{
  display:grid;grid-template-columns:1fr 1fr;
  gap:48px;align-items:start;
  max-width:900px;margin:0 auto;
}
/* Left: schematic city-plan SVG */
.city-plan-wrap{
  background:var(--bg);border:1px solid var(--dim-line);padding:24px;
  display:flex;align-items:center;justify-content:center;
}
/* Right: numbered annotation list */
.annotation-list{
  list-style:none;margin:0;padding:0;
}
.annotation-list li{
  display:grid;grid-template-columns:28px 1fr;
  gap:12px;padding:16px 0;
  border-bottom:1px solid var(--dim-line);
  align-items:start;
}
.annotation-list li:last-child{border-bottom:0}
/* Triangle callout marker */
.annot-marker{
  width:22px;height:22px;flex:none;
  background:var(--signal);
  clip-path:polygon(50% 0%,100% 100%,0% 100%);
  display:flex;align-items:flex-end;justify-content:center;
  padding-bottom:3px;margin-top:2px;
}
.annot-marker span{
  font-family:var(--mono);font-size:9px;font-weight:600;
  color:#fff;line-height:1;
}
.annot-content h3{
  font-family:var(--display);font-size:15px;font-weight:700;
  text-transform:uppercase;letter-spacing:.06em;
  margin-bottom:5px;color:var(--ink);
}
.annot-content p{
  font-family:var(--body);font-size:13.5px;
  color:var(--ink-2);line-height:1.6;
}

/* ── City-plan schematic SVG (inline) ── */
.city-schematic{display:block;width:100%;max-width:280px}

/* ── On-chain proof — drawing sheets layout ── */
.proof-section{
  border-top:2px solid var(--dim-line);padding-top:6px;
}
.proof-title-block{
  border-top:1px solid var(--dim-line);padding:8px 0 14px;
  display:flex;align-items:baseline;justify-content:space-between;
  margin-bottom:0;
}
.proof-title-block .ptb-name{
  font-family:var(--display);font-size:13px;font-weight:700;
  letter-spacing:.18em;text-transform:uppercase;color:var(--ink);
}
.proof-title-block .ptb-ref{
  font-family:var(--mono);font-size:10px;color:var(--ink-3);
  letter-spacing:.06em;text-transform:uppercase;
}

/* Drawing-sheet proof cards */
.proof-cards{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:1px;background:var(--dim-line);margin-top:0;
  border:1px solid var(--dim-line);
}
.proof-card{
  background:var(--surface);padding:0;
  position:relative;overflow:hidden;
}
.proof-card-inner{padding:20px 18px 48px}
.proof-card .pc-tag{
  font-family:var(--mono);font-size:9px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);
  margin-bottom:10px;
}
.proof-card .pc-head{
  font-family:var(--display);font-size:18px;font-weight:700;
  text-transform:uppercase;letter-spacing:.04em;
  margin-bottom:8px;color:var(--ink);line-height:1.1;
}
.proof-card .pc-body{
  font-family:var(--body);font-size:13px;
  color:var(--ink-2);line-height:1.6;
}
/* Title block corner inset */
.proof-card-title-block{
  position:absolute;bottom:0;left:0;right:0;
  border-top:1px solid var(--dim-line);
  background:var(--bg-2);
  padding:6px 12px;
  display:flex;align-items:center;justify-content:space-between;
}
.pc-sheet-ref{
  font-family:var(--mono);font-size:9px;color:var(--ink-3);
  letter-spacing:.06em;text-transform:uppercase;
}
.pc-hash{
  font-family:var(--mono);font-size:9px;color:var(--ink-3);
  font-variant-numeric:tabular-nums;
}
.proof-card-link{
  display:inline-block;margin-top:12px;
  font-family:var(--mono);font-size:11px;font-weight:600;
  color:var(--signal);letter-spacing:.04em;
  border-bottom:1px solid rgba(224,92,26,.35);
}
.proof-card-link:hover{color:var(--ink);border-bottom-color:transparent}

/* SETTLED stamp overlay on proven cards */
.stamp-wrap{
  position:absolute;top:14px;right:14px;
  pointer-events:none;
}

/* ── Why-trust table — spec grid ── */
.spec-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:1px;background:var(--dim-line);
  border:1px solid var(--dim-line);
}
.spec-cell{
  background:var(--surface);padding:22px 20px;
}
.spec-cell .sc-glyph{
  font-family:var(--mono);font-size:11px;color:var(--signal);
  margin-bottom:10px;letter-spacing:.06em;
}
.spec-cell h3{
  font-family:var(--display);font-size:15px;font-weight:700;
  text-transform:uppercase;letter-spacing:.06em;
  margin-bottom:8px;color:var(--ink);
}
.spec-cell p{font-family:var(--body);font-size:13px;color:var(--ink-2);line-height:1.55}

/* ── CTA band — announcement notice ── */
.ctaband{
  border:2px solid var(--dim-line);outline:1px solid var(--dim-line);
  outline-offset:5px;padding:52px;text-align:center;
  background:var(--surface);position:relative;overflow:hidden;
}
.ctaband::before{
  content:'';position:absolute;inset:0;
  background-image:
    repeating-linear-gradient(0deg,var(--grid) 0,var(--grid) 1px,transparent 1px,transparent 32px),
    repeating-linear-gradient(90deg,var(--grid) 0,var(--grid) 1px,transparent 1px,transparent 32px);
  pointer-events:none;
}
.ctaband-content{position:relative;z-index:1}
.ctaband h2{
  font-family:var(--display);font-size:clamp(22px,3vw,34px);font-weight:700;
  text-transform:uppercase;letter-spacing:.06em;color:var(--ink);
}
.ctaband p{
  margin:14px auto 28px;color:var(--ink-2);
  max-width:48ch;font-family:var(--body);font-size:15px;line-height:1.65;
}

/* ── Footer ── */
footer{border-top:2px solid var(--dim-line);padding:28px 0;margin-top:56px}
footer .container{
  display:flex;justify-content:space-between;
  align-items:center;flex-wrap:wrap;gap:16px;
}
footer .fl{
  display:flex;gap:20px;color:var(--ink-3);
  font-family:var(--mono);font-size:11px;letter-spacing:.04em;text-transform:uppercase;
}
footer .fl a:hover{color:var(--ink)}

/* ── Responsive ── */
@media(max-width:960px){
  .hero-grid{grid-template-columns:1fr;gap:40px}
  .annotated-grid{grid-template-columns:1fr}
  .city-plan-wrap{display:none}
  .proof-cards{grid-template-columns:1fr 1fr}
  .spec-grid{grid-template-columns:1fr}
  .ctaband{padding:32px 20px;outline:none}
}
@media(max-width:640px){
  .proof-cards{grid-template-columns:1fr}
  section{padding:48px 0}.hero{padding:44px 0 36px}
  .navlinks a.tab{display:none}
  .hero h1{font-size:clamp(32px,9vw,48px)}
}
@media(max-width:375px){
  .hero h1{font-size:38px}
}
</style></head>
<body>

<nav><div class="container">
  <a class="brand" href="/">
    ${LOGO_MARK}
    <span class="brand-text">
      <span class="brand-name">Agent City</span>
      <span class="brand-sub">MetaMask &middot; 1Shot &middot; Venice &mdash; Vol.&thinsp;I</span>
    </span>
  </a>
  <div class="navlinks">
    <a class="tab" href="#how">How it works</a>
    <a class="tab" href="#proof">On-chain proof</a>
    <a class="btn btn-primary" href="/app">Enter the city &rarr;</a>
  </div>
</div></nav>

<!-- Hero -->
<header class="hero"><div class="container hero-grid">
  <div>
    <div class="hero-section-label reveal">MetaMask Smart Accounts &middot; 1Shot &middot; Venice AI</div>
    <h1 class="reveal d1">A <em>spending firewall</em> for AI agents.</h1>
    <p class="lede reveal d2">Hand an autonomous agent a funded wallet without the fear. A private model must <em>approve</em> every payment before the money can move &mdash; and the budget is a MetaMask delegation it <em>physically cannot exceed</em>. Two locks: <em>whether</em>, and <em>how much</em>. Neither trusted; both enforced on-chain.</p>
    <div class="cta-row reveal d3">
      <a class="btn btn-primary btn-lg cta-glow" href="/app">Enter the city &rarr;</a>
      <a class="btn btn-lg" href="#proof">View on-chain proof</a>
    </div>
    <div class="tech-dim-list reveal d4">
      <div class="dim-line"><span>Stack</span></div>
      <div class="tech-dim-item"><span class="ti-code">A2A</span> Capped sub-budgets via re-delegation (ERC-7710)</div>
      <div class="tech-dim-item"><span class="ti-code">x402</span> Agents pay agents via HTTP 402 pay-per-call</div>
      <div class="tech-dim-item"><span class="ti-code">1SHT</span> Gasless settlement through 1Shot relayer</div>
      <div class="tech-dim-item"><span class="ti-code">VNC</span> Private reasoning via Venice zero-retention AI</div>
    </div>
  </div>

  <!-- Delegation tree — blueprint engineering drawing -->
  <div class="tree-card reveal d2" role="figure" aria-label="Delegation tree showing Mayor, Manager, Analyst, and Research agents with capped sub-budgets">
    <div class="tree-card-head">
      <span class="tc-label">Dwg: Delegation Tree &mdash; Authority Flow</span>
      <span class="badge ok"><span class="dot ok"></span>Live on Base</span>
    </div>
    <div class="tree-card-body">
      ${DELEGATION_TREE}
    </div>
  </div>
</div></header>

<!-- City elevation — establishing picture -->
<div class="skyline-band" aria-hidden="false">${citySkyline()}</div>

<!-- How it works -->
<section id="how"><div class="container">
  <div class="section-label reveal">Operating Specification</div>
  <div class="shead reveal d1">
    <h2>A full agent economy &mdash; bounded by cryptography</h2>
    <p>Every cap is on-chain. Not trust &mdash; math.</p>
  </div>

  <div class="annotated-grid">

    <!-- Left: city-plan schematic -->
    <div class="city-plan-wrap reveal">
      <svg class="city-schematic" viewBox="0 0 240 280" aria-hidden="true">
        <style>
          .cs-bg{fill:#091525}.cs-block{fill:#0F2540;stroke:#2A5080;stroke-width:.75}
          .cs-road{stroke:#132B4A;stroke-width:6;fill:none}
          .cs-road-label{font-family:"JetBrains Mono",monospace;font-size:7px;fill:#3D6080;letter-spacing:.05em}
          .cs-zone-label{font-family:"Barlow Condensed","Arial Narrow",sans-serif;
            font-size:9px;font-weight:700;fill:#3D6080;text-transform:uppercase;letter-spacing:.08em}
          .cs-signal{fill:#E05C1A}.cs-ok{fill:#2DC98A}
          .cs-marker{font-family:"JetBrains Mono",monospace;font-size:8px;fill:#E05C1A;font-weight:600}
          .cs-dim{stroke:#2A5080;stroke-width:.5;fill:none}
        </style>
        <rect width="240" height="280" class="cs-bg"/>
        <rect x="2" y="2" width="236" height="276" fill="none" stroke="#2A5080" stroke-width=".5"/>

        <!-- Roads -->
        <line x1="120" y1="0" x2="120" y2="280" class="cs-road"/>
        <line x1="0" y1="140" x2="240" y2="140" class="cs-road"/>

        <!-- Zone A: Mayor (top-left) -->
        <rect x="10" y="10" width="98" height="118" class="cs-block"/>
        <text x="59" y="58" text-anchor="middle" class="cs-zone-label">Mayor</text>
        <text x="59" y="72" text-anchor="middle" class="cs-zone-label">Treasury</text>
        <text x="59" y="92" text-anchor="middle" style="font-family:JetBrains Mono,monospace;font-size:7px;fill:#7A9BC4">&lt;= 5.00 USDC</text>
        <rect x="48" y="100" width="22" height="14" class="cs-signal" rx="0"/>
        <text x="59" y="110" text-anchor="middle" style="font-family:JetBrains Mono,monospace;font-size:7px;fill:#fff;letter-spacing:.06em">ERC-7715</text>

        <!-- Zone B: Manager (top-right) -->
        <rect x="132" y="10" width="98" height="118" class="cs-block"/>
        <text x="181" y="58" text-anchor="middle" class="cs-zone-label">Manager</text>
        <text x="181" y="72" text-anchor="middle" class="cs-zone-label">Agent</text>
        <text x="181" y="92" text-anchor="middle" style="font-family:JetBrains Mono,monospace;font-size:7px;fill:#7A9BC4">Re-delegates</text>

        <!-- Zone C: Analyst (bottom-left) -->
        <rect x="10" y="152" width="98" height="118" class="cs-block"/>
        <text x="59" y="208" text-anchor="middle" class="cs-zone-label">Analyst</text>
        <text x="59" y="222" text-anchor="middle" class="cs-zone-label">Agent</text>
        <text x="59" y="240" text-anchor="middle" style="font-family:JetBrains Mono,monospace;font-size:7px;fill:#7A9BC4">&lt;= 0.50 USDC</text>

        <!-- Zone D: Research (bottom-right) -->
        <rect x="132" y="152" width="98" height="118" class="cs-block"/>
        <text x="181" y="208" text-anchor="middle" class="cs-zone-label">Research</text>
        <text x="181" y="222" text-anchor="middle" class="cs-zone-label">Agent</text>
        <text x="181" y="240" text-anchor="middle" style="font-family:JetBrains Mono,monospace;font-size:7px;fill:#7A9BC4">&lt;= 0.50 USDC</text>

        <!-- Callout markers -->
        <text x="16" y="24" class="cs-marker">A</text>
        <text x="138" y="24" class="cs-marker">B</text>
        <text x="16" y="166" class="cs-marker">C</text>
        <text x="138" y="166" class="cs-marker">D</text>

        <!-- Road labels -->
        <text x="94" y="136" class="cs-road-label">DELEGATION AVE</text>
        <text x="126" y="136" class="cs-road-label" style="transform:rotate(90deg);transform-origin:126px 130px">PAYMENT ST</text>
      </svg>
    </div>

    <!-- Right: annotation list -->
    <ol class="annotation-list reveal d1" aria-label="How it works steps">
      <li>
        <div class="annot-marker"><span>A</span></div>
        <div class="annot-content">
          <h3>Fund the city</h3>
          <p>You grant the city treasury a master budget via MetaMask Advanced Permissions (ERC-7715) &mdash; a scoped delegation with a hard USDC cap. The agents hold no keys.</p>
        </div>
      </li>
      <li>
        <div class="annot-marker"><span>B</span></div>
        <div class="annot-content">
          <h3>Hire specialists</h3>
          <p>The Manager re-delegates <em>narrower</em> sub-budgets to worker agents (ERC-7710). A worker can never access more than it was handed &mdash; the chain enforces it.</p>
        </div>
      </li>
      <li>
        <div class="annot-marker"><span>C</span></div>
        <div class="annot-content">
          <h3>Agents pay agents</h3>
          <p>Workers hit real HTTP 402 paywalled services. The gate unlocks on payment submission; each bounded ERC-7710 redemption then settles on-chain, relayed gaslessly through 1Shot with gas paid in USDC.</p>
        </div>
      </li>
      <li>
        <div class="annot-marker"><span>D</span></div>
        <div class="annot-content">
          <h3>Revoke the whole city</h3>
          <p>Pull authority in one click. The Manager and every worker beneath it is cut off instantly &mdash; the next spend never clears, and nothing new settles on-chain.</p>
        </div>
      </li>
    </ol>
  </div>
</div></section>

<!-- On-chain proof -->
<section id="proof" style="padding-top:0"><div class="container">
  <div class="proof-section">
    <div class="proof-title-block reveal">
      <span class="ptb-name">On-Chain Proof &mdash; Transaction Log</span>
      <span class="ptb-ref">Proven on Base Sepolia &amp; Base mainnet &mdash; not a mock</span>
    </div>

    <div class="proof-cards">

      <!-- Card 1: A2A Re-delegation -->
      <div class="proof-card reveal d1">
        <div class="proof-card-inner">
          <div class="pc-tag">Best A2A Coordination &mdash; Sheet 01/04</div>
          <div class="pc-head">Agents hire agents</div>
          <p class="pc-body">A Manager re-delegates a <em>narrower</em> budget to a worker. The chain enforces the smaller cap &mdash; the transaction reverts if the worker tries to exceed it.</p>
          <a class="proof-card-link" href="${TX_A2A}" target="_blank" rel="noopener">0x24af&hellip;ae27 &nearr;</a>
          <div class="stamp-wrap"><span class="stamp-settled">Settled</span></div>
        </div>
        <div class="proof-card-title-block">
          <span class="pc-sheet-ref">A2A / ERC-7710 &middot; Base Sepolia</span>
          <span class="pc-hash">0x24af&hellip;ae27</span>
        </div>
      </div>

      <!-- Card 2: x402 Payment -->
      <div class="proof-card reveal d2">
        <div class="proof-card-inner">
          <div class="pc-tag">Best x402 + ERC-7710 &mdash; Sheet 02/04</div>
          <div class="pc-head">Agents pay agents</div>
          <p class="pc-body">A worker hits a real HTTP 402 paywalled service; the gate unlocks on payment submission and the bounded ERC-7710 redemption then settles on-chain (verified out-of-band via relayer status / balanceOf).</p>
          <a class="proof-card-link" href="${TX_X402}" target="_blank" rel="noopener">0xbbce&hellip;450b &nearr;</a>
          <div class="stamp-wrap"><span class="stamp-settled">Settled</span></div>
        </div>
        <div class="proof-card-title-block">
          <span class="pc-sheet-ref">x402 / ERC-7710 &middot; Base Sepolia</span>
          <span class="pc-hash">0xbbce&hellip;450b</span>
        </div>
      </div>

      <!-- Card 3: 1Shot gasless -->
      <div class="proof-card reveal d3">
        <div class="proof-card-inner">
          <div class="pc-tag">Best 1Shot Relayer &mdash; Sheet 03/04</div>
          <div class="pc-head">Gasless settlement</div>
          <p class="pc-body">Every payment redeems through 1Shot&rsquo;s permissionless relayer. Gas paid in USDC &mdash; no ETH required. Proven on <strong>Base mainnet</strong>, not testnet.</p>
          <a class="proof-card-link" href="${TX_1SHOT}" target="_blank" rel="noopener">0x0349&hellip;48bf &nearr;</a>
          <div class="stamp-wrap"><span class="stamp-settled">Settled</span></div>
        </div>
        <div class="proof-card-title-block">
          <span class="pc-sheet-ref">1Shot Relayer &middot; Base mainnet</span>
          <span class="pc-hash">0x0349&hellip;48bf</span>
        </div>
      </div>

    </div>

    <!-- Second row of proof cards -->
    <div class="proof-cards" style="margin-top:1px">

      <!-- Card 4: Venice reasoning -->
      <div class="proof-card reveal d1">
        <div class="proof-card-inner">
          <div class="pc-tag">Best Venice AI &mdash; Sheet 04/04</div>
          <div class="pc-head">Private reasoning</div>
          <p class="pc-body">Every agent reasons with Venice&rsquo;s zero-retention model. Reasoning traces appear live in the City UI &mdash; each worker shows exactly how it chose to spend.</p>
          <a class="proof-card-link" href="/app">Watch agents reason &rarr;</a>
        </div>
        <div class="proof-card-title-block">
          <span class="pc-sheet-ref">Venice AI &middot; Zero-retention</span>
          <span class="pc-hash">live in /app</span>
        </div>
      </div>

      <!-- Card 5: The thesis -->
      <div class="proof-card reveal d2">
        <div class="proof-card-inner">
          <div class="pc-tag">The Thesis &mdash; Architecture</div>
          <div class="pc-head">The budget is the leash</div>
          <p class="pc-body">Autonomous AI spending is the unsolved part of agent coordination. Agent City solves it with on-chain caps &mdash; so autonomy never means unbounded financial risk.</p>
          <a class="proof-card-link" href="/app">See it move money &rarr;</a>
        </div>
        <div class="proof-card-title-block">
          <span class="pc-sheet-ref">ERC-7715 / ERC-7710 &middot; Base</span>
          <span class="pc-hash">on-chain caps</span>
        </div>
      </div>

      <!-- Card 6: Best agent -->
      <div class="proof-card reveal d3">
        <div class="proof-card-inner">
          <div class="pc-tag">Best Agent &mdash; Bounded Autonomy</div>
          <div class="pc-head">Bounded autonomy</div>
          <p class="pc-body">Each agent runs a resumable planner &mdash; reason, propose, act &mdash; but only inside its cap. You authorize the budget up front (ERC-7715), a private Venice gate approves each spend, and you can revoke the whole tree in one click.</p>
          <a class="proof-card-link" href="/app">Enter the city &rarr;</a>
        </div>
        <div class="proof-card-title-block">
          <span class="pc-sheet-ref">Best Agent &middot; Agent City</span>
          <span class="pc-hash">approve-first</span>
        </div>
      </div>

    </div>
  </div>
</div></section>

<!-- Why trust -->
<section style="padding-top:0"><div class="container">
  <div class="section-label reveal">Specification &mdash; Security Properties</div>
  <div class="spec-grid">
    <div class="spec-cell reveal d1">
      <div class="sc-glyph">SPC-01 / KEY-CUSTODY</div>
      <h3>No agent holds your keys</h3>
      <p>Agents sign nothing on your behalf beyond the scoped delegations you explicitly grant down the tree. Your wallet stays in your custody.</p>
    </div>
    <div class="spec-cell reveal d2">
      <div class="sc-glyph">SPC-02 / CAP-ENFORCEMENT</div>
      <h3>Every cap is cryptographic</h3>
      <p>Budgets are on-chain caveats, not prompts. Exceed one and the transaction reverts &mdash; by construction, not by policy or agent goodwill.</p>
    </div>
    <div class="spec-cell reveal d3">
      <div class="sc-glyph">SPC-03 / REVOCATION</div>
      <h3>Revoke the whole tree</h3>
      <p>Pull authority in one click &mdash; every worker beneath the Manager is cut off the instant you revoke; no further payment goes through.</p>
    </div>
  </div>
</div></section>

<!-- CTA band -->
<section style="padding-top:0"><div class="container">
  <div class="ctaband reveal">
    <div class="ctaband-content">
      <h2>Watch a city of agents transact under hard caps.</h2>
      <p>The live demo runs on Base: the Manager hires workers, they pay via x402, 1Shot settles on-chain &mdash; and you can revoke the whole city in one click.</p>
      <a class="btn btn-primary btn-lg cta-glow" href="/app">Enter the city &rarr;</a>
    </div>
  </div>
</div></section>

<footer><div class="container">
  <a class="brand" href="/">
    ${LOGO_MARK}
    <span class="brand-text">
      <span class="brand-name">Agent City</span>
      <span class="brand-sub">MetaMask &middot; 1Shot &middot; Venice &mdash; Vol.&thinsp;I</span>
    </span>
  </a>
  <div class="fl">
    <a href="#how">How it works</a>
    <a href="#proof">On-chain proof</a>
    <a href="/app">Enter the city</a>
    <a href="/grant">Grant permit</a>
    <span class="muted">Base Sepolia &middot; Base mainnet</span>
  </div>
</div></footer>

<noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript>
<script>
(function(){
  var els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    els.forEach(function(e){e.classList.add('in');});
    return;
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}
    });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e);});
})();
</script>
</body></html>`;
