export function coinFromURL(value) {
 try {const u=new URL(value);if(u.protocol!=='https:')return null;
 if(u.hostname==='trade.padre.gg')return u.pathname.match(/^\/trade\/solana\/([1-9A-HJ-NP-Za-km-z]{32,44})\/?$/)?.[1] || null;
 if(!['pump.fun','www.pump.fun'].includes(u.hostname))return null;
 return u.pathname.match(/^\/coin\/(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})\/?$/)?.[1] || null;
 }catch{return null;}
}
export async function currentCoin(message,sender,tabs) {
 const origin=new URL(sender.url || 'https://invalid').origin;
 if(!['https://pump.fun','https://www.pump.fun','https://trade.padre.gg'].includes(origin) || !sender.tab || sender.frameId!==0)throw Error('Cally requires a pump.fun coin page or Terminal chart.');
 const tab=await tabs.get(sender.tab.id),route=coinFromURL(tab.url);
 if(new URL(tab.url).origin!==origin)return null;
 if(origin==='https://trade.padre.gg')return route && route===message.route && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(message.mint || '') ? message.mint : null;
 return route && route===message.mint ? route : null;
}
