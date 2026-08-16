import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LaRadiografia } from '../../LaRadiografia';
import {
  colorDeClase,
  guardarTema,
  leerTema,
  ordenarNucleos,
  rotuloDeNucleo,
  type NucleoEnPantalla,
} from '../radiografia-data';
import { construirVista } from '../radiografia-vista';
import { CabeceraProcedencia } from '../sections/CabeceraProcedencia';
import { CieloVacio } from '../sections/CieloVacio';
import { Constelacion } from '../sections/Constelacion';
import { FichaDeNucleo } from '../sections/FichaDeNucleo';
import { ListaDeNucleos } from '../sections/ListaDeNucleos';

import type * as ConsultasDeRadiografia from '~/lib/queries/radiografia';

import { GRIS_DEL_TEMA } from '~/components/mapa/pintor-senales';
import { esRutaPapel } from '~/layouts/papel-routes';

type MiembroDeNucleo = ConsultasDeRadiografia.MiembroDeNucleo;
type RadiografiaPublica = ConsultasDeRadiografia.RadiografiaPublica;

/**
 * La Radiografía — lo que la spec promete en pantalla
 * (`docs/specs/2026-08-12-la-radiografia.md`).
 *
 * Todo esto corre contra **dato simulado con la forma exacta del contrato**, y
 * no contra un servidor. Se escribió antes de que el endpoint existiera y se
 * queda así a propósito: la página no puede depender de que haya base con
 * datos para poder verificarse, y si algún día el servidor y la página dejan
 * de encajar, el contrato de acá es la referencia escrita de cuál de las dos
 * se movió.
 *
 * Las afirmaciones que se verifican son sobre el producto, no sobre React:
 *
 *   1. un núcleo de `deseo` NO se ve ni se lee como uno de `hecho` (§3.1, R9);
 *   2. un núcleo mixto no se resuelve por mayoría;
 *   3. la cabecera de procedencia dice las cuatro cosas de la regla 5 (§3.2);
 *   4. el vacío invita sin disculparse y se desarma solo (§6);
 *   5. la lista es una `<table>` de verdad, el camino accesible (R11);
 *   6. mover el umbral recalcula con el mismo motor que usó el servidor.
 */

/** El hook se sustituye por esta caja: la página no habla con ningún servidor. */
let respuesta: {
  data: RadiografiaPublica | undefined;
  isLoading: boolean;
  isError: boolean;
} = { data: undefined, isLoading: false, isError: false };

vi.mock('~/lib/queries/radiografia', async (original) => {
  const real = await original<typeof ConsultasDeRadiografia>();
  return { ...real, useRadiografia: () => respuesta };
});

const nodo = (id: string, clase: string): MiembroDeNucleo => ({ id, clase, x: 0, y: 0, z: 0 });

const nucleo = (
  id: string,
  clases: Record<string, number>,
  extra: Partial<NucleoEnPantalla> = {},
): NucleoEnPantalla => ({
  id,
  frase: { id: `${id}-a`, texto: 'No llego a fin de mes con dos laburos' },
  textoOmitido: null,
  senales: Object.values(clases).reduce((a, b) => a + b, 0),
  clases,
  provincias: 3,
  distancia: { a: `${id}-a`, b: `${id}-b`, km: 1420 },
  miembros: Object.entries(clases).flatMap(([clase, cuantas]) =>
    Array.from({ length: cuantas }, (_, i) => nodo(`${id}-${clase}-${String(i)}`, clase)),
  ),
  ...extra,
});

function envolver(nodoReact: React.ReactNode) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={cliente}>{nodoReact}</QueryClientProvider>);
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
  respuesta = { data: undefined, isLoading: false, isError: false };
});

describe('converger no es corroborar — regla 11 (§3.1)', () => {
  it('un núcleo de deseos dice que se delibera y NUNCA que se corrobora', () => {
    const { rotulo, clase, mixto } = rotuloDeNucleo({ deseo: 30 });
    expect(rotulo).toBe('esto se delibera');
    expect(clase).toBe('deseo');
    expect(mixto).toBe(false);
    expect(rotulo).not.toMatch(/corrobor/i);
  });

  it('un núcleo de hechos dice que se corrobora', () => {
    expect(rotuloDeNucleo({ hecho: 30 }).rotulo).toBe('esto se corrobora');
  });

  it('los dos no se pueden ver igual: el color de clase difiere, en los dos temas', () => {
    for (const tema of ['papel', 'nocturno'] as const) {
      expect(colorDeClase('deseo', tema)).not.toBe(colorDeClase('hecho', tema));
    }
  });

  /**
   * El caso que rompe la regla 11 sin que nadie se dé cuenta: 29 deseos y un
   * hecho. Resolver por mayoría diría «esto se delibera» y el hecho se
   * quedaría sin corroborar para siempre.
   */
  it('un núcleo mixto se rotula mixto y NO se resuelve por mayoría', () => {
    const { rotulo, mixto, clase, glosa } = rotuloDeNucleo({ deseo: 29, hecho: 1 });
    expect(mixto).toBe(true);
    expect(clase).toBeNull();
    expect(rotulo).toContain('mixto');
    expect(rotulo).toContain('esto se delibera');
    expect(rotulo).toContain('esto se corrobora');
    expect(glosa).toBe('29 de deseo · 1 de hecho');
  });

  it('la ficha de un núcleo de deseos no emite ninguna palabra de corroboración', () => {
    const { container } = envolver(
      <FichaDeNucleo nucleo={nucleo('n1', { deseo: 12 })} tema="papel" onCerrar={vi.fn()} />,
    );
    expect(screen.getByText('esto se delibera')).toBeInTheDocument();
    expect(container.textContent).toContain('Converger no es corroborar');
    expect(container.textContent).not.toMatch(/corroborad|verificad|confirmad/i);
  });

  it('la ficha de un mixto dice explícitamente que no se resuelve por mayoría', () => {
    const { container } = envolver(
      <FichaDeNucleo
        nucleo={nucleo('n2', { deseo: 8, hecho: 2 })}
        tema="papel"
        onCerrar={vi.fn()}
      />,
    );
    expect(container.textContent).toContain('no se resuelve por mayoría');
  });

  it('una clase que este código no conoce no se disfraza de una que sí', () => {
    for (const tema of ['papel', 'nocturno'] as const) {
      expect(colorDeClase('quimera', tema)).toBe(GRIS_DEL_TEMA[tema]);
      for (const clase of ['hecho', 'deseo', 'acto', 'meta']) {
        expect(colorDeClase('quimera', tema)).not.toBe(colorDeClase(clase, tema));
      }
    }
    // Y arrastra al núcleo a mixto, que es el lado seguro para fallar.
    expect(rotuloDeNucleo({ quimera: 5, deseo: 1 }).mixto).toBe(true);
  });
});

describe('la cabecera de procedencia — regla 5 (§3.2)', () => {
  const DATOS: RadiografiaPublica = {
    corte: '2026-08-13T04:12:00.000Z',
    modelo: 'bge-m3',
    analizadas: 1840,
    sinVector: 63,
    total: 1903,
    provinciasSinSenal: 7,
    umbral: 0.72,
    nucleos: [],
    solas: [],
    aristas: [],
    regimenDegenerado: null,
  };

  it('dice el corte, el modelo, lo que espera análisis y las provincias mudas', () => {
    const { container } = envolver(
      <CabeceraProcedencia datos={DATOS} cargando={false} fallo={false} tema="papel" />,
    );
    expect(container.textContent).toContain('bge-m3');
    expect(container.textContent).toContain('1.840 analizadas');
    expect(container.textContent).toContain('63 esperando análisis');
    expect(container.textContent).toContain('7 de 24');
  });

  it('dice que mide a quien usó la plataforma y no a quien vive acá', () => {
    const { container } = envolver(
      <CabeceraProcedencia datos={DATOS} cargando={false} fallo={false} tema="papel" />,
    );
    expect(container.textContent).toContain('No a quien vive acá');
  });

  /** Nada que se dibuje puede perderse en silencio (guarda del conteo, §11). */
  it('analizadas + esperando = el total que declara', () => {
    expect(DATOS.analizadas + DATOS.sinVector).toBe(DATOS.total);
  });

  it('sin corrida lo dice, en vez de inventar una fecha', () => {
    const { container } = envolver(
      <CabeceraProcedencia
        datos={{ ...DATOS, corte: null, modelo: null }}
        cargando={false}
        fallo={false}
        tema="papel"
      />,
    );
    expect(container.textContent).toContain('Todavía no corrió');
  });

  it('no tiene ningún control para cerrarla', () => {
    const { container } = envolver(
      <CabeceraProcedencia datos={DATOS} cargando={false} fallo={false} tema="papel" />,
    );
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});

describe('el vacío (§6)', () => {
  it('con cero señales invita sin disculparse y manda al mapa', () => {
    const { container } = envolver(<CieloVacio analizadas={0} sinVector={0} tema="papel" />);
    expect(screen.getByText('Todavía no habló nadie.')).toBeInTheDocument();
    expect(
      screen.getByText('Una constelación necesita dos estrellas para tener una línea.'),
    ).toBeInTheDocument();
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/el-mapa');
    expect(container.textContent).not.toMatch(/perdón|disculp|lo sentimos|próximamente/i);
  });

  it('con una sola señal lo dice, y no finge una constelación', () => {
    envolver(<CieloVacio analizadas={1} sinVector={0} tema="papel" />);
    expect(screen.getByText('La primera. Todavía no hay con qué compararla.')).toBeVisible();
  });

  it('con señales sin vector declara que el análisis no corrió', () => {
    const { container } = envolver(<CieloVacio analizadas={0} sinVector={12} tema="papel" />);
    expect(container.textContent).toContain('12 señales están esperando análisis');
    expect(container.textContent).toContain('se corre a mano');
  });
});

describe('la lista es el camino accesible al mismo dato (R11, §5.5)', () => {
  const NUCLEOS = [
    nucleo('grande', { deseo: 12 }, { provincias: 6, distancia: { a: 'x', b: 'y', km: 320 } }),
    nucleo('chico', { hecho: 3 }, { provincias: 1, distancia: { a: 'x', b: 'y', km: 2100 } }),
  ];

  const pintar = (props: Partial<Parameters<typeof ListaDeNucleos>[0]> = {}) =>
    envolver(
      <ListaDeNucleos
        nucleos={NUCLEOS}
        orden="tamano"
        onOrdenar={vi.fn()}
        enfocado={null}
        onEnfocar={vi.fn()}
        tema="papel"
        {...props}
      />,
    );

  it('es una <table> con encabezados de verdad', () => {
    const { container } = pintar();
    expect(container.querySelector('table')).not.toBeNull();
    expect(container.querySelectorAll('th[scope="col"]').length).toBeGreaterThanOrEqual(5);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('cada fila se alcanza con el teclado y enfoca su núcleo', () => {
    const enfocar = vi.fn();
    pintar({ onEnfocar: enfocar });
    const [, primeraFila] = screen.getAllByRole('row');
    if (!primeraFila) throw new Error('la lista se renderizó sin filas');
    const [botonDeLaFila] = within(primeraFila).getAllByRole('button');
    if (!botonDeLaFila) throw new Error('la fila no expone ningún control al teclado');
    fireEvent.click(botonDeLaFila);
    expect(enfocar).toHaveBeenCalledWith('grande');
  });

  it('trae el mismo dato que la constelación, incluida la distancia y las provincias', () => {
    const { container } = pintar();
    expect(container.textContent).toContain('320 km');
    expect(container.textContent).toContain('2100 km');
  });

  it('el orden es un control del lector: tamaño, provincias y distancia', () => {
    expect(ordenarNucleos(NUCLEOS, 'tamano').map((n) => n.id)).toEqual(['grande', 'chico']);
    expect(ordenarNucleos(NUCLEOS, 'provincias').map((n) => n.id)).toEqual(['grande', 'chico']);
    expect(ordenarNucleos(NUCLEOS, 'distancia').map((n) => n.id)).toEqual(['chico', 'grande']);
  });

  it('un núcleo sin cesión muestra el motivo en vez de una frase inventada', () => {
    const sinFrase = nucleo('mudo', { deseo: 4 });
    const { container } = pintar({
      nucleos: [{ ...sinFrase, frase: null, textoOmitido: 'sin cesión de licencia' }],
    });
    expect(container.textContent).toContain('sin cesión de licencia');
  });
});

describe('el umbral recalcula con el mismo motor que usó el servidor (R5, R7)', () => {
  /**
   * Cuatro señales y tres aristas medidas. **El servidor midió a 0,60** y a ese
   * corte las cuatro son un solo continente; subiendo a 0,72 la arista floja
   * (0,64) se cae y se parte en dos islas. Es exactamente lo que el lector
   * tiene que ver moviendo el deslizador.
   */
  const DATOS: RadiografiaPublica = {
    corte: '2026-08-13T04:12:00.000Z',
    modelo: 'bge-m3',
    analizadas: 4,
    sinVector: 0,
    total: 4,
    provinciasSinSenal: 20,
    umbral: 0.6,
    nucleos: [
      {
        id: 'continente',
        frase: { id: 's1', texto: 'El colectivo no pasa' },
        textoOmitido: null,
        senales: 4,
        clases: { deseo: 2, hecho: 2 },
        provincias: 3,
        distancia: { a: 's1', b: 's4', km: 90 },
        miembros: [
          nodo('s1', 'deseo'),
          nodo('s2', 'deseo'),
          nodo('s3', 'hecho'),
          nodo('s4', 'hecho'),
        ],
      },
    ],
    solas: [],
    // El servidor manda **sólo las aristas visibles a su propio umbral**
    // (`similitud >= umbral` en su servicio). Las tres pasan 0,60.
    aristas: [
      { a: 's1', b: 's2', similitud: 0.91, tipo: 'medida' },
      { a: 's3', b: 's4', similitud: 0.86, tipo: 'medida' },
      { a: 's2', b: 's3', similitud: 0.64, tipo: 'medida' },
    ],
    regimenDegenerado: null,
  };

  it('al umbral que midió el servidor devuelve su partición tal cual', () => {
    const vista = construirVista(DATOS, 0.6);
    expect(vista.origen).toBe('medido');
    expect(vista.nucleos).toBe(DATOS.nucleos);
  });

  it('subiendo el umbral el continente se parte en dos islas, exactamente', () => {
    // A 0,72 la arista floja (0,64) se cae y quedan {s1,s2} y {s3,s4}. Todas
    // las aristas que hacen falta para este corte están en la mano.
    const vista = construirVista(DATOS, 0.72);
    expect(vista.origen).toBe('recalculado');
    expect(vista.nucleos).toHaveLength(2);
    expect(vista.nucleos.map((n) => n.senales).sort()).toEqual([2, 2]);
    expect(vista.nucleos.map((n) => n.clases)).toContainEqual({ deseo: 2 });
    expect(vista.nucleos.map((n) => n.clases)).toContainEqual({ hecho: 2 });
  });

  it('subiendo más, las señales quedan solas y se cuentan como tales', () => {
    const vista = construirVista(DATOS, 0.95);
    expect(vista.nucleos).toHaveLength(0);
    expect(vista.solas.map((s) => s.id).sort()).toEqual(['s1', 's2', 's3', 's4']);
  });

  /**
   * El caso que obliga a tener un tercer estado. El servidor mandó **sólo las
   * aristas de similitud ≥ 0,60**: las que fundirían más islas a 0,40 nunca
   * llegaron. Recalcular acá daría más islas de las que hay y las presentaría
   * como medición. Se muestra lo último medido y se dice que se está esperando.
   */
  it('bajando el umbral NO inventa una partición con un grafo incompleto', () => {
    const vista = construirVista(DATOS, 0.4);
    expect(vista.origen).toBe('esperando');
    expect(vista.nucleos).toBe(DATOS.nucleos);
  });

  it('nada se pierde: dibujadas en núcleo + solas = las analizadas', () => {
    for (const umbral of [0.4, 0.5, 0.6, 0.72, 0.85, 0.95]) {
      const vista = construirVista(DATOS, umbral);
      const dibujadas = vista.nucleos.reduce((t, n) => t + n.senales, 0) + vista.solas.length;
      expect(dibujadas).toBe(DATOS.analizadas);
    }
  });

  it('un núcleo recalculado dice que las provincias y los km todavía no se saben', () => {
    const vista = construirVista(DATOS, 0.72);
    expect(vista.nucleos[0]?.provincias).toBeNull();
    expect(vista.nucleos[0]?.distancia).toBeNull();
  });

  /** La frase la escribió una persona: no se inventa ni se hereda del vecino. */
  it('la frase sólo viaja a la isla donde quedó su señal, y la otra queda sin frase', () => {
    const vista = construirVista(DATOS, 0.72);
    const conFrase = vista.nucleos.filter((n) => n.frase !== null);
    expect(conFrase).toHaveLength(1);
    expect(conFrase[0]?.frase?.texto).toBe('El colectivo no pasa');
    expect(conFrase[0]?.miembros.map((m) => m.id)).toContain('s1');

    const sinFrase = vista.nucleos.filter((n) => n.frase === null);
    expect(sinFrase).toHaveLength(1);
    expect(sinFrase[0]?.textoOmitido).toBe('el servidor todavía no midió este corte');
  });

  /**
   * Una arista declarada la afirmó una persona: se dibuja distinto (R6) y no
   * funde dos núcleos. «A mí me importan las dos» no es «las dos dicen lo mismo».
   */
  it('una arista declarada no funde núcleos aunque su similitud pase el umbral', () => {
    const conDeclarada: RadiografiaPublica = {
      ...DATOS,
      aristas: [
        ...DATOS.aristas.slice(0, 2),
        { a: 's2', b: 's3', similitud: 0.99, tipo: 'declarada' },
      ],
    };
    expect(construirVista(conDeclarada, 0.72).nucleos).toHaveLength(2);
  });

  it('sin datos no dibuja nada y no rompe', () => {
    expect(construirVista(undefined, 0.72)).toEqual({ nucleos: [], solas: [], origen: 'medido' });
  });
});

describe('el tema, que elige el lector y se persiste (R12)', () => {
  it('arranca en papel porque papel es el recorrido', () => {
    expect(leerTema()).toBe('papel');
  });

  it('guarda y recupera el nocturno', () => {
    guardarTema('nocturno');
    expect(leerTema()).toBe('nocturno');
    guardarTema('papel');
    expect(leerTema()).toBe('papel');
  });

  it('sobrevive a un storage con basura adentro', () => {
    window.localStorage.setItem('basta_radiografia_tema', 'arcoiris');
    expect(leerTema()).toBe('papel');
  });
});

describe('la ruta', () => {
  it('/la-radiografia nace con chrome papel', () => {
    expect(esRutaPapel('/la-radiografia')).toBe(true);
  });
});

/**
 * El lienzo no puede depender de que haya cuadros.
 *
 * Encontrado mirando la página en el navegador: con la pestaña en segundo
 * plano `visibilityState` es `'hidden'`, el navegador **no programa
 * `requestAnimationFrame`**, y la constelación se quedaba con su buffer de
 * 300×150 sin una sola línea. Peor: el interruptor a nocturno cambiaba toda
 * la página y el cielo seguía dibujado en papel. Acá se le saca el `rAF` al
 * componente y se verifica que pinte igual.
 */
describe('la constelación pinta sin esperar un cuadro', () => {
  const pintadas: string[] = [];
  const pincel = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    setTransform: vi.fn(),
    fillRect: vi.fn(() => {
      pintadas.push(pincel.fillStyle);
    }),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    setLineDash: vi.fn(),
  };

  const miembros = [nodo('a', 'deseo'), nodo('b', 'deseo')];
  const conNucleo = [nucleo('n1', { deseo: 2 }, { miembros })];

  function montarSinCuadros() {
    pintadas.length = 0;
    vi.stubGlobal('requestAnimationFrame', () => 0);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      pincel as unknown as CanvasRenderingContext2D,
    );
    for (const [prop, valor] of [
      ['clientWidth', 800],
      ['clientHeight', 500],
    ] as const) {
      Object.defineProperty(HTMLCanvasElement.prototype, prop, {
        configurable: true,
        value: valor,
      });
    }
  }

  it('pinta el primer cuadro en el montaje, y repinta cuando cambia el tema', () => {
    montarSinCuadros();
    const { rerender } = render(
      <Constelacion
        nucleos={conNucleo}
        solas={[]}
        aristas={[{ a: 'a', b: 'b', similitud: 0.9, tipo: 'medida' }]}
        tema="papel"
        enfocado={null}
        onEnfocar={vi.fn()}
      />,
    );
    // Un cuadro ya, sin un solo `requestAnimationFrame`, y sobre papel.
    expect(pintadas).toContain('#F2EFE7');

    rerender(
      <Constelacion
        nucleos={conNucleo}
        solas={[]}
        aristas={[{ a: 'a', b: 'b', similitud: 0.9, tipo: 'medida' }]}
        tema="nocturno"
        enfocado={null}
        onEnfocar={vi.fn()}
      />,
    );
    // Y el cielo se fue a `oscuro.barra` sin esperar a que alguien mire.
    expect(pintadas).toContain('#241F17');

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});

/**
 * La página entera, contra el dato simulado. El endpoint todavía no existe:
 * esto es lo que verifica que el día que exista, la página lo consuma sin
 * cambiar una línea.
 */
describe('la página, de punta a punta', () => {
  const CORPUS: RadiografiaPublica = {
    corte: '2026-08-13T04:12:00.000Z',
    modelo: 'bge-m3',
    analizadas: 5,
    sinVector: 2,
    total: 7,
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
        distancia: { a: 'd1', b: 'd3', km: 640 },
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
    aristas: [
      { a: 'd1', b: 'd2', similitud: 0.88, tipo: 'medida' },
      { a: 'd2', b: 'd3', similitud: 0.79, tipo: 'medida' },
      { a: 'h1', b: 'h2', similitud: 0.83, tipo: 'medida' },
    ],
    regimenDegenerado: null,
  };

  it('dibuja la cabecera, la constelación, el deslizador y la lista juntos', () => {
    respuesta = { data: CORPUS, isLoading: false, isError: false };
    const { container } = envolver(<LaRadiografia />);

    // La cabecera de procedencia, que no se puede cerrar.
    expect(container.textContent).toContain('bge-m3');
    expect(container.textContent).toContain('2 esperando análisis');
    // El lienzo existe y la tabla también: la lista sale JUNTO con la
    // constelación, nunca después (§10, rebanada 4).
    expect(screen.getByTestId('constelacion')).toBeInTheDocument();
    expect(container.querySelector('table')).not.toBeNull();
    // El mando principal.
    expect(screen.getByLabelText('Qué tan parecido es «lo mismo»')).toHaveValue('0.72');
    // Y las dos lecturas de la regla 11, en la misma pantalla y distintas.
    expect(screen.getByText('esto se delibera')).toBeInTheDocument();
    expect(screen.getByText('esto se corrobora')).toBeInTheDocument();
  });

  it('el lienzo es aria-hidden y la tabla es el camino accesible', () => {
    respuesta = { data: CORPUS, isLoading: false, isError: false };
    envolver(<LaRadiografia />);
    expect(screen.getByTestId('constelacion')).toHaveAttribute('aria-hidden');
  });

  it('con la base en cero muestra el vacío y ninguna constelación', () => {
    respuesta = {
      data: { ...CORPUS, analizadas: 0, sinVector: 0, total: 0, nucleos: [], aristas: [] },
      isLoading: false,
      isError: false,
    };
    envolver(<LaRadiografia />);
    expect(screen.getByText('Todavía no habló nadie.')).toBeInTheDocument();
    expect(screen.queryByTestId('constelacion')).toBeNull();
  });

  it('si el pedido falla NO afirma que no habló nadie: dice que no pudo leer', () => {
    respuesta = { data: undefined, isLoading: false, isError: true };
    const { container } = envolver(<LaRadiografia />);
    expect(container.textContent).toContain('No se pudo traer el análisis');
    expect(container.textContent).toContain('No se pudo leer');
    expect(screen.queryByText('Todavía no habló nadie.')).toBeNull();
  });

  it('el interruptor papel/nocturno persiste la elección del lector', () => {
    respuesta = { data: CORPUS, isLoading: false, isError: false };
    envolver(<LaRadiografia />);
    fireEvent.click(screen.getByText('Ver de noche'));
    expect(leerTema()).toBe('nocturno');
    expect(screen.getByText('Ver en papel')).toBeInTheDocument();
  });

  /**
   * La falsedad que estuvo publicada: la página decía «personas» sobre un
   * conteo de FILAS. Son señales — una sola persona puede haber cargado
   * veinte, y `senales` no trae actor, así que la página no sabe cuántas
   * personas hay detrás y no puede decirlo.
   */
  it('cuenta señales y NUNCA personas', () => {
    respuesta = { data: CORPUS, isLoading: false, isError: false };
    const { container } = envolver(<LaRadiografia />);
    const texto = container.textContent;

    expect(texto).toMatch(/muchas señales digan lo mismo/);
    expect(texto).toContain('Son señales y no personas');
    // Las cuatro formas exactas que estuvieron en pantalla.
    expect(texto).not.toMatch(/muchas personas|treinta personas|varias personas/i);
    expect(texto).not.toMatch(/\d+\s+personas\b/);
  });

  it('la ficha mide distancia entre señales, no entre personas', () => {
    const { container } = envolver(<FichaDeNucleo nucleo={null} tema="papel" onCerrar={vi.fn()} />);
    expect(container.textContent).toContain('las dos señales más lejanas');
    expect(container.textContent).not.toMatch(/personas más lejanas/);
  });

  it('la ficha de un núcleo dice que son señales y no personas', () => {
    const { container } = envolver(
      <FichaDeNucleo nucleo={nucleo('n1', { deseo: 12 })} tema="papel" onCerrar={vi.fn()} />,
    );
    expect(container.textContent).toContain('Son señales, no personas');
  });
});

/**
 * El régimen degenerado — la advertencia que sostiene todo lo demás.
 *
 * Con `n ≤ k + 1` el grafo k-NN es completo por construcción: cada señal es
 * vecina de todas las demás y la partición en núcleos no depende del
 * contenido. Publicarla como medición sin decirlo es la regla 11 rota por
 * álgebra, y el arreglo no cuesta un dato nuevo: el servicio ya tiene `n` y `k`.
 */
describe('el régimen degenerado', () => {
  const CORPUS_CHICO: RadiografiaPublica = {
    corte: '2026-08-16T04:12:00.000Z',
    modelo: 'bge-m3',
    analizadas: 8,
    sinVector: 0,
    total: 8,
    provinciasSinSenal: 22,
    umbral: 0.72,
    nucleos: [
      {
        id: 'uno',
        frase: { id: 'a1', texto: 'No llego a fin de mes' },
        textoOmitido: null,
        senales: 4,
        clases: { deseo: 4 },
        provincias: 2,
        distancia: null,
        miembros: [
          nodo('a1', 'deseo'),
          nodo('a2', 'deseo'),
          nodo('a3', 'deseo'),
          nodo('a4', 'deseo'),
        ],
      },
    ],
    solas: [nodo('b1', 'hecho')],
    aristas: [{ a: 'a1', b: 'a2', similitud: 0.9, tipo: 'medida' }],
    regimenDegenerado: { n: 8, k: 12 },
  };

  it('lo dice con PALABRAS: los núcleos no dependen de lo que dijo nadie', () => {
    respuesta = { data: CORPUS_CHICO, isLoading: false, isError: false };
    const { container } = envolver(<LaRadiografia />);
    const texto = container.textContent;
    expect(texto).toContain('no dependen de lo que dijo nadie');
    expect(texto).toContain('El grafo queda completo antes de leer una sola frase');
    // Los dos números que lo fundamentan, dichos y no escondidos.
    expect(texto).toContain('8 señales');
    expect(texto).toContain('12 vecinas');
  });

  it('no suena a error de sistema: dice que es el límite del instrumento', () => {
    respuesta = { data: CORPUS_CHICO, isLoading: false, isError: false };
    const { container } = envolver(<LaRadiografia />);
    const texto = container.textContent;
    expect(texto).toContain('Esto no es un error');
    expect(texto).toMatch(/hasta dónde llega el instrumento/);
    expect(texto).not.toMatch(/error interno|falló|inténtalo|intentá de nuevo/i);
  });

  /** Y dice cuándo deja de valer: `n ≥ k + 2`, con el número puesto. */
  it('declara solo cuándo se desarma', () => {
    respuesta = { data: CORPUS_CHICO, isLoading: false, isError: false };
    const { container } = envolver(<LaRadiografia />);
    expect(container.textContent).toContain('desde las 14 señales analizadas');
  });

  /**
   * Va donde el lector saca la conclusión, no en un pie: el aviso tiene que
   * estar en el DOM **antes** del lienzo y de la tabla.
   */
  it('sale ANTES de la constelación y de la lista, no después', () => {
    respuesta = { data: CORPUS_CHICO, isLoading: false, isError: false };
    const { container } = envolver(<LaRadiografia />);
    const aviso = container.querySelector('section[aria-label="Hasta dónde llega este corte"]');
    const lienzo = screen.getByTestId('constelacion');
    const tabla = container.querySelector('table');
    if (!aviso || !tabla) throw new Error('falta el aviso o la lista');
    // `querySelectorAll('*')` devuelve en orden de documento: comparar índices
    // es leer el orden real en el que el lector se los encuentra.
    const enOrden = [...container.querySelectorAll('*')];
    expect(enOrden.indexOf(aviso)).toBeGreaterThanOrEqual(0);
    expect(enOrden.indexOf(aviso)).toBeLessThan(enOrden.indexOf(lienzo));
    expect(enOrden.indexOf(aviso)).toBeLessThan(enOrden.indexOf(tabla));
  });

  it('con `null` no dice nada: el aviso es una afirmación, no un adorno', () => {
    respuesta = {
      data: { ...CORPUS_CHICO, regimenDegenerado: null },
      isLoading: false,
      isError: false,
    };
    const { container } = envolver(<LaRadiografia />);
    expect(
      container.querySelector('section[aria-label="Hasta dónde llega este corte"]'),
    ).toBeNull();
    expect(container.textContent).not.toContain('no dependen de lo que dijo nadie');
  });

  it('con una sola señal y una sola vecina lo dice en singular', () => {
    respuesta = {
      data: { ...CORPUS_CHICO, regimenDegenerado: { n: 1, k: 1 } },
      isLoading: false,
      isError: false,
    };
    const { container } = envolver(<LaRadiografia />);
    const texto = container.textContent;
    expect(texto).toContain('1 señal analizada');
    expect(texto).toContain('1 vecina');
    expect(texto).not.toContain('1 señales');
  });
});
