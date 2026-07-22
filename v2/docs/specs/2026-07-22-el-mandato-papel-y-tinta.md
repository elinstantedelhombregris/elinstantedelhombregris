# El mandato «Papel y Tinta» — página 2.3 del recorrido

**Fecha:** 2026-07-22
**Fuente de diseño:** `docs/design-system/BASTA-v2.dc.html` (pantalla `data-screen-label="El mandato"`)
**Sistema:** `docs/design-system/README.md` v1.1 (ley) · card 2.3 del master plan `docs/plans/2026-07-21-papel-y-tinta-master-plan.md`
**Plan de implementación:** `docs/plans/2026-07-22-el-mandato-plan.md`

> **Tesis de copy.** A `/mandato-vivo` llega el que ya vio el mapa y pregunta «¿y todo
> esto en qué termina?» — y la página tiene un solo trabajo: mostrarle que las voces se
> vuelven un documento con formato de mandato, no un feed que se pierde. Se va creyendo
> dos cosas: que el documento es real porque cada número sale de la base, y que si suma
> su voz, el documento cambia. El CTA lo devuelve al mapa a sumarla.

## Por qué

El `/mandato-vivo` actual es un puerto v1 en chrome oscuro glass: un formulario de
señales, un feed de «señales recientes» y un ranking lateral de propuestas — tres
listas sin documento. El diseño BASTA v2 lo invierte: la página ES el documento. Página
oscura + papel sobre oscuro (la única sombra permitida, §5), preámbulo, diagnóstico
rankeado, recursos, brechas críticas y acciones en votación. Además esta página absorbe
la historia de la **convergencia** (voz → clasificación → documento), que en v1 se
contaba tres veces en tres páginas: acá se cuenta una sola vez, y las demás páginas
solo la enlazan.

## El problema de diseño central: un documento honesto

El mandato es la página donde las voces SE VUELVEN documento. Con la plataforma joven
(pocas voces), la tentación es inventar porcentajes — y la regla del programa es
absoluta: **cero datos hardcodeados, cero porcentajes inventados, jamás**. La solución
no es esconder el documento: es que el documento diga la verdad con dignidad (§10.9) y
que el sello EJEMPLO (§10.5, catálogo cerrado) marque cuándo lo que se lee es formato y
no mandato — «prueba, no doctrina» aplicado a la propia página.

### Los tres regímenes de datos (contrato exacto)

Tres poblaciones alimentan la página, cada una con su N:

- **N** = voces del mapa aprobadas (`dreams`, `status='approved'`) — el registro.
- **M** = señales clasificadas (`pulse_signals` con `theme` no nulo y ≠ `sin_clasificar`) — el diagnóstico.
- **P** = propuestas en votación (`proposals`, `status='voting'`) — las acciones.

Para cada población rige el mismo régimen, alineado con §13:

| Régimen | Condición | Qué se renderiza |
|---|---|---|
| **cero** | total = 0 | Ningún número, ninguna barra: la línea §10.9 de esa sección (copy exacto abajo). El cero real se dice, no se decora. |
| **palitos** | 0 < total < 100 | Conteos absolutos en Space Mono + palitos (§13 nivel 1, `anim-semgrow`). **Sin porcentajes**: un «67%» sobre 3 voces es estadísticamente absurdo y el documento no miente. |
| **porcentaje** | total ≥ 100 | El % grande del especimen (formato es-AR, un decimal: «18,4%») + barras §13 nivel 2 con `anim-growbar`, siempre acompañado del conteo absoluto. |

`UMBRAL_PORCENTAJE = 100` — el mismo umbral que §13 usa para palitos-vs-barras: una
sola regla, no dos.

**El sello EJEMPLO:** mientras N < 100, el documento papel lleva el sello rojo
`EJEMPLO` rotado arriba a la derecha (receta §5) más la línea mono:
`Con {N} voces esto es el formato del mandato, no el mandato. El de verdad se escribe con la tuya.`
Todos los números adentro son reales igual (incluidos los ceros). Cuando N ≥ 100 el
sello desaparece y el documento pasa a ser la revisión vigente. Ningún otro contenido
ilustrativo existe en la página: las secciones demo del especimen («cláusulas en
redacción» con datos inventados) **no se migran**.

## Ruta y navegación

- **Canónica:** `/mandato-vivo` — ya existe en `App.tsx` (lazy sobre
  `~/pages/ElMandatoVivo`, named export). `papel-nav.ts` ya apunta «El mandato» (num
  `03`) a `/mandato-vivo`. Sin redirects nuevos, `App.tsx` no se toca.
- **Sub-vistas (anexos):** `/mandato-vivo/pulso/:id` y `/mandato-vivo/propuesta/:id`
  ya existen y se conservan (las rutas cortas `/pulso/:id` del master plan son
  shorthand de estas — no se crean rutas nuevas). Ver «Los anexos» abajo.
- **`PAPEL_ROUTES`:** se agrega `/mandato-vivo` — y como el Set actual matchea por
  igualdad exacta, los anexos dinámicos necesitan además un match por prefijo
  (`/mandato-vivo/`) en `RootLayout.tsx`. Es la excepción sancionada de este trabajo.
- **Lo que muere / se transforma (inventario v1-port):**

| Feature v1-port | Destino |
|---|---|
| `ElMandatoVivo.tsx`: form «Mandá tu señal» (`POST /api/pulso`) | **Muere en esta página.** La conversión del sitio es una sola: soltar la voz en `/el-mapa` (spec 2.2). El endpoint `POST /api/pulso` queda vivo para otras superficies (posts de comunidad, comentarios). |
| Feed «Señales recientes» (`GET /api/pulso?limit=50`) | **Muere como feed.** La recencia vive en el mapa; acá las señales aparecen agregadas (diagnóstico por tema) y la última de cada tema entra como cita con link a su anexo. |
| Aside «Propuestas en votación» (`GET /api/propuestas?status=voting`) | **Se transforma** en la sección V del documento (acciones en votación, con votos reales y link al anexo). |
| `PulsoDetail.tsx` (glass, dl de metadatos) | **Se transforma** en anexo papel-sobre-oscuro (ficha de señal). Ruta intacta. |
| `PropuestaDetail.tsx` (glass, votar ±1) | **Se transforma** en anexo papel-sobre-oscuro. La votación se conserva (auth). Ruta intacta. |
| Chrome glass/gradient-text/serif de los tres archivos | Muere entero. |

## Datos reales — inventario API (verificado 2026-07-22)

**Veredicto: casi todo existe; falta UN endpoint de lectura, agregando tablas
existentes. Cero cambios de esquema, cero migraciones.**

Lo que existe y se reusa:

| Necesidad | Endpoint existente |
|---|---|
| Cifra de portada (N voces) | `GET /api/analytics/voces-count` — hook `useVocesCount()`, misma query key que el header: un solo fetch. |
| Detalle de una señal (anexo) | `GET /api/pulso/:id` — hook `usePulsoById()` existente. |
| Detalle + voto de propuesta (anexo) | `GET /api/propuestas/:id` + `POST /api/propuestas/:id/vote` — hooks `usePropuestaById()`/`useVotePropuesta()` existentes. |
| Nombres de provincia client-side (anexos) | `GET /api/open-data/provinces` — hook `useProvincias()` de la spec 2.2. |

Lo que falta y se construye (`GET /api/mandato/documento`):

- El feature `apps/api/src/features/mandato/` hoy tiene **solo** `classifier.ts` +
  `cron.ts` — **no expone ninguna ruta** (auditoría confirmada: `MandatoRepository`
  tiene cero consumidores en `apps/api/src`). El cron escribe `territory_mandates`
  por provincia, pero (a) no hay endpoint que lo lea y (b) su rollup exige
  `province_id IS NOT NULL`, así que no sirve como agregado nacional. El documento
  agrega directo sobre las tablas fuente (patrón `analytics/routes.ts`), que es más
  simple y siempre fresco:
  - `dreams` (aprobadas): conteos por tipo (`category`) → el registro; por
    provincia × {necesidad, recurso} → recursos y brechas. Todo con
    `GROUP BY` sobre índices existentes (`dreams_category_idx`, `dreams_province_idx`).
  - `pulse_signals`: conteos por `theme` (clasificadas) + última señal por tema con
    nombre de provincia (join `geographic_locations`) → el diagnóstico.
  - `proposals`: en votación por `voteScore` (repo existente `listProposals`).
- Payload (envelope `{ data }` estándar):

```
GET /api/mandato/documento →
{ data: {
    generadoEl: string,                                  // ISO — fecha del pie §13
    voces:     { total, porTipo: [{ tipo: string|null, total }] },
    recursos:  { total, porProvincia: [{ provincia: string|null, total }] },
    brechas:   [{ provincia: string, piden, ofrecen }],  // solo provincias con piden ≥ 1
    senales:   { total, clasificadas,
                 temas: [{ tema, total, ultima: { id, texto, provincia: string|null, fecha } | null }] },  // top 8
    propuestas:[{ id, titulo, resumen, estado, votos, apoyo }]  // voting, top 5 por apoyo
} }
```

### La bifurcación de datos — dicha sin vueltas

Hoy conviven dos poblaciones: las **voces del mapa** (`dreams`, con tipo y provincia,
sin clasificar por tema) y las **señales del pulso** (`pulse_signals`, clasificadas
por tema vía IA, alimentadas por otras superficies). El clasificador **no lee las
voces del mapa**. Por eso el documento declara sus fuentes por sección y el pie las
imprime (§13 prensa: fuente y fecha siempre): el registro/recursos/brechas salen de
las voces del mapa; el diagnóstico por tema sale de las señales clasificadas.
**Unificarlas** (que cada voz del mapa entre también al clasificador) es una decisión
de backend futura — requeriría o bien doble escritura en el submit del mapa o bien una
columna `theme` en `dreams` (migración). **Queda flaggeada y fuera de alcance**: esta
página no miente sobre lo que hay; muestra las dos fuentes con nombre propio.

## Estructura

Página `bg-tinta text-oscuro-texto` de punta a punta, contenedor documentos
`max-width:1100px` (§4), padding lateral 40/20. Una columna en todos los breakpoints
(la página es un expediente, no un dashboard). **Toda la prosa de abajo es el copy
final — el implementador la transcribe tal cual.**

### § 1 — Portada (oscura)

- Franja meta superior (mono 11px uppercase, borde inferior `oscuro-borde`):
  izquierda `Documento vivo · se reescribe con cada voz` · derecha, en violeta-claro:
  `Revisión continua`.
- Kicker violeta-claro: `El mandato · documento vivo`
- H1 Anton `clamp(48px,7vw,104px)` con **rito de la tinta en variante clara**
  (`RitoTinta tono="claro"` — el inkfill actual termina en tinta y sería invisible
  sobre fondo tinta; ver «Enmiendas a la ley»):

  > **El mandato.**

- Lead (Archivo 19px, `oscuro-secundario`, max-width 640):
  - Con `useVocesCount` resuelto y N ≥ 1:
    `No es un programa de gobierno escrito por asesores. Es el país ordenado por urgencia, redactado a partir de {N} voces reales. El que quiera un cargo, firma esto — o explica, en público, por qué no.`
    ({N} en Space Mono, `toLocaleString('es-AR')`; «voz real» singular si N=1).
  - Cargando, error o N=0: la misma frase **sin cifra**:
    `…redactado por su gente.` — nunca un número de reserva.

### § 2 — Cómo se escribe (la convergencia, contada UNA vez)

Grilla de 3 pasos (juntas 1px `oscuro-borde`, celdas `bg-tinta`, 1 columna <960).
Cada celda: número mono violeta-claro (`01/02/03`), título Anton 22px, cuerpo 14px
`oscuro-secundario`:

1. **La voz entra por el mapa** — `Alguien suelta lo que no aguanta, lo que sueña o lo que ofrece. Queda pública desde el primer segundo.` (línea final: link `El mapa →` a `/el-mapa`, semibold papel)
2. **Una máquina la lee** — `Un clasificador la suma a su tema y le mide el peso. Sin mesa chica: nadie elige a mano qué pesa.`
3. **El documento se reescribe** — `Cada voz nueva recalcula el registro, las brechas y el diagnóstico. Esta página es siempre la última revisión.`

Esta sección es la única del sitio que cuenta la convergencia (directiva del master
plan: en v1 se contaba tres veces). La idea y El mapa solo enlazan acá.

### § 3 — El registro del mapa (§13 barras, en oscuro)

Encabezado mono 11px uppercase `oscuro-meta`: `El registro del mapa — lo que la gente vino a decir`.

Fuente: `voces.porTipo` plegado a los 6 tipos (§7) — categorías nulas o fuera de
catálogo caen en `valor`, mismo criterio que el mapa. Orden: total desc. Por régimen N:

- **porcentaje (N ≥ 100):** por tipo, fila `[etiqueta mono 13px papel | barra | valor]`:
  barra 22px de fondo `bg-oscuro-barra` (#241F17 — §13 en oscuro), relleno del color
  semántico del tipo (basta=sello, sueño=violeta, necesidad=ámbar, compromiso=verde,
  recurso=cian, valor=papel — tinta sobre tinta no se ve; ver Decisión 8), ancho
  proporcional al share, `anim-growbar` con delays escalonados (i×0.08s). Valor Space
  Mono 13px al final: `{pct} · {n}` (ej. `18,4% · 2.294`).
- **palitos (0 < N < 100):** por tipo con total ≥ 1, fila `[etiqueta | palitos | n]`:
  palitos §10.6 (grupos de 4 + 1 cruzado, `anim-semgrow` escalonado, color semántico,
  `aria-hidden`) + conteo mono. Sin porcentajes.
- **cero:** una sola línea mono `oscuro-meta`:
  `Todavía no hay voces en el mapa. El registro arranca con la primera — puede ser la tuya.`

Pie de la sección (mono 10px `oscuro-tenue`):
`fuente: {N} voces del mapa · {fecha generadoEl}` (solo si N ≥ 1).

### § 4 — El documento (papel sobre oscuro)

Encabezado de sección mono 11px uppercase `oscuro-meta`: `El documento completo · la revisión vigente`.

Card `bg-papel text-tinta` padding 52/56 (24 móvil), `position:relative`, **la única
sombra del sistema** (`shadow-[0_24px_60px_rgba(0,0,0,0.45)]` — receta §5 papel sobre
oscuro). Sello `EJEMPLO` (rojo, rotado +6°, `anim-stampin`) arriba a la derecha
**solo si N < 100**, con su línea mono debajo del encabezado del documento (copy en
«El sello EJEMPLO» arriba).

Contenido del documento:

**Cabecera** — fila mono 11px uppercase tinta-50: `Revisión continua · {fecha}` ·
`Exp. {N} voces` (N real; `Exp. sin voces todavía` si N=0). Título Anton
`clamp(30px,4.4vw,52px)`: **Mandato ciudadano — Argentina**.

**Preámbulo** (borde superior 2px tinta; label mono violeta `Preámbulo`):

> Las voces reunidas en el mapa constituyen el presente mandato. No es un programa de
> gobierno ni una plataforma electoral: es el país ordenado por urgencia, redactado
> por su gente y de cumplimiento verificable. Quien aspire a administrar o ejecutar lo
> público en nombre de estas voces adhiere a este documento completo — o explica, en
> público, por qué no.

(Prosa retórica sin cifras: exenta de la regla de datos.)

**I. Diagnóstico — lo que más pesa** (label mono violeta). Fuente: `senales.temas`
(M régimen). Por régimen:

- **porcentaje (M ≥ 100):** filas del especimen `[rank Anton 26 tinta-30 | tema +
  cita | % grande]`: tema en bold 16px (snake_case humanizado: `salud_publica` →
  «salud publica»), debajo cita real en itálica 14px tinta-50:
  `«{ultima.texto}» — {ultima.provincia ?? 'Argentina'}`, a la derecha el % en Anton
  24 violeta + `{n} señales` mono 10px. La cita linkea a su anexo
  (`/mandato-vivo/pulso/{ultima.id}`).
- **palitos (0 < M < 100):** mismas filas, la columna derecha muestra `{n}` en Anton
  24 violeta + `señales` mono (sin %), palitos junto al conteo.
- **cero (M = 0):** el bloque dice, en 15px tinta-75:
  `Acá va el diagnóstico del país, tema por tema, con porcentaje y todo. Todavía no hay señales clasificadas para escribirlo — y no lo vamos a inventar.`

**II. Recursos declarados** (label mono violeta). Fuente: `recursos` (tipo «recurso»
del mapa). Si total ≥ 1: chips mono 12px borde 1px tinta `{provincia ?? 'Argentina'} · {n}`
+ línea de cierre mono tinta-50: `= {total} {persona/personas} que ofrecieron algo concreto`.
Si 0: `Nadie ofreció nada todavía. Los recursos entran por el mapa, con una voz de tipo «recurso».`

**III. Brechas críticas — donde la necesidad supera lo ofrecido** (label mono
violeta). Fuente: `brechas` (necesidad vs recurso por provincia, solo provincias con
piden ≥ 1, orden `piden − ofrecen` desc, tope 6). Fila:
`{provincia}` bold 15px · `piden {piden} · ofrecen {ofrecen}` mono 12px tinta-50 ·
tag de urgencia mono 10px uppercase con borde 1px de su color:
- `crítica` (rojo sello) si ofrecen = 0
- `alta` (ámbar) si 0 < ofrecen < piden
- `cubierta si se organiza` (verde) si ofrecen ≥ piden

(Función pura `urgenciaDeBrecha`, testeada — la urgencia es fórmula publicada, no
juicio editorial.) Si no hay filas:
`Sin necesidades y recursos declarados no hay brechas que medir. Eso también es un dato.`

**IV. Acciones en votación** (label mono violeta). Fuente: `propuestas` (P régimen).
Si P ≥ 1: filas `[A{i} mono tinta-30 | contenido]`: título bold 16px (link al anexo
`/mandato-vivo/propuesta/{id}`), resumen 14px tinta-75, línea mono 11px violeta:
`{votos} votos · apoyo {apoyo:+}`. Si P = 0:
`Ninguna propuesta en votación todavía.`
Cierre de la sección, siempre (mono 13px tinta-50):
`La siguiente la escribís vos` + cursor `▌` violeta con `anim-blink-cursor`.

**V. Vigencia y firma** (borde superior 2px tinta). Izquierda, label mono violeta
`Vigencia y firma` + 14px tinta-75:
`Este mandato se reescribe con cada voz nueva. No tiene dueño, no tiene vencimiento: tiene revisiones.`
Derecha, alineado abajo:
- N ≥ 1: Anton 26px `Las {N} voces` + mono 11px tinta-50 `— y las que faltan.`
- N = 0: Anton 26px `Ninguna voz todavía.` + mono 11px tinta-50 `— faltan todas. Empezá vos.`

**Pie de fuentes** (§13: toda pieza de datos lleva fuente y fecha) — mono 10px
uppercase tinta-30, borde superior 1px `papel-borde`:
`Fuentes: {N} voces del mapa · {M de senales.clasificadas} señales clasificadas · {P} propuestas en votación · generado {fecha generadoEl}`.

### § 5 — Cómo se usa (grilla oscura, del especimen)

Grilla de 3 (juntas 1px `oscuro-borde`), título Anton 22 violeta-claro + cuerpo 14
`oscuro-secundario`:

1. **Se firma** — `Cualquiera que aspire a un cargo puede adherir al documento vigente, en público. La firma no se exige: se registra.`
2. **Se mide** — `Cada prioridad sale con su número al lado: cuántas voces, de dónde, desde cuándo. Lo que se mide no se relativiza.`
3. **Se recuerda** — `Las voces quedan públicas y el documento a la vista. Lo dicho, dicho está: la memoria es la sanción.`

(Prosa de mecanismo, sin cifras ni promesas de features que no existen.)

### § 6 — CTA final

Botón centrado `BotonPapel variant="violeta"` (hover en oscuro invierte a papel):
**Sumar mi voz al mandato →** — navega a `/el-mapa`. Es el único CTA de conversión de
la página: el mandato no compite con el mapa, lo alimenta.

## Los anexos (sub-vistas como fichas del expediente)

**Decisión: anexos, no lectores.** `/mandato-vivo/pulso/:id` y
`/mandato-vivo/propuesta/:id` no son páginas independientes con su propia identidad:
son **fichas del mismo expediente** — misma página oscura, misma ficha papel-sobre-oscuro
(receta §5, contenedor angosto ~720px), backlink al documento. Justificación: (a) el
usuario llega casi siempre desde el documento o desde un link compartido, y la
continuidad del chrome oscuro dice «seguís dentro del mandato»; (b) un lector §8 es
para textos largos de biblioteca, no para una señal de dos líneas; (c) reusa la única
sombra ya sancionada sin inventar jerarquía nueva.

**Anexo señal** (`/mandato-vivo/pulso/:id`):
- Kicker violeta-claro `El mandato · anexo` + backlink mono `← Volver al mandato`.
- Ficha papel: meta mono `Señal N° {id} · {fecha es-AR}`; cuerpo Archivo 19px:
  `«{body}»`; filas de expediente (mono label tinta-50 + valor):
  `tema: {theme humanizado, o 'sin clasificar todavía'}` ·
  `provincia: {nombre vía useProvincias, o 'Argentina'}` ·
  `origen: {mandato_form→'formulario del mandato' · community_post→'publicación de la comunidad' · comment→'comentario'}`.
- 404: patrón expediente §5 — kicker `expediente extraviado`, Anton `Esa señal no está.`,
  CTA `Volver al mandato →`.

**Anexo propuesta** (`/mandato-vivo/propuesta/:id`):
- Mismo marco. Ficha: meta mono `Propuesta N° {id} · {estado}` (voting→`en votación`,
  draft→`en borrador`, accepted→`aceptada`, rejected→`rechazada`, archived→`archivada`);
  título Anton 30px; resumen 17px; `bodyMarkdown` como párrafos 15px si existe.
- Bloque de votación (borde superior 1px tinta): mono `{votos} votos · apoyo {apoyo:+}`
  + botones `BotonPapel variant="fantasma"`: `A favor +1` / `En contra −1`
  (deshabilitados sin sesión o durante el POST). Sin sesión, línea 14px tinta-50:
  `Para votar hace falta entrar. Sin cuenta se lee todo; con cuenta también se vota.`
  («entrar» linkea `/ingresar` — jamás «registrate»).
- 404: `Esa propuesta no está.` mismo patrón.

## La interacción firma: el sello VISTO

Presupuesto §6: una interacción firma — es esta. El rito de la tinta es el ritual
universal y no cuenta; `growbar`/`semgrow` son la receta §13, no interacción.

1. El lector recorre el documento. Cuando el bloque de firma (V) entra al viewport
   (IntersectionObserver, threshold ~0.6), una sola vez por montaje:
2. Cae un **sello verde `VISTO`** (`Sello color="verde"`, `anim-stampin`) al pie del
   documento, junto a la línea mono: `Documento auditado. Ahora sos testigo.`
3. El bloque es `role="status"` (se anuncia solo); con `prefers-reduced-motion` el
   sello aparece sin animación (estado final).

Respaldo de ley: §10.5 catálogo cerrado — «documento auditado → VISTO». No se inventa
sello: se usa el que la ley ya reservó exactamente para esto. (El manifiesto usará
LEÍDO ENTERO; el mandato se **audita**.)

## Estados mudos (§10.9 — hablan)

- **Documento cargando:** skeleton §5 (`anim-pulso-papel`, bloques del tamaño real de
  la card papel) + microcopy mono: `Cargando — menos que un trámite.`
- **Error de `GET /api/mandato/documento`:** en lugar de la card papel:
  `Esto se rompió. Lo decimos porque publicamos todo.` + botón fantasma `Probar de nuevo ↺`.
- **Vacíos por sección:** ya especificados por régimen (§3 y §4) — cada sección habla
  con su propia línea; el documento nunca desaparece por falta de datos.
- **Anexo cargando / no encontrado / error:** mismas reglas (skeleton, expediente
  extraviado, línea de error).

## Accesibilidad

- **Jerarquía:** un `<h1>` (portada), `<h2>` por sección (§2–§6 y cabecera del
  documento), `<h3>` para las secciones romanas del documento.
- **Barras y palitos:** decorativos `aria-hidden`; el dato accesible es el texto que
  los acompaña (etiqueta + valor mono). Nada de `role="progressbar"` — no son progreso,
  son cifras editoriales.
- **Sellos (EJEMPLO / VISTO):** son texto real, legible por AT; VISTO en
  `role="status"` para anunciarse al caer.
- **Citas-link del diagnóstico y títulos-link de acciones:** links reales con focus
  visible violeta 2px (`papel-root` global); en oscuro el focus usa violeta-claro.
- **Teclado:** tab recorre: links de §2 → citas/acciones del documento → CTA; en
  anexos: backlink → links → botones de voto. Targets ≥ 44px en CTA, votos y backlink.
- **Reduced motion:** guarda global de `index.css` — `inkfill(-claro)`, `growbar`,
  `semgrow`, `stampin`, `blink-cursor`, `fadeup` quedan en estado final. El documento
  nace completo y quieto.
- **AA en oscuro:** texto esencial solo en `oscuro-texto`/`oscuro-secundario`/
  `oscuro-meta` (≥ AA sobre #16130E); `oscuro-tenue` únicamente en pies de fuente
  (10px uppercase, no esencial — el mismo dato vive en el pie del documento papel).
  Colores semánticos en oscuro solo como relleno de barra/palito (gráfica), nunca como
  color de texto chico. En papel: **ámbar (#A16C00, ~3.9:1) queda flaggeado para el
  sweep 8.3** (mismo flag que la spec 2.2); mitigación local: la urgencia siempre está
  escrita, el color nunca es el único portador.
- **Cifras vivas:** la cifra del lead no usa aria-live (no debe interrumpir); es
  contenido normal al montar.

## Enmiendas a la ley (mismo commit que el código, regla del master plan)

1. **§6 Motion — keyframe nuevo `inkfill-claro`.** El rito §10.1 entinta gris→tinta;
   sobre página oscura el H1 terminaría invisible. Se agrega a la lista de keyframes
   canónicos: `inkfill-claro` (gris #5C594F → papel #F2EFE7), y la nota: «En página
   oscura el rito entinta hacia papel (`inkfill-claro`); los signos ¡ ! caen en
   violeta-claro.»
2. **§5 Título entintado — párrafo `RitoTinta`:** se añade «`tono='claro'` para
   páginas oscuras (El mandato): letras a `inkfill-claro`, signos en violeta-claro.»

(Ninguna otra enmienda: EJEMPLO y VISTO ya están en el catálogo §10.5; las barras
oscuras ya están en §13.)

## Decisiones

1. **Una API nueva, de solo lectura.** `GET /api/mandato/documento` agrega tablas
   existentes (dreams, pulse_signals, proposals, geographic_locations). Sin esquema
   nuevo, sin migración, sin tocar el cron. `territory_mandates` queda como está
   (rollup provincial del cron, sin consumidor — su superficie natural es el mapa o
   la prensa de datos, no este documento nacional).
2. **El documento es siempre el real.** No hay «documento demo» paralelo: hay UN
   documento con números reales (incluidos ceros) y el sello EJEMPLO como marcador de
   régimen mientras N < 100. Las secciones demo del especimen no se migran.
3. **Porcentajes solo con N ≥ 100** (umbral compartido con §13 palitos/barras). Bajo
   el umbral: conteos absolutos + palitos. Cero inventos, jamás.
4. **Dos fuentes, dichas con nombre.** Registro/recursos/brechas ← voces del mapa;
   diagnóstico ← señales clasificadas. El pie del documento imprime ambas fuentes y
   la fecha. La unificación (clasificar las voces del mapa) queda flaggeada como
   trabajo futuro de backend — esta página no la finge.
5. **Sin formulario de señales en la página.** La conversión es una: `/el-mapa`. El
   CTA lo dice («Sumar mi voz al mandato →») y la convergencia explica por qué.
6. **Sub-vistas como anexos del expediente**, no lectores ni páginas nuevas: mismas
   rutas, chrome oscuro + ficha papel, backlink siempre visible.
7. **VISTO como interacción firma** — exactamente el uso que §10.5 le reservó
   («documento auditado»), gatillado por lectura completa, una vez por montaje.
8. **La barra del tipo `valor` usa relleno papel** en oscuro (tinta sobre tinta es
   invisible); en el documento papel el tipo `valor` sigue siendo tinta. La etiqueta
   escrita es siempre el portador del significado.
9. **Cero íconos** (§12, página editorial): glifos `→ ↺ ▌ ✕` y sellos.
10. **`PAPEL_ROUTES` aprende prefijos** (los anexos son rutas dinámicas): cambio
    mínimo y sancionado en `RootLayout.tsx`, documentado en el plan.

## Definición de terminado (protocolo por página)

- [ ] Kicker + título Anton (rito de la tinta, variante clara) + CTA presentes.
- [ ] UNA interacción firma: sello VISTO al auditar el documento completo.
- [ ] Datos 100% reales: cifra del lead, registro, diagnóstico, recursos, brechas,
      acciones — por régimen N/M/P, sin porcentajes bajo umbral, sin `NotaDemo`, sin
      asteriscos (el mecanismo demo muere en esta página).
- [ ] Sello EJEMPLO presente ↔ N < 100, con su línea; ausente si N ≥ 100.
- [ ] La convergencia contada una sola vez (§2); ninguna otra sección la repite.
- [ ] Estados mudos con voz: carga, error, y el cero de cada sección.
- [ ] Anexos papel: señal y propuesta, con voto funcional (auth) y 404 expediente.
- [ ] Responsive: 1 columna, targets ≥ 44px, padding 20 móvil.
- [ ] Voseo consistente; «comillas angulares»; sin "registrate/únete".
- [ ] `/mandato-vivo` (+ anexos por prefijo) en `PAPEL_ROUTES`; el chrome glass de las
      tres páginas v1-port muerto; `App.tsx` sin cambios.
- [ ] Archivos ≤ 300 LOC (composer + `sections/` + data + regimen + anexos).
- [ ] Test de integración del endpoint `documento` (limpieza FK-safe explícita) +
      tests de componentes por sección y por régimen (0 / <100 / ≥100).
- [ ] `pnpm verify` verde.
- [ ] Verificación en navegador desktop + mobile con capturas (incluye: documento con
      datos reales del branch dev, sello VISTO al llegar al pie, anexos navegables; los
      datos de prueba creados se limpian de la DB dev al final).
- [ ] AA (flag ámbar documentado para 8.3) + `prefers-reduced-motion` deja estados
      finales + camino de teclado completo.
