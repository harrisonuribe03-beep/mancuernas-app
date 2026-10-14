/* Vista Ejercicios */
const GORDER=GROUPS.map(g=>g[0]);
function exGroup(n){const m=info(n).m.join(' ');return GROUPS.filter(g=>g[1].test(m)).map(g=>g[0]);}
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function libList(){
  const q=norm(S.lib.q.trim()),g=S.lib.g;
  const mine=S.lib.eq!=='all',set=myEq();
  const list=ALLEX.filter(e=>(!mine||canDo(e,set))&&(g==='Todos'||exGroup(e.n).includes(g))&&(!q||norm(e.n+' '+info(e.n).m.join(' ')).includes(q)));
  if(!list.length)return `<div class="card empty"><b>Sin resultados</b>Prueba con otro nombre o grupo muscular.</div>`;
  const dsOf=e=>canDo(e,set)?info(e.n).m.join(', '):'Necesita: '+eqNeed(e,set).join(', ');
  if(g!=='Todos'||q)return `<ul class="glist" style="margin-top:12px">${list.map(e=>exRow(e,dsOf(e))).join('')}</ul>`;
  return GORDER.map(gr=>{const l=list.filter(e=>exGroup(e.n)[0]===gr);return l.length?`<div class="ghead">${gr} · ${l.length}</div><ul class="glist">${l.map(e=>exRow(e,dsOf(e))).join('')}</ul>`:'';}).join('');
}
function viewLib(){
  return `<h1 class="h1" style="padding-top:6px">Ejercicios</h1><div class="sub">${ALLEX.length} ejercicios · ${ALLEX.filter(e=>canDo(e)).length} con tu equipo</div>
  <label class="search">${IC.search}<input id="libq" type="search" placeholder="Buscar ejercicio o músculo" value="${esc(S.lib.q)}" autocomplete="off" enterkeyhint="search"></label>
  <div class="seg libeq">${[['mine','Con mi equipo'],['all','Todos']].map(([k,l])=>`<button data-act="libeq" data-v="${k}" aria-pressed="${(S.lib.eq||'mine')===k}">${l}</button>`).join('')}</div>
  <div class="chips" role="group" aria-label="Grupo muscular">${['Todos',...GORDER].map(x=>`<button class="chip" data-act="grp" data-v="${x}" aria-pressed="${S.lib.g===x}">${x}</button>`).join('')}</div>
  <div id="liblist">${libList()}</div>`;
}

