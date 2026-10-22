import http from 'node:http';
import {readFile,writeFile,rename} from 'node:fs/promises';
import {createHash,timingSafeEqual} from 'node:crypto';
import path from 'node:path';
const brandFile=process.env.CALLY_USAGE_DB?path.join(path.dirname(process.env.CALLY_USAGE_DB),'brand.json'):new URL('./public/brand.json',import.meta.url);
const validCA=ca=>typeof ca==='string'&&(ca===''||/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(ca));
import {UsageLimits} from './usage-limits.mjs';
const hosted=process.env.CALLY_HOSTED==='true';
const enabled=!hosted || process.env.CALLY_GENERATION_ENABLED==='true';
if(hosted && enabled && !process.env.CALLY_USAGE_DB) throw Error('Hosted generation requires a persistent usage database.');
const limits=hosted && enabled ? new UsageLimits(process.env.CALLY_USAGE_DB,{globalDaily:Number(process.env.CALLY_GLOBAL_DAILY || 100),installationDaily:Number(process.env.CALLY_INSTALLATION_DAILY || 20)}) : null;
import {buildRequest, extractOutput} from './generation.mjs';
import {resolveSources} from './sources.mjs';
const allowedOrigin = `chrome-extension://${process.env.CALLY_EXTENSION_ID || ''}`;
let activeRequests = 0;
http.createServer(async (req,res) => {
  const send = (code,data) => {res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  if(req.method==='GET' && req.url==='/healthz') return send(200,{ok:true,generationEnabled:enabled});
  if(req.method==='GET'&&req.url==='/brand.json') {try{return send(200,JSON.parse(await readFile(brandFile,'utf8')));}catch{return send(200,{ca:''});}}
  if(req.method==='POST'&&req.url==='/admin/brand') {
    const token=process.env.CALLY_ADMIN_TOKEN;
    const supplied=String(req.headers.authorization||'').replace(/^Bearer /,'');
    if(!token||!timingSafeEqual(createHash('sha256').update(supplied).digest(),createHash('sha256').update(token).digest()))return send(401,{error:'Enter your admin key.'});
    try{let body='';for await(const chunk of req){body+=chunk;if(body.length>4096)return send(413,{error:'Request too large.'});}
      const {ca}=JSON.parse(body);if(!validCA(ca))return send(400,{error:'Enter a valid Solana contract address, or leave it blank.'});
      const data=JSON.stringify({ca});const temporary=typeof brandFile==='string'?brandFile+'.tmp':new URL('./public/brand.json.tmp',import.meta.url);
      await writeFile(temporary,data,{mode:0o600});await rename(temporary,brandFile);return send(200,{ca});
    }catch{return send(500,{error:'Could not save. Please retry.'});}
  }
  const publicFiles={'/admin':['admin.html','text/html; charset=utf-8'],'/':['index.html','text/html; charset=utf-8'],'/privacy':['privacy.html','text/html; charset=utf-8']};
  if(req.method==='GET' && publicFiles[req.url]) {
    const [file,type]=publicFiles[req.url];
    try {const body=await readFile(new URL('./public/'+file,import.meta.url));res.writeHead(200,{'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});return res.end(body);} catch {return send(404,{error:'Page not available.'});}
  }
  if(req.method==='GET' && req.url==='/downloads/cally.zip') {
    if(process.env.CALLY_DOWNLOAD_ENABLED!=='true')return send(503,{error:'Download is being prepared.'});
    try {const body=await readFile(new URL('./public/cally.zip',import.meta.url));res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="cally.zip"','Cache-Control':'no-store'});return res.end(body);}catch{return send(404,{error:'Download not available.'});}
  }
  if (!process.env.CALLY_EXTENSION_ID || req.headers.origin !== allowedOrigin) return send(403,{error:'Set CALLY_EXTENSION_ID in .env to the ID shown in chrome://extensions, then restart the backend.'});
  res.setHeader('Access-Control-Allow-Origin',allowedOrigin);
  res.setHeader('Vary','Origin');
  if (req.method === 'OPTIONS') {res.setHeader('Access-Control-Allow-Methods','POST');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.writeHead(204);return res.end();}
  if (req.method !== 'POST' || req.url !== '/generate') return send(404,{error:'Not found.'});
  if (!req.headers['content-type']?.startsWith('application/json')) return send(415,{error:'JSON required.'});
  if(!enabled) return send(503,{error:'Cally is being prepared for launch. Please try again later.'});
  if (!process.env.OPENAI_API_KEY) return send(503,{error:'Add OPENAI_API_KEY to your local .env file and restart the backend.'});
  if (activeRequests >= 3) return send(429,{error:'Several callouts are being generated. Try again shortly.'});
  activeRequests++;
  try {
    let raw = ''; let bytes = 0;
    for await (const chunk of req) {bytes += chunk.length;if(bytes > 100000) {send(413,{error:'Source is too large.'});return;}raw += chunk;}
    let request; let resolved;
    try {
      const input=JSON.parse(raw);
      if(limits){const allowance=limits.reserve(input.writerId);if(!allowance.ok)return send(429,{error:allowance.error});}
      input.images=[];delete input.primaryTweet;
      if(input.links) {resolved=await resolveSources(input.links); input.text=resolved.text;input.images=resolved.images;const tweet=resolved.sources.find(s=>s.kind==='Tweet');if(tweet){input.primaryTweet=tweet.text;input.text='Primary tweet context:\n'+tweet.text+'\n\nSupporting website context:\n'+resolved.sources.filter(s=>s.kind!=='Tweet').map(s=>s.text.slice(0,700)).join('\n');}}
      request = buildRequest(input,process.env.OPENAI_MODEL || 'gpt-4.1-mini');
    }
    catch(error) {return send(400,{error:error.message});}
    const response = await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(60000)});
    if (!response.ok) return send(502,{error:`AI provider returned ${response.status}. Check your local key, model access, or API billing.`});
    send(200,{draft:extractOutput(await response.json()),sources:resolved?.sources.map(s=>({url:s.url,kind:s.kind})),warnings:resolved?.warnings});
  } catch {send(502,{error:'Generation did not complete. Check your connection and try again.'});}
  finally {activeRequests--;}
}).listen(Number(process.env.PORT || 4317),hosted?'0.0.0.0':'127.0.0.1',()=>console.log('Cally backend listening'));


