/**
 * ERC-7715 Advanced Permissions front door (GET /grant). Blueprint Civic theme.
 * "Issue a City Permit" — formal drawing-sheet framing, prerequisite hard gate,
 * monospace spec table, APPROVED/REJECTED stamp on result.
 * No build step — plain template string served by the Hono API.
 */
import { FAVICON_LINK, FONTS, LOGO_MARK, THEME_CSS } from "./theme.js";

export const GRANT_HTML = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Agent City &mdash; Issue a City Permit (ERC-7715)</title>
${FAVICON_LINK}
${FONTS}
<style>${THEME_CSS}

/* ── Nav ── */
nav{
  background:var(--bg-2);border-bottom:1px solid var(--dim-line);
}
nav .container{
  display:flex;align-items:center;justify-content:space-between;height:54px;
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

/* ── Page wrapper — narrow centered column ── */
.wrap{max-width:640px;margin:0 auto;padding:44px 24px 80px}

/* ── Drawing sheet outer frame ── */
.sheet{
  border:1px solid var(--dim-line);
  position:relative;
}
.sheet-outer-rule{
  border:1px solid var(--dim-line);
  outline:1px solid var(--dim-line);
  outline-offset:4px;
  margin:12px;
}

/* ── Formal title block (top of sheet) ── */
.title-block{
  border-bottom:2px solid var(--dim-line);
  background:var(--bg-2);
}
.title-block-inner{
  border-bottom:1px solid var(--dim-line);
  display:grid;
  grid-template-columns:1fr auto;
  align-items:stretch;
}
.tb-left{
  padding:14px 18px 12px;
  border-right:1px solid var(--dim-line);
}
.tb-project-label{
  font-family:var(--mono);font-size:9px;font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);
  margin-bottom:4px;
}
.tb-project-name{
  font-family:var(--display);font-size:clamp(22px,4vw,32px);font-weight:700;
  text-transform:uppercase;letter-spacing:.06em;color:var(--ink);line-height:1.05;
}
.tb-project-sub{
  font-family:var(--body);font-size:13px;color:var(--ink-2);
  margin-top:6px;line-height:1.5;
}
.tb-right{
  display:flex;flex-direction:column;justify-content:stretch;min-width:140px;
}
.tb-field{
  padding:6px 12px;border-bottom:1px solid var(--dim-line);
  display:flex;flex-direction:column;gap:2px;flex:1;
}
.tb-field:last-child{border-bottom:0}
.tb-field-label{
  font-family:var(--mono);font-size:8px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);
}
.tb-field-value{
  font-family:var(--mono);font-size:10px;color:var(--ink-2);
  font-variant-numeric:tabular-nums;letter-spacing:.04em;
}

/* ── Sheet body ── */
.sheet-body{padding:22px 20px 28px}

/* ── Prerequisite check box ── */
.prereq-box{
  border:2px solid var(--bad);
  outline:1px solid var(--bad);
  outline-offset:3px;
  background:var(--bad-dim);
  padding:16px 18px;
  margin-bottom:28px;
}
.prereq-head{
  font-family:var(--display);font-size:12px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;
  color:var(--bad);margin-bottom:10px;
  display:flex;align-items:center;gap:8px;
}
.prereq-head::before{
  content:'';display:inline-block;
  width:10px;height:10px;
  background:var(--bad);
  clip-path:polygon(50% 0%,100% 100%,0% 100%);
  flex:none;
}
.prereq-items{
  list-style:none;margin:0;padding:0;
  display:flex;flex-direction:column;gap:6px;
}
.prereq-items li{
  display:flex;align-items:flex-start;gap:10px;
  font-family:var(--mono);font-size:11px;color:var(--ink-2);
  letter-spacing:.02em;line-height:1.5;
}
.prereq-items li::before{
  content:'[ ]';
  font-family:var(--mono);font-size:10px;color:var(--bad);
  flex:none;margin-top:1px;letter-spacing:.04em;
}
.prereq-items li a{
  color:var(--bad);border-bottom:1px solid rgba(212,64,64,.35);
}
.prereq-items li a:hover{color:var(--ink);border-bottom-color:transparent}
.prereq-note{
  margin-top:12px;padding-top:10px;
  border-top:1px solid rgba(212,64,64,.2);
  font-family:var(--mono);font-size:10px;color:var(--ink-3);
  line-height:1.6;letter-spacing:.02em;
}
.prereq-note code{
  color:var(--bad);letter-spacing:.04em;
}

/* ── Permit spec table ── */
.permit-masthead{
  border-top:2px solid var(--dim-line);
  padding-top:5px;margin-bottom:16px;
}
.permit-masthead-inner{
  border-top:1px solid var(--dim-line);padding:7px 0 10px;
  display:flex;align-items:baseline;justify-content:space-between;gap:16px;
}
.pm-name{
  font-family:var(--display);font-size:13px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--ink);
}
.pm-form{
  font-family:var(--mono);font-size:10px;color:var(--ink-3);
  letter-spacing:.06em;text-transform:uppercase;
}

.permit-table{
  border:1px solid var(--dim-line);
  margin-bottom:22px;
}
.permit-table .brow{
  padding:9px 14px;
  border-bottom:1px solid var(--dim-line);
}
.permit-table .brow:last-of-type{border-bottom:0}
.permit-type-row{
  padding:7px 14px;
  background:var(--bg-2);
  border-bottom:1px solid var(--dim-line);
  display:flex;align-items:center;justify-content:space-between;
}
.permit-type-row .k{
  font-family:var(--mono);font-size:9px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);
}
.permit-type-row .v{
  font-family:var(--mono);font-size:11px;
  color:var(--signal);letter-spacing:.04em;
  font-variant-numeric:tabular-nums;
}

/* ── Action row ── */
.permit-actions{
  padding:14px 14px 12px;
  display:flex;gap:8px;flex-wrap:wrap;
  border-top:1px solid var(--dim-line);
  background:var(--bg-2);
}

/* ── Output / result area ── */
#out{
  font-family:var(--mono);font-size:11px;line-height:1.65;
  white-space:pre-wrap;word-break:break-all;
  background:var(--bg-2);
  border-top:1px solid var(--dim-line);
  padding:14px 14px 14px;
  max-height:280px;overflow:auto;
  display:none;
  color:var(--ink-2);
  position:relative;
}
#out.ok{
  border-top:2px solid var(--ok);
  background:var(--ok-dim);
  color:var(--ok);
}
#out.bad{
  border-top:2px solid var(--bad);
  background:var(--bad-dim);
  color:var(--bad);
}

/* ── Result stamp overlay ── */
.result-stamp-wrap{
  position:absolute;top:12px;right:16px;
  pointer-events:none;
}

/* ── Drawing notes — numbered steps ── */
.notes-masthead{
  border-top:2px solid var(--dim-line);
  padding-top:5px;margin:28px 0 14px;
}
.notes-masthead-inner{
  border-top:1px solid var(--dim-line);
  padding:7px 0 10px;
}
.notes-title{
  font-family:var(--display);font-size:12px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--ink-3);
}

.drawing-notes{
  list-style:none;margin:0;padding:0;
}
.drawing-notes li{
  display:grid;
  grid-template-columns:28px 1fr;
  gap:12px;
  padding:14px 0;
  border-bottom:1px solid var(--dim-line);
  align-items:start;
}
.drawing-notes li:last-child{border-bottom:0}
/* Triangle callout marker (matches landing page annotation-list style) */
.note-marker{
  width:22px;height:22px;flex:none;
  background:var(--signal);
  clip-path:polygon(50% 0%,100% 100%,0% 100%);
  display:flex;align-items:flex-end;justify-content:center;
  padding-bottom:3px;margin-top:2px;
}
.note-marker span{
  font-family:var(--mono);font-size:9px;font-weight:600;
  color:#fff;line-height:1;
}
.note-content{padding-top:1px}
.note-content strong{
  font-family:var(--display);font-size:13px;font-weight:700;
  text-transform:uppercase;letter-spacing:.06em;
  color:var(--ink);display:block;margin-bottom:3px;
}
.note-content p{
  font-family:var(--body);font-size:13px;
  color:var(--ink-2);line-height:1.6;margin:0;
}
.note-content a{
  color:var(--signal);border-bottom:1px solid rgba(224,92,26,.3);
}
.note-content a:hover{color:var(--ink);border-bottom-color:transparent}
.note-content code{
  font-family:var(--mono);font-size:11px;color:var(--ink-3);
}

/* ── Sheet footer / caption row ── */
.sheet-footer{
  border-top:1px solid var(--dim-line);
  background:var(--bg-2);
  padding:7px 14px;
  display:flex;align-items:center;justify-content:space-between;
  gap:12px;
}
.sf-ref{
  font-family:var(--mono);font-size:9px;color:var(--ink-3);
  letter-spacing:.06em;text-transform:uppercase;
}
.sf-links{
  display:flex;gap:14px;
}
.sf-links a{
  font-family:var(--mono);font-size:9px;
  letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);
}
.sf-links a:hover{color:var(--ink)}

/* ── Responsive ── */
@media(max-width:600px){
  .title-block-inner{grid-template-columns:1fr}
  .tb-right{flex-direction:row;border-top:1px solid var(--dim-line);flex-wrap:wrap}
  .tb-field{border-right:1px solid var(--dim-line);border-bottom:0;flex:1;min-width:100px}
  .sheet-outer-rule{margin:8px}
  .sheet-body{padding:16px 14px 22px}
}
@media(max-width:375px){
  .tb-project-name{font-size:22px}
  .wrap{padding:28px 14px 60px}
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
  <a class="btn btn-ghost" href="/app">Enter the city &rarr;</a>
</div></nav>

<div class="wrap">

  <!-- ── Drawing sheet outer border ── -->
  <div class="sheet">
    <div class="sheet-outer-rule">

      <!-- Formal title block -->
      <div class="title-block">
        <div class="title-block-inner">
          <div class="tb-left">
            <div class="tb-project-label">Advanced Permissions &middot; ERC-7715</div>
            <div class="tb-project-name">Issue a City Permit</div>
            <p class="tb-project-sub">
              The Mayor grants Agent City a capped operating budget from your wallet.
              No keys are shared &mdash; overspend reverts by construction.
              Revoke anytime from <a href="/app" style="color:var(--signal);border-bottom:1px solid rgba(224,92,26,.3)">/app</a>.
            </p>
          </div>
          <div class="tb-right">
            <div class="tb-field">
              <span class="tb-field-label">Project</span>
              <span class="tb-field-value">AGENT CITY</span>
            </div>
            <div class="tb-field">
              <span class="tb-field-label">Form</span>
              <span class="tb-field-value">PERMIT ERC-7715</span>
            </div>
            <div class="tb-field">
              <span class="tb-field-label">Rev.</span>
              <span class="tb-field-value">A / 2026</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sheet body -->
      <div class="sheet-body">

        <!-- Flask prerequisite hard gate -->
        <div class="prereq-box" role="alert" aria-label="MetaMask Flask prerequisite check">
          <div class="prereq-head">Prerequisite Check &mdash; Required Before Proceeding</div>
          <ul class="prereq-items">
            <li>
              <span><a href="https://metamask.io/flask/" target="_blank" rel="noopener">MetaMask Flask</a> installed (developer preview &mdash; <em>not</em> standard MetaMask)</span>
            </li>
            <li>
              <span>Network set to <strong style="color:var(--ink)">Base Sepolia</strong> inside Flask</span>
            </li>
            <li>
              <span>Wallet funded with a small amount of test USDC (faucet at Base Sepolia bridge)</span>
            </li>
          </ul>
          <p class="prereq-note">
            This page calls <code>wallet_requestExecutionPermissions</code> &mdash; a method exclusive to MetaMask Flask.
            Standard MetaMask returns <code>METHOD_NOT_FOUND</code>. Without Flask the Connect step will fail with a clear error below.
          </p>
        </div>

        <!-- Permit specification table -->
        <div class="permit-masthead">
          <div class="permit-masthead-inner">
            <span class="pm-name">Permit Specification &mdash; Permission Detail</span>
            <span class="pm-form">Form PERMIT-001</span>
          </div>
        </div>

        <div class="permit-table">
          <div class="permit-type-row">
            <span class="k">Permission type</span>
            <span class="v">erc20-token-periodic</span>
          </div>
          <div class="brow">
            <span class="k">Budget cap</span>
            <span class="v" id="g-budget">&le;&thinsp;5 USDC / day</span>
          </div>
          <div class="brow">
            <span class="k">Granted to (City Treasury)</span>
            <span class="v" id="g-agent">&hellip;</span>
          </div>
          <div class="brow">
            <span class="k">Token contract</span>
            <span class="v" id="g-usdc">&hellip;</span>
          </div>
          <div class="brow">
            <span class="k">Network</span>
            <span class="v" id="g-net">&hellip;</span>
          </div>
          <div class="permit-actions">
            <button class="btn" id="connect">Connect MetaMask</button>
            <button class="btn btn-primary" id="grant" disabled>Issue Permit &rarr;</button>
          </div>
          <div id="out">
            <div class="result-stamp-wrap" id="result-stamp" aria-hidden="true"></div>
          </div>
        </div>

        <!-- Drawing notes — numbered steps -->
        <div class="notes-masthead">
          <div class="notes-masthead-inner">
            <span class="notes-title">Drawing Notes &mdash; Grant Flow Procedure</span>
          </div>
        </div>

        <ol class="drawing-notes" aria-label="Grant flow steps">
          <li>
            <div class="note-marker" aria-hidden="true"><span>1</span></div>
            <div class="note-content">
              <strong>Connect your wallet</strong>
              <p>Click <em>Connect MetaMask</em> and approve the account request in the <strong>MetaMask Flask</strong> popup. Verify the active network shows <strong>Base Sepolia</strong> &mdash; the permit targets chain 84532.</p>
            </div>
          </li>
          <li>
            <div class="note-marker" aria-hidden="true"><span>2</span></div>
            <div class="note-content">
              <strong>Issue the permit</strong>
              <p>Click <em>Issue Permit</em> and approve the <code>erc20-token-periodic</code> permission in the MetaMask popup. The City Treasury receives a scoped delegation: &le;&thinsp;5 USDC per day, expiring in 7 days. Your private key never leaves your device.</p>
            </div>
          </li>
          <li>
            <div class="note-marker" aria-hidden="true"><span>3</span></div>
            <div class="note-content">
              <strong>Server validates the permit</strong>
              <p>The City Treasury decodes the granted context on-chain and confirms the delegation chain is intact. A valid permit shows the <strong>APPROVED</strong> stamp below. Then <a href="/app">open /app</a> and dispatch the city &mdash; every payment chains under your authorization.</p>
            </div>
          </li>
        </ol>

      </div><!-- .sheet-body -->

      <!-- Sheet footer / title block bottom bar -->
      <div class="sheet-footer">
        <span class="sf-ref">DWG: PERMIT-ERC-7715-01 &middot; Agent City &middot; Base Sepolia</span>
        <div class="sf-links">
          <a href="/">Landing</a>
          <a href="/app">Enter city</a>
        </div>
      </div>

    </div><!-- .sheet-outer-rule -->
  </div><!-- .sheet -->

</div><!-- .wrap -->

<script>
var $=function(s){return document.querySelector(s);};
var cfg=null,account=null;
function show(html,cls){
  var o=$('#out');o.className=cls||'';o.innerHTML=html;o.style.display=html?'block':'none';
  var sw=$('#result-stamp');
  if(sw){
    if(cls==='ok'){
      sw.innerHTML='<span class="stamp-approved">Approved</span>';
    }else if(cls==='bad'){
      sw.innerHTML='<span class="stamp-rejected">Rejected</span>';
    }else{
      sw.innerHTML='';
    }
  }
}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
});}
function shrink(a){return a?String(a).slice(0,8)+'…'+String(a).slice(-6):'—';}

async function loadConfig(){
  try{cfg=await (await fetch('/city/config')).json();}catch(e){cfg=null;}
  if(!cfg||cfg.error){show('City config unavailable (live mode required): '+esc(cfg&&cfg.error),'bad');return;}
  $('#g-agent').textContent=shrink(cfg.agent);
  $('#g-usdc').textContent=shrink(cfg.usdc);
  $('#g-net').textContent=cfg.network+' (chain '+cfg.chainId+')';
}

async function connect(){
  if(!window.ethereum){
    show('MetaMask Flask not detected. Install Flask from metamask.io/flask/ and switch to Base Sepolia.','bad');
    return;
  }
  try{
    var accts=await window.ethereum.request({method:'eth_requestAccounts'});
    account=accts[0];
    var cid=parseInt(await window.ethereum.request({method:'eth_chainId'}),16);
    var chainOk=cfg&&cid===Number(cfg.chainId);
    show('Connected '+esc(shrink(account))+' · chain '+cid+(chainOk?'' :' — switch to Base Sepolia (chain '+esc(cfg&&cfg.chainId)+')'));
    if(chainOk||!cfg)$('#grant').disabled=false;
  }catch(e){show('Connect failed: '+esc(e.message),'bad');}
}

async function grant(){
  if(!cfg){show('No config.','bad');return;}
  $('#grant').disabled=true;
  show('Requesting permission… approve in MetaMask.');
  var periodAmount='0x'+(5n*(10n**6n)).toString(16);
  var req={
    chainId:'0x'+Number(cfg.chainId).toString(16),
    to:cfg.agent,
    permission:{
      type:'erc20-token-periodic',
      isAdjustmentAllowed:false,
      data:{
        tokenAddress:cfg.usdc,
        periodAmount:periodAmount,
        periodDuration:86400,
        justification:'Agent City may spend ≤5 USDC/day on your behalf (revocable).'
      }
    }
  };
  try{
    var granted=await window.ethereum.request({method:'wallet_requestExecutionPermissions',params:[req]});
    var r=await fetch('/city/grant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({granted:granted,account:account})});
    var v=await r.json();
    if(!r.ok||!v.ok){
      show('Granted in MetaMask, but the City Treasury rejected it:\n'+esc(v.error||('HTTP '+r.status)),'bad');
      $('#grant').disabled=false;
      return;
    }
    show('AUTHORIZED — validated & decoded by the City Treasury ('+esc(v.links)+'-link chain, delegator '+esc(shrink(v.delegator))+').\n\nEvery city payment now chains under YOUR grant. Open /app and dispatch.\n\n'+esc(JSON.stringify(granted,null,2)),'ok');
  }catch(e){
    show('Authorization failed: '+esc(e.message||e)+'\n\nIf this is a param/encoding error, copy it here — the request shape may need a tweak for your Flask version.','bad');
    $('#grant').disabled=false;
  }
}

$('#connect').onclick=connect;
$('#grant').onclick=grant;
loadConfig();
</script>
</body></html>`;
