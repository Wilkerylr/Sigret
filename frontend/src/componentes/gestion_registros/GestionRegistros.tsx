/* ======================================
   GestionRegistros.tsx
   Componente principal con sistema de tabs para la Gestión de Registros
   ====================================== */

import React, { useState } from 'react';
import {
  FileText,
  Users,
  File,
  Clock,
  Tags,
} from 'lucide-react';
import TabReportes from './components/TabReportes';
import TabClientes from './components/TabClientes';
import TabPlantillas from './components/TabPlantillas';
import TabHistorial from './components/TabHistorial';
import TabEtiquetas from './components/TabEtiquetas';
import type { TabActivo } from './types';
import './gestion_registros.css';

interface TabConfig {
  id: TabActivo;
  etiqueta: string;
  icono: React.ReactNode;
  descripcion: string;
}

const TABS: TabConfig[] = [
  {
    id: 'reportes',
    etiqueta: 'Reportes',
    icono: <FileText size={18} />,
    descripcion: 'Visualización, edición y eliminación de reportes técnicos',
  },
  {
    id: 'clientes',
    etiqueta: 'Clientes',
    icono: <Users size={18} />,
    descripcion: 'Consulta y edición de datos de clientes',
  },
  {
    id: 'plantillas',
    etiqueta: 'Plantillas',
    icono: <File size={18} />,
    descripcion: 'Administración de plantillas predefinidas',
  },
  {
    id: 'historial',
    etiqueta: 'Historial',
    icono: <Clock size={18} />,
    descripcion: 'Log de auditoría de cambios en reportes',
  },
  {
    id: 'etiquetas',
    etiqueta: 'Etiquetas',
    icono: <Tags size={18} />,
    descripcion: 'Sistema de tags para organizar y filtrar reportes',
  },
];

const GestionRegistros: React.FC = () => {
  const [tabActivo, setTabActivo] = useState<TabActivo>('reportes');

  const renderTab = () => {
    switch (tabActivo) {
      case 'reportes':
        return <TabReportes />;
      case 'clientes':
        return <TabClientes />;
      case 'plantillas':
        return <TabPlantillas />;
      case 'historial':
        return <TabHistorial />;
      case 'etiquetas':
        return <TabEtiquetas />;
      default:
        return <TabReportes />;
    }
  };

  return (
    <div className="gestion-registros-container">
      {/* Navegación de tabs */}
      <nav className="gestion-tabs-nav" aria-label="Secciones de gestión">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`gestion-tab-btn ${tabActivo === tab.id ? 'activo' : ''}`}
            onClick={() => setTabActivo(tab.id)}
            aria-selected={tabActivo === tab.id}
            role="tab"
            title={tab.descripcion}
          >
            {tab.icono}
            <span className="gestion-tab-label">{tab.etiqueta}</span>
          </button>
        ))}
      </nav>

      {/* Contenido del tab activo */}
      <div className="gestion-tab-content" role="tabpanel">
        {renderTab()}
      </div>
    </div>
  );
};

export default GestionRegistros;