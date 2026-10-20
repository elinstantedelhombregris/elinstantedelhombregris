/**
 * Cómo se cuenta y se dice el paso previo de una campaña propuesta (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §11). Funciones puras: las pantallas las usan y las
 * pruebas las fijan.
 */
import type { ContenidoDeImagen } from '../MiArgentinaIdeal/comun/imagen-para-compartir';
import type { CampanaPublica } from '@v2/shared';

/** Una campaña propuesta que todavía no abrió: junta gente o espera la revisión. */
export const juntaGente = (estado: string) => estado === 'reuniendo' || estado === 'por_revisar';

export interface Impulso {
  personas: number;
  umbral: number;
}

const numero = (n: number) => n.toLocaleString('es-AR');

/** «Para abrirse, esta campaña necesita 50 personas nuevas. Lleva 18.» */
export function textoDeLaBarra({ personas, umbral }: Impulso): string {
  if (personas >= umbral)
    return `Ya trajo las ${numero(umbral)} personas nuevas que necesitaba para abrirse.`;
  const lleva = personas === 0 ? 'Todavía no llegó ninguna.' : `Lleva ${numero(personas)}.`;
  return `Para abrirse, esta campaña necesita ${numero(umbral)} personas nuevas. ${lleva}`;
}

/** Lo que le falta a quien la impulsa, dicho a esa persona. */
export function textoDeLoQueFalta({ personas, umbral }: Impulso): string {
  const faltan = umbral - personas;
  if (faltan <= 0) return 'Ya trajiste a todas las personas que hacían falta.';
  return faltan === 1
    ? 'Te falta una persona nueva para que pase a revisión.'
    : `Te faltan ${numero(faltan)} personas nuevas para que pase a revisión.`;
}

/**
 * El motivo con que la coordinación devolvió la campaña, si la devolvió y todavía no se volvió a
 * presentar a revisión: el último paso a `reuniendo` que vino justo después de `por_revisar`.
 * Sirve mientras la campaña vuelve a juntar gente y mientras quien la impulsa la corrige.
 */
export function motivoDeDevolucion(c: Pick<CampanaPublica, 'estado' | 'historial'>): string | null {
  if (c.estado !== 'reuniendo' && c.estado !== 'borrador') return null;
  const pasos = [...c.historial].sort((a, b) => a.revision - b.revision);
  let motivo: string | null = null;
  let previo: string | undefined;
  for (const paso of pasos) {
    if (paso.estado === 'por_revisar') motivo = null;
    else if (paso.estado === 'reuniendo' && previo === 'por_revisar' && paso.motivo.trim())
      motivo = paso.motivo.trim();
    previo = paso.estado;
  }
  return motivo;
}

/**
 * Los motivos que quedan en la historia pública de la campaña cuando el paso no necesita que
 * nadie explique nada. El servidor pide un motivo en todo cambio de estado.
 */
export const MOTIVOS = {
  presentar: 'Quien la propone la presenta para juntar gente.',
  retirar: 'Quien la impulsa la retira para corregirla.',
  abrir: 'La coordinación revisó sus reglas y la abre.',
  programar: 'La coordinación revisó sus reglas y la programa.',
} as const;

/** El mínimo del motivo que pide el servidor (`cambiarCampanaSchema`). */
export const MOTIVO_MINIMO = 10;

/** La imagen para compartir una campaña que junta gente. */
export function contenidoParaCompartir(pregunta: string, lugar: string): ContenidoDeImagen {
  return {
    kicker: 'Una campaña quiere abrir',
    texto: pregunta,
    pie: lugar || 'Todo el país',
    llamado: '¿Te sumás?',
    bajada: 'Contá tu Argentina ideal y ayudala a abrir',
  };
}

/** Los nombres de los lugares, en una línea corta: «Salta · Jujuy y 2 lugares más». */
export function lineaDeLugares(nombres: readonly string[], total: number): string {
  if (!total) return 'Todo el país';
  const visibles = nombres.slice(0, 2).join(' · ');
  const resto = total - Math.min(nombres.length, 2);
  if (!visibles) return '';
  return resto > 0
    ? `${visibles} y ${resto} ${resto === 1 ? 'lugar más' : 'lugares más'}`
    : visibles;
}

/**
 * El servidor ya tiene una campaña de esta cuenta juntando gente o en revisión: cada cuenta
 * propone una por vez. El 409 de un reintento con otro contenido (`ENVIO_DISTINTO`) es otra cosa.
 */
export function esPropuestaActiva(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false;
  const { status, code } = e as { status?: unknown; code?: unknown };
  return status === 409 && code !== 'ENVIO_DISTINTO' && code !== 'REVISION_CAMBIADA';
}
