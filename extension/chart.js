(() => {
  if(document.getElementById('cally-chart-panel')) return;
  const host=document.createElement('div');host.id='cally-chart-panel';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<style>
    :host{position:fixed;bottom:24px;left:90px;width:310px;max-width:calc(100vw - 32px);z-index:2147483640;font:13px Arial,sans-serif;color:#f5f5f5}
    *{box-sizing:border-box}section{padding:15px;background:#080808;border:1px solid #3a3a3a;border-radius:13px;box-shadow:0 12px 38px #0008}header{display:flex;align-items:center;justify-content:space-between}strong{font-size:21px;letter-spacing:-.8px}strong span{color:#ffffff}button{cursor:pointer;color:#dddddd;background:transparent;border:1px solid #383838;border-radius:7px;padding:9px;font:12px Arial}#toggle{border:0;padding:3px 7px}p{font-size:11px;line-height:1.5;color:#b3b3b3;margin:10px 0}textarea{width:100%;height:150px;padding:11px;resize:vertical;background:#151515;color:#f5f5f5;border:1px solid #333333;border-radius:8px;font:13px/1.6 Arial}nav{display:flex;gap:8px;margin-top:9px}nav button{flex:1}#copy{background:#ffffff;color:#080808;border-color:#ffffff}button:disabled{opacity:.4;cursor:default}a{color:#eeeeee;font-size:10px;display:block;margin-top:7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}small{display:block;color:#999999;font-size:9px;margin-top:10px}[hidden]{display:none!important}
  .brand{display:flex;align-items:center;gap:9px}.pump-logo{filter:grayscale(1);flex-shrink:0}textarea:focus-visible,button:focus-visible{outline:2px solid white;outline-offset:2px}.cally-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;padding-top:12px;border-top:1px solid #333;color:#ccc;font:11px Arial,sans-serif}.cally-x{display:inline-flex;align-items:center;color:#fff;flex-shrink:0}</style><section><header><div class="brand"><svg class="pump-logo" role="img" aria-label="pump.fun" width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.8855 184.247C-2.01603 162.076 -3.41853 124.726 18.753 100.824L94.7609 18.8855C116.932 -5.01605 154.282 -6.41855 178.184 15.7529C202.085 37.9244 203.488 75.274 181.316 99.1756L105.308 181.115C83.1367 205.016 45.7871 206.419 21.8855 184.247Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.753 100.824C-3.41853 124.726 -2.01603 162.076 21.8855 184.247C45.7871 206.419 83.1367 205.016 105.308 181.115L145.81 137.452L59.2549 57.1621L18.753 100.824ZM40.6908 123.847C41.4209 122.946 41.2828 121.625 40.3824 120.895C39.482 120.165 38.1603 120.303 37.4302 121.203L34.9463 124.267C34.2162 125.167 34.3543 126.489 35.2547 127.219C36.1551 127.949 37.4768 127.811 38.2068 126.91L40.6908 123.847ZM34.5525 135.781C34.7653 134.641 34.014 133.545 32.8745 133.332C31.735 133.12 30.6388 133.871 30.4261 135.01C29.2814 141.142 29.7013 147.239 31.4916 152.718C31.8516 153.82 33.0367 154.421 34.1385 154.061C35.2404 153.701 35.8417 152.516 35.4816 151.414C33.9159 146.623 33.5335 141.24 34.5525 135.781ZM39.6257 160.27C38.8184 159.438 37.4897 159.418 36.6578 160.225C35.8259 161.032 35.8059 162.361 36.6131 163.193L40.0892 166.775C40.8964 167.607 42.2252 167.627 43.0571 166.82C43.889 166.013 43.909 164.684 43.1018 163.852L39.6257 160.27Z" fill="#5FCB88"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.06623 138.152C5.76813 147.035 10.7861 155.343 18.084 162.112C40.0735 182.51 74.4351 181.22 94.8329 159.23L161.563 87.2934C181.961 65.304 180.67 30.9424 158.681 10.5446C153.808 6.02469 148.328 2.56968 142.527 0.168847C155.378 1.14043 168.001 6.30744 178.184 15.7529C202.085 37.9244 203.488 75.274 181.316 99.1756L105.308 181.115C83.1367 205.016 45.7871 206.419 21.8855 184.247C8.6076 171.93 2.27306 154.929 3.06623 138.152Z" fill="#629393" fill-opacity="0.4"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M140.341 130.232L174.776 93.1092C193.598 72.8194 192.407 41.1138 172.117 22.2927C151.827 3.47151 120.122 4.66206 101.301 24.9518L66.8651 62.0744L140.341 130.232ZM181.316 99.1756C203.488 75.274 202.085 37.9244 178.184 15.7529C154.282 -6.41855 116.932 -5.01605 94.7609 18.8855L54.259 62.5478L140.814 142.838L181.316 99.1756Z" fill="#1D3934"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M25.2927 106.891L60.7988 68.6141L54.259 62.5478L18.753 100.824C-3.41853 124.726 -2.01603 162.076 21.8855 184.247C45.7871 206.419 83.1367 205.016 105.308 181.115L140.814 142.838L134.275 136.771L98.7685 175.048C79.9473 195.338 48.2417 196.528 27.9519 177.707C7.66214 158.886 6.47158 127.181 25.2927 106.891Z" fill="#1D3934"/>
</svg><strong>cally</strong></div><button id="popout" title="Open in a separate window" aria-label="Pop out Cally">↗</button><button id="toggle" aria-label="Minimize Cally">−</button></header><div id="body"><p id="status" role="status">Finding this coin’s sources…</p><textarea id="draft" aria-label="Cally callout" placeholder="Your callout will appear here…" disabled></textarea><nav><button id="again" disabled>New version</button><button id="copy" disabled>Copy callout</button></nav><div id="sources"></div><details id="manual-source"><summary>Use another source</summary><textarea id="manual-text" aria-label="Alternative source" placeholder="Paste a specific X post link or the source text" style="height:75px;margin:8px 0"></textarea><button id="use-manual">Write from this source</button></details><small>Public source text and tweet images are read with AI. Review before posting.</small><div class="cally-footer"><span data-cally-ca>Cally CA: Not Announced</span><a class="cally-x" href="https://x.com/Callydotpro" target="_blank" rel="noopener noreferrer" aria-label="Cally on X" title="@Callydotpro"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933Zm-1.29 19.49h2.039L6.487 3.24H4.3l13.311 17.403Z"/></svg></a></div></div></section>`;
  document.documentElement.append(host);
async function refreshCallyBrand(){try{const data=await chrome.runtime.sendMessage({type:'cally-brand'});const ca=typeof data?.ca==='string'&&/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(data.ca)?data.ca:'';const el=root.querySelector('[data-cally-ca]');if(el){el.textContent='Cally CA: '+(ca||'Not Announced');el.style.overflowWrap='anywhere';}}catch{}}
refreshCallyBrand();setInterval(refreshCallyBrand,5000);

  const $=id=>root.getElementById(id);
  let route='',routeChanged=0;
  const isTerminal=location.hostname==='trade.padre.gg';
  let mint='',generation=0,started=false,coin='',links=[];
  let ratingMint='',rating=null;
  window.addEventListener('focus',()=>{
    if(rating?.label==='Unavailable' || rating?.label==='Open report') {rating=null;ratingMint='';showRating();}
  });
  const badge=document.createElement('a');
  badge.id='cally-larp-badge';badge.target='_blank';badge.rel='noopener noreferrer';
  badge.style.cssText='display:inline-flex;align-items:center;margin-left:10px;padding:4px 8px;border:1px solid #555;border-radius:6px;background:#111;color:#fff;font:11px Arial,sans-serif;white-space:nowrap;text-decoration:none;vertical-align:middle';
  function showRating() {
    const heading=document.querySelector(isTerminal?'h2':'h1');
    if(!mint || !heading){badge.remove();return;}
    if(badge.previousElementSibling!==heading) heading.after(badge);
    badge.href=rating?.report || 'https://larpcheck.app/'+mint;
    badge.textContent='LarpCheck · '+(rating?.label || 'Checking…');
    badge.title=rating ? `Narrative verdict from LarpCheck (not a safety rating). ${rating.checked || ''}\n${rating.summary || 'Open LarpCheck for details.'}` : 'Reading LarpCheck’s public narrative verdict for this contract.';
    if(rating && Date.now()-(rating.retrieved || 0)>(rating.label==='Unavailable'?60000:300000)) {rating=null;ratingMint='';}
    if(ratingMint===mint) return;
    const requested=mint;ratingMint=requested;
    chrome.runtime.sendMessage({type:'cally-larp',mint:requested,route}).then(data=>{
      if(mint!==requested) return;
      if(data?.retry){ratingMint='';return;}
      rating={...(data || {label:'Unavailable'}),retrieved:data?.retrieved || Date.now()};showRating();
    }).catch(()=>{if(mint===requested){rating={label:'Unavailable',summary:'Reload Cally to reconnect the extension.',retrieved:Date.now()};showRating();}});
  }
  $('toggle').onclick=()=>{const hidden=$('body').hidden=!$('body').hidden;$('toggle').textContent=hidden?'+':'−';$('toggle').setAttribute('aria-label',hidden?'Expand Cally':'Minimize Cally');};
  $('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('draft').value);$('status').textContent='Copied.';}catch{$('status').textContent='Select the draft and copy it manually.';}};
  $('draft').oninput=()=>{$('copy').disabled=!$('draft').value.trim();};
  $('again').onclick=()=>write(true);
  $('use-manual').onclick=()=>{if(!$('manual-text').value.trim())return;started=true;write(true);};
  async function write(refresh=false) {
    const ticket=++generation; const current=mint;
    $('again').disabled=true;$('copy').disabled=true;$('draft').disabled=true;
    $('status').textContent='Reading linked sources and writing…';
    try {
      const data=await chrome.runtime.sendMessage({type:'cally-chart',mint:current,route,coin,links,refresh,manual:$('manual-text').value.trim(),previous:refresh?$('draft').value:''});
      if(ticket!==generation || current!==mint || !(isTerminal ? location.pathname.includes(route) : location.pathname.includes(current))) return;
      if(data?.retry) {started=false;$('status').textContent='Following the current coin…';return;}
      if(data?.error) throw Error(data.error);
      if(!data?.draft) throw Error('No draft returned. Try again.');
      $('draft').value=data.draft;$('sources').replaceChildren();
      for(const source of data.sources || []) {const a=document.createElement('a');a.href=source.url;a.textContent=source.kind+' · '+new URL(source.url).hostname;a.target='_blank';a.rel='noopener noreferrer';$('sources').append(a);}
      $('status').textContent=data.warnings?.length ? 'Draft ready. Some sources unavailable: '+data.warnings.join(' ') : 'Your callout is ready.';
    } catch(error) {if(ticket===generation) {$('status').textContent=error.message;$('manual-source').open=true;}}
    finally {if(ticket===generation){$('again').disabled=!started;$('draft').disabled=!started;$('copy').disabled=!$('draft').value.trim();}}
  }
  function inspect() {
    const terminalRoute=isTerminal ? location.pathname.match(/^\/trade\/solana\/([1-9A-HJ-NP-Za-km-z]{32,44})\/?$/)?.[1] || '' : '';
    if(isTerminal && terminalRoute!==route) {route=terminalRoute;routeChanged=Date.now();generation++;started=false;$('manual-text').value='';$('manual-source').open=false;mint='';coin='';rating=null;ratingMint='';badge.remove();links=[];$('draft').value='';$('sources').replaceChildren();$('again').disabled=true;$('copy').disabled=true;$('status').textContent='Finding this coin’s sources…';}
    const terminalSource=isTerminal && route && Date.now()-routeChanged>1000 ? callyTerminalSource() : null;
    const next=isTerminal ? terminalSource?.mint || '' : location.pathname.match(/^\/coin\/(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})\/?$/)?.[1] || '';
    host.style.display=(isTerminal?route:next)?'block':'none';
    if(next!==mint){mint=next;rating=null;ratingMint='';badge.remove();generation++;started=false;links=[];$('manual-text').value='';$('manual-source').open=false;$('draft').value='';$('sources').replaceChildren();$('again').disabled=true;$('copy').disabled=true;$('status').textContent='Finding this coin’s sources…';}
    showRating();
    if(!mint || started) return;
    // Only coin-header badges; never scrape trader profiles, callouts, or feeds.
    const x=document.querySelector('a[data-testid="twitter-badge"]');
    const website=document.querySelector('a[data-testid="website-badge"],a[aria-label="Website"],a[aria-label="Open website"],a[aria-label="Visit website"]');
    links=isTerminal ? terminalSource?.links || [] : [x?.href,website?.href].filter(h=>h && /^https?:\/\//.test(h));
    coin=document.querySelector(isTerminal?'h2':'h1')?.textContent?.trim() || '';
    if(!coin || !links.length) {$('status').textContent='Waiting for a coin website or tweet link…';return;}
    started=true;write();
  }
  callyMakeMovable(host,root);
  $('popout').onclick=async()=>{try{const data=await chrome.runtime.sendMessage({type:'cally-popout',mint,route});if(data?.error)throw Error(data.error);}catch(e){$('status').textContent=e.message;}};
  chrome.runtime.onMessage.addListener((message,sender,reply)=>{
    if(message.type!=='cally-panel-command' || sender.id!==chrome.runtime.id)return;
    if(message.action==='regenerate' && message.mint===mint && started && !$('again').disabled){$('draft').value=String(message.previous || '').slice(0,2000);write(true);}
    reply({mint,coin,draft:$('draft').value,status:$('status').textContent,ready:started && !$('again').disabled});
  });
  inspect();setInterval(inspect,1000);
})();









