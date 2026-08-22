/**
 * Rutas para el módulo de Estadísticas del Dashboard
 *
 * Endpoints:
 *   GET /api/estadisticas                   → Dashboard completo (totales + series)
 *   GET /api/estadisticas/reportes-por-mes  → Reportes agrupados por mes (query: anio)
 *   GET /api/estadisticas/tecnicos-top      → Técnicos con más reportes (query: limite)
 *
 * Todas requieren autenticación (verificarToken).
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { verificarToken } = require('../middlewares/auth');

const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Convierte "HH:MM" a horas decimales. Devuelve 0 si el formato es inválido.
 */
function horasEntre(inicio, fin) {
  if (!inicio || !fin || !/^\d{2}:\d{2}$/.test(inicio) || !/^\d{2}:\d{2}$/.test(fin)) return 0;
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  const totalInicio = h1 * 60 + m1;
  const totalFin = h2 * 60 + m2;
  if (totalFin <= totalInicio) {
    // Turno nocturno: ej. 23:00 → 01:00 (sumar 24h al fin)
    return ((totalFin + 24 * 60) - totalInicio) / 60;
  }
  return (totalFin - totalInicio) / 60;
}

/**
 * Serie diaria de reportes (con ceros para completar el rango).
 * @param {number} dias - Cantidad de días a retroceder desde hoy
 */
async function obtenerPorDia(dias = 90) {
  const desde = new Date();
  desde.setDate(desde.getDate() - (dias - 1));
  const desdeStr = desde.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('reportes')
    .select('fecha_reporte')
    .eq('soft_delete_reporte', false)
    .gte('fecha_reporte', desdeStr);

  if (error) throw error;

  const conteo = {};
  for (const r of data || []) {
    const key = r.fecha_reporte;
    if (key) conteo[key] = (conteo[key] || 0) + 1;
  }

  const filas = [];
  for (let i = 0; i < dias; i++) {
    const fecha = new Date(desde);
    fecha.setDate(desde.getDate() + i);
    const key = fecha.toISOString().split('T')[0];
    filas.push({ date: key, total: conteo[key] || 0 });
  }
  return filas;
}

/**
 * Reportes agrupados por mes de un año.
 * @param {number} anio - Año a consultar (default: año actual)
 */
async function obtenerPorMes(anio) {
  const y = Number(anio) || new Date().getFullYear();
  const desde = `${y}-01-01`;
  const hasta = `${y}-12-31`;

  const { data, error } = await supabase
    .from('reportes')
    .select('fecha_reporte')
    .eq('soft_delete_reporte', false)
    .gte('fecha_reporte', desde)
    .lte('fecha_reporte', hasta);

  if (error) throw error;

  const conteo = new Array(12).fill(0);
  for (const r of data || []) {
    const mes = Number(String(r.fecha_reporte || '').split('-')[1]);
    if (mes >= 1 && mes <= 12) conteo[mes - 1]++;
  }

  const meses = MESES_ES.map((mes, i) => ({ mes, cantidad: conteo[i] }));
  return { año: y, meses };
}

/**
 * Técnicos con más reportes atendidos (con promedio de horas).
 * @param {number} limite - Cantidad máxima (default: 5)
 */
async function obtenerTecnicosTop(limite) {
  const lim = Math.min(20, Math.max(1, Number(limite) || 5));

  const { data: reportes, error: errReportes } = await supabase
    .from('reportes')
    .select('tecnico_reporte, hora_inicio_reporte, hora_fin_reporte')
    .eq('soft_delete_reporte', false)
    .not('tecnico_reporte', 'is', null);

  if (errReportes) throw errReportes;

  const { data: usuarios, error: errUsuarios } = await supabase
    .from('usuarios')
    .select('id, nombre_usuario, apellido_usuario')
    .eq('is_delete', false);

  if (errUsuarios) throw errUsuarios;

  const nombrePorId = new Map(
    (usuarios || []).map((u) => [
      u.id,
      `${u.nombre_usuario || ''} ${u.apellido_usuario || ''}`.trim() || 'Sin nombre',
    ])
  );

  const stats = new Map();
  for (const r of reportes || []) {
    if (!nombrePorId.has(r.tecnico_reporte)) continue;
    const horas = horasEntre(r.hora_inicio_reporte, r.hora_fin_reporte);
    const s = stats.get(r.tecnico_reporte) || {
      nombre: nombrePorId.get(r.tecnico_reporte),
      count: 0,
      totalHoras: 0,
    };
    s.count++;
    s.totalHoras += horas;
    stats.set(r.tecnico_reporte, s);
  }

  return [...stats.values()]
    .map((s) => ({
      nombre: s.nombre,
      reportesAtendidos: s.count,
      promedioHoras: s.count ? Number((s.totalHoras / s.count).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.reportesAtendidos - a.reportesAtendidos)
    .slice(0, lim);
}

/**
 * GET /api/estadisticas
 *
 * Devuelve el dashboard completo: totales generales + series de datos.
 */
router.get('/', verificarToken, async (req, res) => {
  try {
    const ahora = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual = ahora.getMonth();
    const desdeMes = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-01`;

    const [{ count: totalReportes, error: errTotal }, { data: clientesData, error: errClientes }] =
      await Promise.all([
        supabase
          .from('reportes')
          .select('id', { count: 'exact', head: true })
          .eq('soft_delete_reporte', false),
        supabase
          .from('reportes')
          .select('cliente_reporte')
          .eq('soft_delete_reporte', false),
      ]);

    if (errTotal || errClientes) {
      console.error('[ESTADISTICAS] Error en totales:', (errTotal || errClientes).message);
      return res.status(500).json({ error: 'Error al obtener las estadísticas' });
    }

    // Reportes del mes actual
    const { count: reportesEsteMes, error: errMes } = await supabase
      .from('reportes')
      .select('id', { count: 'exact', head: true })
      .eq('soft_delete_reporte', false)
      .gte('fecha_reporte', desdeMes);
    if (errMes) {
      console.error('[ESTADISTICAS] Error en reportes del mes:', errMes.message);
      return res.status(500).json({ error: 'Error al obtener las estadísticas' });
    }

    // Técnicos activos (rol técnico)
    const { data: tecnicosData, error: errTecnicos } = await supabase
      .from('usuarios')
      .select('id, roles ( nombre_rol )')
      .eq('is_delete', false);
    if (errTecnicos) {
      console.error('[ESTADISTICAS] Error en técnicos:', errTecnicos.message);
      return res.status(500).json({ error: 'Error al obtener las estadísticas' });
    }

    const clientesAtendidos = new Set(
      (clientesData || []).map((c) => c.cliente_reporte).filter((c) => c != null)
    ).size;

    const tecnicosActivos = (tecnicosData || []).filter(
      (u) => String(u.roles?.nombre_rol || '').toLowerCase() === 'tecnico'
    ).length;

    const [porDia, porMes, tecnicosTop] = await Promise.all([
      obtenerPorDia(90),
      obtenerPorMes(anioActual),
      obtenerTecnicosTop(5),
    ]);

    res.json({
      totalReportes: totalReportes || 0,
      reportesEsteMes: reportesEsteMes || 0,
      tecnicosActivos,
      clientesAtendidos,
      porDia,
      porMes,
      tecnicosTop,
    });
  } catch (error) {
    console.error('[ESTADISTICAS] Error inesperado en GET /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/estadisticas/reportes-por-mes?anio=2026
 */
router.get('/reportes-por-mes', verificarToken, async (req, res) => {
  try {
    const porMes = await obtenerPorMes(req.query.anio);
    res.json(porMes);
  } catch (error) {
    console.error('[ESTADISTICAS] Error en reportes-por-mes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/estadisticas/tecnicos-top?limite=5
 */
router.get('/tecnicos-top', verificarToken, async (req, res) => {
  try {
    const tecnicosTop = await obtenerTecnicosTop(req.query.limite);
    res.json(tecnicosTop);
  } catch (error) {
    console.error('[ESTADISTICAS] Error en tecnicos-top:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
