/* Vista Perfil */
const MEPAGES={train:'Entrenamiento',sound:'Sonido y voz',notif:'Avisos y recordatorios',look:'Apariencia',data:'Datos y respaldo',guide:'Cómo progresar',about:'Acerca de'};
function viewMe(){
  const st=S.settings,s=streak(),L=myLevel(),prs=S.history.reduce((a,h)=>a+((h.pr||[]).length),0);
  const sw=(k,lb,sm)=>`<div class="set inline"><span class="lb">${lb}${sm?`<small>${sm}</small>`:''}</span><button class="sw" data-act="tog" data-v="${k}" aria-pressed="${!!st[k]}" aria-label="${lb}"></button></div>`;
  if(S.mePage&&MEPAGES[S.mePage]){
    let h=`<div class="subhd"><button class="iconbtn" data-act="mepage" data-v="" aria-label="Volver">${IC.left}</button><h1 class="h1">${MEPAGES[S.mePage]}</h1></div>`;
    if(S.mePage==='train')h+=`<div class="card">
      <div class="set"><span class="lb">Peso inicial sugerido<small>Kilos por mancuerna en ejercicios que aún no has hecho</small></span><div class="stepper"><button data-act="kg" data-v="-0.5" aria-label="Menos">−</button><b>${NF.format(st.kg)} kg</b><button data-act="kg" data-v="0.5" aria-label="Más">+</button></div></div>
      <div class="set"><span class="lb">Descanso entre series<small>${st.rest==='auto'?'Usa el descanso de cada ejercicio en tu plan':'Igual para todos los ejercicios'}</small></span><div class="seg" style="margin-top:10px">${[['auto','Del plan'],[60,'60 s'],[90,'90 s'],[120,'120 s']].map(([v,l])=>`<button data-act="rest" data-v="${v}" aria-pressed="${String(st.rest)===String(v)}">${l}</button>`).join('')}</div></div>
      ${sw('warm','Calentamiento guiado','5 minutos antes del primer ejercicio')}
      ${sw('core','Bloque de abdomen','Suma 2 ejercicios de core a las rutinas que no tienen')}</div>
      <button class="btn ghost block" style="margin-top:12px" data-act="tab" data-v="plan">${IC.cal}Editar mi plan y rutinas</button>`;
    if(S.mePage==='sound')h+=soundSettings().replace('<h2 class="h2">Sonido y voz</h2>','');
    if(S.mePage==='notif')h+=`<div class="card">${sw('vib','Vibración','Al marcar series y al terminar descansos')}${CAP?sw('notif','Notificaciones','Temporizador en la pantalla bloqueada y aviso al terminar el descanso'):''}${sw('wake','Pantalla encendida','No se bloquea mientras entrenas')}
      ${CAP?sw('remind','Recordatorio de entreno','Solo los días que te toca, con la rutina del día')+(st.remind?`<div class="set inline"><span class="lb">Hora del recordatorio</span><input type="time" id="in-rtime" class="tinput" value="${esc(st.remindTime||'18:00')}"></div>`:'')+sw('weekly','Resumen del domingo','Tu semana en una notificación a las 7 p. m.'):''}</div>
      ${CAP?'':'<p class="sub" style="margin:12px 2px">Los recordatorios y el temporizador en la pantalla bloqueada funcionan en la app de Android.</p>'}`;
    if(S.mePage==='look')h+=`<div class="card" style="padding:14px"><div class="lb" style="font-weight:700;margin-bottom:10px">Color de la app</div>${accentPicker()}</div>
      <div class="card" style="padding:14px;margin-top:10px"><div class="lb" style="font-weight:700;margin-bottom:10px">Tema</div><div class="seg">${[['system','Sistema'],['light','Claro'],['dark','Oscuro']].map(([k,l])=>`<button data-act="theme" data-v="${k}" aria-pressed="${st.theme===k}">${l}</button>`).join('')}</div></div>`;
    if(S.mePage==='data')h+=`<div class="card"><div class="set inline"><span class="lb">Exportar respaldo<small>Un archivo con tu historial, plan, medidas y ajustes. Guárdalo en Drive o envíatelo.</small></span><button class="btn sm ghost" data-act="export">${IC.share}Exportar</button></div>
      <div class="set inline"><span class="lb">Importar respaldo<small>Suma los entrenamientos de un archivo exportado</small></span><label class="btn sm ghost" style="cursor:pointer">${IC.dl}Importar<input type="file" id="in-import" accept=".json,application/json,text/plain" hidden></label></div>
      <div class="set inline"><span class="lb">Borrar historial<small>Entrenamientos, récords y logros. Puedes deshacerlo unos segundos.</small></span><button class="btn sm ghost danger" data-act="askwipe">Borrar</button></div></div>
      <p class="sub" style="margin:12px 2px;font-size:.82rem">${S.store==='db'?'Tus datos se guardan en tu cuenta y en este dispositivo.':'Tus datos se guardan en este teléfono. Exporta un respaldo de vez en cuando por si cambias de celular.'} Las fotos de progreso no salen del teléfono.</p>`;
    if(S.mePage==='guide')h+=`<div class="card guide"><h3>Sobrecarga progresiva</h3><p>Trabaja dentro del rango (por ejemplo 8–12). Cuando hagas <b>todas</b> las series en el número más alto con buena técnica, sube el peso la próxima vez y vuelve al número más bajo. La app te avisa cuando toca.</p>
      <h3>Si no puedes subir peso</h3><p>Con mancuernas fijas: baja en 3 segundos, agrega una pausa abajo, suma una serie o acorta el descanso.</p>
      <h3>Cuánto descansar</h3><p>Pierna y ejercicios grandes: 2 minutos. Compuestos de torso: 90 segundos. Aislamiento y abdomen: 45 a 60 segundos.</p>
      <h3>Semana suave</h3><p>Cada 6 a 8 semanas, o cuando te sientas agotado, usa el modo Suave: menos series y un poco menos de peso.</p>
      <h3>Tipos de serie</h3><p><b>C</b> calentamiento (no cuenta para récords), <b>D</b> drop set (bajas el peso y sigues), <b>F</b> al fallo.</p>
      <h3>Superseries</h3><p>Dos ejercicios alternados sin descanso entre ellos. Ahorran tiempo; funcionan mejor con músculos opuestos, como pecho y espalda.</p></div>`;
    if(S.mePage==='about'){const el=LS.get(ERRLOG,[]);h+=`<div class="card about">${emblem(L.ri,56)}<div><b>Mancuernas 5.0</b><span>${BUILD?'Versión '+BUILD+' · ':''}Hecha para entrenar en casa</span></div></div>
      <div class="card" style="margin-top:10px"><div class="set inline"><span class="lb">Registro de errores<small>${el.length?pl(el.length,'error guardado','errores guardados'):'Sin errores registrados'}</small></span>${el.length?`<button class="btn sm ghost" data-act="errcopy">Copiar</button>`:''}</div>
      <div class="set inline"><span class="lb">Ver la presentación otra vez</span><button class="btn sm ghost" data-act="wizard">Abrir</button></div></div>`;}
    return h;
  }
  const row=(k,ic,t,sub)=>`<li><button class="row mrow" data-act="mepage" data-v="${k}"><span class="mico">${ic}</span><span><div class="nm">${t}</div><div class="ds">${sub}</div></span><span class="chev">${IC.right}</span></button></li>`;
  return `<h1 class="h1" style="padding-top:6px">Perfil</h1>
  <div class="card me"><span class="avatar emb">${emblem(L.ri,54)}</span><div style="flex:1;min-width:0"><label class="namefield"><input id="in-name" value="${esc(st.name||'')}" placeholder="Tu nombre" maxlength="24" autocomplete="off" aria-label="Nombre">${IC.pen}</label><div class="sub">${L.rank} · nivel ${L.lv}</div></div></div>
  <div class="mestats"><div><b>${S.history.length}</b><span>entrenos</span></div><div><b>${s}</b><span>racha</span></div><div><b>${prs}</b><span>récords</span></div><div><b>${achievements().filter(a=>a.on).length}</b><span>logros</span></div></div>
  <h2 class="h2">Tu rango</h2>${rankCard(true)}
  <h2 class="h2">Ajustes</h2><ul class="glist">
  ${row('train',IC.dumb,'Entrenamiento',`Peso inicial ${NF.format(st.kg)} kg · descanso ${st.rest==='auto'?'del plan':st.rest+' s'}`)}
  ${row('sound',IC.vol,'Sonido y voz',`${st.sound?PACKS[packOf()][0]:'Sin sonidos'} · coach ${VOICES[st.voice||'basic'][0].toLowerCase()}`)}
  ${row('notif',IC.bell,'Avisos y recordatorios',st.remind?'Recordatorio a las '+esc(st.remindTime||'18:00'):'Vibración, pantalla y notificaciones')}
  ${row('look',IC.star,'Apariencia',`Color ${st.accent||'azul'} · tema ${({system:'del sistema',light:'claro',dark:'oscuro'})[st.theme]}`)}
  ${row('data',IC.layers,'Datos y respaldo',S.store==='db'?'Guardado en tu cuenta':'Guardado en este teléfono')}
  ${row('guide',IC.info,'Cómo progresar','Guía rápida de entrenamiento')}
  ${row('about',IC.trophy,'Acerca de','Mancuernas 5.0')}</ul>`;
}
