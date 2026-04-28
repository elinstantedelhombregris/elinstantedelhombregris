# Ensayos — auditoría de contenido y extensión a la plataforma

**Spec — 28 de abril de 2026**

## 0. Resumen

Los siete ensayos (`/Ensayos/01-presidencia.md` … `/Ensayos/07-carta.md`) son material keystone del movimiento. Hoy viven como archivos sueltos: la versión inglesa pulida en raíz, la traducción rioplatense en `/Ensayos/castellano/`, y un análisis crítico (`00-ANALISIS.md`, escrito el 26 de abril) que recomendó polishes específicos por ensayo y que aún no fue aplicado. La plataforma `el instante del hombre gris` no los referencia: las Cartografías al pie de cada ensayo apuntan al sitio, pero el sitio no apunta de vuelta y los ensayos no son leíbles en línea.

Este documento define un plan en tres fases para cerrar ese gap, en este orden no negociable:

1. **Auditoría y polish del contenido en inglés** — aplicar las recomendaciones de `00-ANALISIS.md`, auditar `07-carta` (que el análisis no cubre porque se escribió después), y resolver tensiones internas entre ensayos.
2. **Propagación al castellano rioplatense** — propagar cada cambio aprobado del inglés a su equivalente en `/Ensayos/castellano/`, preservando voz rioplatense.
3. **Sección Ensayos en `/recursos`** — nueva página `/recursos/ensayos` como "playground" de pensamiento del Hombre Gris, con los siete ensayos como contenido inaugural y arquitectura abierta para sumar más en el futuro.

## 1. Restricciones que mandan

**Tono > ambición.** Los ensayos son keystone documents. Default: light edits — sacar marcas de chat, fijar errores, suavizar repeticiones evidentes, agregar Cartografía/transiciones. **No reestructurar, no fusionar, no mover material entre ensayos sin aprobación explícita.** Toda decisión marcada como "abierta" en este spec se confirma con el usuario antes de tocar prosa.

**Reversibilidad sobre alcance.** Cada cambio se hace en commits chicos por ensayo, con diff visible para que se pueda revertir granularmente.

**Inglés primero, castellano después.** No traducir cambios mientras el inglés sigue moviéndose. Una vez que un ensayo se da por cerrado en inglés, se propaga al castellano y se cierra ahí también.

**La plataforma es lectura, no edición.** `/recursos/ensayos` lee los archivos `.md` (en castellano) y los renderiza. La autoría sigue siendo en el sistema de archivos, versionada por git. No hay CMS, no hay tabla en Postgres, no hay edición desde el sitio.

## 2. Estado actual (descubierto en pre-spec)

| Ítem | Estado |
|---|---|
| `/Ensayos/Ensayos 1` (sin extensión) | Export crudo del chat original. Inglés con scaffolding (`Decision headline`, `Key assumptions`, `[Inference]`, `[Speculation]`). Fuente histórica, no se toca. |
| `/Ensayos/01..07-*.md` (raíz) | Inglés post-export, ya con marcas de chat removidas y Cartografías al pie. |
| `/Ensayos/castellano/01..07-*.md` | Traducción rioplatense de los anteriores. Difieren línea por línea de los de raíz porque uno está en inglés y otro en español. |
| `/Ensayos/00-ANALISIS.md` | Análisis crítico del 2026-04-26. Cubre los 6 originales (no el 07). Define niveles de polish: mínimo+, medio, medio−, medio+, mínimo+, medio. Identifica 7 pasajes específicos y 4 tensiones cruzadas. |
| `/Ensayos/07-carta.md` | "Carta al Nieto", escrito post-análisis. **No fue auditado.** |
| Plataforma — referencias a "ensayo" | Cero. `grep -ri "ensayo\|essay" client/src` devuelve nada. |
| Páginas que las Cartografías referencian | Existen: Manifiesto, LaVision, ElMandatoVivo, MandatoTerritorial, MandatoPublico, LaSemillaDeBasta, ElInstanteDelHombreGris, ElMapa, BlogVlog, StudyGuides. |
| `Resources.tsx` | Tres tarjetas: Blog, Vlog, Rutas de Transformación. |

## 3. Fase 1 — Auditoría y polish en inglés

**Objetivo:** llevar los siete ensayos en raíz a "cerrados" como obra antes de que el castellano se mueva.

### 3.1 Insumo: aplicar `00-ANALISIS.md`

El análisis ya hizo el trabajo de diagnóstico. Esta fase es ejecución, no re-análisis. Por ensayo:

| Ensayo | Nivel | Acciones concretas (de §VII del análisis) |
|---|---|---|
| 01 Presidencia | mínimo+ | Sacar marcas de chat. Condensar el espejo argentino (§IV) de cinco a tres párrafos. Suavizar repeticiones de "the grey man" en posición de cierre. |
| 02 Democracia | medio | Sacar marcas. "conspiracy" → "design"/"arrangement" (§II). Hacer explícita la postura del voto ("necesario pero radicalmente insuficiente"). Apretar espejo argentino (§VI). Decidir caso por caso si "forty-three years" se generaliza. |
| 03 Poder | medio− | Sacar marcas. **Decisión abierta:** colapsar las cuatro razones de "Why the Fiction Persists" (§IV) a tres eliminando la acusación a la academia, o dejarlo. Por defecto: dejar — la sección académica le da cuatro patas a la mesa. |
| 04 Arquitectura | medio+ | Sacar marcas. Frase corta al inicio que reconozca el cambio de registro respecto al 3 (captura de permisos, no de substancias). "Sortition citizens cannot be captured by donors" → "cannot be captured the same way". **Decisión abierta:** Layer Five: resolver con tres frases o sacar y nombrar como deuda. Coser las cuatro deudas (internacional/violencia/velocidad/primera generación) según se vayan al 7 o no. **No tocar la sobre-enumeración sin autorización explícita.** |
| 05 Soberanía | mínimo+ | Sacar marcas. Empezar §X directo con su segundo párrafo. Matizar el cierre ("Welcome back, you and the millions like you") para evitar resonancia mesiánica. |
| 06 Belleza | medio | Sacar marcas. **Decisión abierta:** §VIII (Politics of the Sublime) — queda, se aliviana o se mueve al Credo. Por defecto: queda y se aliviana. Apretar §II (Aesthetic of Capture). Cuidar referencias a las canciones — que sigan siendo internas, sin listar. |

### 3.2 Auditoría delta del 07-carta

`00-ANALISIS.md` no lo cubre. Antes de polishear el 07, escribir una auditoría delta (`Ensayos/00-ANALISIS-07.md`, formato corto, ~300-500 palabras) que conteste:

- ¿Cumple el rol que el análisis le asignó (responder "¿a quién se entrega?", traspaso al nieto)?
- ¿Tiene marcas de chat o scaffolding que sacar?
- ¿Cómo se relaciona con la decisión "A+C" (Carta + Credo)? ¿El Credo sigue pendiente o el 07 lo absorbió?
- ¿La sección "Cartografía" del 07 cierra el arco hacia las anteriores?

El delta es un insumo de Fase 1, no un trabajo nuevo. Si el delta concluye que el 07 está limpio, su polish es solo "sacar marcas de chat" y se procesa con los demás.

### 3.3 Tensiones cruzadas (§III del análisis)

Cuatro tensiones requieren intervención mínima coordinada entre ensayos. Se resuelven en pasadas dedicadas:

1. **Poder ficción (3) vs anti-captura (4):** una frase al arranque del 4 que renombra la captura como captura de permisos.
2. **"Sortition cannot be captured" (4) vs realismo:** un cambio de palabra en el 4.
3. **Voto necesario vs obstáculo (2):** una frase declarativa única en el 2.
4. **"No necesita salvador" vs "Welcome back" (4/5):** una palabra agregada en el cierre del 5.

Estas se hacen al pasar por cada ensayo, no como pasada propia.

### 3.4 Lo explícitamente fuera de Fase 1

- **El Credo** (opción C de §VI del análisis): pieza litúrgica paralela, fuera del libro. No se escribe en Fase 1. Se decide al final de Fase 1, después del delta del 07, si sigue pendiente o si se absorbió.
- **Reescrituras profundas:** el "considerar aliviar la sobre-enumeración" del 4 es la línea roja del análisis. No se cruza sin nuevo brainstorming.
- **Cambiar el orden de los ensayos** o **fusionar dos en uno:** descartado.

### 3.5 Entregable de Fase 1

- Siete archivos en raíz `/Ensayos/0X-*.md` con marcas de chat removidas y polishes aprobados aplicados.
- `Ensayos/00-ANALISIS-07.md` con la auditoría delta del 07.
- Cada ensayo cierra con `## Cartografía` actualizada y consistente (formato, no contenido — el contenido ya está bien).
- Una nota corta al final de `00-ANALISIS.md` listando qué decisiones abiertas se resolvieron y cómo (audit trail).

## 4. Fase 2 — Propagación al castellano rioplatense

**Objetivo:** que `/Ensayos/castellano/*.md` refleje exactamente las mismas decisiones del inglés cerrado, en voz rioplatense, sin abrir nuevos frentes editoriales.

### 4.1 Mecánica

Por ensayo, en orden 01 → 07:

1. Diff entre versión raíz cerrada y la castellano actual: ¿qué pasajes en inglés cambiaron desde la última traducción?
2. Traducir solo esos pasajes — no retraducir el ensayo entero.
3. Lectura final de continuidad: que el rioplatense no se rompa donde el cambio entró.

### 4.2 Reglas de traducción

- **Voz rioplatense:** "vos", "mirá", "pará", "te lo digo". El registro ya está fijado en las versiones existentes — replicar, no reinventar.
- **Términos cuidados:** "the grey man" → "el hombre gris" (siempre minúsculas dentro de prosa, mayúsculas solo cuando es título o sujeto enfático). Argentina = argentum = plata; nunca "acero". Ver memoria `feedback_hombre_gris_silver`.
- **¡BASTA!** siempre con signos de admiración. Ver memoria `feedback_basta_exclamation`.
- **Cartografía** se traduce en bloque la primera vez y después se mantiene paralela.

### 4.3 Out of scope para Fase 2

- Polish *adicional* en castellano que no haya pasado por inglés primero. Si surge una mejora "en idioma" durante la traducción, se anota como nota en el commit y se evalúa después; no se aplica de oficio para evitar divergencia.

### 4.4 Entregable de Fase 2

- Siete archivos en `/Ensayos/castellano/*.md` con todos los polishes propagados.
- Un commit por ensayo con el diff acotado.

## 5. Fase 3 — `/recursos/ensayos`

**Objetivo:** abrir una sección en `Recursos` posicionada como playground de pensamiento del Hombre Gris, con los siete ensayos como primera carga y arquitectura para sumar piezas en el futuro (sin tener que reescribir la página cada vez).

### 5.1 Posicionamiento

Cuarta tarjeta en `Resources.tsx`, paralela a Blog / Vlog / Rutas de Transformación.

- **Title:** "Ensayos"
- **Subtitle:** "PENSAMIENTO" (mismo registro mayúscula que las demás)
- **Description:** "Textos largos para pensar la república desde abajo. Un cuaderno abierto del Hombre Gris donde se ensayan ideas, se discuten arquitecturas y se busca la palabra justa." (~25 palabras, ajustable)
- **Icon:** `BookOpen` (ya importado en `Resources.tsx`) o `Feather` — definir en implementación.
- **Gradient:** distinto a los existentes (verificar paleta libre al implementar; las primeras dos son blue/cyan y purple/pink) — propuesto: `from-amber-500/10 to-rose-500/10` para evocar papel/tinta; ajustable.
- **CTA:** "Leer Ensayos"
- **count:** número total de ensayos (al lanzamiento: 7).

### 5.2 Rutas

```
/recursos/ensayos          → Ensayos.tsx        (índice)
/recursos/ensayos/:slug    → EnsayoDetail.tsx   (lector individual)
```

Slugs derivados del nombre de archivo sin prefijo numérico:

| Archivo | Slug |
|---|---|
| `01-presidencia.md` | `presidencia` |
| `02-democracia.md` | `democracia` |
| `03-poder.md` | `poder` |
| `04-arquitectura.md` | `arquitectura` |
| `05-soberania.md` | `soberania` |
| `06-belleza.md` | `belleza` |
| `07-carta.md` | `carta-al-nieto` |

(Slug del 07 es excepción porque "carta" es ambiguo. El resto sigue una palabra.)

### 5.3 Pipeline de contenido

Decisión: **build-time bundle**, no read-at-request.

Razón: los ensayos cambian con frecuencia editorial baja (commits humanos), no necesitan refresco en runtime, y leerlos como activos estáticos garantiza render rápido y SEO completo.

Mecánica:

1. Script `scripts/build-ensayos.ts` corre como parte de `npm run build` (y disponible standalone con `npm run ensayos:build`).
2. Script lee `/Ensayos/castellano/*.md`, parsea cada uno con `gray-matter` (frontmatter opcional) + `remark` o `marked` para HTML.
3. Genera `client/src/content/ensayos.generated.ts`:
   ```ts
   export const ensayos: Ensayo[] = [{ slug, title, subtitle, order, html, toc, cartografia, ... }, ...];
   ```
4. `Ensayos.tsx` y `EnsayoDetail.tsx` importan estáticamente este módulo (tree-shakeable, splitable por route).

**Nota técnica:** un ensayo de 30k chars genera ~25-50 kB de HTML. Siete ensayos → ~250-350 kB total. El detail se carga via `React.lazy()` (App.tsx ya usa este patrón); el índice solo necesita metadata, no `html`. Si bundle creciera al sumar contenido, particionar `ensayos.generated.ts` en módulos por slug es trivial.

### 5.4 Estructura de un ensayo en el índice

Para cada uno, el índice muestra:

- Número y título (ej. "01 — Por qué los presidentes son una idea estúpida")
- Subtítulo (ej. "Un ensayo sobre la arquitectura del poder")
- Tiempo de lectura estimado (~200 palabras/min)
- Una frase apertura (primer párrafo del cuerpo, truncado)
- Etiqueta de "tipo": "ensayo" para 01-06, "carta" para 07. Se generan automáticamente desde el frontmatter del .md. Cuando se sumen otros tipos en el futuro (credo, manifiesto, etc.), se agregan como tags.

Diseño visual: glassmorphism existente (`bg-white/5 backdrop-blur-md border-white/10`). Tipografía serif (Playfair Display) para títulos — distingue del resto de Recursos, refuerza el carácter "libro abierto". Layout: lista vertical, no grid (el formato lo pide).

### 5.5 Estructura de la página de detalle

Layout de tres columnas en desktop, una en mobile:

- **Sidebar izquierda** (sticky, desktop only): mini-TOC del ensayo actual generado desde `## ` headings.
- **Columna central**: prose. Tipografía serif, line-height generosa (1.7), max-width ~680px. Estilos derivados de `prose-invert` de Tailwind Typography pero sobreescritos para casar con el dark theme del sitio.
- **Sidebar derecha** (desktop only, sticky): la Cartografía del ensayo, parseada y enlazada — los nombres en cursiva del Cartografía se transforman en links a las páginas correspondientes (`/manifiesto`, `/la-vision`, `/el-mandato-vivo`, `/la-semilla-de-basta`, etc.) usando un mapa estático en código. En mobile, la Cartografía se renderiza como bloque al final del ensayo, no como sidebar.

Pie del ensayo:
- "Continúa en" (la última sección de cada Cartografía) → link al siguiente ensayo.
- "Volver al índice" → `/recursos/ensayos`.

### 5.6 Navegación inversa (plataforma → ensayos)

Sembrar referencias desde el sitio hacia los ensayos en lugares donde un usuario que llega a un concepto se beneficia de ir al ensayo correspondiente. Mínimo viable, no exhaustivo:

- `Manifiesto.tsx`: bloque al final con "El pensamiento detrás del manifiesto" → ensayos 01, 02, 03.
- `LaVision.tsx`: bloque "La arquitectura completa" → ensayo 04.
- `ElInstanteDelHombreGris.tsx`: bloque "Qué soberanía recuperás" → ensayo 05.
- `ElMandatoVivo.tsx`: bloque "Por qué el mandato es vivo" → ensayos 02, 04.
- `LaSemillaDeBasta.tsx`: bloque "Qué clase de movida" → ensayos 04, 05, 07.

Diseño del bloque inverso: una tarjeta glass compacta (no las cards grandes de Resources), con título del ensayo + frase apertura + "Leer ensayo →". Componente compartido `EnsayoLinkCard` para mantener consistencia.

### 5.7 SEO y prerender

`scripts/prerender-seo.ts` ya existe. Sumar las rutas `/recursos/ensayos` y `/recursos/ensayos/:slug` (las siete iniciales) al pre-render. Cada detalle expone:
- `<title>` con título del ensayo
- meta description = primer párrafo del ensayo, truncado a 160 chars
- og:image — sin imagen específica al lanzamiento, fallback al de marca general (decisión abierta: ¿generamos un OG por ensayo más adelante? Por defecto, no).

### 5.8 Out of scope para Fase 3

- Comentarios, anotaciones, highlights compartidos. La página es lectura.
- Login-gating. Los ensayos son públicos, sin barrera.
- Búsqueda full-text propia. La búsqueda de Recursos del sitio (si existe; verificar) cubre el caso.
- Audio / podcast. Hipotético futuro.
- Versión en inglés en el sitio. Solo castellano se publica. El inglés vive en raíz como fuente de polish.
- Edición desde el sitio.

### 5.9 Entregable de Fase 3

- Tarjeta nueva en `Resources.tsx`.
- Páginas `Ensayos.tsx` y `EnsayoDetail.tsx` con sus rutas en `App.tsx`.
- Script `scripts/build-ensayos.ts` y artefacto generado.
- Componente `EnsayoLinkCard` y siembra de cinco bloques inversos en las páginas listadas.
- Nuevas rutas pre-renderizadas en `scripts/prerender-seo.ts`.
- `npm run verify` pasa.

## 6. Decisiones abiertas que requieren confirmación del usuario

Se confirman antes de tocar prosa o código. Listadas en orden de impacto:

1. **Layer Five del 04** — ¿se resuelve con tres frases sustantivas o se saca como deuda explícita? Default propuesto: resolver con tres frases.
2. **§VIII del 06 (Politics of the Sublime)** — ¿se queda, se aliviana, o se mueve a un futuro Credo? Default: queda y se aliviana.
3. **§IV del 03 (Why the Fiction Persists)** — ¿se colapsan las cuatro razones a tres eliminando la academia? Default: se deja en cuatro.
4. **El Credo** — ¿sigue pendiente como pieza separada después del 07, o se da por absorbido? Decisión postergada hasta tener el delta del 07 (Fase 1.2).
5. **Las cuatro deudas del 04** — ¿se cosen en el polish del 04 (uno o dos párrafos cada una) o se dejan como están dado que el 07 ya cierra el arco? Default: se cosen las que el 07 no toca.
6. **"forty-three years"** — ¿se generaliza en algunas apariciones o se deja literal en todas? Default: literal en una aparición ancla, generalizar en el resto.
7. **Slug del 07** — `carta-al-nieto` vs `carta`. Default: `carta-al-nieto` por especificidad.
8. **Gradiente y icon** de la tarjeta Ensayos en Resources. Default propuesto: `amber/rose`, `BookOpen`.

## 7. Sequencing y commits

Un commit por unidad lógica. No hay mega-commits. Orden:

```
Fase 1 (inglés)
  feat(ensayos): add 00-ANALISIS-07 delta audit for Carta al Nieto
  fix(ensayos): polish 01-presidencia per analysis (chat marks, mirror, repetition)
  fix(ensayos): polish 02-democracia per analysis (...)
  ...
  fix(ensayos): polish 07-carta per delta audit
  docs(ensayos): record decisions taken in 00-ANALISIS audit trail

Fase 2 (castellano)
  fix(ensayos/castellano): propagate 01-presidencia changes to rioplatense
  ...
  fix(ensayos/castellano): propagate 07-carta changes to rioplatense

Fase 3 (plataforma)
  feat(ensayos): add build-ensayos pipeline
  feat(ensayos): add /recursos/ensayos index page + Resources card
  feat(ensayos): add /recursos/ensayos/:slug detail page
  feat(ensayos): seed inverse links from platform pages to essays
  feat(ensayos): prerender new routes for SEO
```

## 8. Criterios de éxito

- **Fase 1:** los siete ensayos en raíz no contienen marcas de chat ni `[Inference]/[Speculation]/[Unverified]`. Cada decisión abierta de §6 está resuelta con un commit y una nota en `00-ANALISIS.md`.
- **Fase 2:** `diff --stat` entre raíz y castellano por ensayo solo refleja diferencia de idioma — ningún pasaje del castellano contradice al inglés. Voz rioplatense intacta (lectura humana).
- **Fase 3:** `/recursos/ensayos` lista los siete y `/recursos/ensayos/:slug` los renderiza con TOC + Cartografía enlazada. Las cinco páginas con bloque inverso enlazan correctamente. `npm run verify` pasa. Lighthouse ≥ 90 en `/recursos/ensayos/presidencia` (smoke test).

## 9. Lo que no es este spec

- Una decisión sobre escribir un octavo ensayo, un Credo, o nuevas piezas. Esas son decisiones futuras, fuera de alcance.
- Una migración de los ensayos a una base de datos.
- Un cambio en `Ensayos 1` (el archivo crudo). Permanece como fuente histórica congelada.
- Un compromiso con publicar la versión en inglés en el sitio.

---

*Fin del spec. Próximo paso: el usuario revisa, confirma o pide cambios en los defaults de §6, y se invoca `superpowers:writing-plans` para producir el plan de implementación numerado.*
