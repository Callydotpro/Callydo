const labels={'LARP':'LARP','LIKELY LARP':'Likely LARP','PARTLY REAL':'Partly real','LIKELY REAL':'Likely real','REAL':'Real','SCAM':'Scam','UNCLEAR':'Unclear'};
function sameAddress(a,b) {
  if(typeof a!=='string' || typeof b!=='string') return false;
  return /^0x[0-9a-f]{40}$/i.test(a) && /^0x[0-9a-f]{40}$/i.test(b) ? a.toLowerCase()===b.toLowerCase() : a===b;
}
export function parseLarpRating(data,mint,now=Date.now()) {
  if(!sameAddress(data?.address,mint) || (data.token && !sameAddress(data.token.address,mint))) throw Error('LarpCheck returned a different contract.');
  const token=data.token;
  const check=Array.isArray(data.checks) ? data.checks.find(c=>c.id===token?.latest_check && c.kind==='coin' && c.status==='done' && sameAddress(c.token,mint)) : null;
  if(!check || !labels[check.verdict]) return {mint,label:'Not checked',report:'https://larpcheck.app/'+mint,summary:'No completed, recognized coin verdict is available from LarpCheck.',retrieved:now};
  if(!/^[a-zA-Z0-9_-]+$/.test(check.id)) throw Error('Invalid LarpCheck report identifier.');
  const checkedAt=Number(token.latest_at || check.created);
  return {mint,label:labels[check.verdict],report:`https://larpcheck.app/c/${check.id}/${check.verdict.toLowerCase().replaceAll(' ','-')}`,summary:String(check.headline || '').slice(0,600),checked:Number.isFinite(checkedAt)?'Checked '+new Date(checkedAt).toISOString():'Check time unavailable',retrieved:now};
}
export async function fetchLarpRating(mint,fetcher=fetch) {
  if(!/^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})$/.test(mint)) throw Error('Invalid contract.');
  const response=await fetcher('https://larpcheck.app/api/ca/'+encodeURIComponent(mint),{credentials:'omit',headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});
  if(!response.ok) throw Error(`LarpCheck lookup returned ${response.status}.`);
  return parseLarpRating(await response.json(),mint);
}
