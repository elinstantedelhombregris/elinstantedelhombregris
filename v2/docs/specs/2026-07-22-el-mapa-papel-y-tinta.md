# El mapa «Papel y Tinta» — página 2.2 del recorrido

**Fecha:** 2026-07-22
**Fuente de diseño:** `docs/design-system/BASTA-v2.dc.html` (pantalla `data-screen-label="El mapa"`)
**Sistema:** `docs/design-system/README.md` v1.1 (ley) · card 2.2 del master plan `docs/plans/2026-07-21-papel-y-tinta-master-plan.md` (decisión D3: sin librería de mapas)
**Plan de implementación:** `docs/plans/2026-07-22-el-mapa-plan.md`

> **Tesis de copy.** A `/el-mapa` llega el que tocó «Dejar mi voz» — convencido a medias,
> con algo atragantado — y la página tiene un solo trabajo: que suelte su primera voz en
> menos de 30 segundos y la vea caer en el mapa. Se va sabiendo que lo que dijo quedó:
> público, contado, y clavado en su provincia. Es la conversión primaria de todo el sitio.

## Por qué

El `/el-mapa` actual es un placeholder v1 en chrome oscuro («Mapa interactivo — en
construcción») que remata en `/registrarse` — exactamente el verbo prohibido por §7. El
diseño BASTA v2 lo reemplaza por la construcción nueva más grande del programa: un mapa
SVG real de la Argentina con las voces reales de la base, un panel para soltar la tuya
sin cuenta y sin fricción, y un feed que prueba que acá lo que se dice queda.

## Ruta y navegación

- **Canónica:** `/el-mapa` — ya existe en `App.tsx` (lazy sobre `~/pages/ElMapa`, named
  export). **No hay redirects nuevos ni cambios de nav**: `papel-nav.ts` ya apunta
  «El mapa» (num `02`) a `/el-mapa`.
- **`PAPEL_ROUTES`:** se agrega `/el-mapa` en `RootLayout.tsx` (grano + velo + chrome papel).
- **Lo que muere:** el contenido entero de `apps/web/src/pages/ElMapa.tsx` (glass,
  gradient-text, «Ser un punto del mapa» → registrarse, las 3 cards de roles). El archivo
  se reescribe como composer fino + `pages/ElMapa/sections/` (patrón Home/LaIdea);
  `App.tsx` no se toca.
- **SEO/título:** llega con la Fase 8.1 para todas las páginas. Fuera de alcance acá.

## Datos reales — inventario API (verificado 2026-07-22)

**Todo lo que la página necesita ya existe. Cero endpoints nuevos, cero cambios de
esquema, cero migraciones.**

| Necesidad | Endpoint existente | Nota |
|---|---|---|
| Soltar una voz | `POST /api/open-data/dreams` | Anónimo permitido (`optionalAuthenticate` + rate limit IP); CSRF allow-listed en `middleware/csrf.ts`; acepta `{ body, category?, provinceId?/provinceName?, submittedAs? }`; inserta con `status: 'approved'` fijo. Test de integración existente en `apps/api/tests/open-data-flows.test.ts`. |
| Voces con geo para los puntos | `GET /api/open-data/dreams?limit=500` | Devuelve `{ id, body, category, provinceId, submittedAs, createdAt }`, solo aprobadas, más nuevas primero. |
| Conteo autoritativo por provincia (clusters) | `GET /api/open-data/dreams/by-province` | `{ byProvince: [{ provinceId, count }] }` — cuenta más allá del cap de 500 de la lista. |
| Provincias (id → nombre, para el select y el match con el SVG) | `GET /api/open-data/provinces` | 24 filas seed (23 + CABA), nombres canónicos (`Ciudad Autónoma de Buenos Aires`). |
| Cifra de portada | `GET /api/analytics/voces-count` | Hook existente `useVocesCount()` — misma query key que el header: un solo fetch. |

- El esquema `dreams` (`packages/db/src/schema/dreams.ts`) ya tiene `category`,
  `provinceId`, `status` — pinning a nivel provincia (las ciudades no tienen coords, por
  diseño heredado del estado v1).
- **La geografía dibujada no viene de la API:** el contorno de las provincias se
  precomputa en build-time desde un GeoJSON Natural Earth commiteado (ver «El mapa
  técnico»). En runtime la app solo importa un módulo TS generado. Sin librería de mapas
  (D3 del master plan), sin fetch de geometría.

### La verdad sobre la moderación

`POST /api/open-data/dreams` inserta con `status: 'approved'` **hardcodeado** — hoy no
hay cola de moderación: la voz soltada es pública al instante, cuenta en
`voces-count` y aparece en la lista en el próximo fetch. **Por eso el copy afirma
inmediatez** («Ya está en el mapa, a la vista de todos») y es verdad. Si algún día se
introduce moderación previa (status `pending` al crear), este copy MUERE con ella y pasa
a: «Tu voz llegó. Aparece cuando pase la revisión.» — se deja constancia acá para que el
cambio de backend no deje a la página mintiendo.

## Estructura

Contenedor ancho `max-width:1440px` (§4), padding lateral 40/20. Desktop: grilla
`[mapa 1fr | columna 480px]`, el mapa ocupa dos filas y la columna derecha lleva panel +
feed. **Móvil (<960): portada → panel «Soltá tu voz» → mapa → feed** — la conversión va
antes que el espectáculo cuando la pantalla es chica. **Toda la prosa de abajo es el
copy final — el implementador la transcribe tal cual, no la reescribe.**

### § 1 — Portada

- Kicker violeta: `El mapa de las voces`
- H1 Anton `clamp(44px,6vw,88px)` con **rito de la tinta** (vía `RitoTinta`, §10.1
  obligatorio; sin signos `¡ !` — solo inkfill, mismo criterio que La idea):

  > **El país, dicho**
  > **por su gente.**

- A la derecha (alineado abajo), **la cifra viva**: `{N}` en Anton 52px violeta
  (`toLocaleString('es-AR')`) + línea mono 11px tinta-50: `voces en el mapa` (singular
  `voz en el mapa` si N=1). **Sin asterisco: es dato real** (`useVocesCount`). Mientras
  carga o si falla, el bloque entero no se renderiza — nunca un número de reserva.

### § 2 — El mapa (columna izquierda)

Marco `border 1px tinta`, fondo `papel-crudo`, padding 28 (16 móvil), `position:relative`
(ancla del popover). Adentro:

- **SVG de la Argentina** (`viewBox` del módulo generado, ≈ 468×1000): 24 provincias
  como `<path>` con `fill-papel-mapa` (#E4E0D3) y `stroke-tinta` 1.2px.
- **Puntos de voz**: cada punto es UNA voz real aprobada. Se ancla al centroide de su
  provincia con **jitter determinista** (espiral de ángulo áureo indexada — mismo input,
  mismo dibujo; nada de aleatorio por render). Por punto: halo `anim-pulse-dot`
  (opacidad 0.2, delays escalonados) + punto sólido `anim-dropin` con borde papel 1px.
  Color = tipo de voz (§7): basta=sello, sueño=violeta, necesidad=ámbar,
  compromiso=verde, recurso=cian, valor=tinta; categoría desconocida o null cae en
  `valor` (mismo criterio que `VocesTicker`).
- **Clusters con número**: máximo **8 puntos por provincia**; si el conteo autoritativo
  (`by-province`) supera 8, junto al racimo va el total en Space Mono 13px bold tinta
  (el «tally-numbered cluster» de D3).
- **La unidad interactiva es la provincia, no el punto**: las provincias CON voces son
  clickeables/focusables (target enorme, amigable al pulgar) y abren el popover; los
  puntos son textura visual pura (`aria-hidden`, `pointer-events:none`). Hover de
  provincia interactiva: `fill-papel-presionado`.
- **Leyenda honesta** (mono 10px uppercase tinta-30, bajo el SVG, dentro del marco):

  > Cada punto es una voz real, ubicada en su provincia — no en una dirección.

- Voces **sin provincia** no dibujan punto: cuentan en la cifra y aparecen en el feed
  (ver § 4 y el microcopy del select).

### § 3 — Popover de la voz seleccionada

Card absoluta arriba a la derecha del marco del mapa (max-width 300, `anim-fadeup`),
fondo tinta, texto papel, **sin radius**, borde izquierdo 2px del color del tipo (el
color va en el borde, no en texto chico sobre oscuro — AA). Contenido:

- Fila superior: tipo en mono 10px bold uppercase papel + botón «✕» tipográfico
  (mono, `aria-label="Cerrar"`).
- Cuerpo: `«{texto de la voz}»` 15px (max-height ~220px con scroll si la voz es larga).
- Fila inferior: meta mono 11px `oscuro-meta`: `{Provincia} · voz {i} de {n}` + si n>1,
  control mono 11px `violeta-claro`: `otra →` que cicla a la siguiente voz de esa
  provincia.

Comportamiento: se abre al activar una provincia (mostrando la voz más reciente); un
popover por vez; cierra con «✕», con `Escape` o al activar otra provincia. Al abrir, el
foco va al «✕»; al cerrar, vuelve al `<path>` de la provincia.

### § 4 — Panel «Soltá tu voz» (columna derecha, arriba)

Caja `border 1px tinta`, fondo papel. Header con borde inferior tinta:
`Soltá tu voz` (mono 11px bold uppercase, es el `<h2>`) — y a la derecha, en violeta:
`30 segundos`.

Formulario (§5 kit completo), en este orden:

1. **Tipo de voz** — los 6 `ChipTipo` (primer consumo real de la primitiva, smoke test
   incluido): `basta · sueño · necesidad · compromiso · recurso · valor`. Grupo
   `role="group"` `aria-label="Tipo de voz"`; cada chip envuelto en `<button
   type="button" aria-pressed>` con hit-area ≥ 44px (focus visible violeta del
   `papel-root`). Sin selección por defecto — elegir el tipo ES parte de decir.
2. **Textarea** (borde tinta, fondo papel-crudo, sin radius, 3 filas, `maxLength` 2000).
   Placeholder según el tipo elegido (retórica estática, sin pretensión de dato):
   - sin tipo: `Elegí un tipo y decilo como te sale.`
   - basta: `¿De qué te cansaste? Decilo sin filtro.`
   - sueño: `¿Qué país te imaginás? Escribilo como si ya existiera.`
   - necesidad: `¿Qué falta donde vivís? Nombralo concreto.`
   - compromiso: `¿Qué vas a hacer vos? Prometé poco y cumplilo.`
   - recurso: `¿Qué sabés hacer, qué tenés para prestar? Ofrecelo.`
   - valor: `¿Qué no se negocia para vos? Dejalo por escrito.`
3. **Select de provincia** (§5: nativo estilizado, borde tinta, fondo papel-crudo,
   flecha `▾` tipográfica). Etiqueta mono: `¿Desde dónde? (opcional)`. Opción default:
   `Toda la Argentina`. Opciones: las 24 provincias reales de la API. Ayuda mono 10px
   tinta-50:

   > Sin provincia tu voz cuenta igual, pero no cae en el mapa.

4. **Submit**: `BotonPapel variant="violeta"` ancho completo: **Soltar la voz →**.
   Deshabilitado (§5 Estados: tinta-30, nunca opacity) hasta que haya tipo + texto no
   vacío. Cargando: `loading` de BotonPapel («— ▌» con blink-cursor).

**Decisión: sin campo de nombre.** La API acepta `submittedAs` pero el formulario no lo
pide: la promesa son 30 segundos y el default es el anonimato (§14: «anónimo si
querés» — acá, anónimo directamente). Payload: `{ body, category: tipo, provinceId? }`.

**Errores** (mono 11px rojo-sello, `role="alert"` debajo del botón):
- Rate limit (`RATE_LIMITED`): se muestra el mensaje del server tal cual — ya es
  honesto y rioplatense («Demasiadas solicitudes. Intentá de nuevo en un momento.»).
- Cualquier otro error: `Esto se rompió. Lo decimos porque publicamos todo. Probá de nuevo.`

### § 5 — Feed «últimas voces» (columna derecha, abajo)

- Etiqueta mono 11px uppercase tinta-50 (es `<h2>`): `Últimas voces`
- Columna de filas con juntas de 1px `papel-borde` (§4 grillas), max-height 380 con
  scroll. Cada fila (fondo papel, padding 16/18): fila mono 10px uppercase con el tipo
  en su color semántico (bold) a la izquierda y la provincia en tinta-30 a la derecha
  (`Argentina` si la voz no tiene provincia); debajo `«{texto}»` 14px tinta-90. Muestra
  las 12 más nuevas (mismo query que los puntos — un solo fetch para mapa + feed).
- Cierre de columna (borde superior tinta, 14px tinta-50):

  > Cada voz queda pública: cualquiera la puede leer, contar y auditar. De acá sale
  > [El mandato](/mandato-vivo) — el país pedido por escrito.

  («El mandato» es link a `/mandato-vivo`, semibold tinta.)

## La interacción firma: la voz soltada

Presupuesto §6: una sola interacción firma — es esta. El rito de la tinta del H1 es el
ritual universal y no cuenta; los halos `pulse-dot` son ambiente, no interacción.

1. Usuario completa tipo + texto (+ provincia si quiere) y toca «Soltar la voz →».
2. `POST /api/open-data/dreams`. Botón en estado cargando.
3. **Al 201, tres cosas a la vez:**
   - (a) **Sello `RECIBIDA`** (verde, `Sello color="verde"`, `stampin`) cae en el panel
     con la línea mono: con provincia →
     `Tu voz cayó en {Provincia}. Ya está en el mapa, a la vista de todos.` · sin
     provincia → `Tu voz quedó registrada. Ya cuenta con todas las demás.`
   - (b) **`despertar()`** — disparador canónico «primera voz soltada» (§10.7): el velo
     gris se disuelve en 1.4s. Si ya estaba despierto, no pasa nada visible (idempotente).
   - (c) **El punto aparece**: la mutación invalida las queries de `open-data` y
     `analytics` — el mapa refetchea y el punto nuevo entra con `anim-dropin`, el feed
     muestra la voz arriba de todo, la cifra de portada y el contador FOMO del header
     suben. La página entera confirma: lo que dijiste quedó.
4. El textarea se limpia (el tipo queda elegido); el sello queda visible; se puede
   soltar otra voz — el rate limit del server es el techo.

## El mapa técnico (decisión D3: sin librería)

- **Dataset:** `scripts/build/data/argentina-provincias.geojson` — GeoJSON de 24
  provincias derivado de **Natural Earth** (dominio público), simplificado (~18 KB, 684
  vértices, geometrías `Polygon`, propiedad `name`). Se commitea como fuente. Origen: el
  mismo asset público que servía el mapa v1
  (`SocialJusticeHub/client/public/data/argentina-provinces-simplified.geojson`) — es un
  **dato** de dominio público, no código v1; se copia el archivo, no se importa nada.
- **Precomputación (build-time, una vez):** `scripts/build/build-mapa-argentina.ts`
  proyecta lon/lat → SVG con equirectangular corregida por `cos(latitud media)` (alto
  1000, margen 8 → viewBox ≈ 476×1000; el mismo aspecto que el especimen, 467.9×1000) y
  calcula el centroide (shoelace del anillo exterior) por provincia. Emite
  `apps/web/src/pages/ElMapa/argentina-mapa.generated.ts` (**commiteado**, header «NO
  EDITAR», orden alfabético para diffs estables): `MAPA_VIEWBOX` +
  `PROVINCIAS_SVG: readonly { nombre, path, cx, cy }[]`.
- **Match con la DB por nombre canónico:** el generador normaliza
  `Ciudad de Buenos Aires` → `Ciudad Autónoma de Buenos Aires` (mismo criterio que
  `normalizeProvinceName` del repo geográfico); los 24 nombres del módulo generado
  coinciden 1:1 con el seed de `geographic_locations`. Un test de invariantes lo
  garantiza.
- **Cero dependencia de runtime:** ni fetch de geometría ni librería de proyección; la
  app importa el módulo TS. Detalle de implementación clave: los keyframes
  `pulse-dot`/`dropin` escalan — los círculos SVG necesitan
  `[transform-box:fill-box] origin-center` para no escalar desde el origen del viewBox.

## Estados mudos (§10.9 — hablan)

- **Mapa/feed cargando:** skeleton §5 (`anim-pulso-papel`, bloques papel-presionado del
  tamaño real) + microcopy mono: `Cargando — menos que un trámite.`
- **Cero voces en la base:** el mapa se dibuja limpio y la leyenda del marco dice:
  `Todavía no hay voces acá. Qué oportunidad.` El feed dice:
  `El país todavía no dijo nada acá. Empezá vos.` La cifra de portada muestra el 0 real.
- **Error de carga (mapa o feed):** `Esto se rompió. Lo decimos porque publicamos todo.`
- **Error de envío:** ver § 4.

## Accesibilidad

- **Camino de teclado completo:** tab → chips de tipo (aria-pressed) → textarea →
  select → «Soltar la voz» → provincias con voces del SVG (`role="button"`,
  `tabIndex=0`, activación con Enter/Espacio) → dentro del popover: «✕» y «otra →»
  (Escape cierra) → filas del feed son contenido, no controles. Focus visible violeta
  2px global (`papel-root`); en los `<path>` del SVG el focus es
  `focus-visible:stroke-violeta stroke-2`.
- **La historia AT de los puntos:** los puntos y halos son decorativos (`aria-hidden`);
  el dato accesible vive en (a) la provincia focusable —
  `aria-label="{Provincia}: {n} voces. Leer la última."` (singular «1 voz») —, (b) el
  popover (`role="dialog"`, `aria-label="Voz de {Provincia}"`, foco al abrir/cerrar
  gestionado), y (c) el feed, que lista las mismas voces como texto. El SVG raíz:
  `role="group"` `aria-label="Mapa de la Argentina: las voces por provincia"`.
- **Confirmación de envío:** el bloque del sello RECIBIDA es `role="status"` (aria-live
  implícito); los errores, `role="alert"`.
- **Reduced motion:** la guarda global de `index.css` apaga `pulse-dot`, `dropin`,
  `stampin`, `inkfill`, `fadeup`, `pulso-papel` dejando estados finales — el mapa nace
  quieto y completo.
- **AA:** popover con tipo-color en borde (no en texto sobre oscuro). En el feed el tipo
  va en su color semántico sobre papel: sello/violeta/verde/cian pasan AA; **ámbar
  (#A16C00, ~3.9:1) queda flaggeado para el sweep 8.3** — es un problema del sistema
  (ChipTipo activo lo comparte), no de esta página; mitigación local: el color nunca es
  el único portador (el nombre del tipo siempre está escrito).
- Targets ≥ 44px en chips, botón, select, filas; las provincias son targets gigantes.

## Enmiendas a la ley (mismo commit que el código, regla del master plan)

1. **§10.7 — concretar el disparador pendiente.** `primera voz soltada` pasa a
   `primera voz soltada (botón «Soltar la voz», El mapa)` — deja de ser una promesa y
   pasa a señalar el control real.
2. **§5 — receta nueva «Popover de mapa»** (el kit tiene modal/toast/tooltip pero no
   popover anclado; el mapa lo necesita):

   ```markdown
   Popover de mapa
   Card absoluta dentro del marco del mapa (max-width 300): fondo #16130E, texto
   #F2EFE7, sin radius, borde izquierdo 2px del color semántico de la voz, padding 20,
   entra con fadeup. Cierre «✕» tipográfico + Escape; uno por vez; el foco entra al «✕»
   y vuelve al disparador al cerrar. En la app: `PopoverVoz`
   (`pages/ElMapa/sections/PopoverVoz.tsx`).
   ```

## Decisiones

1. **Cero API nueva.** Los 5 endpoints existen; el único trabajo de backend es ampliar
   la cobertura de integración del contrato que el mapa explota (round-trip de
   `category` + `provinceName→provinceId`), que hoy no está asertada.
2. **La provincia es el control; el punto es tinta.** Targets grandes, 24 tab-stops
   máximo, AT con sentido — y el especimen se respeta visualmente (puntos + halos +
   clusters numerados).
3. **Jitter determinista, cap 8 + número.** El especimen muestra racimos; la verdad es
   pinning provincial. El jitter es estable (indexado, sin random) y la leyenda lo dice
   sin vueltas: provincia, no dirección.
4. **Sin campo de nombre** (anonimato por defecto; `submittedAs` queda para superficies
   futuras).
5. **Sin provincia = sin punto, con conteo.** Es la verdad del dato y el select lo
   avisa antes de enviar.
6. **Móvil: panel antes que mapa.** La conversión no espera el scroll.
7. **Copy de inmediatez** amarrado al `status:'approved'` hardcodeado del endpoint —
   con cláusula de muerte si aparece moderación (ver arriba).
8. **Cero íconos** (§12, página editorial): glifos `→ ▾ ✕ ▌` y sellos.
9. **Dataset commiteado + módulo generado commiteado**: el build de la app nunca
   depende del script; regenerar es opt-in y determinista.

## Definición de terminado (protocolo por página)

- [ ] Kicker + título Anton (rito de la tinta vía `RitoTinta`) + CTA presentes.
- [ ] UNA interacción firma: voz soltada → sello RECIBIDA + `despertar()` + punto nuevo.
- [ ] Datos 100% reales: cifra, puntos, clusters, feed — sin asteriscos porque no queda
      nada demo (el `* datos de demostración` del especimen NO se replica).
- [ ] Estados mudos con voz: vacío, cargando, error (mapa, feed y envío).
- [ ] Responsive: 1 columna <960 con el panel antes del mapa; targets ≥ 44px.
- [ ] Voseo consistente; «comillas angulares»; sin "registrate/únete".
- [ ] `/el-mapa` en `PAPEL_ROUTES`; el placeholder v1 muerto; `App.tsx` sin cambios.
- [ ] Archivos ≤ 300 LOC (composer + `sections/` + data + geo + módulo generado).
- [ ] Test de integración del contrato API (round-trip categoría+provincia, limpieza
      FK-safe explícita) + tests de componentes de cada sección.
- [ ] `pnpm verify` verde.
- [ ] Verificación en navegador desktop + mobile con capturas (incluye: soltar una voz
      real de prueba, ver RECIBIDA + despertar + punto + feed + contadores, y limpiar la
      voz de prueba de la DB dev al final).
- [ ] AA (con el flag ámbar documentado para 8.3) + `prefers-reduced-motion` deja
      estados finales + camino de teclado completo (incluye popover).
