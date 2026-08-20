import './form_registro_reportes.css';
import { useState } from 'react';
import { useFormReporte } from './hooks/useFormReporte';
import { useOpcionesReporte } from './hooks/useOpcionesReporte';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { BotonesAccion } from './components';
import {
  DatosCliente,
  DatosServicio,
  RepuestosEmpleados,
  EtiquetasTecnicos,
  DeclaracionRadio,
  DatosControl
} from './sections';

function FormRegistroReportes() {
  const { isLoading, error: loadError, opciones, plantillasData } = useOpcionesReporte();
  const queryClient = useQueryClient();
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const crearEtiqueta = async (nombre: string) => {
    const { data } = await apiClient.post('/etiquetas', { nombre });
    const etiqueta = data.etiqueta;
    await queryClient.invalidateQueries({ queryKey: ['opciones', 'etiquetas'] });
    return { value: String(etiqueta.id), label: etiqueta.nombre };
  };

  const crearRepuesto = async (nombre: string) => {
    const { data } = await apiClient.post('/repuestos', { nombre });
    const repuesto = data.repuesto;
    await queryClient.invalidateQueries({ queryKey: ['opciones', 'repuestos'] });
    return { value: String(repuesto.id), label: repuesto.nombre };
  };

  const {
    formData,
    handleChange,
    handleNumberChange,
    handleNumericInput,
    agregarRepuesto,
    eliminarRepuesto,
    agregarEtiqueta,
    eliminarEtiqueta,
    agregarTecnico,
    eliminarTecnico,
    handleSubmit,
    limpiarFormulario,
    validarCamposRequeridos,
    submitting,
    submitError,
  } = useFormReporte({ plantillasData });

  const handleGuardar = async () => {
    setMensajeExito(null);
    const exito = await handleSubmit();
    if (exito) {
      setMensajeExito('Reporte guardado exitosamente');
      setTimeout(() => setMensajeExito(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="registro-reporte-contenedor" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <p>Cargando datos del formulario...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="registro-reporte-contenedor" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <p style={{ color: 'var(--color-error)' }}>Error al cargar datos: {String(loadError)}</p>
      </div>
    );
  }

  const sinClientes = opciones.clientes.length === 0;
  const sinEstados = opciones.estados.length === 0;
  const mostrarAdvertencia = sinClientes || sinEstados;

  return (
    <div className="registro-reporte-contenedor">
      {mostrarAdvertencia && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {sinClientes && <p>No hay clientes activos disponibles. Debe registrar clientes antes de crear reportes.</p>}
          {sinEstados && <p>No hay estados de equipo configurados.</p>}
        </div>
      )}

      {submitError && (
        <div className="rr-alerta rr-alerta--error" role="alert">
          <span className="rr-alerta-icono" aria-hidden="true">⚠️</span>
          <div className="rr-alerta-contenido">
            <strong>No se pudo guardar el reporte</strong>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      {mensajeExito && (
        <div className="rr-alerta rr-alerta--exito" role="status">
          <span className="rr-alerta-icono" aria-hidden="true">✅</span>
          <div className="rr-alerta-contenido">
            <strong>{mensajeExito}</strong>
          </div>
        </div>
      )}

      <form>
        <div className="registro-reporte-campos">
          <h3 className="seccion-titulo">
            Datos del Cliente
          </h3>
          <DatosCliente
            cliente={formData.cliente}
            equipo={formData.equipo}
            opcionesClientes={opciones.clientes}
            onChange={handleChange}
          />

          <hr className="seccion-divisor" />

          <h3 className="seccion-titulo">
            Datos del Servicio
          </h3>
          <DatosServicio
            descripcionFalla={formData.descripcionFalla}
            trabajoRealizado={formData.trabajoRealizado}
            posibleCausa={formData.posibleCausa}
            anotaciones={formData.anotaciones}
            reportadoPor={formData.reportadoPor}
            onChange={handleChange}
          />

          <hr className="seccion-divisor" />

          <h3 className="seccion-titulo">
            Repuestos Empleados
          </h3>
          <RepuestosEmpleados
            repuestoSeleccionado={formData.repuestoSeleccionado}
            cantidad={formData.cantidad}
            repuestos={formData.repuestos}
            opcionesRepuestos={opciones.repuestos}
            onAgregar={agregarRepuesto}
            onEliminar={eliminarRepuesto}
            onChange={handleChange}
            onNumericChange={handleNumericInput}
            onNuevoRepuesto={crearRepuesto}
          />

          <hr className="seccion-divisor" />

          <h3 className="seccion-titulo">
            Declaración
          </h3>
          <DeclaracionRadio
            declaracion={formData.declaracion}
            opcionesDeclaraciones={opciones.estados}
            onChange={handleChange}
          />

          <hr className="seccion-divisor" />

          <h3 className="seccion-titulo">
            Etiquetas y Técnicos
          </h3>
          <EtiquetasTecnicos
            etiquetaSeleccionada={formData.etiquetaSeleccionada}
            etiquetas={formData.etiquetas}
            opcionesEtiquetas={opciones.etiquetas}
            tecnicoSeleccionado={formData.tecnicoSeleccionado}
            tecnicos={formData.tecnicos}
            opcionesTecnicos={opciones.tecnicos}
            onAgregarEtiqueta={agregarEtiqueta}
            onEliminarEtiqueta={eliminarEtiqueta}
            onAgregarTecnico={agregarTecnico}
            onEliminarTecnico={eliminarTecnico}
            onNuevoEtiqueta={crearEtiqueta}
            onChange={handleChange}
          />
        </div>

        <div className="registro-reporte-control">
          <h3 className="seccion-titulo">
            Datos de Control
          </h3>
          <DatosControl
            numeroReporte={formData.numeroReporte}
            plantilla={formData.plantilla}
            opcionesPlantillas={opciones.plantillas}
            fechaReporte={formData.fechaReporte}
            fechaAtencion={formData.fechaAtencion}
            horaInicio={formData.horaInicio}
            horaFinalizacion={formData.horaFinalizacion}
            onChange={handleChange}
            onNumberChange={handleNumberChange}
          />
        </div>
      </form>

      <BotonesAccion
        onCancelar={limpiarFormulario}
        onGuardar={handleGuardar}
        deshabilitado={!validarCamposRequeridos() || submitting}
      />
    </div>
  );
}

export default FormRegistroReportes;
