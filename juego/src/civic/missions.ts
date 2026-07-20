import { and, asc, desc, eq, inArray } from 'drizzle-orm';

import { db, type DBExecutor } from '@/db/client';
import { getSetting, nuevoId, setSetting } from '@/db/repos';
import {
  civicMissionCells,
  civicMissions,
  civicNeeds,
  civicObservations,
  civicVerifications,
  settings,
} from '@/db/schema';
import type {
  CivicMissionCellRow,
  CivicMissionRow,
} from '@/db/schema';

import { getActorKey } from './identity';
import {
  validateMissionCellVisit,
  type MissionLocationProof,
} from './mission-cell-visit';
import type {
  CivicCampaignKey,
  CivicMissionStatus,
  CivicRecordStatus,
  CoverageCellStatus,
  GeoPoint,
  LocationPrecision,
  MissionSensitivity,
} from './types';

const ACTIVE_CELL_KEY = 'civic.active-mission-cell.v1';
const json = (value: unknown): string => JSON.stringify(value);
const now = (): string => new Date().toISOString();

export interface MissionCellSeed {
  key: string;
  polygon: GeoPoint[];
  center: GeoPoint;
}

/** Etiqueta humana derivada de la clave estable del motor de cobertura. */
export const missionCellLabel = (cellKey: string): string => {
  const match = cellKey.match(/_([0-9a-z]+)_([0-9a-z]+)$/i);
  if (!match) return cellKey.slice(0, 8);
  const row = Number.parseInt(match[1]!, 36);
  const column = Number.parseInt(match[2]!, 36);
  if (!Number.isFinite(row) || !Number.isFinite(column)) return cellKey.slice(0, 8);
  const rowLabel = row < 26 ? String.fromCharCode(65 + row) : `R${row + 1}`;
  return `${rowLabel}${column + 1}`;
};

export interface MissionPassport {
  campaignKey: CivicCampaignKey;
  campaignVersion: number;
  purpose: string;
  decisionRecipient: string;
  steward: string;
  verificationMethod: string;
  minIndependentVerifications: number;
  publicPrecision: LocationPrecision;
  retentionDays: number;
  closureCondition: string;
  sensitivity: MissionSensitivity;
}

export type MissionCellCompletionStatus =
  | 'completed'
  | 'no_active_cell'
  | 'mission_inactive'
  | 'campaign_mismatch'
  | 'not_assigned_to_actor'
  | 'missing_location'
  | 'location_not_field_verified'
  | 'location_accuracy_too_low'
  | 'outside_cell'
  | 'invalid_cell';

export interface MissionCellCompletion {
  status: MissionCellCompletionStatus;
  cell: CivicMissionCellRow | null;
}

export type { MissionLocationProof } from './mission-cell-visit';

export const LUMINARIA_MISSION_PASSPORT: MissionPassport = {
  campaignKey: 'luminarias-v1',
  campaignVersion: 1,
  purpose: 'Reconocer luminarias sin servicio y producir evidencia territorial para priorizar una respuesta verificable.',
  decisionRecipient: 'Área municipal responsable de alumbrado público',
  steward: 'Círculo territorial que convoca la misión',
  verificationMethod: 'Recorrido de campo independiente, con estado visible y zona aproximada.',
  minIndependentVerifications: 2,
  publicPrecision: '100m',
  retentionDays: 90,
  closureCondition: 'Todas las celdas recorridas y ninguna señal queda sin una segunda mirada; las discrepancias permanecen abiertas.',
  sensitivity: 'low',
};

export const OLLAS_MISSION_PASSPORT: MissionPassport = {
  campaignKey: 'ollas-v1',
  campaignVersion: 1,
  purpose: 'Mapear ollas y comedores comunitarios, registrar capacidades y faltantes prioritarios, y conectar apoyos sin exponer a quienes reciben alimentos.',
  decisionRecipient: 'Red de comedores, organizaciones de apoyo y áreas públicas responsables de asistencia alimentaria',
  steward: 'Círculo territorial convocante junto con referentes de las ollas participantes',
  verificationMethod: 'Visita o conversación consentida con un referente; cantidades aproximadas, prioridad actual y ubicación barrial.',
  minIndependentVerifications: 2,
  publicPrecision: 'neighborhood',
  retentionDays: 60,
  closureCondition: 'Todas las celdas recorridas; cada olla decide qué publicar y las necesidades quedan conectadas o explícitamente abiertas, sin exponer datos personales.',
  sensitivity: 'moderate',
};

export const MISSION_PASSPORTS: readonly MissionPassport[] = [
  LUMINARIA_MISSION_PASSPORT,
  OLLAS_MISSION_PASSPORT,
];

export const missionPassportForCampaign = (
  campaignKey: CivicCampaignKey | null | undefined,
): MissionPassport | null => MISSION_PASSPORTS.find(
  (passport) => passport.campaignKey === campaignKey,
) ?? null;

export const createTerritorialMission = (input: {
  territoryId: string;
  title: string;
  cells: MissionCellSeed[];
  passport: MissionPassport;
  database?: DBExecutor;
}): CivicMissionRow => {
  if (!input.database) return db.transaction((tx) => createTerritorialMission({ ...input, database: tx }));
  const database = input.database;
  if (input.cells.length === 0) throw new Error('mission_requires_planned_cells');
  const createdAt = now();
  const passport = input.passport;
  const mission: CivicMissionRow = {
    id: nuevoId(),
    territoryId: input.territoryId,
    campaignKey: passport.campaignKey,
    campaignVersion: passport.campaignVersion,
    title: input.title.trim().slice(0, 120),
    purpose: passport.purpose,
    decisionRecipient: passport.decisionRecipient,
    steward: passport.steward,
    verificationMethod: passport.verificationMethod,
    minIndependentVerifications: Math.max(1, passport.minIndependentVerifications),
    publicPrecision: passport.publicPrecision,
    retentionDays: Math.max(1, passport.retentionDays),
    closureCondition: passport.closureCondition,
    sensitivity: passport.sensitivity,
    status: 'active',
    plannedCells: input.cells.length,
    completedAt: null,
    createdAt,
    updatedAt: createdAt,
  };

  database.insert(civicMissions).values(mission).run();
  database.insert(civicMissionCells).values(input.cells.map((cell): CivicMissionCellRow => ({
      id: nuevoId(),
      missionId: mission.id,
      cellKey: cell.key,
      geometryJson: json({
        type: 'Polygon',
        coordinates: [[...cell.polygon, cell.polygon[0]!].map((point) => [point.lng, point.lat])],
      }),
      centerLat: cell.center.lat,
      centerLng: cell.center.lng,
      status: 'unknown',
      observationId: null,
      assignedToKey: null,
      routeKey: null,
      assignedAt: null,
      observedAt: null,
      updatedAt: createdAt,
    }))).run();
  return mission;
};

export const missionsAll = (): CivicMissionRow[] =>
  db.select().from(civicMissions).orderBy(desc(civicMissions.createdAt)).all();

export const missionById = (id: string, database: DBExecutor = db): CivicMissionRow | null =>
  database.select().from(civicMissions).where(eq(civicMissions.id, id)).get() ?? null;

export const cellsForMission = (missionId: string): CivicMissionCellRow[] =>
  db.select().from(civicMissionCells)
    .where(eq(civicMissionCells.missionId, missionId))
    .orderBy(asc(civicMissionCells.cellKey)).all();

/**
 * El pasaporte sólo puede corregirse antes de que empiece el trabajo de campo.
 * Cambiarlo después haría que la evidencia ya capturada respondiera a otro propósito.
 */
export const replaceMissionPassport = (
  missionId: string,
  passport: MissionPassport,
): CivicMissionRow | null => {
  const mission = missionById(missionId);
  if (!mission || !['planning', 'active'].includes(mission.status)) return null;
  const cells = cellsForMission(missionId);
  if (cells.some((cell) => cell.status !== 'unknown')) return null;
  const updatedAt = now();
  db.update(civicMissions).set({
    campaignKey: passport.campaignKey,
    campaignVersion: passport.campaignVersion,
    purpose: passport.purpose,
    decisionRecipient: passport.decisionRecipient,
    steward: passport.steward,
    verificationMethod: passport.verificationMethod,
    minIndependentVerifications: Math.max(1, passport.minIndependentVerifications),
    publicPrecision: passport.publicPrecision,
    retentionDays: Math.max(1, passport.retentionDays),
    closureCondition: passport.closureCondition,
    sensitivity: passport.sensitivity,
    updatedAt,
  }).where(eq(civicMissions.id, missionId)).run();
  return missionById(missionId);
};

export interface MissionCoverageSummary {
  planned: number;
  visited: number;
  unknown: number;
  assigned: number;
  visited_empty: number;
  observed: number;
  contested: number;
  corroborated: number;
  stale: number;
  coveragePct: number;
  corroboratedPct: number;
}

export const summarizeMissionCoverage = (
  cells: Pick<CivicMissionCellRow, 'status'>[],
): MissionCoverageSummary => {
  const count = (status: CoverageCellStatus): number => cells.filter((cell) => cell.status === status).length;
  const visitedEmpty = count('visited_empty');
  const observed = count('observed');
  const contested = count('contested');
  const corroborated = count('corroborated');
  const stale = count('stale');
  const visited = visitedEmpty + observed + contested + corroborated + stale;
  const planned = cells.length;
  return {
    planned,
    visited,
    unknown: count('unknown'),
    assigned: count('assigned'),
    visited_empty: visitedEmpty,
    observed,
    contested,
    corroborated,
    stale,
    coveragePct: planned === 0 ? 0 : Math.round((visited / planned) * 100),
    corroboratedPct: planned === 0 ? 0 : Math.round((corroborated / planned) * 100),
  };
};

/** Toma una ruta corta: cobertura antes que volumen. */
export const claimNextRoute = async (missionId: string, size = 3): Promise<CivicMissionCellRow[]> => {
  if (missionById(missionId)?.status !== 'active') return [];
  const actorKey = await getActorKey();
  const selected = cellsForMission(missionId)
    .filter((cell) => cell.status === 'unknown')
    .slice(0, Math.max(1, Math.min(5, size)));
  if (selected.length === 0) return [];
  const assignedAt = now();
  const routeKey = `route_${nuevoId()}`;
  db.update(civicMissionCells).set({
    status: 'assigned',
    assignedToKey: actorKey,
    routeKey,
    assignedAt,
    updatedAt: assignedAt,
  }).where(inArray(civicMissionCells.id, selected.map((cell) => cell.id))).run();
  return cellsForMission(missionId).filter((cell) => cell.routeKey === routeKey);
};

export const myAssignedCells = async (missionId: string): Promise<CivicMissionCellRow[]> => {
  const actorKey = await getActorKey();
  return db.select().from(civicMissionCells).where(and(
    eq(civicMissionCells.missionId, missionId),
    eq(civicMissionCells.assignedToKey, actorKey),
    eq(civicMissionCells.status, 'assigned'),
  )).orderBy(asc(civicMissionCells.cellKey)).all();
};

export const prepareMissionCellCapture = (cellId: string): void => {
  setSetting(ACTIVE_CELL_KEY, cellId);
};

/** Permite que un reintento recupere la celda ya acreditada por la captura. */
export const missionCellForObservation = (
  observationId: string,
  database: DBExecutor = db,
): CivicMissionCellRow | null => database.select().from(civicMissionCells)
  .where(eq(civicMissionCells.observationId, observationId)).get() ?? null;

export const completeActiveMissionCell = (
  observationId: string,
  location: GeoPoint | null,
  proof?: MissionLocationProof,
): MissionCellCompletion => {
  const cellId = getSetting(ACTIVE_CELL_KEY);
  if (!cellId) return { status: 'no_active_cell', cell: null };
  const cell = db.select().from(civicMissionCells).where(eq(civicMissionCells.id, cellId)).get();
  if (!cell || cell.status !== 'assigned') {
    setSetting(ACTIVE_CELL_KEY, '');
    return { status: 'no_active_cell', cell: null };
  }
  const mission = missionById(cell.missionId);
  if (!mission || mission.status !== 'active') return { status: 'mission_inactive', cell };
  const observation = db.select().from(civicObservations).where(eq(civicObservations.id, observationId)).get();
  if (!observation || observation.campaignKey !== mission.campaignKey) {
    return { status: 'campaign_mismatch', cell };
  }
  const locationStatus = validateMissionCellVisit(cell.geometryJson, location, proof);
  if (locationStatus !== 'valid') return { status: locationStatus, cell };
  const observedAt = now();
  const expiresAt = new Date(
    Date.parse(observedAt) + mission.retentionDays * 24 * 60 * 60 * 1_000,
  ).toISOString();
  db.transaction((tx) => {
    tx.update(civicMissionCells).set({
      status: 'observed',
      observationId,
      observedAt,
      updatedAt: observedAt,
    }).where(eq(civicMissionCells.id, cell.id)).run();
    tx.update(civicObservations).set({
      territoryId: mission.territoryId,
      expiresAt,
      updatedAt: observedAt,
    }).where(eq(civicObservations.id, observationId)).run();
    tx.update(civicNeeds).set({
      territoryId: mission.territoryId,
      expiresAt,
      updatedAt: observedAt,
    }).where(eq(civicNeeds.observationId, observationId)).run();
    tx.insert(settings).values({ key: ACTIVE_CELL_KEY, value: '' })
      .onConflictDoUpdate({ target: settings.key, set: { value: '' } }).run();
  });
  return {
    status: 'completed',
    cell: db.select().from(civicMissionCells).where(eq(civicMissionCells.id, cell.id)).get() ?? cell,
  };
};

/**
 * Acredita un recorrido donde no se registró un hallazgo. No crea una señal
 * negativa ni afirma ausencia: conserva sólo que la celda fue visitada por la
 * identidad que tomó la ruta, tras validar GPS actual y descartar el punto.
 */
export const completeAssignedMissionCellWithoutFinding = async (
  cellId: string,
  location: GeoPoint | null,
  proof?: MissionLocationProof,
): Promise<MissionCellCompletion> => {
  const cell = db.select().from(civicMissionCells).where(eq(civicMissionCells.id, cellId)).get() ?? null;
  if (!cell || cell.status !== 'assigned') return { status: 'no_active_cell', cell };
  const mission = missionById(cell.missionId);
  if (!mission || mission.status !== 'active') return { status: 'mission_inactive', cell };
  const actorKey = await getActorKey();
  if (!cell.assignedToKey || cell.assignedToKey !== actorKey) {
    return { status: 'not_assigned_to_actor', cell };
  }
  const locationStatus = validateMissionCellVisit(cell.geometryJson, location, proof);
  if (locationStatus !== 'valid') return { status: locationStatus, cell };

  const observedAt = now();
  const activeCellId = getSetting(ACTIVE_CELL_KEY);
  db.transaction((tx) => {
    tx.update(civicMissionCells).set({
      status: 'visited_empty',
      observationId: null,
      observedAt,
      updatedAt: observedAt,
    }).where(and(
      eq(civicMissionCells.id, cell.id),
      eq(civicMissionCells.status, 'assigned'),
      eq(civicMissionCells.assignedToKey, actorKey),
    )).run();
    if (activeCellId === cell.id) {
      tx.insert(settings).values({ key: ACTIVE_CELL_KEY, value: '' })
        .onConflictDoUpdate({ target: settings.key, set: { value: '' } }).run();
    }
  });
  const completed = db.select().from(civicMissionCells).where(eq(civicMissionCells.id, cell.id)).get() ?? cell;
  return completed.status === 'visited_empty'
    ? { status: 'completed', cell: completed }
    : { status: 'no_active_cell', cell: completed };
};

const statusForObservation = (
  observationId: string,
  status: CivicRecordStatus,
  minIndependentVerifications: number,
  database: DBExecutor = db,
): CoverageCellStatus => {
  if (status === 'withdrawn') return 'stale';
  if (status === 'stale') return 'stale';
  if (status === 'unsafe') return 'contested';
  const verdicts = database.select({ verdict: civicVerifications.verdict }).from(civicVerifications)
    .where(eq(civicVerifications.observationId, observationId)).all();
  if (verdicts.some(({ verdict }) => ['correct', 'duplicate', 'unsafe'].includes(verdict))) return 'contested';
  const confirmations = verdicts.filter(({ verdict }) => verdict === 'confirm').length;
  if (confirmations >= Math.max(1, minIndependentVerifications)) return 'corroborated';
  return 'observed';
};

export const syncMissionCellForObservation = (
  observationId: string,
  status: CivicRecordStatus,
  database: DBExecutor = db,
): CivicMissionCellRow | null => {
  const cell = missionCellForObservation(observationId, database);
  if (!cell) return null;
  const mission = missionById(cell.missionId, database);
  if (!mission) return cell;
  const nextStatus = statusForObservation(
    observationId,
    status,
    mission.minIndependentVerifications,
    database,
  );
  const updatedAt = now();
  database.update(civicMissionCells).set({ status: nextStatus, updatedAt })
    .where(eq(civicMissionCells.id, cell.id)).run();
  return database.select().from(civicMissionCells).where(eq(civicMissionCells.id, cell.id)).get() ?? null;
};

export const transitionMission = (
  id: string,
  status: CivicMissionStatus,
): CivicMissionRow | null => {
  const updatedAt = now();
  db.update(civicMissions).set({
    status,
    updatedAt,
    completedAt: status === 'completed' ? updatedAt : null,
  }).where(eq(civicMissions.id, id)).run();
  return missionById(id);
};
