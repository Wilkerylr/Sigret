-- ==========================================
-- MIGRACIÓN: IDs autoincrementales
-- Fecha: 2026-08-05
--
-- Elimina la dependencia del cálculo manual de IDs (max+1) que
-- causaba race conditions con inserciones concurrentes.
--
-- EJECUTAR EN EL SQL EDITOR DE SUPABASE (Dashboard → SQL Editor)
-- ==========================================

-- ── clientes.id ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'clientes'::regclass AND attname = 'id'
      AND atthasdef IS TRUE
  ) THEN
    CREATE SEQUENCE IF NOT EXISTS clientes_id_seq;
    PERFORM setval(
      'clientes_id_seq',
      COALESCE((SELECT MAX(id) FROM clientes), 1),
      (SELECT MAX(id) FROM clientes) IS NOT NULL
    );
    ALTER TABLE clientes ALTER COLUMN id SET DEFAULT nextval('clientes_id_seq');
  END IF;
END $$;

-- ── plantillas_reportes.id ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'plantillas_reportes'::regclass AND attname = 'id'
      AND atthasdef IS TRUE
  ) THEN
    CREATE SEQUENCE IF NOT EXISTS plantillas_reportes_id_seq;
    PERFORM setval(
      'plantillas_reportes_id_seq',
      COALESCE((SELECT MAX(id) FROM plantillas_reportes), 1),
      (SELECT MAX(id) FROM plantillas_reportes) IS NOT NULL
    );
    ALTER TABLE plantillas_reportes ALTER COLUMN id SET DEFAULT nextval('plantillas_reportes_id_seq');
  END IF;
END $$;

-- ==========================================
-- CORRECCIÓN ADICIONAL: reporte_modificado nullable
-- En modificaciones_reportes, las auditorías de clientes/usuarios
-- usan reporte_modificado = null. La columna debe permitir NULL.
-- ==========================================
ALTER TABLE modificaciones_reportes ALTER COLUMN reporte_modificado DROP NOT NULL;

-- ==========================================
-- VERIFICACIÓN (debe devolver valores en las dos tablas)
-- ==========================================
SELECT 'clientes' AS tabla, MAX(id) AS max_id FROM clientes
UNION ALL
SELECT 'plantillas_reportes', MAX(id) FROM plantillas_reportes;
