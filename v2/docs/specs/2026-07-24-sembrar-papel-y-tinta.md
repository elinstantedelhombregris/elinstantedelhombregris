# Sembrar «Papel y Tinta» — página 2.5 del recorrido

**Fecha:** 2026-07-24
**Fuente de diseño:** `docs/design-system/BASTA-v2.dc.html` (pantalla `data-screen-label="Sembrar"`)
**Sistema:** `docs/design-system/README.md` v1.1 (ley) · card 2.5 del master plan `docs/plans/2026-07-21-papel-y-tinta-master-plan.md`
**Plan de implementación:** `docs/plans/2026-07-24-sembrar-plan.md`

> **Tesis de copy.** A `/sembrar` llega el que ya recorrió el sitio y quiere dejar algo
> más que una voz suelta: un compromiso con nombre de contrato. La página tiene un solo
> trabajo: sacarle tres frases — su basta, su sueño, su compromiso — en dos minutos y
> devolverle un certificado con número real que pueda guardar, copiar e imprimir. Se va
> con un papel que es suyo, con la certeza de que su semilla ya cuenta en la portada del
> sitio, y con la invitación de seguir al mapa.

## Por qué

El `/la-semilla-de-basta` actual es un puerto v1: seis cards glass con serif y
gradient-text que enumeran principios, un blockquote y dos botones («Sumarse al
movimiento» → `/registrarse`, exactamente lo que §7 prohíbe). No hay semilla, no hay
acto: es una página de lectura que pide registro. El diseño BASTA v2 la convierte en lo
que §8 promete — `Sembrar (3 pasos → certificado semilla)` — el segundo acto de
conversión del sitio (§8: primaria = la voz en el mapa; secundaria = plantar la
semilla).

Además esta página salda la deuda de la card 2.0: los «semillas plantadas» demo se
retiraron de la portada con la promesa de «volver en 2.5 como reales». Acá nace la
tabla, el endpoint y el conteo real — y la portada recupera su tile sin inventar nada.

## El problema de diseño central: un certificado honesto

La tentación de un certificado es el teatro: un número inflado, una promesa de «tu
semilla alimenta el mandato» que el backend no cumple. Regla del programa: **cero datos
hardcodeados, cero flujos fingidos**. Las decisiones que siguen:

1. **El N° del certificado es el `id` serial real** de la fila insertada (`Semilla N°
   {id}`, formato es-AR). Es numeración de expediente, no un conteo: si mañana se
   moderan filas, el id no miente porque nunca dijo ser un total.
2. **La única cifra agregada es `GET /api/semillas/count`** — y su superficie es el
   tile de la portada `/` (vuelta sancionada por la card 2.0). El asistente NO muestra
   conteos: no hay «sos la semilla N° {count}» ni «ya somos {N}» — el certificado habla
   de vos, la portada habla del total.
3. **La semilla no entra al mandato ni al mapa** (tabla propia, sin clasificador, sin
   provincia). El copy no lo finge: dice que se planta acá, que se suma a la cuenta
   pública y que el papel es tuyo. Unificar semillas con las voces del mapa sería una
   decisión de producto futura — esta página no la anticipa ni la simula.
4. **La fecha del certificado es `createdAt` de la base**, no el reloj del cliente.

## La semilla — el modelo de datos (hoy no existe: verificado 2026-07-24)

`grep -rn semilla packages/ apps/api/src` → cero resultados. Se construye todo:

**Tabla `semillas`** (dominio nuevo `packages/db/src/schema/semillas.ts`):

| Columna | Tipo | Nota |
|---|---|---|
| `id` | serial PK | El N° del certificado. |
| `user_id` | integer FK `users.id`, `onDelete:'set null'` | Solo si hay sesión (`optionalAuthenticate`) — «Sin registro» es literal. |
| `basta` | text NOT NULL | Frase 1. |
| `sueno` | text NOT NULL | Frase 2 (columna sin ñ; la ñ vive en la UI). |
| `compromiso` | text NOT NULL | Frase 3. |
| `status` | text NOT NULL default `'approved'` | `'pending' \| 'approved' \| 'rejected'` — paridad exacta con `dreams`. |
| `created_at` | timestamptz NOT NULL defaultNow | La fecha del certificado. |

Índice: `semillas_status_idx` (el conteo público filtra por status). **Sin
`updated_at`:** la semilla es inmutable por diseño — no se edita, se planta otra.
**Sin nombre, sin provincia, sin ciudad:** el especimen no los pide (tres textareas y
nada más), el pie del asistente promete «Anónimo si querés · Sin registro · Sin spam»,
y la geografía es el lenguaje del mapa, no del contrato personal. Migración Drizzle en
el mismo PR (regla de `v2/CLAUDE.md`).

**Moderación — publicación inmediata (decisión).** Cómo funciona en `dreams` (leído
2026-07-24): `POST /api/open-data/dreams` inserta con `status:'approved'` directo, y
todo número público cuenta `status='approved'` (`countApproved`). En 2.5 no existe
ninguna superficie pública que muestre semillas individuales — solo el conteo — así que
una cola de aprobación no protegería nada visible y agregaría fricción al acto. Se
publica inmediato con la misma paridad: la columna `status` existe para que la
moderación futura sea un cambio de política, no una migración.

**Repositorio** `packages/db/src/repositories/semillas.ts` — `SemillasRepository` con
`create()` y `countApproved()` (espejo de `DreamsRepository`, sin listados: nada los
consume hoy y no se construye API muerta).

### El contrato de la API (feature slice `semillas`)

```
POST /api/semillas
  body    { basta: string, sueno: string, compromiso: string }
          (Zod: trim, min 1, max 280 por frase — mensajes rioplatenses)
  guards  anonSubmitRateLimit() (30/h por IP, mismo techo que dreams/pulso)
          · optionalAuthenticate (userId si hay sesión)
          · allow-list CSRF (POST anónimo por diseño → entrada nueva en
            middleware/csrf.ts ANON_ALLOWED, igual que /api/open-data/dreams)
  → 201   { data: { id: number, createdAt: string } }

GET /api/semillas/count
  → 200   { data: { total: number } }        (solo status='approved')
```

Envelope `{ data }` estándar (lo desenvuelve `lib/api.ts`). Cada endpoint con test de
integración contra Postgres real y **limpieza explícita por id en `afterAll`**
(`semillas.userId` es `onDelete:'set null'` — borrar usuarios no borra filas; patrón
`tests/gamification-hooks.test.ts` / `analytics-flows.test.ts`, aserciones relativas,
jamás conteos globales exactos).

## Ruta y navegación

- **Canónica nueva:** `/sembrar`. No existe en `App.tsx` — **modificar `App.tsx` está
  sancionado para esta página** (lazy `Sembrar` + `<Route path="/sembrar">`): es ruta
  nueva, no hay otra forma.
- **Redirect:** `/la-semilla-de-basta` → `/sembrar` con el patrón ya shipeado de
  `/la-vision` (`<Route path="/la-semilla-de-basta"><Redirect to="/sembrar" replace /></Route>`).
  `LaSemillaDeBasta.tsx` y su lazy import se borran.
- **`PAPEL_ROUTES`:** `/sembrar` al Set (igualdad exacta; sin prefijos — no hay
  sub-rutas). Flip al final, estado interino aceptado (mismo orden que 2.3/2.4).
- **Chrome (sweep sancionado, diff mínimo):** `papel-nav.ts` cambia
  `SEMBRAR_HREF = '/sembrar'` y el item `Sembrar` de `PAPEL_NAV_ALL` lo referencia —
  el CTA del header, el menú móvil y el footer apuntan solos a la ruta nueva (cero
  cambios en `PapelHeader/Footer`). `Home/sections/CtaBand.tsx` actualiza su link
  «Sembrar mi compromiso». Tests de Home y PapelHeader actualizan el href esperado.
- **Lo que muere / se transforma (inventario v1-port):**

| Feature v1-port | Destino |
|---|---|
| `LaSemillaDeBasta.tsx`: grilla glass de seis principios («Verdad y palabra cumplida», …) | **No se migra acá.** Es contenido manifesto-adjacent (el pacto que se firma), no un asistente. Queda flaggeado a la Fase 3.3 (lector manifiesto) / 3.7 (paridad de contenido) como decisión editorial del autor. |
| Blockquote «Si este pacto resuena en vos…» | Mismo destino: flag a 3.3/3.7. |
| CTA «Sumarse al movimiento» → `/registrarse` | **Muere.** §7 prohíbe «únete/registrate»; el acto de esta página es sembrar, sin cuenta. |
| CTA «Leer el manifiesto completo» | **Muere en esta página** (el recorrido al manifiesto vive en la biblioteca). |
| Chrome glass/gradient-text/serif | Muere entero. |

## Estructura de la página (`/sembrar`)

Página papel estándar (chrome de RootLayout), contenedor `max-w-[900px]` (especimen),
padding lateral 40/20, `py-[72px]`. Dos estados excluyentes: **asistente** (sin semilla
guardada) y **certificado** (semilla plantada — incluida la vuelta con localStorage,
ver Decisión 11). **Toda la prosa de abajo es el copy final — el implementador la
transcribe tal cual.**

### § 1 — Portada

- Kicker violeta: `Sembrar · 3 pasos · 2 minutos` — en estado certificado cambia a
  `Sembrar · plantada`.
- H1 Anton `clamp(44px,6vw,84px)` con rito de la tinta (`RitoTinta`, una línea):

  > **Tu semilla.**

  (El especimen pinta el punto final en violeta; la primitiva `RitoTinta` no tiene
  variante de signo suelto y no se extiende por un píxel: punto en tinta — consistencia
  de primitiva sobre fidelidad de píxel, mismo criterio que 2.4-D12.)
- Lead (Archivo 18px, tinta-75, max-width 600) — solo en estado asistente:
  `Una semilla son tres frases tuyas: tu basta, tu sueño y tu compromiso. Se planta acá, se suma a la cuenta pública y no se borra con el próximo tuit del ministro.`

### § 2 — El asistente (stepper §5, enmienda 1)

- **Indicador de pasos:** fila `flex gap-2` de tres tramos `flex:1;height:4px` —
  completados y actual `bg-violeta`, pendientes `bg-papel-borde`, transición
  `background .3s`; el contenedor es `aria-hidden` (el estado accesible es la línea
  mono de la card).
- **Card del paso:** borde 1px tinta, fondo `bg-papel-crudo`, padding 40 (24 móvil):
  - Línea mono 12px uppercase tinta-50: `Paso {n} de 3`.
  - Título del paso en Anton `clamp(26px,3.4vw,40px)` (h2; recibe foco al cambiar de
    paso, `tabIndex={-1}`).
  - Guía 15px tinta-50.
  - Un solo campo: textarea del kit §5 (borde 1px tinta, fondo papel, padding 16,
    17px, `rows=3`, `maxLength=280`), etiquetado por el título del paso
    (`aria-labelledby`).
  - Navegación: botón «← Volver» mono (deshabilitado en el paso 1 — §5 Estados:
    tinta-30 + not-allowed, nunca opacity) · a la derecha `BotonPapel variant="tinta"`
    con `Siguiente →` (pasos 1–2) o `Plantar mi semilla` (paso 3), deshabilitado hasta
    que la frase tenga contenido (`trim().length > 0`), `loading` durante el POST.
- **Los tres pasos (copy y campo):**

| Paso | Título | Guía | Placeholder |
|---|---|---|---|
| 1 · `basta` | `Tu basta` | `Lo que no estás dispuesto a aguantar ni un día más. Sin diplomacia.` | `Basta de…` |
| 2 · `sueno` | `Tu sueño` | `El país que querrías si nadie te dijera que es imposible.` | `Sueño con…` |
| 3 · `compromiso` | `Tu compromiso` | `Lo que vas a poner vos. Chiquito y real vale más que épico y falso.` | `Me comprometo a…` |

- **Comportamiento:** avanzar exige el campo con contenido; **volver nunca pierde lo
  escrito** (las tres frases viven en el estado del asistente). El primer
  «Siguiente →» (completar el paso 1) dispara **`despertar()`** — es el primer acto
  concreto del visitante que llegó directo por URL (enmienda 2, §10.7). En el paso 3,
  el botón envía `POST /api/semillas` con las tres frases trimmeadas.
- **Pie del asistente** (mono 11px uppercase tinta-30):
  `Anónimo si querés · Sin registro · Sin spam`
- **Error del POST** (§5 error): línea mono 11px rojo-sello bajo el botón — si el
  server devolvió `RATE_LIMITED`, su mensaje tal cual; si no:
  `Esto se rompió. Lo decimos porque publicamos todo. Probá de nuevo.`
  (patrón exacto de `PanelSoltarVoz`). Lo escrito NO se pierde en el error.

### § 3 — El certificado (la interacción firma)

Al 201, el asistente se reemplaza por el certificado:

- **La semilla SVG** (120×150, centrada, `aria-hidden`): tallo `stroke` tinta 3px que
  crece con `anim-semgrow` (0.9s, origin en la base, delay .2s) + hoja violeta
  (`anim-leafpop`, delay 1s) + hoja tinta (`anim-leafpop`, delay 1.25s) — paths del
  especimen tal cual, colores vía `text-violeta/text-tinta` + `fill-current`/
  `stroke-current` (cero hex en TSX, §9b).
- **La card del certificado** (borde 1px tinta, fondo `bg-papel-crudo`, padding 44
  (24 móvil), `relative`, clase `edicion-impresa`):
  - **Sello `Plantada`** (`Sello color="violeta"`, rotado +6°, `anim-stampin`) arriba
    a la derecha — catálogo cerrado §10.5: «semilla → PLANTADA». **Se imprime.**
  - h2 mono 12px uppercase tinta-50 (recibe foco al plantar, `tabIndex={-1}`):
    `Semilla N° {id} — {fecha}` ({id} `toLocaleString('es-AR')`; {fecha} =
    `createdAt` de la base, `toLocaleDateString('es-AR', { day:'numeric',
    month:'long', year:'numeric' })`).
  - **Las tres frases** (columna, gap 22): por frase, etiqueta mono 10px uppercase en
    su color semántico §7 — `Mi basta` rojo-sello · `Mi sueño` violeta ·
    `Mi compromiso` verde — y la frase en Anton 24px entre comillas angulares:
    `«{frase}»`.
  - **Acciones** (borde superior 1px papel-borde, flex wrap, gap 12 — `print:hidden`):
    - `BotonPapel variant="tinta"`: `Copiar para compartir` — escribe al portapapeles
      (ver abajo) y muta a `✓ Copiada` por 2s (`role="status"`).
    - `BotonPapel variant="fantasma"`: `Imprimir el certificado` — `window.print()`.
    - Link mono tinta-50 alineado a la derecha: `Plantar otra` — borra la semilla
      guardada y reinicia el asistente en el paso 1.
- **Cierre** (fuera de la card, centrado, 15px tinta-50 — `print:hidden`):
  `Guardala. Es tu contrato con vos. Cuando el movimiento te pese, volvé a leerla.`
  + link mono 12px bold uppercase violeta: `Ahora soltá tu voz en el mapa →`
  (`/el-mapa` — el certificado no compite con la conversión primaria: la alimenta).

**Texto copiado** (portapapeles, `navigator.clipboard.writeText` con try/catch):

```
MI SEMILLA ¡BASTA! N° {id}
Mi basta: {basta}
Mi sueño: {sueno}
Mi compromiso: {compromiso}
Plantá la tuya → {origin}/sembrar
```

### § 4 — La vuelta (localStorage)

La semilla plantada se guarda en `localStorage['basta_semilla']`
(`{ id, fecha, basta, sueno, compromiso }`, try/catch como `lib/despertar.ts` — sin
storage dura la sesión en memoria). Volver a `/sembrar` muestra el certificado, no el
asistente: un contrato que se evapora al refrescar contradiría su propio copy.
«Plantar otra» borra la clave y rearma el asistente vacío (el registro anterior sigue
en la base — el papel local es la copia del usuario, no la verdad).

## La edición impresa (§10.8 — el patrón YA existe, se reusa tal cual)

El patrón es el de 2.4 (`PlanDetail.tsx` + `index.css`) y **no se re-deriva nada**:

1. El chrome ya no se imprime (`print:hidden` en `PapelHeader`/`PapelFooter`/
   `PaperGrain`/`DespertarVeil` desde 2.4). Cero cambios de chrome.
2. La serifa ya vive en `index.css` (`.edicion-impresa` — verificado 2026-07-24,
   bloque `@media print` presente). La card del certificado lleva la clase y listo.
3. Lo propio de este lector: **folio** primera línea de la card, `hidden print:block`,
   mono 10px uppercase: `¡BASTA! · edición del lector · {fecha}` (formato exacto
   §10.8/PlanDetail) · `print:hidden` en portada (§1), acciones y cierre · **el sello
   PLANTADA y la semilla SVG se imprimen** (la honestidad y la firma viajan con el
   papel) · las tres frases con sus etiquetas son el cuerpo impreso.

§10.8 ya enumera «certificado de semilla» entre los lectores que imprimen perfecto:
esta página cumple la ley, no la enmienda.

## La interacción firma (presupuesto §6: una por página)

**El nacimiento de la semilla.** Un solo momento compuesto al 201: el tallo crece
(`semgrow`), las hojas brotan (`leafpop`) y el sello PLANTADA cae (`stampin`) — la
secuencia completa dura ~1.9s y es la razón de ser de la página. Todo lo demás entra
con `fadeup` escalonado estándar; el rito de la tinta del H1 es el ritual universal
§10.1 y no cuenta contra el presupuesto. Los keyframes `semgrow`/`leafpop` y sus
wrappers `.anim-semgrow`/`.anim-leafpop` ya existen en `index.css` (Fase 1, verificado
2026-07-24) — cero CSS nuevo.

## Estados mudos (§10.9)

- **El asistente no tiene carga:** no consulta nada al montar (sin conteos, sin
  fetches). El único estado pendiente es el POST (botón `loading` «— ▌»).
- **Error del POST:** la línea §5 bajo el botón (copy arriba); rate-limited muestra el
  mensaje del server (`Demasiados intentos…`). Lo escrito se conserva.
- **Portapapeles sin permiso:** el try/catch silencioso del especimen — el botón no
  confirma lo que no pasó (sin `✓ Copiada` si falló).
- **Sin localStorage:** el certificado vive en memoria; al cerrar, quedó en la base.
- **Tile de la portada `/`:** skeleton `CifraValor` existente (carga/error → bloque
  papel-presionado, jamás un número inventado).

## La vuelta de las semillas a la portada (sweep sancionado)

La card 2.0 retiró el demo «3.107 semillas plantadas» con vuelta prometida en 2.5. Es
la excepción cross-page de este trabajo (misma vara que el sweep `VocesTicker` de 2.4):
tarea final, diff mínimo, con test:

- `lib/queries/semillas.ts`: `useSemillasCount()` (query key `['semillas','count']`).
- `Home/sections/CifrasStrip.tsx`: tile `semillas plantadas` → `/sembrar`, segundo en
  el orden (especimen: voces · semillas · … · planes), `grid-cols-4` → `grid-cols-5`.
- `usePlantarSemilla()` invalida `['semillas']` al 201: si el usuario vuelve a la
  portada, el total ya lo cuenta.

## Accesibilidad

- **Jerarquía:** un `<h1>` (portada, siempre presente en ambos estados), `<h2>` el
  título del paso / el `Semilla N° {id}` del certificado.
- **Foco:** al cambiar de paso, el foco va al título del paso (`tabIndex={-1}`); al
  plantar, al encabezado del certificado. Focus visible violeta 2px global
  (`papel-root`).
- **Stepper:** tramos `aria-hidden`; el estado accesible es `Paso {n} de 3` (texto
  real). Nada de `role="progressbar"` — los tramos no miden, ubican.
- **Formulario:** textarea con `aria-labelledby` al título del paso; «← Volver» es un
  `<button>` real deshabilitado en el paso 1; botones deshabilitados per §5 (tinta-30,
  nunca opacity).
- **Anuncios:** `✓ Copiada` en `role="status"`; el error del POST en `role="alert"`.
- **Sellos y SVG:** PLANTADA es texto real legible por AT; la semilla SVG es
  `aria-hidden` (decorativa — el dato es el certificado).
- **Teclado:** tab recorre textarea → Volver → Siguiente; en el certificado: Copiar →
  Imprimir → Plantar otra → link al mapa. Targets ≥ 44px.
- **Reduced motion:** guarda global de `index.css` — `inkfill`, `fadeup`, `semgrow`,
  `leafpop`, `stampin` quedan en estado final: la semilla nace crecida, el sello
  aparece puesto.
- **AA:** texto esencial en tinta/tinta-90/tinta-75 sobre papel; tinta-50 solo en
  guías/meta; tinta-30 solo en el pie del asistente y «Plantar otra» (no esencial —
  ambos ≥ targets y con foco visible); las etiquetas de color del certificado son mono
  10px uppercase acompañando frases en Anton 24 tinta (el color nunca es el único
  portador).
- **Impresión accesible:** el orden del DOM es el orden de lectura; el folio es la
  primera línea impresa.

## Enmiendas a la ley (mismo commit que el código, regla del master plan)

1. **§5 Formularios — el stepper queda especificado.** La card 2.5 del master plan
   dice «§5 stepper — now documented», pero el README v1.1 NO lo contiene (verificado
   2026-07-24: grep de stepper/paso/asistente en §5 da cero — la Fase 0.4 no lo
   incluyó). Regla del programa: si una página necesita algo que el doc no cubre, el
   doc se enmienda en el mismo PR. Se agrega al kit de formularios de §5:

   > Stepper (asistente de pasos)
   > - Indicador: fila `display:flex;gap:8px`, un tramo `flex:1;height:4px` por paso —
   >   completados y actual en violeta, pendientes `#D8D4C8`, transición
   >   `background .3s`; `aria-hidden` (el estado accesible es la línea mono
   >   «Paso {n} de {total}»).
   > - Card del paso: borde 1px tinta, fondo papel-crudo, padding 40 (24 móvil); línea
   >   mono «Paso {n} de {total}» tinta-50 · título del paso en Anton 26–40 · guía
   >   15px tinta-50 · UN campo del kit por paso.
   > - Navegación: «← Volver» mono (deshabilitado en el paso 1, per Estados) + botón
   >   primario a la derecha («Siguiente →»; el último paso lleva el verbo real del
   >   acto).
   > - Avanzar exige el campo válido; volver nunca pierde lo escrito. No es una barra
   >   de progreso (§14): los tramos no miden, ubican.

2. **§10.7 El despertar — disparador nuevo.** La lista de disparadores canónicos es
   cerrada por diseño; la card 2.5 sanciona «despertar() on step 1». Se agrega a la
   lista: `primer paso del asistente de Sembrar («Siguiente →» del paso 1)`.

(Ninguna otra: PLANTADA ya está en el catálogo §10.5; `semgrow`/`leafpop` ya están en
§6; la edición impresa ya está legislada en §10.8 y su patrón ya existe desde 2.4.)

## Decisiones

1. **La semilla son tres frases, no un texto libre** — modelo del especimen (basta /
   sueño / compromiso), columnas NOT NULL propias: el certificado y cualquier análisis
   futuro las necesitan separadas; un blob las perdería.
2. **Publicación inmediata, paridad `dreams`** — `status` default `'approved'`,
   conteo público = `countApproved()`. En 2.5 no hay lectura pública individual, así
   que moderar no protege nada; la columna deja la puerta abierta sin migración
   futura.
3. **Sin nombre, sin geo** — el especimen no los pide y el pie promete «Anónimo si
   querés · Sin registro · Sin spam»; la geografía es del mapa. `userId` set-null solo
   si hay sesión (paridad `optionalAuthenticate` de dreams).
4. **Inmutable: sin `updated_at`** — la semilla no se edita, se planta otra. El
   esquema documenta el contrato.
5. **El N° es el id serial real; la única cifra agregada es el count** — numeración de
   expediente vs. total: dos verdades distintas, cada una en su superficie (§ «El
   problema de diseño central»).
6. **Dos endpoints, uno de escritura** — `POST /api/semillas` (Zod 1–280,
   `anonSubmitRateLimit` 30/h como dreams/pulso, allow-list CSRF nueva en
   `middleware/csrf.ts`) + `GET /api/semillas/count`. Integración testeada con
   limpieza FK-safe explícita.
7. **Stepper §5 vía enmienda 1** — verificado ausente del README pese a la card del
   master plan; se legisla con la receta del especimen y la nota anti-§14 (los tramos
   no miden, ubican).
8. **`despertar()` en el primer «Siguiente →»** (enmienda 2 a la lista §10.7) — el
   primer acto concreto de quien llegó directo; el CTA del header ya dispara el suyo
   antes de navegar.
9. **La firma es el nacimiento de la semilla** — semgrow + leafpop + PLANTADA como un
   solo momento compuesto; presupuesto §6 respetado.
10. **PLANTADA en violeta** (`Sello color="violeta"`, del catálogo de la primitiva) —
    color del especimen (accent); RECIBIDA quedó verde en 2.2, cada sello con su
    momento.
11. **El certificado persiste en `localStorage['basta_semilla']`** — volver muestra el
    certificado; «Plantar otra» lo borra y reinicia. Sin storage, dura la sesión. El
    registro de verdad vive en la base.
12. **Compartir = copiar texto + imprimir** — clipboard con el texto del especimen
    (+ link `/sembrar` al final: el share ES la invitación), `window.print()` para el
    papel. Sin `navigator.share` (soporte dispar, cero beneficio sobre copiar), sin
    SDKs sociales, sin dependencias nuevas.
13. **Edición impresa reusada AS-IS** — clase `.edicion-impresa` + folio patrón
    PlanDetail; cero CSS print nuevo, cero cambios de chrome.
14. **Rutas:** `/sembrar` canónica nueva (App.tsx sancionado), redirect
    `/la-semilla-de-basta` patrón `/la-vision`, `PAPEL_ROUTES` exacto al final con
    estado interino aceptado.
15. **La vuelta del tile semillas a `/`** — sweep sancionado de la tarea final, diff
    mínimo (hook + tile + `grid-cols-5` + test), cumpliendo la promesa de la card 2.0.
16. **Los seis principios v1 no se migran acá** — contenido manifesto-adjacent,
    flaggeado a 3.3/3.7 como decisión editorial; esta página es un acto, no una
    lectura.
17. **Cero íconos** (§12, página editorial): glifos `→ ▌ ✕ ✓` y sellos.
18. **H1 con punto en tinta** — `RitoTinta` tal cual, sin variante nueva por un píxel
    violeta del especimen (criterio 2.4-D12).

## Definición de terminado (protocolo por página)

- [ ] Portada: kicker + H1 Anton «Tu semilla.» con rito de la tinta + lead; en estado
      certificado el kicker dice `Sembrar · plantada`.
- [ ] UNA interacción firma: el nacimiento de la semilla (semgrow + leafpop +
      PLANTADA) al 201.
- [ ] Asistente: 3 pasos con copy exacto, stepper §5 (enmienda 1 en el mismo commit),
      volver sin perder texto, avance gated por contenido, máx 280, foco al título del
      paso, `despertar()` en el primer «Siguiente →» (enmienda 2).
- [ ] Certificado: `Semilla N° {id} — {fecha}` con datos de la base, tres frases con
      etiquetas semánticas, sello PLANTADA violeta, copiar (`✓ Copiada`), imprimir,
      plantar otra, cierre al mapa.
- [ ] Edición impresa: `.edicion-impresa` + folio `¡BASTA! · edición del lector ·
      {fecha}`, portada/acciones/cierre con `print:hidden`, sello y semilla impresos —
      verificada con captura de print preview.
- [ ] Persistencia: recargar `/sembrar` muestra el certificado; «Plantar otra»
      reinicia.
- [ ] API: tabla + migración + repositorio + slice `semillas` con POST (Zod,
      rate-limit, CSRF allow-list) y count; tests de integración con limpieza
      explícita por id; cero cambios en tablas ajenas.
- [ ] Honestidad: cero números inventados; el asistente no muestra conteos; el N° es
      el id real; la fecha es `createdAt`.
- [ ] Sweep sancionado: tile «semillas plantadas» real en `CifrasStrip`
      (`grid-cols-5`), `SEMBRAR_HREF`/CtaBand/tests a `/sembrar`.
- [ ] Rutas: `/sembrar` en `App.tsx` y `PAPEL_ROUTES`; `/la-semilla-de-basta`
      redirige; `LaSemillaDeBasta.tsx` borrado; grep de `la-semilla-de-basta` da solo
      el redirect.
- [ ] Responsive: 1 columna, padding 20, targets ≥ 44px.
- [ ] Voseo consistente; «comillas angulares»; sin "registrate/únete".
- [ ] Archivos ≤ 300 LOC (composer + `sections/` + data + hooks).
- [ ] Tests: wizard (avance/volver/despertar/error) · certificado (datos reales,
      print classes, copiar, plantar otra) · composer/persistencia · rutas papel ·
      CifrasStrip con semillas · integración API.
- [ ] `pnpm verify` verde.
- [ ] Verificación en navegador desktop + mobile con capturas (incluye print preview
      y reduced-motion); semillas de prueba borradas de la DB dev por id.
