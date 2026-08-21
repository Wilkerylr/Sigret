/* ======================================
   components/TabClientes.tsx
   Consulta y edición de datos de clientes asociados a reportes
   ====================================== */

import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, Plus, Search, RotateCcw, AlertTriangle, X, Circle, EyeOff, Eye } from 'lucide-react';
import { useGestionClientes } from '../hooks/useGestionClientes';
import { useAuthContext } from '@/context/AuthContext';
import TablaGenerica from './TablaGenerica';
import ModalConfirmacion from './ModalConfirmacion';
import { FormularioEdicion, CONFIG_CLIENTE } from '@/componentes/formulario_edicion';
import type { ColumnaTabla, AccionFila, Cliente } from '../types';

const TabClientes: React.FC = () => {
  const {
    clientes,
    filtros,
    clienteEditando,
    clienteEliminar,
    modoCrear,
    cargando,
    mostrarInactivos,
    mostrarModalInactivos,
    cargandoLimpieza,
    resultadoLimpieza,
    actualizarFiltro,
    toggleOrden,
    limpiarFiltros,
    toggleMostrarInactivos,
    solicitarLimpiezaInactivos,
    cancelarLimpiezaInactivos,
    ejecutarLimpiezaInactivos,
    iniciarEdicion,
    iniciarCreacion,
    guardarEdicion,
    cancelarEdicion,
    solicitarEliminar,
    confirmarEliminar,
    cancelarEliminar,
    recuperar,
  } = useGestionClientes();

  const { user } = useAuthContext();
  const esAdmin = user?.role === 'admin';

  const [recuperarItem, setRecuperarItem] = useState<Cliente | null>(null);

  const columnas: ColumnaTabla<Cliente>[] = [
    { key: 'id', titulo: 'ID Cliente', minWidth: '100px' },
    { key: 'nombre', titulo: 'Nombre', minWidth: '200px' },
    {
      key: 'activo',
      titulo: 'Estado',
      minWidth: '100px',
      render: (v: boolean) => (
        <span className={`gestion-tag ${v === false ? 'gestion-tag--peligro' : 'gestion-tag--exito'}`}>
          <Circle size={10} style={{ marginRight: 4 }} />
          {v === false ? 'Inactivo' : 'Activo'}
        </span>
      ),
    },
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
      visible: (item: Cliente) => item.activo,
    },
    {
      etiqueta: 'Desactivar',
      icono: <Trash2 size={14} />,
      variant: 'danger',
      onClick: solicitarEliminar,
      visible: (item: Cliente) => item.activo,
    },
    {
      etiqueta: 'Reactivar',
      icono: <RotateCcw size={14} />,
      variant: 'secondary',
      onClick: (item: Cliente) => setRecuperarItem(item),
      visible: (item: Cliente) => !item.activo,
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
        <div className="tab-filtros-grid" style={{ marginTop: '8px' }}>
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label" htmlFor="cli-estado">Estado</label>
            <select
              id="cli-estado"
              name="estado"
              className="tab-filtro-input"
              value={filtros.estado}
              onChange={actualizarFiltro}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
          <div className="tab-filtro-grupo">
            <label className="tab-filtro-label" htmlFor="cli-ordenar">Ordenar por</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <select
                id="cli-ordenar"
                name="ordenarPor"
                className="tab-filtro-input"
                value={filtros.ordenarPor}
                onChange={actualizarFiltro}
                style={{ flex: 1 }}
              >
                <option value="id">ID</option>
                <option value="nombre">Nombre</option>
              </select>
              <button
                type="button"
                className="tab-btn-orden"
                onClick={toggleOrden}
                title={filtros.ordenDireccion === 'asc' ? 'Ascendente' : 'Descendente'}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {filtros.ordenDireccion === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
        <div className="tab-filtros-acciones">
          <button type="button" className="tab-btn-limpiar" onClick={limpiarFiltros}>
            <RotateCcw size={14} />
            Limpiar filtros
          </button>
          <button
            type="button"
            className={`tab-btn-limpiar ${mostrarInactivos ? 'tab-btn-activo' : ''}`}
            onClick={toggleMostrarInactivos}
            title={mostrarInactivos ? 'Ocultar inactivos' : 'Mostrar inactivos'}
          >
            {mostrarInactivos ? <EyeOff size={14} /> : <Eye size={14} />}
            {mostrarInactivos ? 'Ocultar inactivos' : 'Mostrar inactivos'}
          </button>
          {esAdmin && (
            <button
              type="button"
            className="tab-btn-limpiar tab-btn-peligro"
            onClick={solicitarLimpiezaInactivos}
          >
            <Trash2 size={14} />
            Limpiar inactivos
          </button>
          )}
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
          entidad={{ ...clienteEditando, id: String(clienteEditando.id) }}
          configuracion={CONFIG_CLIENTE}
          onGuardar={guardarEdicion}
          onCancelar={cancelarEdicion}
          modo={modoCrear ? 'crear' : 'editar'}
          modal={true}
        />
      )}

      {/* Modal de confirmación para desactivar (escribir nombre) */}
      {clienteEliminar && (
        <ModalEliminarCliente
          nombreCliente={clienteEliminar.nombre}
          onConfirmar={confirmarEliminar}
          onCancelar={cancelarEliminar}
          cargando={cargando}
        />
      )}
      {/* Modal de confirmación para reactivar */}
      {recuperarItem && (
        <ModalConfirmacion
          abierto={!!recuperarItem}
          titulo="Reactivar Cliente"
          mensaje={`¿Estás seguro de reactivar al cliente "${recuperarItem.nombre}"? El cliente volverá a aparecer en las sugerencias de reportes.`}
          textoConfirmar="Reactivar"
          textoCancelar="Cancelar"
          variant="info"
          onConfirmar={async () => {
            const ok = await recuperar(String(recuperarItem.id));
            if (ok) setRecuperarItem(null);
          }}
          onCancelar={() => setRecuperarItem(null)}
          cargando={cargando}
        />
      )}

      {/* Modal de confirmación para limpieza de inactivos */}
      {mostrarModalInactivos && !resultadoLimpieza && (
        <ModalConfirmacion
          abierto={mostrarModalInactivos}
          titulo="Eliminar clientes inactivos sin reportes"
          mensaje="Se eliminarán físicamente todos los clientes inactivos que no tengan reportes asociados. Esta acción no se puede deshacer. ¿Desea continuar?"
          textoConfirmar="Eliminar"
          textoCancelar="Cancelar"
          variant="danger"
          onConfirmar={ejecutarLimpiezaInactivos}
          onCancelar={cancelarLimpiezaInactivos}
          cargando={cargandoLimpieza}
        />
      )}

      {/* Modal de resultado de limpieza */}
      {resultadoLimpieza && (
        <div className="modal-overlay" onClick={cancelarLimpiezaInactivos}>
          <div className="modal-contenido modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-cerrar"
              onClick={cancelarLimpiezaInactivos}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
            <div className="modal-confirmacion-icono" style={{ background: resultadoLimpieza.eliminados > 0 ? '#dcfce7' : '#dbeafe' }}>
              {resultadoLimpieza.eliminados > 0
                ? <Trash2 size={32} color="#16a34a" />
                : <AlertTriangle size={32} color="#3b82f6" />}
            </div>
            <h3 className="modal-confirmacion-titulo">
              {resultadoLimpieza.eliminados > 0 ? 'Limpieza completada' : 'Sin clientes para eliminar'}
            </h3>
            <p className="modal-confirmacion-mensaje">
              {resultadoLimpieza.eliminados > 0
                ? <>Se eliminaron <strong>{resultadoLimpieza.eliminados}</strong> cliente(s) inactivo(s) sin reportes: {resultadoLimpieza.nombres.join(', ')}.</>
                : 'No hay clientes inactivos sin reportes para eliminar.'}
            </p>
            <div className="modal-confirmacion-acciones">
              <button
                type="button"
                className="modal-btn-confirmar"
                style={{ background: '#3b82f6' }}
                onClick={cancelarLimpiezaInactivos}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Modal para confirmar eliminación (escribir nombre) ───────────── */
interface ModalEliminarClienteProps {
  nombreCliente: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  cargando?: boolean;
}

const ModalEliminarCliente: React.FC<ModalEliminarClienteProps> = ({
  nombreCliente,
  onConfirmar,
  onCancelar,
  cargando = false,
}) => {
  const [textoIngresado, setTextoIngresado] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTextoIngresado('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const coincide = textoIngresado.trim() === nombreCliente;

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-contenido modal-eliminar-admin" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-cerrar"
          onClick={onCancelar}
          aria-label="Cerrar"
          disabled={cargando}
        >
          <X size={18} />
        </button>

        <div className="modal-eliminar-admin-icono">
          <AlertTriangle size={32} color="#ef4444" />
        </div>

        <h3 className="modal-eliminar-admin-titulo">Desactivar Cliente</h3>
        <p className="modal-eliminar-admin-mensaje">
          Esta acción desactivará al cliente <strong>{nombreCliente}</strong> y dejará de aparecer en las sugerencias de reportes.
        </p>

        <div className="modal-eliminar-admin-campo">
          <label className="modal-eliminar-admin-label" htmlFor="confirmar-nombre-cliente">
            Escriba <strong>{nombreCliente}</strong> para confirmar:
          </label>
          <input
            ref={inputRef}
            id="confirmar-nombre-cliente"
            type="text"
            className="modal-eliminar-admin-input"
            placeholder={nombreCliente}
            value={textoIngresado}
            onChange={(e) => setTextoIngresado(e.target.value)}
            disabled={cargando}
            autoComplete="off"
          />
        </div>

        <div className="modal-eliminar-admin-acciones">
          <button
            type="button"
            className="modal-btn-cancelar"
            onClick={onCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="modal-btn-confirmar modal-btn-confirmar--danger"
            onClick={onConfirmar}
            disabled={!coincide || cargando}
          >
            {cargando ? 'Procesando...' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabClientes;
