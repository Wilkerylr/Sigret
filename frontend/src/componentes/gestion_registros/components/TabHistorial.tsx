/* ======================================
   components/TabHistorial.tsx
   Log de auditoría: muestra el historial de cambios de los reportes
   ====================================== */

import React, { useState } from 'react';
import { Search, RotateCcw, Clock, User, FileText, Tag, Undo2 } from 'lucide-react';
import { useHistorialCambios } from '../hooks/useHistorialCambios';
import ModalConfirmacion from './ModalConfirmacion';
import type { EntradaHistorial } from '../types';
import './TabHistorial.css';

const TabHistorial: React.FC = () => {
  const {
    filtros,
    historialPagina,
    historialFiltrado,
    paginaActual,
    totalPaginas,
    itemsPorPagina,
    entradaExpandida,
    actualizarFiltro,
    limpiarFiltros,
    cambiarPagina,
    cambiarItemsPorPagina,
    toggleExpandir,
    getColorAccion,
    getTextoAccion,
    recuperarEntrada,
  } = useHistorialCambios();

  const [entradaRecuperar, setEntradaRecuperar] = useState<EntradaHistorial | null>(null);
  const [recuperando, setRecuperando] = useState(false);

  return (
    <div className="tab-historial">
      {/* Encabezado */}
      <div className="tab-historial-header">
        <h2 className="tab-historial-titulo">
          <Clock size={20} />
          Historial de Cambios
        </h2>
        <p className="tab-historial-descripcion">
          Auditoría de todas las modificaciones realizadas en los reportes técnicos.
          Total de registros: {historialFiltrado.length}
        </p>
      </div>

      {/* Filtros */}
      <div className="tab-historial-filtros">
        <div className="tab-historial-filtros-grid">
          <div className="tab-historial-filtro-grupo">
            <label className="tab-historial-filtro-label" htmlFor="historial-numeroReporte">
              N° Reporte
            </label>
            <div className="tab-historial-filtro-input-wrapper">
              <Search size={14} className="tab-historial-filtro-icono" />
              <input
                id="historial-numeroReporte"
                name="numeroReporte"
                type="text"
                className="tab-historial-filtro-input"
                placeholder="Ej: REP-001"
                value={filtros.numeroReporte}
                onChange={actualizarFiltro}
              />
            </div>
          </div>

          <div className="tab-historial-filtro-grupo">
            <label className="tab-historial-filtro-label" htmlFor="historial-accion">
              Acción
            </label>
            <select
              id="historial-accion"
              name="accion"
              className="tab-historial-filtro-select"
              value={filtros.accion}
              onChange={actualizarFiltro}
            >
              <option value="">Todas las acciones</option>
              <option value="creacion">Creación</option>
              <option value="edicion">Edición</option>
              <option value="eliminacion">Eliminación</option>
            </select>
          </div>

          <div className="tab-historial-filtro-grupo">
            <label className="tab-historial-filtro-label" htmlFor="historial-usuario">
              Usuario
            </label>
            <div className="tab-historial-filtro-input-wrapper">
              <User size={14} className="tab-historial-filtro-icono" />
              <input
                id="historial-usuario"
                name="usuario"
                type="text"
                className="tab-historial-filtro-input"
                placeholder="Nombre de usuario"
                value={filtros.usuario}
                onChange={actualizarFiltro}
              />
            </div>
          </div>

          <div className="tab-historial-filtro-grupo">
            <label className="tab-historial-filtro-label">Rango de fechas</label>
            <div className="tab-historial-filtro-rango">
              <input
                name="fechaDesde"
                type="date"
                className="tab-historial-filtro-input"
                value={filtros.fechaDesde}
                onChange={actualizarFiltro}
                title="Fecha desde"
              />
              <span className="tab-historial-filtro-separador">a</span>
              <input
                name="fechaHasta"
                type="date"
                className="tab-historial-filtro-input"
                value={filtros.fechaHasta}
                onChange={actualizarFiltro}
                title="Fecha hasta"
              />
            </div>
          </div>
        </div>

        <div className="tab-historial-filtros-acciones">
          <button
            type="button"
            className="tab-historial-btn-limpiar"
            onClick={limpiarFiltros}
          >
            <RotateCcw size={14} />
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Lista del historial */}
      <div className="tab-historial-lista">
        {historialPagina.length === 0 ? (
          <div className="tab-historial-vacio">
            <p>No se encontraron registros en el historial con los filtros especificados.</p>
          </div>
        ) : (
          historialPagina.map((entrada) => (
            <div
              key={entrada.id}
              className={`tab-historial-item ${entradaExpandida === String(entrada.id) ? 'expandido' : ''}`}
            >
              {/* Cabecera de la entrada */}
              <div
                className="tab-historial-item-header"
                onClick={() => toggleExpandir(String(entrada.id))}
              >
                <div className="tab-historial-item-indicador">
                  <span
                    className="tab-historial-item-badge"
                    style={{ background: getColorAccion(entrada.accion) }}
                  >
                    {getTextoAccion(entrada.accion)}
                  </span>
                </div>

                <div className="tab-historial-item-info">
                  <span className="tab-historial-item-reporte">
                    <FileText size={14} />
                    {entrada.numeroReporte || 'Sin reporte'}
                  </span>
                  <span className="tab-historial-item-descripcion">
                    {entrada.descripcion}
                  </span>
                </div>

                <div className="tab-historial-item-meta">
                  <span className="tab-historial-item-usuario">
                    <User size={14} />
                    {entrada.usuario}
                  </span>
                  <span className="tab-historial-item-fecha">
                    {entrada.fecha} {entrada.hora}
                  </span>
                </div>

                <button
                  type="button"
                  className={`tab-historial-item-expandir ${entradaExpandida === String(entrada.id) ? 'abierto' : ''}`}
                  aria-label={entradaExpandida === String(entrada.id) ? 'Cerrar detalle' : 'Ver detalle'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>

              {/* Detalle expandido */}
              {entradaExpandida === String(entrada.id) && (
                <div className="tab-historial-item-detalle">
                  <div className="tab-historial-detalle-grid">
                    <div className="tab-historial-detalle-campo">
                      <span className="tab-historial-detalle-label">ID Reporte</span>
                      <span className="tab-historial-detalle-valor">{entrada.reporteId}</span>
                    </div>
                    <div className="tab-historial-detalle-campo">
                      <span className="tab-historial-detalle-label">N° Reporte</span>
                      <span className="tab-historial-detalle-valor">{entrada.numeroReporte}</span>
                    </div>
                    <div className="tab-historial-detalle-campo">
                      <span className="tab-historial-detalle-label">Acción</span>
                      <span
                        className="tab-historial-detalle-valor"
                        style={{ color: getColorAccion(entrada.accion), fontWeight: 600 }}
                      >
                        {getTextoAccion(entrada.accion)}
                      </span>
                    </div>
                    <div className="tab-historial-detalle-campo">
                      <span className="tab-historial-detalle-label">Usuario</span>
                      <span className="tab-historial-detalle-valor">{entrada.usuario}</span>
                    </div>
                    <div className="tab-historial-detalle-campo">
                      <span className="tab-historial-detalle-label">Fecha</span>
                      <span className="tab-historial-detalle-valor">{entrada.fecha}</span>
                    </div>
                    <div className="tab-historial-detalle-campo">
                      <span className="tab-historial-detalle-label">Hora</span>
                      <span className="tab-historial-detalle-valor">{entrada.hora}</span>
                    </div>
                  </div>

                  {entrada.camposModificados && entrada.camposModificados.length > 0 && (
                    <div className="tab-historial-detalle-campos">
                      <span className="tab-historial-detalle-label">Campos modificados</span>
                      <div className="tab-historial-detalle-tags">
                        {entrada.camposModificados.map((campo) => (
                          <span key={campo} className="tab-historial-detalle-tag">
                            <Tag size={12} />
                            {campo}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {entrada.valorAnterior && entrada.valorNuevo && (
                    <div className="tab-historial-detalle-cambio">
                      <div className="tab-historial-detalle-cambio-col">
                        <span className="tab-historial-detalle-label">Valor anterior</span>
                        <div className="tab-historial-detalle-cambio-valor antiguo">
                          {entrada.valorAnterior}
                        </div>
                      </div>
                      <div className="tab-historial-detalle-cambio-col">
                        <span className="tab-historial-detalle-label">Valor nuevo</span>
                        <div className="tab-historial-detalle-cambio-valor nuevo">
                          {entrada.valorNuevo}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botón de recuperar (solo para eliminaciones con reporteId) */}
                  {entrada.accion === 'eliminacion' && entrada.reporteId && (
                    <div className="tab-historial-detalle-accion">
                      <button
                        type="button"
                        className="tab-historial-btn-recuperar"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEntradaRecuperar(entrada);
                        }}
                      >
                        <Undo2 size={14} />
                        Recuperar este registro
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="tab-historial-paginacion">
          <div className="tab-historial-paginacion-info">
            <span>
              Página {paginaActual} de {totalPaginas} ({historialFiltrado.length} registros)
            </span>
            <div className="tab-historial-paginacion-selector">
              <label htmlFor="historial-items-por-pagina">Por página:</label>
              <select
                id="historial-items-por-pagina"
                className="tab-historial-paginacion-select"
                value={itemsPorPagina}
                onChange={(e) => cambiarItemsPorPagina(Number(e.target.value))}
              >
                {[10, 15, 20, 30, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tab-historial-paginacion-controles">
            <button
              type="button"
              className="tab-historial-paginacion-btn"
              disabled={paginaActual <= 1}
              onClick={() => cambiarPagina(paginaActual - 1)}
              aria-label="Página anterior"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPaginas <= 7) return true;
                if (p === 1 || p === totalPaginas) return true;
                if (Math.abs(p - paginaActual) <= 1) return true;
                return false;
              })
              .map((p, idx, arr) => {
                const items: React.ReactNode[] = [];
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  items.push(
                    <span key={`dots-${p}`} className="tab-historial-paginacion-dots">...</span>
                  );
                }
                items.push(
                  <button
                    key={p}
                    type="button"
                    className={`tab-historial-paginacion-numero ${p === paginaActual ? 'activo' : ''}`}
                    onClick={() => cambiarPagina(p)}
                    aria-label={`Página ${p}`}
                  >
                    {p}
                  </button>
                );
                return items;
              })}

            <button
              type="button"
              className="tab-historial-paginacion-btn"
              disabled={paginaActual >= totalPaginas}
              onClick={() => cambiarPagina(paginaActual + 1)}
              aria-label="Página siguiente"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación para recuperar desde historial */}
      <ModalConfirmacion
        abierto={!!entradaRecuperar}
        titulo="Recuperar Registro"
        mensaje={
          entradaRecuperar
            ? `¿Estás seguro de recuperar el registro ${entradaRecuperar.numeroReporte || 'N/A'}? Esta acción revertirá la eliminación.`
            : ''
        }
        textoConfirmar="Recuperar"
        textoCancelar="Cancelar"
        variant="info"
        onConfirmar={async () => {
          if (!entradaRecuperar) return;
          setRecuperando(true);
          const ok = await recuperarEntrada(entradaRecuperar);
          setRecuperando(false);
          if (ok) setEntradaRecuperar(null);
        }}
        onCancelar={() => setEntradaRecuperar(null)}
        cargando={recuperando}
      />
    </div>
  );
};

export default TabHistorial;