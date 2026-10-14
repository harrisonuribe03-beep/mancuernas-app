/* Eventos e inicio */
/* ---------- eventos ---------- */
document.addEventListener('input',ev=>{const t=ev.target;
  if(t.matches('#player input[data-k]')&&S.live){t.classList.remove('bad');const it=S.live.items[S.live.i];const v=parseFloat(String(t.value).replace(',','.'));const s=it.sets[+t.dataset.r];
    if(s&&!isNaN(v)&&v>=0){s[t.dataset.k]=v;
      if(t.dataset.k==='kg')for(let k=+t.dataset.r+1;k<it.sets.length;k++)if(!it.sets[k].done){it.sets[k].kg=v;const inp=document.querySelector(`#player input[data-k="kg"][data-r="${k}"]`);if(inp)inp.value=v;}
      saveLive();}}
  else if(t.id==='in-name'){S.settings.name=t.value.trim();saveSettings();const a=document.querySelector('.avatar');if(a)a.textContent=(S.settings.name.charAt(0)||'?').toUpperCase();}
  else if(t.id==='libq'){S.lib.q=t.value;const l=$('#liblist');if(l)l.innerHTML=libList();}
  else if(t.id==='obname'){OB.name=t.value;const b=$('#obbtn');if(b)b.textContent=t.value.trim()?'Continuar':'Saltar este paso';}
  else if(t.id==='pickq'&&PICK){PICK.q=t.value;const l=$('#picklist');if(l)l.innerHTML=pickList();}
});
document.addEventListener('focusin',ev=>{const t=ev.target;if(t.matches('#player input')){setTimeout(()=>{try{t.select();t.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}},60);}});
document.addEventListener('change',ev=>{const t=ev.target;
  if(t.id==='exsel'){S.prog.ex=t.value;render();}
  else if(t.id==='in-vol'){S.settings.vol=+t.value;saveSettings();sfx('set');}
  else if(t.id==='in-rtime'&&t.value){S.settings.remindTime=t.value;saveSettings();scheduleReminders();toast('Recordatorio a las '+t.value);}
  else if(t.id==='in-import'&&t.files&&t.files[0]){const f=t.files[0];if(f.size>5e6){toast('El archivo es demasiado grande');return;}const rd=new FileReader();rd.onload=()=>importData(String(rd.result));rd.readAsText(f);t.value='';}
});
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'&&!$('#sheet').hidden)closeSheet();
  if(ev.key==='Enter'&&ev.target.id==='obname'){obAct('obnext');}
  if(ev.key==='Enter'&&ev.target.matches('#player input')){ev.preventDefault();ev.target.blur();}
});
let lockUntil=0;
/* deslizar a los lados en el entrenamiento para cambiar de ejercicio */
let SW=null;
document.addEventListener('touchstart',ev=>{const t=ev.target;if(!S.live||S.live.phase!=='work'||$('#player').hidden||!$('#sheet').hidden||t.closest('input,button,.sets,#pbottom'))return;const p=ev.touches[0];SW={x:p.clientX,y:p.clientY,t:Date.now()};},{passive:true});
document.addEventListener('touchend',ev=>{if(!SW)return;const p=ev.changedTouches[0],dx=p.clientX-SW.x,dy=p.clientY-SW.y,dt=Date.now()-SW.t;SW=null;
  if(Math.abs(dx)<70||Math.abs(dy)>Math.abs(dx)*.6||dt>600)return;const L=S.live;if(!L||Date.now()<lockUntil)return;lockUntil=Date.now()+380;
  const j=L.i+(dx<0?1:-1);if(j<0||j>=L.items.length)return;L.i=j;saveLive();renderPlayer();const b=$('.exhead');if(b)b.classList.add(dx<0?'swl':'swr');buzz(10);},{passive:true});
document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-act]');
  if(!b){if(ev.target.id==='sheet')closeSheet();return;}
  if(b.disabled)return;
  const a=b.dataset.act,v=b.dataset.v,L=S.live;
  if(['tick','tgo','tstop','addset','goto','next','prev','jumpsheet'].includes(a)){
    if(Date.now()<lockUntil)return;lockUntil=Date.now()+380;
    if(b.dataset.i!=null&&L&&+b.dataset.i!==L.i)return;
  }
  switch(a){
    case 'tab':{const was=!!S.mePage;S.tab=v;S.prog.bar=null;if(v!=='me'||b.closest('.tabs'))S.mePage=null;render();window.scrollTo(0,0);if(was)syncGuard();break;}
    case 'day':S.sel=+v;render();break;
    case 'mode':S.settings.mode=v;saveSettings();render();scheduleReminders();break;
    case 'info':infoSheet(v);break;
    case 'sess':sessSheet(v);break;
    case 'close':closeSheet();break;
    case 'toastact':{const f=TACT&&TACT.fn;TACT=null;$('#toast').classList.remove('show');if(f)f();break;}
    case 'grp':S.lib.g=v;document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.v===v));$('#liblist').innerHTML=libList();break;
    case 'bar':S.prog.bar=+v;render();break;
    case 'mepage':S.mePage=v||null;render();window.scrollTo(0,0);syncGuard();break;
    case 'errcopy':{const t=JSON.stringify(LS.get(ERRLOG,[]),null,1);try{navigator.clipboard.writeText(t).then(()=>toast('Registro copiado'),()=>toast('No se pudo copiar'));}catch(e){toast('No se pudo copiar');}break;}
    case 'ptab':S.ptab=v;render();window.scrollTo(0,0);break;
    case 'exd':if(v)exDetail(v,'prog');break;
    case 'exdt':{const i=v.indexOf('|');exDetail(v.slice(i+1),v.slice(0,i));const p=$('#sheet .pan');if(p)p.scrollTop=0;break;}
    case 'mo':S.prog.mo=Math.min(0,S.prog.mo+(+v));render();break;
    case 'start':if(S.live){sheet(`<h3>Tienes un entrenamiento en pausa</h3><p class="sub">¿Lo sigues o empiezas el de hoy?</p><div class="acts"><button class="btn pri" data-act="resume">Seguir el anterior</button><button class="btn" data-act="restart">Empezar el de hoy</button><button class="btn ghost" data-act="close">Cancelar</button></div>`);}else startSession();break;
    case 'restart':closeSheet(true);S.live=null;startSession();break;
    case 'resume':{closeSheet(true);const l=S.live;if(l){l.timed=null;if(l.rest&&l.rest.until<Date.now())l.rest=null;if(l.phase==='warm'&&l.warmUntil&&l.warmUntil<Date.now()){l.phase='work';l.warmUntil=0;}openPlayer();}else syncGuard();break;}
    case 'discard':S.live=null;saveLive();render();break;
    case 'rest':S.settings.rest=v==='auto'?'auto':+v;saveSettings();render();break;
    case 'kg':S.settings.kg=Math.max(0.5,Math.round((S.settings.kg+(+v))*2)/2);saveSettings();render();break;
    case 'tog':S.settings[v]=!S.settings[v];saveSettings();if(v==='notif'&&S.settings.notif)askNotif();if(v==='remind'||v==='core'||v==='name')scheduleReminders();if(v==='weekly'||v==='notif')scheduleWeekly();render();if(v==='remind'&&S.settings.remind)toast('Te aviso a las '+S.settings.remindTime+' de lunes a sábado');break;
    case 'theme':S.settings.theme=v;saveSettings();applyTheme();render();break;
    case 'askdel':sheet(`<h3>¿Borrar esta sesión?</h3><p class="sub">Se quita del historial y no se puede recuperar.</p><div class="acts"><button class="btn pri" data-act="del" data-v="${v}">Borrar</button><button class="btn" data-act="close">Cancelar</button></div>`);break;
    case 'del':{const old=S.history.find(h=>h.id===v);delSession(v);closeSheet();render();if(old)undoable('Sesión borrada',()=>{addSession(old);S.history.sort((a,b)=>b.ts-a.ts);LS.set('mc-hist',S.history);render();});break;}
    case 'askwipe':sheet(`<h3>¿Borrar todo el historial?</h3><p class="sub">Se borran tus entrenamientos, récords y logros. No se puede deshacer.</p><div class="acts"><button class="btn pri" data-act="wipe">Borrar todo</button><button class="btn" data-act="close">Cancelar</button></div>`);break;
    case 'wipe':{const old=S.history.slice();old.forEach(h=>delSession(h.id));closeSheet();render();undoable('Historial borrado',()=>{old.slice().reverse().forEach(h=>addSession(h));S.history.sort((a,b)=>b.ts-a.ts);LS.set('mc-hist',S.history);render();});break;}
    case 'askquit':askQuit();break;
    case 'askfinish':{const left=L.items.reduce((a,it)=>a+it.sets.filter(s=>!s.done).length,0);
      if(!left){finish();break;}
      sheet(`<h3>¿Terminar ahora?</h3><p class="sub">Te faltan ${pl(left,'serie','series')}. Se guarda solo lo que marcaste.</p><div class="acts"><button class="btn pri" data-act="finish">Terminar y guardar</button><button class="btn" data-act="close">Seguir entrenando</button></div>`);break;}
    case 'finish':closeSheet(true);finish();syncGuard();break;
    case 'pause':closeSheet(true);if(L)L.timed=null;saveLive();closePlayer();break;
    case 'sumok':S.live=null;S.summary=null;saveLive();S.tab='hoy';closePlayer();break;
    case 'warmgo':ensureAudio();L.wstp=-1;L.warmUntil=Date.now()+WARM*1000;saveLive();renderPlayer();break;
    case 'warmskip':L.phase='work';L.warmUntil=0;L.t0=Date.now();notifCancel();saveLive();renderPlayer();V.first(L.items[L.i]);break;
    case 'radd':if(L.rest){L.rest.until+=(+v)*1000;L.rest.total=Math.max(L.rest.total+(+v),5);if(L.rest.until<Date.now()+1000)L.rest.until=Date.now()+1000;saveLive();tick();}break;
    case 'rskip':L.rest=null;notifCancel();saveLive();renderBottom();break;
    case 'tick':{ensureAudio();const it=L.items[L.i],k=+v,s=it.sets[k];
      if(s.done){s.done=false;L.rest=null;notifCancel();recomputePRs();saveLive();renderPlayer(true);break;}
      const r=readRow(k);if(!r){toast('Revisa el peso y las repeticiones');break;}
      s.kg=r.kg;if(r.reps!=null)s.reps=r.reps;completeRow(k);break;}
    case 'tgo':{ensureAudio();const it=L.items[L.i],r=readRow(+v);const secs=r&&r.reps?r.reps:dose(exOf(it)).timed;L.timed={i:L.i,row:+v,until:Date.now()+secs*1000,secs};L.lastBeepT=null;L.rest=null;saveLive();renderPlayer(true);sfx('work');V.timedGo();break;}
    case 'tstop':{if(!L.timed)break;const held=Math.max(1,Math.round(L.timed.secs-(L.timed.until-Date.now())/1000)),k=L.timed.row;L.timed=null;completeRow(k,held);break;}
    case 'warmsets':addWarmSets();break;
    case 'addset':{const it=L.items[L.i],last=it.sets[it.sets.length-1];it.sets.push({kg:last.kg,reps:last.reps,done:false});saveLive();renderPlayer(true);break;}
    case 'prev':if(L.i>0){L.i--;saveLive();renderPlayer();}break;
    case 'next':if(L.i<L.items.length-1){L.i++;saveLive();renderPlayer();}break;
    case 'jumpsheet':{const it=L.items[L.i];if(it.sets.every(s=>s.done)){const n=nextOpen(L.i+1);if(n>=0){L.i=n;saveLive();renderPlayer();break;}}jumpSheet();break;}
    case 'goto':closeSheet();L.i=+v;saveLive();renderPlayer();break;
    case 'swapsheet':swapSheet();break;
    case 'swap':closeSheet(true);doSwap(v);syncGuard();break;
    case 'feel':{const r=S.summary&&S.summary.rec;if(!r)break;r.feel=r.feel===v?undefined:v;if(!r.feel)delete r.feel;updSession(r);document.querySelectorAll('.feel button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.v===r.feel));break;}
    case 'sharesum':shareRec(S.summary&&S.summary.rec);break;
    case 'sharesess':shareRec(S.history.find(h=>h.id===v));break;
    case 'export':exportData();break;
    case 'bodyadd':bodySheet();break;
    case 'bodylist':bodyListSheet();break;
    case 'bodydel':{const old=S.body.find(b=>b.id===v);delBody(v);if(S.body.length)bodyListSheet();else closeSheet();render();if(old)undoable('Registro borrado',()=>{addBody(old);render();});break;}
    case 'bodysave':{const b={id:'mcb-'+Date.now(),ts:Date.now()};let n=0,bad=false;
      BODYF.forEach(([k])=>{const i=$('#bf-'+k);const t=i?String(i.value).trim().replace(',','.'):'';if(!t)return;const x=parseFloat(t);
        if(isNaN(x)||x<=0||x>400){i.classList.add('bad');bad=true;return;}b[k]=Math.round(x*10)/10;n++;});
      if(bad){toast('Revisa los números');break;}if(!n){toast('Escribe al menos un dato');break;}
      addBody(b);closeSheet();render();toast('Registro guardado');break;}
    case 'upddis':if(UPD){UPD.dis=UPD.b;LS.set('mc-upd',UPD);}render();break;
    case 'updgo':break;
    default:V4ACT(a,v,b,L);
  }
});

applyTheme();
render();
if(!S.settings.onb&&!S.history.length)showOnb();
initDb();
if(LN&&S.settings.remind)scheduleReminders();
loadPack();setTimeout(ttsInit,1200);
initNative();
setTimeout(checkUpdate,2500);
