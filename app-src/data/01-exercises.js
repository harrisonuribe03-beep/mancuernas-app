const L={T:28,N:7,R:5,U:13,F:12,TH:19,SH:19,FT:5};
const RD=Math.PI/180;
const P=(o,a,l)=>[o[0]+l*Math.cos(a*RD),o[1]+l*Math.sin(a*RD)];
const ANG=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0])/RD;
const DIST=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const fx=n=>(+n).toFixed(1);

function limb(S,l1,l2,s){
  if(!s) return null;
  if(Array.isArray(s)){const e=P(S,s[0],l1*(s[2]??1));return [e,P(e,s[1],l2*(s[3]??1))];}
  const T=s.to, dd=DIST(S,T)||0.01, u=[(T[0]-S[0])/dd,(T[1]-S[1])/dd];
  const d=Math.min(dd,l1+l2-0.01);
  const a=(l1*l1-l2*l2+d*d)/(2*d), h=Math.sqrt(Math.max(0,l1*l1-a*a)), b=s.b||1;
  const e=[S[0]+a*u[0]-b*h*u[1], S[1]+a*u[1]+b*h*u[0]];
  return [e,P(e,ANG(e,T),l2)];
}

function skel(q){
  const v=q.v||'side', p=q.p, t=q.t??-90, ha=q.h??t;
  const neck=P(p,t,L.T*(q.ts??1)), head=P(neck,ha,L.N);
  const down=ANG(neck,p), sc=P(neck,down,2);
  let sh=[sc,sc], hp=[p,p];
  if(v!=='side'){sh=[P(sc,down+90,6),P(sc,down-90,6)];hp=[P(p,down+90,4),P(p,down-90,4)];}
  if(q.sh) sh=sh.map(s=>[s[0],s[1]-q.sh]);
  const arms=[0,1].map(i=>limb(sh[i],L.U,L.F,q.A&&q.A[i]));
  const legs=[0,1].map(i=>limb(hp[i],L.TH,L.SH,q.L&&q.L[i]));
  const fd=v==='side'?[0,0]:v==='front'?[165,15]:[null,null];
  const fa=q.fa||fd;
  const feet=legs.map((lg,i)=>lg&&fa[i]!=null?P(lg[1],fa[i],L.FT):null);
  return {v,p,neck,head,ha,sc,sh,hp,arms,legs,feet};
}

const poly=pts=>'M'+pts.map(p=>fx(p[0])+' '+fx(p[1])).join('L');
const layer=(ds,wo,wi,cls)=>{const d=ds.filter(Boolean).join('');if(!d)return '';
  return `<path d="${d}" class="o" stroke-width="${wo}"/><path d="${d}" class="${cls}" stroke-width="${wi}"/>`;};

function dumbbell(w,type,fore){
  if(type==null) return '';
  if(type==='end') return `<circle cx="${fx(w[0])}" cy="${fx(w[1])}" r="3.3" class="dbp"/><circle cx="${fx(w[0])}" cy="${fx(w[1])}" r="1" class="dbh"/>`;
  const a=type==='perp'?fore+90:type;
  const A=P(w,a,4.8),B=P(w,a+180,4.8);
  let s=`<path d="${poly([A,B])}" class="dbb"/>`;
  for(const sg of [1,-1]){
    const c=P(w,a+(sg>0?0:180),3.7);
    const pts=[P(P(c,a,1.2),a+90,3.2),P(P(c,a,1.2),a-90,3.2),P(P(c,a,-1.2),a-90,3.2),P(P(c,a,-1.2),a+90,3.2)];
    s+=`<path d="${poly(pts)}Z" class="dbp"/>`;
  }
  return s;
}

function fig(q){
  const s=skel(q);let o='';
  const dbs=Array.isArray(q.db)?q.db:[q.db,q.db];
  const arm=i=>s.arms[i]?poly([s.sh[i],...s.arms[i]]):'';
  const leg=i=>s.legs[i]?poly([s.hp[i],...s.legs[i],...(s.feet[i]?[s.feet[i]]:[])]):'';
  const dbAt=i=>s.arms[i]?dumbbell(s.arms[i][1],dbs[i],ANG(s.arms[i][0],s.arms[i][1])):'';
  const head=()=>{let h=`<circle cx="${fx(s.head[0])}" cy="${fx(s.head[1])}" r="${L.R}" class="hd"/>`;
    if(s.v==='side'){const d=s.ha+90;h+=`<path d="${poly([P(s.head,d,L.R),P(s.head,d,L.R+1.7)])}" class="o" stroke-width="1.2"/>`;}
    return h;};
  const LW=[4.2,2.3];
  if(s.v==='side'){
    o+=layer([leg(1),arm(1)],...LW,'fi')+dbAt(1);
    o+=layer([poly([s.sc,s.neck])],3.2,1.4,'i');
    o+=layer([poly([s.p,s.sc])],8,6.2,'i');
    o+=head();
    o+=layer([leg(0)],...LW,'i');
    o+=layer([arm(0)],...LW,'i')+dbAt(0);
  }else{
    o+=layer([leg(0),leg(1)],...LW,'i');
    o+=layer([poly([s.sc,s.neck])],3.2,1.4,'i');
    o+=`<path d="${poly([s.sh[0],s.sh[1],s.hp[1],s.hp[0]])}Z" class="tf"/>`;
    o+=head();
    o+=layer([arm(0),arm(1)],...LW,'i')+dbAt(0)+dbAt(1);
  }
  return o;
}

function props(list,v){
  let o='';
  if(v!=='top'){
    o+=`<path d="M0 92.4H100" class="ln"/>`;
    let t='';for(let x=5;x<100;x+=6)t+=`M${x} 92.9l-2.4 3`;
    o+=`<path d="${t}" class="tk"/>`;
  }
  for(const p of list){
    if(p.k==='chair'||p.k==='bench'){
      const th=p.k==='bench'?3.6:2.6;
      if(p.back==='l') o+=`<path d="M${p.x1+1.4} ${p.y}V${p.y-22}" class="ln" stroke-width="1.8"/>`;
      o+=`<path d="M${p.x1+1.6} ${p.y+th}V92.4M${p.x2-1.6} ${p.y+th}V92.4" class="ln" stroke-width="1.4"/>`;
      o+=`<rect x="${p.x1}" y="${p.y}" width="${p.x2-p.x1}" height="${th}" rx=".6" class="pf"/>`;
    }else if(p.k==='box'){
      o+=`<rect x="${p.x1}" y="${p.y}" width="${p.x2-p.x1}" height="${92.4-p.y}" class="hb"/>`;
    }else if(p.k==='mat'){
      o+=`<rect x="20" y="14" width="60" height="80" rx="3" class="mt"/>`;
    }
  }
  return o;
}

function exSVG(ex){
  const pr=ex.pr||[];
  const frame=(q,dx)=>`<g transform="translate(${dx} 0)"><g filter="url(#rough)">${props(pr,q.v)}${fig(q)}</g></g>`;
  const body=ex.f.length===1?frame(ex.f[0],55)
    :frame(ex.f[0],0)+`<path d="M100.5 42H109M106 39L109 42L106 45" class="ar"/>`+frame(ex.f[1],110);
  return `<svg viewBox="0 -10 210 106" role="img" aria-label="${ex.n}">${body}</svg>`;
}

function frameSVG(ex,i){
  const q=ex.f[Math.min(i,ex.f.length-1)];
  return `<svg viewBox="0 -10 100 106" role="img" aria-label="${ex.n}"><g filter="url(#rough)">${props(ex.pr||[],q.v)}${fig(q)}</g></svg>`;
}

/* ---------- poses ---------- */
const st=(x,o)=>Object.assign({p:[x,53],h:-88,L:[[90,90],[90.5,90.5]],A:[[90,90],[91,91]],db:'end'},o);
const fr=o=>Object.assign({v:'front',p:[50,53],L:[[95,92],[85,88]],db:'end'},o);
const ly=o=>Object.assign({p:[62,88],t:180,h:-170,L:[[-55,80],[-58,82]],db:'end'},o);
const seatL=[[100,90,.35],[80,90,.35]];
const hinge=o=>Object.assign({p:[40,54],t:-30,h:-25,L:[[80,95],[82,97]],db:'end'},o);
const lungeEnd={p:[46,72],h:-88,A:[[90,90],[91,91]],L:[[0,90],[110,180]],fa:[0,150],db:'end'};
const chairF={k:'chair',x1:36,x2:64,y:70};

const DAYS=[
{id:'lunes',d:'Lunes',t:'Empuje',s:'Pecho, hombro y tríceps',ex:[
 {n:'Press de pecho en el piso',r:'4 × 10–12',c:'Codos a unos 45° del cuerpo. Baja hasta que el brazo toque el piso y empuja.',
  f:[ly({A:[[15,-90],[16,-90]]}),ly({A:[[-90,-90],[-89,-89]]})]},
 {n:'Press militar sentado',r:'4 × 10',c:'Espalda pegada al respaldo. Sube sin arquear la zona lumbar.',pr:[chairF],
  f:[fr({p:[50,67],L:seatL,A:[[180,-90],[0,-90]],db:0}),fr({p:[50,67],L:seatL,A:[[-110,-100],[-70,-80]],db:0})]},
 {n:'Aperturas en el piso',r:'3 × 12',c:'Codos un poco doblados todo el recorrido. Abre hasta sentir el pecho estirado.',pr:[{k:'mat'}],
  f:[{v:'top',p:[50,62],L:[[100,90,.7,.7],[80,90,.7,.7]],A:[[180,175],[0,5]],db:90},
     {v:'top',p:[50,62],L:[[100,90,.7,.7],[80,90,.7,.7]],A:[[15,20,.33,.12],[165,160,.33,.12]],db:90}]},
 {n:'Elevaciones laterales',r:'3 × 15',c:'Sube hasta la altura de los hombros con los codos apenas doblados.',
  f:[fr({A:[[100,95],[80,85]]}),fr({A:[[172,178],[8,2]]})]},
 {n:'Extensión de tríceps sobre la cabeza',r:'3 × 12',c:'Codos hacia el techo y quietos. Solo se mueve el antebrazo.',
  f:[st(48,{h:-85,A:[[-100,110],[-98,112]],db:[90,null]}),st(48,{h:-85,A:[[-100,-92],[-98,-90]],db:[90,null]})]},
 {n:'Flexiones de pecho',r:'2 × al fallo',c:'Cuerpo recto de la cabeza a los talones. Baja el pecho casi al piso.',
  f:[{p:[44,74],t:-20,h:-20,A:[[90,90],[92,88]],L:[[160,160],[161,161]],fa:[100,100]},
     {p:[44,82],t:-8,h:-10,A:[{to:[68.4,90.6],b:1},{to:[69.4,90.6],b:1}],L:[[172,172],[172.5,172.5]],fa:[100,100]}]}
]},
{id:'martes',d:'Martes',t:'Tirón',s:'Espalda y bíceps',ex:[
 {n:'Remo a una mano',r:'4 × 10 por lado',c:'Rodilla y mano en la silla o cama. Lleva el codo hacia la cadera.',pr:[{k:'bench',x1:8,x2:72,y:73}],
  f:[{p:[34,54],t:-15,h:-15,A:[[95,90],[80,85]],L:[[95,90],[90,175]],fa:[0,175],db:['end',null]},
     {p:[34,54],t:-15,h:-15,A:[[-150,90],[80,85]],L:[[95,90],[90,175]],fa:[0,175],db:['end',null]}]},
 {n:'Remo inclinado',r:'3 × 12',c:'Torso inclinado con la espalda recta. Lleva los codos hacia atrás.',
  f:[hinge({A:[[90,90],[91,91]]}),hinge({A:[[-160,90],[-158,90]]})]},
 {n:'Pullover acostado',r:'3 × 12',c:'Una mancuerna con las dos manos. Bájala detrás de la cabeza sin despegar la espalda.',
  f:[ly({A:[[-160,-165],[-158,-163]],db:['end',null]}),ly({A:[[-90,-90],[-88,-88]],db:['end',null]})]},
 {n:'Pájaros',r:'3 × 15',c:'Torso inclinado al frente. Abre los brazos y aprieta la parte de atrás del hombro.',
  f:[fr({p:[50,54],ts:.45,h:-90,A:[[95,90],[85,90]]}),fr({p:[50,54],ts:.45,h:-90,A:[[178,168],[2,12]]})]},
 {n:'Curl de bíceps',r:'3 × 12',c:'Codos pegados al cuerpo. Baja despacio y sin balancearte.',
  f:[st(48,{A:[[88,90],[90,92]]}),st(48,{A:[[85,-75],[87,-73]]})]},
 {n:'Curl martillo',r:'3 × 12',c:'Pulgares hacia arriba, como si sostuvieras un martillo.',
  f:[st(48,{A:[[88,90],[90,92]],db:'perp'}),st(48,{A:[[85,-75],[87,-73]],db:'perp'})]}
]},
{id:'miercoles',d:'Miércoles',t:'Pierna y core',s:'Cuádriceps, glúteo, isquios y abdomen',ex:[
 {n:'Sentadilla goblet',r:'4 × 12',c:'Mancuerna pegada al pecho. Baja con el pecho alto y las rodillas hacia las puntas.',
  f:[st(51,{A:[[100,-60],[102,-58]],db:[90,null]}),{p:[42,72],t:-70,h:-65,A:[[100,-60],[102,-58]],L:[{to:[51,91],b:-1},{to:[51.5,91],b:-1}],db:[90,null]}]},
 {n:'Peso muerto rumano',r:'4 × 10',c:'Rodillas un poco dobladas. Lleva la cadera atrás hasta sentir la parte trasera del muslo.',
  f:[st(47,{A:[[85,88],[87,90]]}),{p:[38,55],t:-25,h:-20,A:[[90,90],[91,91]],L:[{to:[47,91],b:-1},{to:[47.5,91],b:-1}],db:'end'}]},
 {n:'Zancadas alternas',r:'3 × 10 por pierna',c:'Paso largo al frente. La rodilla de atrás casi toca el piso.',
  f:[st(46),lungeEnd]},
 {n:'Sentadilla búlgara',r:'3 × 10 por pierna',c:'Empeine de atrás sobre la silla. El peso va en la pierna de adelante.',pr:[{k:'chair',x1:10,x2:34,y:78}],
  f:[{p:[58,55],h:-88,A:[[90,90],[91,91]],L:[{to:[65,91],b:-1},{to:[28,76.5],b:-1}],fa:[0,180],db:'end'},
     {p:[46,72],h:-88,A:[[90,90],[91,91]],L:[[0,90],{to:[27,76.5],b:-1}],fa:[0,180],db:'end'}]},
 {n:'Elevación de talones',r:'4 × 15–20',c:'Sube lo más alto que puedas, pausa un segundo y baja lento.',
  f:[st(48),{p:[48,49],h:-88,A:[[90,90],[91,91]],L:[[90,90],[90.5,90.5]],fa:[50,50],db:'end'}]},
 {n:'Plancha',r:'3 × 40 s',c:'Codos bajo los hombros. Aprieta abdomen y glúteos sin dejar caer la cadera.',
  f:[{p:[44,82],t:-12,h:-12,A:[[90,0],[91,0]],L:[[168,168],[168.5,168.5]],fa:[155,155]}]}
]},
{id:'jueves',d:'Jueves',t:'Empuje',s:'Variante de pecho, hombro y tríceps',ex:[
 {n:'Press de pecho agarre neutro',r:'4 × 10',c:'Palmas mirándose entre sí y codos más cerca del cuerpo.',
  f:[ly({A:[[15,-90],[16,-90]],db:'perp'}),ly({A:[[-90,-90],[-89,-89]],db:'perp'})]},
 {n:'Press Arnold',r:'3 × 10',c:'Empieza con las palmas hacia ti y gíralas hacia afuera mientras subes.',pr:[chairF],
  f:[fr({p:[50,67],L:seatL,A:[[100,-80,.55],[80,-100,.55]],db:0}),fr({p:[50,67],L:seatL,A:[[-110,-100],[-70,-80]],db:0})]},
 {n:'Flexiones con pies elevados',r:'3 × al fallo',c:'Pies en la silla. Trabaja más la parte alta del pecho.',pr:[{k:'chair',x1:0,x2:22,y:56}],
  f:[{p:[48,60],t:12,h:12,A:[[90,90],[91,89]],L:[[192,192],[192.5,192.5]],fa:[95,95]},
     {p:[46,68],t:22,h:25,A:[{to:[73.4,90.6],b:1},{to:[74.2,90.6],b:1}],L:[[-155.6,-155.6],[-155,-155]],fa:[95,95]}]},
 {n:'Elevaciones frontales',r:'3 × 12',c:'Brazos casi rectos hasta la altura de los hombros, sin impulso.',
  f:[st(48,{A:[[80,85],[82,87]]}),st(48,{A:[[-5,-5],[-3,-3]]})]},
 {n:'Fondos en silla',r:'3 × 12',c:'Manos en el borde de la silla. Baja hasta que los codos queden a 90°.',pr:[{k:'chair',x1:14,x2:40,y:60,back:'l'}],
  f:[{p:[43,61.5],h:-85,A:[{to:[40,60.5],b:1},{to:[40.6,60.5],b:1}],L:[{to:[69,90],b:-1},{to:[69.5,90],b:-1}],fa:[-45,-45]},
     {p:[43,75],h:-85,A:[{to:[40,60.5],b:1},{to:[40.6,60.5],b:1}],L:[{to:[69,90],b:-1},{to:[69.5,90],b:-1}],fa:[-45,-45]}]},
 {n:'Patada de tríceps',r:'3 × 12',c:'Brazo pegado al cuerpo. Estira el codo hasta que quede recto.',
  f:[hinge({A:[[170,90],[168,90]]}),hinge({A:[[170,170],[168,168]]})]}
]},
{id:'viernes',d:'Viernes',t:'Tirón',s:'Variante de espalda y bíceps',ex:[
 {n:'Peso muerto con mancuernas',r:'4 × 8–10',c:'Espalda recta. Empuja el piso con los pies y sube estirando la cadera.',
  f:[{p:[38,68],t:-40,h:-35,A:[[90,90],[91,91]],L:[{to:[49,91],b:-1},{to:[49.5,91],b:-1}],db:'end'},st(49,{A:[[88,90],[90,92]]})]},
 {n:'Remo renegado',r:'3 × 8 por lado',c:'Plancha alta sobre las mancuernas. Rema un brazo sin girar la cadera.',
  f:[{p:[44,72],t:-20,h:-20,A:[[90,90],[91,89]],L:[[158,158],[158.5,158.5]],fa:[100,100],db:'end'},
     {p:[44,72],t:-20,h:-20,A:[[-160,90],[91,89]],L:[[158,158],[158.5,158.5]],fa:[100,100],db:'end'}]},
 {n:'Encogimientos de trapecio',r:'3 × 15',c:'Sube los hombros hacia las orejas, sostén un segundo y baja.',
  f:[fr({A:[[95,90],[85,90]]}),fr({A:[[95,90],[85,90]],sh:4})]},
 {n:'Curl concentrado',r:'3 × 10 por brazo',c:'Codo apoyado en el muslo. Sube sin mover el brazo.',pr:[{k:'chair',x1:22,x2:46,y:74}],
  f:[{p:[40,72],t:-60,h:-50,A:[[85,90],[60,30]],L:[[0,90],[-3,92]],db:['end',null]},
     {p:[40,72],t:-60,h:-50,A:[[85,-60],[60,30]],L:[[0,90],[-3,92]],db:['end',null]}]},
 {n:'Curl inverso',r:'3 × 12',c:'Palmas hacia abajo todo el recorrido. Trabaja bíceps y antebrazo.',
  f:[st(48,{A:[[88,90],[90,92]]}),st(48,{A:[[85,-75],[87,-73]]})]},
 {n:'Superman',r:'3 × 15',c:'Boca abajo. Levanta brazos y piernas a la vez y sostén dos segundos.',
  f:[{p:[41,87],t:0,h:-8,A:[[0,0],[0.5,0.5]],L:[[180,180],[179.5,179.5]],fa:[120,120]},
     {p:[41,87],t:-12,h:-15,A:[[-18,-18],[-17,-17]],L:[[192,192],[191.5,191.5]],fa:[120,120]}]}
]},
{id:'sabado',d:'Sábado',t:'Pierna y core',s:'Variante de pierna y abdomen',ex:[
 {n:'Sentadilla sumo',r:'4 × 12',c:'Pies más abiertos que los hombros y puntas hacia afuera.',
  f:[fr({p:[50,53],L:[[105,105],[75,75]],A:[{to:[49.3,50],b:1},{to:[50.7,50],b:-1}],db:[90,null]}),
     fr({p:[50,70],L:[[160,60,1,.75],[20,120,1,.75]],A:[{to:[49.3,67],b:1},{to:[50.7,67],b:-1}],db:[90,null]})]},
 {n:'Hip thrust en el piso',r:'4 × 12',c:'Mancuerna sobre la cadera. Empuja con los talones y aprieta glúteos arriba.',
  f:[{p:[60,87],t:180,h:-170,A:[[-4,-4],[-3,-3]],L:[[-45,76],[-47,78]],db:['end',null]},
     {p:[58,72],t:151.7,h:175,A:[[-35,-35],[-34,-34]],L:[[0,88],[-2,90]],db:['end',null]}]},
 {n:'Step-ups',r:'3 × 10 por pierna',c:'Sube con la pierna de adelante sin impulsarte con la de atrás.',pr:[{k:'box',x1:54,x2:84,y:72}],
  f:[st(44,{L:[{to:[62,71],b:-1},[90,90]]}),{p:[62,33],h:-88,A:[[90,90],[91,91]],L:[[90,90],[100,90]],db:'end'}]},
 {n:'Zancada reversa',r:'3 × 10 por pierna',c:'El paso va hacia atrás. Carga menos la rodilla que la zancada al frente.',
  f:[st(65),lungeEnd]},
 {n:'Russian twist',r:'3 × 20',c:'Pies en el aire y torso inclinado. Gira de lado a lado con la mancuerna.',
  f:[{v:'front',p:[50,88],t:-100,ts:.9,h:-100,L:[[-105,95,.55,.35],[-75,85,.55,.35]],A:[{to:[35,82],b:1},{to:[36.5,82],b:-1}],fa:[165,15],db:['end',null]},
     {v:'front',p:[50,88],t:-80,ts:.9,h:-80,L:[[-105,95,.55,.35],[-75,85,.55,.35]],A:[{to:[63.5,82],b:1},{to:[65,82],b:-1}],fa:[165,15],db:[null,'end']}]},
 {n:'Elevación de piernas',r:'3 × 15',c:'Zona lumbar pegada al piso. Baja las piernas lento sin tocar el suelo.',
  f:[{p:[55,87],t:180,h:-170,A:[[2,0],[3,1]],L:[[-8,-8],[-7.5,-7.5]],fa:[-90,-90]},
     {p:[55,87],t:180,h:-170,A:[[2,0],[3,1]],L:[[-90,-90],[-89,-89]],fa:[0,0]}]}
]}
];

if(typeof module!=='undefined') module.exports={DAYS,exSVG,frameSVG};
