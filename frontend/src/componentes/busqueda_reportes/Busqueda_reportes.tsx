/* ======================================
   Busqueda_reportes.tsx
   Página principal de búsqueda de reportes con paginación
   ====================================== */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import './busqueda_reportes.css';
import FiltrosBusqueda from './components/FiltrosBusqueda';
import ResultadosBusqueda from './components/ResultadosBusqueda';
import { FiltrosBusqueda as FiltrosBusquedaType, ReporteResumen, FILTROS_INICIALES } from './types';
import { FormularioEdicion } from '@/componentes/formulario_edicion';
import { crearConfigReporteEdicion } from '@/componentes/formulario_edicion/configuraciones';
import { useOpcionesFormulario } from '@/componentes/formulario_edicion/hooks/useOpcionesFormulario';
import type { EntidadEditable } from '@/componentes/formulario_edicion';

interface BusquedaReportesProps {
  /** Datos iniciales desde una fuente externa (API) */
  datosIniciales?: ReporteResumen[];
  /** Si es true, oculta el título "Búsqueda de Reportes" (modo embebido) */
  modoEmbebido?: boolean;
  /** Callback cuando se guarda un reporte editado */
  onGuardar?: (datos: EntidadEditable) => Promise<boolean>;
}

// ─── Componente principal ────────────────────────────────────────────────────
const BusquedaReportes: React.FC<BusquedaReportesProps> = ({
  datosIniciales,
  modoEmbebido = false,
  onGuardar,
}) => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosBusquedaType>({ ...FILTROS_INICIALES });
  const [resultadosCompletos, setResultadosCompletos] = useState<ReporteResumen[]>([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  const { opciones: opcionesFormulario } = useOpcionesFormulario();
  const configuracionEdicion = useMemo(
    () => crearConfigReporteEdicion(opcionesFormulario),
    [opcionesFormulario]
  );

  // Si se proveen datos iniciales, usarlos como fuente
  const fuenteDatos = useMemo(() => datosIniciales || [], [datosIniciales]);

  // Actualizar resultados cuando cambian los datos iniciales
  useEffect(() => {
    if (datosIniciales && datosIniciales.length > 0) {
      setResultadosCompletos(datosIniciales);
      setBusquedaRealizada(true);
    }
  }, [datosIniciales]);

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
    let filtrados = [...fuenteDatos];

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
        r.repuestos.some((rp) => rp.nombre.toLowerCase().includes(term)) ||
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
        r.repuestos.some((rp) => rp.nombre.toLowerCase() === filtros.repuesto.toLowerCase())
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
  }, [terminoBusqueda, filtros, fuenteDatos]);

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
  const [reporteEditar, setReporteEditar] = useState<EntidadEditable | null>(null);

  const aIdTexto = (valor: number | null | undefined): string =>
    valor === null || valor === undefined ? '' : String(valor);

  const handleEditarReporte = (reporte: ReporteResumen) => {
    // Los IDs de la API son números; las opciones del formulario usan strings
    setReporteEditar({
      id: reporte.id,
      numeroReporte: reporte.numeroReporte,
      cliente: reporte.cliente,
      clienteId: aIdTexto(reporte.clienteId),
      equipo: reporte.equipo,
      fechaReporte: reporte.fechaReporte,
      fechaAtencion: reporte.fechaAtencion,
      horaInicio: reporte.horaInicio,
      horaFinalizacion: reporte.horaFinalizacion,
      descripcionFalla: reporte.descripcionFalla,
      trabajoRealizado: reporte.trabajoRealizado,
      etiquetaId: aIdTexto(reporte.etiquetaId),
      tecnicoId: aIdTexto(reporte.tecnicoId),
      estadoId: aIdTexto(reporte.estadoId),
      repuestoId: aIdTexto(reporte.repuestoId),
      plantilla: reporte.plantilla,
      posibleCausa: reporte.posibleCausa || '',
      anotaciones: reporte.anotaciones || '',
      reportadoPor: reporte.reportadoPor || '',
    });
  };

  const handleGuardarEdicion = async (datos: EntidadEditable): Promise<boolean> => {
    if (onGuardar) {
      return await onGuardar(datos);
    }
    // Modo independiente: actualizar localmente
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
      {!modoEmbebido && <h1 className="busqueda-titulo">Búsqueda de Reportes</h1>}

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
          entidad={reporteEditar}
          configuracion={configuracionEdicion}
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
