const fs = require('fs');

let content = fs.readFileSync('index_1_corregido.html', 'utf8');

const jsCode = `
var _detalleEditando = false;
var _detalleVentaId = null;
var _productosDisponibles = [];
var _productosCache = null;

function verDetalle(id){
  var v=null;
  for(var i=0;i<_ventas.length;i++){if(_ventas[i].id===id){v=_ventas[i];break;}}
  if(!v)return;

  _detalleVentaId = id;
  _detalleEditando = false;

  if(_productosCache !== null){
    _productosDisponibles = _productosCache;
    renderDetalle(v);
    return;
  }

  sbG('productos','select=nombre').then(function(response){
    _productosCache = response || [];
    _productosDisponibles = _productosCache;
    renderDetalle(v);
  }).catch(function(e){
    console.error('Error cargando productos:', e);
    _productosCache = [];
    _productosDisponibles = [];
    renderDetalle(v);
  });
}

function renderDetalle(v){
  function campo(lbl, val){
    return '<div class="sc">'+
      '<div style="font-size:10px;font-weight:700;color:var(--brand);letter-spacing:.6px;text-transform:uppercase;margin-bottom:4px;">'+lbl+'</div>'+
      '<div style="font-size:13px;color:var(--tl);">'+val+'</div>'+
      '</div>';
  }

  function campoEditable(lbl, val, fieldId, tipo){
    if(!tipo) tipo = 'text';
    var cleanVal = (typeof val === 'number' ? val : String(val).replace(/<[^>]*>/g,''));
    return '<div class="sc">'+
      '<div style="font-size:10px;font-weight:700;color:var(--brand);letter-spacing:.6px;text-transform:uppercase;margin-bottom:4px;">'+lbl+'</div>'+
      '<div id="campo-'+fieldId+'" style="font-size:13px;color:var(--tl);">'+val+'</div>'+
      '<input type="'+tipo+'" id="edit-'+fieldId+'" value="'+cleanVal+'" '+
      'style="display:none;width:100%;padding:6px 10px;border:1px solid var(--brand);border-radius:4px;font-size:13px;" />'+
      '</div>';
  }

  var contenido='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1rem;">';
  contenido+=campo('Vendedor','<strong>'+getNombreVendedor(v.vendedor_id)+'</strong>');
  contenido+=campoEditable('Fecha', fmt(v.fecha), 'fecha', 'date');
  contenido+=campo('Movimiento', bMov(v.movimiento));
  contenido+=campo('Veterinaria', v.veterinaria||'---');
  contenido+=campo('Doctora / Medico', v.doctora||'---');
  contenido+=campo('Zona', v.zona||'---');
  contenido+=campo('Celular', v.num_medico||v.celular||'---');
  if(v.ruc)contenido+=campo('RUC', v.ruc);
  contenido+='</div>';

  if(v.movimiento!=='Visita'){
    contenido+='<div style="background:var(--sky4);border:1px solid var(--sky);border-radius:var(--r);padding:.85rem 1rem;margin-bottom:1rem;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;">';

    var opcionesProducto = '';
    if(_productosDisponibles.length > 0){
      _productosDisponibles.forEach(function(p){
        var selected = (p.nombre === v.producto) ? 'selected' : '';
        opcionesProducto += '<option value="'+p.nombre+'" '+selected+'>'+p.nombre+'</option>';
      });
    }else{
      opcionesProducto = '<option value="'+(v.producto||'')+'" selected>'+(v.producto||'Sin producto')+'</option>';
    }

    contenido+='<div>'+
      '<div style="font-size:10px;font-weight:700;color:var(--brand);letter-spacing:.6px;text-transform:uppercase;margin-bottom:3px;">PRODUCTO</div>'+
      '<div id="campo-producto" style="font-size:13px;color:var(--tl);">'+(v.producto||'---')+'</div>'+
      '<select id="edit-producto" style="display:none;width:100%;padding:6px 8px;border:1px solid var(--brand);border-radius:4px;font-size:13px;">'+
        opcionesProducto+
      '</select>'+
      '</div>';

    contenido+='<div>'+
      '<div style="font-size:10px;font-weight:700;color:var(--brand);letter-spacing:.6px;text-transform:uppercase;margin-bottom:3px;">CANTIDAD</div>'+
      '<div id="campo-cantidad" style="font-size:13px;color:var(--tl);">'+(v.cantidad||0)+'</div>'+
      '<input type="number" id="edit-cantidad" value="'+(v.cantidad||0)+'" '+
      'style="display:none;width:100%;padding:6px 8px;border:1px solid var(--brand);border-radius:4px;font-size:13px;" '+
      'oninput="recalcularTotal()" />'+
      '</div>';

    contenido+='<div>'+
      '<div style="font-size:10px;font-weight:700;color:var(--brand);letter-spacing:.6px;text-transform:uppercase;margin-bottom:3px;">PRECIO UNIT.</div>'+
      '<div id="campo-precio" style="font-size:13px;color:var(--tl);">S/ '+Number(v.precio_unitario||0).toFixed(2)+'</div>'+
      '<input type="number" step="0.01" id="edit-precio" value="'+Number(v.precio_unitario||0).toFixed(2)+'" '+
      'style="display:none;width:100%;padding:6px 8px;border:1px solid var(--brand);border-radius:4px;font-size:13px;" '+
      'oninput="recalcularTotal()" />'+
      '</div>';

    contenido+='<div>'+
      '<div style="font-size:10px;font-weight:700;color:var(--brand);letter-spacing:.6px;text-transform:uppercase;margin-bottom:3px;">TOTAL</div>'+
      '<div id="campo-total" style="font-size:15px;font-weight:700;color:var(--brand);">S/ '+Number(v.total||0).toFixed(2)+'</div>'+
      '<input type="number" step="0.01" id="edit-total" value="'+Number(v.total||0).toFixed(2)+'" disabled '+
      'style="display:none;width:100%;padding:6px 8px;border:1px solid var(--bd);border-radius:4px;font-size:13px;background:#f3f4f6;color:var(--tl);" />'+
      '</div>';

    contenido+='</div>';

    if(v.fecha_cobro){
      contenido+='<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:var(--r);padding:.7rem 1rem;margin-bottom:1rem;font-size:12px;color:#92400e;">'+
        '&#128197; Cobro estimado: <strong>'+fmt(v.fecha_cobro)+'</strong></div>';
    }
  }

  contenido+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem;">'+
    '<span style="font-size:11px;font-weight:700;color:var(--brand);text-transform:uppercase;">Estado:</span>'+
    bEst(v.estado)+'</div>';

  var notasTexto = (v.notas&&v.notas.trim()&&v.notas!=='EMPTY') ? v.notas : '';
  contenido+='<div style="border:1px solid var(--bd);border-radius:var(--r);padding:.85rem 1rem;margin-bottom:1rem;">'+
    '<div style="font-size:10px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;">&#128203; Notas del vendedor</div>'+
    '<div id="campo-notas" style="font-size:13px;line-height:1.6;color:var(--td);">'+(notasTexto||'<span style="color:var(--tl);font-style:italic;">Sin notas adicionales</span>')+'</div>'+
    '<textarea id="edit-notas" style="display:none;width:100%;min-height:80px;padding:10px;border:1px solid var(--brand);border-radius:4px;font-size:13px;font-family:inherit;resize:vertical;">'+notasTexto+'</textarea>'+
    '</div>';

  var canAnul=(v.estado!=='Anulado');

  contenido+='<div style="display:flex;justify-content:space-between;gap:8px;margin-top:1rem;">'+
    '<button id="btn-editar" class="btn" style="background:var(--brand);color:#fff;" onclick="toggleEditar()">✏️ Editar</button>'+
    '<div style="display:flex;gap:8px;">'+
      '<button id="btn-guardar" class="btn" style="display:none;background:#10b981;color:#fff;" onclick="guardarCambios()">💾 Guardar</button>'+
      '<button id="btn-cancelar" class="btn" style="display:none;background:var(--bd);color:var(--td);" onclick="cancelarEdicion()">Cancelar</button>'+
      (canAnul?'<button class="btn btn-d" onclick="anularVenta(\\''+v.id+'\\');cerrarDetalle()">Anular</button>':'')+
      (v.estado==='\u23f3 Pendiente'?'<button class="btn btn-ok" onclick="marcarPagado(\\''+v.id+'\\')">&#9989; Cobrado</button>':'')+
      '<button class="btn btn-p" onclick="cerrarDetalle()">Cerrar</button>'+
    '</div>'+
    '</div>';

  gel('detalle-body').innerHTML=contenido;
  gel('detalle-titulo').textContent=(v.veterinaria||'Transaccion')+' \u00b7 '+fmt(v.fecha);
  gel('modal-detalle').classList.add('open');

  var editFecha = gel('edit-fecha');
  if(editFecha && v.fecha) editFecha.value = v.fecha;
}

function toggleEditar(){
  _detalleEditando = !_detalleEditando;

  var camposEditables = ['fecha', 'producto', 'cantidad', 'precio', 'total', 'notas'];

  camposEditables.forEach(function(field){
    var campo = gel('campo-'+field);
    var input = gel('edit-'+field);
    if(campo && input){
      if(_detalleEditando){
        campo.style.display = 'none';
        input.style.display = 'block';
        if(field === 'total') input.disabled = true;
      }else{
        campo.style.display = 'block';
        input.style.display = 'none';
      }
    }
  });

  var btnEditar = gel('btn-editar');
  var btnGuardar = gel('btn-guardar');
  var btnCancelar = gel('btn-cancelar');

  if(btnEditar) btnEditar.style.display = _detalleEditando ? 'none' : 'inline-block';
  if(btnGuardar) btnGuardar.style.display = _detalleEditando ? 'inline-block' : 'none';
  if(btnCancelar) btnCancelar.style.display = _detalleEditando ? 'inline-block' : 'none';
}

function recalcularTotal(){
  var cantidadInput = gel('edit-cantidad');
  var precioInput = gel('edit-precio');
  var totalInput = gel('edit-total');

  if(cantidadInput && precioInput && totalInput){
    var cantidad = parseFloat(cantidadInput.value) || 0;
    var precio = parseFloat(precioInput.value) || 0;
    var total = cantidad * precio;
    totalInput.value = total.toFixed(2);
  }
}

function cancelarEdicion(){
  var id = _detalleVentaId;
  if(!id) return;

  var v = null;
  for(var i=0; i<_ventas.length; i++){
    if(_ventas[i].id === id){ v = _ventas[i]; break; }
  }
  if(!v) return;

  _detalleEditando = false;
  renderDetalle(v);
}

function guardarCambios(){
  var fecha = gel('edit-fecha') ? gel('edit-fecha').value : null;
  var producto = gel('edit-producto') ? gel('edit-producto').value : null;
  var cantidad = gel('edit-cantidad') ? parseFloat(gel('edit-cantidad').value) : null;
  var precio = gel('edit-precio') ? parseFloat(gel('edit-precio').value) : null;
  var total = gel('edit-total') ? parseFloat(gel('edit-total').value) : null;
  var notas = gel('edit-notas') ? gel('edit-notas').value.trim() : null;

  if(!_detalleVentaId){
    setSt('Error: ID de transacción no encontrado','er');
    return;
  }

  var updates = {};
  if(fecha) updates.fecha = fecha;
  if(producto) updates.producto = producto;
  if(cantidad !== null) updates.cantidad = cantidad;
  if(precio !== null) updates.precio_unitario = precio;
  if(total !== null) updates.total = total;
  if(notas !== null) updates.notas = notas || 'EMPTY';

  sbU('ventas', _detalleVentaId, updates).then(function(){
    return loadAll();
  }).then(function(){
    rDash();rCreditos();
    rHist();
    setSt('Cambios guardados correctamente','ok');
    setTimeout(function(){setSt('');},2500);
    cerrarDetalle();
  }).catch(function(e){
    console.error('Error al guardar:', e);
    setSt('Error al guardar: '+e.message,'er');
  });
}
`;

const startIndex = content.indexOf('function verDetalle(id){');
const endIndex = content.indexOf('function cerrarDetalle(){');

if(startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + jsCode + '\n' + content.substring(endIndex);
    fs.writeFileSync('index_1_corregido.html', newContent, 'utf8');
    console.log('Successfully patched verDetalle in index_1_corregido.html');
} else {
    console.log('Failed to patch verDetalle in index_1_corregido.html');
}
