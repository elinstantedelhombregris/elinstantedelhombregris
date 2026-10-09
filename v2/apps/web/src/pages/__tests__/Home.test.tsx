import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Home } from '../Home';
import { PLAN_COUNT, PLANES_TEASER } from '../Home/landing-data';

import { useCifras, useVocesCount, useVocesRecientes } from '~/lib/queries/analytics';

vi.mock('~/lib/queries/participacion', () => ({ useCampanas: () => ({ data: [] }) }));
vi.mock('~/lib/queries/fichas', () => ({ useFichas: () => ({ data: { fichas: [] } }) }));

// La home ahora consume la API real (voces/cifras/voces-recientes) vía
// react-query — se mockean los hooks para que el render sea determinista
// y no dispare fetches de verdad en jsdom.
vi.mock('~/lib/queries/analytics', () => ({
  useVocesCount: vi.fn(),
  useCifras: vi.fn(),
  useVocesRecientes: vi.fn(),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);
const mockedUseCifras = vi.mocked(useCifras);
const mockedUseVocesRecientes = vi.mocked(useVocesRecientes);

function renderHome() {
  mockedUseVocesCount.mockReturnValue({
    data: { total: 12496 },
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useVocesCount>);
  mockedUseCifras.mockReturnValue({
    data: { voces: 12496, propuestas: 7, senales: 42, posts: 3 },
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useCifras>);
  mockedUseVocesRecientes.mockReturnValue({
    data: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        texto: 'Basta de rutas sin luz donde ya murió gente.',
        categoria: 'basta',
      },
    ],
    isLoading: false,
  } as ReturnType<typeof useVocesRecientes>);

  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Home />
    </QueryClientProvider>,
  );
}

describe('Home (landing Papel y Tinta)', () => {
  it('pone la idea ciudadanía, Estado y política al comienzo, con una sola pregunta idealizada', () => {
    renderHome();

    expect(
      screen.getByRole('heading', { level: 1, name: 'La ciudadanía diseña. El Estado administra. La política ejecuta.' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText(/En tu Argentina ideal/)).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: 'Imaginá' })).not.toBeInTheDocument();
  });

  it('points the hero CTAs at the map and the idea', () => {
    renderHome();

    expect(screen.getAllByRole('link', { name: 'Imaginar mi Argentina' })[0]).toHaveAttribute(
      'href',
      '/el-mapa?participar=imaginar#instrumento',
    );
    expect(screen.getByRole('link', { name: 'Cómo funciona el ejercicio →' })).toHaveAttribute(
      'href',
      '/la-idea',
    );
  });

  it('never shows the retired demo-data asterisk note — the cifras strip is all real now', () => {
    renderHome();

    expect(
      screen.queryByText(
        '* Datos de demostración — la plataforma real arranca en cero, y eso también está bien.',
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('12.496')).not.toBeInTheDocument();
  });

  it('teases three real plans from the registry', () => {
    renderHome();

    expect(PLANES_TEASER).toHaveLength(3);
    for (const plan of PLANES_TEASER) {
      const card = screen.getByText(plan.code).closest('a');
      expect(card).toHaveAttribute('href', `/planes/${plan.slug}`);
    }
    expect(
      screen.getByRole('heading', {
        name: `${PLAN_COUNT} temas del país, pensados de cero.`,
      }),
    ).toBeInTheDocument();
  });

  it('cierra con una sola invitación a aportar dentro del mapa', () => {
    renderHome();

    expect(
      screen.getByRole('heading', { name: 'El futuro necesita tu letra.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Escribir mi primera posibilidad' })).toHaveAttribute(
      'href',
      '/el-mapa?participar=imaginar#instrumento',
    );
    expect(screen.getAllByRole('link', { name: 'Imaginar mi Argentina' })).toHaveLength(1);
    expect(screen.queryByText(/45 millones/)).not.toBeInTheDocument();
  });
});
