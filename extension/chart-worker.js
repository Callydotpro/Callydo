import {API_BASE} from './api-config.js';
import {hasConsent} from './consent.js';
chrome.runtime.onInstalled.addListener(async()=>{if(!await hasConsent())chrome.tabs.create({url:chrome.runtime.getURL('welcome.html')});});
import './detached-worker.js';
import {currentCoin} from './chart-route.js';
import {lookupLarp} from './larp-worker.js';
const inflight=new Map();
let brandCache=null,brandAt=0,brandJob=null;
async function getCallyBrand(){
 if(brandCache&&Date.now()-brandAt<60000)return brandCache;
 if(!brandJob)brandJob=(async()=>{try{const r=await fetch(API_BASE+'/brand.json',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('Brand unavailable');const d=await r.json();brandCache={ca:typeof d.ca==='string'&&/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(d.ca)?d.ca:''};brandAt=Date.now();return brandCache;}catch{return brandCache||{ca:''};}finally{brandJob=null;}})();
 return brandJob;
}
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(message.type==='cally-brand'){getCallyBrand().then(reply);return true;}
  if(message.type==='cally-larp') {hasConsent().then(ok=>ok?lookupLarp(message,sender):{label:'Open Cally to enable'}).then(reply,()=>reply({label:'Unavailable'}));return true;}
  if(message.type!=='cally-chart') return;
  (async()=>{
  if(!await hasConsent())return {error:'Open the Cally extension to finish setup.'};
  const mint=await currentCoin(message,sender,chrome.tabs);
  if(!mint) return {retry:true};
  const key=sender.tab.id+':'+mint;
  if(!inflight.has(key)) {
    const job=(async()=>{
      const cacheKey='chart-context-v2:'+mint;
      const cached=(await chrome.storage.session.get(cacheKey))[cacheKey];
      if(!message.refresh && !message.manual && cached && Date.now()-cached.created<600000) return cached;
      const saved=await chrome.storage.local.get('writerId');
      const writerId=saved.writerId || crypto.randomUUID();
      if(!saved.writerId) await chrome.storage.local.set({writerId});
      const manual=String(message.manual || '').trim();
      let source={links:message.links};
      if(manual){
        if(/^https?:\/\/\S+$/.test(manual)) source={links:[manual]};
        else {if(manual.length<30 || manual.length>14000)throw Error('Paste 30–14,000 characters of source text.');source={text:manual};}
      }
      const response=await fetch(API_BASE+'/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...source,coin:message.coin,title:message.coin,previous:message.previous,writerId,tone:'casual'}),signal:AbortSignal.timeout(85000)});
      const result=await response.json();
      if(!response.ok) throw Error(result.error || 'Could not write the callout.');
      const entry={...result,created:Date.now()}; if(!manual) await chrome.storage.session.set({[cacheKey]:entry});return entry;
    })();
    inflight.set(key,job); job.finally(()=>inflight.delete(key)).catch(()=>{});
  }
  return await inflight.get(key);
  })().then(reply,error=>reply({error:error instanceof TypeError ? 'Cally could not reach its service. Try again shortly.' : error.message}));
  return true;
});



