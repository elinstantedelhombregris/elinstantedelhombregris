import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PAPEL_NAV, SECCIONES_MI_ARGENTINA_IDEAL } from '../papel/papel-nav';
import { PapelHeader } from '../papel/PapelHeader';

import { APORTAR_HREF } from '~/lib/participacion/aportar';
import { useVocesCount } from '~/lib/queries/analytics';

const sesion = vi.hoisted(() => ({ user: null as null | { id: number } }));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: sesion.user }) }));

vi.mock('~/lib/queries/analytics', () => ({
  useVocesCount: vi.fn(),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);

afterEach(() => {
  sesion.user = null;
  window.history.replaceState(null, '', '/');
});

function renderHeader() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <PapelHeader />
    </QueryClientProvider>,
  );
}

describe('PapelHeader', () => {
  it('mientras carga no inventa un número', () => {
    // Antes caía a DEMO_VOCES_COUNT = '12.496': un número fabricado, en el
    // lugar más visible del sitio, en TODAS las páginas. Un hueco es mejor que
    // una cifra que nadie dijo.
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByRole('link', { name: '¡BASTA! — inicio' })).toHaveAttribute('href', '/');
    expect(screen.queryByText(/12\.496/)).not.toBeInTheDocument();
    expect(screen.queryByText(/voces/)).not.toBeInTheDocument();
  });

  it('si la consulta falla tampoco inventa', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.queryByText(/voces/)).not.toBeInTheDocument();
  });

  it('en cero, el contador invita en vez de contar', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 0 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByText('el primer aporte todavía puede ser el tuyo')).toBeInTheDocument();
  });

  it('con una sola voz vuelve a contar, sin que nadie apague nada', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 1 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByText('1 aporte en el registro')).toBeInTheDocument();
  });

  it('renders the live total formatted es-AR once loaded', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByText('12.496 aportes en el registro')).toBeInTheDocument();
  });

  it('renders the recorrido nav with the real v2 routes', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    for (const item of PAPEL_NAV) {
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute('href', item.href);
    }
    expect(screen.getByRole('link', { name: 'Sumate' })).toHaveAttribute('href', APORTAR_HREF);
  });

  it('el header tiene cuatro puertas y «Sumate»: el mapa y la Radiografía ya no van sueltos', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    const recorrido = screen.getByRole('navigation', { name: 'Recorrido' });
    expect(
      within(recorrido)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual([
      'La idea▾',
      'Mi Argentina ideal▾',
      'Campañas▾',
      'Biblioteca▾',
      'Ingresar',
      'Sumate',
    ]);
    expect(within(recorrido).getByRole('link', { name: 'Mi Argentina ideal' })).toHaveAttribute(
      'href',
      '/mi-argentina-ideal',
    );
    expect(within(recorrido).queryByRole('link', { name: 'Mapa' })).not.toBeInTheDocument();
    expect(within(recorrido).queryByRole('link', { name: /Radiografía/ })).not.toBeInTheDocument();
    expect(
      within(recorrido).queryByRole('link', { name: 'Imaginar mi Argentina' }),
    ).not.toBeInTheDocument();
  });

  it('en el mapa queda marcada «Mi Argentina ideal», de donde cuelga', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    window.history.replaceState(null, '', '/el-mapa');
    renderHeader();

    expect(screen.getByRole('link', { name: 'Mi Argentina ideal' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('link', { name: 'La idea' })).not.toHaveAttribute('aria-current');
  });

  it('toggles the full-screen mobile menu', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(
      screen.queryByRole('navigation', { name: 'Recorrido completo' }),
    ).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'Abrir menú' });
    // §9b: targets móviles ≥44px — min-h-11/min-w-11 son 2.75rem (44px) en la escala Tailwind.
    expect(toggle).toHaveClass('min-h-11', 'min-w-11');

    fireEvent.click(toggle);
    expect(screen.getByRole('navigation', { name: 'Recorrido completo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inicio/ })).toHaveAttribute('href', '/');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(
      screen.queryByRole('navigation', { name: 'Recorrido completo' }),
    ).not.toBeInTheDocument();
  });
});

describe('PapelHeader — el menú móvil bloquea el scroll de atrás', () => {
  const sinCifra = () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
  };
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('al abrirlo bloquea el scroll y al cerrarlo devuelve el valor que había', () => {
    sinCifra();
    document.body.style.overflow = 'scroll';
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    // No un '' a ciegas: lo que había antes de abrir.
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('si el header se desmonta con el menú abierto, el scroll vuelve', () => {
    sinCifra();
    document.body.style.overflow = 'auto';
    const { unmount } = renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('Escape también lo suelta', () => {
    sinCifra();
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('');
  });

  it('con el menú cerrado no toca el scroll', () => {
    sinCifra();
    document.body.style.overflow = 'scroll';
    renderHeader();
    expect(document.body.style.overflow).toBe('scroll');
  });
});

describe('PapelHeader — la puerta de la cuenta', () => {
  const sinCifra = () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
  };

  it('sin sesión, «Ingresar» es un ítem más del recorrido y devuelve a la página donde se pidió', () => {
    sinCifra();
    window.history.replaceState(null, '', '/campanas/mi-argentina-ideal?edicion=2');
    renderHeader();

    const ingresar = screen.getByRole('link', { name: 'Ingresar' });
    expect(ingresar).toHaveAttribute(
      'href',
      '/ingresar?volver=' + encodeURIComponent('/campanas/mi-argentina-ideal?edicion=2'),
    );
    // Mismo estilo que «La idea» o «Campañas»: mono, mayúsculas, subrayado de sección.
    const hermano = screen.getByRole('link', { name: 'Mi Argentina ideal' });
    for (const clase of ['font-space', 'uppercase', 'border-b-2', 'px-3.5', 'py-2'])
      expect(ingresar).toHaveClass(clase);
    expect(hermano).toHaveClass('uppercase', 'border-b-2');
    expect(ingresar).not.toHaveClass('underline');
  });

  it('en la pantalla de ingreso el ítem queda marcado con aria-current', () => {
    sinCifra();
    window.history.replaceState(null, '', '/ingresar');
    renderHeader();

    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Mi Argentina ideal' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('con sesión dice «Mi espacio» y lleva ahí', () => {
    sinCifra();
    sesion.user = { id: 1 };
    window.history.replaceState(null, '', '/mi-espacio');
    renderHeader();

    const link = screen.getByRole('link', { name: 'Mi espacio' });
    expect(link).toHaveAttribute('href', '/mi-espacio');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Ingresar' })).not.toBeInTheDocument();
  });

  it('el menú móvil ofrece «Ingresar» sin sesión y no con sesión', () => {
    sinCifra();
    const sinSesion = renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const menu = screen.getByRole('navigation', { name: 'Recorrido completo' });
    expect(within(menu).getByRole('link', { name: /Ingresar/ })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2F',
    );
    sinSesion.unmount();

    sesion.user = { id: 1 };
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(
      within(screen.getByRole('navigation', { name: 'Recorrido completo' })).queryByRole('link', {
        name: /Ingresar/,
      }),
    ).not.toBeInTheDocument();
  });

  it('el menú móvil nombra la acción como el resto del sitio', () => {
    sinCifra();
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const menu = screen.getByRole('navigation', { name: 'Recorrido completo' });

    // El mismo botón del header, con el mismo nombre y el mismo destino.
    expect(within(menu).getByRole('link', { name: /^Sumate/ })).toHaveAttribute(
      'href',
      APORTAR_HREF,
    );
    expect(
      within(menu).queryByRole('link', { name: /Imaginar mi Argentina/ }),
    ).not.toBeInTheDocument();
  });

  it('el menú móvil ofrece los mismos destinos que el header, con los hijos de Mi Argentina ideal', () => {
    sinCifra();
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const menu = screen.getByRole('navigation', { name: 'Recorrido completo' });

    for (const item of PAPEL_NAV)
      expect(
        within(menu).getByRole('link', { name: new RegExp(`^${item.label}`) }),
      ).toHaveAttribute('href', item.href);
    expect(SECCIONES_MI_ARGENTINA_IDEAL.map((s) => [s.label, s.href])).toEqual([
      ['Imaginar', '/mi-argentina-ideal/imaginar'],
      ['Mirar', '/mi-argentina-ideal/mirar'],
      ['Ver', '/mi-argentina-ideal'],
      ['El mapa de lo que pasa hoy', '/el-mapa'],
      ['La Radiografía', '/la-radiografia'],
    ]);
    for (const hijo of SECCIONES_MI_ARGENTINA_IDEAL)
      expect(
        within(menu).getByRole('link', { name: new RegExp(`^${hijo.label}\\s*\\d`) }),
      ).toHaveAttribute('href', hijo.href);
  });

  it('en Imaginar, el menú móvil marca Imaginar y no también Ver, que es la ruta de arriba', () => {
    sinCifra();
    window.history.replaceState(null, '', '/mi-argentina-ideal/imaginar');
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const menu = screen.getByRole('navigation', { name: 'Recorrido completo' });

    expect(within(menu).getByRole('link', { name: /^Imaginar\s*02\.1/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(menu).getByRole('link', { name: /^Ver\s*02\.3/ })).not.toHaveAttribute(
      'aria-current',
    );
    expect(within(menu).getByRole('link', { name: /^Mi Argentina ideal/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('Escape cierra el menú móvil y el foco vuelve al botón que lo abrió', () => {
    sinCifra();
    renderHeader();
    const boton = screen.getByRole('button', { name: 'Abrir menú' });
    fireEvent.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'true');
    expect(boton).toHaveAttribute('aria-controls', 'menu-movil');
    expect(document.getElementById('menu-movil')).not.toBeNull();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(
      screen.queryByRole('navigation', { name: 'Recorrido completo' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveFocus();
  });

  it('otras teclas no cierran el menú', () => {
    sinCifra();
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.keyDown(document, { key: 'Enter' });

    expect(screen.getByRole('navigation', { name: 'Recorrido completo' })).toBeInTheDocument();
  });

  it('ningún texto del header ni del menú usa el gris que no llega a contraste', () => {
    sinCifra();
    const { container } = renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

    expect(container.innerHTML).not.toMatch(/text-tinta-30/);
    expect(document.body.innerHTML).not.toMatch(/text-tinta-30/);
  });

  it('La Radiografía aparece una sola vez en el menú móvil: cuelga de Mi Argentina ideal', () => {
    sinCifra();
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const menu = screen.getByRole('navigation', { name: 'Recorrido completo' });

    expect(within(menu).getAllByRole('link', { name: /Radiografía/i })).toHaveLength(1);
  });

  it('el menú móvil abre Planes y Fichas como hijos de La idea y de Campañas', () => {
    sinCifra();
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const menu = screen.getByRole('navigation', { name: 'Recorrido completo' });

    expect(within(menu).getByRole('link', { name: /Los planes/ })).toHaveAttribute(
      'href',
      '/planes',
    );
    expect(within(menu).getByRole('link', { name: /Las fichas/ })).toHaveAttribute(
      'href',
      '/fichas',
    );
  });
});
