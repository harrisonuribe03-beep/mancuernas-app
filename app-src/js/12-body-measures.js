/* Peso y medidas corporales */
/* ---------- cuerpo ---------- */
const BODYF=[['w','Peso','kg'],['waist','Cintura','cm'],['neck','Cuello','cm'],['hip','Cadera','cm'],['chest','Pecho','cm'],['arm','Brazo','cm']];
function simpleLine(pts,unit,label){
  const W=340,H=120,L=34,R=12,T=12,B=22,iw=W-L-R,ih=H-T-B;
  let lo=Math.min(...pts.map(p=>p.v)),hi=Math.max(...pts.map(p=>p.v));
  if(lo===hi){lo-=1;hi+=1;}else{const pad=(hi-lo)*.3;lo-=pad;hi+=pad;}
  const X=i=>pts.length===1?L+iw/2:L+iw*i/(pts.length-1),Y=v=>T+ih-ih*(v-lo)/(hi-lo);
  let g='';for(let k=0;k<=2;k++){const v=lo+(hi-lo)*k/2,y=Y(v);g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text class="ax" x="${L-6}" y="${y+3}" text-anchor="end">${NF.format(Math.round(v*10)/10)}</text>`;}
  const line=pts.map((p,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(p.v).toFixed(1)).join('');
  if(pts.length>1)g+=`<path class="area" d="${line}L${X(pts.length-1)} ${T+ih}L${X(0)} ${T+ih}Z"/><path class="ln" d="${line}"/>`;
  pts.forEach((p,i)=>{g+=`<circle class="pt" cx="${X(i)}" cy="${Y(p.v)}" r="${i===pts.length-1?5.5:3.5}"/>`;});
  const fd=ts=>{const d=new Date(ts);return d.getDate()+'/'+(d.getMonth()+1);};
  g+=`<text class="ax" x="${X(0)}" y="${H-6}" text-anchor="${pts.length>1?'start':'middle'}">${fd(pts[0].ts)}</text>`;
  if(pts.length>1)g+=`<text class="ax" x="${X(pts.length-1)}" y="${H-6}" text-anchor="end">${fd(pts[pts.length-1].ts)}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${g}</svg>`;
}
function bodyCard(){
  const B=S.body;
  if(!B.length)return `<div class="card empty"><b>Registra tu peso y medidas</b>Una vez por semana basta. Así ves si estás ganando músculo o bajando grasa, no solo cuánto levantas.<button class="btn pri sm" style="margin:12px auto 0" data-act="bodyadd">${IC.plus}Primer registro</button></div>`;
  const last=k=>{for(let i=B.length-1;i>=0;i--)if(B[i][k]!=null)return B[i];return null;};
  const first=k=>B.find(b=>b[k]!=null);
  const cells=BODYF.map(([k,l,u])=>{const a=last(k),f=first(k);if(!a)return `<div><span>${l}</span><b>—</b></div>`;
    const dv=f&&f!==a?Math.round((a[k]-f[k])*10)/10:0;
    return `<div><span>${l}</span><b>${NF.format(a[k])}<small> ${u}</small></b>${dv?`<em>${dv>0?'+':''}${NF.format(dv)}</em>`:''}</div>`;}).join('');
  const wp=B.filter(b=>b.w!=null).slice(-16).map(b=>({ts:b.ts,v:b.w}));
  const lb=B[B.length-1];
  return `<div class="card chart body"><div class="bgrid">${cells}</div>${wp.length>1?simpleLine(wp,'kg','Peso corporal'):''}
    <div class="bft"><span>Último: ${new Date(lb.ts).toLocaleDateString('es-CO',{day:'numeric',month:'short'})}</span><span style="display:flex;gap:6px"><button class="btn sm ghost" data-act="bodylist">Ver todo</button><button class="btn sm pri" data-act="bodyadd">${IC.plus}Registrar</button></span></div></div>`;
}
function bodySheet(){
  const l=S.body.length?S.body[S.body.length-1]:{};
  sheet(`<h3>Peso y medidas</h3><p class="sub">Mídete en la mañana, antes de comer. Deja vacío lo que no quieras registrar.</p>
  <div class="bform">${BODYF.map(([k,lb,u])=>`<label><span>${lb} <small>${u}</small></span><input inputmode="decimal" id="bf-${k}" placeholder="${l[k]!=null?NF.format(l[k]):''}" autocomplete="off"></label>`).join('')}</div>
  <div class="acts"><button class="btn pri" data-act="bodysave">Guardar</button><button class="btn" data-act="close">Cancelar</button></div>`);
}
function bodyListSheet(){
  sheet(`<h3>Registros</h3><ul class="glist" style="margin-top:10px">${S.body.slice().reverse().map(b=>`<li class="kvrow"><span>${new Date(b.ts).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}<small style="display:block;color:var(--tx2);font-weight:500">${BODYF.filter(([k])=>b[k]!=null).map(([k,l,u])=>`${l} ${NF.format(b[k])} ${u}`).join(' · ')}</small></span><button class="iconbtn" data-act="bodydel" data-v="${b.id}" aria-label="Borrar registro">${IC.x}</button></li>`).join('')}</ul><div class="acts"><button class="btn" data-act="close">Cerrar</button></div>`);
}
const FEEL={facil:'Fácil',bien:'Bien',duro:'Duro'};
