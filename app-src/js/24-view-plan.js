/* Vista Plan y editor de rutinas */

/* ===================== v4 · pestaña Plan, editor y asistente ===================== */
const SHORT=t=>t.replace('Cuerpo completo','C. completo');
function weekdaysOf(id){const o=[];S.program.week.forEach((x,i)=>{if(x===id)o.push(LETTERS3[i]);});return o;}
const LETTERS3=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
function touchProgram(){S.program.legacy=false;saveProgram();scheduleReminders();}
function viewPlan(){
  const tabs=`<div class="subtabs ptop" role="tablist">${[['train','Entreno'],['food','Alimentación']].map(([k,l])=>`<button role="tab" data-act="ptabset" data-v="${k}" aria-selected="${(S.planTab||'train')===k}">${l}</button>`).join('')}</div>`;
  if(S.planTab==='food')return `<h1 class="h1" style="padding-top:6px">Tu plan</h1>${tabs}`+viewFood();
  const P=S.program;let h=`<h1 class="h1" style="padding-top:6px">Tu plan</h1>${tabs}<div class="sub">${esc(P.name||'Plan personalizado')} · ${esc(placeLabel())}</div>
  <div class="card planhd"><div class="ph1">${IC.star}<span>${esc(progSummary())}${P.gen&&P.gen.lim&&P.gen.lim.length?`<small>Cuidando: ${P.gen.lim.map(l=>LIMITS[l].t.toLowerCase()).join(', ')}</small>`:''}</span></div>
  <button class="btn sm ${P.legacy?'pri':'ghost'}" data-act="wizard">${P.legacy?'Personalizar mi plan':'Rehacer con el asistente'}</button></div>
  <h2 class="h2">Semana <small>toca un día para cambiarlo</small></h2><div class="wkplan">`;
  for(let i=0;i<7;i++){const d=dayAt(i);h+=`<button data-act="wkset" data-v="${i}" class="${d?'on':''} ${i===todayIdx?'today':''}"><span class="l">${LETTERS3[i]}</span><b>${d?esc(SHORT(d.t)):'Libre'}</b></button>`;}
  h+=`</div><h2 class="h2">Rutinas <small>${P.days.length}</small></h2>`;
  S.openR=S.openR||{};
  P.days.forEach(d=>{const R=PD[d.id],p=plan(d.id,'full'),wd=weekdaysOf(d.id),open=!!S.openR[d.id],today=S.program.week[todayIdx]===d.id;
    h+=`<div class="card rcard ${open?'open':''}"><div class="rhd"><button class="rtog" data-act="rtog" data-v="${d.id}" aria-expanded="${open}"><span class="rti" style="min-width:0"><b>${esc(d.t)}${today?'<span class="tag ex">HOY</span>':''}</b><small>${wd.length?wd.join(' y '):'Sin día asignado'} · ${pl(d.ex.length,'ejercicio','ejercicios')} · ${estimate(p)} min</small></span><span class="rchev">${IC.down}</span></button><button class="iconbtn" data-act="rmenu" data-v="${d.id}" aria-label="Opciones de ${esc(d.t)}">${IC.dots}</button></div>`;
    if(!open)h+=d.ex.length?`<button class="rstrip" data-act="rtog" data-v="${d.id}" aria-label="Ver ejercicios de ${esc(d.t)}">${R.ex.slice(0,7).map(e=>thumb(e)).join('')}${R.ex.length>7?`<span class="more">+${R.ex.length-7}</span>`:''}</button>`:'';
    else h+=d.ex.length?`<ul class="glist flat">${R.ex.map((e,k)=>{const x=d.ex[k],ssA=x.ss&&d.ex[k+1],ssB=k>0&&d.ex[k-1].ss;return `<li class="${ssA?'ssA':''} ${ssB?'ssB':''}"><button class="row" data-act="exedit" data-v="${d.id}|${k}">${thumb(e)}<span><div class="nm">${e.n}</div><div class="ds">${x.sets} × ${esc(x.reps)} · ${x.rest} s${ssA?' · <b class="ssl">Superserie ↓</b>':''}</div></span><span class="chev">${IC.pen}</span></button></li>`;}).join('')}</ul>`:'<div class="empty" style="padding:14px">Todavía no tiene ejercicios.</div>';
    h+=`<div class="racts">${open||!d.ex.length?`<button class="btn sm ghost" data-act="exadd" data-v="${d.id}">${IC.plus}Añadir</button>`:`<button class="btn sm ghost" data-act="rtog" data-v="${d.id}">${IC.pen}Editar</button>`}${d.ex.length?`<button class="btn sm pri" data-act="startid" data-v="${d.id}">${IC.play}Empezar</button>`:''}</div></div>`;});
  h+=`<button class="btn ghost block" style="margin-top:10px" data-act="rnew">${IC.plus}Nueva rutina</button>`;
  h+=typeof extrasSection==='function'?extrasSection():'';
  return h;
}
function wkSetSheet(i){
  const cur=S.program.week[i];
  sheet(`<h3>${DAYNAMES[i]}</h3><p class="sub">¿Qué entrenas este día?</p><ul class="glist jump" style="margin-top:10px">${S.program.days.map(d=>`<li class="${cur===d.id?'cur':''}"><button class="row" data-act="wkpick" data-v="${i}|${d.id}"><span class="dico">${IC.dumb}</span><span class="nm">${esc(d.t)}<small style="display:block;color:var(--tx2);font-weight:500">${pl(d.ex.length,'ejercicio','ejercicios')}</small></span><span class="st">${cur===d.id?IC.check:''}</span></button></li>`).join('')}
  <li class="${!cur?'cur':''}"><button class="row" data-act="wkpick" data-v="${i}|"><span class="dico">${IC.moon}</span><span class="nm">Descanso</span><span class="st">${!cur?IC.check:''}</span></button></li></ul><div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);
}
const REPS_OPT=['5–8','6–8','8–12','10–15','12–15','15–20','al fallo'],TIME_OPT=['20–30 s','30–45 s','40–60 s','60 s'],REST_OPT=[30,45,60,75,90,120,150,180];
function exEditSheet(id,k){
  const d=S.program.days.find(x=>x.id===id);if(!d||!d.ex[k])return;const x=d.ex[k],e=EXMAP[x.n],ds=dose(rex(x)),side=ds.side?' por '+ds.side:'';
  const base=x.reps.replace(/ por .*/,''),opts=ds.timed?TIME_OPT:REPS_OPT;
  sheet(`<div class="exed"><span class="thumb big">${thumb(e).replace('<span class="thumb">','').replace(/<\/span>$/,'')}</span><div style="min-width:0"><div class="over">${esc(d.t)} · ${k+1} de ${d.ex.length}</div><h3 style="margin:2px 0 0">${x.n}</h3><button class="how" data-act="info" data-v="${esc(x.n)}">${IC.info}Cómo hacerlo</button></div></div>
  <div class="edrow"><span>Series</span><div class="stepper"><button data-act="edsets" data-v="${id}|${k}|-1" aria-label="Menos series">−</button><b>${x.sets}</b><button data-act="edsets" data-v="${id}|${k}|1" aria-label="Más series">+</button></div></div>
  <div class="edcol"><span>${ds.timed?'Tiempo':'Repeticiones'}${side?` <small>${side.trim()}</small>`:''}</span><div class="chips wrap">${opts.map(o=>`<button class="chip" data-act="edreps" data-v="${id}|${k}|${o}" aria-pressed="${base===o}">${o}</button>`).join('')}</div>
   ${ds.timed?'':`<div class="custrep"><input inputmode="numeric" id="ed-a" placeholder="mín" value="${(/^(\d+)/.exec(base)||[])[1]||''}"><span>a</span><input inputmode="numeric" id="ed-b" placeholder="máx" value="${(/–(\d+)/.exec(base)||[])[1]||''}"><button class="btn sm ghost" data-act="edcust" data-v="${id}|${k}">Usar</button></div>`}</div>
  <div class="edcol"><span>Descanso</span><div class="chips wrap">${REST_OPT.map(o=>`<button class="chip" data-act="edrest" data-v="${id}|${k}|${o}" aria-pressed="${x.rest===o}">${o<60?o+' s':o%60?Math.floor(o/60)+':'+String(o%60).padStart(2,'0'):o/60+' min'}</button>`).join('')}</div></div>
  ${k<d.ex.length-1?`<div class="set inline" style="padding:14px 0 0;border:0"><span class="lb">Superserie con el siguiente<small>Alternas una serie de cada uno: ${esc(d.ex[k+1].n)}</small></span><button class="sw" data-act="edss" data-v="${id}|${k}" aria-pressed="${!!x.ss}" aria-label="Superserie"></button></div>`:''}
  <div class="edbtns"><button class="btn sm ghost" data-act="edmove" data-v="${id}|${k}|-1" ${k===0?'disabled':''}>${IC.up}Subir</button><button class="btn sm ghost" data-act="edmove" data-v="${id}|${k}|1" ${k===d.ex.length-1?'disabled':''}><span style="display:inline-flex;transform:rotate(180deg)">${IC.up}</span>Bajar</button><button class="btn sm ghost" data-act="exrepl" data-v="${id}|${k}">${IC.swap}Cambiar</button><button class="btn sm ghost danger" data-act="edrm" data-v="${id}|${k}">${IC.x}Quitar</button></div>
  <div class="acts"><button class="btn pri" data-act="close">Listo</button></div>`);
}
let PICK=null;
function pickerSheet(mode,id,k){
  PICK={mode,id,k,q:'',g:'Todos'};renderPicker();
}
function pickList(){
  const q=norm(PICK.q.trim()),g=PICK.g,d=S.program.days.find(x=>x.id===PICK.id),have=new Set(d?d.ex.map(x=>x.n):[]);
  const list=ALLEX.filter(e=>(g==='Todos'||exGroup(e.n).includes(g))&&(!q||norm(e.n+' '+info(e.n).m.join(' ')).includes(q))).sort((a,b)=>canDo(b)-canDo(a));
  return list.length?`<ul class="glist jump">${list.map(e=>`<li><button class="row" data-act="pickex" data-v="${esc(e.n)}" ${have.has(e.n)?'disabled':''}>${thumb(e)}<span class="nm">${e.n}<small style="display:block;color:var(--tx2);font-weight:500">${have.has(e.n)?'Ya está en la rutina':canDo(e)?info(e.n).m.slice(0,2).join(', '):'Necesita: '+eqNeed(e).join(', ')}</small></span><span class="st">${have.has(e.n)?IC.check:IC.plus}</span></button></li>`).join('')}</ul>`:'<div class="card empty"><b>Sin resultados</b></div>';
}
function renderPicker(){
  sheet(`<h3>${PICK.mode==='repl'?'Cambiar por':'Añadir ejercicio'}</h3><label class="search">${IC.search}<input id="pickq" type="search" placeholder="Buscar ejercicio o músculo" autocomplete="off"></label>
  <div class="chips" role="group">${['Todos',...GORDER].map(x=>`<button class="chip" data-act="pickgrp" data-v="${x}" aria-pressed="${PICK.g===x}">${x}</button>`).join('')}</div><div id="picklist" style="margin-top:10px">${pickList()}</div><div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);
}
function newEntry(n){return S.program.gen?doseFor(n,S.program.gen):(()=>{const e=EXMAP[n],ds=dose(e);return {n,sets:ds.sets,reps:ds.label,rest:e.rest||60};})();}
function rMenu(id){
  const d=S.program.days.find(x=>x.id===id);if(!d)return;
  sheet(`<h3>${esc(d.t)}</h3><label class="namefield" style="margin-top:12px"><input id="rname" value="${esc(d.t)}" maxlength="28" aria-label="Nombre de la rutina">${IC.pen}</label>
  <div class="acts"><button class="btn pri" data-act="rrename" data-v="${id}">Guardar nombre</button><button class="btn" data-act="rdup" data-v="${id}">Duplicar rutina</button>${S.program.days.length>1?`<button class="btn ghost danger" data-act="rdel" data-v="${id}">Borrar rutina</button>`:''}<button class="btn ghost" data-act="close">Cerrar</button></div>`);
}

