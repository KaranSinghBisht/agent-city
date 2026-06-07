/** Self-contained demo UI (no build step). Served at GET / by the Hono API. */
export const INDEX_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Steward</title>
<style>
:root{--bg:#0b0d12;--card:#151821;--line:#262b38;--fg:#e6e9ef;--mut:#8a92a6;--acc:#6ea8fe;--ok:#3fb950;--warn:#d29922;--bad:#f85149}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif}
.wrap{max-width:760px;margin:0 auto;padding:36px 20px}
h1{font-size:22px;margin:0 0 4px}.sub{color:var(--mut);margin:0 0 14px}
.banner{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px;font-size:12px}
.pill{padding:3px 10px;border-radius:999px;border:1px solid var(--line);background:#10141c;color:var(--mut)}
.pill b{color:var(--fg);font-weight:600}
.pill.live{border-color:var(--ok);color:var(--ok)}.pill.dry{border-color:var(--warn);color:var(--warn)}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px;margin-bottom:16px}
.row{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid var(--line)}
.row:last-child{border-bottom:0}.k{color:var(--mut)}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;word-break:break-all}
input,button{font:inherit}
input[type=text]{flex:1;padding:11px 12px;background:#0f1218;border:1px solid var(--line);border-radius:8px;color:var(--fg)}
button{padding:10px 14px;border:1px solid var(--line);border-radius:8px;background:#1c2230;color:var(--fg);cursor:pointer}
button.primary{background:var(--acc);color:#06101f;border-color:var(--acc);font-weight:600}
button.ok{background:var(--ok);color:#04130a;border-color:var(--ok)}
button.bad{background:transparent;color:var(--bad);border-color:var(--bad)}
button:disabled{opacity:.5;cursor:not-allowed}
.badge{display:inline-block;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:600}
.b-run{background:#15324d;color:var(--acc)}.b-wait{background:#3a2e10;color:var(--warn)}.b-done{background:#0f2e1a;color:var(--ok)}.b-fail{background:#3a1413;color:var(--bad)}
.ev{padding:7px 0;border-bottom:1px dashed var(--line);font-size:13px}.ev:last-child{border:0}.ev .t{color:var(--acc)}
.gate{border:1px solid var(--warn);background:#241c0833;border-radius:10px;padding:14px;margin-top:12px}
.actions{display:flex;gap:10px;margin-top:12px}.flex{display:flex;gap:10px}
.chain{margin-top:12px;border:1px solid var(--line);border-radius:10px;padding:12px;font-size:13px}
.chain a{color:var(--acc)}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:var(--mut)}
.dot.ok{background:var(--ok)}.dot.run{background:var(--warn)}.dot.bad{background:var(--bad)}
</style>
</head>
<body>
<div class="wrap">
  <h1>Steward</h1>
  <p class="sub">An AI workforce that can only ever spend inside cryptographic limits.</p>
  <div class="banner" id="banner"></div>

  <div class="card">
    <div class="row"><span class="k">Budget token</span><span class="mono" id="p-token">…</span></div>
    <div class="row"><span class="k">Per-transaction cap</span><span class="mono" id="p-tx">…</span></div>
    <div class="row"><span class="k">Daily cap</span><span class="mono" id="p-day">…</span></div>
    <div class="row"><span class="k">Delegation</span><span id="p-status">…</span></div>
    <div class="actions"><button class="bad" id="revoke">Revoke all authority</button></div>
  </div>

  <div class="card">
    <div class="flex">
      <input type="text" id="goal" placeholder="e.g. Pay 0.05 USDC to 0x… for invoice #42"/>
      <button class="primary" id="run">Run</button>
    </div>
    <div id="out"></div>
  </div>
</div>
<script>
const $=s=>document.querySelector(s); let current=null; let info=null; let polling=false;
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const shrink=a=>a?a.slice(0,6)+'…'+a.slice(-4):'';
async function loadInfo(){
  try{info=await (await fetch('/info')).json();}catch(e){info={mode:'dry-run',network:'?'};}
  const live=info.mode==='live';
  let h='<span class="pill '+(live?'live':'dry')+'"><b>'+(live?'LIVE':'DRY-RUN')+'</b></span>';
  h+='<span class="pill">network <b>'+esc(info.network||'?')+'</b></span>';
  if(info.treasury)h+='<span class="pill">treasury <b>'+esc(shrink(info.treasury))+'</b></span>';
  if(info.payee){h+='<span class="pill">payee <b>'+esc(shrink(info.payee))+'</b></span>';
    $('#goal').value='Pay 0.05 USDC to '+info.payee+' to settle invoice #42, then finalize.';}
  $('#banner').innerHTML=h;
}
async function loadPolicy(){
  const p=await (await fetch('/policy')).json();
  $('#p-token').textContent=p.token;
  $('#p-tx').textContent=p.maxPerTx+' base units';
  $('#p-day').textContent=p.maxPerDay+' base units';
  $('#p-status').innerHTML=p.revoked?'<span class="badge b-fail">REVOKED</span>':'<span class="badge b-done">active</span>';
  $('#run').disabled=p.revoked;$('#goal').disabled=p.revoked;
}
function badge(s){const m={running:'b-run',awaiting_approval:'b-wait',done:'b-done',failed:'b-fail'};return '<span class="badge '+(m[s]||'')+'">'+s.replace('_',' ')+'</span>';}
function taskIdOf(st){for(let i=st.audit.length-1;i>=0;i--){const e=st.audit[i];if(e.kind==='executed'&&e.data&&typeof e.data.taskId==='string')return e.data.taskId;}return null;}
const STATUS={100:['Pending','run'],110:['Submitted on-chain','run'],200:['Confirmed on-chain','ok'],400:['Rejected','bad'],500:['Reverted','bad']};
function isReal(t){return t&&t!=='dry-run'&&t!=='simulated';}
function render(st){
  current=st;let h='<div class="row" style="margin-top:14px"><span class="k">Run</span><span>'+badge(st.status)+'</span></div><div style="margin-top:10px">';
  for(const e of st.audit){h+='<div class="ev"><span class="t">'+esc(e.kind)+'</span> '+esc(JSON.stringify(e.data))+'</div>';}
  h+='</div>';
  if(st.status==='awaiting_approval'&&st.pending){const a=st.pending.action;
    h+='<div class="gate"><b>Approval required</b><div class="mono" style="margin:8px 0">'+esc(a.kind)+' '+esc(a.amount||'')+' '+esc(a.token||'')+' → '+esc(a.to)+'</div><div class="k">'+esc(a.reason||'')+'</div><div class="k" style="margin-top:6px">'+esc(st.pending.policyReason||'')+'</div><div class="actions"><button class="ok" id="approve">Approve</button><button class="bad" id="reject">Reject</button></div></div>';}
  if(st.result){h+='<div class="card" style="margin-top:12px;border-color:var(--ok)">'+esc(st.result)+'</div>';}
  if(st.error){h+='<div class="card" style="margin-top:12px;color:var(--bad)">'+esc(st.error)+'</div>';}
  const tid=taskIdOf(st);
  if(isReal(tid)){h+='<div class="chain" id="chain"><span class="dot run"></span>relayer task <span class="mono">'+esc(tid.slice(0,10)+'…')+'</span> — checking status…</div>';}
  $('#out').innerHTML=h;
  if($('#approve'))$('#approve').onclick=()=>decide(true);
  if($('#reject'))$('#reject').onclick=()=>decide(false);
  if(isReal(tid)&&!polling)pollStatus(st.id);
}
async function pollStatus(runId){
  polling=true;const deadline=Date.now()+5*60000;
  while(Date.now()<deadline){
    let r;try{r=await (await fetch('/runs/'+runId+'/status')).json();}catch(e){break;}
    const el=$('#chain');if(!el)break;
    const meta=STATUS[r.status]||['awaiting status','run'];
    let line='<span class="dot '+meta[1]+'"></span>'+esc(meta[0]);
    if(r.taskId)line+=' · task <span class="mono">'+esc(r.taskId.slice(0,10)+'…')+'</span>';
    if(r.hash&&info&&info.explorerTxBase)line+=' · <a href="'+info.explorerTxBase+r.hash+'" target="_blank">view tx ↗</a>';
    el.innerHTML=line;
    if(r.status===200||r.status===400||r.status===500)break;
    await new Promise(x=>setTimeout(x,3000));
  }
  polling=false;
}
async function startRun(){
  const goal=$('#goal').value.trim();if(!goal)return;
  $('#run').disabled=true;$('#out').innerHTML='<div class="ev"><span class="t">thinking…</span> Venice is reading the chain and reasoning…</div>';
  try{const r=await fetch('/runs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({goal})});
    if(!r.ok){$('#out').innerHTML='<div style="color:var(--bad)">'+esc((await r.json()).error||r.status)+'</div>';}else{render(await r.json());}}
  catch(e){$('#out').innerHTML='<div style="color:var(--bad)">'+esc(e.message)+'</div>';}
  finally{$('#run').disabled=false;}
}
async function decide(ok){if(!current)return;const r=await fetch('/runs/'+current.id+'/approve',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({approved:ok})});render(await r.json());}
$('#run').onclick=startRun;
$('#goal').addEventListener('keydown',e=>{if(e.key==='Enter')startRun();});
$('#revoke').onclick=async()=>{await fetch('/revoke',{method:'POST'});loadPolicy();};
loadInfo();loadPolicy();
</script>
</body>
</html>`;
