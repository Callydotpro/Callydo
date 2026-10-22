import {currentCoin} from './chart-route.js';
import {fetchLarpRating} from './larp-api.js';
const pending=new Map();
export async function lookupLarp(message,sender) {
  const mint=await currentCoin(message,sender,chrome.tabs);
  if(!mint) return {retry:true};
  const cacheKey='larp-api:'+mint;
  const cached=(await chrome.storage.session.get(cacheKey))[cacheKey];
  if(cached && Date.now()-cached.retrieved<300000) return cached;
  if(pending.has(mint)) return pending.get(mint);
  const job=(async()=>{
    try {
      const rating=await fetchLarpRating(mint);
      await chrome.storage.session.set({[cacheKey]:rating});
      return rating;
    } catch(error) {
      return {label:'Unavailable',mint,report:'https://larpcheck.app/'+mint,summary:error.message || 'LarpCheck is temporarily unavailable. Cally will retry automatically.',retrieved:Date.now()};
    }
  })();
  pending.set(mint,job);
  try{return await job;}finally{pending.delete(mint);}
}
