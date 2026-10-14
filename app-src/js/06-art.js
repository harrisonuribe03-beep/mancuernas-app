/* Ilustraciones de ejercicios */
/* ---------- utilidades ---------- */
const mmss=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const ART={'Press de pecho en el piso':['press-pecho-piso-a','press-pecho-piso-b'],'Press militar sentado':['press-militar-a','press-militar-b'],'Aperturas en el piso':['aperturas-a','aperturas-b'],'Elevaciones laterales':['elevaciones-laterales-a','elevaciones-laterales-b'],'Extensión de tríceps sobre la cabeza':['extension-triceps-a','extension-triceps-b'],'Flexiones de pecho':['flexiones-a','flexiones-b'],
 'Remo a una mano':['remo-mano-a','remo-mano-b'],'Remo a una mano con pausa':['remo-mano-a','remo-mano-b'],'Remo inclinado':['remo-inclinado-a','remo-inclinado-b'],'Pullover acostado':['pullover-a','pullover-b'],'Pájaros':['pajaros-a','pajaros-b'],'Curl de bíceps':['curl-biceps-a','curl-biceps-b'],'Curl martillo':['curl-martillo-a','curl-martillo-b'],
 'Sentadilla goblet':['goblet-a','goblet-b'],'Peso muerto rumano':['rumano-a','rumano-b'],'Zancadas alternas':['zancadas-a','zancadas-b'],'Zancada reversa':['zancadas-a','zancadas-b'],'Sentadilla búlgara':['bulgara-a','bulgara-b'],'Elevación de talones':['talones-a','talones-b'],'Plancha':['plancha-a'],
 'Press de pecho agarre neutro':['press-neutro-a','press-neutro-b'],'Press Arnold':['arnold-a','press-militar-b'],'Flexiones con pies elevados':['pies-elevados-a','pies-elevados-b'],'Flexiones cerradas':['cerradas-a','cerradas-b'],'Patada de tríceps':['patada-a','patada-b'],
 'Remo inclinado agarre supino':['remo-supino-a','remo-supino-b'],'Curl concentrado':['concentrado-a','concentrado-b'],'Curl inverso':['curl-inverso-a','curl-inverso-b'],'Bird dog':['bird-dog-a','bird-dog-b'],
 'Sentadilla sumo':['sumo-a','sumo-b'],'Puente de glúteo con mancuerna':['puente-a','puente-b'],'Step-ups':['stepups-a','stepups-b'],'Plancha lateral':['plancha-lateral-a'],'Elevación de piernas con rodillas dobladas':['piernas-a','piernas-b']};
const IMGSET=new Set((typeof IMGS==='string'?IMGS:'').split(' ').filter(Boolean));
// Ilustración según el sexo elegido: img/f/<clave>.webp para mujer, si existe
const IMG=k=>S.settings.sex==='m'&&IMGSET.has('f/'+k)?`img/f/${k}.webp`:`img/${k}.webp`;
// Ejercicios de la biblioteca ampliada: x-<nombre>-a / -b
const XART={};
XLIB.forEach(x=>{if(ART[x.n])return;if(XART[x.n]){ART[x.n]=XART[x.n];return;}const k='x-'+slug(x.n),a=[k+'-a',k+'-b'].filter(i=>IMGSET.has(i));if(a.length)ART[x.n]=a;});
// Sin ilustración ni figura: ficha con el ícono del equipo
const eqArt=(e,big)=>`<span class="xph ${big?'big':''}" role="img" aria-label="${esc(e.n)}">${IC[LDIC[e.ld]||'dumb']}${big?`<small>${esc((e.eq||[]).map(q=>EQ[q]?EQ[q].t:q).join(' · ')||'Peso corporal')}</small>`:''}</span>`;
const THUMBF={'Pullover acostado':0,'Extensión de tríceps sobre la cabeza':0,'Sentadilla búlgara':1};
function artAnim(e,label){const a=ART[e.n];if(!a)return e.f?figAnimated(e):eqArt(e,true);
  if(a.length<2)return `<span class="xa one" role="img" aria-label="${esc(e.n)}"><img src="${IMG(a[0])}" alt="" decoding="async"></span>`;
  return `<span class="xa two" role="img" aria-label="${esc(e.n)}"><img class="a" src="${IMG(a[0])}" alt="" decoding="async"><img class="b" src="${IMG(a[1])}" alt="" decoding="async"></span>`;}
const phases=e=>{const a=ART[e.n];if(!a&&!e.f)return '';return a&&a.length>1?'<div class="ph two"><span>Inicio</span><span>Final</span></div>':'<div class="ph"><span>Mantén la posición</span></div>';};
const thumb=e=>{const a=ART[e.n];if(!a)return `<span class="thumb">${e.f?figStatic(e,1):eqArt(e)}</span>`;const k=a[Math.min(THUMBF[e.n]??1,a.length-1)];return `<span class="thumb"><span class="xa"><img src="${IMG(k)}" alt="" loading="lazy" decoding="async"></span></span>`;};
