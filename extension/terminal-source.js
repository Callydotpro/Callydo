function callyTerminalSource() {
 const heading=document.querySelector('h2');let scope=heading;
 for(let i=0;scope && i<5;i++,scope=scope.parentElement) {
  const address=scope.querySelector('[id^="button-copy-address-context-"]')?.id.replace('button-copy-address-context-','');
  const socials=[...scope.querySelectorAll('a[aria-label][href]')];
  if(!address || !socials.length)continue;
  const links=socials.map(a=>a.href).filter(value=>{
   try {const u=new URL(value);return /^https?:$/.test(u.protocol) && !/(^|\.)(pump\.fun|solscan\.io|dexscreener\.com|padre\.gg|t\.me|telegram\.me|larpcheck\.app)$/.test(u.hostname) && !(/^\/(search|intent)(\/|$)/.test(u.pathname) && /(^|\.)(x\.com|twitter\.com)$/.test(u.hostname));}catch{return false;}
  });
  return {mint:address,coin:heading.textContent.trim(),links:[...new Set(links)].slice(0,2)};
 }
 return null;
}
