import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DBExecutor } from '@/db/client';
import type { CivicDisclosureReceiptRow } from '@/db/schema';

import { appendDisclosureReceipt, appendDisclosureRevocation } from './disclosure-ledger';

const mocks = vi.hoisted(() => ({
  nextId: 0,
}));

vi.mock('@/db/client', () => ({
  db: {
    select: () => { throw new Error('global_database_was_used'); },
  },
}));

vi.mock('@/db/repos', () => ({
  ahoraISO: () => '2026-07-14T12:00:00.000Z',
  nuevoId: () => `receipt-${++mocks.nextId}`,
}));

const fakeDatabase = () => {
  const gets: (CivicDisclosureReceiptRow | undefined)[] = [];
  const inserted: CivicDisclosureReceiptRow[] = [];
  const database = {
    select: () => ({
      from: () => ({
        where: () => ({ get: () => gets.shift() }),
      }),
    }),
    insert: () => ({
      values: (row: CivicDisclosureReceiptRow) => ({
        run: () => { inserted.push(row); },
      }),
    }),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as DBExecutor;
  return { database, gets, inserted };
};

const authorization = {
  disclosureKey: 'observation:one:publish',
  entityType: 'observation' as const,
  entityId: 'one',
  payload: { title: 'Luminaria apagada', location: { lat: -32.89, lng: -68.85 } },
  audience: 'collective' as const,
  sharedPrecision: '500m' as const,
  attributionMode: 'anonymous' as const,
  purpose: 'Publicar una observación.',
};

describe('append-only disclosure ledger', () => {
  beforeEach(() => {
    mocks.nextId = 0;
  });

  it('uses the supplied transaction and rejects a conflicting reuse of a disclosure key', () => {
    const { database, gets, inserted } = fakeDatabase();
    gets.push(undefined);
    const first = appendDisclosureReceipt(authorization, database);
    expect(inserted).toEqual([first]);

    gets.push(first);
    expect(appendDisclosureReceipt(authorization, database)).toBe(first);

    gets.push(first);
    expect(() => appendDisclosureReceipt({
      ...authorization,
      audience: 'private',
    }, database)).toThrow('disclosure_idempotency_conflict');
  });

  it('appends revocation through the same transaction without mutating its source', () => {
    const { database, gets, inserted } = fakeDatabase();
    gets.push(undefined);
    const source = appendDisclosureReceipt(authorization, database);
    gets.push(source, undefined);

    const revoked = appendDisclosureRevocation({
      receiptId: source.id,
      disclosureKey: `revoke:${source.id}`,
      purpose: 'Retirar la proyección pública.',
    }, database);

    expect(source.kind).toBe('disclosure');
    expect(revoked).toMatchObject({
      kind: 'revocation',
      revokesReceiptId: source.id,
      entityId: source.entityId,
    });
    expect(inserted).toEqual([source, revoked]);
  });
});
