const fs = require('fs');

let content = fs.readFileSync('index_1_corregido.html', 'utf8');

// Replace the old button string with the proper one
content = content.replace(
  /'<button class="btn btn-d" onclick="anularGrupo\\(\\\\\\'\+idsJson\+\\\\\\'\\);cerrarDetalle\(\)">Anular todo<\/button>':'\+/,
  `'<button class="btn btn-d" onclick="anularGrupo(\\''+idsJson+'\\');cerrarDetalle()">Anular todo</button>':''+`
);

fs.writeFileSync('index_1_corregido.html', content, 'utf8');
