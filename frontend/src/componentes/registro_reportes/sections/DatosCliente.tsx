import React from 'react';
import { CampoFormulario } from '../components';
import { CLIENTES } from '../constants/opciones';

interface DatosClienteProps {
  cliente: string;
  equipo: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const DatosCliente: React.FC<DatosClienteProps> = ({
  cliente,
  equipo,
  onChange,
}) => {
  return (
    <>
      <CampoFormulario
        label="Cliente"
        name="cliente"
        value={cliente}
        onChange={onChange}
        type="select"
        opciones={CLIENTES}
        required={true}
      />
      
      <CampoFormulario
        label="Equipo"
        name="equipo"
        value={equipo}
        onChange={onChange}
        placeholder="Equipo que recibe el servicio"
        required={true}
      />
    </>
  );
};

export default DatosCliente;