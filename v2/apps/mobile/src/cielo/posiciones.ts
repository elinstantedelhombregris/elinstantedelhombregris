/**
 * Posiciones del Cielo — matemática pura, sin React ni Skia.
 *
 * Cada estrella vive en un punto determinístico de una espiral de galaxia
 * (espiral de Vogel: ángulo áureo + radio ~ √índice → densidad uniforme de
 * disco). El índice es el orden cronológico de captura; el id aporta un
 * jitter chico y estable para romper la regularidad sin generar choques.
 *
 * Coordenadas: px "de diseño" centrados en (0,0) — la Estrella Guía.
 * El canvas escala el conjunto para que entre en pantalla.
 */

import { hashSemilla, mulberry32 } from '../game/eventos';
import type { TipoEstrella } from '../game/types';

export interface Punto {
  x: number;
  y: number;
}

/** Ángulo áureo (radianes) — la firma de las espirales naturales. */
export const ANGULO_AUREO = Math.PI * (3 - Math.sqrt(5));

/** Separación radial base de la espiral (px de diseño). */
export const RADIO_BASE = 16;

/** Corrimiento del arranque: despeja el halo de la Estrella Guía. */
const OFFSET_CENTRO = 2.5;

/** Jitter máximo por eje (px). Chico a propósito: rompe la grilla, no la espiral. */
const JITTER_MAX = 1.5;

/** Cuántas estrellas se dibujan nítidas; las más viejas pasan a polvo (spec §5). */
export const MAX_ESTRELLAS_NITIDAS = 300;

/**
 * Posición determinística de la estrella `index`-ésima (0 = la más vieja).
 * El `id` solo perturba: dos cielos con el mismo orden y los mismos ids
 * son idénticos para siempre.
 */
export const posicionEstrella = (index: number, id: string): Punto => {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`Índice inválido: ${index}`);
  }
  const r = RADIO_BASE * Math.sqrt(index + OFFSET_CENTRO);
  const theta = index * ANGULO_AUREO;
  const rng = mulberry32(hashSemilla(id));
  const jx = (rng() * 2 - 1) * JITTER_MAX;
  const jy = (rng() * 2 - 1) * JITTER_MAX;
  return {
    x: r * Math.cos(theta) + jx,
    y: r * Math.sin(theta) + jy,
  };
};

/** Radio que ocupa un cielo de `n` estrellas (para escalar al viewport). */
export const radioDelCielo = (n: number): number =>
  n <= 0 ? 0 : RADIO_BASE * Math.sqrt(n - 1 + OFFSET_CENTRO) + JITTER_MAX;

/** Fase de titilado 0..2π, estable por id (cada estrella respira distinto). */
export const faseTitilado = (id: string): number =>
  mulberry32(hashSemilla(`${id}#fase`))() * Math.PI * 2;

/** Velocidad de titilado en rad/s, estable por id (0.6–1.6). */
export const velocidadTitilado = (id: string): number =>
  0.6 + mulberry32(hashSemilla(`${id}#vel`))();

/** Lo que el tamaño necesita saber de una estrella. */
export interface RarezaVisual {
  fundadora: boolean;
  nocturna: boolean;
  fugaz: boolean;
}

/**
 * Radio visual 2.5–4 según rareza; las fundadoras se agrandan aparte
 * (llevan destello en cruz y sprite propio).
 */
export const tamanoEstrella = (r: RarezaVisual): number => {
  let radio = 2.5;
  if (r.nocturna) radio += 0.5;
  if (r.fugaz) radio += 1;
  if (r.fundadora) radio = Math.max(radio * 1.4, 4.5);
  return radio;
};

/**
 * Colores de señal del registro NOCTURNO (spec Papel y Tinta §2 — tabla de
 * variantes legibles sobre el fondo oscuro del Cielo). El registro PAPEL usa
 * otra paleta (`tailwind.config.js → colors.senal`, `src/content/senales.ts`);
 * los dos divergen a propósito: el cielo necesita brillo sobre oscuro, el
 * papel necesita contraste sobre claro. `amistad` brilla papel.
 */
export const COLOR_ESTRELLA: Record<TipoEstrella, string> = {
  dream: '#9D85E8',
  need: '#D89B2E',
  basta: '#E05A41',
  value: '#C9C5BA',
  compromiso: '#2FA36B',
  recurso: '#2E9BC0',
  amistad: '#F2EFE7',
};

/** Hex #rrggbb → [r,g,b] en 0..1 (formato de color de Skia). */
export const hexARgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];

/**
 * El despertar (Papel y Tinta spec §7): antes de la primera estrella, todo
 * color de señal pasa por acá. Gris de luminancia perceptual (Rec. 601:
 * 0.299R + 0.587G + 0.114B) — preserva el brillo relativo entre colores,
 * pero el resultado es SIEMPRE un gris puro (r=g=b), nunca un tinte
 * "casi gris". Pura: sin React ni Skia, así el canvas y los tests la
 * comparten sin fricción.
 */
export const desaturar = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const l = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const canal = l.toString(16).padStart(2, '0');
  return `#${canal}${canal}${canal}`;
};

/** Un grumo de polvo estelar: estrellas viejas agregadas en un glow (LOD). */
export interface GrumoPolvo {
  x: number;
  y: number;
  radio: number;
  cantidad: number;
}

/**
 * Agrupa posiciones de estrellas viejas (más allá de las 300 nítidas) en
 * hasta `sectores` grumos por sector angular. Determinístico.
 */
export const grumosDePolvo = (
  posiciones: readonly Punto[],
  sectores = 8,
): GrumoPolvo[] => {
  if (posiciones.length === 0) return [];
  const grupos = new Map<number, Punto[]>();
  for (const p of posiciones) {
    const ang = Math.atan2(p.y, p.x) + Math.PI; // 0..2π
    const s = Math.min(sectores - 1, Math.floor((ang / (Math.PI * 2)) * sectores));
    const lista = grupos.get(s) ?? [];
    lista.push(p);
    grupos.set(s, lista);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, pts]) => {
      const cx = pts.reduce((acc, p) => acc + p.x, 0) / pts.length;
      const cy = pts.reduce((acc, p) => acc + p.y, 0) / pts.length;
      return {
        x: cx,
        y: cy,
        radio: 10 + Math.sqrt(pts.length) * 4,
        cantidad: pts.length,
      };
    });
};

/** Punto de polvo ambiental (fondo), con su opacidad fija. */
export interface PuntoPolvo extends Punto {
  /** 0.08–0.2 — tenue a propósito. */
  opacidad: number;
}

/**
 * Polvo ambiental: ~`cantidad` puntos fijos, determinísticos por semilla,
 * repartidos uniformes en el rect (ancho × alto) EN COORDENADAS ABSOLUTAS
 * del canvas (no centradas): el polvo pertenece al fondo, no a la galaxia.
 */
export const polvoAmbiental = (
  semilla: string,
  ancho: number,
  alto: number,
  cantidad = 80,
): PuntoPolvo[] => {
  const rng = mulberry32(hashSemilla(`${semilla}#polvo`));
  return Array.from({ length: cantidad }, () => ({
    x: rng() * ancho,
    y: rng() * alto,
    opacidad: 0.08 + rng() * 0.12,
  }));
};
