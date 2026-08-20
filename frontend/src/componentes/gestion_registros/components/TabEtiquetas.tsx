/* ======================================
   components/TabEtiquetas.tsx
   Sistema de etiquetas (tags) para organizar, categorizar y filtrar reportes
   ====================================== */

import React from 'react';
import { Edit3, Plus, Trash2, Search, RotateCcw } from 'lucide-react';
import { useGestionEtiquetas } from '../hooks/useGestionEtiquetas';
import TablaGenerica from './TablaGenerica';
import ModalConfirmacion from './ModalConfirmacion';
import { FormularioEdicion, CONFIG_ETIQUETA } from '@/componentes/formulario_edicion';
import type { ColumnaTabla, AccionFila, Etiqueta } from '../types';

const TabEtiquetas: React.FC = () => {
  const {
    etiquetas,
    filtros,
    etiquetaEditando,
    etiquetaEliminar,
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
  } = useGestionEtiquetas();

  const columnas: ColumnaTabla<Etiqueta>[] = [
    { key: 'id', titulo: 'ID', minWidth: '80px' },
    { key: 'nombre', titulo: 'Nombre', minWidth: '200px' },
  ];

  const acciones: AccionFila<Etiqueta>[] = [
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
    <div className="tab-etiquetas">
      <div className="tab-header">
        <div className="tab-header-row">
          <div>
            <h2 className="tab-titulo">Sistema de Etiquetas</h2>
            <p className="tab-descripcion">
              Gestiona las etiquetas (tags) para organizar, categorizar y filtrar los reportes técnicos.
            </p>
          </div>
          <button
            type="button"
            className="tab-btn-agregar"
            onClick={iniciarCreacion}
          >
            <Plus size={16} />
            Agregar Etiqueta
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="tab-filtros">
        <div className="tab-filtros-grid">
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label" htmlFor="etq-nombre">Nombre</label>
            <div className="tab-filtro-input-wrapper">
              <Search size={14} className="tab-filtro-icono" />
              <input
                id="etq-nombre"
                name="nombre"
                type="text"
                className="tab-filtro-input"
                placeholder="Buscar por nombre..."
                value={filtros.nombre}
                onChange={actualizarFiltro}
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
        datos={etiquetas}
        columnas={columnas}
        acciones={acciones}
        mensajeVacio="No se encontraron etiquetas."
        cargando={cargando}
      />

      {/* Modal de edición/creación */}
      {etiquetaEditando && (
        <FormularioEdicion
          titulo={modoCrear ? 'Nueva Etiqueta' : `Editar Etiqueta ${etiquetaEditando.nombre}`}
          entidad={{ ...etiquetaEditando, id: String(etiquetaEditando.id) }}
          configuracion={CONFIG_ETIQUETA}
          onGuardar={guardarEdicion}
          onCancelar={cancelarEdicion}
          modo={modoCrear ? 'crear' : 'editar'}
          modal={true}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        abierto={!!etiquetaEliminar}
        titulo="Eliminar Etiqueta"
        mensaje={
          etiquetaEliminar
            ? `¿Estás seguro de eliminar la etiqueta "${etiquetaEliminar.nombre}"? Los reportes que la usan perderán esta etiqueta.`
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

export default TabEtiquetas;