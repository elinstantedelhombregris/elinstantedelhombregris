# A · Fundaciones — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar el sustrato del sitio listo para que los otros tres planes de ① puedan construir encima: el shell pinta papel en el primer frame, las seis familias tipográficas se sirven desde el propio origen con los glifos que faltaban arreglados, el repo deja de publicar sourcemaps y `.DS_Store`, `scripts/` entra a `pnpm verify`, y la pestaña del navegador muestra la marca de v2.

**Architecture:** Cuatro frentes sin backend y sin migraciones. (1) Documentación: la ley (`docs/design-system/README.md`), la arquitectura y el master plan dejan de mandar lo contrario de lo que ① implementa, con una guardia de vitest que lo verifica. (2) Build: `scripts/` gana `tsconfig.json` + config de ESLint propia y entra a `lint`/`type-check`; se purgan las deps muertas; el `dist` deja de llevar sourcemaps y basura de Finder; el presupuesto de bundle mide el payload inicial completo. (3) Shell: `index.html` pierde `class="dark"` y Google Fonts, gana `<style>` crítico, `<noscript>` y preload; `index.css` gana ocho `@font-face` derivados de un catálogo puro y testeado en `scripts/build/fuentes.ts`. (4) Marca: favicon «¡», `.ico`, apple-touch-icon y `site.webmanifest` rasterizados con el Chromium de Playwright que ya es devDependency (`og/default.png` **no**: su único dueño es B9, con satori).

**Tech Stack:** React 18 + Vite 5 + Tailwind 3 + wouter · Vitest (`apps/web` con happy-dom, `scripts/` con node) · Playwright (Chromium, sólo para medir y rasterizar) · `subset-font` como devDependency nueva · TypeScript strict + ESLint 9 flat config.

**Spec:** `docs/specs/2026-07-26-el-sustrato.md` — bloques B0 (decisiones y enmienda documental), B1 (higiene del build y del repo), B2 (shell HTML y fuentes), B3 (`public/` y marca)

## Global Constraints

- `v2/CLAUDE.md` es ley: sin `: any`, sin `console.*`, sin `@ts-ignore`, páginas ≤ 300 LOC, `pnpm verify` verde antes de cada commit, Conventional Commits con scope.
- TypeScript `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax`. Todo tipo entra con `import type`. `@typescript-eslint/no-non-null-assertion` es `error`: `!` no es salida.
- `import/order` con `newlines-between: always` y alfabetizado: el lint falla por orden de imports.
- `docs/design-system/README.md` v1.1 es ley. §9b: **PROHIBIDO el hex literal en TSX** — sólo tokens Tailwind. Si falta un token se agrega a `docs/design-system/tokens.css` + `apps/web/tailwind.config.ts` en el mismo PR. El hex literal **sí** está permitido en `.css`, `.svg`, `.html` y en scripts de `scripts/` (no son TSX).
- Todo texto de usuario en español rioplatense con voseo. «Comillas angulares». ¡BASTA! siempre con los dos signos.
- **La frontera Vite es física.** `import.meta.glob` sólo existe dentro de Vite: ningún script de `scripts/` puede importar `apps/web/src/lib/*-registry.ts`. Este plan no toca ningún registry.
- **El alias `~/` sólo resuelve dentro de `apps/web`.** `v2/tsconfig.json` tiene `paths` vacío e `include: []`. Los scripts importan por ruta relativa.
- **No se toca ningún registry de contenido, ningún `.mdx`, ninguna ruta de `app-routes.tsx`, ni `main.tsx`.** `main.tsx` se queda con `createRoot` (decisión §4 de la spec).
- **Contrato compartido, no renegociable:** los atributos `data-prerender` (lo escribe B12, lo funde el `<style>` crítico que entrega este plan) y `data-volatil` (B12) no se renombran. El `<style>` crítico de la Tarea 12 declara `data-prerender` **antes** de que B12 exista: ése es el punto.
- **Este plan no crea `robots.txt` ni `sitemap.xml`** — su único dueño es `scripts/build/sellar-head.ts` (B11, otro plan). El `<noscript>` de la Tarea 12 sale a `/planes` y `/biblioteca`, que existen hoy y son lo que §4 pide; el tercer link, `/sitemap.xml`, va sabiendo que el archivo llega con B11, dentro del mismo proyecto ①.
- **Este plan no agrega etiquetas `og:*` ni `twitter:*` al shell**: las escribe `sellarShell()` en B11. Acá sólo se crea el PNG que van a referenciar.
- Los `.woff2` de `apps/web/public/fonts/` y los PNG de la marca (`favicon.ico`, `apple-touch-icon.png`, `icono-192.png`, `icono-512.png`) **se commitean**. Los TTF fuente de `scripts/build/fonts-src/` **no**. `apps/web/public/og/` no lo crea este plan: es de B9.
- **`scripts/vitest.config.ts` ya incluye `build/__tests__/**`** (verificado en el archivo, línea 14: `include: ['content/__tests__/**/*.test.ts', 'build/__tests__/**/*.test.ts']`). No hay que tocarlo: los tests de `scripts/build/__tests__/` que escriben este plan y B9/B11/B12 corren desde el primer día con `pnpm test:scripts`.
- Cada tarea termina con `pnpm verify` verde y un commit propio. Las tareas de medición (9) y de configuración pura no llevan test previo: llevan una verificación con salida esperada, y está dicho en cada paso.

---

### Tarea 1: B0 — enmienda documental con guardia

**Files:**
- Create: `scripts/build/__tests__/enmiendas-documentales.test.ts`
- Create: `docs/adr/0007-sustrato-indexacion-y-host.md` (D1–D4, que la fila B0 de la spec exige «escritas»)
- Modify: `docs/architecture/README.md:96`
- Modify: `docs/design-system/README.md` — catorce ediciones ancladas en texto literal, no en número de línea (orientativos, sobre HEAD: `:2`, `:11`, `:14`, `:43`, `:107-108`, `:114`, `:119`, `:139`, `:145`, `:148`, `:155`, `:174`, `:217`, `:222`)
- Modify: `docs/plans/2026-07-21-papel-y-tinta-master-plan.md:262`, `:338`

**Interfaces:**
- Consumes: nada.
- Produces: la ley enmendada y `docs/adr/0007-sustrato-indexacion-y-host.md` con D1–D4. B6 (contraste) reescribe §2 después, con los hex nuevos; B10 (números honestos) se apoya en §5, §7 y §11.3 ya enmendados —las tres enmiendas del asterisco son de acá, no de B10—; la Tarea 14 de este plan se apoya en §12 ya enmendado; B11 y B13 leen D1 del ADR.

- [ ] **Paso 1: Escribir el test que falla**

Crear `scripts/build/__tests__/enmiendas-documentales.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');

function leer(ruta: string): string {
  return readFileSync(join(raizV2, ruta), 'utf8');
}

const LEY = 'docs/design-system/README.md';
const ARQUITECTURA = 'docs/architecture/README.md';
const MASTER = 'docs/plans/2026-07-21-papel-y-tinta-master-plan.md';

/**
 * B0 del sustrato: la documentación dejaba de coincidir con lo que ① implementa
 * en cuatro puntos que, sin guardia, ② reintroduce en la primera página que
 * construya (§11.3 es literalmente la Definición de terminado por página).
 */
describe('enmienda documental de ① (B0)', () => {
  it('la arquitectura ya no limita el SSG a blog/ensayos/courses', () => {
    const texto = leer(ARQUITECTURA);
    expect(texto).not.toContain('SSG only at build time for blog/ensayos/courses');
    expect(texto).toContain('2026-07-26-el-sustrato.md');
  });

  it('§3 de la ley ya no manda Google Fonts', () => {
    const texto = leer(LEY);
    expect(texto).not.toContain('## 3. Tipografía (Google Fonts)');
    expect(texto).toContain('## 3. Tipografía (auto-hospedada)');
    expect(texto).toContain('/fonts/');
  });

  it('§12 lista sólo los glifos que las seis familias traen', () => {
    const texto = leer(LEY);
    expect(texto).toContain('→ ← ↑ ↓ – — × − + · « » ¡ !');
    expect(texto).not.toContain('Solo glifos tipográficos → ↗ ↺ ▌ ▾ ¡ !');
  });

  it('ni §5, ni §7, ni §11.3 siguen mandando asterisco sobre datos inventados', () => {
    const texto = leer(LEY);
    expect(texto).not.toContain('todo dato inventado lleva asterisco');
    expect(texto).not.toContain('asteriscos en datos demo');
    // §5 es la tercera pata, y la que ② lee para construir cada página: sin estos
    // dos asserts el mandato del asterisco sobrevive intacto en la sección del kit
    // y el resto de la suite queda verde igual.
    expect(texto).not.toContain('obligatoria junto a toda métrica inventada');
    expect(texto).not.toContain('* datos de demostración');
  });

  it('la tarea 1.3 del master plan ya no pide el fallback con asterisco', () => {
    const texto = leer(MASTER);
    expect(texto).not.toContain('fallback to demo constant + asterisk');
  });

  it('la tarea 8.1 del master plan cede a ① lo que ① entrega', () => {
    const texto = leer(MASTER);
    expect(texto).not.toContain(
      '**8.1 SEO/OG:** per-page titles/descriptions per §14, OG template card, favicon «¡», sitemap.xml, prerender of public routes.',
    );
    expect(texto).toContain('2026-07-26-el-sustrato.md');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA — los **seis** `it` que escribió el Paso 1 en rojo, el primero con `expected 'docs/architecture/README.md' not to contain 'SSG only at build time for blog/ensayos/courses'`. El séptimo (`'D1–D4 están escritas en un ADR y no sólo en la spec'`, el del `ENOENT` sobre `docs/adr/0007-sustrato-indexacion-y-host.md`) todavía **no existe**: lo agrega el Paso 4. Si acá aparecen siete, algo se adelantó.

- [ ] **Paso 3: Aplicar las enmiendas**

`docs/architecture/README.md` — línea 96, reemplazar:

```
- Server-side rendering — SSG only at build time for blog/ensayos/courses
```

por:

```
- Server-side rendering en runtime — el sitio se genera en build: `<head>` sellado
  para toda URL pública (planes, ensayos, bitácora, blog, entrenamientos, secciones)
  y HTML congelado para planes y ensayos. Ver `docs/specs/2026-07-26-el-sustrato.md`
  §3 y §4. Lo que sigue prohibido es SSR por request o inyección desde Express.
```

`docs/design-system/README.md` — **catorce ediciones, cada una con su texto viejo literal**.

Los números de línea son orientativos y **no** son el localizador: la primera edición
cambia una línea por dos y la cuarta inserta un párrafo de seis, así que de la quinta en
adelante el renglón real está siete líneas más abajo de lo que dice el número. Anclá
siempre en el texto viejo, que va citado entero en cada par «reemplazar ESTO por ESTO».

Cuidado con los greps de control sobre la palabra «asterisco»: §5 (kit de formularios)
dice «Requerido: asterisco violeta en la etiqueta mono», que es correcto, no tiene nada
que ver con datos inventados y **no se toca**.

(1) Línea ~2 — reemplazar:

```
Versión 1.1 · julio 2026 · fuente de verdad para todas las páginas del sitio.
```

por:

```
Versión 1.2 · julio 2026 · fuente de verdad para todas las páginas del sitio.
Enmendado por `docs/specs/2026-07-26-el-sustrato.md` (①): §1, §3, §5, §7, §11.3 y §12.
```

(2) Línea ~11 — reemplazar:

```
- Tagline del header: contador social vivo — `{N} voces · falta la tuya` (Space Mono 10px, uppercase, #7A756A). Nunca "movimiento ciudadano" ni slogans pasivos: el tagline debe dejar afuera al que no participó.
```

por:

```
- Tagline del header: contador social vivo — `{N} voces · falta la tuya` (Space Mono 10px, uppercase). El número aparece **sólo cuando hay algo que contar**: con cero, cargando o error el slot dice «Falta la tuya.» a secas. Nunca una constante escrita a mano. Nunca "movimiento ciudadano" ni slogans pasivos: el tagline debe dejar afuera al que no participó.
```

(3) Línea ~14 — reemplazar:

```
- Sin logo gráfico, sin íconos decorativos, sin emojis. Los únicos "gráficos" permitidos: el mapa de Argentina, tally marks, la semilla SVG del certificado, flechas tipográficas (→ ↗ ↺ ▌).
```

por:

```
- Sin logo gráfico, sin íconos decorativos, sin emojis. Los únicos "gráficos" permitidos: el mapa de Argentina, tally marks, la semilla SVG del certificado, y las flechas tipográficas del catálogo de §12. `↺ ▌ ▾ ☰ ✓ ▲ ▼` **no** son glifos: ninguna de las seis familias los trae y hoy los dibuja la fuente de símbolos del sistema operativo. Son SVG inline de `components/papel/primitives/Glifos.tsx`.
```

(4) Línea ~43 — reemplazar el encabezado `## 3. Tipografía (Google Fonts)` por `## 3. Tipografía (auto-hospedada)`, e insertar —justo después de la línea ```` ``` ```` que cierra el bloque de código `Anton (display) · Archivo (texto, 300–800 + itálica) · Space Mono (400/700)`, y antes del bullet `- **Anton**: títulos y cifras.`— este párrafo:

```
Las seis familias se sirven desde el propio origen: `.woff2` subseteados en
`/fonts/`, con la versión en el nombre, declarados con `@font-face` y
`font-display: swap` en `apps/web/src/index.css`. Cero requests a terceros.
El catálogo vive en `scripts/build/fuentes.ts` y el subseteo en
`scripts/build/subset-fonts.ts`; los TTF fuente no se commitean.
```

(5) Líneas ~107-108, §5 — **la enmienda que la spec §8 pide y que ningún otro bloque aplica**. Reemplazar las dos líneas:

```
Nota de datos demo (obligatoria junto a toda métrica inventada)
`<span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#B5B1A8;">* datos de demostración</span>`
```

por:

```
Cifra sin dato (obligatoria en lugar de toda métrica que no exista todavía)
No hay métricas inventadas ni notas al pie que las disculpen: cuando una cifra no está —cargando, error, o cero real— el slot dice lo que pasa y nunca un número. El régimen vive en `components/papel/voces-regimen.ts` (B10 de ①), que también retira la primitiva `NotaDemo`.
```

Es la tercera pata de la enmienda de §8 de la spec («§5, §7 y §11.3 del design-system
todavía mandan asterisco»). Sin ella, el mandato sigue vivo en la sección que ② lee para
construir cada página; sin los dos asserts nuevos del Paso 1, el resto de los `it`
quedaría verde igual porque sólo miraban §7 y §11.3. **El plan C no la aplica**: su
Tarea 14 la da por hecha y sólo greppea.

(6) Línea ~114 — reemplazar:

```
- Cargando (botón): texto reemplazado por «— ▌» con blink-cursor; ancho fijo.
```

por:

```
- Cargando (botón): texto reemplazado por «— » + `<GlifoCursor />` con blink-cursor; ancho fijo.
```

(7) Línea ~119 — reemplazar:

```
- Select: nativo estilizado — borde 1px tinta, fondo papel-crudo, flecha ▾ tipográfica.
```

por:

```
- Select: nativo estilizado — borde 1px tinta, fondo papel-crudo, `<GlifoDespliegue />` a la derecha.
```

(8) Línea ~139 — reemplazar:

```
- Búsqueda: input mono con prefijo «buscar:» y cursor ▌; resultados en filas de índice.
```

por:

```
- Búsqueda: input mono con prefijo «buscar:» y `<GlifoCursor />`; resultados en filas de índice.
```

(9) Línea ~145 — reemplazar:

```
- Extensión de la fila de índice: encabezados mono 11px uppercase tinta-50, orden con ▲▼ tipográficos, borde inferior 1px tinta en el header, hover papel-presionado. Header sticky permitido. Sin zebra.
```

por:

```
- Extensión de la fila de índice: encabezados mono 11px uppercase tinta-50, orden con `<GlifoOrdenAsc />`/`<GlifoOrdenDesc />`, borde inferior 1px tinta en el header, hover papel-presionado. Header sticky permitido. Sin zebra.
```

(10) Línea ~148 — reemplazar:

```
- Modal = documento papel-sobre-oscuro (§5) centrado sobre velo rgba(22,19,14,.7); cierre «✕» tipográfico arriba a la derecha. Un modal por vez.
```

por:

```
- Modal = documento papel-sobre-oscuro (§5) centrado sobre velo rgba(22,19,14,.7); cierre «×» (U+00D7) arriba a la derecha. Un modal por vez.
```

(11) Línea ~155 — reemplazar:

```
entra con fadeup. Cierre «✕» tipográfico + Escape; uno por vez; el foco entra al «✕»
```

por:

```
entra con fadeup. Cierre «×» (U+00D7) + Escape; uno por vez; el foco entra al «×»
```

(12) Línea ~174, §7 — reemplazar el final del bullet de ideas fijas:

```
· todo dato inventado lleva asterisco.
```

por:

```
· ningún número visible sale de una constante escrita a mano: las métricas de participación salen de la base, los conteos de contenido salen del contenido en disco, y cuando no hay dato se dice con palabras.
```

**Ésta es la redacción canónica de la línea 174 para los cuatro planes de ①.** El plan C
citaba una variante («vienen de la base / del registro en disco / si no hay dato se
dice») para la misma línea; queda anulada.

(13) Línea ~217, §11.3 — reemplazar:

```
3. Definición de terminado: kicker+título+CTA presentes · una sola interacción firma · asteriscos en datos demo · responsive a 1 columna · voseo consistente.
```

por:

```
3. Definición de terminado: kicker+título+CTA presentes · una sola interacción firma · cero números fabricados (toda cifra sale de la base o del contenido en disco; sin dato, se dice con palabras) · responsive a 1 columna · voseo consistente.
```

**Redacción canónica también para el resto de ①.**

(14) Línea ~222, §12 — reemplazar:

```
- Páginas editoriales/públicas: CERO íconos. Solo glifos tipográficos → ↗ ↺ ▌ ▾ ¡ !
```

por:

```
- Páginas editoriales/públicas: CERO íconos. Sólo el catálogo tipográfico → ← ↑ ↓ – — × − + · « » ¡ ! (lo que las seis familias traen, verificado con fontTools). Todo lo demás — ↺ ▌ ▾ ☰ ✓ ▲ ▼ — es SVG inline en `components/papel/primitives/Glifos.tsx`. `↗` sobrevive **sólo** dentro de `font-space`: Space Mono es la única familia que lo tiene.
```

El catálogo lleva **dos caracteres más que la lista literal de §5 de la spec**: la raya
`–` (U+2013) y la raya `—` (U+2014). No es una licencia: el sitio usa `—` **382 veces en
141 archivos `.tsx`** y las seis familias la traen. Dejarla fuera del catálogo convertiría
en infracción el carácter más usado del sistema, y —peor— invitaría a sacarla del
`GLIFOS_SUBSET` de la Tarea 10, que es lo que la mandaría a la fuente de símbolos del
sistema operativo. Queda pendiente alinear esa línea de la spec con estas dos rayas.

`docs/plans/2026-07-21-papel-y-tinta-master-plan.md` — línea ~262, reemplazar:

```
- Modify: `apps/web/src/components/papel/papel-nav.ts` + `PapelHeader.tsx` (react-query fetch, fallback to demo constant + asterisk while loading/error)
```

por:

```
- Modify: `apps/web/src/components/papel/papel-nav.ts` + `PapelHeader.tsx` (react-query fetch; sin constante de respaldo: con cero, cargando o error el slot dice «Falta la tuya.» — régimen en `components/papel/voces-regimen.ts`, B10 de ①)
```

Línea ~338, reemplazar:

```
- [ ] **8.1 SEO/OG:** per-page titles/descriptions per §14, OG template card, favicon «¡», sitemap.xml, prerender of public routes.
```

por:

```
- [ ] **8.1 SEO/OG:** lo entrega ① (`docs/specs/2026-07-26-el-sustrato.md`): títulos y descripciones por página según §14, card OG, favicon «¡», sitemap.xml y prerender de planes y ensayos. Acá queda sólo la verificación de que cada página nueva de ② sume su entrada al registro de rutas y pase `meta:check`.
```

- [ ] **Paso 4: El ADR con D1–D4**

La fila B0 de «Orden de trabajo» de la spec exige como entrega «**D1–D4 escritas**», y hoy
las cuatro decisiones viven sólo dentro de las 689 líneas de la spec. `v2/CLAUDE.md`
manda «Check `docs/adr/` for prior decisions», y la propia spec invoca
`docs/adr/0001-stack-choices.md` para justificar el prerender — pero 0001 no dice una
palabra del origen canónico ni de la elección de host. Crear
`docs/adr/0007-sustrato-indexacion-y-host.md` (0006 es el último):

```md
# ADR 0007 — Indexación, origen canónico y host de v2

**Status:** Accepted · 2026-07-26
**Fuente:** `docs/specs/2026-07-26-el-sustrato.md` (①, «El sustrato»), decisiones D1–D4.

En castellano, como la spec de la que sale: este ADR la transcribe, no la reinterpreta.

## Contexto

`apps/web` es una SPA de Vite pura: un `index.html` de 25 líneas, sin SSR, sin
prerender, y `apps/api` nunca sirve HTML. No existía ninguna configuración de
despliegue dentro de `v2/`. Compartir cualquiera de las ~493 URLs daba el mismo
`<head>`, sin una sola etiqueta `og:`.

## Decisiones

**D1 · Origen canónico y host.** El origen es `https://elinstantedelhombregris.com`,
parametrizado por `VITE_SITE_ORIGIN`. v2 reemplaza a v1 en ese dominio cuando esté
terminado. El host es Vercel, declarado en un `v2/vercel.json` propio, hermano del
de la raíz (que publica v1) y sin tocarlo. La fecha de salida no es parte de ①; la
elección de host sí, porque el fallback SPA, los 301, los headers y la caché no
existen en ninguna otra parte.

**D2 · Alcance de la indexación: híbrido.** `<head>` sellado en build para todas las
URLs, más prerender de HTML real para las URLs de planes y ensayos. No se usa
`react-dom/server` ni `hydrateRoot`: `main.tsx` se queda con `createRoot` y el
prerender le sirve al scraper y al `<noscript>`, no al LCP.

**D3 · Contraste: escala dual + `aria-hidden`.** Los hex actuales quedan para bordes,
divisores, superficies y palitos; se agregan tokens de texto con valores AA; la
numeración de expediente y la flecha `→` se marcan `aria-hidden` por ser decoración.

**D4 · El pie deja de declarar prototipo.** «Prototipo con datos de demostración» se
reemplaza por una declaración positiva y auditable, con link a `/datos-abiertos`.
Ningún número visible sale de una constante escrita a mano.

## Consecuencias

- SSR en runtime y la inyección por request siguen prohibidos (ADR 0001).
- `hydrateRoot` y la auditoría de mismatch que habilitaría quedan para un ADR propio.
- El asterisco de «datos demo» deja de ser mandato del design-system (§5, §7, §11.3).
```

Agregar el enlace en `docs/architecture/README.md`, en la lista de ADRs si existe, o
inmediatamente después de la línea que este mismo paso ya reescribió sobre el SSG.

Agregar al test del Paso 1 este séptimo `it`:

```ts
  it('D1–D4 están escritas en un ADR y no sólo en la spec', () => {
    const adr = leer('docs/adr/0007-sustrato-indexacion-y-host.md');

    for (const decision of ['D1 ·', 'D2 ·', 'D3 ·', 'D4 ·']) {
      expect(adr).toContain(decision);
    }
    expect(adr).toContain('elinstantedelhombregris.com');
    expect(adr).toContain('vercel.json');
  });
```

- [ ] **Paso 5: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: PASA — los siete `it` de `enmienda documental de ① (B0)` en verde, y los tests de `content/__tests__` y `build/__tests__/proyeccion.test.ts` siguen verdes.

- [ ] **Paso 6: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/docs/design-system/README.md v2/docs/architecture/README.md \
        v2/docs/adr/0007-sustrato-indexacion-y-host.md \
        v2/docs/plans/2026-07-21-papel-y-tinta-master-plan.md \
        v2/scripts/build/__tests__/enmiendas-documentales.test.ts
git commit -m "docs(v2): la ley deja de mandar Google Fonts, asteriscos y glifos que no existen"
```

---

### Tarea 2: B1 — `scripts/` entra a `pnpm verify`

**Files:**
- Create: `v2/scripts/tsconfig.json`
- Create: `v2/eslint.config.mjs`
- Modify: `v2/package.json` (devDependencies + scripts `lint`, `type-check`, `lint:scripts`, `type-check:scripts`)
- Modify: `v2/scripts/build/build-content.ts:27`, `:124`, `:164`, `:260`
- Modify: `v2/scripts/build/__tests__/proyeccion.test.ts:23`
- Modify: `v2/scripts/content/componer-mdx.ts:15-16`, `migrate-blog-v1-to-v2.ts:29,44,120,129,133`, `migrate-courses-v1-to-v2.ts:125`, `migrate-ensayos-v1-to-v2.ts:297,303,306`, `migrate-planes-v1-to-v2.ts:40,88`, `validar-campos-planos.ts:23`, `verify-blog-migration.ts:154,159,162,167,170,171,173,174`, `verify-planes-index.ts:145,146,147,151`

**Interfaces:**
- Consumes: nada.
- Produces: `scripts/` type-checkeado y linteado. Sin esto, `sellar-head.ts`, `prerender.ts`, `build-og-cards.ts` y `subset-fonts.ts` —el corazón de ①— escaparían a `strict`, a `no-explicit-any` y a `no-console`. **Va primero de todo B1**: todo lo que se escriba después nace linteado.

- [ ] **Paso 1: Agregar las tres devDependencies de la raíz**

En `v2/package.json`, dentro de `devDependencies`, agregar (respetando el orden alfabético existente):

```json
    "@types/node": "^22.10.2",
    "@v2/config-eslint": "workspace:*",
    "@v2/shared": "workspace:*",
```

`@types/node` hace falta porque `scripts/` usa `node:fs`, `node:path`, `node:url` y `process`, y hoy no hay `@types/node` en `v2/node_modules`. `@v2/shared` porque `build-content.ts` ya importa `@v2/shared/content` y los scripts de B9/B11/B12 van a importar `loadContentDir`. `@v2/config-eslint` porque el flat config de la raíz lo extiende.

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm install && ls node_modules/@types/node && ls node_modules/@v2`
Esperado: `pnpm install` termina sin error; `ls node_modules/@types/node` lista `package.json`; `ls node_modules/@v2` lista `config-eslint` y `shared`.

- [ ] **Paso 2: `scripts/tsconfig.json` y ver el único error real**

Crear `v2/scripts/tsconfig.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "../packages/config/typescript/base.json",
  "compilerOptions": {
    "noEmit": true,
    "incremental": false,
    "lib": ["ES2022", "DOM"],
    "types": ["node"]
  },
  "include": ["**/*.ts"],
  "exclude": [
    "**/node_modules/**",
    "_archive/**",
    "content/extraer-fuentes-planes.ts"
  ]
}
```

**Los `*.test.ts` NO se excluyen, y esto es lo que decide si `pnpm verify` vive o
muere.** El ESLint compartido corre con `parserOptions: { projectService: true }`
(`packages/config/eslint/index.js:29`): todo archivo que se lintea tiene que
pertenecer a algún proyecto de TypeScript. Excluirlos acá —como excluye
`base.json`— deja los cinco tests que ya existen bajo `scripts/`, los seis que este
plan crea (`enmiendas-documentales`, `deps`, `limpieza`, `fuentes`, `shell`,
`marca`) y los de B9/B11/B12 fuera de todo proyecto, y `npx eslint scripts` sale con
`Parsing error: … was not found by the project service`. Como el Paso 8 mete
`lint:scripts` en `pnpm lint`, `pnpm verify` —la puerta declarada antes de **cada**
commit de los cuatro planes— quedaría roja para siempre desde esta tarea.
**Reproducido**: con `"**/*.test.ts"` en el `exclude`,
`npx eslint scripts/build/__tests__/proyeccion.test.ts` da el `Parsing error`; sin
esa línea, da el error de lint real (`array-type` en `proyeccion.test.ts:23`), que es
lo que queremos ver. Y `npx tsc --showConfig -p scripts/tsconfig.json` pasa de 22
archivos sin un solo test a **27 con los cinco tests adentro**.

Y el motivo por el que `base.json` parecía cubrirlo es falso: los paths de `exclude`
heredados por `extends` se resuelven contra el directorio del config **base**, así
que el `**/*.test.ts` de `packages/config/typescript/base.json` sólo excluye tests
que vivan bajo `packages/config/typescript/`. Por eso `apps/web` —que tampoco
excluye tests en su `exclude` propio— lintea `PapelHeader.test.tsx` sin quejarse, y
por eso el override de reglas para `scripts/content/__tests__/**/*.ts` del Paso 4
tiene sentido: esos archivos **se lintean**.

**El `lib` no es decorativo y no se puede omitir.**
`packages/config/typescript/base.json` declara `"lib": ["ES2022"]` —sin DOM—, y dos
scripts de ① corren código de navegador tipado: `medir-lcp.ts` (Tarea 9) usa
`PerformanceObserver`, el tipo `Element` y el `EntryType`
`'largest-contentful-paint'`, y todo `page.evaluate()` que toque `document` —los de
B12 (`prerender.ts`) y los de B13— cae en lo mismo. Medido contra esta misma config,
sin `DOM` salen exactamente tres errores y el `type-check:scripts` del Paso 8 queda
rojo desde la Tarea 9 en adelante, o sea para todo lo que sigue:

```
prueba.ts(11,56): error TS2304: Cannot find name 'Element'.
prueba.ts(13,16): error TS2322: Type '"largest-contentful-paint"' is not assignable to type 'EntryType'.
prueba.ts(14,8): error TS2584: Cannot find name 'document'. Do you need to change your target library? Try changing the 'lib' compiler option to include 'dom'.
```

Y la convivencia de `DOM` con `"types": ["node"]` **está verificada**: con
`@types/node@^22.10.2` (la versión que instala el Paso 1) el mismo archivo, usando
`PerformanceObserver`, `Element`, `document.fonts.ready`, `process.stdout` y
`node:fs` a la vez, compila **sin una sola línea de salida**. No hay identificadores
duplicados: `@types/node` v22 ya se protege de la lib DOM. Si en alguna actualización
futura aparecieran duplicados, la salida es sacar `DOM` del `lib` y aislar los
callbacks de navegador con `/// <reference lib="dom" />` en la cabecera de
`medir-lcp.ts` y `build-marca.ts` — pero hoy no hace falta, y la decisión queda acá y
no descubierta en la Tarea 9.

**Cableado con `v2/tsconfig.json`.** §10 de la spec dice «`scripts/tsconfig.json` …,
referenciado desde `v2/tsconfig.json`». **No se agrega** `{ "path": "./scripts" }` al
array `references`: ese array hoy está roto de antes —ninguno de los cinco proyectos
que lista declara `composite: true`, y `packages/ui/tsconfig.json` ni siquiera
existe—, así que `tsc -b` falla por causas ajenas a ①. La intención de la spec (que
`scripts/` no escape al type-check) la satisface el script `type-check:scripts` del
Paso 8, que sí corre en `pnpm verify` y en CI. Queda pendiente corregir esa frase de
la spec cuando se arregle el build por referencias; **no** usar `npx tsc -b --dry`
como verificación de nada en este plan.

Las exclusiones, con motivo y no por comodidad (el `exclude` propio pisa entero al
heredado, así que las que quedan son las únicas que rigen):

- `_archive/**` y `**/node_modules/**`, que no son código gobernado por ①.
- `content/extraer-fuentes-planes.ts` importa `../../../SocialJusticeHub/shared/arquitecto-data` y `strategic-initiatives`, o sea código de v1, que arrastra dos errores `TS2532` de archivos que v2 no gobierna. Es un script de una sola corrida cuya salida (`content/planes-sources.ts`) ya está commiteada y verificada por `pnpm planes:check`.

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && npx tsc -p scripts/tsconfig.json`
Esperado: FALLA con exactamente un error:

```
scripts/build/build-content.ts(124,19): error TS2379: Argument of type '{ file: string; message: string; issues: { path: string; message: string; }[] | undefined; }' is not assignable to parameter of type 'LoaderError' with 'exactOptionalPropertyTypes: true'.
```

- [ ] **Paso 3: Arreglar el único error de tipos**

En `scripts/build/build-content.ts`, línea 124, reemplazar:

```ts
      errors.push({ file: `${entry.name}/${err.file}`, message: err.message, issues: err.issues });
```

por:

```ts
      // `LoaderError.issues` es opcional y `exactOptionalPropertyTypes` está en on:
      // pasarlo como `undefined` explícito no compila. Spread condicional.
      errors.push({
        file: `${entry.name}/${err.file}`,
        message: err.message,
        ...(err.issues !== undefined ? { issues: err.issues } : {}),
      });
```

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && npx tsc -p scripts/tsconfig.json`
Esperado: PASA — sin salida.

- [ ] **Paso 4: Flat config de ESLint para la raíz**

Crear `v2/eslint.config.mjs` (extensión `.mjs` a propósito: `v2/package.json` no declara `"type": "module"` y ESLint no puede cargar un `eslint.config.js` con `import`):

```js
// @ts-check
import nodeConfig from './packages/config/eslint/node.js';

/**
 * Config de la raíz de v2 — existe sólo para `scripts/`, que no es workspace de
 * pnpm y por lo tanto no lo alcanza `pnpm -r lint`. Sin esto, los cuatro scripts
 * de build de ① (sellar-head, prerender, build-og-cards, subset-fonts) shippean
 * sin `no-explicit-any`, sin `no-console` y sin `no-non-null-assertion`.
 *
 * El objeto de `ignores` global de la config compartida ignora `build/**`, que acá
 * matchearía `scripts/build/**` (los patrones de flat config son estilo gitignore
 * y matchean a cualquier profundidad). Se lo filtra y se declara uno propio.
 */
const esSoloIgnores = (config) => Object.keys(config).length === 1 && 'ignores' in config;

export default [
  {
    ignores: [
      '**/node_modules/**',
      'scripts/_archive/**',
      // Importa código de v1 (`SocialJusticeHub/shared/*`), que vive fuera del
      // universo de tipos de v2. Está excluido de `scripts/tsconfig.json` por el
      // mismo motivo; sin esta línea el projectService no lo encuentra en ningún
      // proyecto.
      'scripts/content/extraer-fuentes-planes.ts',
    ],
  },
  ...nodeConfig.filter((config) => !esSoloIgnores(config)),
  {
    // Scripts de migración de una sola corrida v1 → v2. Ya corrieron, su salida
    // está commiteada y la protegen guardias propias (`pnpm planes:check`,
    // `verify-blog-migration`). Se lintean igual, pero sin las dos reglas que
    // obligarían a reescribir lógica probada por 39 sitios. Los scripts NUEVOS
    // no entran acá: `no-non-null-assertion` es `error` para ellos.
    files: [
      'scripts/content/migrate-*.ts',
      'scripts/content/verify-*.ts',
      'scripts/content/repair-*.ts',
      'scripts/content/__tests__/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
];
```

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && npx eslint scripts --max-warnings 0`
Esperado: FALLA con del orden de **29 errores y 1 warning en 14 archivos**: 12 `no-console`, 4 `import/order`, 6 `no-unnecessary-type-conversion`, 2 `no-unnecessary-type-assertion`, 2 `array-type`, 1 `consistent-type-definitions`, 1 `no-unnecessary-condition`, 1 `use-unknown-in-catch-callback-variable`, y 1 warning por directiva `eslint-disable` sin uso.

**Ese desglose es una referencia, no un contrato.** Se midió antes de que el Paso 1
instalara `@types/node` y `@v2/shared` —sin ellos `build-content.ts` solo escupe más de
cien `no-unsafe-*` que después desaparecen— y sin los `*.test.ts` adentro del proyecto,
que el `exclude` corregido del Paso 2 ahora sí incluye (de ahí el `array-type` de
`proyeccion.test.ts:23` que figura en **Files:**). Los archivos de `**Files:**` son los
que salieron en esa medición; es probable que aparezca alguno más —`repair-blog-slugs.ts`
es el candidato— y eso no es una regresión. **Lo que sí es contrato es el Paso 7: cero
errores.** Anotá la salida real de este paso antes de tocar nada: es la línea de base
contra la que se leen los Pasos 5 y 6.

- [ ] **Paso 5: `--fix` para los 10 mecánicos**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && npx eslint scripts --fix && npx eslint scripts --max-warnings 0`
Esperado: quedan del orden de **19 errores** (mismo caveat que el Paso 4: lo que manda es la salida real que anotaste ahí menos lo que el fixer arregló): los 12 `no-console`, `consistent-type-definitions` en `migrate-blog-v1-to-v2.ts:44`, `no-unnecessary-condition` en `migrate-courses-v1-to-v2.ts:125`, `use-unknown-in-catch-callback-variable` en `build-content.ts:260`, y 4 `no-unnecessary-type-conversion`/`no-unnecessary-type-assertion` de `verify-blog-migration.ts` que el fixer no toca por ser cambios de tipo.

Revisar el diff de `--fix` con `git diff` antes de seguir: tiene que ser todo orden de imports, `Array<T>` → `T[]`, `String(x)` sobre strings y la directiva muerta de `build-content.ts:164`.

- [ ] **Paso 6: Los 12 `console.*` → `process.stdout.write` / `process.stderr.write`**

Patrón: `console.log(x)` → `process.stdout.write(\`${x}\n\`)`; `console.error(x)` → `process.stderr.write(\`${x}\n\`)`. Es lo mismo que ya hace `scripts/build/geo/index.ts`, y el CLI de referencia para el `main()` en el top level es `scripts/content/verify-planes-index.ts` (el que ya corre en CI). (`scripts/build/build-mapa-argentina.ts` **no existe** — `scripts/build/` tiene sólo `__tests__/`, `build-content.ts`, `data/` y `geo/`.)

`scripts/content/verify-planes-index.ts` líneas 145-151, reemplazar:

```ts
    console.error('El índice de planes no coincide con el contenido:\n');
    for (const e of errores) console.error(`  · ${e}`);
    console.error('\nCorré `pnpm planes:migrar` y revisá el diff.');
    process.exit(1);
  }

  console.log(`Índice de planes OK: ${String(PLANES_INDEX.length)} entradas coinciden con content/planes/.`);
```

por:

```ts
    process.stderr.write('El índice de planes no coincide con el contenido:\n\n');
    for (const e of errores) process.stderr.write(`  · ${e}\n`);
    process.stderr.write('\nCorré `pnpm planes:migrar` y revisá el diff.\n');
    process.exit(1);
  }

  process.stdout.write(
    `Índice de planes OK: ${String(PLANES_INDEX.length)} entradas coinciden con content/planes/.\n`,
  );
```

`scripts/content/migrate-blog-v1-to-v2.ts` líneas 120, 129 y 133:

```ts
      process.stdout.write(`skip   ${src.slug} (already exists)\n`);
```
```ts
    process.stdout.write(`wrote  ${src.slug}.mdx\n`);
```
```ts
  process.stdout.write(`\nDone: ${String(written)} written, ${String(skipped)} skipped.\n`);
```

`scripts/content/migrate-ensayos-v1-to-v2.ts` líneas 297, 303 y 306: las mismas tres, idénticas.

`scripts/content/migrate-planes-v1-to-v2.ts` líneas 40 y 88:

```ts
      process.stdout.write(`borrado (fuera del canon): ${archivo}\n`);
```
```ts
  process.stdout.write(`${String(PLANES_SOURCES.length)} planes emitidos + índice generado.\n`);
```

- [ ] **Paso 7: Los 7 errores restantes**

`scripts/build/build-content.ts:260` — `use-unknown-in-catch-callback-variable`: tipar el parámetro del `.catch()` como `unknown` y estrechar con `err instanceof Error ? err.message : String(err)`.

`scripts/content/migrate-blog-v1-to-v2.ts:44` — `consistent-type-definitions`: cambiar `type X = { … }` por `interface X { … }`.

`scripts/content/migrate-courses-v1-to-v2.ts:125` — `no-unnecessary-condition`: la condición es siempre verdadera según los tipos; borrar la condición y dejar el cuerpo.

`scripts/content/verify-blog-migration.ts` líneas 154, 159, 162, 167, 171, 174 — `no-unnecessary-type-conversion`: sacar el `String(...)` que envuelve un valor que ya es `string`. Líneas 170 y 173 — `no-unnecessary-type-assertion`: sacar el `as` que no cambia el tipo (el `!` de esas mismas líneas ya está exento por la regla scopeada del Paso 4).

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && npx eslint scripts --max-warnings 0`
Esperado: PASA — sin salida.

- [ ] **Paso 8: Cablear `lint` y `type-check` de la raíz**

En `v2/package.json`, en `scripts`, reemplazar:

```json
    "lint": "pnpm -r --parallel lint",
    "lint:fix": "pnpm -r --parallel lint:fix",
    "type-check": "pnpm -r --parallel type-check",
```

por:

```json
    "lint": "pnpm -r --parallel lint && pnpm lint:scripts",
    "lint:fix": "pnpm -r --parallel lint:fix && eslint scripts --fix",
    "lint:scripts": "eslint scripts --max-warnings 0",
    "type-check": "pnpm -r --parallel type-check && pnpm type-check:scripts",
    "type-check:scripts": "tsc -p scripts/tsconfig.json",
```

`pnpm -r` no incluye la raíz del workspace, así que no hay recursión.

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm verify`
Esperado: PASA — `lint`, `type-check`, `test:unit`, `test:scripts`, `test:integration` y `build` en verde.

- [ ] **Paso 9: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/package.json v2/pnpm-lock.yaml v2/eslint.config.mjs v2/scripts/tsconfig.json v2/scripts
git commit -m "chore(v2): scripts/ entra a lint y type-check — 29 errores y un TS2379 después"
```

---

### Tarea 3: B1 — guardia `deps:check`

**Files:**
- Create: `v2/scripts/build/deps.ts`
- Create: `v2/scripts/build/deps-check.ts`
- Create: `v2/scripts/build/__tests__/deps.test.ts`
- Modify: `v2/package.json` (script `deps:check`)
- Modify: `.github/workflows/v2-ci.yml` (paso nuevo después de «Guardia del índice de planes»)

**Interfaces:**
- Consumes: nada.
- Produces: `TOPE_DEPS_PRODUCCION`, `TOPE_DURO_CLAUDE_MD`, `cuentaEsteDirectorio()`, `depsUnicasDeProduccion()`, `leerPaquetes()` de `scripts/build/deps.ts`. La Tarea 4 (purga) los usa para probar que las deps muertas se fueron.

- [ ] **Paso 1: Escribir el test que falla**

Crear `scripts/build/__tests__/deps.test.ts`:

```ts
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  TOPE_DEPS_PRODUCCION,
  TOPE_DURO_CLAUDE_MD,
  cuentaEsteDirectorio,
  depsUnicasDeProduccion,
  leerPaquetes,
} from '../deps';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');

describe('depsUnicasDeProduccion', () => {
  it('deduplica, ordena y descarta los paquetes del propio workspace', () => {
    const unicas = depsUnicasDeProduccion([
      { nombre: '@v2/web', deps: ['zod', 'react', '@v2/shared'] },
      { nombre: '@v2/api', deps: ['zod', 'express', '@v2/db'] },
    ]);

    expect(unicas).toEqual(['express', 'react', 'zod']);
  });

  it('con cero paquetes devuelve una lista vacía', () => {
    expect(depsUnicasDeProduccion([])).toEqual([]);
  });
});

describe('el catálogo real de v2', () => {
  it('el tope de trabajo es menor que el tope duro de CLAUDE.md', () => {
    expect(TOPE_DEPS_PRODUCCION).toBeLessThan(TOPE_DURO_CLAUDE_MD);
    expect(TOPE_DURO_CLAUDE_MD).toBe(60);
  });

  it('no supera el tope de trabajo', () => {
    const unicas = depsUnicasDeProduccion(leerPaquetes(raizV2));

    expect(unicas.length).toBeLessThanOrEqual(TOPE_DEPS_PRODUCCION);
  });

  it('no cuenta las deps de las configuraciones compartidas', () => {
    // Se prueba el PREDICADO, no el resultado sobre el repo real: `packages/config/`
    // no tiene `package.json` hoy (sus configs viven en `eslint/`, `prettier/` y
    // `typescript/`, un nivel más abajo), así que `leerManifiesto` devolvería
    // `undefined` y el directorio se saltearía igual con el filtro y sin él. Un
    // assert contra `leerPaquetes(raizV2)` pasaría con la línea borrada: no
    // protegería nada. El día que `packages/config/package.json` exista, esta
    // línea es lo único que impide que sus plugins de ESLint entren al cupo de
    // producción.
    expect(cuentaEsteDirectorio('packages', 'config')).toBe(false);
    expect(cuentaEsteDirectorio('packages', 'db')).toBe(true);
    expect(cuentaEsteDirectorio('apps', 'web')).toBe(true);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA con `Failed to resolve import "../deps"`.

- [ ] **Paso 3: Implementación mínima**

Crear `scripts/build/deps.ts`:

```ts
/**
 * Guardia del cupo de dependencias de producción (`v2/CLAUDE.md`: «60-dep cap on
 * production deps»). El tope duro es 60; el de trabajo es 45, para que la deriva
 * se vea mucho antes de tocar el techo. Hoy son 38.
 *
 * Cuenta la UNIÓN de `dependencies` de `apps/*` y `packages/*`, sin
 * `packages/config/*` (son configuraciones de tooling: sus «dependencies» son
 * plugins de ESLint, no código que se sirva) y sin los paquetes del propio
 * workspace (`@v2/*`).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const TOPE_DEPS_PRODUCCION = 45;

/** El techo de `v2/CLAUDE.md`. Nunca se sube: se baja el de trabajo. */
export const TOPE_DURO_CLAUDE_MD = 60;

export interface PaqueteDeWorkspace {
  readonly nombre: string;
  readonly deps: readonly string[];
}

/** `@v2/shared`, `@v2/db`… no cuentan: son código de este repo. */
export function esDelWorkspace(dep: string): boolean {
  return dep.startsWith('@v2/');
}

/**
 * `packages/config/` es tooling: sus «dependencies» serían plugins de ESLint y de
 * Prettier, no código que se sirva. Hoy ni siquiera tiene `package.json` —por eso
 * el filtro se testea como predicado y no contra el disco—, pero el día que lo
 * tenga esta línea es lo único que lo mantiene fuera del cupo.
 */
export function cuentaEsteDirectorio(grupo: string, nombre: string): boolean {
  return !(grupo === 'packages' && nombre === 'config');
}

export function depsUnicasDeProduccion(
  paquetes: readonly PaqueteDeWorkspace[],
): readonly string[] {
  const unicas = new Set<string>();
  for (const paquete of paquetes) {
    for (const dep of paquete.deps) {
      if (!esDelWorkspace(dep)) unicas.add(dep);
    }
  }
  return [...unicas].sort((a, b) => a.localeCompare(b));
}

interface ManifiestoParcial {
  name?: string;
  dependencies?: Record<string, string>;
}

function leerManifiesto(ruta: string): ManifiestoParcial | undefined {
  let crudo: string;
  try {
    crudo = readFileSync(ruta, 'utf8');
  } catch {
    return undefined;
  }
  return JSON.parse(crudo) as ManifiestoParcial;
}

/** Enumera los workspaces desde el disco. Nunca desde una lista escrita a mano. */
export function leerPaquetes(raizV2: string): readonly PaqueteDeWorkspace[] {
  const paquetes: PaqueteDeWorkspace[] = [];

  for (const grupo of ['apps', 'packages']) {
    const dirGrupo = join(raizV2, grupo);
    for (const entrada of readdirSync(dirGrupo, { withFileTypes: true })) {
      if (!entrada.isDirectory()) continue;
      if (!cuentaEsteDirectorio(grupo, entrada.name)) continue;

      const manifiesto = leerManifiesto(join(dirGrupo, entrada.name, 'package.json'));
      if (!manifiesto) continue;

      paquetes.push({
        nombre: manifiesto.name ?? `${grupo}/${entrada.name}`,
        deps: Object.keys(manifiesto.dependencies ?? {}),
      });
    }
  }

  return paquetes;
}
```

Crear `scripts/build/deps-check.ts`:

```ts
/**
 * CLI de la guardia de dependencias. Corre en CI como `pnpm deps:check`.
 *
 * Run: pnpm deps:check
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOPE_DEPS_PRODUCCION, depsUnicasDeProduccion, leerPaquetes } from './deps';

const RAIZ_V2 = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function main(): void {
  const unicas = depsUnicasDeProduccion(leerPaquetes(RAIZ_V2));

  if (unicas.length > TOPE_DEPS_PRODUCCION) {
    process.stderr.write(
      `Dependencias de producción: ${String(unicas.length)} (tope ${String(TOPE_DEPS_PRODUCCION)}).\n\n`,
    );
    for (const dep of unicas) process.stderr.write(`  · ${dep}\n`);
    process.stderr.write('\nSacá una antes de agregar otra, o escribí un ADR.\n');
    process.exit(1);
  }

  process.stdout.write(
    `Dependencias de producción OK: ${String(unicas.length)} de ${String(TOPE_DEPS_PRODUCCION)}.\n`,
  );
}

main();
```

En `v2/package.json`, agregar el script después de `"planes:check"`:

```json
    "deps:check": "tsx scripts/build/deps-check.ts",
```

En `.github/workflows/v2-ci.yml`, insertar entre el paso «Guardia del índice de planes» y el paso «Build all workspaces»:

```yaml
      - name: Guardia de dependencias de producción
        run: pnpm deps:check
```

**Orden acordado con el plan C, que reclama el mismo punto de inserción.** En el
workflow queda `Guardia del índice de planes` → `Guardia de dependencias de
producción` (esta tarea) → `Guardia del registro de rutas` (B7, plan C) → `Build all
workspaces`; en `v2/package.json`, `"planes:check"` → `"deps:check"` (esta tarea) →
`"meta:check"` (B7). El plan C ancla en el paso que agrega esta tarea, no en «Guardia
del índice de planes».

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm deps:check`
Esperado: PASA — los cinco `it` en verde y `Dependencias de producción OK: 38 de 45.`

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/scripts/build/deps.ts v2/scripts/build/deps-check.ts \
        v2/scripts/build/__tests__/deps.test.ts v2/package.json .github/workflows/v2-ci.yml
git commit -m "chore(v2): deps:check — 38 deps de producción, tope de trabajo 45"
```

---

### Tarea 4: B1 — purga de lo muerto

**Files:**
- Modify: `v2/apps/web/package.json` (sacar `sonner`, `@radix-ui/react-label`)
- Modify: `v2/packages/db/package.json` (sacar `drizzle-zod`, `zod`)
- Modify: `v2/apps/web/src/components/ui/label.tsx`
- Modify: `v2/scripts/build/__tests__/deps.test.ts`

**Interfaces:**
- Consumes: `depsUnicasDeProduccion()`, `leerPaquetes()` de `scripts/build/deps.ts` (Tarea 3).
- Produces: nada nuevo. `Label` conserva exactamente la misma API pública (`import { Label } from '~/components/ui/label'`), así que los 10 archivos que la usan no se tocan.

- [ ] **Paso 1: Escribir el test que falla**

En `scripts/build/__tests__/deps.test.ts`, agregar dentro del `describe('el catálogo real de v2', …)`:

```ts
  it('las cuatro deps muertas de ① no están en ningún manifiesto', () => {
    const unicas = depsUnicasDeProduccion(leerPaquetes(raizV2));

    // `sonner` y `@radix-ui/react-label` no tienen una sola referencia en
    // `apps/web/src`; `drizzle-zod` y el `zod` de `packages/db` no tienen una
    // sola referencia en `packages/db/src`.
    expect(unicas).not.toContain('sonner');
    expect(unicas).not.toContain('drizzle-zod');
    expect(unicas).not.toContain('@radix-ui/react-label');
  });

  it('zod sobrevive: lo usan apps/web, apps/api y packages/shared', () => {
    const unicas = depsUnicasDeProduccion(leerPaquetes(raizV2));

    expect(unicas).toContain('zod');
  });
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA con `expected [ … ] not to contain 'sonner'`.

- [ ] **Paso 3: La purga**

Antes de sacar nada, confirmar que están muertas:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
grep -rn "sonner" apps/web/src ; grep -rn "zod" packages/db/src
```
Esperado: sin salida en los dos casos.

`apps/web/package.json`: borrar las líneas `"@radix-ui/react-label": "^2.1.1",` y `"sonner": "^1.7.1",` de `dependencies`.

`packages/db/package.json`: borrar `"drizzle-zod": "^0.5.1",` y `"zod": "^3.24.1"` de `dependencies` (cuidando la coma final del objeto).

Reescribir `apps/web/src/components/ui/label.tsx` entero:

```tsx
import { forwardRef } from 'react';

import type { LabelHTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

/**
 * `<label>` nativo con la clase del recipe. Reemplaza a `@radix-ui/react-label`,
 * que sólo aportaba un click-to-focus que el `htmlFor` nativo ya da. Los 10
 * archivos que usan `Label` la importan de acá, nunca de Radix: la API pública
 * no cambia.
 */
export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = 'Label';
```

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm install`
Esperado: pnpm reescribe el lockfile sacando los tres paquetes.

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm deps:check && pnpm verify`
Esperado: PASA — `Dependencias de producción OK: 35 de 45.` y `pnpm verify` verde (los 10 archivos que usan `Label` compilan sin cambios).

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/package.json v2/packages/db/package.json v2/pnpm-lock.yaml \
        v2/apps/web/src/components/ui/label.tsx v2/scripts/build/__tests__/deps.test.ts
git commit -m "chore(v2): purga de sonner, drizzle-zod, zod de db y radix-label — 38 a 35 deps"
```

---

### Tarea 5: B1 — sourcemaps por modo y guardia de `.DS_Store`

**Files:**
- Create: `v2/scripts/build/limpieza.ts`
- Create: `v2/scripts/build/limpiar-dist.ts`
- Create: `v2/scripts/build/__tests__/limpieza.test.ts`
- Modify: `v2/apps/web/vite.config.ts:29`
- Modify: `v2/apps/web/package.json` (script `build`)
- Modify: `v2/.gitignore` (final del archivo)

**Interfaces:**
- Consumes: nada.
- Produces: `listarBasura()`, `NOMBRES_BASURA` de `scripts/build/limpieza.ts`. **Nota para B11:** el `build` de `apps/web` pasa a ser una cadena (`vite build && … limpiar-dist.ts`); B11 le agrega `sellar-head.ts` al final de esa misma cadena, no la reescribe. `sellar-head.ts` vuelve a borrar los `.DS_Store` por su cuenta según su contrato: la redundancia es intencional, porque `pnpm prerender` (B12) corre después y podría reintroducirlos.

- [ ] **Paso 1: Escribir el test que falla**

Crear `scripts/build/__tests__/limpieza.test.ts`:

```ts
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { NOMBRES_BASURA, listarBasura } from '../limpieza';

let carpeta = '';

afterEach(() => {
  if (carpeta) rmSync(carpeta, { recursive: true, force: true });
  carpeta = '';
});

function armarDist(): string {
  carpeta = mkdtempSync(join(tmpdir(), 'limpieza-'));
  mkdirSync(join(carpeta, 'assets'));
  mkdirSync(join(carpeta, 'media', 'fotos'), { recursive: true });
  writeFileSync(join(carpeta, '.DS_Store'), 'basura');
  writeFileSync(join(carpeta, 'media', '.DS_Store'), 'basura');
  writeFileSync(join(carpeta, 'media', 'fotos', 'Thumbs.db'), 'basura');
  writeFileSync(join(carpeta, 'index.html'), '<!doctype html>');
  writeFileSync(join(carpeta, 'assets', 'entry-abc.js'), 'export {};');
  return carpeta;
}

describe('listarBasura', () => {
  it('encuentra la basura del sistema operativo en cualquier profundidad', () => {
    const dist = armarDist();

    const encontrados = listarBasura(dist).map((ruta) => ruta.slice(dist.length + 1)).sort();

    expect(encontrados).toEqual(['.DS_Store', 'media/.DS_Store', 'media/fotos/Thumbs.db']);
  });

  it('no toca nada que el sitio sirva', () => {
    const dist = armarDist();

    const encontrados = listarBasura(dist).join('\n');

    expect(encontrados).not.toContain('index.html');
    expect(encontrados).not.toContain('entry-abc.js');
  });

  it('sobre un directorio inexistente devuelve una lista vacía', () => {
    expect(listarBasura(join(tmpdir(), 'no-existe-jamas-basta'))).toEqual([]);
  });

  it('el catálogo cubre macOS y Windows', () => {
    expect([...NOMBRES_BASURA]).toEqual(['.DS_Store', 'Thumbs.db']);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA con `Failed to resolve import "../limpieza"`.

- [ ] **Paso 3: Implementación mínima**

Crear `scripts/build/limpieza.ts`:

```ts
/**
 * Vite copia `public/` entero desde el disco del autor, así que un `.DS_Store`
 * creado por Finder termina servido por URL: `GET /.DS_Store` devolvía 200 con
 * 8196 bytes de metadata del escritorio de quien buildeó. `.gitignore` ya los
 * ignora y ninguno está trackeado — el problema no es git, es la copia.
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const NOMBRES_BASURA: readonly string[] = ['.DS_Store', 'Thumbs.db'];

/** Rutas absolutas de toda la basura bajo `raiz`, a cualquier profundidad. */
export function listarBasura(raiz: string): readonly string[] {
  let entradas: readonly { name: string; esDir: boolean }[];
  try {
    entradas = readdirSync(raiz, { withFileTypes: true }).map((e) => ({
      name: e.name,
      esDir: e.isDirectory(),
    }));
  } catch {
    return [];
  }

  const encontrados: string[] = [];
  for (const entrada of entradas) {
    const ruta = join(raiz, entrada.name);
    if (entrada.esDir) {
      encontrados.push(...listarBasura(ruta));
    } else if (NOMBRES_BASURA.includes(entrada.name)) {
      encontrados.push(ruta);
    }
  }
  return encontrados;
}

/** Bytes que ocupa una lista de archivos. Para el mensaje del CLI. */
export function pesoDe(rutas: readonly string[]): number {
  return rutas.reduce((total, ruta) => total + statSync(ruta).size, 0);
}
```

Crear `scripts/build/limpiar-dist.ts`:

```ts
/**
 * Corre después de `vite build`, dentro del `build` de `apps/web`. Borra la
 * basura del sistema operativo que la copia de `public/` mete en `dist/`.
 *
 * Run: pnpm --dir ../.. exec tsx scripts/build/limpiar-dist.ts
 */
import { rmSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { listarBasura, pesoDe } from './limpieza';

const RAIZ_V2 = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = resolve(RAIZ_V2, 'apps/web/dist');

function main(): void {
  const basura = listarBasura(DIST);

  if (basura.length === 0) {
    process.stdout.write('dist/ limpio: cero archivos de sistema.\n');
    return;
  }

  const bytes = pesoDe(basura);
  for (const ruta of basura) {
    rmSync(ruta, { force: true });
    process.stdout.write(`  borrado ${relative(DIST, ruta)}\n`);
  }
  process.stdout.write(
    `dist/ limpio: ${String(basura.length)} archivos de sistema (${String(bytes)} bytes).\n`,
  );
}

main();
```

En `apps/web/vite.config.ts`, línea 29, reemplazar `sourcemap: true,` por:

```ts
        // Los sourcemaps son 466 archivos y 16 MB sobre un dist de 29 MB, y publican
        // el árbol de fuentes entero. En dev y preview sirven; en producción no.
        sourcemap: mode !== 'production',
```

En `apps/web/package.json`, reemplazar `"build": "vite build",` por:

```json
    "build": "vite build && pnpm --dir ../.. exec tsx scripts/build/limpiar-dist.ts",
```

Al final de `v2/.gitignore`, agregar:

```
# Fuentes fuente (TTF completos del upstream): insumo de subset-fonts.ts y de las
# tarjetas OG. Nunca se sirven ni se commitean; los .woff2 derivados sí.
/scripts/build/fonts-src/
```

Y borrar los dos `.DS_Store` que hoy están en el disco (no están trackeados):

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && rm -f apps/web/public/.DS_Store scripts/.DS_Store
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm --filter @v2/web build && ls apps/web/dist/assets/*.map | wc -l && find apps/web/dist -name '.DS_Store'`
Esperado: PASA — los cuatro `it` en verde; el build imprime `dist/ limpio: …`; `ls … | wc -l` imprime `0` (el `ls` avisa `No such file or directory`, que es lo correcto); `find` no imprime nada.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/scripts/build/limpieza.ts v2/scripts/build/limpiar-dist.ts \
        v2/scripts/build/__tests__/limpieza.test.ts v2/apps/web/vite.config.ts \
        v2/apps/web/package.json v2/.gitignore
git commit -m "chore(v2): el dist deja de publicar 466 sourcemaps y el .DS_Store del autor"
```

---

### Tarea 6: B1 — `.size-limit.json` mide el payload inicial completo

**Files:**
- Modify: `v2/apps/web/vite.config.ts` (bloque `rollupOptions.output`)
- Modify: `v2/.size-limit.json`

**Interfaces:**
- Consumes: nada.
- Produces: el chunk de entrada pasa a llamarse `assets/entry-<hash>.js`. La Tarea 7 aprieta el límite después de sacar framer-motion.

- [ ] **Paso 1: Ver el agujero con los ojos**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2/apps/web/dist/assets && ls index-*.js
```
Esperado: **dos** archivos, p. ej. `index-BNeErDje.js` y `index-BT3_JUMf.js`. El glob `index-*` de `.size-limit.json` matchea los dos y ninguno de los dos es identificable: uno es el chunk de entrada, el otro es un chunk perezoso que salió de un módulo llamado `index`. Además `query-*` y `radix-*` —que `index.html` precarga con `modulepreload`— no están medidos: son **28.798 bytes gzip** fuera del presupuesto.

- [ ] **Paso 2: Desambiguar el nombre del chunk de entrada**

En `apps/web/vite.config.ts`, dentro de `build.rollupOptions.output`, agregar `entryFileNames` arriba de `manualChunks`:

```ts
        output: {
          // El chunk de entrada se llamaba `index-<hash>.js` y colisionaba con el
          // chunk perezoso de cualquier módulo llamado `index`: el presupuesto de
          // `.size-limit.json` medía los dos y no podía distinguirlos.
          entryFileNames: 'assets/entry-[hash].js',
          manualChunks: {
            react: ['react', 'react-dom'],
            query: ['@tanstack/react-query'],
            radix: ['@radix-ui/react-slot'],
          },
        },
```

- [ ] **Paso 3: Reescribir `.size-limit.json`**

```json
[
  {
    "name": "payload inicial de la portada (gzip)",
    "path": [
      "apps/web/dist/assets/entry-*.js",
      "apps/web/dist/assets/react-*.js",
      "apps/web/dist/assets/query-*.js",
      "apps/web/dist/assets/radix-*.js",
      "apps/web/dist/assets/Home-*.js"
    ],
    "limit": "190 KB",
    "gzip": true
  },
  {
    "name": "CSS inicial (gzip)",
    "path": "apps/web/dist/assets/index-*.css",
    "limit": "15 KB",
    "gzip": true
  },
  {
    "name": "chunk del 404 (gzip)",
    "path": "apps/web/dist/assets/NotFound-*.js",
    "limit": "5 KB",
    "gzip": true
  },
  {
    "name": "registro de planes (gzip)",
    "path": "apps/web/dist/assets/plans-registry-*.js",
    "limit": "10 KB",
    "gzip": true
  }
]
```

Los cuatro límites están medidos sobre el `dist` real de hoy, con margen chico a propósito: payload inicial 188,8 KB (límite 190), CSS 12,2 KB (límite 15), 404 0,6 KB (límite 5), registro de planes 6,8 KB (límite 10).

- [ ] **Paso 4: Verificar**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web build && ls apps/web/dist/assets/entry-*.js && pnpm size`
Esperado: PASA — existe un solo `entry-<hash>.js`; `pnpm size` imprime los cuatro presupuestos en verde y el primero cerca de `188.8 KB`.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/vite.config.ts v2/.size-limit.json
git commit -m "chore(v2): el presupuesto de bundle mide el payload inicial entero, 28 KB incluidos"
```

---

### Tarea 7: B1 — framer-motion sale del camino crítico

**Files:**
- Modify: `v2/apps/web/vite.config.ts` (`manualChunks`)
- Modify: `v2/apps/web/src/App.tsx:1-8`, `:30-44`
- Modify: `v2/apps/web/src/layouts/RootLayout.tsx:1-13`, `:42-48`
- Modify: `v2/.size-limit.json`

**Interfaces:**
- Consumes: el chunk `entry-*` de la Tarea 6.
- Produces: chunk `motion-*.js` fuera del grafo inicial. `RootLayout` gana un `Suspense` alrededor del `Header` v1; B4 (skip link) y B8 (tema por ruta) tocan el mismo archivo después.

`framer-motion` entra al chunk inicial de las 54 rutas por dos widgets de gamificación importados de forma estática: `XpToast` (desde `App.tsx:6`) y `XPChip` (desde `Header.tsx:7`, que `RootLayout.tsx:8` importa). Son ~44 KB gzip, el 22% del JS de la portada, en un chunk que baja incluso en `/planes/planeb`.

La verificación es determinista: si `framer-motion` tiene su propio `manualChunk` y sigue en el grafo inicial, Vite emite un `modulepreload` para él en `dist/index.html`. **Por eso el chunk va primero y la medición después**: sin el `manualChunks`, `motion-*.js` no existe como archivo y el grep imprime `0` — el mismo valor que el Paso 4 declara como éxito. Rojo y verde serían indistinguibles y el ejecutor creería que ya está hecho.

- [ ] **Paso 1: Chunk propio para framer-motion (el instrumento de medición)**

En `apps/web/vite.config.ts`, dentro de `manualChunks`, agregar:

```ts
            // Chunk propio, no para agrupar: para poder VERIFICAR que sale del
            // grafo inicial. Si volviera a entrar, `dist/index.html` emitiría un
            // `modulepreload` de `motion-*.js` y el grep del build lo caza.
            motion: ['framer-motion'],
```

- [ ] **Paso 2: La verificación que falla**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web build && grep -c 'modulepreload.*motion-' apps/web/dist/index.html
```
Esperado, **antes** del arreglo y con el `manualChunks` del Paso 1 ya puesto: imprime `1` — framer-motion sigue en el camino crítico. Si imprimiera `0` acá, el Paso 1 no se aplicó: revisar `vite.config.ts` antes de seguir, porque sin ese `0`→`1`→`0` la tarea no prueba nada.

- [ ] **Paso 3: `lazy()` sobre los dos consumidores**

En `apps/web/src/App.tsx`, reemplazar la importación de `XpToast` y su uso. El archivo entero queda:

```tsx
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { StrictMode, Suspense, lazy, useEffect } from 'react';

import { AppRoutes } from './app-routes';

import { RootLayout } from '~/layouts/RootLayout';
import { queryClient } from '~/lib/query-client';
import { xpEventBus } from '~/lib/xp-event-bus';

/**
 * `XpToast` es el único consumidor de framer-motion en la raíz del árbol. Estático
 * arrastraba ~44 KB gzip al chunk inicial de las 54 rutas, incluso en un expediente
 * de papel donde no hay gamificación. Perezoso, baja cuando hay un XP que anunciar.
 */
const XpToast = lazy(() =>
  import('~/components/XpToast').then((modulo) => ({ default: modulo.XpToast })),
);

function GamificationCacheBridge(): null {
  const queryClient = useQueryClient();
  useEffect(() => {
    return xpEventBus.subscribe(() => {
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'me'] });
    });
  }, [queryClient]);
  return null;
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="text-muted-foreground font-mono text-sm">
        Cargando — menos que un trámite.
      </span>
    </div>
  );
}

export function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RootLayout>
          <Suspense fallback={<PageFallback />}>
            <AppRoutes />
          </Suspense>
        </RootLayout>
        <GamificationCacheBridge />
        <Suspense fallback={null}>
          <XpToast />
        </Suspense>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
```

(`PageFallback` sigue con `text-muted-foreground font-mono`: lo arregla B6, que es quien tiene los tokens nuevos.)

En `apps/web/src/layouts/RootLayout.tsx`, reemplazar la línea 8 `import { Header } from '~/components/Header';` — sacarla del bloque de imports — y agregar después del bloque de imports:

```tsx
/**
 * El header v1 arrastra `XPChip`, que arrastra framer-motion. Perezoso, sale del
 * chunk inicial y sólo baja en las 32 rutas legado que todavía lo usan. El
 * `fallback` reserva los 56px del `h-14` para que no salte el layout.
 */
const Header = lazy(() =>
  import('~/components/Header').then((modulo) => ({ default: modulo.Header })),
);
```

Y en el `return` de la rama legado, reemplazar `<Header />` por:

```tsx
      <Suspense fallback={<div className="h-14 border-b border-white/5" />}>
        <Header />
      </Suspense>
```

Ajustar el import de React en la primera línea del archivo agregando:

```tsx
import { Suspense, lazy } from 'react';
```

respetando `import/order` (va en el grupo de externos, alfabetizado, antes de `wouter`).

- [ ] **Paso 4: Verificar el corte y apretar el presupuesto**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web build && grep -c 'modulepreload.*motion-' apps/web/dist/index.html ; pnpm size
```
Esperado: el `grep -c` imprime `0` (y sale con código 1, que es lo correcto: no hay coincidencias). `pnpm size` imprime el payload inicial ya sin framer-motion.

Anotar el valor exacto que imprime `pnpm size` para «payload inicial de la portada (gzip)» y **apretar el límite a ese valor redondeado hacia arriba + 5 KB de margen operativo + 6 KB reservados para el registro de rutas de B7** en `.size-limit.json`. Volver a correr `pnpm size` para confirmar verde. El valor medido va en el cuerpo del commit.

**Por qué se reservan esos 6 KB y no se cierra el presupuesto contra lo medido hoy.**
B7 (plan C) mete en el chunk de entrada, por una cadena de imports **estáticos**
—`App.tsx` → `lib/rutas/use-metadata.ts` → `registro.ts` → `entradas.ts`—, una tabla de
55 entradas con título y descripción en prosa: ~20 KB de fuente, del orden de varios KB
gzip. No es perezosa como los cinco content registries. Apretar a «medido + 5 KB» deja a
B7 rompiendo un presupuesto que acaba de fijar B1, y el reflejo del que lo encuentre va a
ser subir el techo. La reserva se escribe donde se ve, en el `name` del presupuesto (es
JSON: no admite comentarios):

```json
    "name": "payload inicial de la portada (gzip) — incluye 6 KB reservados para el registro de rutas (B7)",
```

Si B7 se pasa igual, la salida **no** es subir el techo: es darle chunk propio a
`entradas.ts` en `manualChunks`. Eso queda dicho también en la tarea de C que lo toca.

Correr también la suite: `pnpm test:unit`. Esperado: verde — ningún test monta `RootLayout` (el único que lo roza es `apps/web/src/lib/ir-al-principio.test.tsx`, que monta el hook suelto) y `XpToast.test.tsx` importa el componente directo, no a través de `App`.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/vite.config.ts v2/apps/web/src/App.tsx \
        v2/apps/web/src/layouts/RootLayout.tsx v2/.size-limit.json
git commit -m "perf(web): framer-motion sale del chunk inicial de las 54 rutas"
```

---

### Tarea 8: B1 — el puerto del web es 5173

**Files:**
- Modify: `.claude/launch.json:11-13` (raíz del repo, no `v2/`)

**Interfaces:**
- Consumes: nada. Produces: nada. Es una corrección de deriva.

- [ ] **Paso 1: Ver la contradicción**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris && grep -n "5173\|5273" v2/env.example v2/playwright.config.ts .claude/launch.json
```
Esperado: `env.example`, `playwright.config.ts` (con `strictPort`) y `vite.config.ts` (vía `WEB_PORT`) usan **5173**; `.claude/launch.json` levanta con `--port 5273`. Gana 5173, que es lo que ya usan los tres.

- [ ] **Paso 2: Corregir**

En `.claude/launch.json`, en la configuración `v2-web`, reemplazar:

```json
        "cd v2/apps/web && pnpm dev --port 5273"
      ],
      "port": 5273
```

por:

```json
        "cd v2/apps/web && pnpm dev --port 5173"
      ],
      "port": 5173
```

- [ ] **Paso 3: Verificar**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris && grep -c 5273 .claude/launch.json`
Esperado: imprime `0` (sale con código 1: sin coincidencias).

- [ ] **Paso 4: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add .claude/launch.json
git commit -m "chore(v2): el web levanta en 5173, como dicen env.example, vite y playwright"
```

---

### Tarea 9: B2 — medir el LCP real antes de decidir el preload

**Files:**
- Create: `v2/scripts/diagnostic/medir-lcp.ts`

**Interfaces:**
- Consumes: `chromium` de `@playwright/test` (devDependency de la raíz, ya instalada).
- Produces: la medición que decide el campo `preload` de `CARAS` en la Tarea 10. Sin ella, «preload de Anton y Archivo» es una suposición.

- [ ] **Paso 1: Escribir el script de medición**

Esta tarea no lleva test: mide, no implementa comportamiento. Crear `scripts/diagnostic/medir-lcp.ts`:

```ts
/**
 * Diagnóstico de una sola corrida: qué elemento es el LCP real de las rutas que
 * más se comparten. Decide qué caras tipográficas se precargan en B2 — precargar
 * la familia equivocada cuesta ancho de banda y no mueve el LCP.
 *
 * Necesita un `vite preview` corriendo:
 *   pnpm --filter @v2/web build
 *   pnpm --filter @v2/web preview --port 4173
 *
 * Run: pnpm exec tsx scripts/diagnostic/medir-lcp.ts
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';
const RUTAS = ['/', '/planes/planeb', '/biblioteca', '/el-mapa'] as const;

interface MedicionLcp {
  readonly ms: number;
  readonly etiqueta: string;
  readonly clases: string;
  readonly texto: string;
}

async function medir(url: string): Promise<MedicionLcp | undefined> {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1280, height: 800 } });

  await pagina.addInitScript(() => {
    const marca: { valor?: MedicionLcp } = {};
    (globalThis as unknown as { __lcp: typeof marca }).__lcp = marca;
    new PerformanceObserver((lista) => {
      const entradas = lista.getEntries();
      const ultima = entradas[entradas.length - 1];
      if (!ultima) return;
      const elemento = (ultima as unknown as { element?: Element }).element;
      marca.valor = {
        ms: Math.round(ultima.startTime),
        etiqueta: elemento?.tagName ?? '(sin elemento)',
        clases: elemento?.className.toString().slice(0, 120) ?? '',
        texto: (elemento?.textContent ?? '').trim().slice(0, 60),
      };
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });

  await pagina.goto(url, { waitUntil: 'networkidle' });
  await pagina.waitForTimeout(1500);

  const medicion = await pagina.evaluate(
    () => (globalThis as unknown as { __lcp: { valor?: MedicionLcp } }).__lcp.valor,
  );
  await navegador.close();
  return medicion;
}

async function main(): Promise<void> {
  for (const ruta of RUTAS) {
    const medicion = await medir(`${BASE}${ruta}`);
    if (!medicion) {
      process.stdout.write(`${ruta.padEnd(20)} sin LCP observable\n`);
      continue;
    }
    process.stdout.write(
      `${ruta.padEnd(20)} ${String(medicion.ms).padStart(5)}ms  <${medicion.etiqueta}> ` +
        `«${medicion.texto}»  [${medicion.clases}]\n`,
    );
  }
}

await main();
```

- [ ] **Paso 2: Buildear y levantar el preview**

Comando, en una terminal:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web build && pnpm --filter @v2/web preview --port 4173
```
Esperado: `Local: http://localhost:4173/`.

- [ ] **Paso 3: Medir**

Comando, en otra terminal:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm exec tsx scripts/diagnostic/medir-lcp.ts
```
Esperado: cuatro líneas, una por ruta, con el tag, el texto y las clases del elemento LCP. Anotar textualmente la salida: va en el cuerpo del commit de la Tarea 11.

**La regla de decisión**, que se aplica en la Tarea 10:
- Si el elemento LCP de al menos dos de las cuatro rutas lleva `font-anton` → `preload: true` para Anton.
- Si lo lleva con `font-archivo` (o es un `<p>`/`<div>` de cuerpo, que hereda Archivo del layout) → `preload: true` para el Archivo variable.
- Space Mono, Inter, JetBrains Mono y Playfair Display **nunca** se precargan: o pintan meta de 10-11px o pertenecen a las 32 rutas legado.

Bajar el preview con `Ctrl-C`.

- [ ] **Paso 4: Verificar que el script pasa las guardias**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm lint:scripts && pnpm type-check:scripts`
Esperado: PASA — sin salida.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/scripts/diagnostic/medir-lcp.ts
git commit -m "chore(v2): medir-lcp — qué elemento pinta último antes de decidir el preload"
```

---

### Tarea 10: B2 — catálogo de las seis familias

**Files:**
- Create: `v2/scripts/build/fuentes.ts`
- Create: `v2/scripts/build/__tests__/fuentes.test.ts`

**Interfaces:**
- Consumes: la medición de la Tarea 9 (decide el campo `preload`).
- Produces (**contrato compartido, copiar literal**):
  - `export interface CaraDeFuente { readonly familia: string; readonly fuente: string; readonly salida: string; readonly peso: string; readonly estilo: 'normal' | 'italic'; readonly variable: boolean; readonly preload: boolean; }`
  - `export const VERSION_FUENTES = 'v1';`
  - `export const CARAS: readonly CaraDeFuente[];`
  - `export const GLIFOS_SUBSET: string;`
  - `export const GLIFOS_EXTRA_SPACE_MONO: string;`
  - `export function glifosDe(cara: CaraDeFuente): string;`
  - `export function declaracionFontFace(cara: CaraDeFuente): string;`
  - Los consumen `scripts/build/subset-fonts.ts` (Tarea 11), `apps/web/src/index.css` (Tarea 12, copiando las declaraciones literales) y `scripts/build/build-og-cards.ts` (B9, que lee los TTF de `cara.fuente`).

- [ ] **Paso 1: Escribir el test que falla**

Crear `scripts/build/__tests__/fuentes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  CARAS,
  GLIFOS_EXTRA_SPACE_MONO,
  GLIFOS_SUBSET,
  VERSION_FUENTES,
  declaracionFontFace,
  glifosDe,
} from '../fuentes';

/** Las seis familias que `tailwind.config.ts` declara hoy. */
const FAMILIAS = [
  'Anton',
  'Archivo',
  'Space Mono',
  'Inter',
  'JetBrains Mono',
  'Playfair Display',
];

describe('CARAS', () => {
  it('cubre las seis familias de tailwind.config.ts, ni una más ni una menos', () => {
    expect([...new Set(CARAS.map((c) => c.familia))].sort()).toEqual([...FAMILIAS].sort());
  });

  it('cada salida es única y lleva la versión en el nombre', () => {
    const salidas = CARAS.map((c) => c.salida);

    expect(new Set(salidas).size).toBe(salidas.length);
    for (const salida of salidas) {
      expect(salida).toMatch(new RegExp(`-${VERSION_FUENTES}\\.woff2$`));
    }
  });

  it('cada fuente TTF es única', () => {
    const fuentes = CARAS.map((c) => c.fuente);

    expect(new Set(fuentes).size).toBe(fuentes.length);
    for (const fuente of fuentes) expect(fuente).toMatch(/\.ttf$/);
  });

  it('sólo se precargan caras de Anton o Archivo', () => {
    for (const cara of CARAS) {
      if (cara.preload) expect(['Anton', 'Archivo']).toContain(cara.familia);
    }
  });

  it('se precargan como máximo dos caras', () => {
    expect(CARAS.filter((c) => c.preload).length).toBeLessThanOrEqual(2);
  });

  it('el peso de una cara variable es un rango; el de una estática, un número', () => {
    for (const cara of CARAS) {
      if (cara.variable) expect(cara.peso).toMatch(/^\d{3} \d{3}$/);
      else expect(cara.peso).toMatch(/^\d{3}$/);
    }
  });
});

describe('GLIFOS_SUBSET', () => {
  it('trae las flechas y la puntuación del catálogo de §12', () => {
    for (const glifo of ['→', '←', '↑', '↓', '×', '−', '·', '«', '»', '¡', '!']) {
      expect(GLIFOS_SUBSET).toContain(glifo);
    }
  });

  it('trae la raya: el sitio la usa 382 veces y no está en Latin-1', () => {
    // El bloque Latin-1 termina en U+00FF y el tipográfico arranca en U+2018:
    // `–` (U+2013) y `—` (U+2014) caen en el hueco. Sin este caso, el día que
    // alguien «limpie» el bloque de puntuación las 382 rayas del sitio vuelven a
    // la fuente del sistema operativo sin que nada se ponga rojo.
    for (const glifo of ['—', '–', '·', '«', '»', '×', '−']) {
      expect(GLIFOS_SUBSET).toContain(glifo);
    }
  });

  it('NO trae los seis que ninguna cara tiene', () => {
    for (const ausente of ['↺', '▌', '▾', '✕', '☰', '✓']) {
      expect(GLIFOS_SUBSET).not.toContain(ausente);
    }
  });

  it('cubre Latin-1 con acentos y eñe', () => {
    for (const glifo of ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'Ñ', 'ü', '¿', '¡']) {
      expect(GLIFOS_SUBSET).toContain(glifo);
    }
  });

  it('no repite ningún carácter', () => {
    expect(new Set([...GLIFOS_SUBSET]).size).toBe([...GLIFOS_SUBSET].length);
  });
});

describe('glifosDe', () => {
  it('sólo Space Mono suma la flecha diagonal: es la única familia que la tiene', () => {
    expect(GLIFOS_EXTRA_SPACE_MONO).toBe('↗');

    for (const cara of CARAS) {
      const glifos = glifosDe(cara);
      expect(glifos.startsWith(GLIFOS_SUBSET)).toBe(true);
      expect(glifos.includes('↗')).toBe(cara.familia === 'Space Mono');
    }
  });
});

describe('declaracionFontFace', () => {
  it('emite el bloque completo con swap y la ruta servida', () => {
    const cara = CARAS.find((c) => c.familia === 'Anton');
    if (!cara) throw new Error('Anton salió de CARAS');

    const bloque = declaracionFontFace(cara);

    expect(bloque).toContain("font-family: 'Anton';");
    expect(bloque).toContain(`src: url('/fonts/${cara.salida}') format('woff2');`);
    expect(bloque).toContain('font-weight: 400;');
    expect(bloque).toContain('font-style: normal;');
    expect(bloque).toContain('font-display: swap;');
  });

  it('la cursiva de Archivo se declara italic', () => {
    const cara = CARAS.find((c) => c.estilo === 'italic');
    if (!cara) throw new Error('falta la cursiva de Archivo');

    expect(declaracionFontFace(cara)).toContain('font-style: italic;');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA con `Failed to resolve import "../fuentes"`.

- [ ] **Paso 3: Implementación mínima**

Crear `scripts/build/fuentes.ts`:

```ts
/**
 * Catálogo de las seis familias auto-hospedadas. Puro y testeable: lo ejecuta
 * `subset-fonts.ts` y lo copia `apps/web/src/index.css` (el test verifica que las
 * declaraciones coincidan carácter por carácter, salvo espacios).
 *
 * Por qué las SEIS y no las tres papel: auto-hospedar sólo las papel deja las 32
 * rutas legado en fuentes del sistema, o sea rompe páginas que ② todavía no tocó,
 * e invierte el orden del canon (el borrado de Inter/Playfair/JetBrains es la
 * tarea 7.3 del master plan, después de las cinco fases de páginas). Con
 * `@font-face`, las tres condenadas sólo se descargan en las rutas que las usan:
 * costo cero para el recorrido papel.
 */

export interface CaraDeFuente {
  /** Nombre de la familia como lo declara `tailwind.config.ts`. */
  readonly familia: string;
  /** Archivo TTF en `scripts/build/fonts-src/` (ignorado por git, nunca servido). */
  readonly fuente: string;
  /** Nombre del `.woff2` en `apps/web/public/fonts/`, con versión. */
  readonly salida: string;
  /** Valor literal de `font-weight`: «400» o el rango de la variable, «300 800». */
  readonly peso: string;
  readonly estilo: 'normal' | 'italic';
  readonly variable: boolean;
  /** Sólo las que se precargan — decidido con `scripts/diagnostic/medir-lcp.ts`. */
  readonly preload: boolean;
}

/**
 * Va en el nombre de cada archivo servido. Sirve para que `/fonts/*` se pueda
 * cachear un año como `immutable` (B11): un subset nuevo estrena nombre.
 */
export const VERSION_FUENTES = 'v1';

export const CARAS: readonly CaraDeFuente[] = [
  {
    familia: 'Anton',
    fuente: 'Anton-Regular.ttf',
    salida: `anton-${VERSION_FUENTES}.woff2`,
    peso: '400',
    estilo: 'normal',
    variable: false,
    preload: true,
  },
  {
    familia: 'Archivo',
    fuente: 'Archivo[wdth,wght].ttf',
    salida: `archivo-${VERSION_FUENTES}.woff2`,
    peso: '300 800',
    estilo: 'normal',
    variable: true,
    preload: true,
  },
  {
    familia: 'Archivo',
    fuente: 'Archivo-Italic[wdth,wght].ttf',
    salida: `archivo-italic-${VERSION_FUENTES}.woff2`,
    peso: '300 800',
    estilo: 'italic',
    variable: true,
    preload: false,
  },
  {
    familia: 'Space Mono',
    fuente: 'SpaceMono-Regular.ttf',
    salida: `space-mono-${VERSION_FUENTES}.woff2`,
    peso: '400',
    estilo: 'normal',
    variable: false,
    preload: false,
  },
  {
    familia: 'Space Mono',
    fuente: 'SpaceMono-Bold.ttf',
    salida: `space-mono-bold-${VERSION_FUENTES}.woff2`,
    peso: '700',
    estilo: 'normal',
    variable: false,
    preload: false,
  },
  // Las tres de abajo pintan sólo las 32 rutas legado. La tarea 7.3 del master
  // plan las borra; hasta entonces se sirven desde acá para no dejar media web
  // en fuentes del sistema.
  {
    familia: 'Inter',
    fuente: 'Inter[opsz,wght].ttf',
    salida: `inter-${VERSION_FUENTES}.woff2`,
    peso: '300 700',
    estilo: 'normal',
    variable: true,
    preload: false,
  },
  {
    familia: 'JetBrains Mono',
    fuente: 'JetBrainsMono[wght].ttf',
    salida: `jetbrains-mono-${VERSION_FUENTES}.woff2`,
    peso: '400 500',
    estilo: 'normal',
    variable: true,
    preload: false,
  },
  {
    familia: 'Playfair Display',
    fuente: 'PlayfairDisplay[wght].ttf',
    salida: `playfair-display-${VERSION_FUENTES}.woff2`,
    peso: '400 700',
    estilo: 'normal',
    variable: true,
    preload: false,
  },
];

/**
 * Latin-1 imprimible + puntuación tipográfica + las flechas del catálogo de §12.
 *
 * La raya `—` (U+2014) y la raya corta `–` (U+2013) van EXPLÍCITAS y primero en el
 * bloque de puntuación: el bloque Latin-1 llega a U+00FF y el tipográfico arranca
 * en U+2018, así que sin listarlas quedaban afuera. El sitio usa la raya **382
 * veces en 141 archivos `.tsx`**, y buena parte cae dentro de las familias
 * subseteadas: `© 2026 ¡BASTA! — El instante del hombre gris` en `font-space`
 * (`PapelFooter.tsx:81`), `Cargando — menos que un trámite.` en `font-mono`
 * (`App.tsx:25`), el `— <GlifoCursor />` de `BotonPapel`. Sin la raya en el subset,
 * cada una de esas rayas la dibuja la fuente de símbolos del sistema operativo:
 * exactamente el defecto que §5 de la spec viene a arreglar.
 *
 * NO incluye `↺ ▌ ▾ ✕ ☰ ✓`: verificado con fontTools sobre los TTF completos, no
 * existen en ninguna de las caras. Hoy los dibuja la fuente de símbolos del
 * sistema operativo, por eso «Menú ☰ / Cerrar ✕» y el cursor `▌` se ven distintos
 * en iOS, Android y Windows. La Tarea 14 los reemplaza por SVG.
 */
export const GLIFOS_SUBSET =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`' +
  'abcdefghijklmnopqrstuvwxyz{|}~' +
  '¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿' +
  'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß' +
  'àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ' +
  '–—‘’“”„†‡•…‰‹›€™' +
  '→←↑↓−';

/** `↗` — sólo Space Mono lo tiene. */
export const GLIFOS_EXTRA_SPACE_MONO = '↗';

export function glifosDe(cara: CaraDeFuente): string {
  return cara.familia === 'Space Mono'
    ? GLIFOS_SUBSET + GLIFOS_EXTRA_SPACE_MONO
    : GLIFOS_SUBSET;
}

/** Bloque `@font-face` tal cual va en `apps/web/src/index.css`. */
export function declaracionFontFace(cara: CaraDeFuente): string {
  return [
    '@font-face {',
    `  font-family: '${cara.familia}';`,
    `  src: url('/fonts/${cara.salida}') format('woff2');`,
    `  font-weight: ${cara.peso};`,
    `  font-style: ${cara.estilo};`,
    '  font-display: swap;',
    '}',
  ].join('\n');
}
```

Si la medición de la Tarea 9 dijo que el elemento LCP no lleva `font-anton` en ninguna ruta, poner `preload: false` en Anton y dejar sólo el Archivo variable; si dijo que ninguna de las dos, poner las dos en `false` y no emitir `<link rel="preload">` en la Tarea 12.

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm lint:scripts && pnpm type-check:scripts`
Esperado: PASA — los 14 `it` de `fuentes.test.ts` en verde y las dos guardias sin salida.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/scripts/build/fuentes.ts v2/scripts/build/__tests__/fuentes.test.ts
git commit -m "feat(scripts): catálogo de las seis familias y el subset que sí existe en los TTF"
```

---

### Tarea 11: B2 — subsetear y commitear los `.woff2`

**Files:**
- Create: `v2/scripts/build/subset-fonts.ts`
- Create: `v2/apps/web/public/fonts/` (8 `.woff2` + `OFL.txt` con las seis licencias concatenadas, se commitean)
- Modify: `v2/scripts/build/__tests__/fuentes.test.ts` (describe nuevo: licencia por familia y `.woff2` servido)
- Modify: `v2/package.json` (devDependency `subset-font`, script `fonts:subset`)

**Interfaces:**
- Consumes: `CARAS`, `glifosDe`, `VERSION_FUENTES` de `scripts/build/fuentes.ts` (Tarea 10).
- Produces: `apps/web/public/fonts/*.woff2` — los referencian los `@font-face` de la Tarea 12 y los `<link rel="preload">` del shell. **B9 NO usa esta salida**: satori no soporta woff2 y necesita los TTF completos de `scripts/build/fonts-src/`, que esta tarea deja en el disco (sin commitear).

- [ ] **Paso 1: Bajar los TTF del upstream**

`scripts/build/fonts-src/` está en `.gitignore` desde la Tarea 5. Las catorce URLs están verificadas (devuelven 206 a un `Range` de dos bytes):

**Un `OFL.txt` por familia, no uno para las seis.** Archivo, Space Mono, Inter, JetBrains
Mono y Playfair Display tienen cada una su propio aviso de copyright y su propia Reserved
Font Name. Servir cinco familias bajo la nota de una sexta no cumple la cláusula de
atribución de la OFL, en un repo declarado MIT donde la spec ya señala el tema como
sensible (el caso `mapbox-gl`). Se bajan las seis y el Paso 3 las concatena en el único
`public/fonts/OFL.txt` que el contrato declara, con un encabezado por familia.

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
mkdir -p scripts/build/fonts-src
cd scripts/build/fonts-src
base=https://raw.githubusercontent.com/google/fonts/main/ofl
curl -fL -o "Anton-Regular.ttf"              "$base/anton/Anton-Regular.ttf"
curl -fL -o "OFL-anton.txt"                  "$base/anton/OFL.txt"
curl -fL -o "OFL-archivo.txt"                "$base/archivo/OFL.txt"
curl -fL -o "OFL-space-mono.txt"             "$base/spacemono/OFL.txt"
curl -fL -o "OFL-inter.txt"                  "$base/inter/OFL.txt"
curl -fL -o "OFL-jetbrains-mono.txt"         "$base/jetbrainsmono/OFL.txt"
curl -fL -o "OFL-playfair-display.txt"       "$base/playfairdisplay/OFL.txt"
curl -fL -o "Archivo[wdth,wght].ttf"         "$base/archivo/Archivo%5Bwdth,wght%5D.ttf"
curl -fL -o "Archivo-Italic[wdth,wght].ttf"  "$base/archivo/Archivo-Italic%5Bwdth,wght%5D.ttf"
curl -fL -o "SpaceMono-Regular.ttf"          "$base/spacemono/SpaceMono-Regular.ttf"
curl -fL -o "SpaceMono-Bold.ttf"             "$base/spacemono/SpaceMono-Bold.ttf"
curl -fL -o "Inter[opsz,wght].ttf"           "$base/inter/Inter%5Bopsz,wght%5D.ttf"
curl -fL -o "JetBrainsMono[wght].ttf"        "$base/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"
curl -fL -o "PlayfairDisplay[wght].ttf"      "$base/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf"
ls -la
```
Esperado: catorce archivos —ocho TTF y seis `OFL-*.txt`—, ninguno de 0 bytes; los TTF pesan entre ~150 KB (Anton) y ~800 KB (los variables).

Comando de control: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && git status --short scripts/build/fonts-src`
Esperado: sin salida — el `.gitignore` de la Tarea 5 los está tapando. Si aparecen, la regla no se aplicó y hay que arreglarla antes de seguir.

- [ ] **Paso 2: Instalar `subset-font`**

En `v2/package.json`, agregar a `devDependencies` (orden alfabético):

```json
    "subset-font": "^2.3.0",
```

y a `scripts`:

```json
    "fonts:subset": "tsx scripts/build/subset-fonts.ts",
```

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm install && pnpm deps:check`
Esperado: instala; `deps:check` sigue diciendo `35 de 45` (es devDependency: no cuenta).

- [ ] **Paso 3: Escribir el CLI**

Crear `scripts/build/subset-fonts.ts`:

```ts
/**
 * Subsetea los TTF completos de `scripts/build/fonts-src/` (bajados una vez del
 * upstream de Google Fonts, ignorados por git) a `.woff2` en
 * `apps/web/public/fonts/`, que SÍ se commitean junto a `OFL.txt`.
 *
 * `subset-font` y no `pyftsubset`: meter Python en un pipeline pnpm es una
 * dependencia de plataforma que nadie va a mantener. fontTools se usó sólo para
 * la auditoría de glifos; no es dependencia del build.
 *
 * Run: pnpm fonts:subset
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import subsetFont from 'subset-font';

import { CARAS, glifosDe } from './fuentes';

const AQUI = dirname(fileURLToPath(import.meta.url));
const ORIGEN = resolve(AQUI, 'fonts-src');
const DESTINO = resolve(AQUI, '../../apps/web/public/fonts');

async function main(): Promise<void> {
  if (!existsSync(ORIGEN)) {
    process.stderr.write(
      `No existe ${ORIGEN}.\nBajá los TTF del upstream (ver la Tarea 11 del plan A del sustrato).\n`,
    );
    process.exit(1);
  }

  mkdirSync(DESTINO, { recursive: true });

  let totalOriginal = 0;
  let totalSubset = 0;

  for (const cara of CARAS) {
    const rutaOrigen = join(ORIGEN, cara.fuente);
    if (!existsSync(rutaOrigen)) {
      process.stderr.write(`Falta ${cara.fuente} en fonts-src/.\n`);
      process.exit(1);
    }

    const original = readFileSync(rutaOrigen);
    const subset = await subsetFont(original, glifosDe(cara), { targetFormat: 'woff2' });
    writeFileSync(join(DESTINO, cara.salida), subset);

    totalOriginal += original.length;
    totalSubset += subset.length;
    process.stdout.write(
      `  ${cara.salida.padEnd(32)} ${String(original.length).padStart(8)} → ${String(subset.length).padStart(7)} bytes\n`,
    );
  }

  // La OFL exige que el aviso de copyright y la Reserved Font Name viajen junto a
  // los archivos, y las seis familias tienen avisos DISTINTOS: servir cinco bajo la
  // nota de una sexta no cumple la cláusula de atribución. Se concatenan las seis en
  // el único `OFL.txt` servido, con un encabezado por familia.
  const familias = [...new Set(CARAS.map((cara) => cara.familia))];
  const licencias = familias.map((familia) => {
    const archivo = `OFL-${familia.toLowerCase().replaceAll(' ', '-')}.txt`;
    const rutaLicencia = join(ORIGEN, archivo);
    if (!existsSync(rutaLicencia)) {
      process.stderr.write(`Falta ${archivo} en fonts-src/.\n`);
      process.exit(1);
    }
    const barra = '='.repeat(72);
    return `${barra}\n${familia}\n${barra}\n\n${readFileSync(rutaLicencia, 'utf8').trim()}\n`;
  });
  writeFileSync(join(DESTINO, 'OFL.txt'), `${licencias.join('\n')}\n`);

  process.stdout.write(
    `\n${String(CARAS.length)} caras subseteadas: ${String(totalOriginal)} → ${String(totalSubset)} bytes.\n`,
  );
}

await main();
```

Y agregar al final de `scripts/build/__tests__/fuentes.test.ts` (el archivo que creó la
Tarea 10) este `describe`, que ahora sí puede correr porque los archivos existen:

```ts
describe('lo que queda servido en public/fonts', () => {
  it('la licencia cubre las seis familias, no sólo la primera', () => {
    // La OFL es por familia: Anton, Archivo, Space Mono, Inter, JetBrains Mono y
    // Playfair Display tienen avisos de copyright y Reserved Font Names distintos.
    const licencia = readFileSync(join(raizV2, 'apps/web/public/fonts/OFL.txt'), 'utf8');

    for (const familia of new Set(CARAS.map((c) => c.familia))) {
      expect(licencia).toContain(familia);
    }
    expect(licencia).toContain('SIL OPEN FONT LICENSE');
  });

  it('cada cara del catálogo tiene su .woff2 servido', () => {
    for (const cara of CARAS) {
      expect(existsSync(join(raizV2, 'apps/web/public/fonts', cara.salida))).toBe(true);
    }
  });
});
```

Requiere agregar al bloque de imports de ese archivo:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
```

y la constante `const raizV2 = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');`, igual que en `enmiendas-documentales.test.ts`.

- [ ] **Paso 4: Correr el subseteo y verificar**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm fonts:subset && ls -la apps/web/public/fonts && pnpm test:scripts && pnpm lint:scripts && pnpm type-check:scripts
```
Esperado: PASA — ocho `.woff2` más `OFL.txt`; cada `.woff2` pesa entre ~10 KB y ~40 KB (contra 150-800 KB del TTF original); los 16 `it` de `fuentes.test.ts` en verde; las dos guardias sin salida.

Control de la licencia: `head -3 apps/web/public/fonts/OFL.txt` tiene que empezar con la barra de `=` y el nombre `Anton`, y `grep -c '^=\{72\}$' apps/web/public/fonts/OFL.txt` tiene que imprimir `12` (dos barras por familia).

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/package.json v2/pnpm-lock.yaml v2/scripts/build/subset-fonts.ts \
        v2/scripts/build/__tests__/fuentes.test.ts v2/apps/web/public/fonts
git commit -m "feat(web): las seis familias se sirven desde el propio origen, subseteadas"
```

En el cuerpo del commit va la salida de `scripts/diagnostic/medir-lcp.ts` (Tarea 9), que es lo que justifica qué caras llevan `preload`.

---

### Tarea 12: B2 — el shell pinta papel en el primer frame

**Files:**
- Modify: `v2/apps/web/index.html` (entero)
- Modify: `v2/apps/web/src/index.css:1-3` (inserción) y `:19-21`
- Create: `v2/scripts/build/__tests__/shell.test.ts`

**Interfaces:**
- Consumes: `CARAS`, `declaracionFontFace` de `scripts/build/fuentes.ts` (Tarea 10); los `.woff2` de la Tarea 11.
- Produces: el `<style>` crítico que declara `[data-prerender]` — **contrato compartido con B12**, que envuelve el HTML congelado en ese atributo. El nombre no se renombra.

- [ ] **Paso 1: Escribir el test que falla**

Crear `scripts/build/__tests__/shell.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { CARAS, declaracionFontFace } from '../fuentes';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');

const shell = readFileSync(join(raizV2, 'apps/web/index.html'), 'utf8');
const css = readFileSync(join(raizV2, 'apps/web/src/index.css'), 'utf8');

/** Compara ignorando cómo Prettier haya reacomodado los espacios. */
function normalizar(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim();
}

describe('index.html — el shell', () => {
  it('no declara tema oscuro: `class="dark"` era código muerto (cero selectores .dark en 68 KB de CSS)', () => {
    expect(shell).not.toContain('class="dark"');
  });

  it('el body abre en papel, no en el rectángulo negro', () => {
    expect(shell).toMatch(/<body class="[^"]*bg-papel[^"]*"/);
    expect(shell).not.toContain('bg-[#0a0a0a]');
    expect(shell).not.toContain('text-mist-white');
  });

  it('cero requests a terceros', () => {
    expect(shell).not.toContain('fonts.googleapis.com');
    expect(shell).not.toContain('fonts.gstatic.com');
    expect(shell).not.toContain('preconnect');
  });

  it('precarga exactamente las caras marcadas preload, con crossorigin', () => {
    const precargadas = CARAS.filter((c) => c.preload);
    const enElShell = [...shell.matchAll(/rel="preload" href="\/fonts\/([^"]+)"/g)].map(
      (m) => m[1],
    );

    expect(enElShell.sort()).toEqual(precargadas.map((c) => c.salida).sort());
    for (const cara of precargadas) {
      expect(shell).toContain(
        `<link rel="preload" href="/fonts/${cara.salida}" as="font" type="font/woff2" crossorigin />`,
      );
    }
  });

  it('lleva el <style> crítico con el papel y el contrato data-prerender de B12', () => {
    expect(shell).toContain('<style>');
    expect(normalizar(shell)).toContain('color-scheme: light');
    expect(shell).toContain('[data-prerender]');
    expect(shell).toContain('@keyframes fundido-papel');
    expect(shell).toContain('prefers-reduced-motion');
  });

  it('lleva <noscript> en voseo, con salida a lo que sí se lee sin JS', () => {
    expect(shell).toContain('<noscript>');
    expect(shell).toContain('Esto se lee igual.');
    expect(shell).toContain('sin javascript');
    // §4: los links son a lo que el prerender de B12 congela y una PERSONA puede
    // leer. `/sitemap.xml` es XML para crawlers y ni siquiera existe hasta B11: no
    // puede ser la única salida del bloque.
    expect(shell).toContain('href="/planes"');
    expect(shell).toContain('href="/biblioteca"');
  });

  it('el título respeta el formato «{Página} — ¡BASTA!» de §14, no el invertido de v1', () => {
    expect(shell).toMatch(/<title>[^<]+ — ¡BASTA!<\/title>/u);
    expect(shell).not.toContain('<title>¡BASTA! —');
  });

  it('la descripción del shell es la misma que la entrada `/` del registro (B7)', () => {
    // El shell es el fallback que ve cualquier scraper que llegue a una URL que B11
    // todavía no selló. Si contradice al registro, hay dos verdades.
    expect(shell).toContain(
      'La ciudadanía diseña, el Estado administra, la política ejecuta. Sin líder, sin partido, sin excusas. Dejá tu voz en el mapa.',
    );
  });
});

describe('index.css — las fuentes propias', () => {
  it('la barra de scroll deja de ser negra: color-scheme light en el elemento raíz', () => {
    expect(normalizar(css)).toContain('color-scheme: light');
    expect(normalizar(css)).not.toContain('color-scheme: dark');
  });

  it('declara las ocho caras exactamente como el catálogo', () => {
    for (const cara of CARAS) {
      expect(normalizar(css)).toContain(normalizar(declaracionFontFace(cara)));
    }
  });

  it('el body abre en papel sin cambiarle la fuente a las 32 rutas legado', () => {
    expect(normalizar(css)).toContain('@apply bg-papel text-tinta font-sans;');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA — once `it` en rojo, el primero con `expected '<!doctype html>…' not to contain 'class="dark"'`.

- [ ] **Paso 3: Reescribir el shell**

`apps/web/index.html`, entero (si la Tarea 10 dejó otras caras con `preload: true`, ajustar los dos `<link rel="preload">` para que coincidan con el catálogo — el test lo exige):

```html
<!doctype html>
<html lang="es-AR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#F2EFE7" />
    <!--
      Formato de §14 de la ley: «{Página} — ¡BASTA!». El shell de hoy lo tiene
      invertido («¡BASTA! — El país lo diseña la gente»), que es literalmente el
      defecto que §1 de la spec señala en `index.html:8`. El título y la descripción
      son los de la entrada `/` del registro de rutas (B7), palabra por palabra: el
      shell es el fallback que ve cualquier scraper que llegue antes de que B11 selle
      la URL, así que no puede contradecir al registro.
    -->
    <title>El país lo diseña la gente — ¡BASTA!</title>
    <meta
      name="description"
      content="La ciudadanía diseña, el Estado administra, la política ejecuta. Sin líder, sin partido, sin excusas. Dejá tu voz en el mapa."
    />
    <link rel="preload" href="/fonts/anton-v1.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/archivo-v1.woff2" as="font" type="font/woff2" crossorigin />
    <!--
      Estilo crítico. Sin esto el papel aparece recién cuando montó React, o sea
      después de ~188 KB gzip de JavaScript: toda visita fría a una ruta papel
      abría con un rectángulo negro y saltaba a crema. La barra de scroll la
      gobierna el elemento raíz, no el body: por eso `color-scheme` va en `html`.
    -->
    <style>
      html {
        background: #f2efe7;
        color-scheme: light;
      }
      body {
        margin: 0;
        background: #f2efe7;
      }
      /*
        `[data-prerender]` es el envoltorio del HTML congelado que escribe el
        prerender (B12). React 18 con `createRoot` lo descarta al montar; el
        fundido de 120 ms hace invisible el reemplazo, porque el árbol montado
        entra igual que el congelado. Contrato compartido: el nombre del atributo
        no se renombra.
      */
      [data-prerender],
      #root > :first-child {
        animation: fundido-papel 120ms ease-out both;
      }
      @keyframes fundido-papel {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        [data-prerender],
        #root > :first-child {
          animation: none;
        }
      }
      .sin-js {
        max-width: 760px;
        margin: 0 auto;
        padding: 80px 20px;
        color: #16130e;
      }
      .sin-js-kicker {
        margin: 0 0 16px;
        font-family: 'Space Mono', ui-monospace, monospace;
        font-size: 11px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #6a655b;
      }
      .sin-js-titulo {
        margin: 0 0 24px;
        font-family: Anton, ui-sans-serif, sans-serif;
        font-weight: 400;
        font-size: clamp(44px, 6vw, 88px);
        line-height: 0.98;
      }
      .sin-js-cuerpo {
        max-width: 620px;
        margin: 0 0 16px;
        font-family: Archivo, ui-sans-serif, system-ui, sans-serif;
        font-size: 17px;
        line-height: 1.75;
      }
      .sin-js-link {
        color: #5227cc;
      }
      /* El índice para máquinas va más chico que los dos links de lectura. */
      .sin-js-menor {
        font-size: 14px;
      }
    </style>
  </head>
  <body class="bg-papel text-tinta antialiased">
    <div id="root"></div>
    <noscript>
      <div class="sin-js">
        <p class="sin-js-kicker">sin javascript</p>
        <h1 class="sin-js-titulo">Esto se lee igual.</h1>
        <p class="sin-js-cuerpo">
          El mapa y el mandato necesitan JavaScript: son herramientas vivas, se mueven con
          las voces que entran. Los documentos no. Los planes y los ensayos se sirven como
          HTML entero, sin ejecutar una línea.
        </p>
        <!--
          §4 de la spec: «links a las URLs que SÍ devuelven HTML real después de este
          bloque — los planes y los ensayos», y remata que es la única parte del sitio
          donde el prerender le sirve a una persona y no a un robot. Un `sitemap.xml`
          es XML para crawlers, no una lista de lectura, y además no existe hasta B11:
          va tercero y en chico, no como única salida.
        -->
        <p class="sin-js-cuerpo">
          <a class="sin-js-link" href="/planes">Los planes de gobierno →</a>
        </p>
        <p class="sin-js-cuerpo">
          <a class="sin-js-link" href="/biblioteca">Los ensayos →</a>
        </p>
        <p class="sin-js-cuerpo sin-js-menor">
          <a class="sin-js-link" href="/sitemap.xml">El índice completo del sitio →</a>
        </p>
      </div>
    </noscript>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`apps/web/src/index.css`: insertar, inmediatamente después de las tres directivas `@tailwind` y antes de `@layer base`, el bloque de fuentes (los ocho `@font-face` son la salida literal de `declaracionFontFace()` para cada cara de `CARAS`, en el mismo orden):

```css
/* ══════════ Fuentes propias ══════════
   Las seis familias se sirven desde `/fonts/`, subseteadas por
   `scripts/build/subset-fonts.ts` desde el catálogo de `scripts/build/fuentes.ts`.
   Un test compara estos bloques contra `declaracionFontFace()`: si cambia el
   catálogo y no cambia esto (o al revés), `pnpm test:scripts` se pone rojo.
   Cero requests a terceros: el sitio que argumenta soberanía no le regala la IP
   de cada lector a Google antes de la primera letra. */

@font-face {
  font-family: 'Anton';
  src: url('/fonts/anton-v1.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Archivo';
  src: url('/fonts/archivo-v1.woff2') format('woff2');
  font-weight: 300 800;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Archivo';
  src: url('/fonts/archivo-italic-v1.woff2') format('woff2');
  font-weight: 300 800;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: 'Space Mono';
  src: url('/fonts/space-mono-v1.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Space Mono';
  src: url('/fonts/space-mono-bold-v1.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-v1.woff2') format('woff2');
  font-weight: 300 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/jetbrains-mono-v1.woff2') format('woff2');
  font-weight: 400 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Playfair Display';
  src: url('/fonts/playfair-display-v1.woff2') format('woff2');
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}
```

En el mismo archivo, dentro de `@layer base`, reemplazar:

```css
  html {
    color-scheme: dark;
    -webkit-font-smoothing: antialiased;
  }

  body {
    @apply bg-background text-foreground font-sans;
  }
```

por:

```css
  html {
    /* La barra de scroll y el área de overscroll las pinta el elemento raíz, no
       el body: con `dark` quedaban negras sobre una página de papel. */
    color-scheme: light;
    -webkit-font-smoothing: antialiased;
  }

  body {
    /* `font-sans` (Inter) se queda: cambiarlo acá le cambiaría la tipografía a las
       32 rutas legado de un saque. El chrome papel declara `font-archivo` en su
       propio contenedor (`RootLayout`). */
    @apply bg-papel text-tinta font-sans;
  }
```

- [ ] **Paso 4: Correr los tests y mirar el resultado**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts && pnpm verify`
Esperado: PASA — los once `it` de `shell.test.ts` en verde y `pnpm verify` verde.

Verificación a ojo, que es lo que el test no puede ver:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web build && pnpm --filter @v2/web preview --port 4173
```

Abrir `http://localhost:4173/planes/planeb` con la caché desactivada y el throttling en «Slow 3G»: el primer frame tiene que ser papel, no negro. En la pestaña Network no puede aparecer **ningún** host que no sea `localhost`. Con JavaScript deshabilitado en el navegador tiene que verse el `<noscript>`: kicker mono, «Esto se lee igual.» en Anton y los tres links, con `/planes` y `/biblioteca` primero.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/index.html v2/apps/web/src/index.css v2/scripts/build/__tests__/shell.test.ts
git commit -m "feat(web): el shell pinta papel en el primer frame y no llama a Google"
```

---

### Tarea 13: B2 — primitivas de glifos SVG

**Files:**
- Create: `v2/apps/web/src/components/papel/primitives/Glifos.tsx`
- Create: `v2/apps/web/src/components/papel/primitives/__tests__/Glifos.test.tsx`
- Modify: `v2/apps/web/src/components/papel/primitives/index.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `GlifoMenu`, `GlifoCursor`, `GlifoDespliegue`, `GlifoReintentar`, `GlifoTilde`, `GlifoOrdenAsc`, `GlifoOrdenDesc` y `type GlifoProps`, exportados desde el barril `~/components/papel/primitives`. Los consume la Tarea 14 y toda página futura de ②. **Nota de coordinación:** este commit toca `primitives/index.ts`; B10 saca `NotaDemo` del mismo barril y B12 mete `FolioDeLectura`. El que llegue segundo edita, no reescribe.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/components/papel/primitives/__tests__/Glifos.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  GlifoCursor,
  GlifoDespliegue,
  GlifoMenu,
  GlifoOrdenAsc,
  GlifoOrdenDesc,
  GlifoReintentar,
  GlifoTilde,
} from '../Glifos';

import type { ComponentType } from 'react';

interface GlifoDeclarado {
  readonly nombre: string;
  readonly Componente: ComponentType<{ className?: string }>;
}

/**
 * Los seis glifos que ninguna de las seis familias contiene (verificado con
 * fontTools sobre los TTF completos) más los dos de orden de tablas. Hoy los
 * dibuja la fuente de símbolos del sistema operativo: «Menú ☰ / Cerrar ✕» y el
 * cursor ▌ de todos los botones se ven distintos en iOS, Android y Windows, o
 * sea justo en el chrome que más se toca en móvil.
 */
const DECLARADOS: readonly GlifoDeclarado[] = [
  { nombre: 'menu', Componente: GlifoMenu },
  { nombre: 'cursor', Componente: GlifoCursor },
  { nombre: 'despliegue', Componente: GlifoDespliegue },
  { nombre: 'reintentar', Componente: GlifoReintentar },
  { nombre: 'tilde', Componente: GlifoTilde },
  { nombre: 'orden-asc', Componente: GlifoOrdenAsc },
  { nombre: 'orden-desc', Componente: GlifoOrdenDesc },
];

describe('Glifos', () => {
  it('cada uno se identifica con data-glifo', () => {
    for (const { nombre, Componente } of DECLARADOS) {
      const { container, unmount } = render(<Componente />);
      const svg = container.querySelector('svg');

      expect(svg?.getAttribute('data-glifo')).toBe(nombre);
      unmount();
    }
  });

  it('ninguno se anuncia a un lector de pantalla: son decoración', () => {
    for (const { Componente } of DECLARADOS) {
      const { container, unmount } = render(<Componente />);
      const svg = container.querySelector('svg');

      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.getAttribute('focusable')).toBe('false');
      unmount();
    }
  });

  it('todos miden 1em y toman el color del texto, como el glifo que reemplazan', () => {
    for (const { Componente } of DECLARADOS) {
      const { container, unmount } = render(<Componente />);
      const svg = container.querySelector('svg');

      expect(svg?.getAttribute('width')).toBe('1em');
      expect(svg?.getAttribute('height')).toBe('1em');
      expect(container.innerHTML).toContain('currentColor');
      unmount();
    }
  });

  it('todos aceptan className: el cursor necesita anim-blink-cursor', () => {
    for (const { Componente } of DECLARADOS) {
      const { container, unmount } = render(<Componente className="anim-blink-cursor" />);

      expect(container.querySelector('svg')?.getAttribute('class')).toContain(
        'anim-blink-cursor',
      );
      unmount();
    }
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web exec vitest run src/components/papel/primitives`
Esperado: FALLA con `Failed to resolve import "../Glifos"`.

- [ ] **Paso 3: Implementación mínima**

Crear `apps/web/src/components/papel/primitives/Glifos.tsx`:

```tsx
import type { ReactNode } from 'react';

/**
 * Los glifos que las fuentes NO tienen.
 *
 * Verificado con fontTools sobre los TTF completos: ninguna de las caras (Anton,
 * Archivo VF, Archivo Italic, Space Mono 400/700) contiene `↺ ▌ ▾ ✕ ☰ ✓`. El
 * carácter no está en el archivo fuente, así que auto-hospedar las fuentes (B2)
 * no lo arregla: hoy los dibuja la fuente de símbolos del sistema operativo y se
 * ven distintos en iOS, Android y Windows. `✕` sí tiene reemplazo tipográfico
 * (`×`, U+00D7, presente en las tres familias papel); el resto pasa a SVG.
 *
 * Todos son decoración: `aria-hidden` siempre, y el nombre accesible lo pone el
 * texto o el `aria-label` del control que los contiene. Miden `1em` y heredan el
 * color, para que caigan exactamente donde caía el glifo.
 */
export interface GlifoProps {
  className?: string;
}

interface LienzoProps extends GlifoProps {
  nombre: string;
  children: ReactNode;
}

function Lienzo({ nombre, className, children }: LienzoProps) {
  return (
    <svg
      data-glifo={nombre}
      aria-hidden="true"
      focusable="false"
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

/** ☰ — abrir el menú del header papel. */
export function GlifoMenu({ className }: GlifoProps) {
  return (
    <Lienzo nombre="menu" className={className}>
      <path
        d="M1.5 3h9M1.5 6h9M1.5 9h9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </Lienzo>
  );
}

/** ▌ — cursor que parpadea: botón cargando, input de búsqueda, «la escribís vos». */
export function GlifoCursor({ className }: GlifoProps) {
  return (
    <Lienzo nombre="cursor" className={className}>
      <rect x="4" y="1" width="4" height="10" fill="currentColor" />
    </Lienzo>
  );
}

/** ▾ — flecha del select nativo y del menú de biblioteca. */
export function GlifoDespliegue({ className }: GlifoProps) {
  return (
    <Lienzo nombre="despliegue" className={className}>
      <path d="M1.8 4.2 6 8.6l4.2-4.4Z" fill="currentColor" />
    </Lienzo>
  );
}

/** ↺ — «Probar de nuevo», «Empezar de nuevo», el ciclo del método. */
export function GlifoReintentar({ className }: GlifoProps) {
  return (
    <Lienzo nombre="reintentar" className={className}>
      <path
        d="M10 6A4 4 0 1 1 8.9 3.2"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="square"
      />
      <path d="M10.4 1.2v3.1H7.3Z" fill="currentColor" />
    </Lienzo>
  );
}

/** ✓ — confirmación breve. No es un sello: los sellos son §10.5. */
export function GlifoTilde({ className }: GlifoProps) {
  return (
    <Lienzo nombre="tilde" className={className}>
      <path
        d="M1.6 6.2 4.6 9.3 10.4 2.8"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="square"
      />
    </Lienzo>
  );
}

/** ▲ — orden ascendente en el encabezado de una tabla (§5). */
export function GlifoOrdenAsc({ className }: GlifoProps) {
  return (
    <Lienzo nombre="orden-asc" className={className}>
      <path d="M6 3.2 10.2 8.8H1.8Z" fill="currentColor" />
    </Lienzo>
  );
}

/** ▼ — orden descendente en el encabezado de una tabla (§5). */
export function GlifoOrdenDesc({ className }: GlifoProps) {
  return (
    <Lienzo nombre="orden-desc" className={className}>
      <path d="M6 8.8 1.8 3.2h8.4Z" fill="currentColor" />
    </Lienzo>
  );
}
```

En `apps/web/src/components/papel/primitives/index.ts`, agregar en orden alfabético (después de la línea de `FilaIndiceExpandible`):

```ts
export {
  GlifoCursor,
  GlifoDespliegue,
  GlifoMenu,
  GlifoOrdenAsc,
  GlifoOrdenDesc,
  GlifoReintentar,
  GlifoTilde,
  type GlifoProps,
} from './Glifos';
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web exec vitest run src/components/papel/primitives && pnpm --filter @v2/web lint`
Esperado: PASA — los cuatro `it` de `Glifos` en verde y el lint sin salida (`react-refresh/only-export-components` no se queja: el archivo exporta componentes y un tipo, nada más).

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/src/components/papel/primitives/Glifos.tsx \
        v2/apps/web/src/components/papel/primitives/__tests__/Glifos.test.tsx \
        v2/apps/web/src/components/papel/primitives/index.ts
git commit -m "feat(web): siete glifos SVG — los que ninguna de las seis familias trae"
```

---

### Tarea 14: B2 — el swap de glifos en los once sitios vivos

**Files:**
- Modify: `v2/apps/web/src/components/papel/PapelHeader.tsx:103`
- Modify: `v2/apps/web/src/components/papel/MenuBiblioteca.tsx:81-83`
- Modify: `v2/apps/web/src/components/papel/primitives/BotonPapel.tsx:50`, `:90`
- Modify: `v2/apps/web/src/pages/ElMapa/sections/PopoverVoz.tsx:27` (comentario), `:69`
- Modify: `v2/apps/web/src/pages/ElMapa/sections/PanelSoltarVoz.tsx:127-132`
- Modify: `v2/apps/web/src/pages/ElMandatoVivo/sections/DocumentoSecciones.tsx:159`
- Modify: `v2/apps/web/src/pages/ElMandatoVivo/sections/DocumentoMandato.tsx:64`
- Modify: `v2/apps/web/src/pages/ElMandatoVivo/sections/MarcoAnexo.tsx:89`
- Modify: `v2/apps/web/src/pages/LaIdea/sections/CapituloMetodo.tsx:70`
- Modify: `v2/apps/web/src/pages/PracticaDetail.tsx:185`
- Modify: `v2/apps/web/src/pages/Sembrar/sections/CertificadoSemilla.tsx:124`
- Modify (tests): `primitives/primitives.test.tsx:53`, `ElMapa/sections/__tests__/MapaArgentina.test.tsx:66,78`, `ElMandatoVivo/sections/__tests__/DocumentoMandato.test.tsx:160`, `LaIdea/sections/__tests__/CapituloMetodo.test.tsx:23`, `Sembrar/__tests__/CertificadoSemilla.test.tsx:82,103`, `pages/__tests__/PracticaDetail.test.tsx:217,233`, `pages/__tests__/PropuestaDetail.test.tsx:117,167`, `pages/__tests__/PulsoDetail.test.tsx:87`

**Interfaces:**
- Consumes: `GlifoCursor`, `GlifoDespliegue`, `GlifoMenu`, `GlifoReintentar`, `GlifoTilde` de `~/components/papel/primitives` (Tarea 13).
- Produces: cero glifos rotos **renderizados** en el chrome papel. Quedan fuera a propósito cuatro ocurrencias: `Desafios.tsx:86` (un `✓` de las 32 rutas legado, se pinta en Inter y la borra ②) y tres dentro de comentarios (`PropuestaDetail.tsx:79`, `PreguntaPractica.tsx:85` y `:86`), que no llegan al DOM. Están tabuladas en el Paso 1 y el grep de control del Paso 4 espera exactamente esas cuatro.

- [ ] **Paso 1: Ver los once sitios**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && grep -rn '✕\|☰\|▌\|▾\|↺\|✓' apps/web/src --include='*.tsx' | grep -v '__tests__' | grep -v '\.test\.' | grep -v 'primitives/Glifos.tsx'
```
Esperado: **diecisiete** líneas. (Sin el `grep -v '\.test\.'` son dieciocho: `components/papel/primitives/primitives.test.tsx:53` **no** lo filtra el `grep -v '__tests__'`, porque ese archivo no vive en un directorio `__tests__/` sino al lado del componente. Ese test lo actualiza el Paso 2.)

De las diecisiete, **trece** se tocan —son los once sitios de la lista de arriba, con
`BotonPapel` y `PopoverVoz` aportando dos líneas cada uno (código + comentario)— y
**cuatro se dejan a propósito**:

| línea | por qué se deja |
|---|---|
| `pages/Desafios.tsx:86` | un `✓` de una de las 32 rutas legado: se pinta en Inter y la borra ② |
| `pages/PropuestaDetail.tsx:79` | el glifo está dentro de un **comentario** (`el botón en vuelo muestra su estado cargando (— ▌)`), no se renderiza |
| `pages/Entrenamientos/sections/PreguntaPractica.tsx:85` | comentario: cita el catálogo viejo de §12 |
| `pages/Entrenamientos/sections/PreguntaPractica.tsx:86` | comentario: explica por qué el `✓` no está en el catálogo — sigue siendo cierto |

Los tres comentarios de `PropuestaDetail` y `PreguntaPractica` quedan porque describen
un comportamiento que no cambia; el del `BotonPapel` y el del `PopoverVoz` sí se
actualizan porque nombran el glifo exacto que este paso reemplaza.

- [ ] **Paso 2: Actualizar los tests primero (van a fallar)**

`apps/web/src/components/papel/primitives/primitives.test.tsx`, línea 53, reemplazar:

```tsx
    expect(btn).toHaveTextContent('▌');
```

por:

```tsx
    expect(btn.querySelector('[data-glifo="cursor"]')).not.toBeNull();
```

`apps/web/src/pages/LaIdea/sections/__tests__/CapituloMetodo.test.tsx`, línea 23, reemplazar:

```tsx
    expect(screen.getByText('↺')).toBeInTheDocument();
```

por:

```tsx
    expect(document.querySelector('[data-glifo="reintentar"]')).not.toBeNull();
```

`apps/web/src/pages/ElMandatoVivo/sections/__tests__/DocumentoMandato.test.tsx`, línea 160: `name: 'Probar de nuevo ↺'` → `name: 'Probar de nuevo'`.

`apps/web/src/pages/__tests__/PulsoDetail.test.tsx`, línea 87: `name: 'Probar de nuevo ↺'` → `name: 'Probar de nuevo'`.

`apps/web/src/pages/__tests__/PropuestaDetail.test.tsx`, línea 117: `name: 'Probar de nuevo ↺'` → `name: 'Probar de nuevo'`. Línea 167, en la descripción del `it`: `(— ▌, aria-busy)` → `(— cursor, aria-busy)`.

`apps/web/src/pages/__tests__/PracticaDetail.test.tsx`, línea 217, en la descripción: `"Empezar de nuevo ↺"` → `"Empezar de nuevo"`. Línea 233: `name: 'Empezar de nuevo ↺'` → `name: 'Empezar de nuevo'`. Las líneas 175-179 (el comentario sobre el `✓` fuera del catálogo y `expect(fieldset.textContent).not.toContain('✓')`) **no se tocan**: siguen siendo ciertas y ahora más, porque el `✓` dejó de ser texto.

`apps/web/src/pages/Sembrar/__tests__/CertificadoSemilla.test.tsx`, línea 82, en la descripción: `muta a ✓ Copiada` → `muta a «Copiada» con tilde`. Línea 103: `name: '✓ Copiada'` → `name: 'Copiada'`.

`apps/web/src/pages/ElMapa/sections/__tests__/MapaArgentina.test.tsx`, líneas 66 y 78, en las descripciones: `«✕»` → `«×»` (las dos queries usan `name: 'Cerrar'`, que sale del `aria-label`, así que no cambian).

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web test:unit`
Esperado: FALLA — los tests actualizados en rojo (los botones todavía se llaman «Probar de nuevo ↺», el `▌` todavía es texto).

- [ ] **Paso 3: El swap**

`components/papel/PapelHeader.tsx` — agregar `GlifoMenu` al import de primitivas (o crear el import si no existe: `import { GlifoMenu } from '~/components/papel/primitives';`) y reemplazar la línea 103:

```tsx
            {menuOpen ? 'Cerrar ✕' : 'Menú ☰'}
```

por:

```tsx
            {menuOpen ? 'Cerrar ×' : <>Menú <GlifoMenu /></>}
```

`components/papel/MenuBiblioteca.tsx` — importar `GlifoDespliegue` y reemplazar las líneas 81-83:

```tsx
        <span aria-hidden className={cn('text-[10px]', abierto && 'text-violeta')}>
          ▾
        </span>
```

por:

```tsx
        <GlifoDespliegue className={cn('text-[10px]', abierto && 'text-violeta')} />
```

`components/papel/primitives/BotonPapel.tsx` — importar `GlifoCursor` desde `./Glifos` (no desde el barril: es un hermano, y el barril lo importa a él) y reemplazar la línea 90:

```tsx
              — <span className="anim-blink-cursor">▌</span>
```

por:

```tsx
              — <GlifoCursor className="anim-blink-cursor" />
```

En el mismo archivo, línea 50 del comentario del componente: `cargando = texto reemplazado por «— ▌» con blink-cursor` → `cargando = texto reemplazado por «— » + GlifoCursor con blink-cursor`.

`pages/ElMapa/sections/PopoverVoz.tsx` — reemplazar la línea 69 `          ✕` por `          ×`, y en el comentario de la línea 27, `Foco al «✕» al abrir` → `Foco al «×» al abrir`.

`pages/ElMapa/sections/PanelSoltarVoz.tsx` — importar `GlifoDespliegue` y reemplazar las líneas 127-132:

```tsx
          <span
            aria-hidden
            className="font-space text-tinta-50 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px]"
          >
            ▾
          </span>
```

por:

```tsx
          <GlifoDespliegue className="text-tinta-50 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px]" />
```

`pages/ElMandatoVivo/sections/DocumentoSecciones.tsx` — importar `GlifoCursor` y reemplazar la línea 159:

```tsx
        La siguiente la escribís vos <span className="text-violeta anim-blink-cursor">▌</span>
```

por:

```tsx
        La siguiente la escribís vos <GlifoCursor className="text-violeta anim-blink-cursor" />
```

`pages/ElMandatoVivo/sections/DocumentoMandato.tsx` línea 64, `pages/ElMandatoVivo/sections/MarcoAnexo.tsx` línea 89 — importar `GlifoReintentar` y reemplazar en los dos:

```tsx
          Probar de nuevo ↺
```

por:

```tsx
          Probar de nuevo <GlifoReintentar />
```

`pages/LaIdea/sections/CapituloMetodo.tsx` — importar `GlifoReintentar` y reemplazar la línea 70:

```tsx
          <span className="font-space text-tinta-30 text-sm">↺</span>
```

por:

```tsx
          <GlifoReintentar className="text-tinta-30 text-sm" />
```

`pages/PracticaDetail.tsx` — importar `GlifoReintentar` y reemplazar la línea 185:

```tsx
                    Empezar de nuevo ↺
```

por:

```tsx
                    Empezar de nuevo <GlifoReintentar />
```

`pages/Sembrar/sections/CertificadoSemilla.tsx` — importar `GlifoTilde` y reemplazar la línea 124:

```tsx
            {copiada ? '✓ Copiada' : 'Copiar para compartir'}
```

por:

```tsx
            {copiada ? (
              <>
                <GlifoTilde /> Copiada
              </>
            ) : (
              'Copiar para compartir'
            )}
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web test:unit && pnpm verify`
Esperado: PASA — la suite entera en verde.

Control final:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && grep -rn '✕\|☰\|▌\|▾\|↺\|✓' apps/web/src --include='*.tsx' | grep -v '__tests__' | grep -v '\.test\.' | grep -v 'primitives/Glifos.tsx'
```
Esperado: **cuatro** líneas, exactamente las cuatro de la tabla del Paso 1 —
`pages/Desafios.tsx:86` (legado), `pages/PropuestaDetail.tsx:79` y
`pages/Entrenamientos/sections/PreguntaPractica.tsx:85-86` (comentarios). Cualquier
quinta línea es un sitio que se olvidó de swapear.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/src
git commit -m "fix(web): el chrome papel deja de depender de la fuente de símbolos del sistema"
```

---

### Tarea 15: B3 — la marca de la pestaña es la de v2

**Files:**
- Create: `v2/scripts/build/marca.ts`
- Create: `v2/scripts/build/build-marca.ts`
- Create: `v2/scripts/build/__tests__/marca.test.ts`
- Modify (reemplazo total): `v2/apps/web/public/favicon.svg`
- Create (generados y commiteados): `v2/apps/web/public/favicon.ico`, `apple-touch-icon.png`, `icono-192.png`, `icono-512.png` (**no** `og/default.png`: lo emite B9 — ver la nota de coordinación)
- Create: `v2/apps/web/public/site.webmanifest`
- Modify: `v2/apps/web/index.html` (tres `<link>` nuevos en el `<head>`)
- Modify: `v2/package.json` (script `marca:build`)

**Interfaces:**
- Consumes: `chromium` de `@playwright/test`. (Ya **no** consume `/fonts/anton-v1.woff2`: esa dependencia venía de la card OG, que pasó a B9.)
- Produces: `SVG_FAVICON`, `MEDIDAS`, `envolverIco()` de `scripts/build/marca.ts`.
- **Nota de coordinación con B9: `og/default.png` tiene un solo dueño, y no es este plan.** La versión anterior de esta tarea lo rasterizaba con el Chromium de Playwright a partir de una plantilla HTML/CSS, y B9 lo regenera con satori a partir de «la misma composición». Dos motores de layout no producen el mismo PNG: el archivo commiteado cambiaría de aspecto según cuál script corrió último, con la composición duplicada en dos módulos que nadie sincroniza. Lo emite **B9** (`build-og-cards.ts`), como una entrada más de su catálogo. No hay hueco: el único consumidor es `OG_POR_DEFECTO = '/og/default.png'` en `sellar-head.ts`, y B11 depende de B9. La fila B3 de «Orden de trabajo» de la spec, que hoy le adjudica `og/default.png` a este bloque, queda corregida por esta nota.

- [ ] **Paso 1: Escribir el test que falla**

Crear `scripts/build/__tests__/marca.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { MEDIDAS, SVG_FAVICON, envolverIco } from '../marca';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');

/** Cabecera PNG: \x89 P N G \r \n \x1a \n. */
const CABECERA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('SVG_FAVICON', () => {
  it('es el «¡» violeta sobre papel, no el círculo de v1', () => {
    expect(SVG_FAVICON).toContain('#5227CC');
    expect(SVG_FAVICON).toContain('#F2EFE7');
    // Los tres tokens que la tarea 7.3 del master plan manda borrar.
    expect(SVG_FAVICON).not.toContain('#7D5BDE');
    expect(SVG_FAVICON).not.toContain('#0a0a0a');
    expect(SVG_FAVICON).not.toContain('#F5F7FA');
  });

  it('el punto del «¡» va arriba y el palo abajo', () => {
    // Se parean `y` y `height` del mismo `<rect>`: el punto es el rect bajo
    // (height 5) y el palo el alto (height 16). Comparar sólo el mínimo y el
    // máximo de todos los `y` es una tautología —siempre da 4 < 12, incluso si
    // alguien invierte el dibujo y escribe un `!` en vez de un `¡`, que es
    // justo lo que este caso existe para impedir.
    const medida = (rect: string, attr: 'y' | 'height'): number => {
      const encontrado = new RegExp(`${attr}="(\\d+(?:\\.\\d+)?)"`).exec(rect);
      return encontrado?.[1] === undefined ? Number.NaN : Number(encontrado[1]);
    };
    const rects = [...SVG_FAVICON.matchAll(/<rect[^>]*>/g)].map((m) => m[0]);
    const alturaDe = (alto: number): number => {
      const rect = rects.find((r) => medida(r, 'height') === alto);
      return rect === undefined ? Number.NaN : medida(rect, 'y');
    };

    const punto = alturaDe(5);
    const palo = alturaDe(16);

    expect(Number.isNaN(punto)).toBe(false);
    expect(Number.isNaN(palo)).toBe(false);
    expect(punto).toBeLessThan(palo);
  });
});

describe('MEDIDAS', () => {
  it('cubre el .ico, el apple-touch y los dos iconos del manifest', () => {
    expect(MEDIDAS.map((m) => m.salida)).toEqual([
      'favicon-32.png',
      'apple-touch-icon.png',
      'icono-192.png',
      'icono-512.png',
    ]);
    expect(MEDIDAS.map((m) => m.lado)).toEqual([32, 180, 192, 512]);
  });
});

describe('envolverIco', () => {
  const png = Buffer.concat([CABECERA_PNG, Buffer.alloc(40, 7)]);

  it('emite un ICONDIR de un solo icono', () => {
    const ico = envolverIco(png, 32);

    expect(ico.readUInt16LE(0)).toBe(0); // reservado
    expect(ico.readUInt16LE(2)).toBe(1); // tipo: icono
    expect(ico.readUInt16LE(4)).toBe(1); // cantidad
  });

  it('la entrada del directorio describe el PNG que lleva adentro', () => {
    const ico = envolverIco(png, 32);

    expect(ico.readUInt8(6)).toBe(32); // ancho
    expect(ico.readUInt8(7)).toBe(32); // alto
    expect(ico.readUInt16LE(10)).toBe(1); // planos
    expect(ico.readUInt16LE(12)).toBe(32); // bits por pixel
    expect(ico.readUInt32LE(14)).toBe(png.length);
    expect(ico.readUInt32LE(18)).toBe(22); // offset: 6 + 16
  });

  it('el PNG viaja entero e intacto', () => {
    const ico = envolverIco(png, 32);

    expect(ico.subarray(22)).toEqual(png);
    expect(ico.length).toBe(22 + png.length);
  });

  it('un lado de 256 se codifica como 0, que es lo que manda el formato', () => {
    expect(envolverIco(png, 256).readUInt8(6)).toBe(0);
  });
});

describe('lo que queda commiteado en public/', () => {
  it('el manifest apunta a los iconos que el build emite', () => {
    const manifest = JSON.parse(
      readFileSync(join(raizV2, 'apps/web/public/site.webmanifest'), 'utf8'),
    ) as { icons: { src: string }[]; theme_color: string; lang: string };

    expect(manifest.icons.map((i) => i.src)).toEqual([
      '/icono-192.png',
      '/icono-512.png',
      '/apple-touch-icon.png',
    ]);
    expect(manifest.theme_color).toBe('#F2EFE7');
    expect(manifest.lang).toBe('es-AR');
  });

  it('el .ico y los PNG existen y son lo que dicen ser', () => {
    // `og/default.png` NO está en esta lista: lo emite B9 con satori, que es su
    // único dueño. Ver la nota de coordinación de esta tarea.
    for (const nombre of ['apple-touch-icon.png', 'icono-192.png', 'icono-512.png']) {
      const bytes = readFileSync(join(raizV2, 'apps/web/public', nombre));
      expect(bytes.subarray(0, 8)).toEqual(CABECERA_PNG);
    }

    const ico = readFileSync(join(raizV2, 'apps/web/public/favicon.ico'));
    expect(ico.readUInt16LE(2)).toBe(1);
  });

  it('el shell enlaza el manifest, el apple-touch y el .ico de respaldo', () => {
    const shell = readFileSync(join(raizV2, 'apps/web/index.html'), 'utf8');

    expect(shell).toContain('<link rel="manifest" href="/site.webmanifest" />');
    expect(shell).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />');
    expect(shell).toContain('<link rel="alternate icon" href="/favicon.ico" />');
    // Un solo `rel="icon"`: si el reemplazo del Paso 3 se aplicó al lado de la línea
    // vieja en vez de encima, quedan dos y el navegador elige el que quiere.
    // (`rel="alternate icon"` no matchea este patrón.)
    expect(shell.match(/rel="icon"/gu)).toHaveLength(1);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm test:scripts`
Esperado: FALLA con `Failed to resolve import "../marca"`.

- [ ] **Paso 3: Implementación mínima**

Crear `scripts/build/marca.ts`:

```ts
/**
 * La marca de v2 en `public/`: favicon «¡» violeta sobre papel, sus rasterizados
 * y la card OG por defecto. El favicon servido hoy es el de v1 —círculo #0a0a0a
 * con trazo #7D5BDE— o sea el token que la tarea 7.3 del master plan manda
 * borrar. El problema nunca fue que faltara: devolvía 200. Era de identidad.
 *
 * El favicon y la card OG comparten el dibujo del «¡»: se hacen juntos para no
 * dibujarlo dos veces.
 */

/** 32×32. Punto arriba, palo abajo: así se escribe el signo de apertura. */
export const SVG_FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#F2EFE7"/>
  <rect x="13.5" y="4" width="5" height="5" fill="#5227CC"/>
  <rect x="13.5" y="12" width="5" height="16" fill="#5227CC"/>
</svg>
`;

export interface MedidaDeMarca {
  readonly salida: string;
  readonly lado: number;
}

/**
 * `favicon-32.png` es un intermedio: se envuelve en `favicon.ico` y se borra.
 * Los otros tres se commitean tal cual.
 */
export const MEDIDAS: readonly MedidaDeMarca[] = [
  { salida: 'favicon-32.png', lado: 32 },
  { salida: 'apple-touch-icon.png', lado: 180 },
  { salida: 'icono-192.png', lado: 192 },
  { salida: 'icono-512.png', lado: 512 },
];

/**
 * ICO con un PNG adentro: 6 bytes de ICONDIR + 16 de ICONDIRENTRY + el PNG
 * entero. Es el camino sin dependencias — todo navegador que importa lo soporta
 * desde hace más de una década.
 */
export function envolverIco(png: Uint8Array, lado: number): Buffer {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // reservado
  cabecera.writeUInt16LE(1, 2); // 1 = icono
  cabecera.writeUInt16LE(1, 4); // una sola imagen

  const entrada = Buffer.alloc(16);
  // El formato codifica 256 como 0: un byte no llega a 256.
  entrada.writeUInt8(lado >= 256 ? 0 : lado, 0);
  entrada.writeUInt8(lado >= 256 ? 0 : lado, 1);
  entrada.writeUInt8(0, 2); // paleta: ninguna
  entrada.writeUInt8(0, 3); // reservado
  entrada.writeUInt16LE(1, 4); // planos
  entrada.writeUInt16LE(32, 6); // bits por pixel
  entrada.writeUInt32LE(png.length, 8);
  entrada.writeUInt32LE(22, 12); // offset = 6 + 16

  return Buffer.concat([cabecera, entrada, Buffer.from(png)]);
}

/*
 * Acá NO va la card OG. `og/default.png` lo emite `build-og-cards.ts` (B9) con
 * satori, y es su único dueño: dos motores de layout sobre «la misma composición»
 * dan dos PNG distintos según cuál script corrió último. Si alguna vez hace falta
 * un fallback antes de B9, se copia un placeholder — no se escribe una segunda
 * plantilla.
 */
```

Crear `scripts/build/build-marca.ts`:

```ts
/**
 * CLI de corrida manual: rasteriza la marca con el Chromium de Playwright (que ya
 * es devDependency de la raíz) y deja el resultado commiteado en `public/`.
 * Mismo patrón que `scripts/build/geo/`, cuya salida (`scripts/build/data/
 * argentina-provincias.geojson`) también está commiteada: el script no corre en
 * CI, corre a mano cuando cambia el dibujo.
 *
 * Run: pnpm marca:build
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

import { MEDIDAS, SVG_FAVICON, envolverIco } from './marca';

const AQUI = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(AQUI, '../../apps/web/public');

async function main(): Promise<void> {
  writeFileSync(join(PUBLIC, 'favicon.svg'), SVG_FAVICON);

  const navegador = await chromium.launch();

  // Iconos: el mismo SVG a cuatro tamaños.
  const pagina = await navegador.newPage();
  for (const medida of MEDIDAS) {
    await pagina.setViewportSize({ width: medida.lado, height: medida.lado });
    await pagina.setContent(
      `<body style="margin:0">${SVG_FAVICON.replace(
        '<svg ',
        `<svg width="${String(medida.lado)}" height="${String(medida.lado)}" `,
      )}</body>`,
    );
    const png = await pagina.screenshot({ omitBackground: false });
    writeFileSync(join(PUBLIC, medida.salida), png);
    process.stdout.write(`  ${medida.salida} (${String(png.length)} bytes)\n`);
  }

  // El .ico envuelve el PNG de 32 y el intermedio se borra.
  const png32 = join(PUBLIC, 'favicon-32.png');
  writeFileSync(join(PUBLIC, 'favicon.ico'), envolverIco(readFileSync(png32), 32));
  rmSync(png32);
  process.stdout.write('  favicon.ico\n');

  // `og/default.png` no sale de acá: es de B9 (satori). Un solo dueño por archivo.

  await navegador.close();
}

await main();
```

Crear `apps/web/public/site.webmanifest`:

```json
{
  "name": "¡BASTA!",
  "short_name": "¡BASTA!",
  "description": "El país lo diseña la gente. La ciudadanía diseña, el Estado administra, la política ejecuta.",
  "lang": "es-AR",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F2EFE7",
  "theme_color": "#F2EFE7",
  "icons": [
    { "src": "/icono-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icono-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ]
}
```

En `v2/package.json`, agregar a `scripts`:

```json
    "marca:build": "tsx scripts/build/build-marca.ts",
```

En `apps/web/index.html`, reemplazar la línea
`<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` —que la Tarea 12 dejó
inmediatamente **después** de `<meta charset="UTF-8" />` y **antes** del
`<meta name="viewport" …>`, igual que en el `index.html` de hoy— por estas cuatro, en
ese mismo lugar:

```html
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
```

- [ ] **Paso 4: Generar y correr los tests**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm exec playwright install chromium && pnpm marca:build && ls -la apps/web/public ; pnpm test:scripts && pnpm verify
```
Esperado: PASA — el CLI imprime cinco líneas (las cuatro medidas más el `.ico`); `public/` tiene `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icono-192.png`, `icono-512.png` y `site.webmanifest`; **no** queda `favicon-32.png` y **no** hay `og/`, que lo crea B9; los diez `it` de `marca.test.ts` en verde y `pnpm verify` verde. (Por eso el `ls` **no** lista `apps/web/public/og`: ese directorio todavía no existe, `ls` saldría con código 1 y una cadena `&&` se cortaría ahí, salteándose `pnpm test:scripts` y `pnpm verify`, que son las dos verificaciones que importan. De ahí también el `;` antes de `pnpm test:scripts`, la misma técnica que ya usa la Tarea 7, Paso 4.)

Verificación a ojo: abrir `apps/web/public/apple-touch-icon.png` y `icono-512.png` — el «¡» violeta sobre papel, centrado, con el punto arriba y el palo abajo, sin bordes negros. Y abrir el sitio en una pestaña: el favicon de la pestaña ya no es el círculo oscuro de v1.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/scripts/build/marca.ts v2/scripts/build/build-marca.ts \
        v2/scripts/build/__tests__/marca.test.ts v2/apps/web/public v2/apps/web/index.html \
        v2/package.json
git commit -m "feat(web): la marca de la pestaña es la de v2 — «¡» violeta sobre papel"
```

---

### Tarea 16: Cierre del plan A

**Files:** ninguno nuevo. Es la verificación de que las cuatro entregas conviven.

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: la constancia de que B7 (registro de rutas), B9 (OG), B11 (sellado) y B12 (prerender) pueden arrancar.

- [ ] **Paso 1: `pnpm verify` alcanzando a `scripts/`**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm verify`
Esperado: PASA — `lint` incluye `eslint scripts --max-warnings 0`; `type-check` incluye `tsc -p scripts/tsconfig.json`; `test` incluye `test:scripts` con los siete archivos de `scripts/build/__tests__/` (`proyeccion`, `enmiendas-documentales`, `deps`, `limpieza`, `fuentes`, `shell`, `marca`).

- [ ] **Paso 2: Las guardias nuevas**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm deps:check && pnpm planes:check && pnpm size`
Esperado: `Dependencias de producción OK: 35 de 45.`, el índice de planes OK, y los cuatro presupuestos de bundle en verde.

- [ ] **Paso 3: Cero terceros en el waterfall**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web build && pnpm --filter @v2/web preview --port 4173
```
Abrir `http://localhost:4173/planes/planeb` con la caché desactivada. En la pestaña Network, filtrar por dominio: **todo** tiene que salir de `localhost`. Cero `fonts.googleapis.com`, cero `fonts.gstatic.com`.

- [ ] **Paso 4: El `dist` no publica basura**

Comando:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && find apps/web/dist -name '.DS_Store' -o -name '*.map' | head
```
Esperado: sin salida.

- [ ] **Paso 5: Commit del estado (sólo si algo quedó por commitear)**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git status --short
```
Esperado: sin salida. Si aparece algo, es una salida generada que se olvidó de commitear en su tarea: agregarla al commit que corresponda con `git commit --amend` **sólo si no se pusheó**, o con un commit `chore(v2):` propio si ya se pusheó.
