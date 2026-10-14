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
XLIB.forEach(x=>{PAT[x.n]=x.p;});
const KIND=n=>{const p=PAT[n];return ['hpush','vpush','row','vpull','squat','hinge','glute','lunge'].includes(p)?'c':p==='core'?'core':'i';};
/* Molestias: patrones y ejercicios que se evitan */
const LIMITS={rodilla:{t:'Rodillas',s:'Sin zancadas, step-ups ni extensiones',p:['lunge'],x:['Step-ups','Extensión de cuádriceps','Sentadilla hack','Sentadilla en la pared']},
  hombro:{t:'Hombros',s:'Sin press por encima de la cabeza ni fondos',p:['vpush'],x:['Pullover acostado','Pullover en polea','Flexiones con pies elevados','Extensión de tríceps sobre la cabeza','Extensión de tríceps sobre la cabeza en polea','Fondos en paralelas','Fondos en silla','Press francés con barra']},
  lumbar:{t:'Espalda baja',s:'Sin peso muerto, remo inclinado ni sentadilla con barra',p:[],x:['Peso muerto rumano','Remo inclinado','Remo inclinado agarre supino','Peso muerto con barra','Peso muerto rumano con barra','Remo con barra','Sentadilla con barra','Swing con kettlebell','Superman','Hiperextensiones']}};
const limited=(n,lim)=>(lim||[]).some(l=>{const L=LIMITS[l];return L&&(L.x.includes(n)||L.p.includes(PAT[n]));});
const GOALS={musculo:{t:'Ganar músculo',s:'Series de 8 a 15 repeticiones, descansos medios',ic:'dumb'},fuerza:{t:'Ganar fuerza',s:'Menos repeticiones, más peso y descansos largos',ic:'bolt'},
  grasa:{t:'Bajar grasa',s:'Más repeticiones y descansos cortos',ic:'flame'},salud:{t:'Salud y forma',s:'Rutinas cortas, equilibradas y sostenibles',ic:'star'}};
const LEVELS={nuevo:{t:'Principiante',s:'Menos de 6 meses entrenando'},inter:{t:'Intermedio',s:'Entre 6 meses y 2 años'},avanzado:{t:'Avanzado',s:'Más de 2 años de forma constante'}};
const FOCUS={equilibrado:{t:'Todo el cuerpo por igual',s:'Plan balanceado'},gluteo:{t:'Glúteos y piernas',s:'Más trabajo de glúteo, isquios y cadera'},
  superior:{t:'Pecho, espalda y hombros',s:'Más volumen en el torso'},brazos:{t:'Brazos',s:'Bíceps y tríceps extra'},core:{t:'Abdomen',s:'Un ejercicio de abdomen extra cada día'}};
/* Candidatos por puesto, del más completo al más simple: el generador toma el primero que se pueda hacer con el equipo */
const SLOT={
  H:['Press de banca con barra','Press de banca con mancuernas','Press de pecho en máquina','Press de pecho en el piso','Flexiones de pecho','Flexiones inclinadas'],
  H2:['Press inclinado con mancuernas','Press inclinado en Smith','Press de pecho en máquina','Press de pecho agarre neutro','Flexiones con pies elevados','Flexiones de pecho','Flexiones inclinadas'],
  PU:['Flexiones de pecho','Flexiones cerradas','Flexiones inclinadas'],
  V:['Press militar con barra','Press militar sentado','Press de hombro en máquina','Press Arnold','Flexiones pica'],
  V2:['Press Arnold','Press de hombro en máquina','Press militar sentado','Flexiones pica'],
  VP:['Jalón al pecho','Dominadas','Jalón con banda','Pullover en polea'],VP2:['Dominadas supinas','Jalón agarre cerrado','Pullover en polea','Jalón con banda'],
  R:['Remo con barra','Remo sentado en máquina','Remo a una mano','Remo en polea baja','Remo con banda','Remo invertido bajo la mesa'],
  R2:['Remo en polea baja','Remo apoyado en banco inclinado','Remo inclinado','Remo a una mano con pausa','Remo a una mano','Remo con banda','Remo invertido bajo la mesa'],
  R3:['Remo apoyado en banco inclinado','Remo inclinado agarre supino','Remo a una mano con pausa','Remo sentado en máquina','Remo a una mano','Remo invertido bajo la mesa'],
  SQ:['Sentadilla con barra','Prensa de piernas','Sentadilla goblet','Sentadilla en Smith','Sentadilla libre'],
  SQ2:['Prensa de piernas','Sentadilla hack','Sentadilla sumo','Sentadilla goblet','Sentadilla en Smith','Sentadilla libre'],
  HI:['Peso muerto rumano con barra','Peso muerto rumano','Swing con kettlebell','Peso muerto a una pierna sin peso'],
  HI2:['Peso muerto con barra','Peso muerto rumano','Swing con kettlebell','Hiperextensiones','Peso muerto a una pierna sin peso'],
  GL:['Hip thrust con barra','Hip thrust con mancuerna','Puente de glúteo con mancuerna','Puente de glúteo a una pierna'],
  GL2:['Patada de glúteo en máquina','Patada de glúteo en polea','Abducción de cadera en máquina','Puente de glúteo a una pierna'],
  LU:['Zancada reversa','Step-ups','Zancada reversa sin peso','Puente de glúteo con mancuerna'],LU2:['Sentadilla búlgara','Zancadas alternas','Sentadilla búlgara sin peso','Step-ups'],
  LU3:['Zancadas alternas','Step-ups','Zancada reversa','Zancada reversa sin peso'],
  Q:['Extensión de cuádriceps'],HM:['Curl femoral acostado','Curl femoral sentado'],ABD:['Abducción de cadera en máquina'],ADD:['Aducción de cadera en máquina'],BK:['Hiperextensiones','Superman'],
  FLY:['Cruce de poleas','Aperturas en pec deck','Aperturas en banco','Aperturas en el piso'],PO:['Pullover en polea','Pullover acostado'],
  LAT:['Elevaciones laterales','Elevación lateral en polea'],REAR:['Face pull en polea','Pájaros en pec deck','Pájaros','Face pull con banda','Separación de banda','Y-T-W boca abajo'],
  TRI:['Extensión de tríceps en polea','Press francés con barra','Extensión de tríceps sobre la cabeza','Fondos en paralelas','Fondos en silla','Flexiones cerradas'],
  TRI2:['Extensión de tríceps sobre la cabeza en polea','Patada de tríceps','Fondos en paralelas','Flexiones cerradas','Extensión de tríceps sobre la cabeza','Fondos en silla'],
  BI:['Curl con barra','Curl de bíceps','Curl en polea','Dominadas supinas'],BI2:['Curl martillo','Curl inclinado','Curl en banco predicador','Curl en polea'],BI3:['Curl en banco predicador','Curl concentrado','Curl inverso','Curl martillo'],
  CALF:['Elevación de talones en máquina','Elevación de talones','Elevación de talones a una pierna'],
  C1:['Plancha'],C2:['Bird dog','Pallof press en polea','Pallof press con banda'],C3:['Elevación de rodillas colgado','Crunch en polea','Elevación de piernas con rodillas dobladas'],C4:['Plancha lateral'],C5:['Hollow hold','Crunch','Escaladores']};
/* Días: "A|B" toma A y, si no se puede, B */
const DAYT={
  fa:{t:'Cuerpo completo A',w:'full',sl:'SQ H VP|R R V HI C1'},fb:{t:'Cuerpo completo B',w:'full',sl:'LU H2 VP2|R2 R2 LAT BI TRI C2'},fc:{t:'Cuerpo completo C',w:'full',sl:'SQ2 GL HM H2 R3 V2 TRI2 C3'},
  ta:{t:'Torso A',w:'upper',sl:'H R VP|R2 V LAT BI TRI'},tb:{t:'Torso B',w:'upper',sl:'H2 R3 VP2 V2 FLY REAR BI2 TRI2'},
  pa:{t:'Pierna A',w:'legs',sl:'SQ HI LU Q CALF C1'},pb:{t:'Pierna B',w:'legs',sl:'SQ2 GL LU2 HM CALF C4 C3'},
  em:{t:'Empuje',w:'push',sl:'H2 V2 FLY LAT TRI2 PU'},ti:{t:'Tirón',w:'pull',sl:'VP R2 R3 REAR BI BI3 C2'},
  e1:{t:'Empuje A',w:'push',sl:'H V FLY LAT TRI PU'},t1:{t:'Tirón A',w:'pull',sl:'VP R R2 PO REAR BI BI2'},l1:{t:'Pierna A',w:'legs',sl:'SQ HI LU3 Q|LU2 HM CALF C1'},
  e2:{t:'Empuje B',w:'push',sl:'H2 V2 PU LAT TRI2 TRI'},t2:{t:'Tirón B',w:'pull',sl:'VP2 R3 R REAR BI3 BI3 C2'},l2:{t:'Pierna B',w:'legs',sl:'SQ2 GL LU HM|LU3 C4 C3'}};
/* Enfoque: puestos extra según la zona que se quiere priorizar */
const FOCUSX={gluteo:{legs:'GL GL2 ABD',full:'GL2'},superior:{upper:'FLY LAT',push:'FLY',pull:'REAR',full:'FLY'},brazos:{upper:'BI2 TRI2',push:'TRI2',pull:'BI2',full:'BI2 TRI2'},
  core:{upper:'C5',push:'C5',pull:'C5',legs:'C5',full:'C5'}};
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
    const T={c:{fuerza:[4,'5–8',150],grasa:[3,'12–15',60],salud:[3,'10–12',75]},i:{fuerza:[3,'8–12',75],grasa:[3,'15–20',40],salud:[2,'12–15',60]},core:{fuerza:[3,'10–12',60],grasa:[3,'12–15',30],salud:[2,'10–12',45]}}[k][goal];
    sets=T[0];reps=T[1]+side;rest=T[2];
    if(goal==='fuerza'&&PAT[n]==='lunge'){sets=4;reps='6–10'+side;rest=120;}
    if(goal==='fuerza'&&PAT[n]==='vpull'&&EXMAP[n].ld==='bw'){reps='4–8';}
  }
  if(lvl==='nuevo')sets=Math.max(2,sets-1);else if(lvl==='avanzado'&&k==='c')sets=Math.min(5,sets+1);
  return {n,sets,reps,rest};
}
function genDay(key,gen){
  const T=DAYT[key],ex=new Set(),eqs=new Set(gen.eq||['db']),list=[],focus=new Set();
  const ok=x=>EXMAP[x]&&!ex.has(x)&&!limited(x,gen.lim)&&canDo(EXMAP[x],eqs)&&!(gen.lvl==='nuevo'&&(x==='Dominadas'||x==='Dominadas supinas'));
  const pickSlot=s=>{let c=SLOT[s];if(!c)return null;if(gen.lvl==='nuevo')c=c.filter(x=>(EXMAP[x]||{}).ld!=='bb').concat(c.filter(x=>(EXMAP[x]||{}).ld==='bb'));let n=c.find(ok);
    if(!n&&!['Q','HM','ABD','ADD','BK','VP','VP2','PO','FLY','LAT','REAR','BI','BI2','BI3','CALF'].includes(s)){const p=PAT[c[0]];n=ALLEX.map(e=>e.n).find(x=>PAT[x]===p&&ok(x));}
    if(!n&&(s==='VP'||s==='VP2')&&gen.lvl==='nuevo'&&eqs.has('pull')&&ok('Dominadas negativas'))n='Dominadas negativas';
    return n||null;};
  let toks=T.sl.split(' ');
  const fx=gen.focus&&FOCUSX[gen.focus]&&FOCUSX[gen.focus][T.w];
  if(fx){const ci=toks.findIndex(t=>/^C\d/.test(t));const have=new Set(toks.flatMap(t=>t.split('|')));const add=fx.split(' ').filter(t=>!have.has(t));add.forEach(t=>focus.add(t));
    toks.splice(ci<0?toks.length:ci,0,...add);}
  toks.forEach(tok=>{let n=null,used=null;for(const s of tok.split('|')){n=pickSlot(s);if(n){used=s;break;}}
    if(n){ex.add(n);list.push(Object.assign(doseFor(n,gen),focus.has(used)?{fx:1}:{}));}});
  const dur=gen.dur||60;
  const est=l=>estimate(l.map(x=>({e:rex(x),sets:x.sets})));
  const drop=()=>{for(const pass of [0,1])for(let j=list.length-1;j>=0;j--)if(KIND(list[j].n)==='i'&&(pass||!list[j].fx))return j;return -1;};
  const cap=(gen.lvl==='nuevo'?6:gen.lvl==='avanzado'?8:7)+(list.some(x=>KIND(x.n)==='core')?1:0);
  while(list.length>cap){let i=drop();if(i<0)i=list.length-1;list.splice(i,1);}
  while(list.length>4&&est(list)>dur+4){let i=drop();if(i<0)i=list.length-1;list.splice(i,1);}
  for(let g=0;g<20&&est(list)>dur+4;g++){const big=list.filter(x=>x.sets>3).sort((a,b)=>b.sets-a.sets)[0];if(big){big.sets--;continue;}
    const slow=list.filter(x=>x.rest>90).sort((a,b)=>b.rest-a.rest)[0];if(slow){slow.rest-=30;continue;}
    if(list.length>3){list.splice(list.length-1,1);continue;}break;}
  list.forEach(x=>delete x.fx);
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
// Con máquinas de cardio, el primer paso del calentamiento es en la máquina
const CARDIO=['cinta','bici','eliptica','remoerg'];
function warmSteps(L){const W=WARMUPS[kindOf(L)];const c=CARDIO.filter(q=>myEq().has(q));if(!c.length)return W;
  return [[c.length>1?'Caminadora, bici o elíptica suave':'Cardio suave en '+EQ[c[0]].t.toLowerCase(),'1 min',WIMG['Trote o saltos en el sitio']],...W.slice(1)];}
const warmImg=(L,w)=>w&&w[2]?w[2]:((ART[L.items[0]&&L.items[0].n]||['mob-brazos'])[0]);
