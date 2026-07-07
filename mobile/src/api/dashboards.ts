import { api } from './client';
import { qs } from './circulos';

/**
 * Dashboards — espejo de server/routes-dashboards.ts +
 * server/services/dashboards-service.ts (backend v1).
 */

export interface NacionalDashboard {
  /** Señales por semana (últimas 12) y tipo: dream/need/basta/value + compromiso/recurso */
  totalsByTypeWeek: Array<{ week: string; type: string; count: number }>;
  provinceRanking: Array<{ province: string; count: number }>;
  activeCampaigns: number;
  generatedAt: string;
}

export interface CampaignDashboard {
  campaignId: number;
  status: string;
  entries: number;
  targetEntries: number | null;
  progressPct: number | null;
  verified: number;
  verifiedPct: number;
  byProvince: Array<{ province: string; count: number }>;
  byCity: Array<{ city: string; count: number }>;
  title: string;
  type: 'relevamiento' | 'consulta';
  deadline: string | null;
  perDay: Array<{ day: string; count: number }>;
  generatedAt: string;
}

export interface CircleDashboard {
  circleId: number;
  members: number;
  campaignsByStatus: Array<{ status: string; count: number }>;
  totalEntries: number;
  entriesLast7Days: number;
  generatedAt: string;
}

export interface NecesidadesDashboard {
  province: string | null;
  city: string | null;
  senalesNecesidad: number;
  topRespuestas: Array<{
    campaignId: number;
    campaignTitle: string;
    label: string;
    value: string;
    count: number;
  }>;
  generatedAt: string;
}

/** Track record personal — Proof-of-Output. Requiere sesión. */
export interface MiAporte {
  senales: number;
  compromisos: number;
  recursos: number;
  entradas: number;
  entradasVerificadas: number;
  campanasCreadas: number;
  circulos: number;
  generatedAt: string;
}

export async function fetchNacional(): Promise<NacionalDashboard> {
  return api<NacionalDashboard>('GET', '/api/dashboards/nacional');
}

export async function fetchCampanaDashboard(id: number): Promise<CampaignDashboard> {
  return api<CampaignDashboard>('GET', `/api/dashboards/campanas/${id}`);
}

export async function fetchCirculoDashboard(id: number): Promise<CircleDashboard> {
  return api<CircleDashboard>('GET', `/api/dashboards/circulos/${id}`);
}

export async function fetchNecesidades(
  province?: string,
  city?: string,
): Promise<NecesidadesDashboard> {
  return api<NecesidadesDashboard>('GET', `/api/dashboards/necesidades${qs({ province, city })}`);
}

export async function fetchMiAporte(): Promise<MiAporte> {
  return api<MiAporte>('GET', '/api/dashboards/mi-aporte');
}
