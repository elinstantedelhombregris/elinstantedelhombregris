import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

const leer = (archivo: string): string =>
  readFileSync(new URL(`../../drizzle/${archivo}`, import.meta.url), 'utf8')
    .replaceAll('--> statement-breakpoint', '');

const sql0017 = leer('0017_protocolo_vivo.sql');
const sql0018 = leer('0018_mision_expedicion.sql');

describe('migración 0018 misión↔expedición', () => {
  it('agrega expedition_id nullable a pv_misiones sobre el esquema de 0017', () => {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(sql0017);
      db.exec(sql0018);
      db.exec(`
        INSERT INTO pv_misiones (id, titulo, proposito, tipo, oficio_id, estado, gobernanza, creada_por, created_at, expedition_id)
        VALUES ('m1', 'Relevar veredas', 'Mapear roturas', 'relevamiento', 'convivencia', 'propuesta', 'coordinada', 'actor-a', '2026-07-21T00:00:00.000Z', 'e1');
        INSERT INTO pv_misiones (id, titulo, proposito, tipo, oficio_id, estado, gobernanza, creada_por, created_at)
        VALUES ('m2', 'Diseñar cartel', 'Señalética del barrio', 'diseno', 'convivencia', 'propuesta', 'consentimiento', 'actor-b', '2026-07-21T00:05:00.000Z');
      `);
      const filas = db.prepare(
        'SELECT id, expedition_id FROM pv_misiones ORDER BY id',
      ).all() as { id: string; expedition_id: string | null }[];
      expect(filas).toEqual([
        { id: 'm1', expedition_id: 'e1' },
        { id: 'm2', expedition_id: null },
      ]);
    } finally {
      db.close();
    }
  });
});
