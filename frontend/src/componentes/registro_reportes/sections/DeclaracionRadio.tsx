import React from 'react';
import { GrupoRadio } from '../components';
import { DECLARACIONES } from '../constants/opciones';

interface DeclaracionRadioProps {
  declaracion: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DeclaracionRadio: React.FC<DeclaracionRadioProps> = ({
  declaracion,
  onChange,
}) => {
  return (
    <GrupoRadio
      label="Declaración"
      name="declaracion"
      valor={declaracion}
      onChange={onChange}
      opciones={DECLARACIONES}
    />
  );
};

export default DeclaracionRadio;