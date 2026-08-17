import { type Tema } from './radiografia-data';

import type { AristaDeConvergencia } from '~/lib/queries/radiografia';

import { FONDO_DEL_TEMA, TINTA_DEL_TEMA } from '~/components/mapa/pintor-senales';

/**
 * El pintor de la constelación — la proyección y el trazo, sin React.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §5.1.
 *
 * Vive separado de `sections/Constelacion.tsx` por dos motivos, y los dos
 * importan: un archivo de componentes no puede exportar funciones sueltas sin
 * romper la regla de fast-refresh del repo, y —lo que de verdad pesa— **un
 * canvas no se puede leer en un test**. Acá adentro todo es una función pura
 * que recibe un contexto 2D, así que se le puede pasar uno falso y verificar
 * lo que dibuja: que una arista declarada nunca lleve el trazo de una medida,
 * que **la clase se lea igual al fondo que al frente**, que dos nodos distintos
 * caigan en dos puntos distintos de la pantalla.
 *
 * **Canvas-2D y no WebGL**: la ADR 0003 tiene `three` en *Defer*, y su gatillo
 * pide que el dato **no pueda** servirse en 2D a la fidelidad buscada. Con el
 * corpus de hoy no se cumple. El día que se cumpla solo —cuando esto se
 * arrastre— la migración cambia este archivo y nada más: la geometría φ ya
 * devuelve puntos en 3D y no sabe quién los dibuja.
 */

export interface NodoDibujable {
  id: string;
  /** `null` cuando es una voz sola: no pertenece a ningún núcleo. */
  nucleoId: string | null;
  x: number;
  y: number;
  z: number;
  color: string;
  radio: number;
}

/**
 * De qué corpus es este cielo.
 *
 * **No es un interruptor: es un hecho.** El campo es obligatorio y su tipo es
 * una unión cerrada, así que ningún llamador puede omitirlo ni apagarlo — a lo
 * sumo puede mentir, y mentir tiene otro nombre y otra guarda (`data-origen` en
 * el lienzo, verificado en `__tests__/sello-del-lienzo.test.ts`).
 */
export type OrigenDelCielo = 'corpus' | 'ejemplo';

export interface Escena {
  nodos: NodoDibujable[];
  aristas: readonly AristaDeConvergencia[];
  tema: Tema;
  enfocado: string | null;
  onEnfocar: (nucleoId: string | null) => void;
  origen: OrigenDelCielo;
}

export interface Caja {
  width: number;
  height: number;
}

export interface Proyectado {
  sx: number;
  sy: number;
  /** 0 al fondo, 1 al frente. Gobierna el desvanecimiento y el orden. */
  frente: number;
  escala: number;
}

/** Distancia focal. Más chica, más perspectiva. */
export const FOCO = 3.2;

/** Radio en píxeles dentro del que un click cuenta como apuntarle a un nodo. */
export const RADIO_DE_GOLPE = 14;

export function proyectar(
  nodo: { x: number; y: number; z: number },
  giroY: number,
  giroX: number,
  ancho: number,
  alto: number,
): Proyectado {
  const cy = Math.cos(giroY);
  const sy = Math.sin(giroY);
  const x1 = nodo.x * cy + nodo.z * sy;
  const z1 = -nodo.x * sy + nodo.z * cy;
  const cx = Math.cos(giroX);
  const sx = Math.sin(giroX);
  const y1 = nodo.y * cx - z1 * sx;
  const z2 = nodo.y * sx + z1 * cx;

  const escala = FOCO / (FOCO - z2);
  const radio = Math.min(ancho, alto) * 0.36;
  return {
    sx: ancho / 2 + x1 * escala * radio,
    sy: alto / 2 - y1 * escala * radio,
    frente: Math.max(0, Math.min(1, (z2 + 1) / 2)),
    escala,
  };
}

/**
 * Mezcla `color` con el fondo del tema. `peso` 1 = color pleno, 0 = fondo.
 *
 * Tinta que se acaba hacia el papel en claro y hacia `oscuro.barra` en
 * nocturno, en vez de opacidad o niebla: es lo que hace que esto no se vea como
 * cualquier gráfico de nodos de cualquier tablero.
 *
 * **Lo usa `atenuacion()` y ya NO la profundidad.** Apagar el resto del cielo
 * cuando el lector enfoca un núcleo es una decisión suya y momentánea; hundir
 * la clase de una señal porque la rotación la mandó atrás no lo es. La
 * distinción no es filosófica: mezclar hacia el fondo cuesta contraste, y acá
 * el color codifica la clase. Ver `pesoDeProfundidad`.
 */
export function haciaElFondo(color: string, fondo: string, peso: number): string {
  const c = aRgb(color);
  const f = aRgb(fondo);
  const k = Math.max(0, Math.min(1, peso));
  const mezcla = (a: number, b: number) => Math.round(b + (a - b) * k);
  return `rgb(${String(mezcla(c[0], f[0]))}, ${String(mezcla(c[1], f[1]))}, ${String(mezcla(c[2], f[2]))})`;
}

export function aRgb(hex: string): [number, number, number] {
  const limpio = hex.replace('#', '');
  return [
    parseInt(limpio.slice(0, 2), 16),
    parseInt(limpio.slice(2, 4), 16),
    parseInt(limpio.slice(4, 6), 16),
  ];
}

/**
 * Cuánta de su tinta conserva un nodo por su profundidad.
 *
 * **Devuelve 1 siempre: la profundidad ya no se cobra en el color.**
 *
 * Se intentó dos veces con el color y las dos fallaron por la misma razón. Con
 * el piso en 0,28 un `deseo` al fondo del cielo nocturno daba **1,13:1** contra
 * el fondo; subiéndolo a 0,72 mejoró a **2,17:1** y siguió por debajo del 3:1
 * que WCAG pide para un objeto gráfico. No hay piso que arregle esto: mezclar
 * hacia el fondo *es* perder contraste, y el color acá **codifica la clase**,
 * que es la primera lectura de la regla 11. Un escalonado que decide cuánto se
 * ve la clase de una señal según dónde cayó en una rotación arbitraria es un
 * gradiente de importancia que nadie diseñó.
 *
 * La profundidad se dice con el **radio** —`escala`, que sale de la proyección
 * en perspectiva y ya estaba— y con el orden de pintado. Un nodo lejano es más
 * chico y queda debajo; su clase se sigue leyendo. Es la misma información con
 * el mismo dibujo, cobrada donde no cuesta legibilidad.
 *
 * Queda como función y no se borra porque `atenuacion()` sí modula la tinta, y
 * las dos se multiplican en el mismo lugar: el día que alguien quiera volver a
 * escalonar por profundidad, este docstring es lo que se va a encontrar.
 */
export const pesoDeProfundidad = (_frente: number): number => 1;

/** Con un núcleo enfocado, el resto del cielo se va hacia el fondo (§5.4). */
export function atenuacion(escena: Escena, nodo: NodoDibujable): number {
  if (escena.enfocado === null) return 1;
  return nodo.nucleoId === escena.enfocado ? 1 : 0.22;
}

/** Qué núcleo hay debajo del punto. `null` si el click cayó en el vacío. */
export function golpear(
  nodos: readonly NodoDibujable[],
  giroY: number,
  giroX: number,
  caja: Caja,
  punto: { x: number; y: number },
): string | null {
  let mejor: { id: string | null; d: number } | null = null;
  for (const nodo of nodos) {
    const p = proyectar(nodo, giroY, giroX, caja.width, caja.height);
    const d = Math.hypot(p.sx - punto.x, p.sy - punto.y);
    if (d <= RADIO_DE_GOLPE && (!mejor || d < mejor.d)) mejor = { id: nodo.nucleoId, d };
  }
  return mejor ? mejor.id : null;
}

/**
 * Lo mínimo del contexto 2D que este pintor toca. Declararlo permite pasarle
 * uno falso en un test — un `CanvasRenderingContext2D` de verdad no se puede
 * interrogar sobre lo que dibujó.
 */
export type Pincel = Pick<
  CanvasRenderingContext2D,
  | 'setTransform'
  | 'fillRect'
  | 'beginPath'
  | 'moveTo'
  | 'lineTo'
  | 'stroke'
  | 'arc'
  | 'fill'
  | 'setLineDash'
  | 'fillText'
  | 'measureText'
  | 'font'
  | 'textAlign'
  | 'textBaseline'
  | 'fillStyle'
  | 'strokeStyle'
  | 'lineWidth'
  | 'globalAlpha'
>;

/* ── El sello, adentro del lienzo ────────────────────────────────────────── */

/**
 * Lo que dice el cielo del ejemplo, **escrito adentro del área que se captura**.
 *
 * Enmienda `docs/specs/2026-08-16-enmienda-v1-los-ejemplos.md` §4.1: un aviso
 * al costado de la constelación no sirve, porque se recorta. El riesgo que la
 * enmienda existe para cubrir no es que alguien se confunda navegando — es que
 * **alguien saque una captura del ejemplo y la publique como si fuera el
 * país**, y una captura no se lleva el HTML de alrededor.
 *
 * Tres decisiones, y ninguna es decorativa:
 *
 *  1. **La frase es una constante del módulo, no una prop.** No hay forma de
 *     pasarle otro texto ni de pasarle `null`: lo único que viaja por la escena
 *     es `origen`, que es de qué corpus es el cielo, y eso es un hecho y no un
 *     interruptor.
 *  2. **Va tres veces y no una.** Una sola línea al pie se recorta con el
 *     gesto más barato que hay. A 22 %, 50 % y 78 % del alto, la banda entre
 *     dos sellos mide poco más de un cuarto del lienzo: cualquier recorte que
 *     se lleve estrellas se lleva una de las tres, y llevarse las estrellas sin
 *     ninguna es un acto deliberado y no un descuido. Eso es exactamente lo que
 *     §4 pide y todo lo que puede pedir: reduce el riesgo, no lo elimina.
 *  3. **Va con la tinta del tema sobre una plancha del fondo del tema**, o sea
 *     con el mismo contraste que el texto de la página. No es una marca de agua
 *     al 10 %: es texto legible, y se dibuja **último**, arriba de los nodos,
 *     para que ningún dato lo tape.
 */
export const SELLO_DEL_LIENZO = 'Nadie dijo ninguna de estas cosas · ejemplo';

/** A qué alturas del lienzo se repite el sello (fracción del alto). */
export const ALTURAS_DEL_SELLO: readonly number[] = [0.22, 0.5, 0.78];

/** Opacidad de la plancha de fondo. El texto va siempre pleno. */
const PLANCHA = 0.78;

/** El tipo del sello, en píxeles. Nunca la letra chica de un contrato. */
const tipografia = (cuerpo: number): string =>
  `600 ${String(cuerpo)}px "Space Mono", ui-monospace, monospace`;

function sellar(ctx: Pincel, ancho: number, alto: number, fondo: string, tinta: string): void {
  // Entre 11 y 17 px: abajo de 11 deja de leerse en una captura reescalada y
  // arriba de 17 tapa el cielo en un lienzo angosto.
  let cuerpo = Math.round(Math.max(11, Math.min(17, ancho * 0.019)));
  ctx.font = tipografia(cuerpo);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Si con la fuente que le tocó al navegador la frase se sale del lienzo, se
  // achica hasta que entre. Un sello cortado por el borde es un sello que se
  // puede alegar que no se leía.
  let anchoDelTexto = ctx.measureText(SELLO_DEL_LIENZO).width;
  const disponible = ancho * 0.92;
  if (anchoDelTexto > disponible && anchoDelTexto > 0) {
    cuerpo = Math.max(9, Math.floor((cuerpo * disponible) / anchoDelTexto));
    ctx.font = tipografia(cuerpo);
    anchoDelTexto = ctx.measureText(SELLO_DEL_LIENZO).width;
  }

  const margen = cuerpo * 0.7;
  const altoDeLaPlancha = cuerpo * 1.9;

  for (const fraccion of ALTURAS_DEL_SELLO) {
    const y = alto * fraccion;
    ctx.globalAlpha = PLANCHA;
    ctx.fillStyle = fondo;
    ctx.fillRect(
      ancho / 2 - anchoDelTexto / 2 - margen,
      y - altoDeLaPlancha / 2,
      anchoDelTexto + margen * 2,
      altoDeLaPlancha,
    );
    ctx.globalAlpha = 1;
    ctx.fillStyle = tinta;
    ctx.fillText(SELLO_DEL_LIENZO, ancho / 2, y);
  }
}

export function pintar(
  ctx: Pincel,
  caja: Caja & { dpr: number },
  escena: Escena,
  giroY: number,
  giroX: number,
): void {
  const { width: ancho, height: alto, dpr } = caja;
  if (ancho === 0 || alto === 0) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const fondo = FONDO_DEL_TEMA[escena.tema];
  const tinta = TINTA_DEL_TEMA[escena.tema];
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, ancho, alto);

  const porId = new Map<string, { nodo: NodoDibujable; p: Proyectado }>();
  for (const nodo of escena.nodos) {
    porId.set(nodo.id, { nodo, p: proyectar(nodo, giroY, giroX, ancho, alto) });
  }

  // Las aristas primero y por debajo: son el dato (R5), pero un nodo tapado
  // por una línea no se puede clickear.
  for (const arista of escena.aristas) {
    const a = porId.get(arista.a);
    const b = porId.get(arista.b);
    if (!a || !b) continue;
    const apagado = atenuacion(escena, a.nodo) * atenuacion(escena, b.nodo);
    const profundidad = Math.min(a.p.frente, b.p.frente);
    // La opacidad la manda la similitud: una arista al filo del umbral se ve
    // al filo. El 0,08 de piso existe para que exista, no para que se lea.
    const fuerza = Math.max(0.08, Math.min(1, arista.similitud));
    ctx.globalAlpha = fuerza * (0.18 + profundidad * 0.42) * apagado;
    ctx.strokeStyle = tinta;
    ctx.lineWidth = arista.tipo === 'declarada' ? 1.6 : 1;
    // Una arista declarada la afirmó una persona y NUNCA lleva el mismo trazo
    // que una medida (R6): va punteada, y esa diferencia es la afirmación.
    ctx.setLineDash(arista.tipo === 'declarada' ? [3, 4] : []);
    ctx.beginPath();
    ctx.moveTo(a.p.sx, a.p.sy);
    ctx.lineTo(b.p.sx, b.p.sy);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  const ordenados = [...porId.values()].sort((p, q) => p.p.frente - q.p.frente);
  for (const { nodo, p } of ordenados) {
    const peso = pesoDeProfundidad(p.frente) * atenuacion(escena, nodo);
    ctx.fillStyle = haciaElFondo(nodo.color, fondo, peso);
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, Math.max(1.2, nodo.radio * p.escala), 0, Math.PI * 2);
    ctx.fill();
  }

  // Último, arriba de todo y sin manera de saltearlo: si este cielo es el del
  // ejemplo, lo dice adentro del lienzo. Ver `SELLO_DEL_LIENZO`.
  if (escena.origen === 'ejemplo') sellar(ctx, ancho, alto, fondo, tinta);
}
