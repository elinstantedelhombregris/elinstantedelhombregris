import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DBExecutor } from '@/db/client';
import {
  civicDisclosureReceipts,
  civicMatches,
  civicNeedAccessGrants,
  civicNeedCustodies,
  civicNeeds,
  civicRecordContexts,
  syncOutbox,
} from '@/db/schema';
import type {
  CivicNeedAccessGrantRow,
  CivicNeedCustodyRow,
  CivicNeedRow,
  CivicRecordContextRow,
} from '@/db/schema';

import {
  buildNeedGrantProjection,
  grantCustodiedNeedAccess,
  needGrantStatusAt,
  normalizeNeedGrantRecipient,
  revokeCustodiedNeedAccess,
} from './need-access-grants';

const mocks = vi.hoisted(() => ({ nextId: 0 }));

vi.mock('@/db/client', () => ({
  db: { transaction: () => { throw new Error('global_database_was_used'); } },
}));

vi.mock('@/db/repos', () => ({
  ahoraISO: () => '2026-07-14T12:00:00.000Z',
  nuevoId: () => `grant-${++mocks.nextId}`,
}));

const need: CivicNeedRow = {
  id: 'need-1',
  observationId: null,
  territoryId: null,
  ownedByMe: true,
  category: 'food',
  title: 'Necesidad de Alimentación',
  description: null,
  quantity: 12,
  unit: 'raciones',
  urgency: 4,
  status: 'draft',
  publicLat: -32.89,
  publicLng: -68.85,
  publicPrecision: 'neighborhood',
  locationLabel: 'NO COPIAR: domicilio privado',
  contactConsent: false,
  expiresAt: '2026-07-20T12:00:00.000Z',
  createdAt: '2026-07-14T12:00:00.000Z',
  updatedAt: '2026-07-14T12:00:00.000Z',
};

const custody: CivicNeedCustodyRow = {
  needId: need.id,
  listeningId: 'listening-private',
  custodianKind: 'organization',
  custodianLabel: 'NO COPIAR: Custodio y teléfono 2615555555',
  decisionRecipient: 'civil_organization',
  decisionRecipientLabel: 'NO COPIAR: referente privado',
  contactRoute: 'through_custodian',
  status: 'active',
  createdAt: need.createdAt,
  updatedAt: need.updatedAt,
};

const context: CivicRecordContextRow = {
  id: 'context-1',
  entityType: 'need',
  entityId: need.id,
  locationRole: 'meeting_point',
  locationSource: 'map_pin',
  exactLat: -32.89123,
  exactLng: -68.85123,
  horizontalAccuracyM: null,
  capturedAt: need.createdAt,
  publicLat: need.publicLat,
  publicLng: need.publicLng,
  sharedPrecision: 'neighborhood',
  locationLabel: 'NO COPIAR: Calle Secreta 123',
  audience: 'private',
  attributionMode: 'anonymous',
  attributionName: null,
  sensitivity: 'high',
  locationConsent: false,
  attributionConsent: false,
  confirmedAt: need.createdAt,
  createdAt: need.createdAt,
  updatedAt: need.updatedAt,
};

type TableRows = Map<unknown, unknown[]>;

const fakeDatabase = (overrides: TableRows = new Map()) => {
  const rows: TableRows = new Map();
  rows.set(civicNeeds, [need]);
  rows.set(civicNeedCustodies, [custody]);
  rows.set(civicRecordContexts, [context]);
  rows.set(civicDisclosureReceipts, []);
  rows.set(syncOutbox, []);
  rows.set(civicMatches, []);
  rows.set(civicNeedAccessGrants, []);
  overrides.forEach((value, key) => rows.set(key, value));
  const inserted: { table: unknown; row: unknown }[] = [];
  const updated: { table: unknown; patch: Record<string, unknown> }[] = [];
  const deleted: unknown[] = [];

  const database = {
    select: () => ({
      from: (table: unknown) => ({
        where: () => ({
          get: () => rows.get(table)?.[0],
          all: () => rows.get(table) ?? [],
        }),
        orderBy: () => ({ all: () => rows.get(table) ?? [] }),
      }),
    }),
    insert: (table: unknown) => ({
      values: (row: unknown) => ({
        run: () => {
          inserted.push({ table, row });
          rows.set(table, [...(rows.get(table) ?? []), row]);
        },
      }),
    }),
    update: (table: unknown) => ({
      set: (patch: Record<string, unknown>) => ({
        where: () => ({
          run: () => {
            updated.push({ table, patch });
            const current = rows.get(table) ?? [];
            if (current[0]) rows.set(table, [{ ...(current[0] as object), ...patch }, ...current.slice(1)]);
          },
        }),
      }),
    }),
    delete: (table: unknown) => ({
      where: () => ({ run: () => { deleted.push(table); } }),
      run: () => { deleted.push(table); },
    }),
  } as unknown as DBExecutor;
  return { database, rows, inserted, updated, deleted };
};

const grantInput = {
  needId: need.id,
  recipientKind: 'circle' as const,
  recipientReference: 'circulo-sur',
  recipientLabel: 'Red Barrial Sur',
  purpose: 'assess_support' as const,
  scope: 'essentials_and_safe_area' as const,
  expiresInDays: 30,
  now: '2026-07-14T12:00:00.000Z',
};

describe('permisos destinatarios para necesidades bajo custodia', () => {
  beforeEach(() => { mocks.nextId = 0; });

  it('construye una proyección por lista permitida y descarta texto libre', () => {
    const dirtyNeed = {
      ...need,
      unit: 'Teléfono 2615555555',
      description: 'NO COPIAR relato',
      contactConsent: true,
    };
    const built = buildNeedGrantProjection({
      grantId: 'grant-safe',
      recipient: { kind: 'organization', key: 'organization:org-safe' },
      purpose: 'coordinate_support',
      scope: 'essentials',
      need: dirtyNeed,
    });

    expect(built.projection.need).toEqual({
      category: 'food',
      quantity: 12,
      urgency: 4,
      expiresAt: need.expiresAt,
    });
    expect(built.authorizedFields).toEqual(['category', 'urgency', 'expiresAt', 'quantity']);
    const serialized = JSON.stringify(built);
    expect(serialized).not.toContain('NO COPIAR');
    expect(serialized).not.toContain('2615555555');
    expect(serialized).not.toContain('custod');
    expect(serialized).not.toContain('contact');
  });

  it('nunca acepta un punto exacto dentro del alcance geográfico', () => {
    expect(() => buildNeedGrantProjection({
      grantId: 'grant-exact',
      recipient: { kind: 'circle', key: 'circle:1' },
      purpose: 'assess_support',
      scope: 'essentials_and_safe_area',
      need: { ...need, publicPrecision: 'exact' },
    })).toThrow('need_grant_safe_area_unavailable');
    expect(() => buildNeedGrantProjection({
      grantId: 'grant-too-precise',
      recipient: { kind: 'circle', key: 'circle:1' },
      purpose: 'assess_support',
      scope: 'essentials_and_safe_area',
      need: { ...need, publicPrecision: '100m' },
    })).toThrow('need_grant_safe_area_unavailable');
  });

  it('rechaza nombres de destinatario que parecen contacto', () => {
    expect(() => normalizeNeedGrantRecipient({
      kind: 'organization',
      reference: 'org-1',
      label: 'Referente 2615555555',
    })).toThrow('need_grant_recipient_label_unsafe');
    expect(() => normalizeNeedGrantRecipient({
      kind: 'circle',
      reference: 'círculo con espacios',
      label: 'Círculo Sur',
    })).toThrow('need_grant_recipient_reference_invalid');
  });

  it('registra sólo el grant local, congela el payload y acorta su vigencia', () => {
    const { database, inserted } = fakeDatabase();
    const grant = grantCustodiedNeedAccess({ ...grantInput, database });

    expect(grant).toMatchObject({
      id: 'grant-1',
      needId: need.id,
      recipientKey: 'circle:circulo-sur',
      recipientLabel: 'Red Barrial Sur',
      status: 'active',
      expiresAt: need.expiresAt,
    });
    expect(inserted).toHaveLength(1);
    expect(inserted[0]?.table).toBe(civicNeedAccessGrants);
    expect(inserted.some((entry) => entry.table === syncOutbox)).toBe(false);
    expect(inserted.some((entry) => entry.table === civicDisclosureReceipts)).toBe(false);

    const serialized = grant.projectionJson;
    expect(serialized).toContain('"schema":"basta.need-grant.v1"');
    expect(serialized).toContain('"precision":"neighborhood"');
    expect(serialized).toContain('"unitCode":"meals"');
    expect(serialized).not.toContain(custody.custodianLabel!);
    expect(serialized).not.toContain(context.locationLabel!);
    expect(serialized).not.toContain('exact');
  });

  it('falla cerrado ante divulgación previa o un destinatario ya vigente', () => {
    const disclosedDb = fakeDatabase(new Map([[civicDisclosureReceipts, [{ id: 'receipt' }]]]));
    expect(() => grantCustodiedNeedAccess({ ...grantInput, database: disclosedDb.database }))
      .toThrow('need_grant_collective_state_detected');
    expect(disclosedDb.inserted).toHaveLength(0);

    const activeGrant: CivicNeedAccessGrantRow = {
      id: 'grant-active',
      needId: need.id,
      recipientKind: 'organization',
      recipientKey: 'organization:other',
      recipientLabel: 'Otra organización',
      scope: 'essentials',
      purpose: 'assess_support',
      authorizedFieldsJson: '[]',
      projectionJson: '{}',
      policyVersion: 1,
      status: 'active',
      expiresAt: '2026-07-18T12:00:00.000Z',
      grantedAt: need.createdAt,
      revokedAt: null,
      revocationReason: null,
      deliveryStatus: 'local',
      remoteRecipientCircleId: null,
      remoteGrantorUserId: null,
      deliveredAt: null,
      remoteRevokedAt: null,
      deliveryLastAttemptAt: null,
      deliveryLastError: null,
      remoteResponseDisposition: null,
      remoteResponseQuantity: null,
      remoteResponseUnit: null,
      remoteResponseAt: null,
      remoteCoordinationProposalId: null,
      remoteCoordinationState: null,
      remoteCoordinationTerminalDecision: null,
      remoteCoordinationQuantity: null,
      remoteCoordinationUnit: null,
      remoteCoordinationCreatedAt: null,
      remoteCoordinationExpiresAt: null,
      remoteCoordinationDecidedAt: null,
      remoteCoordinationRefreshedAt: null,
      remoteExecutionJson: null,
      remoteExecutionObservedAt: null,
      createdAt: need.createdAt,
      updatedAt: need.updatedAt,
    };
    const activeDb = fakeDatabase(new Map([[civicNeedAccessGrants, [activeGrant]]]));
    expect(() => grantCustodiedNeedAccess({ ...grantInput, database: activeDb.database }))
      .toThrow('need_grant_active_recipient_exists');
    expect(activeDb.inserted).toHaveLength(0);
  });

  it('revoca sin borrar ni reescribir la proyección autorizada', () => {
    const activeGrant: CivicNeedAccessGrantRow = {
      id: 'grant-active',
      needId: need.id,
      recipientKind: 'circle',
      recipientKey: 'circle:sur',
      recipientLabel: 'Círculo Sur',
      scope: 'essentials',
      purpose: 'coordinate_support',
      authorizedFieldsJson: '["category"]',
      projectionJson: '{"frozen":true}',
      policyVersion: 1,
      status: 'active',
      expiresAt: '2026-07-18T12:00:00.000Z',
      grantedAt: need.createdAt,
      revokedAt: null,
      revocationReason: null,
      deliveryStatus: 'local',
      remoteRecipientCircleId: null,
      remoteGrantorUserId: null,
      deliveredAt: null,
      remoteRevokedAt: null,
      deliveryLastAttemptAt: null,
      deliveryLastError: null,
      remoteResponseDisposition: null,
      remoteResponseQuantity: null,
      remoteResponseUnit: null,
      remoteResponseAt: null,
      remoteCoordinationProposalId: null,
      remoteCoordinationState: null,
      remoteCoordinationTerminalDecision: null,
      remoteCoordinationQuantity: null,
      remoteCoordinationUnit: null,
      remoteCoordinationCreatedAt: null,
      remoteCoordinationExpiresAt: null,
      remoteCoordinationDecidedAt: null,
      remoteCoordinationRefreshedAt: null,
      remoteExecutionJson: null,
      remoteExecutionObservedAt: null,
      createdAt: need.createdAt,
      updatedAt: need.updatedAt,
    };
    const { database, updated, deleted } = fakeDatabase(new Map([[civicNeedAccessGrants, [activeGrant]]]));
    const revoked = revokeCustodiedNeedAccess({
      grantId: activeGrant.id,
      reason: 'safety_concern',
      now: '2026-07-15T12:00:00.000Z',
      database,
    });

    expect(revoked).toMatchObject({
      status: 'revoked',
      revocationReason: 'safety_concern',
      revokedAt: '2026-07-15T12:00:00.000Z',
      projectionJson: activeGrant.projectionJson,
    });
    expect(updated).toHaveLength(1);
    expect(updated[0]?.patch).not.toHaveProperty('projectionJson');
    expect(deleted).toHaveLength(0);
  });

  it('calcula el vencimiento de forma fail-closed ante relojes inválidos', () => {
    expect(needGrantStatusAt({ status: 'active', expiresAt: '2026-07-14T12:00:00.000Z' }, '2026-07-15T12:00:00.000Z')).toBe('expired');
    expect(needGrantStatusAt({ status: 'active', expiresAt: 'fecha rota' }, '2026-07-15T12:00:00.000Z')).toBe('expired');
    expect(needGrantStatusAt({ status: 'revoked', expiresAt: '2099-01-01T00:00:00.000Z' })).toBe('revoked');
  });
});
