import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { obtenerCoords, obtenerUbicacion } from '@/lib/capturar-gps';

const mocks = vi.hoisted(() => ({
  getPermission: vi.fn(),
  requestPermission: vi.fn(),
  getPosition: vi.fn(),
  getSetting: vi.fn(),
  setSetting: vi.fn(),
}));

vi.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: mocks.getPermission,
  requestForegroundPermissionsAsync: mocks.requestPermission,
  getCurrentPositionAsync: mocks.getPosition,
}));

vi.mock('@/db/repos', () => ({
  getSetting: mocks.getSetting,
  setSetting: mocks.setSetting,
}));

vi.mock('@/stores/juego', () => ({
  CLAVES_DIA: { gpsPedido: 'gps-pedido' },
}));

describe('plazo total de ubicación', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.getSetting.mockReturnValue(null);
  });

  afterEach(() => vi.useRealTimers());

  it('continúa a los tres segundos aunque el permiso quede abierto', async () => {
    mocks.getPermission.mockResolvedValue({ granted: false });
    mocks.requestPermission.mockReturnValue(new Promise(() => undefined));

    const result = obtenerCoords();
    await vi.advanceTimersByTimeAsync(3_000);

    await expect(result).resolves.toBeNull();
    expect(mocks.setSetting).toHaveBeenCalledWith('gps-pedido', '1');
    expect(mocks.getPosition).not.toHaveBeenCalled();
  });

  it('aplica el mismo plazo a una lectura GPS que no responde', async () => {
    mocks.getPermission.mockResolvedValue({ granted: true });
    mocks.getPosition.mockReturnValue(new Promise(() => undefined));

    const result = obtenerCoords();
    await vi.advanceTimersByTimeAsync(3_000);

    await expect(result).resolves.toBeNull();
  });

  it('devuelve la posición cuando llega antes del plazo', async () => {
    mocks.getPermission.mockResolvedValue({ granted: true });
    mocks.getPosition.mockResolvedValue({
      coords: { latitude: -32.89, longitude: -68.84, accuracy: 18.4 },
      timestamp: Date.parse('2026-07-13T12:00:00.000Z'),
    });

    await expect(obtenerCoords()).resolves.toEqual({ lat: -32.89, lng: -68.84 });
  });

  it('conserva fuente, error horizontal y momento de lectura', async () => {
    mocks.getPermission.mockResolvedValue({ granted: true });
    mocks.getPosition.mockResolvedValue({
      coords: { latitude: -32.89, longitude: -68.84, accuracy: 18.4 },
      timestamp: Date.parse('2026-07-13T12:00:00.000Z'),
    });

    await expect(obtenerUbicacion()).resolves.toEqual({
      point: { lat: -32.89, lng: -68.84 },
      horizontalAccuracyM: 18.4,
      capturedAt: '2026-07-13T12:00:00.000Z',
      source: 'gps_current',
    });
  });
});
