import React from 'react';
import { SelectConBotones } from '../components';
import { REPUESTOS } from '../constants/opciones';
import { Repuesto } from '../types';

interface RepuestosEmpleadosProps {
  repuestoSeleccionado: string;
  cantidad: string;
  repuestos: Repuesto[];
  onAgregar: () => void;
  onEliminar: (index: number) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onNumericChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RepuestosEmpleados: React.FC<RepuestosEmpleadosProps> = ({
  repuestoSeleccionado,
  cantidad,
  repuestos,
  onAgregar,
  onEliminar,
  onChange,
  onNumericChange,
}) => {
  return (
    <SelectConBotones
      label="Repuestos empleados"
      name="repuestoSeleccionado"
      seleccionado={repuestoSeleccionado}
      opciones={REPUESTOS}
      onAgregar={onAgregar}
      onEliminar={onEliminar}
      onChange={onChange}
      items={repuestos}
      botonNuevo={true}
      tipo="conCantidad"
      inputCantidad={{
        name: "cantidad",
        value: cantidad,
        onChange: onNumericChange,
      }}
    />
  );
};

export default RepuestosEmpleados;