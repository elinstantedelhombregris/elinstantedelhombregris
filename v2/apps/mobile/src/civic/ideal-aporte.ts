/**
 * A qué campaña va un aporte, si se puede publicar ya y qué pasa con el borrador en cada giro del
 * flujo (sumar otro aporte, cambiar un envío rechazado). Todo puro: la pantalla lee la campaña y
 * esto decide.
 *
 * Decisión del 9/10/2026: todo aporte sin campaña elegida va a la campaña nacional «Mi Argentina
 * ideal». Si esa campaña no existe o no está abierta, el aporte se publica sin campaña y sin
 * bloquear a nadie. Una campaña elegida a mano que no está abierta sí bloquea, y lo dice.
 *
 * La edición (`revision`) de la campaña nacional se manda siempre tal como la campaña la informa
 * en ese momento: nunca se guarda en el borrador, para que no envejezca entre una sesión y otra.
 */
import { SLUG_CAMPANA_NACIONAL, type CampanaPublica } from '@v2/shared';

import { esCampanaNacional } from './ideal-textos';

import type { BorradorIdeal } from './ideal';

/** El servidor exige al menos un carácter después de recortar espacios (`senalSchema.texto`). */
export const MINIMO_CARACTERES_APORTE = 1;

/** Qué se sabe de la campaña que se está leyendo. */
export type LecturaCampana =
  | { tipo: 'cargando' }
  | { tipo: 'ok'; campana: CampanaPublica }
  | { tipo: 'no_existe' }
  | { tipo: 'error'; mensaje: string };

export type MotivoDeBloqueo = 'error' | 'cerrada' | 'edicion';

/** A dónde va el aporte, o por qué todavía no se puede publicar. */
export type Destino =
  | { tipo: 'cargando' }
  /** Hay campaña abierta. `edicion` es la que la campaña informa ahora. */
  | { tipo: 'campana'; campana: CampanaPublica; nacional: boolean; edicion: number }
  /** No hay campaña a la que sumar: se publica sin campaña. */
  | { tipo: 'ninguna' }
  | {
      tipo: 'bloqueado';
      motivo: MotivoDeBloqueo;
      campana: CampanaPublica | null;
      mensaje: string;
    };

export const MENSAJE_CAMPANA_CERRADA =
  'Esta campaña no recibe aportes ahora. Guardá tu texto en este teléfono y volvé cuando se abra.';
export const MENSAJE_EDICION_CAMBIADA =
  'Esta campaña pasó a otra edición desde que empezaste. Guardá tu texto en este teléfono y leé las reglas de la campaña antes de publicar.';
export const MENSAJE_CAMPANA_INEXISTENTE = 'Todavía no encontramos esa campaña.';

/**
 * Qué campaña hay que leer para un borrador, o `null` si no hay nada que leer.
 *  - Con un envío confirmado la campaña ya está fija: es la del envío (puede ser «ninguna»).
 *  - Con una campaña elegida, esa.
 *  - Sin ninguna, la campaña nacional (por su slug).
 */
export function campanaALeer(b: Pick<BorradorIdeal, 'campanaId' | 'envio'>): string | null {
  if (b.envio) return b.envio.campanaId;
  return b.campanaId ?? SLUG_CAMPANA_NACIONAL;
}

/** ¿La lectura que ya tengo es de la campaña que pido (por id o por slug)? Evita leerla dos veces. */
export function lecturaCoincide(pedida: string | null, lectura: LecturaCampana): boolean {
  return (
    pedida !== null &&
    lectura.tipo === 'ok' &&
    (lectura.campana.id === pedida || lectura.campana.slug === pedida)
  );
}

export function resolverDestino(e: {
  /** El borrador no eligió campaña: se busca la nacional. */
  porDefecto: boolean;
  /** El envío confirmado quedó sin campaña: no hay nada que leer. */
  sinCampana: boolean;
  /** La edición para la que se empezó a escribir, si se guardó. */
  edicion: number | null;
  lectura: LecturaCampana;
}): Destino {
  if (e.sinCampana) return { tipo: 'ninguna' };
  const { lectura } = e;
  if (lectura.tipo === 'cargando') return { tipo: 'cargando' };
  if (lectura.tipo === 'no_existe') {
    return e.porDefecto
      ? { tipo: 'ninguna' }
      : { tipo: 'bloqueado', motivo: 'error', campana: null, mensaje: MENSAJE_CAMPANA_INEXISTENTE };
  }
  if (lectura.tipo === 'error') {
    return { tipo: 'bloqueado', motivo: 'error', campana: null, mensaje: lectura.mensaje };
  }
  const c = lectura.campana;
  if (c.estado !== 'abierta') {
    return e.porDefecto
      ? { tipo: 'ninguna' }
      : { tipo: 'bloqueado', motivo: 'cerrada', campana: c, mensaje: MENSAJE_CAMPANA_CERRADA };
  }
  const nacional = esCampanaNacional(c);
  // La nacional siempre va con la edición de hoy; otra campaña conserva la edición con la que se
  // empezó a escribir y bloquea si cambió.
  if (!nacional && e.edicion !== null && e.edicion !== c.revision) {
    return { tipo: 'bloqueado', motivo: 'edicion', campana: c, mensaje: MENSAJE_EDICION_CAMBIADA };
  }
  return { tipo: 'campana', campana: c, nacional, edicion: c.revision };
}

/** Lo que viaja en el envío: la campaña y su edición vigente. `null` si todavía no se puede enviar. */
export function destinoDelEnvio(
  d: Destino,
): { campanaId: string | null; edicion: number | null } | null {
  if (d.tipo === 'campana') return { campanaId: d.campana.id, edicion: d.edicion };
  if (d.tipo === 'ninguna') return { campanaId: null, edicion: null };
  return null;
}

/** La línea que dice a dónde va el aporte, antes de publicarlo. */
export function lineaDeDestino(d: Destino): string | null {
  switch (d.tipo) {
    case 'cargando':
      return 'Buscando la campaña…';
    case 'campana':
      return `Va a la campaña ${d.nacional ? 'nacional ' : ''}«${d.campana.contrato.titulo}», edición ${d.edicion}.`;
    case 'ninguna':
      return 'Por ahora no hay una campaña abierta: tu aporte se publica sin campaña.';
    case 'bloqueado':
      return d.campana
        ? `Campaña «${d.campana.contrato.titulo}», edición ${d.campana.revision}.`
        : null;
  }
}

export const MOTIVO_SIN_TEXTO = 'Escribí al menos una frase para seguir.';
export const MOTIVO_CASILLAS_DOS = 'Marcá las dos casillas para publicar.';
export const MOTIVO_CASILLAS_TRES = 'Marcá las tres casillas para publicar.';
export const MOTIVO_BUSCANDO_CAMPANA = 'Un momento: estamos buscando la campaña.';
/** El detalle de un bloqueo se muestra arriba, junto a la campaña; acá sólo se apunta a él. */
export const MOTIVO_CAMPANA_PENDIENTE =
  'Para publicar falta resolver lo de la campaña, más arriba.';

/**
 * Por qué el botón «Publicar mi aporte» está apagado, dicho con palabras, o `null` si se puede
 * publicar. El orden es el de lo que la persona puede hacer primero: escribir, marcar, esperar.
 */
export function motivoSinPublicar(e: {
  texto: string;
  asistido: boolean;
  autor: boolean;
  revisado: boolean;
  publico: boolean;
  destino: Destino;
}): string | null {
  if (e.texto.trim().length < MINIMO_CARACTERES_APORTE) return MOTIVO_SIN_TEXTO;
  const marcadas = e.revisado && e.publico && (!e.asistido || e.autor);
  if (!marcadas) return e.asistido ? MOTIVO_CASILLAS_TRES : MOTIVO_CASILLAS_DOS;
  if (e.destino.tipo === 'cargando') return MOTIVO_BUSCANDO_CAMPANA;
  if (e.destino.tipo === 'bloqueado') return MOTIVO_CAMPANA_PENDIENTE;
  return null;
}

/** Un borrador en blanco. El `id` es la clave de idempotencia (`idLocal`): siempre uno nuevo. */
export function borradorNuevo(
  id: string,
  ahora: Date,
  campana: { campanaId: string | null; edicion: number | null } = {
    campanaId: null,
    edicion: null,
  },
): BorradorIdeal {
  return {
    id,
    texto: '',
    tema: '',
    campanaId: campana.campanaId,
    edicion: campana.edicion,
    modo: 'personal',
    fecha: ahora.toISOString(),
    envio: null,
    recibo: null,
  };
}

/**
 * «Sumar otro aporte»: empieza de cero con un `id` nuevo, en la misma campaña si se había elegido
 * una. Sin la edición, para que se lea la de hoy. Reusar el `id` haría que la API devuelva el aporte
 * anterior en vez de crear el nuevo.
 */
export function borradorParaOtroAporte(
  actual: Pick<BorradorIdeal, 'campanaId'>,
  idNuevo: string,
  ahora: Date,
): BorradorIdeal {
  return borradorNuevo(idNuevo, ahora, { campanaId: actual.campanaId, edicion: null });
}

/**
 * «Cambiar el texto o el tema» tras un rechazo: descarta el envío confirmado y su cuenta, y le da al
 * borrador un `id` nuevo. Con el `id` viejo, la API reconocería el envío anterior y devolvería su
 * resultado en vez de tomar el texto corregido.
 */
export function borradorParaCambiarEnvio(actual: BorradorIdeal, idNuevo: string): BorradorIdeal {
  const nuevo: BorradorIdeal = { ...actual, id: idNuevo, envio: null, recibo: null };
  delete nuevo.cuentaAlConfirmar;
  return nuevo;
}
