import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DBExecutor } from '@/db/client';
import { borrarTodo, exportarTodo } from '@/db/repos';
import {
  civicCustodyExecutionIntents,
  civicCustodyResponseIntents,
  civicNeedAccessGrants,
  civicNeedCustodies,
  pvMisionMiembros,
  pvMisiones,
  pvObras,
  pvPulsos,
} from '@/db/schema';

const mocks = vi.hoisted(() => ({
  executor: null as DBExecutor | null,
}));

vi.mock('@/db/client', () => ({
  db: {
    transaction: (work: (executor: DBExecutor) => unknown) => {
      if (!mocks.executor) throw new Error('test_executor_missing');
      return work(mocks.executor);
    },
  },
}));

const fakeExecutor = (withExecutionIntent = true) => {
  const deleted: unknown[] = [];
  const rows = new Map<unknown, unknown[]>([
    [civicNeedCustodies as unknown, [{ needId: 'need-private' }]],
    [civicNeedAccessGrants as unknown, [{
      id: 'grant-local',
      remoteCoordinationProposalId: 'proposal-private',
      remoteCoordinationState: 'accepted',
      remoteCoordinationTerminalDecision: 'accept',
    }]],
    [civicCustodyResponseIntents as unknown, [{
      responseId: 'response-private',
      responderUserId: 7,
      grantId: 'grant-private',
      disposition: 'support_available',
      quantity: 4,
    }]],
    [civicCustodyExecutionIntents as unknown, withExecutionIntent ? [{
      eventId: 'event-private',
      userId: 7,
      proposalId: 'proposal-private',
      eventType: 'confirm_receipt',
      expectedVersion: 'a'.repeat(64),
    }] : []],
    [pvMisiones as unknown, [{ id: 'mision-privada', titulo: 'Relevar la plaza' }]],
    [pvMisionMiembros as unknown, [{ misionId: 'mision-privada', actorKey: 'actor-local' }]],
    [pvObras as unknown, [{ id: 'obra-privada', evidenciaUri: 'file:///cache/obra.jpg' }]],
    [pvPulsos as unknown, [{ id: 'pulso-privado', targetId: 'obra-privada' }]],
  ]);
  const executor = {
    select: () => ({
      from: (table: unknown) => ({
        all: () => rows.get(table) ?? [],
        orderBy: () => ({ all: () => rows.get(table) ?? [] }),
      }),
    }),
    delete: (table: unknown) => ({
      run: () => { deleted.push(table); },
    }),
  } as unknown as DBExecutor;
  return { executor, deleted };
};

describe('inventario soberano de datos locales', () => {
  beforeEach(() => { mocks.executor = null; });

  it('incluye custodia, grants e intenciones privadas en la exportación completa v11', () => {
    const { executor } = fakeExecutor();
    mocks.executor = executor;
    const exported = exportarTodo();

    expect(exported).toMatchObject({
      version: 11,
      needCustodies: [{ needId: 'need-private' }],
      needAccessGrants: [{
        id: 'grant-local',
        remoteCoordinationProposalId: 'proposal-private',
        remoteCoordinationState: 'accepted',
        remoteCoordinationTerminalDecision: 'accept',
      }],
      custodyResponseIntents: [{
        responseId: 'response-private',
        responderUserId: 7,
        grantId: 'grant-private',
        disposition: 'support_available',
        quantity: 4,
      }],
      custodyExecutionIntents: [{
        eventId: 'event-private',
        userId: 7,
        proposalId: 'proposal-private',
        eventType: 'confirm_receipt',
        expectedVersion: 'a'.repeat(64),
      }],
      pvMisiones: [{ id: 'mision-privada', titulo: 'Relevar la plaza' }],
      pvMisionMiembros: [{ misionId: 'mision-privada', actorKey: 'actor-local' }],
      pvObras: [{ id: 'obra-privada', evidenciaUri: 'file:///cache/obra.jpg' }],
      pvPulsos: [{ id: 'pulso-privado', targetId: 'obra-privada' }],
    });
  });

  it('bloquea el borrado mientras una constancia de ejecución puede recuperarse', () => {
    const { executor, deleted } = fakeExecutor(true);
    mocks.executor = executor;

    expect(() => borrarTodo()).toThrow('custody_execution_intent_pending');
    expect(deleted).toHaveLength(0);
  });

  it('incluye tablas de intenciones, custodia y grants cuando el borrado es seguro', () => {
    const { executor, deleted } = fakeExecutor(false);
    mocks.executor = executor;
    borrarTodo();

    expect(deleted).toContain(civicCustodyExecutionIntents);
    expect(deleted).toContain(civicCustodyResponseIntents);
    expect(deleted).toContain(civicNeedAccessGrants);
    expect(deleted).toContain(civicNeedCustodies);
    expect(deleted.indexOf(civicCustodyExecutionIntents)).toBeLessThan(deleted.indexOf(civicNeedAccessGrants));
    expect(deleted.indexOf(civicCustodyResponseIntents)).toBeLessThan(deleted.indexOf(civicNeedAccessGrants));
    expect(deleted.indexOf(civicNeedAccessGrants)).toBeLessThan(deleted.indexOf(civicNeedCustodies));
  });

  it('borra las tablas pv_* del Protocolo Vivo, miembros y obras antes que la misión', () => {
    const { executor, deleted } = fakeExecutor(false);
    mocks.executor = executor;
    borrarTodo();

    expect(deleted).toContain(pvMisiones);
    expect(deleted).toContain(pvMisionMiembros);
    expect(deleted).toContain(pvObras);
    expect(deleted).toContain(pvPulsos);
    expect(deleted.indexOf(pvMisionMiembros)).toBeLessThan(deleted.indexOf(pvMisiones));
    expect(deleted.indexOf(pvObras)).toBeLessThan(deleted.indexOf(pvMisiones));
    expect(deleted.indexOf(pvPulsos)).toBeLessThan(deleted.indexOf(pvMisiones));
  });
});
