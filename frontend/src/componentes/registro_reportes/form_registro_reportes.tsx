import React from 'react';
import './form_registro_reportes.css';
import { useFormReporte } from './hooks/useFormReporte';
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
  } = useFormReporte();

  const handleGuardar = () => {
    const exito = handleSubmit();
    if (exito) {
      // Aquí se podría agregar lógica adicional después del envío exitoso
    }
  };

  return (
    <div className="registro-reporte-contenedor">
      <form>
        <div className="registro-reporte-campos">
          {/* ---- Sección: Datos del Cliente ---- */}
          <h3 className="seccion-titulo">
            Datos del Cliente
          </h3>
          <DatosCliente
            cliente={formData.cliente}
            equipo={formData.equipo}
            onChange={handleChange}
          />
          
          <hr className="seccion-divisor" />

          {/* ---- Sección: Datos del Servicio ---- */}
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

          {/* ---- Sección: Repuestos Empleados ---- */}
          <h3 className="seccion-titulo">
            Repuestos Empleados
          </h3>
          <RepuestosEmpleados
            repuestoSeleccionado={formData.repuestoSeleccionado}
            cantidad={formData.cantidad}
            repuestos={formData.repuestos}
            onAgregar={agregarRepuesto}
            onEliminar={eliminarRepuesto}
            onChange={handleChange}
            onNumericChange={handleNumericInput}
          />
          
          <hr className="seccion-divisor" />

          {/* ---- Sección: Declaración ---- */}
          <h3 className="seccion-titulo">
            Declaración
          </h3>
          <DeclaracionRadio
            declaracion={formData.declaracion}
            onChange={handleChange}
          />
          
          <hr className="seccion-divisor" />

          {/* ---- Sección: Etiquetas y Técnicos ---- */}
          <h3 className="seccion-titulo">
            Etiquetas y Técnicos
          </h3>
          <EtiquetasTecnicos
            etiquetaSeleccionada={formData.etiquetaSeleccionada}
            etiquetas={formData.etiquetas}
            tecnicoSeleccionado={formData.tecnicoSeleccionado}
            tecnicos={formData.tecnicos}
            onAgregarEtiqueta={agregarEtiqueta}
            onEliminarEtiqueta={eliminarEtiqueta}
            onAgregarTecnico={agregarTecnico}
            onEliminarTecnico={eliminarTecnico}
            onChange={handleChange}
          />
        </div>
        
        <div className="registro-reporte-control">
          {/* ---- Sección: Datos de Control ---- */}
          <h3 className="seccion-titulo">
            Datos de Control
          </h3>
          <DatosControl
            numeroReporte={formData.numeroReporte}
            plantilla={formData.plantilla}
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
        deshabilitado={!validarCamposRequeridos()}
      />
    </div>
  );
}

export default FormRegistroReportes;