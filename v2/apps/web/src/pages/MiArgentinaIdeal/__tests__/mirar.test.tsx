import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { clavePar } from '@v2/civic-core';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';

import { Mirar } from '../Mirar';

import type * as Imagen from '../comun/imagen-para-compartir';
import type { EstadoEnLaPila, TandaPila, TarjetaPila } from '@v2/shared';
import type * as FramerMotion from 'framer-motion';

import { recordarProvincia } from '~/lib/queries/pila';

vi.mock('../mirar/tiempos', () => ({
  TIEMPOS: { vuelo: 5, desvanecer: 5, duelo: 5, gracias: 5 },
}));
const movimiento = vi.hoisted(() => ({ reducido: false }));
vi.mock('framer-motion', async (importar) => {
  const real = await importar<typeof FramerMotion>();
  return { ...real, useReducedMotion: () => movimiento.reducido };
});
vi.mock('../comun/imagen-para-compartir', async (importar) => {
  const real = await importar<typeof Imagen>();
  return { ...real, dibujarPapelito: vi.fn(() => Promise.resolve()) };
});

/* ─────────────────────────── La red, simulada ─────────────────────────── */

interface Pedido {
  metodo: string;
  ruta: string;
  cuerpo: unknown;
}

function respuesta(status: number, data?: unknown): Response {
  const ok = status >= 200 && status < 300;
  return {
    ok,
    status,
    json: () =>
      data === undefined
        ? Promise.reject(new SyntaxError('sin cuerpo'))
        : Promise.resolve(ok ? { data } : data),
  } as unknown as Response;
}

let pedidos: Pedido[] = [];
let tandas: TandaPila[] = [];
let alOpinar: (p: Pedido) => Response = () =>
  respuesta(200, { coinciden: 3, regionCompleta: null });

const PROVINCIAS = [
  { id: 17, name: 'Salta', isoCode: 'AR-A' },
  { id: 2, name: 'Ciudad Autónoma de Buenos Aires', isoCode: 'AR-C' },
];

function servir(ruta: string, init?: RequestInit): Promise<Response> {
  const metodo = init?.method ?? 'GET';
  const cuerpo = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined;
  const p = { metodo, ruta, cuerpo };
  pedidos.push(p);
  if (ruta === '/api/v1/pila/tandas') {
    const tanda = tandas.shift();
    return Promise.resolve(
      tanda
        ? respuesta(200, tanda)
        : respuesta(404, {
            error: {
              code: 'CAMPANA_NO_DISPONIBLE',
              message: 'Mi Argentina ideal todavía no está abierta.',
            },
          }),
    );
  }
  if (ruta.startsWith('/api/v1/pila/opiniones/')) return Promise.resolve(alOpinar(p));
  if (ruta === '/api/v1/pila/duelos') return Promise.resolve(respuesta(204));
  if (ruta.startsWith('/api/v1/pila/reportes/'))
    return Promise.resolve(respuesta(202, { recibido: true }));
  if (ruta === '/api/open-data/provinces')
    return Promise.resolve(respuesta(200, { provinces: PROVINCIAS }));
  return Promise.resolve(respuesta(404, { error: { code: 'NO', message: 'No está.' } }));
}

const deRuta = (prefijo: string) => pedidos.filter((p) => p.ruta.startsWith(prefijo));
const opiniones = () => deRuta('/api/v1/pila/opiniones/');

/* ─────────────────────────── Los datos ─────────────────────────── */

const idDe = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const tarjeta = (n: number, extra: Partial<TarjetaPila> = {}): TarjetaPila => ({
  id: idDe(n),
  texto: `Aporte ${n}`,
  origen: null,
  provincia: { id: 17, nombre: 'Salta' },
  tema: { clave: 'salud', etiqueta: 'Salud' },
  ...extra,
});
const tandaDe = (cuantas: number, estado: Partial<EstadoEnLaPila> = {}): TandaPila => ({
  tarjetas: Array.from({ length: cuantas }, (_, i) => tarjeta(i + 1)),
  estado: {
    provincia: { id: 17, nombre: 'Salta' },
    preguntarProvincia: false,
    yaAporto: true,
    paresComparados: [],
    acuerdos: [],
    ...estado,
  },
});

function montar(url = '/mi-argentina-ideal/mirar', { estricto = false } = {}) {
  window.history.replaceState(null, '', url);
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const pagina = (
    <QueryClientProvider client={cliente}>
      <Router>
        <Mirar />
      </Router>
    </QueryClientProvider>
  );
  return render(estricto ? <StrictMode>{pagina}</StrictMode> : pagina);
}

const tarjetaN = (n: number) =>
  screen.findByRole('button', { name: new RegExp(`«Aporte ${n}»\\. Enter`) });
const tocar = (rotulo: string) => {
  fireEvent.click(screen.getByRole('button', { name: rotulo }));
};
/** Contesta la tarjeta `n` con un botón y espera a que aparezca lo siguiente. */
async function contestar(n: number, rotulo: 'Yo no' | 'Paso' | 'Yo también') {
  await tarjetaN(n);
  tocar(rotulo);
  await waitFor(() => {
    expect(screen.queryByRole('button', { name: new RegExp(`«Aporte ${n}»\\. Enter`) })).toBeNull();
  });
}

beforeEach(() => {
  pedidos = [];
  tandas = [];
  movimiento.reducido = false;
  alOpinar = () => respuesta(200, { coinciden: 3, regionCompleta: null });
  recordarProvincia(undefined);
  document.cookie = 'eihg_csrf=prueba';
  vi.stubGlobal('fetch', vi.fn(servir));
});
afterEach(() => {
  vi.unstubAllGlobals();
});

/* ─────────────────────────── Las pruebas ─────────────────────────── */

describe('Mirar', () => {
  it('cada botón manda su valor, y las flechas también', async () => {
    tandas = [tandaDe(6)];
    montar();
    await contestar(1, 'Yo no');
    await contestar(2, 'Paso');
    await contestar(3, 'Yo también');
    for (const [n, tecla] of [
      [4, 'ArrowLeft'],
      [5, 'ArrowDown'],
      [6, 'ArrowRight'],
    ] as const) {
      fireEvent.keyDown(await tarjetaN(n), { key: tecla });
      await waitFor(() => {
        expect(opiniones()).toHaveLength(n);
      });
    }
    expect(opiniones().map((p) => [p.metodo, p.ruta, p.cuerpo])).toEqual([
      ['PUT', `/api/v1/pila/opiniones/${idDe(1)}`, { valor: 'desacuerdo', provinciaId: 17 }],
      ['PUT', `/api/v1/pila/opiniones/${idDe(2)}`, { valor: 'paso', provinciaId: 17 }],
      ['PUT', `/api/v1/pila/opiniones/${idDe(3)}`, { valor: 'acuerdo', provinciaId: 17 }],
      ['PUT', `/api/v1/pila/opiniones/${idDe(4)}`, { valor: 'desacuerdo', provinciaId: 17 }],
      ['PUT', `/api/v1/pila/opiniones/${idDe(5)}`, { valor: 'paso', provinciaId: 17 }],
      ['PUT', `/api/v1/pila/opiniones/${idDe(6)}`, { valor: 'acuerdo', provinciaId: 17 }],
    ]);
  });

  it('el duelo aparece después de la cuarta respuesta con dos acuerdos', async () => {
    tandas = [tandaDe(6)];
    montar();
    await contestar(1, 'Yo también');
    await contestar(2, 'Yo también');
    await contestar(3, 'Yo no');
    await contestar(4, 'Yo no');
    expect(await screen.findByRole('heading', { name: '¿Cuál va primero?' })).toBeInTheDocument();
  });

  it('con un solo acuerdo no hay duelo', async () => {
    tandas = [tandaDe(6)];
    montar();
    await contestar(1, 'Yo también');
    await contestar(2, 'Yo no');
    await contestar(3, 'Yo no');
    await contestar(4, 'Paso');
    await tarjetaN(5);
    expect(screen.queryByRole('heading', { name: '¿Cuál va primero?' })).toBeNull();
  });

  it('un par que ya se comparó en otra visita no vuelve a duelo', async () => {
    tandas = [tandaDe(6, { paresComparados: [clavePar(idDe(1), idDe(2))] })];
    montar();
    await contestar(1, 'Yo también');
    await contestar(2, 'Yo también');
    await contestar(3, 'Yo no');
    await contestar(4, 'Yo no');
    await tarjetaN(5);
    expect(screen.queryByRole('heading', { name: '¿Cuál va primero?' })).toBeNull();
  });

  it('elegir en el duelo manda el par correcto y sigue solo', async () => {
    tandas = [tandaDe(6)];
    montar();
    await contestar(1, 'Yo también');
    await contestar(2, 'Yo también');
    await contestar(3, 'Paso');
    await contestar(4, 'Paso');
    fireEvent.click(await screen.findByRole('button', { name: 'Elegir primero: «Aporte 1»' }));
    await tarjetaN(5);
    expect(deRuta('/api/v1/pila/duelos').map((p) => [p.metodo, p.cuerpo])).toEqual([
      ['PUT', { a: idDe(1), b: idDe(2), primero: idDe(1) }],
    ]);
  });

  it('en el duelo, la barra espaciadora es «por igual»', async () => {
    tandas = [tandaDe(6)];
    montar();
    await contestar(1, 'Yo también');
    await contestar(2, 'Yo también');
    await contestar(3, 'Paso');
    await contestar(4, 'Paso');
    const titulo = await screen.findByRole('heading', { name: '¿Cuál va primero?' });
    const duelo = titulo.closest<HTMLElement>('[data-foco]');
    expect(duelo).not.toBeNull();
    if (duelo) fireEvent.keyDown(duelo, { key: ' ' });
    await tarjetaN(5);
    expect(deRuta('/api/v1/pila/duelos')[0]?.cuerpo).toEqual({
      a: idDe(1),
      b: idDe(2),
      primero: null,
    });
  });

  it('la tarjeta de escribir aparece en el sexto lugar si no aportó', async () => {
    tandas = [tandaDe(8, { yaAporto: false })];
    montar();
    for (const n of [1, 2, 3, 4, 5]) await contestar(n, 'Yo no');
    expect(await screen.findByText('Te toca')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Escribir el mío' })).toHaveAttribute(
      'href',
      '/mi-argentina-ideal/imaginar?volver=mirar',
    );
    tocar('Saltear por ahora');
    await tarjetaN(6);
  });

  it('la tarjeta de escribir no aparece si ya aportó', async () => {
    tandas = [tandaDe(8, { yaAporto: true })];
    montar();
    for (const n of [1, 2, 3, 4, 5]) await contestar(n, 'Yo no');
    await tarjetaN(6);
    expect(screen.queryByText('Te toca')).toBeNull();
  });

  it('la tarjeta de escribir no aparece si llegó desde Imaginar', async () => {
    tandas = [tandaDe(8, { yaAporto: false })];
    montar('/mi-argentina-ideal/mirar?desde=imaginar');
    for (const n of [1, 2, 3, 4, 5]) await contestar(n, 'Yo no');
    await tarjetaN(6);
    expect(screen.queryByText('Te toca')).toBeNull();
  });

  it('la tanda vacía muestra que todavía no hay aportes de otras personas', async () => {
    tandas = [tandaDe(0, { yaAporto: false })];
    montar();
    expect(
      await screen.findByRole('heading', {
        name: 'Todavía nadie más publicó su aporte en Mi Argentina ideal.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Escribir el mío' })).toBeInTheDocument();
  });

  it('vacía y con su aporte publicado, invita a otras personas', async () => {
    tandas = [tandaDe(0, { yaAporto: true })];
    montar();
    expect(
      await screen.findByRole('button', { name: 'Invitar a otras personas' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Escribir el mío' })).toBeNull();
  });

  it('el fin de tanda no pide otra solo', async () => {
    tandas = [tandaDe(2), tandaDe(1)];
    montar();
    await contestar(1, 'Yo también');
    await contestar(2, 'Yo no');
    expect(await screen.findByRole('heading', { name: 'Listo. Miraste 2.' })).toBeInTheDocument();
    expect(screen.getByText('Dijiste yo también a 1.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver cómo se va armando →' })).toHaveAttribute(
      'href',
      '/mi-argentina-ideal',
    );
    await new Promise((ok) => setTimeout(ok, 40));
    expect(deRuta('/api/v1/pila/tandas')).toHaveLength(1);
    tocar('Otra tanda');
    await tarjetaN(1);
    expect(deRuta('/api/v1/pila/tandas')).toHaveLength(2);
  });

  it('el aviso de región completa le gana al de coincidencias', async () => {
    alOpinar = () => respuesta(200, { coinciden: 7, regionCompleta: { region: 'NOA' } });
    tandas = [tandaDe(3)];
    montar();
    await contestar(1, 'Yo también');
    expect(
      await screen.findByText('Con tu respuesta, el NOA ya cuenta en este aporte.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Vos y 7 personas más.')).toBeNull();
  });

  it('después de contestar dice cuántas personas más dijeron lo mismo', async () => {
    alOpinar = () => respuesta(200, { coinciden: 7, regionCompleta: null });
    tandas = [tandaDe(3)];
    montar();
    await contestar(1, 'Yo también');
    expect(await screen.findByText('Vos y 7 personas más.')).toBeInTheDocument();
  });

  it('un error al opinar deja la respuesta en la cola y avisa', async () => {
    alOpinar = () =>
      respuesta(403, { error: { code: 'CSRF_INVALIDO', message: 'Recargá la página.' } });
    tandas = [tandaDe(3)];
    montar();
    await contestar(1, 'Yo también');
    expect(await screen.findByRole('alert')).toHaveTextContent('Tu última respuesta no se guardó.');
    await tarjetaN(2);
    alOpinar = () => respuesta(200, { coinciden: 0, regionCompleta: null });
    tocar('Reintentar');
    await waitFor(() => {
      expect(screen.queryByText('Tu última respuesta no se guardó.')).toBeNull();
    });
    expect(opiniones().map((p) => p.ruta)).toEqual([
      `/api/v1/pila/opiniones/${idDe(1)}`,
      `/api/v1/pila/opiniones/${idDe(1)}`,
    ]);
  });

  it('reportar pasa a la siguiente sin contestarla', async () => {
    tandas = [tandaDe(3)];
    montar();
    fireEvent.click(await tarjetaN(1));
    const hoja = await screen.findByRole('dialog');
    fireEvent.click(within(hoja).getByRole('button', { name: 'Reportar este aporte' }));
    fireEvent.click(within(hoja).getByRole('button', { name: 'Enviar reporte' }));
    expect(within(hoja).getByRole('alert')).toHaveTextContent('Elegí un motivo.');
    fireEvent.click(within(hoja).getByLabelText('Insulta a alguien'));
    fireEvent.click(within(hoja).getByRole('button', { name: 'Enviar reporte' }));
    expect(
      await within(hoja).findByText('Gracias. Lo vamos a tener en cuenta.'),
    ).toBeInTheDocument();
    await tarjetaN(2);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opiniones()).toHaveLength(0);
    expect(deRuta('/api/v1/pila/reportes/').map((p) => [p.ruta, p.cuerpo])).toEqual([
      [`/api/v1/pila/reportes/${idDe(1)}`, { motivo: 'insulta' }],
    ]);
  });

  it('al abrir el reporte el foco va al primer motivo, y Escape cierra desde cualquier lado', async () => {
    tandas = [tandaDe(3)];
    montar();
    fireEvent.click(await tarjetaN(1));
    const hoja = await screen.findByRole('dialog');
    fireEvent.click(within(hoja).getByRole('button', { name: 'Reportar este aporte' }));
    expect(within(hoja).getByLabelText('Insulta a alguien')).toHaveFocus();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(deRuta('/api/v1/pila/reportes/')).toHaveLength(0);
  });

  it('Enter abre el aporte entero, con lo que escribió completo', async () => {
    tandas = [{ ...tandaDe(1), tarjetas: [tarjeta(1, { origen: 'Lo que escribí, completo.' })] }];
    montar();
    fireEvent.keyDown(await tarjetaN(1), { key: 'Enter' });
    const hoja = await screen.findByRole('dialog');
    expect(within(hoja).getByText('Lo que escribió completo')).toBeInTheDocument();
    expect(within(hoja).getByText('Lo que escribí, completo.')).toBeInTheDocument();
    fireEvent.click(within(hoja).getByRole('button', { name: 'Volver a la tarjeta' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opiniones()).toHaveLength(0);
  });

  it('con movimiento reducido no hay transformación de vuelo: se desvanece', async () => {
    movimiento.reducido = true;
    tandas = [tandaDe(2)];
    montar();
    const carta = await tarjetaN(1);
    tocar('Yo también');
    expect(carta).toHaveAttribute('data-vuelo', 'desvanece');
    expect(carta.style.transform).not.toMatch(/translate/);
    await tarjetaN(2);
  });

  it('sin movimiento reducido, la tarjeta vuela', async () => {
    tandas = [tandaDe(2)];
    montar();
    const carta = await tarjetaN(1);
    tocar('Yo también');
    expect(carta).toHaveAttribute('data-vuelo', 'vuela');
  });

  it('pregunta la provincia antes del primer aporte y la manda con cada opinión', async () => {
    tandas = [tandaDe(2, { provincia: null, preguntarProvincia: true })];
    montar();
    expect(
      await screen.findByRole('heading', { name: '¿De qué provincia sos?' }),
    ).toBeInTheDocument();
    tocar('Empezar a mirar');
    expect(screen.getByRole('alert')).toHaveTextContent('Elegí tu provincia');
    await screen.findByRole('option', { name: 'Salta' });
    fireEvent.change(screen.getByLabelText('Tu provincia'), { target: { value: '17' } });
    tocar('Empezar a mirar');
    await contestar(1, 'Yo también');
    expect(opiniones()[0]?.cuerpo).toEqual({ valor: 'acuerdo', provinciaId: 17 });
  });

  it('desde Ver, con ?provincia=elegir, la vuelve a preguntar aunque ya haya contestado', async () => {
    tandas = [tandaDe(2, { provincia: null, preguntarProvincia: false })];
    montar('/mi-argentina-ideal/mirar?provincia=elegir');
    expect(
      await screen.findByRole('heading', { name: '¿De qué provincia sos?' }),
    ).toBeInTheDocument();
  });

  it('«Prefiero no decirlo» manda las opiniones sin provincia', async () => {
    tandas = [tandaDe(2, { provincia: null, preguntarProvincia: true })];
    montar();
    await screen.findByRole('heading', { name: '¿De qué provincia sos?' });
    tocar('Prefiero no decirlo');
    await contestar(1, 'Paso');
    expect(opiniones()[0]?.cuerpo).toEqual({ valor: 'paso', provinciaId: null });
  });

  it('«Completar los de tu región» pide la tanda con la región', async () => {
    tandas = [tandaDe(1)];
    montar('/mi-argentina-ideal/mirar?region=Patagonia');
    await tarjetaN(1);
    expect(deRuta('/api/v1/pila/tandas')[0]?.cuerpo).toEqual({ priorizarRegion: 'Patagonia' });
  });

  it('una región que no existe no se manda', async () => {
    tandas = [tandaDe(1)];
    montar('/mi-argentina-ideal/mirar?region=Marte');
    await tarjetaN(1);
    expect(deRuta('/api/v1/pila/tandas')[0]?.cuerpo).toEqual({});
  });

  it('en StrictMode pide una sola tanda y la muestra', async () => {
    tandas = [tandaDe(2)];
    montar('/mi-argentina-ideal/mirar', { estricto: true });
    await tarjetaN(1);
    expect(deRuta('/api/v1/pila/tandas')).toHaveLength(1);
  });

  it('si la tanda no llega, dice por qué y deja probar de nuevo', async () => {
    tandas = [];
    montar();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Mi Argentina ideal todavía no está abierta.',
    );
    tandas = [tandaDe(1)];
    tocar('Probar de nuevo');
    await tarjetaN(1);
  });

  it('arriba están los tres momentos, con Mirar marcado', async () => {
    tandas = [tandaDe(1)];
    montar();
    await tarjetaN(1);
    const pasos = screen.getByRole('navigation', { name: 'Momentos de Mi Argentina ideal' });
    expect(within(pasos).getByRole('link', { name: /Mirar/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });
});
