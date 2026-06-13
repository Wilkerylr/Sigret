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
          <DatosCliente
            cliente={formData.cliente}
            equipo={formData.equipo}
            onChange={handleChange}
          />
          
          <DatosServicio
            descripcionFalla={formData.descripcionFalla}
            trabajoRealizado={formData.trabajoRealizado}
            posibleCausa={formData.posibleCausa}
            anotaciones={formData.anotaciones}
            onChange={handleChange}
          />
          
          <RepuestosEmpleados
            repuestoSeleccionado={formData.repuestoSeleccionado}
            cantidad={formData.cantidad}
            repuestos={formData.repuestos}
            onAgregar={agregarRepuesto}
            onEliminar={eliminarRepuesto}
            onChange={handleChange}
            onNumericChange={handleNumericInput}
          />
          
          <DeclaracionRadio
            declaracion={formData.declaracion}
            onChange={handleChange}
          />
          
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