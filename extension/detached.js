const $=id=>document.getElementById(id),tab=Number(new URL(location.href).searchParams.get('tab'));
let mint='',lastDraft='',busy=false;
async function sync(action='state') {
 if(busy)return;busy=true;
 try {
  const state=await chrome.runtime.sendMessage({type:'cally-detached',tab,action,mint,previous:$('draft').value});
  if(state?.error)throw Error(state.error);
  if(!state)throw Error('Refresh the chart to reconnect Cally.');
  if(state.mint!==mint || state.draft!==lastDraft){$('draft').value=state.draft;lastDraft=state.draft;}
  mint=state.mint;$('coin').textContent=state.coin;$('status').textContent=state.status;$('again').disabled=!state.ready;$('copy').disabled=!$('draft').value.trim();
 }catch(e){$('status').textContent=e.message;$('again').disabled=true;}
 finally{busy=false;}
}
$('again').onclick=()=>sync('regenerate');
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('draft').value);$('status').textContent='Copied.';}catch{$('status').textContent='Select the text and copy manually.';}};
$('draft').oninput=()=>{$('copy').disabled=!$('draft').value.trim();};
sync();setInterval(()=>sync(),1000);

async function refreshCallyBrand(){try{const data=await chrome.runtime.sendMessage({type:'cally-brand'});const ca=typeof data?.ca==='string'&&/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(data.ca)?data.ca:'';const el=document.querySelector('[data-cally-ca]');if(el){el.textContent='Cally CA: '+(ca||'Not Announced');el.style.overflowWrap='anywhere';}}catch{}}
refreshCallyBrand();setInterval(refreshCallyBrand,5000);
