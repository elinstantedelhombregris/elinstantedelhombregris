import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

const migrationSql = readFileSync(
  new URL('../../drizzle/0014_civic_custody_terminal_decision.sql', import.meta.url),
  'utf8',
).replaceAll('--> statement-breakpoint', '');

describe('migración local 0014 de decisión terminal', () => {
  it('agrega la columna y sólo infiere estados activos inequívocos', () => {
    const database = new DatabaseSync(':memory:');
    try {
      database.exec(`
        CREATE TABLE civic_need_access_grants (
          id text PRIMARY KEY,
          remote_coordination_state text,
          remote_coordination_decided_at text
        );
        INSERT INTO civic_need_access_grants VALUES
          ('accepted', 'accepted', '2026-07-14T12:05:00.000Z'),
          ('declined', 'declined', '2026-07-14T12:05:00.000Z'),
          ('closed-unknown', 'closed', '2026-07-14T12:05:00.000Z'),
          ('expired-unknown', 'expired', '2026-07-14T12:05:00.000Z'),
          ('proposed', 'proposed', NULL);
      `);
      database.exec(migrationSql);

      const rows = database.prepare(`
        SELECT id, remote_coordination_terminal_decision AS terminalDecision
        FROM civic_need_access_grants
        ORDER BY id
      `).all();
      expect(rows).toEqual([
        { id: 'accepted', terminalDecision: 'accept' },
        { id: 'closed-unknown', terminalDecision: null },
        { id: 'declined', terminalDecision: 'decline' },
        { id: 'expired-unknown', terminalDecision: null },
        { id: 'proposed', terminalDecision: null },
      ]);

      const journal = JSON.parse(readFileSync(
        new URL('../../drizzle/meta/_journal.json', import.meta.url),
        'utf8',
      )) as { entries: { idx: number; tag: string }[] };
      expect(journal.entries.find((entry) => entry.idx === 14)).toMatchObject({
        idx: 14,
        tag: '0014_civic_custody_terminal_decision',
      });
      expect(readFileSync(
        new URL('../../drizzle/migrations.js', import.meta.url),
        'utf8',
      )).toMatch(/m0014[\s\S]*m0014/);
    } finally {
      database.close();
    }
  });
});
