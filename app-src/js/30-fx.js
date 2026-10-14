/* Celebraciones: confeti y destellos (respeta "reducir movimiento") */
const FX_REDUCE=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}};
function confetti(kind){
  if(FX_REDUCE())return;
  const c=document.createElement('canvas');c.className='fx';const dpr=Math.min(2,window.devicePixelRatio||1);
  const W=innerWidth,H=innerHeight;c.width=W*dpr;c.height=H*dpr;document.body.appendChild(c);const g=c.getContext('2d');g.scale(dpr,dpr);
  const acc=getComputedStyle(document.documentElement).getPropertyValue('--acc').trim()||'#3d5afe';
  const cols=kind==='gold'?['#fbbf24','#f59e0b','#fde68a','#ffffff','#fb923c']:[acc,'#fbbf24','#22c55e','#ffffff','#f472b6','#60a5fa'];
  const N=kind==='small'?40:kind==='gold'?90:120,P=[];
  for(let i=0;i<N;i++){const fromL=i%2===0,ang=(fromL?-60:-120)*Math.PI/180+(Math.random()-.5)*.9,sp=7+Math.random()*9;
    P.push({x:kind==='small'?W/2:(fromL?-10:W+10),y:kind==='small'?H*.35:H*.62,vx:Math.cos(ang)*sp*(kind==='small'?.6:1),vy:Math.sin(ang)*sp,w:5+Math.random()*6,h:8+Math.random()*8,r:Math.random()*6,vr:(Math.random()-.5)*.35,c:cols[i%cols.length],t:Math.random()*10});}
  if(kind==='small')P.forEach(p=>{const a=Math.random()*Math.PI*2,sp=3+Math.random()*7;p.vx=Math.cos(a)*sp;p.vy=Math.sin(a)*sp-4;});
  const t0=performance.now(),D=kind==='small'?1300:2300;
  const step=t=>{const k=(t-t0)/D;g.clearRect(0,0,W,H);
    P.forEach(p=>{p.vy+=.28;p.vx*=.985;p.vy*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.t+=.15;
      g.save();g.globalAlpha=Math.max(0,1-Math.max(0,k-.6)/.4);g.translate(p.x,p.y);g.rotate(p.r);g.scale(1,Math.cos(p.t));g.fillStyle=p.c;g.fillRect(-p.w/2,-p.h/2,p.w,p.h);g.restore();});
    if(k<1)requestAnimationFrame(step);else c.remove();};
  requestAnimationFrame(step);
}
