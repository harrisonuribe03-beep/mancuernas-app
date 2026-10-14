/* Sonido básico, vibración, pantalla encendida, notificaciones y avisos */
/* ---------- sonido, vibración, pantalla, notificaciones ---------- */
let AC=null;
function ensureAudio(){if(NAT&&typeof NAT.play==='function')return;try{if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C();}if(AC&&AC.state==='suspended')AC.resume();}catch(e){}}
function beep(f,dur){if(!S.settings.sound||!AC)return;try{const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(.0001,AC.currentTime);g.gain.exponentialRampToValueAtTime(.4,AC.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+dur);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+dur+.05);}catch(e){}}
function buzz(ms){if(!S.settings.vib)return;if(NAT)call(NAT,'vibrate',{ms});else{try{navigator.vibrate&&navigator.vibrate(ms);}catch(e){}}}
let WL=null;
async function wake(on){
  on=on&&S.settings.wake;
  if(NAT){call(NAT,'keepAwake',{on:!!on});return;}
  try{if(on&&navigator.wakeLock){WL=await navigator.wakeLock.request('screen');}else if(!on&&WL){await WL.release();WL=null;}}catch(e){WL=null;}
}
async function askNotif(){
  if(!LN||!S.settings.notif)return;
  try{const p=await LN.checkPermissions();if(p.display!=='granted')await LN.requestPermissions();
    if(typeof LN.checkExactNotificationSetting==='function'){const x=await LN.checkExactNotificationSetting();
      if(x&&x.exact_alarm&&x.exact_alarm!=='granted'&&!S.settings.exactAsked){S.settings.exactAsked=true;saveSettings();await LN.changeExactNotificationSetting();}}}catch(e){}
}
function notifCancel(){call(LN,'cancel',{notifications:[{id:7}]});}
function activeTimer(){const L=S.live;if(!L||L.phase==='summary')return null;
  if(L.phase==='warm'&&L.warmUntil)return {at:L.warmUntil,title:'Calentamiento terminado',body:'Empieza: '+L.items[0].n};
  if(L.timed)return {at:L.timed.until,title:'Tiempo cumplido',body:L.items[L.timed.i].n};
  if(L.rest){const it=L.items[L.i];return {at:L.rest.until,title:'Descanso terminado',body:'Siguiente: '+(it?it.n:'tu próxima serie')};}
  return null;}
function notifSchedule(){
  const t=activeTimer();if(!LN||!S.settings.notif||!t||t.at<Date.now()+1500)return;
  call(LN,'schedule',{notifications:[{id:7,title:t.title,body:t.body,schedule:{at:new Date(t.at),allowWhileIdle:true}}]});
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){notifSchedule();}
  else{notifCancel();
    const t=(new Date().getDay()+6)%7;if(t!==todayIdx){todayIdx=t;S.sel=t;if($('#player').hidden)render();}
    if(S.live&&S.live.phase!=='summary'&&!$('#player').hidden){wake(true);tick();}}
});
let TT=null;
let TACT=null;
function toast(html,gold,action){const t=$('#toast');TACT=action||null;
  t.className=(gold?'gold ':'')+($('#player').hidden?'':'low')+(action?' act':'');
  t.innerHTML=html+(action?`<button class="tact" data-act="toastact">${esc(action.label)}</button>`:'');
  void t.offsetWidth;t.classList.add('show');clearTimeout(TT);TT=setTimeout(()=>{t.classList.remove('show');TACT=null;},action?4500:2600);}
function undoable(msg,undo){toast('<span>'+msg+'</span>',false,{label:'Deshacer',fn:undo});}

