import { ValidacionResultado } from '../types/index.js';

function hoy(): string {
  return new Date().toISOString().split('T')[0];
}

export const validarFechas = (fechaReporte: string, fechaAtencion: string): ValidacionResultado => {
  if (!fechaReporte || !fechaAtencion) {
    return { valido: false, mensaje: '❌ Error: Las fechas son obligatorias' };
  }

  const hoyStr = hoy();

  if (fechaReporte > hoyStr) {
    return {
      valido: false,
      mensaje: '❌ Error: La fecha del reporte no puede ser posterior a hoy',
    };
  }

  if (fechaAtencion > hoyStr) {
    return {
      valido: false,
      mensaje: '❌ Error: La fecha de atención no puede ser posterior a hoy',
    };
  }

  if (fechaAtencion < fechaReporte) {
    return {
      valido: false,
      mensaje: '❌ Error: La fecha de atención no puede ser anterior a la fecha del reporte',
    };
  }

  return { valido: true };
};

export const validarHoras = (horaInicio: string, horaFinalizacion: string): ValidacionResultado => {
  if (!horaInicio || !horaFinalizacion) {
    return { valido: false, mensaje: '❌ Error: Las horas son obligatorias' };
  }

  const validFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!validFormat.test(horaInicio) || !validFormat.test(horaFinalizacion)) {
    return { valido: false, mensaje: '❌ Error: Formato de hora inválido (use HH:MM)' };
  }

  if (horaFinalizacion <= horaInicio) {
    return {
      valido: false,
      mensaje: '❌ Error: La hora de finalización debe ser posterior a la hora de inicio',
    };
  }

  const [hIniH, hIniM] = horaInicio.split(':').map(Number);
  const [hFinH, hFinM] = horaFinalizacion.split(':').map(Number);
  const minutosInicio = hIniH * 60 + hIniM;
  const minutosFin = hFinH * 60 + hFinM;

  if (minutosFin - minutosInicio < 15) {
    return {
      valido: false,
      mensaje: '❌ Error: La duración mínima del servicio debe ser de 15 minutos',
    };
  }

  return { valido: true };
};

export const validarNumeroPositivo = (valor: string): ValidacionResultado => {
  const num = parseInt(valor, 10);
  if (!valor || isNaN(num) || num < 1) {
    return {
      valido: false,
      mensaje: '❌ Error: El número de reporte debe ser un entero positivo',
    };
  }
  return { valido: true };
};

export const validarCampoRequerido = (valor: string | any[], campo: string): ValidacionResultado => {
  if (Array.isArray(valor)) {
    if (valor.length === 0) {
      return {
        valido: false,
        mensaje: `❌ Error: Debe seleccionar al menos una ${campo}`,
      };
    }
  } else {
    if (!valor || valor.trim() === '') {
      return {
        valido: false,
        mensaje: `❌ Error: El campo "${campo}" es requerido`,
      };
    }
  }
  return { valido: true };
};
