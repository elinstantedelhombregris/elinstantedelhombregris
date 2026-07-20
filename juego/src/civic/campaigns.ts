import type { TipoSenal } from '@/content';

import { getActorKey } from './identity';
import {
  completeActiveMissionCell,
  missionCellForObservation,
  type MissionCellCompletion,
} from './missions';
import {
  createNeed,
  createObservation,
  needByObservationId,
  observationByStarId,
  publishObservation,
  updateNeedContext,
  updateObservationContext,
} from './repo';
import type { CivicCampaignKey, CivicRecordContextInput, GeoPoint, LocationPrecision } from './types';

export interface CivicCampaignDefinition {
  key: CivicCampaignKey;
  expeditionSlug: string;
  signal: TipoSenal;
  eyebrow: string;
  title: string;
  promise: string;
  proof: string;
  publicPrecision: LocationPrecision;
  color: string;
  icon: string;
}

export const CIVIC_CAMPAIGNS: CivicCampaignDefinition[] = [
  {
    key: 'luminarias-v1',
    expeditionSlug: 'luminarias',
    signal: 'need',
    eyebrow: 'Misión de infraestructura',
    title: 'Volver a encender la noche',
    promise: 'Detectá luces apagadas, confirmalas con otras miradas y armá un reclamo territorial verificable.',
    proof: 'Una luminaria cuenta cuando tiene lugar, estado y corroboración; no por cantidad de toques.',
    publicPrecision: '100m',
    color: '#A78BFA',
    icon: 'flashlight-outline',
  },
  {
    key: 'ollas-v1',
    expeditionSlug: 'comedores',
    signal: 'recurso',
    eyebrow: 'Misión de cuidado',
    title: 'Sostener las ollas del barrio',
    promise: 'Registrá capacidades y faltantes sin exponer personas. Después conectamos cada necesidad con un aporte real.',
    proof: 'El logro no es publicar: es entregar, recibir y confirmar que la necesidad quedó resuelta.',
    publicPrecision: 'neighborhood',
    color: '#F59E0B',
    icon: 'restaurant-outline',
  },
];

export const campaignForExpedition = (slug: string): CivicCampaignDefinition | null =>
  CIVIC_CAMPAIGNS.find((campaign) => campaign.expeditionSlug === slug) ?? null;

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
};

const ollaCategory = (value: unknown): string => {
  const label = asString(value)?.toLocaleLowerCase('es-AR') ?? '';
  if (label.includes('gas')) return 'gas-cocina';
  if (label.includes('verdura')) return 'alimentos-frescos';
  if (label.includes('higiene')) return 'higiene';
  if (label.includes('utensilio')) return 'equipamiento-cocina';
  return 'alimentos-secos';
};

/**
 * Puente entre el rito existente y el núcleo cívico. Conserva los detalles
 * sensibles en la estrella local y publica sólo lo necesario para coordinar.
 */
export const recordCampaignCapture = async (input: {
  expeditionSlug: string;
  starId: string;
  data: Record<string, unknown>;
  summary: string | null;
  coords: GeoPoint | null;
  context?: CivicRecordContextInput;
  publish: boolean;
}): Promise<MissionCellCompletion | null> => {
  const campaign = campaignForExpedition(input.expeditionSlug);
  if (!campaign) return null;
  const photoUri = asString(input.data.foto);
  const evidence = photoUri
    ? [{ kind: 'photo', uri: photoUri, capturedAt: new Date().toISOString() }]
    : [];
  const existingObservation = observationByStarId(input.starId);
  if (existingObservation && existingObservation.campaignKey !== campaign.key) {
    throw new Error('capture_attempt_campaign_mismatch');
  }
  const creatorKey = existingObservation?.creatorKey ?? await getActorKey();

  if (campaign.key === 'luminarias-v1') {
    const urgency = Math.min(5, Math.max(1, asNumber(input.data.urgencia) ?? 3));
    const condition = asString(input.data.estado) ?? 'apagada';
    const recordContext: CivicRecordContextInput = {
      ...(input.context ?? { point: input.coords }),
      point: input.coords,
      locationRole: 'subject',
      audience: input.publish ? 'collective' : 'private',
      sensitivity: 'low',
    };
    const observation = existingObservation ?? createObservation({
      campaignKey: campaign.key,
      starId: input.starId,
      creatorKey,
      category: 'alumbrado-publico',
      title: 'Luminaria que necesita atención',
      summary: `Estado: ${condition}. Urgencia ${urgency}/5.`,
      data: { condition, urgency },
      evidence,
      exactLocation: input.coords,
      publicPrecision: input.context?.sharedPrecision ?? campaign.publicPrecision,
      locationLabel: input.context?.locationLabel ?? null,
      context: recordContext,
      publish: false,
    });
    updateObservationContext(observation.id, recordContext);
    const need = needByObservationId(observation.id) ?? createNeed({
      observationId: observation.id,
      category: 'alumbrado-publico',
      title: 'Reparar una luminaria',
      description: `Revisión por estado “${condition}”.`,
      quantity: 1,
      unit: 'luminaria',
      urgency,
      publicLocation: input.coords,
      publicPrecision: input.context?.sharedPrecision ?? campaign.publicPrecision,
      locationLabel: input.context?.locationLabel ?? null,
      context: recordContext,
      publish: false,
    });
    updateNeedContext(need.id, recordContext);
    const completedCell = missionCellForObservation(observation.id);
    const completion: MissionCellCompletion = completedCell
      ? { status: 'completed', cell: completedCell }
      : completeActiveMissionCell(observation.id, input.coords, {
          source: input.context?.locationSource ?? 'none',
          horizontalAccuracyM: input.context?.horizontalAccuracyM,
        });
    if (input.publish) publishObservation(observation.id);
    return completion;
  }

  const people = asNumber(input.data.personas);
  const needLabel = asString(input.data.necesidad) ?? 'Alimentos secos';
  const recordContext: CivicRecordContextInput = {
    ...(input.context ?? { point: input.coords }),
    point: input.coords,
    locationRole: 'subject',
    audience: input.publish ? 'collective' : 'private',
    sensitivity: 'moderate',
  };
  const observation = existingObservation ?? createObservation({
    campaignKey: campaign.key,
    starId: input.starId,
    creatorKey,
    category: 'red-comunitaria-alimentaria',
    title: 'Olla comunitaria registrada',
    summary: people ? `Sostiene aproximadamente ${people} porciones por jornada.` : 'Capacidad por confirmar.',
    data: { approximateMeals: people, currentPriority: needLabel, organizationNameKeptPrivate: true },
    evidence,
    exactLocation: input.coords,
    publicPrecision: input.context?.sharedPrecision ?? campaign.publicPrecision,
    locationLabel: input.context?.locationLabel ?? null,
    context: recordContext,
    publish: false,
  });
  updateObservationContext(observation.id, recordContext);
  const need = needByObservationId(observation.id) ?? createNeed({
    observationId: observation.id,
    category: ollaCategory(needLabel),
    title: needLabel,
    description: 'Prioridad declarada por una olla comunitaria. Coordinación pendiente.',
    urgency: 4,
    publicLocation: input.coords,
    publicPrecision: input.context?.sharedPrecision ?? campaign.publicPrecision,
    locationLabel: input.context?.locationLabel ?? null,
    context: recordContext,
    publish: false,
  });
  updateNeedContext(need.id, recordContext);
  const completedCell = missionCellForObservation(observation.id);
  const completion: MissionCellCompletion = completedCell
    ? { status: 'completed', cell: completedCell }
    : completeActiveMissionCell(observation.id, input.coords, {
        source: input.context?.locationSource ?? 'none',
        horizontalAccuracyM: input.context?.horizontalAccuracyM,
      });
  if (input.publish) publishObservation(observation.id);
  return completion;
};
