import { mulberry32 } from '../azar';
import { PALETA, rgb } from '../paleta';

/**
 * «Correr el velo», sin three. Adentro del velo, todos los corredores dan
 * vueltas por la misma pista. Al correrlo, cada uno sale —cada cual a su
 * tiempo— hacia una órbita propia: otro radio, otra inclinación, otro ritmo,
 * otro color. Volver a la pista es posible; la escena no castiga a nadie.
 */
export const CORREDORES = 720;
const RADIO_DE_PISTA = 3;
const INCLINACION_DE_PISTA = 0.38;
/** Lo que tarda un corredor en hacer el viaje completo entre pista y órbita. */
const VIAJE = 2.2;

const GRIS = rgb(PALETA.tinta30);
const COLORES_PROPIOS = [
  rgb(PALETA.violetaClaro),
  rgb(PALETA.selloClaro),
  rgb(PALETA.ambarClaro),
  rgb(PALETA.papel),
] as const;

export interface Velo {
  // Pista.
  fase: Float32Array;
  rapidez: Float32Array;
  desvio: Float32Array;
  // Órbita propia: radio, rapidez angular, fase y una base ortonormal del plano.
  radio: Float32Array;
  rapidezOrbital: Float32Array;
  faseOrbital: Float32Array;
  base: Float32Array;
  color: Float32Array;
  tamBase: Float32Array;
  // Cuánto salió cada uno, de 0 (en la pista) a 1 (en su órbita), y cuándo arranca.
  salida: Float32Array;
  demora: Float32Array;
  // Buffers de dibujo.
  posiciones: Float32Array;
  colores: Float32Array;
  alfas: Float32Array;
  tams: Float32Array;
}

export function crearVelo(semilla = 21): Velo {
  const azar = mulberry32(semilla);
  const v: Velo = {
    fase: new Float32Array(CORREDORES),
    rapidez: new Float32Array(CORREDORES),
    desvio: new Float32Array(CORREDORES * 2),
    radio: new Float32Array(CORREDORES),
    rapidezOrbital: new Float32Array(CORREDORES),
    faseOrbital: new Float32Array(CORREDORES),
    base: new Float32Array(CORREDORES * 6),
    color: new Float32Array(CORREDORES * 3),
    tamBase: new Float32Array(CORREDORES),
    salida: new Float32Array(CORREDORES),
    demora: new Float32Array(CORREDORES),
    posiciones: new Float32Array(CORREDORES * 3),
    colores: new Float32Array(CORREDORES * 3),
    alfas: new Float32Array(CORREDORES),
    tams: new Float32Array(CORREDORES),
  };
  for (let i = 0; i < CORREDORES; i++) {
    v.fase[i] = azar() * Math.PI * 2;
    v.rapidez[i] = 1.5 + azar() * 0.3;
    v.desvio[i * 2] = (azar() - 0.5) * 0.24;
    v.desvio[i * 2 + 1] = (azar() - 0.5) * 0.12;
    const radio = 5 + azar() * 20;
    v.radio[i] = radio;
    v.rapidezOrbital[i] = (0.6 + azar() * 0.6) * Math.pow(5 / radio, 1.5);
    v.faseOrbital[i] = azar() * Math.PI * 2;
    v.base.set(baseDelPlano(azar), i * 6);
    v.color.set(COLORES_PROPIOS[Math.floor(azar() * COLORES_PROPIOS.length)] ?? GRIS, i * 3);
    v.tamBase[i] = 0.12 + azar() * 0.08;
    // Cada uno sale a su tiempo: nadie espera una orden para irse.
    v.demora[i] = azar() * 1.4;
  }
  return v;
}

/** Dos vectores ortonormales que generan un plano de inclinación al azar. */
function baseDelPlano(azar: () => number): number[] {
  // Normal uniforme en la esfera.
  const z = azar() * 2 - 1;
  const phi = azar() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  const n = [r * Math.cos(phi), r * Math.sin(phi), z] as const;
  // Un vector que no sea paralelo a la normal.
  const a = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const e1 = normalizar(cruz(n, a));
  const e2 = cruz(n, e1);
  return [...e1, ...e2];
}

type V3 = readonly [number, number, number];
const cruz = (a: readonly number[], b: readonly number[]): V3 => [
  (a[1] ?? 0) * (b[2] ?? 0) - (a[2] ?? 0) * (b[1] ?? 0),
  (a[2] ?? 0) * (b[0] ?? 0) - (a[0] ?? 0) * (b[2] ?? 0),
  (a[0] ?? 0) * (b[1] ?? 0) - (a[1] ?? 0) * (b[0] ?? 0),
];
const normalizar = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

const suave = (s: number) => s * s * (3 - 2 * s);

/**
 * Avanza `dt` segundos con el velo corrido (`libres`) o puesto. `t` es el
 * tiempo de la escena; `desdeElCambio`, los segundos desde el último toque.
 */
export function avanzarVelo(v: Velo, dt: number, t: number, libres: boolean, desdeElCambio: number) {
  const coseno = Math.cos(INCLINACION_DE_PISTA);
  const seno = Math.sin(INCLINACION_DE_PISTA);
  for (let i = 0; i < CORREDORES; i++) {
    if (desdeElCambio >= (v.demora[i] ?? 0)) {
      const paso = dt / VIAJE;
      v.salida[i] = Math.min(1, Math.max(0, (v.salida[i] ?? 0) + (libres ? paso : -paso)));
    }
    const s = suave(v.salida[i] ?? 0);

    const angulo = (v.fase[i] ?? 0) + (v.rapidez[i] ?? 0) * t;
    const r = RADIO_DE_PISTA + (v.desvio[i * 2] ?? 0);
    const px = Math.cos(angulo) * r;
    const pz0 = Math.sin(angulo) * r;
    const py0 = v.desvio[i * 2 + 1] ?? 0;
    // La pista está inclinada sobre el eje x.
    const py = py0 * coseno - pz0 * seno;
    const pz = py0 * seno + pz0 * coseno;

    const a = (v.faseOrbital[i] ?? 0) + (v.rapidezOrbital[i] ?? 0) * t;
    const ro = v.radio[i] ?? 0;
    const b = i * 6;
    const ca = Math.cos(a) * ro;
    const sa = Math.sin(a) * ro;
    const ox = ca * (v.base[b] ?? 0) + sa * (v.base[b + 3] ?? 0);
    const oy = ca * (v.base[b + 1] ?? 0) + sa * (v.base[b + 4] ?? 0);
    const oz = ca * (v.base[b + 2] ?? 0) + sa * (v.base[b + 5] ?? 0);

    v.posiciones[i * 3] = px + (ox - px) * s;
    v.posiciones[i * 3 + 1] = py + (oy - py) * s;
    v.posiciones[i * 3 + 2] = pz + (oz - pz) * s;
    for (let k = 0; k < 3; k++) {
      const gris = GRIS[k] ?? 0;
      v.colores[i * 3 + k] = gris + ((v.color[i * 3 + k] ?? 0) - gris) * s;
    }
    v.alfas[i] = 0.5 + 0.5 * s;
    // Afuera de la pista, cada uno se vuelve más visible: es alguien, no un punto de la fila.
    v.tams[i] = (v.tamBase[i] ?? 0) * (1 + 1.2 * s);
  }
}

/** Para `prefers-reduced-motion`: todos en su lugar, sin viaje. */
export function asentarVelo(v: Velo, t: number, libres: boolean) {
  v.salida.fill(libres ? 1 : 0);
  avanzarVelo(v, 0, t, libres, Number.POSITIVE_INFINITY);
}

/** Qué tan corrido está el velo, en promedio (0 puesto, 1 corrido). */
export function cuantoSalieron(v: Velo): number {
  let total = 0;
  for (let i = 0; i < CORREDORES; i++) total += v.salida[i] ?? 0;
  return total / CORREDORES;
}
