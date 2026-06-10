import React from "react";
import BusquedaReportes from "../componentes/busqueda_reportes/Busqueda_reportes";
import "../componentes/Global.css";

const BusquedaReportesPage: React.FC = () => {
    return (
        <div>
            <h1>Busqueda de Reportes</h1>
            <BusquedaReportes />

        </div>
    );
}   
export default BusquedaReportesPage;