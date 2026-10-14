
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
function bodySVG(side,rec,mini,hl){
  const c=r=>hl?`class="mu ${hl[r]===1?'hp':hl[r]?'hs':'rn'}" data-r="${r}"`:`class="mu ${recCls(rec[r])}" data-r="${r}"`;
  const M=(inner)=>`<g>${inner}</g><g transform="translate(120,0) scale(-1,1)">${inner}</g>`;
  const base=`<g class="sk"><ellipse cx="60" cy="17" rx="10.5" ry="12.5"/><rect x="54.5" y="26" width="11" height="12" rx="3"/><path d="M42 39 Q60 35 78 39 L80 70 Q80 96 77 112 L80 132 Q60 141 40 132 L43 112 Q40 96 40 70 Z" stroke-linejoin="round"/>
    ${M(`<path d="M37 46 L30 88 L22 121" fill="none" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" class="limb"/><ellipse cx="21" cy="128" rx="4.6" ry="7"/><path d="M49 132 L47.5 186 L46 232" fill="none" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" class="limb"/><ellipse cx="46.5" cy="238" rx="7.5" ry="4.2"/>`)}</g>`;
  let m='';
  if(side==='f'){
    m=M(`<path ${c('traps')} d="M55 33 Q47 37 41 41 L55 41 Z"/>
      <path ${c('delt')} d="M40 41 Q29 42 27 55 Q28 62 31 63 Q35 52 43 47 Z"/>
      <path ${c('chest')} d="M59 43 L44 45 Q35 52 37 62 Q46 70 59 66 Z"/>
      <path ${c('bi')} d="M30 64 Q24 74 26 86 Q30 89 34 86 Q37 75 36 63 Z"/>
      <path ${c('fore')} d="M26 89 Q20 103 19 119 L24 120 Q30 106 33 90 Z"/>
      <path ${c('abs')} d="M51.5 69 h7.5 v10 h-7.5 Z M51.5 81 h7.5 v10 h-7.5 Z M51.5 93 h7.5 v10 h-7.5 Z M51.5 105 h7.5 v14 q-4 0 -7.5 -4 Z"/>
      <path ${c('obl')} d="M49.5 68 Q41 74 41 90 Q41 104 46 114 L49.5 116 Z"/>
      <path ${c('quad')} d="M43 129 Q37 148 40 170 Q43 181 50 181 Q55 172 56 152 Q57 138 55 134 Z"/>
      <path ${c('add')} d="M57.5 135 Q59.5 150 57 168 L55.5 170 Q57.5 150 56 136 Z"/>
      <path ${c('calf')} d="M42 194 Q38 210 42 228 L48 230 Q52 212 51 194 Z"/>`);
  }else{
    m=M(`<path ${c('traps')} d="M60 30 L48 38 Q42 41 43 46 L50 60 L60 66 Z"/>
      <path ${c('rdelt')} d="M42 42 Q29 42 27 55 Q28 62 31 63 Q36 52 43 48 Z"/>
      <path ${c('lats')} d="M48 60 Q41 64 41 72 Q42 88 50 98 L59 100 L59 68 Z"/>
      <path ${c('tri')} d="M30 64 Q24 74 26 86 Q30 89 34 86 Q37 75 36 63 Z"/>
      <path ${c('fore')} d="M26 89 Q20 103 19 119 L24 120 Q30 106 33 90 Z"/>
      <path ${c('lower')} d="M51 101 L59 102 L59 116 L50 114 Q48 108 51 101 Z"/>
      <path ${c('glute')} d="M44 116 Q40 126 44 134 Q52 140 59.5 134 L59.5 118 Q52 114 44 116 Z"/>
      <path ${c('ham')} d="M43 137 Q38 156 42 178 Q48 183 53 180 Q57 160 57 141 Q50 141 43 137 Z"/>
      <path ${c('calf')} d="M41 193 Q36 206 40 220 Q45 228 50 220 Q53 205 51 193 Z"/>`);
  }
  return `<svg class="bsvg${mini?' mini':''}" viewBox="0 0 120 246" role="img" aria-label="Mapa muscular ${side==='f'?'de frente':'de espalda'}">${base}${m}</svg>`;
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
