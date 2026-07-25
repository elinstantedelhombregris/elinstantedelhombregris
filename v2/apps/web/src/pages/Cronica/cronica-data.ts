import { CRONICA_CHAPTERS, type CronicaChapter } from '~/lib/cronica-registry';

/**
 * La crónica del país que viene (spec 3.6) — derivaciones mínimas. A
 * diferencia de `biblioteca-data.ts` (ciclos, vecinos entre rutas) esta
 * novela vive entera en UNA ruta: no hay «vecino» que resolver, solo un
 * conteo y un ancla por capítulo. `CRONICA_CHAPTERS` ya viene ordenado por
 * `orderIndex` desde el registry — no se reordena acá.
 */
export const CAPITULO_COUNT = CRONICA_CHAPTERS.length;

/** Ancla estable del sumario y de la sección: «capitulo-3». */
export function idCapitulo(capitulo: CronicaChapter): string {
  return `capitulo-${String(capitulo.orderIndex)}`;
}

/** Numeración de fila del sumario: «01»…«05». */
export function numeroDeCapitulo(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}

/**
 * Fecha larga es-AR para el folio impreso. Duplicada a propósito (existe
 * la misma función en `manifiesto-data.ts` y `Biblioteca/biblioteca-data.ts`):
 * importarla de cualquiera de esos dos arrastraría su registry entero
 * (manifiesto o los 21 ensayos) al chunk de esta página.
 */
export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}
