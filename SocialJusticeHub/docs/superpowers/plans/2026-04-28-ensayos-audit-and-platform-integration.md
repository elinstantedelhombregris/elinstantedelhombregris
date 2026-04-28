# Ensayos — Auditoría de Contenido y Extensión a la Plataforma — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar editorialmente los siete ensayos del Hombre Gris (inglés y rioplatense), e integrarlos a la plataforma como una sección `/recursos/ensayos` posicionada como playground de pensamiento, expandible.

**Architecture:** Tres fases secuenciales — (1) polish del inglés en raíz aplicando `Ensayos/00-ANALISIS.md`; (2) propagación de cambios al rioplatense en `Ensayos/castellano/`; (3) build-time markdown pipeline + páginas React + bloques de navegación inversa. La plataforma lee los `.md` en build via script Node, genera un módulo TS importado por las páginas. Sin CMS, sin DB, sin edición desde el sitio.

**Tech Stack:** TypeScript + React + Vite + wouter + `marked` (instalado) + `@tailwindcss/typography` (instalado) + `tsx` (para scripts Node). Las prosas viven en git.

**Restricciones duras:**
- Light edits only en prosa. Nunca reestructurar/fusionar/mover material entre ensayos sin nueva conversación.
- Inglés cierra antes de tocar castellano.
- Cada decisión "abierta" del spec §6 se confirma con el usuario antes de aplicar.
- Commits van a `main` directamente (preferencia del usuario).

**Spec:** [`docs/superpowers/specs/2026-04-28-ensayos-audit-and-platform-integration-design.md`](../specs/2026-04-28-ensayos-audit-and-platform-integration-design.md)

---

## Pre-flight

Antes de empezar la Fase 1, confirmar con el usuario las **8 decisiones abiertas** listadas en §6 del spec. Sin esa confirmación, varias tareas no pueden completarse. Las decisiones se anotan en `Ensayos/00-ANALISIS.md` al final, en una sección "Decisiones tomadas — 2026-04-28".

- [ ] **Step 1: Confirmar decisiones abiertas con el usuario**

Pedirle al usuario respuesta a las 8 preguntas de §6 del spec. Defaults propuestos:
1. Layer Five (04): resolver con tres frases.
2. Politics of the Sublime (06 §VIII): queda y se aliviana.
3. Why the Fiction Persists (03 §IV): se deja en cuatro razones.
4. El Credo: postergado hasta tener delta del 07.
5. Cuatro deudas del 04: se cosen las que el 07 no cierre.
6. "forty-three years": literal en una aparición ancla, generalizar en el resto.
7. Slug del 07: `carta-al-nieto`.
8. Tarjeta Ensayos: gradient `from-amber-500/10 to-rose-500/10`, ícono `BookOpen`.

- [ ] **Step 2: Anotar las decisiones tomadas**

Append al final de `Ensayos/00-ANALISIS.md`:

```markdown
---

## Decisiones tomadas — 2026-04-28

(Insumo de la Fase 1 de polish. Cada línea registra la decisión final adoptada para la implementación del plan `docs/superpowers/plans/2026-04-28-ensayos-audit-and-platform-integration.md`.)

1. Layer Five (04): {DECISIÓN}
2. Politics of the Sublime (06 §VIII): {DECISIÓN}
3. Why the Fiction Persists (03 §IV): {DECISIÓN}
4. El Credo: {DECISIÓN}
5. Cuatro deudas del 04: {DECISIÓN}
6. "forty-three years": {DECISIÓN}
7. Slug del 07: {DECISIÓN}
8. Tarjeta Ensayos: {DECISIÓN}
```

Reemplazar `{DECISIÓN}` con la respuesta efectiva del usuario.

- [ ] **Step 3: Commit decisiones**

```bash
git add Ensayos/00-ANALISIS.md
git commit -m "docs(ensayos): record audit decisions for plan execution"
```

---

# Fase 1 — Auditoría y polish en inglés (Tasks 1-9)

## Task 1: Auditoría delta del 07-carta

**Files:**
- Create: `Ensayos/00-ANALISIS-07.md`

`00-ANALISIS.md` cubre los 6 originales pero no el `07-carta`, que se escribió después. Antes de polishear el 07 hay que producir una mini-auditoría que diga qué hace bien, qué tiene de scaffolding, y cómo se relaciona con el Credo (decisión #4 del pre-flight).

- [ ] **Step 1: Leer el 07 completo**

Leer `Ensayos/07-carta.md` de principio a fin. Anotar mentalmente: marcas de chat, repeticiones, pasajes que sienten que cuelgan o sobran.

- [ ] **Step 2: Comparar contra `Ensayos 1`**

Verificar si el 07 está incluido en el archivo crudo `Ensayos/Ensayos 1`. Si está, anotar las diferencias entre crudo y polish actual. Si no está, anotarlo (significa que el 07 nunca pasó por chat-scaffolding y la pasada de "sacar marcas" puede ser nula).

```bash
grep -c "Letter to the Grandchild\|Carta al Nieto" "Ensayos/Ensayos 1"
```

- [ ] **Step 3: Escribir `Ensayos/00-ANALISIS-07.md`**

Documento corto (300-500 palabras) con cuatro secciones:

```markdown
# Auditoría delta — 07 Carta al Nieto

**Documento de trabajo — 28 de abril de 2026**

Este es un complemento de `00-ANALISIS.md` que cubre el séptimo ensayo, escrito después del análisis original.

## I. ¿Cumple el rol asignado?

[Una sección que conteste: el análisis original asignó a este ensayo la pregunta del traspaso ("¿a quién?"). ¿Lo hace? ¿En qué medida la "Carta al Nieto" responde la pregunta del traspaso, y qué deja sin tocar?]

## II. Marcas de chat y scaffolding

[Listar marcas de chat encontradas, si las hay. Si no hay, decirlo explícitamente. Esta sección puede ser una sola línea.]

## III. Relación con el Credo

[¿El 07 absorbió la opción C, o el Credo sigue pendiente como pieza paralela? Recomendación clara.]

## IV. La Cartografía del 07

[¿El 07 ya tiene Cartografía al pie? Si sí, ¿cierra el arco hacia los 6 anteriores? Si no, ¿qué hace falta?]

## V. Recomendación de polish

**Nivel: {mínimo / mínimo+ / medio}** — justificación corta.

Lista de cambios concretos a aplicar en la Task 8.
```

- [ ] **Step 4: Commit**

```bash
git add Ensayos/00-ANALISIS-07.md
git commit -m "docs(ensayos): add delta audit for 07 Carta al Nieto"
```

---

## Task 2: Polish 01-presidencia (inglés)

**Files:**
- Modify: `Ensayos/01-presidencia.md`

Nivel del análisis: **mínimo+**.

- [ ] **Step 1: Leer el archivo completo**

Leer `Ensayos/01-presidencia.md`.

- [ ] **Step 2: Sacar marcas de chat**

Buscar y eliminar (con Edit) cualquier ocurrencia de:
- `Decision headline:` y su párrafo
- `Key assumptions:` y la lista subsiguiente
- Bullets que empiezan con `[Inference]`, `[Speculation]`, `[Unverified]`
- `Top 5 failure modes`, `Proof metrics`, `Apr 24Claude responded:` o variantes
- Bloques de "Observe" o "Calibrate" si existen

Si no hay ninguna marca, anotarlo y seguir. (El archivo en raíz puede haberse limpiado parcialmente.)

- [ ] **Step 3: Condensar el espejo argentino (§IV)**

Sección IV es "The Argentine Mirror". El análisis dice: "ocupa cinco párrafos para decir lo que el ensayo 3 dice mejor en uno". Reducir a tres párrafos manteniendo:
- Apertura ("Argentina has had presidents for a long time...")
- El núcleo ("Every six or eight years the country falls in love with a new face...")
- Cierre que abstrae a presidencias en general ("This is not a story about Argentina. It is a story about presidencies.")

Eliminar repetición intermedia. Mantener voz original.

- [ ] **Step 4: Suavizar repeticiones de "the grey man"**

Buscar las apariciones de "the grey man" en posición de cierre de párrafo en este ensayo. En este ensayo la figura todavía no está construida (eso pasa en el 5), entonces cada cierre con "the grey man" funciona como muletilla. Reemplazar al menos dos ocurrencias por sinónimos contextuales ("the citizen", "the ordinary one", "the one who actually holds the country up", etc.) — preservar el cierre final del ensayo donde la figura sí carga peso.

- [ ] **Step 5: Verify diff es razonable**

```bash
git diff --stat Ensayos/01-presidencia.md
```

Esperado: ~30-80 líneas modificadas. Si es mucho más, revisar — significa que algo se reescribió de más.

- [ ] **Step 6: Commit**

```bash
git add Ensayos/01-presidencia.md
git commit -m "fix(ensayos): polish 01-presidencia per analysis (chat marks, mirror condensation, repetition)"
```

---

## Task 3: Polish 02-democracia (inglés)

**Files:**
- Modify: `Ensayos/02-democracia.md`

Nivel: **medio**. Cubre tensión cruzada #3 del spec (voto necesario vs obstáculo).

- [ ] **Step 1: Leer el archivo completo**

- [ ] **Step 2: Sacar marcas de chat**

Mismo patrón que Task 2 Step 2.

- [ ] **Step 3: Cambiar "conspiracy" por "design"/"arrangement" en §II**

Buscar: `the conspiracy is the structure itself` (o variante exacta).
Reemplazar `conspiracy` por `design` o `arrangement` — usar el que mejor calce gramaticalmente. El análisis dice: "the design is the structure itself" funciona. Asegurarse de que no quede ninguna otra aparición de "conspiracy" como caracterización del sistema (sí está bien si aparece descartando que es una conspiración).

- [ ] **Step 4: Hacer explícita la postura sobre el voto**

En la sección donde el ensayo discute si votar es valioso o vacío (revisar §VIII o §IX según numeración), agregar UNA frase declarativa:

> Voting is necessary but radically insufficient. The fact that one casts a ballot every two or four years does not constitute self-government — it constitutes consent to a system designed to govern without one.

(O reformulación equivalente. La frase tiene que ser una sola, no un párrafo, y aparecer una sola vez en el ensayo.)

- [ ] **Step 5: Apretar el espejo argentino (§VI)**

§VI es "The Argentine Mirror, again". Cortar **un párrafo** de los más débiles (los que repiten lo del 01 sin agregar capa). Mantener pasajes específicos sobre 1983 en adelante.

- [ ] **Step 6: Decisión "forty-three years" (caso por caso)**

Buscar todas las ocurrencias de "forty-three years":

```bash
grep -n "forty-three years\|forty three years" Ensayos/02-democracia.md
```

Mantener literal en UNA aparición (la que ancla históricamente al lector). En el resto, generalizar a "more than four decades" o "over forty years". Default: si hay 3+ apariciones, generalizar todas menos una.

- [ ] **Step 7: Verify diff**

```bash
git diff --stat Ensayos/02-democracia.md
```

- [ ] **Step 8: Commit**

```bash
git add Ensayos/02-democracia.md
git commit -m "fix(ensayos): polish 02-democracia per analysis (conspiracy→design, voto explicit, mirror, forty-three years)"
```

---

## Task 4: Polish 03-poder (inglés)

**Files:**
- Modify: `Ensayos/03-poder.md`

Nivel: **medio−**.

- [ ] **Step 1: Leer el archivo completo**

- [ ] **Step 2: Sacar marcas de chat**

- [ ] **Step 3: §IV — decisión sobre las cuatro razones**

Si la decisión #3 del pre-flight fue "colapsar a tres", eliminar la razón sobre la academia (la que dice "It serves the academy because power is a tractable concept for analysis"). Renumerar las restantes si están numeradas.

Si la decisión fue "se deja", solo sacar marcas y pasar.

- [ ] **Step 4: Verify diff**

- [ ] **Step 5: Commit**

```bash
git add Ensayos/03-poder.md
git commit -m "fix(ensayos): polish 03-poder per analysis (chat marks{, fiction persists 4→3 si aplica})"
```

(Ajustar el commit message según la decisión real tomada.)

---

## Task 5: Polish 04-arquitectura (inglés)

**Files:**
- Modify: `Ensayos/04-arquitectura.md`

Nivel: **medio+** — el más intervenido. Cubre tensiones cruzadas #1 y #2.

- [ ] **Step 1: Leer el archivo completo**

- [ ] **Step 2: Sacar marcas de chat**

- [ ] **Step 3: Frase puente al inicio (tensión #1)**

Después del párrafo de apertura del ensayo (probablemente en §I "The Debt the Previous Essays Created"), agregar una frase corta que reconozca el cambio de registro respecto al 03 — la captura como captura de *permisos*, no de *substancias*:

> Power, as the previous essay argued, is not a substance one can hold. But the permissions that organize a society — who is allowed to decide what, with whom, under what review — are real, and they can be captured. What follows is an architecture that makes capture of permissions expensive, visible, and resistible.

(O reformulación equivalente que el editor sienta más fluida.)

- [ ] **Step 4: Sortition realismo (tensión #2)**

Buscar: `Sortition citizens cannot be captured by donors` (o variante exacta). Reemplazar `cannot be captured` por `cannot be captured the same way`. Asegurarse de que el flow de la frase siga funcionando.

- [ ] **Step 5: Layer Five — aplicar decisión #1 del pre-flight**

§III lista las "Five Layers". La quinta es "The Civilizational Layer".

- Si la decisión fue "resolver con tres frases": reescribir el bloque para incluir tres frases sustantivas que apliquen los principios al nivel internacional (coordinación sin concentración, transparencia, derechos de fork inter-nacionales). Las tres frases reemplazan la frase actual que dice "this essay will not solve the international layer".

- Si la decisión fue "sacar y nombrar como deuda": eliminar la Layer Five del listado, anunciar la arquitectura como de cuatro capas, y agregar nota al pie en §IX "What This Essay Has Not Solved" señalando la cuestión internacional.

- [ ] **Step 6: Cuatro deudas — aplicar decisión #5 del pre-flight**

§IX "What This Essay Has Not Solved" lista las deudas (internacional, violencia legítima, velocidad/emergencia, primera generación). El 07-carta cierra parte del arco de "primera generación" implícitamente. Aplicar la decisión:

- Si la decisión fue "coser todas en el polish del 04": agregar uno o dos párrafos de respuesta mínima a cada deuda que el 07 no cierra. **No** convertir esto en un ensayo nuevo dentro del 04.
- Si la decisión fue "dejar como están": no tocar §IX más allá de las marcas de chat.

- [ ] **Step 7: NO TOCAR la sobre-enumeración**

El análisis identifica la sobre-enumeración como riesgo del 04 pero marca la intervención como "no tocar sin autorización explícita". Confirmar que no se tocó nada de las "five layers / three roles / six capabilities / eight mechanisms / four phases".

- [ ] **Step 8: Verify diff**

```bash
git diff --stat Ensayos/04-arquitectura.md
```

Esperado: 50-150 líneas modificadas (este es el ensayo más intervenido).

- [ ] **Step 9: Commit**

```bash
git add Ensayos/04-arquitectura.md
git commit -m "fix(ensayos): polish 04-arquitectura per analysis (permissions framing, sortition realism, layer five, debts)"
```

---

## Task 6: Polish 05-soberania (inglés)

**Files:**
- Modify: `Ensayos/05-soberania.md`

Nivel: **mínimo+**. Cubre tensión cruzada #4.

- [ ] **Step 1: Leer el archivo completo**

- [ ] **Step 2: Sacar marcas de chat**

- [ ] **Step 3: §X — empezar directo con segundo párrafo**

§X es "The Argentine Mirror, made personal". El primer párrafo es introductorio ("Argentina is a country of grey men. It always has been"). Eliminarlo y arrancar la sección con el segundo párrafo, que es el que tiene impacto.

- [ ] **Step 4: Cierre del ensayo — matizar "Welcome back" (tensión #4)**

Buscar: `Welcome back` (cierre del ensayo).

Reemplazar la frase exacta por una versión que aclare que el "vos" es plural — millones del Hombre Gris despiertos, no un salvador único:

> Welcome back, you and the millions like you. The country has been waiting for all of you longer than you know.

- [ ] **Step 5: Verify diff**

- [ ] **Step 6: Commit**

```bash
git add Ensayos/05-soberania.md
git commit -m "fix(ensayos): polish 05-soberania per analysis (mirror opening, welcome back pluralized)"
```

---

## Task 7: Polish 06-belleza (inglés)

**Files:**
- Modify: `Ensayos/06-belleza.md`

Nivel: **medio**.

- [ ] **Step 1: Leer el archivo completo**

- [ ] **Step 2: Sacar marcas de chat**

- [ ] **Step 3: §VIII Politics of the Sublime — aplicar decisión #2 del pre-flight**

- Si la decisión fue "queda y se aliviana": cortar uno o dos párrafos secundarios de §VIII manteniendo la apertura y el núcleo. La sección queda más contenida.
- Si la decisión fue "se queda como está": no tocar.
- Si la decisión fue "se mueve al Credo": eliminar §VIII del 06 y guardar el bloque en `Ensayos/CREDO-source.md` para uso futuro. Ajustar la numeración de las secciones siguientes.

- [ ] **Step 4: §II Aesthetic of Capture — apretar**

Cortar un párrafo de los airports/malls/conference rooms. Mantener el más fuerte; los otros repiten el patrón.

- [ ] **Step 5: Cuidar referencias a las canciones**

Buscar todas las referencias a "songs" en el ensayo. Asegurarse de que ninguna lista canciones específicas — todas tienen que mantenerse en nivel de generalidad ("there are songs being written for this movement", "the tango", "the cumbia"). Las referencias específicas viven en la Cartografía, no en el cuerpo. Si hay listas específicas, sacarlas.

- [ ] **Step 6: Verify diff**

- [ ] **Step 7: Commit**

```bash
git add Ensayos/06-belleza.md
git commit -m "fix(ensayos): polish 06-belleza per analysis (sublime, capture aesthetic, song refs)"
```

---

## Task 8: Polish 07-carta (inglés)

**Files:**
- Modify: `Ensayos/07-carta.md`
- Reference: `Ensayos/00-ANALISIS-07.md` (creado en Task 1)

Nivel: según lo decidido en Task 1.

- [ ] **Step 1: Leer 00-ANALISIS-07 + el ensayo**

- [ ] **Step 2: Aplicar las recomendaciones del delta**

Lo que sea que `00-ANALISIS-07.md` §V haya recomendado. Respetar el principio de tono > ambición.

- [ ] **Step 3: Asegurar que existe Cartografía al pie**

Si no existe, agregar `## Cartografía` al final con:
- **En la plataforma:** Manifiesto (cierre fundacional), Mandato Vivo (la asamblea barrial encarnada), La Semilla (movida concreta).
- **En los ensayos:** los seis anteriores (resumen de una línea cada uno), porque el 07 cierra el arco de los seis.
- **Documentos definitorios:** Perfil del Hombre Gris, Persona del Hombre Gris.
- **Continúa en:** (sin entrada — el 07 es el cierre).

- [ ] **Step 4: Verify diff**

- [ ] **Step 5: Commit**

```bash
git add Ensayos/07-carta.md
git commit -m "fix(ensayos): polish 07-carta per delta audit"
```

---

## Task 9: Cerrar Fase 1 — audit trail

**Files:**
- Modify: `Ensayos/00-ANALISIS.md`

- [ ] **Step 1: Verificar que cada decisión abierta del pre-flight tuvo commit**

```bash
git log --oneline | head -20 | grep -E "polish 0[1-7]|Carta|delta"
```

Esperado: ver los 8 commits (1 delta + 7 polishes).

- [ ] **Step 2: Append nota de cierre**

Al final de `Ensayos/00-ANALISIS.md`, después de la sección "Decisiones tomadas":

```markdown

## Cierre de Fase 1 — 2026-04-28

Los siete ensayos en `/Ensayos/*.md` fueron polisheados según el plan `docs/superpowers/plans/2026-04-28-ensayos-audit-and-platform-integration.md`. Las decisiones abiertas (§6 del spec) fueron resueltas y aplicadas. Próxima fase: propagación al rioplatense en `/Ensayos/castellano/`.

Status del Credo (decisión #4): {RESULTADO} — {breve fundamentación}.
```

- [ ] **Step 3: Commit**

```bash
git add Ensayos/00-ANALISIS.md
git commit -m "docs(ensayos): close Fase 1 — record audit trail"
```

---

# Fase 2 — Propagación al castellano rioplatense (Tasks 10-16)

**Mecánica común a todas las tasks de esta fase:**

Por cada ensayo, en orden 01 → 07:

1. Identificar pasajes del inglés modificados en Fase 1 (vía `git diff` contra el commit anterior a Fase 1).
2. Localizar el bloque correspondiente en castellano.
3. Traducir solo ese bloque, replicando el registro rioplatense ya existente.
4. Lectura de continuidad — verificar que el rioplatense no rompió ritmo donde entró el cambio.

**Reglas de traducción** (constantes a las 7 tasks):
- Voz rioplatense: "vos", "mirá", "pará", "te lo digo".
- "the grey man" → "el hombre gris" (minúsculas en prosa, mayúsculas si es título).
- Nunca "acero" para "grey/silver" — usar "plata" / argentum.
- ¡BASTA! siempre con signos de admiración.
- No retraducir el ensayo entero — solo los deltas.

---

## Task 10: Propagar 01-presidencia → castellano

**Files:**
- Reference: `Ensayos/01-presidencia.md` (post-Task 2)
- Modify: `Ensayos/castellano/01-presidencia.md`

- [ ] **Step 1: Identificar deltas del inglés**

```bash
# Hash del commit ANTES de Task 2 (último commit con el archivo intacto)
git log --oneline Ensayos/01-presidencia.md | head -5
```

Comparar contra el estado pre-polish:

```bash
git diff <hash-pre-polish>..HEAD -- Ensayos/01-presidencia.md
```

Anotar los pasajes con cambio.

- [ ] **Step 2: Aplicar cada delta en castellano**

Por cada delta, ubicarlo en `Ensayos/castellano/01-presidencia.md` y traducirlo manteniendo el registro existente.

- [ ] **Step 3: Lectura de continuidad**

Leer los 2 párrafos antes y los 2 párrafos después de cada cambio aplicado. Verificar que no se rompió el ritmo.

- [ ] **Step 4: Verify diff**

```bash
git diff --stat Ensayos/castellano/01-presidencia.md
```

Diff debería ser comparable en tamaño al de la versión inglesa.

- [ ] **Step 5: Commit**

```bash
git add Ensayos/castellano/01-presidencia.md
git commit -m "fix(ensayos/castellano): propagate 01-presidencia changes to rioplatense"
```

---

## Task 11: Propagar 02-democracia → castellano

**Files:**
- Reference: `Ensayos/02-democracia.md` (post-Task 3)
- Modify: `Ensayos/castellano/02-democracia.md`

- [ ] **Step 1: Identificar deltas del inglés**

```bash
git log --oneline Ensayos/02-democracia.md | head -5
git diff <hash-pre-polish>..HEAD -- Ensayos/02-democracia.md
```

- [ ] **Step 2: Aplicar cada delta en castellano**

Cuidar especialmente:
- Traducción de la frase nueva sobre el voto. Forma propuesta:
  > "El voto es necesario pero radicalmente insuficiente. Que cada dos o cuatro años uno meta una boleta en una urna no constituye autogobierno — constituye consentimiento a un sistema diseñado para gobernar sin uno."
  (Adaptar a la frase exacta inglesa final.)
- "design"/"arrangement" → "el diseño" o "el arreglo" según calce.
- Las apariciones de "forty-three years" generalizadas en inglés → en castellano "más de cuatro décadas" / "más de cuarenta años"; mantener literal "cuarenta y tres años" en la aparición ancla.

- [ ] **Step 3: Lectura de continuidad**

Leer 2 párrafos antes y 2 después de cada cambio.

- [ ] **Step 4: Verify diff**

```bash
git diff --stat Ensayos/castellano/02-democracia.md
```

- [ ] **Step 5: Commit**

```bash
git add Ensayos/castellano/02-democracia.md
git commit -m "fix(ensayos/castellano): propagate 02-democracia changes to rioplatense"
```

---

## Task 12: Propagar 03-poder → castellano

**Files:**
- Reference: `Ensayos/03-poder.md` (post-Task 4)
- Modify: `Ensayos/castellano/03-poder.md`

- [ ] **Step 1: Identificar deltas del inglés**

```bash
git diff <hash-pre-polish>..HEAD -- Ensayos/03-poder.md
```

- [ ] **Step 2: Aplicar cada delta en castellano**

Si la decisión #3 fue "colapsar a tres" (eliminar la razón sobre la academia), eliminar la misma razón en castellano. Si fue "se deja", solo propagar las marcas de chat sacadas en inglés.

- [ ] **Step 3: Lectura de continuidad**

- [ ] **Step 4: Verify diff**

- [ ] **Step 5: Commit**

```bash
git add Ensayos/castellano/03-poder.md
git commit -m "fix(ensayos/castellano): propagate 03-poder changes to rioplatense"
```

---

## Task 13: Propagar 04-arquitectura → castellano

**Files:**
- Reference: `Ensayos/04-arquitectura.md` (post-Task 5)
- Modify: `Ensayos/castellano/04-arquitectura.md`

Este es el más cargado.

- [ ] **Step 1: Identificar deltas del inglés**

```bash
git diff <hash-pre-polish>..HEAD -- Ensayos/04-arquitectura.md
```

- [ ] **Step 2: Aplicar cada delta en castellano**

Cuidar especialmente:
- Frase puente al inicio (captura de permisos vs substancias) — propuesta:
  > "El poder, como argumentó el ensayo anterior, no es una sustancia que uno tenga. Pero los permisos que organizan una sociedad — quién está autorizado a decidir qué, con quién, bajo qué control — son reales, y se pueden capturar. Lo que sigue es una arquitectura que vuelve a esa captura cara, visible, y resistible."
- "cannot be captured the same way" → "no pueden ser capturados de la misma manera".
- Layer Five y las cuatro deudas según las decisiones #1 y #5 ya aplicadas en inglés en Task 5.

- [ ] **Step 3: Lectura de continuidad**

- [ ] **Step 4: Verify diff**

```bash
git diff --stat Ensayos/castellano/04-arquitectura.md
```

Esperado: el más grande de los 7 (50-150 líneas).

- [ ] **Step 5: Commit**

```bash
git add Ensayos/castellano/04-arquitectura.md
git commit -m "fix(ensayos/castellano): propagate 04-arquitectura changes to rioplatense"
```

---

## Task 14: Propagar 05-soberania → castellano

**Files:**
- Reference: `Ensayos/05-soberania.md` (post-Task 6)
- Modify: `Ensayos/castellano/05-soberania.md`

- [ ] **Step 1: Identificar deltas del inglés**

```bash
git diff <hash-pre-polish>..HEAD -- Ensayos/05-soberania.md
```

- [ ] **Step 2: Aplicar cada delta en castellano**

Cuidar especialmente el cierre del ensayo:
> "Bienvenido de vuelta, vos y los millones como vos. El país los está esperando hace más de lo que se imaginan."

(La forma "vos y los millones como vos" preserva el plural inclusivo del inglés.)

Y §X iniciando directo con su segundo párrafo.

- [ ] **Step 3: Lectura de continuidad**

- [ ] **Step 4: Verify diff**

- [ ] **Step 5: Commit**

```bash
git add Ensayos/castellano/05-soberania.md
git commit -m "fix(ensayos/castellano): propagate 05-soberania changes to rioplatense"
```

---

## Task 15: Propagar 06-belleza → castellano

**Files:**
- Reference: `Ensayos/06-belleza.md` (post-Task 7)
- Modify: `Ensayos/castellano/06-belleza.md`

- [ ] **Step 1: Identificar deltas del inglés**

```bash
git diff <hash-pre-polish>..HEAD -- Ensayos/06-belleza.md
```

- [ ] **Step 2: Aplicar cada delta en castellano**

Replicar la decisión #2 (Politics of the Sublime — queda y se aliviana / queda como está / movido al Credo) tal como se aplicó en inglés en Task 7.

- [ ] **Step 3: Lectura de continuidad**

- [ ] **Step 4: Verify diff**

- [ ] **Step 5: Commit**

```bash
git add Ensayos/castellano/06-belleza.md
git commit -m "fix(ensayos/castellano): propagate 06-belleza changes to rioplatense"
```

---

## Task 16: Propagar 07-carta → castellano

**Files:**
- Reference: `Ensayos/07-carta.md` (post-Task 8)
- Modify: `Ensayos/castellano/07-carta.md`

- [ ] **Step 1: Identificar deltas del inglés**

```bash
git diff <hash-pre-polish>..HEAD -- Ensayos/07-carta.md
```

- [ ] **Step 2: Aplicar cada delta en castellano**

Si la Cartografía se agregó al inglés en Task 8 Step 3, traducirla acá manteniendo la convención de las Cartografías ya existentes en los 6 anteriores.

- [ ] **Step 3: Lectura de continuidad**

- [ ] **Step 4: Verify diff**

- [ ] **Step 5: Commit**

```bash
git add Ensayos/castellano/07-carta.md
git commit -m "fix(ensayos/castellano): propagate 07-carta changes to rioplatense"
```

---

# Fase 3 — `/recursos/ensayos` en la plataforma (Tasks 17-24)

**Pre-condition:** Fases 1 y 2 cerradas. Los 7 archivos en `Ensayos/castellano/*.md` son la fuente de verdad para esta fase.

**Decisiones de arquitectura (recordatorio del spec §5):**
- Build-time bundle. Script Node lee MD → genera TS.
- `marked` (ya en `package.json`) hace MD → HTML.
- `gray-matter` NO se agrega como dep — frontmatter ad-hoc parseado con regex simple, o no se usa frontmatter (los títulos y subtítulos vienen de los headings `# / ##`).

---

## Task 17: Pipeline build — script + types + artefacto generado

**Files:**
- Create: `SocialJusticeHub/scripts/build-ensayos.ts`
- Create: `SocialJusticeHub/shared/ensayo-types.ts`
- Create: `SocialJusticeHub/client/src/content/ensayos.generated.ts` (vía script)
- Modify: `SocialJusticeHub/package.json` (añadir script + integrar al build)
- Modify: `SocialJusticeHub/.gitignore` (no — el artefacto generado SÍ se commitea, así prerender funciona en CI sin re-correr el script)

- [ ] **Step 1: Crear tipos compartidos**

Archivo `SocialJusticeHub/shared/ensayo-types.ts`:

```ts
export interface EnsayoCartografiaItem {
  label: string;       // "El Manifiesto del Hombre Gris"
  blurb: string;       // texto descriptivo después del em-dash
  href?: string;       // ruta interna si fue mapeada (ej. "/manifiesto"); undefined si no
}

export interface EnsayoCartografiaGroup {
  heading: string;     // "En la plataforma.", "En los planes estratégicos (¡BASTA!).", etc.
  items: EnsayoCartografiaItem[];
}

export interface EnsayoTocItem {
  id: string;          // id del heading (slug del texto)
  level: 2 | 3;        // h2 o h3
  text: string;        // "I. La herencia que olvidamos cuestionar"
}

export interface Ensayo {
  slug: string;                            // "presidencia"
  order: number;                           // 1..7
  type: 'ensayo' | 'carta';                // categoría visible en UI
  title: string;                           // "Por qué los presidentes son una idea estúpida"
  subtitle: string;                        // "Un ensayo sobre la arquitectura del poder"
  opening: string;                         // primer párrafo de prosa (sin headings)
  readingMinutes: number;                  // estimado 200 wpm
  bodyHtml: string;                        // HTML del cuerpo (sin Cartografía)
  toc: EnsayoTocItem[];
  cartografia: EnsayoCartografiaGroup[];   // parseada
  next?: { slug: string; title: string };  // enlace a "Continúa en"
}
```

- [ ] **Step 2: Crear el mapa de hrefs de Cartografía**

En el mismo archivo o en `SocialJusticeHub/shared/ensayo-cartografia-map.ts`:

```ts
// Mapa de etiquetas usadas en las Cartografías a rutas internas del sitio.
// Si una etiqueta no está acá, el item se renderiza como texto plano (sin link).
export const CARTOGRAFIA_HREF_MAP: Record<string, string> = {
  'El Manifiesto del Hombre Gris': '/manifiesto',
  'Manifiesto': '/manifiesto',
  'La Visión': '/la-vision',
  'El Mandato Vivo': '/el-mandato-vivo',
  'Mandato Territorial': '/el-mandato-vivo',
  'Mandato Público': '/el-mandato-vivo',
  'La Semilla de ¡BASTA!': '/la-semilla-de-basta',
  'La Semilla': '/la-semilla-de-basta',
  'El Mapa': '/el-mapa',
  'Datos Abiertos': '/explorar-datos',
  'Explorar Datos': '/explorar-datos',
  'Blog/Vlog': '/recursos/blog',
  'Blog': '/recursos/blog',
  'Vlog': '/recursos/vlog',
  'Kit de Prensa': '/kit-de-prensa',
  'Brand Media Package': '/kit-de-prensa',
  'Study Guides': '/recursos/guias-estudio',
  'Rutas de Transformación': '/recursos/guias-estudio',
  'Challenges': '/challenges',
  'Cancionero': '/cancionero',
  'Una Ruta para Argentina': '/recursos/ruta',
  'Perfil del Hombre Gris': '/el-instante-del-hombre-gris',
  'Persona del Hombre Gris': '/el-instante-del-hombre-gris',
  'Presentación de la Plataforma': '/',
  'La falacia de la democracia': '/recursos/ensayos/democracia',
  'La falacia del poder mismo': '/recursos/ensayos/poder',
  'Una arquitectura para el Hombre Gris': '/recursos/ensayos/arquitectura',
  'La soberanía del Hombre Gris': '/recursos/ensayos/soberania',
  'La belleza como acto político': '/recursos/ensayos/belleza',
  'Carta al Nieto': '/recursos/ensayos/carta-al-nieto',
};
```

(Verificar cada ruta: las que no existan en `App.tsx` se sacan del mapa o se dejan sin link. Por ejemplo `/cancionero` y `/kit-de-prensa` pueden no existir; comprobar y ajustar.)

- [ ] **Step 3: Verificar rutas del mapa contra App.tsx**

```bash
grep -E '^\s+<Route path=' SocialJusticeHub/client/src/App.tsx | sort -u
```

Por cada `href` del mapa, confirmar que la ruta existe. Si no existe, eliminar la entrada del mapa (no inventar rutas que rompan navegación).

- [ ] **Step 4: Crear `scripts/build-ensayos.ts`**

```ts
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { marked } from 'marked';
import type { Ensayo, EnsayoTocItem, EnsayoCartografiaGroup } from '../shared/ensayo-types';
import { CARTOGRAFIA_HREF_MAP } from '../shared/ensayo-cartografia-map';

const REPO_ROOT = resolve(__dirname, '../..');
const ENSAYOS_DIR = resolve(REPO_ROOT, 'Ensayos/castellano');
const OUT_FILE = resolve(__dirname, '../client/src/content/ensayos.generated.ts');

const FILES = [
  { order: 1, file: '01-presidencia.md', slug: 'presidencia',     type: 'ensayo' },
  { order: 2, file: '02-democracia.md',  slug: 'democracia',       type: 'ensayo' },
  { order: 3, file: '03-poder.md',       slug: 'poder',            type: 'ensayo' },
  { order: 4, file: '04-arquitectura.md',slug: 'arquitectura',     type: 'ensayo' },
  { order: 5, file: '05-soberania.md',   slug: 'soberania',        type: 'ensayo' },
  { order: 6, file: '06-belleza.md',     slug: 'belleza',          type: 'ensayo' },
  { order: 7, file: '07-carta.md',       slug: 'carta-al-nieto',   type: 'carta'  },
] as const;

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function splitBodyAndCartografia(md: string): { body: string; cartografia: string | null } {
  const idx = md.indexOf('## Cartografía');
  if (idx === -1) return { body: md, cartografia: null };
  return {
    body: md.slice(0, idx).trim(),
    cartografia: md.slice(idx).trim(),
  };
}

function parseCartografia(md: string | null): EnsayoCartografiaGroup[] {
  if (!md) return [];
  // Estructura: "## Cartografía\n\n[texto intro opcional]\n\n**Heading.**\n\n- *Label* — blurb\n- ...\n\n**Heading 2.**\n..."
  const lines = md.split('\n');
  const groups: EnsayoCartografiaGroup[] = [];
  let current: EnsayoCartografiaGroup | null = null;
  for (const line of lines) {
    const headingMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      current = { heading: headingMatch[1], items: [] };
      groups.push(current);
      continue;
    }
    const bulletMatch = line.match(/^-\s+\*(.+?)\*\s+—\s+(.+)$/);
    if (bulletMatch && current) {
      const label = bulletMatch[1].trim();
      const blurb = bulletMatch[2].trim();
      const href = CARTOGRAFIA_HREF_MAP[label];
      current.items.push({ label, blurb, href });
    }
  }
  return groups;
}

function buildToc(html: string): EnsayoTocItem[] {
  // Match h2 and h3 in rendered HTML.
  const toc: EnsayoTocItem[] = [];
  const re = /<h([23])[^>]*>(.*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const level = Number(m[1]) as 2 | 3;
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (text === 'Cartografía') continue; // excluded — body only
    toc.push({ id: slugifyHeading(text), level, text });
  }
  return toc;
}

function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])>(.*?)<\/h\1>/g, (_, lvl, text) => {
    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    return `<h${lvl} id="${slugifyHeading(cleanText)}">${text}</h${lvl}>`;
  });
}

function extractTitleSubtitle(md: string): { title: string; subtitle: string } {
  const titleMatch = md.match(/^# (.+)$/m);
  const subtitleMatch = md.match(/^## (?!I\. |II\. |III\. )(.+)$/m); // first ## not numbered
  return {
    title: titleMatch?.[1].trim() ?? '',
    subtitle: subtitleMatch?.[1].trim() ?? '',
  };
}

function extractOpening(body: string): string {
  // Find first paragraph after subtitle (## ...) and first numbered section (## I. ...)
  const lines = body.split('\n');
  const startIdx = lines.findIndex((l) => /^## I\. /.test(l));
  if (startIdx === -1) return '';
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#') && !line.startsWith('-')) {
      return line;
    }
  }
  return '';
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function build(): Ensayo[] {
  const ensayos: Ensayo[] = [];
  for (const meta of FILES) {
    const md = readFileSync(resolve(ENSAYOS_DIR, meta.file), 'utf8');
    const { body, cartografia: cartoMd } = splitBodyAndCartografia(md);
    const { title, subtitle } = extractTitleSubtitle(body);
    const opening = extractOpening(body);
    const html = injectHeadingIds(marked.parse(body) as string);
    const toc = buildToc(html);
    const cartografia = parseCartografia(cartoMd);
    const wordCount = countWords(body);
    const readingMinutes = Math.max(1, Math.round(wordCount / 200));

    const next = FILES.find((f) => f.order === meta.order + 1);
    ensayos.push({
      slug: meta.slug,
      order: meta.order,
      type: meta.type,
      title,
      subtitle,
      opening,
      readingMinutes,
      bodyHtml: html,
      toc,
      cartografia,
      next: next ? { slug: next.slug, title: '' } : undefined,
    });
  }
  // Fill in next.title now that we have all titles.
  for (const e of ensayos) {
    if (e.next) {
      const target = ensayos.find((x) => x.slug === e.next!.slug);
      if (target) e.next.title = target.title;
    }
  }
  return ensayos;
}

const ensayos = build();
mkdirSync(dirname(OUT_FILE), { recursive: true });
const out = `// AUTO-GENERATED by scripts/build-ensayos.ts. Do not edit by hand.
import type { Ensayo } from '@shared/ensayo-types';

export const ensayos: Ensayo[] = ${JSON.stringify(ensayos, null, 2)};
`;
writeFileSync(OUT_FILE, out, 'utf8');
console.log(`Generated ${OUT_FILE} with ${ensayos.length} ensayos.`);
```

- [ ] **Step 5: Añadir script al `package.json`**

Editar `SocialJusticeHub/package.json`:

```json
"scripts": {
  ...,
  "ensayos:build": "tsx scripts/build-ensayos.ts",
  "build": "vite build && tsx scripts/course-route-manifest.ts --out=dist/public/course-route-manifest.json && tsx scripts/prerender-course-seo.ts && tsx scripts/prerender-blog-seo.ts && tsx scripts/build-ensayos.ts && tsx scripts/prerender-ensayos-seo.ts && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist && esbuild server/vercel-handler.ts --platform=node --packages=external --bundle --format=esm --outfile=api/index.mjs",
}
```

(`build-ensayos` corre antes de `prerender-ensayos-seo`. El prerender se crea en Task 23 — por ahora solo el build, ajustar en Task 23. Para esta task, dejar el build sin el prerender step:)

```json
"build": "vite build && tsx scripts/course-route-manifest.ts --out=dist/public/course-route-manifest.json && tsx scripts/prerender-course-seo.ts && tsx scripts/prerender-blog-seo.ts && tsx scripts/build-ensayos.ts && esbuild ..."
```

- [ ] **Step 6: Correr el script standalone**

```bash
cd SocialJusticeHub && npm run ensayos:build
```

Esperado: `Generated ...ensayos.generated.ts with 7 ensayos.`. Sin errores.

- [ ] **Step 7: Inspeccionar el artefacto**

```bash
head -50 SocialJusticeHub/client/src/content/ensayos.generated.ts
wc -l SocialJusticeHub/client/src/content/ensayos.generated.ts
```

Esperado: archivo grande (varios miles de líneas — los 7 ensayos en HTML escapado a JSON).

- [ ] **Step 8: Type check**

```bash
cd SocialJusticeHub && npm run check
```

Esperado: PASS.

- [ ] **Step 9: Commit**

```bash
git add SocialJusticeHub/scripts/build-ensayos.ts SocialJusticeHub/shared/ensayo-types.ts SocialJusticeHub/shared/ensayo-cartografia-map.ts SocialJusticeHub/client/src/content/ensayos.generated.ts SocialJusticeHub/package.json
git commit -m "feat(ensayos): add build-ensayos pipeline (md → ts module)"
```

---

## Task 18: Tarjeta Ensayos en Recursos

**Files:**
- Modify: `SocialJusticeHub/client/src/pages/Resources.tsx`

- [ ] **Step 1: Leer Resources.tsx para ubicar el array `resourceCards`**

```bash
grep -n "resourceCards" SocialJusticeHub/client/src/pages/Resources.tsx
```

- [ ] **Step 2: Añadir entrada para Ensayos**

Añadir como cuarta entrada del array (después de Rutas de Transformación), usando los defaults de la decisión #8 del pre-flight:

```tsx
{
  title: 'Ensayos',
  subtitle: 'PENSAMIENTO',
  description: 'Textos largos para pensar la república desde abajo. Un cuaderno abierto del Hombre Gris donde se ensayan ideas, se discuten arquitecturas y se busca la palabra justa.',
  icon: BookOpen,
  href: '/recursos/ensayos',
  count: 7,
  gradient: 'from-amber-500/10 to-rose-500/10',
  iconColor: 'bg-amber-100 text-amber-700',
  cta: 'Leer Ensayos',
  delay: 0.5
}
```

(`BookOpen` ya está importado en Resources.tsx — verificar. Si no, añadir al import.)

- [ ] **Step 3: Type check**

```bash
cd SocialJusticeHub && npm run check
```

- [ ] **Step 4: Smoke en navegador**

Ir a http://localhost:3001/recursos. Confirmar que aparecen 4 tarjetas y la nueva linkea a `/recursos/ensayos` (que aún no existe — 404 esperado).

- [ ] **Step 5: Commit**

```bash
git add SocialJusticeHub/client/src/pages/Resources.tsx
git commit -m "feat(ensayos): add Ensayos card to Recursos hub"
```

---

## Task 19: Página índice — `Ensayos.tsx`

**Files:**
- Create: `SocialJusticeHub/client/src/pages/Ensayos.tsx`
- Modify: `SocialJusticeHub/client/src/App.tsx`

- [ ] **Step 1: Crear `Ensayos.tsx`**

```tsx
import { useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GlassCard from '@/components/ui/GlassCard';
import FluidBackground from '@/components/ui/FluidBackground';
import { ArrowRight, BookOpen, Mail } from 'lucide-react';
import { ensayos } from '@/content/ensayos.generated';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

const Ensayos = () => {
  useEffect(() => {
    document.title = 'Ensayos — El Instante del Hombre Gris';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-mist-white">
      <FluidBackground />
      <Header />
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-12"
        >
          <motion.header variants={fadeUp} className="space-y-4">
            <p className="uppercase tracking-widest text-xs text-amber-300/80">Pensamiento</p>
            <h1 className="font-serif text-5xl md:text-6xl leading-tight">Ensayos</h1>
            <p className="text-lg text-mist-white/70 max-w-2xl">
              Un cuaderno abierto del Hombre Gris. Acá se ensayan ideas, se discuten arquitecturas, y se busca la palabra justa antes de bajar al gesto. Empieza con siete piezas. Va a haber más.
            </p>
          </motion.header>

          <motion.ol variants={staggerContainer} className="space-y-6">
            {ensayos.map((ensayo) => (
              <motion.li key={ensayo.slug} variants={fadeUp}>
                <Link href={`/recursos/ensayos/${ensayo.slug}`}>
                  <GlassCard className="p-6 md:p-8 cursor-pointer group hover:border-amber-300/30 transition-colors">
                    <div className="flex items-start gap-4 md:gap-6">
                      <div className="flex-shrink-0 hidden md:flex flex-col items-center pt-1">
                        <span className="text-amber-300/60 font-mono text-sm">
                          {String(ensayo.order).padStart(2, '0')}
                        </span>
                        {ensayo.type === 'carta' ? (
                          <Mail className="mt-3 w-5 h-5 text-amber-300/60" />
                        ) : (
                          <BookOpen className="mt-3 w-5 h-5 text-amber-300/60" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-baseline gap-3">
                          <span className="md:hidden text-amber-300/60 font-mono text-sm">
                            {String(ensayo.order).padStart(2, '0')}
                          </span>
                          <h2 className="font-serif text-2xl md:text-3xl leading-tight">
                            {ensayo.title}
                          </h2>
                        </div>
                        <p className="text-mist-white/60 italic">{ensayo.subtitle}</p>
                        <p className="text-mist-white/75 leading-relaxed">{ensayo.opening}</p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs uppercase tracking-widest text-mist-white/40">
                            {ensayo.type} · {ensayo.readingMinutes} min de lectura
                          </span>
                          <span className="flex items-center gap-1 text-amber-300/80 group-hover:translate-x-1 transition-transform">
                            Leer <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Ensayos;
```

- [ ] **Step 2: Añadir ruta en `App.tsx`**

Importar con `React.lazy()` siguiendo el patrón existente de la app:

```tsx
const Ensayos = lazy(() => import('@/pages/Ensayos'));
```

(Ubicar el import junto a los otros `lazy(...)` para Recursos.)

Añadir la `<Route>` al `<Switch>`. Ubicarla **antes** de `/recursos/blog/:slug` para que `/recursos/ensayos` no sea capturado por otro patrón. Patrón observado en `App.tsx`:

```tsx
<Route path="/recursos/ensayos" component={Ensayos} />
```

- [ ] **Step 3: Type check**

```bash
cd SocialJusticeHub && npm run check
```

- [ ] **Step 4: Smoke en navegador**

```bash
cd SocialJusticeHub && npm run dev
```

Ir a http://localhost:3001/recursos/ensayos. Esperar:
- 7 tarjetas listadas en orden 01-07.
- La 07 muestra ícono de Mail; las otras BookOpen.
- Click en una linkea a `/recursos/ensayos/<slug>` (que aún no existe — 404 esperado).

- [ ] **Step 5: Commit**

```bash
git add SocialJusticeHub/client/src/pages/Ensayos.tsx SocialJusticeHub/client/src/App.tsx
git commit -m "feat(ensayos): add /recursos/ensayos index page"
```

---

## Task 20: Página de detalle — `EnsayoDetail.tsx`

**Files:**
- Create: `SocialJusticeHub/client/src/pages/EnsayoDetail.tsx`
- Modify: `SocialJusticeHub/client/src/App.tsx`

- [ ] **Step 1: Crear `EnsayoDetail.tsx`**

```tsx
import { useEffect, useMemo } from 'react';
import { Link, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FluidBackground from '@/components/ui/FluidBackground';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ensayos } from '@/content/ensayos.generated';
import { fadeUp } from '@/lib/motion-variants';

const EnsayoDetail = () => {
  const [, params] = useRoute('/recursos/ensayos/:slug');
  const slug = params?.slug;

  const ensayo = useMemo(
    () => ensayos.find((e) => e.slug === slug),
    [slug],
  );

  useEffect(() => {
    if (ensayo) {
      document.title = `${ensayo.title} — Ensayos — El Instante del Hombre Gris`;
    }
    window.scrollTo(0, 0);
  }, [ensayo]);

  if (!ensayo) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-mist-white">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="font-serif text-3xl">Ensayo no encontrado</h1>
          <Link href="/recursos/ensayos" className="text-amber-300/80 underline mt-4 inline-block">
            Volver al índice
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-mist-white">
      <FluidBackground />
      <Header />
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,680px)_280px] gap-8 lg:gap-12 justify-center">
          {/* Left sticky TOC */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 text-sm space-y-2">
              <p className="uppercase tracking-widest text-xs text-mist-white/40 mb-3">Secciones</p>
              <ul className="space-y-2">
                {ensayo.toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? 'pl-3' : ''}>
                    <a
                      href={`#${item.id}`}
                      className="text-mist-white/60 hover:text-amber-300/90 transition-colors block"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Body */}
          <motion.article
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="min-w-0"
          >
            <header className="mb-12 space-y-3">
              <Link
                href="/recursos/ensayos"
                className="inline-flex items-center gap-1 text-sm text-mist-white/50 hover:text-amber-300/80 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Ensayos
              </Link>
              <p className="uppercase tracking-widest text-xs text-amber-300/80">
                {String(ensayo.order).padStart(2, '0')} · {ensayo.type}
              </p>
              <h1 className="font-serif text-4xl md:text-5xl leading-tight">{ensayo.title}</h1>
              <p className="text-lg italic text-mist-white/60">{ensayo.subtitle}</p>
              <p className="text-xs text-mist-white/40">{ensayo.readingMinutes} min de lectura</p>
            </header>

            <div
              className="prose prose-invert prose-amber max-w-none font-serif prose-headings:font-serif prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-p:leading-[1.8] prose-p:text-mist-white/85 prose-em:text-amber-200/90 prose-strong:text-mist-white"
              dangerouslySetInnerHTML={{ __html: ensayo.bodyHtml }}
            />

            {/* Mobile-only Cartografía */}
            <aside className="lg:hidden mt-16">
              <CartografiaBlock cartografia={ensayo.cartografia} />
            </aside>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
              <Link
                href="/recursos/ensayos"
                className="inline-flex items-center gap-2 text-mist-white/60 hover:text-amber-300/90 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al índice
              </Link>
              {ensayo.next && (
                <Link
                  href={`/recursos/ensayos/${ensayo.next.slug}`}
                  className="inline-flex items-center gap-2 text-amber-300/80 hover:text-amber-300 transition-colors text-right"
                >
                  <span>
                    <span className="block text-xs uppercase tracking-widest text-mist-white/40">
                      Continúa en
                    </span>
                    <span className="font-serif">{ensayo.next.title}</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </footer>
          </motion.article>

          {/* Right sticky Cartografía */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <CartografiaBlock cartografia={ensayo.cartografia} />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const CartografiaBlock = ({ cartografia }: { cartografia: typeof ensayos[number]['cartografia'] }) => {
  if (cartografia.length === 0) return null;
  return (
    <div className="text-sm space-y-6">
      <p className="uppercase tracking-widest text-xs text-mist-white/40">Cartografía</p>
      {cartografia.map((group) => (
        <div key={group.heading} className="space-y-3">
          <p className="font-semibold text-mist-white/80">{group.heading}</p>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <li key={item.label} className="text-mist-white/60 leading-relaxed">
                {item.href ? (
                  <Link href={item.href} className="text-amber-300/90 hover:text-amber-300 italic">
                    {item.label}
                  </Link>
                ) : (
                  <em className="text-mist-white/80">{item.label}</em>
                )}
                {' — '}
                <span>{item.blurb}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default EnsayoDetail;
```

- [ ] **Step 2: Añadir ruta en `App.tsx`**

```tsx
const EnsayoDetail = lazy(() => import('@/pages/EnsayoDetail'));
```

```tsx
<Route path="/recursos/ensayos/:slug" component={EnsayoDetail} />
```

- [ ] **Step 3: Type check**

```bash
cd SocialJusticeHub && npm run check
```

- [ ] **Step 4: Smoke en navegador**

Ir a http://localhost:3001/recursos/ensayos/presidencia. Confirmar:
- Body se renderiza con prose serif.
- TOC izquierda lista las secciones I-VIII y los clicks anchor scrollean.
- Cartografía derecha lista los items, los que tienen href en el mapa son links.
- Footer muestra "Continúa en — La falacia de la democracia" linkeando a `/recursos/ensayos/democracia`.
- Mobile: Cartografía cae al final del cuerpo.

- [ ] **Step 5: Smoke todos los slugs**

Visitar las 7 rutas y verificar render correcto:
- /recursos/ensayos/presidencia
- /recursos/ensayos/democracia
- /recursos/ensayos/poder
- /recursos/ensayos/arquitectura
- /recursos/ensayos/soberania
- /recursos/ensayos/belleza
- /recursos/ensayos/carta-al-nieto

Y un slug inexistente:
- /recursos/ensayos/foo → "Ensayo no encontrado".

- [ ] **Step 6: Commit**

```bash
git add SocialJusticeHub/client/src/pages/EnsayoDetail.tsx SocialJusticeHub/client/src/App.tsx
git commit -m "feat(ensayos): add /recursos/ensayos/:slug detail page with TOC + Cartografía"
```

---

## Task 21: Componente compartido `EnsayoLinkCard`

**Files:**
- Create: `SocialJusticeHub/client/src/components/EnsayoLinkCard.tsx`

Este componente se reutiliza en las 5 páginas de la plataforma que sembran link inverso a ensayos. Diseño chico (no las cards grandes de Resources).

- [ ] **Step 1: Crear el componente**

```tsx
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { ensayos } from '@/content/ensayos.generated';

interface Props {
  slug: string;
}

const EnsayoLinkCard = ({ slug }: Props) => {
  const ensayo = ensayos.find((e) => e.slug === slug);
  if (!ensayo) return null;
  return (
    <Link href={`/recursos/ensayos/${ensayo.slug}`}>
      <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-5 hover:border-amber-300/30 transition-colors cursor-pointer group">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-amber-300/70">
              Ensayo {String(ensayo.order).padStart(2, '0')}
            </p>
            <h4 className="font-serif text-lg leading-snug text-mist-white">{ensayo.title}</h4>
            <p className="text-sm text-mist-white/60 line-clamp-2">{ensayo.opening}</p>
          </div>
          <ArrowRight className="w-4 h-4 mt-2 text-amber-300/70 group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
};

export default EnsayoLinkCard;
```

- [ ] **Step 2: Type check**

```bash
cd SocialJusticeHub && npm run check
```

- [ ] **Step 3: Commit**

```bash
git add SocialJusticeHub/client/src/components/EnsayoLinkCard.tsx
git commit -m "feat(ensayos): add EnsayoLinkCard shared component"
```

---

## Task 22: Sembrar bloques de navegación inversa (5 páginas)

**Files:**
- Modify: `SocialJusticeHub/client/src/pages/Manifiesto.tsx`
- Modify: `SocialJusticeHub/client/src/pages/LaVision.tsx`
- Modify: `SocialJusticeHub/client/src/pages/ElInstanteDelHombreGris.tsx`
- Modify: `SocialJusticeHub/client/src/pages/ElMandatoVivo.tsx`
- Modify: `SocialJusticeHub/client/src/pages/LaSemillaDeBasta.tsx`

Patrón: en cada página, agregar **un solo bloque** cerca del final del cuerpo (antes del footer / CTA / Power CTA, no como sección floating). Estructura del bloque:

```tsx
<section className="max-w-4xl mx-auto px-4 py-16">
  <div className="space-y-2 mb-8">
    <p className="uppercase tracking-widest text-xs text-amber-300/80">{categoria}</p>
    <h2 className="font-serif text-3xl">{titulo}</h2>
    <p className="text-mist-white/60 max-w-2xl">{intro}</p>
  </div>
  <div className="grid gap-4 md:grid-cols-2">
    <EnsayoLinkCard slug="..." />
    <EnsayoLinkCard slug="..." />
  </div>
</section>
```

(`md:grid-cols-2` cuando hay 2; usar `md:grid-cols-3` cuando hay 3.)

- [ ] **Step 1: Manifiesto.tsx**

Importar `EnsayoLinkCard`. Insertar bloque cerca del final con:
- categoria: "Pensamiento"
- titulo: "El pensamiento detrás del manifiesto"
- intro: "El manifiesto nombra. Los ensayos argumentan. Empezá por dónde duele más, leélos en orden, o salteálos hasta que algo te pinche."
- slugs: `presidencia`, `democracia`, `poder` (3 cards en grid).

- [ ] **Step 2: LaVision.tsx**

- categoria: "Pensamiento"
- titulo: "La arquitectura, en largo"
- intro: "La visión condensa. El ensayo despliega — capa por capa, rol por rol, lo que ¡BASTA! pretende."
- slugs: `arquitectura` (1 card, sin grid).

- [ ] **Step 3: ElInstanteDelHombreGris.tsx**

- categoria: "Pensamiento"
- titulo: "Qué soberanía recuperás"
- intro: "El instante es el verbo. Este ensayo es el cuerpo del verbo: atención, voz, agencia, mano, hogar, calle, no."
- slugs: `soberania` (1 card).

- [ ] **Step 4: ElMandatoVivo.tsx**

- categoria: "Pensamiento"
- titulo: "Por qué el mandato es vivo"
- intro: "Las dos piezas que explican por qué la asamblea barrial — sorteada, deliberativa, anti-captura — es la unidad real de la república nueva."
- slugs: `democracia`, `arquitectura` (2 cards).

- [ ] **Step 5: LaSemillaDeBasta.tsx**

- categoria: "Pensamiento"
- titulo: "Qué clase de movida"
- intro: "Tres lecturas para entender qué pesa cuando uno firma la semilla y se mete a construir."
- slugs: `arquitectura`, `soberania`, `carta-al-nieto` (3 cards).

- [ ] **Step 6: Type check**

```bash
cd SocialJusticeHub && npm run check
```

- [ ] **Step 7: Smoke en navegador (5 páginas)**

Visitar:
- /manifiesto
- /la-vision
- /el-instante-del-hombre-gris
- /el-mandato-vivo
- /la-semilla-de-basta

En cada una verificar:
- El bloque aparece cerca del final, no rompe el layout.
- Los cards linkean correctamente y al hover el ícono se desplaza.

- [ ] **Step 8: Commit**

```bash
git add SocialJusticeHub/client/src/pages/Manifiesto.tsx SocialJusticeHub/client/src/pages/LaVision.tsx SocialJusticeHub/client/src/pages/ElInstanteDelHombreGris.tsx SocialJusticeHub/client/src/pages/ElMandatoVivo.tsx SocialJusticeHub/client/src/pages/LaSemillaDeBasta.tsx
git commit -m "feat(ensayos): seed inverse links from 5 platform pages to ensayos"
```

---

## Task 23: Prerender SEO

**Files:**
- Create: `SocialJusticeHub/scripts/prerender-ensayos-seo.ts`
- Modify: `SocialJusticeHub/package.json` (build script)

Replicar el patrón de `prerender-blog-seo.ts` y `prerender-course-seo.ts`. La meta es escribir HTML estático con `<title>` y meta description correctas para los crawlers.

- [ ] **Step 1: Inspeccionar prerender existente**

```bash
cat SocialJusticeHub/scripts/prerender-blog-seo.ts | head -80
```

Anotar el patrón exacto de generación de HTML, donde se escribe el output (`dist/public/<ruta>/index.html`?), y cómo inyecta meta tags.

- [ ] **Step 2: Crear `prerender-ensayos-seo.ts`**

Adaptar el patrón de blog. Para cada ensayo en el artefacto generado:

```ts
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { ensayos } from '../client/src/content/ensayos.generated';

const DIST = resolve(__dirname, '../dist/public');
const TEMPLATE = readFileSync(resolve(DIST, 'index.html'), 'utf8');

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderHtml(title: string, description: string): string {
  return TEMPLATE
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${escape(description)}"`);
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + '…';
}

// Index page
const indexHtml = renderHtml(
  'Ensayos — El Instante del Hombre Gris',
  'Un cuaderno abierto del Hombre Gris. Textos largos para pensar la república desde abajo.',
);
const indexPath = resolve(DIST, 'recursos/ensayos/index.html');
mkdirSync(dirname(indexPath), { recursive: true });
writeFileSync(indexPath, indexHtml);

// Each ensayo
for (const e of ensayos) {
  const html = renderHtml(
    `${e.title} — Ensayos — El Instante del Hombre Gris`,
    truncate(e.opening, 160),
  );
  const path = resolve(DIST, `recursos/ensayos/${e.slug}/index.html`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
}

console.log(`Prerendered ${ensayos.length + 1} ensayos pages.`);
```

(Si el patrón de blog hace algo distinto — por ejemplo, manifest de rutas — adaptarse a ese patrón. Esta task tiene que seguir el patrón existente, no inventar uno propio.)

- [ ] **Step 3: Añadir al `build` script en package.json**

```json
"build": "vite build && tsx scripts/course-route-manifest.ts --out=dist/public/course-route-manifest.json && tsx scripts/prerender-course-seo.ts && tsx scripts/prerender-blog-seo.ts && tsx scripts/build-ensayos.ts && tsx scripts/prerender-ensayos-seo.ts && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist && esbuild server/vercel-handler.ts --platform=node --packages=external --bundle --format=esm --outfile=api/index.mjs"
```

(`prerender-ensayos-seo` corre **después** de `vite build` (necesita `dist/public/index.html`) y **después** de `build-ensayos` (necesita el módulo TS). Confirmar el orden.)

- [ ] **Step 4: Correr build completo**

```bash
cd SocialJusticeHub && npm run build
```

Esperado:
- `Generated ...ensayos.generated.ts with 7 ensayos.`
- `Prerendered 8 ensayos pages.` (1 index + 7 detail).
- Build de Vite y esbuild OK.

- [ ] **Step 5: Verificar artefactos**

```bash
ls SocialJusticeHub/dist/public/recursos/ensayos/
```

Esperado: `index.html`, y subdirectorios `presidencia/`, `democracia/`, ..., `carta-al-nieto/`, cada uno con `index.html`.

```bash
grep "<title>" SocialJusticeHub/dist/public/recursos/ensayos/presidencia/index.html
```

Esperado: `<title>Por qué los presidentes son una idea estúpida — Ensayos — El Instante del Hombre Gris</title>`.

- [ ] **Step 6: Commit**

```bash
git add SocialJusticeHub/scripts/prerender-ensayos-seo.ts SocialJusticeHub/package.json
git commit -m "feat(ensayos): prerender SEO for /recursos/ensayos and detail routes"
```

---

## Task 24: Verify final + check de rutas

**Files:**
- Run-only.

- [ ] **Step 1: `npm run check`**

```bash
cd SocialJusticeHub && npm run check
```

Esperado: PASS (sin errores TS).

- [ ] **Step 2: `npm run check:routes`**

```bash
cd SocialJusticeHub && npm run check:routes
```

Esperado: PASS. Si falla por las rutas nuevas, leer el output y ajustar.

- [ ] **Step 3: `npm run verify`**

```bash
cd SocialJusticeHub && npm run verify
```

Esperado: PASS. Si falla, leer el output y ajustar el commit que rompió.

- [ ] **Step 4: Smoke final en navegador**

```bash
cd SocialJusticeHub && npm run dev
```

Recorrer:
- `/recursos` → ver 4 tarjetas, click en Ensayos.
- `/recursos/ensayos` → ver índice de 7.
- Click en cada uno: detalle renderiza, TOC funciona, Cartografía linkea correcto, "Continúa en" linkea correcto.
- `/manifiesto`, `/la-vision`, `/el-instante-del-hombre-gris`, `/el-mandato-vivo`, `/la-semilla-de-basta`: el bloque inverso aparece y funciona.

- [ ] **Step 5: Lighthouse smoke (opcional)**

En Chrome DevTools, Lighthouse mode → /recursos/ensayos/presidencia. Targetear ≥ 90 en performance y SEO.

- [ ] **Step 6: Commit final si hizo falta algún ajuste**

Si los pasos anteriores requirieron commits de fix, listarlos. Si no:

> No additional commit needed. Phase 3 deliverables verified.

---

# Cierre

Al final de las 24 tasks (3 fases), el repo tiene:

- 7 ensayos polishados en inglés (`/Ensayos/*.md`).
- 7 ensayos rioplatenses sincronizados (`/Ensayos/castellano/*.md`).
- Análisis y trail de decisiones cerrados en `/Ensayos/00-ANALISIS.md` y `00-ANALISIS-07.md`.
- Pipeline build-time `scripts/build-ensayos.ts` + artefacto `client/src/content/ensayos.generated.ts`.
- Páginas `/recursos/ensayos` y `/recursos/ensayos/:slug` funcionando.
- Tarjeta nueva en Recursos.
- Componente `EnsayoLinkCard` usado en 5 páginas como navegación inversa.
- Prerender SEO para las 8 rutas (1 index + 7 detalles).
- `npm run verify` pasa.

Lo que **no** se hizo (out of scope):
- El Credo (decisión postergada — revisar status #4 al cierre).
- Versión inglesa publicada en el sitio.
- Comentarios, login, búsqueda full-text, audio, edición desde UI.
- Reestructurar / fusionar / mover material entre ensayos.

Próximos posibles ensayos: la sección Ensayos está diseñada para sumar piezas — basta agregar el archivo `.md` en `/Ensayos/castellano/`, sumar la entrada en `FILES` de `scripts/build-ensayos.ts`, y un commit que dispare `npm run ensayos:build`.
