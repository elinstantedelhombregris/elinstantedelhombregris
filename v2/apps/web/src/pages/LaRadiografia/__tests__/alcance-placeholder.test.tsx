import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useRadiografia,
  type PedidoDeRadiografia,
  type RadiografiaPublica,
} from '~/lib/queries/radiografia';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('~/lib/api', () => ({ api: { get: mocks.get } }));
const datos: RadiografiaPublica = {
  corte: null,
  modelo: null,
  analizadas: 0,
  sinVector: 1,
  total: 1,
  provinciasSinSenal: 24,
  umbral: 0.72,
  nucleos: [],
  solas: [],
  aristas: [],
  regimenDegenerado: null,
};
function Wrapper({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
beforeEach(() => {
  mocks.get
    .mockReset()
    .mockResolvedValueOnce(datos)
    .mockReturnValueOnce(new Promise(() => undefined));
});
describe('el contexto de una Radiografía durante el pedido', () => {
  it('cambiar territorio no presenta el corpus anterior bajo un alcance nuevo', async () => {
    const q = renderHook((p: PedidoDeRadiografia) => useRadiografia(p), {
      initialProps: { umbral: 0.72, filtros: {} },
      wrapper: Wrapper,
    });
    await waitFor(() => {
      expect(q.result.current.data).toEqual(datos);
    });
    q.rerender({ umbral: 0.72, filtros: { territorio: '6' } });
    expect(q.result.current.data).toBeUndefined();
  });
  it('mover sólo el umbral conserva el corte anterior para recalcular sin parpadeo', async () => {
    const q = renderHook((p: PedidoDeRadiografia) => useRadiografia(p), {
      initialProps: { umbral: 0.72, filtros: {} },
      wrapper: Wrapper,
    });
    await waitFor(() => {
      expect(q.result.current.data).toEqual(datos);
    });
    q.rerender({ umbral: 0.82, filtros: {} });
    expect(q.result.current.data).toEqual(datos);
    expect(q.result.current.isPlaceholderData).toBe(true);
  });
});
