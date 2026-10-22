import test from 'node:test';
import assert from 'node:assert/strict';
import {UsageLimits} from '../usage-limits.mjs';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('durable usage cap survives restart, limits resets and rolls over daily',()=>{
 const dir=mkdtempSync(join(tmpdir(),'cally-quota-')),file=join(dir,'usage.sqlite');
 let q=new UsageLimits(file,{globalDaily:2,installationDaily:1});
 const day=new Date('2026-10-22T12:00:00Z');
 try {
  assert.equal(q.reserve('installation-one',day).ok,true);
  assert.equal(q.reserve('installation-one',day).ok,false);
  q.close();q=new UsageLimits(file,{globalDaily:2,installationDaily:1});
  assert.equal(q.reserve('installation-one',day).ok,false);
  assert.equal(q.reserve('installation-two',day).ok,true);
  assert.equal(q.reserve('installation-new',day).ok,false);
  assert.equal(q.reserve('installation-one',new Date('2026-10-23T00:00:00Z')).ok,true);
 }finally{q.close();rmSync(dir,{recursive:true,force:true});}
});
