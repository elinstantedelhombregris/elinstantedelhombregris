# D · La publicación — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada URL pública con su head sellado y su tarjeta OG propia, sitemap y robots derivados del registro, headers y caché declarados, planes y ensayos devolviendo HTML real, y los 10 ítems de la Definición de terminado verificados contra un preview deploy con las guardias corriendo en CI.

**Architecture:** Un único catálogo en disco —`scripts/build/fuente-disco.ts`, que reproduce sin Vite la misma `FuenteDeContenido` que arma el navegador— alimenta las cuatro salidas del plan: las 128 tarjetas OG que rasteriza satori sobre `@resvg/resvg-js`, el `<head>` sellado de cada URL más el `sitemap.xml` y el `robots.txt` que escribe `sellar-head.ts` al final de la cadena del `build` de `apps/web`, el contrato con el host en `v2/vercel.json`, y las 44 URLs de planes y ensayos que `pnpm prerender` congela con el Chromium de Playwright dentro de `<div data-prerender>`. Nada se escribe a mano dos veces: si entra un plan, un ensayo o una crónica al disco, las tarjetas, el sitemap, los 301 y el prerender lo recogen solos, y las guardias (`pnpm meta:check`, los tests de `scripts/build/__tests__/`, la auditoría del artefacto dentro de `pnpm prerender`) se ponen rojas si alguien se olvidó de correr un generador. El cierre es empírico: B13 golpea un preview deploy real con `curl` y con los scrapers, y recién ahí se dan por verificados los 10 ítems de la Definición de terminado.

**Tech Stack:** TypeScript strict bajo `tsx` para todo `scripts/`; vitest (`pnpm test:scripts` para `scripts/`, `pnpm -C apps/web exec vitest` para `apps/web`) para la lógica pura; `satori` 0.29 + `@resvg/resvg-js` 2.6 como **devDependencies** para rasterizar las tarjetas OG; `@playwright/test` (Chromium) para el prerender; `vite build` y `vite preview` de `apps/web`; Vercel como host (`v2/vercel.json`, Root Directory = `v2`); GitHub Actions (`.github/workflows/v2-ci.yml`, job `build-and-test`).

**Spec:** `docs/specs/2026-07-26-el-sustrato.md` — bloques B9, B11, B12, B13

**Prerrequisito:** el plan A (`2026-07-26-sustrato-a-fundaciones.md`) está ejecutado y commiteado. Los planes B y C también.

## Global Constraints

- **Directorio de trabajo: `/Users/juanb/Desktop/ElInstantedelHombreGris/v2`.** Todos los comandos se corren desde ahí salvo que el paso diga otra cosa. Los `git add` que empiezan con `v2/` se corren desde la raíz del repo (`/Users/juanb/Desktop/ElInstantedelHombreGris`) y cada paso lo declara; los `../.github/workflows/v2-ci.yml` sólo resuelven con cwd = `v2/`.
- **Anclá siempre en texto literal citado del archivo, nunca en un número de línea de HEAD.** Este plan corre después del A y de los planes B y C: `App.tsx`, `RootLayout.tsx`, `index.html`, `index.css`, `primitives/index.ts`, `apps/web/package.json` y el `build` de `apps/web` ya cambiaron. Si un ancla literal no aparece, pará y averiguá qué bloque anterior no corrió — no busques «más o menos por esa línea».
- **El `build` de `apps/web` es una cadena que dejó armada el plan A** (`vite build && … limpiar-dist.ts`): se le **agrega** al final, nunca se reescribe.
- **Orden de guardias en `v2/package.json`:** `planes:check` → `deps:check` (plan A) → `meta:check` (plan C) → `prerender` → `size` → `verify`. En `.github/workflows/v2-ci.yml` los pasos nuevos van **después** del paso «Guardia del registro de rutas». `prerender` **no** entra a `verify`: `verify` no puede depender de un navegador instalado.
- **`scripts/vitest.config.ts` ya incluye `build/__tests__/**` — no se toca.** Los tests de `scripts/build/__tests__/` corren con `pnpm test:scripts` desde `v2/`; los de `apps/web` con `pnpm -C apps/web exec vitest`.
- **`pnpm verify` = lint + type-check + test + build.** Verde antes de cada commit.
- **Los cinco content registries usan `import.meta.glob`, que no existe fuera de Vite.** Ningún script de build los importa: el catálogo en disco es `scripts/build/fuente-disco.ts`.
- **`v2/tsconfig.json` tiene `paths` vacío: el alias `~/` sólo resuelve dentro de `apps/web`.** Desde `scripts/` se importa por ruta relativa (`../../apps/web/src/lib/rutas/registro`).
- **`apps/web/src/main.tsx` usa `createRoot`, NO `hydrateRoot`.** No se toca en este plan.
- **`scripts/build/build-mapa-argentina.ts` no existe.** No se lo cite como precedente.
- Sin `any`, sin `console.*`, sin `@ts-ignore`. TS strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.
- **`import/order` corre con `alphabetize: { order: 'asc' }`** y los pasos exigen `eslint --max-warnings 0`: ordená los imports que escribas.
- **En TSX está prohibido el hex literal: tokens Tailwind.** Token nuevo ⇒ `docs/design-system/tokens.css` + `tailwind.config.ts` en el MISMO commit. Los scripts de build (satori, que no lee `tailwind.config.ts`) sí llevan el hex inline, y cada archivo lo dice en su cabecera.
- Todo texto de usuario en español rioplatense (voseo). «Comillas angulares». ¡BASTA! con los dos signos.
- Conventional Commits con scope.
- **La decisión que rompe el ciclo B↔C, y que este plan hereda:** `SkipLink.tsx` (B4) y `ErrorBoundary.tsx` (B5) **no** consumen `Superficie` ni `superficieDe` — consumen `esRutaPapel(location: string): boolean` de `apps/web/src/layouts/papel-routes.ts`, y donde el contrato dice `superficie: Superficie` va `esPapel: boolean`. La migración de los cuatro `text-oscuro-tenue` de `PapelFooter.tsx` pertenece a **B6**, no a la Tarea 14 del plan C. Este plan no revierte ninguna de las dos cosas.

---

## Bloque B9 — Tarjetas OG

**Qué entrega.** `scripts/build/fuente-disco.ts` (el catálogo en disco que también van a
usar B11 y B12), `scripts/build/og-plantilla.ts` (la composición, pura y testeable),
`scripts/build/build-og-cards.ts` (el CLI con satori + `@resvg/resvg-js`, las dos como
**devDependencies**) y **128 PNG commiteados** en `apps/web/public/og/`: 30 secciones + la
tarjeta por defecto + 97 documentos. Las 329 lecciones, las 31 prácticas y las rutas
servidas por la base **heredan** la tarjeta de su sección.

**Cuatro cosas verificadas empíricamente antes de escribir esto**, porque cada una cambia
el código:

1. **satori 0.29.0 explota con las fuentes variables.** Pasarle `Archivo[wdth,wght].ttf`
   tira `TypeError: Cannot read properties of undefined (reading '256')` desde
   `parseFvarAxis` de `@shuding/opentype.js`: su parser de la tabla `fvar` no soporta el
   TTF variable de Google Fonts. La composición usa **sólo las dos caras estáticas**,
   `Anton-Regular.ttf` y `SpaceMono-Regular.ttf`, y hay un comentario en el CLI que dice
   por qué, para que nadie agregue Archivo «para el cuerpo».
2. **Las tarjetas reales pesan entre 33 y 53 KB**, no ~8 KB. Medido renderando la
   composición final con los TTF reales: 33.331 bytes la más corta, 47.591 la del título
   más largo del catálogo (89 caracteres), 52.035 un título sintético de 97.
   `@resvg/resvg-js` 2.6.2 emite siempre RGBA de 8 bits por canal (IHDR `bitDepth=8`,
   `colorType=6`) y no tiene opción de paleta: pasarle `background: '#F2EFE7'` devuelve
   **exactamente los mismos bytes**. «PNG-8» de §9 se cumple como *8 bits por canal, sin
   grano y por debajo del techo*, no como *paleta de 256 colores* — llegar a paleta pide
   un cuantizador nativo que descarga binarios en `install`. El techo lo hace cumplir un
   test.
3. **`satori(...)` se puede llamar sin `any` y sin `@types/react`.** Los tipos de satori
   hacen `import { ReactNode } from 'react'`, que no resuelve desde `v2/node_modules`;
   con el `skipLibCheck: true` de `packages/config/typescript/base.json` eso no es un
   error, pero deja el primer parámetro en `any`. El CLI re-tipa el módulo **una sola
   vez** (`const maquetar = satori as unknown as (…) => Promise<string>`) y ninguna
   llamada pasa un `any`. Probado con `tsc` contra la config exacta de
   `scripts/tsconfig.json`: cero salida.
4. **Son 128 tarjetas, no ~135.** `REGISTRO` tiene 30 valores distintos de `og`; los
   documentos con `ogPorDocumento: true` son 23 planes + 21 ensayos + 22 crónicas de
   bitácora + 31 entrenamientos = 97; más `og/default.png`. 30 + 97 + 1 = 128.

**El dueño único de `og/default.png` es este bloque.** El plan A ya cerró su mitad: su
tarea «B3 — la marca de la pestaña es la de v2» no rasteriza la card con el Chromium de
Playwright, `marca.ts` lleva el comentario que lo dice, y su test afirma que después de
`pnpm marca:build` **no existe** `apps/web/public/og/`. Ésta es la otra mitad:
`og/default.png` sale de `build-og-cards.ts` con satori, como la entrada
`TARJETA_POR_DEFECTO` del mismo catálogo y con la misma plantilla que las otras 127. No
hay semilla, no hay fallback provisorio, y no hay dos motores de layout sobre la misma
composición. La Tarea 4 deja la nota de coordinación cruzada.

---

### Tarea 1: `fuente-disco.ts` — el catálogo en disco, sin Vite

**Files:**
- Create: `v2/scripts/build/fuente-disco.ts`
- Create: `v2/scripts/build/__tests__/fuente-disco.test.ts`

**Interfaces:**
- Consumes: `DocumentoDeRuta`, `FuenteDeContenido`, `ORIGEN_CANONICO` de
  `../../apps/web/src/lib/rutas/registro` (B7) · `PLANES_INDEX` de
  `../../apps/web/src/lib/planes-index.generated` · `blogFrontmatterSchema`,
  `courseJsonSchema`, `ensayoFrontmatterSchema`, `CourseJson` de `@v2/shared/content` ·
  `loadContentDir` de `@v2/shared/content/loader`.
- Produces (**contrato compartido, copiar literal**):
  - `export const RAIZ_V2: string;`
  - `export async function leerFuenteDeDisco(raizV2?: string): Promise<FuenteDeContenido>;`
  - `export function origenDelBuild(): string;`

> **Coordinación con B11 y B12 — este archivo tiene un solo dueño, y es B9.** El contrato
> lo lista como consumido por `build-og-cards.ts`, `sellar-head.ts`,
> `verify-registro-rutas.ts` y `prerender.ts`. B9 es el primero de los cuatro en el orden
> del plan D (B9 → B11 → B12 → B13), así que lo crea acá y los otros tres lo importan tal
> cual. **Si el bloque B11 trae su propia copia de esta tarea, se descarta la de B11**: el
> archivo ya existe, con test, cuando B11 arranca.

> **Por qué no importa los cinco content registries.** `plans-registry.ts`,
> `ensayos-registry.ts`, `blog-registry.ts`, `courses-registry.ts` y el de la crónica usan
> `import.meta.glob`, que no existe fuera de Vite: bajo `tsx` cualquiera de los cinco
> rompe. Este módulo reproduce **el mismo conjunto** leyendo el disco, y su test lo
> verifica contra lo que hay en `content/`.

- [ ] **Paso 1: Escribir el test que falla**

Crear `v2/scripts/build/__tests__/fuente-disco.test.ts`:

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { leerFuenteDeDisco, origenDelBuild, RAIZ_V2 } from '../fuente-disco';

import type { FuenteDeContenido } from '../../../apps/web/src/lib/rutas/registro';

const PATRONES = [
  '/bitacora/:slug',
  '/blog/:slug',
  '/ensayos/:slug',
  '/entrenamientos/:slug',
  '/entrenamientos/:slug/leccion/:n',
  '/entrenamientos/:slug/practica',
  '/planes/:slug',
];

/** Cuenta los .mdx de un directorio de contenido sin pasar por el módulo bajo prueba. */
function contarMdx(directorio: string): number {
  return readdirSync(join(RAIZ_V2, 'content', directorio)).filter((f) => f.endsWith('.mdx'))
    .length;
}

/** Los directorios de curso que tienen `course.json`, leídos a mano. */
function cursosEnDisco(): string[] {
  const raiz = join(RAIZ_V2, 'content/courses');
  return readdirSync(raiz).filter((d) => existsSync(join(raiz, d, 'course.json')));
}

describe('RAIZ_V2', () => {
  it('apunta a v2/, no a scripts/', () => {
    expect(existsSync(join(RAIZ_V2, 'content/planes'))).toBe(true);
    expect(existsSync(join(RAIZ_V2, 'apps/web/public'))).toBe(true);
  });
});

describe('origenDelBuild', () => {
  it('usa VITE_SITE_ORIGIN cuando está, y le saca la barra final', () => {
    const previo = process.env['VITE_SITE_ORIGIN'];
    process.env['VITE_SITE_ORIGIN'] = 'https://preview.example.com/';
    try {
      expect(origenDelBuild()).toBe('https://preview.example.com');
    } finally {
      if (previo === undefined) delete process.env['VITE_SITE_ORIGIN'];
      else process.env['VITE_SITE_ORIGIN'] = previo;
    }
  });

  it('sin variable cae al origen canónico, y nunca termina en barra', () => {
    const previo = process.env['VITE_SITE_ORIGIN'];
    delete process.env['VITE_SITE_ORIGIN'];
    try {
      expect(origenDelBuild()).toBe('https://elinstantedelhombregris.com');
      expect(origenDelBuild().endsWith('/')).toBe(false);
    } finally {
      if (previo !== undefined) process.env['VITE_SITE_ORIGIN'] = previo;
    }
  });
});

describe('leerFuenteDeDisco', () => {
  let fuente: FuenteDeContenido;

  beforeAll(async () => {
    fuente = await leerFuenteDeDisco();
  });

  it('cubre exactamente los 7 patrones enumerables, los mismos que fuente-web.ts', () => {
    expect(Object.keys(fuente).sort()).toEqual([...PATRONES].sort());
  });

  it('trae un plan por cada .mdx de content/planes', () => {
    expect(contarMdx('planes')).toBeGreaterThan(0);
    expect(fuente['/planes/:slug']).toHaveLength(contarMdx('planes'));
  });

  it('trae un ensayo por cada .mdx de content/ensayos', () => {
    expect(contarMdx('ensayos')).toBeGreaterThan(0);
    expect(fuente['/ensayos/:slug']).toHaveLength(contarMdx('ensayos'));
  });

  it('trae una crónica de bitácora por cada .mdx de content/blog', () => {
    expect(contarMdx('blog')).toBeGreaterThan(0);
    expect(fuente['/bitacora/:slug']).toHaveLength(contarMdx('blog'));
  });

  it('trae un documento por cada legacySlug, con el slug v2 en `actual`', () => {
    const esperados = readdirSync(join(RAIZ_V2, 'content/blog'))
      .filter((f) => f.endsWith('.mdx'))
      .reduce((total, archivo) => {
        const crudo = readFileSync(join(RAIZ_V2, 'content/blog', archivo), 'utf8');
        const bloque = /^legacySlugs:\s*\n((?: {2}- .*\n)+)/mu.exec(crudo);
        return total + (bloque === null ? 0 : (bloque[1] ?? '').trimEnd().split('\n').length);
      }, 0);

    expect(esperados).toBeGreaterThan(0);
    const documentos = fuente['/blog/:slug'] ?? [];
    expect(documentos).toHaveLength(esperados);
    for (const documento of documentos) {
      expect(documento.params['actual']).toBeDefined();
      expect(documento.params['slug']).not.toBe(documento.params['actual']);
    }
  });

  it('trae un curso y una práctica por cada course.json', () => {
    const cursos = cursosEnDisco().length;
    expect(cursos).toBeGreaterThan(0);
    expect(fuente['/entrenamientos/:slug']).toHaveLength(cursos);
    expect(fuente['/entrenamientos/:slug/practica']).toHaveLength(cursos);
  });

  it('trae una lección por cada entrada de `lessons`, numerada desde 1', () => {
    const total = cursosEnDisco().reduce((suma, curso) => {
      const crudo: unknown = JSON.parse(
        readFileSync(join(RAIZ_V2, 'content/courses', curso, 'course.json'), 'utf8'),
      );
      return suma + (crudo as { lessons: unknown[] }).lessons.length;
    }, 0);

    expect(total).toBeGreaterThan(0);
    const lecciones = fuente['/entrenamientos/:slug/leccion/:n'] ?? [];
    expect(lecciones).toHaveLength(total);
    expect(lecciones[0]?.params['n']).toBe('1');
    expect(lecciones.every((l) => l.params['slug'] !== undefined)).toBe(true);
  });

  it('ningún documento sale sin título ni con slug vacío', () => {
    for (const patron of PATRONES) {
      for (const documento of fuente[patron] ?? []) {
        const donde = `${patron} ${String(documento.params['slug'])}`;
        expect(documento.titulo.trim(), donde).not.toBe('');
        expect(documento.params['slug'], donde).not.toBe('');
        expect(typeof documento.summary, donde).toBe('string');
      }
    }
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA con `Failed to resolve import "../fuente-disco"`.

- [ ] **Paso 3: Implementación mínima**

Crear `v2/scripts/build/fuente-disco.ts`:

```ts
/**
 * El lado node de la inyección de contenido: arma la misma `FuenteDeContenido` que
 * `apps/web/src/lib/rutas/fuente-web.ts`, pero leyendo el disco.
 *
 * NUNCA importa los cinco content registries de `apps/web/src/lib/*-registry.ts`: los
 * cinco usan `import.meta.glob`, que no existe fuera de Vite. Por eso los planes salen
 * de `planes-index.generated.ts` (un módulo TS plano, que `verify-planes-index.ts` ya
 * importa desde `tsx`) y el resto de `loadContentDir` de `@v2/shared`.
 *
 * Los filtros tienen que coincidir con los de `fuente-web.ts` o el `<head>` sellado y el
 * `<head>` vivo prometerían URLs distintas: la bitácora descarta los `draft` (igual que
 * `blog-registry.ts`), y ensayos y cursos no descartan nada (igual que
 * `ensayos-registry.ts` y `courses-registry.ts`).
 *
 * Lo consumen `build-og-cards.ts` (B9), `sellar-head.ts` y `verify-registro-rutas.ts`
 * (B11) y `prerender.ts` (B12).
 */
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  blogFrontmatterSchema,
  courseJsonSchema,
  ensayoFrontmatterSchema,
  type CourseJson,
} from '@v2/shared/content';
import { loadContentDir } from '@v2/shared/content/loader';

import { PLANES_INDEX } from '../../apps/web/src/lib/planes-index.generated';
import {
  ORIGEN_CANONICO,
  type DocumentoDeRuta,
  type FuenteDeContenido,
} from '../../apps/web/src/lib/rutas/registro';

const AQUI = dirname(fileURLToPath(import.meta.url));

/** Ruta absoluta de `v2/`. Mismo patrón que `scripts/content/verify-planes-index.ts`. */
export const RAIZ_V2 = resolve(AQUI, '../..');

interface PostEnDisco {
  readonly slug: string;
  readonly titulo: string;
  readonly summary: string;
  readonly legacySlugs: readonly string[];
}

/**
 * Los planes NO dependen de `raizV2`: el índice es un módulo TypeScript, no un
 * directorio. Que coincida con `content/planes/` ya lo garantiza `pnpm planes:check`,
 * que corre en CI.
 */
function leerPlanes(): readonly DocumentoDeRuta[] {
  return [...PLANES_INDEX]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((plan) => ({ params: { slug: plan.slug }, titulo: plan.title, summary: plan.summary }));
}

async function leerEnsayos(raizV2: string): Promise<readonly DocumentoDeRuta[]> {
  const { ok, errors } = await loadContentDir(
    join(raizV2, 'content/ensayos'),
    ensayoFrontmatterSchema,
  );
  if (errors.length > 0) {
    throw new Error(`content/ensayos: ${errors.map((e) => `${e.file}: ${e.message}`).join('; ')}`);
  }
  return ok
    .map((entrada) => entrada.frontmatter)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((fm) => ({ params: { slug: fm.slug }, titulo: fm.title, summary: fm.summary }));
}

/** Mismo filtro y mismo orden que `blog-registry.ts`: sin borradores, más nuevo primero. */
async function leerPosts(raizV2: string): Promise<readonly PostEnDisco[]> {
  const { ok, errors } = await loadContentDir(join(raizV2, 'content/blog'), blogFrontmatterSchema);
  if (errors.length > 0) {
    throw new Error(`content/blog: ${errors.map((e) => `${e.file}: ${e.message}`).join('; ')}`);
  }
  return ok
    .map((entrada) => entrada.frontmatter)
    .filter((fm) => !fm.draft)
    .sort((a, b) =>
      a.publishedAt === b.publishedAt
        ? a.slug.localeCompare(b.slug)
        : b.publishedAt.localeCompare(a.publishedAt),
    )
    .map((fm) => ({
      slug: fm.slug,
      titulo: fm.title,
      summary: fm.summary,
      legacySlugs: fm.legacySlugs,
    }));
}

async function leerCursos(raizV2: string): Promise<readonly CourseJson[]> {
  const raiz = join(raizV2, 'content/courses');
  const directorios = (await readdir(raiz, { withFileTypes: true }))
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => entrada.name)
    .sort();

  const cursos: CourseJson[] = [];
  for (const directorio of directorios) {
    let crudo: string;
    try {
      crudo = await readFile(join(raiz, directorio, 'course.json'), 'utf8');
    } catch {
      continue; // un directorio sin `course.json` no es un curso
    }
    const json: unknown = JSON.parse(crudo);
    cursos.push(courseJsonSchema.parse(json));
  }
  return cursos.sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * Enumera TODO el catálogo en disco. Nunca desde una lista escrita a mano: los planes
 * pasan de 23 a 27 archivos sin tocar este archivo.
 */
export async function leerFuenteDeDisco(raizV2: string = RAIZ_V2): Promise<FuenteDeContenido> {
  const [ensayos, posts, cursos] = await Promise.all([
    leerEnsayos(raizV2),
    leerPosts(raizV2),
    leerCursos(raizV2),
  ]);

  return {
    '/planes/:slug': leerPlanes(),
    '/ensayos/:slug': ensayos,
    '/bitacora/:slug': posts.map((post) => ({
      params: { slug: post.slug },
      titulo: post.titulo,
      summary: post.summary,
    })),
    // Un documento por dirección VIEJA. `actual` lleva el slug v2, que no coincide con el
    // legacy (los legacy son las direcciones de v1 con los acentos borrados).
    '/blog/:slug': posts.flatMap((post) =>
      post.legacySlugs.map((legacy) => ({
        params: { slug: legacy, actual: post.slug },
        titulo: post.titulo,
        summary: post.summary,
      })),
    ),
    '/entrenamientos/:slug': cursos.map((curso) => ({
      params: { slug: curso.slug },
      titulo: curso.title,
      summary: curso.excerpt,
    })),
    '/entrenamientos/:slug/practica': cursos.map((curso) => ({
      params: { slug: curso.slug },
      titulo: `Práctica · ${curso.title}`,
      summary: curso.excerpt,
    })),
    // La URL usa la POSICIÓN 1-based, no el `orderIndex` del course.json (que puede
    // arrancar en 0) — es lo que resuelve `ubicarLeccion` en entrenamientos-data.
    '/entrenamientos/:slug/leccion/:n': cursos.flatMap((curso) =>
      [...curso.lessons]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((leccion, i) => ({
          params: { slug: curso.slug, n: String(i + 1) },
          titulo: leccion.title,
          summary: curso.excerpt,
        })),
    ),
  };
}

/** Origen del build. Sin barra final: todo el sellado concatena `${origen}${ruta}`. */
export function origenDelBuild(): string {
  return (process.env['VITE_SITE_ORIGIN'] ?? ORIGEN_CANONICO).replace(/\/+$/u, '');
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm lint:scripts && pnpm type-check:scripts`
Esperado: PASA — los 11 `it` de `fuente-disco.test.ts` en verde (23 planes, 21 ensayos, 22
crónicas de bitácora, 17 legacySlugs, 31 cursos, 31 prácticas, 329 lecciones) y las dos
guardias sin salida.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/scripts/build/fuente-disco.ts v2/scripts/build/__tests__/fuente-disco.test.ts
git commit -m "feat(scripts): el catálogo en disco, sin Vite — la fuente que comparten OG, sellado y prerender"
```

---

### Tarea 2: `og-plantilla.ts` — la composición, y por qué no lleva grano

**Files:**
- Create: `v2/scripts/build/og-plantilla.ts`
- Create: `v2/scripts/build/__tests__/og-plantilla.test.ts`

**Interfaces:**
- Consumes: `EntradaRegistro` (tipo), `ORIGEN_CANONICO`, `REGISTRO`, `rutaOg` de
  `../../apps/web/src/lib/rutas/registro` (B7).
- Produces (**contrato compartido, copiar literal**):
  - `export const ANCHO_OG = 1200;`
  - `export const ALTO_OG = 630;`
  - `export interface NodoSatori { readonly type: string; readonly props: { readonly style?: Readonly<Record<string, string | number>>; readonly children?: NodoSatori | readonly NodoSatori[] | string; }; }`
  - `export interface DatosTarjetaOg { readonly kicker: string; readonly titulo: string; }`
  - `export function plantillaOg(datos: DatosTarjetaOg): NodoSatori;`
  - `export function archivoOgDe(entrada: EntradaRegistro, params: Readonly<Record<string, string>>): string;`
- Produces (**cuatro exports por encima del contrato**, aditivos: ninguno cambia las
  firmas de arriba): `LARGO_MAXIMO_TITULO_OG`, `kickerDe`, `TarjetaOg`,
  `TARJETA_POR_DEFECTO`. Existen porque el kicker de §14 («card papel … + el kicker de la
  página») es dato y no está en `EntradaRegistro`; metido dentro del CLI —que no exporta
  nada— quedaba sin test. `TARJETA_POR_DEFECTO` es lo que hace de `og/default.png` una
  entrada más del catálogo en vez de un archivo especial.

- [ ] **Paso 1: Escribir el test que falla**

Crear `v2/scripts/build/__tests__/og-plantilla.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { REGISTRO, rutaOg } from '../../../apps/web/src/lib/rutas/registro';
import {
  ALTO_OG,
  ANCHO_OG,
  archivoOgDe,
  kickerDe,
  LARGO_MAXIMO_TITULO_OG,
  plantillaOg,
  TARJETA_POR_DEFECTO,
  type NodoSatori,
} from '../og-plantilla';

/** Aplana el árbol de la plantilla. */
function nodos(nodo: NodoSatori): NodoSatori[] {
  const hijos = nodo.props.children;
  if (hijos === undefined || typeof hijos === 'string') return [nodo];
  const lista = Array.isArray(hijos) ? (hijos as readonly NodoSatori[]) : [hijos as NodoSatori];
  return [nodo, ...lista.flatMap(nodos)];
}

/** Todo el texto literal que la plantilla emite. */
function textos(nodo: NodoSatori): string[] {
  return nodos(nodo)
    .map((n) => n.props.children)
    .filter((hijos): hijos is string => typeof hijos === 'string');
}

const DATOS = { kicker: 'PLAN', titulo: 'El país lo diseña la gente' };

describe('las medidas', () => {
  it('son las 1200×630 que piden §14 de la ley y todos los scrapers', () => {
    expect(ANCHO_OG).toBe(1200);
    expect(ALTO_OG).toBe(630);
  });
});

describe('plantillaOg', () => {
  it('pinta papel y mide 1200×630 en el nodo raíz', () => {
    const raiz = plantillaOg(DATOS);

    expect(raiz.props.style?.['width']).toBe('1200px');
    expect(raiz.props.style?.['height']).toBe('630px');
    expect(raiz.props.style?.['backgroundColor']).toBe('#F2EFE7');
  });

  it('escribe ¡BASTA! partido en tres: signos en violeta, letras en tinta', () => {
    const partes = nodos(plantillaOg(DATOS)).filter(
      (n) => n.props.children === '¡' || n.props.children === 'BASTA' || n.props.children === '!',
    );

    expect(partes.map((n) => n.props.children)).toEqual(['¡', 'BASTA', '!']);
    expect(partes[0]?.props.style?.['color']).toBe('#5227CC');
    expect(partes[1]?.props.style?.['color']).toBe('#16130E');
    expect(partes[2]?.props.style?.['color']).toBe('#5227CC');
  });

  it('el wordmark es Anton y es gigante', () => {
    const wordmark = nodos(plantillaOg(DATOS)).find((n) => n.props.style?.['fontSize'] === '200px');

    expect(wordmark).toBeDefined();
    expect(wordmark?.props.style?.['fontFamily']).toBe('Anton');
  });

  it('el kicker va en Space Mono, con el tracking del kicker canónico de §3', () => {
    const kicker = nodos(plantillaOg(DATOS)).find((n) => n.props.children === 'PLAN');

    expect(kicker?.props.style?.['fontFamily']).toBe('Space Mono');
    expect(kicker?.props.style?.['letterSpacing']).toBe('3.5px');
    expect(kicker?.props.style?.['color']).toBe('#7A756A');
  });

  it('escribe el título de la página', () => {
    expect(textos(plantillaOg(DATOS))).toContain('El país lo diseña la gente');
  });

  it('firma con el origen canónico, sin protocolo y sin dominio escrito a mano', () => {
    expect(textos(plantillaOg(DATOS))).toContain('elinstantedelhombregris.com');
  });

  it('acorta el título largo en un espacio y lo cierra con puntos suspensivos', () => {
    const largo =
      'Un título deliberadamente interminable que no entra en dos líneas de Anton de cuarenta y cuatro píxeles y hay que cortar en algún lado';
    expect(largo.length).toBeGreaterThan(LARGO_MAXIMO_TITULO_OG);

    const escrito = textos(plantillaOg({ kicker: 'PLAN', titulo: largo })).find((t) =>
      t.startsWith('Un título'),
    );

    expect(escrito).toBeDefined();
    expect(escrito?.length).toBeLessThanOrEqual(LARGO_MAXIMO_TITULO_OG);
    expect(escrito?.endsWith('…')).toBe(true);
    expect(escrito?.endsWith(' …')).toBe(false);
  });

  it('deja el título corto intacto, sin puntos suspensivos', () => {
    expect(textos(plantillaOg(DATOS))).toContain('El país lo diseña la gente');
    expect(textos(plantillaOg(DATOS)).some((t) => t.endsWith('…'))).toBe(false);
  });

  it('NO lleva grano de papel — son ~45 KB contra ~580 KB por tarjeta', () => {
    // §10.3 de la ley pide el overlay de feTurbulence en «toda página», así que tarde o
    // temprano alguien lo agrega acá de buena fe. Este caso es la razón por la que no
    // vuelve.
    for (const nodo of nodos(plantillaOg(DATOS))) {
      const estilo = nodo.props.style ?? {};
      expect(estilo['backgroundImage']).toBeUndefined();
      expect(estilo['mixBlendMode']).toBeUndefined();
      expect(estilo['filter']).toBeUndefined();
      expect(estilo['opacity']).toBeUndefined();
      for (const valor of Object.values(estilo)) {
        expect(String(valor)).not.toContain('feTurbulence');
        expect(String(valor)).not.toContain('data:image');
      }
    }
  });

  it('todo nodo con hijos declara display flex, que es lo único que satori maqueta', () => {
    for (const nodo of nodos(plantillaOg(DATOS))) {
      const hijos = nodo.props.children;
      if (hijos === undefined || typeof hijos === 'string') continue;
      expect(nodo.props.style?.['display'], JSON.stringify(nodo.props.style)).toBe('flex');
    }
  });
});

describe('kickerDe', () => {
  it('tiene kicker para cada sección del registro, y son 30', () => {
    const secciones = [...new Set(REGISTRO.map((entrada) => entrada.og))];

    expect(secciones).toHaveLength(30);
    for (const seccion of secciones) {
      expect(kickerDe(seccion, false), seccion).not.toBe('');
    }
  });

  it('los kickers están en mayúscula, como manda el kicker canónico de §3', () => {
    for (const entrada of REGISTRO) {
      const kicker = kickerDe(entrada.og, false);
      expect(kicker, entrada.og).toBe(kicker.toLocaleUpperCase('es-AR'));
    }
  });

  it('las cuatro secciones con tarjeta por documento dicen el singular', () => {
    expect(kickerDe('planes', true)).toBe('PLAN');
    expect(kickerDe('ensayos', true)).toBe('ENSAYO');
    expect(kickerDe('bitacora', true)).toBe('BITÁCORA');
    expect(kickerDe('entrenamientos', true)).toBe('ENTRENAMIENTO');
  });

  it('una sección sin kicker devuelve cadena vacía en vez de inventar una', () => {
    expect(kickerDe('seccion-que-no-existe', false)).toBe('');
    expect(kickerDe('seccion-que-no-existe', true)).toBe('');
  });
});

describe('archivoOgDe', () => {
  it('es exactamente `rutaOg` sin la barra inicial, para las 54 entradas', () => {
    for (const entrada of REGISTRO) {
      for (const params of [{}, { slug: 'un-slug' }]) {
        expect(`/${archivoOgDe(entrada, params)}`, entrada.patron).toBe(rutaOg(entrada, params));
      }
    }
  });

  it('la sección va suelta y el documento va en su carpeta', () => {
    const documento = REGISTRO.find((e) => e.patron === '/planes/:slug');
    const listado = REGISTRO.find((e) => e.patron === '/planes');

    expect(documento).toBeDefined();
    expect(listado).toBeDefined();
    if (documento) expect(archivoOgDe(documento, { slug: 'planeb' })).toBe('og/planes/planeb.png');
    if (listado) expect(archivoOgDe(listado, {})).toBe('og/planes.png');
  });
});

describe('TARJETA_POR_DEFECTO', () => {
  it('es una entrada más del catálogo, con el mismo tipo que las otras 127', () => {
    expect(TARJETA_POR_DEFECTO.archivo).toBe('og/default.png');
    expect(TARJETA_POR_DEFECTO.datos.kicker).not.toBe('');
    expect(TARJETA_POR_DEFECTO.datos.titulo).not.toBe('');
    expect(() => plantillaOg(TARJETA_POR_DEFECTO.datos)).not.toThrow();
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA con `Failed to resolve import "../og-plantilla"`.

- [ ] **Paso 3: Implementación mínima**

Crear `v2/scripts/build/og-plantilla.ts`:

```ts
/**
 * La plantilla de la tarjeta OG: card papel 1200×630 con «¡BASTA!» gigante entintado,
 * los signos `¡ !` en violeta, y el kicker de la página (§14 de
 * `docs/design-system/README.md`). Pura y testeable: el CLI que la rasteriza
 * (`build-og-cards.ts`) no exporta nada.
 *
 * SIN GRANO DE PAPEL, y no es un olvido. §10.3 de la ley pide el overlay de
 * `feTurbulence` en «toda página», así que tarde o temprano alguien lo va a agregar acá
 * de buena fe. Medido: la misma composición con el grano encima pasa de ~45 KB a ~580 KB
 * por tarjeta, por 128 tarjetas que se COMMITEAN. El grano es una firma de pantalla, no
 * de miniatura: a 300×157 en el timeline de alguien no se ve, y a tamaño completo el
 * scraper ya lo recomprimió. Si vuelve, el caso «NO lleva grano de papel» de
 * `__tests__/og-plantilla.test.ts` se pone rojo.
 *
 * Los hex van literales e inline, como manda §2 de la ley. La prohibición del hex
 * literal es de los TSX (ahí mandan los tokens de Tailwind): esto es un script de build,
 * satori no lee `tailwind.config.ts` y no hay clase que aplicar.
 */
import {
  ORIGEN_CANONICO,
  type EntradaRegistro,
} from '../../apps/web/src/lib/rutas/registro';

export const ANCHO_OG = 1200;
export const ALTO_OG = 630;

/** Nodo mínimo que satori acepta, tipado a mano para no meter `any`. */
export interface NodoSatori {
  readonly type: string;
  readonly props: {
    readonly style?: Readonly<Record<string, string | number>>;
    readonly children?: NodoSatori | readonly NodoSatori[] | string;
  };
}

export interface DatosTarjetaOg {
  readonly kicker: string;
  readonly titulo: string;
}

/**
 * Dos líneas de Anton a 44px en 1040px de caja entran hasta ~100 caracteres. El título
 * más largo del catálogo tiene 89, así que hoy no corta a nadie: el tope está para que
 * un documento nuevo no descuelgue el pie de la tarjeta.
 */
export const LARGO_MAXIMO_TITULO_OG = 96;

const PAPEL = '#F2EFE7';
const TINTA = '#16130E';
const TINTA_90 = '#33302A';
const TINTA_50 = '#7A756A';
const VIOLETA = '#5227CC';

/** El dominio sin protocolo, para el pie de la tarjeta. Nunca escrito a mano. */
const DOMINIO = ORIGEN_CANONICO.replace(/^https?:\/\//u, '');

const TAGLINE = 'El país lo diseña la gente';

/**
 * Un kicker por cada valor distinto de `og` en `REGISTRO`. Son 30, y el test exige que
 * estén los 30: una sección nueva sin kicker no shippea.
 */
const KICKER_DE_SECCION: Readonly<Record<string, string>> = {
  apoyo: 'APOYO',
  areas: 'ÁREAS DE VIDA',
  biblioteca: 'BIBLIOTECA',
  bitacora: 'LA BITÁCORA',
  'check-in': 'CHECK-IN SEMANAL',
  clasificacion: 'CLASIFICACIÓN',
  coaching: 'ACOMPAÑAMIENTO',
  comunidad: 'COMUNIDAD',
  'costo-humano': 'EL COSTO HUMANO',
  cronica: 'LA CRÓNICA',
  'datos-abiertos': 'DATOS ABIERTOS',
  desafios: 'DESAFÍOS',
  'el-mapa': 'EL MAPA',
  ensayos: 'ENSAYOS',
  entrada: 'ENTRADA',
  entrenamientos: 'ENTRENAMIENTOS',
  evaluacion: 'AUTO-EVALUACIÓN',
  home: 'PORTADA',
  iniciativas: 'INICIATIVAS',
  'la-idea': 'LA IDEA',
  mandato: 'MANDATO VIVO',
  manifiesto: 'EL MANIFIESTO',
  notificaciones: 'NOTIFICACIONES',
  objetivos: 'OBJETIVOS',
  perfil: 'PERFIL',
  planes: 'LOS PLANES',
  prensa: 'KIT DE PRENSA',
  privacidad: 'PRIVACIDAD',
  sembrar: 'SEMBRAR',
  tablero: 'TABLERO',
};

/** Las cuatro secciones con `ogPorDocumento: true` dicen el singular. */
const KICKER_DE_DOCUMENTO: Readonly<Record<string, string>> = {
  bitacora: 'BITÁCORA',
  ensayos: 'ENSAYO',
  entrenamientos: 'ENTRENAMIENTO',
  planes: 'PLAN',
};

/** `''` cuando la sección no tiene kicker: el CLI corta antes de emitir un PNG mudo. */
export function kickerDe(og: string, esDocumento: boolean): string {
  if (esDocumento) return KICKER_DE_DOCUMENTO[og] ?? KICKER_DE_SECCION[og] ?? '';
  return KICKER_DE_SECCION[og] ?? '';
}

export interface TarjetaOg {
  /** Ruta relativa a `apps/web/public/`, sin barra inicial. */
  readonly archivo: string;
  readonly datos: DatosTarjetaOg;
}

/**
 * `og/default.png` no es un archivo especial: es una entrada más del catálogo, con la
 * misma plantilla que las otras 127. Es el `OG_POR_DEFECTO` de `registro.ts` y el
 * respaldo permanente de toda URL que no matchee el registro.
 */
export const TARJETA_POR_DEFECTO: TarjetaOg = {
  archivo: 'og/default.png',
  datos: {
    kicker: 'EL INSTANTE DEL HOMBRE GRIS',
    titulo: 'La ciudadanía diseña. El Estado administra. La política ejecuta.',
  },
};

function acortar(texto: string): string {
  const limpio = texto.trim().replace(/\s+/gu, ' ');
  if (limpio.length <= LARGO_MAXIMO_TITULO_OG) return limpio;

  const corte = limpio.slice(0, LARGO_MAXIMO_TITULO_OG - 1);
  const espacio = corte.lastIndexOf(' ');
  return `${(espacio > 0 ? corte.slice(0, espacio) : corte).trimEnd()}…`;
}

/**
 * Todo nodo con hijos declara `display: flex`: es lo único que satori sabe maquetar, y
 * sin eso tira `Expected <div> to have explicit "display: flex"`.
 */
export function plantillaOg(datos: DatosTarjetaOg): NodoSatori {
  return {
    type: 'div',
    props: {
      style: {
        width: `${String(ANCHO_OG)}px`,
        height: `${String(ALTO_OG)}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: PAPEL,
        padding: '72px 80px',
        fontFamily: 'Anton',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: 'Space Mono',
              fontSize: '22px',
              letterSpacing: '3.5px',
              color: TINTA_50,
            },
            children: datos.kicker,
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontFamily: 'Anton',
                    fontSize: '200px',
                    lineHeight: 1,
                    color: TINTA,
                  },
                  children: [
                    { type: 'span', props: { style: { color: VIOLETA }, children: '¡' } },
                    { type: 'span', props: { style: { color: TINTA }, children: 'BASTA' } },
                    { type: 'span', props: { style: { color: VIOLETA }, children: '!' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    marginTop: '28px',
                    fontFamily: 'Anton',
                    fontSize: '44px',
                    lineHeight: 1.12,
                    color: TINTA_90,
                  },
                  children: acortar(datos.titulo),
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'Space Mono',
              fontSize: '20px',
              color: TINTA_50,
            },
            children: [
              { type: 'span', props: { children: DOMINIO } },
              { type: 'span', props: { children: TAGLINE } },
            ],
          },
        },
      ],
    },
  };
}

/**
 * `ogPorDocumento: false` → `og/<og>.png`; `true` → `og/<og>/<slug>.png`. Ruta relativa a
 * `apps/web/public/`. Es `rutaOg` de `registro.ts` sin la barra inicial, y el test lo
 * verifica entrada por entrada.
 */
export function archivoOgDe(
  entrada: EntradaRegistro,
  params: Readonly<Record<string, string>>,
): string {
  const slug = params['slug'];
  if (!entrada.ogPorDocumento || slug === undefined || slug === '') {
    return `og/${entrada.og}.png`;
  }
  return `og/${entrada.og}/${slug}.png`;
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm lint:scripts && pnpm type-check:scripts`
Esperado: PASA — los 18 `it` de `og-plantilla.test.ts` en verde y las dos guardias sin
salida.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/scripts/build/og-plantilla.ts v2/scripts/build/__tests__/og-plantilla.test.ts
git commit -m "feat(scripts): la composición de la tarjeta OG — papel, ¡BASTA! entintado y cero grano"
```

---

### Tarea 3: `build-og-cards.ts` — satori, resvg y las 128 tarjetas commiteadas

**Files:**
- Modify: `v2/package.json` (`devDependencies`: `@resvg/resvg-js`, `satori`; `scripts`: `og:build`)
- Create: `v2/scripts/build/build-og-cards.ts`
- Create: `v2/scripts/build/__tests__/og-cards.test.ts`
- Create (generados y commiteados): `v2/apps/web/public/og/*.png` y
  `v2/apps/web/public/og/{bitacora,ensayos,entrenamientos,planes}/*.png` — 128 archivos

**Interfaces:**
- Consumes: `buscarEntrada`, `enumerarUrls`, `resolverDocumento`, `rutaOg` de
  `../../apps/web/src/lib/rutas/registro` (B7) · `leerFuenteDeDisco`, `origenDelBuild`,
  `RAIZ_V2` de `./fuente-disco` (Tarea 1) · `ALTO_OG`, `ANCHO_OG`, `archivoOgDe`,
  `kickerDe`, `plantillaOg`, `TARJETA_POR_DEFECTO`, `TarjetaOg` de `./og-plantilla`
  (Tarea 2) · `satori` y `@resvg/resvg-js` como **devDependencies** · los TTF de
  `scripts/build/fonts-src/`.
- Produces: `apps/web/public/og/` con 128 PNG commiteados. Los referencia B11 vía
  `MetadataDeRuta.og`; `og/default.png` es el `OG_POR_DEFECTO` del registro.
- **`buscarEntrada` y `resolverDocumento` no están en la lista del contrato para este
  archivo**, pero sí en la de `registro.ts`, y hacen falta: `enumerarUrls` devuelve
  `{ ruta, entrada, metadata }` **sin los `params`**, y sin `params` no hay slug ni título
  de documento. El CLI los recupera y después verifica que el archivo que va a escribir
  coincida con el `og:image` que la propia metadata declara; si alguna vez no coinciden,
  corta con un mensaje.

> **Los TTF son los COMPLETOS de `scripts/build/fonts-src/`, no los `.woff2` de
> `public/fonts/`.** satori no soporta woff2 (sólo TTF/OTF/WOFF) y el subset de §5 no trae
> todos los glifos que puede necesitar un título. El plan A ya dejó `fonts-src/` poblado y
> tapado por `.gitignore`.

> **Y son sólo las dos caras ESTÁTICAS.** Verificado contra satori 0.29.0: pasarle
> `Archivo[wdth,wght].ttf` tira
> `TypeError: Cannot read properties of undefined (reading '256')` desde `parseFvarAxis`
> de `@shuding/opentype.js` — no sabe leer la tabla `fvar` de las variables de Google
> Fonts. La composición usa Anton para el wordmark y el título, y Space Mono para el
> kicker y el pie: las dos estáticas. Ninguna cara variable entra a este CLI.

- [ ] **Paso 1: Escribir el test que falla**

Crear `v2/scripts/build/__tests__/og-cards.test.ts`:

```ts
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { enumerarUrls } from '../../../apps/web/src/lib/rutas/registro';
import { leerFuenteDeDisco, origenDelBuild, RAIZ_V2 } from '../fuente-disco';
import { ALTO_OG, ANCHO_OG, TARJETA_POR_DEFECTO } from '../og-plantilla';

const PUBLIC = join(RAIZ_V2, 'apps/web/public');
const DESTINO = join(PUBLIC, 'og');

/** Firma PNG: \x89 P N G \r \n \x1a \n. */
const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Techo por tarjeta. Medido sobre la composición real con los TTF reales: la más liviana
 * pesa 33.331 bytes y la del título más largo del catálogo, 47.591. La MISMA composición
 * con el grano de §10.3 encima pasa de ~580 KB, así que este número es la guardia
 * empírica contra el grano: no hace falta decodificar el PNG para detectarlo.
 */
const TECHO_POR_TARJETA = 80 * 1024;

/** Ancho y alto declarados en el IHDR — bytes 16..23, big-endian. */
function medidasPng(bytes: Buffer): { ancho: number; alto: number } {
  return { ancho: bytes.readUInt32BE(16), alto: bytes.readUInt32BE(20) };
}

/** Todos los .png bajo `og/`, en rutas relativas a `apps/web/public/`. */
function pngsEnDisco(directorio: string = DESTINO, prefijo = 'og'): string[] {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    if (entrada.isDirectory()) {
      return pngsEnDisco(join(directorio, entrada.name), `${prefijo}/${entrada.name}`);
    }
    return entrada.name.endsWith('.png') ? [`${prefijo}/${entrada.name}`] : [];
  });
}

describe('las tarjetas OG commiteadas', () => {
  let esperadas: Set<string>;

  beforeAll(async () => {
    const origen = origenDelBuild();
    const urls = enumerarUrls({ origen, fuente: await leerFuenteDeDisco() });

    // Derivadas del `og:image` que declara la propia metadata — el camino INDEPENDIENTE
    // del `archivoOgDe(entrada, params)` que usa el CLI. Si los dos caminos discrepan,
    // este test lo ve.
    esperadas = new Set<string>([TARJETA_POR_DEFECTO.archivo]);
    for (const url of urls) esperadas.add(url.metadata.og.slice(origen.length + 1));
  });

  it('el catálogo no está vacío ni es un puñado: son las secciones más los documentos', () => {
    expect(esperadas.size).toBeGreaterThanOrEqual(100);
    expect(esperadas.has('og/default.png')).toBe(true);
    expect(esperadas.has('og/planes.png')).toBe(true);
    expect(esperadas.has('og/planes/planeb.png')).toBe(true);
  });

  it('existe un PNG por cada URL que el sitio enumera', () => {
    const faltantes = [...esperadas].filter(
      (archivo) => statSync(join(PUBLIC, archivo), { throwIfNoEntry: false }) === undefined,
    );

    expect(faltantes).toEqual([]);
  });

  it('no hay tarjetas huérfanas: nada en og/ que el registro no pida', () => {
    expect(pngsEnDisco().filter((archivo) => !esperadas.has(archivo))).toEqual([]);
  });

  it('cada tarjeta es un PNG de 1200×630', () => {
    for (const archivo of esperadas) {
      const bytes = readFileSync(join(PUBLIC, archivo));
      expect(bytes.subarray(0, 8), archivo).toEqual(FIRMA_PNG);
      expect(medidasPng(bytes), archivo).toEqual({ ancho: ANCHO_OG, alto: ALTO_OG });
    }
  });

  it('ninguna tarjeta trae grano: el grano las llevaría de ~45 KB a ~580 KB', () => {
    const pesadas = [...esperadas]
      .map((archivo) => ({ archivo, bytes: statSync(join(PUBLIC, archivo)).size }))
      .filter((tarjeta) => tarjeta.bytes > TECHO_POR_TARJETA);

    expect(pesadas).toEqual([]);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA — los casos de `og-cards.test.ts` rompen con
`ENOENT: no such file or directory` sobre `apps/web/public/og`. El directorio no existe:
el plan A lo dejó explícitamente sin crear.

- [ ] **Paso 3: Instalar satori y resvg como devDependencies**

En `v2/package.json`, dentro de `devDependencies`, agregar respetando el orden alfabético
existente — `@resvg/resvg-js` justo después de `"@playwright/test"`, y `satori` justo
después de `"prettier-plugin-tailwindcss"`:

```json
    "@resvg/resvg-js": "^2.6.2",
```
```json
    "satori": "^0.29.0",
```

Y en `scripts`, junto a las otras CLI de corrida manual (`planes:migrar`, `fonts:subset`,
`marca:build`):

```json
    "og:build": "tsx scripts/build/build-og-cards.ts",
```

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm install && pnpm deps:check && \
  node -e "import('@resvg/resvg-js').then(m => console.log('resvg', typeof m.Resvg))"
```
Esperado: instala; `deps:check` **no mueve su cuenta de deps de producción** (las dos son
devDependencies y no cuentan); la última línea imprime `resvg function` — el binario
nativo prebuilt de `@resvg/resvg-js` cargó, sin paso de compilación.

- [ ] **Paso 4: Escribir el CLI**

Crear `v2/scripts/build/build-og-cards.ts`:

```ts
/**
 * CLI de corrida manual: rasteriza las 128 tarjetas OG y las deja commiteadas en
 * `apps/web/public/og/`. Mismo patrón que `build-marca.ts` y que `scripts/build/geo/`,
 * cuyas salidas también están commiteadas: no corre en CI, corre a mano cuando cambia la
 * composición o entra un documento nuevo. La guardia de que nadie se olvide de correrlo
 * es `__tests__/og-cards.test.ts`, que sí corre dentro de `pnpm verify`.
 *
 * satori maqueta y emite SVG; `@resvg/resvg-js` lo rasteriza. Las dos son
 * devDependencies: `apps/web` no gana ni un byte de producción.
 *
 * Run: pnpm og:build
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

import {
  buscarEntrada,
  enumerarUrls,
  resolverDocumento,
  rutaOg,
} from '../../apps/web/src/lib/rutas/registro';

import { leerFuenteDeDisco, origenDelBuild, RAIZ_V2 } from './fuente-disco';
import {
  ALTO_OG,
  ANCHO_OG,
  archivoOgDe,
  kickerDe,
  plantillaOg,
  TARJETA_POR_DEFECTO,
  type NodoSatori,
  type TarjetaOg,
} from './og-plantilla';

const PUBLIC = join(RAIZ_V2, 'apps/web/public');
const DESTINO = join(PUBLIC, 'og');
const FUENTES = join(RAIZ_V2, 'scripts/build/fonts-src');

interface CaraCargada {
  readonly name: string;
  readonly data: Buffer;
  readonly weight: 400;
  readonly style: 'normal';
}

/**
 * satori tipa su primer parámetro como el `ReactNode` de react, que no resuelve desde
 * `v2/node_modules`: con `skipLibCheck` no es un error, pero deja el parámetro en `any`.
 * Se lo re-tipa acá UNA sola vez, así ninguna llamada del archivo pasa un `any` y no hay
 * que apagar ninguna regla.
 */
const maquetar = satori as unknown as (
  nodo: NodoSatori,
  opciones: { width: number; height: number; fonts: readonly CaraCargada[] },
) => Promise<string>;

/**
 * Las DOS caras estáticas, y sólo esas.
 *
 * NO agregar `Archivo[wdth,wght].ttf` ni ninguna otra variable: satori 0.29.0 explota
 * parseando su tabla `fvar` con
 * `TypeError: Cannot read properties of undefined (reading '256')` desde `parseFvarAxis`
 * de `@shuding/opentype.js`. Verificado contra los TTF de Google Fonts que baja el plan A.
 *
 * Y son los TTF COMPLETOS de `fonts-src/`, no los `.woff2` de `public/fonts/`: satori no
 * soporta woff2, y el subset de §5 no trae todos los glifos que puede necesitar un título.
 */
const CARAS = [
  { name: 'Anton', archivo: 'Anton-Regular.ttf' },
  { name: 'Space Mono', archivo: 'SpaceMono-Regular.ttf' },
];

async function cargarFuentes(): Promise<readonly CaraCargada[]> {
  const cargadas: CaraCargada[] = [];
  for (const cara of CARAS) {
    let data: Buffer;
    try {
      data = await readFile(join(FUENTES, cara.archivo));
    } catch {
      throw new Error(
        `Falta ${cara.archivo} en scripts/build/fonts-src/. Bajá los TTF con el bloque de curl ` +
          `de docs/plans/2026-07-26-sustrato-a-fundaciones.md (tarea «subsetear y commitear ` +
          `los .woff2»).`,
      );
    }
    cargadas.push({ name: cara.name, data, weight: 400, style: 'normal' });
  }
  return cargadas;
}

/** Todas las tarjetas del sitio, sin repetir: las secciones, los documentos y la por defecto. */
async function catalogo(origen: string): Promise<readonly TarjetaOg[]> {
  const fuente = await leerFuenteDeDisco();
  const tarjetas = new Map<string, TarjetaOg>([
    [TARJETA_POR_DEFECTO.archivo, TARJETA_POR_DEFECTO],
  ]);

  for (const url of enumerarUrls({ origen, fuente })) {
    // `enumerarUrls` no devuelve los `params`: se recuperan matcheando la ruta ya
    // sustituida. En los shells de las rutas `dinamica` no hay match (el prefijo de
    // rewrite no es una ruta completa) y tampoco hace falta: son `ogPorDocumento: false`.
    const coincidencia = buscarEntrada(url.ruta);
    const params =
      coincidencia !== undefined && coincidencia.entrada === url.entrada
        ? coincidencia.params
        : {};

    const archivo = archivoOgDe(url.entrada, params);
    const declarado = `${origen}${rutaOg(url.entrada, params)}`;
    if (declarado !== url.metadata.og) {
      throw new Error(
        `${url.ruta}: la tarjeta que se escribiría (${archivo}) no es la que declara la ` +
          `metadata (${url.metadata.og}). Revisá rutaOg y archivoOgDe.`,
      );
    }
    if (tarjetas.has(archivo)) continue;

    const documento = resolverDocumento(url.entrada.patron, params, fuente);
    const kicker = kickerDe(url.entrada.og, documento !== undefined);
    if (kicker === '') {
      throw new Error(
        `La sección «${url.entrada.og}» (${url.entrada.patron}) no tiene kicker en ` +
          `og-plantilla.ts. Agregalo a KICKER_DE_SECCION antes de emitir su tarjeta.`,
      );
    }

    tarjetas.set(archivo, {
      archivo,
      datos: { kicker, titulo: documento?.titulo ?? url.entrada.titulo },
    });
  }

  return [...tarjetas.values()];
}

async function main(): Promise<void> {
  const origen = origenDelBuild();
  const fuentes = await cargarFuentes();
  const tarjetas = await catalogo(origen);

  // Borrado y regeneración completa: así una sección renombrada no deja un PNG huérfano
  // commiteado para siempre.
  await rm(DESTINO, { recursive: true, force: true });

  let bytes = 0;
  for (const tarjeta of tarjetas) {
    const svg = await maquetar(plantillaOg(tarjeta.datos), {
      width: ANCHO_OG,
      height: ALTO_OG,
      fonts: fuentes,
    });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: ANCHO_OG } }).render().asPng();

    const salida = join(PUBLIC, tarjeta.archivo);
    await mkdir(dirname(salida), { recursive: true });
    await writeFile(salida, png);
    bytes += png.length;
  }

  process.stdout.write(
    `${String(tarjetas.length)} tarjetas OG en apps/web/public/og/ ` +
      `(${String(Math.round(bytes / 1024))} KB en total, ` +
      `${String(Math.round(bytes / tarjetas.length / 1024))} KB de promedio).\n`,
  );
}

await main();
```

- [ ] **Paso 5: Generar las tarjetas**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm og:build && \
  ls apps/web/public/og && find apps/web/public/og -name '*.png' | wc -l && du -sh apps/web/public/og
```
Esperado: imprime `128 tarjetas OG en apps/web/public/og/ (…KB en total, …KB de promedio)`;
el `ls` muestra los 30 PNG de sección más `default.png` más los cuatro directorios
`bitacora/ ensayos/ entrenamientos/ planes/`; el `find` cuenta **128**; el `du` da del
orden de 5 MB.

- [ ] **Paso 6: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm lint:scripts && pnpm type-check:scripts`
Esperado: PASA — los 5 `it` de `og-cards.test.ts` en verde (existen las 128, ninguna
huérfana, todas 1200×630, ninguna por encima de 80 KB) y las dos guardias sin salida.

- [ ] **Paso 7: Mirar tres tarjetas antes de commitear 128 binarios**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && \
  open apps/web/public/og/default.png apps/web/public/og/home.png \
       apps/web/public/og/planes/planruta.png
```
Esperado, en las tres: fondo papel `#F2EFE7`; kicker en Space Mono arriba a la izquierda
(`EL INSTANTE DEL HOMBRE GRIS` · `PORTADA` · `PLAN`); `¡BASTA!` gigante en Anton con **los
dos signos en violeta** y las cinco letras en tinta; debajo el título en Anton, en una o
dos líneas, sin tocar el borde; abajo `elinstantedelhombregris.com` a la izquierda y
`El país lo diseña la gente` a la derecha. **Sin textura de grano.** Si alguna letra sale
con la fuente del sistema en vez de Anton, se está leyendo un `.woff2` subseteado en lugar
del TTF completo.

- [ ] **Paso 8: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/package.json v2/pnpm-lock.yaml \
        v2/scripts/build/build-og-cards.ts v2/scripts/build/__tests__/og-cards.test.ts \
        v2/apps/web/public/og
git commit -m "feat(web): 128 tarjetas OG papel — una por sección y una por documento"
```

---

### Tarea 4: Cierre de B9 — la cuenta, el peso y las notas de coordinación

**Files:**
- Modify: ninguno. Es la verificación cruzada del bloque y el registro escrito de las tres
  decisiones que los bloques siguientes necesitan conocer.

**Interfaces:**
- Consumes: todo lo de las Tareas 1–3.
- Produces: la evidencia de que B9 no agregó dependencias de producción, y las tres notas
  de coordinación (plan A, B11, B12/B13).

- [ ] **Paso 1: Verificar que no entró ni una dependencia de producción**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm deps:check`
Esperado: PASA con la **misma cuenta de deps de producción** que antes de la Tarea 3.
`satori` y `@resvg/resvg-js` son devDependencies: el bundle de `apps/web` no cambió. Si la
cuenta subió, alguna de las dos entró a `dependencies` por error.

- [ ] **Paso 2: Verificar la cuenta y el peso de lo commiteado**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && \
  git ls-files apps/web/public/og | wc -l && \
  git ls-files apps/web/public/og | xargs stat -f '%z %N' | sort -rn | head -3 && \
  du -sh apps/web/public/og
```
Esperado: **128** archivos trackeados; las tres más pesadas por debajo de 81.920 bytes (el
techo del test); el total del orden de 5 MB.

**La decisión que registra este paso.** §9 de la spec dice «PNG-8» y estima ~8 KB por
tarjeta. `@resvg/resvg-js` 2.6.2 emite siempre RGBA de 8 bits por canal (IHDR
`bitDepth=8`, `colorType=6`) y no tiene opción de paleta: pasarle `background: '#F2EFE7'`
devuelve exactamente los mismos bytes. Bajar a paleta de 256 colores pide un cuantizador
nativo (`pngquant`) que descarga binarios en `install`, para ahorrar ~3,5 MB en un repo
que ya lleva 5,1 MB de cuerpos de planes. **Se emite lo que da resvg**, y «PNG-8» se
cumple como *8 bits por canal, sin grano y por debajo de 80 KB por tarjeta*, que es lo que
el test hace cumplir. Sin cuantizador tampoco hay dependencia nueva de ningún tipo en el
camino de producción.

- [ ] **Paso 3: Verificación completa**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm verify`
Esperado: PASA — `lint` (incluido `scripts/`), `type-check` (incluido `scripts/`),
`test:unit`, `test:scripts` (con `fuente-disco.test.ts`, `og-plantilla.test.ts` y
`og-cards.test.ts`), `test:integration` y `build` en verde. El `build` copia
`apps/web/public/og/` entero al `dist`.

- [ ] **Paso 4: Verificar que la guardia contra el grano puede fallar**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && \
  cp apps/web/public/og/default.png /tmp/og-default-respaldo.png && \
  dd if=/dev/urandom of=apps/web/public/og/default.png bs=1024 count=600 2>/dev/null; \
  pnpm test:scripts; \
  cp /tmp/og-default-respaldo.png apps/web/public/og/default.png && \
  rm /tmp/og-default-respaldo.png && git status --short apps/web/public/og
```
Esperado: `pnpm test:scripts` **FALLA** con dos casos rojos de `og-cards.test.ts` — el de
las medidas (`og/default.png` deja de tener la firma PNG) y el del techo de peso
(614.400 > 81.920). Después de restaurar, `git status --short` no imprime nada. Este paso
demuestra que el techo de 80 KB no es decorativo: una tarjeta con el grano de §10.3 pesa
~580 KB y se pone roja acá.

- [ ] **Paso 5: Dejar escritas las tres notas de coordinación**

Éste es el estado acordado del bloque. No hay archivo que editar: quedan acá, y los
bloques que siguen las leen desde este plan.

**1 · Con el plan A (B3) — `og/default.png` tiene un solo dueño, y es B9.** El plan A ya
escribió su mitad: su tarea «B3 — la marca de la pestaña es la de v2» no rasteriza la card
OG con el Chromium de Playwright, `marca.ts` lleva el comentario que lo dice, y su test
afirma que después de `pnpm marca:build` **no existe** `apps/web/public/og/`. Ésta es la
otra mitad: `og/default.png` sale de `build-og-cards.ts` con satori, como la entrada
`TARJETA_POR_DEFECTO` del mismo catálogo y con la misma plantilla que las otras 127. No
hay semilla, no hay fallback provisorio, y no hay dos motores de layout sobre la misma
composición. **Consecuencia operativa:** a partir de este bloque `apps/web/public/og/`
existe, así que el comando de control de esa tarea del plan A
(`ls -la apps/web/public apps/web/public/og`, «no hay `og/`») describe el estado de su
primera corrida, no un invariante — volver a correr `pnpm marca:build` después de B9 no
toca `og/` y no rompe nada. La fila **B3** de «Orden de trabajo» de la spec, que le
adjudica `og/default.png` a ese bloque, queda corregida por este par de notas.

**2 · Con B11 (sellado + sitemap + host) — `fuente-disco.ts` ya existe.** La Tarea 1 de
este bloque lo creó, con test, porque B9 es el primero de sus cuatro consumidores en el
orden del plan D. `sellar-head.ts` y `verify-registro-rutas.ts` lo importan tal cual. El
bloque B11 traía su propia copia de esa tarea y en este plan quedó descartada: cuando
empieza la Tarea 5, `fuente-disco.ts` ya existe con su test. Y
`OG_POR_DEFECTO = '/og/default.png'` ya apunta a un archivo que existe en el disco, así
que el sellado no tiene que emitir ningún fallback condicional.

**3 · Con B12 (prerender) y B13 (verificación) — qué esperar de las tarjetas.** El
`<head>` sellado de las 329 lecciones, de las 31 prácticas y de las rutas servidas por la
base referencia la tarjeta de **su sección** (`/og/entrenamientos.png`,
`/og/mandato.png`, `/og/iniciativas.png`), no una propia: es `ogPorDocumento: false` en el
registro, y el caso de huérfanas de la Tarea 3 se pone rojo si alguien genera las 400.
Las cinco URLs de la DoD #1 las golpean las tareas del bloque B13.
Para la DoD #1, las cinco URLs que B13 va a golpear con `curl -A facebookexternalhit`
tienen **tarjeta propia**: la portada (`og/home.png`), un plan
(`og/planes/<slug>.png`), un ensayo (`og/ensayos/<slug>.png`), una crónica de bitácora
(`og/bitacora/<slug>.png`) y un entrenamiento (`og/entrenamientos/<slug>.png`).

- [ ] **Paso 6: Cierre sin commit**

Esta tarea no modifica archivos: el bloque B9 cierra con los tres commits de las Tareas 1,
2 y 3.

Comando de control: `cd /Users/juanb/Desktop/ElInstantedelHombreGris && git status --short v2`
Esperado: sin salida — el árbol quedó limpio después del Paso 4.

---

## Bloque B11 — Sellado del head, sitemap y host

> **Dependencias del bloque.** B11 depende de **B7** (`apps/web/src/lib/rutas/registro.ts` con
> `enumerarUrls`, `enumerarRedirecciones`, `resolverMetadata`, `entraAlSitemap`, `TARJETA_TWITTER`),
> de **B1** (`scripts/` en `pnpm lint`/`pnpm type-check`, `@v2/shared` y `@types/node` como
> devDependencies de la raíz, `scripts/build/limpieza.ts`), de **B2** (el shell de
> `apps/web/index.html` sin `class="dark"`, con el `<title>` en formato §14 y el `<noscript>`) y
> de **B3**/**B9** para que los PNG que las etiquetas `og:image` referencian existan.
> Ninguna tarea de este bloque toca `apps/web/src/`.

> **Todos los comandos de este bloque se corren desde `/Users/juanb/Desktop/ElInstantedelHombreGris/v2`**,
> salvo indicación contraria: los `git add` de sus tareas son relativos a `v2/`.

> **`fuente-disco.ts` ya existe cuando empieza este bloque.** El fragmento original de B11 abría
> con su propia tarea para crearlo; en el ensamblado quedó descartada, porque la **Tarea 1**
> (bloque B9) entrega ese mismo archivo con su test. Las tareas de acá lo importan tal cual.

---

### Tarea 5: `sellado.ts` — escapado, ruta de archivo y sellado del shell

**Files:**
- Create: `scripts/build/sellado.ts`
- Test: `scripts/build/__tests__/sellado.test.ts`

**Interfaces:**
- Consumes: `TARJETA_TWITTER`, `MetadataDeRuta` de `../../apps/web/src/lib/rutas/registro` (B7).
- Produces: `escaparHtml(texto: string): string`, `archivoDe(ruta: string): string`, `sellarShell(shell: string, metadata: MetadataDeRuta): string`. La Tarea 6 agrega `generarSitemap`, `generarRobots`, `RedirectDeHost` y `redirectsDeHost` a este mismo archivo. B12 reusa `archivoDe`.

- [ ] **Paso 1: Escribir el test que falla**

Crear `scripts/build/__tests__/sellado.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  componerTitulo,
  resolverMetadata,
  REGISTRO,
  TARJETA_TWITTER,
  type FuenteDeContenido,
  type OpcionesDeResolucion,
} from '../../../apps/web/src/lib/rutas/registro';
import { leerFuenteDeDisco, RAIZ_V2 } from '../fuente-disco';
import { archivoDe, escaparHtml, sellarShell } from '../sellado';

const ORIGEN = 'https://ejemplo.test';

/**
 * El shell REAL de `apps/web/index.html` (B2), no una maqueta: si B2 cambia el
 * formato del `<title>` o la forma de la `<meta name="description">`, este test
 * se pone rojo en vez de dejar pasar un sellado que no reemplaza nada.
 */
const SHELL = readFileSync(join(RAIZ_V2, 'apps/web/index.html'), 'utf8');

const TITULO_DE_PORTADA = componerTitulo(
  REGISTRO.find((entrada) => entrada.patron === '/')?.titulo ?? '(sin entrada)',
);

let opciones: OpcionesDeResolucion;
let fuente: FuenteDeContenido;

beforeAll(async () => {
  fuente = await leerFuenteDeDisco();
  opciones = { origen: ORIGEN, fuente };
});

describe('el shell de partida', () => {
  it('trae el título de la portada y ninguna etiqueta social — sin esto el sellado no probaría nada', () => {
    expect(SHELL).toContain(`<title>${TITULO_DE_PORTADA}</title>`);
    expect(SHELL).toMatch(/<meta\b[^>]*\bname="description"[^>]*>/u);
    expect(SHELL).not.toContain('og:title');
    expect(SHELL).not.toContain('twitter:card');
    expect(SHELL).not.toContain('rel="canonical"');
  });
});

describe('escaparHtml', () => {
  it('escapa los cinco caracteres que rompen un atributo', () => {
    expect(escaparHtml(`a&b<c>d"e'f`)).toBe('a&amp;b&lt;c&gt;d&quot;e&#39;f');
  });

  it('no toca las comillas angulares ni los signos de apertura', () => {
    expect(escaparHtml('«¡BASTA!»')).toBe('«¡BASTA!»');
  });
});

describe('archivoDe', () => {
  it('la raíz es el index del dist', () => {
    expect(archivoDe('/')).toBe('index.html');
  });

  it('cada ruta recibe su propio directorio', () => {
    expect(archivoDe('/planes/planeb')).toBe('planes/planeb/index.html');
    expect(archivoDe('/entrenamientos/basta-101/leccion/3')).toBe(
      'entrenamientos/basta-101/leccion/3/index.html',
    );
  });

  it('tolera la barra final y no emite rutas absolutas', () => {
    expect(archivoDe('/ingresar/')).toBe('ingresar/index.html');
    expect(archivoDe('/ingresar').startsWith('/')).toBe(false);
  });
});

describe('sellarShell', () => {
  it('un plan queda con su propio título, no con el de la portada', () => {
    const planes = fuente['/planes/:slug'] ?? [];
    const primero = planes[0];
    expect(primero).toBeDefined();
    if (!primero) return;

    const ruta = `/planes/${primero.params['slug'] ?? ''}`;
    const sellado = sellarShell(SHELL, resolverMetadata(ruta, opciones));

    expect(sellado).toContain(`<title>${escaparHtml(componerTitulo(primero.titulo))}</title>`);
    expect(sellado).not.toContain(`<title>${TITULO_DE_PORTADA}</title>`);
    expect(sellado).toContain(`<link rel="canonical" href="${ORIGEN}${ruta}" />`);
    expect(sellado).toContain(`<meta property="og:url" content="${ORIGEN}${ruta}" />`);
    expect(sellado).toContain(`<meta name="twitter:card" content="${TARJETA_TWITTER}" />`);
    expect(sellado).toContain(`content="${ORIGEN}/og/planes/${primero.params['slug'] ?? ''}.png"`);
  });

  it('dos planes distintos no comparten título ni canónica', () => {
    const planes = fuente['/planes/:slug'] ?? [];
    const [uno, dos] = planes;
    expect(uno).toBeDefined();
    expect(dos).toBeDefined();
    if (!uno || !dos) return;

    const a = sellarShell(SHELL, resolverMetadata(`/planes/${uno.params['slug'] ?? ''}`, opciones));
    const b = sellarShell(SHELL, resolverMetadata(`/planes/${dos.params['slug'] ?? ''}`, opciones));

    expect(/<title>([^<]*)<\/title>/u.exec(a)?.[1]).not.toBe(
      /<title>([^<]*)<\/title>/u.exec(b)?.[1],
    );
  });

  it('reemplaza la descripción del shell en vez de agregar una segunda', () => {
    const sellado = sellarShell(SHELL, resolverMetadata('/manifiesto', opciones));
    const descripciones = sellado.match(/<meta\b[^>]*\bname="description"[^>]*>/gu) ?? [];

    expect(descripciones).toHaveLength(1);
    expect(descripciones[0]).toContain(
      escaparHtml(resolverMetadata('/manifiesto', opciones).descripcion),
    );
  });

  it('una ruta privada sale con noindex,nofollow', () => {
    const sellado = sellarShell(SHELL, resolverMetadata('/ingresar', opciones));

    expect(sellado).toContain('<meta name="robots" content="noindex,nofollow" />');
  });

  it('una ruta pública no lleva meta robots', () => {
    const sellado = sellarShell(SHELL, resolverMetadata('/planes', opciones));

    expect(sellado).not.toContain('name="robots"');
  });

  it('un shell dinámico sale con noindex,follow', () => {
    const sellado = sellarShell(SHELL, resolverMetadata('/iniciativas/lo-que-sea', opciones));

    expect(sellado).toContain('<meta name="robots" content="noindex,follow" />');
  });

  it('sellar dos veces no duplica ninguna etiqueta', () => {
    const metadata = resolverMetadata('/el-mapa', opciones);
    const doble = sellarShell(sellarShell(SHELL, metadata), metadata);

    expect((doble.match(/property="og:title"/gu) ?? []).length).toBe(1);
    expect((doble.match(/rel="canonical"/gu) ?? []).length).toBe(1);
    expect((doble.match(/<title>/gu) ?? []).length).toBe(1);
  });

  it('deja el body intacto: React monta igual porque no hay markup previo', () => {
    const sellado = sellarShell(SHELL, resolverMetadata('/', opciones));

    expect(sellado).toContain('<div id="root"></div>');
    expect(sellado).toContain('<noscript>');
    expect(sellado).toContain('src="/src/main.tsx"');
  });

  it('escapa el título del documento dentro del atributo', () => {
    const sellado = sellarShell(SHELL, {
      titulo: 'Comillas "peligrosas" & <etiquetas> — ¡BASTA!',
      descripcion: 'Una descripción con "comillas".',
      indexacion: 'publica',
      superficie: 'papel',
      canonica: `${ORIGEN}/prueba`,
      og: `${ORIGEN}/og/default.png`,
      robots: null,
    });

    expect(sellado).toContain(
      '<meta property="og:title" content="Comillas &quot;peligrosas&quot; &amp; &lt;etiquetas&gt; — ¡BASTA!" />',
    );
    expect(sellado).not.toContain('content="Comillas "peligrosas"');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm test:scripts`
Esperado: FALLA con `Failed to resolve import "../sellado"`.

- [ ] **Paso 3: Implementación mínima**

Crear `scripts/build/sellado.ts`:

```ts
/**
 * Toda la lógica pura de B11, separada del CLI (`sellar-head.ts`) para que
 * `pnpm test:scripts` la pueda importar sin disparar efectos: el CLI llama a
 * `main()` en el top level, igual que `scripts/content/verify-planes-index.ts`.
 *
 * Spec: `docs/specs/2026-07-26-el-sustrato.md` §3 y §3b.
 */
import {
  TARJETA_TWITTER,
  type MetadataDeRuta,
} from '../../apps/web/src/lib/rutas/registro';

const NOMBRE_DEL_SITIO = '¡BASTA!';
const LOCALE_OG = 'es_AR';
const TIPO_OG = 'website';

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;');
}

/** Ruta del archivo dentro de `dist/` para una URL: `/planes/planeb` → `planes/planeb/index.html`; `/` → `index.html`. */
export function archivoDe(ruta: string): string {
  const limpia = ruta.replace(/^\/+/u, '').replace(/\/+$/u, '');
  return limpia === '' ? 'index.html' : `${limpia}/index.html`;
}

function etiqueta(atributo: 'name' | 'property', clave: string, valor: string): string {
  return `    <meta ${atributo}="${clave}" content="${escaparHtml(valor)}" />`;
}

/**
 * Reemplaza `<title>` y `description`, borra cualquier bloque social previo y
 * escribe el nuevo justo antes de `</head>`.
 *
 * No toca el `<body>`: React monta igual porque no hay markup previo. B12 es el
 * que cambia eso para los planes y los ensayos, y lo resuelve con su propio
 * envoltorio `data-prerender`.
 *
 * Los `[^>]*` de los dos reemplazos no pueden cruzar un `>` — y no lo van a
 * encontrar dentro de un atributo porque `escaparHtml` convierte `>` en `&gt;`.
 */
export function sellarShell(shell: string, metadata: MetadataDeRuta): string {
  let salida = shell.replace(
    /<title>[\s\S]*?<\/title>/iu,
    `<title>${escaparHtml(metadata.titulo)}</title>`,
  );

  salida = salida.replace(
    /<meta\b[^>]*\bname="description"[^>]*>/iu,
    `<meta name="description" content="${escaparHtml(metadata.descripcion)}" />`,
  );

  // Idempotencia. Sellar un `dist/` que ya venía sellado —un rebuild sin
  // limpiar, o el paso de B12 corriendo sobre la salida de B11— duplicaría las
  // doce etiquetas si no se borra el bloque anterior primero.
  salida = salida
    .replace(/[ \t]*<link rel="canonical"[^>]*>\n?/giu, '')
    .replace(/[ \t]*<meta property="og:[^>]*>\n?/giu, '')
    .replace(/[ \t]*<meta name="twitter:[^>]*>\n?/giu, '')
    .replace(/[ \t]*<meta name="robots"[^>]*>\n?/giu, '');

  const bloque = [
    `    <link rel="canonical" href="${escaparHtml(metadata.canonica)}" />`,
    etiqueta('property', 'og:type', TIPO_OG),
    etiqueta('property', 'og:site_name', NOMBRE_DEL_SITIO),
    etiqueta('property', 'og:locale', LOCALE_OG),
    etiqueta('property', 'og:title', metadata.titulo),
    etiqueta('property', 'og:description', metadata.descripcion),
    etiqueta('property', 'og:url', metadata.canonica),
    etiqueta('property', 'og:image', metadata.og),
    etiqueta('name', 'twitter:card', TARJETA_TWITTER),
    etiqueta('name', 'twitter:title', metadata.titulo),
    etiqueta('name', 'twitter:description', metadata.descripcion),
    etiqueta('name', 'twitter:image', metadata.og),
  ];

  if (metadata.robots !== null) {
    bloque.push(etiqueta('name', 'robots', metadata.robots));
  }

  return salida.replace('</head>', `${bloque.join('\n')}\n  </head>`);
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm test:scripts && pnpm lint:scripts && pnpm type-check:scripts`
Esperado: PASA — los quince `it` de `sellado.test.ts` en verde, `eslint` y `tsc` sin salida.

- [ ] **Paso 5: Commit**

```bash
git add scripts/build/sellado.ts scripts/build/__tests__/sellado.test.ts
git commit -m "feat(build): sellarShell reemplaza título, descripción, canonical, og y twitter en el shell"
```

---

### Tarea 6: `sellado.ts` — sitemap, robots y los 301 del host

**Files:**
- Modify: `scripts/build/sellado.ts` (agregar al final, después de `sellarShell`)
- Modify: `scripts/build/__tests__/sellado.test.ts` (agregar al final)

**Interfaces:**
- Consumes: `entraAlSitemap`, `Redireccion`, `UrlDelSitio` de `../../apps/web/src/lib/rutas/registro` (B7) — se suman al import que ya existe.
- Produces: `generarSitemap(urls, origen): string`, `generarRobots(origen): string`, `RedirectDeHost`, `redirectsDeHost(redirecciones): readonly RedirectDeHost[]`.

- [ ] **Paso 1: Escribir el test que falla**

En `scripts/build/__tests__/sellado.test.ts`, reemplazar la línea de import:

```ts
import { archivoDe, escaparHtml, sellarShell } from '../sellado';
```

por:

```ts
import {
  archivoDe,
  escaparHtml,
  generarRobots,
  generarSitemap,
  redirectsDeHost,
  sellarShell,
} from '../sellado';
```

Y el bloque:

```ts
import {
  componerTitulo,
  resolverMetadata,
  REGISTRO,
  TARJETA_TWITTER,
  type FuenteDeContenido,
  type OpcionesDeResolucion,
} from '../../../apps/web/src/lib/rutas/registro';
```

por:

```ts
import {
  componerTitulo,
  enumerarRedirecciones,
  enumerarUrls,
  resolverMetadata,
  REGISTRO,
  TARJETA_TWITTER,
  type FuenteDeContenido,
  type OpcionesDeResolucion,
} from '../../../apps/web/src/lib/rutas/registro';
```

Agregar al final del archivo:

```ts
describe('generarSitemap', () => {
  it('sólo entran las públicas: ni el login, ni los shells dinámicos, ni las redirecciones', () => {
    const urls = enumerarUrls(opciones);
    const xml = generarSitemap(urls, ORIGEN);

    expect(xml).toContain(`<loc>${ORIGEN}/planes</loc>`);
    expect(xml).toContain(`<loc>${ORIGEN}/</loc>`);
    expect(xml).not.toContain(`<loc>${ORIGEN}/ingresar</loc>`);
    expect(xml).not.toContain(`<loc>${ORIGEN}/tablero</loc>`);
    expect(xml).not.toContain(`<loc>${ORIGEN}/iniciativas</loc>`);
    expect(xml).not.toContain(`<loc>${ORIGEN}/mandato-vivo/pulso</loc>`);
    expect(xml).not.toContain(`<loc>${ORIGEN}/ensayos</loc>`);
    expect(xml).not.toContain(`<loc>${ORIGEN}/explorar-datos</loc>`);
  });

  it('lleva una entrada por URL pública, ni una más', () => {
    const urls = enumerarUrls(opciones);
    const publicas = urls.filter((url) => url.entrada.indexacion === 'publica');
    const xml = generarSitemap(urls, ORIGEN);

    expect((xml.match(/<loc>/gu) ?? []).length).toBe(publicas.length);
    expect(publicas.length).toBeGreaterThan(400);
  });

  it('enumera los documentos reales del disco, no una lista escrita a mano', () => {
    const planes = fuente['/planes/:slug'] ?? [];
    const xml = generarSitemap(enumerarUrls(opciones), ORIGEN);

    for (const plan of planes) {
      expect(xml, plan.params['slug'] ?? '').toContain(
        `<loc>${ORIGEN}/planes/${plan.params['slug'] ?? ''}</loc>`,
      );
    }
  });

  it('es XML bien formado y no hornea la fecha del build', () => {
    const xml = generarSitemap(enumerarUrls(opciones), ORIGEN);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
    // `<lastmod>` saldría del reloj del proceso que buildea: es exactamente el
    // tipo de valor que la regla 3 de §4 prohíbe hornear.
    expect(xml).not.toContain('<lastmod>');
  });

  it('el origen se toma del parámetro y sin barra final duplicada', () => {
    const xml = generarSitemap(enumerarUrls(opciones), 'https://otro.test/');

    expect(xml).toContain('<loc>https://otro.test/planes</loc>');
    expect(xml).not.toContain('https://otro.test//');
  });
});

describe('generarRobots', () => {
  const robots = generarRobots(ORIGEN);

  it('veda los cuatro directorios que no son páginas', () => {
    expect(robots).toContain('Disallow: /api/');
    expect(robots).toContain('Disallow: /maps/');
    expect(robots).toContain('Disallow: /media/');
    expect(robots).toContain('Disallow: /course-graphics/');
  });

  it('declara el sitemap absoluto', () => {
    expect(robots).toContain(`Sitemap: ${ORIGEN}/sitemap.xml`);
  });

  it('no veda las privadas: el noindex del head no se puede leer si el crawler no entra', () => {
    expect(robots).not.toContain('Disallow: /ingresar');
    expect(robots).not.toContain('Disallow: /tablero');
    expect(robots).toContain('Allow: /');
  });
});

describe('redirectsDeHost', () => {
  it('cada redirección del registro sale como 301 permanente', () => {
    const redirecciones = enumerarRedirecciones(fuente);
    const redirects = redirectsDeHost(redirecciones);

    expect(redirects).toHaveLength(redirecciones.length);
    for (const redirect of redirects) {
      expect(redirect.permanent).toBe(true);
      expect(redirect.source.startsWith('/')).toBe(true);
      expect(redirect.destination.startsWith('/')).toBe(true);
      expect(redirect.source).not.toBe(redirect.destination);
    }
  });

  it('trae las redirecciones puras y las 17 direcciones viejas del blog', () => {
    const redirects = redirectsDeHost(enumerarRedirecciones(fuente));
    const fuentes = redirects.map((r) => r.source);

    expect(redirects).toContainEqual({
      source: '/la-vision',
      destination: '/la-idea',
      permanent: true,
    });
    expect(fuentes.filter((s) => s.startsWith('/blog/'))).toHaveLength(
      (fuente['/blog/:slug'] ?? []).length,
    );
  });

  it('ninguna redirección apunta a una URL que no se selle', () => {
    const selladas = new Set(enumerarUrls(opciones).map((url) => url.ruta));

    for (const redirect of redirectsDeHost(enumerarRedirecciones(fuente))) {
      expect(selladas.has(redirect.destination), redirect.source).toBe(true);
      expect(selladas.has(redirect.source), redirect.source).toBe(false);
    }
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm test:scripts`
Esperado: FALLA con `"generarSitemap" is not exported by "scripts/build/sellado.ts"`.

- [ ] **Paso 3: Implementación mínima**

En `scripts/build/sellado.ts`, reemplazar el bloque de import:

```ts
import {
  TARJETA_TWITTER,
  type MetadataDeRuta,
} from '../../apps/web/src/lib/rutas/registro';
```

por:

```ts
import {
  entraAlSitemap,
  TARJETA_TWITTER,
  type MetadataDeRuta,
  type Redireccion,
  type UrlDelSitio,
} from '../../apps/web/src/lib/rutas/registro';
```

Y agregar al final del archivo, después de `sellarShell`:

```ts
/**
 * Directorios de `public/` y de la API que no son páginas. `/api/` está acá
 * porque la API vive en el MISMO origen: sin esta línea, un crawler recorre los
 * agregados públicos, se come el rate limit y le mete carga a Neon.
 */
const DIRECTORIOS_VEDADOS: readonly string[] = ['/api/', '/maps/', '/media/', '/course-graphics/'];

/**
 * Sólo las `publica`. Sin `<lastmod>`: saldría del reloj del proceso que
 * buildea, que es lo que la regla 3 de §4 prohíbe hornear.
 */
export function generarSitemap(urls: readonly UrlDelSitio[], origen: string): string {
  const base = origen.replace(/\/+$/u, '');
  const entradas = urls
    .filter(entraAlSitemap)
    .map((url) => `  <url>\n    <loc>${escaparHtml(`${base}${url.ruta}`)}</loc>\n  </url>`);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entradas,
    '</urlset>',
    '',
  ].join('\n');
}

/**
 * `sellar-head.ts` es el ÚNICO dueño de `robots.txt`: el plan A no lo crea en
 * `public/` a propósito, porque el `Sitemap:` depende del origen del build.
 *
 * Las rutas `privada` NO se vedan acá: llevan `noindex,nofollow` en el head, y
 * un crawler que tiene prohibido entrar nunca llega a leer ese `noindex`.
 */
export function generarRobots(origen: string): string {
  const base = origen.replace(/\/+$/u, '');

  return [
    'User-agent: *',
    'Allow: /',
    ...DIRECTORIOS_VEDADOS.map((ruta) => `Disallow: ${ruta}`),
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');
}

/** Bloque `redirects` de `v2/vercel.json` derivado de `enumerarRedirecciones`. Lo compara `meta:check`. */
export interface RedirectDeHost {
  readonly source: string;
  readonly destination: string;
  readonly permanent: true;
}

export function redirectsDeHost(
  redirecciones: readonly Redireccion[],
): readonly RedirectDeHost[] {
  return redirecciones.map((redireccion) => ({
    source: redireccion.desde,
    destination: redireccion.hacia,
    permanent: true,
  }));
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm test:scripts && pnpm lint:scripts && pnpm type-check:scripts`
Esperado: PASA — los doce `it` nuevos en verde y los quince de la Tarea 5 siguen verdes.

- [ ] **Paso 5: Commit**

```bash
git add scripts/build/sellado.ts scripts/build/__tests__/sellado.test.ts
git commit -m "feat(build): sitemap sólo con las públicas, robots con los cuatro Disallow y los 301 del host"
```

---

### Tarea 7: `sellar-head.ts` — el CLI y su cableado al `build` de `apps/web`

**Files:**
- Create: `scripts/build/sellar-head.ts`
- Modify: `apps/web/package.json` (script `build`, anclado en el texto literal que dejó el plan A)

**Interfaces:**
- Consumes: `enumerarRedirecciones`, `enumerarUrls`, `entraAlSitemap` de `../../apps/web/src/lib/rutas/registro` (B7) · `leerFuenteDeDisco`, `origenDelBuild`, `RAIZ_V2` de `./fuente-disco` (Tarea 1) · `archivoDe`, `generarRobots`, `generarSitemap`, `sellarShell` de `./sellado` (Tareas 5 y 6) · `listarBasura` de `./limpieza` (plan A, B1) · `apps/web/dist/index.html` como shell plantilla.
- Produces: SIN exports. `main().catch(…)` en el top level, igual que `scripts/build/build-content.ts`. Escribe `apps/web/dist/<ruta>/index.html`, `apps/web/dist/sitemap.xml` y `apps/web/dist/robots.txt`. Lo consume B12 (`prerender.ts` sobrescribe los `index.html` que este script selló) y B13 (`curl -A facebookexternalhit`).

> **Esta tarea no lleva test previo: es cableado de CLI.** Su verificación es la corrida real del
> build con salida esperada, declarada en cada paso — misma convención que las tareas de
> configuración del plan A. La lógica testeable ya está cubierta por `sellado.test.ts` y
> `fuente-disco.test.ts`.

- [ ] **Paso 1: Correr la verificación que falla**

Comando:

```bash
pnpm --filter @v2/web build && ls apps/web/dist/planes/ 2>&1 | head -3 && ls apps/web/dist/robots.txt 2>&1
```

Esperado: FALLA — el build termina bien, pero `ls apps/web/dist/planes/` imprime `No such file or directory` y `ls apps/web/dist/robots.txt` también: hoy `dist/` tiene un solo `index.html` para las ~493 URLs, sin sitemap y sin robots.

- [ ] **Paso 2: Escribir el CLI**

Crear `scripts/build/sellar-head.ts`:

```ts
/**
 * CLI del sellado. Corre después de `vite build`, al final de la cadena del
 * `build` de `apps/web`, o sea dentro del `pnpm build` que ya corre el paso
 * «Build all workspaces» del CI y ANTES del paso «Bundle size budgets», que lee
 * `dist/assets/` y no lo toca este script.
 *
 * Escribe un `index.html` sellado por URL —públicas, privadas y un shell por
 * patrón dinámico—, el sitemap y el robots. Las privadas llevan archivo aunque
 * no se indexen: sin catch-all en `v2/vercel.json`, una ruta sin archivo
 * devuelve 404 y el login rompe en producción (spec §3).
 *
 * Toda su lógica testeable vive en `./sellado`. Acá sólo hay efectos.
 *
 * Run: pnpm --dir ../.. exec tsx scripts/build/sellar-head.ts
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import {
  entraAlSitemap,
  enumerarRedirecciones,
  enumerarUrls,
} from '../../apps/web/src/lib/rutas/registro';

import { leerFuenteDeDisco, origenDelBuild, RAIZ_V2 } from './fuente-disco';
import { listarBasura } from './limpieza';
import { archivoDe, generarRobots, generarSitemap, sellarShell } from './sellado';

const DIST = resolve(RAIZ_V2, 'apps/web/dist');
const SHELL = resolve(DIST, 'index.html');

async function main(): Promise<void> {
  const origen = origenDelBuild();
  const fuente = await leerFuenteDeDisco(RAIZ_V2);
  const urls = enumerarUrls({ origen, fuente });

  let shell: string;
  try {
    // Se lee UNA vez y se guarda en memoria: la primera URL de `urls` es `/`, y
    // sobrescribe este mismo archivo.
    shell = readFileSync(SHELL, 'utf8');
  } catch {
    process.stderr.write(`No existe ${SHELL}. Corré «vite build» antes de sellar.\n`);
    process.exit(1);
  }

  for (const url of urls) {
    const destino = join(DIST, archivoDe(url.ruta));
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, sellarShell(shell, url.metadata), 'utf8');
  }

  writeFileSync(join(DIST, 'sitemap.xml'), generarSitemap(urls, origen), 'utf8');
  writeFileSync(join(DIST, 'robots.txt'), generarRobots(origen), 'utf8');

  // Redundante con `limpiar-dist.ts` a propósito: este script crea cientos de
  // directorios nuevos en `dist/` y `pnpm prerender` (B12) corre después.
  const basura = listarBasura(DIST);
  for (const ruta of basura) rmSync(ruta, { force: true });

  const enSitemap = urls.filter(entraAlSitemap).length;
  const redirecciones = enumerarRedirecciones(fuente);

  process.stdout.write(
    `Head sellado: ${String(urls.length)} URLs · ${String(enSitemap)} en el sitemap · ` +
      `origen ${origen}\n` +
      `v2/vercel.json tiene que declarar ${String(redirecciones.length)} redirects — lo verifica «pnpm meta:check».\n`,
  );
}

main().catch((err: unknown) => {
  process.stderr.write(
    `sellar-head falló: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
```

- [ ] **Paso 3: Agregarlo al final de la cadena del `build`**

El plan A (B1) ya convirtió el `build` de `apps/web` en una cadena. En
`apps/web/package.json`, reemplazar la línea literal:

```json
    "build": "vite build && pnpm --dir ../.. exec tsx scripts/build/limpiar-dist.ts",
```

por:

```json
    "build": "vite build && pnpm --dir ../.. exec tsx scripts/build/limpiar-dist.ts && pnpm --dir ../.. exec tsx scripts/build/sellar-head.ts",
```

Se **agrega al final**; no se reescribe la cadena. Si en el árbol de trabajo el `build` todavía
dice `"vite build"` a secas, es que B1 no corrió: pará y corré B1 primero, porque
`sellar-head.ts` importa `./limpieza`, que entrega esa misma tarea.

**No hace falta ningún paso nuevo en `.github/workflows/v2-ci.yml`.** El sellado queda dentro del
paso «Build all workspaces» (`pnpm build`), que ya corre antes de «Bundle size budgets».

- [ ] **Paso 4: Correr la verificación**

Comando:

```bash
pnpm --filter @v2/web build \
  && ls apps/web/dist/robots.txt apps/web/dist/sitemap.xml \
  && grep -c '<loc>' apps/web/dist/sitemap.xml \
  && grep -o '<title>[^<]*</title>' apps/web/dist/planes/planeb/index.html \
  && grep -o '<title>[^<]*</title>' apps/web/dist/index.html \
  && grep -o 'name="robots" content="[^"]*"' apps/web/dist/ingresar/index.html \
  && grep -c 'og:image' apps/web/dist/ensayos/*/index.html | head -1 \
  && find apps/web/dist -name '.DS_Store'
```

Esperado: PASA —
- el build imprime `Head sellado: … URLs · … en el sitemap · origen https://elinstantedelhombregris.com`;
- `robots.txt` y `sitemap.xml` existen;
- `grep -c '<loc>'` imprime el conteo de URLs públicas (más de 400);
- el `<title>` de `dist/planes/planeb/index.html` es el del PLANEB, **distinto** del de
  `dist/index.html`, que es el de la portada;
- `dist/ingresar/index.html` imprime `name="robots" content="noindex,nofollow"`;
- cada ensayo tiene su `og:image`;
- `find` no imprime nada.

Después, la prueba del origen parametrizado:

```bash
VITE_SITE_ORIGIN=https://preview.ejemplo.test pnpm --filter @v2/web build \
  && head -8 apps/web/dist/robots.txt \
  && grep -o 'rel="canonical" href="[^"]*"' apps/web/dist/planes/planeb/index.html
```

Esperado: el `Sitemap:` del robots y la canónica del plan dicen `https://preview.ejemplo.test`.
Volver a buildear sin la variable antes de seguir.

- [ ] **Paso 5: `pnpm verify` y commit**

Comando: `pnpm verify`
Esperado: PASA — `lint`, `type-check`, `test` y `build` en verde.

```bash
git add scripts/build/sellar-head.ts apps/web/package.json
git commit -m "feat(build): el build de apps/web sella el head de cada URL, el sitemap y el robots"
```

---

### Tarea 8: `v2/vercel.json` — fallback, 301, headers y caché

**Files:**
- Create: `v2/vercel.json`
- Test: `scripts/build/__tests__/vercel-json.test.ts`

**Interfaces:**
- Consumes: `REGISTRO`, `enumerarRedirecciones` de `../../../apps/web/src/lib/rutas/registro` (B7) · `leerFuenteDeDisco` de `../fuente-disco` (Tarea 1) · `redirectsDeHost` de `../sellado` (Tarea 6).
- Produces: `v2/vercel.json`. Lo consume B13 (proyecto de preview, `curl -I`, `/no-existe` → 404).

> **El de la raíz no se toca.** `/vercel.json` publica `SocialJusticeHub` (v1) y sigue igual: este
> es su hermano, para el proyecto de Vercel de v2 que la Fase 10 de `docs/architecture/README.md`
> ya prevé, con **Root Directory = `v2`**.

> **La forma del archivo, y por qué no lleva un `{"handle":"filesystem"}` literal.** La spec §3
> pide `{"handle":"filesystem"}` antes de todo rewrite, que es sintaxis del array `routes` de
> Vercel. Pero `routes` es **excluyente**: si está presente, Vercel rechaza el deploy con
> «If `rewrites`, `redirects`, `headers`, `cleanUrls` or `trailingSlash` are used, then `routes`
> cannot be present». La misma spec pide `cleanUrls: true`, `trailingSlash: false`, los 301 y los
> cuatro headers de §3b — cinco propiedades que sólo existen del otro lado de esa frontera. Se
> elige la forma moderna, donde **la semántica de `{"handle":"filesystem"}` es la de por defecto**:
> Vercel evalúa `redirects` → filesystem → `rewrites`, así que un `index.html` sellado siempre gana
> sobre cualquier rewrite. La propiedad que importaba —que el fallback ceda ante los archivos
> sellados— queda intacta, y el test la asserea en vez de asseerar la sintaxis. **Queda pendiente
> corregir esa línea de la spec.**

- [ ] **Paso 1: Escribir el test que falla**

Crear `scripts/build/__tests__/vercel-json.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { enumerarRedirecciones, REGISTRO } from '../../../apps/web/src/lib/rutas/registro';
import { leerFuenteDeDisco, RAIZ_V2 } from '../fuente-disco';
import { redirectsDeHost, type RedirectDeHost } from '../sellado';

interface CabeceraDeHost {
  readonly key: string;
  readonly value: string;
}

interface ReglaDeCabeceras {
  readonly source: string;
  readonly headers: readonly CabeceraDeHost[];
}

interface RewriteDeHost {
  readonly source: string;
  readonly destination: string;
}

interface ConfigDeVercel {
  readonly outputDirectory?: string;
  readonly cleanUrls?: boolean;
  readonly trailingSlash?: boolean;
  readonly routes?: unknown;
  readonly redirects?: readonly RedirectDeHost[];
  readonly rewrites?: readonly RewriteDeHost[];
  readonly headers?: readonly ReglaDeCabeceras[];
}

const CONFIG = JSON.parse(
  readFileSync(join(RAIZ_V2, 'vercel.json'), 'utf8'),
) as ConfigDeVercel;

function cabecerasDe(source: string): Record<string, string> {
  const regla = (CONFIG.headers ?? []).find((h) => h.source === source);
  const salida: Record<string, string> = {};
  for (const cabecera of regla?.headers ?? []) salida[cabecera.key] = cabecera.value;
  return salida;
}

function valorDeCache(source: string): string | undefined {
  return cabecerasDe(source)['Cache-Control'];
}

describe('la forma del archivo', () => {
  it('publica el dist de apps/web con URLs limpias y sin barra final', () => {
    expect(CONFIG.outputDirectory).toBe('apps/web/dist');
    expect(CONFIG.cleanUrls).toBe(true);
    expect(CONFIG.trailingSlash).toBe(false);
  });

  it('no usa el array `routes`: es excluyente con redirects, headers y cleanUrls', () => {
    expect(CONFIG.routes).toBeUndefined();
  });
});

describe('el fallback', () => {
  it('NO hay catch-all a /index.html: /no-existe tiene que dar 404 real', () => {
    for (const rewrite of CONFIG.rewrites ?? []) {
      expect(rewrite.destination, rewrite.source).not.toBe('/index.html');
      expect(rewrite.destination, rewrite.source).not.toBe('/');
      expect(rewrite.source, rewrite.source).not.toBe('/(.*)');
      expect(rewrite.source, rewrite.source).not.toBe('/:ruta*');
    }
  });

  it('/api cede primero: es el primer rewrite del array', () => {
    const primero = (CONFIG.rewrites ?? [])[0];

    expect(primero).toBeDefined();
    expect(primero?.source.startsWith('/api')).toBe(true);
  });

  it('cada patrón dinámico del registro tiene su rewrite por prefijo, y ninguno más', () => {
    const dinamicas = REGISTRO.filter((entrada) => entrada.indexacion === 'dinamica');
    const rewrites = (CONFIG.rewrites ?? []).filter((r) => !r.source.startsWith('/api'));

    expect(rewrites.map((r) => ({ source: r.source, destination: r.destination }))).toEqual(
      dinamicas.map((entrada) => ({
        source: entrada.patron,
        destination: entrada.prefijoRewrite ?? '(sin prefijo)',
      })),
    );
  });
});

describe('los 301', () => {
  let esperados: readonly RedirectDeHost[];

  beforeAll(async () => {
    esperados = redirectsDeHost(enumerarRedirecciones(await leerFuenteDeDisco()));
  });

  it('el bloque commiteado coincide con lo que deriva el registro', () => {
    const porSource = (a: RedirectDeHost, b: RedirectDeHost): number =>
      a.source < b.source ? -1 : a.source > b.source ? 1 : 0;

    expect([...(CONFIG.redirects ?? [])].sort(porSource)).toEqual([...esperados].sort(porSource));
  });

  it('todos son permanentes', () => {
    for (const redirect of CONFIG.redirects ?? []) {
      expect(redirect.permanent, redirect.source).toBe(true);
    }
  });
});

describe('los headers de §3b', () => {
  const documento = cabecerasDe('/(.*)');

  it('la CSP es espejo de security.ts, sin el fontSrc de terceros', () => {
    const csp = documento['Content-Security-Policy'] ?? '';

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("font-src 'self' data:");
    expect(csp).not.toMatch(/font-src[^;]*cartocdn/u);
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain('fonts.googleapis.com');
  });

  it('declara nosniff, Referrer-Policy y Permissions-Policy', () => {
    expect(documento['X-Content-Type-Options']).toBe('nosniff');
    expect(documento['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(documento['Permissions-Policy']).toBe('geolocation=(), camera=(), microphone=()');
  });
});

describe('la tabla de caché', () => {
  it('el HTML revalida en cada visita: es el índice mutable de los assets con hash', () => {
    const regla = (CONFIG.headers ?? []).find(
      (h) => h.source.includes('(?!') && h.headers.some((c) => c.key === 'Cache-Control'),
    );

    expect(regla).toBeDefined();
    expect(regla?.headers.find((c) => c.key === 'Cache-Control')?.value).toBe(
      'public, max-age=0, must-revalidate',
    );
    // La regla del documento no puede pisar a las cuatro específicas.
    for (const excluido of ['assets/', 'fonts/', 'og/', 'maps/', 'media/', 'course-graphics/']) {
      expect(regla?.source, excluido).toContain(excluido);
    }
  });

  it('los assets y las fuentes van inmutables un año', () => {
    expect(valorDeCache('/assets/(.*)')).toBe('public, max-age=31536000, immutable');
    expect(valorDeCache('/fonts/(.*)')).toBe('public, max-age=31536000, immutable');
  });

  it('las imágenes de public/ van una semana', () => {
    expect(valorDeCache('/(og|maps|media|course-graphics)/(.*)')).toBe('public, max-age=604800');
  });

  it('robots y sitemap van una hora', () => {
    expect(valorDeCache('/(robots.txt|sitemap.xml)')).toBe('public, max-age=3600');
  });

  it('las cinco filas de la tabla están, ni una menos', () => {
    const conCache = (CONFIG.headers ?? []).filter((h) =>
      h.headers.some((c) => c.key === 'Cache-Control'),
    );

    expect(conCache).toHaveLength(5);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm test:scripts`
Esperado: FALLA con `ENOENT: no such file or directory, open '…/v2/vercel.json'`.

- [ ] **Paso 3: Escribir `v2/vercel.json`**

Crear `v2/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm --filter @v2/web build",
  "outputDirectory": "apps/web/dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "redirects": [
    { "source": "/la-vision", "destination": "/la-idea", "permanent": true },
    { "source": "/el-instante-del-hombre-gris", "destination": "/la-idea", "permanent": true },
    { "source": "/la-semilla-de-basta", "destination": "/sembrar", "permanent": true },
    { "source": "/una-ruta-para-argentina", "destination": "/la-idea", "permanent": true },
    { "source": "/ensayos", "destination": "/biblioteca", "permanent": true },
    { "source": "/blog", "destination": "/bitacora", "permanent": true },
    { "source": "/explorar-datos", "destination": "/el-mapa", "permanent": true },
    {
      "source": "/blog/aprender-para-ser-libres-la-educacin-como-acto-de-soberana",
      "destination": "/bitacora/aprender-para-ser-libres-la-educacion-como-acto-de-soberania",
      "permanent": true
    },
    {
      "source": "/blog/contra-quin-ests-peleando-en-serio",
      "destination": "/bitacora/contra-quien-estas-peleando-en-serio",
      "permanent": true
    },
    {
      "source": "/blog/cules-deberan-ser-nuestros-parmetros",
      "destination": "/bitacora/cuales-deberian-ser-nuestros-parametros",
      "permanent": true
    },
    {
      "source": "/blog/detectar-patrones-otro-poder-que-ya-tens-y-nadie-te-ense-a-usar",
      "destination": "/bitacora/detectar-patrones-otro-poder-que-ya-tenes-y-nadie-te-enseno-a-usar",
      "permanent": true
    },
    {
      "source": "/blog/diseo-idealizado-la-argentina-posible",
      "destination": "/bitacora/diseno-idealizado-la-argentina-posible",
      "permanent": true
    },
    {
      "source": "/blog/el-cansancio-sagrado-por-qu-ya-no-podemos-esperar",
      "destination": "/bitacora/el-cansancio-sagrado-por-que-ya-no-podemos-esperar",
      "permanent": true
    },
    {
      "source": "/blog/el-cristo-que-llevs-dentro",
      "destination": "/bitacora/el-cristo-que-llevas-dentro",
      "permanent": true
    },
    {
      "source": "/blog/el-poder-del-pensamiento-sistmico-en-la-transformacin-social",
      "destination": "/bitacora/el-poder-del-pensamiento-sistemico-en-la-transformacion-social",
      "permanent": true
    },
    {
      "source": "/blog/inteligencia-colectiva-por-qu-juntos-pensamos-mejor-de-lo-que-creemos",
      "destination": "/bitacora/inteligencia-colectiva-por-que-juntos-pensamos-mejor-de-lo-que-creemos",
      "permanent": true
    },
    {
      "source": "/blog/la-amabilidad-como-estrategia-de-transformacin",
      "destination": "/bitacora/la-amabilidad-como-estrategia-de-transformacion",
      "permanent": true
    },
    {
      "source": "/blog/la-amabilidad-como-ingeniera-social",
      "destination": "/bitacora/la-amabilidad-como-ingenieria-social",
      "permanent": true
    },
    {
      "source": "/blog/la-tica-del-servicio-construyendo-una-sociedad-de-servidores",
      "destination": "/bitacora/la-etica-del-servicio-construyendo-una-sociedad-de-servidores",
      "permanent": true
    },
    {
      "source": "/blog/las-fuerzas-del-cielo-el-poder-que-ya-tens-y-nadie-te-ense-a-usar",
      "destination": "/bitacora/las-fuerzas-del-cielo-el-poder-que-ya-tenes-y-nadie-te-enseno-a-usar",
      "permanent": true
    },
    {
      "source": "/blog/lo-que-le-debemos-al-futuro-responsabilidad-intergeneracional-como-diseo",
      "destination": "/bitacora/lo-que-le-debemos-al-futuro-responsabilidad-intergeneracional-como-diseno",
      "permanent": true
    },
    {
      "source": "/blog/pago-por-inteligencia-artificial-y-por-la-ma",
      "destination": "/bitacora/pago-por-inteligencia-artificial-y-por-la-mia",
      "permanent": true
    },
    {
      "source": "/blog/por-qu-nos-resistimos-a-cambiar-la-psicologa-de-la-transformacin",
      "destination": "/bitacora/por-que-nos-resistimos-a-cambiar-la-psicologia-de-la-transformacion",
      "permanent": true
    },
    {
      "source": "/blog/sistemas-vs-sntomas-cmo-pensar-como-ingeniero-social",
      "destination": "/bitacora/sistemas-vs-sintomas-como-pensar-como-ingeniero-social",
      "permanent": true
    }
  ],
  "rewrites": [
    { "source": "/api/:ruta*", "destination": "/api/:ruta*" },
    { "source": "/mandato-vivo/pulso/:id", "destination": "/mandato-vivo/pulso" },
    { "source": "/mandato-vivo/propuesta/:id", "destination": "/mandato-vivo/propuesta" },
    { "source": "/iniciativas/:slug/documento", "destination": "/iniciativas/documento" },
    { "source": "/iniciativas/:slug", "destination": "/iniciativas" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://tiles.basemaps.cartocdn.com; connect-src 'self' https://tiles.basemaps.cartocdn.com; font-src 'self' data:; object-src 'none'; frame-src 'none'; worker-src 'self' blob:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
        },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), camera=(), microphone=()" }
      ]
    },
    {
      "source": "/((?!assets/|fonts/|og/|maps/|media/|course-graphics/|robots\\.txt|sitemap\\.xml).*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/(og|maps|media|course-graphics)/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=604800" }]
    },
    {
      "source": "/(robots.txt|sitemap.xml)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=3600" }]
    }
  ]
}
```

Cinco decisiones que el archivo no puede explicar porque JSON no admite comentarios, y que
quedan acá:

1. **`{ "source": "/api/:ruta*", "destination": "/api/:ruta*" }` es identidad, y es a
   propósito.** Es la fila que hace literal el «`/api/*` cede antes que todo lo demás» de §3: al
   estar primera, ningún rewrite posterior puede reclamar la API, que vive en el **mismo origen**
   (`lib/api.ts` pide en relativo con `credentials: 'include'`). Con el `dist` estático de hoy
   resuelve a filesystem y devuelve 404, que es lo correcto mientras `apps/api` se despliegue
   aparte. **Pendiente para operaciones:** cuando la API tenga su destino real, esta fila cambia
   de identidad a ese destino y es lo único que hay que tocar.
2. **`/iniciativas/:slug/documento` va antes que `/iniciativas/:slug`**, igual que en el
   `<Switch>` y en `REGISTRO`. El test lo exige comparando contra el orden del registro.
3. **La fila del documento usa negative lookahead** en vez de confiar en el orden de
   precedencia de Vercel: las seis reglas de caché quedan mutuamente excluyentes y el resultado no
   depende de cómo el host resuelva dos `Cache-Control` que matchean la misma URL.
4. **La cuarta fila de la tabla de §3b suma `course-graphics/`** a `og/`, `maps/` y `media/`.
   Sigue siendo **una** fila y la misma categoría —directorios de `public/` que se recommitean con
   correcciones de texto—; dejarlo afuera haría revalidar cada gráfico de curso en cada visita.
   Queda dicho para alinear la tabla de la spec.
5. **`buildCommand` filtra a `@v2/web`** y no corre `pnpm build`: el build de `apps/api` exige
   `DATABASE_URL`, `JWT_SECRET` y `SESSION_SECRET`, y el proyecto de v2 en Vercel publica el
   estático. B13 lo verifica contra el preview real.

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm test:scripts && pnpm lint:scripts`
Esperado: PASA — los quince `it` de `vercel-json.test.ts` en verde.

Y probar que el test muerde, uno por vez, revirtiendo después de cada uno:

```bash
# (a) Catch-all: agregar a `rewrites`, al final,
#     { "source": "/(.*)", "destination": "/index.html" }
pnpm test:scripts   # Esperado: FALLA con «expected '/index.html' not to be '/index.html'»
git checkout vercel.json

# (b) 301 desincronizado: borrar la fila de "/blog/el-cristo-que-llevs-dentro".
pnpm test:scripts   # Esperado: FALLA en «el bloque commiteado coincide con lo que deriva el registro»
git checkout vercel.json

# (c) CSP con fuentes de terceros: cambiar `font-src 'self' data:` por
#     `font-src 'self' data: https://fonts.gstatic.com`.
pnpm test:scripts   # Esperado: FALLA en «la CSP es espejo de security.ts, sin el fontSrc de terceros»
git checkout vercel.json
```

- [ ] **Paso 5: Commit**

```bash
git add vercel.json scripts/build/__tests__/vercel-json.test.ts
git commit -m "feat(host): v2/vercel.json con 301 reales, headers de seguridad, caché y sin catch-all"
```

---

### Tarea 9: `meta:check` gana las reglas 4b y 6

**Files:**
- Modify: `scripts/build/verify-registro-rutas.ts` (anclado en texto literal; lo creó B7, Tarea 9 del plan C)

**Interfaces:**
- Consumes: `enumerarRedirecciones`, `enumerarUrls` de `../../apps/web/src/lib/rutas/registro` · `leerFuenteDeDisco`, `origenDelBuild` de `./fuente-disco` (Tarea 1) · `redirectsDeHost` de `./sellado` (Tarea 6) · `v2/vercel.json` leído como JSON.
- Produces: la guardia completa. B7 dejó las reglas 1, 2, 3, 5 y los largos de las entradas (4a); acá entran la **4b** (largos de cada documento resuelto desde disco) y la **6** (el bloque `redirects` commiteado contra `redirectsDeHost`). **Se extiende el archivo; no se reescribe.**

> El paso de CI (`- name: Guardia del registro de rutas` / `run: pnpm meta:check`) y la entrada
> `"meta:check"` de `package.json` **ya los agregó B7**. Esta tarea no toca ni el workflow ni el
> `package.json`: si `pnpm meta:check` responde `Command "meta:check" not found`, es que B7 no
> corrió.

- [ ] **Paso 1: Escribir la verificación que falla**

`verify-registro-rutas.ts` es su propio test (no tiene módulo puro hermano, igual que
`verify-planes-index.ts`). El «test que falla» es probar que la guardia **todavía no muerde**:

```bash
# Desincronizar el bloque de 301 a propósito.
node -e "const f='vercel.json';const j=JSON.parse(require('fs').readFileSync(f,'utf8'));j.redirects.pop();require('fs').writeFileSync(f,JSON.stringify(j,null,2)+'\n')"
pnpm meta:check
```

Esperado: FALLA la verificación en el sentido de este paso — `meta:check` **PASA** («54 rutas con
metadata, en el mismo orden que el `<Switch>`») con un `vercel.json` al que le falta un 301. Ése
es el agujero que cierra esta tarea.

Revertir: `git checkout vercel.json`

- [ ] **Paso 2: Extender los imports y hacer `main` asíncrona**

En `scripts/build/verify-registro-rutas.ts`, reemplazar el bloque de imports literal:

```ts
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LARGO_MAXIMO_DESCRIPCION } from '../../apps/web/src/lib/rutas/descripcion-de';
import {
  componerTitulo,
  LARGO_MAXIMO_TITULO,
  REGISTRO,
} from '../../apps/web/src/lib/rutas/registro';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const ARCHIVO_RUTAS = resolve(V2_ROOT, 'apps/web/src/app-routes.tsx');
```

por:

```ts
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LARGO_MAXIMO_DESCRIPCION } from '../../apps/web/src/lib/rutas/descripcion-de';
import {
  componerTitulo,
  enumerarRedirecciones,
  enumerarUrls,
  LARGO_MAXIMO_TITULO,
  REGISTRO,
} from '../../apps/web/src/lib/rutas/registro';

import { leerFuenteDeDisco, origenDelBuild } from './fuente-disco';
import { redirectsDeHost, type RedirectDeHost } from './sellado';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const ARCHIVO_RUTAS = resolve(V2_ROOT, 'apps/web/src/app-routes.tsx');
const ARCHIVO_VERCEL = resolve(V2_ROOT, 'vercel.json');

interface ConfigDeVercel {
  readonly redirects?: readonly RedirectDeHost[];
}

/** Los 301 no tienen orden significativo: los 24 `source` son literales disjuntos. */
function porSource(a: RedirectDeHost, b: RedirectDeHost): number {
  if (a.source !== b.source) return a.source < b.source ? -1 : 1;
  return 0;
}

function comoTexto(redirects: readonly RedirectDeHost[]): string {
  return [...redirects]
    .sort(porSource)
    .map((r) => `${r.source} → ${r.destination}`)
    .join('\n');
}
```

Reemplazar la firma:

```ts
function main(): void {
```

por:

```ts
async function main(): Promise<void> {
```

Y reemplazar la invocación del final del archivo:

```ts
main();
```

por:

```ts
main().catch((err: unknown) => {
  process.stderr.write(`meta:check falló: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
```

- [ ] **Paso 3: Agregar las reglas 4b y 6**

En el mismo archivo, insertar **inmediatamente antes** del bloque literal:

```ts
  if (errores.length > 0) {
    process.stderr.write(`meta:check — ${String(errores.length)} problema(s):\n`);
```

este bloque:

```ts
  // 4b. Largos de cada documento resuelto desde disco. Los TÍTULOS de documento
  //     no entran: salen del contenido y algunos superan los 60 con el sufijo
  //     (PLANRUTA mide 58 y compuesto da 68). La descripción sí, porque la
  //     deriva `descripcionDe` y tiene que caber en una tarjeta.
  const fuente = await leerFuenteDeDisco(V2_ROOT);
  const urls = enumerarUrls({ origen: origenDelBuild(), fuente });

  for (const url of urls) {
    if (url.metadata.descripcion.trim() === '') {
      errores.push(`${url.ruta}: la descripción resuelta quedó vacía.`);
    }
    if (url.metadata.descripcion.length > LARGO_MAXIMO_DESCRIPCION) {
      errores.push(
        `${url.ruta}: la descripción resuelta mide ${String(url.metadata.descripcion.length)} y el máximo es ${String(LARGO_MAXIMO_DESCRIPCION)}.`,
      );
    }
    if (url.metadata.titulo === componerTitulo('')) {
      errores.push(`${url.ruta}: el documento llegó sin título.`);
    }
  }

  // 6. El bloque `redirects` de `v2/vercel.json` contra lo que deriva el
  //    registro. Si un post gana un `legacySlug`, la guardia rompe hasta que se
  //    actualice el archivo: los 301 los hace el host, no `sellar-head.ts`.
  const derivados = redirectsDeHost(enumerarRedirecciones(fuente));
  let commiteados: readonly RedirectDeHost[] = [];
  try {
    const config = JSON.parse(readFileSync(ARCHIVO_VERCEL, 'utf8')) as ConfigDeVercel;
    commiteados = config.redirects ?? [];
  } catch {
    errores.push('no se pudo leer v2/vercel.json: sin él no hay 301 ni regla de fallback.');
  }

  if (comoTexto(commiteados) !== comoTexto(derivados)) {
    const enArchivo = new Set(commiteados.map((r) => `${r.source} → ${r.destination}`));
    const enRegistro = new Set(derivados.map((r) => `${r.source} → ${r.destination}`));
    for (const linea of [...enRegistro].sort()) {
      if (!enArchivo.has(linea)) errores.push(`falta en vercel.json: ${linea}`);
    }
    for (const linea of [...enArchivo].sort()) {
      if (!enRegistro.has(linea)) errores.push(`sobra en vercel.json: ${linea}`);
    }
  }

  for (const redirect of commiteados) {
    if (!redirect.permanent) {
      errores.push(`vercel.json: ${redirect.source} no es 301 permanente.`);
    }
  }
```

- [ ] **Paso 4: Correr la verificación**

Comando: `pnpm meta:check`
Esperado: PASA con `meta:check — 54 rutas con metadata, en el mismo orden que el <Switch>.`

Y ahora sí, que muerda. Los tres experimentos, uno por vez, revirtiendo después de cada uno:

```bash
# (a) Un 301 de menos en el archivo commiteado.
node -e "const f='vercel.json';const j=JSON.parse(require('fs').readFileSync(f,'utf8'));j.redirects.pop();require('fs').writeFileSync(f,JSON.stringify(j,null,2)+'\n')"
pnpm meta:check   # Esperado: FALLA con «falta en vercel.json: /blog/… → /bitacora/…»
git checkout vercel.json

# (b) Un 301 inventado que el registro no deriva.
node -e "const f='vercel.json';const j=JSON.parse(require('fs').readFileSync(f,'utf8'));j.redirects.push({source:'/inventado',destination:'/la-idea',permanent:true});require('fs').writeFileSync(f,JSON.stringify(j,null,2)+'\n')"
pnpm meta:check   # Esperado: FALLA con «sobra en vercel.json: /inventado → /la-idea»
git checkout vercel.json

# (c) Una descripción de sección que se pasa de 160.
#     En apps/web/src/lib/rutas/entradas.ts, alargar la `descripcion` de '/'
#     repitiendo su última oración hasta pasar los 160 caracteres.
pnpm meta:check   # Esperado: FALLA con «/: la descripción mide … y el máximo es 160.» (regla 4a)
git checkout apps/web/src/lib/rutas/entradas.ts
```

- [ ] **Paso 5: `pnpm verify` y commit**

Comando: `pnpm verify && pnpm meta:check`
Esperado: PASA — todo verde y la guardia con su línea de salida.

```bash
git add scripts/build/verify-registro-rutas.ts
git commit -m "chore(ci): meta:check compara los 301 de vercel.json contra el registro y los largos de cada documento"
```

---

## Bloque B12 — Prerender

> **Qué entrega el bloque.** Las 44 URLs de planes y ensayos (48 cuando entren los cuatro
> PLANes nuevos) dejan de ser un `<div id="root"></div>` vacío y pasan a tener el
> documento entero escrito en el HTML. El Chromium de Playwright las visita contra un
> `vite preview` propio y congela el markup dentro de `<div data-prerender>`, el envoltorio
> que el `<style>` crítico de B2 ya sabe fundir. **No va dentro de `pnpm build`**: el CI
> instala Chromium sólo en el job `e2e-tests`, que declara `needs: build-and-test` y por
> lo tanto corre después — así que es `pnpm prerender`, un paso propio dentro de
> `build-and-test` precedido por `pnpm exec playwright install --with-deps chromium`.
>
> **`main.tsx` no se toca: sigue con `createRoot`.** React 18 sobre un contenedor con
> hijos descarta el markup congelado y renderiza de cero, a propósito. El prerender le
> sirve al scraper y al `<noscript>`, no al LCP; el descarte se hace invisible con el
> fundido de 120 ms que B2 declaró sobre `[data-prerender]`. `hydrateRoot` costaría
> auditar mismatch en 44 rutas y está declarado fuera de alcance en la spec.
>
> **Las URLs se derivan, nunca se escriben.** `enumerarUrls()` sobre
> `leerFuenteDeDisco()` (que lee `planes-index.generated.ts` y `loadContentDir`),
> filtrado por `PATRONES_A_CONGELAR`. Cuando el catálogo pase de 23 a 27 archivos no se
> toca una línea de este bloque, y si la derivación devuelve cero URLs el script falla en
> vez de no hacer nada.
>
> **Depende de B11** (los `index.html` sellados que este bloque sobrescribe, `archivoDe`
> de `sellado.ts`, `fuente-disco.ts`) **y de B10** (el prerender no puede congelar un
> contador que todavía miente).

---

### Tarea 10: `FolioDeLectura` — el folio se vuelve una primitiva con marca de volátil

**Files:**
- Create: `v2/apps/web/src/components/papel/primitives/FolioDeLectura.tsx`
- Create: `v2/apps/web/src/components/papel/primitives/FolioDeLectura.test.tsx`
- Modify: `v2/apps/web/src/components/papel/primitives/index.ts` (anclado en la línea literal `export { FilaIndiceExpandible, type FilaIndiceExpandibleProps } from './FilaIndiceExpandible';`)

**Interfaces:**
- Consumes: `cn` de `~/lib/utils`.
- Produces: `export const ATRIBUTO_VOLATIL = 'data-volatil';`, `export interface FolioDeLecturaProps { className?: string }`, `export function FolioDeLectura({ className }: FolioDeLecturaProps);` — firmas del contrato, literales. `data-volatil` es **contrato compartido con `vaciarVolatiles` (Tarea 12)** y no se renombra.

> **Por qué la fecha se calcula en `useEffect` y además se marca `data-volatil`.** Las dos
> barreras hacen cosas distintas y ninguna sobra. El `useEffect` es lo que garantiza que
> el **cliente repueble** la fecha al montar, con el reloj del lector. Lo que **vacía** el
> nodo congelado es `vaciarVolatiles` (Tarea 12): el prerender corre en un Chromium de
> verdad, así que el efecto SÍ corre durante el congelado y el HTML llega a disco con la
> fecha del build impresa. Sin la marca, las 44 URLs quedarían con la fecha del runner
> —en UTC contra Argentina en UTC−3, potencialmente un día adelantada— y como el folio es
> `print:block`, nadie lo notaría hasta que alguien imprimiera.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/components/papel/primitives/FolioDeLectura.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ATRIBUTO_VOLATIL, FolioDeLectura } from './FolioDeLectura';

/** El mismo formato que imprimían a mano `PlanDetail.tsx` y `EnsayoDetail.tsx`. */
const HOY = new Date().toLocaleDateString('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

describe('FolioDeLectura', () => {
  it('lleva la marca `data-volatil` que el congelado de B12 vacía', () => {
    const { container } = render(<FolioDeLectura />);
    const folio = container.firstElementChild;

    expect(ATRIBUTO_VOLATIL).toBe('data-volatil');
    expect(folio).not.toBeNull();
    expect(folio).toHaveAttribute(ATRIBUTO_VOLATIL, 'fecha');
  });

  it('imprime el folio de §10.8 con la fecha de hoy, calculada al montar', () => {
    const { container } = render(<FolioDeLectura />);

    expect(container.textContent).toBe(`¡BASTA! · edición del lector · ${HOY}`);
  });

  it('sólo existe en la edición impresa: oculto en pantalla, block en print', () => {
    const { container } = render(<FolioDeLectura />);
    const folio = container.firstElementChild;

    expect(folio?.className).toContain('hidden');
    expect(folio?.className).toContain('print:block');
    expect(folio?.className).toContain('font-space');
  });

  it('el llamador puede sumar clases sin perder las propias', () => {
    const { container } = render(<FolioDeLectura className="mb-2" />);
    const folio = container.firstElementChild;

    expect(folio?.className).toContain('mb-2');
    expect(folio?.className).toContain('print:block');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/components/papel/primitives/FolioDeLectura.test.tsx`
Esperado: FALLA con `Failed to resolve import "./FolioDeLectura"` — el archivo todavía no existe.

- [ ] **Paso 3: Implementación mínima**

Crear `apps/web/src/components/papel/primitives/FolioDeLectura.tsx`:

```tsx
import { useEffect, useState } from 'react';

import { cn } from '~/lib/utils';

/**
 * Marca que lee `vaciarVolatiles()` de `scripts/build/congelado.ts`: todo nodo
 * que la lleve se congela VACÍO. Contrato compartido entre este archivo y el
 * prerender; el nombre del atributo no se renombra.
 */
export const ATRIBUTO_VOLATIL = 'data-volatil';

export interface FolioDeLecturaProps {
  className?: string;
}

/**
 * Folio de la edición impresa (§10.8): «¡BASTA! · edición del lector · {fecha}».
 * Estaba duplicado en `PlanDetail.tsx` y `EnsayoDetail.tsx` — o sea en las 44
 * URLs que congela B12.
 *
 * La fecha se calcula en `useEffect` y no durante el render: así el CLIENTE la
 * repuebla al montar, con su propio reloj. Que el nodo congelado quede vacío lo
 * garantiza `vaciarVolatiles()`, no este efecto — el prerender corre en un
 * Chromium de verdad y el efecto también corre ahí.
 */
export function FolioDeLectura({ className }: FolioDeLecturaProps) {
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    setFecha(
      new Date().toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    );
  }, []);

  return (
    <p
      data-volatil="fecha"
      className={cn(
        'font-space hidden text-[10px] uppercase tracking-[0.12em] print:block',
        className,
      )}
    >
      ¡BASTA! · edición del lector · {fecha}
    </p>
  );
}
```

En `apps/web/src/components/papel/primitives/index.ts`, insertar inmediatamente **después** de la línea literal:

```ts
export { FilaIndiceExpandible, type FilaIndiceExpandibleProps } from './FilaIndiceExpandible';
```

esta línea (el barril está alfabetizado; `FolioDeLectura` va entre `FilaIndiceExpandible` y `Kicker`):

```ts
export { ATRIBUTO_VOLATIL, FolioDeLectura, type FolioDeLecturaProps } from './FolioDeLectura';
```

> **Nota para el que llegue segundo.** B10 **saca** `NotaDemo` de este mismo barril. Los
> dos cambios tocan líneas distintas y no chocan: el que llegue segundo edita el archivo,
> no lo reescribe.

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/components/papel/primitives/ && pnpm -C apps/web exec eslint src/components/papel/primitives --max-warnings 0`
Esperado: PASA — los cuatro `it` nuevos en verde, los de `Palitos` y `primitives` sin cambios, y `eslint` sin salida (`react-refresh/only-export-components` corre con `allowConstantExport: true`, así que exportar `ATRIBUTO_VOLATIL` desde un `.tsx` no avisa).

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/src/components/papel/primitives/FolioDeLectura.tsx \
        v2/apps/web/src/components/papel/primitives/FolioDeLectura.test.tsx \
        v2/apps/web/src/components/papel/primitives/index.ts
git commit -m "feat(web): el folio de la edición impresa se vuelve primitiva y se marca volátil"
```

---

### Tarea 11: los dos lectores dejan de imprimir el reloj del proceso que congela

**Files:**
- Modify: `v2/apps/web/src/pages/PlanDetail.tsx` (dos anclas literales: el bloque `const fecha = new Date().toLocaleDateString('es-AR', {` y el `<p …>¡BASTA! · edición del lector · {fecha}</p>`; más la línea de import de primitivas)
- Modify: `v2/apps/web/src/pages/EnsayoDetail.tsx` (el `<p …>¡BASTA! · edición del lector · {fechaLarga(new Date().toISOString())}</p>`; más las dos líneas de import)
- Create: `v2/apps/web/src/pages/__tests__/lectores-sin-reloj.test.ts`

**Interfaces:**
- Consumes: `FolioDeLectura` de `~/components/papel/primitives` (Tarea 10).
- Produces: `PlanDetail.tsx` y `EnsayoDetail.tsx` sin una sola llamada a `new Date()`. **Los tests existentes `PlanDetail.test.tsx` y `EnsayoDetail.test.tsx` quedan verdes sin tocarse**: el markup renderizado es idéntico (mismo texto, mismas clases `hidden`/`print:block`), porque `@testing-library/react` envuelve `render` en `act` y el efecto de la primitiva se descarga antes del primer assert.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/pages/__tests__/lectores-sin-reloj.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Guardia de B12. Los dos lectores son exactamente las 44 URLs que el prerender
 * congela: cualquier valor que dependa del reloj del proceso que congela queda
 * horneado para siempre en `dist/`. El folio es `print:block`, así que un error
 * acá no se ve hasta que alguien imprime — por eso la guardia es sobre la
 * FUENTE y no sobre el render.
 */
const PAGINAS = dirname(dirname(fileURLToPath(import.meta.url)));

const LECTORES = ['PlanDetail.tsx', 'EnsayoDetail.tsx'] as const;

describe('los lectores que congela B12 no leen el reloj', () => {
  for (const archivo of LECTORES) {
    const fuente = readFileSync(join(PAGINAS, archivo), 'utf8');

    it(`${archivo} delega el folio en la primitiva`, () => {
      expect(fuente).toContain('<FolioDeLectura />');
    });

    it(`${archivo} no arma la fecha a mano`, () => {
      expect(fuente).not.toContain('new Date()');
      expect(fuente).not.toContain('edición del lector');
    });
  }

  it('EnsayoDetail.tsx suelta el helper de fecha que ya no usa', () => {
    const fuente = readFileSync(join(PAGINAS, 'EnsayoDetail.tsx'), 'utf8');

    expect(fuente).not.toContain('fechaLarga');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/pages/__tests__/lectores-sin-reloj.test.ts`
Esperado: FALLA — cinco `it` en rojo; el primero con `expected '…' to contain '<FolioDeLectura'`.

- [ ] **Paso 3: Implementación mínima**

En `apps/web/src/pages/PlanDetail.tsx`:

**(a)** reemplazar la línea de import de primitivas:

```tsx
import { BotonPapel, Kicker, Sello } from '~/components/papel/primitives';
```

por:

```tsx
import { BotonPapel, FolioDeLectura, Kicker, Sello } from '~/components/papel/primitives';
```

**(b)** borrar entero el cálculo de la fecha, o sea estas cinco líneas:

```tsx
  const fecha = new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
```

**(c)** reemplazar el folio:

```tsx
          <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
            ¡BASTA! · edición del lector · {fecha}
          </p>
```

por:

```tsx
          <FolioDeLectura />
```

En `apps/web/src/pages/EnsayoDetail.tsx`:

**(a)** reemplazar la línea de import de primitivas:

```tsx
import { BotonPapel, Kicker, RitoTinta, Sello } from '~/components/papel/primitives';
```

por:

```tsx
import { BotonPapel, FolioDeLectura, Kicker, RitoTinta, Sello } from '~/components/papel/primitives';
```

**(b)** reemplazar la línea de import de `biblioteca-data` (`fechaLarga` queda sin usarse y
`@typescript-eslint/no-unused-vars` es error):

```tsx
import { fechaLarga, ubicarEnsayo, type Vecino } from '~/pages/Biblioteca/biblioteca-data';
```

por:

```tsx
import { ubicarEnsayo, type Vecino } from '~/pages/Biblioteca/biblioteca-data';
```

**(c)** reemplazar el folio:

```tsx
        <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
          ¡BASTA! · edición del lector · {fechaLarga(new Date().toISOString())}
        </p>
```

por:

```tsx
        <FolioDeLectura />
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/pages/__tests__/lectores-sin-reloj.test.ts src/pages/__tests__/PlanDetail.test.tsx src/pages/__tests__/EnsayoDetail.test.tsx && pnpm -C apps/web exec eslint src --max-warnings 0 && pnpm -C apps/web exec tsc --noEmit`
Esperado: PASA — los cinco `it` nuevos en verde y los dos archivos de test existentes también, **sin haberlos tocado** (siguen buscando `/¡BASTA! · edición del lector ·/` y sus clases `hidden`/`print:block`, que la primitiva reproduce carácter por carácter). `eslint` y `tsc` sin salida.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/src/pages/PlanDetail.tsx v2/apps/web/src/pages/EnsayoDetail.tsx \
        v2/apps/web/src/pages/__tests__/lectores-sin-reloj.test.ts
git commit -m "fix(web): los dos lectores que se congelan dejan de imprimir el reloj del build"
```

---

### Tarea 12: `congelado.ts` — el envoltorio y las tres reglas de contención

**Files:**
- Create: `v2/scripts/build/congelado.ts`
- Create: `v2/scripts/build/__tests__/congelado.test.ts`

**Interfaces:**
- Consumes: nada. Módulo puro, sin `node:*`, sin Vite: sólo strings y regex.
- Produces (firmas del contrato, literales): `PATRONES_A_CONGELAR: readonly string[]`,
  `ATRIBUTO_ENVOLTORIO = 'data-prerender'`, `envolverCongelado(shell, markup): string`,
  `vaciarVolatiles(html): string`, `PATRON_VOCES_HORNEADAS: RegExp`,
  `tieneNumerosHorneados(html): boolean`.
  **Dos exports additivos** que el contrato no lista y que sólo consume `prerender.ts`:
  `FalloDeCongelado` y `auditarCongelado(html)`. Existen porque la spec pide *«un test del
  artefacto»* para las tres reglas, y la lógica de ese test no puede vivir en el CLI
  (nota 10 del contrato: los CLI llaman `main()` en el top level).

> **Por qué la auditoría del artefacto no es un `.test.ts`.** En `v2-ci.yml` el paso
> «Script tests» (`pnpm test:scripts`) corre **antes** de «Build all workspaces». Un
> archivo bajo `scripts/build/__tests__/**` —que el `include` de `scripts/vitest.config.ts`
> ya levanta— se ejecutaría sin `dist/` y tendría que skipearse: un test que no puede
> fallar es un defecto. Así que la auditoría corre **dentro de `pnpm prerender`**, releyendo
> de disco cada archivo escrito, y hace `process.exit(1)` con la lista de ofensores. Es un
> test del artefacto real, en CI, que rompe el job. Lo que sí se testea con fixtures acá es
> su lógica, y cada regla tiene un fixture que la pone en rojo.

- [ ] **Paso 1: Escribir el test que falla**

Crear `scripts/build/__tests__/congelado.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  ATRIBUTO_ENVOLTORIO,
  auditarCongelado,
  envolverCongelado,
  PATRON_VOCES_HORNEADAS,
  PATRONES_A_CONGELAR,
  tieneNumerosHorneados,
  vaciarVolatiles,
} from '../congelado';

/** El shell sellado por B11, reducido a lo único que este módulo mira. */
const SHELL = '<!doctype html><html><head><title>x</title></head><body><div id="root"></div></body></html>';

/** Serialización real del velo del despertar dormido (`DespertarVeil.tsx`). */
const VELO_DORMIDO =
  '<div aria-hidden="true" data-testid="despertar-veil" class="bg-oscuro-meta pointer-events-none fixed inset-0 z-[99] mix-blend-saturation transition-opacity duration-[1400ms] ease-out print:hidden" style="opacity: 0.6;"></div>';

/** El folio de `FolioDeLectura.tsx` tal como sale de `vaciarVolatiles`. */
const FOLIO_VACIO =
  '<p data-volatil="fecha" class="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block"></p>';

function congeladoDePrueba(extra = '', folio = FOLIO_VACIO): string {
  return envolverCongelado(
    SHELL,
    `${VELO_DORMIDO}<main><article class="edicion-impresa">${folio}<h1>Empresas que no son de nadie</h1>${extra}</article></main>`,
  );
}

describe('PATRONES_A_CONGELAR', () => {
  it('son los dos patrones de §4, literales como el `path` de app-routes.tsx', () => {
    expect([...PATRONES_A_CONGELAR].sort()).toEqual(['/ensayos/:slug', '/planes/:slug']);
  });
});

describe('envolverCongelado', () => {
  it('mete el markup dentro de #root, envuelto en el atributo que funde el <style> crítico de B2', () => {
    const html = envolverCongelado(SHELL, '<main>hola</main>');

    expect(ATRIBUTO_ENVOLTORIO).toBe('data-prerender');
    expect(html).toContain('<div id="root"><div data-prerender><main>hola</main></div></div>');
    expect(html).not.toContain('<div id="root"></div>');
  });

  it('conserva el <head> sellado por B11 intacto', () => {
    expect(envolverCongelado(SHELL, '<main>hola</main>')).toContain('<title>x</title>');
  });

  it('trata el markup como literal: las secuencias de reemplazo de String.replace no se expanden', () => {
    const markup = '<p>Ganó $& y perdió $` y $$</p>';
    const html = envolverCongelado(SHELL, markup);

    expect(html).toContain(markup);
    expect(html).not.toContain('id="root"></div> y perdió');
  });

  it('explota si el shell no tiene la ranura, en vez de escribir un archivo mudo', () => {
    expect(() => envolverCongelado('<html><body></body></html>', '<main>hola</main>')).toThrow(
      /ranura/,
    );
  });
});

describe('vaciarVolatiles', () => {
  it('vacía el folio de la edición impresa', () => {
    const sucio =
      '<p data-volatil="fecha" class="font-space print:block">¡BASTA! · edición del lector · 26 de julio de 2026</p>';

    expect(vaciarVolatiles(sucio)).toBe(
      '<p data-volatil="fecha" class="font-space print:block"></p>',
    );
  });

  it('vacía aunque el nodo tenga hijos', () => {
    const sucio = '<p data-volatil="fecha"><span>26</span> de julio</p>';

    expect(vaciarVolatiles(sucio)).toBe('<p data-volatil="fecha"></p>');
  });

  it('vacía todos los nodos volátiles del documento, no sólo el primero', () => {
    const sucio = '<p data-volatil="fecha">hoy</p><i>x</i><p data-volatil="fecha">hoy</p>';

    expect(vaciarVolatiles(sucio)).toBe(
      '<p data-volatil="fecha"></p><i>x</i><p data-volatil="fecha"></p>',
    );
  });

  it('no toca un atributo que apenas empieza igual', () => {
    const intacto = '<p data-volatilidad="alta">esto se queda</p>';

    expect(vaciarVolatiles(intacto)).toBe(intacto);
  });

  it('no toca el resto del documento', () => {
    const html = '<h1>Título</h1><p data-volatil="fecha">hoy</p><p>cuerpo</p>';

    expect(vaciarVolatiles(html)).toBe('<h1>Título</h1><p data-volatil="fecha"></p><p>cuerpo</p>');
  });
});

describe('tieneNumerosHorneados', () => {
  it('matchea la cifra fabricada del header en todas sus formas', () => {
    expect(PATRON_VOCES_HORNEADAS.source).toBe('\\d[\\d.]*\\s+voces');
    expect(tieneNumerosHorneados('<span>12.496 voces · falta la tuya</span>')).toBe(true);
    expect(tieneNumerosHorneados('<span>3 voces</span>')).toBe(true);
    expect(tieneNumerosHorneados('<span>1\n  voces</span>')).toBe(true);
  });

  it('deja pasar el régimen honesto de B10 y la palabra suelta', () => {
    expect(tieneNumerosHorneados('<span>Falta la tuya.</span>')).toBe(false);
    expect(tieneNumerosHorneados('<p>Las voces del mapa</p>')).toBe(false);
  });
});

describe('auditarCongelado', () => {
  it('un congelado bien hecho no tiene un solo reparo', () => {
    expect(auditarCongelado(congeladoDePrueba())).toEqual([]);
  });

  it('regla 1: falla si el sitio se congeló despierto', () => {
    const despierto = congeladoDePrueba().replace('opacity: 0.6;', 'opacity: 0;');
    const fallos = auditarCongelado(despierto);

    expect(fallos.map((f) => f.regla)).toContain('1 · dormido');
  });

  it('regla 2: falla si quedó horneado un número de la API', () => {
    const fallos = auditarCongelado(congeladoDePrueba('<span>12.496 voces · falta la tuya</span>'));

    expect(fallos.map((f) => f.regla)).toContain('2 · números de la API');
    expect(fallos.map((f) => f.detalle).join(' ')).toContain('12.496 voces');
  });

  it('regla 3: falla si un nodo volátil llegó a disco con la fecha del build', () => {
    const conFecha =
      '<p data-volatil="fecha" class="print:block">¡BASTA! · edición del lector · 26 de julio de 2026</p>';
    const fallos = auditarCongelado(congeladoDePrueba('', conFecha));

    expect(fallos.map((f) => f.regla)).toContain('3 · valores del reloj');
  });

  it('falla si el markup no quedó envuelto: el fundido de B2 no tendría a qué agarrarse', () => {
    const sinEnvoltorio = congeladoDePrueba().replace('<div data-prerender>', '<div>');
    const fallos = auditarCongelado(sinEnvoltorio);

    expect(fallos.map((f) => f.regla)).toContain('envoltorio');
  });

  it('falla si el lector pintó el expediente extraviado en vez del documento', () => {
    const fallos = auditarCongelado(congeladoDePrueba('<div>expediente extraviado</div>'));

    expect(fallos.map((f) => f.regla)).toContain('contenido');
  });

  it('junta todos los reparos de una vez, no corta en el primero', () => {
    const roto = congeladoDePrueba('<span>12.496 voces</span><div>expediente extraviado</div>')
      .replace('opacity: 0.6;', 'opacity: 0;');

    expect(auditarCongelado(roto)).toHaveLength(3);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA con `Failed to load url ../congelado` — el módulo todavía no existe.

- [ ] **Paso 3: Implementación mínima**

Crear `scripts/build/congelado.ts`:

```ts
/**
 * Lógica pura de B12: el envoltorio del HTML congelado y las tres reglas de
 * contención de §4 de la spec del sustrato.
 *
 * Vive separada de `prerender.ts` porque ese archivo es un CLI que llama
 * `main()` en el top level: importarlo desde un test levantaría un navegador.
 * Cero `node:*`, cero Vite: strings y regex.
 */

/**
 * Los patrones que se congelan. Literales, carácter por carácter iguales al
 * `path` de `app-routes.tsx` y a la clave `patron` del registro. `prerender.ts`
 * filtra `enumerarUrls()` con esto — nunca con una lista de slugs escrita a
 * mano: hoy son 44 URLs (23 planes + 21 ensayos) y 48 cuando entren los cuatro
 * PLANes nuevos, sin tocar este archivo.
 */
export const PATRONES_A_CONGELAR: readonly string[] = ['/planes/:slug', '/ensayos/:slug'];

/**
 * Envoltorio del markup congelado. Contrato compartido con el `<style>` crítico
 * que B2 dejó en `index.html`, que lo funde en 120 ms: React 18 con `createRoot`
 * descarta el markup previo a propósito, y el fundido hace invisible el
 * reemplazo. El nombre no se renombra.
 */
export const ATRIBUTO_ENVOLTORIO = 'data-prerender';

/** La ranura vacía que deja Vite en el shell y que B11 no toca. */
const RANURA_ROOT = '<div id="root"></div>';

/**
 * Nodos marcados por `FolioDeLectura`. `[^>]*` no puede cruzar un `>`, así que
 * el match nunca se escapa de la etiqueta de apertura; `(?![\w-])` evita que
 * `data-volatilidad` pase por volátil. El contenido se toma perezoso hasta el
 * primer cierre de la MISMA etiqueta.
 */
const NODO_VOLATIL =
  /(<([a-zA-Z][\w-]*)\b[^>]*\sdata-volatil(?![\w-])(?:="[^"]*")?[^>]*>)([\s\S]*?)(<\/\2>)/g;

/** Regla 1: el velo del despertar dormido (`DespertarVeil.tsx`) imprime `opacity: 0.6`. */
const VELO_DORMIDO = /data-testid="despertar-veil"[^>]*opacity:\s*0\.6/;

/** Regla 2: la cifra fabricada que B10 borró. */
export const PATRON_VOCES_HORNEADAS = /\d[\d.]*\s+voces/;

/** El lector no encontró el documento y pintó el 404 de §5 en vez del expediente. */
const EXPEDIENTE_EXTRAVIADO = 'expediente extraviado';

/**
 * Envuelve el markup congelado en `<div data-prerender>` dentro de `#root`,
 * conservando intacto el `<head>` que selló B11.
 *
 * El reemplazo va por función a propósito: con un string, `String.replace`
 * interpreta `$&`, `` $` `` y `$'` del markup como patrones y se come el
 * documento.
 */
export function envolverCongelado(shell: string, markup: string): string {
  if (!shell.includes(RANURA_ROOT)) {
    throw new Error(
      `El shell no tiene la ranura ${RANURA_ROOT}: no hay dónde meter el HTML congelado.`,
    );
  }
  return shell.replace(
    RANURA_ROOT,
    () => `<div id="root"><div ${ATRIBUTO_ENVOLTORIO}>${markup}</div></div>`,
  );
}

/**
 * Regla 3: vacía todo nodo `data-volatil`. El prerender corre en un Chromium de
 * verdad, así que el `useEffect` de `FolioDeLectura` YA corrió y la fecha del
 * build llegó al markup: esta función es la que la saca. El cliente la repuebla
 * al montar, con el reloj del lector.
 */
export function vaciarVolatiles(html: string): string {
  return html.replace(NODO_VOLATIL, (_todo, apertura: string, _etiqueta: string, _contenido: string, cierre: string) => `${apertura}${cierre}`);
}

/** Regla 2: ¿quedó horneado un número que sale de la API? */
export function tieneNumerosHorneados(html: string): boolean {
  return PATRON_VOCES_HORNEADAS.test(html);
}

export interface FalloDeCongelado {
  readonly regla: string;
  readonly detalle: string;
}

/** Nodos volátiles que llegaron con contenido, o sea que nadie los vació. */
function volatilesSinVaciar(html: string): readonly string[] {
  const sucios: string[] = [];
  for (const coincidencia of html.matchAll(NODO_VOLATIL)) {
    const contenido = (coincidencia[3] ?? '').trim();
    if (contenido !== '') sucios.push(contenido);
  }
  return sucios;
}

/**
 * El test del artefacto. Corre dentro de `pnpm prerender` sobre cada archivo
 * releído de disco, y no como un `.test.ts`, porque el paso «Script tests» del
 * CI corre ANTES de «Build all workspaces»: un test que se skipea cuando no hay
 * `dist/` no puede fallar, y un test que no puede fallar es un defecto.
 */
export function auditarCongelado(html: string): readonly FalloDeCongelado[] {
  const fallos: FalloDeCongelado[] = [];

  if (!html.includes(`<div ${ATRIBUTO_ENVOLTORIO}>`)) {
    fallos.push({
      regla: 'envoltorio',
      detalle: `falta <div ${ATRIBUTO_ENVOLTORIO}> dentro de #root: el fundido de 120 ms no tiene a qué agarrarse`,
    });
  }

  if (!VELO_DORMIDO.test(html)) {
    fallos.push({
      regla: '1 · dormido',
      detalle: 'el velo del despertar no quedó en gris (opacity: 0.6): se congeló un sitio despierto',
    });
  }

  const voces = PATRON_VOCES_HORNEADAS.exec(html);
  if (voces !== null) {
    fallos.push({
      regla: '2 · números de la API',
      detalle: `quedó horneado «${voces[0]}»`,
    });
  }

  for (const sucio of volatilesSinVaciar(html)) {
    fallos.push({
      regla: '3 · valores del reloj',
      detalle: `nodo data-volatil sin vaciar: «${sucio}»`,
    });
  }

  if (html.includes(EXPEDIENTE_EXTRAVIADO)) {
    fallos.push({
      regla: 'contenido',
      detalle:
        'el lector pintó el expediente extraviado: el slug que salió de disco no existe en el registry de Vite',
    });
  }

  return fallos;
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm lint && pnpm type-check`
Esperado: PASA — los diecinueve `it` de `congelado.test.ts` en verde, más los de `proyeccion.test.ts` y `content/__tests__` sin cambios; `lint` y `type-check` sin salida.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/scripts/build/congelado.ts v2/scripts/build/__tests__/congelado.test.ts
git commit -m "feat(scripts): congelado.ts — envoltorio del prerender y las tres reglas de contención"
```

---

### Tarea 13: `prerender.ts` y `pnpm prerender`

**Files:**
- Create: `v2/scripts/build/prerender.ts`
- Modify: `v2/package.json` (anclado en la línea literal `    "size": "size-limit",`)
- Create: `v2/scripts/build/__tests__/prerender-cableado.test.ts`

**Interfaces:**
- Consumes: `enumerarUrls` de `../../apps/web/src/lib/rutas/registro` (B7) — el `UrlDelSitio` que devuelve se usa inferido, sin importar el tipo;
  `leerFuenteDeDisco`, `origenDelBuild` de `./fuente-disco` (Tarea 1);
  `archivoDe` de `./sellado` (Tarea 5);
  `PATRONES_A_CONGELAR`, `envolverCongelado`, `vaciarVolatiles`, `auditarCongelado` de `./congelado` (Tarea 12);
  `chromium` de `@playwright/test` (ya es devDependency de la raíz de `v2/`, y `scripts/` resuelve contra `v2/node_modules`).
- Produces: el script `pnpm prerender`. **SIN exports** — `main()` en el top level, igual que `scripts/content/verify-planes-index.ts`. No usa `react-dom/server`: eso obligaría a auditar SSR-safety de las 54 rutas.

> **Sobre `VITE_API_URL` (regla 2), y por qué acá se hace distinto de como lo dice §4.**
> La spec pide correr el prerender «con `VITE_API_URL` apuntando a un puerto muerto».
> Verificado contra el código: **`VITE_API_URL` no existe en `v2/`**. `apps/web/src/lib/api.ts`
> hace `fetch(path)` con paths relativos y `credentials: 'include'`; la única variable del
> repo es `PUBLIC_API_URL`, que `vite.config.ts` usa en `server.proxy` — y `vite preview`
> **no lee `server.proxy`**. Inventar la variable exigiría agregarle un `preview.proxy` a
> `vite.config.ts`, o sea **crear** el camino a la API para después apuntarlo a un puerto
> muerto. Se hace lo que da la misma garantía y no depende de la configuración del
> servidor: **el prerender aborta toda request a `**/api/**` en el navegador**, con
> `route.abort('connectionrefused')`. Es literalmente un puerto muerto, una capa más
> abajo, y sobrevive a que alguien le agregue un proxy al preview mañana. La regla la
> cierra igual la auditoría del artefacto: si un número llega a disco, el job muere.

- [ ] **Paso 1: Escribir el test que falla**

Crear `scripts/build/__tests__/prerender-cableado.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ_V2 = join(AQUI, '..', '..', '..');

interface PackageJson {
  readonly scripts?: Readonly<Record<string, string>>;
}

const paquete = JSON.parse(readFileSync(join(RAIZ_V2, 'package.json'), 'utf8')) as PackageJson;

describe('pnpm prerender', () => {
  it('existe y apunta al CLI', () => {
    expect(paquete.scripts?.['prerender']).toBe('tsx scripts/build/prerender.ts');
  });

  it('NO está metido dentro de `pnpm build`: el CI instala Chromium después del build', () => {
    expect(paquete.scripts?.['build'] ?? '').not.toContain('prerender');
    expect(paquete.scripts?.['verify'] ?? '').not.toContain('prerender');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA con `expected undefined to be 'tsx scripts/build/prerender.ts'` en el primer `it`.

- [ ] **Paso 3: Implementación mínima**

Crear `scripts/build/prerender.ts`:

```ts
/**
 * Prerender de planes y ensayos (§4 de `docs/specs/2026-07-26-el-sustrato.md`).
 *
 * NO va dentro de `pnpm build`: el CI instala el Chromium de Playwright sólo en
 * el job `e2e-tests`, que declara `needs: build-and-test` y por lo tanto corre
 * DESPUÉS. Es un paso propio de `build-and-test`, precedido por
 * `pnpm exec playwright install --with-deps chromium`.
 *
 * Levanta `vite preview` como proceso hijo, espera el 200, visita cada URL con
 * Chromium, congela el markup dentro del `index.html` que ya selló B11 y mata el
 * preview. No usa `react-dom/server`: eso obligaría a auditar SSR-safety de las
 * 54 rutas, y congelar con un navegador que ya está en el toolchain cuesta menos.
 *
 * Las URLs se DERIVAN de `planes-index.generated.ts` y `loadContentDir` vía
 * `enumerarUrls()`: hoy 44, 48 cuando entren los cuatro PLANes nuevos.
 *
 * Run: pnpm prerender   (desde v2/, DESPUÉS de `pnpm build`)
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { setTimeout as dormir } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

import { enumerarUrls } from '../../apps/web/src/lib/rutas/registro';

import {
  auditarCongelado,
  envolverCongelado,
  PATRONES_A_CONGELAR,
  vaciarVolatiles,
} from './congelado';
import { leerFuenteDeDisco, origenDelBuild } from './fuente-disco';
import { archivoDe } from './sellado';

const RAIZ_V2 = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const APPS_WEB = resolve(RAIZ_V2, 'apps/web');
const DIST = resolve(APPS_WEB, 'dist');
const PUERTO = 4173;
const BASE = `http://127.0.0.1:${String(PUERTO)}`;
const ESPERA_MS = 30_000;

/**
 * `--strictPort` a propósito: sin él, un 4173 ocupado hace que Vite se mueva de
 * puerto en silencio y el prerender congele lo que sirva otro proceso.
 */
function levantarPreview(): ChildProcess {
  return spawn(
    'pnpm',
    ['--dir', APPS_WEB, 'exec', 'vite', 'preview', '--port', String(PUERTO), '--strictPort'],
    { cwd: RAIZ_V2, detached: true, stdio: 'ignore' },
  );
}

async function esperarElDoscientos(intentos = 60): Promise<void> {
  for (let i = 0; i < intentos; i += 1) {
    try {
      const respuesta = await fetch(`${BASE}/`);
      if (respuesta.status === 200) return;
    } catch {
      // Todavía no levantó; se reintenta.
    }
    await dormir(500);
  }
  throw new Error(`vite preview no devolvió 200 en ${BASE}/ después de ${String(intentos)} intentos.`);
}

/** `detached: true` hace del hijo un grupo: se mata el grupo, no sólo a pnpm. */
function matarPreview(preview: ChildProcess): void {
  const { pid } = preview;
  if (pid === undefined) return;
  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    preview.kill('SIGTERM');
  }
}

async function main(): Promise<void> {
  if (!existsSync(resolve(DIST, 'index.html'))) {
    process.stderr.write('No hay dist/. Corré `pnpm build` antes de `pnpm prerender`.\n');
    process.exit(1);
  }

  const fuente = await leerFuenteDeDisco();
  const urls = enumerarUrls({ origen: origenDelBuild(), fuente }).filter((url) =>
    PATRONES_A_CONGELAR.includes(url.entrada.patron),
  );

  if (urls.length === 0) {
    process.stderr.write(
      `Cero URLs para congelar: la derivación desde disco no devolvió nada para ${PATRONES_A_CONGELAR.join(', ')}.\n`,
    );
    process.exit(1);
  }

  process.stdout.write(`prerender — ${String(urls.length)} URLs derivadas del contenido en disco.\n`);

  const preview = levantarPreview();
  const navegador = await chromium.launch();
  const escritos: string[] = [];
  const problemas: string[] = [];

  try {
    await esperarElDoscientos();

    // Regla 1: contexto nuevo, sin `localStorage`. `despertar.ts` lee
    // `basta_despierto` de ahí, así que el congelado sale en gris — igual que el
    // primer paint de cualquier visitante nuevo.
    const contexto = await navegador.newContext();
    const pagina = await contexto.newPage();

    // Regla 2: ningún número de la API puede quedar horneado. Se corta la red
    // hacia la API en el navegador, que es la garantía que la spec pide con
    // «un puerto muerto» y no depende de cómo esté configurado el preview.
    await pagina.route('**/api/**', (ruta) => ruta.abort('connectionrefused'));

    for (const url of urls) {
      const archivo = resolve(DIST, archivoDe(url.ruta));
      if (!existsSync(archivo)) {
        problemas.push(`${url.ruta}: falta ${archivo}. ¿Corrió sellar-head.ts dentro de pnpm build?`);
        continue;
      }

      await pagina.goto(`${BASE}${url.ruta}`, { waitUntil: 'networkidle', timeout: ESPERA_MS });
      await pagina.waitForSelector('article.edicion-impresa', { timeout: ESPERA_MS });
      // El cuerpo del plan llega por `import()`: sin esto se congelaría el
      // estado de carga en vez del documento.
      await pagina.waitForFunction(
        () => !(document.body.textContent ?? '').includes('Abriendo el expediente…'),
        undefined,
        { timeout: ESPERA_MS },
      );

      const markup = await pagina.$eval('#root', (nodo) => nodo.innerHTML);
      const sellado = readFileSync(archivo, 'utf8');
      const congelado = vaciarVolatiles(envolverCongelado(sellado, markup));

      writeFileSync(archivo, congelado, 'utf8');
      escritos.push(archivo);
      process.stdout.write(`  congelado ${url.ruta}\n`);
    }
  } finally {
    await navegador.close();
    matarPreview(preview);
  }

  // El test del artefacto: se relee de disco lo que se escribió y se audita.
  // No es un `.test.ts` porque el paso «Script tests» del CI corre antes del
  // build; acá el HTML existe de verdad y el exit 1 rompe el job.
  for (const archivo of escritos) {
    for (const fallo of auditarCongelado(readFileSync(archivo, 'utf8'))) {
      problemas.push(`${archivo}: regla ${fallo.regla} — ${fallo.detalle}`);
    }
  }

  if (problemas.length > 0) {
    process.stderr.write(`prerender — ${String(problemas.length)} problema(s):\n`);
    for (const problema of problemas) {
      process.stderr.write(`  ${problema}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(
    `prerender — ${String(escritos.length)} URLs congeladas y auditadas contra las tres reglas.\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
```

En `v2/package.json`, insertar inmediatamente **antes** de la línea literal:

```json
    "size": "size-limit",
```

la línea:

```json
    "prerender": "tsx scripts/build/prerender.ts",
```

> Queda `"planes:check"` → `"deps:check"` (B1) → `"meta:check"` (B7) → `"prerender"` →
> `"size"` → `"verify"`. `prerender` **no** entra a `verify`: `verify` no puede depender
> de un navegador instalado.

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm lint && pnpm type-check && pnpm build && pnpm exec playwright install chromium && pnpm prerender`
Esperado: PASA — los dos `it` de `prerender-cableado.test.ts` en verde; el prerender imprime `prerender — 44 URLs derivadas del contenido en disco.`, una línea `congelado /planes/…` o `congelado /ensayos/…` por URL, y cierra con `prerender — 44 URLs congeladas y auditadas contra las tres reglas.`

Ahora verificar el artefacto a mano:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
# El documento está escrito en el HTML, envuelto para el fundido de B2:
grep -c 'data-prerender' apps/web/dist/planes/planeb/index.html          # 1
grep -c 'edicion-impresa' apps/web/dist/ensayos/*/index.html | head -3   # 1 por archivo
# Regla 2 — ningún número de la API horneado en ninguna de las 44:
grep -rlE '[0-9][0-9.]*[[:space:]]+voces' apps/web/dist/planes apps/web/dist/ensayos   # sin salida
# Regla 3 — ningún folio con fecha:
grep -rl 'edición del lector ·' apps/web/dist/planes apps/web/dist/ensayos             # sin salida
# El <head> sellado por B11 sobrevivió al congelado:
grep -o '<meta property="og:title"[^>]*>' apps/web/dist/planes/planeb/index.html       # una línea
```

Y probar que la auditoría muerde. Un experimento por vez, revirtiendo después de cada uno:

```bash
# (a) Regla 3: dejar de vaciar los nodos volátiles.
#     En scripts/build/prerender.ts, reemplazar
#       const congelado = vaciarVolatiles(envolverCongelado(sellado, markup));
#     por
#       const congelado = envolverCongelado(sellado, markup);
pnpm prerender
# Esperado: FALLA con «regla 3 · valores del reloj — nodo data-volatil sin vaciar:
# «¡BASTA! · edición del lector · …»», 44 veces, y exit 1.

# (b) Regla 2: devolverle al header un número fabricado.
#     En apps/web/src/components/papel/voces-regimen.ts hacer que `etiquetaDeVoces`
#     devuelva '12.496 voces · falta la tuya' en el estado 'error'.
pnpm build && pnpm prerender
# Esperado: FALLA con «regla 2 · números de la API — quedó horneado «12.496 voces»» y exit 1.

# (c) Regla 1: congelar despierto.
#     En scripts/build/prerender.ts, después de `const contexto = await navegador.newContext();`
#     agregar `await contexto.addInitScript(() => { localStorage.setItem('basta_despierto', '1'); });`
pnpm prerender
# Esperado: FALLA con «regla 1 · dormido — el velo del despertar no quedó en gris».

# (d) Derivación: renombrar PATRONES_A_CONGELAR a un patrón inexistente
#     ('/planes/:codigo') en scripts/build/congelado.ts.
pnpm prerender
# Esperado: FALLA con «Cero URLs para congelar: la derivación desde disco no devolvió nada…».
```

Los cuatro experimentos revierten a mano; ninguno deja rastro en `dist/` que sobreviva al
`pnpm build` siguiente. La regla 3 tiene además una guardia del lado de la fuente
—`lectores-sin-reloj.test.ts`, Tarea 11— porque si alguien le saca la marca `data-volatil`
al folio, la auditoría del artefacto se queda sin nodo que mirar.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/scripts/build/prerender.ts v2/scripts/build/__tests__/prerender-cableado.test.ts \
        v2/package.json
git commit -m "feat(scripts): pnpm prerender congela las 44 URLs de planes y ensayos"
```

---

### Tarea 14: el prerender entra al CI, en `build-and-test`

**Files:**
- Modify: `.github/workflows/v2-ci.yml` (en la **raíz del repo**, no en `v2/`; anclado al final del job `build-and-test`, después del paso literal `      - name: Bundle size budgets`)
- Modify: `v2/scripts/build/__tests__/prerender-cableado.test.ts` (agregar al final)

**Interfaces:**
- Consumes: `pnpm prerender` (Tarea 13).
- Produces: dos pasos nuevos en `build-and-test`. **El `playwright install` se duplica a propósito** con el del job `e2e-tests`: son dos runners distintos y el de `e2e-tests` declara `needs: build-and-test`, o sea que corre después y no le sirve a nadie acá.

- [ ] **Paso 1: Escribir el test que falla**

Agregar al final de `scripts/build/__tests__/prerender-cableado.test.ts`, después del `describe('pnpm prerender', …)` que cierra la Tarea 13:

```ts
const workflow = readFileSync(join(RAIZ_V2, '..', '.github', 'workflows', 'v2-ci.yml'), 'utf8');

/** El job `build-and-test`, recortado antes de que empiece `integration-tests`. */
const buildAndTest = workflow.slice(
  workflow.indexOf('  build-and-test:'),
  workflow.indexOf('  integration-tests:'),
);

describe('el prerender en el CI', () => {
  it('corre dentro de `build-and-test`, no en el job que espera al build', () => {
    expect(buildAndTest).toContain('run: pnpm prerender');
  });

  it('instala Chromium antes de correr el prerender, y las dos cosas después del build', () => {
    const build = buildAndTest.indexOf('run: pnpm build');
    const instalacion = buildAndTest.indexOf('pnpm exec playwright install --with-deps chromium');
    const prerender = buildAndTest.indexOf('run: pnpm prerender');

    expect(build).toBeGreaterThan(-1);
    expect(instalacion).toBeGreaterThan(build);
    expect(prerender).toBeGreaterThan(instalacion);
  });

  it('el job e2e-tests conserva su propia instalación: es otro runner', () => {
    const e2e = workflow.slice(workflow.indexOf('  e2e-tests:'));

    expect(e2e).toContain('pnpm exec playwright install --with-deps chromium');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA con `expected '  build-and-test:\n…' to contain 'run: pnpm prerender'`.

- [ ] **Paso 3: Implementación mínima**

En `.github/workflows/v2-ci.yml`, agregar al **final del job `build-and-test`**, o sea después del paso «Bundle size budgets» —que hoy es el último y termina en `run: pnpm size`— y antes de la línea `  integration-tests:`:

```yaml
      # El Chromium se instala también acá y no sólo en `e2e-tests`: ese job
      # declara `needs: build-and-test`, o sea que corre en otro runner y
      # después. El prerender necesita el navegador con el `dist` recién
      # construido, en este mismo job.
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      # Congela las 44 URLs de planes y ensayos sobre los `index.html` que
      # `sellar-head.ts` ya escribió durante `pnpm build`. Fuera de `pnpm build`
      # a propósito: el build no puede depender de un navegador instalado.
      - name: Prerender de planes y ensayos
        run: pnpm prerender
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm exec prettier --check ../.github/workflows/v2-ci.yml`
Esperado: PASA — los cinco `it` de `prerender-cableado.test.ts` en verde y `prettier` diciendo `All matched files use Prettier code style!`.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add .github/workflows/v2-ci.yml \
        v2/scripts/build/__tests__/prerender-cableado.test.ts
git commit -m "ci(v2): el prerender corre en build-and-test, con su propio Chromium"
```

---

## Bloque B13 — Verificación y guardias

> **Qué entrega el bloque.** La prueba de que lo que hicieron B9, B11 y B12 funciona
> **servido por un host de verdad**, no por `vite preview`: `scripts/build/publicacion.ts`
> (leer y juzgar un `<head>` servido, puro y testeable), `scripts/build/verificar-publicacion.ts`
> con el script `pnpm publicacion:check` (los DoD #1, #2 y #3 contra un origen que se pasa
> por bandera), `tests/e2e/sustrato.spec.ts` (los DoD #4, #7 y #9, que corren en el job
> `e2e-tests` que ya existe) y el acta de los 10 ítems de la Definición de terminado.
>
> **Por qué no alcanza `vite preview`.** Hace fallback SPA por su cuenta: devuelve el
> `index.html` de la portada para cualquier ruta que no encuentre, con 200. Eso tapa
> exactamente lo que hay que verificar — que el `index.html` **sellado** de cada URL es el
> que sale, que `/no-existe` da **404 real** y que los headers y la caché de `v2/vercel.json`
> llegan al cliente. Por eso la spec (D1) decide un proyecto de **preview en Vercel, sin
> dominio y sin promoción a producción**, y lo pone dentro de este bloque.
>
> **Las URLs a golpear se derivan, nunca se escriben.** `verificar-publicacion.ts` arma su
> lista con `enumerarUrls()` sobre `leerFuenteDeDisco()` y toma la portada más el primer
> documento de cada una de las cuatro secciones con tarjeta propia. Cuando entren los cuatro
> PLANes nuevos no se toca una línea.
>
> **Depende de todos los bloques anteriores**, y de los planes A, B y C: sin el sellado no
> hay `<head>` que leer, sin `v2/vercel.json` no hay headers que medir, sin el skip link de
> B4 no hay recorrido de teclado, sin el `<noscript>` de B2 no hay qué mostrar sin JS y sin
> el `ErrorBoundary` de B5 no hay expediente cuando falta un chunk.

---

### Tarea 15: `publicacion.ts` — leer un `<head>` servido y juzgarlo

**Files:**
- Create: `v2/scripts/build/publicacion.ts`
- Create: `v2/scripts/build/__tests__/publicacion.test.ts`

**Interfaces:**
- Consumes: `LARGO_MAXIMO_DESCRIPCION` de `../../apps/web/src/lib/rutas/descripcion-de` (B7) ·
  `TARJETA_TWITTER` de `../../apps/web/src/lib/rutas/registro` (B7). El test además usa
  `sellarShell` de `../sellado` y `RAIZ_V2` de `../fuente-disco`, para que el fixture sea
  **exactamente** lo que escribe el sellado y no una maqueta que se puede desincronizar.
- Produces:
  - `export function desescaparHtml(texto: string): string;`
  - `export interface CabezaServida { readonly titulo: string; readonly descripcion: string; readonly canonica: string; readonly robots: string; readonly og: Readonly<Record<string, string>>; readonly twitter: Readonly<Record<string, string>>; }`
  - `export function leerCabeza(html: string): CabezaServida;`
  - `export interface ReparoDePublicacion { readonly url: string; readonly detalle: string; }`
  - `export interface EsperadoDeCabeza { readonly origen: string; readonly ruta: string; readonly indexable: boolean; }`
  - `export function auditarCabeza(cabeza: CabezaServida, esperado: EsperadoDeCabeza): readonly ReparoDePublicacion[];`
  - `export function auditarDistincion(cabezas: ReadonlyMap<string, CabezaServida>): readonly ReparoDePublicacion[];`

> **Por qué la lógica va separada del CLI.** `verificar-publicacion.ts` golpea la red: no se
> puede importar desde un test sin un servidor levantado. Acá vive todo lo que se puede
> juzgar con un string, y el CLI se queda sólo con los `fetch` y los `process.exit`. Es el
> mismo reparto que `sellado.ts` / `sellar-head.ts` y que `congelado.ts` / `prerender.ts`.

- [ ] **Paso 1: Escribir el test que falla**

Crear `v2/scripts/build/__tests__/publicacion.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { TARJETA_TWITTER } from '../../../apps/web/src/lib/rutas/registro';
import { RAIZ_V2 } from '../fuente-disco';
import {
  auditarCabeza,
  auditarDistincion,
  desescaparHtml,
  leerCabeza,
  type CabezaServida,
} from '../publicacion';
import { sellarShell } from '../sellado';

const ORIGEN = 'https://preview.ejemplo.test';

/**
 * El shell REAL de `apps/web/index.html` sellado por la MISMA función que corre en
 * el build. Si `sellarShell` cambia el formato de una etiqueta, este test se pone
 * rojo en vez de dejar que el lector del preview lea otra cosa.
 */
const SHELL = readFileSync(join(RAIZ_V2, 'apps/web/index.html'), 'utf8');

function servida(
  ruta: string,
  titulo: string,
  og: string,
  robots: string | null = null,
): string {
  return sellarShell(SHELL, {
    titulo,
    descripcion: `Una descripción honesta de ${titulo}.`,
    indexacion: robots === null ? 'publica' : 'privada',
    superficie: 'papel',
    canonica: `${ORIGEN}${ruta}`,
    og: `${ORIGEN}${og}`,
    robots,
  });
}

const PORTADA = servida('/', 'El país lo diseña la gente', '/og/home.png');
const PLAN = servida('/planes/planeb', 'PLANEB · Empresas Bastardas', '/og/planes/planeb.png');

describe('desescaparHtml', () => {
  it('deshace exactamente lo que hace `escaparHtml` del sellado', () => {
    expect(desescaparHtml('a&amp;b&lt;c&gt;d&quot;e&#39;f')).toBe(`a&b<c>d"e'f`);
  });

  it('no toca las comillas angulares ni los signos de apertura', () => {
    expect(desescaparHtml('«¡BASTA!»')).toBe('«¡BASTA!»');
  });
});

describe('leerCabeza', () => {
  it('saca título, descripción, canónica y las doce etiquetas sociales', () => {
    const cabeza = leerCabeza(PLAN);

    expect(cabeza.titulo).toContain('PLANEB');
    expect(cabeza.descripcion).toContain('PLANEB');
    expect(cabeza.canonica).toBe(`${ORIGEN}/planes/planeb`);
    expect(cabeza.og['title']).toBe(cabeza.titulo);
    expect(cabeza.og['url']).toBe(cabeza.canonica);
    expect(cabeza.og['image']).toBe(`${ORIGEN}/og/planes/planeb.png`);
    expect(cabeza.og['type']).toBe('website');
    expect(cabeza.og['site_name']).toBe('¡BASTA!');
    expect(cabeza.og['locale']).toBe('es_AR');
    expect(cabeza.twitter['card']).toBe(TARJETA_TWITTER);
    expect(cabeza.twitter['image']).toBe(cabeza.og['image']);
  });

  it('una pública no trae meta robots; una privada sí', () => {
    expect(leerCabeza(PORTADA).robots).toBe('');
    expect(
      leerCabeza(servida('/ingresar', 'Entrar', '/og/entrada.png', 'noindex,nofollow')).robots,
    ).toBe('noindex,nofollow');
  });

  it('desescapa los valores en vez de devolver las entidades crudas', () => {
    const html = servida('/prueba', 'Comillas "peligrosas" & <etiquetas>', '/og/default.png');

    expect(leerCabeza(html).titulo).toBe('Comillas "peligrosas" & <etiquetas>');
  });

  it('un shell sin sellar sale con las sociales vacías, no explota', () => {
    const cabeza = leerCabeza('<html><head><title>x</title></head><body></body></html>');

    expect(cabeza.titulo).toBe('x');
    expect(cabeza.og).toEqual({});
    expect(cabeza.canonica).toBe('');
  });
});

describe('auditarCabeza', () => {
  const esperado = { origen: ORIGEN, ruta: '/planes/planeb', indexable: true };

  it('una cabeza sellada de verdad no tiene un solo reparo', () => {
    expect(auditarCabeza(leerCabeza(PLAN), esperado)).toEqual([]);
  });

  it('se queja si falta la imagen: es el ítem #1 de la Definición de terminado', () => {
    const sinImagen: CabezaServida = { ...leerCabeza(PLAN), og: {} };

    expect(auditarCabeza(sinImagen, esperado).map((r) => r.detalle).join(' ')).toContain(
      'og:image',
    );
  });

  it('se queja si el scraper recibió la canónica de otra URL', () => {
    const reparos = auditarCabeza(leerCabeza(PORTADA), esperado);

    expect(reparos.length).toBeGreaterThan(0);
    expect(reparos.map((r) => r.detalle).join(' ')).toContain('canónica');
  });

  it('se queja si una pública llegó con noindex, y si una privada llegó sin él', () => {
    const privada = leerCabeza(servida('/ingresar', 'Entrar', '/og/entrada.png', 'noindex,nofollow'));

    expect(
      auditarCabeza(privada, { origen: ORIGEN, ruta: '/ingresar', indexable: true }).length,
    ).toBeGreaterThan(0);
    expect(
      auditarCabeza(leerCabeza(PORTADA), { origen: ORIGEN, ruta: '/', indexable: false }).length,
    ).toBeGreaterThan(0);
  });

  it('se queja de una imagen relativa: los scrapers no resuelven rutas', () => {
    const relativa: CabezaServida = {
      ...leerCabeza(PLAN),
      og: { ...leerCabeza(PLAN).og, image: '/og/planes/planeb.png' },
    };

    expect(auditarCabeza(relativa, esperado).map((r) => r.detalle).join(' ')).toContain(
      'absoluta',
    );
  });
});

describe('auditarDistincion', () => {
  it('cinco URLs con cinco tarjetas propias no tienen reparo', () => {
    const cabezas = new Map([
      ['/', leerCabeza(PORTADA)],
      ['/planes/planeb', leerCabeza(PLAN)],
    ]);

    expect(auditarDistincion(cabezas)).toEqual([]);
  });

  it('dos URLs que comparten tarjeta o título son el fallback SPA disfrazado', () => {
    const cabezas = new Map([
      ['/', leerCabeza(PORTADA)],
      ['/planes/planeb', leerCabeza(PORTADA)],
    ]);
    const detalles = auditarDistincion(cabezas).map((r) => r.detalle).join(' ');

    expect(detalles).toContain('comparte');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA con `Failed to resolve import "../publicacion"`.

- [ ] **Paso 3: Implementación mínima**

Crear `v2/scripts/build/publicacion.ts`:

```ts
/**
 * Lee el `<head>` que devolvió un host de verdad y lo juzga contra lo que el
 * registro prometió. Puro: strings, regex y nada de red — el que golpea el
 * preview es `verificar-publicacion.ts`, que no exporta nada.
 *
 * Es el lado testeable de los ítems #1, #2 y #3 de la Definición de terminado.
 *
 * Spec: `docs/specs/2026-07-26-el-sustrato.md` §3 y «Definición de terminado».
 */
import { LARGO_MAXIMO_DESCRIPCION } from '../../apps/web/src/lib/rutas/descripcion-de';
import { TARJETA_TWITTER } from '../../apps/web/src/lib/rutas/registro';

const ETIQUETA_META = /<meta\b([^>]*)>/giu;
const ATRIBUTO = /([a-zA-Z:_-]+)\s*=\s*"([^"]*)"/gu;

/** Inverso exacto de `escaparHtml` de `sellado.ts`. `&amp;` último, o se comería los otros. */
export function desescaparHtml(texto: string): string {
  return texto
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
    .replace(/&amp;/gu, '&');
}

export interface CabezaServida {
  readonly titulo: string;
  readonly descripcion: string;
  readonly canonica: string;
  /** `''` cuando la página no declara `<meta name="robots">`, que es lo correcto en las públicas. */
  readonly robots: string;
  /** Sin el prefijo `og:`: `og.title`, `og.image`, `og.url`… */
  readonly og: Readonly<Record<string, string>>;
  /** Sin el prefijo `twitter:`. */
  readonly twitter: Readonly<Record<string, string>>;
}

function atributosDe(crudo: string): Readonly<Record<string, string>> {
  const salida: Record<string, string> = {};
  for (const coincidencia of crudo.matchAll(ATRIBUTO)) {
    salida[(coincidencia[1] ?? '').toLowerCase()] = coincidencia[2] ?? '';
  }
  return salida;
}

/**
 * No valida HTML: extrae. Le alcanza con que las etiquetas tengan sus valores
 * entre comillas dobles, que es lo único que emite `sellarShell`.
 */
export function leerCabeza(html: string): CabezaServida {
  const og: Record<string, string> = {};
  const twitter: Record<string, string> = {};
  let descripcion = '';
  let robots = '';

  for (const etiqueta of html.matchAll(ETIQUETA_META)) {
    const atributos = atributosDe(etiqueta[1] ?? '');
    const contenido = desescaparHtml(atributos['content'] ?? '');
    const propiedad = atributos['property'] ?? '';
    const nombre = atributos['name'] ?? '';

    if (propiedad.startsWith('og:')) og[propiedad.slice(3)] = contenido;
    else if (nombre.startsWith('twitter:')) twitter[nombre.slice(8)] = contenido;
    else if (nombre === 'description') descripcion = contenido;
    else if (nombre === 'robots') robots = contenido;
  }

  return {
    titulo: desescaparHtml(/<title>([\s\S]*?)<\/title>/iu.exec(html)?.[1] ?? ''),
    descripcion,
    canonica: desescaparHtml(
      /<link\b[^>]*\brel="canonical"[^>]*\bhref="([^"]*)"/iu.exec(html)?.[1] ?? '',
    ),
    robots,
    og,
    twitter,
  };
}

export interface ReparoDePublicacion {
  readonly url: string;
  readonly detalle: string;
}

export interface EsperadoDeCabeza {
  readonly origen: string;
  readonly ruta: string;
  /** `true` para las `publica`; `false` para las `privada` y los shells `dinamica`. */
  readonly indexable: boolean;
}

/**
 * Todo lo que un scraper tiene que encontrar. Junta todos los reparos: cortar en
 * el primero obligaría a correr el preview cinco veces para ver cinco problemas.
 */
export function auditarCabeza(
  cabeza: CabezaServida,
  esperado: EsperadoDeCabeza,
): readonly ReparoDePublicacion[] {
  const url = `${esperado.origen}${esperado.ruta}`;
  const reparos: ReparoDePublicacion[] = [];
  const reparo = (detalle: string): void => {
    reparos.push({ url, detalle });
  };

  if (cabeza.titulo.trim() === '') reparo('llegó sin <title>.');
  if (cabeza.descripcion.trim() === '') reparo('llegó sin <meta name="description">.');
  if (cabeza.descripcion.length > LARGO_MAXIMO_DESCRIPCION) {
    reparo(
      `la descripción mide ${String(cabeza.descripcion.length)} y el máximo es ${String(LARGO_MAXIMO_DESCRIPCION)}.`,
    );
  }

  if (cabeza.canonica !== url) {
    reparo(`la canónica dice «${cabeza.canonica}» y tendría que decir «${url}».`);
  }

  const imagen = cabeza.og['image'] ?? '';
  if (imagen === '') reparo('llegó sin og:image.');
  else if (!imagen.startsWith(`${esperado.origen}/`)) {
    reparo(`og:image tiene que ser una URL absoluta del mismo origen, y dice «${imagen}».`);
  }

  if ((cabeza.og['title'] ?? '') !== cabeza.titulo) reparo('og:title no coincide con el <title>.');
  if ((cabeza.og['url'] ?? '') !== cabeza.canonica) reparo('og:url no coincide con la canónica.');
  if ((cabeza.og['type'] ?? '') === '') reparo('llegó sin og:type.');
  if ((cabeza.og['site_name'] ?? '') === '') reparo('llegó sin og:site_name.');
  if ((cabeza.og['locale'] ?? '') === '') reparo('llegó sin og:locale.');

  if ((cabeza.twitter['card'] ?? '') !== TARJETA_TWITTER) {
    reparo(`twitter:card tiene que ser «${TARJETA_TWITTER}».`);
  }
  if ((cabeza.twitter['image'] ?? '') !== imagen) reparo('twitter:image no coincide con og:image.');

  if (esperado.indexable && cabeza.robots !== '') {
    reparo(`una URL pública llegó con robots «${cabeza.robots}».`);
  }
  if (!esperado.indexable && !cabeza.robots.includes('noindex')) {
    reparo('una URL que no se indexa llegó sin noindex.');
  }

  return reparos;
}

/**
 * El ítem #1 pide tarjetas **propias**, no doce copias de la misma. Dos URLs con
 * el mismo título o la misma imagen son la firma del fallback SPA: el host sirvió
 * el `index.html` de la portada para todo.
 */
export function auditarDistincion(
  cabezas: ReadonlyMap<string, CabezaServida>,
): readonly ReparoDePublicacion[] {
  const reparos: ReparoDePublicacion[] = [];
  const porTitulo = new Map<string, string>();
  const porImagen = new Map<string, string>();

  for (const [url, cabeza] of cabezas) {
    const dueñoDelTitulo = porTitulo.get(cabeza.titulo);
    if (dueñoDelTitulo !== undefined) {
      reparos.push({ url, detalle: `comparte el <title> con ${dueñoDelTitulo}.` });
    } else {
      porTitulo.set(cabeza.titulo, url);
    }

    const imagen = cabeza.og['image'] ?? '';
    const dueñoDeLaImagen = porImagen.get(imagen);
    if (dueñoDeLaImagen !== undefined) {
      reparos.push({ url, detalle: `comparte la tarjeta OG con ${dueñoDeLaImagen}.` });
    } else {
      porImagen.set(imagen, url);
    }
  }

  return reparos;
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm lint:scripts && pnpm type-check:scripts`
Esperado: PASA — los trece `it` de `publicacion.test.ts` en verde y las dos guardias sin
salida.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/scripts/build/publicacion.ts v2/scripts/build/__tests__/publicacion.test.ts
git commit -m "feat(scripts): publicacion.ts lee el head que sirvió el host y lo juzga contra el registro"
```

---

### Tarea 16: `verificar-publicacion.ts` — el CLI que golpea un origen servido

**Files:**
- Create: `v2/scripts/build/verificar-publicacion.ts`
- Modify: `v2/package.json` (anclado en la línea literal `    "prerender": "tsx scripts/build/prerender.ts",`, que dejó la Tarea 13)

**Interfaces:**
- Consumes: `enumerarUrls` de `../../apps/web/src/lib/rutas/registro` (B7) · `leerFuenteDeDisco`
  de `./fuente-disco` (Tarea 1 del plan) · `auditarCabeza`, `auditarDistincion`, `leerCabeza`,
  `ReparoDePublicacion` de `./publicacion`.
- Produces: el script `pnpm publicacion:check`. **SIN exports** — `main()` en el top level,
  igual que `sellar-head.ts` y `prerender.ts`. Sale con 1 y la lista de reparos, o con 0 y
  una línea de resumen.

> **No entra a `pnpm verify` ni al CI.** Necesita un origen servido por un host: `verify`
> corre en una máquina sin deploy y el job `build-and-test` tampoco tiene uno. Es una
> herramienta de corrida manual contra el preview, igual que `pnpm og:build`. Lo que sí
> corre siempre es su lógica, cubierta por `publicacion.test.ts`.

> **El User-Agent es el de Facebook a propósito.** Es el scraper que la Definición de
> terminado nombra, y es el que más rápido delata un host que sirve el fallback SPA: no
> ejecuta JavaScript, así que sólo ve lo que vino en el HTML.

- [ ] **Paso 1: Correr la verificación que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm publicacion:check --origen https://ejemplo.test`
Esperado: FALLA con `Command "publicacion:check" not found` — el script todavía no existe.

- [ ] **Paso 2: Escribir el CLI**

Crear `v2/scripts/build/verificar-publicacion.ts`:

```ts
/**
 * Golpea un origen SERVIDO y verifica los ítems #1, #2 y #3 de la Definición de
 * terminado del sustrato:
 *
 *   #1 · `facebookexternalhit` recibe título, descripción e imagen PROPIOS para la
 *        portada, un plan, un ensayo, una crónica de bitácora y un entrenamiento.
 *   #2 · `/no-existe` devuelve 404 real; `/ingresar` devuelve 200 con noindex.
 *   #3 · una ruta papel devuelve CSP, nosniff, Referrer-Policy y Permissions-Policy;
 *        un asset con hash devuelve una caché distinta a la del HTML.
 *
 * NO sirve `vite preview`: hace fallback SPA por su cuenta y devuelve 200 con el
 * index de la portada para cualquier ruta, que es justo lo que hay que detectar.
 * Se corre contra el preview deploy de Vercel.
 *
 * Las cinco URLs del ítem #1 se DERIVAN del contenido en disco, nunca se escriben.
 *
 * Run: pnpm publicacion:check --origen https://<preview>.vercel.app
 */
import { enumerarUrls } from '../../apps/web/src/lib/rutas/registro';

import { leerFuenteDeDisco } from './fuente-disco';
import {
  auditarCabeza,
  auditarDistincion,
  leerCabeza,
  type CabezaServida,
  type ReparoDePublicacion,
} from './publicacion';

/** El scraper que nombra la Definición de terminado. No ejecuta JavaScript. */
const SCRAPER = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';

/** Los cuatro patrones con tarjeta propia, más la portada. */
const PATRONES_CON_TARJETA_PROPIA: readonly string[] = [
  '/planes/:slug',
  '/ensayos/:slug',
  '/bitacora/:slug',
  '/entrenamientos/:slug',
];

const CABECERAS_DE_SEGURIDAD: readonly string[] = [
  'content-security-policy',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
];

function origenDeLaBandera(): string {
  const bandera = process.argv.indexOf('--origen');
  const valor = bandera === -1 ? undefined : process.argv[bandera + 1];
  if (valor === undefined || valor === '') {
    process.stderr.write(
      'Falta --origen. Ejemplo: pnpm publicacion:check --origen https://mi-preview.vercel.app\n',
    );
    process.exit(1);
  }
  return valor.replace(/\/+$/u, '');
}

async function pedir(url: string): Promise<Response> {
  return fetch(url, { headers: { 'User-Agent': SCRAPER }, redirect: 'manual' });
}

/** La portada más el PRIMER documento de cada sección con tarjeta propia. */
async function rutasAVerificar(origen: string): Promise<readonly string[]> {
  const urls = enumerarUrls({ origen, fuente: await leerFuenteDeDisco() });
  const rutas = ['/'];

  for (const patron of PATRONES_CON_TARJETA_PROPIA) {
    const primera = urls.find((url) => url.entrada.patron === patron);
    if (primera === undefined) {
      throw new Error(`El registro no enumeró ninguna URL para ${patron}: no hay qué verificar.`);
    }
    rutas.push(primera.ruta);
  }

  return rutas;
}

async function verificarTarjetas(origen: string): Promise<readonly ReparoDePublicacion[]> {
  const reparos: ReparoDePublicacion[] = [];
  const cabezas = new Map<string, CabezaServida>();

  for (const ruta of await rutasAVerificar(origen)) {
    const url = `${origen}${ruta}`;
    const respuesta = await pedir(url);

    if (respuesta.status !== 200) {
      reparos.push({ url, detalle: `devolvió ${String(respuesta.status)} y tenía que dar 200.` });
      continue;
    }

    const cabeza = leerCabeza(await respuesta.text());
    cabezas.set(url, cabeza);
    reparos.push(...auditarCabeza(cabeza, { origen, ruta, indexable: true }));

    // La tarjeta tiene que existir de verdad: un `og:image` que da 404 es peor que
    // no declarar ninguno, porque el scraper cachea el fallo.
    const imagen = cabeza.og['image'] ?? '';
    if (imagen.startsWith(origen)) {
      const tarjeta = await pedir(imagen);
      const tipo = tarjeta.headers.get('content-type') ?? '';
      if (tarjeta.status !== 200) {
        reparos.push({ url, detalle: `su og:image devolvió ${String(tarjeta.status)}.` });
      } else if (!tipo.startsWith('image/png')) {
        reparos.push({ url, detalle: `su og:image no es un PNG: content-type «${tipo}».` });
      }
    }
  }

  reparos.push(...auditarDistincion(cabezas));
  return reparos;
}

async function verificarCodigos(origen: string): Promise<readonly ReparoDePublicacion[]> {
  const reparos: ReparoDePublicacion[] = [];

  const inexistente = `${origen}/no-existe`;
  const respuesta = await pedir(inexistente);
  if (respuesta.status !== 404) {
    reparos.push({
      url: inexistente,
      detalle: `devolvió ${String(respuesta.status)}: hay un catch-all sirviendo el index de la portada.`,
    });
  }

  const login = `${origen}/ingresar`;
  const privada = await pedir(login);
  if (privada.status !== 200) {
    reparos.push({
      url: login,
      detalle: `devolvió ${String(privada.status)}: sin archivo sellado, el login rompe en producción.`,
    });
  } else if (!leerCabeza(await privada.text()).robots.includes('noindex')) {
    reparos.push({ url: login, detalle: 'llegó sin noindex.' });
  }

  return reparos;
}

async function verificarCabeceras(origen: string): Promise<readonly ReparoDePublicacion[]> {
  const reparos: ReparoDePublicacion[] = [];
  const documento = `${origen}/planes`;
  const respuesta = await pedir(documento);
  const html = await respuesta.text();

  for (const cabecera of CABECERAS_DE_SEGURIDAD) {
    if (respuesta.headers.get(cabecera) === null) {
      reparos.push({ url: documento, detalle: `llegó sin la cabecera ${cabecera}.` });
    }
  }

  const cacheDelHtml = respuesta.headers.get('cache-control') ?? '';
  if (!cacheDelHtml.includes('must-revalidate')) {
    reparos.push({
      url: documento,
      detalle: `el HTML tiene que revalidar en cada visita y su Cache-Control dice «${cacheDelHtml}».`,
    });
  }

  const conHash = /\/assets\/[^"']+\.js/u.exec(html)?.[0];
  if (conHash === undefined) {
    reparos.push({ url: documento, detalle: 'no referencia ningún asset con hash: ¿se sirvió el dist?' });
    return reparos;
  }

  const asset = `${origen}${conHash}`;
  const cacheDelAsset = (await pedir(asset)).headers.get('cache-control') ?? '';
  if (!cacheDelAsset.includes('immutable')) {
    reparos.push({
      url: asset,
      detalle: `un asset con hash tiene que ser inmutable y su Cache-Control dice «${cacheDelAsset}».`,
    });
  }
  if (cacheDelAsset === cacheDelHtml) {
    reparos.push({ url: asset, detalle: 'el asset y el HTML comparten Cache-Control.' });
  }

  return reparos;
}

async function main(): Promise<void> {
  const origen = origenDeLaBandera();
  process.stdout.write(`publicacion:check — golpeando ${origen} como «facebookexternalhit».\n`);

  const reparos = [
    ...(await verificarTarjetas(origen)),
    ...(await verificarCodigos(origen)),
    ...(await verificarCabeceras(origen)),
  ];

  if (reparos.length > 0) {
    process.stderr.write(`publicacion:check — ${String(reparos.length)} problema(s):\n`);
    for (const reparo of reparos) {
      process.stderr.write(`  ${reparo.url}: ${reparo.detalle}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(
    'publicacion:check — 5 tarjetas propias, /no-existe en 404, /ingresar con noindex, ' +
      'las cuatro cabeceras y dos regímenes de caché distintos.\n',
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `publicacion:check falló: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
```

- [ ] **Paso 3: Agregar el script**

En `v2/package.json`, insertar inmediatamente **después** de la línea literal que dejó la
Tarea 13:

```json
    "prerender": "tsx scripts/build/prerender.ts",
```

esta línea:

```json
    "publicacion:check": "tsx scripts/build/verificar-publicacion.ts",
```

> Queda `"planes:check"` → `"deps:check"` → `"meta:check"` → `"prerender"` →
> `"publicacion:check"` → `"size"` → `"verify"`. **No entra a `verify`**: necesita un host
> servido, y `verify` corre sin deploy.

- [ ] **Paso 4: Correr la verificación**

Primero, que las guardias de siempre estén verdes:

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm lint:scripts && pnpm type-check:scripts && pnpm test:scripts`
Esperado: PASA — `eslint` y `tsc` sin salida, y los tests de `scripts/` en verde.

Y que el CLI muerda contra un servidor que **sí** hace fallback SPA, que es exactamente el
error que existe para detectar:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
pnpm --filter @v2/web build
pnpm --dir apps/web exec vite preview --port 4173 --strictPort &
sleep 3
pnpm publicacion:check --origen http://127.0.0.1:4173
kill %1
```

Esperado: **FALLA** con exit 1 y una lista que incluye
`http://127.0.0.1:4173/no-existe: devolvió 200: hay un catch-all sirviendo el index de la portada.`
y los reparos de cabeceras (`vite preview` no lee `v2/vercel.json`). **Ésta es la prueba de
que la herramienta funciona**: `vite preview` es el falso positivo que la spec advierte, y
el CLI lo delata. Las cinco tarjetas propias sí pasan, porque el `dist` local tiene los
`index.html` sellados y `vite preview` los sirve por filesystem antes de caer al fallback.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/scripts/build/verificar-publicacion.ts v2/package.json
git commit -m "feat(scripts): publicacion:check golpea un host servido y verifica las DoD #1, #2 y #3"
```

---

### Tarea 17: `tests/e2e/sustrato.spec.ts` — sin JS, sin chunk, con teclado y sin terceros

**Files:**
- Create: `v2/tests/e2e/sustrato.spec.ts`

**Interfaces:**
- Consumes: `@playwright/test` y la config que ya existe en `v2/playwright.config.ts`
  (`baseURL` = `http://localhost:5173`, `webServer` = `pnpm --filter @v2/web dev`, o el
  `PLAYWRIGHT_BASE_URL` que se le pase). El skip link «SALTAR AL CONTENIDO» y el ancla
  `#contenido` los entrega B4; el `<noscript>` con «Esto se lee igual.», B2; el expediente
  «Salió una versión nueva mientras leías», B5.
- Produces: los ítems #4, #7 y #9 de la Definición de terminado, automatizados. Corre en el
  job `e2e-tests` que ya existe (`pnpm test:e2e`): **no hace falta tocar el workflow**.

> **Por qué el chunk se corta en la red y no se borra del `dist`.** El ítem #7 dice «borrar
> un chunk del `dist` servido». Abortar la request del chunk reproduce exactamente eso —el
> `import()` rechaza y el `ErrorBoundary` pinta el expediente— sin mutar un artefacto que
> después hay que restaurar a mano, y funciona igual contra el dev server (donde el módulo
> es `/src/pages/PlanDetail.tsx`) que contra un `dist` servido (donde es
> `/assets/PlanDetail-<hash>.js`): los dos contienen `PlanDetail`.

> **La ruta legado del recorrido de teclado es `/ingresar`.** `esRutaPapel()` no la incluye,
> así que recibe el chrome v1, y es pública sin sesión — `/tablero` redirige al login y el
> recorrido terminaría midiendo la misma página dos veces.

- [ ] **Paso 1: Escribir el test que falla**

Crear `v2/tests/e2e/sustrato.spec.ts`:

```ts
import { expect, test, type Page } from '@playwright/test';

/** Una ruta papel y una legado: las dos ramas del `RootLayout`. */
const RUTA_PAPEL = '/planes';
const RUTA_LEGADO = '/ingresar';

/** El nombre accesible del skip link de B4. */
const SALTAR = /SALTAR AL CONTENIDO/i;

/** Qué elemento tiene el foco, descrito como lo describiría una persona. */
async function focoActual(pagina: Page): Promise<{ etiqueta: string; texto: string; id: string }> {
  return pagina.evaluate(() => {
    const activo = document.activeElement;
    return {
      etiqueta: activo?.tagName.toLowerCase() ?? '(ninguno)',
      texto: (activo?.textContent ?? '').trim(),
      id: activo?.id ?? '',
    };
  });
}

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('la portada se lee igual y ofrece salida a lo que sí se lee sin JS', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Esto se lee igual.')).toBeVisible();
    await expect(page.getByRole('link', { name: /planes/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /biblioteca/i }).first()).toBeVisible();
  });
});

test.describe('el chunk que no baja', () => {
  test('muestra el expediente de versión nueva, no una pantalla en blanco', async ({ page }) => {
    // Igual que borrar el chunk del `dist` servido: el `import()` rechaza.
    await page.route('**/*PlanDetail*', (ruta) => ruta.abort('failed'));

    await page.goto('/planes/planeb');

    await expect(page.getByText(/Salió una versión nueva mientras leías/i)).toBeVisible();
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('recorrido de teclado', () => {
  for (const [superficie, ruta] of [
    ['papel', RUTA_PAPEL],
    ['legado', RUTA_LEGADO],
  ] as const) {
    test(`en ${superficie} el skip link es la primera parada y lleva al contenido`, async ({
      page,
    }) => {
      await page.goto(ruta);
      await page.locator('body').click({ position: { x: 1, y: 1 } });
      await page.keyboard.press('Tab');

      const primera = await focoActual(page);
      expect(primera.texto, `primera parada en ${ruta}`).toMatch(SALTAR);
      await expect(page.getByRole('link', { name: SALTAR })).toBeVisible();

      await page.keyboard.press('Enter');

      expect((await focoActual(page)).id, `destino del skip link en ${ruta}`).toBe('contenido');
    });
  }

  test('al navegar, el foco se mueve al contenido y no se queda en el link', async ({ page }) => {
    await page.goto(RUTA_PAPEL);
    await page.getByRole('main').getByRole('link').first().click();

    await expect(page).not.toHaveURL(new RegExp(`${RUTA_PAPEL}$`, 'u'));
    expect((await focoActual(page)).id).toBe('contenido');
  });
});

test.describe('el waterfall de una ruta papel', () => {
  test('no pide un solo byte a un tercero', async ({ page, baseURL }) => {
    const ajenos: string[] = [];
    const propio = new URL(baseURL ?? 'http://localhost:5173').origin;

    page.on('request', (peticion) => {
      const url = peticion.url();
      if (!/^https?:/u.test(url)) return; // data:, blob: y about: no salen a la red
      if (!url.startsWith(propio)) ajenos.push(url);
    });

    await page.goto(RUTA_PAPEL, { waitUntil: 'networkidle' });

    expect(ajenos).toEqual([]);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:e2e tests/e2e/sustrato.spec.ts`
Esperado: **FALLA** si alguno de los bloques anteriores no corrió: sin el skip link de B4 la
primera parada es otra cosa, sin el `<noscript>` de B2 no aparece «Esto se lee igual.», sin
el `ErrorBoundary` de B5 el chunk abortado deja la pantalla en blanco. Si los planes A, B y C
están ejecutados, este paso puede pasar de una: es un test de regresión sobre trabajo ya
hecho, y su valor es que **queda corriendo en CI**.

- [ ] **Paso 3: Correr la suite entera**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm exec playwright install chromium && pnpm test:e2e`
Esperado: PASA — los dos tests de `home.spec.ts` y los seis de `sustrato.spec.ts` en verde.
La suite e2e pasa de 2 tests en 1 archivo a 8 en 2.

- [ ] **Paso 4: Verificar a ojo lo que el test no puede ver**

El ítem #4 pide además «foco visible en **todo** control», y eso no se afirma con una
aserción: un `outline` puede existir y ser invisible contra el fondo.

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web dev
```

En `http://localhost:5173/planes`, con el mouse quieto, recorrer la página entera con **Tab**
hasta volver a la barra del navegador. Esperado: **ninguna parada muda** — en cada una se ve
el anillo de foco, con contraste suficiente contra el papel. Repetir en
`http://localhost:5173/ingresar`, donde el anillo va en la paleta del chrome v1. Si alguna
parada no se ve, el reparo es de B4 (anillo por superficie) y se arregla ahí, no acá.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/tests/e2e/sustrato.spec.ts
git commit -m "test(e2e): el sustrato se prueba sin JS, sin chunk, con teclado y sin terceros"
```

---

### Tarea 18: El preview deploy y la corrida real contra un host

**Files:**
- Modify: ninguno del repo. Es la puesta en marcha del proyecto de preview y la corrida de
  `pnpm publicacion:check` contra él.

**Interfaces:**
- Consumes: `v2/vercel.json` (Tarea 8) · el `dist` sellado y prerenderizado (Tareas 7 y 13) ·
  `pnpm publicacion:check` (Tarea 16).
- Produces: los ítems #1, #2 y #3 de la Definición de terminado, verificados contra un host
  de verdad. Sin esto, los tres quedan abiertos: `vite preview` los tapa.

> **Es una tarea del dueño del proyecto, no del repo.** Crear el proyecto en Vercel toca una
> cuenta, no un archivo. La decisión ya está tomada y escrita en la spec (D1): **proyecto de
> preview, sin dominio y sin promoción a producción**. El de la raíz —que publica v1 desde
> `SocialJusticeHub`— **no se toca**.

- [ ] **Paso 1: Crear el proyecto de preview**

En Vercel, un proyecto nuevo sobre este mismo repositorio, con:

- **Root Directory:** `v2`
- **Framework Preset:** «Other» — `v2/vercel.json` ya declara `installCommand`,
  `buildCommand` y `outputDirectory`, y `"framework": null` le dice a Vercel que no adivine.
- **Production Branch:** una rama que no existe (por ejemplo `preview-sustrato`), o el
  proyecto con las promociones a producción deshabilitadas. Ningún deploy de este proyecto
  puede quedar promovido.
- **Sin dominio propio.** Se usa la URL `*.vercel.app` que asigna el deploy.
- **Variable de entorno `VITE_SITE_ORIGIN`** = el origen del preview, sin barra final. Sin
  ella el build sella canónicas y `og:image` apuntando a `https://elinstantedelhombregris.com`
  y el ítem #1 no prueba nada: el scraper resolvería las tarjetas contra v1.

Esperado: el deploy termina en verde. En el log de build tiene que aparecer la línea de
`sellar-head.ts` (`Head sellado: … URLs · … en el sitemap · origen https://…vercel.app`).
Si dice el dominio canónico, falta la variable de entorno.

> **El prerender no corre en Vercel**, y está bien: `buildCommand` es
> `pnpm --filter @v2/web build`, que no incluye `pnpm prerender` (necesita Chromium). El
> preview verifica el **sellado**, que es lo que los ítems #1, #2 y #3 miden. El congelado lo
> verifica el CI, en `build-and-test`, y a mano con los `grep` de la Tarea 13.

- [ ] **Paso 2: Golpear el preview**

Comando (reemplazando la URL por la del deploy):

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && \
  pnpm publicacion:check --origen https://<el-preview>.vercel.app
```

Esperado: PASA con
`publicacion:check — 5 tarjetas propias, /no-existe en 404, /ingresar con noindex, las cuatro cabeceras y dos regímenes de caché distintos.`

Si sale con reparos, cada línea dice la URL y qué falta. Los tres más probables y dónde se
arreglan:

- `devolvió 200: hay un catch-all sirviendo el index de la portada` → sobra un `rewrite` en
  `v2/vercel.json` (Tarea 8).
- `llegó sin la cabecera content-security-policy` → el proyecto tiene Root Directory mal
  puesto y Vercel no está leyendo `v2/vercel.json`.
- `la canónica dice «https://elinstantedelhombregris.com/…»` → falta `VITE_SITE_ORIGIN` en
  el proyecto de preview.

- [ ] **Paso 3: Mirar una tarjeta con los ojos de un scraper**

Comando:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && \
  curl -sA 'facebookexternalhit/1.1' https://<el-preview>.vercel.app/planes/planeb \
  | grep -Eo '<(title>[^<]*|meta (property|name)="(og|twitter):[^"]*" content="[^"]*")' | head -14
```

Esperado: el `<title>` del PLANEB —no el de la portada— y las doce etiquetas sociales, con
`og:image` apuntando a `https://<el-preview>.vercel.app/og/planes/planeb.png`.

Y los dos códigos de estado del ítem #2, en crudo:

```bash
curl -so /dev/null -w '%{http_code} /no-existe\n' https://<el-preview>.vercel.app/no-existe && \
curl -so /dev/null -w '%{http_code} /ingresar\n' https://<el-preview>.vercel.app/ingresar
```

Esperado: `404 /no-existe` y `200 /ingresar`.

- [ ] **Paso 4: Las cabeceras y la caché, en crudo**

Comando:

```bash
curl -sI https://<el-preview>.vercel.app/planes | \
  grep -Ei '^(content-security-policy|x-content-type-options|referrer-policy|permissions-policy|cache-control):'
```

Esperado: las cuatro cabeceras de §3b y `cache-control: public, max-age=0, must-revalidate`.
Sobre un asset con hash, el mismo `curl -I` tiene que decir
`cache-control: public, max-age=31536000, immutable`.

- [ ] **Paso 5: Cierre sin commit**

Esta tarea no modifica archivos del repo. Lo único que deja escrito es la URL del preview,
que se anota en el acta de la Tarea 19.

Comando de control: `cd /Users/juanb/Desktop/ElInstantedelHombreGris && git status --short v2`
Esperado: sin salida.

---

### Tarea 19: El acta de los 10 ítems de la Definición de terminado

**Files:**
- Modify: ninguno. Es la verificación cruzada del bloque y el registro de con qué se cerró
  cada ítem.

**Interfaces:**
- Consumes: todo lo de las tareas anteriores, y las guardias que entregan los planes A, B y C.
- Produces: el acta. Un ítem sólo se marca con el comando corrido y su salida vista.

- [ ] **Paso 1: Correr las guardias que cierran los ítems #5, #6 y #8**

Comando:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && \
  pnpm verify && pnpm planes:check && pnpm deps:check && pnpm meta:check
```

Esperado: PASA — `verify` alcanza a `scripts/` (`lint` y `type-check` corren sobre el
workspace entero desde el plan A) y las tres guardias nuevas responden sin reparos. El test
de contraste que entrega B6 corre dentro de `pnpm test:unit`, o sea dentro de `verify`: el
ítem #5 se cierra ahí, no a ojo. El ítem #6 lo cierran los tests de B10 más la regla 4b de
`meta:check`, que resuelve cada descripción desde el disco.

- [ ] **Paso 2: Correr el presupuesto de bundle, que cierra el ítem #10**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm build && pnpm size`
Esperado: PASA — `size-limit` mide el payload inicial completo (el `.size-limit.json` que
arregló el plan A) y queda por debajo del presupuesto.

- [ ] **Paso 3: Verificar que las tres guardias corren en CI, no sólo en la máquina**

Comando:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris && \
  grep -n 'pnpm meta:check\|pnpm deps:check\|pnpm prerender\|pnpm size\|pnpm test:e2e' \
  .github/workflows/v2-ci.yml
```

Esperado: las cinco líneas presentes — `deps:check` y `meta:check` en `build-and-test`
(plan A y plan C), `pnpm size` y `pnpm prerender` también en `build-and-test` (Tarea 14), y
`pnpm test:e2e` en `e2e-tests`, que ahora incluye `sustrato.spec.ts`.

- [ ] **Paso 4: Levantar el acta**

No hay comando: es la tabla de cierre del bloque B13. Cada fila se marca sólo si el paso que
la cierra quedó verde, y la última columna dice contra qué se verificó.

| # | Ítem de la Definición de terminado | Se cierra con | Dónde |
|---|---|---|---|
| 1 | `curl -A facebookexternalhit` devuelve título, descripción e imagen **propios** para portada, plan, ensayo, crónica y entrenamiento | `pnpm publicacion:check --origen <preview>` + el `curl` del Paso 3 de la Tarea 18 | preview deploy real |
| 2 | `/no-existe` da 404 real; `/ingresar` da 200 con `noindex` | `pnpm publicacion:check` + los dos `curl -w '%{http_code}'` | preview deploy real |
| 3 | `curl -I` sobre una ruta papel devuelve CSP, `nosniff`, `Referrer-Policy` y `Permissions-Policy`; un asset con hash trae otra caché | `pnpm publicacion:check` + el `curl -sI` del Paso 4 de la Tarea 18 | preview deploy real |
| 4 | Recorrido de teclado en una ruta papel y una legado: skip link primero, foco visible, foco al contenido al navegar | `sustrato.spec.ts` (tres tests) + el recorrido a ojo del Paso 4 de la Tarea 17 | CI (`e2e-tests`) + a ojo |
| 5 | Ningún par texto/fondo declarado baja de 4,5:1 | el test de contraste de B6, dentro de `pnpm test:unit` | CI (`build-and-test`) |
| 6 | Ningún número visible sale de una constante escrita a mano | los tests de B10 + la regla 4b de `meta:check` + la regla 2 de la auditoría del prerender | CI (`build-and-test`) |
| 7 | Chunk borrado → «Salió una versión nueva»; Chromium sin JS → `<noscript>` | `sustrato.spec.ts` (dos tests) | CI (`e2e-tests`) |
| 8 | `pnpm verify` verde alcanzando a `scripts/`, y las tres guardias nuevas en CI | Pasos 1 y 3 de esta tarea | local + CI |
| 9 | Cero requests a terceros en el waterfall de una ruta papel | `sustrato.spec.ts` (un test) | CI (`e2e-tests`) |
| 10 | `pnpm size` mide el payload inicial completo y está bajo presupuesto | Paso 2 de esta tarea | local + CI |

Los ítems 1, 2 y 3 son los únicos que **no** puede cerrar el CI: necesitan un host que
aplique `v2/vercel.json`. Se vuelven a correr con `pnpm publicacion:check` cada vez que
cambie el registro de rutas, el sellado o el archivo del host.

- [ ] **Paso 5: Cierre sin commit**

Esta tarea no modifica archivos: el bloque B13 cierra con los tres commits de las tareas
anteriores que sí tocan el repo.

Comando de control: `cd /Users/juanb/Desktop/ElInstantedelHombreGris && git status --short v2`
Esperado: sin salida.

---

### Tarea 20: Cierre del plan D — `pnpm verify`, las guardias y el inventario de lo entregado

**Files:**
- Modify: ninguno. Es la verificación de cierre del plan entero y el registro escrito de lo
  que quedó entregado.

**Interfaces:**
- Consumes: todo lo de las tareas anteriores de este plan.
- Produces: la evidencia de que el árbol quedó verde y de que las cuatro salidas del plan D
  (tarjetas, sellado, host, prerender) están en su lugar.

- [ ] **Paso 1: `pnpm verify` entero**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm verify`
Esperado: PASA — `lint` (incluido `scripts/`), `type-check` (incluido `scripts/`),
`test:unit`, `test:scripts`, `test:integration` y `build` en verde. El `build` de `apps/web`
termina imprimiendo la línea de `sellar-head.ts`
(`Head sellado: … URLs · … en el sitemap · origen …`).

- [ ] **Paso 2: las tres guardias, en el orden acordado**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && \
  pnpm planes:check && pnpm deps:check && pnpm meta:check
```
Esperado: PASA — `planes:check` sin reparos; `deps:check` con la **misma** cuenta de
dependencias de producción que antes de este plan (`satori` y `@resvg/resvg-js` son
devDependencies); `meta:check` con `meta:check — 54 rutas con metadata, en el mismo orden
que el <Switch>.` y sin diferencias entre los 301 de `v2/vercel.json` y los que deriva el
registro.

- [ ] **Paso 3: el artefacto completo, con el prerender**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && \
  pnpm build && pnpm exec playwright install chromium && pnpm prerender
```
Esperado: PASA — el prerender imprime `prerender — 44 URLs derivadas del contenido en
disco.`, una línea `congelado …` por URL, y cierra con
`prerender — 44 URLs congeladas y auditadas contra las tres reglas.`

- [ ] **Paso 4: el árbol limpio**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris && git status --short v2`
Esperado: sin salida. Todo lo que este plan genera está commiteado (las 128 tarjetas OG,
`v2/vercel.json`, los scripts de build y sus tests) o vive en `dist/`, que está ignorado.

- [ ] **Paso 5: el inventario de lo entregado**

No hay comando: es la lista de control del plan D. Cada línea se marca sólo si el paso que
la produce quedó verde.

- `scripts/build/fuente-disco.ts` — el catálogo en disco, sin Vite, con su test. Es la
  única fuente de contenido de los cuatro CLI de build.
- `scripts/build/og-plantilla.ts` + `scripts/build/build-og-cards.ts` + `pnpm og:build` —
  **128 tarjetas OG** commiteadas en `apps/web/public/og/`: 30 secciones, 97 documentos y
  `default.png`, todas 1200×630, sin grano y por debajo de 80 KB.
- `scripts/build/sellado.ts` + `scripts/build/sellar-head.ts` — un `index.html` sellado por
  URL (título, descripción, canónica, las ocho `og:`/`twitter:` y el `robots` cuando
  corresponde), más `sitemap.xml` sólo con las públicas y `robots.txt` con los cuatro
  `Disallow` y el `Sitemap:` absoluto. Colgado al final de la cadena del `build` de
  `apps/web`.
- `v2/vercel.json` — `cleanUrls`, `trailingSlash: false`, **sin catch-all** (`/no-existe`
  da 404 real), los 301 derivados del registro, los cuatro headers de seguridad y las cinco
  filas de caché.
- `scripts/build/verify-registro-rutas.ts` — `meta:check` con las reglas 4b (largos de cada
  documento resuelto desde disco) y 6 (los 301 commiteados contra los derivados).
- `apps/web/src/components/papel/primitives/FolioDeLectura.tsx` — el folio de la edición
  impresa como primitiva, marcado `data-volatil`, y los dos lectores sin una sola llamada a
  `new Date()`.
- `scripts/build/congelado.ts` + `scripts/build/prerender.ts` + `pnpm prerender` — las 44
  URLs de planes y ensayos con el documento escrito en el HTML dentro de
  `<div data-prerender>`, auditadas contra las tres reglas de contención sobre el artefacto
  real.
- `.github/workflows/v2-ci.yml` — el prerender corre dentro de `build-and-test`, con su
  propio `playwright install --with-deps chromium`, después del build y de
  «Bundle size budgets».
- `scripts/build/publicacion.ts` + `scripts/build/verificar-publicacion.ts` +
  `pnpm publicacion:check` — los ítems #1, #2 y #3 de la Definición de terminado
  verificados contra un host servido, con la lógica cubierta por su propio test.
- `tests/e2e/sustrato.spec.ts` — los ítems #4, #7 y #9 automatizados en el job `e2e-tests`.
  La suite e2e pasa de 2 tests en 1 archivo a 8 en 2.
- El acta de los 10 ítems de la Definición de terminado, con el comando que cerró cada uno.

- [ ] **Paso 6: cierre sin commit**

Esta tarea no modifica archivos. El plan D cierra con los commits de las tareas anteriores.

Comando de control: `cd /Users/juanb/Desktop/ElInstantedelHombreGris && git status --short v2 ../.github`
Esperado: sin salida.

---

## Notas de ensamblaje

Tres contradicciones reales entre los fragmentos de bloque —resueltas acá y no en las
tareas, para que quien ejecute no tenga que elegir—, más el hueco que dejó el fragmento que
nunca llegó y la regla con la que se renumeró todo.

**1 · `scripts/build/fuente-disco.ts` tenía dos dueños.** B9 y B11 traían cada uno una
tarea completa para crear el mismo archivo, con tests distintos y con dos implementaciones
que no coincidían. Se conserva la de **B9** —que es la Tarea 1 de este plan, y B9 va
primero en el orden B9 → B11 → B12 → B13— y se descarta entera la de B11, tal como la
propia nota de coordinación de B9 lo pide. Las tareas de B11, B12 y B13 importan
`leerFuenteDeDisco`, `origenDelBuild` y `RAIZ_V2` de ese archivo tal cual: sus firmas son
idénticas en los dos fragmentos, así que ninguna otra tarea cambia.

**2 · Dos diferencias de comportamiento se fueron con la copia descartada, y quedan
dichas.** (a) La versión de B11 hacía `.trim()` sobre `VITE_SITE_ORIGIN` y trataba una
variable en blanco como ausente; la de B9 usa `??`, así que una variable declarada vacía
gana sobre el origen canónico. Ninguna tarea de este plan depende de ese caso —los tests de
sellado usan un origen literal— y el comportamiento vigente es el de B9. (b) La versión de
B11 salteaba en silencio un `course.json` inválido; la de B9 **rompe** con el detalle del
error de Zod. Se queda la de B9: un curso inválido tiene que romper el build, no
desaparecer del sitemap sin avisar.

**3 · El preámbulo de B11 hablaba de un `git add` del workflow que su última tarea no
hace.** La Tarea 9 (`meta:check`) declara explícitamente que **no** toca
`.github/workflows/v2-ci.yml` —el paso de CI ya lo agregó B7, en el plan C—. El único
bloque de este plan que edita el workflow es B12, en la Tarea 14. La nota de directorio de
trabajo del preámbulo quedó reescrita para decir lo que efectivamente pasa, y la regla del
`../` vive ahora en «Global Constraints».

**4 · El bloque B13 lo escribió el ensamblador, no llegó como fragmento.** Los fragmentos de
B9, B11 y B12 estaban escritos; el de B13 nunca apareció. Como el plan no puede quedar con
un agujero —y el `Goal` promete los 10 ítems de la Definición de terminado verificados
contra un preview deploy—, las **Tareas 15 a 19** se derivaron de la fila **B13** de «Orden
de trabajo» de la spec, de la decisión **D1** (proyecto de preview sin dominio ni promoción
a producción) y de los 10 ítems de la Definición de terminado, y se ataron a lo que los
otros bloques entregan con anclas literales verificadas contra el árbol de trabajo: el skip
link «SALTAR AL CONTENIDO» y el ancla `#contenido` de B4, el `<noscript>` con «Esto se lee
igual.» de B2, el expediente «Salió una versión nueva mientras leías» de B5, el
`PLAYWRIGHT_BASE_URL` y el `webServer` de `v2/playwright.config.ts`, y el `include` de
`scripts/vitest.config.ts` (por eso su lógica pura vive en `scripts/build/`, que es lo único
que `pnpm test:scripts` levanta). **Si el fragmento original de B13 aparece después, se
compara contra estas cinco tareas antes de reemplazarlas**: lo que no puede perderse es la
corrida contra un host de verdad, porque `vite preview` hace fallback SPA y tapa
exactamente los ítems #1, #2 y #3.

**5 · La numeración y las referencias cruzadas.** Las tareas se renumeraron correlativas
desde 1 en el orden B9 → B11 → B12 → B13, y toda referencia interna se reescribió al número
nuevo. Los identificadores de bloque (**B1, B2, B3, B7, B9, B10, B11, B12, B13**) y las
referencias a tareas de **otros** planes (por ejemplo «B7, Tarea 9 del plan C») se dejaron
como estaban a propósito: nombran la spec y los otros planes, no las tareas de éste.
