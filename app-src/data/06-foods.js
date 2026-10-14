/* Alimentos (valores por 100 g, aproximados de tablas de composición) y comidas típicas colombianas.
   u: [singular, plural, gramos por unidad]; st: paso de redondeo en unidades; mn/mx: límites en unidades. g: grupo para la lista de mercado.
   raw: factor cocido → crudo para comprar (arroz, granos, pasta). */
const FOODS={
  huevo:{n:'huevo',k:143,p:12.6,c:0.7,f:9.5,u:['huevo','huevos',50],st:1,mn:1,mx:3,g:'prot'},
  pollo:{n:'pechuga de pollo',k:165,p:31,c:0,f:3.6,u:['g','g',1],st:10,mn:80,mx:260,g:'prot'},
  res:{n:'carne de res magra',k:200,p:26,c:0,f:10,u:['g','g',1],st:10,mn:80,mx:240,g:'prot'},
  molida:{n:'carne molida magra',k:215,p:26,c:0,f:12,u:['g','g',1],st:10,mn:60,mx:200,g:'prot'},
  cerdo:{n:'lomo de cerdo',k:190,p:27,c:0,f:8,u:['g','g',1],st:10,mn:80,mx:240,g:'prot'},
  pescado:{n:'tilapia o mojarra',k:128,p:26,c:0,f:2.7,u:['g','g',1],st:10,mn:100,mx:280,g:'prot'},
  atun:{n:'atún en agua',k:116,p:26,c:0,f:1,u:['lata','latas',100],st:.5,mn:.5,mx:2,g:'prot'},
  queso:{n:'queso campesino',k:264,p:20,c:3,f:19,u:['tajada','tajadas',30],st:1,mn:1,mx:3,g:'lact'},
  yogur:{n:'yogur griego natural',k:75,p:9,c:4,f:2.5,u:['vaso','vasos',150],st:.5,mn:.5,mx:2,g:'lact'},
  leche:{n:'leche descremada',k:34,p:3.4,c:5,f:.1,u:['vaso','vasos',250],st:.5,mn:.5,mx:2,g:'lact'},
  whey:{n:'proteína en polvo',k:400,p:80,c:10,f:5,u:['scoop','scoops',30],st:.5,mn:.5,mx:2,g:'otros'},
  lenteja:{n:'lentejas cocidas',k:116,p:9,c:20,f:.4,u:['cucharón','cucharones',120],st:.5,mn:.5,mx:3,g:'granos',raw:2.4,rn:'lentejas'},
  frijol:{n:'fríjoles cocidos',k:127,p:8.7,c:22.8,f:.5,u:['cucharón','cucharones',120],st:.5,mn:.5,mx:3,g:'granos',raw:2.4,rn:'fríjoles'},
  garbanzo:{n:'garbanzos cocidos',k:164,p:8.9,c:27,f:2.6,u:['cucharón','cucharones',120],st:.5,mn:.5,mx:3,g:'granos',raw:2.3,rn:'garbanzos'},
  arroz:{n:'arroz blanco cocido',k:130,p:2.7,c:28,f:.3,u:['taza','tazas',150],st:.25,mn:.25,mx:1.75,g:'granos',raw:2.5,rn:'arroz'},
  pasta:{n:'pasta cocida',k:158,p:5.8,c:31,f:.9,u:['taza','tazas',140],st:.25,mn:.5,mx:2.5,g:'granos',raw:2.2,rn:'pasta'},
  arepa:{n:'arepa de maíz',k:220,p:5,c:45,f:2,u:['arepa','arepas',80],st:.5,mn:.5,mx:3,g:'granos'},
  pan:{n:'pan integral',k:250,p:12,c:42,f:3.5,u:['tajada','tajadas',30],st:1,mn:1,mx:4,g:'granos'},
  avena:{n:'avena en hojuelas',k:380,p:13,c:67,f:7,u:['cucharada','cucharadas',10],st:1,mn:2,mx:10,g:'granos'},
  papa:{n:'papa cocida',k:87,p:1.9,c:20,f:.1,u:['papa pequeña','papas pequeñas',100],st:.5,mn:.5,mx:4,g:'fruver'},
  yuca:{n:'yuca cocida',k:160,p:1.4,c:38,f:.3,u:['trozo','trozos',100],st:.5,mn:.5,mx:3,g:'fruver'},
  platano:{n:'plátano maduro asado',k:122,p:1.3,c:32,f:.4,u:['plátano','plátanos',200],st:.25,mn:.25,mx:.75,g:'fruver'},
  banano:{n:'banano',k:89,p:1.1,c:23,f:.3,u:['banano','bananos',120],st:.5,mn:.5,mx:2,g:'fruver'},
  papaya:{n:'papaya picada',k:43,p:.5,c:11,f:.3,u:['taza','tazas',150],st:.5,mn:.5,mx:2,g:'fruver'},
  mango:{n:'mango',k:60,p:.8,c:15,f:.4,u:['taza','tazas',150],st:.5,mn:.5,mx:1.5,g:'fruver'},
  fresa:{n:'fresas',k:32,p:.7,c:7.7,f:.3,u:['taza','tazas',150],st:.5,mn:.5,mx:2,g:'fruver'},
  manzana:{n:'manzana',k:52,p:.3,c:14,f:.2,u:['manzana','manzanas',160],st:1,mn:1,mx:2,g:'fruver'},
  aguacate:{n:'aguacate',k:160,p:2,c:9,f:15,u:['cuarto de aguacate','cuartos de aguacate',50],st:1,mn:1,mx:2,g:'fruver'},
  ensalada:{n:'ensalada de tomate, lechuga y pepino',k:17,p:.9,c:3.4,f:.2,u:['plato','platos',150],st:1,mn:1,mx:1,g:'fruver'},
  verduras:{n:'verduras salteadas',k:35,p:2,c:6,f:.4,u:['taza','tazas',150],st:1,mn:1,mx:1,g:'fruver'},
  hogao:{n:'hogao',k:60,p:1.5,c:7,f:3,u:['cucharada','cucharadas',15],st:1,mn:1,mx:3,g:'fruver'},
  aceite:{n:'aceite',k:884,p:0,c:0,f:100,u:['cucharadita','cucharaditas',5],st:1,mn:1,mx:3,g:'otros'},
  mani:{n:'maní',k:567,p:26,c:16,f:49,u:['puñado','puñados',30],st:.5,mn:.5,mx:1.5,g:'otros'},
  bocadillo:{n:'bocadillo',k:300,p:.5,c:75,f:0,u:['bocadillo','bocadillos',30],st:1,mn:1,mx:2,g:'otros'},
  cafe:{n:'tinto o café con poca leche',k:20,p:1,c:2,f:.6,u:['pocillo','pocillos',150],st:1,mn:1,mx:1,g:'otros'}
};
const FGROUP={prot:'Carnes, pollo, pescado y huevos',lact:'Lácteos',granos:'Granos, arroz y harinas',fruver:'Frutas, verduras y tubérculos',otros:'Otros'};
/* Comidas: p = proteína que se ajusta (alternativa sin carne en pv), c = carbohidratos que se ajustan, x = fijos [alimento, unidades] */
const MEALS={
  des:[
    {t:'Arepa con huevos y queso',p:['huevo'],c:['arepa'],x:[['queso',1],['cafe',1]]},
    {t:'Huevos pericos con arepa y fruta',p:['huevo'],c:['arepa'],x:[['hogao',2],['papaya',1]]},
    {t:'Calentado liviano con huevo',p:['huevo'],c:['arroz','frijol'],x:[['hogao',1],['cafe',1]]},
    {t:'Avena con banano',p:['leche'],c:['avena','banano'],x:[],w:'whey'},
    {t:'Pan integral con huevo y aguacate',p:['huevo'],c:['pan'],x:[['aguacate',1],['cafe',1]]},
    {t:'Yogur griego con avena y fresas',p:['yogur'],c:['avena'],x:[['fresa',1]]}
  ],
  alm:[
    {t:'Bandeja paisa liviana',tv:'Bandeja paisa vegetariana',p:['molida'],pv:['huevo'],c:['arroz','frijol'],x:[['platano',.25],['aguacate',1],['ensalada',1]]},
    {t:'Pollo a la plancha con arroz, maduro y ensalada',tv:'Garbanzos con arroz, maduro y ensalada',p:['pollo'],pv:['garbanzo'],c:['arroz','platano'],x:[['ensalada',1],['aceite',1]]},
    {t:'Tilapia con arroz, patacón al horno y ensalada',tv:'Huevos con arroz, maduro y ensalada',p:['pescado'],pv:['huevo'],c:['arroz','platano'],x:[['ensalada',1],['aguacate',1]]},
    {t:'Lentejas con arroz y carne',tv:'Lentejas con arroz y queso',p:['res'],pv:['queso'],c:['arroz','lenteja'],x:[['ensalada',1],['aceite',1]]},
    {t:'Sudado de pollo con papa y yuca',tv:'Sudado de garbanzos con papa y yuca',p:['pollo'],pv:['garbanzo'],c:['papa','yuca','arroz'],x:[['hogao',2]]},
    {t:'Carne asada con papa y ensalada',tv:'Huevos con papa, arroz y ensalada',p:['res'],pv:['huevo'],c:['papa','arroz'],x:[['ensalada',1],['aguacate',1]]},
    {t:'Pasta con pollo y verduras',tv:'Pasta con garbanzos y verduras',p:['pollo'],pv:['garbanzo'],c:['pasta'],x:[['verduras',1],['aceite',1]]}
  ],
  cen:[
    {t:'Pechuga con papa y verduras',tv:'Tortilla de huevo con papa y verduras',p:['pollo'],pv:['huevo'],c:['papa'],x:[['verduras',1],['aceite',1]]},
    {t:'Tortilla de huevos con verduras y arepa',p:['huevo'],c:['arepa'],x:[['verduras',1],['queso',1]]},
    {t:'Atún con arroz y ensalada',tv:'Fríjoles con arroz, queso y ensalada',p:['atun'],pv:['frijol','queso'],c:['arroz'],x:[['ensalada',1],['aguacate',1]]},
    {t:'Carne con yuca y ensalada',tv:'Garbanzos con yuca y ensalada',p:['res'],pv:['garbanzo'],c:['yuca'],x:[['ensalada',1],['aceite',1]]},
    {t:'Pescado con plátano y verduras',tv:'Huevos con plátano y verduras',p:['pescado'],pv:['huevo'],c:['platano'],x:[['verduras',1],['aceite',1]]},
    {t:'Lomo de cerdo con papa y ensalada',tv:'Lentejas con papa y ensalada',p:['cerdo'],pv:['lenteja'],c:['papa'],x:[['ensalada',1]]}
  ],
  med:[
    {t:'Fruta con yogur griego',p:['yogur'],c:['mango'],x:[]},
    {t:'Queso campesino con bocadillo',p:['queso'],c:['bocadillo'],x:[]},
    {t:'Maní y banano',p:['mani'],c:['banano'],x:[]},
    {t:'Batido de leche, banano y avena',p:['leche'],c:['banano','avena'],x:[],w:'whey'},
    {t:'Pan integral con queso',p:['queso'],c:['pan'],x:[]},
    {t:'Huevos cocidos y manzana',p:['huevo'],c:['manzana'],x:[]}
  ]
};
// Orden y reparto de calorías según cuántas comidas al día
const MEALPLAN={3:[['des','Desayuno',.3],['alm','Almuerzo',.4],['cen','Cena',.3]],
  4:[['des','Desayuno',.25],['alm','Almuerzo',.35],['med','Onces',.15],['cen','Cena',.25]],
  5:[['des','Desayuno',.22],['med','Media mañana',.1],['alm','Almuerzo',.33],['med','Onces',.12],['cen','Cena',.23]]};
if(typeof module!=='undefined')module.exports={FOODS,MEALS,MEALPLAN};
