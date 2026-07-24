# La prueba «Papel y Tinta» — página 2.4 del recorrido

**Fecha:** 2026-07-22
**Fuente de diseño:** `docs/design-system/BASTA-v2.dc.html` (pantalla `data-screen-label="Los 22 planes"`)
**Sistema:** `docs/design-system/README.md` v1.1 (ley) · card 2.4 del master plan `docs/plans/2026-07-21-papel-y-tinta-master-plan.md`
**Plan de implementación:** `docs/plans/2026-07-22-la-prueba-plan.md`

> **Tesis de copy.** A `/planes` llega el que ya escuchó «la ciudadanía diseña» y
> quiere ver los papeles — ¿esto es un slogan o hay documentos? — y la página tiene un
> solo trabajo: ponerle los {N} planes enteros adelante y que entienda, antes de abrir
> el primero, que no son doctrina: son la **prueba** de que uno solo pudo, y por eso la
> invitación a superarlos. Se va habiendo abierto al menos un pliegue del índice — o
> mejor: leyendo un documento entero, en pantalla o impreso.

## Por qué

El `/planes` actual es un puerto v1: grilla de cards glass con serif y gradient-text,
sin filtros, sin jerarquía entre el índice y los documentos. El `/planes/:slug` actual
renderiza el MDX con `MdxContent` (prosa `prose-invert` con serifa Playfair e
iris-violet — todo lo que la ley prohíbe). El diseño BASTA v2 lo convierte en lo que
la página es conceptualmente: **un expediente**. Índice de filas con numeración,
callout rojo «No es doctrina», pliegues +/− para leer la tesis de cada plan sin salir
del índice, y un lector papel-sobre-oscuro con sello EJEMPLO y edición impresa — la
**primera** edición impresa del sistema (§10.8), el patrón que los lectores de la
Fase 3 van a reusar.

Además esta página salda dos deudas del sistema: decide la **variante expandible de la
fila de índice** que §5 dejó apuntada («+/− es la variante expandible, spec en fase
2.4») y estrena el patrón de impresión que hasta hoy no existe en el repo (cero
`@media print` en `apps/web/src`).

## El problema de diseño central: un catálogo honesto

### El hallazgo: no hay taxonomía real

El frontmatter de `content/planes/*.mdx` (verificado 2026-07-22, los 23 archivos)
tiene exactamente estos campos: `slug`, `code`, `title`, `summary`, `orderIndex`,
`draft` (+ `isMeta` solo en PLANRUTA, + `phases` solo en PLANSUS). **No existe ningún
campo de categoría.** El especimen muestra chips de filtro («Ambiente»,
«Infraestructura», «Economía»…) pero su data de planes es ilustrativa: usa códigos que
no existen en el contenido real (PLANISV, PLAN24CN, PLANAGUA…). La taxonomía v1
(`strategic-initiatives.ts`) tampoco sirve de fuente: describe **otro** conjunto de 22
planes — solo ~8 códigos coinciden con el canon v2 del 23 de abril de 2026.

Asignarles categorías a los planes desde la implementación sería inventar taxonomía —
la misma falta que inventar un número. Regla del programa: no se hace.

### Las tres decisiones que siguen de ahí

1. **Sin chips de categoría.** La fila de chips del especimen no se migra. Si algún
   día el autor del contenido agrega `categoria:` al frontmatter, el slot revive con
   la receta §5 exacta (chips por categoría única del frontmatter + chip
   «Todos · {n}»; activo = fondo tinta + texto papel, como el especimen; línea de
   conteo mono «{n} planes»). Queda flaggeado para el cierre de paridad de contenido
   (Fase 3.7): es una decisión editorial del autor, no del implementador.
2. **Sin búsqueda.** El kit §5 reserva la búsqueda para listas que desbordan; acá hay
   23 ítems fijos, visibles en una pantalla, con códigos Anton escaneables — el índice
   ES el mecanismo de búsqueda. Un input «buscar:» sobre 23 filas sería burocracia
   escenográfica. (Misma vara que §13: si algo no se entiende en 10 segundos, sobra.)
3. **Sin paginación.** Todo el contenido se muestra (directiva «all content ships»).
   Nada de «cargar más» para 23 filas.

Lo que sí queda del kit §5: el estado del índice habla con una línea de conteo real
(«Los {N} planes · tocá para abrir») y el pliegue +/− hace el trabajo que el especimen
le pedía a los filtros: explorar sin navegar.

### Los números

Todo conteo visible sale de `PLAN_REGISTRY` (build-time, MDX real): el kicker, el
lead, la numeración de expediente `{num}/{N}`, el método. Hoy N = 22 (+ PLANRUTA
aparte), y un test de canon lo fija: exactamente 1 plan `isMeta`, exactamente 22 sin
`isMeta`. Ningún «22» literal en el JSX. (El campo `draft` existe y es `false` en los
23 — el registry no filtra por él hoy y esta página no le cambia el comportamiento.)

## Ruta y navegación

- **Canónicas:** `/planes` y `/planes/:slug` — ya existen en `App.tsx` (lazy sobre
  `~/pages/Planes` y `~/pages/PlanDetail`, named exports). `papel-nav.ts` ya apunta
  «La prueba» (num `04`) a `/planes`. **Sin redirects nuevos, `App.tsx` no se toca.**
- **`PAPEL_ROUTES`:** se agrega `/planes` al Set y `/planes/` a `PAPEL_PREFIXES`
  (mismo mecanismo sancionado que los anexos del mandato en `layouts/papel-routes.ts`).
- **Lo que muere / se transforma (inventario v1-port):**

| Feature v1-port | Destino |
|---|---|
| `Planes.tsx`: header serif «Cada PLAN es un sistema diseñado» + grilla de cards glass | **Muere.** Reescritura in-place como composer papel (portada + callout + índice + meta + método). Named + default export intactos. |
| `Planes.tsx`: sección «El plan meta» primera, cards con summary completo | **Se transforma:** PLANRUTA pasa al final como fila expandible propia (num `00`), fuera de la cuenta; el summary vive en el pliegue, no en la card. |
| `PlanDetail.tsx`: `MdxContent` (prose-invert, serifa, iris-violet) + `Button` shadcn | **Muere en esta página.** El cuerpo pasa a `MdxPapel` (prosa papel nueva, compartida). `MdxContent` NO se toca: lo siguen consumiendo otras páginas v1-port (ensayos, manifiesto, bitácora) hasta sus propias fases. |
| `PlanDetail.tsx`: 404 con «Ese PLAN no existe.» | **Se transforma** en 404 expediente §5: kicker `expediente extraviado` + sello EXTRAVIADO. |
| Chrome glass/gradient-text/serif de ambos archivos | Muere entero. |

## Estructura del catálogo (`/planes`)

Página papel estándar (chrome de RootLayout), contenedor ancho `max-w-[1440px]` (§4),
padding lateral 40/20. **Toda la prosa de abajo es el copy final — el implementador la
transcribe tal cual.** `{N}` es siempre `PLAN_COUNT` interpolado (hoy 22).

### § 1 — Portada + callout

- Kicker violeta: `La prueba · {N} planes · un solo autor`
- H1 Anton `clamp(44px,6vw,88px)` con rito de la tinta (`RitoTinta`, dos líneas):

  > **Esto lo escribió**
  > **uno solo.**

- Lead (Archivo 17px, tinta-75, max-width 640):
  `{N} planes de país — salud, escuelas, tierra, moneda, justicia — escritos por un hombre gris cualquiera. Cada uno parte de la misma pregunta: si esto se pudiera diseñar de cero, ¿cómo sería? Y del mismo método: primero el ideal, después el camino de vuelta.`
- **Callout «No es doctrina»** (borde 2px rojo-sello, padding 28/32, flex wrap):
  sello chico `No es doctrina` (`Sello color="rojo"`, borde 2px en esta instancia no —
  se usa la primitiva tal cual, ver Decisión 12) + prosa 15px tinta-90:
  `Nada de esto se firma ni se obedece. Se publica como evidencia: si uno solo pudo diseñar esto, millones diseñan mejor. Leelos para criticarlos, mejorarlos o reemplazarlos — el programa real lo escriben las voces del mapa.`
  («voces del mapa» es link semibold a `/el-mapa`.)

### § 2 — El índice de los {N}

- Encabezado de sección (h2 visualmente mono 11px uppercase tinta-50):
  `Los {N} planes · tocá para abrir`
- Lista con borde superior 1px tinta: una `FilaIndiceExpandible` por plan
  (orden = `orderIndex`, ya ordenado por el registry; numeración `01`…`{N}`):
  - **Fila (cerrada):** num mono 12 tinta-30 · encabezado: código en Anton 24
    (`PLANSAL`) + título Archivo 15 tinta-75 · glifo `+` mono tinta-50.
  - **Fila (abierta):** el código pasa a violeta, el glifo a `−` violeta.
  - **Panel (el pliegue):** `summary` del frontmatter (16px, tinta-90, max-width 720,
    la tesis de una línea del plan — dato real, jamás reescrito acá) + link mono 12
    bold uppercase violeta: `Leer el documento →` a `/planes/{slug}`.
  - **Una sola fila abierta por vez** (abrir otra cierra la anterior — especimen).
- Responsive <960: la fila conserva num + código + título (el título NO se oculta —
  el especimen esconde el nombre en móvil pero un código solo no informa; el
  encabezado apila código arriba y título abajo en la misma celda). <560: num a 44px.

### § 3 — El plan meta

- Encabezado mono 11px uppercase tinta-50: `El plan meta · fuera de la cuenta`
- Una sola `FilaIndiceExpandible`: num `00` · `PLANRUTA` + su título · mismo pliegue
  (summary + `Leer el documento →` a `/planes/planruta`).
- Línea al pie del bloque (mono 10px tinta-30):
  `PLANRUTA no es un plan más: es el manual de cómo arrancar los otros {N}.`

### § 4 — El método (banda papel-crudo, grilla de 3)

Fondo `bg-papel-crudo`, borde superior 1px tinta, grilla de 3 columnas (1 col <960).
Título Anton 22 + cuerpo 14px tinta-50:

1. **¿Falta un plan?** — `Seguro: son {N} y el país es infinito. Marcá el hueco — soltá tu urgencia en el mapa y el próximo lo escribís vos.` («soltá tu urgencia en el mapa» linkea `/el-mapa`, semibold.)
2. **Método Ackoff** — `Diseño idealizado: no se pregunta qué se puede arreglar — se pregunta qué construiríamos hoy de cero. Después, el camino de vuelta.`
3. **Hechos para ser superados** — `El mejor destino de estos documentos es quedar viejos. Cada voz nueva los corrige; si el mandato los contradice, ganan las voces.`

### § 5 — CTA final

Botón centrado `BotonPapel variant="violeta"`: **Soltá tu urgencia en el mapa →** —
navega a `/el-mapa`. La prueba no compite con el mapa: existe para que el lector
crea que diseñar es posible y vaya a hacerlo.

## El lector (`/planes/:slug`) — el expediente que se abre

**Decisión: expediente papel-sobre-oscuro, no lector de biblioteca.** Un plan es un
documento de trabajo, no un ensayo: hereda el lenguaje del mandato (página oscura +
papel con la única sombra sancionada §5) y se diferencia de los lectores editoriales
de la Fase 3 (que viven sobre papel claro). El contenedor es de lector: 760–860px
(§4) — el documento se lee, no se navega.

Estructura (`PlanDetail.tsx`, reescritura in-place):

- **Marco oscuro** `bg-tinta`, contenedor `max-w-[860px]`, padding 40/20.
- **Barra superior** (no se imprime): kicker violeta-claro
  `La prueba · expediente {num}/{N}` (para PLANRUTA: `La prueba · el plan meta`) ·
  backlink mono `← Volver a la prueba` a `/planes`.
- **El documento** (`<article>` papel): `bg-papel text-tinta`, padding 52/56
  (24 móvil), `shadow-[0_24px_60px_rgba(0,0,0,0.45)]`, `position:relative`.
  - **Sello EJEMPLO** (`Sello color="rojo"`, rotado +6°, `anim-stampin`) arriba a la
    derecha — en TODOS los planes, siempre: acá el sello no marca un régimen de datos
    (mandato) sino la naturaleza permanente del documento — prueba, no doctrina.
  - **Línea del sello** (mono 11px tinta-50, debajo de la cabecera):
    `Esto lo escribió uno solo. Leelo para criticarlo, mejorarlo o reemplazarlo.`
  - **Cabecera del expediente** (fila mono 11px uppercase tinta-50, borde inferior
    1px papel-borde): izquierda `{code} · prueba, no doctrina` · derecha
    `expediente {num}/{N}` (PLANRUTA: `el plan meta`).
  - **Cuerpo:** el MDX **verbatim** vía `MdxPapel` (componente nuevo compartido, ver
    abajo). El título del documento es el `# H1` del propio MDX (Anton) — la página
    NO duplica el `title` del frontmatter encima (frontmatter titula el catálogo y el
    `<title>` SEO de 8.1, no el papel). Los textos de los planes no se reescriben ni
    se truncan: keystone-adjacent. Hoy los cuerpos son compactos (24–57 líneas); el
    lector no asume longitud — cuando la paridad de contenido traiga los documentos
    completos, la página no cambia.
  - **Pie del expediente** (borde superior 1px papel-borde): línea mono 13px
    tinta-50: `¿Lo podés mejorar? Esa es la idea.` + link violeta
    `Soltá tu voz en el mapa →` (`/el-mapa`) · firma de autor §1, mono tinta-30,
    alineada a la derecha: `— El hombre gris`.
- **404 expediente** (slug inexistente): mismo marco oscuro, card papel angosta con
  kicker `expediente extraviado`, título Anton `Ese plan no está.`, sello rojo
  `Extraviado` rotado, CTA `Volver a la prueba →` (`/planes`). Patrón §5 exacto.

### `MdxPapel` — la prosa papel compartida

`components/papel/MdxPapel.tsx`: `renderMarkdown()` (marked, ya existente) + clases
prose en tokens papel — títulos Anton tinta (h1 `clamp(30px,4.4vw,52px)`, h2 26, h3
20), cuerpo Archivo 17/1.75 tinta-90, strong tinta, links violeta subrayados,
blockquote borde izquierdo 2px tinta, hr papel-borde. Cero serifa en pantalla, cero
`prose-invert`, cero iris-violet. Es componente compartido (`components/papel/`)
porque los lectores de la Fase 3 (ensayo/manifiesto/crónica) consumen exactamente
esta prosa; `MdxContent` (v1) queda intacto para las páginas aún no migradas.

## La edición impresa — primera del sistema (§10.8)

Este lector estrena el patrón que §10.8 promete y que la Fase 3 y la 8.2 reusan. La
mecánica, en tres piezas reutilizables:

1. **El chrome no se imprime (una sola vez, para siempre).** `print:hidden` en la
   raíz de `PapelHeader`, `PapelFooter`, `PaperGrain` y `DespertarVeil` — «sin
   nav/footer/grano» vale para TODO lector futuro, así que se resuelve en el chrome,
   no página por página. Es la excepción sancionada de este trabajo a la regla de no
   tocar header/footer (cuatro clases, cero cambios de comportamiento en pantalla).
2. **La serifa vive en un solo lugar.** Bloque canónico en `index.css`:

   ```css
   /* Edición impresa §10.8 — la serifa del sistema existe SOLO acá. */
   @media print {
     .edicion-impresa,
     .edicion-impresa * {
       font-family: Georgia, 'Times New Roman', serif !important;
     }
     .edicion-impresa {
       box-shadow: none !important;
     }
   }
   ```

   La clase `edicion-impresa` se aplica a la raíz del documento papel del lector.
   (Decisión D1 del master plan: stack del sistema, cero webfont nueva. No se agrega
   token Tailwind de fuente: la cascada CSS es el mecanismo correcto para «todo el
   documento en serifa», y en pantalla la clase no hace nada.)
3. **Cada lector define lo suyo:** el folio y qué esconder. En `PlanDetail`:
   - **Folio** (primera línea del documento, `hidden print:block`):
     `¡BASTA! · edición del lector · {fecha}` (fecha del día, es-AR, formato largo).
   - `print:hidden` en: barra superior (kicker + backlink) y pie de conversión
     («¿Lo podés mejorar?…» — un link no imprime). La firma `— El hombre gris` SÍ se
     imprime. El **sello EJEMPLO se imprime**: la honestidad viaja con el papel.
   - Marco oscuro `print:bg-transparent`, card `print:shadow-none print:p-0` (la
     sombra ya la mata el bloque canónico; la clase local documenta la intención).

Verificación: además de los tests (folio presente con clases print, chrome con
`print:hidden`), la prueba en navegador incluye **captura del print preview** — es la
primera vez que el sitio se vuelve papel de verdad.

## Las interacciones firma (presupuesto §6: una por página)

- **`/planes` — el pliegue del expediente.** Tocar una fila la abre: el glifo `+`
  pasa a `−`, el código se entinta de violeta y el panel cae con `fadeup` rápido
  (.3s, `.anim-fadeup-rapido`) mostrando la tesis del plan. Una sola fila abierta
  por vez — el índice se hojea como un expediente, no se despliega como un
  acordeón de FAQ. Todo lo demás en la página entra con `fadeup` escalonado
  estándar.
- **`/planes/:slug` — el sello que cae.** Al abrir el expediente, el sello EJEMPLO
  cae sobre el papel (`anim-stampin`, el enter de la primitiva). Es el único momento
  de motion propio del lector; el resto es documento quieto.

El rito de la tinta del H1 (catálogo) es el ritual universal §10.1 y no cuenta contra
el presupuesto. El lector no lleva rito: su H1 es el del documento MDX (el rito es de
portadas de página, no de cuerpos de documento — mismo criterio que los anexos del
mandato).

## Estados mudos (§10.9)

El catálogo es build-time (`PLAN_REGISTRY` con `import.meta.glob` eager): **no hay
carga, no hay error, no hay vacío en runtime** — si el registry está vacío, el build
está roto y lo ataja el test de canon, no la UI. Sin filtros no hay estado
«Nada con ese filtro». Los únicos estados con voz:

- **404 del lector:** el expediente extraviado (arriba).
- **Pliegue de un plan sin `summary`** (frontmatter incompleto — hoy no pasa, los 23
  lo tienen): el panel muestra solo `Leer el documento →`. Nada se inventa.

## Accesibilidad

- **Jerarquía:** un `<h1>` (portada del catálogo / el H1 del MDX en el lector),
  `<h2>` por sección (§2–§4; en el lector, los h2 del documento MDX).
- **Filas expandibles:** `<button type="button">` de ancho completo (nunca un `<a>`
  que no navega) con `aria-expanded` + `aria-controls={idPanel}`; el panel tiene
  `id={idPanel}`. Enter/Espacio nativos del botón; foco visible violeta 2px (global
  `papel-root`); el glifo `+/−` es `aria-hidden` (el estado lo anuncia
  `aria-expanded`). El link del panel es un link real y tabulable.
- **Targets ≥ 44px:** filas (py-4 sobre línea completa), link del pliegue, CTA,
  backlink del lector.
- **Sellos:** texto real legible por AT (EJEMPLO, EXTRAVIADO, No es doctrina).
- **Reduced motion:** guarda global de `index.css` — `inkfill`, `fadeup`, `stampin`
  quedan en estado final: el índice nace completo, el pliegue abre sin animación, el
  sello aparece puesto.
- **AA:** todo texto esencial en tinta/tinta-90/tinta-75 sobre papel y
  oscuro-texto/secundario sobre tinta; violeta solo en accionables y códigos abiertos
  (Anton 24 ≥ AA large-text sobre papel); tinta-30 solo en numeración/notas al pie
  (no esencial).
- **Impresión accesible:** el orden del DOM es el orden de lectura; el folio es la
  primera línea impresa.

## Enmiendas a la ley (mismo commit que el código, regla del master plan)

1. **§5 Fila de índice — la variante expandible queda especificada.** Se reemplaza la
   nota `(flecha → por defecto; +/− es la variante expandible, spec en fase 2.4)` por
   la receta:

   > Variante expandible (`FilaIndiceExpandible`): la fila es un `<button>` de ancho
   > completo con `aria-expanded`/`aria-controls`; el glifo final alterna `+`
   > (cerrada, tinta-50) / `−` (abierta, violeta), `aria-hidden`; el panel se abre
   > debajo con `fadeup` rápido (.3s, `.anim-fadeup-rapido`), sangrado a la columna
   > del título, y muestra la tesis de una línea + «Leer el documento →». Una sola
   > fila abierta por lista; abrir otra cierra la anterior. El borde inferior vive
   > en el contenedor (fila + panel comparten la junta).

(Ninguna otra: la edición impresa ya está legislada en §10.8 — esta página solo la
implementa por primera vez; el sello EXTRAVIADO ya está en el patrón 404 de §5;
EJEMPLO ya está en §2/§10.5.)

## Decisiones

1. **Sin chips de categoría** — no existe taxonomía en el frontmatter y no se
   inventa; la v1 describe otro conjunto de planes (~8/22 códigos coinciden). El slot
   revive con receta especificada si el autor agrega `categoria:` (flaggeado a la
   paridad de contenido, Fase 3.7).
2. **Sin búsqueda ni paginación** — 23 ítems fijos en una pantalla; el kit §5 es para
   listas que desbordan. El índice completo siempre visible es la postura de la
   página («todo publicado, entero»).
3. **`FilaIndiceExpandible` como primitiva nueva** en `components/papel/primitives/`
   (la `FilaIndice` link queda intacta); receta amendada en §5. El encabezado es un
   slot (`ReactNode`): el catálogo compone código Anton + título adentro sin que la
   primitiva conozca planes.
4. **Acordeón de apertura única** (estado en la sección, no en la primitiva) —
   comportamiento del especimen; hojear, no desplegar todo.
5. **PLANRUTA aparte, al final, num `00`** — fuera de la cuenta (canon), mismo
   pliegue; `00` dice «antes que todos» sin sumarse a la lista.
6. **El lector es un expediente papel-sobre-oscuro** (lenguaje del mandato, única
   sombra §5), ancho de lector 760–860px; los lectores editoriales de Fase 3 van
   sobre papel claro — la diferencia ES semántica: plan = documento de trabajo.
7. **El título del documento es el H1 del MDX** — el cuerpo se renderiza verbatim,
   sin duplicar el `title` del frontmatter ni reescribir una letra
   (keystone-adjacent).
8. **`MdxPapel` compartido en `components/papel/`** — la prosa papel que la Fase 3
   reusa; `MdxContent` v1 no se toca (otras páginas lo consumen hasta migrar).
9. **Sello EJEMPLO permanente en todo plan** — acá no es régimen de datos: es la
   naturaleza del documento. Se imprime.
10. **Primera edición impresa:** chrome con `print:hidden` (excepción sancionada,
    una sola vez), serifa por cascada `.edicion-impresa` en `index.css` (cero token
    nuevo, cero webfont — D1), folio por lector. Patrón documentado para 3.x/8.2.
11. **Firmas:** catálogo = el pliegue del expediente; lector = el sello que cae.
12. **El callout usa la primitiva `Sello` tal cual** (borde 3px shipped) aunque el
    especimen dibuja 2px en esa instancia — consistencia de primitiva sobre
    fidelidad de píxel (mismo criterio que HeroBasta).
13. **Conteos siempre derivados de `PLAN_REGISTRY`** + test de canon (22 + 1 meta).
    Cero literales en JSX.
14. **`PAPEL_ROUTES`:** `/planes` exacto + prefijo `/planes/` (mecanismo ya
    sancionado por 2.3).
15. **Cero íconos** (§12, página editorial): glifos `+ − → ▌` y sellos.

## Definición de terminado (protocolo por página)

- [ ] Catálogo: kicker + H1 Anton con rito de la tinta + CTA presentes; callout «No
      es doctrina» con link al mapa.
- [ ] UNA interacción firma por página: pliegue (catálogo) · sello que cae (lector).
- [ ] Índice completo: los {N} planes por `orderIndex` + PLANRUTA aparte (num `00`);
      pliegue con `summary` real y «Leer el documento →»; apertura única.
- [ ] Sin chips, sin búsqueda, sin paginación — y sin taxonomía inventada en ningún
      lado. Conteos derivados del registry; test de canon 22 + 1 meta en verde.
- [ ] Lector: expediente papel-sobre-oscuro con sello EJEMPLO + línea, cabecera
      `{code} · expediente {num}/{N}`, MDX verbatim vía `MdxPapel`, pie con
      conversión al mapa y firma `— El hombre gris`; 404 expediente EXTRAVIADO.
- [ ] Edición impresa: chrome oculto, serifa solo en print, folio
      `¡BASTA! · edición del lector · {fecha}`, sello impreso — verificada con
      captura de print preview.
- [ ] Enmienda §5 (receta de la variante expandible) en el mismo commit que la
      primitiva.
- [ ] Responsive: 1 columna, título visible en móvil, targets ≥ 44px, padding 20.
- [ ] Voseo consistente; «comillas angulares»; sin "registrate/únete".
- [ ] `/planes` (+ `/planes/` por prefijo) en `PAPEL_ROUTES`; chrome glass de ambas
      páginas v1-port muerto; `App.tsx` sin cambios; sweep: `VocesTicker` importa
      `TIPOS_VOZ` de `lib/tipos-voz.ts` (muere el tercer duplicado).
- [ ] Archivos ≤ 300 LOC (composer + `sections/` + data + primitiva + lector).
- [ ] Tests: primitiva expandible (aria/glifo/panel) · canon del registry · índice
      (apertura única, links) · lector (EJEMPLO, folio print, 404) · `MdxPapel` ·
      rutas papel.
- [ ] `pnpm verify` verde.
- [ ] Verificación en navegador desktop + mobile con capturas (incluye print
      preview) + reduced-motion.
