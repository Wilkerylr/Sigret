import { logError } from '@/lib/logger';
import React, { useCallback, useEffect, useState } from "react";
import BusquedaReportes from "../componentes/busqueda_reportes/Busqueda_reportes";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import queryClient from "@/lib/queryClient";
import type { ReporteApi, ReporteResumen } from "@/types";
import { mapearReporteApi } from "@/utils/reporteMapper";
import { mensajeDeError } from "@/utils/errorMessage";
import type { EntidadEditable, RepuestoEditable } from "@/componentes/formulario_edicion";
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

  const handleGuardar = async (datos: EntidadEditable): Promise<boolean> => {
    try {
      await apiClient.put(ENDPOINTS.REPORTES.BY_ID(String(datos.id)), {
        clienteId: datos.clienteId,
        equipo: datos.equipo,
        fechaReporte: datos.fechaReporte,
        fechaAtencion: datos.fechaAtencion,
        horaInicio: datos.horaInicio,
        horaFinalizacion: datos.horaFinalizacion,
        descripcionFalla: datos.descripcionFalla,
        trabajoRealizado: datos.trabajoRealizado,
        etiquetaId: datos.etiquetaId,
        tecnicoId: datos.tecnicoId,
        estadoId: datos.estadoId,
        repuestoId: datos.repuestoId,
        repuestos: Array.isArray(datos.repuestos)
          ? (datos.repuestos as RepuestoEditable[]).map((r) => ({
              repuestoId: Number(r.id),
              cantidad: Number(r.cantidad),
            }))
          : undefined,
        posibleCausa: datos.posibleCausa,
        anotaciones: datos.anotaciones,
        reportadoPor: datos.reportadoPor,
        motivoModificacion: datos.motivoModificacion,
      });
      await cargarTodos();
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      return true;
    } catch (e: unknown) {
      const msg = mensajeDeError(e, "Error al guardar el reporte");
      logError("[BUSQUEDA] Error al guardar:", msg);
      return false;
    }
  };

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
        onGuardar={handleGuardar}
      />
    </div>
  );
};

export default BusquedaReportesPage;
