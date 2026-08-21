/* ======================================
   components/TabReportes.tsx
   Visualización de reportes usando el componente BusquedaReportes existente
   ====================================== */

import React, { useMemo } from 'react';
import { useGestionReportes } from '../hooks/useGestionReportes';
import BusquedaReportes from '@/componentes/busqueda_reportes/Busqueda_reportes';
import type { ReporteResumen as BusquedaReporte } from '@/componentes/busqueda_reportes/types';

const TabReportes: React.FC = () => {
  const { reportes, cargando, guardarEdicion } = useGestionReportes();

  // Mapear datos del backend al formato que espera BusquedaReportes
  const reportesMapeados = useMemo<BusquedaReporte[]>(() => {
    return reportes.map((r) => ({
      id: String(r.id),
      numeroReporte: r.numeroReporte || `REP-${String(r.id).padStart(3, '0')}`,
      cliente: r.cliente || '',
      clienteId: r.clienteId,
      equipo: r.equipo || '',
      fechaReporte: r.fechaReporte || '',
      fechaAtencion: r.fechaAtencion || '',
      horaInicio: r.horaInicio || '',
      horaFinalizacion: r.horaFinalizacion || '',
      descripcionFalla: r.descripcionFalla || '',
      trabajoRealizado: r.trabajoRealizado || '',
      etiquetas: r.etiqueta ? [r.etiqueta] : [],
      etiquetaId: r.etiquetaId,
      tecnicos: r.tecnico ? [r.tecnico] : [],
      tecnicoId: r.tecnicoId,
      repuestos: r.repuestos || (r.repuesto ? [{ id: r.repuestoId || 0, nombre: r.repuesto, cantidad: 1 }] : []),
      repuestoId: r.repuestoId,
      declaracion: r.estado || '',
      estadoId: r.estadoId,
      plantilla: '',
      posibleCausa: r.posibleCausa || '',
      anotaciones: r.anotaciones || '',
      reportadoPor: r.reportadoPor || '',
    }));
  }, [reportes]);

  if (cargando && reportes.length === 0) {
    return (
      <div className="tab-reportes">
        <div className="tab-header">
          <h2 className="tab-titulo">Reportes Técnicos</h2>
          <p className="tab-descripcion">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-reportes">
      <BusquedaReportes
        datosIniciales={reportesMapeados}
        modoEmbebido={true}
        onGuardar={guardarEdicion}
      />
    </div>
  );
};

export default TabReportes;
