/**
 * Repos — helpers tipados de lectura/escritura que usan las pantallas.
 *
 * Acá vive la cáscara impura (reloj, uuids, SQLite). Hasta R2 Task 5 las
 * reglas de una parte de este archivo vivían en `src/game/`, invocadas desde
 * acá; el juego se borró entero y esto quedó podado a lo que el resto de la
 * app (Protocolo Vivo, la escucha cívica, las misiones territoriales)
 * todavía necesita. API sincrónica de drizzle/expo-sqlite (.all/.get/.run):
 * simple y suficiente para una DB local de una persona.
 */

import { asc, eq } from 'drizzle-orm';
import { db } from './client';
import {
  civicActions,
  civicConsents,
  civicCustodyResponseIntents,
  civicCustodyExecutionIntents,
  civicDisclosureReceipts,
  civicListenings,
  civicMissionCells,
  civicMissions,
  civicMatches,
  civicNeedAccessGrants,
  civicNeedCustodies,
  civicNeeds,
  civicObservations,
  civicResources,
  civicRecordContexts,
  civicTerritories,
  civicVerifications,
  expeditionEntries,
  expeditions,
  pvMisionMiembros,
  pvMisiones,
  pvObras,
  pvPulsos,
  senales,
  settings,
  syncOutbox,
} from './schema';
import type {
  ExpeditionEntryRow,
  ExpeditionRow,
  OrigenExpedicion,
  SenalRow,
} from './schema';
import type { TipoSenalCapturada } from '../civic/types';

// ---------------------------------------------------------------------------
// Cáscara impura: ids y reloj
// ---------------------------------------------------------------------------

/** UUID v4 — usa crypto.randomUUID si existe (Hermes moderno), si no lo arma. */
export const nuevoId = (): string => {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const pad = (n: number): string => String(n).padStart(2, '0');

/** Fecha local del dispositivo, YYYY-MM-DD (la Argentina vive en local time). */
export const hoyLocal = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Timestamp ISO 8601 (UTC) para createdAt y ledger. */
export const ahoraISO = (): string => new Date().toISOString();

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/** Claves conocidas de settings. */
export const CLAVES = {
  /** Última visita a La Corriente — corriente.tsx. */
  corrienteUltimaVisita: 'corriente_ultima_visita',
  /** Pacto de datos aceptado antes de escuchar — escuchar.tsx. */
  pactoAceptado: 'pacto_aceptado',
  /** Se pidió (o se intentó pedir) permiso de ubicación una sola vez en la vida. */
  gpsPedido: 'gps_pedido',
  /**
   * El polígono de la zona elegida en el FTUE — `GeoPoint[]` serializado.
   * La única pregunta del onboarding cívico (`ftue.tsx`); la portada
   * (`(tabs)/index.tsx`) lo lee para armar la grilla de cobertura.
   */
  zona: 'mi_zona_v1',
} as const;

export const getSetting = (key: string): string | null =>
  db.select().from(settings).where(eq(settings.key, key)).get()?.value ?? null;

export const setSetting = (key: string, value: string): void => {
  db.insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
};

// ---------------------------------------------------------------------------
// Estrellas — cada captura real (spec §3.1)
// ---------------------------------------------------------------------------

export interface NuevaEstrella {
  tipo: TipoSenalCapturada;
  texto?: string | null;
  photoUri?: string | null;
  lat?: number | null;
  lng?: number | null;
  expeditionId?: string | null;
  expeditionStepKey?: string | null;
}

/** Arma la fila de una señal nueva a partir de lo que capturó la pantalla. */
const prepararEstrella = (id: string, input: NuevaEstrella): SenalRow => ({
  id,
  tipo: input.tipo,
  texto: input.texto ?? null,
  photoUri: input.photoUri ?? null,
  lat: input.lat ?? null,
  lng: input.lng ?? null,
  expeditionId: input.expeditionId ?? null,
  expeditionStepKey: input.expeditionStepKey ?? null,
  createdAt: ahoraISO(),
});

/**
 * Variante exclusiva de una captura cívica reintentable. El intento usa su
 * UUID como PK de la señal: si una escritura posterior falla, volver a llamar
 * devuelve la misma señal en vez de crear una segunda.
 */
export const crearEstrellaCivicaUnaVez = (
  captureAttemptId: string,
  input: NuevaEstrella,
): SenalRow => {
  const validate = (senal: SenalRow): SenalRow => {
    if (
      senal.tipo !== input.tipo
      || senal.expeditionId !== (input.expeditionId ?? null)
      || senal.expeditionStepKey !== (input.expeditionStepKey ?? null)
    ) throw new Error('capture_attempt_star_mismatch');
    return senal;
  };
  const existing = db.select().from(senales).where(eq(senales.id, captureAttemptId)).get();
  if (existing) return validate(existing);
  const row = prepararEstrella(captureAttemptId, input);
  db.insert(senales).values(row).onConflictDoNothing().run();
  return validate(db.select().from(senales).where(eq(senales.id, captureAttemptId)).get() ?? row);
};

// ---------------------------------------------------------------------------
// Expediciones — cuadernos de progreso multi-paso
//
// La expedición y sus tablas nacieron como el "mini-juego" de progreso del
// juego (spec §3.2), pero sobreviven: el Protocolo Vivo las usa como
// contenedor de avance para misiones de relevamiento (`repos-protocolo.ts`,
// `fundarMision`). El ritual guiado de captura (paso a paso, con recompensa
// en brasas) se fue con `src/app/expediciones/[id].tsx` en R2 Task 5 — hoy
// sólo se fundan y se leen, nunca se les agrega una entrada nueva.
// ---------------------------------------------------------------------------

export interface NuevaExpedicion {
  plantillaId: string;
  titulo: string;
  zona: string;
  meta: number;
  /** Cómo llegó la expedición al dispositivo. 'propia' (fundada y pagada con
   * brasas) era del juego y se fue con él — hoy sólo fundan expediciones el
   * Protocolo Vivo, siempre 'precargada'. */
  origen?: OrigenExpedicion;
}

/** Funda (o importa) una expedición. */
export const fundarExpedicion = (input: NuevaExpedicion): ExpeditionRow => {
  if (!Number.isInteger(input.meta) || input.meta < 1) {
    throw new Error(`Meta inválida: ${input.meta} (tiene que ser un entero ≥ 1)`);
  }
  const row: ExpeditionRow = {
    id: nuevoId(),
    plantillaId: input.plantillaId,
    titulo: input.titulo,
    zona: input.zona,
    meta: input.meta,
    estado: 'activa',
    origen: input.origen ?? 'precargada',
    hitosOtorgados: '[]',
    createdAt: ahoraISO(),
  };
  db.insert(expeditions).values(row).run();
  return row;
};

export const expedicionPorId = (id: string): ExpeditionRow | null =>
  db.select().from(expeditions).where(eq(expeditions.id, id)).get() ?? null;

export const entradasDeExpedicion = (expeditionId: string): ExpeditionEntryRow[] =>
  db
    .select()
    .from(expeditionEntries)
    .where(eq(expeditionEntries.expeditionId, expeditionId))
    .orderBy(asc(expeditionEntries.createdAt))
    .all();

// ---------------------------------------------------------------------------
// Export y borrado local (spec §3.7 — ética innegociable)
//
// Estas dos funciones son infraestructura genérica, no del juego: recorren
// TODAS las tablas que existen hoy.
// ---------------------------------------------------------------------------

/**
 * Copia completa de la base local, en una sola instantánea consistente.
 * La versión 10 inventaría también los comandos privados de respuesta y
 * ejecución pendientes, necesarios para reintentos exactos después de reiniciar.
 * La versión 11 sumó las tablas pv_* del Protocolo Vivo (Mission Layer):
 * misiones, membresías, obras y pulsos.
 * La versión 12 refleja la poda de R2 Task 6: `stars` pasa a `senales` y
 * las seis tablas que eran sólo del juego (`reflections`, `commitments`,
 * `days`, `ember_ledger`, `unlocks`, `redeemed_nonces`) dejan de existir.
 * Las credenciales de acceso de SecureStore/AsyncStorage no se exportan.
 */
export const exportarTodo = (): Record<string, unknown> => {
  const exportadoEn = ahoraISO();
  return db.transaction((tx) => ({
    exportadoEn,
    version: 12,
    senales: tx.select().from(senales).orderBy(asc(senales.createdAt)).all(),
    expeditions: tx.select().from(expeditions).orderBy(asc(expeditions.createdAt)).all(),
    expeditionEntries: tx.select().from(expeditionEntries).all(),
    settings: tx.select().from(settings).all(),
    territories: tx.select().from(civicTerritories).all(),
    missions: tx.select().from(civicMissions).all(),
    missionCells: tx.select().from(civicMissionCells).all(),
    civicListenings: tx.select().from(civicListenings).all(),
    civicRecordContexts: tx.select().from(civicRecordContexts).all(),
    civicDisclosureReceipts: tx.select().from(civicDisclosureReceipts).all(),
    observations: tx.select().from(civicObservations).all(),
    needs: tx.select().from(civicNeeds).all(),
    needCustodies: tx.select().from(civicNeedCustodies).all(),
    needAccessGrants: tx.select().from(civicNeedAccessGrants).all(),
    custodyResponseIntents: tx.select().from(civicCustodyResponseIntents).all(),
    custodyExecutionIntents: tx.select().from(civicCustodyExecutionIntents).all(),
    resources: tx.select().from(civicResources).all(),
    verifications: tx.select().from(civicVerifications).all(),
    matches: tx.select().from(civicMatches).all(),
    actions: tx.select().from(civicActions).all(),
    consents: tx.select().from(civicConsents).all(),
    outbox: tx.select().from(syncOutbox).all(),
    pvMisiones: tx.select().from(pvMisiones).all(),
    pvMisionMiembros: tx.select().from(pvMisionMiembros).all(),
    pvObras: tx.select().from(pvObras).all(),
    pvPulsos: tx.select().from(pvPulsos).all(),
  }));
};

/** Borra atómicamente todas las tablas locales. No afecta copias remotas. */
export const borrarTodo = (): void => {
  db.transaction((tx) => {
    if (tx.select().from(civicCustodyExecutionIntents).all().length > 0) {
      throw new Error('custody_execution_intent_pending');
    }
    tx.delete(syncOutbox).run();
    tx.delete(civicCustodyExecutionIntents).run();
    tx.delete(civicCustodyResponseIntents).run();
    tx.delete(civicActions).run();
    tx.delete(civicMatches).run();
    tx.delete(civicNeedAccessGrants).run();
    tx.delete(civicNeedCustodies).run();
    tx.delete(civicVerifications).run();
    tx.delete(civicListenings).run();
    tx.delete(civicDisclosureReceipts).run();
    tx.delete(civicRecordContexts).run();
    tx.delete(civicMissionCells).run();
    tx.delete(civicMissions).run();
    tx.delete(civicNeeds).run();
    tx.delete(civicResources).run();
    tx.delete(civicObservations).run();
    tx.delete(civicTerritories).run();
    tx.delete(civicConsents).run();

    tx.delete(pvPulsos).run();
    tx.delete(pvMisionMiembros).run();
    tx.delete(pvObras).run();
    tx.delete(pvMisiones).run();

    tx.delete(expeditionEntries).run();
    tx.delete(senales).run();
    tx.delete(expeditions).run();
    tx.delete(settings).run();
  });
};
