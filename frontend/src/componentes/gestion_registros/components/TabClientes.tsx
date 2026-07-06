/* ======================================
   components/TabClientes.tsx
   Consulta y edición de datos de clientes asociados a reportes
   ====================================== */

import React from 'react';
import { Edit3, Plus, Search, RotateCcw } from 'lucide-react';
import { useGestionClientes } from '../hooks/useGestionClientes';
import TablaGenerica from './TablaGenerica';
import { FormularioEdicion, CONFIG_CLIENTE } from '@/componentes/formulario_edicion';
import type { ColumnaTabla, AccionFila } from '../types';
import type { Cliente } from '@/data/clientes';

const TabClientes: React.FC = () => {
  const {
    clientes,
    filtros,
    clienteEditando,
    modoCrear,
    actualizarFiltro,
    limpiarFiltros,
    iniciarEdicion,
    iniciarCreacion,
    guardarEdicion,
    cancelarEdicion,
  } = useGestionClientes();

  const columnas: ColumnaTabla<Cliente>[] = [
    { key: 'id', titulo: 'ID Cliente', minWidth: '100px' },
    { key: 'nombre', titulo: 'Nombre', minWidth: '200px' },
    { key: 'rif', titulo: 'RIF', minWidth: '150px', render: (v: string) => v || '—' },
    { key: 'telefono', titulo: 'Teléfono', minWidth: '150px', render: (v: string) => v || '—' },
    { key: 'direccion', titulo: 'Dirección', minWidth: '200px', render: (v: string) => v || '—' },
    { key: 'email', titulo: 'Email', minWidth: '180px', render: (v: string) => v || '—' },
  ];

  const acciones: AccionFila<Cliente>[] = [
    {
      etiqueta: 'Editar',
      icono: <Edit3 size={14} />,
      variant: 'primary',
      onClick: iniciarEdicion,
    },
  ];

  return (
    <div className="tab-clientes">
      <div className="tab-header">
        <div className="tab-header-row">
          <div>
            <h2 className="tab-titulo">Información de Clientes</h2>
            <p className="tab-descripcion">
              Consulta y edita los datos de los clientes asociados a los reportes técnicos.
            </p>
          </div>
          <button
            type="button"
            className="tab-btn-agregar"
            onClick={iniciarCreacion}
          >
            <Plus size={16} />
            Agregar Cliente
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="tab-filtros">
        <div className="tab-filtros-grid">
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label" htmlFor="cli-nombre">Nombre</label>
            <div className="tab-filtro-input-wrapper">
              <Search size={14} className="tab-filtro-icono" />
              <input
                id="cli-nombre"
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
            <label className="tab-filtro-label" htmlFor="cli-rif">RIF</label>
            <input
              id="cli-rif"
              name="rif"
              type="text"
              className="tab-filtro-input"
              placeholder="Buscar por RIF..."
              value={filtros.rif}
              onChange={actualizarFiltro}
            />
          </div>
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label" htmlFor="cli-telefono">Teléfono</label>
            <input
              id="cli-telefono"
              name="telefono"
              type="text"
              className="tab-filtro-input"
              placeholder="Buscar por teléfono..."
              value={filtros.telefono}
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
        datos={clientes}
        columnas={columnas}
        acciones={acciones}
        mensajeVacio="No se encontraron clientes con los filtros especificados."
      />

      {/* Modal de edición/creación */}
      {clienteEditando && (
        <FormularioEdicion
          titulo={modoCrear ? 'Nuevo Cliente' : `Editar Cliente ${clienteEditando.nombre}`}
          entidad={clienteEditando}
          configuracion={CONFIG_CLIENTE}
          onGuardar={guardarEdicion}
          onCancelar={cancelarEdicion}
          modo={modoCrear ? 'crear' : 'editar'}
          modal={true}
        />
      )}
    </div>
  );
};

export default TabClientes;