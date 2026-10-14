/* Cálculos de entrenamiento: plan del día, estimación, récords, racha */
function weekStart(d){const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x.getTime();}
const dayKey=ts=>{const d=new Date(ts);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
function doneThisWeek(dayId){const ws=weekStart(Date.now());return S.history.some(h=>h.ts>=ws&&h.day===dayId);}
function plan(dayIdx,mode){
  const d=typeof dayIdx==='string'?dayById(dayIdx):dayAt(dayIdx);if(!d)return [];
  const list=mode==='express'?(EXPRESS[d.id]&&S.program.legacy?EXPRESS[d.id].map(i=>d.ex[i]).filter(Boolean):d.ex.slice(0,4)):d.ex;
  const out=list.map(e=>{const ds=dose(e);return {e,sets:mode==='express'?Math.min(3,ds.sets):mode==='suave'?Math.max(2,Math.round(ds.sets*.6)):ds.sets};});
  if(S.settings.core&&mode!=='suave'&&!d.ex.some(e=>PAT[e.n]==='core')){const wk=Math.floor(weekStart(Date.now())/(7*864e5)),o=(wk+S.program.days.findIndex(x=>x.id===d.id))%COREPOOL.length;
    [COREPOOL[o],COREPOOL[(o+1)%COREPOOL.length]].forEach(n=>{const e=EXMAP[n];if(e&&!out.some(x=>x.e===e))out.push({e,sets:2,core:true});});}
  return out;
}
const restOf=e=>S.settings.rest==='auto'?(e.rest||75):+S.settings.rest;
function estimate(p){let t=S.settings.warm?WARM:0;p.forEach(x=>{const ds=dose(x.e);t+=x.sets*((ds.timed||WORK)*(ds.side?2:1)+restOf(x.e));});return Math.max(5,Math.round(t/300)*5);}
function lastFor(name){for(const h of S.history){const x=(h.ex||[]).find(z=>z.n===name);const r=x?x.s.filter(s=>s[2]!=='c'):[];if(r.length)return r;}return null;}
const weighted=n=>{const e=EXMAP[n];return !!e&&!isBW(e)&&!dose(e).timed;};
const e1rm=s=>s[0]*(1+s[1]/30);
function better(n,a,b){
  if(a&&a[2]==='c')return false;
  if(!b)return true;
  if(!weighted(n))return a[1]>b[1];
  if(a[1]<Math.max(5,dose(EXMAP[n]).target-2))return false;
  const ea=e1rm(a),eb=e1rm(b);return ea>eb+0.01||(Math.abs(ea-eb)<=0.01&&a[1]>b[1]);
}
function bestOf(name,hist){let b=null;for(const h of hist){const x=(h.ex||[]).find(z=>z.n===name);if(x)for(const s of x.s)if(better(name,s,b))b=s;}return b;}
const fmtSet=(n,s)=>{const e=EXMAP[n];if(!e||!s)return '';return dose(e).timed?s[1]+' s':isBW(e)?s[1]+' reps':NF.format(s[0])+' kg × '+s[1];};
const fmtShort=(n,s)=>{const e=EXMAP[n];if(!e||!s)return '';return dose(e).timed?s[1]+' s':isBW(e)?s[1]+' reps':NF.format(s[0])+'×'+s[1];};
const fmtSets=z=>z.s.map(s=>fmtSet(z.n,s)).join(' · ');
function streak(){
  const days=new Set(S.history.map(h=>dayKey(h.ts)));
  const d=new Date();d.setHours(12,0,0,0);
  if(!days.has(dayKey(d)))d.setDate(d.getDate()-1);
  let n=0;
  for(let k=0;k<400;k++){if(days.has(dayKey(d))){n++;d.setDate(d.getDate()-1);continue;}if(!dayAt((d.getDay()+6)%7)){d.setDate(d.getDate()-1);continue;}break;}
  return n;
}
function weekStats(){const ws=weekStart(Date.now());const w=S.history.filter(h=>h.ts>=ws);
  return {days:new Set(w.map(h=>h.day)).size,min:Math.round(w.reduce((a,h)=>a+h.dur,0)/60),vol:w.reduce((a,h)=>a+(h.vol||0),0)};}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cap1=s=>s.charAt(0).toUpperCase()+s.slice(1);

