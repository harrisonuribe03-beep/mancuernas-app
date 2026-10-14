/* Niveles y rangos */
/* ---------- nivel y rango ---------- */
const RANKS=[[1,'Novato'],[3,'Aprendiz'],[6,'Guerrero'],[10,'Veterano'],[15,'Maestro'],[20,'Leyenda']];
const xpOf=h=>40+(h.sets||0)*5+((h.pr||[]).length)*25+(h.dur>=1500?20:0);
function level(xp){
  let lv=1,base=0,need=150;while(xp>=base+need){base+=need;lv++;need=150+50*(lv-1);}
  let r=RANKS[0];RANKS.forEach(x=>{if(lv>=x[0])r=x;});const nx=RANKS.find(x=>x[0]>lv);
  return {lv,xp,cur:xp-base,need,rank:r[1],ri:RANKS.indexOf(r),next:nx?nx[1]:null,nextLv:nx?nx[0]:null};
}
/* insignias de rango (SVG propio) */
const EMB=[
  {c:['#f3b27a','#a35a26','#6b3714'],shape:'circle',icon:'chev1'},
  {c:['#f1f4f9','#9aa6ba','#5d687c'],shape:'shield',icon:'chev2'},
  {c:['#ffe58f','#d99a0b','#8a5a00'],shape:'shield',icon:'star',wings:1},
  {c:['#a8f5ec','#14a397','#0b5f58'],shape:'hex',icon:'dumb',wings:1},
  {c:['#dcc2ff','#7c3aed','#3f1691'],shape:'diamond',icon:'crown',wings:2},
  {c:['#ffb199','#e11d48','#7a0a24'],shape:'star8',icon:'flame',wings:2,gold:1}];
let EMBN=0;
function emblem(ri,size){
  const E=EMB[Math.max(0,Math.min(5,ri))],id='em'+(++EMBN),[c1,c2,c3]=E.c,s=size||48;
  const shapes={circle:'<circle cx="32" cy="33" r="21"/>',shield:'<path d="M32 9 52 16v15c0 13-9 21-20 25C21 52 12 44 12 31V16z"/>',
    hex:'<path d="M32 8 53 20v24L32 56 11 44V20z"/>',diamond:'<path d="M32 6 56 32 32 58 8 32z"/>',
    star8:'<path d="M32 5l6.5 10.3 12-2.6-2.6 12L58.2 31l-10.3 6.5 2.6 12-12-2.6L32 57.2l-6.5-10.3-12 2.6 2.6-12L5.8 31l10.3-6.5-2.6-12 12 2.6z"/>'};
  const icons={chev1:'<path d="M23 36l9-8 9 8" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
    chev2:'<path d="M23 31l9-8 9 8M23 40l9-8 9 8" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
    star:'<path d="M32 21l3.5 7.2 7.9 1.1-5.7 5.6 1.4 7.9L32 39.1l-7.1 3.7 1.4-7.9-5.7-5.6 7.9-1.1z" fill="#fff"/>',
    dumb:'<path d="M22 32h20" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/><rect x="18.5" y="25" width="5" height="14" rx="2" fill="#fff"/><rect x="40.5" y="25" width="5" height="14" rx="2" fill="#fff"/><rect x="14.5" y="28" width="3.5" height="8" rx="1.5" fill="#fff"/><rect x="46" y="28" width="3.5" height="8" rx="1.5" fill="#fff"/>',
    crown:'<path d="M21 40l-2-14 8 6 5-9 5 9 8-6-2 14z" fill="#fff"/><rect x="21" y="41.5" width="22" height="3.5" rx="1.5" fill="#fff"/>',
    flame:'<path d="M32 18c2 6-4 8-4 14 0 3 2 5 4.5 5 3.5 0 5-3 4-7 4.5 2.5 6.5 6.5 6.5 9.5A11 11 0 0 1 32 50a11 11 0 0 1-11-10.5C21 31 30 26 32 18z" fill="#fff"/>'};
  const wing=n=>{let w='';for(let i=0;i<n+2;i++){const y=26+i*6,l=14-i*2.5;w+=`<path d="M12 ${y} q-${l*.6} -3 -${l} ${2+i}" fill="none" stroke="url(#${id}w)" stroke-width="3.2" stroke-linecap="round"/>`;}return `<g>${w}</g><g transform="translate(64,0) scale(-1,1)">${w}</g>`;};
  return `<svg class="emb" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient><linearGradient id="${id}w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c1}" stop-opacity=".2"/><stop offset="1" stop-color="${c2}"/></linearGradient><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  ${E.wings?wing(E.wings):''}<g fill="url(#${id})" stroke="${E.gold?'#fde68a':c3}" stroke-width="${E.gold?2.4:1.6}" stroke-linejoin="round">${shapes[E.shape]}</g><g fill="url(#${id}s)">${shapes[E.shape]}</g>${icons[E.icon]}</svg>`;
}
const myLevel=hist=>{const H=hist||S.history;return level(H.reduce((a,h)=>a+xpOf(h),0)+(typeof extraXP==='function'?extraXP(H):0));};
function rankCard(full){
  const L=myLevel(),pc=Math.round(L.cur/L.need*100);
  const nxt=L.next?`${L.next} en el nivel ${L.nextLv}`:'Rango máximo';
  let h=`<${full?'div':'button'} class="card rank" ${full?'':'data-act="tab" data-v="me"'}><span class="rkimg"><img src="img/hero.webp" alt=""><span class="rkem">${emblem(L.ri,30)}</span></span><span class="rk"><span class="rkt"><b>Nivel ${L.lv}</b><span class="rkn r${L.ri}">${L.rank}</span></span><span class="xpbar"><i style="width:${pc}%"></i></span><small>${NF.format(L.cur)} / ${NF.format(L.need)} XP · ${nxt}</small></span></${full?'div':'button'}>`;
  if(full)h+=`<div class="ladder">${RANKS.map((r,i)=>`<span class="${i<=L.ri?'on':''} ${i===L.ri?'cur':''}">${emblem(i,34)}<b>${r[1]}</b><small>Nv ${r[0]}</small></span>`).join('')}</div><p class="sub" style="font-size:.8rem;margin:8px 2px 0">Ganas XP por cada entrenamiento, por cada serie y por cada récord.</p>`;
  return h;
}

