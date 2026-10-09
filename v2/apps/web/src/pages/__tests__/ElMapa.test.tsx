import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
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
        Sumá tu aporte
      </button>
      <div hidden={!participando}>{participacion}</div>
    </section>
  ),
}));
vi.mock('../ElMapa/sections/ParticiparEnMapa', () => ({
  ParticiparEnMapa: ({
    cerrar,
    cambiar,
    modo,
    cargandoLugar,
    lugar,
  }: {
    cerrar: () => void;
    cambiar: (modo: 'guiado' | 'directo') => void;
    modo: string;
    cargandoLugar?: boolean;
    lugar: { name: string } | null;
  }) => (
    <aside id="aportar" aria-label="Aportar desde el mapa" data-modo={modo}>
      <h2>Sumá tu aporte.</h2>
      <p>{cargandoLugar ? 'Buscando el lugar…' : (lugar?.name ?? 'Todo el país')}</p>
      <button
        type="button"
        onClick={() => {
          cambiar(modo === 'directo' ? 'guiado' : 'directo');
        }}
      >
        Alternar camino
      </button>
      <button type="button" onClick={cerrar}>
        Cerrar aporte y volver al mapa
      </button>
    </aside>
  ),
}));

import { api } from '~/lib/api';
import { useVocesCount } from '~/lib/queries/analytics';
import { useProvincias, useVocesAbiertas, useVocesPorProvincia } from '~/lib/queries/open-data';
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
  useVocesAbiertas: vi.fn(),
  useVocesPorProvincia: vi.fn(),
}));

vi.mock('~/lib/queries/participacion', () => ({ useCampanas: () => ({ data: [] }) }));
vi.mock('~/lib/queries/fichas', () => ({ useFichas: () => ({ data: { fichas: [] } }) }));
// Con un lugar elegido, «Futuros del territorio» ofrece seguirlo; acá no es lo que se prueba.
vi.mock('~/components/participacion/Seguir', () => ({ Seguir: () => null }));
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
  });

  it('abre con una cabecera corta, sin cifra gigante (D-080)', () => {
    montar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Qué dice la gente, dónde y cuándo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Cada punto es un aporte: un problema, un deseo, algo que ya funciona. Buscá tu zona o sumá el tuyo.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('El mapa de los aportes')).toBeInTheDocument();
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

  it('abre con las tres preguntas cuando se pide desde un botón', () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Sumá tu aporte' }));
    expect(panel()).toHaveAttribute('data-modo', 'guiado');
  });

  it.each([
    ['?participar=aportar#instrumento', 'guiado'],
    ['?participar=imaginar#instrumento', 'guiado'],
    ['?participar=guiado', 'guiado'],
    ['?participar=directo', 'directo'],
    ['?participar=voz', 'directo'],
    ['#aportar', 'guiado'],
  ])('el enlace %s abre el panel del mismo mapa en el camino «%s»', (enlace, modo) => {
    window.history.replaceState(null, '', `/el-mapa${enlace}`);
    montar();
    expect(
      within(screen.getByRole('region', { name: 'Instrumento territorial' })).getByRole(
        'complementary',
        { name: 'Aportar desde el mapa' },
      ),
    ).toHaveAttribute('data-modo', modo);
  });

  it('el enlace sin pedido de aportar no abre el panel', () => {
    window.history.replaceState(null, '', '/el-mapa?lente=mapa&participar=otra');
    montar();
    expect(panel()).not.toBeInTheDocument();
  });

  it('el ancla #aportar del mapa vacío abre las tres preguntas aunque el panel estuviera en el aporte puntual', () => {
    window.history.replaceState(null, '', '/el-mapa?participar=directo');
    montar();
    expect(panel()).toHaveAttribute('data-modo', 'directo');
    act(() => {
      window.history.replaceState(null, '', '/el-mapa?participar=directo#aportar');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(panel()).toHaveAttribute('data-modo', 'guiado');
  });

  it('cambiar de camino deja el enlace diciendo en cuál se está, y cerrar lo quita', () => {
    window.history.replaceState(
      null,
      '',
      '/el-mapa?participar=aportar&campana=mi-campana#instrumento',
    );
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Alternar camino' }));
    expect(panel()).toHaveAttribute('data-modo', 'directo');
    const q = new URLSearchParams(window.location.search);
    expect(q.get('participar')).toBe('directo');
    // Lo demás del enlace —la campaña— no se toca.
    expect(q.get('campana')).toBe('mi-campana');
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
    window.history.replaceState(null, '', '/el-mapa?participar=aportar&lugar=14');
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
});
