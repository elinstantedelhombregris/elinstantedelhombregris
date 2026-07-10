/**
 * Tipos compartidos de la lógica de juego — TS puro, cero imports.
 *
 * Nota de coordinación: `src/content/types.ts` no existía al momento de
 * escribir este archivo (lo genera otro agente en paralelo), así que los
 * tipos mínimos que necesita el juego viven acá. El contenido estático puede
 * importar desde `@/game/types` o declarar supertipos estructuralmente
 * compatibles (TS estructural media a favor nuestro).
 */

/** Los 6 tipos de señal del movimiento — colores canónicos en la UI. */
export type TipoSenal =
  | 'dream'
  | 'need'
  | 'basta'
  | 'value'
  | 'compromiso'
  | 'recurso';

/** Tipo de estrella: una señal, o la estrella de amistad (chispa recibida — no es señal). */
export type TipoEstrella = TipoSenal | 'amistad';

/** Las Tres Luces del día. */
export type Luz = 'ver' | 'encender' | 'dar';

/** Una estrella del Cielo: cada captura real. */
export interface Star {
  id: string;
  tipo: TipoEstrella;
  texto: string | null;
  photoUri: string | null;
  lat: number | null;
  lng: number | null;
  /** Primera estrella de su tipo en el cielo. */
  fundadora: boolean;
  /** Capturada entre 22:00 y 06:00 (hora local). */
  nocturna: boolean;
  /** Capturada con un evento fugaz activo. */
  fugaz: boolean;
  expeditionId: string | null;
  expeditionStepKey: string | null;
  /** Asignada al completar una constelación; null = libre. */
  constelacionId: string | null;
  /** ISO 8601 — orden cronológico del cielo. */
  createdAt: string;
}

/** Registro de un día: qué luces se encendieron. */
export interface DayRecord {
  /** Fecha local YYYY-MM-DD. */
  fecha: string;
  ver: boolean;
  encender: boolean;
  dar: boolean;
  /** Las tres encendidas. Derivado, se persiste por conveniencia. */
  nocheCompleta: boolean;
}

/** Estado de la Estrella Guía. */
export interface RachaEstado {
  /** Noches acumuladas desde el último apagón (o rito). */
  racha: number;
  /** Noches nubladas consumidas en la semana calendario de `hoy` (máx. 2). */
  nubladasUsadasEstaSemana: number;
  /** false = la racha se apagó y espera el rito de re-encendido. */
  viva: boolean;
}

/** Entrada del ledger de brasas — append-only, jamás se edita ni borra. */
export interface EmberEntry {
  id: string;
  /** Positivo = ganancia, negativo = gasto. */
  delta: number;
  /** Texto visible en la UI (rioplatense): 'Luz de ver', 'Noche completa'… */
  motivo: string;
  /** ISO 8601 (fecha o fecha-hora). */
  fecha: string;
}

/** Rango de progresión por brasas acumuladas históricas (no balance). */
export interface Rango {
  nombre: 'Chispa' | 'Vela' | 'Farol' | 'Fogata' | 'Faro' | 'Aurora';
  /** Brasas totales ganadas necesarias para alcanzarlo. */
  umbral: number;
}

/** Efectos posibles de una estrella fugaz (§3.4). */
export type EventoFugaz = 'pregunta-extra' | 'brasas-x2' | 'desafio-24h';

/** Receta mínima de una constelación: cuántas estrellas de cada tipo pide. */
export interface ConstelacionReceta {
  id: string;
  /** Ej.: { need: 6, recurso: 4, value: 2 }. */
  receta: Partial<Record<TipoSenal, number>>;
}

/** Estados de una expedición. */
export type EstadoExpedicion = 'activa' | 'completa';

/** Cómo llegó la expedición al dispositivo. */
export type OrigenExpedicion = 'propia' | 'precargada' | 'qr';

/** Estados de un micro-compromiso. */
export type EstadoCompromiso = 'pendiente' | 'cumplido' | 'no';

/** Tipos de desbloqueo persistidos. */
export type TipoUnlock = 'carta' | 'paleta' | 'rango';
