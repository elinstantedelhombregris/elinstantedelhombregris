import type {
  CivicCampaignKey,
  CivicMissionStatus,
  CivicRecordStatus,
  LocationPrecision,
  NeedStatus,
  ResourceStatus,
} from './types';

export type MapPointKind = 'observation' | 'need' | 'resource';

export interface MapPointRecordRef {
  kind: MapPointKind;
  entityId: string;
}

export type MapPointAction =
  | {
      kind: 'verify';
      label: string;
      href: { pathname: '/verificar'; params: { focus: string } };
    }
  | {
      kind: 'connect';
      label: string;
      href: '/conectar';
    }
  | {
      kind: 'offer';
      label: string;
      href: '/aportar';
    }
  | {
      kind: 'mission';
      label: string;
      href: { pathname: '/territorio/misiones/[id]'; params: { id: string } };
    }
  | {
      kind: 'missions';
      label: string;
      href: '/territorio/misiones';
    };

export interface MapPointSelectionInput {
  pointId: string;
  kind: MapPointKind;
  category: string;
  status: CivicRecordStatus | NeedStatus | ResourceStatus;
  precision: LocationPrecision;
  territoryId: string | null;
  campaignKey?: CivicCampaignKey | null;
  /** Una señal propia o una identidad todavía desconocida no se puede auto-verificar. */
  canVerify?: boolean;
}

export interface MapPointMissionContext {
  id: string;
  territoryId: string;
  campaignKey: CivicCampaignKey;
  status: CivicMissionStatus;
}

/**
 * Proyección deliberadamente pequeña para la ficha del mapa.
 * No contiene relato, título, contacto, autoría, etiqueta de lugar ni coordenadas.
 */
export interface SafeMapPointCard {
  pointId: string;
  kind: MapPointKind;
  kindLabel: string;
  category: string;
  statusLabel: string;
  precision: LocationPrecision;
  actions: MapPointAction[];
}

const OBSERVATION_STATUSES = new Set<CivicRecordStatus>([
  'queued',
  'synced',
  'needs_review',
  'corroborated',
]);

const NEED_STATUSES = new Set<NeedStatus>([
  'submitted',
  'needs_review',
  'corroborated',
  'matched',
  'in_progress',
  'reopened',
]);

const RESOURCE_STATUSES = new Set<ResourceStatus>(['available']);

const KIND_LABEL: Record<MapPointKind, string> = {
  observation: 'Señal',
  need: 'Necesidad',
  resource: 'Recurso',
};

const STATUS_LABEL: Record<string, string> = {
  queued: 'En espera de sincronización',
  synced: 'Recibida · pide otra mirada',
  needs_review: 'Revisión necesaria',
  corroborated: 'Corroborada',
  submitted: 'Abierta',
  matched: 'Coincidencia posible',
  in_progress: 'Apoyo en marcha',
  reopened: 'Reabierta',
  available: 'Disponible',
};

export const mapPointRecordRef = (pointId: string): MapPointRecordRef => {
  if (pointId.startsWith('need:')) {
    return { kind: 'need', entityId: pointId.slice('need:'.length) };
  }
  if (pointId.startsWith('resource:')) {
    return { kind: 'resource', entityId: pointId.slice('resource:'.length) };
  }
  return { kind: 'observation', entityId: pointId };
};

/** Sólo estados operativos y ya compartidos pueden aparecer como puntos accionables. */
export const isOperationalMapPoint = (
  kind: MapPointKind,
  status: CivicRecordStatus | NeedStatus | ResourceStatus,
): boolean => {
  if (kind === 'observation') return OBSERVATION_STATUSES.has(status as CivicRecordStatus);
  if (kind === 'need') return NEED_STATUSES.has(status as NeedStatus);
  return RESOURCE_STATUSES.has(status as ResourceStatus);
};

const missionForPoint = (
  point: MapPointSelectionInput,
  missions: readonly MapPointMissionContext[],
): MapPointMissionContext | null => {
  if (!point.territoryId) return null;
  const statusPriority: Record<CivicMissionStatus, number> = {
    active: 0,
    planning: 1,
    paused: 2,
    completed: 3,
    archived: 4,
  };
  return [...missions]
    .filter((mission) =>
      mission.territoryId === point.territoryId
      && ['active', 'planning', 'paused'].includes(mission.status)
      && (point.kind !== 'observation' || !point.campaignKey || mission.campaignKey === point.campaignKey))
    .sort((a, b) => statusPriority[a.status] - statusPriority[b.status])[0] ?? null;
};

const missionAction = (mission: MapPointMissionContext): MapPointAction => ({
  kind: 'mission',
  label: 'Abrir misión vinculada',
  href: { pathname: '/territorio/misiones/[id]', params: { id: mission.id } },
});

export const buildSafeMapPointCard = (
  point: MapPointSelectionInput,
  missions: readonly MapPointMissionContext[] = [],
): SafeMapPointCard | null => {
  if (!isOperationalMapPoint(point.kind, point.status)) return null;

  const ref = mapPointRecordRef(point.pointId);
  if (ref.kind !== point.kind || !ref.entityId) return null;
  const linkedMission = missionForPoint(point, missions);
  const actions: MapPointAction[] = [];

  if (point.kind === 'observation') {
    const needsVerification = ['queued', 'synced', 'needs_review'].includes(point.status);
    if (needsVerification && point.canVerify) {
      actions.push({
        kind: 'verify',
        label: 'Aportar otra mirada',
        href: { pathname: '/verificar', params: { focus: ref.entityId } },
      });
    }
    if (linkedMission) actions.push(missionAction(linkedMission));
    else actions.push({ kind: 'missions', label: 'Ver misiones', href: '/territorio/misiones' });
  } else if (point.kind === 'need') {
    actions.push({ kind: 'connect', label: 'Conectar apoyo', href: '/conectar' });
    if (linkedMission) actions.push(missionAction(linkedMission));
    else actions.push({ kind: 'offer', label: 'Ofrecer un recurso', href: '/aportar' });
  } else {
    actions.push({ kind: 'connect', label: 'Buscar una necesidad', href: '/conectar' });
    if (linkedMission) actions.push(missionAction(linkedMission));
  }

  return {
    pointId: point.pointId,
    kind: point.kind,
    kindLabel: KIND_LABEL[point.kind],
    category: point.category,
    statusLabel: STATUS_LABEL[point.status] ?? 'Estado operativo',
    precision: point.precision,
    actions: actions.slice(0, 2),
  };
};

/** Mantiene el orden salvo por el registro que la navegación pidió abrir primero. */
export const selectedMapPointFirst = <T extends { id: string }>(
  rows: readonly T[],
  selectedId: string | null | undefined,
): T[] => {
  if (!selectedId) return [...rows];
  return [...rows].sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId));
};
