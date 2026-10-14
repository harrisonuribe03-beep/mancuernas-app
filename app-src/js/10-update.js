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

