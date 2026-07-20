import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  civicDisclosureReceipts,
  civicListenings,
  civicMatches,
  civicNeedAccessGrants,
  civicNeedCustodies,
  civicNeeds,
  civicRecordContexts,
  syncOutbox,
} from '@/db/schema';
import type { CivicListeningRow, CivicNeedCustodyRow, CivicNeedRow } from '@/db/schema';
import { ahoraISO, nuevoId } from '@/db/repos';

import { getActorKey } from './identity';
import { listeningNeedDraftFields } from './listening-need';
import {
  listeningThemeLabel,
  publicListeningFacet,
} from './listening-privacy';
import { createNeed, createObservation, needById, recordConsent } from './repo';
import { saveRecordContext } from './record-context';
import type {
  CivicRecordContextInput,
  GeoPoint,
  ListeningHorizon,
  ListeningKind,
  ListeningScope,
  ListeningSource,
  ListeningTheme,
  NeedContactRoute,
  NeedCustodianKind,
  NeedDecisionRecipient,
} from './types';

export {
  listeningHorizonLabel,
  listeningKindLabel,
  listeningPublicPreview,
  listeningScopeLabel,
  listeningThemeLabel,
  publicListeningFacet,
} from './listening-privacy';
export { listeningNeedDraftFields } from './listening-need';

export const LISTENING_KINDS: readonly {
  key: ListeningKind;
  label: string;
  action: string;
  prompt: string;
  icon: string;
  color: string;
}[] = [
  { key: 'need', label: 'Necesito', action: 'Pedir cuidado', prompt: '¿Qué hace falta para vivir mejor?', icon: 'hand-left-outline', color: '#FB7185' },
  { key: 'dream', label: 'Sueño', action: 'Abrir horizonte', prompt: '¿Qué futuro querés volver posible?', icon: 'sparkles-outline', color: '#C4B5FD' },
  { key: 'proposal', label: 'Propongo', action: 'Mover una idea', prompt: '¿Qué cambio concreto imaginás?', icon: 'bulb-outline', color: '#FCD34D' },
  { key: 'capacity', label: 'Puedo aportar', action: 'Ofrecer capacidad', prompt: '¿Qué sabés, tenés o podés poner en movimiento?', icon: 'infinite-outline', color: '#6EE7B7' },
];

export const LISTENING_SOURCES: readonly { key: ListeningSource; label: string }[] = [
  { key: 'lived', label: 'Lo vivo' },
  { key: 'seen', label: 'Lo vi' },
  { key: 'heard', label: 'Me lo contaron' },
  { key: 'dreamed', label: 'Lo imaginamos' },
];

export const LISTENING_THEMES: readonly { key: ListeningTheme; label: string; icon: string }[] = [
  { key: 'food', label: 'Alimentación', icon: 'nutrition-outline' },
  { key: 'housing', label: 'Vivienda', icon: 'home-outline' },
  { key: 'work', label: 'Trabajo', icon: 'hammer-outline' },
  { key: 'care', label: 'Cuidados', icon: 'heart-outline' },
  { key: 'health', label: 'Salud', icon: 'medkit-outline' },
  { key: 'education', label: 'Educación', icon: 'book-outline' },
  { key: 'environment', label: 'Ambiente', icon: 'leaf-outline' },
  { key: 'mobility', label: 'Movilidad', icon: 'bus-outline' },
  { key: 'safety', label: 'Convivencia', icon: 'shield-outline' },
  { key: 'culture', label: 'Cultura y comunidad', icon: 'people-outline' },
  { key: 'democracy', label: 'Participación', icon: 'megaphone-outline' },
];

export const LISTENING_HORIZONS: readonly { key: ListeningHorizon; label: string }[] = [
  { key: 'now', label: 'Ahora' },
  { key: 'year', label: 'Este año' },
  { key: 'generation', label: 'Una generación' },
];

export const LISTENING_SCOPES: readonly { key: ListeningScope; label: string }[] = [
  { key: 'personal', label: 'Mi vida' },
  { key: 'block', label: 'Mi cuadra' },
  { key: 'neighborhood', label: 'Mi barrio' },
  { key: 'city', label: 'Mi ciudad' },
  { key: 'country', label: 'El país' },
];

export interface CreateListeningInput {
  kind: ListeningKind;
  source: ListeningSource;
  theme: ListeningTheme;
  statement: string;
  desiredOutcome?: string | null;
  existingStrength?: string | null;
  firstStep?: string | null;
  horizon: ListeningHorizon;
  scope: ListeningScope;
  importance: number;
  supportWanted: boolean;
}

const cleanOptional = (value?: string | null): string | null => value?.trim() || null;

export const createListening = (input: CreateListeningInput): CivicListeningRow => {
  const now = ahoraISO();
  const row: CivicListeningRow = {
    id: nuevoId(),
    kind: input.kind,
    source: input.source,
    theme: input.theme,
    statement: input.statement.trim().slice(0, 800),
    desiredOutcome: cleanOptional(input.desiredOutcome)?.slice(0, 600) ?? null,
    existingStrength: cleanOptional(input.existingStrength)?.slice(0, 600) ?? null,
    firstStep: cleanOptional(input.firstStep)?.slice(0, 400) ?? null,
    horizon: input.horizon,
    scope: input.scope,
    importance: Math.max(1, Math.min(5, Math.round(input.importance))),
    supportWanted: input.supportWanted,
    status: 'private',
    observationId: null,
    needId: null,
    resourceId: null,
    createdAt: now,
    updatedAt: now,
  };
  db.insert(civicListenings).values(row).run();
  return row;
};

export const listeningsAll = (): CivicListeningRow[] =>
  db.select().from(civicListenings).orderBy(desc(civicListenings.createdAt)).all();

export const listeningById = (id: string): CivicListeningRow | null =>
  db.select().from(civicListenings).where(eq(civicListenings.id, id)).get() ?? null;

export const listeningByNeedId = (needId: string): CivicListeningRow | null =>
  db.select().from(civicListenings).where(eq(civicListenings.needId, needId)).get() ?? null;

export const needCustodyByNeedId = (needId: string): CivicNeedCustodyRow | null =>
  db.select().from(civicNeedCustodies).where(eq(civicNeedCustodies.needId, needId)).get() ?? null;

/**
 * Borra una escucha que nunca produjo una derivación colectiva u operativa.
 * La comprobación ocurre dentro de la misma transacción para que un cambio de
 * estado concurrente no convierta un borrado local en una pérdida sin rastro.
 */
export const deletePrivateListening = (id: string): boolean => db.transaction((tx) => {
  const listening = tx.select().from(civicListenings)
    .where(eq(civicListenings.id, id)).get() ?? null;
  if (
    !listening
    || listening.status !== 'private'
    || listening.observationId != null
    || listening.needId != null
    || listening.resourceId != null
  ) return false;

  tx.delete(civicRecordContexts).where(and(
    eq(civicRecordContexts.entityType, 'listening'),
    eq(civicRecordContexts.entityId, id),
  )).run();
  tx.delete(civicListenings).where(eq(civicListenings.id, id)).run();
  return true;
});

export interface ShareListeningOptions {
  approximateLocation?: GeoPoint | null;
  context?: CivicRecordContextInput;
}

/**
 * Deriva un pulso público sin texto libre. `supportWanted` queda como faceta,
 * pero no crea una necesidad/recurso operativo: el feed todavía debe ser
 * segmentado por territorio/círculo antes de distribuir pedidos sensibles.
 */
export const shareListening = async (
  id: string,
  options: ShareListeningOptions = {},
): Promise<CivicListeningRow | null> => {
  const row = listeningById(id);
  if (!row) return null;
  if (row.status !== 'private') return row;

  const creatorKey = await getActorKey();
  const location = options.context?.point ?? options.approximateLocation ?? null;
  const precision = options.context?.sharedPrecision ?? 'neighborhood';
  const themeLabel = listeningThemeLabel(row.theme);
  db.transaction((tx) => {
    recordConsent({
      scope: 'publish',
      purpose: 'Sumar facetas categóricas de esta escucha a una radiografía colectiva; el relato privado no se comparte.',
      granted: true,
      version: 2,
      idempotencyKey: `listening:${row.id}:consent:publish:v2`,
      database: tx,
    });
    recordConsent({
      scope: 'location',
      purpose: `Asociar esta escucha al lugar confirmado con proyección pública ${precision}; el punto exacto queda local.`,
      granted: location != null,
      version: 3,
      idempotencyKey: `listening:${row.id}:consent:location:v3`,
      database: tx,
    });

    saveRecordContext('listening', row.id, {
      ...(options.context ?? { point: location }),
      point: location,
      locationRole: options.context?.locationRole ?? 'subject',
      audience: 'collective',
      locationConsent: location != null,
      attributionConsent: options.context?.attributionMode !== 'anonymous',
    }, tx);

    const observation = createObservation({
      campaignKey: 'escucha-v1',
      creatorKey,
      category: row.theme,
      title: `Pulso colectivo · ${themeLabel}`,
      summary: null,
      data: publicListeningFacet(row),
      evidence: [],
      exactLocation: location,
      publicPrecision: precision,
      locationLabel: options.context?.locationLabel ?? null,
      context: {
        ...(options.context ?? { point: location }),
        point: location,
        locationRole: options.context?.locationRole ?? 'subject',
        audience: 'collective',
        locationConsent: location != null,
        attributionConsent: options.context?.attributionMode !== 'anonymous',
      },
      publish: true,
      database: tx,
    });

    const updatedAt = ahoraISO();
    tx.update(civicListenings).set({
      status: 'shared',
      observationId: observation.id,
      needId: null,
      resourceId: null,
      updatedAt,
    }).where(eq(civicListenings.id, id)).run();
  });
  return listeningById(id);
};

const cleanLabel = (value?: string | null): string | null => value?.trim().slice(0, 120) || null;

export interface CreateCustodiedNeedDraftInput {
  listeningId: string;
  custodianKind: NeedCustodianKind;
  custodianLabel?: string | null;
  decisionRecipient: NeedDecisionRecipient;
  decisionRecipientLabel?: string | null;
  contactRoute: NeedContactRoute;
  quantity?: number | null;
  unit?: string | null;
  urgency?: number;
  expiresInDays?: number;
  context: CivicRecordContextInput;
}

export interface CustodiedNeedDraftResult {
  listening: CivicListeningRow;
  need: CivicNeedRow;
  custody: CivicNeedCustodyRow;
  alreadyExisted: boolean;
}

/**
 * Convierte una intención de apoyo en un pedido operativo local bajo custodia.
 * Es deliberadamente privado: mientras no exista una ACL de círculo/custodio
 * comprobable, no entra al outbox ni al feed colectivo.
 */
export const createCustodiedNeedDraft = (
  input: CreateCustodiedNeedDraftInput,
): CustodiedNeedDraftResult => {
  const listening = listeningById(input.listeningId);
  if (!listening || listening.kind !== 'need' || !listening.supportWanted) {
    throw new Error('listening_not_eligible_for_custodied_need');
  }
  if (listening.needId) {
    const existingNeed = needById(listening.needId);
    const existingCustody = db.select().from(civicNeedCustodies)
      .where(eq(civicNeedCustodies.needId, listening.needId)).get() ?? null;
    if (existingNeed && existingCustody) {
      return { listening, need: existingNeed, custody: existingCustody, alreadyExisted: true };
    }
  }

  const custodianLabel = cleanLabel(input.custodianLabel);
  if (input.custodianKind !== 'self' && !custodianLabel) {
    throw new Error('custodian_label_required');
  }
  const now = ahoraISO();
  const expiresInDays = Math.max(1, Math.min(90, Math.round(input.expiresInDays ?? 30)));
  const expiresAt = new Date(new Date(now).getTime() + expiresInDays * 86_400_000).toISOString();
  const fields = listeningNeedDraftFields(listening, input);

  return db.transaction((tx) => {
    const need = createNeed({
      ...fields,
      status: 'draft',
      contactConsent: false,
      expiresAt,
      publish: false,
      context: {
        ...input.context,
        audience: 'private',
        locationRole: 'meeting_point',
        locationConsent: false,
        attributionConsent: false,
        sensitivity: 'high',
        confirmedAt: now,
      },
      database: tx,
    });
    const custody: CivicNeedCustodyRow = {
      needId: need.id,
      listeningId: listening.id,
      custodianKind: input.custodianKind,
      custodianLabel: input.custodianKind === 'self' ? null : custodianLabel,
      decisionRecipient: input.decisionRecipient,
      decisionRecipientLabel: cleanLabel(input.decisionRecipientLabel),
      contactRoute: input.contactRoute,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    tx.insert(civicNeedCustodies).values(custody).run();
    tx.update(civicListenings).set({
      status: 'connected',
      needId: need.id,
      updatedAt: now,
    }).where(eq(civicListenings.id, listening.id)).run();
    return {
      listening: { ...listening, status: 'connected', needId: need.id, updatedAt: now },
      need,
      custody,
      alreadyExisted: false,
    };
  });
};

/**
 * Borra únicamente un pedido que nunca salió del dispositivo. Si existe
 * recibo, outbox o conexión, falla cerrado y debe usarse el retiro auditable.
 */
export const deleteCustodiedNeedDraft = (needId: string): boolean => db.transaction((tx) => {
  const need = tx.select().from(civicNeeds).where(eq(civicNeeds.id, needId)).get() ?? null;
  const custody = tx.select().from(civicNeedCustodies).where(eq(civicNeedCustodies.needId, needId)).get() ?? null;
  const context = tx.select().from(civicRecordContexts).where(and(
    eq(civicRecordContexts.entityType, 'need'),
    eq(civicRecordContexts.entityId, needId),
  )).get() ?? null;
  if (!need?.ownedByMe || need.status !== 'draft' || !custody || context?.audience !== 'private') return false;
  const disclosed = tx.select().from(civicDisclosureReceipts).where(and(
    eq(civicDisclosureReceipts.entityType, 'need'),
    eq(civicDisclosureReceipts.entityId, needId),
  )).get();
  const queued = tx.select().from(syncOutbox).where(and(
    eq(syncOutbox.entityType, 'need'),
    eq(syncOutbox.entityId, needId),
  )).get();
  const connected = tx.select().from(civicMatches).where(eq(civicMatches.needId, needId)).get();
  const accessGrant = tx.select().from(civicNeedAccessGrants)
    .where(eq(civicNeedAccessGrants.needId, needId)).get();
  // Un grant, incluso revocado, es historia de autorización y no se borra.
  if (disclosed || queued || connected || accessGrant) return false;

  const listening = tx.select().from(civicListenings)
    .where(eq(civicListenings.id, custody.listeningId)).get() ?? null;
  tx.delete(civicRecordContexts).where(and(
    eq(civicRecordContexts.entityType, 'need'),
    eq(civicRecordContexts.entityId, needId),
  )).run();
  tx.delete(civicNeedCustodies).where(eq(civicNeedCustodies.needId, needId)).run();
  tx.delete(civicNeeds).where(eq(civicNeeds.id, needId)).run();
  if (listening?.needId === needId) {
    tx.update(civicListenings).set({
      needId: null,
      status: listening.observationId ? 'shared' : 'private',
      updatedAt: ahoraISO(),
    }).where(eq(civicListenings.id, listening.id)).run();
  }
  return true;
});
