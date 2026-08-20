import React from 'react';
import { SelectConBotones } from '../components';
import { Repuesto } from '../types';
import type { Opcion } from '../constants/opciones';

interface RepuestosEmpleadosProps {
  repuestoSeleccionado: string;
  cantidad: string;
  repuestos: Repuesto[];
  opcionesRepuestos: Opcion[];
  onAgregar: () => void;
  onEliminar: (index: number) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onNumericChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNuevoRepuesto?: (nombre: string) => Promise<{ value: string; label: string }>;
}

const RepuestosEmpleados: React.FC<RepuestosEmpleadosProps> = ({
  repuestoSeleccionado,
  cantidad,
  repuestos,
  opcionesRepuestos,
  onAgregar,
  onEliminar,
  onChange,
  onNumericChange,
  onNuevoRepuesto,
}) => {
  return (
    <SelectConBotones
      label="Repuestos empleados"
      name="repuestoSeleccionado"
      seleccionado={repuestoSeleccionado}
      opciones={opcionesRepuestos}
      onAgregar={onAgregar}
      onEliminar={onEliminar}
      onChange={onChange}
      items={repuestos}
      botonNuevo={true}
      onNuevo={onNuevoRepuesto}
      tipo="conCantidad"
      requerido={false}
      inputCantidad={{
        name: "cantidad",
        value: cantidad,
        onChange: onNumericChange,
      }}
    />
  );
};

export default RepuestosEmpleados;