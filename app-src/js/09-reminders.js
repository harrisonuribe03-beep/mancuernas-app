/* Recordatorio diario */
/* ---------- recordatorio diario ---------- */
const RIDS=[101,102,103,104,105,106,107];
async function scheduleReminders(){
  if(!LN)return;
  try{await LN.cancel({notifications:RIDS.map(id=>({id}))});}catch(e){}
  if(!S.settings.remind)return;
  try{const p=await LN.checkPermissions();if(p.display!=='granted'){const q=await LN.requestPermissions();if(q.display!=='granted'){toast('Activa las notificaciones de la app para recibir el recordatorio');return;}}}catch(e){}
  const [hh,mm]=String(S.settings.remindTime||'18:00').split(':').map(Number);
  const nm=S.settings.name?S.settings.name+', ':'';
  const list=[];for(let i=0;i<7;i++){const d=dayAt(i);if(!d)continue;const p=plan(d.id,S.settings.mode);
    list.push({id:RIDS[i],title:`${nm}hoy toca ${d.t.toLowerCase()}`,body:`${estimate(p)} min · ${pl(p.length,'ejercicio','ejercicios')}. Abre la app y empieza.`,schedule:{on:{weekday:i===6?1:i+2,hour:hh,minute:mm},allowWhileIdle:true}});}
  call(LN,'schedule',{notifications:list});
}

