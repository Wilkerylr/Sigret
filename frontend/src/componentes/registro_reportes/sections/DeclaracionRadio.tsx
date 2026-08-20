import React from 'react';
import { GrupoRadio } from '../components';
import type { Opcion } from '../constants/opciones';

interface DeclaracionRadioProps {
  declaracion: string;
  opcionesDeclaraciones: Opcion[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DeclaracionRadio: React.FC<DeclaracionRadioProps> = ({
  declaracion,
  opcionesDeclaraciones,
  onChange,
}) => {
  return (
    <GrupoRadio
      label="Declaración"
      name="declaracion"
      valor={declaracion}
      onChange={onChange}
      opciones={opcionesDeclaraciones}
    />
  );
};

export default DeclaracionRadio;