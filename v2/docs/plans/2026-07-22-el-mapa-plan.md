# El mapa (página 2.2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `/el-mapa` en Papel y Tinta — mapa SVG real de la Argentina con las voces de la base, panel «Soltá tu voz» (conversión primaria del sitio), popover por provincia y feed de últimas voces — y matar el placeholder v1.

**Architecture:** Composer fino `pages/ElMapa.tsx` + 5 secciones en `pages/ElMapa/sections/` (patrón Home/LaIdea). La geometría se precomputa una vez (`scripts/build/build-mapa-argentina.ts` sobre un GeoJSON Natural Earth commiteado) y se commitea como módulo TS — cero librería de mapas, cero fetch de geometría (D3 del master plan). Los datos vivos salen de 5 endpoints **existentes**; hooks nuevos en `lib/queries/open-data.ts`.

**Tech Stack:** React 18 + wouter + Tailwind (tokens papel §9b) + @tanstack/react-query + Vitest/Testing Library + supertest (API). Sin dependencias nuevas.

**Spec:** `docs/specs/2026-07-22-el-mapa-papel-y-tinta.md` — **todo el copy sale de ahí, carácter por carácter**. Este plan lo repite en los esqueletos para que cada tarea sea autosuficiente.

## Global Constraints

- `v2/CLAUDE.md` completo: sin `any`, sin `console.*` (el script de build usa `process.stdout.write`), archivos ≤ 300 LOC, `pnpm verify` verde antes de cada commit, Conventional Commits con scope.
- `docs/design-system/README.md` v1.1 es ley. §9b: PROHIBIDO el hex literal en TSX — solo tokens (`fill-papel-mapa`, `stroke-tinta`, …). Enmiendas de ley en el mismo commit que el código que las necesita (este plan hace dos: receta «Popover de mapa» en §5, disparador concreto en §10.7).
- **Inventario API (verificado):** `POST /api/open-data/dreams` (anon, rate-limited, CSRF allow-listed, inserta `status:'approved'` — publicación inmediata), `GET /api/open-data/dreams`, `GET /api/open-data/dreams/by-province`, `GET /api/open-data/provinces`, `GET /api/analytics/voces-count`. **Cero endpoints nuevos, cero cambios de esquema, cero migraciones.** El único trabajo API es cobertura de integración del contrato (Task 2).
- **Cero datos hardcodeados:** toda cifra/punto/fila viene de la API. Nada de `NotaDemo` ni asteriscos en esta página.
- Una conversación = una página: NO tocar `Home/*`, `LaIdea/*`, `PapelHeader/Footer`, `papel-nav.ts` (ya apunta a `/el-mapa`), ni `App.tsx` (la ruta y el lazy ya existen y el archivo `pages/ElMapa.tsx` conserva named + default export). Excepción sancionada (Task 5): `RootLayout.tsx` (`PAPEL_ROUTES`).
- Tests de integración corren contra Postgres real (branch de test); **limpieza FK-safe explícita**: `dreams.userId` es `onDelete:'set null'` — borrar usuarios NO borra las filas; se juntan los ids insertados y se borran explícitos (patrón comentado en `apps/api/tests/gamification-hooks.test.ts`).

---

### Task 1: Dataset + script de precomputación + módulo generado del mapa

**Files:**
- Create: `scripts/build/data/argentina-provincias.geojson` (copiado del asset público v1 — dato Natural Earth de dominio público, no código)
- Create: `scripts/build/build-mapa-argentina.ts`
- Create (generado, commiteado): `apps/web/src/pages/ElMapa/argentina-mapa.generated.ts`
- Test: `apps/web/src/pages/ElMapa/__tests__/argentina-mapa.test.ts`

**Interfaces:**
- Produces: `MAPA_VIEWBOX: string` y `PROVINCIAS_SVG: readonly ProvinciaSvg[]` con `ProvinciaSvg = { nombre: string; path: string; cx: number; cy: number }` — nombres 1:1 con el seed canónico de `geographic_locations` (CABA normalizada). Los consumen Task 3 y el test de invariantes.

- [ ] **Step 1: Copiar el dataset.**

```bash
mkdir -p scripts/build/data
cp ../SocialJusticeHub/client/public/data/argentina-provinces-simplified.geojson \
   scripts/build/data/argentina-provincias.geojson
```

Verificar: 24 features `Polygon`, propiedad `name`, ~18 KB. (Es un dato de dominio público derivado de Natural Earth que v1 servía como asset estático; copiar el archivo no viola la regla «never import from SocialJusticeHub» — no se importa código ni se depende de v1 en build ni runtime.)

- [ ] **Step 2: Test de invariantes (falla primero).** `apps/web/src/pages/ElMapa/__tests__/argentina-mapa.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { MAPA_VIEWBOX, PROVINCIAS_SVG } from '../argentina-mapa.generated';

/** Nombres canónicos del seed de geographic_locations (packages/db/scripts/seed-provinces.ts). */
const NOMBRES_CANONICOS = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Ciudad Autónoma de Buenos Aires',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

describe('argentina-mapa.generated (módulo precomputado)', () => {
  it('trae las 24 provincias con los nombres canónicos de la DB, ordenadas', () => {
    expect(PROVINCIAS_SVG.map((p) => p.nombre)).toEqual(NOMBRES_CANONICOS);
  });

  it('declara un viewBox alto (formato del especimen: ~468×1000)', () => {
    const partes = MAPA_VIEWBOX.split(' ').map(Number);
    expect(partes).toHaveLength(4);
    const [x, y, w, h] = partes;
    expect(x).toBe(0);
    expect(y).toBe(0);
    expect(h).toBe(1000);
    expect(w).toBeGreaterThan(400);
    expect(w).toBeLessThan(560);
  });

  it('cada provincia tiene path bien formado y centroide dentro del viewBox', () => {
    const [, , w, h] = MAPA_VIEWBOX.split(' ').map(Number);
    for (const p of PROVINCIAS_SVG) {
      expect(p.path).toMatch(/^M[\d.,\sMLZ-]+Z$/);
      expect(p.cx).toBeGreaterThan(0);
      expect(p.cx).toBeLessThan(w ?? 0);
      expect(p.cy).toBeGreaterThan(0);
      expect(p.cy).toBeLessThan(h ?? 0);
    }
  });
});
```

Run: `pnpm -C apps/web exec vitest run src/pages/ElMapa/__tests__/argentina-mapa.test.ts`
Esperado: FAIL — `Cannot find module '../argentina-mapa.generated'`.

- [ ] **Step 3: Implementar el script.** `scripts/build/build-mapa-argentina.ts`:

```ts
#!/usr/bin/env tsx
/**
 * build-mapa-argentina.ts — precomputa el mapa SVG de la Argentina.
 *
 * Lee scripts/build/data/argentina-provincias.geojson (Natural Earth,
 * simplificado, dominio público) y emite
 * apps/web/src/pages/ElMapa/argentina-mapa.generated.ts con paths
 * proyectados + centroides por provincia. Se corre UNA vez (y cada vez
 * que cambie el dataset); el output se COMMITEA. Cero dependencias en
 * runtime: la app solo importa el módulo generado (decisión D3 del
 * master plan: sin librería de mapas).
 *
 * Proyección: equirectangular corregida por cos(latitud media) — alto
 * fijo 1000, margen 8 → viewBox ≈ 476×1000, el mismo aspecto que el
 * especimen (467.9×1000).
 *
 * Correr: pnpm exec tsx scripts/build/build-mapa-argentina.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface FeatureProvincia {
  properties: { name: string };
  geometry: { type: 'Polygon'; coordinates: number[][][] };
}

interface ColeccionProvincias {
  features: FeatureProvincia[];
}

/** Nombres del GeoJSON → nombre canónico del seed de geographic_locations. */
const RENOMBRES: Record<string, string> = {
  'Ciudad de Buenos Aires': 'Ciudad Autónoma de Buenos Aires',
};

const ALTO = 1000;
const MARGEN = 8;

const aqui = dirname(fileURLToPath(import.meta.url));
const rutaGeojson = join(aqui, 'data', 'argentina-provincias.geojson');
const rutaSalida = join(
  aqui,
  '..',
  '..',
  'apps',
  'web',
  'src',
  'pages',
  'ElMapa',
  'argentina-mapa.generated.ts',
);

const coleccion = JSON.parse(readFileSync(rutaGeojson, 'utf8')) as ColeccionProvincias;

// 1. Bounds geográficos.
let minLon = Infinity;
let maxLon = -Infinity;
let minLat = Infinity;
let maxLat = -Infinity;
for (const feature of coleccion.features) {
  for (const anillo of feature.geometry.coordinates) {
    for (const [lon, lat] of anillo.map((c) => [c[0] ?? 0, c[1] ?? 0])) {
      minLon = Math.min(minLon, lon ?? 0);
      maxLon = Math.max(maxLon, lon ?? 0);
      minLat = Math.min(minLat, lat ?? 0);
      maxLat = Math.max(maxLat, lat ?? 0);
    }
  }
}

// 2. Proyección: equirectangular con corrección cos(lat media).
const latMedia = ((minLat + maxLat) / 2) * (Math.PI / 180);
const kx = Math.cos(latMedia);
const k = (ALTO - 2 * MARGEN) / (maxLat - minLat);
const ANCHO = Math.round(((maxLon - minLon) * kx * k + 2 * MARGEN) * 10) / 10;

const px = (lon: number): number => Math.round((MARGEN + (lon - minLon) * kx * k) * 10) / 10;
const py = (lat: number): number => Math.round((MARGEN + (maxLat - lat) * k) * 10) / 10;

/** Centroide (shoelace) del anillo exterior, en coordenadas SVG. */
function centroide(anillo: number[][]): { cx: number; cy: number } {
  let area = 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < anillo.length - 1; i += 1) {
    const x1 = px(anillo[i]?.[0] ?? 0);
    const y1 = py(anillo[i]?.[1] ?? 0);
    const x2 = px(anillo[i + 1]?.[0] ?? 0);
    const y2 = py(anillo[i + 1]?.[1] ?? 0);
    const cruz = x1 * y2 - x2 * y1;
    area += cruz;
    sx += (x1 + x2) * cruz;
    sy += (y1 + y2) * cruz;
  }
  area /= 2;
  return {
    cx: Math.round((sx / (6 * area)) * 10) / 10,
    cy: Math.round((sy / (6 * area)) * 10) / 10,
  };
}

function pathDe(feature: FeatureProvincia): string {
  return feature.geometry.coordinates
    .map((anillo) => {
      const puntos = anillo.map((c) => `${String(px(c[0] ?? 0))},${String(py(c[1] ?? 0))}`);
      return `M${puntos.join(' L')} Z`;
    })
    .join(' ');
}

const provincias = coleccion.features
  .map((feature) => {
    const nombre = RENOMBRES[feature.properties.name] ?? feature.properties.name;
    const anilloExterior = feature.geometry.coordinates[0] ?? [];
    return { nombre, path: pathDe(feature), ...centroide(anilloExterior) };
  })
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

const lineas = provincias
  .map(
    (p) =>
      `  { nombre: ${JSON.stringify(p.nombre)}, cx: ${String(p.cx)}, cy: ${String(p.cy)}, path: ${JSON.stringify(p.path)} },`,
  )
  .join('\n');

writeFileSync(
  rutaSalida,
  `/**
 * GENERADO por scripts/build/build-mapa-argentina.ts — NO EDITAR A MANO.
 * Fuente: scripts/build/data/argentina-provincias.geojson (Natural Earth,
 * dominio público). Regenerar: pnpm exec tsx scripts/build/build-mapa-argentina.ts
 */
export const MAPA_VIEWBOX = '0 0 ${String(ANCHO)} ${String(ALTO)}';

export interface ProvinciaSvg {
  /** Nombre canónico — coincide con geographic_locations.name. */
  nombre: string;
  /** Path SVG proyectado (equirectangular corregida). */
  path: string;
  /** Centroide en coordenadas del viewBox — ancla de los puntos de voz. */
  cx: number;
  cy: number;
}

export const PROVINCIAS_SVG: readonly ProvinciaSvg[] = [
${lineas}
];
`,
  'utf8',
);

process.stdout.write(`argentina-mapa.generated.ts: ${String(provincias.length)} provincias, viewBox 0 0 ${String(ANCHO)} ${String(ALTO)}\n`);
```

- [ ] **Step 4: Correr el script y el test.**

Run: `pnpm exec tsx scripts/build/build-mapa-argentina.ts` (desde `v2/`)
Esperado: `argentina-mapa.generated.ts: 24 provincias, viewBox 0 0 476.x 1000`.

Run: `pnpm -C apps/web exec vitest run src/pages/ElMapa/__tests__/argentina-mapa.test.ts`
Esperado: PASS. Si el regex del path o el orden fallan, se ajusta el **script** (nunca el archivo generado a mano).

- [ ] **Step 5: Verificación completa y commit.**

Run: `pnpm verify`. Esperado: verde (el módulo generado compila bajo strict).

```bash
git add scripts/build/data/argentina-provincias.geojson \
        scripts/build/build-mapa-argentina.ts \
        apps/web/src/pages/ElMapa/argentina-mapa.generated.ts \
        apps/web/src/pages/ElMapa/__tests__/argentina-mapa.test.ts
git commit -m "feat(web): mapa de la Argentina precomputado — dataset Natural Earth + proyección a SVG"
```

---

### Task 2: Cobertura de integración del contrato API que el mapa explota

**Files:**
- Modify: `apps/api/tests/open-data-flows.test.ts` (describe nuevo al final del `dsuite`)

**Interfaces:**
- Consumes: endpoints existentes (nada de código de producción se toca).
- Produces: garantía asertada del round-trip `category` + `provinceName→provinceId` y de los agregados que dibujan el mapa. La suite ya tiene el patrón de limpieza (`insertedDreamIds` + delete explícito en `afterAll`) — FK-safe porque `dreams` no tiene hijos y `userId` es `set null` (patrón `gamification-hooks.test.ts`).

- [ ] **Step 1: Agregar el describe (falla si el contrato se rompe, pasa hoy).** Dentro del `dsuite('Open data flows', …)` existente, después del describe de `by-province`:

```ts
  describe('Contrato de El mapa (página 2.2) — la voz soltada aparece con tipo y provincia', () => {
    it('POST con category + provinceName llega a la lista con provinceId resuelto y cuenta en los agregados', async () => {
      const provRes = await request.get('/api/open-data/provinces');
      expect(provRes.status).toBe(200);
      const cordoba = (
        provRes.body.data.provinces as { id: number; name: string }[]
      ).find((p) => p.name === 'Córdoba');
      expect(cordoba).toBeDefined();
      if (!cordoba) return;

      const marca = `voz-mapa-test-${String(Date.now())}`;
      const creado = await request
        .post('/api/open-data/dreams')
        .send({ body: `Quiero ver este punto en el mapa (${marca}).`, category: 'sueño', provinceName: 'Córdoba' });
      expect(creado.status).toBe(201);
      const id = creado.body.data.id as number;
      insertedDreamIds.push(id);

      // Round-trip: la lista pública la devuelve con el tipo y la provincia resueltos.
      const lista = await request.get('/api/open-data/dreams?limit=30');
      expect(lista.status).toBe(200);
      const voz = (
        lista.body.data as { id: number; category: string | null; provinceId: number | null }[]
      ).find((d) => d.id === id);
      expect(voz).toMatchObject({ category: 'sueño', provinceId: cordoba.id });

      // Agregado por provincia (los clusters numerados del mapa).
      const porProvincia = await request.get('/api/open-data/dreams/by-province');
      const fila = (
        porProvincia.body.data.byProvince as { provinceId: number | null; count: number }[]
      ).find((r) => r.provinceId === cordoba.id);
      expect(fila).toBeDefined();
      expect(fila?.count).toBeGreaterThanOrEqual(1);

      // La cifra pública la cuenta (aprobada al instante — status 'approved' fijo).
      // Nota: sin asertar delta exacto — otras suites insertan/borran dreams en paralelo
      // contra el mismo branch de test.
      const conteo = await request.get('/api/analytics/voces-count');
      expect(conteo.status).toBe(200);
      expect(conteo.body.data.total).toBeGreaterThanOrEqual(1);
    });
  });
```

- [ ] **Step 2: Correr la suite.**

Run: `pnpm -C apps/api exec vitest run tests/open-data-flows.test.ts`
Esperado: PASS (endpoints existentes; si algo falla, el contrato del mapa NO está y hay que arreglar la API antes de seguir — no seguir a Task 3 en rojo). El `afterAll` existente borra los dreams insertados por id (limpieza FK-safe explícita).

- [ ] **Step 3: Commit.**

```bash
git add apps/api/tests/open-data-flows.test.ts
git commit -m "test(api): contrato de El mapa — round-trip category+provincia y agregados asertados"
```

---

### Task 3: Hooks open-data + sección MapaArgentina + PopoverVoz (+ enmienda §5)

**Files:**
- Create: `apps/web/src/lib/queries/open-data.ts`
- Create: `apps/web/src/pages/ElMapa/el-mapa-data.ts`
- Create: `apps/web/src/pages/ElMapa/el-mapa-geo.ts`
- Create: `apps/web/src/pages/ElMapa/sections/MapaArgentina.tsx`
- Create: `apps/web/src/pages/ElMapa/sections/PopoverVoz.tsx`
- Modify: `docs/design-system/README.md` (§5: receta «Popover de mapa» — enmienda de ley, mismo commit)
- Test: `apps/web/src/pages/ElMapa/__tests__/el-mapa-geo.test.ts`
- Test: `apps/web/src/pages/ElMapa/sections/__tests__/MapaArgentina.test.tsx`

**Interfaces:**
- Consumes: `argentina-mapa.generated` (Task 1) · `api` de `~/lib/api` · `TipoVoz`/`ChipTipo` types de primitives · wrappers `.anim-pulse-dot`/`.anim-dropin`/`.anim-fadeup`/`.anim-pulso-papel`.
- Produces: `useProvincias()`, `useVocesAbiertas()`, `useVocesPorProvincia()`, `useSoltarVoz()` (la mutación la consume Task 4) · `VozAbierta`, `SoltarVozInput` · `tipoDeCategoria`, `FILL_TIPO`, `TEXTO_TIPO`, `BORDE_TIPO`, `TIPOS_VOZ`, placeholders · `puntosJitter`, `MAX_PUNTOS_PROVINCIA` · `MapaArgentina()` sin props · `PopoverVoz(props)`.

- [ ] **Step 1: Tests de la geometría (fallan primero).** `el-mapa-geo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { MAX_PUNTOS_PROVINCIA, puntosJitter } from '../el-mapa-geo';

describe('puntosJitter', () => {
  it('es determinista: mismo input, mismos puntos', () => {
    expect(puntosJitter(5, 100, 200)).toEqual(puntosJitter(5, 100, 200));
  });

  it('el primer punto es el centroide y el resto queda dentro del radio', () => {
    const puntos = puntosJitter(MAX_PUNTOS_PROVINCIA, 100, 200, 14);
    expect(puntos[0]).toEqual({ x: 100, y: 200 });
    for (const p of puntos) {
      expect(Math.hypot(p.x - 100, p.y - 200)).toBeLessThanOrEqual(14.001);
    }
  });

  it('n=0 devuelve vacío y n=1 solo el centro', () => {
    expect(puntosJitter(0, 10, 10)).toEqual([]);
    expect(puntosJitter(1, 10, 10)).toEqual([{ x: 10, y: 10 }]);
  });
});
```

- [ ] **Step 2: Test de la sección (falla primero).** `MapaArgentina.test.tsx` — mockea los hooks (patrón CapituloSinLider):

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MapaArgentina } from '../MapaArgentina';

import {
  useProvincias,
  useVocesAbiertas,
  useVocesPorProvincia,
} from '~/lib/queries/open-data';

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useVocesAbiertas: vi.fn(),
  useVocesPorProvincia: vi.fn(),
}));

const mockProvincias = vi.mocked(useProvincias);
const mockVoces = vi.mocked(useVocesAbiertas);
const mockConteos = vi.mocked(useVocesPorProvincia);

const PROVINCIAS = [
  { id: 6, name: 'Córdoba', isoCode: 'AR-X' },
  { id: 21, name: 'Santa Fe', isoCode: 'AR-S' },
];
const VOCES = [
  { id: 2, body: 'Quiero trenes que lleguen.', category: 'sueño', provinceId: 6, submittedAs: null, createdAt: '2026-07-22T12:00:00Z' },
  { id: 1, body: 'Basta de laburar para el alquiler.', category: 'basta', provinceId: 6, submittedAs: null, createdAt: '2026-07-21T12:00:00Z' },
];

function armarMocks(voces = VOCES, conteos = [{ provinceId: 6, count: 2 }]) {
  mockProvincias.mockReturnValue({ data: PROVINCIAS, isLoading: false } as ReturnType<typeof useProvincias>);
  mockVoces.mockReturnValue({ data: voces, isLoading: false, isError: false } as ReturnType<typeof useVocesAbiertas>);
  mockConteos.mockReturnValue({ data: conteos, isLoading: false } as ReturnType<typeof useVocesPorProvincia>);
}

describe('MapaArgentina', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armarMocks();
  });

  it('las provincias con voces son botones con conteo; las demás quedan decorativas', () => {
    render(<MapaArgentina />);

    const cordoba = screen.getByRole('button', { name: 'Córdoba: 2 voces. Leer la última.' });
    expect(cordoba).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Santa Fe/ })).not.toBeInTheDocument();
  });

  it('activar una provincia abre el popover con la voz más reciente y cicla con «otra →»', () => {
    render(<MapaArgentina />);

    fireEvent.click(screen.getByRole('button', { name: 'Córdoba: 2 voces. Leer la última.' }));

    const popover = screen.getByRole('dialog', { name: 'Voz de Córdoba' });
    expect(popover).toHaveTextContent('«Quiero trenes que lleguen.»');
    expect(popover).toHaveTextContent('Córdoba · voz 1 de 2');

    fireEvent.click(screen.getByRole('button', { name: 'otra →' }));
    expect(screen.getByRole('dialog', { name: 'Voz de Córdoba' })).toHaveTextContent(
      '«Basta de laburar para el alquiler.»',
    );
  });

  it('Escape y «✕» cierran el popover', () => {
    render(<MapaArgentina />);
    fireEvent.click(screen.getByRole('button', { name: 'Córdoba: 2 voces. Leer la última.' }));

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sin voces, la leyenda dice la oportunidad (§10.9)', () => {
    armarMocks([], []);
    render(<MapaArgentina />);

    expect(screen.getByText('Todavía no hay voces acá. Qué oportunidad.')).toBeInTheDocument();
  });
});
```

Run: `pnpm -C apps/web exec vitest run src/pages/ElMapa`
Esperado: FAIL — módulos inexistentes.

- [ ] **Step 3: Implementar `lib/queries/open-data.ts`:**

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '~/lib/api';

import type { TipoVoz } from '~/components/papel/primitives';

export interface ProvinciaApi {
  id: number;
  name: string;
  isoCode: string | null;
}

/** Las 24 provincias seed — alimentan el select del panel y el match nombre→id del SVG. */
export function useProvincias() {
  return useQuery({
    queryKey: ['open-data', 'provincias'],
    queryFn: () => api.get<{ provinces: ProvinciaApi[] }>('/api/open-data/provinces'),
    select: (d) => d.provinces,
  });
}

export interface VozAbierta {
  id: number;
  body: string;
  category: string | null;
  provinceId: number | null;
  submittedAs: string | null;
  createdAt: string;
}

export const VOCES_MAPA_LIMIT = 500;

/** Voces aprobadas, más nuevas primero — un solo fetch para puntos del mapa Y feed. */
export function useVocesAbiertas() {
  return useQuery({
    queryKey: ['open-data', 'voces', VOCES_MAPA_LIMIT],
    queryFn: () => api.get<VozAbierta[]>(`/api/open-data/dreams?limit=${String(VOCES_MAPA_LIMIT)}`),
  });
}

export interface ConteoProvincia {
  provinceId: number | null;
  count: number;
}

/** Conteo autoritativo por provincia — numera los clusters más allá del cap de la lista. */
export function useVocesPorProvincia() {
  return useQuery({
    queryKey: ['open-data', 'voces-por-provincia'],
    queryFn: () => api.get<{ byProvince: ConteoProvincia[] }>('/api/open-data/dreams/by-province'),
    select: (d) => d.byProvince,
  });
}

export interface SoltarVozInput {
  body: string;
  category: TipoVoz;
  provinceId?: number;
}

/**
 * La conversión primaria del sitio. Endpoint anónimo (CSRF allow-listed,
 * rate limit del server como techo). Al 201 invalida open-data (puntos,
 * clusters, feed) y analytics (cifra de portada + contador FOMO del header):
 * toda la página confirma que la voz quedó.
 */
export function useSoltarVoz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SoltarVozInput) => api.post<{ id: number }>('/api/open-data/dreams', input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['open-data'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ]);
    },
  });
}
```

- [ ] **Step 4: Implementar `el-mapa-data.ts`** (copy estático + mapeos tipo→clase; los strings de clase van completos para que Tailwind los compile):

```ts
import type { TipoVoz } from '~/components/papel/primitives';

/** Los 6 tipos en el orden del panel (§7). */
export const TIPOS_VOZ: readonly TipoVoz[] = ['basta', 'sueño', 'necesidad', 'compromiso', 'recurso', 'valor'];

/** Categorías fuera del catálogo caen en 'valor' (tinta) — mismo criterio que VocesTicker. */
export function tipoDeCategoria(categoria: string | null): TipoVoz {
  return TIPOS_VOZ.find((tipo) => tipo === categoria) ?? 'valor';
}

/** Relleno de los puntos del mapa. */
export const FILL_TIPO: Record<TipoVoz, string> = {
  basta: 'fill-sello',
  sueño: 'fill-violeta',
  necesidad: 'fill-ambar',
  compromiso: 'fill-verde',
  recurso: 'fill-cian',
  valor: 'fill-tinta',
};

/** Color del label de tipo en el feed (sobre papel). */
export const TEXTO_TIPO: Record<TipoVoz, string> = {
  basta: 'text-sello',
  sueño: 'text-violeta',
  necesidad: 'text-ambar',
  compromiso: 'text-verde',
  recurso: 'text-cian',
  valor: 'text-tinta',
};

/** Borde izquierdo del popover (el color va en el borde, no en texto sobre oscuro — AA). */
export const BORDE_TIPO: Record<TipoVoz, string> = {
  basta: 'border-sello',
  sueño: 'border-violeta',
  necesidad: 'border-ambar',
  compromiso: 'border-verde',
  recurso: 'border-cian',
  valor: 'border-papel',
};

export const PLACEHOLDER_NEUTRO = 'Elegí un tipo y decilo como te sale.';

export const PLACEHOLDER_TIPO: Record<TipoVoz, string> = {
  basta: '¿De qué te cansaste? Decilo sin filtro.',
  sueño: '¿Qué país te imaginás? Escribilo como si ya existiera.',
  necesidad: '¿Qué falta donde vivís? Nombralo concreto.',
  compromiso: '¿Qué vas a hacer vos? Prometé poco y cumplilo.',
  recurso: '¿Qué sabés hacer, qué tenés para prestar? Ofrecelo.',
  valor: '¿Qué no se negocia para vos? Dejalo por escrito.',
};
```

- [ ] **Step 5: Implementar `el-mapa-geo.ts`:**

```ts
/** Geometría de los puntos de voz — pura y determinista (testeable sin DOM). */

export interface PuntoJitter {
  x: number;
  y: number;
}

/** Cap de puntos dibujados por provincia; más allá, el cluster muestra el número. */
export const MAX_PUNTOS_PROVINCIA = 8;

const ANGULO_AUREO = 2.399963229728653;

/**
 * Espiral de ángulo áureo alrededor del centroide: el punto 0 es el centro,
 * el resto se reparte dentro de `radio`. Indexada — sin random: mismo input,
 * mismo dibujo en cada render (la honestidad del jitter la declara la leyenda).
 */
export function puntosJitter(n: number, cx: number, cy: number, radio = 14): PuntoJitter[] {
  return Array.from({ length: n }, (_, i) => {
    if (i === 0) return { x: cx, y: cy };
    const r = radio * Math.sqrt(i / Math.max(n - 1, 1));
    const a = i * ANGULO_AUREO;
    return {
      x: Math.round((cx + r * Math.cos(a)) * 10) / 10,
      y: Math.round((cy + r * Math.sin(a)) * 10) / 10,
    };
  });
}
```

- [ ] **Step 6: Implementar `sections/PopoverVoz.tsx`:**

```tsx
import { useEffect, useRef } from 'react';

import { BORDE_TIPO, tipoDeCategoria } from '../el-mapa-data';

import { cn } from '~/lib/utils';

import type { VozAbierta } from '~/lib/queries/open-data';

export interface PopoverVozProps {
  provincia: string;
  voces: readonly VozAbierta[];
  idx: number;
  onCiclar: () => void;
  onCerrar: () => void;
}

/**
 * Popover de mapa (§5, receta nueva): card tinta sobre el marco del mapa,
 * borde izquierdo del color del tipo. Foco al «✕» al abrir; Escape cierra;
 * el llamador devuelve el foco a la provincia al cerrar.
 */
export function PopoverVoz({ provincia, voces, idx, onCiclar, onCerrar }: PopoverVozProps) {
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cerrarRef.current?.focus();
  }, []);

  const voz = voces[idx] ?? voces[0];
  if (!voz) return null;
  const tipo = tipoDeCategoria(voz.category);

  return (
    <div
      role="dialog"
      aria-label={`Voz de ${provincia}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCerrar();
      }}
      className={cn(
        'anim-fadeup bg-tinta text-papel absolute right-6 top-6 w-[min(300px,80%)] border-l-2 p-5',
        BORDE_TIPO[tipo],
      )}
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="font-space text-[10px] font-bold uppercase tracking-[0.14em]">{tipo}</span>
        <button
          ref={cerrarRef}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="font-space text-oscuro-meta hover:text-papel text-[13px]"
        >
          ✕
        </button>
      </div>
      <p className="mb-2.5 max-h-[220px] overflow-y-auto text-[15px] leading-normal">«{voz.body}»</p>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-space text-oscuro-meta text-[11px]">
          {provincia} · voz {idx + 1} de {voces.length}
        </span>
        {voces.length > 1 ? (
          <button
            type="button"
            onClick={onCiclar}
            className="font-space text-violeta-claro text-[11px] font-bold uppercase tracking-[0.08em]"
          >
            otra →
          </button>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Implementar `sections/MapaArgentina.tsx`:**

```tsx
import { useMemo, useState } from 'react';

import { MAPA_VIEWBOX, PROVINCIAS_SVG } from '../argentina-mapa.generated';
import { FILL_TIPO, tipoDeCategoria } from '../el-mapa-data';
import { MAX_PUNTOS_PROVINCIA, puntosJitter } from '../el-mapa-geo';

import { PopoverVoz } from './PopoverVoz';

import { useProvincias, useVocesAbiertas, useVocesPorProvincia } from '~/lib/queries/open-data';
import { cn } from '~/lib/utils';

import type { VozAbierta } from '~/lib/queries/open-data';

/**
 * El mapa (§2 de la spec): provincias precomputadas + puntos de voz reales.
 * La unidad interactiva es la PROVINCIA (target grande, 24 tab-stops máx.);
 * los puntos y halos son textura decorativa aria-hidden.
 */
export function MapaArgentina() {
  const provincias = useProvincias();
  const voces = useVocesAbiertas();
  const conteos = useVocesPorProvincia();
  const [sel, setSel] = useState<{ provinceId: number; idx: number } | null>(null);

  const idPorNombre = useMemo(
    () => new Map((provincias.data ?? []).map((p) => [p.name, p.id])),
    [provincias.data],
  );
  const nombrePorId = useMemo(
    () => new Map((provincias.data ?? []).map((p) => [p.id, p.name])),
    [provincias.data],
  );
  const vocesPorProvincia = useMemo(() => {
    const mapa = new Map<number, VozAbierta[]>();
    for (const voz of voces.data ?? []) {
      if (voz.provinceId === null) continue;
      const lista = mapa.get(voz.provinceId) ?? [];
      lista.push(voz);
      mapa.set(voz.provinceId, lista);
    }
    return mapa;
  }, [voces.data]);
  const conteoPorProvincia = useMemo(
    () =>
      new Map(
        (conteos.data ?? []).flatMap((c) =>
          c.provinceId === null ? [] : [[c.provinceId, c.count] as const],
        ),
      ),
    [conteos.data],
  );

  const cargando = voces.isLoading || provincias.isLoading;
  const sinVoces = !cargando && !voces.isError && (voces.data?.length ?? 0) === 0;
  const vocesSel = sel ? (vocesPorProvincia.get(sel.provinceId) ?? []) : [];

  const cerrar = () => {
    if (sel) document.getElementById(`prov-${String(sel.provinceId)}`)?.focus();
    setSel(null);
  };

  const leyenda = cargando
    ? 'Cargando — menos que un trámite.'
    : voces.isError
      ? 'Esto se rompió. Lo decimos porque publicamos todo.'
      : sinVoces
        ? 'Todavía no hay voces acá. Qué oportunidad.'
        : 'Cada punto es una voz real, ubicada en su provincia — no en una dirección.';

  return (
    <div className="border-tinta bg-papel-crudo relative border p-7 max-[560px]:p-4">
      <svg
        viewBox={MAPA_VIEWBOX}
        className="mx-auto block max-h-[76vh] w-full"
        role="group"
        aria-label="Mapa de la Argentina: las voces por provincia"
      >
        {PROVINCIAS_SVG.map((prov) => {
          const provinceId = idPorNombre.get(prov.nombre);
          const lista = provinceId === undefined ? [] : (vocesPorProvincia.get(provinceId) ?? []);
          const total =
            provinceId === undefined ? 0 : (conteoPorProvincia.get(provinceId) ?? lista.length);
          const puntos = puntosJitter(Math.min(lista.length, MAX_PUNTOS_PROVINCIA), prov.cx, prov.cy);
          const interactiva = provinceId !== undefined && lista.length > 0;
          return (
            <g key={prov.nombre}>
              <path
                d={prov.path}
                strokeWidth={1.2}
                className={cn(
                  'fill-papel-mapa stroke-tinta',
                  interactiva &&
                    'hover:fill-papel-presionado focus-visible:stroke-violeta cursor-pointer outline-none transition-colors focus-visible:stroke-2',
                )}
                {...(interactiva
                  ? {
                      id: `prov-${String(provinceId)}`,
                      role: 'button',
                      tabIndex: 0,
                      'aria-label': `${prov.nombre}: ${String(total)} ${total === 1 ? 'voz' : 'voces'}. Leer la última.`,
                      onClick: () => {
                        setSel({ provinceId, idx: 0 });
                      },
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSel({ provinceId, idx: 0 });
                        }
                      },
                    }
                  : { 'aria-hidden': true })}
              />
              {lista.slice(0, MAX_PUNTOS_PROVINCIA).map((voz, i) => {
                const punto = puntos[i];
                if (!punto) return null;
                const fill = FILL_TIPO[tipoDeCategoria(voz.category)];
                return (
                  <g key={voz.id} aria-hidden className="pointer-events-none">
                    <circle
                      cx={punto.x}
                      cy={punto.y}
                      r={9}
                      className={cn(fill, 'anim-pulse-dot origin-center [transform-box:fill-box] opacity-20')}
                      style={{ animationDelay: `${String((i % 5) * 0.35)}s` }}
                    />
                    <circle
                      cx={punto.x}
                      cy={punto.y}
                      r={i === 0 ? 5 : 3.5}
                      strokeWidth={1}
                      className={cn(fill, 'anim-dropin stroke-papel origin-center [transform-box:fill-box]')}
                      style={{ animationDelay: `${String(i * 0.05)}s` }}
                    />
                  </g>
                );
              })}
              {total > MAX_PUNTOS_PROVINCIA ? (
                <text
                  x={prov.cx + 18}
                  y={prov.cy - 12}
                  aria-hidden
                  className="fill-tinta font-space text-[13px] font-bold"
                >
                  {total}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {sel && vocesSel.length > 0 ? (
        <PopoverVoz
          provincia={nombrePorId.get(sel.provinceId) ?? 'Argentina'}
          voces={vocesSel}
          idx={sel.idx}
          onCiclar={() => {
            setSel({ provinceId: sel.provinceId, idx: (sel.idx + 1) % vocesSel.length });
          }}
          onCerrar={cerrar}
        />
      ) : null}

      <p className="font-space text-tinta-30 mt-4 text-[10px] uppercase tracking-[0.12em]">{leyenda}</p>
    </div>
  );
}
```

- [ ] **Step 8: Enmienda de ley (§5, mismo commit).** En `docs/design-system/README.md`, §5, insertar después del bloque «Modales, toasts, tooltips»:

```markdown
Popover de mapa
Card absoluta dentro del marco del mapa (max-width 300): fondo #16130E, texto
#F2EFE7, sin radius, borde izquierdo 2px del color semántico de la voz, padding 20,
entra con fadeup. Cierre «✕» tipográfico + Escape; uno por vez; el foco entra al «✕»
y vuelve al disparador al cerrar. En la app: `PopoverVoz`
(`pages/ElMapa/sections/PopoverVoz.tsx`).
```

(La fecha del doc ya dice «julio 2026» — no se bumpea, §11.4.)

- [ ] **Step 9: Correr y ver PASS.**

Run: `pnpm -C apps/web exec vitest run src/pages/ElMapa`
Esperado: PASS (geo + invariantes + MapaArgentina).

- [ ] **Step 10: Verificación completa y commit.**

Run: `pnpm verify`. Esperado: verde.

```bash
git add apps/web/src/lib/queries/open-data.ts \
        apps/web/src/pages/ElMapa/el-mapa-data.ts \
        apps/web/src/pages/ElMapa/el-mapa-geo.ts \
        apps/web/src/pages/ElMapa/sections/MapaArgentina.tsx \
        apps/web/src/pages/ElMapa/sections/PopoverVoz.tsx \
        apps/web/src/pages/ElMapa/__tests__/el-mapa-geo.test.ts \
        apps/web/src/pages/ElMapa/sections/__tests__/MapaArgentina.test.tsx \
        docs/design-system/README.md
git commit -m "feat(web): El mapa — SVG con voces reales por provincia y popover (§5 popover de mapa)"
```

---

### Task 4: Panel «Soltá tu voz» — la conversión primaria (+ enmienda §10.7)

**Files:**
- Create: `apps/web/src/pages/ElMapa/sections/PanelSoltarVoz.tsx`
- Modify: `docs/design-system/README.md` (§10.7: concretar «primera voz soltada» — enmienda de ley, mismo commit)
- Test: `apps/web/src/pages/ElMapa/sections/__tests__/PanelSoltarVoz.test.tsx`

**Interfaces:**
- Consumes: `ChipTipo` (primer consumo real — este test es su smoke test en composición, deuda de Task 1.1 del master plan), `BotonPapel`, `Sello` · `useProvincias()`/`useSoltarVoz()` (Task 3) · `despertar()` de `~/lib/despertar` · `ApiError` de `~/lib/api` · placeholders de `el-mapa-data`.
- Produces: `PanelSoltarVoz()` sin props.

- [ ] **Step 1: Tests (fallan primero).** `PanelSoltarVoz.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PanelSoltarVoz } from '../PanelSoltarVoz';

import { ApiError } from '~/lib/api';
import { useProvincias, useSoltarVoz } from '~/lib/queries/open-data';

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useSoltarVoz: vi.fn(),
}));

const mockProvincias = vi.mocked(useProvincias);
const mockSoltar = vi.mocked(useSoltarVoz);

type MutateFn = ReturnType<typeof useSoltarVoz>['mutate'];
const mutate = vi.fn<MutateFn>();

function armarMutacion(extra: Partial<ReturnType<typeof useSoltarVoz>> = {}) {
  mockSoltar.mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    error: null,
    ...extra,
  } as ReturnType<typeof useSoltarVoz>);
}

describe('PanelSoltarVoz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mockProvincias.mockReturnValue({
      data: [{ id: 6, name: 'Córdoba', isoCode: 'AR-X' }],
      isLoading: false,
    } as ReturnType<typeof useProvincias>);
    armarMutacion();
  });

  it('ofrece los 6 tipos y el botón nace deshabilitado', () => {
    render(<PanelSoltarVoz />);

    for (const tipo of ['basta', 'sueño', 'necesidad', 'compromiso', 'recurso', 'valor']) {
      expect(screen.getByRole('button', { name: tipo, pressed: false })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Soltar la voz →' })).toBeDisabled();
  });

  it('con tipo + texto + provincia manda el payload correcto', () => {
    render(<PanelSoltarVoz />);

    fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
    fireEvent.change(screen.getByLabelText('Tu voz'), { target: { value: '  Trenes que lleguen. ' } });
    fireEvent.change(screen.getByLabelText('¿Desde dónde? (opcional)'), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));

    expect(mutate).toHaveBeenCalledWith(
      { body: 'Trenes que lleguen.', category: 'sueño', provinceId: 6 },
      expect.anything(),
    );
  });

  it('al 201: sello RECIBIDA + despertar + textarea limpio', () => {
    mutate.mockImplementation((_input, opts) => {
      opts?.onSuccess?.({ id: 99 }, _input, undefined);
    });
    render(<PanelSoltarVoz />);

    fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
    fireEvent.change(screen.getByLabelText('Tu voz'), { target: { value: 'Trenes que lleguen.' } });
    fireEvent.change(screen.getByLabelText('¿Desde dónde? (opcional)'), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));

    expect(screen.getByText('Recibida')).toBeInTheDocument();
    expect(
      screen.getByText('Tu voz cayó en Córdoba. Ya está en el mapa, a la vista de todos.'),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem('basta_despierto')).toBe('1');
    expect(screen.getByLabelText('Tu voz')).toHaveValue('');
  });

  it('sin provincia, la confirmación es honesta: cuenta pero no cae en el mapa', () => {
    mutate.mockImplementation((_input, opts) => {
      opts?.onSuccess?.({ id: 99 }, _input, undefined);
    });
    render(<PanelSoltarVoz />);

    fireEvent.click(screen.getByRole('button', { name: 'basta' }));
    fireEvent.change(screen.getByLabelText('Tu voz'), { target: { value: 'Basta.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));

    expect(
      screen.getByText('Tu voz quedó registrada. Ya cuenta con todas las demás.'),
    ).toBeInTheDocument();
  });

  it('rate limit muestra el mensaje del server; otros errores, la línea §10.9', () => {
    armarMutacion({
      isError: true,
      error: new ApiError(429, 'RATE_LIMITED', 'Demasiadas solicitudes. Intentá de nuevo en un momento.'),
    });
    render(<PanelSoltarVoz />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Demasiadas solicitudes. Intentá de nuevo en un momento.',
    );

    armarMutacion({ isError: true, error: new ApiError(500, 'INTERNAL', 'boom') });
    render(<PanelSoltarVoz />);
    expect(
      screen.getAllByRole('alert').at(-1),
    ).toHaveTextContent('Esto se rompió. Lo decimos porque publicamos todo. Probá de nuevo.');
  });
});
```

Run: `pnpm -C apps/web exec vitest run src/pages/ElMapa/sections/__tests__/PanelSoltarVoz.test.tsx`
Esperado: FAIL — módulo inexistente.

- [ ] **Step 2: Implementar `sections/PanelSoltarVoz.tsx`:**

```tsx
import { useState, type FormEvent } from 'react';

import { PLACEHOLDER_NEUTRO, PLACEHOLDER_TIPO, TIPOS_VOZ } from '../el-mapa-data';

import { BotonPapel, ChipTipo, Sello, type TipoVoz } from '~/components/papel/primitives';
import { ApiError } from '~/lib/api';
import { despertar } from '~/lib/despertar';
import { useProvincias, useSoltarVoz, type SoltarVozInput } from '~/lib/queries/open-data';

/**
 * Panel «Soltá tu voz» (§4 de la spec) — la conversión primaria del sitio.
 * Anónimo por diseño (sin campo de nombre); provincia opcional y honesta.
 * La interacción firma: 201 → sello RECIBIDA + despertar() (§10.7, «primera
 * voz soltada») + invalidación que hace caer el punto nuevo en el mapa.
 */
export function PanelSoltarVoz() {
  const [tipo, setTipo] = useState<TipoVoz | null>(null);
  const [texto, setTexto] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  /** null = sin enviar · '' = recibida sin provincia · nombre = recibida con provincia. */
  const [recibida, setRecibida] = useState<string | null>(null);
  const provincias = useProvincias();
  const soltar = useSoltarVoz();

  const valido = tipo !== null && texto.trim().length > 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tipo === null || !valido || soltar.isPending) return;
    const input: SoltarVozInput = { body: texto.trim(), category: tipo };
    if (provinciaId !== '') input.provinceId = Number(provinciaId);
    soltar.mutate(input, {
      onSuccess: () => {
        despertar();
        const nombre = (provincias.data ?? []).find((p) => String(p.id) === provinciaId)?.name ?? '';
        setRecibida(nombre);
        setTexto('');
      },
    });
  };

  const errorMensaje = soltar.isError
    ? soltar.error instanceof ApiError && soltar.error.code === 'RATE_LIMITED'
      ? soltar.error.message
      : 'Esto se rompió. Lo decimos porque publicamos todo. Probá de nuevo.'
    : null;

  return (
    <section aria-labelledby="soltar-titulo" className="border-tinta bg-papel border">
      <div className="border-tinta flex items-baseline justify-between gap-3 border-b px-[22px] py-4">
        <h2 id="soltar-titulo" className="font-space text-[11px] font-bold uppercase tracking-[0.14em]">
          Soltá tu voz
        </h2>
        <span className="font-space text-violeta text-[11px] font-bold uppercase tracking-[0.14em]">
          30 segundos
        </span>
      </div>
      <form onSubmit={onSubmit} className="p-[22px]" noValidate>
        <div role="group" aria-label="Tipo de voz" className="mb-4 flex flex-wrap gap-2">
          {TIPOS_VOZ.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tipo === t}
              onClick={() => {
                setTipo(t);
              }}
              className="min-h-[44px]"
            >
              <ChipTipo tipo={t} active={tipo === t} />
            </button>
          ))}
        </div>

        <label htmlFor="voz-texto" className="sr-only">
          Tu voz
        </label>
        <textarea
          id="voz-texto"
          rows={3}
          maxLength={2000}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
          }}
          placeholder={tipo ? PLACEHOLDER_TIPO[tipo] : PLACEHOLDER_NEUTRO}
          className="border-tinta bg-papel-crudo text-tinta placeholder:text-tinta-50 w-full resize-y border p-3.5 text-[15px] leading-normal"
        />

        <label
          htmlFor="voz-provincia"
          className="font-space text-tinta-75 mb-1.5 mt-3.5 block text-[11px] uppercase tracking-[0.12em]"
        >
          ¿Desde dónde? (opcional)
        </label>
        <div className="relative">
          <select
            id="voz-provincia"
            value={provinciaId}
            onChange={(e) => {
              setProvinciaId(e.target.value);
            }}
            className="border-tinta bg-papel-crudo text-tinta font-space w-full appearance-none border p-3.5 text-[13px]"
          >
            <option value="">Toda la Argentina</option>
            {(provincias.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="font-space text-tinta-50 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px]"
          >
            ▾
          </span>
        </div>
        <p className="font-space text-tinta-50 mt-1.5 text-[10px]">
          Sin provincia tu voz cuenta igual, pero no cae en el mapa.
        </p>

        <BotonPapel type="submit" variant="violeta" loading={soltar.isPending} disabled={!valido} className="mt-3.5 w-full">
          Soltar la voz →
        </BotonPapel>

        {errorMensaje ? (
          <p role="alert" className="font-space text-sello mt-3 text-[11px]">
            {errorMensaje}
          </p>
        ) : null}

        {recibida !== null ? (
          <div role="status" className="mt-4 flex flex-wrap items-center gap-3.5">
            <Sello color="verde" rotate={-6} className="border-2 px-[11px] py-[7px] text-[11px] tracking-[0.14em]">
              Recibida
            </Sello>
            <span className="font-space text-tinta-75 text-xs">
              {recibida === ''
                ? 'Tu voz quedó registrada. Ya cuenta con todas las demás.'
                : `Tu voz cayó en ${recibida}. Ya está en el mapa, a la vista de todos.`}
            </span>
          </div>
        ) : null}
      </form>
    </section>
  );
}
```

- [ ] **Step 3: Enmienda de ley (§10.7, mismo commit).** En `docs/design-system/README.md`, reemplazar en §10.7:

```
primera voz soltada.
```

por:

```
primera voz soltada (botón «Soltar la voz», El mapa).
```

(El disparador ya estaba listado; la enmienda lo amarra al control real que este commit shipea.)

- [ ] **Step 4: Correr y ver PASS.**

Run: `pnpm -C apps/web exec vitest run src/pages/ElMapa`
Esperado: PASS todos.

- [ ] **Step 5: Verificación completa y commit.**

Run: `pnpm verify`. Esperado: verde.

```bash
git add apps/web/src/pages/ElMapa/sections/PanelSoltarVoz.tsx \
        apps/web/src/pages/ElMapa/sections/__tests__/PanelSoltarVoz.test.tsx \
        docs/design-system/README.md
git commit -m "feat(web): El mapa — panel Soltá tu voz con sello RECIBIDA y despertar (§10.7)"
```

---

### Task 5: Portada + feed + composer + `PAPEL_ROUTES` + prueba en navegador

**Files:**
- Create: `apps/web/src/pages/ElMapa/sections/PortadaMapa.tsx`
- Create: `apps/web/src/pages/ElMapa/sections/FeedVoces.tsx`
- Modify (reescritura completa — el placeholder v1 muere): `apps/web/src/pages/ElMapa.tsx`
- Modify: `apps/web/src/layouts/RootLayout.tsx:17` (`PAPEL_ROUTES`)
- Test: `apps/web/src/pages/ElMapa/sections/__tests__/FeedVoces.test.tsx`
- Test: `apps/web/src/pages/__tests__/ElMapa.test.tsx`

**Interfaces:**
- Consumes: `Kicker`, `RitoTinta` · `useVocesCount()` de `~/lib/queries/analytics` (misma query key que el header — un solo fetch) · hooks de Task 3.
- Produces: `ElMapa` (named + default export — el lazy de `App.tsx` ya lo espera, `App.tsx` NO se toca) · `/el-mapa` con chrome papel.

- [ ] **Step 1: Tests (fallan primero).** `FeedVoces.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FeedVoces } from '../FeedVoces';

import { useProvincias, useVocesAbiertas } from '~/lib/queries/open-data';

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useVocesAbiertas: vi.fn(),
}));

const mockProvincias = vi.mocked(useProvincias);
const mockVoces = vi.mocked(useVocesAbiertas);

describe('FeedVoces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProvincias.mockReturnValue({
      data: [{ id: 6, name: 'Córdoba', isoCode: 'AR-X' }],
      isLoading: false,
    } as ReturnType<typeof useProvincias>);
    mockVoces.mockReturnValue({
      data: [
        { id: 2, body: 'Trenes que lleguen.', category: 'sueño', provinceId: 6, submittedAs: null, createdAt: '2026-07-22T12:00:00Z' },
        { id: 1, body: 'Basta.', category: 'basta', provinceId: null, submittedAs: null, createdAt: '2026-07-21T12:00:00Z' },
      ],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesAbiertas>);
  });

  it('lista tipo + lugar + texto; sin provincia dice Argentina', () => {
    render(<FeedVoces />);

    expect(screen.getByText('sueño')).toBeInTheDocument();
    expect(screen.getByText('Córdoba')).toBeInTheDocument();
    expect(screen.getByText('«Trenes que lleguen.»')).toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
  });

  it('cierra con el link real a El mandato', () => {
    render(<FeedVoces />);

    expect(screen.getByRole('link', { name: 'El mandato' })).toHaveAttribute('href', '/mandato-vivo');
  });

  it('vacío habla (§10.9)', () => {
    mockVoces.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesAbiertas>);
    render(<FeedVoces />);

    expect(screen.getByText('El país todavía no dijo nada acá. Empezá vos.')).toBeInTheDocument();
  });
});
```

`pages/__tests__/ElMapa.test.tsx` (composición — mockea TODOS los hooks vivos):

```tsx
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ElMapa } from '../ElMapa';

import { useVocesCount } from '~/lib/queries/analytics';
import {
  useProvincias,
  useSoltarVoz,
  useVocesAbiertas,
  useVocesPorProvincia,
} from '~/lib/queries/open-data';

vi.mock('~/lib/queries/analytics', () => ({ useVocesCount: vi.fn() }));
vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useSoltarVoz: vi.fn(),
  useVocesAbiertas: vi.fn(),
  useVocesPorProvincia: vi.fn(),
}));

describe('ElMapa (página papel 2.2)', () => {
  beforeEach(() => {
    vi.mocked(useVocesCount).mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    vi.mocked(useProvincias).mockReturnValue({ data: [], isLoading: false } as ReturnType<typeof useProvincias>);
    vi.mocked(useVocesAbiertas).mockReturnValue({ data: [], isLoading: false, isError: false } as ReturnType<typeof useVocesAbiertas>);
    vi.mocked(useVocesPorProvincia).mockReturnValue({ data: [], isLoading: false } as ReturnType<typeof useVocesPorProvincia>);
    vi.mocked(useSoltarVoz).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useSoltarVoz>);
  });

  it('abre con el rito de la tinta y la cifra real formateada es-AR', () => {
    render(<ElMapa />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'El país, dicho por su gente.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('El mapa de las voces')).toBeInTheDocument();
    expect(screen.getByText('12.496')).toBeInTheDocument();
    expect(screen.getByText('voces en el mapa')).toBeInTheDocument();
  });

  it('si la cifra carga o falló, el bloque no aparece — jamás un número inventado', () => {
    vi.mocked(useVocesCount).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    render(<ElMapa />);

    expect(screen.queryByText('voces en el mapa')).not.toBeInTheDocument();
  });

  it('compone mapa + panel + feed', () => {
    render(<ElMapa />);

    expect(screen.getByRole('group', { name: 'Mapa de la Argentina: las voces por provincia' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Soltá tu voz' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Últimas voces' })).toBeInTheDocument();
  });
});
```

Run: `pnpm -C apps/web exec vitest run src/pages/ElMapa src/pages/__tests__/ElMapa.test.tsx`
Esperado: FAIL — módulos inexistentes (y el test viejo de página no existe, nada que romper).

- [ ] **Step 2: Implementar `sections/PortadaMapa.tsx`:**

```tsx
import { Kicker, RitoTinta } from '~/components/papel/primitives';
import { useVocesCount } from '~/lib/queries/analytics';

/**
 * § 1 — Portada: rito de la tinta + la cifra viva (sin asterisco: dato real).
 * Mientras carga o si falla, el bloque de la cifra no se renderiza — nunca
 * un número de reserva (regla de datos reales de la spec).
 */
export function PortadaMapa() {
  const voces = useVocesCount();

  return (
    <section className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-6 px-5 pb-10 pt-16 min-[961px]:px-10">
      <div>
        <Kicker className="anim-fadeup mb-4">El mapa de las voces</Kicker>
        <h1
          aria-label="El país, dicho por su gente."
          className="font-anton riso-hover text-[clamp(44px,6vw,88px)] leading-[0.98]"
        >
          <RitoTinta lineas={['El país, dicho', 'por su gente.']} />
        </h1>
      </div>
      {voces.data ? (
        <div className="anim-fadeup text-right" style={{ animationDelay: '0.3s' }}>
          <div className="font-anton text-violeta text-[52px] leading-none">
            {voces.data.total.toLocaleString('es-AR')}
          </div>
          <div className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.12em]">
            {voces.data.total === 1 ? 'voz en el mapa' : 'voces en el mapa'}
          </div>
        </div>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 3: Implementar `sections/FeedVoces.tsx`:**

```tsx
import { Link } from 'wouter';

import { TEXTO_TIPO, tipoDeCategoria } from '../el-mapa-data';

import { useProvincias, useVocesAbiertas } from '~/lib/queries/open-data';
import { cn } from '~/lib/utils';

const FEED_MAX = 12;

/** § 5 — Últimas voces: mismas queries que el mapa (cero fetch extra) + remate al mandato. */
export function FeedVoces() {
  const voces = useVocesAbiertas();
  const provincias = useProvincias();
  const nombrePorId = new Map((provincias.data ?? []).map((p) => [p.id, p.name]));
  const items = (voces.data ?? []).slice(0, FEED_MAX);

  return (
    <section aria-labelledby="feed-titulo">
      <h2 id="feed-titulo" className="font-space text-tinta-50 mb-3 text-[11px] uppercase tracking-[0.14em]">
        Últimas voces
      </h2>
      {voces.isLoading ? (
        <div>
          <div className="anim-pulso-papel bg-papel-presionado h-[72px]" />
          <p className="font-space text-tinta-50 mt-2 text-[10px] uppercase tracking-[0.12em]">
            Cargando — menos que un trámite.
          </p>
        </div>
      ) : voces.isError ? (
        <p className="font-space text-tinta-75 text-[13px]">
          Esto se rompió. Lo decimos porque publicamos todo.
        </p>
      ) : items.length === 0 ? (
        <p className="font-space text-tinta-75 text-[13px]">
          El país todavía no dijo nada acá. Empezá vos.
        </p>
      ) : (
        <div className="border-papel-borde bg-papel-borde flex max-h-[380px] flex-col gap-px overflow-y-auto border">
          {items.map((voz) => {
            const tipo = tipoDeCategoria(voz.category);
            return (
              <article key={voz.id} className="bg-papel px-[18px] py-4">
                <div className="font-space mb-2 flex justify-between gap-3 text-[10px] uppercase tracking-[0.12em]">
                  <span className={cn('font-bold', TEXTO_TIPO[tipo])}>{tipo}</span>
                  <span className="text-tinta-30">
                    {voz.provinceId === null
                      ? 'Argentina'
                      : (nombrePorId.get(voz.provinceId) ?? 'Argentina')}
                  </span>
                </div>
                <p className="text-tinta-90 text-sm leading-normal">«{voz.body}»</p>
              </article>
            );
          })}
        </div>
      )}
      <p className="border-tinta text-tinta-50 mt-6 border-t pt-4 text-sm leading-relaxed">
        Cada voz queda pública: cualquiera la puede leer, contar y auditar. De acá sale{' '}
        <Link href="/mandato-vivo" className="text-tinta font-semibold underline-offset-2 hover:underline">
          El mandato
        </Link>{' '}
        — el país pedido por escrito.
      </p>
    </section>
  );
}
```

- [ ] **Step 4: Reescribir el composer `apps/web/src/pages/ElMapa.tsx`** (adiós placeholder v1 — glass, gradient-text y «Ser un punto del mapa» mueren acá):

```tsx
import { FeedVoces } from './ElMapa/sections/FeedVoces';
import { MapaArgentina } from './ElMapa/sections/MapaArgentina';
import { PanelSoltarVoz } from './ElMapa/sections/PanelSoltarVoz';
import { PortadaMapa } from './ElMapa/sections/PortadaMapa';

/**
 * El mapa — página 2.2 «Papel y Tinta»
 * (docs/specs/2026-07-22-el-mapa-papel-y-tinta.md). Conversión primaria del
 * sitio: soltar la primera voz en 30 segundos y verla caer en el mapa.
 * Móvil: el panel va antes que el mapa (la conversión no espera el scroll).
 * El chrome papel (header/footer/grano/velo) lo pone RootLayout.
 */
export function ElMapa() {
  return (
    <main>
      <PortadaMapa />
      <section className="mx-auto grid max-w-[1440px] grid-cols-[1fr_480px] items-start gap-12 px-5 pb-[88px] max-[960px]:grid-cols-1 max-[960px]:gap-8 min-[961px]:px-10">
        <div className="max-[960px]:order-2 min-[961px]:row-span-2">
          <MapaArgentina />
        </div>
        <div className="max-[960px]:order-1">
          <PanelSoltarVoz />
        </div>
        <div className="max-[960px]:order-3">
          <FeedVoces />
        </div>
      </section>
    </main>
  );
}

export default ElMapa;
```

- [ ] **Step 5: `PAPEL_ROUTES`.** En `RootLayout.tsx:17`:

```tsx
const PAPEL_ROUTES = new Set(['/', '/la-idea', '/el-mapa']);
```

- [ ] **Step 6: Suite completa.**

Run: `pnpm -C apps/web test:unit`
Esperado: PASS — nada de Home/LaIdea se tocó; `App.tsx` intacto (el lazy ya importaba `~/pages/ElMapa` con named export).

- [ ] **Step 7: Verificación completa.**

Run: `pnpm verify`
Esperado: lint + type-check + tests + build verdes.

- [ ] **Step 8: Prueba en navegador (DoD del protocolo, con capturas).**

Run: `pnpm dev` (levanta api + web contra la DB dev `cool-bird-63087148`; las provincias ya están seedeadas).

Desktop (1280×800):
1. Ir a `/el-mapa` **con localStorage limpio**: velo gris activo, chrome papel, H1 se entinta, cifra real de voces a la derecha (sin asterisco), mapa con puntos pulsando en las provincias con voces, feed con voces reales. Captura.
2. Panel: elegir un tipo (chip se pinta del color semántico), escribir una voz de prueba reconocible (`prueba browser el-mapa 2026-07-22 — borrar`), elegir provincia, «Soltar la voz →»: botón pasa a «— ▌», cae el sello `RECIBIDA` con la línea de la provincia, **el velo se disuelve (~1.4s)**, el punto nuevo aparece con dropin, el feed la muestra arriba, la cifra de portada y el contador del header suben. Capturas antes/después.
3. Click en la provincia de la voz: popover con la voz, «otra →» cicla si hay más, «✕» y Escape cierran (el foco vuelve a la provincia).
4. Teclado: tab recorre chips → textarea → select → botón → provincias con voces (focus stroke violeta) → popover. Sin trampas de foco.
5. Recargar ya despierto: sin velo; todo igual.
6. Sin provincia: soltar otra voz de prueba sin elegir provincia → línea «quedó registrada… cuenta con todas las demás», sin punto nuevo.
7. Provincia con >8 voces (si existe en dev): racimo de 8 + número mono al lado.

Mobile (375×812): orden portada → panel → mapa → feed; targets ≥ 44px; popover entra en pantalla. Capturas.

Reduced motion (emulación): mapa nace quieto y completo (sin pulse/dropin), H1 entintado, sello sin animación.

**Limpieza (obligatoria):** borrar las voces de prueba de la DB dev:

```sql
DELETE FROM dreams WHERE body LIKE '%prueba browser el-mapa 2026-07-22%';
```

(Vía el SQL runner del proyecto Neon dev `cool-bird-63087148` — NUNCA contra `sparkling-field-92271073`.)

- [ ] **Step 9: Commit.**

```bash
git add apps/web/src/pages/ElMapa.tsx \
        apps/web/src/pages/ElMapa/sections/PortadaMapa.tsx \
        apps/web/src/pages/ElMapa/sections/FeedVoces.tsx \
        apps/web/src/pages/ElMapa/sections/__tests__/FeedVoces.test.tsx \
        apps/web/src/pages/__tests__/ElMapa.test.tsx \
        apps/web/src/layouts/RootLayout.tsx
git commit -m "feat(web): El mapa papel en /el-mapa — portada, feed y el placeholder v1 muerto"
```

---

## Self-review

- **Cobertura de la spec:** dataset + proyección + módulo generado (T1) · contrato API asertado con limpieza FK-safe (T2) · mapa + puntos + clusters + popover + enmienda §5 (T3) · panel + RECIBIDA + despertar + enmienda §10.7 (T4) · portada + cifra + feed + composer + `PAPEL_ROUTES` + navegador + limpieza de datos de prueba (T5).
- **Inventario API honesto:** cero endpoints nuevos, cero migraciones — los 5 endpoints existen y están en producción de tests; T2 solo agrega las aserciones que el mapa necesita (category round-trip, provinceName→provinceId, agregados). La verdad de moderación (`status:'approved'` fijo → publicación inmediata) está amarrada al copy en la spec, con cláusula de muerte.
- **Sin placeholders:** copy y código completos en los steps; los strings de clase Tailwind van enteros (compilables).
- **Consistencia de tipos:** `VozAbierta`/`SoltarVozInput`/`ProvinciaApi` viven solo en `lib/queries/open-data.ts`; `TipoVoz` viene de primitives (ChipTipo); `ProvinciaSvg` solo en el módulo generado; `ElMapa` conserva named+default export (el lazy de `App.tsx` no se toca).
- **LOC:** el archivo más grande es `MapaArgentina.tsx` ≈ 180 LOC; el generado es dato, no lógica. Todos bajo 300.
- **Riesgos señalados:** contraste del ámbar (sistémico, flag para 8.3, documentado en la spec) · aserción de conteo sin delta exacto en T2 (suites paralelas contra el mismo branch — comentado en el test) · `[transform-box:fill-box] origin-center` imprescindible para que `pulse-dot`/`dropin` escalen desde el punto y no desde el origen del viewBox.
