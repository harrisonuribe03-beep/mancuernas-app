/* Reproductor de entrenamiento */
/* ---------- entrenamiento ---------- */
function rowsFor(e,count){
  const ds=dose(e),last=lastFor(e.n)||[],bw=isBW(e);
  const allTop=last.length>0&&ds.top&&!ds.fail&&last.every(s=>s[1]>=ds.top);
  const rows=Array.from({length:count},(_,k)=>{const ref=last[Math.min(k,last.length-1)];
    let reps=ds.timed?(ref?ref[1]:ds.timed):(ref?(allTop?ds.target:Math.min(ds.top||99,ref[1]+(ds.fail?0:1))):ds.target);
    return {kg:bw||ds.timed?0:(ref?ref[0]:S.settings.kg),reps,done:false};});
  return {rows,up:allTop&&!bw&&!ds.timed};
}
function startSession(dayId){
  ensureAudio();askNotif();
  const d=dayId?dayById(dayId):selDay();if(!d)return;
  const p=plan(d.id,S.settings.mode),best0={};
  p.forEach(x=>{const b=bestOf(x.e.n,S.history);if(b)best0[x.e.n]=b;});
  S.live={day:d.id,t:d.t,w:d.w,mode:S.settings.mode,t0:Date.now(),i:0,phase:S.settings.warm?'warm':'work',warmUntil:0,rest:null,timed:null,best0,prs:[],
    items:p.map((x,k)=>{const r=rowsFor(x.e,x.sets);return {n:x.e.n,r:x.e.r,rest:x.e.rest,ss:!!(x.e.ss&&p[k+1]),sets:r.rows,up:r.up,prev:lastFor(x.e.n)||[],core:!!x.core};})};
  saveLive();openPlayer();
}
function openPlayer(){ensureAudio();$('#player').hidden=false;wake(true);renderPlayer();startTick();syncGuard();}
function closePlayer(fromPop){$('#player').hidden=true;$('#player').innerHTML='';wake(false);stopTick();notifCancel();liveNotif(false);render();if(!fromPop)syncGuard();}
const curRow=it=>it.sets.findIndex(s=>!s.done);
function renderPlayer(keep){
  const L=S.live,el=$('#player');
  const sc=keep&&el.querySelector('.pbody')?el.querySelector('.pbody').scrollTop:0;
  if(L.phase==='summary'){el.innerHTML=`<div class="pbody"><div class="col sum fade">${viewSummary()}</div></div><div class="sumbar"><div class="col" style="display:flex;gap:8px">${canShareImg()?`<button class="btn" data-act="sharesum" aria-label="Compartir imagen">${IC.share}<span class="bl">Compartir</span></button>`:''}<button class="btn" data-act="stretchnow" data-v="${kindOf(S.summary.rec)}" aria-label="Estirar 5 minutos">${IC.clock}<span class="bl">Estirar</span></button><button class="btn pri" style="flex:1" data-act="sumok">Listo</button></div></div>`;return;}
  const d={t:L.t||titleOf(L)};
  let h=`<div class="pbar"><button class="iconbtn" data-act="askquit" aria-label="Salir o pausar">${IC.min}</button><div class="t"><b id="el">${mmss((Date.now()-L.t0)/1000)}</b><span>${d.t}${L.mode==='express'?' · exprés':''}</span></div><button class="tbtn" data-act="askfinish">Terminar</button></div><div class="pbody"><div class="col">`;
  if(L.phase==='warm'){
    const run=L.warmUntil>0,rem=run?(L.warmUntil-Date.now())/1000:WARM;
    const stp=run?Math.min(4,Math.floor((WARM-rem)/60)):-1;
    h+=`<div class="fade"><div class="over" style="text-align:center;margin-top:8px">Antes de empezar</div><h1 class="h1" style="text-align:center">Calentamiento</h1>${(()=>{const W=WARMUPS[kindOf(L)],k=warmImg(L,W[Math.max(0,stp)]);return `<div class="wart"><img id="wimg" src="${IMG(k)}" alt=""><span class="wtime"><b id="cd">${mmss(Math.ceil(rem))}</b><span class="sqbarmini"><i id="rgf" style="transform:scaleX(${(1-Math.max(0,rem)/WARM).toFixed(3)})"></i></span></span></div>`;})()}
    <ul class="card wl" id="wl">${WARMUPS[kindOf(L)].map((t,i)=>`<li class="${i===stp?'on':''}"><span class="n">${i+1}</span><span>${t[0]}<div class="sub" style="font-size:.8rem">${t[1]}</div></span></li>`).join('')}</ul>
    <div style="display:flex;flex-direction:column;gap:4px;margin-top:16px;padding-bottom:20px"><button class="btn pri" data-act="${run?'warmskip':'warmgo'}">${run?'Listo, al primer ejercicio':IC.play+'Empezar calentamiento'}</button>${run?'':'<button class="tbtn" style="color:var(--tx2)" data-act="warmskip">Saltar calentamiento</button>'}</div></div></div></div>`;
    el.innerHTML=h;return;
  }
  const it=L.items[L.i],e=exOf(it),ds=dose(e),bw=isBW(e),inf=info(it.n),cr=curRow(it),b=bestNow(it.n);
  h+=`<div class="pprog">${L.items.map((x,k)=>`<i class="${x.sets.every(s=>s.done)?'done':k===L.i?'cur':''}"></i>`).join('')}</div>
  <div class="exhead"><div class="figwrap" data-act="info" data-v="${esc(it.n)}">${artAnim(e)}</div><div style="min-width:0"><div class="over">${L.i+1} de ${L.items.length}${ssPartner(L.i)>=0?` · <span class="sstag">Superserie ${ssPartner(L.i)>L.i?'A':'B'}</span>`:''}</div><h2>${e.n}</h2><div class="meta"><b>${it.sets.length} × ${ds.label}</b> · ${restOf(e)} s de descanso</div><div class="hbtns"><button class="how" data-act="info" data-v="${esc(it.n)}">${IC.info}Cómo hacerlo</button><button class="how" data-act="note" data-v="${esc(it.n)}">${IC.pen}Nota</button>${it.sets.some(s=>s.done)?'':`<button class="how" data-act="swapsheet">${IC.swap}Cambiar</button>`}</div></div></div>`;
  {const pi=ssPartner(L.i);if(pi>=0)h+=`<div class="tip soft">${IC.swap}<div>Superserie con <b>${esc(L.items[pi].n)}</b>: alterna una serie de cada uno y descansa después del par.</div></div>`;}
  {const nt=(S.settings.notes||{})[it.n];if(nt)h+=`<button class="pnote" data-act="note" data-v="${esc(it.n)}">${IC.pen}<span>${esc(nt)}</span></button>`;}
  if(it.up&&!it.sets.some(s=>s.done))h+=`<div class="tip">${IC.up}<div>La vez pasada llegaste al tope del rango en todas las series. <b>Sube el peso</b> y vuelve a ${ds.target} repeticiones.</div></div>`;
  else if(!it.sets.some(s=>s.done)&&it.prev.length){const fl=lastFeelFor(it.n);
    if(fl==='facil'&&!bw&&!ds.timed)h+=`<div class="tip">${IC.up}<div>La última vez el entreno se sintió <b>fácil</b>. Si la técnica estuvo bien, prueba con un poco más de peso hoy.</div></div>`;
    else if(fl==='duro')h+=`<div class="tip soft">${IC.info}<div>La última vez se sintió <b>duro</b>. Mantén el peso y busca completar el rango con buena técnica.</div></div>`;}
  h+=`<div class="card sets ${bw||ds.timed?'bw':''}"><div class="hdr"><span>#</span><span>Anterior</span>${bw||ds.timed?'':'<span>Kg c/u</span>'}<span>${ds.timed?'Seg':ds.side?'Reps/'+ds.side:'Reps'}</span><span></span></div>`;
  it.sets.forEach((s,k)=>{
    const st=s.done?'done':k===cr?'cur':'',pv=s.ty==='c'?'Aprox.':it.prev[k]?fmtShort(it.n,it.prev[k]):ds.label.replace(/ por .*/,'');
    const tr=L.timed&&L.timed.row===k&&L.i===L.timed.i;
    h+=`<div class="sr ${st} ${s.ty?'ty-'+s.ty:''}"><button class="no" data-act="sty" data-v="${k}" aria-label="Tipo de serie ${k+1}: ${s.ty?STY[s.ty][1]:'normal'}">${s.ty?STY[s.ty][0]:s.done?IC.check:k+1}</button><span class="pv">${pv}</span>`;
    if(!bw&&!ds.timed)h+=`<input inputmode="decimal" enterkeyhint="next" aria-label="Kilos serie ${k+1}" data-k="kg" data-r="${k}" value="${s.kg}">`;
    if(tr)h+=`<span class="tm" id="tcd">${mmss(Math.ceil((L.timed.until-Date.now())/1000))}</span>`;
    else h+=`<input inputmode="numeric" enterkeyhint="done" aria-label="${ds.timed?'Segundos':'Repeticiones'} serie ${k+1}" data-k="reps" data-r="${k}" value="${s.reps}">`;
    if(ds.timed&&!s.done)h+=`<button class="ck" data-act="${tr?'tstop':'tgo'}" data-v="${k}" data-i="${L.i}" aria-label="${tr?'Terminar':'Iniciar'} serie ${k+1}">${tr?IC.check:IC.play}</button>`;
    else h+=`<button class="ck" data-act="tick" data-v="${k}" data-i="${L.i}" aria-label="${s.done?'Desmarcar':'Marcar'} serie ${k+1}">${IC.check}</button>`;
    h+='</div>';
  });
  const canWarm=!bw&&!ds.timed&&!it.sets.some(x=>x.done||x.ty==='c')&&(+it.sets[0].kg||0)>=2;
  h+=`<div class="setacts"><button class="addset" data-act="addset">${IC.plus}Añadir serie</button>${canWarm?`<button class="addset" data-act="warmsets">${IC.flame.replace('<svg','<svg class="i"')}Series de aproximación</button>`:''}</div></div><div class="stynote">Toca el número: C calentamiento · D drop set · F al fallo</div>`;
  if(b)h+=`<div class="record">${IC.trophy}Tu récord: <b>${fmtSet(it.n,b)}</b></div>`;
  h+=`</div></div><div id="pbottom"></div>`;
  el.innerHTML=h;
  renderBottom();
  if(keep)el.querySelector('.pbody').scrollTop=sc;
  animStart();
}
function renderBottom(){
  const L=S.live,el=$('#pbottom');if(!el||!L)return;
  if(L.rest){
    const rem=Math.max(0,(L.rest.until-Date.now())/1000),it=L.items[L.i],cr=curRow(it);
    el.className='resting';
    el.innerHTML=`<div class="rbar"><i id="rpb" style="transform:scaleX(${Math.min(1,rem/L.rest.total).toFixed(3)})"></i></div><div class="col rest"><div class="tt"><span>Descanso</span><b id="rcd">${mmss(Math.ceil(rem))}</b>${cr>=0?`<small>Serie ${cr+1} · ${esc(nextLabel(it,cr))}</small>`:''}</div><button class="ob" data-act="radd" data-v="-15" aria-label="Quitar 15 segundos">−15</button><button class="ob" data-act="radd" data-v="15" aria-label="Sumar 15 segundos">+15</button><button class="skip" data-act="rskip">Saltar</button></div>`;
    return;
  }
  const it=L.items[L.i],allDone=it.sets.every(s=>s.done),nx=nextOpen(L.i+1);
  el.className='';
  el.innerHTML=`<div class="col nav"><button class="iconbtn" data-act="prev" ${L.i===0?'disabled':''} aria-label="Ejercicio anterior">${IC.left}</button><button class="btn ${allDone?'pri':''}" data-act="${allDone&&nx<0&&nextOpen(0)<0?'askfinish':'jumpsheet'}"><span>${allDone&&nextOpen(0)<0?'Terminar entrenamiento':allDone&&nx>=0?'Siguiente: '+esc(L.items[nx].n):'Ejercicio '+(L.i+1)+' de '+L.items.length}</span></button><button class="iconbtn" data-act="next" ${L.i===L.items.length-1?'disabled':''} aria-label="Ejercicio siguiente">${IC.right}</button></div>`;
}
function nextLabel(it,k){const s=it.sets[k],e=exOf(it),ds=dose(e);if(it.sets.slice(0,k).every(x=>x.done)&&k===0)return it.n;return ds.timed?s.reps+' s':isBW(e)?s.reps+' reps':NF.format(s.kg)+' kg × '+s.reps;}
function ring(rem,total,label){const C=2*Math.PI*88,off=C*(1-(total?Math.max(0,rem)/total:0));
  return `<div class="ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill="none" stroke-width="12" class="bg"/><circle id="rg" cx="100" cy="100" r="88" fill="none" stroke-width="12" stroke-linecap="round" class="fg" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/></svg><div class="t"><b id="cd">${mmss(Math.ceil(rem))}</b><span>${label}</span></div></div>`;}
function nextOpen(from){const L=S.live;for(let j=from;j<L.items.length;j++)if(L.items[j].sets.some(s=>!s.done))return j;return -1;}
function bestNow(n){const L=S.live;let b=L.best0[n]||null;const it=L.items.find(x=>x.n===n);if(it)it.sets.forEach(s=>{if(s.done&&s.ty!=='c'&&better(n,[+s.kg,+s.reps],b))b=[+s.kg,+s.reps];});return b;}
function recomputePRs(){const L=S.live;L.prs=L.items.filter(it=>{const b0=L.best0[it.n];return b0&&it.sets.some(s=>s.done&&s.ty!=='c'&&better(it.n,[+s.kg,+s.reps],b0));}).map(it=>it.n);}
function startRest(e){const L=S.live,r=restOf(e);L.rest={until:Date.now()+r*1000,total:r};L.lastBeep=null;L.said10=false;V.restStart(e,r);if(document.visibilityState==='hidden')notifSchedule();}
function readRow(k){
  const kgI=document.querySelector(`#player input[data-k="kg"][data-r="${k}"]`),rpI=document.querySelector(`#player input[data-k="reps"][data-r="${k}"]`);
  const num=i=>{if(!i)return null;const v=parseFloat(String(i.value).replace(',','.'));return isNaN(v)?NaN:v;};
  const kg=num(kgI),rp=num(rpI);let ok=true;
  if(kgI&&(isNaN(kg)||kg<0||kg>200)){kgI.classList.add('bad');ok=false;}
  if(rpI&&(isNaN(rp)||rp<1||rp>500)){rpI.classList.add('bad');ok=false;}
  return ok?{kg:kgI?Math.round(kg*10)/10:0,reps:rpI?Math.round(rp):null}:null;
}
function completeRow(k,val){
  const L=S.live,it=L.items[L.i],s=it.sets[k],e=exOf(it);
  if(val!=null)s.reps=val;
  const before=bestNow(it.n);
  s.done=true;buzz(35);sfx('set');
  const set=[+s.kg||0,+s.reps||0,s.ty||''];
  if(L.best0[it.n]&&better(it.n,set,before)){if(!L.prs.includes(it.n))L.prs.push(it.n);toast(IC.trophy+'<span>Récord · '+fmtSet(it.n,set)+'</span>',true);setTimeout(()=>sfx('pr'),150);V.pr(it.n);}else V.setDone();
  if(nextOpen(0)<0){L.rest=null;saveLive();renderPlayer(true);setTimeout(()=>{if(S.live&&S.live.phase!=='summary')finish();},450);return;}
  const pi=ssPartner(L.i),pOpen=pi>=0&&L.items[pi].sets.some(x=>!x.done);
  if(pi>L.i&&pOpen&&s.ty!=='c'){L.rest=null;L.i=pi;saveLive();renderPlayer();toast(IC.swap+'<span>Superserie: '+esc(L.items[pi].n)+'</span>');V.ss(L.items[pi]);return;}
  startRest(e);
  if(pi>=0&&pi<L.i&&pOpen){L.i=pi;saveLive();renderPlayer();return;}
  if(it.sets.every(s=>s.done)){const n=nextOpen(L.i+1),m=n<0?nextOpen(0):n;if(m>=0){L.i=m;saveLive();renderPlayer();toast('Siguiente: '+esc(L.items[m].n));V.nextEx(L.items[m]);return;}}
  saveLive();renderPlayer(true);
}
function finish(){
  const L=S.live;
  const ex=L.items.map(it=>({n:it.n,s:it.sets.filter(s=>s.done).map(s=>s.ty?[+s.kg||0,+s.reps||0,s.ty]:[+s.kg||0,+s.reps||0])})).filter(z=>z.s.length).map(z=>{const e=EXMAP[z.n];return Object.assign(z,{bw:isBW(e),t:!!dose(e).timed});});
  notifCancel();
  if(!ex.length){S.live=null;saveLive();closePlayer();toast('No se guardó: no marcaste ninguna serie');return;}
  recomputePRs();
  const sets=ex.reduce((a,x)=>a+x.s.length,0),vol=ex.reduce((a,x)=>a+(x.bw||x.t?0:x.s.reduce((b,s)=>b+(s[2]==='c'?0:s[0]*s[1]),0)),0);
  const prevHist=S.history.slice(),ws0=weekStart(Date.now());
  const a0=new Set(achv().filter(a=>a.on).map(a=>a.t)),m0=new Set(missionsFor(ws0,prevHist).filter(m=>m.ok).map(m=>m.k));
  const rec={id:'mc-'+Date.now(),ts:L.t0,day:L.day,t:L.t||titleOf(L),w:L.w||(dayById(L.day)||{}).w,mode:L.mode,dur:Math.round((Date.now()-L.t0)/1000),sets,vol:Math.round(vol),ex,pr:L.prs.slice()};
  addSession(rec);
  S.summary={rec,prev:prevHist,lv0:myLevel(prevHist),lv1:myLevel(),newAch:achv().filter(a=>a.on&&!a0.has(a.t)),newMis:missionsFor(ws0,S.history).filter(m=>m.ok&&!m0.has(m.k))};L.phase='summary';L.rest=null;L.timed=null;LS.del('mc-live3');
  {const lv0=S.summary.lv0,lv1=S.summary.lv1;sfx(lv1.lv>lv0.lv?'lvl':'done');setTimeout(()=>V.finish(rec,lv0,lv1),lv1.lv>lv0.lv?1600:900);}buzz(250);wake(false);
  renderPlayer();
  {const X=S.summary;setTimeout(()=>confetti(X.lv1.ri>X.lv0.ri||X.newAch.length?'gold':X.lv1.lv>X.lv0.lv||rec.pr.length||X.newMis.length?'big':'small'),350);}
  if(typeof afterFinish==='function')afterFinish(rec);
}
function exVol(z){return z.bw||z.t?z.s.reduce((a,s)=>a+s[1],0):z.s.reduce((a,s)=>a+s[0]*s[1],0);}

/* superseries: un ejercicio marcado con ss se alterna con el siguiente */
function ssPartner(i){const L=S.live;if(!L)return -1;const it=L.items[i];if(!it)return -1;
  if(it.ss&&L.items[i+1])return i+1;if(i>0&&L.items[i-1].ss)return i-1;return -1;}
/* series de aproximación: 50 % × 10 y 75 % × 5 del peso de trabajo */
function addWarmSets(){const L=S.live,it=L.items[L.i],kg=+it.sets[0].kg||0,r=v=>Math.max(1,Math.round(v*2)/2);
  const ws=[{kg:r(kg*.5),reps:10,done:false,ty:'c'}];if(kg>=6)ws.push({kg:r(kg*.75),reps:5,done:false,ty:'c'});
  it.sets=ws.concat(it.sets);it.prev=[].concat(ws.map(()=>null),it.prev).slice(0,it.sets.length);saveLive();renderPlayer(true);
  toast('<span>Aproximación lista: no cuenta para récords</span>');}
