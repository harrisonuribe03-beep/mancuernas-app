const R=require('./rig.js');const {arm,leg,torso,head,neck,bar,pbar,bench,shadow}=R;
const fig=(o)=>{ // orden: brazo lejano, pierna lejana, tronco, pierna cercana, cuello, cabeza, brazo cercano
  const c=o.col||{};let s='';
  if(o.armF)s+=`<g opacity=".93">${arm(o.sh,...o.armF,c.armF)}</g>`;
  if(o.legF)s+=`<g opacity=".93">${leg(o.hip,...o.legF,c.legF)}</g>`;
  s+=torso(o.sh,o.hip,c.torso,o.face||1);
  if(o.legN)s+=leg(o.hip,...o.legN,c.legN);
  s+=neck(o.sh,o.hd)+head(o.hd,o.face||1,o.tilt||0);
  if(o.armN)s+=arm(o.sh,...o.armN,c.armN);
  return s;};
const P={
 'colgado-de-la-barra':()=>bar(170,430,40,525)+shadow(300,566,70)+fig({sh:[300,182],hip:[300,307],hd:[312,150],tilt:-6,
   armF:[[296,116],[294,52],null],armN:[[306,116],[308,52],null],legF:[[296,402],[294,494],[300,516]],legN:[[304,402],[306,494],[316,514]],col:{torso:['lats'],armN:['bi']}}),
 'rodillas-al-pecho-en-paralelas':()=>pbar(170,262,280,250)+shadow(300,520,110)+fig({sh:[300,140],hip:[292,262],hd:[312,104],
   armF:[[296,200],[294,262],null],armN:[[304,200],[304,262],null],legF:[[352,226],[360,316],[382,322]],legN:[[362,230],[372,320],[394,326]],col:{torso:['abs']}}),
 'flexiones-declinadas-en-banco':()=>bench(40,326,190,144)+shadow(300,474,200)+fig({sh:[400,402],hip:[280,366],hd:[440,410],tilt:18,
   armF:[[352,446],[414,468],null],armN:[[358,452],[424,470],null],legF:[[189,340],[104,314],[96,334]],legN:[[189,340],[104,314],[100,336]],col:{torso:['chest'],armN:['tri']}}),
 'fondos-en-banco':()=>bench(110,330,190,140)+shadow(330,474,200)+fig({sh:[312,350],hip:[324,452],hd:[322,312],
   armF:[[252,368],[288,333],null],armN:[[258,372],[296,333],null],legF:[[412,452],[502,458],[512,436]],legN:[[414,454],[504,460],[516,438]],col:{armN:['tri']}}),
 'step-ups-al-banco':()=>bench(300,360,190,110)+shadow(330,474,170)+fig({sh:[322,92],hip:[300,215],hd:[334,58],
   armF:[[300,160],[288,222],null],armN:[[334,162],[354,222],null],legF:[[286,308],[266,398],[286,412]],legN:[[382,258],[362,348],[392,354]],col:{legN:['quad']}}),
 'saltos-al-banco':()=>bench(250,372,210,98)+shadow(355,474,140)+`<g stroke="#16130f" stroke-width="3" stroke-linecap="round" opacity=".35"><path d="M200 300 h40"/><path d="M190 330 h50"/><path d="M205 360 h35"/></g>`+fig({sh:[374,142],hip:[318,252],hd:[404,112],tilt:10,
   armF:[[414,186],[462,170],null],armN:[[420,192],[470,178],null],legF:[[392,284],[356,360],[382,366]],legN:[[400,288],[364,362],[390,368]],col:{legN:['quad','calf']}}),
 'flexiones-diamante':()=>shadow(270,474,220)+fig({sh:[392,424],hip:[268,434],hd:[432,418],tilt:12,
   armF:[[336,428],[372,466],null],armN:[[342,434],[380,467],null],legF:[[173,441],[82,448],[88,470]],legN:[[174,443],[84,450],[92,471]],col:{torso:['chest'],armN:['tri']}}),
 'burpees':()=>shadow(300,566,60)+`<g stroke="#16130f" stroke-width="3" stroke-linecap="round" opacity=".35"><path d="M270 540 v14"/><path d="M300 534 v20"/><path d="M330 540 v14"/></g>`+fig({sh:[306,190],hip:[300,315],hd:[316,156],
   armF:[[296,124],[290,62],null],armN:[[318,124],[326,62],null],legF:[[298,410],[294,500],[312,514]],legN:[[304,410],[306,500],[324,514]],col:{legN:['quad'],torso:['chest']}})
};
module.exports=P;
if(require.main===module){
 const {chromium}=require('playwright');const fs=require('fs');
 (async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:600,height:600}});
  for(const k in P){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">${P[k]()}</svg>`;
   await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);await p.screenshot({path:`out-${k}.png`,omitBackground:true});}
  await b.close();console.log('ok');})();}
