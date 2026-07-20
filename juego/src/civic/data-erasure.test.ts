import { describe, expect, it } from 'vitest';

import {
  cachedEvidenceUrisFromExport,
  countPendingNetworkRevocations,
  isPendingNetworkRevocation,
} from './data-erasure';

describe('deudas de retiro antes del borrado local', () => {
  it('reconoce sólo retiros remotos auditablemente encolados', () => {
    const revoke = {
      entityType: 'need',
      operation: 'update',
      payloadJson: JSON.stringify({ id: 'n1', revokedAt: '2026-07-14T18:00:00.000Z' }),
    };
    expect(isPendingNetworkRevocation(revoke)).toBe(true);
    expect(countPendingNetworkRevocations([
      revoke,
      { ...revoke, entityType: 'consent' },
      { ...revoke, operation: 'create' },
      { ...revoke, payloadJson: '{malformed' },
    ])).toBe(1);
  });

  it('no confunde una actualización corriente con un retiro', () => {
    expect(isPendingNetworkRevocation({
      entityType: 'resource',
      operation: 'update',
      payloadJson: JSON.stringify({ title: 'actualizado' }),
    })).toBe(false);
  });

  it('sólo propone borrar evidencia dentro del cache controlado por la app', () => {
    expect(cachedEvidenceUrisFromExport({
      stars: [
        { photoUri: 'file:///cache/a.jpg' },
        { photoUri: 'file:///documents/no-borrar.jpg' },
      ],
      observations: [{
        evidenceJson: JSON.stringify([
          { kind: 'photo', uri: 'file:///cache/a.jpg' },
          { kind: 'photo', uri: 'https://example.test/remote.jpg' },
          { kind: 'photo', uri: 'file:///cache/b.jpg' },
        ]),
      }],
    }, 'file:///cache')).toEqual(['file:///cache/a.jpg', 'file:///cache/b.jpg']);
  });
});
