/** Agent City app (GET /app). Onyx theme. Drives /city/run + /city/run/:id and the live City Ledger. */
import { FONTS, THEME_CSS } from "./theme.js";

const LOGO = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="5" r="2.3" stroke="url(#ag)" stroke-width="1.6"/><circle cx="5" cy="18" r="2.3" stroke="url(#ag)" stroke-width="1.6"/><circle cx="19" cy="18" r="2.3" stroke="url(#ag)" stroke-width="1.6"/><path d="M11 6.7 6.2 15.6M13 6.7l4.8 8.9" stroke="url(#ag)" stroke-width="1.5"/><defs><linearGradient id="ag" x1="0" y1="0" x2="24" y2="24"><stop stop-color="#a99bff"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs></svg>`;

export const APP_HTML = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Agent City — live demo</title>
${FONTS}
<style>${THEME_CSS}
nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);background:rgba(10,11,15,.72);border-bottom:1px solid var(--line)}
nav .container{display:flex;align-items:center;justify-content:space-between;height:64px;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px}
.banner{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.app-grid{display:grid;grid-template-columns:360px 1fr;gap:22px;padding:28px 24px 64px;align-items:start}
.panel{position:sticky;top:88px;display:flex;flex-direction:column;gap:18px}
.ptitle{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fg-3);margin-bottom:4px}
.brow{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}
.brow:last-child{border-bottom:0}.brow .k{color:var(--fg-3);font-size:14px}.brow .v{font-family:var(--mono);font-size:13px}
textarea#goal{width:100%;min-height:74px;resize:vertical;padding:13px 14px;background:var(--bg-2);border:1px solid var(--line-2);border-radius:12px;color:var(--fg);font:inherit;font-size:14.5px;line-height:1.5}
textarea#goal:focus{border-color:var(--accent);outline:none}
textarea#goal:disabled{opacity:.5}
.runrow{display:flex;gap:10px;margin-top:12px}.runrow .btn{flex:1}
.approve{border:1px solid var(--accent);background:rgba(139,124,255,.07);border-radius:12px;padding:15px;margin-top:12px;animation:fadeUp .25s ease both}
.approve .ah{font-weight:700;color:var(--accent-2);font-size:13px;letter-spacing:.02em;margin-bottom:8px}
.approve p{font-size:13px;color:var(--fg-2)}.approve .acts{display:flex;gap:10px;margin-top:12px}

.activity{min-height:62vh}
.ahead{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px}
.ahead h2{font-size:20px}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px dashed var(--line-2);border-radius:var(--r);padding:60px 24px;color:var(--fg-3);gap:8px}
.empty .big{font-size:30px;opacity:.5}

.agents{display:grid;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));gap:14px;margin-bottom:22px}
.acard{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:8px;animation:fadeUp .3s ease both}
.acard.mayor{border-color:rgba(139,124,255,.45);box-shadow:0 0 0 3px rgba(139,124,255,.06)}
.acard .ar{display:flex;align-items:center;justify-content:space-between;gap:8px}
.acard .role{font-weight:600;font-size:15px}
.acard .svc{font-size:12.5px;color:var(--fg-3)}
.acard .meta{font-family:var(--mono);font-size:12px;color:var(--fg-2);display:flex;flex-direction:column;gap:3px}
.acard .cap{color:var(--accent-2)}
.acard .rcpt{font-size:12.5px;font-weight:600;color:var(--accent-2)}
.acard .rcpt:hover{color:#fff}

.ledger{width:100%;border-collapse:collapse;font-size:13.5px}
.ledger th{text-align:left;color:var(--fg-3);font-weight:600;font-size:12px;letter-spacing:.04em;text-transform:uppercase;padding:0 10px 10px;border-bottom:1px solid var(--line)}
.ledger td{padding:11px 10px;border-bottom:1px solid var(--line);vertical-align:middle}
.ledger tr:last-child td{border-bottom:0}
.ledger .mono{font-family:var(--mono);font-size:12.5px}
.ledger a{color:var(--accent-2);font-weight:600}.ledger a:hover{color:#fff}
.summary{margin-top:18px;border:1px solid var(--line-2);border-radius:12px;padding:14px 16px;font-size:14px;display:flex;align-items:center;gap:10px}
.summary.ok{border-color:rgba(70,208,127,.4);background:var(--ok-bg)}
.summary.bad{border-color:rgba(255,107,107,.4);background:var(--bad-bg);color:#ffb3b3}

@media(max-width:860px){.app-grid{grid-template-columns:1fr}.panel{position:static}}
</style></head>
<body>

<nav><div class="container">
  <a class="brand" href="/">${LOGO} Agent City</a>
  <div class="banner" id="banner"></div>
  <button class="btn btn-danger" id="revoke">Revoke the city</button>
</div></nav>

<main class="container app-grid">
  <aside class="panel">
    <div class="card">
      <div class="ptitle">The Mayor (you)</div>
      <div class="brow"><span class="k">Treasury</span><span class="v" id="m-treasury">…</span></div>
      <div class="brow"><span class="k">Master budget</span><span class="v cap" id="m-budget" style="color:var(--accent-2)">…</span></div>
      <div class="brow"><span class="k">Per-agent cap</span><span class="v" id="m-percap">…</span></div>
      <div class="brow"><span class="k">Authority</span><span id="m-status">…</span></div>
    </div>
    <div class="card">
      <div class="ptitle">Commission the city</div>
      <textarea id="goal" placeholder="e.g. Produce a market brief on ETH"></textarea>
      <div class="runrow"><button class="btn btn-primary" id="dispatch">Dispatch the city →</button></div>
      <div id="approveWrap"></div>
    </div>
  </aside>

  <section class="activity">
    <div class="ahead"><h2>The City</h2><span id="runbadge"></span></div>
    <div id="out">
      <div class="empty"><div class="big">◈</div><div>The city is idle.</div>
        <div class="muted">Give it a goal and dispatch — the Manager hires workers under capped sub-budgets, and each payment settles on-chain.</div></div>
    </div>
  </section>
</main>

<script>
var $=function(s){return document.querySelector(s);};
var info=null, polling=false, revoked=false;
function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
function shrink(a){return a&&a!=='0x'?String(a).slice(0,6)+'…'+String(a).slice(-4):'—';}
function fmtUSDC(base){if(base==null||base==='')return '—';var n=Number(base)/1e6;if(isNaN(n))return String(base);
  var s=n.toFixed(4).replace(/0+$/,'').replace(/\\.$/,'');return s+' USDC';}

async function loadInfo(){
  try{info=await (await fetch('/info')).json();}catch(e){info={mode:'dry-run',network:'?'};}
  var live=info.mode==='live';
  var h='<span class="badge '+(live?'ok':'warn')+'"><span class="dot '+(live?'live':'run')+'"></span>'+(live?'LIVE':'DRY-RUN')+'</span>';
  h+='<span class="pill">network <b>'+esc(info.network||'?')+'</b></span>';
  $('#banner').innerHTML=h;
  if(info.treasury)$('#m-treasury').textContent=shrink(info.treasury);
  if(!live){$('#dispatch').disabled=true;$('#goal').disabled=true;
    $('#out').innerHTML='<div class="summary bad"><span class="dot bad"></span>Live mode required for the city demo. Start the server with .env creds.</div>';}
}
async function loadPolicy(){
  var p=await (await fetch('/policy')).json();
  $('#m-budget').textContent=fmtUSDC(p.maxPerDay);
  $('#m-percap').textContent='≤ '+fmtUSDC(p.maxPerTx);
  revoked=!!p.revoked;
  $('#m-status').innerHTML=revoked?'<span class="badge bad">REVOKED</span>':'<span class="badge ok"><span class="dot ok"></span>active</span>';
  if(revoked){$('#dispatch').disabled=true;$('#goal').disabled=true;}
}
var ST={queued:['queued','warn'],hiring:['hiring…','run'],paying:['paying on-chain…','run'],settled:['settled','ok'],failed:['failed','bad']};
function badge(s){var m=ST[s]||['…','run'];return '<span class="badge '+m[1]+'"><span class="dot '+m[1]+'"></span>'+esc(m[0])+'</span>';}
function rcpt(run,e){if(!e.txHash)return '';var base=run.explorerTxBase||'';return base?'<a href="'+base+e.txHash+'" target="_blank" rel="noopener">receipt ↗</a>':'<span class="mono">'+esc(shrink(e.txHash))+'</span>';}

function render(run){
  $('#runbadge').innerHTML='<span class="badge '+(run.status==='done'?'ok':run.status==='failed'?'bad':'run')+'">'+esc(run.status)+'</span>';
  var h='<div class="agents">';
  h+='<div class="acard mayor"><div class="ar"><span class="role">Mayor</span><span class="badge run">root</span></div>'+
     '<div class="svc">grants capped budgets</div><div class="meta"><span>'+esc(shrink(info&&info.treasury))+'</span><span class="cap">master ≤ '+esc($('#m-budget').textContent||'')+'</span></div></div>';
  for(var i=0;i<run.ledger.length;i++){var e=run.ledger[i];
    h+='<div class="acard"><div class="ar"><span class="role">'+esc(e.role)+'</span>'+badge(e.status)+'</div>'+
       '<div class="svc">pays '+esc(e.service||'a service')+'</div>'+
       '<div class="meta"><span>'+esc(shrink(e.agent))+'</span>'+
       '<span class="cap">budget '+esc(fmtUSDC(e.masterCap))+' → '+esc(fmtUSDC(e.subCap))+'</span>'+
       '<span>pays '+esc(fmtUSDC(e.amount))+'</span></div>'+
       (e.credit!=null?'<div class="meta" style="margin-top:4px"><span class="cap">credit '+esc(e.credit)+' · '+esc(e.tier||'')+'</span></div>':'')+
       (e.txHash?'<div>'+rcpt(run,e)+'</div>':'')+'</div>';}
  h+='</div>';

  h+='<table class="ledger"><thead><tr><th>Agent</th><th>Service</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead><tbody>';
  if(!run.ledger.length){h+='<tr><td colspan="5" class="muted">No payments yet…</td></tr>';}
  for(var j=0;j<run.ledger.length;j++){var x=run.ledger[j];
    h+='<tr><td>'+esc(x.role)+' <span class="mono">'+esc(shrink(x.agent))+'</span></td>'+
       '<td>'+esc(x.service||'—')+'</td><td class="mono">'+esc(fmtUSDC(x.amount))+'</td>'+
       '<td>'+badge(x.status)+'</td><td>'+(rcpt(run,x)||'<span class="muted">—</span>')+'</td></tr>';}
  h+='</tbody></table>';

  if(run.status==='done'||run.status==='failed'){
    h+='<div class="summary '+(run.status==='done'?'ok':'bad')+'"><span class="dot '+(run.status==='done'?'ok':'bad')+'"></span>'+esc(run.result||run.status)+'</div>';}
  $('#out').innerHTML=h;
}

async function poll(id){
  polling=true;var deadline=Date.now()+8*60000;
  while(Date.now()<deadline){
    var run;try{run=await (await fetch('/city/run/'+id)).json();}catch(e){break;}
    if(run.error){$('#out').innerHTML='<div class="summary bad"><span class="dot bad"></span>'+esc(run.error)+'</div>';break;}
    render(run);
    if(run.status==='done'||run.status==='failed')break;
    await new Promise(function(r){setTimeout(r,2000);});
  }
  polling=false;$('#dispatch').disabled=revoked;
}
function showApprove(){
  if(revoked)return;
  $('#dispatch').style.display='none';
  $('#approveWrap').innerHTML='<div class="approve"><div class="ah">⏸ Authorize the city</div>'+
    '<p>Grant the city a master budget. The Manager re-delegates <b>narrower</b> capped sub-budgets to each worker — none can exceed its cap, and you can revoke anytime.</p>'+
    '<div class="acts"><button class="btn btn-primary" id="go">Approve &amp; dispatch</button><button class="btn" id="cancel">Cancel</button></div></div>';
  $('#go').onclick=dispatch;
  $('#cancel').onclick=function(){$('#approveWrap').innerHTML='';$('#dispatch').style.display='';};
}
async function dispatch(){
  $('#approveWrap').innerHTML='';$('#dispatch').style.display='';$('#dispatch').disabled=true;
  var goal=$('#goal').value.trim()||'Produce a market brief on ETH';
  $('#out').innerHTML='<div class="empty"><div class="big">◈</div><div>Commissioning the city…</div><div class="muted">Hiring workers and granting capped sub-budgets.</div></div>';
  try{
    var r=await fetch('/city/run',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({goal:goal})});
    var j=await r.json();
    if(!r.ok||!j.id){$('#out').innerHTML='<div class="summary bad"><span class="dot bad"></span>'+esc(j.error||('HTTP '+r.status))+'</div>';$('#dispatch').disabled=revoked;return;}
    poll(j.id);
  }catch(e){$('#out').innerHTML='<div class="summary bad"><span class="dot bad"></span>'+esc(e.message)+'</div>';$('#dispatch').disabled=revoked;}
}
$('#dispatch').onclick=showApprove;
$('#revoke').onclick=async function(){if(!confirm('Revoke the whole city\\'s authority?'))return;await fetch('/revoke',{method:'POST'});loadPolicy();};
loadInfo();loadPolicy();
</script>
</body></html>`;
