/* Biblioteca ampliada (data/05-library.js) y equipo disponible */

// Registrar los ejercicios nuevos junto a los originales
XLIB.forEach(x=>{if(EXMAP[x.n])return;const e={n:x.n,r:x.r,c:x.c,rest:x.rest,eq:x.eq,ld:x.ld,kg0:x.kg||null,xl:true,days:[]};
  EXMAP[x.n]=e;ALLEX.push(e);INFO[x.n]={hl:[],m:x.m,steps:x.steps,err:x.err};});
// Los originales: mancuernas, salvo los de peso corporal
ALLEX.forEach(e=>{if(!e.eq)e.eq=XEQ0[e.n]||['db'];if(!e.ld)e.ld=isBW(e)?'bw':'db';});

const slug=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const myEq=()=>new Set(S.settings.eq||['db']);
const canDo=(e,set)=>!e||(e.eq||[]).every(q=>(set||myEq()).has(q));
const eqNeed=(e,set)=>(e.eq||[]).filter(q=>!(set||myEq()).has(q)).map(q=>EQ[q]?EQ[q].t:q);
const kgLabel=e=>e&&e.ld==='db'?'Kg c/u':'Kg';
const LDIC={bw:'body',band:'band',kb:'kb',db:'dumb',bb:'barbell',mach:'gym',cable:'gym'};
// Peso inicial sugerido para un ejercicio sin historial
function startKg(e){
  if(!e||!e.kg0)return S.settings.kg;
  const sx=S.settings.sex;let k=sx==='m'?e.kg0[1]:sx==='h'?e.kg0[0]:(e.kg0[0]+e.kg0[1])/2;
  const lv=(S.program&&S.program.gen||{}).lvl;k*=lv==='avanzado'?1.8:lv==='inter'?1.35:1;
  return Math.max(2.5,Math.round(k/2.5)*2.5);
}
// Lugar que corresponde a un conjunto de equipo
function placeOf(eq){const s=[...(eq||['db'])].sort().join();for(const k in PLACES)if([...PLACES[k].eq].sort().join()===s)return k;return 'custom';}
function placeLabel(){const k=placeOf(S.settings.eq);return k==='custom'?pl((S.settings.eq||[]).length,'equipo elegido','equipos elegidos'):PLACES[k].t;}
