import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
test('drag clamps to viewport and persists position without dragging buttons',async()=>{
 const handlers={},saved=[];
 const header={style:{},addEventListener:(name,fn)=>handlers[name]=fn,setPointerCapture(){}};
 const host={style:{},offsetWidth:310,offsetHeight:300,getBoundingClientRect:()=>({left:parseFloat(host.style.left)||90,top:parseFloat(host.style.top)||100})};
 const ctx={innerWidth:1000,innerHeight:700,window:{addEventListener(){}},ResizeObserver:class{observe(){}},chrome:{storage:{local:{get:async()=>({}),set:async value=>saved.push(value)}}}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('extension/panel-move.js','utf8'),ctx);
 ctx.callyMakeMovable(host,{querySelector:()=>header});await Promise.resolve();
 handlers.pointerdown({button:0,target:{closest:()=>true}});handlers.pointermove({clientX:900,clientY:600});assert.equal(host.style.left,undefined);
 handlers.pointerdown({button:0,target:{closest:()=>null},clientX:100,clientY:110,pointerId:1,preventDefault(){}});
 handlers.pointermove({clientX:2000,clientY:2000});handlers.pointerup();
 assert.equal(host.style.left,'690px');assert.equal(host.style.top,'400px');assert.equal(saved[0].panelPosition.x,690);
});
