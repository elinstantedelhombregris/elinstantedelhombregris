import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ElMapa } from '../ElMapa';

import { useVocesCount } from '~/lib/queries/analytics';
import {
  useProvincias,
  useSoltarVoz,
  useVocesAbiertas,
  useVocesPorProvincia,
} from '~/lib/queries/open-data';

vi.mock('~/lib/queries/analytics', () => ({ useVocesCount: vi.fn() }));
vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useSoltarVoz: vi.fn(),
  useVocesAbiertas: vi.fn(),
  useVocesPorProvincia: vi.fn(),
}));

describe('ElMapa (página papel 2.2)', () => {
  beforeEach(() => {
    vi.mocked(useVocesCount).mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    // `data: []` infiere `never[]`, que no alcanza (ni por asignabilidad ni
    // por comparabilidad) a ninguna variante de UseQueryResult<T[], Error> —
    // mismo puente `unknown` que ya usa el mock de useSoltarVoz debajo.
    vi.mocked(useProvincias).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useProvincias>);
    vi.mocked(useVocesAbiertas).mockReturnValue({ data: [], isLoading: false, isError: false } as unknown as ReturnType<typeof useVocesAbiertas>);
    vi.mocked(useVocesPorProvincia).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useVocesPorProvincia>);
    vi.mocked(useSoltarVoz).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useSoltarVoz>);
  });

  it('abre con el rito de la tinta y la cifra real formateada es-AR', () => {
    render(<ElMapa />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'El país, dicho por su gente.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('El mapa de las voces')).toBeInTheDocument();
    expect(screen.getByText('12.496')).toBeInTheDocument();
    expect(screen.getByText('voces en el mapa')).toBeInTheDocument();
  });

  it('si la cifra carga o falló, el bloque no aparece — jamás un número inventado', () => {
    vi.mocked(useVocesCount).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    render(<ElMapa />);

    expect(screen.queryByText('voces en el mapa')).not.toBeInTheDocument();
  });

  it('compone mapa + panel + feed', () => {
    render(<ElMapa />);

    expect(screen.getByRole('group', { name: 'Mapa de la Argentina: las voces por provincia' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Soltá tu voz' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Últimas voces' })).toBeInTheDocument();
  });
});
