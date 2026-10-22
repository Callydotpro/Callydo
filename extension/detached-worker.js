import {currentCoin,coinFromURL} from './chart-route.js';
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 if(message.type==='cally-popout') {
  (async()=>{
   if(!await currentCoin(message,sender,chrome.tabs))throw Error('Wait for the current coin to load.');
   const url=chrome.runtime.getURL('detached.html')+'?tab='+sender.tab.id;
   await chrome.windows.create({url,type:'popup',width:380,height:510});return {ok:true};
  })().then(reply,e=>reply({error:e.message}));return true;
 }
 if(message.type==='cally-detached') {
  (async()=>{
   if(!sender.url?.startsWith(chrome.runtime.getURL('detached.html')+'?'))throw Error('Invalid panel.');
   const bound=Number(new URL(sender.url).searchParams.get('tab'));
   if(!Number.isInteger(bound) || bound!==message.tab)throw Error('Invalid source tab.');
   const tab=await chrome.tabs.get(bound);
   if(!coinFromURL(tab.url))throw Error('Open a coin in the linked chart tab.');
   return chrome.tabs.sendMessage(bound,{type:'cally-panel-command',action:message.action,previous:message.previous,mint:message.mint},{frameId:0});
  })().then(reply,e=>reply({error:e.message}));return true;
 }
});
