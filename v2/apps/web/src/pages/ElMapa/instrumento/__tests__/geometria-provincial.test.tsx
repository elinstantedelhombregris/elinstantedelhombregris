import { readFileSync } from 'node:fs';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useGeometriaProvincial } from '../useGeometriaProvincial';

import type { ReactNode } from 'react';

const geometria: unknown = JSON.parse(readFileSync('public/geo/provincias.geojson', 'utf8'));
function montar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(() => useGeometriaProvincial(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Límites provinciales compartidos', () => {
  it('admite el archivo publicado y conserva la última geometría si falla una actualización', async () => {
    const peticion = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(geometria) })
      .mockRejectedValueOnce(new Error('sin conexión'));
    vi.stubGlobal('fetch', peticion);
    const { result } = montar();
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    const anterior = result.current.data;
    expect(anterior?.features.length).toBeGreaterThan(0);
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.data).toBe(anterior);
  });

  it.each([
    { ok: false, json: () => Promise.resolve(geometria) },
    { ok: true, json: () => Promise.resolve({ error: 'sin archivo' }) },
    { ok: true, json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }) },
    {
      ok: true,
      json: () => Promise.resolve({ type: 'FeatureCollection', features: [{ properties: null }] }),
    },
  ])(
    'trata HTTP fallido o geometría inválida como error, sin dibujar un vacío válido',
    async (respuesta) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta));
      const { result } = montar();
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.data).toBeUndefined();
    },
  );
});
