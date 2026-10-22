/**
 * Rutas para el módulo de Modificaciones de Reportes (Auditoría)
 * Solo lectura - los registros se crean automáticamente desde reportes.js
 *
 * Endpoints:
 *   GET /api/modificaciones                  → Listar modificaciones (filtros + paginación)
 *   GET /api/modificaciones/reporte/:id      → Modificaciones de un reporte específico
 *
 * Esquema de BD:
 *   - modificaciones_reportes (id, descripcion_modificacion, usuario_modificacion FK→usuarios,
 *       reporte_modificado FK→reportes, fecha_modificacion)
 *   - usuarios (id, nombre_usuario, apellido_usuario)
 *   - reportes (id, numero_reporte)
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { verificarToken, verificarPermiso } = require('../middlewares/auth');

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Consulta base de modificaciones con joins
 */
const SELECT_CON_JOINS = `
  id,
  descripcion_modificacion,
  fecha_modificacion,
  usuario_modificacion,
  reporte_modificado,
  usuarios ( id, nombre_usuario, apellido_usuario ),
  reportes ( id, numero_reporte )
`;

/**
 * Formatea una modificación para la respuesta HTTP
 */
function formatearModificacion(mod) {
  const usuario = mod.usuarios;
  const reporte = mod.reportes;

  let numeroReporte = null;
  if (reporte) {
    numeroReporte = `REP-${String(reporte.numero_reporte).padStart(3, '0')}`;
  }

  return {
    id: mod.id,
    reporteId: reporte?.id || mod.reporte_modificado,
    numeroReporte,
    accion: inferirAccion(mod.descripcion_modificacion),
    usuario: usuario
      ? `${usuario.nombre_usuario} ${usuario.apellido_usuario}`
      : 'Sistema',
    fecha: mod.fecha_modificacion,
    descripcion: mod.descripcion_modificacion,
  };
}

/**
 * Inferir el tipo de acción basado en la descripción
 */
function inferirAccion(descripcion) {
  const desc = descripcion.toLowerCase();
  if (desc.includes('creó') || desc.includes('creado') || desc.includes('creación')) {
    return 'creacion';
  }
  if (desc.includes('elimin') || desc.includes('borrado')) {
    return 'eliminacion';
  }
  return 'edicion';
}

// ==========================================
// ENDPOINTS
// ==========================================

/**
 * GET /api/modificaciones
 *
 * Obtiene todas las modificaciones con filtros y paginación.
 *
 * Query params:
 *   numero   - Filtrar por número de reporte (parcial)
 *   accion   - Filtrar por tipo: creacion | edicion | eliminacion
 *   usuario  - Filtrar por nombre de usuario (parcial)
 *   desde    - Fecha inicio (YYYY-MM-DD)
 *   hasta    - Fecha fin (YYYY-MM-DD)
 *   pagina   - Página actual (default: 1)
 *   items    - Items por página (default: 15)
 */
router.get('/', verificarToken, verificarPermiso('view-gestion-registros'), async (req, res) => {
  try {
    const {
      numero, accion, usuario,
      desde, hasta,
      pagina = 1, items = 15,
    } = req.query;

    const paginaNum = Math.max(1, Number(pagina));
    const itemsNum = Math.min(50, Math.max(1, Number(items)));
    const inicio = (paginaNum - 1) * itemsNum;

    let query = supabase
      .from('modificaciones_reportes')
      .select(SELECT_CON_JOINS, { count: 'exact' });

    // Filtros que dependen de tablas relacionadas.
    // PostgREST no permite referenciar columnas de recursos embebidos dentro
    // de `.or()`, así que se resuelven los IDs y se filtra por la FK.
    if (numero && numero.trim()) {
      const numLimpio = numero.trim().replace(/[^0-9]/g, '');
      const descripcion = numero.trim().replace(/[%,()]/g, '');
      const condiciones = [`descripcion_modificacion.ilike.%${descripcion}%`];
      if (numLimpio) {
        const { data: reportesCoincidentes } = await supabase
          .from('reportes')
          .select('id')
          .ilike('numero_reporte::text', `%${numLimpio}%`);
        const idsReportes = (reportesCoincidentes || []).map((r) => r.id);
        if (idsReportes.length > 0) {
          condiciones.unshift(`reporte_modificado.in.(${idsReportes.join(',')})`);
        }
      }
      query = query.or(condiciones.join(','));
    }

    if (usuario && usuario.trim()) {
      const u = usuario.trim().replace(/[%,()]/g, '');
      const { data: usuariosCoincidentes } = await supabase
        .from('usuarios')
        .select('id')
        .or(`nombre_usuario.ilike.%${u}%,apellido_usuario.ilike.%${u}%`);
      const idsUsuarios = (usuariosCoincidentes || []).map((x) => x.id);
      if (idsUsuarios.length === 0) {
        return res.json({
          historial: [],
          paginacion: {
            paginaActual: paginaNum,
            totalPaginas: 1,
            totalItems: 0,
            itemsPorPagina: itemsNum,
          },
        });
      }
      query = query.in('usuario_modificacion', idsUsuarios);
    }

    if (desde) {
      query = query.gte('fecha_modificacion', desde);
    }
    if (hasta) {
      query = query.lte('fecha_modificacion', hasta);
    }

    // Filtro por acción: la acción se infiere de la descripción, por lo que se
    // traduce a un filtro sobre `descripcion_modificacion` para que el conteo
    // (paginación) sea exacto y no se calcule en memoria.
    const accionFiltro = accion && accion.trim() ? accion.trim() : null;
    if (accionFiltro === 'creacion') {
      query = query.or(
        'descripcion_modificacion.ilike.%creó%,descripcion_modificacion.ilike.%creado%,descripcion_modificacion.ilike.%creación%'
      );
    } else if (accionFiltro === 'eliminacion') {
      query = query.or(
        'descripcion_modificacion.ilike.%elimin%,descripcion_modificacion.ilike.%borrado%'
      );
    } else if (accionFiltro === 'edicion') {
      // Edición = no es creación ni eliminación
      query = query
        .not('descripcion_modificacion', 'ilike', '%creó%')
        .not('descripcion_modificacion', 'ilike', '%creado%')
        .not('descripcion_modificacion', 'ilike', '%creación%')
        .not('descripcion_modificacion', 'ilike', '%elimin%')
        .not('descripcion_modificacion', 'ilike', '%borrado%');
    }

    // Orden y paginación
    query = query
      .order('fecha_modificacion', { ascending: false })
      .order('id', { ascending: false })
      .range(inicio, inicio + itemsNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[MODIFICACIONES] Error al obtener historial:', error.message);
      return res.status(500).json({ error: 'Error al obtener el historial de modificaciones' });
    }

    const resultados = (data || []).map(formatearModificacion);

    const totalItems = count || 0;
    const totalPaginas = Math.max(1, Math.ceil(totalItems / itemsNum));

    res.json({
      historial: resultados,
      paginacion: {
        paginaActual: paginaNum,
        totalPaginas,
        totalItems,
        itemsPorPagina: itemsNum,
      },
    });
  } catch (error) {
    console.error('[MODIFICACIONES] Error inesperado en GET /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/modificaciones/reporte/:id
 *
 * Obtiene todas las modificaciones de un reporte específico.
 */
router.get('/reporte/:id', verificarToken, verificarPermiso('view-gestion-registros'), async (req, res) => {
  try {
    const reporteId = Number(req.params.id);

    if (isNaN(reporteId)) {
      return res.status(400).json({ error: 'El ID del reporte debe ser un número válido' });
    }

    const { data, error } = await supabase
      .from('modificaciones_reportes')
      .select(SELECT_CON_JOINS)
      .eq('reporte_modificado', reporteId)
      .order('fecha_modificacion', { ascending: false })
      .order('id', { ascending: false });

    if (error) {
      console.error('[MODIFICACIONES] Error al obtener historial del reporte:', error.message);
      return res.status(500).json({ error: 'Error al obtener el historial del reporte' });
    }

    res.json((data || []).map(formatearModificacion));
  } catch (error) {
    console.error('[MODIFICACIONES] Error inesperado en GET /reporte/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
