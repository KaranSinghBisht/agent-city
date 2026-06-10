/**
 * ERC-7715 Advanced Permissions front door (GET /grant). In the browser, the user
 * grants the Agent City agent an `erc20-token-periodic` budget via MetaMask Flask
 * (wallet_requestExecutionPermissions). The granted context is POSTed to the
 * backend, which will redeem under it. Raw provider RPC (no bundler) so the page
 * needs no build step — the Kit's erc7715ProviderActions wraps this same method.
 *
 * NOTE: requires MetaMask Flask with Advanced Permissions, on Base Sepolia, with a
 * little test USDC in the granting account. This is interactive — test it in Flask.
 */
import { FONTS, THEME_CSS } from "./theme.js";

const LOGO = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="5" r="2.3" stroke="url(#gg)" stroke-width="1.6"/><circle cx="5" cy="18" r="2.3" stroke="url(#gg)" stroke-width="1.6"/><circle cx="19" cy="18" r="2.3" stroke="url(#gg)" stroke-width="1.6"/><path d="M11 6.7 6.2 15.6M13 6.7l4.8 8.9" stroke="url(#gg)" stroke-width="1.5"/><defs><linearGradient id="gg" x1="0" y1="0" x2="24" y2="24"><stop stop-color="#a99bff"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs></svg>`;

export const GRANT_HTML = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Agent City — grant a permission</title>
${FONTS}
<style>${THEME_CSS}
nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);background:rgba(10,11,15,.72);border-bottom:1px solid var(--line)}
nav .container{display:flex;align-items:center;justify-content:space-between;height:64px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px}
.wrap{max-width:680px;margin:0 auto;padding:48px 24px}
h1{font-size:clamp(28px,4vw,40px);font-weight:800;margin:0 0 12px}
.lede{color:var(--fg-2);font-size:17px;margin-bottom:28px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:22px;margin-bottom:16px}
.brow{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}
.brow:last-child{border-bottom:0}.brow .k{color:var(--fg-3);font-size:14px}.brow .v{font-family:var(--mono);font-size:13px}
.steps{counter-reset:s;margin:0 0 20px;padding:0;list-style:none}
.steps li{position:relative;padding:6px 0 6px 30px;color:var(--fg-2);font-size:14px}
.steps li::before{counter-increment:s;content:counter(s);position:absolute;left:0;top:5px;width:20px;height:20px;border-radius:6px;background:rgba(139,124,255,.14);color:var(--accent-2);font-size:12px;font-weight:700;display:grid;place-items:center}
.note{border:1px solid var(--warn);background:var(--warn-bg);border-radius:11px;padding:13px 15px;font-size:13px;color:#e9cf8f;margin-bottom:20px}
.out{font-family:var(--mono);font-size:12.5px;white-space:pre-wrap;word-break:break-all;background:var(--bg-2);border:1px solid var(--line-2);border-radius:11px;padding:14px;margin-top:14px;max-height:280px;overflow:auto}
.ok{border-color:rgba(70,208,127,.4);background:var(--ok-bg)}
.bad{border-color:rgba(255,107,107,.4);background:var(--bad-bg);color:#ffb3b3}
.row{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
</style></head>
<body>
<nav><div class="container">
  <a class="brand" href="/">${LOGO} Agent City</a>
  <a class="btn btn-ghost" href="/app">Skip to the city →</a>
</div></nav>

<div class="wrap">
  <span class="eyebrow">MetaMask Advanced Permissions · ERC-7715</span>
  <h1>Grant the city a budget — from your own wallet.</h1>
  <p class="lede">Authorize Agent City to spend a capped amount on your behalf using a real MetaMask Advanced Permission. No keys shared; revoke anytime; the agents can never exceed what you grant.</p>

  <div class="note">Requires <b>MetaMask Flask</b> with Advanced Permissions, on <b>Base Sepolia</b>, with a little test USDC in the granting account.</div>

  <div class="card">
    <div class="brow"><span class="k">Permission type</span><span class="v">erc20-token-periodic</span></div>
    <div class="brow"><span class="k">Budget</span><span class="v" id="g-budget">≤ 5 USDC / day</span></div>
    <div class="brow"><span class="k">Granted to (agent)</span><span class="v" id="g-agent">…</span></div>
    <div class="brow"><span class="k">Token (USDC)</span><span class="v" id="g-usdc">…</span></div>
    <div class="brow"><span class="k">Network</span><span class="v" id="g-net">…</span></div>
    <div class="row">
      <button class="btn" id="connect">Connect MetaMask</button>
      <button class="btn btn-primary" id="grant" disabled>Grant permission →</button>
    </div>
    <div id="out"></div>
  </div>

  <ol class="steps">
    <li>Connect your MetaMask Flask wallet (Base Sepolia).</li>
    <li>Approve the <b>erc20-token-periodic</b> permission in the popup.</li>
    <li>The agent validates &amp; decodes the granted context — every city payment then chains under your grant. Run the city at <a href="/app" style="color:var(--accent-2)">/app</a>.</li>
  </ol>
</div>

<script>
var $=function(s){return document.querySelector(s);};
var cfg=null, account=null;
function show(html, cls){var o=$('#out');o.className='out'+(cls?' '+cls:'');o.innerHTML=html;}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function shrink(a){return a?String(a).slice(0,8)+'…'+String(a).slice(-6):'—';}

async function loadConfig(){
  try{cfg=await (await fetch('/city/config')).json();}catch(e){cfg=null;}
  if(!cfg||cfg.error){show('City config unavailable (live mode required): '+esc(cfg&&cfg.error),'bad');return;}
  $('#g-agent').textContent=shrink(cfg.agent);
  $('#g-usdc').textContent=shrink(cfg.usdc);
  $('#g-net').textContent=cfg.network+' ('+cfg.chainId+')';
}
async function connect(){
  if(!window.ethereum){show('No wallet found. Install <b>MetaMask Flask</b> (Advanced Permissions is Flask-only).','bad');return;}
  try{
    var accts=await window.ethereum.request({method:'eth_requestAccounts'});
    account=accts[0];
    var cid=parseInt(await window.ethereum.request({method:'eth_chainId'}),16);
    show('Connected '+esc(shrink(account))+' · chain '+cid+(cfg&&cid!=Number(cfg.chainId)?' ⚠️ switch to Base Sepolia ('+esc(cfg.chainId)+')':' ✓'));
    $('#grant').disabled=false;
  }catch(e){show('Connect failed: '+esc(e.message),'bad');}
}
async function grant(){
  if(!cfg){show('No config.','bad');return;}
  $('#grant').disabled=true;show('Requesting permission… approve in MetaMask.');
  // erc20-token-periodic: ≤5 USDC per day, granted to the agent (redeemer).
  var periodAmount='0x'+(5n*(10n**6n)).toString(16); // 5 USDC (6 dp), hex quantity
  var expiry=Math.floor(Date.now()/1000)+7*86400;
  // RPC wire shape per the Kit's permissionRequestToRpc: hex chainId, expiry as a rule.
  var req={
    chainId:'0x'+Number(cfg.chainId).toString(16),
    to:cfg.agent,
    permission:{
      type:'erc20-token-periodic',
      data:{
        tokenAddress:cfg.usdc,
        periodAmount:periodAmount,
        periodDuration:86400,
        justification:'Agent City may spend ≤5 USDC/day on your behalf (revocable).'
      }
    },
    rules:[{type:'expiry',data:{timestamp:expiry}}]
  };
  try{
    var granted=await window.ethereum.request({method:'wallet_requestExecutionPermissions',params:[req]});
    var r=await fetch('/city/grant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({granted:granted,account:account})});
    var v=await r.json();
    if(!r.ok||!v.ok){show('Granted in MetaMask, but the agent REJECTED it: '+esc(v.error||('HTTP '+r.status)),'bad');$('#grant').disabled=false;return;}
    show('✅ Permission granted — validated &amp; decoded by the agent ('+esc(v.links)+'-link chain, delegator '+esc(shrink(v.delegator))+').\\n\\nEvery city payment now chains under YOUR grant. Open <a href="/app" style="color:var(--accent-2)">/app</a> and dispatch.\\n\\n'+esc(JSON.stringify(granted,null,2)),'ok');
  }catch(e){
    show('Grant failed: '+esc(e.message||e)+'\\n\\nIf this is a param/encoding error, copy it here — the request shape may need a tweak for your wallet version.','bad');
    $('#grant').disabled=false;
  }
}
$('#connect').onclick=connect;
$('#grant').onclick=grant;
loadConfig();
</script>
</body></html>`;
