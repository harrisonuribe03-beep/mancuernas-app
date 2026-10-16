/* Registro de comidas: lo que de verdad comes, comparado con tu meta del día.
   - Un registro por día (comidas con alimentos, agua). Se guarda en el teléfono y, si hay cuenta, en la nube (mcf-AAAA-MM-DD).
   - Alimentos de la base (FDB_X + los del menú), alimentos propios y comidas guardadas (mc-foodlib).
   - Cada alimento registrado guarda sus valores calculados: si la base cambia, el historial no se mueve. */

const FSLOT={des:'Desayuno',mm:'Media mañana',alm:'Almuerzo',onc:'Onces',cen:'Cena',otr:'Otros'};
const fdk=d=>{d=d instanceof Date?d:new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const fdDate=k=>{const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d,12);};
const fdShift=(k,n)=>{const d=fdDate(k);d.setDate(d.getDate()+n);return fdk(d);};
const fToday=()=>fdk(new Date());
const fid=()=>'fi'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const r1=x=>Math.round(x*10)/10;
S.food=LS.get('mc-food',{});
S.flib=Object.assign({foods:[],meals:[],at:0},LS.get('mc-foodlib',{}));

/* ---------- guardado ---------- */
function fday(k){const d=S.food[k];return d?{items:(d.items||[]).slice(),water:d.water||0,at:d.at||0}:{items:[],water:0,at:0};}
// Los días vacíos se guardan igual (con fecha de cambio) para que la nube no los reviva
// tg: la meta de ese día cuando se registró (las estadísticas comparan contra la meta que tenías, no la de hoy)
function fsave(k,day){day.at=Date.now();let tg=0;try{const T=ftarget(k);tg=T?T.kcal:0;}catch(e){}
  S.food[k]={items:day.items,water:day.water||0,at:day.at,tg};LS.set('mc-food',S.food);
  if(COL)COL.doc('mcf-'+k).set(S.food[k]).catch(()=>{});
  if(typeof fremDirty==='function')fremDirty();}
function flibSave(){S.flib.at=Date.now();LS.set('mc-foodlib',S.flib);if(COL)COL.doc('mc-foodlib').set(JSON.parse(JSON.stringify(S.flib))).catch(()=>{});}
// Une lo del teléfono con lo de la nube: en cada día gana el último cambio
async function mergeFood(rdays,rlib){
  for(const k of Object.keys(rdays)){const r=rdays[k],l=S.food[k];if(!l||(r.at||0)>(l.at||0))S.food[k]={items:r.items||[],water:r.water||0,at:r.at||0,tg:r.tg||0};}
  for(const k of Object.keys(S.food)){const r=rdays[k],l=S.food[k];if(!r||(l.at||0)>(r.at||0)){try{await COL.doc('mcf-'+k).set({items:l.items,water:l.water||0,at:l.at||0,tg:l.tg||0});}catch(e){}}}
  LS.set('mc-food',S.food);
  if(rlib&&(rlib.at||0)>(S.flib.at||0))S.flib=Object.assign({foods:[],meals:[],at:0},rlib);
  else if(S.flib.at){try{await COL.doc('mc-foodlib').set(JSON.parse(JSON.stringify(S.flib)));}catch(e){}}
  LS.set('mc-foodlib',S.flib);
}
// Respaldo: agrega días y alimentos que no estén
function importFood(food,lib){
  let n=0;if(food&&typeof food==='object')Object.keys(food).forEach(k=>{const r=food[k];if(!/^\d{4}-\d\d-\d\d$/.test(k)||!r||!Array.isArray(r.items))return;
    const l=S.food[k];if(!l||(!l.items.length&&!l.water)||(r.at||0)>(l.at||0)){S.food[k]={items:r.items,water:r.water||0,at:r.at||Date.now(),tg:r.tg||0};n++;if(COL)COL.doc('mcf-'+k).set(S.food[k]).catch(()=>{});}});
  LS.set('mc-food',S.food);
  if(lib){const fi=new Set(S.flib.foods.map(x=>x.id)),mi=new Set(S.flib.meals.map(x=>x.id));let ch=0;
    (lib.foods||[]).forEach(x=>{if(x&&x.id&&!fi.has(x.id)){S.flib.foods.push(x);ch++;}});(lib.meals||[]).forEach(x=>{if(x&&x.id&&!mi.has(x.id)){S.flib.meals.push(x);ch++;}});if(ch)flibSave();}
  return n;
}

/* ---------- alimentos ---------- */
let FDB=null;
function fdb(){
  if(FDB)return FDB;FDB={};
  Object.keys(FOODS).forEach(id=>{const F=FOODS[id],M=FDB_MENU[id]||['ver',0],por=[];if(F.u[0]!=='g')por.push([F.u[0],F.u[1],F.u[2]]);(M[2]||[]).forEach(x=>por.push(x));
    FDB[id]={id,n:cap1(F.n),cat:M[0],k:F.k,p:F.p,c:F.c,f:F.f,fb:M[1],por,liq:!!M[3],kw:(F.rn||'')+' '+(FDB_KW[id]||'')};});
  FDB_X.forEach(([id,n,cat,k,p,c,f,fb,por,kw,liq])=>{FDB[id]={id,n,cat,k,p,c,f,fb,por,kw:kw||'',liq:!!liq};});
  return FDB;
}
function food(id){if(!id)return null;if(id.indexOf('my-')===0)return S.flib.foods.find(z=>z.id===id)||null;return fdb()[id]||null;}
const funits=F=>{const u=(F.por||[]).slice();if(!F.nog||!u.length)u.push(F.liq?['ml','ml',1]:['g','g',1]);return u;};
const fbase=P=>P[2]===1&&(P[0]==='g'||P[0]==='ml');
function fcalc(F,q,u){const U=funits(F),P=U[Math.max(0,Math.min(u,U.length-1))],w=q*P[2],r=w/100;return {w,k:F.k*r,p:F.p*r,c:F.c*r,fat:F.f*r,fib:(F.fb||0)*r};}
const FQ={.25:'¼',.5:'½',.75:'¾'};
function fq(q){const w=Math.floor(q+1e-6),r=Math.round((q-w)*100)/100,fr=FQ[r];if(!r)return NF.format(w);if(fr)return w?w+' y '+fr:fr;return NF.format(Math.round(q*100)/100);}
function qlabel(F,q,u){const U=funits(F),P=U[Math.max(0,Math.min(u,U.length-1))];if(fbase(P))return NF.format(Math.round(q))+' '+P[0];
  return `${fq(q)} ${q>1?P[1]:P[0]}${F.nog?'':' · '+NF.format(Math.round(q*P[2]))+' '+(F.liq?'ml':'g')}`;}
function fitem(F,q,u,s){const m=fcalc(F,q,u);return {id:fid(),s,f:F.id,n:F.n,q,u,qt:qlabel(F,q,u),w:Math.round(m.w),k:Math.round(m.k),p:r1(m.p),c:r1(m.c),fat:r1(m.fat),fib:r1(m.fib),t:Date.now()};}
function fdefault(F){const U=funits(F);return fbase(U[0])?{u:0,q:100}:{u:0,q:1};}
const ftot=items=>items.reduce((a,i)=>{a.k+=i.k||0;a.p+=i.p||0;a.c+=i.c||0;a.fat+=i.fat||0;a.fib+=i.fib||0;return a;},{k:0,p:0,c:0,fat:0,fib:0});
const fnorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
// Recientes y frecuentes de los últimos 90 días, con la última cantidad usada
function fhist(){
  const out={},now=Date.now();
  Object.keys(S.food).forEach(k=>{if(now-fdDate(k)>90*864e5)return;(S.food[k].items||[]).forEach(it=>{if(!it.f||!food(it.f))return;
    const o=out[it.f]||(out[it.f]={id:it.f,n:0,t:0,u:it.u,q:it.q});o.n++;if((it.t||0)>o.t){o.t=it.t||0;o.u=it.u;o.q=it.q;}});});
  return out;
}
function fsearch(q){
  const t=fnorm(q).trim().split(/\s+/).filter(Boolean);if(!t.length)return [];
  const H=fhist(),all=Object.values(fdb()).concat(S.flib.foods),res=[];
  all.forEach(F=>{const n=fnorm(F.n),kw=fnorm(F.kw);let s=0,miss=0;
    for(const w of t){const re=new RegExp('(^|[^a-z])'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
      if(n.startsWith(w))s+=4;else if(re.test(n))s+=3;else if(n.includes(w))s+=1;else if(kw.includes(w))s+=1.5;else miss++;}
    if(miss&&(t.length<2||miss>1||s<3))return;s-=miss*3;
    s+=(F.id.indexOf('my-')===0?1:0)+Math.min(2,(H[F.id]?H[F.id].n:0)*.2)-n.length*.004;res.push([s,F]);});
  return res.sort((a,b)=>b[0]-a[0]).slice(0,40).map(x=>x[1]);
}

/* ---------- metas del día ---------- */
function ftarget(k,N){
  N=N||myNutri();if(!N)return null;const wd=(fdDate(k).getDay()+6)%7,kcal=dayKcal(wd,N),tr=!!S.program.week[wd];
  return {kcal,p:N.p,f:N.f,c:Math.max(50,Math.round((kcal-N.p*4-N.f*9)/4/5)*5),fib:Math.round(kcal/1000*14),water:tr?N.waterT:N.water,tr,wd};
}
function fslotsPlan(){const n=S.settings.meals||4;return n===3?['des','alm','cen']:n===5?['des','mm','alm','onc','cen']:['des','alm','onc','cen'];}
function fslots(D){const s=fslotsPlan().concat(['otr']);(D?D.items:[]).forEach(i=>{if(!s.includes(i.s))s.splice(s.length-1,0,i.s);});return Object.keys(FSLOT).filter(k=>s.includes(k));}
function fslotNow(){const h=new Date().getHours()+new Date().getMinutes()/60,P=fslotsPlan();
  const s=h<10.5?'des':h<12?(P.includes('mm')?'mm':'des'):h<15?'alm':h<18.5?(P.includes('onc')?'onc':'otr'):'cen';return s;}
// Comida sugerida por el menú para ese día y ese momento
function fsugMeal(k,s,N){const i=fslotsPlan().indexOf(s);if(i<0)return null;const T=ftarget(k,N);try{return dayMenu(T.wd,N)[i]||null;}catch(e){return null;}}
function fsugItems(m,s){return m.items.map(([id,q])=>{const F=food(id);if(!F)return null;const U=funits(F),u=FOODS[id]&&FOODS[id].u[0]==='g'?U.length-1:0;return fitem(F,q,u,s);}).filter(Boolean);}

/* ---------- estadísticas ---------- */
function fweek(N,days){
  const today=fToday(),out=[];
  for(let i=days-1;i>=0;i--){const k=fdShift(today,-i),D=S.food[k],T0=ftarget(k,N),T=D&&D.tg&&i>0?Object.assign({},T0,{kcal:D.tg}):T0,t=ftot(D?D.items||[]:[]);
    out.push({k,T,t,n:D?(D.items||[]).length:0,today:i===0,full:i>0&&t.k>=T.kcal*.5});}
  return out;
}
function fstreak(){let k=fToday(),n=0;if(!(S.food[k]&&S.food[k].items.length))k=fdShift(k,-1);
  while(S.food[k]&&S.food[k].items&&S.food[k].items.length){n++;k=fdShift(k,-1);}return n;}
// Promedio de lo comido contra la meta en los días completos
function fadherence(N,days){const F=fweek(N,days+1).filter(d=>d.full);if(!F.length)return null;
  const avg=F.reduce((a,d)=>a+d.t.k,0)/F.length,tgt=F.reduce((a,d)=>a+d.T.kcal,0)/F.length;return {n:F.length,avg,tgt,p:F.reduce((a,d)=>a+d.t.p,0)/F.length};}
/* Gasto real: lo que comes en promedio menos lo que cambia tu peso (7.700 kcal por kg) */
function realTdee(N){
  const t=weightTrend(28),F=fweek(N,29).filter(d=>d.full);
  if(F.length<10||!t)return {need:F.length<10?'dias':'peso',n:F.length};
  const avg=F.reduce((a,d)=>a+d.t.k,0)/F.length,v=avg-t.rate*7700/7;
  return {tdee:Math.round(Math.max(1200,Math.min(5000,v))/10)*10,avg:Math.round(avg),n:F.length,rate:t.rate};
}

/* Consejos del día según lo que llevas (máximo dos) */
const FPROT=[['pollo','una porción de pechuga de pollo',37,1],['atun','una lata de atún',26,1],['whey','un scoop de proteína',24,2],['yogur','un vaso de yogur griego',13.5],['huevo','2 huevos',12.6],['queso','2 tajadas de queso campesino',12],['lenteja','un cucharón de lentejas',10.8]];
function ftips(T,tot,D){
  const h=new Date().getHours(),out=[],pr=T.p-tot.p;
  if(pr>=20){const O=FPROT.filter(x=>!(x[3]===1&&S.settings.veg)&&!(x[3]===2&&!S.settings.whey)&&x[2]<=pr+8).slice(0,2);
    if(O.length)out.push([IC.bolt,`Te faltan <b>${fk(pr)} g de proteína</b>. Por ejemplo: ${O.map(x=>`${x[1]} (${fk(x[2])} g)`).join(' o ')}.`]);}
  if(tot.k>T.kcal*1.1)out.push([IC.info,`Te pasaste <b>${fk(tot.k-T.kcal)} kcal</b>. No pasa nada: mañana vuelve a tu meta normal, sin saltarte comidas.`]);
  if(h>=20&&tot.k<T.kcal*.75)out.push([IC.list,`Te faltan ${fk(T.kcal-tot.k)} kcal. Si ya no vas a comer más, revisa que esté todo registrado: así tus promedios son reales.`]);
  if(h>=15&&(D.water||0)/1000<T.water*.4)out.push([IC.drop,`Llevas ${NF.format((D.water||0)/1000)} de ${NF.format(T.water)} L de agua. Ten una botella cerca en la tarde.`]);
  if(h>=18&&tot.fib<T.fib*.5&&tot.k>T.kcal*.5)out.push([IC.info,`Vas con poca fibra (${fk(tot.fib)} de ${T.fib} g). Suma verduras, fríjoles o una fruta.`]);
  return out.slice(0,2).map(([ic,t])=>`<div class="ftip">${ic}<span>${t}</span></div>`).join('');
}

/* ---------- vistas ---------- */
function fring(v,max,size){const r=size/2-6,C=2*Math.PI*r,p=Math.min(1,max?v/max:0),c=size/2,over=v>max*1.1;
  return `<svg class="fring ${over?'over':''}" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle class="bg" cx="${c}" cy="${c}" r="${r}"/>${p>0?`<circle class="fg" cx="${c}" cy="${c}" r="${r}" stroke-dasharray="${(C*p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${c} ${c})"/>`:''}</svg>`;}
function fbar(lbl,v,max,cls,u){const p=Math.min(100,max?v/max*100:0),over=v>max*1.15;
  return `<div class="fmac ${cls}"><div class="fmt"><span>${lbl}</span><b>${fk(v)}<small> / ${fk(max)} ${u||'g'}</small></b></div><i><s style="width:${p}%"${over?' class="over"':''}></s></i></div>`;}
function fdateLabel(k){const t=fToday();if(k===t)return 'Hoy';if(k===fdShift(t,-1))return 'Ayer';return cap1(fdDate(k).toLocaleDateString('es-CO',{weekday:'long'}));}
function diaryView(N){
  const today=fToday();let k=S.fdate||today;if(k>today)k=S.fdate=today;
  const D=fday(k),T=ftarget(k,N),tot=ftot(D.items),rem=T.kcal-tot.k,prev=fday(fdShift(k,-1)),PL=fslotsPlan();
  let MN=null;try{MN=dayMenu(T.wd,N);}catch(e){}
  let h=`<div class="fdate"><button class="iconbtn" data-act="fdnav" data-v="-1" aria-label="Día anterior">${IC.left}</button>
    <button class="fdl" data-act="fdtoday" aria-label="Ir a hoy"><b>${fdateLabel(k)}</b><small>${fdDate(k).toLocaleDateString('es-CO',{day:'numeric',month:'long'})}</small></button>
    <button class="iconbtn" data-act="fdnav" data-v="1" aria-label="Día siguiente" ${k>=today?'disabled':''}>${IC.right}</button></div>`;
  h+=`<div class="card fsum"><div class="fsum1"><div class="fringw">${fring(tot.k,T.kcal,112)}<div class="frc"><b>${fk(Math.abs(rem))}</b><span>${rem>=0?'kcal restantes':'kcal de más'}</span></div></div>
    <div class="fkv"><div><span>Meta</span><b>${fk(T.kcal)}</b></div><div><span>Comido</span><b>${fk(tot.k)}</b></div>
    <div class="fdt ${T.tr?'tr':''}">${T.tr?IC.dumb:IC.moon}${T.tr?'Día de entreno':'Día de descanso'}</div></div></div>
    <div class="fmacs">${fbar('Proteína',tot.p,T.p,'m-p')}${fbar('Carbohidratos',tot.c,T.c,'m-c')}${fbar('Grasas',tot.fat,T.f,'m-f')}${fbar('Fibra',tot.fib,T.fib,'m-fb')}</div></div>`;
  const wl=(D.water||0)/1000;
  h+=`<div class="card fwat"><span class="nic">${IC.drop}</span><div class="fwt"><div><b>${NF.format(wl)} L</b><small> de ${NF.format(T.water)} L</small></div><i><s style="width:${Math.min(100,wl/T.water*100)}%"></s></i></div>
    <button class="iconbtn sm" data-act="fwater" data-v="-250" aria-label="Quitar un vaso" ${D.water?'':'disabled'}>−</button><button class="btn sm pri" data-act="fwater" data-v="250" aria-label="Agregar un vaso de agua">+ Vaso</button></div>`;
  if(k===today&&D.items.length){const tp=ftips(T,tot,D);if(tp)h+=`<div class="ftips">${tp}</div>`;}
  fslots(D).forEach(s=>{
    const its=D.items.filter(x=>x.s===s),t=ftot(its);
    h+=`<div class="card fmeal"><div class="fmh"><div><b>${FSLOT[s]}</b><small>${its.length?`${fk(t.k)} kcal · P ${fk(t.p)} · C ${fk(t.c)} · G ${fk(t.fat)}`:'Sin registrar'}</small></div>
      <button class="fplus" data-act="fadd" data-v="${s}" aria-label="Agregar a ${FSLOT[s].toLowerCase()}">${IC.plus}</button></div>`;
    if(its.length)h+=`<ul class="fitems">${its.map(it=>`<li><button data-act="fedit" data-v="${it.id}"><span><b>${esc(it.n)}</b><small>${esc(it.qt||'')}</small></span><em>${fk(it.k)}</em></button></li>`).join('')}</ul>
      ${its.length>1||k!==today?`<div class="fmf">${k!==today?`<button class="flink" data-act="fcopyto" data-v="${s}">${IC.swap}Copiar a hoy</button>`:''}${its.length>1?`<button class="flink" data-act="fsavemeal" data-v="${s}">${IC.star}Guardar como comida</button>`:''}</div>`:''}`;
    else{const m=MN&&PL.indexOf(s)>=0?MN[PL.indexOf(s)]:null,py=prev.items.filter(x=>x.s===s);
      if(m||py.length)h+=`<div class="fsug">${m?`<button class="fsg" data-act="fsug" data-v="${s}"><span><small>Sugerido</small><b>${esc(m.t)}</b><em>${fk(m.tot.k)} kcal · ${fk(m.tot.p)} g de proteína</em></span><span class="fsgb">${IC.plus}Registrar</span></button>`:''}
        ${py.length?`<button class="flink" data-act="fcopy" data-v="${s}">${IC.swap}Copiar de ${k===today?'ayer':'el día anterior'} · ${fk(ftot(py).k)} kcal</button>`:''}</div>`;}
    h+=`</div>`;
  });
  if(!D.items.length&&prev.items.length)h+=`<button class="btn ghost block" style="margin-top:10px" data-act="fcopyday">${IC.swap}Copiar todo lo de ${k===today?'ayer':'el día anterior'}</button>`;
  h+=`<button class="btn ghost block" style="margin-top:10px" data-act="ftabset" data-v="metas">${IC.layers}Ver tu semana y tu gasto real</button>`;
  return h;
}
/* Últimos 7 días */
function fweekCard(N){
  const W=fweek(N,7),F=W.filter(d=>d.full),st=fstreak();
  const mx=Math.max(...W.map(d=>Math.max(d.t.k,d.T.kcal)))*1.12||1,Wd=340,H=132,L=8,R=8,T=16,B=22,iw=Wd-L-R,ih=H-T-B,bw=iw/7;
  const Y=v=>T+ih-ih*v/mx;
  const bars=W.map((d,i)=>{const x=L+bw*i,hb=ih*d.t.k/mx,cls=!d.n?'none':d.today?'now':Math.abs(d.t.k-d.T.kcal)<=d.T.kcal*.1?'ok':d.t.k<d.T.kcal?'lo':'hi';
    return `<rect class="fb ${cls}" x="${(x+bw*.2).toFixed(1)}" y="${(T+ih-hb).toFixed(1)}" width="${(bw*.6).toFixed(1)}" height="${Math.max(0,hb).toFixed(1)}" rx="4"/>
      <line class="ft" x1="${(x+bw*.1).toFixed(1)}" x2="${(x+bw*.9).toFixed(1)}" y1="${Y(d.T.kcal).toFixed(1)}" y2="${Y(d.T.kcal).toFixed(1)}"/>
      ${d.n?`<text class="ax" x="${(x+bw/2).toFixed(1)}" y="${(T+ih-hb-4).toFixed(1)}" text-anchor="middle">${NF.format(Math.round(d.t.k/100)/10)}</text>`:''}
      <text class="ax ${d.today?'b':''}" x="${(x+bw/2).toFixed(1)}" y="${H-6}" text-anchor="middle">${LETTERS3[(fdDate(d.k).getDay()+6)%7].slice(0,2)}</text>`;}).join('');
  const avg=F.length?F.reduce((a,d)=>a+d.t.k,0)/F.length:0,tg=F.length?F.reduce((a,d)=>a+d.T.kcal,0)/F.length:0,pp=F.length?F.reduce((a,d)=>a+d.t.p,0)/F.length:0;
  const ok=F.filter(d=>Math.abs(d.t.k-d.T.kcal)<=d.T.kcal*.1).length;
  return `<h2 class="h2">Tu semana <small>miles de kcal</small></h2><div class="card fwk">
    <svg class="fwc" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Calorías de los últimos 7 días contra la meta">${bars}</svg>
    <div class="flg"><span><i class="ok"></i>En meta (±10 %)</span><span><i class="lo"></i>Por debajo</span><span><i class="hi"></i>Por encima</span><span><i class="tl"></i>Meta</span></div>
    ${F.length?`<div class="fst"><div><span>Promedio</span><b>${fk(avg)}</b><small>meta ${fk(tg)} kcal</small></div><div><span>Proteína</span><b>${fk(pp)} g</b><small>meta ${N.p} g</small></div>
      <div><span>Días en meta</span><b>${ok} de ${F.length}</b><small>días completos</small></div><div><span>Racha</span><b>${pl(st,'día','días')}</b><small>registrando</small></div></div>
      ${avg&&Math.abs(avg-tg)>tg*.1?`<p class="fnote">${avg<tg?`Estás comiendo cerca de ${fk(tg-avg)} kcal menos de tu meta. ${N.goal==='musculo'||N.goal==='fuerza'?'Para ganar músculo necesitas llegar a la meta: suma una merienda o porciones un poco más grandes.':'Si te sientes con poca energía en el entreno, acércate a la meta.'}`:`Estás comiendo cerca de ${fk(avg-tg)} kcal más que tu meta. ${N.goal==='grasa'?'Para bajar grasa, revisa bebidas, salsas y meriendas: ahí suelen estar las calorías de más.':'Si tu peso sube más rápido de lo ideal, acércate a la meta.'}`}</p>`:''}`
    :`<p class="fnote">Registra al menos un día completo para ver tu promedio y tu cumplimiento. Hoy no cuenta hasta que termine.</p>`}</div>`;
}
function ftdeeCard(N,b){
  const R=realTdee(N);
  if(R.need)return `<div class="card ftdee"><div class="nh1"><span class="nic">${IC.flame}</span><div><span class="over">Tu gasto real</span><b>Aún sin datos suficientes</b>
    <small>${R.need==='dias'?`Llevas ${pl(R.n,'día completo','días completos')} de 10 en las últimas 4 semanas.`:'Te faltan registros de peso: pésate una vez por semana.'} Con tus comidas y tu peso calculo cuánto gastas de verdad, no solo por fórmula.</small></div></div></div>`;
  const diff=R.tdee-N.tdee,use=Math.abs(diff)>=150;
  return `<div class="card ftdee"><div class="nh1"><span class="nic">${IC.flame}</span><div><span class="over">Tu gasto real</span><b>${fk(R.tdee)} kcal al día</b>
    <small>Comiste en promedio ${fk(R.avg)} kcal en ${R.n} días y tu peso va ${kgw(R.rate)} por semana. La fórmula decía ${fk(N.tdee)} kcal${use?` (${diff>0?'+':'−'}${fk(Math.abs(diff))})`:', así que vas bien calibrado'}.</small></div></div>
    ${use?`<button class="btn sm pri block" style="margin-top:12px" data-act="frealuse" data-v="${R.tdee}">Calcular mi meta con mi gasto real</button>`:''}</div>`;
}
function foodHomeCard(){
  const N=typeof myNutri==='function'&&myNutri();if(!N)return '';
  const k=fToday(),D=fday(k),T=ftarget(k,N),t=ftot(D.items),rem=T.kcal-t.k;
  return `<h2 class="h2">Alimentación de hoy</h2><div class="card fhome"><button class="fhl" data-act="fgo" aria-label="Abrir el registro de comidas"><span class="fringw sm">${fring(t.k,T.kcal,58)}<b>${Math.round(Math.min(999,T.kcal?t.k/T.kcal*100:0))}%</b></span>
    <span class="fht"><b>${fk(t.k)} de ${fk(T.kcal)} kcal</b><small>${D.items.length?`Proteína ${fk(t.p)} de ${T.p} g · ${rem>=0?'faltan '+fk(rem):fk(-rem)+' de más'}`:'Aún no registras nada hoy'}</small></span></button>
    <button class="btn sm pri" data-act="fadd" data-v="${fslotNow()}">${IC.plus}Registrar</button></div>`;
}

/* ---------- hoja: agregar ---------- */
let FADD=null;
const FTABS=[['rec','Recientes'],['freq','Frecuentes'],['meals','Mis comidas'],['mine','Mis alimentos'],['all','Todos']];
let FTL=null; // última pestaña elegida a mano
function addSheet(s,k){const H=fhist();FADD={k:k||S.fdate||fToday(),s,q:'',tab:Object.keys(H).length?FTL||'rec':FTL&&FTL!=='rec'&&FTL!=='freq'?FTL:'all',cat:(FADD&&FADD.cat)||'prot'};renderAdd();}
function frow(F,q,u,extra){const m=fcalc(F,q,u);
  return `<li><button class="frow" data-act="fpick" data-v="${F.id}|${u}|${q}"><span><b>${esc(F.n)}</b><small>${esc(qlabel(F,q,u))}${extra?' · '+extra:''}</small></span><em>${fk(m.k)}<small> kcal</small></em></button></li>`;}
function addList(){
  const A=FADD,q=A.q.trim();
  if(q){const M=S.flib.meals.filter(m=>fnorm(m.n).includes(fnorm(q))),R=fsearch(q);
    const on=typeof fonlineBlock==='function'?fonlineBlock(q):'';
    if(!M.length&&!R.length)return `<div class="fempty"><b>No encontramos «${esc(q)}»</b><span>Búscalo en productos de marca o créalo con los datos de la etiqueta.</span><button class="btn sm ghost" data-act="fnew" data-v="${esc(q)}">${IC.plus}Crear «${esc(q)}»</button></div>${on}`;
    return `<ul class="flist">${M.map(fmealRow).join('')}${R.map(F=>{const d=fdefault(F);return frow(F,d.q,d.u,F.id.indexOf('my-')===0?'mío':'');}).join('')}</ul>${on}`;}
  if(A.tab==='rec'||A.tab==='freq'){const H=Object.values(fhist()).sort((a,b)=>A.tab==='rec'?b.t-a.t:b.n-a.n||b.t-a.t).filter(x=>A.tab==='rec'||x.n>1).slice(0,25);
    if(!H.length)return `<div class="fempty"><b>${A.tab==='rec'?'Aún no hay recientes':'Aún no hay frecuentes'}</b><span>${A.tab==='rec'?'Lo que registres aparece aquí con la última cantidad que usaste.':'Lo que registres dos o más veces aparece aquí.'}</span></div>`;
    return `<ul class="flist">${H.map(x=>frow(food(x.id),x.q,x.u,A.tab==='freq'?pl(x.n,'vez','veces'):'')).join('')}</ul>`;}
  if(A.tab==='meals')return S.flib.meals.length?`<ul class="flist">${S.flib.meals.map(fmealRow).join('')}</ul>`:`<div class="fempty"><b>Sin comidas guardadas</b><span>Registra una comida con varios alimentos y toca «Guardar como comida». Después la agregas completa con un toque.</span></div>`;
  if(A.tab==='mine')return S.flib.foods.length?`<ul class="flist">${S.flib.foods.map(F=>{const d=fdefault(F);return frow(F,d.q,d.u);}).join('')}</ul><p class="fnote">Para editar o borrar un alimento tuyo, ábrelo y toca «Editar alimento».</p>`
    :`<div class="fempty"><b>Sin alimentos propios</b><span>Crea los productos que compras con los datos de la tabla nutricional del empaque.</span><button class="btn sm pri" data-act="fnew">${IC.plus}Crear alimento</button></div>`;
  const L=Object.values(fdb()).filter(F=>F.cat===A.cat).sort((a,b)=>a.n.localeCompare(b.n,'es'));
  return `<div class="chips fcats">${Object.keys(FCAT).map(c=>`<button class="chip" data-act="fcat" data-v="${c}" aria-pressed="${A.cat===c}">${FCAT[c]}</button>`).join('')}</div>
    <ul class="flist">${L.map(F=>{const d=fdefault(F);return frow(F,d.q,d.u);}).join('')}</ul>`;
}
function fmealRow(m){const t=ftot(m.items);
  return `<li class="fmr"><button class="frow" data-act="fmealadd" data-v="${m.id}"><span><b>${IC.star}${esc(m.n)}</b><small>${esc(m.items.map(i=>i.n).slice(0,3).join(', '))}${m.items.length>3?'…':''}</small></span><em>${fk(t.k)}<small> kcal</small></em></button>
    <button class="iconbtn sm" data-act="fmealdel" data-v="${m.id}" aria-label="Borrar ${esc(m.n)}">${IC.x}</button></li>`;}
function renderAdd(){
  const A=FADD,diff=A.k!==fToday();
  sheet(`<h3>Agregar a ${FSLOT[A.s].toLowerCase()}</h3><p class="sub">${diff?fdateLabel(A.k)+', '+fdDate(A.k).toLocaleDateString('es-CO',{day:'numeric',month:'long'}):'Hoy'} · busca, elige y ajusta la porción.</p>
  <div class="fsrow"><label class="search fsearch">${IC.search}<input id="fsq" type="search" placeholder="Buscar alimento" autocomplete="off" enterkeyhint="search" value="${esc(A.q)}" aria-label="Buscar alimento"></label>
  <button class="iconbtn fscan" data-act="fphoto" aria-label="Registrar con una foto">${IC.cam}</button><button class="iconbtn fscan" data-act="fscan" aria-label="Escanear código de barras">${IC.scan}</button></div>
  <div class="utabs ftabs" id="ftabs" ${A.q?'hidden':''}>${FTABS.map(([k,l])=>`<button data-act="ftab" data-v="${k}" aria-pressed="${A.tab===k}">${l}</button>`).join('')}</div>
  <div id="faddlist">${addList()}</div>
  <div class="fbtns"><button class="btn sm ghost" data-act="fnew">${IC.plus}Crear alimento</button><button class="btn sm ghost" data-act="fquick">${IC.flame}Solo calorías</button></div>
  <div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);
  const p=$('#sheet .pan');if(p)p.classList.add('tall');
  const on=$('#ftabs [aria-pressed="true"]');if(on&&on.scrollIntoView)try{on.scrollIntoView({inline:'center',block:'nearest'});}catch(e){}
}

/* ---------- hoja: porción ---------- */
let FP=null;
function fstep(F,u){const P=funits(F)[u];if(fbase(P))return F.liq?50:10;return P[2]<=12?1:P[2]>=200?.25:.5;}
function portionSheet(o){FP=o;renderPortion();}
function fprev(F){const m=fcalc(F,FP.q,FP.u);
  return `<div class="fpk"><b>${fk(m.k)}</b><span>kcal</span></div><div class="fpm"><span><b>${NF.format(r1(m.p))} g</b>proteína</span><span><b>${NF.format(r1(m.c))} g</b>carbohidratos</span><span><b>${NF.format(r1(m.fat))} g</b>grasas</span><span><b>${NF.format(r1(m.fib))} g</b>fibra</span></div>`;}
function renderPortion(){
  const F=food(FP.f);if(!F){closeSheet();return;}const U=funits(F),P=U[FP.u],st=fstep(F,FP.u),base=F.liq?'ml':'g',mine=F.id.indexOf('my-')===0;
  sheet(`<h3>${esc(F.n)}</h3><p class="sub">${mine?'Alimento tuyo':FCAT[F.cat]||''}${F.nog?'':` · ${fk(F.k)} kcal en 100 ${base}`}</p>
  ${U.length>1?`<div class="chips wrap funits">${U.map((x,i)=>`<button class="chip" data-act="funit" data-v="${i}" aria-pressed="${FP.u===i}">${fbase(x)?(F.liq?'Mililitros':'Gramos'):esc(cap1(x[0]))+`<small> ${NF.format(x[2])} ${base}</small>`}</button>`).join('')}</div>`:''}
  <div class="fqty"><button class="iconbtn" data-act="fqstep" data-v="-1" aria-label="Menos">−</button><label><input id="fpq" inputmode="decimal" value="${NF.format(FP.q)}" aria-label="Cantidad"><span>${esc(fbase(P)?P[0]:FP.q>1?P[1]:P[0])}</span></label><button class="iconbtn" data-act="fqstep" data-v="1" aria-label="Más">+</button></div>
  ${fbase(P)?`<div class="fqk">${(F.liq?[100,200,250,330,500]:[50,100,150,200,250]).map(n=>`<button class="chip" data-act="fqset" data-v="${n}" aria-pressed="${FP.q===n}">${n} ${base}</button>`).join('')}</div>`
    :`<div class="fqk">${(st>=1?[1,2,3,4,5]:st===.25?[.25,.5,.75,1,1.5]:[.5,1,1.5,2,3]).map(n=>`<button class="chip" data-act="fqset" data-v="${n}" aria-pressed="${FP.q===n}">${fq(n)}</button>`).join('')}</div>`}
  <div class="fprev" id="fprev">${fprev(F)}</div>
  <div class="over" style="margin-top:14px">Comida</div><div class="chips wrap fslotc">${fslots(fday(FP.k)).map(s=>`<button class="chip" data-act="fpslot" data-v="${s}" aria-pressed="${FP.s===s}">${FSLOT[s]}</button>`).join('')}</div>
  <div class="acts"><button class="btn pri" data-act="fpsave">${FP.id?'Guardar cambios':'Agregar a '+FSLOT[FP.s].toLowerCase()}</button>
  ${FP.id?`<button class="btn danger" data-act="fpdel">${IC.x}Quitar del registro</button>`:''}
  ${mine?`<button class="btn ghost" data-act="fmyedit" data-v="${F.id}">${IC.pen}Editar alimento</button>`:''}
  <button class="btn" data-act="${FP.id?'close':'fpback'}">${FP.id?'Cancelar':'Volver'}</button></div>`);
}
function fpRead(){const i=$('#fpq');if(!i)return;const v=parseFloat(String(i.value).replace(',','.'));if(!isNaN(v)&&v>=0)FP.q=Math.min(5000,v);}

/* ---------- hoja: solo calorías ---------- */
let FQK=null;
function quickSheet(o){FQK=o;const f=(id,l,v,ph)=>`<label><span>${l}</span><input inputmode="decimal" id="fqk-${id}" value="${v!=null&&v!==''?NF.format(v):''}" placeholder="${ph||''}" autocomplete="off"></label>`;
  sheet(`<h3>${FQK.id?'Editar registro rápido':'Solo calorías'}</h3><p class="sub">Para cuando no encuentras el alimento o ya sabes las calorías. Los macros son opcionales.</p>
  <div class="bform"><label class="wide"><span>Nombre</span><input id="fqk-n" value="${esc(FQK.n||'')}" placeholder="Ej.: almuerzo del restaurante" autocomplete="off" maxlength="60"></label>
  ${f('k','Calorías <small>kcal</small>',FQK.k,'0')}${f('p','Proteína <small>g</small>',FQK.p)}${f('c','Carbohidratos <small>g</small>',FQK.c)}${f('fat','Grasas <small>g</small>',FQK.fat)}</div>
  <div class="over" style="margin-top:14px">Comida</div><div class="chips wrap">${fslots(fday(FQK.dk)).map(s=>`<button class="chip" data-act="fqkslot" data-v="${s}" aria-pressed="${FQK.s===s}">${FSLOT[s]}</button>`).join('')}</div>
  <div class="acts"><button class="btn pri" data-act="fqksave">${FQK.id?'Guardar cambios':'Agregar'}</button>${FQK.id?`<button class="btn danger" data-act="fqkdel">${IC.x}Quitar del registro</button>`:''}<button class="btn" data-act="${FQK.id?'close':'fqkback'}">${FQK.id?'Cancelar':'Volver'}</button></div>`);}
const fnum=id=>{const i=$('#'+id);if(!i)return null;const s=String(i.value).trim();if(!s)return null;const v=parseFloat(s.replace(',','.'));return isNaN(v)||v<0?NaN:v;};
function fqkRead(){['k','p','c','fat'].forEach(x=>{FQK[x]=fnum('fqk-'+x);});const n=$('#fqk-n');if(n)FQK.n=n.value.trim();}

/* ---------- hoja: crear alimento ---------- */
let FNEW=null;
const fplural=w=>{const [a,...r]=w.trim().split(' '),p=/ón$/.test(a)?a.replace(/ón$/,'ones'):/[aeiouáéíóú]$/i.test(a)?a+'s':/z$/.test(a)?a.replace(/z$/,'ces'):a+'es';return [p].concat(r).join(' ');};
function newFoodSheet(o){FNEW=Object.assign({per:'por',pn:'porción',pg:'',liq:false,n:'',k:'',p:'',c:'',f:'',fb:''},o||{});renderNewFood();}
function renderNewFood(){
  const A=FNEW,f=(id,l,v)=>`<label><span>${l}</span><input inputmode="decimal" id="fnw-${id}" value="${v!==''&&v!=null?NF.format(v):''}" autocomplete="off"></label>`;
  sheet(`<h3>${A.id?'Editar alimento':'Crear alimento'}</h3><p class="sub">Copia los datos de la tabla nutricional del empaque. Queda guardado en «Mis alimentos».</p>
  <div class="bform"><label class="wide"><span>Nombre</span><input id="fnw-n" value="${esc(A.n)}" placeholder="Ej.: yogur Alpina griego" autocomplete="off" maxlength="60"></label></div>
  <div class="seg" style="margin-top:12px">${[['por','Valores por porción'],['100','Por 100 '+(A.liq?'ml':'g')]].map(([k,l])=>`<button data-act="fnwper" data-v="${k}" aria-pressed="${A.per===k}">${l}</button>`).join('')}</div>
  <div class="bform" style="margin-top:10px">${A.per==='por'?`<label><span>Porción</span><input id="fnw-pn" value="${esc(A.pn)}" placeholder="porción" autocomplete="off" maxlength="30"></label>${f('pg','Tamaño <small>'+(A.liq?'ml':'g')+', opcional</small>',A.pg)}`:''}
  ${f('k','Calorías <small>kcal</small>',A.k)}${f('p','Proteína <small>g</small>',A.p)}${f('c','Carbohidratos <small>g</small>',A.c)}${f('f','Grasas <small>g</small>',A.f)}${f('fb','Fibra <small>g, opcional</small>',A.fb)}</div>
  <div class="set inline" style="margin-top:6px"><span class="lb">Es una bebida<small>Se mide en ml</small></span><button class="sw" data-act="fnwliq" aria-pressed="${!!A.liq}" aria-label="Es una bebida"></button></div>
  <div class="acts"><button class="btn pri" data-act="fnwsave">${A.id?'Guardar cambios':'Crear y elegir porción'}</button>${A.id?`<button class="btn danger" data-act="fnwdel">${IC.x}Borrar alimento</button>`:''}<button class="btn" data-act="fnwback">Volver</button></div>`);
}
function fnwRead(){const A=FNEW,g=id=>{const i=$('#fnw-'+id);return i?i.value.trim():undefined;};
  const n=g('n');if(n!==undefined)A.n=n;const pn=g('pn');if(pn!==undefined)A.pn=pn;
  ['pg','k','p','c','f','fb'].forEach(x=>{const v=g(x);if(v!==undefined)A[x]=v===''?'':parseFloat(v.replace(',','.'));});}

/* ---------- operaciones ---------- */
function faddItems(k,items,msg){const D=fday(k);D.items=D.items.concat(items);fsave(k,D);render();
  const ids=new Set(items.map(i=>i.id)),t=ftot(items);
  undoable(`${msg||(items.length===1?esc(items[0].n):pl(items.length,'alimento','alimentos'))} · ${fk(t.k)} kcal`,()=>{const E=fday(k);E.items=E.items.filter(i=>!ids.has(i.id));fsave(k,E);render();});}
function fcloneItems(L,s){return L.map(i=>Object.assign({},i,{id:fid(),s:s||i.s,t:Date.now()}));}
function flogAct(a,v){
  const N=()=>myNutri();
  switch(a){
    case 'ftabset':S.ftab=v;render();window.scrollTo(0,0);return true;
    case 'fgo':S.tab='plan';S.planTab='food';S.ftab='diario';S.fdate=fToday();S.mePage=null;render();window.scrollTo(0,0);return true;
    case 'fdnav':{const k=fdShift(S.fdate||fToday(),+v);if(k>fToday())return true;S.fdate=k;render();return true;}
    case 'fdtoday':S.fdate=fToday();render();return true;
    case 'fwater':{const k=S.fdate||fToday(),D=fday(k);D.water=Math.max(0,(D.water||0)+(+v));fsave(k,D);render();if(+v>0){const T=ftarget(k,N());if(T&&D.water/1000>=T.water&&D.water-250<T.water*1000)toast(IC.check+'<span>Meta de agua cumplida</span>',true);}return true;}
    case 'fadd':if(!N()){toast('Primero pon tus datos en Plan → Alimentación');return true;}addSheet(v,S.tab==='plan'&&S.planTab==='food'?S.fdate:fToday());return true;
    case 'ftab':FADD.tab=FTL=v;renderAdd();return true;
    case 'fcat':FADD.cat=v;$('#faddlist').innerHTML=addList();return true;
    case 'fpick':{const [id,u,q]=v.split('|'),F=food(id);if(!F)return true;portionSheet({k:FADD.k,s:FADD.s,f:id,u:Math.min(+u||0,funits(F).length-1),q:+q||1});return true;}
    case 'fedit':{const k=S.fdate||fToday(),it=fday(k).items.find(i=>i.id===v);if(!it)return true;
      if(!it.f||!food(it.f)){quickSheet({dk:k,s:it.s,id:it.id,n:it.n,k:it.k,p:it.p,c:it.c,fat:it.fat});return true;}
      portionSheet({k,s:it.s,f:it.f,u:it.u,q:it.q,id:it.id});return true;}
    case 'funit':{fpRead();const F=food(FP.f),U=funits(F),w=FP.q*U[FP.u][2],nu=+v,st=fstep(F,nu);FP.u=nu;FP.q=Math.max(st,Math.round(w/U[nu][2]/st)*st);renderPortion();return true;}
    case 'fqstep':{fpRead();const F=food(FP.f),st=fstep(F,FP.u);FP.q=Math.max(st,Math.round((FP.q+st*(+v))/st)*st);FP.q=Math.round(FP.q*100)/100;renderPortion();return true;}
    case 'fqset':FP.q=+v;renderPortion();return true;
    case 'fpslot':fpRead();FP.s=v;renderPortion();return true;
    case 'fpback':fpRead();if(FADD)renderAdd();else closeSheet();return true;
    case 'fpsave':{fpRead();if(!(FP.q>0)){toast('Pon una cantidad');return true;}const F=food(FP.f),it=fitem(F,FP.q,FP.u,FP.s);
      if(FP.id){const D=fday(FP.k),i=D.items.findIndex(x=>x.id===FP.id);if(i>=0){it.id=FP.id;it.t=D.items[i].t;D.items[i]=it;}fsave(FP.k,D);closeSheet();render();toast(IC.check+'<span>Cambios guardados</span>');}
      else{closeSheet();faddItems(FP.k,[it]);}return true;}
    case 'fpdel':{const k=FP.k,D=fday(k),it=D.items.find(x=>x.id===FP.id);D.items=D.items.filter(x=>x.id!==FP.id);fsave(k,D);closeSheet();render();
      if(it)undoable(esc(it.n)+' quitado',()=>{const E=fday(k);E.items.push(it);fsave(k,E);render();});return true;}
    case 'fquick':quickSheet({dk:FADD?FADD.k:S.fdate||fToday(),s:FADD?FADD.s:fslotNow(),n:''});return true;
    case 'fqkslot':fqkRead();FQK.s=v;quickSheet(FQK);return true;
    case 'fqkback':if(FADD)renderAdd();else closeSheet();return true;
    case 'fqksave':{fqkRead();const Q=FQK;if([Q.k,Q.p,Q.c,Q.fat].some(x=>Number.isNaN(x))){toast('Revisa los números');return true;}
      let kc=Q.k;if(kc==null&&(Q.p||Q.c||Q.fat))kc=(Q.p||0)*4+(Q.c||0)*4+(Q.fat||0)*9;if(!(kc>0)){toast('Pon las calorías');return true;}
      const it={id:Q.id||fid(),s:Q.s,f:null,n:Q.n||'Calorías rápidas',q:1,u:0,qt:'Registro rápido',w:0,k:Math.round(kc),p:r1(Q.p||0),c:r1(Q.c||0),fat:r1(Q.fat||0),fib:0,t:Date.now()};
      if(Q.id){const D=fday(Q.dk),i=D.items.findIndex(x=>x.id===Q.id);if(i>=0){const o=D.items[i];it.t=o.t;if(o.ai){it.qt=o.qt;it.w=o.w;it.fib=o.fib;it.ai=1;}D.items[i]=it;}fsave(Q.dk,D);closeSheet();render();toast(IC.check+'<span>Cambios guardados</span>');}
      else{closeSheet();faddItems(Q.dk,[it]);}return true;}
    case 'fqkdel':{const k=FQK.dk,D=fday(k),it=D.items.find(x=>x.id===FQK.id);D.items=D.items.filter(x=>x.id!==FQK.id);fsave(k,D);closeSheet();render();
      if(it)undoable(esc(it.n)+' quitado',()=>{const E=fday(k);E.items.push(it);fsave(k,E);render();});return true;}
    case 'fnew':newFoodSheet({n:v&&v!=='undefined'?cap1(v):''});return true;
    case 'fnwper':fnwRead();FNEW.per=v;renderNewFood();return true;
    case 'fnwliq':fnwRead();FNEW.liq=!FNEW.liq;renderNewFood();return true;
    case 'fnwback':if(FNEW.id&&FP)renderPortion();else if(FADD)renderAdd();else closeSheet();return true;
    case 'fnwsave':{fnwRead();const A=FNEW;if(!A.n){toast('Ponle un nombre');return true;}
      if([A.k,A.p,A.c,A.f,A.fb,A.pg].some(x=>Number.isNaN(x))||A.k===''||!(A.k>=0)){toast(A.k===''?'Pon las calorías':'Revisa los números');return true;}
      const per=A.per==='100'?100:(A.pg>0?A.pg:100),sc=100/per,pn=(A.pn||'porción').toLowerCase();
      const F={id:A.id||'my-'+Date.now().toString(36),n:cap1(A.n),cat:'my',k:r1(A.k*sc),p:r1((A.p||0)*sc),c:r1((A.c||0)*sc),f:r1((A.f||0)*sc),fb:r1((A.fb||0)*sc),liq:!!A.liq,
        por:A.per==='100'?[]:[[pn,fplural(pn),per]],nog:A.per==='por'&&!(A.pg>0),bc:A.bc||undefined,src:{per:A.per,pn,pg:A.pg,k:A.k,p:A.p,c:A.c,f:A.f,fb:A.fb}};
      const i=S.flib.foods.findIndex(x=>x.id===F.id);if(i>=0)S.flib.foods[i]=F;else S.flib.foods.push(F);flibSave();FDB=null;
      if(A.id&&FP){FP.u=Math.min(FP.u,funits(F).length-1);renderPortion();toast(IC.check+'<span>Alimento actualizado</span>');return true;}
      const d=fdefault(F);portionSheet({k:FADD?FADD.k:fToday(),s:FADD?FADD.s:fslotNow(),f:F.id,u:d.u,q:d.q});return true;}
    case 'fmyedit':{const F=food(v);if(!F)return true;const s=F.src||{per:'100',k:F.k,p:F.p,c:F.c,f:F.f,fb:F.fb};newFoodSheet({id:F.id,bc:F.bc,n:F.n,liq:F.liq,per:s.per,pn:s.pn||'porción',pg:s.pg||'',k:s.k,p:s.p,c:s.c,f:s.f,fb:s.fb});return true;}
    case 'fnwdel':{const id=FNEW.id;S.flib.foods=S.flib.foods.filter(x=>x.id!==id);flibSave();FP=null;if(FADD)renderAdd();else closeSheet();toast('Alimento borrado. Lo que ya registraste no cambia.');return true;}
    case 'fsug':{const k=S.fdate||fToday(),m=fsugMeal(k,v,N());if(!m)return true;faddItems(k,fsugItems(m,v),esc(m.t));return true;}
    case 'fsugday':{const n=N();if(!n)return true;const k=fToday(),wd=(fdDate(k).getDay()+6)%7,P=fslotsPlan(),M=dayMenu(wd,n),D=fday(k);
      const items=[].concat(...M.map((m,i)=>D.items.some(x=>x.s===P[i])?[]:fsugItems(m,P[i])));if(!items.length){toast('Ya tienes registradas todas las comidas de hoy');return true;}
      S.ftab='diario';S.fdate=k;faddItems(k,items,'Menú de hoy');return true;}
    case 'fcopy':{const k=S.fdate||fToday(),py=fday(fdShift(k,-1)).items.filter(x=>x.s===v);if(py.length)faddItems(k,fcloneItems(py),FSLOT[v]+' de ayer');return true;}
    case 'fcopyto':{const k=S.fdate||fToday(),its=fday(k).items.filter(x=>x.s===v);if(!its.length)return true;const t=fToday();faddItems(t,fcloneItems(its),FSLOT[v]+' copiado a hoy');return true;}
    case 'fcopyday':{const k=S.fdate||fToday(),py=fday(fdShift(k,-1)).items;if(py.length)faddItems(k,fcloneItems(py),'Todo lo de ayer');return true;}
    case 'fsavemeal':{const k=S.fdate||fToday(),its=fday(k).items.filter(x=>x.s===v);if(!its.length)return true;
      sheet(`<h3>Guardar como comida</h3><p class="sub">${pl(its.length,'alimento','alimentos')} · ${fk(ftot(its).k)} kcal. La encuentras en «Mis comidas» para registrarla con un toque.</p>
        <div class="bform"><label class="wide"><span>Nombre</span><input id="fml-n" value="${esc(FSLOT[v]+' de siempre')}" maxlength="50" autocomplete="off"></label></div>
        <div class="acts"><button class="btn pri" data-act="fmlsave" data-v="${v}">Guardar</button><button class="btn" data-act="close">Cancelar</button></div>`);return true;}
    case 'fmlsave':{const k=S.fdate||fToday(),its=fday(k).items.filter(x=>x.s===v),n=($('#fml-n')||{}).value;if(!its.length)return true;
      S.flib.meals.push({id:'mm-'+Date.now().toString(36),n:(n&&n.trim())||FSLOT[v],items:its.map(i=>{const c=Object.assign({},i);delete c.id;delete c.s;delete c.t;return c;})});flibSave();closeSheet();toast(IC.star+'<span>Comida guardada</span>');return true;}
    case 'fmealadd':{const m=S.flib.meals.find(x=>x.id===v);if(!m)return true;closeSheet();faddItems(FADD.k,m.items.map(i=>Object.assign({},i,{id:fid(),s:FADD.s,t:Date.now()})),esc(m.n));return true;}
    case 'fmealdel':{const i=S.flib.meals.findIndex(x=>x.id===v);if(i<0)return true;const m=S.flib.meals[i];S.flib.meals.splice(i,1);flibSave();const l=$('#faddlist');if(l)l.innerHTML=addList();
      undoable(esc(m.n)+' borrada',()=>{S.flib.meals.splice(i,0,m);flibSave();const l2=$('#faddlist');if(l2)l2.innerHTML=addList();});return true;}
    case 'frealuse':{const n=N(),b=myBody();if(!n)return true;const base=nutri(b,n.goal,n.days,0),want=Math.round(+v*(1+n.adj)/10)*10;
      S.settings.kadj=Math.max(-Math.round(base.tdee*.25),Math.min(Math.round(base.tdee*.25),want-base.kcal));S.settings.kadjAt=Date.now();saveSettings();render();
      toast(IC.check+`<span>Meta calculada con tu gasto real: ${fk(myNutri().kcal)} kcal</span>`);return true;}
  }
  return false;
}
document.addEventListener('input',ev=>{const t=ev.target;
  if(t.id==='fsq'&&FADD){FADD.q=t.value;const l=$('#faddlist'),tb=$('#ftabs');if(l)l.innerHTML=addList();if(tb)tb.hidden=!!FADD.q.trim();}
  else if(t.id==='fpq'&&FP){fpRead();const F=food(FP.f),p=$('#fprev');if(F&&p)p.innerHTML=fprev(F);}
});
document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.id==='fsq'){ev.preventDefault();ev.target.blur();}
  if(ev.key==='Enter'&&ev.target.id==='fpq'){ev.preventDefault();flogAct('fpsave');}});
