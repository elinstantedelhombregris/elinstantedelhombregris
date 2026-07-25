# La biblioteca «Papel y Tinta» — páginas 3.1 y 3.2

**Fecha:** 2026-07-24
**Fuente de diseño:** `docs/design-system/BASTA-v2.dc.html` (pantallas `data-screen-label="La biblioteca"` y `data-screen-label="Ensayo"`)
**Sistema:** `docs/design-system/README.md` v1.1 (ley) · cards 3.1 y 3.2 del master plan `docs/plans/2026-07-21-papel-y-tinta-master-plan.md`
**Plan de implementación:** `docs/plans/2026-07-24-la-biblioteca-plan.md`

> **Tesis de copy.** A `/biblioteca` llega el que ya vio el mapa, el mandato y los
> planes y quiere saber de dónde sale todo eso — ¿hay pensamiento atrás o son consignas?
> La página tiene un solo trabajo: mostrarle que está TODO publicado, entero y gratis,
> y darle una puerta por la que entrar hoy: el manifiesto si viene de cero, un ciclo de
> ensayos si viene a pensar, la bitácora si viene a ver qué pasó. Se va leyendo algo —
> y al final de lo que lea, la página le pide lo único que le puede pedir: que deje de
> leer y diga la suya en el mapa.

## Por qué

`/ensayos` hoy es un puerto v1: header serif con `gradient-text`, cards `glass`
redondeadas agrupadas por serie, e `/ensayos/:slug` renderiza el cuerpo con
`MdxContent` (`prose-invert`, Playfair, `iris-violet`) y dos botones shadcn. Son
**textos keystone** —tres ciclos que sostienen todo el discurso del movimiento—
servidos con el chrome que la ley prohíbe.

El diseño BASTA v2 los convierte en lo que son: **una biblioteca abierta**. Un hub de
1100px que lista todo lo publicado sin paywall ni registro, y un lector de 800px donde
un ensayo se lee como se leía en papel: título entintado, cuerpo verbatim, firma del
autor, la cadena del ciclo al pie y una edición impresa que sale perfecta.

Esta página también estrena una figura del programa que no existía: **el hub de la
Fase 3**. Los lectores de bitácora (3.4), entrenamientos (3.5) y crónica (3.6) llegan
después. Cómo se comporta un hub cuyos hijos todavía no nacieron es el problema de
diseño central de 3.1, y se resuelve abajo sin una sola pantalla de humo.

## El problema de diseño central: un hub que no promete lo que no puede abrir

### El hallazgo: tres destinos vivos y uno que no existe

Verificado 2026-07-24 sobre `App.tsx` y `content/`:

| Sección del especimen | Destino hoy | Estado |
|---|---|---|
| Manifiesto destacado | `/manifiesto` (v1-port, navegable) | **Vivo.** 3.3 lo rediseña; la ruta no cambia. |
| Ensayos (3 ciclos) | `/ensayos/:slug` | **Vivo y rehecho acá** (página 3.2). |
| Bitácora | `/blog` + `/blog/:slug` (v1-port, navegable) | **Vivo.** 3.4 lo muda a `/bitacora`; un solo `href` cambia. |
| Entrenamientos | **nada** | 31 cursos / 329 lecciones en `content/courses/` **sin una sola superficie**. `/entrenamientos` no existe: linkear ahí es un 404. |

### La regla que la ley sí sanciona

§10.9 legisla **vacíos, cargas y errores** — «Todavía no hay voces acá. Qué
oportunidad.». Ninguno de los tres describe esta situación: no es que la sección esté
vacía, es que su lector todavía no se construyó. §5 tampoco tiene un estado
«próximamente»: el catálogo de estados es deshabilitado / cargando / error / éxito.
**La ley no sanciona el teatro del "muy pronto", así que no se hace.**

### La decisión: se especifica entera, se monta con su lector

La sección de entrenamientos queda **completamente especificada acá** (copy, layout,
regla de curación, contrato de datos: ver «§5 — Entrenamientos») y **se monta como
última tarea de 3.5**, la fase que construye el catálogo y los lectores de curso. Es el
mecanismo ya sancionado por este programa: la card 2.0 retiró el tile «semillas
plantadas» de la portada con la promesa de volver en 2.5, y volvió en 2.5 como sweep
final con test. Mismo patrón, mismo rigor.

En consecuencia, el hub del día uno tiene cuatro secciones con destino vivo —portada,
manifiesto, ensayos, bitácora— y una banda de cierre. **No hay hueco visible, no hay
título huérfano, no hay botón muerto.** Lo único que cambia cuando 3.5 monte su
sección es una frase del lead (marcada abajo, carácter por carácter) y el orden de las
secciones: entrenamientos entra entre ensayos y bitácora, como en el especimen.

### Los destinos que cambian de fase (un solo lugar)

`pages/Biblioteca/biblioteca-data.ts` centraliza los `href` que van a mudarse, con el
comentario que dice a qué fase pertenecen. 3.4 cambia una constante y nada más:

```ts
/** Destinos que cambian cuando su fase ship. Hoy apuntan a la superficie que EXISTE. */
export const HREF_MANIFIESTO = '/manifiesto'; // 3.3 lo rediseña; la ruta NO cambia.
export const HREF_BITACORA = '/blog'; //         3.4 → '/bitacora'
export const hrefCronica = (slug: string) => `/blog/${slug}`; // 3.4 → `/bitacora/${slug}`
```

Precedente exacto: `SEMBRAR_HREF` en `papel-nav.ts` (2.5).

## Los datos: todo sale del registry, nada se inventa

`ENSAYOS` (`lib/ensayos-registry.ts`, build-time con `import.meta.glob` eager) expone
por ensayo: `slug`, `title`, `subtitle`, `summary`, `series`, `orderIndex`,
`publishedAt`, `readingMinutes`, `form` (`'ensayo' | 'acta'`) y `body`. Verificado
2026-07-24 sobre los 21 archivos de `content/ensayos/`.

**Hallazgo 1 — los ciclos son metadato real.** A diferencia de los planes (2.4: sin
campo de categoría → sin chips), el ensayo **sí** trae `series`, y el schema Zod la
documenta como el eje de lectura: *«Ensayos belong to a series … Series + orderIndex
together form the natural reading flow»* (`packages/shared/src/content/frontmatter.ts`).
Agrupar por ciclo no inventa taxonomía: la lee. Lo único autoral es el **rótulo**
(`primer-ciclo` → «Primer ciclo») y la línea de descripción de cada ciclo — prosa
sobre contenido que existe, verificable leyendo los siete ensayos.

**Hallazgo 2 — el acta también es metadato real.** `form: 'acta'` existe en el schema y
hay exactamente una (`acta-de-la-interdependencia`, cierre del tercer ciclo). El hub la
marca y el lector la nombra. Ningún otro rasgo del ciclo se inventa.

**Hallazgo 3 — el registry ordena mal para esta página.** `buildRegistry()` ordena por
`orderIndex` global: con tres ciclos de 1..7 los ensayos quedan **intercalados**
(tres «01», tres «02»…). El hub y el lector no consumen `ENSAYOS` crudo: consumen
`CICLOS` y `ORDEN_DE_LECTURA`, derivados en `biblioteca-data.ts`. El registry **no se
toca** (lo consume también el test de contenido que vive en `lib/__tests__/`).

**Las derivaciones (todas puras, todas testeadas):**

| Derivada | Regla | Hoy |
|---|---|---|
| `CICLOS` | agrupa por `series`; dentro, ordena por `orderIndex` | 3 grupos de 7 |
| orden de los ciclos | por el `publishedAt` más antiguo del grupo; desempate por `series` | primer-ciclo (abril) → indagaciones (abril) → interdependencia (julio) |
| ordinal romano | posición en ese orden (`I`, `II`, `III`…) | I / II / III |
| `ENSAYO_COUNT` | `ENSAYOS.length` | 21 |
| `CICLO_COUNT` | `CICLOS.length` | 3 |
| fecha del ciclo | `publishedAt` más antiguo, `es-AR` `{month:'long', year:'numeric'}` | «abril de 2026» / «julio de 2026» |
| `ORDEN_DE_LECTURA` | concatenación de los ciclos en orden | 21 ensayos, plano |
| `CRONICA_COUNT` | `BLOG_POSTS.length` | 20 (22 al cerrar 3.7) |

**Ningún literal numérico en el JSX.** «21», «3», «20» no se escriben: se interpolan.
Los únicos números literales del código son **topes de display** (cuántas crónicas
muestra el hub, cuántos entrenamientos curados), que no afirman nada sobre el contenido
y viven en constantes comentadas junto a la ley que las fija.

## Ruta y navegación

- **Canónica nueva:** `/biblioteca`. No existe en `App.tsx` — **modificarlo está
  sancionado** (ruta nueva, no hay otra forma; precedente exacto: `/sembrar` en 2.5).
- **`/ensayos`:** el índice se pliega en el hub (master plan, card 3.2) →
  `<Route path="/ensayos"><Redirect to="/biblioteca" replace /></Route>`, patrón ya
  shipeado de `/la-vision`. `Ensayos.tsx` y su lazy se borran.
- **`/ensayos/:slug` sigue siendo canónica** para el lector: la URL ya es pública, el
  ensayo tiene sustantivo propio y anidarlo bajo `/biblioteca/...` no compra nada y
  rompe links. `EnsayoDetail.tsx` se reescribe in-place (named + default export
  intactos).
- **`PAPEL_ROUTES`:** `/biblioteca` y `/ensayos` al Set (el segundo para que el frame
  del redirect no muestre chrome v1) + `/ensayos/` a `PAPEL_PREFIXES`. Flip al final,
  **estado interino aceptado** (mismo orden que 2.3/2.4/2.5).
- **Chrome (sweep sancionado, diff mínimo):** `papel-nav.ts` — el item «La biblioteca»
  (num `05`) pasa de `/ensayos` a `/biblioteca`. Cero cambios en `PapelHeader`/
  `PapelFooter` (consumen la constante; su test itera `PAPEL_NAV`).
- **Fuera de alcance, cubierto por el redirect:** `ApoyaAlMovimiento.tsx:25` linkea
  `/ensayos`. Es una página v1-port de la Fase 4.1; el redirect la deja funcionando y
  no se toca (una conversación = una página).
- **SEO/OG:** título «La biblioteca — ¡BASTA!» y el del ensayo salen del frontmatter;
  se cablean en 8.1 con el resto del sitio. Esta página no agrega `<head>`.

**Lo que muere / se transforma (inventario v1-port):**

| Feature v1-port | Destino |
|---|---|
| `Ensayos.tsx`: header serif «Pensamiento de fondo.» + cards `glass` redondeadas | **Muere entero.** El archivo se borra; su trabajo lo hace `/biblioteca`. |
| `Ensayos.tsx`: `SERIES_LABELS` (mapa de rótulos) | **Se transforma:** el concepto sobrevive en `biblioteca-data.ts` con rótulos, descripciones y orden derivado. |
| `Ensayos.tsx`: chip «Acta» con `iris-violet` y `rounded-full` | **Se transforma:** marca mono cuadrada en la fila del índice y en el kicker del lector. |
| `EnsayoDetail.tsx`: `MdxContent` + `Button` shadcn + «← Todos los ensayos» | **Muere.** Cuerpo a `MdxPapel` (2.4), navegación a la cadena del ciclo. `MdxContent` NO se toca: lo consumen manifiesto y bitácora hasta 3.3/3.4. |
| `EnsayoDetail.tsx`: 404 «Ese ensayo no existe.» | **Se transforma** en 404 expediente §5 (kicker `expediente extraviado` + sello EXTRAVIADO). |
| Línea «{min} minutos de lectura» suelta arriba del cuerpo | **Se transforma:** el dato entra al kicker del lector y al link del pliegue. |

---

# Página 3.1 — el hub (`/biblioteca`)

Página papel estándar (chrome de `RootLayout`), contenedor `max-w-[1100px]` (§4,
documentos/índices), padding lateral 40/20. **Toda la prosa de abajo es el copy final —
el implementador la transcribe tal cual.** `{N}` = `ENSAYO_COUNT`, `{C}` =
`CICLO_COUNT`, siempre interpolados.

## § 1 — Portada

- Kicker violeta: `La biblioteca · leer también es hacer`
- H1 Anton `clamp(44px,6vw,88px)` con rito de la tinta (`RitoTinta`, dos líneas):

  > **Papel, tinta**
  > **y método.**

- Lead (Archivo 17px, tinta-75, max-width 620):
  `Todo lo que el movimiento piensa está publicado entero: el manifiesto, {N} ensayos en {C} ciclos y la bitácora de lo que va pasando. Sin paywall, sin registro. Robate todo.`

  **Cuando 3.5 monte su sección**, y solo entonces, el lead pasa a:
  `Todo lo que el movimiento piensa está publicado entero: el manifiesto, {N} ensayos en {C} ciclos, los entrenamientos y la bitácora de lo que va pasando. Sin paywall, sin registro. Robate todo.`

## § 2 — El manifiesto destacado

Card oscura de ancho completo (`bg-tinta text-papel`), link entero a `/manifiesto`,
`flex` con `flex-wrap`, gap 32, padding 36/40 (24 móvil). Hover: `-translate-y-0.5`
(mismo gesto que el botón papel).

- **Etiqueta** (receta de tag §5 sobre oscuro, sin rotar: borde 1px violeta-claro,
  texto violeta-claro, mono 11px bold uppercase, `white-space:nowrap`):
  `Documento fundacional`
- **Título** (h2 Anton `clamp(24px,3vw,36px)`): `El manifiesto del hombre gris`
- **Línea** (14px, `oscuro-secundario`): `No es un programa: es un espejo. Si algo te resuena, ahí empieza.`
- **Glifo de acción** (mono 13px bold uppercase violeta-claro, al final):
  `Leerlo entero →`

**Sin cifras.** El especimen dice «Seis partes, cinco minutos»: el manifiesto no tiene
registry y un número hardcodeado está prohibido por la directiva de datos. Si 3.3
construye el registry del manifiesto, puede sumar la cifra derivada.

**La etiqueta no es un sello.** Es un tag §5 (cuadrado, sin rotación): el catálogo de
sellos está cerrado (§10.5) y «Documento fundacional» no está en él. Ver Decisión 2.

## § 3 — Los ensayos (el corazón del hub)

- Encabezado de sección (h2 visualmente mono 11px uppercase tinta-50):
  `Ensayos · {C} ciclos · tocá para abrir`
- **Por cada ciclo, en el orden derivado:**
  - Línea mono 11px uppercase tinta-50, sobre borde superior 2px tinta, padding 22/0:
    `Ciclo {romano} · {n} ensayos · {mes de} {año}` → hoy «Ciclo I · 7 ensayos · abril
    de 2026», «Ciclo II · 7 ensayos · abril de 2026», «Ciclo III · 7 ensayos · julio de
    2026».
  - Título del ciclo (h3 Anton `clamp(24px,3vw,34px)`): el rótulo.
  - Descripción (14px tinta-50, max-width 640).

  | `series` | Rótulo | Descripción |
  |---|---|---|
  | `primer-ciclo` | `Primer ciclo` | `La arquitectura de la república: por qué el poder concentrado falla y qué se construye en su lugar.` |
  | `indagaciones` | `Indagaciones` | `Las condiciones de adentro: obediencia, miedo, identidad prestada — lo que hay que desarmar para que lo de afuera aguante.` |
  | `interdependencia` | `Interdependencia` | `Escrito para un 9 de julio: de qué está hecha una nación, qué cortó el bisturí de 1816 y qué se firma sin papel.` |
  | *(cualquier otra)* | el `series` tal cual | *(sin descripción)* |

  El fallback no es decorativo: si mañana aparece un ciclo nuevo, **el hub lo muestra
  igual** con su slug crudo — un ensayo no se pierde nunca por falta de rótulo.

  - **Las filas:** una `FilaIndiceExpandible` (§5, primitiva de 2.4) por ensayo,
    numeradas `01`…`07` **dentro del ciclo** (`orderIndex`).
    - **Fila (cerrada):** num mono 12 tinta-30 · título Archivo 17px `font-semibold`
      (+ marca `acta`, ver abajo) · glifo `+` mono tinta-50.
    - **Fila (abierta):** el título pasa a violeta, el glifo a `−` violeta.
    - **Marca de forma** (solo si `form === 'acta'`): junto al título, mono 10px
      uppercase tinta-50, borde 1px tinta-30, padding 2/6: `acta`.
    - **Panel (el pliegue):** el `summary` del frontmatter entre comillas angulares
      (16px tinta-90, max-width 640, `text-wrap:pretty`) — **dato real, jamás
      reescrito acá** — y link mono 12 bold uppercase violeta:
      `Leer el ensayo completo · {min} min →` · para el acta:
      `Leer el acta completa · {min} min →` · si `readingMinutes` es 0 (hoy no pasa,
      los 21 lo traen), sin el tramo de minutos.
    - **Una sola fila abierta en toda la página** — abrir una en el Ciclo III cierra la
      del Ciclo I. Se hojea la biblioteca, no se despliega.
- **Sin filtros, sin búsqueda, sin paginación** (misma vara que 2.4): 21 filas en tres
  grupos entran en pantalla y el índice completo siempre visible **es** la postura de
  la página. La única taxonomía que se muestra es la que el frontmatter trae.
- Responsive <560: la grilla de la fila baja a `44px_1fr_32px` (comportamiento de la
  primitiva); el título nunca se oculta.

## § 4 — La bitácora

- Encabezado (fila `flex justify-between` con wrap):
  - izquierda, h2 mono 11px uppercase tinta-50: `Bitácora · lo que va pasando`
  - derecha, link mono 12px bold uppercase violeta a `HREF_BITACORA`:
    `Ver la bitácora entera · {CRONICA_COUNT} crónicas →`
- **Las últimas `{M}` crónicas** (`BLOG_POSTS` ya viene ordenado por `publishedAt`
  descendente; `M = 4`, tope de display del especimen). Cada una es un link a
  `hrefCronica(slug)` con borde superior 1px tinta, padding 24/8, hover
  papel-presionado:
  - fila mono 11px uppercase: fecha (`es-AR`, `{day:'numeric',month:'long',year:'numeric'}`)
    tinta-50 · etiqueta de categoría (mono 11px bold uppercase, borde 1px tinta,
    padding 3/8) con el `category` del frontmatter **tal cual**;
  - título 20px `font-bold`;
  - `summary` 15px tinta-75, max-width 680;
  - glifo mono 12px bold uppercase violeta: `Leer la crónica →`.
- **La etiqueta no se pinta.** El especimen le da un color por tema: en este sistema el
  color significa **tipo de voz** (§7, seis colores fijos) y un tema de blog no es una
  voz. Etiqueta neutra, texto real (Decisión 12).
- **Muere el asterisco.** El especimen rotula la bitácora con `* datos de
  demostración`: las crónicas son MDX reales. Ningún `NotaDemo` en esta página.
- **Vacío** (§10.9, hoy imposible — build-time con 20 archivos):
  `Todavía no hay crónicas. Cuando pase algo, se cuenta acá.`

## § 5 — Entrenamientos (especificado acá, **se monta en 3.5**)

No se implementa en 3.1: `/entrenamientos` no existe y linkear a un 404 es exactamente
la clase de promesa vacía que este sistema no hace. Queda especificado entero para que
3.5 lo monte sin decisiones de diseño pendientes, **entre § 3 y § 4**, como última
tarea de esa fase.

**Contrato de datos que 3.5 debe producir** (`lib/courses-registry.ts`, build-time
sobre `content/courses/*/course.json`, verificado 2026-07-24: 31 cursos, 329 lecciones,
`isPublished` true en los 31): por curso `slug`, `title`, `excerpt`, `category`,
`level` (`beginner|intermediate|advanced`), `duration` (minutos), `orderIndex`,
`isFeatured`, `leccionesCount` (`lessons.length`) — más `CURSO_COUNT`.

**Regla de curación (D4, sin lista hardcodeada de slugs):** los **primeros 6
`isFeatured` por `orderIndex`**. `isFeatured` es el campo de curación real del
contenido (15 de 31 lo tienen) y `orderIndex` es el recorrido canónico del autor: la
intersección da la puerta de entrada natural. Si algún día hubiera menos de 6
destacados, la grilla muestra los que haya — nunca se rellena.

**Copy y layout (banda `bg-papel-crudo`, borde superior e inferior 1px tinta):**

- Kicker violeta: `Entrenamiento · el ojo se educa`
- H2 Anton `clamp(30px,3.6vw,48px)`, dos líneas:
  > **Para diseñar un país,**
  > **primero entrená la mirada.**
- Lead (15px tinta-50, max-width 560):
  `Guías cortas, en criollo, sin jerga. Cada una termina en algo que podés hacer esta semana.`
- Grilla de 3 (1 columna <960) con juntas de 1px tinta (§4): por curso, celda
  `bg-papel-crudo`, padding 26/24, min-height 200, hover `bg-papel`:
  - fila mono 10px uppercase: nivel (`inicial` / `intermedio` / `avanzado` — rótulos
    del enum real) en `font-bold` · `{duration} min` tinta-50;
  - título Anton 25px;
  - `excerpt` 14px tinta-75;
  - al pie, mono 12px violeta: `{leccionesCount} lecciones · Empezar →`.
- Link final mono 12px bold uppercase violeta a `/entrenamientos`:
  `Ver los {CURSO_COUNT} entrenamientos →`
- Y el lead de § 1 pasa a su variante con entrenamientos (arriba, carácter por
  carácter).

## § 6 — Cierre

`BandaCta fondo="tinta"` con una fila `flex justify-between` (wrap):

- h2 Anton `clamp(30px,4vw,52px)`: `Leíste. Ahora decí.`
- `BotonPapel variant="violeta" surface="oscuro"` envuelto en `Link` a `/el-mapa`:
  `Soltar mi voz en el mapa →`

La biblioteca no compite con el mapa: termina en él. Leer es la entrada; la conversión
primaria del sitio sigue siendo la voz (§8).

---

# Página 3.2 — el lector de ensayo (`/ensayos/:slug`)

**Decisión: lector editorial sobre papel claro.** 2.4 ya trazó la línea (D6): el plan
es un documento de trabajo y vive como expediente papel-sobre-oscuro; los lectores
editoriales de la Fase 3 van sobre papel claro. Un ensayo es un texto para leer
despacio, no un expediente para auditar. Contenedor `max-w-[800px]` (§4: lectores
760–860), padding 40/20.

## Estructura

- **Backlink** (mono 12px uppercase tinta-50, hover tinta, `print:hidden`):
  `← La biblioteca` → `/biblioteca`.
- **`<article className="edicion-impresa">`** — todo el documento adentro, para que la
  serifa impresa y el folio cubran título, cuerpo y firma:
  - **Folio** (`hidden print:block`, mono 10px uppercase, primera línea impresa):
    `¡BASTA! · edición del lector · {fecha}` (fecha del día, `es-AR`, formato largo —
    formato idéntico al de `PlanDetail`).
  - **Kicker violeta** (mono 11px uppercase, se imprime: ubica la pieza en el ciclo):
    `Ciclo {romano} — {rótulo} · {forma} {i} de {n} · {min} min`
    → «Ciclo II — Indagaciones · ensayo 3 de 7 · 21 min» · el acta:
    «Ciclo III — Interdependencia · acta 7 de 7 · 12 min». Sin `readingMinutes`, sin el
    último tramo.
  - **H1 Anton** `clamp(36px,5.4vw,68px)`, `riso-hover`, con rito de la tinta
    (`RitoTinta`, una línea) sobre el `title` del frontmatter, y `aria-label` con el
    título real (las letras van `aria-hidden`, contrato de la primitiva).
  - **Subtítulo** (Archivo 18px tinta-75, max-width 620, solo si existe — hoy los 21 lo
    traen).
  - **Cuerpo:** borde superior 2px tinta, padding-top 28, y el MDX **verbatim** vía
    `MdxPapel` (2.4) con `max-w-[680px]` (medida de lectura; `cn`/twMerge pisa el
    `max-w-none` de la primitiva) y `[&>*:first-child]:mt-0` (los cuerpos abren con
    `## I. …`, no con `# H1`).
  - **Firma de autor** §1 (mono 12px tinta-50, se imprime): `— El hombre gris`.
- **La cadena del ciclo** (borde superior 1px tinta, `flex justify-between` con wrap,
  `print:hidden`): ver abajo.
- **Cierre** (card oscura dentro de la columna, `bg-tinta text-papel`, padding 28/32,
  `flex justify-between` con wrap, `print:hidden`):
  - Anton 22px: `¿Te resonó? No lo dejes en lectura.`
  - `BotonPapel variant="violeta" surface="oscuro"` en `Link` a `/el-mapa`:
    `Decir la mía →`

## La cadena del ciclo (prev/next y los bordes)

**Una sola regla:** el orden de lectura es plano — los ciclos en su orden derivado, y
adentro de cada uno los ensayos por `orderIndex`. Prev y next son los vecinos en esa
lista. Nada de saltos, nada de callejones:

- **Primero de todo** (`presidencia`, Ciclo I): sin prev; solo next.
- **Último de todo** (`acta-de-la-interdependencia`): sin next. El acta cierra el
  tercer ciclo y cierra la biblioteca; el cierre al mapa hace de final.
- **Cruce de ciclo** (el vecino pertenece a otro ciclo): el link lleva **encima** una
  línea mono 10px uppercase tinta-30 que lo dice — `Ciclo {romano} — {rótulo}` — para
  que nadie cambie de ciclo sin darse cuenta. Dentro del mismo ciclo esa línea no
  aparece.
- Estilos: izquierda `← {título}` mono 12px tinta-50 (hover tinta), derecha
  `{título} →` mono 12px tinta `font-bold` (hover violeta), `max-w-[300px]` cada uno.

## La edición impresa (§10.8 — el patrón YA existe, se reusa tal cual)

Patrón de 2.4 (`PlanDetail.tsx` + `index.css`), **cero re-derivación**:

1. El chrome no se imprime desde 2.4 (`print:hidden` en `PapelHeader`/`PapelFooter`/
   `PaperGrain`/`DespertarVeil`). **Cero cambios de chrome en este trabajo.**
2. La serifa vive en `index.css` (`@media print { .edicion-impresa … }`, verificado
   2026-07-24). El `<article>` lleva la clase y listo. **`index.css` no se toca.**
3. Lo propio de este lector: el folio como primera línea del `<article>` ·
   `print:hidden` en backlink, cadena del ciclo y cierre · el kicker, el H1, el
   subtítulo, el cuerpo y la firma **sí** se imprimen · sin sombra que apagar (el
   lector es papel sobre papel).
4. **El rito no debe salir gris en papel.** Las letras del H1 entran con
   `anim-inkfill` (gris → tinta, `fill: both`): imprimir a los dos segundos de cargar
   podría capturarlas a medio entintar. El H1 lleva `print:[&_span]:animate-none` — la
   utilidad de Tailwind gana sobre la clase `.anim-*` de la capa de componentes y el
   texto imprime en su color heredado (tinta), exactamente como hace la guarda de
   `prefers-reduced-motion`. Si en la verificación el título saliera gris, el fallback
   es sumar `.anim-inkfill` al bloque `@media print` de `index.css` (cambio global: solo
   si hace falta, nunca preventivo).

## Las interacciones firma (presupuesto §6: una por página)

- **`/biblioteca` — el pliegue.** Tocar una fila la abre: el glifo `+` pasa a `−`, el
  título se entinta de violeta y el panel cae con `fadeup` rápido (.3s) mostrando la
  tesis del ensayo. Una sola fila abierta en toda la página. Todo lo demás entra con
  `fadeup` escalonado.
- **`/ensayos/:slug` — ninguna.** El presupuesto §6 es un techo, no una cuota: el
  lector no gasta el suyo. Su único motion es el ritual universal §10.1 (el rito de la
  tinta del H1, que no cuenta) más el `fadeup` estándar. **Un documento se lee quieto**
  — y a diferencia del expediente de 2.4, acá no cae ningún sello (Decisión 2).

El rito **sí** corre en este lector, a diferencia de `PlanDetail`: el H1 es la portada
de la página (viene del frontmatter) y no un título de cuerpo. Verificado 2026-07-24: 
ninguno de los 21 cuerpos abre con `# H1` — todos arrancan en `## I. …`, así que no hay
título duplicado. (`RitoTinta` trata `¿ ?` como letras comunes; solo `¡ !` caen en
violeta. Títulos como «¿De qué está hecha una nación?» se entintan enteros sin variante
nueva — criterio 2.4-D12 / 2.5-D18.)

## Estados mudos (§10.9)

Ambas páginas son build-time (`ENSAYOS` y `BLOG_POSTS` con `import.meta.glob` eager):
**no hay carga, no hay error de red, no hay skeleton.** Si un registry estuviera vacío
el build está roto y lo ataja el test, no la UI. Sin filtros no hay «Nada con ese
filtro». Los estados con voz son tres:

- **404 del lector** (slug inexistente): patrón expediente §5 sobre papel — kicker
  `expediente extraviado`, H1 Anton `Ese ensayo no está.`, `Sello color="rojo"`
  rotado con `Extraviado`, CTA `BotonPapel variant="tinta"` →
  `Volver a la biblioteca →` (`/biblioteca`).
- **Bitácora vacía:** `Todavía no hay crónicas. Cuando pase algo, se cuenta acá.`
- **Campos ausentes:** sin `summary` el pliegue muestra solo el link; sin
  `readingMinutes` desaparece el tramo de minutos; sin `subtitle` no hay línea. Hoy
  ninguno falta. **Nada se rellena.**

## Accesibilidad

- **Jerarquía del hub:** un `<h1>` (portada) · `<h2>` por sección — el título del
  manifiesto dentro de la card, la línea mono `Ensayos · {C} ciclos · tocá para abrir`,
  `Bitácora · lo que va pasando` y `Leíste. Ahora decí.` — y `<h3>` por ciclo. El
  esquema semántico y el visual se invierten a propósito en un punto (el h3 del ciclo
  es tipográficamente más grande que su h2 mono): mismo criterio ya shipeado en 2.4.
- **Jerarquía del lector:** un `<h1>` (el título del ensayo); los `<h2>`/`<h3>` son los
  del cuerpo MDX.
- **Filas expandibles:** `<button>` de ancho completo con `aria-expanded` +
  `aria-controls`, panel con `id`, glifo `aria-hidden` (contrato de la primitiva 2.4).
  El link del pliegue es un link real y tabulable.
- **Cards-link:** la del manifiesto y las de la bitácora son un `<a>` que envuelve todo
  el bloque; el «glifo de acción» (`Leerlo entero →`, `Leer la crónica →`) es texto
  dentro del mismo link, nunca un segundo control.
- **Targets ≥ 44px:** filas del índice, links del pliegue, cards de bitácora,
  backlink, prev/next, botones.
- **Foco:** violeta 2px global (`papel-root`). El orden de tabulación del lector es
  backlink → links del cuerpo → prev → next → CTA.
- **Sellos:** solo el `Extraviado` del 404, con texto real legible por AT.
- **Reduced motion:** guarda global de `index.css` — `inkfill`, `vpop` y `fadeup`
  quedan en estado final: la página nace completa, el pliegue abre sin animación.
- **AA:** texto esencial en tinta/tinta-90/tinta-75 sobre papel y papel/oscuro-secundario
  sobre tinta; violeta solo en accionables y títulos de fila abiertos; violeta-claro
  para los accionables sobre oscuro (card del manifiesto); tinta-50 en metadatos;
  tinta-30 solo en numeración y en la línea de cruce de ciclo (no esencial: el link
  siempre dice el título).
- **Impresión accesible:** el orden del DOM es el orden de lectura; el folio es la
  primera línea impresa.

## Enmiendas a la ley (mismo commit que el código, regla del master plan)

1. **§8 Anatomía — el número de entrenamientos se deriva, no se escribe.** El texto
   vigente dice «6 entrenamientos curados (catálogo completo de **30** detrás de «ver
   todos»)». Verificado 2026-07-24: `content/courses/` tiene **31** cursos y 329
   lecciones (commit `367dbcd`, «los 31 cursos migrados de v1 a MDX»). La ley afirma
   hoy un número falso y esta es la página que lo mostraría. Se reemplaza el fragmento
   por:

   > 6 entrenamientos curados (catálogo completo detrás de «ver todos» — el número lo
   > dice el registry, nunca el texto)

   Se corrige el dato y se elimina la clase de error: ningún conteo de contenido vuelve
   a vivir literal en la ley.

(Ninguna otra. El catálogo de sellos §10.5 **no** se enmienda — ver Decisión 2. La
variante expandible de la fila ya está legislada desde 2.4. La edición impresa ya está
legislada en §10.8 y su patrón ya existe. El estado «sección que todavía no tiene
lector» no necesita ley: la respuesta del sistema es no mostrarla.)

## Decisiones

1. **La forma honesta del hub:** día uno = portada + manifiesto + ensayos + bitácora +
   cierre, todo con destino vivo. Entrenamientos queda especificado entero acá y lo
   monta 3.5 como sweep final (precedente sancionado: el tile de semillas 2.0 → 2.5).
   Cero «próximamente»: §10.9 y §5 no sancionan ese estado.
2. **Un ensayo no lleva sello al terminar.** El catálogo §10.5 está cerrado y define
   «manifiesto leído hasta el final → LEÍDO ENTERO» **para el manifiesto**, donde es el
   pago de un documento único. Extenderlo a 21 ensayos volvería rutina el gesto que
   §10.5 reserva para «toda acción completada del usuario» — y leer no es una acción
   que la plataforma pueda verificar (scrollear no es leer): estampar por scroll sería
   la versión de logros del dato inventado. El ensayo cierra con firmas que la ley ya
   sanciona: `— El hombre gris` (§1, firma de autor en textos largos) y la banda de
   conversión al mapa. **Cero enmiendas al catálogo de sellos.**
3. **Los ciclos son metadato real** (`series` + `orderIndex`, documentados por el
   schema como el flujo natural de lectura). Se muestran agrupados; el rótulo es un
   mapa de etiquetas del slug (no un dato nuevo) y el orden de los ciclos se deriva del
   `publishedAt` más antiguo, con ordinal romano por posición. Ciclo desconocido →
   se muestra igual con su slug: ningún ensayo se pierde por falta de rótulo.
4. **El acta se nombra porque existe** (`form: 'acta'`, campo real, exactamente una):
   marca mono en la fila, palabra en el kicker del lector, verbo en el link
   («Leer el acta completa»). Ningún otro rasgo de ciclo se inventa.
5. **Índice completo: sin chips, sin búsqueda, sin paginación** (vara de 2.4). 21 filas
   en tres grupos son navegables de un vistazo y «todo publicado, entero» es la postura
   de la página.
6. **Apertura única global del acordeón** — una sola fila abierta entre los tres
   ciclos; el estado vive en la sección, no en la primitiva (patrón 2.4).
7. **El lector es editorial sobre papel claro**, 800px (§4), sin marco oscuro ni sombra
   — la diferencia con el expediente de 2.4 es semántica y ya estaba ratificada (2.4-D6).
8. **El H1 del lector viene del frontmatter y lleva rito de la tinta.** Verificado: los
   21 cuerpos abren en `## I. …`, no hay `# H1` que duplicar. Es la diferencia con
   `PlanDetail`, donde el título era del cuerpo y por eso no había rito.
9. **Cadena de lectura plana:** ciclos en orden + `orderIndex`; prev/next son vecinos;
   sin prev en el primero, sin next en el acta; al cruzar de ciclo el link lo dice. Una
   regla, cero callejones.
10. **Edición impresa reusada AS-IS:** `.edicion-impresa` + folio del patrón 2.4; el
    `<article>` envuelve kicker + H1 + subtítulo + cuerpo + firma para que la serifa y
    el folio cubran el documento; `print:[&_span]:animate-none` en el H1 para que el
    rito no salga a medio entintar. Cero CSS nuevo, cero cambios de chrome.
11. **Cero cifras en la card del manifiesto** — no hay registry del manifiesto y un
    «seis partes, cinco minutos» hardcodeado viola la directiva de datos. 3.3 puede
    sumarlas si construye el registry.
12. **La etiqueta de la bitácora no se pinta y no se traduce:** muestra el `category`
    del frontmatter tal cual, con borde neutro. El color del sistema significa tipo de
    voz (§7); un tema de blog no es una voz, y un mapa de rótulos lindos sería
    taxonomía inventada.
13. **Todo conteo visible se deriva** (`ENSAYO_COUNT`, `CICLO_COUNT`, conteo por ciclo,
    `CRONICA_COUNT`, `CURSO_COUNT`); los únicos literales son topes de display
    (`4` crónicas en el hub, `6` entrenamientos por §8/D4), comentados junto a la regla
    que los fija.
14. **Curación de entrenamientos = los primeros 6 `isFeatured` por `orderIndex`** — dos
    campos reales del contenido, cero lista de slugs en el código; si hubiera menos de
    6 destacados, se muestran los que haya. El total del link sale del registry: **31,
    no 30** → enmienda §8.
15. **Rutas:** `/biblioteca` canónica nueva (`App.tsx` sancionado, patrón 2.5),
    `/ensayos` → redirect al hub con `Ensayos.tsx` borrado, `/ensayos/:slug` intacta
    con reescritura in-place, `PAPEL_ROUTES` (exacto + prefijo) al final con estado
    interino aceptado.
16. **Cero primitivas nuevas.** `FilaIndiceExpandible` y `MdxPapel` (ambas de 2.4) +
    `Kicker`, `RitoTinta`, `Sello`, `BotonPapel`, `BandaCta`. La etiqueta (manifiesto y
    bitácora) se compone inline con la receta §5: §9b manda repetir la receta antes que
    abstraer. Si 3.4 la necesita por tercera vez, ahí se extrae `Etiqueta`.
17. **Cero íconos** (§12, páginas editoriales): glifos `+ − → ←` y nada más.
18. **Las firmas:** hub = el pliegue; lector = ninguna propia (documento quieto). El
    presupuesto §6 es techo, no cuota.

## Definición de terminado (protocolo por página)

- [ ] Hub: kicker + H1 Anton «Papel, tinta y método.» con rito de la tinta + lead con
      conteos derivados + CTA final al mapa.
- [ ] UNA interacción firma en el hub (el pliegue, apertura única global); el lector no
      gasta presupuesto propio.
- [ ] Los {N} ensayos navegables, agrupados en los {C} ciclos por metadato real, con
      pliegue de `summary` real y link con minutos reales; el acta marcada.
- [ ] Manifiesto destacado a `/manifiesto` (sin cifras) y bitácora con las últimas 4
      crónicas reales a `/blog/:slug` + link al total real.
- [ ] **Sin sección de entrenamientos, sin placeholders, sin links muertos** — la
      sección queda especificada para 3.5.
- [ ] Lector: kicker con ciclo/forma/posición/minutos, H1 con rito, subtítulo, cuerpo
      **verbatim** vía `MdxPapel`, firma `— El hombre gris`, cadena del ciclo con aviso
      de cruce, cierre al mapa, 404 expediente EXTRAVIADO.
- [ ] Edición impresa: `.edicion-impresa` + folio `¡BASTA! · edición del lector ·
      {fecha}`, backlink/cadena/cierre con `print:hidden`, título entintado (no gris) —
      verificada con captura de print preview.
- [ ] Cero datos inventados: ningún literal de conteo en JSX; test de canon de las
      derivaciones (agrupación, orden, vecinos) en verde.
- [ ] Enmienda §8 (número derivado) en el mismo commit que el hub.
- [ ] Rutas: `/biblioteca` en `App.tsx` y `PAPEL_ROUTES`; `/ensayos` redirige y
      `Ensayos.tsx` está borrado; `/ensayos/` en `PAPEL_PREFIXES`; nav «La biblioteca»
      → `/biblioteca`.
- [ ] Responsive: 1 columna, padding 20, targets ≥ 44px, título visible en la fila.
- [ ] Voseo consistente; «comillas angulares»; sin «registrate/únete».
- [ ] Archivos ≤ 300 LOC (composer + `sections/` + data + lector).
- [ ] Tests: derivaciones de ciclos/orden/vecinos · índice (apertura única global,
      links, acta) · composer (copy, manifiesto, bitácora, **ausencia** de
      entrenamientos) · lector (kicker, cuerpo, cadena, bordes, print, 404) · rutas
      papel.
- [ ] `pnpm verify` verde.
- [ ] Verificación en navegador desktop + mobile con capturas (incluye print preview y
      reduced-motion).
