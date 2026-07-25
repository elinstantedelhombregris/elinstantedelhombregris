# El manifiesto y la bitácora «Papel y Tinta» — páginas 3.3 y 3.4

**Fecha:** 2026-07-24
**Fuente de diseño:** `docs/design-system/BASTA-v2.dc.html` (pantallas `data-screen-label="El manifiesto"` y `data-screen-label="Crónica"`)
**Sistema:** `docs/design-system/README.md` v1.1 (ley) · cards 3.3 y 3.4 del master plan `docs/plans/2026-07-21-papel-y-tinta-master-plan.md`
**Precedente directo:** `docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md` (3.1 y 3.2) — de ahí salen el lector editorial, la edición impresa, el 404 expediente y la regla de conteos derivados. Acá se reusa, no se re-deriva.
**Plan de implementación:** `docs/plans/2026-07-24-manifiesto-y-bitacora-plan.md`

> **Tesis de copy — 3.3.** Al manifiesto llega el que hizo click en «Documento
> fundacional» desde la biblioteca, o el que entró por el link del inicio, y quiere
> saber de qué se trata todo esto antes de darle su tiempo a nada más. La página tiene
> un solo trabajo: que lo lea entero. Por eso muestra de entrada de qué está hecho —
> {N} partes numeradas por el propio texto—, lo deja saltar a la que quiera, y cuando
> llega al final le cae el único sello que la ley reserva para este documento. Se va
> con la sensación de haber terminado algo, no de haber scrolleado algo.

> **Tesis de copy — 3.4.** A la bitácora llega el que ya leyó algo y quiere ver si
> esto sigue vivo: ¿hay alguien escribiendo o es un sitio congelado? La página tiene un
> solo trabajo: mostrarle {M} crónicas fechadas, completas y en orden, y dejarlo entrar
> a cualquiera en un gesto. Se va leyendo una — y al final de lo que lea, la página le
> pide lo mismo que todas: que deje de leer y diga la suya en el mapa.

## Por qué

`/manifiesto` es hoy **doce líneas de código**: `MdxContent` sobre el archivo crudo,
`prose-invert`, Playfair, `iris-violet`, contenedor `max-w-3xl`. El texto fundacional
del movimiento —1443 palabras, 8 partes numeradas, un pacto final— se sirve como un
muro sin jerarquía, sin principio ni final visibles, con el chrome que la ley prohíbe.
Es la página que la biblioteca destaca como **puerta de entrada** y la única que §10.5
menciona por nombre en el catálogo de sellos.

`/blog` y `/blog/:slug` son puertos v1 igual de crudos: header serif con
`gradient-text`, cards `glass` redondeadas, chips `#tag` en `iris-violet`, un botón ♥ y
un hilo de comentarios. Ese hilo **no funciona desde el día uno** (ver abajo), la palabra
«blog» no existe en el vocabulario del sistema (§8 dice **bitácora**) y 17 de las 22
URLs están mal escritas en castellano: `la-educacin-como-acto-de-soberana`.

Esta conversación convierte los dos en lo que son: **el documento fundacional con su
recorrido y su sello**, y **el registro de lo que va pasando, con las direcciones
arregladas y nada que se pierda**.

---

## Lo que hay hoy (inventario verificado 2026-07-24)

### El manifiesto: estructura real del texto

`content/manifiesto/manifiesto.mdx` — 9013 caracteres, 1443 palabras. Verificado
parseando el archivo:

| Región | Qué es | Cantidad |
|---|---|---|
| `# Manifiesto del Hombre Gris` | H1 del cuerpo, idéntico al `title` del frontmatter | 1 |
| Apertura | epígrafe en itálica + 7 párrafos de entrada, separados por `---` | 8 bloques |
| `## {n}. {título}` | las partes numeradas por el propio texto (1…8) | **8** |
| Coda | el pacto («Si este pacto resuena en vos…») + el cierre del movimiento | dentro de la parte 8, después de un `---` |

**La card 3.3 del master plan dice «8 sections» y se queda corta:** el manifiesto es
una apertura + 8 partes + una coda que vive dentro de la parte 8. El diseño de abajo
respeta esa forma exacta y **no la reinterpreta**: el número de partes se deriva del
texto, nunca se escribe.

Frontmatter: `slug`, `title`, `summary`, `publishedAt`, `authorUsername`, `tags`,
`draft`. **No trae `readingMinutes`** — dato que no existe (ver Decisión 7).

### La bitácora: 22 crónicas, 17 direcciones rotas

`content/blog/*.mdx` — 22 archivos, `draft: false` en los 22, todos con `slug`, `title`,
`summary`, `type: blog`, `category`, `readingMinutes` (2–18), `tags` y `publishedAt`
(2025-12-25 → 2026-05-25). El schema Zod (`packages/shared/src/content/frontmatter.ts`)
ya está corregido y documenta `category` como *«Single-word theme from v1. Shown raw by
the bitácora»* y la ausencia de autor: *«The site has one author (el hombre gris) and no
post carries this in frontmatter»*.

**El hallazgo de las URLs.** El `slugify` de v1
(`SocialJusticeHub/shared/blogContent.ts:1`) hace `.replace(/[^\w\s-]/g, '')` — que en
castellano **no transliteran los acentos: los borra**. De ahí salieron los slugs que la
migración copió tal cual:

| v1 (hoy) | Título real |
|---|---|
| `la-educacin-como-acto-de-soberana` | «…La Educación como Acto de Soberanía» |
| `cules-deberan-ser-nuestros-parmetros` | «¿Cuáles deberían ser nuestros parámetros?» |
| `el-cristo-que-llevs-dentro` | «El Cristo que llevás dentro» |
| `sistemas-vs-sntomas-cmo-pensar-como-ingeniero-social` | «Sistemas vs. Síntomas: Cómo Pensar como Ingeniero Social» |

Verificado con el script de canon: **17 de 22 slugs cambian**, 5 ya están bien
(`buscar-en-el-pasado-para-controlar-el-futuro`, `el-abrazo-que-no-supimos-sostener`,
`la-ciencia-de-la-confianza-…`, `quien-tiene-el-timon`, `refinarse-o-repetirse`).

**Las categorías.** 16 categorías distintas sobre 22 posts (`ingenieria-social` ×4,
`poder` ×2, `etica` ×2, `tecnologia` ×2, y 12 con **un solo post cada una**). Dato real,
pero una taxonomía de cola larga: ver Decisión 14.

### La API de blog: existe, y no puede dar una sola cifra

`apps/api/src/features/blog/routes.ts` (305 líneas, montado en `/api/blog`) sirve
`GET /posts`, `GET /posts/:slug`, y like/bookmark/comment/view **direccionados por `id`
numérico** (`parseId`). Las cifras (`likeCount`, `viewCount`, `commentCount`,
`bookmarkCount`) son columnas de `blog_posts` (`packages/db/src/schema/blog.ts`).

Tres hechos verificados:

1. **La tabla está vacía para este contenido.** Las 22 crónicas son MDX de build-time;
   ningún seed, migración ni script inserta filas en `blog_posts` (`grep -rl blogPosts`
   → solo el schema y el repositorio). Sin fila no hay `id`, y sin `id` no hay cifras.
2. **El hilo de comentarios del v1-port está roto desde que se escribió.**
   `BlogPostDetail.tsx:94` llama `/api/blog/posts/${slug}/comments`; la ruta es
   `/posts/:id/comments` y `parseId('quien-tiene-el-timon')` → `NaN` → **400
   INVALID_ID**. El botón ♥ (`:id/like`) tiene exactamente el mismo problema.
   **Borrarlo no es una regresión: es sacar un cartel que nunca anduvo.**
3. Cuando exista el dato, el camino ya está: `GET /api/blog/posts/:slug` devuelve el
   post *con* sus contadores y su `id`. Ver Decisión 12.

### El video ASCII: dormido a propósito

Commit `c799098` («herramientas de video ASCII y registro — sin cablear») dejó
`components/BlogPostAsciiVideo.tsx` + `asciiVideoRegistry.generated.ts` con 20 entradas.
Verificado: `apps/web/public/media/` tiene **solo un `.DS_Store`**, y no hay un `.mp4` en
todo el repo. El propio mensaje del commit dice que se reactiva «en la fase 3.4». Ver
Decisión 18 — la respuesta es **no todavía**, con la condición exacta escrita.

### Inventario de lo que muere / se transforma

| Feature v1-port | Destino |
|---|---|
| `Manifiesto.tsx`: `MdxContent` + `container max-w-3xl` | **Se reescribe in-place.** Ruta intacta, named + default export intactos. |
| El H1 del cuerpo repetido como único título | **Se transforma:** se iza a H1 de página con rito de la tinta (§10.1). |
| `Blog.tsx`: header serif «Lo que vamos pensando juntos.» + cards `glass` | **Muere entero.** Su trabajo lo hace `/bitacora`. |
| `BlogPostDetail.tsx`: `MdxContent`, chips `#tag`, botón ♥, hilo de comentarios | **Muere entero.** El hilo y el ♥ nunca funcionaron (400); las cifras vuelven cuando existan (Decisión 12). |
| `BlogPostDetail.tsx`: 404 «Post no encontrado.» | **Se transforma** en 404 expediente §5 (kicker `expediente extraviado` + sello EXTRAVIADO). |
| `BlogAuthor.tsx` en `/blog/escribir` | **Sobrevive tal cual** (herramienta de plataforma, Fase 5). El redirect no la traga: Decisión 11. |
| `components/MdxContent.tsx` | **No se toca.** Pierde dos consumidores y le quedan dos (`PoliticaPrivacidad` → 4.3, `IniciativaDocumento` → Fase 5). |
| Slugs con acentos borrados | **Se reparan** con rastro (Decisión 9 y 10). |

---

## Las tres decisiones estructurales

### 1. El sello LEÍDO ENTERO — la única página que se lo gana

§10.5 tiene catálogo **cerrado**: voz soltada → `RECIBIDA` · semilla → `PLANTADA` ·
**manifiesto leído hasta el final → `LEÍDO ENTERO`** · documento auditado → `VISTO`.
3.2 ya declinó extenderlo a los 21 ensayos («scrollear no es leer»). Acá no hay que
extender nada: la ley nombra este documento.

**Cuándo cae.** Cuando el **bloque de firma** —el último elemento del documento— entra
en viewport al 60%. Es el patrón `VISTO` ya shipeado en
`pages/ElMandatoVivo/sections/DocumentoMandato.tsx:18-31`: un `IntersectionObserver`
sobre la firma, `threshold: 0.6`, que se desconecta al primer disparo. **Cero código
nuevo de mecánica: se copia el que ya funciona y tiene test.**

**Qué NO hace, y por qué cada «no»:**

- **No se guarda.** Sin `localStorage`, sin cookie, sin endpoint. El despertar persiste
  porque es un estado visual del sitio entero; esto es la confirmación de un gesto que
  acaba de pasar. Guardarlo lo convertiría en un logro, y un logro sin tabla es un dato
  inventado (directiva de datos del master plan).
- **No cuenta a nadie.** Ningún «{N} personas lo leyeron»: no existe la tabla.
- **No da XP ni insignia.** La gamificación tiene eventos reales (`content_read`); un
  evento falso para adornar el final del manifiesto sería exactamente lo que §14
  prohíbe.
- **No hay barra de progreso de lectura.** §14: «Cero barras de progreso salvo dentro de
  documentos»; §13 reserva las barras para datos. El sumario ubica; nada mide.
- **No se imprime.** La edición impresa es el documento, no la sesión (§10.8).
- **No bloquea nada.** El CTA final está desde el principio; el sello no lo desbloquea.
- **No se repite.** Una vez por visita; volver a subir y bajar no lo vuelve a estampar.

**Lo que el sello afirma.** El sello dice `LEÍDO ENTERO` porque la ley lo escribe así.
La línea que lo acompaña no afirma comprensión —la plataforma no puede verificarla—
sino llegada: `Llegaste al final. Ahora empieza la parte tuya.` Quien salte con el
sumario a la parte 8 y baje va a estamparlo: es un índice, no un torniquete, y el sitio
no vigila lectores. El mismo criterio que el `VISTO` del mandato.

### 2. Las URLs de la bitácora: se reparan, y nada se pierde

Esta página es dueña de las URLs de lectura, así que decide. **Se reparan.**

- **La regla es mínima y mecánica:** el slug canónico es el mismo que produjo v1 **con
  los acentos transliterados en vez de borrados** (NFD → sin marcas → minúsculas →
  fuera todo lo que no sea `a-z0-9` → espacios a `-`). No se re-titula ni se re-slugifica
  nada: se le devuelven las letras que el `replace` de v1 se comió.
- **Por qué.** La URL es texto de cara al usuario: se lee, se dicta, se comparte, se
  pega en un chat. §7 gobierna **todo** string de cara al usuario y `soberana` no es una
  palabra que este movimiento escriba. Además el `slug` del frontmatter es la fuente de
  verdad declarada por el schema, y hoy declara un error de v1.
- **Nada 404ea.** Cada post que cambia de dirección declara su dirección vieja en el
  propio frontmatter (`legacySlugs`), el registry la expone y el lector redirige con
  `replace`. Ver Decisión 10 para el mecanismo exacto.
- **Alcance:** 17 archivos (frontmatter + nombre de archivo con `git mv`), 5 intactos.
  El cuerpo de los 22 **no se toca ni un byte** (texto keystone).

### 3. Cifras: ninguna, y con la condición de revival escrita

La card 3.4 del master plan pide «live counts (likes/views) from the blog API, never
hardcoded». Verificado el API: para estas 22 crónicas **no hay cifras vivas que traer**
(sin filas, sin `id`, endpoints por `id`). Entonces:

- **La bitácora no muestra ninguna cifra de post.** Ni vistas, ni likes, ni comentarios.
  Ni cero: un «0 vistas» afirmaría que hay medición.
- **Sí muestra lo que el contenido declara:** fecha, categoría, minutos de lectura
  (`readingMinutes` del frontmatter, dato autoral) y los conteos derivados de la
  colección ({M} crónicas, {n} por año).
- **Condición de revival, exacta:** una fila `blog_posts` por slug de MDX (migración +
  seed, con test de integración) y el lector consumiendo `GET /api/blog/posts/:slug`,
  que ya devuelve `likeCount`/`viewCount`/`commentCount` y el `id` que las mutaciones
  necesitan. El día que exista, **§13 manda**: conteos < 100 se dibujan con palitos
  (§10.6), las barras quedan para documentos, y **no se muestran porcentajes con N <
  100**.

---

# Página 3.3 — el lector del manifiesto (`/manifiesto`)

Lector editorial sobre papel claro, contenedor `max-w-[800px]` (§4: lectores 760–860),
padding lateral 40/20. **Misma familia que el lector de ensayo (3.2)** — y cada
diferencia está justificada abajo, una por una.

**Toda la prosa de esta sección es el copy final; el implementador la transcribe tal
cual.** `{N}` = `PARTE_COUNT`, siempre interpolado.

## Los datos: el texto se parte por sus propias costuras

`pages/Manifiesto/manifiesto-data.ts` expone un parser **puro** sobre el `?raw` del
archivo (mismo import que hoy usa la página):

| Derivada | Regla |
|---|---|
| `titulo` | el texto del `# ` inicial del cuerpo. Si no hubiera H1: `''` y no se iza nada. |
| `apertura` | todo lo que va desde después de esa línea hasta el primer `## ` |
| `partes[]` | un elemento por `## `, con `fuente` (el trozo crudo, encabezado incluido), `encabezado` (el texto del `## ` **tal cual**), `cuerpo` (la fuente sin su encabezado), `numero` (el `{n}` de `## {n}. …`, o `null`) e `id` (`parte-{numero}`, o `parte-p{posición}` si no numera) |
| `PARTE_COUNT` | `partes.length` → hoy **8** |

**La garantía de verbatim es una igualdad de strings, no una promesa:**
`apertura + partes.map(p => p.fuente).join('') === cuerpo sin la línea del título`.
Si alguien reescribe el manifiesto y cambia la forma, el test rompe antes que la página.

**Degradación honesta:** un cuerpo sin `## ` da `partes: []` → la página muestra
**todo** el texto como apertura y **no dibuja el sumario**. Nada se pierde nunca.

**Lo único autoral acá es el corte**, no el texto: las partes se muestran con su
encabezado literal («1. Declaración de Identidad — "Yo soy"»), sin renumerar, sin
traducir y sin cambiarle las comillas rectas por angulares — es texto keystone y las
comillas del autor son del autor (deuda observada al pie, no un arreglo de esta página).

## Estructura

- **Backlink** (mono 12px uppercase tinta-50, hover tinta, `print:hidden`):
  `← La biblioteca` → `/biblioteca`.
- **`<article className="edicion-impresa">`** — el documento entero adentro:
  - **Folio** (`hidden print:block`, mono 10px uppercase, primera línea impresa):
    `¡BASTA! · edición del lector · {fecha}` (fecha del día, `es-AR` largo — formato
    idéntico al de `PlanDetail` y `EnsayoDetail`).
  - **Kicker violeta** (mono 11px uppercase, se imprime):
    `El manifiesto · documento fundacional · {N} partes`
  - **H1 Anton** `clamp(36px,5.4vw,68px)`, `riso-hover`, con rito de la tinta
    (`RitoTinta`, una línea) sobre `titulo`, `aria-label` con el título real,
    `print:[&_span]:animate-none` (patrón 3.2).
  - **Apertura:** `MdxPapel` con la apertura **verbatim**, `max-w-[680px]`,
    `[&>*:first-child]:mt-0`.
  - **Sumario** (`<nav aria-label="Las partes del manifiesto">`, `print:hidden`), solo si
    hay partes:
    - línea mono 11px uppercase tinta-50: `El recorrido · {N} partes`
    - una fila por parte, receta de fila de índice §5 compuesta inline con un `<a>`
      **nativo** (`href="#parte-{n}"`): num mono 12px tinta-30 (`01`…) · encabezado
      verbatim 17px · glifo `→` mono tinta-50; hover papel-presionado, borde inferior
      `papel-borde`, alto ≥ 44px.
  - **Las partes**, cada una `<section id="{id}" className="scroll-mt-20">`
    (`scroll-mt` = 80px porque el header papel es `sticky h-16`):
    - borde superior 2px tinta, padding-top 22 (ritmo de documento, mismo device que los
      ciclos en 3.1);
    - `<h2>` Anton `clamp(26px,3.4vw,40px)`, `riso-hover`, con el **encabezado
      verbatim**;
    - `MdxPapel` con `cuerpo`, `max-w-[680px]`, `[&>*:first-child]:mt-0`.
  - **Bloque de firma** (último elemento del artículo, y el que observa el sello):
    `— El hombre gris` mono 12px tinta-50.
- **El sello** (`print:hidden`, solo después de que la firma entró en viewport):
  fila `role="status"` con `Sello color="verde" rotate={-4}` → `Leído entero` y, al lado,
  mono 12px tinta-50: `Llegaste al final. Ahora empieza la parte tuya.`
- **Cierre** (card oscura dentro de la columna, `bg-tinta text-papel`, padding 28/32,
  `flex justify-between` con wrap, `print:hidden`):
  - Anton 22px: `El manifiesto no te pide que lo firmes. Te pide que lo hagas.`
  - `BotonPapel variant="violeta" surface="oscuro"` en `Link` a `/el-mapa`:
    `Soltar mi voz en el mapa →`

## En qué se diferencia del lector de ensayo (3.2), y por qué

| Rasgo | Ensayo (3.2) | Manifiesto (3.3) | Por qué |
|---|---|---|---|
| Medida de lectura | 800px | **igual** | §4 no cambia porque el texto sea más importante. |
| Rito de la tinta en el H1 | sí (H1 del frontmatter) | **sí (H1 del cuerpo, izado)** | El cuerpo trae `# `; izarlo evita el título duplicado que obligó a `PlanDetail` a renunciar al rito. |
| Kicker | ubica en el ciclo | **ubica en el documento** (`{N} partes`) | El manifiesto no tiene ciclo ni vecinos; lo que el lector necesita saber es de qué tamaño es lo que empieza. |
| Navegación interna | ninguna | **sumario de {N} partes** | Es el único texto del sitio que se numera a sí mismo, es la puerta de entrada de los que vienen de cero, y el sello obliga a responder «¿cuánto falta?» sin barra de progreso. |
| Cuerpo | un solo `MdxPapel` | **uno por parte** | Los anclajes necesitan contenedores; `marked` no genera `id` de heading (v15). El texto igual sale verbatim: la igualdad de strings lo prueba. |
| Cadena prev/next | vecinos del ciclo | **ninguna** | No hay hermanos: el manifiesto es uno solo. Su «siguiente» es el mapa. |
| Sello al terminar | ninguno (3.2, D2) | **LEÍDO ENTERO** | §10.5 lo escribe para este documento y solo para este. |
| Interacción firma | ninguna | **el sello** | §6: una por página. |

## La edición impresa (§10.8 — patrón reusado tal cual)

1. El chrome no se imprime desde 2.4 (`print:hidden` en `PapelHeader`/`PapelFooter`/
   `PaperGrain`/`DespertarVeil`). **Cero cambios de chrome.**
2. La serifa vive en `index.css` (`@media print { .edicion-impresa … }`). El `<article>`
   lleva la clase. **`index.css` no se toca.**
3. Propio de este lector: folio como primera línea del `<article>` · `print:hidden` en
   backlink, **sumario**, sello y cierre · kicker, H1, apertura, encabezados de parte,
   cuerpos y firma **sí** se imprimen · sin sombra que apagar (papel sobre papel).
4. `print:[&_span]:animate-none` en el H1 para que el rito no imprima a medio entintar
   (3.2, D10).

Un manifiesto impreso queda: folio, título, epígrafe, apertura, las {N} partes con sus
encabezados, el pacto y la firma. Es exactamente el documento — sin la navegación, sin
el sello, sin el CTA.

---

# Página 3.4 — la bitácora (`/bitacora` + `/bitacora/:slug`)

## El índice (`/bitacora`)

Página papel estándar, contenedor `max-w-[1100px]` (§4, índices), padding 40/20.
`{M}` = `CRONICA_COUNT`, siempre interpolado.

- **Backlink** (mono 12px uppercase tinta-50): `← La biblioteca` → `/biblioteca`. La
  bitácora es una sala de la biblioteca y no está en el nav: el camino de vuelta se
  dice.
- **Kicker violeta:** `La bitácora · {M} crónicas · desde {mes de} {año}` (el mes/año de
  la crónica más vieja, `es-AR`, derivado).
- **H1 Anton** `clamp(44px,6vw,88px)` con rito de la tinta, dos líneas:

  > **Acá se escribe**
  > **mientras pasa.**

- **Lead** (Archivo 17px, tinta-75, max-width 620):
  `Lo que se piensa, lo que se prueba y lo que todavía no cierra. {M} crónicas enteras, sin registro y sin recorte. Están en orden, pero se leen en cualquiera.`
- **El índice, agrupado por año** (`publishedAt` descendente; el año es el eje real de
  una bitácora, no una taxonomía inventada). Por cada año, en orden descendente:
  - línea mono 11px uppercase tinta-50 sobre borde superior 2px tinta, padding 22/0:
    `{año} · {n} crónicas` (`{n} crónica` en singular cuando corresponda). Hoy: «2026 ·
    21 crónicas» y «2025 · 1 crónica».
  - una `FilaIndiceExpandible` (§5, primitiva de 2.4) por crónica, numeradas `01`…
    **dentro del año**:
    - **Fila (cerrada):** num mono 12px tinta-30 · título Archivo 17px `font-semibold`
      (violeta cuando está abierta) + marca `vlog` si `type === 'vlog'` (mono 10px
      uppercase, borde 1px tinta-30 — hoy no ocurre: los 22 son `blog`) · debajo del
      título, línea mono 11px uppercase tinta-50: `{fecha larga} · {categoría}`
      (categoría **cruda**, omitida si viene vacía) · glifo `+`.
    - **Panel:** el `summary` del frontmatter entre comillas angulares (16px tinta-90,
      max-width 640, `text-wrap:pretty`) — **dato real, jamás reescrito** — y link mono
      12px bold uppercase violeta a `/bitacora/{slug}`:
      `Leer la crónica · {min} min →` (sin el tramo de minutos si `readingMinutes` es 0;
      hoy los 22 lo traen).
    - **Una sola fila abierta en toda la página** (patrón 3.1: abrir una de 2025 cierra
      la de 2026).
- **Sin chips, sin búsqueda, sin paginación** — misma vara que 2.4 y 3.1. Ver Decisión 14.
- **Cierre:** `BandaCta fondo="tinta"` con una fila `flex justify-between` (wrap):
  - h2 Anton `clamp(30px,4vw,52px)`: `¿Y vos qué ves?`
  - `BotonPapel variant="violeta" surface="oscuro"` en `Link` a `/el-mapa`:
    `Soltar mi voz en el mapa →`

**Vacío** (§10.9, hoy imposible — build-time con 22 archivos):
`Todavía no hay crónicas. Cuando pase algo, se cuenta acá.` (misma línea que el hub: es
la misma sección, vista desde otra sala).

**El índice no se imprime.** La edición impresa es de los lectores (§10.8): un índice
impreso son 22 links muertos.

## El lector (`/bitacora/:slug`)

Mismo lector editorial de 3.2, con las diferencias que el contenido pide.
Contenedor `max-w-[800px]`, padding 40/20.

- **Backlink** (`print:hidden`): `← La bitácora` → `/bitacora`.
- **`<article className="edicion-impresa">`**:
  - **Folio** (`hidden print:block`): `¡BASTA! · edición del lector · {fecha}`.
  - **Kicker violeta** (se imprime): `Bitácora · {categoría} · {fecha larga} · {min} min`
    — cada tramo desaparece si su campo falta; nada se rellena.
  - **H1 Anton** `clamp(36px,5.4vw,68px)`, `riso-hover`, rito de la tinta sobre el
    `title` del frontmatter, `aria-label` real, `print:[&_span]:animate-none`.
    (`RitoTinta` trata `¿ ?` como letras comunes — los cuatro títulos con interrogación
    se entintan enteros sin variante nueva; criterio 3.2-D8.)
  - **Bajada:** el `summary` del frontmatter (Archivo 18px tinta-75, max-width 620) —
    ocupa el lugar del `subtitle` del ensayo, que la crónica no tiene.
  - **Cuerpo:** borde superior 2px tinta, padding-top 28, MDX **verbatim** vía
    `MdxPapel` con `max-w-[680px]` y `[&>*:first-child]:mt-0` (verificado: ningún cuerpo
    abre con `# H1` — arrancan en prosa o en cita, así que no hay título duplicado).
  - **Firma** §1 (mono 12px tinta-50, se imprime): `— El hombre gris`. El schema dice que
    el sitio tiene un solo autor y que ningún post lo declara: la firma es del sitio, no
    un dato inventado por crónica.
- **La cadena cronológica** (borde superior 1px tinta, `flex justify-between` con wrap,
  `print:hidden`): el orden de lectura de una bitácora es su orden — de la más nueva a
  la más vieja.
  - izquierda: la **anterior en el índice** (más reciente) — `← {título}`, mono 12px
    tinta-50, hover tinta;
  - derecha: la **siguiente** (más antigua) — `{título} →`, mono 12px tinta bold, hover
    violeta;
  - encima de cada link, mono 10px uppercase tinta-30: `más reciente` / `más antigua` —
    sin eso, «anterior» y «siguiente» son ambiguos en una línea de tiempo;
  - la más nueva no tiene izquierda; la más vieja no tiene derecha. Cero callejones.
- **Cierre** (card oscura, `print:hidden`):
  - Anton 22px: `Esto ya pasó. Lo que sigue lo escribís vos.`
  - `BotonPapel variant="violeta" surface="oscuro"` en `Link` a `/el-mapa`: `Decir la mía →`
- **Sin cifras, sin ♥, sin comentarios, sin tags** — Decisiones 12 y 16.
- **Sin video ASCII** — Decisión 18.

## Rutas, redirects y resolución de slugs

- **Canónicas nuevas:** `/bitacora` y `/bitacora/:slug`. `App.tsx` se modifica
  (sancionado: rutas nuevas, patrón `/sembrar` 2.5 y `/biblioteca` 3.1).
- **`/manifiesto` no cambia de ruta.** Solo entra a `PAPEL_ROUTES`.
- **`/blog` → `<Redirect to="/bitacora" replace />`.**
- **`/blog/escribir` queda ANTES del redirect de `/blog/:slug`** en el `<Switch>` (wouter
  matchea en orden) — la herramienta de autoría sobrevive intacta.
- **`/blog/:slug` → `<Redirect to={'/bitacora/' + slug} replace />`**: cambia el camino,
  no el slug.
- **La resolución vive en un solo lugar, el lector:** canónico → renderiza · legado →
  `<Redirect to={'/bitacora/' + canónico} replace />` · desconocido → 404 expediente.
  Una URL vieja del todo (`/blog/el-cristo-que-llevs-dentro`) hace dos saltos `replace`
  invisibles y aterriza en `/bitacora/el-cristo-que-llevas-dentro`.
- **`PAPEL_ROUTES`:** `+ '/manifiesto'`, `+ '/bitacora'`, `+ '/blog'` (para que el frame
  del redirect no muestre chrome v1). **`PAPEL_PREFIXES`:** `+ '/bitacora/'`,
  `+ '/blog/'`, con una excepción explícita para `/blog/escribir` (Decisión 11). Flip al
  final, **estado interino aceptado** (orden 2.3/2.4/2.5/3.1).
- **Chrome:** cero cambios en `papel-nav.ts`, `PapelHeader`, `PapelFooter` (ninguno
  linkea `/blog` ni `/manifiesto`).
- **La biblioteca (3.1) cobra su deuda:** `HREF_BITACORA` pasa de `/blog` a `/bitacora` y
  `hrefCronica` a `/bitacora/${slug}` — las dos constantes que 3.1 dejó comentadas
  «3.4 →», y su test. **Nada más de esa página se toca**; en particular la card del
  manifiesto sigue sin cifras (Decisión 8).
- **SEO/OG:** se cablean en 8.1 con el resto del sitio. Estas páginas no agregan `<head>`.
  El redirect permanente de `/blog/*` a nivel servidor/hosting también es 8.1: acá el
  redirect es de cliente y ya cubre a cualquiera que llegue.

---

## Estados mudos (§10.9)

Las dos páginas son build-time (`?raw` y `import.meta.glob` eager): **no hay carga, no
hay error de red, no hay skeleton**. Si un registry estuviera vacío el build está roto y
lo ataja el test, no la UI. Sin filtros no hay «Nada con ese filtro». Los estados con voz
son cuatro:

- **404 del lector de crónica:** kicker `expediente extraviado`, H1 Anton
  `Esa crónica no está.`, `Sello color="rojo"` rotado con `Extraviado`, CTA
  `BotonPapel variant="tinta"` → `Volver a la bitácora →`.
- **Bitácora vacía:** `Todavía no hay crónicas. Cuando pase algo, se cuenta acá.`
- **Manifiesto sin partes** (forma futura imprevista): se muestra el texto completo como
  apertura, sin sumario y sin anclas. Nada se pierde, nada se anuncia.
- **Campos ausentes:** sin `category` no hay etiqueta; sin `readingMinutes` no hay tramo
  de minutos; sin `summary` el pliegue muestra solo el link. **Nada se rellena.**

## Accesibilidad

- **Manifiesto:** un `<h1>` (título izado) · un `<h2>` por parte con el encabezado real ·
  los `<h3>`+ que traiga el MDX. El sumario es un `<nav>` con `aria-label`; sus links son
  `<a href="#…">` reales (tabulables, funcionan sin JS) y cada `<section>` lleva
  `scroll-mt-20` para no quedar debajo del header sticky. El sello vive en un
  contenedor `role="status"` con texto legible («Leído entero»), anunciado una sola vez.
- **Bitácora índice:** un `<h1>` · `<h2>` por año (mono, visualmente pequeño: mismo
  criterio de inversión semántica/visual ya shipeado en 2.4 y 3.1) · filas expandibles
  `<button aria-expanded aria-controls>` con panel `id` y glifo `aria-hidden` (contrato
  de la primitiva).
- **Lector de crónica:** un `<h1>`; los `<h2>`/`<h3>` son del cuerpo. La cadena es un
  `<nav>`; la línea `más reciente`/`más antigua` va **dentro** del link, así que forma
  parte de su nombre accesible.
- **Targets ≥ 44px:** filas del sumario y del índice, links del pliegue, backlinks,
  cadena, botones.
- **Foco:** violeta 2px global (`papel-root`). Orden de tabulación del manifiesto:
  backlink → sumario (1…{N}) → links del cuerpo → CTA.
- **Sellos:** `Leído entero` (verde) y el `Extraviado` del 404 — ambos con texto real
  legible por AT.
- **Reduced motion:** guarda global de `index.css` — `inkfill`, `vpop`, `fadeup` y
  `stampin` quedan en estado final: la página nace completa y el sello aparece sin caer.
- **AA:** tinta/tinta-90/tinta-75 sobre papel; papel y `oscuro-secundario` sobre tinta;
  violeta solo en accionables y kickers; verde solo en el sello (borde + texto, sobre
  papel); tinta-50 en metadatos; tinta-30 solo en numeración y en la línea
  `más reciente`/`más antigua` (no esencial: el link siempre dice el título).
- **Impresión accesible:** el orden del DOM es el orden de lectura; el folio es la
  primera línea impresa.

## Móvil (<560px)

- Una columna, padding lateral 20, targets ≥ 44px.
- Manifiesto: H1 baja por `clamp`; el sumario ocupa el ancho, las filas mantienen el
  encabezado completo (nunca se trunca); las partes conservan su borde superior; la card
  de cierre apila título y botón.
- Bitácora: la grilla de la fila baja a `44px_1fr_32px` (comportamiento de la primitiva);
  la meta line (`fecha · categoría`) envuelve sin desbordar; la cadena cronológica apila
  los dos eslabones.

## Lecturas de la ley (sin enmienda)

1. **Conteos en prosa no son «prensa de datos».** §10.6/§13 mandan palitos para conteos
   < 100. Se lee —y ya se shipeó así en 2.4 y 3.1— que eso rige para **figuras de
   datos** (una cifra que se muestra como dato), no para números interpolados dentro de
   una frase o de una línea de metadatos («{N} partes», «21 crónicas», «12 min»). Si
   algún día la bitácora muestra métricas de lectura, ahí sí: palitos, y sin porcentajes
   con N < 100.
2. **§10.5 no legisla persistencia.** El catálogo dice cuándo cae cada sello, no cuánto
   dura. Se elige efímero, por las razones de la sección 1.
3. **§10.7 identifica los disparadores del despertar por su etiqueta.** Por eso el CTA de
   estas páginas dice `Soltar mi voz en el mapa` / `Decir la mía` y **no** «Dejar mi voz
   en el mapa»: no se agrega un disparador nuevo a un catálogo cerrado, y no se reusa la
   etiqueta de uno canónico para algo que no despierta.

## Enmiendas a la ley

**Ninguna.** El sello LEÍDO ENTERO ya está en el catálogo §10.5 y se usa exactamente
donde la ley lo pone; la edición impresa ya está legislada (§10.8) y su patrón existe
desde 2.4; la fila expandible está legislada desde 2.4; §8 ya nombra la bitácora como
parte de la biblioteca y la ruta `/bitacora` la honra; el estado «cifra que todavía no
existe» ya tiene respuesta en la directiva de datos del master plan: no se muestra.

## Decisiones

1. **El sello LEÍDO ENTERO cae cuando la firma del documento entra en viewport al 60%**,
   una sola vez, con el `IntersectionObserver` ya shipeado para el `VISTO` del mandato.
   Es el único documento del sitio que §10.5 nombra.
2. **El sello es efímero:** sin `localStorage`, sin endpoint, sin contador, sin XP, sin
   insignia, sin barra de progreso, sin impresión, sin bloquear el CTA. Un logro sin
   tabla es un dato inventado; el gesto se confirma y se termina ahí.
3. **Sello verde** (§2: verde = logrado / compromiso), rotación −4 por defecto — el
   precedente exacto es el `VISTO`, el otro sello de documento consumido.
4. **El manifiesto se parte por sus propias costuras:** corte SOLO en `## `, encabezados
   izados verbatim, título del cuerpo izado a H1 de página. La verbatimidad es una
   igualdad de strings testeada, no una promesa; sin `## ` la página muestra todo y no
   dibuja sumario.
5. **El manifiesto es la única página con navegación interna** (sumario de {N} partes):
   se numera a sí mismo, es la puerta de entrada de los que llegan de cero, y el sello
   obliga a responder «cuánto falta» sin barra de progreso. Las filas del sumario son
   `<a href="#…">` nativos compuestos con la receta §5 — la primitiva `FilaIndice`
   envuelve el `Link` de wouter y enrutaría en vez de anclar.
6. **Cada diferencia con el lector de ensayo está justificada en la tabla de arriba**;
   todo lo que no aparece ahí es idéntico a 3.2 a propósito: misma medida, misma
   edición impresa, mismo 404, misma card de cierre.
7. **El manifiesto no muestra minutos.** Su frontmatter no trae `readingMinutes` y
   estimarlos a X palabras por minuto sería una cifra inventada. Revival de una línea:
   si el autor agrega `readingMinutes:` al frontmatter, el kicker gana su tramo, igual
   que los ensayos.
8. **No se agrega ninguna cifra a la card del hub.** 3.1 dejó abierto («si 3.3 construye
   el registry, puede sumarla»): se declina. El conteo de partes sirve dentro del
   documento, no en la invitación, y una conversación es una página — de 3.1 se tocan
   **solo** los dos hrefs que ella misma dejó marcados para 3.4.
9. **Los slugs se reparan con la regla mínima:** el mismo slug de v1 con los acentos
   transliterados en vez de borrados. 17 de 22 cambian; el `slug` del frontmatter es la
   fuente de verdad y el nombre del archivo lo sigue (`git mv`). Los cuerpos no se tocan.
10. **Nada 404ea: el rastro lo declara el contenido.** `legacySlugs` (array opcional,
    nuevo en `blogFrontmatterSchema`) guarda la dirección vieja; el registry lo expone
    (`findBlogPostByLegacySlug`) y la resolución vive **solo** en el lector, que redirige
    con `replace`. `/blog/:slug` solo cambia el camino. Alternativa descartada: una tabla
    de redirects a mano en el código — duplicaría un dato que el contenido puede declarar.
11. **`/blog/escribir` sobrevive:** va antes del redirect en el `<Switch>` y queda
    excluida del prefijo papel con una excepción explícita y testeada en `esRutaPapel`.
    Es una herramienta de plataforma (Fase 5): darle chrome papel sería mentirle al ojo.
12. **Cero cifras de post.** No hay filas en `blog_posts`, la API direcciona por `id`
    numérico y el hilo del v1-port devuelve 400: se borra sin regresión. Revival exacto:
    fila por slug + `GET /api/blog/posts/:slug` (ya devuelve contadores e `id`), y ahí
    manda §13 — palitos bajo 100, ningún porcentaje con N < 100.
13. **Los únicos números visibles se derivan del contenido:** `PARTE_COUNT`,
    `CRONICA_COUNT`, conteo por año, `readingMinutes`, fechas. Ningún literal de conteo
    en el JSX.
14. **`category` se muestra crudo, sin color y sin filtros.** El color significa tipo de
    voz (§7) y un tema de blog no es una voz; y con 16 categorías sobre 22 crónicas —12
    de ellas con un solo texto— una barra de chips filtraría de 22 a 1: el índice
    completo y visible es mejor herramienta que su filtro. Misma vara que 2.4 y 3.1.
15. **El índice se agrupa por año, descendente.** La cronología es el eje real de una
    bitácora y sale de `publishedAt`; el rótulo del grupo es el año, no un nombre
    inventado.
16. **Sin tags en ninguna superficie.** Existen en el frontmatter, pero no hay páginas de
    tag: no se muestra una taxonomía que no lleva a ningún lado.
17. **`type` se marca solo si deja de ser constante:** si algún día entra un `vlog`, la
    fila lo marca con el mismo mecanismo que el `acta` de 3.1. Hoy los 22 son `blog` y no
    se muestra nada.
18. **El video ASCII no se cablea.** Condición de activación, completa: (a) los `.mp4` /
    `.jpg` / `.vtt` existen bajo `apps/web/public/media/ascii-videos/` — hoy no existe
    ninguno en todo el disco; (b) `asciiVideoRegistry.generated.ts` se **regenera** con
    `scripts/media/generate_ascii_video_registry.py` (deriva la clave del `slug` del
    frontmatter, así que después de la reparación las 20 claves actuales quedan
    obsoletas); (c) el componente se rehace en papel — hoy trae `rounded-lg`, sombras,
    `bg-black`, `text-cyan-200` y seis íconos lucide decorativos, todo prohibido por §12
    y §9b en una página editorial. Con las tres cumplidas, el cableado es una línea en el
    lector, entre la bajada y el cuerpo: `<CronicaVideoAscii slug={post.slug} />`.
19. **Una firma por página** (§6, techo no cuota): manifiesto = el sello · índice de
    bitácora = el pliegue (misma afordancia que la biblioteca, porque es el mismo gesto:
    hojear) · lector de crónica = ninguna, un documento se lee quieto (3.2, D18).
20. **Nombres de archivo:** `pages/Bitacora.tsx` + `pages/Bitacora/` y
    `pages/BitacoraDetail.tsx` — nombrados por la ruta para no chocar con «la crónica del
    país que viene» (3.6, `/cronica`, `cronica-registry.ts` ya existente).
21. **Cero primitivas nuevas, cero CSS, cero dependencias, cero endpoints.**
    `FilaIndiceExpandible`, `MdxPapel`, `Kicker`, `RitoTinta`, `Sello`, `BotonPapel`,
    `BandaCta`. La receta de fila/etiqueta se repite inline donde hace falta (§9b: repetir
    antes que abstraer).
22. **Cero íconos** (§12): glifos `+ − → ← §` y nada más.

## Deuda observada (fuera de alcance, anotada)

- El texto del manifiesto usa comillas rectas (`"Yo soy"`) donde §3 pide angulares. Es
  texto keystone: se respeta. Cambiarlo es una decisión de autor, no de esta página.
- `publishedAt` de las 21 crónicas migradas es sintético («staggered weekly» en
  `scripts/content/blog-sources.ts`). La página muestra lo que el frontmatter declara; si
  las fechas reales aparecen, se corrigen en el contenido y la página no cambia.
- `scripts/content/migrate-blog-v1-to-v2.ts` es idempotente por nombre de archivo: tras
  la reparación, volver a correrlo resucitaría los archivos viejos. La cabecera del
  script queda marcada como cerrada y `verify-blog-migration.ts` aprende a resolver por
  `legacySlugs` (Task 4 del plan).
- `BlogAuthor` (`/blog/escribir`) sigue con chrome v1 hasta la Fase 5.

## Definición de terminado (protocolo por página)

- [ ] **Manifiesto:** kicker + H1 con rito sobre el título del propio texto + apertura
      verbatim + sumario de {N} partes + {N} secciones ancladas con encabezado verbatim +
      firma + CTA al mapa.
- [ ] **El sello LEÍDO ENTERO** cae al llegar a la firma, una sola vez, sin persistencia,
      sin contador y sin imprimirse; con reduced-motion aparece sin animación.
- [ ] Verbatim probado por igualdad de strings (apertura + fuentes de las partes === el
      cuerpo), no por inspección.
- [ ] **Bitácora índice:** las {M} crónicas navegables, agrupadas por año real, con
      pliegue de `summary` real, minutos reales y categoría cruda; una sola fila abierta.
- [ ] **Lector de crónica:** kicker con categoría/fecha/minutos, H1 con rito, bajada,
      cuerpo **verbatim**, firma, cadena cronológica con aviso `más reciente`/`más
      antigua`, cierre al mapa, 404 expediente EXTRAVIADO.
- [ ] **Slugs reparados:** 22 slugs canónicos (test que compara contra la función, no
      contra literales), `legacySlugs` declarados, ninguna URL vieja 404ea (probado en
      navegador desde `/blog/{slug viejo}`).
- [ ] **Cero cifras de post** en cualquier superficie: sin vistas, sin likes, sin
      comentarios, sin «0».
- [ ] Edición impresa en los dos lectores: `.edicion-impresa` + folio, navegación y
      sello con `print:hidden`, título en tinta (no gris) — verificada con captura.
- [ ] Rutas: `/bitacora` y `/bitacora/:slug` en `App.tsx`; `/blog` y `/blog/:slug`
      redirigen; `/blog/escribir` intacta; `/manifiesto` intacta; `PAPEL_ROUTES` y
      `PAPEL_PREFIXES` al día con la excepción de `/blog/escribir`; `Blog.tsx` y
      `BlogPostDetail.tsx` borrados; `HREF_BITACORA`/`hrefCronica` de 3.1 apuntando a la
      bitácora.
- [ ] Responsive: 1 columna, padding 20, targets ≥ 44px, títulos completos.
- [ ] Voseo consistente; «comillas angulares»; sin «registrate/únete»; cero íconos.
- [ ] Archivos ≤ 300 LOC (composer + `sections/` + data + lectores).
- [ ] Tests: parser del manifiesto (verbatim, partes, ids, degradación) · lector del
      manifiesto (sumario, anclas, print, sello con observer falso) · slugs canónicos y
      legados · derivadas de la bitácora (años, vecinos, resolución) · índice (pliegue
      único, links, vacío) · lector de crónica (kicker, cuerpo, cadena, 404, redirect de
      legado) · rutas papel (incluida la excepción `/blog/escribir`).
- [ ] `pnpm verify` verde.
- [ ] Verificación en navegador desktop + mobile con capturas (incluye print preview y
      reduced-motion).
