/* Registro de comidas, parte 3: reconocer la comida con una foto.
   - Dentro de Claude (versión web) la foto la analiza Claude, sin configurar nada.
   - En el teléfono la analiza Gemini de Google con la clave gratuita de la persona. La clave se queda en el teléfono.
   La IA separa cada alimento, lo cruza con nuestra tabla (ICBF/USDA) y calcula la porción a ojo.
   La persona revisa, ajusta y guarda. */

IC.pic=I('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="m4 17.5 5-4.6 4 3.6 2.6-2.1 4.4 3.6"/>');
IC.key=I('<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2"/>');

const GEM='https://generativelanguage.googleapis.com/v1beta',GKEY='mc-gkey',GMOD='mc-gmodels',AISTUDIO='https://aistudio.google.com/apikey';
const gkey=()=>String(LS.get(GKEY,'')||'');

/* ---------- Claude (solo cuando la app corre dentro de Claude) ---------- */
let SMP,SMPP=null;
function smpGet(){
  if(SMP!==undefined)return Promise.resolve(SMP);
  if(!SMPP)SMPP=(async()=>{let s=null;
    try{if(!CAP&&window.claude&&typeof window.claude.use==='function'){const x=await window.claude.use('sample');if(x){const L=await x.limits().catch(()=>null);if(L&&L.images)s=x;}}}catch(e){}
    if(SMP===undefined)SMP=s;return SMP;})();
  return SMPP;
}
if(!CAP&&window.claude)setTimeout(smpGet,1500);
function fphErr(code,m){const e=new Error(m||code);e.code=code;return e;}
async function clVision(prompt,blob,signal,fresh){
  try{return await SMP.json(prompt,{images:[blob],signal,cache:!fresh});}
  catch(e){const c=e&&e.code||'upstream_error';throw fphErr(c==='cancelled'?'abort':c==='invalid_json'?'json':'cl_'+c,e&&e.message);}
}

/* ---------- Gemini de Google (clave de la persona) ---------- */
function gemErr(st,j){
  const E=(j&&j.error)||{},m=String(E.message||''),all=m+' '+JSON.stringify(E.details||'');
  let c='other';
  if(/API_KEY_INVALID|API key not valid|API key expired|API_KEY_EXPIRED/i.test(all))c='key';
  else if(/SERVICE_DISABLED|has not been used in project|is disabled/i.test(all))c='api';
  else if(/location is not supported|User location/i.test(all))c='region';
  else if(st===401||st===403)c='key';
  else if(st===404)c='model';
  else if(st===429)c=/limit:\s*0\b/i.test(all)?'nofree':'quota';
  else if(st>=500)c='busy';
  return fphErr(c,m||'HTTP '+st);
}
async function gemFetch(path,key,body,signal){
  let r;
  try{r=await fetch(GEM+path,{method:body?'POST':'GET',headers:Object.assign({'x-goog-api-key':key},body?{'Content-Type':'application/json'}:{}),body:body?JSON.stringify(body):undefined,signal});}
  catch(e){if(e&&e.name==='AbortError')throw fphErr('abort');throw fphErr('net');}
  const j=await r.json().catch(()=>null);
  if(!r.ok)throw gemErr(r.status,j);
  return j||{};
}
// Ordena los modelos que sirven para fotos: Flash estable más nuevo, luego Flash-Lite, luego versiones de prueba
function gemRank(names){
  const L=names.filter(n=>/^gemini-/.test(n)&&/flash/.test(n)&&!/tts|image|live|audio|embed|robot|transcri|translat|omni|computer|thinking|8b|nano|banana/i.test(n))
    .map(n=>({n,v:parseFloat((n.match(/^gemini-(\d+(?:\.\d+)?)/)||[])[1])||0,lite:/lite/.test(n),pre:/preview|exp/.test(n),al:/latest/.test(n)}));
  const top=lite=>Math.max(0,...L.filter(x=>x.lite===lite&&!x.pre&&!x.al).map(x=>x.v));
  // el alias «latest» va justo después del Flash estable más nuevo y antes de los viejos
  return L.map(x=>({n:x.n,s:x.pre?(x.lite?0:100)+x.v:x.al?(x.lite?200:300)+top(x.lite)-.01:(x.lite?200:300)+x.v}))
    .sort((a,b)=>b.s-a.s||a.n.length-b.n.length).map(x=>x.n);
}
async function gemModels(key,force){
  const c=LS.get(GMOD,null),tag=key.slice(-6);
  if(!force&&c&&c.k===tag&&Date.now()-c.at<7*864e5&&c.l&&c.l.length)return c.l;
  const j=await gemFetch('/models?pageSize=1000',key);
  let l=gemRank((j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).indexOf('generateContent')>=0).map(m=>String(m.name||'').replace(/^models\//,''))).slice(0,6);
  if(!l.length)l=['gemini-flash-latest','gemini-2.5-flash'];
  LS.set(GMOD,{k:tag,at:Date.now(),l});return l;
}
async function gemVision(prompt,b64,signal){
  const key=gkey(),L=await gemModels(key);let last=null;
  for(const m of L.slice(0,4)){
    try{
      const j=await gemFetch(`/models/${encodeURIComponent(m)}:generateContent`,key,{contents:[{role:'user',parts:[{inlineData:{mimeType:'image/jpeg',data:b64}},{text:prompt}]}],
        generationConfig:{responseMimeType:'application/json',temperature:.2}},signal);
      const C=j.candidates&&j.candidates[0],t=C&&C.content?(C.content.parts||[]).filter(p=>p.text&&!p.thought).map(p=>p.text).join(''):'';
      if(!t)throw fphErr(j.promptFeedback&&j.promptFeedback.blockReason?'blocked':'empty');
      if(m!==L[0]){const c=LS.get(GMOD,null);if(c&&c.l){c.l=[m].concat(c.l.filter(x=>x!==m));LS.set(GMOD,c);}}
      return jparse(t);
    }catch(e){last=e;if(!/^(model|nofree|busy)$/.test(e.code))throw e;}
  }
  if(last&&last.code==='model')LS.set(GMOD,null); // la próxima vez vuelve a preguntar qué modelos hay
  throw last||fphErr('other');
}
function jparse(t){
  t=String(t||'').trim();try{return JSON.parse(t);}catch(e){}
  const f=t.match(/```(?:json)?\s*([\s\S]*?)```/);if(f)try{return JSON.parse(f[1]);}catch(e){}
  const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a>=0&&b>a)try{return JSON.parse(t.slice(a,b+1));}catch(e){}
  throw fphErr('json');
}

/* ---------- la instrucción y la respuesta ---------- */
function fphPrompt(hint){
  const seen=new Set(),cat=[];
  Object.values(fdb()).concat(S.flib.foods).forEach(F=>{if(!F||!F.id||seen.has(F.id))return;seen.add(F.id);cat.push(F.id+'|'+F.n+(F.liq?' (bebida)':''));});
  return `Eres nutricionista en Colombia. La imagen es una foto de comida o bebida que una persona va a anotar en su diario de alimentación.

1. Identifica por separado cada alimento o bebida que se ve (ej.: arroz blanco, pechuga a la plancha, ensalada, patacón, jugo). Si es un plato mixto (sancocho, bandeja paisa, hamburguesa, pizza) usa un solo alimento si así queda más preciso, o separa los componentes que se distinguen.
2. Calcula la cantidad de cada uno en gramos (bebidas en ml). Usa como referencia el plato (unos 26 cm), los cubiertos, el vaso o la mano. Si dudas, da la cantidad más probable para una porción normal.
3. Si el alimento está en el CATÁLOGO, copia su id exacto. Si no está, o la preparación es muy distinta, pon "id": null.
4. Para esa cantidad da kcal, proteína (p), carbohidratos (c), grasa (g) y fibra (fib) en gramos, con valores de tablas de composición (ICBF/USDA). Cuenta el aceite si se ve frito o salteado.
5. "nombre" en español, corto y claro (ej.: "Arroz con pollo", "Jugo de mora en agua").
${hint?`\nLa persona aclara sobre su foto: «${hint.replace(/[«»"]/g,'')}». Tenlo en cuenta.\n`:''}
Responde SOLO con un JSON así:
{"comida":true,"plato":"nombre corto del plato","items":[{"nombre":"Arroz blanco","id":"arroz","cantidad":150,"unidad":"g","kcal":195,"p":4,"c":42,"g":0.5,"fib":0.6}],"nota":"aviso breve si algo no se ve claro; si no, vacío"}
Si en la foto no hay comida ni bebida: {"comida":false,"plato":"","items":[],"nota":"qué se ve en la foto"}

CATÁLOGO (id|nombre):
${cat.join('\n')}`;
}
const fphNum=x=>{const n=typeof x==='number'?x:parseFloat(String(x==null?'':x).replace(',','.'));return isFinite(n)&&n>=0?n:0;};
function fphRows(J){
  const out=[];
  (Array.isArray(J&&J.items)?J.items:[]).slice(0,12).forEach(x=>{
    if(!x||typeof x!=='object')return;
    const name=cap1(String(x.nombre||'').trim().slice(0,60))||'Alimento';
    let amt=fphNum(x.cantidad);if(amt>3000)amt=0;
    const liq=/^ml$/i.test(String(x.unidad||'').trim()),F=x.id?food(String(x.id)):null;
    if(F){
      const U=funits(F),b=U.findIndex(fbase);let u=b>=0?b:0,q=b>=0?(Math.round(amt)||100):1;
      // lo que se cuenta por unidades (huevos, arepas, panes) se muestra en unidades si la cantidad cuadra
      const P0=U[0];if(!fbase(P0)&&amt>0){const n=amt/P0[2],r=Math.round(n*2)/2;if(b<0||(r>=.5&&Math.abs(n-r)/r<=.15)){u=0;q=Math.max(.25,b<0?Math.round(n*4)/4:r);}}
      out.push({on:true,F,q,u,ai:false});return;
    }
    const k=fphNum(x.kcal);if(!(k>0))return;if(!(amt>0))amt=100;
    const r=100/amt;
    out.push({on:true,ai:true,u:0,q:Math.round(amt),F:{id:'ai',n:name,k:k*r,p:fphNum(x.p)*r,c:fphNum(x.c)*r,f:fphNum(x.g)*r,fb:fphNum(x.fib)*r,liq,por:[]}});
  });
  return out;
}
function fphItem(r,s){const m=fcalc(r.F,r.q,r.u),w=Math.round(m.w);
  return {id:fid(),s,f:null,n:r.F.n,q:1,u:0,qt:`${NF.format(w)} ${r.F.liq?'ml':'g'} · por foto`,w,k:Math.round(m.k),p:r1(m.p),c:r1(m.c),fat:r1(m.fat),fib:r1(m.fib),t:Date.now(),ai:1};}

/* ---------- la foto ---------- */
async function fphDecode(file){
  if(typeof createImageBitmap==='function'){
    try{return await createImageBitmap(file,{imageOrientation:'from-image'});}catch(e){}
    try{return await createImageBitmap(file);}catch(e){}
  }
  return await new Promise((res,rej)=>{const u=URL.createObjectURL(file),i=new Image();i.onload=()=>{res(i);setTimeout(()=>URL.revokeObjectURL(u),0);};i.onerror=()=>{URL.revokeObjectURL(u);rej(fphErr('img'));};i.src=u;});
}
async function fphPrep(file){
  let img;try{img=await fphDecode(file);}catch(e){throw fphErr('img');}
  const w0=img.naturalWidth||img.width,h0=img.naturalHeight||img.height;if(!w0||!h0)throw fphErr('img');
  const sc=Math.min(1,1280/Math.max(w0,h0)),w=Math.max(1,Math.round(w0*sc)),h=Math.max(1,Math.round(h0*sc));
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(img,0,0,w,h);
  if(img.close)try{img.close();}catch(e){}
  const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',.85));if(!blob)throw fphErr('img');
  const d=cv.toDataURL('image/jpeg',.85);
  return {blob,src:d,b64:d.split(',')[1]};
}

/* ---------- hojas ---------- */
let FPH=null;
const FPHMSG={
  key:['La clave no funciona','Revisa que la copiaste completa desde Google AI Studio, o crea una nueva.'],
  api:['Falta activar el servicio','Crea la clave desde Google AI Studio con la misma cuenta: así queda activado.'],
  quota:['Llegaste al límite gratis por ahora','Google limita cuántas fotos se analizan por minuto y por día. Espera un rato e intenta otra vez.'],
  nofree:['Tu clave no tiene uso gratis','Crea la clave en Google AI Studio con una cuenta personal de Google.'],
  region:['Google no ofrece este servicio aquí','No está disponible en la ubicación desde la que te conectas.'],
  busy:['El servicio está saturado','Intenta otra vez en un momento.'],
  net:['Sin conexión','Revisa tu internet e intenta otra vez.'],
  json:['No entendí la respuesta','Intenta otra vez. Si sigue pasando, toma la foto con más luz.'],
  blocked:['No se pudo analizar esta foto','Prueba con otra foto del plato.'],
  empty:['No se pudo analizar esta foto','Prueba con otra foto del plato.'],
  img:['No pude abrir esa imagen','Prueba con otra foto (JPG o PNG).'],
  cl_not_granted:['Falta tu permiso','Para analizar la foto, la app necesita que permitas usar Claude.'],
  cl_rate_limited:['Llegaste al límite de uso por ahora','Espera un rato e intenta otra vez.'],
  cl_session_expired:['Tu sesión se cerró','Vuelve a entrar a Claude e intenta otra vez.'],
  cl_image_rejected:['No pude usar esa imagen','Prueba con otra foto (JPG o PNG).'],
  cl_refused:['No se pudo analizar esta foto','Prueba con otra foto del plato.'],
  other:['No se pudo analizar la foto','Intenta otra vez en un momento.']};
const fphMsg=c=>FPHMSG[c]||FPHMSG.other;

async function fphWho(){const s=await smpGet();if(s)return 'claude';return gkey()?'gemini':null;}
async function fphStart(){
  const k=FADD?FADD.k:(S.fdate||fToday()),s=FADD?FADD.s:fslotNow(),who=await fphWho();
  if(!who){keySheet('photo');return;}
  FPH={k,s,who,hint:FPH&&FPH.k===k?FPH.hint:'',st:'pick',rows:[],tok:0};renderPhoto();
}
function fphTot(){const R=FPH.rows.filter(r=>r.on&&r.q>0),t={k:0,p:0,c:0,f:0,n:R.length};R.forEach(r=>{const m=fcalc(r.F,r.q,r.u);t.k+=m.k;t.p+=m.p;t.c+=m.c;t.f+=m.fat;});return t;}
function fphTotHtml(){const t=fphTot();return `<b>${fk(t.k)} kcal</b><span>${fk(t.p)} g proteína · ${fk(t.c)} g carbohidratos · ${fk(t.f)} g grasa</span>`;}
function fphSaveTxt(){const t=fphTot();return t.n?`Agregar ${pl(t.n,'alimento','alimentos')} · ${fk(t.k)} kcal`:'Marca al menos un alimento';}
const fphQv=r=>fbase(funits(r.F)[r.u])?String(Math.round(r.q)):String(r.q).replace('.',',');
function fphSub(r){const P=funits(r.F)[r.u];return (fbase(P)?'':esc(qlabel(r.F,r.q,r.u))+' · ')+(r.ai?'calculado por la IA':'tabla de alimentos');}
function fphUnit(r){const P=funits(r.F)[r.u];return fbase(P)?P[0]:(r.q>1?P[1]:P[0]);}
function fphRow(r,i){const m=fcalc(r.F,r.q,r.u);
  return `<li class="fphr${r.on?'':' off'}" id="fphr${i}">
    <button class="fchk" data-act="fphon" data-v="${i}" aria-pressed="${r.on}" aria-label="Incluir ${esc(r.F.n)}">${IC.check}</button>
    <span class="fphn"><b>${esc(r.F.n)}</b><small id="fphs${i}">${fphSub(r)}</small></span>
    <em class="fphk" id="fphk${i}">${fk(m.k)}<small> kcal</small></em>
    <span class="fphq"><button class="iconbtn sm" data-act="fphq" data-v="${i}:-1" aria-label="Menos">−</button>
      <label><input class="fphin" data-i="${i}" inputmode="decimal" value="${fphQv(r)}" aria-label="Cantidad de ${esc(r.F.n)}" autocomplete="off"><span id="fphu${i}">${esc(fphUnit(r))}</span></label>
      <button class="iconbtn sm" data-act="fphq" data-v="${i}:1" aria-label="Más">+</button></span></li>`;}
function renderPhoto(){
  const A=FPH;if(!A)return;const back=`<button class="btn" data-act="fphback">Volver</button>`;
  const img=A.src?`<div class="fphimg"><img src="${A.src}" alt="Tu foto"></div>`:'';
  if(A.st==='pick'){
    sheet(`<h3>Foto de tu comida</h3><p class="sub">Toma la foto desde arriba, con todo el plato a la vista. La IA reconoce los alimentos y calcula las porciones; tú revisas antes de guardar.</p>
    <div class="fphpick"><label class="fphb">${IC.cam}<b>Tomar foto</b><input type="file" accept="image/*" capture="environment" id="fphcam" hidden></label>
    <label class="fphb">${IC.pic}<b>Elegir de la galería</b><input type="file" accept="image/*" id="fphgal" hidden></label></div>
    <div class="bform"><label class="wide"><span>Detalle que la foto no muestra (opcional)</span><input id="fphhint" maxlength="140" value="${esc(A.hint||'')}" placeholder="Ej.: frito en aceite, jugo sin azúcar" autocomplete="off"></label></div>
    <p class="fnote">${A.who==='claude'?'La foto la analiza Claude con tu cuenta.':`La foto se envía a Google Gemini para analizarla; la app no la guarda. <button class="flink" data-act="fphkey">${IC.key}Cambiar clave</button>`}</p>
    <div class="acts">${back}</div>`);return;}
  if(A.st==='load'){
    sheet(`<div class="floading" id="fphload">${img}<span class="spin" aria-hidden="true"></span><b>Reconociendo los alimentos…</b><small>${A.who==='claude'?'Puede tardar hasta un minuto.':'Suele tardar unos segundos.'}</small></div>
    <div class="acts"><button class="btn" data-act="fphcancel">Cancelar</button></div>`);return;}
  if(A.st==='err'){const [t,s]=fphMsg(A.err),keyish=/^(key|api|nofree)$/.test(A.err);
    sheet(`${img}<h3>${t}</h3><p class="sub">${s}</p>
    <div class="acts">${keyish?`<button class="btn pri" data-act="fphkey">${IC.key}Cambiar clave</button>`:A.err==='img'?'':`<button class="btn pri" data-act="fphretry">Intentar otra vez</button>`}<button class="btn" data-act="fphagain">Otra foto</button>${back}</div>`);return;}
  if(A.st==='none'){
    sheet(`${img}<h3>No veo comida en esta foto</h3><p class="sub">${esc(A.nota||'Toma la foto más cerca del plato, con buena luz.')}</p>
    <div class="acts"><button class="btn pri" data-act="fphagain">${IC.cam}Otra foto</button>${back}</div>`);return;}
  sheet(`<h3>${A.plato?esc(cap1(A.plato)):'Lo que veo en tu foto'}</h3><p class="sub">Revisa los alimentos y corrige las cantidades si hace falta.</p>${img}
    ${A.nota?`<div class="ftip">${IC.info}<span>${esc(A.nota)}</span></div>`:''}
    <div class="over" style="margin-top:14px">Comida</div><div class="chips wrap fslotc">${fslots(fday(A.k)).map(s=>`<button class="chip" data-act="fphslot" data-v="${s}" aria-pressed="${A.s===s}">${FSLOT[s]}</button>`).join('')}</div>
    <ul class="flist fphl">${A.rows.map(fphRow).join('')}</ul>
    <div class="fphtot" id="fphtot">${fphTotHtml()}</div>
    <p class="fnote">Las cantidades son un cálculo a ojo. Si pesaste algo, corrígelo; si sobra un alimento, desmárcalo.</p>
    <div class="acts"><button class="btn pri" data-act="fphsave" id="fphsave">${fphSaveTxt()}</button><button class="btn" data-act="fphagain">Otra foto</button></div>`);
  const p=$('#sheet .pan');if(p)p.classList.add('tall');
}
function fphRefresh(i){const r=FPH&&FPH.rows[i];if(!r)return;const m=fcalc(r.F,r.q,r.u),k=$('#fphk'+i),u=$('#fphu'+i),t=$('#fphtot'),b=$('#fphsave'),li=$('#fphr'+i);
  if(k)k.innerHTML=`${fk(m.k)}<small> kcal</small>`;if(u)u.textContent=fphUnit(r);const sb=$('#fphs'+i);if(sb)sb.innerHTML=fphSub(r);if(t)t.innerHTML=fphTotHtml();if(b)b.textContent=fphSaveTxt();
  if(li){li.classList.toggle('off',!r.on);const c=li.querySelector('.fchk');if(c)c.setAttribute('aria-pressed',String(r.on));}}

async function fphFile(file){
  if(!file||!FPH)return;const h=$('#fphhint');if(h)FPH.hint=h.value.trim().slice(0,140);
  FPH.st='load';FPH.src='';FPH.rows=[];renderPhoto();
  try{Object.assign(FPH,await fphPrep(file));}catch(e){if(FPH){FPH.st='err';FPH.err='img';renderPhoto();}return;}
  fphRun(false);
}
async function fphRun(fresh){
  const A=FPH;if(!A||!A.blob)return;
  const tok=++A.tok,ctl=typeof AbortController==='function'?new AbortController():null;A.ctl=ctl;A.st='load';renderPhoto();
  let J;
  try{const p=fphPrompt(A.hint);J=A.who==='claude'?await clVision(p,A.blob,ctl?ctl.signal:undefined,fresh):await gemVision(p,A.b64,ctl?ctl.signal:undefined);}
  catch(e){
    if(FPH!==A||A.tok!==tok||!$('#fphload')||e.code==='abort')return;
    // dentro de Claude sin permiso: si hay clave de Gemini, sigue con Gemini
    if(e.code==='cl_not_granted'||e.code==='cl_sampling_disabled'||e.code==='cl_images_unavailable'){SMP=null;if(gkey()){A.who='gemini';fphRun(fresh);return;}}
    A.st='err';A.err=e.code||'other';renderPhoto();return;}
  if(FPH!==A||A.tok!==tok||!$('#fphload'))return;
  A.rows=fphRows(J);A.plato=String(J&&J.plato||'').trim().slice(0,60);A.nota=String(J&&J.nota||'').trim().slice(0,220);
  A.st=A.rows.length?'ok':'none';renderPhoto();
}

/* ---------- clave de Gemini ---------- */
let FKEYCTX='photo';
function keySheet(ctx){
  FKEYCTX=ctx||'photo';const k=gkey();
  sheet(`<h3>${k?'Tu clave de Google Gemini':'Activa el reconocimiento por foto'}</h3>
  <p class="sub">La app usa la IA de Google (Gemini) para reconocer la comida. Para uso personal es gratis: solo necesitas una clave, que se crea una vez.</p>
  <ol class="fsteps"><li>Abre <b>Google AI Studio</b> y entra con tu cuenta de Google.</li><li>Toca <b>Create API key</b> (crear clave) y cópiala.</li><li>Vuelve aquí y pégala abajo.</li></ol>
  <a class="btn fextl" href="${AISTUDIO}" target="_blank" rel="noopener">${IC.key}Abrir Google AI Studio</a>
  <div class="bform"><label class="wide"><span>Clave de API</span><input id="fgkey" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${k?'Guardada: termina en '+esc(k.slice(-4)):'Pega aquí tu clave'}"></label></div>
  <p class="ferr" id="fgkerr" role="alert" hidden></p>
  <p class="fnote">La clave se guarda solo en este dispositivo. Las fotos se envían a Google para analizarlas y la app no las guarda.</p>
  <div class="acts"><button class="btn pri" data-act="fgkeysave" id="fgksave">Guardar y probar</button>${k?`<button class="btn danger" data-act="fgkeydel">Quitar la clave</button>`:''}<button class="btn" data-act="${FKEYCTX==='prefs'?'close':'fphback'}">Volver</button></div>`);
}
async function fgkeySave(){
  const i=$('#fgkey'),b=$('#fgksave'),er=$('#fgkerr'),v=(i?i.value:'').replace(/\s+/g,'');
  const bad=t=>{if(er){er.textContent=t;er.hidden=false;}};
  if(!v){bad(gkey()?'Pega una clave nueva para cambiarla.':'Pega la clave que copiaste de Google AI Studio.');return;}
  if(v.length<20||/[^\w\-.]/.test(v)){bad('Esa clave parece incompleta. Cópiala otra vez con el botón de copiar.');return;}
  if(b){b.disabled=true;b.textContent='Probando la clave…';}if(er)er.hidden=true;
  try{await gemModels(v,true);}
  catch(e){if(b){b.disabled=false;b.textContent='Guardar y probar';}const [t,s]=fphMsg(e.code);bad(t+'. '+s);return;}
  LS.set(GKEY,v);
  if(FKEYCTX==='prefs'||!FADD&&!FPH){closeSheet();render();toast(IC.check+'<span>Listo: ya puedes registrar comidas con una foto</span>');return;}
  toast(IC.check+'<span>Clave guardada</span>');
  if(FPH&&FPH.blob){FPH.who='gemini';fphRun(true);return;}
  fphStart();
}
function fphPrefs(){
  if(SMP)return '';const k=gkey();
  return `<div class="set inline"><span class="lb">Registrar comidas con una foto<small>${k?'Activado con Google Gemini · clave …'+esc(k.slice(-4)):'Necesita una clave gratuita de Google'}</small></span><button class="btn sm ${k?'ghost':'pri'}" data-act="fphkeyp">${k?'Cambiar':'Activar'}</button></div>`;
}

function fphAct(a,v){
  switch(a){
    case 'fphoto':fphStart();return true;
    case 'fphback':if(FPH&&FPH.ctl)try{FPH.ctl.abort();}catch(e){}if(FPH)FPH.tok++;if(FADD)renderAdd();else closeSheet();return true;
    case 'fphagain':if(!FPH)return true;FPH.st='pick';FPH.src='';FPH.blob=null;renderPhoto();return true;
    case 'fphretry':fphRun(true);return true;
    case 'fphcancel':if(!FPH)return true;if(FPH.ctl)try{FPH.ctl.abort();}catch(e){}FPH.tok++;FPH.st='pick';FPH.src='';renderPhoto();return true;
    case 'fphon':{const r=FPH&&FPH.rows[+v];if(!r)return true;r.on=!r.on;fphRefresh(+v);return true;}
    case 'fphq':{const [i,d]=String(v).split(':').map(Number),r=FPH&&FPH.rows[i];if(!r)return true;const st=fstep(r.F,r.u);
      r.q=Math.max(st,Math.round((r.q+d*st)/st)*st);r.q=Math.round(r.q*100)/100;if(!r.on)r.on=true;
      const inp=$(`.fphin[data-i="${i}"]`);if(inp)inp.value=fphQv(r);fphRefresh(i);return true;}
    case 'fphslot':if(!FPH)return true;FPH.s=v;document.querySelectorAll('[data-act=fphslot]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));return true;
    case 'fphsave':{if(!FPH)return true;const R=FPH.rows.filter(r=>r.on&&r.q>0);if(!R.length){toast('Marca al menos un alimento');return true;}
      const k=FPH.k,s=FPH.s,items=R.map(r=>r.ai?fphItem(r,s):fitem(r.F,r.q,r.u,s));FPH=null;closeSheet();
      faddItems(k,items,`${pl(items.length,'alimento','alimentos')} de la foto en ${FSLOT[s].toLowerCase()}`);return true;}
    case 'fphkey':keySheet('photo');return true;
    case 'fphkeyp':keySheet('prefs');return true;
    case 'fgkeysave':fgkeySave();return true;
    case 'fgkeydel':LS.set(GKEY,'');LS.set(GMOD,null);closeSheet();render();toast('Clave quitada');return true;
  }
  return false;
}
document.addEventListener('change',ev=>{const t=ev.target;if(t&&(t.id==='fphcam'||t.id==='fphgal')){const f=t.files&&t.files[0];t.value='';if(f)fphFile(f);}});
document.addEventListener('input',ev=>{const t=ev.target;if(!t||!t.classList||!t.classList.contains('fphin')||!FPH)return;const i=+t.dataset.i,r=FPH.rows[i];if(!r)return;
  const n=parseFloat(String(t.value).replace(',','.'));if(!(n>0&&n<5000))return;
  // si escribe gramos donde la unidad es taza o unidad, se pasa a gramos
  const U=funits(r.F),b=U.findIndex(fbase);if(!fbase(U[r.u])&&n>20&&b>=0)r.u=b;
  r.q=n;if(!r.on)r.on=true;fphRefresh(i);});
document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target&&ev.target.id==='fgkey'){ev.preventDefault();fgkeySave();}});
