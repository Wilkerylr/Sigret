import React from 'react';
import { SelectConBotones } from '../components';
import type { Opcion } from '../constants/opciones';

interface EtiquetasTecnicosProps {
  etiquetaSeleccionada: string;
  etiquetas: string[];
  opcionesEtiquetas: Opcion[];
  tecnicoSeleccionado: string;
  tecnicos: string[];
  opcionesTecnicos: Opcion[];
  onAgregarEtiqueta: () => void;
  onEliminarEtiqueta: (index: number) => void;
  onAgregarTecnico: () => void;
  onEliminarTecnico: (index: number) => void;
  onNuevoEtiqueta?: (nombre: string) => Promise<{ value: string; label: string }>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const EtiquetasTecnicos: React.FC<EtiquetasTecnicosProps> = ({
  etiquetaSeleccionada,
  etiquetas,
  opcionesEtiquetas,
  tecnicoSeleccionado,
  tecnicos,
  opcionesTecnicos,
  onAgregarEtiqueta,
  onEliminarEtiqueta,
  onAgregarTecnico,
  onEliminarTecnico,
  onNuevoEtiqueta,
  onChange,
}) => {
  return (
    <>
      <SelectConBotones
        label="Etiquetas"
        name="etiquetaSeleccionada"
        seleccionado={etiquetaSeleccionada}
        opciones={opcionesEtiquetas}
        onAgregar={onAgregarEtiqueta}
        onEliminar={onEliminarEtiqueta}
        onChange={onChange}
        items={etiquetas}
        botonNuevo={true}
        onNuevo={onNuevoEtiqueta}
      />

      <SelectConBotones
        label="Técnicos"
        name="tecnicoSeleccionado"
        seleccionado={tecnicoSeleccionado}
        opciones={opcionesTecnicos}
        onAgregar={onAgregarTecnico}
        onEliminar={onEliminarTecnico}
        onChange={onChange}
        items={tecnicos}
        botonNuevo={false}
      />
    </>
  );
};

export default EtiquetasTecnicos;