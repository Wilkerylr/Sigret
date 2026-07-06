import { useState } from 'react';
import { FormReporteData, Repuesto } from '../types';
import { validarFechas, validarHoras, validarNumeroPositivo } from '../utils/validaciones';
import { PLANTILLAS } from '@/data';

const estadoInicial: FormReporteData = {
  cliente: '',
  equipo: '',
  descripcionFalla: '',
  trabajoRealizado: '',
  repuestos: [],
  repuestoSeleccionado: '',
  cantidad: '',
  posibleCausa: '',
  anotaciones: '',
  declaracion: '',
  etiquetas: [],
  etiquetaSeleccionada: '',
  tecnicos: [],
  tecnicoSeleccionado: '',
  numeroReporte: '',
  plantilla: '',
  fechaReporte: '',
  fechaAtencion: '',
  horaInicio: '',
  horaFinalizacion: '',
};

/**
 * Busca una plantilla por su nombre y retorna los valores por defecto.
 * Si el nombre tiene formato value (ej: "mantenimiento"), busca también por label.
 */
function obtenerValoresPlantilla(nombrePlantilla: string): Record<string, string> | null {
  if (!nombrePlantilla) return null;

  // Buscar por nombre exacto del value (formato: "mantenimiento", "reparacion", etc.)
  const buscarPorLabel = (label: string) =>
    PLANTILLAS.find(
      (p) => p.nombre.toLowerCase() === label.toLowerCase()
    );

  // Intentar búsqueda normalizada: convertir value a nombre (mantenimiento → Mantenimiento)
  const plantilla = PLANTILLAS.find(
    (p) => p.nombre.toLowerCase().replace(/\s+/g, '_') === nombrePlantilla.toLowerCase()
  ) || buscarPorLabel(nombrePlantilla);

  return plantilla?.valoresPorDefecto ?? null;
}

export const useFormReporte = () => {
  const [formData, setFormData] = useState<FormReporteData>(estadoInicial);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      // Si el campo cambiado es "plantilla", auto-llenar campos con valores de la plantilla
      if (name === 'plantilla') {
        const valoresPlantilla = obtenerValoresPlantilla(value);

        // Buscar la plantilla completa para obtener etiquetas predefinidas
        const plantillaEncontrada = value
          ? PLANTILLAS.find(
              (p) =>
                p.nombre.toLowerCase().replace(/\s+/g, '_') === value.toLowerCase() ||
                p.nombre.toLowerCase() === value.toLowerCase()
            )
          : undefined;

        const etiquetasPredefinidas = plantillaEncontrada?.etiquetasPredefinidas ?? [];

        return {
          ...prev,
          plantilla: value,
          ...(valoresPlantilla
            ? {
                descripcionFalla: valoresPlantilla.descripcionFalla ?? prev.descripcionFalla,
                trabajoRealizado: valoresPlantilla.trabajoRealizado ?? prev.trabajoRealizado,
                posibleCausa: valoresPlantilla.posibleCausa ?? prev.posibleCausa,
                anotaciones: valoresPlantilla.anotaciones ?? prev.anotaciones,
                // Auto-llenar la declaración (estado del equipo)
                declaracion: valoresPlantilla.declaracion ?? prev.declaracion,
              }
            : {}),
          // Auto-llenar las etiquetas predefinidas de la plantilla
          etiquetas: etiquetasPredefinidas,
        };
      }

      // Para cualquier otro campo, comportamiento normal
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (value === '' || (parseInt(value) >= 0 && !isNaN(parseInt(value)))) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const agregarRepuesto = () => {
    if (formData.repuestoSeleccionado && formData.cantidad && parseInt(formData.cantidad) > 0) {
      const nuevoRepuesto: Repuesto = {
        repuesto: formData.repuestoSeleccionado,
        cantidad: formData.cantidad
      };
      setFormData(prev => ({
        ...prev,
        repuestos: [...prev.repuestos, nuevoRepuesto],
        repuestoSeleccionado: '',
        cantidad: ''
      }));
    }
  };

  const eliminarRepuesto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      repuestos: prev.repuestos.filter((_, i) => i !== index)
    }));
  };

  const agregarEtiqueta = () => {
    if (formData.etiquetaSeleccionada) {
      setFormData(prev => ({
        ...prev,
        etiquetas: [...prev.etiquetas, formData.etiquetaSeleccionada],
        etiquetaSeleccionada: ''
      }));
    }
  };

  const eliminarEtiqueta = (index: number) => {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas.filter((_, i) => i !== index)
    }));
  };

  const agregarTecnico = () => {
    if (formData.tecnicoSeleccionado) {
      setFormData(prev => ({
        ...prev,
        tecnicos: [...prev.tecnicos, formData.tecnicoSeleccionado],
        tecnicoSeleccionado: ''
      }));
    }
  };

  const eliminarTecnico = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tecnicos: prev.tecnicos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    const validacionFechas = validarFechas(formData.fechaReporte, formData.fechaAtencion);
    if (!validacionFechas.valido) {
      alert(validacionFechas.mensaje);
      return false;
    }

    const validacionHoras = validarHoras(formData.horaInicio, formData.horaFinalizacion);
    if (!validacionHoras.valido) {
      alert(validacionHoras.mensaje);
      return false;
    }

    if (validacionHoras.mensaje) {
      alert(validacionHoras.mensaje);
    }

    const validacionNumero = validarNumeroPositivo(formData.numeroReporte);
    if (!validacionNumero.valido) {
      alert('❌ Error: El número de reporte debe ser positivo');
      return false;
    }

    console.log('Formulario enviado:', formData);
    alert('✅ Reporte guardado correctamente');
    
    return true;
  };

  const limpiarFormulario = () => {
    setFormData(estadoInicial);
  };

  const validarCamposRequeridos = () => {
    return (
      formData.cliente &&
      formData.descripcionFalla &&
      formData.trabajoRealizado &&
      formData.equipo &&
      formData.declaracion &&
      formData.etiquetas.length > 0 &&
      formData.tecnicos.length > 0 &&
      formData.numeroReporte &&
      formData.fechaReporte &&
      formData.fechaAtencion &&
      formData.horaInicio &&
      formData.horaFinalizacion
    );
  };

  return {
    formData,
    setFormData,
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
  };
};