/* Asistente de perfil y plan */
/* ---------- asistente ---------- */
const OB={i:0,steps:[],name:'',kg:5,goal:'musculo',lvl:'inter',wd:[0,2,4],dur:60,lim:[],sex:'',age:25,wt:70,ht:170,eq:['db'],focus:'equilibrado',eqOpen:false};
const SEXES={h:['Hombre','mijo'],m:['Mujer','mija'],x:['Prefiero no decirlo','']};
function lastWeight(){for(let i=S.body.length-1;i>=0;i--)if(S.body[i].w!=null)return S.body[i].w;return null;}
function showOnb(re){
  const g=S.program.gen||{},st=S.settings;
  Object.assign(OB,{i:0,name:st.name||'',kg:st.kg||5,goal:g.goal||'musculo',lvl:g.lvl||'inter',wd:(g.wd||[0,1,3,4]).slice(),dur:g.dur||60,lim:(g.lim||[]).slice(),
    sex:st.sex||'',age:st.age||25,wt:lastWeight()||st.wt||(st.sex==='m'?60:72),ht:st.ht||(st.sex==='m'?160:172),eq:(g.eq||st.eq||['db']).slice(),focus:g.focus||'equilibrado',eqOpen:placeOf(g.eq||st.eq)==='custom'});
  OB.steps=re?['goal','lvl','place','days','dur','focus','lim','kg','plan']:['hola','name','sex','body','goal','lvl','place','days','dur','focus','lim','kg','plan'];OB.re=!!re;
  $('#onb').hidden=false;renderOnb();syncGuard();
}
// El paso del peso de las mancuernas solo aplica si las tiene
const obSkip=st=>st==='kg'&&!OB.eq.includes('db');
function syncGuardOnb(){}
const OBART={hola:'Press militar sentado',name:'Elevaciones laterales',sex:'Curl martillo',body:'Peso muerto rumano',goal:'Sentadilla goblet',lvl:'Curl de bíceps',place:'Press de pecho agarre neutro',days:'Remo a una mano',dur:'Plancha',focus:'Puente de glúteo con mancuerna',lim:'Bird dog',kg:'Press de pecho en el piso'};
function obGen(){return {goal:OB.goal,lvl:OB.lvl,n:OB.wd.length,wd:OB.wd.slice().sort((a,b)=>a-b),dur:OB.dur,lim:OB.lim.slice(),eq:OB.eq.slice(),focus:OB.focus};}
function eqChecklist(sel,act){
  return EQG.map(([g,t])=>`<div class="eqg"><b>${t}</b><div class="chips wrap">${Object.keys(EQ).filter(k=>EQ[k].g===g).map(k=>`<button class="chip" data-act="${act}" data-v="${k}" aria-pressed="${sel.includes(k)}">${EQ[k].t}</button>`).join('')}</div></div>`).join('');
}
function renderOnb(){
  const st=OB.steps[OB.i],last=OB.i===OB.steps.length-1;
  const opt=(act,v,on,t,sub,ic)=>`<button class="opt" data-act="${act}" data-v="${v}" aria-pressed="${on}">${ic?`<span class="oic">${ic}</span>`:''}<span><b>${t}</b>${sub?`<small>${sub}</small>`:''}</span><span class="ock">${IC.check}</span></button>`;
  const art=st==='plan'?`<img class="heroimg" src="${IMG('hero')}" alt="">`:artAnim(EXMAP[OBART[st]]);
  let h=`<div class="art ${['hola','name','kg'].includes(st)?'':'short'}">${art}${OB.re?`<button class="skip" data-act="obclose">Cancelar</button>`:`<button class="skip" data-act="obskip">Omitir</button>`}</div><div class="col body">`;
  let ok=true;
  if(st==='hola')h+=`<h1>Tu entrenador personal</h1><p>En casa o en el gimnasio, con mancuernas, máquinas o solo tu cuerpo. Armamos un plan hecho para ti: tu objetivo, tu tiempo y tu cuerpo.</p>`;
  if(st==='name')h+=`<h1>¿Cómo te llamas?</h1><p>Para saludarte y para tu coach de voz.</p><input class="big" id="obname" placeholder="Tu nombre" value="${esc(OB.name)}" maxlength="24" autocomplete="given-name" enterkeyhint="next">`;
  if(st==='sex'){ok=!!OB.sex;h+=`<h1>¿Eres hombre o mujer?</h1><p>Ajusta los pesos iniciales, tus calorías, el personaje y cómo te habla tu coach.</p><div class="opts">${Object.keys(SEXES).map(k=>opt('obsex',k,OB.sex===k,SEXES[k][0],'')).join('')}</div>`;}
  if(st==='body'){const bmi=OB.wt/((OB.ht/100)**2);ok=OB.age>=12&&OB.age<=99&&OB.wt>=30&&OB.wt<=250&&OB.ht>=120&&OB.ht<=230;
    const row=(k,l,u,step)=>`<div class="obrow"><span>${l}</span><div class="stepper"><button data-act="obnum" data-v="${k}|${-step}" aria-label="Menos">−</button><input inputmode="decimal" id="ob-${k}" value="${NF.format(OB[k])}" aria-label="${l}"><button data-act="obnum" data-v="${k}|${step}" aria-label="Más">+</button></div><small>${u}</small></div>`;
    h+=`<h1>Tus datos</h1><p>Para tu rango de peso saludable, tus calorías y tu plan de comidas. Solo se guardan en tu teléfono.</p>
    <div class="obbody">${row('age','Edad','años',1)}${row('wt','Peso','kg',.5)}${row('ht','Estatura','cm',1)}</div>
    <div class="obnote ${ok?'':'bad'}" id="obbmi">${ok?`IMC ${NF.format(Math.round(bmi*10)/10)} · ${bmiCat(bmi).t}`:'Revisa los datos'}</div>`;}
  if(st==='goal')h+=`<h1>¿Qué quieres lograr?</h1><div class="opts">${Object.keys(GOALS).map(k=>opt('obgoal',k,OB.goal===k,GOALS[k].t,GOALS[k].s,IC[GOALS[k].ic])).join('')}</div>`;
  if(st==='lvl')h+=`<h1>¿Cuánta experiencia tienes?</h1><div class="opts">${Object.keys(LEVELS).map(k=>opt('oblvl',k,OB.lvl===k,LEVELS[k].t,LEVELS[k].s)).join('')}</div>`;
  if(st==='place'){const pk=OB.eqOpen?'custom':placeOf(OB.eq);
    h+=`<h1>¿Dónde vas a entrenar?</h1><p>El plan usa solo lo que tengas. Lo puedes cambiar cuando quieras.</p><div class="opts">${Object.keys(PLACES).map(k=>opt('obplace',k,pk===k,PLACES[k].t,PLACES[k].s,IC[{casa0:'body',casadb:'dumb',casaeq:'home',gym:'gym'}[k]])).join('')}
    ${opt('obplace','custom',pk==='custom','Elegir mi equipo uno por uno','Máquinas, poleas, barra, bandas…',IC.list)}</div>${pk==='custom'?`<div class="eqlist">${eqChecklist(OB.eq,'obeq')}</div>`:''}`;}
  if(st==='days'){const n=OB.wd.length;ok=n>=2&&n<=6;
    h+=`<h1>¿Qué días puedes entrenar?</h1><p>Elige entre 2 y 6. Se arma el tipo de rutina que mejor rinde con esos días.</p><div class="wdpick">${LETTERS3.map((l,i)=>`<button data-act="obwd" data-v="${i}" aria-pressed="${OB.wd.includes(i)}">${l}</button>`).join('')}</div>
    <div class="obnote ${ok?'':'bad'}">${ok?`<b>${pl(n,'día','días')}:</b> ${TPL[n].n.split(' · ')[0]}`:n<2?'Elige al menos 2 días':'Máximo 6 días: deja uno para descansar'}</div>`;}
  if(st==='dur')h+=`<h1>¿Cuánto tiempo tienes por sesión?</h1><div class="opts">${[[30,'Rápido','Lo esencial'],[45,'Normal','Buen equilibrio'],[60,'Completo','El plan entero'],[75,'Largo','Más volumen']].map(([v,t,s2])=>opt('obdur',v,OB.dur===v,v+' minutos · '+t,s2,IC.clock)).join('')}</div>`;
  if(st==='focus')h+=`<h1>¿Qué zona quieres priorizar?</h1><p>Le sumamos trabajo a esa zona sin descuidar el resto.</p><div class="opts">${Object.keys(FOCUS).map(k=>opt('obfocus',k,OB.focus===k,FOCUS[k].t,FOCUS[k].s)).join('')}</div>`;
  if(st==='lim')h+=`<h1>¿Algo te molesta?</h1><p>Quitamos los ejercicios que pueden empeorarlo.</p><div class="opts">${Object.keys(LIMITS).map(k=>opt('oblim',k,OB.lim.includes(k),LIMITS[k].t,LIMITS[k].s)).join('')}${opt('oblim','none',!OB.lim.length,'Nada me molesta','')}</div>`;
  if(st==='kg')h+=`<h1>¿Cuánto pesa cada mancuerna?</h1><p>Con ese peso empiezan los ejercicios con mancuernas. Las máquinas y la barra traen su propio peso sugerido.</p><div class="kg"><button data-act="obkg" data-v="-0.5" aria-label="Menos">−</button><b>${NF.format(OB.kg)}<small> kg</small></b><button data-act="obkg" data-v="0.5" aria-label="Más">+</button></div>`;
  if(st==='plan'){const P=genProgram(obGen());OB.prev=P;
    h+=`<h1>Tu plan está listo</h1><p>${esc(P.name)} · ${GOALS[OB.goal].t.toLowerCase()}${OB.focus!=='equilibrado'?' · '+FOCUS[OB.focus].t.toLowerCase():''}</p><ul class="glist obplan">${P.week.map((id,i)=>{if(!id)return '';const d=P.days.find(x=>x.id===id);const p=d.ex.map(x=>({e:rex(x),sets:x.sets}));return `<li><span class="wd">${LETTERS3[i]}</span><span><b>${esc(d.t)}</b><small>${pl(d.ex.length,'ejercicio','ejercicios')} · ${estimate(p)} min</small></span></li>`;}).join('')}</ul><p style="font-size:.82rem;margin-top:10px">Puedes cambiar cualquier ejercicio, serie o día en la pestaña Plan.</p>`;}
  const shown=OB.steps.filter(x=>!obSkip(x)),pos=shown.indexOf(st);
  h+=`<div class="grow"></div><div class="obft"><div class="dots">${shown.map((x,i)=>`<i class="${i===pos?'on':''}"></i>`).join('')}</div><div class="obnav">${OB.i>0?`<button class="btn ghost" data-act="obback" aria-label="Atrás">${IC.left}</button>`:''}<button class="btn pri block" data-act="obnext" id="obbtn" ${ok?'':'disabled'}>${last?(OB.re?'Usar este plan':'Empezar'):st==='name'&&!OB.name.trim()?'Saltar este paso':'Continuar'}</button></div></div></div>`;
  $('#onb').innerHTML=h;animStart();
}
function endOnb(skip){
  const st=S.settings;
  if(!OB.re){st.name=OB.name.trim()||st.name;if(OB.sex)st.sex=OB.sex;
    if(OB.steps.includes('body')&&!skip){st.age=OB.age;st.ht=OB.ht;st.wt=OB.wt;if(lastWeight()!==OB.wt)addBody({id:'mcb-'+Date.now(),ts:Date.now(),w:OB.wt});}}
  st.kg=OB.kg;st.onb=true;
  if(!skip){st.eq=OB.eq.slice();S.program=OB.prev||genProgram(obGen());saveProgram();st.persDis=true;S.sel=todayIdx;S.pick={};}
  saveSettings();$('#onb').hidden=true;$('#onb').innerHTML='';syncGuard();scheduleReminders();render();
  if(!skip)toast(IC.check+'<span>Plan listo: '+esc(S.program.name.split(' · ')[0])+'</span>');
}
function obMove(d){let i=OB.i+d;while(i>0&&i<OB.steps.length-1&&obSkip(OB.steps[i]))i+=d;return Math.max(0,Math.min(OB.steps.length-1,i));}
function obReadBody(){['age','wt','ht'].forEach(k=>{const i=$('#ob-'+k);if(!i)return;const v=parseFloat(String(i.value).replace(',','.'));if(!isNaN(v))OB[k]=k==='wt'?Math.round(v*10)/10:Math.round(v);});}
function obAct(a,v){
  switch(a){
    case 'obnext':if(OB.steps[OB.i]==='body')obReadBody();if(OB.i<OB.steps.length-1){OB.i=obMove(1);renderOnb();if(OB.steps[OB.i]==='name')setTimeout(()=>{const i=$('#obname');if(i)i.focus();},300);}else endOnb(false);return true;
    case 'obback':if(OB.steps[OB.i]==='body')obReadBody();if(OB.i>0){OB.i=obMove(-1);renderOnb();}return true;
    case 'obskip':endOnb(true);return true;
    case 'obclose':$('#onb').hidden=true;$('#onb').innerHTML='';syncGuard();return true;
    case 'obkg':OB.kg=Math.max(0.5,Math.round((OB.kg+(+v))*2)/2);renderOnb();return true;
    case 'obsex':OB.sex=v;renderOnb();return true;
    case 'obnum':{obReadBody();const [k,d]=v.split('|');OB[k]=Math.round((OB[k]+(+d))*10)/10;renderOnb();return true;}
    case 'obplace':if(v==='custom'){OB.eqOpen=true;}else{OB.eqOpen=false;OB.eq=PLACES[v].eq.slice();}renderOnb();return true;
    case 'obeq':{const k=OB.eq.indexOf(v);if(k>=0)OB.eq.splice(k,1);else OB.eq.push(v);renderOnb();return true;}
    case 'obfocus':OB.focus=v;renderOnb();return true;
    case 'obgoal':OB.goal=v;renderOnb();return true;
    case 'oblvl':OB.lvl=v;renderOnb();return true;
    case 'obdur':OB.dur=+v;renderOnb();return true;
    case 'obwd':{const i=+v,k=OB.wd.indexOf(i);if(k>=0)OB.wd.splice(k,1);else OB.wd.push(i);renderOnb();return true;}
    case 'oblim':if(v==='none')OB.lim=[];else{const k=OB.lim.indexOf(v);if(k>=0)OB.lim.splice(k,1);else OB.lim.push(v);}renderOnb();return true;
  }
  return false;
}
function planAct(a,v){
  const P=S.program,sp=String(v||'').split('|');
  const day=id=>P.days.find(x=>x.id===id);
  switch(a){
    case 'wizard':showOnb(!!S.history.length||!!S.settings.onb);return true;
    case 'persdis':S.settings.persDis=true;saveSettings();render();return true;
    case 'pickday':sheet(`<h3>¿Qué quieres entrenar hoy?</h3><ul class="glist jump" style="margin-top:10px">${P.days.map(d=>`<li><button class="row" data-act="pickdayok" data-v="${d.id}"><span class="dico">${IC.dumb}</span><span class="nm">${esc(d.t)}<small style="display:block;color:var(--tx2);font-weight:500">${pl(d.ex.length,'ejercicio','ejercicios')}</small></span></button></li>`).join('')}</ul><div class="acts"><button class="btn" data-act="close">Cancelar</button></div>`);return true;
    case 'pickdayok':S.pick=S.pick||{};S.pick[S.sel]=v;closeSheet();render();return true;
    case 'startid':if(S.live){toast('Termina o descarta el entrenamiento en pausa primero');return true;}startSession(v);return true;
    case 'wkset':wkSetSheet(+v);return true;
    case 'wkpick':{P.week[+sp[0]]=sp[1]||null;touchProgram();closeSheet();render();return true;}
    case 'exedit':exEditSheet(sp[0],+sp[1]);return true;
    case 'rtog':S.openR=S.openR||{};S.openR[v]=!S.openR[v];render();return true;
    case 'edss':{const x=day(sp[0]).ex[+sp[1]];x.ss=!x.ss;if(!x.ss)delete x.ss;touchProgram();exEditSheet(sp[0],+sp[1]);render();return true;}
    case 'edsets':{const x=day(sp[0]).ex[+sp[1]];x.sets=Math.max(1,Math.min(10,x.sets+(+sp[2])));touchProgram();exEditSheet(sp[0],+sp[1]);render();return true;}
    case 'edreps':{const x=day(sp[0]).ex[+sp[1]],side=(/ por .*/.exec(x.reps)||[''])[0];x.reps=(sp[2]==='al fallo'?sp[2]:sp[2]+side);touchProgram();exEditSheet(sp[0],+sp[1]);render();return true;}
    case 'edcust':{const a1=parseInt($('#ed-a').value,10),b1=parseInt($('#ed-b').value,10);if(!(a1>0&&a1<=100)){toast('Escribe al menos el mínimo');return true;}
      const x=day(sp[0]).ex[+sp[1]],side=(/ por .*/.exec(x.reps)||[''])[0];x.reps=(b1>a1?a1+'–'+b1:String(a1))+side;touchProgram();exEditSheet(sp[0],+sp[1]);render();return true;}
    case 'edrest':{day(sp[0]).ex[+sp[1]].rest=+sp[2];touchProgram();exEditSheet(sp[0],+sp[1]);render();return true;}
    case 'edmove':{const l=day(sp[0]).ex,k=+sp[1],j=k+(+sp[2]);if(j<0||j>=l.length)return true;[l[k],l[j]]=[l[j],l[k]];touchProgram();exEditSheet(sp[0],j);render();return true;}
    case 'edrm':{const l=day(sp[0]).ex,k=+sp[1],old=l.splice(k,1)[0];touchProgram();closeSheet();render();undoable('Quitaste '+esc(old.n),()=>{const d2=day(sp[0]);if(d2){d2.ex.splice(k,0,old);touchProgram();render();}});return true;}
    case 'exadd':pickerSheet('add',v);return true;
    case 'exrepl':pickerSheet('repl',sp[0],+sp[1]);return true;
    case 'pickgrp':PICK.g=v;document.querySelectorAll('#sheet .chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.v===v));$('#picklist').innerHTML=pickList();return true;
    case 'pickex':{const d=day(PICK.id);if(!d)return true;const ne=newEntry(v);
      if(PICK.mode==='repl'){const old=d.ex[PICK.k];d.ex[PICK.k]=Object.assign(ne,{sets:old.sets});touchProgram();exEditSheet(d.id,PICK.k);render();toast('Cambiado por '+esc(v));}
      else{d.ex.push(ne);touchProgram();$('#picklist').innerHTML=pickList();render();toast(IC.check+'<span>Añadido a '+esc(d.t)+'</span>');}
      return true;}
    case 'rmenu':rMenu(v);return true;
    case 'rrename':{const t=($('#rname').value||'').trim();if(!t){toast('Escribe un nombre');return true;}day(v).t=t;touchProgram();closeSheet();render();return true;}
    case 'rdup':{const d=day(v),c=JSON.parse(JSON.stringify(d));c.id='c'+Date.now();c.t=d.t+' (copia)';P.days.push(c);touchProgram();closeSheet();render();return true;}
    case 'rdel':{const snap=JSON.stringify({days:P.days,week:P.week});P.days=P.days.filter(x=>x.id!==v);P.week=P.week.map(x=>x===v?null:x);touchProgram();closeSheet();render();undoable('Rutina borrada',()=>{const o=JSON.parse(snap);S.program.days=o.days;S.program.week=o.week;touchProgram();render();});return true;}
    case 'rnew':{const c={id:'c'+Date.now(),t:'Mi rutina',w:'full',ex:[]};P.days.push(c);S.openR=S.openR||{};S.openR[c.id]=true;touchProgram();render();pickerSheet('add',c.id);return true;}
  }
  return obAct(a,v);
}
