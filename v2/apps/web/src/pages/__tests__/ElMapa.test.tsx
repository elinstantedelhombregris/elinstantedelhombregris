import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ElMapa } from '../ElMapa';

import type { ReactNode } from 'react';

vi.mock('../ElMapa/sections/SeccionInstrumento', () => ({
  SeccionInstrumento: ({
    onAportar,
    participacion,
    participando,
  }: {
    onAportar: (lugar: null) => void;
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
          onAportar(null);
        }}
      >
        Sumá tu aporte
      </button>
      <div hidden={!participando}>{participacion}</div>
    </section>
  ),
}));
vi.mock('../ElMapa/sections/ParticiparEnMapa', () => ({
  ParticiparEnMapa: ({
    cerrar,
    cargandoLugar,
    lugar,
  }: {
    cerrar: () => void;
    cargandoLugar?: boolean;
    lugar: { name: string } | null;
  }) => (
    <aside id="aportar" aria-label="Aportar desde el mapa">
      <h2>Sumá tu aporte.</h2>
      <p>{cargandoLugar ? 'Buscando el lugar…' : (lugar?.name ?? 'Todo el país')}</p>
      <button type="button" onClick={cerrar}>
        Cerrar aporte y volver al mapa
      </button>
    </aside>
  ),
}));

import { api } from '~/lib/api';
import { useVocesCount } from '~/lib/queries/analytics';
import { useProvincias } from '~/lib/queries/open-data';
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
}));

vi.mock('~/lib/queries/participacion', () => ({ useCampanas: () => ({ data: [] }) }));
vi.mock('~/lib/queries/fichas', () => ({ useFichas: () => ({ data: { fichas: [] } }) }));
// Con un lugar elegido, «Futuros del territorio» ofrece seguirlo; acá no es lo que se prueba.
vi.mock('~/components/participacion/Seguir', () => ({ Seguir: () => null }));
const montar = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <ElMapa />
    </QueryClientProvider>,
  );

describe('ElMapa (página papel 2.2)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
  });

  it('abre con una cabecera corta, sin cifra gigante (D-080)', () => {
    montar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cómo está hoy lo que imaginamos' }),
    ).toBeInTheDocument();
    expect(screen.getByText('El mapa de lo que pasa hoy')).toBeInTheDocument();
    // La cifra salió de la portada: el contador del instrumento la dice con
    // su alcance, y un «0» a 52px era justo lo que D-080 pedía no mostrar.
    expect(screen.queryByText('voces en el mapa')).not.toBeInTheDocument();
  });

  it('se presenta como la capa de cómo está hoy y ofrece volver a Mi Argentina ideal', () => {
    montar();

    expect(
      screen.getByText(/se cuenta y se comprueba, lugar por lugar, lo que ya pasa/),
    ).toHaveTextContent('un problema, algo que falta, algo que ya funciona');
    expect(screen.getByRole('link', { name: '← Volver a Mi Argentina ideal' })).toHaveAttribute(
      'href',
      '/mi-argentina-ideal',
    );
    // Un solo botón para aportar: el del instrumento. La portada no suma otro.
    expect(screen.getAllByRole('button', { name: /aporte/i })).toHaveLength(1);
    expect(screen.queryByRole('link', { name: /^Sumá|^Sumar el primer/ })).not.toBeInTheDocument();
    expect(
      document.querySelector('main a[href*="participar"], main a[href="#aportar"]'),
    ).toBeNull();
    expect(document.title).toBe('El mapa · ¡BASTA!');
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
    fireEvent.click(screen.getByRole('button', { name: 'Sumá tu aporte' }));
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
    expect(screen.getByRole('button', { name: 'Sumá tu aporte' })).toHaveFocus();
  });

  const panel = () => screen.queryByRole('complementary', { name: 'Aportar desde el mapa' });

  it.each([
    ['?participar=directo', 'directo'],
    ['?participar=voz', 'voz'],
    ['?participar=directo#aportar', 'directo, aunque traiga el ancla vieja'],
  ])('el enlace %s abre el aporte puntual en el mismo mapa (%s)', (enlace) => {
    window.history.replaceState(null, '', `/el-mapa${enlace}`);
    montar();
    expect(
      within(screen.getByRole('region', { name: 'Instrumento territorial' })).getByRole(
        'complementary',
        { name: 'Aportar desde el mapa' },
      ),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/el-mapa');
  });

  it.each([
    '?participar=aportar#instrumento',
    '?participar=imaginar#instrumento',
    '?participar=guiado',
    '#aportar',
  ])('el enlace viejo %s lleva a Imaginar en vez de abrir un panel acá', (enlace) => {
    window.history.replaceState(null, '', `/el-mapa${enlace}`);
    montar();
    expect(window.location.pathname).toBe('/mi-argentina-ideal/imaginar');
    expect(window.location.hash).toBe('');
  });

  it('la redirección conserva campaña, edición, borrador y lugar, y deja lo que es del mapa', () => {
    window.history.replaceState(
      null,
      '',
      '/el-mapa?participar=aportar&campana=mi-campana&edicion=2&borrador=b-1&lugar=14&lente=analisis&periodo=30d#instrumento',
    );
    // Después de la redirección este test no tiene router: el mapa sigue montado y pide el lugar.
    vi.spyOn(api, 'get').mockReturnValue(new Promise(() => undefined));
    const antes = window.history.length;
    montar();
    expect(window.location.pathname).toBe('/mi-argentina-ideal/imaginar');
    expect(Object.fromEntries(new URLSearchParams(window.location.search))).toEqual({
      campana: 'mi-campana',
      edicion: '2',
      borrador: 'b-1',
      lugar: '14',
    });
    // Reemplaza la entrada del historial: «atrás» no vuelve a un enlace que redirige.
    expect(window.history.length).toBe(antes);
  });

  it('una edición mal escrita viaja tal cual: Imaginar la marca en vez de elegir otra', () => {
    window.history.replaceState(null, '', '/el-mapa?participar=aportar&campana=una&edicion=otra');
    montar();
    expect(window.location.search).toBe('?campana=una&edicion=otra');
  });

  it('el enlace sin pedido de aportar no abre el panel ni redirige', () => {
    window.history.replaceState(null, '', '/el-mapa?lente=mapa&participar=otra');
    montar();
    expect(panel()).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/el-mapa');
  });

  it('el ancla #aportar que aparece con la página abierta también lleva a Imaginar', () => {
    window.history.replaceState(null, '', '/el-mapa?campana=mi-campana');
    montar();
    act(() => {
      window.history.replaceState(null, '', '/el-mapa?campana=mi-campana#aportar');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(window.location.pathname).toBe('/mi-argentina-ideal/imaginar');
    expect(window.location.search).toBe('?campana=mi-campana');
  });

  it('cerrar el panel quita el pedido del enlace y conserva lo demás', () => {
    window.history.replaceState(
      null,
      '',
      '/el-mapa?participar=directo&campana=mi-campana#instrumento',
    );
    montar();
    expect(panel()).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aporte y volver al mapa' }));
    expect(new URLSearchParams(window.location.search).has('participar')).toBe(false);
    expect(new URLSearchParams(window.location.search).get('campana')).toBe('mi-campana');
  });

  it('el panel no se desmonta mientras carga el lugar: lo dice en su línea del lugar', async () => {
    let resolver: (lugar: unknown) => void = () => undefined;
    vi.spyOn(api, 'get').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolver = resolve;
        }),
    );
    window.history.replaceState(null, '', '/el-mapa?participar=directo&lugar=14');
    montar();
    const aside = panel();
    if (!aside) throw new Error('El panel tendría que estar abierto.');
    expect(within(aside).getByText('Buscando el lugar…')).toBeInTheDocument();
    act(() => {
      resolver({
        id: 14,
        provinceId: 14,
        name: 'Córdoba',
        level: 'province',
        latitude: null,
        longitude: null,
      });
    });
    expect(await within(aside).findByText('Córdoba')).toBeInTheDocument();
    // El mismo nodo: no se volvió a montar, así que lo escrito adentro sigue ahí.
    expect(panel()).toBe(aside);
  });

  it('el instrumento tiene su ancla profunda', () => {
    const { container } = montar();
    expect(container.querySelector('#instrumento')).not.toBeNull();
  });
  it('abrir el aporte desde un enlace conserva el lugar de las fichas aunque el instrumento no lo haya elegido a mano', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      id: 14,
      provinceId: 14,
      name: 'Córdoba',
      level: 'province',
      latitude: null,
      longitude: null,
    });
    window.history.replaceState(null, '', '/el-mapa?lugar=14');
    montar();
    await screen.findByText('Futuro · Córdoba');
    fireEvent.click(screen.getByRole('button', { name: 'Sumá tu aporte' }));
    expect(screen.getByText('Futuro · Córdoba')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir una ficha de futuro' })).toHaveAttribute(
      'href',
      '/fichas/nueva?lugar=14&nombre=C%C3%B3rdoba',
    );
    expect(
      within(screen.getByRole('complementary', { name: 'Aportar desde el mapa' })).getByText(
        'Córdoba',
      ),
    ).toBeInTheDocument();
    act(() => {
      window.history.pushState(null, '', '/el-mapa');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await waitFor(() => {
      expect(screen.getByText('Futuro · todo el país')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Abrir una ficha de futuro' })).toHaveAttribute(
      'href',
      '/fichas/nueva?',
    );
  });

  it('un lugar que no carga no se convierte en una consulta de fichas de todo el país y se puede recuperar', async () => {
    vi.spyOn(api, 'get').mockRejectedValueOnce(new Error('sin conexión')).mockResolvedValueOnce({
      id: 14,
      provinceId: 14,
      name: 'Córdoba',
      level: 'province',
      latitude: null,
      longitude: null,
    });
    window.history.replaceState(null, '', '/el-mapa?lugar=14');
    montar();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos cargar el lugar elegido',
    );
    expect(screen.queryByText('Futuro · todo el país')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar el lugar' }));
    expect(await screen.findByText('Futuro · Córdoba')).toBeInTheDocument();
  });
});
