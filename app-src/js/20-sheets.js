/* Hojas inferiores */
/* ---------- hojas ---------- */
function sheet(html){const s=$('#sheet');s.innerHTML=`<div class="pan" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;s.hidden=false;syncGuard();animStart();}
function closeSheet(fromPop){$('#sheet').hidden=true;$('#sheet').innerHTML='';if(!fromPop)syncGuard();}
function infoSheet(name){exDetail(name,'tec');}
/* página completa de un ejercicio: técnica, progreso e historial */
function exDetail(name,tab){
  const e=EXMAP[name];if(!e)return;const inf=info(name),b=bestOf(name,S.history),w=weighted(name);
  const sess=S.history.filter(h=>(h.ex||[]).some(z=>z.n===name&&z.s.length));
  const T=[['tec','Técnica'],['prog','Progreso'],['hist','Historial']];tab=tab||'tec';
  let h=`<div class="exdh"><div class="figbox">${artAnim(e)}${phases(e)}</div><h3>${e.n}</h3><div class="mchips">${inf.m.map((m,i)=>`<span class="mchip ${i?'':'p'}">${m}</span>`).join('')}</div></div>
  <div class="subtabs sm" role="tablist">${T.map(([k,l])=>`<button role="tab" data-act="exdt" data-v="${k}|${esc(name)}" aria-selected="${tab===k}">${l}${k==='hist'&&sess.length?` <small>${sess.length}</small>`:''}</button>`).join('')}</div>`;
  if(tab==='tec'){
    const ds=S.program.days.filter(d=>d.ex.some(x=>x.n===name)),x0=ds.length?ds[0].ex.find(x=>x.n===name):null,nt=(S.settings.notes||{})[name];
    h+=`<div class="kv">${x0?`<span>Series <b>${x0.sets} × ${esc(x0.reps)}</b></span><span>Descanso <b>${S.settings.rest==='auto'?x0.rest:S.settings.rest} s</b></span>`:''}<span>${ds.length?'En <b>'+ds.map(d=>esc(d.t)).join(', ')+'</b>':'No está en tu plan'}</span></div>
    ${muscleMap(name)}
    <h2 class="h2" style="margin-top:14px">Cómo hacerlo</h2><ol class="steps">${inf.steps.map(s=>`<li><span>${s}</span></li>`).join('')}</ol>
    ${inf.err?`<div class="callout warn">${IC.warn}<div><b>Error común.</b> ${inf.err}</div></div>`:''}
    <button class="pnote" data-act="note" data-v="${esc(name)}">${IC.pen}<span>${nt?esc(nt):'Agregar una nota personal para este ejercicio'}</span></button>`;
  }else if(tab==='prog'){
    if(!sess.length)h+=`<div class="card empty" style="margin-top:12px"><b>Sin registros todavía</b>Cuando lo entrenes verás aquí tu récord, tu fuerza estimada y la evolución.</div>`;
    else{const vol=sess.reduce((a,x)=>a+x.ex.filter(z=>z.n===name).reduce((c,z)=>c+exVol(Object.assign({},z,{s:realSets(z.s)})),0),0);
      h+=`<div class="exstats"><div><span>Récord</span><b>${b?fmtSet(name,b):'—'}</b></div>${w&&b?`<div><span>1RM estimado</span><b>${NF.format(Math.round(e1rm(b)*2)/2)} kg</b></div>`:''}<div><span>Sesiones</span><b>${sess.length}</b></div><div><span>${w?'Volumen total':'Repeticiones'}</span><b>${NF.format(Math.round(vol))}${w?' kg':''}</b></div></div>
      <div class="card chart" style="margin-top:10px">${lineChart(name)}</div>
      ${w&&b?`<h2 class="h2">Pesos de referencia <small>según tu récord</small></h2><div class="rmtbl">${[3,5,8,10,12,15].map(r=>`<div><b>${r} reps</b><span>${NF.format(Math.round(e1rm(b)/(1+r/30)*2)/2)} kg</span></div>`).join('')}</div>`:''}`;}
  }else{
    h+=sess.length?`<ul class="glist sumex" style="margin-top:12px">${sess.slice(0,40).map(x=>{const z=x.ex.find(y=>y.n===name);return `<li><div class="top2"><b>${cap1(new Date(x.ts).toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'}))}</b><em style="color:var(--tx3)">${esc(titleOf(x))}</em></div><div class="sx">${z.s.map(s=>(s[2]==='c'?'<span class="tag">C</span> ':s[2]==='d'?'<span class="tag">D</span> ':'')+fmtSet(name,s)).join(' · ')}</div></li>`;}).join('')}</ul>`:`<div class="card empty" style="margin-top:12px"><b>Sin historial</b>Aún no has hecho este ejercicio.</div>`;
  }
  h+=`<div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`;
  sheet(h);$('#sheet .pan').classList.add('tall');
}
function sessSheet(id){
  const x=S.history.find(h=>h.id===id);if(!x)return;const d={t:titleOf(x)};
  sheet(`<div class="over">${cap1(new Date(x.ts).toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'}))}</div><h3>${d.t}${x.mode==='express'?' · exprés':''}</h3>
  <div class="kv"><span><b>${Math.max(1,Math.round(x.dur/60))}</b> min</span><span><b>${x.sets}</b> series</span><span><b>${NF.format(x.vol)}</b> kg</span><span><b>+${xpOf(x)}</b> XP</span>${x.feel?`<span>Se sintió <b>${FEEL[x.feel].toLowerCase()}</b></span>`:''}</div>
  <ul class="glist sumex" style="margin-top:12px">${(x.ex||[]).map(z=>`<li><b>${z.n}</b>${(x.pr||[]).includes(z.n)?'<span class="tag pr">RÉCORD</span>':''}<div class="sx">${fmtSets(z)}</div></li>`).join('')}</ul>
  <div class="acts">${canShareImg()?`<button class="btn" data-act="sharesess" data-v="${x.id}">${IC.share}Compartir imagen</button>`:''}<button class="btn" data-act="close">Cerrar</button><button class="btn ghost danger" data-act="askdel" data-v="${x.id}">Borrar sesión</button></div>`);
}
function askQuit(){
  const L=S.live,left=L?L.items.reduce((a,it)=>a+it.sets.filter(s=>!s.done).length,0):0;
  sheet(`<h3>¿Salir del entrenamiento?</h3><p class="sub">${left?`Te faltan ${pl(left,'serie','series')}. `:''}Puedes guardarlo como está o pausarlo para seguir después.</p><div class="acts"><button class="btn pri" data-act="close">Seguir entrenando</button><button class="btn" data-act="finish">Terminar y guardar</button><button class="btn ghost" data-act="pause">Pausar y salir</button></div>`);
}

