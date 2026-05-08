const fs = require('fs');

let content = fs.readFileSync('index_1_corregido.html', 'utf8');

const modalHTML = `
<div class="mo" id="modal-confirm-anular" style="z-index:9999;">
  <div class="md" style="width:360px;max-width:92vw;">
    <div class="mh">
      <div class="mt2" id="confirm-anular-title" style="color:#e74c3c;">Anular transacción</div>
      <button class="mc" onclick="cerrarConfirmAnular()">&times;</button>
    </div>
    <div class="mb">
      <p id="confirm-anular-msg" style="font-size:14px;color:var(--td);margin:0 0 1.2rem;">¿Seguro que quieres anular esta transacción? Esta acción no se puede deshacer.</p>
      <div style="display:flex;justify-content:flex-end;gap:8px;">
        <button class="btn" onclick="cerrarConfirmAnular()" style="background:var(--bd);color:var(--td);">Cancelar</button>
        <button class="btn btn-d" id="confirm-anular-btn" onclick="_confirmarAnular()">Sí, anular</button>
      </div>
    </div>
  </div>
</div>
`;

// Insert the modal before <div class="mo" id="modal-cobro-parcial">
content = content.replace('<div class="mo" id="modal-cobro-parcial">', modalHTML + '\n<div class="mo" id="modal-cobro-parcial">');

fs.writeFileSync('index_1_corregido.html', content, 'utf8');
