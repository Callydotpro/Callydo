import {API_BASE} from './api-config.js';
import {extractPage} from './extract.js';
const $ = id => document.getElementById(id);
let source;
let writerId;
let busy = false;
function status(text, error = false) { $('status').textContent = text; $('status').className = error ? 'error' : ''; }
async function generate() {
  if (busy || !source) return;
  busy = true;
  const previous = $('draft').value;
  $('again').disabled = true; $('copy').disabled = true; $('draft').disabled = true;
  status('Writing your callout…');
  try {
    const response = await fetch(API_BASE+'/generate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...source,writerId,previous,tone:'casual'}),signal:AbortSignal.timeout(65000)});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not write a callout. Try again.');
    $('draft').value = result.draft; status('Ready to make your call.');
  } catch(error) { status(error instanceof TypeError ? 'Cally could not reach its service. Try again shortly.' : error.message,true); }
  finally { busy = false; $('again').disabled = false; $('draft').disabled = false; $('copy').disabled = !$('draft').value.trim(); }
}
$('again').onclick = generate;
$('draft').oninput = () => { $('copy').disabled = !$('draft').value.trim(); };
$('copy').onclick = async () => { try { await navigator.clipboard.writeText($('draft').value); status('Copied.'); } catch { status('Select the text and copy it manually.',true); } };
$('useSource').onclick = () => {
  const text = $('source').value.trim();
  if(text.length < 30) return status('Paste a little more context (at least 30 characters).',true);
  source = {text,title:'Pasted text',kind:'Text'}; $('sourceTitle').textContent = 'Pasted text'; generate();
};
async function init() {
  try {
    const saved = await chrome.storage.local.get('writerId');
    writerId = saved.writerId || crypto.randomUUID();
    if(!saved.writerId) await chrome.storage.local.set({writerId});
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    if(!/^https?:\/\//.test(tab?.url || '')) throw new Error('Open a website or individual tweet, then open Cally.');
    const [result] = await chrome.scripting.executeScript({target:{tabId:tab.id},func:extractPage});
    if(!result?.result) throw new Error('Could not read this page. Paste its text below.');
    source = result.result; $('sourceTitle').textContent = new URL(source.url).hostname; $('sourceTitle').title = source.title;
    await generate();
  } catch(error) { status(error.message,true); $('fallback').hidden = false; $('fallback').open = true; }
}
init();

