/* Integración con Android: temporizador en la notificación, widget, accesos directos y resumen semanal */
function liveNotif(on){
  if(!NAT||typeof NAT.ongoing!=='function')return;
  const L=S.live;
  if(!on||!L||L.phase==='summary'||!S.settings.notif){call(NAT,'ongoingCancel',{});return;}
  const color=(getComputedStyle(document.documentElement).getPropertyValue('--acc')||'').trim()||'#3D5AFE';
  const it=L.items[L.i];
  if(L.phase==='warm'){if(L.warmUntil)call(NAT,'ongoing',{title:'Calentamiento',body:L.t||'Entrenamiento',when:L.warmUntil,countdown:true,color});else call(NAT,'ongoingCancel',{});return;}
  if(L.timed){call(NAT,'ongoing',{title:'Serie en curso',body:L.items[L.timed.i].n,when:L.timed.until,countdown:true,color});return;}
  if(L.rest&&L.rest.until>Date.now()){const k=it?curRow(it):-1;call(NAT,'ongoing',{title:'Descanso',body:it&&k>=0?`Sigue: ${it.n} · serie ${k+1} de ${it.sets.length}`:'Siguiente ejercicio',when:L.rest.until,countdown:true,color});return;}
  call(NAT,'ongoing',{title:(L.t||'Entrenamiento')+' en curso',body:it?`${it.n} · ${it.sets.filter(s=>s.done).length} de ${it.sets.length} series`:'',when:L.t0,countdown:false,color});
}
document.addEventListener('visibilitychange',()=>{liveNotif(document.visibilityState==='hidden');});

/* widget: se guarda la semana completa para que el widget sepa qué toca cada día */
let WJ='',WT=null;
function syncWidget(now){
  if(!NAT||typeof NAT.setWidget!=='function')return;
  clearTimeout(WT);WT=setTimeout(()=>{
    try{const days=[];for(let i=0;i<7;i++){const d=dayAt(i);if(!d){days.push(null);continue;}const p=plan(d.id,S.settings.mode);days.push({t:d.t,s:`${pl(p.length,'ejercicio','ejercicios')} · ${estimate(p)} min`});}
      const w=weekStats(),td=trainDays(),last=S.history[0],today=dayKey(Date.now());
      let next='';for(let k=1;k<=7;k++){const j=(todayIdx+k)%7,d=dayAt(j);if(d){next=`${k===1?'Mañana':DAYNAMES[j]}: ${d.t}`;break;}}
      const o={days,streak:String(streak()),week:`${Math.min(w.days,td)} de ${td} esta semana`,next,
        doneDay:last&&dayKey(last.ts)===today?today:'',doneSub:last?`${titleOf(last)} · ${Math.max(1,Math.round(last.dur/60))} min · ${NF.format(last.vol)} kg`:''};
      const j=JSON.stringify(o);if(j!==WJ){WJ=j;call(NAT,'setWidget',{data:j});}}catch(e){logError('widget',e);}
  },now?50:1200);
}

/* resumen del domingo a las 7 p. m. con lo que llevas de semana */
async function scheduleWeekly(){
  if(!LN)return;try{await LN.cancel({notifications:[{id:120}]});}catch(e){}
  if(S.settings.weekly===false||!S.settings.notif)return;
  const d=new Date();d.setHours(19,0,0,0);const add=(7-d.getDay())%7;d.setDate(d.getDate()+add);if(d.getTime()<Date.now()+60e3)d.setDate(d.getDate()+7);
  const ws=weekStart(d.getTime()-864e5),H=S.history.filter(h=>h.ts>=ws),td=trainDays(),vol=H.reduce((a,h)=>a+(h.vol||0),0),prs=H.reduce((a,h)=>a+(h.pr||[]).length,0),L=myLevel();
  const body=H.length?`${Math.min(H.length,td)} de ${td} entrenos · ${NF.format(vol)} kg${prs?` · ${pl(prs,'récord','récords')}`:''}. Vas en nivel ${L.lv}, ${L.rank.toLowerCase()}.`:'Esta semana no entrenaste. Mañana es buen día para volver: empieza con la versión exprés.';
  call(LN,'schedule',{notifications:[{id:120,title:H.length>=td?'Semana completa':'Tu semana en Mancuernas',body,schedule:{at:d,allowWhileIdle:true}}]});
}

/* abrir la app desde el widget o desde los accesos directos del ícono */
function launchAction(a){
  if(!a||a==='home'||!S.settings.onb)return;
  if(!$('#sheet').hidden)closeSheet(true);
  if(a==='start'){S.tab='hoy';S.sel=todayIdx;render();
    if(S.live){openPlayer();return;}
    if(selDay())startSession();else toast('<span>Hoy es día libre: puedes estirar o hacer intervalos</span>');}
  else if(a==='hiit'){if(!S.live)hiitSheet();}
  else if(a==='stretch'){if(!S.live)seqPreview('stretch-full');}
  else if(a==='body'){S.tab='prog';S.ptab='cuerpo';render();bodySheet();}
  else if(a==='food'&&typeof flogAct==='function'){S.tab='plan';S.planTab='food';S.ftab='diario';S.fdate=fToday();render();if(!S.live)flogAct('fadd',fslotNow());}
  syncGuard();
}
function initNative(){
  if(!NAT)return;
  try{if(typeof NAT.addListener==='function')NAT.addListener('launch',d=>{call(NAT,'getLaunchAction',{});launchAction(d&&d.action);});}catch(e){}
  if(typeof NAT.getLaunchAction==='function')Promise.resolve(NAT.getLaunchAction({})).then(r=>{if(r&&r.action)setTimeout(()=>launchAction(r.action),300);}).catch(()=>{});
  scheduleWeekly();syncWidget(true);
}
function afterFinish(rec){scheduleWeekly();syncWidget(true);liveNotif(false);}
