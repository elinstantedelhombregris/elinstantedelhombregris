import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AmbitosProvinciales } from '../AmbitosProvinciales';

import type { pintarAmbitos } from '../ambitos-provinciales';
import type { ReactNode } from 'react';
import type { LecturaMapa } from '~/lib/queries/civic-map';

const datos = vi.hoisted(() => ({ fuente: vi.fn<(valor: unknown) => void>() }));
vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: () => ({ data: [{ id: 13, name: 'Mendoza' }] }),
}));
vi.mock('react-map-gl/maplibre', () => ({
  Source: ({ data, children }: { data: unknown; children: ReactNode }) => {
    datos.fuente(data);
    return <div>{children}</div>;
  },
  Layer: () => null,
}));
const resumen: LecturaMapa['metadata'] = {
  total: 600,
  entregados: 100,
  completa: false,
  hasta: '2026-10-08T00:00:00Z',
  siguiente: 'cursor',
  unidad: 'registros',
  sinPunto: 600,
  porProvincia: [{ provinceId: 13, total: 600, tipos: [{ tipo: 'sueño', total: 600 }] }],
  porDia: [],
};
beforeEach(() => {
  vi.clearAllMocks();
});
describe('Mapa de ámbitos declarados', () => {
  it('carga la geometría propia y dibuja el resumen completo como polígono', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: 'Mendoza' },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-70, -36],
                    [-66, -36],
                    [-70, -36],
                  ],
                ],
              },
            },
          ],
        }),
    });
    vi.stubGlobal('fetch', fetch);
    try {
      render(
        <QueryClientProvider
          client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
          <AmbitosProvinciales resumen={resumen} clases={new Set(['deseo'])} />
        </QueryClientProvider>,
      );
      await waitFor(() => {
        expect(datos.fuente).toHaveBeenCalled();
      });
      const dibujado = datos.fuente.mock.lastCall?.[0] as
        | ReturnType<typeof pintarAmbitos>
        | undefined;
      expect(dibujado?.features[0]?.geometry.type).toBe('Polygon');
      expect(dibujado?.features[0]?.properties).toEqual({
        name: 'Mendoza',
        provinceId: 13,
        total: 600,
      });
      expect(fetch).toHaveBeenCalledWith('/geo/provincias.geojson', expect.anything());
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
