/**
 * Documento del mandato — read model (spec 2.3).
 *
 * Aggregates EXISTING tables only (dreams, pulse_signals, proposals,
 * geographic_locations). territory_mandates (the cron rollup) is
 * intentionally not used: it is per-province only and has no national
 * scope; this endpoint computes fresh national aggregates directly.
 * No schema changes, no migrations.
 */
import { desc, eq, sql } from '@v2/db';
import { dreams, geographicLocations, proposals, pulseSignals } from '@v2/db/schema';

import type { Db } from '@v2/db';

const TEMAS_TOPE = 8;
const PROPUESTAS_TOPE = 5;
const SIN_CLASIFICAR = 'sin_clasificar';

export interface DocumentoMandato {
  generadoEl: string;
  voces: { total: number; porTipo: { tipo: string | null; total: number }[] };
  recursos: { total: number; porProvincia: { provincia: string | null; total: number }[] };
  brechas: { provincia: string; piden: number; ofrecen: number }[];
  senales: {
    total: number;
    clasificadas: number;
    temas: {
      tema: string;
      total: number;
      ultima: { id: number; texto: string; provincia: string | null; fecha: string } | null;
    }[];
  };
  propuestas: { id: number; titulo: string; resumen: string; estado: string; votos: number; apoyo: number }[];
}

export async function buildDocumento(db: Db): Promise<DocumentoMandato> {
  // 1. Registro: voces aprobadas por tipo.
  const porTipo = await db
    .select({ tipo: dreams.category, total: sql<number>`count(*)::int` })
    .from(dreams)
    .where(eq(dreams.status, 'approved'))
    .groupBy(dreams.category)
    .orderBy(sql`count(*) desc`);
  const vocesTotal = porTipo.reduce((acc, t) => acc + t.total, 0);

  // 2. Recursos declarados, por provincia (nombre resuelto; null = sin provincia).
  const recursosPorProvincia = await db
    .select({ provincia: geographicLocations.name, total: sql<number>`count(*)::int` })
    .from(dreams)
    .leftJoin(geographicLocations, eq(dreams.provinceId, geographicLocations.id))
    .where(sql`${dreams.status} = 'approved' and ${dreams.category} = 'recurso'`)
    .groupBy(geographicLocations.name)
    .orderBy(sql`count(*) desc`);
  const recursosTotal = recursosPorProvincia.reduce((acc, r) => acc + r.total, 0);

  // 3. Brechas: necesidad vs recurso por provincia (solo con provincia).
  const nvsr = await db
    .select({
      provincia: geographicLocations.name,
      categoria: dreams.category,
      total: sql<number>`count(*)::int`,
    })
    .from(dreams)
    .innerJoin(geographicLocations, eq(dreams.provinceId, geographicLocations.id))
    .where(sql`${dreams.status} = 'approved' and ${dreams.category} in ('necesidad', 'recurso')`)
    .groupBy(geographicLocations.name, dreams.category);
  const porProvincia = new Map<string, { piden: number; ofrecen: number }>();
  for (const fila of nvsr) {
    const entry = porProvincia.get(fila.provincia) ?? { piden: 0, ofrecen: 0 };
    if (fila.categoria === 'necesidad') entry.piden += fila.total;
    if (fila.categoria === 'recurso') entry.ofrecen += fila.total;
    porProvincia.set(fila.provincia, entry);
  }
  const brechas = [...porProvincia.entries()]
    .filter(([, v]) => v.piden >= 1)
    .map(([provincia, v]) => ({ provincia, ...v }))
    .sort((a, b) => b.piden - b.ofrecen - (a.piden - a.ofrecen));

  // 4. Diagnóstico: temas clasificados + última señal citable por tema.
  const [senalesTotales] = await db
    .select({
      total: sql<number>`count(*)::int`,
      clasificadas: sql<number>`count(*) filter (where ${pulseSignals.theme} is not null and ${pulseSignals.theme} <> ${SIN_CLASIFICAR})::int`,
    })
    .from(pulseSignals);
  const temasRanked = await db
    .select({ tema: pulseSignals.theme, total: sql<number>`count(*)::int` })
    .from(pulseSignals)
    .where(sql`${pulseSignals.theme} is not null and ${pulseSignals.theme} <> ${SIN_CLASIFICAR}`)
    .groupBy(pulseSignals.theme)
    .orderBy(sql`count(*) desc`)
    .limit(TEMAS_TOPE);
  const temas = await Promise.all(
    temasRanked.flatMap((t) => {
      const tema = t.tema;
      if (tema === null) return [];
      return [
        (async () => {
          const [ultima] = await db
            .select({
              id: pulseSignals.id,
              texto: pulseSignals.body,
              provincia: geographicLocations.name,
              fecha: pulseSignals.createdAt,
            })
            .from(pulseSignals)
            .leftJoin(geographicLocations, eq(pulseSignals.provinceId, geographicLocations.id))
            .where(eq(pulseSignals.theme, tema))
            .orderBy(desc(pulseSignals.createdAt))
            .limit(1);
          return {
            tema,
            total: t.total,
            ultima: ultima
              ? { id: ultima.id, texto: ultima.texto, provincia: ultima.provincia, fecha: ultima.fecha.toISOString() }
              : null,
          };
        })(),
      ];
    }),
  );

  // 5. Acciones: propuestas en votación por apoyo.
  const enVotacion = await db
    .select()
    .from(proposals)
    .where(eq(proposals.status, 'voting'))
    .orderBy(desc(proposals.voteScore))
    .limit(PROPUESTAS_TOPE);

  return {
    generadoEl: new Date().toISOString(),
    voces: { total: vocesTotal, porTipo },
    recursos: { total: recursosTotal, porProvincia: recursosPorProvincia },
    brechas,
    senales: {
      total: senalesTotales?.total ?? 0,
      clasificadas: senalesTotales?.clasificadas ?? 0,
      temas,
    },
    propuestas: enVotacion.map((p) => ({
      id: p.id,
      titulo: p.title,
      resumen: p.summary,
      estado: p.status,
      votos: p.voteCount,
      apoyo: p.voteScore,
    })),
  };
}
