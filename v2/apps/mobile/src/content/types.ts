/**
 * Tipos del contenido estático cívico y de Protocolo Vivo.
 * Self-contained: este módulo no importa nada.
 *
 * `Pregunta`/`CategoriaCompromiso`/`Compromiso` (luces VER/DAR del juego) y
 * `PuntoSilueta`/`CartaLore`/`Constelacion` (álbum del juego) se borraron en
 * R2 Task 5 junto con sus pantallas y su contenido — ver
 * `.superpowers/sdd/r2-task-5-report.md`.
 */

/** Los seis tipos de señal del movimiento (colores canónicos). */
export type TipoSenal = 'dream' | 'value' | 'need' | 'basta' | 'compromiso' | 'recurso';

/** Micro-UI propia de cada paso de expedición — nunca un formulario plano. */
export type MicroUI = 'foto-guiada' | 'contador' | 'rating-soles' | 'chips' | 'texto-corto';

/** Señales que puede producir una expedición. */
export type SenalExpedicion = 'need' | 'basta' | 'recurso' | 'dream';

/** Un paso de expedición, con su micro-UI. */
export interface PasoExpedicion {
  /** Clave estable dentro de la plantilla (kebab-case). */
  key: string;
  titulo: string;
  /** Copy de juego, rioplatense, en segunda persona. */
  instruccion: string;
  microUI: MicroUI;
  /** Solo para microUI 'chips': opciones seleccionables. */
  opciones?: string[];
  /** Solo para microUI 'rating-soles' (cantidad de soles) o 'contador' (tope opcional). */
  max?: number;
}

/** Plantilla de expedición (quest multi-paso de recolección de datos). */
export interface PlantillaExpedicion {
  /** Formato estable: exp-<slug> */
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  /** Tipo de señal que generan las entradas de esta expedición. */
  senal: SenalExpedicion;
  pasos: PasoExpedicion[];
  /** Meta de entradas sugerida al fundar. */
  metaSugerida: number;
  /** Duración sugerida en días. */
  duracionDiasSugerida: number;
}
