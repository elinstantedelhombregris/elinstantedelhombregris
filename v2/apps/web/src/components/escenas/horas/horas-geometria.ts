import { mulberry32 } from '../azar';

/**
 * La cuenta del post, hecha geometría: 8 horas × 5 días × 46 semanas × 45 años.
 * Cada año es un bloque de 46 columnas (semanas) por 40 filas (horas de la semana).
 */
export const HORAS_POR_SEMANA = 40;
export const SEMANAS_POR_ANIO = 46;
export const ANIOS = 45;
export const HORAS_POR_ANIO = HORAS_POR_SEMANA * SEMANAS_POR_ANIO;
export const TOTAL_DE_HORAS = HORAS_POR_ANIO * ANIOS;

/** Separación entre bloques-año, en las mismas unidades que un punto (1). */
const HUECO = 6;

/** Las cantidades de bloques por fila que reparten los 45 años sin dejar una fila incompleta. */
const COLUMNAS_POSIBLES = [3, 5, 9, 15] as const;

export interface Disposicion {
  columnas: number;
  filas: number;
  ancho: number;
  alto: number;
}

export function disposicion(columnas: number): Disposicion {
  const filas = Math.ceil(ANIOS / columnas);
  return {
    columnas,
    filas,
    ancho: columnas * SEMANAS_POR_ANIO + (columnas - 1) * HUECO,
    alto: filas * HORAS_POR_SEMANA + (filas - 1) * HUECO,
  };
}

/** La disposición cuya proporción se parece más a la del lienzo (ancho / alto). */
export function disposicionPara(aspecto: number): Disposicion {
  let mejor = disposicion(COLUMNAS_POSIBLES[0]);
  let distancia = Number.POSITIVE_INFINITY;
  for (const columnas of COLUMNAS_POSIBLES) {
    const candidata = disposicion(columnas);
    const d = Math.abs(Math.log(candidata.ancho / candidata.alto / aspecto));
    if (d < distancia) {
      mejor = candidata;
      distancia = d;
    }
  }
  return mejor;
}

/** x, y, z de cada hora, centradas en el origen. La hora 0 es arriba a la izquierda. */
export function posicionesDeHoras({ columnas, ancho, alto }: Disposicion): Float32Array {
  const posiciones = new Float32Array(TOTAL_DE_HORAS * 3);
  for (let h = 0; h < TOTAL_DE_HORAS; h++) {
    const anio = Math.floor(h / HORAS_POR_ANIO);
    const enElAnio = h % HORAS_POR_ANIO;
    const semana = Math.floor(enElAnio / HORAS_POR_SEMANA);
    const hora = enElAnio % HORAS_POR_SEMANA;
    const columna = anio % columnas;
    const fila = Math.floor(anio / columnas);
    posiciones[h * 3] = columna * (SEMANAS_POR_ANIO + HUECO) + semana - ancho / 2;
    posiciones[h * 3 + 1] = alto / 2 - (fila * (HORAS_POR_SEMANA + HUECO) + hora);
    posiciones[h * 3 + 2] = 0;
  }
  return posiciones;
}

/**
 * El orden en que se encienden las horas, como un umbral en [0, 1) por hora.
 * Mezcla azar por hora con azar por semana —hay semanas enteras que cuentan y
 * semanas que no— y después lo reparte por rango, para que encender una
 * fracción `f` encienda exactamente `f · 82.800` horas.
 */
export function umbralesDeHoras(semilla = 1923): Float32Array {
  const azar = mulberry32(semilla);
  const semanas = Array.from({ length: ANIOS * SEMANAS_POR_ANIO }, azar);
  const mezcla = new Float64Array(TOTAL_DE_HORAS);
  for (let h = 0; h < TOTAL_DE_HORAS; h++) {
    mezcla[h] = 0.55 * azar() + 0.45 * (semanas[Math.floor(h / HORAS_POR_SEMANA)] ?? 0);
  }
  const orden = Array.from({ length: TOTAL_DE_HORAS }, (_, i) => i).sort(
    (a, b) => (mezcla[a] ?? 0) - (mezcla[b] ?? 0),
  );
  const umbrales = new Float32Array(TOTAL_DE_HORAS);
  orden.forEach((h, rango) => {
    umbrales[h] = (rango + 0.5) / TOTAL_DE_HORAS;
  });
  return umbrales;
}

/** Cuántas horas quedan encendidas con una fracción dada. */
export function horasEncendidas(fraccion: number): number {
  return Math.round(Math.min(1, Math.max(0, fraccion)) * TOTAL_DE_HORAS);
}
