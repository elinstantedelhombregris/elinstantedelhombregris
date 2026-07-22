import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Home } from '../Home';
import { PLAN_COUNT, PLANES_TEASER } from '../Home/landing-data';

import { useCifras, useVocesCount, useVocesRecientes } from '~/lib/queries/analytics';

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
    data: [{ id: 1, texto: 'Basta de rutas sin luz donde ya murió gente.', categoria: 'basta' }],
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
  it('renders the hero with the ¡BASTA! ink rite and the demo notice', () => {
    renderHome();

    expect(screen.getByRole('heading', { level: 1, name: '¡BASTA!' })).toBeInTheDocument();
    expect(
      screen.getByText('El sitio está en gris — se enciende con tu primera acción'),
    ).toBeInTheDocument();
    expect(screen.getByText('El instante es ahora')).toBeInTheDocument();
  });

  it('points the hero CTAs at the map and the idea', () => {
    renderHome();

    expect(screen.getByRole('link', { name: 'Dejar mi voz en el mapa' })).toHaveAttribute(
      'href',
      '/el-mapa',
    );
    expect(screen.getByRole('link', { name: 'Entender la idea' })).toHaveAttribute(
      'href',
      '/la-vision',
    );
  });

  it('never shows the retired demo-data asterisk note — the cifras strip is all real now', () => {
    renderHome();

    expect(
      screen.queryByText(
        '* Datos de demostración — la plataforma real arranca en cero, y eso también está bien.',
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByText('12.496')).toBeInTheDocument();
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
        name: `Un tipo común ya escribió ${PLAN_COUNT} planes de país.`,
      }),
    ).toBeInTheDocument();
  });

  it('closes with the CTA band toward the map and the seed', () => {
    renderHome();

    expect(
      screen.getByRole('heading', { name: 'Tu voz pesa. Soltala en el mapa.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir al mapa' })).toHaveAttribute('href', '/el-mapa');
    expect(screen.getByRole('link', { name: 'Sembrar mi compromiso' })).toHaveAttribute(
      'href',
      '/la-semilla-de-basta',
    );
  });
});
