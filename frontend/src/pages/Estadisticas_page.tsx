import React from "react"
import { GraficoReportes, ChartBarMultiple } from "@/componentes/estadisticas/components"
import { useEstadisticas } from "@/hooks/useEstadisticas"
import "@/componentes/estadisticas/estadisticas.css"

const EstadisticasPage: React.FC = () => {
    const { data, isLoading, error } = useEstadisticas();

    if (isLoading) {
        return (
            <div className="estadisticas-contenedor estadisticas-estado">
                <h1 className="estadisticas-titulo">Estadísticas</h1>
                <p>Cargando estadísticas...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="estadisticas-contenedor estadisticas-estado">
                <h1 className="estadisticas-titulo">Estadísticas</h1>
                <p className="estadisticas-error-texto">
                    Error al cargar estadísticas: {String(error || 'Sin datos disponibles')}
                </p>
            </div>
        );
    }

    return (
        <div className="estadisticas-contenedor">
            <h1 className="estadisticas-titulo">Estadísticas</h1>
            {/* Gráfico grande de área con selector de tiempo - ocupa todo el ancho */}
            <GraficoReportes data={data.porDia} />

            {/* Gráficos secundarios en grid de 2 columnas debajo */}
            <div className="estadisticas-grid">
                <ChartBarMultiple porMes={data.porMes} />
                {/* Aquí se pueden agregar más gráficos en el futuro */}
            </div>
        </div>
    )
}

export default EstadisticasPage
