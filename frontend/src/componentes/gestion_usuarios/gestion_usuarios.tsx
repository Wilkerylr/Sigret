/* ======================================
   gestion_usuarios.tsx
   Componente principal para la Gestión de Usuarios
   Responsabilidad única: Orquestar subcomponentes y estado global
   ====================================== */

import React, { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { useGestionUsuarios, OPCIONES_ROLES, ETIQUETAS_PERMISOS } from './hooks/useGestionUsuarios';
import { TablaGenerica, ModalConfirmacion } from '@/componentes/gestion_registros';
import { FormularioEdicion, CONFIG_USUARIO_CREAR, CONFIG_USUARIO_EDITAR } from '@/componentes/formulario_edicion';
import FiltrosUsuarios from './components/FiltrosUsuarios';
import LeyendaRoles from './components/LeyendaRoles';
import type { ColumnaTabla, AccionFila } from '@/componentes/gestion_registros/types';
import type { UsuarioData } from '@/data/usuarios';
import './gestion_usuarios.css';

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

  const [usuarioEliminar, setUsuarioEliminar] = useState<UsuarioData | null>(null);

  const columnas: ColumnaTabla<UsuarioData>[] = [
    {
      key: 'username',
      titulo: 'Usuario',
      minWidth: '120px',
    },
    {
      key: 'nombreCompleto',
      titulo: 'Nombre Completo',
      minWidth: '200px',
      render: (v: string) => v || '—',
    },
    {
      key: 'email',
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
      key: 'role',
      titulo: 'Rol',
      minWidth: '140px',
      render: (v: string) => {
        const rol = OPCIONES_ROLES.find(r => r.value === v);
        return (
          <span className={`rol-badge rol-badge--${v}`}>
            {rol?.label || v}
          </span>
        );
      },
    },
    {
      key: 'permissions',
      titulo: 'Permisos',
      minWidth: '250px',
      render: (v: string[]) => {
        if (!v || v.length === 0) return <span className="sin-permisos">Sin permisos</span>;
        return (
          <div className="permisos-tags">
            {v.map(perm => (
              <span key={perm} className="permiso-tag" title={ETIQUETAS_PERMISOS[perm as keyof typeof ETIQUETAS_PERMISOS] || perm}>
                {ETIQUETAS_PERMISOS[perm as keyof typeof ETIQUETAS_PERMISOS] || perm}
              </span>
            ))}
          </div>
        );
      },
    },
  ];

  const acciones: AccionFila<UsuarioData>[] = [
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
      visible: (usuario) => usuario.username !== 'admin',
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
      {/* Header */}
      <div className="gestion-usuarios-header">
        <div className="gestion-usuarios-header-row">
          <div>
            <h2 className="gestion-usuarios-titulo">Gesti&oacute;n de Usuarios</h2>
            <p className="gestion-usuarios-descripcion">
              Administra los usuarios del sistema, sus roles y permisos de acceso.
            </p>
          </div>
          <button
            type="button"
            className="gestion-usuarios-btn-agregar"
            onClick={iniciarCreacion}
          >
            <Plus size={16} />
            Agregar Usuario
          </button>
        </div>
      </div>

      {/* Leyenda de Roles (componente modular) */}
      <LeyendaRoles />
      
      {/* Filtros (componente modular) */}
      <FiltrosUsuarios
        filtros={filtros}
        onActualizarFiltro={actualizarFiltro}
        onLimpiarFiltros={limpiarFiltros}
      />

      {/* Tabla (componente reutilizable) */}
      <TablaGenerica
        datos={usuarios}
        columnas={columnas}
        acciones={acciones}
        mensajeVacio="No se encontraron usuarios con los filtros especificados."
      />

      {/* Modal de edición/creación */}
      {usuarioEditando && (
        <FormularioEdicion
          titulo={modoCrear ? 'Nuevo Usuario' : `Editar Usuario: ${usuarioEditando.username}`}
          entidad={usuarioEditando}
          configuracion={modoCrear ? CONFIG_USUARIO_CREAR : CONFIG_USUARIO_EDITAR}
          onGuardar={guardarEdicion}
          onCancelar={cancelarEdicion}
          modo={modoCrear ? 'crear' : 'editar'}
          modal={true}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {usuarioEliminar && (
        <ModalConfirmacion
          abierto={true}
          titulo="Eliminar Usuario"
          mensaje={`¿Está seguro de eliminar al usuario "${usuarioEliminar.username}"? Esta acci&oacute;n no se puede deshacer.`}
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