const fs = require('fs');
let content = fs.readFileSync('index_1_corregido.html', 'utf8');

content = content.replace(
  /function anularVenta\(id\)\{[\s\S]*?\}\.catch\(function\(e\)\{setSt\('Error: '\+e\.message,'er'\);\}\);\n\}/,
  `function anularVenta(id){
  abrirConfirmAnular(id);
}`
);

fs.writeFileSync('index_1_corregido.html', content, 'utf8');
