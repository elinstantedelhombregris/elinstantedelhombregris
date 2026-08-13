/**
 * El elenco congelado — lo que hace imposible el error que no da error.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §2.5, §3.8 y §7.1.
 *
 * ## El error
 *
 * El análisis de sensibilidad necesita cientos o miles de corridas. Escribir
 * una población con un modelo local cuesta horas: el presupuesto medido del
 * §4.2.1 son 2 h 43 min para mil personas, y la dinámica que las usa corre en
 * 1,888 ms. **El elenco cuesta unas 5.200 veces lo que cuesta el barrido
 * entero que lo consume.**
 *
 * Si la población se regenerara en cada corrida, estarías midiendo la varianza
 * del modelo y creyendo que medís la palanca. No tira, no avisa, y devuelve
 * números plausibles — por eso es caro.
 *
 * ## Por qué acá y no en `poblacion.ts`
 *
 * `poblacion.ts` tiene **la forma**: qué es una persona y cómo se calcula la
 * huella de un conjunto. Esto tiene **el acto de congelar**: la marca que sólo
 * este archivo puede poner, el sello del modelo que la escribió, el sesgo que
 * la regla 5 exige mostrar antes que ningún resultado, y la atadura a un país
 * concreto.
 *
 * Y la atadura al país se **verifica** acá: cada persona dice en qué territorio
 * del motor cae, y congelar comprueba que ese territorio exista en el país
 * contra el que se la va a correr. Una persona atada a un territorio que el
 * país no conoce no rompe nada a la vista —sus voces simplemente no se cuentan
 * en ningún lado y el total cierra igual—, que es la fuga silenciosa que este
 * módulo existe para no tener.
 */
import { huellaDePoblacion } from './poblacion.js';

import type { Persona, Poblacion } from './poblacion.js';
import type { SelloDelModelo } from './procedencia.js';
import type { Territorio } from './tipos.js';

/**
 * El sesgo del elenco — la regla 5, obligatoria y primera.
 *
 * «Participación no equivale a representatividad» pesa el doble en un elenco
 * generado: la población que escribe el modelo tiene el sesgo del corpus con
 * que se la sembró, y ese corpus es **una sola voz, la del proyecto**. Viaja
 * como campo declarado y es la primera pantalla del modo gente, antes de
 * cualquier resultado — no una nota al pie debajo de un mapa.
 */
export interface SesgoDeElenco {
  /** Qué documentos lo produjeron y cuántas personas salieron de cada uno. */
  readonly corpus: readonly { documento: string; sha: string; personas: number }[];
  /** Cómo se reparte el elenco contra cómo se reparte el país. */
  readonly porTerritorio: readonly {
    territorioId: string;
    personas: number;
    fraccionElenco: number;
    fraccionPais: number;
    /** `fraccionElenco − fraccionPais`. Positivo = sobrerrepresentado. */
    desvio: number;
  }[];
  /**
   * Territorios del país sin una sola persona en el elenco.
   *
   * Lista y no un cero: no es lo mismo «acá no habló nadie» que «acá no hay
   * nadie que pueda hablar». La segunda es una propiedad del instrumento.
   */
  readonly territoriosSinPersona: readonly string[];
  /** Va escrita, arriba, y no se puede cerrar. */
  readonly advertencia: string;
}

export const ADVERTENCIA_DE_SESGO =
  'Esta población la escribió un modelo leyendo el corpus del proyecto: los PLANes, los ' +
  'ensayos y la bitácora. Es una sola voz. Lo que diga este elenco es una hipótesis sobre ' +
  'una población posible, nunca una medición del país.';

/**
 * La marca de congelado.
 *
 * `declare const` de un `unique symbol` que **no se exporta**: nadie afuera de
 * este archivo puede escribir esa propiedad, así que el único camino para
 * tener un `Elenco` es `congelarElenco()`. No es una convención ni buena fe —
 * es que el tipo no se puede construir de otra forma, ni con un objeto literal
 * ni leyéndolo del disco sin pasar por la verificación de huella.
 */
declare const CONGELADO: unique symbol;

export interface Elenco {
  readonly [CONGELADO]: true;
  readonly poblacion: Poblacion;
  /**
   * De qué corrida de qué modelo salió — la D5 de la ADR 0009.
   *
   * `null` cuando lo escribió el escritor determinista y no un modelo. Una
   * población fabricada por una fórmula **no es** una hipótesis de modelo, y
   * darle un sello inventado sería exactamente la mentira que la cuarta
   * procedencia existe para impedir.
   */
  readonly sello: SelloDelModelo | null;
  readonly sesgo: SesgoDeElenco;
  /**
   * El territorio del motor de cada persona, por índice.
   *
   * Se **deriva** de `persona.territorio.territorioId` al congelar y se guarda
   * plano porque la dinámica lo lee una vez por persona y por ronda: un array
   * de strings es lo que evita dos saltos de puntero en el bucle caliente.
   * Que se derive y no se pase es lo que impide que diga otra cosa que la
   * persona.
   */
  readonly territorioDe: readonly string[];
}

/** Lo que hace falta para congelar. La huella no está: se calcula. */
export interface ElencoCrudo {
  readonly personas: readonly Persona[];
  /** El elenco del que se derivó al editarlo, si hubo uno (regla 6, reversible). */
  readonly padre: string | null;
  /** Sin `poblacionHuella`: no se puede sellar con una huella que todavía no existe. */
  readonly sello: Omit<SelloDelModelo, 'poblacionHuella'> | null;
  readonly corpus: readonly { documento: string; sha: string; personas: number }[];
}

/** Congela en profundidad: mutar después tira, en vez de corromper en silencio. */
function congelarHondo<T>(valor: T): T {
  if (valor === null || typeof valor !== 'object') return valor;
  if (Object.isFrozen(valor)) return valor;
  Object.freeze(valor);
  for (const clave of Object.getOwnPropertyNames(valor)) {
    congelarHondo((valor as Record<string, unknown>)[clave]);
  }
  return valor;
}

/**
 * El único camino para tener un `Elenco`.
 *
 * Verifica lo que un elenco roto rompería en silencio —ids corridos, vínculos
 * colgados, una atadura de otro largo—, calcula la huella sobre el contenido,
 * la mete en el sello, mide el sesgo y congela todo.
 */
export function congelarElenco(
  crudo: ElencoCrudo,
  territorios: readonly Territorio[],
): Elenco {
  const { personas } = crudo;
  const territorioDe = personas.map((p) => p.territorio.territorioId);
  if (personas.length === 0) {
    throw new Error(
      'Un elenco vacío no es una población: la dinámica no tendría a quién sortear y devolvería ' +
        'una cosecha vacía que en pantalla se ve igual que un país en silencio.',
    );
  }

  const conocidos = new Set(territorios.map((t) => t.id));
  for (const [indice, persona] of personas.entries()) {
    if (persona.id !== indice) {
      throw new Error(
        `La persona en la posición ${String(indice)} dice tener id ${String(persona.id)}. Los ids ` +
          'son el índice en el elenco porque los vínculos apuntan por índice: con un id corrido, ' +
          'cada persona miraría a otra y la topología entera sería otra.',
      );
    }
    for (const vinculo of persona.conducta.vinculos) {
      if (!Number.isInteger(vinculo) || vinculo < 0 || vinculo >= personas.length) {
        throw new Error(
          `La persona ${String(persona.id)} tiene un vínculo a ${String(vinculo)}, que no existe en ` +
            `un elenco de ${String(personas.length)}. Un vínculo colgado se lee como «nadie» y baja ` +
            'el contagio sin que nada avise.',
        );
      }
    }
    const territorioId = territorioDe[indice];
    if (territorioId === undefined || !conocidos.has(territorioId)) {
      throw new Error(
        `La persona ${String(indice)} está atada al territorio «${String(territorioId)}», que este ` +
          'país no conoce. Sus voces no se contarían en ningún lado y el total cerraría igual: ' +
          'exactamente la fuga silenciosa que este módulo existe para no tener.',
      );
    }
  }

  const huella = huellaDePoblacion(personas);
  const sello: SelloDelModelo | null =
    crudo.sello === null ? null : { ...crudo.sello, poblacionHuella: huella };
  const poblacion: Poblacion = { huella, personas, padre: crudo.padre, sello };

  const elenco = {
    poblacion,
    sello,
    sesgo: medirSesgo(territorioDe, territorios, crudo.corpus),
    territorioDe,
  } as unknown as Elenco;

  return congelarHondo(elenco);
}

/**
 * Recalcula la huella y la contrasta con la declarada.
 *
 * El caso real es un elenco leído del disco: si el manifiesto dice una huella
 * y el contenido da otra, alguien editó el archivo a mano o el escritor cambió
 * de versión, y correr igual produciría resultados que dicen la misma etiqueta
 * y no son comparables con los de ayer.
 */
export function verificarHuella(personas: readonly Persona[], declarada: string): void {
  const real = huellaDePoblacion(personas);
  if (real !== declarada) {
    throw new Error(
      `El elenco dice tener la huella ${declarada} y su contenido da ${real}. No se corre: dos ` +
        'corridas con la misma etiqueta y distinto contenido no se pueden comparar, y ésa es ' +
        'la mentira que la huella existe para impedir.',
    );
  }
}

/**
 * La guarda del barrido: todas las corridas sobre la misma población.
 *
 * Se llama **antes** de la primera corrida y no después de la última, porque
 * un barrido de mil puntos que descubre al final que midió dos poblaciones ya
 * perdió la tarde y, peor, ya imprimió el gráfico.
 */
export function exigirMismaPoblacion(huellas: readonly string[]): void {
  const distintas = [...new Set(huellas)];
  if (distintas.length > 1) {
    throw new Error(
      `Un barrido corre sobre UNA población y llegaron ${String(distintas.length)}: ` +
        `${distintas.join(', ')}. Si la población cambia entre corridas, lo que se mide es la ` +
        'varianza del modelo y no la palanca — y eso no da error, da números plausibles.',
    );
  }
}

/** Cuántas personas por territorio. Un `for`, sin spread. */
export function personasPorTerritorio(
  territorioDe: readonly string[],
): ReadonlyMap<string, number> {
  const conteo = new Map<string, number>();
  for (const territorioId of territorioDe) {
    conteo.set(territorioId, (conteo.get(territorioId) ?? 0) + 1);
  }
  return conteo;
}

/**
 * Mide el sesgo del elenco contra el país.
 *
 * `fraccionPais` sale de la población real de cada territorio, así que el
 * desvío dice literalmente cuánto sobre o sub representa el elenco a cada
 * provincia. Es un número, no una advertencia genérica: la regla 5 pide
 * mostrar cobertura y sesgo, no lamentarlos.
 */
export function medirSesgo(
  territorioDe: readonly string[],
  territorios: readonly Territorio[],
  corpus: readonly { documento: string; sha: string; personas: number }[],
): SesgoDeElenco {
  const conteo = personasPorTerritorio(territorioDe);
  let poblacionPais = 0;
  for (const t of territorios) poblacionPais += Math.max(0, t.poblacion);

  const porTerritorio = territorios.map((t) => {
    const personas = conteo.get(t.id) ?? 0;
    const fraccionElenco = territorioDe.length === 0 ? 0 : personas / territorioDe.length;
    const fraccionPais = poblacionPais === 0 ? 0 : Math.max(0, t.poblacion) / poblacionPais;
    return {
      territorioId: t.id,
      personas,
      fraccionElenco,
      fraccionPais,
      desvio: fraccionElenco - fraccionPais,
    };
  });

  return {
    corpus,
    porTerritorio,
    territoriosSinPersona: porTerritorio.filter((f) => f.personas === 0).map((f) => f.territorioId),
    advertencia: ADVERTENCIA_DE_SESGO,
  };
}
