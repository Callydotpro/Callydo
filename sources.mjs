import https from 'node:https';
import http from 'node:http';
import {lookup} from 'node:dns/promises';
import ipaddr from 'ipaddr.js';
import {load} from 'cheerio';
import {collectTweetImages} from './tweet-images.mjs';

export function publicAddress(address) {
  try { return ipaddr.process(address).range() === 'unicast'; } catch { return false; }
}
export function validateURL(value) {
  const url = new URL(value);
  if (!['https:','http:'].includes(url.protocol) || url.username || url.password || (url.port && !['80','443'].includes(url.port))) throw Error('Unsupported source URL.');
  return url;
}
async function download(value, redirects = 0) {
  const url = validateURL(value);
  if (redirects > 4) throw Error('Too many redirects.');
  const host = url.hostname.replace(/^\[|\]$/g,'');
  const addresses = await lookup(host,{all:true});
  if (!addresses.length || addresses.some(a=>!publicAddress(a.address))) throw Error('Only public websites can be read.');
  const chosen = addresses[0];
  return new Promise((resolve,reject)=>{
    const request = (url.protocol === 'https:' ? https : http).get(url,{
      headers:{'User-Agent':'Cally/0.3 source reader','Accept':'text/html,application/json','Accept-Encoding':'identity'},
      lookup:(_hostname,options,callback)=>callback(null,options.all ? [chosen] : chosen.address,chosen.family)
    },response=>{
      if ([301,302,303,307,308].includes(response.statusCode)) {response.resume(); return resolve(download(new URL(response.headers.location,url).href,redirects+1));}
      if(response.statusCode !== 200) {response.resume(); return reject(Error(response.statusCode===403 ? 'The website blocked automated reading (403).' : `Source returned ${response.statusCode}.`));}
      if(!/text\/html|application\/json|text\/plain/.test(response.headers['content-type'] || '')) {response.resume();return reject(Error('Source is not readable text.'));}
      let size=0; const chunks=[];
      response.on('data',chunk=>{size+=chunk.length;if(size>1500000) request.destroy(Error('Source is too large.'));else chunks.push(chunk);});
      response.on('error',reject);
      response.on('end',()=>resolve(Buffer.concat(chunks).toString('utf8')));
    });
    const timer=setTimeout(()=>request.destroy(Error('Source timed out.')),15000);
    request.on('close',()=>clearTimeout(timer));request.on('error',reject);
  });
}
export function websiteText(html) {
  const $=load(html); $('script,style,nav,footer,header,aside,form,noscript,[hidden],[aria-hidden="true"]').remove();
  const root=$('main').first().length ? $('main').first() : $('article').first().length ? $('article').first() : $('body');
  return root.text().replace(/\s+/g,' ').trim().slice(0,6500);
}
export function tweetContext(data, expectedId) {
  if(data?.id_str !== expectedId || typeof data.text !== 'string') throw Error('Tweet data did not match the requested post.');
  const parts=[]; const seen=new Set();
  function add(tweet,label,depth=0) {
    if(depth>2 || !/^\d+$/.test(tweet?.id_str || '') || typeof tweet.text!=='string' || seen.has(tweet.id_str)) return;
    seen.add(tweet.id_str);
    parts.push(`${label} by ${String(tweet.user?.name || 'Unknown author').slice(0,150)} (@${String(tweet.user?.screen_name || '').slice(0,100)}): ${tweet.text.slice(0,4500)}`);
    if(tweet.parent) add(tweet.parent,'Parent post being replied to',depth+1);
    if(tweet.quoted_tweet) add(tweet.quoted_tweet,'Quoted original post',depth+1);
  }
  add(data,'Linked post');
  return parts.join('\n\n');
}
export async function readTweet(id, canonical, reader=download, images=[]) {
  try {
    const queue=[{id,label:'Linked post'}],seen=new Set(),parts=[];
    const deadline=Date.now()+20000;
    while(queue.length && seen.size<5 && Date.now()<deadline) {
      const item=queue.shift();
      if(!/^\d+$/.test(item.id || '') || seen.has(item.id)) continue;
      seen.add(item.id);
      let data,timer;
      try {
        data=JSON.parse(await Promise.race([
          reader(`https://cdn.syndication.twimg.com/tweet-result?id=${item.id}&lang=en&token=0`),
          new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Conversation lookup timed out.')),Math.min(5000,deadline-Date.now()));})
        ]));
        tweetContext(data,item.id); // Validate identity before trusting relationships.
      } catch(error) {
        if(item.id===id) throw error;
        data=item.embedded;
        if(!data || data.id_str!==item.id || typeof data.text!=='string') {
          parts.push(`${item.label} could not be read. Do not infer its content.`);continue;
        }
        parts.push(`Further context for post ${item.id} could not be retrieved.`);
      } finally {clearTimeout(timer);}
      collectTweetImages(data,images);
      parts.push(`${item.label} [https://x.com/i/status/${item.id}] by ${String(data.user?.name || 'Unknown author').slice(0,150)} (@${String(data.user?.screen_name || '').slice(0,100)}): ${data.text.slice(0,2200)}`);
      const enqueue=(nextId,label,embedded)=>{if(/^\d+$/.test(nextId || '') && !seen.has(nextId) && !queue.some(q=>q.id===nextId)) queue.push({id:nextId,label:`${label} of post ${item.id}`,embedded});};
      enqueue(data.parent?.id_str || data.in_reply_to_status_id_str,'Parent post being replied to',data.parent);
      enqueue(data.quoted_tweet?.id_str || data.quoted_status_id_str,'Quoted original post',data.quoted_tweet);
      for(const link of (data.entities?.urls || []).slice(0,10)) {
        try {
          const url=new URL(link.expanded_url);
          if(/^(www\.)?(x\.com|twitter\.com)$/.test(url.hostname)) enqueue(url.pathname.match(/^\/(?:[^/]+|i\/web)\/status\/(\d+)(?:\/|$)/)?.[1],'Linked context post');
        } catch {}
      }
    }
    if(queue.some(item=>!seen.has(item.id))) parts.push('Additional conversation context omitted at the lookup limit. Do not infer unread content.');
    const text=parts.join('\n\n');
    if(text.length<30) throw Error('Tweet has too little readable text.');
    return text;
  } catch {
    const data=JSON.parse(await reader('https://publish.twitter.com/oembed?omit_script=true&url='+encodeURIComponent(canonical)));
    const $=load(data.html || '');
    const text=$('blockquote p').first().text().trim();
    if(text.length<30) throw Error('Tweet has too little readable text and its conversation could not be loaded.');
    return `Public tweet by ${data.author_name}: ${text}\nConversation context unavailable; do not infer any parent or quoted post.`;
  }
}
export async function readSource(value) {
  const url=validateURL(value);
  if(/(^|\.)(x\.com|twitter\.com)$/.test(url.hostname)) {
    const match=url.pathname.match(/^\/([^/]+)\/status\/(\d+)/);
    if(!match) throw Error('The X link is a profile or community, not an individual post.');
    const canonical=`https://twitter.com/${match[1]}/status/${match[2]}`;
    const images=[];
    try {return {url:url.href,text:await readTweet(match[2],canonical,download,images),kind:'Tweet',images};} catch {throw Error('X did not make this post available to its public reader. Paste the post text instead.');}
  }
  const text=websiteText(await download(url.href));
  if(text.length<80 || /enable javascript|just a moment|verify you are human/i.test(text.slice(0,500))) throw Error('Website requires a browser or blocks reading.');
  return {url:url.href,text,kind:'Website'};
}
export async function resolveSources(links) {
  if(!Array.isArray(links) || !links.length) throw Error('No coin website or tweet link found yet.');
  const results=await Promise.allSettled([...new Set(links)].slice(0,2).map(readSource));
  const sources=results.filter(r=>r.status==='fulfilled').map(r=>r.value);
  const warnings=results.filter(r=>r.status==='rejected').map(r=>r.reason.message);
  if(!sources.length) throw Error('Cally could not read the linked sources for this coin. '+warnings.join(' ')+' Paste a specific X post link or source text in Cally to continue.');
  const images=[...new Map(sources.flatMap(s=>s.images || []).map(image=>[image.url,image])).values()].slice(0,4);
  return {sources,warnings,images,text:sources.map(s=>`${s.kind}: ${s.url}\n${s.text}`).join('\n\n').slice(0,14000)};
}



