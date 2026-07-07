// server/services/dashboards-service.ts
// Agregados para los dashboards de la app: nacional, campañas, círculos,
// necesidades por zona y track record personal. Solo COUNT/GROUP BY — sin
// tablas de stats materializadas.
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  dreams,
  userCommitments,
  userResources,
  campaigns,
  campaignEntries,
  circles,
  circleMembers,
  type Campaign,
} from '@shared/schema';
import { parseFormSchema } from '../lib/campanas';
import { computeProgress, type CampaignProgress } from './campanas-service';

const WEEKS_BACK = 12;

// ── Nacional ──

export interface NacionalDashboard {
  totalsByTypeWeek: Array<{ week: string; type: string; count: number }>;
  provinceRanking: Array<{ province: string; count: number }>;
  activeCampaigns: number;
  generatedAt: string;
}

export async function computeNacional(): Promise<NacionalDashboard> {
  const since = new Date(Date.now() - WEEKS_BACK * 7 * 24 * 60 * 60 * 1000).toISOString();

  const weekExpr = (col: unknown) =>
    sql<string>`to_char(date_trunc('week', ${col}::timestamptz), 'YYYY-MM-DD')`;

  const [dreamWeeks, commitmentWeeks, resourceWeeks, dreamProvinces, commitmentProvinces, resourceProvinces, [activeCount]] =
    await Promise.all([
      db
        .select({ week: weekExpr(dreams.createdAt), type: dreams.type, count: sql<number>`count(*)::int` })
        .from(dreams)
        .where(sql`${dreams.createdAt}::timestamptz >= ${since}::timestamptz`)
        .groupBy(weekExpr(dreams.createdAt), dreams.type),
      db
        .select({ week: weekExpr(userCommitments.createdAt), count: sql<number>`count(*)::int` })
        .from(userCommitments)
        .where(sql`${userCommitments.createdAt}::timestamptz >= ${since}::timestamptz`)
        .groupBy(weekExpr(userCommitments.createdAt)),
      db
        .select({ week: weekExpr(userResources.createdAt), count: sql<number>`count(*)::int` })
        .from(userResources)
        .where(sql`${userResources.createdAt}::timestamptz >= ${since}::timestamptz`)
        .groupBy(weekExpr(userResources.createdAt)),
      db
        .select({ province: dreams.province, count: sql<number>`count(*)::int` })
        .from(dreams)
        .where(sql`${dreams.province} is not null`)
        .groupBy(dreams.province),
      db
        .select({ province: userCommitments.province, count: sql<number>`count(*)::int` })
        .from(userCommitments)
        .where(sql`${userCommitments.province} is not null`)
        .groupBy(userCommitments.province),
      db
        .select({ province: userResources.province, count: sql<number>`count(*)::int` })
        .from(userResources)
        .where(sql`${userResources.province} is not null`)
        .groupBy(userResources.province),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(campaigns)
        .where(eq(campaigns.status, 'activa')),
    ]);

  const totalsByTypeWeek: NacionalDashboard['totalsByTypeWeek'] = [
    ...dreamWeeks.map((r) => ({ week: r.week, type: r.type, count: r.count })),
    ...commitmentWeeks.map((r) => ({ week: r.week, type: 'compromiso', count: r.count })),
    ...resourceWeeks.map((r) => ({ week: r.week, type: 'recurso', count: r.count })),
  ].sort((a, b) => a.week.localeCompare(b.week) || a.type.localeCompare(b.type));

  const provinceTotals = new Map<string, number>();
  for (const rows of [dreamProvinces, commitmentProvinces, resourceProvinces]) {
    for (const row of rows) {
      if (!row.province) continue;
      provinceTotals.set(row.province, (provinceTotals.get(row.province) ?? 0) + row.count);
    }
  }
  const provinceRanking = Array.from(provinceTotals.entries())
    .map(([province, count]) => ({ province, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalsByTypeWeek,
    provinceRanking,
    activeCampaigns: activeCount?.count ?? 0,
    generatedAt: new Date().toISOString(),
  };
}

// ── Campaña ──

export interface CampaignDashboard extends CampaignProgress {
  title: string;
  type: Campaign['type'];
  deadline: string | null;
  perDay: Array<{ day: string; count: number }>;
  generatedAt: string;
}

export async function computeCampaignDashboard(campaign: Campaign): Promise<CampaignDashboard> {
  const dayExpr = sql<string>`to_char(${campaignEntries.createdAt}::timestamptz, 'YYYY-MM-DD')`;
  const [progress, perDayRows] = await Promise.all([
    computeProgress(campaign),
    db
      .select({ day: dayExpr, count: sql<number>`count(*)::int` })
      .from(campaignEntries)
      .where(eq(campaignEntries.campaignId, campaign.id))
      .groupBy(dayExpr)
      .orderBy(dayExpr),
  ]);

  return {
    ...progress,
    title: campaign.title,
    type: campaign.type,
    deadline: campaign.deadline,
    perDay: perDayRows.map((r) => ({ day: r.day, count: r.count })),
    generatedAt: new Date().toISOString(),
  };
}

// ── Círculo ──

export interface CircleDashboard {
  circleId: number;
  members: number;
  campaignsByStatus: Array<{ status: string; count: number }>;
  totalEntries: number;
  entriesLast7Days: number;
  generatedAt: string;
}

export async function computeCircleDashboard(circleId: number): Promise<CircleDashboard> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [[memberCount], campaignsByStatus, [entryTotals]] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(circleMembers)
      .where(eq(circleMembers.circleId, circleId)),
    db
      .select({ status: campaigns.status, count: sql<number>`count(*)::int` })
      .from(campaigns)
      .where(eq(campaigns.circleId, circleId))
      .groupBy(campaigns.status),
    db
      .select({
        total: sql<number>`count(*)::int`,
        lastWeek: sql<number>`count(*) filter (where ${campaignEntries.createdAt}::timestamptz >= ${since}::timestamptz)::int`,
      })
      .from(campaignEntries)
      .innerJoin(campaigns, eq(campaignEntries.campaignId, campaigns.id))
      .where(eq(campaigns.circleId, circleId)),
  ]);

  return {
    circleId,
    members: memberCount?.count ?? 0,
    campaignsByStatus: campaignsByStatus.map((r) => ({ status: r.status, count: r.count })),
    totalEntries: entryTotals?.total ?? 0,
    entriesLast7Days: entryTotals?.lastWeek ?? 0,
    generatedAt: new Date().toISOString(),
  };
}

// ── Necesidades por zona ──

export interface NecesidadesDashboard {
  province: string | null;
  city: string | null;
  /** Señales del Radar tipo "necesidad" en la zona */
  senalesNecesidad: number;
  /** Respuestas de opción más elegidas en consultas de la zona */
  topRespuestas: Array<{
    campaignId: number;
    campaignTitle: string;
    label: string;
    value: string;
    count: number;
  }>;
  generatedAt: string;
}

export async function computeNecesidades(province?: string, city?: string): Promise<NecesidadesDashboard> {
  const consultaCampaigns = await db
    .select({ id: campaigns.id, title: campaigns.title, formSchema: campaigns.formSchema })
    .from(campaigns)
    .where(eq(campaigns.type, 'consulta'))
    .orderBy(desc(campaigns.id))
    .limit(200);

  // key → {label} de los campos select, por campaña
  const selectFields = new Map<number, Map<string, string>>();
  for (const campaign of consultaCampaigns) {
    const schema = parseFormSchema(campaign.formSchema);
    if (!schema) continue;
    const fields = new Map<string, string>();
    for (const field of schema.fields) {
      if (field.type === 'select') fields.set(field.key, field.label);
    }
    if (fields.size > 0) selectFields.set(campaign.id, fields);
  }
  const titles = new Map(consultaCampaigns.map((c) => [c.id, c.title]));

  const campaignIds = Array.from(selectFields.keys());

  let topRespuestas: NecesidadesDashboard['topRespuestas'] = [];
  if (campaignIds.length > 0) {
    // Agregación de respuestas vía data::jsonb (una fila por par clave/valor)
    const geoFilter = sql.join(
      [
        sql`ce.campaign_id in (${sql.join(campaignIds.map((id) => sql`${id}`), sql`, `)})`,
        ...(province ? [sql`ce.province = ${province}`] : []),
        ...(city ? [sql`ce.city = ${city}`] : []),
      ],
      sql` and `,
    );

    const result = await db.execute(sql`
      select ce.campaign_id as campaign_id, kv.key as key, kv.value as value, count(*)::int as count
      from campaign_entries ce
      cross join lateral jsonb_each_text(ce.data::jsonb) kv
      where ${geoFilter}
      group by ce.campaign_id, kv.key, kv.value
      order by count desc
      limit 200
    `);

    const rows = (result as unknown as { rows?: Array<Record<string, unknown>> }).rows
      ?? (result as unknown as Array<Record<string, unknown>>);

    topRespuestas = (Array.isArray(rows) ? rows : [])
      .map((row) => ({
        campaignId: Number(row.campaign_id),
        key: String(row.key),
        value: String(row.value ?? ''),
        count: Number(row.count),
      }))
      .filter((row) => selectFields.get(row.campaignId)?.has(row.key) && row.value !== '')
      .slice(0, 20)
      .map((row) => ({
        campaignId: row.campaignId,
        campaignTitle: titles.get(row.campaignId) ?? '',
        label: selectFields.get(row.campaignId)?.get(row.key) ?? row.key,
        value: row.value,
        count: row.count,
      }));
  }

  const needConds = [
    eq(dreams.type, 'need' as const),
    ...(province ? [eq(dreams.province, province)] : []),
    ...(city ? [eq(dreams.city, city)] : []),
  ];
  const [needCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(dreams)
    .where(and(...needConds));

  return {
    province: province ?? null,
    city: city ?? null,
    senalesNecesidad: needCount?.count ?? 0,
    topRespuestas,
    generatedAt: new Date().toISOString(),
  };
}

// ── Mi aporte (track record personal — Proof-of-Output) ──

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

export async function computeMiAporte(userId: number): Promise<MiAporte> {
  const [[senales], [compromisos], [recursos], [entradas], [campanasCreadas], [circulosCount]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(dreams).where(eq(dreams.userId, userId)),
    db.select({ count: sql<number>`count(*)::int` }).from(userCommitments).where(eq(userCommitments.userId, userId)),
    db.select({ count: sql<number>`count(*)::int` }).from(userResources).where(eq(userResources.userId, userId)),
    db
      .select({
        count: sql<number>`count(*)::int`,
        verified: sql<number>`count(*) filter (where ${campaignEntries.status} = 'verificada')::int`,
      })
      .from(campaignEntries)
      .where(eq(campaignEntries.submittedBy, userId)),
    db.select({ count: sql<number>`count(*)::int` }).from(campaigns).where(eq(campaigns.createdBy, userId)),
    db.select({ count: sql<number>`count(*)::int` }).from(circleMembers).where(eq(circleMembers.userId, userId)),
  ]);

  return {
    senales: senales?.count ?? 0,
    compromisos: compromisos?.count ?? 0,
    recursos: recursos?.count ?? 0,
    entradas: entradas?.count ?? 0,
    entradasVerificadas: (entradas as { count: number; verified?: number } | undefined)?.verified ?? 0,
    campanasCreadas: campanasCreadas?.count ?? 0,
    circulos: circulosCount?.count ?? 0,
    generatedAt: new Date().toISOString(),
  };
}
