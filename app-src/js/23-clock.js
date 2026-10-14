/* Reloj del entrenamiento */
/* ---------- reloj ---------- */
let TK=null;
function startTick(){stopTick();TK=setInterval(tick,250);}
function stopTick(){if(TK)clearInterval(TK);TK=null;}
function tick(){
  const L=S.live;if(!L||L.phase==='summary'||$('#player').hidden)return;
  const el=$('#el');if(el)el.textContent=mmss((Date.now()-L.t0)/1000);
  const now=Date.now();
  if(L.phase==='warm'){
    if(el)el.textContent='0:00';
    if(!L.warmUntil)return;
    const rem=(L.warmUntil-now)/1000,cd=$('#cd'),rg=$('#rg');
    if(cd)cd.textContent=mmss(Math.ceil(rem));if(rg){const C=2*Math.PI*88;rg.setAttribute('stroke-dashoffset',(C*(1-Math.max(0,rem)/WARM)).toFixed(1));}
    const rgf=$('#rgf');if(rgf)rgf.style.transform='scaleX('+Math.min(1,Math.max(0,1-rem/WARM)).toFixed(3)+')';
    const stp=Math.min(4,Math.floor((WARM-rem)/60));document.querySelectorAll('#wl li').forEach((li,i)=>li.classList.toggle('on',i===stp));
    if(stp!==L.wstp&&rem>0){L.wstp=stp;const w=warmSteps(L)[stp];if(w){const wi=$('#wimg');if(wi)wi.src=IMG(warmImg(L,w));if(stp)sfx('half');V.warmStep(w,stp);}}
    if(rem<=0){sfx('go');buzz(400);L.phase='work';L.warmUntil=0;L.t0=Date.now();saveLive();renderPlayer();V.first(L.items[L.i]);}
    return;
  }
  if(L.rest){
    const rem=(L.rest.until-now)/1000,cd=$('#rcd'),pb=$('#rpb');
    if(cd)cd.textContent=mmss(Math.ceil(rem));if(pb)pb.style.transform='scaleX('+Math.max(0,Math.min(1,rem/L.rest.total)).toFixed(3)+')';
    const sec=Math.ceil(rem);if(sec<=3&&sec>0&&L.lastBeep!==sec){L.lastBeep=sec;sfx('tick');}
    if(sec===10&&!L.said10&&L.rest.total>=30){L.said10=true;V.restTen();}
    if(rem<=0){sfx('go');buzz(450);L.rest=null;saveLive();renderBottom();V.restEnd();}
  }
  if(L.timed){
    const rem=(L.timed.until-now)/1000,cd=$('#tcd');
    if(cd)cd.textContent=mmss(Math.ceil(rem));
    const sec=Math.ceil(rem);if(sec<=3&&sec>0&&L.lastBeepT!==sec){L.lastBeepT=sec;sfx('tick');}
    if(!L.timed.half&&rem<=L.timed.secs/2&&L.timed.secs>=20){L.timed.half=true;sfx('half');V.timedHalf();}
    if(rem<=0){const k=L.timed.row,i=L.timed.i,secs=L.timed.secs;L.timed=null;sfx('go');buzz(400);V.timedEnd();if(L.i===i)completeRow(k,secs);else{L.items[i].sets[k].reps=secs;L.items[i].sets[k].done=true;saveLive();renderPlayer(true);}}
  }
}

