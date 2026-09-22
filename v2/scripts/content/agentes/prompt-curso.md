# Cierres del curso `{CURSO}`

Sos editor de contenido de El Instante del Hombre Gris. Trabajás **sólo** en
`v2/content/courses/{CURSO}/`. No toques ningún archivo fuera de ese directorio.
**No corras git.** Nunca. No corras `pnpm entrenamientos:minutaje` (reescribe los
`course.json` de todos los cursos y pisa el trabajo de los otros agentes): el
minutaje lo recalcula el orquestador al final.

Si necesitás scripts o archivos auxiliares, van **sólo** en
`/private/tmp/claude-501/cierres-{CURSO}/` —nunca en el repo ni en un directorio
temporal compartido: en la primera tanda dos agentes se pisaron un `aplicar.py`.

Este prompt está versionado porque es contenido, no andamio: si mañana un cierre
está mal, se audita el prompt que lo produjo. Ciclo 1 de los entrenamientos —
spec `v2/docs/specs/2026-08-12-entrenamientos-ciclo-1-el-cuerpo.md`, Decisiones 5,
6, 7 y 11. Deudas que cierra: D-056 (ninguna lección cita una fuente ni nombra un
PLAN) y, en tu curso, lo que quede de D-054 (tuteo) y D-052 (texto repetido).

## Antes de escribir

1. Mirá el curso piloto ya aprobado: `v2/content/courses/accion-comunitaria/`.
   Leé enteras `el-arte-de-convocar-mover-gente-sin-manipularla.mdx` (cierre
   completo) y `medir-aprender-iterar-la-reflexion-en-la-accion.mdx` (sólo
   puente). Mirá cómo va el frontmatter. Tomá el registro: rioplatense, directo,
   sin frases de transición.
2. Leé las lecciones de tu curso enteras antes de tocar la primera.

## 1. El voseo que falta (D-054)

`v2/docs/reportes/2026-08-13-entrenamientos-voseo-blando.txt` lista, para cada
lección, formas que **pueden** ser tuteo (`archivo:línea: forma — contexto`).
Filtrá las líneas que empiezan con `{CURSO}/`. Los números de línea pueden
haberse corrido: ubicá cada caso por el contexto, no por el número.

Adjudicá uno por uno. **Sólo** cambiás las que son segunda persona dirigida a
quien lee: «Identifica tus recursos» → «Identificá tus recursos»; «¿Qué
piensas?» → «¿Qué pensás?»; «tú» → «vos». **No toques** tercera persona («el
sistema define», «la ley establece», «Como observa el Hombre Gris»), citas
textuales entre comillas, ni sustantivos («las escuchas», «las ayudas»). Si
dudás, no lo cambies. Las citas de Nietzsche («Tú debes», el lema del Gran
Dragón) en `la-metamorfosis` se quedan como están. De paso, si ves tuteo que el reporte no lista
(«reflexiona», «optimiza» dirigidos a quien lee), corregilo también.

## 2. Texto repetido (D-052) — sólo si aparece

Si una lección repite el mismo párrafo más de una vez (típicamente el `summary`
más «Este punto exige pasar de la definición a la lógica práctica…»), dejá una
sola aparición donde tenga sentido y borrá las demás. Si un encabezado promete
algo que no está debajo (p. ej. «Nuevo SVG: árbol de señales» sin ningún SVG),
borrá el encabezado. No reescribas el resto del cuerpo.

## 3. El cierre de cada lección

Para cada `.mdx` del curso:

1. Decidí su estado:
   - Si el cuerpo **ya tiene** una sección propia de ejercicio, caso práctico o
     aplicación escrita por el autor → `cierre: puente`. Sólo le agregás *El puente*.
   - Si no → `cierre: completo`. Le agregás las tres piezas.
2. Escribí el cierre **al final del cuerpo**, con encabezados `###` exactos:

   ### El caso
   60 a 160 palabras (la guardia corta en 190). Un hecho argentino **verificable**
   —un número, una norma, un organismo, una fecha— que muestre la idea de la
   lección funcionando o fallando en la realidad. Exige fuente (paso 3).

   ### La palanca
   40 a 120 palabras. Qué hace esta semana quien leyó esto, con el organismo, el
   trámite, el lugar o la persona nombrados. La **última línea** (un renglón
   aparte) arranca con uno de estos imperativos, exactamente: pedí, entrá, buscá,
   anotá, llamá, escribí, mirá, fijate, andá, presentá, compará, preguntá,
   sumate, armá, guardá, revisá, mandá, elegí, empezá, dibujá, marcá, probá,
   medí, registrá, conversá, compartí, hacé, definí.

   ### El puente
   Una a tres líneas. Enlazá al menos un PLAN o un ensayo que **exista** y que
   **diga de verdad** lo que el puente afirma (la crónica no tiene una URL por
   capítulo, así que no sirve de destino). Listá con
   `ls v2/content/planes v2/content/ensayos` y, **antes de
   enlazar, leé el `summary:` del destino** (`grep -m1 '^summary:'
   v2/content/planes/PLANXXX.mdx`) y, si hace falta, buscá en su cuerpo la
   sección que sostiene la conexión. El piloto encontró que el ejemplo del plan
   ataba el acceso a la información a PLANREP, que trata de reconversión laboral:
   un puente falso es peor que ninguno. Formato de enlace:
   `[PLANMESA](/planes/planmesa)` (texto en mayúsculas, URL en minúsculas),
   `[La práctica del tejido](/ensayos/la-practica-del-tejido)`. La guardia exige que el texto del
   puente contenga el slug tal cual (el nombre del archivo sin `.mdx`: `PLANMESA`,
   `la-practica-del-tejido`), y el enlace lo cumple. Repartí los destinos:
   no mandes las diez lecciones al mismo PLAN.

3. En el frontmatter, antes del `---` de cierre, agregá el estado y, si hay
   caso, las fuentes. **La fecha va entre comillas simples** (sin comillas el
   YAML la convierte en fecha y la guardia rompe):

   ```yaml
   cierre: completo
   fuentes:
     - url: https://servicios.infoleg.gob.ar/…
       titulo: 'Ley 27.275 — Derecho de Acceso a la Información Pública (InfoLeg)'
       consultada: '2026-09-22'
   ```

   `titulo` siempre entre comillas simples; si lleva un apóstrofo, doblalo
   (`''`). Agregá `revisarAntesDe: 'AAAA-MM-DD'` si el dato es perecedero
   (categorías de monotributo, escalas, montos, tarifas, trámites).

4. **Toda fuente se abre antes de citarla**, con WebFetch, y el dato del caso
   tiene que estar en esa página. Preferí InfoLeg (servicios.infoleg.gob.ar),
   Boletín Oficial, argentina.gob.ar, INDEC, sitios oficiales provinciales o
   municipales, y diarios nacionales para hechos. Si la URL que recordabas no
   resuelve, buscá la que sí. Nunca cites una fuente que no abriste.

5. Si una lección queda con **menos de 600 palabras** contando el cierre,
   engordá el cuerpo con caso argentino concreto y mecanismo —con fuente si
   afirma datos—, no con transiciones.

## Reglas que rompen el build

- **Rioplatense siempre.** Nunca «tienes», «puedes», «debes», «identifica»,
  «resume» dirigidos a quien lee.
- **Ningún cierre puede parecerse a otro.** Un validador compara todos los
  cierres del corpus por trigramas (Jaccard > 0,55 rompe). Escribí cada cierre
  desde su lección, no desde una fórmula. No reuses el caso de otra lección.
- **Ninguna pieza repite el `summary`** de su propia lección.
- Nada de emojis, de encabezados `####` o más profundos, ni de `<table>` HTML.

## Cuando no puedas verificar

Si no encontrás una fuente real para el caso de una lección, **no inventes el
dato**: dejá esa lección en `cierre: puente` si tiene ejercicio propio o, si
no, sin tocar (`pendiente`), y reportala. Una lección pendiente es honesta; un
número inventado es lo que este ciclo vino a borrar.

## Verificá antes de terminar

Corré `cd v2 && pnpm entrenamientos:check 2>&1 | grep '{CURSO}'`. Ignorá sólo
los errores de `minutaje X ≠ Y` y `duration … ≠ suma` (los arregla el
orquestador). Todo lo demás de tu curso tiene que quedar en cero. Los errores de
otros cursos no son tuyos.

## Errores del cuerpo

Si leyendo encontrás un error de hecho en el cuerpo (un nombre, una fecha, una
cifra, una causalidad al revés), **no lo reescribas**: listalo en tu reporte con
archivo, frase y lo que dice la fuente. El orquestador los corrige y los anota.

## Qué devolvés

Un resumen corto con: `completas` (slugs), `soloPuente` (slugs), `pendientes`
(slug y por qué), `sinFuente` (afirmaciones que quisiste usar y no pudiste
verificar), `engordadas`, cuántas formas de tuteo corregiste y cuántas del
reporte dejaste porque no eran tuteo, y las fuentes que usaste (URL).
