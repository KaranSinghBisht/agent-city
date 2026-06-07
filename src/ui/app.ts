/** App dashboard (GET /app). Onyx theme. Drives the live API: /info /policy /runs /approve /revoke. */
import { FONTS, THEME_CSS } from "./theme.js";

const LOGO = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.5 8.6-8 11-4.5-2.4-8-6-8-11V5l8-3z" stroke="url(#ag)" stroke-width="1.6" fill="rgba(139,124,255,.08)"/><path d="M8.4 12.2l2.4 2.3 4.6-4.9" stroke="url(#ag)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="ag" x1="0" y1="0" x2="24" y2="24"><stop stop-color="#a99bff"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs></svg>`;

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
.app-grid{display:grid;grid-template-columns:370px 1fr;gap:22px;padding:28px 24px 64px;align-items:start}
.panel{position:sticky;top:88px;display:flex;flex-direction:column;gap:18px}
.ptitle{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fg-3);margin-bottom:4px}
.brow{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--line)}
.brow:last-child{border-bottom:0}.brow .k{color:var(--fg-3);font-size:14px}.brow .v{font-family:var(--mono);font-size:13.5px}
.meter{height:6px;border-radius:99px;background:var(--bg-2);overflow:hidden;margin-top:12px}
.meter>i{display:block;height:100%;background:linear-gradient(90deg,var(--accent-2),var(--accent));width:0}
textarea#goal{width:100%;min-height:78px;resize:vertical;padding:13px 14px;background:var(--bg-2);border:1px solid var(--line-2);
  border-radius:12px;color:var(--fg);font:inherit;font-size:14.5px;line-height:1.5}
textarea#goal:focus{border-color:var(--accent);outline:none}
textarea#goal:disabled{opacity:.5}
.runrow{display:flex;gap:10px;margin-top:12px}.runrow .btn{flex:1}

.activity{min-height:60vh}
.ahead{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.ahead h2{font-size:20px}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
  border:1px dashed var(--line-2);border-radius:var(--r);padding:64px 24px;color:var(--fg-3);gap:8px}
.empty .big{font-size:30px;opacity:.5}

/* timeline */
.tl{position:relative;margin:0;padding:0;list-style:none}
.tl-item{position:relative;display:flex;gap:14px;padding:0 0 18px 0}
.tl-item:not(:last-child)::before{content:"";position:absolute;left:15px;top:32px;bottom:0;width:2px;background:var(--line)}
.ic{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;flex:none;font-size:14px;
  background:var(--surface-2);border:1px solid var(--line-2);color:var(--fg-2)}
.ic.ok{color:var(--ok);border-color:rgba(70,208,127,.4);background:var(--ok-bg)}
.ic.run{color:var(--accent-2);border-color:rgba(139,124,255,.4);background:rgba(139,124,255,.1)}
.ic.bad{color:var(--bad);border-color:rgba(255,107,107,.4);background:var(--bad-bg)}
.tl-body{flex:1;padding-top:5px}
.tl-body .ti{font-weight:600;font-size:14.5px}
.tl-body .td{color:var(--fg-2);font-size:13.5px;margin-top:3px}
.tl-body .amt{font-family:var(--mono);color:var(--fg);font-size:14px}

.gate{border:1px solid var(--warn);background:linear-gradient(180deg,rgba(227,179,65,.08),transparent);border-radius:var(--r);
  padding:20px;margin-top:8px;animation:fadeUp .3s ease both}
.gate .gh{display:flex;align-items:center;gap:9px;font-weight:700;color:var(--warn);font-size:14px;letter-spacing:.02em}
.gate .deal{font-family:var(--mono);font-size:16px;margin:14px 0 6px}
.gate .why{color:var(--fg-2);font-size:13.5px}
.gate .acts{display:flex;gap:10px;margin-top:16px}

.result{border:1px solid rgba(70,208,127,.4);background:var(--ok-bg);border-radius:var(--r);padding:18px;margin-top:14px}
.result .rh{font-weight:700;color:var(--ok);font-size:13px;letter-spacing:.04em;text-transform:uppercase;margin-bottom:6px}
.failbox{border:1px solid rgba(255,107,107,.4);background:var(--bad-bg);border-radius:var(--r);padding:16px;margin-top:14px;color:#ffb3b3;font-size:14px}

.relayer{display:flex;align-items:center;gap:10px;border:1px solid var(--line-2);border-radius:12px;padding:13px 15px;margin-top:14px;font-size:14px}
.relayer a{color:var(--accent-2);font-weight:600}.relayer a:hover{color:#fff}

@media(max-width:860px){.app-grid{grid-template-columns:1fr}.panel{position:static}}
</style></head>
<body>

<nav><div class="container">
  <a class="brand" href="/">${LOGO} Agent City</a>
  <div class="banner" id="banner"></div>
  <button class="btn btn-danger" id="revoke">Revoke authority</button>
</div></nav>

<main class="container app-grid">
  <aside class="panel">
    <div class="card">
      <div class="ptitle">The mandate</div>
      <div class="brow"><span class="k">Budget token</span><span class="v" id="p-token">…</span></div>
      <div class="brow"><span class="k">Per-transaction cap</span><span class="v" id="p-tx">…</span></div>
      <div class="brow"><span class="k">Daily cap</span><span class="v" id="p-day">…</span></div>
      <div class="brow"><span class="k">Spent today</span><span class="v" id="p-spent">—</span></div>
      <div class="brow"><span class="k">Delegation</span><span id="p-status">…</span></div>
      <div class="meter"><i id="p-meter"></i></div>
    </div>
    <div class="card">
      <div class="ptitle">Give Agent City a goal</div>
      <textarea id="goal" placeholder="e.g. Pay 0.05 USDC to 0x… to settle invoice #42, then finalize."></textarea>
      <div class="runrow"><button class="btn btn-primary" id="run">Run agent →</button></div>
    </div>
  </aside>

  <section class="activity">
    <div class="ahead"><h2>Activity</h2><span id="runbadge"></span></div>
    <div id="out">
      <div class="empty"><div class="big">◈</div><div>Give Agent City a goal and press <b>Run</b>.</div>
        <div class="muted">It reads the chain via Venice, proposes a spend, and waits for your approval.</div></div>
    </div>
  </section>
</main>

<script>
var $=function(s){return document.querySelector(s);};
var current=null, info=null, polling=false;
function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
function shrink(a){return a?String(a).slice(0,6)+'…'+String(a).slice(-4):'';}
function fmtUSDC(base){if(base==null||base==='')return '—';var n=Number(base)/1e6;if(isNaN(n))return String(base);
  var s=n.toFixed(4).replace(/0+$/,'').replace(/\\.$/,'');return s+' USDC';}

async function loadInfo(){
  try{info=await (await fetch('/info')).json();}catch(e){info={mode:'dry-run',network:'?'};}
  var live=info.mode==='live';
  var h='<span class="badge '+(live?'ok':'warn')+'"><span class="dot '+(live?'live':'run')+'"></span>'+(live?'LIVE':'DRY-RUN')+'</span>';
  h+='<span class="pill">network <b>'+esc(info.network||'?')+'</b></span>';
  if(info.treasury)h+='<span class="pill">treasury <b>'+esc(shrink(info.treasury))+'</b></span>';
  if(info.payee){h+='<span class="pill">payee <b>'+esc(shrink(info.payee))+'</b></span>';
    $('#goal').value='Pay 0.05 USDC to '+info.payee+' to settle invoice #42, then finalize.';}
  $('#banner').innerHTML=h;
}
async function loadPolicy(){
  var p=await (await fetch('/policy')).json();
  $('#p-token').textContent='USDC';
  $('#p-tx').textContent=fmtUSDC(p.maxPerTx);
  $('#p-day').textContent=fmtUSDC(p.maxPerDay);
  $('#p-status').innerHTML=p.revoked?'<span class="badge bad">REVOKED</span>':'<span class="badge ok"><span class="dot ok"></span>active</span>';
  $('#run').disabled=p.revoked;$('#goal').disabled=p.revoked;
  window._maxDay=Number(p.maxPerDay);
}
var STEP={
  start:['◆','Goal received','run'],
  approval_requested:['◈','Venice proposed a spend','run'],
  approval_granted:['✓','You approved','ok'],
  approval_rejected:['✗','You rejected','bad'],
  policy_block:['⛔','Policy blocked the action','bad'],
  executed:['⚡','Redeemed via 1Shot relayer','run'],
  final:['✓','Run complete','ok'],
  reasoner_error:['⚠','Reasoner error','bad'],
  parse_error:['⚠','Could not parse the reply','bad']
};
function detail(e){
  var d=e.data||{};
  if(e.kind==='start')return 'On-chain balance read live through Venice Crypto-RPC.';
  if(e.kind==='approval_requested'){var a=d.action||{};
    return '<span class="amt">'+esc(fmtUSDC(a.amount))+'</span> → <span class="amt">'+esc(shrink(a.to))+'</span><div style="margin-top:5px">'+esc(a.reason||'')+'</div>';}
  if(e.kind==='policy_block')return esc(d.reason||'');
  if(e.kind==='approval_granted')return d.note?esc(d.note):'Approved on-chain spend.';
  if(e.kind==='approval_rejected')return d.note?esc(d.note):'Action declined.';
  if(e.kind==='executed')return 'task <span class="mono">'+esc(shrink(d.taskId))+'</span> · '+esc(d.txStatus||'submitted');
  if(e.kind==='final')return esc(d.output||'');
  if(e.kind==='reasoner_error'||e.kind==='parse_error')return esc(d.error||'');
  return '';
}
function statusBadge(s){var m={running:'run',awaiting_approval:'warn',done:'ok',failed:'bad'};
  return '<span class="badge '+(m[s]||'run')+'">'+esc(String(s).replace('_',' '))+'</span>';}
function taskIdOf(st){for(var i=st.audit.length-1;i>=0;i--){var e=st.audit[i];
  if(e.kind==='executed'&&e.data&&typeof e.data.taskId==='string')return e.data.taskId;}return null;}
function isReal(t){return t&&t!=='dry-run'&&t!=='simulated';}
var RST={100:['Pending','run'],110:['Submitted on-chain','run'],200:['Confirmed on-chain','ok'],400:['Rejected','bad'],500:['Reverted','bad']};

function render(st){
  current=st;
  $('#runbadge').innerHTML=statusBadge(st.status);
  if(st.spentToday!=null){$('#p-spent').textContent=fmtUSDC(st.spentToday);
    if(window._maxDay){$('#p-meter').style.width=Math.min(100,Number(st.spentToday)/window._maxDay*100)+'%';}}
  var h='<ul class="tl">';
  for(var i=0;i<st.audit.length;i++){var e=st.audit[i];var m=STEP[e.kind]||['•',e.kind,''];
    if(e.kind==='final')continue;
    h+='<li class="tl-item"><div class="ic '+m[2]+'">'+m[0]+'</div><div class="tl-body"><div class="ti">'+esc(m[1])+'</div><div class="td">'+detail(e)+'</div></div></li>';}
  h+='</ul>';

  if(st.status==='awaiting_approval'&&st.pending){var a=st.pending.action;
    h+='<div class="gate"><div class="gh">⏸ Approval required</div>'+
       '<div class="deal">'+esc(fmtUSDC(a.amount))+' → '+esc(shrink(a.to))+'</div>'+
       '<div class="why">'+esc(a.reason||'')+'</div>'+
       (st.pending.policyReason?'<div class="why" style="margin-top:6px;color:var(--fg-3)">policy: '+esc(st.pending.policyReason)+'</div>':'')+
       '<div class="acts"><button class="btn btn-primary" id="approve">Approve &amp; settle</button><button class="btn btn-danger" id="reject">Reject</button></div></div>';}

  var tid=taskIdOf(st);
  if(isReal(tid)){h+='<div class="relayer" id="relayer"><span class="dot run"></span><span id="rtext">relayer task '+esc(shrink(tid))+' — checking status…</span></div>';}

  if(st.result){h+='<div class="result"><div class="rh">✓ Outcome</div>'+esc(st.result)+'</div>';}
  if(st.error){h+='<div class="failbox">'+esc(st.error)+'</div>';}

  $('#out').innerHTML=h;
  if($('#approve'))$('#approve').onclick=function(){decide(true);};
  if($('#reject'))$('#reject').onclick=function(){decide(false);};
  if(isReal(tid)&&!polling)pollStatus(st.id);
}
async function pollStatus(runId){
  polling=true;var deadline=Date.now()+5*60000;
  while(Date.now()<deadline){
    var r;try{r=await (await fetch('/runs/'+runId+'/status')).json();}catch(e){break;}
    var el=$('#rtext');if(!el)break;
    var meta=RST[r.status]||['awaiting status','run'];
    var line=esc(meta[0]);
    if(r.taskId)line+=' · task '+esc(shrink(r.taskId));
    if(r.hash&&info&&info.explorerTxBase)line+=' · <a href="'+info.explorerTxBase+r.hash+'" target="_blank" rel="noopener">view tx ↗</a>';
    el.innerHTML=line;
    var dot=$('#relayer')?$('#relayer').querySelector('.dot'):null;
    if(dot)dot.className='dot '+meta[1];
    if(r.status===200||r.status===400||r.status===500)break;
    await new Promise(function(x){setTimeout(x,3000);});
  }
  polling=false;
}
async function startRun(){
  var goal=$('#goal').value.trim();if(!goal)return;
  $('#run').disabled=true;$('#runbadge').innerHTML=statusBadge('running');
  $('#out').innerHTML='<ul class="tl"><li class="tl-item"><div class="ic run">◈</div><div class="tl-body"><div class="ti">Venice is thinking…</div><div class="td">Reading the chain and reasoning over your goal.</div></div></li></ul>';
  try{var r=await fetch('/runs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({goal:goal})});
    if(!r.ok){var er=await r.json();$('#out').innerHTML='<div class="failbox">'+esc(er.error||r.status)+'</div>';}
    else{render(await r.json());}}
  catch(e){$('#out').innerHTML='<div class="failbox">'+esc(e.message)+'</div>';}
  finally{$('#run').disabled=false;}
}
async function decide(ok){if(!current)return;
  var r=await fetch('/runs/'+current.id+'/approve',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({approved:ok})});
  render(await r.json());}
$('#run').onclick=startRun;
$('#revoke').onclick=async function(){if(!confirm('Revoke all of Agent City\\'s authority?'))return;await fetch('/revoke',{method:'POST'});loadPolicy();};
loadInfo();loadPolicy();
</script>
</body></html>`;
