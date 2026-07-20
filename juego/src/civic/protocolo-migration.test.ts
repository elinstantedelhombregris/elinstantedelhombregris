import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  new URL('../../drizzle/0017_protocolo_vivo.sql', import.meta.url),
  'utf8',
).replaceAll('--> statement-breakpoint', '');

describe('migración 0017 protocolo vivo', () => {
  it('crea las 4 tablas pv_* y el índice único de pulsos funciona', () => {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(sql);
      db.exec(`
        INSERT INTO pv_misiones (id, titulo, proposito, tipo, oficio_id, estado, gobernanza, creada_por, created_at)
        VALUES ('m1', 'Luminarias', 'Relevar la cuadra', 'relevamiento', 'convivencia', 'propuesta', 'coordinada', 'actor-a', '2026-07-19T00:00:00.000Z');
        INSERT INTO pv_obras (id, titulo, oficio_id, publicada_at)
        VALUES ('o1', 'Cuadra relevada', 'convivencia', '2026-07-19T01:00:00.000Z');
        INSERT INTO pv_pulsos (id, target_tipo, target_id, actor_key, fecha, created_at)
        VALUES ('p1', 'obra', 'o1', 'actor-b', '2026-07-19', '2026-07-19T02:00:00.000Z');
      `);
      expect(() =>
        db.exec(`INSERT INTO pv_pulsos (id, target_tipo, target_id, actor_key, fecha, created_at)
                 VALUES ('p2', 'obra', 'o1', 'actor-b', '2026-07-20', '2026-07-20T02:00:00.000Z');`),
      ).toThrow(); // el mismo actor no puede pulsar dos veces la misma obra
      const misiones = db.prepare('SELECT estado FROM pv_misiones').all();
      expect(misiones).toEqual([{ estado: 'propuesta' }]);
    } finally {
      db.close();
    }
  });
});
