# La Radiografía — la convergencia como instrumento

**Fecha:** 2026-08-12
**Alcance:** `packages/civic-core` (grafo, núcleos, φ) · `packages/db` (columna de vector, repositorio, migración `0020`) · `scripts/` (el job de embebido) · `apps/web` (la página y su entrada en `PAPEL_ROUTES`; la ruta exacta es la pregunta 4 de §13) · `docs/adr` (dos ADR)
**Documento vinculante:** `apps/mobile/docs/PRODUCT_CONSTITUTION.md` — reglas 2, 5, 6, 7, 11, y las cuatro superficies
**Migración:** `0020`. **Ordinales de `docs/DEUDAS.md`:** desde **`D-061`**. *(Corregido el 13/8: esta línea decía «desde D-047» leyendo la reserva del plan de las cuatro specs. Esa reserva no se usó —D-034 a D-044 nunca se escribieron— y el archivo avanzó por otro lado: **D-045 a D-060 ya están ocupados** por el canal de escucha, el basemap, la CSP, las tipografías, los entrenamientos y los crons. Escribir D-047 hoy pisaría la entrada del basemap.)*
**Se apoya en:** `docs/specs/2026-08-11-b-la-senal.md` (§2.1 el vocabulario de nueve tipos en cuatro clases, §2.4 el color codifica la clase, §3.2 `actores`, la tabla `adhesiones`) · `docs/specs/2026-08-11-c-la-corroboracion.md` (§2.9 `CeldaPublicada`) · `docs/specs/2026-08-11-d-el-registro-publico.md` (§2.5 el volcado periódico, §2.7 `FilaPublicable`, §2.8 las dos licencias, §4.3.2 el cursor) · `docs/specs/2026-08-02-el-vacio-como-pieza.md` (V2, V3, V4) · `docs/specs/2026-08-01-el-mapa-simulacion.md` (§3 el contrato epistémico) · `v2/CLAUDE.md` (dependencias pesadas requieren ADR)
**Naturaleza:** spec de producto y de datos. Necesita plan de implementación antes de tocar código.

> **Qué resuelve.** Las cinco lentes de `/el-mapa` contestan **dónde**, **cuándo** y **cuánto**. Ninguna contesta **sobre qué, y estamos de acuerdo**. Esta spec construye la cuarta superficie que la constitución de producto ya nombra —*La Radiografía: lectura pública de datos agregados, calificados por cobertura y protegidos por privacidad*— como un instrumento de exploración: una constelación tridimensional del grafo de convergencia entre señales, con su lista ordenable como camino accesible al mismo dato, y un espejo que le muestra a cada persona quién dijo casi lo mismo que ella y a cuántos kilómetros.
>
> **Qué NO resuelve.** No define el vocabulario de tipos, la tabla `senales`, el actor ni la adhesión (`2026-08-11-b-la-senal.md`). No construye la corroboración, el rastro ni `celda_luz` (`2026-08-11-c-la-corroboracion.md`). No construye el feed, la API abierta ni el volcado (`2026-08-11-d-el-registro-publico.md`) — **los consume**. No toca el callejero ni la jerarquía territorial (`2026-08-11-a-la-tierra.md`). No agrega una sexta lente a `/el-mapa`: es una página propia.
>
> **Y una cosa que esta spec existe para impedir:** que converger se lea como corroborar. La regla 11 es inviolable y esta página es el lugar más fácil del sistema para romperla sin darse cuenta.

---

## §1 El problema

### 1.1 El mapa mide el territorio y no el sentido

`instrumento/catalogo-modos.ts` declara cinco modos: `mapa` («cada voz donde fue dicha»), `analisis` («qué provincia habla y cuánto»), `tiempo` («cómo se fue despertando»), `cobertura` («dónde todavía no habló nadie») y `simulacion` («y si hablamos, qué cambia»). Los cinco son territoriales o temporales. El modo que se llama «Análisis» es un coroplético de volumen por provincia — no analiza lo que la gente dijo, cuenta cuántas veces habló.

Con eso, el sistema puede afirmar que Jujuy habló ciento cuarenta veces y no puede afirmar que Jujuy y Tierra del Fuego dijeron lo mismo. La segunda afirmación es la que cambia lo que alguien cree sobre el país.

### 1.2 Lo que había en v1 no se puede traer

`SocialJusticeHub/client/src/pages/ExplorarDatos.tsx` (717 líneas) tenía la idea correcta y el motor equivocado: `useConvergenceAnalysis.ts` clasifica texto contra **listas de palabras escritas a mano** —nueve temas, unas ciento cuarenta palabras— y llama «convergencia» a cuántos tipos comparten un tema del diccionario.

Eso decide de antemano de qué puede tratarse el país. Lo que no entra en la lista no existe, «curro» y «coima» son cosas distintas, y el conjunto de temas posibles lo fijó quien escribió el archivo. Es lo contrario del resto del sistema, que mide y declara la procedencia de lo que mide. El diccionario no se porta.

### 1.3 El texto libre no tiene ningún índice de sentido

`senales.texto` (hoy `dreams.body`) es texto libre. La spec B le agrega `tema` con catálogo cerrado de once claves escrito por un clasificador bajo la regla 6 — un eje semántico **grueso y sancionado**, que sirve para filtrar y no para agrupar: dos señales de tema `vivienda` pueden ser «no puedo pagar el alquiler» y «hay una casa tomada en la esquina», que no convergen en nada.

Falta la capa fina. Y sin ella, la afirmación «todos quieren lo mismo» es una consigna que el sistema no puede sostener con un número.

---

## §2 Decisiones tomadas

| # | Decisión | Descarta |
|---|---|---|
| **R1** | **La convergencia se mide con embeddings semánticos**, no con un diccionario de palabras. | Listas de keywords a mano · n-gramas sobre el corpus · que lo declare quien escribe |
| **R2** | **Los vectores se calculan localmente**, con un modelo que corre en un job del repo. Las palabras de la gente no viajan a ningún proveedor de IA. | OpenAI · Voyage · cualquier API de embeddings |
| **R3** | **El job no corre en el camino de escritura ni en serverless.** Se corre a mano y **la página declara hasta dónde sabe**. | Embeber en el `POST` · cron en Vercel · GitHub Action programada · `launchd` en la máquina del autor |
| **R4** | **La frescura de la página es el corte de la última corrida** (`analisis_corridas`), una sola fuente, sea cual sea de dónde leyó el job. | Un timestamp inventado por la página · que la página sepa de dónde leyó el job |
| **R5** | **La superficie es un grafo de convergencia en 3D**, donde las **aristas son el dato** y las posiciones son acomodo. | Proyección UMAP/t-SNE · matriz de cuerdas · nube de puntos sin aristas |
| **R6** | **Hay dos clases de arista y se distinguen:** la *medida* (coseno ≥ umbral) y la *declarada* (una adhesión de B). | Una sola arista · mezclarlas en un mismo trazo |
| **R7** | **El deslizador de umbral es el mando principal.** El lector define qué tan parecido es «lo mismo». | Un umbral fijo elegido por nosotros · un número de núcleos fijo |
| **R8** | **La etiqueta de un núcleo es una frase real**: la señal cuyo vector está más cerca del centroide. | Un resumen generado por un LLM · un título nuestro · las palabras más frecuentes |
| **R9** | **Converger no es corroborar.** Los núcleos de clase `deseo` se dibujan y se rotulan distinto de los de clase `hecho`, y la página lo dice con palabras. | Un tratamiento visual único para todas las clases |
| **R10** | **φ gobierna la presentación y nunca la medición.** | Umbral en 1/φ · número de núcleos por Fibonacci · cualquier φ dentro de un número publicado |
| **R11** | **La lista ordenable es el mismo estado que la constelación**, y es el camino accesible. | Una tabla aparte · una «versión accesible» con menos dato |
| **R12** | **Papel y nocturno son un interruptor del lector**, con las dos paletas que el sistema ya define. | Una sola superficie · un tema nuevo |
| **R13** | **Los kilómetros salen del punto engrosado y van redondeados.** | Distancia sobre la coordenada cruda |
| **R14** | **La página muestra su cobertura y su sesgo**, por regla 5. | Mostrar sólo lo que hay |
| **R15** | **La página consume `FilaPublicable`**, nunca la fila de base. El **job** sí lee `senales.texto` directo: es infraestructura interna, no una superficie pública. | Que la página arme campos desde la base · un `SELECT *` en el camino de lectura |

---

## §3 El contrato epistémico de esta página

`2026-08-01-el-mapa-simulacion.md` §3 fijó que todo número declara su procedencia y que donde no hay dato va gris. Esta página agrega tres obligaciones propias, porque produce afirmaciones de una clase que ninguna otra produce.

### 3.1 Converger no es corroborar — regla 11

Que mil personas escriban casi lo mismo **no es evidencia de que eso sea cierto**, ni de que convenga, ni de que sea mayoritario en el país. Es evidencia de que mil personas escribieron casi lo mismo. Nada más, y ya es mucho.

La regla 11 dice que los hechos se corroboran y los deseos se deliberan, y que nunca se confunden. Esta página es el lugar más fácil del sistema para romperla: un núcleo de treinta `sueño` y un núcleo de treinta `basta` corroborados se ven idénticos si se dibujan igual. Entonces:

- **El color del nodo codifica la clase** (§5.2), no el tipo, y es la primera lectura de la constelación.
- **Un núcleo declara su composición por clase** antes que su tamaño. Un núcleo mayoritariamente `deseo` lleva el rótulo «esto se delibera»; uno mayoritariamente `hecho`, «esto se corrobora» con el estado agregado de sus señales.
- **Ningún número de esta página entra en la métrica norte.** La convergencia no confirma una necesidad ni acerca una resolución.
- **Un núcleo mixto se rotula mixto** y no se resuelve por mayoría.

### 3.2 Toda síntesis muestra cobertura y sesgo — regla 5

La página es una síntesis, así que la cabecera lleva, siempre y sin poder cerrarse:

- el **corte de la última corrida del análisis** (`analisis_corridas`), con el modelo que la produjo;
- **cuántas señales entraron y cuántas quedaron afuera** por no tener vector todavía;
- **cuántas provincias no aportaron ni una señal** — el mismo cálculo de la lente Cobertura;
- la advertencia de que quien habla no es quien vive: esto mide a quien usó la plataforma.

### 3.3 La máquina sugiere, no determina — regla 6

Un vector no escribe `tipo`, ni `clase`, ni `estado`, ni `tema`. No escribe nada en `senales`. Vive en su propia columna y sólo produce **agrupamiento y distancia**. La etiqueta de un núcleo es una frase que escribió una persona (R8): la máquina elige *cuál* mostrar, nunca *qué decir*.

---

## §4 El motor

### 4.1 El puerto

```ts
// packages/civic-core/src/radiografia/embebedor.ts
export interface Embebedor {
  readonly modelo: string;      // 'bge-m3' — entra en la procedencia del análisis
  readonly dimensiones: number;
  embeber(textos: readonly string[]): Promise<readonly (readonly number[])[]>;
}
```

Una sola función. El modelo queda como detalle intercambiable y no como decisión irreversible: cambiar de modelo es cambiar la implementación y rehacer el backfill, no reescribir la página.

### 4.2 La implementación

`transformers.js` (ONNX Runtime) en un script del repo, **no** Python y **no** un demonio externo. Razón: es la forma que el repo ya tiene para trabajos de datos (`pnpm geo:backfill`, `pnpm geo:provincias`), no agrega una segunda cadena de dependencias a un monorepo pnpm/TS, y no depende de que alguien instale nada a mano en cada máquina.

Modelo primario **`bge-m3`** (568M, 1024 dimensiones, multilingüe denso). Respaldo **`multilingual-e5-large`** (560M, 1024 dimensiones) si los pesos ONNX del primario dan pelea. **La disponibilidad de pesos ONNX de cada uno se verifica en la Task 1 del plan y no se da por supuesta acá.** Si ninguno de los dos entra, la salida es `gte-multilingual-base` (305M, 768 dimensiones) y se anota la pérdida de calidad en `DEUDAS.md`.

### 4.3 Dónde corre y cuándo

Fuera de banda. `pnpm radiografia:embeber` embebe lo que no tiene vector, escribe, y anota en `analisis_corridas` el corte procesado, el modelo y el conteo. Idempotente y reanudable, como el seed del callejero.

**De dónde lee el job es un detalle del job, no de la página.** Lee `senales.texto` directo de la base: es infraestructura interna corriendo en nuestra máquina contra nuestra base, y eso no es publicar nada. R15 gobierna lo que la página muestra, no lo que un script nuestro lee. Si algún día conviene alinearlo al volcado de D —para que el análisis sea citable contra un sha256— se cambia el origen del job y **la página no se entera**, porque su única fuente de frescura es `analisis_corridas` (R4).

Esto además desatasca la secuencia: embeber no espera a que D exporte `texto` con cesión. Lo que sí espera es la **etiqueta** de cada núcleo (§4.5.4).

**No corre en Vercel**: el modelo no entra en una función serverless, y el repo protege explícitamente los treinta segundos de carga («el instrumento no se paga en el camino crítico»). **No corre en cron**: con el corpus que hay hoy, automatizar es infraestructura para nadie. Se corre a mano, y la consecuencia —que una señal nueva no tenga vector hasta que alguien corra el job— **no se esconde: se declara** (§3.2).


### 4.4 Dónde viven los vectores

Migración **`0020`**: extensión `vector`, columna `senales.embedding vector(1024)` nullable, índice HNSW con `vector_cosine_ops`, y una tabla chica `analisis_corridas` con el corte procesado, el modelo, las dimensiones y el conteo — la procedencia del análisis.

**Verificación previa, primera task del plan:** que `pgvector` esté disponible en el proyecto Neon `cool-bird-63087148`. **Salida si no lo está:** los vectores se guardan como `real[]` y el k-NN se calcula en el job, que persiste la lista de aristas en una tabla `convergencias` en vez de calcularla por consulta. Es más trabajo del job y menos flexibilidad de umbral en vivo (habría que precalcular por escalón), pero no bloquea la spec.

### 4.5 De vectores a núcleos

1. **Aristas medidas**: para cada señal, sus `k = 12` vecinas más cercanas por **coseno**. El grafo se guarda no dirigido y sin repetir par.
2. **Aristas declaradas**: los nodos del grafo son **señales**, y un actor no es un nodo — así que una adhesión no es directamente una arista. Se derivan dos formas, las dos entre señales:
   - **Co-adhesión:** un mismo actor adhirió a dos señales. Ese actor afirmó que las dos le importan.
   - **Adhesión del autor:** el actor que firma una señal adhirió a otra.

   Se distinguen siempre de las medidas (R6): la medida la infiere una máquina, la declarada la afirmó una persona. Y **se cuentan por actores distintos, no por filas**, igual que la decisión 7 de B.
3. **Núcleos**: las **componentes conexas** del grafo visible al umbral que el lector eligió. La métrica y el dibujo son el mismo objeto — no hay dos verdades que puedan discrepar.
4. **La frase del núcleo**: la señal cuyo vector minimiza la distancia al centroide, **entre las señales con cesión de licencia** (§2.8 de D). Si ninguna del núcleo tiene cesión, el núcleo existe, se cuenta, y muestra `texto: null` con el mismo `textoOmitido: 'sin cesión de licencia'` que usa el volcado.

   **Y hay un tramo en que eso es todos los núcleos.** D §2.8 dice que hasta que exista la columna que marca la cesión —que la escribe B, no D— el volcado sale **sin la columna `texto` en ninguna fila**. En ese tramo la página funciona entera *menos las etiquetas*: se dibujan los núcleos, se cuentan, se miden las distancias y se ordena la lista, y donde va la frase va el motivo por el que no está. Es feo y es honesto.
5. **Los dos más lejanos**: el par de señales del núcleo con la mayor distancia geográfica, calculada **sobre el punto engrosado** y redondeada a la decena de kilómetros (R13, y la advertencia de D §47 sobre publicar un padrón de domicilios).

### 4.6 El umbral

No arranca en 1/φ = 0,618 ni en ningún número bonito (R10). Arranca donde los núcleos empiezan a tener sentido **con el corpus que hay**, ese valor se calibra cuando haya corpus, y **se declara en pantalla junto al número**. Hasta entonces el valor inicial es `0,72` y está marcado en el código como provisorio con un enlace a esta sección.

---

## §5 La superficie

### 5.1 La constelación

WebGL con `three.js`, carga diferida sólo en esta ruta. Layout de fuerzas en 3D — se desenreda mucho mejor que en 2D, donde el apiñamiento arruina la lectura.

Materia: **tinta plana, mate, sin emisión ni bloom**, y la profundidad resuelta desvaneciendo hacia el fondo del tema activo (hacia el papel en claro, hacia `oscuro.barra` en nocturno). Ese desvanecimiento es lo que impide que la página se vea como un dashboard genérico.

**El grabado en semitono queda para los momentos de lámina** —el estado vacío y la imagen que alguien comparte— y no para la superficie viva: el tramado pelea contra apuntarle a un nodo y leer una frase, y el pase de trama sobre un canvas a pantalla completa se paga en cada cuadro.

### 5.2 El color

**Codifica la clase, no el tipo**, por §2.4 de la spec B: nueve colores distinguibles en AA a seis píxeles de diámetro no existen, y la lectura que importa es la regla 11.

| clase | token | hex |
|---|---|---|
| hecho | `ambar` | `#A16C00` |
| deseo | `violeta` / `violeta.claro` | `#5227CC` / `#9D85E8` |
| acto | `verde` | `#1A7A4A` |
| meta | `cian` | `#0F6B8A` |

`sello` `#C23B22` **no es color de clase**: marca estado ruidoso (`desactualizada`, `no_cumplida`, `retirada`), igual que en el resto del sistema.

Esta página **no crea ninguna tabla de color propia.** Importa las dos que la spec B deja (una papel, una oscuro). Si aparece un `Record<TipoSenal, string>` en esta página, está mal.

### 5.3 Los dos temas

Interruptor del lector, persistido. Papel es el default porque es el recorrido; nocturno existe porque una constelación vive en un cielo. Las dos paletas ya están en `tailwind.config.ts` — no se inventa un color.

### 5.4 Los cuatro niveles

| Nivel | Qué muestra | Cómo se entra |
|---|---|---|
| **0 · el cielo** | Todo el corpus. El deslizador de umbral rompe el cielo en islas o las funde en un continente. | Al cargar |
| **1 · un núcleo** | La cámara entra, el resto se apaga hacia el fondo. Ficha: frase del centro, composición por clase y por tipo, provincias, estado agregado si es `hecho`, y los dos más lejanos. | Click en un núcleo, o click en una fila de la lista |
| **2 · una señal** | El texto entero (si hay cesión), dónde y cuándo, su estado de calidad —regla 4—, y sus vecinas con el número de parecido. | Click en un nodo |
| **· el espejo** | Tu nodo marcado, botón «llevame a la mía», y la línea trazada a la persona más lejos tuyo que dijo casi lo mismo, con los kilómetros. | Si tenés actor con al menos una señal |

De nivel 2 se salta por una arista a la señal vecina: eso es caminar el grafo, y es lo que hace que sea un instrumento y no un póster.

**La identidad del espejo es `actores` de la spec B** — cookie y CSRF, sin cuenta. Esta página **no inventa un id paralelo en `localStorage`**; sería una segunda identidad peor que la que ya existe.

**El espejo es red de coincidencias, no red social** (decisión 10). Muestra *qué se dijo y a qué distancia*; no muestra un puntaje de afinidad entre personas, no lista «personas parecidas a vos», y no permite contactar a nadie. La regla 7 prohíbe el ranking individual y esta página no lo introduce por la ventana.

### 5.5 La lista

Debajo, y **es el mismo estado**: ordenás la lista y la constelación se reordena; clickeás una fila y la cámara vuela. Columnas: frase, señales, clases presentes, provincias, distancia máxima, novedad. Órdenes: tamaño · amplitud de clase · amplitud territorial · distancia · novedad.

Es el camino accesible al mismo dato — un canvas WebGL es opaco para un lector de pantalla y para el teclado. **No es una versión de consuelo con menos información: es la misma información, leíble y ordenable.**

La decisión 8 de D («feed cronológico, cerca tuyo, sin ranking») **gobierna el feed del registro, no esta lista**: acá no se ordenan señales de personas, se ordenan núcleos, y el orden es un control del lector y no un ranking editorial. Queda escrito para que no se lea como una contradicción.

### 5.6 Dónde φ entra

Sólo en la presentación (R10):

1. **Esfera de Fibonacci** (ángulo áureo 137,507° = 360°/φ²) para repartir los centroides de núcleo alrededor del lector. Es el método estándar para distribuir puntos en una esfera sin apelmazar, y compra utilidad medible: sin él hay núcleos escondidos detrás de otros, que existen en el dato y no se pueden clickear.
2. **Espiral áurea** para acomodar las señales dentro de un núcleo en el nivel 1.
3. **Escala modular φ** para radios de nodo y grosor de arista: 1 · 1,618 · 2,618 · 4,236.
4. **Escalera de detalle** al acercarse: 1, 2, 3, 5, 8, 13, 21 núcleos con etiqueta visible, para que la densidad no salte.
5. **La grilla**: `1.618fr` de constelación a `1fr` de ficha.

Y **no entra** en el umbral, ni en el número de núcleos, ni en ninguna distancia publicada. Poner φ adentro de un número medido sería ponerle un número lindo a un dato que no lo pidió.

---

## §6 El vacío

Por V2, V3 y V4 de `2026-08-02-el-vacio-como-pieza.md`: vacío propio, que invita sin disculparse, y que **se desarma solo** cuando llega el dato. Ningún flag que alguien tenga que acordarse de bajar.

- **Cero señales.** El cielo vacío, en grabado de semitono (§5.1), y encima: *«Una constelación necesita dos estrellas para tener una línea.»* Con el botón que sube al panel de carga que ya existe.
- **Una señal.** Un punto solo, rotulado. *«La primera. Todavía no hay con qué compararla.»*
- **Señales sin vector.** No desaparecen: se cuentan en la cabecera como «esperando análisis» (§3.2). Una señal que existe y no se dibuja tiene que estar contada en alguna parte o la página miente por omisión.
- **Núcleos de uno.** Una señal que nadie repitió **no es un fracaso**: es una voz sola, y se muestra como tal. El conteo de voces solas está en el mismo renglón que el de núcleos, con el mismo peso tipográfico.

---

## §7 Lo que hay que consumir, y por dónde

| Necesito | De dónde | Por qué no de otro lado |
|---|---|---|
| El corpus para embeber | **`senales.texto`, directo** — el job es interno (§4.3) | Es un script nuestro contra nuestra base; alinearlo al volcado se puede después sin tocar la página |
| La etiqueta de cada núcleo | **`FilaPublicable.texto`**, sólo con cesión (§2.8 de D) | El texto lo escribió una persona y el proyecto es custodio, no titular |
| Los campos de una señal en pantalla | **`FilaPublicable`** (§2.7 de D) | Se arma campo por campo, sin spread, con guardas que fallan si alguien agrega un campo sin clasificarlo |
| El vocabulario y las clases | **`packages/civic-core/src/senal/vocabulario.ts`** (spec B §2.5) | Es la fuente única; `lib/tipos-voz.ts` se borra |
| La identidad del espejo | **`actores`** (spec B §3.2) | Ya resuelve identidad sin cuenta, con cookie y CSRF |
| Las aristas declaradas | **`adhesiones`** (spec B) | Es una afirmación de una persona, no una inferencia |
| El punto para los kilómetros | **El engrosado**, el mismo que publica D | La precisión almacenada es un espejo de lo que declaró el cliente, no una protección |
| Cobertura y provincias sin señal | **La lente Cobertura** que ya existe | Dos cálculos de lo mismo dan dos números y no hay forma de decir cuál miente |

---

## §8 Dependencias de secuencia

**Esta página no se implementa antes de que cierre la rebanada 3 del plan `2026-08-11-tierra-senal-corroboracion-registro.md`** (la señal): sin `senales` no hay corpus con vocabulario cerrado, sin `actores` no hay espejo y sin `adhesiones` no hay arista declarada.

Y hay una segunda dependencia, más chica y más tardía: **las etiquetas de los núcleos necesitan que B escriba la columna de cesión y que D exporte `texto`** (rebanada 6). Hasta entonces la página se dibuja, se cuenta y se ordena entera, sin frases (§4.5.4). El motor **no** espera a eso: el job lee la base (§4.3).

**Lo que sí se puede construir ya, en paralelo y sin tocar un solo archivo de ese plan:** el puerto `Embebedor`, su implementación local, el job, el cálculo del grafo, los núcleos y la geometría φ — todo contra un JSONL de juguete con la forma de `FilaPublicable`. Es la rebanada 1 de §10.

---

## §9 Las dos ADR

`v2/CLAUDE.md` nombra a **`three`** y a **`@xenova/transformers`** entre las dependencias pesadas que requieren ADR antes de instalar, con un tope de 60 dependencias de producción encima. Son las dos piezas centrales de esta spec, así que son dos ADR y no una nota al pie:

- **ADR · `three` en el bundle web.** Qué compra (layout de fuerzas 3D, decenas de miles de nodos a 60 fps, picking), qué cuesta (~150 KB), por qué no alcanza SVG (se muere a los pocos miles de nodos), y la mitigación (carga diferida sólo en esta ruta, degradación en teléfonos modestos por regla 10, y la lista como camino accesible).
- **ADR · `@xenova/transformers` en scripts.** Que **no entra al bundle de producción**: es dependencia de un job del repo. Qué compra (que las palabras de la gente no viajen a ningún proveedor de IA, y poder decirlo en la política de privacidad), qué cuesta (~100 MB de pesos cacheados, minutos de CPU), y por qué no una API (R2).

Si alguna de las dos se cae, esta spec cambia de forma y hay que revisarla. Por eso van antes que el código.

---

## §10 Las rebanadas

1. **El motor, a ciegas.** `Embebedor` + implementación local + job + grafo + núcleos + geometría φ, contra un JSONL de juguete. No toca base ni web. **No depende de nadie.**
2. **El sustrato.** Migración `0020`, columna de vector, índice, `analisis_corridas`, repositorio de lectura. **Depende de la rebanada 3 del plan de ellos.**
3. **La constelación.** `three.js`, materia, dos temas, niveles 0 y 1, esfera de Fibonacci. **Depende de 2 y de la ADR de `three`.**
4. **La lista y la cabecera.** Orden, filtros, cobertura y sesgo, frescura. Es el camino accesible, y **no se entrega después de la constelación en producción**: las dos salen juntas o no sale ninguna.
5. **El nivel 2, el espejo y las aristas declaradas.** Caminar el grafo, `actores`, `adhesiones`. **Depende de la cesión de B y del `texto` exportado por D** — el nivel 2 muestra el texto entero, y sin cesión no hay texto que mostrar.
6. **El vacío en grabado y la lámina compartible.**

---

## §11 Las guardas

- **La guarda de la regla 11.** Un test que arma un núcleo de pura clase `deseo` y verifica que la ficha no emite ninguna palabra del vocabulario de corroboración, y que ningún número de esta página entra en la métrica norte.
- **La guarda de la etiqueta.** Un test que verifica que la frase de un núcleo es idéntica, carácter por carácter, a una fila del corpus. Si alguien mete un resumen generado, falla.
- **La guarda de φ.** Un test que verifica que ninguna constante φ aparece en el cálculo del umbral, de la similitud ni de la distancia. φ sólo puede tocar geometría y tipografía.
- **La guarda del color.** Un test que falla si aparece un `Record<TipoSenal, string>` en esta página: el color es por clase y las tablas vienen de B.
- **La guarda de la cesión.** Un test que verifica que una señal sin cesión de licencia nunca aporta su `texto` a una etiqueta de núcleo, aunque sea la más cercana al centroide.
- **La guarda del punto.** Un test que verifica que la distancia se calcula sobre el punto engrosado y nunca sobre el crudo.
- **La guarda del conteo.** Un test que verifica que señales dibujadas + señales sin vector = señales de la corrida. Nada se pierde en silencio.

---

## §12 Qué NO hace

- **No genera texto.** Ni resúmenes de núcleo, ni títulos, ni interpretaciones. La única IA que toca esta página produce vectores.
- **No corrobora nada.** Ni acerca una necesidad a una resolución.
- **No conecta personas.** Sin mensajería, sin perfiles, sin afinidad. Red de coincidencias, no red social.
- **No agrega una lente a `/el-mapa`.** Es una página propia, con su ruta y su chrome papel.
- **No reemplaza al modo `analisis`** del instrumento: ése cuenta volumen por provincia y sigue haciendo falta.
- **No siembra datos.** Con cero señales la página se ve vacía a propósito (§6).

---

## §13 Preguntas abiertas

1. **¿`pgvector` está disponible en el proyecto Neon?** Primera task del plan; la salida está en §4.4.
2. **¿Hay pesos ONNX estables de `bge-m3` para `transformers.js`?** Task 1; el respaldo y la salida están en §4.2.
3. **¿Cuál es el umbral inicial correcto?** No se puede calibrar sin corpus. `0,72` es provisorio y está marcado como tal en el código.
4. **¿La página es `/la-radiografia` o cuelga de `/el-mapa/`?** El nombre viene de la constitución de producto; la ruta no. Se decide al escribir el plan, con la entrada en `PAPEL_ROUTES` que corresponda.
5. **¿Un núcleo puede quedar dominado por una sola persona que cargó veinte señales parecidas?** Sí, y hay que resolverlo: probablemente contando **actores distintos** y no filas, igual que la decisión 7 de B hace con las adhesiones. Entra en el plan de la rebanada 1.
