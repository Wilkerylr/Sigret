/**
 * Rutas para el módulo de Reportes
 * CRUD de reportes técnicos con filtros, paginación y auditoría
 *
 * Endpoints:
 *   POST   /api/reportes                  → Crear nuevo reporte
 *   GET    /api/reportes                  → Obtener reportes (filtros + paginación)
 *   GET    /api/reportes/:id              → Obtener reporte por ID (detalle completo)
 *   PUT    /api/reportes/:id              → Actualizar reporte (genera registro de auditoría)
 *   DELETE /api/reportes/:id              → Soft delete (genera registro de auditoría)
 *
 * Esquema de BD:
 *   - reportes (id, numero_reporte, cliente_reporte FK→clientes,
 *       equipo_reporte, fecha_reporte, atencion_reporte, hora_inicio_reporte,
 *       hora_fin_reporte, descripcion_falla_reporte, trabajo_reporte,
 *       repuestos_reporte FK→repuestos, posible_causa_reporte,
 *       anotaciones_reporte, tecnico_reporte FK→usuarios,
 *       estado_reporte FK→estados_equipos, soft_delete_reporte,
 *       etiqueta_reporte FK→etiquetas_reportes, reportado_por)
 *   - servicios_tecnicos (id, tecnico_servicio FK→usuarios, reporte_servicio FK→reportes)
 *   - modificaciones_reportes (id, descripcion_modificacion, usuario_modificacion,
 *       reporte_modificado, fecha_modificacion)
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { verificarToken, requiereAdmin } = require('../middlewares/auth');
const { sanitizar, esHoraValida, aHoraMin, esFechaValida, hoy } = require('../utils/validaciones');

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Consulta base de reportes con joins a tablas relacionadas
 */
const SELECT_CON_JOINS = `
  id,
  numero_reporte,
  equipo_reporte,
  fecha_reporte,
  atencion_reporte,
  hora_inicio_reporte,
  hora_fin_reporte,
  descripcion_falla_reporte,
  trabajo_reporte,
  posible_causa_reporte,
  anotaciones_reporte,
  reportado_por,
  soft_delete_reporte,
  clientes ( id, nombre_cliente ),
  usuarios ( id, nombre_usuario, apellido_usuario ),
  estados_equipos ( id, nombre ),
  etiquetas_reportes ( id, nombre_etiqueta ),
  repuestos ( id, nombre_repuesto )
`;

/**
 * Formatea un reporte para la respuesta HTTP
 * @param {Object} reporte - Registro de la BD
 * @param {Map<number, Array>} mapaDetallesRepuestos - Mapa de reporteId → [{ repuestoId, nombre, cantidad }]
 */
function formatearReporte(reporte, mapaDetallesRepuestos) {
  const repuestos = [];

  // Repuesto principal del FK (siempre cantidad 1)
  if (reporte.repuestos?.id) {
    repuestos.push({
      id: reporte.repuestos.id,
      nombre: reporte.repuestos.nombre_repuesto,
      cantidad: 1,
    });
  }

  // Repuestos adicionales de detalle_repuestos
  if (mapaDetallesRepuestos) {
    const detalles = mapaDetallesRepuestos.get(reporte.id) || [];
    for (const d of detalles) {
      if (d.nombre && !repuestos.some(r => r.id === d.repuestoId)) {
        repuestos.push({ id: d.repuestoId, nombre: d.nombre, cantidad: d.cantidad });
      }
    }
  }

  return {
    id: reporte.id,
    numeroReporte: `REP-${String(reporte.numero_reporte).padStart(3, '0')}`,
    cliente: reporte.clientes?.nombre_cliente || null,
    clienteId: reporte.clientes?.id || null,
    equipo: reporte.equipo_reporte,
    fechaReporte: reporte.fecha_reporte,
    fechaAtencion: reporte.atencion_reporte,
    horaInicio: aHoraMin(reporte.hora_inicio_reporte),
    horaFinalizacion: aHoraMin(reporte.hora_fin_reporte),
    descripcionFalla: reporte.descripcion_falla_reporte,
    trabajoRealizado: reporte.trabajo_reporte,
    etiqueta: reporte.etiquetas_reportes?.nombre_etiqueta || null,
    etiquetaId: reporte.etiquetas_reportes?.id || null,
    tecnico: reporte.usuarios
      ? `${reporte.usuarios.nombre_usuario} ${reporte.usuarios.apellido_usuario}`
      : null,
    tecnicoId: reporte.usuarios?.id || null,
    estado: reporte.estados_equipos?.nombre || null,
    estadoId: reporte.estados_equipos?.id || null,
    repuestos,
    repuesto: repuestos.length > 0 ? repuestos[0].nombre : null,
    repuestoId: repuestos.length > 0 ? repuestos[0].id : null,
    posibleCausa: reporte.posible_causa_reporte || null,
    anotaciones: reporte.anotaciones_reporte || null,
    reportadoPor: reporte.reportado_por || null,
  };
}

/**
 * Obtiene un mapa de detalle de repuestos adicionales para un conjunto de reportes.
 * Map<reporteId, Array<{ repuestoId, nombre, cantidad }>>
 */
async function obtenerDetallesRepuestos(reporteIds) {
  if (!reporteIds || reporteIds.length === 0) return new Map();
  const { data } = await supabase
    .from('detalle_repuestos')
    .select('reporte_repuesto, repuesto_detalle, cantidad_repuesto, repuestos ( id, nombre_repuesto )')
    .in('reporte_repuesto', reporteIds);

  const mapa = new Map();
  for (const d of (data || [])) {
    const key = d.reporte_repuesto;
    if (!mapa.has(key)) mapa.set(key, []);
    mapa.get(key).push({
      repuestoId: d.repuestos?.id || d.repuesto_detalle,
      nombre: d.repuestos?.nombre_repuesto || null,
      cantidad: d.cantidad_repuesto || 1,
    });
  }
  return mapa;
}

/**
 * Registra una modificación en el historial de auditoría
 */
async function registrarModificacion({ reporteId, usuarioId, descripcion, fecha }) {
  await supabase
    .from('modificaciones_reportes')
    .insert({
      reporte_modificado: reporteId,
      usuario_modificacion: usuarioId,
      descripcion_modificacion: descripcion,
      fecha_modificacion: fecha || new Date().toISOString().split('T')[0],
    });
}

// ==========================================
// ENDPOINTS
// ==========================================

/**
 * GET /api/reportes
 *
 * Obtiene reportes activos con filtros y paginación.
 *
 * Query params:
 *   numero   - Filtrar por número de reporte (parcial, case-insensitive)
 *   cliente  - Filtrar por nombre de cliente (parcial)
 *   equipo   - Filtrar por equipo (parcial)
 *   etiqueta - Filtrar por nombre de etiqueta (parcial)
 *   tecnico  - Filtrar por nombre del técnico (parcial)
 *   desde    - Fecha inicio (YYYY-MM-DD)
 *   hasta    - Fecha fin (YYYY-MM-DD)
 *   pagina   - Página actual (default: 1)
 *   items    - Items por página (default: 10)
 */
router.get('/', verificarToken, async (req, res) => {
  try {
    const {
      numero, cliente, equipo, etiqueta, tecnico,
      desde, hasta,
      pagina = 1, items = 10,
    } = req.query;

    const paginaNum = Math.max(1, Number(pagina));
    const itemsNum = Math.min(50, Math.max(1, Number(items)));
    const inicio = (paginaNum - 1) * itemsNum;

    // Construir consulta base
    let query = supabase
      .from('reportes')
      .select(SELECT_CON_JOINS, { count: 'exact' })
      .eq('soft_delete_reporte', false);

    // Aplicar filtros
    if (numero && numero.trim()) {
      // Buscar por número parcial
      const numLimpio = numero.trim().replace(/[^0-9]/g, '');
      if (numLimpio) {
        query = query.ilike('numero_reporte::text', `%${numLimpio}%`);
      }
    }
    if (cliente && cliente.trim()) {
      query = query.ilike('clientes.nombre_cliente', `%${cliente.trim()}%`);
    }
    if (equipo && equipo.trim()) {
      query = query.ilike('equipo_reporte', `%${equipo.trim()}%`);
    }
    if (etiqueta && etiqueta.trim()) {
      query = query.ilike('etiquetas_reportes.nombre_etiqueta', `%${etiqueta.trim()}%`);
    }
    if (tecnico && tecnico.trim()) {
      query = query.or(
        `usuarios.nombre_usuario.ilike.%${tecnico.trim()}%,usuarios.apellido_usuario.ilike.%${tecnico.trim()}%`
      );
    }
    if (desde) {
      query = query.gte('fecha_reporte', desde);
    }
    if (hasta) {
      query = query.lte('fecha_reporte', hasta);
    }

    // Paginación y orden
    query = query
      .order('numero_reporte', { ascending: false })
      .range(inicio, inicio + itemsNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[REPORTES] Error al obtener reportes:', error.message);
      return res.status(500).json({ error: 'Error al obtener los reportes' });
    }

    const totalItems = count || 0;
    const totalPaginas = Math.max(1, Math.ceil(totalItems / itemsNum));

    const mapaDetalles = await obtenerDetallesRepuestos((data || []).map(r => r.id));

    res.json({
      reportes: (data || []).map(r => formatearReporte(r, mapaDetalles)),
      paginacion: {
        paginaActual: paginaNum,
        totalPaginas,
        totalItems,
        itemsPorPagina: itemsNum,
      },
    });
  } catch (error) {
    console.error('[REPORTES] Error inesperado en GET /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/reportes/:id
 *
 * Obtiene un reporte por ID con todos los detalles incluyendo técnicos adicionales
 * (de servicios_tecnicos).
 */
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const reporteId = Number(req.params.id);

    if (isNaN(reporteId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data: reporte, error } = await supabase
      .from('reportes')
      .select(SELECT_CON_JOINS)
      .eq('id', reporteId)
      .eq('soft_delete_reporte', false)
      .single();

    if (error || !reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Obtener técnicos adicionales de servicios_tecnicos
    const { data: serviciosTecnicos } = await supabase
      .from('servicios_tecnicos')
      .select(`
        id,
        usuarios ( id, nombre_usuario, apellido_usuario )
      `)
      .eq('reporte_servicio', reporteId);

    const tecnicosAdicionales = (serviciosTecnicos || []).map(st => ({
      id: st.usuarios.id,
      nombre: `${st.usuarios.nombre_usuario} ${st.usuarios.apellido_usuario}`,
    }));

    const mapaDetalles = await obtenerDetallesRepuestos([reporteId]);
    const reporteFormateado = formatearReporte(reporte, mapaDetalles);
    reporteFormateado.tecnicosAdicionales = tecnicosAdicionales;

    res.json(reporteFormateado);
  } catch (error) {
    console.error('[REPORTES] Error inesperado en GET /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/reportes
 *
 * Crea un nuevo reporte técnico.
 * Valida: número único, fechas ≤ hoy, horas consistentes, FK existentes.
 * Registra creación en el historial de auditoría.
 *
 * Body: {
 *   "numeroReporte": 1,
 *   "clienteId": 1,
 *   "equipo": "PC Dell",
 *   "fechaReporte": "2026-07-29",
 *   "fechaAtencion": "2026-07-29",
 *   "horaInicio": "08:00",
 *   "horaFinalizacion": "10:00",
 *   "descripcionFalla": "No enciende",
 *   "trabajoRealizado": "Se reemplazó la fuente",
 *   "etiquetaId": 1,
 *   "tecnicoId": 2,
 *   "estadoId": 1,
 *   "repuestoId": 1,
 *   "posibleCausa": "Fuente dañada",
 *   "anotaciones": "Equipo con 3 años de uso",
 *   "reportadoPor": "Admin",
 *   "tecnicos": [3],
 *   "repuestos": [{"repuestoId": 1, "cantidad": 2}]
 * }
 */
router.post('/', verificarToken, async (req, res) => {
  try {
    const {
      numeroReporte,
      clienteId, equipo, fechaReporte, fechaAtencion,
      horaInicio, horaFinalizacion, descripcionFalla, trabajoRealizado,
      etiquetaId, estadoId,
      posibleCausa, anotaciones, reportadoPor,
    } = req.body;

    const errores = [];
    const hoyStr = hoy();

    // Normalizar horas a HH:MM (descartar segundos)
    const hInicio = aHoraMin(horaInicio);
    const hFin = aHoraMin(horaFinalizacion);

    // ── Validar número de reporte ──
    if (!numeroReporte || isNaN(Number(numeroReporte)) || Number(numeroReporte) < 1) {
      errores.push('El campo "numeroReporte" es obligatorio y debe ser un número positivo');
    }

    // ── Validar campos obligatorios simples ──
    if (!clienteId || isNaN(Number(clienteId))) {
      errores.push('El campo "clienteId" es obligatorio y debe ser un número');
    }
    if (!equipo || typeof equipo !== 'string' || equipo.trim().length === 0) {
      errores.push('El campo "equipo" es obligatorio');
    }
    if (!fechaReporte) {
      errores.push('El campo "fechaReporte" es obligatorio');
    }
    if (!fechaAtencion) {
      errores.push('El campo "fechaAtencion" es obligatorio');
    }
    if (!horaInicio) {
      errores.push('El campo "horaInicio" es obligatorio');
    }
    if (!horaFinalizacion) {
      errores.push('El campo "horaFinalizacion" es obligatorio');
    }
    if (!descripcionFalla || typeof descripcionFalla !== 'string' || descripcionFalla.trim().length === 0) {
      errores.push('El campo "descripcionFalla" es obligatorio');
    }
    if (!trabajoRealizado || typeof trabajoRealizado !== 'string' || trabajoRealizado.trim().length === 0) {
      errores.push('El campo "trabajoRealizado" es obligatorio');
    }
    if (!etiquetaId || isNaN(Number(etiquetaId))) {
      errores.push('El campo "etiquetaId" es obligatorio');
    }
    if (!estadoId || isNaN(Number(estadoId))) {
      errores.push('El campo "estadoId" es obligatorio');
    }

    // ── Validar formato de fechas ──
    if (fechaReporte && !esFechaValida(fechaReporte)) {
      errores.push('El campo "fechaReporte" no tiene un formato válido (YYYY-MM-DD)');
    }
    if (fechaAtencion && !esFechaValida(fechaAtencion)) {
      errores.push('El campo "fechaAtencion" no tiene un formato válido (YYYY-MM-DD)');
    }

    // ── Validar formato de horas ──
    if (hInicio && !esHoraValida(hInicio)) {
      errores.push('El campo "horaInicio" no tiene un formato válido (HH:MM)');
    }
    if (hFin && !esHoraValida(hFin)) {
      errores.push('El campo "horaFinalizacion" no tiene un formato válido (HH:MM)');
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Error de validación', detalles: errores });
    }

    // ── Validar fechas ≤ hoy ──
    if (fechaReporte > hoyStr) {
      return res.status(400).json({
        error: 'La fecha del reporte no puede ser posterior a hoy',
      });
    }
    if (fechaAtencion > hoyStr) {
      return res.status(400).json({
        error: 'La fecha de atención no puede ser posterior a hoy',
      });
    }

    // ── Validar consistencia de fechas ──
    if (fechaAtencion < fechaReporte) {
      return res.status(400).json({
        error: 'La fecha de atención no puede ser anterior a la fecha del reporte',
      });
    }

    // ── Validar horas (fin > inicio) ──
    const [hIniH, hIniM] = hInicio.split(':').map(Number);
    const [hFinH, hFinM] = hFin.split(':').map(Number);
    const minInicio = hIniH * 60 + hIniM;
    const minFin = hFinH * 60 + hFinM;

    if (minFin <= minInicio) {
      return res.status(400).json({
        error: 'La hora de finalización debe ser posterior a la hora de inicio',
      });
    }
    if (minFin - minInicio < 15) {
      return res.status(400).json({
        error: 'La duración mínima del servicio debe ser de 15 minutos',
      });
    }

    // ── Validar unicidad del número de reporte ──
    const numReporteValor = Number(numeroReporte);
    const { data: existenteNum } = await supabase
      .from('reportes')
      .select('id')
      .eq('numero_reporte', numReporteValor)
      .eq('soft_delete_reporte', false)
      .maybeSingle();

    if (existenteNum) {
      return res.status(409).json({
        error: `Ya existe un reporte con el número "${numReporteValor}"`,
      });
    }

    // ── Sanitizar strings ──
    const equipoLimpio = sanitizar(equipo, 200);
    const descripcionFallaM = sanitizar(descripcionFalla, 2000);
    const trabajoLimpio = sanitizar(trabajoRealizado, 2000);
    const posibleCausaLimpio = posibleCausa ? sanitizar(posibleCausa, 2000) : null;
    const anotacionesLimpias = anotaciones ? sanitizar(anotaciones, 2000) : null;
    const reportadoPorLimpio = reportadoPor ? sanitizar(reportadoPor, 200) : '';

    // ── Verificar FK: cliente ──
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id, nombre_cliente')
      .eq('id', Number(clienteId))
      .eq('is_delete', false)
      .maybeSingle();

    if (!cliente) {
      return res.status(400).json({ error: 'El cliente especificado no existe o está inactivo' });
    }

    // ── Verificar FK: etiqueta ──
    const { data: etiqueta } = await supabase
      .from('etiquetas_reportes')
      .select('id')
      .eq('id', Number(etiquetaId))
      .maybeSingle();

    if (!etiqueta) {
      return res.status(400).json({ error: 'La etiqueta especificada no existe' });
    }

    // ── Verificar FK: estado ──
    const { data: estado } = await supabase
      .from('estados_equipos')
      .select('id')
      .eq('id', Number(estadoId))
      .maybeSingle();

    if (!estado) {
      return res.status(400).json({ error: 'El estado especificado no existe' });
    }

    // ── Procesar técnicos ──
    const tecnicosIds = [];
    let tecnicoPrincipalId = null;

    if (req.body.tecnicoId) {
      const tId = Number(req.body.tecnicoId);
      const { data: tecnico } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', tId)
        .eq('is_delete', false)
        .maybeSingle();
      if (tecnico) {
        tecnicoPrincipalId = tId;
        tecnicosIds.push(tId);
      } else {
        return res.status(400).json({ error: `El técnico con ID ${tId} no existe o está inactivo` });
      }
    }

    if (Array.isArray(req.body.tecnicos)) {
      for (const t of req.body.tecnicos) {
        const tId = Number(t);
        if (!isNaN(tId) && tId > 0 && !tecnicosIds.includes(tId)) {
          const { data: tecnico } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', tId)
            .eq('is_delete', false)
            .maybeSingle();
          if (tecnico) {
            tecnicosIds.push(tId);
          }
        }
      }
    }

    if (tecnicosIds.length === 0) {
      return res.status(400).json({ error: 'Debe especificar al menos un técnico' });
    }

    // ── Procesar repuestos ──
    let primerRepuestoId = null;
    const repuestosDetalle = [];

    if (req.body.repuestoId) {
      const rId = Number(req.body.repuestoId);
      const { data: repuesto } = await supabase
        .from('repuestos')
        .select('id')
        .eq('id', rId)
        .eq('is_delete', false)
        .maybeSingle();
      if (repuesto) {
        primerRepuestoId = rId;
        repuestosDetalle.push({ repuestoId: rId, cantidad: 1 });
      }
    }

    if (Array.isArray(req.body.repuestos)) {
      for (const r of req.body.repuestos) {
        const rId = Number(r.repuestoId || r.id);
        const cantidad = Math.max(1, Number(r.cantidad) || 1);
        if (!isNaN(rId) && rId > 0 && !repuestosDetalle.some(d => d.repuestoId === rId)) {
          const { data: repuesto } = await supabase
            .from('repuestos')
            .select('id')
            .eq('id', rId)
            .eq('is_delete', false)
            .maybeSingle();
          if (repuesto) {
            repuestosDetalle.push({ repuestoId: rId, cantidad });
            if (!primerRepuestoId) primerRepuestoId = rId;
          }
        }
      }
    }

    // ── Insertar reporte ──
    const { data: nuevoReporte, error: insertError } = await supabase
      .from('reportes')
      .insert({
        numero_reporte: numReporteValor,
        cliente_reporte: Number(clienteId),
        equipo_reporte: equipoLimpio,
        fecha_reporte: fechaReporte,
        atencion_reporte: fechaAtencion,
        hora_inicio_reporte: hInicio,
        hora_fin_reporte: hFin,
        descripcion_falla_reporte: descripcionFallaM,
        trabajo_reporte: trabajoLimpio,
        etiqueta_reporte: Number(etiquetaId),
        tecnico_reporte: tecnicoPrincipalId || tecnicosIds[0],
        estado_reporte: Number(estadoId),
        repuestos_reporte: primerRepuestoId,
        posible_causa_reporte: posibleCausaLimpio,
        anotaciones_reporte: anotacionesLimpias,
        reportado_por: reportadoPorLimpio,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[REPORTES] Error al insertar reporte:', insertError.message);
      return res.status(500).json({ error: 'Error al crear el reporte' });
    }

    const reporteId = nuevoReporte.id;

    // Transacción compensatoria: si falla una operación posterior,
    // elimina el reporte recién creado y sus dependencias para no dejar datos huérfanos.
    const deshacerCreacion = async (motivo) => {
      console.error('[REPORTES] Revirtiendo creación del reporte', reporteId, ':', motivo);
      await supabase.from('servicios_tecnicos').delete().eq('reporte_servicio', reporteId);
      await supabase.from('detalle_repuestos').delete().eq('reporte_repuesto', reporteId);
      await supabase.from('modificaciones_reportes').delete().eq('reporte_modificado', reporteId);
      await supabase.from('reportes').delete().eq('id', reporteId);
    };

    // ── Insertar técnicos adicionales en servicios_tecnicos ──
    if (tecnicosIds.length > 1) {
      const serviciosInsert = tecnicosIds
        .filter(tId => tId !== tecnicoPrincipalId)
        .map(tId => ({
          tecnico_servicio: tId,
          reporte_servicio: reporteId,
        }));
      if (serviciosInsert.length > 0) {
        const { error: serviciosError } = await supabase.from('servicios_tecnicos').insert(serviciosInsert);
        if (serviciosError) {
          await deshacerCreacion(`servicios_tecnicos: ${serviciosError.message}`);
          return res.status(500).json({ error: 'Error al asignar los técnicos al reporte' });
        }
      }
    }

    // ── Insertar detalle de repuestos ──
    if (repuestosDetalle.length > 0) {
      const detalleInsert = repuestosDetalle
        .filter(d => d.repuestoId !== primerRepuestoId)
        .map(d => ({
          repuesto_detalle: d.repuestoId,
          reporte_repuesto: reporteId,
          cantidad_repuesto: d.cantidad,
        }));
      if (detalleInsert.length > 0) {
        const { error: detalleError } = await supabase.from('detalle_repuestos').insert(detalleInsert);
        if (detalleError) {
          await deshacerCreacion(`detalle_repuestos: ${detalleError.message}`);
          return res.status(500).json({ error: 'Error al registrar el detalle de repuestos' });
        }
      }
    }

    // ── Registrar en auditoría ──
    await registrarModificacion({
      reporteId,
      usuarioId: req.usuario.id,
      descripcion: 'Se creó el reporte técnico',
    });

    // ── Obtener reporte completo ──
    const { data: reporteCompleto } = await supabase
      .from('reportes')
      .select(SELECT_CON_JOINS)
      .eq('id', reporteId)
      .single();

    res.status(201).json({
      message: 'Reporte creado exitosamente',
      reporte: formatearReporte(reporteCompleto, await obtenerDetallesRepuestos([reporteId])),
    });
  } catch (error) {
    console.error('[REPORTES] Error inesperado en POST /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/reportes/:id
 *
 * Actualiza un reporte existente.
 * Registra los campos modificados en el historial de auditoría.
 */
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const reporteId = Number(req.params.id);

    if (isNaN(reporteId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    // Verificar que el reporte exista
    const { data: reporteActual } = await supabase
      .from('reportes')
      .select('*')
      .eq('id', reporteId)
      .eq('soft_delete_reporte', false)
      .single();

    if (!reporteActual) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const {
      clienteId, equipo, fechaReporte, fechaAtencion,
      horaInicio, horaFinalizacion, descripcionFalla, trabajoRealizado,
      etiquetaId, tecnicoId, estadoId, repuestoId,
      posibleCausa, anotaciones, reportadoPor, motivoModificacion,
    } = req.body;

    // Mapeo de campos del body a columnas de BD
    const camposMap = {
      clienteId: 'cliente_reporte',
      equipo: 'equipo_reporte',
      fechaReporte: 'fecha_reporte',
      fechaAtencion: 'atencion_reporte',
      horaInicio: 'hora_inicio_reporte',
      horaFinalizacion: 'hora_fin_reporte',
      descripcionFalla: 'descripcion_falla_reporte',
      trabajoRealizado: 'trabajo_reporte',
      etiquetaId: 'etiqueta_reporte',
      tecnicoId: 'tecnico_reporte',
      estadoId: 'estado_reporte',
      repuestoId: 'repuestos_reporte',
      posibleCausa: 'posible_causa_reporte',
      anotaciones: 'anotaciones_reporte',
      reportadoPor: 'reportado_por',
    };

    // Construir actualizaciones y detectar cambios
    const updateData = {};
    const camposModificados = [];
    const valoresAnteriores = {};
    const valoresNuevos = {};

    const valoresBody = {
      clienteId: clienteId !== undefined && clienteId !== null && clienteId !== '' ? Number(clienteId) : undefined,
      equipo: (equipo === undefined || equipo === null) ? undefined : sanitizar(String(equipo), 200),
      fechaReporte,
      fechaAtencion,
      horaInicio: aHoraMin(horaInicio),
      horaFinalizacion: aHoraMin(horaFinalizacion),
      descripcionFalla: (descripcionFalla === undefined || descripcionFalla === null) ? undefined : sanitizar(String(descripcionFalla), 2000),
      trabajoRealizado: (trabajoRealizado === undefined || trabajoRealizado === null) ? undefined : sanitizar(String(trabajoRealizado), 2000),
      etiquetaId: etiquetaId !== undefined && etiquetaId !== null && etiquetaId !== '' ? Number(etiquetaId) : undefined,
      tecnicoId: tecnicoId !== undefined && tecnicoId !== null && tecnicoId !== '' ? Number(tecnicoId) : undefined,
      estadoId: estadoId !== undefined && estadoId !== null && estadoId !== '' ? Number(estadoId) : undefined,
      repuestoId: repuestoId === null ? null : (repuestoId !== undefined && repuestoId !== '' ? Number(repuestoId) : undefined),
      posibleCausa: (posibleCausa === undefined || posibleCausa === null) ? undefined : sanitizar(String(posibleCausa), 2000),
      anotaciones: (anotaciones === undefined || anotaciones === null) ? undefined : sanitizar(String(anotaciones), 2000),
      reportadoPor: (reportadoPor === undefined || reportadoPor === null) ? undefined : sanitizar(String(reportadoPor), 200),
    };

    // ── Validar formato de fechas y horas (si se proporcionan) ──
    const errores = [];
    if (fechaReporte && !esFechaValida(fechaReporte)) {
      errores.push('El campo "fechaReporte" no tiene un formato válido (YYYY-MM-DD)');
    }
    if (fechaAtencion && !esFechaValida(fechaAtencion)) {
      errores.push('El campo "fechaAtencion" no tiene un formato válido (YYYY-MM-DD)');
    }
    if (horaInicio && !esHoraValida(horaInicio)) {
      errores.push('El campo "horaInicio" no tiene un formato válido (HH:MM)');
    }
    if (horaFinalizacion && !esHoraValida(horaFinalizacion)) {
      errores.push('El campo "horaFinalizacion" no tiene un formato válido (HH:MM)');
    }
    if (errores.length > 0) {
      return res.status(400).json({ error: 'Error de validación', detalles: errores });
    }

    // ── Validar fechas ≤ hoy y coherencia ──
    const hoyStr = hoy();
    if (fechaReporte && fechaReporte > hoyStr) {
      return res.status(400).json({ error: 'La fecha del reporte no puede ser posterior a hoy' });
    }
    if (fechaAtencion && fechaAtencion > hoyStr) {
      return res.status(400).json({ error: 'La fecha de atención no puede ser posterior a hoy' });
    }
    if (fechaReporte && fechaAtencion && fechaAtencion < fechaReporte) {
      return res.status(400).json({ error: 'La fecha de atención no puede ser anterior a la fecha del reporte' });
    }

    // ── Validar horas (fin > inicio, duración mínima 15 min) ──
    const hInicioNorm = aHoraMin(horaInicio);
    const hFinNorm = aHoraMin(horaFinalizacion);
    if (hInicioNorm && hFinNorm && esHoraValida(hInicioNorm) && esHoraValida(hFinNorm)) {
      const [hIniH, hIniM] = hInicioNorm.split(':').map(Number);
      const [hFinH, hFinM] = hFinNorm.split(':').map(Number);
      const minInicio = hIniH * 60 + hIniM;
      const minFin = hFinH * 60 + hFinM;
      if (minFin <= minInicio) {
        return res.status(400).json({ error: 'La hora de finalización debe ser posterior a la hora de inicio' });
      }
      if (minFin - minInicio < 15) {
        return res.status(400).json({ error: 'La duración mínima del servicio debe ser de 15 minutos' });
      }
    }

    // ── Validar existencia de FKs (si se proporcionan) ──
    const fksAValidar = [
      { campo: 'clienteId', id: clienteId, tabla: 'clientes', mensaje: 'El cliente especificado no existe o está inactivo' },
      { campo: 'etiquetaId', id: etiquetaId, tabla: 'etiquetas_reportes', mensaje: 'La etiqueta especificada no existe' },
      { campo: 'estadoId', id: estadoId, tabla: 'estados_equipos', mensaje: 'El estado especificado no existe' },
      { campo: 'tecnicoId', id: tecnicoId, tabla: 'usuarios', mensaje: 'El técnico especificado no existe o está inactivo' },
      { campo: 'repuestoId', id: repuestoId, tabla: 'repuestos', mensaje: 'El repuesto especificado no existe o está inactivo' },
    ];
    const tablasConSoftDelete = new Set(['clientes', 'usuarios', 'repuestos']);
    for (const fk of fksAValidar) {
      if (fk.id === undefined || fk.id === null || fk.id === '') continue;
      const idNum = Number(fk.id);
      if (isNaN(idNum) || idNum < 1) {
        return res.status(400).json({ error: `El campo "${fk.campo}" debe ser un número válido` });
      }
      let query = supabase.from(fk.tabla).select('id').eq('id', idNum);
      if (tablasConSoftDelete.has(fk.tabla)) {
        query = query.eq('is_delete', false);
      }
      const { data: fila } = await query.maybeSingle();
      if (!fila) {
        return res.status(400).json({ error: fk.mensaje });
      }
    }

    for (const [key, columna] of Object.entries(camposMap)) {
      const nuevoValor = valoresBody[key];
      if (nuevoValor === undefined) continue;

      let valorActual = reporteActual[columna];

      // Normalizar horas a HH:MM antes de comparar (la BD guarda con segundos)
      if (columna === 'hora_inicio_reporte' || columna === 'hora_fin_reporte') {
        valorActual = aHoraMin(valorActual);
      }

      // Comparar valores (manejar nulls y strings)
      const actualStr = valorActual === null || valorActual === undefined ? '' : String(valorActual);
      const nuevoStr = nuevoValor === null || nuevoValor === undefined ? '' : String(nuevoValor);

      if (actualStr !== nuevoStr) {
        updateData[columna] = nuevoValor;
        camposModificados.push(key);
        valoresAnteriores[key] = valorActual;
        valoresNuevos[key] = nuevoValor;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.json({ message: 'No se detectaron cambios', reporte: formatearReporte(reporteActual, await obtenerDetallesRepuestos([reporteId])) });
    }

    // El motivo de la modificación es obligatorio para editar
    const motivo = sanitizar(motivoModificacion, 500);
    if (!motivo) {
      return res.status(400).json({ error: 'Debe indicar el motivo de la modificación' });
    }

    // Actualizar en BD
    const { error: updateError } = await supabase
      .from('reportes')
      .update(updateData)
      .eq('id', reporteId);

    if (updateError) {
      console.error('[REPORTES] Error al actualizar:', updateError.message);
      return res.status(500).json({ error: 'Error al actualizar el reporte' });
    }

    // Registrar modificación en auditoría
    const descripcionAuditoria = `Se modificaron: ${camposModificados.join(', ')} | Motivo: ${motivo}`;
    await registrarModificacion({
      reporteId,
      usuarioId: req.usuario.id,
      descripcion: descripcionAuditoria,
    });

    // Obtener reporte actualizado con joins
    const { data: reporteActualizado } = await supabase
      .from('reportes')
      .select(SELECT_CON_JOINS)
      .eq('id', reporteId)
      .single();

    res.json({
      message: 'Reporte actualizado exitosamente',
      reporte: formatearReporte(reporteActualizado, await obtenerDetallesRepuestos([reporteId])),
      camposModificados,
    });
  } catch (error) {
    console.error('[REPORTES] Error inesperado en PUT /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/reportes/:id
 *
 * Soft delete de un reporte (marca soft_delete_reporte = true).
 * Registra eliminación en el historial de auditoría.
 */
router.delete('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const reporteId = Number(req.params.id);

    if (isNaN(reporteId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    // Verificar que el reporte exista
    const { data: reporte } = await supabase
      .from('reportes')
      .select('id, numero_reporte')
      .eq('id', reporteId)
      .eq('soft_delete_reporte', false)
      .single();

    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Soft delete
    const { error } = await supabase
      .from('reportes')
      .update({ soft_delete_reporte: true })
      .eq('id', reporteId)
      .eq('soft_delete_reporte', false);

    if (error) {
      console.error('[REPORTES] Error al eliminar:', error.message);
      return res.status(500).json({ error: 'Error al eliminar el reporte' });
    }

    // Registrar eliminación en auditoría
    await registrarModificacion({
      reporteId,
      usuarioId: req.usuario.id,
      descripcion: 'Se eliminó el reporte técnico',
    });

    res.json({
      message: 'Reporte eliminado exitosamente',
      reporteId: reporte.id,
    });
  } catch (error) {
    console.error('[REPORTES] Error inesperado en DELETE /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PATCH /api/reportes/:id/restaurar
 *
 * Restaura un reporte eliminado lógicamente (soft_delete_reporte = false).
 */
router.patch('/:id/restaurar', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const reporteId = Number(req.params.id);

    if (isNaN(reporteId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data: reporte } = await supabase
      .from('reportes')
      .select('id, numero_reporte')
      .eq('id', reporteId)
      .eq('soft_delete_reporte', true)
      .maybeSingle();

    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado o no está eliminado' });
    }

    const { error } = await supabase
      .from('reportes')
      .update({ soft_delete_reporte: false })
      .eq('id', reporteId)
      .eq('soft_delete_reporte', true);

    if (error) {
      console.error('[REPORTES] Error al restaurar:', error.message);
      return res.status(500).json({ error: 'Error al restaurar el reporte' });
    }

    await registrarModificacion({
      reporteId,
      usuarioId: req.usuario.id,
      descripcion: 'Se restauró el reporte técnico',
    });

    res.json({
      message: 'Reporte restaurado exitosamente',
      reporteId: reporte.id,
    });
  } catch (error) {
    console.error('[REPORTES] Error inesperado en PATCH /:id/restaurar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
