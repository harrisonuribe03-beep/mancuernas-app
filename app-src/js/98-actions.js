/* Despachador de acciones de los módulos */
function V4ACT(a,v,b,L){
  for(const f of [planAct,typeof audioAct==='function'?audioAct:null,typeof bodyAct==='function'?bodyAct:null,typeof toolsAct==='function'?toolsAct:null,typeof metaAct==='function'?metaAct:null,typeof foodAct==='function'?foodAct:null,typeof flogAct==='function'?flogAct:null])if(f&&f(a,v,b,L))return true;
  return false;
}

