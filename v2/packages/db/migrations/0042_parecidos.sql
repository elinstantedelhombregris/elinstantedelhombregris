-- Aportes parecidos al escribir (spec 2026-10-19-mi-argentina-ideal-la-pila.md §3,
-- entrega 2). El parecido se calcula adentro de Postgres, sin modelo y sin
-- proveedor externo (ADR 0009): trigramas para lo que se escribe casi igual y
-- búsqueda de texto en castellano para lo que comparte palabras. Sólo deseos: los
-- hechos se corroboran, no se suman por parecido.
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "senales_texto_trgm_idx" ON "senales" USING gin ("texto" gin_trgm_ops) WHERE "clase" = 'deseo';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "senales_texto_fts_idx" ON "senales" USING gin (to_tsvector('spanish', "texto")) WHERE "clase" = 'deseo';
