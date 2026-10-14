/* Resumen final, cambiar ejercicio y lista de ejercicios */
function viewSummary(){
  const {rec:r,prev}=S.summary,d={t:titleOf(r)},st=streak(),mins=Math.max(1,Math.round(r.dur/60));
  const bset=(n,arr)=>{let b=null;arr.forEach(s=>{if(better(n,s,b))b=s;});return b||arr[0];};
  const delta=z=>{for(const h of prev){const x=(h.ex||[]).find(y=>y.n===z.n);if(x&&x.s.length){const a=bset(z.n,z.s),b=bset(z.n,x.s);
    const em=(v,u)=>`<em class="${v>0?'up':'down'}">${v>0?'+':''}${NF.format(v)} ${u}</em>`;
    if(weighted(z.n)&&a[0]!==b[0])return em(Math.round((a[0]-b[0])*10)/10,'kg');
    if(a[1]!==b[1])return em(a[1]-b[1],z.t?'s':Math.abs(a[1]-b[1])===1?'rep':'reps');
    return '<em style="color:var(--tx3)">igual</em>';}}return '<em style="color:var(--tx3)">primera vez</em>';};
  const {lv0,lv1}=S.summary,up=lv1.lv>lv0.lv,rk=lv1.ri>lv0.ri,gain=xpOf(r);
  const lvl=up?`<div class="card lvup${rk?' rk':''}">${emblem(lv1.ri,64)}<div><div class="over">${rk?'Nuevo rango':'Subiste de nivel'}</div><b>${rk?lv1.rank:'Nivel '+lv1.lv}</b><span>${rk?'Nivel '+lv1.lv+' alcanzado':'Sigues como '+lv1.rank}</span></div></div>`:'';
  const xpb=`<div class="card xpsum"><div class="top2"><b>+${gain} XP</b><span>Nivel ${lv1.lv} · ${lv1.rank}</span></div><span class="xpbar"><i style="width:${Math.round(lv1.cur/lv1.need*100)}%"></i></span><small>${NF.format(lv1.need-lv1.cur)} XP para el nivel ${lv1.lv+1}</small></div>`;
  const feel=`<h2 class="h2">¿Cómo se sintió?</h2><div class="seg feel" role="group" aria-label="Cómo se sintió">${Object.keys(FEEL).map(k=>`<button data-act="feel" data-v="${k}" aria-pressed="${r.feel===k}">${FEEL[k]}</button>`).join('')}</div><p class="sub" style="font-size:.8rem;margin:6px 2px 0">Lo usamos para sugerirte el peso la próxima vez.</p>`;
  return `<div class="ok">${IC.check}</div><div class="over">${cap1(new Date(r.ts).toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'}))}</div><h1 class="h1">${d.t} completado${S.settings.name?', '+esc(S.settings.name):''}</h1><p class="sub" style="margin:4px 0 0">${st>1?`Racha de ${st} días seguidos`:'Empezaste una racha nueva'}</p>
  ${lvl}${(S.summary.newAch||[]).map(a=>`<div class="card unl"><span class="ic">${a.ic}</span><div><div class="over">Logro desbloqueado</div><b>${a.t}</b></div></div>`).join('')}${(S.summary.newMis||[]).map(m=>`<div class="card unl mis"><span class="ic">${IC.check}</span><div><div class="over">Misión cumplida</div><b>${m.t}</b></div><em>+${m.xp} XP</em></div>`).join('')}<div class="stats"><div class="card"><b>${mins}</b><span>${mins===1?'minuto':'minutos'}</span></div><div class="card"><b>${r.sets}</b><span>${r.sets===1?'serie':'series'}</span></div><div class="card"><b>${NF.format(r.vol)}</b><span>kg movidos</span></div></div>${xpb}
  ${r.pr.length?`<div class="card prbox"><h3>${IC.trophy}${r.pr.length===1?'Nuevo récord personal':r.pr.length+' récords personales'}</h3>${r.pr.map(n=>`<div>${n}: <b>${fmtSet(n,bestOf(n,[r]))}</b></div>`).join('')}</div>`:''}
  <h2 class="h2">Ejercicios <small>mejor serie frente a la vez anterior</small></h2>
  <ul class="glist sumex">${r.ex.map(z=>`<li><div class="top2"><b>${z.n}</b>${delta(z)}</div><div class="sx">${fmtSets(z)}</div></li>`).join('')}</ul>${feel}`;
}
function swapSheet(){
  const L=S.live,it=L.items[L.i],g=exGroup(it.n)[0],orig=it.orig||it.n;
  const used=new Set(L.items.map(x=>x.n));
  const alts=ALLEX.filter(e=>e.n!==it.n&&!used.has(e.n)&&exGroup(e.n)[0]===g).concat(it.orig&&it.orig!==it.n?[EXMAP[it.orig]]:[]).filter((e,i,a)=>a.indexOf(e)===i);
  const m0=info(it.n).m[0];alts.sort((x,y)=>(info(y.n).m[0]===m0)-(info(x.n).m[0]===m0));
  sheet(`<h3>Cambiar ${esc(it.n)}</h3><p class="sub">Opciones que trabajan ${g?g.toLowerCase():'lo mismo'}. Útil si te molesta algo o no tienes el espacio.</p>
  ${alts.length?`<ul class="glist jump" style="margin-top:10px">${alts.map(e=>`<li><button class="row" data-act="swap" data-v="${esc(e.n)}">${thumb(e)}<span class="nm">${e.n}${e.n===it.orig?' <small style="color:var(--tx2)">(original)</small>':''}<small style="display:block;color:var(--tx2);font-weight:500">${info(e.n).m.slice(0,2).join(', ')}</small></span></button></li>`).join('')}</ul>`:'<div class="card empty"><b>No hay alternativas</b>Todos los ejercicios de este grupo ya están en el entrenamiento.</div>'}
  <div class="acts"><button class="btn" data-act="close">Cancelar</button></div>`);
}
function doSwap(n){
  const L=S.live,it=L.items[L.i],e=EXMAP[n];if(!e||it.sets.some(s=>s.done))return;
  const dz=S.program.gen?doseFor(n,S.program.gen):null;
  const r=rowsFor(dz?rex(dz):e,it.sets.length);const b=bestOf(n,S.history);if(b)L.best0[n]=b;
  L.items[L.i]={n,r:dz?dz.sets+' × '+dz.reps:e.r,rest:dz?dz.rest:e.rest,sets:r.rows,up:r.up,prev:lastFor(n)||[],core:it.core,orig:it.orig||it.n};
  saveLive();renderPlayer();toast('Cambiado por '+esc(n));
}
function jumpSheet(){
  const L=S.live;
  sheet(`<h3>Ejercicios</h3><ul class="glist jump">${L.items.map((it,k)=>{const dn=it.sets.filter(s=>s.done).length;return `<li class="${k===L.i?'cur':''}"><button class="row" data-act="goto" data-v="${k}">${thumb(EXMAP[it.n])}<span class="nm">${it.n}</span><span class="st ${dn===it.sets.length?'ok':''}">${dn}/${it.sets.length}</span></button></li>`;}).join('')}</ul><div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);
}

