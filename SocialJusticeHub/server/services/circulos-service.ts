// server/services/circulos-service.ts
// Acceso a datos de círculos (grupos territoriales/temáticos/células).
// Toda la lógica vive acá — nada en storage.ts.
import crypto from 'crypto';
import { and, desc, eq, ilike, inArray, ne, or, sql, type SQL } from 'drizzle-orm';
import { db } from '../db';
import {
  circles,
  circleMembers,
  circleInvites,
  circleReports,
  users,
  geographicLocations,
  type Circle,
  type CircleMember,
  type CircleInvite,
} from '@shared/schema';
import { resolveProvince, haversineKm } from '../geo-resolver';
import type { CrearCirculoInput, ActualizarCirculoInput } from '../lib/circulos';

const DEFAULT_RADIUS_KM = 50;
const MAX_DISCOVERY_RESULTS = 200;

export interface CircleFilters {
  kind?: string;
  province?: string;
  city?: string;
  theme?: string;
  q?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface CircleSummary extends Circle {
  memberCount: number;
  isMember: boolean;
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

async function memberCircleIds(userId: number | null): Promise<Set<number>> {
  if (!userId) return new Set();
  const rows = await db
    .select({ circleId: circleMembers.circleId })
    .from(circleMembers)
    .where(eq(circleMembers.userId, userId));
  return new Set(rows.map((r) => r.circleId));
}

/**
 * Descubrimiento de círculos. Las células (y todo círculo privado) solo
 * aparecen para sus miembros. Con lat/lng filtra por cercanía: ciudades
 * dentro del radio (haversine sobre geographic_locations) o círculos de la
 * provincia resuelta por polígono.
 */
export async function listCircles(filters: CircleFilters, userId: number | null): Promise<CircleSummary[]> {
  const conds: SQL[] = [];
  if (filters.kind) conds.push(eq(circles.kind, filters.kind as Circle['kind']));
  if (filters.province) conds.push(eq(circles.province, filters.province));
  if (filters.city) conds.push(eq(circles.city, filters.city));
  if (filters.theme) conds.push(eq(circles.theme, filters.theme));
  if (filters.q) {
    const pattern = `%${filters.q}%`;
    const qCond = or(ilike(circles.name, pattern), ilike(circles.description, pattern));
    if (qCond) conds.push(qCond);
  }

  const [rows, myCircles] = await Promise.all([
    db
      .select({
        circle: circles,
        memberCount: sql<number>`(select count(*)::int from circle_members cm where cm.circle_id = ${circles.id})`,
      })
      .from(circles)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(circles.isOfficial), desc(circles.id))
      .limit(MAX_DISCOVERY_RESULTS),
    memberCircleIds(userId),
  ]);

  let results = rows
    .filter((r) => {
      const hidden = r.circle.kind === 'celula' || r.circle.isPrivate === true;
      return !hidden || myCircles.has(r.circle.id);
    })
    .map((r): CircleSummary => ({ ...r.circle, memberCount: r.memberCount, isMember: myCircles.has(r.circle.id) }));

  if (filters.lat !== undefined && filters.lng !== undefined) {
    results = await filterByProximity(results, filters.lat, filters.lng, filters.radiusKm ?? DEFAULT_RADIUS_KM);
  }

  return results;
}

async function filterByProximity(
  circleList: CircleSummary[],
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<CircleSummary[]> {
  const province = resolveProvince(lat, lng);

  const cityNames = Array.from(
    new Set(circleList.map((c) => c.city).filter((c): c is string => Boolean(c))),
  );

  const cityCoords = new Map<string, { lat: number; lng: number }>();
  if (cityNames.length > 0) {
    const cityRows = await db
      .select({
        name: geographicLocations.name,
        latitude: geographicLocations.latitude,
        longitude: geographicLocations.longitude,
      })
      .from(geographicLocations)
      .where(eq(geographicLocations.type, 'city'));
    const wanted = new Set(cityNames.map(normalize));
    for (const row of cityRows) {
      const key = normalize(row.name);
      if (wanted.has(key) && row.latitude != null && row.longitude != null && !cityCoords.has(key)) {
        cityCoords.set(key, { lat: row.latitude, lng: row.longitude });
      }
    }
  }

  return circleList.filter((circle) => {
    if (circle.city) {
      const coords = cityCoords.get(normalize(circle.city));
      if (coords) return haversineKm(lat, lng, coords.lat, coords.lng) <= radiusKm;
    }
    // Sin coordenadas de ciudad: cae al match por provincia resuelta
    if (circle.province && province) return circle.province === province;
    return false;
  });
}

export async function getCircleById(id: number): Promise<Circle | undefined> {
  const [circle] = await db.select().from(circles).where(eq(circles.id, id)).limit(1);
  return circle;
}

export async function getMembership(circleId: number, userId: number): Promise<CircleMember | undefined> {
  const [member] = await db
    .select()
    .from(circleMembers)
    .where(and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, userId)))
    .limit(1);
  return member;
}

export async function countMembers(circleId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(circleMembers)
    .where(eq(circleMembers.circleId, circleId));
  return row?.count ?? 0;
}

export async function createCircle(input: CrearCirculoInput, userId: number): Promise<Circle> {
  const isCelula = input.kind === 'celula';
  const [circle] = await db
    .insert(circles)
    .values({
      name: input.name,
      description: input.description ?? null,
      kind: input.kind,
      province: input.province ?? null,
      city: input.city ?? null,
      theme: input.theme ?? null,
      governance: input.governance,
      isPrivate: isCelula ? true : (input.isPrivate ?? false),
      isOfficial: false,
      createdBy: userId,
    })
    .returning();

  await db.insert(circleMembers).values({
    circleId: circle.id,
    userId,
    role: 'coordinador',
    displayRealName: isCelula,
  });

  return circle;
}

export async function updateCircle(id: number, input: ActualizarCirculoInput): Promise<Circle | undefined> {
  const existing = await getCircleById(id);
  if (!existing) return undefined;

  const [updated] = await db
    .update(circles)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.province !== undefined ? { province: input.province } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.theme !== undefined ? { theme: input.theme } : {}),
      ...(input.governance !== undefined ? { governance: input.governance } : {}),
      // Una célula nunca deja de ser privada
      ...(input.isPrivate !== undefined ? { isPrivate: existing.kind === 'celula' ? true : input.isPrivate } : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(circles.id, id))
    .returning();
  return updated;
}

export async function joinCircle(circleId: number, userId: number, displayRealName: boolean): Promise<CircleMember> {
  const [member] = await db
    .insert(circleMembers)
    .values({ circleId, userId, role: 'miembro', displayRealName })
    .returning();
  return member;
}

export type LeaveResult = { ok: true } | { ok: false; message: string };

export async function leaveCircle(circleId: number, userId: number): Promise<LeaveResult> {
  const membership = await getMembership(circleId, userId);
  if (!membership) {
    return { ok: false, message: 'No sos parte de este círculo.' };
  }

  if (membership.role === 'coordinador') {
    const [[otherCoordinators], [otherMembers]] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(circleMembers)
        .where(and(
          eq(circleMembers.circleId, circleId),
          eq(circleMembers.role, 'coordinador'),
          ne(circleMembers.userId, userId),
        )),
      db.select({ count: sql<number>`count(*)::int` })
        .from(circleMembers)
        .where(and(eq(circleMembers.circleId, circleId), ne(circleMembers.userId, userId))),
    ]);

    if ((otherMembers?.count ?? 0) > 0 && (otherCoordinators?.count ?? 0) === 0) {
      return {
        ok: false,
        message: 'Sos el último coordinador del círculo. Pasale la coordinación a otra persona antes de irte.',
      };
    }
  }

  await db.delete(circleMembers).where(eq(circleMembers.id, membership.id));
  return { ok: true };
}

export interface MemberView {
  userId: number;
  displayName: string;
  role: 'coordinador' | 'miembro';
  joinedAt: string | null;
}

export async function listMembers(circleId: number): Promise<MemberView[]> {
  const rows = await db
    .select({
      userId: circleMembers.userId,
      role: circleMembers.role,
      displayRealName: circleMembers.displayRealName,
      joinedAt: circleMembers.joinedAt,
      name: users.name,
      username: users.username,
    })
    .from(circleMembers)
    .innerJoin(users, eq(circleMembers.userId, users.id))
    .where(eq(circleMembers.circleId, circleId))
    .orderBy(circleMembers.joinedAt);

  return rows.map((row) => ({
    userId: row.userId,
    displayName: row.displayRealName ? row.name : row.username,
    role: row.role,
    joinedAt: row.joinedAt,
  }));
}

const INVITE_DEFAULT_MAX_USES = 20;
const INVITE_DEFAULT_DAYS = 7;

export async function createInvite(
  circleId: number,
  userId: number,
  opts: { maxUses?: number; expiresInDays?: number } = {},
): Promise<CircleInvite> {
  const code = crypto.randomBytes(9).toString('base64url'); // 12 chars URL/QR-safe
  const expiresAt = new Date(
    Date.now() + (opts.expiresInDays ?? INVITE_DEFAULT_DAYS) * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [invite] = await db
    .insert(circleInvites)
    .values({
      circleId,
      code,
      createdBy: userId,
      maxUses: opts.maxUses ?? INVITE_DEFAULT_MAX_USES,
      uses: 0,
      expiresAt,
      revoked: false,
    })
    .returning();
  return invite;
}

export async function getInviteByCode(code: string): Promise<CircleInvite | undefined> {
  const [invite] = await db.select().from(circleInvites).where(eq(circleInvites.code, code)).limit(1);
  return invite;
}

export function isInviteUsable(invite: CircleInvite): { usable: boolean; message?: string } {
  if (invite.revoked) return { usable: false, message: 'Esa invitación fue revocada.' };
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
    return { usable: false, message: 'Esa invitación ya venció. Pedí una nueva.' };
  }
  if ((invite.uses ?? 0) >= (invite.maxUses ?? INVITE_DEFAULT_MAX_USES)) {
    return { usable: false, message: 'Esa invitación ya se usó todas las veces posibles. Pedí una nueva.' };
  }
  return { usable: true };
}

export async function incrementInviteUses(inviteId: number): Promise<void> {
  await db
    .update(circleInvites)
    .set({ uses: sql`${circleInvites.uses} + 1` })
    .where(eq(circleInvites.id, inviteId));
}

export async function createReport(circleId: number, userId: number, reason: string) {
  const [report] = await db
    .insert(circleReports)
    .values({ circleId, reportedBy: userId, reason })
    .returning();
  return report;
}

export async function listReports(status?: 'pendiente' | 'resuelto' | 'descartado') {
  const rows = await db
    .select({
      id: circleReports.id,
      circleId: circleReports.circleId,
      circleName: circles.name,
      reportedBy: circleReports.reportedBy,
      reason: circleReports.reason,
      status: circleReports.status,
      resolvedBy: circleReports.resolvedBy,
      resolvedAt: circleReports.resolvedAt,
      createdAt: circleReports.createdAt,
    })
    .from(circleReports)
    .innerJoin(circles, eq(circleReports.circleId, circles.id))
    .where(status ? eq(circleReports.status, status) : undefined)
    .orderBy(desc(circleReports.id))
    .limit(200);
  return rows;
}

export async function resolveReport(
  reportId: number,
  estado: 'resuelto' | 'descartado',
  adminId: number,
) {
  const [updated] = await db
    .update(circleReports)
    .set({ status: estado, resolvedBy: adminId, resolvedAt: new Date().toISOString() })
    .where(eq(circleReports.id, reportId))
    .returning();
  return updated;
}

/** IDs de círculos donde el usuario es miembro (para servicios hermanos). */
export async function circleIdsForUser(userId: number): Promise<number[]> {
  const rows = await db
    .select({ circleId: circleMembers.circleId })
    .from(circleMembers)
    .where(eq(circleMembers.userId, userId));
  return rows.map((r) => r.circleId);
}
