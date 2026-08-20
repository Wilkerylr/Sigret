/* ======================================
   FormularioEdicion.tsx
   Componente reutilizable para edición de entidades
   Configurable mediante SeccionConfig[]
   ====================================== */

import React, { useEffect, useState } from 'react';
import { FormularioEdicionProps } from './types';
import { useFormularioDinamico } from './hooks/useFormularioDinamico';
import CampoGenerico from './components/CampoGenerico';
import './FormularioEdicion.css';

const FormularioEdicion: React.FC<FormularioEdicionProps> = ({
  titulo,
  entidad,
  configuracion,
  onGuardar,
  onCancelar,
  modo = 'editar',
  modal = true,
  className = '',
  textoGuardar,
  textocancelar,
}) => {
  const {
    datos,
    errores,
    sucio,
    guardando,
    esValido,
    handleChange,
    handleSubmit,
    reiniciar,
  } = useFormularioDinamico(entidad, configuracion, onGuardar);

  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // Reiniciar el formulario si cambia la entidad
  useEffect(() => {
    reiniciar(entidad);
  }, [entidad, reiniciar]);

  const alGuardar = async () => {
    setMensajeError(null);
    setExito(false);

    const resultado = await handleSubmit();
    if (resultado) {
      setExito(true);
      setTimeout(() => {
        onCancelar(); // Cerrar después de éxito
      }, 1200);
    } else {
      setMensajeError('No se pudo guardar. Verifique los campos e intente nuevamente.');
    }
  };

  const contenido = (
    <div className={`edicion-contenedor ${className}`}>
      {/* Cabecera */}
      <div className="edicion-cabecera">
        <h2 className="edicion-titulo">
          {modo === 'crear' ? 'Nuevo' : 'Editar'} {titulo}
        </h2>
        {sucio && <span className="edicion-indicador-sucio">• Sin guardar</span>}
      </div>

      {/* Cuerpo del formulario */}
      <div className="edicion-cuerpo">
        {configuracion.map((seccion, idx) => (
          <fieldset key={idx} className={`edicion-seccion ${seccion.className || ''}`}>
            <legend className="edicion-seccion-titulo">{seccion.titulo}</legend>
            <div className="edicion-seccion-campos">
              {seccion.campos.map((campo) => (
                <CampoGenerico
                  key={campo.nombre}
                  config={campo}
                  valor={datos[campo.nombre]}
                  datosCompletos={datos}
                  error={errores[campo.nombre]}
                  onChange={handleChange}
                />
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Mensajes */}
      {mensajeError && (
        <div className="edicion-mensaje edicion-mensaje--error">
          ❌ {mensajeError}
        </div>
      )}
      {exito && (
        <div className="edicion-mensaje edicion-mensaje--exito">
          ✅ Guardado exitosamente
        </div>
      )}

      {/* Botones de acción */}
      <div className="edicion-acciones">
        <button
          type="button"
          className="edicion-btn edicion-btn--cancelar"
          onClick={onCancelar}
          disabled={guardando}
        >
          {textocancelar || 'Cancelar'}
        </button>
        <button
          type="button"
          className="edicion-btn edicion-btn--guardar"
          onClick={alGuardar}
          disabled={!esValido || guardando || exito}
        >
          {guardando ? 'Guardando...' : textoGuardar || (modo === 'crear' ? 'Crear' : 'Guardar cambios')}
        </button>
      </div>
    </div>
  );

  // Si es modal, envolver en overlay
  if (modal) {
    return (
      <div className="edicion-overlay" onClick={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}>
        <div className="edicion-modal">
          {contenido}
        </div>
      </div>
    );
  }

  return contenido;
};

export default FormularioEdicion;