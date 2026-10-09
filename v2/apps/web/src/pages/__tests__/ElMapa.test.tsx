import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ElMapa } from '../ElMapa';

import type { ReactNode } from 'react';

vi.mock('../ElMapa/sections/SeccionInstrumento', () => ({
  SeccionInstrumento: ({
    onAportar,
    participacion,
    participando,
  }: {
    onAportar: () => void;
    participacion: ReactNode;
    participando: boolean;
  }) => (
    <section id="instrumento" aria-label="Instrumento territorial">
      <h2>El país, cuadra por cuadra.</h2>
      <button
        type="button"
        data-abrir-aporte
        aria-expanded={participando}
        onClick={() => {
          onAportar();
        }}
      >
        Sumá tu mirada al mapa
      </button>
      <div hidden={!participando}>{participacion}</div>
    </section>
  ),
}));
vi.mock('../ElMapa/sections/ParticiparEnMapa', () => ({
  ParticiparEnMapa: ({ cerrar }: { cerrar: () => void }) => (
    <aside id="aportar" aria-label="Aportar desde el mapa">
      <h2>Sumá tu mirada.</h2>
      <button type="button" onClick={cerrar}>
        Cerrar aporte y volver al mapa
      </button>
    </aside>
  ),
}));

import { useVocesCount } from '~/lib/queries/analytics';
import {
  useProvincias,
  useSoltarVoz,
  useVocesAbiertas,
  useVocesPorProvincia,
} from '~/lib/queries/open-data';
import { useCola } from '~/lib/queries/senales';

vi.mock('~/lib/queries/analytics', () => ({ useVocesCount: vi.fn() }));
/**
 * La cola del «¿sigue así?» entró a esta página con la rebanada de la vuelta.
 * Se mockea acá porque el test compone la página entera: sin esto,
 * `ColaDeVerificacion` sale a pedir de verdad y el archivo falla con un
 * ECONNREFUSED que no habla de nada de lo que este test cuida.
 */
vi.mock('~/lib/queries/senales', () => ({ useCola: vi.fn() }));
vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useSoltarVoz: vi.fn(),
  useVocesAbiertas: vi.fn(),
  useVocesPorProvincia: vi.fn(),
}));

vi.mock('~/lib/queries/participacion', () => ({ useCampanas: () => ({ data: [] }) }));
vi.mock('~/lib/queries/fichas', () => ({ useFichas: () => ({ data: { fichas: [] } }) }));
const montar = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ElMapa />
    </QueryClientProvider>,
  );

describe('ElMapa (página papel 2.2)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/el-mapa');
    vi.mocked(useVocesCount).mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    // `data: []` infiere `never[]`, que no alcanza (ni por asignabilidad ni
    // por comparabilidad) a ninguna variante de UseQueryResult<T[], Error> —
    // mismo puente `unknown` que ya usa el mock de useSoltarVoz debajo.
    vi.mocked(useCola).mockReturnValue({
      data: { senales: [], razon: null },
      isLoading: false,
    } as unknown as ReturnType<typeof useCola>);
    vi.mocked(useProvincias).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useProvincias>);
    vi.mocked(useVocesAbiertas).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useVocesAbiertas>);
    vi.mocked(useVocesPorProvincia).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useVocesPorProvincia>);
    vi.mocked(useSoltarVoz).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useSoltarVoz>);
  });

  it('abre con una cabecera corta, sin cifra gigante (D-080)', () => {
    montar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'El país, dicho por su gente.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('El mapa de las voces')).toBeInTheDocument();
    // La cifra salió de la portada: el contador del instrumento la dice con
    // su alcance, y un «0» a 52px era justo lo que D-080 pedía no mostrar.
    expect(screen.queryByText('voces en el mapa')).not.toBeInTheDocument();
  });

  /**
   * El orden cambió otra vez (análisis del 8/9): el instrumento va PRIMERO,
   * para que el mapa entre en la primera pantalla, y el panel para soltar la
   * voz y el feed quedan debajo, en el ancla `#aportar`. Antes había que
   * hablar antes de ver para qué.
   */
  it('abre el aporte dentro del instrumento y no lo repite debajo del mapa', () => {
    const { container } = montar();
    expect(
      screen.queryByRole('complementary', { name: 'Aportar desde el mapa' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sumá tu mirada al mapa' }));
    const instrumento = screen.getByRole('region', { name: 'Instrumento territorial' });
    expect(
      within(instrumento).getByRole('complementary', { name: 'Aportar desde el mapa' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Últimas voces' })).not.toBeInTheDocument();
    expect(container.querySelector('#aportar')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aporte y volver al mapa' }));
    expect(
      screen.queryByRole('complementary', { name: 'Aportar desde el mapa' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sumá tu mirada al mapa' })).toHaveFocus();
  });

  it('la invitación idealizada abre el panel del mismo mapa desde un enlace público', () => {
    window.history.replaceState(null, '', '/el-mapa?participar=imaginar#instrumento');
    montar();
    expect(
      within(screen.getByRole('region', { name: 'Instrumento territorial' })).getByRole(
        'complementary',
        { name: 'Aportar desde el mapa' },
      ),
    ).toBeInTheDocument();
  });

  it('el instrumento tiene su ancla profunda', () => {
    const { container } = montar();
    expect(container.querySelector('#instrumento')).not.toBeNull();
  });
});
