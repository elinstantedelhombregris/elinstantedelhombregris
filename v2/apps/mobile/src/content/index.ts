/**
 * Contenido estático cívico y de Protocolo Vivo.
 * Punto de entrada único: `import { SENALES, PLANTILLAS_EXPEDICION, ... } from '@/content'`.
 *
 * El contenido que era sólo del juego (preguntas de la luz VER, mazo de
 * compromisos de DAR, constelaciones y paletas del álbum) se borró en
 * R2 Task 5 junto con las pantallas que lo consumían.
 */

export type {
  TipoSenal,
  MicroUI,
  SenalExpedicion,
  PasoExpedicion,
  PlantillaExpedicion,
} from './types';

export { SENALES, SENAL_POR_KEY, type SenalDef } from './senales';
export { PLANTILLAS_EXPEDICION } from './expediciones';
export { FTUE, NOTIFICACIONES } from './textos-ui';
