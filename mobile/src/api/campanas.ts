import { api } from './client';
import { qs } from './circulos';

/**
 * Campañas — espejo de shared/campaign-forms.ts + server/routes-campanas.ts
 * (backend v1). La app no puede importar de SocialJusticeHub: los contratos
 * viven acá, como src/api/map.ts.
 */

// ── Contrato del formulario dinámico (espejo de shared/campaign-forms.ts) ──

export type CampaignFieldType = 'text' | 'number' | 'select' | 'photo' | 'rating';

export const MAX_CAMPAIGN_FIELDS = 12;

export interface CampaignFormField {
  /** Clave estable dentro del JSON de respuestas (snake_case, único por form) */
  key: string;
  /** Pregunta/etiqueta que ve la persona (rioplatense) */
  label: string;
  type: CampaignFieldType;
  required: boolean;
  /** Solo para type='select' */
  options?: string[];
  /** Solo para type='rating': escala 1..max (default 5) */
  max?: number;
  /** Ayuda breve bajo el campo */
  hint?: string;
}

export interface CampaignFormSchema {
  fields: CampaignFormField[];
}

export type CampaignType = 'relevamiento' | 'consulta';
export type CampaignStatus = 'borrador' | 'activa' | 'verificacion' | 'cerrada';
export type CampaignEntryStatus = 'pendiente' | 'verificada' | 'rechazada';

/** Respuestas de una entrada: { [field.key]: valor }. Fotos viajan como URL (Cloudinary). */
export type CampaignEntryData = Record<string, string | number | null>;

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  borrador: 'Borrador',
  activa: 'Activa',
  verificacion: 'En verificación',
  cerrada: 'Cerrada',
};

// ── Filas de la API ──

export interface Campaign {
  id: number;
  circleId: number;
  templateId: number | null;
  type: CampaignType;
  title: string;
  description: string | null;
  category: string | null;
  mapColor: string | null;
  mapIcon: string | null;
  status: CampaignStatus;
  targetEntries: number | null;
  deadline: string | null;
  targetProvince: string | null;
  targetCity: string | null;
  targetLat: number | null;
  targetLng: number | null;
  targetRadiusKm: number | null;
  createdBy: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Fila del listado (GET /api/campanas) — sin formSchema. */
export interface CampaignSummary extends Campaign {
  circleName: string;
  entryCount: number;
}

/** Detalle (GET /api/campanas/:id) — formSchema ya parseado por el server. */
export interface CampaignDetail extends CampaignSummary {
  circleKind: string;
  formSchema: CampaignFormSchema | null;
}

export interface Plantilla {
  id: number;
  slug: string;
  type: CampaignType;
  title: string;
  description: string | null;
  category: string | null;
  formSchema: CampaignFormSchema | null;
  mapColor: string | null;
  mapIcon: string | null;
}

export interface CampaignProgress {
  campaignId: number;
  status: CampaignStatus;
  entries: number;
  targetEntries: number | null;
  /** 0..100 (o null si no hay meta) */
  progressPct: number | null;
  verified: number;
  verifiedPct: number;
  byProvince: Array<{ province: string; count: number }>;
  byCity: Array<{ city: string; count: number }>;
}

export interface CampaignEntryView {
  id: number;
  latitude: number | null;
  longitude: number | null;
  province: string | null;
  city: string | null;
  data: CampaignEntryData | null;
  photoUrl: string | null;
  status: CampaignEntryStatus;
  createdAt: string | null;
  submittedByName: string | null;
}

// ── Funciones ──

export async function fetchPlantillas(): Promise<Plantilla[]> {
  const data = await api<{ plantillas: Plantilla[]; total: number }>(
    'GET',
    '/api/campanas/plantillas',
  );
  return data.plantillas;
}

export interface CampanaFilters {
  /** default del server: 'activa'; 'todas' trae todos los estados */
  status?: CampaignStatus | 'todas';
  type?: CampaignType;
  province?: string;
  city?: string;
}

export async function fetchCampanas(filters: CampanaFilters = {}): Promise<CampaignSummary[]> {
  const data = await api<{ campanas: CampaignSummary[]; total: number }>(
    'GET',
    `/api/campanas${qs(filters)}`,
  );
  return data.campanas;
}

export async function fetchCampana(id: number): Promise<CampaignDetail> {
  return api<CampaignDetail>('GET', `/api/campanas/${id}`);
}

export async function fetchProgreso(id: number): Promise<CampaignProgress> {
  return api<CampaignProgress>('GET', `/api/campanas/${id}/progreso`);
}

export interface CrearCampanaInput {
  templateId?: number;
  type: CampaignType;
  title: string;
  description?: string;
  category?: string;
  formSchema?: CampaignFormSchema;
  mapColor?: string;
  mapIcon?: string;
  targetEntries?: number;
  deadline?: string;
  targetProvince?: string;
  targetCity?: string;
  targetLat?: number;
  targetLng?: number;
  targetRadiusKm?: number;
}

/** POST /api/circulos/:id/campanas — nace en estado 'borrador'. */
export async function crearCampana(circleId: number, input: CrearCampanaInput): Promise<Campaign> {
  return api<Campaign>('POST', `/api/circulos/${circleId}/campanas`, input);
}

/** Transiciones solo hacia adelante: borrador→activa→verificacion→cerrada. */
export async function cambiarEstado(id: number, estado: CampaignStatus): Promise<Campaign> {
  return api<Campaign>('POST', `/api/campanas/${id}/estado`, { estado });
}

export interface EntradaInput {
  latitude: number;
  longitude: number;
  data: CampaignEntryData;
  anonymous?: boolean;
  photoUrl?: string;
}

export async function enviarEntrada(
  campaignId: number,
  entrada: EntradaInput,
): Promise<{ ok: true; id: number; province: string | null; city: string | null }> {
  return api('POST', `/api/campanas/${campaignId}/entradas`, entrada);
}

export async function fetchEntradas(
  campaignId: number,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<{ entradas: CampaignEntryView[]; total: number }> {
  return api('GET', `/api/campanas/${campaignId}/entradas${qs({ limit, offset })}`);
}

export async function verificarEntrada(
  entryId: number,
): Promise<{ ok: true; id: number | undefined; status: CampaignEntryStatus | undefined }> {
  return api('POST', `/api/campanas/entradas/${entryId}/verificar`);
}
