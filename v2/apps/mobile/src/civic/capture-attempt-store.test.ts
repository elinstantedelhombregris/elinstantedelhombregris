import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearStoredCivicCaptureAttempt,
  loadStoredCivicCaptureAttempt,
  saveStoredCivicCaptureAttempt,
  type StoredCivicCaptureAttempt,
} from './capture-attempt-store';

const mocks = vi.hoisted(() => ({
  value: null as string | null,
  getSetting: vi.fn(),
  setSetting: vi.fn(),
}));

vi.mock('@/db/repos', () => ({
  getSetting: mocks.getSetting,
  setSetting: mocks.setSetting,
}));

const attempt: StoredCivicCaptureAttempt = {
  version: 1,
  id: 'attempt-1',
  expeditionId: 'expedition-1',
  expeditionSlug: 'luminarias',
  data: { estado: 'apagada', urgencia: 4 },
  summary: 'Luminaria apagada',
  coords: { lat: -32.89, lng: -68.84 },
  context: {
    point: { lat: -32.89, lng: -68.84 },
    locationSource: 'gps_current',
    horizontalAccuracyM: 18,
    capturedAt: '2026-07-14T10:00:00.000Z',
    sharedPrecision: '100m',
    locationLabel: 'Plaza central',
    audience: 'private',
    attributionMode: 'anonymous',
    attributionName: '',
    sensitivity: 'low',
  },
  publish: false,
  photoUri: null,
  multiplier: 1,
  eventActive: false,
  confirmedAt: '2026-07-14T10:00:00.000Z',
};

describe('snapshot local del intento cívico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.value = null;
    mocks.getSetting.mockImplementation(() => mocks.value);
    mocks.setSetting.mockImplementation((_key: string, value: string) => { mocks.value = value; });
  });

  it('recupera el mismo intento después de salir de la pantalla', () => {
    saveStoredCivicCaptureAttempt(attempt);
    expect(loadStoredCivicCaptureAttempt('expedition-1', 'luminarias')).toEqual(attempt);
  });

  it('no mezcla snapshots de otra expedición o campaña', () => {
    saveStoredCivicCaptureAttempt(attempt);
    expect(loadStoredCivicCaptureAttempt('expedition-2', 'luminarias')).toBeNull();
    expect(loadStoredCivicCaptureAttempt('expedition-1', 'comedores')).toBeNull();
  });

  it('descarta un snapshot corrupto en vez de restaurar campos incompletos', () => {
    mocks.value = JSON.stringify({ ...attempt, context: { point: attempt.coords } });
    expect(loadStoredCivicCaptureAttempt('expedition-1', 'luminarias')).toBeNull();
  });

  it('vacía el snapshot sensible al completar', () => {
    saveStoredCivicCaptureAttempt(attempt);
    clearStoredCivicCaptureAttempt('expedition-1');
    expect(loadStoredCivicCaptureAttempt('expedition-1', 'luminarias')).toBeNull();
    expect(mocks.value).toBe('');
  });
});
