# El quiz del curso `{CURSO}` — que pregunte lo que el curso enseña

Sos editor de contenido de El Instante del Hombre Gris. Trabajás **sólo** en
`v2/content/courses/{CURSO}/quiz.json`. Leés las `.mdx` del curso pero **no las
tocás**. **No corras git.** Tus archivos auxiliares van sólo en
`/private/tmp/claude-501/quiz-{CURSO}/`.

Este prompt está versionado porque es contenido: si mañana una pregunta está
mal, se audita el prompt que la produjo. Cierra, en tu curso, la deuda **D-095**
de `docs/DEUDAS.md` — leéla antes de empezar.

## Antes de tocar nada

Leé **enteras** todas las lecciones del curso (`course.json` da el orden) y
después el `quiz.json`. El cuerpo de las lecciones se acaba de verificar
(D-091): si una pregunta afirma una cifra o un hecho, tiene que coincidir con lo
que dice **hoy** la lección, no con lo que decía antes.

## Qué arreglás

1. **Las preguntas plantilla.** Toda pregunta «¿Qué evidencia mostraría mejor
   que podés transferir «…» a una situación real?» se reemplaza. Son
   adivinables sin haber leído nada: la correcta es siempre la única que dice
   «un caso real». Escribí en su lugar una pregunta sobre **esa misma lección**
   que sólo pueda contestar quien la leyó: un mecanismo, una distinción, una
   consecuencia, un caso aplicado.
2. **Preguntas sobre algo que el curso no enseña.** Si la respuesta correcta
   depende de un concepto, un dato o un autor que no está en ninguna lección,
   reescribí la pregunta sobre lo que sí está. No agregues contenido a la
   lección para salvar la pregunta.
3. **«La más efectiva» sin ranking.** Si la pregunta pide «la mejor», «la más
   efectiva» o «la primera» y la lección no ordena nada, o varias opciones
   serían correctas según la lección, reformulá para que haya **una sola
   respuesta defendible desde el texto**.
4. **Respuestas que contradicen la lección** (cifras viejas, hechos que la
   pasada de cuerpo corrigió): alineá la pregunta y la explicación con la
   lección.
5. **Tuteo** en enunciados, opciones o explicaciones dirigidos a quien lee →
   voseo.

Las demás preguntas **no se tocan**. Esto es una pasada de corrección, no un
rediseño del banco.

## Cómo escribir una pregunta nueva

- Mismo esquema que las demás del archivo: `question`, `type`
  (`multiple_choice` con 4 `options`, o `true_false` con `options: null`),
  `correctAnswer` (índice 0-3 para múltiple opción, `true`/`false` para
  verdadero/falso), `explanation`, `points`, `orderIndex`. Conservá `points` y
  `orderIndex` de la pregunta que reemplazás.
- **Los distractores tienen que ser plausibles**: errores que alguien que leyó a
  medias podría cometer, no absurdos. Que la correcta no sea la más larga ni la
  única con matices. Variá la posición de la correcta entre preguntas.
- La `explanation` dice **por qué** es la correcta, con lo que dice la lección
  (podés nombrarla), en una o dos frases.
- Rioplatense, voseo. Nada de emojis.
- No repitas una pregunta que ya está en el banco.

## Verificá antes de terminar

- `python3 -c "import json;json.load(open('v2/content/courses/{CURSO}/quiz.json'))"`
  no falla.
- `grep -c 'Qué evidencia mostraría mejor' v2/content/courses/{CURSO}/quiz.json`
  da 0.
- `cd v2 && pnpm entrenamientos:check 2>&1 | grep '{CURSO}'` no muestra errores
  del quiz (los de `minutaje` no son tuyos).

## Qué devolvés

Un resumen corto: cuántas preguntas reemplazaste o reescribiste, y para cada
una el `orderIndex`, el motivo (plantilla, no enseñado, sin ranking,
contradicción, tuteo) y la lección en la que se apoya ahora. Si hay algo de la
lección que te pareció mal, listalo aparte, sin tocar la lección.
