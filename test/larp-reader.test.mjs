import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readLarpPage} from '../extension/larp-reader.js';
const mint='Bo61v44TWErCNGF4qzu2nEWyGgPWeNrNpu1FsV8dpump';
function read({address=mint,slug='partly-real',present=true,origin='https://larpcheck.app'}={}) {
 const section={textContent:'Checked 36 minutes ago MC at check $86.5K Read the report',querySelectorAll:()=>[{textContent:'Read the report',href:origin+'/c/Eqni42jYLQ/'+slug}]};
 const document={getElementById:()=>present?{textContent:'Evidence summary.',parentElement:section}:null};
 return vm.runInNewContext(`(${readLarpPage.toString()})(${JSON.stringify(mint)})`,{URL,Date,document,location:{href:'https://larpcheck.app/'+address}});
}
test('reads exact-contract narrative rating, evidence URL and check age',()=>{
 const result=read();assert.equal(result.label,'Partly real');assert.equal(result.mint,mint);assert.equal(result.checked,'Checked 36 minutes ago');assert.equal(result.summary,'Evidence summary.');
});
test('never reuses another contract or guesses unsupported ratings',()=>{
 assert.equal(read({address:'another-coin'}),null);assert.equal(read({slug:'unknown'}),null);assert.equal(read({present:false}),null);assert.equal(read({origin:'https://example.com'}),null);
});
