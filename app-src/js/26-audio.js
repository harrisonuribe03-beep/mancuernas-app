/* Sonidos y voz del coach.
   - Sonidos: paquetes de 9 efectos (SoundPool en Android, Web Audio en el navegador). Se mezclan con la música.
   - Voz: clips pregrabados con voz neuronal colombiana (Salomé). Cada frase se arma con segmentos y cada
     segmento es un clip voice/salome/<hash>.mp3. Mientras habla, la música del teléfono baja de volumen.
     Si a una frase le falta algún clip, se dice completa con la voz del teléfono (TextToSpeech). */

const SND=['tick','go','set','half','work','rest','pr','lvl','done'];
const PACKS={
  gym:['Gimnasio','Largada de carrera, pito, pesas y público'],
  anime:['Anime','Aura, impacto y destellos'],
  arcade:['Arcade','8 bits, como consola vieja'],
  clasico:['Clásico','Pitidos limpios de cronómetro'],
  suave:['Suave','Marimba y campanas']
};
const VOICES={off:['Apagado','Solo sonidos'],basic:['Lo esencial','Cada serie, los cambios y los récords'],full:['Coach completo','Además motiva, cuenta el descanso y te acompaña']};
const VVOICES={salome:['Salomé','Colombiana, con sabor paisa'],tel:['Voz del teléfono','La que trae tu Android']};
const WAB={};let loadedPack=null,TTS=null;
const packOf=()=>PACKS[S.settings.pack]?S.settings.pack:'gym';

/* ---------- efectos ---------- */
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

/* ---------- voz del teléfono (respaldo) ---------- */
async function ttsInit(){
  if(TTS)return;
  if(NAT&&typeof NAT.ttsInit==='function'){try{const r=await NAT.ttsInit({});TTS=r&&r.ok?'nat':'none';}catch(e){TTS='none';}return;}
  TTS=window.speechSynthesis?'web':'none';
}
function voiceOn(o){const m=S.settings.voice||'basic';return !(m==='off'||(o&&o.full&&m!=='full'));}
function say(text,o){
  o=o||{};if(!voiceOn(o)||!text)return;
  if(!TTS){ttsInit().then(()=>say(text,o));return;}if(TTS==='none')return;
  const rate=S.settings.vrate||1;
  if(TTS==='nat'){call(NAT,'speak',{text,rate,queue:!!o.queue});return;}
  try{const u=new SpeechSynthesisUtterance(text);u.lang='es-CO';u.rate=rate;const vs=speechSynthesis.getVoices().filter(v=>/^es/i.test(v.lang));if(vs.length)u.voice=vs.find(v=>/CO/.test(v.lang))||vs.find(v=>/419|MX|US/.test(v.lang))||vs[0];if(!o.queue)speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}
}

/* ---------- voz pregrabada ---------- */
const VDIR='voice/salome';
const VSET=new Set((typeof VCLIPS==='string'?VCLIPS:'').split(' ').filter(Boolean));
function vhash(t){let h=0x811c9dc5;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,0x01000193);}return (h>>>0).toString(16).padStart(8,'0');}
const hasClip=t=>VSET.has(vhash(t));
const useClips=()=>(S.settings.vvoice||'salome')==='salome'&&VSET.size>0;
const VMISS=window.__vmiss=[];
// Velocidad de reproducción de los clips (conserva el tono)
const clipRate=()=>({0.9:.92,1:1,1.2:1.12})[S.settings.vrate||1]||1;
let WQ=[],WA=null,WQT=null;
function webStop(){WQ=[];clearTimeout(WQT);if(WA){try{WA.pause();}catch(e){}WA=null;}}
function webNext(){
  const f=WQ.shift();if(!f){WA=null;return;}
  const a=new Audio(VDIR+'/'+f);WA=a;a.playbackRate=clipRate();a.preservesPitch=true;a.volume=1;
  const go=()=>{if(WA===a){WQT=setTimeout(webNext,70);}};a.onended=go;a.onerror=go;
  a.play().catch(go);
}
function playClips(files,o){
  if(NAT&&typeof NAT.voicePlay==='function'){call(NAT,'voicePlay',{files,dir:'public/'+VDIR,rate:clipRate(),queue:!!o.queue});return;}
  if(!o.queue)webStop();WQ.push(...files);if(!WA)webNext();
}
/* Dice una frase armada por segmentos. o.full: solo en modo "Coach completo". o.queue: no corta lo que suena. */
function speakSegs(segs,o){
  o=o||{};if(!voiceOn(o))return;
  segs=segs.filter(Boolean);if(!segs.length)return;
  if(useClips()){
    const miss=segs.filter(t=>!hasClip(t));
    if(!miss.length){playClips(segs.map(t=>vhash(t)+'.mp3'),o);return;}
    miss.forEach(t=>{if(!VMISS.includes(t))VMISS.push(t);});
  }
  say(segs.join(' '),o);
}
function hush(){webStop();try{if(window.speechSynthesis)speechSynthesis.cancel();}catch(e){}call(NAT,'voiceStop',{});call(NAT,'stopSpeak',{});}

/* ---------- ajustes ---------- */
function soundSettings(){
  const st=S.settings,vm=st.voice||'basic',vv=st.vvoice||'salome';
  return `<h2 class="h2">Sonido y voz</h2><div class="card">
  <div class="set inline"><span class="lb">Sonidos<small>Cuenta regresiva, series y récords</small></span><button class="sw" data-act="tog" data-v="sound" aria-pressed="${!!st.sound}" aria-label="Sonidos"></button></div>
  ${st.sound?`<div class="set"><span class="lb">Paquete de sonidos<small>Toca uno para escucharlo</small></span><div class="packs">${Object.keys(PACKS).map(k=>`<button data-act="pack" data-v="${k}" aria-pressed="${packOf()===k}"><b>${PACKS[k][0]}</b><small>${PACKS[k][1]}</small></button>`).join('')}</div>
   <div class="volrow">${IC.vol}<input type="range" id="in-vol" min="0.2" max="1" step="0.1" value="${st.vol??.9}" aria-label="Volumen de los sonidos"></div></div>`:''}
  <div class="set"><span class="lb">Coach de voz<small>Te habla mientras entrenas y baja el volumen de tu música solo mientras habla.</small></span><div class="opts sm">${Object.keys(VOICES).map(k=>`<button class="opt" data-act="voice" data-v="${k}" aria-pressed="${vm===k}"><span><b>${VOICES[k][0]}</b><small>${VOICES[k][1]}</small></span><span class="ock">${IC.check}</span></button>`).join('')}</div>
   ${vm!=='off'?`${VSET.size?`<div class="vpick">${Object.keys(VVOICES).map(k=>`<button data-act="vvoice" data-v="${k}" aria-pressed="${vv===k}">${k==='salome'?'<span class="vav" aria-hidden="true">S</span>':`<span class="vav tel" aria-hidden="true">${IC.vol}</span>`}<span><b>${VVOICES[k][0]}</b><small>${VVOICES[k][1]}</small></span></button>`).join('')}</div>`:''}
   <div class="seg" style="margin-top:10px">${[[0.9,'Pausada'],[1,'Normal'],[1.2,'Rápida']].map(([v,l])=>`<button data-act="vrate" data-v="${v}" aria-pressed="${(st.vrate||1)==v}">${l}</button>`).join('')}</div><button class="btn sm ghost block" style="margin-top:10px" data-act="vtest">${IC.play}Escuchar al coach</button>`:''}</div>
  </div>`;
}
function audioAct(a,v){
  switch(a){
    case 'pack':S.settings.pack=v;saveSettings();loadPack().then(()=>setTimeout(()=>sfx('go'),NAT?250:400));render();return true;
    case 'voice':S.settings.voice=v;saveSettings();render();if(v!=='off')setTimeout(()=>V.mode(v),200);return true;
    case 'vvoice':S.settings.vvoice=v;saveSettings();render();setTimeout(()=>V.sample(),150);return true;
    case 'vrate':S.settings.vrate=+v;saveSettings();render();V.rate();return true;
    case 'vtest':V.sample();return true;
  }
  return false;
}
