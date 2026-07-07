// server/services/campanas-service.ts
// Acceso a datos de campañas de relevamiento/consulta y sus entradas.
// Toda la lógica vive acá — nada en storage.ts.
import { and, desc, eq, inArray, sql, type SQL } from 'drizzle-orm';
import { db } from '../db';
import {
  campaigns,
  campaignTemplates,
  campaignEntries,
  circles,
  circleMembers,
  users,
  type Campaign,
  type CampaignTemplate,
  type CampaignEntry,
} from '@shared/schema';
import type { CampaignStatus, CampaignFormSchema, CampaignEntryData } from '@shared/campaign-forms';
import type { CampaignLayer, CampaignLayerPoint } from '@shared/campaign-layers';
import { excerptSignalText } from '../lib/radar';
import { parseFormSchema, firstTextAnswer, type CrearCampanaInput } from '../lib/campanas';

const MAX_CAMPAIGN_RESULTS = 200;
const MAX_LAYER_POINTS = 5000;

// ── Plantillas ──

export async function listTemplates(): Promise<CampaignTemplate[]> {
  return db
    .select()
    .from(campaignTemplates)
    .where(eq(campaignTemplates.isActive, true))
    .orderBy(campaignTemplates.id);
}

export async function getTemplateById(id: number): Promise<CampaignTemplate | undefined> {
  const [template] = await db.select().from(campaignTemplates).where(eq(campaignTemplates.id, id)).limit(1);
  return template;
}

// ── Campañas ──

export async function createCampaign(
  circleId: number,
  input: CrearCampanaInput,
  formSchema: CampaignFormSchema,
  defaults: { category?: string | null; mapColor?: string | null; mapIcon?: string | null },
  userId: number,
): Promise<Campaign> {
  const [campaign] = await db
    .insert(campaigns)
    .values({
      circleId,
      templateId: input.templateId ?? null,
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      category: input.category ?? defaults.category ?? null,
      formSchema: JSON.stringify(formSchema),
      mapColor: input.mapColor ?? defaults.mapColor ?? null,
      mapIcon: input.mapIcon ?? defaults.mapIcon ?? null,
      status: 'borrador',
      targetEntries: input.targetEntries ?? null,
      deadline: input.deadline ?? null,
      targetProvince: input.targetProvince ?? null,
      targetCity: input.targetCity ?? null,
      targetLat: input.targetLat ?? null,
      targetLng: input.targetLng ?? null,
      targetRadiusKm: input.targetRadiusKm ?? null,
      createdBy: userId,
    })
    .returning();
  return campaign;
}

export interface CampaignFilters {
  status?: string;
  type?: string;
  province?: string;
  city?: string;
}

export interface CampaignSummary extends Campaign {
  circleName: string;
  entryCount: number;
}

export async function listCampaigns(filters: CampaignFilters): Promise<CampaignSummary[]> {
  const conds: SQL[] = [];
  const status = filters.status ?? 'activa';
  if (status !== 'todas') conds.push(eq(campaigns.status, status as CampaignStatus));
  if (filters.type) conds.push(eq(campaigns.type, filters.type as Campaign['type']));
  if (filters.province) {
    conds.push(sql`coalesce(${campaigns.targetProvince}, ${circles.province}) = ${filters.province}`);
  }
  if (filters.city) {
    conds.push(sql`coalesce(${campaigns.targetCity}, ${circles.city}) = ${filters.city}`);
  }

  const rows = await db
    .select({
      campaign: campaigns,
      circleName: circles.name,
      entryCount: sql<number>`(select count(*)::int from campaign_entries ce where ce.campaign_id = ${campaigns.id})`,
    })
    .from(campaigns)
    .innerJoin(circles, eq(campaigns.circleId, circles.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(campaigns.id))
    .limit(MAX_CAMPAIGN_RESULTS);

  return rows.map((r): CampaignSummary => ({ ...r.campaign, circleName: r.circleName, entryCount: r.entryCount }));
}

export async function getCampaignById(id: number): Promise<Campaign | undefined> {
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return campaign;
}

export async function getCampaignWithCircle(id: number): Promise<(CampaignSummary & { circleKind: string }) | undefined> {
  const [row] = await db
    .select({
      campaign: campaigns,
      circleName: circles.name,
      circleKind: circles.kind,
      entryCount: sql<number>`(select count(*)::int from campaign_entries ce where ce.campaign_id = ${campaigns.id})`,
    })
    .from(campaigns)
    .innerJoin(circles, eq(campaigns.circleId, circles.id))
    .where(eq(campaigns.id, id))
    .limit(1);
  if (!row) return undefined;
  return { ...row.campaign, circleName: row.circleName, circleKind: row.circleKind, entryCount: row.entryCount };
}

export async function updateCampaignStatus(id: number, estado: CampaignStatus): Promise<Campaign | undefined> {
  const [updated] = await db
    .update(campaigns)
    .set({ status: estado, updatedAt: new Date().toISOString() })
    .where(eq(campaigns.id, id))
    .returning();
  return updated;
}

// ── Entradas ──

export interface NewEntry {
  campaignId: number;
  submittedBy: number;
  anonymous: boolean;
  latitude: number;
  longitude: number;
  province: string | null;
  city: string | null;
  data: CampaignEntryData;
  photoUrl: string | null;
}

export async function createEntry(entry: NewEntry): Promise<CampaignEntry> {
  const [created] = await db
    .insert(campaignEntries)
    .values({
      campaignId: entry.campaignId,
      submittedBy: entry.submittedBy,
      anonymous: entry.anonymous,
      latitude: entry.latitude,
      longitude: entry.longitude,
      province: entry.province,
      city: entry.city,
      data: JSON.stringify(entry.data),
      photoUrl: entry.photoUrl,
      status: 'pendiente',
    })
    .returning();
  return created;
}

export async function getEntryById(id: number): Promise<CampaignEntry | undefined> {
  const [entry] = await db.select().from(campaignEntries).where(eq(campaignEntries.id, id)).limit(1);
  return entry;
}

export interface EntryView {
  id: number;
  latitude: number | null;
  longitude: number | null;
  province: string | null;
  city: string | null;
  data: CampaignEntryData | null;
  photoUrl: string | null;
  status: CampaignEntry['status'];
  createdAt: string | null;
  /** Solo para miembros del círculo; null si anónima o pedido sin membresía */
  submittedByName: string | null;
}

/**
 * Entradas paginadas. Los miembros ven quién cargó cada entrada (displayName
 * según displayRealName del círculo) salvo las anónimas; el resto recibe
 * todo anonimizado.
 */
export async function listEntries(
  campaignId: number,
  circleId: number,
  viewerIsMember: boolean,
  pagination: { limit: number; offset: number },
): Promise<{ entradas: EntryView[]; total: number }> {
  const [rows, [countRow]] = await Promise.all([
    db
      .select({
        entry: campaignEntries,
        submitterName: users.name,
        submitterUsername: users.username,
        submitterDisplayRealName: circleMembers.displayRealName,
      })
      .from(campaignEntries)
      .leftJoin(users, eq(campaignEntries.submittedBy, users.id))
      .leftJoin(
        circleMembers,
        and(eq(circleMembers.userId, campaignEntries.submittedBy), eq(circleMembers.circleId, circleId)),
      )
      .where(eq(campaignEntries.campaignId, campaignId))
      .orderBy(desc(campaignEntries.id))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(campaignEntries)
      .where(eq(campaignEntries.campaignId, campaignId)),
  ]);

  const entradas = rows.map((row): EntryView => {
    let submittedByName: string | null = null;
    if (viewerIsMember && !row.entry.anonymous && row.entry.submittedBy != null) {
      submittedByName = row.submitterDisplayRealName
        ? (row.submitterName ?? row.submitterUsername)
        : row.submitterUsername;
    }
    let data: CampaignEntryData | null = null;
    try {
      data = JSON.parse(row.entry.data);
    } catch {
      data = null;
    }
    return {
      id: row.entry.id,
      latitude: row.entry.latitude,
      longitude: row.entry.longitude,
      province: row.entry.province,
      city: row.entry.city,
      data,
      photoUrl: row.entry.photoUrl,
      status: row.entry.status,
      createdAt: row.entry.createdAt,
      submittedByName,
    };
  });

  return { entradas, total: countRow?.count ?? 0 };
}

export async function verifyEntry(entryId: number, verifierId: number): Promise<CampaignEntry | undefined> {
  const [updated] = await db
    .update(campaignEntries)
    .set({ status: 'verificada', verifiedBy: verifierId, verifiedAt: new Date().toISOString() })
    .where(eq(campaignEntries.id, entryId))
    .returning();
  return updated;
}

// ── Progreso ──

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

export async function computeProgress(campaign: Campaign): Promise<CampaignProgress> {
  const [[totals], byProvince, byCity] = await Promise.all([
    db
      .select({
        entries: sql<number>`count(*)::int`,
        verified: sql<number>`count(*) filter (where ${campaignEntries.status} = 'verificada')::int`,
      })
      .from(campaignEntries)
      .where(eq(campaignEntries.campaignId, campaign.id)),
    db
      .select({ province: campaignEntries.province, count: sql<number>`count(*)::int` })
      .from(campaignEntries)
      .where(and(eq(campaignEntries.campaignId, campaign.id), sql`${campaignEntries.province} is not null`))
      .groupBy(campaignEntries.province)
      .orderBy(desc(sql`count(*)`))
      .limit(30),
    db
      .select({ city: campaignEntries.city, count: sql<number>`count(*)::int` })
      .from(campaignEntries)
      .where(and(eq(campaignEntries.campaignId, campaign.id), sql`${campaignEntries.city} is not null`))
      .groupBy(campaignEntries.city)
      .orderBy(desc(sql`count(*)`))
      .limit(30),
  ]);

  const entries = totals?.entries ?? 0;
  const verified = totals?.verified ?? 0;

  return {
    campaignId: campaign.id,
    status: campaign.status,
    entries,
    targetEntries: campaign.targetEntries,
    progressPct: campaign.targetEntries
      ? Math.min(100, Math.round((entries / campaign.targetEntries) * 100))
      : null,
    verified,
    verifiedPct: entries > 0 ? Math.round((verified / entries) * 100) : 0,
    byProvince: byProvince
      .filter((r): r is { province: string; count: number } => Boolean(r.province))
      .map((r) => ({ province: r.province, count: r.count })),
    byCity: byCity
      .filter((r): r is { city: string; count: number } => Boolean(r.city))
      .map((r) => ({ city: r.city, count: r.count })),
  };
}

// ── Capas públicas del mapa (CERO identidad) ──

const LAYER_STATUSES: CampaignStatus[] = ['activa', 'verificacion', 'cerrada'];
const DEFAULT_LAYER_COLOR = '#7D5BDE';

export async function computeCampaignLayers(): Promise<{ layers: CampaignLayer[]; total: number }> {
  const visibleCampaigns = await db
    .select()
    .from(campaigns)
    .where(inArray(campaigns.status, LAYER_STATUSES))
    .orderBy(desc(campaigns.id))
    .limit(MAX_CAMPAIGN_RESULTS);

  if (visibleCampaigns.length === 0) return { layers: [], total: 0 };

  const entryRows = await db
    .select({
      id: campaignEntries.id,
      campaignId: campaignEntries.campaignId,
      latitude: campaignEntries.latitude,
      longitude: campaignEntries.longitude,
      province: campaignEntries.province,
      city: campaignEntries.city,
      status: campaignEntries.status,
      data: campaignEntries.data,
      createdAt: campaignEntries.createdAt,
    })
    .from(campaignEntries)
    .where(
      and(
        inArray(campaignEntries.campaignId, visibleCampaigns.map((c) => c.id)),
        sql`${campaignEntries.status} != 'rechazada'`,
        sql`${campaignEntries.latitude} is not null`,
        sql`${campaignEntries.longitude} is not null`,
      ),
    )
    .orderBy(desc(campaignEntries.id))
    .limit(MAX_LAYER_POINTS);

  const formSchemas = new Map<number, CampaignFormSchema | null>();
  for (const campaign of visibleCampaigns) {
    formSchemas.set(campaign.id, parseFormSchema(campaign.formSchema));
  }

  const pointsByCampaign = new Map<number, CampaignLayerPoint[]>();
  for (const row of entryRows) {
    if (row.latitude == null || row.longitude == null) continue;
    let data: CampaignEntryData | null = null;
    try {
      data = JSON.parse(row.data);
    } catch {
      data = null;
    }
    const rawText = firstTextAnswer(formSchemas.get(row.campaignId) ?? null, data);
    const point: CampaignLayerPoint = {
      id: row.id,
      lat: row.latitude,
      lng: row.longitude,
      province: row.province,
      city: row.city,
      status: row.status,
      excerpt: rawText ? excerptSignalText(rawText) : null,
      createdAt: row.createdAt,
    };
    const bucket = pointsByCampaign.get(row.campaignId);
    if (bucket) bucket.push(point);
    else pointsByCampaign.set(row.campaignId, [point]);
  }

  const layers: CampaignLayer[] = visibleCampaigns
    .map((campaign): CampaignLayer => ({
      campaignId: campaign.id,
      title: campaign.title,
      type: campaign.type,
      status: campaign.status,
      category: campaign.category,
      color: campaign.mapColor ?? DEFAULT_LAYER_COLOR,
      icon: campaign.mapIcon,
      points: pointsByCampaign.get(campaign.id) ?? [],
    }))
    .filter((layer) => layer.points.length > 0);

  const total = layers.reduce((acc, layer) => acc + layer.points.length, 0);
  return { layers, total };
}
