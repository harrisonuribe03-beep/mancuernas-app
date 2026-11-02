
/* ===================== v4 · mapa muscular, series por músculo y fotos ===================== */
const MREG={'Pecho':'chest','Pecho alto':'chest','Tríceps':'tri','Hombro':'delt','Hombro lateral':'delt','Hombro anterior':'delt','Hombro posterior':'rdelt',
  'Core':'abs','Abdomen':'abs','Abdomen bajo':'abs','Oblicuos':'obl','Espalda':'lats','Espalda alta':'traps','Trapecio':'traps','Lumbar':'lower',
  'Bíceps':'bi','Braquial':'bi','Antebrazo':'fore','Cuádriceps':'quad','Glúteo':'glute','Isquiotibiales':'ham','Pantorrilla':'calf','Aductores':'add','Abductores':'glute'};
const RNAME={chest:'Pecho',tri:'Tríceps',delt:'Hombros',rdelt:'Hombro posterior',abs:'Abdomen',obl:'Oblicuos',lats:'Dorsales',traps:'Espalda alta',lower:'Lumbar',
  bi:'Bíceps',fore:'Antebrazo',quad:'Cuádriceps',glute:'Glúteos',ham:'Isquiotibiales',calf:'Pantorrillas',add:'Aductores'};
const BIG=new Set(['chest','lats','quad','glute','ham','traps','lower']);
const MAIN=['chest','lats','traps','delt','rdelt','bi','tri','quad','ham','glute','calf','abs'];
function regionsOf(n){const m=info(n).m,o={};m.forEach((x,i)=>{const r=MREG[x];if(r&&!(r in o))o[r]=i===0?1:.5;});return o;}
function recovery(){
  const now=Date.now(),out={};
  for(const h of S.history){if(now-h.ts>8*864e5)break;
    (h.ex||[]).forEach(z=>{const R=regionsOf(z.n),sets=z.s.filter(x=>x[2]!=='c').length;for(const r in R){const o=out[r]||(out[r]={last:0,sets:0});
      if(h.ts>o.last){o.last=h.ts;o.sets=0;}if(h.ts===o.last)o.sets+=sets*R[r];}});}
  const res={};for(const r in RNAME){const o=out[r];if(!o){res[r]=null;continue;}
    const base=BIG.has(r)?72:48,need=base*Math.max(.6,Math.min(1.4,o.sets/6)),hrs=(now-o.last)/36e5;
    res[r]={pct:Math.max(0,Math.min(100,Math.round(hrs/need*100))),hrs,sets:o.sets};}
  return res;
}
const recCls=x=>!x?'rn':x.pct>=100?'r4':x.pct>=67?'r3':x.pct>=34?'r2':'r1';
function weekSets(days){
  const since=Date.now()-(days||7)*864e5,o={};MAIN.forEach(r=>o[r]=0);
  S.history.forEach(h=>{if(h.ts<since)return;(h.ex||[]).forEach(z=>{const R=regionsOf(z.n),n=z.s.filter(x=>x[2]!=='c').length;for(const r in R)if(r in o)o[r]+=n*R[r];});});
  return o;
}
/* Cuerpo anatómico (7.1): músculos con forma real y líneas de fibra. Rojo = en recuperación (más fuerte = más cansado), gris = listo.
   Se dibuja la mitad izquierda y se refleja. viewBox 200 × 420. */
function bodySVG(side,rec,mini,hl){
  const c=r=>hl?`class="mu ${hl[r]===1?'hp':hl[r]?'hs':'rn'}" data-r="${r}"`:`class="mu ${recCls(rec[r])}" data-r="${r}"`;
  const M=inner=>`<g>${inner}</g><g transform="translate(200,0) scale(-1,1)">${inner}</g>`;
  const F=d=>`<path class="fib" d="${d}"/>`;
  // silueta: cabeza, cuello, tronco, brazos, piernas, manos y pies
  const sk=`<g class="sk"><ellipse cx="100" cy="27" rx="15" ry="19"/><path d="M90 42 h20 l3 16 h-26 Z"/>
    ${M(`<path d="M100 54 L84 56 Q62 60 50 70 Q40 80 41 100 L36 150 L28 212 Q26 226 30 238 L38 240 Q44 226 44 214 L56 158 L64 120 Q66 150 68 176 Q62 196 62 214 Q58 260 64 300 Q60 330 62 380 L60 400 Q62 410 78 410 L84 404 L82 380 Q86 340 84 306 Q96 260 98 214 L100 212 Z"/>`)}</g>`;
  let m='';
  if(side==='f'){
    m=M(`<path ${c('traps')} d="M90 54 Q78 60 66 66 Q80 66 92 62 Z"/>
      <path ${c('delt')} d="M68 66 Q50 64 44 80 Q41 96 47 108 Q52 92 60 84 Q66 76 74 72 Z"/>${F('M60 70 Q52 84 50 100')}${F('M66 72 Q58 84 56 96')}
      <path ${c('chest')} d="M99 68 L78 69 Q64 74 60 88 Q58 104 68 112 Q82 120 99 112 Z"/>${F('M98 76 Q80 80 64 94')}${F('M98 90 Q82 92 66 104')}${F('M98 104 Q86 106 74 112')}
      <path ${c('bi')} d="M48 110 Q41 124 41 140 Q43 152 50 152 Q58 138 59 118 Q57 108 52 106 Z"/>${F('M50 114 Q46 130 47 146')}
      <path ${c('fore')} d="M42 156 Q34 178 31 210 L38 214 Q48 190 54 158 Z"/>${F('M46 162 Q40 182 36 206')}
      <path ${c('abs')} d="M88.5 117 h10 v15 h-10 Q87 124 88.5 117 Z M88.5 134 h10 v15 h-10 Z M88.5 151 h10 v15 h-10 Z M88.5 168 h10 v22 Q92 188 88.5 182 Z"/>
      <path ${c('obl')} d="M85 116 Q72 118 68 132 Q66 154 70 174 Q76 188 86 194 L86 120 Z"/>${F('M84 124 L72 136')}${F('M84 140 L70 152')}${F('M84 156 L71 168')}
      <path ${c('quad')} d="M70 206 Q62 232 64 266 Q67 292 80 302 Q88 296 92 270 Q96 240 92 214 Q84 204 70 206 Z"/>${F('M74 212 Q70 250 76 292')}${F('M86 214 Q86 252 84 290')}
      <path ${c('add')} d="M93 214 Q100 232 98 260 Q96 270 93 272 Q96 244 90 222 Z"/>
      <path ${c('calf')} d="M66 316 Q60 340 64 372 Q68 382 74 380 Q80 354 80 320 Q74 312 66 316 Z"/>${F('M70 322 Q66 348 69 372')}`);
  }else{
    m=M(`<path ${c('traps')} d="M100 44 L88 54 Q76 62 66 66 Q76 72 84 82 Q94 102 100 124 Z"/>${F('M98 56 L72 68')}${F('M98 80 L84 74')}
      <path ${c('rdelt')} d="M66 66 Q50 64 44 80 Q41 96 47 108 Q52 92 60 84 Q66 76 74 72 Z"/>${F('M60 70 Q52 84 50 100')}
      <path ${c('lats')} d="M82 84 Q68 92 66 112 Q66 142 78 162 Q88 172 99 176 L99 128 Q92 104 82 84 Z"/>${F('M80 96 Q74 120 80 150')}${F('M90 110 Q84 136 92 166')}
      <path ${c('tri')} d="M48 110 Q41 124 41 140 Q43 152 50 152 Q58 138 59 118 Q57 108 52 106 Z"/>${F('M53 112 Q50 130 51 148')}
      <path ${c('fore')} d="M42 156 Q34 178 31 210 L38 214 Q48 190 54 158 Z"/>${F('M46 162 Q40 182 36 206')}
      <path ${c('lower')} d="M90 166 L99 178 L99 198 L84 194 Q82 180 90 166 Z"/>
      <path ${c('glute')} d="M70 196 Q62 212 66 232 Q82 246 99 236 L99 202 Q86 192 70 196 Z"/>${F('M72 206 Q84 216 98 214')}${F('M70 222 Q84 232 98 228')}
      <path ${c('ham')} d="M66 240 Q60 266 64 292 Q74 306 86 302 Q94 278 94 246 Q80 248 66 240 Z"/>${F('M72 248 Q68 272 74 298')}${F('M84 250 Q86 276 84 300')}
      <path ${c('calf')} d="M64 312 Q56 336 62 360 Q72 374 82 362 Q86 336 80 312 Q72 306 64 312 Z"/>${F('M72 316 L72 362')}`);
  }
  return `<svg class="bsvg${mini?' mini':''}" viewBox="0 0 200 420" role="img" aria-label="Mapa muscular ${side==='f'?'de frente':'de espalda'}">${sk}${m}</svg>`;
}
function recoveryCard(full){
  const rec=recovery(),ready=[],tired=[];
  MAIN.forEach(r=>{const x=rec[r];if(x&&x.pct<67)tired.push(RNAME[r]);else ready.push(RNAME[r]);});
  const anyData=Object.values(rec).some(Boolean);
  let h=`<div class="card recov ${full?'':'mini'}" ${full?'':'data-act="tab" data-v="prog"'}><div class="bodies">${bodySVG('f',rec,!full)}${bodySVG('b',rec,!full)}</div><div class="rtxt">`;
  if(!anyData)h+=`<b>Todo listo</b><span>Cuando entrenes, aquí ves qué músculos están cansados y cuáles listos.</span>`;
  else h+=`<b>${tired.length?'Recuperando: '+tired.slice(0,4).join(', '):'Todos tus músculos están listos'}</b><span>${tired.length?'Listos: '+ready.slice(0,5).join(', '):'Buen momento para entrenar duro.'}</span>`;
  h+=`</div>${full?`<div class="rleg"><span><i class="r1"></i>Cansado</span><span><i class="r2"></i>Recuperando</span><span><i class="r3"></i>Casi</span><span><i class="r4"></i>Listo</span></div>`:''}</div>`;
  return h;
}
function setsCard(){
  const o=weekSets(7),mx=Math.max(20,...Object.values(o));
  return `<div class="card wsets"><div class="cap"><span>Series efectivas por músculo, últimos 7 días</span></div>${MAIN.map(r=>{const v=Math.round(o[r]*2)/2,pc=Math.min(100,v/mx*100),cls=v>=10&&v<=20?'ok':v>20?'hi':v>0?'lo':'';
    return `<div class="wsr"><span>${RNAME[r]}</span><span class="bar"><i class="band" style="left:${10/mx*100}%;width:${10/mx*100}%"></i><i class="fill ${cls}" style="width:${pc}%"></i></span><b>${NF.format(v)}</b></div>`;}).join('')}
  <p class="sub" style="font-size:.76rem;margin:8px 0 0">La franja marca 10 a 20 series por semana, el rango que más músculo construye. Los músculos secundarios cuentan media serie.</p></div>`;
}

/* ---------- fotos de progreso (IndexedDB) ---------- */
let IDB=null;
function idb(){if(IDB)return IDB;IDB=new Promise((res,rej)=>{try{const r=indexedDB.open('mancuernas',1);r.onupgradeneeded=()=>{r.result.createObjectStore('photos',{keyPath:'id'});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}catch(e){rej(e);}});return IDB;}
async function phAll(){try{const db=await idb();return await new Promise(res=>{const q=db.transaction('photos').objectStore('photos').getAll();q.onsuccess=()=>res((q.result||[]).sort((a,b)=>a.ts-b.ts));q.onerror=()=>res([]);});}catch(e){return [];}}
async function phPut(o){const db=await idb();return new Promise((res,rej)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(o);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
async function phDel(id){const db=await idb();return new Promise(res=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').delete(id);tx.oncomplete=res;tx.onerror=res;});}
let PH=[],PHURL={};
const phUrl=p=>PHURL[p.id]||(PHURL[p.id]=URL.createObjectURL(p.blob));
async function phLoad(){PH=await phAll();const el=$('#phgrid');if(el)el.innerHTML=phGrid();}
function phGrid(){
  if(!PH.length)return `<div class="phempty">${IC.cam}<span>Una foto cada 2 a 4 semanas, misma luz y misma pose. Es la mejor forma de ver el cambio.</span></div>`;
  const l=PH.slice(-6).reverse();
  return `<div class="phs">${l.map(p=>`<button data-act="phview" data-v="${p.id}"><img src="${phUrl(p)}" alt="Foto del ${new Date(p.ts).toLocaleDateString('es-CO')}"><small>${new Date(p.ts).toLocaleDateString('es-CO',{day:'numeric',month:'short'})}</small></button>`).join('')}</div>`;
}
function photosCard(){
  setTimeout(phLoad,0);
  return `<div class="card photos"><div id="phgrid">${phGrid()}</div><div class="phacts"><label class="btn sm ghost">${IC.cam}Tomar foto<input type="file" accept="image/*" capture="user" id="in-photo" hidden></label><label class="btn sm ghost">${IC.plus}De la galería<input type="file" accept="image/*" id="in-photo2" hidden></label>${PH.length>1?`<button class="btn sm pri" data-act="phcmp">Comparar</button>`:''}</div></div>`;
}
async function phAdd(file){
  try{const img=await createImageBitmap(file).catch(()=>null)||await loadImg(URL.createObjectURL(file));if(!img){toast('No se pudo leer la foto');return;}
    const k=Math.min(1,1280/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.85));const p={id:'ph'+Date.now(),ts:Date.now(),blob};await phPut(p);await phLoad();render();toast(IC.check+'<span>Foto guardada en este teléfono</span>');
  }catch(e){toast('No se pudo guardar la foto');}
}
function phView(id){const p=PH.find(x=>x.id===id);if(!p)return;
  sheet(`<div class="over">${cap1(new Date(p.ts).toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'}))}</div><img class="phbig" src="${phUrl(p)}" alt=""><div class="acts"><button class="btn" data-act="close">Cerrar</button><button class="btn ghost danger" data-act="phdel" data-v="${id}">Borrar foto</button></div>`);}
let CMP=null;
function phCompare(){
  if(PH.length<2)return;CMP=CMP||{a:PH[0].id,b:PH[PH.length-1].id};
  const A=PH.find(x=>x.id===CMP.a)||PH[0],B=PH.find(x=>x.id===CMP.b)||PH[PH.length-1];
  const dd=Math.round((B.ts-A.ts)/864e5);
  const opt=sel=>PH.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${new Date(p.ts).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'2-digit'})}</option>`).join('');
  sheet(`<h3>Antes y después</h3><p class="sub">${dd} días de diferencia. Desliza para comparar.</p>
  <div class="cmp"><img src="${phUrl(A)}" alt="Antes"><div class="cmpb" id="cmpb" style="clip-path:inset(0 0 0 50%)"><img src="${phUrl(B)}" alt="Después"></div><i id="cmpl" style="left:50%"></i><span class="t1">Antes</span><span class="t2">Después</span></div>
  <input type="range" id="in-cmp" min="0" max="100" value="50" aria-label="Comparar" style="width:100%;margin-top:10px">
  <div class="cmpsel"><label>Antes<select id="cmpa">${opt(A.id)}</select></label><label>Después<select id="cmpbsel">${opt(B.id)}</select></label></div>
  <div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);
}
document.addEventListener('input',ev=>{const t=ev.target;if(t.id==='in-cmp'){const v=t.value;const b=$('#cmpb'),l=$('#cmpl');if(b)b.style.clipPath=`inset(0 0 0 ${v}%)`;if(l)l.style.left=v+'%';}});
document.addEventListener('change',ev=>{const t=ev.target;
  if((t.id==='in-photo'||t.id==='in-photo2')&&t.files&&t.files[0]){phAdd(t.files[0]);t.value='';}
  else if(t.id==='cmpa'){CMP.a=t.value;phCompare();}else if(t.id==='cmpbsel'){CMP.b=t.value;phCompare();}});
function bodyAct(a,v){
  switch(a){
    case 'phview':phView(v);return true;
    case 'phdel':{const old=PH.find(x=>x.id===v);phDel(v).then(phLoad).then(()=>{closeSheet();render();if(old)undoable('Foto borrada',()=>{phPut(old).then(phLoad).then(render);});});return true;}
    case 'phcmp':CMP=null;phCompare();return true;
  }
  return false;
}

function muscleMap(n){const R=regionsOf(n);return `<div class="mmap">${bodySVG('f',{},true,R)}${bodySVG('b',{},true,R)}<div class="mleg"><span><i class="hp"></i>Principal</span><span><i class="hs"></i>Secundario</span></div></div>`;}
