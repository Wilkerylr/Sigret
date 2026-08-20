/* ======================================
   gestion_usuarios.tsx
   Componente principal para la Gestión de Usuarios
   Responsabilidad única: Orquestar subcomponentes y estado global
   ====================================== */

import React, { useState, useMemo } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { useGestionUsuarios } from './hooks/useGestionUsuarios';
import { TablaGenerica, ModalConfirmacion } from '@/componentes/gestion_registros';
import { FormularioEdicion, crearConfigUsuarioCrear, crearConfigUsuarioEditar } from '@/componentes/formulario_edicion';
import FiltrosUsuarios from './components/FiltrosUsuarios';
import LeyendaRoles from './components/LeyendaRoles';
import ModalEliminarAdmin from './components/ModalEliminarAdmin';
import type { ColumnaTabla, AccionFila } from '@/componentes/gestion_registros/types';
import './gestion_usuarios.css';

const ROLES_MAP: Record<string, string> = {
  '1': 'Administrador',
  '2': 'Técnico',
  '3': 'Administrativo',
};

const ROLES_CLASS: Record<string, string> = {
  '1': 'admin',
  '2': 'tecnico',
  '3': 'administrativo',
};

const GestionUsuarios: React.FC = () => {
  const {
    usuarios,
    filtros,
    usuarioEditando,
    modoCrear,
    actualizarFiltro,
    limpiarFiltros,
    iniciarEdicion,
    iniciarCreacion,
    guardarEdicion,
    eliminarUsuario,
    cancelarEdicion,
  } = useGestionUsuarios();

  const [usuarioEliminar, setUsuarioEliminar] = useState<any | null>(null);

  const configCrear = useMemo(() => crearConfigUsuarioCrear(), []);
  const configEditar = useMemo(() => crearConfigUsuarioEditar(), []);

  const columnas: ColumnaTabla<any>[] = [
    {
      key: 'nombre_usuario',
      titulo: 'Nombre',
      minWidth: '120px',
    },
    {
      key: 'apellido_usuario',
      titulo: 'Apellido',
      minWidth: '120px',
    },
    {
      key: 'email_usuario',
      titulo: 'Email',
      minWidth: '200px',
      render: (v: string) => {
        if (!v) return '—';
        const [local, dominio] = v.split('@');
        if (!dominio) return v;
        const inicio = local.slice(0, 2);
        const fin = local.slice(-1);
        const mascara = '*'.repeat(Math.max(local.length - 3, 1));
        return `${inicio}${mascara}${fin}@${dominio}`;
      },
    },
    {
      key: 'rol_usuario',
      titulo: 'Rol',
      minWidth: '140px',
      render: (v: string) => (
        <span className={`rol-badge rol-badge--${ROLES_CLASS[v] || 'tecnico'}`}>
          {ROLES_MAP[v] || 'Desconocido'}
        </span>
      ),
    },
  ];

  const acciones: AccionFila<any>[] = [
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
      onClick: (usuario) => setUsuarioEliminar(usuario),
    },
  ];

  const handleConfirmarEliminar = async () => {
    if (!usuarioEliminar) return;
    const exito = await eliminarUsuario(usuarioEliminar);
    if (exito) {
      setUsuarioEliminar(null);
    }
  };

  return (
    <div className="gestion-usuarios-container">
      <div className="gestion-usuarios-header">
        <div className="gestion-usuarios-header-row">
          <div>
            <h2 className="gestion-usuarios-titulo">Gestión de Usuarios</h2>
            <p className="gestion-usuarios-descripcion">
              Administra los usuarios del sistema, sus roles y permisos de acceso.
            </p>
          </div>
          <button type="button" className="gestion-usuarios-btn-agregar" onClick={iniciarCreacion}>
            <Plus size={16} /> Agregar Usuario
          </button>
        </div>
      </div>

      <LeyendaRoles />
      <FiltrosUsuarios filtros={filtros} onActualizarFiltro={actualizarFiltro} onLimpiarFiltros={limpiarFiltros} />

      <TablaGenerica
        datos={usuarios}
        columnas={columnas}
        acciones={acciones}
        mensajeVacio="No se encontraron usuarios con los filtros especificados."
      />

      {usuarioEditando && (
        <FormularioEdicion
          titulo={modoCrear ? 'Nuevo Usuario' : `Editar Usuario: ${usuarioEditando.nombre_usuario}`}
          entidad={usuarioEditando}
          configuracion={modoCrear ? configCrear : configEditar}
          onGuardar={guardarEdicion}
          onCancelar={cancelarEdicion}
          modo={modoCrear ? 'crear' : 'editar'}
          modal={true}
        />
      )}

      {usuarioEliminar && usuarioEliminar.rol_usuario === '1' && (
        <ModalEliminarAdmin
          abierto={true}
          nombreUsuario={usuarioEliminar.nombre_usuario}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setUsuarioEliminar(null)}
        />
      )}

      {usuarioEliminar && usuarioEliminar.rol_usuario !== '1' && (
        <ModalConfirmacion
          abierto={true}
          titulo="Eliminar Usuario"
          mensaje={`¿Está seguro de eliminar al usuario "${usuarioEliminar.nombre_usuario}"? Esta acción no se puede deshacer.`}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setUsuarioEliminar(null)}
          variant="danger"
          textoConfirmar="Eliminar"
        />
      )}
    </div>
  );
};

export default GestionUsuarios;
