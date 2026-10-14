/* Plataforma: utilidades DOM, almacenamiento local y puente nativo (Capacitor) */
const $=s=>document.querySelector(s);
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
  del(k){try{localStorage.removeItem(k)}catch(e){}}};
const CAP=window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()?window.Capacitor:null;
const NAT=CAP&&CAP.Plugins&&CAP.Plugins.Native||null;
const LN=CAP&&CAP.Plugins&&CAP.Plugins.LocalNotifications||null;
const call=(o,m,a)=>{try{if(o&&typeof o[m]==='function'){const r=o[m](a);if(r&&r.catch)r.catch(()=>{});return r;}}catch(e){}return null;};

