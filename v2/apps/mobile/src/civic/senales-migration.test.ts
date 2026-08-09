import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

const leer = (archivo: string): string =>
  readFileSync(new URL(`../../drizzle/${archivo}`, import.meta.url), 'utf8')
    .replaceAll('--> statement-breakpoint', '');

const sql0000 = leer('0000_chunky_stardust.sql');
const sql0019 = leer('0019_old_raza.sql');

describe('migración 0019 — stars pasa a ser senales', () => {
  it('conserva las capturas existentes al renombrar la tabla', () => {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(sql0000);
      db.exec(`
        INSERT INTO stars (id, tipo, texto, fundadora, nocturna, fugaz, constelacion_id, created_at)
        VALUES ('s1', 'dream', 'una captura real', 0, 1, 0, 'c1', '2026-07-01T00:00:00.000Z');
      `);

      db.exec(sql0019);

      const filas = db.prepare('SELECT id, tipo, texto, created_at FROM senales').all();
      expect(filas).toEqual([
        { id: 's1', tipo: 'dream', texto: 'una captura real', created_at: '2026-07-01T00:00:00.000Z' },
      ]);
    } finally {
      db.close();
    }
  });

  it('borra las columnas de juego pero deja expedition_id y expedition_step_key', () => {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(sql0000);
      db.exec(sql0019);

      const columnas = db.prepare('PRAGMA table_info(senales)').all()
        .map((fila) => (fila as { name: string }).name);

      expect(columnas).not.toContain('fundadora');
      expect(columnas).not.toContain('nocturna');
      expect(columnas).not.toContain('fugaz');
      expect(columnas).not.toContain('constelacion_id');
      expect(columnas).toContain('expedition_id');
      expect(columnas).toContain('expedition_step_key');
    } finally {
      db.close();
    }
  });

  it('borra las seis tablas que eran sólo del juego', () => {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(sql0000);
      db.exec(sql0019);

      const tablas = new Set(
        db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`).all()
          .map((fila) => (fila as { name: string }).name),
      );

      for (const borrada of ['reflections', 'commitments', 'days', 'ember_ledger', 'unlocks', 'redeemed_nonces']) {
        expect(tablas.has(borrada)).toBe(false);
      }
      expect(tablas.has('senales')).toBe(true);
      expect(tablas.has('stars')).toBe(false);
    } finally {
      db.close();
    }
  });

  it('borra las chispas de amistad heredadas pero conserva las señales del territorio', () => {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(sql0000);
      db.exec(`
        INSERT INTO stars (id, tipo, created_at) VALUES ('s1', 'amistad', '2026-07-01T00:00:00.000Z');
        INSERT INTO stars (id, tipo, created_at) VALUES ('s2', 'dream', '2026-07-02T00:00:00.000Z');
      `);

      db.exec(sql0019);

      const filas = db.prepare('SELECT id FROM senales ORDER BY id').all();
      expect(filas).toEqual([{ id: 's2' }]);
    } finally {
      db.close();
    }
  });
});
