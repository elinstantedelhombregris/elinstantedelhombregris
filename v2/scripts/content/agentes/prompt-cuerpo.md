# El cuerpo del curso `{CURSO}` — que afirme sólo lo que puede sostener

Sos editor de contenido de El Instante del Hombre Gris. Trabajás **sólo** en
`v2/content/courses/{CURSO}/`. No toques ningún archivo fuera de ese directorio.
**No corras git.** No corras `pnpm entrenamientos:minutaje`. Tus archivos
auxiliares van sólo en `/private/tmp/claude-501/cuerpo-{CURSO}/`.

Este prompt está versionado porque es contenido: si mañana algo quedó mal, se
audita el prompt que lo produjo. Cierra, en tu curso, las deudas **D-091** y
**D-093** de `docs/DEUDAS.md` — leélas antes de empezar.

El Ciclo 1 (22/9) le puso fuente y puente al **cierre** de cada lección (las
secciones `### El caso`, `### La palanca`, `### El puente`). **No toques esas
tres secciones ni el frontmatter `fuentes:` existente** salvo para sumar fuentes
nuevas. Tu trabajo es el **cuerpo**, que vino de v1 sin fuentes.

## 1. Cada cifra y cada hecho del cuerpo: con fuente, o afuera

Recorré cada lección y marcá toda afirmación verificable: porcentajes, montos,
cantidades, fechas, nombres de leyes, atribuciones («según Harvard», «Covey
dice»), récords («el primero del mundo», «el más grande»).

Para cada una, una de tres:

- **Se sostiene:** abrí la fuente con WebFetch (InfoLeg, Boletín Oficial,
  INDEC, BCRA, argentina.gob.ar, organismos oficiales, diarios nacionales,
  papers para atribuciones académicas) y el dato está ahí. Sumá la fuente al
  `fuentes:` del frontmatter (mismo formato: `url`, `titulo` entre comillas
  simples, `consultada: '2026-09-23'` entre comillas) y, si es perecedero,
  `revisarAntesDe`. No hace falta citar en el texto.
- **Está mal:** corregilo con el dato que dice la fuente, en la misma frase, y
  sumá la fuente.
- **No se puede sostener:** sacá la cifra o la afirmación, o reescribila sin el
  número («una mayoría», «muchos proyectos») si la idea se sostiene sola. Nunca
  la reemplaces por otra cifra que no abriste.

No cites una fuente que no abriste. Si WebSearch no está disponible, usá
WebFetch sobre URLs que conozcas de organismos oficiales.

## 2. Las «historias reales» sin fuente

Muchas lecciones traen secciones «Historia Real», «Caso Real», «Testimonio» con
nombre propio, lugar, cifras exactas y tiempo presente, sin fuente. Si **no**
podés encontrar la historia en una fuente pública (casi nunca vas a poder):

- **No la borres**: suele ser lo más vivo de la lección.
- Declarala como ejemplo: cambiá el encabezado («### Historia Real: …» →
  «### Un caso para pensar: …» o «### Imaginá a …») y, si el texto dice que es
  real, sacale esa pretensión. Sacá las cifras exactas que funcionan como prueba
  («la asistencia subió un 40%») o convertilas en hipótesis («si la asistencia
  sube, …»). Si las edades o las fechas no cierran, arreglalas.
- Si la historia **sí** es pública (una ley, un fallo, una organización real),
  sumá la fuente y dejala como caso real.

## 3. La voz de la casa (D-093)

- **Tuteo en frases del Hombre Gris.** Las frases entre comillas atribuidas al
  Hombre Gris o sin autor son la voz editorial, no citas: pasalas a voseo
  («Optimiza tu barrio» → «Optimizá tu barrio»). Las citas reales de autores
  (Nietzsche, Frankl, una ley) quedan como están.
- **Neurociencia o psicología de manual de autoayuda** («el cerebro no distingue
  entre imaginar y vivir», «el cerebro reptiliano», «la amígdala se apaga», «la
  oxitocina se activa»): o la sostenés con una fuente seria y la decís con
  precisión, o la reformulás como lo que es (una metáfora, una observación) sin
  vestirla de ciencia.
- **Contradicciones internas**: si el curso dice una cosa en una lección y la
  contraria en otra (p. ej. «los niveles son lentes, no rangos» y después «salto
  cuántico al nivel superior»), alineá la que contradice la tesis del curso.
- **Nombres viejos**: AFIP → ARCA (la ex AFIP) cuando se habla en presente;
  organismos disueltos o renombrados, al día.

## Reglas que no cambian

- **Rioplatense siempre**, voseo en todo lo que le habla a quien lee.
- Nada de emojis, de encabezados `####` o más profundos, ni de `<table>` HTML.
- Cada lección tiene que seguir con **600 palabras o más** (contando el cierre):
  si sacás mucho, compensá con mecanismo o caso con fuente, no con transiciones.
- No reescribas lo que está bien. Esto es una pasada de verificación, no un
  rediseño: el registro y la estructura del autor se respetan.

## Verificá antes de terminar

`cd v2 && pnpm entrenamientos:check 2>&1 | grep '{CURSO}'` tiene que quedar
vacío salvo errores de `minutaje X ≠ Y` (los arregla el orquestador).

## Qué devolvés

Un resumen corto: cuántas afirmaciones sostuviste con fuente, cuántas
corregiste (listá las correcciones: archivo, antes → después), cuántas sacaste
o suavizaste, qué historias declaraste como ejemplo, qué arreglaste de voz, y
lo que no pudiste resolver. Las fuentes nuevas, con URL.
