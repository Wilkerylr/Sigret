import React, { useCallback, useEffect, useState } from "react";
import BusquedaReportes from "../componentes/busqueda_reportes/Busqueda_reportes";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { ReporteResumen } from "../componentes/busqueda_reportes/types";
import type { EntidadEditable } from "@/componentes/formulario_edicion";
import "../componentes/Global.css";

function mapearReporte(r: any): ReporteResumen {
  return {
    id: String(r.id),
    numeroReporte: r.numeroReporte || `REP-${String(r.id).padStart(3, "0")}`,
    cliente: r.cliente || "",
    clienteId: r.clienteId,
    equipo: r.equipo || "",
    fechaReporte: r.fechaReporte || "",
    fechaAtencion: r.fechaAtencion || "",
    horaInicio: r.horaInicio || "",
    horaFinalizacion: r.horaFinalizacion || "",
    descripcionFalla: r.descripcionFalla || "",
    trabajoRealizado: r.trabajoRealizado || "",
    etiquetas: r.etiqueta ? [r.etiqueta] : [],
    etiquetaId: r.etiquetaId,
    tecnicos: r.tecnico ? [r.tecnico] : [],
    tecnicoId: r.tecnicoId,
    repuestos: r.repuestos || (r.repuesto ? [{ id: r.repuestoId || 0, nombre: r.repuesto, cantidad: 1 }] : []),
    repuestoId: r.repuestoId,
    declaracion: r.estado || "",
    estadoId: r.estadoId,
    plantilla: "",
    posibleCausa: r.posibleCausa || "",
    anotaciones: r.anotaciones || "",
    reportadoPor: r.reportadoPor || "",
  };
}

const BusquedaReportesPage: React.FC = () => {
  const [reportes, setReportes] = useState<ReporteResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarTodos = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const todos: any[] = [];
      let pagina = 1;
      let totalPaginas = 1;

      do {
        const { data } = await apiClient.get(ENDPOINTS.REPORTES.BASE, {
          params: { pagina, items: 50 },
        });
        todos.push(...(data.reportes || []));
        totalPaginas = data.paginacion?.totalPaginas || 1;
        pagina += 1;
      } while (pagina <= totalPaginas);

      setReportes(todos.map(mapearReporte));
    } catch (e: any) {
      console.error("[BUSQUEDA] Error al cargar reportes:", e);
      setError(e.response?.data?.error || "Error al cargar los reportes");
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
        posibleCausa: datos.posibleCausa,
        anotaciones: datos.anotaciones,
        reportadoPor: datos.reportadoPor,
        motivoModificacion: datos.motivoModificacion,
      });
      await cargarTodos();
      return true;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Error al guardar el reporte";
      console.error("[BUSQUEDA] Error al guardar:", msg);
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
