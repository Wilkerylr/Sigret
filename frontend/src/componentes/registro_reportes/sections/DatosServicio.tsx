import React from 'react';
import { CampoFormulario } from '../components';

interface DatosServicioProps {
  descripcionFalla: string;
  trabajoRealizado: string;
  posibleCausa: string;
  anotaciones: string;
  reportadoPor: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const DatosServicio: React.FC<DatosServicioProps> = ({
  descripcionFalla,
  trabajoRealizado,
  posibleCausa,
  anotaciones,
  reportadoPor,
  onChange,
}) => {
  return (
    <>
      <CampoFormulario
        label="Descripción de la falla"
        name="descripcionFalla"
        value={descripcionFalla}
        onChange={onChange}
        placeholder="Descripción de la falla reportada por el cliente"
        type="textarea"
        required={true}
      />

      <CampoFormulario
        label="Reportado por:"
        name="reportadoPor"
        value={reportadoPor}
        onChange={onChange}
        placeholder="Nombre del personal que reportó la falla"
        type="text"
        required={false}
      />

      <CampoFormulario
        label="Trabajo realizado"
        name="trabajoRealizado"
        value={trabajoRealizado}
        onChange={onChange}
        placeholder="Indica detalladamente el trabajo realizado durante el servicio"
        type="textarea"
        required={true}
      />
      
      <CampoFormulario
        label="Posible causa"
        name="posibleCausa"
        value={posibleCausa}
        onChange={onChange}
        placeholder="Solo debe ser llenado en caso de tener pruebas suficientes para conocer la causa de la falla (muestras de agua, circuitos quemados por alto voltaje, etc)"
        type="textarea"
      />
      
      <CampoFormulario
        label="Anotaciones"
        name="anotaciones"
        value={anotaciones}
        onChange={onChange}
        placeholder="Al comienzo de la sección deberá anotar el voltaje de alimentación del equipo al cual se prestó el servicio, a continuación se puede anotar cualquier observación adicional que consideres relevante para el reporte"
        type="textarea"
      />
    </>
  );
};

export default DatosServicio;