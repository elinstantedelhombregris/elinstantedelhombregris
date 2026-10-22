import { mulberry32 } from '../azar';
import { claveDeArista, type Grafo } from '../grafo';
import { PALETA, rgb } from '../paleta';

/**
 * «La física de la confianza», sin three: estado y cuentas puras, para poder
 * probarlas. La escena solo copia estos buffers a la GPU.
 *
 * Cada ciudadano tiene una luz. Su confianza sale en partículas, y cuanta más
 * luz tiene, más confianza da. Hacia una persona, la partícula espiraliza hasta
 * un vacío y una parte vuelve a salir como calor, hacia arriba, lejos de todos:
 * la luz de los ciudadanos se apaga y dan cada vez menos. Hacia un sistema, la
 * partícula recorre aristas de una red (las enciende: hace trabajo) y vuelve a
 * quien la dio, que se ilumina y da más. El lazo es el argumento.
 */
export type Destino = 'persona' | 'sistema';

export const CIUDADANOS = 90;
export const PARTICULAS = 1200;
const RADIO = 11;
const CENTRO_Y = 0.8;
const PASOS_EN_LA_RED = 3;
const FRACCION_CALOR = 0.4;

export interface Corriente {
  grafo: Grafo;
  /** x, y, z de cada ciudadano. */
  ciudadanos: Float32Array;
  /** Luz de cada ciudadano, en [0.18, 1]. */
  luz: Float32Array;
  /** Cuánto trabajo pasó hace poco por cada arista, en [0, 1]. */
  calorDeArista: Float32Array;
  /** Buffers de dibujo de las partículas. */
  posiciones: Float32Array;
  colores: Float32Array;
  alfas: Float32Array;
  // Estado de cada partícula.
  ruta: Uint8Array;
  progreso: Float32Array;
  duracion: Float32Array;
  esCalor: Uint8Array;
  camino: Int16Array;
  deriva: Float32Array;
  azar: () => number;
}

const LUZ_MINIMA = 0.18;

export function crearCorriente(grafo: Grafo, semilla = 7): Corriente {
  const azar = mulberry32(semilla);
  const ciudadanos = new Float32Array(CIUDADANOS * 3);
  for (let i = 0; i < CIUDADANOS; i++) {
    const angulo = (i / CIUDADANOS) * Math.PI * 2 + (azar() - 0.5) * 0.04;
    const radio = RADIO + (azar() - 0.5) * 1.6;
    ciudadanos[i * 3] = Math.cos(angulo) * radio;
    ciudadanos[i * 3 + 1] = (azar() - 0.5) * 0.8;
    ciudadanos[i * 3 + 2] = Math.sin(angulo) * radio;
  }
  const corriente: Corriente = {
    grafo,
    ciudadanos,
    luz: new Float32Array(CIUDADANOS).fill(0.8),
    calorDeArista: new Float32Array(grafo.aristas.length / 2),
    posiciones: new Float32Array(PARTICULAS * 3),
    colores: new Float32Array(PARTICULAS * 3),
    alfas: new Float32Array(PARTICULAS),
    ruta: new Uint8Array(PARTICULAS),
    progreso: new Float32Array(PARTICULAS),
    duracion: new Float32Array(PARTICULAS),
    esCalor: new Uint8Array(PARTICULAS),
    camino: new Int16Array(PARTICULAS * (PASOS_EN_LA_RED + 1)),
    deriva: new Float32Array(PARTICULAS * 2),
    azar,
  };
  for (let p = 0; p < PARTICULAS; p++) {
    lanzar(corriente, p, 'persona');
    // Las primeras salen escalonadas en los primeros cuatro segundos, no todas juntas.
    corriente.progreso[p] = (-azar() * 4) / (corriente.duracion[p] ?? 1);
  }
  return corriente;
}

const ciudadanoDe = (p: number) => p % CIUDADANOS;

/** Reinicia una partícula: elige ruta según el destino actual y, si la red, su camino. */
function lanzar(c: Corriente, p: number, destino: Destino) {
  const { azar, grafo } = c;
  const i = ciudadanoDe(p);
  const duracion = destino === 'persona' ? 3.6 + azar() * 1.6 : 5.2 + azar() * 1.6;
  // Quien tiene poca luz da menos: espera unos segundos antes de volver a confiar.
  const ganas = (c.luz[i] ?? 0) + 0.15;
  const espera = azar() < ganas ? azar() * 0.6 : 1.2 + azar() * 2;
  c.duracion[p] = duracion;
  c.progreso[p] = -espera / duracion;
  c.ruta[p] = destino === 'persona' ? 0 : 1;
  c.esCalor[p] = azar() < FRACCION_CALOR ? 1 : 0;
  c.deriva[p * 2] = (azar() - 0.5) * 2;
  c.deriva[p * 2 + 1] = (azar() - 0.5) * 2;
  if (destino === 'sistema') {
    // Entra por uno de los tres vértices más cercanos a la dirección del ciudadano.
    const cx = c.ciudadanos[i * 3] ?? 0;
    const cz = c.ciudadanos[i * 3 + 2] ?? 0;
    const cantidad = grafo.vertices.length / 3;
    const cercanos = Array.from({ length: cantidad }, (_, v) => v)
      .map((v) => ({
        v,
        d: -((grafo.vertices[v * 3] ?? 0) * cx + (grafo.vertices[v * 3 + 2] ?? 0) * cz),
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    let actual = cercanos[Math.floor(azar() * cercanos.length)]?.v ?? 0;
    let anterior = -1;
    const base = p * (PASOS_EN_LA_RED + 1);
    c.camino[base] = actual;
    for (let k = 1; k <= PASOS_EN_LA_RED; k++) {
      const opciones = (grafo.vecinos[actual] ?? []).filter((v) => v !== anterior);
      const siguiente = opciones[Math.floor(azar() * opciones.length)] ?? actual;
      anterior = actual;
      actual = siguiente;
      c.camino[base + k] = actual;
    }
  }
}

const VIOLETA = rgb(PALETA.violetaClaro);
const AMBAR = rgb(PALETA.ambarClaro);
const CALOR = rgb(PALETA.selloClaro);
const DEVUELTA = rgb(PALETA.papel);

function pintar(c: Corriente, p: number, color: readonly [number, number, number], alfa: number) {
  c.colores[p * 3] = color[0];
  c.colores[p * 3 + 1] = color[1];
  c.colores[p * 3 + 2] = color[2];
  c.alfas[p] = alfa;
}

function ubicar(c: Corriente, p: number, x: number, y: number, z: number) {
  c.posiciones[p * 3] = x;
  c.posiciones[p * 3 + 1] = y;
  c.posiciones[p * 3 + 2] = z;
}

const suave = (s: number) => s * s * (3 - 2 * s);
const mezclar = (a: number, b: number, s: number) => a + (b - a) * s;

/**
 * Avanza la corriente `dt` segundos. `redMundo` son los vértices de la red ya
 * girados y trasladados a su lugar en el mundo.
 */
export function avanzar(c: Corriente, dt: number, destino: Destino, redMundo: Float32Array) {
  for (let i = 0; i < CIUDADANOS; i++) {
    c.luz[i] = Math.max(LUZ_MINIMA, (c.luz[i] ?? 0) - dt * 0.045);
  }
  for (let e = 0; e < c.calorDeArista.length; e++) {
    c.calorDeArista[e] = (c.calorDeArista[e] ?? 0) * Math.exp(-1.4 * dt);
  }
  for (let p = 0; p < PARTICULAS; p++) {
    const t = (c.progreso[p] ?? 0) + dt / (c.duracion[p] ?? 1);
    c.progreso[p] = t;
    if (t >= 1) {
      if (c.ruta[p] === 1) {
        const i = ciudadanoDe(p);
        c.luz[i] = Math.min(1, (c.luz[i] ?? 0) + 0.09);
      }
      lanzar(c, p, destino);
      pintar(c, p, VIOLETA, 0);
      continue;
    }
    if (t < 0) {
      pintar(c, p, VIOLETA, 0);
      continue;
    }
    if (c.ruta[p] === 0) haciaElVacio(c, p, t);
    else haciaElSistema(c, p, t, dt, redMundo);
  }
}

function haciaElVacio(c: Corriente, p: number, t: number) {
  const i = ciudadanoDe(p);
  const cx = c.ciudadanos[i * 3] ?? 0;
  const cy = c.ciudadanos[i * 3 + 1] ?? 0;
  const cz = c.ciudadanos[i * 3 + 2] ?? 0;
  const radio0 = Math.hypot(cx, cz);
  const angulo0 = Math.atan2(cz, cx);
  if (t < 0.72) {
    const s = t / 0.72;
    const radio = mezclar(radio0, 0.35, Math.pow(s, 0.75));
    const angulo = angulo0 + 2.4 * Math.pow(s, 1.6);
    ubicar(c, p, Math.cos(angulo) * radio, mezclar(cy, CENTRO_Y, s), Math.sin(angulo) * radio);
    pintar(c, p, VIOLETA, 0.9 * (1 - suave(Math.max(0, (s - 0.8) / 0.2))));
    return;
  }
  if (c.esCalor[p] === 0) {
    pintar(c, p, VIOLETA, 0);
    return;
  }
  // Lo que vuelve a salir, sale como calor: hacia arriba y lejos, no a quien lo dio.
  const s = (t - 0.72) / 0.28;
  const dx = c.deriva[p * 2] ?? 0;
  const dz = c.deriva[p * 2 + 1] ?? 0;
  ubicar(c, p, dx * s * 2.2, CENTRO_Y + 0.6 + s * 5.5, dz * s * 2.2);
  pintar(c, p, CALOR, 0.6 * (1 - s));
}

function verticeMundo(red: Float32Array, v: number): [number, number, number] {
  return [red[v * 3] ?? 0, red[v * 3 + 1] ?? 0, red[v * 3 + 2] ?? 0];
}

function haciaElSistema(c: Corriente, p: number, t: number, dt: number, red: Float32Array) {
  const i = ciudadanoDe(p);
  const ciudadano: [number, number, number] = [
    c.ciudadanos[i * 3] ?? 0,
    c.ciudadanos[i * 3 + 1] ?? 0,
    c.ciudadanos[i * 3 + 2] ?? 0,
  ];
  const base = p * (PASOS_EN_LA_RED + 1);
  const entrada = verticeMundo(red, c.camino[base] ?? 0);
  const salida = verticeMundo(red, c.camino[base + PASOS_EN_LA_RED] ?? 0);
  if (t < 0.3) {
    const s = suave(t / 0.3);
    ubicar(
      c,
      p,
      mezclar(ciudadano[0], entrada[0], s),
      mezclar(ciudadano[1], entrada[1], s) + Math.sin(Math.PI * s) * 1.4,
      mezclar(ciudadano[2], entrada[2], s),
    );
    pintar(c, p, VIOLETA, 0.9);
    return;
  }
  if (t < 0.74) {
    const s = ((t - 0.3) / 0.44) * PASOS_EN_LA_RED;
    const k = Math.min(PASOS_EN_LA_RED - 1, Math.floor(s));
    const u = s - k;
    const a = c.camino[base + k] ?? 0;
    const b = c.camino[base + k + 1] ?? 0;
    const va = verticeMundo(red, a);
    const vb = verticeMundo(red, b);
    ubicar(c, p, mezclar(va[0], vb[0], u), mezclar(va[1], vb[1], u), mezclar(va[2], vb[2], u));
    const e = c.grafo.indiceDeArista.get(claveDeArista(a, b));
    if (e !== undefined) c.calorDeArista[e] = Math.min(1, (c.calorDeArista[e] ?? 0) + dt * 1.6);
    const tono = Math.min(1, s / 1.2);
    pintar(
      c,
      p,
      [
        mezclar(VIOLETA[0], AMBAR[0], tono),
        mezclar(VIOLETA[1], AMBAR[1], tono),
        mezclar(VIOLETA[2], AMBAR[2], tono),
      ],
      1,
    );
    return;
  }
  // Y vuelve, más clara, a quien la dio.
  const s = suave((t - 0.74) / 0.26);
  ubicar(
    c,
    p,
    mezclar(salida[0], ciudadano[0], s),
    mezclar(salida[1], ciudadano[1], s) + Math.sin(Math.PI * s) * 2.2,
    mezclar(salida[2], ciudadano[2], s),
  );
  pintar(c, p, DEVUELTA, 0.95);
}

/**
 * Para `prefers-reduced-motion`: deja la corriente en su estado estable, con
 * las partículas repartidas a lo largo de sus recorridos, sin animar nada.
 */
export function asentar(c: Corriente, destino: Destino, redMundo: Float32Array) {
  const luz = destino === 'persona' ? 0.25 : 1;
  c.luz.fill(luz);
  for (let p = 0; p < PARTICULAS; p++) {
    lanzar(c, p, destino);
    c.progreso[p] = (p * 0.618034) % 1;
  }
  avanzar(c, 0, destino, redMundo);
  c.luz.fill(luz);
  c.calorDeArista.fill(destino === 'sistema' ? 0.75 : 0);
}
