/* Tema claro/oscuro */
/* ---------- tema ---------- */
function applyTheme(){
  const t=S.settings.theme,r=document.documentElement;
  if(t==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',t);
  const dark=t==='dark'||(t==='system'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
  call(NAT,'setBars',{color:dark?'#0d0f13':'#f4f5f8',dark:!!dark});
  if(typeof applyAccent==='function')applyAccent(dark);
}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);}catch(e){}

