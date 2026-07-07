// shared/campaign-forms.ts
// Contrato del formulario dinámico de campañas (relevamientos y consultas).
// Lo consumen el servidor (validación de entradas) y la app móvil (render del form).

export type CampaignFieldType = 'text' | 'number' | 'select' | 'photo' | 'rating';

export const CAMPAIGN_FIELD_TYPES: CampaignFieldType[] = ['text', 'number', 'select', 'photo', 'rating'];

/** Máximo de campos por formulario — mantiene las campañas capturables en la calle. */
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

/** Transiciones válidas del estado de campaña — solo hacia adelante. */
export const CAMPAIGN_STATUS_FLOW: Record<CampaignStatus, CampaignStatus[]> = {
  borrador: ['activa'],
  activa: ['verificacion', 'cerrada'],
  verificacion: ['cerrada'],
  cerrada: [],
};

export type CampaignEntryStatus = 'pendiente' | 'verificada' | 'rechazada';

/** Respuestas de una entrada: { [field.key]: valor }. Fotos viajan como URL (Cloudinary). */
export type CampaignEntryData = Record<string, string | number | null>;
