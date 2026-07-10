/**
 * Tipos del contenido estático de ¡BASTA! — el juego.
 * Self-contained: este módulo no importa nada.
 */

/** Los seis tipos de señal del movimiento (colores canónicos). */
export type TipoSenal = 'dream' | 'value' | 'need' | 'basta' | 'compromiso' | 'recurso';

/** Pregunta honda del día (luz VER). Texto verbatim de los ensayos. */
export interface Pregunta {
  /** Formato estable: q001..q999 */
  id: string;
  texto: string;
  /** Título del ensayo fuente, tal como figura en su H1. */
  fuente: string;
}

/** Categorías del mazo de micro-compromisos (luz DAR). */
export type CategoriaCompromiso =
  | 'vecindad'
  | 'cuidado'
  | 'coraje'
  | 'palabra'
  | 'orden'
  | 'belleza';

/** Micro-compromiso diario: concreto, humilde, verificable por uno mismo. */
export interface Compromiso {
  /** Formato estable: `${categoria}-NN` */
  id: string;
  texto: string;
  categoria: CategoriaCompromiso;
}

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

/** Punto de la silueta de una constelación, normalizado a [0,1] x [0,1]. */
export interface PuntoSilueta {
  x: number;
  y: number;
}

/** Carta de Lore: fragmento verbatim de los ensayos, se gana al completar la constelación. */
export interface CartaLore {
  titulo: string;
  /** Cita textual (1–3 oraciones) copiada de los ensayos. */
  cita: string;
  /** Título del ensayo fuente. */
  ensayo: string;
}

/** Constelación coleccionable. La receta suma exactamente la cantidad de puntos de la silueta. */
export interface Constelacion {
  /** kebab-case estable */
  id: string;
  nombre: string;
  descripcion: string;
  /** Cuántas estrellas de cada tipo hacen falta. La suma == silueta.length (8–16). */
  receta: Partial<Record<TipoSenal, number>>;
  /** 8–16 puntos normalizados que dibujan la figura en el álbum. */
  silueta: PuntoSilueta[];
  carta: CartaLore;
}
