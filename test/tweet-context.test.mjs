import test from 'node:test';
import assert from 'node:assert/strict';
import {tweetContext,readTweet} from '../sources.mjs';
const post=(id,text)=>({id_str:id,text,user:{name:'Author',screen_name:'author'}});
test('includes the original quote behind a short comment',()=>{
 const text=tweetContext({...post('123','MISSING Y'),quoted_tweet:post('122','The report calls it cybercurrency.')},'123');
 assert.match(text,/MISSING Y/);assert.match(text,/Quoted original post.*cybercurrency/);
});
test('includes parent with distinct attribution and rejects mismatched IDs',()=>{
 assert.match(tweetContext({...post('123','A reply'),parent:post('122','Original context')},'123'),/Parent post being replied to.*Original context/);
 assert.throws(()=>tweetContext(post('999','Wrong post'),'123'),/did not match/);
});
test('fetches an identified parent missing from the embed',async()=>{
 const calls=[];
 const text=await readTweet('123','https://twitter.com/a/status/123',async url=>{
 calls.push(url);return JSON.stringify(url.includes('id=123&')?{...post('123','Reply'),in_reply_to_status_id_str:'122'}:post('122','Parent context that explains the reply'));
 });
 assert.equal(calls.length,2);assert.match(text,/Parent context/);
});
test('falls back honestly when conversation data is unavailable',async()=>{
 const text=await readTweet('123','https://twitter.com/a/status/123',async url=>{
 if(url.includes('syndication'))throw Error('Unavailable');
 return JSON.stringify({author_name:'Author',html:'<blockquote><p>This is the available public tweet text.</p></blockquote>'});
 });
 assert.match(text,/Conversation context unavailable/);
});
test('hydrates nested quotes even when embedded snippets omit their quote',async()=>{
 const calls=[];
 const records={
 '3':{...post('3','Newest comment'),quoted_tweet:post('2','MISSING Y')},
 '2':{...post('2','MISSING Y'),quoted_tweet:post('1','Original report')},
 '1':post('1','Original report with the actual cybercurrency context')
 };
 const text=await readTweet('3','https://x.com/a/status/3',async url=>{const id=new URL(url).searchParams.get('id');calls.push(id);return JSON.stringify(records[id]);});
 assert.deepEqual(calls,['3','2','1']);assert.match(text,/actual cybercurrency context/);
});
test('follows expanded post links and stops cycles',async()=>{
 const calls=[];
 const text=await readTweet('3','https://x.com/a/status/3',async url=>{
 const id=new URL(url).searchParams.get('id');calls.push(id);
 return JSON.stringify({...post(id,'Useful context'),entities:{urls:[{expanded_url:'https://x.com/a/status/'+(id==='3'?'2':'3')}]}});
 });
 assert.deepEqual(calls,['3','2']);assert.match(text,/Linked context post/);
});
test('limits long conversations to five fetches and reports truncation',async()=>{
 let calls=0;
 const text=await readTweet('9','https://x.com/a/status/9',async url=>{calls++;const id=new URL(url).searchParams.get('id');return JSON.stringify({...post(id,'Context'),in_reply_to_status_id_str:String(Number(id)-1)});});
 assert.equal(calls,5);assert.match(text,/lookup limit/);
});
