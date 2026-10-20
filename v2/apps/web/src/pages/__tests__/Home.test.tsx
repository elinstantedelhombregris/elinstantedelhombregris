import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { PREGUNTA_MI_ARGENTINA_IDEAL } from '@v2/shared';
import { describe, expect, it, vi } from 'vitest';

import { Home } from '../Home';
import { PLANES_TEASER } from '../Home/landing-data';

import { APORTAR_HREF } from '~/lib/participacion/aportar';
import { useCifras, useVocesCount, useVocesRecientes } from '~/lib/queries/analytics';
import { PLAN_COUNT } from '~/pages/Planes/la-prueba-data';

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
      screen.getByRole('heading', {
        level: 1,
        name: 'La ciudadanía diseña. El Estado administra. La política ejecuta.',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText(/En tu Argentina ideal/)).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: 'Imaginá' })).not.toBeInTheDocument();
  });

  it('la pregunta de la campaña y el campo para contestarla viven en la portada (D-134)', () => {
    const { container } = renderHome();

    const campo = screen.getByRole('textbox', { name: PREGUNTA_MI_ARGENTINA_IDEAL });
    expect(campo).toHaveAttribute('placeholder', 'En mi Argentina ideal…');
    const formulario = screen.getByRole('form', { name: PREGUNTA_MI_ARGENTINA_IDEAL });
    expect(within(formulario).getByRole('button', { name: 'Seguir' })).toBeInTheDocument();
    expect(
      within(formulario).getByRole('link', { name: 'O empezá mirando lo que imaginan otros' }),
    ).toHaveAttribute('href', '/mi-argentina-ideal/mirar');
    expect(screen.getByRole('link', { name: 'Cómo funciona →' })).toHaveAttribute(
      'href',
      '/la-idea',
    );
    // Ya no manda a otra página a contestar, ni ofrece el mapa como puerta.
    expect(screen.queryByRole('link', { name: 'Explorar el país ↗' })).not.toBeInTheDocument();
    expect(container.querySelector('a[href="/el-mapa"]')).toBeNull();
  });

  it('en el teléfono la pregunta y el campo van antes de la explicación del sitio', () => {
    // El orden del documento es el del teléfono: nada se reordena con CSS.
    renderHome();
    const campo = screen.getByRole('textbox', { name: PREGUNTA_MI_ARGENTINA_IDEAL });
    const explicacion = screen.getByText(/es un lugar para imaginar entre todos/);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.compareDocumentPosition(campo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      campo.compareDocumentPosition(explicacion) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('dice qué es el sitio en todos los anchos y que no hace falta cuenta', () => {
    renderHome();

    const parrafo = screen.getByText(
      /es un lugar para imaginar entre todos cómo podría ser la Argentina/,
    );
    expect(parrafo).toHaveTextContent(
      '¡BASTA! es un lugar para imaginar entre todos cómo podría ser la Argentina. Contás qué querrías que fuera posible en tu vida y se suma a lo que cuentan otras personas.',
    );
    // Ni el párrafo ni el enlace al método se esconden en móvil.
    expect(parrafo.className).not.toMatch(/\bhidden\b/);
    expect(screen.getByRole('link', { name: 'Cómo funciona →' }).className).not.toMatch(
      /\bhidden\b/,
    );
    expect(screen.getByText('No hace falta cuenta.')).toBeInTheDocument();
  });

  it('el cierre de la banda del hombre gris termina en una pregunta al lector y no en un aforismo', () => {
    renderHome();

    expect(screen.getByText(/¿Y si fueras vos\?/)).toBeInTheDocument();
    expect(
      screen.queryByText(/La experiencia de una vida abre una pregunta/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Acá lo que cuenta cada persona se junta con lo de otras, por tema y lugar. Con eso se arman campañas y fichas.',
      ),
    ).toBeInTheDocument();
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
      // El título es el encabezado de la tarjeta y el código su etiqueta chica.
      expect(screen.getByRole('heading', { level: 3, name: plan.title })).toBeInTheDocument();
      const card = screen.getByText(plan.code).closest('a');
      expect(card).toHaveAttribute('href', `/planes/${plan.slug}`);
      expect(screen.queryByRole('heading', { name: plan.code })).not.toBeInTheDocument();
    }
    expect(
      screen.getByRole('heading', {
        name: `${PLAN_COUNT} temas del país, pensados de cero.`,
      }),
    ).toBeInTheDocument();
  });

  it('cierra con una invitación a imaginar que lleva a la misma puerta que el header', () => {
    renderHome();

    expect(
      screen.getByRole('heading', { name: 'El futuro necesita tu letra.' }),
    ).toBeInTheDocument();
    // Arriba se escribe en el campo; abajo, la invitación va a la puerta de siempre.
    const invitaciones = screen.getAllByRole('link', { name: 'Imaginar mi Argentina' });
    expect(invitaciones).toHaveLength(1);
    expect(invitaciones[0]).toHaveAttribute('href', APORTAR_HREF);
    expect(
      screen.queryByRole('link', { name: 'Escribir mi primera posibilidad' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/45 millones/)).not.toBeInTheDocument();
  });
});
