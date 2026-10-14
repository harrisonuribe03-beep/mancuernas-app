/* Tarjeta para compartir, respaldo e importación */
/* ---------- compartir y respaldo ---------- */
const FSP=CAP&&CAP.Plugins&&CAP.Plugins.Filesystem||null, SHP=CAP&&CAP.Plugins&&CAP.Plugins.Share||null;
const canShareImg=()=>!!(FSP&&SHP)||!CAP;
async function webSave(name,blob){
  try{if(window.claude&&typeof window.claude.use==='function'){const dl=await window.claude.use('downloads');if(dl){try{await dl.save({filename:name,data:blob});return 'saved';}catch(e){if(e&&e.code==='declined')return 'declined';}}}}catch(e){}
  const f=window.File?new File([blob],name,{type:blob.type}):null;
  try{if(f&&navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return 'shared';}}catch(e){if(e&&e.name==='AbortError')return 'declined';}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();return 'saved';
}
const loadImg=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src;});
function wrapText(g,t,maxW){const w=t.split(' '),out=[];let ln='';w.forEach(x=>{const tr=ln?ln+' '+x:x;if(g.measureText(tr).width>maxW&&ln){out.push(ln);ln=x;}else ln=tr;});if(ln)out.push(ln);return out;}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
async function drawCard(rec){
  const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  try{await document.fonts.load('800 80px "Plus Jakarta Sans"');await document.fonts.load('600 40px "Plus Jakarta Sans"');}catch(e){}
  const F=(w,s)=>`${w} ${s}px "Plus Jakarta Sans", system-ui, sans-serif`;
  const gr=g.createLinearGradient(0,0,W*.5,H);gr.addColorStop(0,'#4a63ff');gr.addColorStop(.6,'#2d43d9');gr.addColorStop(1,'#16237f');g.fillStyle=gr;g.fillRect(0,0,W,H);
  const cx=W*.56,cy=H*.47;
  g.save();g.globalAlpha=.09;g.strokeStyle='#fff';
  for(let k=0;k<36;k++){const a=k/36*Math.PI*2+.05;g.lineWidth=3+(k*7)%10;g.beginPath();g.moveTo(cx+Math.cos(a)*330,cy+Math.sin(a)*330);g.lineTo(cx+Math.cos(a)*1500,cy+Math.sin(a)*1500);g.stroke();}
  g.restore();
  const rg=g.createRadialGradient(cx,cy,30,cx,cy,520);rg.addColorStop(0,'rgba(255,255,255,.35)');rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.fillRect(0,0,W,H);
  const im=await loadImg(IMG({push:'press-militar-b',upper:'press-militar-b',pull:'curl-biceps-b',legs:'goblet-b',full:'goblet-b'}[kindOf(rec)]||'press-militar-b'));
  if(im){g.save();g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=40;g.shadowOffsetY=18;g.drawImage(im,cx-400,250,800,800);g.restore();}
  g.fillStyle='#fff';g.textBaseline='alphabetic';
  g.font=F(800,30);g.globalAlpha=.85;g.fillText('M A N C U E R N A S',72,104);g.globalAlpha=1;
  const L=myLevel();g.font=F(800,30);const lt=`NV ${L.lv} · ${L.rank.toUpperCase()}`,lw=g.measureText(lt).width+48;
  rr(g,W-72-lw,64,lw,58,29);g.fillStyle='rgba(255,255,255,.18)';g.fill();g.fillStyle='#fff';g.fillText(lt,W-72-lw+24,104);
  const d={t:titleOf(rec)};
  g.font=F(800,88);const lines=wrapText(g,d.t,W-144).slice(0,2);lines.forEach((l,i)=>g.fillText(l,72,236+i*96));
  g.font=F(600,36);g.globalAlpha=.85;g.fillText(cap1(new Date(rec.ts).toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})),72,236+lines.length*96-20);g.globalAlpha=1;
  const py=1010;
  if((rec.pr||[]).length){const t=rec.pr.length===1?'NUEVO RÉCORD PERSONAL':rec.pr.length+' RÉCORDS PERSONALES';g.font=F(800,28);const tw=g.measureText(t).width+56;rr(g,(W-tw)/2,py-78,tw,56,28);g.fillStyle='#fbbf24';g.fill();g.fillStyle='#1a1300';g.fillText(t,(W-tw)/2+28,py-40);}
  rr(g,48,py,W-96,250,36);g.fillStyle='rgba(10,16,60,.55)';g.fill();
  const mn=Math.max(1,Math.round(rec.dur/60)),st=[[mn,mn===1?'minuto':'minutos'],[rec.sets,rec.sets===1?'serie':'series'],[NF.format(rec.vol),'kg movidos']];
  st.forEach((s,i)=>{const x=48+(W-96)/3*i+(W-96)/6;g.textAlign='center';g.fillStyle='#fff';g.font=F(800,84);g.fillText(String(s[0]),x,py+130);g.font=F(600,32);g.globalAlpha=.75;g.fillText(s[1],x,py+185);g.globalAlpha=1;
    if(i){g.fillStyle='rgba(255,255,255,.18)';g.fillRect(48+(W-96)/3*i,py+60,2,140);}});
  g.textAlign='left';g.font=F(700,30);g.fillStyle='rgba(255,255,255,.8)';
  const strk=streak();g.fillText(strk>1?`Racha de ${strk} días seguidos`:'Entrenando en casa con mancuernas',72,H-38);
  return c;
}
async function shareRec(rec){
  if(!rec)return;toast('Preparando la imagen…');
  try{const c=await drawCard(rec),data=c.toDataURL('image/jpeg',.92);
    if(FSP&&SHP){const r=await FSP.writeFile({path:'mancuernas-'+rec.id+'.jpg',data:data.split(',')[1],directory:'CACHE'});await SHP.share({title:'Mi entrenamiento',files:[r.uri],dialogTitle:'Compartir entrenamiento'});return;}
    const blob=await (await fetch(data)).blob();await webSave('mancuernas-'+dayKey(rec.ts)+'.jpg',blob);
  }catch(e){if(!/cancel|abort/i.test(String(e&&e.message||e)))toast('No se pudo compartir la imagen');}
}
async function exportData(){
  const d=new Date(),name=`mancuernas-respaldo-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
  const json=JSON.stringify({app:'mancuernas',v:4,at:Date.now(),history:S.history,body:S.body,settings:S.settings,program:S.program,acts:S.acts});
  try{
    if(FSP&&SHP){const r=await FSP.writeFile({path:name,data:json,directory:'CACHE',encoding:'utf8'});await SHP.share({title:'Respaldo de Mancuernas',files:[r.uri],dialogTitle:'Guardar respaldo'});return;}
    const r=await webSave(name,new Blob([json],{type:'application/json'}));if(r==='saved')toast('Respaldo guardado');
  }catch(e){if(!/cancel|abort/i.test(String(e&&e.message||e)))toast('No se pudo exportar');}
}
function importData(text){
  let j;try{j=JSON.parse(text);}catch(e){toast('Ese archivo no es un respaldo válido');return;}
  if(!j||j.app!=='mancuernas'||!Array.isArray(j.history)){toast('Ese archivo no es un respaldo de Mancuernas');return;}
  const ids=new Set(S.history.map(h=>h.id));let n=0;
  j.history.forEach(h=>{if(h&&h.id&&typeof h.ts==='number'&&Array.isArray(h.ex)&&!ids.has(h.id)){addSession(h);n++;}});
  S.history.sort((a,b)=>b.ts-a.ts);LS.set('mc-hist',S.history);
  (j.body||[]).forEach(b=>{if(b&&b.id&&!S.body.some(x=>x.id===b.id))addBody(b);});
  if(j.settings&&!S.settings.name&&j.settings.name){S.settings.name=j.settings.name;saveSettings();}
  if(j.program&&j.program.v===4&&Array.isArray(j.program.days)&&S.program.legacy){S.program=j.program;saveProgram();scheduleReminders();}
  if(Array.isArray(j.acts)){const ai=new Set(S.acts.map(a=>a.id));j.acts.forEach(a=>{if(a&&a.id&&!ai.has(a.id)){S.acts.push(a);if(COL)COL.doc(a.id).set(stripId(a)).catch(()=>{});}});S.acts.sort((a,b)=>a.ts-b.ts);LS.set('mc-acts',S.acts);}
  render();toast(n?`Se importaron ${pl(n,'entrenamiento','entrenamientos')}`:'No había entrenamientos nuevos en el respaldo');
}

