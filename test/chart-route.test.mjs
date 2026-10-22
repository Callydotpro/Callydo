import test from 'node:test';
import assert from 'node:assert/strict';
import {coinFromURL,currentCoin} from '../extension/chart-route.js';
const a='Bo61v44TWErCNGF4qzu2nEWyGgPWeNrNpu1FsV8dpump';
const b='Eu7426hY9vhmkWJ1NLHqHNVbBt5nijHMFDTU6L3wpump';
const sender={url:'https://pump.fun/coin/'+a,tab:{id:42},frameId:0};
test('recognizes hex coin addresses and callout query parameters',async()=>{
 const address='0xFe189E97832DA1573e4e4Ff034F4fFC3a15c7777';
 const url='https://pump.fun/coin/'+address+'?highlight_callout=example';
 assert.equal(coinFromURL(url),address);
 assert.equal(await currentCoin({mint:address},sender,{get:async()=>({url})}),address);
 assert.equal(coinFromURL('https://pump.fun/coin/0x123'),null);
});
test('uses current tab route when sender still reports previous coin',async()=>{
 assert.equal(await currentCoin({mint:b},sender,{get:async()=>({url:'https://pump.fun/coin/'+b})}),b);
});
test('initial homepage document can navigate to a coin without reload',async()=>{
 assert.equal(await currentCoin({mint:b},{...sender,url:'https://pump.fun/'},{get:async()=>({url:'https://pump.fun/coin/'+b})}),b);
});
test('stale requests produce retry rather than a refresh error',async()=>{
 assert.equal(await currentCoin({mint:a},sender,{get:async()=>({url:'https://pump.fun/coin/'+b})}),null);
 assert.equal(await currentCoin({mint:a},sender,{get:async()=>({url:'https://pump.fun/'})}),null);
});
test('rejects foreign origins and subframes',async()=>{
 const tabs={get:async()=>({url:'https://pump.fun/coin/'+a})};
 await assert.rejects(currentCoin({mint:a},{...sender,url:'https://example.com'},tabs));
 await assert.rejects(currentCoin({mint:a},{...sender,frameId:1},tabs));
 assert.equal(coinFromURL('https://example.com/coin/'+a),null);
});
test('Terminal separates the pair route from the actual contract',async()=>{
 const pair='BNisCQ9FrhkW49MaE9GByQqQ8ZFFhdREPebkVNreW7QQ';
 const url='https://trade.padre.gg/trade/solana/'+pair;
 const terminal={...sender,url};const tabs={get:async()=>({url})};
 assert.equal(coinFromURL(url),pair);
 assert.equal(await currentCoin({mint:a,route:pair},terminal,tabs),a);
 assert.equal(await currentCoin({mint:a,route:b},terminal,tabs),null);
 assert.equal(await currentCoin({mint:'bad',route:pair},terminal,tabs),null);
 assert.equal(coinFromURL(url.replace('/solana/','/ethereum/')),null);
});
