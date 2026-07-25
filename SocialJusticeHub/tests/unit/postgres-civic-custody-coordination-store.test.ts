import { drizzle } from 'drizzle-orm/node-postgres';
import { describe, expect, it, vi } from 'vitest';

import * as schema from '../../shared/schema';

vi.mock('../../server/db', () => ({
  db: {},
  civicTransactionDb: {},
}));

import { PostgresCustodyCoordinationStore } from '../../server/civic/postgres-custody-coordination-store';
import { PostgresCustodyGrantStore } from '../../server/civic/postgres-custody-grant-store';

describe('PostgresCustodyCoordinationStore snapshot SQL', () => {
  it('genera una sola sentencia con reloj común y aliases derivados no ambiguos', async () => {
    const statements: string[] = [];
    const client = {
      async query(config: string | { text: string }) {
        statements.push(typeof config === 'string' ? config : config.text);
        return { rows: [] };
      },
    };
    const database = drizzle({ client: client as never, schema });
    const store = new PostgresCustodyCoordinationStore(database as never);

    await expect(store.listCoordinatorRecords(2, 50, null)).resolves.toEqual({
      authorized: false,
      records: [],
      refreshedAt: null,
    });

    expect(statements).toHaveLength(1);
    const [statement] = statements;
    expect(statement).toContain('statement_timestamp()');
    expect(statement).toContain('expires_at" > statement_timestamp()');
    expect(statement).toContain('left join (select');
    for (const alias of [
      'snapshot_proposal_row_id',
      'snapshot_grant_row_id',
      'snapshot_decision_row_id',
      'snapshot_proposal_grant_id',
      'snapshot_grant_id',
    ]) {
      expect(statement).toContain(`as "${alias}"`);
      expect(statement.match(new RegExp(`"${alias}"`, 'g'))?.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('genera keyset por serial, corte milisegundo y expiración contra reloj real', async () => {
    const statements: string[] = [];
    const client = {
      async query(config: string | { text: string }) {
        statements.push(typeof config === 'string' ? config : config.text);
        return { rows: [] };
      },
    };
    const database = drizzle({ client: client as never, schema });
    const store = new PostgresCustodyCoordinationStore(database as never);

    await store.listCoordinatorRecords(2, 51, {
      asOf: '2026-07-14T15:00:00.123Z',
      after: { rowId: 51 },
    });

    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain("date_trunc('milliseconds', statement_timestamp())");
    expect(statements[0]).toContain('LEAST(');
    expect(statements[0]).toContain('"civic_custody_coordination_proposals"."id" <');
    expect(statements[0]).toContain('expires_at" > statement_timestamp()');
  });

  it('grants usa el mismo corte seguro y nunca offset', async () => {
    const statements: string[] = [];
    const client = {
      async query(config: string | { text: string }) {
        statements.push(typeof config === 'string' ? config : config.text);
        return { rows: [] };
      },
    };
    const database = drizzle({ client: client as never, schema });
    const store = new PostgresCustodyGrantStore(database as never);

    await store.listActiveInbox(2, 51, '2026-07-14T15:00:01.000Z', {
      asOf: '2026-07-14T15:00:00.123Z',
      after: { rowId: 51 },
    });

    // La cuenta activa y la página vacía salen de la misma sentencia sentinel;
    // no hay ventana para insertar entre "filas" y "ACL".
    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain("date_trunc('milliseconds', statement_timestamp())");
    expect(statements[0]).toContain('LEAST(');
    expect(statements[0]).toContain('"civic_custody_grants"."id" <');
    expect(statements[0]).toContain('expires_at" > statement_timestamp()');
    expect(statements[0]).not.toContain(' offset ');
  });
});
