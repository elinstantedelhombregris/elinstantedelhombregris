/**
 * Atmósfera del Cielo — matemática pura del fondo, sin React ni Skia.
 *
 * El problema que resuelve: un negro plano con puntitos uniformes se lee
 * como ruido, no como noche. Acá el fondo gana cuerpo con cuatro ideas de
 * astrofotografía, todas determinísticas y estáticas (cero costo por frame):
 *
 *  1. CAMPO ESTELAR con jerarquía: grilla con jitter (blue-noise barato,
 *     nada de grumos aleatorios), brillo sesgado a tenue, y temperatura de
 *     color real (la mayoría plata, algunas frías, pocas cálidas).
 *  2. DESTACADAS: un puñado de estrellas de campo más brillantes que
 *     mantienen vivo el cielo aunque el jugador todavía no tenga ninguna.
 *  3. VÍA PLATEADA: una banda diagonal de polvo denso — la plata
 *     (argentum) cruzando la noche — en coordenadas locales de banda,
 *     lista para rotar en el canvas.
 *  4. NEBULOSAS: dos acentos de color enormes y tenues que rompen el
 *     negro uniforme sin robar protagonismo.
 */

import { hashSemilla, mulberry32 } from '../game/eventos';
import type { Punto } from './posiciones';

/** Una estrella del fondo (no jugable): posición + jerarquía visual. */
export interface EstrellaFondo extends Punto {
  /** Radio en px (0.5–2.4). */
  radio: number;
  /** 0..1 — el campo vive tenue; las destacadas suben. */
  opacidad: number;
  /** Temperatura de color (hex). */
  tinte: string;
}

/** Plata (mayoría), azul frío (algunas), ámbar cálido (pocas). */
export const TINTES_CAMPO = [
  '#F5F7FA',
  '#F5F7FA',
  '#F5F7FA',
  '#c9d4f5',
  '#c9d4f5',
  '#f7e3c4',
] as const;

/**
 * Campo estelar por grilla con jitter: una candidata por celda, ~28% de
 * celdas vacías para que el cielo respire. Determinístico por semilla.
 */
export const campoEstelar = (
  semilla: string,
  ancho: number,
  alto: number,
  celda = 34,
): EstrellaFondo[] => {
  const rng = mulberry32(hashSemilla(`${semilla}#campo`));
  const cols = Math.ceil(ancho / celda);
  const filas = Math.ceil(alto / celda);
  const out: EstrellaFondo[] = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < cols; c++) {
      const vacia = rng() < 0.28;
      const jx = rng();
      const jy = rng();
      const brilloBase = rng();
      const tinte = TINTES_CAMPO[Math.floor(rng() * TINTES_CAMPO.length)]!;
      if (vacia) continue;
      const brillo = brilloBase * brilloBase; // sesgo a tenues
      out.push({
        x: (c + 0.15 + jx * 0.7) * celda,
        y: (f + 0.15 + jy * 0.7) * celda,
        radio: 0.5 + brillo * 1.1,
        opacidad: 0.1 + brillo * 0.32,
        tinte,
      });
    }
  }
  return out;
};

/**
 * Destacadas: pocas estrellas de campo con brillo propio. Evitan que un
 * cielo sin capturas sea un vacío; nunca compiten con las del jugador
 * (más chicas que una fundadora, sin color de señal).
 */
export const estrellasDestacadas = (
  semilla: string,
  ancho: number,
  alto: number,
  cantidad = 7,
): EstrellaFondo[] => {
  const rng = mulberry32(hashSemilla(`${semilla}#destacadas`));
  return Array.from({ length: cantidad }, () => ({
    x: (0.06 + rng() * 0.88) * ancho,
    y: (0.05 + rng() * 0.9) * alto,
    radio: 1.5 + rng() * 0.9,
    opacidad: 0.35 + rng() * 0.22,
    tinte: TINTES_CAMPO[Math.floor(rng() * TINTES_CAMPO.length)]!,
  }));
};

/**
 * Vía plateada: puntos en coordenadas locales de banda — x a lo largo
 * (−largo/2..largo/2), y perpendicular con caída gaussiana (más denso y
 * brillante en el eje). El canvas rota el conjunto como grupo.
 */
export const puntosVia = (
  semilla: string,
  largo: number,
  mitadAncho: number,
  cantidad = 260,
): EstrellaFondo[] => {
  const rng = mulberry32(hashSemilla(`${semilla}#via`));
  return Array.from({ length: cantidad }, () => {
    const t = rng() * 2 - 1;
    const g = ((rng() + rng() + rng()) / 3) * 2 - 1; // gauss aproximada
    const cercania = 1 - Math.abs(g);
    return {
      x: (t * largo) / 2,
      y: g * mitadAncho,
      radio: 0.4 + rng() * 0.8,
      opacidad: 0.05 + cercania * rng() * 0.22,
      tinte: '#F5F7FA',
    };
  });
};

/** Ángulo de la vía plateada (radianes): diagonal suave, nunca vertical. */
export const ANGULO_VIA = -0.55;

/** Un acento nebular: glow radial enorme y tenue. */
export interface Nebulosa {
  /** Centro en fracciones del viewport (0..1). */
  fx: number;
  fy: number;
  /** Radio en fracción del lado mayor. */
  fr: number;
  color: string;
  opacidad: number;
}

/**
 * Dos nebulosas fijas: violeta (identidad) arriba a la izquierda sobre la
 * vía, verde-agua abajo a la derecha. Asimetría a propósito.
 */
export const NEBULOSAS: readonly Nebulosa[] = [
  { fx: 0.24, fy: 0.3, fr: 0.52, color: '#7D5BDE', opacidad: 0.075 },
  { fx: 0.82, fy: 0.62, fr: 0.46, color: '#14b8a6', opacidad: 0.045 },
];

/**
 * Cuantiza el campo en pocos baldes (tinte × brillo) para dibujarlo con
 * un puñado de nodos `Points` en lugar de cientos de círculos.
 */
export interface BaldeCampo {
  color: string;
  opacidad: number;
  radio: number;
  puntos: Punto[];
}

export const cuantizarCampo = (estrellas: readonly EstrellaFondo[]): BaldeCampo[] => {
  const baldes = new Map<string, BaldeCampo>();
  for (const e of estrellas) {
    const nivel = e.opacidad < 0.16 ? 0 : e.opacidad < 0.26 ? 1 : 2;
    const clave = `${e.tinte}-${nivel}`;
    let b = baldes.get(clave);
    if (!b) {
      b = {
        color: e.tinte,
        opacidad: [0.12, 0.2, 0.32][nivel]!,
        radio: [0.6, 0.9, 1.3][nivel]!,
        puntos: [],
      };
      baldes.set(clave, b);
    }
    b.puntos.push({ x: e.x, y: e.y });
  }
  return [...baldes.values()];
};
