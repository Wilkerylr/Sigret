/* ======================================
   components/TabReportes.tsx
   CRUD de reportes técnicos: visualización, edición y eliminación
   ====================================== */

import React from 'react';
import { Edit3, Trash2, Search, RotateCcw } from 'lucide-react';
import { useGestionReportes } from '../hooks/useGestionReportes';
import TablaGenerica from './TablaGenerica';
import ModalConfirmacion from './ModalConfirmacion';
import { FormularioEdicion, CONFIG_REPORTE_EDICION } from '@/componentes/formulario_edicion';
import type { ColumnaTabla, AccionFila } from '../types';
import type { ReporteResumen } from '@/data/reportes';

const TabReportes: React.FC = () => {
  const {
    reportes,
    reportesTotal,
    filtros,
    paginaActual,
    totalPaginas,
    itemsPorPagina,
    reporteEditando,
    reporteEliminar,
    cargando,
    actualizarFiltro,
    limpiarFiltros,
    cambiarPagina,
    cambiarItemsPorPagina,
    iniciarEdicion,
    guardarEdicion,
    cancelarEdicion,
    solicitarEliminar,
    confirmarEliminar,
    cancelarEliminar,
  } = useGestionReportes();

  const columnas: ColumnaTabla<ReporteResumen>[] = [
    { key: 'numeroReporte', titulo: 'N° Reporte', minWidth: '120px' },
    { key: 'cliente', titulo: 'Cliente', minWidth: '180px' },
    { key: 'equipo', titulo: 'Equipo', minWidth: '150px' },
    {
      key: 'fechaReporte',
      titulo: 'Fecha',
      minWidth: '120px',
      render: (valor: string) => valor || '—',
    },
    {
      key: 'etiquetas',
      titulo: 'Etiquetas',
      minWidth: '150px',
      render: (etiquetas: string[]) => (
        <div className="gestion-tags">
          {etiquetas.length === 0 ? (
            <span className="gestion-tag-vacio">Sin etiquetas</span>
          ) : (
            etiquetas.map((e) => (
              <span key={e} className="gestion-tag">{e}</span>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'declaracion',
      titulo: 'Declaración',
      minWidth: '120px',
    },
  ];

  const acciones: AccionFila<ReporteResumen>[] = [
    {
      etiqueta: 'Editar',
      icono: <Edit3 size={14} />,
      variant: 'primary',
      onClick: iniciarEdicion,
    },
    {
      etiqueta: 'Eliminar',
      icono: <Trash2 size={14} />,
      variant: 'danger',
      onClick: solicitarEliminar,
    },
  ];

  return (
    <div className="tab-reportes">
      <div className="tab-header">
        <h2 className="tab-titulo">Reportes Técnicos</h2>
        <p className="tab-descripcion">
          Visualiza, edita y elimina reportes técnicos. Total: {reportesTotal} reportes.
        </p>
      </div>

      {/* Filtros */}
      <div className="tab-filtros">
        <div className="tab-filtros-grid">
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label" htmlFor="rep-numeroReporte">N° Reporte</label>
            <div className="tab-filtro-input-wrapper">
              <Search size={14} className="tab-filtro-icono" />
              <input
                id="rep-numeroReporte"
                name="numeroReporte"
                type="text"
                className="tab-filtro-input"
                placeholder="Buscar por número..."
                value={filtros.numeroReporte}
                onChange={actualizarFiltro}
              />
            </div>
          </div>
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label" htmlFor="rep-cliente">Cliente</label>
            <input
              id="rep-cliente"
              name="cliente"
              type="text"
              className="tab-filtro-input"
              placeholder="Nombre del cliente..."
              value={filtros.cliente}
              onChange={actualizarFiltro}
            />
          </div>
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label" htmlFor="rep-equipo">Equipo</label>
            <input
              id="rep-equipo"
              name="equipo"
              type="text"
              className="tab-filtro-input"
              placeholder="Nombre del equipo..."
              value={filtros.equipo}
              onChange={actualizarFiltro}
            />
          </div>
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label" htmlFor="rep-etiqueta">Etiqueta</label>
            <input
              id="rep-etiqueta"
              name="etiqueta"
              type="text"
              className="tab-filtro-input"
              placeholder="Filtrar por etiqueta..."
              value={filtros.etiqueta}
              onChange={actualizarFiltro}
            />
          </div>
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label">Rango de fechas</label>
            <div className="tab-filtro-rango">
              <input
                name="fechaDesde"
                type="date"
                className="tab-filtro-input"
                value={filtros.fechaDesde}
                onChange={actualizarFiltro}
                title="Fecha desde"
              />
              <span className="tab-filtro-separador">a</span>
              <input
                name="fechaHasta"
                type="date"
                className="tab-filtro-input"
                value={filtros.fechaHasta}
                onChange={actualizarFiltro}
                title="Fecha hasta"
              />
            </div>
          </div>
        </div>
        <div className="tab-filtros-acciones">
          <button type="button" className="tab-btn-limpiar" onClick={limpiarFiltros}>
            <RotateCcw size={14} />
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      <TablaGenerica
        datos={reportes}
        columnas={columnas}
        acciones={acciones}
        mensajeVacio="No se encontraron reportes con los filtros especificados."
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalItems={reportesTotal}
        itemsPorPagina={itemsPorPagina}
        onCambiarPagina={cambiarPagina}
        onCambiarItemsPorPagina={cambiarItemsPorPagina}
        cargando={cargando}
      />

      {/* Modal de edición */}
      {reporteEditando && (
        <FormularioEdicion
          titulo={`Editar Reporte ${reporteEditando.numeroReporte}`}
          entidad={reporteEditando as any}
          configuracion={CONFIG_REPORTE_EDICION}
          onGuardar={guardarEdicion}
          onCancelar={cancelarEdicion}
          modo="editar"
          modal={true}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        abierto={!!reporteEliminar}
        titulo="Eliminar Reporte"
        mensaje={
          reporteEliminar
            ? `¿Estás seguro de eliminar el reporte ${reporteEliminar.numeroReporte} de ${reporteEliminar.cliente}? Esta acción no se puede deshacer.`
            : ''
        }
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        variant="danger"
        onConfirmar={confirmarEliminar}
        onCancelar={cancelarEliminar}
        cargando={cargando}
      />
    </div>
  );
};

export default TabReportes;