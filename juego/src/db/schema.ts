/**
 * Schema Drizzle — SQLite local (spec §5). Única fuente de verdad de la DB.
 * Lo personal y sensible vive en el dispositivo. El núcleo cívico agrega una
 * cola durable y opt-in para sincronizar sólo representaciones públicas.
 *
 * Import relativo (no alias @/) para que drizzle-kit generate pueda cargar
 * el schema sin resolver paths de Metro.
 */

import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import type {
  CivicActionStatus,
  AttributionMode,
  CivicAudience,
  CivicCampaignKey,
  CivicContextEntity,
  CivicDisclosureEntity,
  CivicDisclosureReceiptKind,
  CivicMissionStatus,
  CivicRecordStatus,
  CivicSensitivity,
  ConsentScope,
  CoverageCellStatus,
  LocationPrecision,
  LocationRole,
  LocationSource,
  ListeningHorizon,
  ListeningKind,
  ListeningScope,
  ListeningSource,
  ListeningStatus,
  ListeningTheme,
  MatchStatus,
  MissionSensitivity,
  NeedContactRoute,
  NeedCustodianKind,
  NeedCustodyStatus,
  NeedDecisionRecipient,
  NeedCoordinationDecision,
  NeedCoordinationState,
  NeedCoordinationUnit,
  CustodyExecutionEventType,
  NeedGrantPurpose,
  NeedGrantDeliveryStatus,
  NeedGrantResponseDisposition,
  NeedGrantRecipientKind,
  NeedGrantRevocationReason,
  NeedGrantScope,
  NeedGrantStatus,
  NeedStatus,
  ResourceStatus,
  SyncEntity,
  SyncOperation,
  SyncStatus,
  VerificationVerdict,
} from '../civic/types';
import type {
  EstadoCompromiso,
  EstadoExpedicion,
  OrigenExpedicion,
  TipoEstrella,
  TipoUnlock,
} from '../game/types';

/** Estrellas del Cielo — cada captura real (spec §3.1). */
export const stars = sqliteTable('stars', {
  id: text('id').primaryKey(), // uuid
  tipo: text('tipo').$type<TipoEstrella>().notNull(),
  texto: text('texto'),
  photoUri: text('photo_uri'),
  lat: real('lat'),
  lng: real('lng'),
  fundadora: integer('fundadora', { mode: 'boolean' }).notNull().default(false),
  nocturna: integer('nocturna', { mode: 'boolean' }).notNull().default(false),
  fugaz: integer('fugaz', { mode: 'boolean' }).notNull().default(false),
  expeditionId: text('expedition_id'),
  expeditionStepKey: text('expedition_step_key'),
  /** Se asigna al completar una constelación (pegajoso, no se roba). */
  constelacionId: text('constelacion_id'),
  createdAt: text('created_at').notNull(), // ISO 8601
});

/** Bitácora privada — reflexiones de la luz VER. */
export const reflections = sqliteTable('reflections', {
  id: text('id').primaryKey(),
  preguntaId: text('pregunta_id').notNull(),
  texto: text('texto').notNull(),
  fecha: text('fecha').notNull(), // YYYY-MM-DD local
});

/** Micro-compromisos de la luz DAR — la confianza es la mecánica. */
export const commitments = sqliteTable('commitments', {
  id: text('id').primaryKey(),
  texto: text('texto').notNull(),
  categoria: text('categoria').notNull(),
  fecha: text('fecha').notNull(), // YYYY-MM-DD local
  estado: text('estado').$type<EstadoCompromiso>().notNull().default('pendiente'),
});

/** Un registro por día: qué luces se encendieron (spec §2). */
export const days = sqliteTable('days', {
  fecha: text('fecha').primaryKey(), // YYYY-MM-DD local
  ver: integer('ver', { mode: 'boolean' }).notNull().default(false),
  encender: integer('encender', { mode: 'boolean' }).notNull().default(false),
  dar: integer('dar', { mode: 'boolean' }).notNull().default(false),
  nocheCompleta: integer('noche_completa', { mode: 'boolean' })
    .notNull()
    .default(false),
});

/** Expediciones — quests multi-paso (spec §3.2). */
export const expeditions = sqliteTable('expeditions', {
  id: text('id').primaryKey(),
  plantillaId: text('plantilla_id').notNull(),
  titulo: text('titulo').notNull(),
  zona: text('zona').notNull(),
  meta: integer('meta').notNull(),
  estado: text('estado').$type<EstadoExpedicion>().notNull().default('activa'),
  origen: text('origen').$type<OrigenExpedicion>().notNull(),
  /** JSON array de hitos ya pagados, ej. "[25,50]". */
  hitosOtorgados: text('hitos_otorgados').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
});

/** Entradas de expedición: un paso jugado. */
export const expeditionEntries = sqliteTable('expedition_entries', {
  id: text('id').primaryKey(),
  expeditionId: text('expedition_id').notNull(),
  stepKey: text('step_key').notNull(),
  /** JSON con los datos de la micro-UI del paso. */
  data: text('data').notNull().default('{}'),
  starId: text('star_id'),
  createdAt: text('created_at').notNull(),
});

/** Ledger de brasas — append-only, jamás se edita ni borra (spec §3.3). */
export const emberLedger = sqliteTable('ember_ledger', {
  id: text('id').primaryKey(),
  delta: integer('delta').notNull(),
  motivo: text('motivo').notNull(),
  fecha: text('fecha').notNull(), // ISO 8601
});

/** Desbloqueos: cartas de lore, paletas, rangos alcanzados. */
export const unlocks = sqliteTable('unlocks', {
  id: text('id').primaryKey(),
  tipo: text('tipo').$type<TipoUnlock>().notNull(),
  clave: text('clave').notNull(),
  fecha: text('fecha').notNull(),
});

/** Nonces de chispa ya canjeados — anti-replay local (spec §3.5). */
export const redeemedNonces = sqliteTable('redeemed_nonces', {
  nonce: text('nonce').primaryKey(),
  fecha: text('fecha').notNull(),
});

/** Ajustes clave-valor (ritoFecha, paleta activa, flags de FTUE…). */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// ---------------------------------------------------------------------------
// Núcleo cívico offline-first — v1
// ---------------------------------------------------------------------------

/** Área guardada por la persona: barrio, polígono de lazo o zona de campaña. */
export const civicTerritories = sqliteTable('civic_territories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  /** GeoJSON Polygon o null para una zona nominal. */
  geometryJson: text('geometry_json'),
  centerLat: real('center_lat'),
  centerLng: real('center_lng'),
  radiusKm: real('radius_km'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

/** Operación territorial nacida de un lazo, con propósito y reglas explícitas. */
export const civicMissions = sqliteTable(
  'civic_missions',
  {
    id: text('id').primaryKey(),
    territoryId: text('territory_id').notNull(),
    campaignKey: text('campaign_key').$type<CivicCampaignKey>().notNull(),
    campaignVersion: integer('campaign_version').notNull().default(1),
    title: text('title').notNull(),
    purpose: text('purpose').notNull(),
    decisionRecipient: text('decision_recipient').notNull(),
    steward: text('steward').notNull(),
    verificationMethod: text('verification_method').notNull(),
    minIndependentVerifications: integer('min_independent_verifications').notNull().default(2),
    publicPrecision: text('public_precision').$type<LocationPrecision>().notNull(),
    retentionDays: integer('retention_days').notNull(),
    closureCondition: text('closure_condition').notNull(),
    sensitivity: text('sensitivity').$type<MissionSensitivity>().notNull().default('low'),
    status: text('status').$type<CivicMissionStatus>().notNull().default('planning'),
    plannedCells: integer('planned_cells').notNull(),
    completedAt: text('completed_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('civic_missions_territory_idx').on(table.territoryId),
    index('civic_missions_status_idx').on(table.status),
  ],
);

/** Denominador planificado: cada celda conserva su estado y procedencia. */
export const civicMissionCells = sqliteTable(
  'civic_mission_cells',
  {
    id: text('id').primaryKey(),
    missionId: text('mission_id').notNull(),
    cellKey: text('cell_key').notNull(),
    geometryJson: text('geometry_json').notNull(),
    centerLat: real('center_lat').notNull(),
    centerLng: real('center_lng').notNull(),
    status: text('status').$type<CoverageCellStatus>().notNull().default('unknown'),
    observationId: text('observation_id'),
    assignedToKey: text('assigned_to_key'),
    routeKey: text('route_key'),
    assignedAt: text('assigned_at'),
    observedAt: text('observed_at'),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('civic_mission_cells_key_idx').on(table.missionId, table.cellKey),
    index('civic_mission_cells_status_idx').on(table.missionId, table.status),
    index('civic_mission_cells_observation_idx').on(table.observationId),
  ],
);

/**
 * Voz privada y longitudinal. El texto completo nunca entra al outbox: al
 * compartir se deriva una observación categórica separada, enlazada por id.
 */
export const civicListenings = sqliteTable(
  'civic_listenings',
  {
    id: text('id').primaryKey(),
    kind: text('kind').$type<ListeningKind>().notNull(),
    source: text('source').$type<ListeningSource>().notNull(),
    theme: text('theme').$type<ListeningTheme>().notNull(),
    statement: text('statement').notNull(),
    desiredOutcome: text('desired_outcome'),
    existingStrength: text('existing_strength'),
    firstStep: text('first_step'),
    horizon: text('horizon').$type<ListeningHorizon>().notNull(),
    scope: text('scope').$type<ListeningScope>().notNull(),
    importance: integer('importance').notNull().default(3),
    supportWanted: integer('support_wanted', { mode: 'boolean' }).notNull().default(false),
    status: text('status').$type<ListeningStatus>().notNull().default('private'),
    /** Derivados públicos/operativos; el texto privado no se copia allí. */
    observationId: text('observation_id'),
    needId: text('need_id'),
    resourceId: text('resource_id'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('civic_listenings_kind_idx').on(table.kind),
    index('civic_listenings_theme_idx').on(table.theme),
    index('civic_listenings_status_idx').on(table.status),
  ],
);

/**
 * Pasaporte geográfico y de autoría por registro. Conserva el punto preciso
 * sólo en el dispositivo y separa calidad de captura de precisión compartida.
 */
export const civicRecordContexts = sqliteTable(
  'civic_record_contexts',
  {
    id: text('id').primaryKey(),
    entityType: text('entity_type').$type<CivicContextEntity>().notNull(),
    entityId: text('entity_id').notNull(),
    locationRole: text('location_role').$type<LocationRole>().notNull().default('subject'),
    locationSource: text('location_source').$type<LocationSource>().notNull().default('none'),
    exactLat: real('exact_lat'),
    exactLng: real('exact_lng'),
    horizontalAccuracyM: real('horizontal_accuracy_m'),
    capturedAt: text('captured_at'),
    publicLat: real('public_lat'),
    publicLng: real('public_lng'),
    sharedPrecision: text('shared_precision').$type<LocationPrecision>().notNull().default('neighborhood'),
    locationLabel: text('location_label'),
    audience: text('audience').$type<CivicAudience>().notNull().default('private'),
    attributionMode: text('attribution_mode').$type<AttributionMode>().notNull().default('anonymous'),
    attributionName: text('attribution_name'),
    sensitivity: text('sensitivity').$type<CivicSensitivity>().notNull().default('moderate'),
    locationConsent: integer('location_consent', { mode: 'boolean' }).notNull().default(false),
    attributionConsent: integer('attribution_consent', { mode: 'boolean' }).notNull().default(false),
    confirmedAt: text('confirmed_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('civic_record_context_entity_idx').on(table.entityType, table.entityId),
    index('civic_record_context_public_location_idx').on(table.publicLat, table.publicLng),
    index('civic_record_context_audience_idx').on(table.audience),
  ],
);

/**
 * Ledger local append-only de cada divulgación preparada para sincronizar.
 * Una revocación nunca modifica el asiento original: agrega otro que lo cita.
 */
export const civicDisclosureReceipts = sqliteTable(
  'civic_disclosure_receipts',
  {
    id: text('id').primaryKey(),
    disclosureKey: text('disclosure_key').notNull(),
    kind: text('kind').$type<CivicDisclosureReceiptKind>().notNull().default('disclosure'),
    entityType: text('entity_type').$type<CivicDisclosureEntity>().notNull(),
    entityId: text('entity_id').notNull(),
    revokesReceiptId: text('revokes_receipt_id'),
    audience: text('audience').$type<CivicAudience>().notNull(),
    authorizedFieldsJson: text('authorized_fields_json').notNull().default('[]'),
    sharedPrecision: text('shared_precision').$type<LocationPrecision>().notNull(),
    attributionMode: text('attribution_mode').$type<AttributionMode>().notNull(),
    attributionName: text('attribution_name'),
    purpose: text('purpose').notNull(),
    policyVersion: integer('policy_version').notNull(),
    recordedAt: text('recorded_at').notNull(),
  },
  (table) => [
    uniqueIndex('civic_disclosure_receipts_key_idx').on(table.disclosureKey),
    index('civic_disclosure_receipts_entity_idx').on(table.entityType, table.entityId),
    index('civic_disclosure_receipts_recorded_idx').on(table.recordedAt),
    index('civic_disclosure_receipts_revokes_idx').on(table.revokesReceiptId),
  ],
);

/** Captura de campo independiente de la estrella que la representa. */
export const civicObservations = sqliteTable(
  'civic_observations',
  {
    id: text('id').primaryKey(),
    campaignKey: text('campaign_key').$type<CivicCampaignKey>().notNull(),
    campaignVersion: integer('campaign_version').notNull().default(1),
    territoryId: text('territory_id'),
    starId: text('star_id'),
    /** Identidad seudónima del dispositivo; impide auto-verificación. */
    creatorKey: text('creator_key'),
    category: text('category').notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    dataJson: text('data_json').notNull().default('{}'),
    evidenceJson: text('evidence_json').notNull().default('[]'),
    status: text('status').$type<CivicRecordStatus>().notNull().default('draft'),
    confidence: real('confidence').notNull().default(0),
    exactLat: real('exact_lat'),
    exactLng: real('exact_lng'),
    publicLat: real('public_lat'),
    publicLng: real('public_lng'),
    publicPrecision: text('public_precision').$type<LocationPrecision>().notNull().default('500m'),
    locationLabel: text('location_label'),
    observedAt: text('observed_at').notNull(),
    expiresAt: text('expires_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    syncedAt: text('synced_at'),
  },
  (table) => [
    index('civic_observations_campaign_idx').on(table.campaignKey),
    index('civic_observations_status_idx').on(table.status),
    index('civic_observations_territory_idx').on(table.territoryId),
  ],
);

export const civicNeeds = sqliteTable(
  'civic_needs',
  {
    id: text('id').primaryKey(),
    observationId: text('observation_id'),
    territoryId: text('territory_id'),
    /** `false` cuando la fila llegó desde otra parte por el feed operativo. */
    ownedByMe: integer('owned_by_me', { mode: 'boolean' }).notNull().default(true),
    category: text('category').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    quantity: real('quantity'),
    unit: text('unit'),
    urgency: integer('urgency').notNull().default(3),
    status: text('status').$type<NeedStatus>().notNull().default('draft'),
    publicLat: real('public_lat'),
    publicLng: real('public_lng'),
    publicPrecision: text('public_precision').$type<LocationPrecision>().notNull().default('neighborhood'),
    locationLabel: text('location_label'),
    contactConsent: integer('contact_consent', { mode: 'boolean' }).notNull().default(false),
    expiresAt: text('expires_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('civic_needs_category_idx').on(table.category),
    index('civic_needs_status_idx').on(table.status),
  ],
);

/**
 * Custodia privada del pedido derivado de una escucha. No entra al outbox:
 * nombres de organizaciones, referentes y vías de contacto no pertenecen al
 * feed colectivo. Una futura ACL podrá proyectar sólo grants verificables.
 */
export const civicNeedCustodies = sqliteTable(
  'civic_need_custodies',
  {
    needId: text('need_id').primaryKey(),
    listeningId: text('listening_id').notNull(),
    custodianKind: text('custodian_kind').$type<NeedCustodianKind>().notNull(),
    custodianLabel: text('custodian_label'),
    decisionRecipient: text('decision_recipient').$type<NeedDecisionRecipient>().notNull(),
    decisionRecipientLabel: text('decision_recipient_label'),
    contactRoute: text('contact_route').$type<NeedContactRoute>().notNull(),
    status: text('status').$type<NeedCustodyStatus>().notNull().default('active'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('civic_need_custodies_listening_idx').on(table.listeningId),
    index('civic_need_custodies_status_idx').on(table.status),
  ],
);

/**
 * ACL local para una derivación privada. La proyección queda congelada al
 * autorizar y nunca entra al outbox general. Una revocación conserva la fila
 * y agrega estado, motivo controlado y fecha para mantener la trazabilidad.
 */
export const civicNeedAccessGrants = sqliteTable(
  'civic_need_access_grants',
  {
    id: text('id').primaryKey(),
    needId: text('need_id').notNull(),
    recipientKind: text('recipient_kind').$type<NeedGrantRecipientKind>().notNull(),
    /** Clave concreta y estable (`circle:42`, `organization:org-sur`). */
    recipientKey: text('recipient_key').notNull(),
    /** Nombre de exhibición local; no forma parte de la proyección autorizada. */
    recipientLabel: text('recipient_label').notNull(),
    scope: text('scope').$type<NeedGrantScope>().notNull(),
    purpose: text('purpose').$type<NeedGrantPurpose>().notNull(),
    authorizedFieldsJson: text('authorized_fields_json').notNull(),
    projectionJson: text('projection_json').notNull(),
    policyVersion: integer('policy_version').notNull().default(1),
    status: text('status').$type<NeedGrantStatus>().notNull().default('active'),
    expiresAt: text('expires_at').notNull(),
    grantedAt: text('granted_at').notNull(),
    revokedAt: text('revoked_at'),
    revocationReason: text('revocation_reason').$type<NeedGrantRevocationReason>(),
    deliveryStatus: text('delivery_status').$type<NeedGrantDeliveryStatus>().notNull().default('local'),
    remoteRecipientCircleId: integer('remote_recipient_circle_id'),
    remoteGrantorUserId: integer('remote_grantor_user_id'),
    deliveredAt: text('delivered_at'),
    remoteRevokedAt: text('remote_revoked_at'),
    deliveryLastAttemptAt: text('delivery_last_attempt_at'),
    deliveryLastError: text('delivery_last_error'),
    remoteResponseDisposition: text('remote_response_disposition').$type<NeedGrantResponseDisposition>(),
    remoteResponseQuantity: real('remote_response_quantity'),
    remoteResponseUnit: text('remote_response_unit'),
    remoteResponseAt: text('remote_response_at'),
    remoteCoordinationProposalId: text('remote_coordination_proposal_id'),
    remoteCoordinationState: text('remote_coordination_state').$type<NeedCoordinationState>(),
    remoteCoordinationTerminalDecision: text('remote_coordination_terminal_decision').$type<NeedCoordinationDecision>(),
    remoteCoordinationQuantity: real('remote_coordination_quantity'),
    remoteCoordinationUnit: text('remote_coordination_unit').$type<NeedCoordinationUnit>(),
    remoteCoordinationCreatedAt: text('remote_coordination_created_at'),
    remoteCoordinationExpiresAt: text('remote_coordination_expires_at'),
    remoteCoordinationDecidedAt: text('remote_coordination_decided_at'),
    remoteCoordinationRefreshedAt: text('remote_coordination_refreshed_at'),
    /** Última vista execution/v1 validada para la cuenta grantora. */
    remoteExecutionJson: text('remote_execution_json'),
    remoteExecutionObservedAt: text('remote_execution_observed_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('civic_need_access_grants_need_idx').on(table.needId),
    index('civic_need_access_grants_recipient_idx').on(table.recipientKind, table.recipientKey),
    index('civic_need_access_grants_status_idx').on(table.status, table.expiresAt),
    index('civic_need_access_grants_delivery_idx').on(table.deliveryStatus),
  ],
);

/**
 * Comando privado pendiente de constancia. Se persiste antes de tocar la red
 * para que un reinicio pueda repetir exactamente responseId + payload. El
 * snapshot contiene sólo la proyección cerrada del grant que hace falta para
 * validar el recibo; nunca entra al outbox público.
 */
export const civicCustodyResponseIntents = sqliteTable(
  'civic_custody_response_intents',
  {
    responseId: text('response_id').primaryKey(),
    responderUserId: integer('responder_user_id').notNull(),
    grantId: text('grant_id').notNull(),
    disposition: text('disposition').$type<NeedGrantResponseDisposition>().notNull(),
    quantity: real('quantity'),
    requestJson: text('request_json').notNull(),
    grantJson: text('grant_json').notNull(),
    createdAt: text('created_at').notNull(),
    lastAttemptAt: text('last_attempt_at'),
  },
  (table) => [
    uniqueIndex('civic_custody_response_intents_account_grant_idx')
      .on(table.responderUserId, table.grantId),
    index('civic_custody_response_intents_created_idx').on(table.createdAt),
  ],
);

/**
 * Evento execution/v1 pendiente de una constancia exacta. La fila se escribe
 * y persiste antes del HTTP; nunca entra al outbox ni contiene texto/contacto.
 */
export const civicCustodyExecutionIntents = sqliteTable(
  'civic_custody_execution_intents',
  {
    eventId: text('event_id').primaryKey(),
    userId: integer('user_id').notNull(),
    proposalId: text('proposal_id').notNull(),
    eventType: text('event_type').$type<CustodyExecutionEventType>().notNull(),
    expectedVersion: text('expected_version').notNull(),
    requestJson: text('request_json').notNull(),
    executionJson: text('execution_json').notNull(),
    snapshotObservedAt: text('snapshot_observed_at').notNull(),
    createdAt: text('created_at').notNull(),
    lastAttemptAt: text('last_attempt_at'),
  },
  (table) => [
    uniqueIndex('civic_custody_execution_intents_account_proposal_idx')
      .on(table.userId, table.proposalId),
    index('civic_custody_execution_intents_created_idx').on(table.createdAt),
  ],
);

export const civicResources = sqliteTable(
  'civic_resources',
  {
    id: text('id').primaryKey(),
    territoryId: text('territory_id'),
    /** Permite proponer sólo puentes donde este dispositivo representa un lado. */
    ownedByMe: integer('owned_by_me', { mode: 'boolean' }).notNull().default(true),
    category: text('category').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    quantity: real('quantity'),
    unit: text('unit'),
    availabilityJson: text('availability_json').notNull().default('{}'),
    radiusKm: real('radius_km').notNull().default(5),
    confidence: real('confidence').notNull().default(0.5),
    status: text('status').$type<ResourceStatus>().notNull().default('draft'),
    publicLat: real('public_lat'),
    publicLng: real('public_lng'),
    publicPrecision: text('public_precision').$type<LocationPrecision>().notNull().default('neighborhood'),
    locationLabel: text('location_label'),
    contactConsent: integer('contact_consent', { mode: 'boolean' }).notNull().default(false),
    expiresAt: text('expires_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('civic_resources_category_idx').on(table.category),
    index('civic_resources_status_idx').on(table.status),
  ],
);

export const civicVerifications = sqliteTable(
  'civic_verifications',
  {
    id: text('id').primaryKey(),
    observationId: text('observation_id').notNull(),
    verdict: text('verdict').$type<VerificationVerdict>().notNull(),
    note: text('note'),
    evidenceJson: text('evidence_json').notNull().default('[]'),
    verifierKey: text('verifier_key').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('civic_verifications_observation_idx').on(table.observationId),
    uniqueIndex('civic_verifications_actor_once_idx').on(table.observationId, table.verifierKey),
  ],
);

export const civicMatches = sqliteTable(
  'civic_matches',
  {
    id: text('id').primaryKey(),
    needId: text('need_id').notNull(),
    resourceId: text('resource_id').notNull(),
    score: integer('score').notNull(),
    reasonsJson: text('reasons_json').notNull().default('[]'),
    status: text('status').$type<MatchStatus>().notNull().default('proposed'),
    acceptedNeedAt: text('accepted_need_at'),
    acceptedResourceAt: text('accepted_resource_at'),
    acceptedNeedBy: text('accepted_need_by'),
    acceptedResourceBy: text('accepted_resource_by'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('civic_matches_pair_idx').on(table.needId, table.resourceId),
    index('civic_matches_status_idx').on(table.status),
  ],
);

export const civicActions = sqliteTable('civic_actions', {
  id: text('id').primaryKey(),
  matchId: text('match_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').$type<CivicActionStatus>().notNull().default('planned'),
  scheduledAt: text('scheduled_at'),
  completedAt: text('completed_at'),
  confirmedAt: text('confirmed_at'),
  outcomeJson: text('outcome_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const civicConsents = sqliteTable(
  'civic_consents',
  {
    id: text('id').primaryKey(),
    scope: text('scope').$type<ConsentScope>().notNull(),
    purpose: text('purpose').notNull(),
    version: integer('version').notNull().default(1),
    granted: integer('granted', { mode: 'boolean' }).notNull(),
    grantedAt: text('granted_at'),
    revokedAt: text('revoked_at'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [uniqueIndex('civic_consents_scope_version_idx').on(table.scope, table.version)],
);

/** Cola durable. El payload nunca contiene ubicación exacta si el evento es público. */
export const syncOutbox = sqliteTable(
  'sync_outbox',
  {
    id: text('id').primaryKey(),
    idempotencyKey: text('idempotency_key').notNull(),
    entityType: text('entity_type').$type<SyncEntity>().notNull(),
    entityId: text('entity_id').notNull(),
    operation: text('operation').$type<SyncOperation>().notNull(),
    payloadJson: text('payload_json').notNull(),
    status: text('status').$type<SyncStatus>().notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    nextAttemptAt: text('next_attempt_at'),
    lastError: text('last_error'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('sync_outbox_idempotency_idx').on(table.idempotencyKey),
    index('sync_outbox_status_idx').on(table.status),
  ],
);

// Tipos de fila inferidos — los usan repos y pantallas.
export type StarRow = typeof stars.$inferSelect;
export type NewStarRow = typeof stars.$inferInsert;
export type ReflectionRow = typeof reflections.$inferSelect;
export type CommitmentRow = typeof commitments.$inferSelect;
export type DayRow = typeof days.$inferSelect;
export type ExpeditionRow = typeof expeditions.$inferSelect;
export type ExpeditionEntryRow = typeof expeditionEntries.$inferSelect;
export type EmberLedgerRow = typeof emberLedger.$inferSelect;
export type UnlockRow = typeof unlocks.$inferSelect;
export type RedeemedNonceRow = typeof redeemedNonces.$inferSelect;
export type SettingRow = typeof settings.$inferSelect;
export type CivicTerritoryRow = typeof civicTerritories.$inferSelect;
export type CivicMissionRow = typeof civicMissions.$inferSelect;
export type CivicMissionCellRow = typeof civicMissionCells.$inferSelect;
export type CivicListeningRow = typeof civicListenings.$inferSelect;
export type CivicRecordContextRow = typeof civicRecordContexts.$inferSelect;
export type CivicDisclosureReceiptRow = typeof civicDisclosureReceipts.$inferSelect;
export type CivicObservationRow = typeof civicObservations.$inferSelect;
export type CivicNeedRow = typeof civicNeeds.$inferSelect;
export type CivicNeedCustodyRow = typeof civicNeedCustodies.$inferSelect;
export type CivicNeedAccessGrantRow = typeof civicNeedAccessGrants.$inferSelect;
export type CivicCustodyResponseIntentRow = typeof civicCustodyResponseIntents.$inferSelect;
export type CivicCustodyExecutionIntentRow = typeof civicCustodyExecutionIntents.$inferSelect;
export type CivicResourceRow = typeof civicResources.$inferSelect;
export type CivicVerificationRow = typeof civicVerifications.$inferSelect;
export type CivicMatchRow = typeof civicMatches.$inferSelect;
export type CivicActionRow = typeof civicActions.$inferSelect;
export type CivicConsentRow = typeof civicConsents.$inferSelect;
export type SyncOutboxRow = typeof syncOutbox.$inferSelect;
