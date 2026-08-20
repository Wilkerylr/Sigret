/* ======================================
   components/TabPlantillas.tsx
   Administración de plantillas predefinidas de reportes
   ====================================== */

import React from 'react';
import { Edit3, Plus, Trash2, Search, RotateCcw } from 'lucide-react';
import { useGestionPlantillas } from '../hooks/useGestionPlantillas';
import TablaGenerica from './TablaGenerica';
import ModalConfirmacion from './ModalConfirmacion';
import { FormularioEdicion, CONFIG_PLANTILLA } from '@/componentes/formulario_edicion';
import type { ColumnaTabla, AccionFila } from '../types';
import type { Plantilla } from '@/data/plantillas';

const TabPlantillas: React.FC = () => {
  const {
    plantillas,
    filtros,
    plantillaEditando,
    plantillaEliminar,
    cargando,
    actualizarFiltro,
    limpiarFiltros,
    iniciarEdicion,
    iniciarCreacion,
    guardarEdicion,
    cancelarEdicion,
    modoCrear,
    solicitarEliminar,
    confirmarEliminar,
    cancelarEliminar,
  } = useGestionPlantillas();

  const columnas: ColumnaTabla<Plantilla>[] = [
    { key: 'nombre', titulo: 'Nombre', minWidth: '150px' },
    {
      key: 'descripcion',
      titulo: 'Descripción',
      minWidth: '250px',
      render: (v: string) => v || '—',
    },
    {
      key: 'equipo',
      titulo: 'Equipo',
      minWidth: '120px',
      render: (v: string) => v || '—',
    },
    {
      key: 'declaracion',
      titulo: 'Estado',
      minWidth: '100px',
      render: (v: string) => {
        if (!v) return '—';
        return (
          <span className={`gestion-tag ${v === 'operativo' ? 'gestion-tag--exito' : 'gestion-tag--peligro'}`}>
            {v === 'operativo' ? 'Operativo' : 'Inoperativo'}
          </span>
        );
      },
    },
    {
      key: 'etiquetasPredefinidas',
      titulo: 'Etiquetas',
      minWidth: '150px',
      render: (etiquetas?: string[]) => (
        <div className="gestion-tags">
          {!etiquetas || etiquetas.length === 0 ? (
            <span className="gestion-tag-vacio">Sin etiquetas</span>
          ) : (
            etiquetas.map((e) => (
              <span key={e} className="gestion-tag">{e}</span>
            ))
          )}
        </div>
      ),
    },
  ];

  const acciones: AccionFila<Plantilla>[] = [
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
    <div className="tab-plantillas">
      <div className="tab-header">
        <div className="tab-header-row">
          <div>
            <h2 className="tab-titulo">Gestión de Plantillas</h2>
            <p className="tab-descripcion">
              Administra las plantillas predefinidas para la creación de reportes técnicos.
            </p>
          </div>
          <button
            type="button"
            className="tab-btn-agregar"
            onClick={iniciarCreacion}
          >
            <Plus size={16} />
            Agregar Plantilla
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="tab-filtros">
        <div className="tab-filtros-grid">
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label" htmlFor="plt-nombre">Nombre</label>
            <div className="tab-filtro-input-wrapper">
              <Search size={14} className="tab-filtro-icono" />
              <input
                id="plt-nombre"
                name="nombre"
                type="text"
                className="tab-filtro-input"
                placeholder="Buscar por nombre..."
                value={filtros.nombre}
                onChange={actualizarFiltro}
              />
            </div>
          </div>
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label" htmlFor="plt-descripcion">Descripción</label>
            <input
              id="plt-descripcion"
              name="descripcion"
              type="text"
              className="tab-filtro-input"
              placeholder="Buscar por descripción..."
              value={filtros.descripcion}
              onChange={actualizarFiltro}
            />
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
        datos={plantillas}
        columnas={columnas}
        acciones={acciones}
        mensajeVacio="No se encontraron plantillas."
        cargando={cargando}
      />

      {/* Modal de edición/creación */}
      {plantillaEditando && (
        <FormularioEdicion
          titulo={modoCrear ? 'Nueva Plantilla' : `Editar Plantilla ${plantillaEditando.nombre}`}
          entidad={plantillaEditando}
          configuracion={CONFIG_PLANTILLA}
          onGuardar={guardarEdicion}
          onCancelar={cancelarEdicion}
          modo={modoCrear ? 'crear' : 'editar'}
          modal={true}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        abierto={!!plantillaEliminar}
        titulo="Eliminar Plantilla"
        mensaje={
          plantillaEliminar
            ? `¿Estás seguro de eliminar la plantilla "${plantillaEliminar.nombre}"? Esta acción no se puede deshacer.`
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

export default TabPlantillas;