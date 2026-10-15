import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConciliacionTerritorial } from '../../ConciliacionTerritorial';

import { api } from '~/lib/api';

afterEach(() => vi.restoreAllMocks());
const montar = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <ConciliacionTerritorial />
    </QueryClientProvider>,
  );
const datos = {
  fecha: '2026-10-15T12:00:00Z',
  versionCenso: 'censo-prueba',
  versionGeo: 'geo-prueba',
  fuentes: [],
  filas: [],
  total: 100,
  conDiferencias: 12,
  filtradas: 100,
  siguiente: 1,
};
describe('Conciliación visible', () => {
  it('explica el alcance y reinicia la página al cambiar filtros', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue(datos);
    montar();
    expect(await screen.findByText(/100 registros en este alcance/)).toBeInTheDocument();
    expect(screen.getByText(/No repartas el porcentaje nacional/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await waitFor(() => {
      expect(get.mock.calls.at(-1)?.[0]).toContain('pagina=1');
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Solo diferencias' }));
    await waitFor(() => {
      expect(get.mock.calls.at(-1)?.[0]).toContain('diferencias=si&pagina=0');
    });
  });
  it('muestra el fallo sin inventar un conteo cero', async () => {
    vi.spyOn(api, 'get').mockRejectedValue(new Error('Sin conexión'));
    montar();
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión');
    expect(screen.queryByText(/0 registros/)).not.toBeInTheDocument();
  });
});
