
/* ===================== v4 · sonidos y coach de voz ===================== */
const SND=['tick','go','set','half','work','rest','pr','lvl','done'];
const PACKS={anime:['Anime','Aura, impacto y destellos'],arcade:['Arcade','8 bits, como consola vieja'],clasico:['Clásico','Pitidos limpios de cronómetro'],suave:['Suave','Marimba y campanas']};
const VOICES={off:['Apagada','Solo sonidos'],basic:['Lo esencial','Siguiente serie, cambios y récords'],full:['Coach completo','Además cuenta, motiva y te acompaña']};
const WAB={};let loadedPack=null,TTS=null;
const packOf=()=>PACKS[S.settings.pack]?S.settings.pack:'anime';
async function loadPack(){
  const p=packOf();if(loadedPack===p)return;loadedPack=p;
  if(NAT&&typeof NAT.loadSounds==='function'){call(NAT,'loadSounds',{names:SND.map(n=>n+'.wav'),dir:'public/sounds/'+p});return;}
  ensureAudio();if(!AC)return;
  SND.forEach(n=>{const k=p+'/'+n;if(WAB[k])return;fetch('sounds/'+k+'.wav').then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(buf=>{WAB[k]=buf;}).catch(()=>{});});
}
function sfx(n){
  if(!S.settings.sound)return;const p=packOf(),vol=S.settings.vol??.9;
  if(NAT&&typeof NAT.play==='function'){call(NAT,'play',{name:n+'.wav',dir:'public/sounds/'+p,vol});return;}
  try{ensureAudio();const b=WAB[p+'/'+n];if(!AC||!b){beep(n==='tick'?880:1320,.15);return;}const s=AC.createBufferSource(),g=AC.createGain();g.gain.value=vol;s.buffer=b;s.connect(g);g.connect(AC.destination);s.start();}catch(e){}
}
async function ttsInit(){
  if(TTS)return;
  if(NAT&&typeof NAT.ttsInit==='function'){try{const r=await NAT.ttsInit({});TTS=r&&r.ok?'nat':'none';}catch(e){TTS='none';}return;}
  TTS=window.speechSynthesis?'web':'none';
}
let lastSay=0;
function say(text,o){
  o=o||{};const m=S.settings.voice||'basic';if(m==='off'||(o.full&&m!=='full'))return;
  if(!TTS){ttsInit().then(()=>say(text,o));return;}if(TTS==='none')return;
  const rate=S.settings.vrate||1;lastSay=Date.now();
  if(TTS==='nat'){call(NAT,'speak',{text,rate,queue:!!o.queue});return;}
  try{const u=new SpeechSynthesisUtterance(text);u.lang='es-ES';u.rate=rate;const vs=speechSynthesis.getVoices().filter(v=>/^es/i.test(v.lang));if(vs.length)u.voice=vs.find(v=>/CO|419|MX|US/.test(v.lang))||vs[0];if(!o.queue)speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}
}
const MOTIV=['Vamos, una más que la última vez.','Respira y controla la bajada.','Cada serie cuenta.','Tu yo del futuro te lo agradece.','Despierta tu poder.','Rompe tus límites, con buena técnica.','Concéntrate en el músculo.','Eso es. Sigue así.','La constancia te hace fuerte.','No pares ahora.'];
const pick=a=>a[Math.floor(Math.random()*a.length)];
const nfs=x=>NF.format(x);
function setPhrase(it,k){
  const e=exOf(it),ds=dose(e),s=it.sets[k];if(!s)return '';
  const tot=it.sets.length,head=`Serie ${k+1} de ${tot}`;
  if(ds.timed)return `${head}. ${s.reps} segundos${ds.side?' por '+ds.side:''}.`;
  if(isBW(e))return `${head}. ${ds.fail?'Hasta que la técnica aguante':s.reps+' repeticiones'}.`;
  return `${head}. ${nfs(s.kg)} kilos, ${s.reps} repeticiones${ds.side?' por '+ds.side:''}.`;
}
function exPhrase(it){const e=exOf(it),ds=dose(e);return `${it.n}. ${it.sets.length} series de ${ds.label.replace('–',' a ').replace(' s',' segundos')}.`;}
const V={
  restStart(e,secs){if(Math.random()<.5)say(`Descansa ${secs>=60&&secs%60===0?secs/60+(secs===60?' minuto':' minutos'):secs+' segundos'}. ${pick(MOTIV)}`,{full:true});else say(`Descansa ${secs} segundos.`,{full:true});},
  restTen(){say('Diez segundos.',{full:true});},
  restEnd(){const L=S.live;if(!L)return;const it=L.items[L.i],k=curRow(it);if(k<0)return;say((k===0?exPhrase(it)+' ':'')+setPhrase(it,k));},
  nextEx(it){say('Siguiente ejercicio: '+exPhrase(it));},
  pr(n){say('¡Nuevo récord personal en '+n+'!');},
  setDone(){if(Math.random()<.35)say(pick(['Buena serie.','Muy bien.','Eso es.','Excelente.','Así se hace.']),{full:true});},
  timedGo(){say('¡Ya!',{full:true});},
  timedHalf(){say('Mitad. Aguanta.',{full:true});},
  warmStep(t){say(t);},
  first(it){say('Empezamos. '+exPhrase(it)+' '+setPhrase(it,0));},
  finish(r,lv0,lv1){const m=Math.max(1,Math.round(r.dur/60));let t=`Entrenamiento completado. ${m} ${m===1?'minuto':'minutos'} y ${r.sets} series.`;
    if(r.pr.length)t+=` Lograste ${r.pr.length===1?'un récord':r.pr.length+' récords'}.`;
    if(lv1.lv>lv0.lv)t+=lv1.ri>lv0.ri?` ¡Nuevo rango: ${lv1.rank}!`:` ¡Subiste a nivel ${lv1.lv}!`;say(t);}
};
function soundSettings(){
  const st=S.settings;
  return `<h2 class="h2">Sonido y voz</h2><div class="card">
  <div class="set inline"><span class="lb">Sonidos<small>Cuenta regresiva, series y récords</small></span><button class="sw" data-act="tog" data-v="sound" aria-pressed="${!!st.sound}" aria-label="Sonidos"></button></div>
  ${st.sound?`<div class="set"><span class="lb">Paquete de sonidos<small>Toca para escucharlo</small></span><div class="packs">${Object.keys(PACKS).map(k=>`<button data-act="pack" data-v="${k}" aria-pressed="${packOf()===k}"><b>${PACKS[k][0]}</b><small>${PACKS[k][1]}</small></button>`).join('')}</div>
   <div class="volrow">${IC.vol}<input type="range" id="in-vol" min="0.2" max="1" step="0.1" value="${st.vol??.9}" aria-label="Volumen de los sonidos"></div></div>`:''}
  <div class="set"><span class="lb">Coach de voz<small>Te habla en español mientras entrenas. Baja el volumen de tu música solo mientras habla.</small></span><div class="opts sm">${Object.keys(VOICES).map(k=>`<button class="opt" data-act="voice" data-v="${k}" aria-pressed="${(st.voice||'basic')===k}"><span><b>${VOICES[k][0]}</b><small>${VOICES[k][1]}</small></span><span class="ock">${IC.check}</span></button>`).join('')}</div>
   ${(st.voice||'basic')!=='off'?`<div class="seg" style="margin-top:10px">${[[0.9,'Pausada'],[1,'Normal'],[1.2,'Rápida']].map(([v,l])=>`<button data-act="vrate" data-v="${v}" aria-pressed="${(st.vrate||1)==v}">${l}</button>`).join('')}</div><button class="btn sm ghost block" style="margin-top:10px" data-act="vtest">${IC.play}Probar la voz</button>`:''}</div>
  </div>`;
}
function audioAct(a,v){
  switch(a){
    case 'pack':S.settings.pack=v;saveSettings();loadPack().then(()=>setTimeout(()=>sfx('go'),NAT?250:400));render();return true;
    case 'voice':S.settings.voice=v;saveSettings();render();if(v!=='off')setTimeout(()=>say(v==='full'?'Coach completo activado. '+pick(MOTIV):'Te aviso cada serie y cada cambio.'),200);return true;
    case 'vrate':S.settings.vrate=+v;saveSettings();render();say('Así hablo a esta velocidad.');return true;
    case 'vtest':{const n=S.settings.name;say(`Hola${n?' '+n:''}. Serie 2 de 4. 8 kilos, 10 repeticiones. ${pick(MOTIV)}`);return true;}
  }
  return false;
}
