import { logError } from '@/lib/logger';
import React, { useCallback, useEffect, useState } from "react";
import BusquedaReportes from "../componentes/busqueda_reportes/Busqueda_reportes";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ReporteApi, ReporteResumen } from "@/types";
import { mapearReporteApi } from "@/utils/reporteMapper";
import { mensajeDeError } from "@/utils/errorMessage";
import "../componentes/Global.css";

const BusquedaReportesPage: React.FC = () => {
  const [reportes, setReportes] = useState<ReporteResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarTodos = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const todos: ReporteApi[] = [];
      let pagina = 1;
      let totalPaginas = 1;

      do {
        const { data } = await apiClient.get<{
          reportes: ReporteApi[];
          paginacion?: { totalPaginas?: number };
        }>(ENDPOINTS.REPORTES.BASE, {
          params: { pagina, items: 50 },
        });
        todos.push(...(data.reportes || []));
        totalPaginas = data.paginacion?.totalPaginas || 1;
        pagina += 1;
      } while (pagina <= totalPaginas);

      setReportes(todos.map(mapearReporteApi));
    } catch (e: unknown) {
      logError("[BUSQUEDA] Error al cargar reportes:", e);
      setError(mensajeDeError(e, "Error al cargar los reportes"));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTodos();
  }, [cargarTodos]);

  if (cargando) {
    return (
      <div>
        <p>Cargando reportes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p role="alert">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <BusquedaReportes
        datosIniciales={reportes}
      />
    </div>
  );
};

export default BusquedaReportesPage;
