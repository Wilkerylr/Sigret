/* ======================================
   Busqueda_reportes.tsx
   Página principal de búsqueda de reportes con paginación
   ====================================== */

import React, { useState, useCallback, useMemo } from 'react';
import { Filter, Search } from 'lucide-react';
import './busqueda_reportes.css';
import FiltrosBusqueda from './components/FiltrosBusqueda';
import ResultadosBusqueda from './components/ResultadosBusqueda';
import { FiltrosBusqueda as FiltrosBusquedaType, ReporteResumen, FILTROS_INICIALES } from './types';

// ─── Datos de prueba: 100 reportes ───────────────────────────────────────────
const CLIENTES_REALES = [
  'Admin 951', 'Parking paraiso', 'Admin maralva',
  'Condominio torre la noria', 'Altamira tennis club',
  'Inv kk 2002', 'Admin omiwi', 'Inv clamarxui',
];

const EQUIPOS = [
  'Servidor HP ProLiant DL380', 'Switch Cisco 2960', 'UPS APC 1500VA',
  'Router MikroTik RB951', 'Cámara Hikvision DS-2CD', 'PC Dell Optiplex 3070',
  'Impresora HP LaserJet', 'NAS Synology DS220+', 'Access Point Ubiquiti UAP-AC',
  'Monitor LG 24"', 'Laptop Lenovo ThinkPad', 'Firewall FortiGate 60F',
];

const ETIQUETAS_DISP = ['Mantenimiento', 'Reparación', 'Inspección', 'Mantenimiento esporádico'];
const TECNICOS_DISP = ['Victor', 'Wilker', 'Alexis'];
const REPUESTOS_DISP = ['Batería', 'Disco Duro SSD', 'Memoria RAM', 'Fuente de Poder', 'Ventilador', 'Cable HDMI', 'Teclado', 'Mouse', 'Monitor', 'Router'];
const PLANTILLAS_DISP = ['Mantenimiento', 'Inspección', 'Reparación'];
const DECLARACIONES_DISP = ['Operativo', 'Inoperativo', 'No aplica', 'Operativo bajo observación'];

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randItems<T>(arr: T[], max: number): T[] {
  const count = Math.floor(Math.random() * max) + 1;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

function pad(n: number): string {
  return n.toString().padStart(3, '0');
}

function generarReportesPrueba(): ReporteResumen[] {
  const reportes: ReporteResumen[] = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2026-06-21');

  for (let i = 1; i <= 100; i++) {
    const cliente = randItem(CLIENTES_REALES);
    const equipo = randItem(EQUIPOS);
    const etiquetas = randItems(ETIQUETAS_DISP, 2);
    const tecnicos = randItems(TECNICOS_DISP, 2);
    const repuestos = Math.random() > 0.4 ? randItems(REPUESTOS_DISP, 3) : [];
    const fechaReporte = randDate(startDate, endDate);
    const fechaAtencion = new Date(new Date(fechaReporte).getTime() + Math.random() * 3 * 86400000).toISOString().split('T')[0];
    const plantilla = randItem(PLANTILLAS_DISP);
    const declaracion = randItem(DECLARACIONES_DISP);

    reportes.push({
      id: String(i),
      numeroReporte: `REP-${pad(i)}`,
      cliente,
      equipo,
      fechaReporte,
      fechaAtencion,
      horaInicio: `${String(7 + Math.floor(Math.random() * 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      horaFinalizacion: `${String(8 + Math.floor(Math.random() * 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      descripcionFalla: `Falla detectada en ${equipo} - ${randItem(['No enciende', 'Sobrecalentamiento', 'Ruido anormal', 'Error de conexión', 'Pantalla azul', 'Lento rendimiento', 'Sin señal', 'Corte intermitente'])}`,
      trabajoRealizado: `Se realizó ${randItem(['mantenimiento preventivo', 'cambio de pieza', 'revisión general', 'actualización de firmware', 'limpieza interna', 'reconfiguración'])} en ${equipo}`,
      etiquetas,
      tecnicos,
      repuestos,
      declaracion,
      plantilla,
    });
  }

  return reportes;
}

const REPORTES_PRUEBA = generarReportesPrueba();

// ─── Componente principal ────────────────────────────────────────────────────
const BusquedaReportes: React.FC = () => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosBusquedaType>({ ...FILTROS_INICIALES });
  const [resultadosCompletos, setResultadosCompletos] = useState<ReporteResumen[]>([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  const toggleFiltros = () => {
    setFiltrosVisibles((prev) => !prev);
  };

  const handleFiltroChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const realizarBusqueda = useCallback(() => {
    let filtrados = [...REPORTES_PRUEBA];

    // Búsqueda por texto libre (busca en todas las propiedades)
    if (terminoBusqueda.trim()) {
      const term = terminoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter((r) =>
        r.numeroReporte.toLowerCase().includes(term) ||
        r.cliente.toLowerCase().includes(term) ||
        r.equipo.toLowerCase().includes(term) ||
        r.descripcionFalla.toLowerCase().includes(term) ||
        r.trabajoRealizado.toLowerCase().includes(term) ||
        r.etiquetas.some((e) => e.toLowerCase().includes(term)) ||
        r.tecnicos.some((t) => t.toLowerCase().includes(term)) ||
        r.repuestos.some((rp) => rp.toLowerCase().includes(term)) ||
        r.plantilla.toLowerCase().includes(term) ||
        r.declaracion.toLowerCase().includes(term)
      );
    }

    // Filtros avanzados
    if (filtros.numeroReporte) {
      filtrados = filtrados.filter((r) =>
        r.numeroReporte.toLowerCase().includes(filtros.numeroReporte.toLowerCase())
      );
    }
    if (filtros.etiqueta) {
      filtrados = filtrados.filter((r) =>
        r.etiquetas.some((e) => e.toLowerCase() === filtros.etiqueta.toLowerCase())
      );
    }
    if (filtros.repuesto) {
      filtrados = filtrados.filter((r) =>
        r.repuestos.some((rp) => rp.toLowerCase() === filtros.repuesto.toLowerCase())
      );
    }
    if (filtros.tecnico) {
      filtrados = filtrados.filter((r) =>
        r.tecnicos.some((t) => t.toLowerCase() === filtros.tecnico.toLowerCase())
      );
    }
    if (filtros.fechaDesde) {
      filtrados = filtrados.filter((r) => r.fechaReporte >= filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      filtrados = filtrados.filter((r) => r.fechaReporte <= filtros.fechaHasta);
    }
    if (filtros.cantidadReportes) {
      const max = parseInt(filtros.cantidadReportes, 10);
      filtrados = filtrados.slice(0, max);
    }

    setResultadosCompletos(filtrados);
    setPaginaActual(1);
    setBusquedaRealizada(true);
  }, [terminoBusqueda, filtros]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      realizarBusqueda();
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltros({ ...FILTROS_INICIALES });
  };

  const handleEditarReporte = (reporte: ReporteResumen) => {
    alert(`Editar reporte: ${reporte.numeroReporte}\nCliente: ${reporte.cliente}\n\nLa funcionalidad de edición estará disponible próximamente.`);
  };

  const handleCambiarPagina = (pagina: number) => {
    setPaginaActual(pagina);
  };

  const handleCambiarItemsPorPagina = (items: number) => {
    setItemsPorPagina(items);
    setPaginaActual(1);
  };

  // Calcular paginación
  const totalPaginas = useMemo(() => {
    return Math.max(1, Math.ceil(resultadosCompletos.length / itemsPorPagina));
  }, [resultadosCompletos.length, itemsPorPagina]);

  // Slice de resultados para la página actual
  const resultadosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return resultadosCompletos.slice(inicio, inicio + itemsPorPagina);
  }, [resultadosCompletos, paginaActual, itemsPorPagina]);

  return (
    <div className="busqueda-contenedor">
      <h1 className="busqueda-titulo">Búsqueda de Reportes</h1>

      {/* Barra de búsqueda superior */}
      <div className="busqueda-barra-superior">
        <div className="busqueda-input-wrapper">
          <input
            type="text"
            className="busqueda-input-texto"
            placeholder="Buscar por número de reporte, cliente, equipo, técnico, etiqueta, repuesto..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          type="button"
          className="busqueda-btn-buscar"
          onClick={realizarBusqueda}
        >
          <Search size={18} />
          Buscar
        </button>
        <button
          type="button"
          className={`busqueda-btn-filtros ${filtrosVisibles ? 'activo' : ''}`}
          onClick={toggleFiltros}
        >
          <Filter size={16} />
          {filtrosVisibles ? 'Ocultar filtros' : 'Filtros'}
        </button>
      </div>

      {/* Panel de filtros avanzados */}
      <FiltrosBusqueda
        filtros={filtros}
        onChange={handleFiltroChange}
        onAplicar={realizarBusqueda}
        onLimpiar={handleLimpiarFiltros}
        visible={filtrosVisibles}
      />

      {/* Resultados de la búsqueda */}
      <ResultadosBusqueda
        resultados={resultadosPagina}
        resultadosTotal={resultadosCompletos.length}
        busquedaRealizada={busquedaRealizada}
        onEditarReporte={handleEditarReporte}
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        itemsPorPagina={itemsPorPagina}
        onCambiarPagina={handleCambiarPagina}
        onCambiarItemsPorPagina={handleCambiarItemsPorPagina}
      />
    </div>
  );
};

export default BusquedaReportes;