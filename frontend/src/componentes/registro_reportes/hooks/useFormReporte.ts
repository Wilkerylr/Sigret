import { useState, useEffect } from 'react';
import { FormReporteData, Repuesto } from '../types';
import { validarFechas, validarHoras, validarNumeroPositivo } from '../utils/validaciones';
import apiClient from '@/api/client';
import { mensajeDeError } from '@/utils/errorMessage';
import type { PlantillaData } from './useOpcionesReporte';

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
  reportadoPor: '',
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
 * Calcula la fecha del último día hábil anterior a hoy.
 * Lunes → viernes anterior | Martes → lunes | Sábado/Domingo → viernes
 */
function obtenerDiaHabilAnterior(): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - 1); // empieza en ayer

  // Retrocede hasta encontrar lunes a viernes (1 a 5)
  while (fecha.getDay() === 0 || fecha.getDay() === 6) {
    fecha.setDate(fecha.getDate() - 1);
  }

  return fecha.toISOString().split('T')[0];
}

/**
 * Obtiene el siguiente número de reporte sugerido:
 * el mayor número existente + 1 (o 1 si no hay reportes).
 */
async function obtenerSiguienteNumeroReporte(): Promise<number> {
  try {
    const { data } = await apiClient.get<any[]>('/reportes');
    const numeros = (data || [])
      .map((r) => r.numero_reporte ?? r.numeroReporte ?? r.numero ?? r.id)
      .filter((n): n is number => n != null)
      .map((n) => parseInt(String(n), 10))
      .filter((n) => !isNaN(n));

    return numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
  } catch {
    return 1;
  }
}

function obtenerValoresPlantilla(
  nombrePlantilla: string,
  plantillasData: PlantillaData[]
): Record<string, string> | null {
  if (!nombrePlantilla || plantillasData.length === 0) return null;

  const plantilla = plantillasData.find(
    (p) => String(p.id) === nombrePlantilla || p.nombre.toLowerCase() === nombrePlantilla.toLowerCase()
  );

  if (!plantilla) return null;

  const valores: Record<string, string> = {};
  if (plantilla.equipo) valores.equipo = plantilla.equipo;
  if (plantilla.descripcionFalla) valores.descripcionFalla = plantilla.descripcionFalla;
  if (plantilla.trabajoRealizado) valores.trabajoRealizado = plantilla.trabajoRealizado;
  if (plantilla.estado?.nombre) valores.declaracion = String(plantilla.estado.id);
  return Object.keys(valores).length > 0 ? valores : null;
}

function obtenerEtiquetaPrefill(
  nombrePlantilla: string,
  plantillasData: PlantillaData[]
): string[] {
  if (!nombrePlantilla || plantillasData.length === 0) return [];
  const plantilla = plantillasData.find(
    (p) => String(p.id) === nombrePlantilla || p.nombre.toLowerCase() === nombrePlantilla.toLowerCase()
  );
  if (plantilla?.etiqueta?.id) {
    return [String(plantilla.etiqueta.id)];
  }
  return [];
}

interface UseFormReporteOptions {
  plantillasData: PlantillaData[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useFormReporte = (options?: UseFormReporteOptions) => {
  const [formData, setFormData] = useState<FormReporteData>(estadoInicial);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const plantillasData = options?.plantillasData || [];

  // ─── Valores predeterminados al cargar el formulario ───
  useEffect(() => {
    let inicializado = false;

    const inicializarValoresPredeterminados = async () => {
      if (inicializado) return;
      inicializado = true;

      const siguienteNumero = await obtenerSiguienteNumeroReporte();
      const fechaDefecto = obtenerDiaHabilAnterior();

      setFormData((prev) => ({
        ...prev,
        numeroReporte: String(siguienteNumero),
        fechaReporte: fechaDefecto,
        fechaAtencion: fechaDefecto,
      }));
    };

    inicializarValoresPredeterminados();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      if (name === 'plantilla') {
        const valoresPlantilla = obtenerValoresPlantilla(value, plantillasData);
        const etiquetasPrefill = obtenerEtiquetaPrefill(value, plantillasData);

        return {
          ...prev,
          plantilla: value,
          ...(valoresPlantilla || {}),
          etiquetas: etiquetasPrefill,
        };
      }

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

  const agregarEtiqueta = (value?: string) => {
    const seleccionada = value ?? formData.etiquetaSeleccionada;
    if (seleccionada) {
      setFormData(prev => ({
        ...prev,
        etiquetas: [...prev.etiquetas, seleccionada],
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

  const handleSubmit = async (): Promise<boolean> => {
    const validacionFechas = validarFechas(formData.fechaReporte, formData.fechaAtencion);
    if (!validacionFechas.valido) {
      setSubmitError(validacionFechas.mensaje || null);
      return false;
    }

    const validacionHoras = validarHoras(formData.horaInicio, formData.horaFinalizacion);
    if (!validacionHoras.valido) {
      setSubmitError(validacionHoras.mensaje || null);
      return false;
    }

    const validacionNumero = validarNumeroPositivo(formData.numeroReporte);
    if (!validacionNumero.valido) {
      setSubmitError(validacionNumero.mensaje || null);
      return false;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        numeroReporte: Number(formData.numeroReporte),
        clienteId: Number(formData.cliente),
        equipo: formData.equipo,
        fechaReporte: formData.fechaReporte,
        fechaAtencion: formData.fechaAtencion,
        horaInicio: formData.horaInicio,
        horaFinalizacion: formData.horaFinalizacion,
        descripcionFalla: formData.descripcionFalla,
        trabajoRealizado: formData.trabajoRealizado,
        etiquetaId: Number(formData.etiquetas[0]),
        tecnicoId: Number(formData.tecnicos[0]),
        estadoId: Number(formData.declaracion),
        posibleCausa: formData.posibleCausa || undefined,
        anotaciones: formData.anotaciones || undefined,
        reportadoPor: formData.reportadoPor || undefined,
        tecnicos: formData.tecnicos.map(Number),
        repuestos: formData.repuestos.map(r => ({
          repuestoId: Number(r.repuesto),
          cantidad: Number(r.cantidad),
        })),
      };

      await apiClient.post('/reportes', payload);
      setFormData(estadoInicial);
      options?.onSuccess?.();
      return true;
    } catch (err: unknown) {
      const msg = mensajeDeError(err, 'Error al guardar el reporte');
      setSubmitError(msg);
      options?.onError?.(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const limpiarFormulario = () => {
    setFormData(estadoInicial);
    setSubmitError(null);
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
    submitting,
    submitError,
  };
};
