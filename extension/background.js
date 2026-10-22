import {extractPage} from './extract.js';
const running = new Set();
async function prepare(tabId) {
  if (running.has(tabId) || !(await chrome.storage.local.get('automatic')).automatic) return;
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab?.active || !/^https?:\/\//.test(tab.url || '') || /^http:\/\/(localhost|127\.0\.0\.1)/.test(tab.url)) return;
  const key = 'draft:' + tabId;
  const cached = (await chrome.storage.session.get(key))[key];
  if (cached?.url === tab.url && cached.draft) return;
  running.add(tabId);
  try {
    const [result] = await chrome.scripting.executeScript({target:{tabId},func:extractPage});
    if (!result?.result) throw new Error('Page text is not ready. Open Cally to read it again.');
    const source = result.result;
    await chrome.storage.session.set({[key]:{url:tab.url,source,status:'Writing automatically…'}});
    const response = await fetch('http://127.0.0.1:4317/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...source,tone:'clear'}),signal:AbortSignal.timeout(65000)});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Generation failed.');
    if ((await chrome.storage.local.get('automatic')).automatic) await chrome.storage.session.set({[key]:{url:tab.url,source,draft:data.draft,status:'Automatic callout ready.'}});
  } catch(error) {
    await chrome.storage.session.set({[key]:{url:tab.url,status:error instanceof TypeError ? 'Backend offline. Start Cally and use Write my callout to retry.' : error.message}});
  } finally {
    running.delete(tabId);
    const current = await chrome.tabs.get(tabId).catch(()=>null);
    if (current?.url !== tab.url && current?.status === 'complete') prepare(tabId);
  }
}
chrome.tabs.onUpdated.addListener((id,change)=>{if(change.status === 'complete' || change.url) prepare(id);});
chrome.tabs.onActivated.addListener(({tabId})=>prepare(tabId));
chrome.tabs.onRemoved.addListener(id=>chrome.storage.session.remove('draft:'+id));
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area === 'local' && changes.automatic?.newValue) chrome.tabs.query({active:true,currentWindow:true}).then(([tab])=>tab && prepare(tab.id));
});
