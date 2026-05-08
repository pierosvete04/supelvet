const fs = require('fs');

let content = fs.readFileSync('index_1_corregido.html', 'utf8');

const agruparCode = `
function agruparTransacciones(ventas){
  var grupos = {};

  for(var i = 0; i < ventas.length; i++){
    var v = ventas[i];
    var horaGrupo = '';
    if(v.hora){
      var partes = v.hora.split(':');
      var h = partes[0];
      var m = parseInt(partes[1]) || 0;
      var bloqueMinutos = Math.floor(m / 15) * 15;
      horaGrupo = h + ':' + (bloqueMinutos < 10 ? '0' : '') + bloqueMinutos;
    }

    var clave = [
      v.vendedor_id || '',
      (v.veterinaria || '').toLowerCase().trim(),
      (v.doctora || '').toLowerCase().trim(),
      v.fecha || '',
      horaGrupo,
      v.movimiento || ''
    ].join('|');

    if(!grupos[clave]){
      grupos[clave] = {
        items: [],
        representante: v
      };
    }
    grupos[clave].items.push(v);
  }

  var resultado = [];
  for(var clave in grupos){
    var grupo = grupos[clave];
    resultado.push({
      esGrupo: grupo.items.length > 1,
      cantidad_productos: grupo.items.length,
      items: grupo.items,
      id: grupo.representante.id,
      vendedor_id: grupo.representante.vendedor_id,
      fecha: grupo.representante.fecha,
      hora: grupo.representante.hora,
      veterinaria: grupo.representante.veterinaria,
      doctora: grupo.representante.doctora,
      zona: grupo.representante.zona,
      movimiento: grupo.representante.movimiento,
      estado: grupo.representante.estado,
      total: grupo.items.reduce(function(sum, item){
        return sum + (parseFloat(item.total) || 0);
      }, 0),
      ids_grupo: grupo.items.map(function(item){ return item.id; })
    });
  }
  return resultado;
}

function rHist(){
  var busq=(val('srch-h')||'').toLowerCase(),mes=val('fil-mes'),vfil=val('fil-vend'),mov=val('fil-mov');
  var l=[];

  for(var i=0;i<_ventas.length;i++){
    var v=_ventas[i];
    if(vfil&&v.vendedor_id!==vfil)continue;
    if(mov&&mov!=='todos'&&v.movimiento!==mov)continue;
    if(mes&&(!v.fecha||v.fecha.indexOf(mes)!==0))continue;
    if(busq&&(v.veterinaria||'').toLowerCase().indexOf(busq)<0&&(v.producto||'').toLowerCase().indexOf(busq)<0&&getNombreVendedor(v.vendedor_id).toLowerCase().indexOf(busq)<0)continue;
    l.push(v);
  }

  var grupos = agruparTransacciones(l);

  grupos.sort(function(a,b){
    var da=(a.fecha||'')+(a.hora||'00:00');
    var db=(b.fecha||'')+(b.hora||'00:00');
    if(db>da)return 1;if(db<da)return -1;
    return (b.id||'')>(a.id||'')?1:(b.id||'')<(a.id||'')?-1:0;
  });

  var PER=20,total=grupos.length,totalPags=Math.max(1,Math.ceil(total/PER));
  if(_histPag>totalPags)_histPag=totalPags;
  var page=grupos.slice((_histPag-1)*PER,_histPag*PER);
  var rows='';
  for(var i=0;i<page.length;i++){
    var g=page[i];
    var canAnul=g.estado!=='Anulado';

    var productoDisplay = '';
    if(g.esGrupo){
      productoDisplay = '<strong>'+g.cantidad_productos+' productos</strong>';
    }else{
      productoDisplay = g.items[0].producto || '---';
    }

    var cantidadDisplay = '';
    if(g.esGrupo){
      var totalItems = g.items.reduce(function(sum, item){
        return sum + (parseInt(item.cantidad) || 0);
      }, 0);
      cantidadDisplay = totalItems;
    }else{
      cantidadDisplay = g.items[0].cantidad || 0;
    }

    var dataIds = g.esGrupo ? JSON.stringify(g.ids_grupo).replace(/"/g,'&quot;') : '';

    rows+='<tr style="cursor:pointer;">'+
      '<td onclick="' + (g.esGrupo ? 'verDetalleGrupo(\\''+dataIds+'\\')' : 'verDetalle(\\''+g.id+'\\')') + '">'+fmt(g.fecha)+(g.hora?' <span class="tm2" style="font-size:10px;">'+g.hora+'</span>':'')+'</td>'+
      '<td onclick="' + (g.esGrupo ? 'verDetalleGrupo(\\''+dataIds+'\\')' : 'verDetalle(\\''+g.id+'\\')') + '" style="font-weight:600;">'+getNombreVendedor(g.vendedor_id)+'</td>'+
      '<td onclick="' + (g.esGrupo ? 'verDetalleGrupo(\\''+dataIds+'\\')' : 'verDetalle(\\''+g.id+'\\')') + '">'+(g.veterinaria||'---')+'</td>'+
      '<td onclick="' + (g.esGrupo ? 'verDetalleGrupo(\\''+dataIds+'\\')' : 'verDetalle(\\''+g.id+'\\')') + '" class="tm2">'+(g.doctora||'---')+'</td>'+
      '<td onclick="' + (g.esGrupo ? 'verDetalleGrupo(\\''+dataIds+'\\')' : 'verDetalle(\\''+g.id+'\\')') + '">'+bMov(g.movimiento)+'</td>'+
      '<td onclick="' + (g.esGrupo ? 'verDetalleGrupo(\\''+dataIds+'\\')' : 'verDetalle(\\''+g.id+'\\')') + '">'+productoDisplay+'</td>'+
      '<td onclick="' + (g.esGrupo ? 'verDetalleGrupo(\\''+dataIds+'\\')' : 'verDetalle(\\''+g.id+'\\')') + '">'+cantidadDisplay+'</td>'+
      '<td onclick="' + (g.esGrupo ? 'verDetalleGrupo(\\''+dataIds+'\\')' : 'verDetalle(\\''+g.id+'\\')') + '"><strong>'+money(g.total)+'</strong></td>'+
      '<td onclick="' + (g.esGrupo ? 'verDetalleGrupo(\\''+dataIds+'\\')' : 'verDetalle(\\''+g.id+'\\')') + '">'+bEst(g.estado)+'</td>'+
      '<td>'+(canAnul&&!g.esGrupo?'<button class="btn btn-d btn-sm" onclick="event.stopPropagation();anularVenta(\\''+g.id+'\\')">Anular</button>':
       canAnul&&g.esGrupo?'<button class="btn btn-d btn-sm" onclick="event.stopPropagation();anularGrupo(\\''+dataIds+'\\')">Anular</button>':'---')+'</td>'+
      '</tr>';
  }
  var pag='';
  if(totalPags>1){
    pag='<div style="display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;border-top:1px solid var(--bd);font-size:12px;">'+
      '<span style="color:var(--tl);">'+total+' movimientos \u00b7 p\u00e1gina '+_histPag+' de '+totalPags+'</span>'+
      '<div style="display:flex;gap:6px;">';
    if(_histPag>1)pag+='<button class="btn btn-s btn-sm" onclick="_histPag=1;rHist()">\u00ab</button><button class="btn btn-s btn-sm" onclick="_histPag--;rHist()">&lsaquo;</button>';
    var sp=Math.max(1,_histPag-2),ep=Math.min(totalPags,sp+4);
    for(var p=sp;p<=ep;p++)pag+='<button class="btn '+(p===_histPag?'btn-p':'btn-s')+' btn-sm" onclick="_histPag='+p+';rHist()">'+p+'</button>';
    if(_histPag<totalPags)pag+='<button class="btn btn-s btn-sm" onclick="_histPag++;rHist()">&rsaquo;</button><button class="btn btn-s btn-sm" onclick="_histPag=totalPags;rHist()">\u00bb</button>';
    pag+='</div></div>';
  }else if(grupos.length>0){
    pag='<div style="padding:.5rem 1rem;font-size:11px;color:var(--tl);border-top:1px solid var(--bd);">'+total+' movimientos</div>';
  }
  gel('tbl-hist').innerHTML=rows?
    '<table><thead><tr><th>Fecha</th><th>Vendedor</th><th>Veterinaria</th><th>Doctora</th><th>Movimiento</th><th>Producto</th><th>Cant.</th><th>Total</th><th>Estado</th><th>Acci\u00f3n</th></tr></thead><tbody>'+rows+'</tbody></table>'+pag:
    '<div class="es"><div class="ei">\ud83d\udccb</div>Sin registros.</div>';
}

function verDetalleGrupo(idsJson){
  var ids;
  try{
    ids = JSON.parse(idsJson.replace(/&quot;/g,'"'));
  }catch(e){
    console.error('Error parsing IDs:', e);
    return;
  }

  var items = [];
  for(var i=0; i<ids.length; i++){
    for(var j=0; j<_ventas.length; j++){
      if(_ventas[j].id === ids[i]){
        items.push(_ventas[j]);
        break;
      }
    }
  }

  if(items.length === 0) return;

  _detalleVentaId = null;
  _detalleEditando = false;
  _productosDisponibles = [];

  renderDetalleGrupo(items);
}

function renderDetalleGrupo(items){
  var primerItem = items[0];

  function campo(lbl, val){
    return '<div class="sc">'+
      '<div style="font-size:10px;font-weight:700;color:var(--brand);letter-spacing:.6px;text-transform:uppercase;margin-bottom:4px;">'+lbl+'</div>'+
      '<div style="font-size:13px;color:var(--tl);">'+val+'</div>'+
      '</div>';
  }

  var contenido='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1rem;">';
  contenido+=campo('Vendedor','<strong>'+getNombreVendedor(primerItem.vendedor_id)+'</strong>');
  contenido+=campo('Fecha', fmt(primerItem.fecha));
  contenido+=campo('Movimiento', bMov(primerItem.movimiento));
  contenido+=campo('Veterinaria', primerItem.veterinaria||'---');
  contenido+=campo('Doctora / Medico', primerItem.doctora||'---');
  contenido+=campo('Zona', primerItem.zona||'---');
  contenido+=campo('Celular', primerItem.num_medico||primerItem.celular||'---');
  if(primerItem.ruc)contenido+=campo('RUC', primerItem.ruc);
  contenido+='</div>';

  contenido+='<div style="background:var(--sky4);border:1px solid var(--sky);border-radius:var(--r);padding:.85rem 1rem;margin-bottom:1rem;">'+
    '<div style="font-size:11px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px;">&#128230; PRODUCTOS VENDIDOS</div>'+
    '<table style="width:100%;font-size:13px;">'+
    '<thead><tr style="border-bottom:1px solid var(--sky);">'+
    '<th style="text-align:left;padding:6px 0;font-size:10px;font-weight:700;color:var(--brand);text-transform:uppercase;">Producto</th>'+
    '<th style="text-align:center;padding:6px 0;font-size:10px;font-weight:700;color:var(--brand);text-transform:uppercase;">Cant.</th>'+
    '<th style="text-align:right;padding:6px 0;font-size:10px;font-weight:700;color:var(--brand);text-transform:uppercase;">P. Unit.</th>'+
    '<th style="text-align:right;padding:6px 0;font-size:10px;font-weight:700;color:var(--brand);text-transform:uppercase;">Subtotal</th>'+
    '</tr></thead><tbody>';

  var totalGeneral = 0;
  for(var i=0; i<items.length; i++){
    var item = items[i];
    var subtotal = parseFloat(item.total) || 0;
    totalGeneral += subtotal;

    contenido+='<tr style="border-bottom:1px solid rgba(0,0,0,0.05);">'+
      '<td style="padding:8px 0;color:var(--td);">'+(item.producto||'---')+'</td>'+
      '<td style="padding:8px 0;text-align:center;color:var(--td);">'+(item.cantidad||0)+'</td>'+
      '<td style="padding:8px 0;text-align:right;color:var(--td);">S/ '+Number(item.precio_unitario||0).toFixed(2)+'</td>'+
      '<td style="padding:8px 0;text-align:right;font-weight:700;color:var(--brand);">S/ '+subtotal.toFixed(2)+'</td>'+
      '</tr>';
  }

  contenido+='</tbody><tfoot><tr style="border-top:2px solid var(--brand);">'+
    '<td colspan="3" style="padding:10px 0;font-weight:700;color:var(--brand);text-transform:uppercase;font-size:12px;">TOTAL</td>'+
    '<td style="padding:10px 0;text-align:right;font-weight:700;color:var(--brand);font-size:16px;">S/ '+totalGeneral.toFixed(2)+'</td>'+
    '</tr></tfoot></table></div>';

  if(primerItem.fecha_cobro){
    contenido+='<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:var(--r);padding:.7rem 1rem;margin-bottom:1rem;font-size:12px;color:#92400e;">'+
      '&#128197; Cobro estimado: <strong>'+fmt(primerItem.fecha_cobro)+'</strong></div>';
  }

  contenido+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem;">'+
    '<span style="font-size:10px;font-weight:700;color:var(--brand);text-transform:uppercase;">Estado:</span>'+
    bEst(primerItem.estado)+'</div>';

  var notasAgrupadas = [];
  for(var i=0; i<items.length; i++){
    if(items[i].notas && items[i].notas.trim() && items[i].notas !== 'EMPTY'){
      notasAgrupadas.push(items[i].notas);
    }
  }
  var notasTexto = notasAgrupadas.join(' | ');

  contenido+='<div style="border:1px solid var(--bd);border-radius:var(--r);padding:.85rem 1rem;margin-bottom:1rem;">'+
    '<div style="font-size:10px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;">&#128203; Notas del vendedor</div>'+
    '<div style="font-size:13px;line-height:1.6;color:var(--td);">'+(notasTexto||'<span style="color:var(--tl);font-style:italic;">Sin notas adicionales</span>')+'</div>'+
    '</div>';

  var canAnul=(primerItem.estado!=='Anulado');
  var idsArray = items.map(function(item){ return item.id; });
  var idsJson = JSON.stringify(idsArray).replace(/"/g,'&quot;');

  contenido+='<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:1rem;">'+
    (canAnul?'<button class="btn btn-d" onclick="anularGrupo(\\''+idsJson+'\\');cerrarDetalle()">Anular todo</button>':'')+
    '<button class="btn btn-p" onclick="cerrarDetalle()">Cerrar</button>'+
    '</div>';

  gel('detalle-body').innerHTML=contenido;
  gel('detalle-titulo').textContent=(primerItem.veterinaria||'Transaccion')+' \u00b7 '+fmt(primerItem.fecha)+' \u00b7 '+items.length+' productos';
  gel('modal-detalle').classList.add('open');
}
`;

const regex = /function rHist\(\)\{[\s\S]*?\}function anularVenta\(id\)/;
content = content.replace(regex, agruparCode + '\nfunction anularVenta(id)');

fs.writeFileSync('index_1_corregido.html', content, 'utf8');
