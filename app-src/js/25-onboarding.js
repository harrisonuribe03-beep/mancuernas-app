/* Asistente de perfil y plan */
/* ---------- asistente ---------- */
const OB={i:0,steps:[],name:'',kg:5,goal:'musculo',lvl:'inter',wd:[0,2,4],dur:60,lim:[]};
function showOnb(re){
  const g=S.program.gen||{};
  Object.assign(OB,{i:0,name:S.settings.name||'',kg:S.settings.kg||5,goal:g.goal||'musculo',lvl:g.lvl||'inter',wd:(g.wd||[0,1,3,4]).slice(),dur:g.dur||60,lim:(g.lim||[]).slice()});
  OB.steps=re?['goal','lvl','days','dur','lim','plan']:['hola','name','goal','lvl','days','dur','lim','kg','plan'];OB.re=!!re;
  $('#onb').hidden=false;renderOnb();syncGuard();
}
function syncGuardOnb(){}
const OBART={hola:'Press militar sentado',name:'Elevaciones laterales',goal:'Sentadilla goblet',lvl:'Curl de bíceps',days:'Remo a una mano',dur:'Plancha',lim:'Bird dog',kg:'Press de pecho en el piso'};
function obGen(){return {goal:OB.goal,lvl:OB.lvl,n:OB.wd.length,wd:OB.wd.slice().sort((a,b)=>a-b),dur:OB.dur,lim:OB.lim.slice()};}
function renderOnb(){
  const st=OB.steps[OB.i],last=OB.i===OB.steps.length-1;
  const opt=(act,v,on,t,sub,ic)=>`<button class="opt" data-act="${act}" data-v="${v}" aria-pressed="${on}">${ic?`<span class="oic">${ic}</span>`:''}<span><b>${t}</b>${sub?`<small>${sub}</small>`:''}</span><span class="ock">${IC.check}</span></button>`;
  const art=st==='plan'?`<img class="heroimg" src="img/hero.webp" alt="">`:artAnim(EXMAP[OBART[st]]);
  let h=`<div class="art ${['hola','name','kg'].includes(st)?'':'short'}">${art}${OB.re?`<button class="skip" data-act="obclose">Cancelar</button>`:`<button class="skip" data-act="obskip">Omitir</button>`}</div><div class="col body">`;
  let ok=true;
  if(st==='hola')h+=`<h1>Tu entrenador en casa</h1><p>Con un par de mancuernas armamos un plan hecho para ti: tu objetivo, tu tiempo y tu cuerpo.</p>`;
  if(st==='name')h+=`<h1>¿Cómo te llamas?</h1><p>Para saludarte y para tu coach de voz.</p><input class="big" id="obname" placeholder="Tu nombre" value="${esc(OB.name)}" maxlength="24" autocomplete="given-name" enterkeyhint="next">`;
  if(st==='goal')h+=`<h1>¿Qué quieres lograr?</h1><div class="opts">${Object.keys(GOALS).map(k=>opt('obgoal',k,OB.goal===k,GOALS[k].t,GOALS[k].s,IC[GOALS[k].ic])).join('')}</div>`;
  if(st==='lvl')h+=`<h1>¿Cuánta experiencia tienes?</h1><div class="opts">${Object.keys(LEVELS).map(k=>opt('oblvl',k,OB.lvl===k,LEVELS[k].t,LEVELS[k].s)).join('')}</div>`;
  if(st==='days'){const n=OB.wd.length;ok=n>=2&&n<=6;
    h+=`<h1>¿Qué días puedes entrenar?</h1><p>Elige entre 2 y 6. Se arma el tipo de rutina que mejor rinde con esos días.</p><div class="wdpick">${LETTERS3.map((l,i)=>`<button data-act="obwd" data-v="${i}" aria-pressed="${OB.wd.includes(i)}">${l}</button>`).join('')}</div>
    <div class="obnote ${ok?'':'bad'}">${ok?`<b>${pl(n,'día','días')}:</b> ${TPL[n].n.split(' · ')[0]}`:n<2?'Elige al menos 2 días':'Máximo 6 días: deja uno para descansar'}</div>`;}
  if(st==='dur')h+=`<h1>¿Cuánto tiempo tienes por sesión?</h1><div class="opts">${[[30,'Rápido','Lo esencial'],[45,'Normal','Buen equilibrio'],[60,'Completo','El plan entero'],[75,'Largo','Más volumen']].map(([v,t,s2])=>opt('obdur',v,OB.dur===v,v+' minutos · '+t,s2,IC.clock)).join('')}</div>`;
  if(st==='lim')h+=`<h1>¿Algo te molesta?</h1><p>Quitamos los ejercicios que pueden empeorarlo.</p><div class="opts">${Object.keys(LIMITS).map(k=>opt('oblim',k,OB.lim.includes(k),LIMITS[k].t,LIMITS[k].s)).join('')}${opt('oblim','none',!OB.lim.length,'Nada me molesta','')}</div>`;
  if(st==='kg')h+=`<h1>¿Cuánto pesa cada mancuerna?</h1><p>Con ese peso empiezan los ejercicios nuevos. Después lo ajustas serie por serie.</p><div class="kg"><button data-act="obkg" data-v="-0.5" aria-label="Menos">−</button><b>${NF.format(OB.kg)}<small> kg</small></b><button data-act="obkg" data-v="0.5" aria-label="Más">+</button></div>`;
  if(st==='plan'){const P=genProgram(obGen());OB.prev=P;
    h+=`<h1>Tu plan está listo</h1><p>${esc(P.name)} · ${GOALS[OB.goal].t.toLowerCase()}</p><ul class="glist obplan">${P.week.map((id,i)=>{if(!id)return '';const d=P.days.find(x=>x.id===id);const p=d.ex.map(x=>({e:rex(x),sets:x.sets}));return `<li><span class="wd">${LETTERS3[i]}</span><span><b>${esc(d.t)}</b><small>${pl(d.ex.length,'ejercicio','ejercicios')} · ${estimate(p)} min</small></span></li>`;}).join('')}</ul><p style="font-size:.82rem;margin-top:10px">Puedes cambiar cualquier ejercicio, serie o día en la pestaña Plan.</p>`;}
  h+=`<div class="grow"></div><div class="obft"><div class="dots">${OB.steps.map((x,i)=>`<i class="${i===OB.i?'on':''}"></i>`).join('')}</div><div class="obnav">${OB.i>0?`<button class="btn ghost" data-act="obback" aria-label="Atrás">${IC.left}</button>`:''}<button class="btn pri block" data-act="obnext" id="obbtn" ${ok?'':'disabled'}>${last?(OB.re?'Usar este plan':'Empezar'):st==='name'&&!OB.name.trim()?'Saltar este paso':'Continuar'}</button></div></div></div>`;
  $('#onb').innerHTML=h;animStart();
}
function endOnb(skip){
  if(!OB.re){S.settings.name=OB.name.trim()||S.settings.name;S.settings.kg=OB.kg;}
  S.settings.onb=true;
  if(!skip){S.program=OB.prev||genProgram(obGen());saveProgram();S.settings.persDis=true;S.sel=todayIdx;S.pick={};}
  saveSettings();$('#onb').hidden=true;$('#onb').innerHTML='';syncGuard();scheduleReminders();render();
  if(!skip)toast(IC.check+'<span>Plan listo: '+esc(S.program.name.split(' · ')[0])+'</span>');
}
function obAct(a,v){
  switch(a){
    case 'obnext':if(OB.i<OB.steps.length-1){OB.i++;renderOnb();if(OB.steps[OB.i]==='name')setTimeout(()=>{const i=$('#obname');if(i)i.focus();},300);}else endOnb(false);return true;
    case 'obback':if(OB.i>0){OB.i--;renderOnb();}return true;
    case 'obskip':endOnb(true);return true;
    case 'obclose':$('#onb').hidden=true;$('#onb').innerHTML='';syncGuard();return true;
    case 'obkg':OB.kg=Math.max(0.5,Math.round((OB.kg+(+v))*2)/2);renderOnb();return true;
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
