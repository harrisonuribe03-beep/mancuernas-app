// Figura articulada en SVG con el vestuario del personaje de Mancuernas (vista de lado, mirando a la derecha por defecto)
const SK='#eab88e',SK2='#d39a6f',INK='#16130f',CL='#1d1a17',CL2='#2c2824',WOOD='#7b4a2b',WOOD2='#5c361d';
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],add=(a,b)=>[a[0]+b[0],a[1]+b[1]],mul=(a,k)=>[a[0]*k,a[1]*k];
const len=a=>Math.hypot(a[0],a[1]),nrm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l]},per=a=>[-a[1],a[0]];
const f=n=>n.toFixed(1);
// tubo con extremos redondos y ancho variable (wa en a, wb en b); bulge = engrosamiento al centro
function tube(a,b,wa,wb,fill,bul=0,side=1){
  const d=nrm(sub(b,a)),p=per(d),L=len(sub(b,a)),m=add(a,mul(d,L*.45));
  const wm=(wa+wb)/2+bul,ra=wa/2,rb=wb/2,K=4/3;
  const A1=add(a,mul(p,ra)),A2=add(a,mul(p,-ra)),B1=add(b,mul(p,rb)),B2=add(b,mul(p,-rb));
  const M1=add(m,mul(p,wm/2+(side>0?bul*.4:0))),M2=add(m,mul(p,-wm/2-(side<0?bul*.4:0)));
  const cB1=add(B1,mul(d,K*rb)),cB2=add(B2,mul(d,K*rb)),cA2=add(A2,mul(d,-K*ra)),cA1=add(A1,mul(d,-K*ra));
  const q=v=>f(v[0])+' '+f(v[1]);
  return `<path d="M${q(A1)} Q${q(M1)} ${q(B1)} C${q(cB1)} ${q(cB2)} ${q(B2)} Q${q(M2)} ${q(A2)} C${q(cA2)} ${q(cA1)} ${q(A1)}Z" fill="${fill}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>`;
}
function circle(c,r,fill,sw=3.2){return `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;}
// tenis: del tobillo hacia la punta
function shoe(ank,toe){const d=nrm(sub(toe,ank)),p=per(d);const L=len(sub(toe,ank))+8;
  const s=add(ank,mul(d,-10)),e=add(ank,mul(d,L));const up=p[1]<0?p:mul(p,-1); // hacia arriba del pie
  const a=add(s,mul(up,11)),b=add(e,mul(up,4)),c=add(e,mul(up,-9)),dd=add(s,mul(up,-9));
  return `<path d="M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])} Q${f(e[0]+d[0]*8)} ${f(e[1]+d[1]*8)} ${f(c[0])} ${f(c[1])} L${f(dd[0])} ${f(dd[1])} Q${f(s[0]-d[0]*6)} ${f(s[1]-d[1]*6)} ${f(a[0])} ${f(a[1])}Z" fill="${CL}" stroke="${INK}" stroke-width="3"/>
  <path d="M${f(c[0])} ${f(c[1])} L${f(dd[0])} ${f(dd[1])}" stroke="#f1ece4" stroke-width="5" stroke-linecap="round"/>`;}
function hand(c,dir){return `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="13" ry="11" transform="rotate(${dir||0} ${f(c[0])} ${f(c[1])})" fill="${SK}" stroke="${INK}" stroke-width="3"/>`;}
function arm(sh,el,wr,hl,hdir,red){let s=tube(sh,el,30,22,SK,5)+tube(el,wr,22,15,SK,4);
  if(red)s+=red.map(k=>k==='bi'?tube(add(sh,mul(sub(el,sh),.18)),add(sh,mul(sub(el,sh),.82)),12,9,'#d4231a'):k==='tri'?tube(add(sh,mul(sub(el,sh),.2)),add(sh,mul(sub(el,sh),.85)),11,8,'#d4231a'):'').join('');
  return s+hand(wr,hdir);}
function leg(hip,kn,an,toe,red){let s=tube(hip,kn,44,30,SK,6)+tube(kn,an,30,17,SK,8,-1);
  if(red)s+=red.map(k=>k==='quad'?tube(add(hip,mul(sub(kn,hip),.3)),add(hip,mul(sub(kn,hip),.88)),16,12,'#d4231a'):k==='calf'?tube(add(kn,mul(sub(an,kn),.12)),add(kn,mul(sub(an,kn),.55)),14,10,'#d4231a'):'').join('');
  // short: tapa la parte de arriba del muslo
  const sk=add(hip,mul(sub(kn,hip),.62));s+=tube(hip,sk,50,40,CL);
  return s+shoe(an,toe);}
function torso(sh,hip,red,face=1){const d=nrm(sub(sh,hip)),p=per(d),fr=mul(p,face); // fr apunta al pecho
  const P=(base,w,k)=>add(base,mul(fr,w*k));
  const top=add(sh,mul(d,6)),mid=add(hip,mul(sub(sh,hip),.6)),low=add(hip,mul(d,-4));
  const cF=P(mid,27,1),cB=P(mid,21,-1);
  const path=`M${f(P(top,22,1)[0])} ${f(P(top,22,1)[1])} Q${f(cF[0])} ${f(cF[1])} ${f(P(low,22,1)[0])} ${f(P(low,22,1)[1])} L${f(P(low,22,-1)[0])} ${f(P(low,22,-1)[1])} Q${f(cB[0])} ${f(cB[1])} ${f(P(top,24,-1)[0])} ${f(P(top,24,-1)[1])}Z`;
  let s=`<path d="${path}" fill="${CL}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>`;
  s+=`<path d="M${f(P(top,6,1)[0])} ${f(P(top,6,1)[1])} Q${f(P(mid,10,1)[0])} ${f(P(mid,10,1)[1])} ${f(P(low,4,1)[0])} ${f(P(low,4,1)[1])}" stroke="${CL2}" stroke-width="5" fill="none"/>`;
  if(red&&red.includes('chest')){const a=P(add(sh,mul(d,-18)),17,1),b=P(add(sh,mul(d,-50)),19,1);s+=tube(a,b,16,12,'#d4231a');}
  if(red&&red.includes('lats')){const a=P(add(sh,mul(d,-24)),14,-1),b=P(add(sh,mul(d,-70)),12,-1);s+=tube(a,b,15,9,'#d4231a');}
  if(red&&red.includes('abs')){const a=P(add(sh,mul(d,-60)),20,1),b=P(add(hip,mul(d,12)),18,1);s+=tube(a,b,12,10,'#d4231a');}
  // cadera / short
  s+=`<path d="M${f(P(low,24,1)[0])} ${f(P(low,24,1)[1])} L${f(P(add(low,mul(d,-26)),26,1)[0])} ${f(P(add(low,mul(d,-26)),26,1)[1])} L${f(P(add(low,mul(d,-26)),26,-1)[0])} ${f(P(add(low,mul(d,-26)),26,-1)[1])} L${f(P(low,24,-1)[0])} ${f(P(low,24,-1)[1])}Z" fill="${CL}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  return s;}
function head(c,face=1,tilt=0){ // face 1 = mirando a la derecha
  const g=`<g transform="translate(${f(c[0])} ${f(c[1])}) rotate(${tilt}) scale(${face} 1)">
  <ellipse cx="0" cy="2" rx="22" ry="25" fill="${SK}" stroke="${INK}" stroke-width="3.2"/>
  <path d="M-8 6 Q-4 10 -9 13" stroke="${INK}" stroke-width="2" fill="none"/>
  <ellipse cx="-6" cy="6" rx="5" ry="7" fill="${SK2}" stroke="${INK}" stroke-width="2"/>
  <path d="M-24 4 C-30 -18 -14 -34 6 -32 C14 -36 26 -30 26 -18 L30 -14 L22 -12 L26 -6 L16 -8 L14 -14 C6 -10 -2 -12 -6 -6 L-10 4 L-14 -2 L-18 8 Z" fill="${INK}"/>
  <path d="M11 -2 l6 -1" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
  <ellipse cx="14" cy="4" rx="2.6" ry="3.4" fill="${INK}"/>
  <path d="M21 18 q-4 3 -8 2" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>`;return g;}
function neck(sh,hd){return tube(sh,hd,20,18,SK);}
// --- utilería ---
const bar=(x1,x2,y,h)=>`<rect x="${x1-8}" y="${y-4}" width="16" height="${h}" rx="3" fill="${INK}"/><rect x="${x2-8}" y="${y-4}" width="16" height="${h}" rx="3" fill="${INK}"/><rect x="${x1-14}" y="${y+h-8}" width="28" height="8" rx="2" fill="${INK}"/><rect x="${x2-14}" y="${y+h-8}" width="28" height="8" rx="2" fill="${INK}"/><rect x="${x1-12}" y="${y-5}" width="${x2-x1+24}" height="10" rx="5" fill="${INK}"/>`;
const pbar=(x,y,len,h)=>`<rect x="${x}" y="${y-5}" width="${len}" height="10" rx="5" fill="${INK}"/><rect x="${x+12}" y="${y}" width="12" height="${h}" fill="${INK}"/><rect x="${x+len-24}" y="${y}" width="12" height="${h}" fill="${INK}"/>`;
const bench=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="16" rx="3" fill="${WOOD}" stroke="${INK}" stroke-width="3"/><rect x="${x+4}" y="${y+16}" width="${w-8}" height="7" fill="${WOOD2}" stroke="${INK}" stroke-width="2.5"/><rect x="${x+14}" y="${y+22}" width="13" height="${h-22}" fill="${WOOD2}" stroke="${INK}" stroke-width="3"/><rect x="${x+w-27}" y="${y+22}" width="13" height="${h-22}" fill="${WOOD2}" stroke="${INK}" stroke-width="3"/>`;
const shadow=(cx,y,rx)=>`<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="9" fill="${INK}" opacity=".10"/>`;
module.exports={tube,circle,shoe,hand,arm,leg,torso,head,neck,bar,pbar,bench,shadow,add,sub,mul,nrm,INK};
