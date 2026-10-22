function callyMakeMovable(host,root) {
 const header=root.querySelector('header');header.style.cssText='cursor:move;touch-action:none;user-select:none';header.title='Drag to move Cally';
 let drag=null;
 const place=(x,y)=>{host.style.left=Math.max(0,Math.min(x,innerWidth-host.offsetWidth))+'px';host.style.top=Math.max(0,Math.min(y,innerHeight-Math.min(host.offsetHeight,innerHeight)))+'px';host.style.bottom='auto';};
 chrome.storage.local.get('panelPosition').then(({panelPosition:p})=>{if(p && Number.isFinite(p.x) && Number.isFinite(p.y))place(p.x,p.y);}).catch(()=>{});
 header.addEventListener('pointerdown',e=>{if(e.button!==0 || e.target.closest('button'))return;const r=host.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};header.setPointerCapture(e.pointerId);e.preventDefault();});
 header.addEventListener('pointermove',e=>{if(drag)place(e.clientX-drag.x,e.clientY-drag.y);});
 const stop=()=>{if(!drag)return;drag=null;const r=host.getBoundingClientRect();chrome.storage.local.set({panelPosition:{x:r.left,y:r.top}}).catch(()=>{});};
 header.addEventListener('pointerup',stop);header.addEventListener('pointercancel',stop);
 window.addEventListener('resize',()=>{const r=host.getBoundingClientRect();place(r.left,r.top);});
 new ResizeObserver(()=>{if(host.style.top && host.offsetWidth){const r=host.getBoundingClientRect();place(r.left,r.top);}}).observe(host);
}

