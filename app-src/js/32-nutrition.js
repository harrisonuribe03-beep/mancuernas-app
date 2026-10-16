/* Nutrición: peso saludable para la estatura, gasto calórico, meta según objetivo, macros, agua y menú diario
   con comida colombiana. Es una guía general calculada con fórmulas estándar (Mifflin-St Jeor, IMC de la OMS). */

const ACT={sed:{t:'Poco activo',s:'Estudias o trabajas sentado y caminas poco',f:1.2},lig:{t:'Algo activo',s:'Caminas a diario o pasas parte del día de pie',f:1.3},
  act:{t:'Activo',s:'Trabajo de pie o con esfuerzo físico',f:1.45},muy:{t:'Muy activo',s:'Trabajo pesado o haces otro deporte',f:1.6}};
const GADJ={musculo:[.10,'+10 % para ganar músculo'],fuerza:[.05,'+5 % para ganar fuerza'],grasa:[-.20,'−20 % para bajar grasa'],salud:[0,'mantenimiento']};
const PROT={musculo:1.8,fuerza:1.8,grasa:2.0,salud:1.4};

function bmiCat(b){if(b<18.5)return {t:'Bajo peso',k:'lo'};if(b<25)return {t:'Peso saludable',k:'ok'};if(b<30)return {t:'Sobrepeso',k:'hi'};return {t:'Obesidad',k:'ob'};}
function myBody(){const st=S.settings,w=(typeof lastWeight==='function'&&lastWeight())||st.wt;
  return {sex:st.sex,age:st.age,wt:w,ht:st.ht,act:st.act||'lig'};}
const bodyReady=b=>!!(b.age&&b.wt&&b.ht);
function healthy(ht){const m=(ht/100)**2;return {lo:Math.round(18.5*m*2)/2,hi:Math.round(24.9*m*2)/2,ref:Math.round(22*m*2)/2};}
/* Cálculo completo para una persona */
function nutri(b,goal,days,kadj){
  const bmi=b.wt/((b.ht/100)**2),cat=bmiCat(bmi),hw=healthy(b.ht);
  const s=b.sex==='m'?-161:b.sex==='h'?5:-78;
  const bmr=10*b.wt+6.25*b.ht-5*b.age+s;
  const f=(ACT[b.act]||ACT.lig).f+0.035*Math.min(6,days||0);
  const tdee=bmr*f;
  let g=goal||'salud',note='';
  if(g==='grasa'&&bmi<18.5){g='salud';note='Tu peso está por debajo del rango saludable: en vez de déficit te dejamos en mantenimiento.';}
  if((g==='musculo'||g==='fuerza')&&bmi>=30)note='Con tu IMC conviene ganar músculo sin superávit: comer en mantenimiento y entrenar fuerte.';
  let adj=GADJ[g][0];if((g==='musculo'||g==='fuerza')&&bmi>=30)adj=0;
  const floor=Math.max(b.sex==='m'?1200:b.sex==='h'?1500:1350,bmr);
  let kcal=Math.round(Math.max(floor,tdee*(1+adj))/10)*10;
  if(kadj)kcal=Math.round(Math.max(floor,Math.min(tdee*1.25,Math.max(tdee*.75,kcal+kadj)))/10)*10;
  const base=bmi>27?hw.hi:b.wt; // con sobrepeso la proteína se calcula sobre el peso saludable
  const p=Math.round(PROT[g]*base/5)*5,fat=Math.round(Math.max(0.8*base,kcal*.27/9)/5)*5;
  const c=Math.max(50,Math.round((kcal-p*4-fat*9)/4/5)*5);
  const water=Math.round(b.wt*35/100)/10,waterT=Math.round((b.wt*35+500)/100)/10;
  return {bmi,cat,hw,bmr:Math.round(bmr),tdee:Math.round(tdee/10)*10,kcal,p,f:fat,c,water,waterT,goal:g,adj,note,days:days||0,kadj:kadj||0};
}
/* Entrenos por semana que de verdad hiciste (últimas 4 semanas). Si llevas menos de 2 semanas usando la app, el plan. */
function obsDays(){const now=Date.now(),first=S.history.length?S.history[S.history.length-1].ts:now;
  if(now-first<14*864e5)return null;const n=S.history.filter(h=>now-h.ts<28*864e5).length;return Math.round(n/Math.min(4,(now-first)/(7*864e5))*2)/2;}
function myNutri(){const b=myBody();if(!bodyReady(b))return null;const od=obsDays();
  return Object.assign(nutri(b,(S.program.gen||{}).goal||'musculo',od??trainDays(),S.settings.kadj||0),{obs:od!=null});}

/* ---------- según lo que vemos: tendencia del peso, revisión semanal, meta y grasa corporal ---------- */
// Ritmo sano por semana, como fracción del peso: [mínimo, máximo]
const RATE={grasa:[-.01,-.004],musculo:[.001,.005],fuerza:[0,.004],salud:[-.0025,.0025]};
const RMID={grasa:-.007,musculo:.003,fuerza:.002,salud:0};
function weightTrend(days){
  days=days||28;const now=Date.now(),P=S.body.filter(b=>b.w!=null&&now-b.ts<=days*864e5);
  if(P.length<3)return null;const span=(P[P.length-1].ts-P[0].ts)/864e5;if(span<10)return null;
  const xs=P.map(p=>(p.ts-P[0].ts)/864e5),ys=P.map(p=>p.w),n=P.length,mx=xs.reduce((a,x)=>a+x,0)/n,my=ys.reduce((a,y)=>a+y,0)/n;
  const sl=xs.reduce((a,x,i)=>a+(x-mx)*(ys[i]-my),0)/(xs.reduce((a,x)=>a+(x-mx)**2,0)||1);
  return {rate:sl*7,n,span:Math.round(span),now:my+sl*(xs[n-1]-mx)};
}
const kgw=x=>(x>0?'+':x<0?'−':'')+NF.format(Math.abs(Math.round(x*100)/100))+' kg';
/* Revisión semanal: compara el ritmo real con el ideal para el objetivo y propone un ajuste de calorías */
function checkin(N,b){
  const t=weightTrend();if(!t)return {st:'data'};
  const [lo,hi]=RATE[N.goal].map(r=>r*b.wt),mid=RMID[N.goal]*b.wt;
  let st='ok';if(t.rate<lo)st=N.goal==='grasa'?'fast':'slow';else if(t.rate>hi)st=N.goal==='grasa'?'slow':'fast';
  if(N.goal==='salud')st=t.rate<lo||t.rate>hi?'drift':'ok';
  let d=Math.round(Math.max(-250,Math.min(250,(mid-t.rate)*7700/7))/50)*50;if(st==='ok')d=0;
  return {st,t,lo,hi,d};
}
function bodyFat(b){
  const B=S.body,last=k=>{for(let i=B.length-1;i>=0;i--)if(B[i][k]!=null)return B[i][k];return null;};
  const w=last('waist'),n=last('neck'),h=last('hip');if(!b.sex||b.sex==='x')return null;if(!w||!n||!b.ht||(b.sex==='m'&&!h)){const m=[!w&&'cintura',!n&&'cuello',b.sex==='m'&&!h&&'cadera'].filter(Boolean);return {need:m.length>1?m.slice(0,-1).join(', ')+' y '+m[m.length-1]:m[0]};}
  let bf;if(b.sex==='h'){if(w-n<=0)return null;bf=495/(1.0324-0.19077*Math.log10(w-n)+0.15456*Math.log10(b.ht))-450;}
  else{if(w+h-n<=0)return null;bf=495/(1.29579-0.35004*Math.log10(w+h-n)+0.22100*Math.log10(b.ht))-450;}
  bf=Math.round(Math.max(3,Math.min(60,bf))*10)/10;
  const R=b.sex==='h'?[[6,'Atlético'],[14,'En forma'],[18,'Promedio'],[25,'Alto']]:[[14,'Atlético'],[21,'En forma'],[25,'Promedio'],[32,'Alto']];
  let cat=R[0][1];R.forEach(([x,t])=>{if(bf>=x)cat=t;});
  return {bf,cat,lean:Math.round(b.wt*(1-bf/100)*10)/10,ok:b.sex==='h'?bf<20:bf<28};
}
/* Peso meta: sugerido según objetivo y estatura; editable */
function goalWeight(N,b){
  const g=S.settings.goalWt;if(g)return g;
  const r=x=>Math.round(x*2)/2;
  if(N.goal==='grasa')return N.bmi>25?r(Math.max(N.hw.hi,b.wt*.9)):r(Math.max(N.hw.lo,b.wt*.95));
  if(N.goal==='musculo'||N.goal==='fuerza')return N.bmi<25?r(Math.max(b.wt,Math.min(b.wt*1.05,N.hw.hi+5))):r(b.wt);
  return N.bmi>25?r(N.hw.hi):N.bmi<18.5?r(N.hw.lo):r(b.wt);
}

/* ---------- menú ---------- */
const FRAC={0.25:'¼',0.5:'½',0.75:'¾'};
function qtyText(id,q){
  const F=FOODS[id],u=F.u;
  if(u[0]==='g')return `${Math.round(q)} g de ${F.n}`;
  const w=Math.floor(q+1e-6),r=Math.round((q-w)*4)/4,fr=FRAC[r]||'';
  const num=w&&fr?`${w} y ${fr}`:w?String(w):fr;
  const one=q<=1;
  if(['aceite','hogao','cafe','ensalada','verduras'].includes(id)&&q===1)return `${u[0]==='plato'?'1 plato de':u[0]==='taza'?'1 taza de':u[0]==='pocillo'?'1 pocillo de':'1 '+u[0]+' de'} ${F.n}`;
  if(id==='huevo'||id==='banano'||id==='manzana'||id==='arepa'||id==='bocadillo')return `${num} ${one?F.u[0]:F.u[1]}`.replace('½ huevo','medio huevo');
  if(id==='platano')return q>=1?`${num} ${q>1?'plátanos maduros asados':'plátano maduro asado'}`:`${num} de plátano maduro asado`;
  if(id==='aguacate')return `${num} ${one?'cuarto':'cuartos'} de aguacate`.replace('1 cuarto','¼').replace('2 cuartos','½');
  return `${num} ${one?u[0]:u[1]} de ${F.n}`;
}
const grams=(id,q)=>FOODS[id].u[2]*q;
/* Reparto de proteína: más en almuerzo y cena */
const mac=(id,q)=>{const F=FOODS[id],g=grams(id,q)/100;return {k:F.k*g,p:F.p*g,c:F.c*g,f:F.f*g};};
// Con metas altas las porciones pueden crecer (CAPS > 1)
let CAPS=1;
const roundQ=(id,q)=>{const F=FOODS[id],mx=id==='huevo'?Math.min(4,Math.round(F.mx*CAPS)):F.mx*CAPS;return Math.min(mx,Math.max(F.mn,Math.round(q/F.st)*F.st));};
/* Arma una comida para una meta de calorías y proteína */
function buildMeal(tpl,kcal,prot){
  const veg=!!S.settings.veg,items=[];
  let pIds=(veg&&tpl.pv?tpl.pv:tpl.p).filter(id=>!(veg&&['pollo','res','molida','cerdo','pescado','atun'].includes(id)));
  if(!pIds.length)pIds=['huevo'];
  if(tpl.w&&S.settings.whey)pIds=[tpl.w].concat(pIds);
  tpl.x.forEach(([id,q])=>items.push([id,q]));
  const sum=()=>items.reduce((a,[id,q])=>{const m=mac(id,q);a.k+=m.k;a.p+=m.p;a.c+=m.c;a.f+=m.f;return a;},{k:0,p:0,c:0,f:0});
  // proteína: el primer alimento proteico cubre lo que falta
  {const need=Math.max(0,prot-sum().p),id=pIds[0],per=mac(id,1).p||1;items.push([id,roundQ(id,need/per)]);}
  // carbohidratos: reparten lo que falta de calorías
  const cs=tpl.c,left=Math.max(0,kcal-sum().k);
  cs.forEach(id=>{const per=mac(id,1).k||1;items.push([id,roundQ(id,left/cs.length/per)]);});
  // si la proteína se pasó (los carbohidratos también aportan), baja la porción proteica y repone con carbohidratos
  {const pi=items.findIndex(([id])=>id===pIds[0]);for(let g=0;g<4&&pi>=0&&sum().p>prot*1.12;g++){const F=FOODS[pIds[0]],nq=Math.round((items[pi][1]-F.st)*100)/100;if(nq<F.mn)break;items[pi][1]=nq;}
   for(let g=0;g<10&&sum().k<kcal*.955;g++){const ok=items.map(([id,q],j)=>cs.includes(id)&&q+FOODS[id].st<=FOODS[id].mx*CAPS?j:-1).filter(j=>j>=0);if(!ok.length)break;const i=ok[g%ok.length];
     if(sum().k+mac(items[i][0],FOODS[items[i][0]].st).k>kcal*1.06)break;items[i][1]=Math.round((items[i][1]+FOODS[items[i][0]].st)*100)/100;}}
  // si se pasó mucho, baja los carbohidratos un paso
  for(let g=0;g<6&&sum().k>kcal*1.12;g++){const i=items.findIndex(([id,q])=>cs.includes(id)&&q-FOODS[id].st>=FOODS[id].mn);if(i<0)break;items[i][1]=Math.round((items[i][1]-FOODS[items[i][0]].st)*100)/100;}
  const merged=[];items.forEach(([id,q])=>{const m=merged.find(x=>x[0]===id);if(m)m[1]+=q;else merged.push([id,q]);});
  const order=id=>tpl.p.includes(id)||(tpl.pv||[]).includes(id)||id===tpl.w?0:cs.includes(id)?1:2;
  merged.sort((a,b)=>order(a[0])-order(b[0]));
  return {t:veg&&tpl.tv?tpl.tv:tpl.t,items:merged,tot:merged.reduce((a,[id,q])=>{const m=mac(id,q);a.k+=m.k;a.p+=m.p;a.c+=m.c;a.f+=m.f;return a;},{k:0,p:0,c:0,f:0})};
}
/* Calorías del día: un poco más los días de entreno y un poco menos los de descanso (el promedio semanal no cambia) */
function dayKcal(d,N){const t=trainDays(),r=7-t;if(!t||!r)return N.kcal;const b=Math.min(.08,.12*r/t);return Math.round(N.kcal*(S.program.week[d]?1+b:1-b*t/r)/10)*10;}
const TRAINAT={man:['Mañana','des',null],med:['Mediodía','alm','med'],tar:['Tarde','cen','med'],noc:['Noche','cen','med']};
function workoutMeals(d,menu){
  if(!S.program.week[d])return {};const T=TRAINAT[S.settings.trainAt||'tar'],ks=menu.map(m=>m.k||m[0]);
  let post=ks.lastIndexOf(T[1]);if(T[1]==='alm')post=ks.indexOf('alm');
  let pre=-1;if(T[2]){for(let i=post-1;i>=0;i--)if(ks[i]===T[2]||ks[i]==='alm'||ks[i]==='des'){pre=i;break;}}
  return {pre,post};
}
function dayMenu(d,N){
  N=Object.assign({},N,{kcal:dayKcal(d,N)});
  const n=MEALPLAN[S.settings.meals||4],sw=S.settings.mswap||{},used={};CAPS=Math.max(1,N.kcal/2100);
  const WM=workoutMeals(d,n);
  const tpls=n.map(([k],i)=>{let L=MEALS[k];const o=(sw[d+'-'+i]||0)+(used[k]=(used[k]||0)+1)*3;
    if(i===WM.pre){const pl=L.filter(t=>t.pre);if(pl.length)L=pl;} // antes de entrenar: carbohidratos fáciles y poca grasa
    return L[(d*2+i+o)%L.length];});
  // Se arma comida por comida; si el día queda corto o largo, se reparte la diferencia y se arma otra vez
  let f=1,M;
  for(let pass=0;pass<3;pass++){
    M=n.map(([k,label,share],i)=>Object.assign(buildMeal(tpls[i],N.kcal*share*f,N.p*share*(k==='med'?.75:k==='des'?.95:1.12)),{label,slot:i,k}));
    const tot=M.reduce((a,m)=>a+m.tot.k,0),r=N.kcal/tot;if(Math.abs(1-r)<.035)break;f=Math.max(.8,Math.min(1.3,f*r));
  }
  return M;
}
function weekShop(N){
  const tot={};for(let d=0;d<7;d++)dayMenu(d,N).forEach(m=>m.items.forEach(([id,q])=>{tot[id]=(tot[id]||0)+q;}));
  const out={};Object.entries(tot).forEach(([id,q])=>{const F=FOODS[id];(out[F.g]=out[F.g]||[]).push([id,q]);});return out;
}
function shopText(id,q){
  const F=FOODS[id],g=grams(id,q);
  if(F.raw){const r=g/F.raw;return `${F.rn||F.n} (crudo): ${r>=1000?NF.format(Math.round(r/100)/10)+' kg':Math.round(r/50)*50+' g'}`;}
  if(F.u[0]==='g')return `${F.n}: ${g>=1000?NF.format(Math.round(g/100)/10)+' kg':Math.round(g/50)*50+' g'}`;
  const n=Math.ceil(q-1e-6);
  if(id==='aguacate')return `aguacate: ${Math.ceil(q/4)} ${Math.ceil(q/4)===1?'unidad':'unidades'}`;
  if(id==='platano')return `plátano maduro: ${Math.ceil(q)} ${Math.ceil(q)===1?'unidad':'unidades'}`;
  if(['ensalada','verduras'].includes(id))return `${F.n}: ${n} ${n===1?'porción':'porciones'}`;
  if(id==='avena')return `avena en hojuelas: ${Math.round(g/50)*50} g`;
  if(id==='leche')return `leche descremada: ${NF.format(Math.round(g/100)/10)} L`;
  if(id==='yogur')return `yogur griego: ${Math.round(g/50)*50} g`;
  if(id==='cafe'||id==='aceite'||id==='hogao')return F.n;
  return `${F.n}: ${n} ${n===1?F.u[0]:F.u[1]}`;
}

/* ---------- vistas ---------- */
const fk=x=>NF.format(Math.round(x));
function bmiBar(bmi){
  const lo=15,hi=40,pos=Math.min(100,Math.max(0,(bmi-lo)/(hi-lo)*100)),z=v=>(v-lo)/(hi-lo)*100;
  return `<div class="bmibar" aria-hidden="true"><i class="z lo" style="width:${z(18.5)}%"></i><i class="z ok" style="left:${z(18.5)}%;width:${z(25)-z(18.5)}%"></i><i class="z hi" style="left:${z(25)}%;width:${z(30)-z(25)}%"></i><i class="z ob" style="left:${z(30)}%;width:${100-z(30)}%"></i><b style="left:${pos}%"></b></div>
  <div class="bmiax"><span>18,5</span><span>25</span><span>30</span></div>`;
}
function healthCard(b,N){
  const waist=(()=>{for(let i=S.body.length-1;i>=0;i--)if(S.body[i].waist!=null)return S.body[i].waist;return null;})();
  const whtr=waist?waist/b.ht:null;
  return `<div class="card nhealth"><div class="nh1"><span class="nic">${IC.ruler}</span><div><span class="over">Peso saludable para ${NF.format(b.ht/100)} m</span><b>${NF.format(N.hw.lo)} a ${NF.format(N.hw.hi)} kg</b><small>Referencia: ${NF.format(N.hw.ref)} kg · hoy pesas ${NF.format(b.wt)} kg</small></div></div>
  <div class="nbmi"><span>IMC <b>${NF.format(Math.round(N.bmi*10)/10)}</b></span><span class="tag ${N.cat.k}">${N.cat.t}</span></div>${bmiBar(N.bmi)}
  ${whtr?`<div class="nkv"><span>Cintura / estatura</span><b>${NF.format(Math.round(whtr*100)/100)}</b><em class="${whtr<.5?'ok':'hi'}">${whtr<.5?'Saludable':'Alto, mejor bajo 0,5'}</em></div>`:''}
  ${(()=>{const F=bodyFat(b);if(!F)return '';if(F.need)return `<div class="nkv"><span>Grasa corporal</span><button class="btn sm ghost" data-act="bodyadd">Medir ${F.need}</button></div>`;
    return `<div class="nkv"><span>Grasa corporal estimada</span><b>${NF.format(F.bf)} %</b><em class="${F.ok?'ok':'hi'}">${F.cat}</em></div><div class="nkv"><span>Masa magra</span><b>${NF.format(F.lean)} kg</b></div>`;})()}
  <p class="nfine">El IMC no distingue músculo de grasa: si entrenas fuerte puedes salir alto estando en forma. La grasa se estima con la fórmula de la Marina de EE. UU. a partir de tus medidas.</p></div>`;
}
function progressCard(N,b){
  const C=checkin(N,b),gw=goalWeight(N,b),diff=Math.round((gw-b.wt)*10)/10,rmid=Math.abs(RMID[N.goal]*b.wt)||Math.abs(.005*b.wt);
  const wks=Math.abs(diff)<.3?0:Math.ceil(Math.abs(diff)/rmid),eta=new Date(Date.now()+wks*7*864e5).toLocaleDateString('es-CO',{month:'long',year:'numeric'});
  const lastW=(()=>{for(let i=S.body.length-1;i>=0;i--)if(S.body[i].w!=null)return S.body[i];return null;})(),stale=!lastW||Date.now()-lastW.ts>7*864e5;
  const recent=S.settings.kadjAt&&Date.now()-S.settings.kadjAt<6*864e5;
  let msg='',act='';
  if(C.st==='data')msg=`<b>Pésate una vez por semana</b><span>Con 3 registros en dos semanas veo tu ritmo real y ajusto tus calorías si hace falta.</span>`;
  else{const r=`Vas a <b>${kgw(C.t.rate)} por semana</b> (últimas ${C.t.span} días). Lo ideal para tu objetivo es entre ${kgw(C.lo)} y ${kgw(C.hi)}.`;
    if(C.st==='ok')msg=`<b>Vas al ritmo ideal</b><span>${r} Sigue igual.</span>`;
    else{const why={slow:N.goal==='grasa'?'Estás bajando más lento de lo ideal.':'Estás subiendo más lento de lo ideal.',fast:N.goal==='grasa'?'Estás bajando muy rápido: puedes perder músculo.':'Estás subiendo muy rápido: puede ser grasa.',drift:'Tu peso se está moviendo y tu objetivo es mantenerlo.'}[C.st];
      msg=`<b>${why}</b><span>${r}</span>`;
      const A=typeof fadherence==='function'?fadherence(N,14):null,off=A&&A.n>=5&&Math.abs(A.avg-A.tgt)>A.tgt*.1;
      if(off)msg+=`<span class="fadh">Según tu registro, en las últimas dos semanas comiste en promedio <b>${fk(A.avg)} kcal</b> y tu meta era ${fk(A.tgt)}. Antes de cambiar la meta, intenta cumplirla una semana.</span>`;
      if(C.d&&!recent)act=`<button class="btn sm ${off?'ghost':'pri'}" data-act="kadj" data-v="${C.d}">${C.d>0?'Subir':'Bajar'} ${Math.abs(C.d)} kcal al día${off?' de todas formas':''}</button>`;
      else if(recent)act=`<small class="nfine">Ya ajustamos hace poco. Dale una semana más antes de cambiar otra vez.</small>`;}}
  return `<div class="card nprog"><div class="nph"><div><span class="over">Peso meta</span><div class="ngw"><button class="iconbtn sm" data-act="gwt" data-v="-0.5" aria-label="Bajar meta">−</button><b>${NF.format(gw)} kg</b><button class="iconbtn sm" data-act="gwt" data-v="0.5" aria-label="Subir meta">+</button></div>
    <small>${wks?`${diff>0?'Te faltan':'Te sobran'} ${NF.format(Math.abs(diff))} kg · unas ${wks} semanas a ritmo seguro (${eta})`:'Ya estás en tu meta: ahora a mantener'}</small></div></div>
  ${wgChart(gw)}
  <div class="ncheck ${C.st}"><span class="nic">${C.st==='ok'?IC.check:C.st==='data'?IC.scale:IC.info}</span><div>${msg}${act?`<div class="nca">${act}</div>`:''}</div></div>
  ${stale?`<button class="btn sm ghost block" style="margin-top:10px" data-act="bodyadd">${IC.scale}Registrar mi peso de hoy</button>`:''}
  ${N.kadj?`<div class="nadj">Ajuste por tu progreso: <b>${N.kadj>0?'+':'−'}${Math.abs(N.kadj)} kcal</b><button class="btn sm ghost" data-act="kadj0">Quitar</button></div>`:''}</div>`;
}
/* Peso de las últimas 12 semanas con la línea de la meta */
function wgChart(gw){
  const P=S.body.filter(b=>b.w!=null&&Date.now()-b.ts<=84*864e5);if(P.length<2)return '';
  const W=340,H=110,L=32,R=10,T=10,B=20,iw=W-L-R,ih=H-T-B,vs=P.map(p=>p.w).concat([gw]);
  let lo=Math.min(...vs),hi=Math.max(...vs);const pad=Math.max(.5,(hi-lo)*.15);lo-=pad;hi+=pad;
  const t0=P[0].ts,t1=Math.max(P[P.length-1].ts,t0+864e5),X=t=>L+iw*(t-t0)/(t1-t0),Y=v=>T+ih-ih*(v-lo)/(hi-lo);
  const ln=P.map((p,i)=>(i?'L':'M')+X(p.ts).toFixed(1)+' '+Y(p.w).toFixed(1)).join('');
  const fd=ts=>{const d=new Date(ts);return d.getDate()+'/'+(d.getMonth()+1);};
  return `<svg class="wgc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Peso de las últimas semanas y peso meta">
    <line class="gwl" x1="${L}" x2="${W-R}" y1="${Y(gw)}" y2="${Y(gw)}"/><text class="ax gwt" x="${W-R}" y="${Y(gw)-4}" text-anchor="end">Meta ${NF.format(gw)}</text>
    <path class="ln" d="${ln}"/>${P.map((p,i)=>`<circle class="pt" cx="${X(p.ts).toFixed(1)}" cy="${Y(p.w).toFixed(1)}" r="${i===P.length-1?4.5:3}"/>`).join('')}
    <text class="ax" x="${L}" y="${H-5}">${fd(t0)}</text><text class="ax" x="${W-R}" y="${H-5}" text-anchor="end">${fd(P[P.length-1].ts)}</text>
    <text class="ax" x="${L-5}" y="${Y(P[P.length-1].w)+3}" text-anchor="end">${NF.format(P[P.length-1].w)}</text></svg>`;
}
function targetCard(N){
  const mp=k=>Math.round(N[k]*(k==='f'?9:4)/N.kcal*100);
  return `<div class="card ntarget"><div class="over">Tu meta diaria</div><div class="nkcal"><b>${fk(N.kcal)}</b><span>kcal</span></div>
  <div class="nsub">Gastas cerca de ${fk(N.tdee)} kcal al día · ${GADJ[N.goal][1]}${N.kadj?` · ${N.kadj>0?'+':'−'}${Math.abs(N.kadj)} por tu progreso`:''}</div><div class="nsub" style="margin-top:2px">${N.obs?`Con tus ${NF.format(N.days)} entrenos por semana de las últimas 4 semanas`:`Con los ${N.days} días de entreno de tu plan`}</div>
  <div class="nmac">${[['p','Proteína'],['c','Carbos'],['f','Grasas']].map(([k,l])=>`<div class="m-${k}"><span>${l}</span><b>${N[k]} g</b><i><s style="width:${mp(k)}%"></s></i><small>${mp(k)} %</small></div>`).join('')}</div>
  <div class="nwater">${IC.drop}<span>Agua: <b>${NF.format(N.water)} L</b> al día, <b>${NF.format(N.waterT)} L</b> los días que entrenas</span></div>
  ${N.note?`<div class="tip soft" style="margin-top:12px">${IC.info}<div>${N.note}</div></div>`:''}</div>`;
}
function menuView(N){
  const d=S.fday??todayIdx,M=dayMenu(d,N),WM=workoutMeals(d,M),tr=!!S.program.week[d],kd=dayKcal(d,N);
  const tot=M.reduce((a,m)=>{a.k+=m.tot.k;a.p+=m.tot.p;return a;},{k:0,p:0});
  const wtag=i=>i===WM.pre?`<span class="wtag pre">Antes de entrenar</span>`:i===WM.post?`<span class="wtag post">Después de entrenar</span>`:'';
  const wtip=i=>i===WM.pre?`<div class="wtip">1 a 2 horas antes. Carbohidratos fáciles y poca grasa para llegar con energía.</div>`:i===WM.post?`<div class="wtip">Dentro de las 2 horas siguientes. Proteína y carbohidratos para recuperar.</div>`:'';
  return `<h2 class="h2">Menú <small>${pl(S.settings.meals||4,'comida','comidas')} al día</small></h2>
  <div class="wkplan fdays">${LETTERS3.map((l,i)=>`<button data-act="fday" data-v="${i}" class="${i===d?'on':''} ${i===todayIdx?'today':''}"><span class="l">${l}</span></button>`).join('')}</div>
  <div class="dayk ${tr?'tr':''}">${tr?IC.dumb:IC.moon}<span><b>${tr?'Día de entreno':'Día de descanso'}</b> · ${fk(kd)} kcal${tr&&WM.pre<0&&WM.post>=0&&(S.settings.trainAt||'tar')==='man'?' · antes de entrenar basta un banano o un café':''}</span></div>
  ${M.map((m,i)=>`<div class="card meal ${i===WM.pre||i===WM.post?'wk':''}"><div class="mhd"><div><span class="over">${m.label}${wtag(i)}</span><b>${esc(m.t)}</b></div><button class="btn sm ghost" data-act="mswap" data-v="${d}-${m.slot}" aria-label="Cambiar ${esc(m.label.toLowerCase())}">${IC.swap}<span class="bl">Cambiar</span></button></div>
    <ul>${m.items.map(([id,q])=>`<li>${esc(cap1(qtyText(id,q)))}</li>`).join('')}</ul>${wtip(i)}<div class="mft"><span>${fk(m.tot.k)} kcal</span><span>${fk(m.tot.p)} g proteína</span><span>${fk(m.tot.c)} g carbos</span></div></div>`).join('')}
  <div class="mtot"><span>Total del día</span><b>${fk(tot.k)} kcal · ${fk(tot.p)} g de proteína</b><small>Meta del día: ${fk(kd)} kcal · ${N.p} g</small></div>
  ${d===todayIdx?`<button class="btn pri block" style="margin-top:10px" data-act="fsugday">${IC.check}Registrar el menú de hoy en mi diario</button>`:''}
  <button class="btn ghost block" style="margin-top:10px" data-act="shop">${IC.cart}Lista de mercado</button>`;
}
function foodPrefs(){
  const st=S.settings;
  return `<h2 class="h2">Preferencias</h2><div class="card">
  <div class="set"><span class="lb">Comidas al día</span><div class="seg">${[3,4,5].map(n=>`<button data-act="fmeals" data-v="${n}" aria-pressed="${(st.meals||4)===n}">${n}</button>`).join('')}</div></div>
  <div class="set"><span class="lb">Actividad fuera del entreno<small>${ACT[st.act||'lig'].s}</small></span><div class="seg">${Object.keys(ACT).map(k=>`<button data-act="fact" data-v="${k}" aria-pressed="${(st.act||'lig')===k}">${ACT[k].t.replace('Poco activo','Poco').replace('Algo activo','Algo').replace('Muy activo','Mucho')}</button>`).join('')}</div></div>
  <div class="set"><span class="lb">¿A qué hora entrenas?<small>Para ubicar la comida de antes y de después</small></span><div class="seg">${Object.keys(TRAINAT).map(k=>`<button data-act="ftime" data-v="${k}" aria-pressed="${(st.trainAt||'tar')===k}">${TRAINAT[k][0]}</button>`).join('')}</div></div>
  <div class="set inline"><span class="lb">Sin carne<small>Huevos, lácteos y granos como proteína</small></span><button class="sw" data-act="ftog" data-v="veg" aria-pressed="${!!st.veg}" aria-label="Sin carne"></button></div>
  <div class="set inline"><span class="lb">Incluir proteína en polvo<small>En los batidos y la avena</small></span><button class="sw" data-act="ftog" data-v="whey" aria-pressed="${!!st.whey}" aria-label="Proteína en polvo"></button></div></div>`;
}
function viewFood(){
  const b=myBody();
  let h='';
  if(!bodyReady(b)||!b.sex)return h+`<div class="card empty nempty">${IC.food}<b>Calcula tu alimentación</b>Con tu edad, peso, estatura y sexo te damos tu rango de peso saludable, tus calorías, la proteína y un menú con comida de aquí.<button class="btn pri sm" style="margin:12px auto 0" data-act="mydata">Poner mis datos</button></div>
    <button class="btn ghost block" style="margin-top:10px" data-act="calc">${IC.ruler}Calcular para otra persona</button>`;
  const N=myNutri(),t=S.ftab||'diario';
  h+=`<div class="utabs fseg" role="tablist">${[['diario','Diario'],['menu','Menú sugerido'],['metas','Progreso']].map(([k,l])=>`<button role="tab" data-act="ftabset" data-v="${k}" aria-pressed="${t===k}">${l}</button>`).join('')}</div>`;
  if(t==='menu')h+=menuView(N);
  else if(t==='metas'){h+=progressCard(N,b)+fweekCard(N)+ftdeeCard(N,b)+targetCard(N)+healthCard(b,N)+foodPrefs();
    h+=`<button class="btn ghost block" style="margin-top:10px" data-act="calc">${IC.ruler}Calcular para otra persona</button>`;}
  else h+=diaryView(N);
  h+=`<p class="nfine" style="margin-top:14px">Guía general calculada con fórmulas estándar y tablas de composición de alimentos (ICBF y USDA). Si tienes una condición médica, estás en embarazo o quieres un plan exacto, consulta a un nutricionista.</p>`;
  return h;
}
/* Calculadora para cualquier persona */
let CALC=null;
function calcSheet(){
  const b=myBody();CALC=CALC||{sex:b.sex&&b.sex!=='x'?b.sex:'h',age:b.age||25,wt:b.wt||70,ht:b.ht||170,act:b.act||'lig',goal:'salud'};renderCalc();
}
function renderCalc(){
  const C=CALC,N=nutri(C,C.goal,0);
  const row=(k,l,u,st)=>`<div class="obrow"><span>${l}</span><div class="stepper"><button data-act="cnum" data-v="${k}|${-st}">−</button><input inputmode="decimal" id="cc-${k}" value="${NF.format(C[k])}" aria-label="${l}"><button data-act="cnum" data-v="${k}|${st}">+</button></div><small>${u}</small></div>`;
  sheet(`<h3>Peso saludable y calorías</h3><p class="sub">Para ti o para otra persona. No cambia tu perfil.</p>
  <div class="seg" style="margin-top:12px">${[['h','Hombre'],['m','Mujer']].map(([k,l])=>`<button data-act="csex" data-v="${k}" aria-pressed="${C.sex===k}">${l}</button>`).join('')}</div>
  <div class="obbody" style="margin-top:10px">${row('age','Edad','años',1)}${row('wt','Peso','kg',.5)}${row('ht','Estatura','cm',1)}</div>
  <div class="seg" style="margin-top:10px">${Object.keys(ACT).map(k=>`<button data-act="cact" data-v="${k}" aria-pressed="${C.act===k}">${ACT[k].t.replace('Poco activo','Poco').replace('Algo activo','Algo').replace('Muy activo','Mucho')}</button>`).join('')}</div>
  <div class="seg" style="margin-top:8px">${[['grasa','Bajar'],['salud','Mantener'],['musculo','Subir']].map(([k,l])=>`<button data-act="cgoal" data-v="${k}" aria-pressed="${C.goal===k}">${l}</button>`).join('')}</div>
  <div class="cres"><div><span>Peso saludable</span><b>${NF.format(N.hw.lo)}–${NF.format(N.hw.hi)} kg</b></div><div><span>IMC</span><b>${NF.format(Math.round(N.bmi*10)/10)}</b><small class="tag ${N.cat.k}">${N.cat.t}</small></div>
  <div><span>Gasto diario</span><b>${fk(N.tdee)} kcal</b></div><div><span>Meta</span><b>${fk(N.kcal)} kcal</b></div><div><span>Proteína</span><b>${N.p} g</b></div><div><span>Agua</span><b>${NF.format(N.water)} L</b></div></div>
  ${bmiBar(N.bmi)}${(()=>{const inch=Math.max(0,C.ht/2.54-60),m=C.sex==='m';const f=[['Devine',(m?45.5:50)+2.3*inch],['Robinson',(m?49:52)+(m?1.7:1.9)*inch],['Miller',(m?53.1:56.2)+(m?1.36:1.41)*inch]];
    return `<div class="nideal"><span>Peso ideal según fórmulas clásicas</span><div>${f.map(([n,v])=>`<em>${n} <b>${NF.format(Math.round(v*2)/2)} kg</b></em>`).join('')}</div></div>`;})()}
  <div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);
}
function shopSheet(){
  const N=myNutri();if(!N)return;const L=weekShop(N),done=new Set(S.settings.shopDone||[]);
  sheet(`<h3>Lista de mercado</h3><p class="sub">Para los 7 días del menú. Toca para marcar lo que ya tienes.</p>
  ${Object.keys(FGROUP).filter(g=>L[g]).map(g=>`<div class="shopg"><b>${FGROUP[g]}</b><ul>${L[g].map(([id,q])=>`<li><button data-act="shopck" data-v="${id}" aria-pressed="${done.has(id)}">${IC.check}<span>${esc(cap1(shopText(id,q)))}</span></button></li>`).join('')}</ul></div>`).join('')}
  <div class="acts"><button class="btn" data-act="shopclear">Desmarcar todo</button><button class="btn pri" data-act="close">Listo</button></div>`);
}
/* Mis datos (perfil) */
function myDataSheet(){
  const b=myBody(),st=S.settings;const D={sex:st.sex||'',age:b.age||25,wt:b.wt||70,ht:b.ht||170};MYD=D;renderMyData();
}
let MYD=null;
function renderMyData(){
  const D=MYD,row=(k,l,u,stp)=>`<div class="obrow"><span>${l}</span><div class="stepper"><button data-act="mdnum" data-v="${k}|${-stp}">−</button><input inputmode="decimal" id="md-${k}" value="${NF.format(D[k])}" aria-label="${l}"><button data-act="mdnum" data-v="${k}|${stp}">+</button></div><small>${u}</small></div>`;
  sheet(`<h3>Mis datos</h3><p class="sub">Para tus calorías, tu peso saludable y los pesos iniciales. El peso nuevo queda en tu registro.</p>
  <div class="seg" style="margin-top:12px">${Object.keys(SEXES).map(k=>`<button data-act="mdsex" data-v="${k}" aria-pressed="${D.sex===k}">${SEXES[k][0].replace('Prefiero no decirlo','Sin decir')}</button>`).join('')}</div>
  <div class="obbody" style="margin-top:10px">${row('age','Edad','años',1)}${row('wt','Peso','kg',.5)}${row('ht','Estatura','cm',1)}</div>
  <div class="acts"><button class="btn pri" data-act="mdsave">Guardar</button><button class="btn" data-act="close">Cancelar</button></div>`);
}
const readNum=(pre,O,keys)=>keys.forEach(k=>{const i=$('#'+pre+k);if(!i)return;const v=parseFloat(String(i.value).replace(',','.'));if(!isNaN(v))O[k]=k==='wt'?Math.round(v*10)/10:Math.round(v);});
/* Mi equipo (perfil) */
let MYEQ=null;
function myEqSheet(){MYEQ={eq:(S.settings.eq||['db']).slice(),open:placeOf(S.settings.eq)==='custom'};renderMyEq();}
function renderMyEq(){
  const pk=MYEQ.open?'custom':placeOf(MYEQ.eq);
  sheet(`<h3>Dónde entrenas</h3><p class="sub">El plan y la lista de ejercicios usan solo este equipo.</p>
  <div class="opts sm" style="margin-top:10px">${Object.keys(PLACES).map(k=>`<button class="opt" data-act="meqplace" data-v="${k}" aria-pressed="${pk===k}"><span><b>${PLACES[k].t}</b><small>${PLACES[k].s}</small></span><span class="ock">${IC.check}</span></button>`).join('')}
  <button class="opt" data-act="meqplace" data-v="custom" aria-pressed="${pk==='custom'}"><span><b>Elegir uno por uno</b><small>Máquinas, poleas, barra, bandas…</small></span><span class="ock">${IC.check}</span></button></div>
  ${pk==='custom'?`<div class="eqlist">${eqChecklist(MYEQ.eq,'meq')}</div>`:''}
  <div class="acts"><button class="btn pri" data-act="meqsave" data-v="re">Guardar y rehacer mi plan</button><button class="btn" data-act="meqsave">Solo guardar</button><button class="btn ghost" data-act="close">Cancelar</button></div>`);
}
function foodAct(a,v){
  const st=S.settings;
  switch(a){
    case 'ptabset':S.planTab=v;render();window.scrollTo(0,0);return true;
    case 'ptabgo':S.planTab=v;S.tab='plan';S.mePage=null;render();window.scrollTo(0,0);return true;
    case 'fday':S.fday=+v;render();return true;
    case 'libeq':S.lib.eq=v;render();return true;
    case 'mswap':{const sw=st.mswap||(st.mswap={});sw[v]=(sw[v]||0)+1;saveSettings();render();return true;}
    case 'fmeals':st.meals=+v;st.mswap={};saveSettings();render();return true;
    case 'fact':st.act=v;saveSettings();render();return true;
    case 'ftime':st.trainAt=v;saveSettings();render();return true;
    case 'kadj':st.kadj=(st.kadj||0)+(+v);st.kadjAt=Date.now();saveSettings();render();toast(IC.check+`<span>Meta ajustada: ${+v>0?'+':'−'}${Math.abs(+v)} kcal al día</span>`);return true;
    case 'kadj0':st.kadj=0;st.kadjAt=0;saveSettings();render();return true;
    case 'gwt':{const b=myBody(),N=myNutri();if(!N)return true;st.goalWt=Math.round((goalWeight(N,b)+(+v))*2)/2;saveSettings();render();return true;}
    case 'ftog':st[v]=!st[v];saveSettings();render();return true;
    case 'shop':shopSheet();return true;
    case 'shopck':{const s=new Set(st.shopDone||[]);s.has(v)?s.delete(v):s.add(v);st.shopDone=[...s];saveSettings();shopSheet();return true;}
    case 'shopclear':st.shopDone=[];saveSettings();shopSheet();return true;
    case 'calc':CALC=null;calcSheet();return true;
    case 'cnum':{readNum('cc-',CALC,['age','wt','ht']);const [k,d]=v.split('|');CALC[k]=Math.round((CALC[k]+(+d))*10)/10;renderCalc();return true;}
    case 'csex':readNum('cc-',CALC,['age','wt','ht']);CALC.sex=v;renderCalc();return true;
    case 'cact':readNum('cc-',CALC,['age','wt','ht']);CALC.act=v;renderCalc();return true;
    case 'cgoal':readNum('cc-',CALC,['age','wt','ht']);CALC.goal=v;renderCalc();return true;
    case 'mydata':myDataSheet();return true;
    case 'mdnum':{readNum('md-',MYD,['age','wt','ht']);const [k,d]=v.split('|');MYD[k]=Math.round((MYD[k]+(+d))*10)/10;renderMyData();return true;}
    case 'mdsex':readNum('md-',MYD,['age','wt','ht']);MYD.sex=v;renderMyData();return true;
    case 'mdsave':{readNum('md-',MYD,['age','wt','ht']);const D=MYD;if(!(D.age>=12&&D.age<=99&&D.wt>=30&&D.wt<=250&&D.ht>=120&&D.ht<=230)){toast('Revisa los números');return true;}
      st.sex=D.sex||st.sex;st.age=D.age;st.ht=D.ht;st.wt=D.wt;if(lastWeight()!==D.wt)addBody({id:'mcb-'+Date.now(),ts:Date.now(),w:D.wt});saveSettings();closeSheet();render();toast('Datos guardados');return true;}
    case 'myeq':myEqSheet();return true;
    case 'meqplace':if(v==='custom')MYEQ.open=true;else{MYEQ.open=false;MYEQ.eq=PLACES[v].eq.slice();}renderMyEq();return true;
    case 'meq':{const k=MYEQ.eq.indexOf(v);if(k>=0)MYEQ.eq.splice(k,1);else MYEQ.eq.push(v);renderMyEq();return true;}
    case 'meqsave':{st.eq=MYEQ.eq.slice();saveSettings();closeSheet();
      if(v==='re'&&S.program.gen){const g=Object.assign({},S.program.gen,{eq:st.eq.slice()});S.program=genProgram(g);saveProgram();toast(IC.check+'<span>Plan rehecho con tu equipo</span>');}else toast('Equipo guardado');
      render();return true;}
  }
  return false;
}
