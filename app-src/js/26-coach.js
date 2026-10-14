/* Coach de voz: qué dice y cuándo.
   Las frases usan el habla paisa (voseo, "pues", "berraquera") y se arman con segmentos cortos.
   __voiceCatalog() enumera todos los segmentos posibles: con esa lista se graban los clips (app-src/audio). */

const VZ={
  go:['¡Hágale pues!','¡A darle!','¡Vamos pues!','¡De una, arrancá!','¡Con toda!','¡Dale, que vos podés!','¡Arriba, que sí se puede!','¡Vamos pues, mij{o|a}!'],
  setOk:['¡Eso es!','¡Qué berraquera!','¡Bien pueda!','¡Así se hace!','¡Muy bien, parce!','¡Severo!','¡Uy, qué serie tan buena!','¡Esa estuvo limpiecita!','¡Ave María, qué fuerza!','¡Me encanta esa técnica!','¡Vas volando!','¡Qué nivel!','¡Eso es, mij{o|a}!','¡Bien hecho, mij{o|a}!','¡Sos una máquina!'],
  rest:['Respirá hondo.','Tomate un traguito de agua.','Soltá los brazos y relajá.','Vas muy bien, no aflojés.','Buenísima esa serie.','Respirá por la nariz y soltá despacio.','Pensá en la técnica de la próxima.','Tranquil{o|a}, que vamos bien.'],
  restTen:['Diez segunditos.','Alistate, diez segundos.','Diez segundos, preparate.'],
  timedGo:['¡Ya!','¡Arrancá!','¡Dale!'],
  timedHalf:['¡Mitad! Aguantá.','Ya vas por la mitad, ¡no aflojés!','¡Mitad! Respirá y seguí.'],
  timedEnd:['¡Tiempo!','¡Listo, tiempo!','¡Y tiempo!'],
  prIntro:['¡Ave María, nuevo récord!','¡Uy, récord personal!','¡Récord nuevo, qué berraquera!','¡Nuevo récord! Así es que es.','¡Ave María, mij{o|a}, nuevo récord!'],
  first:['Arrancamos con','Empecemos con','Primero:'],
  next:['Sigue','Ahora vamos con','Lo que sigue:','Pasamos a'],
  ss:['Sin descanso, ahora','De una, sigue'],
  warmIntro:['Calentemos primero, sin afanes.','Primero calentamos. Movete suave.'],
  fin:['¡Entreno completado!','¡Terminamos, qué berraquera!','¡Listo el entreno de hoy!','¡Coronamos!'],
  finEnd:['Estoy muy orgullosa de vos.','Estoy muy orgullosa de vos, mij{o|a}.','Te lo ganaste, ahora a descansar.','Así es que se construye, de a poquito.','Mañana el cuerpo te lo agradece.','Nos vemos en el próximo, ¡no me fallés!'],
  seqPrep:['Preparate.','Alistate.'],
  seqRest:['Descansá.','Respirá.'],
  seqHalf:['¡Mitad!','¡Mitad, no aflojés!','¡Mitad, aguantá!'],
  seqWork:['¡Dale!','¡Vamos!','¡Con toda!'],
  seqFin:{hiit:'¡Intervalos completados!',abs:'¡Abdomen listo!',stretch:'¡Estiramiento completo!',mob:'¡Movilidad lista!'},
  seqFinEnd:['¡Buen trabajo!','¡Qué berraquera!','¡Así me gusta!'],
  single:{seqFirst:'Primero:',seqNext:'Lo que sigue:',seqLong:'Descanso largo.',sideR:'Lado derecho.',sideL:'Ahora el lado izquierdo.',fail:'Hasta que la técnica aguante.',
    modeFull:'¡Coach completo activado! Te acompaño toda la sesión.',modeBasic:'Listo, te aviso cada serie y cada cambio.',rate:'Así hablo a esta velocidad.',
    hi:'¡Hola! Soy Salomé, tu coach.',hi2:'¿List{o|a} para entrenar?',hiTel:'Hola, esta es la voz de tu teléfono.'},
  name:[n=>`¡Vamos, ${n}!`,n=>`¡Eso es, ${n}!`,n=>`${n}, vos podés.`,n=>`¡Hola, ${n}!`,n=>`Muy bien, ${n}.`]
};
/* Indicaciones habladas de estiramientos y movilidad (más cortas que las escritas) */
const VCUE={
  'Pecho en el marco de una puerta':'Antebrazo en el marco y girá el cuerpo hacia afuera.',
  'Hombro cruzado':'Brazo recto al otro lado y empujá suave por encima del codo.',
  'Tríceps sobre la cabeza':'Codo arriba y empujalo suave con la otra mano.',
  'Postura del niño':'Glúteos a los talones, brazos al frente. Respirá lento.',
  'Gato-camello':'Redondeá y arqueá la espalda, despacito.',
  'Dorsal de lado':'Brazo arriba y inclinate hacia el otro lado.',
  'Bíceps en la pared':'Palma en la pared y girá el cuerpo hacia afuera.',
  'Rotación torácica en el piso':'Abrí el brazo como un libro y seguilo con la mirada.',
  'Cuádriceps de pie':'Talón al glúteo, rodillas juntas.',
  'Isquiotibiales sentado':'Espalda recta e inclinate desde la cadera.',
  'Glúteo en figura 4':'Tobillo sobre la rodilla y jalá la pierna hacia el pecho.',
  'Pantorrilla en la pared':'Talón de atrás en el piso y rodilla estirada.',
  'Flexor de cadera en zancada':'Rodilla atrás en el piso y empujá la cadera adelante.',
  'Mariposa':'Plantas juntas y dejá caer las rodillas.',
  'Cuello lateral':'Oreja hacia el hombro, sin subir el otro.',
  'Respiración profunda':'Inhalá en cuatro tiempos y soltá en seis.',
  'Círculos de brazos':'Grandes y lentos, adelante y atrás.',
  'El mejor estiramiento del mundo':'Zancada, mano al piso y abrí el brazo al techo.',
  'Círculos de cadera':'Manos en la cintura, círculos amplios.',
  'Rotación torácica':'Mano en la nuca y abrí el codo al techo.',
  'Sentadilla profunda sostenida':'Talones en el piso y codos empujando las rodillas.',
  'Balanceo de piernas':'Apoyate en la pared y balanceá la pierna, sin forzar.',
  'Tobillo a la pared':'Rodilla hacia la pared sin despegar el talón.'
};

/* ---------- segmentos con números ---------- */
/* Variantes por sexo: "mij{o|a}" → "mijo" o "mija". Sin sexo elegido se omiten esas frases. */
const GZ=/\{([^|{}]*)\|([^|{}]*)\}/g;
const vsex=()=>S.settings.sex==='m'?'m':S.settings.sex==='h'?'h':'';
const gz=t=>t.replace(GZ,(_,a,b)=>vsex()==='m'?b:a);
const VLAST={};
function vpick(key,list){if(!vsex())list=list.filter(t=>!t.includes('{'));let i=Math.floor(Math.random()*list.length);if(list.length>1&&i===VLAST[key])i=(i+1)%list.length;VLAST[key]=i;return gz(list[i]);}
const VS={
  serie:(k,n)=>n===1?'Una sola serie.':k===n?'¡Última serie!':`Serie ${k} de ${n}.`,
  nSeries:n=>n===1?'Una serie.':`${n} series.`,
  kg:x=>{x=Math.round(x*2)/2;const e=Math.floor(x),h=x-e>0;if(!e)return 'Medio kilo,';return (e===1?'Un kilo':e+' kilos')+(h?' y medio':'')+',';},
  reps:(r,side)=>side?`${r} por ${side}.`:r===1?'Una repetición.':`${r} repeticiones.`,
  secs:(s,side)=>`${s} segundos${side?' por '+side:''}.`,
  dur:s=>{if(s<60)return `${s} segundos`;const m=Math.floor(s/60),r=s%60,mm=m===1?'un minuto':m+' minutos';return r===0?mm:r===30?mm+' y medio':`${mm} y ${r} segundos`;},
  rest:s=>`Descansá ${VS.dur(Math.max(5,Math.round(s/5)*5))}.`,
  minutes:m=>m===1?'Un minuto,':`${m} minutos,`,
  setsDone:s=>s===1?'y una serie.':`y ${s} series.`,
  prs:n=>n===1?'Lograste un récord.':`Lograste ${n} récords.`,
  level:n=>`¡Subiste a nivel ${n}!`,
  rank:r=>`¡Nuevo rango: ${r}!`,
  block:n=>`Bloque ${n} a continuación.`,
  ex:n=>(VSAY[n]||n)+'.'
};
/* Cómo se pronuncian en voz alta algunos nombres en inglés */
const VSAY={'Burpees':'Burpis','Bird dog':'Berd dog','Jumping jacks':'Saltos de tijera','Russian twist':'Giro ruso','Step-ups':'Subidas al escalón','Swing con mancuerna':'Suin con mancuerna',
  'Face pull con banda':'Feis pul con banda','Face pull en polea':'Feis pul en polea','Hollow hold':'Jólou jold','Pallof press con banda':'Pálof pres con banda','Pallof press en polea':'Pálof pres en polea',
  'Hip thrust con barra':'Jip trast con barra','Hip thrust con mancuerna':'Jip trast con mancuerna','Sentadilla en Smith':'Sentadilla en Esmit','Press inclinado en Smith':'Press inclinado en Esmit',
  'Swing con kettlebell':'Suin con kételbel','Aperturas en pec deck':'Aperturas en pec dec','Pájaros en pec deck':'Pájaros en pec dec','Y-T-W boca abajo':'Ye, te, doble ve, boca abajo',
  'Crunch':'Cranch','Crunch en polea':'Cranch en polea','Sentadilla hack':'Sentadilla jak'};
// Segmento con el nombre de la persona: solo si hay clip grabado para ese nombre (o si usa la voz del teléfono)
function vname(i){const n=(S.settings.name||'').trim().split(/\s+/)[0];if(!n)return '';const t=VZ.name[i](n);return !useClips()||hasClip(t)?t:'';}
function warmDose(s){const m=/^(\d+)\s*(min|s|reps|por (\w+))$/.exec(s.trim());if(!m)return '';const n=+m[1];
  if(m[2]==='min')return n===1?'Un minuto.':`${n} minutos.`;if(m[2]==='s')return VS.secs(n);if(m[2]==='reps')return VS.reps(n);return VS.reps(n,m[3]);}
function targetSegs(it,k){
  const e=exOf(it),ds=dose(e),s=it.sets[k];if(!s)return [];
  if(ds.timed)return [VS.secs(Math.round((+s.reps||ds.timed)/5)*5||ds.timed,ds.side)];
  if(isBW(e))return [ds.fail?VZ.single.fail:VS.reps(+s.reps||ds.target,ds.side)];
  return [s.kg?VS.kg(+s.kg):'',VS.reps(+s.reps||ds.target,ds.side)];
}
const setSegs=(it,k)=>[VS.serie(k+1,it.sets.length),...targetSegs(it,k)];
const exSegs=it=>[VS.ex(it.n),VS.nSeries(it.sets.length)];

/* ---------- eventos del entrenamiento ---------- */
const V={
  restStart(e,secs){speakSegs([VS.rest(secs),Math.random()<.55?vpick('rest',VZ.rest):''],{full:true});},
  restTen(){speakSegs([vpick('ten',VZ.restTen)],{full:true});},
  restEnd(){const L=S.live;if(!L)return;const it=L.items[L.i],k=curRow(it);if(k<0)return;
    const full=(S.settings.voice||'basic')==='full';
    speakSegs([full?vpick('go',VZ.go):'',...(k===0?exSegs(it):[]),...setSegs(it,k)]);},
  nextEx(it){speakSegs([vpick('next',VZ.next),...exSegs(it),...targetSegs(it,0)]);},
  ss(it){const k=curRow(it);speakSegs([vpick('ss',VZ.ss),VS.ex(it.n),...(k>=0?targetSegs(it,k):[])]);},
  pr(n){speakSegs([vpick('pr',VZ.prIntro),VS.ex(n),Math.random()<.5?vname(1):'']);},
  setDone(){if(Math.random()<.4)speakSegs([vpick('ok',VZ.setOk)],{full:true});},
  timedGo(){speakSegs([vpick('tgo',VZ.timedGo)],{full:true});},
  timedHalf(){speakSegs([vpick('thalf',VZ.timedHalf)],{full:true});},
  timedEnd(){speakSegs([vpick('tend',VZ.timedEnd)],{full:true});},
  warmStep(w,i){speakSegs([i===0&&(S.settings.voice||'basic')==='full'?vpick('wi',VZ.warmIntro):'',VS.ex(w[0]),warmDose(w[1])]);},
  first(it){speakSegs([vname(0),vpick('first',VZ.first),...exSegs(it),...setSegs(it,0).slice(1)]);},
  finish(r,lv0,lv1){const m=Math.max(1,Math.round(r.dur/60));
    speakSegs([vpick('fin',VZ.fin),VS.minutes(m),VS.setsDone(r.sets),r.pr.length?VS.prs(r.pr.length):'',
      lv1.lv>lv0.lv?(lv1.ri>lv0.ri?VS.rank(lv1.rank):VS.level(lv1.lv)):'',vname(4)||'',vpick('fe',VZ.finEnd)]);},
  // Rutinas guiadas (intervalos, abdomen, estiramientos, movilidad)
  seqStep(q,st,i){
    const base=st.t.replace(/ · (derecha|izquierda)$/,''),side=(/ · (derecha|izquierda)$/.exec(st.t)||[])[1];
    if(st.k==='work'){
      if(q.kind==='stretch'||q.kind==='mob'){
        if(side==='izquierda')return speakSegs([VZ.single.sideL]);
        return speakSegs([VS.ex(base),side?VZ.single.sideR:'',VCUE[base]||'']);}
      return speakSegs(st.t==='¡Trabajo!'?[vpick('sw',VZ.seqWork)]:[Math.random()<.5?vpick('sw',VZ.seqWork):'',VS.ex(st.t)]);}
    if(st.k==='rest'){if(st.d<10)return;const nx=q.steps[i+1];
      if(st.t==='Descanso largo'){const b=/Bloque (\d+)/.exec(st.sub);return speakSegs([VZ.single.seqLong,b?VS.block(+b[1]):''],{full:true});}
      return speakSegs([vpick('sr',VZ.seqRest),nx&&nx.t!=='¡Trabajo!'?VZ.single.seqNext:'',nx&&nx.t!=='¡Trabajo!'?VS.ex(nx.t.replace(/ · (derecha|izquierda)$/,'')):''],{full:true});}
    const nx=q.steps[i+1];speakSegs([vpick('sp',VZ.seqPrep),nx&&nx.t!=='¡Trabajo!'?VZ.single.seqFirst:'',nx&&nx.t!=='¡Trabajo!'?VS.ex(nx.t.replace(/ · (derecha|izquierda)$/,'')):'']);
  },
  seqHalf(){speakSegs([vpick('sh',VZ.seqHalf)],{full:true});},
  seqFinish(kind){speakSegs([VZ.seqFin[kind]||VZ.seqFin.hiit,vpick('sfe',VZ.seqFinEnd)]);},
  // Ajustes
  mode(m){speakSegs([m==='full'?VZ.single.modeFull:VZ.single.modeBasic]);},
  rate(){speakSegs([VZ.single.rate]);},
  sample(){if(!useClips()){say(VZ.single.hiTel+' Serie 2 de 4. 8 kilos, 10 repeticiones.');return;}
    speakSegs([vname(3)||VZ.single.hi,vname(3)?VZ.single.hi:'',vsex()?gz(VZ.single.hi2):'',VS.serie(2,4),VS.kg(8),VS.reps(10),vpick('go',VZ.go)]);}
};

/* ---------- catálogo para grabar los clips ---------- */
window.__voiceCatalog=function(names){
  const out={},add=(t,style)=>{if(!t)return;if(t.includes('{')){add(t.replace(GZ,'$1'),style);add(t.replace(GZ,'$2'),style);return;}out[vhash(t)]={t,s:style||'info'};};
  const hype=['go','setOk','timedGo','timedHalf','timedEnd','prIntro','fin','seqHalf','seqWork','seqFinEnd'];
  for(const k in VZ){const v=VZ[k];if(Array.isArray(v)&&typeof v[0]==='string')v.forEach(t=>add(t,hype.includes(k)?'hype':k==='rest'||k==='finEnd'||k==='warmIntro'?'calm':'info'));}
  Object.values(VZ.seqFin).forEach(t=>add(t,'hype'));
  Object.entries(VZ.single).forEach(([k,t])=>add(t,k==='modeFull'||k==='hi'?'hype':'info'));
  Object.values(VCUE).forEach(t=>add(t,'calm'));
  (names||[]).forEach(n=>VZ.name.forEach((f,i)=>add(f(n),i===2||i===4?'info':'hype')));
  for(let n=1;n<=10;n++){add(VS.nSeries(n));for(let k=1;k<=n;k++)add(VS.serie(k,n),k===n&&n>1?'hype':'info');}
  for(let x=0.5;x<=80;x+=0.5)add(VS.kg(x));
  const sides=[null,'lado','pierna','brazo'];
  for(let r=1;r<=50;r++)sides.forEach(sd=>add(VS.reps(r,sd)));
  for(let s=5;s<=180;s+=5)sides.forEach(sd=>add(VS.secs(s,sd)));
  for(let s=5;s<=300;s+=5)add(VS.rest(s));
  for(let m=1;m<=180;m++)add(VS.minutes(m));
  for(let s=1;s<=120;s++)add(VS.setsDone(s));
  for(let n=1;n<=30;n++)add(VS.prs(n),'hype');
  for(let n=2;n<=99;n++)add(VS.level(n),'hype');
  RANKS.forEach(r=>add(VS.rank(r[1]),'hype'));
  for(let n=2;n<=10;n++)add(VS.block(n));
  for(let n=2;n<=5;n++)add(n+' minutos.');add('Un minuto.');
  ALLEX.forEach(e=>add(VS.ex(e.n)));
  Object.values(WARMUPS).forEach(l=>l.forEach(w=>{add(VS.ex(w[0]));add(warmDose(w[1]));}));
  add(VS.ex('Caminadora, bici o elíptica suave'));CARDIO.forEach(q=>add(VS.ex('Cardio suave en '+EQ[q].t.toLowerCase())));
  Object.values(ST).forEach(x=>add(VS.ex(x[0])));MOB.forEach(x=>add(VS.ex(x[0])));HIITX.forEach(x=>add(VS.ex(x[0])));ABSX.forEach(x=>add(VS.ex(x[0])));
  return out;
};
