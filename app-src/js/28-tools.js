
/* ===================== v4 · intervalos, estiramientos y calculadoras ===================== */
const ST={ // [nombre, segundos, indicación, porLado, imagen]
  pecho:['Pecho en el marco de una puerta',30,'Antebrazo apoyado a la altura del hombro; gira el cuerpo hacia afuera hasta sentir el pecho.',true,'st-pecho'],
  hombro:['Hombro cruzado',30,'Lleva el brazo recto al otro lado y empuja suave por encima del codo.',true,'st-hombro'],
  triceps:['Tríceps sobre la cabeza',30,'Codo arriba y mano detrás de la espalda; empuja el codo con la otra mano.',true,'st-triceps'],
  nino:['Postura del niño',45,'Rodillas abiertas, glúteos a los talones y brazos estirados al frente. Respira lento.',false,'st-nino'],
  gato:['Gato-camello',40,'En cuatro apoyos, redondea y arquea la espalda despacio, vértebra por vértebra.',false,'st-gato'],
  dorsal:['Dorsal de lado',30,'Sube un brazo y inclínate hacia el lado contrario sin girar el tronco.',true,'st-dorsal'],
  biceps:['Bíceps en la pared',30,'Palma en la pared a la altura del hombro y brazo recto; gira el cuerpo hacia afuera.',true,'st-biceps'],
  toracica:['Rotación torácica en el piso',30,'De lado, rodillas dobladas; abre el brazo de arriba como un libro y síguelo con la mirada.',true,'st-toracica'],
  cuad:['Cuádriceps de pie',30,'Lleva el talón al glúteo con las rodillas juntas. Apóyate en la pared si hace falta.',true,'st-cuad'],
  isquio:['Isquiotibiales sentado',40,'Piernas estiradas y espalda recta; inclínate desde la cadera, no desde la espalda.',false,'st-isquio'],
  gluteo:['Glúteo en figura 4',30,'Boca arriba, tobillo sobre la rodilla contraria; jala la pierna de abajo hacia el pecho.',true,'st-gluteo'],
  pantorrilla:['Pantorrilla en la pared',30,'Pie de atrás con el talón en el piso y la rodilla estirada.',true,'st-pantorrilla'],
  flexor:['Flexor de cadera en zancada',30,'Rodilla atrás en el piso; empuja la cadera adelante sin arquear la espalda.',true,'st-flexor'],
  mariposa:['Mariposa',40,'Sentado con las plantas juntas; deja caer las rodillas hacia el piso.',false,'st-mariposa'],
  cuello:['Cuello lateral',20,'Lleva la oreja hacia el hombro sin subir el otro hombro.',true,'st-cuello'],
  respira:['Respiración profunda',30,'Acostado, inhala 4 segundos por la nariz y exhala 6 por la boca.',false,'st-respira']
};
const MOB=[['Círculos de brazos',30,'Grandes y lentos, adelante y atrás.',false,'mob-brazos'],['Gato-camello',40,'Mueve la columna vértebra por vértebra.',false,'st-gato'],
  ['El mejor estiramiento del mundo',30,'Zancada, mano al piso y gira el pecho abriendo el brazo al techo.',true,'mob-mejor'],['Círculos de cadera',30,'Manos en la cintura, círculos amplios en los dos sentidos.',false,'mob-cadera'],
  ['Rotación torácica',30,'En cuatro apoyos, mano en la nuca y gira abriendo el codo al techo.',true,'mob-toracica'],['Sentadilla profunda sostenida',40,'Talones en el piso y codos empujando las rodillas hacia afuera.',false,'mob-sentadilla'],
  ['Balanceo de piernas',30,'Apóyate en la pared y balancea la pierna adelante y atrás, sin forzar.',true,'mob-piernas'],['Tobillo a la pared',30,'Lleva la rodilla hacia la pared sin despegar el talón.',true,'mob-tobillo']];
const SEQS={
  'stretch-push':{t:'Estiramiento de empuje',s:'Pecho, hombros y tríceps',l:['pecho','hombro','triceps','cuello','nino','respira']},
  'stretch-pull':{t:'Estiramiento de tirón',s:'Espalda, dorsales y bíceps',l:['dorsal','biceps','gato','toracica','nino','respira']},
  'stretch-legs':{t:'Estiramiento de pierna',s:'Cuádriceps, isquios, glúteos y pantorrillas',l:['cuad','isquio','gluteo','flexor','pantorrilla','mariposa']},
  'stretch-full':{t:'Estiramiento completo',s:'Todo el cuerpo',l:['pecho','dorsal','triceps','cuad','isquio','gluteo','flexor','nino']},
  mob:{t:'Movilidad matutina',s:'Despierta las articulaciones',mob:true},
  abs:{t:'Abdomen exprés',s:'2 vueltas de 6 ejercicios, 40 s de trabajo por 20 s de descanso',abs:true}
};
const HIITX=[['Sentadilla con salto','hiit-salto','Baja como sentadilla y salta explosivo; aterriza suave.'],['Escaladores','hiit-escaladores','Plancha alta y rodillas al pecho, alternando rápido.'],['Thruster con mancuernas','hiit-thruster','Sentadilla con las mancuernas en los hombros y empuja arriba al subir.'],
  ['Burpees','hiit-burpee','Al piso, flexión opcional, pies adelante y salta con los brazos arriba.'],['Swing con mancuerna','hiit-swing','Bisagra de cadera y lanza la mancuerna con los glúteos, no con los brazos.'],['Jumping jacks','hiit-jacks','Abre piernas y brazos a la vez con saltos ligeros.'],
  ['Zancadas alternas rápidas','zancadas-b','Paso adelante y atrás alternando piernas a buen ritmo.'],['Plancha con toque de hombro','hiit-toque','Plancha alta y toca el hombro contrario sin mover la cadera.'],['Remo renegado','hiit-renegado','En plancha sobre las mancuernas, rema una y luego la otra.'],['Rodillas al pecho','hiit-rodillas','Corre en el sitio subiendo las rodillas a la cadera.']];
const ABSX=[['Plancha','plancha-a','Cuerpo recto, aprieta abdomen y glúteos.'],['Bird dog','bird-dog-b','Brazo y pierna contrarios, sin mover la cadera.'],['Elevación de piernas con rodillas dobladas','piernas-b','Lleva las rodillas al pecho y baja lento.'],
  ['Plancha lateral derecha','plancha-lateral-a','Cadera arriba, codo bajo el hombro.'],['Plancha lateral izquierda','plancha-lateral-a','Cadera arriba, codo bajo el hombro.'],['Russian twist','ab-twist','Gira el torso llevando la mancuerna a cada lado.']];
function buildSeq(key,cfg){
  const steps=[];const add=(t,d,k,sub,img)=>steps.push({t,d,k,sub:sub||'',img:img||null});
  if(key==='hiit'){const c=cfg;let x=0;const H=i=>HIITX[i%HIITX.length];
    add('Prepárate',10,'prep','Primero: '+(c.names?H(0)[0]:'trabajo'),c.names?H(0)[1]:null);
    for(let s=0;s<c.sets;s++){for(let r=0;r<c.rounds;r++){const h=H(x++);add(c.names?h[0]:'¡Trabajo!',c.work,'work',`Ronda ${r+1} de ${c.rounds}${c.sets>1?` · bloque ${s+1} de ${c.sets}`:''}${c.names?' · '+h[2]:''}`,c.names?h[1]:null);
      if(r<c.rounds-1&&c.rest>0)add('Descansa',c.rest,'rest',`Siguiente: ${c.names?H(x)[0]:'trabajo'}`,c.names?H(x)[1]:null);}
      if(s<c.sets-1)add('Descanso largo',c.setRest,'rest',`Bloque ${s+2} a continuación`,c.names?H(x)[1]:null);}
    return {t:cfg.name||'Intervalos',steps,kind:'hiit'};}
  const S0=SEQS[key];
  if(S0.abs){add('Prepárate',5,'prep','Primero: '+ABSX[0][0],ABSX[0][1]);
    for(let r=0;r<2;r++)ABSX.forEach((x,i)=>{add(x[0],40,'work',`Vuelta ${r+1} de 2 · ${x[2]}`,x[1]);if(!(r===1&&i===ABSX.length-1)){const n=ABSX[(i+1)%ABSX.length];add('Descansa',20,'rest','Siguiente: '+n[0],n[1]);}});
    return {t:S0.t,steps,kind:'abs'};}
  const list=S0.mob?MOB:S0.l.map(k=>ST[k]);
  add('Prepárate',5,'prep','Primero: '+list[0][0],list[0][4]);
  list.forEach((x,i)=>{if(x[3]){add(x[0]+' · derecha',x[1],'work',x[2],x[4]);add(x[0]+' · izquierda',x[1],'work',x[2],x[4]);}else add(x[0],x[1],'work',x[2],x[4]);
    const n=list[i+1];if(n)add('Cambia',5,'rest','Siguiente: '+n[0],n[4]);});
  return {t:S0.t,steps,kind:S0.mob?'mob':'stretch'};
}
function seqPreview(key,cfg){
  const q=buildSeq(key,cfg),work=q.steps.filter(s=>s.k==='work'),tot=q.steps.reduce((a,s)=>a+s.d,0);
  const seen=new Set(),items=work.filter(s=>{const k=s.t.replace(/ · (derecha|izquierda)$/,'');if(seen.has(k))return false;seen.add(k);return true;});
  const S0=SEQS[key]||{};
  sheet(`<div class="over">${q.kind==='hiit'?'Intervalos':q.kind==='abs'?'Abdomen':q.kind==='mob'?'Movilidad':'Estiramiento'}</div><h3>${esc(q.t)}</h3><p class="sub">${esc(S0.s||'')} · ${Math.round(tot/60)} min · ${pl(items.length,'ejercicio','ejercicios')}</p>
  <ul class="glist sqlist">${items.map(s=>`<li><span class="thumb">${s.img?`<span class="xa"><img src="${IMG(s.img)}" alt="" loading="lazy"></span>`:''}</span><span><b>${esc(s.t.replace(/ · (derecha|izquierda)$/,''))}</b><small>${s.d} s${/ · (derecha|izquierda)$/.test(s.t)?' por lado':''}</small></span></li>`).join('')}</ul>
  <div class="acts"><button class="btn pri" data-act="seqgo" data-v="${key}">${IC.play}Empezar</button><button class="btn" data-act="close">Cerrar</button></div>`);
}
let SQ=null,SQT=null;
function seqStart(key,cfg){
  ensureAudio();const q=buildSeq(key,cfg);SQ=Object.assign(q,{key,i:0,t0:Date.now(),until:Date.now()+q.steps[0].d*1000,paused:0,lastBeep:null});
  $('#seq').hidden=false;wake(true);seqRender();seqAnnounce();clearInterval(SQT);SQT=setInterval(seqTick,200);syncGuard();
}
function seqTotal(){return SQ.steps.reduce((a,s)=>a+s.d,0);}
function seqRender(){
  const st=SQ.steps[SQ.i],nx=SQ.steps[SQ.i+1],rem=SQ.paused||Math.max(0,(SQ.until-Date.now())/1000);
  const done=SQ.steps.slice(0,SQ.i).reduce((a,s)=>a+s.d,0)+(st.d-rem),pc=done/seqTotal()*100;
  const lbl=st.k==='work'?(SQ.kind==='hiit'||SQ.kind==='abs'?'Trabajo':'Sostén'):st.k==='rest'?'Descanso':'Preparación';
  $('#seq').className='k-'+st.k+(st.img?'':' noimg');
  $('#seq').innerHTML=`<div class="sqbar"><button class="iconbtn" data-act="seqquit" aria-label="Salir">${IC.x}</button><b>${esc(SQ.t)}</b><span>${SQ.i+1}/${SQ.steps.length}</span></div><div class="sqprog"><i style="width:${pc.toFixed(1)}%"></i></div>
  <div class="sqmain">${st.img?`<div class="sqart ${st.k!=='work'?'dim':''}"><img src="${IMG(st.img)}" alt="">${st.k!=='work'?'<span class="sqtag">Siguiente</span>':''}</div>`:''}
  <div class="over">${lbl}</div><h1>${esc(st.t)}</h1><p>${esc(st.sub)}</p>
  <div class="sqtime"><b id="sqcd">${mmss(Math.ceil(rem))}</b><span class="sqbarmini"><i id="sqfill" style="transform:scaleX(${(1-rem/st.d).toFixed(3)})"></i></span></div>
  ${nx&&st.k==='work'?`<div class="sqnext">Después: <b>${esc(nx.k==='rest'?(SQ.steps[SQ.i+2]||nx).t:nx.t)}</b></div>`:!nx?'<div class="sqnext">Último</div>':''}</div>
  <div class="sqctl"><button class="iconbtn" data-act="seqprev" aria-label="Anterior" ${SQ.i===0?'disabled':''}>${IC.left}</button><button class="btn pri" data-act="seqpause">${SQ.paused?IC.play+'Seguir':'Pausa'}</button><button class="iconbtn" data-act="seqnext" aria-label="Siguiente">${IC.right}</button></div>`;
}
function seqAnnounce(){const st=SQ.steps[SQ.i];if(st.k==='work')sfx('work');else if(st.k==='rest')sfx('rest');V.seqStep(SQ,st,SQ.i);}
function seqGo(i){if(i>=SQ.steps.length){seqFinish();return;}SQ.i=i;SQ.until=Date.now()+SQ.steps[i].d*1000;SQ.paused=0;SQ.lastBeep=null;SQ.half=false;seqRender();seqAnnounce();}
function seqTick(){
  if(!SQ||SQ.paused||$('#seq').hidden)return;const st=SQ.steps[SQ.i],rem=(SQ.until-Date.now())/1000,sec=Math.ceil(rem);
  const cd=$('#sqcd'),fl=$('#sqfill');if(cd)cd.textContent=mmss(sec);if(fl)fl.style.transform='scaleX('+Math.min(1,Math.max(0,1-rem/st.d)).toFixed(3)+')';
  const done=SQ.steps.slice(0,SQ.i).reduce((a,s)=>a+s.d,0)+(st.d-Math.max(0,rem));const pb=document.querySelector('.sqprog i');if(pb)pb.style.width=(done/seqTotal()*100).toFixed(1)+'%';
  if(sec<=3&&sec>0&&SQ.lastBeep!==sec){SQ.lastBeep=sec;sfx('tick');}
  if(!SQ.half&&st.k==='work'&&st.d>=30&&rem<=st.d/2){SQ.half=true;sfx('half');if(SQ.kind==='hiit'||SQ.kind==='abs')V.seqHalf();}
  if(rem<=0){buzz(200);seqGo(SQ.i+1);}
}
function seqFinish(){
  clearInterval(SQT);const d=Math.round((Date.now()-SQ.t0)/1000);sfx('done');V.seqFinish(SQ.kind);buzz(300);
  if(d>=60&&typeof addAct==='function')addAct({kind:SQ.kind,key:SQ.key,t:SQ.t,dur:d});
  const t=SQ.t;SQ=null;$('#seq').hidden=true;$('#seq').innerHTML='';wake(false);syncGuard();render();toast(IC.check+'<span>'+esc(t)+' · '+Math.max(1,Math.round(d/60))+' min</span>');confetti('small');
}
function seqClose(){clearInterval(SQT);SQ=null;$('#seq').hidden=true;$('#seq').innerHTML='';wake(false);hush();}
let HC=null;
function hiitSheet(){
  HC=HC||Object.assign({p:'tabata',work:20,rest:10,rounds:8,sets:1,setRest:60,names:true},LS.get('mc-hiit',{}));
  const P={tabata:['Tabata','20 s / 10 s × 8',{work:20,rest:10,rounds:8,sets:1}],t3030:['30 / 30','10 rondas',{work:30,rest:30,rounds:10,sets:1}],emom:['EMOM 12','1 ejercicio por minuto',{work:45,rest:15,rounds:12,sets:1}],quema:['Quemador','40 / 20 × 6 × 3',{work:40,rest:20,rounds:6,sets:3,setRest:60}]};
  const st=(k,lbl,min,max,step,u)=>`<div class="edrow"><span>${lbl}</span><div class="stepper"><button data-act="hcfg" data-v="${k}|${-step}|${min}|${max}">−</button><b>${HC[k]}${u}</b><button data-act="hcfg" data-v="${k}|${step}|${min}|${max}">+</button></div></div>`;
  const tot=HC.sets*(HC.rounds*HC.work+(HC.rounds-1)*HC.rest)+(HC.sets-1)*HC.setRest;
  sheet(`<h3>Intervalos HIIT</h3><p class="sub">Cardio corto e intenso. Ideal en días libres o como cierre.</p>
  <div class="hpresets">${Object.keys(P).map(k=>`<button data-act="hpre" data-v="${k}" aria-pressed="${HC.p===k}"><b>${P[k][0]}</b><small>${P[k][1]}</small></button>`).join('')}</div>
  ${st('work','Trabajo',10,180,5,' s')}${st('rest','Descanso',0,180,5,' s')}${st('rounds','Rondas',1,30,1,'')}${st('sets','Bloques',1,6,1,'')}${HC.sets>1?st('setRest','Descanso entre bloques',15,300,15,' s'):''}
  <div class="set inline" style="padding:14px 0 0;border:0"><span class="lb">Sugerir ejercicios<small>Te dice qué hacer en cada ronda</small></span><button class="sw" data-act="hnames" aria-pressed="${HC.names}" aria-label="Sugerir ejercicios"></button></div>
  <div class="acts"><button class="btn pri" data-act="hgo">${IC.play}Empezar · ${mmss(tot)}</button><button class="btn" data-act="close">Cancelar</button></div>`);
  HC.P=P;
}
function extrasSection(){
  const C=(act,v,ic,t,s)=>`<button class="card xcard" data-act="${act}" data-v="${v}"><span class="xic">${ic}</span><b>${t}</b><small>${s}</small></button>`;
  return `<h2 class="h2">Más entrenamientos</h2><div class="xgrid">${C('hiitcfg','',IC.bolt,'Intervalos HIIT','Tabata, EMOM o a tu medida')}${C('seq','abs',IC.flame.replace('<svg','<svg class="i"'),'Abdomen exprés','12 minutos')}${C('seq','stretch-full',IC.clock,'Estiramiento','10 minutos')}${C('seq','mob',IC.body,'Movilidad','8 minutos al despertar')}</div>
  <h2 class="h2">Herramientas</h2><div class="xgrid">${C('calc1rm','',IC.trophy,'Calculadora 1RM','Tu fuerza máxima estimada')}${C('ptabgo','food',IC.food,'Alimentación','Calorías, peso saludable y menú')}</div>`;
}
function rmSheet(kg,reps){
  const st=S.settings;kg=kg??st.rmkg??10;reps=reps??st.rmreps??8;
  const e1=kg*(1+reps/30),b1=reps<37?kg*36/(37-reps):e1,one=Math.round((e1+b1)/2*2)/2;
  const tbl=[1,3,5,8,10,12,15].map(r=>`<div><b>${r}</b><span>${NF.format(Math.round(one/(1+r/30)*2)/2)} kg</span></div>`).join('');
  const recs=ALLEX.filter(e=>weighted(e.n)).map(e=>({n:e.n,b:bestOf(e.n,S.history)})).filter(x=>x.b).map(x=>({n:x.n,v:Math.round(e1rm(x.b)*2)/2})).sort((a,b)=>b.v-a.v).slice(0,6);
  sheet(`<h3>Calculadora 1RM</h3><p class="sub">El peso máximo que podrías levantar una vez, estimado a partir de una serie.</p>
  <div class="bform"><label><span>Peso <small>kg por mancuerna</small></span><input inputmode="decimal" id="rm-kg" value="${kg}"></label><label><span>Repeticiones</span><input inputmode="numeric" id="rm-r" value="${reps}"></label></div>
  <div class="rmbig"><span>1RM estimado</span><b>${NF.format(one)} kg</b></div><div class="rmtbl"><div class="hd"><b>Reps</b><span>Peso</span></div>${tbl}</div>
  ${recs.length?`<h2 class="h2">Tus ejercicios</h2><ul class="glist">${recs.map(x=>`<li class="kvrow"><span>${x.n}</span><span class="v">${NF.format(x.v)} kg</span></li>`).join('')}</ul>`:''}
  <div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);
}
function toolsAct(a,v){
  switch(a){
    case 'seq':seqPreview(v);return true;
    case 'seqgo':closeSheet(true);seqStart(v);return true;
    case 'seqquit':sheet(`<h3>¿Salir?</h3><p class="sub">Se pierde el avance de esta sesión.</p><div class="acts"><button class="btn pri" data-act="close">Seguir</button><button class="btn" data-act="seqend">Salir</button></div>`);return true;
    case 'seqend':closeSheet(true);seqClose();syncGuard();render();return true;
    case 'seqpause':if(!SQ)return true;if(SQ.paused){SQ.until=Date.now()+SQ.paused*1000;SQ.paused=0;}else{SQ.paused=Math.max(.5,(SQ.until-Date.now())/1000);}seqRender();return true;
    case 'seqnext':if(SQ)seqGo(SQ.i+1);return true;
    case 'seqprev':if(SQ&&SQ.i>0)seqGo(SQ.i-1);return true;
    case 'hiitcfg':hiitSheet();return true;
    case 'hpre':{const p=HC.P[v];Object.assign(HC,p[2],{p:v,setRest:p[2].setRest||HC.setRest});hiitSheet();return true;}
    case 'hcfg':{const [k,st,mn,mx]=v.split('|');HC[k]=Math.max(+mn,Math.min(+mx,HC[k]+(+st)));HC.p='custom';hiitSheet();return true;}
    case 'hnames':HC.names=!HC.names;hiitSheet();return true;
    case 'hgo':{const c={work:HC.work,rest:HC.rest,rounds:HC.rounds,sets:HC.sets,setRest:HC.setRest,names:HC.names,p:HC.p};LS.set('mc-hiit',c);closeSheet(true);seqStart('hiit',Object.assign(c,{name:HC.P[HC.p]?HC.P[HC.p][0]:'Intervalos'}));return true;}
    case 'calc1rm':rmSheet();return true;
  }
  return false;
}
document.addEventListener('input',ev=>{const t=ev.target;if(t.id==='rm-kg'||t.id==='rm-r'){clearTimeout(t._t);t._t=setTimeout(()=>{const kg=parseFloat(String($('#rm-kg').value).replace(',','.')),r=parseInt($('#rm-r').value,10);if(kg>0&&r>0&&r<=30){S.settings.rmkg=kg;S.settings.rmreps=r;saveSettings();const f=document.activeElement&&document.activeElement.id;rmSheet(kg,r);const el=f&&$('#'+f);if(el){el.focus();const L=el.value.length;try{el.setSelectionRange(L,L);}catch(e){}}}},500);}});
