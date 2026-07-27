import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

const migrationSql = readFileSync(
  new URL('../../drizzle/0015_civic_custody_response_intents.sql', import.meta.url),
  'utf8',
).replaceAll('--> statement-breakpoint', '');

describe('migración local 0015 de reintentos de respuesta', () => {
  it('crea una única intención pendiente por cuenta+grant y restringe su payload', () => {
    const database = new DatabaseSync(':memory:');
    try {
      database.exec(migrationSql);
      const insert = database.prepare(`
        INSERT INTO civic_custody_response_intents (
          response_id, responder_user_id, grant_id, disposition, quantity,
          request_json, grant_json, created_at, last_attempt_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insert.run(
        '1dc827ec-bd89-4ccd-9353-f8b69193fd41',
        7,
        '2c69a5cc-d9fb-4afb-9b78-f56ca7a11b1e',
        'support_available',
        4,
        '{}',
        '{}',
        '2026-07-14T12:00:00.000Z',
        null,
      );
      expect(() => insert.run(
        '2dc827ec-bd89-4ccd-9353-f8b69193fd41',
        7,
        '2c69a5cc-d9fb-4afb-9b78-f56ca7a11b1e',
        'support_available',
        3,
        '{}',
        '{}',
        '2026-07-14T12:01:00.000Z',
        null,
      )).toThrow();
      expect(() => insert.run(
        '3dc827ec-bd89-4ccd-9353-f8b69193fd41',
        8,
        '3c69a5cc-d9fb-4afb-9b78-f56ca7a11b1e',
        'assessing',
        1,
        '{}',
        '{}',
        '2026-07-14T12:01:00.000Z',
        null,
      )).toThrow();

      const indexes = database.prepare(`
        SELECT name FROM sqlite_master
        WHERE type = 'index' AND tbl_name = 'civic_custody_response_intents'
      `).all().map((row) => (row as { name: string }).name);
      expect(indexes).toContain('civic_custody_response_intents_account_grant_idx');

      const journal = JSON.parse(readFileSync(
        new URL('../../drizzle/meta/_journal.json', import.meta.url),
        'utf8',
      )) as { entries: { idx: number; tag: string }[] };
      expect(journal.entries.find((entry) => entry.idx === 15)).toMatchObject({
        idx: 15,
        tag: '0015_civic_custody_response_intents',
      });
      expect(readFileSync(
        new URL('../../drizzle/migrations.js', import.meta.url),
        'utf8',
      )).toMatch(/m0015[\s\S]*m0015/);
    } finally {
      database.close();
    }
  });
});
