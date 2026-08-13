import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { COEFICIENTES } from '../simulacion/coeficientes.js';
import { barrer } from '../simulacion/espina/barrer.js';
import { correr, serializarCorrida, ordenCanonico } from '../simulacion/espina/corrida.js';
import { armarPais, escenarioBase } from '../simulacion/espina/escenario.js';
import { conVariable, CLAVES_VARIABLE, conectadaEn, DOMINIOS } from '../simulacion/espina/variables.js';
import { periodosDelHorizonte, periodosSostenidos, pisoEfectivo } from '../simulacion/mandato.js';
import { modoForma } from '../simulacion/modo-forma.js';
import { derivarDe, esMagnitud, hipotesis, medido, declarado, derivado } from '../simulacion/procedencia.js';
import { repartir } from '../simulacion/reparto.js';

import type { Diseno } from '../simulacion/espina/barrer.js';
import type { Escenario, Pais } from '../simulacion/espina/escenario.js';
import type { FormaMedida } from '../simulacion/espina/forma.js';
import type { Magnitud, SelloDelModelo } from '../simulacion/procedencia.js';
import type { EstadoMedido, Territorio } from '../simulacion/tipos.js';

/**
 * Las guardas del §9.1: son el contrato del documento hecho ejecutable, no
 * cobertura de rutina. Si alguna deja de pasar, o el motor cambió de lo que
 * dice ser, o lo que decía era falso — y las dos cosas hay que saberlas.
 */

const AHORA = 1_800_000_000_000;
const MES = 31 * 24 * 3600 * 1000;

const TERRITORIOS: Territorio[] = [
  { id: 'buenos aires', nombre: 'Buenos Aires', poblacion: 17_500_000, km2: 307_571 },
  { id: 'cordoba', nombre: 'Córdoba', poblacion: 3_800_000, km2: 165_321 },
  { id: 'chaco', nombre: 'Chaco', poblacion: 1_140_000, km2: 99_633 },
  { id: 'formosa', nombre: 'Formosa', poblacion: 606_000, km2: 72_066 },
  { id: 'sin dato', nombre: 'Sin dato', poblacion: 0, km2: 10 },
];

const BASE: EstadoMedido = {
  voces: [
    { territorioId: 'chaco', tipo: { reconocido: true, tipo: 'basta' }, fecha: AHORA - MES },
    { territorioId: 'chaco', tipo: { reconocido: true, tipo: 'basta' }, fecha: AHORA - 2 * MES },
    { territorioId: 'chaco', tipo: { reconocido: true, tipo: 'basta' }, fecha: AHORA - 3 * MES },
    { territorioId: 'formosa', tipo: { reconocido: true, tipo: 'necesidad' }, fecha: AHORA - MES },
  ],
  ahora: AHORA,
};

const PAIS: Pais = armarPais(BASE, TERRITORIOS, 'provincia');
const ESC: Escenario = escenarioBase(
  PAIS,
  'guardas',
  'Guardas',
  '¿A partir de cuántas voces cada 100.000 gana mandato cada provincia?',
  2026,
  COEFICIENTES,
);

const SELLO: SelloDelModelo = {
  modelo: 'llama3.1:8b-instruct-q4_K_M',
  digest: 'sha256:abcd',
  temperatura: 0,
  poblacionHuella: 'deadbeef',
  semilla: 7,
  generadaEn: AHORA,
};

/** Recorre una estructura entera y junta todo número que no venga en Magnitud. */
function numerosHuerfanos(valor: unknown, ruta = ''): string[] {
  if (typeof valor === 'number') return [ruta];
  if (valor === null || typeof valor !== 'object') return [];
  if (esMagnitud(valor)) return [];
  if (valor instanceof Map) {
    return [...valor.entries()].flatMap(([k, v]) => numerosHuerfanos(v, `${ruta}.${String(k)}`));
  }
  if (valor instanceof Uint8Array) return [];
  if (Array.isArray(valor)) return valor.flatMap((v, i) => numerosHuerfanos(v, `${ruta}[${i}]`));
  return Object.entries(valor).flatMap(([k, v]) => numerosHuerfanos(v, `${ruta}.${k}`));
}

/**
 * Lo que NO cuenta como número huérfano, y por qué.
 *
 * Son campos de **identidad** (la semilla, el instante de generación) y de
 * **configuración declarada** (el escenario que se pidió: la forma, los
 * ajustes, los coeficientes, y el `pedido`). Ninguno es un resultado: su
 * procedencia es `declarado` por definición y es la misma para el objeto
 * entero, así que envolver dieciocho diales para decir «declarado:
 * participacion» en el campo llamado `participacion` sería ceremonia sin
 * contenido.
 *
 * **`logrado` estaba acá y no correspondía.** La justificación que lo metía era
 * «configuración declarada… su procedencia es `declarado` por definición»: eso
 * es cierto para `pedido`, que es lo que alguien movió, y falso para `logrado`,
 * que el motor CALCULA desde una cosecha cuya autoridad puede ser `hipotesis`.
 * O sea: la excepción contradecía en tres líneas la regla que este mismo
 * comentario enuncia abajo, y eximía justamente la salida estrella del modo
 * gente — la que la pantalla pone debajo de «lo que efectivamente hizo la
 * población». Ahora `logrado` es una `FormaMedida` de `Magnitud`es y la guarda
 * lo mira como a cualquier otro resultado.
 *
 * La guarda cubre entonces exactamente lo que tiene que cubrir: **todo lo que
 * el motor CALCULA**. Vale la pena decirlo con todas las letras porque la spec
 * pide «ningún number fuera de una Magnitud en Corrida ni en
 * ResultadoBarrido», y ésta es la única excepción, escrita y acotada.
 */
const IDENTIDAD =
  /\.(semilla|generadaEn|temperatura|n|periodos)$|(pedido|forma|ajustes|coeficientes|mecanismo)\./;

describe('GUARDA: sin números huérfanos', () => {
  it('en una Corrida, sobre muchas entradas y no sobre una sola', () => {
    // Una rama que devuelva un número pelado sólo bajo ciertas palancas no la
    // caza un caso suelto, y un barrido recorre miles de combinaciones.
    for (const participacion of [0, 120, 438, 1000]) {
      for (const resistencia of [0, 1]) {
        for (const constancia of [0, 1]) {
          const esc = conVariable(
            conVariable(conVariable(ESC, 'participacion', participacion), 'resistencia', resistencia),
            'constancia',
            constancia,
          );
          const { corrida } = correr(esc, PAIS, modoForma);
          const huerfanos = numerosHuerfanos(corrida, 'corrida').filter((r) => !IDENTIDAD.test(r));
          expect(huerfanos).toEqual([]);
        }
      }
    }
  });

  it('en el resultado de un barrido', () => {
    const diseno: Diseno = {
      base: ESC,
      modo: 'forma',
      claves: ['participacion', 'resistencia', 'cumplimiento'],
      objetivo: 'legitimidad',
      metodo: { tipo: 'unaPorVez', pasos: 4 },
    };
    const salida = barrer(diseno, PAIS, modoForma);
    const huerfanos = numerosHuerfanos(salida, 'barrido').filter(
      (r) => !IDENTIDAD.test(r) && !/\.(pasos|muestras|puntos|corridas|version)/.test(r),
    );
    expect(huerfanos).toEqual([]);
  });
});

/**
 * `logrado` es lo que el motor midió sobre la cosecha, no lo que alguien pidió.
 *
 * La guarda de arriba lo eximía por nombre junto a `pedido` y por eso este
 * campo —el único que en modo gente resume «lo que efectivamente hizo la
 * población»— salía como cuatro números crudos, sin fórmula y sin sello, en la
 * estructura donde todo lo demás lleva procedencia.
 */
describe('GUARDA: lo logrado se mide, no se declara', () => {
  const magnitudesDe = (corrida: { logrado: FormaMedida }): readonly Magnitud[] => [
    corrida.logrado.participacion,
    corrida.logrado.dispersion,
    corrida.logrado.constancia,
    ...Object.values(corrida.logrado.composicion),
  ];

  it('cada campo es una Magnitud con su fórmula a la vista', () => {
    const esc = conVariable(ESC, 'participacion', 400);
    const { corrida } = correr(esc, PAIS, modoForma);

    const medidas = magnitudesDe(corrida);
    expect(medidas).toHaveLength(7);
    for (const m of medidas) {
      expect(esMagnitud(m)).toBe(true);
      // El modo forma es un modelo, pero su fórmula se verifica con lápiz: es
      // `derivado`, nunca `hipotesis` y nunca `declarado`.
      expect(m.procedencia.tipo).toBe('derivado');
      if (m.procedencia.tipo !== 'derivado') continue;
      expect(m.procedencia.formula.length).toBeGreaterThan(10);
      expect(m.unidad.length).toBeGreaterThan(0);
    }
  });

  it('`pedido`, en cambio, sigue siendo la configuración que se movió', () => {
    const esc = conVariable(ESC, 'participacion', 400);
    const { corrida } = correr(esc, PAIS, modoForma);
    expect(corrida.pedido).toEqual(esc.forma);
    expect(typeof corrida.pedido.participacion).toBe('number');
  });

  it('serializada, la procedencia viaja adentro y no se aplana a un número', () => {
    const esc = conVariable(ESC, 'participacion', 400);
    const { corrida } = correr(esc, PAIS, modoForma);
    const json = serializarCorrida(corrida, esc, ordenCanonico(PAIS));

    expect(json.logrado.participacion.procedencia).toMatchObject({ tipo: 'derivado' });
    expect(json.logrado.participacion.valor).toBe(corrida.logrado.participacion.valor);
    for (const clase of ['hecho', 'deseo', 'acto', 'meta'] as const) {
      expect(json.logrado.composicion[clase]?.procedencia).toMatchObject({ tipo: 'derivado' });
    }
  });
});

describe('GUARDA: el veredicto trae lo que lo produjo', () => {
  it('no sale un `hay` sin las tres magnitudes, y un `false` dice por qué', () => {
    // Sin nadie hablando faltan las dos cosas: no se cruzó el piso y no hay
    // nada que sostener.
    const mudo = correr(conVariable(ESC, 'participacion', 0), PAIS, modoForma);
    const chacoMudo = mudo.retrato.porTerritorio.get('chaco');
    expect(chacoMudo?.veredicto.hay).toBe(false);
    expect(chacoMudo?.veredicto.falta).toBe('las dos');
    expect(chacoMudo?.veredicto.umbral.valor).toBeGreaterThan(0);

    // Con voz sostenida pero poca, falta SÓLO el piso — y eso es un consejo
    // distinto para una persona distinta: no es «sostenelo», es «sumá gente».
    const flojo = correr(conVariable(ESC, 'participacion', 20), PAIS, modoForma);
    const chaco = flojo.retrato.porTerritorio.get('chaco');
    expect(chaco?.veredicto.hay).toBe(false);
    expect(chaco?.veredicto.falta).toBe('piso');
    expect(chaco?.veredicto.voces.procedencia.tipo).toBe('derivado');

    // Cruzar el piso una vez no alcanza: falta la constancia, y lo dice.
    const pico = correr(
      conVariable(conVariable(ESC, 'participacion', 900), 'constancia', 0),
      PAIS,
      modoForma,
    );
    expect(pico.retrato.porTerritorio.get('chaco')?.veredicto.falta).toBe('constancia');
  });
});

describe('GUARDA: no hay lavado de procedencia', () => {
  it('derivar de una hipótesis devuelve una hipótesis, con su sello', () => {
    const sospechosa = hipotesis(derivado(10, 'voces', 'conteo de la población', ['gente']), SELLO);
    const limpia = medido(5, 'voces', 'voces cargadas');
    const resultado = derivarDe([limpia, sospechosa], 15, 'voces', 'a + b');

    expect(resultado.procedencia.tipo).toBe('hipotesis');
    if (resultado.procedencia.tipo !== 'hipotesis') return;
    expect(resultado.procedencia.sello).toEqual(SELLO);
    // La fórmula NO se pierde: la hipótesis envuelve el derivado en vez de
    // reemplazarlo. Un cuarto par plano dejaría exactamente ese agujero.
    expect(resultado.procedencia.sobre).toMatchObject({ tipo: 'derivado', formula: 'a + b' });
  });

  it('la autoridad propaga por toda la cadena, no sólo un paso', () => {
    const raiz = hipotesis(declarado(3, 'voces', 'conducta'), SELLO);
    const paso1 = derivarDe([raiz], 6, 'voces', '×2');
    const paso2 = derivarDe([paso1, medido(1, 'voces', 'padrón')], 7, 'voces', '+1');
    expect(paso2.procedencia.tipo).toBe('hipotesis');
  });

  it('sin insumos hipotéticos, el derivado sigue siendo un derivado', () => {
    const limpio = derivarDe(
      [medido(2, 'voces', 'x'), declarado(3, 'voces', 'y')],
      5,
      'voces',
      'x + y',
    );
    expect(limpio.procedencia.tipo).toBe('derivado');
  });

  it('sellar dos veces no anida dos hipótesis', () => {
    const una = hipotesis(medido(1, 'voces', 'x'), SELLO);
    expect(hipotesis(una, SELLO)).toBe(una);
  });
});

describe('GUARDA: el silencio nunca es hipótesis', () => {
  it('ninguna magnitud del lado medido lleva sello, en ningún modo', () => {
    const { retrato } = correr(ESC, PAIS, modoForma);
    const contexto = barrer(
      { base: ESC, modo: 'forma', claves: ['participacion'], objetivo: 'alcance', metodo: { tipo: 'unaPorVez', pasos: 2 } },
      PAIS,
      modoForma,
    );
    expect(contexto.estado).toBe('listo');

    // El lado de la voz de este modo tampoco: el modo forma es una fórmula a
    // la vista, no una hipótesis de modelo, aunque sea un modelo.
    const texto = JSON.stringify([...retrato.porTerritorio.values()]);
    expect(texto).not.toContain('hipotesis');
  });
});

describe('GUARDA: cero azar sin semilla', () => {
  it('`Math.random`, `Date.now` y `new Date` no aparecen en el fuente de civic-core', () => {
    const raiz = new URL('../', import.meta.url).pathname;
    const prohibidos = [/Math\.random/, /Date\.now/, /new Date\(/, /crypto\.getRandomValues/];
    const encontrados: string[] = [];

    const recorrer = (dir: string): void => {
      for (const entrada of readdirSync(dir)) {
        const ruta = join(dir, entrada);
        if (statSync(ruta).isDirectory()) {
          if (entrada === '__tests__' || entrada === 'node_modules') continue;
          recorrer(ruta);
          continue;
        }
        if (!entrada.endsWith('.ts')) continue;
        const texto = readFileSync(ruta, 'utf8');
        for (const patron of prohibidos) {
          // Se ignoran las menciones en comentarios: lo que importa es que no
          // se LLAME, y el módulo habla de estas funciones para explicarse.
          const sinComentarios = texto
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/^\s*\/\/.*$/gm, '');
          if (patron.test(sinComentarios)) encontrados.push(`${ruta}: ${patron.source}`);
        }
      }
    };

    recorrer(raiz);
    expect(encontrados).toEqual([]);
  });
});

describe('GUARDA: el dominio declarado es el del motor', () => {
  it('lo que el motor acota a [0,1] se declara en [0,1]', () => {
    for (const clave of ['dispersion', 'constancia', 'resistencia', 'cumplimiento'] as const) {
      expect(DOMINIOS[clave].minimo).toBe(0);
      expect(DOMINIOS[clave].maximo).toBe(1);
    }
    // Y el motor efectivamente clampea: muestrear afuera sería muestrear el
    // mismo punto muchas veces y bajar la varianza artificialmente.
    expect(pisoEfectivo(2)).toBe(pisoEfectivo(1));
    expect(pisoEfectivo(-1)).toBe(pisoEfectivo(0));
    expect(periodosSostenidos(2, 24)).toBe(periodosSostenidos(1, 24));
    const arriba = repartir(100, TERRITORIOS, 5, new Map());
    const enUno = repartir(100, TERRITORIOS, 1, new Map());
    expect([...arriba.entries()]).toEqual([...enUno.entries()]);
  });

  it('toda variable declarada tiene su razón escrita', () => {
    for (const clave of CLAVES_VARIABLE) {
      expect(DOMINIOS[clave].razon.length).toBeGreaterThan(40);
    }
  });
});

describe('GUARDA: una ronda es un período', () => {
  it('los períodos de la cosecha son los del horizonte, siempre', () => {
    for (const horizonte of [1 / 12, 0.25, 1, 2, 3, 5, 10]) {
      const esc = conVariable(ESC, 'horizonte', horizonte);
      expect(modoForma(esc, PAIS, null).periodos).toBe(
        periodosDelHorizonte(esc.ajustes.horizonte, esc.coeficientes),
      );
    }
  });
});

describe('GUARDA: ninguna palanca conectada es utilería', () => {
  /**
   * MiroFish genera dieciséis perillas y su simulador lee dos: trece se
   * serializan y no las lee nadie, así que quien mueva `echo_chamber_strength`
   * y vea cambiar el resultado está viendo ruido del modelo y va a creer que
   * aprendió algo. Acá, por cada variable que el modo declara conectada,
   * moverla **sola** tiene que cambiar la corrida.
   *
   * Cada par de valores está elegido para que la variable muerda, y eso no es
   * hacer trampa: un umbral duro sólo se nota cuando se lo cruza, y el par
   * documenta dónde está el borde.
   */
  const PARES: Record<string, { escenario: Escenario; bajo: number; alto: number }> = {
    participacion: { escenario: ESC, bajo: 10, alto: 900 },
    dispersion: { escenario: conVariable(ESC, 'participacion', 400), bajo: 0, alto: 1 },
    constancia: { escenario: conVariable(ESC, 'participacion', 400), bajo: 0, alto: 1 },
    'composicion.hecho': { escenario: conVariable(ESC, 'participacion', 400), bajo: 0, alto: 1 },
    'composicion.deseo': { escenario: conVariable(ESC, 'participacion', 400), bajo: 0, alto: 1 },
    'composicion.acto': { escenario: conVariable(ESC, 'participacion', 400), bajo: 0, alto: 1 },
    'composicion.meta': { escenario: conVariable(ESC, 'participacion', 400), bajo: 0, alto: 1 },
    horizonte: { escenario: conVariable(ESC, 'participacion', 400), bajo: 1 / 12, alto: 10 },
    resistencia: { escenario: conVariable(ESC, 'participacion', 400), bajo: 0, alto: 1 },
    PISO_MANDATO: { escenario: conVariable(ESC, 'participacion', 400), bajo: 10, alto: 500 },
    K_RESISTENCIA: {
      escenario: conVariable(conVariable(ESC, 'participacion', 400), 'resistencia', 1),
      bajo: 0,
      alto: 10,
    },
    MINIMO_PERIODOS: {
      escenario: conVariable(conVariable(ESC, 'participacion', 400), 'constancia', 0.1),
      bajo: 1,
      alto: 12,
    },
  };

  it('mover cada una sola cambia el resultado', () => {
    for (const clave of CLAVES_VARIABLE) {
      if (!conectadaEn(clave, 'forma')) continue;
      const par = PARES[clave];
      expect(par, `falta el par de valores para «${clave}»`).toBeDefined();
      if (par === undefined) continue;

      const orden = ordenCanonico(PAIS);
      const abajo = correr(conVariable(par.escenario, clave, par.bajo), PAIS, modoForma).corrida;
      const arriba = correr(conVariable(par.escenario, clave, par.alto), PAIS, modoForma).corrida;

      expect(
        JSON.stringify(serializarCorrida(abajo, par.escenario, orden)),
        `«${clave}» no cambia nada: o no está conectada, o el par de valores no la hace morder`,
      ).not.toBe(JSON.stringify(serializarCorrida(arriba, par.escenario, orden)));
    }
  });

  it('las que el modo NO lee están declaradas, no ausentes', () => {
    // Un dial que no hace nada es peor que una ausencia explicada.
    expect(conectadaEn('cumplimiento', 'forma')).toBe(false);
    expect(conectadaEn('chispa', 'forma')).toBe(false);
    expect(conectadaEn('participacion', 'gente')).toBe(false);
    expect(conectadaEn('PERIODOS_POR_ANIO', 'forma')).toBe(false);
  });
});

describe('GUARDA: el fuente se puede leer con las herramientas de siempre', () => {
  /**
   * Un byte de control crudo adentro de un `.ts` lo saca del mundo del texto:
   * `file` lo llama `data`, `grep` no encuentra nada y `rg` avisa \u00abbinary file
   * matches\u00bb sin mostrar una linea. Paso con `modo-gente.ts` \u2014dos NUL en un
   * template\u2014 y dejo ciego a todo el que buscara una funcion ahi adentro.
   *
   * El valor en tiempo de ejecucion de `\\u0000` y de un NUL crudo es el MISMO.
   * Lo unico que cambia es si el archivo se puede leer, asi que la regla no
   * cuesta nada y se afirma sobre el paquete entero y no sobre un archivo.
   */
  it('ningun fuente de civic-core tiene un byte de control crudo', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const url = await import('node:url');

    const raiz = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
    const fuentes: string[] = [];
    const recorrer = (dir: string): void => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const ruta = path.join(dir, e.name);
        if (e.isDirectory()) recorrer(ruta);
        else if (e.name.endsWith('.ts')) fuentes.push(ruta);
      }
    };
    recorrer(raiz);
    expect(fuentes.length).toBeGreaterThan(20);

    // Tab, salto de linea y retorno son texto; el resto de C0 no lo es.
    const CRUDOS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;
    for (const ruta of fuentes) {
      const hallado = CRUDOS.exec(fs.readFileSync(ruta, 'utf8'));
      const cual = hallado === null ? '' : hallado[0].charCodeAt(0).toString(16).padStart(4, '0');
      expect(
        hallado,
        `${ruta.slice(raiz.length + 1)} tiene U+${cual} crudo: escribilo como secuencia de escape o el archivo deja de ser buscable`,
      ).toBeNull();
    }
  });
});
