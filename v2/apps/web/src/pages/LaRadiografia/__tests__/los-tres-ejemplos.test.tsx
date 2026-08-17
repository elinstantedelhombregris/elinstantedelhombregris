import { fireEvent, render, screen, within } from '@testing-library/react';
import { EmbebedorFalso } from '@v2/civic-core';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  cifrasDeLegitimidad,
  LOS_TRES_ESCENARIOS,
  UMBRAL_DEL_EJEMPLO,
  type Escenario,
} from '../ejemplos';
import { densificar, digestoDeCorpus } from '../ejemplos/artefacto';
import { ARTEFACTO_DE_VECTORES } from '../ejemplos/vectores';
import {
  cortarEscenario,
  medirEscenario,
  UMBRAL_MAXIMO,
  UMBRAL_MINIMO,
  type MedidaDelEscenario,
} from '../ejemplos-vista';
import { LosTresEjemplos } from '../sections/LosTresEjemplos';

/**
 * Los tres ejemplos — lo que la sección afirma, medido.
 *
 * Esta sección **afirma cosas sobre el instrumento**, y son incómodas: que la
 * bronca converge más que la precisión, que la imagen más impresionante es la
 * menos útil, que la legitimidad no se mueve con la calidad del texto. Ninguna
 * de esas afirmaciones puede quedar sólo escrita en la pantalla: cada una se
 * vuelve a medir acá, con el motor de verdad y el corpus de verdad, y el día
 * que deje de ser cierta este archivo se pone rojo antes que la página mienta.
 *
 * **Lo que este test NO hace es forzar los números.** Se verificó primero, con
 * el motor, qué formas produce cada escenario; las afirmaciones que quedaron
 * escritas son las que el corpus sostiene y no las que hubieran quedado más
 * lindas. La diferencia está anotada en el bloque de «la mancha», abajo.
 */

const medidas = new Map<string, MedidaDelEscenario>();

const medidaDe = (escenario: Escenario): MedidaDelEscenario => {
  const m = medidas.get(escenario.id);
  if (m === undefined) throw new Error(`sin medida para ${escenario.id}`);
  return m;
};

/**
 * Los tres, buscados por id y no desestructurados.
 *
 * `LOS_TRES_ESCENARIOS[0]` es `Escenario | undefined` con
 * `noUncheckedIndexedAccess`, y resolver eso con un `!` o un `as` sería tapar
 * con sintaxis la única pregunta que importa acá: si el barril dejara de
 * exportar los tres, este test tiene que romperse ruidoso y no pasar a medias.
 */
const buscar = (id: string): Escenario => {
  const escenario = LOS_TRES_ESCENARIOS.find((e) => e.id === id);
  if (escenario === undefined) throw new Error(`el corpus no exporta el escenario ${id}`);
  return escenario;
};

const BRONCA = buscar('bronca');
const RECLAMO = buscar('reclamo');
const DATO = buscar('dato');

/** El corte a un umbral, con el umbral del ejemplo por defecto. */
const corteA = (escenario: Escenario, umbral = UMBRAL_DEL_EJEMPLO) =>
  cortarEscenario(medidaDe(escenario), umbral);

beforeAll(() => {
  for (const escenario of LOS_TRES_ESCENARIOS) {
    medidas.set(escenario.id, medirEscenario(escenario, ARTEFACTO_DE_VECTORES));
  }
});

describe('el artefacto de vectores', () => {
  it('reproduce exactamente lo que devuelve el EmbebedorFalso', async () => {
    const embebedor = new EmbebedorFalso();
    expect(ARTEFACTO_DE_VECTORES.modelo).toBe(embebedor.modelo);
    expect(ARTEFACTO_DE_VECTORES.dimensiones).toBe(embebedor.dimensiones);

    for (const escenario of LOS_TRES_ESCENARIOS) {
      const frescos = await embebedor.embeber(escenario.voces.map((v) => v.texto));
      const guardados = ARTEFACTO_DE_VECTORES.escenarios[escenario.id];
      expect(guardados).toBeDefined();

      escenario.voces.forEach((voz, i) => {
        const codificado = guardados?.[voz.id];
        expect(codificado).toBeDefined();
        expect(densificar(codificado ?? '', ARTEFACTO_DE_VECTORES.dimensiones)).toEqual(
          frescos[i] === undefined ? null : [...(frescos[i] ?? [])],
        );
      });
    }
  });

  it('declara el digesto del corpus que embebió: si alguien toca una coma, no coincide', () => {
    expect(ARTEFACTO_DE_VECTORES.digesto).toBe(digestoDeCorpus(LOS_TRES_ESCENARIOS));
  });

  it('no le falta ninguna voz de ningún escenario', () => {
    for (const escenario of LOS_TRES_ESCENARIOS) {
      expect(medidaDe(escenario).faltantes).toEqual([]);
    }
  });
});

describe('las formas que promete la tesis', () => {
  /*
   * **Este número bajó a propósito, el 17/8/2026.** La primera versión del
   * escenario 1 daba un núcleo de 60 sobre 63, y esa cifra la fabricaba una
   * muleta: «nada» en 58 de las 63 frases y la coletilla literal «acá nunca
   * cambia nada» en cinco. Reescrito sin muleta da 31, y 31 sigue siendo casi
   * el triple que el mayor del reclamo. Lo que se perdió no fue la lección:
   * fue el brillo que le habíamos puesto encima.
   */
  it('el 1 da el grupo más grande de los tres: 31 de 63 voces', () => {
    const corte = corteA(BRONCA);
    expect(corte.mayor).toBe(31);
    expect(corte.solas).toHaveLength(19);
    expect(corte.nucleos.length).toBeLessThan(corteA(RECLAMO).nucleos.length);
  });

  it('el 2 se rompe en varios más chicos', () => {
    const corte = corteA(RECLAMO);
    expect(corte.nucleos.length).toBeGreaterThan(1);
    expect(corte.mayor).toBeLessThan(corteA(BRONCA).mayor);
  });

  it('el 3 se rompe todavía más, y es el único con corroboración', () => {
    const dato = corteA(DATO);
    const reclamo = corteA(RECLAMO);
    expect(dato.nucleos.length).toBeGreaterThan(reclamo.nucleos.length);
    expect(dato.mayor).toBeLessThan(reclamo.mayor);
  });

  /*
   * **Acá se perdió algo al sacar la muleta, y se dice en vez de taparlo.**
   *
   * Con «nada» en 58 de 63 frases, el escenario 1 daba la mancha más grande en
   * TODO el rango del deslizador, y este test lo afirmaba así. Sin la muleta ya
   * no: el orden `bronca ≥ reclamo, dato` vale en la banda **0,34–0,50** y no
   * fuera de ella. Por debajo de 0,34 el `EmbebedorFalso` funde los tres —a
   * 0,30 hasta el corpus preciso da 40 sobre 63, que es un artefacto de la
   * bolsa de palabras y no una propiedad del corpus— y por encima de 0,50 los
   * tres quedan en un puñado y el orden se cruza.
   *
   * Que el «todo el rango» de antes fuera obra de la muleta es exactamente el
   * hallazgo. Se fija la banda medida, no una banda cómoda.
   */
  const BANDA = { desde: 0.34, hasta: 0.5 } as const;

  it('en la banda 0,34–0,50 la bronca da la mancha más grande de las tres', () => {
    for (let paso = Math.round(BANDA.desde * 100); paso <= Math.round(BANDA.hasta * 100); paso++) {
      const umbral = paso / 100;
      const bronca = corteA(BRONCA, umbral).mayor;
      expect(corteA(DATO, umbral).mayor).toBeLessThanOrEqual(bronca);
      expect(corteA(RECLAMO, umbral).mayor).toBeLessThanOrEqual(bronca);
    }
  });

  it('y el umbral del ejemplo cae adentro de esa banda, no en su borde', () => {
    expect(UMBRAL_DEL_EJEMPLO).toBeGreaterThan(BANDA.desde);
    expect(UMBRAL_DEL_EJEMPLO).toBeLessThan(BANDA.hasta);
    // La mancha no se mueve en toda la banda: el deslizador no la puede
    // desarmar de un paso, que es lo que pasaba cuando los enlaces vivían
    // todos apretados contra el umbral.
    expect(corteA(BRONCA, BANDA.desde).mayor).toBe(corteA(BRONCA, BANDA.hasta).mayor);
  });

  it('fuera de la banda no se sostiene, y el rango del mando la excede', () => {
    // No es un detalle: el deslizador llega a 0,30 y a 0,70, así que quien lo
    // arrastre hasta las puntas VA a ver el orden invertido. La página no
    // puede prometer lo contrario.
    expect(UMBRAL_MINIMO).toBeLessThan(BANDA.desde);
    expect(UMBRAL_MAXIMO).toBeGreaterThan(BANDA.hasta);
    expect(corteA(DATO, UMBRAL_MINIMO).mayor).toBeGreaterThan(corteA(BRONCA, UMBRAL_MINIMO).mayor);
  });
});

describe('la bronca converge más que la precisión', () => {
  /*
   * **`medianaDeParecido` y `umbralDeLaMancha` dejaron de discriminar el
   * 17/8/2026, y este bloque lo fija en vez de esconderlo.**
   *
   * Las dos cifras medían la muleta. `medianaDeParecido` es la mediana sobre
   * TODAS las aristas del k-NN, y con «nada» en 58 de 63 frases no había una
   * sola arista en cero: daba 0,45 contra 0,17 y 0,18. Sin la muleta el
   * escenario 1 tiene 19 voces que no comparten una palabra con nadie, sus 12
   * vecinas valen cero, y la mediana se va a **0,000** — o sea, ahora la cifra
   * dice lo contrario de lo que la sección afirma arriba de ella. Con
   * `umbralDeLaMancha` pasa parecido: era 0,61 contra 0,33 y 0,31, y ahora los
   * tres empatan abajo.
   *
   * No se borra el dato ni se retoca el corpus para que vuelva a dar lindo: se
   * mide y se deja escrito que **estas dos filas de `TablaDeLosTres` ya no
   * sostienen la lección**, y que la cifra que sí la sostiene es el tamaño del
   * núcleo mayor en la banda medida. Cambiar el estadístico de la tabla es
   * trabajo de quien la mantiene, y esta prueba se va a poner roja el día que
   * lo cambie — que es exactamente cuando hay que volver a leer esto.
   */
  it('la mediana del parecido YA NO discrimina: mide vocabulario repartido, no convergencia', () => {
    expect(medidaDe(BRONCA).medianaDeParecido).toBe(0);
    expect(medidaDe(RECLAMO).medianaDeParecido).toBeGreaterThan(0);
    expect(medidaDe(DATO).medianaDeParecido).toBeGreaterThan(0);
  });

  it('el umbral de la mancha tampoco: los tres empatan dentro de un paso', () => {
    const umbrales = [BRONCA, RECLAMO, DATO].map((e) => medidaDe(e).umbralDeLaMancha ?? 0);
    expect(Math.max(...umbrales) - Math.min(...umbrales)).toBeLessThan(0.03);
  });

  it('la cifra que sí sostiene la lección es el núcleo mayor, y triplica al del reclamo', () => {
    const mayor = (e: Escenario): number => cortarEscenario(medidaDe(e), UMBRAL_DEL_EJEMPLO).mayor;
    expect(mayor(BRONCA)).toBeGreaterThan(2 * mayor(RECLAMO));
    expect(mayor(BRONCA)).toBeGreaterThan(5 * mayor(DATO));
  });

  it('y el que más converge no habilita ningún mandato', () => {
    expect(BRONCA.mandato.hay).toBe(false);
    expect(DATO.mandato.hay).toBe(true);
  });
});

describe('las frases de los núcleos son frases reales del corpus', () => {
  it('ninguna es generada: todas están escritas en alguna voz', () => {
    for (const escenario of LOS_TRES_ESCENARIOS) {
      const dichas = new Set(escenario.voces.map((v) => v.texto));
      for (const nucleo of cortarEscenario(medidaDe(escenario), UMBRAL_DEL_EJEMPLO).nucleos) {
        expect(nucleo.frase).not.toBeNull();
        expect(dichas.has(nucleo.frase?.texto ?? '')).toBe(true);
      }
    }
  });
});

describe('la sección en pantalla', () => {
  it('monta con los tres escenarios y arranca en el primero', () => {
    render(<LosTresEjemplos tema="papel" />);
    for (const escenario of LOS_TRES_ESCENARIOS) {
      expect(
        screen.getByRole('button', { name: new RegExp(escenario.titulo) }),
      ).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: /La bronca/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('reusa el sello de sintético, con su frase intacta', () => {
    render(<LosTresEjemplos tema="papel" />);
    expect(screen.getByText('Nadie dijo ninguna de estas cosas.')).toBeInTheDocument();
    expect(screen.getByText('Población sintética')).toBeInTheDocument();
  });

  /**
   * El lienzo es `aria-hidden` y el ejemplo no puede existir sólo ahí (R11).
   * La lista no es una versión de consuelo: es donde la lección se toca, porque
   * es lo único que muestra **las frases**. Las del núcleo grande de la bronca
   * no tienen ni lugar ni fecha; las del dato traen calle y día.
   */
  it('tiene un camino accesible a los núcleos, con sus frases', () => {
    render(<LosTresEjemplos tema="papel" />);
    const filas = (): number =>
      within(screen.getByRole('table', { name: /Los núcleos de convergencia/ })).getAllByRole('row')
        .length;
    // Seis núcleos en la bronca —más la cabecera— y diez en el dato: la lista
    // se alarga a medida que el corpus mejora, que es la lección al revés.
    expect(filas()).toBe(corteA(BRONCA).nucleos.length + 1);

    fireEvent.click(screen.getByRole('button', { name: /El dato/ }));
    expect(filas()).toBe(corteA(DATO).nucleos.length + 1);
    expect(corteA(DATO).nucleos.length).toBeGreaterThan(corteA(BRONCA).nucleos.length);
  });

  it('la tabla muestra la MISMA legitimidad en las tres columnas', () => {
    render(<LosTresEjemplos tema="papel" />);
    const fila = screen.getByRole('row', { name: /Legitimidad/ });
    const celdas = within(fila).getAllByRole('cell');
    expect(celdas).toHaveLength(3);
    const esperado = cifrasDeLegitimidad(BRONCA).legitimidad.toFixed(3).replace('.', ',');
    for (const celda of celdas) expect(celda).toHaveTextContent(esperado);
  });

  it('y el mandato NO es el mismo: en la bronca no hay ninguno, y dice por qué', () => {
    render(<LosTresEjemplos tema="papel" />);
    const fila = screen.getByRole('row', { name: /El mandato que habilita/ });
    const celdas = within(fila).getAllByRole('cell');
    expect(celdas[0]).toHaveTextContent('Ninguno.');
    expect(celdas[0]).toHaveTextContent(/Sin lugar no hay a quién reclamarle/);
    expect(celdas[2]).toHaveTextContent(/30 días corridos/);
  });

  it('cambiar de escenario recalcula la constelación en vivo', () => {
    render(<LosTresEjemplos tema="papel" />);
    const mando = screen.getByRole('slider');
    const glosa = () => mando.getAttribute('aria-describedby');
    const leer = (): string => document.getElementById(glosa() ?? '')?.textContent ?? '';

    expect(leer()).toMatch(/^6 núcleos · 19 voces solas/);
    fireEvent.click(screen.getByRole('button', { name: /El dato/ }));
    expect(leer()).toMatch(/^10 núcleos · 37 voces solas/);
  });

  it('el deslizador funciona acá, y adentro de la banda la mancha no se rompe', () => {
    render(<LosTresEjemplos tema="papel" />);
    const mando = screen.getByRole('slider');
    expect(mando).toHaveAttribute('min', String(UMBRAL_MINIMO));
    expect(mando).toHaveAttribute('max', String(UMBRAL_MAXIMO));

    const mayorEnLaTabla = (): string =>
      within(screen.getByRole('row', { name: /El mayor/ })).getAllByRole('cell')[0]?.textContent ??
      '';

    expect(mayorEnLaTabla()).toBe('31 de 63');
    // Se mueve el mando de punta a punta de la banda medida y la mancha queda
    // igual: los enlaces del corpus no viven todos apretados contra el umbral.
    fireEvent.change(mando, { target: { value: '0.5' } });
    expect(mayorEnLaTabla()).toBe('31 de 63');
    // Y afuera de la banda se rompe, que también se puede ver. El ejemplo no
    // promete una mancha eterna: promete una banda, y dice cuál.
    fireEvent.change(mando, { target: { value: '0.55' } });
    expect(Number(mayorEnLaTabla().split(' ')[0])).toBeLessThan(31);
  });

  it('declara qué no puede ver: la provincia muda va por su nombre', () => {
    render(<LosTresEjemplos tema="papel" />);
    expect(screen.getByText(/De Formosa no habló nadie/)).toBeInTheDocument();
  });

  /**
   * La página viva no puede contar personas —`senales` no trae actor— y hay un
   * test que se lo prohíbe. El ejemplo sí puede y **debe**: su padrón declara
   * quién habló, y que 63 señales sean 44 personas es media lección.
   */
  it('sí cuenta personas, porque su padrón declara quién habló', () => {
    const { container } = render(<LosTresEjemplos tema="papel" />);
    expect(container.textContent).toMatch(/63 señales de 44 personas/);
    const fila = screen.getByRole('row', { name: /Actores distintos/ });
    expect(within(fila).getAllByRole('cell')[0]).toHaveTextContent('44');
  });
});
