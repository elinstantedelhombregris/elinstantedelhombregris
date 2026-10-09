/**
 * Lo que la app le dice a la persona sobre un aporte y sobre una campaña: fechas, etapas,
 * estados y la frase del recibo. Todo puro, sin red ni almacenamiento: así se puede afirmar en
 * un test y las pantallas (`imaginar`, `campanas`, `espacio-ideal`) hablan con las mismas palabras.
 *
 * Glosario (decisión del 9/10/2026): «aporte» es lo publicado; «borrador» es la copia sin
 * publicar que vive en el teléfono; «etapa» (nunca «fase»); «campaña»; «reglas de la campaña».
 */
import { SLUG_CAMPANA_NACIONAL, type CampanaPublica } from '@v2/shared';

import type { BorradorIdeal } from './ideal';

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

/**
 * `2027-03-15` (o una fecha con hora) → `15 de marzo de 2027`. A mano: Hermes no garantiza los
 * datos de idioma de `Intl`, y el resultado nunca debe depender del motor. Lo que no se puede leer
 * se devuelve tal cual en vez de inventar una fecha.
 */
export function fechaLarga(valor: string): string {
  const dia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (dia) {
    const mes = MESES[Number(dia[2]) - 1];
    if (mes) return `${Number(dia[3])} de ${mes} de ${dia[1]}`;
    return valor;
  }
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

/** Las etapas de una campaña, con las mismas palabras que la web (`FASES_ROTULO`). */
export const ROTULO_ETAPA: Readonly<Record<string, string>> = {
  borrador: 'En preparación',
  programada: 'Programada',
  abierta: 'Abierta a participar',
  pausada: 'Pausada',
  en_devolucion: 'Preparando la devolución',
  cerrada: 'Cerrada',
};
export function rotuloEtapa(estado: string): string {
  return ROTULO_ETAPA[estado] ?? 'Etapa sin nombre';
}

/** El estado de un aporte, en castellano: nunca la clave con guiones bajos. */
export const ROTULO_ESTADO_APORTE: Readonly<Record<string, string>> = {
  enviada: 'Publicado',
  por_verificar: 'Por verificar',
  corroborada: 'Corroborado',
  resuelta: 'Resuelto',
  desactualizada: 'Desactualizado',
  no_cumplida: 'No cumplido',
  retirada: 'Retirado',
};
export function rotuloEstadoAporte(estado: string): string {
  const conocido = ROTULO_ESTADO_APORTE[estado];
  if (conocido) return conocido;
  const legible = estado.replaceAll('_', ' ').trim();
  return legible ? legible.charAt(0).toUpperCase() + legible.slice(1) : 'Estado sin nombre';
}

/** La campaña nacional permanente, a la que va todo aporte que no elige otra. */
export const esCampanaNacional = (c: Pick<CampanaPublica, 'slug'>): boolean =>
  c.slug === SLUG_CAMPANA_NACIONAL;

/**
 * Las campañas de demostración. La web marca una sola (`demo-local-aprender-mendoza`); el prefijo
 * cubre las que se siembren con el mismo criterio, para que ninguna se confunda con una real.
 */
export const PREFIJO_CAMPANA_EJEMPLO = 'demo-local-';
export const esCampanaEjemplo = (c: Pick<CampanaPublica, 'slug'>): boolean =>
  c.slug.startsWith(PREFIJO_CAMPANA_EJEMPLO);

/** Las campañas reales primero y los ejemplos al final, sin tocar el orden dentro de cada grupo. */
export function ordenarCampanas<T extends Pick<CampanaPublica, 'slug'>>(
  campanas: readonly T[],
): T[] {
  return [
    ...campanas.filter((c) => !esCampanaEjemplo(c)),
    ...campanas.filter((c) => esCampanaEjemplo(c)),
  ];
}

type CampanaDelRecibo = Pick<CampanaPublica, 'slug' | 'contrato'>;

/**
 * La frase de campaña del bloque «Tu aporte quedó publicado.». Tres variantes, y los valores
 * (título, responsable, fecha) salen siempre de los datos de la campaña, nunca escritos acá.
 *  - campaña nacional,
 *  - otra campaña,
 *  - ninguna campaña (nadie se comprometió a responder).
 * Si el aporte entró en una campaña pero no se pudieron leer sus datos, lo dice en vez de inventar
 * un responsable o una fecha.
 */
export function fraseDeCampanaDelRecibo(e: {
  campanaId: string | null;
  campana: CampanaDelRecibo | null;
}): string {
  if (e.campanaId === null) {
    return 'Tu aporte quedó publicado. Por ahora no está en ninguna campaña, así que nadie se comprometió a responderlo.';
  }
  if (!e.campana) {
    return 'Tu aporte entró en una campaña, pero ahora no pudimos leer sus datos. Abrí Campañas para ver quién la coordina y cuándo devuelve lo que se leyó.';
  }
  const { titulo, responsable, fechaDevolucion } = e.campana.contrato;
  const cual = esCampanaNacional(e.campana) ? 'la campaña nacional' : 'la campaña';
  return `Tu aporte entró en ${cual} «${titulo}». ${responsable}, que la coordina, va a publicar una devolución el ${fechaLarga(fechaDevolucion)} con lo que se leyó.`;
}

export interface BloqueDeExito {
  titulo: string;
  lead: string;
  /** Null cuando no hay nada que decir de la campaña (el aporte ya se retiró). */
  campana: string | null;
}
/** El bloque que reemplaza al formulario cuando el aporte ya está publicado (o se retiró). */
export function bloqueDeExito(e: {
  retirado: boolean;
  campanaId: string | null;
  campana: CampanaDelRecibo | null;
  /** Todavía se está leyendo la campaña: no se dice nada de ella hasta saberlo. */
  leyendo?: boolean;
}): BloqueDeExito {
  if (e.retirado) {
    return {
      titulo: 'Retiraste tu aporte.',
      lead: 'Dejó de estar disponible en las lecturas actualizadas. No podemos recuperar las copias que otras personas ya descargaron.',
      campana: null,
    };
  }
  return {
    titulo: 'Tu aporte quedó publicado.',
    lead: 'Ya podés verlo, corregirlo o retirarlo. No es un acuerdo ni un compromiso de nadie.',
    campana: e.leyendo && e.campanaId !== null ? null : fraseDeCampanaDelRecibo(e),
  };
}

/** Lo que dice la lista «Mis borradores» de cada copia: qué es y si ya salió del teléfono. */
export function estadoDelBorrador(b: Pick<BorradorIdeal, 'recibo' | 'envio' | 'retirado'>): string {
  if (b.recibo && b.retirado) return 'Aporte retirado · la copia sigue en este teléfono';
  if (b.recibo) return 'Aporte publicado · la copia sigue en este teléfono';
  if (b.envio) return 'Sin confirmar · reintentá el envío para saber si se publicó';
  return 'Borrador · solo en este teléfono';
}

/** El contador bajo el texto: no promete privacidad cuando el aporte ya es público. */
export function leyendaDelContador(
  largo: number,
  b: Pick<BorradorIdeal, 'recibo' | 'envio'>,
): string {
  if (b.recibo) return `${largo}/2000`;
  if (b.envio) return `${largo}/2000 · envío sin confirmar`;
  return `${largo}/2000 · privado hasta que lo publiques`;
}
