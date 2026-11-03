/* Aviso de versión nueva */
/* ---------- versión nueva ---------- */
const BUILD=parseInt('__BUILD__',10)||0;
const DL='https://github.com/harrisonuribe03-beep/mancuernas-app/releases/download/app/Mancuernas.apk';
let UPD=LS.get('mc-upd',null);
async function checkUpdate(){
  if(!CAP||!BUILD)return;
  if(UPD&&Date.now()-UPD.t<20*3600e3)return;
  try{const r=await fetch('https://api.github.com/repos/harrisonuribe03-beep/mancuernas-app/releases/tags/app',{headers:{Accept:'application/vnd.github+json'}});
    if(!r.ok)return;const j=await r.json();const m=/(\d+)\s*$/.exec(j.name||'');
    UPD={t:Date.now(),b:m?+m[1]:0};LS.set('mc-upd',UPD);if(S.tab==='hoy'&&$('#player').hidden)render();}catch(e){}
}
const hasUpdate=()=>!!(BUILD&&UPD&&UPD.b>BUILD&&UPD.dis!==UPD.b);


/* 7.2: buscar actualizaciones a mano (Perfil) */
async function updManual(){
  if(!CAP||!BUILD){sheet(`<h3>Actualizaciones</h3><p class="sub" style="margin-top:8px">En la versión web siempre tienes lo último: se actualiza sola. En el celular, búscala desde la app de Android.</p><div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);return;}
  sheet(`<h3>Actualizaciones</h3><p class="sub" style="margin-top:8px">Buscando la última versión…</p>`);
  let j=null;try{const r=await fetch('https://api.github.com/repos/harrisonuribe03-beep/mancuernas-app/releases/tags/app',{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});if(r.ok)j=await r.json();}catch(e){}
  if($('#sheet').hidden)return;
  if(!j){sheet(`<h3>Actualizaciones</h3><p class="sub" style="margin-top:8px">No se pudo revisar. Mira tu conexión a internet e intenta otra vez.</p><div class="acts"><button class="btn pri" data-act="updcheck">Intentar otra vez</button><button class="btn" data-act="close">Cerrar</button></div>`);return;}
  const m=/(\d+)\s*$/.exec(j.name||''),b=m?+m[1]:0,dt=j.published_at?new Date(j.published_at).toLocaleDateString('es-CO',{day:'numeric',month:'long',hour:'numeric',minute:'2-digit'}):'';
  UPD={t:Date.now(),b};LS.set('mc-upd',UPD);
  if(b>BUILD)sheet(`<h3>Hay una versión nueva</h3><p class="sub" style="margin-top:8px">Tienes la ${BUILD} y ya salió la <b>${b}</b>${dt?' ('+dt+')':''}. Descárgala e instálala encima: no pierdes tus datos.</p><div class="acts"><a class="btn pri" href="${DL}" data-act="updgo">${IC.dl}Descargar ahora</a><button class="btn" data-act="close">Luego</button></div>`);
  else sheet(`<h3>Estás al día</h3><p class="sub" style="margin-top:8px">Tienes la última versión (${BUILD})${dt?', publicada el '+dt:''}.</p><div class="acts"><button class="btn" data-act="close">Listo</button></div>`);
  if(S.tab==='hoy'&&$('#player').hidden)render();
}
