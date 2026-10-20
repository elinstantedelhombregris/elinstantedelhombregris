import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PROVINCIAS_CANONICAS, regionDe } from '@v2/civic-core';
import { PREGUNTA_MI_ARGENTINA_IDEAL } from '@v2/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { dibujarPapelito } from '../comun/imagen-para-compartir';
import { Ver } from '../Ver';

import type * as Imagen from '../comun/imagen-para-compartir';
import type { AporteEnVision, RegionEnAporte, VisionCampana } from '@v2/shared';

vi.mock('../comun/imagen-para-compartir', async (importar) => {
  const real = await importar<typeof Imagen>();
  return { ...real, dibujarPapelito: vi.fn(() => Promise.resolve()) };
});

const CAMPANA = '3718dc73-9774-4d3b-b23d-8bf290ffec30';
const UNE = '0b7c6a52-3f5e-4f47-9d8a-1c2b3a4d5e6f';
const DIVIDE = '7e1d2c3b-4a59-4687-b6c5-d4e3f2a1b0c9';
const TUYO = '5a4b3c2d-1e0f-4a9b-8c7d-6e5f4a3b2c1d';

const regiones = (valores: Partial<Record<string, number>>): RegionEnAporte[] =>
  ['NOA', 'NEA', 'Cuyo', 'Centro', 'Buenos Aires', 'Patagonia'].map((region) => {
    const v = valores[region];
    return v === undefined
      ? { region, acuerdo: null, cuenta: false }
      : { region, acuerdo: v, cuenta: true };
  });

const aporte = (p: Partial<AporteEnVision> & Pick<AporteEnVision, 'id' | 'texto'>) =>
  ({
    provincia: 'Salta',
    tema: { clave: 'salud', etiqueta: 'Salud' },
    opiniones: 120,
    pasos: 5,
    acuerdo: 0.82,
    peor: 0.71,
    regiones: regiones({}),
    ...p,
  }) satisfies AporteEnVision;

const TEMAS = [
  'alimento',
  'vivienda',
  'trabajo',
  'cuidado',
  'salud',
  'educación',
  'ambiente',
  'movilidad',
  'seguridad',
  'cultura',
  'democracia',
  'justicia',
  'economía',
];
const etiqueta = (clave: string) => clave.charAt(0).toUpperCase() + clave.slice(1);

const queNosUne = aporte({
  id: UNE,
  texto: 'Que un turno en el hospital no tarde tres meses',
  regiones: regiones({ NOA: 0.9, NEA: 0.8, Cuyo: 0.76, Centro: 0.71, 'Buenos Aires': 0.86 }),
  miOpinion: 'acuerdo',
});
const queDivide = aporte({
  id: DIVIDE,
  texto: 'Que el tren vuelva a cada pueblo',
  tema: { clave: 'movilidad', etiqueta: 'Movilidad' },
  acuerdo: 0.55,
  peor: 0.4,
  regiones: regiones({ NEA: 0.8, 'Buenos Aires': 0.4 }),
});

function conDatos(): VisionCampana {
  return {
    campana: {
      id: CAMPANA,
      slug: 'mi-argentina-ideal',
      titulo: 'Mi Argentina ideal',
      edicion: 1,
      recibeHasta: '2027-02-28T23:59:00-03:00',
      devolucion: null,
    },
    cifras: { personas: 1234, opiniones: 5678, provincias: 18 },
    enDiscusion: 40,
    une: [queNosUne],
    primero: [{ ...queNosUne, comparaciones: 23, puntaje: 0.72 }],
    divide: [queDivide],
    temas: TEMAS.map((clave) => ({
      clave,
      etiqueta: etiqueta(clave),
      aporte: clave === 'salud' ? queNosUne : null,
    })),
    regiones: [
      { region: 'NOA', personas: 300, cuentaEn: 12 },
      { region: 'NEA', personas: 200, cuentaEn: 9 },
      { region: 'Cuyo', personas: 150, cuentaEn: 8 },
      { region: 'Centro', personas: 250, cuentaEn: 30 },
      { region: 'Buenos Aires', personas: 330, cuentaEn: 40 },
      { region: 'Patagonia', personas: null, cuentaEn: 0 },
    ],
    provincias: PROVINCIAS_CANONICAS.map((p, i) => ({
      id: i + 1,
      nombre: p.name,
      iso: p.isoCode,
      region: regionDe(p.isoCode) ?? 'NOA',
      nivel: p.name === 'Santa Cruz' ? 0 : p.name === 'Tierra del Fuego' ? 1 : 3,
      personas: p.name === 'Santa Cruz' ? 0 : p.name === 'Tierra del Fuego' ? null : 23,
    })),
    recien: [aporte({ id: 'r1', texto: 'Que el agua de la canilla se pueda tomar', opiniones: 3 })],
    tuyo: {
      id: TUYO,
      texto: 'Que mi hija pueda estudiar sin irse',
      opiniones: 41,
      acuerdos: 29,
      pasos: 5,
    },
    miRegion: 'NOA',
    calculadaEn: '2026-10-20T12:00:00-03:00',
  };
}

function enCero(): VisionCampana {
  const v = conDatos();
  return {
    ...v,
    cifras: { personas: 0, opiniones: 0, provincias: 0 },
    enDiscusion: 0,
    une: [],
    primero: [],
    divide: [],
    temas: v.temas.map((t) => ({ ...t, aporte: null })),
    regiones: v.regiones.map((r) => ({ ...r, personas: 0, cuentaEn: 0 })),
    provincias: v.provincias.map((p) => ({ ...p, nivel: 0, personas: 0 })),
    recien: [],
    tuyo: null,
    miRegion: null,
  };
}

interface Respuesta {
  status: number;
  cuerpo: unknown;
}
const llamadas: string[] = [];
let respuesta: Respuesta;

function responder(r: Respuesta) {
  respuesta = r;
}

beforeEach(() => {
  llamadas.length = 0;
  responder({ status: 200, cuerpo: { data: conDatos() } });
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-20T12:00:00-03:00'));
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      llamadas.push(url);
      return Promise.resolve(
        new Response(JSON.stringify(respuesta.cuerpo), {
          status: respuesta.status,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.mocked(dibujarPapelito).mockClear();
});

function montar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <Ver />
    </QueryClientProvider>,
  );
}

const titulo = (nombre: string) => screen.getByRole('heading', { level: 2, name: nombre });
const seccion = (nombre: string) => {
  const s = titulo(nombre).closest('section');
  if (!s) throw new Error(`falta la sección «${nombre}»`);
  return s;
};
/** Las tres cifras de la cabecera: la primera lista de definiciones de la página. */
const cifras = () =>
  screen
    .getAllByRole('definition')
    .slice(0, 3)
    .map((d) => d.textContent);

describe('Ver: la visión con datos', () => {
  it('pide la visión de la campaña nacional', async () => {
    montar();
    await screen.findByRole('heading', { level: 1 });
    expect(llamadas).toEqual(['/api/v1/vision?campana=mi-argentina-ideal']);
  });

  it('muestra las secciones en el orden de la spec, con Pasos arriba', async () => {
    montar();
    await screen.findByRole('heading', { level: 1, name: 'La Argentina que estamos imaginando' });
    const pasos = screen.getByRole('navigation', { name: 'Momentos de Mi Argentina ideal' });
    expect(within(pasos).getByRole('link', { name: /Ver/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
    const orden = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(orden).toEqual([
      'Tu aporte',
      'Lo que nos une',
      'Lo que va primero',
      'Donde no coincidimos',
      'En cada tema',
      'El país que falta',
      'Lo que recién llega',
    ]);
  });

  it('la cabecera dice la edición, los días que faltan y las tres cifras', async () => {
    montar();
    expect(
      await screen.findByText('Mi Argentina ideal · edición 1 · faltan 132 días'),
    ).toBeInTheDocument();
    expect(cifras()).toEqual(['1.234', '5.678', '18 de 24']);
  });

  it('el aporte propio lleva sus números y es privado', async () => {
    montar();
    const tuyo = (await screen.findByRole('heading', { name: 'Tu aporte' })).closest('section');
    if (!tuyo) throw new Error('falta la sección');
    expect(within(tuyo).getByText('«Que mi hija pueda estudiar sin irse»')).toBeInTheDocument();
    expect(
      within(tuyo).getByText('29 de 41 que opinaron también lo quieren · 5 pasaron'),
    ).toBeInTheDocument();
    expect(within(tuyo).getByText('Esto lo ves sólo vos.')).toBeInTheDocument();
  });

  it('lo que nos une: barra, regla, puntitos por región y la opinión propia', async () => {
    montar();
    await screen.findByRole('heading', { level: 1 });
    const une = seccion('Lo que nos une');
    expect(
      within(une).getByText('8 de cada 10 que opinaron · en la región donde menos, 7'),
    ).toBeInTheDocument();
    expect(
      within(une).getByRole('img', {
        name: 'NOA: 9 de cada 10; NEA: 8 de cada 10; Cuyo: 8 de cada 10; Centro: 7 de cada 10; Buenos Aires: 9 de cada 10; Patagonia: faltan opiniones',
      }),
    ).toBeInTheDocument();
    expect(within(une).getByText('Vos: yo también')).toBeInTheDocument();
    expect(
      within(une).getByText(/al menos 7 de cada 10 «yo también» en cada región/),
    ).toBeVisible();
    expect(within(une).getByText('faltan opiniones')).toBeInTheDocument();
  });

  it('lo que va primero, donde no coincidimos y en cada tema', async () => {
    montar();
    await screen.findByRole('heading', { level: 1 });
    expect(
      screen.getByText(
        /Cuando se compara con otro que también se quiere, va primero 7 de cada 10 veces · 23 comparaciones/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('En el NEA, 8 de cada 10. En Buenos Aires, 4.')).toBeInTheDocument();
    const temas = seccion('En cada tema');
    expect(within(temas).getAllByRole('term')).toHaveLength(13);
    expect(
      within(temas).getByText('Todavía ningún aporte de vivienda se comparte en todo el país.'),
    ).toBeInTheDocument();
    expect(
      within(temas).getByText('«Que un turno en el hospital no tarde tres meses»'),
    ).toBeInTheDocument();
  });

  it('la región de quien mira tiene su botón para completar, y sólo ella', async () => {
    montar();
    await screen.findByRole('heading', { level: 1 });
    const falta = seccion('El país que falta');
    expect(within(falta).getByText('· tu región')).toBeInTheDocument();
    const completar = within(falta).getAllByRole('link', { name: /^Completar los/ });
    expect(completar).toHaveLength(1);
    expect(completar[0]).toHaveTextContent('Completar los del NOA');
    expect(completar[0]).toHaveAttribute('href', '/mi-argentina-ideal/mirar?region=NOA');
    expect(
      within(falta).getByText('Ya cuenta en 12 de los 40 aportes que se están discutiendo.'),
    ).toBeInTheDocument();
    expect(within(falta).getByText('menos de cinco personas')).toBeInTheDocument();
  });

  it('sin región conocida, invita a decirla en Mirar y no ofrece completar', async () => {
    responder({ status: 200, cuerpo: { data: { ...conDatos(), miRegion: null } } });
    montar();
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('link', { name: /^Completar los/ })).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Contá de qué provincia sos en Mirar/ }),
    ).toHaveAttribute('href', '/mi-argentina-ideal/mirar');
  });

  it('cada aporte que nos une ofrece el paso siguiente', async () => {
    montar();
    await screen.findByRole('heading', { level: 1 });
    expect(screen.getByText('Seguí construyendo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contá cómo está hoy en tu lugar' })).toHaveAttribute(
      'href',
      '/el-mapa?participar=directo#instrumento',
    );
    expect(
      screen.getByRole('link', { name: 'Armá una propuesta con otras personas' }),
    ).toHaveAttribute('href', `/fichas/nueva?senal=${UNE}`);
    expect(screen.getByRole('link', { name: '¿Quién ya lo hace?' })).toHaveAttribute(
      'href',
      '/capacidades',
    );
  });

  it('lo que recién llega lleva a Mirar, y el pie es honesto y enlaza afuera', async () => {
    montar();
    await screen.findByRole('heading', { level: 1 });
    expect(screen.getByText('3 opiniones')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mirarlos' })).toHaveAttribute(
      'href',
      '/mi-argentina-ideal/mirar',
    );
    expect(
      screen.getByText('Esto es lo que dijeron quienes participaron. No es una encuesta del país.'),
    ).toBeVisible();
    expect(
      screen.getByText(/Una persona decidida puede responder desde dos teléfonos/),
    ).toBeVisible();
    expect(screen.getByText('Cómo se cuenta')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mirarlo con lupa/ })).toHaveAttribute(
      'href',
      `/la-radiografia?campana=${CAMPANA}`,
    );
    expect(screen.getByRole('link', { name: /devolución firmada/ })).toHaveAttribute(
      'href',
      '/sintesis-nacional',
    );
    expect(screen.getByRole('link', { name: /Campañas que quieren abrir/ })).toHaveAttribute(
      'href',
      '/campanas',
    );
  });

  it('se comparte con el aporte que más nos une', async () => {
    montar();
    expect(await screen.findByRole('button', { name: 'Compartir esta visión' })).toBeVisible();
    await waitFor(() => {
      expect(dibujarPapelito).toHaveBeenCalled();
    });
    expect(vi.mocked(dibujarPapelito).mock.calls[0]?.[1]).toEqual({
      kicker: 'La Argentina que estamos imaginando',
      texto: 'Que un turno en el hospital no tarde tres meses',
      pie: 'Mi Argentina ideal',
      llamado: '¿Y vos?',
      bajada: 'Sumá el tuyo',
    });
  });
});

describe('Ver: el mapa', () => {
  it('tiene las 24 provincias y cada una se elige con el teclado', async () => {
    montar();
    const mapa = await screen.findByRole('group', { name: /Mapa de la Argentina/ });
    const estado = () => within(seccion('El país que falta')).getByRole('status');
    const provincias = within(mapa).getAllByRole('button');
    expect(provincias).toHaveLength(24);
    for (const p of provincias) expect(p).toHaveAttribute('tabindex', '0');

    const santaCruz = within(mapa).getByRole('button', { name: /^Santa Cruz/ });
    expect(santaCruz).toHaveAttribute('stroke-dasharray', '2 2');
    fireEvent.keyDown(santaCruz, { key: 'Enter' });
    expect(estado()).toHaveTextContent(
      'Santa Cruz, en la Patagonia: todavía nadie. El silencio también es un dato.',
    );
    expect(santaCruz).toHaveAttribute('aria-pressed', 'true');

    fireEvent.keyDown(within(mapa).getByRole('button', { name: /^Tierra del Fuego/ }), {
      key: ' ',
    });
    expect(estado()).toHaveTextContent(
      'Tierra del Fuego, en la Patagonia: menos de cinco personas.',
    );

    fireEvent.click(within(mapa).getByRole('button', { name: /^Salta/ }));
    expect(estado()).toHaveTextContent('Salta, en el NOA: 23 personas.');
  });
});

describe('Ver: la base en cero', () => {
  it('dice cero, no muestra porcentajes y cada sección dice qué falta', async () => {
    responder({ status: 200, cuerpo: { data: enCero() } });
    montar();
    await screen.findByRole('heading', { level: 1 });
    const texto = document.body.textContent;
    expect(texto).not.toMatch(/%/);
    expect(texto).not.toMatch(/de cada 10 que opinaron/);
    expect(texto).not.toMatch(/Ya cuenta en/);
    expect(texto).not.toMatch(/no hay datos/i);
    expect(texto).not.toMatch(/disponible/i);
    expect(screen.queryByRole('heading', { name: 'Tu aporte' })).not.toBeInTheDocument();
    expect(cifras()).toEqual(['0', '0', '0 de 24']);
    expect(
      screen.getByText(/Todavía ningún aporte llegó: hace falta que uno junte 20/),
    ).toBeVisible();
    expect(screen.getByText(/Para ordenar hace falta comparar/)).toBeVisible();
    const sumar = screen.getAllByRole('link', { name: /Sumá el tuyo/ });
    expect(sumar.length).toBeGreaterThanOrEqual(6);
    for (const s of sumar) expect(s).toHaveAttribute('href', '/mi-argentina-ideal/imaginar');
    expect(screen.queryByRole('link', { name: 'Mirarlos' })).not.toBeInTheDocument();
  });

  it('sin aportes que nos unan, comparte la pregunta de la campaña', async () => {
    responder({ status: 200, cuerpo: { data: enCero() } });
    montar();
    await screen.findByRole('button', { name: 'Compartir esta visión' });
    await waitFor(() => {
      expect(dibujarPapelito).toHaveBeenCalled();
    });
    expect(vi.mocked(dibujarPapelito).mock.calls[0]?.[1]).toMatchObject({
      texto: PREGUNTA_MI_ARGENTINA_IDEAL,
    });
  });
});

describe('Ver: cuando la visión no llega', () => {
  it('si la campaña no existe, invita a escribir sin pedir perdón', async () => {
    responder({
      status: 404,
      cuerpo: { error: { code: 'NOT_FOUND', message: 'No existe esa campaña.' } },
    });
    montar();
    expect(await screen.findByText(/todavía no abrió su primera edición/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sumá el tuyo/ })).toBeInTheDocument();
  });

  it('si falla la red, dice qué pasó y deja reintentar', async () => {
    responder({ status: 500, cuerpo: { error: { code: 'X', message: 'falló' } } });
    montar();
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos traer la visión');
    responder({ status: 200, cuerpo: { data: conDatos() } });
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'La Argentina que estamos imaginando' }),
    ).toBeInTheDocument();
  });
});
