import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LaRadiografia } from '../../LaRadiografia';
import { LENTES_DEL_CIELO } from '../lentes';
import {
  fraseCorta,
  NOMBRE_DE_CLASE,
  resumenDelCielo,
  type NucleoEnPantalla,
} from '../radiografia-data';
import { ControlesAnalisis } from '../sections/ControlesAnalisis';
import { SelectorDelCielo } from '../sections/SelectorDelCielo';

import type * as ConsultasDeRadiografia from '~/lib/queries/radiografia';

import { CLASE_ROTULO } from '~/lib/vocabulario';

type RadiografiaPublica = ConsultasDeRadiografia.RadiografiaPublica;

let respuesta: {
  data: RadiografiaPublica | undefined;
  isLoading: boolean;
  isError: boolean;
} = { data: undefined, isLoading: false, isError: false };

vi.mock('~/lib/queries/radiografia', async (original) => {
  const real = await original<typeof ConsultasDeRadiografia>();
  return { ...real, useRadiografia: () => respuesta };
});
vi.mock('~/lib/queries/fichas', () => ({
  useFichas: () => ({ data: { fichas: [], total: 0 }, isLoading: false, isError: false }),
}));
vi.mock('~/lib/queries/participacion', () => ({
  useDisenoFicha: () => ({ data: undefined, isLoading: false, isError: false }),
  useCampanas: () => ({ data: [] }),
  useOperacionPersonal: () => ({
    isPending: false,
    isSuccess: false,
    error: null,
    mutate: vi.fn(),
  }),
}));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('~/lib/api', () => ({ api: { get: vi.fn().mockResolvedValue({}) } }));
vi.mock('~/lib/queries/open-data', () => ({ useProvincias: () => ({ data: [] }) }));

const nodo = (id: string, clase: string) => ({ id, clase, x: 0, y: 0, z: 0 });
const CORPUS: RadiografiaPublica = {
  corte: '2026-08-13T04:12:00.000Z',
  modelo: 'bge-m3',
  analizadas: 5,
  sinVector: 0,
  total: 5,
  provinciasSinSenal: 19,
  umbral: 0.72,
  nucleos: [
    {
      id: 'deseos',
      frase: { id: 'd1', texto: 'Que el colectivo pase de noche' },
      textoOmitido: null,
      senales: 3,
      clases: { deseo: 3 },
      provincias: 2,
      distancia: null,
      miembros: [nodo('d1', 'deseo'), nodo('d2', 'deseo'), nodo('d3', 'deseo')],
    },
    {
      id: 'hechos',
      frase: { id: 'h1', texto: 'La salita cerró en marzo' },
      textoOmitido: null,
      senales: 2,
      clases: { hecho: 2 },
      provincias: 1,
      distancia: null,
      miembros: [nodo('h1', 'hecho'), nodo('h2', 'hecho')],
    },
  ],
  solas: [],
  aristas: [{ a: 'd1', b: 'd2', similitud: 0.88, tipo: 'medida' }],
  regimenDegenerado: null,
};
const VACIA: RadiografiaPublica = {
  ...CORPUS,
  corte: null,
  modelo: null,
  analizadas: 0,
  sinVector: 0,
  total: 0,
  provinciasSinSenal: 24,
  nucleos: [],
  aristas: [],
};

function montar(nodoReact: React.ReactNode) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {nodoReact}
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/la-radiografia');
  respuesta = { data: CORPUS, isLoading: false, isError: false };
});

describe('La Radiografía dice qué es y qué no es', () => {
  it('abre con la bajada llana, sin imperativos ni aforismo', () => {
    const { container } = montar(<LaRadiografia />);
    expect(
      screen.getByText(
        'La Radiografía agrupa los aportes según qué tan parecido es su texto. No es una encuesta ni dice qué piensa el país.',
      ),
    ).toBeVisible();
    expect(container.textContent).not.toMatch(
      /Encontrá patrones|Separá diferencias|se entiende cuando/,
    );
  });

  it('«converger no es corroborar» va arriba del primer gráfico, a la vista y fuera de un <details>', () => {
    const { container } = montar(<LaRadiografia />);
    const aviso = screen.getByText(
      'Que muchos aportes digan lo mismo no prueba que sea cierto. Contamos aportes, no personas.',
    );
    expect(aviso).toBeVisible();
    // Ni plegado ni escondido en algún ancho.
    expect(aviso.closest('details')).toBeNull();
    expect(aviso.className).not.toMatch(/sr-only|\bhidden\b|max-\[\d+px\]:hidden/);
    // Ni chico: era un renglón de 14 px.
    expect(aviso.className).not.toMatch(/text-(sm|xs|\[1[0-4]px\])/);
    // Y está antes que el primer gráfico en el orden del documento.
    const todo = [...container.querySelectorAll('*')];
    expect(todo.indexOf(aviso)).toBeLessThan(todo.indexOf(screen.getByTestId('constelacion')));
  });

  it('vuelve la leyenda «Cómo leer el cielo», con los nombres de clase de todo el sitio', () => {
    montar(<LaRadiografia />);
    const leyenda = screen.getByRole('region', { name: 'Cómo leer el cielo' });
    expect(within(leyenda).getByText('un aporte')).toBeInTheDocument();
    expect(within(leyenda).getByText('un grupo')).toBeInTheDocument();
    for (const rotulo of Object.values(CLASE_ROTULO)) {
      expect(leyenda).toHaveTextContent(rotulo);
    }
    expect(leyenda.textContent).not.toMatch(
      /núcleo|racimo|señal|\bHecho\b|\bDeseo\b|\bActo\b|\bMeta\b/,
    );
  });

  it('la Radiografía y el mapa nombran las clases igual', () => {
    expect(NOMBRE_DE_CLASE).toBe(CLASE_ROTULO);
  });

  it('«Ver de noche» queda después de los accesos de verdad', () => {
    montar(<LaRadiografia />);
    const recorrido = screen.getByRole('navigation', { name: 'Recorrido de Radiografía' });
    const nombres = [...recorrido.querySelectorAll('a, button')].map((a) => a.textContent);
    expect(nombres.at(-1)).toBe('Ver de noche');
    expect(nombres.indexOf('Explorar un ejemplo →')).toBeLessThan(nombres.indexOf('Ver de noche'));
    // Y no es lo primero que se encuentra la persona en la pantalla.
    expect(
      screen
        .getByRole('heading', { level: 1 })
        .compareDocumentPosition(screen.getByRole('button', { name: 'Ver de noche' })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe('las tres vistas del cielo', () => {
  it('se llaman Líneas · Grupos · Por tipo, y el nombre accesible es el texto visible', () => {
    montar(<LaRadiografia />);
    expect(LENTES_DEL_CIELO.map((l) => l.titulo)).toEqual(['Líneas', 'Grupos', 'Por tipo']);
    const vistas = screen.getByRole('group', { name: 'Cómo ver los aportes' });
    for (const boton of within(vistas).getAllByRole('button')) {
      expect(boton).not.toHaveAttribute('aria-label');
      // El número «01» es decorativo: queda fuera del nombre (WCAG 2.5.3).
      expect(boton).toHaveAccessibleName(boton.textContent.replace(/^0\d/, ''));
    }
  });

  it('el resumen dice «{n} aportes · {g} grupos · {s} sin grupo», con el cero en palabras', () => {
    montar(<LaRadiografia />);
    expect(screen.getByText('5 aportes · 2 grupos · ninguno sin grupo')).toBeInTheDocument();
    expect(resumenDelCielo(412, 9, 37)).toBe('412 aportes · 9 grupos · 37 sin grupo');
    expect(resumenDelCielo(1, 1, 1)).toBe('1 aporte · 1 grupo · 1 sin grupo');
    expect(resumenDelCielo(0, 0, 0)).toBe('ningún aporte · ningún grupo · ninguno sin grupo');
  });

  it('explica el tamaño y rotula lo que no tiene grupo', () => {
    respuesta = {
      data: { ...CORPUS, solas: [nodo('s1', 'meta')] },
      isLoading: false,
      isError: false,
    };
    const { container } = montar(<LaRadiografia />);
    expect(container.textContent).toContain(
      'El tamaño marca cuántos aportes tiene el grupo, no cuánto importa.',
    );
    expect(container.textContent).toContain('Sin grupo (la posición solo acomoda)');
  });

  it('el lienzo deja pasar el scroll vertical del teléfono y la pista queda afuera de él', () => {
    montar(<LaRadiografia />);
    const lienzo = screen.getByTestId('constelacion');
    expect(lienzo.className).toContain('touch-pan-y');
    expect(lienzo.className).not.toContain('touch-none');
    const pista = screen.getByText(/Arrastrá para/);
    expect(lienzo.parentElement?.contains(pista)).toBe(false);
    expect(pista.closest('p')?.className).not.toMatch(/\babsolute\b/);
  });

  it('la columna de «Volver a un aporte» no se estira hasta la altura del lienzo', () => {
    montar(<LaRadiografia />);
    const titulo = screen.getByText('Volver a un aporte');
    // El contenedor de la columna tiene `self-start`: queda del alto de su contenido.
    expect(titulo.closest('.self-start')).not.toBeNull();
  });
});

describe('el selector de grupos muestra qué dice cada uno', () => {
  const grupo = (id: string, texto: string | null, aportes: number): NucleoEnPantalla => ({
    id,
    frase: texto === null ? null : { id: `${id}-f`, texto },
    textoOmitido: texto === null ? 'sin cesión de licencia' : null,
    senales: aportes,
    clases: { deseo: aportes },
    provincias: 2,
    distancia: null,
    miembros: [],
  });

  it('cada botón lleva su frase del centro (≤80 caracteres) y sus conteos, no seis iguales', () => {
    const larga =
      'Que el transporte público llegue hasta los barrios del fondo y no deje a nadie caminando de noche por la ruta';
    const { container } = montar(
      <SelectorDelCielo
        nucleos={[grupo('a', 'Falta agua', 2), grupo('b', larga, 5), grupo('c', null, 1)]}
        solas={[]}
        enfocado={null}
        seleccionado={null}
        tema="papel"
        elegirFuente={vi.fn()}
        elegirNucleo={vi.fn()}
      />,
    );
    const botones = within(screen.getByRole('group', { name: 'Seleccionar grupo' })).getAllByRole(
      'button',
    );
    const [agua, transporte, reservado] = botones;
    expect(agua).toHaveTextContent('«Falta agua»');
    expect(agua).toHaveTextContent('2 aportes · 2 provincias');
    expect(transporte?.textContent).toContain('…');
    const frase = /«(.*)»/.exec(transporte?.textContent ?? '')?.[1] ?? '';
    expect(frase.length).toBeLessThanOrEqual(80);
    expect(reservado).toHaveTextContent('Texto reservado');
    expect(reservado).toHaveTextContent('1 aporte · 2 provincias');
    expect(new Set(botones.slice(0, 3).map((b) => b.textContent)).size).toBe(3);
    expect(container.textContent).not.toMatch(/señales|núcleo|voz sola/i);
  });

  it('fraseCorta corta en una palabra entera y no inventa texto', () => {
    expect(fraseCorta('Corta')).toBe('Corta');
    const cortada = fraseCorta('palabra '.repeat(30), 80);
    expect(cortada.length).toBeLessThanOrEqual(80);
    expect(cortada.endsWith('…')).toBe(true);
    expect(
      cortada
        .replace('…', '')
        .trim()
        .split(' ')
        .every((p) => p === 'palabra'),
    ).toBe(true);
  });
});

describe('la página vacía cuenta su vacío una sola vez', () => {
  it('un estado central, sin ceros y sin repetir «todavía no corrió» en la cabecera', () => {
    respuesta = { data: VACIA, isLoading: false, isError: false };
    const { container } = montar(<LaRadiografia />);
    expect(screen.getByText('Todavía no hay un análisis.')).toBeVisible();
    const cabecera = screen.getByRole('region', { name: 'De dónde sale lo que se ve acá' });
    // Queda la celda que nunca se va (qué mide esto) y nada más.
    expect(cabecera).toHaveTextContent('Qué mide esto');
    expect(cabecera.textContent).not.toMatch(/Último análisis|analizados|Provincias sin aportes/);
    expect(container.textContent).not.toMatch(/nadie midió nada|Todavía no corrió/);
    // Ni un cero en dígitos en toda la página.
    expect(container.textContent).not.toMatch(/(^|[^\d.,])0(?![\d.,])/);
  });
});

describe('iniciar sesión desde el análisis vuelve al análisis', () => {
  it('el enlace «Ingresar para guardar análisis» devuelve a la página desde donde se pidió', () => {
    window.history.replaceState(null, '', '/la-radiografia?tema=agua');
    montar(<ControlesAnalisis filtros={{}} cambiar={vi.fn()} corte={null} />);
    expect(screen.getByRole('link', { name: 'Ingresar para guardar análisis' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Fla-radiografia%3Ftema%3Dagua',
    );
  });

  it('es papel aunque la página esté de noche: declara el esquema claro para sus controles', () => {
    montar(<ControlesAnalisis filtros={{}} cambiar={vi.fn()} corte={null} />);
    expect(screen.getByLabelText('Elegir el alcance del análisis')).toHaveClass(
      '[color-scheme:light]',
      'accent-violeta',
    );
  });

  it('el filtro de tipo se llama tipo y el lugar se llama lugar', () => {
    montar(<ControlesAnalisis filtros={{}} cambiar={vi.fn()} corte={null} />);
    expect(screen.getByLabelText('Tipo de aporte')).toBeInTheDocument();
    expect(screen.getByText('Lugar')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Todos los aportes elegibles' })).toBeInTheDocument();
  });
});
