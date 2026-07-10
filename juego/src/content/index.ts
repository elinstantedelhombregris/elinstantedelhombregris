/**
 * Contenido estático de ¡BASTA! — el juego.
 * Punto de entrada único: `import { PREGUNTAS, CONSTELACIONES, ... } from '@/content'`.
 */

export type {
  TipoSenal,
  Pregunta,
  CategoriaCompromiso,
  Compromiso,
  MicroUI,
  SenalExpedicion,
  PasoExpedicion,
  PlantillaExpedicion,
  PuntoSilueta,
  CartaLore,
  Constelacion,
} from './types';

export { PREGUNTAS } from './preguntas';
export { SENALES, SENAL_POR_KEY, type SenalDef } from './senales';
export { COMPROMISOS } from './compromisos';
export { PLANTILLAS_EXPEDICION } from './expediciones';
export { CONSTELACIONES } from './constelaciones';
export {
  FTUE,
  NOCHE_COMPLETA,
  RITO_REENCENDIDO,
  NOCHE_NUBLADA,
  ESTRELLA_FUGAZ,
  ASCENSO_RANGO,
  NOTIFICACIONES,
  COMPROMISO_AYER,
  ESTADOS_VACIOS,
  COMPARTIR,
  CAPTURA,
} from './textos-ui';
