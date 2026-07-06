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
import { FormularioEdicion, CONFIG_REPORTE_EDICION } from '@/componentes/formulario_edicion';
import type { EntidadEditable } from '@/componentes/formulario_edicion';
import { REPORTES_PRUEBA } from '@/data';

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

  // ─── Estado para el modal de edición ────────────────────────────────
  const [reporteEditar, setReporteEditar] = useState<ReporteResumen | null>(null);

  const handleEditarReporte = (reporte: ReporteResumen) => {
    setReporteEditar(reporte);
  };

  const handleGuardarEdicion = async (datos: EntidadEditable): Promise<boolean> => {
    // Simular guardado en API
    console.log('📝 Guardando cambios del reporte:', datos);
    
    // Actualizar el reporte en la lista de resultados
    setResultadosCompletos((prev) =>
      prev.map((r) =>
        r.id === datos.id
          ? ({ ...r, ...datos } as ReporteResumen)
          : r
      )
    );

    return true;
  };

  const handleCerrarEdicion = () => {
    setReporteEditar(null);
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

      {/* Modal de edición de reporte */}
      {reporteEditar && (
        <FormularioEdicion
          titulo="Reporte"
          entidad={reporteEditar as unknown as EntidadEditable}
          configuracion={CONFIG_REPORTE_EDICION}
          onGuardar={handleGuardarEdicion}
          onCancelar={handleCerrarEdicion}
          modo="editar"
          modal={true}
        />
      )}
    </div>
  );
};

export default BusquedaReportes;
