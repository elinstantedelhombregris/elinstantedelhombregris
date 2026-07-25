import { drizzle } from 'drizzle-orm/node-postgres';
import { describe, expect, it, vi } from 'vitest';

import * as schema from '../../shared/schema';

vi.mock('../../server/db', () => ({ db: {}, civicTransactionDb: {} }));

import { PostgresCustodyExecutionStore } from '../../server/civic/postgres-custody-execution-store';

describe('PostgresCustodyExecutionStore snapshot SQL', () => {
  it('une ACL, corte y página en una sentencia centinela sin offset ni N+1 vacío', async () => {
    const statements: string[] = [];
    const client = {
      async query(config: string | { text: string }) {
        statements.push(typeof config === 'string' ? config : config.text);
        return { rows: [] };
      },
    };
    const database = drizzle({ client: client as never, schema });
    const store = new PostgresCustodyExecutionStore(database as never);

    await expect(store.listCoordinatorRecords(2, 51, {
      asOf: '2026-07-14T15:00:00.123Z',
      after: { rowId: 51 },
    })).resolves.toEqual({ authorized: false, records: [], refreshedAt: null });

    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain("date_trunc('milliseconds', statement_timestamp())");
    expect(statements[0]).toContain('LEAST(');
    expect(statements[0]).toContain('left join (select');
    expect(statements[0]).toContain('snapshot_execution_proposal');
    expect(statements[0]).toContain('snapshot_execution_root');
    expect(statements[0]).toContain('snapshot_execution_commands');
    expect(statements[0]).toContain('jsonb_agg(jsonb_build_object(');
    expect(statements[0]).toContain('"civic_custody_coordination_proposals"."id" <');
    expect(statements[0]).toContain('"decision" =');
    expect(statements[0]).not.toContain(' offset ');
  });
});
