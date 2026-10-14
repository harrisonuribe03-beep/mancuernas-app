/* Plan v2: ajustes del entrenador sobre DAYS (rangos de repeticiones, equilibrio empuje/tirón, core más seguro) */
(function(){
  const D={};DAYS.forEach(d=>D[d.id]=d);
  const find=n=>{for(const d of DAYS)for(const e of d.ex)if(e.n===n)return e;return null;};
  const ly2=o=>Object.assign({p:[62,88],t:180,h:-170,L:[[-55,80],[-58,82]],db:'end'},o);
  const set=(n,r,c)=>{const e=find(n);if(e){e.r=r;if(c)e.c=c;}return e;};

  // Lunes
  set('Press de pecho en el piso','4 × 8–12');
  set('Press militar sentado','4 × 8–12');
  const ap=set('Aperturas en el piso','3 × 12–20','Codos un poco doblados todo el recorrido. Abre hasta sentir el pecho estirado.');
  ap.pr=[];ap.f=[ly2({A:[[-90,-90],[-89,-89]],db:'perp'}),ly2({A:[[80,-70,.25,.35],[82,-68,.25,.35]],db:'perp'})];
  const lat=set('Elevaciones laterales','3 × 12–20','Lleva las mancuernas un poco al frente del cuerpo y sube hasta la altura de los hombros.');
  set('Extensión de tríceps sobre la cabeza','3 × 12–20');
  set('Flexiones de pecho','2 × al fallo','Cuerpo recto. Para cuando la técnica se dañe (cadera que cae o recorrido corto), no cuando ya no puedas más.');
  // Martes
  set('Remo a una mano','4 × 8–12 por lado');
  const rinc=set('Remo inclinado','3 × 8–12');
  set('Pullover acostado','3 × 12–15','Agarra la mancuerna por el disco de arriba con las dos manos. Bájala detrás de la cabeza sin despegar la espalda.');
  const paj=set('Pájaros','3 × 15–20');
  set('Curl de bíceps','3 × 10–15');
  set('Curl martillo','3 × 10–15');
  // Miércoles
  set('Sentadilla goblet','4 × 10–20');
  set('Peso muerto rumano','4 × 10–15');
  set('Zancadas alternas','3 × 8–15 por pierna','Paso largo, pies separados como sobre rieles de tren. La rodilla de atrás casi toca el piso.');
  set('Sentadilla búlgara','3 × 8–15 por pierna','Empeine de atrás sobre una silla firme contra la pared. El peso va en la pierna de adelante.');
  set('Elevación de talones','4 × 15–25');
  set('Plancha','3 × 30–45 s');
  // Jueves
  const push=find('Flexiones de pecho');
  D.jueves.ex=[
    set('Press de pecho agarre neutro','4 × 8–12'),
    set('Press Arnold','3 × 8–12'),
    set('Flexiones con pies elevados','3 × al fallo','Pies en la silla. Para cuando la cadera se caiga o el recorrido se acorte.'),
    lat,
    {n:'Flexiones cerradas',r:'3 × 8–15',c:'Manos al ancho de los hombros y codos pegados al cuerpo al bajar.',f:push.f},
    set('Patada de tríceps','3 × 12–20')
  ];
  // Viernes
  const r1=find('Remo a una mano');
  D.viernes.ex=[
    {n:'Remo inclinado agarre supino',r:'4 × 10–15',c:'Palmas al frente, torso a unos 45° y espalda recta. Lleva los codos atrás pegados al cuerpo.',f:rinc.f},
    {n:'Remo a una mano con pausa',r:'3 × 10–15 por lado',c:'Igual que el del martes, pero sostén un segundo arriba apretando la espalda.',f:r1.f,pr:r1.pr},
    paj,
    set('Curl concentrado','3 × 10–15 por brazo'),
    set('Curl inverso','2 × 12–15','Palmas hacia abajo todo el recorrido. Trabaja sobre todo el braquial y el antebrazo.'),
    {n:'Bird dog',r:'3 × 8 por lado',c:'En cuatro apoyos, estira brazo y pierna contrarios sin mover la cadera. Sostén dos segundos.',
     f:[{p:[34,70],t:-6,h:-6,A:[[90,90],[92,88]],L:[[90,180],[90.5,180]],fa:[180,180]},
        {p:[34,70],t:-6,h:-6,A:[[90,90],[-6,-6]],L:[[178,178],[90.5,180]],fa:[100,180]}]}
  ];
  // Sábado
  const sumo=set('Sentadilla sumo','4 × 10–20');
  const ht=find('Hip thrust en el piso');ht.n='Puente de glúteo con mancuerna';ht.r='4 × 10–20';ht.c='Mancuerna sobre la cadera. Sube hasta alinear rodillas, cadera y hombros con las costillas abajo. Aprieta un segundo.';
  D.sabado.ex=[sumo,ht,
    set('Step-ups','3 × 8–15 por pierna','Escalón o silla firme contra la pared. Sube sin impulsarte con la pierna de abajo.'),
    set('Zancada reversa','3 × 8–15 por pierna'),
    {n:'Plancha lateral',r:'3 × 20–40 s por lado',c:'Codo bajo el hombro y cuerpo en línea recta. No dejes caer la cadera.',
     f:[{p:[42,84],t:-17,h:-17,A:[[90,90,1,.2],[-80,-85]],L:[[170,170],[169,169]],fa:[95,95]}]},
    {n:'Elevación de piernas con rodillas dobladas',r:'3 × 10–15',c:'Rodillas a 90°. Llévalas al pecho despegando un poco la cadera y baja lento.',
     f:[{p:[55,87],t:180,h:-170,A:[[2,0],[3,1]],L:[[-50,10],[-48,12]]},{p:[55,86],t:180,h:-170,A:[[2,0],[3,1]],L:[[-110,20],[-108,22]]}]}
  ];
  // descanso recomendado por ejercicio (s)
  const R={120:['Sentadilla goblet','Peso muerto rumano','Zancadas alternas','Sentadilla búlgara','Sentadilla sumo','Puente de glúteo con mancuerna','Step-ups','Zancada reversa'],
    90:['Press de pecho en el piso','Press militar sentado','Remo a una mano','Remo inclinado','Pullover acostado','Flexiones de pecho','Press de pecho agarre neutro','Press Arnold','Flexiones con pies elevados','Flexiones cerradas','Remo inclinado agarre supino','Remo a una mano con pausa'],
    45:['Plancha','Plancha lateral','Elevación de piernas con rodillas dobladas','Bird dog']};
  DAYS.forEach(d=>d.ex.forEach(e=>{e.rest=60;for(const k in R)if(R[k].includes(e.n))e.rest=+k;}));
})();
