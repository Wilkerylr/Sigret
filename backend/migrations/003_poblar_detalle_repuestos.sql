-- ============================================================
-- Migración: poblar detalle_repuestos con datos existentes
-- ============================================================
-- Para reportes que ya tienen un repuesto asignado (FK escalar
-- repuestos_reporte) pero no tienen filas en detalle_repuestos,
-- se inserta una fila con cantidad_repuesto = 1 (valor por defecto,
-- ya que la cantidad histórica no se conocía).
--
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================

INSERT INTO public.detalle_repuestos (
  repuesto_detalle,
  reporte_repuesto,
  cantidad_repuesto
)
SELECT
  r.repuestos_reporte AS repuesto_detalle,
  r.id AS reporte_repuesto,
  1 AS cantidad_repuesto
FROM public.reportes r
WHERE r.repuestos_reporte IS NOT NULL
  AND r.soft_delete_reporte = false
  AND NOT EXISTS (
    SELECT 1
    FROM public.detalle_repuestos d
    WHERE d.reporte_repuesto = r.id
      AND d.repuesto_detalle = r.repuestos_reporte
  );

-- Verificar cuántas filas se insertaron
SELECT COUNT(*) AS filas_insertadas FROM public.detalle_repuestos;

-- Verificar que todos los reportes con repuesto tienen al menos una fila en detalle_repuestos
SELECT
  r.id AS reporte_id,
  r.numero_reporte,
  r.repuestos_reporte,
  d.cantidad_repuesto
FROM public.reportes r
LEFT JOIN public.detalle_repuestos d
  ON d.reporte_repuesto = r.id AND d.repuesto_detalle = r.repuestos_reporte
WHERE r.repuestos_reporte IS NOT NULL
  AND r.soft_delete_reporte = false
ORDER BY r.id;