# La idea «Papel y Tinta» — página 2.1 del recorrido

**Fecha:** 2026-07-22
**Fuente de diseño:** `docs/design-system/BASTA-v2.dc.html` (pantalla `data-screen-label="La idea"`, caps I–III)
**Sistema:** `docs/design-system/README.md` v1.1 (ley) · card 2.1 del master plan `docs/plans/2026-07-21-papel-y-tinta-master-plan.md`
**Plan de implementación:** `docs/plans/2026-07-22-la-idea-plan.md`

> **Tesis de copy.** A `/la-idea` llega el escéptico que tocó «Entender la idea» y todavía
> sospecha que esto es otro partido con mejor tipografía. Se tiene que ir creyendo tres
> cosas — que el protagonista es él (el hombre gris: plata, *argentum*, no acero), que el
> método son tres roles que no se mezclan, y que nadie viene a salvarlo, a propósito — y
> con un solo próximo paso: dejar su voz en el mapa.

## Por qué

v1 fragmentó la idea en dos páginas port («La visión» en `/la-vision` y «El nombre» en
`/el-instante-del-hombre-gris`) que se pisan, no se enlazan entre sí y siguen en chrome
oscuro. El diseño BASTA v2 las fusiona en **un solo recorrido de tres capítulos** con el
despertar gris→color como columna vertebral narrativa (§10.7): la página empieza gris
porque vos todavía no actuaste, y se enciende cuando lo hacés.

## Ruta, redirects y navegación

- **Canónica:** `/la-idea`.
- **Redirects cliente (estilo 301):** `/la-vision → /la-idea` y
  `/el-instante-del-hombre-gris → /la-idea`, con `<Redirect to="/la-idea" replace />` de
  wouter (replace: la URL vieja no queda en el historial). Los redirects son permanentes:
  hay links viejos en el chrome v1, en secciones de Home y afuera del sitio.
- **Nav papel:** en `papel-nav.ts` el item ya se llama «La idea» (num `01`); solo cambia
  su `href` de `/la-vision` a `/la-idea`. Es un archivo de datos — los componentes
  `PapelHeader`/`PapelFooter` no se tocan (protocolo una-conversación-una-página).
- **`PAPEL_ROUTES`:** se agrega `/la-idea` (recibe grano + velo + chrome papel).
- **Links viejos que quedan apuntando a las rutas muertas** (HeroBasta, IdeaEnTresLineas,
  HombreGrisBand, Header/Footer v1): los sirve el redirect. No se tocan otras páginas;
  la Fase 7 los limpia.
- **Decisión para la card 3.6 (asignada a esta spec):** cuando `UnaRutaParaArgentina`
  se desarme, `/una-ruta-para-argentina` redirige a **`/la-idea`** — su framing («la
  ruta», el método) lo absorbe el Capítulo II; la novela tendrá su propio lector en
  `/cronica`.
- **SEO/título:** no hay mecanismo de `document.title` en v2 todavía; llega con la
  Fase 8.1 para todas las páginas. Fuera de alcance acá.

## Estructura — portada + 3 capítulos

Contenedor documento `max-width:1100px` (§4), padding lateral 40/20. Anclas `#capitulo-i`,
`#capitulo-ii`, `#capitulo-iii`. Todo lo que no es la interacción firma entra con
`anim-fadeup` escalonado (§6). **Toda la prosa de abajo es el copy final — el
implementador la transcribe tal cual, no la reescribe.**

### § 0 — Portada

- Kicker violeta: `La idea · tres capítulos · seis minutos`
- H1 Anton `clamp(48px,7vw,104px)` con **rito de la tinta** (§10.1, obligatorio):

  > **Un país no se hereda.**
  > **Se diseña.**

  Las dos líneas se entintan letra por letra en tinta. *Decisión:* el H1 va entero en
  tinta — sin línea violeta como en el especimen — porque el keyframe canónico `inkfill`
  termina en `#16130E` y el violeta queda reservado a signos y acciones. No hay signos
  `¡ !` en este H1, así que el rito es solo inkfill.
- Lead (Archivo 19px, tinta-75, max-width 640):

  > Tres capítulos: quién sos en esta historia, cómo funciona el método, y por qué acá
  > nadie viene a salvarte — a propósito.

### Capítulo I — El instante del hombre gris (`#capitulo-i`)

**Carga las ideas de `/el-instante-del-hombre-gris` (v1):** identidad del hombre gris ·
gris = mezcla de todos los colores = plata = *argentum* (nunca acero) · el instante como
umbral · el origen del nombre (psicografías de Solari Parravicini, leídas como
diagnóstico, no profecía) · la cita del pozo.

**Tratamiento gris→color (la banda que despierta):** sección full-bleed con fondo
`bg-oscuro-meta` (#8E8A82 — el mismo gris de la banda del hombre gris en Home) mientras
`!despierto`, que transiciona a `bg-papel-crudo` al despertar
(`transition-colors duration-1000 motion-reduce:transition-none`). Ver «La interacción
firma» abajo. **AA sobre el gris:** todo el texto de la banda va en tinta plena
(`text-tinta`, ratio ≈ 5.4:1); nada de tinta-90/75/50 sobre #8E8A82. El kicker también
(`<Kicker color="tinta" className="text-tinta">`).

- Kicker: `Capítulo I`
- H2 Anton: **El instante del hombre gris**
- Cuerpo a 2 columnas (1 en móvil), 17px:

  Columna 1:

  > El hombre gris no es un personaje: sos vos a las 7:40, apretado en un tren que llega
  > tarde a un trabajo que apenas alcanza. Es la maestra que enseña con fotocopias, el
  > médico que atiende sin insumos, la piba que ya averiguó cuánto sale irse.

  > Y una aclaración, porque importa: gris no quiere decir mediocre. El gris es todos los
  > colores juntos. Es plata — *argentum*, el metal que le puso nombre a la Argentina.
  > Canas de aguantar, cicatrices que ya no avergüenzan: enseñan. Plata, no acero.

  Columna 2:

  > Pero hay un instante — uno solo — en que el gris se corta. Una factura que no cierra,
  > una sala de espera, una injusticia de más. El instante en que un tipo común dice en
  > voz alta la palabra que venía tragando hace años.

  > *(semibold)* Ese instante, multiplicado y ordenado con método, es todo esto. No hace
  > falta ser héroe. Hace falta decidirse.

- Aside «el nombre» (borde izquierdo 2px tinta, pl-6):

  Label mono uppercase: `Por qué el nombre largo`

  > El proyecto se llama El Instante del Hombre Gris por las psicografías de Solari
  > Parravicini sobre la Argentina y su «Hombre Gris». Las leemos como diagnóstico, no
  > como profecía: lo que él dibujó entonces es lo que resolvemos ahora.

  Cita (itálica, comillas angulares):

  > «Eres un pozo tallado no en piedra, sino en tiempo. Y estás destinado a desbordarte.»

- **La caja del despertar** (borde 1px tinta, fondo `bg-papel-crudo` siempre, centrada):
  - Estado gris (`!despierto`): línea mono uppercase
    `Esta página está en gris. Como el país. Como vos, hasta hoy.`
    - botón `BotonPapel variant="tinta"`: **Este es mi instante**
  - Estado despierto: `¡BASTA!` en Anton violeta `clamp(30px,3.6vw,48px)` con `anim-vpop`
    - línea: `Eso fue todo. Así de simple empieza. Lo que sigue es método.`

### Capítulo II — El método (`#capitulo-ii`)

**Carga las ideas de `/la-vision` (v1):** país diseñado, no improvisado · diseño
idealizado (Ackoff), no parche · ciudadanía diseña / Estado administra / política ejecuta ·
indicadores nuevos (dignidad, confianza, belleza funcional) · los 22 PLANes + PLANRUTA
como prueba.

Fondo papel. Kicker violeta: `Capítulo II`.

- H2 Anton: **El método: tres roles que no se mezclan**
- Intro (2 párrafos, max-width 620):

  > La política argentina fracasa por un error de diseño: una sola casta hace los tres
  > trabajos. Decide qué país quiere, lo administra y se controla a sí misma. Acá los
  > tres roles se separan — y no se vuelven a mezclar.

  > El método tiene nombre: diseño idealizado. Cuando un sistema falla en todo, no se lo
  > emparcha — se lo dibuja de nuevo, como si empezara hoy. No prometemos arreglar lo
  > viejo: dibujamos lo nuevo hasta que volver atrás quede en ridículo.

- Tres filas de rol (borde superior 1px tinta; grilla `90px 1fr`; num mono tinta-50;
  título Anton `clamp(28px,3.4vw,44px)` con la segunda palabra en violeta; cuerpo 16px
  tinta-75 max-width 640). Copy (vive en `la-idea-data.ts` como `ROLES`):

  **01 · La ciudadanía _diseña._**
  > La que vive el país es la que sabe dónde duele. Vos soltás tu voz en el mapa; miles
  > de voces convergen; de esa convergencia sale el mandato: el país pedido por escrito.
  > Nadie interpreta lo que quisiste decir. Nadie firma en tu nombre.

  **02 · El Estado _administra._**
  > Técnicos que gestionan lo que la ciudadanía diseñó: miden, registran, protegen,
  > garantizan que nada se caiga entre un gobierno y el siguiente. Gerentes del país, no
  > dueños. Y con otro tablero: además del PBI, cuánta dignidad sostiene una persona,
  > cuánta confianza circula entre vecinos, cuánta belleza funcional sale a la calle.

  **03 · La política _ejecuta._**
  > El que quiera un cargo firma el mandato ciudadano antes de pedirte el voto. Después
  > ejecuta lo diseñado y rinde cuentas en público, con calendario. Empleada del diseño,
  > no autora. Si no cumple, el mismo método la deja afuera.

- **Caja «El ciclo completo»** (borde 1px tinta, fondo papel-crudo): chips mono §5
  encadenados con flechas tipográficas `→` y `↺` al final. Pasos (en
  `la-idea-data.ts` como `CICLO`): `tu voz` (fondo violeta, texto papel) → `el mandato` →
  `los planes` → `la ejecución` → `la auditoría` (fondo verde, texto papel) → `↺`.
  Los intermedios: borde tinta, fondo transparente. Línea al pie (14px tinta-50):

  > El ciclo no tiene última vuelta: las voces nuevas ajustan el mandato, el mandato
  > ajusta los planes, y la ejecución se audita a la vista de todos. Después vuelve a girar.

- **Cierre del capítulo — la prueba** (fila con borde superior, sello + texto + CTA):
  - `<Sello color="rojo">No es doctrina</Sello>`
  - Texto (el número **nunca** se tipea: se interpola `PLAN_COUNT`, derivado de
    `PLAN_REGISTRY` — dato real de MDX):

    > ¿Suena imposible? Ya está escrito. Un ciudadano común redactó {PLAN_COUNT} planes
    > de país — más PLANRUTA, el que explica cómo se arranca. No son doctrina: son la
    > prueba de que cualquiera puede. Imaginate lo que sale de millones.

  - `BotonPapel variant="fantasma"` → `/planes`: **Ver la prueba: los planes →**

### Capítulo III — Sin líder (`#capitulo-iii`)

**Carga:** sin líder / sin partido / sin excusas · «sin la espera de un salvador» (v1
La visión) · el remate hacia el mapa.

Sección oscura full-bleed: `bg-tinta text-papel`; interior 1100px. Kicker
`violeta` con clase `text-violeta-claro` (#9D85E8 — violeta sobre oscuro, §2).

- Kicker: `Capítulo III`
- H2 Anton: **Nadie viene a salvarte. Por diseño.**
- Grilla de 3 cards (juntas 1px `bg-oscuro-borde`, celdas `bg-tinta`, 1 columna en
  móvil). Cada card: `<Sello color="rojo" rotate={-3}>` como label + cuerpo 15px
  `text-oscuro-secundario`. Copy (en `la-idea-data.ts` como `SIN_LIDER`):

  **SIN LÍDER**
  > Un líder es un punto único de falla: se compra, se cansa, se equivoca o se va. Acá
  > decide el método, y al método no lo podés sobornar ni jubilar. Si mañana desaparece
  > el que escribió todo esto, no cambia nada. Esa es la idea.

  **SIN PARTIDO**
  > Un partido necesita ganar elecciones, y para ganar necesita prometer lo que sea. Un
  > método solo necesita funcionar. No competimos por los cargos: los condicionamos. El
  > que quiera uno, firma el mandato.

  **SIN EXCUSAS**
  > La parte incómoda: si no hay nadie arriba, no queda a quién echarle la culpa. La
  > ciudadanía diseña — entonces la ciudadanía responde. Tu silencio también firma.

- **Remate** (fila con borde superior `border-oscuro-borde`, texto + CTA):

  > Si terminaste los tres capítulos esperando el nombre de un candidato, volvé al
  > primero. Si en cambio te quedó algo por decir — hay un mapa esperándote.

  Debajo, **la única métrica viva de la página** (ver «Datos reales»):
  línea mono 11px `text-oscuro-meta`: `{N} voces ya están en el mapa. Falta la tuya.`

  CTA `BotonPapel variant="violeta" surface="oscuro"` (invertido sobre banda oscura,
  patrón ratificado de CtaBand) → `/el-mapa`, con `onClick={despertar}`:
  **Dejar mi voz →**

## La interacción firma: el despertar en el Capítulo I

Presupuesto §6: una sola interacción firma por página — es esta. El rito de la tinta del
H1 es el ritual universal obligatorio y no cuenta contra el presupuesto.

1. Usuario no despierto (`localStorage['basta_despierto'] ≠ '1'`): el sitio entero está
   bajo el velo de saturación (`DespertarVeil`, D5) y el Capítulo I además está impreso
   sobre banda gris `bg-oscuro-meta`. La caja muestra el aviso + botón «Este es mi
   instante».
2. Click en «Este es mi instante» → `despertar()` (`~/lib/despertar.ts`). Tres cosas a
   la vez: (a) el velo global se disuelve en 1.4s; (b) la banda del Capítulo I
   transiciona de gris a `bg-papel-crudo` en 1s (`transition-colors`); (c) la caja
   cambia al estado despierto: `¡BASTA!` cae con `anim-vpop` + «Eso fue todo…».
3. Usuario que llega ya despierto: la banda nace `bg-papel-crudo` y la caja muestra el
   estado despierto directo, sin botón ni animación de fondo.
4. `prefers-reduced-motion`: la transición de fondo se anula
   (`motion-reduce:transition-none`), `anim-vpop`/`anim-inkfill` ya quedan en estado
   final por la guarda global de `index.css`.

**Enmienda a la ley (mismo commit que el código, regla del master plan):** §10.7 suma
dos disparadores canónicos: el botón «Este es mi instante» (La idea, Cap I) y el CTA
«Dejar mi voz» (La idea, Cap III). Además §5 gana la receta «Título entintado» que
respalda la nueva primitiva `RitoTinta` (el rito estaba especificado en §10.1 pero sin
componente reutilizable; Home lo tenía hecho a mano).

## Datos reales (directiva 2026-07-22: cero datos hardcodeados)

- **Única métrica viva:** el conteo de voces del remate del Cap III, vía el hook
  existente `useVocesCount()` (`GET /api/analytics/voces-count`, misma query key que el
  header — un solo fetch). Mientras carga o si falla, la línea **no se renderiza**
  (nada de números de reserva ni esqueletos acá: es una línea de refuerzo, no un dato
  estructural).
- `PLAN_COUNT` sale de `PLAN_REGISTRY` (MDX real, sincrónico) — nunca se tipea «22».
- **Ningún endpoint nuevo. Ninguna otra cifra.** «Multiplicado por millones» y frases
  similares son retórica sin pretensión de dato de plataforma (exentas por la
  directiva). No hay `* datos de demostración` en esta página porque no queda nada demo.

## Lo que muere

- `apps/web/src/pages/LaVision.tsx` — borrada (ideas absorbidas por portada + Cap II).
- `apps/web/src/pages/ElInstanteDelHombreGris.tsx` — borrada (absorbida por Cap I).
- Sus dos `lazy()` y sus dos `<Route>` en `App.tsx` — reemplazados por la ruta canónica
  y los dos redirects.
- El CTA v1 «Leer el manifiesto» de La visión no se replica: el manifiesto ya vive en el
  chrome papel (footer) y en la biblioteca; esta página remata en el mapa, la conversión
  primaria del sitio.

## Decisiones

1. **H1 todo en tinta** (sin segunda línea violeta del especimen): el keyframe `inkfill`
   canónico termina en tinta; violeta queda para signos y acciones. Evita tocar §6.
2. **`RitoTinta` como primitiva** en `components/papel/primitives/` + receta en §5:
   toda página de acá en adelante la necesita (DoD «rito de la tinta on the H1»).
3. **Cap I sobre `bg-oscuro-meta`** (el gris ya tokenizado, mismo de HombreGrisBand en
   Home) con texto en tinta plena por AA; el «grayscale-until-awake» del especimen lo
   aporta el velo global (D5) + la transición de fondo de la banda.
4. **Prosa en `la-idea-data.ts`** (ROLES/CICLO/SIN_LIDER): es copy estático, no
   «datos» — mismo patrón que `TRES_LINEAS` en `Home/landing-data.ts`. La directiva de
   datos prohíbe métricas inventadas, no párrafos.
5. **`/una-ruta-para-argentina` → `/la-idea`** (se ejecuta en 3.6, decidido acá).
6. **Cero íconos** (§12, página editorial): solo glifos `→ ↺` y sellos.

## Definición de terminado (protocolo por página)

- [ ] Kicker + título Anton + CTA presentes en cada sección.
- [ ] UNA interacción firma: el despertar del Cap I (velo + banda + caja).
- [ ] Rito de la tinta en el H1 (vía `RitoTinta`).
- [ ] Sin datos demo → sin asteriscos (nada que marcar).
- [ ] Responsive: 1 columna <560/960 según §4, targets ≥ 44px (BotonPapel ya cumple).
- [ ] Voseo consistente; «comillas angulares»; ¡BASTA! con ambos signos.
- [ ] `/la-idea` en `PAPEL_ROUTES`; redirects desde las dos rutas v1; nav apunta a
      `/la-idea`.
- [ ] Página ≤ 300 LOC por archivo (composer + `sections/`).
- [ ] `pnpm verify` verde.
- [ ] Verificación en navegador desktop + mobile con capturas (incluye: redirect de
      ambas rutas viejas, despertar completo, estado ya-despierto).
- [ ] AA (tinta plena sobre el gris; `violeta-claro` y `oscuro-meta` sobre tinta) +
      `prefers-reduced-motion` deja estados finales.
