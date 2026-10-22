import test from 'node:test';
import assert from 'node:assert/strict';
import {parseLarpRating,fetchLarpRating} from '../extension/larp-api.js';
const mint='Bo61v44TWErCNGF4qzu2nEWyGgPWeNrNpu1FsV8dpump';
const fixture=()=>({address:mint,token:{address:mint,latest_check:'report1',latest_at:1792618852407},checks:[{id:'report1',kind:'coin',status:'done',token:mint,verdict:'PARTLY REAL',coinStamp:'SKETCHY',headline:'Some claims verified.'}]});
test('uses exact coin narrative verdict, not holder stamp',()=>{
 const rating=parseLarpRating(fixture(),mint);assert.equal(rating.label,'Partly real');assert.match(rating.report,/report1\/partly-real$/);assert.match(rating.checked,/2026/);
});
test('rejects mismatched contracts and unfinished checks',()=>{
 const data=fixture();data.address='other';assert.throws(()=>parseLarpRating(data,mint));
 const pending=fixture();pending.checks[0].status='running';assert.equal(parseLarpRating(pending,mint).label,'Not checked');
});
test('lookup reads existing report without credentials or POST',async()=>{
 const rating=await fetchLarpRating(mint,async(url,options)=>{assert.equal(url,'https://larpcheck.app/api/ca/'+mint);assert.equal(options.credentials,'omit');assert.equal(options.method,undefined);return {ok:true,json:async()=>fixture()};});
 assert.equal(rating.label,'Partly real');
});
test('failed requests are not turned into ratings',async()=>{
 await assert.rejects(fetchLarpRating(mint,async()=>({ok:false,status:429})),/429/);
});
