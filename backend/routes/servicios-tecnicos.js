/**
 * Rutas para el módulo de Servicios Técnicos
 * Asignación de técnicos a reportes (tabla intermedia servicios_tecnicos)
 *
 * Endpoints:
 *   POST   /api/servicios-tecnicos                    → Asignar servicio a técnico (requiereAdmin)
 *   GET    /api/servicios-tecnicos                    → Obtener todos los servicios (filtros)
 *   GET    /api/servicios-tecnicos/tecnico/:tecnicoId → Servicios por técnico
 *   DELETE /api/servicios-tecnicos/:id                → Desasignar servicio (requiereAdmin)
 *
 * Esquema de BD:
 *   - servicios_tecnicos (id, tecnico_servicio FK→usuarios, reporte_servicio FK→reportes)
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { verificarToken, requiereAdmin } = require('../middlewares/auth');

function formatearServicio(servicio) {
  return {
    id: servicio.id,
    tecnico: servicio.usuarios
      ? {
          id: servicio.usuarios.id,
          nombre: `${servicio.usuarios.nombre_usuario} ${servicio.usuarios.apellido_usuario}`.trim(),
        }
      : null,
    reporte: servicio.reportes
      ? {
          id: servicio.reportes.id,
          numeroReporte: `REP-${String(servicio.reportes.numero_reporte).padStart(3, '0')}`,
          equipo: servicio.reportes.equipo_reporte || null,
        }
      : null,
  };
}

/**
 * POST /api/servicios-tecnicos
 *
 * Asigna un técnico a un reporte.
 * Body: { "tecnicoId": 2, "reporteId": 5 }
 */
router.post('/', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const { tecnicoId, reporteId } = req.body;

    if (!tecnicoId || isNaN(Number(tecnicoId))) {
      return res.status(400).json({ error: 'El campo "tecnicoId" es obligatorio y debe ser un número' });
    }
    if (!reporteId || isNaN(Number(reporteId))) {
      return res.status(400).json({ error: 'El campo "reporteId" es obligatorio y debe ser un número' });
    }

    // Verificar que el técnico exista y esté activo
    const { data: tecnico } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', Number(tecnicoId))
      .eq('is_delete', false)
      .maybeSingle();

    if (!tecnico) {
      return res.status(400).json({ error: 'El técnico especificado no existe o está inactivo' });
    }

    // Verificar que el reporte exista y no esté eliminado
    const { data: reporte } = await supabase
      .from('reportes')
      .select('id')
      .eq('id', Number(reporteId))
      .eq('soft_delete_reporte', false)
      .maybeSingle();

    if (!reporte) {
      return res.status(400).json({ error: 'El reporte especificado no existe o está eliminado' });
    }

    // Verificar que no exista la asignación
    const { data: existente } = await supabase
      .from('servicios_tecnicos')
      .select('id')
      .eq('tecnico_servicio', Number(tecnicoId))
      .eq('reporte_servicio', Number(reporteId))
      .maybeSingle();

    if (existente) {
      return res.status(409).json({ error: 'El técnico ya está asignado a este reporte' });
    }

    const { data, error } = await supabase
      .from('servicios_tecnicos')
      .insert({
        tecnico_servicio: Number(tecnicoId),
        reporte_servicio: Number(reporteId),
      })
      .select(`
        id,
        usuarios ( id, nombre_usuario, apellido_usuario ),
        reportes ( id, numero_reporte, equipo_reporte )
      `)
      .single();

    if (error) {
      console.error('[SERVICIOS-TECNICOS] Error al asignar servicio:', error.message);
      return res.status(500).json({ error: 'Error al asignar el servicio' });
    }

    res.status(201).json({
      message: 'Servicio asignado exitosamente',
      servicio: formatearServicio(data),
    });
  } catch (error) {
    console.error('[SERVICIOS-TECNICOS] Error inesperado en POST /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/servicios-tecnicos
 *
 * Lista las asignaciones de servicios técnicos.
 * Filtros opcionales: ?tecnicoId=...&reporteId=...
 */
router.get('/', verificarToken, async (req, res) => {
  try {
    const { tecnicoId, reporteId } = req.query;

    let query = supabase
      .from('servicios_tecnicos')
      .select(`
        id,
        usuarios ( id, nombre_usuario, apellido_usuario ),
        reportes ( id, numero_reporte, equipo_reporte )
      `)
      .order('id', { ascending: false });

    if (tecnicoId && !isNaN(Number(tecnicoId))) {
      query = query.eq('tecnico_servicio', Number(tecnicoId));
    }
    if (reporteId && !isNaN(Number(reporteId))) {
      query = query.eq('reporte_servicio', Number(reporteId));
    }

    const { data, error } = await query;

    if (error) {
      console.error('[SERVICIOS-TECNICOS] Error al obtener servicios:', error.message);
      return res.status(500).json({ error: 'Error al obtener los servicios técnicos' });
    }

    res.json((data || []).map(formatearServicio));
  } catch (error) {
    console.error('[SERVICIOS-TECNICOS] Error inesperado en GET /:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/servicios-tecnicos/tecnico/:tecnicoId
 *
 * Obtiene los servicios asignados a un técnico específico.
 */
router.get('/tecnico/:tecnicoId', verificarToken, async (req, res) => {
  try {
    const tecnicoId = Number(req.params.tecnicoId);

    if (isNaN(tecnicoId)) {
      return res.status(400).json({ error: 'El ID del técnico debe ser un número válido' });
    }

    const { data, error } = await supabase
      .from('servicios_tecnicos')
      .select(`
        id,
        usuarios ( id, nombre_usuario, apellido_usuario ),
        reportes ( id, numero_reporte, equipo_reporte )
      `)
      .eq('tecnico_servicio', tecnicoId)
      .order('id', { ascending: false });

    if (error) {
      console.error('[SERVICIOS-TECNICOS] Error al obtener servicios del técnico:', error.message);
      return res.status(500).json({ error: 'Error al obtener los servicios del técnico' });
    }

    res.json((data || []).map(formatearServicio));
  } catch (error) {
    console.error('[SERVICIOS-TECNICOS] Error inesperado en GET /tecnico/:tecnicoId:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/servicios-tecnicos/:id
 *
 * Desasigna un servicio técnico.
 */
router.delete('/:id', verificarToken, requiereAdmin, async (req, res) => {
  try {
    const servicioId = Number(req.params.id);

    if (isNaN(servicioId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const { data: servicio } = await supabase
      .from('servicios_tecnicos')
      .select('id')
      .eq('id', servicioId)
      .maybeSingle();

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    const { error } = await supabase
      .from('servicios_tecnicos')
      .delete()
      .eq('id', servicioId);

    if (error) {
      console.error('[SERVICIOS-TECNICOS] Error al desasignar:', error.message);
      return res.status(500).json({ error: 'Error al desasignar el servicio' });
    }

    res.json({
      message: 'Servicio desasignado exitosamente',
      servicioId: servicio.id,
    });
  } catch (error) {
    console.error('[SERVICIOS-TECNICOS] Error inesperado en DELETE /:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
