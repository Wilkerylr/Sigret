import CardGenerica from "@/componentes/card_generica";
import React from "react";

const EstadisticasPage: React.FC = () => {
    return (
        <div>   
            <h1>Estadísticas</h1>
            <p>Aquí se mostrarán las estadísticas de los reportes.</p>
            <CardGenerica title="Ejemplo de Card Genérica" />
        </div>
    );
}   

export default EstadisticasPage;