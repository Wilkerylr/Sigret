import React from "react"
import { GraficoReportes, ChartBarMultiple } from "@/componentes/estadisticas/components"
import { useEstadisticas } from "@/hooks/useEstadisticas"
import "@/componentes/estadisticas/estadisticas.css"

const EstadisticasPage: React.FC = () => {
    const { data, isLoading, error } = useEstadisticas();

    if (isLoading) {
        return (
            <div className="estadisticas-contenedor" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
                <h1 className="estadisticas-titulo">Estadísticas</h1>
                <p>Cargando estadísticas...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="estadisticas-contenedor" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
                <h1 className="estadisticas-titulo">Estadísticas</h1>
                <p style={{ color: 'var(--color-error)' }}>
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
