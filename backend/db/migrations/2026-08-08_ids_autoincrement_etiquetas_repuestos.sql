-- ==========================================
-- MIGRACIÓN: IDs autoincrementales para
-- etiquetas_reportes y repuestos
-- Fecha: 2026-08-08
--
-- Complementa 2026-08-05_ids_autoincrement.sql.
-- Estas dos tablas no recibieron secuencia en esa
-- migración, por lo que el POST /api/etiquetas y
-- POST /api/repuestos fallan con:
--   null value in column "id" ... violates not-null constraint
--
-- EJECUTAR EN EL SQL EDITOR DE SUPABASE (Dashboard → SQL Editor)
-- ==========================================

-- ── etiquetas_reportes.id ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'etiquetas_reportes'::regclass AND attname = 'id'
      AND atthasdef IS TRUE
  ) THEN
    CREATE SEQUENCE IF NOT EXISTS etiquetas_reportes_id_seq;
    PERFORM setval(
      'etiquetas_reportes_id_seq',
      COALESCE((SELECT MAX(id) FROM etiquetas_reportes), 1),
      (SELECT MAX(id) FROM etiquetas_reportes) IS NOT NULL
    );
    ALTER TABLE etiquetas_reportes ALTER COLUMN id SET DEFAULT nextval('etiquetas_reportes_id_seq');
  END IF;
END $$;

-- ── repuestos.id ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'repuestos'::regclass AND attname = 'id'
      AND atthasdef IS TRUE
  ) THEN
    CREATE SEQUENCE IF NOT EXISTS repuestos_id_seq;
    PERFORM setval(
      'repuestos_id_seq',
      COALESCE((SELECT MAX(id) FROM repuestos), 1),
      (SELECT MAX(id) FROM repuestos) IS NOT NULL
    );
    ALTER TABLE repuestos ALTER COLUMN id SET DEFAULT nextval('repuestos_id_seq');
  END IF;
END $$;

-- ==========================================
-- VERIFICACIÓN (debe devolver valores en las dos tablas)
-- ==========================================
SELECT 'etiquetas_reportes' AS tabla, MAX(id) AS max_id FROM etiquetas_reportes
UNION ALL
SELECT 'repuestos', MAX(id) FROM repuestos;
