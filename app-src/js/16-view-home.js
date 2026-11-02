/* Vista Inicio */
/* ---------- vistas ---------- */
function render(){
  // 4 pestañas: hoy · plan (Entrenar: plan, ejercicios, más) · food (Comida) · prog. Perfil (me) se abre desde el botón de arriba.
  if(S.tab==='lib'){S.tab='plan';S.planTab='lib';}
  if(S.tab==='plan'&&S.planTab==='food'){S.tab='food';S.planTab='train';}
  document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-current',b.dataset.v===S.tab?'page':'false'));
  let html;
  try{html=S.tab==='hoy'?viewHoy():S.tab==='plan'?viewPlan():S.tab==='food'?viewFoodTab():S.tab==='prog'?viewProg():viewMe();}
  catch(e){logError('render '+S.tab,e);html=`<div class="card empty" style="margin-top:20px"><b>No se pudo mostrar esta pantalla</b>Tus datos están guardados. Prueba otra vez o vuelve al inicio.<div style="display:flex;gap:8px;justify-content:center;margin-top:12px"><button class="btn sm ghost" data-act="tab" data-v="${S.tab}">Reintentar</button><button class="btn sm pri" data-act="tab" data-v="hoy">Inicio</button></div></div>`;}
  $('#view').innerHTML='<div class="fade">'+html+'</div>';
  const fab=$('#fab');if(fab)fab.hidden=!(S.tab==='hoy'||S.tab==='food')||!S.settings.onb;
  animStart();
  if(typeof syncWidget==='function')syncWidget();
}
function viewFoodTab(){return `<header class="phead"><div class="kick">Alimentación</div><h1 class="h1">Comida</h1></header>`+viewFood();}
function avatarBtn(){const n=(S.settings.name||'').trim();return `<button class="avbtn" data-act="tab" data-v="me" aria-label="Perfil y ajustes">${n?esc(n.charAt(0).toUpperCase()):IC.user}</button>`;}
const exRow=(e,ds)=>`<li><button class="row" data-act="info" data-v="${esc(e.n)}">${thumb(e)}<span><div class="nm">${e.n}</div><div class="ds">${ds}</div></span><span class="chev">${IC.right}</span></button></li>`;

function selDay(){return (S.pick&&S.pick[S.sel]&&PD[S.pick[S.sel]])||dayAt(S.sel);}
function viewHoy(){
  const now=new Date(),ws=new Date(weekStart(now)),w=weekStats(),st=streak(),name=S.settings.name,td=trainDays();
  const hr=now.getHours(),greet=hr<12?'Buenos días':hr<19?'Buenas tardes':'Buenas noches';
  let h=`<header class="mast"><div style="min-width:0"><div class="kick">${now.toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})}</div><h1 class="h1">${greet}${name?',<br>'+esc(name):''}</h1></div>
  <div class="mastr"><span class="streak" title="Días de entreno seguidos sin fallar">${IC.flame}${st}</span>${avatarBtn()}</div></header>`;
  if(hasUpdate())h+=`<div class="card banner upd"><div><b>Hay una versión nueva</b><span class="sub">Descárgala e instálala encima. No pierdes tus datos.</span></div><div style="display:flex;gap:6px"><button class="btn sm ghost" data-act="upddis">Luego</button><a class="btn sm pri" href="${DL}" data-act="updgo">${IC.dl}Bajar</a></div></div>`;
  if(S.program.legacy&&!S.settings.persDis)h+=`<div class="card banner pers"><div><b>Arma tu plan a tu medida</b><span class="sub">Objetivo, nivel, días, tiempo y molestias. Tarda 1 minuto.</span></div><div style="display:flex;gap:6px;flex-direction:column"><button class="btn sm pri" data-act="wizard">Empezar</button><button class="tbtn" style="font-size:.8rem;color:var(--tx2)" data-act="persdis">Ahora no</button></div></div>`;
  if(S.live){h+=`<div class="card banner"><div><b>Entrenamiento en pausa</b><span class="sub">${esc(S.live.t||titleOf({day:S.live.day}))}</span></div><div style="display:flex;gap:6px"><button class="btn sm ghost" data-act="discard">Descartar</button><button class="btn sm pri" data-act="resume">Seguir</button></div></div>`;}
  h+='<div class="week" role="group" aria-label="Semana">';
  for(let i=0;i<7;i++){const dt=new Date(ws);dt.setDate(ws.getDate()+i);const dd=dayAt(i),k=dayKey(dt.getTime()),on=S.history.some(x=>dayKey(x.ts)===k);
    h+=`<button data-act="day" data-v="${i}" aria-pressed="${S.sel===i}" class="${i===todayIdx?'today':''}" aria-label="${DAYNAMES[i]} ${dt.getDate()}${dd?', '+esc(dd.t):', descanso'}${on?', entrenado':''}"><span class="l">${LETTERS[i]}</span><span class="c ${on?'on':''} ${dd?'':'rest'}">${dt.getDate()}</span><span class="sel"></span></button>`;}
  h+=`</div><div class="wkcap"><b>${Math.min(w.days,td)}</b> de ${td} entrenos esta semana</div>`;
  const d=selDay();
  if(!d){
    let nx=null;for(let k=1;k<=7;k++){const j=(S.sel+k)%7;if(dayAt(j)){nx=j;break;}}
    h+=`<section class="tday rest"><div class="kick">${DAYNAMES[S.sel]}${todayIdx===S.sel?' · hoy':''}</div><h2>Descanso</h2><p class="lede">El músculo crece mientras descansas. Si quieres moverte, haz algo suave.</p>
      <div class="restacts"><button class="btn sm" data-act="seq" data-v="mob">${IC.bolt}Movilidad 8 min</button><button class="btn sm" data-act="seq" data-v="stretch-full">${IC.clock}Estiramiento</button></div>
      <div class="alts">${nx!=null?`<button class="alt" data-act="day" data-v="${nx}">Ver ${DAYNAMES[nx].toLowerCase()}</button>`:''}<button class="alt" data-act="pickday">Entrenar igual</button><button class="alt" data-act="freecfg">Entreno libre</button></div></section>`;
  }else{
    const mode=S.settings.mode,p=plan(d.id,mode);
    const nsets=p.reduce((a,x)=>a+x.sets,0),done=doneThisWeek(d.id);
    const MODES=[['full','Completo'],['express','Exprés'],['suave','Suave']];
    h+=`<section class="tday"><div class="kick">${DAYNAMES[S.sel]}${S.sel===todayIdx?' · hoy':''}${done?`<span class="done">${IC.check}Hecho</span>`:''}</div>
      <h2>${esc(d.t)}</h2><div class="mus">${dayMuscles(d).join(' · ')}</div>
      <div class="nums"><div><b>${estimate(p)}</b><span>minutos</span></div><div><b>${p.length}</b><span>ejercicios</span></div><div><b>${nsets}</b><span>series</span></div></div>
      <div class="seg" role="group" aria-label="Versión">${MODES.map(([k,l])=>`<button data-act="mode" data-v="${k}" aria-pressed="${mode===k}">${l}</button>`).join('')}</div>
      ${mode==='suave'?'<div class="hnote">Semana de descarga: menos series y un 10–20 % menos de peso. Úsala cada 6 a 8 semanas o cuando te sientas agotado.</div>':mode==='express'?'<div class="hnote">Solo los ejercicios principales, máximo 3 series.</div>':''}
      <button class="btn pri block go" data-act="start">${IC.play}${done?'Entrenar otra vez':'Empezar entrenamiento'}</button>
      <div class="alts"><button class="alt" data-act="pickday">Otra rutina</button><button class="alt" data-act="freecfg">Entreno libre</button></div></section>`;
    h+=(typeof deloadTip==='function'?deloadTip():'');
    h+=`<h2 class="h2">En esta sesión <small>${p.length} ejercicios</small></h2><ol class="glist exlist">${p.map((x,k)=>exRow(x.e,`${x.sets} × ${dose(x.e).label}${x.core?' · abdomen':''}`).replace('<li>',`<li data-n="${String(k+1).padStart(2,'0')}">`)).join('')}</ol>`;
  }
  return h;
}
