import React from "react"
import { GraficoReportes, ChartBarMultiple } from "@/componentes/estadisticas/components"
import "@/componentes/estadisticas/estadisticas.css"

const EstadisticasPage: React.FC = () => {
    return (
        <div className="estadisticas-contenedor">
            <h1 className="estadisticas-titulo">Estadísticas</h1>
            {/* Gráfico grande de área con selector de tiempo - ocupa todo el ancho */}
                <GraficoReportes />

            {/* Gráficos secundarios en grid de 2 columnas debajo */}
            <div className="estadisticas-grid">
                <ChartBarMultiple />
                {/* Aquí se pueden agregar más gráficos en el futuro */}
            </div>
        </div>
    )
}

export default EstadisticasPage