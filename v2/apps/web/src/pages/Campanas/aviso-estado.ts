import { esEjemploLocal, fechaCampana } from './presentacion';

import type { CampanaPublica } from '@v2/shared';

export interface AvisoDeEstado {
  /** La primera frase, en negrita: lo que hay que saber antes de seguir leyendo. */
  titular: string;
  /** El resto, si hace falta. */
  detalle?: string;
}

/** El último motivo escrito para dejar la campaña en este estado. */
function motivoDelEstado(c: Pick<CampanaPublica, 'estado' | 'historial'>) {
  return c.historial
    .filter((h) => h.estado === c.estado && h.motivo.trim())
    .sort((a, b) => b.revision - a.revision)[0]?.motivo;
}

/**
 * El único aviso fuerte de la página de una campaña: en qué estado está y qué significa para
 * quien llega. Una campaña abierta no necesita aviso, porque lo dice el botón de sumar un aporte.
 *
 * El resto de la página no repite este aviso: a lo sumo agrega una frase corta.
 */
export function avisoDeEstado(
  c: Pick<
    CampanaPublica,
    'estado' | 'historial' | 'contrato' | 'puedoEditar' | 'puedoEditarContrato' | 'slug'
  >,
  { esAdmin }: { esAdmin: boolean },
): AvisoDeEstado | null {
  if (esEjemploLocal(c))
    return {
      titular: 'Ejemplo local, sin campaña real.',
      detalle:
        'La pregunta, las fechas y el equipo son ilustrativos: no hay participantes ni una respuesta institucional comprometida. Está en pausa y no recibe aportes.',
    };
  switch (c.estado) {
    case 'borrador':
      if (!c.puedoEditar && !c.puedoEditarContrato) return null;
      return {
        titular: 'Esta campaña es un borrador: solo la ven vos y tu equipo.',
        // Quien la propuso la presenta para juntar gente (§11); a quien sólo edita sus reglas,
        // la abre la coordinación.
        detalle: esAdmin
          ? 'Cuando esté lista, abrila desde “Cuidar el recorrido”.'
          : c.puedoEditar
            ? 'Cuando esté lista, presentala para empezar a juntar gente.'
            : 'Cuando esté lista, la abre la coordinación de ¡BASTA!',
      };
    case 'reuniendo':
      return {
        titular: 'Esta campaña está juntando gente para poder abrir.',
        detalle:
          'Abre cuando traiga 50 personas nuevas a imaginar el país y la coordinación de ¡BASTA! revise sus reglas.',
      };
    case 'por_revisar':
      return {
        titular: 'Esta campaña ya juntó la gente que necesitaba: está en revisión.',
        detalle: 'La coordinación de ¡BASTA! revisa sus reglas antes de abrirla.',
      };
    case 'programada':
      return {
        titular: 'Esta campaña todavía no abrió.',
        detalle: 'Cuando abra, vas a poder sumar tu aporte desde acá.',
      };
    case 'pausada': {
      const motivo = motivoDelEstado(c);
      return {
        titular: 'Esta campaña está en pausa: por ahora no recibe aportes.',
        detalle: motivo
          ? `Lo que ya se publicó sigue a la vista. Motivo de la pausa: ${motivo}`
          : 'Lo que ya se publicó sigue a la vista.',
      };
    }
    case 'en_devolucion':
      return {
        titular: 'Esta campaña ya no recibe aportes: el equipo está preparando la devolución.',
        detalle: `Está prevista para el ${fechaCampana(c.contrato.fechaDevolucion)}.`,
      };
    case 'cerrada':
      return {
        titular: 'Esta campaña está cerrada y ya no recibe aportes.',
        detalle: 'Lo que se devolvió sigue a la vista más abajo.',
      };
    case 'abierta':
      return null;
  }
}
