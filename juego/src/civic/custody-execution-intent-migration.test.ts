import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

const migrationSql = readFileSync(
  new URL('../../drizzle/0016_civic_custody_execution_intents.sql', import.meta.url),
  'utf8',
).replaceAll('--> statement-breakpoint', '');

const eventId = '1dc827ec-bd89-4ccd-9353-f8b69193fd41';
const proposalId = '2c69a5cc-d9fb-4afb-9b78-f56ca7a11b1e';

describe('migración local 0016 de ejecución custodial', () => {
  it('agrega el cache privado y una sola intención durable por cuenta+propuesta', () => {
    const database = new DatabaseSync(':memory:');
    try {
      database.exec('CREATE TABLE civic_need_access_grants (id text PRIMARY KEY NOT NULL);');
      database.exec(migrationSql);

      const grantColumns = database.prepare('PRAGMA table_info(civic_need_access_grants)').all()
        .map((row) => (row as { name: string }).name);
      expect(grantColumns).toContain('remote_execution_json');
      expect(grantColumns).toContain('remote_execution_observed_at');

      const insert = database.prepare(`
        INSERT INTO civic_custody_execution_intents (
          event_id, user_id, proposal_id, event_type, expected_version,
          request_json, execution_json, snapshot_observed_at, created_at, last_attempt_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insert.run(
        eventId,
        7,
        proposalId,
        'reserve',
        'a'.repeat(64),
        '{}',
        '{}',
        '2026-07-14T12:00:00.000Z',
        '2026-07-14T12:00:01.000Z',
        null,
      );

      expect(() => insert.run(
        '3dc827ec-bd89-4ccd-9353-f8b69193fd41',
        7,
        proposalId,
        'grantor_ready',
        'b'.repeat(64),
        '{}',
        '{}',
        '2026-07-14T12:01:00.000Z',
        '2026-07-14T12:01:01.000Z',
        null,
      )).toThrow();

      expect(() => insert.run(
        'not-a-uuid', 8, proposalId, 'reserve', 'a'.repeat(64), '{}', '{}',
        '2026-07-14T12:00:00.000Z', '2026-07-14T12:00:01.000Z', null,
      )).toThrow();
      expect(() => insert.run(
        '4dc827ec-bd89-4ccd-9353-f8b69193fd41', 8, proposalId, 'free_text',
        'a'.repeat(64), '{}', '{}', '2026-07-14T12:00:00.000Z',
        '2026-07-14T12:00:01.000Z', null,
      )).toThrow();
      expect(() => insert.run(
        '5dc827ec-bd89-4ccd-9353-f8b69193fd41', 8, proposalId, 'reserve',
        'A'.repeat(64), '{}', '{}', '2026-07-14T12:00:00.000Z',
        '2026-07-14T12:00:01.000Z', null,
      )).toThrow();
      expect(() => insert.run(
        '6dc827ec-bd89-4ccd-9353-f8b69193fd41', 8, proposalId, 'reserve',
        'b'.repeat(64), '[]', '{}', '2026-07-14T12:00:00.000Z',
        '2026-07-14T12:00:01.000Z', null,
      )).toThrow();

      const indexes = database.prepare(`
        SELECT name FROM sqlite_master
        WHERE type = 'index' AND tbl_name = 'civic_custody_execution_intents'
      `).all().map((row) => (row as { name: string }).name);
      expect(indexes).toContain('civic_custody_execution_intents_account_proposal_idx');
      expect(indexes).toContain('civic_custody_execution_intents_created_idx');

      const journal = JSON.parse(readFileSync(
        new URL('../../drizzle/meta/_journal.json', import.meta.url),
        'utf8',
      )) as { entries: { idx: number; tag: string }[] };
      expect(journal.entries.at(-1)).toMatchObject({
        idx: 16,
        tag: '0016_civic_custody_execution_intents',
      });
      expect(readFileSync(
        new URL('../../drizzle/migrations.js', import.meta.url),
        'utf8',
      )).toMatch(/m0016[\s\S]*m0016/);
    } finally {
      database.close();
    }
  });
});
