# El mandato (página 2.3) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `/mandato-vivo` en Papel y Tinta — página oscura + documento papel (preámbulo, diagnóstico, recursos, brechas, acciones) alimentado 100% por datos reales vía `GET /api/mandato/documento`, con los anexos `/mandato-vivo/pulso/:id` y `/mandato-vivo/propuesta/:id` como fichas del expediente — y matar el chrome glass de las tres páginas v1-port.

**Architecture:** Un endpoint de lectura nuevo (`features/mandato/{service,routes}.ts`, agregaciones sobre tablas existentes — cero migraciones) + composer fino `pages/ElMandatoVivo.tsx` con secciones en `pages/ElMandatoVivo/sections/` (patrón ElMapa). La honestidad por régimen (cero / palitos / porcentaje, umbral 100) vive en un módulo puro testeado (`mandato-regimen.ts`). Anexos = reescritura in-place de `PulsoDetail.tsx`/`PropuestaDetail.tsx` (rutas y lazy imports intactos).

**Tech Stack:** Express + Drizzle (`@v2/db`) + supertest (API) · React 18 + wouter + Tailwind (tokens papel §9b) + @tanstack/react-query + Vitest/Testing Library. Sin dependencias nuevas.

**Spec:** `docs/specs/2026-07-22-el-mandato-papel-y-tinta.md` — **todo el copy sale de ahí, carácter por carácter.**

## Global Constraints

- `v2/CLAUDE.md` completo: sin `any`, sin `console.*`, archivos ≤ 300 LOC, `pnpm verify` verde antes de cada commit, Conventional Commits con scope.
- `docs/design-system/README.md` v1.1 es ley. §9b: PROHIBIDO el hex literal en TSX — solo tokens (`bg-oscuro-barra`, `text-oscuro-meta`, `text-violeta-claro`, …). Enmiendas de ley en el mismo commit que el código que las necesita (este plan hace dos: `inkfill-claro` en §6 y `tono='claro'` de RitoTinta en §5 — Task 3).
- **Inventario API (verificado 2026-07-22):** existen `GET /api/analytics/voces-count`, `GET /api/pulso/:id`, `GET /api/propuestas/:id`, `POST /api/propuestas/:id/vote`, `GET /api/open-data/provinces`. El feature `apps/api/src/features/mandato/` NO tiene rutas (solo classifier + cron). **Un endpoint nuevo (`GET /api/mandato/documento`), cero cambios de esquema, cero migraciones** — agrega sobre `dreams`, `pulse_signals`, `proposals`, `geographic_locations`.
- **Cero datos hardcodeados:** toda cifra viene de la API; porcentajes SOLO con total ≥ 100 (`UMBRAL_PORCENTAJE`); nada de `NotaDemo` ni asteriscos. El sello EJEMPLO es marcador de régimen (N < 100), no permiso para inventar.
- Una conversación = una página: NO tocar `Home/*`, `LaIdea/*`, `ElMapa/*`, `PapelHeader/Footer`, `papel-nav.ts` (ya apunta a `/mandato-vivo`), ni `App.tsx` (rutas y lazy existen; los tres archivos de página conservan named + default export). Excepciones sancionadas: `apps/api/src/app.ts` (montar router, Task 1), `apps/web/src/index.css` + `components/papel/primitives/RitoTinta.tsx` (variante clara, aditiva, Task 3), `apps/web/src/lib/queries/mandato.ts` (extender, Task 2), `RootLayout.tsx` (Task 6).
- **Limpieza FK-safe explícita en tests de integración** (este repo ya se quemó — patrón `apps/api/tests/gamification-hooks.test.ts`): `dreams.userId` y `pulseSignals.userId` son `onDelete:'set null'` — borrar usuarios NO borra las filas; se juntan los ids insertados en arrays y se borran explícitos en `afterAll`, en orden hijo→padre: `proposalVotes` (por proposalId) → `proposals` → `pulseSignals` → `dreams` → `deleteTestUsers`. Nunca asertar conteos globales exactos (otras suites escriben en paralelo contra el mismo branch): siempre buscar los ids propios y usar `toBeGreaterThanOrEqual`.

---

### Task 1: API — `GET /api/mandato/documento` (servicio + ruta + test de integración)

**Files:**
- Create: `apps/api/src/features/mandato/service.ts`
- Create: `apps/api/src/features/mandato/routes.ts`
- Modify: `apps/api/src/app.ts` (import + `app.use('/api/mandato', mandatoRouter)` junto a los demás)
- Test: `apps/api/tests/mandato-documento.test.ts`

**Interfaces:**
- Produces: `GET /api/mandato/documento` → envelope `{ data: DocumentoMandato }` con la forma exacta de la spec («Datos reales»). La consume el hook `useMandatoDocumento()` (Task 2). Público, sin auth, GET (sin CSRF).

- [ ] **Step 1: Test de integración (falla primero).** `apps/api/tests/mandato-documento.test.ts`:

```ts
/**
 * Integration test for GET /api/mandato/documento — the aggregate feed
 * behind the El mandato document page (spec 2.3).
 *
 * FK-safe cleanup: dreams/pulse_signals userId are onDelete:'set null',
 * so deleting users does NOT delete rows — every inserted id is collected
 * and deleted explicitly in afterAll (gamification-hooks pattern).
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { dreams, eq, getDb, proposals, proposalVotes, pulseSignals, PulsoRepository } from '@v2/db';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

interface DocumentoBody {
  data: {
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
  };
}

dsuite('GET /api/mandato/documento', () => {
  const app = createApp();
  const request = supertest(app);
  const db = getDb();
  const marca = `mandato-doc-test-${String(Date.now())}`;
  const insertedDreamIds: number[] = [];
  const insertedSignalIds: number[] = [];
  const insertedProposalIds: number[] = [];
  let provinceId: number;

  beforeAll(async () => {
    // Provincia real del seed para el join de nombres.
    const provRes = await request.get('/api/open-data/provinces');
    const cordoba = (provRes.body.data.provinces as { id: number; name: string }[]).find(
      (p) => p.name === 'Córdoba',
    );
    if (!cordoba) throw new Error('Seed de provincias ausente en el branch de test');
    provinceId = cordoba.id;

    // Voces del mapa: 2 necesidades + 1 recurso en Córdoba → brecha 'alta'.
    const seedDreams = [
      { body: `Falta pediatra de guardia (${marca})`, category: 'necesidad', provinceId, status: 'approved' },
      { body: `Falta transporte nocturno (${marca})`, category: 'necesidad', provinceId, status: 'approved' },
      { body: `Ofrezco taller de oficios (${marca})`, category: 'recurso', provinceId, status: 'approved' },
    ];
    for (const d of seedDreams) {
      const [row] = await db.insert(dreams).values(d).returning();
      if (row) insertedDreamIds.push(row.id);
    }

    // Señal clasificada → tema del diagnóstico con cita.
    const [signal] = await db
      .insert(pulseSignals)
      .values({ body: `Seis meses para un turno (${marca})`, theme: 'salud_publica', sentiment: -0.6, provinceId, source: 'mandato_form' })
      .returning();
    if (signal) insertedSignalIds.push(signal.id);

    // Propuesta en votación → acciones.
    const repo = new PulsoRepository(db);
    const proposal = await repo.createProposal({
      title: `Red de turnos comunitarios (${marca})`,
      summary: 'Lista de espera paralela y auditable.',
      status: 'voting',
    });
    insertedProposalIds.push(proposal.id);
  });

  afterAll(async () => {
    // FK-safe, hijo → padre, ids explícitos (nunca deletes por rango).
    for (const id of insertedProposalIds) {
      await db.delete(proposalVotes).where(eq(proposalVotes.proposalId, id));
      await db.delete(proposals).where(eq(proposals.id, id));
    }
    for (const id of insertedSignalIds) {
      await db.delete(pulseSignals).where(eq(pulseSignals.id, id));
    }
    for (const id of insertedDreamIds) {
      await db.delete(dreams).where(eq(dreams.id, id));
    }
  });

  it('devuelve el agregado completo con los datos sembrados visibles', async () => {
    const res = await request.get('/api/mandato/documento');
    expect(res.status).toBe(200);
    const { data } = res.body as DocumentoBody;

    expect(new Date(data.generadoEl).getTime()).not.toBeNaN();

    // Registro por tipo (≥, hay datos de otras suites en el branch).
    expect(data.voces.total).toBeGreaterThanOrEqual(3);
    const necesidad = data.voces.porTipo.find((t) => t.tipo === 'necesidad');
    expect(necesidad?.total).toBeGreaterThanOrEqual(2);

    // Recursos con nombre de provincia resuelto.
    expect(data.recursos.total).toBeGreaterThanOrEqual(1);
    expect(data.recursos.porProvincia.some((r) => r.provincia === 'Córdoba')).toBe(true);

    // Brecha de Córdoba: piden ≥ 2, ofrecen ≥ 1.
    const brecha = data.brechas.find((b) => b.provincia === 'Córdoba');
    expect(brecha).toBeDefined();
    expect(brecha?.piden).toBeGreaterThanOrEqual(2);
    expect(brecha?.ofrecen).toBeGreaterThanOrEqual(1);

    // Diagnóstico: el tema sembrado aparece con su última señal citable.
    const tema = data.senales.temas.find((t) => t.tema === 'salud_publica');
    expect(tema).toBeDefined();
    expect(tema?.total).toBeGreaterThanOrEqual(1);
    expect(tema?.ultima).not.toBeNull();
    expect(data.senales.clasificadas).toBeGreaterThanOrEqual(1);

    // Acciones: la propuesta sembrada, con votos/apoyo numéricos.
    const accion = data.propuestas.find((p) => p.id === insertedProposalIds[0]);
    expect(accion).toMatchObject({ estado: 'voting', votos: 0, apoyo: 0 });
  });

  it('excluye sin_clasificar del diagnóstico y respeta los topes (temas ≤ 8, propuestas ≤ 5)', async () => {
    const res = await request.get('/api/mandato/documento');
    const { data } = res.body as DocumentoBody;
    expect(data.senales.temas.some((t) => t.tema === 'sin_clasificar')).toBe(false);
    expect(data.senales.temas.length).toBeLessThanOrEqual(8);
    expect(data.propuestas.length).toBeLessThanOrEqual(5);
    expect(data.propuestas.every((p) => p.estado === 'voting')).toBe(true);
  });
});
```

Run: `pnpm -C apps/api exec vitest run tests/mandato-documento.test.ts`
Esperado: FAIL — 404 (la ruta no existe).

- [ ] **Step 2: Implementar `apps/api/src/features/mandato/service.ts`:**

```ts
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
    if (fila.provincia === null) continue;
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
    temasRanked.flatMap((t) =>
      t.tema === null
        ? []
        : [
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
                .where(eq(pulseSignals.theme, t.tema as string))
                .orderBy(desc(pulseSignals.createdAt))
                .limit(1);
              return {
                tema: t.tema as string,
                total: t.total,
                ultima: ultima
                  ? { id: ultima.id, texto: ultima.texto, provincia: ultima.provincia, fecha: ultima.fecha.toISOString() }
                  : null,
              };
            })(),
          ],
    ),
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
```

(Verificar los imports reales de `@v2/db` — `Db`, helpers `desc/eq/sql` y el subpath
`@v2/db/schema` ya los usan `cron.ts` y los tests; ajustar si el barrel difiere.)

- [ ] **Step 3: Implementar `apps/api/src/features/mandato/routes.ts`:**

```ts
/**
 * Mandato HTTP slice — read-only.
 *
 *   GET /api/mandato/documento — the aggregate document feed (spec 2.3)
 */
import { getDb } from '@v2/db';
import { Router, type Router as RouterType } from 'express';

import { buildDocumento } from './service.js';

const router: RouterType = Router();

router.get('/documento', async (_req, res, next) => {
  try {
    res.json({ data: await buildDocumento(getDb()) });
  } catch (err) {
    next(err);
  }
});

export { router as mandatoRouter };
```

- [ ] **Step 4: Montar en `apps/api/src/app.ts`:** import `{ mandatoRouter } from './features/mandato/routes.js';` + `app.use('/api/mandato', mandatoRouter);` junto al bloque de routers existente. Nada más se toca del archivo.

- [ ] **Step 5: Correr y ver PASS.**

Run: `pnpm -C apps/api exec vitest run tests/mandato-documento.test.ts`
Esperado: PASS. Luego `pnpm verify` verde.

- [ ] **Step 6: Commit.**

```bash
git add apps/api/src/features/mandato/service.ts \
        apps/api/src/features/mandato/routes.ts \
        apps/api/src/app.ts \
        apps/api/tests/mandato-documento.test.ts
git commit -m "feat(api): GET /api/mandato/documento — agregado real del documento del mandato"
```

---

### Task 2: Web — régimen de honestidad + copy + hook del documento

**Files:**
- Create: `apps/web/src/pages/ElMandatoVivo/mandato-regimen.ts`
- Create: `apps/web/src/pages/ElMandatoVivo/el-mandato-data.ts`
- Modify: `apps/web/src/lib/queries/mandato.ts` (agregar `useMandatoDocumento` + tipos; lo existente no se toca)
- Test: `apps/web/src/pages/ElMandatoVivo/__tests__/mandato-regimen.test.ts`

**Interfaces:**
- Produces: `UMBRAL_PORCENTAJE`, `regimenDe()`, `formatoPorcentaje()`, `urgenciaDeBrecha()`, `humanizarTema()`, `plegarTipos()` (pliega categorías fuera de catálogo en `valor`) · `DocumentoMandato` (tipo cliente) + `useMandatoDocumento()` · constantes de copy y mapeos tipo→clase en `el-mandato-data.ts`. Consumen Tasks 3–5.

- [ ] **Step 1: Tests del módulo puro (fallan primero).** `mandato-regimen.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  formatoPorcentaje,
  humanizarTema,
  plegarTipos,
  regimenDe,
  UMBRAL_PORCENTAJE,
  urgenciaDeBrecha,
} from '../mandato-regimen';

describe('regimenDe', () => {
  it('0 → cero · 1..99 → palitos · ≥100 → porcentaje', () => {
    expect(regimenDe(0)).toBe('cero');
    expect(regimenDe(1)).toBe('palitos');
    expect(regimenDe(UMBRAL_PORCENTAJE - 1)).toBe('palitos');
    expect(regimenDe(UMBRAL_PORCENTAJE)).toBe('porcentaje');
  });
});

describe('formatoPorcentaje', () => {
  it('formatea es-AR con un decimal', () => {
    expect(formatoPorcentaje(184, 1000)).toBe('18,4%');
    expect(formatoPorcentaje(500, 1000)).toBe('50%');
  });
});

describe('urgenciaDeBrecha (fórmula publicada, no juicio editorial)', () => {
  it('ofrecen 0 → crítica · ofrecen < piden → alta · ofrecen ≥ piden → cubierta', () => {
    expect(urgenciaDeBrecha(380, 0)).toBe('crítica');
    expect(urgenciaDeBrecha(510, 120)).toBe('alta');
    expect(urgenciaDeBrecha(720, 890)).toBe('cubierta si se organiza');
  });
});

describe('humanizarTema', () => {
  it('snake_case → palabras', () => {
    expect(humanizarTema('salud_publica')).toBe('salud publica');
  });
});

describe('plegarTipos', () => {
  it('pliega null y categorías fuera de catálogo en valor, y ordena desc', () => {
    expect(
      plegarTipos([
        { tipo: 'basta', total: 5 },
        { tipo: null, total: 2 },
        { tipo: 'otra_cosa', total: 1 },
        { tipo: 'sueño', total: 9 },
      ]),
    ).toEqual([
      { tipo: 'sueño', total: 9 },
      { tipo: 'basta', total: 5 },
      { tipo: 'valor', total: 3 },
    ]);
  });
});
```

Run: `pnpm -C apps/web exec vitest run src/pages/ElMandatoVivo/__tests__/mandato-regimen.test.ts`
Esperado: FAIL — módulo inexistente.

- [ ] **Step 2: Implementar `mandato-regimen.ts`:**

```ts
/**
 * Régimen de honestidad del documento (spec 2.3): qué se puede mostrar
 * según cuántos datos reales hay. Puro y testeado — la política de
 * «cero porcentajes inventados» vive acá, no repartida por el JSX.
 */
import type { TipoVoz } from '~/components/papel/primitives';

export const UMBRAL_PORCENTAJE = 100;

export type Regimen = 'cero' | 'palitos' | 'porcentaje';

export function regimenDe(total: number): Regimen {
  if (total <= 0) return 'cero';
  return total < UMBRAL_PORCENTAJE ? 'palitos' : 'porcentaje';
}

/** «18,4%» — es-AR, un decimal máximo. Solo llamar en régimen 'porcentaje'. */
export function formatoPorcentaje(parte: number, total: number): string {
  return `${((parte / total) * 100).toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`;
}

export type Urgencia = 'crítica' | 'alta' | 'cubierta si se organiza';

/** Fórmula publicada de la urgencia de una brecha (spec §4.III). */
export function urgenciaDeBrecha(piden: number, ofrecen: number): Urgencia {
  if (ofrecen === 0) return 'crítica';
  if (ofrecen < piden) return 'alta';
  return 'cubierta si se organiza';
}

export function humanizarTema(tema: string): string {
  return tema.replaceAll('_', ' ');
}

const TIPOS: readonly TipoVoz[] = ['basta', 'sueño', 'necesidad', 'compromiso', 'recurso', 'valor'];

export interface ConteoTipo {
  tipo: TipoVoz;
  total: number;
}

/** Pliega categorías nulas o fuera de catálogo en 'valor' (criterio del mapa) y ordena desc. */
export function plegarTipos(porTipo: readonly { tipo: string | null; total: number }[]): ConteoTipo[] {
  const acumulado = new Map<TipoVoz, number>();
  for (const fila of porTipo) {
    const tipo = TIPOS.find((t) => t === fila.tipo) ?? 'valor';
    acumulado.set(tipo, (acumulado.get(tipo) ?? 0) + fila.total);
  }
  return [...acumulado.entries()]
    .map(([tipo, total]) => ({ tipo, total }))
    .sort((a, b) => b.total - a.total);
}
```

- [ ] **Step 3: Implementar `el-mandato-data.ts`** (copy estático de la spec + clases completas para que Tailwind compile):

```ts
import type { TipoVoz } from '~/components/papel/primitives';
import type { Urgencia } from './mandato-regimen';

/** Relleno de barra/palito por tipo, EN OSCURO ('valor' usa papel: tinta sobre tinta no se ve — Decisión 8). */
export const RELLENO_TIPO_OSCURO: Record<TipoVoz, string> = {
  basta: 'bg-sello',
  sueño: 'bg-violeta',
  necesidad: 'bg-ambar',
  compromiso: 'bg-verde',
  recurso: 'bg-cian',
  valor: 'bg-papel',
};

/** Borde + texto del tag de urgencia (sobre papel). */
export const CLASE_URGENCIA: Record<Urgencia, string> = {
  crítica: 'border-sello text-sello',
  alta: 'border-ambar text-ambar',
  'cubierta si se organiza': 'border-verde text-verde',
};

export const ORIGEN_SENAL: Record<string, string> = {
  mandato_form: 'formulario del mandato',
  community_post: 'publicación de la comunidad',
  comment: 'comentario',
};

export const ESTADO_PROPUESTA: Record<string, string> = {
  draft: 'en borrador',
  voting: 'en votación',
  accepted: 'aceptada',
  rejected: 'rechazada',
  archived: 'archivada',
};

/** Pasos de la convergencia (§2) y grilla «Cómo se usa» (§5) — copy VERBATIM de la spec. */
export const PASOS_CONVERGENCIA = [
  { num: '01', titulo: 'La voz entra por el mapa', cuerpo: 'Alguien suelta lo que no aguanta, lo que sueña o lo que ofrece. Queda pública desde el primer segundo.', link: { href: '/el-mapa', etiqueta: 'El mapa →' } },
  { num: '02', titulo: 'Una máquina la lee', cuerpo: 'Un clasificador la suma a su tema y le mide el peso. Sin mesa chica: nadie elige a mano qué pesa.' },
  { num: '03', titulo: 'El documento se reescribe', cuerpo: 'Cada voz nueva recalcula el registro, las brechas y el diagnóstico. Esta página es siempre la última revisión.' },
] as const;

export const COMO_SE_USA = [
  { titulo: 'Se firma', cuerpo: 'Cualquiera que aspire a un cargo puede adherir al documento vigente, en público. La firma no se exige: se registra.' },
  { titulo: 'Se mide', cuerpo: 'Cada prioridad sale con su número al lado: cuántas voces, de dónde, desde cuándo. Lo que se mide no se relativiza.' },
  { titulo: 'Se recuerda', cuerpo: 'Las voces quedan públicas y el documento a la vista. Lo dicho, dicho está: la memoria es la sanción.' },
] as const;
```

- [ ] **Step 4: Extender `lib/queries/mandato.ts`** (al final del archivo; lo existente intacto):

```ts
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

/** El agregado completo detrás del documento del mandato (spec 2.3). */
export function useMandatoDocumento() {
  return useQuery({
    queryKey: ['mandato', 'documento'],
    queryFn: () => api.get<DocumentoMandato>('/api/mandato/documento'),
  });
}
```

- [ ] **Step 5: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/ElMandatoVivo` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/ElMandatoVivo/mandato-regimen.ts \
        apps/web/src/pages/ElMandatoVivo/el-mandato-data.ts \
        apps/web/src/pages/ElMandatoVivo/__tests__/mandato-regimen.test.ts \
        apps/web/src/lib/queries/mandato.ts
git commit -m "feat(web): régimen de honestidad del mandato + hook del documento"
```

---

### Task 3: Web — `inkfill-claro` + portada + convergencia + registro (secciones oscuras)

**Files:**
- Modify: `apps/web/src/index.css` (keyframe `inkfill-claro` + wrapper `.anim-inkfill-claro`, dentro del esquema `prefers-reduced-motion` existente)
- Modify: `apps/web/src/components/papel/primitives/RitoTinta.tsx` (prop aditiva `tono?: 'tinta' | 'claro'`, default `'tinta'` — cero cambios de comportamiento para los llamadores existentes)
- Modify: `docs/design-system/README.md` (§6 keyframe nuevo + §5 nota RitoTinta — enmiendas de ley, mismo commit)
- Create: `apps/web/src/pages/ElMandatoVivo/sections/PortadaMandato.tsx`
- Create: `apps/web/src/pages/ElMandatoVivo/sections/ComoSeEscribe.tsx`
- Create: `apps/web/src/pages/ElMandatoVivo/sections/RegistroDelMapa.tsx`
- Create: `apps/web/src/pages/ElMandatoVivo/sections/Palitos.tsx` (tally §10.6 local, `aria-hidden`)
- Test: `apps/web/src/pages/ElMandatoVivo/sections/__tests__/RegistroDelMapa.test.tsx` (+ caso `tono` en `primitives.test.tsx`)

**Interfaces:**
- Consumes: `useVocesCount()` (portada) · `useMandatoDocumento()` (registro) · `RitoTinta`, `Kicker` · `plegarTipos`/`regimenDe`/`formatoPorcentaje` · `RELLENO_TIPO_OSCURO` · wrappers `.anim-growbar`/`.anim-semgrow`/`.anim-fadeup`.
- Produces: `PortadaMandato()`, `ComoSeEscribe()`, `RegistroDelMapa()`, `Palitos({ n, claseRelleno })` — sin props externas las secciones; las consume el composer (Task 6).

- [ ] **Step 1: Tests (fallan primero).** `RegistroDelMapa.test.tsx` — mockea `useMandatoDocumento` (patrón MapaArgentina); casos por régimen:
  - **cero:** data con `voces.total = 0` → texto exacto `Todavía no hay voces en el mapa. El registro arranca con la primera — puede ser la tuya.` y ninguna barra.
  - **palitos:** `voces.total = 16` con `porTipo` variado → aparecen los conteos mono (`9`, `5`…), NO aparece `%` en ningún texto (`expect(screen.queryByText(/%/)).not.toBeInTheDocument()`).
  - **porcentaje:** `voces.total = 1000`, basta 184 → aparece `18,4% · 184`.
  - **pie de fuente:** con N ≥ 1 aparece `fuente: 16 voces del mapa` (+ fecha formateada).
  En `primitives.test.tsx`, caso nuevo: `RitoTinta tono="claro"` renderiza letras con clase `anim-inkfill-claro` y signos con `text-violeta-claro`; sin `tono` conserva `anim-inkfill`/`text-violeta` (regresión).

- [ ] **Step 2: `index.css`** — keyframe + wrapper junto a los existentes (mismos valores que la ley: gris tenue → papel):

```css
@keyframes inkfill-claro {
  from { color: #5c594f; }
  to { color: #f2efe7; }
}
/* … dentro del bloque de wrappers .anim-* y de la guarda reduced-motion: */
.anim-inkfill-claro { animation: inkfill-claro 0.6s ease both; }
```

- [ ] **Step 3: `RitoTinta.tsx`** — prop `tono` (default `'tinta'`): elige `anim-inkfill` vs `anim-inkfill-claro` para letras y `text-violeta` vs `text-violeta-claro` para signos. Nada más cambia (delays, estructura, aria intactos).

- [ ] **Step 4: Enmiendas de ley (mismo commit).** En `docs/design-system/README.md`:
  - §6, lista de keyframes canónicos: agregar `inkfill-claro` + la nota: «En página oscura el rito entinta hacia papel (`inkfill-claro`); los signos ¡ ! caen en violeta-claro.»
  - §5 «Título entintado», al final del párrafo: «`tono='claro'` para páginas oscuras (El mandato): letras a `inkfill-claro`, signos en violeta-claro.»

- [ ] **Step 5: Implementar las secciones.** Esqueleto de `RegistroDelMapa.tsx` (las otras dos son composición directa del copy de la spec — portada con franja meta + kicker + H1 `RitoTinta tono="claro"` + lead con/sin cifra según `useVocesCount`; convergencia = `PASOS_CONVERGENCIA` en grilla de juntas):

```tsx
import { RELLENO_TIPO_OSCURO } from '../el-mandato-data';
import { formatoPorcentaje, plegarTipos, regimenDe } from '../mandato-regimen';

import { Palitos } from './Palitos';

import { useMandatoDocumento } from '~/lib/queries/mandato';
import { cn } from '~/lib/utils';

/** §3 de la spec — el registro del mapa: barras §13 en oscuro, por régimen N. */
export function RegistroDelMapa() {
  const documento = useMandatoDocumento();
  if (documento.isLoading || documento.isError) return null; // la card papel (Task 4) es la dueña de carga/error

  const data = documento.data;
  if (!data) return null;
  const tipos = plegarTipos(data.voces.porTipo);
  const regimen = regimenDe(data.voces.total);
  const maximo = tipos[0]?.total ?? 1;
  const fecha = new Date(data.generadoEl).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <section aria-labelledby="registro-titulo" className="mx-auto max-w-[1100px] px-10 pb-16 max-[560px]:px-5">
      <h2 id="registro-titulo" className="font-space text-oscuro-meta mb-6 text-[11px] uppercase tracking-[0.16em]">
        El registro del mapa — lo que la gente vino a decir
      </h2>

      {regimen === 'cero' ? (
        <p className="font-space text-oscuro-meta text-[13px]">
          Todavía no hay voces en el mapa. El registro arranca con la primera — puede ser la tuya.
        </p>
      ) : (
        <div className="flex flex-col gap-[18px]">
          {tipos.map(({ tipo, total }, i) => (
            <div key={tipo} className="grid grid-cols-[170px_1fr_auto] items-center gap-[18px] max-[560px]:grid-cols-[90px_1fr_auto]">
              <span className="font-space text-oscuro-texto text-[13px] uppercase tracking-[0.06em]">{tipo}</span>
              {regimen === 'porcentaje' ? (
                <div aria-hidden className="bg-oscuro-barra relative h-[22px]">
                  <div
                    className={cn('anim-growbar absolute inset-y-0 left-0', RELLENO_TIPO_OSCURO[tipo])}
                    style={{ width: `${String((total / maximo) * 100)}%`, animationDelay: `${String(i * 0.08)}s` }}
                  />
                </div>
              ) : (
                <Palitos n={total} claseRelleno={RELLENO_TIPO_OSCURO[tipo]} />
              )}
              <span className="font-space text-oscuro-meta text-right text-[13px]">
                {regimen === 'porcentaje' ? `${formatoPorcentaje(total, data.voces.total)} · ${total.toLocaleString('es-AR')}` : total.toLocaleString('es-AR')}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.voces.total >= 1 ? (
        <p className="font-space text-oscuro-tenue mt-4 text-[10px] uppercase tracking-[0.12em]">
          fuente: {data.voces.total.toLocaleString('es-AR')} voces del mapa · {fecha}
        </p>
      ) : null}
    </section>
  );
}
```

`Palitos.tsx`: recibe `n` (< 100 garantizado por régimen) y `claseRelleno`; dibuja
grupos de 4 barritas + 1 cruzada (`span`s de 2×18px, la quinta rotada −60°),
`anim-semgrow` escalonado, contenedor `aria-hidden` (el número mono de al lado es el
dato accesible).

- [ ] **Step 6: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/ElMandatoVivo src/components/papel/primitives` → PASS (incluye regresión de RitoTinta). `pnpm verify` verde.

```bash
git add apps/web/src/index.css \
        apps/web/src/components/papel/primitives/RitoTinta.tsx \
        apps/web/src/components/papel/primitives/primitives.test.tsx \
        docs/design-system/README.md \
        apps/web/src/pages/ElMandatoVivo/sections/PortadaMandato.tsx \
        apps/web/src/pages/ElMandatoVivo/sections/ComoSeEscribe.tsx \
        apps/web/src/pages/ElMandatoVivo/sections/RegistroDelMapa.tsx \
        apps/web/src/pages/ElMandatoVivo/sections/Palitos.tsx \
        apps/web/src/pages/ElMandatoVivo/sections/__tests__/RegistroDelMapa.test.tsx
git commit -m "feat(web): El mandato — portada oscura, convergencia y registro (§6 inkfill-claro)"
```

---

### Task 4: Web — el documento papel (sello EJEMPLO + secciones I–V + firma VISTO)

**Files:**
- Create: `apps/web/src/pages/ElMandatoVivo/sections/DocumentoMandato.tsx` (marco papel + cabecera + preámbulo + pie de fuentes + VISTO)
- Create: `apps/web/src/pages/ElMandatoVivo/sections/DocumentoSecciones.tsx` (I diagnóstico · II recursos · III brechas · IV acciones · V vigencia — sub-render del documento; separado para respetar ≤ 300 LOC)
- Test: `apps/web/src/pages/ElMandatoVivo/sections/__tests__/DocumentoMandato.test.tsx`

**Interfaces:**
- Consumes: `useMandatoDocumento()` · `Sello` · `regimenDe`/`formatoPorcentaje`/`urgenciaDeBrecha`/`humanizarTema` · `CLASE_URGENCIA`/`ESTADO_PROPUESTA` · `Palitos` · wrappers `.anim-stampin`/`.anim-blink-cursor`/`.anim-pulso-papel` · `Link` de wouter (anexos).
- Produces: `DocumentoMandato()` sin props — la consume el composer (Task 6). Única dueña de los estados carga/error de la query.

- [ ] **Step 1: Tests (fallan primero).** `DocumentoMandato.test.tsx` — mockea `useMandatoDocumento` y un `IntersectionObserver` de juguete (capturar el callback en `vi.stubGlobal`); helpers `docVacio()` / `docChico()` / `docRico()` que arman el payload por régimen. Casos:
  - **Cargando:** `isLoading` → microcopy `Cargando — menos que un trámite.` y ningún documento.
  - **Error:** `Esto se rompió. Lo decimos porque publicamos todo.` + botón `Probar de nuevo ↺`.
  - **N=0 (docVacio):** cabecera `Exp. sin voces todavía`; sello `Ejemplo` presente; diagnóstico dice `…no lo vamos a inventar.`; recursos `Nadie ofreció nada todavía…`; brechas `Eso también es un dato.`; firma `Ninguna voz todavía.`; sin `%` en el documento.
  - **N chico (docChico, p.ej. N=16, M=3, P=1):** sello `Ejemplo` presente con su línea (`Con 16 voces esto es el formato del mandato…`); diagnóstico muestra `3` + `señales` sin `%`; brecha con tag `crítica`/`alta` correcto (usa `urgenciaDeBrecha` real); acción con link a `/mandato-vivo/propuesta/{id}`; cita del diagnóstico linkea a `/mandato-vivo/pulso/{id}`.
  - **N rico (docRico, N=1000, M=500):** sello `Ejemplo` AUSENTE; el tema top muestra su `%` es-AR; pie de fuentes con las tres poblaciones y la fecha.
  - **VISTO:** al disparar el callback del observer con `isIntersecting: true` aparece `Visto` + `Documento auditado. Ahora sos testigo.` en un `role="status"`; un segundo disparo no duplica el sello.

- [ ] **Step 2: Implementar.** Estructura de `DocumentoMandato.tsx` (esqueleto):

```tsx
import { useEffect, useRef, useState } from 'react';

import { DocumentoSecciones } from './DocumentoSecciones';

import { Sello } from '~/components/papel/primitives';
import { useMandatoDocumento } from '~/lib/queries/mandato';
import { UMBRAL_PORCENTAJE } from '../mandato-regimen';

/** §4 de la spec — el documento papel sobre oscuro (única sombra del sistema). */
export function DocumentoMandato() {
  const documento = useMandatoDocumento();
  const [visto, setVisto] = useState(false);
  const firmaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firma = firmaRef.current;
    if (!firma || visto) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisto(true);
      },
      { threshold: 0.6 },
    );
    observer.observe(firma);
    return () => {
      observer.disconnect();
    };
  }, [visto, documento.data]);

  // …carga (skeleton .anim-pulso-papel + «Cargando — menos que un trámite.»)
  // …error («Esto se rompió…» + BotonPapel fantasma «Probar de nuevo ↺» → refetch())

  const data = documento.data;
  if (!data) return null;
  const esEjemplo = data.voces.total < UMBRAL_PORCENTAJE;

  return (
    <section aria-labelledby="documento-titulo" className="mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5">
      {/* encabezado mono oscuro-meta: «El documento completo · la revisión vigente» */}
      <div className="bg-papel text-tinta relative p-[52px_56px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] max-[560px]:p-6">
        {esEjemplo ? (
          <div className="absolute right-9 top-[30px]">
            <Sello color="rojo" rotate={6}>Ejemplo</Sello>
          </div>
        ) : null}
        {/* cabecera: Revisión continua · {fecha} — Exp. {N} voces / «Exp. sin voces todavía» */}
        <h3 id="documento-titulo" className="font-anton text-[clamp(30px,4.4vw,52px)] leading-none">
          Mandato ciudadano — Argentina
        </h3>
        {esEjemplo ? (
          <p className="font-space text-tinta-50 mt-3 text-[11px] uppercase tracking-[0.12em]">
            Con {data.voces.total.toLocaleString('es-AR')} voces esto es el formato del mandato, no el
            mandato. El de verdad se escribe con la tuya.
          </p>
        ) : null}
        {/* preámbulo (copy verbatim de la spec) */}
        <DocumentoSecciones data={data} firmaRef={firmaRef} />
        {visto ? (
          <div role="status" className="mt-6 flex items-center gap-4">
            <Sello color="verde" rotate={-4}>Visto</Sello>
            <span className="font-space text-tinta-50 text-[12px]">Documento auditado. Ahora sos testigo.</span>
          </div>
        ) : null}
        {/* pie de fuentes §13: voces · señales clasificadas · propuestas · generado {fecha} */}
      </div>
    </section>
  );
}
```

`DocumentoSecciones.tsx` recibe `{ data, firmaRef }` y renderiza I–V con el copy y los
regímenes EXACTOS de la spec (diagnóstico por `regimenDe(data.senales.clasificadas)`,
citas-link a anexos, chips de recursos, filas de brechas con `urgenciaDeBrecha` +
`CLASE_URGENCIA`, acciones con `ESTADO_PROPUESTA` y cierre `La siguiente la escribís
vos` + `▌` con `.anim-blink-cursor`, y el bloque V con `ref={firmaRef}`).

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/ElMandatoVivo` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/ElMandatoVivo/sections/DocumentoMandato.tsx \
        apps/web/src/pages/ElMandatoVivo/sections/DocumentoSecciones.tsx \
        apps/web/src/pages/ElMandatoVivo/sections/__tests__/DocumentoMandato.test.tsx
git commit -m "feat(web): El mandato — documento papel con regímenes de honestidad y sello VISTO"
```

---

### Task 5: Web — anexos del expediente (señal + propuesta, reescritura in-place)

**Files:**
- Rewrite: `apps/web/src/pages/PulsoDetail.tsx` (misma ruta `/mandato-vivo/pulso/:id`, named + default export intactos)
- Rewrite: `apps/web/src/pages/PropuestaDetail.tsx` (misma ruta `/mandato-vivo/propuesta/:id`, named + default export intactos)
- Create: `apps/web/src/pages/ElMandatoVivo/sections/MarcoAnexo.tsx` (marco compartido: página oscura + kicker `El mandato · anexo` + backlink `← Volver al mandato` + ficha papel ~720px)
- Test: `apps/web/src/pages/__tests__/PulsoDetail.test.tsx`
- Test: `apps/web/src/pages/__tests__/PropuestaDetail.test.tsx`

**Interfaces:**
- Consumes: `usePulsoById`/`usePropuestaById`/`useVotePropuesta` (existentes) · `useProvincias` (nombre de provincia client-side) · `useAuth` · `BotonPapel`, `Kicker` · `ORIGEN_SENAL`/`ESTADO_PROPUESTA` · `humanizarTema`.
- Produces: fichas papel-sobre-oscuro; el chrome glass de ambos archivos muere acá.

- [ ] **Step 1: Tests (fallan primero).** Mock de hooks (patrón de secciones) + `wouter` con ruta simulada. Casos señal: cargando (`Cargando — menos que un trámite.`) · 404 (`Esa señal no está.` + kicker `expediente extraviado`) · éxito (cuerpo `«{body}»`, `tema: sin clasificar todavía` cuando `theme` es null, `provincia: Córdoba` resuelta por `useProvincias`, `origen: formulario del mandato`). Casos propuesta: éxito con `en votación`, `{votos} votos · apoyo +{n}` · botones `A favor +1`/`En contra −1` deshabilitados sin sesión + línea `Para votar hace falta entrar…` con link a `/ingresar` · con sesión, click dispara `mutate(1)` / `mutate(-1)`.
- [ ] **Step 2: Implementar** `MarcoAnexo` + las dos páginas según la spec («Los anexos»), copy carácter por carácter. Sin `glass`, sin `gradient-text`, sin `iris-violet`, sin serif.
- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/PulsoDetail.test.tsx src/pages/__tests__/PropuestaDetail.test.tsx` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/PulsoDetail.tsx \
        apps/web/src/pages/PropuestaDetail.tsx \
        apps/web/src/pages/ElMandatoVivo/sections/MarcoAnexo.tsx \
        apps/web/src/pages/__tests__/PulsoDetail.test.tsx \
        apps/web/src/pages/__tests__/PropuestaDetail.test.tsx
git commit -m "feat(web): anexos del mandato — señal y propuesta como fichas del expediente"
```

---

### Task 6: Composer + `PAPEL_ROUTES` (con prefijos) + muerte del v1-port + prueba en navegador

**Files:**
- Rewrite: `apps/web/src/pages/ElMandatoVivo.tsx` (composer fino: Portada → ComoSeEscribe → RegistroDelMapa → DocumentoMandato → ComoSeUsa (grilla `COMO_SE_USA`) → CTA `Sumar mi voz al mandato →` a `/el-mapa`; named + default export intactos — el lazy de `App.tsx` no se toca)
- Create: `apps/web/src/pages/ElMandatoVivo/sections/ComoSeUsa.tsx` + CTA inline en el composer (BotonPapel violeta)
- Modify: `apps/web/src/layouts/RootLayout.tsx` (PAPEL_ROUTES + prefijos)
- Test: `apps/web/src/pages/__tests__/ElMandatoVivo.test.tsx` (composer con mocks; smoke: H1, las 5 secciones, CTA)

**Interfaces:**
- Produces: `/mandato-vivo` y sus anexos con chrome papel/oscuro; el v1-port muerto.

- [ ] **Step 1: Test del composer (falla primero):** renderiza con hooks mockeados; asserts: heading `El mandato.` (aria-label del H1), sección convergencia presente UNA vez (`Una máquina la lee`), CTA `Sumar mi voz al mandato →` con href `/el-mapa`, y **ausencia** de los textos v1 (`Mandá tu señal`, `Señales recientes`).
- [ ] **Step 2: Reescribir `ElMandatoVivo.tsx`** como composer ≤ 300 LOC. El formulario `POST /api/pulso`, el feed y el aside v1 mueren acá (inventario de la spec).
- [ ] **Step 3: `RootLayout.tsx`** — rutas exactas + prefijos (los anexos son dinámicos):

```tsx
const PAPEL_ROUTES = new Set(['/', '/la-idea', '/el-mapa', '/mandato-vivo']);
/** Prefijos papel para rutas dinámicas (anexos del mandato). */
const PAPEL_PREFIXES = ['/mandato-vivo/'];

// …
const esPapel = PAPEL_ROUTES.has(location) || PAPEL_PREFIXES.some((p) => location.startsWith(p));
if (esPapel) {
```

- [ ] **Step 4: Grep de muerte del chrome viejo (debe dar cero):**

```bash
grep -n "glass\|gradient-text\|iris-violet\|font-serif" \
  apps/web/src/pages/ElMandatoVivo.tsx \
  apps/web/src/pages/PulsoDetail.tsx \
  apps/web/src/pages/PropuestaDetail.tsx
```

- [ ] **Step 5: Suite completa + verificación.**

Run: `pnpm -C apps/web exec vitest run` → PASS (nada de Home/LaIdea/ElMapa se tocó). `pnpm verify` verde.

- [ ] **Step 6: Prueba en navegador (desktop + mobile, con capturas).** Levantar API + web contra el branch dev. Verificar: (a) portada oscura con rito claro y cifra real del lead; (b) registro por régimen real del branch (si hace falta, sembrar 2–3 voces de prueba vía `/el-mapa` — y **borrarlas de la DB dev al final por id**); (c) documento papel con sello EJEMPLO (el branch dev tiene N < 100), regímenes correctos, sin `%` bajo umbral; (d) scroll al pie → sello VISTO cae una vez; (e) click en una acción → anexo propuesta, voto gated sin sesión; (f) anexo señal por URL directa; (g) móvil 375px: 1 columna, targets ≥ 44px; (h) `prefers-reduced-motion`: página completa y quieta, VISTO sin animación.
- [ ] **Step 7: Commit.**

```bash
git add apps/web/src/pages/ElMandatoVivo.tsx \
        apps/web/src/pages/ElMandatoVivo/sections/ComoSeUsa.tsx \
        apps/web/src/pages/__tests__/ElMandatoVivo.test.tsx \
        apps/web/src/layouts/RootLayout.tsx
git commit -m "feat(web): El mandato papel en /mandato-vivo — documento real, anexos y v1-port muerto"
```

---

## Self-review

- **Cobertura de la spec:** endpoint agregado real + test FK-safe (T1) · régimen de honestidad puro + hook (T2) · portada/convergencia/registro + enmienda `inkfill-claro` (T3) · documento con EJEMPLO/VISTO y regímenes testeados 0/<100/≥100 (T4) · anexos con voto (T5) · composer + `PAPEL_ROUTES` con prefijos + greps + navegador + limpieza de datos de prueba (T6).
- **Cero migraciones:** verificado — todas las queries de T1 son `SELECT` sobre tablas e índices existentes; `territory_mandates` no se toca.
- **Consistencia de tipos:** `DocumentoMandato` existe dos veces por diseño (server en `service.ts`, cliente en `lib/queries/mandato.ts`) — misma forma, verificada por el test de integración; los tipos de régimen viven solo en `mandato-regimen.ts`; `TipoVoz` viene de primitives.
- **Riesgo señalado:** los imports exactos del barrel `@v2/db` (`Db`, `dreams`, `geographicLocations`) deben verificarse contra `packages/db/src/index.ts` al implementar T1 — el patrón de referencia es `features/mandato/cron.ts` y `analytics/routes.ts`.
- **Ley:** dos enmiendas (§6 keyframe, §5 nota RitoTinta) en el mismo commit que el código (T3); EJEMPLO y VISTO ya estaban en el catálogo §10.5 — no se inventan sellos.
