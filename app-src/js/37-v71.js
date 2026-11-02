/* 7.1: cómo amaneciste, cardio, coach con IA, suplementos, recetas, errores y variantes, peso meta en Progreso */

/* ===================== cómo amaneciste ===================== */
const CHK=LS.get('mc-check',{});
const CHQ=[['s','¿Cómo dormiste?',['Mal','Regular','Bien']],['e','¿Cómo está tu energía?',['Baja','Normal','Alta']],['d','¿Dolor muscular?',['Mucho','Algo','Nada']]];
const chkToday=()=>CHK[dayKey(Date.now())]||null;
const chkDone=c=>!!c&&CHQ.every(q=>c[q[0]]!=null);
let CHKOPEN=false;
// la versión suave elegida por cómo amaneciste dura solo ese día
(function(){const st=S.settings;if(st.modeAutoDay&&st.modeAutoDay!==dayKey(Date.now())){if(st.mode==='suave')st.mode='full';delete st.modeAutoDay;try{saveSettings();}catch(e){}}})();
function chkRec(c){
  const sc=c.s+c.e+c.d,train=S.sel===todayIdx&&!!selDay();
  let t,b='';
  if(sc<=2){t=train?'Hoy tu cuerpo pide calma. Mejor la versión suave: menos series y un poco menos de peso.':'Hoy tu cuerpo pide calma. Descansa o haz movilidad suave.';
    if(train&&S.settings.mode!=='suave')b=`<button class="btn sm pri" data-act="chksuave">Usar la versión suave hoy</button>`;}
  else if(sc<=4)t=train?'Día normal. Si en el calentamiento te sientes pesado, cambia a Exprés.':'Día normal. Aprovecha el descanso para dormir bien hoy.';
  else t=train?'Buen día para ir con todo: intenta subir peso o una repetición.':'Estás bien recuperado. Si quieres moverte, un cardio suave o movilidad.';
  return `<p class="chkr">${t}</p>${b}${c.d===0?'<p class="chkw">Si el dolor es en una articulación o es punzante, no es una agujeta: no entrenes esa zona y consulta a un profesional.</p>':''}`;
}
function checkinCard(){
  if(!S.settings.onb)return '';
  const c=chkToday()||{};
  if(chkDone(c)&&!CHKOPEN)return `<section class="chk done"><div class="chkl"><span class="kick">Cómo amaneciste</span><button class="tbtn" data-act="chkedit">Cambiar</button></div>
    <div class="chks">${CHQ.map(q=>`<span>${q[0]==='s'?'Sueño':q[0]==='e'?'Energía':'Dolor'} <b>${q[2][c[q[0]]].toLowerCase()}</b></span>`).join('')}</div>${chkRec(c)}</section>`;
  return `<section class="chk"><div class="kick">Cómo amaneciste</div>${CHQ.map(q=>`<div class="chkq"><span>${q[1]}</span><div class="seg">${q[2].map((l,v)=>`<button data-act="chk" data-v="${q[0]}|${v}" aria-pressed="${c[q[0]]===v}">${l}</button>`).join('')}</div></div>`).join('')}</section>`;
}

/* ===================== cardio ===================== */
// MET de referencia (Compendio de actividades físicas), ajustado por el esfuerzo que marques
const CDT={walk:['Caminata',3.5,1],run:['Trote',8,1],bike:['Bicicleta',7,1],hike:['Senderismo',6,1],rope:['Saltar cuerda',11,0],swim:['Natación',7,1],other:['Otro',5,0]};
const CEFF=[['Suave',.8],['Medio',1],['Fuerte',1.25]];
const CD={k:'walk',min:30,eff:1};
function cardioKcal(k,min,eff){const b=myBody(),w=(b&&b.wt)||S.settings.wt||70;return Math.round(CDT[k][1]*CEFF[eff][1]*w*min/60);}
function paceTxt(k,min,km){if(!km||!min)return '';if(k==='bike')return NF.format(Math.round(km/(min/60)*10)/10)+' km/h';const p=min/km,m=Math.floor(p),s=Math.round((p-m)*60);return `${m}:${String(s===60?0:s).padStart(2,'0')} min/km`;}
function cardioSheet(){
  const C=CDT[CD.k];
  sheet(`<h3>Registrar cardio</h3><p class="sub">Anota lo que hiciste. Las calorías son una estimación.</p>
  <div class="edcol"><span>Actividad</span><div class="chips wrap">${Object.keys(CDT).map(k=>`<button class="chip" data-act="cdk" data-v="${k}" aria-pressed="${CD.k===k}">${CDT[k][0]}</button>`).join('')}</div></div>
  <div class="bform"><label><span>Minutos</span><input inputmode="numeric" id="cd-min" value="${CD.min}"></label>${C[2]?`<label><span>Distancia <small>km, opcional</small></span><input inputmode="decimal" id="cd-km" placeholder="ej. 3,5" value="${CD.km||''}"></label>`:''}</div>
  <div class="edcol"><span>Esfuerzo</span><div class="seg">${CEFF.map(([l],i)=>`<button data-act="cdeff" data-v="${i}" aria-pressed="${CD.eff===i}">${l}</button>`).join('')}</div></div>
  <div class="cdprev" id="cdprev">${cardioPrev()}</div>
  <div class="acts"><button class="btn pri" data-act="cdsave">Guardar</button><button class="btn" data-act="close">Cancelar</button></div>`);
}
function cardioRead(){const m=$('#cd-min'),k=$('#cd-km');if(m){const v=parseInt(m.value,10);CD.min=isNaN(v)?0:v;}if(k){const v=parseFloat(String(k.value).replace(',','.'));CD.km=isNaN(v)?'':v;}}
function cardioPrev(){const p=CDT[CD.k][2]?paceTxt(CD.k,CD.min,CD.km):'';return CD.min>0?`<span><b>~${cardioKcal(CD.k,CD.min,CD.eff)}</b> kcal</span>${p?`<span><b>${p}</b></span>`:''}`:'<span>Pon los minutos</span>';}
document.addEventListener('input',ev=>{if(ev.target&&/^cd-(min|km)$/.test(ev.target.id)){cardioRead();const p=$('#cdprev');if(p)p.innerHTML=cardioPrev();}});
function cardioWeek(){const ws=weekStart(Date.now());return S.acts.filter(a=>a.kind==='cardio'&&a.ts>=ws);}
function cardioCard(){
  const W=cardioWeek(),all=S.acts.filter(a=>a.kind==='cardio').slice(-5).reverse();
  const min=Math.round(W.reduce((a,x)=>a+(x.dur||0),0)/60),km=W.reduce((a,x)=>a+(x.km||0),0);
  let h=`<h2 class="h2">Cardio <small>esta semana</small></h2><div class="card cdcard"><div class="cdk"><div><b>${min}</b><span>minutos</span></div><div><b>${NF.format(Math.round(km*10)/10)}</b><span>km</span></div><div><b>${W.length}</b><span>sesiones</span></div></div>`;
  if(all.length)h+=`<ul class="cdl">${all.map(a=>`<li><span><b>${esc(a.t)}</b><small>${cap1(new Date(a.ts).toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'}))} · ${Math.round(a.dur/60)} min${a.km?' · '+NF.format(a.km)+' km':''}${a.km&&a.key!=='rope'?' · '+paceTxt(a.key,a.dur/60,a.km):''}</small></span><button class="iconbtn sm" data-act="cddel" data-v="${a.id}" aria-label="Borrar">${IC.x}</button></li>`).join('')}</ul>`;
  else h+=`<p class="sub" style="margin:10px 0 0">La OMS recomienda 150 minutos de actividad moderada a la semana. Caminar cuenta.</p>`;
  return h+`<button class="btn sm ghost block" style="margin-top:12px" data-act="cardio">${IC.plus}Registrar cardio</button></div>`;
}

/* ===================== coach con IA ===================== */
let COACH=LS.get('mc-coach',[]),COB=false,COERR='',COSMP;
async function coSample(){if(COSMP!==undefined)return COSMP;COSMP=null;try{if(!CAP&&window.claude&&typeof window.claude.use==='function')COSMP=await window.claude.use('sample');}catch(e){COSMP=null;}return COSMP;}
function coachCtx(){
  const st=S.settings,b=myBody(),N=typeof myNutri==='function'?myNutri():null,g=S.program.gen,w=weekStats(),c=chkToday();
  const days=S.program.days.map(d=>`- ${d.t} (${weekdaysOf(d.id).join(', ')||'sin día'}): ${d.ex.map(x=>`${x.n} ${x.sets}×${x.reps}`).join('; ')}`).join('\n');
  const last=S.history.slice(0,5).map(h=>`- ${new Date(h.ts).toLocaleDateString('es-CO')} ${titleOf(h)}: ${(h.ex||[]).map(z=>z.n+' '+fmtSets(z)).join(' | ')}${h.feel?' (se sintió '+FEEL[h.feel].toLowerCase()+')':''}`).join('\n');
  const cardio=S.acts.filter(a=>a.kind==='cardio').slice(-3).map(a=>`${a.t} ${Math.round(a.dur/60)} min${a.km?' '+a.km+' km':''}`).join(', ');
  return `DATOS DE LA PERSONA
Nombre: ${st.name||'sin nombre'}${b&&b.age?` · ${b.age} años`:''}${b&&b.sex&&b.sex!=='x'?` · ${b.sex==='h'?'hombre':'mujer'}`:''}${b&&b.wt?` · ${b.wt} kg`:''}${b&&b.ht?` · ${b.ht} cm`:''}
Dónde entrena: ${placeLabel()} (equipo: ${(st.eq||[]).map(q=>EQ[q]?EQ[q].t:q).join(', ')||'ninguno'})
Plan: ${progSummary()}${g&&g.lim&&g.lim.length?` · cuidando: ${g.lim.map(l=>LIMITS[l].t).join(', ')}`:''}
Rutinas:
${days}
Esta semana: ${w.days} de ${trainDays()} entrenos, ${w.min} min, ${w.vol} kg movidos. Racha: ${streak()} días.
Últimos entrenamientos:
${last||'- todavía no ha registrado entrenamientos'}
${cardio?'Cardio reciente: '+cardio+'\n':''}${N?`Nutrición: meta ${N.kcal} kcal al día y ${N.p} g de proteína; peso meta ${goalWeight(N,b)} kg.\n`:''}${chkDone(c)?`Hoy amaneció: sueño ${CHQ[0][2][c.s].toLowerCase()}, energía ${CHQ[1][2][c.e].toLowerCase()}, dolor muscular ${CHQ[2][2][c.d].toLowerCase()}.\n`:''}Fecha de hoy: ${new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}.`;
}
const COSYS=`Eres el coach de la app Mancuernas: un entrenador personal y nutricionista deportivo que habla español de Colombia, cercano y directo, como un buen entrenador de gimnasio.
Reglas:
- Responde corto: 2 a 6 frases o una lista breve. Ve al grano y da números concretos (series, repeticiones, kilos, minutos, gramos) usando los datos de la persona.
- Usa solo los ejercicios y el equipo que tiene la persona. Si propones un cambio en la rutina, di exactamente qué ejercicio cambiar por cuál.
- No diagnostiques ni trates lesiones o enfermedades. Si menciona dolor fuerte, punzante, en una articulación, mareo o algo médico, dile que pare ese ejercicio y consulte a un médico o fisioterapeuta; puedes sugerir qué entrenar mientras tanto que no moleste esa zona.
- No recomiendes medicamentos ni suplementos más allá de proteína, creatina o cafeína con información general, y nunca dosis por encima de las habituales.
- No inventes datos que no estén en el contexto. Si falta algo, pregúntalo en una frase.
- Sin saludos largos ni despedidas. Puedes usar **negrita** y listas con guiones.`;
async function coAsk(msgs){
  const ctx=coachCtx(),hist=msgs.slice(-12);
  const s=await coSample();
  if(s){const arr=hist.map((m,i)=>({role:m.r==='u'?'user':'assistant',content:i===hist.length-1?`${COSYS}\n\n${ctx}\n\nPREGUNTA:\n${m.t}`:m.t}));
    try{const r=await s(arr,{cache:false});return String(r&&r.text||'').trim();}
    catch(e){const c=e&&e.code;if(c==='not_granted'||c==='sampling_disabled'){COSMP=null;if(!gkey())throw fphErr('nokey');}else throw fphErr(c==='rate_limited'?'quota':'other',e&&e.message);}}
  const key=gkey();if(!key)throw fphErr('nokey');
  const L=await gemModels(key);let last=null;
  for(const m of L.slice(0,4)){
    try{const j=await gemFetch(`/models/${encodeURIComponent(m)}:generateContent`,key,{systemInstruction:{parts:[{text:COSYS+'\n\n'+ctx}]},
        contents:hist.map(x=>({role:x.r==='u'?'user':'model',parts:[{text:x.t}]})),generationConfig:{temperature:.6,maxOutputTokens:900}});
      const C=j.candidates&&j.candidates[0],t=C&&C.content?(C.content.parts||[]).filter(p=>p.text&&!p.thought).map(p=>p.text).join(''):'';
      if(!t)throw fphErr(j.promptFeedback&&j.promptFeedback.blockReason?'blocked':'empty');return t.trim();}
    catch(e){last=e;if(!/^(model|nofree|busy)$/.test(e.code))throw e;}
  }
  throw last||fphErr('other');
}
function mdLite(t){return esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').split(/\n+/).map(l=>/^\s*[-•*]\s+/.test(l)?`<li>${l.replace(/^\s*[-•*]\s+/,'')}</li>`:`<p>${l}</p>`).join('').replace(/(<li>.*?<\/li>)+/g,m=>`<ul>${m}</ul>`);}
const COSUG=['¿Qué peso uso hoy?','Solo tengo 20 minutos, ¿qué hago?','¿Estoy progresando bien?','¿Qué como antes de entrenar?'];
async function coachSheet(){
  const who=(await coSample())?'claude':gkey()?'gemini':null;
  const msgs=COACH.map(m=>`<div class="cm ${m.r}">${m.r==='u'?esc(m.t):mdLite(m.t)}</div>`).join('')+(COB?'<div class="cm a typing"><i></i><i></i><i></i></div>':'')+(COERR?`<div class="cm err">${COERR}</div>`:'');
  sheet(`<div class="cohd"><h3>Coach</h3>${COACH.length?'<button class="tbtn" data-act="coclear">Borrar chat</button>':''}</div>
  <p class="sub">Pregúntale sobre tu rutina, técnica, cargas o comida. Conoce tu plan y tus últimos entrenos.</p>
  ${who?'':`<div class="card coempty"><b>Activa el coach</b><span>Usa la IA de Google (Gemini), gratis para uso personal. Necesitas una clave, la misma que sirve para reconocer la comida por foto.</span><button class="btn pri sm" data-act="cokey">Poner mi clave</button></div>`}
  <div class="cochat" id="cochat">${msgs||(who?`<div class="cosug">${COSUG.map(q=>`<button class="chip" data-act="cosug" data-v="${esc(q)}">${q}</button>`).join('')}</div>`:'')}</div>
  ${who?`<div class="coin"><textarea id="co-in" rows="2" maxlength="600" placeholder="Escribe tu pregunta" ${COB?'disabled':''}></textarea><button class="btn pri" data-act="cosend" ${COB?'disabled':''} aria-label="Enviar">${IC.right}</button></div>`:''}
  <p class="fnote">${who==='gemini'?'Tus preguntas y los datos de tu plan se envían a Google para responder. ':''}Es una guía general: no reemplaza a un médico ni a un entrenador presencial.</p>
  <div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);
  const p=$('#sheet .pan');if(p)p.classList.add('tall');const ch=$('#cochat');if(ch)ch.scrollIntoView({block:'end'});
}
async function coachSend(text){
  text=String(text||'').trim();if(!text||COB)return;
  COACH.push({r:'u',t:text,ts:Date.now()});COB=true;COERR='';coachSheet();
  try{const a=await coAsk(COACH);COACH.push({r:'a',t:a||'No tengo una respuesta para eso. Pregúntame de otra forma.',ts:Date.now()});}
  catch(e){COACH.pop();COERR=e.code==='nokey'?'Primero pon tu clave de Gemini.':e.code==='net'?'Sin internet. Revisa la conexión e intenta otra vez.':(typeof fphMsg==='function'?fphMsg(e.code)[0]:'No se pudo responder')+'. Intenta otra vez.';
    setTimeout(()=>{const i=$('#co-in');if(i)i.value=text;},0);}
  COB=false;COACH=COACH.slice(-40);LS.set('mc-coach',COACH);
  if(!$('#sheet').hidden&&$('#cochat'))coachSheet();
}

/* ===================== suplementos ===================== */
const SUPS={
  whey:['Proteína en polvo','1 scoop · se suma al diario','Es comida, no un atajo: sirve cuando no alcanzas tu proteína del día con comida normal. Una porción de 30 g trae unos 24 g de proteína. Al marcarla aquí se anota en tu diario para que cuente en tus calorías.'],
  crea:['Creatina','3 a 5 g al día','La creatina monohidratada es de los suplementos con más estudios para ganar fuerza y músculo. Se toma todos los días, a cualquier hora, sin fase de carga. Es normal subir 1 o 2 kg de agua en el músculo al principio. Si tienes un problema de los riñones, consulta antes a tu médico.'],
  cafe:['Cafeína o pre-entreno','Antes de entrenar','Un tinto o 3 mg de cafeína por kilo, 30 a 60 minutos antes, puede ayudar a rendir más. No pases de 400 mg al día y evítala en la tarde si entrenas de noche, porque afecta el sueño.'],
  omega:['Omega 3','Según la etiqueta','Útil si comes poco pescado. Las sardinas y el atún también lo aportan. Si tomas anticoagulantes, consulta a tu médico.'],
  multi:['Multivitamínico','1 al día','Solo ayuda si tu alimentación es muy limitada o tienes una deficiencia diagnosticada. Con una dieta variada normalmente no hace falta.']
};
function supCard(k){
  const mine=(S.settings.sups||[]).filter(x=>SUPS[x]);
  if(!mine.length)return `<button class="card supempty" data-act="supcfg">${IC.plus}<span><b>¿Tomas suplementos?</b><small>Marca cada día la creatina o la proteína que tomas</small></span></button>`;
  const D=S.food[k]||{},on=new Set(D.sup||[]);
  return `<div class="card supc"><div class="suph"><span class="over">Suplementos de hoy</span><button class="tbtn" data-act="supcfg">Editar</button></div><div class="supl">${mine.map(x=>`<div class="sup ${on.has(x)?'on':''}"><button class="supt" data-act="suptog" data-v="${x}" aria-pressed="${on.has(x)}"><span class="ck">${IC.check}</span><span><b>${SUPS[x][0]}</b><small>${SUPS[x][1]}</small></span></button><button class="iconbtn sm" data-act="supinfo" data-v="${x}" aria-label="Qué es ${SUPS[x][0]}">${IC.info}</button></div>`).join('')}</div></div>`;
}
function supCfgSheet(){const mine=new Set(S.settings.sups||[]);
  sheet(`<h3>Tus suplementos</h3><p class="sub">Elige los que tomas para marcarlos cada día. No hacen falta para progresar: la base es entrenar, comer bien y dormir.</p>
  <ul class="glist" style="margin-top:12px">${Object.keys(SUPS).map(x=>`<li><div class="set inline" style="padding:12px 14px"><span class="lb">${SUPS[x][0]}<small>${SUPS[x][1]}</small></span><button class="sw" data-act="supsel" data-v="${x}" aria-pressed="${mine.has(x)}" aria-label="${SUPS[x][0]}"></button></div></li>`).join('')}</ul>
  <div class="acts"><button class="btn pri" data-act="close">Listo</button></div>`);}
function supToggle(x){
  const k=S.fdate||fToday(),D=fday(k),on=new Set(D.sup||[]);
  if(on.has(x)){on.delete(x);if(x==='whey'&&D.supW)D.items=D.items.filter(i=>i.id!==D.supW),D.supW=null;}
  else{on.add(x);if(x==='whey'){const F=food('whey');if(F){const U=funits(F),u=Math.max(0,U.findIndex(fbase)),it=fitem(F,30,u,fslotNow());D.items.push(it);D.supW=it.id;}}}
  D.sup=[...on];fsave(k,D);buzz(10);render();
  if(on.has(x))toast(IC.check+`<span>${SUPS[x][0]}${x==='whey'?' anotada en tu diario':' marcada'}</span>`,true);
}

/* ===================== recetas ===================== */
const RTAGS=[['all','Todas'],['des','Desayuno'],['alm','Almuerzo'],['cen','Cena'],['proteina','Alta en proteína'],['sin_carne','Sin carne'],['rapida','Rápidas']];
function recipeMacros(r,por){const t={w:0,k:0,p:0,c:0,fat:0,fib:0};por=por||1;
  r.ing.forEach(([id,g])=>{const F=food(id);if(!F)return;const x=g*por/100;t.w+=g*por;t.k+=F.k*x;t.p+=F.p*x;t.c+=F.c*x;t.fat+=F.f*x;t.fib+=(F.fb||0)*x;});return t;}
function recipesView(){
  const tg=S.rtag||'all',L=RECIPES.filter(r=>tg==='all'||r.t===tg||(r.tags||[]).includes(tg));
  return `<p class="sub" style="margin:12px 0 0">Recetas baratas con comida de aquí, para una porción. Tócala para ver cómo se hace y anotarla.</p>
  <div class="chips" role="group" aria-label="Filtrar recetas">${RTAGS.map(([k,l])=>`<button class="chip" data-act="rtag" data-v="${k}" aria-pressed="${tg===k}">${l}</button>`).join('')}</div>
  <ol class="glist exlist rlist">${L.map((r,i)=>{const m=recipeMacros(r);return `<li data-n="${String(i+1).padStart(2,'0')}"><button class="row" data-act="recipe" data-v="${r.id}"><span><div class="nm">${r.n}</div><div class="ds">${RTYPE[r.t]} · ${r.min} min · <b>${fk(m.k)} kcal</b> · ${fk(m.p)} g proteína</div></span><span class="chev">${IC.right}</span></button></li>`;}).join('')}</ol>`;
}
let RPOR=1;
function recipeSheet(id){
  const r=RECIPES.find(x=>x.id===id);if(!r)return;const m=recipeMacros(r,RPOR);
  sheet(`<div class="over">${RTYPE[r.t]} · ${r.min} min</div><h3>${r.n}</h3>
  <div class="rmac"><div><b>${fk(m.k)}</b><span>kcal</span></div><div><b>${fk(m.p)}</b><span>proteína</span></div><div><b>${fk(m.c)}</b><span>carbos</span></div><div><b>${fk(m.fat)}</b><span>grasa</span></div></div>
  <div class="edrow"><span>Porciones</span><div class="stepper"><button data-act="rpor" data-v="${r.id}|-1" aria-label="Menos porciones">−</button><b>${RPOR}</b><button data-act="rpor" data-v="${r.id}|1" aria-label="Más porciones">+</button></div></div>
  <h2 class="h2">Ingredientes</h2><ul class="ring2">${r.ing.map(([fid2,g,lbl])=>`<li><span>${RPOR>1?`<b>${RPOR}×</b> `:''}${lbl}</span><small>${NF.format(g*RPOR)} ${food(fid2)&&food(fid2).liq?'ml':'g'}</small></li>`).join('')}</ul>
  <h2 class="h2">Preparación</h2><ol class="steps">${r.steps.map(s=>`<li><span>${s}</span></li>`).join('')}</ol>
  ${r.tip?`<div class="callout">${IC.info}<div>${r.tip}</div></div>`:''}
  <div class="acts"><button class="btn pri" data-act="rlog" data-v="${r.id}">${IC.plus}Anotar ${RPOR>1?RPOR+' porciones':'1 porción'} en mi diario</button><button class="btn" data-act="close">Cerrar</button></div>`);
  const p=$('#sheet .pan');if(p)p.classList.add('tall');
}
function recipeLog(id){
  const r=RECIPES.find(x=>x.id===id);if(!r)return;const m=recipeMacros(r,RPOR),k=S.fdate||fToday();
  const it={id:fid(),s:fslotNow(),f:null,n:r.n,q:RPOR,u:0,qt:`${RPOR>1?RPOR+' porciones':'1 porción'} · receta`,w:Math.round(m.w),k:Math.round(m.k),p:r1(m.p),c:r1(m.c),fat:r1(m.fat),fib:r1(m.fib),t:Date.now()};
  closeSheet(true);S.ftab='diario';faddItems(k,[it],r.n);
}

/* ===================== errores frecuentes y variantes ===================== */
const PATERR={
  hpush:['Dejar caer la cadera: aprieta abdomen y glúteos todo el tiempo.','Bajar a medias. El pecho debe llegar casi al piso o a la altura de las mancuernas.'],
  vpush:['Arquear la zona lumbar para empujar más peso.','Empujar hacia el frente en vez de recto hacia arriba.'],
  row:['Jalar solo con los brazos sin juntar los omóplatos.','Subir los hombros hacia las orejas.'],
  vpull:['Balancearte o patear para subir.','No estirar los brazos abajo y hacer solo medio movimiento.'],
  squat:['Levantar los talones del piso.','Dejar que las rodillas se cierren hacia adentro al subir.'],
  hinge:['Redondear la espalda baja.','Doblar mucho las rodillas y convertirlo en una sentadilla.'],
  lunge:['Dar un paso muy corto: la rodilla de adelante se va muy al frente.','Poner los pies en una sola línea y perder el equilibrio. Deja el ancho de la cadera.'],
  glute:['Subir arqueando la lumbar en vez de apretar el glúteo.','Empujar con las puntas de los pies en vez de los talones.'],
  tri:['Mover los hombros en vez de solo los codos.','Abrir los codos hacia los lados.'],
  bi:['Balancear el cuerpo para subir el peso.','Bajar rápido y sin control: la mitad del trabajo está en la bajada.'],
  lat:['Subir por encima de los hombros encogiendo el trapecio.','Usar impulso con el cuerpo.'],
  rear:['Usar demasiado peso y jalar con la espalda baja.','Encoger los hombros.'],
  fly:['Bajar demasiado y forzar el hombro.','Doblar mucho los codos y convertirlo en un press.'],
  core:['Aguantar la respiración. Respira corto y constante.','Dejar que la zona lumbar se arquee.'],
  calf:['Rebotar abajo sin pausa.','Hacer medio rango: sube hasta la punta y baja hasta estirar.'],
  quad:['Bloquear las rodillas de golpe arriba.','Ir tan rápido que pierdes el control.'],
  back:['Subir de más y apretar la zona lumbar.','Jalar con el cuello.'],
  ham:['Levantar la cadera del banco.','Bajar sin control.'],
  abd:['Usar impulso.','Ir muy rápido.'],add:['Usar impulso.','Ir muy rápido.']
};
// Progresiones de más fácil a más difícil
const PROG=[
  ['Flexiones inclinadas','Flexiones de pecho','Flexiones con pies elevados','Flexiones declinadas en banco'],
  ['Jalón con banda','Dominadas negativas','Dominadas'],['Dominadas negativas','Dominadas supinas'],
  ['Remo invertido bajo la mesa','Remo australiano en barra baja','Remo a una mano','Remo con barra'],
  ['Fondos en silla','Fondos en banco','Flexiones diamante','Fondos en paralelas'],
  ['Flexiones pica','Press militar sentado','Press militar con barra'],
  ['Sentadilla libre','Sentadilla goblet','Sentadilla con barra'],
  ['Zancada reversa sin peso','Zancada reversa','Zancadas alternas','Sentadilla búlgara'],['Sentadilla búlgara sin peso','Sentadilla búlgara'],
  ['Peso muerto a una pierna sin peso','Peso muerto rumano','Peso muerto con barra'],
  ['Puente de glúteo a una pierna','Puente de glúteo con mancuerna','Hip thrust con mancuerna','Hip thrust con barra'],
  ['Crunch','Elevación de piernas con rodillas dobladas','Rodillas al pecho en paralelas','Elevación de rodillas colgado'],
  ['Plancha','Hollow hold'],['Step-ups','Step-ups al banco','Sentadilla búlgara']
];
function exExtra(name){
  const inf=info(name),p=PAT[name],errs=(PATERR[p]||[]).filter(x=>x!==inf.err);
  const ch=PROG.find(c=>c.includes(name)&&c.every(n=>n===name||EXMAP[n])),i=ch?ch.indexOf(name):-1;
  const ez=ch&&i>0?ch[i-1]:null,hd=ch&&i<ch.length-1?ch[i+1]:null;
  const alts=ALLEX.filter(e=>e.n!==name&&e.n!==ez&&e.n!==hd&&PAT[e.n]===p&&canDo(e)).slice(0,3).map(e=>e.n);
  const V=(n,l)=>{const e=EXMAP[n];return `<button class="vrow" data-act="info" data-v="${esc(n)}">${thumb(e)}<span><small>${l}</small><b>${n}</b>${canDo(e)?'':`<em>Necesita: ${esc(eqNeed(e).join(', '))}</em>`}</span><span class="chev">${IC.right}</span></button>`;};
  let h='';
  if(errs.length)h+=`<h2 class="h2">Otros errores frecuentes</h2><ul class="errs">${errs.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  if(ez||hd||alts.length)h+=`<h2 class="h2">Variantes</h2><div class="vars">${ez?V(ez,'Más fácil'):''}${hd?V(hd,'Más difícil'):''}${alts.map(n=>V(n,'Con tu equipo')).join('')}</div>`;
  return h;
}

/* ===================== peso meta en Progreso → Cuerpo ===================== */
function goalSheet(){
  const N=myNutri(),b=myBody();if(!N){S.tab='food';closeSheet(true);render();toast('Primero pon tus datos aquí');return;}
  const gw=goalWeight(N,b);
  sheet(`<h3>Peso meta</h3><p class="sub">Escribe el peso al que quieres llegar. La app te dice cuánto falta y a qué ritmo vas.</p>
  <div class="bform"><label class="wide"><span>Peso meta <small>kg</small></span><input inputmode="decimal" id="gw-in" value="${NF.format(gw)}"></label></div>
  <p class="fnote">Rango de peso saludable para tu estatura: ${NF.format(N.hw.lo)} a ${NF.format(N.hw.hi)} kg.</p>
  <div class="acts"><button class="btn pri" data-act="gwsave">Guardar</button>${S.settings.goalWt?'<button class="btn ghost" data-act="gwauto">Usar el recomendado</button>':''}<button class="btn" data-act="close">Cancelar</button></div>`);
}
// lo que dice la tendencia real del peso, si hay suficientes registros
function goalTrendTxt(gw,wt){
  const T=typeof weightTrend==='function'?weightTrend(42):null;if(!T)return '';
  const diff=gw-wt;if(Math.abs(diff)<.3)return '';
  if(Math.abs(T.rate)<.05)return 'Según tus registros tu peso está estable: así no te acercas a la meta.';
  if(Math.sign(T.rate)!==Math.sign(diff))return `Según tus registros vas a ${T.rate>0?'+':'−'}${NF.format(Math.abs(Math.round(T.rate*10)/10))} kg por semana: te estás alejando de la meta.`;
  const wk=Math.ceil(Math.abs(diff/T.rate));return `A tu ritmo real (${T.rate>0?'+':'−'}${NF.format(Math.abs(Math.round(T.rate*10)/10))} kg por semana) llegarías en unas ${wk} semanas, hacia ${new Date(Date.now()+wk*7*864e5).toLocaleDateString('es-CO',{day:'numeric',month:'long'})}.`;
}
function goalBodyCard(){
  const N=typeof myNutri==='function'?myNutri():null;
  if(!N)return `<h2 class="h2">Peso meta</h2><div class="card empty"><b>Pon tu peso meta</b>Con tu edad, peso, estatura y sexo te sugerimos una meta sana y te decimos a qué ritmo vas.<button class="btn pri sm" style="margin:12px auto 0" data-act="mydata">Poner mis datos</button></div>`;
  const b=myBody();return `<h2 class="h2">Peso meta</h2>`+progressCard(N,b);
}

/* ===================== acciones ===================== */
function v71Act(a,v){
  switch(a){
    case 'chk':{const [q,x]=v.split('|'),k=dayKey(Date.now()),c=CHK[k]=CHK[k]||{};c[q]=+x;c.at=Date.now();LS.set('mc-check',CHK);if(chkDone(c))CHKOPEN=false;buzz(8);render();return true;}
    case 'chkedit':CHKOPEN=true;render();return true;
    case 'chksuave':S.settings.mode='suave';S.settings.modeAutoDay=dayKey(Date.now());saveSettings();render();toast('Hoy entrenas la versión suave. Mañana vuelve a Completo.');return true;
    case 'cardio':closeSheet(true);CD.km='';cardioSheet();return true;
    case 'cdk':cardioRead();CD.k=v;if(!CDT[v][2])CD.km='';cardioSheet();return true;
    case 'cdeff':cardioRead();CD.eff=+v;cardioSheet();return true;
    case 'cdsave':{cardioRead();if(!(CD.min>0&&CD.min<=600)){toast('Pon los minutos (1 a 600)');return true;}
      const km=CDT[CD.k][2]&&CD.km>0&&CD.km<300?Math.round(CD.km*100)/100:0;
      addAct({kind:'cardio',key:CD.k,t:CDT[CD.k][0],dur:CD.min*60,km,kcal:cardioKcal(CD.k,CD.min,CD.eff),eff:CD.eff});
      closeSheet();render();toast(IC.check+`<span>${CDT[CD.k][0]} guardada · +20 XP</span>`,true);return true;}
    case 'cddel':{const i=S.acts.findIndex(x=>x.id===v);if(i<0)return true;const it=S.acts[i];S.acts.splice(i,1);LS.set('mc-acts',S.acts);if(COL)COL.doc(v).delete().catch(()=>{});render();
      undoable(esc(it.t)+' borrada',()=>{S.acts.push(it);S.acts.sort((x,y)=>x.ts-y.ts);LS.set('mc-acts',S.acts);if(COL)COL.doc(it.id).set(stripId(it)).catch(()=>{});render();});return true;}
    case 'coach':coachSheet();return true;
    case 'cosend':{const i=$('#co-in');coachSend(i?i.value:'');return true;}
    case 'cosug':coachSend(v);return true;
    case 'coclear':COACH=[];COERR='';LS.set('mc-coach',COACH);coachSheet();return true;
    case 'cokey':keySheet('prefs');return true;
    case 'supcfg':supCfgSheet();return true;
    case 'supsel':{const s=new Set(S.settings.sups||[]);s.has(v)?s.delete(v):s.add(v);S.settings.sups=Object.keys(SUPS).filter(x=>s.has(x));saveSettings();supCfgSheet();render();return true;}
    case 'suptog':supToggle(v);return true;
    case 'supinfo':sheet(`<h3>${SUPS[v][0]}</h3><p style="margin-top:10px">${SUPS[v][2]}</p><p class="fnote">Información general, no es una recomendación médica.</p><div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);return true;
    case 'rtag':S.rtag=v;render();return true;
    case 'recipe':RPOR=1;recipeSheet(v);return true;
    case 'rpor':{const [id,d]=v.split('|');RPOR=Math.max(1,Math.min(6,RPOR+(+d)));recipeSheet(id);return true;}
    case 'rlog':recipeLog(v);return true;
    case 'gwset':goalSheet();return true;
    case 'gwsave':{const i=$('#gw-in'),x=parseFloat(String(i?i.value:'').replace(',','.'));if(!(x>=30&&x<=250)){toast('Escribe un peso entre 30 y 250 kg');return true;}
      S.settings.goalWt=Math.round(x*10)/10;saveSettings();closeSheet();render();toast(IC.check+`<span>Peso meta: ${NF.format(S.settings.goalWt)} kg</span>`,true);return true;}
    case 'gwauto':delete S.settings.goalWt;saveSettings();closeSheet();render();return true;
  }
  return false;
}
document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&!ev.shiftKey&&ev.target&&ev.target.id==='co-in'){ev.preventDefault();coachSend(ev.target.value);}});
