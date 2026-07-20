export type CivicCampaignKey =
  | 'luminarias-v1'
  | 'ollas-v1'
  | 'senal-libre-v1'
  | 'escucha-v1';

/**
 * Una escucha no mezcla hechos verificables con deseos. Cada clase conserva
 * su lógica: las necesidades buscan apoyo, las capacidades ofrecen algo, y
 * sueños/propuestas alimentan deliberación colectiva sin fingir que son
 * observaciones que otra persona deba "confirmar".
 */
export type ListeningKind = 'need' | 'dream' | 'proposal' | 'capacity';
export type ListeningSource = 'lived' | 'seen' | 'heard' | 'dreamed';
export type ListeningTheme =
  | 'food'
  | 'housing'
  | 'work'
  | 'care'
  | 'health'
  | 'education'
  | 'environment'
  | 'mobility'
  | 'safety'
  | 'culture'
  | 'democracy';
export type ListeningHorizon = 'now' | 'year' | 'generation';
export type ListeningScope = 'personal' | 'block' | 'neighborhood' | 'city' | 'country';
export type ListeningStatus = 'private' | 'shared' | 'connected' | 'archived';

export type CivicMissionStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';
export type CoverageCellStatus =
  | 'unknown'
  | 'assigned'
  | 'visited_empty'
  | 'observed'
  | 'contested'
  | 'corroborated'
  | 'stale';
export type MissionSensitivity = 'low' | 'moderate' | 'high';

export type CivicRecordStatus =
  | 'draft'
  | 'queued'
  | 'synced'
  | 'needs_review'
  | 'corroborated'
  | 'stale'
  | 'withdrawn'
  | 'unsafe';

export type LocationPrecision = 'exact' | '100m' | '500m' | 'neighborhood' | 'city';

/** Lo que sabemos del lugar y lo que autorizamos compartir son ejes distintos. */
export type CivicContextEntity = 'listening' | 'observation' | 'need' | 'resource';
export type LocationRole = 'subject' | 'capture' | 'service_area' | 'meeting_point';
export type LocationSource =
  | 'gps_current'
  | 'map_pin'
  | 'manual'
  | 'inherited'
  | 'imported_public'
  | 'none';
export type CivicAudience = 'private' | 'collective' | 'circle' | 'counterpart';
export type AttributionMode = 'anonymous' | 'alias' | 'named';
export type CivicSensitivity = 'low' | 'moderate' | 'high';
export type CivicDisclosureEntity = 'observation' | 'need' | 'resource';
export type CivicDisclosureReceiptKind = 'disclosure' | 'revocation';

export type NeedStatus =
  | 'draft'
  | 'submitted'
  | 'needs_review'
  | 'corroborated'
  | 'matched'
  | 'in_progress'
  | 'resolved'
  | 'reopened'
  | 'withdrawn';

/** Custodia local del pedido. Estas etiquetas nunca viajan en el feed público. */
export type NeedCustodianKind = 'self' | 'trusted_circle' | 'organization' | 'public_service';
export type NeedDecisionRecipient =
  | 'community_network'
  | 'civil_organization'
  | 'municipal'
  | 'provincial'
  | 'national'
  | 'to_define';
export type NeedContactRoute = 'in_app' | 'through_custodian' | 'in_person' | 'to_define';
export type NeedCustodyStatus = 'active' | 'closed' | 'withdrawn';

/**
 * Permiso local, nominativo y revocable para preparar una derivación privada.
 * No equivale a publicar ni a entregar: el transporte necesita un canal
 * destinatario autenticado que no forma parte del feed colectivo.
 */
export type NeedGrantRecipientKind = 'circle' | 'organization';
export type NeedGrantScope = 'essentials' | 'essentials_and_safe_area';
export type NeedGrantPurpose = 'assess_support' | 'coordinate_support' | 'deliver_support';
export type NeedGrantStatus = 'active' | 'revoked' | 'expired';
export type NeedGrantDeliveryStatus =
  | 'local'
  | 'delivering'
  | 'delivered'
  | 'failed'
  | 'revocation_pending'
  | 'revoked_remote';
export type NeedGrantResponseDisposition = 'assessing' | 'support_available';
export type NeedCoordinationState = 'proposed' | 'accepted' | 'declined' | 'expired' | 'closed';
export type NeedCoordinationDecision = 'accept' | 'decline';
export type NeedCoordinationUnit =
  | 'people'
  | 'meals'
  | 'units'
  | 'hours'
  | 'kilograms'
  | 'liters'
  | 'trips'
  | 'days'
  | 'beds'
  | 'kits'
  | 'other';
/** Eventos controlados del tramo privado posterior al acuerdo bilateral. */
export type CustodyExecutionEventType =
  | 'reserve'
  | 'grantor_ready'
  | 'coordinator_ready'
  | 'start_delivery'
  | 'report_delivery'
  | 'confirm_receipt'
  | 'record_follow_up'
  | 'withdraw';
export type NeedGrantRevocationReason =
  | 'custodian_decision'
  | 'recipient_changed'
  | 'purpose_complete'
  | 'safety_concern'
  | 'remote_closed';

export type ResourceStatus = 'draft' | 'available' | 'reserved' | 'depleted' | 'expired' | 'withdrawn';

export type VerificationVerdict = 'confirm' | 'correct' | 'duplicate' | 'cannot_verify' | 'stale' | 'unsafe';

export type MatchStatus = 'proposed' | 'accepted' | 'in_progress' | 'fulfilled' | 'confirmed' | 'declined' | 'cancelled';

export type CivicActionStatus = 'planned' | 'in_progress' | 'completed' | 'confirmed' | 'cancelled';

export type ConsentScope = 'location' | 'photo' | 'publish' | 'contact' | 'sync';

export type SyncEntity =
  | 'observation'
  | 'need'
  | 'resource'
  | 'verification'
  | 'match'
  | 'action'
  | 'territory'
  | 'consent';

export type SyncOperation = 'create' | 'update' | 'transition' | 'delete';

export type SyncStatus = 'pending' | 'sending' | 'failed' | 'dead_letter';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PublicLocation {
  point: GeoPoint | null;
  precision: LocationPrecision;
  label: string | null;
}

/**
 * Recibo por registro. `point` y `horizontalAccuracyM` describen el dato
 * conocido; `sharedPrecision`, `audience` y `attributionMode` describen el
 * consentimiento de divulgación. El punto exacto nunca entra al outbox.
 */
export interface CivicRecordContextInput {
  point: GeoPoint | null;
  publicPointOverride?: GeoPoint | null;
  locationRole?: LocationRole;
  locationSource?: LocationSource;
  horizontalAccuracyM?: number | null;
  capturedAt?: string | null;
  sharedPrecision?: LocationPrecision;
  locationLabel?: string | null;
  audience?: CivicAudience;
  attributionMode?: AttributionMode;
  attributionName?: string | null;
  sensitivity?: CivicSensitivity;
  locationConsent?: boolean;
  attributionConsent?: boolean;
  confirmedAt?: string | null;
}

export interface CivicRecordContextDraft {
  point: GeoPoint | null;
  locationSource: LocationSource;
  horizontalAccuracyM: number | null;
  capturedAt: string | null;
  sharedPrecision: Exclude<LocationPrecision, 'exact'>;
  locationLabel: string;
  audience: CivicAudience;
  attributionMode: AttributionMode;
  attributionName: string;
  sensitivity: CivicSensitivity;
}

export interface MatchScoreInput {
  needCategory: string;
  resourceCategory: string;
  needQuantity: number | null;
  resourceQuantity: number | null;
  distanceKm: number | null;
  distanceMinKm?: number | null;
  distanceMaxKm?: number | null;
  radiusKm: number | null;
  needUrgency: number;
  resourceConfidence: number;
}

export interface MatchScore {
  eligible: boolean;
  score: number;
  reasons: string[];
}
