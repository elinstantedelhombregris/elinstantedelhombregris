/**
 * El sembrado — dónde se dibuja cada voz adentro de una celda, y por qué eso
 * es **dibujo** y no dato.
 *
 * ## La restricción que manda
 *
 * `Cosecha` son celdas agregadas: `(territorioId, periodo, clase) → voces`. Y
 * `ubicacion-ensayada.ts` declara `PRECISION_QUE_CONOCE_EL_GENERADOR =
 * 'province'`. O sea, con todas las letras: **el motor sabe cuántas voces hay
 * por celda y no sabe dónde cae cada una.**
 *
 * La demo del 11 de agosto puso 10.000 voces sintéticas sobre direcciones
 * reales del callejero del Estado. Eso fabrica una precisión que el modelo no
 * tiene: quien mirara ese mapa vería una voz en una esquina y sacaría
 * conclusiones sobre esa esquina. Este módulo existe para no repetirlo, y su
 * contrato es de una sola línea:
 *
 * > el conteo por celda es el dato; la posición del punto adentro de la celda
 * > es dibujo, y eso **se declara en pantalla** —`DECLARACION_DEL_SEMBRADO`—,
 * > no en un comentario del código.
 *
 * ## Por qué el ángulo áureo, y no `Math.random`
 *
 * Repartir al azar apelmaza: con n puntos uniformes en un cuadrado, la
 * distancia mínima entre dos cae como 1/n y no como 1/√n, así que se ven
 * grumos donde no hay nada y huecos donde sí hay. Un lector lee los grumos
 * como densidad —que es exactamente la afirmación que este módulo no puede
 * hacer— y los huecos como ausencia.
 *
 * El `ANGULO_AUREO` de `radiografia/geometria.ts` es la ley que ordena las
 * semillas del girasol, y es el mismo constante importado y no reescrito. Acá
 * va **desenrollado**: la misma ley angular reparte la coordenada `x`, y el
 * índice se reparte en franjas de igual área sobre `y` en vez de en anillos de
 * igual área. La consecuencia medible está en el test: la distancia mínima
 * queda cerca de 0,9/√n, casi el óptimo del empaquetado hexagonal.
 *
 * ## Lo que NO hace, a propósito
 *
 * No fabrica racimos. Un país habitado tiene ciudades, y dibujar ciudades acá
 * sería inventar justo lo que el modelo no sabe. El reparto es parejo y sin
 * grilla: dice «en algún lugar de acá adentro, tantas», que es toda la verdad
 * disponible.
 *
 * Sin DOM, sin red, sin `Math.random`: la semilla entra por parámetro, así que
 * dos corridas del mismo escenario dibujan lo mismo. La guarda «cero azar sin
 * semilla» de `guardas-espina.test.ts` cubre este archivo como a cualquier otro.
 */

import { ANGULO_AUREO } from '../radiografia/geometria.js';

import { azarDe, huellaDeTexto } from './espina/azar.js';

/**
 * El ángulo áureo dicho en vueltas: 1/φ² ≈ 0,3819660.
 *
 * Sale de `ANGULO_AUREO` y no de un literal, que es lo que garantiza que sea
 * el mismo número que gira la constelación. Su desarrollo en fracción continua
 * es `[0; 2, 1, 1, 1, …]` —el peor aproximable que hay—, y por eso ningún
 * múltiplo suyo vuelve a caer cerca de otro: es la razón formal de que no se
 * apelmace.
 */
export const VUELTA_AUREA = ANGULO_AUREO / (2 * Math.PI);

/**
 * Cuánto se corre un punto de su lugar exacto, en fracción de su franja.
 *
 * Existe para romper el rayado: la sucesión pura deja las diagonales a la
 * vista y una diagonal se lee como estructura. `0,8` de franja significa
 * ±0,4, así que un punto **nunca sale de su franja** y el reparto parejo
 * sobrevive intacto — el desorden es de presentación y no toca la propiedad.
 */
const CORRIMIENTO = 0.8;

/**
 * El techo de puntos por celda, y por qué existe.
 *
 * Un círculo de seis píxeles ocupa ~28 px². La provincia más chica, al encuadre
 * de país, no pasa de unos 150 × 150 px: quinientos círculos ya cubren cerca de
 * la mitad de esa superficie. El quinientos uno no agrega información, agrega
 * tinta — y cien mil círculos no son un país lleno de voces, son un disco
 * opaco que nadie puede contar.
 *
 * Por encima del techo **no se dibuja una voz por punto**: se satura y se
 * dice, con la leyenda `+3.400 más`. Decirlo es la mitad que importa: una
 * celda saturada sin leyenda miente hacia abajo exactamente como la demo
 * mentía hacia arriba.
 */
export const TECHO_DE_PUNTOS_POR_CELDA = 500;

/**
 * Lo que hay que tener escrito en pantalla cuando esto se dibuja.
 *
 * Es una constante y no un comentario porque un comentario no lo lee nadie más
 * que quien edita el archivo. El día que el generador aprenda a ubicar mejor
 * que la provincia, `sembrado.test.ts` falla contra
 * `PRECISION_QUE_CONOCE_EL_GENERADOR` y alguien tiene que volver a escribir
 * esta frase a mano — que es exactamente lo que se quiere que pase.
 */
export const DECLARACION_DEL_SEMBRADO =
  'El conteo de cada provincia es el dato. Dónde cae cada punto adentro de la ' +
  'provincia es dibujo: el modelo sabe cuántas voces hay, no dónde está cada una.';

export interface PuntoSembrado {
  /** En [0, 1). */
  readonly x: number;
  /** En (0, 1). */
  readonly y: number;
  /** El índice en el sembrado, para que quien pinte pueda escalonar el trazo. */
  readonly i: number;
}

const frac = (v: number): number => v - Math.floor(v);

/**
 * `cuantos` puntos repartidos en el cuadrado unitario, sin apelmazarse.
 *
 * Determinista: la misma `(cuantos, semilla)` devuelve siempre lo mismo, byte a
 * byte. Dos semillas distintas devuelven dibujos distintos, que es lo que
 * impide que dos provincias con el mismo conteo muestren la misma figura y
 * alguien la lea como un patrón.
 *
 * **No aplica el techo.** Acá vive la geometría; el techo es una decisión sobre
 * qué se dice y se toma en `sembrarCelda`.
 */
export function sembrarEnCuadrado(cuantos: number, semilla: number): PuntoSembrado[] {
  const n = Math.floor(cuantos);
  if (!Number.isFinite(n) || n <= 0) return [];

  const banda = 1 / n;
  // La fase corre el sembrado entero: sin ella toda celda arrancaría en el
  // mismo x y el ojo encontraría una columna que no significa nada.
  const fase = azarDe(semilla, 0);

  const puntos: PuntoSembrado[] = [];
  for (let i = 0; i < n; i++) {
    const corridaX = (azarDe(semilla, i + 1, 1) - 0.5) * CORRIMIENTO * banda;
    const corridaY = (azarDe(semilla, i + 1, 2) - 0.5) * CORRIMIENTO * banda;
    puntos.push({
      // `x` da la vuelta en vez de recortarse: la sucesión vive en un círculo,
      // y recortarla amontonaría los pocos puntos del borde contra el borde.
      x: frac(fase + i * VUELTA_AUREA + corridaX),
      // `y` no necesita cuidado: el corrimiento está acotado a media franja, así
      // que el resultado cae siempre adentro de (0, 1).
      y: (i + 0.5) * banda + corridaY,
      i,
    });
  }
  return puntos;
}

/**
 * Un entero con separador de miles rioplatense: `3400` → `3.400`.
 *
 * A mano y no con `Intl`: `civic-core` corre igual en Node, en el navegador y
 * en Hermes, y Hermes puede venir sin los datos de configuración regional. Un
 * número que en el celular sale `3400` y en el escritorio `3.400` es un
 * detalle hasta que alguien compara dos capturas.
 */
export function conSeparadorDeMiles(valor: number): string {
  const entero = Math.trunc(Math.abs(valor)).toString();
  let salida = '';
  for (let i = 0; i < entero.length; i++) {
    if (i > 0 && (entero.length - i) % 3 === 0) salida += '.';
    salida += entero.charAt(i);
  }
  return valor < 0 ? `-${salida}` : salida;
}

export interface CeldaSembrada {
  readonly puntos: readonly PuntoSembrado[];
  /** El conteo real de la celda. Éste es el dato, y no se toca nunca. */
  readonly voces: number;
  /** Cuántas voces llegan a tener un punto propio. */
  readonly dibujados: number;
  /** Cuántas quedaron adentro del conteo y afuera del dibujo. */
  readonly noDibujados: number;
  readonly saturada: boolean;
  /** `+3.400 más`, o `null` cuando entraron todas. Listo para pintar. */
  readonly leyenda: string | null;
}

/**
 * El sembrado de una celda, con el techo aplicado y dicho.
 *
 * Ésta es la función que usa quien dibuja. `voces` sale intacto en el
 * resultado: el techo cambia cuántos puntos hay, nunca cuántas voces hubo.
 */
export function sembrarCelda(voces: number, semilla: number): CeldaSembrada {
  const total = Number.isFinite(voces) ? Math.max(0, Math.floor(voces)) : 0;
  const dibujados = Math.min(total, TECHO_DE_PUNTOS_POR_CELDA);
  const noDibujados = total - dibujados;
  return {
    puntos: sembrarEnCuadrado(dibujados, semilla),
    voces: total,
    dibujados,
    noDibujados,
    saturada: noDibujados > 0,
    leyenda: noDibujados > 0 ? `+${conSeparadorDeMiles(noDibujados)} más` : null,
  };
}

/**
 * La semilla de una celda: la de la corrida, revuelta con el nombre del
 * territorio.
 *
 * Así el dibujo de Chaco es el mismo en las dos corridas del mismo escenario y
 * distinto del de Formosa aunque las dos tengan 412 voces. Reusa
 * `huellaDeTexto` —el FNV-1a que ya hashea texto en este paquete— en vez de
 * inventar un segundo hash.
 */
export const semillaDeCelda = (semilla: number, territorioId: string): number =>
  (semilla ^ huellaDeTexto(territorioId)) >>> 0;
