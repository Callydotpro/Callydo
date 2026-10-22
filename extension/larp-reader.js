// Runs in LarpCheck's normal browser page. Reads only public, displayed verdicts.
export function readLarpPage(expectedMint) {
  const url=new URL(location.href);
  if(url.hostname!=='larpcheck.app' || decodeURIComponent(url.pathname)!=='/'+expectedMint) return null;
  const headline=document.getElementById('coin-verdict');
  if(!headline) return null;
  const section=headline.parentElement;
  const report=[...section.querySelectorAll('a[href]')].find(a=>a.textContent.includes('Read the report'));
  if(!report) return null;
  const reportURL=new URL(report.href);
  if(reportURL.origin!==url.origin) return null;
  const slug=reportURL.pathname.split('/').filter(Boolean).at(-1);
  const labels={'larp':'LARP','likely-larp':'Likely LARP','partly-real':'Partly real','likely-real':'Likely real','real':'Real'};
  if(!labels[slug]) return null;
  return {mint:expectedMint,label:labels[slug],report:reportURL.href,summary:headline.textContent.trim().slice(0,600),checked:section.textContent.match(/Checked\s+[^·\n]+?(?=MC at check|Read the report|$)/i)?.[0]?.trim().slice(0,100) || 'Check time unavailable',retrieved:Date.now()};
}
