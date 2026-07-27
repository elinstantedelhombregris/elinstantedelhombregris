# C · El registro y los números — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que las 54 rutas del sitio tengan una sola fuente de verdad —superficie de tema, título, descripción y política de indexación— consumible tanto desde Vite como desde un script bajo `tsx`; que el `<head>` vivo y el tema de la pantalla sigan a la ruta; y que ningún número visible salga de una constante escrita a mano.

**Architecture:** `apps/web/src/lib/rutas/` se parte en dos mitades con una frontera física: `entradas.ts` + `registro.ts` + `descripcion-de.ts` son TypeScript plano —cero Vite, cero alias `~/`, cero builtins de node— porque los importan a la vez el runtime del navegador y cuatro scripts de build; `fuente-web.ts` y `use-metadata.ts` son el lado Vite, con carga perezosa por patrón para no hoistear los cinco content registries al chunk inicial. La fuente de contenido se **inyecta** por el llamador: el hook la arma desde los registries, los scripts de B11/B12 desde disco. `layouts/papel-routes.ts` se vacía de datos y pasa a re-exportar del registro, así `RootLayout` y su suite quedan verdes sin tocarse. Del lado de los números, `components/papel/voces-regimen.ts` calca el molde de `ElMandatoVivo/mandato-regimen.ts`: cuatro estados puros y testeados que reemplazan a `DEMO_VOCES_COUNT`.

**Tech Stack:** TypeScript 5.6 strict (`noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax`) · React 18 + wouter 3 · Vitest 2 + Testing Library + happy-dom · tsx 4 para los scripts · GitHub Actions.

**Spec:** `docs/specs/2026-07-26-el-sustrato.md` — bloques B7 (registro de rutas), B8 (tema por ruta), B10 (números honestos)

## Global Constraints

- **Todos los comandos se corren desde `/Users/juanb/Desktop/ElInstantedelHombreGris/v2`**, salvo indicación contraria. Los `pnpm -C apps/web exec …`, `pnpm meta:check` y `pnpm verify` sólo valen desde ahí, y el `git add … ../.github/workflows/v2-ci.yml` de la Tarea 9 tiene un `../` que **sólo resuelve con cwd = `v2/`**. (El plan A prefija cada comando con el `cd` absoluto; acá se declara una vez.)
- **Este plan asume el plan A completo (B0–B3) mergeado.** No es una preferencia de orden: la Tarea 9 necesita el `scripts/tsconfig.json` y el `v2/eslint.config.mjs` que crea A (Tarea 2), y la Tarea 8 necesita el `color-scheme: light` de `index.css` que escribe A (Tarea 12). El orden alfabético de la carpeta de planes invita a arrancar por C: no arrancar C sin A.
- **Los números de línea de HEAD NO valen: anclá siempre en texto literal.** Este plan corre DESPUÉS de A (B0–B3), que ya reescribió `App.tsx`, `RootLayout.tsx`, `index.html`, `index.css`, `primitives/index.ts`, `primitives.test.tsx`, `PapelHeader.tsx` y once sitios más; y B6 (contraste, en el plan B, que corre **en paralelo** a éste) migra tokens `text-*` en varios de los archivos que tocan las Tareas 11–14. Ninguna tarea de este plan depende de que B6 haya corrido ni al revés: acá se cambia copy y estructura, nunca un token `text-*` que B6 tenga en su mapa. Donde este plan menciona un número de línea es **orientativo**: el localizador es siempre la cadena citada. Y donde una tarea muestra un bloque de código «así queda el archivo», leerlo como **edición aditiva** sobre lo que ya está en disco, nunca como transcripción a pegar encima.
- `v2/CLAUDE.md` entero: sin `: any`, sin `console.*`, sin `@ts-ignore`, Conventional Commits con scope, `pnpm verify` verde antes de **cada** commit.
- `docs/design-system/README.md` v1.1 es ley. §9b: en TSX está PROHIBIDO el hex literal — solo tokens Tailwind. Si falta un token se agrega a `docs/design-system/tokens.css` + `apps/web/tailwind.config.ts` en el mismo PR. **Este plan no agrega ningún token.**
- **La frontera Vite es física.** `apps/web/src/lib/rutas/registro.ts`, `entradas.ts` y `descripcion-de.ts` no importan NADA de Vite ni de node: sin `import.meta.glob`, sin `import.meta.env`, sin `~/`, sin `node:fs`. Solo hermanos por ruta relativa. Los scripts los importan como `'../../apps/web/src/lib/rutas/registro'`, extensionless, exactamente como `scripts/content/verify-planes-index.ts:17` importa `planes-index.generated`.
- **PROHIBIDO un barril `lib/rutas/index.ts`.** Re-exportaría `fuente-web.ts` (que sí usa `import.meta.glob`) y envenenaría a los scripts. Import directo por archivo, siempre.
- **`use-metadata.ts` NO puede importar estáticamente los registries.** `ensayos-registry`, `blog-registry` y `cronica-registry` son globs EAGER con los cuerpos completos, y `courses-registry` trae 336 KB de `course.json`. Por eso `CARGADORES_WEB` usa `import()` dinámico y el hook resuelve primero con `FUENTE_VACIA` (metadata de sección) y reescribe cuando resuelve la promesa.
- `exactOptionalPropertyTypes: true` — `descripcionMeta?`, `destino?` y `prefijoRewrite?` NO aceptan `undefined` explícito. Se construyen con spread condicional: `...(dm !== undefined ? { descripcionMeta: dm } : {})`.
- `noUncheckedIndexedAccess: true` — `fuente[patron]` es `readonly DocumentoDeRuta[] | undefined`. `@typescript-eslint/no-non-null-assertion` es `error`: `!` no es salida.
- ESLint corre `...tseslint.configs.strictTypeChecked` — cuidado con `no-unsafe-assignment`/`no-unsafe-member-access` al leer `import.meta.env`. Por eso la Tarea 7 declara `VITE_SITE_ORIGIN` en un `.d.ts` en vez de castear.
- `import/order` con `groups: ['builtin','external','internal','parent','sibling','index','object','type']`, `newlines-between: 'always'` y alfabetizado. **Los imports `~/…` no los resuelve ningún resolver y quedan al final**, después del grupo `type` — mirá `apps/web/src/layouts/RootLayout.tsx:1-13` y copiá ese orden. Los tipos co-importados van inline (`import { X, type Y } from '…'`), que es el estilo del repo.
- `no-console` es `error`. Los scripts nuevos escriben con `process.stdout.write` / `process.stderr.write`.
- **`scripts/vitest.config.ts` YA incluye `build/__tests__/**/*.test.ts`** (verificado — línea `include`). No hace falta tocarlo.
- **`LARGO_MAXIMO_TITULO = 60` aplica SOLO a las entradas del registro**, no a los títulos de documento: el plan `PLANRUTA` se llama «Cuando el sistema caiga alguien tiene que saber reconstruir» (58 caracteres) y con el sufijo da 68. Los títulos de contenido son del contenido; los de sección son nuestros. La guardia `meta:check` chequea largos de entrada, y de documento chequea solo la descripción (que `descripcionDe` garantiza ≤ 160).
- Todo texto de usuario en español rioplatense con voseo. «Comillas angulares». **¡BASTA!** siempre con los dos signos.
- Páginas ≤ 300 LOC. `entradas.ts` es una tabla de datos de ~500 líneas y queda exenta por la misma razón que `apps/web/src/lib/planes-index.generated.ts`: es un registro, no lógica.

---

### Tarea 1: `descripcion-de.ts` — la descripción se deriva del `summary`

**Files:**
- Create: `apps/web/src/lib/rutas/descripcion-de.ts`
- Test: `apps/web/src/lib/rutas/__tests__/descripcion-de.test.ts`

**Interfaces:**
- Consumes: nada. Es el módulo hoja de todo el bloque.
- Produces: `LARGO_MAXIMO_DESCRIPCION`, `LARGO_DE_CORTE`, `ELIPSIS`, `primeraOracion()`, `recortarEnPalabra()`, `FuenteDeDescripcion`, `descripcionDe()`. Lo consume `registro.ts` (Tarea 3) y `scripts/build/verify-registro-rutas.ts` (Tarea 9).

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/lib/rutas/__tests__/descripcion-de.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  descripcionDe,
  ELIPSIS,
  LARGO_DE_CORTE,
  LARGO_MAXIMO_DESCRIPCION,
  primeraOracion,
  recortarEnPalabra,
} from '../descripcion-de';

import { BLOG_POSTS } from '~/lib/blog-registry';
import { ENSAYOS } from '~/lib/ensayos-registry';
import { PLANES_INDEX } from '~/lib/planes-index.generated';

const RESPALDO = 'Los planes de gobierno completos, escritos como prueba y no como doctrina.';

describe('primeraOracion', () => {
  it('corta en el primer punto seguido de espacio', () => {
    expect(primeraOracion('Hoy es Pascuas. Y si nos detuviéramos a pensar.')).toBe(
      'Hoy es Pascuas.',
    );
  });

  it('corta también en signo de pregunta y de exclamación', () => {
    expect(primeraOracion('¿Con qué vara te medís? Vivís midiéndote.')).toBe(
      '¿Con qué vara te medís?',
    );
    expect(primeraOracion('¡BASTA! Es la palabra.')).toBe('¡BASTA!');
  });

  it('corta en puntos suspensivos', () => {
    expect(primeraOracion('Todo empezó así… Después vino el resto.')).toBe('Todo empezó así…');
  });

  it('no corta en un punto que no cierra oración', () => {
    expect(primeraOracion('El PBI cayó 3.5 puntos en un año')).toBe(
      'El PBI cayó 3.5 puntos en un año',
    );
  });

  it('devuelve el texto entero cuando no hay cierre de oración', () => {
    expect(primeraOracion('Una sola frase sin punto final')).toBe(
      'Una sola frase sin punto final',
    );
  });

  it('devuelve cadena vacía con texto vacío o de puro espacio', () => {
    expect(primeraOracion('')).toBe('');
    expect(primeraOracion('   \n  ')).toBe('');
  });
});

describe('recortarEnPalabra', () => {
  it('devuelve el texto intacto si ya entra en el máximo', () => {
    const corto = 'a'.repeat(LARGO_MAXIMO_DESCRIPCION);
    expect(recortarEnPalabra(corto)).toBe(corto);
  });

  it('recorta en el último límite de palabra y agrega la elipsis', () => {
    const largo = `${'palabra '.repeat(40)}final`;
    const recortado = recortarEnPalabra(largo);
    expect(recortado.endsWith(ELIPSIS)).toBe(true);
    expect(recortado.length).toBeLessThanOrEqual(LARGO_DE_CORTE + ELIPSIS.length);
    expect(recortado.slice(0, -ELIPSIS.length).endsWith(' ')).toBe(false);
    expect(largo.startsWith(recortado.slice(0, -ELIPSIS.length))).toBe(true);
  });

  it('no deja coma ni punto y coma pegados a la elipsis', () => {
    // El fixture está calibrado para que el corte caiga EXACTAMENTE sobre el espacio que
    // sigue a la coma: `'palabra '.repeat(18)` ocupa 0-143, `'penúltima,'` 144-153, el
    // espacio 154, y desde 155 una palabra sin espacios que desborda. Con
    // LARGO_DE_CORTE = 157 el último espacio del recorte es el 154 y la base termina en
    // coma, así que el `.replace(/[\s,;:]+$/u, '')` de la implementación es lo único que
    // evita el «,…». Sin él, las dos aserciones fallan — que es lo que un test tiene que
    // poder hacer.
    const largo = `${'palabra '.repeat(18)}penúltima, palabrasoldadaquenotieneespaciosydesbordaelcorte`;
    const recortado = recortarEnPalabra(largo);
    expect(recortado).not.toContain(`,${ELIPSIS}`);
    expect(recortado).not.toMatch(/[\s,;:]…$/u);
    expect(recortado.endsWith(`penúltima${ELIPSIS}`)).toBe(true);
  });
});

describe('descripcionDe', () => {
  it('descripcionMeta le gana al summary', () => {
    expect(
      descripcionDe(
        { summary: 'Un summary larguísimo que nadie quiere.', descripcionMeta: 'La escrita a mano.' },
        RESPALDO,
      ),
    ).toBe('La escrita a mano.');
  });

  it('ignora un descripcionMeta vacío o de puro espacio', () => {
    expect(descripcionDe({ summary: 'Primera. Segunda.', descripcionMeta: '   ' }, RESPALDO)).toBe(
      'Primera.',
    );
  });

  it('cae a la primera oración del summary', () => {
    expect(descripcionDe({ summary: 'Primera oración. Segunda.' }, RESPALDO)).toBe(
      'Primera oración.',
    );
  });

  it('cae al respaldo cuando no hay summary', () => {
    expect(descripcionDe({ summary: '' }, RESPALDO)).toBe(RESPALDO);
  });

  it('nunca supera el máximo con los 23 planes reales', () => {
    expect(PLANES_INDEX.length).toBeGreaterThan(0);
    for (const plan of PLANES_INDEX) {
      const d = descripcionDe({ summary: plan.summary }, RESPALDO);
      expect(d.length, `${plan.code}: ${d}`).toBeLessThanOrEqual(LARGO_MAXIMO_DESCRIPCION);
      expect(d.length, `${plan.code} quedó vacío`).toBeGreaterThan(0);
    }
  });

  it('nunca supera el máximo con los 22 posts y los 21 ensayos reales', () => {
    expect(BLOG_POSTS.length).toBeGreaterThan(0);
    expect(ENSAYOS.length).toBeGreaterThan(0);
    for (const post of BLOG_POSTS) {
      const d = descripcionDe({ summary: post.summary }, RESPALDO);
      expect(d.length, `${post.slug}: ${d}`).toBeLessThanOrEqual(LARGO_MAXIMO_DESCRIPCION);
      expect(d.length, `${post.slug} quedó vacío`).toBeGreaterThan(0);
    }
    for (const ensayo of ENSAYOS) {
      const d = descripcionDe({ summary: ensayo.summary }, RESPALDO);
      expect(d.length, `${ensayo.slug}: ${d}`).toBeLessThanOrEqual(LARGO_MAXIMO_DESCRIPCION);
      expect(d.length, `${ensayo.slug} quedó vacío`).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas`
Esperado: FALLA con `Failed to resolve import "../descripcion-de"` — el módulo todavía no existe.

- [ ] **Paso 3: Implementación mínima**

Crear `apps/web/src/lib/rutas/descripcion-de.ts`:

```ts
/**
 * Derivación de la descripción meta (§2 de `docs/specs/2026-07-26-el-sustrato.md`).
 *
 * El `title` existe en el 100% del contenido, pero el `summary` no sirve crudo:
 * mediana de 384 caracteres en los planes, máximo 973, y 0 de 23 entran en 160.
 *
 * Restricción dura: este módulo lo importan a la vez el runtime de `apps/web` y
 * los scripts que corren bajo `tsx`. CERO Vite, CERO alias `~/`, CERO builtins
 * de node — solo hermanos por ruta relativa.
 */
export const LARGO_MAXIMO_DESCRIPCION = 160;
export const LARGO_DE_CORTE = 157;
export const ELIPSIS = '…';

/** Cierres de oración que reconocemos. El `.` solo cuenta si le sigue espacio o fin. */
const CIERRES = new Set(['.', '?', '!', '…']);

/**
 * Primera oración completa de `texto`. Devuelve `''` si `texto` está vacío o es
 * puro espacio. Un punto pegado a un dígito («3.5») no corta: exigimos que al
 * cierre le siga un espacio, un salto de línea, o el fin del texto.
 */
export function primeraOracion(texto: string): string {
  const limpio = texto.trim();
  if (limpio === '') return '';

  for (let i = 0; i < limpio.length; i += 1) {
    const caracter = limpio[i];
    if (caracter === undefined || !CIERRES.has(caracter)) continue;
    const siguiente = limpio[i + 1];
    if (siguiente === undefined) return limpio;
    if (siguiente === ' ' || siguiente === '\n') return limpio.slice(0, i + 1);
  }
  return limpio;
}

/**
 * Recorta en el último límite de palabra antes de `largoDeCorte` y agrega
 * `ELIPSIS`. Devuelve `texto` intacto si ya entra en `LARGO_MAXIMO_DESCRIPCION`.
 * Con el corte por defecto el resultado mide como mucho 158.
 */
export function recortarEnPalabra(texto: string, largoDeCorte: number = LARGO_DE_CORTE): string {
  if (texto.length <= LARGO_MAXIMO_DESCRIPCION) return texto;

  const cortado = texto.slice(0, largoDeCorte);
  const ultimoEspacio = cortado.lastIndexOf(' ');
  const base = ultimoEspacio > 0 ? cortado.slice(0, ultimoEspacio) : cortado;
  return `${base.replace(/[\s,;:]+$/u, '')}${ELIPSIS}`;
}

export interface FuenteDeDescripcion {
  readonly summary: string;
  readonly descripcionMeta?: string;
}

/**
 * Regla de §2: `descripcionMeta` gana; si no, primera oración del `summary`
 * recortada; si no hay nada, `respaldo` (la `descripcion` de la entrada de
 * sección). El resultado SIEMPRE mide ≤ `LARGO_MAXIMO_DESCRIPCION`.
 */
export function descripcionDe(fuente: FuenteDeDescripcion, respaldo: string): string {
  const propia = fuente.descripcionMeta?.trim() ?? '';
  if (propia !== '') return recortarEnPalabra(propia);

  const oracion = primeraOracion(fuente.summary);
  if (oracion !== '') return recortarEnPalabra(oracion);

  return recortarEnPalabra(respaldo);
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas`
Esperado: PASA — 15 tests verdes, incluidos los tres que recorren los 23 planes, los 22 posts y los 21 ensayos reales.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/lib/rutas/descripcion-de.ts \
        apps/web/src/lib/rutas/__tests__/descripcion-de.test.ts
git commit -m "feat(web): la descripción meta se deriva del summary, nunca se escribe a mano"
```

---

### Tarea 2: `entradas.ts` — las 54 rutas con superficie, título, descripción e indexación

**Files:**
- Create: `apps/web/src/lib/rutas/entradas.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `Superficie`, `Indexacion`, `EntradaRegistro`, `ENTRADAS`. Los re-exporta `registro.ts` (Tarea 3); nadie más importa este archivo.

> **Por qué existe este archivo y no vive dentro de `registro.ts`:** 54 entradas formateadas por prettier son ~490 líneas. Metidas en `registro.ts` el archivo pasaría de 700 LOC y la lógica quedaría enterrada bajo la tabla. Los tipos viven acá (y `registro.ts` los re-exporta) para que la dependencia sea de una sola dirección y no haya ciclo.

- [ ] **Paso 1: Escribir el test que falla**

Este paso no tiene test propio: `entradas.ts` es una tabla de datos sin comportamiento. Su test es la Tarea 3 (`registro.test.ts`, que lo recorre entero) y la Tarea 9 (`meta:check`, que lo compara contra `app-routes.tsx`). Marcar el paso como hecho y seguir.

- [ ] **Paso 2: Fijar la línea de base (acá no hay rojo, y está bien)**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas`
Esperado: PASA (solo corre la Tarea 1). Sin cambio de estado — el rojo llega en la Tarea 3.

- [ ] **Paso 3: Implementación mínima**

Crear `apps/web/src/lib/rutas/entradas.ts`:

```ts
/**
 * Las 54 rutas del sitio, EN EL MISMO ORDEN que el `<Switch>` de
 * `apps/web/src/app-routes.tsx`. `buscarEntrada` recorre este array en orden y
 * devuelve la primera coincidencia, así que el orden no es cosmético: es la
 * semántica de wouter. `meta:check` (scripts/build/verify-registro-rutas.ts)
 * exige biyección y orden idéntico.
 *
 * Restricción dura: cero Vite, cero alias `~/`, cero node. Ver
 * `docs/specs/2026-07-26-el-sustrato.md` §1.
 */

export type Superficie = 'papel' | 'papel-oscuro' | 'legado';

export type Indexacion = 'publica' | 'privada' | 'dinamica' | 'redireccion';

export interface EntradaRegistro {
  /** Patrón wouter LITERAL, carácter por carácter igual al `path` de `app-routes.tsx` («/planes/:slug»). Clave única del registro. */
  readonly patron: string;
  readonly superficie: Superficie;
  /** Nombre de la página SIN sufijo de marca. La composición de §14 vive en `componerTitulo`. */
  readonly titulo: string;
  /** Descripción de sección, ≤ 160, en voseo. Respaldo cuando el documento no aporta la suya. */
  readonly descripcion: string;
  readonly indexacion: Indexacion;
  /** Nombre base de la tarjeta OG en `public/og/`, sin extensión ni barra («planes», «home»). */
  readonly og: string;
  /** `true` sólo si cada documento del patrón tiene PNG propio en `public/og/<og>/<slug>.png`. */
  readonly ogPorDocumento: boolean;
  /** Sólo `indexacion: 'redireccion'`: destino del 301. Ausente en todo lo demás. */
  readonly destino?: string;
  /** Sólo `indexacion: 'dinamica'`: prefijo del rewrite de `vercel.json` y ruta del shell sellado que lo sirve («/mandato-vivo/pulso»). */
  readonly prefijoRewrite?: string;
}

const DESCRIPCION_LA_IDEA =
  'Tres capítulos: por qué estamos así, cómo se sale y por qué nadie viene a salvarte. La tesis completa de ¡BASTA!.';

const DESCRIPCION_SEMBRAR =
  'Tres frases y listo: tu voz entra al mapa y te llevás el certificado de la semilla. No te pedimos fe.';

const DESCRIPCION_BIBLIOTECA =
  'El manifiesto, los ensayos, los entrenamientos, la crónica y la bitácora. Todo lo que hay para leer, en un solo lugar.';

const DESCRIPCION_BITACORA =
  'Lo que va pasando, contado a medida que pasa. Crónicas cortas, sin comunicado de prensa.';

const DESCRIPCION_PLANES =
  'Los planes de gobierno completos, escritos como prueba y no como doctrina. Leelos, discutilos, mejoralos.';

export const ENTRADAS: readonly EntradaRegistro[] = [
  {
    patron: '/',
    superficie: 'papel',
    titulo: 'El país lo diseña la gente',
    descripcion:
      'La ciudadanía diseña, el Estado administra, la política ejecuta. Sin líder, sin partido, sin excusas. Dejá tu voz en el mapa.',
    indexacion: 'publica',
    og: 'home',
    ogPorDocumento: false,
  },

  // ── Auth ────────────────────────────────────────────────────────────────
  {
    patron: '/ingresar',
    superficie: 'legado',
    titulo: 'Entrar',
    descripcion:
      'Entrá a tu cuenta. La cuenta es opcional: podés dejar tu voz en el mapa sin registrarte.',
    indexacion: 'privada',
    og: 'entrada',
    ogPorDocumento: false,
  },
  {
    patron: '/registrarse',
    superficie: 'legado',
    titulo: 'Crear cuenta',
    descripcion:
      'Crear una cuenta lleva menos que un trámite. Si no querés, no hace falta: podés participar anónimo.',
    indexacion: 'privada',
    og: 'entrada',
    ogPorDocumento: false,
  },
  {
    patron: '/recuperar-contrasena',
    superficie: 'legado',
    titulo: 'Recuperar la contraseña',
    descripcion: 'Te mandamos un enlace para volver a entrar. Nada más que eso.',
    indexacion: 'privada',
    og: 'entrada',
    ogPorDocumento: false,
  },
  {
    patron: '/restablecer-contrasena',
    superficie: 'legado',
    titulo: 'Crear una contraseña nueva',
    descripcion: 'Elegí una contraseña nueva y volvé a entrar.',
    indexacion: 'privada',
    og: 'entrada',
    ogPorDocumento: false,
  },
  {
    patron: '/verificar-email',
    superficie: 'legado',
    titulo: 'Verificar el correo',
    descripcion: 'Confirmá tu dirección de correo para terminar de abrir la cuenta.',
    indexacion: 'privada',
    og: 'entrada',
    ogPorDocumento: false,
  },
  {
    patron: '/2fa-desafio',
    superficie: 'legado',
    titulo: 'Verificación en dos pasos',
    descripcion: 'Ingresá el código de tu app de autenticación para terminar de entrar.',
    indexacion: 'privada',
    og: 'entrada',
    ogPorDocumento: false,
  },
  {
    patron: '/bienvenida',
    superficie: 'legado',
    titulo: 'Bienvenida',
    descripcion: 'Ya estás adentro. Esto es lo que podés hacer desde acá.',
    indexacion: 'publica',
    og: 'entrada',
    ogPorDocumento: false,
  },
  {
    patron: '/apoyo',
    superficie: 'legado',
    titulo: 'Tres formas de empujar',
    descripcion:
      'Tres formas concretas de empujar ¡BASTA!: difundirlo, sumar tu voz y sostener el proyecto.',
    indexacion: 'publica',
    og: 'apoyo',
    ogPorDocumento: false,
  },
  {
    patron: '/politica-privacidad',
    superficie: 'legado',
    titulo: 'Política de privacidad',
    descripcion:
      'Qué datos guardamos, para qué, y cómo pedís que los borremos. En castellano, sin letra chica.',
    indexacion: 'publica',
    og: 'privacidad',
    ogPorDocumento: false,
  },

  // ── El marco ¡BASTA! ────────────────────────────────────────────────────
  {
    patron: '/manifiesto',
    superficie: 'papel',
    titulo: 'El manifiesto',
    descripcion:
      'El documento que abre todo: qué está roto, qué proponemos y qué te toca a vos. Se lee entero en una sentada.',
    indexacion: 'publica',
    og: 'manifiesto',
    ogPorDocumento: false,
  },
  {
    patron: '/la-idea',
    superficie: 'papel',
    titulo: 'La idea',
    descripcion: DESCRIPCION_LA_IDEA,
    indexacion: 'publica',
    og: 'la-idea',
    ogPorDocumento: false,
  },
  {
    patron: '/la-vision',
    superficie: 'legado',
    titulo: 'La idea',
    descripcion: DESCRIPCION_LA_IDEA,
    indexacion: 'redireccion',
    og: 'la-idea',
    ogPorDocumento: false,
    destino: '/la-idea',
  },
  {
    patron: '/el-instante-del-hombre-gris',
    superficie: 'legado',
    titulo: 'La idea',
    descripcion: DESCRIPCION_LA_IDEA,
    indexacion: 'redireccion',
    og: 'la-idea',
    ogPorDocumento: false,
    destino: '/la-idea',
  },
  {
    patron: '/la-semilla-de-basta',
    superficie: 'legado',
    titulo: 'Sembrar tu voz',
    descripcion: DESCRIPCION_SEMBRAR,
    indexacion: 'redireccion',
    og: 'sembrar',
    ogPorDocumento: false,
    destino: '/sembrar',
  },
  {
    patron: '/sembrar',
    superficie: 'papel',
    titulo: 'Sembrar tu voz',
    descripcion: DESCRIPCION_SEMBRAR,
    indexacion: 'publica',
    og: 'sembrar',
    ogPorDocumento: false,
  },
  {
    patron: '/una-ruta-para-argentina',
    superficie: 'legado',
    titulo: 'La idea',
    descripcion: DESCRIPCION_LA_IDEA,
    indexacion: 'redireccion',
    og: 'la-idea',
    ogPorDocumento: false,
    destino: '/la-idea',
  },
  {
    patron: '/el-mapa',
    superficie: 'papel',
    titulo: 'El mapa de las voces',
    descripcion:
      'El país dicho por su gente: bastas, sueños, necesidades, compromisos y recursos, provincia por provincia.',
    indexacion: 'publica',
    og: 'el-mapa',
    ogPorDocumento: false,
  },
  {
    patron: '/detalles-calculo-costo-humano',
    superficie: 'legado',
    titulo: 'Cómo se calcula el costo humano',
    descripcion:
      'La fórmula, las fuentes y los supuestos detrás del costo humano que publicamos. Revisalo y discutilo.',
    indexacion: 'publica',
    og: 'costo-humano',
    ogPorDocumento: false,
  },
  {
    patron: '/kit-de-prensa',
    superficie: 'legado',
    titulo: 'Kit de prensa',
    descripcion:
      'Qué es ¡BASTA!, cómo citarlo y qué material podés usar. Para periodistas con poco tiempo.',
    indexacion: 'publica',
    og: 'prensa',
    ogPorDocumento: false,
  },

  // ── La prueba ───────────────────────────────────────────────────────────
  {
    patron: '/planes',
    superficie: 'papel',
    titulo: 'La prueba',
    descripcion: DESCRIPCION_PLANES,
    indexacion: 'publica',
    og: 'planes',
    ogPorDocumento: false,
  },
  {
    patron: '/planes/:slug',
    superficie: 'papel-oscuro',
    titulo: 'La prueba',
    descripcion: DESCRIPCION_PLANES,
    indexacion: 'publica',
    og: 'planes',
    ogPorDocumento: true,
  },

  // ── Áreas de vida (con sesión) ──────────────────────────────────────────
  {
    patron: '/areas',
    superficie: 'legado',
    titulo: 'Las 12 áreas de tu vida',
    descripcion:
      'El tablero de tus doce áreas: dónde estás hoy, dónde querés estar y qué paso sigue.',
    indexacion: 'privada',
    og: 'areas',
    ogPorDocumento: false,
  },
  {
    patron: '/areas/:slug',
    superficie: 'legado',
    titulo: 'Un área de tu vida',
    descripcion:
      'Dónde estás, qué podés hacer y cómo vas en esta área. Con tu propio registro, no con promedios ajenos.',
    indexacion: 'privada',
    og: 'areas',
    ogPorDocumento: false,
  },
  {
    patron: '/auto-evaluacion-civica',
    superficie: 'legado',
    titulo: '¿Qué tipo de ciudadano sos?',
    descripcion:
      'Diez minutos para ver qué tipo de ciudadano sos hoy y qué te falta para incidir de verdad.',
    indexacion: 'privada',
    og: 'evaluacion',
    ogPorDocumento: false,
  },
  {
    patron: '/objetivos',
    superficie: 'legado',
    titulo: 'Tus objetivos cívicos',
    descripcion:
      'Los compromisos que asumiste, en un solo lugar, con el paso que sigue a la vista.',
    indexacion: 'privada',
    og: 'objetivos',
    ogPorDocumento: false,
  },
  {
    patron: '/check-in-semanal',
    superficie: 'legado',
    titulo: 'El check-in semanal',
    descripcion:
      'Cinco minutos por semana para ver cómo te fue de verdad y ajustar lo que haga falta.',
    indexacion: 'privada',
    og: 'check-in',
    ogPorDocumento: false,
  },
  {
    patron: '/coaching',
    superficie: 'legado',
    titulo: 'Pensar en voz alta',
    descripcion:
      'Un espacio para pensar en voz alta y ordenar lo que querés hacer. Te acompañamos, no te dirigimos.',
    indexacion: 'privada',
    og: 'coaching',
    ogPorDocumento: false,
  },

  // ── El mandato ──────────────────────────────────────────────────────────
  {
    patron: '/mandato-vivo/pulso/:id',
    superficie: 'papel',
    titulo: 'Una señal del pulso',
    descripcion:
      'La ficha de una señal del pulso: qué se dijo, desde dónde y cómo entra al mandato.',
    indexacion: 'dinamica',
    og: 'mandato',
    ogPorDocumento: false,
    prefijoRewrite: '/mandato-vivo/pulso',
  },
  {
    patron: '/mandato-vivo/propuesta/:id',
    superficie: 'papel',
    titulo: 'Una propuesta del mandato',
    descripcion:
      'La ficha de una propuesta en votación: qué pide, quién la sostiene y cómo viene la cosa.',
    indexacion: 'dinamica',
    og: 'mandato',
    ogPorDocumento: false,
    prefijoRewrite: '/mandato-vivo/propuesta',
  },
  {
    patron: '/mandato-vivo',
    superficie: 'papel-oscuro',
    titulo: 'El mandato',
    descripcion:
      'El país ordenado por urgencia y redactado por su gente. El que quiera un cargo, firma esto — o explica por qué no.',
    indexacion: 'publica',
    og: 'mandato',
    ogPorDocumento: false,
  },
  {
    patron: '/mi-perfil',
    superficie: 'legado',
    titulo: 'Tu perfil',
    descripcion: 'Tus datos, tu actividad y lo que decidís mostrar. Todo se puede borrar.',
    indexacion: 'privada',
    og: 'perfil',
    ogPorDocumento: false,
  },
  {
    patron: '/clasificacion',
    superficie: 'legado',
    titulo: 'La clasificación',
    descripcion:
      'Quiénes vienen empujando más fuerte esta semana. Se cuenta con palitos, no con promesas.',
    indexacion: 'privada',
    og: 'clasificacion',
    ogPorDocumento: false,
  },
  {
    patron: '/desafios',
    superficie: 'legado',
    titulo: 'Los desafíos',
    descripcion: 'Retos concretos para pasar de la bronca a la acción, uno por vez.',
    indexacion: 'privada',
    og: 'desafios',
    ogPorDocumento: false,
  },

  // ── Contenido y comunidad ───────────────────────────────────────────────
  {
    patron: '/biblioteca',
    superficie: 'papel',
    titulo: 'La biblioteca',
    descripcion: DESCRIPCION_BIBLIOTECA,
    indexacion: 'publica',
    og: 'biblioteca',
    ogPorDocumento: false,
  },
  {
    patron: '/cronica',
    superficie: 'papel',
    titulo: 'La crónica del país que viene',
    // Escrita a mano: los cinco .mdx de content/cronica/ no tienen `summary`
    // (0 de 5), así que no hay de dónde derivar. Spec §2, «Hueco conocido».
    descripcion:
      'Ficción especulativa: cinco capítulos que imaginan, desde el futuro, qué pasaría si esto se usara en serio.',
    indexacion: 'publica',
    og: 'cronica',
    ogPorDocumento: false,
  },
  {
    patron: '/ensayos',
    superficie: 'papel',
    titulo: 'La biblioteca',
    descripcion: DESCRIPCION_BIBLIOTECA,
    indexacion: 'redireccion',
    og: 'biblioteca',
    ogPorDocumento: false,
    destino: '/biblioteca',
  },
  {
    patron: '/ensayos/:slug',
    superficie: 'papel',
    titulo: 'Los ensayos',
    descripcion:
      'Ensayos del hombre gris: textos largos para pensar el país y para pensarse a uno mismo.',
    indexacion: 'publica',
    og: 'ensayos',
    ogPorDocumento: true,
  },
  {
    patron: '/bitacora',
    superficie: 'papel',
    titulo: 'La bitácora',
    descripcion: DESCRIPCION_BITACORA,
    indexacion: 'publica',
    og: 'bitacora',
    ogPorDocumento: false,
  },
  {
    patron: '/bitacora/:slug',
    superficie: 'papel',
    titulo: 'La bitácora',
    descripcion: DESCRIPCION_BITACORA,
    indexacion: 'publica',
    og: 'bitacora',
    ogPorDocumento: true,
  },
  {
    patron: '/blog',
    superficie: 'papel',
    titulo: 'La bitácora',
    descripcion: DESCRIPCION_BITACORA,
    indexacion: 'redireccion',
    og: 'bitacora',
    ogPorDocumento: false,
    destino: '/bitacora',
  },
  {
    patron: '/blog/escribir',
    superficie: 'legado',
    titulo: 'Escribir una crónica',
    descripcion:
      'La herramienta para publicar una crónica en la bitácora. Necesitás la sesión iniciada.',
    indexacion: 'privada',
    og: 'bitacora',
    ogPorDocumento: false,
  },
  {
    patron: '/blog/:slug',
    superficie: 'papel',
    // `:actual` lo aporta la fuente de contenido: es el slug v2 del post, que no
    // coincide con el legacy (los legacy son las direcciones v1 sin acentos).
    // Ver `enumerarRedirecciones` en registro.ts y `CARGADORES_WEB` en fuente-web.ts.
    titulo: 'La bitácora',
    descripcion: DESCRIPCION_BITACORA,
    indexacion: 'redireccion',
    og: 'bitacora',
    ogPorDocumento: false,
    destino: '/bitacora/:actual',
  },
  {
    patron: '/entrenamientos/:slug/leccion/:n',
    superficie: 'papel',
    titulo: 'Los entrenamientos',
    descripcion:
      'Una lección del entrenamiento, para leer en el colectivo y aplicar el mismo día.',
    indexacion: 'publica',
    og: 'entrenamientos',
    ogPorDocumento: false,
  },
  {
    patron: '/entrenamientos/:slug/practica',
    superficie: 'papel',
    titulo: 'La práctica',
    descripcion:
      'La práctica del entrenamiento: preguntas para ver si te quedó, sin nota y sin ranking.',
    indexacion: 'publica',
    og: 'entrenamientos',
    ogPorDocumento: false,
  },
  {
    patron: '/entrenamientos/:slug',
    superficie: 'papel',
    titulo: 'Los entrenamientos',
    descripcion:
      'Un entrenamiento completo: para qué sirve, cuánto lleva y qué vas a poder hacer al terminarlo.',
    indexacion: 'publica',
    og: 'entrenamientos',
    ogPorDocumento: true,
  },
  {
    patron: '/entrenamientos',
    superficie: 'papel',
    titulo: 'Los entrenamientos',
    descripcion:
      'Para diseñar un país hace falta aprender a diseñar. Los entrenamientos son gratis y no piden cuenta.',
    indexacion: 'publica',
    og: 'entrenamientos',
    ogPorDocumento: false,
  },
  {
    patron: '/comunidad',
    superficie: 'legado',
    titulo: 'El feed comunitario',
    descripcion: 'Lo que están publicando los demás. Sin algoritmo que decida por vos.',
    indexacion: 'privada',
    og: 'comunidad',
    ogPorDocumento: false,
  },
  {
    patron: '/notificaciones',
    superficie: 'legado',
    titulo: 'Tu actividad reciente',
    descripcion:
      'Lo que pasó con tus voces, tus propuestas y tus compromisos desde la última vez.',
    indexacion: 'privada',
    og: 'notificaciones',
    ogPorDocumento: false,
  },

  // ── Iniciativas (servidas por la base: no se enumeran en build) ─────────
  {
    patron: '/iniciativas/:slug/documento',
    superficie: 'legado',
    titulo: 'El documento de la iniciativa',
    descripcion:
      'El documento completo de una iniciativa territorial, tal como lo escribieron sus impulsores.',
    indexacion: 'dinamica',
    og: 'iniciativas',
    ogPorDocumento: false,
    prefijoRewrite: '/iniciativas/documento',
  },
  {
    patron: '/iniciativas/:slug',
    superficie: 'legado',
    titulo: 'Una iniciativa',
    descripcion:
      'Qué propone una iniciativa territorial, quiénes la sostienen y cómo podés sumarte.',
    indexacion: 'dinamica',
    og: 'iniciativas',
    ogPorDocumento: false,
    prefijoRewrite: '/iniciativas',
  },

  // ── Datos abiertos y analítica ──────────────────────────────────────────
  {
    // `app-routes.tsx` NO monta una página acá: sirve `<Redirect to="/el-mapa#instrumento" replace />`.
    // Por eso es `redireccion` y no `publica` — clasificarla `publica` la metería en el
    // `sitemap.xml`, B11 le sellaría un `dist/explorar-datos/index.html` con título y
    // descripción de algo que no existe y B9 le generaría una tarjeta OG propia: se le
    // publicaría a Google una URL que redirige del lado del cliente. Título, descripción y
    // `og` son los del destino, como en las otras seis redirecciones.
    patron: '/explorar-datos',
    superficie: 'legado',
    titulo: 'El mapa de las voces',
    descripcion:
      'El país dicho por su gente: bastas, sueños, necesidades, compromisos y recursos, provincia por provincia.',
    indexacion: 'redireccion',
    og: 'el-mapa',
    ogPorDocumento: false,
    // El 301 de B11 pierde el fragmento: `#instrumento` nunca llega al servidor, así
    // que un host no lo puede conservar. Se acepta la pérdida a propósito — el redirect
    // del lado del cliente que hoy sí lo conserva sigue vivo para quien llegue con JS.
    destino: '/el-mapa',
  },
  {
    patron: '/datos-abiertos',
    superficie: 'legado',
    titulo: 'Datos abiertos',
    descripcion:
      'Lo que registra la red, disponible para todos: qué publicamos, en qué formato y cómo se descarga.',
    indexacion: 'publica',
    og: 'datos-abiertos',
    ogPorDocumento: false,
  },
  {
    patron: '/tablero',
    superficie: 'legado',
    titulo: '¿Cómo va la red?',
    descripcion: 'El tablero interno: cómo viene creciendo la red y dónde están los huecos.',
    indexacion: 'privada',
    og: 'tablero',
    ogPorDocumento: false,
  },
];
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec tsc --noEmit`
Esperado: PASA — el archivo tipa (`exactOptionalPropertyTypes` acepta las tres entradas con `destino`/`prefijoRewrite` porque están presentes literalmente, nunca como `undefined`).

- [ ] **Paso 5: Commit**

No se commitea solo: `entradas.ts` no lo importa nadie todavía y `eslint` marcaría `ENTRADAS` como export sin uso solo si hubiera una regla de exports muertos (no la hay), pero un commit sin consumidor no aporta. **Entra en el commit de la Tarea 3.** Marcar el paso y seguir.

---

### Tarea 3: `registro.ts` — matcheo, superficie y resolución de metadata

**Files:**
- Create: `apps/web/src/lib/rutas/registro.ts`
- Test: `apps/web/src/lib/rutas/__tests__/registro.test.ts`
- Modify: `docs/specs/2026-07-26-el-sustrato.md` (bloque «Decisiones del dueño del proyecto»: se agrega **D5**, ver Paso 4)

**Interfaces:**
- Consumes: `descripcionDe` (`./descripcion-de`, Tarea 1) · `ENTRADAS`, `EntradaRegistro`, `Indexacion`, `Superficie` (`./entradas`, Tarea 2).
- Produces: `REGISTRO`, `ORIGEN_CANONICO`, `SUFIJO_TITULO`, `LARGO_MAXIMO_TITULO`, `OG_POR_DEFECTO`, `TARJETA_TWITTER`, `componerTitulo()`, `superficieDe()`, `esRutaPapel()`, `CoincidenciaRuta`, `buscarEntrada()`, `DocumentoDeRuta`, `FuenteDeContenido`, `FUENTE_VACIA`, `resolverDocumento()`, `rutaOg()`, `OpcionesDeResolucion`, `MetadataDeRuta`, `robotsDe()`, `resolverMetadata()`. Más los tres tipos re-exportados de `./entradas`.

> **Decisión nueva que esta tarea introduce y que hay que subir a la spec — D5.** La spec §1
> dice de los cuatro patrones servidos por DB sólo que «se marcan `dinamica`, heredan la
> metadata de su sección y quedan fuera del sitemap», y reserva el `noindex` para las
> `privada` (§3). `ROBOTS_POR_INDEXACION` de esta tarea agrega además
> `dinamica → 'noindex,follow'`, lo que con el rewrite por prefijo de §3 saca de los
> buscadores **todas** las iniciativas territoriales y **todas** las señales y propuestas del
> mandato — contenido público y central. La justificación está en el JSDoc de la constante y
> es sólida (el shell es idéntico para cada `:id`: indexarlo publica cientos de URLs con la
> misma metadata), pero **no puede quedar enterrada en una constante privada**. Antes de
> cerrar esta tarea: agregar la decisión a `docs/specs/2026-07-26-el-sustrato.md` como **D5 ·
> Los shells dinámicos van `noindex,follow`**, en el bloque «Decisiones del dueño del
> proyecto», con esa justificación y con la condición de reversión (cuando ② le dé metadata
> propia a `/iniciativas/:slug`, la fila vuelve a `null`). **Eso es el Paso 4 de esta tarea**,
> con la redacción exacta y con la spec sumada al `git add` del commit: no es una nota al pie,
> es un paso con casilla — lo que no es aceptable es shippearla sin que esté escrita en algún
> lado que no sea código.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/lib/rutas/__tests__/registro.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { LARGO_MAXIMO_DESCRIPCION } from '../descripcion-de';
import {
  buscarEntrada,
  componerTitulo,
  esRutaPapel,
  FUENTE_VACIA,
  LARGO_MAXIMO_TITULO,
  OG_POR_DEFECTO,
  ORIGEN_CANONICO,
  REGISTRO,
  resolverDocumento,
  resolverMetadata,
  robotsDe,
  rutaOg,
  SUFIJO_TITULO,
  superficieDe,
  type FuenteDeContenido,
} from '../registro';

const ORIGEN = 'https://ejemplo.test';

const FUENTE: FuenteDeContenido = {
  '/planes/:slug': [
    {
      params: { slug: 'planeb' },
      titulo: 'Empresas que no son de nadie',
      summary: 'Las Empresas Bastardas no tienen dueño. Se gobiernan solas y venden al costo.',
    },
  ],
  '/ensayos/:slug': [
    {
      params: { slug: 'presidencia' },
      titulo: 'La presidencia',
      summary: 'Un summary cualquiera. Con dos oraciones.',
      descripcionMeta: 'La descripción escrita a mano del ensayo.',
    },
  ],
};

describe('canon del registro', () => {
  it('tiene 54 entradas con patrón único', () => {
    expect(REGISTRO).toHaveLength(54);
    expect(new Set(REGISTRO.map((e) => e.patron)).size).toBe(54);
  });

  it('reparte las superficies como manda la spec: 22 papel + 32 legado', () => {
    const papel = REGISTRO.filter((e) => e.superficie !== 'legado');
    const oscuras = REGISTRO.filter((e) => e.superficie === 'papel-oscuro');
    expect(papel).toHaveLength(22);
    expect(REGISTRO.filter((e) => e.superficie === 'legado')).toHaveLength(32);
    expect(oscuras.map((e) => e.patron)).toEqual(['/planes/:slug', '/mandato-vivo']);
  });

  it('reparte la indexación como manda la spec', () => {
    const contar = (i: string) => REGISTRO.filter((e) => e.indexacion === i).length;
    expect(contar('publica')).toBe(23);
    expect(contar('privada')).toBe(19);
    // 8, no 7: `/explorar-datos` es un `<Redirect>` en `app-routes.tsx`, no una página.
    expect(contar('redireccion')).toBe(8);
    expect(contar('dinamica')).toBe(4);
  });

  it('solo las redirecciones llevan destino y solo las dinámicas llevan prefijo', () => {
    for (const entrada of REGISTRO) {
      if (entrada.indexacion === 'redireccion') {
        expect(entrada.destino, entrada.patron).toBeDefined();
      } else {
        expect(entrada.destino, entrada.patron).toBeUndefined();
      }
      if (entrada.indexacion === 'dinamica') {
        expect(entrada.prefijoRewrite, entrada.patron).toBeDefined();
      } else {
        expect(entrada.prefijoRewrite, entrada.patron).toBeUndefined();
      }
    }
  });

  it('respeta los largos de §14 y de §2', () => {
    for (const entrada of REGISTRO) {
      expect(entrada.titulo, entrada.patron).not.toBe('');
      expect(entrada.titulo, entrada.patron).not.toContain('¡BASTA!');
      expect(componerTitulo(entrada.titulo).length, entrada.patron).toBeLessThanOrEqual(
        LARGO_MAXIMO_TITULO,
      );
      expect(entrada.descripcion.length, entrada.patron).toBeLessThanOrEqual(
        LARGO_MAXIMO_DESCRIPCION,
      );
      expect(entrada.descripcion, entrada.patron).not.toBe('');
    }
  });
});

describe('componerTitulo (§14 de la ley)', () => {
  it('compone «{Página} — ¡BASTA!» y es el único lugar que lo hace', () => {
    expect(componerTitulo('La idea')).toBe(`La idea${SUFIJO_TITULO}`);
    expect(componerTitulo('La idea')).toBe('La idea — ¡BASTA!');
  });
});

describe('buscarEntrada', () => {
  it('matchea la raíz', () => {
    expect(buscarEntrada('/')?.entrada.patron).toBe('/');
    expect(buscarEntrada('/')?.params).toEqual({});
  });

  it('captura los parámetros del patrón', () => {
    expect(buscarEntrada('/planes/planeb')?.params).toEqual({ slug: 'planeb' });
    expect(buscarEntrada('/entrenamientos/basta-101/leccion/3')?.params).toEqual({
      slug: 'basta-101',
      n: '3',
    });
  });

  it('respeta el orden del <Switch>: lo específico gana', () => {
    expect(buscarEntrada('/entrenamientos/x/practica')?.entrada.patron).toBe(
      '/entrenamientos/:slug/practica',
    );
    expect(buscarEntrada('/iniciativas/x/documento')?.entrada.patron).toBe(
      '/iniciativas/:slug/documento',
    );
    expect(buscarEntrada('/blog/escribir')?.entrada.patron).toBe('/blog/escribir');
    expect(buscarEntrada('/blog/cualquiera')?.entrada.patron).toBe('/blog/:slug');
  });

  it('devuelve undefined para lo que no está en el registro', () => {
    expect(buscarEntrada('/no-existe')).toBeUndefined();
    expect(buscarEntrada('/cronica/algo')).toBeUndefined();
  });

  it('ignora query y hash y la barra final', () => {
    expect(buscarEntrada('/planes/planeb?x=1#ficha')?.params).toEqual({ slug: 'planeb' });
    expect(buscarEntrada('/biblioteca/')?.entrada.patron).toBe('/biblioteca');
  });
});

describe('superficieDe / esRutaPapel', () => {
  it('devuelve la superficie de la entrada', () => {
    expect(superficieDe('/')).toBe('papel');
    expect(superficieDe('/planes/planeb')).toBe('papel-oscuro');
    expect(superficieDe('/mandato-vivo')).toBe('papel-oscuro');
    expect(superficieDe('/ingresar')).toBe('legado');
    expect(superficieDe('/blog/escribir')).toBe('legado');
  });

  it('cae a legado en lo que no matchea nada (el catch-all del <Switch>)', () => {
    expect(superficieDe('/cuaderno')).toBe('legado');
  });

  it('esRutaPapel es superficieDe !== legado', () => {
    expect(esRutaPapel('/mandato-vivo/pulso/42')).toBe(true);
    expect(esRutaPapel('/blog/escribir')).toBe(false);
    expect(esRutaPapel('/bitacoraque')).toBe(false);
  });
});

describe('resolverDocumento', () => {
  it('encuentra el documento cuyos params coinciden', () => {
    expect(resolverDocumento('/planes/:slug', { slug: 'planeb' }, FUENTE)?.titulo).toBe(
      'Empresas que no son de nadie',
    );
  });

  it('devuelve undefined si el patrón no está en la fuente o el documento no existe', () => {
    expect(resolverDocumento('/planes/:slug', { slug: 'nope' }, FUENTE)).toBeUndefined();
    expect(resolverDocumento('/bitacora/:slug', { slug: 'x' }, FUENTE)).toBeUndefined();
    expect(resolverDocumento('/planes/:slug', { slug: 'planeb' }, FUENTE_VACIA)).toBeUndefined();
  });
});

describe('rutaOg', () => {
  it('usa la tarjeta de sección cuando ogPorDocumento es false', () => {
    const home = REGISTRO[0];
    expect(home).toBeDefined();
    if (home) expect(rutaOg(home, {})).toBe('/og/home.png');
  });

  it('usa la tarjeta por documento cuando ogPorDocumento es true', () => {
    const plan = REGISTRO.find((e) => e.patron === '/planes/:slug');
    expect(plan).toBeDefined();
    if (plan) {
      expect(rutaOg(plan, { slug: 'planeb' })).toBe('/og/planes/planeb.png');
      expect(rutaOg(plan, {})).toBe('/og/planes.png');
    }
  });
});

describe('robotsDe', () => {
  it('solo las públicas y las redirecciones van sin meta robots', () => {
    expect(robotsDe('publica')).toBeNull();
    expect(robotsDe('redireccion')).toBeNull();
    expect(robotsDe('privada')).toBe('noindex,nofollow');
    expect(robotsDe('dinamica')).toBe('noindex,follow');
  });
});

describe('resolverMetadata', () => {
  const opciones = { origen: ORIGEN, fuente: FUENTE };

  it('resuelve una ruta estática desde su entrada', () => {
    const m = resolverMetadata('/la-idea', opciones);
    expect(m.titulo).toBe('La idea — ¡BASTA!');
    expect(m.canonica).toBe(`${ORIGEN}/la-idea`);
    expect(m.og).toBe(`${ORIGEN}/og/la-idea.png`);
    expect(m.robots).toBeNull();
    expect(m.superficie).toBe('papel');
    expect(m.indexacion).toBe('publica');
  });

  it('el documento le gana a la sección en título y descripción', () => {
    const m = resolverMetadata('/planes/planeb', opciones);
    expect(m.titulo).toBe('Empresas que no son de nadie — ¡BASTA!');
    expect(m.descripcion).toBe('Las Empresas Bastardas no tienen dueño.');
    expect(m.og).toBe(`${ORIGEN}/og/planes/planeb.png`);
  });

  it('la descripcionMeta del documento le gana al summary', () => {
    expect(resolverMetadata('/ensayos/presidencia', opciones).descripcion).toBe(
      'La descripción escrita a mano del ensayo.',
    );
  });

  it('una ruta dinámica sin documento hereda la metadata de su sección', () => {
    const m = resolverMetadata('/planes/no-existe', opciones);
    expect(m.titulo).toBe('La prueba — ¡BASTA!');
    expect(m.og).toBe(`${ORIGEN}/og/planes/no-existe.png`);
  });

  it('sella las privadas con noindex,nofollow', () => {
    expect(resolverMetadata('/ingresar', opciones).robots).toBe('noindex,nofollow');
  });

  it('la ruta desconocida cae en la metadata de extraviada, con la OG por defecto', () => {
    const m = resolverMetadata('/no-existe', opciones);
    expect(m.titulo).toBe('Página extraviada — ¡BASTA!');
    expect(m.robots).toBe('noindex,nofollow');
    expect(m.superficie).toBe('legado');
    expect(m.og).toBe(`${ORIGEN}${OG_POR_DEFECTO}`);
  });

  it('la descripción resuelta nunca supera el máximo, patrón por patrón', () => {
    for (const entrada of REGISTRO) {
      // Se sustituyen los parámetros por un valor concreto en vez de truncar el patrón:
      // `patron.split(':')[0]` convertiría `/planes/:slug` en `/planes/` y
      // `/mandato-vivo/pulso/:id` en `/mandato-vivo/pulso/`, que no matchean nada y caen
      // en EXTRAVIADA — los 12 patrones dinámicos no se ejercitarían por su propio patrón.
      const ruta = entrada.patron.replace(/:([^/]+)/gu, 'x');
      const m = resolverMetadata(ruta, opciones);
      expect(m.descripcion.length, entrada.patron).toBeLessThanOrEqual(LARGO_MAXIMO_DESCRIPCION);
      // `/planes/x` no existe en la fuente: tiene que caer en la descripción de sección,
      // no en EXTRAVIADA. Es la rama «documento ausente» de un patrón dinámico.
      expect(m.superficie, entrada.patron).toBe(entrada.superficie);
    }
  });

  it('el origen se pasa, nunca se lee de env: la constante canónica es el default del llamador', () => {
    expect(ORIGEN_CANONICO).toBe('https://elinstantedelhombregris.com');
    expect(ORIGEN_CANONICO.endsWith('/')).toBe(false);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas/__tests__/registro.test.ts`
Esperado: FALLA con `Failed to resolve import "../registro"`.

- [ ] **Paso 3: Implementación mínima**

Crear `apps/web/src/lib/rutas/registro.ts`:

```ts
/**
 * Fuente única de verdad de las rutas: superficie de tema + metadata + política
 * de indexación, con la fuente de contenido INYECTADA por el llamador.
 *
 * CERO Vite, CERO alias `~/`, CERO `import.meta.env`, CERO builtins de node — es
 * el único módulo que importan a la vez el runtime de `apps/web` y los scripts
 * que corren bajo `tsx`. Reemplaza a `layouts/papel-routes.ts` como origen de
 * `esRutaPapel()`.
 *
 * Los datos viven en `./entradas`; acá vive el comportamiento.
 * Spec: `docs/specs/2026-07-26-el-sustrato.md` §1, §2, §3.
 */
import { descripcionDe } from './descripcion-de';
import { ENTRADAS, type EntradaRegistro, type Indexacion, type Superficie } from './entradas';

export type { EntradaRegistro, Indexacion, Superficie } from './entradas';

/** Ordenado EXACTAMENTE como el `<Switch>` de `app-routes.tsx`: `buscarEntrada` recorre en orden y devuelve la primera coincidencia. */
export const REGISTRO: readonly EntradaRegistro[] = ENTRADAS;

export const ORIGEN_CANONICO = 'https://elinstantedelhombregris.com';
export const SUFIJO_TITULO = ' — ¡BASTA!';
export const LARGO_MAXIMO_TITULO = 60;
export const OG_POR_DEFECTO = '/og/default.png';
export const TARJETA_TWITTER = 'summary_large_image';

/** §14 de la ley: «{Página} — ¡BASTA!». Única composición del sitio; nadie más concatena el sufijo. */
export function componerTitulo(titulo: string): string {
  return `${titulo}${SUFIJO_TITULO}`;
}

/**
 * Entrada sintética para lo que cae en el catch-all `<Route component={NotFound} />`,
 * que no declara `path` y por lo tanto no está —ni puede estar— en el registro.
 */
const EXTRAVIADA: EntradaRegistro = {
  patron: '(sin ruta)',
  superficie: 'legado',
  titulo: 'Página extraviada',
  descripcion: 'Esta dirección no existe. Volvé al inicio y buscá por el recorrido.',
  indexacion: 'privada',
  og: 'default',
  ogPorDocumento: false,
};

function partir(valor: string): string[] {
  return valor.split('/').filter((segmento) => segmento !== '');
}

/** Saca query, hash y barra final. wouter entrega la ruta limpia, pero los scripts no siempre. */
function normalizarRuta(ruta: string): string {
  const sinHash = ruta.split('#')[0] ?? '';
  const sinQuery = sinHash.split('?')[0] ?? '';
  if (sinQuery === '' || sinQuery === '/') return '/';
  return sinQuery.endsWith('/') ? sinQuery.slice(0, -1) : sinQuery;
}

function coincidir(
  patron: string,
  ruta: string,
): Readonly<Record<string, string>> | undefined {
  const segmentosPatron = partir(patron);
  const segmentosRuta = partir(ruta);
  if (segmentosPatron.length !== segmentosRuta.length) return undefined;

  const params: Record<string, string> = {};
  for (let i = 0; i < segmentosPatron.length; i += 1) {
    const esperado = segmentosPatron[i];
    const recibido = segmentosRuta[i];
    if (esperado === undefined || recibido === undefined) return undefined;
    if (esperado.startsWith(':')) {
      params[esperado.slice(1)] = recibido;
      continue;
    }
    if (esperado !== recibido) return undefined;
  }
  return params;
}

export interface CoincidenciaRuta {
  readonly entrada: EntradaRegistro;
  /** Parámetros capturados del patrón. `{}` en las rutas estáticas. */
  readonly params: Readonly<Record<string, string>>;
}

export function buscarEntrada(ruta: string): CoincidenciaRuta | undefined {
  const normal = normalizarRuta(ruta);
  for (const entrada of REGISTRO) {
    const params = coincidir(entrada.patron, normal);
    if (params !== undefined) return { entrada, params };
  }
  return undefined;
}

export function superficieDe(location: string): Superficie {
  return buscarEntrada(location)?.entrada.superficie ?? 'legado';
}

/** Reimplementación exacta de la de `layouts/papel-routes.ts`: `superficieDe(location) !== 'legado'`. */
export function esRutaPapel(location: string): boolean {
  return superficieDe(location) !== 'legado';
}

export interface DocumentoDeRuta {
  /** Valores de los parámetros del patrón: `{ slug: 'planeb' }`, `{ slug: 'basta-101', n: '3' }`. */
  readonly params: Readonly<Record<string, string>>;
  /** Título propio del documento, SIN sufijo de marca. */
  readonly titulo: string;
  /** `summary` crudo del frontmatter. `''` cuando el contenido no lo trae (crónica). */
  readonly summary: string;
  /** Frontmatter `descripcionMeta`: gana sobre `summary` cuando existe. */
  readonly descripcionMeta?: string;
}

/** Fuente de datos INYECTADA. Clave = `patron` del registro; valor = todos sus documentos. */
export type FuenteDeContenido = Readonly<Record<string, readonly DocumentoDeRuta[]>>;

export const FUENTE_VACIA: FuenteDeContenido = {};

/** Busca en la fuente el documento cuyos `params` coinciden con los pedidos. `undefined` = ruta dinámica sin documento (hereda la metadata de sección). */
export function resolverDocumento(
  patron: string,
  params: Readonly<Record<string, string>>,
  fuente: FuenteDeContenido,
): DocumentoDeRuta | undefined {
  const documentos = fuente[patron];
  if (documentos === undefined) return undefined;
  const pedidos = Object.entries(params);
  if (pedidos.length === 0) return undefined;
  return documentos.find((documento) =>
    pedidos.every(([clave, valor]) => documento.params[clave] === valor),
  );
}

export function rutaOg(
  entrada: EntradaRegistro,
  params: Readonly<Record<string, string>>,
): string {
  const slug = params['slug'];
  if (!entrada.ogPorDocumento || slug === undefined || slug === '') {
    return `/og/${entrada.og}.png`;
  }
  return `/og/${entrada.og}/${slug}.png`;
}

export interface OpcionesDeResolucion {
  /** Origen absoluto sin barra final. El llamador lo pasa: este módulo no lee env. */
  readonly origen: string;
  readonly fuente: FuenteDeContenido;
}

export interface MetadataDeRuta {
  /** `<title>` YA compuesto con `componerTitulo`. */
  readonly titulo: string;
  readonly descripcion: string;
  readonly indexacion: Indexacion;
  readonly superficie: Superficie;
  /** URL canónica absoluta. */
  readonly canonica: string;
  /** `og:image` absoluta. Nunca vacía: cae a `OG_POR_DEFECTO`. */
  readonly og: string;
  /** Contenido de `<meta name="robots">`, o `null` si no lleva. */
  readonly robots: string | null;
}

/**
 * DECISIÓN **D5**, que este plan sube a la spec (ver la nota del Paso 3): las dinámicas
 * van `noindex,follow`. La spec §1 sólo pide que queden fuera del sitemap y hereden la
 * metadata de su sección; el `noindex` lo agrega este bloque a propósito, porque con el
 * rewrite por prefijo de §3 cada `/iniciativas/:slug` y cada `/mandato-vivo/pulso/:id`
 * devuelve **el mismo** shell de sección: indexarlas sería publicarle a Google cientos de
 * URLs con título y descripción idénticos, que es exactamente lo que un buscador penaliza
 * como contenido duplicado. El `follow` mantiene vivos los enlaces salientes, así que la
 * iniciativa territorial no queda huérfana del grafo: queda fuera del índice, no fuera de
 * la web.
 *
 * **Es reversible y ② la revisa.** Cuando `/iniciativas/:slug` y las señales del mandato
 * tengan metadata propia —resuelta por API en el sellado o por prerender—, dejan de ser
 * shells duplicados y esta fila pasa a `null`. Anotarlo en el DoD de esas páginas en ②.
 *
 * Las redirecciones no emiten archivo, así que su meta robots nunca se imprime.
 */
const ROBOTS_POR_INDEXACION: Readonly<Record<Indexacion, string | null>> = {
  publica: null,
  privada: 'noindex,nofollow',
  dinamica: 'noindex,follow',
  redireccion: null,
};

export function robotsDe(indexacion: Indexacion): string | null {
  return ROBOTS_POR_INDEXACION[indexacion];
}

function componerMetadata(
  entrada: EntradaRegistro,
  params: Readonly<Record<string, string>>,
  ruta: string,
  opciones: OpcionesDeResolucion,
): MetadataDeRuta {
  const documento = resolverDocumento(entrada.patron, params, opciones.fuente);
  const descripcion = descripcionDe(
    documento === undefined
      ? { summary: '' }
      : {
          summary: documento.summary,
          ...(documento.descripcionMeta !== undefined
            ? { descripcionMeta: documento.descripcionMeta }
            : {}),
        },
    entrada.descripcion,
  );

  return {
    titulo: componerTitulo(documento?.titulo ?? entrada.titulo),
    descripcion,
    indexacion: entrada.indexacion,
    superficie: entrada.superficie,
    canonica: `${opciones.origen}${ruta}`,
    og: `${opciones.origen}${rutaOg(entrada, params)}`,
    robots: robotsDe(entrada.indexacion),
  };
}

export function resolverMetadata(ruta: string, opciones: OpcionesDeResolucion): MetadataDeRuta {
  const normal = normalizarRuta(ruta);
  const coincidencia = buscarEntrada(normal);
  return componerMetadata(
    coincidencia?.entrada ?? EXTRAVIADA,
    coincidencia?.params ?? {},
    normal,
    opciones,
  );
}
```

> `componerMetadata`, `partir`, `coincidir` y `normalizarRuta` son privadas del módulo a propósito: la Tarea 4 las usa desde adentro del mismo archivo, sin re-exportarlas. No agregues un `export` para ellas.

- [ ] **Paso 4: Escribir D5 en la spec — la decisión no puede vivir en un JSDoc**

`ROBOTS_POR_INDEXACION` acaba de convertir en canon de hecho una política que la spec no
pide (`dinamica → 'noindex,follow'`), y el test de `robotsDe` ya la protege. Este paso
existe para que quede escrita donde se la pueda discutir. **No es opcional y no se puede
saltear marcando la casilla**: si no se hace, el plan cierra con una decisión de producto
enterrada en una constante privada.

En `docs/specs/2026-07-26-el-sustrato.md`, en el bloque «Decisiones del dueño del
proyecto», después de D4, agregar:

```md
**D5 · Los shells dinámicos van `noindex,follow`.** Los cuatro patrones servidos por DB
(§1) devuelven un shell idéntico para cada `:id`: indexarlos publicaría cientos de URLs
con la misma metadata heredada de su sección, que es contenido duplicado. Se marcan
`noindex,follow` —el `follow` deja pasar el link juice hacia las secciones, que sí se
indexan— y quedan fuera del sitemap. **Condición de reversión:** cuando ② le dé metadata
propia a `/iniciativas/:slug` y a los tres patrones del mandato, la fila vuelve a `null` y
se ajustan el test de `robotsDe` y el del shell dinámico.
```

**Si el dueño del proyecto rechaza la decisión**, la salida no es dejarla sin escribir: la
fila de `ROBOTS_POR_INDEXACION` pasa a `null`, y se ajustan el caso
`expect(robotsDe('dinamica')).toBe('noindex,follow')` del Paso 1 y el del shell dinámico.

- [ ] **Paso 5: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas`
Esperado: PASA — los ~25 tests de `registro.test.ts` más los 15 de `descripcion-de.test.ts`.

Después: `pnpm -C apps/web exec eslint src/lib/rutas --max-warnings 0` → sin salida.

- [ ] **Paso 6: Commit**

```bash
git add apps/web/src/lib/rutas/entradas.ts \
        apps/web/src/lib/rutas/registro.ts \
        apps/web/src/lib/rutas/__tests__/registro.test.ts \
        docs/specs/2026-07-26-el-sustrato.md
git commit -m "feat(web): un solo registro de rutas con superficie, metadata e indexación para las 54 rutas"
```

---

### Tarea 4: `registro.ts` — enumeración de URLs, sitemap y redirecciones

**Files:**
- Modify: `apps/web/src/lib/rutas/registro.ts` (agregar al final, después de `resolverMetadata`)
- Test: `apps/web/src/lib/rutas/__tests__/registro-enumeracion.test.ts`

**Interfaces:**
- Consumes: `REGISTRO`, `componerMetadata` (privada), `sustituir` (privada), `MetadataDeRuta`, `OpcionesDeResolucion`, `EntradaRegistro`, `FuenteDeContenido` — todo del mismo archivo.
- Produces: `UrlDelSitio`, `enumerarUrls()`, `entraAlSitemap()`, `Redireccion`, `enumerarRedirecciones()`. Los consumen `scripts/build/sellar-head.ts`, `scripts/build/prerender.ts` y `scripts/build/build-og-cards.ts` (bloques B9/B11/B12, planes hermanos).

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/lib/rutas/__tests__/registro-enumeracion.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  entraAlSitemap,
  enumerarRedirecciones,
  enumerarUrls,
  FUENTE_VACIA,
  REGISTRO,
  type FuenteDeContenido,
} from '../registro';

const ORIGEN = 'https://ejemplo.test';

const FUENTE: FuenteDeContenido = {
  '/planes/:slug': [
    { params: { slug: 'planeb' }, titulo: 'Empresas que no son de nadie', summary: 'Sin dueño.' },
    { params: { slug: 'planruta' }, titulo: 'La ruta de arranque', summary: 'El meta-plan.' },
  ],
  '/ensayos/:slug': [
    { params: { slug: 'presidencia' }, titulo: 'La presidencia', summary: 'Un ensayo.' },
  ],
  '/blog/:slug': [
    {
      params: { slug: 'el-cristo-que-llevs-dentro', actual: 'el-cristo-que-llevas-dentro' },
      titulo: 'El Cristo que llevás dentro',
      summary: 'Hoy es Pascuas.',
    },
  ],
};

const OPCIONES = { origen: ORIGEN, fuente: FUENTE };

describe('enumerarUrls', () => {
  const urls = enumerarUrls(OPCIONES);
  const rutas = urls.map((u) => u.ruta);

  it('nunca incluye una redirección', () => {
    for (const url of urls) {
      expect(url.entrada.indexacion, url.ruta).not.toBe('redireccion');
    }
    expect(rutas).not.toContain('/la-vision');
    expect(rutas).not.toContain('/blog/el-cristo-que-llevs-dentro');
  });

  it('incluye todas las estáticas públicas y privadas', () => {
    expect(rutas).toContain('/');
    expect(rutas).toContain('/la-idea');
    expect(rutas).toContain('/ingresar');
    expect(rutas).toContain('/tablero');
  });

  it('expande las dinámicas desde la fuente, nunca desde una lista escrita a mano', () => {
    expect(rutas).toContain('/planes/planeb');
    expect(rutas).toContain('/planes/planruta');
    expect(rutas).toContain('/ensayos/presidencia');
    expect(rutas).not.toContain('/bitacora/lo-que-sea');
  });

  it('emite un solo shell por patrón dinámico, en su prefijo de rewrite', () => {
    expect(rutas).toContain('/mandato-vivo/pulso');
    expect(rutas).toContain('/mandato-vivo/propuesta');
    expect(rutas).toContain('/iniciativas');
    expect(rutas).toContain('/iniciativas/documento');
  });

  it('el shell dinámico hereda la metadata de su sección y va noindex', () => {
    const shell = urls.find((u) => u.ruta === '/mandato-vivo/pulso');
    expect(shell).toBeDefined();
    expect(shell?.metadata.titulo).toBe('Una señal del pulso — ¡BASTA!');
    expect(shell?.metadata.robots).toBe('noindex,follow');
  });

  it('no emite una ruta dos veces', () => {
    expect(new Set(rutas).size).toBe(rutas.length);
  });

  it('con la fuente vacía solo salen las estáticas y los shells', () => {
    const vacias = enumerarUrls({ origen: ORIGEN, fuente: FUENTE_VACIA }).map((u) => u.ruta);
    expect(vacias).toContain('/');
    expect(vacias).toContain('/iniciativas');
    expect(vacias.some((r) => r.includes(':'))).toBe(false);
    expect(vacias).not.toContain('/planes/planeb');
  });
});

describe('entraAlSitemap', () => {
  it('solo entran las públicas', () => {
    for (const url of enumerarUrls(OPCIONES)) {
      expect(entraAlSitemap(url), url.ruta).toBe(url.entrada.indexacion === 'publica');
    }
  });

  it('deja afuera el login y los shells dinámicos', () => {
    const urls = enumerarUrls(OPCIONES);
    const enSitemap = urls.filter(entraAlSitemap).map((u) => u.ruta);
    expect(enSitemap).not.toContain('/ingresar');
    expect(enSitemap).not.toContain('/iniciativas');
    expect(enSitemap).toContain('/planes/planeb');
  });
});

describe('enumerarRedirecciones', () => {
  it('emite las 7 rutas de redirect puro con la fuente vacía', () => {
    const puras = enumerarRedirecciones(FUENTE_VACIA);
    expect(puras).toHaveLength(7);
    expect(puras).toContainEqual({ desde: '/la-vision', hacia: '/la-idea' });
    expect(puras).toContainEqual({ desde: '/el-instante-del-hombre-gris', hacia: '/la-idea' });
    expect(puras).toContainEqual({ desde: '/la-semilla-de-basta', hacia: '/sembrar' });
    expect(puras).toContainEqual({ desde: '/una-ruta-para-argentina', hacia: '/la-idea' });
    expect(puras).toContainEqual({ desde: '/ensayos', hacia: '/biblioteca' });
    expect(puras).toContainEqual({ desde: '/blog', hacia: '/bitacora' });
    // `/explorar-datos` es un `<Redirect>` de `app-routes.tsx`, no una página.
    expect(puras).toContainEqual({ desde: '/explorar-datos', hacia: '/el-mapa' });
  });

  it('expande los legacySlugs del blog al slug v2 real', () => {
    expect(enumerarRedirecciones(FUENTE)).toContainEqual({
      desde: '/blog/el-cristo-que-llevs-dentro',
      hacia: '/bitacora/el-cristo-que-llevas-dentro',
    });
  });

  it('nunca emite una redirección que no esté marcada como tal', () => {
    const desde = new Set(enumerarRedirecciones(FUENTE).map((r) => r.desde));
    for (const entrada of REGISTRO) {
      if (entrada.indexacion === 'redireccion') continue;
      expect(desde.has(entrada.patron), entrada.patron).toBe(false);
    }
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas/__tests__/registro-enumeracion.test.ts`
Esperado: FALLA con `"enumerarUrls" is not exported by "src/lib/rutas/registro.ts"`.

- [ ] **Paso 3: Implementación mínima**

Agregar al final de `apps/web/src/lib/rutas/registro.ts`:

```ts
/** Rearma una ruta concreta a partir de un patrón y sus parámetros. */
function sustituir(patron: string, params: Readonly<Record<string, string>>): string {
  const segmentos = partir(patron).map((segmento) =>
    segmento.startsWith(':') ? (params[segmento.slice(1)] ?? '') : segmento,
  );
  return `/${segmentos.join('/')}`;
}

export interface UrlDelSitio {
  /** Ruta absoluta sin origen ni barra final («/planes/planeb»). En `dinamica` es el `prefijoRewrite`. */
  readonly ruta: string;
  readonly entrada: EntradaRegistro;
  readonly metadata: MetadataDeRuta;
}

/**
 * Toda URL que recibe archivo sellado: `publica` + `privada` + un shell por
 * patrón `dinamica`. NUNCA incluye `redireccion`.
 *
 * Las `privada` llevan archivo aunque no se indexen: sin catch-all en el host,
 * una ruta sin archivo devuelve 404 y el login rompe en producción (spec §3).
 */
export function enumerarUrls(opciones: OpcionesDeResolucion): readonly UrlDelSitio[] {
  const urls: UrlDelSitio[] = [];
  const vistas = new Set<string>();

  const agregar = (
    ruta: string,
    entrada: EntradaRegistro,
    params: Readonly<Record<string, string>>,
  ): void => {
    if (vistas.has(ruta)) return;
    vistas.add(ruta);
    urls.push({ ruta, entrada, metadata: componerMetadata(entrada, params, ruta, opciones) });
  };

  for (const entrada of REGISTRO) {
    if (entrada.indexacion === 'redireccion') continue;

    if (entrada.indexacion === 'dinamica') {
      // Sin params: el shell de sección no conoce ningún `:id` concreto.
      if (entrada.prefijoRewrite !== undefined) agregar(entrada.prefijoRewrite, entrada, {});
      continue;
    }

    if (!entrada.patron.includes(':')) {
      agregar(entrada.patron, entrada, {});
      continue;
    }

    // Los slugs salen SIEMPRE de la fuente inyectada: el catálogo en disco pasa
    // de 23 a 27 planes sin tocar una línea de este archivo.
    for (const documento of opciones.fuente[entrada.patron] ?? []) {
      agregar(sustituir(entrada.patron, documento.params), entrada, documento.params);
    }
  }

  return urls;
}

export function entraAlSitemap(url: UrlDelSitio): boolean {
  return url.entrada.indexacion === 'publica';
}

export interface Redireccion {
  readonly desde: string;
  readonly hacia: string;
}

/** Las 7 rutas de redirect puro (las 6 del contrato + `/explorar-datos`, que en `app-routes.tsx` es un `<Redirect>`) + los 17 `legacySlugs` del blog. Única fuente de los 301 de `v2/vercel.json`. */
export function enumerarRedirecciones(fuente: FuenteDeContenido): readonly Redireccion[] {
  const redirecciones: Redireccion[] = [];

  for (const entrada of REGISTRO) {
    if (entrada.indexacion !== 'redireccion') continue;
    const destino = entrada.destino;
    if (destino === undefined) continue;

    if (!entrada.patron.includes(':')) {
      redirecciones.push({ desde: entrada.patron, hacia: destino });
      continue;
    }

    for (const documento of fuente[entrada.patron] ?? []) {
      redirecciones.push({
        desde: sustituir(entrada.patron, documento.params),
        hacia: sustituir(destino, documento.params),
      });
    }
  }

  return redirecciones;
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas && pnpm -C apps/web exec eslint src/lib/rutas --max-warnings 0`
Esperado: PASA — 14 tests nuevos verdes, eslint sin salida.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/lib/rutas/registro.ts \
        apps/web/src/lib/rutas/__tests__/registro-enumeracion.test.ts
git commit -m "feat(web): el registro enumera las URLs selladas, el sitemap y los 301 desde la fuente inyectada"
```

---

### Tarea 5: `papel-routes.ts` se vacía de datos y pasa a ser el puente

**Files:**
- Modify: `apps/web/src/layouts/papel-routes.ts` (se reemplaza entero: 60 líneas → 8)

**Interfaces:**
- Consumes: `esRutaPapel`, `superficieDe`, `Superficie` (`~/lib/rutas/registro`, Tarea 3).
- Produces: los mismos `esRutaPapel` y `superficieDe`, re-exportados, más el tipo `Superficie`. Los consumen `RootLayout.tsx` (Tarea 8) y `layouts/__tests__/papel-routes.test.ts`, **que no se toca**.

> **Contrato con el plan B.** `esRutaPapel(location: string): boolean` **conserva su firma de hoy**, y esa es la razón por la que el plan B no depende de este plan: `SkipLink.tsx` (B4) y `ErrorBoundary.tsx` (B5) reciben un `esPapel: boolean` derivado de `esRutaPapel`, **no** un `Superficie` ni `superficieDe` —que nacen acá, en B7—. Si esta tarea cambiara la firma, B4 y B5 dejarían de compilar. `superficieDe` queda disponible para cuando ② quiera afinar los dos componentes a tres superficies; eso no es de ①.

> Los hechos que hoy viven en `PAPEL_ROUTES` (13 rutas), `PAPEL_PREFIXES` (6 prefijos) y `SIN_PAPEL` (`/blog/escribir`) ya están en `entradas.ts` como `superficie`. Las tres constantes son privadas del módulo —nadie las importa, verificado con grep—, así que se borran sin ceremonia.

- [ ] **Paso 1: Escribir el test que falla**

No se escribe test nuevo: el test es `apps/web/src/layouts/__tests__/papel-routes.test.ts`, que ya existe con 18 casos y **tiene que quedar verde sin una sola modificación**. Ese es exactamente el contrato de esta tarea. Marcar el paso y seguir.

- [ ] **Paso 2: Fijar la línea de base de no-regresión (acá no hay rojo, y está bien)**

Comando: `pnpm -C apps/web exec vitest run src/layouts`
Esperado: PASA hoy contra la implementación vieja. Anotar el número de tests (18) — después del Paso 3 tiene que ser el mismo número y seguir en verde. Si baja, se rompió algo.

- [ ] **Paso 3: Implementación mínima**

Reemplazar TODO el contenido de `apps/web/src/layouts/papel-routes.ts` por:

```ts
/**
 * Puente de compatibilidad. Los datos que vivían acá —`PAPEL_ROUTES`,
 * `PAPEL_PREFIXES` y `SIN_PAPEL`— se mudaron a `~/lib/rutas/entradas.ts`, donde
 * cada ruta declara además su título, su descripción y su política de
 * indexación (spec `docs/specs/2026-07-26-el-sustrato.md` §1: una sola tabla, no
 * dos que se desincronizan).
 *
 * El archivo sobrevive para que `RootLayout.tsx` y `__tests__/papel-routes.test.ts`
 * no cambien de import.
 */
export { esRutaPapel, superficieDe } from '~/lib/rutas/registro';
export type { Superficie } from '~/lib/rutas/registro';
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/layouts src/lib/rutas`
Esperado: PASA — los mismos 18 casos de `papel-routes.test.ts` verdes, sin editarlos. En particular siguen dando `false`: `/bitacoraque`, `/ensayosque`, `/sembrarque`, `/planesque`, `/entrenamientosque`, `/cronicas`, `/cronica/algo`, `/mandato-vivo-archivado`, `/blog/escribir`, `/ingresar` y `/cuaderno`.

Después: `pnpm verify` verde.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/layouts/papel-routes.ts
git commit -m "refactor(web): papel-routes deja de tener datos y re-exporta del registro de rutas"
```

---

### Tarea 6: `fuente-web.ts` — el lado Vite de la inyección, perezoso por patrón

**Files:**
- Create: `apps/web/src/lib/rutas/fuente-web.ts`
- Test: `apps/web/src/lib/rutas/__tests__/fuente-web.test.ts`

**Interfaces:**
- Consumes: `DocumentoDeRuta`, `FuenteDeContenido`, `FUENTE_VACIA` (`./registro`, Tarea 3) · `PLAN_REGISTRY` (`~/lib/plans-registry`) · `ENSAYOS` (`~/lib/ensayos-registry`) · `BLOG_POSTS` (`~/lib/blog-registry`) · `CURSOS` (`~/lib/courses-registry`).
- Produces: `CargadorDeDocumentos`, `CARGADORES_WEB`, `cargarFuenteDe()`. Lo consume `use-metadata.ts` (Tarea 7).

> **Este es el ÚNICO módulo de `lib/rutas/` que toca Vite.** Y toda su carga es perezosa: importar los registries de forma estática desde `use-metadata.ts` metería los cuerpos de ensayos, bitácora y crónica más los 336 KB de `course.json` al chunk inicial de las 54 rutas.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/lib/rutas/__tests__/fuente-web.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { cargarFuenteDe, CARGADORES_WEB } from '../fuente-web';
import { FUENTE_VACIA, REGISTRO } from '../registro';

import { BLOG_POSTS } from '~/lib/blog-registry';
import { CURSOS } from '~/lib/courses-registry';
import { ENSAYOS } from '~/lib/ensayos-registry';
import { PLAN_REGISTRY } from '~/lib/plans-registry';

describe('CARGADORES_WEB', () => {
  it('solo declara cargadores para patrones que existen en el registro', () => {
    const patrones = new Set(REGISTRO.map((e) => e.patron));
    for (const clave of Object.keys(CARGADORES_WEB)) {
      expect(patrones.has(clave), clave).toBe(true);
    }
  });

  it('cubre los 7 patrones enumerables desde el contenido en disco', () => {
    expect(Object.keys(CARGADORES_WEB).sort()).toEqual(
      [
        '/bitacora/:slug',
        '/blog/:slug',
        '/ensayos/:slug',
        '/entrenamientos/:slug',
        '/entrenamientos/:slug/leccion/:n',
        '/entrenamientos/:slug/practica',
        '/planes/:slug',
      ].sort(),
    );
  });
});

describe('cargarFuenteDe', () => {
  it('devuelve la fuente vacía para un patrón sin cargador', async () => {
    await expect(cargarFuenteDe('/la-idea')).resolves.toBe(FUENTE_VACIA);
    await expect(cargarFuenteDe('/iniciativas/:slug')).resolves.toBe(FUENTE_VACIA);
    await expect(cargarFuenteDe('/areas/:slug')).resolves.toBe(FUENTE_VACIA);
  });

  it('carga un plan por cada entrada del registry, con su título y su summary', async () => {
    const fuente = await cargarFuenteDe('/planes/:slug');
    const documentos = fuente['/planes/:slug'] ?? [];
    expect(documentos).toHaveLength(PLAN_REGISTRY.length);
    const primero = PLAN_REGISTRY[0];
    expect(primero).toBeDefined();
    if (primero) {
      expect(documentos[0]).toEqual({
        params: { slug: primero.slug },
        titulo: primero.title,
        summary: primero.summary,
      });
    }
  });

  it('carga los ensayos y los posts', async () => {
    expect((await cargarFuenteDe('/ensayos/:slug'))['/ensayos/:slug']).toHaveLength(
      ENSAYOS.length,
    );
    expect((await cargarFuenteDe('/bitacora/:slug'))['/bitacora/:slug']).toHaveLength(
      BLOG_POSTS.length,
    );
  });

  it('el patrón de blog trae un documento por legacySlug, con el slug v2 en `actual`', async () => {
    const documentos = (await cargarFuenteDe('/blog/:slug'))['/blog/:slug'] ?? [];
    const esperados = BLOG_POSTS.reduce((n, p) => n + p.legacySlugs.length, 0);
    expect(esperados).toBeGreaterThan(0);
    expect(documentos).toHaveLength(esperados);
    for (const documento of documentos) {
      expect(documento.params['actual']).toBeDefined();
      expect(documento.params['slug']).not.toBe(documento.params['actual']);
    }
  });

  it('carga un documento por curso, uno por práctica y uno por lección', async () => {
    const cursos = (await cargarFuenteDe('/entrenamientos/:slug'))['/entrenamientos/:slug'] ?? [];
    const practicas =
      (await cargarFuenteDe('/entrenamientos/:slug/practica'))['/entrenamientos/:slug/practica'] ??
      [];
    const lecciones =
      (await cargarFuenteDe('/entrenamientos/:slug/leccion/:n'))[
        '/entrenamientos/:slug/leccion/:n'
      ] ?? [];

    expect(cursos).toHaveLength(CURSOS.length);
    expect(practicas).toHaveLength(CURSOS.length);
    expect(lecciones).toHaveLength(CURSOS.reduce((n, c) => n + c.lecciones.length, 0));
    expect(lecciones[0]?.params['n']).toBe('1');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas/__tests__/fuente-web.test.ts`
Esperado: FALLA con `Failed to resolve import "../fuente-web"`.

- [ ] **Paso 3: Implementación mínima**

Crear `apps/web/src/lib/rutas/fuente-web.ts`:

```ts
/**
 * El lado Vite de la inyección: envuelve los cinco content registries
 * (`import.meta.glob`) en una `FuenteDeContenido`.
 *
 * Es el ÚNICO módulo de `lib/rutas/` que toca Vite, y su carga es PEREZOSA por
 * patrón: importar los registries de forma estática desde `use-metadata.ts`
 * metería los cuerpos de ensayos, bitácora y crónica —globs eager— y los 336 KB
 * de `course.json` al chunk inicial de las 54 rutas.
 */
import { FUENTE_VACIA, type DocumentoDeRuta, type FuenteDeContenido } from './registro';

export type CargadorDeDocumentos = () => Promise<readonly DocumentoDeRuta[]>;

/** Clave = `patron` del registro. Cada valor hace `import()` dinámico del registry que corresponde. */
export const CARGADORES_WEB: Readonly<Record<string, CargadorDeDocumentos>> = {
  '/planes/:slug': async () => {
    const { PLAN_REGISTRY } = await import('~/lib/plans-registry');
    return PLAN_REGISTRY.map((plan) => ({
      params: { slug: plan.slug },
      titulo: plan.title,
      summary: plan.summary,
    }));
  },

  '/ensayos/:slug': async () => {
    const { ENSAYOS } = await import('~/lib/ensayos-registry');
    return ENSAYOS.map((ensayo) => ({
      params: { slug: ensayo.slug },
      titulo: ensayo.title,
      summary: ensayo.summary,
    }));
  },

  '/bitacora/:slug': async () => {
    const { BLOG_POSTS } = await import('~/lib/blog-registry');
    return BLOG_POSTS.map((post) => ({
      params: { slug: post.slug },
      titulo: post.title,
      summary: post.summary,
    }));
  },

  // Un documento por dirección VIEJA. `actual` lleva el slug v2, que no coincide
  // con el legacy (los legacy son las direcciones de v1 con los acentos
  // borrados). `enumerarRedirecciones` sustituye `:actual` en `/bitacora/:actual`.
  '/blog/:slug': async () => {
    const { BLOG_POSTS } = await import('~/lib/blog-registry');
    return BLOG_POSTS.flatMap((post) =>
      post.legacySlugs.map((legacy) => ({
        params: { slug: legacy, actual: post.slug },
        titulo: post.title,
        summary: post.summary,
      })),
    );
  },

  '/entrenamientos/:slug': async () => {
    const { CURSOS } = await import('~/lib/courses-registry');
    return CURSOS.map((curso) => ({
      params: { slug: curso.slug },
      titulo: curso.title,
      summary: curso.excerpt,
    }));
  },

  '/entrenamientos/:slug/practica': async () => {
    const { CURSOS } = await import('~/lib/courses-registry');
    return CURSOS.map((curso) => ({
      params: { slug: curso.slug },
      titulo: `Práctica · ${curso.title}`,
      summary: curso.excerpt,
    }));
  },

  // La URL usa la POSICIÓN 1-based, no el `orden` del course.json (que puede
  // arrancar en 0) — es lo que resuelve `ubicarLeccion` en entrenamientos-data.
  '/entrenamientos/:slug/leccion/:n': async () => {
    const { CURSOS } = await import('~/lib/courses-registry');
    return CURSOS.flatMap((curso) =>
      curso.lecciones.map((leccion, i) => ({
        params: { slug: curso.slug, n: String(i + 1) },
        titulo: leccion.titulo,
        summary: curso.excerpt,
      })),
    );
  },
};

/**
 * Fuente de UN solo patrón, ya cargada. `FUENTE_VACIA` si el patrón no tiene
 * cargador (rutas estáticas y las 4 servidas por la base) o si el chunk del
 * registry no bajó: en ese caso la página se queda con la metadata de sección,
 * que es correcta, en vez de tirar un rechazo sin manejar.
 */
export async function cargarFuenteDe(patron: string): Promise<FuenteDeContenido> {
  const cargador = CARGADORES_WEB[patron];
  if (cargador === undefined) return FUENTE_VACIA;
  try {
    return { [patron]: await cargador() };
  } catch {
    return FUENTE_VACIA;
  }
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas && pnpm -C apps/web exec eslint src/lib/rutas --max-warnings 0`
Esperado: PASA — 7 tests nuevos; el de legacySlugs cuenta 17 documentos contra los 22 posts reales.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/lib/rutas/fuente-web.ts \
        apps/web/src/lib/rutas/__tests__/fuente-web.test.ts
git commit -m "feat(web): la fuente de contenido del navegador carga perezosa por patrón, un registry por vez"
```

---

### Tarea 7: `use-metadata.ts` — el `<head>` vivo sigue a la ruta

**Files:**
- Create: `apps/web/src/types/env.d.ts`
- Create: `apps/web/src/lib/rutas/use-metadata.ts`
- Modify: `apps/web/src/App.tsx` (edición aditiva: una línea de import + una llamada. **Sin números de línea**: el plan A ya reescribió este archivo)
- Test: `apps/web/src/lib/rutas/__tests__/use-metadata.test.ts`

**Interfaces:**
- Consumes: `cargarFuenteDe` (`./fuente-web`, Tarea 6) · `buscarEntrada`, `FUENTE_VACIA`, `ORIGEN_CANONICO`, `resolverMetadata`, `TARJETA_TWITTER`, `FuenteDeContenido`, `MetadataDeRuta` (`./registro`, Tareas 3–4).
- Produces: `ORIGEN_DEL_SITIO`, `aplicarMetadataAlDocumento()`, `useMetadata()`. `useTemaDeSuperficie()` llega en la Tarea 8, en este mismo archivo.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/lib/rutas/__tests__/use-metadata.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';

import { ORIGEN_CANONICO, resolverMetadata, FUENTE_VACIA } from '../registro';
import { aplicarMetadataAlDocumento, ORIGEN_DEL_SITIO } from '../use-metadata';

const OPCIONES = { origen: 'https://ejemplo.test', fuente: FUENTE_VACIA };

function contenido(selector: string): string | null {
  return document.head.querySelector(selector)?.getAttribute('content') ?? null;
}

describe('ORIGEN_DEL_SITIO', () => {
  it('cae al origen canónico y nunca termina en barra', () => {
    expect(ORIGEN_DEL_SITIO).toBe(ORIGEN_CANONICO);
    expect(ORIGEN_DEL_SITIO.endsWith('/')).toBe(false);
  });
});

describe('aplicarMetadataAlDocumento', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  it('escribe título, descripción, canónica, og y twitter', () => {
    aplicarMetadataAlDocumento(resolverMetadata('/la-idea', OPCIONES));

    expect(document.title).toBe('La idea — ¡BASTA!');
    expect(contenido('meta[name="description"]')).toContain('Tres capítulos');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://ejemplo.test/la-idea',
    );
    expect(contenido('meta[property="og:title"]')).toBe('La idea — ¡BASTA!');
    expect(contenido('meta[property="og:url"]')).toBe('https://ejemplo.test/la-idea');
    expect(contenido('meta[property="og:image"]')).toBe('https://ejemplo.test/og/la-idea.png');
    expect(contenido('meta[property="og:type"]')).toBe('website');
    expect(contenido('meta[property="og:site_name"]')).toBe('¡BASTA!');
    expect(contenido('meta[property="og:locale"]')).toBe('es_AR');
    expect(contenido('meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(contenido('meta[name="twitter:image"]')).toBe('https://ejemplo.test/og/la-idea.png');
  });

  it('es idempotente: reusa las etiquetas en vez de duplicarlas', () => {
    aplicarMetadataAlDocumento(resolverMetadata('/la-idea', OPCIONES));
    aplicarMetadataAlDocumento(resolverMetadata('/el-mapa', OPCIONES));

    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.title).toBe('El mapa de las voces — ¡BASTA!');
  });

  it('pone robots en las privadas y lo SACA al volver a una pública', () => {
    aplicarMetadataAlDocumento(resolverMetadata('/ingresar', OPCIONES));
    expect(contenido('meta[name="robots"]')).toBe('noindex,nofollow');

    aplicarMetadataAlDocumento(resolverMetadata('/la-idea', OPCIONES));
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('la ruta desconocida queda noindex y con la OG por defecto', () => {
    aplicarMetadataAlDocumento(resolverMetadata('/no-existe', OPCIONES));
    expect(document.title).toBe('Página extraviada — ¡BASTA!');
    expect(contenido('meta[name="robots"]')).toBe('noindex,nofollow');
    expect(contenido('meta[property="og:image"]')).toBe('https://ejemplo.test/og/default.png');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas/__tests__/use-metadata.test.ts`
Esperado: FALLA con `Failed to resolve import "../use-metadata"`.

- [ ] **Paso 3: Implementación mínima**

Primero, crear `apps/web/src/types/env.d.ts` (sin esto, `import.meta.env.VITE_SITE_ORIGIN` es `any` por el index signature de `vite/client` y `@typescript-eslint/no-unsafe-member-access` rompe el lint):

```ts
/** Variables de entorno de Vite que el código de `apps/web` lee por nombre. */
interface ImportMetaEnv {
  /** Origen absoluto del deploy, sin barra final. Default: `ORIGEN_CANONICO`. */
  readonly VITE_SITE_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

Después, crear `apps/web/src/lib/rutas/use-metadata.ts`:

```ts
/**
 * Hook montado UNA sola vez en `App.tsx`: resuelve la metadata de la ruta
 * actual y la escribe en el `<head>` vivo. Archivo `.ts` (no `.tsx`) para poder
 * exportar funciones sin chocar con `react-refresh/only-export-components`.
 *
 * El scraper NO depende de esto: lee el HTML ya sellado en build (B11). Esto es
 * para la navegación SPA, que hoy deja el `<title>` clavado en el de la portada
 * y por eso es muda para un lector de pantalla.
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

import { cargarFuenteDe } from './fuente-web';
import {
  buscarEntrada,
  FUENTE_VACIA,
  ORIGEN_CANONICO,
  resolverMetadata,
  TARJETA_TWITTER,
  type FuenteDeContenido,
  type MetadataDeRuta,
} from './registro';

/** Único punto de `lib/rutas/` que lee env de Vite. Sin barra final. */
export const ORIGEN_DEL_SITIO: string = (import.meta.env.VITE_SITE_ORIGIN ?? ORIGEN_CANONICO)
  .trim()
  .replace(/\/+$/u, '');

function fijarMeta(clave: 'name' | 'property', valor: string, texto: string): void {
  const selector = `meta[${clave}="${valor}"]`;
  const existente = document.head.querySelector<HTMLMetaElement>(selector);
  const etiqueta = existente ?? document.createElement('meta');
  if (existente === null) {
    etiqueta.setAttribute(clave, valor);
    document.head.appendChild(etiqueta);
  }
  etiqueta.setAttribute('content', texto);
}

function fijarCanonica(href: string): void {
  const existente = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const etiqueta = existente ?? document.createElement('link');
  if (existente === null) {
    etiqueta.setAttribute('rel', 'canonical');
    document.head.appendChild(etiqueta);
  }
  etiqueta.setAttribute('href', href);
}

/** Efecto puro de DOM, exportado para testear sin montar React. Idempotente: reusa los `<meta>` existentes en vez de duplicarlos. */
export function aplicarMetadataAlDocumento(metadata: MetadataDeRuta): void {
  document.title = metadata.titulo;

  fijarMeta('name', 'description', metadata.descripcion);
  fijarCanonica(metadata.canonica);

  fijarMeta('property', 'og:type', 'website');
  fijarMeta('property', 'og:site_name', '¡BASTA!');
  fijarMeta('property', 'og:locale', 'es_AR');
  fijarMeta('property', 'og:title', metadata.titulo);
  fijarMeta('property', 'og:description', metadata.descripcion);
  fijarMeta('property', 'og:url', metadata.canonica);
  fijarMeta('property', 'og:image', metadata.og);

  fijarMeta('name', 'twitter:card', TARJETA_TWITTER);
  fijarMeta('name', 'twitter:title', metadata.titulo);
  fijarMeta('name', 'twitter:description', metadata.descripcion);
  fijarMeta('name', 'twitter:image', metadata.og);

  if (metadata.robots === null) {
    document.head.querySelector('meta[name="robots"]')?.remove();
    return;
  }
  fijarMeta('name', 'robots', metadata.robots);
}

/**
 * Se monta UNA vez, en `App.tsx`. Resuelve con `FUENTE_VACIA` en el primer
 * frame (metadata de sección) y reescribe cuando resuelve `cargarFuenteDe`.
 */
export function useMetadata(): void {
  const [location] = useLocation();
  const [fuente, setFuente] = useState<FuenteDeContenido>(FUENTE_VACIA);
  const patron = buscarEntrada(location)?.entrada.patron;

  useEffect(() => {
    if (patron === undefined) {
      setFuente(FUENTE_VACIA);
      return;
    }
    let vivo = true;
    setFuente(FUENTE_VACIA);
    void cargarFuenteDe(patron).then((cargada) => {
      if (vivo) setFuente(cargada);
    });
    return () => {
      vivo = false;
    };
  }, [patron]);

  useEffect(() => {
    aplicarMetadataAlDocumento(
      resolverMetadata(location, { origen: ORIGEN_DEL_SITIO, fuente }),
    );
  }, [location, fuente]);
}
```

Por último, montar el hook en `apps/web/src/App.tsx`. **Es una edición ADITIVA de dos líneas: no se reescribe la función ni se toca el árbol JSX.** Para cuando esta tarea corre, el plan A (Tarea 7) ya convirtió `XpToast` en `lazy()` y lo envolvió en `<Suspense fallback={null}>`; transcribir el cuerpo de HEAD borraría ese `<Suspense>` y dejaría un componente `lazy()` sin boundary por encima —vive fuera de `<RootLayout>`, no hereda ninguno—, lo que hace que React tire en el primer render de **toda** ruta.

(1) Agregar `useMetadata();` como **primera sentencia del cuerpo** de `export function App()`, anclando en el texto literal:

```tsx
export function App() {
  return (
```

que pasa a:

```tsx
export function App() {
  useMetadata();

  return (
```

(2) Agregar el import, alfabetizado dentro del bloque `~/` que ya existe (queda entre `~/lib/query-client` y `~/lib/xp-event-bus`), anclando en el texto literal `import { queryClient } from '~/lib/query-client';`:

```tsx
import { useMetadata } from '~/lib/rutas/use-metadata';
```

**Lo que NO se toca:** el `const XpToast = lazy(…)` y el `<Suspense fallback={null}>` que lo envuelve los pone el plan A (Tarea 7) y quedan como están. El `<MotionConfig reducedMotion="user">` que B4 mete en este mismo `App` tampoco es de esta tarea. Ninguna de las tres ediciones se ancla en número de línea, porque los tres bloques se mueven entre A, C y B.

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas && pnpm -C apps/web exec tsc --noEmit && pnpm -C apps/web exec eslint src --max-warnings 0`
Esperado: PASA — 5 tests nuevos, tsc sin errores, eslint sin salida.

Verificación a mano en el navegador (`pnpm -C apps/web dev`, puerto 5173):
- (a) abrir `/` y mirar la pestaña: dice «El país lo diseña la gente — ¡BASTA!», no «¡BASTA! — El país lo diseña la gente».
- (b) navegar a `/planes` y después a `/planes/planeb` **sin recargar**: el título de la pestaña cambia dos veces, y en el segundo salto pasa de «La prueba — ¡BASTA!» al título propio del expediente cuando resuelve el `import()` del registry.
- (c) en devtools, `document.head` de `/planes/planeb`: un solo `og:title`, un solo `link[rel=canonical]`, y `og:image` apuntando a `/og/planes/planeb.png`.
- (d) ir a `/ingresar`: aparece `<meta name="robots" content="noindex,nofollow">`. Volver a `/`: la etiqueta desaparece.
- (e) en la pestaña Network, filtrar por JS al cargar `/`: **no** baja ningún chunk de `ensayos-registry`, `blog-registry` ni `courses-registry` — la portada no tiene cargador.

**Y medir el presupuesto, porque este es el commit que mete `entradas.ts` en el chunk de entrada:**

```bash
pnpm --filter @v2/web build && pnpm size
```

Esperado: verde. El plan A (Tarea 7, Paso 4) dejó reservados **6 KB** para el registro de rutas exactamente para esto: la cadena `App.tsx` → `use-metadata.ts` → `registro.ts` → `entradas.ts` es de imports **estáticos**, así que la tabla de 54 entradas viaja en el payload inicial de las 54 rutas (los cinco content registries no, ésos quedan perezosos vía `CARGADORES_WEB`). Si `pnpm size` **muerde**, la salida NO es subir el techo: es darle chunk propio a `entradas.ts` en el `manualChunks` de `apps/web/vite.config.ts` (queda fuera del grafo inicial sólo si se lo carga perezoso; si no, al menos deja de contaminar la medición del resto) y, si aun así no entra, replantear las descripciones largas antes que el presupuesto. Anotar el valor medido en el cuerpo del commit.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/types/env.d.ts \
        apps/web/src/lib/rutas/use-metadata.ts \
        apps/web/src/lib/rutas/__tests__/use-metadata.test.ts \
        apps/web/src/App.tsx
git commit -m "feat(web): el título y el head de la pestaña siguen a la ruta, con la fuente cargada perezosa"
```

---

### Tarea 8 (B8): el tema y la barra de scroll siguen a la superficie

**Files:**
- Modify: `apps/web/src/lib/rutas/use-metadata.ts` (agregar `useTemaDeSuperficie` al final)
- Modify: `apps/web/src/layouts/RootLayout.tsx` (tres ediciones puntuales ancladas en texto; **sin números de línea**: el plan A ya reescribió los imports y la rama legado de este archivo)
- Test: `apps/web/src/lib/rutas/__tests__/tema-de-superficie.test.tsx`

**Interfaces:**
- Consumes: `Superficie` (`./registro`) · `superficieDe` (`~/lib/rutas/registro`, vía `./papel-routes`).
- Produces: `useTemaDeSuperficie(superficie: Superficie): void`. Lo consume `RootLayout.tsx`.

> **Por qué es bloque propio y no parte de B2:** el valor estático de `index.css` (`color-scheme: light`) lo entrega B2. Esto es el valor **por ruta**, y depende del registro. Sin él, `/mandato-vivo` y los expedientes de plan —que son papel oscuro de pantalla completa— abren con barra de scroll clara.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/lib/rutas/__tests__/tema-de-superficie.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useTemaDeSuperficie } from '../use-metadata';

import type { Superficie } from '../registro';

function Sonda({ superficie }: { superficie: Superficie }) {
  useTemaDeSuperficie(superficie);
  return null;
}

function temaActual(): string | null {
  return document.head.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? null;
}

describe('useTemaDeSuperficie (B8)', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.documentElement.style.colorScheme = '';
  });

  it('papel pide esquema claro y el crema del sistema', () => {
    render(<Sonda superficie="papel" />);
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(temaActual()).toBe('#F2EFE7');
  });

  it('papel oscuro pide esquema oscuro y la tinta', () => {
    render(<Sonda superficie="papel-oscuro" />);
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(temaActual()).toBe('#16130E');
  });

  it('legado conserva el fondo v1', () => {
    render(<Sonda superficie="legado" />);
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(temaActual()).toBe('#0A0A0A');
  });

  it('reusa el <meta name="theme-color"> del shell en vez de duplicarlo', () => {
    const previo = document.createElement('meta');
    previo.setAttribute('name', 'theme-color');
    previo.setAttribute('content', '#FFFFFF');
    document.head.appendChild(previo);

    const { rerender } = render(<Sonda superficie="papel" />);
    rerender(<Sonda superficie="papel-oscuro" />);

    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(temaActual()).toBe('#16130E');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/lib/rutas/__tests__/tema-de-superficie.test.tsx`
Esperado: FALLA con `"useTemaDeSuperficie" is not exported by "src/lib/rutas/use-metadata.ts"`.

- [ ] **Paso 3: Implementación mínima**

Agregar al final de `apps/web/src/lib/rutas/use-metadata.ts` (y sumar `type Superficie` al `import` que ya trae `type MetadataDeRuta` de `./registro`, alfabetizado: `type FuenteDeContenido, type MetadataDeRuta, type Superficie`):

```ts
/**
 * Los tres colores de barra del sistema. Son hex y no tokens Tailwind a
 * propósito: van en el `content` de un `<meta>`, que no acepta clases. Están
 * copiados de `docs/design-system/tokens.css` — `--papel`, `--tinta` y el
 * `--background` v1 de `index.css:8` (`0 0% 4%`). Si alguno cambia allá, el
 * test de esta función es el que rompe.
 */
const COLOR_DE_SUPERFICIE: Readonly<Record<Superficie, string>> = {
  papel: '#F2EFE7',
  'papel-oscuro': '#16130E',
  legado: '#0A0A0A',
};

const ESQUEMA_DE_SUPERFICIE: Readonly<Record<Superficie, 'light' | 'dark'>> = {
  papel: 'light',
  'papel-oscuro': 'dark',
  legado: 'dark',
};

/**
 * B8: escribe `documentElement.style.colorScheme` y el `content` del
 * `<meta name="theme-color">` según la superficie. El `body` no alcanza: la
 * barra de scroll la gobierna el elemento raíz.
 */
export function useTemaDeSuperficie(superficie: Superficie): void {
  useEffect(() => {
    document.documentElement.style.colorScheme = ESQUEMA_DE_SUPERFICIE[superficie];

    const existente = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const etiqueta = existente ?? document.createElement('meta');
    if (existente === null) {
      etiqueta.setAttribute('name', 'theme-color');
      document.head.appendChild(etiqueta);
    }
    etiqueta.setAttribute('content', COLOR_DE_SUPERFICIE[superficie]);
  }, [superficie]);
}
```

Después, tocar `apps/web/src/layouts/RootLayout.tsx` con **tres ediciones puntuales sobre el archivo POST-plan-A**. No se transcribe el bloque de imports: para cuando esta tarea corre, el plan A (Tarea 7) ya borró el `import { Header } from '~/components/Header';` estático, agregó `import { Suspense, lazy } from 'react';` al grupo de externos, declaró un `const Header = lazy(…)` **después** del bloque de imports y envolvió el `<Header />` de la rama legado en un `<Suspense fallback={<div className="h-14 border-b border-white/5" />}>`. Copiar el bloque de HEAD dejaría `Header` declarado dos veces (TS2451) y `Suspense` usado sin importar (TS2304); y si alguien lo «desenreda» quedándose con el import estático, framer-motion (~44 KB gzip) vuelve al chunk inicial de las 54 rutas y revienta el `.size-limit.json` que A acaba de apretar.

**Edición 1** — agregar el import del hook al final del bloque `~/`, anclando en el texto literal:

```tsx
import { useIrAlPrincipio } from '~/lib/ir-al-principio';
```

que pasa a:

```tsx
import { useIrAlPrincipio } from '~/lib/ir-al-principio';
import { useTemaDeSuperficie } from '~/lib/rutas/use-metadata';
```

**Edición 2** — cambiar el import del puente. Anclar en el texto literal:

```tsx
import { esRutaPapel } from './papel-routes';
```

que pasa a:

```tsx
import { superficieDe } from './papel-routes';
```

**Edición 3** — el cuerpo del componente. Anclar en el texto literal:

```tsx
export function RootLayout({ children }: RootLayoutProps) {
  const [location] = useLocation();
  useIrAlPrincipio();

  if (esRutaPapel(location)) {
```

que pasa a:

```tsx
export function RootLayout({ children }: RootLayoutProps) {
  const [location] = useLocation();
  const superficie = superficieDe(location);
  useIrAlPrincipio();
  useTemaDeSuperficie(superficie);

  if (superficie !== 'legado') {
```

Opcionalmente, actualizar el JSDoc del componente para que nombre el hook nuevo (ancla: la línea `* Acá vive el scroll de toda navegación (\`useIrAlPrincipio\`): es el único`).

**Lo que NO se toca:** el `import { Suspense, lazy } from 'react';`, el `const Header = lazy(…)` y el `<Suspense>` de la rama legado, todos del plan A. Tampoco el `<SkipLink />` ni el `id="contenido"` de B4, ni el `<ErrorBoundary>` de B5, que tocan este mismo archivo desde otros bloques.

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run && pnpm verify`
Esperado: PASA — los 4 tests nuevos verdes y la suite entera sin regresiones (`RootLayout` cambió de `esRutaPapel(location)` a `superficie !== 'legado'`, que es la misma condición por definición).

Verificación a mano en el navegador:
- (f) abrir `/mandato-vivo`: la barra de scroll es oscura y en móvil la barra de estado del sistema queda en tinta.
- (g) navegar a `/planes` (papel claro): la barra de scroll se aclara **sin recargar**.
- (h) navegar a `/planes/planeb`: vuelve a oscurecerse.
- (i) navegar a `/ingresar`: queda oscura (chrome v1).

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/lib/rutas/use-metadata.ts \
        apps/web/src/lib/rutas/__tests__/tema-de-superficie.test.tsx \
        apps/web/src/layouts/RootLayout.tsx
git commit -m "feat(web): el tema del documento y la barra de scroll siguen la superficie de cada ruta"
```

---

### Tarea 9: `meta:check` — una ruta nueva no puede shippear sin metadata

**Files:**
- Create: `scripts/build/verify-registro-rutas.ts`
- Modify: `package.json` (raíz de `v2/`, bloque `scripts`)
- Modify: `.github/workflows/v2-ci.yml` (job `build-and-test`)

**Interfaces:**
- Consumes: `LARGO_MAXIMO_DESCRIPCION` (`../../apps/web/src/lib/rutas/descripcion-de`) · `componerTitulo`, `LARGO_MAXIMO_TITULO`, `REGISTRO` (`../../apps/web/src/lib/rutas/registro`) · `apps/web/src/app-routes.tsx` leído como texto.
- Produces: el script `pnpm meta:check`. SIN exports — `main()` en el top level, igual que `scripts/content/verify-planes-index.ts`.

> **Alcance de esta tarea:** las reglas 1, 2, 3 y 5 de la guardia, más los largos de las **entradas** (regla 4a). La regla 4b (largos de cada documento resuelto con `leerFuenteDeDisco()`) y la regla 6 (el bloque `redirects` de `v2/vercel.json` contra `redirectsDeHost`) necesitan `scripts/build/fuente-disco.ts` y `scripts/build/sellado.ts`, que entrega **B11**. B11 extiende este mismo archivo; no lo reescribe.

- [ ] **Paso 1: Preparar el experimento que prueba que la guardia muerde**

La guardia es su propio test: no tiene módulo puro hermano (igual que `verify-planes-index.ts`). El «test que falla» es probar que **muerde**. Antes de escribir el script, dejar preparado el experimento del Paso 4.

Marcar el paso y seguir.

- [ ] **Paso 2: Verificar que la guardia todavía no existe**

Comando: `pnpm meta:check`
Esperado: FALLA con `Command "meta:check" not found` — el script todavía no existe.

- [ ] **Paso 3: Implementación mínima**

Crear `scripts/build/verify-registro-rutas.ts`:

```ts
/**
 * Guardia de CI: una ruta nueva no puede shippear sin metadata.
 *
 * Calcada de `scripts/content/verify-planes-index.ts`, que ya corre en el
 * workflow. Verifica que los `path` del `<Switch>` de `app-routes.tsx` y los
 * `patron` de `REGISTRO` sean el mismo conjunto EN EL MISMO ORDEN (el orden es
 * semántica de wouter: `buscarEntrada` devuelve la primera coincidencia), y que
 * cada entrada respete el formato de §14 y los largos de §2.
 *
 * `app-routes.tsx` se parsea con regex sobre el archivo — no se importa: es TSX
 * y arrastraría React entero a un proceso de `tsx`.
 *
 * Run: pnpm meta:check
 */
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

function pathsDelSwitch(): string[] {
  const fuente = readFileSync(ARCHIVO_RUTAS, 'utf8');
  const encontrados: string[] = [];
  const expresion = /path="([^"]+)"/g;
  let coincidencia = expresion.exec(fuente);
  while (coincidencia !== null) {
    const valor = coincidencia[1];
    if (valor !== undefined) encontrados.push(valor);
    coincidencia = expresion.exec(fuente);
  }
  return encontrados;
}

function main(): void {
  const errores: string[] = [];
  const paths = pathsDelSwitch();
  const patrones = REGISTRO.map((entrada) => entrada.patron);

  // 1. Biyección exacta entre el <Switch> y el registro.
  const setPaths = new Set(paths);
  const setPatrones = new Set(patrones);
  if (setPaths.size !== paths.length) {
    errores.push('app-routes.tsx declara dos veces el mismo `path`.');
  }
  if (setPatrones.size !== patrones.length) {
    errores.push('REGISTRO declara dos veces el mismo `patron`.');
  }
  for (const path of paths) {
    if (!setPatrones.has(path)) errores.push(`ruta sin entrada en REGISTRO: ${path}`);
  }
  for (const patron of patrones) {
    if (!setPaths.has(patron)) {
      errores.push(`entrada de REGISTRO sin ruta en app-routes.tsx: ${patron}`);
    }
  }

  // 2. Orden. Solo se compara si los conjuntos ya coinciden: si no, la lista de
  //    desalineados sería ruido sobre el error real.
  if (errores.length === 0) {
    for (let i = 0; i < patrones.length; i += 1) {
      if (paths[i] !== patrones[i]) {
        errores.push(
          `orden roto en la posición ${String(i)}: el <Switch> dice ${paths[i] ?? '(nada)'} y REGISTRO dice ${patrones[i] ?? '(nada)'}.`,
        );
      }
    }
  }

  const prefijosVistos = new Set<string>();

  for (const entrada of REGISTRO) {
    // 3. Formato de título de §14.
    if (entrada.titulo.trim() === '') {
      errores.push(`${entrada.patron}: título vacío.`);
    }
    if (entrada.titulo.includes('¡BASTA!')) {
      errores.push(
        `${entrada.patron}: el título no lleva la marca — la compone componerTitulo (§14).`,
      );
    }

    // 4a. Largos de la entrada. Los títulos de DOCUMENTO no entran acá: salen
    //     del contenido y algunos superan los 60 con el sufijo (PLANRUTA).
    const compuesto = componerTitulo(entrada.titulo);
    if (compuesto.length > LARGO_MAXIMO_TITULO) {
      errores.push(
        `${entrada.patron}: «${compuesto}» mide ${String(compuesto.length)} y el máximo es ${String(LARGO_MAXIMO_TITULO)}.`,
      );
    }
    if (entrada.descripcion.trim() === '') {
      errores.push(`${entrada.patron}: descripción vacía.`);
    }
    if (entrada.descripcion.length > LARGO_MAXIMO_DESCRIPCION) {
      errores.push(
        `${entrada.patron}: la descripción mide ${String(entrada.descripcion.length)} y el máximo es ${String(LARGO_MAXIMO_DESCRIPCION)}.`,
      );
    }
    if (!/^[a-z0-9-]+$/u.test(entrada.og)) {
      errores.push(`${entrada.patron}: «${entrada.og}» no es un nombre de tarjeta OG válido.`);
    }

    // 5. Campos condicionales.
    if (entrada.indexacion === 'redireccion') {
      if (entrada.destino === undefined) {
        errores.push(`${entrada.patron}: es redirección y no declara destino.`);
      } else if (!entrada.destino.startsWith('/')) {
        errores.push(`${entrada.patron}: el destino «${entrada.destino}» no es una ruta absoluta.`);
      }
    } else if (entrada.destino !== undefined) {
      errores.push(`${entrada.patron}: declara destino sin ser redirección.`);
    }

    if (entrada.indexacion === 'dinamica') {
      const prefijo = entrada.prefijoRewrite;
      if (prefijo === undefined) {
        errores.push(`${entrada.patron}: es dinámica y no declara prefijoRewrite.`);
      } else if (!prefijo.startsWith('/') || prefijo.includes(':')) {
        errores.push(`${entrada.patron}: «${prefijo}» no sirve como prefijo de rewrite.`);
      } else if (prefijosVistos.has(prefijo)) {
        errores.push(`${entrada.patron}: el prefijo «${prefijo}» ya lo usa otra entrada.`);
      } else {
        prefijosVistos.add(prefijo);
      }
    } else if (entrada.prefijoRewrite !== undefined) {
      errores.push(`${entrada.patron}: declara prefijoRewrite sin ser dinámica.`);
    }
  }

  if (errores.length > 0) {
    process.stderr.write(`meta:check — ${String(errores.length)} problema(s):\n`);
    for (const error of errores) process.stderr.write(`  · ${error}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `meta:check — ${String(REGISTRO.length)} rutas con metadata, en el mismo orden que el <Switch>.\n`,
  );
}

main();
```

Agregar a `package.json` de la raíz de `v2/`, en `scripts`, **después de `"deps:check"`**, que es la guardia que agrega B1 (plan A, Tarea 3) inmediatamente después de `"planes:check"`. El orden acordado entre los planes hermanos es `planes:check` → `deps:check` (B1) → `meta:check` (B7):

```json
    "meta:check": "tsx scripts/build/verify-registro-rutas.ts",
```

Agregar a `.github/workflows/v2-ci.yml`, en el job `build-and-test`, **inmediatamente después del paso «Guardia de dependencias de producción» que agrega B1** (plan A, Tarea 3) — que a su vez va justo después de «Guardia del índice de planes». Anclar en el paso de B1, no en el del índice de planes: los dos planes reclamaban literalmente el mismo punto de inserción y el segundo en llegar encontraba un ancla que ya no estaba donde su plan decía. Si B1 todavía no corrió, va después de «Guardia del índice de planes» y B1 se inserta entre medio.

```yaml
      - name: Guardia del registro de rutas
        run: pnpm meta:check
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm meta:check`
Esperado: PASA con `meta:check — 54 rutas con metadata, en el mismo orden que el <Switch>.`

Ahora probar que muerde. Los tres experimentos, uno por vez, revirtiendo después de cada uno:

```bash
# (a) Ruta sin entrada: agregar a app-routes.tsx, antes del catch-all,
#     <Route path="/prueba-de-la-guardia" component={NotFound} />
pnpm meta:check   # Esperado: FALLA con «ruta sin entrada en REGISTRO: /prueba-de-la-guardia»
git checkout apps/web/src/app-routes.tsx

# (b) Orden roto: en entradas.ts, mover la entrada de '/entrenamientos'
#     ARRIBA de '/entrenamientos/:slug'.
pnpm meta:check   # Esperado: FALLA con «orden roto en la posición 45: …»
git checkout apps/web/src/lib/rutas/entradas.ts

# (c) Título largo: poner en la entrada de '/' el titulo
#     'Un título deliberadamente larguísimo para romper la guardia'
pnpm meta:check   # Esperado: FALLA con «/: «Un título … — ¡BASTA!» mide 69 y el máximo es 60.»
git checkout apps/web/src/lib/rutas/entradas.ts
```

Después: `pnpm verify` verde.

- [ ] **Paso 5: Commit**

```bash
git add scripts/build/verify-registro-rutas.ts package.json ../.github/workflows/v2-ci.yml
git commit -m "chore(ci): meta:check exige biyección, orden y largos entre app-routes y el registro"
```

---

### Tarea 10 (B10): `voces-regimen.ts` — los cuatro estados de la cifra

**Files:**
- Create: `apps/web/src/components/papel/voces-regimen.ts`
- Test: `apps/web/src/components/papel/__tests__/voces-regimen.test.ts`

**Interfaces:**
- Consumes: nada. Puro, como `pages/ElMandatoVivo/mandato-regimen.ts`.
- Produces: `EstadoCifra`, `ETIQUETA_SIN_DATOS`, `EntradaDeCifra`, `estadoDeCifra()`, `etiquetaDeVoces()`. Los consumen `PapelHeader` (Tarea 11), `CifrasStrip` (Tarea 12), las tres portadas (Tarea 13) y, más adelante, `scripts/build/congelado.ts` de B12.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/components/papel/__tests__/voces-regimen.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { ETIQUETA_SIN_DATOS, estadoDeCifra, etiquetaDeVoces } from '../voces-regimen';

describe('estadoDeCifra', () => {
  it('el error le gana a todo', () => {
    expect(estadoDeCifra({ total: 12496, cargando: true, error: true })).toBe('error');
    expect(estadoDeCifra({ total: undefined, cargando: false, error: true })).toBe('error');
  });

  it('la carga le gana a los datos', () => {
    expect(estadoDeCifra({ total: 12496, cargando: true, error: false })).toBe('cargando');
  });

  it('con datos distingue valor de cero', () => {
    expect(estadoDeCifra({ total: 1, cargando: false, error: false })).toBe('valor');
    expect(estadoDeCifra({ total: 12496, cargando: false, error: false })).toBe('valor');
    expect(estadoDeCifra({ total: 0, cargando: false, error: false })).toBe('cero');
  });

  it('sin dato, sin carga y sin error es error: no hay nada que mostrar', () => {
    expect(estadoDeCifra({ total: undefined, cargando: false, error: false })).toBe('error');
  });

  it('un total negativo no se cuela como valor', () => {
    expect(estadoDeCifra({ total: -3, cargando: false, error: false })).toBe('cero');
  });
});

describe('etiquetaDeVoces', () => {
  it('con datos formatea es-AR y conserva el elemento de identidad de §1', () => {
    expect(etiquetaDeVoces({ total: 12496, cargando: false, error: false })).toBe(
      '12.496 voces · falta la tuya',
    );
  });

  it('cero, cargando y error dicen lo mismo, y nunca un número', () => {
    expect(etiquetaDeVoces({ total: 0, cargando: false, error: false })).toBe(ETIQUETA_SIN_DATOS);
    expect(etiquetaDeVoces({ total: undefined, cargando: true, error: false })).toBe(
      ETIQUETA_SIN_DATOS,
    );
    expect(etiquetaDeVoces({ total: undefined, cargando: false, error: true })).toBe(
      ETIQUETA_SIN_DATOS,
    );
  });

  it('nunca devuelve cadena vacía: el hueco no se deja, para no saltar el layout', () => {
    const casos = [
      { total: undefined, cargando: true, error: false },
      { total: undefined, cargando: false, error: true },
      { total: 0, cargando: false, error: false },
      { total: 7, cargando: false, error: false },
    ];
    for (const caso of casos) {
      expect(etiquetaDeVoces(caso)).not.toBe('');
    }
  });

  it('el 12.496 fabricado ya no existe en ningún estado sin datos', () => {
    expect(etiquetaDeVoces({ total: undefined, cargando: true, error: false })).not.toContain(
      '12.496',
    );
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/components/papel/__tests__/voces-regimen.test.ts`
Esperado: FALLA con `Failed to resolve import "../voces-regimen"`.

- [ ] **Paso 3: Implementación mínima**

Crear `apps/web/src/components/papel/voces-regimen.ts`:

```ts
/**
 * Régimen de honestidad del contador de voces (D4 de
 * `docs/specs/2026-07-26-el-sustrato.md`). Calcado de
 * `pages/ElMandatoVivo/mandato-regimen.ts`: la política vive acá, testeada, no
 * repartida por el JSX.
 *
 * Reemplaza a `DEMO_VOCES_COUNT`, que afirmaba «12.496 voces» en la posición de
 * máxima confianza del sitio cada vez que la API no respondía — y con
 * `retry:false` + `staleTime:Infinity`, un solo fetch fallido lo dejaba clavado
 * toda la sesión.
 */
export type EstadoCifra = 'valor' | 'cero' | 'cargando' | 'error';

export const ETIQUETA_SIN_DATOS = 'Falta la tuya.';

export interface EntradaDeCifra {
  readonly total: number | undefined;
  readonly cargando: boolean;
  readonly error: boolean;
}

/**
 * `error` gana sobre `cargando`; `cargando` sobre los datos; `total >= 1` →
 * `'valor'`; `total === 0` → `'cero'`. Un `total` indefinido sin carga ni error
 * (consulta deshabilitada, respuesta rara) cuenta como `'error'`: no hay nada
 * que contar, y ese es el único hecho que importa.
 */
export function estadoDeCifra(entrada: EntradaDeCifra): EstadoCifra {
  if (entrada.error) return 'error';
  if (entrada.cargando) return 'cargando';
  if (entrada.total === undefined) return 'error';
  return entrada.total >= 1 ? 'valor' : 'cero';
}

/**
 * `n >= 1` → «{N} voces · falta la tuya» (es-AR). Cero, cargando y error →
 * `ETIQUETA_SIN_DATOS`. Nunca devuelve `''`: conserva el elemento de identidad
 * de §1 en los cuatro estados y evita el salto de layout.
 *
 * El plural es fijo a propósito: la guardia del prerender (B12) detecta números
 * horneados con `/\d[\d.]*\s+voces/`, y una variante «1 voz» la esquivaría.
 */
export function etiquetaDeVoces(entrada: EntradaDeCifra): string {
  if (estadoDeCifra(entrada) !== 'valor') return ETIQUETA_SIN_DATOS;
  return `${(entrada.total ?? 0).toLocaleString('es-AR')} voces · falta la tuya`;
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/components/papel/__tests__/voces-regimen.test.ts`
Esperado: PASA — 9 tests verdes.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/components/papel/voces-regimen.ts \
        apps/web/src/components/papel/__tests__/voces-regimen.test.ts
git commit -m "feat(web): régimen de honestidad del contador de voces, con los cuatro estados testeados"
```

---

### Tarea 11 (B10): el header deja de afirmar 12.496 voces

**Files:**
- Modify: `apps/web/src/components/papel/papel-nav.ts` (borrar `DEMO_VOCES_COUNT` y su comentario `/** Contador FOMO… */`; anclar en ese texto)
- Modify: `apps/web/src/components/papel/PapelHeader.tsx` (imports + el slot de la cifra)
- Modify: `apps/web/src/components/__tests__/PapelHeader.test.tsx` (import de `papel-nav` + los dos primeros `it`)

**Interfaces:**
- Consumes: `etiquetaDeVoces`, `ETIQUETA_SIN_DATOS` (`./voces-regimen`, Tarea 10).
- Produces: nada nuevo. Borra el export `DEMO_VOCES_COUNT`.

> **Dos casos de la suite exigen hoy el número fabricado** (`PapelHeader.test.tsx:35` y `:46`). La suite protege la mentira: por eso este es el único lugar del plan donde un test existente cambia de expectativa, y cambia a propósito.

- [ ] **Paso 1: Escribir el test que falla**

En `apps/web/src/components/__tests__/PapelHeader.test.tsx`, reemplazar el bloque de los dos imports de `../papel/` —anclando en el texto literal de las dos líneas seguidas:

```tsx
import { DEMO_VOCES_COUNT, PAPEL_NAV } from '../papel/papel-nav';
import { PapelHeader } from '../papel/PapelHeader';
```

— y los dos primeros `it` del `describe('PapelHeader')` (los que hoy dicen `falls back to the demo count`) por:

```tsx
import { PAPEL_NAV } from '../papel/papel-nav';
import { PapelHeader } from '../papel/PapelHeader';
import { ETIQUETA_SIN_DATOS } from '../papel/voces-regimen';
```

(En ese orden exacto. `import/order` corre con `alphabetize: { order: 'asc', caseInsensitive: true }` —verificado en `packages/config/eslint/index.js:54-61`— y comparando en minúsculas queda `papel/papel-nav` < `papel/papelheader` < `papel/voces-regimen`, porque `-` (0x2d) ordena antes que `h`. O sea: el import nuevo de `voces-regimen` va **después** de `PapelHeader`, no pegado a `papel-nav`. Al revés, el `eslint src --max-warnings 0` del Paso 4 falla.)

```tsx
  it('renders the wordmark linking home and never invents a count while loading', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByRole('link', { name: '¡BASTA! — inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByText(ETIQUETA_SIN_DATOS)).toBeInTheDocument();
    expect(screen.queryByText(/12\.496/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\d[\d.]*\s+voces/)).not.toBeInTheDocument();
  });

  it('says the same honest line on error', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByText(ETIQUETA_SIN_DATOS)).toBeInTheDocument();
    expect(screen.queryByText(/\d[\d.]*\s+voces/)).not.toBeInTheDocument();
  });

  it('says the same honest line when the real count is zero', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 0 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByText(ETIQUETA_SIN_DATOS)).toBeInTheDocument();
  });
```

Los tres `it` que siguen (líneas 49-98: «renders the live total formatted es-AR once loaded», «renders the recorrido nav…» y «toggles the full-screen mobile menu») **no se tocan**: el primero ya espera `'12.496 voces · falta la tuya'` con `data: { total: 12496 }`, que es un dato real de la API mockeada y sigue siendo correcto.

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/components/__tests__/PapelHeader.test.tsx`
Esperado: FALLA con `Failed to resolve import "../papel/voces-regimen"` si la Tarea 10 no está, o —con la Tarea 10 hecha— con `Unable to find an element with the text: Falta la tuya.`, porque el header sigue pintando `12.496 voces · falta la tuya`.

- [ ] **Paso 3: Implementación mínima**

Borrar de `apps/web/src/components/papel/papel-nav.ts` el bloque de comentario `/** Contador FOMO… */` junto con el `export const DEMO_VOCES_COUNT = '12.496';` que lo sigue (en HEAD, las líneas 52-57). El archivo termina ahora en `PAPEL_NAV_ALL`.

En `apps/web/src/components/papel/PapelHeader.tsx` van tres ediciones **ancladas en texto**, no en línea: el plan A (Tarea 14) ya tocó este archivo para cambiar el `☰` por `<GlifoMenu />`, lo que le agrega un import y corre todo lo que está debajo.

(1) Sacar `DEMO_VOCES_COUNT` del import de `./papel-nav` y agregar el del régimen. Ancla:

```tsx
  BIBLIOTECA_HREF,
  DEMO_VOCES_COUNT,
  PAPEL_NAV,
```

pasa a:

```tsx
  BIBLIOTECA_HREF,
  PAPEL_NAV,
```

y, anclando en la línea `} from './papel-nav';`, agregar inmediatamente debajo:

```tsx
import { etiquetaDeVoces } from './voces-regimen';
```

(`./papel-nav` < `./voces-regimen` alfabéticamente, así que va después y `import/order` queda contento. Si A ya insertó el import de primitivas, el especificador que escribe A/Tarea 14 es `import { GlifoMenu } from '~/components/papel/primitives';` — vive en el bloque `~/`, el que hoy arranca en `~/lib/despertar`, así que no interfiere con la posición de `./voces-regimen` dentro del grupo `sibling`; no se toca.)

(2) Reemplazar el cálculo de la etiqueta, anclando en el texto literal:

```tsx
  // Mientras carga o si falla, caemos al valor de demostración: nunca
  // mostramos un contador en blanco ni un error en el header.
  const vocesLabel = vocesQuery.data
    ? vocesQuery.data.total.toLocaleString('es-AR')
    : DEMO_VOCES_COUNT;
```

por:

```tsx
  // Cuando no hay nada que contar, se dice. El slot nunca queda vacío —conserva
  // el elemento de identidad de §1— pero tampoco afirma un número que nadie contó.
  const vocesLabel = etiquetaDeVoces({
    total: vocesQuery.data?.total,
    cargando: vocesQuery.isLoading,
    error: vocesQuery.isError,
  });
```

(La línea `const vocesQuery = useVocesCount();` vive **arriba** del ancla y queda intacta: no entra en el texto a reemplazar ni en el reemplazo. Redeclararla sería `TS2451` más `no-redeclare` en el Paso 4.)

(3) Reemplazar el texto del slot, anclando en el literal `{vocesLabel} voces · falta la tuya` (la etiqueta `voces` y el «falta la tuya» los pone ahora `etiquetaDeVoces`), por:

```tsx
              {vocesLabel}
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run && pnpm -C apps/web exec eslint src --max-warnings 0`
Esperado: PASA — la suite entera, incluidos los otros ocho archivos que montan `PapelHeader` (`MenuBiblioteca.test.tsx`, `despertar.test.tsx`, `MdxPapel.test.tsx`, `Home.test.tsx`, `ElMapa.test.tsx`, `LaIdea.test.tsx`, `ElMandatoVivo.test.tsx`, `Planes.test.tsx`).

Grep de control (tiene que dar cero):

```bash
grep -rn "DEMO_VOCES_COUNT\|12\.496" apps/web/src --include="*.ts" --include="*.tsx" \
  | grep -v "__tests__" | grep -v "\.test\."
```

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/components/papel/papel-nav.ts \
        apps/web/src/components/papel/PapelHeader.tsx \
        apps/web/src/components/__tests__/PapelHeader.test.tsx
git commit -m "fix(web): el header deja de afirmar 12.496 voces y dice «Falta la tuya.» cuando no hay dato"
```

---

### Tarea 12 (B10): `CifrasStrip` deja de cargar para siempre

**Files:**
- Modify: `apps/web/src/pages/Home/sections/CifrasStrip.tsx:8-32` y `:46-75` (el array `tiles`; el `return (` de la línea 77 y todo el render **no** se tocan)
- Modify: `apps/web/src/pages/Home/sections/__tests__/CifrasStrip.test.tsx:111-136`

**Interfaces:**
- Consumes: `EntradaDeCifra`, `estadoDeCifra` (`~/components/papel/voces-regimen`, Tarea 10).
- Produces: nada nuevo.

> Hoy, con `retry:false`, una consulta que falla deja `isLoading: false` y `data: undefined` para siempre: el tile queda pulsando «Cargando cifra» hasta que el visitante se va. El régimen distingue los dos casos y el error dice que es un error.

- [ ] **Paso 1: Escribir el test que falla**

En `apps/web/src/pages/Home/sections/__tests__/CifrasStrip.test.tsx`, reemplazar el último `it` (líneas 111-136) por:

```tsx
  it('shows a skeleton while loading and an honest dash on error — never a made-up number', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    mockedUseCifras.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useCifras>);
    mockedUseSemillasCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useSemillasCount>);
    renderStrip();

    // voces y semillas siguen en vuelo; propuestas y señales fallaron.
    expect(screen.getAllByRole('status', { name: 'Cargando cifra' })).toHaveLength(2);
    expect(screen.getAllByRole('status', { name: 'Sin dato ahora' })).toHaveLength(2);
    expect(screen.queryByText('12.496')).not.toBeInTheDocument();
    expect(screen.queryByText('3.107')).not.toBeInTheDocument();
    expect(screen.queryByText('214')).not.toBeInTheDocument();
  });

  it('renders a real zero as zero — cero es un dato, no un error', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 0 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    mockedUseCifras.mockReturnValue({
      data: { voces: 0, propuestas: 0, senales: 0, posts: 0 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCifras>);
    mockedUseSemillasCount.mockReturnValue({
      data: { total: 0 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSemillasCount>);
    renderStrip();

    expect(screen.getAllByText('0')).toHaveLength(4);
    expect(screen.queryByRole('status', { name: 'Sin dato ahora' })).not.toBeInTheDocument();
  });
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/pages/Home/sections/__tests__/CifrasStrip.test.tsx`
Esperado: FALLA con `Unable to find an accessible element with the role "status" and name "Sin dato ahora"` — hoy el error también pinta el skeleton.

- [ ] **Paso 3: Implementación mínima**

En `apps/web/src/pages/Home/sections/CifrasStrip.tsx`, reemplazar el bloque de imports y el tipo `CifraTile` (líneas 1-32) por:

```tsx
import { Link } from 'wouter';

import { PLAN_COUNT } from '../landing-data';

import { estadoDeCifra, type EntradaDeCifra } from '~/components/papel/voces-regimen';
import { useCifras, useVocesCount } from '~/lib/queries/analytics';
import { useSemillasCount } from '~/lib/queries/semillas';

interface CifraTile extends EntradaDeCifra {
  key: string;
  label: string;
  href: string;
}

/**
 * Valor de una cifra según el régimen de honestidad (D4): skeleton papel
 * mientras carga, palito mudo si la consulta falló —con `retry:false` eso es
 * definitivo, y el skeleton eterno mentía diciendo «ya viene»—, y el número
 * cuando hay número. Cero es un dato y se muestra. `role="status"` para que los
 * dos estados mudos se anuncien a lectores de pantalla.
 */
function CifraValor({ total, cargando, error }: EntradaDeCifra) {
  const estado = estadoDeCifra({ total, cargando, error });

  if (estado === 'cargando') {
    return (
      <div
        role="status"
        aria-label="Cargando cifra"
        className="bg-papel-presionado anim-pulso-papel h-[46px] w-20"
      />
    );
  }

  if (estado === 'error') {
    return (
      <div
        role="status"
        aria-label="Sin dato ahora"
        className="font-anton text-tinta-75 text-[46px] leading-none"
      >
        —
      </div>
    );
  }

  return (
    <div className="font-anton text-[46px] leading-none">{(total ?? 0).toLocaleString('es-AR')}</div>
  );
}
```

y reemplazar **sólo el array `tiles`** —anclando desde `  const tiles: CifraTile[] = [` hasta el `  ];` que lo cierra (líneas 46-75 del archivo original)— por:

```tsx
  const tiles: CifraTile[] = [
    {
      key: 'voces',
      total: vocesQuery.data?.total,
      cargando: vocesQuery.isLoading,
      error: vocesQuery.isError,
      label: 'voces en el mapa',
      href: '/el-mapa',
    },
    {
      key: 'semillas',
      total: semillasQuery.data?.total,
      cargando: semillasQuery.isLoading,
      error: semillasQuery.isError,
      label: 'semillas plantadas',
      href: '/sembrar',
    },
    {
      key: 'propuestas',
      total: cifrasQuery.data?.propuestas,
      cargando: cifrasQuery.isLoading,
      error: cifrasQuery.isError,
      label: 'propuestas del mandato',
      href: '/mandato-vivo',
    },
    {
      key: 'senales',
      total: cifrasQuery.data?.senales,
      cargando: cifrasQuery.isLoading,
      error: cifrasQuery.isError,
      label: 'señales del pulso',
      href: '/mandato-vivo',
    },
  ];
```

El `return (` de la línea 77 y todo el JSX que le sigue sobreviven intactos: si el rango se estira hasta la 86 se borra la apertura del render y el archivo no compila.

Y, dentro del `map`, cambiar la línea del valor por:

```tsx
            <CifraValor total={t.total} cargando={t.cargando} error={t.error} />
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/pages/Home && pnpm -C apps/web exec eslint src --max-warnings 0`
Esperado: PASA — los cinco casos de `CifrasStrip.test.tsx` verdes, incluidos los tres que ya existían y no se tocaron.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/pages/Home/sections/CifrasStrip.tsx \
        apps/web/src/pages/Home/sections/__tests__/CifrasStrip.test.tsx
git commit -m "fix(web): la franja de cifras distingue error de carga y deja de pulsar para siempre"
```

---

### Tarea 13 (B10): las tres portadas consultan el mismo régimen

**Files:**
- Modify: `apps/web/src/pages/ElMapa/sections/PortadaMapa.tsx:1-32`
- Modify: `apps/web/src/pages/ElMandatoVivo/sections/PortadaMandato.tsx:1-12` y `:32`
- Modify: `apps/web/src/pages/LaIdea/sections/CapituloSinLider.tsx:1-7` y `:48`
- Test: `apps/web/src/pages/ElMapa/sections/__tests__/PortadaMapa.test.tsx` (nuevo)

**Interfaces:**
- Consumes: `estadoDeCifra` (`~/components/papel/voces-regimen`, Tarea 10).
- Produces: nada nuevo.

> Los tres ya son honestos: ninguno inventa. Lo que cambia es **de dónde sale la regla**. Hoy cada uno decide por su cuenta (`voces.data ?`, `n !== undefined && n >= 1`, `vocesQuery.data ?`); después, los tres preguntan lo mismo, y el prerender de B12 no puede congelar un número porque la política está en un solo lugar testeado. **Cambio de comportamiento, uno solo:** `PortadaMapa` hoy con `total: 0` pinta «0 voces en el mapa»; después no pinta el bloque, igual que `PortadaMandato` y `CapituloSinLider`. Es lo que D4 pide para el estado `cero`.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/pages/ElMapa/sections/__tests__/PortadaMapa.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PortadaMapa } from '../PortadaMapa';

import { useVocesCount } from '~/lib/queries/analytics';

vi.mock('~/lib/queries/analytics', () => ({
  useVocesCount: vi.fn(),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);

describe('PortadaMapa (D4 — régimen de la cifra)', () => {
  it('muestra la cifra real formateada es-AR', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    render(<PortadaMapa />);

    expect(screen.getByText('12.496')).toBeInTheDocument();
    expect(screen.getByText('voces en el mapa')).toBeInTheDocument();
  });

  it('usa el singular con una sola voz', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 1 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    render(<PortadaMapa />);

    expect(screen.getByText('voz en el mapa')).toBeInTheDocument();
  });

  it('no pinta nada mientras carga, si falla, o si el total real es cero', () => {
    const mudos = [
      { data: undefined, isLoading: true, isError: false },
      { data: undefined, isLoading: false, isError: true },
      { data: { total: 0 }, isLoading: false, isError: false },
    ];
    for (const estado of mudos) {
      mockedUseVocesCount.mockReturnValue(estado as ReturnType<typeof useVocesCount>);
      const { container, unmount } = render(<PortadaMapa />);
      expect(container.textContent).not.toMatch(/voces? en el mapa/);
      expect(container.textContent).not.toMatch(/\d/);
      unmount();
    }
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/pages/ElMapa/sections/__tests__/PortadaMapa.test.tsx`
Esperado: FALLA en el tercer caso, con `expected "0voces en el mapa" not to match /\d/` — hoy el total real de cero pinta «0».

- [ ] **Paso 3: Implementación mínima**

En `apps/web/src/pages/ElMapa/sections/PortadaMapa.tsx`, reemplazar las líneas 1-2 y **9-10** (o sea el texto literal `export function PortadaMapa() {` más `  const voces = useVocesCount();`; el `return (` de la línea 12 **no** entra en el rango) por:

```tsx
import { Kicker, RitoTinta } from '~/components/papel/primitives';
import { estadoDeCifra } from '~/components/papel/voces-regimen';
import { useVocesCount } from '~/lib/queries/analytics';
```

```tsx
export function PortadaMapa() {
  const voces = useVocesCount();
  const hayCifra =
    estadoDeCifra({
      total: voces.data?.total,
      cargando: voces.isLoading,
      error: voces.isError,
    }) === 'valor';
```

y reemplazar la condición de la línea 23 (`{voces.data ? (`) por:

```tsx
      {hayCifra && voces.data ? (
```

En `apps/web/src/pages/ElMandatoVivo/sections/PortadaMandato.tsx`, reemplazar las líneas 1-2 y 10-12 por:

```tsx
import { Kicker, RitoTinta } from '~/components/papel/primitives';
import { estadoDeCifra } from '~/components/papel/voces-regimen';
import { useVocesCount } from '~/lib/queries/analytics';
```

```tsx
export function PortadaMandato() {
  const voces = useVocesCount();
  const n = voces.data?.total;
  const hayCifra =
    estadoDeCifra({ total: n, cargando: voces.isLoading, error: voces.isError }) === 'valor';
```

y reemplazar la condición de la línea 32 (`{n !== undefined && n >= 1 ? (`) por:

```tsx
        {hayCifra && n !== undefined ? (
```

En `apps/web/src/pages/LaIdea/sections/CapituloSinLider.tsx`, agregar al bloque de imports, después de la línea 5:

```tsx
import { estadoDeCifra } from '~/components/papel/voces-regimen';
```

agregar dentro del componente, justo después de `const vocesQuery = useVocesCount();`:

```tsx
  const hayCifra =
    estadoDeCifra({
      total: vocesQuery.data?.total,
      cargando: vocesQuery.isLoading,
      error: vocesQuery.isError,
    }) === 'valor';
```

y reemplazar la condición de la línea 48 (`{vocesQuery.data ? (`) por:

```tsx
            {hayCifra && vocesQuery.data ? (
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run && pnpm verify`
Esperado: PASA — los 3 tests nuevos y la suite entera. En particular siguen verdes `ElMapa.test.tsx:50` y `Home.test.tsx:79`, que esperan `'12.496'` con la consulta resuelta: ese número viene de la API mockeada, no de una constante.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/pages/ElMapa/sections/PortadaMapa.tsx \
        apps/web/src/pages/ElMapa/sections/__tests__/PortadaMapa.test.tsx \
        apps/web/src/pages/ElMandatoVivo/sections/PortadaMandato.tsx \
        apps/web/src/pages/LaIdea/sections/CapituloSinLider.tsx
git commit -m "refactor(web): las tres portadas con cifra consultan el mismo régimen de honestidad"
```

---

### Tarea 14 (B10): el pie deja de declarar prototipo y `NotaDemo` se muere

**Files:**
- Modify: `apps/web/src/components/papel/PapelFooter.tsx` (sólo el segundo `<span>` de la barra inferior; anclado en texto)
- Delete: `apps/web/src/components/papel/primitives/NotaDemo.tsx`
- Modify: `apps/web/src/components/papel/primitives/index.ts` (la línea del export de `NotaDemo`; anclada en texto)
- Modify: `apps/web/src/components/papel/primitives/primitives.test.tsx` (imports + el `describe('NotaDemo')`)
- Create: `apps/web/src/components/__tests__/PapelFooter.test.tsx`
- ~~Modify: `docs/design-system/README.md` (§5, §7, §11.3)~~ — **no**: las tres enmiendas son de B0 (plan A, Tarea 1), que corre antes y las cubre con su propio test. Acá sólo se greppea.

**Interfaces:**
- Consumes: nada nuevo. **Esta tarea cambia sólo el copy, nunca un token.** Las cuatro ocurrencias de `text-oscuro-tenue` de `PapelFooter.tsx` (líneas 37, 54, 65 y 80 de HEAD) —`#5C594F` sobre tinta = **2,6437:1**, falla todo— las migra **B6, en el plan B**, junto con el resto del retinte del sitio: no son de este plan. Por eso esta tarea **no toca el `<div>` contenedor** de la barra inferior: reemplaza sólo el `<span>` de adentro, anclado en su texto. Así los dos bloques pueden correr en cualquier orden sin pisarse, y este plan no depende de que exista `text-oscuro-texto-debil`. Si se transcribiera el `<div>` entero se le estaría fijando un token a un archivo que B6 va a reescribir.
- Produces: nada. Borra el export `NotaDemo` del barril de primitivas.

> **Contrato con B12:** este es el commit que **saca** `NotaDemo` de `components/papel/primitives/index.ts`. B12 **agrega** `FolioDeLectura` al mismo archivo. El orden de bloques pone B10 primero, así que B12 edita, no reescribe.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/components/__tests__/PapelFooter.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PapelFooter } from '../papel/PapelFooter';

describe('PapelFooter (D4 — declaración positiva y auditable)', () => {
  it('no declara prototipo ni datos de demostración', () => {
    const { container } = render(<PapelFooter />);
    expect(container.textContent).not.toMatch(/prototipo/i);
    expect(container.textContent).not.toMatch(/datos de demostración/i);
  });

  it('nombra los dos orígenes reales de los números y linkea a los datos abiertos', () => {
    render(<PapelFooter />);
    expect(screen.getByText(/salen de la base/i)).toBeInTheDocument();
    expect(screen.getByText(/contenido en disco/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'verificalo' })).toHaveAttribute(
      'href',
      '/datos-abiertos',
    );
  });
});
```

(Ningún caso assertea sobre clases de token: el contraste de la barra inferior es asunto de B6, en el plan B, y su guardia vive allá. Este archivo chequea copy y nada más — así los dos bloques no se pisan ni se ordenan entre sí.)

En `apps/web/src/components/papel/primitives/primitives.test.tsx`, sacar `NotaDemo` del import del barril —anclando en el identificador dentro de la lista de imports— y borrar el bloque `describe('NotaDemo', …)` entero, anclando en su primera línea. **Sin números de línea:** el plan A (Tarea 14) ya editó este archivo (el `✕` de la línea 53 de HEAD) y la Tarea 13 de A agregó exports al barril, así que la numeración de HEAD no vale.

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/components/__tests__/PapelFooter.test.tsx`
Esperado: FALLA con `expected "…Prototipo con datos de demostración" not to match /prototipo/i`.

- [ ] **Paso 3: Implementación mínima**

En `apps/web/src/components/papel/PapelFooter.tsx`, **reemplazar SOLO el segundo `<span>` de la barra inferior**, anclando en su texto literal:

```tsx
          <span>Prototipo con datos de demostración</span>
```

por:

```tsx
          {/* D4: la frase reemplaza a «Prototipo con datos de demostración», que
              desmentía los conteos de contenido —que son ciertos— y a la vez
              servía de coartada para el 12.496 fabricado del header. */}
          <span>
            Las métricas salen de la base; los conteos, del contenido en disco. Ninguna cifra está
            escrita a mano —{' '}
            <Link
              href="/datos-abiertos"
              className="text-oscuro-secundario hover:text-papel underline underline-offset-2"
            >
              verificalo
            </Link>
            .
          </span>
```

Borrar el archivo `apps/web/src/components/papel/primitives/NotaDemo.tsx` y su línea en el barril:

```bash
git rm apps/web/src/components/papel/primitives/NotaDemo.tsx
```

En `apps/web/src/components/papel/primitives/index.ts`, borrar la línea `export { NotaDemo } from './NotaDemo';` — **anclando en ese texto, no en su número**: en HEAD está en la línea 12, pero el plan A (Tarea 13) inserta antes un bloque de exports de `Glifos` después de la línea de `FilaIndiceExpandible`, y para cuando esta tarea corre el export de `NotaDemo` ya se movió.

**Las tres enmiendas a la ley (§5, §7 y §11.3) NO son de esta tarea: las aplica B0, o sea la Tarea 1 del plan A**, que corre antes por el orden topológico y que además las cubre con `scripts/build/__tests__/enmiendas-documentales.test.ts`. Acá sólo se verifica que estén: el grep de control del Paso 4 tiene que dar cero. **Si devuelve algo, B0 quedó incompleto** — no se parchea desde este plan (las redacciones canónicas viven en A y aplicarlas dos veces las pisa, o falla al no encontrar el texto viejo): se vuelve a la Tarea 1 de A, se completa ahí y se corre `pnpm test:scripts`.

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run && pnpm verify`
Esperado: PASA — la suite entera; `primitives.test.tsx` con un `describe` menos.

Greps de control (los tres tienen que dar cero):

```bash
grep -rn "NotaDemo" apps/web/src
grep -rn "Prototipo con datos de demostración" apps/web/src
# Las tres enmiendas de la ley las aplicó B0 (plan A, Tarea 1). Si este grep devuelve
# algo, B0 quedó incompleto: se completa allá, no acá.
grep -rn "asterisco\|datos de demostración" docs/design-system/README.md
```

Verificación a mano en el navegador:
- (j) con la API **apagada** (`pnpm -C apps/web dev` sin levantar `apps/api`), abrir `/`: el header dice «Falta la tuya.», los cuatro tiles de la franja muestran el palito con `aria-label="Sin dato ahora"`, y el tile de planes sigue mostrando el conteo real del MDX.
- (k) con la API **levantada**, recargar: el header pasa a «{N} voces · falta la tuya» y los tiles muestran los números reales.
- (l) el pie de cualquier ruta papel: la frase nueva, con «verificalo» linkeando a `/datos-abiertos`, y ni rastro de «Prototipo».
- (m) `/mandato-vivo` y `/la-idea#capitulo-iii` con la API apagada: ninguna de las dos pinta una línea de cifra a medio hacer.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/components/papel/PapelFooter.tsx \
        apps/web/src/components/papel/primitives/index.ts \
        apps/web/src/components/papel/primitives/primitives.test.tsx \
        apps/web/src/components/__tests__/PapelFooter.test.tsx
git commit -m "feat(web): el pie declara de dónde salen los números y NotaDemo se retira del sistema"
```

---

## Self-review

- **Cobertura de la spec.** B7 completo: `lib/rutas/` sin dependencias de Vite y con fuente inyectada (Tareas 1–4, 6), `esRutaPapel()` reimplementado encima de `superficieDe` con los 18 casos de la suite existente verdes **sin tocarla** (Tarea 5), el hook montado una sola vez en `App.tsx` (Tarea 7), `descripcionDe()` testeado contra los 23 planes, los 22 posts y los 21 ensayos reales (Tarea 1), la `descripcionMeta` escrita a mano de `/cronica` en la entrada del registro (Tarea 2) y la guardia `meta:check` en CI (Tarea 9) — **completa salvo las reglas 4b y 6**, que dependen de `fuente-disco.ts` y `sellado.ts` (B11) y quedan diferidas allá: hoy una ruta nueva no puede shippear sin entrada, pero un documento cuya descripción derivada pase de largo, o un `legacySlug` nuevo que no llegue a `v2/vercel.json`, todavía pasan. B8 completo: el efecto por superficie escribe `colorScheme` y `theme-color`, con el test que pinea los tres colores contra `tokens.css` (Tarea 8). B10 completo: `DEMO_VOCES_COUNT` borrado, régimen de cuatro estados, `CifrasStrip` con error explícito, los 5 consumidores de producción y los 9 archivos de test tocados o verificados, el pie resuelto y `NotaDemo` fuera del barril (Tareas 10–14).
- **Cero datos inventados.** Ningún número aparece en el código de este plan: los conteos del canon (54 rutas, 22 papel, 32 legado, 23/19/8/4 de indexación, 7 redirecciones puras, 17 legacySlugs) viven **solo en los tests**, computados o comparados contra el registro y contra los registries reales, nunca escritos en el JSX. `enumerarUrls` y `enumerarRedirecciones` recorren la fuente inyectada: cuando entren los cuatro PLANes nuevos (23 → 27 archivos) no se toca una línea.
- **Consistencia con el contrato del arquitecto.** Todas las firmas están copiadas literales. Dos ajustes de implementación, ninguno de interfaz: (1) los tipos `Superficie`/`Indexacion`/`EntradaRegistro` y el array de datos se declaran en `entradas.ts` y `registro.ts` los re-exporta — el contrato exige que se exporten **desde `registro.ts`**, y así es, sin ciclo y sin un archivo de 700 LOC; (2) `resolverMetadata` de una ruta que no matchea nada devuelve una entrada sintética privada (`EXTRAVIADA`, `og: 'default'` → `OG_POR_DEFECTO`), porque el catch-all `<Route component={NotFound} />` no declara `path` y por lo tanto no puede estar en el registro que `meta:check` exige biyectivo.
- **La frontera Vite se sostiene.** `registro.ts`, `entradas.ts` y `descripcion-de.ts` no importan nada más que hermanos relativos. Verificable con `grep -n "import.meta\|from '~/\|node:" apps/web/src/lib/rutas/{registro,entradas,descripcion-de}.ts` → cero líneas. No hay barril `lib/rutas/index.ts`. `use-metadata.ts` es el único que lee env, y lo hace con un tipo declarado en vez de castear, para no chocar con `no-unsafe-member-access` de `strictTypeChecked`.
- **El chunk inicial engorda una vez, y está presupuestado.** Los cinco content registries quedan perezosos: `CARGADORES_WEB` usa `import()` dinámico en los 7 patrones y `use-metadata.ts` importa `fuente-web.ts`, que no importa ningún registry en el top level; el paso (e) de la Tarea 7 lo verifica en la pestaña Network. **Pero `entradas.ts` sí entra al chunk de entrada**, y es obligatorio que entre: la cadena `App.tsx` → `use-metadata.ts` → `registro.ts` → `entradas.ts` es de imports estáticos de punta a punta. Son ~20 KB de fuente (54 entradas con título y descripción en prosa), del orden de varios KB gzip. Por eso el plan A (Tarea 7, Paso 4) cierra el presupuesto con **5 KB de margen operativo + 6 KB reservados para el registro de rutas de B7**, y por eso la Tarea 7 de este plan mide antes de commitear. Si aun así muerde, la salida **no** es subir el techo: es darle chunk propio a `entradas.ts` en `manualChunks`.
- **Nota que hay que corregirle al arquitecto:** la nota 9 del contrato dice que `scripts/vitest.config.ts` solo incluye `content/__tests__/**`. Es falso hoy: el `include` ya trae `'build/__tests__/**/*.test.ts'`. B9/B11/B12 no tienen que agregar ese glob.
- **Riesgos y deuda observada, señalados a propósito:**
  1. **`/mandato-vivo/pulso/:id` y `/mandato-vivo/propuesta/:id` quedan `superficie: 'papel'`** porque así lo fija el contrato (nota 13, bullet 4), pero `ElMandatoVivo/sections/MarcoAnexo.tsx:20` los pinta `bg-tinta min-h-screen`: son papel **oscuro** en pantalla. Consecuencia acotada: su `theme-color` sale crema sobre una página oscura. No se cambió acá para no divergir de los tres planes hermanos; corregirlo es cambiar dos strings en `entradas.ts` y una línea del test de canon, y conviene hacerlo en un commit propio con los cuatro planes ya integrados.
  2. **`/iniciativas/:slug/documento` sella su shell en `/iniciativas/documento`.** Si algún día una iniciativa tuviera el slug `documento`, esa URL serviría el shell del documento en vez del de la iniciativa. Los slugs de iniciativa salen de títulos de la base; el riesgo es teórico y queda anotado en vez de resuelto con una ruta `/_shell/` que ensuciaría el `dist`.
  3. **`LARGO_MAXIMO_TITULO` no se aplica a títulos de documento.** `PLANRUTA` se llama «Cuando el sistema caiga alguien tiene que saber reconstruir»: 58 caracteres, 68 con el sufijo. Aplicarle el tope obligaría a truncar contenido o a inventar títulos cortos por plan, las dos cosas peores que un `<title>` que Google recorta. La regla 4 de `meta:check` que B11 agrega tiene que chequear **solo la descripción** de cada documento resuelto.
  4. **`etiquetaDeVoces` dice «1 voces» cuando el total es 1.** Es deliberado: la guardia del prerender de B12 (`/\d[\d.]*\s+voces/`) depende del plural literal, y §1 de la ley fija la frase. Vale un minuto de la vida del sitio contra una guardia que no se puede esquivar.
  5. **`PortadaMapa` cambia de comportamiento con `total: 0`**: hoy pinta «0 voces en el mapa», después no pinta el bloque. Es lo que pide D4 para el estado `cero` y lo cubre el tercer caso del test nuevo, pero es el único cambio visible de esta tarea y merece mirarse en el paso (m).
- **Lo que este plan NO hace, y de quién es:** el sellado del `<head>` en build, el `sitemap.xml`, el `robots.txt` y `v2/vercel.json` son **B11**; el prerender de las 44 URLs y `FolioDeLectura` son **B12**; las ~135 tarjetas OG que `rutaOg` referencia son **B9** (hasta entonces las URLs de `/og/*.png` apuntan a archivos que no existen, y eso es correcto: el sellado que las imprime todavía no corre); la escala dual de contraste que remapea `text-tinta-50`/`text-oscuro-tenue` es **B6** — por eso la Tarea 12 estrena `text-tinta-75` (8,18:1, ya conforme) en vez de sumar una ocurrencia nueva de un token que B6 tiene que migrar.
