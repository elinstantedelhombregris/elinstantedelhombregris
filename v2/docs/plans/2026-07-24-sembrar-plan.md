# Sembrar (página 2.5) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `/sembrar` en Papel y Tinta — asistente de 3 pasos (stepper §5) →
certificado semilla con sello PLANTADA y edición impresa — sobre una tabla `semillas`
nueva con POST + count reales, devolver el tile «semillas plantadas» a la portada como
dato real (promesa de la card 2.0), y matar el v1-port `/la-semilla-de-basta` vía
redirect.

**Architecture:** Dominio DB nuevo (`packages/db`: schema + migración + repositorio) +
feature slice `apps/api/src/features/semillas/` (POST anónimo rate-limited + count,
allow-list CSRF) + página `pages/Sembrar.tsx` composer con secciones en
`pages/Sembrar/sections/` (patrón Planes/ElMandatoVivo): la máquina de estados del
asistente vive en `AsistenteSemilla`, el estado plantada/no-plantada en el composer
(con persistencia `localStorage`), y el certificado reusa el patrón de impresión de
2.4 tal cual (`.edicion-impresa` ya existe en `index.css` — verificado). Ruta nueva en
`App.tsx` (sancionado: no hay otra forma) + flip de `PAPEL_ROUTES` al final con estado
interino aceptado (orden 2.3/2.4).

**Tech Stack:** Drizzle + Neon (`@v2/db`) + Express + supertest (API) · React 18 +
wouter + Tailwind (tokens papel §9b) + @tanstack/react-query + Vitest/Testing Library.
Sin dependencias nuevas.

**Spec:** `docs/specs/2026-07-24-sembrar-papel-y-tinta.md` — **todo el copy sale de
ahí, carácter por carácter.**

## Global Constraints

- `v2/CLAUDE.md` completo: sin `any`, sin `console.*`, archivos ≤ 300 LOC, migración
  en el mismo PR que el cambio de esquema, `pnpm verify` verde antes de cada commit,
  Conventional Commits con scope.
- `docs/design-system/README.md` v1.1 es ley. §9b: PROHIBIDO el hex literal en TSX —
  solo tokens. Enmiendas de ley en el mismo commit que el código que las necesita
  (este plan hace DOS, ambas en Task 2: la receta del stepper en §5 — **verificado
  2026-07-24 que NO está documentado pese a la card 2.5 del master plan** — y el
  disparador nuevo del despertar en §10.7).
- **Cero datos hardcodeados:** el N° del certificado es el `id` real del 201; la fecha
  es `createdAt` de la base; el único agregado es `GET /api/semillas/count` y su única
  superficie es el tile de la portada. El asistente no muestra conteos.
- **Limpieza FK-safe explícita en tests de integración** (patrón
  `tests/gamification-hooks.test.ts` / `analytics-flows.test.ts`): `semillas.userId`
  es `onDelete:'set null'` — se juntan los ids insertados y se borran explícitos en
  `afterAll`. Aserciones relativas (`toBeGreaterThanOrEqual`, comparación contra un
  count del repo al mismo instante), jamás conteos globales exactos: otras suites
  escriben en paralelo contra el mismo branch.
- Una conversación = una página: NO tocar `LaIdea/*`, `ElMapa/*`, `ElMandatoVivo/*`,
  `Planes/*`, ni el resto de `Home/*`. **Excepciones sancionadas** (spec, «Ruta y
  navegación» + «La vuelta de las semillas»): `apps/api/src/app.ts` (montar router,
  T1) · `apps/api/src/middleware/csrf.ts` (entrada ANON_ALLOWED, T1) ·
  `packages/db/src/schema/index.ts` + `repositories/index.ts` + `drizzle.config.ts`
  (barrels del dominio nuevo, T1) · `apps/web/src/App.tsx` (ruta nueva T4; redirect +
  borrado del lazy T5) · `components/papel/papel-nav.ts` (solo `SEMBRAR_HREF` +
  href del item, T5) · `Home/sections/CtaBand.tsx` y `Home/sections/CifrasStrip.tsx`
  (+ sus tests, T5) · `layouts/papel-routes.ts` (T5) ·
  `docs/design-system/README.md` (enmiendas, T2).
- **Estado interino aceptado:** entre T4 y T5, `/sembrar` existe y funciona pero con
  el chrome v1 (el flip de `PAPEL_ROUTES` y el redirect llegan al final, mismo orden
  que 2.3/2.4). `/la-semilla-de-basta` sigue vivo hasta T5.
- **El patrón de impresión NO se re-deriva:** `.edicion-impresa` ya está en
  `index.css` y el chrome ya lleva `print:hidden` (2.4). Este plan solo aplica la
  clase + folio + `print:hidden` locales.

---

### Task 1: API — la semilla existe: tabla, migración, repositorio y feature slice

**Files:**
- Create: `packages/db/src/schema/semillas.ts`
- Modify: `packages/db/src/schema/index.ts` (export) · `packages/db/drizzle.config.ts` (agregar el archivo al array `schema`)
- Create: `packages/db/migrations/0011_*.sql` (generada por drizzle-kit — no se escribe a mano)
- Create: `packages/db/src/repositories/semillas.ts`
- Modify: `packages/db/src/repositories/index.ts` (export)
- Create: `apps/api/src/features/semillas/routes.ts`
- Modify: `apps/api/src/app.ts` (import + `app.use('/api/semillas', semillasRouter)` junto a los demás)
- Modify: `apps/api/src/middleware/csrf.ts` (ANON_ALLOWED: `{ method: 'POST', path: '/api/semillas' }`)
- Test: `apps/api/tests/semillas-flows.test.ts`

**Interfaces:**
- Produces: tabla `semillas` · `SemillasRepository { create, countApproved }` ·
  `POST /api/semillas` → `{ data: { id, createdAt } }` (201) ·
  `GET /api/semillas/count` → `{ data: { total } }`. Los consumen los hooks de T2 y el
  tile de T5.

- [ ] **Step 1: Test de integración (falla primero).** `apps/api/tests/semillas-flows.test.ts`:

```ts
/**
 * Integration tests for /api/semillas — el compromiso de tres frases (spec 2.5).
 *
 * FK-safe cleanup: semillas.userId es onDelete:'set null' — cada id insertado
 * se junta y se borra explícito en afterAll (patrón gamification-hooks).
 * Aserciones relativas: otras suites escriben en paralelo en el mismo branch.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { eq, getDb, semillas, SemillasRepository, sql } from '@v2/db';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Semillas flows', () => {
  const app = createApp();
  const request = supertest(app);
  const insertedIds: number[] = [];

  afterAll(async () => {
    const db = getDb();
    for (const id of insertedIds) {
      await db.delete(semillas).where(eq(semillas.id, id));
    }
  });

  describe('POST /api/semillas', () => {
    it('planta una semilla anónima — 201 con id y createdAt reales, nace aprobada', async () => {
      const stamp = String(Date.now());
      const res = await request.post('/api/semillas').send({
        basta: `Basta de prueba ${stamp}`,
        sueno: `Sueño de prueba ${stamp}`,
        compromiso: `Compromiso de prueba ${stamp}`,
      });
      expect(res.status).toBe(201);
      const { id, createdAt } = res.body.data as { id: number; createdAt: string };
      expect(Number.isInteger(id)).toBe(true);
      insertedIds.push(id);
      expect(new Date(createdAt).getTime()).not.toBeNaN();

      const [row] = await getDb().select().from(semillas).where(eq(semillas.id, id));
      expect(row?.status).toBe('approved');
      expect(row?.userId).toBeNull();
      expect(row?.basta).toBe(`Basta de prueba ${stamp}`);
    });

    it('trimmea las frases al guardar', async () => {
      const stamp = String(Date.now());
      const res = await request.post('/api/semillas').send({
        basta: `  con espacios ${stamp}  `,
        sueno: 'sueño',
        compromiso: 'compromiso',
      });
      expect(res.status).toBe(201);
      const id = res.body.data.id as number;
      insertedIds.push(id);
      const [row] = await getDb().select().from(semillas).where(eq(semillas.id, id));
      expect(row?.basta).toBe(`con espacios ${stamp}`);
    });

    it('rechaza frases vacías o pasadas de 280 — 400 VALIDATION_ERROR', async () => {
      const [vacia, larga] = await Promise.all([
        request.post('/api/semillas').send({ basta: '   ', sueno: 'x', compromiso: 'x' }),
        request.post('/api/semillas').send({ basta: 'x', sueno: 'y'.repeat(281), compromiso: 'x' }),
      ]);
      expect(vacia.status).toBe(400);
      expect(vacia.body.error.code).toBe('VALIDATION_ERROR');
      expect(larga.status).toBe(400);
      expect(larga.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/semillas/count', () => {
    it('cuenta solo aprobadas — pending excluida, aserción relativa', async () => {
      const repo = new SemillasRepository(getDb());
      const stamp = String(Date.now());
      const aprobada = await repo.create({
        basta: `b ${stamp}`, sueno: `s ${stamp}`, compromiso: `c ${stamp}`,
      });
      insertedIds.push(aprobada.id);
      const pendiente = await repo.create({
        basta: `b2 ${stamp}`, sueno: `s2 ${stamp}`, compromiso: `c2 ${stamp}`, status: 'pending',
      });
      insertedIds.push(pendiente.id);

      const [res, approvedTotal] = await Promise.all([
        request.get('/api/semillas/count'),
        repo.countApproved(),
      ]);
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(approvedTotal);
      expect(res.body.data.total as number).toBeGreaterThanOrEqual(1);

      // Prueba de exclusión en UN statement (snapshot único, inmune a suites paralelas).
      const [snapshot] = await getDb()
        .select({
          all: sql<number>`count(*)::int`,
          approved: sql<number>`count(*) filter (where ${semillas.status} = 'approved')::int`,
        })
        .from(semillas);
      expect((snapshot?.all ?? 0) - (snapshot?.approved ?? 0)).toBeGreaterThanOrEqual(1);
    });
  });
});
```

Run: `pnpm -C apps/api exec vitest run tests/semillas-flows.test.ts`
Esperado: FAIL — `semillas` no existe en `@v2/db` y la ruta da 404.

- [ ] **Step 2: Schema `packages/db/src/schema/semillas.ts`:**

```ts
/**
 * Semillas domain (spec 2.5 — Sembrar).
 *
 * Una semilla es el compromiso de tres frases que un visitante planta al
 * final del asistente: su basta, su sueño y su compromiso. Inmutable por
 * diseño (no hay update — se planta otra). Anónima por diseño: userId solo
 * si había sesión. Publicación inmediata con paridad dreams (status
 * default 'approved'); el conteo público filtra por status.
 */
import { index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

import { users } from './users';

export const semillas = pgTable(
  'semillas',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    basta: text('basta').notNull(),
    sueno: text('sueno').notNull(),
    compromiso: text('compromiso').notNull(),
    /** 'pending' | 'approved' | 'rejected' — paridad dreams; hoy se publica directo. */
    status: text('status').notNull().default('approved'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('semillas_status_idx').on(t.status)],
);

export type Semilla = typeof semillas.$inferSelect;
export type NewSemilla = typeof semillas.$inferInsert;
```

Export en `schema/index.ts` (`export * from './semillas.js';`) y agregar
`'./src/schema/semillas.ts'` al array `schema` de `drizzle.config.ts` (ambas cosas —
el config no lee el barrel, nota del propio archivo).

- [ ] **Step 3: Migración.** `pnpm -C packages/db db:generate` (crea
  `migrations/0011_*.sql` con el CREATE TABLE + índice) → revisar el SQL generado →
  `pnpm -C packages/db db:migrate` contra el branch dev. Jamás `db:push`.

- [ ] **Step 4: Repositorio `packages/db/src/repositories/semillas.ts`:**

```ts
/**
 * SemillasRepository — el contrato de tres frases (spec 2.5).
 * Inmutable: create + conteo público. Sin listados (nada los consume hoy;
 * no se construye API muerta).
 */
import { eq, sql } from 'drizzle-orm';

import { semillas } from '../schema/semillas.js';

import type { Db } from '../client.js';
import type { NewSemilla, Semilla } from '../schema/semillas.js';

export class SemillasRepository {
  constructor(private readonly db: Db) {}

  async create(input: NewSemilla): Promise<Semilla> {
    const [row] = await this.db.insert(semillas).values(input).returning();
    if (!row) throw new Error('Failed to insert semilla');
    return row;
  }

  /** Conteo público — solo aprobadas, mismo criterio que dreams.countApproved. */
  async countApproved(): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(semillas)
      .where(eq(semillas.status, 'approved'));
    return row?.count ?? 0;
  }
}
```

Export en `repositories/index.ts`.

- [ ] **Step 5: Feature slice `apps/api/src/features/semillas/routes.ts`:**

```ts
/**
 * Semillas HTTP slice — el compromiso de tres frases (spec 2.5).
 *
 *   POST /api/semillas        — plantar (anónimo ok; rate-limited; CSRF allow-listed)
 *   GET  /api/semillas/count  — conteo público (solo aprobadas)
 */
import { getDb, SemillasRepository } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { optionalAuthenticate } from '../../middleware/auth.js';
import { anonSubmitRateLimit } from '../../middleware/rate-limit.js';

const router: RouterType = Router();

const frase = (nombre: string) =>
  z
    .string()
    .trim()
    .min(1, `Tu ${nombre} no puede quedar vacío.`)
    .max(280, 'Máximo 280 caracteres. Una semilla es una frase, no un ensayo.');

const plantarSchema = z.object({
  basta: frase('basta'),
  sueno: frase('sueño'),
  compromiso: frase('compromiso'),
});

router.post('/', anonSubmitRateLimit(), optionalAuthenticate, async (req, res, next) => {
  try {
    const input = plantarSchema.parse(req.body);
    const repo = new SemillasRepository(getDb());
    const insertArgs: Parameters<typeof repo.create>[0] = { ...input };
    if (req.user) insertArgs.userId = req.user.id;
    const semilla = await repo.create(insertArgs);
    res.status(201).json({ data: { id: semilla.id, createdAt: semilla.createdAt.toISOString() } });
  } catch (err) {
    next(err);
  }
});

router.get('/count', async (_req, res, next) => {
  try {
    const total = await new SemillasRepository(getDb()).countApproved();
    res.json({ data: { total } });
  } catch (err) {
    next(err);
  }
});

export { router as semillasRouter };
```

- [ ] **Step 6: Montaje + CSRF.** En `app.ts`: import + `app.use('/api/semillas',
  semillasRouter)` junto a los demás. En `middleware/csrf.ts`, agregar a
  `ANON_ALLOWED`: `{ method: 'POST', path: '/api/semillas' }` (mutación anónima por
  diseño — misma justificación que `/api/open-data/dreams`; el techo es el rate
  limit).
- [ ] **Step 7: PASS + verificación + commit.**

Run: `pnpm -C apps/api exec vitest run tests/semillas-flows.test.ts` → PASS.
`pnpm verify` verde.

```bash
git add packages/db/src/schema/semillas.ts \
        packages/db/src/schema/index.ts \
        packages/db/drizzle.config.ts \
        packages/db/migrations/ \
        packages/db/src/repositories/semillas.ts \
        packages/db/src/repositories/index.ts \
        apps/api/src/features/semillas/routes.ts \
        apps/api/src/app.ts \
        apps/api/src/middleware/csrf.ts \
        apps/api/tests/semillas-flows.test.ts
git commit -m "feat(api,db): semillas — tabla, migración y feature slice con conteo público"
```

---

### Task 2: Web — data + hooks + portada + asistente (stepper §5) + enmiendas de ley

**Files:**
- Create: `apps/web/src/lib/queries/semillas.ts`
- Create: `apps/web/src/pages/Sembrar/sembrar-data.ts` (pasos + storage helpers)
- Create: `apps/web/src/pages/Sembrar/sections/PortadaSembrar.tsx`
- Create: `apps/web/src/pages/Sembrar/sections/AsistenteSemilla.tsx`
- Modify: `docs/design-system/README.md` (§5 stepper + §10.7 disparador — enmiendas de ley, mismo commit)
- Test: `apps/web/src/pages/Sembrar/__tests__/AsistenteSemilla.test.tsx`
- Test: `apps/web/src/pages/Sembrar/__tests__/sembrar-data.test.ts`

**Interfaces:**
- Consumes: `api` (`~/lib/api`), `despertar` (`~/lib/despertar`), `BotonPapel`,
  `Kicker`, `RitoTinta` (primitives).
- Produces: `useSemillasCount()` / `usePlantarSemilla()` ·
  `PASOS_SEMILLA` / `LARGO_MAXIMO` / `SemillaGuardada` /
  `guardarSemilla` / `leerSemilla` / `borrarSemilla` ·
  `<PortadaSembrar plantada>` · `<AsistenteSemilla onPlantada>`. Los consumen T3–T5.

- [ ] **Step 1: Tests (fallan primero).**

`sembrar-data.test.ts`:
  - Canon de pasos: `PASOS_SEMILLA` tiene exactamente 3 entradas con campos
    `basta`/`sueno`/`compromiso` en ese orden; títulos `Tu basta`/`Tu sueño`/
    `Tu compromiso`; `LARGO_MAXIMO === 280`.
  - Storage: `guardarSemilla` + `leerSemilla` hacen round-trip (jsdom localStorage,
    clave `basta_semilla`); `borrarSemilla` la elimina; `leerSemilla` devuelve `null`
    con storage vacío o JSON corrupto (no explota).

`AsistenteSemilla.test.tsx` (mockear `usePlantarSemilla` y `~/lib/despertar`):
  - Paso 1: heading `Tu basta`, línea `Paso 1 de 3`, «← Volver» deshabilitado,
    «Siguiente →» deshabilitado con textarea vacía.
  - Escribir texto → «Siguiente →» habilitado; click → `despertar()` llamado UNA vez,
    heading pasa a `Tu sueño` (`Paso 2 de 3`).
  - «← Volver» en paso 2 → vuelve a paso 1 **con el texto conservado**.
  - Segundo avance NO vuelve a llamar `despertar()` (solo el primer «Siguiente →»).
  - Paso 3: el botón dice `Plantar mi semilla`; click → `mutate` con las tres frases
    trimmeadas; `onSuccess` invoca `onPlantada` con `{ id, fecha, basta, sueno,
    compromiso }` del 201.
  - Error del POST: con `isError` y `ApiError` code `RATE_LIMITED` → muestra el
    mensaje del server; otro error → `Esto se rompió. Lo decimos porque publicamos
    todo. Probá de nuevo.` (role="alert"); el texto escrito sigue en el textarea.
  - Stepper: el contenedor de tramos es `aria-hidden`; hay exactamente 3 tramos; en el
    paso 2 los primeros 2 llevan `bg-violeta` y el tercero `bg-papel-borde`.
  - Pie: `Anónimo si querés · Sin registro · Sin spam` presente.

Run: `pnpm -C apps/web exec vitest run src/pages/Sembrar`
Esperado: FAIL — módulos inexistentes.

- [ ] **Step 2: `lib/queries/semillas.ts`:**

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '~/lib/api';

/**
 * Conteo público de semillas plantadas — alimenta el tile de la portada
 * (vuelta sancionada por la card 2.0; única superficie del agregado).
 */
export function useSemillasCount() {
  return useQuery({
    queryKey: ['semillas', 'count'],
    queryFn: () => api.get<{ total: number }>('/api/semillas/count'),
  });
}

export interface PlantarSemillaInput {
  basta: string;
  sueno: string;
  compromiso: string;
}

/**
 * La conversión secundaria del sitio. Endpoint anónimo (CSRF allow-listed,
 * rate limit del server como techo). Al 201 invalida ['semillas'] para que
 * el tile de la portada cuente la nueva.
 */
export function usePlantarSemilla() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlantarSemillaInput) =>
      api.post<{ id: number; createdAt: string }>('/api/semillas', input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['semillas'] });
    },
  });
}
```

- [ ] **Step 3: `sembrar-data.ts`** (pasos con el copy EXACTO de la spec §2 + storage):

```ts
/**
 * Sembrar (spec 2.5) — los tres pasos del asistente y la persistencia
 * local del certificado. El copy es el de la spec, carácter por carácter.
 */
export interface PasoSemilla {
  campo: 'basta' | 'sueno' | 'compromiso';
  titulo: string;
  guia: string;
  placeholder: string;
}

export const LARGO_MAXIMO = 280;

export const PASOS_SEMILLA: readonly PasoSemilla[] = [
  {
    campo: 'basta',
    titulo: 'Tu basta',
    guia: 'Lo que no estás dispuesto a aguantar ni un día más. Sin diplomacia.',
    placeholder: 'Basta de…',
  },
  {
    campo: 'sueno',
    titulo: 'Tu sueño',
    guia: 'El país que querrías si nadie te dijera que es imposible.',
    placeholder: 'Sueño con…',
  },
  {
    campo: 'compromiso',
    titulo: 'Tu compromiso',
    guia: 'Lo que vas a poner vos. Chiquito y real vale más que épico y falso.',
    placeholder: 'Me comprometo a…',
  },
];

export interface SemillaGuardada {
  id: number;
  /** ISO — createdAt de la base, jamás el reloj del cliente. */
  fecha: string;
  basta: string;
  sueno: string;
  compromiso: string;
}

const STORAGE_KEY = 'basta_semilla';

export function guardarSemilla(semilla: SemillaGuardada): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(semilla));
  } catch {
    // Sin storage el certificado dura la sesión — el registro vive en la base.
  }
}

export function leerSemilla(): SemillaGuardada | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' || parsed === null ||
      typeof (parsed as SemillaGuardada).id !== 'number' ||
      typeof (parsed as SemillaGuardada).basta !== 'string'
    ) {
      return null;
    }
    return parsed as SemillaGuardada;
  } catch {
    return null;
  }
}

export function borrarSemilla(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nada que borrar si no hay storage.
  }
}
```

- [ ] **Step 4: `PortadaSembrar.tsx`** — kicker (`Sembrar · 3 pasos · 2 minutos` /
  `Sembrar · plantada` según prop `plantada`), H1
  `<h1 aria-label="Tu semilla.">` + `RitoTinta lineas={['Tu semilla.']}`, lead solo si
  `!plantada` (copy §1 verbatim).
- [ ] **Step 5: `AsistenteSemilla.tsx`** (esqueleto — copy §2 verbatim):

```tsx
import { useRef, useState } from 'react';

import { LARGO_MAXIMO, PASOS_SEMILLA, type SemillaGuardada } from '../sembrar-data';

import { BotonPapel } from '~/components/papel/primitives';
import { ApiError } from '~/lib/api';
import { despertar } from '~/lib/despertar';
import { usePlantarSemilla } from '~/lib/queries/semillas';

interface AsistenteSemillaProps {
  onPlantada: (semilla: SemillaGuardada) => void;
}

/**
 * §2 de la spec — la máquina de estados del asistente (stepper §5,
 * enmienda de esta página). Tres frases, volver sin perder nada,
 * despertar() en el primer avance, POST al final.
 */
export function AsistenteSemilla({ onPlantada }: AsistenteSemillaProps) {
  const [paso, setPaso] = useState(0);
  const [frases, setFrases] = useState<string[]>(['', '', '']);
  const desperto = useRef(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const plantar = usePlantarSemilla();

  const actual = PASOS_SEMILLA[paso];
  if (!actual) return null;
  const texto = frases[paso] ?? '';
  const valido = texto.trim().length > 0;
  const ultimo = paso === PASOS_SEMILLA.length - 1;

  const enfocarTitulo = () => queueMicrotask(() => tituloRef.current?.focus());

  const avanzar = () => {
    if (!valido || plantar.isPending) return;
    if (!desperto.current) {
      desperto.current = true;
      despertar(); // §10.7 — primer paso del asistente (enmienda 2)
    }
    if (!ultimo) {
      setPaso(paso + 1);
      enfocarTitulo();
      return;
    }
    const [basta = '', sueno = '', compromiso = ''] = frases.map((f) => f.trim());
    plantar.mutate(
      { basta, sueno, compromiso },
      {
        onSuccess: ({ id, createdAt }) => {
          onPlantada({ id, fecha: createdAt, basta, sueno, compromiso });
        },
      },
    );
  };

  // …render: stepper aria-hidden (3 tramos, i <= paso ? bg-violeta : bg-papel-borde,
  // transition-colors duration-300) · card borde tinta bg-papel-crudo p-10
  // max-[560px]:p-6 · «Paso {paso + 1} de 3» mono · <h2 ref={tituloRef} tabIndex={-1}
  // id={`paso-${actual.campo}`}> Anton · guía · <textarea rows={3}
  // maxLength={LARGO_MAXIMO} aria-labelledby={`paso-${actual.campo}`}> · nav:
  // <button «← Volver» disabled={paso === 0}> + <BotonPapel variant="tinta"
  // disabled={!valido} loading={plantar.isPending}> {ultimo ? 'Plantar mi semilla'
  // : 'Siguiente →'} · error role="alert" (RATE_LIMITED → mensaje del server) ·
  // pie «Anónimo si querés · Sin registro · Sin spam».
}
```

(El manejo de error replica `PanelSoltarVoz`: `plantar.error instanceof ApiError &&
code === 'RATE_LIMITED'` → mensaje del server; si no, el copy §10.9 de la spec.)

- [ ] **Step 6: Enmiendas de ley (mismo commit).** En
  `docs/design-system/README.md`: (a) agregar al kit de formularios de §5 la receta
  «Stepper (asistente de pasos)» con el texto EXACTO de la spec («Enmiendas a la
  ley», punto 1); (b) en §10.7, agregar a los disparadores canónicos:
  `primer paso del asistente de Sembrar («Siguiente →» del paso 1)`.
- [ ] **Step 7: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/Sembrar` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/lib/queries/semillas.ts \
        apps/web/src/pages/Sembrar/sembrar-data.ts \
        apps/web/src/pages/Sembrar/sections/PortadaSembrar.tsx \
        apps/web/src/pages/Sembrar/sections/AsistenteSemilla.tsx \
        apps/web/src/pages/Sembrar/__tests__/AsistenteSemilla.test.tsx \
        apps/web/src/pages/Sembrar/__tests__/sembrar-data.test.ts \
        docs/design-system/README.md
git commit -m "feat(web): Sembrar — asistente de 3 pasos con stepper §5 (enmienda) y despertar"
```

---

### Task 3: Web — el certificado semilla (semgrow/leafpop + PLANTADA + edición impresa)

**Files:**
- Create: `apps/web/src/pages/Sembrar/sections/CertificadoSemilla.tsx` (incluye la
  semilla SVG como sub-componente local — si el archivo pasa de 300 LOC, extraer
  `SemillaSvg.tsx` al lado)
- Test: `apps/web/src/pages/Sembrar/__tests__/CertificadoSemilla.test.tsx`

**Interfaces:**
- Consumes: `Sello`, `BotonPapel` (primitives) · `SemillaGuardada`
  (`../sembrar-data`) · `.edicion-impresa` (ya en `index.css` — NO se toca) ·
  wrappers `.anim-semgrow`/`.anim-leafpop`/`.anim-stampin` (ya en `index.css`).
- Produces: `<CertificadoSemilla semilla onPlantarOtra>` — la consume el composer (T4).

- [ ] **Step 1: Tests (fallan primero).** `CertificadoSemilla.test.tsx` (render con
  una `SemillaGuardada` fija `{ id: 1234, fecha: '2026-07-24T12:00:00.000Z', … }`;
  mockear `navigator.clipboard.writeText` con `vi.stubGlobal`):
  - **Datos reales:** heading `Semilla N° 1.234 — 24 de julio de 2026` (formato
    es-AR); las tres frases entre «comillas angulares»; etiquetas `Mi basta` /
    `Mi sueño` / `Mi compromiso` con clases `text-sello` / `text-violeta` /
    `text-verde`.
  - **Sello:** texto `Plantada` presente, SIN `print:hidden` (se imprime).
  - **Edición impresa:** la card lleva la clase `edicion-impresa`; el folio
    `¡BASTA! · edición del lector ·` está en el DOM con clases `hidden print:block`;
    la fila de acciones y el cierre llevan `print:hidden`.
  - **SVG:** presente y `aria-hidden`; el tallo lleva `anim-semgrow`, las hojas
    `anim-leafpop`.
  - **Copiar:** click en `Copiar para compartir` → `writeText` llamado con el texto
    exacto de la spec (5 líneas, con `MI SEMILLA ¡BASTA! N° 1.234` y el link
    `/sembrar`); el botón muta a `✓ Copiada` (role="status") y vuelve tras 2s
    (fake timers).
  - **Plantar otra:** click llama `onPlantarOtra` una vez.
  - **Cierre:** `Guardala. Es tu contrato con vos…` + link
    `Ahora soltá tu voz en el mapa →` con `href="/el-mapa"`.
  - **Chrome muerto:** `container.innerHTML` sin `glass`, `gradient-text`,
    `iris-violet`, `font-serif`.

Run: `pnpm -C apps/web exec vitest run src/pages/Sembrar/__tests__/CertificadoSemilla.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar** (esqueleto — copy §3 verbatim de la spec):

```tsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';

import { type SemillaGuardada } from '../sembrar-data';

import { BotonPapel, Sello } from '~/components/papel/primitives';

/** La semilla del certificado — tallo semgrow + hojas leafpop (§6, ya en el toolkit). */
function SemillaSvg() {
  return (
    <svg width="120" height="150" viewBox="0 0 120 150" aria-hidden className="mx-auto block">
      <line
        x1="60" y1="150" x2="60" y2="62" strokeWidth="3"
        className="anim-semgrow text-tinta stroke-current"
        style={{ transformOrigin: '60px 150px', animationDuration: '0.9s', animationDelay: '0.2s' }}
      />
      <path
        d="M60 78 C 38 74 30 52 34 38 C 52 42 62 58 60 78 Z"
        className="anim-leafpop text-violeta fill-current"
        style={{ transformOrigin: '60px 78px', animationDuration: '0.6s', animationDelay: '1s' }}
      />
      <path
        d="M60 96 C 82 92 90 70 86 56 C 68 60 58 76 60 96 Z"
        className="anim-leafpop text-tinta fill-current"
        style={{ transformOrigin: '60px 96px', animationDuration: '0.6s', animationDelay: '1.25s' }}
      />
    </svg>
  );
}

const ETIQUETAS: { campo: keyof Pick<SemillaGuardada, 'basta' | 'sueno' | 'compromiso'>; label: string; clase: string }[] = [
  { campo: 'basta', label: 'Mi basta', clase: 'text-sello' },
  { campo: 'sueno', label: 'Mi sueño', clase: 'text-violeta' },
  { campo: 'compromiso', label: 'Mi compromiso', clase: 'text-verde' },
];

interface CertificadoSemillaProps {
  semilla: SemillaGuardada;
  onPlantarOtra: () => void;
}

/**
 * §3 de la spec — el certificado: la interacción firma de la página
 * (nacimiento de la semilla + sello PLANTADA) y el segundo lector con
 * edición impresa §10.8 del sistema (patrón 2.4, reusado tal cual).
 */
export function CertificadoSemilla({ semilla, onPlantarOtra }: CertificadoSemillaProps) {
  const [copiada, setCopiada] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  const numero = semilla.id.toLocaleString('es-AR');
  const fecha = new Date(semilla.fecha).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const copiar = () => {
    const texto = [
      `MI SEMILLA ¡BASTA! N° ${numero}`,
      `Mi basta: ${semilla.basta}`,
      `Mi sueño: ${semilla.sueno}`,
      `Mi compromiso: ${semilla.compromiso}`,
      `Plantá la tuya → ${window.location.origin}/sembrar`,
    ].join('\n');
    void navigator.clipboard.writeText(texto).then(() => {
      setCopiada(true);
      window.setTimeout(() => { setCopiada(false); }, 2000);
    }).catch(() => {
      // Sin permiso de portapapeles no se confirma lo que no pasó (§10.9).
    });
  };

  return (
    <div>
      <div className="mb-9 text-center"><SemillaSvg /></div>
      <div className="edicion-impresa border-tinta bg-papel-crudo relative border p-11 max-[560px]:p-6">
        <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
          ¡BASTA! · edición del lector · {fecha}
        </p>
        <div className="absolute right-7 top-[26px] max-[560px]:static max-[560px]:mb-4">
          <Sello color="violeta" rotate={6}>Plantada</Sello>
        </div>
        <h2
          ref={tituloRef}
          tabIndex={-1}
          className="font-space text-tinta-50 mb-5 text-xs uppercase tracking-[0.14em]"
        >
          Semilla N° {numero} — {fecha}
        </h2>
        <div className="flex flex-col gap-[22px]">
          {ETIQUETAS.map(({ campo, label, clase }) => (
            <div key={campo}>
              <div className={`font-space mb-1.5 text-[10px] uppercase tracking-[0.14em] ${clase}`}>
                {label}
              </div>
              <p className="font-anton text-2xl leading-tight">«{semilla[campo]}»</p>
            </div>
          ))}
        </div>
        <div className="border-papel-borde mt-7 flex flex-wrap items-center gap-3 border-t pt-[22px] print:hidden">
          <BotonPapel variant="tinta" onClick={copiar}>
            {copiada ? '✓ Copiada' : 'Copiar para compartir'}
          </BotonPapel>
          {copiada ? <span role="status" className="sr-only">Copiada al portapapeles</span> : null}
          <BotonPapel variant="fantasma" onClick={() => { window.print(); }}>
            Imprimir el certificado
          </BotonPapel>
          <button
            type="button"
            onClick={onPlantarOtra}
            className="font-space text-tinta-50 ml-auto min-h-[44px] text-xs uppercase tracking-[0.08em]"
          >
            Plantar otra
          </button>
        </div>
      </div>
      <div className="mt-6 text-center print:hidden">
        <p className="text-tinta-50 text-[15px] leading-relaxed">
          Guardala. Es tu contrato con vos. Cuando el movimiento te pese, volvé a leerla.
        </p>
        <Link
          href="/el-mapa"
          className="font-space text-violeta mt-3 inline-block text-xs font-bold uppercase tracking-[0.1em]"
        >
          Ahora soltá tu voz en el mapa →
        </Link>
      </div>
    </div>
  );
}
```

(Ajuste permitido: si `stroke-current`/`fill-current` + `text-*` no rinden en el SVG
como se espera, usar las utilidades `stroke-tinta`/`fill-violeta`/`fill-tinta` que
Tailwind genera desde la paleta — jamás hex inline.)

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/Sembrar` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/Sembrar/sections/CertificadoSemilla.tsx \
        apps/web/src/pages/Sembrar/__tests__/CertificadoSemilla.test.tsx
git commit -m "feat(web): certificado semilla — semgrow/leafpop, sello PLANTADA y edición impresa"
```

---

### Task 4: Composer `Sembrar.tsx` + ruta `/sembrar` en `App.tsx`

**Files:**
- Create: `apps/web/src/pages/Sembrar.tsx`
- Modify: `apps/web/src/App.tsx` (lazy `Sembrar` + `<Route path="/sembrar">` —
  **cambio sancionado por la spec**; `/la-semilla-de-basta` NO se toca todavía)
- Test: `apps/web/src/pages/__tests__/Sembrar.test.tsx`

**Interfaces:**
- Consumes: `PortadaSembrar`, `AsistenteSemilla`, `CertificadoSemilla`,
  `sembrar-data` (storage).
- Produces: página `/sembrar` navegable (con chrome v1 interino hasta T5).

- [ ] **Step 1: Tests (fallan primero).** `Sembrar.test.tsx` (mockear
  `usePlantarSemilla`; limpiar localStorage entre casos):
  - Sin semilla guardada: kicker `Sembrar · 3 pasos · 2 minutos`, heading nivel 1
    con aria-label `Tu semilla.`, asistente visible (heading `Tu basta`), certificado
    ausente.
  - `onPlantada` (simular el flujo: completar los 3 pasos con el mock resolviendo
    `{ id, createdAt }`) → certificado visible con `Semilla N° …`, asistente ausente,
    kicker `Sembrar · plantada`, y `localStorage['basta_semilla']` contiene el JSON.
  - Con semilla pre-guardada en localStorage: monta directo en certificado (la
    vuelta).
  - `Plantar otra` → asistente de nuevo en `Paso 1 de 3`, storage vacío.
  - **Ausencia** del v1: `queryByText(/Seis principios/)` null; sin `glass` ni
    `gradient-text` en `container.innerHTML`.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Sembrar.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar `Sembrar.tsx`** (composer fino, patrón Planes):

```tsx
import { useState } from 'react';

import { AsistenteSemilla } from './Sembrar/sections/AsistenteSemilla';
import { CertificadoSemilla } from './Sembrar/sections/CertificadoSemilla';
import { PortadaSembrar } from './Sembrar/sections/PortadaSembrar';
import {
  borrarSemilla,
  guardarSemilla,
  leerSemilla,
  type SemillaGuardada,
} from './Sembrar/sembrar-data';

/**
 * Sembrar — página 2.5 «Papel y Tinta»
 * (docs/specs/2026-07-24-sembrar-papel-y-tinta.md). Asistente de 3 pasos →
 * certificado semilla, con persistencia local de la vuelta. El chrome papel
 * lo pone RootLayout.
 */
export function Sembrar() {
  const [semilla, setSemilla] = useState<SemillaGuardada | null>(leerSemilla);

  const onPlantada = (s: SemillaGuardada) => {
    guardarSemilla(s);
    setSemilla(s);
  };
  const onPlantarOtra = () => {
    borrarSemilla();
    setSemilla(null);
  };

  return (
    <main className="mx-auto max-w-[900px] px-10 py-[72px] max-[560px]:px-5">
      <PortadaSembrar plantada={semilla !== null} />
      {semilla === null ? (
        <AsistenteSemilla onPlantada={onPlantada} />
      ) : (
        <CertificadoSemilla semilla={semilla} onPlantarOtra={onPlantarOtra} />
      )}
    </main>
  );
}

export default Sembrar;
```

- [ ] **Step 3: `App.tsx`** — lazy + ruta (patrón exacto del archivo):

```tsx
const Sembrar = lazy(async () => {
  const m = await import('~/pages/Sembrar');
  return { default: m.Sembrar };
});
// …
<Route path="/sembrar" component={Sembrar} />
```

(La ruta va junto a las del framework ¡BASTA!; `/la-semilla-de-basta` sigue viva hasta
T5 — estado interino aceptado.)

- [ ] **Step 4: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Sembrar.test.tsx src/pages/Sembrar` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/Sembrar.tsx \
        apps/web/src/pages/__tests__/Sembrar.test.tsx \
        apps/web/src/App.tsx
git commit -m "feat(web): Sembrar — composer y ruta /sembrar"
```

---

### Task 5: Flip — `PAPEL_ROUTES` + redirect + sweeps sancionados + prueba en navegador

**Files:**
- Modify: `apps/web/src/layouts/papel-routes.ts` (`/sembrar` al Set) + `apps/web/src/layouts/__tests__/papel-routes.test.ts`
- Modify: `apps/web/src/App.tsx` (`/la-semilla-de-basta` → `<Redirect to="/sembrar" replace />`, patrón `/la-vision`; borrar el lazy `LaSemillaDeBasta`)
- Delete: `apps/web/src/pages/LaSemillaDeBasta.tsx`
- Modify: `apps/web/src/components/papel/papel-nav.ts` (**sweep sancionado:** `SEMBRAR_HREF = '/sembrar'`; el item `Sembrar` de `PAPEL_NAV_ALL` pasa a `href: SEMBRAR_HREF`)
- Modify: `apps/web/src/components/__tests__/PapelHeader.test.tsx` (href esperado → `/sembrar`)
- Modify: `apps/web/src/pages/Home/sections/CtaBand.tsx` (**sweep sancionado:** link «Sembrar mi compromiso» → `/sembrar`) + `apps/web/src/pages/__tests__/Home.test.tsx`
- Modify: `apps/web/src/pages/Home/sections/CifrasStrip.tsx` (**sweep sancionado, la vuelta de la card 2.0:** tile `semillas plantadas` con `useSemillasCount()`, segundo en el orden, `grid-cols-4` → `grid-cols-5`) + `apps/web/src/pages/Home/sections/__tests__/CifrasStrip.test.tsx`

**Interfaces:**
- Produces: `/sembrar` con chrome papel; `/la-semilla-de-basta` redirige; el sitio
  entero (header, footer, menú móvil, CTA de Home) apunta a la ruta nueva; la portada
  muestra las semillas reales.

- [ ] **Step 1: Tests primero.** `papel-routes.test.ts`: `esRutaPapel('/sembrar')` →
  true · `esRutaPapel('/sembrarque')` → false (sin prefijo — no hay sub-rutas). FAIL →
  agregar `/sembrar` al Set → PASS.
- [ ] **Step 2: Redirect + borrado.** En `App.tsx`: borrar el lazy `LaSemillaDeBasta`
  y reemplazar su ruta por:

```tsx
<Route path="/la-semilla-de-basta">
  <Redirect to="/sembrar" replace />
</Route>
```

`git rm apps/web/src/pages/LaSemillaDeBasta.tsx`.

- [ ] **Step 3: Sweep de navegación.** `papel-nav.ts` (`SEMBRAR_HREF = '/sembrar'` +
  item con `href: SEMBRAR_HREF`) · `CtaBand.tsx` (`href="/sembrar"`) · actualizar los
  asserts de `PapelHeader.test.tsx` y `Home.test.tsx`. Cero cambios en
  `PapelHeader.tsx`/`PapelFooter.tsx` (consumen la constante).
- [ ] **Step 4: La vuelta del tile (test primero).** En `CifrasStrip.test.tsx`:
  mockear `useSemillasCount` junto a los mocks existentes; asserts: tile
  `semillas plantadas` con link a `/sembrar` y el total real formateado es-AR;
  skeleton cuando `isLoading`. FAIL → implementar: `const semillasQuery =
  useSemillasCount();` + tile segundo en `tiles` + `grid-cols-5`:

```tsx
{
  key: 'semillas',
  value: semillasQuery.data?.total,
  isLoading: semillasQuery.isLoading,
  label: 'semillas plantadas',
  href: '/sembrar',
},
```

→ PASS.

- [ ] **Step 5: Greps de control.**

```bash
# Solo el redirect de App.tsx puede nombrar la ruta vieja:
grep -rn "la-semilla-de-basta" apps/web/src
# Chrome muerto en la página nueva (debe dar cero):
grep -n "glass\|gradient-text\|iris-violet\|font-serif" \
  apps/web/src/pages/Sembrar.tsx apps/web/src/pages/Sembrar/sections/*.tsx
# Cero hex literal en el TSX nuevo (§9b — debe dar cero):
grep -n "#[0-9A-Fa-f]\{6\}" apps/web/src/pages/Sembrar.tsx \
  apps/web/src/pages/Sembrar/sections/*.tsx apps/web/src/pages/Sembrar/sembrar-data.ts
```

- [ ] **Step 6: Suite completa + verificación.**

Run: `pnpm -C apps/web exec vitest run` → PASS (nada de LaIdea/ElMapa/ElMandatoVivo/
Planes roto). `pnpm verify` verde.

- [ ] **Step 7: Prueba en navegador (desktop + mobile, con capturas).** Levantar API +
  web contra el branch dev. Con localStorage limpio (`basta_despierto` y
  `basta_semilla` borradas):
  - (a) `/sembrar` con chrome papel: rito de la tinta en «Tu semilla.», kicker, lead,
    stepper con el primer tramo violeta, card del paso 1.
  - (b) **Asistente:** «Siguiente →» deshabilitado con textarea vacía; escribir →
    habilitado; el primer avance **disuelve el velo del despertar** (1.4s); volver
    conserva el texto; los tramos se van entintando.
  - (c) **La firma:** plantar en el paso 3 — el tallo crece, las hojas brotan, el
    sello PLANTADA cae; certificado con `Semilla N° {id}` real y fecha de la base.
  - (d) **La vuelta:** recargar `/sembrar` → certificado directo; «Plantar otra» →
    asistente vacío en el paso 1.
  - (e) **Copiar** → `✓ Copiada` y el texto correcto en el portapapeles (pegarlo en
    algún lado para verificar las 5 líneas).
  - (f) **Print preview (Cmd+P) — captura obligatoria:** sin header/footer/grano,
    TODO en serifa, folio `¡BASTA! · edición del lector · {fecha}` arriba, sello
    PLANTADA y semilla impresos, sin botones ni cierre.
  - (g) `/la-semilla-de-basta` redirige a `/sembrar`; CTA del header «Sembrar tu
    voz», item del menú móvil, botón del footer y «Sembrar mi compromiso» de Home
    navegan a `/sembrar`.
  - (h) **Portada `/`:** tile «semillas plantadas» con el conteo real (con la
    plantada del paso (c) incluida — la invalidación de `['semillas']` la cuenta).
  - (i) Móvil 375px: 1 columna, sello del certificado no tapa el texto (variante
    estática <560), targets ≥ 44px.
  - (j) `prefers-reduced-motion`: semilla nacida crecida, sello puesto, tramos sin
    transición visible, cero animaciones.
  - (k) **Limpieza:** borrar de la DB dev por id las semillas de prueba plantadas.
- [ ] **Step 8: Commit.**

```bash
git add apps/web/src/layouts/papel-routes.ts \
        apps/web/src/layouts/__tests__/papel-routes.test.ts \
        apps/web/src/App.tsx \
        apps/web/src/components/papel/papel-nav.ts \
        apps/web/src/components/__tests__/PapelHeader.test.tsx \
        apps/web/src/pages/Home/sections/CtaBand.tsx \
        apps/web/src/pages/__tests__/Home.test.tsx \
        apps/web/src/pages/Home/sections/CifrasStrip.tsx \
        apps/web/src/pages/Home/sections/__tests__/CifrasStrip.test.tsx
git rm apps/web/src/pages/LaSemillaDeBasta.tsx
git commit -m "feat(web): Sembrar papel en /sembrar — redirect, semillas reales en la portada y verificación"
```

---

## Self-review

- **Cobertura de la spec:** tabla + migración + repo + slice con POST/count y test
  FK-safe (T1) · asistente con stepper §5, despertar en el primer avance y las DOS
  enmiendas de ley en el mismo commit (T2) · certificado con datos reales del 201,
  sello PLANTADA, copiar/imprimir/plantar-otra y edición impresa reusada AS-IS (T3) ·
  composer con persistencia localStorage + ruta nueva sancionada en App.tsx (T4) ·
  flip de rutas, redirect patrón `/la-vision`, sweep de navegación, la vuelta del
  tile semillas a la portada, greps y navegador con print preview (T5).
- **Cero datos inventados:** el asistente no muestra conteos; el N° es el id serial
  del 201; la fecha es `createdAt`; el único agregado (count) nace con endpoint +
  test y su única superficie es el tile de la portada. Ningún literal numérico en
  JSX.
- **Cero re-derivación del print:** `.edicion-impresa` y el `print:hidden` del chrome
  ya existen desde 2.4 (verificado en `index.css`); este plan solo aplica clase +
  folio + `print:hidden` locales — `index.css` y el chrome NO están en ningún
  `git add` de este plan.
- **Consistencia de tipos:** `SemillaGuardada` vive solo en `sembrar-data.ts` y lo
  consumen asistente, certificado y composer; `PlantarSemillaInput` solo en
  `lib/queries/semillas.ts`; los tipos de fila (`Semilla`/`NewSemilla`) solo en
  `@v2/db`. La forma del 201 (`{ id, createdAt }`) está fijada por el test de
  integración de T1 y la consume el mock de T2/T4.
- **Riesgos señalados:** (1) los imports exactos del barrel `@v2/db` (`semillas`,
  `SemillasRepository`, `sql`) dependen de los barrels de T1 — el patrón de
  referencia es `analytics-flows.test.ts`; (2) `stroke-current`/`fill-current` en el
  SVG: si no compilan como se espera, usar `stroke-tinta`/`fill-violeta` de la
  paleta (nota en T3, jamás hex); (3) `drizzle.config.ts` no lee el barrel — el
  archivo nuevo se agrega explícito o la migración sale vacía (paso propio en T1);
  (4) el timer de `✓ Copiada` necesita fake timers en el test (nota en T3); (5)
  StrictMode monta dos veces — el guard `desperto.current` evita doble `despertar()`
  en el mismo flujo (T2).
- **Ley:** dos enmiendas (stepper §5, disparador §10.7) en el mismo commit que el
  asistente que las necesita (T2). El hallazgo que las justifica quedó documentado en
  la spec: la card 2.5 del master plan dice «§5 stepper — now documented» pero el
  README v1.1 no lo contiene (grep 2026-07-24) — la enmienda cierra esa deriva.
  PLANTADA ya está en §10.5, `semgrow`/`leafpop` ya están en §6, §10.8 ya enumera el
  certificado: nada más se legisla.
- **Deuda observada, fuera de alcance:** `DEMO_VOCES_COUNT` sigue exportado en
  `papel-nav.ts` como fallback del header; su muerte es de la Fase 7 (grep-clean),
  no de esta página.
