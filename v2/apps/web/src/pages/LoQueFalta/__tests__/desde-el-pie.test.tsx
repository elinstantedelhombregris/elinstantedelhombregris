/**
 * La boca del pie: «el pie, en todas las páginas → la ruta actual»
 * (`docs/specs/2026-08-12-lo-que-falta.md` §2.8, D-162).
 *
 * El pie era un enlace pelado a `/lo-que-falta`, y la página abría el panel con
 * su propia dirección como contexto: quien llegaba desde un PLAN tenía que
 * volver a decir de qué página hablaba, y quien leía la falta no sabía dónde se
 * había originado. Acá se cuida el recorrido entero: el pie pasa la página, la
 * página la lee, el panel la dice antes de enviar y la ficha la muestra después.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LoQueFalta } from '../../LoQueFalta';
import { paginaDeOrigen, rutaDeOrigen, superficieDeRuta } from '../lo-que-falta-data';
import { FichaDeFalta } from '../sections/FichaDeFalta';

import type * as QueriesDeFaltas from '~/lib/queries/faltas';

import { PapelFooter } from '~/components/papel/PapelFooter';

const dejar = vi.fn();

vi.mock('~/lib/queries/faltas', async (original) => {
  const real = await original<typeof QueriesDeFaltas>();
  return {
    ...real,
    useConteosDeFaltas: () => ({ data: { total: 3 } }),
    useDejarFalta: () => ({ mutate: dejar, isPending: false, isError: false, reset: vi.fn() }),
    useFirmarFalta: () => ({ mutate: vi.fn(), isPending: false, data: undefined }),
    useRetirarFalta: () => ({ mutate: vi.fn(), isPending: false }),
  };
});
// El registro pide su lista por red; acá no importa.
vi.mock('../sections/RegistroDeFaltas', () => ({ RegistroDeFaltas: () => null }));

function envolver(nodo: React.ReactNode) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={cliente}>{nodo}</QueryClientProvider>);
}

/** Deja el navegador parado en `ruta`, con ese estado de navegación. */
function pararseEn(ruta: string, estado: unknown = null) {
  window.history.replaceState(estado, '', ruta);
}

function escribirYDejar() {
  fireEvent.change(screen.getByPlaceholderText(/El mapa no dice/), {
    target: { value: 'La sección tres no dice quién paga' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Qué pasó, qué esperabas/), {
    target: { value: 'Habla de paneles ciudadanos y no dice de dónde sale la plata.' },
  });
  fireEvent.click(screen.getByText('Dejarla'));
  return dejar.mock.calls[0]?.[0] as Record<string, unknown>;
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});
afterEach(() => {
  pararseEn('/');
});

describe('el pie le pasa la página a «Lo que falta»', () => {
  it('al tocar el enlace, la navegación lleva la página de la que se sale', () => {
    pararseEn('/planes/planjus');
    render(<PapelFooter />);
    fireEvent.click(screen.getByRole('link', { name: 'Lo que falta' }));
    expect(window.location.pathname).toBe('/lo-que-falta');
    expect(window.history.state).toEqual({ desde: '/planes/planjus' });
  });

  it('pasa sólo el camino: la consulta, donde viajan las llaves, se queda', () => {
    pararseEn('/restablecer-contrasena?token=secreto');
    render(<PapelFooter />);
    fireEvent.click(screen.getByRole('link', { name: 'Lo que falta' }));
    expect(window.history.state).toEqual({ desde: '/restablecer-contrasena' });
  });

  it('la dirección del enlace no cambia: lo que viaja no se comparte al copiarlo', () => {
    pararseEn('/planes/planjus');
    render(<PapelFooter />);
    expect(screen.getByRole('link', { name: 'Lo que falta' })).toHaveAttribute(
      'href',
      '/lo-que-falta',
    );
  });
});

describe('la página lee de dónde se llegó', () => {
  it('desde un PLAN: el panel abre en «Los PLANes», dice la página y la manda', () => {
    pararseEn('/lo-que-falta', { desde: '/planes/planjus' });
    envolver(<LoQueFalta />);
    fireEvent.click(screen.getByRole('button', { name: 'Dejar lo que falta' }));

    expect(screen.getByRole('button', { name: 'Los PLANes' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // Lo dice antes de enviar, y dice exactamente qué va.
    expect(screen.getByText(/Va con la página desde la que llegaste/)).toBeInTheDocument();
    expect(screen.getByText('/planes/planjus')).toBeInTheDocument();

    const enviado = escribirYDejar();
    expect(enviado.superficie).toBe('los-planes');
    expect(enviado.contexto).toEqual({ ruta: '/planes/planjus' });
  });

  it('entrando directo: abre en «La plataforma» y no dice ninguna página', () => {
    pararseEn('/lo-que-falta');
    envolver(<LoQueFalta />);
    fireEvent.click(screen.getByRole('button', { name: 'Dejar lo que falta' }));

    expect(screen.getByRole('button', { name: 'La plataforma' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByText(/Va con la página desde la que llegaste/)).not.toBeInTheDocument();
    expect(escribirYDejar().contexto).toEqual({ ruta: '/lo-que-falta' });
  });

  it('un estado que no es del sitio se ignora', () => {
    pararseEn('/lo-que-falta', { desde: 'https://otro.example/trampa' });
    envolver(<LoQueFalta />);
    fireEvent.click(screen.getByRole('button', { name: 'Dejar lo que falta' }));
    expect(screen.queryByText(/Va con la página desde la que llegaste/)).not.toBeInTheDocument();
    expect(escribirYDejar().contexto).toEqual({ ruta: '/lo-que-falta' });
  });
});

describe('lo que se acepta como página de origen', () => {
  it('sólo una ruta del propio sitio, sin consulta ni ancla, y que no sea esta misma', () => {
    expect(rutaDeOrigen({ desde: '/planes/planjus' })).toBe('/planes/planjus');
    expect(rutaDeOrigen({ desde: '/' })).toBe('/');
    expect(rutaDeOrigen({ desde: '/lo-que-falta' })).toBeNull();
    expect(rutaDeOrigen({ desde: '//otro.example' })).toBeNull();
    expect(rutaDeOrigen({ desde: 'https://otro.example' })).toBeNull();
    expect(rutaDeOrigen({ desde: '/verificar-email?token=abc' })).toBeNull();
    expect(rutaDeOrigen({ desde: '/planes/planjus#seccion' })).toBeNull();
    expect(rutaDeOrigen({ desde: `/${'a'.repeat(200)}` })).toBeNull();
    expect(rutaDeOrigen({ desde: 7 })).toBeNull();
    expect(rutaDeOrigen({ otra: '/planes' })).toBeNull();
    expect(rutaDeOrigen(null)).toBeNull();
    expect(rutaDeOrigen('/planes')).toBeNull();
  });

  it('la superficie sale de la ruta, y lo que no se reconoce es la plataforma', () => {
    expect(superficieDeRuta('/el-mapa')).toBe('el-mapa');
    expect(superficieDeRuta('/planes')).toBe('los-planes');
    expect(superficieDeRuta('/planes/planjus')).toBe('los-planes');
    expect(superficieDeRuta('/atlas')).toBe('los-planes');
    expect(superficieDeRuta('/ensayos/la-mesa')).toBe('la-biblioteca');
    expect(superficieDeRuta('/bitacora/quien-firma-tu-vida')).toBe('la-biblioteca');
    expect(superficieDeRuta('/manifiesto')).toBe('la-biblioteca');
    expect(superficieDeRuta('/entrenamientos/algo/leccion/2')).toBe('los-entrenamientos');
    expect(superficieDeRuta('/mi-argentina-ideal')).toBe('la-plataforma');
    // Un prefijo parecido no alcanza: `/planeshop` no es los PLANes.
    expect(superficieDeRuta('/planeshop')).toBe('la-plataforma');
    expect(superficieDeRuta('/')).toBe('la-plataforma');
  });

  it('a quien lee se le dice la página sólo cuando agrega algo', () => {
    expect(paginaDeOrigen({ ruta: '/planes/planjus' })).toBe('/planes/planjus');
    // La propia página del registro no es un origen.
    expect(paginaDeOrigen({ ruta: '/lo-que-falta' })).toBeNull();
    // El mapa ya dice su encuadre.
    expect(
      paginaDeOrigen({
        ruta: '/el-mapa#instrumento',
        encuadre: { oeste: -64, sur: -35, este: -58, norte: -31 },
      }),
    ).toBeNull();
    expect(paginaDeOrigen(null)).toBeNull();
    expect(paginaDeOrigen({})).toBeNull();
  });
});

describe('la ficha dice de dónde vino', () => {
  const FALTA: QueriesDeFaltas.FaltaPublica = {
    idPublico: 'I-031',
    origen: 'afuera',
    superficie: 'los-planes',
    titulo: 'La sección tres no dice quién paga',
    cuerpo: 'Habla de paneles ciudadanos y no dice de dónde sale la plata.',
    contexto: { ruta: '/planes/planjus' },
    severidad: null,
    estado: 'dicha',
    razon: null,
    anotadaComo: null,
    cierreUrl: null,
    firmas: 0,
    creadaEn: '2026-11-10T14:03:00.000Z',
    movidaEn: '2026-11-10T14:03:00.000Z',
  };

  it('muestra la página, como texto y no como enlace', () => {
    const { container } = envolver(<FichaDeFalta falta={FALTA} />);
    expect(screen.getByText(/Llegó desde la página/)).toBeInTheDocument();
    expect(screen.getByText('/planes/planjus')).toBeInTheDocument();
    expect(container.querySelector('a[href="/planes/planjus"]')).toBeNull();
  });

  it('una que entró por la página del registro no dice nada', () => {
    envolver(<FichaDeFalta falta={{ ...FALTA, contexto: { ruta: '/lo-que-falta' } }} />);
    expect(screen.queryByText(/Llegó desde la página/)).not.toBeInTheDocument();
  });
});
