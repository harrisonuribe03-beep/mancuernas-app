/* Figuras sólidas con músculo resaltado y animación por interpolación de poses */
const W2={tor:9.6,ua:4.6,fa:3.9,th:6.2,sh:4.7,neck:3.6,foot:3.3,head:5.3};

function posePts(q){
  const s=skel(q);
  const dbs=Array.isArray(q.db)?q.db:[q.db,q.db];
  const db=[0,1].map(i=>{
    if(!s.arms[i]||dbs[i]==null) return null;
    const t=dbs[i], fore=ANG(s.arms[i][0],s.arms[i][1]);
    return t==='end'?{t:'end',a:0}:{t:'bar',a:t==='perp'?fore+90:t};
  });
  return {v:s.v,p:s.p,neck:s.neck,head:s.head,ha:s.ha,sc:s.sc,sh:s.sh,hp:s.hp,arms:s.arms,legs:s.legs,feet:s.feet,db};
}
function lp(a,b,t,k){
  if(a==null) return b; if(b==null) return a;
  if(typeof a==='number'){
    if(k==='ha'||k==='a'){let d=b-a;while(d>180)d-=360;while(d<-180)d+=360;return a+d*t;}
    return a+(b-a)*t;
  }
  if(typeof a==='string') return a;
  if(Array.isArray(a)) return a.map((x,i)=>lp(x,b[i],t,k));
  const o={};for(const key in a)o[key]=lp(a[key],b[key],t,key);return o;
}
const f1=n=>(+n).toFixed(2);
const sg=(a,b,w,c)=>`<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}" stroke-width="${w}" class="${c}"/>`;

function dbSVG(w,d,far){
  if(!d) return '';
  const c=far?'mtf':'mt';
  if(d.t==='end') return `<circle cx="${f1(w[0])}" cy="${f1(w[1])}" r="3.7" class="${c}"/><circle cx="${f1(w[0])}" cy="${f1(w[1])}" r="1.2" class="mth"/>`;
  const a=d.a;let s=sg(P(w,a,4.6),P(w,a+180,4.6),1.6,c+'l');
  for(const sgn of [0,180]){
    const c1=P(w,a+sgn,3.4),c2=P(w,a+sgn,5.6);
    s+=sg(P(c1,a+90,3.4),P(c1,a-90,3.4),2.6,c+'l')+sg(P(c2,a+90,2.4),P(c2,a-90,2.4),1.8,c+'l');
  }
  return s;
}

function drawPose(Q,hl){
  const H=new Set(hl||[]);
  const cls=(part,far)=>H.has(part)?(far?'mf':'mn'):(far?'bf':'bn');
  const limbArm=(i,far)=>{const a=Q.arms[i];if(!a)return '';
    return sg(Q.sh[i],a[0],W2.ua,cls('ua',far))+sg(a[0],a[1],W2.fa,cls('fa',far))+`<circle cx="${f1(a[1][0])}" cy="${f1(a[1][1])}" r="2.1" class="${far?'bf':'bn'}f"/>`;};
  const limbLeg=(i,far)=>{const l=Q.legs[i];if(!l)return '';
    let s=sg(Q.hp[i],l[0],W2.th,cls('th',far))+sg(l[0],l[1],W2.sh,cls('sh',far));
    if(Q.feet[i])s+=sg(l[1],Q.feet[i],W2.foot,far?'bf':'bn');return s;};
  const delt=(i,far)=>H.has('shd')&&Q.arms[i]?`<circle cx="${f1(Q.sh[i][0])}" cy="${f1(Q.sh[i][1])}" r="3.3" class="${far?'mf':'mn'}f"/>`:'';
  const mid=[(Q.p[0]+Q.sc[0])/2,(Q.p[1]+Q.sc[1])/2];
  const head=`<circle cx="${f1(Q.head[0])}" cy="${f1(Q.head[1])}" r="${W2.head}" class="bnf"/>`;
  let o='';
  if(Q.v==='side'){
    o+=limbLeg(1,true)+limbArm(1,true)+delt(1,true)+dbSVG(Q.arms[1]?Q.arms[1][1]:null,Q.db[1],true);
    o+=sg(Q.sc,Q.neck,W2.neck,'bn');
    o+=sg(Q.p,Q.sc,W2.tor,'bn');
    if(H.has('core'))o+=sg(Q.p,mid,W2.tor,'mn');
    if(H.has('tor'))o+=sg(mid,Q.sc,W2.tor,'mn');
    o+=head;
    o+=limbLeg(0,false)+limbArm(0,false)+delt(0,false)+dbSVG(Q.arms[0]?Q.arms[0][1]:null,Q.db[0],false);
  }else{
    o+=limbLeg(0,false)+limbLeg(1,false);
    o+=sg(Q.sc,Q.neck,W2.neck,'bn');
    const m0=[(Q.sh[0][0]+Q.hp[0][0])/2,(Q.sh[0][1]+Q.hp[0][1])/2],m1=[(Q.sh[1][0]+Q.hp[1][0])/2,(Q.sh[1][1]+Q.hp[1][1])/2];
    const poly=pts=>'M'+pts.map(p=>f1(p[0])+' '+f1(p[1])).join('L')+'Z';
    o+=`<path d="${poly([Q.sh[0],Q.sh[1],Q.hp[1],Q.hp[0]])}" class="bnp"/>`;
    if(H.has('tor'))o+=`<path d="${poly([Q.sh[0],Q.sh[1],m1,m0])}" class="mnp"/>`;
    if(H.has('core'))o+=`<path d="${poly([m0,m1,Q.hp[1],Q.hp[0]])}" class="mnp"/>`;
    o+=head;
    o+=limbArm(0,false)+limbArm(1,false)+delt(0,false)+delt(1,false);
    o+=dbSVG(Q.arms[0]?Q.arms[0][1]:null,Q.db[0],false)+dbSVG(Q.arms[1]?Q.arms[1][1]:null,Q.db[1],false);
  }
  return o;
}

function props2(list,v){
  let o='';
  if(v!=='top') o+=`<ellipse cx="50" cy="93" rx="44" ry="2" class="fl"/>`;
  for(const p of list){
    if(p.k==='chair'||p.k==='bench'){
      const th=p.k==='bench'?4:3.2;
      if(p.back==='l') o+=`<rect x="${p.x1}" y="${p.y-22}" width="3" height="${22+th}" rx="1.4" class="pr"/>`;
      o+=`<rect x="${p.x1+1}" y="${p.y}" width="2.4" height="${92.6-p.y}" rx="1" class="pr2"/><rect x="${p.x2-3.4}" y="${p.y}" width="2.4" height="${92.6-p.y}" rx="1" class="pr2"/>`;
      o+=`<rect x="${p.x1}" y="${p.y}" width="${p.x2-p.x1}" height="${th}" rx="1.6" class="pr"/>`;
    }else if(p.k==='box'){
      o+=`<rect x="${p.x1}" y="${p.y}" width="${p.x2-p.x1}" height="${92.6-p.y}" rx="2" class="pr"/>`;
    }else if(p.k==='mat'){
    }
  }
  return o;
}
const BOX={};
function exBox(ex){
  if(BOX[ex.n]) return BOX[ex.n];
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const add=(x,y,r)=>{x0=Math.min(x0,x-r);y0=Math.min(y0,y-r);x1=Math.max(x1,x+r);y1=Math.max(y1,y+r);};
  const walk=o=>{if(!o)return;if(Array.isArray(o)&&o.length===2&&typeof o[0]==='number'){add(o[0],o[1],4.5);return;}
    if(Array.isArray(o))o.forEach(walk);else if(typeof o==='object')for(const k in o)if(k!=='db')walk(o[k]);};
  ex.f.forEach(q=>{const Q=posePts(q);walk(Q);add(Q.head[0],Q.head[1],6.5);
    [0,1].forEach(i=>{if(Q.arms[i]&&Q.db[i])add(Q.arms[i][1][0],Q.arms[i][1][1],7);});});
  (ex.pr||[]).forEach(p=>{if(p.x1!=null){add(p.x1,p.y-(p.back?22:0),1);add(p.x2,92.6,1);}});
  if(ex.f[0].v!=='top')y1=Math.max(y1,95.5);
  let w=x1-x0+8,h=y1-y0+8,cx=(x0+x1)/2,cy=(y0+y1)/2;
  w=Math.max(w,58);h=Math.max(h,58);
  if(w/h>1.5)h=w/1.5; if(w/h<.85)w=h*.85;
  return BOX[ex.n]=`${f1(cx-w/2)} ${f1(cy-h/2)} ${f1(w)} ${f1(h)}`;
}
function figStatic(ex,i){
  const q=ex.f[Math.min(i,ex.f.length-1)];const hl=(INFO[ex.n]||{}).hl;
  return `<svg class="fig" viewBox="${exBox(ex)}" aria-hidden="true"><g>${props2(ex.pr||[],q.v)}</g><g>${drawPose(posePts(q),hl)}</g></svg>`;
}
function figAnimated(ex){
  const q=ex.f[0];
  return `<svg class="fig" viewBox="${exBox(ex)}" role="img" aria-label="${ex.n}" data-anim="${ex.n}"><g>${props2(ex.pr||[],q.v)}</g><g class="pose">${drawPose(posePts(q),(INFO[ex.n]||{}).hl)}</g></svg>`;
}
/* animador: un solo bucle para todas las figuras animadas visibles */
const ANIM={cache:{},raf:0};
function animStart(){
  if(ANIM.raf) return;
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loop=t=>{
    const els=document.querySelectorAll('svg[data-anim]');
    if(!els.length){ANIM.raf=0;return;}
    els.forEach(el=>{
      const n=el.getAttribute('data-anim');const ex=EXMAP[n];if(!ex||ex.f.length<2)return;
      let c=ANIM.cache[n];if(!c)c=ANIM.cache[n]={a:posePts(ex.f[0]),b:posePts(ex.f[1])};
      const T=3600, ph=(t%T)/T;
      let k;
      if(reduce)k=0;
      else if(ph<.14)k=0; else if(ph<.5)k=(ph-.14)/.36; else if(ph<.64)k=1; else k=1-(ph-.64)/.36;
      k=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      const g=el.querySelector('.pose');
      const key=Math.round(k*60);
      if(g&&g._k!==key){g._k=key;g.innerHTML=drawPose(lp(c.a,c.b,key/60),(INFO[n]||{}).hl);}
    });
    ANIM.raf=requestAnimationFrame(loop);
  };
  ANIM.raf=requestAnimationFrame(loop);
}
