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

export interface Escena {
  nodos: NodoDibujable[];
  aristas: readonly AristaDeConvergencia[];
  tema: Tema;
  enfocado: string | null;
  onEnfocar: (nucleoId: string | null) => void;
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
  | 'fillStyle'
  | 'strokeStyle'
  | 'lineWidth'
  | 'globalAlpha'
>;

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
}
