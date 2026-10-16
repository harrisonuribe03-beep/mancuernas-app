/* Registro de comidas, parte 2:
   - Código de barras: escáner nativo de Google (sin permiso de cámara) o el número escrito a mano.
   - Productos de marca: base mundial Open Food Facts (por código o por nombre). Lo que encuentras queda en «Mis alimentos».
   - Recordatorios de comidas: solo si a esa hora aún no registraste esa comida (se reprograman para los próximos 7 días). */

IC.scan=I('<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M8 8v8M11 8v8M14 8v8M17 8v8"/>');

/* ---------- Open Food Facts ---------- */
const OFF='https://world.openfoodfacts.org';
const OFF_FIELDS='code,product_name,product_name_es,brands,nutriments,serving_quantity,serving_size,quantity';
async function offGet(url,ms){
  const c=typeof AbortController==='function'?new AbortController():null,t=c?setTimeout(()=>c.abort(),ms||12000):null;
  try{const r=await fetch(url,{signal:c?c.signal:undefined,headers:{Accept:'application/json'}});if(!r.ok)throw new Error('http '+r.status);return await r.json();}
  finally{if(t)clearTimeout(t);}
}
// Producto de Open Food Facts → alimento propio (valores por 100 g o 100 ml)
function offFood(p,code){
  if(!p)return null;const n=p.nutriments||{};let k=n['energy-kcal_100g'];
  if(k==null&&n['energy_100g']!=null)k=n['energy_100g']/4.184;if(k==null||isNaN(+k))return null;
  const name=String(p.product_name_es||p.product_name||'').trim();if(!name)return null;
  const br=String(p.brands||'').split(',')[0].trim(),qty=String(p.quantity||''),liq=/\d\s*(ml|cl|l)\b/i.test(qty)&&!/\d\s*(g|kg)\b/i.test(qty);
  const sq=parseFloat(p.serving_quantity),bc=String(code||p.code||'');
  return {id:'my-bc'+bc,bc,n:cap1(name)+(br&&!fnorm(name).includes(fnorm(br))?' · '+br:''),cat:'my',off:1,
    k:r1(+k),p:r1(+n.proteins_100g||0),c:r1(+n.carbohydrates_100g||0),f:r1(+n.fat_100g||0),fb:r1(+n.fiber_100g||0),liq,
    por:sq>0&&sq<2000?[['porción','porciones',Math.round(sq)]]:[],src:{per:'100',k:r1(+k),p:r1(+n.proteins_100g||0),c:r1(+n.carbohydrates_100g||0),f:r1(+n.fat_100g||0),fb:r1(+n.fiber_100g||0)}};
}
function offKeep(F){const i=S.flib.foods.findIndex(x=>x.id===F.id||(F.bc&&x.bc===F.bc));if(i>=0)return S.flib.foods[i];S.flib.foods.push(F);flibSave();return F;}
function fopenFood(F){const d=fdefault(F);portionSheet({k:FADD?FADD.k:fToday(),s:FADD?FADD.s:fslotNow(),f:F.id,u:d.u,q:d.q});}

/* ---------- código de barras ---------- */
async function fscan(){
  if(CAP&&NAT){let r;try{r=await NAT.scanBarcode({});}catch(e){r={error:String(e&&e.message||e)};}
    if(!r||r.cancel)return;
    if(r.error){if(/unimplemented|not implemented/i.test(r.error)){codeSheet();return;}
      toast(/download|module|descarg|unavailable/i.test(r.error)?'El escáner se está instalando en tu teléfono. Intenta otra vez en un minuto.':'No se pudo abrir el escáner. Escribe el número del código.');
      if(!/download|module|descarg|unavailable/i.test(r.error))codeSheet();return;}
    flookup(r.code);return;}
  codeSheet();
}
function codeSheet(v){
  sheet(`<h3>Código de barras</h3><p class="sub">Escribe los números que aparecen debajo de las barras del empaque.</p>
  <div class="bform"><label class="wide"><span>Código</span><input id="fbc" inputmode="numeric" value="${esc(v||'')}" placeholder="7702001..." autocomplete="off" maxlength="14"></label></div>
  <div class="acts"><button class="btn pri" data-act="fbcgo">Buscar producto</button><button class="btn" data-act="fbcback">Volver</button></div>`);
  setTimeout(()=>{const i=$('#fbc');if(i)try{i.focus();}catch(e){}},80);
}
async function flookup(code){
  code=String(code||'').replace(/\D/g,'');if(code.length<6){toast('Ese código no parece válido');return;}
  const mine=S.flib.foods.find(x=>x.bc===code);if(mine){fopenFood(mine);return;}
  sheet(`<div class="floading"><span class="spin" aria-hidden="true"></span><b>Buscando el producto…</b><small>Código ${esc(code)}</small></div>`);
  let F=null,err=false;
  try{const j=await offGet(`${OFF}/api/v2/product/${code}.json?fields=${OFF_FIELDS}`);if(j&&j.status===1)F=offFood(j.product,code);}catch(e){err=true;}
  if($('#sheet').hidden)return; // la persona cerró la hoja mientras buscábamos
  if(F){F=offKeep(F);fopenFood(F);toast(IC.check+'<span>Producto guardado en «Mis alimentos»</span>');return;}
  sheet(`<h3>${err?'Sin conexión':'No encontramos el producto'}</h3><p class="sub">${err?'Revisa tu internet e intenta otra vez.':'Ese código no está en la base de productos o no tiene la tabla nutricional.'} Puedes crearlo con los datos de la etiqueta: la próxima vez que lo escanees aparece de una.</p>
  <div class="acts">${err?`<button class="btn pri" data-act="fbclook" data-v="${code}">Intentar otra vez</button>`:''}<button class="btn ${err?'':'pri'}" data-act="fbcnew" data-v="${code}">${IC.plus}Crear con la etiqueta</button><button class="btn" data-act="fbcback">Volver</button></div>`);
}

/* ---------- buscar productos de marca por nombre ---------- */
let FON=null;
function fonlineBlock(q){
  const on=FON&&FON.q===q?FON:null;
  if(!on)return `<button class="fonline" data-act="fonline">${IC.search}<span><b>Buscar «${esc(q)}» en productos de marca</b><small>Base mundial Open Food Facts · necesita internet</small></span></button>`;
  if(on.st==='load')return `<div class="floading sm"><span class="spin" aria-hidden="true"></span><b>Buscando productos de marca…</b></div>`;
  if(on.st==='err')return `<div class="fempty"><b>No se pudo buscar</b><span>Revisa tu conexión.</span><button class="btn sm ghost" data-act="fonline">Intentar otra vez</button></div>`;
  if(!on.items.length)return `<div class="fempty"><b>Sin productos de marca con ese nombre</b><span>Prueba con la marca o escanea el código de barras.</span></div>`;
  return `<div class="over fonh">Productos de marca</div><ul class="flist">${on.items.map((F,i)=>{const P=funits(F)[0],m=fcalc(F,fbase(P)?100:1,0);
    return `<li><button class="frow" data-act="foffpick" data-v="${i}"><span><b>${esc(F.n)}</b><small>${fbase(P)?'100 '+P[0]:'1 porción · '+NF.format(P[2])+' '+(F.liq?'ml':'g')}</small></span><em>${fk(m.k)}<small> kcal</small></em></button></li>`;}).join('')}</ul>
    <p class="fnote">Datos de Open Food Facts, aportados por personas. Revisa que coincidan con la etiqueta.</p>`;
}
async function fonline(q){
  FON={q,st:'load',items:[]};const l=$('#faddlist');if(l)l.innerHTML=addList();
  const base=`${OFF}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=30&fields=${OFF_FIELDS}`;
  try{let j=await offGet(base+'&tagtype_0=countries&tag_contains_0=contains&tag_0=colombia');
    let P=(j&&j.products)||[];if(P.length<4){const j2=await offGet(base);P=P.concat((j2&&j2.products)||[]);}
    const seen=new Set(),items=[];P.forEach(p=>{const F=offFood(p,p.code);if(F&&F.bc&&!seen.has(F.bc)){seen.add(F.bc);items.push(F);}});
    if(FON&&FON.q===q){FON.st='ok';FON.items=items.slice(0,20);}}
  catch(e){if(FON&&FON.q===q)FON.st='err';}
  const l2=$('#faddlist');if(l2&&FADD&&FADD.q.trim()===q)l2.innerHTML=addList();
}

/* ---------- recordatorios de comidas ---------- */
const FRT={des:'08:00',mm:'10:30',alm:'13:00',onc:'16:30',cen:'19:30'};
const FRTX={des:['¿Ya desayunaste?','Registra tu desayuno: toma 10 segundos.'],mm:['Media mañana','Si comiste algo, regístralo para llevar tus calorías al día.'],
  alm:['¿Ya almorzaste?','Registra tu almuerzo y mira cuánta proteína te falta.'],onc:['Hora de las onces','Si comiste algo, regístralo.'],cen:['¿Ya cenaste?','Registra la cena y cierra el día con tus números completos.']};
const FREMIDS=[];for(let d=0;d<7;d++)for(let i=0;i<5;i++)FREMIDS.push(9000+d*10+i);
async function scheduleMealRem(){
  if(!LN)return;
  try{await LN.cancel({notifications:FREMIDS.map(id=>({id}))});}catch(e){}
  if(!S.settings.mealRem)return;
  const P=fslotsPlan(),T=S.settings.mealTimes||{},now=Date.now(),list=[],today=fToday();
  for(let d=0;d<7;d++){const k=fdShift(today,d),day=S.food[k];
    P.forEach((s,i)=>{const [h,m]=String(T[s]||FRT[s]).split(':').map(Number),at=fdDate(k);at.setHours(h||0,m||0,0,0);
      if(at.getTime()<=now+60e3)return;if(day&&day.items&&day.items.some(x=>x.s===s))return;
      list.push({id:9000+d*10+i,title:FRTX[s][0],body:FRTX[s][1],schedule:{at,allowWhileIdle:true},extra:{food:s}});});}
  if(list.length)call(LN,'schedule',{notifications:list});
}
let FREMT=null;
function fremDirty(){if(!LN||!S.settings.mealRem)return;clearTimeout(FREMT);FREMT=setTimeout(scheduleMealRem,1500);}
function fremPrefs(){
  if(!CAP)return '';const st=S.settings,T=st.mealTimes||{};
  return `<div class="set inline"><span class="lb">Recordarme registrar mis comidas<small>Solo si a esa hora aún no la has registrado</small></span><button class="sw" data-act="fremtog" aria-pressed="${!!st.mealRem}" aria-label="Recordatorios de comidas"></button></div>
  ${st.mealRem?`<div class="fremt">${fslotsPlan().map(s=>`<label><span>${FSLOT[s]}</span><input type="time" class="tinput" data-frem="${s}" value="${esc(T[s]||FRT[s])}"></label>`).join('')}</div>`:''}`;
}
function launchFood(s){if(!S.settings.onb||!myNutri())return;if(!$('#sheet').hidden)closeSheet(true);S.tab='plan';S.planTab='food';S.ftab='diario';S.fdate=fToday();render();if(!S.live)addSheet(s||fslotNow(),fToday());}
if(LN&&typeof LN.addListener==='function'){try{LN.addListener('localNotificationActionPerformed',e=>{const x=e&&e.notification&&e.notification.extra;if(x&&x.food)setTimeout(()=>launchFood(x.food),300);});}catch(e){}}
if(CAP){setTimeout(scheduleMealRem,2500);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')fremDirty();});}
document.addEventListener('change',ev=>{const t=ev.target;if(t.matches&&t.matches('input[data-frem]')&&t.value){const T=S.settings.mealTimes||(S.settings.mealTimes={});T[t.dataset.frem]=t.value;saveSettings();scheduleMealRem();toast(`${FSLOT[t.dataset.frem]}: recordatorio a las ${t.value}`);}});
document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.id==='fbc'){ev.preventDefault();fplusAct('fbcgo');}});

/* ---------- exportar el registro (CSV para Excel o para tu nutricionista) ---------- */
async function exportFoodCsv(){
  const ks=Object.keys(S.food).filter(k=>(S.food[k].items||[]).length||S.food[k].water).sort();
  if(!ks.length){toast('Aún no hay comidas registradas');return;}
  const n=x=>String(Math.round((x||0)*10)/10).replace('.',','),q=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"';
  const rows=[['Fecha','Comida','Alimento','Cantidad','Gramos o ml','Calorías (kcal)','Proteína (g)','Carbohidratos (g)','Grasas (g)','Fibra (g)'].map(q).join(';')];
  ks.forEach(k=>{const D=S.food[k];Object.keys(FSLOT).forEach(s=>(D.items||[]).filter(i=>i.s===s).forEach(i=>rows.push([k,FSLOT[s],i.n,i.qt||'',i.w||'',n(i.k),n(i.p),n(i.c),n(i.fat),n(i.fib)].map((x,j)=>j>=5?x:q(x)).join(';'))));
    const t=ftot(D.items||[]);rows.push([k,'Total del día','','',(D.water?`agua ${n(D.water/1000)} L`:''),n(t.k),n(t.p),n(t.c),n(t.fat),n(t.fib)].map((x,j)=>j>=5?x:q(x)).join(';'));});
  const csv='\ufeff'+rows.join('\r\n'),d=new Date(),name=`mancuernas-comidas-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.csv`;
  try{if(FSP&&SHP){const r=await FSP.writeFile({path:name,data:csv,directory:'CACHE',encoding:'utf8'});await SHP.share({title:'Mi registro de comidas',files:[r.uri],dialogTitle:'Guardar o enviar'});return;}
    const r=await webSave(name,new Blob([csv],{type:'text/csv'}));if(r==='saved')toast('Archivo guardado');}
  catch(e){if(!/cancel|abort/i.test(String(e&&e.message||e)))toast('No se pudo exportar');}
}

function fplusAct(a,v){
  switch(a){
    case 'fscan':fscan();return true;
    case 'fcsv':exportFoodCsv();return true;
    case 'fbcgo':{const i=$('#fbc');flookup(i?i.value:'');return true;}
    case 'fbclook':flookup(v);return true;
    case 'fbcnew':newFoodSheet({bc:v,n:''});return true;
    case 'fbcback':if(FADD)renderAdd();else closeSheet();return true;
    case 'fonline':{const q=(FADD&&FADD.q||'').trim();if(q.length<2)return true;fonline(q);return true;}
    case 'foffpick':{const F0=FON&&FON.items[+v];if(!F0)return true;const F=offKeep(F0);fopenFood(F);return true;}
    case 'fremtog':{const st=S.settings;st.mealRem=!st.mealRem;saveSettings();render();
      if(st.mealRem&&LN){(async()=>{try{const p=await LN.checkPermissions();if(p.display!=='granted'){const q=await LN.requestPermissions();if(q.display!=='granted'){toast('Activa las notificaciones de la app para recibir los recordatorios');return;}}}catch(e){}
        scheduleMealRem();toast(IC.bell+'<span>Te recordaremos registrar tus comidas</span>');})();}
      else scheduleMealRem();return true;}
  }
  return false;
}
