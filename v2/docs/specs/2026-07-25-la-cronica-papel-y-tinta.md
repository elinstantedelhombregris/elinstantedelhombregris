# La crónica del país que viene — página 3.6

**Fecha:** 2026-07-25
**Fuente de diseño:** `docs/design-system/BASTA-v2.dc.html` — no hay pantalla propia
(el master plan le asigna el rótulo compartido «LECTOR: CRÓNICA», que en la práctica ya
se usó para 3.4/`BitacoraDetail`). Esta spec no repite esa pantalla: la deriva del
patrón real más cercano, que es 3.3 (El manifiesto), no 3.2/3.4.
**Sistema:** `docs/design-system/README.md` v1.1 (ley) · card 3.6 del master plan
`docs/plans/2026-07-21-papel-y-tinta-master-plan.md`
**Plan de implementación:** `docs/plans/2026-07-25-la-cronica-plan.md`

> **Tesis de copy.** A `/cronica` llega el que ya leyó el manifiesto o los ensayos y se
> pregunta cómo se vería todo esto si funcionara. La página se lo cuenta — pero antes de
> contarlo dice, sin vueltas, que es un cuento: cinco capítulos de ficción especulativa,
> no una promesa ni un pronóstico. El lector entra sabiendo exactamente qué tipo de texto
> tiene enfrente, lee los cinco capítulos seguidos porque es una sola historia, y al
> llegar al final la página no le pide que crea en el futuro que acaba de leer — le pide
> que vaya a escribir el que sigue, en el mapa.

## Por qué

v1 tenía esta novela metida adentro de `UnaRutaParaArgentina.tsx`, una página que en la
misma URL apilaba cuatro cosas distintas: una introducción a las 5 fases del método, la
novela de 5 capítulos, la grilla de los 22 planes y una sección de roles. Cuatro
paradigmas, un solo scroll — el "four-paradigms-on-one-URL failure" que nombra el master
plan (auto-review, línea final). La novela no tenía lector propio: era una sección más,
sin anclas navegables, sin edición impresa, sin tratamiento de lectura.

Esta página le da a la novela su propia dirección, su propio ritmo de lectura y su
propia advertencia — porque es el único texto keystone del sitio que **no describe nada
que haya pasado**. El manifiesto y los ensayos son postura del hombre gris hoy; los
planes son diseño idealizado rotulado «prueba, no doctrina»; la crónica es la única
pieza narrativa en tiempo futuro, con nombres de lugares y cifras de personas que
**nunca ocurrieron**. Si se lee sin el marco correcto, es la pieza con más riesgo de
confundir a alguien. Por eso D2 no es una preferencia de tono: es la razón de ser de la
página.

### El hallazgo: el patrón correcto no es Ensayo, es el Manifiesto

Las referencias que se pidió leer (`EnsayoDetail.tsx`) resuelven un problema distinto:
**un** documento por ruta, con vecinos en otras rutas (`ubicarEnsayo`, cadena de
prev/next entre páginas). La crónica es lo opuesto por decisión D1: **cinco** documentos
en **una sola** ruta. El patrón que ya resuelve exactamente ese problema —varias partes
con ancla propia, todas en la misma página, con un sumario arriba que salta a cada
una— es **`Manifiesto.tsx`** (página 3.3, spec
`docs/specs/2026-07-24-manifiesto-y-bitacora-papel-y-tinta.md`):
`SumarioManifiesto.tsx` (índice `<a href="#parte-N">`, sin JS propio, ancla nativa) +
`DocumentoManifiesto.tsx` (kicker + H1 con rito + apertura + sumario + partes ancladas +
firma, todo dentro de `<article className="edicion-impresa">`) + `CierreManifiesto.tsx`
(card oscura angosta, no `BandaCta` — esa es para páginas hub como `/biblioteca`, no
para lectores de 800px). Esta página copia esa forma, no la de `EnsayoDetail`. La
diferencia real con el manifiesto: cada capítulo trae **su propio** `title` +
`subtitle` (año) + `epigraph` en el frontmatter — el manifiesto no tiene eso, así que el
sumario y cada sección muestran un poco más que sus equivalentes de 3.3.

Consecuencia directa: **no hay ruta dinámica, no hay `:slug`, no hay 404.**
`/cronica` es una dirección estática — la única entre los cuatro lectores de la Fase 3
que no la tiene. `PAPEL_ROUTES` la suma por igualdad exacta, sin entrar a
`PAPEL_PREFIXES`.

### El hallazgo: «crónica» ya es una palabra ocupada

`content/cronica/*.mdx` es el registry de esta novela. Pero en este mismo programa,
«crónica» es también el nombre que usa 3.4 para **cada entrada de la bitácora**
(`BitacoraDetail.tsx`, specimen `data-screen-label="Crónica"`, kicker «Bitácora del
movimiento»). El propio §8 de la ley dice hoy: `lectores (ensayo/curso/crónica/
manifiesto)` — ese «crónica» es la bitácora, no esto. Esta spec no puede resolver la
colisión de nombres (la decidió el controller: la página se llama «La crónica del país
que viene», con el artículo y el título completo siempre juntos, nunca solo «crónica» a
secas en ningún copy de esta página) pero **sí** la deja escrita, para que nadie la
descubra leyendo el código: ver «Enmiendas a la ley» abajo.

### La deuda que esta página no paga

D3: `/una-ruta-para-argentina` (v1-port, `gradient-text`/`font-serif`) sigue viva y
sigue teniendo sus 5 fases (Despertar/Diseñar/Conectar/Multiplicar/Estrenar en
`UnaRutaParaArgentina/sections/Phases.tsx`) — contenido que **no vive en ninguna página
papel todavía**. Esta página **no** absorbe esas fases y **no** redirige
`/una-ruta-para-argentina`. Queda anotado para la Fase 7 (cutover): cuando se borre el
chrome v1, alguien tiene que decidir qué pasa con las 5 fases — ¿las absorbe `/la-idea`
(cap. II, «el método»)? ¿`/planes`? ¿mueren? Esta spec no lo resuelve porque no le
corresponde (una conversación = una página) — lo deja como ítem explícito de la Fase 7.

## Los datos: todo sale del registry

`CRONICA_CHAPTERS` (`~/lib/cronica-registry`, build-time con `import.meta.glob` eager,
**no se toca**) expone, por capítulo: `slug`, `title`, `subtitle` (año o rango, como lo
escribió el autor: `'2026'`, `'2029 — 2034'`), `epigraph` (la línea de apertura del
capítulo), `orderIndex` (1-based, explícito en el frontmatter — nunca inferido del
nombre de archivo) y `body` (MDX crudo sin frontmatter). Ya viene ordenado por
`orderIndex` — a diferencia de `ENSAYOS`, acá no hay ciclos que intercalar: es una sola
cadena. Verificado 2026-07-25 sobre los 5 archivos de `content/cronica/`:

| `orderIndex` | `slug` | `title` | `subtitle` | `epigraph` |
|---|---|---|---|---|
| 1 | `la-semilla` | La Semilla | `2026` | Dejar de esperar — ese fue el verbo que faltaba. |
| 2 | `la-prueba` | La Prueba | `2026 — 2027` | Gobernar no es mandar. Gobernar es escuchar. |
| 3 | `la-circunscripcion` | La Circunscripción | `2027 — 2029` | No fue un partido. Fue una forma de vivir que se expandió. |
| 4 | `la-cabecera-de-puente` | La Cabecera de Puente | `2029 — 2034` | Veintidós planes. Un organismo vivo, hecho por millones de manos. |
| 5 | `la-ejecucion` | La Ejecución | `2034 — 2040+` | La crisis llegó. Pero esta vez el pueblo ya no esperaba. |

Ninguno de los 5 cuerpos abre con un heading markdown (`#`/`##`): son prosa corrida,
párrafos y negritas — no hay título duplicado que izar, a diferencia del manifiesto.

**Las derivaciones** (todas puras, en `pages/Cronica/cronica-data.ts`, un archivo nuevo
— no se toca `manifiesto-data.ts` ni `biblioteca-data.ts`, aunque las tres tengan una
`fechaLarga` idéntica: es la misma duplicación deliberada que ya existe entre esas dos
—`manifiesto-data.ts:63-67`— por la razón que ese archivo documenta: importar la de
otro feature arrastra su registry entero al chunk de esta página):

| Derivada | Regla | Hoy |
|---|---|---|
| `CAPITULO_COUNT` | `CRONICA_CHAPTERS.length` | 5 |
| `idCapitulo(cap)` | `` `capitulo-${cap.orderIndex}` `` | `capitulo-1` … `capitulo-5` |
| `numeroDeCapitulo(i)` | `String(i + 1).padStart(2, '0')` | `01` … `05` |
| `fechaLarga(iso)` | `Intl` es-AR, `{day:'numeric',month:'long',year:'numeric'}` | fecha de hoy, para el folio impreso |

**Ningún literal de conteo en el JSX.** «5» no se escribe nunca: sale de
`CAPITULO_COUNT`. El primer y último año (`CRONICA_CHAPTERS[0].subtitle` /
`CRONICA_CHAPTERS.at(-1).subtitle`) tampoco se escriben — si hicieran falta en algún
copy, se leen del array, nunca se transcriben a mano.

**La frase keystone de D2 es la única excepción a "todo se deriva": es texto fijo,
autoral, citado en esta spec carácter por carácter, y no lleva ningún número
interpolado ni agregado.**

## Página 3.6 — la crónica del país que viene (`/cronica`)

Página papel estándar (chrome de `RootLayout`), lector editorial de 800px (§4:
lectores 760–860), padding 40/20 — mismo contenedor que Ensayo/Manifiesto/Bitácora.
**Toda la prosa de abajo es el copy final — el implementador la transcribe tal cual**,
salvo donde se marca explícitamente «derivado» o «keystone verbatim».

### Estructura

- **Backlink** (mono 12px uppercase tinta-50, hover tinta, `print:hidden`):
  `← La biblioteca` → `/biblioteca`. Mismo patrón que Ensayo/Manifiesto/Bitácora — la
  crónica es una sección de la biblioteca (D9), nunca "vuelve" a
  `/una-ruta-para-argentina`.
- **`<article className="edicion-impresa">`** — portada, sumario, los 5 capítulos y la
  firma adentro, para que la edición impresa cubra el documento entero:
  - **Folio** (`hidden print:block`, primera línea impresa, mono 10px uppercase):
    `¡BASTA! · edición del lector · {fecha}` (fecha del día, `es-AR`, formato largo —
    idéntico a Ensayo/Manifiesto/Bitácora).
  - **Kicker violeta** (mono 11px uppercase, se imprime — la advertencia de D2, lo
    primero que se lee en la página después del backlink):
    `La crónica del país que viene · ficción especulativa`
  - **H1 Anton** `clamp(36px,5.4vw,68px)`, `riso-hover`, rito de la tinta
    (`RitoTinta`, dos líneas) y `aria-label` con el título completo (las letras van
    `aria-hidden`, contrato de la primitiva):

    > **La crónica**
    > **del país que viene.**

    `aria-label="La crónica del país que viene."`
  - **Lead** (Archivo 18px, tinta-75, max-width 640, `text-wrap:pretty`) — una frase de
    encuadre derivada + la frase keystone **verbatim, sin tocar ni un signo**:

    `{CAPITULO_COUNT} capítulos que imaginan, desde el futuro, qué pasaría si esto se usara en serio. No es una predicción. Es un ejercicio para ver que otro camino es posible.`

    Las dos últimas oraciones —desde «No es una predicción.» hasta «…es posible.»— son
    la cita de D2, tomada de `SocialJusticeHub/client/src/pages/UnaRutaParaArgentina.tsx`
    (sección «Imaginá Qué Pasaría»), verbatim. La primera oración es la única prosa
    libre del lead y lleva `{CAPITULO_COUNT}` interpolado — nunca «cinco» escrito a
    mano.
  - **El sumario** (`SumarioCronica`, `print:hidden` — es navegación, no documento):
    - Encabezado (mono 11px uppercase tinta-50), mismo molde que el manifiesto,
      sustantivo cambiado:
      `El recorrido · {CAPITULO_COUNT} capítulos`
      `aria-label="Los capítulos de la crónica"` en el `<nav>`.
    - Una fila por capítulo, ancla nativa `<a href="#capitulo-{orderIndex}">` (sin JS
      propio — salto de navegador; `RootLayout`/`useIrAlPrincipio` ya resuelve el caso
      de llegar con el hash puesto desde otra página, ver «Ruta y navegación»), grilla
      `56px 1fr 40px` (mismo recipe que `SumarioManifiesto`, `44px_1fr_32px` <560px):
      numeración mono tinta-30 (`numeroDeCapitulo`) · título 17px + año en una segunda
      línea mono 11px uppercase tinta-50 debajo · `→` mono tinta-50. Borde inferior
      `border-papel-borde`, hover `bg-papel-presionado`.
  - **Los 5 capítulos**, en `orderIndex`, cada uno `<section id="capitulo-{orderIndex}"
    className="scroll-mt-20">`, separados por un borde superior 2px tinta (mismo
    ritmo que las partes del manifiesto):
    - Kicker neutro (mono 11px uppercase, `color="tinta"` → tinta-50, **no** violeta —
      el violeta de la página es el kicker de arriba, uno solo por página evita
      saturar): `Capítulo {orderIndex} de {CAPITULO_COUNT} · {subtitle}` → hoy
      «Capítulo 3 de 5 · 2027 — 2029».
    - **H2 Anton** `clamp(26px,3.4vw,40px)`, `riso-hover`, **sin** `RitoTinta` (el rito
      es del H1 de la página, una vez — mismo criterio que las partes del manifiesto,
      que tampoco lo llevan): `{title}`.
    - **Epígrafe** — `<blockquote>` italic Archivo 18px tinta-75, borde izquierdo 2px
      violeta, padding-left 20, max-width 560: `{epigraph}`. Sin comillas (no es una
      cita de otra fuente, es la línea de apertura del propio capítulo) y sin atribución
      (todos los capítulos son del mismo narrador).
    - **Cuerpo:** el MDX **verbatim** vía `MdxPapel`, `max-w-[680px]
      [&>*:first-child]:mt-0`. Cero parseo propio — a diferencia del manifiesto, cada
      capítulo ya es un archivo separado con su `body` completo; se pasa tal cual.
  - **Firma de autor** §1 (mono 12px tinta-50, se imprime), **una sola vez, después del
    quinto capítulo** — no hay firma por capítulo: `— El hombre gris`.
- **Cierre** (card oscura dentro de la columna, `bg-tinta text-papel`, padding 28/32,
  `flex justify-between` con wrap, `print:hidden` — mismo molde que Ensayo/Manifiesto/
  Bitácora, no `BandaCta`):
  - Anton 22px: `Esto es ficción. Lo que sigue, no.`
  - `BotonPapel variant="violeta" surface="oscuro"` en `Link` a `/el-mapa`:
    `Soltar mi voz en el mapa →`

**Sin sello, sin 404.** Ver Decisiones 2 y 6.

## El bloque en la biblioteca (adenda a 3.1, D9)

`/biblioteca` gana una sección nueva entre § 5 (Entrenamientos) y § 4 — perdón, en el
orden real del composer hoy: entre `<EntrenamientosCurados />` y `<BitacoraReciente />`
(D9 — «entre los entrenamientos y la bitácora»). Modificar `Biblioteca.tsx` para esto
**está sancionado**: es exactamente el mismo tipo de cambio que 3.5 ya le hizo a esta
misma página para montar la vidriera de entrenamientos, y el propio `biblioteca-data.ts`
existe para centralizar justamente estos `href` salientes.

Card oscura de ancho completo, **mismo recipe que `ManifiestoDestacado`** (D9 no obliga
un estilo nuevo, y repetir el recipe de "destacar un documento único" es exactamente lo
que pide §9b antes de inventar otro):

- **Etiqueta** (tag §5 sobre oscuro, borde violeta-claro, mono 11px bold uppercase):
  `Ficción especulativa`
- **Título** (h2 Anton `clamp(24px,3vw,36px)`): `La crónica del país que viene`
- **Línea** (14px oscuro-secundario) — la frase keystone de D2, **reusada verbatim**:
  `No es una predicción. Es un ejercicio para ver que otro camino es posible.`

  (Reusarla acá no la modifica ni la reescribe — la repite tal cual donde más falta
  hace: antes de que alguien haga clic. Es una elección de esta spec, no un mandato de
  D2; ver Decisión 1.)
- **Glifo de acción**: `Leer la crónica →`

`href` completo a `/cronica`. `biblioteca-data.ts` suma `HREF_CRONICA = '/cronica'`
junto a `HREF_MANIFIESTO`/`HREF_BITACORA` (misma sección de constantes, aunque esta no
cambie de fase — centralizar todos los destinos salientes del hub en un solo lugar es
la razón de ser de ese bloque).

## La edición impresa (§10.8 — reusada tal cual, cero re-derivación)

Idéntico al patrón de 2.4/3.2/3.3/3.4, **nada nuevo**:

1. El chrome no imprime desde 2.4 (`print:hidden` en `PapelHeader`/`PapelFooter`/
   `PaperGrain`/`DespertarVeil`). Cero cambios de chrome.
2. `.edicion-impresa` vive en `index.css`, no se toca. El `<article>` lleva la clase.
3. Folio como primera línea impresa · `print:hidden` en backlink, sumario y cierre ·
   kicker, H1, lead, los 5 capítulos (kicker + H2 + epígrafe + cuerpo) y la firma **sí**
   se imprimen.
4. El H1 lleva `print:[&_span]:animate-none` — mismo fallback documentado en 3.2/3.3/3.4
   si el título saliera gris en la captura de verificación (sumar `.anim-inkfill` al
   bloque `@media print` de `index.css`, cambio global, solo si hace falta).

## Ruta y navegación

- **Canónica nueva:** `/cronica`. Ruta estática, sin `:slug` — la única entre los cuatro
  lectores de la Fase 3 sin ruta dinámica (no hay 404 de esta página, ver Decisión 6).
- **`App.tsx`/`app-routes.tsx`:** agregar `<Route path="/cronica" component={Cronica} />`
  en el bloque «Content + community», cerca de `/biblioteca`. El orden exacto no importa
  (ruta estática sin prefijo dinámico que pueda chocar con otra).
- **`PAPEL_ROUTES`:** `/cronica` al Set, por igualdad exacta. **No** entra a
  `PAPEL_PREFIXES` (no hay hijos dinámicos).
- **`papel-nav.ts`: sin cambios.** `/cronica` no es un ítem del recorrido de primer
  nivel (`PAPEL_NAV`) — es un destino de segundo nivel colgado de la biblioteca, igual
  que `/manifiesto`, `/bitacora` y `/entrenamientos`, ninguno de los cuales está en el
  nav tampoco. Se llega desde el bloque nuevo en `/biblioteca` y desde el backlink de
  vuelta.
- **El salto a capítulos ya funciona (D7), no se escribe código nuevo para eso:**
  `useIrAlPrincipio()` (`~/lib/ir-al-principio`, ya wireado en `RootLayout`) resuelve el
  caso de llegar a `/cronica#capitulo-3` desde **otra** página o recargando —
  sondea hasta 60 frames a que el ancla aparezca (la página es `lazy()`) y hace
  `scrollIntoView`. El salto **dentro** de `/cronica` (click en una fila del sumario
  mientras ya se está en la página) es un `<a href="#capitulo-N">` corriente: el
  navegador lo resuelve solo, sin JS — exactamente el mecanismo que ya usa
  `SumarioManifiesto`, cero primitiva nueva.
- **SEO/OG:** título «La crónica del país que viene — ¡BASTA!», se cablea en 8.1 con el
  resto del sitio. Esta página no agrega `<head>`.

## Estados mudos (§10.9)

Build-time con `import.meta.glob` eager: **no hay carga, no hay error de red, no hay
skeleton.** Hoy `CRONICA_CHAPTERS.length === 5`, así que lo de abajo es defensivo, no
alcanzable — mismo criterio que la bitácora vacía en 3.1 («Si un registry estuviera
vacío el build está roto y lo ataja el test, no la UI»):

- **Si `CAPITULO_COUNT === 0`:** la página **no** intenta renderizar sumario ni la
  sección de capítulos (ambas se omiten enteras, no se muestran vacías). Debajo del
  lead aparece, en su lugar: `Todavía no hay crónica. Cuando el país la escriba, se
  cuenta acá.` El cierre a `/el-mapa` sigue presente — ese CTA no depende del contenido.
- **Sin 404:** la ruta es estática, no hay slug que pueda no existir.
- **Campos ausentes:** `subtitle` y `epigraph` son obligatorios en el schema Zod
  (`cronicaFrontmatterSchema`, `min(1)` en ambos) — no hay caso de capítulo sin año o
  sin epígrafe que la UI deba cubrir. Si algún día se relajara el schema, la regla por
  defecto de este sistema aplica: el bloque que falta se omite, nada se rellena.

## Accesibilidad

- **Jerarquía:** un `<h1>` (la página) · un `<h2>` por capítulo (5) · el sumario es un
  `<nav aria-label="Los capítulos de la crónica">`, sin heading propio (mismo criterio
  que `SumarioManifiesto`).
- **Sumario:** links reales, tabulables, `href="#capitulo-N"` — no botones, no JS. El
  glifo `→` es decorativo (el texto del link ya dice a dónde va).
- **Epígrafe:** `<blockquote>` semántico, sin `cite` (no hay fuente externa).
- **Targets ≥ 44px:** filas del sumario, backlink, botón de cierre.
- **Foco:** violeta 2px global (`papel-root`). Orden de tabulación: backlink → filas
  del sumario (5) → cierre.
- **Sellos:** ninguno en esta página (Decisión 2).
- **Reduced motion:** guarda global de `index.css` — `inkfill`/`fadeup` quedan en
  estado final; el sumario no anima (es un salto de ancla, no una revelación).
- **AA:** texto esencial en tinta/tinta-90/tinta-75 sobre papel; violeta solo en el
  kicker superior, el borde del epígrafe y los accionables; violeta-claro en la
  etiqueta de la card del hub (sobre oscuro); tinta-50 en metadatos y kickers de
  capítulo; tinta-30 en numeración y borde de foco secundario.
- **Impresión accesible:** orden del DOM = orden de lectura; folio como primera línea.

## Enmiendas a la ley (mismo commit que el código que las necesita)

1. **§8 Anatomía — la novela no figura en el mapa de páginas, y su nombre choca con el
   «crónica» que ya está ahí.** El texto vigente:

   > `… → La biblioteca (manifiesto + 21 ensayos en 3 ciclos + 6 entrenamientos
   > curados (catálogo completo detrás de «ver todos» — el número lo dice el registry,
   > nunca el texto) + bitácora) → lectores (ensayo/curso/crónica/manifiesto) →
   > Sembrar (3 pasos → certificado semilla)`

   pasa a:

   > `… → La biblioteca (manifiesto + 21 ensayos en 3 ciclos + 6 entrenamientos
   > curados (catálogo completo detrás de «ver todos» — el número lo dice el registry,
   > nunca el texto) + bitácora) → lectores (ensayo/curso/crónica/manifiesto) → la
   > crónica del país que viene (novela especulativa en una sola ruta, /cronica — no
   > confundir con las crónicas de la bitácora) → Sembrar (3 pasos → certificado
   > semilla)`

   Sin número de capítulos en la ley (mismo criterio que ya aplicó la propia enmienda
   de entrenamientos: un conteo de contenido escrito a mano en un doc que no se
   regenera envejece mal — si mañana hay un sexto capítulo, este texto no miente).

(Ninguna otra. El catálogo de sellos §10.5 **no** se enmienda — Decisión 2. El catálogo
de glifos §12 no necesita nada nuevo — Decisión 5. `PAPEL_NAV` no se toca — no es un
ítem de primer nivel.)

## Decisiones

1. **La frase keystone se repite en dos lugares, verbatim en los dos:** el lead de
   `/cronica` (mandato D2) y la card del hub en `/biblioteca` (elección de esta spec,
   no mandato). Repetirla antes del clic adelanta la advertencia de ficción al primer
   punto de contacto — más allineado con el espíritu de D2 («arriba de todo») que
   esperar a que el lector ya esté adentro.
2. **Cero sello.** El catálogo §10.5 está cerrado: RECIBIDA (mapa) · PLANTADA (semilla)
   · LEÍDO ENTERO (manifiesto, único documento al que la ley se lo reserva) · VISTO
   (mandato). Leer una novela hasta el final no es una de esas cuatro acciones y
   extender el catálogo por quinta vez —para un texto que la propia página dice que es
   ficción— sería el gesto opuesto al de honestidad que pide D2. Mismo argumento que
   2.4-Decisión 2 (el ensayo tampoco estampa nada al terminar).
3. **El patrón madre es el Manifiesto (3.3), no el Ensayo (3.2).** Ambos son lectores
   editoriales de 800px con edición impresa, pero solo el manifiesto resuelve «varias
   partes ancladas en una sola ruta con un sumario que salta entre ellas» — el problema
   real de esta página. `EnsayoDetail` resuelve «un documento por ruta con vecinos en
   otras rutas», que D1 explícitamente descarta (nada de `/cronica/:slug`).
4. **Cada capítulo trae su propio kicker (`Capítulo N de {total} · {año}`) en tinta-50,
   no violeta.** El violeta de la página es el kicker superior — repetirlo 5 veces
   satura una página que ya lleva un acento violeta en el borde del epígrafe. Distinto
   del manifiesto, cuyas partes no llevan kicker propio porque no tienen año que
   mostrar.
5. **El epígrafe es una composición nueva, sin primitiva y sin comillas.** No hay
   receta previa para "línea de apertura de capítulo" en el catálogo §5. Se compone con
   tokens existentes (borde izquierdo violeta, itálica Archivo, tinta-75) tomando
   prestado el tratamiento de blockquote que ya usa `MdxPapel` para las citas del
   cuerpo, en vez de inventar un color o un glifo nuevo. Sin comillas angulares porque
   no es una cita de otra fuente — es la voz del propio narrador abriendo el capítulo.
6. **Sin ruta dinámica, sin 404.** D1 fija una sola ruta estática. A diferencia de
   Ensayo/Bitácora/Planes (que sí necesitan `EnsayoExtraviado`/`CronicaExtraviada` para
   un `:slug` que puede no existir), acá no hay parámetro que resolver — nada que
   pueda estar «extraviado».
7. **Ningún año se escribe a mano.** El primer y el último año de la novela, si
   aparecieran en algún copy, salen de `CRONICA_CHAPTERS[0].subtitle` /
   `CRONICA_CHAPTERS.at(-1).subtitle` — nunca transcriptos. En esta versión del copy no
   se necesitan (el lead usa solo `CAPITULO_COUNT`), pero la regla queda escrita para
   quien edite el copy después.
8. **`/una-ruta-para-argentina` no se toca ni se redirige** (D3). Las 5 fases que
   contiene no tienen todavía página papel; el ítem queda anotado para la Fase 7. Esta
   página tampoco linkea hacia allá en ningún punto — cero puente a construir y
   después borrar.
9. **La card del hub reusa el recipe de `ManifiestoDestacado` sin cambios de forma**,
   solo de copy: etiqueta, título, línea, glifo — mismo layout, mismo hover
   `-translate-y-0.5`, mismo lugar en `biblioteca-data.ts` para su `href`. Cero
   primitiva nueva, cero receta nueva para el hub.
10. **Enmienda única:** §8 Anatomía suma la novela al mapa de páginas y aclara la
    colisión de nombres con la bitácora. Sin número de capítulos en el texto de la ley.

## Definición de terminado (protocolo §11 por página)

- [ ] `/cronica`: backlink a `/biblioteca` · kicker con la advertencia de ficción ·
      H1 con rito de la tinta · lead con `CAPITULO_COUNT` derivado + la frase keystone
      **verbatim, carácter por carácter** · sumario con `{CAPITULO_COUNT}` filas que
      saltan por ancla nativa · los 5 capítulos con kicker propio, H2, epígrafe y
      cuerpo **verbatim** vía `MdxPapel` · una sola firma al final · cierre oscuro a
      `/el-mapa`.
- [ ] Sin sello, sin skeleton, sin 404, sin estado de carga.
- [ ] Edición impresa: `.edicion-impresa` + folio + `print:hidden` en backlink/sumario/
      cierre + título entintado (no gris) en la captura de print preview.
- [ ] El bloque nuevo en `/biblioteca`, entre entrenamientos y bitácora, con la card
      oscura (recipe de `ManifiestoDestacado`) y la frase keystone reusada.
- [ ] Cero literales de conteo en JSX; cero años escritos a mano.
- [ ] Enmienda §8 en el mismo commit que la página que la necesita.
- [ ] Rutas: `/cronica` en `App.tsx`/`app-routes.tsx` y en `PAPEL_ROUTES` (igualdad
      exacta, sin prefijo); `papel-nav.ts` sin cambios.
- [ ] Responsive: 1 columna, padding 20, targets ≥ 44px, sumario legible en 375px.
- [ ] Voseo consistente; «comillas angulares» donde corresponda; sin «registrate/
      únete».
- [ ] Archivos ≤ 300 LOC (composer + `sections/` + `cronica-data.ts`).
- [ ] Tests: derivadas de `cronica-data.ts` · composer (kicker, H1, lead verbatim,
      sumario, los 5 capítulos con id/epígrafe/cuerpo, firma única, cierre, edición
      impresa, ausencia de sello) · bloque nuevo en `Biblioteca.test.tsx` (presente,
      orden correcto, keystone reusada) · rutas papel.
- [ ] `pnpm verify` verde.
- [ ] Verificación en navegador desktop + mobile con capturas (incluye salto de ancla
      del sumario, print preview y reduced-motion).
