
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
/* Cuerpo anatómico (7.2): ilustración realista en gris y, encima, cada músculo en rojo.
   Más rojo = más cansado (r1 cansado, r2 recuperando, r3 casi). Gris = listo o sin datos. */
const ANURL={};
function anUrl(u){if(ANURL[u])return ANURL[u];try{const b=atob(u.split(',')[1]),n=new Uint8Array(b.length);for(let i=0;i<b.length;i++)n[i]=b.charCodeAt(i);ANURL[u]=URL.createObjectURL(new Blob([n],{type:'image/webp'}));}catch(e){ANURL[u]=u;}return ANURL[u];}
function bodySVG(side,rec,mini,hl){
  const A=ANAT[side];if(!A)return '';
  const lv=r=>hl?(hl[r]===1?'hp':hl[r]?'hs':''):recCls(rec[r]);
  const ov=Object.keys(A.r).map(r=>{const [x,y,w,h,u]=A.r[r],c=lv(r);return c&&c!=='rn'&&c!=='r4'?`<image class="ov ${c}" x="${x}" y="${y}" width="${w}" height="${h}" href="${anUrl(u)}"/>`:'';}).join('');
  const hit=!mini&&!hl&&A.p?Object.keys(A.p).map(r=>`<path class="hit" d="${A.p[r]}" data-act="muscle" data-v="${r}"><title>${RNAME[r]||r}</title></path>`).join(''):'';
  return `<svg class="bsvg anat${mini?' mini':''}" viewBox="0 0 ${A.w} ${A.h}" role="img" aria-label="Mapa muscular ${side==='f'?'de frente':'de espalda'}${hit?'. Toca un músculo para ver detalles':''}"><image width="${A.w}" height="${A.h}" href="${anUrl(A.base)}"/>${ov}${hit}</svg>`;
}
/* 7.2: tocar un músculo → cuándo lo entrenaste, cómo va y ejercicios para él */
const RGROUP={chest:'Pecho',lats:'Espalda',traps:'Espalda',lower:'Espalda',delt:'Hombro',rdelt:'Hombro',bi:'Brazos',tri:'Brazos',fore:'Brazos',quad:'Piernas',ham:'Piernas',glute:'Piernas',calf:'Piernas',add:'Piernas',abs:'Core',obl:'Core'};
function muscleSheet(r){
  const x=recovery()[r],ws=weekSets(7)[r],nm=RNAME[r]||r;
  const st=!x?'Sin entrenar en los últimos 8 días':x.pct>=100?'Listo para entrenar':x.pct>=67?'Casi recuperado':x.pct>=34?'Recuperándose':'Cansado';
  const ago=x?(x.hrs<24?`hace ${Math.max(1,Math.round(x.hrs))} h`:`hace ${Math.round(x.hrs/24)} ${Math.round(x.hrs/24)===1?'día':'días'}`):'';
  const ex=ALLEX.filter(e=>regionsOf(e.n)[r]===1&&canDo(e)).slice(0,6);
  sheet(`<div class="over">Músculo</div><h3>${nm}</h3>
  <div class="mstat"><div><b class="${recCls(x)}">${x?Math.min(100,x.pct)+'%':'100%'}</b><span>recuperado</span></div><div><b>${ago||'—'}</b><span>último entreno</span></div><div><b>${ws!=null?NF.format(Math.round(ws*10)/10):'—'}</b><span>series esta semana</span></div></div>
  <p class="sub" style="margin:10px 0 0"><b style="color:var(--tx)">${st}.</b> ${x&&x.pct<67?'Dale descanso o entrena otra zona hoy.':'Lo puedes entrenar hoy.'}</p>
  ${ex.length?`<h2 class="h2">Ejercicios para ${nm.toLowerCase()} <small>con tu equipo</small></h2><ul class="glist exlist">${ex.map(e=>exRow(e,info(e.n).m.join(', '))).join('')}</ul>`:''}
  <div class="acts">${RGROUP[r]?`<button class="btn pri" data-act="freemus" data-v="${RGROUP[r]}">${IC.play}Entreno libre de ${RGROUP[r].toLowerCase()}</button>`:''}<button class="btn" data-act="close">Cerrar</button></div>`);
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
  if(a==='muscle'){muscleSheet(v);return true;}
  if(a==='freemus'){FREE.g=[v];FREE.seed++;freeSheet(true);return true;}
  switch(a){
    case 'phview':phView(v);return true;
    case 'phdel':{const old=PH.find(x=>x.id===v);phDel(v).then(phLoad).then(()=>{closeSheet();render();if(old)undoable('Foto borrada',()=>{phPut(old).then(phLoad).then(render);});});return true;}
    case 'phcmp':CMP=null;phCompare();return true;
  }
  return false;
}

function muscleMap(n){const R=regionsOf(n);return `<div class="mmap">${bodySVG('f',{},true,R)}${bodySVG('b',{},true,R)}<div class="mleg"><span><i class="hp"></i>Principal</span><span><i class="hs"></i>Secundario</span></div></div>`;}
