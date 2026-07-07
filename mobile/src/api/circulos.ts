import { api } from './client';

/**
 * Círculos — espejo de los contratos de server/routes-circulos.ts +
 * server/services/circulos-service.ts (backend v1). La app no puede importar
 * de SocialJusticeHub: los tipos viven acá, como src/api/map.ts.
 */

export type CircleKind = 'territorial' | 'tematica' | 'celula';
export type CircleGovernance = 'coordinado' | 'abierto';
export type CircleRole = 'coordinador' | 'miembro';

export interface Circle {
  id: number;
  name: string;
  description: string | null;
  kind: CircleKind;
  province: string | null;
  city: string | null;
  theme: string | null;
  governance: CircleGovernance;
  isPrivate: boolean | null;
  isOfficial: boolean | null;
  createdBy: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Fila del descubrimiento (GET /api/circulos). */
export interface CircleSummary extends Circle {
  memberCount: number;
  isMember: boolean;
}

/** Detalle (GET /api/circulos/:id) — agrega el rol propio. */
export interface CircleDetail extends Circle {
  memberCount: number;
  isMember: boolean;
  role: CircleRole | null;
}

export interface CircleMemberView {
  userId: number;
  displayName: string;
  role: CircleRole;
  joinedAt: string | null;
}

export interface CircleInvite {
  code: string;
  maxUses: number | null;
  uses: number | null;
  expiresAt: string | null;
}

export interface CanjeResult {
  ok: true;
  circulo: { id: number; name: string; kind: CircleKind };
  role: CircleRole;
}

export interface CrearCirculoInput {
  name: string;
  description?: string;
  kind: CircleKind;
  province?: string;
  city?: string;
  theme?: string;
  governance?: CircleGovernance;
  isPrivate?: boolean;
}

export interface CirculoFilters {
  kind?: CircleKind;
  province?: string;
  city?: string;
  theme?: string;
  q?: string;
}

/** Query string a mano — URLSearchParams no es confiable en RN. */
export function qs(params: object): string {
  const parts = (Object.entries(params) as Array<[string, string | number | undefined]>)
    .filter((pair): pair is [string, string | number] => pair[1] !== undefined && pair[1] !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

export async function fetchCirculos(filters: CirculoFilters = {}): Promise<CircleSummary[]> {
  const data = await api<{ circulos: CircleSummary[]; total: number }>(
    'GET',
    `/api/circulos${qs(filters)}`,
  );
  return data.circulos;
}

export async function fetchCirculo(id: number): Promise<CircleDetail> {
  return api<CircleDetail>('GET', `/api/circulos/${id}`);
}

export async function crearCirculo(input: CrearCirculoInput): Promise<Circle> {
  return api<Circle>('POST', '/api/circulos', input);
}

export async function unirseCirculo(id: number): Promise<{ ok: true; role: CircleRole }> {
  return api<{ ok: true; role: CircleRole }>('POST', `/api/circulos/${id}/unirse`);
}

export async function salirCirculo(id: number): Promise<{ ok: true }> {
  return api<{ ok: true }>('POST', `/api/circulos/${id}/salir`);
}

export async function fetchMiembros(id: number): Promise<CircleMemberView[]> {
  const data = await api<{ miembros: CircleMemberView[]; total: number }>(
    'GET',
    `/api/circulos/${id}/miembros`,
  );
  return data.miembros;
}

export async function crearInvitacion(
  circleId: number,
  opts: { maxUses?: number; expiresInDays?: number } = {},
): Promise<CircleInvite> {
  return api<CircleInvite>('POST', `/api/circulos/${circleId}/invitaciones`, opts);
}

export async function canjearInvitacion(code: string): Promise<CanjeResult> {
  return api<CanjeResult>('POST', '/api/circulos/invitaciones/canjear', { code });
}

export async function reportarCirculo(id: number, reason: string): Promise<{ ok: true; id: number }> {
  return api<{ ok: true; id: number }>('POST', `/api/circulos/${id}/reportar`, { reason });
}
