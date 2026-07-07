// shared/campaign-layers.ts
// Payload PÚBLICO de las capas de campaña del mapa (GET /api/map/campaign-layers).
// Regla dura: nada acá identifica a una persona — sin submittedBy, sin flag anonymous,
// coordenadas ya redondeadas (snapCoords) al escribir.

import type { CampaignType, CampaignStatus, CampaignEntryStatus } from './campaign-forms';

export interface CampaignLayerPoint {
  id: number;
  lat: number;
  lng: number;
  province: string | null;
  city: string | null;
  status: CampaignEntryStatus;
  /** Primer respuesta de texto, recortada (~140 chars, sanitizada) */
  excerpt: string | null;
  createdAt: string | null;
}

export interface CampaignLayer {
  campaignId: number;
  title: string;
  type: CampaignType;
  status: CampaignStatus;
  category: string | null;
  /** Color hex de la capa en el mapa (definido por la campaña/plantilla) */
  color: string;
  icon: string | null;
  points: CampaignLayerPoint[];
}

export interface CampaignLayersResponse {
  layers: CampaignLayer[];
  /** Total de puntos sumados entre todas las capas */
  total: number;
}
