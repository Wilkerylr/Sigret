import { ValidacionResultado } from '../types/index.js';

export const validarFechas = (fechaReporte: string, fechaAtencion: string): ValidacionResultado => {
  if (fechaAtencion && fechaReporte) {
    const fechaReporteObj = new Date(fechaReporte);
    const fechaAtencionObj = new Date(fechaAtencion);
    
    if (fechaAtencionObj < fechaReporteObj) {
      return {
        valido: false,
        mensaje: '❌ Error: La fecha de atención no puede ser anterior a la fecha del reporte'
      };
    }
  }
  
  return { valido: true };
};

export const validarHoras = (horaInicio: string, horaFinalizacion: string): ValidacionResultado => {
  if (horaFinalizacion && horaInicio) {
    if (horaFinalizacion < horaInicio) {
      return {
        valido: false,
        mensaje: '❌ Error: La hora de finalización no puede ser anterior a la hora de inicio'
      };
    }
    
    // Validar que la duración mínima sea de 15 minutos
    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFinalizacion.split(':').map(Number);
    
    const minutosInicio = horaInicioH * 60 + horaInicioM;
    const minutosFin = horaFinH * 60 + horaFinM;
    
    if (minutosFin - minutosInicio < 15) {
      return {
        valido: true,
        mensaje: '⚠️ Advertencia: La duración mínima del servicio debe ser de 15 minutos'
      };
    }
  }
  
  return { valido: true };
};

export const validarNumeroPositivo = (valor: string): ValidacionResultado => {
  const num = parseFloat(valor);
  if (valor && (isNaN(num) || num < 0)) {
    return {
      valido: false,
      mensaje: '❌ Error: El valor debe ser un número positivo'
    };
  }
  
  return { valido: true };
};

export const validarCampoRequerido = (valor: string | any[], campo: string): ValidacionResultado => {
  if (Array.isArray(valor)) {
    if (valor.length === 0) {
      return {
        valido: false,
        mensaje: `❌ Error: Debe seleccionar al menos una ${campo}`
      };
    }
  } else {
    if (!valor || valor.trim() === '') {
      return {
        valido: false,
        mensaje: `❌ Error: El campo "${campo}" es requerido`
      };
    }
  }
  
  return { valido: true };
};