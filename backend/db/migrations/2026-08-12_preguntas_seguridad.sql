-- ==========================================
-- MIGRACIÓN: Preguntas de seguridad
-- Fecha: 2026-08-12
--
-- Crea el catálogo de preguntas de seguridad y la tabla de
-- respuestas hasheadas por usuario. Se usa para:
--   1. Primer login: el usuario nuevo registra sus respuestas.
--   2. Recuperación de contraseña: verificar respuestas → token temporal.
--
-- EJECUTAR EN EL SQL EDITOR DE SUPABASE (Dashboard → SQL Editor)
-- ==========================================

-- ── Tabla: preguntas_seguridad (catálogo) ──
CREATE TABLE IF NOT EXISTS preguntas_seguridad (
  id            SERIAL PRIMARY KEY,
  texto_pregunta TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: respuestas_seguridad (por usuario) ──
CREATE TABLE IF NOT EXISTS respuestas_seguridad (
  id                  SERIAL PRIMARY KEY,
  usuario_respuesta   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  pregunta_respuesta  INTEGER NOT NULL REFERENCES preguntas_seguridad(id) ON DELETE CASCADE,
  respuesta_hash      TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Un usuario no puede responder la misma pregunta dos veces
  CONSTRAINT uq_usuario_pregunta UNIQUE (usuario_respuesta, pregunta_respuesta)
);

-- Índice rápido: buscar respuestas de un usuario
CREATE INDEX IF NOT EXISTS idx_respuestas_usuario
  ON respuestas_seguridad (usuario_respuesta);

-- ── Seed: preguntas predeterminadas ──
INSERT INTO preguntas_seguridad (texto_pregunta)
VALUES
  ('¿Cuál es el nombre de tu primera mascota?'),
  ('¿En qué ciudad naciste?'),
  ('¿Cuál es el nombre de soltera de tu madre?'),
  ('¿Cuál fue tu primer vehículo?'),
  ('¿Cuál es tu color favorito?')
ON CONFLICT DO NOTHING;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================
SELECT id, texto_pregunta, is_active FROM preguntas_seguridad ORDER BY id;
