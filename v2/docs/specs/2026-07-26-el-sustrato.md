# El sustrato — la capa invisible debajo del diseño

**Fecha:** 2026-07-26
**Sistema:** `docs/design-system/README.md` v1.1 (ley)
**Relación con el canon:** este proyecto NO está en el master plan
`docs/plans/2026-07-21-papel-y-tinta-master-plan.md`. Adelanta parte de su Fase 8
(«SEO/OG, print, a11y, perf») y la corre ANTES de las fases de páginas, por la razón
que se explica en «Por qué va primero». Enmienda el master plan en dos puntos
(tarea 1.3 y el alcance de 8.1) y el design-system en cuatro (§2, §5, §7, §12).
**Plan de implementación:** `docs/plans/2026-07-26-el-sustrato-plan.md` (se escribe
después de esta spec)

> **Tesis.** El recorrido papel está bien construido y el sistema de diseño es bueno.
> Lo que falla es todo lo que está debajo: el sitio se sirve desde un shell que declara
> tema oscuro, comparte un solo `<head>` entre 493 URLs, le regala la IP de cada lector
> a Google antes de la primera letra, afirma en el header un número de voces que nadie
> contó, y pinta la numeración de sus índices con un gris que da 1,86:1 contra el papel.
> Nada de esto se ve en una captura de pantalla. Todo se ve cuando alguien comparte un
> link, navega con teclado, abre el sitio con luz de día o mira la pestaña del navegador.
> El sustrato es lo que hace que el diseño exista fuera de la pantalla del que lo hizo.

## Por qué va primero

El orden natural sería terminar de migrar las 32 rutas legado (proyecto ②) y recién
después pulir. Va al revés por tres razones concretas:

1. **El shell condiciona cada página que ② construya.** Hoy `index.html` declara
   `class="dark"` y `body bg-[#0a0a0a]`, y el papel sólo existe dentro de un `div` de
   `RootLayout`. Cada página nueva de ② hereda ese flash negro. Arreglarlo después es
   arreglarlo treinta veces.
2. **El registro de metadata se llena página por página.** Construirlo ahora significa
   que cada página de ② agrega una entrada. Construirlo después es recorrer 54 rutas
   de memoria.
3. **El contraste es una decisión de paleta, no de página.** Tres tokens explican 431
   de los 445 nodos deficientes. Si ② construye ~30 páginas contra la paleta actual,
   el arreglo se vuelve una migración de 30 páginas en vez de un cambio de tokens.

## El veredicto arquitectónico

`apps/web` es una SPA de Vite pura: un `index.html` de 25 líneas con
`<div id="root"></div>`, sin SSR, sin prerender (cero `react-dom/server` en todo el
árbol), y `apps/api` nunca sirve HTML (`app.ts` monta `/api/*` y cierra con
`notFoundHandler`). No existe ninguna configuración de despliegue dentro de `v2/`: el
único `vercel.json` del repo está en la raíz y publica `SocialJusticeHub` (v1).

Verificado empíricamente con `curl -A facebookexternalhit` contra `vite preview` sobre
el `dist` real: `/planes/planeb` devuelve 200, 1632 bytes, el título de la portada y
cero etiquetas `og:`.

**El mecanismo del arreglo no está abierto a debate.** `docs/adr/0001-stack-choices.md`
sigue «Accepted» y declara el modelo de render no negociable salvo ADR que lo supersede.
Inyección por request desde Express o SSR en runtime cuestan un ADR que nadie
presupuestó. **Sellar el `<head>` en build es lo único que cabe dentro de lo ya
decidido**, y no necesita ni una dependencia nueva.

Advertencia que hay que tener presente durante toda la verificación: **`vite preview`
hace fallback SPA por su cuenta**, así que las URLs profundas dan verde en local
mientras un host estático ingenuo devolvería 404 — tapa exactamente el problema que hay
que resolver.

## Decisiones del dueño del proyecto

**D1 · Origen canónico: `https://elinstantedelhombregris.com`.** v2 reemplaza a v1 en
su dominio actual cuando esté terminado; hasta entonces se trabaja y se verifica en
local. El origen se parametriza con `VITE_SITE_ORIGIN` (default: el dominio canónico)
para que los builds de local y de preview emitan el suyo. Ninguna decisión de hosting
bloquea a ①. Nota: `v2/env.example:13` dice `PUBLIC_WEB_URL=http://localhost:5173`
mientras `.claude/launch.json` levanta el web en `5273` — se corrige de paso.

**D2 · Alcance de la indexación: híbrido.** Sellado del `<head>` para todas las URLs
públicas, MÁS prerender de HTML real para las 44 URLs de planes (23) y ensayos (21).
Es más trabajo y más riesgo que sellar el head solo; el §4 de esta spec define cómo se
contiene.

**D3 · Contraste: escala dual + `aria-hidden`.** Los hex actuales quedan para bordes,
divisores, superficies y palitos; se agregan tokens de texto con valores AA; la
numeración de expediente y la flecha `→` se marcan `aria-hidden` por ser decoración.

**D4 · El pie deja de declarar prototipo.** La frase «Prototipo con datos de
demostración» se reemplaza por una declaración positiva y auditable, con link a
`/datos-abiertos`.

## Los hallazgos que originan el trabajo

Todos verificados contra el código; los ratios recalculados con la fórmula de
luminancia relativa de WCAG 2.1.

### Bloqueantes

| Hallazgo | Archivo | Qué sufre el usuario |
|---|---|---|
| Un solo `<head>` para ~493 URLs; cero `og:`/`twitter:` en todo el repo | `apps/web/index.html:8` | Compartir un expediente en WhatsApp es indistinguible de compartir la portada. Idéntico para 23 planes, 21 ensayos, 22 posts, 31 entrenamientos, 329 lecciones |
| No existe skip link; 7 paradas de teclado (12 con el panel de biblioteca abierto) antes del contenido | `apps/web/src/layouts/RootLayout.tsx:31` | Falla WCAG 2.4.1 «Bypass Blocks», nivel **A** — más básico que el AA que promete §10.10 |
| `tinta-30 #B5B1A8` sobre papel = **1,8613:1** | `apps/web/tailwind.config.ts:29` | Los «01», «02» de todos los índices no se leen con luz de día. El mismo token pinta la nota «\* datos de demostración»: **el asterisco de honestidad es el texto menos legible del sitio** |
| El header afirma «12.496 voces» cuando la API no responde | `apps/web/src/components/papel/papel-nav.ts:57` | Número fabricado, sin asterisco, en la posición de máxima confianza. Con `retry:false` + `staleTime:Infinity`, un solo fetch fallido lo deja clavado toda la sesión. **Dos casos de `PapelHeader.test.tsx` exigen ese número: la suite protege la mentira** |

### Altos

| Hallazgo | Archivo | Qué sufre el usuario |
|---|---|---|
| `tinta-50 #7A756A` = **3,9903:1** y `oscuro-tenue #5C594F` sobre tinta = **2,6437:1** | `apps/web/tailwind.config.ts:31` | `tinta-50` pinta el nav, el contador, fechas y kickers a 10–14px; `oscuro-tenue` pinta el footer entero. Tres tokens explican **431 de 445** nodos deficientes, en **49** archivos |
| Seis familias tipográficas desde el CDN de Google | `apps/web/index.html:17` | Render-blocking a un tercero antes de la primera letra; cada lector le regala su IP a Google en un sitio cuyo argumento es la soberanía. Y `security.ts` ya declara `fontSrc ['self','data:',cartoTiles]`: el día que esa CSP llegue al documento, las seis familias mueren |
| Faltan `robots.txt`, `sitemap.xml`, imagen OG, manifest y apple-touch-icon | `apps/web/public/` | Sin sitemap, un buscador tiene que descubrir 457 URLs siguiendo enlaces en una SPA que no renderiza sin JS. Sin robots no hay forma de excluir `/mi-perfil`, `/tablero` ni las rutas de auth |
| No existe regla de fallback SPA en ninguna parte de `v2/` | — | Entrar directo a `/planes/planeb` —lo que hace quien recibe un link— rompería en un host estático. **El test local no lo detecta** |
| El foco no se mueve al cambiar de ruta y el `<title>` nunca cambia | `apps/web/src/lib/ir-al-principio.ts:68` | La navegación SPA es completamente muda para un lector de pantalla: el foco cae a `<body>` y no hay región `aria-live` |
| El anillo de foco sólo existe dentro de `.papel-root` | `apps/web/src/index.css:185` | §10.10 promete foco violeta y lo cumple en 22 de 54 rutas |
| Flash negro estructural + barra de scroll negra sobre papel | `apps/web/index.html:21` | Toda visita fría a una ruta papel abre con un rectángulo negro y salta a crema cuando React monta, después de bajar ~188 KB gzip. `class="dark"` es **código muerto verificado**: cero selectores `.dark` en 68 KB de CSS compilado |

### Medios y bajos

- `.size-limit.json` no mide el payload inicial: omite los chunks `query` y `radix` que
  `index.html` precarga — **28.811 B gzip** sin medir (17,3% sobre lo que sí mide), y el
  glob `index-*` matchea dos archivos distintos.
- `framer-motion` (~44 KB gzip, **22% del JS de la portada**) entra al chunk inicial de
  las 54 rutas por dos widgets de gamificación importados estáticamente.
- El `dist` publica **466 sourcemaps (29 MB)** y dos `.DS_Store` accesibles por URL
  (`GET /.DS_Store` → 200, 8196 bytes de metadata del disco del autor).
- El favicon servido es la marca **v1**: círculo `#0a0a0a` con trazo `iris-violet
  #7D5BDE`, el token que la tarea 7.3 manda borrar. (Corrección a una premisa previa:
  `public/` **sí** existe y el favicon devuelve 200 — el problema es de identidad, no
  de ausencia.)
- `PapelFooter.tsx:82` declara en TODAS las rutas papel «Prototipo con datos de
  demostración»: desmiente los conteos de planes, ensayos y entrenamientos —que salen
  de disco y son ciertos— y a la vez sirve de coartada para el 12.496 fabricado.
- `prefers-reduced-motion` sólo apaga las 14 clases `.anim-*`: framer-motion, el velo
  del despertar y cuatro hover que trasladan quedan afuera.
- `sonner`, `drizzle-zod` y el `zod` de `packages/db` son dependencias de producción con
  cero referencias. **El tope de 60 NO está en riesgo**: son 38 deps de producción
  únicas, con 22 de margen. La purga se justifica por peso y coherencia, no por cupo.

## Diseño

### 1. Un solo registro de rutas

Hoy `layouts/papel-routes.ts` responde *«¿qué chrome recibe esta ruta?»*. ① necesita dos
hechos más por ruta: metadata y superficie de tema. En vez de una segunda tabla paralela
que se desincroniza, se ensancha la existente:

```
apps/web/src/lib/rutas/
  registro.ts         # patrón → { superficie, titulo, descripcion, indexacion }
  descripcion-de.ts   # derivación desde summary
  use-metadata.ts     # hook, montado UNA vez en App.tsx
```

- `superficie: 'papel' | 'papel-oscuro' | 'legado'` — `esRutaPapel()` se reimplementa
  encima (`superficie !== 'legado'`), conservando verdes sus tests actuales.
- `indexacion: 'publica' | 'privada' | 'redireccion'` — gobierna `robots.txt` y qué URLs
  entran al sitemap. `/mi-perfil`, `/tablero`, `/notificaciones` y las rutas de auth son
  `privada`.
- Los 12 patrones dinámicos llevan resolver: reciben el slug y devuelven la metadata
  desde los registries de contenido.

Consecuencia para ②: se actualiza **un** archivo por página migrada en vez de dos.

**Guardia:** `meta:check`, calcada de `scripts/content/verify-planes-index.ts` (que ya
corre en CI), exige biyección entre los `path` de `app-routes.tsx` y las claves del
registro, más los largos de título y descripción. Una ruta nueva no puede shippear sin
metadata.

### 2. Las descripciones se derivan

`title` existe en el 100% de los `.mdx` y `course.json` — no hay nada que escribir. El
`summary` en cambio no sirve crudo: **mediana de 384 caracteres** en planes, máximo 973
(PLANMOV), y **0 de 23** entran en 160.

Regla: primera oración completa; si supera 160, cortar en el último límite de palabra
antes de 157 + «…». Un campo opcional `descripcionMeta` en el frontmatter gana cuando
existe. El helper se testea contra los 23 planes y 22 posts reales.

**Hueco conocido:** los 5 capítulos de `content/cronica` **no tienen campo `summary`**
(0 de 5). Necesitan `descripcionMeta` propio o derivación desde el primer párrafo del
cuerpo — se decide dentro del bloque B6, no bloquea el resto.

### 3. Sellado del `<head>` en build

`scripts/build/sellar-head.ts` corre después de `vite build`:

- Enumera cada URL pública desde el registro y las fuentes de contenido —
  **nunca desde una lista escrita a mano**: el canon de planes pasa de 23 a 27. Los
  slugs salen de `planes-index.generated.ts` (módulo TS plano que `verify-planes-index.ts`
  ya importa desde `tsx`) y de `loadContentDir` de `@v2/shared`, documentado como «Used
  by build-time scripts».
- Escribe `dist/<ruta>/index.html` copiando el shell con `title`, `description`, `og:*`,
  `twitter:*` y `canonical` reemplazados. El `<body>` sigue vacío y React hidrata igual
  porque no hay markup previo.
- Emite `sitemap.xml` (sólo las `publica`) y `robots.txt`.
- Emite **301 reales** para las 6 rutas de redirect puro y los 17 `legacySlugs` del blog.

Cero dependencias nuevas.

**Además, lo que no existe en ninguna parte: la regla de fallback SPA.** Se escribe en la
configuración del host, verificando que no tape los HTML sellados (el fallback debe
ceder ante un archivo existente) y que `/no-existe` devuelva un 404 real y no un 200.

### 4. Prerender real, acotado a 44 URLs (D2)

El Chromium que Playwright ya instala visita cada URL de planes y ensayos contra el
preview local y congela el HTML resultante. **No** se usa `react-dom/server`: eso
obligaría a auditar SSR-safety de un árbol donde `VerifyEmail.tsx:12`,
`ResetPassword.tsx:21` y `CertificadoSemilla.tsx:76` leen `window` en el cuerpo del
componente. Y por ser un artefacto de build y no un cambio del modelo de render, no
contradice ADR 0001.

Dos reglas de contención, ambas obligatorias:

1. **Se congela en estado «dormido».** `despertar.ts` lee `localStorage`; un visitante
   nuevo siempre está en gris, así que el estado congelado coincide exactamente con el
   primer paint. Sin mismatch.
2. **Ningún número derivado de la API puede quedar horneado.** Si no, un conteo de voces
   viejo queda congelado en 44 archivos estáticos para siempre. Converge con el bloque
   B9: después del arreglo del contador, su estado vacío **es** «Falta la tuya.» — el
   arreglo honesto y la restricción del prerender quieren lo mismo.

**Enmienda documental necesaria:** `docs/architecture/README.md:96` limita el SSG a
«blog/ensayos/courses» y deja afuera los 23 planes, que son el corazón del sitio,
mientras la tarea 8.1 del master plan dice «prerender of public routes». Se corrige el
primero para que deje de contradecir al segundo.

### 5. Fuentes propias y los glifos que no existen

Se auto-hospedan las **seis** familias como `.woff2` subseteados en
`apps/web/public/fonts/` con versión en el nombre, `@font-face` en `index.css`, borrando
los dos `preconnect` y el `<link>` de Google. `OFL.txt` junto a los archivos.

Por qué las seis y no las tres papel: self-hostear sólo las papel deja 32 rutas legado
en fuentes del sistema — romper páginas que ② todavía no tocó — e invierte el orden del
canon, que pone el borrado de Inter/Playfair/JetBrains en la tarea **7.3**, después de
las cinco fases de páginas. Con `@font-face`, las tres condenadas sólo se descargan en
las rutas que las usan: **costo cero para el recorrido papel**.

Subset: Latin-1 + puntuación + `→ ← ↗`. Preload sólo de Anton y del Archivo variable,
con fallback de métricas ajustadas (`size-adjust` / `ascent-override`).

**El hallazgo que el auto-hospedaje no puede arreglar.** Verificado con `fontTools`
sobre los TTF completos: ninguna de las cinco caras (Anton, Archivo VF, Archivo Italic,
Space Mono 400/700) contiene `↺ ▌ ▾ ✕ ☰ ✓`; `↗` existe sólo en Space Mono. El glifo no
está en el archivo fuente. Hoy los dibuja la fuente de símbolos del sistema operativo,
así que «Menú ☰ / Cerrar ✕» y el cursor `▌` de todos los botones se ven distintos en
iOS, Android y Windows — **el chrome que más se toca en móvil**.

Arreglo: `✕` → `×` (U+00D7, presente en las tres); `▌ ▾ ↺ ☰ ✓` pasan a SVG inline dentro
de las primitivas papel. **§12 se enmienda** para que el catálogo de glifos liste sólo
lo que las fuentes tienen: `→ ← ↑ ↓ × − + · « » ¡ !`.

### 6. Shell, tema, foco y movimiento

**Shell.** Sacar `class="dark"` (código muerto verificado) y el `<link>` de Google;
`body` a `bg-papel`; `color-scheme: light`; un `<style>` crítico inline para que el papel
pinte en el **primer** frame en vez de después de ~188 KB de JS.

**Tema por ruta.** Un efecto chico en `RootLayout` escribe
`documentElement.style.colorScheme` y el `content` del `theme-color` según la
`superficie` del registro. Es necesario porque el sitio tiene tres superficies reales
—papel claro, papel oscuro (`/mandato-vivo`, `/planes/:slug`, y el pie `bg-tinta` de
toda página papel) y legado— y `color-scheme` lo gobierna el elemento raíz: una barra
de scroll no se puede delegar a un `div`.

Verificado que invertir el shell no rompe legado: la rama v1 de `RootLayout.tsx:44`
lleva `bg-background text-foreground` sobre `min-h-screen` y cubre el documento entero;
las páginas legado no declaran fondo propio. **Nota de honestidad:** poner `body
bg-papel` adelanta un ítem de la tarea 7.2 del master plan. Es aceptable porque no toca
ninguna página, pero queda dicho.

**Skip link.** Primer hijo de las **dos** ramas de `RootLayout`, apuntando a un
`id="contenido" tabIndex={-1} scroll-mt-16` en los wrappers `<div className="flex-1">`
de las líneas 37 y 46. `useIrAlPrincipio` se extiende para hacer también
`focus({preventScroll:true})` sobre esa ancla.

El destino es un `<div>` y no el `<main>` semántico. Es una imperfección deliberada:
promover el `<main>` al layout serían **62 ocurrencias en 46 archivos** (11 páginas
tienen 2 o 3 por ramas de estado, con clases distintas), 32 de ellas legado sin plan por
página, y el master plan lo prohíbe explícitamente («Never touch header/footer/other
pages while building a page»). La promoción del `<main>` a landmark del skip link
pertenece al DoD de cada página en ②.

**Anillo de foco por superficie.** Se mantiene `.papel-root :focus-visible { outline: 2px
solid #5227CC }` y se agrega una regla hermana para fuera de `.papel-root` con el ring v1
`#7D5BDE`, cubriendo además los `<a>` sueltos legado que hoy no tienen ninguno.

Por qué no se globaliza el violeta papel, que es el arreglo obvio: **`#5227CC` sobre el
fondo legado `#0a0a0a` da 2,3766:1**, por debajo del 3:1 que exige WCAG 1.4.11 para un
indicador de foco, mientras el ring actual `#7D5BDE` da **4,1701:1** y pasa. Globalizarlo
reemplazaría un indicador conforme por uno que falla, en más de la mitad del sitio, en
nombre de la accesibilidad. Se unifica recién cuando 7.2 borre el chrome oscuro.

**Movimiento.** `<MotionConfig reducedMotion="user">` en `App.tsx` cubre todo
framer-motion en una línea; `motion-reduce` en los cuatro hover que trasladan y en
`DespertarVeil` cubre el resto.

### 7. Escala dual de texto (D3)

Los hex actuales quedan para bordes, divisores, superficies y palitos. Se agregan tokens
de texto con valores AA, y una regla de lint prohíbe los viejos en `text-*`.

Ratios recalculados y verificados de forma independiente:

| token | sobre | ratio | |
|---|---|---|---|
| `tinta-30 #B5B1A8` | papel | 1,8613 | falla todo |
| `tinta-30 #B5B1A8` | papel-crudo | 2,0453 | falla todo |
| `tinta-50 #7A756A` | papel | 3,9903 | falla AA normal |
| `oscuro-tenue #5C594F` | tinta | 2,6437 | falla todo |
| `ambar #A16C00` | papel | 3,9215 | falla AA normal |
| **`tinta-texto-debil #6A655B`** | papel | **5,0411** | AA ✓ |
| **`tinta-texto-debil #6A655B`** | papel-crudo | **5,5394** | AA ✓ |
| **`oscuro-texto-debil #8A867C`** | tinta | **5,1003** | AA ✓ |
| **`ambar-texto #8F6000`** | papel | **4,7580** | AA ✓ |

`tinta-75 #4A463D` (8,18), `oscuro-meta #8E8A82` (5,39), `violeta #5227CC` sobre papel
(7,25), `violeta-claro #9D85E8` sobre tinta (6,13), `sello` (4,64), `verde` (4,65) y
`cian` (5,24) ya pasan y no se tocan.

**Trampa evitada:** el hex que se propuso primero para `tinta-30` (#8A867C) da 3,16:1
sobre papel, no 4,55 — implementarlo habría cerrado el ticket dejando el defecto intacto.
Llevar `tinta-30` a AA como color de texto exige bajarlo hasta ≈`#6F6D67` (4,5023), que
queda casi indistinguible de `tinta-50` y aplana la jerarquía que §2 buscaba a propósito.
Por eso la numeración de expediente y la flecha `→` se marcan **`aria-hidden`**: son
decoración pura, salen de la ecuación, y `tinta-30` sobrevive como token de superficie.

**Los dos `.dc.html` se regeneran en el MISMO commit.** Son el insumo de diseño desde el
que ② construye cada página, tienen 98 ocurrencias de hex inline, y el gate 7.4 sólo
greppea hex en TSX — nada detectaría la deriva.

**Guardia:** un test de vitest calcula el contraste de todos los pares texto/fondo
declarados y falla bajo 4,5.

### 8. Números honestos (D4)

`DEMO_VOCES_COUNT` y su export se borran. El slot muestra la cifra sólo cuando hay algo
que contar:

- `n ≥ 1` → «{N} voces · falta la tuya»
- cero, cargando y error → «Falta la tuya.» a secas

Nunca miente, nunca deja el hueco vacío, conserva el elemento de identidad de §1 en los
cuatro estados y evita el salto de layout de aparecer/desaparecer. El régimen puro y
testeado de `ElMandatoVivo/mandato-regimen.ts` es el molde a espejar.

Alcance real, corregido: `useVocesCount` tiene **5 consumidores de producción** y hay
**4 archivos de test** que montan `PapelHeader`. `CifrasStrip` además necesita estado de
error explícito — hoy queda pulsando «Cargando cifra» para siempre por `retry:false`.

El pie pasa a una declaración positiva y verificable en la línea de «todos los números
salen de la base; si no hay dato, no hay número», con link a `/datos-abiertos`.
`NotaDemo` sale del barril de primitivas.

**Enmienda a la ley, el mismo día:** §5, §7 y §11.3 del design-system todavía mandan
asterisco junto a «toda métrica inventada», y la **tarea 1.3 del master plan pide
literalmente el fallback con asterisco que hoy es el bug**. Sin corregir los dos, la
deuda se reintroduce sola en la primera página de ②.

### 9. Tarjetas OG

`scripts/build/build-og-cards.ts` con **satori + @resvg/resvg-js como devDependencies**
(cero deps de producción; el output se commitea, patrón idéntico al de
`scripts/build/build-mapa-argentina.ts`), leyendo los TTF de `public/fonts/`.

~135 PNG-8 en `public/og/`: las secciones + los ~104 documentos. Las 329 lecciones y las
rutas servidas por DB **heredan** la tarjeta de su sección — sellar su `<head>` cuesta
casi nada en el mismo script, pero generar 400 PNG llena el repo de binarios que se
recommitean con cada corrección de título, y nadie comparte la lección 7 de un curso sin
compartir el curso.

**Sin grano de papel**, explícitamente: §10.3 dice que el grano va en «toda página» y
alguien lo va a agregar de buena fe. Es la diferencia entre ~8 KB y ~580 KB por tarjeta.

Descartado: una sola imagen OG universal (el segundo y el tercer link de un grupo se leen
como repetición); SVG estático (ningún scraper acepta `image/svg+xml` como `og:image`, y
SVG 1.1 `<text>` no ajusta líneas, así que «una plantilla, texto variable» no se cumple);
`@vercel/og` (dep de producción de ~7 MB apuntando a un target serverless que no existe
— `apps/api` es un proceso largo).

### 10. Marca y purga

**Marca.** Favicon «¡» violeta sobre papel (SVG + `.ico` + apple-touch-icon),
`site.webmanifest`, `og/default.png` como plantilla base y fallback permanente. El
favicon y la card OG comparten el dibujo del «¡»: se hacen juntos para no dibujarlo dos
veces.

**Purga, sólo lo muerto y lo que no toca ninguna página:** `sonner`, `drizzle-zod`, el
`zod` de `packages/db`, y `@radix-ui/react-label` reemplazando `components/ui/label.tsx`
por un `<label>` nativo con la misma clase (riesgo cero: los 10 archivos que usan Label
lo importan de `~/components/ui/label`, nunca de Radix). Más `sourcemap: mode !==
'production'`, borrar los `.DS_Store` y agregar `public/**/.DS_Store` al `.gitignore`.

`framer-motion` sale del camino crítico con `lazy()` sobre el Header v1 y `XpToast`,
**verificando que Rollup efectivamente corte** (el import compartido de `lucide-react`
puede impedirlo). No se reescriben con keyframes: el 100% de esas ~130 LOC las borra ②.

`.size-limit.json` se arregla: desambiguar el glob de `index-*`, incluir `query-*` y
`radix-*`, y bajar el límite a algo que muerda. Un presupuesto que no mide lo que el
navegador baja no es un presupuesto.

## Orden de trabajo

| Bloque | Entrega | Depende de |
|---|---|---|
| **B0** · Decisiones y enmienda documental | D1–D4 escritas; `architecture/README.md:96` corregido; §2/§5/§7/§12 del design-system enmendados; tarea 1.3 del master plan corregida | Nada |
| **B1** · Higiene del build y del repo | Purga de deps muertas; `sourcemap` por modo; `.DS_Store`; `.size-limit.json` arreglado; `lazy()` de Header v1 y XpToast con medición | Nada — paralelo a B0 |
| **B2** · Shell HTML y tema | `index.html` limpio; `color-scheme` + `<style>` crítico; `body bg-papel`; efecto de tema por ruta; seis familias self-hosteadas con `→ ← ↗`; preload; OFL | B1 |
| **B3** · `public/` y marca | Favicon «¡», manifest, `robots.txt`, `og/default.png` | B0-D1, B2 |
| **B4** · Accesibilidad del shell | Skip link en las dos ramas; `id="contenido"`; foco en `useIrAlPrincipio`; anillo por superficie; `MotionConfig` + `motion-reduce` | B2 |
| **B5** · Contraste AA | Escala dual; `aria-hidden`; `.dc.html` regenerados; §2 reescrito; test de contraste | B0-D3 |
| **B6** · Registro de rutas | `lib/rutas/`; `esRutaPapel()` reimplementado; hook en `App.tsx`; `descripcionDe()` testeado; guardia `meta:check` en CI | B0-D1, B2 |
| **B7** · Sellado + sitemap + 301 | `sellar-head.ts`; `sitemap.xml`; `robots.txt`; fallback SPA; 301 reales | B6, B0-D1 |
| **B8** · Prerender de 44 URLs | Congelado con Chromium de Playwright, en estado dormido, sin números de API | B7, B9 |
| **B9** · Números honestos | `DEMO_VOCES_COUNT` borrado; régimen de estados; `CifrasStrip`; 5 consumidores + 4 tests; pie resuelto; `NotaDemo` fuera | B0-D4 |
| **B10** · Verificación y guardias | `curl -A facebookexternalhit`; `/no-existe` → 404 real; guardias en CI; recorrido de teclado en una ruta papel y una legado | Todos |

`B8` depende de `B9` y no al revés: el prerender no puede congelar un contador que
todavía miente.

## Fuera de alcance

Pertenece a ② (migración) o ③ (despertar progresivo):

- Borrar `/explorar-datos` y con ella `maplibre-gl` + `react-map-gl` + `mapbox-gl`
  (96 MB instalados, 212 KiB gzip del chunk lazy; `mapbox-gl` 3.23.1 es **licencia
  propietaria en un monorepo declarado MIT**, arrastrado por `auto-install-peers`). Es
  Fase 6; el redirect dejaría un link visible y roto en `DatosAbiertos.tsx:57`.
- Reemplazar el `<BarChart>` de `/tablero` y borrar `recharts` (106 KiB gzip, 42
  transitivas). Es Fase 5.
- Reescribir `XPChip`/`XpToast` con keyframes: la Fase 5.0 respecifica la gamificación
  con sellos y palitos, y 7.2 borra el Header v1.
- Subir el `<main>` al layout (62 ocurrencias en 46 archivos).
- **El `<h1>` faltante de 21 de 23 planes**: `markdown.ts:18` vuelve a aplicar
  `stripFrontmatter` sobre cuerpos que `plans-registry.ts:56` ya limpió, y la segunda
  pasada se come entre 626 y 1636 bytes de portada, incluido el `# TÍTULO` en 7 de ellos.
  Es el DoD de `/planes/:slug` (②), pero **se señala acá porque el doble strip se activa
  con cualquier archivo nuevo que empiece con separador**.
- Targets de toque bajo 44px en el nav (28–38px) y el footer papel (20px; 17px el
  backlink de los lectores): cambiarlos altera `h-16` y la proporción del wordmark.
- Sacar `tailwind-merge`: no es purga pura, cambia la resolución de clases en 27
  call-sites.
- Borrar Inter, Playfair y JetBrains de `tailwind.config.ts`: es literalmente la tarea
  7.3.
- Migrar cualquiera de las 32 rutas legado, **incluido el 404** (hoy la página v1 oscura
  con `font-serif`, cuando §5 pide un expediente papel con sello EXTRAVIADO).
- SSR completo o migración a un framework meta: contradice ADR 0001 y 0002.

Queda además una decisión de operaciones, **no de sustrato**: las 4 filas de
`pulse_signals` y el `community_post` que la suite de integración dejó en la Neon de v2 y
que los agregados públicos podrían publicar como datos reales. No se pudo verificar en
la sesión de relevamiento (la API no respondía en `:4000`). Borrarlas, mover la suite a
una branch de Neon dedicada, o excluirlas de los agregados.

## Definición de terminado

1. `curl -A facebookexternalhit` contra el build real devuelve título, descripción e
   imagen **propios** para: la portada, un plan, un ensayo, una crónica de bitácora y un
   entrenamiento. Verificado también contra un preview deploy, no sólo contra `vite
   preview` — que hace fallback SPA por su cuenta y tapa el problema de reescritura.
2. `/no-existe` devuelve **404 real**, no 200.
3. Recorrido de teclado completo en una ruta papel y una legado: skip link como primera
   parada, foco visible en todo control, foco movido al contenido al navegar.
4. Ningún par texto/fondo declarado baja de 4,5:1 — verificado por el test, no a ojo.
5. Ningún número visible en el sitio carece de respaldo en la base.
6. `pnpm verify` verde, y las tres guardias nuevas (`meta:check`, contraste, conteo de
   deps) corriendo en CI.
7. Cero requests a terceros en el waterfall de carga de una ruta papel.
8. `pnpm size` mide el payload inicial completo y está por debajo del presupuesto.

Nota sobre la red de seguridad: la suite e2e de v2 son **2 tests en 1 archivo**
(`tests/e2e/home.spec.ts`). Hoy no hay nada automatizado que proteja lo que ① toca en
rutas ni en el shell, así que B10 no es opcional.

## Riesgo abierto que hay que medir, no asumir

Cuál es realmente el elemento LCP. Los ocho informes del relevamiento lo asumieron (el
H1 en Anton) sin haberlo observado nunca: `performance.getEntriesByType('paint')`
devolvió `[]` en las dos corridas reportadas, y compite con `PaperGrain` y
`DespertarVeil`. Hay que medirlo **antes** de comprometer el orden de preload de las
fuentes. Es una tarea de verificación dentro de B10, no un hallazgo.
