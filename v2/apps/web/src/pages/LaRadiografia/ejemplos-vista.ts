import {
  aristasMedidas,
  esferaDeFibonacci,
  espiralAurea,
  fraseDelNucleo,
  nucleosAlUmbral,
  similitudCoseno,
} from '@v2/civic-core';

import { vectoresDelEscenario } from './ejemplos/artefacto';
import { type NucleoEnPantalla } from './radiografia-data';
import { tangentes } from './radiografia-vista';

import type { ArtefactoDeVectores } from './ejemplos/artefacto';
import type { Escenario, Voz } from './ejemplos/tipos';
import type { AristaMedida, Particion, SenalParaNucleo } from '@v2/civic-core';
import type { AristaDeConvergencia, MiembroDeNucleo } from '~/lib/queries/radiografia';

/**
 * Los tres escenarios, medidos con el motor de verdad y dibujados en el
 * navegador.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §12 y
 * `docs/specs/2026-08-01-el-mapa-simulacion.md` §5.4.
 *
 * Este archivo **no reimplementa nada**. `aristasMedidas`, `nucleosAlUmbral` y
 * `fraseDelNucleo` son las mismas funciones de `@v2/civic-core` que corre el
 * servidor sobre el corpus vivo, y la geometría sale de las mismas
 * `esferaDeFibonacci` y `espiralAurea`. Lo único que cambia es de dónde vienen
 * los vectores: del artefacto commiteado y no de la base, porque el ejemplo
 * vive entero en el navegador de quien entra a la página.
 *
 * Eso es lo que hace que el ejemplo pueda enseñar: si acá hubiera un motor de
 * juguete, la conclusión —«la bronca converge más que la precisión»— sería una
 * propiedad del juguete y no del instrumento. Con el motor de verdad, la
 * conclusión es del instrumento, y el test la vuelve a medir en cada corrida.
 *
 * Dos cosas que este archivo **no** puede saber y por eso declara `null`:
 *
 *  - **los kilómetros.** El corpus no tiene coordenadas: sus barrios son
 *    inventados y ponerles un punto sería inventar un mapa. `distancia: null`
 *    se dibuja como raya, que es lo que corresponde a «no lo sé».
 *  - **la frase omitida.** Acá todas las voces pueden prestar su frase, porque
 *    ninguna es de nadie: las escribió una persona a mano para el ejemplo y el
 *    sello lo dice. En el corpus vivo eso lo decide la cesión de licencia.
 */

/* ── El rango del deslizador, que no es el de la página viva ─────────────── */

/**
 * El ejemplo se mueve entre 0,30 y 0,70, y los dos extremos están **medidos**,
 * no elegidos.
 *
 * Por debajo de 0,30 el `EmbebedorFalso` funde los tres escenarios en una sola
 * mancha —a 0,20 hasta el corpus preciso da un núcleo de 60 sobre 63— porque
 * una bolsa de palabras sin modelo comparte demasiado vocabulario funcional.
 * Por encima de 0,70 el escenario 3 ya no tiene ningún par: sus 63 voces quedan
 * solas, y un deslizador cuyo tercio superior está vacío para todos los
 * escenarios no es un mando, es una decoración.
 *
 * **No se hereda del 0,72 de la página viva** y no se puede: ese número está
 * calibrado —provisoriamente, y la spec §4.6 lo dice— para un modelo de verdad,
 * donde dos paráfrasis de la misma queja quedan a 0,8. Los cosenos del falso
 * viven más abajo y la escala entera está corrida.
 */
export const UMBRAL_MINIMO = 0.3;
export const UMBRAL_MAXIMO = 0.7;

/** El paso del deslizador y el del barrido que mide la banda. El mismo. */
export const PASO_DEL_UMBRAL = 0.01;

/** Radio del disco donde se acomodan las señales de un núcleo (φ, §5.6). */
const RADIO_DE_NUCLEO = 0.18;

/* ── La medición: una vez por escenario, y no depende del umbral ─────────── */

export interface MedidaDelEscenario {
  readonly escenario: Escenario;
  /** El grafo k-NN completo. **No depende del umbral**: el umbral lo corta. */
  readonly aristas: readonly AristaMedida[];
  readonly vectores: ReadonlyMap<string, readonly number[]>;
  /**
   * Con cuántas de las otras comparte **al menos una palabra** la voz mediana.
   *
   * Se mide todos contra todos y **no sobre el grafo k-NN**, a propósito: el
   * k-NN le da a cada voz exactamente `k` vecinas aunque no tenga ninguna
   * —rellena el cupo con parecido cero—, así que cualquier estadístico sacado
   * de sus aristas mide en parte el `k` que eligió el artefacto. Éste no
   * depende de `k` ni del deslizador: es una propiedad del corpus.
   *
   * Medido: **4** en la bronca, **19** en el reclamo, **41** en el dato, sobre
   * las otras 62. Y ahí está la sorpresa que esta cifra existe para mostrar:
   * **la bronca es la MENOS tejida de las tres.** Cada bronca comparte
   * vocabulario con cuatro de las otras sesenta y dos; cada dato, con cuarenta
   * y una, porque todos escribieron «2026» y todos escribieron un mes.
   */
  readonly vecindadMediana: number;
  /**
   * Cuánto se parecen dos voces **cuando se tocan** — la mediana sobre los
   * pares que comparten al menos una palabra, no sobre todos los pares.
   *
   * Es la otra mitad de la misma pregunta, y la que sí le da la razón a la
   * sección: **0,500** en la bronca contra **0,167** y **0,107**. Cuando dos
   * broncas se tocan se tocan casi enteras, y de ese puñado de enlaces casi
   * calcados sale la mancha de 31.
   *
   * Leídas juntas, las dos cifras dicen el mecanismo entero: **la bronca no
   * converge por tejido sino por repetición.** Pocos vínculos, casi copias. El
   * dato es lo contrario —mucho vínculo flojo, ninguno que aguante el umbral—
   * y por eso su constelación se desgrana.
   *
   * **Esto reemplazó a `medianaDeParecido` y a `umbralDeLaMancha` el 18/8/2026,
   * y no por cosmética.** La primera era la mediana sobre TODAS las aristas del
   * k-NN: mientras el escenario 1 repetía «nada» en 58 de sus 63 frases daba
   * 0,45 contra 0,17 y 0,18, o sea medía la muleta, y sacada la muleta el
   * 76,8 % de esas aristas son de cupo y valen cero, la mediana se iba a 0,000
   * y la fila decía lo contrario de lo que la sección afirma. La segunda era el
   * umbral más alto al que el mayor todavía tenía la mitad del corpus, y con la
   * mancha en 31 sobre 63 —una voz por debajo de la mitad— los tres escenarios
   * empataban abajo: la cifra dependía de una constante que había quedado justo
   * del lado equivocado.
   *
   * Condicionar a los pares que sí comparten algo **no es elegir el número que
   * queda lindo**: en una bolsa de palabras, parecido cero no es evidencia
   * débil, es ausencia de evidencia. Y la mitad incómoda —que la bronca es la
   * menos tejida— se publica en la fila de al lado, no se guarda.
   */
  readonly parecidoAlTocarse: number;
  /** Ids del artefacto que faltan. Con más de cero, la pantalla lo dice. */
  readonly faltantes: readonly string[];
}

export function medirEscenario(
  escenario: Escenario,
  artefacto: ArtefactoDeVectores,
): MedidaDelEscenario {
  const ids = escenario.voces.map((v) => v.id);
  const { vectores, faltantes } = vectoresDelEscenario(artefacto, escenario.id, ids);

  return {
    escenario,
    aristas: aristasMedidas(vectores, artefacto.k),
    vectores,
    ...formaDelTejido(ids, vectores),
    faltantes,
  };
}

/**
 * Todos contra todos: con cuántas comparte cada voz, y cuánto cuando comparte.
 *
 * Son 1.953 pares por escenario sobre vectores de 1.024 dimensiones — seis
 * millones de multiplicaciones para los tres, una sola vez, cuando monta la
 * sección. Cuesta menos que un cuadro de la constelación, y a cambio ninguna de
 * las dos cifras hereda el `k` del artefacto.
 */
function formaDelTejido(
  ids: readonly string[],
  vectores: ReadonlyMap<string, readonly number[]>,
): Pick<MedidaDelEscenario, 'vecindadMediana' | 'parecidoAlTocarse'> {
  const vecinas = new Array<number>(ids.length).fill(0);
  const alTocarse: number[] = [];

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const similitud = similitudCoseno(
        vectores.get(ids[i] ?? '') ?? [],
        vectores.get(ids[j] ?? '') ?? [],
      );
      // Cero no es «se parecen poco»: es que no comparten un solo token de
      // contenido. No entra ni al grado ni a la mediana condicionada.
      if (similitud <= 0) continue;
      vecinas[i] = (vecinas[i] ?? 0) + 1;
      vecinas[j] = (vecinas[j] ?? 0) + 1;
      alTocarse.push(similitud);
    }
  }

  return { vecindadMediana: mediana(vecinas), parecidoAlTocarse: mediana(alTocarse) };
}

/** La mediana de una lista, o 0 si está vacía. Ordena una copia, no el original. */
const mediana = (xs: readonly number[]): number => {
  if (xs.length === 0) return 0;
  const ordenados = [...xs].sort((a, b) => a - b);
  return ordenados[Math.floor(ordenados.length / 2)] ?? 0;
};

export const mayorDe = (particion: Particion): number =>
  Math.max(0, ...particion.nucleos.map((n) => n.ids.length));

/* ── De qué cuelga la lección, medido en todo el mando ───────────────────── */

/** Cuántas posiciones tiene el deslizador del ejemplo, extremos incluidos. */
export const PASOS_DEL_MANDO =
  Math.round(UMBRAL_MAXIMO / PASO_DEL_UMBRAL) - Math.round(UMBRAL_MINIMO / PASO_DEL_UMBRAL) + 1;

/**
 * Cuántos pasos del mando sostiene cada lectura, contados de dos maneras.
 *
 * Cada número cuenta pasos **a favor**: cuántas de las {@link PASOS_DEL_MANDO}
 * posiciones del deslizador dan el orden que la lección afirma.
 */
export interface CuentaDeLaEscalera {
  /** Cuántas voces caen en la mancha más grande: tiene que ir bajando. */
  readonly mayor: number;
  /** Cuántas voces no repitió nadie: tiene que ir subiendo. */
  readonly solas: number;
  /** Cuántos núcleos hay: es la lectura que se da vuelta. */
  readonly conteo: number;
}

export interface Escalera {
  readonly pasos: number;
  /** Pasos en los que la lectura ordena los **tres** escenarios en fila. */
  readonly cadena: CuentaDeLaEscalera;
  /** Pasos en los que ordena los **dos extremos**: el más vago y el más preciso. */
  readonly extremos: CuentaDeLaEscalera;
  /** El primer umbral en el que el conteo deja de ordenar los tres. `null` si nunca. */
  readonly seDaVuelta: number | null;
}

/**
 * **La lección no cuelga del conteo de núcleos, y esto es por qué.**
 *
 * El ejemplo afirma que cuanto más preciso escribe la gente, peor se ve la
 * imagen. Hay tres maneras de medir «peor se ve» y **no dicen lo mismo**:
 *
 *  - el **tamaño del mayor** —cuántas voces caen en la mancha más grande—,
 *  - las **voces solas** —cuántas no las repitió nadie—,
 *  - y el **conteo de núcleos**.
 *
 * Barriendo el mando entero de a un paso, las dos primeras aguantan en las
 * cuarenta y un posiciones y la tercera **se da vuelta**: pasado cierto umbral
 * la mancha de la bronca se desgrana en pedacitos y pasa a mostrar *más*
 * núcleos que el corpus preciso, que a esa altura ya casi no tiene ninguno. No
 * es una anomalía del corpus: es aritmética de un umbral alto sobre un grafo
 * denso, y le va a pasar a cualquier corpus vago.
 *
 * Frente a eso había dos salidas honestas —declarar la banda en la que la
 * lectura vale, o dejar de colgar la lección del conteo— y se eligió **la
 * segunda**, por tres razones:
 *
 *  1. Declarar una banda es elegir el rango en el que el ejemplo tiene razón, y
 *     un ejemplo que necesita que no muevas la perilla más allá de 0,62 enseña
 *     a desconfiar de la perilla, no del instrumento. El mando existe para que
 *     el lector empuje hasta romper la imagen (R7).
 *  2. El conteo de núcleos **nunca fue la lección**. La lección es que la
 *     bronca produce una mancha enorme que no habilita nada; el tamaño de esa
 *     mancha y la cantidad de voces que quedan afuera son literalmente eso, y
 *     el conteo es un subproducto.
 *  3. Y las dos que sí sostienen se pueden verificar en todo el rango en vez de
 *     en un tramo elegido. Lo que esta función devuelve es esa verificación, y
 *     la pantalla imprime sus tres números **medidos**, incluido el que le
 *     queda mal.
 *
 * Nada de esto se esconde: la pantalla dice en qué paso se da vuelta el conteo
 * y por qué eso no mueve la conclusión.
 */
export function medirLaEscalera(medidas: readonly MedidaDelEscenario[]): Escalera {
  const desde = Math.round(UMBRAL_MINIMO / PASO_DEL_UMBRAL);
  const hasta = Math.round(UMBRAL_MAXIMO / PASO_DEL_UMBRAL);
  const ids = medidas.map((m) => m.escenario.voces.map((v) => v.id));

  const cadena = { mayor: 0, solas: 0, conteo: 0 };
  const extremos = { mayor: 0, solas: 0, conteo: 0 };
  let seDaVuelta: number | null = null;

  for (let paso = desde; paso <= hasta; paso++) {
    const umbral = paso * PASO_DEL_UMBRAL;
    const corte = medidas.map((medida, i) => {
      const particion = nucleosAlUmbral(ids[i] ?? [], medida.aristas, umbral);
      return {
        mayor: mayorDe(particion),
        solas: particion.solas.length,
        conteo: particion.nucleos.length,
      };
    });

    // «En fila» es de a pares consecutivos: la mancha nunca crece al pasar a un
    // corpus más preciso, las voces solas nunca bajan, los núcleos nunca bajan.
    const enFila = (leer: (c: (typeof corte)[number]) => number, baja: boolean): boolean =>
      corte.every((c, i) => {
        const siguiente = corte[i + 1];
        if (siguiente === undefined) return true;
        return baja ? leer(c) >= leer(siguiente) : leer(c) <= leer(siguiente);
      });

    if (enFila((c) => c.mayor, true)) cadena.mayor++;
    if (enFila((c) => c.solas, false)) cadena.solas++;
    if (enFila((c) => c.conteo, false)) cadena.conteo++;
    else seDaVuelta ??= umbral;

    const vago = corte[0];
    const preciso = corte[corte.length - 1];
    if (vago !== undefined && preciso !== undefined) {
      if (vago.mayor >= preciso.mayor) extremos.mayor++;
      if (vago.solas <= preciso.solas) extremos.solas++;
      if (vago.conteo <= preciso.conteo) extremos.conteo++;
    }
  }

  return { pasos: PASOS_DEL_MANDO, cadena, extremos, seDaVuelta };
}

/* ── El corte: depende del umbral, y es lo que se dibuja ─────────────────── */

export interface CorteDelEscenario {
  readonly nucleos: readonly NucleoEnPantalla[];
  readonly solas: readonly MiembroDeNucleo[];
  /** Las visibles a este umbral, para el pintor. Todas medidas: no hay adhesiones. */
  readonly aristas: readonly AristaDeConvergencia[];
  readonly mayor: number;
}

export function cortarEscenario(medida: MedidaDelEscenario, umbral: number): CorteDelEscenario {
  const { escenario, aristas, vectores } = medida;
  const porId = new Map<string, Voz>(escenario.voces.map((v) => [v.id, v]));
  const particion = nucleosAlUmbral(
    escenario.voces.map((v) => v.id),
    aristas,
    umbral,
  );

  // Las voces solas entran en el MISMO reparto de la esfera que los núcleos
  // (§6): una señal que nadie repitió no es un residuo que va al fondo de la
  // escena, es una voz sola y ocupa su lugar en el cielo. Es lo mismo que hace
  // `centrosDelCielo` en el servidor.
  const centros = esferaDeFibonacci(particion.nucleos.length + particion.solas.length);

  const nucleos: NucleoEnPantalla[] = particion.nucleos.map((nucleo, i) => {
    const centro = centros[i] ?? { x: 0, y: 0, z: 0 };
    const disco = espiralAurea(nucleo.ids.length, RADIO_DE_NUCLEO);
    const [ejeU, ejeV] = tangentes(centro);

    const clases: Record<string, number> = {};
    const provincias = new Set<string>();
    const miembros: MiembroDeNucleo[] = nucleo.ids.map((id, j) => {
      const voz = porId.get(id);
      const clase = voz?.clase ?? 'desconocida';
      clases[clase] = (clases[clase] ?? 0) + 1;
      if (voz) provincias.add(voz.provincia);
      const d = disco[j] ?? { x: 0, y: 0 };
      return {
        id,
        clase,
        x: centro.x + ejeU.x * d.x + ejeV.x * d.y,
        y: centro.y + ejeU.y * d.x + ejeV.y * d.y,
        z: centro.z + ejeU.z * d.x + ejeV.z * d.y,
      };
    });

    // La frase la elige el motor: la señal REAL más cercana al centro del
    // núcleo (R8). La máquina elige cuál mostrar, nunca qué decir — y acá
    // todas las frases las escribió una persona a mano, lo que el sello dice
    // con todas las letras.
    const senales: SenalParaNucleo[] = nucleo.ids.map((id) => ({
      id,
      vector: vectores.get(id) ?? [],
      texto: porId.get(id)?.texto ?? null,
      punto: null,
    }));

    const frase = fraseDelNucleo(senales);

    return {
      id: `ejemplo:${escenario.id}:${nucleo.ids[0] ?? String(i)}`,
      frase,
      // Acá no hay cesión que falte: todas las frases del ejemplo pueden
      // prestarse. Si igual no hay una, es que al artefacto le falta el vector
      // de esa voz, y eso se dice en vez de dejar la ficha muda.
      textoOmitido: frase ? null : 'al artefacto de vectores le falta esta voz',
      senales: nucleo.ids.length,
      clases,
      provincias: provincias.size,
      // El corpus no tiene coordenadas y no las va a tener: sus barrios son
      // inventados. Una raya es lo honesto; un número sería un mapa inventado.
      distancia: null,
      miembros,
    };
  });

  const solas: MiembroDeNucleo[] = particion.solas.map((id, j) => {
    const centro = centros[particion.nucleos.length + j] ?? { x: 0, y: 0, z: 0 };
    return { id, clase: porId.get(id)?.clase ?? 'desconocida', ...centro };
  });

  const visibles: AristaDeConvergencia[] = aristas
    .filter((a) => a.similitud >= umbral)
    .map((a) => ({ a: a.a, b: a.b, similitud: a.similitud, tipo: 'medida' }));

  return { nucleos, solas, aristas: visibles, mayor: mayorDe(particion) };
}
