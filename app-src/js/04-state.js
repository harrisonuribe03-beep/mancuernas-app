/* Estado global, sincronización con la nube y persistencia */
let todayIdx=(new Date().getDay()+6)%7;
const S={tab:'hoy',sel:todayIdx,
  settings:Object.assign({name:'',kg:5,rest:'auto',warm:true,sound:true,vib:true,wake:true,notif:true,mode:'full',theme:'system',remind:false,remindTime:'18:00',core:false,pack:'gym',voice:'basic',vvoice:'salome',vrate:1,vol:.9,accent:'azul',weekly:true},LS.get('mc-set',{})),
  history:LS.get('mc-hist',[]),body:LS.get('mc-body',[]),store:'local',live:null,summary:null,
  lib:{q:'',g:'Todos'},prog:{ex:null,mo:0,bar:null}};
// v6: sonidos reales y voz de Salomé para todos (una sola vez)
if(!S.settings.audioV){S.settings.pack='gym';S.settings.vvoice='salome';S.settings.audioV=2;LS.set('mc-set',S.settings);}
if(typeof S.settings.rest==='number'&&![60,90,120].includes(S.settings.rest))S.settings.rest='auto';
S.history.sort((a,b)=>b.ts-a.ts);S.body.sort((a,b)=>a.ts-b.ts);
const live0=LS.get('mc-live3',null);
if(live0&&Date.now()-live0.t0<8*3600e3) S.live=live0; else LS.del('mc-live3');

/* ---------- almacenamiento ---------- */
let COL=null;
const stripId=h=>{const c=Object.assign({},h);delete c.id;return c;};
async function initDb(){
  try{
    if(CAP||!window.claude||typeof window.claude.use!=='function') return;
    const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);
    if(!db||!user) return;
    const id=await user.id(); if(!id) return;
    COL=db.collection('data/users/'+id);
    const snap=await COL.get();
    const remote=[],rbody=[],racts=[];let rs=null,rp=null;
    snap.docs.forEach(d=>{if(!d.exists)return;const v=d.data();
      if(d.id==='mc-settings') rs=v; else if(d.id==='mc-program') rp=v; else if(d.id.indexOf('mca-')===0) racts.push(Object.assign({},v,{id:d.id})); else if(d.id.indexOf('mcb-')===0) rbody.push(Object.assign({},v,{id:d.id})); else if(d.id.indexOf('mc-')===0) remote.push(Object.assign({},v,{id:d.id}));});
    const bids=new Set(rbody.map(x=>x.id)),bLocal=S.body.filter(b=>!bids.has(b.id));
    for(const b of bLocal){try{await COL.doc(b.id).set(stripId(b));}catch(e){}}
    S.body=rbody.concat(bLocal).sort((a,b)=>a.ts-b.ts);LS.set('mc-body',S.body);
    const ids=new Set(remote.map(x=>x.id));
    const localOnly=S.history.filter(h=>!ids.has(h.id));
    for(const h of localOnly){try{await COL.doc(h.id).set(stripId(h));}catch(e){}}
    S.history=remote.concat(localOnly).sort((a,b)=>b.ts-a.ts);
    if(rs) S.settings=Object.assign(S.settings,rs);
    if(rp&&rp.v===4&&(!S.program||(rp.at||0)>(S.program.at||0)||S.program.legacy&&!rp.legacy)){S.program=rp;LS.set('mc-prog',rp);rebuildProgram();}
    else if(!S.program.legacy||LS.get('mc-prog',null)){try{await COL.doc('mc-program').set(JSON.parse(JSON.stringify(S.program)));}catch(e){}}
    if(typeof mergeActs==='function')await mergeActs(racts);
    S.store='db';LS.set('mc-hist',S.history);LS.set('mc-set',S.settings);
    applyTheme();if($('#player').hidden&&$('#onb').hidden) render();
  }catch(e){COL=null;}
}
function saveSettings(){LS.set('mc-set',S.settings);if(COL)COL.doc('mc-settings').set(Object.assign({},S.settings)).catch(()=>{});}
function addSession(rec){S.history.unshift(rec);LS.set('mc-hist',S.history);if(COL)COL.doc(rec.id).set(stripId(rec)).catch(()=>{});}
function delSession(id){S.history=S.history.filter(h=>h.id!==id);LS.set('mc-hist',S.history);if(COL)COL.doc(id).delete().catch(()=>{});}
function addBody(b){S.body=S.body.filter(x=>x.id!==b.id).concat([b]).sort((x,y)=>x.ts-y.ts);LS.set('mc-body',S.body);if(COL)COL.doc(b.id).set(stripId(b)).catch(()=>{});}
function delBody(id){S.body=S.body.filter(x=>x.id!==id);LS.set('mc-body',S.body);if(COL)COL.doc(id).delete().catch(()=>{});}
function updSession(rec){const i=S.history.findIndex(h=>h.id===rec.id);if(i>=0)S.history[i]=rec;LS.set('mc-hist',S.history);if(COL)COL.doc(rec.id).set(stripId(rec)).catch(()=>{});}
function saveLive(){if(S.live)LS.set('mc-live3',S.live);else LS.del('mc-live3');}

