# El sustrato — la capa invisible debajo del diseño

**Fecha:** 2026-07-26
**Sistema:** `docs/design-system/README.md` v1.1 (ley)
**Relación con el canon:** este proyecto NO está en el master plan
`docs/plans/2026-07-21-papel-y-tinta-master-plan.md`. Absorbe casi toda su Fase 8
(«SEO/OG, print, a11y, perf») y la corre ANTES de las fases de páginas, por la razón que
se explica en «Por qué va primero». Enmienda el master plan en dos puntos (tarea 1.3 y
alcance de 8.1) y el design-system en siete (§1, §2, §3, §5, §7, §11.3, §12).
**Plan de implementación:** `docs/plans/2026-07-26-el-sustrato-plan.md` (se escribe
después de esta spec)

> **Tesis.** El recorrido papel está bien construido y el sistema de diseño es bueno.
> Lo que falla es todo lo que está debajo: el sitio se sirve desde un shell que declara
> tema oscuro, comparte un solo `<head>` entre ~493 URLs, le regala la IP de cada lector
> a Google antes de la primera letra, afirma en el header un número de voces que nadie
> contó, pinta la numeración de sus índices con un gris que da 1,86:1 contra el papel, y
> deja la pantalla en blanco sin una palabra si un chunk no baja. Nada de esto se ve en
> una captura de pantalla. Todo se ve cuando alguien comparte un link, navega con
> teclado, abre el sitio con luz de día, entra sin JavaScript o vuelve después de un
> deploy. El sustrato es lo que hace que el diseño exista fuera de la pantalla del que
> lo hizo.

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

**Generar el HTML en build es lo más chico que resuelve el problema**, y no necesita ni
una dependencia nueva. `docs/adr/0001-stack-choices.md` no sólo lo permite: su línea 20
sanciona «SSG via Vite SSR for marketing/blog pages», así que el prerender de §4 tampoco
lo contradice. Lo que sí exigiría un ADR nuevo es SSR en runtime o inyección por request
desde Express.

Advertencia que hay que tener presente durante toda la verificación: **`vite preview`
hace fallback SPA por su cuenta**, así que las URLs profundas dan verde en local
mientras un host estático sin la regla correcta devolvería 404 — tapa exactamente el
problema que hay que resolver.

## Decisiones del dueño del proyecto

**D1 · Origen canónico: `https://elinstantedelhombregris.com`.** v2 reemplaza a v1 en su
dominio actual cuando esté terminado; hasta entonces se trabaja y se verifica en local.
El origen se parametriza con `VITE_SITE_ORIGIN` (default: el dominio canónico) para que
los builds de local y de preview emitan el suyo.

**La elección de host sí es parte de ①**, aunque la fecha de salida no lo sea: el
fallback SPA, los 301, los headers y la caché se declaran en un archivo que hoy no
existe. Se crea `v2/vercel.json` (hermano del de la raíz, sin tocarlo — la Fase 10 de
`docs/architecture/README.md` ya prevé el proyecto de Vercel de v2) y un proyecto de
**preview sin dominio ni promoción a producción**, dentro de B13. Sin él las DoD #1 y #2
no se pueden cerrar.

**D2 · Alcance de la indexación: híbrido.** Sellado del `<head>` para todas las URLs,
MÁS prerender de HTML real para las URLs de planes y ensayos. Es más trabajo y más riesgo
que sellar el head solo; §4 define cómo se contiene.

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
| `tinta-30 #B5B1A8` sobre papel = **1,8613:1** | `apps/web/tailwind.config.ts:31` | Los «01», «02» de todos los índices no se leen con luz de día. El mismo token pinta la nota «\* datos de demostración»: **el asterisco de honestidad es el texto menos legible del sitio** |
| El header afirma «12.496 voces» cuando la API no responde | `apps/web/src/components/papel/papel-nav.ts:57` | Número fabricado, sin asterisco, en la posición de máxima confianza. Con `retry:false` + `staleTime:Infinity`, un solo fetch fallido lo deja clavado toda la sesión. **Dos casos de `PapelHeader.test.tsx` exigen ese número: la suite protege la mentira** |
| Cero `ErrorBoundary` en todo `v2`, con **48 páginas** en `lazy()` | `apps/web/src/App.tsx` | Un chunk que devuelve 404 —el caso normal después de un deploy, con un `index.html` viejo en caché— deja la pantalla en blanco sin una palabra. Ver §6b |

### Altos

| Hallazgo | Archivo | Qué sufre el usuario |
|---|---|---|
| `tinta-50 #7A756A` = **3,9903:1** y `oscuro-tenue #5C594F` sobre tinta = **2,6437:1** | `apps/web/tailwind.config.ts:30` y `:37` | `tinta-50` pinta el nav, el contador, fechas y kickers a 10–14px; `oscuro-tenue` pinta las tres etiquetas de columna y la barra inferior del pie. Tres tokens explican **431 de 445** nodos deficientes, en **49** archivos |
| `PageFallback` usa `text-muted-foreground` sobre papel = **2,1741:1** | `apps/web/src/App.tsx:22-28` | Es el **primer texto de toda visita fría** a las 48 rutas lazy, y es peor que `tinta-50`. Ver §7 |
| Seis familias tipográficas desde el CDN de Google | `apps/web/index.html:17` | Render-blocking a un tercero antes de la primera letra; cada lector le regala su IP a Google en un sitio cuyo argumento es la soberanía. Y `security.ts` ya declara `fontSrc ['self','data:',cartoTiles]`: el día que esa CSP llegue al documento, las seis familias mueren |
| El documento se sirve sin CSP, sin `nosniff`, sin `Referrer-Policy` y sin caché declarada | — | Helmet sólo cubre `/api/*`. La regla dura de `CLAUDE.md` nunca llegó al HTML. Ver §3b |
| Faltan `robots.txt`, `sitemap.xml`, imagen OG, manifest y apple-touch-icon | `apps/web/public/` | Sin sitemap, un buscador tiene que descubrir las 457 URLs públicas siguiendo enlaces en una SPA que no renderiza sin JS |
| No existe regla de fallback SPA en ninguna parte de `v2/` | — | Entrar directo a `/planes/planeb` —lo que hace quien recibe un link— rompería en un host estático. **El test local no lo detecta** |
| El foco no se mueve al cambiar de ruta y el `<title>` nunca cambia | `apps/web/src/lib/ir-al-principio.ts:68` | La navegación SPA es completamente muda para un lector de pantalla |
| El anillo de foco sólo existe dentro de `.papel-root` | `apps/web/src/index.css:185` | §10.10 promete foco violeta y lo cumple en 22 de 54 rutas |
| Flash negro estructural + barra de scroll negra sobre papel | `apps/web/index.html:21` y `apps/web/src/index.css:20` | Toda visita fría a una ruta papel abre con un rectángulo negro y salta a crema cuando React monta, después de bajar ~188 KB gzip. La barra negra la pinta `html { color-scheme: dark }`, no el `body`. `class="dark"` es **código muerto verificado**: cero selectores `.dark` en 68 KB de CSS compilado |
| No existe `<noscript>` | `apps/web/index.html` | Sin JS no se ve una letra. Ver §4 |

### Medios y bajos

- `.size-limit.json` no mide el payload inicial: omite los chunks `query` y `radix` que
  `index.html` precarga — **28.811 B gzip** sin medir (17,3% sobre lo que sí mide), y el
  glob `index-*` matchea dos archivos distintos.
- `framer-motion` (~44 KB gzip, **22% del JS de la portada**) entra al chunk inicial de
  las 54 rutas por dos widgets de gamificación importados estáticamente.
- El `dist` publica **466 sourcemaps (16 MB, sobre un `dist` de 29 MB)** y dos
  `.DS_Store` accesibles por URL (`GET /.DS_Store` → 200, 8196 bytes de metadata del
  disco del autor).
- El favicon servido es la marca **v1**: círculo `#0a0a0a` con trazo `iris-violet
  #7D5BDE`, el token que la tarea 7.3 manda borrar. (Corrección a una premisa previa:
  `public/` **sí** existe y el favicon devuelve 200 — el problema es de identidad, no de
  ausencia.)
- `PapelFooter.tsx:82` declara en TODAS las rutas papel «Prototipo con datos de
  demostración»: desmiente los conteos de planes, ensayos y entrenamientos —que salen de
  disco y son ciertos— y a la vez sirve de coartada para el 12.496 fabricado.
- `prefers-reduced-motion` sólo apaga las 14 clases `.anim-*`: framer-motion, el velo del
  despertar y cuatro hover que trasladan quedan afuera.
- `sonner`, `drizzle-zod` y el `zod` de `packages/db` son dependencias de producción con
  cero referencias. **El tope de 60 NO está en riesgo**: son 38 deps de producción
  únicas, con 22 de margen. La purga se justifica por peso y coherencia, no por cupo.
- `scripts/` no es workspace de pnpm ni está en el `include` de ningún tsconfig
  (`v2/tsconfig.json` tiene `"include": []`), así que `pnpm lint` y `pnpm type-check` lo
  saltan entero — justo donde ① va a escribir cuatro scripts nuevos.

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
- `indexacion: 'publica' | 'privada' | 'dinamica' | 'redireccion'` — gobierna el
  `robots.txt`, el `noindex` por página y qué URLs entran al sitemap.

**Restricción dura, verificada.** Los cinco registries (`plans-registry.ts:42`,
`ensayos-registry.ts:24`, `blog-registry.ts:21`, `cronica-registry.ts:27`,
`courses-registry.ts:47`) construyen sus datos con `import.meta.glob`, que **sólo existe
dentro de Vite**: `sellar-head.ts` corre bajo `tsx` y no los puede importar. Por eso
`registro.ts` y `descripcion-de.ts` se escriben **sin dependencias de Vite y sin el alias
`~/`** (el `paths` de `v2/tsconfig.json` está vacío): los resolvers reciben la fuente de
datos **inyectada por el llamador**. Hay dos llamadores —el hook de runtime le pasa los
registries de Vite, `sellar-head.ts` le pasa lo que leyó de disco— y la derivación vive
en un único módulo plano que ambos importan.

De los 12 patrones dinámicos, los **8 que salen de contenido en disco** resuelven
metadata propia; los **4 servidos por DB** (`/mandato-vivo/pulso/:id`,
`/mandato-vivo/propuesta/:id`, `/iniciativas/:slug`, `/iniciativas/:slug/documento`) no
se pueden enumerar en build: se marcan `dinamica`, heredan la metadata de su sección y
quedan fuera del sitemap.

**Formato de título.** §14 de la ley manda «{Página} — ¡BASTA!», y el shell de hoy lo
tiene invertido (`index.html:8`: «¡BASTA! — El país lo diseña la gente»). El registro
guarda sólo el nombre de la página; la composición es única y vive en el módulo. Cambiarlo
después obliga a recommitear las ~135 PNG de OG que lo llevan impreso.

**Guardia:** `meta:check`, calcada de `scripts/content/verify-planes-index.ts` (que ya
corre en CI), exige biyección entre los `path` de `app-routes.tsx` y las claves del
registro, el formato de título de §14, y los largos de título y descripción. Una ruta
nueva no puede shippear sin metadata.

Consecuencia para ②: se actualiza **un** archivo por página migrada en vez de dos.

### 2. Las descripciones se derivan

`title` existe en el 100% de los `.mdx` y `course.json` — no hay nada que escribir. El
`summary` en cambio no sirve crudo: **mediana de 384 caracteres** en planes, máximo 973
(PLANMOV), y **0 de 23** entran en 160.

Regla: primera oración completa; si supera 160, cortar en el último límite de palabra
antes de 157 + «…». Un campo opcional `descripcionMeta` en el frontmatter gana cuando
existe. El helper se testea contra los 23 planes y 22 posts reales.

**Hueco conocido:** `/cronica` es **una sola ruta** (`app-routes.tsx:119`) con los cinco
capítulos adentro, y ninguno de los cinco `.mdx` tiene `summary` (0 de 5), así que no hay
de dónde derivar. No hacen falta cinco descripciones: la ruta lleva una `descripcionMeta`
escrita a mano en el registro, como cualquier ruta de sección. Se resuelve dentro de B7.

### 3. Sellado del `<head>` en build

`scripts/build/sellar-head.ts` corre después de `vite build`.

**Wiring, porque hoy no existe ninguno.** El `build` de `apps/web/package.json` es `vite
build` a secas, y los dos scripts que ya viven en `scripts/build/` no están enganchados a
ningún npm script ni al CI. El `build` de `apps/web` pasa a
`vite build && pnpm --dir ../.. exec tsx scripts/build/sellar-head.ts`, de modo que el
sellado quede dentro del `pnpm build` que ya corre el paso «Build all workspaces» del CI
y **antes** del paso «Bundle size budgets», que lee `dist/assets/`.

Lo que hace:

- Enumera cada URL desde el registro y las fuentes de contenido — **nunca desde una lista
  escrita a mano**: el catálogo en disco pasa de 23 a 27 archivos (el canon, que no
  cuenta PLANRUTA, va de 22 a 26). Los slugs salen de `planes-index.generated.ts` (módulo
  TS plano que `verify-planes-index.ts` ya importa desde `tsx`) y de `loadContentDir` de
  `@v2/shared`, documentado como «Used by build-time scripts».
- Escribe `dist/<ruta>/index.html` copiando el shell con `title`, `description`, `og:*`,
  `twitter:*` y `canonical` reemplazados. El `<body>` sigue vacío y React monta igual
  porque no hay markup previo (§4 cambia esto para 44 URLs, y lo resuelve ahí).
- Sella también las rutas `privada` —`/ingresar`, `/registrarse`, `/mi-perfil`,
  `/tablero`, `/notificaciones`, `/restablecer-contrasena`, `/verificar-email`,
  `/2fa-desafio`— con `<meta name="robots" content="noindex,nofollow">` y fuera del
  sitemap. **No es opcional:** sin catch-all (ver abajo), una ruta sin archivo devuelve
  404 y el login rompe en producción.
- Emite `sitemap.xml` (sólo las `publica`) y `robots.txt` — **es su único dueño**.
- Emite **301 reales** para las 6 rutas de redirect puro y los 17 `legacySlugs` del blog.

Cero dependencias nuevas.

**La regla de fallback, que hoy no existe en ninguna parte**, se escribe en `v2/vercel.json`:
`outputDirectory: "apps/web/dist"`, `cleanUrls: true`, `trailingSlash: false`, y
`{"handle":"filesystem"}` **antes** de cualquier rewrite, para que el fallback ceda ante
los `index.html` sellados. **Sin** rewrite catch-all a `/index.html`, para que
`/no-existe` devuelva el 404 del host y no un 200. Los patrones `dinamica` se cubren con
un rewrite por prefijo declarado en el registro, que sirve el shell sellado de su sección.
Y `/api/*` cede antes que todo lo demás: la API vive en el mismo origen (`lib/api.ts`
pide en relativo con `credentials: 'include'`).

### 3b. Headers y caché del documento

① es el primer proyecto que escribe configuración de host, así que es el que tiene que
poner ahí las dos cosas que hoy no existen para el documento.

**Headers de seguridad.** `securityHeaders()` monta helmet sobre el Express de
`apps/api`, que sólo declara routers `/api/*`. El HTML, el JS, el CSS, las fuentes y los
OG salen del host estático **sin CSP, sin `X-Content-Type-Options`, sin `Referrer-Policy`
y sin `Permissions-Policy`**: la regla dura de `CLAUDE.md` («Helmet with strict CSP —
don't add third-party CDN allowances; bundle locally») nunca llegó al documento.
`v2/vercel.json` declara:

- `Content-Security-Policy` espejo de `security.ts`, **sin** el `fontSrc` de terceros
  (innecesario después de §5) y con `frame-ancestors 'none'`. Queda documentado que
  `'unsafe-inline'` en `style-src` es lo que habilita el `<style>` crítico de §6 y los
  estilos inline de Radix, y que `script-src 'self'` es alcanzable porque el shell no
  tiene un solo script inline.
- `X-Content-Type-Options: nosniff` — obligatorio con `.woff2` y PNG servidos desde
  `public/`.
- `Referrer-Policy: strict-origin-when-cross-origin` (el valor que ya declara
  `security.ts`).
- `Permissions-Policy: geolocation=(), camera=(), microphone=()`.

**Caché.** Sellar cientos de `<head>` no sirve de nada si el HTML se sirve con la caché
por defecto del host: entrega metadata vieja hasta que expire y, peor, sigue pidiendo los
hashes de assets del deploy anterior —que ya no están—, con el resultado de §6b.

| Ruta | `Cache-Control` | Por qué |
|---|---|---|
| `*.html` | `public, max-age=0, must-revalidate` | El HTML es el índice mutable: cada deploy cambia los hashes que referencia |
| `/assets/*` | `public, max-age=31536000, immutable` | Hash de contenido en el nombre |
| `/fonts/*` | `public, max-age=31536000, immutable` | Versión en el nombre (§5) |
| `/og/*`, `/maps/*`, `/media/*` | `public, max-age=604800` | Se recommitean con correcciones de texto |
| `robots.txt`, `sitemap.xml` | `public, max-age=3600` | |

El `robots.txt` no sale sólo del registro: la API vive en el **mismo origen**, así que
lleva `Disallow: /api/` —si no, un crawler recorre los agregados públicos, se come el
rate limit y le mete carga a Neon— más `Disallow: /maps/`, `/media/` y
`/course-graphics/`, que son directorios de `public/` y no páginas.

### 4. Prerender real de planes y ensayos (D2)

Alcance: **todas** las URLs de planes y ensayos — hoy 44 (23 + 21), 48 cuando entren los
cuatro PLANes nuevos — enumeradas desde `planes-index.generated.ts` y `loadContentDir`,
**nunca desde una constante escrita en esta spec**.

El Chromium de Playwright visita cada URL contra el preview local y congela el HTML
resultante. **No** se usa `react-dom/server`: eso obligaría a auditar SSR-safety de las 54
rutas. Los tres casos que se auditaron resultaron seguros —`VerifyEmail.tsx` y
`ResetPassword.tsx` comparten un `readTokenFromQuery()` que abre con `typeof window ===
'undefined'` y sólo se llama dentro de un `useEffect`; `CertificadoSemilla.tsx:76` está
dentro de un handler de click—, pero auditar el árbol entero cuesta más que congelar el
HTML con un navegador que ya está en el toolchain.

**Wiring, porque el orden importa.** El Chromium hoy el CI lo instala **sólo** en el job
`e2e-tests`, que declara `needs: build-and-test` y por lo tanto corre DESPUÉS del build.
Así que el prerender **no** va dentro de `pnpm build`: es `scripts/build/prerender.ts`,
invocado por un `pnpm prerender` que levanta `vite preview --port 4173` como proceso
hijo, espera el 200, visita las URLs, sobrescribe los `index.html` ya sellados y mata el
preview. En CI es un paso propio dentro de `build-and-test`, precedido por
`pnpm exec playwright install --with-deps chromium`.

**La decisión que esto obliga.** `apps/web/src/main.tsx` arranca hoy con
`createRoot(rootElement).render(<App />)`, no con `hydrateRoot`: React 18 sobre un
contenedor con hijos **descarta** el markup congelado y renderiza de cero. Sin decidir
esto, el prerender no mejora el LCP y el lector con conexión lenta ve la página, después
el vacío, después la página otra vez —con el rito de la tinta entintando un H1 que ya
había leído—. Se elige **`createRoot`**: el prerender le sirve al scraper y al
`<noscript>`, no al LCP. El descarte se hace invisible envolviendo el HTML congelado en
un contenedor `data-prerender` que el `<style>` crítico funde en 120 ms al montar React.
Es lo coherente con no auditar SSR-safety. (`hydrateRoot` condicional mejoraría el LCP de
verdad, pero cuesta la auditoría de mismatch en las 44 rutas: queda para un proyecto
propio si alguna vez se quiere.)

**Tres reglas de contención, todas con mecanismo:**

1. **Se congela en estado «dormido».** `despertar.ts` lee `localStorage`; un visitante
   nuevo siempre está en gris, así que el estado congelado coincide con el primer paint.
2. **Ningún número derivado de la API puede quedar horneado.** El prerender corre con
   `VITE_API_URL` apuntando a un puerto muerto, y un test del artefacto falla si algún
   HTML congelado matchea `/\d[\d.]* voces/`.
3. **Ningún valor que dependa del reloj del proceso que congela puede quedar horneado.**
   `PlanDetail.tsx:116` y `EnsayoDetail.tsx:72` imprimen la fecha de hoy en el folio
   «¡BASTA! · edición del lector · {fecha}» — o sea en los 23 planes y los 21 ensayos,
   exactamente las URLs de este bloque. Congeladas quedarían con la fecha del build para
   siempre, y con el runner del CI en UTC contra Argentina en UTC−3, potencialmente un
   día adelantada. El folio es `print:block`, así que nadie lo nota hasta que alguien
   imprime. `sellar-head.ts` marca esos nodos `data-volatil`, el congelado los vacía, y
   el cliente los repuebla al montar.

**`<noscript>`.** No existe ninguno en el repo. Una SPA pura sin JavaScript no muestra
una letra: hoy un rectángulo negro, después de ① un rectángulo de papel vacío —que es
peor, porque parece una página cargada y en blanco—. El shell lleva un `<noscript>`
estilado con el mismo `<style>` crítico (nada nuevo que bajar): kicker mono «sin
javascript», título Anton «Esto se lee igual.», una línea en voseo explicando que el mapa
y el mandato necesitan JS pero los documentos no, y links a las URLs que **sí** devuelven
HTML real después de este bloque — los planes y los ensayos. Es la única parte del sitio
donde el prerender le sirve a una persona y no a un robot.

**Enmienda documental necesaria:** `docs/architecture/README.md:96` limita el SSG a
«blog/ensayos/courses» y deja afuera los planes, que son el corazón del sitio, mientras
la tarea 8.1 del master plan dice «prerender of public routes». Se corrige el primero.

### 5. Fuentes propias y los glifos que no existen

Se auto-hospedan las **seis** familias como `.woff2` subseteados en
`apps/web/public/fonts/` con versión en el nombre, `@font-face` en `index.css`, borrando
los dos `preconnect` y el `<link>` de Google. `OFL.txt` junto a los archivos.

**Procedencia y herramienta, porque hoy no hay ni un archivo de fuente en el repo**
(`find` sobre todo el árbol excluyendo `node_modules`: cero `.ttf`, cero `.woff2`, cero
`.otf`). Los TTF fuente se bajan una vez del upstream de cada familia y quedan **sin
commitear ni servir** en `scripts/build/fonts-src/` (ignorado); el subseteo lo hace
`scripts/build/subset-fonts.ts` con `subset-font` como devDependency —no `pyftsubset`,
que mete Python en un pipeline pnpm—. Los `.woff2` resultantes sí se commitean.
`fontTools` se usó sólo para la auditoría de glifos; no es dependencia del build.

Por qué las seis y no las tres papel: self-hostear sólo las papel deja 32 rutas legado en
fuentes del sistema — romper páginas que ② todavía no tocó — e invierte el orden del
canon, que pone el borrado de Inter/Playfair/JetBrains en la tarea **7.3**, después de
las cinco fases de páginas. Con `@font-face`, las tres condenadas sólo se descargan en
las rutas que las usan: **costo cero para el recorrido papel**.

Subset: Latin-1 + puntuación + `→ ← ↑ ↓ × − · « »`, más `↗` sólo en las caras de Space
Mono (es la única familia que lo tiene). Preload sólo de Anton y del Archivo variable —
**después de medir cuál es el elemento LCP real**, que es la primera tarea de B2.

**El hallazgo que el auto-hospedaje no puede arreglar.** Verificado con `fontTools` sobre
los TTF completos: ninguna de las cinco caras (Anton, Archivo VF, Archivo Italic, Space
Mono 400/700) contiene `↺ ▌ ▾ ✕ ☰ ✓`; `↗` existe sólo en Space Mono. El glifo no está en
el archivo fuente. Hoy los dibuja la fuente de símbolos del sistema operativo, así que
«Menú ☰ / Cerrar ✕» y el cursor `▌` de todos los botones se ven distintos en iOS, Android
y Windows — **el chrome que más se toca en móvil**.

Arreglo (entrega de **B2**, en el mismo commit que las fuentes): `✕` → `×` (U+00D7,
presente en las tres); `▌ ▾ ↺ ☰ ✓` y los `▲ ▼` de orden de tablas del design-system §5
pasan a SVG inline dentro de las primitivas papel. **§12 se enmienda** para que el
catálogo liste sólo lo que las fuentes tienen: `→ ← ↑ ↓ × − + · « » ¡ !`.

### 6. Shell, tema, foco y movimiento

**Shell.** Sacar `class="dark"` (código muerto verificado) y el `<link>` de Google;
`body` a `bg-papel`; **`html { color-scheme: light }` en `index.css:20`** — el `body` no
alcanza, la barra de scroll la gobierna el elemento raíz; un `<style>` crítico inline
para que el papel pinte en el **primer** frame en vez de después de ~188 KB de JS.

**Tema por ruta.** Un efecto en `RootLayout` escribe
`documentElement.style.colorScheme` y el `content` del `theme-color` según la
`superficie` del registro. Es necesario porque el sitio tiene tres superficies reales
—papel claro, papel oscuro (`/mandato-vivo`, `/planes/:slug`, y el pie `bg-tinta` de toda
página papel) y legado. **Depende del registro (B7), así que es bloque propio (B8): el
valor estático de `index.css` es lo que entrega B2.**

Verificado que invertir el shell no rompe legado: la rama v1 de `RootLayout.tsx:44` lleva
`bg-background text-foreground` sobre `min-h-screen` y cubre el documento entero; las
páginas legado no declaran fondo propio. **Nota de honestidad:** poner `body bg-papel`
adelanta un ítem de la tarea 7.2 del master plan. Es aceptable porque no toca ninguna
página, pero queda dicho.

**Skip link.** Primer hijo de las **dos** ramas de `RootLayout`, apuntando a un
`id="contenido" tabIndex={-1} scroll-mt-16` en los wrappers `<div className="flex-1">` de
las líneas 37 y 46. `useIrAlPrincipio` se extiende para hacer también
`focus({preventScroll:true})` sobre esa ancla.

El destino es un `<div>` y no el `<main>` semántico. Es una imperfección deliberada:
promover el `<main>` al layout serían **62 ocurrencias en 48 archivos** (11 páginas
tienen 2 o 3 por ramas de estado, con clases distintas), 32 de ellas legado sin plan por
página, y el master plan lo prohíbe explícitamente («Never touch header/footer/other
pages while building a page»). La promoción del `<main>` a landmark pertenece al DoD de
cada página en ②.

**Anillo de foco por superficie.** Se mantiene `.papel-root :focus-visible { outline: 2px
solid #5227CC }` y se agrega una regla hermana para fuera de `.papel-root` que **reusa el
`--ring` que ya existe** (`index.css:15`, `256 65% 62%` ≈ `#815FDD`, **4,3503:1** sobre
`#0a0a0a`), cubriendo además los `<a>` sueltos legado, que hoy dependen del anillo por
defecto del navegador — feo e inconsistente, no inexistente.

Por qué no se globaliza el violeta papel, que es el arreglo obvio: **`#5227CC` sobre el
fondo legado `#0a0a0a` da 2,3766:1**, por debajo del 3:1 que exige WCAG 1.4.11 para un
indicador de foco. Globalizarlo reemplazaría un indicador conforme por uno que falla, en
más de la mitad del sitio, en nombre de la accesibilidad. Se unifica cuando 7.2 borre el
chrome oscuro.

**Movimiento.** `<MotionConfig reducedMotion="user">` en `App.tsx` cubre todo
framer-motion en una línea; `motion-reduce` en los cuatro hover que trasladan y en
`DespertarVeil` cubre el resto.

### 6b. Fallos del cliente

Hoy `apps/web` no tiene ni un `ErrorBoundary`, ni un `componentDidCatch`, ni un
`window.onerror`, ni un `unhandledrejection`: cero coincidencias en `apps/` y
`packages/`. Con las **48 páginas** cargadas por `lazy()`, cualquier chunk que devuelva
404 —el caso normal después de un deploy, con un `index.html` viejo en caché pidiendo
hashes que ya no existen— rechaza la promesa, React 18 desmonta el árbol entero y el
lector queda mirando un rectángulo vacío. Después del arreglo del shell ese rectángulo
pasa de negro a crema, que es **peor**: parece una página cargada y en blanco. §5 de la
ley ya escribió el copy que nadie puede mostrar («Esto se rompió. Lo decimos porque
publicamos todo.»).

`components/papel/ErrorBoundary.tsx` (clase con `getDerivedStateFromError`) se monta
dentro de `RootLayout` y **por fuera** del `<Suspense>` de `App.tsx`, con dos estados:

- **Chunk que no baja** (`error.name === 'ChunkLoadError'` o mensaje que matchea
  `/dynamically imported module|Importing a module script failed/`): expediente papel con
  «Salió una versión nueva mientras leías» y un solo botón «Recargar →». Es el caso
  mayoritario y el único que se arregla solo.
- **Cualquier otro error:** el 500 de §5, con link a `/datos-abiertos`.

El boundary se resetea al cambiar `location` para que navegar no quede clavado en el
error, y respeta la `superficie`: papel en las rutas papel, chrome v1 en las legado.

### 7. Escala dual de texto (D3)

Los hex actuales quedan para bordes, divisores, superficies y palitos. Se agregan tokens
de texto con valores AA, y una regla de lint prohíbe los viejos en `text-*`.

Ratios recalculados y verificados de forma independiente:

| token | sobre | ratio | |
|---|---|---|---|
| `tinta-30 #B5B1A8` | papel | 1,8613 | falla todo |
| `tinta-30 #B5B1A8` | papel-crudo | 2,0453 | falla todo |
| `muted-foreground #A1A4AA` | papel | 2,1741 | falla todo |
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

**Mapa viejo→nuevo, obligatorio y explícito:** `tinta-50` → `tinta-texto-debil`;
`oscuro-tenue` → `oscuro-texto-debil`; `ambar` → `ambar-texto`; `tinta-30` →
`tinta-texto-debil` en **todo uso de texto legible**. `tinta-30` no se agota en la
numeración, la flecha y la `NotaDemo`: hay **25 `text-tinta-30` vivos en TSX**, entre
ellos la firma de autor «— El hombre gris» (`PlanDetail.tsx:161`), el mensaje de estado a
13px (`PlanDetail.tsx:77`), los rótulos de 10px de los tres lectores
(`EnsayoDetail.tsx:35`, `BitacoraDetail.tsx:34`, `EntrenamientoDetail.tsx:42`) y los
números de sección del nav (`PapelHeader.tsx:141`). `text-tinta-30` sobrevive con
allowlist en exactamente **dos** casos: la numeración de las filas de índice (marcada
`aria-hidden`) y el estado deshabilitado de `BotonPapel.tsx:37` (WCAG 1.4.3 exime los
controles inhabilitados).

**El primer texto de toda carga fría no estaba en ninguna tabla, y es peor que
`tinta-50`.** `App.tsx:22-28` (`PageFallback`) es lo único visible mientras baja el chunk
de la página —las 48 páginas son `lazy()`— y se pinta con `text-muted-foreground
font-mono` dentro de `.papel-root`. `--muted-foreground: 220 5% 65%` (`index.css:11`)
resuelve a `#A1A4AA`: **2,1741:1** sobre papel. Encima `font-mono` es JetBrains Mono, una
de las tres familias que 7.3 borra. Pasa a `text-tinta-texto-debil font-space`, y en el
mismo barrido se auditan los `text-muted-foreground` que sobrevivan dentro de
`.papel-root`.

**Trampa evitada:** el hex que se propuso primero para `tinta-30` (#8A867C) da 3,16:1
sobre papel, no 4,55 — implementarlo habría cerrado el ticket dejando el defecto intacto.
Llevar `tinta-30` a AA como color de texto exige bajarlo hasta ≈`#6F6D67` (4,5023), que
queda casi indistinguible de `tinta-50` y aplana la jerarquía que §2 buscaba a propósito.
Por eso la numeración y la flecha se marcan **`aria-hidden`**: son decoración pura, salen
de la ecuación, y `tinta-30` sobrevive como token de superficie.

**Los dos `.dc.html` se regeneran en el MISMO commit.** Son el insumo de diseño desde el
que ② construye cada página, tienen **98 ocurrencias inline de los tres hex deficientes
(sobre 552 hex en total)**, y el gate 7.4 sólo greppea hex en TSX — nada detectaría la
deriva.

**Guardia:** un test de vitest calcula el contraste de todos los pares texto/fondo
declarados —**incluidos los tokens hsl semánticos de `index.css` que se rendericen dentro
de `.papel-root`**, no sólo los hex papel— y falla bajo 4,5.

### 8. Números honestos (D4)

`DEMO_VOCES_COUNT` y su export se borran. El slot muestra la cifra sólo cuando hay algo
que contar:

- `n ≥ 1` → «{N} voces · falta la tuya»
- cero, cargando y error → «Falta la tuya.» a secas

Nunca miente, nunca deja el hueco vacío, conserva el elemento de identidad de §1 en los
cuatro estados y evita el salto de layout. El régimen puro y testeado de
`ElMandatoVivo/mandato-regimen.ts` es el molde a espejar.

Alcance real: `useVocesCount` tiene **5 consumidores de producción** y **9 archivos de
test** lo referencian (4 de ellos montan `PapelHeader`). `CifrasStrip` además necesita
estado de error explícito — hoy queda pulsando «Cargando cifra» para siempre por
`retry:false`.

El pie pasa a una declaración positiva y verificable con link a `/datos-abiertos`. El
copy tiene que cubrir los dos orígenes reales: las métricas de participación salen de la
base, los conteos de planes/ensayos/posts/entrenamientos salen del contenido en disco.
Ninguno sale de una constante escrita a mano — eso es lo que la frase afirma. `NotaDemo`
sale del barril de primitivas.

**Enmienda a la ley, el mismo día:** §5, §7 y §11.3 del design-system todavía mandan
asterisco junto a «toda métrica inventada», y la **tarea 1.3 del master plan pide
literalmente el fallback con asterisco que hoy es el bug**. §11.3 importa especialmente:
es la Definición de terminado por página, así que sin enmendarla ② reintroduce el
mandato en la primera página que construya.

### 9. Tarjetas OG

`scripts/build/build-og-cards.ts` con **satori + @resvg/resvg-js como devDependencies**
(cero deps de producción; el output se commitea, patrón idéntico al de
`scripts/build/build-mapa-argentina.ts`), leyendo los **TTF completos** de
`scripts/build/fonts-src/` — no los `.woff2` de `public/fonts/`: satori no soporta woff2
(sólo TTF/OTF/WOFF), y el subset de §5 no contiene todos los glifos que puede necesitar
un título.

~135 PNG-8 en `public/og/`: las secciones + los ~104 documentos. Las 329 lecciones y las
rutas servidas por DB **heredan** la tarjeta de su sección — sellar su `<head>` cuesta
casi nada en el mismo script, pero generar 400 PNG llena el repo de binarios que se
recommitean con cada corrección de título, y nadie comparte la lección 7 de un curso sin
compartir el curso.

**Sin grano de papel**, explícitamente: §10.3 dice que el grano va en «toda página» y
alguien lo va a agregar de buena fe. Es la diferencia entre ~8 KB y ~580 KB por tarjeta.

Descartado: una sola imagen OG universal (el segundo y el tercer link de un grupo se leen
como repetición); SVG estático (ningún scraper acepta `image/svg+xml` como `og:image`, y
SVG 1.1 `<text>` no ajusta líneas); `@vercel/og` (dep de producción de ~7 MB apuntando a
un target serverless que no existe — `apps/api` es un proceso largo).

### 10. Marca y purga

**Marca.** Favicon «¡» violeta sobre papel (SVG + `.ico` + apple-touch-icon),
`site.webmanifest`, `og/default.png` como plantilla base y fallback permanente. El
favicon y la card OG comparten el dibujo del «¡»: se hacen juntos para no dibujarlo dos
veces.

**Purga, sólo lo muerto y lo que no toca ninguna página:** `sonner`, `drizzle-zod`, el
`zod` de `packages/db`, y `@radix-ui/react-label` reemplazando `components/ui/label.tsx`
por un `<label>` nativo con la misma clase (riesgo cero: los 10 archivos que usan Label
lo importan de `~/components/ui/label`, nunca de Radix). Más `sourcemap: mode !==
'production'`, y **una guardia de build que borre todo `**/.DS_Store` de `dist/`**:
`.gitignore` ya los ignora (`v2/.gitignore:66`) y ninguno está trackeado — llegan al
`dist` porque Vite copia `public/` entero desde el disco del autor, así que una segunda
regla de gitignore es un no-op y borrarlos a mano tampoco alcanza (Finder los recrea).

`framer-motion` sale del camino crítico con `lazy()` sobre el Header v1 y `XpToast`,
**verificando que Rollup efectivamente corte** (el import compartido de `lucide-react`
puede impedirlo). No se reescriben con keyframes: el 100% de esas ~130 LOC las borra ②.

`.size-limit.json` se arregla: desambiguar el glob de `index-*`, incluir `query-*` y
`radix-*`, y bajar el límite a algo que muerda.

**`scripts/` entra a `pnpm verify`.** Hoy no es workspace de pnpm ni está en el `include`
de ningún tsconfig, así que `sellar-head.ts`, `prerender.ts`, `build-og-cards.ts` y
`subset-fonts.ts` —el corazón de ①— escaparían a `strict` y a `no-explicit-any`. Se
agrega `scripts/tsconfig.json` con las reglas de `packages/config/typescript/base.json`,
referenciado desde `v2/tsconfig.json`, y `scripts` se suma a `pnpm lint`.

**Puerto del web:** `env.example:13` dice `5173` y el `.claude/launch.json` de la **raíz
del repo** levanta con `--port 5273`. Gana **5173**, que es lo que ya usan
`env.example`, `vite.config.ts` (`WEB_PORT`) y `playwright.config.ts` (`port` +
`baseURL`, con `strictPort`): se corrige `launch.json`, no los otros tres.

## Orden de trabajo

Numeración topológica: ningún bloque aparece antes que aquello de lo que depende.

| Bloque | Entrega | Depende de |
|---|---|---|
| **B0** · Decisiones y enmienda documental | D1–D4 escritas; `architecture/README.md:96` corregido; §1/§3/§5/§7/§11.3/§12 del design-system enmendados (§2 la reescribe B6, cuando tenga los hex nuevos); tareas 1.3 **y 8.1** del master plan corregidas — 8.1 pierde títulos/descripciones, card OG, favicon, sitemap y prerender, que los entrega ① | Nada |
| **B1** · Higiene del build y del repo | Purga de deps muertas; `sourcemap` por modo; guardia de `.DS_Store` en `dist/`; `.size-limit.json` arreglado; `lazy()` de Header v1 y XpToast con medición; `scripts/tsconfig.json` + `scripts` en lint; `deps:check` (falla sobre 45 deps de producción únicas, tope duro 60); puerto 5173 en `launch.json` | Nada — paralelo a B0 |
| **B2** · Shell HTML y fuentes | **Medición del LCP real** (antes de decidir preload); `index.html` limpio; `color-scheme: light` en `index.css:20` + `<style>` crítico; `body bg-papel`; `<noscript>`; seis familias self-hosteadas con `subset-fonts.ts`; preload; OFL; swap de glifos (`✕`→`×`, SVG inline para `▌ ▾ ↺ ☰ ✓ ▲ ▼`) | B1 |
| **B3** · `public/` y marca | Favicon «¡», `site.webmanifest`, apple-touch-icon, `og/default.png` (el `robots.txt` **no** se crea acá: lo genera `sellar-head.ts` en B11) | B0-D1, B2 |
| **B4** · Accesibilidad del shell | Skip link en las dos ramas; `id="contenido"`; foco en `useIrAlPrincipio`; anillo por superficie reusando `--ring`; `MotionConfig` + `motion-reduce` | B2 |
| **B5** · Fallos del cliente | `ErrorBoundary` papel con los dos estados; reset por `location`; 500 de §5 | B2 |
| **B6** · Contraste AA | Escala dual con el mapa viejo→nuevo; `PageFallback`; `aria-hidden`; `.dc.html` regenerados; §2 reescrito; test de contraste incluyendo tokens hsl | B0-D3 |
| **B7** · Registro de rutas | `lib/rutas/` sin dependencias de Vite, con fuente inyectada; `esRutaPapel()` reimplementado; hook en `App.tsx`; `descripcionDe()` testeado; `descripcionMeta` de `/cronica`; guardia `meta:check` en CI | B0-D1, B2 |
| **B8** · Tema por ruta | Efecto en `RootLayout` que escribe `colorScheme` y `theme-color` según la `superficie` | B2, B7 |
| **B9** · Tarjetas OG | `build-og-cards.ts` con satori + @resvg/resvg-js; ~135 PNG-8 sin grano en `public/og/` | B2, B3, B7 |
| **B10** · Números honestos | `DEMO_VOCES_COUNT` borrado; régimen de estados; `CifrasStrip`; 5 consumidores + 9 archivos de test; pie resuelto; `NotaDemo` fuera | B0-D4 |
| **B11** · Sellado + sitemap + host | `sellar-head.ts` cableado al `build` de `apps/web` (único dueño de `robots.txt`); sellado también de las `privada`; `sitemap.xml`; `v2/vercel.json` con fallback, 301, headers y caché | B7, B3, B9, B0-D1 |
| **B12** · Prerender | `prerender.ts` + `pnpm prerender`; paso propio en CI con `playwright install`; `createRoot` + `data-prerender`; las tres reglas de contención | B11, B10 |
| **B13** · Verificación y guardias | Proyecto de preview en Vercel; `curl -A facebookexternalhit`; `curl -I` de headers y caché; `/no-existe` → 404 real; chunk borrado → expediente; Chromium sin JS; recorrido de teclado en una ruta papel y una legado | Todos |

`B12` depende de `B10` y no al revés: el prerender no puede congelar un contador que
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
- Subir el `<main>` al layout (62 ocurrencias en 48 archivos).
- **El `<h1>` faltante de 21 de 23 planes**: `markdown.ts:18` vuelve a aplicar
  `stripFrontmatter` sobre cuerpos que `plans-registry.ts:58` ya limpió, y la segunda
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
- `hydrateRoot` y la auditoría de mismatch que habilitaría: proyecto propio (§4).
- SSR en runtime o inyección por request: contradice ADR 0001.

Queda además una decisión de operaciones, **no de sustrato**: las 4 filas de
`pulse_signals` y el `community_post` que la suite de integración dejó en la Neon de v2 y
que los agregados públicos podrían publicar como datos reales. No se pudo verificar en la
sesión de relevamiento (la API no respondía en `:4000`). Borrarlas, mover la suite a una
branch de Neon dedicada, o excluirlas de los agregados.

## Definición de terminado

1. `curl -A facebookexternalhit` contra el **preview deploy real** devuelve título,
   descripción e imagen **propios** para: la portada, un plan, un ensayo, una crónica de
   bitácora y un entrenamiento. No alcanza con `vite preview` — hace fallback SPA por su
   cuenta y tapa el problema de reescritura.
2. `/no-existe` devuelve **404 real**, no 200. `/ingresar` devuelve 200 con `noindex`.
3. `curl -I` sobre una ruta papel devuelve CSP, `nosniff`, `Referrer-Policy` y
   `Permissions-Policy`; sobre un asset con hash devuelve directivas de caché distintas a
   las del HTML.
4. Recorrido de teclado completo en una ruta papel y una legado: skip link como primera
   parada, foco visible en todo control, foco movido al contenido al navegar.
5. Ningún par texto/fondo declarado baja de 4,5:1 — verificado por el test, no a ojo.
6. Ningún número visible en el sitio sale de una constante escrita a mano: las métricas
   de participación vienen de la base, los conteos de contenido del registro en disco.
7. Borrar un chunk del `dist` servido muestra el expediente «Salió una versión nueva»,
   no una pantalla en blanco. Chromium con JS deshabilitado muestra el `<noscript>`.
8. `pnpm verify` verde **alcanzando a `scripts/`**, y las tres guardias nuevas
   (`meta:check`, test de contraste, `deps:check`) corriendo en CI.
9. Cero requests a terceros en el waterfall de carga de una ruta papel.
10. `pnpm size` mide el payload inicial completo y está por debajo del presupuesto.

Nota sobre la red de seguridad: la suite e2e de v2 son **2 tests en 1 archivo**
(`tests/e2e/home.spec.ts`). Hoy no hay nada automatizado que proteja lo que ① toca en
rutas ni en el shell, así que B13 no es opcional.
