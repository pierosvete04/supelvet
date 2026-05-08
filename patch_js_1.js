const fs = require('fs');
let content = fs.readFileSync('index_1_corregido.html', 'utf8');

const jsCode = `
var _pendingAnularId = null;
var _pendingAnularGrupoIds = null;

function abrirConfirmAnular(id){
  _pendingAnularId=id;
  _pendingAnularGrupoIds=null;
  var t=gel('confirm-anular-title');if(t)t.textContent='Anular transacción';
  var m=gel('confirm-anular-msg');if(m)m.textContent='¿Seguro que quieres anular esta transacción? Esta acción no se puede deshacer.';
  gel('modal-confirm-anular').classList.add('open');
}
function abrirConfirmAnularGrupo(ids){
  _pendingAnularId=null;
  _pendingAnularGrupoIds=ids;
  var t=gel('confirm-anular-title');if(t)t.textContent='Anular movimiento completo';
  var m=gel('confirm-anular-msg');if(m)m.textContent='¿Seguro que quieres anular las '+ids.length+' transacciones de este movimiento? Esta acción no se puede deshacer.';
  gel('modal-confirm-anular').classList.add('open');
}
function cerrarConfirmAnular(){
  _pendingAnularId=null;
  _pendingAnularGrupoIds=null;
  gel('modal-confirm-anular').classList.remove('open');
}
function _confirmarAnular(){
  var id=_pendingAnularId;
  var ids=_pendingAnularGrupoIds;
  cerrarConfirmAnular();

  if(ids && ids.length){
    var promesas=ids.map(function(idx){return sbU('ventas',idx,{estado:'Anulado'});});
    Promise.all(promesas)
    .then(function(){return loadAll();})
    .then(function(){
      rDash();rHist();rCreditos();cerrarDetalle();
      setSt('Transacciones anuladas','ok');setTimeout(function(){setSt('');},2500);
    })
    .catch(function(e){setSt('Error: '+e.message,'er');});
  } else if(id) {
    sbU('ventas',id,{estado:'Anulado'}).then(function(){return loadAll();})
    .then(function(){
      rDash();rHist();rCreditos();
      cerrarDetalle();
      setSt('Transacción anulada','ok');setTimeout(function(){setSt('');},2500);
    }).catch(function(e){setSt('Error: '+e.message,'er');});
  }
}
function anularGrupo(idsJson){
  var ids;
  try{
    ids = JSON.parse(idsJson.replace(/&quot;/g,'"'));
  }catch(e){
    console.error('Error parsing IDs:', e);
    return;
  }
  if(!ids || !ids.length) return;
  abrirConfirmAnularGrupo(ids);
}
`;

// Insert the JS code at the end of the script tag
content = content.replace('</script>', jsCode + '\n</script>');

// Update anularVenta to use the modal
content = content.replace(
  /function anularVenta\(id\)\{[\s\S]*?\}\.catch\(function\(e\)\{setSt\('Error: '\+e\.message,'er'\);\}\);\s*\}/,
  `function anularVenta(id){
  abrirConfirmAnular(id);
}`
);

fs.writeFileSync('index_1_corregido.html', content, 'utf8');
