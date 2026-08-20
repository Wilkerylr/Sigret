-- ==========================================
-- MIGRACIÓN: IDs autoincrementales para
-- reportes, servicios_tecnicos y modificaciones_reportes
-- + creación de tabla detalle_repuestos
-- Fecha: 2026-08-08
--
-- Complementa 2026-08-05_ids_autoincrement.sql y
-- 2026-08-08_ids_autoincrement_etiquetas_repuestos.sql.
--
-- Sin estas secuencias, el POST /api/reportes falla con 500:
--   null value in column "id" of relation "reportes"
--   violates not-null constraint
--
-- La tabla detalle_repuestos almacena los repuestos adicionales
-- (más allá del primero) de cada reporte. El backend la usa en
-- reportes.js (insert + delete), pero nunca fue creada en la BD.
--
-- EJECUTAR EN EL SQL EDITOR DE SUPABASE (Dashboard → SQL Editor)
-- ==========================================

-- ── reportes.id ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'reportes'::regclass AND attname = 'id'
      AND atthasdef IS TRUE
  ) THEN
    CREATE SEQUENCE IF NOT EXISTS reportes_id_seq;
    PERFORM setval(
      'reportes_id_seq',
      COALESCE((SELECT MAX(id) FROM reportes), 1),
      (SELECT MAX(id) FROM reportes) IS NOT NULL
    );
    ALTER TABLE reportes ALTER COLUMN id SET DEFAULT nextval('reportes_id_seq');
  END IF;
END $$;

-- ── servicios_tecnicos.id ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'servicios_tecnicos'::regclass AND attname = 'id'
      AND atthasdef IS TRUE
  ) THEN
    CREATE SEQUENCE IF NOT EXISTS servicios_tecnicos_id_seq;
    PERFORM setval(
      'servicios_tecnicos_id_seq',
      COALESCE((SELECT MAX(id) FROM servicios_tecnicos), 1),
      (SELECT MAX(id) FROM servicios_tecnicos) IS NOT NULL
    );
    ALTER TABLE servicios_tecnicos ALTER COLUMN id SET DEFAULT nextval('servicios_tecnicos_id_seq');
  END IF;
END $$;

-- ── modificaciones_reportes.id ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'modificaciones_reportes'::regclass AND attname = 'id'
      AND atthasdef IS TRUE
  ) THEN
    CREATE SEQUENCE IF NOT EXISTS modificaciones_reportes_id_seq;
    PERFORM setval(
      'modificaciones_reportes_id_seq',
      COALESCE((SELECT MAX(id) FROM modificaciones_reportes), 1),
      (SELECT MAX(id) FROM modificaciones_reportes) IS NOT NULL
    );
    ALTER TABLE modificaciones_reportes ALTER COLUMN id SET DEFAULT nextval('modificaciones_reportes_id_seq');
  END IF;
END $$;

-- ── Tabla detalle_repuestos (si no existe) ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'detalle_repuestos_id_seq'
  ) THEN
    CREATE SEQUENCE detalle_repuestos_id_seq;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS detalle_repuestos (
  id integer PRIMARY KEY DEFAULT nextval('detalle_repuestos_id_seq'),
  repuesto_detalle integer NOT NULL REFERENCES repuestos(id),
  reporte_repuesto integer NOT NULL REFERENCES reportes(id),
  cantidad_repuesto integer NOT NULL DEFAULT 1
);

-- ==========================================
-- VERIFICACIÓN (debe devolver valores en las tablas)
-- ==========================================
SELECT 'reportes' AS tabla, MAX(id) AS max_id FROM reportes
UNION ALL
SELECT 'servicios_tecnicos', MAX(id) FROM servicios_tecnicos
UNION ALL
SELECT 'modificaciones_reportes', MAX(id) FROM modificaciones_reportes
UNION ALL
SELECT 'detalle_repuestos', MAX(id) FROM detalle_repuestos;
