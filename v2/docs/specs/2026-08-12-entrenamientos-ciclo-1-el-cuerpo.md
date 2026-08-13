# Entrenamientos, Ciclo 1 — El cuerpo de las lecciones

**Fecha:** 2026-08-12
**Alcance:** `v2/content/courses/` — los 31 `course.json`, los 31 `quiz.json` (sólo
metadata muerta) y los 329 cuerpos `.mdx`.
**Antecedente:** `docs/specs/2026-07-24-entrenamientos-papel-y-tinta.md` (spec 3.5)
construyó las cuatro superficies y dejó el contenido como estaba: «los SVG traen
colores v1 → **deuda del autor, no se toca**». Este ciclo levanta esa mano.
**Sistema:** `docs/design-system/README.md` v1.1 · directiva «cero datos inventados».
**Continúa en:** Ciclo 2 (los puentes), Ciclo 3 (la práctica), Ciclo 4 (las rutas).

> **Tesis.** El catálogo anuncia 53 horas de entrenamiento. El texto que alguien
> escribió de verdad se lee en 14. La diferencia no es una exageración de marketing:
> son **109.120 palabras generadas a máquina** —el 37% del corpus— repetidas casi
> textualmente en 320 de las 329 lecciones. Este ciclo borra eso, dice la verdad sobre
> cuánto dura cada lección, y pone en su lugar un cierre que **no se puede rellenar**:
> un validador compara los 320 cierres entre sí y rompe el build si dos se parecen.

---

## 1. Lo que hay: inventario medido el 2026-08-12

Recorriendo los 31 directorios y las 329 lecciones:

| Hecho | Valor | Consecuencia |
|---|---|---|
| Lecciones con cola generada | **320 de 329**, en **tres generaciones** distintas | Se borra con huella de texto, no con encabezado suelto |
| Palabras de cola | **109.120 — 37% del corpus** | El corpus real es 183.987 palabras, no 293.107 |
| Duración declarada | **3.163 min = 53 h** (suma de `duration`) | Contra **14 h** reales a 220 pal/min: inflada 3,8× |
| Lecciones que declaran exactamente 9 minutos | **185**, con mediana de 357 palabras propias = 1,6 min | El minutaje no está mal calculado: nunca se calculó |
| Lecciones bajo 350 palabras propias | **117** (17 de ellas bajo 250) | El piso mínimo hay que definirlo y hacerlo cumplir |
| Lecciones bajo 600 palabras propias | **222 (67%)** | Dos tercios del catálogo son notas, no lecciones |
| Lecciones con sección propia de ejercicio, caso o aplicación | **90** | No se les impone plantilla: sólo se les agrega el puente |
| Tuteo verbal/imperativo | **775 apariciones en 151 lecciones**; 90 mezclan tú y vos en el mismo cuerpo | Viola la regla de rioplatense del CLAUDE.md |
| Encabezados bajo `###` | **481** `h4` + **226** `h5` + **305** `h6` | Estructura de esquema generado, no de prosa |
| `summary` repetido verbatim en el cuerpo | 315 de 329 (verificado en 3.5) | El lector ya no lo muestra; el cuerpo tampoco debería |
| Menciones a un PLAN | **0** en las 329 | El corpus más grande no toca el corpus doctrinal (Ciclo 2) |
| Links (internos o externos) | **0**, salvo 2 SVG | Nada es verificable ni navegable |
| Lecciones que nombran ley, artículo o INDEC | **10 de 329** | Afirmaciones sin fuente en todo el resto |
| `contentFile` en `course.json` | **329 de 329 apuntan a una ruta que no existe** en v2 | Campo requerido por Zod que nunca resuelve |
| `thumbnailUrl` / `ogImageUrl` | los 31 a `images.unsplash.com` | No se usan y la CSP los prohíbe |
| `passingScore` / `timeLimit` / `maxAttempts` | existen en los 31 `quiz.json`, **cero lectores** | «Acá no se toma examen» (3.5, Decisión 6) |
| Velocidad de lectura del proyecto | `words / 220`, **copiada en dos migradores** | Se extrae a `@v2/shared` y la usan los tres |

### Las tres generaciones de la cola

| Generación | Encabezados | Lecciones | Palabras | Huella |
|---|---|---|---|---|
| A | `### Aplicación práctica` · `### Cómo se ve en el territorio` · `### Errores comunes` · `### Ejercicio guiado` · `### Idea fuerza` | 205 | ~84.600 | «Para que esta idea no quede en el plano conceptual» |
| B | `## Aplicación práctica` · `## Ejercicio guiado` · `## Idea fuerza` | 108 | ~24.100 | «Cobra valor cuando lo conviertes en una decisión observable» |
| C | `### Aplicación argentina` · `### Errores comunes` · `### Ejercicio de aplicación` · `### Cierre` | 7 | 3.096 | «La utilidad real del contenido aparece cuando lo llevas a decisiones concretas en Argentina» |

Las tres rellenan una sola variable con el ámbito del curso («tu municipio, tu
provincia» / «tu hogar, tus ingresos») y pegan el `summary` al principio. Las tres
están escritas en tuteo neutro: la cola es la fuente de la mitad de las 775
apariciones.

**La generación C apareció durante la implementación, no en este inventario**, y
vale anotar cómo: la encontró la revisión de la Tarea 2 al preguntarse por qué 10
lecciones quedaban sin clasificar. Vive sólo en `teoria-juegos-argentina-hombre-gris`
—7 de sus 10 lecciones— y sus tres encabezados propios no aparecen en ninguna otra
lección del corpus. Su sección `Cierre` tiene siete copias y **una sola versión
distinta**. En cuatro de esas siete lecciones, C y A están apiladas: 618 palabras
de relleno seguidas.

La lección de método: **el inventario de un corpus generado se mide dos veces, y la
segunda es la que encuentra la generación que no sabías que existía.** De ahí que el
detector pruebe todos los encabezados candidatos en vez de quedarse con el primero.

### El riesgo del borrado, medido

Hay **168 encabezados escritos por el autor** con nombres parecidos a los de la cola
—`Ejercicio: Mapear Bucles`, `Errores Comunes en el Diseño`, `Aplicación: Diseñar tu
Vida Ideal`— y **algunas de esas secciones son lo mejor que tiene el corpus**. Un
borrado por encabezado aproximado se las come. De ahí la Decisión 2.

Contados por lección y con criterio estricto (ejercicio, caso práctico o aplicación
propia, no cualquier parecido de nombre), son **90 lecciones**. Ese es el número que
manda en la Decisión 5: son las que ya cierran solas.

---

## 2. Qué NO hace este ciclo

| Fuera | Dónde va |
|---|---|
| Llenar `planes:` / `ensayos:` y pintar los enlaces | Ciclo 2 |
| Formato nuevo de práctica, práctica al pie de cada lección | Ciclo 3 |
| Normalizar las 8 categorías bilingües, itinerarios con nombre | Ciclo 4 |
| Backend, progreso, certificados | Fase 5 del master plan (3.5 lo dejó dictaminado) |

Este ciclo **sí** declara los campos que el Ciclo 2 va a consumir, para editar los 329
frontmatters una sola vez.

---

## 3. Decisiones

### Decisión 1 — La cola se borra, no se reescribe

109.120 palabras. Reescribirlas sería producir 320 variantes de un texto que no dice
nada. Lo que las reemplaza (Decisión 6) es más corto y más caro de escribir, y eso es
exactamente el punto.

### Decisión 2 — El corte se ancla en tres condiciones simultáneas

1. **Encabezado exacto, solo en la línea** — uno de los ocho títulos de las tres
   generaciones, sin palabras extra. Descarta las 168 secciones del autor.
2. **Huella en la cola candidata** — uno de los arranques verbatim de A, B o C, en
   **cualquiera** de sus secciones. Si el encabezado coincide pero en toda la cola no
   hay huella, **no se toca**.
3. **Cola cerrada** — desde el encabezado candidato hasta el final del archivo, todo
   encabezado pertenece a la lista. Si aparece cualquier otra cosa, ese candidato
   queda descartado.

Y **se prueban todos los candidatos, de arriba hacia abajo**, no sólo el primero.

Las anclas 2 y 3 se ampliaron después de escribir esta spec, con lo que encontró la
revisión de la implementación, y cada corrección tenía un caso real detrás:

| Lo que decía | Lo que fallaba | Corregido |
|---|---|---|
| Huella en el párrafo siguiente al encabezado | En 3 lecciones a ese párrafo se le corrió una palabra («dos o tres frases propias»), y la huella textual estaba dos secciones más abajo | Huella en cualquier parte de la cola candidata |
| El primer encabezado de cola es el arranque | En 7 lecciones de `teoria-juegos` hay un `Errores comunes` de la generación C **antes** de la cola de la A, y la cola real nunca se evaluaba | Se prueban todos los candidatos; gana el primero que pase las anclas 2 y 3 |

**La seguridad no se movió**: la que protege el texto del autor es el ancla 3, y las
dos correcciones la dejan intacta. Con las tres anclas corregidas, el corpus mide
**320 `cola-limpia`, 9 sin cola, y cero para revisión manual** — el mismo 320 que
este inventario contó por otro camino.

Igual el script deja el conteo de palabras borradas por lección y la lista de lo que
no pudo cortar solo: el borrado se audita, no se cree.

### Decisión 3 — Un solo minutaje, calculado, en `course.json`

Hoy el número vive dos veces: `estimatedMinutes` en el frontmatter del MDX y
`duration` en `course.json` (por lección y por curso). El registry lee el de
`course.json`, porque el catálogo es *eager* y los cuerpos perezosos. Duplicar un
número calculado es pedir que se desincronicen.

- **`estimatedMinutes` se borra de los 329 frontmatters.** El cuerpo no necesita saber
  cuánto mide: es derivable.
- El minutaje se calcula con la función del proyecto —`Math.max(1, Math.ceil(words /
  220))`— **extraída de los dos migradores a `@v2/shared`** y usada por los tres.
- Se cuenta el **texto propio renderizable**: sin frontmatter, sin bloques `<svg>`,
  sin `<pre>`, y **con** el cierre nuevo.
- `duration` de curso = suma de sus lecciones. La guardia recalcula las tres cifras y
  rompe el build si no coinciden.

**Lo que cambia en pantalla:** el catálogo pasa de anunciar 53 h a anunciar **14 h** el
día del borrado, y **~19 h** cuando el ciclo termine (§5). Es la corrección de un dato
inventado, no una pérdida. Los minutos se siguen mostrando **porque ahora son verdad**.

### Decisión 4 — Un solo piso: 600 palabras propias, incluido el cierre

Barajé dos umbrales (350 que rompe, 600 que avisa) y la aritmética los volvió
innecesarios: **con el cierre escrito, sólo 4 lecciones siguen bajo 350 palabras** —
faltan 304 palabras en total. Un piso de 350 no vigila nada.

Queda **un piso duro de 600 palabras propias, contando el cierre**. Hoy lo violan 222
lecciones; después de los cierres siguen bajo el piso **189**, y llevarlas ahí cuesta
**23.482 palabras** (§5). Es un costo real y es el que separa una nota de una lección.

El piso entra en vigor **curso por curso**, no de golpe: un curso está terminado
cuando **ninguna de sus lecciones tiene `cierre: pendiente`**, y desde ese commit el
piso se le exige a ese curso. Encenderlo el día uno para 222 lecciones bloquearía el
repo.

### Decisión 5 — `cierre:` es un campo con tres valores

```yaml
cierre: pendiente | puente | completo
```

- `pendiente` — estado inicial. No se le exige nada; la página no muestra cierre.
- `puente` — el cuerpo **ya tenía** su caso o su ejercicio escrito por el autor.
  **90 lecciones.** Se le agrega sólo *El puente*.
- `completo` — las tres piezas escritas. **239 lecciones.**

Esto convierte una deuda invisible en algo que el build cuenta, permite trabajar en 31
tandas sin perder el hilo, y —clave— **evita imponerle una plantilla a las 90 lecciones
que ya cierran bien solas**. La meta del ciclo es cero `pendiente`.

### Decisión 6 — La plantilla del cierre: tres piezas, con evidencia exigible

Encabezados fijos, texto irrepetible:

```markdown
### El caso
Un hecho argentino verificable — un número, una norma, un organismo, una fecha —
que muestre la idea de la lección funcionando o fallando en la realidad.
60 a 160 palabras. Exige al menos una entrada en `fuentes:`.

### La palanca
Qué hace el que leyó esto, en los próximos siete días. Con el organismo, el trámite,
la persona o el lugar nombrado. 40 a 120 palabras, y una línea final que arranca con
un imperativo en voseo.

### El puente
A qué PLAN, ensayo, capítulo de la crónica o capa del mapa se conecta esto, y por qué.
Una a tres líneas. Obligatorio en las 329.
```

**Qué valida el build, y qué no.** Lo verificable se verifica; lo que no, se deja
escrito y se revisa a ojo. No se inventan validaciones semánticas.

| Regla | Cómo se valida |
|---|---|
| Cada pieza respeta su rango (60–160 · 40–120 · ≤ 3 líneas) | Duro — conteo |
| *El puente* nombra un slug que existe | Duro — contra el registry |
| *El caso* trae fuente | Duro — `fuentes:` no vacío con `url` + `consultada` |
| *El caso* nombra un dato o una norma | Duro — dígito con contexto, o nombre de una lista de organismos/normas |
| *La palanca* cierra con imperativo en voseo | Duro — la última línea arranca con una forma de la lista |
| Ninguna pieza repite el `summary` | Duro — similitud de trigramas > 0,7 rompe |
| **Ningún cierre se parece a otro cierre** | **Duro — Jaccard de trigramas > 0,55 contra los otros 319 rompe, nombrando las dos lecciones** |
| Que el caso sea *cierto* | No validable. Lo garantiza la fuente y la revisión |

La última regla es el corazón del diseño: **es la guardia que habría hecho imposible la
cola de v1.** Un cierre plantillado colisiona con su gemelo y rompe el build.

Objeción previsible: tres encabezados fijos en 320 lecciones son, en sí, una
plantilla. Sí — la *estructura* es un contrato, y eso está bien; lo que estaba mal era
el *texto* idéntico. La guardia anti-clon vigila exactamente esa diferencia.

### Decisión 7 — El voseo se corrige con dos listas, no con una

- **Lista dura** (rompe el build): formas verbales sin ambigüedad —`tienes`, `puedes`,
  `debes`, `quieres`, `sabes`, `haces`, `necesitas`, `sientes`, `entiendes`, `eres`—
  y sus imperativos inequívocos. Reemplazo mecánico verificado, uno a uno.
- **Lista blanda** (reporte, revisión humana): las que dependen del contexto. `define`
  (127 apariciones) es imperativo en «Define una acción» e indicativo en «el sistema
  define el resultado»; `elige` (133) y `resume` (87), lo mismo. Un reemplazo ciego acá
  rompe prosa correcta.
- **El posesivo `tu` no se toca**: es idéntico en voseo. (Mi primera medición lo contó
  como tuteo e infló el número — de ahí las dos listas.)

### Decisión 8 — Poda estructural

| Qué | Cuánto | Regla nueva |
|---|---|---|
| Encabezados `h4`–`h6` | 1.012 | El cuerpo usa `##` y `###`. Nada más. Guardia |
| `summary` verbatim al inicio del cuerpo | hasta 315 | Se borra. La primera prosa no puede ser ~igual al `summary` |
| Encabezado idéntico al `title` | 10 con `#` + los que abren con `##` repetido | Se borra. El lector ya imprime el título |
| `<table>` HTML crudo | 18 lecciones | A tabla markdown; el lector ya tiene estilos §5 |
| `<svg>` con colores de v1 | 13 lecciones | A los tokens del sistema |
| Imagen `/course-graphics/…` | 2 lecciones | Verificar que el asset se portó a `apps/web/public/` en 3.5; si no, portarlo |
| Emojis | 11 lecciones | Se sacan. **Esto revierte 3.5**, que los dejó por respeto al documento del autor: ahora el documento se está editando de todos modos |

### Decisión 9 — Se limpia la fuente de todo campo sin lector

Verificado con grep sobre `apps`, `packages` y `scripts` (sin `dist`): ningún código de
v2 lee `thumbnailUrl`, `ogImageUrl`, `indexable`, `lastReviewedAt`, `searchSummary`,
`timeLimit` ni `maxAttempts`. Zod ya los descarta — pero siguen en la fuente, y en la
fuente **mienten**: 31 URLs de Unsplash que la CSP prohíbe, y un `passingScore` en una
práctica donde por diseño no hay nota.

Se borran de los JSON: `seoTitle`, `seoDescription`, `searchSummary`, `ogImageUrl`,
`thumbnailUrl`, `indexable`, `authorId`, `legacyCourseId`, `legacyLessonId`,
`legacyQuizId`, `rekeys`, `videoUrl: null`, `documentUrl: null`, `passingScore`,
`timeLimit`, `maxAttempts`. Antes de borrar cada uno, el grep se repite y se registra
en el commit: **ningún borrado por memoria**.

**`contentFile` es el caso especial.** Los 329 apuntan a `lessons/NN-NN-….md`, rutas
del árbol de v1 que en v2 no existen; el registry nunca las usa (deriva el slug de
`key`). Sus únicos lectores son `migrate-courses-v1-to-v2.ts` y
`verify-courses-migration.ts`, que las resuelven contra el árbol de v1. La migración
terminó el 2026-05-13 y está commiteada. **Ruling:** se retiran los dos scripts de
migración de cursos, se borra `contentFile` del JSON y del schema, y el commit que los
retira nombra el commit de la migración que los vuelve innecesarios. Un campo
requerido por Zod que no resuelve en el 100% de los casos es exactamente el dato
inventado que el proyecto prohíbe.

### Decisión 10 — Cada curso declara qué promete y qué no

En `course.json`, dos campos nuevos:

```json
"promesa": ["Leer un presupuesto municipal y decir dónde está el dinero",
            "Presentar un pedido de acceso a la información pública"],
"noCubre": ["Asesoramiento legal", "Litigar"]
```

Tres a cinco verbos observables, dos o tres exclusiones. Validable: no puede repetir
`description` ni coincidir con la promesa de otro curso. 31 archivos. Es lo que separa
un entrenamiento de una lista de lecturas — y la exclusión explícita es la única
defensa honesta contra la expectativa inflada.

### Decisión 11 — Fuentes con fecha, y vencimiento que avisa sin romper

```yaml
fuentes:
  - url: https://www.argentina.gob.ar/…
    titulo: Monotributo — categorías vigentes
    consultada: 2026-08-12
revisarAntesDe: 2027-02-01   # opcional; para trámites, categorías, escalas
```

`revisarAntesDe` vencido **no rompe el build**: avisa. Romper el build por el paso del
tiempo castiga a quien pasaba por ahí. El aviso sale en el reporte y se anota en
`docs/DEUDAS.md` — el patrón que el repo ya usa para los pisos de los PLANes.

Esto importa de verdad: la lección de monotributo explica las categorías A–K sin un
número, sin una fecha y sin un link a AFIP. En Argentina eso envejece en meses.

### Decisión 12 — Todo lo mecánico va primero, y va con reporte

El orden no es estético. Las tareas mecánicas (borrado, minutaje, voseo, poda,
limpieza) son verificables por máquina y se pueden auditar en un commit; la escritura
es lenta y se hace en 31 tandas. Si el ciclo se abandona a mitad de camino, el campo
`cierre:` deja el estado **visible y honesto**, no roto.

---

## 4. Las guardias nuevas

Un script `entrenamientos:check` (invocado desde `verify`, junto a `planes:check`), con
las funciones puras en `@v2/shared` y sus tests en `packages/shared/tests/`:

1. Cero cola generada (las dos huellas).
2. El minutaje de `course.json` coincide con el recalculado — lección y curso.
3. Cero formas de la lista dura de tuteo.
4. Profundidad de encabezados ≤ `###`.
5. La primera prosa no repite el `summary`; ningún encabezado repite el `title`.
6. Cierre presente y completo según `cierre:`; `pendiente` sólo mientras el curso no
   esté terminado.
7. Los slugs de `planes:` / `ensayos:` existen en el registry (vacío es válido en este
   ciclo).
8. `fuentes:` presente cuando *El caso* nombra un dato o una norma.
9. Piso de 600 palabras propias —cierre incluido— en los cursos ya terminados; en los
   que faltan, reporte con la deuda de palabras por lección.
10. **Anti-clon entre los cierres** (Jaccard de trigramas > 0,55).
11. Cero emojis, cero `<table>` HTML, cero `estimatedMinutes`, cero campos de la
    Decisión 9.
12. `promesa` y `noCubre` presentes y no clonados en los 31 cursos.

Funciones puras con test propio: la huella de la cola, el minutaje, la similitud de
trigramas, el detector de tuteo (duro y blando), y la extracción de texto renderizable.

---

## 5. Cuánta escritura es esto

| Trabajo | Palabras nuevas |
|---|---|
| Cierres: 239 `completo` × 160 + 90 `puente` × 40 | 41.840 |
| Engorde de las 189 lecciones que siguen bajo 600 después del cierre | 23.482 |
| `promesa` / `noCubre` en 31 cursos | ~2.500 |
| **Total** | **~67.800** |

Contra las 183.987 palabras propias de hoy: es un **37% más de contenido real**, escrito
a mano y con fuente. El corpus propio termina en **251.809 palabras — 19,1 h de lectura
honesta**, y ése es el número que va a mostrar el catálogo.

Hay que decirlo antes de empezar y no después: son casi 68.000 palabras. Por eso las 31
tandas, un commit por curso, y el campo `cierre:` como libro mayor.

---

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| El borrado se come contenido del autor | Tres anclas simultáneas + reporte revisado y commiteado antes de borrar |
| El reemplazo de voseo rompe prosa correcta | Dos listas; la blanda no se toca sin revisión humana |
| La duración baja de 53 h a ~16 h y parece que el sitio perdió contenido | No perdió: nunca las tuvo. El número anterior era el inventado |
| El ciclo se abandona a mitad | `cierre: pendiente` deja el estado visible; la página no muestra cierre y no miente |
| Otra sesión toca los mismos archivos | Commits con rutas explícitas (D-010) |

---

## 7. Orden de trabajo

1. Detector + reporte, sin borrar nada. Se commitea el reporte.
2. Borrado de la cola en las que cumplen las tres anclas + revisión manual del resto.
3. Minutaje: `220` a `@v2/shared`, recálculo, `estimatedMinutes` fuera, guardia.
4. Voseo: lista dura aplicada, lista blanda reportada.
5. Poda estructural (Decisión 8).
6. Limpieza de la fuente + retiro de los dos scripts de migración (Decisión 9).
7. Plantilla + validador anti-clon + tests, probados en **un curso piloto** escrito a
   mano de punta a punta (el más chico: `accion-comunitaria`, 8 lecciones).
8. – 38. Los 30 cursos restantes, un commit por curso: cierres, engorde de las flacas
   de ese curso, `promesa` / `noCubre`, y el piso duro encendido para ese curso.
39. Cero `pendiente`. La guardia pasa a exigirlo.

---

## 8. Qué se anota en `docs/DEUDAS.md` ahora

Los defectos de este inventario están hoy en producción y el registro se publica
entero. Se anotan al abrir el ciclo, no al cerrarlo: la duración inflada, el 37% de
relleno, el tuteo, `contentFile` que no resuelve, los campos sin lector, y las 0
menciones a un PLAN (esta última apunta al Ciclo 2).
