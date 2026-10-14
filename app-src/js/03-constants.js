/* Constantes y lectura de la dosis de cada ejercicio */
const WEEKIDS=['lunes','martes','miercoles','jueves','viernes','sabado',null];
const LETTERS=['L','M','X','J','V','S','D'];
const DAYNAMES=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const EXPRESS={lunes:[0,1,3,4],martes:[0,1,3,4],miercoles:[0,1,3,5],jueves:[0,1,3,5],viernes:[0,1,2,3],sabado:[0,1,2,4]};
const WARMUPS={
  push:[['Trote o saltos en el sitio','1 min'],['Círculos de brazos y rotaciones de hombro','30 s'],['Pájaros sin peso','15 reps'],['Flexiones con rodillas apoyadas','10 reps'],['Primer ejercicio con la mitad del peso','10 reps']],
  pull:[['Trote o saltos en el sitio','1 min'],['Gato-camello en cuatro apoyos','8 reps'],['Bisagra de cadera sin peso','10 reps'],['Pájaros sin peso','15 reps'],['Primer ejercicio con la mitad del peso','10 reps']],
  legs:[['Trote o saltos en el sitio','1 min'],['Sentadilla sin peso','10 reps'],['Bisagra de cadera sin peso','10 reps'],['Puente de glúteo sin peso','10 reps'],['Zancada reversa sin peso','5 por pierna']]};
const WTYPE={lunes:'push',jueves:'push',martes:'pull',viernes:'pull',miercoles:'legs',sabado:'legs'};
const WARM=300, WORK=40;
window.EXMAP={};const ALLEX=[];
DAYS.forEach(d=>d.ex.forEach(e=>{if(!EXMAP[e.n]){EXMAP[e.n]=e;e.days=[];ALLEX.push(e);}EXMAP[e.n].days.push(d.d);}));
const NF=new Intl.NumberFormat('es-CO');
const pl=(n,a,b)=>`${NF.format(n)} ${n===1?a:b}`;

function dose(e){
  const m=/^(\d+)\s*×\s*(.+)$/.exec(e.r)||[0,3,e.r];
  const sets=+m[1], rest=m[2].trim();
  const tm=/^(\d+)(?:–(\d+))?\s*s(?:\s+por lado)?$/.exec(rest);
  const side=(/por (lado|pierna|brazo)/.exec(rest)||[])[1]||null;
  const rg=/(\d+)–(\d+)/.exec(rest);
  const n=parseInt(rest,10);
  return {sets,label:rest,timed:tm?+tm[1]:0,side,fail:/fallo/.test(rest),target:isNaN(n)?12:n,top:rg?+rg[2]:(isNaN(n)?0:n)};
}
const isBW=e=>e.f.every(q=>q.db==null||(Array.isArray(q.db)&&q.db.every(x=>x==null)));
const info=n=>INFO[n]||{m:[],steps:[],err:'',hl:[]};
const dayMuscles=d=>{const s=new Set();d.ex.forEach(e=>info(e.n).m.slice(0,2).forEach(x=>s.add(x.replace(/ (lateral|anterior|posterior|alto|bajo|alta)$/,''))));return [...s].slice(0,4);};

