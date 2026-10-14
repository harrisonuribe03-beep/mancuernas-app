/* Vista Progreso */
/* ---------- progreso ---------- */
function niceMax(v){if(v<=0)return 100;const p=Math.pow(10,Math.floor(Math.log10(v)));const n=v/p;return (n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p;}
function weeklyVolume(){
  const ws=weekStart(Date.now()),out=[];
  for(let k=7;k>=0;k--){const s=ws-k*7*864e5,e=s+7*864e5,d=new Date(s);
    out.push({s,v:S.history.filter(h=>h.ts>=s&&h.ts<e).reduce((a,h)=>a+(h.vol||0),0),label:d.getDate()+'/'+(d.getMonth()+1)});}
  return out;
}
function barChart(data){
  const W=340,H=150,L=34,R=4,T=8,B=22,iw=W-L-R,ih=H-T-B,mx=niceMax(Math.max(...data.map(d=>d.v)));
  const bw=iw/data.length,gap=8,last=data.length-1;
  const sel=S.prog.bar??(data[last].v?last:last-1);
  let g='';
  for(let k=0;k<=2;k++){const y=T+ih-ih*k/2,v=mx*k/2;g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text class="ax" x="${L-6}" y="${y+3}" text-anchor="end">${v>=1000?NF.format(v/1000)+'k':NF.format(v)}</text>`;}
  data.forEach((d,i)=>{const x=L+i*bw+gap/2,w=bw-gap,hh=d.v?Math.max(3,ih*d.v/mx):0,y=T+ih-hh,r=Math.min(5,w/2,hh);
    const path=hh?`M${x} ${T+ih}V${y+r}Q${x} ${y} ${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${T+ih}Z`:'';
    g+=`<g data-act="bar" data-v="${i}"><rect class="hit" x="${L+i*bw}" y="${T}" width="${bw}" height="${ih+B}"/>${path?`<path class="bar ${i===sel?'on':''} ${i===last?'cur':''}" d="${path}"/>`:(i===last?`<line x1="${x+2}" x2="${x+w-2}" y1="${T+ih-1}" y2="${T+ih-1}" stroke="var(--acc)" stroke-width="2" stroke-dasharray="3 3"/>`:'')}<text class="ax" x="${x+w/2}" y="${H-6}" text-anchor="middle">${i===last?'Esta':d.label}</text></g>`;});
  const sd=data[sel],prev=data[sel-1];
  let tr='';if(sel===last)tr='<em style="color:var(--tx3)">en curso</em>';else if(prev&&prev.v&&sd.v){const pc=Math.round((sd.v-prev.v)/prev.v*100);if(pc)tr=`<em class="${pc>0?'up':'down'}">${pc>0?'+':''}${pc}%</em>`;}
  const lab=sel===last?'Esta semana':sel===last-1?'Semana pasada':'Semana del '+sd.label;
  return `<div class="cap"><span>${lab}</span><b>${NF.format(sd.v)} kg${tr}</b></div><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kilos movidos por semana">${g}</svg>`;
}
function exSeries(name){
  const w=weighted(name),pts=[];
  S.history.slice().sort((a,b)=>a.ts-b.ts).forEach(h=>{const x=(h.ex||[]).find(z=>z.n===name);const rs=x?x.s.filter(s=>s[2]!=='c'):[];if(!rs.length)return;
    let b=null;rs.forEach(s=>{if(better(name,s,b))b=s;});if(!b)b=rs[0];pts.push({ts:h.ts,v:w?Math.round(e1rm(b)*10)/10:b[1],b});});
  return pts.slice(-12);
}
function lineChart(name,small){
  const pts=name?exSeries(name):[];
  const W=340,H=small?120:150,L=34,R=12,T=12,B=22,iw=W-L-R,ih=H-T-B;
  if(!pts.length)return `<div class="cap"><span>Sin registros todavía</span></div><svg viewBox="0 0 ${W} ${H}"><line class="gl" x1="${L}" x2="${W-R}" y1="${T+ih}" y2="${T+ih}"/><text class="empty" x="${W/2}" y="${H/2}" text-anchor="middle">Entrena este ejercicio para ver tu progreso</text></svg>`;
  let lo=Math.min(...pts.map(p=>p.v)),hi=Math.max(...pts.map(p=>p.v));
  if(lo===hi){lo=Math.max(0,lo-2);hi=hi+2;}else{const pad=(hi-lo)*.25;lo=Math.max(0,lo-pad);hi=hi+pad;}
  const X=i=>pts.length===1?L+iw/2:L+iw*i/(pts.length-1),Y=v=>T+ih-ih*(v-lo)/(hi-lo);
  let g='';
  for(let k=0;k<=2;k++){const v=lo+(hi-lo)*k/2,y=Y(v);g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text class="ax" x="${L-6}" y="${y+3}" text-anchor="end">${NF.format(Math.round(v))}</text>`;}
  const line=pts.map((p,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(p.v).toFixed(1)).join('');
  if(pts.length>1)g+=`<path class="area" d="${line}L${X(pts.length-1)} ${T+ih}L${X(0)} ${T+ih}Z"/><path class="ln" d="${line}"/>`;
  pts.forEach((p,i)=>{g+=`<circle class="pt" cx="${X(i)}" cy="${Y(p.v)}" r="${i===pts.length-1?5.5:3.5}"/>`;});
  const fd=ts=>{const d=new Date(ts);return d.getDate()+'/'+(d.getMonth()+1);};
  g+=`<text class="ax" x="${X(0)}" y="${H-6}" text-anchor="${pts.length>1?'start':'middle'}">${fd(pts[0].ts)}</text>`;
  if(pts.length>1)g+=`<text class="ax" x="${X(pts.length-1)}" y="${H-6}" text-anchor="end">${fd(pts[pts.length-1].ts)}</text>`;
  const first=pts[0],last=pts[pts.length-1];let tr='';
  let since='Mejor serie';if(pts.length>1&&first.v){const pc=Math.round((last.v-first.v)/first.v*100);if(pc){tr=`<em class="${pc>0?'up':'down'}">${pc>0?'+':''}${pc}%</em>`;since=`Mejor serie · cambio desde el ${fd(first.ts)}`;}}
  return `<div class="cap"><span>${since}</span><b>${fmtSet(name,last.b)}${tr}</b></div><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Progreso de ${esc(name)}">${g}</svg>`;
}
function calendar(){
  const base=new Date();base.setDate(1);base.setMonth(base.getMonth()+S.prog.mo);
  const y=base.getFullYear(),m=base.getMonth(),days=new Date(y,m+1,0).getDate(),off=(new Date(y,m,1).getDay()+6)%7;
  const set=new Set(S.history.map(h=>dayKey(h.ts))),tk=dayKey(Date.now());
  let cnt=0,g=LETTERS.map(l=>`<span class="dn">${l}</span>`).join('')+'<span></span>'.repeat(off);
  for(let d=1;d<=days;d++){const k=y+'-'+(m+1)+'-'+d,on=set.has(k);if(on)cnt++;g+=`<span class="d ${on?'on':''} ${k===tk?'today':''}">${d}</span>`;}
  return `<div class="card cal"><div class="hd"><button class="iconbtn" data-act="mo" data-v="-1" aria-label="Mes anterior">${IC.left}</button><b>${cap1(base.toLocaleDateString('es-CO',{month:'long',year:'numeric'}))}</b><button class="iconbtn" data-act="mo" data-v="1" aria-label="Mes siguiente" ${S.prog.mo>=0?'disabled':''}>${IC.right}</button></div><div class="grid">${g}</div><div class="ft">${pl(cnt,'día entrenado','días entrenados')} este mes</div></div>`;
}
function achievements(){return achv();}
function achievementsOld(){
  const n=S.history.length,vol=S.history.reduce((a,h)=>a+(h.vol||0),0),st=streak();
  const weeks={};S.history.forEach(h=>{const k=weekStart(h.ts);(weeks[k]=weeks[k]||new Set()).add(h.day);});
  const best=Math.max(0,...Object.values(weeks).map(s=>s.size)),prs=S.history.reduce((a,h)=>a+((h.pr||[]).length),0);
  return [
    {ic:IC.star,t:'Primer entreno',on:n>=1,p:`${Math.min(n,1)}/1`},
    {ic:IC.flame.replace('<svg','<svg class="i"'),t:'Racha de 5',on:st>=5,p:`${Math.min(st,5)}/5`},
    {ic:IC.cal,t:'Semana completa',on:best>=trainDays(),p:`${Math.min(best,trainDays())}/${trainDays()}`},
    {ic:IC.trophy,t:'5 récords',on:prs>=5,p:`${Math.min(prs,5)}/5`},
    {ic:IC.bolt,t:'10 entrenos',on:n>=10,p:`${Math.min(n,10)}/10`},
    {ic:IC.dumb,t:'1.000 kg',on:vol>=1000,p:NF.format(Math.min(vol,1000))},
    {ic:IC.bolt,t:'30 entrenos',on:n>=30,p:`${Math.min(n,30)}/30`},
    {ic:IC.dumb,t:'10.000 kg',on:vol>=10000,p:NF.format(Math.min(vol,10000))}];
}
function heatmap(){
  const W=18,D=864e5,end=weekStart(Date.now())+7*D,start=end-W*7*D,sets={},acts={};
  S.history.forEach(h=>{if(h.ts>=start){const k=dayKey(h.ts);sets[k]=(sets[k]||0)+(h.sets||0);}});
  S.acts.forEach(a=>{if(a.ts>=start){const k=dayKey(a.ts);acts[k]=1;}});
  let cells='',months='',lastM=-1,train=0;
  for(let w=0;w<W;w++){const ws=start+w*7*D,m=new Date(ws+3*D).getMonth();
    months+=`<span>${m!==lastM?cap1(new Date(ws+3*D).toLocaleDateString('es-CO',{month:'short'}).replace('.','')):''}</span>`;lastM=m;
    for(let d=0;d<7;d++){const t=ws+d*D+12*3600e3,k=dayKey(t),n=sets[k]||0,fut=t>Date.now();if(n)train++;
      const lv=n>=24?4:n>=16?3:n>=8?2:n>0?1:acts[k]?'a':0;
      cells+=`<i class="q${lv}${fut?' fut':''}" title="${new Date(t).toLocaleDateString('es-CO',{day:'numeric',month:'short'})}${n?': '+n+' series':''}"></i>`;}}
  return `<div class="card heat"><div class="hmm" style="grid-template-columns:repeat(${W},1fr)">${months}</div><div class="hmg" style="grid-template-columns:repeat(${W},1fr)">${cells}</div>
  <div class="hmf"><span>${pl(train,'día entrenado','días entrenados')} en ${W} semanas</span><span class="hml">Menos<i class="q0"></i><i class="q1"></i><i class="q2"></i><i class="q3"></i><i class="q4"></i>Más</span></div></div>`;
}
const PTABS=[['res','Resumen'],['cuerpo','Cuerpo'],['logros','Logros'],['hist','Historial']];
function viewProg(){
  S.ptab=S.ptab||'res';
  const vol=S.history.reduce((a,h)=>a+(h.vol||0),0),min=Math.round(S.history.reduce((a,h)=>a+h.dur,0)/60);
  const names=ALLEX.map(e=>e.n).filter(n=>S.history.some(h=>(h.ex||[]).some(z=>z.n===n)));
  if(!S.prog.ex||!names.includes(S.prog.ex))S.prog.ex=names[0]||null;
  let h=`<h1 class="h1" style="padding-top:6px">Progreso</h1><div class="subtabs" role="tablist">${PTABS.map(([k,l])=>`<button role="tab" data-act="ptab" data-v="${k}" aria-selected="${S.ptab===k}">${l}</button>`).join('')}</div>`;
  if(S.ptab==='res'){
    h+=`<div class="kpis"><div class="card"><b>${S.history.length}</b><span>entrenamientos</span></div><div class="card"><b>${vol>=100000?NF.format(Math.round(vol/1000))+'k':NF.format(vol)}</b><span>kg movidos</span></div><div class="card"><b>${min>=120?NF.format(Math.round(min/6)/10)+' h':min+' min'}</b><span>entrenando</span></div></div>
    <h2 class="h2">Constancia</h2>${heatmap()}
    <h2 class="h2">Calendario</h2>${calendar()}
    <h2 class="h2">Kilos por semana <small>8 semanas</small></h2><div class="card chart">${barChart(weeklyVolume())}</div>
    <h2 class="h2">Por ejercicio</h2><div class="card chart">`;
    h+=names.length?`<div class="selwrap"><select id="exsel" aria-label="Ejercicio">${names.map(n=>`<option ${n===S.prog.ex?'selected':''}>${n}</option>`).join('')}</select>${IC.down}</div>${lineChart(S.prog.ex)}<button class="btn sm ghost block" style="margin-top:10px" data-act="exd" data-v="${esc(S.prog.ex)}">Ver todo de este ejercicio</button>`:lineChart(null);
    h+=`</div>`;
  }else if(S.ptab==='cuerpo'){
    h+=`<h2 class="h2">Recuperación muscular</h2>${recoveryCard(true)}
    <h2 class="h2">Series por músculo</h2>${setsCard()}
    <h2 class="h2">Peso y medidas</h2>${bodyCard()}
    <h2 class="h2">Fotos de progreso <small>solo en este teléfono</small></h2>${photosCard()}`;
  }else if(S.ptab==='logros'){
    const ach=achievements(),L=myLevel();
    h+=`<div class="card lvhero">${emblem(L.ri,64)}<div><div class="over">Tu rango</div><b>${L.rank} · Nivel ${L.lv}</b><span class="xpbar"><i style="width:${Math.round(L.cur/L.need*100)}%"></i></span><small>${NF.format(L.need-L.cur)} XP para el nivel ${L.lv+1}</small></div></div>`;
    h+=`<h2 class="h2">Logros <small>${ach.filter(a=>a.on).length} de ${ach.length}</small></h2><div class="badges">${ach.map(a=>`<div class="card badge ${a.on?'on':''}"><span class="ic">${a.ic}</span><b>${a.t}</b><span>${a.on?'Logrado':a.p}</span></div>`).join('')}</div>`;
    const prs=names.map(n=>({n,b:bestOf(n,S.history)})).filter(x=>x.b);
    h+=`<h2 class="h2">Récords personales <small>toca para ver el detalle</small></h2>`+(prs.length?`<ul class="glist">${prs.map(x=>`<li><button class="kvrow" data-act="exd" data-v="${esc(x.n)}"><span>${x.n}</span><span class="v">${fmtSet(x.n,x.b)}</span></button></li>`).join('')}</ul>`:`<div class="card empty"><b>Aún sin récords</b>Tus mejores marcas aparecen aquí después de entrenar.</div>`);
  }else{
    if(!S.history.length)return h+`<div class="card empty" style="margin-top:14px"><b>Todavía no hay entrenamientos</b>Cuando termines el primero aparece aquí con tus pesos y repeticiones.</div>`;
    const wk={};S.history.forEach(x=>{const k=weekStart(x.ts);(wk[k]=wk[k]||[]).push(x);});
    Object.keys(wk).sort((a,b)=>b-a).forEach(k=>{const l=wk[k],d=new Date(+k),v=l.reduce((a,x)=>a+(x.vol||0),0);
      h+=`<div class="wkhead"><span>${+k===weekStart(Date.now())?'Esta semana':'Semana del '+d.getDate()+' '+d.toLocaleDateString('es-CO',{month:'short'}).replace('.','')}</span><span>${pl(l.length,'sesión','sesiones')} · ${NF.format(v)} kg</span></div><ul class="glist">`+
      l.map(x=>{const dt=new Date(x.ts);
        return `<li><button class="hrow" data-act="sess" data-v="${x.id}"><span class="t">${esc(titleOf(x))}${x.mode==='express'?'<span class="tag ex">EXPRÉS</span>':x.mode==='suave'?'<span class="tag ex">SUAVE</span>':''}${(x.pr||[]).length?'<span class="tag pr">RÉCORD</span>':''}${x.feel?`<span class="tag f-${x.feel}">${FEEL[x.feel].toUpperCase()}</span>`:''}</span><span class="d">${cap1(dt.toLocaleDateString('es-CO',{weekday:'long',day:'numeric'}))}</span><span class="r"><b>${Math.max(1,Math.round(x.dur/60))} min</b>${NF.format(x.vol)} kg</span></button></li>`;}).join('')+'</ul>';});
  }
  return h;
}
