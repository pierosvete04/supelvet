const fs = require('fs');
let content = fs.readFileSync('index_1_corregido.html', 'utf8');

const targetFunction = `function anularVenta(id){
  if(!confirm('\\u00bfAnular esta transacci\\u00f3n?'))return;
  sbU('ventas',id,{estado:'Anulado'}).then(function(){return loadAll();})
  .then(function(){
    rDash();rHist();rCreditos();
    cerrarDetalle();
    setSt('Transacci\\u00f3n anulada','ok');setTimeout(function(){setSt('');},2500);
  }).catch(function(e){setSt('Error: '+e.message,'er');});
}`;

const replacement = `function anularVenta(id){
  abrirConfirmAnular(id);
}`;

content = content.replace(targetFunction, replacement);
fs.writeFileSync('index_1_corregido.html', content, 'utf8');
