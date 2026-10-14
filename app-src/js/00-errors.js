/* Registro de errores: nada que falle debe perder datos ni dejar la pantalla en blanco */
const ERRLOG='mc-errlog';
let errShown=false;
function logError(where,e){
  try{const l=JSON.parse(localStorage.getItem(ERRLOG)||'[]');
    l.push({t:Date.now(),w:where,m:String(e&&(e.message||e)).slice(0,300),s:String(e&&e.stack||'').split('\n').slice(0,4).join(' | ').slice(0,500)});
    localStorage.setItem(ERRLOG,JSON.stringify(l.slice(-25)));}catch(x){}
  if(!errShown){errShown=true;setTimeout(()=>{try{toast('<span>Algo falló, pero tus datos están a salvo</span>');}catch(x){}},50);}
}
window.addEventListener('error',ev=>logError('error',ev.error||ev.message));
window.addEventListener('unhandledrejection',ev=>logError('promesa',ev.reason));
