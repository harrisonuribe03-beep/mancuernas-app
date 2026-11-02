/* Rediseño 7.0: registro rápido (botón +), entreno libre y paso al nuevo color */

/* ---------- color: quien venía con el azul de antes pasa al rojo editorial una sola vez ---------- */
(function(){const st=S.settings;if(!st.ed7){st.ed7=1;if(!st.accent||st.accent==='azul')st.accent='rojo';try{saveSettings();}catch(e){}}})();

/* ---------- registro rápido ---------- */
function quickLogSheet(){
  const ok=typeof myNutri==='function'&&!!myNutri();
  let water='';
  if(ok){const D=fday(fToday()),T=ftarget(fToday(),myNutri());water=`<small>${NF.format((D.water||0)/1000)} de ${T?NF.format(T.water):'—'} L hoy</small>`;}
  const R=(act,v,ic,t,s)=>`<li><button class="row qrow" data-act="${act}" data-v="${v}"><span class="mico">${ic}</span><span><div class="nm">${t}</div><div class="ds">${s}</div></span><span class="chev">${IC.right}</span></button></li>`;
  sheet(`<h3>Registro rápido</h3><p class="sub">Anota en dos toques sin salir de donde estás.</p><ul class="glist" style="margin-top:12px">
  ${R('qfood','',IC.food,'Comida','Lo que acabas de comer')}
  <li><div class="row qrow"><span class="mico">${IC.drop}</span><span><div class="nm">Agua</div><div class="ds">${ok?water:'Pon tus datos en Comida para ver tu meta'}</div></span><button class="btn sm pri" data-act="qwater" data-v="250">+ Vaso</button></div></li>
  ${R('qweight','',IC.scale,'Peso','Tu peso de hoy')}
  ${R('cardio','',IC.up,'Cardio','Caminata, trote, bici o cuerda')}
  ${R('freecfg','',IC.dumb,'Entreno libre','Una sesión rápida a tu medida')}
  ${R('coach','',IC.info,'Preguntarle al coach','Dudas de rutina, cargas o comida')}</ul>
  <div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);
}

/* ---------- entreno libre ---------- */
const FREE={g:['Pecho'],min:25,seed:1,list:null};
function freeRng(seed){let x=seed*9301+49297;return ()=>{x=(x*9301+49297)%233280;return x/233280;};}
function freeBuild(){
  const set=myEq(),rnd=freeRng(FREE.seed);
  const pools=FREE.g.map(g=>{const l=ALLEX.filter(e=>canDo(e,set)&&exGroup(e.n).includes(g)&&!dose(e).timed);
    // primero los que tienen ilustración y los que usan peso, luego al azar
    return l.map(e=>({e,k:(ART[e.n]?0:2)+(weighted(e.n)?0:1)+rnd()*1.6})).sort((a,b)=>a.k-b.k).map(x=>x.e);});
  const out=[],seen=new Set();let i=0,guard=0;
  while(out.length<8&&guard++<80){const pool=pools[i%pools.length];i++;
    const e=pool.find(x=>!seen.has(x.n));if(!e){if(pools.every(p=>p.every(x=>seen.has(x.n))))break;continue;}
    seen.add(e.n);out.push({e,sets:Math.min(3,dose(e).sets||3)});
    if(out.length>=2&&estimate(out)>=FREE.min)break;}
  FREE.list=out;return out;
}
function freeSheet(rebuild){
  if(rebuild||!FREE.list)freeBuild();
  const p=FREE.list,mins=[15,25,35,45,60];
  sheet(`<h3>Entreno libre</h3><p class="sub">Elige qué quieres trabajar y cuánto tiempo tienes. No cambia tu plan.</p>
  <div class="edcol"><span>Músculos</span><div class="chips wrap">${GORDER.map(g=>`<button class="chip" data-act="freeg" data-v="${g}" aria-pressed="${FREE.g.includes(g)}">${g}</button>`).join('')}</div></div>
  <div class="edcol"><span>Tiempo</span><div class="chips wrap">${mins.map(m=>`<button class="chip" data-act="freemin" data-v="${m}" aria-pressed="${FREE.min===m}">${m} min</button>`).join('')}</div></div>
  ${p.length?`<ol class="glist exlist flist">${p.map((x,k)=>`<li data-n="${String(k+1).padStart(2,'0')}"><div class="row">${thumb(x.e)}<span><div class="nm">${x.e.n}</div><div class="ds">${x.sets} × ${dose(x.e).label}</div></span></div></li>`).join('')}</ol>`
    :`<div class="card empty" style="margin-top:12px"><b>Sin ejercicios</b>Con tu equipo no hay ejercicios para ese grupo. Prueba otro o cambia tu equipo en Perfil.</div>`}
  <div class="acts">${p.length?`<button class="btn pri" data-act="freego">${IC.play}Empezar · ${estimate(p)} min</button><button class="btn ghost" data-act="freeshuf">${IC.swap}Otros ejercicios</button>`:''}<button class="btn" data-act="close">Cancelar</button></div>`);
}
function freeStart(){
  if(S.live){closeSheet(true);toast('Termina o descarta el entrenamiento en pausa primero');return;}
  const p=FREE.list||[];if(!p.length)return;
  ensureAudio();askNotif();
  const best0={};p.forEach(x=>{const b=bestOf(x.e.n,S.history);if(b)best0[x.e.n]=b;});
  S.live={day:'libre-'+Date.now(),t:'Entreno libre · '+FREE.g.join(', '),mode:'full',t0:Date.now(),i:0,phase:S.settings.warm?'warm':'work',warmUntil:0,rest:null,timed:null,best0,prs:[],
    items:p.map(x=>{const r=rowsFor(x.e,x.sets);return {n:x.e.n,r:x.e.r,rest:x.e.rest,ss:false,sets:r.rows,up:r.up,prev:lastFor(x.e.n)||[],core:false};})};
  saveLive();closeSheet(true);openPlayer();
}

function redesignAct(a,v){
  switch(a){
    case 'quick':quickLogSheet();return true;
    case 'qfood':closeSheet(true);if(typeof myNutri!=='function'||!myNutri()){S.tab='food';render();window.scrollTo(0,0);toast('Primero pon tus datos aquí');return true;}launchFood();return true;
    case 'qwater':{if(typeof myNutri!=='function'||!myNutri()){closeSheet(true);S.tab='food';render();toast('Primero pon tus datos aquí');return true;}
      const k=fToday(),D=fday(k);D.water=Math.max(0,(D.water||0)+(+v||250));fsave(k,D);buzz(10);toast(IC.drop+`<span>Vaso anotado · ${NF.format(D.water/1000)} L hoy</span>`,true);quickLogSheet();if(S.tab==='food')render();return true;}
    case 'qweight':closeSheet(true);bodySheet();return true;
    case 'freecfg':freeSheet(false);return true;
    case 'freeg':{const i=FREE.g.indexOf(v);if(i>=0){if(FREE.g.length>1)FREE.g.splice(i,1);}else FREE.g.push(v);FREE.g.sort((a,b)=>GORDER.indexOf(a)-GORDER.indexOf(b));freeSheet(true);return true;}
    case 'freemin':FREE.min=+v;freeSheet(true);return true;
    case 'freeshuf':FREE.seed++;freeSheet(true);return true;
    case 'freego':freeStart();return true;
    case 'rmin':if(S.live){S.live.restMin=!S.live.restMin;renderBottom();}return true;
  }
  return false;
}
