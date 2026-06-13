import React from 'react';
import { CampoFormulario } from '../components';
import { PLANTILLAS } from '../constants/opciones';

interface DatosControlProps {
  numeroReporte: string;
  plantilla: string;
  fechaReporte: string;
  fechaAtencion: string;
  horaInicio: string;
  horaFinalizacion: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const DatosControl: React.FC<DatosControlProps> = ({
  numeroReporte,
  plantilla,
  fechaReporte,
  fechaAtencion,
  horaInicio,
  horaFinalizacion,
  onChange,
  onNumberChange,
}) => {
  return (
    <div className="numero-reporte">
      <CampoFormulario
        label="Número del reporte"
        name="numeroReporte"
        value={numeroReporte}
        onChange={onNumberChange}
        placeholder="XXXXXX"
        type="number"
        required={true}
        min="1"
      />
      
      <CampoFormulario
        label="Plantilla"
        name="plantilla"
        value={plantilla}
        onChange={onChange}
        type="select"
        opciones={PLANTILLAS}
        required={true}
      />
      
      <CampoFormulario
        label="Fecha reporte"
        name="fechaReporte"
        value={fechaReporte}
        onChange={onChange}
        type="date"
        required={true}
      />
      
      <CampoFormulario
        label="Fecha atención"
        name="fechaAtencion"
        value={fechaAtencion}
        onChange={onChange}
        type="date"
        required={true}
      />
      
      <CampoFormulario
        label="Hora de inicio"
        name="horaInicio"
        value={horaInicio}
        onChange={onChange}
        type="time"
        required={true}
      />
      
      <CampoFormulario
        label="Hora de finalización"
        name="horaFinalizacion"
        value={horaFinalizacion}
        onChange={onChange}
        type="time"
        required={true}
      />
    </div>
  );
};

export default DatosControl;