/* Plan personalizado: generador, programa activo y utilidades */

/* ===================== v4 · plan personalizado ===================== */
const PAT={'Press de pecho en el piso':'hpush','Press de pecho agarre neutro':'hpush','Flexiones de pecho':'hpush','Flexiones con pies elevados':'hpush',
  'Press militar sentado':'vpush','Press Arnold':'vpush','Aperturas en el piso':'fly','Pullover acostado':'fly','Elevaciones laterales':'lat',
  'Extensión de tríceps sobre la cabeza':'tri','Patada de tríceps':'tri','Flexiones cerradas':'tri',
  'Remo a una mano':'row','Remo inclinado':'row','Remo inclinado agarre supino':'row','Remo a una mano con pausa':'row','Pájaros':'rear',
  'Curl de bíceps':'bi','Curl martillo':'bi','Curl concentrado':'bi','Curl inverso':'bi',
  'Sentadilla goblet':'squat','Sentadilla sumo':'squat','Peso muerto rumano':'hinge','Puente de glúteo con mancuerna':'glute',
  'Zancadas alternas':'lunge','Sentadilla búlgara':'lunge','Step-ups':'lunge','Zancada reversa':'lunge','Elevación de talones':'calf',
  'Plancha':'core','Plancha lateral':'core','Bird dog':'core','Elevación de piernas con rodillas dobladas':'core'};
const KIND=n=>{const p=PAT[n];return ['hpush','vpush','row','squat','hinge','glute','lunge'].includes(p)?'c':p==='core'?'core':'i';};
const LIMITS={rodilla:{t:'Rodillas',s:'Sin zancadas ni step-ups',x:['Zancadas alternas','Sentadilla búlgara','Step-ups','Zancada reversa']},
  hombro:{t:'Hombros',s:'Sin press por encima de la cabeza',x:['Press militar sentado','Press Arnold','Pullover acostado','Flexiones con pies elevados','Extensión de tríceps sobre la cabeza']},
  lumbar:{t:'Espalda baja',s:'Sin peso muerto ni remo inclinado',x:['Peso muerto rumano','Remo inclinado','Remo inclinado agarre supino']}};
const GOALS={musculo:{t:'Ganar músculo',s:'Series de 8 a 15 repeticiones, descansos medios',ic:'dumb'},fuerza:{t:'Ganar fuerza',s:'Menos repeticiones, más peso y descansos largos',ic:'bolt'},
  grasa:{t:'Bajar grasa',s:'Más repeticiones y descansos cortos',ic:'flame'},salud:{t:'Salud y forma',s:'Rutinas cortas, equilibradas y sostenibles',ic:'star'}};
const LEVELS={nuevo:{t:'Principiante',s:'Menos de 6 meses entrenando'},inter:{t:'Intermedio',s:'Entre 6 meses y 2 años'},avanzado:{t:'Avanzado',s:'Más de 2 años de forma constante'}};
const SLOT={H:['Press de pecho en el piso','Press de pecho agarre neutro','Flexiones de pecho'],H2:['Press de pecho agarre neutro','Flexiones con pies elevados','Press de pecho en el piso','Flexiones de pecho'],
  PU:['Flexiones de pecho','Flexiones cerradas'],
  V:['Press militar sentado','Press Arnold','Elevaciones laterales'],V2:['Press Arnold','Press militar sentado','Elevaciones laterales'],
  R:['Remo a una mano','Remo inclinado agarre supino','Remo a una mano con pausa'],R2:['Remo inclinado','Remo a una mano con pausa','Remo a una mano'],R3:['Remo inclinado agarre supino','Remo a una mano con pausa','Remo a una mano'],
  SQ:['Sentadilla goblet','Sentadilla sumo','Puente de glúteo con mancuerna'],SQ2:['Sentadilla sumo','Sentadilla goblet','Puente de glúteo con mancuerna'],
  HI:['Peso muerto rumano','Puente de glúteo con mancuerna'],GL:['Puente de glúteo con mancuerna','Peso muerto rumano'],
  LU:['Zancada reversa','Step-ups','Puente de glúteo con mancuerna'],LU2:['Sentadilla búlgara','Zancadas alternas','Step-ups','Puente de glúteo con mancuerna'],LU3:['Zancadas alternas','Step-ups','Zancada reversa','Peso muerto rumano'],
  FLY:['Aperturas en el piso','Pullover acostado'],LAT:['Elevaciones laterales'],REAR:['Pájaros'],
  TRI:['Extensión de tríceps sobre la cabeza','Patada de tríceps'],TRI2:['Patada de tríceps','Flexiones cerradas','Extensión de tríceps sobre la cabeza'],
  BI:['Curl de bíceps','Curl martillo'],BI2:['Curl martillo','Curl concentrado'],BI3:['Curl concentrado','Curl inverso'],CALF:['Elevación de talones'],
  C1:['Plancha'],C2:['Bird dog'],C3:['Elevación de piernas con rodillas dobladas'],C4:['Plancha lateral']};
const DAYT={
  fa:{t:'Cuerpo completo A',w:'full',sl:'SQ H R V HI C1'},fb:{t:'Cuerpo completo B',w:'full',sl:'LU H2 R2 LAT BI TRI C2'},fc:{t:'Cuerpo completo C',w:'full',sl:'SQ2 GL H2 R3 V2 TRI2 C3'},
  ta:{t:'Torso A',w:'upper',sl:'H R V R2 LAT BI TRI'},tb:{t:'Torso B',w:'upper',sl:'H2 R3 V2 FLY REAR BI2 TRI2'},
  pa:{t:'Pierna A',w:'legs',sl:'SQ HI LU CALF C1'},pb:{t:'Pierna B',w:'legs',sl:'SQ2 GL LU2 CALF C4 C3'},
  em:{t:'Empuje',w:'push',sl:'H2 V2 FLY LAT TRI2 PU'},ti:{t:'Tirón',w:'pull',sl:'R2 R3 REAR BI BI3 C2'},
  e1:{t:'Empuje A',w:'push',sl:'H V FLY LAT TRI PU'},t1:{t:'Tirón A',w:'pull',sl:'R R2 FLY REAR BI BI2'},l1:{t:'Pierna A',w:'legs',sl:'SQ HI LU3 LU2 CALF C1'},
  e2:{t:'Empuje B',w:'push',sl:'H2 V2 PU LAT TRI2 TRI'},t2:{t:'Tirón B',w:'pull',sl:'R3 R REAR BI3 BI3 C2'},l2:{t:'Pierna B',w:'legs',sl:'SQ2 GL LU LU3 C4 C3'}};
const TPL={2:{n:'Cuerpo completo · 2 días',d:['fa','fb'],wd:[0,3]},3:{n:'Cuerpo completo · 3 días',d:['fa','fb','fc'],wd:[0,2,4]},
  4:{n:'Torso y pierna · 4 días',d:['ta','pa','tb','pb'],wd:[0,1,3,4]},5:{n:'Torso, pierna, empuje y tirón · 5 días',d:['ta','pa','em','ti','pb'],wd:[0,1,3,4,5]},
  6:{n:'Empuje, tirón y pierna · 6 días',d:['e1','t1','l1','e2','t2','l2'],wd:[0,1,2,3,4,5]}};
const WKIND={push:'push',pull:'pull',legs:'legs',lower:'legs',full:'full',upper:'upper'};
WARMUPS.full=[['Trote o saltos en el sitio','1 min'],['Círculos de brazos y rotaciones de hombro','30 s'],['Sentadilla sin peso','10 reps'],['Bisagra de cadera sin peso','10 reps'],['Flexiones con rodillas apoyadas','8 reps']];
WARMUPS.upper=[['Trote o saltos en el sitio','1 min'],['Círculos de brazos y rotaciones de hombro','30 s'],['Gato-camello en cuatro apoyos','8 reps'],['Pájaros sin peso','15 reps'],['Flexiones con rodillas apoyadas','10 reps']];

function scaleTime(lbl,f){return lbl.replace(/(\d+)(?:–(\d+))?\s*s/,(m,a,b)=>{const r=x=>Math.max(10,Math.round(x*f/5)*5);return b?`${r(+a)}–${r(+b)} s`:`${r(+a)} s`;});}
function doseFor(n,gen){
  const e=EXMAP[n],ds=dose(e),k=KIND(n),side=ds.side?' por '+ds.side:'',goal=gen.goal||'musculo',lvl=gen.lvl||'inter';
  let sets=ds.sets,reps=ds.label,rest=e.rest||60;
  if(ds.timed){sets=3;reps=lvl==='nuevo'?scaleTime(ds.label,.7):lvl==='avanzado'?scaleTime(ds.label,1.35):ds.label;rest=45;}
  else if(ds.fail){sets=lvl==='nuevo'?2:3;rest=90;}
  else if(goal!=='musculo'){
    const T={c:{fuerza:[4,'6–8',120],grasa:[3,'12–15',60],salud:[3,'10–12',75]},i:{fuerza:[3,'8–12',75],grasa:[3,'15–20',40],salud:[2,'12–15',60]},core:{fuerza:[3,'10–12',60],grasa:[3,'12–15',30],salud:[2,'10–12',45]}}[k][goal];
    sets=T[0];reps=T[1]+side;rest=T[2];
    if(goal==='fuerza'&&PAT[n]==='lunge'){sets=4;reps='6–10'+side;rest=120;}
  }
  if(lvl==='nuevo')sets=Math.max(2,sets-1);else if(lvl==='avanzado'&&k==='c')sets=Math.min(5,sets+1);
  return {n,sets,reps,rest};
}
function genDay(key,gen){
  const T=DAYT[key],ex=new Set(),bad=new Set();(gen.lim||[]).forEach(l=>(LIMITS[l]?LIMITS[l].x:[]).forEach(x=>bad.add(x)));
  const list=[];
  T.sl.split(' ').forEach(s=>{const c=SLOT[s];let n=c.find(x=>!bad.has(x)&&!ex.has(x)&&EXMAP[x]);
    if(!n){const p=PAT[c[0]];n=ALLEX.map(e=>e.n).find(x=>PAT[x]===p&&!bad.has(x)&&!ex.has(x));}
    if(n){ex.add(n);list.push(doseFor(n,gen));}});
  const dur=gen.dur||60;
  const est=l=>estimate(l.map(x=>({e:rex(x),sets:x.sets})));
  while(list.length>4&&est(list)>dur+4){let i=-1;for(let j=list.length-1;j>=0;j--)if(KIND(list[j].n)==='i'){i=j;break;}if(i<0)i=list.length-1;list.splice(i,1);}
  for(let g=0;g<20&&est(list)>dur+4;g++){const big=list.filter(x=>x.sets>3).sort((a,b)=>b.sets-a.sets)[0];if(big){big.sets--;continue;}
    const slow=list.filter(x=>x.rest>90).sort((a,b)=>b.rest-a.rest)[0];if(slow){slow.rest-=30;continue;}
    if(list.length>3){list.splice(list.length-1,1);continue;}break;}
  return {id:key,t:T.t,w:T.w,ex:list};
}
function genProgram(gen){
  const t=TPL[gen.n]||TPL[3];const wd=(gen.wd&&gen.wd.length===t.d.length?gen.wd:t.wd).slice().sort((a,b)=>a-b);
  const days=t.d.map(k=>genDay(k,gen));const week=[null,null,null,null,null,null,null];wd.forEach((w,i)=>week[w]=days[i].id);
  return {v:4,gen:Object.assign({},gen,{wd}),name:t.n,days,week,at:Date.now()};
}
function legacyProgram(){
  return {v:4,gen:null,name:'Empuje, tirón y pierna · 6 días',legacy:true,
    days:DAYS.map(d=>({id:d.id,t:d.t,w:WTYPE[d.id],ex:d.ex.map(e=>{const ds=dose(e);return {n:e.n,sets:ds.sets,reps:ds.label,rest:e.rest||60};})})),
    week:['lunes','martes','miercoles','jueves','viernes','sabado',null],at:Date.now()};
}
const rex=x=>Object.assign({},EXMAP[x.n],{r:x.sets+' × '+x.reps,rest:x.rest,ss:!!x.ss});
const LEGACY={};DAYS.forEach(d=>LEGACY[d.id]={id:d.id,t:d.t,w:WTYPE[d.id],ex:d.ex});
S.program=LS.get('mc-prog',null);
if(!S.program||S.program.v!==4||!Array.isArray(S.program.days))S.program=legacyProgram();
let PD={};
function rebuildProgram(){PD={};S.program.days.forEach(d=>{d.ex=d.ex.filter(x=>EXMAP[x.n]);PD[d.id]=Object.assign({},d,{ex:d.ex.map(rex)});});}
rebuildProgram();
function saveProgram(){S.program.at=Date.now();rebuildProgram();LS.set('mc-prog',S.program);if(COL)COL.doc('mc-program').set(JSON.parse(JSON.stringify(S.program))).catch(()=>{});}
const dayAt=i=>PD[S.program.week[i]]||null;
const dayById=id=>PD[id]||LEGACY[id]||null;
const titleOf=r=>r.t||(dayById(r.day)||{}).t||'Entrenamiento';
const kindOf=r=>WKIND[r.w||(dayById(r.day)||{}).w]||'full';
const trainDays=()=>S.program.week.filter(Boolean).length;
const exOf=it=>Object.assign({},EXMAP[it.n],it.r?{r:it.r}:{},it.rest?{rest:it.rest}:{});
function progSummary(){const g=S.program.gen;if(!g)return 'Tu plan original de 6 días';return `${GOALS[g.goal].t} · ${LEVELS[g.lvl].t} · ${pl(trainDays(),'día','días')} · ~${g.dur} min`;}

/* ---------- bloque de abdomen ---------- */
const COREPOOL=['Plancha','Plancha lateral','Bird dog','Elevación de piernas con rodillas dobladas'];
const COREDAYS=['lunes','martes','jueves','viernes'];

function lastFeelFor(name){for(const h of S.history){if((h.ex||[]).some(z=>z.n===name))return h.feel||null;}return null;}

/* imagen de cada paso del calentamiento */
const WIMG={'Trote o saltos en el sitio':'hiit-jacks','Círculos de brazos y rotaciones de hombro':'mob-brazos','Pájaros sin peso':'pajaros-b','Flexiones con rodillas apoyadas':'flexiones-b',
  'Gato-camello en cuatro apoyos':'st-gato','Bisagra de cadera sin peso':'rumano-b','Sentadilla sin peso':'mob-sentadilla','Puente de glúteo sin peso':'puente-b','Zancada reversa sin peso':'zancadas-b'};
Object.values(WARMUPS).forEach(l=>l.forEach(w=>{w[2]=WIMG[w[0]]||null;}));
const warmImg=(L,w)=>w&&w[2]?w[2]:((ART[L.items[0]&&L.items[0].n]||['mob-brazos'])[0]);
