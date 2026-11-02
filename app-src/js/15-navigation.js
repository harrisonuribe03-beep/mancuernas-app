/* Botón atrás de Android */
/* ---------- botón atrás ---------- */
let guard=false,skipPop=false;
const overlayOpen=()=>!$('#sheet').hidden||!$('#player').hidden||!$('#seq').hidden||(!$('#onb').hidden&&OB.re)||S.tab==='me';
function syncGuard(){
  if(overlayOpen()&&!guard){if(skipPop)return;history.pushState({mc:1},'');guard=true;}
  else if(!overlayOpen()&&guard){guard=false;skipPop=true;history.back();}
}
window.addEventListener('popstate',()=>{
  if(skipPop){skipPop=false;syncGuard();return;}
  guard=false;
  if(!$('#sheet').hidden)closeSheet(true);
  else if(!$('#seq').hidden){toolsAct('seqquit');}
  else if(!$('#onb').hidden&&OB.re){$('#onb').hidden=true;$('#onb').innerHTML='';}
  else if(S.mePage&&$('#player').hidden){S.mePage=null;render();}
  else if(S.tab==='me'&&$('#player').hidden){S.tab='hoy';render();window.scrollTo(0,0);}
  else if(!$('#player').hidden){
    if(S.live&&S.live.phase==='summary'){S.live=null;S.summary=null;saveLive();closePlayer(true);}
    else askQuit();
  }
  syncGuard();
});

