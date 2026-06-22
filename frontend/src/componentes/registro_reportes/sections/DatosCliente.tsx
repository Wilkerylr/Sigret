import React from 'react';
import { CampoFormulario } from '../components';
import ComboboxConBuscador from '@/componentes/ui/combobox-con-buscador';
import { CLIENTES } from '../constants/opciones';

interface DatosClienteProps {
  cliente: string;
  equipo: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onClienteChange?: (value: string) => void;
}

const DatosCliente: React.FC<DatosClienteProps> = ({
  cliente,
  equipo,
  onChange,
  onClienteChange,
}) => {
  const handleClienteChange = (value: string) => {
    if (onClienteChange) {
      onClienteChange(value);
    } else {
      // Fallback: simular un evento change si no se provee onClienteChange
      const event = {
        target: { name: 'cliente', value },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  return (
    <>
      <ComboboxConBuscador
        label="Cliente"
        nombre="cliente"
        valor={cliente}
        onChange={handleClienteChange}
        opciones={CLIENTES.filter((c) => c.value !== '')}
        placeholder="Buscar cliente..."
        requerido={true}
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
