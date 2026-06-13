import React from 'react';
import { SelectConBotones } from '../components';
import { ETIQUETAS, TECNICOS } from '../constants/opciones';

interface EtiquetasTecnicosProps {
  etiquetaSeleccionada: string;
  etiquetas: string[];
  tecnicoSeleccionado: string;
  tecnicos: string[];
  onAgregarEtiqueta: () => void;
  onEliminarEtiqueta: (index: number) => void;
  onAgregarTecnico: () => void;
  onEliminarTecnico: (index: number) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const EtiquetasTecnicos: React.FC<EtiquetasTecnicosProps> = ({
  etiquetaSeleccionada,
  etiquetas,
  tecnicoSeleccionado,
  tecnicos,
  onAgregarEtiqueta,
  onEliminarEtiqueta,
  onAgregarTecnico,
  onEliminarTecnico,
  onChange,
}) => {
  return (
    <>
      <SelectConBotones
        label="Etiquetas"
        name="etiquetaSeleccionada"
        seleccionado={etiquetaSeleccionada}
        opciones={ETIQUETAS}
        onAgregar={onAgregarEtiqueta}
        onEliminar={onEliminarEtiqueta}
        onChange={onChange}
        items={etiquetas}
        botonNuevo={true}
      />
      
      <SelectConBotones
        label="Técnicos"
        name="tecnicoSeleccionado"
        seleccionado={tecnicoSeleccionado}
        opciones={TECNICOS}
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