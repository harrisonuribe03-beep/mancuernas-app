/* Construye la app a partir de src/:
   - dist/mancuernas-app.html  → versión web (artefacto), fuentes de Google
   - ../android-app/www/       → app Android (fuentes locales, imágenes y sonidos)
   Uso: node build.js */
const fs=require('fs'),path=require('path');
const SRC=__dirname,A=path.resolve(__dirname,'..'),ART=process.env.ART||'/home/claude/art';
const list=d=>fs.readdirSync(path.join(SRC,d)).filter(f=>/\.(js|css)$/.test(f)).sort();
const read=(d,f)=>fs.readFileSync(path.join(SRC,d,f),'utf8');
const data=list('data').map(f=>read('data',f).replace(/if\(typeof module[\s\S]*$/,'')).join('\n');
const app=list('js').map(f=>read('js',f)).join('\n');
const css=list('css').map(f=>read('css',f)).join('\n');
const js=data+'\n(function(){\n"use strict";\n'+app+'\n})();';
const tpl=fs.readFileSync(path.join(SRC,'index.html'),'utf8').replace('/*CSS*/',()=>css).replace('/*JS*/',()=>js);
const google=`<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">`;
fs.mkdirSync(path.join(SRC,'dist'),{recursive:true});
fs.writeFileSync(path.join(SRC,'dist/mancuernas-app.html'),tpl.replace('/*FONTS*/',google));
fs.copyFileSync(path.join(SRC,'dist/mancuernas-app.html'),'/home/claude/mancuernas-app.html');
fs.writeFileSync(path.join(SRC,'dist/app.js'),js);
// Android
fs.rmSync(A+'/www',{recursive:true,force:true});fs.mkdirSync(A+'/www/fonts',{recursive:true});
let fcss='<style>';
for(const w of [400,500,600,700,800]){const f=`plus-jakarta-sans-latin-${w}-normal.woff2`;
  fs.copyFileSync(`${A}/node_modules/@fontsource/plus-jakarta-sans/files/${f}`,`${A}/www/fonts/${f}`);
  fcss+=`@font-face{font-family:"Plus Jakarta Sans";font-weight:${w};font-style:normal;font-display:swap;src:url(fonts/${f}) format("woff2")}`;}
fcss+='</style>';
const doc=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"><style>:root{padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>${fcss}</head><body>${tpl.replace('/*FONTS*/','')}</body></html>`;
fs.writeFileSync(A+'/www/index.html',doc);
const cp=(from,to,filter)=>{fs.mkdirSync(to,{recursive:true});for(const f of fs.readdirSync(from))if(!filter||filter(f))fs.copyFileSync(path.join(from,f),path.join(to,f));};
for(const dst of [A+'/www/img','/home/claude/img'])cp(ART+'/out',dst,f=>f.endsWith('.webp'));
for(const dst of [A+'/www/sounds','/home/claude/sounds']){fs.rmSync(dst,{recursive:true,force:true});fs.cpSync(ART+'/sounds',dst,{recursive:true});}
console.log('ok',(js.length/1024|0)+' KB js',(css.length/1024|0)+' KB css');
