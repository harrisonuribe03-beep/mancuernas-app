/* Vista Inicio */
/* ---------- vistas ---------- */
function render(){
  document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-current',b.dataset.v===S.tab?'page':'false'));
  let html;
  try{html=S.tab==='hoy'?viewHoy():S.tab==='plan'?viewPlan():S.tab==='lib'?viewLib():S.tab==='prog'?viewProg():viewMe();}
  catch(e){logError('render '+S.tab,e);html=`<div class="card empty" style="margin-top:20px"><b>No se pudo mostrar esta pantalla</b>Tus datos están guardados. Prueba otra vez o vuelve al inicio.<div style="display:flex;gap:8px;justify-content:center;margin-top:12px"><button class="btn sm ghost" data-act="tab" data-v="${S.tab}">Reintentar</button><button class="btn sm pri" data-act="tab" data-v="hoy">Inicio</button></div></div>`;}
  $('#view').innerHTML='<div class="fade">'+html+'</div>';
  animStart();
  if(typeof syncWidget==='function')syncWidget();
}
const exRow=(e,ds)=>`<li><button class="row" data-act="info" data-v="${esc(e.n)}">${thumb(e)}<span><div class="nm">${e.n}</div><div class="ds">${ds}</div></span><span class="chev">${IC.right}</span></button></li>`;

function selDay(){return (S.pick&&S.pick[S.sel]&&PD[S.pick[S.sel]])||dayAt(S.sel);}
function viewHoy(){
  const now=new Date(),ws=new Date(weekStart(now)),w=weekStats(),st=streak(),name=S.settings.name,td=trainDays();
  const hr=now.getHours(),greet=hr<12?'Buenos días':hr<19?'Buenas tardes':'Buenas noches';
  let h=`<div class="top"><div><div class="sub">${cap1(now.toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'}))}</div><h1 class="h1">${greet}${name?', '+esc(name):''}</h1></div>
  <div class="streak" title="Días de entreno seguidos sin fallar">${IC.flame}${st}</div></div>`;
  if(hasUpdate())h+=`<div class="card banner upd"><div><b>Hay una versión nueva</b><span class="sub">Descárgala e instálala encima. No pierdes tus datos.</span></div><div style="display:flex;gap:6px"><button class="btn sm ghost" data-act="upddis">Luego</button><a class="btn sm pri" href="${DL}" data-act="updgo">${IC.dl}Bajar</a></div></div>`;
  if(S.program.legacy&&!S.settings.persDis)h+=`<div class="card banner pers"><div><b>Arma tu plan a tu medida</b><span class="sub">Objetivo, nivel, días, tiempo y molestias. Tarda 1 minuto.</span></div><div style="display:flex;gap:6px;flex-direction:column"><button class="btn sm pri" data-act="wizard">Empezar</button><button class="tbtn" style="font-size:.8rem;color:var(--tx2)" data-act="persdis">Ahora no</button></div></div>`;
  if(S.live){h+=`<div class="card banner"><div><b>Entrenamiento en pausa</b><span class="sub">${esc(S.live.t||titleOf({day:S.live.day}))}</span></div><div style="display:flex;gap:6px"><button class="btn sm ghost" data-act="discard">Descartar</button><button class="btn sm pri" data-act="resume">Seguir</button></div></div>`;}
  h+='<div class="week" role="group" aria-label="Semana">';
  for(let i=0;i<7;i++){const dt=new Date(ws);dt.setDate(ws.getDate()+i);const dd=dayAt(i),k=dayKey(dt.getTime()),on=S.history.some(x=>dayKey(x.ts)===k);
    h+=`<button data-act="day" data-v="${i}" aria-pressed="${S.sel===i}" class="${i===todayIdx?'today':''}" aria-label="${DAYNAMES[i]} ${dt.getDate()}${dd?', '+esc(dd.t):', descanso'}${on?', entrenado':''}"><span class="l">${LETTERS[i]}</span><span class="c ${on?'on':''} ${dd?'':'rest'}">${dt.getDate()}</span><span class="sel"></span></button>`;}
  h+=`</div><div class="wkcap">${Math.min(w.days,td)} de ${td} entrenos esta semana</div>`;
  h+=rankCard(false);
  const d=selDay();
  if(!d){
    let nx=null;for(let k=1;k<=7;k++){const j=(S.sel+k)%7;if(dayAt(j)){nx=j;break;}}
    h+=`<div class="card restday"><div class="over">${DAYNAMES[S.sel]}${todayIdx===S.sel?' · hoy':''}</div><h2>Día de descanso</h2><p class="sub" style="margin:0 0 14px">El músculo crece mientras descansas. Si quieres moverte, haz algo suave.</p>
      <div class="restacts"><button class="btn sm" data-act="seq" data-v="mob">${IC.bolt}Movilidad 8 min</button><button class="btn sm" data-act="seq" data-v="stretch-full">${IC.clock}Estiramiento</button></div>
      <div style="display:flex;gap:8px;margin-top:10px">${nx!=null?`<button class="btn ghost sm" style="flex:1" data-act="day" data-v="${nx}">Ver ${DAYNAMES[nx].toLowerCase()}</button>`:''}<button class="btn ghost sm" style="flex:1" data-act="pickday">Entrenar igual</button></div></div>`;
  }else{
    const mode=S.settings.mode,p=plan(d.id,mode);
    const nsets=p.reduce((a,x)=>a+x.sets,0),done=doneThisWeek(d.id);
    const MODES=[['full','Completo'],['express','Exprés'],['suave','Suave']];
    h+=`<div class="hero w-${WKIND[d.w]||'full'}"><div class="over">${DAYNAMES[S.sel]}${S.sel===todayIdx?' · hoy':''}${done?`<span class="done">${IC.check.replace('class="i"','class="i" style="width:12px;height:12px;stroke-width:3"')}Hecho</span>`:''}</div>
      <h2>${esc(d.t)}</h2><div class="mus">${dayMuscles(d).join(' · ')}</div>
      <div class="meta"><span>${IC.clock}${estimate(p)} min</span><span>${IC.dumb}${pl(p.length,'ejercicio','ejercicios')}</span><span>${IC.layers}${nsets} series</span></div>
      <div class="hmodes" role="group" aria-label="Versión">${MODES.map(([k,l])=>`<button data-act="mode" data-v="${k}" aria-pressed="${mode===k}">${l}</button>`).join('')}</div>
      ${mode==='suave'?'<div class="hnote">Semana de descarga: menos series y un 10–20 % menos de peso. Úsala cada 6 a 8 semanas o cuando te sientas agotado.</div>':mode==='express'?'<div class="hnote">Solo los ejercicios principales, máximo 3 series.</div>':''}
      <button class="btn light block" data-act="start">${IC.play}${done?'Entrenar otra vez':'Empezar entrenamiento'}</button>
      <button class="alt" data-act="pickday">Hacer otra rutina hoy</button></div>`;
    h+=(typeof deloadTip==='function'?deloadTip():'');
    h+=`<h2 class="h2">Ejercicios <small>${p.length}</small></h2><ul class="glist">${p.map(x=>exRow(x.e,`${x.sets} × ${dose(x.e).label}${x.core?' · abdomen':''}`)).join('')}</ul>`;
  }
  h+=(typeof homeExtras==='function'?homeExtras():'');
  h+=`<h2 class="h2">Esta semana</h2><div class="minis"><div class="card"><b>${Math.min(w.days,td)}/${td}</b><span>entrenos</span></div><div class="card"><b>${w.min}</b><span>minutos</span></div><div class="card"><b>${NF.format(w.vol)}</b><span>kg movidos</span></div></div>`;
  return h;
}

