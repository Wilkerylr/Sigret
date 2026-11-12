/* ======================================
   components/TabReportes.tsx
   Visualización de reportes usando el componente BusquedaReportes existente
   ====================================== */

import React from 'react';
import { useGestionReportes } from '../hooks/useGestionReportes';
import BusquedaReportes from '@/componentes/busqueda_reportes/Busqueda_reportes';

const TabReportes: React.FC = () => {
  const { reportes, cargando, guardarEdicion } = useGestionReportes();

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
        datosIniciales={reportes}
        modoEmbebido={true}
        onGuardar={guardarEdicion}
      />
    </div>
  );
};

export default TabReportes;
