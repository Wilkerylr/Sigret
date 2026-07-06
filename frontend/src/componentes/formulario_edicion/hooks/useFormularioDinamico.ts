/* ======================================
   hooks/useFormularioDinamico.ts
   Hook genérico para manejo de formularios dinámicos
   ====================================== */

import { useState, useCallback, useMemo } from 'react';
import { EntidadEditable, SeccionConfig, UseFormularioDinamicoRetorno } from '../types';

/**
 * Hook genérico para formularios dinámicos configurados por SeccionConfig[]
 *
 * @param entidadInicial - Datos iniciales de la entidad
 * @param configuracion - Configuración de secciones y campos
 * @param onGuardar - Callback que se ejecuta al enviar el formulario
 * @returns Estado y handlers del formulario
 */
export function useFormularioDinamico(
  entidadInicial: EntidadEditable,
  configuracion: SeccionConfig[],
  onGuardar: (datos: EntidadEditable) => Promise<boolean>
): UseFormularioDinamicoRetorno {
  const [datos, setDatos] = useState<EntidadEditable>({ ...entidadInicial });
  const [guardando, setGuardando] = useState(false);
  const [sucio, setSucio] = useState(false);

  /** Extrae todas las configuraciones de campo en un solo array plano */
  const todosLosCampos = useMemo(() => {
    return configuracion.flatMap((seccion) => seccion.campos);
  }, [configuracion]);

  /** Obtiene la configuración de un campo por su nombre */
  const getCampoConfig = useCallback(
    (nombre: string) => todosLosCampos.find((c) => c.nombre === nombre),
    [todosLosCampos]
  );

  /** Valida un campo específico */
  const validarCampo = useCallback(
    (nombre: string, valor: any, datosActuales: EntidadEditable): string | null => {
      const config = getCampoConfig(nombre);
      if (!config) return null;

      // Validación por requerido
      if (config.requerido) {
        if (valor === undefined || valor === null || valor === '') {
          return `${config.etiqueta} es requerido`;
        }
        if (Array.isArray(valor) && valor.length === 0) {
          return `Debe agregar al menos un ${config.etiqueta.toLowerCase()}`;
        }
      }

      // Validación personalizada
      if (config.validacion) {
        return config.validacion(valor, datosActuales);
      }

      return null;
    },
    [getCampoConfig]
  );

  /** Calcula errores de todos los campos */
  const errores = useMemo(() => {
    const erroresCalc: Record<string, string | null> = {};
    for (const config of todosLosCampos) {
      erroresCalc[config.nombre] = validarCampo(config.nombre, datos[config.nombre], datos);
    }
    return erroresCalc;
  }, [datos, todosLosCampos, validarCampo]);

  /** Indica si el formulario es válido (sin errores) */
  const esValido = useMemo(() => {
    return Object.values(errores).every((err) => err === null);
  }, [errores]);

  /** Maneja el cambio de un campo */
  const handleChange = useCallback(
    (nombre: string, valor: any) => {
      setDatos((prev) => {
        const nuevos = { ...prev, [nombre]: valor };
        return nuevos;
      });
      setSucio(true);
    },
    []
  );

  /** Maneja el envío del formulario */
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    // Re-validar todos los campos antes de enviar
    for (const config of todosLosCampos) {
      const error = validarCampo(config.nombre, datos[config.nombre], datos);
      if (error) {
        return false;
      }
    }

    if (!esValido) return false;

    setGuardando(true);
    try {
      const exito = await onGuardar(datos);
      if (exito) {
        setSucio(false);
      }
      return exito;
    } catch {
      return false;
    } finally {
      setGuardando(false);
    }
  }, [datos, todosLosCampos, validarCampo, esValido, onGuardar]);

  /** Limpia el formulario al estado inicial */
  const limpiar = useCallback(() => {
    setDatos({ ...entidadInicial });
    setSucio(false);
  }, [entidadInicial]);

  /** Reinicia el formulario con nuevos datos */
  const reiniciar = useCallback((nuevosDatos: EntidadEditable) => {
    setDatos({ ...nuevosDatos });
    setSucio(false);
  }, []);

  return {
    datos,
    errores,
    sucio,
    guardando,
    esValido,
    handleChange,
    handleSubmit,
    limpiar,
    setDatos,
    reiniciar,
  };
}