/* ======================================
   components/VistaAmpliadaReporte.tsx
   Vista ampliada de un reporte con toda la información,
   estructurada igual que el formulario de registro de reportes
   ====================================== */

import React from 'react';
import { File, FileText, Users, Package, ClipboardList } from 'lucide-react';
import { ReporteResumen } from '../types';

interface VistaAmpliadaReporteProps {
  reporte: ReporteResumen;
  onCerrar: () => void;
}

const VistaAmpliadaReporte: React.FC<VistaAmpliadaReporteProps> = ({ reporte, onCerrar }) => {
  return (
    <div className="vista-ampliada-contenedor">
      <div className="vista-ampliada-header">
        <h2 className="vista-ampliada-titulo">Reporte {reporte.numeroReporte}</h2>
        <button type="button" className="vista-ampliada-btn-cerrar" onClick={onCerrar}>
          Cerrar
        </button>
      </div>

      <div className="vista-ampliada-cuerpo">

        {/* Datos del Cliente */}
        <section className="vista-ampliada-seccion">
          <div className="vista-ampliada-seccion-header">
            <File size={18} /><span>Datos del Cliente</span>
          </div>
          <div className="vista-ampliada-grid">
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Cliente</label>
              <span className="vista-ampliada-valor">{reporte.cliente || '—'}</span>
            </div>
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Equipo</label>
              <span className="vista-ampliada-valor">{reporte.equipo || '—'}</span>
            </div>
          </div>
        </section>

        {/* Datos del Servicio */}
        <section className="vista-ampliada-seccion">
          <div className="vista-ampliada-seccion-header">
            <FileText size={18} /><span>Datos del Servicio</span>
          </div>
          <div className="vista-ampliada-grid">
            <div className="vista-ampliada-campo vista-ampliada-campo-ancho">
              <label className="vista-ampliada-label">Descripción de la Falla</label>
              <span className="vista-ampliada-valor">{reporte.descripcionFalla || '—'}</span>
            </div>
            <div className="vista-ampliada-campo vista-ampliada-campo-ancho">
              <label className="vista-ampliada-label">Trabajo Realizado</label>
              <span className="vista-ampliada-valor">{reporte.trabajoRealizado || '—'}</span>
            </div>
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Posible Causa</label>
              <span className="vista-ampliada-valor">{reporte.posibleCausa || '—'}</span>
            </div>
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Reportado Por</label>
              <span className="vista-ampliada-valor">{reporte.reportadoPor || '—'}</span>
            </div>
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Declaración / Estado</label>
              <span className="vista-ampliada-valor">{reporte.declaracion || '—'}</span>
            </div>
            <div className="vista-ampliada-campo vista-ampliada-campo-ancho">
              <label className="vista-ampliada-label">Anotaciones</label>
              <span className="vista-ampliada-valor">{reporte.anotaciones || '—'}</span>
            </div>
          </div>
        </section>

        {/* Repuestos Empleados */}
        <section className="vista-ampliada-seccion">
          <div className="vista-ampliada-seccion-header">
            <Package size={18} /><span>Repuestos Empleados</span>
          </div>
          <div className="vista-ampliada-repuestos">
            {reporte.repuestos && reporte.repuestos.length > 0 ? (
              <ul className="vista-ampliada-lista-repuestos">
                {reporte.repuestos.map((r) => (
                  <li key={r.id || r.nombre} className="vista-ampliada-item-repuesto">
                    <span className="vista-ampliada-repuesto-nombre">{r.nombre}</span>
                    <span className="vista-ampliada-repuesto-cantidad">{r.cantidad > 1 ? r.cantidad + ' x' : ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="vista-ampliada-texto-vacio">Sin repuestos registrados</span>
            )}
          </div>
        </section>

        {/* Etiquetas y Técnicos */}
        <section className="vista-ampliada-seccion">
          <div className="vista-ampliada-seccion-header">
            <Users size={18} /><span>Etiquetas y Técnicos</span>
          </div>
          <div className="vista-ampliada-grid vista-ampliada-grid-dos">
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Etiquetas</label>
              <div className="vista-ampliada-etiquetas">
                {reporte.etiquetas && reporte.etiquetas.length > 0 ? (
                  reporte.etiquetas.map((e) => (
                    <span key={e} className="vista-ampliada-tag">{e}</span>
                  ))
                ) : (
                  <span className="vista-ampliada-texto-vacio">Sin etiquetas</span>
                )}
              </div>
            </div>
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Técnicos Asignados</label>
              <div className="vista-ampliada-tecnicos">
                {reporte.tecnicos && reporte.tecnicos.length > 0 ? (
                  reporte.tecnicos.map((t) => (
                    <span key={t} className="vista-ampliada-tag">{t}</span>
                  ))
                ) : (
                  <span className="vista-ampliada-texto-vacio">Sin técnicos asignados</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Datos de Control */}
        <section className="vista-ampliada-seccion">
          <div className="vista-ampliada-seccion-header">
            <ClipboardList size={18} /><span>Datos de Control</span>
          </div>
          <div className="vista-ampliada-grid">
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">N° Reporte</label>
              <span className="vista-ampliada-valor">{reporte.numeroReporte}</span>
            </div>
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Fecha Reporte</label>
              <span className="vista-ampliada-valor">{reporte.fechaReporte || '—'}</span>
            </div>
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Fecha Atención</label>
              <span className="vista-ampliada-valor">{reporte.fechaAtencion || '—'}</span>
            </div>
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Hora Inicio</label>
              <span className="vista-ampliada-valor">{reporte.horaInicio || '—'}</span>
            </div>
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Hora Finalización</label>
              <span className="vista-ampliada-valor">{reporte.horaFinalizacion || '—'}</span>
            </div>
            <div className="vista-ampliada-campo">
              <label className="vista-ampliada-label">Plantilla</label>
              <span className="vista-ampliada-valor">{reporte.plantilla || '—'}</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default VistaAmpliadaReporte;
