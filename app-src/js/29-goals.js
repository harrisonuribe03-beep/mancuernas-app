
/* ===================== v4 · actividades, misiones, logros, tipos de serie, notas y color ===================== */
S.acts=LS.get('mc-acts',[]);
function addAct(a){const r=Object.assign({id:'mca-'+Date.now(),ts:Date.now()},a);S.acts.push(r);LS.set('mc-acts',S.acts);if(COL)COL.doc(r.id).set(stripId(r)).catch(()=>{});}
async function mergeActs(remote){const ids=new Set(remote.map(x=>x.id)),lo=S.acts.filter(x=>!ids.has(x.id));for(const x of lo){try{await COL.doc(x.id).set(stripId(x));}catch(e){}}S.acts=remote.concat(lo).sort((a,b)=>a.ts-b.ts);LS.set('mc-acts',S.acts);}

/* ---------- misiones semanales ---------- */
const MPOOL=['pr','vol','stretch','hiit','body','sets','feel','full'];
function missionsFor(ws,hist){
  const we=ws+7*864e5,wk=Math.round(ws/(7*864e5)),H=hist.filter(h=>h.ts>=ws&&h.ts<we),A=S.acts.filter(a=>a.ts>=ws&&a.ts<we),td=trainDays();
  const prev=[1,2,3,4].map(k=>hist.filter(h=>h.ts>=ws-k*7*864e5&&h.ts<ws-(k-1)*7*864e5).reduce((a,h)=>a+(h.vol||0),0)).filter(v=>v>0);
  const volT=Math.max(500,Math.round((prev.length?prev.reduce((a,b)=>a+b,0)/prev.length*1.05:1500)/100)*100);
  const D={
    train:{t:`Completa ${td} entrenamientos`,goal:td,cur:H.length,xp:150,ic:IC.dumb},
    pr:{t:'Logra un récord personal',goal:1,cur:H.reduce((a,h)=>a+(h.pr||[]).length,0),xp:100,ic:IC.trophy},
    vol:{t:`Mueve ${NF.format(volT)} kg en la semana`,goal:volT,cur:H.reduce((a,h)=>a+(h.vol||0),0),xp:100,ic:IC.layers,fmt:x=>NF.format(Math.round(x))},
    stretch:{t:'Haz 2 sesiones de estiramiento o movilidad',goal:2,cur:A.filter(a=>a.kind==='stretch'||a.kind==='mob').length,xp:80,ic:IC.clock},
    hiit:{t:'Completa intervalos o abdomen exprés',goal:1,cur:A.filter(a=>a.kind==='hiit'||a.kind==='abs').length,xp:80,ic:IC.bolt},
    body:{t:'Registra tu peso',goal:1,cur:S.body.filter(b=>b.ts>=ws&&b.ts<we&&b.w!=null).length,xp:50,ic:IC.body},
    sets:{t:`Completa ${td*14} series`,goal:td*14,cur:H.reduce((a,h)=>a+(h.sets||0),0),xp:100,ic:IC.check},
    feel:{t:'Califica cómo se sintieron 3 entrenos',goal:3,cur:H.filter(h=>h.feel).length,xp:50,ic:IC.star},
    full:{t:'Termina un entreno en versión completa',goal:1,cur:H.filter(h=>h.mode==='full').length,xp:60,ic:IC.flame.replace('<svg','<svg class="i"')}};
  const a=MPOOL[((wk%MPOOL.length)+MPOOL.length)%MPOOL.length],b=MPOOL[(((wk*3+2)%MPOOL.length)+MPOOL.length)%MPOOL.length];
  const keys=['train',a,b===a?MPOOL[(MPOOL.indexOf(a)+1)%MPOOL.length]:b];
  return keys.map(k=>Object.assign({k},D[k],{ok:D[k].cur>=D[k].goal}));
}
function extraXP(hist){
  if(!hist.length&&!S.acts.length)return 0;
  const first=Math.min(...hist.map(h=>h.ts),...S.acts.map(a=>a.ts),Date.now());let x=S.acts.length*20;
  for(let ws=weekStart(first);ws<=Date.now();ws+=7*864e5)missionsFor(ws,hist).forEach(m=>{if(m.ok)x+=m.xp;});
  return x;
}
function missionsCard(){
  const ws=weekStart(Date.now()),M=missionsFor(ws,S.history),left=Math.ceil((ws+7*864e5-Date.now())/864e5);
  return `<h2 class="h2">Misiones de la semana <small>${M.filter(m=>m.ok).length}/3 · quedan ${pl(left,'día','días')}</small></h2><div class="card missions">${M.map(m=>{const pc=Math.min(100,m.cur/m.goal*100),f=m.fmt||(x=>x);
    return `<div class="ms ${m.ok?'ok':''}"><span class="mic">${m.ok?IC.check:m.ic}</span><div><b>${m.t}</b><span class="xpbar"><i style="width:${pc}%"></i></span><small>${f(Math.min(m.cur,m.goal))} / ${f(m.goal)}</small></div><em>+${m.xp}</em></div>`;}).join('')}</div>`;
}
function homeExtras(){return missionsCard()+`<h2 class="h2">Recuperación muscular</h2>`+recoveryCard(false);}
function deloadTip(){
  if(S.settings.mode==='suave')return '';const td=trainDays(),ws=weekStart(Date.now());if(S.settings.deloadDis===ws)return '';
  let run=0;for(let k=1;k<=12;k++){const a=ws-k*7*864e5,n=S.history.filter(h=>h.ts>=a&&h.ts<a+7*864e5).length;if(n>=Math.max(2,td-1))run++;else break;}
  const hard=S.history.slice(0,2).length===2&&S.history.slice(0,2).every(h=>h.feel==='duro');
  if(run<6&&!hard)return '';
  return `<div class="card tipcard">${IC.moon}<div><b>${hard?'Tus últimos entrenos se sintieron duros':'Llevas '+run+' semanas seguidas entrenando'}</b><span>Una semana suave ayuda a recuperarte y volver más fuerte.</span><div style="display:flex;gap:8px;margin-top:8px"><button class="btn sm pri" data-act="mode" data-v="suave">Activar modo suave</button><button class="btn sm ghost" data-act="deldis">No ahora</button></div></div></div>`;
}

/* ---------- logros ---------- */
function achv(){
  const H=S.history,n=H.length,vol=H.reduce((a,h)=>a+(h.vol||0),0),st=streak(),td=trainDays();
  const weeks={};H.forEach(h=>{const k=weekStart(h.ts);weeks[k]=(weeks[k]||0)+1;});
  const best=Math.max(0,...Object.values(weeks)),prs=H.reduce((a,h)=>a+((h.pr||[]).length),0);
  let wrun=0,wbest=0;const ks=Object.keys(weeks).map(Number).sort((a,b)=>a-b);let prevk=null;ks.forEach(k=>{if(weeks[k]>=td){wrun=prevk!==null&&k-prevk<8*864e5&&wrun?wrun+1:1;wbest=Math.max(wbest,wrun);prevk=k;}else{wrun=0;prevk=k;}});
  const early=H.some(h=>new Date(h.ts).getHours()<7),late=H.some(h=>new Date(h.ts).getHours()>=21);
  const str=S.acts.filter(a=>a.kind==='stretch'||a.kind==='mob').length,hi=S.acts.filter(a=>a.kind==='hiit'||a.kind==='abs').length;
  const L=myLevel(),bw=S.body.filter(b=>b.w!=null).length,feel=H.filter(h=>h.feel).length;
  const T=(ic,t,cur,goal,fmt)=>({ic,t,on:cur>=goal,p:(fmt||(x=>x))(Math.min(cur,goal))+'/'+(fmt||(x=>x))(goal)});
  const fl=IC.flame.replace('<svg','<svg class="i"'),k=x=>x>=1000?NF.format(x/1000)+'k':NF.format(x);
  return [T(IC.star,'Primer entreno',n,1),T(IC.bolt,'10 entrenos',n,10),T(IC.bolt,'30 entrenos',n,30),T(IC.bolt,'100 entrenos',n,100),
    T(fl,'Racha de 5',st,5),T(fl,'Racha de 15',st,15),T(IC.cal,'Semana completa',best,td),T(IC.cal,'Un mes sin fallar',wbest,4),
    T(IC.trophy,'5 récords',prs,5),T(IC.trophy,'25 récords',prs,25),T(IC.dumb,'1.000 kg',vol,1000,k),T(IC.dumb,'10.000 kg',vol,10000,k),
    T(IC.dumb,'50.000 kg',vol,50000,k),T(IC.dumb,'100.000 kg',vol,100000,k),{ic:IC.up,t:'Madrugador',on:early,p:'Antes de 7 a. m.'},{ic:IC.moon,t:'Búho',on:late,p:'Después de 9 p. m.'},
    T(IC.clock,'10 estiramientos',str,10),T(IC.bolt,'5 sesiones HIIT',hi,5),T(IC.body,'4 pesajes',bw,4),T(IC.star,'Nivel 10',L.lv,10),T(IC.star,'Rango Maestro',L.lv,15),T(IC.check,'10 opiniones',feel,10)];
}

/* ---------- tipos de serie ---------- */
const STY={'':['',''],c:['C','Calentamiento'],d:['D','Drop set'],f:['F','Al fallo']},STYO=['','c','d','f'];
const realSets=arr=>arr.filter(s=>s[2]!=='c');

/* ---------- notas ---------- */
function noteSheet(n){const t=(S.settings.notes||{})[n]||'';
  sheet(`<h3>Nota · ${esc(n)}</h3><p class="sub">Algo que quieras recordar la próxima vez: ajuste, agarre, molestias.</p><textarea id="note-t" maxlength="240" rows="4" class="notearea" placeholder="Ej.: usar la silla del comedor, codos más cerrados">${esc(t)}</textarea>
  <div class="acts"><button class="btn pri" data-act="notesave" data-v="${esc(n)}">Guardar</button>${t?`<button class="btn ghost danger" data-act="notedel" data-v="${esc(n)}">Borrar nota</button>`:''}<button class="btn" data-act="close">Cancelar</button></div>`);}

/* ---------- color ---------- */
const ACC={azul:['#3d5afe','#5b74ff'],rojo:['#e11d48','#fb4e6f'],verde:['#059669','#34d399'],morado:['#7c3aed','#a78bfa'],naranja:['#ea580c','#fb923c'],cian:['#0891b2','#22d3ee'],grafito:['#334155','#94a3b8']};
function hexMix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const x=p(a),y=p(b);return '#'+x.map((v,i)=>Math.round(v*(1-t)+y[i]*t).toString(16).padStart(2,'0')).join('');}
function applyAccent(dark){const c=ACC[S.settings.accent]||ACC.azul,r=document.documentElement.style,acc=dark?c[1]:c[0];
  r.setProperty('--acc',acc);r.setProperty('--acc-soft',dark?hexMix(acc,'#16191f',.8):hexMix(acc,'#ffffff',.88));r.setProperty('--acc-tx',S.settings.accent==='grafito'&&dark?'#0d0f13':'#ffffff');}
function accentPicker(){return `<div class="accs">${Object.keys(ACC).map(k=>`<button data-act="accent" data-v="${k}" aria-pressed="${(S.settings.accent||'azul')===k}" aria-label="Color ${k}" style="--c:${ACC[k][0]}"></button>`).join('')}</div>`;}

function metaAct(a,v){
  switch(a){
    case 'deldis':S.settings.deloadDis=weekStart(Date.now());saveSettings();render();return true;
    case 'sty':{const L=S.live,it=L.items[L.i],s=it.sets[+v];if(!s)return true;s.ty=STYO[(STYO.indexOf(s.ty||'')+1)%STYO.length];if(!s.ty)delete s.ty;
      if(s.done)recomputePRs();saveLive();renderPlayer(true);toast(s.ty?STY[s.ty][1]:'Serie normal');return true;}
    case 'note':noteSheet(v);return true;
    case 'notesave':{const t=($('#note-t').value||'').trim();S.settings.notes=S.settings.notes||{};if(t)S.settings.notes[v]=t;else delete S.settings.notes[v];saveSettings();closeSheet();if(S.live&&!$('#player').hidden)renderPlayer(true);else render();return true;}
    case 'notedel':if(S.settings.notes)delete S.settings.notes[v];saveSettings();closeSheet();if(S.live&&!$('#player').hidden)renderPlayer(true);else render();return true;
    case 'accent':S.settings.accent=v;saveSettings();applyTheme();render();return true;
    case 'stretchnow':{const k=v||'full';S.live=null;S.summary=null;saveLive();closePlayer();S.tab='hoy';seqStart({push:'stretch-push',upper:'stretch-push',pull:'stretch-pull',legs:'stretch-legs'}[k]||'stretch-full');return true;}
  }
  return false;
}
