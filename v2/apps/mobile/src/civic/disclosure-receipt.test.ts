import { describe, expect, it } from 'vitest';

import {
  buildRevocationReceipt,
  disclosedFieldPaths,
  readableAuthorizedFields,
  type DisclosureReceiptSnapshot,
} from './disclosure-receipt';

describe('disclosure receipts', () => {
  it('records only paths that actually carry disclosed values', () => {
    const paths = disclosedFieldPaths({
      title: 'Luminaria apagada',
      location: { lat: -32.89, lng: -68.85 },
      locationLabel: null,
      evidence: [],
      data: { condition: 'apagada' },
    });

    expect(paths).toEqual([
      'data.condition',
      'evidence',
      'location.lat',
      'location.lng',
      'title',
    ]);
    expect(readableAuthorizedFields(paths)).toEqual([
      'datos categóricos',
      'metadatos de evidencia',
      'ubicación reducida',
      'título',
    ]);
  });

  it('represents revocation as a second immutable receipt', () => {
    const source: DisclosureReceiptSnapshot = {
      id: 'receipt-1',
      disclosureKey: 'observation:one:publish',
      kind: 'disclosure',
      entityType: 'observation',
      entityId: 'one',
      revokesReceiptId: null,
      audience: 'collective',
      authorizedFieldsJson: '["title"]',
      sharedPrecision: '500m',
      attributionMode: 'alias',
      attributionName: 'Vecina del Este',
      purpose: 'Publicar una observación.',
      policyVersion: 1,
      recordedAt: '2026-07-13T12:00:00.000Z',
    };

    const revoked = buildRevocationReceipt(source, {
      id: 'receipt-2',
      disclosureKey: 'revocation:receipt-1:one',
      purpose: 'Retiro mi autorización.',
      recordedAt: '2026-07-14T12:00:00.000Z',
    });

    expect(source.kind).toBe('disclosure');
    expect(source.revokesReceiptId).toBeNull();
    expect(revoked).toMatchObject({
      id: 'receipt-2',
      kind: 'revocation',
      revokesReceiptId: 'receipt-1',
      entityId: 'one',
      authorizedFieldsJson: '["title"]',
      purpose: 'Retiro mi autorización.',
    });
  });
});
