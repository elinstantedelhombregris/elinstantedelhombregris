# El manifiesto y la bitácora (páginas 3.3 y 3.4) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `/manifiesto` en el lector insignia —apertura verbatim, {N} partes
ancladas con su sumario, edición impresa y el sello **LEÍDO ENTERO** que §10.5 reserva
para este documento— y construir la bitácora en `/bitacora` + `/bitacora/:slug`: índice
de {M} crónicas por año con pliegues, lector editorial con cadena cronológica, **URLs
reparadas sin que nada 404ee** y cero cifras inventadas. Muere el chrome v1-port de
`Blog.tsx`, `BlogPostDetail.tsx` y `Manifiesto.tsx`.

**Architecture:** Cero backend, cero dependencias, cero primitivas nuevas, cero CSS.
Todo build-time (`?raw` para el manifiesto, `import.meta.glob` eager para las crónicas).
Dos capas de derivación pura (`pages/Manifiesto/manifiesto-data.ts` con el parser del
documento; `pages/Bitacora/bitacora-data.ts` con años, vecinos y resolución de slugs) +
secciones finas + reescritura in-place de `Manifiesto.tsx` + páginas nuevas
`Bitacora.tsx` / `BitacoraDetail.tsx`. Una reparación de contenido (17 slugs) con su
función canónica en `@v2/shared` y su rastro en el frontmatter. Flip de rutas al final.

**Tech Stack:** React 18 + wouter + Tailwind (tokens papel §9b) + Vitest/Testing Library
+ Zod (`packages/shared`). Sin API, sin migraciones de DB, sin CSS nuevo.

**Spec:** `docs/specs/2026-07-24-manifiesto-y-bitacora-papel-y-tinta.md` — **todo el copy
sale de ahí, carácter por carácter.**

## Global Constraints

- `v2/CLAUDE.md` completo: sin `any`, sin `console.*`, archivos ≤ 300 LOC, `pnpm verify`
  verde antes de cada commit, Conventional Commits con scope.
- `docs/design-system/README.md` v1.1 es ley. §9b: PROHIBIDO el hex literal en TSX.
  **Este plan no enmienda la ley** (spec, «Enmiendas a la ley»).
- **Keystone verbatim:** el cuerpo del manifiesto y los 22 cuerpos de `content/blog/*.mdx`
  se renderizan tal cual. La reparación de slugs (Task 4) toca **frontmatter y nombre de
  archivo, nunca el cuerpo** — el test lo prueba comparando el cuerpo antes/después.
- **Cero literales de conteo en JSX:** «8», «22», «21» se interpolan desde las derivadas.
- **Cero cifras de post** (vistas/likes/comentarios): no existen filas en `blog_posts` y
  la API direcciona por `id` numérico (spec, decisión 12).
- Una conversación = dos páginas hermanas: NO tocar `Home/*`, `LaIdea/*`, `ElMapa/*`,
  `ElMandatoVivo/*`, `Planes/*`, `Sembrar/*`, `EnsayoDetail.tsx`, `MdxContent.tsx`,
  `index.css` ni el chrome papel. **Excepciones sancionadas** (spec, «Rutas, redirects y
  resolución de slugs»): `apps/web/src/App.tsx` (T8) · `apps/web/src/layouts/papel-routes.ts`
  (+ su test, T8) · `apps/web/src/pages/Biblioteca/biblioteca-data.ts` **solo las dos
  constantes `HREF_BITACORA`/`hrefCronica`** (+ su test, T8) · `packages/shared/src/content/`
  (T4) · `apps/web/src/lib/blog-registry.ts` (+ su test, T4) · `scripts/content/*` (T4).
- **Estado interino aceptado:** entre T2 y T8, `/manifiesto` y `/bitacora` existen con
  chrome v1. El flip llega al final (orden 2.3/2.4/2.5/3.1).
- **El patrón de impresión NO se re-deriva:** `.edicion-impresa` vive en `index.css` y el
  chrome ya lleva `print:hidden` desde 2.4. Este plan aplica la clase, el folio y los
  `print:hidden` locales — `index.css` y el chrome no aparecen en ningún `git add`.
- **La mecánica del sello NO se inventa:** se copia el `IntersectionObserver` del `VISTO`
  (`pages/ElMandatoVivo/sections/DocumentoMandato.tsx:18-31`) y su harness de test
  (`ElMandatoVivo/sections/__tests__/DocumentoMandato.test.tsx:19-47`).
- **`fechaLarga` se duplica a propósito** en cada módulo de datos (3 líneas): importarla
  de `pages/Biblioteca/biblioteca-data` arrastraría `ENSAYOS` (21 cuerpos) al chunk del
  manifiesto. Va con comentario que lo dice.

---

### Task 1: `manifiesto-data.ts` — el documento partido por sus propias costuras

**Files:**
- Create: `apps/web/src/pages/Manifiesto/manifiesto-data.ts`
- Test: `apps/web/src/pages/Manifiesto/__tests__/manifiesto-data.test.ts`

**Interfaces:**
- Consumes: `content/manifiesto/manifiesto.mdx?raw` · `stripFrontmatter` (`~/lib/markdown`).
- Produces: `parsearManifiesto()` (pura, exportada para testear formas sintéticas),
  `MANIFIESTO`, `PARTE_COUNT`, `ParteManifiesto`, `fechaLarga()`. Los consumen T2 y T3.

- [ ] **Step 1: Tests (fallan primero).** `manifiesto-data.test.ts` — cero literales de
  contenido salvo los del propio documento cuando son la aserción (título):
  - **Verbatim, por igualdad de strings:**
    `MANIFIESTO.apertura + MANIFIESTO.partes.map(p => p.fuente).join('')` es exactamente
    el cuerpo sin frontmatter y sin la línea del `# ` (recomputado en el test desde el
    `?raw` con la misma `stripFrontmatter`).
  - **Título izado:** `MANIFIESTO.titulo` no vacío y **no** aparece un `# ` en
    `apertura` ni en ninguna `fuente`.
  - **Partes:** `PARTE_COUNT === MANIFIESTO.partes.length` y `> 0`; cada `fuente` empieza
    con `'## '`; cada `cuerpo` **no** contiene su encabezado; los `numero` son
    estrictamente crecientes y los `id` únicos.
  - **Ids:** para una parte numerada, `id === 'parte-' + numero`.
  - **Degradación (parser puro, string sintético):** `parsearManifiesto('# T\n\nsolo prosa\n')`
    → `partes` vacío, `apertura` con la prosa entera, `titulo === 'T'`; un string **sin**
    `# ` → `titulo === ''` y la prosa completa en `apertura`; un `## Sin número` →
    `numero === null` e `id === 'parte-p1'`.
  - **Fecha:** `fechaLarga` se compara contra el mismo `Intl` computado en el test (nunca
    contra un literal — el ICU del runner manda); ISO inválido → `''`.

Run: `pnpm -C apps/web exec vitest run src/pages/Manifiesto`
Esperado: FAIL — módulo inexistente.

- [ ] **Step 2: Implementar `manifiesto-data.ts`:**

```ts
// MDX crudo vía `?raw` (mismo mecanismo que usaba la página v1-port).
import manifiestoRaw from '../../../../../content/manifiesto/manifiesto.mdx?raw';

import { stripFrontmatter } from '~/lib/markdown';

/**
 * El manifiesto (spec 3.3) — el texto se parte por SUS costuras: el `# ` se
 * iza a H1 de página y cada `## ` es una parte con ancla propia. Nada se
 * reescribe: `apertura` + las `fuente` de las partes reconstruyen el cuerpo
 * carácter por carácter, y el test lo prueba por igualdad de strings.
 */
export interface ParteManifiesto {
  /** Número declarado por el propio texto («## 3. …» → 3). `null` si no numera. */
  numero: number | null;
  /** El encabezado TAL CUAL, sin renumerar ni retitular. */
  encabezado: string;
  /** La parte sin su línea de encabezado — lo que se pasa a MdxPapel. */
  cuerpo: string;
  /** Trozo crudo, encabezado incluido: la garantía de verbatim. */
  fuente: string;
  /** Ancla estable del sumario: «parte-3» (o «parte-p3» si el texto no numera). */
  id: string;
}

export interface ManifiestoParseado {
  titulo: string;
  apertura: string;
  partes: readonly ParteManifiesto[];
}

export function parsearManifiesto(raw: string): ManifiestoParseado {
  const cuerpo = stripFrontmatter(raw);
  const h1 = /^# (.+)\n?/.exec(cuerpo);
  const titulo = (h1?.[1] ?? '').trim();
  const resto = h1 ? cuerpo.slice(h1[0].length) : cuerpo;

  const encabezados = [...resto.matchAll(/^## (.+)$/gm)];
  const primero = encabezados[0];
  if (!primero) return { titulo, apertura: resto, partes: [] };

  const partes = encabezados.map((m, i) => {
    const desde = m.index ?? 0;
    const hasta = encabezados[i + 1]?.index ?? resto.length;
    const fuente = resto.slice(desde, hasta);
    const encabezado = (m[1] ?? '').trim();
    const numerado = /^(\d+)\./.exec(encabezado);
    const numero = numerado?.[1] === undefined ? null : Number(numerado[1]);
    return {
      numero,
      encabezado,
      cuerpo: fuente.slice(m[0].length),
      fuente,
      id: numero === null ? `parte-p${String(i + 1)}` : `parte-${String(numero)}`,
    };
  });

  return { titulo, apertura: resto.slice(0, primero.index ?? 0), partes };
}

export const MANIFIESTO: ManifiestoParseado = parsearManifiesto(manifiestoRaw);
export const PARTE_COUNT = MANIFIESTO.partes.length;

/**
 * Fecha larga es-AR para el folio impreso. Duplicada a propósito (existe
 * otra igual en `pages/Biblioteca/biblioteca-data`): importarla de ahí
 * arrastraría los 21 ensayos al chunk de esta página.
 */
export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}
```

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/Manifiesto` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/Manifiesto/manifiesto-data.ts \
        apps/web/src/pages/Manifiesto/__tests__/manifiesto-data.test.ts
git commit -m "feat(web): el manifiesto — parser de partes con verbatim probado por igualdad"
```

---

### Task 2: El lector del manifiesto — sumario, partes ancladas y edición impresa

**Files:**
- Create: `apps/web/src/pages/Manifiesto/sections/DocumentoManifiesto.tsx`
- Create: `apps/web/src/pages/Manifiesto/sections/SumarioManifiesto.tsx`
- Create: `apps/web/src/pages/Manifiesto/sections/CierreManifiesto.tsx`
- Rewrite: `apps/web/src/pages/Manifiesto.tsx` (named + default export intactos)
- Test: `apps/web/src/pages/__tests__/Manifiesto.test.tsx`

**Interfaces:**
- Consumes: `MANIFIESTO`, `PARTE_COUNT`, `fechaLarga` (T1) · `MdxPapel` (2.4) · `Kicker`,
  `RitoTinta`, `BotonPapel` · `Link` de wouter.
- Produces: `/manifiesto` en papel (sin sello todavía — T3) con la ruta intacta.

- [ ] **Step 1: Tests (fallan primero).** `Manifiesto.test.tsx` (render dentro de
  `<Router>` de wouter, patrón de `Biblioteca.test.tsx`):
  - heading nivel 1 con `aria-label` igual a `MANIFIESTO.titulo`; kicker
    `El manifiesto · documento fundacional · ${PARTE_COUNT} partes`.
  - backlink `← La biblioteca` con `href="/biblioteca"`.
  - **apertura verbatim:** un fragmento real de `MANIFIESTO.apertura` (los primeros ~40
    caracteres de su primer párrafo, computados en el test) está en el documento.
  - **sumario:** un `<nav>` con `PARTE_COUNT` links cuyo `href` es `#${parte.id}` y cuyo
    texto contiene el `encabezado` de cada parte; línea `El recorrido · ${PARTE_COUNT} partes`.
  - **partes:** `PARTE_COUNT` headings nivel 2 con los encabezados **verbatim**; cada
    `<section>` tiene el `id` derivado.
  - **impresión:** el `<article>` lleva `edicion-impresa`; el folio
    `¡BASTA! · edición del lector ·` está en el DOM con `hidden`+`print:block`; backlink,
    sumario y cierre llevan `print:hidden`; el H1 lleva `print:[&_span]:animate-none`.
  - firma `— El hombre gris`; cierre con
    `El manifiesto no te pide que lo firmes. Te pide que lo hagas.` y link
    `Soltar mi voz en el mapa →` a `/el-mapa`.
  - **chrome muerto:** sin `glass`, `gradient-text`, `iris-violet`, `font-serif` ni
    `MdxContent` en `container.innerHTML`.
  - **cero cifras inventadas:** `queryByText(/minutos|min de lectura/i)` es null (spec,
    Decisión 7).

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Manifiesto.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar las secciones** — copy verbatim de la spec, «Página 3.3».

`SumarioManifiesto.tsx` — la receta de fila de índice §5 compuesta inline con `<a>`
**nativos** (la primitiva `FilaIndice` envuelve el `Link` de wouter y enrutaría en vez
de anclar; spec, Decisión 5):

```tsx
import { MANIFIESTO, PARTE_COUNT } from '../manifiesto-data';

/** Sumario §5 (spec 3.3): ancla nativa por parte. No se imprime: es navegación. */
export function SumarioManifiesto() {
  if (PARTE_COUNT === 0) return null;
  return (
    <nav aria-label="Las partes del manifiesto" className="mt-10 print:hidden">
      <p className="font-space text-tinta-50 mb-2 text-[11px] uppercase tracking-[0.16em]">
        El recorrido · {PARTE_COUNT} partes
      </p>
      {MANIFIESTO.partes.map((parte, i) => (
        <a
          key={parte.id}
          href={`#${parte.id}`}
          className="border-papel-borde hover:bg-papel-presionado text-tinta grid grid-cols-[56px_1fr_40px] items-baseline gap-5 border-b px-2 py-4 transition-colors duration-150 max-[560px]:grid-cols-[44px_1fr_32px]"
        >
          <span className="font-space text-tinta-30 text-sm">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="text-[17px] leading-snug">{parte.encabezado}</span>
          <span className="font-space text-tinta-50 justify-self-end">→</span>
        </a>
      ))}
    </nav>
  );
}
```

`DocumentoManifiesto.tsx` — el `<article>` completo (T3 le suma el sello):

```tsx
import { MANIFIESTO, PARTE_COUNT, fechaLarga } from '../manifiesto-data';

import { SumarioManifiesto } from './SumarioManifiesto';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { Kicker, RitoTinta } from '~/components/papel/primitives';

/**
 * El documento (spec 3.3). Cuerpo VERBATIM: la apertura y cada parte salen
 * del parser, que reconstruye el archivo carácter por carácter. El H1 es el
 * `# ` del propio texto, izado para que corra el rito §10.1 sin duplicar
 * título (la diferencia con `PlanDetail`).
 */
export function DocumentoManifiesto() {
  return (
    <article className="edicion-impresa">
      <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
        ¡BASTA! · edición del lector · {fechaLarga(new Date().toISOString())}
      </p>
      <Kicker className="mb-4 mt-10">
        El manifiesto · documento fundacional · {PARTE_COUNT} partes
      </Kicker>
      <h1
        aria-label={MANIFIESTO.titulo}
        className="font-anton riso-hover mb-7 text-pretty text-[clamp(36px,5.4vw,68px)] leading-none print:[&_span]:animate-none"
      >
        <RitoTinta lineas={[MANIFIESTO.titulo]} />
      </h1>

      <MdxPapel raw={MANIFIESTO.apertura} className="max-w-[680px] [&>*:first-child]:mt-0" />

      <SumarioManifiesto />

      {MANIFIESTO.partes.map((parte) => (
        <section key={parte.id} id={parte.id} className="border-tinta mt-12 scroll-mt-20 border-t-2 pt-[22px]">
          <h2 className="font-anton riso-hover mb-5 text-pretty text-[clamp(26px,3.4vw,40px)] leading-[1.05]">
            {parte.encabezado}
          </h2>
          <MdxPapel raw={parte.cuerpo} className="max-w-[680px] [&>*:first-child]:mt-0" />
        </section>
      ))}

      <p className="font-space text-tinta-50 mt-9 text-xs">— El hombre gris</p>
    </article>
  );
}
```

`CierreManifiesto.tsx` — card oscura dentro de la columna (patrón del cierre de 3.2),
`print:hidden`, con `BotonPapel asChild variant="violeta" surface="oscuro"` envolviendo
`<Link href="/el-mapa">Soltar mi voz en el mapa →</Link>`.

- [ ] **Step 3: Reescribir el composer `Manifiesto.tsx`:**

```tsx
import { Link } from 'wouter';

import { CierreManifiesto } from './Manifiesto/sections/CierreManifiesto';
import { DocumentoManifiesto } from './Manifiesto/sections/DocumentoManifiesto';

/**
 * El manifiesto — página 3.3 «Papel y Tinta»
 * (docs/specs/2026-07-24-manifiesto-y-bitacora-papel-y-tinta.md). Lector
 * editorial de 800px: texto keystone VERBATIM, sumario de partes ancladas,
 * edición impresa y el sello LEÍDO ENTERO al llegar a la firma (§10.5 —
 * el único documento al que la ley se lo reserva). El chrome lo pone
 * RootLayout.
 */
export function Manifiesto() {
  return (
    <main className="mx-auto max-w-[800px] px-10 pb-20 pt-12 max-[560px]:px-5 print:p-0">
      <Link
        href="/biblioteca"
        className="font-space text-tinta-50 hover:text-tinta text-xs uppercase tracking-[0.1em] print:hidden"
      >
        ← La biblioteca
      </Link>
      <DocumentoManifiesto />
      <CierreManifiesto />
    </main>
  );
}

export default Manifiesto;
```

- [ ] **Step 4: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Manifiesto.test.tsx src/pages/Manifiesto` → PASS.
`pnpm verify` verde.

```bash
git add apps/web/src/pages/Manifiesto.tsx \
        apps/web/src/pages/Manifiesto/sections/DocumentoManifiesto.tsx \
        apps/web/src/pages/Manifiesto/sections/SumarioManifiesto.tsx \
        apps/web/src/pages/Manifiesto/sections/CierreManifiesto.tsx \
        apps/web/src/pages/__tests__/Manifiesto.test.tsx
git commit -m "feat(web): lector del manifiesto — sumario de partes, cuerpo verbatim y edición impresa"
```

---

### Task 3: El sello LEÍDO ENTERO — la firma de la página (§10.5)

**Files:**
- Create: `apps/web/src/pages/Manifiesto/sections/SelloLeidoEntero.tsx`
- Modify: `apps/web/src/pages/Manifiesto/sections/DocumentoManifiesto.tsx` (ref + observer)
- Test: `apps/web/src/pages/__tests__/Manifiesto.test.tsx` (casos nuevos)

**Interfaces:**
- Consumes: `Sello` · `IntersectionObserver` (patrón `VISTO`, `DocumentoMandato.tsx:18-31`).
- Produces: el sello que cae **una vez**, al 60% de visibilidad del bloque de firma;
  efímero, sin persistencia, sin contador, sin imprimirse.

- [ ] **Step 1: Tests (fallan primero).** Copiar el `FakeIntersectionObserver` de
  `pages/ElMandatoVivo/sections/__tests__/DocumentoMandato.test.tsx:19-47` (con
  `vi.stubGlobal`) y agregar a `Manifiesto.test.tsx`:
  - antes de intersectar: `queryByText(/leído entero/i)` es null.
  - al disparar el observer con `isIntersecting: true`: aparece el sello `Leído entero`
    dentro de un contenedor `role="status"` y la línea
    `Llegaste al final. Ahora empieza la parte tuya.`
  - **una sola vez:** disparar `false` después de haber disparado `true` no lo borra; el
    observer queda desconectado (asserción sobre el `disconnect` del fake).
  - **no se imprime:** el contenedor del sello lleva `print:hidden`.
  - **no persiste:** después de desmontar y volver a montar, el sello **no** está antes
    de intersectar (y `localStorage` no tiene ninguna clave nueva: assert sobre
    `localStorage.length` igual antes y después).

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Manifiesto.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar `SelloLeidoEntero.tsx`** (presentacional puro):

```tsx
import { Sello } from '~/components/papel/primitives';

/**
 * Sello §10.5 — «manifiesto leído hasta el final → LEÍDO ENTERO». Verde,
 * como el VISTO del mandato (§2: verde = logrado). Efímero por decisión de
 * spec: no se guarda, no cuenta a nadie, no da XP y no se imprime — la
 * edición impresa es el documento, no la sesión.
 */
export function SelloLeidoEntero() {
  return (
    <div role="status" className="mt-8 flex flex-wrap items-center gap-4 print:hidden">
      <Sello color="verde" rotate={-4}>
        Leído entero
      </Sello>
      <span className="font-space text-tinta-50 text-xs">
        Llegaste al final. Ahora empieza la parte tuya.
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Cablear el observer en `DocumentoManifiesto.tsx`** — copia literal del
  patrón `VISTO` (el `<p>` de la firma recibe el `ref`; el sello se renderiza después del
  `</article>`, así que el componente devuelve un fragmento):

```tsx
const [visto, setVisto] = useState(false);
const firmaRef = useRef<HTMLParagraphElement>(null);

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
}, [visto]);
```

- [ ] **Step 4: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Manifiesto.test.tsx` → PASS.
`pnpm verify` verde.

```bash
git add apps/web/src/pages/Manifiesto/sections/SelloLeidoEntero.tsx \
        apps/web/src/pages/Manifiesto/sections/DocumentoManifiesto.tsx \
        apps/web/src/pages/__tests__/Manifiesto.test.tsx
git commit -m "feat(web): sello LEÍDO ENTERO al final del manifiesto (§10.5, efímero)"
```

---

### Task 4: Las URLs de la bitácora — 17 slugs reparados, cero 404

**Files:**
- Create: `packages/shared/src/content/slug.ts`
- Create: `packages/shared/src/content/__tests__/slug.test.ts`
- Modify: `packages/shared/src/content/index.ts` (export), `packages/shared/src/content/frontmatter.ts` (`legacySlugs`)
- Create: `scripts/content/repair-blog-slugs.ts` (one-shot)
- Modify: `content/blog/*.mdx` (17 renombrados + frontmatter; **cuerpos intactos**)
- Modify: `apps/web/src/lib/blog-registry.ts` + `apps/web/src/lib/__tests__/blog-registry.test.ts`
- Modify: `scripts/content/verify-blog-migration.ts`, `scripts/content/migrate-blog-v1-to-v2.ts` (nota de cierre)

**Interfaces:**
- Produces: `slugCanonico(titulo)` en `@v2/shared/content` · `legacySlugs` en el
  frontmatter y en `BlogPost` · `findBlogPostByLegacySlug(slug)`. Los consumen T5 y T7.

- [ ] **Step 1: Tests (fallan primero).**
  - `packages/shared/src/content/__tests__/slug.test.ts`: «¿Cuáles deberían ser nuestros
    parámetros?» → `cuales-deberian-ser-nuestros-parametros` · «Diseño Idealizado: La
    Argentina Posible» → `diseno-idealizado-la-argentina-posible` · «Sistemas vs.
    Síntomas: Cómo Pensar como Ingeniero Social» →
    `sistemas-vs-sintomas-como-pensar-como-ingeniero-social` · «El Cristo que llevás
    dentro» → `el-cristo-que-llevas-dentro` · idempotencia
    (`slugCanonico(slugCanonico(t)) === slugCanonico(t)`) · sin guiones sueltos en los
    bordes.
  - `apps/web/src/lib/__tests__/blog-registry.test.ts` (casos nuevos, **la regla se
    importa, no se copia**):
    - `for (const p of BLOG_POSTS) expect(p.slug).toBe(slugCanonico(p.title))` — el canon
      de las 22.
    - slugs únicos; `legacySlugs` kebab-case, distintos del slug y **disjuntos** del
      conjunto de slugs canónicos.
    - `findBlogPostByLegacySlug(legacy)` devuelve el post dueño; `('no-existe')` →
      `undefined`.
    - sigue habiendo 22 posts y todos con cuerpo no vacío.

Run: `pnpm -C packages/shared exec vitest run` y `pnpm -C apps/web exec vitest run src/lib/__tests__/blog-registry.test.ts`
Esperado: FAIL.

- [ ] **Step 2: `slugCanonico` + schema.**

```ts
/**
 * Slug canónico de un título en castellano.
 *
 * v1 slugificaba con `.replace(/[^\w\s-]/g, '')`, que en castellano **borra**
 * los acentos en vez de transliterarlos: «soberanía» → `soberana`. Esta
 * función hace lo mismo que v1 salvo por un paso previo — normaliza a NFD y
 * saca las marcas diacríticas — así que devuelve el mismo slug de siempre
 * con las letras que faltaban.
 */
export function slugCanonico(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // las marcas diacríticas que NFD separó
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

  En `frontmatter.ts`, dentro de `blogFrontmatterSchema`:

```ts
  /**
   * Direcciones viejas del post (el slug que produjo el slugify de v1, que
   * borraba los acentos). El lector redirige de estas al slug canónico: una
   * URL publicada nunca 404ea. Ver spec 3.4, decisiones 9 y 10.
   */
  legacySlugs: z.array(slugSchema).max(10).default([]),
```

- [ ] **Step 3: El script one-shot `scripts/content/repair-blog-slugs.ts`.** Para cada
  `content/blog/*.mdx`: lee `title` y `slug`; calcula `slugCanonico(title)`; si difiere,
  (a) reescribe la línea `slug:`, (b) inserta debajo el bloque
  `legacySlugs:\n  - <slug viejo>` (o suma el viejo si ya existiera el bloque),
  (c) renombra el archivo a `<slug nuevo>.mdx` con `renameSync`. Idempotente: si el slug
  ya es canónico no toca nada. Imprime el resumen `{cambiados}/{total}`.
  **El cuerpo no se toca**: la reescritura opera solo sobre el bloque de frontmatter.

Run: `./apps/api/node_modules/.bin/tsx scripts/content/repair-blog-slugs.ts`
Esperado: `cambiados=17 total=22`.

- [ ] **Step 4: Verificar que los cuerpos no cambiaron** (antes de stagear):

```bash
git stash --keep-index --include-untracked   # opcional; o comparar contra HEAD:
git diff --stat -- content/blog              # 17 archivos renombrados
git diff -M -- content/blog | grep -E "^[+-]" | grep -vE "^(\+\+\+|---)" | grep -vE "^[+-](slug|legacySlugs|  - )" 
# ^ debe salir VACÍO: los únicos cambios de línea son slug/legacySlugs.
```

- [ ] **Step 5: Registry + scripts históricos.**
  - `blog-registry.ts`: generalizar el parser de listas del frontmatter (hoy solo
    `tags:`) para aceptar también `legacySlugs:`; sumar `legacySlugs: readonly string[]`
    a `BlogPost` y exportar
    `findBlogPostByLegacySlug(slug): BlogPost | undefined`.
  - `verify-blog-migration.ts`: el chequeo «un archivo por slug de `BLOG_SOURCES`» pasa a
    resolver **por slug canónico o por `legacySlugs`** (el slug de v1 sigue siendo la
    clave histórica; ahora el script además verifica que el rastro exista).
  - `migrate-blog-v1-to-v2.ts`: nota de cabecera — «CERRADO: los slugs se repararon en
    3.4 (ver spec); volver a correr este script resucitaría los nombres viejos». Solo
    comentario, cero comportamiento.

- [ ] **Step 6: PASS + verificación + commit.**

Run: `pnpm -C packages/shared exec vitest run` · `pnpm -C apps/web exec vitest run src/lib` ·
`./apps/api/node_modules/.bin/tsx scripts/content/verify-blog-migration.ts` · `pnpm verify` verde.

```bash
git add packages/shared/src/content/slug.ts \
        packages/shared/src/content/__tests__/slug.test.ts \
        packages/shared/src/content/index.ts \
        packages/shared/src/content/frontmatter.ts \
        scripts/content/repair-blog-slugs.ts \
        scripts/content/verify-blog-migration.ts \
        scripts/content/migrate-blog-v1-to-v2.ts \
        content/blog \
        apps/web/src/lib/blog-registry.ts \
        apps/web/src/lib/__tests__/blog-registry.test.ts
git commit -m "fix(content): slugs de la bitácora con acentos transliterados + rastro legacySlugs"
```

---

### Task 5: `bitacora-data.ts` — años, cadena cronológica y resolución de slugs

**Files:**
- Create: `apps/web/src/pages/Bitacora/bitacora-data.ts`
- Test: `apps/web/src/pages/Bitacora/__tests__/bitacora-data.test.ts`

**Interfaces:**
- Consumes: `BLOG_POSTS`, `findBlogPost`, `findBlogPostByLegacySlug`, `BlogPost` (T4).
- Produces: `ANIOS`, `AnioBitacora`, `CRONICA_COUNT`, `DESDE`, `ubicarCronica()`,
  `resolverCronica()`, `numeroDeFila()`, `fechaLarga()`. Los consumen T6 y T7.

- [ ] **Step 1: Tests (fallan primero).** Cero literales de contenido: cada expectativa se
  computa desde `BLOG_POSTS`.
  - **Nada se pierde:** `ANIOS.flatMap(a => a.cronicas)` tiene `BLOG_POSTS.length`
    elementos y el mismo conjunto de slugs; `CRONICA_COUNT === BLOG_POSTS.length`.
  - **Agrupación:** cada grupo comparte año de `publishedAt`; los años vienen
    **descendentes**; dentro de cada grupo, `publishedAt` descendente.
  - **`DESDE`:** mes+año del `publishedAt` más viejo, comparado contra el mismo `Intl`
    computado en el test.
  - **Cadena:** `ubicarCronica(BLOG_POSTS[0].slug).anterior === null` (la más nueva);
    la última no tiene `siguiente`; para una del medio, `anterior`/`siguiente` son sus
    vecinos por índice; `ubicarCronica('no-existe')` es `null`.
  - **Resolución:** `resolverCronica(slug canónico)` → `{ estado: 'canonica', post }`;
    para un post con `legacySlugs`, `resolverCronica(legacy)` →
    `{ estado: 'legado', canonico }`; `resolverCronica('no-existe')` →
    `{ estado: 'desconocida' }`.

Run: `pnpm -C apps/web exec vitest run src/pages/Bitacora`
Esperado: FAIL.

- [ ] **Step 2: Implementar `bitacora-data.ts`:**

```ts
import {
  BLOG_POSTS,
  findBlogPost,
  findBlogPostByLegacySlug,
  type BlogPost,
} from '~/lib/blog-registry';

/**
 * La bitácora (spec 3.4). `BLOG_POSTS` ya viene por `publishedAt`
 * descendente: acá solo se agrupa por año —el eje real de una bitácora— y
 * se resuelven vecinos y direcciones viejas. Ningún conteo literal vive en
 * el JSX.
 */
export interface AnioBitacora {
  anio: string;
  cronicas: readonly BlogPost[];
}

function construirAnios(): AnioBitacora[] {
  const grupos = new Map<string, BlogPost[]>();
  for (const post of BLOG_POSTS) {
    const anio = post.publishedAt.slice(0, 4);
    const acumulado = grupos.get(anio) ?? [];
    acumulado.push(post);
    grupos.set(anio, acumulado);
  }
  return [...grupos.entries()]
    .map(([anio, cronicas]) => ({ anio, cronicas }))
    .sort((a, b) => (a.anio < b.anio ? 1 : a.anio > b.anio ? -1 : 0));
}

export const ANIOS: readonly AnioBitacora[] = construirAnios();
export const CRONICA_COUNT = BLOG_POSTS.length;

/** Fecha larga es-AR. Duplicada a propósito (ver Global Constraints). */
export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function mesYAnio(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

/** «desde {mes} de {año}»: la crónica más vieja de la colección. */
export const DESDE = mesYAnio(BLOG_POSTS.at(-1)?.publishedAt ?? '');

export interface UbicacionCronica {
  /** El vecino más reciente (arriba en el índice). */
  anterior: BlogPost | null;
  /** El vecino más antiguo (abajo en el índice). */
  siguiente: BlogPost | null;
}

export function ubicarCronica(slug: string): UbicacionCronica | null {
  const i = BLOG_POSTS.findIndex((p) => p.slug === slug);
  if (i < 0) return null;
  return { anterior: BLOG_POSTS[i - 1] ?? null, siguiente: BLOG_POSTS[i + 1] ?? null };
}

export type ResolucionCronica =
  | { estado: 'canonica'; post: BlogPost }
  | { estado: 'legado'; canonico: string }
  | { estado: 'desconocida' };

/**
 * Única puerta de entrada por slug: canónico → se lee; dirección vieja →
 * el lector redirige con `replace`; desconocido → 404 expediente.
 */
export function resolverCronica(slug: string): ResolucionCronica {
  const post = findBlogPost(slug);
  if (post) return { estado: 'canonica', post };
  const legado = findBlogPostByLegacySlug(slug);
  if (legado) return { estado: 'legado', canonico: legado.slug };
  return { estado: 'desconocida' };
}

/** Numeración de fila dentro del año: «01»… */
export function numeroDeFila(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}
```

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/Bitacora` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/Bitacora/bitacora-data.ts \
        apps/web/src/pages/Bitacora/__tests__/bitacora-data.test.ts
git commit -m "feat(web): la bitácora — agrupación por año, cadena cronológica y resolución de slugs"
```

---

### Task 6: El índice `/bitacora` — las crónicas por año con pliegues

**Files:**
- Create: `apps/web/src/pages/Bitacora/sections/PortadaBitacora.tsx`
- Create: `apps/web/src/pages/Bitacora/sections/IndiceCronicas.tsx`
- Create: `apps/web/src/pages/Bitacora/sections/CierreBitacora.tsx`
- Create: `apps/web/src/pages/Bitacora.tsx` (composer; named + default export)
- Test: `apps/web/src/pages/__tests__/Bitacora.test.tsx`

**Interfaces:**
- Consumes: `ANIOS`, `CRONICA_COUNT`, `DESDE`, `fechaLarga`, `numeroDeFila` (T5) ·
  `FilaIndiceExpandible`, `Kicker`, `RitoTinta`, `BotonPapel`, `BandaCta`.
- Produces: la página `/bitacora` completa (sin ruta todavía — el flip es T8).

- [ ] **Step 1: Tests (fallan primero).** `Bitacora.test.tsx` (render dentro de `<Router>`):
  - heading nivel 1 con `aria-label` `Acá se escribe mientras pasa.`; kicker
    `La bitácora · ${CRONICA_COUNT} crónicas · desde ${DESDE}`; backlink
    `← La biblioteca` a `/biblioteca`.
  - lead con `${CRONICA_COUNT} crónicas enteras` y cierre `Están en orden, pero se leen en cualquiera.`
  - un `<h2>` por año con `${anio} · ${n} crónicas` (singular cuando `n === 1`).
  - se renderizan `CRONICA_COUNT` botones de fila cerrados; la primera fila del primer
    año es `01` + el título de `ANIOS[0].cronicas[0]`, con su fecha y su `category` cruda.
  - **apertura única global:** abrir una fila muestra su `summary` entre comillas
    angulares y el link `Leer la crónica · {min} min →` con `href="/bitacora/{slug}"`;
    abrir una del último año cierra la anterior (un solo `aria-expanded="true"`); volver
    a tocarla la cierra.
  - **cero cifras de post:** `queryByText(/vistas|me gusta|comentarios|lecturas/i)` es
    null.
  - cierre `¿Y vos qué ves?` + link `Soltar mi voz en el mapa →` a `/el-mapa`.
  - **ausencia del v1:** sin `glass`, `gradient-text`, `iris-violet`, `font-serif` ni
    `Lo que vamos pensando juntos.` en `container.innerHTML`.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Bitacora.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar las tres secciones** — copy verbatim de la spec, «El índice».
  Puntos no obvios:

`IndiceCronicas.tsx` (patrón exacto de `IndiceEnsayos`, 3.1 — apertura única en estado
local de la sección):

```tsx
const [abierta, setAbierta] = useState<string | null>(null);
// …por cada año: cabecera mono sobre borde superior 2px tinta…
<FilaIndiceExpandible
  key={post.slug}
  num={numeroDeFila(i)}
  idPanel={`panel-${post.slug}`}
  abierta={abierta === post.slug}
  onToggle={() => { setAbierta(abierta === post.slug ? null : post.slug); }}
  encabezado={
    <span className="block">
      <span className={`block text-[17px] font-semibold leading-snug ${abierta === post.slug ? 'text-violeta' : 'text-tinta'}`}>
        {post.title}
      </span>
      <span className="font-space text-tinta-50 mt-1 block text-[11px] uppercase tracking-[0.1em]">
        {fechaLarga(post.publishedAt)}
        {post.category !== '' ? ` · ${post.category}` : ''}
      </span>
    </span>
  }
>
  {/* «{summary}» + Link a /bitacora/{slug} con «Leer la crónica · {min} min →» */}
</FilaIndiceExpandible>
```

  La marca `vlog` (mono 10px, borde tinta-30) se compone junto al título **solo** si
  `post.type === 'vlog'` — hoy no ocurre; es el mismo mecanismo que la marca `acta` de
  3.1.

`PortadaBitacora.tsx`: `Kicker` + `<h1 aria-label="Acá se escribe mientras pasa.">` con
`RitoTinta lineas={['Acá se escribe', 'mientras pasa.']}` + `riso-hover` + lead.
`CierreBitacora.tsx`: `BandaCta fondo="tinta"` con `<h2>` Anton `¿Y vos qué ves?` +
`BotonPapel asChild variant="violeta" surface="oscuro"` → `<Link href="/el-mapa">`.

- [ ] **Step 3: Implementar el composer `Bitacora.tsx`** (backlink + las tres secciones;
  patrón de `Biblioteca.tsx`, con el comentario de cabecera que cita la spec y la
  decisión de no mostrar cifras).

- [ ] **Step 4: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Bitacora.test.tsx src/pages/Bitacora` → PASS.
`pnpm verify` verde.

```bash
git add apps/web/src/pages/Bitacora.tsx \
        apps/web/src/pages/Bitacora/sections/PortadaBitacora.tsx \
        apps/web/src/pages/Bitacora/sections/IndiceCronicas.tsx \
        apps/web/src/pages/Bitacora/sections/CierreBitacora.tsx \
        apps/web/src/pages/__tests__/Bitacora.test.tsx
git commit -m "feat(web): La bitácora papel — índice de crónicas por año con pliegues"
```

---

### Task 7: El lector `/bitacora/:slug` — cadena cronológica, verbatim y edición impresa

**Files:**
- Create: `apps/web/src/pages/BitacoraDetail.tsx`
- Test: `apps/web/src/pages/__tests__/BitacoraDetail.test.tsx`

**Interfaces:**
- Consumes: `resolverCronica`, `ubicarCronica`, `fechaLarga` (T5) · `MdxPapel` ·
  `Kicker`, `RitoTinta`, `Sello`, `BotonPapel` · `.edicion-impresa` (ya en `index.css`).
- Produces: el lector editorial de 800px con redirect de dirección vieja, 404 expediente
  y edición impresa.

- [ ] **Step 1: Tests (fallan primero).** Con `memoryLocation({ path, static: true })`
  (patrón exacto de `PlanDetail.test.tsx` / `EnsayoDetail.test.tsx`). Las fixtures se
  eligen **por posición derivada**, nunca por slug hardcodeado: `BLOG_POSTS[0]` (la más
  nueva), `BLOG_POSTS.at(-1)` (la más vieja), una del medio y una con `legacySlugs`.
  - **Cabecera y cuerpo:** kicker con `categoría`, `fechaLarga(publishedAt)` y
    `{readingMinutes} min`; heading nivel 1 con `aria-label` igual al `title`; la bajada
    con el `summary`; un fragmento real del cuerpo renderizado; firma `— El hombre gris`;
    backlink `← La bitácora` con `href="/bitacora"`.
  - **Cadena:** la más nueva no tiene eslabón «←»; la más vieja no tiene «→»; para una
    del medio, los dos eslabones llevan el título del vecino y las líneas `más reciente`
    / `más antigua`.
  - **Edición impresa:** `<article>` con `edicion-impresa`; folio
    `¡BASTA! · edición del lector ·` con `hidden`+`print:block`; backlink, cadena y card
    de cierre con `print:hidden`; H1 con `print:[&_span]:animate-none`.
  - **Dirección vieja:** montar en `/bitacora/{legacySlug}` renderiza un `Redirect` y la
    ubicación pasa a `/bitacora/{slug canónico}` (assert sobre el hook de ubicación del
    `memoryLocation`).
  - **404:** slug inexistente → kicker `expediente extraviado`, heading
    `Esa crónica no está.`, sello `Extraviado`, CTA `Volver a la bitácora →` a
    `/bitacora`.
  - **Nada de lo que murió:** sin `MdxContent`, sin botón ♥, sin «Comentarios», sin
    `#tag`, sin `glass`/`iris-violet`/`font-serif` en el HTML.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/BitacoraDetail.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar `BitacoraDetail.tsx`** (esqueleto — copy verbatim de la spec,
  «El lector»):

```tsx
import { Link, Redirect, useRoute } from 'wouter';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { BotonPapel, Kicker, RitoTinta, Sello } from '~/components/papel/primitives';
import type { BlogPost } from '~/lib/blog-registry';
import { fechaLarga, resolverCronica, ubicarCronica } from '~/pages/Bitacora/bitacora-data';

/** 404 §5: el expediente extraviado, sobre papel (el lector es editorial). */
function CronicaExtraviada() { /* kicker + h1 «Esa crónica no está.» + Sello + CTA */ }

/** Un eslabón de la línea de tiempo; dice siempre hacia qué lado del tiempo va. */
function Eslabon({ post, lado }: { post: BlogPost; lado: 'reciente' | 'antigua' }) {
  const antigua = lado === 'antigua';
  return (
    <Link
      href={`/bitacora/${post.slug}`}
      className={`font-space max-w-[300px] text-xs uppercase tracking-[0.06em] ${
        antigua ? 'text-tinta hover:text-violeta ml-auto text-right font-bold' : 'text-tinta-50 hover:text-tinta'
      }`}
    >
      <span className="text-tinta-30 block text-[10px] tracking-[0.1em]">
        {antigua ? 'más antigua' : 'más reciente'}
      </span>
      {antigua ? `${post.title} →` : `← ${post.title}`}
    </Link>
  );
}

/**
 * Lector de crónica — página 3.4 «Papel y Tinta»
 * (docs/specs/2026-07-24-manifiesto-y-bitacora-papel-y-tinta.md). Cuerpo MDX
 * VERBATIM y edición impresa reusada de 2.4. Sin cifras, sin ♥ y sin hilo de
 * comentarios: no hay fila en `blog_posts` y los endpoints direccionan por id
 * numérico — el hilo del v1-port devolvía 400 (spec, Decisión 12).
 *
 * El video ASCII sigue dormido: `public/media/` está vacío, el registry
 * generado quedó con las claves viejas y el componente es chrome v1
 * (lucide + colores). Con medios en disco, registry regenerado y el
 * componente rehecho en papel, se cablea una línea acá, entre la bajada y el
 * cuerpo: <CronicaVideoAscii slug={post.slug} /> (spec, Decisión 18).
 */
export function BitacoraDetail() {
  const [match, params] = useRoute<{ slug: string }>('/bitacora/:slug');
  if (!match) return null;
  const resolucion = resolverCronica(params.slug);
  if (resolucion.estado === 'legado') return <Redirect to={`/bitacora/${resolucion.canonico}`} replace />;
  if (resolucion.estado === 'desconocida') return <CronicaExtraviada />;

  const post = resolucion.post;
  const ubicacion = ubicarCronica(post.slug);
  const minutos = post.readingMinutes > 0 ? ` · ${String(post.readingMinutes)} min` : '';
  const categoria = post.category !== '' ? ` · ${post.category}` : '';
  // …misma estructura que EnsayoDetail: backlink · <article className="edicion-impresa">
  //   (folio · Kicker «Bitácora{categoria} · {fecha}{minutos}» · H1 con RitoTinta ·
  //    bajada con summary · MdxPapel verbatim · firma) · nav de la cadena · cierre oscuro.
}

export default BitacoraDetail;
```

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/BitacoraDetail.test.tsx` → PASS.
`pnpm verify` verde.

```bash
git add apps/web/src/pages/BitacoraDetail.tsx \
        apps/web/src/pages/__tests__/BitacoraDetail.test.tsx
git commit -m "feat(web): lector de crónica — cadena cronológica, cuerpo verbatim y edición impresa"
```

---

### Task 8: Flip — rutas, redirects, `PAPEL_ROUTES`, borrados y prueba en navegador

**Files:**
- Modify: `apps/web/src/App.tsx` (lazy `Bitacora`/`BitacoraDetail`, rutas nuevas,
  redirects de `/blog*`, borrado de los lazy `Blog`/`BlogPostDetail`)
- Delete: `apps/web/src/pages/Blog.tsx`, `apps/web/src/pages/BlogPostDetail.tsx`
- Modify: `apps/web/src/layouts/papel-routes.ts` + `apps/web/src/layouts/__tests__/papel-routes.test.ts`
- Modify: `apps/web/src/pages/Biblioteca/biblioteca-data.ts` (**solo** `HREF_BITACORA` y
  `hrefCronica`) + `apps/web/src/pages/Biblioteca/__tests__/biblioteca-data.test.ts`

**Interfaces:**
- Produces: `/manifiesto`, `/bitacora` y `/bitacora/:slug` con chrome papel; `/blog` y
  `/blog/:slug` redirigen; `/blog/escribir` intacta y sin chrome papel; el hub de la
  biblioteca apuntando a la bitácora.

- [ ] **Step 1: Tests primero.** En `papel-routes.test.ts`: `esRutaPapel('/manifiesto')`
  → true · `('/bitacora')` → true · `('/bitacora/quien-tiene-el-timon')` → true ·
  `('/blog')` → true · `('/blog/lo-que-sea')` → true · **`('/blog/escribir')` → false**
  (herramienta de plataforma, Fase 5) · `('/bitacoraque')` → false. FAIL → agregar
  `/manifiesto`, `/bitacora` y `/blog` al Set, `/bitacora/` y `/blog/` a
  `PAPEL_PREFIXES`, y un Set `SIN_PAPEL = new Set(['/blog/escribir'])` que se consulta
  **primero** en `esRutaPapel`, con el comentario que cita la spec → PASS.
  En `biblioteca-data.test.ts`: `hrefCronica('x') === '/bitacora/x'` y
  `HREF_BITACORA === '/bitacora'` → FAIL → cambiar las dos constantes (y sus comentarios
  «3.4 →», que ya se cumplieron) → PASS.
- [ ] **Step 2: Rutas nuevas + redirects + borrados.** En `App.tsx`: agregar los lazy
  (patrón de los demás) y reemplazar el bloque de contenido por:

```tsx
<Route path="/bitacora" component={Bitacora} />
<Route path="/bitacora/:slug" component={BitacoraDetail} />
{/* Direcciones v1: el camino cambia acá, el slug lo resuelve el lector. */}
<Route path="/blog">
  <Redirect to="/bitacora" replace />
</Route>
<Route path="/blog/escribir" component={BlogAuthor} />
<Route path="/blog/:slug">
  {(params) => <Redirect to={`/bitacora/${params.slug}`} replace />}
</Route>
```

  **El orden importa** (wouter matchea en orden): `/blog/escribir` va ANTES de
  `/blog/:slug`. Borrar los lazy de `Blog` y `BlogPostDetail`;
  `git rm apps/web/src/pages/Blog.tsx apps/web/src/pages/BlogPostDetail.tsx`.

- [ ] **Step 3: Greps de control.**

```bash
# /blog solo puede quedar en los redirects de App.tsx y en BlogAuthor (Fase 5):
grep -rn "'/blog\|\"/blog\|/blog/" apps/web/src --include="*.tsx" --include="*.ts" | grep -v __tests__
# Chrome muerto en las páginas nuevas (debe dar cero):
grep -n "glass\|gradient-text\|iris-violet\|font-serif\|MdxContent\|components/ui/button" \
  apps/web/src/pages/Manifiesto.tsx apps/web/src/pages/Manifiesto/sections/*.tsx \
  apps/web/src/pages/Bitacora.tsx apps/web/src/pages/Bitacora/sections/*.tsx \
  apps/web/src/pages/BitacoraDetail.tsx
# Cero hex literal en el TSX nuevo (§9b — debe dar cero):
grep -n "#[0-9A-Fa-f]\{6\}" apps/web/src/pages/Manifiesto.tsx \
  apps/web/src/pages/Manifiesto/sections/*.tsx apps/web/src/pages/Bitacora.tsx \
  apps/web/src/pages/Bitacora/sections/*.tsx apps/web/src/pages/BitacoraDetail.tsx
# Cero literales de conteo en el JSX nuevo (revisar a ojo lo que salga):
grep -n "\b8\b\|\b22\b\|\b21\b" apps/web/src/pages/Manifiesto/sections/*.tsx \
  apps/web/src/pages/Bitacora/sections/*.tsx
# Cero cifras de post en cualquier superficie nueva (debe dar cero):
grep -rn "likeCount\|viewCount\|commentCount\|vistas\|me gusta" apps/web/src/pages/Bitacora* 
```

- [ ] **Step 4: Suite completa + verificación.**

Run: `pnpm -C apps/web exec vitest run` → PASS (nada de Home/LaIdea/ElMapa/ElMandatoVivo/
Planes/Sembrar/Biblioteca roto; en particular `Biblioteca.test.tsx`, que ahora espera
`/bitacora/…` en las cards). `pnpm verify` verde.

- [ ] **Step 5: Prueba en navegador (desktop + mobile, con capturas).**
  - (a) `/manifiesto` con chrome papel: rito de la tinta sobre «Manifiesto del Hombre
    Gris», kicker con el conteo derivado («8 partes»), apertura y epígrafe en prosa papel.
  - (b) **El sumario:** las 8 filas con su encabezado completo; tocar «5. La Metamorfosis
    Necesaria» salta a la sección y el título **no queda tapado** por el header sticky
    (`scroll-mt-20`); el hash queda en la URL y recargar aterriza en el mismo lugar.
  - (c) **El sello (interacción firma):** bajar hasta la firma → cae `LEÍDO ENTERO`
    (verde) con «Llegaste al final. Ahora empieza la parte tuya.»; subir y volver a bajar
    **no** lo vuelve a estampar; recargar la página lo saca (no persiste); no hay ninguna
    barra de progreso en toda la página.
  - (d) **Print preview del manifiesto (Cmd+P) — captura obligatoria:** sin
    header/footer/grano, TODO en serifa, folio como primera línea, **título en tinta (no
    gris)** aun imprimiendo apenas carga, las 8 partes con sus encabezados, la firma; sin
    backlink, **sin sumario**, sin sello, sin card de cierre.
  - (e) `/bitacora`: kicker con «{22} crónicas · desde diciembre de 2025», H1
    entintándose, los dos grupos de año con su conteo, 22 filas.
  - (f) **El pliegue:** abrir una fila de 2026 — glifo a `−`, título a violeta, panel con
    fadeup y el `summary` entre comillas angulares; abrir la de 2025 cierra la anterior;
    «Leer la crónica · {min} min →» navega.
  - (g) `/bitacora/{slug}` de una crónica del medio: kicker con categoría/fecha/minutos,
    H1 con rito (probar una con `¿ ?`), bajada, cuerpo en prosa papel, firma, cadena con
    «más reciente»/«más antigua», cierre oscuro al mapa. Print preview con captura.
  - (h) **Los bordes de la cadena:** la crónica más nueva no tiene «←»; la más vieja no
    tiene «→».
  - (i) **Las direcciones viejas, una por una en la barra:**
    `/blog` → `/bitacora` · `/blog/el-cristo-que-llevs-dentro` →
    `/bitacora/el-cristo-que-llevas-dentro` (dos saltos, invisibles) ·
    `/bitacora/cules-deberan-ser-nuestros-parmetros` →
    `/bitacora/cuales-deberian-ser-nuestros-parametros` · `/bitacora/no-existe` → 404
    EXTRAVIADO con CTA al índice · **`/blog/escribir` sigue abriendo la herramienta de
    autoría, con chrome v1 y sin tocar**.
  - (j) El hub `/biblioteca`: «Ver la bitácora entera · 22 crónicas →» abre `/bitacora` y
    cada card abre su `/bitacora/:slug`; la card del manifiesto sigue **sin cifras**.
  - (k) Móvil 375px: 1 columna, sumario y filas con título completo, targets ≥ 44px,
    cadena apilada sin desbordes. `prefers-reduced-motion`: páginas completas y quietas,
    pliegue sin animación, sello sin caída (aparece ya estampado).
- [ ] **Step 6: Commit.**

```bash
git add apps/web/src/App.tsx \
        apps/web/src/layouts/papel-routes.ts \
        apps/web/src/layouts/__tests__/papel-routes.test.ts \
        apps/web/src/pages/Biblioteca/biblioteca-data.ts \
        apps/web/src/pages/Biblioteca/__tests__/biblioteca-data.test.ts
git rm apps/web/src/pages/Blog.tsx apps/web/src/pages/BlogPostDetail.tsx
git commit -m "feat(web): la bitácora en /bitacora — redirects de /blog, rutas papel y verificación"
```

---

## Self-review

- **Cobertura de la spec:** parser verbatim del manifiesto con igualdad de strings (T1) ·
  lector con sumario anclado, partes verbatim y edición impresa (T2) · el sello LEÍDO
  ENTERO con la mecánica del VISTO, efímero y probado con observer falso (T3) ·
  reparación de 17 URLs con rastro en el contenido y canon importado, no copiado (T4) ·
  derivadas de la bitácora: años, vecinos y resolución (T5) · índice con pliegue de
  apertura única (T6) · lector con cadena cronológica, redirect de legado y 404
  expediente (T7) · rutas, redirects, borrados, excepción de `/blog/escribir`, greps y
  navegador con dos print previews (T8).
- **Cero datos inventados:** ningún literal de conteo en JSX; las partes salen del texto,
  las fechas/categorías/minutos del frontmatter, los grupos de `publishedAt`. **Ninguna
  cifra de post** en ninguna superficie, y el test lo pinea (T6, T7).
- **La honestidad es testeable:** el verbatim del manifiesto es una igualdad de strings
  (T1); la ausencia de cifras y de video ASCII son aserciones negativas (T6/T7); que
  ninguna URL vieja muera es un test de resolución (T5) más una pasada manual por la
  barra de direcciones (T8-i).
- **Cero re-derivación:** `FilaIndiceExpandible` y `MdxPapel` son de 2.4; el observer y su
  harness de test son del mandato (2.3); `.edicion-impresa` y el `print:hidden` del chrome
  ya viven en `index.css`/chrome — ninguno de esos archivos aparece en un `git add`. Cero
  primitivas nuevas, cero dependencias, cero CSS, cero endpoints.
- **Consistencia de tipos:** `BlogPost` viene solo de `~/lib/blog-registry`;
  `AnioBitacora`/`UbicacionCronica`/`ResolucionCronica` viven solo en `bitacora-data.ts`;
  `ParteManifiesto` solo en `manifiesto-data.ts`. `slugCanonico` vive en `@v2/shared` y lo
  comparten el script de reparación y el test del registry: la regla existe una sola vez.
- **Riesgos señalados:** (1) el parser depende de que el manifiesto siga usando `## ` —
  si cambiara de forma, el test de reconstrucción rompe antes que la página, y la
  degradación (todo como apertura, sin sumario) ya está testeada; (2) `print:[&_span]:animate-none`
  debe ganarle a `.anim-inkfill`: si en la captura el título saliera gris, el fallback es
  sumar `.anim-inkfill` al bloque `@media print` de `index.css` (cambio global, solo si la
  verificación lo pide — mismo riesgo y mismo fallback que 3.2); (3) el renombrado de 17
  archivos: el paso de verificación del diff (T4-Step 4) es obligatorio, un cuerpo tocado
  es un texto keystone violado; (4) `asciiVideoRegistry.generated.ts` queda con las 20
  claves viejas — es un archivo generado y dormido, y su regeneración es parte de la
  condición de activación (spec, Decisión 18); (5) `scroll-mt-20` asume el header
  `sticky h-16`: si el header cambiara de alto, el ancla se tapa — se verifica a ojo en
  T8-b; (6) los tests de fecha usan el mismo `Intl` que el código, nunca literales «abril
  de 2026», que dependen del ICU del runner.
- **Ley: cero enmiendas.** El sello ya está en el catálogo §10.5 y se usa donde la ley lo
  pone; la impresión, la fila expandible y el 404 expediente ya están legislados. Las tres
  lecturas de la ley (conteos en prosa, persistencia del sello, etiquetas de disparador
  del despertar) están escritas en la spec, sin tocar el README.
- **Deuda observada, fuera de alcance:** (a) `fechaLarga` queda duplicada en tres módulos
  de datos — extraerla a `lib/fechas.ts` es una limpieza de una línea por consumidor
  cuando alguna página vuelva a tocarlos; (b) `BlogAuthor` sigue con chrome v1 hasta la
  Fase 5 y por eso está excluida del prefijo papel; (c) `blog-sources.ts` y
  `migrate-blog-v1-to-v2.ts` quedan como registro histórico de las direcciones de v1 —
  cerrados, no borrados; (d) las cifras de crónica vuelven cuando exista una fila
  `blog_posts` por slug, con §13 mandando la forma.
