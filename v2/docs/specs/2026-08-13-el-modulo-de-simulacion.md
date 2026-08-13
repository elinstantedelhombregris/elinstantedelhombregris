# El módulo de Simulación — modo forma y modo gente

**Fecha:** 2026-08-13
**Documento vinculante:** `apps/mobile/docs/PRODUCT_CONSTITUTION.md`
**ADRs que aplica:** `0008` (la API corre como función serverless) · `0009` (embeddings y texto: nada sale a un proveedor externo)
**Spec previa que absorbe:** `docs/specs/2026-08-01-el-mapa-simulacion.md` (rebanadas 3 y 4, nunca construidas)
**Migración:** `0021` — la última en disco es `0015_georef_not_null.sql`, y después `0019`/`0020`; el rango `0016`–`0018` que reclaman las specs B/C/D está en disputa y este módulo no lo toca
**Deudas que abre:** se anotan al implementar, desde `D-061` (la última en `docs/DEUDAS.md` es `D-060`; el archivo lo tiene otra sesión viva y los ids pueden correrse)

> **Qué resuelve.** Convierte la Simulación de un juego de perillas en un instrumento de análisis. Le da al motor lo que le falta para responder preguntas: una **espina** común —país, escenario, cosecha, veredicto, corrida— y **dos modos** que la alimentan. En el **modo forma** declarás la forma del país que hablaría y el motor la construye; en el **modo gente** declarás quiénes son y la forma sale de lo que hacen. Los dos producen la misma `Cosecha`, así que el mandato, la procedencia, la cobertura, el barrido y la cortina son **uno solo**. Agrega barrido con semilla, búsqueda de umbrales, incertidumbre declarada como tipo, y una cuarta procedencia que impide que una hipótesis de modelo se lea como un dato.
>
> **Qué NO resuelve.** No construye las tablas del canon (`senales`, `actores`, `adhesiones`, `confirmaciones`, `rastro_senal`): **no existen** ni en la base ni en `packages/db/src/schema/`, y este módulo escribe en un esquema `simulacion` aparte que no las presupone. No modela la deliberación, porque el producto no la tiene (§8.3). No hace pronósticos (§8.1). No corre un LLM adentro del bucle de simulación, ni en producción (§2.5, §4.3). No toca `public.senales` ni ninguna tabla del corpus real.

---

## §1 El problema

### 1.1 El dueño pidió dos cosas, y son dos cosas — pero un solo módulo

La pedida original es un motor de enjambre al estilo MiroFish: agentes con persona y memoria, corriendo con cómputo local, con variables para análisis de sensibilidad. La segunda, mirando lo que ya había empezado, es el diseño paramétrico. **Los dos**, como dos modos del mismo módulo.

Tratarlos como dos herramientas sueltas es el error obvio y es el caro: serían dos definiciones de mandato, dos formatos de resultado, dos procedencias, dos barridos, y ninguna forma de contestar la única pregunta que justifica tener los dos —*¿en qué se diferencian?*—. Este documento existe para que sean uno.

### 1.2 La aritmética que no se negocia: siete órdenes de magnitud

El análisis de sensibilidad necesita cientos o miles de corridas. Una corrida con LLM por agente y por ronda cuesta horas. Los dos hechos son ciertos a la vez, así que el reparto es forzado y hay que escribirlo antes que nada.

Medido en esta máquina (Mac15,6 / Apple M3 Pro / 12 cores / 18 GB, Node 22.22.3), con el motor real de `packages/civic-core/src/simulacion/`:

- una corrida del modo forma con 24 provincias y base vacía: **0,0082 ms**
- la dinámica del modo gente con 1.000 personas × 60 rondas: **1,888 ms** (prototipo propio, arrays tipados, azar por coordenada)
- generar 1.000 personas con un 8B local: **≈ 2 h 43 min** (§4.2.1, aritmética a la vista)

El elenco cuesta **unas 5.200 veces** lo que cuesta el barrido entero que lo usa (9.800 s contra 1,89 s para mil funciones). Si la población se regenerara en cada corrida del barrido, estarías midiendo la varianza del modelo y creyendo que medís la palanca. Es el error que hace inútil todo el análisis, no da error, y devuelve números plausibles.

De ahí sale la decisión que gobierna la arquitectura entera: **el LLM escribe la población una vez y se congela con su huella; la dinámica barata corre encima miles de veces y no llama a nadie.**

### 1.3 El motor que existe es bueno, y no sirve para barrer

Los 576 LOC de `packages/civic-core/src/simulacion/` son sólidos: puros, sin red, sin disco, sin reloj, con `Magnitud` envolviendo todo número que llega a pantalla y una guarda que caza el número pelado. La idea central —restar el **silencio** medido contra la **voz** simulada— es lo mejor del proyecto y se conserva entera.

Lo que le falta para servir a un análisis, medido:

**No hay azar. Ninguno.** `grep` de `Math.random` y `Date.now()` sobre `packages/civic-core/src` fuera de tests devuelve cero coincidencias. Lo verifiqué corriendo: dos `simular()` con la misma entrada dan un resultado **byte a byte idéntico**. Un Monte Carlo sobre el motor de hoy devuelve N muestras iguales y varianza exactamente 0. La varianza hay que **crearla**, y la casa está limpia para hacerlo bien: no hay azar escondido que desalojar.

**El silencio se recalcula en cada corrida, y es la mayor parte del costo.** `simular.ts:52` llama `retratoMedido()` en cada invocación aunque ese lado, por decisión S3, no dependa de ninguna palanca. Medido con 24 provincias:

| voces medidas | `simular()` completo | sólo la voz | el silencio es | aceleración |
|---|---|---|---|---|
| 0 (**el caso real de hoy**) | 0,0173 ms | 0,0091 ms | 48 % | ×1,9 |
| 5.000 | 0,3578 ms | 0,0845 ms | 76 % | ×4,2 |
| 50.000 | 5,1049 ms | 0,9606 ms | 81 % | ×5,3 |
| 100.000 | 8,4010 ms | 1,6543 ms | 80 % | ×5,1 |

Con el corpus lleno, cuatro quintos del tiempo de un barrido se irían en recalcular una constante.

**La respuesta es un escalón, no una rampa.** Medido con 24 territorios de población desigual y 5.000 voces: participación 50, 100, 200, 300, 366 y 367 dan **todas** el mismo resultado (1 de 24 territorios con mandato, alcance 0,0414). Bisecté el borde: está en **438,15**. Una grilla de paso 50 evalúa 350 y 400, y las dos dan 1/24: **se saltea la transición entera y reporta sensibilidad cero en la palanca más importante del modelo.** Es inevitable —`hayMandato` es un umbral duro y las voces se reparten en enteros— pero descarta las derivadas y las elasticidades: la derivada es 0 en casi todo el dominio e infinita en un punto.

**La memoria, no el CPU, es lo que mata un barrido.** Medido reteniendo 1.000 resultados con 24 provincias: `ResultadoSimulacion` completo = **27,38 MB**; reducido a cinco escalares = **0,18 MB**. Factor **×148**. A nivel municipio el completo escala a gigas, dentro de una pestaña.

**Dos `RangeError` esperando.** `retrato.ts:98` hace `Math.max(0, ...[...sostenidosPorTerritorio.values()])` y `retrato.ts:141` hace `Math.min(...fechas)` sobre **todas las voces**. Bisecté el techo en esta máquina: 100.000 valores pasan, **110.000 rompen** con `RangeError: Maximum call stack size exceeded`. Y no es remoto: mi propio prototipo del modo gente con 10.000 personas × 120 rondas emite **415.645 señales**, casi cuatro veces el techo. En un Web Worker el stack es más chico que en Node, así que el techo real es más bajo que el medido. `coropletico.ts:96` repite el patrón.

### 1.4 Dos de las siete palancas no existen, y el vocabulario está desfasado

`composicion` y `cumplimiento` aparecen **sólo** en `tipos.ts:51` y `tipos.ts:59` —sus declaraciones— y en ningún cálculo: `grep` sobre `retrato.ts`, `simular.ts`, `reparto.ts` y `mandato.ts` no devuelve una sola lectura. Lo verifiqué sobre el resultado entero: mover `cumplimiento` de 0,5 a 1, y `composicion` de pareja a todo-`basta`, deja el resultado **idéntico byte a byte**. Está honestamente declarado en `PanelPalancas.tsx:8` («Cinco mueven algo hoy») y los dos diales se dibujan sin control. Pero significa que 2 de 7 dimensiones tienen derivada idénticamente cero: cualquier tornado sale hoy con dos barras en cero, y no porque la palanca no importe sino porque no está enchufada.

Y `VozMedida.tipo` **nunca se lee**: `retrato.ts:127` cuenta `+1` por voz sin mirar el tipo. Consecuencia directa sobre «qué mandatos podemos generar»: hoy el motor genera **exactamente uno, indiferenciado** — «este territorio cruzó el piso y lo sostuvo». La spec previa §5.3 dice «mandato sobre un tema» y §7.3 pide el ranking de temas: las dos cosas son incomputables con el código de hoy.

Encima el vocabulario es el viejo. `tipos.ts:11` declara seis tipos con `valor` adentro; el canon son **nueve en cuatro clases** y `valor` salió del mapa. Los nueve ya existen en un solo lugar del repo —`direcciones.ts:610`, `TECHO_POR_TIPO`, con su TODO escrito— y las cuatro clases no existen en `civic-core` en absoluto. Y el `?? 'valor'` sigue vivo en **tres** copias: `el-mapa-data.ts:10`, `paleta.ts:35` y `mandato-regimen.ts:46`. Mientras vivan, `valor` es el sumidero de todo lo que no matchea y la composición *medida* está sesgada por construcción.

### 1.5 El reloj entra por el peor lugar, y ya rompe S3 en producción

`useModoSimulacion.tsx:62` llama `estadoMedidoDesde(ctx.todas, provincias.data ?? [], Date.now())` **dentro de un `useMemo` cuyas dependencias incluyen `palancas`** (línea 64). Cada vez que alguien mueve un dial se relee el reloj y se recalcula el silencio con un `ahora` nuevo. El comentario de las líneas 56-58 afirma exactamente lo contrario de lo que hace el código.

No es teórico. Lo reproduje: con 150 voces sobre un territorio de 100.000 habitantes (umbral 100), repartidas de modo que una caiga justo en el borde de un período, avanzar el reloj **un milisegundo** cambia el silencio de `alcance 0,0000 / mandato false` a `alcance 1,0000 / mandato true`. Con un corpus real repartido en el tiempo, en cualquier instante hay alguna voz cerca de un borde. Las guardas pasan igual porque todos los tests fijan `ahora` y ninguno toca el call site.

Para el mapa es un bug. Para un barrido es bloqueante: dos corridas del mismo diseño dejan de ser comparables.

### 1.6 MiroFish promete lo que no cumple, y hay que aprender de las dos cosas

Se estudió el código, no el README. Lo bueno es de diseño y se toma: **congelar la población como dato serializable con puntero a su origen** (`source_entity_uuid`), **la entrevista que no escribe en la memoria del agente** (`interview_record=False`, de modo que preguntar no altera la corrida), **el reporte como agente que interroga el resultado**, y **la memoria de largo plazo detrás del loop y no adentro**.

Lo que hay que no repetir, verificado leyendo sus rutas de código:

- **Sin semilla no hay ciencia.** `grep -rn "random.seed\|np.random.seed\|set_seed"` sobre todo su backend devuelve cero. El sorteo de activación usa el `random` global de Python sin sembrar, el LLM corre a temperatura de proveedor, y `asyncio.gather` no garantiza orden. Dos corridas idénticas dan resultados distintos, y el análisis de sensibilidad —que es lo que el dueño pidió textualmente— es imposible por construcción.
- **Trece de dieciséis perillas son utilería.** Un LLM genera `sentiment_bias`, `stance`, `influence_weight`, `viral_threshold`, `echo_chamber_strength` y ocho más; el simulador lee **dos** (`activity_level` y `active_hours`). Quien mueva `echo_chamber_strength` y vea cambiar el resultado está viendo ruido del modelo y va a creer que aprendió algo.
- **La memoria de largo plazo viene apagada y los agentes nunca la leen** durante la corrida. Es el rastro de la corrida con otro nombre.

Y su dependencia dura es Zep Cloud: `backend/app/config.py:71-72` rechaza `ZEP_API_URL` con «MiroFish sólo se conecta a Zep Cloud». Bajo la ADR 0009 eso saca de la mesa la construcción del grafo y las cuatro herramientas del reporte. No es una pérdida grande: el corpus de acá ya tiene estructura —los PLANes tienen ordinal y remisiones, los ensayos tienen ciclo, el blog tiene slugs— y no hace falta extraerla con un modelo.

---

## §2 La decisión

### 2.1 Un módulo, dos modos, una espina

Un modo **no** es una implementación de `simular()`. Un modo es una función que produce una cosecha:

```ts
export type Modo = (esc: Escenario, pais: Pais, pob: Poblacion | null) => Cosecha;

export const modoForma: Modo;   // `pob` es null, y el tipo lo dice
export const modoGente: Modo;   // `pob` es obligatoria
```

Todo lo que viene **después** de la `Cosecha` —mandato, retrato, procedencia, cobertura, barrido, cortina, la tabla de umbrales— es uno solo y no sabe qué modo lo produjo. Ésa es la espina, y es lo que hace que esto sea un módulo y no dos programas que comparten carpeta.

La diferencia real entre los modos es una sola: **en un modo declarás la forma del país que hablaría y el motor la construye; en el otro declarás la gente y la forma sale de lo que hacen.** Como la forma es medible sobre la salida de los dos con la misma función (§5.1), lo que en un modo es entrada en el otro es resultado, y el desacuerdo entre ambos deja de ser una incomodidad para volverse un número que se calcula, se mapea y se lee: **el resto** (§5.2).

### 2.2 Tres clases de variable, y las que no se corresponden se nombran

Ésta es la parte que decide si el módulo es honesto. Las siete palancas de hoy **no** son un grupo homogéneo, y forzarlas a serlo es lo que rompería el módulo en seis meses.

- **La forma** (participación, dispersión, constancia, composición) — el modo forma la **declara**, el modo gente la **produce**.
- **Los ajustes** (horizonte, resistencia, cumplimiento) — los **dos** modos los obedecen, en el mismo lugar del cálculo.
- **El mecanismo** (chispa, contagio, desaliento, grado) — **sólo** el modo gente. El modo forma no tiene interacción y por lo tanto no tiene dónde ponerlos.
- **Los coeficientes** (`PISO_MANDATO`, `K_RESISTENCIA`, `MINIMO_PERIODOS`, `PERIODOS_POR_ANIO`) — decisiones nuestras, no de la gente, y los dos modos los obedecen igual.

Un eje de clase `forma` en modo gente, y uno de clase `mecanismo` en modo forma, **se rechazan en el tipo y se dibujan deshabilitados con la razón escrita**. Es el criterio que `PanelPalancas.tsx:8` ya estableció: *un dial que no hace nada es peor que una ausencia explicada*.

Y una que casi se cuela: es tentador cargar `resistencia` también de desmovilización en el modo gente («el que se topa con un muro se cansa»). **No.** Una variable que entra en dos lugares distintos deja de ser comparable entre modos. La resistencia toca el piso y nada más; el desánimo se llama `desaliento` y es de mecanismo.

### 2.3 La cosecha es territorio × período × clase

Los dos modos devuelven celdas `(territorioId, periodo, clase)` con voces, actores distintos y señales sin actor. Que lleve el **período** —y no sólo el territorio, como hoy— es la decisión estructural del documento, y resuelve cuatro cosas de una:

1. `sostenidos` deja de ser un parámetro y pasa a ser **derivable**: son los períodos con voces. Hoy el lado medido lo deriva y el simulado lo impone parejo (`retrato.ts:178` reparte el mismo número a todos los territorios); con la cosecha los dos lo derivan igual.
2. Es la forma natural de lo que produce una corrida de agentes —la persona 412 habló en la ronda 7 en Chaco—, así que no hace falta ningún adaptador.
3. Arregla `persistencia`, que hoy es `Math.max(0, ...)` (`retrato.ts:98`): un solo territorio que sostuvo todos los meses fija la persistencia **nacional** en 1,0000 aunque los otros 23 hayan hablado una vez, y como `legitimidad = alcance × persistencia`, la legitimidad del país queda multiplicada por su mejor caso. Eso roza de frente la regla 5.
4. Mata el `RangeError` del spread, porque el pliegue pasa a ser un `for` con acumulador.

Y que lleve la **clase** es lo que hace que `composicion` pueda existir como palanca de verdad (§2.6).

La cosecha es **transitoria**: se produce, se reduce a `Corrida` y se tira. Con 2.082 municipios × 24 períodos × 4 clases serían ~200.000 celdas; guardar mil de ésas es exactamente lo que hace inviable un barrido (medido: ×148 de diferencia, §1.3). El retrato completo se rehidrata bajo demanda para la única corrida que la persona abre — recalcularlo cuesta 0,0082 ms, menos que guardarlo.

### 2.4 La cuarta procedencia es un sello, no un cuarto par

`procedencia.ts:4` dice hoy, con todas las letras, «solo existen tres procedencias y ninguna cuarta». Entra una, y la forma importa.

La tentación es agregar `{ tipo: 'generado', modelo, digest }` al lado de las otras tres. **Está mal**, y es la contradicción más importante que este documento resuelve: la legitimidad de una corrida de agentes **sí** es un derivado con fórmula real (`alcance × persistencia`); lo que no es real es el conteo del que cuelga. La corrupción está en la **raíz** de la cadena, no en cada nodo. Aplanarla pierde la fórmula, que es justo lo que `derivado` existe para mostrar.

Entonces la cuarta variante **envuelve** en vez de reemplazar:

```ts
| { tipo: 'hipotesis'; sobre: Procedencia; sello: SelloDelModelo }
```

Y la deriva propaga autoridad: si alguno de los insumos es hipótesis, el resultado también lo es. **No hay lavado de procedencia** — que es el agujero obvio, y el que un cuarto par plano dejaría abierto.

La línea que separa `derivado` de `hipotesis`, dicha en una frase: **un derivado se puede rehacer con lápiz; una hipótesis sólo se puede volver a correr y esperar.** Por eso el modo forma nunca produce `hipotesis` aunque sea un modelo: su fórmula está a la vista y cualquiera la verifica. Y por eso el modo forma **no necesita esta variante para existir**, que es el argumento más fuerte para construirlo primero (§10).

### 2.5 La población se congela, y el LLM no corre adentro del bucle

El reparto de trabajo es asimétrico y definitivo:

- el LLM escribe la **población** —semblanza, frases y conducta de cada persona— una sola vez, y ahí se congela con su huella;
- el LLM contesta la **entrevista**, parafraseando un rastro que se le da;
- la **dinámica** —quién habla, quién adhiere, quién corrobora, qué mandato se forma— es pura, sembrada, y no llama a nadie.

El error central del §1.2 no se evita con disciplina ni con un test: se vuelve **estructuralmente imposible**, porque `barrer()` vive en `civic-core`, que es puro y no puede abrir un socket, y recibe una `Poblacion` ya congelada en vez de un generador. Encima `barrer()` verifica que la huella de la población sea idéntica en todas las corridas del barrido, antes de la primera.

Y hay que ser honesto sobre qué se construye: **esto no es un modelo de agentes con LLM en el loop; es un modelo de agentes con población escrita por LLM y conducta declarada.** Llamarlo de otro modo sería la mentira de MiroFish al revés.

### 2.6 `composicion` se implementa por primera vez, y la palanca es la clase

Como el motor no la lee, esto no es un rename: es implementar la palanca por primera vez. Por eso se implementa directo contra el canon y no contra los seis viejos.

**La palanca es la CLASE** (cuatro: `hecho`, `deseo`, `acto`, `meta`), por cinco razones en orden de fuerza:

1. **Es la única que toca maquinaria.** `hecho` y `acto` corren corroboración; `deseo` no la corre y la deliberación no está construida; `meta` sólo se responde. La clase es lo que decide si una voz puede producir verificables y confirmaciones, o sea si mueve **nitidez** o sólo **brillo**.
2. **Es exactamente la pregunta abierta del brief.** «Cuánto de lo que se dice es comprobable» es `composicion.hecho + composicion.acto`, que es literalmente el multiplicador del denominador de la nitidez. Es una línea recta de la palanca al dibujo; el eje del tipo no tiene ninguna equivalente.
3. **Nueve deslizadores que suman 1 no son un control.** Cuatro sí. Y el barrido recorre 4 dimensiones en vez de 9 correlacionadas, que es la diferencia entre un análisis interpretable y uno que mide su propia restricción de suma.
4. **El precedente ya está tomado:** el color codifica la clase, no el tipo, y agregar un tipo no toca ninguna tabla de color — hay que clasificarlo, y el `Record` exhaustivo obliga.
5. **Es la regla 11 vuelta control.**

**El tipo no desaparece: baja a coeficiente publicado**, por tres razones bloqueantes. Los relojes de vida útil se llavean por tipo (basta 90/45 d, saber 365/182 d…), y sin ellos una señal sintética no puede setear `vence_el` ni `caduca_el`. El techo de dirección es por tipo y es asimétrico (`direcciones.ts:610`: altura sólo en `basta`/`recurso`/`práctica`/`compromiso`). Y la métrica norte se consulta por `tipo = 'necesidad'`, no por clase, porque la clase mezclaría un pozo tapado con un saber corroborado.

`valor` no se traduce a nada: sale. Y las tres copias del `?? 'valor'` se matan en el mismo movimiento, porque alimentar la palanca con el sumidero de hoy sería medir el defecto.

**El orden importa y es fácil de invertir.** Hoy migrar el vocabulario toca cuatro archivos y **ningún cálculo**, justamente porque la palanca está muerta. Si primero se conecta la palanca y después se migra, la migración pasa a tocar cálculo y a invalidar todo escenario guardado. Migrar primero, conectar después.

### 2.7 El azar hay que crearlo, y entra por coordenada

El motor no tiene azar (§1.3), así que la reproducibilidad ya está regalada y lo que falta es varianza. Cinco reglas, comunes a los dos modos:

1. **La semilla vive en el `Escenario`**, no entre las palancas: es identidad de la corrida, no una perilla más.
2. **El azar es por coordenada, no por secuencia.** `azarDe(semilla, ronda, indice, proposito)` es un mezclador sin estado. La consecuencia que un PRNG secuencial no da: agregar una persona **no corre el azar de las demás**, así que dos corridas con distinto N son comparables. Sin eso, un Monte Carlo mide su propio reordenamiento.
3. **Orden canónico de aplicación de efectos, por id.** Nunca orden de llegada — es el bug del `asyncio.gather` de OASIS.
4. **`Corrida.reproducible` es computado**, y un barrido **se niega** a correr sobre corridas no reproducibles. Temperatura > 0 ⇒ `false`.
5. **`Math.random` queda prohibido en `civic-core`** por `no-restricted-globals` más una guarda que grepea el fuente.

### 2.8 La pregunta útil es el umbral, no la derivada

Por el escalón medido en §1.3, el titular del módulo **no** es un ranking de sensibilidad sino la **tabla de umbrales**: *«¿a partir de qué participación gana mandato mi provincia?»*. Es un número por territorio, se encuentra por bisección en **14 corridas** (dominio [0, 5.000], tolerancia 0,01 — medido), y es además el número que le sirve a una persona real. Las 24 provincias son 336 corridas: **2,8 ms**.

Las elasticidades **no entran**. Publicar «elasticidad de la legitimidad respecto de la participación = 0,0» sería técnicamente correcto y completamente engañoso. Quedan reservadas para el día que la respuesta sea suave, con una guarda que se niegue a calcularlas si detectó un salto en el tramo.

El tornado **sí** entra, porque es la única lectura que alguien no técnico lee sin entrenamiento — pero nunca solo, y siempre con la nube al lado para que el escalón se **vea**.

### 2.9 Página propia, y el modo gente es local

Va a `/la-simulacion`, no a una pestaña más de `/el-mapa`. El comentario de `modos/tipos.ts:33` pide **por escrito** revisar el contrato antes de sumar una segunda usuaria de la compuerta `superficie?`, y un barrido con tornado, nube y tabla no es «un conjunto de capas sobre la misma instancia de mapa», que es la definición de modo que ese archivo defiende. La cortina se queda en `/el-mapa` haciendo lo que hace bien, y pasa a ser un **lector** de un `Escenario` codificado en la URL: una espina, dos superficies, y `superficie?` sigue con una sola usuaria.

Y por la ADR 0008 —la API corre como función serverless, sin proceso largo ni disco— **no hay dónde meter un modelo en producción**. Es una consecuencia de diseño y es la buena: **el modo gente es una herramienta local, de quien la corre en su máquina.** En la página publicada aparece como «esto corre en tu máquina, así se instala», nunca como un botón que da error.

### 2.10 La siembra sintética va a un esquema aparte, no a una columna

Decisión del dueño, y tiene el argumento a favor: una columna `es_simulacion` falla la primera vez que alguien escribe una consulta y se olvida el `where`, y falla **en silencio**. Un esquema aparte hace que la consulta dé error en vez de mentir. Es la lección de D-002 —doce filas de demo que invalidaron todo juicio visual sobre el mapa durante meses— y hoy la base cívica está en cero absoluto, así que es el momento más barato para no equivocarse.

### 2.11 Las contradicciones entre los tres diseños, resueltas

Los tres diseños de entrada no coinciden. Donde la espina y un modo difieren, **gana la espina**: sin ella son dos herramientas sueltas.

| # | En disputa | Modo forma proponía | Modo gente proponía | **Gana** | Por qué |
|---|---|---|---|---|---|
| 1 | Cuarta procedencia | no hace falta | `{tipo:'ensayado'}` plano | **espina**: `{tipo:'hipotesis', sobre, sello}` | Un par plano aplana la cadena y pierde la fórmula; el sello propaga y no se lava (§2.4) |
| 2 | Forma de la cosecha | `ReadonlyMap<territorio, number>` | `conteo` + `sostenidos` sueltos | **espina**: territorio × período × clase | Hace `sostenidos` derivable en los dos lados, arregla `persistencia` y mata el spread (§2.3) |
| 3 | Taxonomía de variables | lista plana de `ClavePalanca` | idem, más mecanismo | **espina**: forma / ajustes / mecanismo | Es lo único que hace visible dónde los modos NO se corresponden (§2.2) |
| 4 | Superficie | `/simulacion` (paramétrico) | `/el-ensayo` (agentes) | **espina**: una `/la-simulacion` con dos modos | Dos páginas son dos herramientas; y `/el-mapa` queda como lector (§2.9) |
| 5 | Nombre | «El Banco» | «El Ensayo General» | **espina**: La Simulación, modo forma / modo gente | Un módulo con dos modos se nombra como uno |
| 6 | `resistencia` en modo gente | — | también desmoviliza | **espina**: sólo toca el piso | Una variable en dos lugares deja de ser comparable; el desánimo es `desaliento` (§2.2) |
| 7 | `Variable` / `Distribucion` / `Estimacion` | los define | — | **modo forma**, adoptado tal cual | La espina no los tenía; llenan un hueco sin chocar con nada (§3.6) |
| 8 | `Conducta` / `Semblanza` separadas | — | las define | **modo gente**, adoptado tal cual | 48 bytes contra 1,9 KB por persona: es lo que hace transferible el elenco (§3.8) |
| 9 | Elasticidades | descartadas | — | **descartadas** | La derivada es 0 en casi todo el dominio (§2.8) |
| 10 | Sobol / Morris | «no hoy, y no por costo» | — | **no hoy**, declarado como paso siguiente | Descompone varianza, y con dos palancas muertas buena parte sería artefacto (§8.5) |

---

## §3 El modelo de datos

Todo vive en `packages/civic-core/src/simulacion/espina/`, y todo es puro: sin red, sin disco, sin reloj. El reloj y la semilla entran por parámetro, exactamente como `ahora` ya entra hoy en `EstadoMedido`.

### 3.1 El país y el escenario, partidos a propósito

```ts
/** Lo pesado. No viaja en una URL: viaja su huella. */
export interface Pais {
  readonly huella: string;            // FNV-1a sobre (territorioId, fecha) ordenado
  readonly ahora: number;             // EL RELOJ CONGELADO
  readonly base: EstadoMedido;
  readonly territorios: readonly Territorio[];
  readonly nivel: 'provincia' | 'departamento' | 'municipio' | 'localidad';
}

/** Lo liviano y citable. Entra entero en un hash de URL. */
export interface Escenario {
  readonly id: string;                // 'el-que-sostiene'
  readonly nombre: string;
  readonly pregunta: string;          // OBLIGATORIA
  readonly paisHuella: string;
  readonly eje: EjeDeMandato;
  readonly forma: Forma;
  readonly ajustes: Ajustes;
  readonly coeficientes: Coeficientes;
  readonly semilla: number;
  readonly mecanismo: Mecanismo | null;   // null en modo forma, y se ve
  readonly motor: string;                 // versión de civic-core
}
```

Tres cosas que este corte resuelve:

- **`ahora` vive en `Pais`** y no se lee en el render. Arregla §1.5, y es lo que la reproducibilidad de un barrido exige de todos modos.
- **`correr()` tira si `pais.huella !== esc.paisHuella`.** Es la guarda que impide comparar dos corridas contra países distintos creyendo que comparaste palancas.
- **`pregunta` es obligatoria.** Un escenario sin pregunta es un juego de perillas, y barrer una perilla sin pregunta no significa nada.

### 3.2 Forma, ajustes y mecanismo

```ts
/** LA FORMA — el modo forma la DECLARA · el modo gente la PRODUCE. */
export interface Forma {
  readonly participacion: number;                              // voces cada 100.000 hab
  readonly dispersion: number;                                 // 0 concentrado · 1 proporcional
  readonly constancia: number;                                 // 0 estallido · 1 goteo
  readonly composicion: Readonly<Record<ClaseSenal, number>>;  // 4 claves, suman 1
}

/** LOS AJUSTES — los dos modos los obedecen, en el mismo lugar del cálculo. */
export interface Ajustes {
  readonly horizonte: number;    // años → periodosDelHorizonte() → RONDAS del modo gente
  readonly resistencia: number;  // → pisoEfectivo(), y nada más, en los dos modos
  readonly cumplimiento: number; // fracción de `acto` que cierra cumplido. Nunca multiplica legitimidad.
}

/** EL MECANISMO — sólo modo gente. */
export interface Mecanismo {
  readonly poblacionHuella: string;
  readonly chispa: number;       // fracción que arranca sin que nadie la mueva
  readonly contagio: number;     // cuánto pesa un vecino que ya habla
  readonly desaliento: number;   // cuánto desmoviliza la resistencia — NO es `resistencia`
  readonly grado: number;        // vínculos por persona
}
```

**Dónde se corresponden y dónde no, sin esconderlo:**

| Variable | modo forma | modo gente | ¿comparable? |
|---|---|---|---|
| `horizonte` | entrada | entrada — **una ronda ES un período ES un mes** | sí |
| `resistencia` | entrada → piso | **el mismo** piso | sí |
| `cumplimiento` | fracción declarada | la misma fracción, aplicada por señal | sí |
| los cuatro `Coeficientes` | entrada | entrada | sí, y hay que barrerlos |
| `participacion` | **entrada** | **salida** | no |
| `dispersion` | **entrada** | **salida** | no |
| `constancia` | **entrada** | **salida** | no |
| `composicion` | **entrada** | **salida** | no |
| `chispa` `contagio` `desaliento` `grado` | **no existe** | entrada | no |

La identificación **una ronda = un período = un mes** es lo único que hace comparables los dos modos, y hoy no la sostiene nada. Va con guarda ejecutable (§9).

### 3.3 La cosecha

```ts
export interface CeldaDeCosecha {
  readonly territorioId: string;
  readonly periodo: number;        // 0 = el más viejo de la ventana
  readonly clase: ClaseSenal;
  readonly voces: number;
  /** Actores DISTINTOS. El brillo cuenta personas, no filas (regla 8). */
  readonly actores: number;
  /** Señales sin actor conocido. Sin esto, `actores: 0` miente diciendo «no sé». */
  readonly sinActor: number;
}

export interface Cosecha {
  readonly celdas: readonly CeldaDeCosecha[];   // rala, plana, transferible sin serializar Maps
  readonly periodos: number;
  readonly autoridad: 'declarada' | 'hipotesis';
}
```

`sinActor` es el quinto campo que a `ConteoCelda` de `brillo.ts:21-35` le falta, y no es un detalle: un generador que siempre asigna actor no puede reproducir el estado de celda `sin_actor_conocido`, y hace que **todo barrido sea sistemáticamente optimista sobre la nitidez**.

### 3.4 La procedencia, con sello

```ts
export type Procedencia =
  | { tipo: 'medido';    fuente: string }
  | { tipo: 'declarado'; palanca: string }
  | { tipo: 'derivado';  formula: string; de: readonly string[] }
  | { tipo: 'hipotesis'; sobre: Procedencia; sello: SelloDelModelo };

export interface SelloDelModelo {
  readonly modelo: string;          // 'llama3.1:8b-instruct-q4_K_M'
  readonly digest: string;
  readonly temperatura: number;
  readonly poblacionHuella: string;
  readonly semilla: number;
  readonly generadaEn: number;
}

/** Deriva PROPAGANDO autoridad: si un insumo es hipótesis, el resultado también. */
export function derivarDe(
  de: readonly Magnitud[], valor: number, unidad: string, formula: string,
): Magnitud;
```

`derivarDe` es la regla 6 hecha imposible de violar. Ahí vive además la D5 de la ADR 0009: modelo, digest y dimensiones viajan con **cada magnitud**, no en una nota al pie.

Y hay que tapar el agujero conocido en el mismo movimiento: `RetratoTerritorio.tieneMandato` (`retrato.ts:93`) es un `boolean` pelado — el **único** campo del resultado sin procedencia, la guarda no lo caza porque no es un número, y es justo la afirmación que alguien captura en pantalla («mi provincia tiene mandato»).

### 3.5 El veredicto, y el eje del mandato

```ts
export interface Veredicto {
  readonly hay: boolean;
  readonly voces: Magnitud;
  readonly umbral: Magnitud;
  readonly sostenidos: Magnitud;
  readonly falta: 'ninguna' | 'piso' | 'constancia' | 'las dos';
}
```

No sale un `hay: true` sin las tres magnitudes que lo produjeron, y un `false` dice **por qué** faltó — que es la mitad de la utilidad del instrumento.

Y el mandato deja de ser uno indiferenciado (§1.4):

```ts
export type EjeDeMandato =
  | { eje: 'ninguno' }
  | { eje: 'clase'; clave: ClaseSenal }
  | { eje: 'tipo';  clave: TipoSenal }
  | { eje: 'tema';  clave: TemaClave };
```

`hayMandato()` **no se toca**: se la llama una vez por clave. «Qué mandatos podemos generar» pasa a tener respuesta contable: 4 clases + 9 tipos + 11 temas, por territorio.

### 3.6 La corrida, el barrido y la incertidumbre

```ts
export interface Corrida {
  readonly escenarioId: string;
  readonly paisHuella: string;
  readonly modo: 'forma' | 'gente';
  readonly semilla: number;
  readonly sello: SelloDelModelo | null;   // null en modo forma. No se inventa uno.
  readonly reproducible: boolean;
  readonly resumen: Resumen;               // 5 Magnitudes
  readonly pedido: Forma;                  // lo que se declaró
  readonly logrado: Forma;                 // lo que salió, vía medirForma()
  readonly cobertura: Cobertura;           // regla 5, obligatoria, con sesgo
  readonly mandatos: Uint8Array;           // bitset por territorio en orden canónico
  readonly cosechaHuella: string;          // para rehidratar el Retrato bajo demanda
}
```

`pedido` y `logrado` en la misma estructura es lo que hace comparables los modos. **En modo forma coinciden por construcción — y eso no se esconde, se muestra**: es la limitación principal de ese modo, dicha en pantalla.

Cómo se declara una variable, que es el corazón del barrido:

```ts
export type Distribucion =
  | { forma: 'uniforme' }
  | { forma: 'triangular'; modo: number }
  | { forma: 'lognormal'; mediana: number; sigma: number }
  | { forma: 'discreta'; valores: readonly number[] };

export type Variable =
  | { estado: 'fijada';       clave: ClaveVariable; valor: number }
  | { estado: 'barrida';      clave: ClaveVariable; minimo: number; maximo: number;
      pasos: number; distribucion: Distribucion; razon: string }
  | { estado: 'noConectada';  clave: ClaveVariable; razon: string };
```

Cuatro decisiones sobre las variables, cada una con su motivo:

- **El rango lleva su razón escrita, obligatoria.** Un rango sin razón es un número inventado, y el módulo entero existe para no tener números inventados. Viaja como `declarado`.
- **Los dominios salen de las cotas duras del motor.** `dispersion`, `resistencia`, `constancia` y las composiciones viven en [0,1] porque el motor las clampea ahí (`mandato.ts:12-13`, `reparto.ts`). Muestrear afuera es muestrear el mismo punto muchas veces y bajar la varianza artificialmente. Hay test: el dominio declarado tiene que coincidir con lo que el motor clampea.
- **`participacion` no tiene cota en el motor, así que la cota es epistémica y se declara:** [0, 1.000], con razón —«1.000 cada 100.000 es 1 de cada 100 habitantes; arriba de eso el modelo no describe un país, describe un padrón»— y distribución **lognormal**, no uniforme, porque medí que arriba de 500 el resultado ya saturó y una uniforme tiraría la mitad de las muestras en la meseta.
- **`horizonte` se declara discreto** — `{forma:'discreta', valores:[1/12,3/12,6/12,1,2,3,5,10]}`. `periodosDelHorizonte` hace `round(h × 12)` (`mandato.ts:27`): muestrear continuo produce un zigzag de redondeo que un tornado reportaría como sensibilidad errática. Se mata el artefacto en la declaración, no en el post-proceso.

Y la incertidumbre es un tipo, no un dibujo:

```ts
export type Estimacion =
  | { tipo: 'muestra'; centro: Magnitud; p05: Magnitud; p25: Magnitud;
      p75: Magnitud; p95: Magnitud; minimo: Magnitud; maximo: Magnitud; n: number }
  | { tipo: 'exacta'; valor: Magnitud }
  | { tipo: 'sinDominio'; clave: ClaveVariable; razon: string }
  | { tipo: 'sinDato'; razon: string };
```

`'exacta'` **no es un intervalo de ancho cero**: el motor es determinista, y decir «±0» sugeriría que se midió una varianza y dio cero. `'sinDominio'` es lo que impide el tornado mentiroso — una palanca no conectada no da una barra de largo cero, da una fila gris con su razón. Es la misma disciplina que `brillo.ts:37-39` ya tiene con `sinDenominador`: **nunca un 0 para decir «no sé»**.

Los ejes del barrido llevan la clase de §2.2, y los inaplicables se rechazan en el tipo:

```ts
export type EjeDeBarrido =
  | { clase: 'ajuste';      campo: keyof Ajustes;      desde: number; hasta: number; pasos: number }
  | { clase: 'coeficiente'; campo: keyof Coeficientes; desde: number; hasta: number; pasos: number }
  | { clase: 'forma';       campo: CampoDeForma;       desde: number; hasta: number; pasos: number }  // sólo forma
  | { clase: 'mecanismo';   campo: keyof Mecanismo;    desde: number; hasta: number; pasos: number }  // sólo gente
  | { clase: 'semilla';     cuantas: number };                                                        // sólo gente
```

Métodos que entran: **una por vez** (el tornado, con la monotonía **medida** sobre los puntos intermedios — `creciente | decreciente | noMonotona | plana`, donde `noMonotona` es información de primera clase y no un promedio a esconder), **hipercubo latino** (el principal, con ranking de importancia por correlación de rangos de **Spearman** —no Pearson, porque la respuesta es un escalón y Pearson mide linealidad— y su intervalo por bootstrap sobre las mismas muestras, que es gratis: remuestrear un array no son corridas nuevas), y **bisección de umbral** (§2.8).

### 3.7 El azar

```ts
export interface Azar {
  readonly semilla: number;
  siguiente(): number;
  entero(n: number): number;
  /** Sub-corriente etiquetada: agregar un consumidor NO corre los sorteos de los demás. */
  rama(etiqueta: string): Azar;
}
export function azarDe(semilla: number, ...coords: number[]): number;  // mezclador sin estado
```

Ocho líneas, sin dependencias. Con una sola corriente lineal, agregar un sorteo en cualquier lado corre todos los de abajo y el barrido de ayer deja de ser comparable con el de hoy, **en silencio**.

### 3.8 La población (sólo modo gente)

Tres bloques separados a propósito, porque cada uno tiene un consumidor y un costo distintos.

```ts
/** Lo único que la dinámica lee. 48 bytes por persona, serializado. */
export interface Conducta {
  readonly propension: number;
  readonly constanciaPersonal: number;
  readonly umbralAdhesion: number;
  readonly umbralCorroboracion: number;
  readonly radioAtencion: 'cuadra' | 'barrio' | 'municipio' | 'provincia' | 'pais';
  readonly mezclaTipos: Readonly<Record<TipoSenal, number>>;
  readonly vinculos: readonly number[];
}

/** La textura, que la dinámica NO toca. ~1,9 KB por persona. */
export interface Semblanza {
  readonly texto: string; readonly oficio: string;
  readonly tramoEdad: string; readonly arraigoAnios: number;
  readonly frases: readonly { tipo: TipoSenal; clase: ClaseSenal; texto: string }[];
}

export interface Persona {
  readonly id: number;
  readonly origen: { documento: string; ancla: string; sha: string };
  readonly territorio: { provinciaId: number; departamentoId: number | null;
                         localidadId: number | null; celdaId: string };
  readonly conducta: Conducta;
  readonly semblanza: Semblanza;
}
```

La regla dura, que es la vacuna contra las trece perillas de utilería: **todo campo de `Conducta` que la dinámica no lee, no existe**, y hay un test que mueve cada campo por separado y falla si el resultado no cambia.

`origen` es el `source_entity_uuid` de MiroFish hecho honesto: cada persona dice de qué documento y de qué sección salió, con el sha del archivo. El corpus semilla es **exclusivamente propio del proyecto** —los PLANes, los ensayos, el blog—, nunca texto que escribió gente real: eso sería un uso que la línea de consentimiento no cubre, y no se arregla con un aviso (regla 9).

La separación `Conducta` / `Semblanza` no es prolijidad: es lo que hace que un elenco de 1.000 personas pese **46,9 KB** de conducta (medido: 48 bytes × 1.000) y que las semblanzas —~1,8 MB crudo— vayan en shards pedidos bajo demanda, sin tocar el presupuesto de `.size-limit.json`. **La dinámica no necesita el texto.**

Qué memoria tiene una persona, dicho en vez de prometido: **ninguna en el sentido de MiroFish.** La memoria inicial es prosa dentro de la semblanza. Durante la función, su estado son cuatro números. No hay almacén vectorial. Lo que se guarda de la corrida se llama `rastro_funcion` y es lo que es — no `memoria`, porque nadie la lee durante la corrida.

### 3.9 El esquema `simulacion` (migración 0021)

En disco, que es lo que la web lee sin base y sin API: `content/elencos/<huella>/conducta.bin`, `semblanzas-<n>.json.gz` en shards de 100, y `manifiesto.json` con modelo, digest, semilla, huella del corpus, N, sesgo y fecha.

En Postgres, **esquema `simulacion`, en rama efímera, nunca `public`**: `elencos`, `personas`, `frases`, `funciones`, `senales_ensayadas`, `adhesiones_ensayadas`, `confirmaciones_ensayadas`, `rastro_funcion`, `entrevistas`.

Los CHECK que son la regla 6 hecha esquema, copiados del canon:

```sql
actor_clase text not null check (actor_clase in ('maquina')),   -- no existe el valor 'ia'
constraint rastro_sugerencia_no_mueve_estado_check
  check (tipo_evento <> 'sugerencia_automatica' or estado_nuevo is null),
constraint confirmacion_actor_distinto
  unique (funcion_id, senal_id, ronda, persona_id)
```

Una sugerencia de máquina es **estructuralmente incapaz** de mover un estado. Y sin transacciones (`drizzle-orm/neon-http` lanza `No transactions support in neon-http driver`): cada escritura atómica en una sola sentencia.

Las señales ensayadas llevan todos los campos que la ingesta real exige, **derivados con las mismas funciones**: `claseDe`, `techoDeTipo`, `permisoEfectivo`, `publicLocation`, `habitantesDeCelda`, y la tabla de relojes por tipo. La regla que lo sostiene: *todo campo que la ingesta real exige, el generador lo produce; y todo campo que la ingesta real deriva, el generador lo deriva con la misma función.* Cualquier campo que el generador llene con una constante es una dimensión que el análisis va a reportar como insensible, y va a tener razón.

Dos que casi siempre se falsean y acá son palanca declarada, no default: **`actorId` es nullable a propósito** (§3.3), y **la distribución de `estado` no tiene default** — un corpus sintético todo en `enviada` deja la nitidez del país en `inaplicable`, y todo en `corroborada` dibuja un país verificado.

---

## §4 El comportamiento de cada modo

### 4.1 Modo forma

Construye la cosecha desde la forma declarada. Reusa `repartir()` (`reparto.ts`, resto mayor, cierra exacto, desempates deterministas por voces → población → id) para el eje territorial, `periodosSostenidos()` para el temporal, y la composición declarada para el eje de clase.

Lo que cambia respecto de `retratoSimulado` de hoy: la constancia deja de aplicarse **pareja a todos los territorios** (`retrato.ts:178`), porque ahora hay eje de período y el reparto temporal se hace por territorio.

**Dónde corre:** Web Worker de Vite en el navegador. Está verificado que Vite 5.4.21 saca un worker a su propio chunk con `@v2/civic-core` inlineado, y que `packages/shared/src/seguridad/csp.ts:121` ya declara `worker-src 'self' blob:` por maplibre: cero trámite. Dos trampas: con el `format: 'iife'` por defecto el worker **no puede** hacer `import()` dinámico (no hace falta, sólo importa civic-core); y el archivo necesita `/// <reference lib="webworker" />` más `declare const self: DedicatedWorkerGlobalScope`, porque sin el `declare` el `lib` de `@v2/config-typescript` resuelve `self` al `Window` del DOM y `self.postMessage` **compila y tipa mal**.

**Cuánto cuesta**, medido con el motor real:

| nivel | territorios | ms/corrida | 1.000 corridas |
|---|---|---|---|
| provincia | 24 | 0,0082 | **8,2 ms** |
| departamento | 529 | 0,2033 | 203 ms |
| municipio | 2.082 | 0,8926 | 893 ms |
| localidad | 4.027 | 1,8778 | 1,88 s |
| todas las unidades | 17.986 | 14,5778 | 14,6 s |

Y el corpus medido **no entra en esa cuenta**: con el silencio izado fuera del bucle, todo el O(voces) se paga una vez. Sin izarlo se paga N veces (§1.3).

Presupuesto elegido: **por defecto N = 2.000 con 24 provincias → 16,4 ms**, recorrido entero mientras la persona mueve un dial, con debounce de 200 ms; **botón «afinar» N = 20.000 → 164 ms**, con barra de progreso; **techo duro declarado en 1,2 M territorio-corridas**, arriba del cual el módulo **se niega y explica** con la cuenta a la vista. Negarse con una cuenta es mejor que congelar la pestaña, y es lo que impide que la primera persona que baje a municipio se lleve puesta la herramienta.

### 4.2 Modo gente

#### 4.2.1 Etapa 1 — generar el elenco (una vez)

`scripts/simulacion/elenco-ollama.ts` con `tsx`, `POST 127.0.0.1:11434/api/chat`, `fetch` **inyectado** por constructor. Molde exacto de `scripts/radiografia/embebedor-ollama.ts`, que es el único código del repo que ya le habla a Ollama: mismos errores que enseñan el comando a tipear, misma verificación estricta de la forma de la respuesta, mismo doble determinista para que CI corra sin demonio.

**Corrección al brief: `OllamaCompleter` no existe.** `apps/api/src/lib/ai/` tiene exactamente `anthropic.ts`, `groq.ts`, `index.ts`, `stub.ts` y `types.ts`. La ADR 0009 lo nombra como camino, no como pieza.

Y una trampa verificada que hay que cerrar en el código, no con confianza: `getAICompleter()` elige Groq apenas ve `GROQ_API_KEY` en el ambiente. Un completer local agregado al final de esa cadena **nunca se usaría** en la máquina del dueño, y el corpus saldría a un proveedor externo en silencio — justo lo que la ADR 0009 prohíbe. El generador **pide el completer local explícito y aborta si `completer.local !== true`**.

**La aritmética del costo**, con el prompt real medido (890 tokens de entrada, 575 de salida por persona):

- techo de decodificación: 150 GB/s ÷ 4,92 GB (8B Q4_K_M) = **30,5 tok/s**; al 70 % de eficiencia real, **21,3 tok/s**
- techo de prefill: 7 TFLOP/s ÷ (2 × 8e9 FLOP/token) = **438 tok/s**; al 80 %, **350 tok/s**
- por persona: 890 ÷ 350 = 2,5 s + 575 ÷ 21,3 = 27,0 s → **29,5 s en serie**, **≈ 9,8 s** con `OLLAMA_NUM_PARALLEL=4`

| elenco | tiempo (una sola vez) | conducta en disco |
|---|---|---|
| 200 (para iterar) | **33 min** | 9,4 KB |
| 1.000 (de trabajo) | **2 h 43 min** | 46,9 KB |
| 3.570 (techo de orígenes únicos del corpus) | **9 h 43 min** | 167 KB |

La memoria no es la restricción: 4,58 GiB de pesos + 4 ranuras de 4k × 0,50 GiB = **6,58 GiB**, sobre ~13,5 GiB utilizables de 18 GB. **El reloj es la restricción.**

**Los dos factores de eficiencia (70 % y 80 %) son los únicos números de este documento que no están medidos en esta máquina**, porque Ollama no está instalado — lo verifiqué hoy: `which ollama` no devuelve nada, `curl 127.0.0.1:11434/api/tags` devuelve `000`. Por eso el primer paso del script es `pnpm simulacion:calibrar`, que corre tres prompts reales, mide de verdad, imprime el presupuesto y **pide confirmación** antes de que nadie gaste la tarde. Si el factor real fuera 45 %, el elenco de 1.000 pasa de 2 h 43 a más de 4 h.

#### 4.2.2 Etapa 2 — correr la función (pura, sembrada, sin modelo)

Una ronda = un mes. Por ronda:

1. **Guion.** Se aplican los eventos programados para esta ronda, en orden canónico.
2. **Sorteo de activación en dos pasos** — la idea buena de MiroFish sin su `random` global: cupo de ronda desde `participacion × población ÷ 100.000` modulado por `constancia`, y por persona `azarDe(semilla, ronda, i, ACTIVAR) < propension`. Los activados se procesan **en orden de id**.
3. **Emite.** Tipo según su `mezclaTipos`, sesgada por `composicion` (clase). Elige una de sus frases pregeneradas. Ubica el punto en una calle real de su localidad y lo **engrosa con `publicLocation`** según `precision`/`sensitivity`/`locationRole`. Setea los dos relojes por la tabla del tipo.
4. **Ve.** `radioAtencion` acota qué mira de la ronda anterior: sus vínculos más algunas del territorio, ordenadas determinísticamente. Es el recomendador de OASIS pero territorial en vez de viral, y acotado a O(N·grado) — que es exactamente por qué la función cuesta milisegundos.
5. **Adhiere.** Escribe una **arista**, nunca un contador en la fila: es el antipatrón por el que `mandate_suggestions` fue mirada y rechazada.
6. **Corrobora.** Sólo clase `hecho` y `acto`. Actores distintos, misma celda. Los `deseo` no se corroboran nunca; los `meta` se responden — regla 11.
7. **Cumple.** Un `acto` con fecha se resuelve en su ronda con probabilidad `cumplimiento`. Es la primera vez que esa palanca hace algo.
8. **Cierra.** Emite las celdas `(territorio, período, clase)` de la cosecha.

**Cuánto cuesta**, medido con un prototipo propio de la dinámica (arrays tipados, azar por coordenada, vecindad acotada, grado 8):

| personas | rondas | territorios | ms/función | señales | 1.000 funciones |
|---|---|---|---|---|---|
| 200 | 36 | 24 | **0,181** | 2.517 | 0,18 s |
| 1.000 | 60 | 24 | **1,888** | 20.837 | 1,89 s |
| 1.000 | 60 | 529 | 1,875 | 20.837 | 1,88 s |
| 5.000 | 60 | 529 | 9,155 | 102.794 | 9,16 s |
| 10.000 | 120 | 2.082 | 37,981 | **415.645** | 37,98 s |

Dos lecturas de esa tabla. Primera: el costo es **independiente del número de territorios** (1,888 contra 1,875 ms al pasar de 24 a 529), porque la dinámica es O(N · rondas · grado). Segunda: la fila de abajo emite **415.645 señales, casi cuatro veces el techo de 110.000 del spread** — el `RangeError` de `retrato.ts:141` no es un riesgo remoto para este modo, es la primera cosa que va a romper.

Con las aristas guardadas, la función de 1.000 × 60 pasa de 1,888 a **2,737 ms** (62.963 aristas).

Determinismo y varianza, verificados: misma semilla → **cosecha idéntica**; semilla 7 contra semilla 8 → 20.837 contra 20.523 señales. Hay varianza real para Monte Carlo, y es reproducible.

**El contraste que justifica la arquitectura entera.** Con el LLM adentro del bucle (forma MiroFish), 1.000 agentes × 60 rondas con activación 0,35 son 21.000 agente-rondas × 9,8 s = **57 horas para UN punto** del espacio de parámetros. Con el LLM afuera: 2 h 43 min una vez, y después **1,888 ms por punto**. Para un barrido de 1.000 puntos son **6,5 años contra 2 h 43 min más 1,9 segundos.**

#### 4.2.3 Los dos niveles de fidelidad

**`guionada`** (default): la dinámica elige entre las frases pregeneradas. Cero llamadas al LLM. Es la que barre.

**`improvisada`** (opt-in): el modelo redacta la señal en el momento. **No entra en barridos, y no por una advertencia sino por tipos**: `barrer()` acepta `Funcion<'guionada'>` y nada más. Más un tope duro de 2.000 agente-rondas por corrida, con la cuenta impresa antes de arrancar.

### 4.3 La inyección desde arriba, y por qué no rompe la reproducibilidad

Tres canales, y el tercero MiroFish no lo tiene:

- **Antes:** palancas, semilla y huellas, todo en el hash de la URL con la disciplina de `area-url.ts` — parsear defensivo, devolver el default ante basura, nunca romper la página.
- **Guion:** `Evento = { ronda, que: SembrarSenal | MoverPalanca | Silenciar | SumarResistencia }`. A diferencia de MiroFish —donde `scheduled_events` está declarado y no lo lee ningún script— acá **se leen**, y hay un test que falla si un evento programado no cambia el resultado.
- **En vivo:** el worker se pausa y se le empuja un evento para la ronda siguiente. Y acá está la solución al conflicto entre la vista de dios y la reproducibilidad: **toda intervención en vivo queda escrita en el guion**, así que la función se reproduce entera desde su guion y mirar y tocar no rompe nada.

### 4.4 La entrevista

Una llamada por pregunta: ~800 tokens de rastro adentro, ~200 afuera ≈ **11 s** en serie. Bajo demanda, nunca en el camino de un barrido. El contexto es la semblanza más el rastro de esa persona en esa función, y nada más.

**No contamina, y no por un flag.** MiroFish necesita `interview_record=False` para que preguntar no altere la corrida; acá la función ya está cerrada —sus filas son inmutables, sólo INSERT en tabla aparte, y en el navegador el resultado va `Object.freeze`— y ningún paso de la dinámica lee `simulacion.entrevistas`. No hay dónde escribir aunque quisiera.

Y la línea que va arriba de toda respuesta, que MiroFish no dice: **la persona no tiene razones; la dinámica es aritmética.** Lo que leés es una racionalización que un modelo redacta a posteriori leyendo la ficha y el rastro. Es plausible, no explicativa. Esa diferencia es la diferencia entera entre un instrumento y un juguete de adivinación.

Las entrevistas no salen por ninguna API pública y no entran en un reporte publicable: son la bitácora del agente, y la regla 3 vale igual.

---

## §5 La espina y la comparación

### 5.1 `medirForma` — el pivote

```ts
export function retratar(cosecha: Cosecha, esc: Escenario, pais: Pais): Retrato;
export function medirForma(cosecha: Cosecha, pais: Pais): Forma;
```

`medirForma` corre sobre las dos cosechas con el mismo código:

- `participacion` = voces ÷ población × 100.000
- `dispersion` = dónde cae el reparto real entre la base concentrada y la proporcional
- `constancia` = períodos con voz ÷ períodos de la ventana
- `composicion` = voces por clase ÷ total

En modo forma, `medirForma(modoForma(esc, pais, null))` tiene que reproducir `esc.forma`. **Eso es una guarda, y caza un bug que ya existe**: `repartir()` garantiza que la suma cierra exacta sobre **todos** los territorios, pero `armarRetrato()` después descarta los de población ≤ 0 vía `separarSinDato()` (`retrato.ts:32-43`), y `pesosConcentrado()` los incluyó en el sorteo. Con `dispersion: 0` y un territorio sin población que tenga voces base, el total entero desaparece: las voces se pierden y `sinDato` dice «no hay denominador» sin decir que ahí se fue el total. Una guarda, dos defectos.

### 5.2 El resto — la pantalla que sólo este módulo puede tener

```ts
export function calcularResto(gente: Corrida, pais: Pais): Resto;
```

Cuatro pasos: corrés gente; `medirForma` sobre su cosecha; corrés forma **con esa forma medida como entrada**; restás los retratos. Dos corridas: 1,888 ms + 0,0082 ms.

Las tres lecturas, y las tres son útiles:

- **Resto chico** → *la fórmula alcanza para esta pregunta.* Usá el modo forma, barré mil veces, no enciendas Ollama. Es un resultado **positivo**, no un fracaso del modo gente.
- **Resto grande** → *el agregado esconde algo*, y el mapa del resto dice **dónde** — que es la respuesta útil, no el escalar.
- **Nunca** → «los agentes tienen razón». Los dos son modelos. El resto mide su desacuerdo, no la verdad. La única cosa medida en toda la pantalla sigue siendo el silencio.

### 5.3 Qué NO se comparte, y por qué

Se declara en vez de forzarse:

1. **La población.** El modo forma no tiene ninguna, y darle una falsa para «unificar» sería inventar exactamente lo que el otro modo existe para modelar. `Poblacion | null`, y el `null` se ve.
2. **La dinámica por ronda.** El modo forma **construye** una cosecha; no la hace evolucionar. Darle un bucle de rondas de mentira sería mentir sobre qué es.
3. **Las variables de mecanismo.** No tienen dónde entrar: deshabilitadas con su razón, no ausentes.
4. **El corpus semilla.** Sólo el modo gente lee PLANes, ensayos y blog. La decisión S4 —«el motor no depende del corpus de PLANes»— sigue siendo verdad del modo forma, y ésa es su virtud.
5. **La entrevista.** No hay a quién preguntarle en el modo forma. «¿Por qué pusiste 400 voces en Chaco?» → «porque la fórmula lo dijo» no es una entrevista, es leer el código en voz alta.
6. **La varianza.** El modo forma no tiene ninguna (medido: dos corridas idénticas dan resultado byte a byte igual). El modo gente sí (20.837 contra 20.523 señales entre semillas). Las barras de error aparecen en un modo y no en el otro, y **eso no significa que el modo forma sea más certero: significa que es un modelo incapaz de dudar.** Se dice así, en pantalla.
7. **El runtime.** Modo forma: worker, página pública. Modo gente: script local contra Ollama, **nunca** una página pública. Son un módulo en los tipos y en el formato del resultado; **no** en el despliegue.
8. **`public.senales`.** El modo forma no escribe nada. El modo gente escribe en el esquema `simulacion`, físicamente aparte.

---

## §6 Lo que se rompe

### 6.1 Los seis arreglos que el barrido convierte de molestia en bloqueante

| # | Dónde | Qué pasa hoy | El arreglo |
|---|---|---|---|
| 1 | `useModoSimulacion.tsx:62` | `Date.now()` adentro de un `useMemo` que depende de `palancas`; 1 ms voltea el mandato del silencio (§1.5) | `ahora` sale de `Pais` y se congela una vez |
| 2 | `retrato.ts:98`, `retrato.ts:141`, `coropletico.ts:96` | `RangeError` a los 110.000 valores; el modo gente emite 415.645 (§4.2.2) | tres `for` con acumulador, tres líneas cada uno |
| 3 | `reparto.ts` + `retrato.ts:32-43` | el reparto cierra exacto y el retrato tira las voces de los territorios sin población (§5.1) | repartir sólo entre los `utiles`, y registrar lo perdido en `SinDato` como Magnitud |
| 4 | `retrato.ts:104-109` | el silencio declara `derivado(..., de: ['constancia','horizonte'])` — dos palancas que `retratoMedido` no mira | `armarRetrato` ya recibe `esMedido`: ramificar la etiqueta igual que ramifica `marcar()` |
| 5 | `retrato.ts:93` | `tieneMandato` es el único campo del resultado sin procedencia, y es el que la gente captura | pasa a `Veredicto` (§3.5) |
| 6 | `retrato.ts:98` | `persistencia` es un máximo: un territorio fija la del país en 1,0 (§2.3) | promedio ponderado por población; el máximo se publica aparte y rotulado |

### 6.2 Lo que cambia de forma y arrastra call sites

- **`Palancas` se parte** en `Forma` + `Ajustes` + `Mecanismo`. Arrastra `PALANCAS_INICIALES` (`simulacion/palancas.ts`), `PanelPalancas.tsx`, `useModoSimulacion.tsx` y `coeficientes.test.ts`.
- **`composicion` pasa de `Record<TipoVozCivica, number>` (6) a `Record<ClaseSenal, number>` (4).** El compilador hace la migración solo y ruidosamente: no hay `Partial` ni índice suelto en el camino. Arrastra `ChipTipo.tsx`, `paleta.ts`, `el-mapa-data.ts` y los literales de composición de cuatro archivos de test.
- **`Procedencia` gana una variante.** La importan **dos apps**, así que `esMagnitud` (`procedencia.ts:46-57`), la guarda de números huérfanos y la rama de `Cifra.tsx` se actualizan **en el mismo commit**. Media migración deja números de modelo que la guarda no caza y que en pantalla se ven idénticos a un derivado verificable.
- **`RetratoTerritorio.tieneMandato: boolean` → `Veredicto`.** Arrastra `coropletico.ts` (que hace `tieneMandato ? 1 : 0` para maplibre).
- **Las tres copias del `?? 'valor'`** (`el-mapa-data.ts:10`, `paleta.ts:35`, `mandato-regimen.ts:46`) se borran en el mismo movimiento que la migración del vocabulario.
- **`simular()` NO se rompe:** se conserva como implementación de referencia, y hay un test que afirma que `retratar(modoForma(...))` le da bit a bit lo mismo (§9.2). Sin ese test, izar el silencio es una divergencia esperando pasar y el instrumento mediría otro motor que el mapa.

### 6.3 Los tests de calibración se re-basean, y ése es el momento peligroso

Arreglar `persistencia` cambia los dos tests de calibración de la spec previa —«el que sostiene le gana al que grita» y «contra la resistencia, la voz gana en todos lados»—. Se re-basean **preguntando si la lección sigue en pie**, no ajustando el número esperado. Si la lección se cae, la lección era falsa y hay que decirlo: para eso existen esos tests.

---

## §7 Contra la Constitución, regla por regla

**1 · Offline-first, nunca offline-only.** El módulo no requiere la API para correr: el elenco, su huella y los escenarios viven en la máquina que los corre, y el barrido corre en un worker sin red.

**2 · Ubicación exacta privada; lo público usa precisión reducida.** Una señal ensayada lleva `precision`, `locationRole` y `sensitivity`, y pasa por `publicLocation` **antes** de dibujarse, igual que una real. Si el generador escribiera puntos exactos, la Simulación sería el único lugar del sistema donde la política de ubicación no aplica — y el que más filas tendría.

**3 · Bitácora y reflexión personal nunca se publican.** La transcripción de una entrevista **es** la bitácora del agente: se queda local, no va a un reporte publicable, no sale por ninguna API.

**4 · Una señal siempre muestra su estado de calidad.** Una señal ensayada sin `estado` no se puede dibujar. Y los estados vienen apareados con la clase: un `sueño` en `corroborada` es un par que no existe. Es lo que obliga a que la clase entre al generador y no sea decoración (§3.9).

**5 · Participación ≠ representatividad; toda síntesis muestra cobertura y sesgo.** `Corrida.cobertura` es obligatoria en la estructura, no opcional. Y lo específico de este módulo: **la población que genera el modelo tiene el sesgo del corpus con que se la sembró** —una sola voz, la del proyecto— y ese sesgo viaja como campo declarado, calculado con `coverage.ts`, y es **la primera pantalla** del modo gente, antes de cualquier resultado. Además el arreglo #6 de §6.1 es esta regla: un agregado nacional dominado por un único territorio la violaba.

**6 · La IA puede sugerir; nunca determina la verdad de una señal.** → §7.1, en detalle.

**7 · No hay ranking público individual ni puntaje ideológico.** Los rankings del módulo son por territorio. Una persona sintética **no** lleva un score ideológico rankeable: eso sería construir el objeto que la regla prohíbe, con la excusa de que es simulado.

**8 · Premiar utilidad, corroboración, cobertura difícil y resolución; no volumen bruto.** Ya es estructural: la cosecha cuenta `actores` distintos, no filas. Para el barrido significa que «más voces» no puede ser la única salida buena, y el test de calibración «el que sostiene le gana al que grita» es esta regla escrita como test.

**9 · Consentimiento comprensible y revocable.** La población **no se siembra con texto que escribió gente real**. El corpus semilla es propio del proyecto, cuyo autor es el proyecto.

**10 · Tiene que funcionar en máquinas modestas.** Es la restricción que ordena la arquitectura: la dinámica corre en el navegador (16,4 ms el barrido por defecto); la generación con LLM **nunca**. Es lo que fuerza el corte población-congelada / dinámica-barata, y lo que hace que ese corte no sea negociable.

**11 · Los hechos se corroboran; los sueños y propuestas se deliberan.** La clase gatea qué máquina corre cada señal ensayada. Y ver §8.3: la deliberación **no se modela**.

**12 · Compartir una faceta no publica la entrada privada.** Un escenario compartido por URL lleva las palancas, la semilla y las **huellas**; nunca los textos de la población ni la base.

**El propósito («no busca retener atención»).** El módulo es una herramienta de trabajo: sin leaderboard, sin notificaciones, sin rachas.

### 7.1 La regla 6, traducida a algo concreto en el dato y en la pantalla

Lectura operativa: **todo lo que produce un modelo es una hipótesis sobre una población posible, jamás un hecho del país.** Y el criterio operativo, en una línea que el repo ya escribió: *la diferencia entre que la IA sugiera y que determine es, literalmente, que la sugerencia se pueda revertir.*

**En el dato:**

1. **Separación física, no un flag** (§2.10).
2. **Los CHECK del §3.9**: no existe el valor `'ia'` en `actor_clase`, y una `sugerencia_automatica` no puede traer `estado_nuevo`. Lo garantiza el motor de la base, no la buena voluntad.
3. **La respuesta humana es un evento aparte**, apuntando a la sugerencia por id. Efecto lateral gratis: la precisión del modelo se calcula desde el rastro, sin instrumentar nada, y su error queda auditable.
4. **El modelo escribe pocos campos y están enumerados.** Escribe `texto`, `titulo`, `tema` (con `temaOrigen = 'sugerido'`) y los atributos de la persona. **Nunca** `tipo`, `clase`, `estado`, `precision`, `locationRole`, `sensitivity` ni la geografía: ésos los asigna la regla del generador y la semilla, porque son exactamente los campos que deciden si algo es corroborable.
5. **La procedencia viaja con cada magnitud** (§3.4), y una voz ensayada es `hipotesis`, **jamás `medido`**: nada la midió.

**En la pantalla:**

6. **Reversible = sugerencia.** La lista de personas **se edita antes del barrido**, y editar produce un elenco derivado con `padre: <huella>`. Si no podés editar la población, el modelo la determinó.
7. **La palabra.** Nunca «el país dice»; siempre «una población generada dice». Las magnitudes `hipotesis` no comparten tratamiento visual con `medido` en ningún lado, y llevan su `NotaDemo` con texto propio: «población generada por un modelo, no medida».
8. **La cortina es asimétrica y se ve.** En modo gente compara un silencio **medido** contra una voz **hipotética**. El lado del silencio nunca es `hipotesis`, y eso es una guarda (§9.1).
9. **El reporte no lo escribe un modelo libre.** Es una plantilla de huecos tipados `{{magnitud:alcance}}` donde el modelo llena **sólo el texto de unión**, y una guarda rechaza el reporte si contiene un dígito fuera de un hueco. La idea de MiroFish de que el reporte interrogue el resultado se conserva; lo que no se conserva es dejarlo redactar números, porque un modelo que escribe prosa sobre cifras produce cifras sin procedencia.

---

## §8 Lo que NO hace

**8.1 No pronostica.** Ni el modo forma ni el modo gente dicen qué va a pasar. Dicen qué pasaría **si** valieran los supuestos declarados. La franja fija al pie lo dice con esas palabras.

**8.2 No resuelve representatividad, y prometerlo sería el error caro.** El modo forma contesta «cuántas voces hacen falta acá» con precisión defendible. No contesta «qué pasaría si hablaran los que hoy no hablan y no se parecen a los que hablan»: eso necesita una población con estructura, y aun así el modo gente sólo contesta *bajo el sesgo de su corpus*. Si la pantalla sugiere lo contrario, el primer crítico hostil no se lleva puesta la Simulación: se lleva puesto el mapa, que sí es honesto.

**8.3 No modela la deliberación, porque el producto no la tiene.** Un `deseo` recibe adhesiones y nada más. Simular un mecanismo inexistente sería el módulo enseñando algo falso sobre el propio producto — peor que un número sin etiqueta, porque suena a información.

**8.4 No mide la incertidumbre del modelo.** Lo único que el barrido puede medir es la dispersión que produce **el rango que la persona declaró**. Que el piso sean 100 voces cada 100.000, que el período sea el mes, que tres meses sea el mínimo: eso no se estima con corridas, se **declara** barriendo los coeficientes. Si la banda p05–p95 pasara por intervalo de confianza de un pronóstico, el módulo mentiría por omisión.

**8.5 No hace Sobol ni Morris todavía**, y el motivo no es el costo: Sobol de primer orden y total con k=7 y N=5.000 son 45.000 corridas ≈ **369 ms** a nivel provincia, cabe de sobra. El motivo es que descompone varianza, y con dos palancas muertas y una que aporta ruido de redondeo, buena parte de esa varianza sería artefacto. Entra cuando las siete estén vivas.

**8.6 No construye el canon.** `senales`, `actores`, `adhesiones`, `confirmaciones` y `rastro_senal` no existen. Este módulo escribe `civic-core/src/senal/vocabulario.ts` —que sí hace falta y hoy tampoco existe— y **no** presupone las tablas.

**8.7 No guarda escenarios en el servidor.** El estado citable vive en el hash de la URL y en un `.json` que se baja.

**8.8 No corre el modo gente en producción.** ADR 0008.

---

## §9 Verificación

### 9.1 Las guardas, que son tests y no párrafos

| Guarda | Qué afirma | Por qué existe |
|---|---|---|
| **sin números huérfanos** | ningún `number` fuera de una `Magnitud` en `Corrida` ni en `ResultadoBarrido` | la que ya existe, extendida a correr sobre **varias** entradas y no una sola: una rama que devuelva un número pelado sólo bajo ciertas palancas no la caza hoy, y un barrido recorre miles de combinaciones |
| **el silencio es sordo** | mover toda variable no cambia el lado medido | S3, la tesis del módulo |
| **el silencio nunca es hipótesis** | ninguna magnitud del silencio lleva `tipo: 'hipotesis'`, en ningún modo | lo que hace que la cortina pruebe algo (§7.1.8) |
| **no hay lavado de procedencia** | `derivarDe` con un insumo `hipotesis` devuelve `hipotesis` | el agujero obvio de la cuarta variante (§2.4) |
| **el barrido equivale al motor** | `retratar(modoForma(esc,pais,null))` = `simular({palancas,base,territorios})` sobre una grilla | sin esto el instrumento mide otro motor que el mapa (§6.2) |
| **`medirForma` es identidad en modo forma** | `medirForma(modoForma(esc,...))` reproduce `esc.forma` | caza la fuga de voces del reparto (§5.1) |
| **una ronda es un período** | `rondas === periodosDelHorizonte(ajustes.horizonte)` | lo único que hace comparables los modos (§3.2) |
| **la huella no cambió** | todas las corridas de un barrido comparten `poblacionHuella` | el error central del §1.2, que no da error |
| **ninguna palanca es utilería** | por cada variable conectada, moverla sola cambia el resultado | las trece perillas de MiroFish (§1.6); `composicion` y `cumplimiento` entran **en rojo** hasta conectarse |
| **todo campo de `Conducta` se lee** | mover cada campo por separado cambia la cosecha | la misma lección, del lado de la población |
| **el guion se lee** | un evento programado cambia el resultado | `scheduled_events` de MiroFish, que no lo lee nadie |
| **el dominio es el del motor** | el `DOMINIOS` declarado coincide con lo que el motor clampea | muestrear afuera baja la varianza artificialmente (§3.6) |
| **cero azar sin semilla** | `Math.random` no aparece en el fuente de `civic-core` | §2.7 |
| **el reporte no inventa números** | el reporte no contiene un dígito fuera de un hueco tipado | §7.1.9 |

### 9.2 Cómo se corre

`pnpm verify` —`check` + `check:routes` + `build`— más `pnpm test`, que ya incluye `test:scripts`. Las guardas viven en `packages/civic-core/src/__tests__/` junto a las de hoy, y la del generador corre con un doble determinista: **CI no necesita Ollama**, igual que `embebedor-ollama.test.ts` corre sin demonio porque recibe el `fetch` por inyección.

### 9.3 Lo que hay que medir antes de comprometerse

**`pnpm simulacion:calibrar`** convierte la única sección estimada de este documento (§4.2.1) en medición: corre tres prompts reales contra el modelo local, imprime tok/s de prefill y de decodificación, calcula el presupuesto del elenco pedido y pide confirmación. Vale una hora, y es lo que evita prometer «5.000 personas en una noche» sobre dos factores de eficiencia que nadie midió en esta máquina.

---

## §10 El orden de implementación

Cada rebanada deja algo que corre. La primera es la que tiene que estar al final de esta corrida.

### Rebanada 1 — La espina y el instrumento que contesta la primera pregunta ← **esto corre al final de esta corrida**

**Qué se entrega, y funciona:** la página `/la-simulacion` en **modo forma**, sobre las 24 provincias, en un worker, **sin Ollama, sin base y sin dependencias nuevas**, contestando la pregunta del §2.8: *«¿a partir de cuántas voces cada 100.000 habitantes gana mandato cada provincia?»*, con el tornado y la nube al lado para que el escalón se vea.

En orden:

1. **Los seis arreglos de §6.1**, con sus tests. Son la base de todo lo demás y son chicos.
2. **`espina/`**: `azar.ts`, `escenario.ts`, `cosecha.ts`, `forma.ts`, `veredicto.ts`, `retratar.ts`, `corrida.ts`. Puro.
3. **`modo-forma.ts`** produciendo `Cosecha`, más la guarda de equivalencia contra `simular()`.
4. **`barrer.ts`** con el contexto izado (silencio y voces base fuera del bucle: ×5,1 medido con el corpus lleno), `metodos/oat.ts`, `metodos/muestreo.ts`, `metodos/umbral.ts`, `variables.ts`, `estimacion.ts`, `diseno-serie.ts`.
5. **El worker** y la página, con sus secciones: cabecera de procedencia, mesa de variables con entrada numérica editable, tabla de umbrales, tornado, nube, ficha de corrida.
6. **`/el-mapa` pasa a leer un `Escenario` de la URL** y sigue funcionando igual.

**Lo que NO entra en la 1:** la cuarta procedencia (el modo forma no la necesita, y ése es el argumento para hacerlo primero), el vocabulario nuevo, la población, el esquema `simulacion`, Ollama.

### Rebanada 2 — El vocabulario al canon, y `composicion` conectada

`civic-core/src/senal/vocabulario.ts` con los nueve tipos y las cuatro clases; mueren las tres copias del `?? 'valor'` y la copia duplicada de `tipos-voz.ts`; `composicion` pasa a `Record<ClaseSenal, number>` y **el motor la lee**, con su guarda «ninguna palanca es utilería» pasando de rojo a verde. El orden importa y es el del §2.6: **primero migrar, después conectar.** Al final de esta rebanada el barrido gana una dimensión real y el eje del mandato por clase se vuelve computable.

### Rebanada 3 — La incertidumbre declarada y el barrido completo

LHS, Spearman con bootstrap, `Estimacion` con sus cuatro variantes dibujadas cada una a su manera, los coeficientes barribles bajo el rótulo «decisiones nuestras, no de la gente», compartir por URL, y el techo duro que se niega con la cuenta a la vista.

### Rebanada 4 — La población

`scripts/simulacion/calibrar.ts` **primero**; después `elenco-ollama.ts` con el completer local explícito, el `EscritorFalso` determinista, y los dos elencos demo versionados (`demo-fabricado-200`, que corre en CI y cuyo texto es obviamente sintético, y `demo-ollama-200`, generado una vez y commiteado: 9,4 KB de conducta más los shards). La ficha de persona con su origen linkeable al PLAN, ensayo o post. Al final de esta rebanada hay elenco y no hay dinámica todavía: se puede mirar la población y su sesgo, que es la pantalla que la regla 5 exige antes que ningún resultado.

### Rebanada 5 — El modo gente

La cuarta procedencia con su sello y sus tres guardas, `modo-gente.ts` con la dinámica de las ocho fases, el guion, y la migración `0021` del esquema `simulacion` **en rama efímera de Neon**, verificando el host antes de escribir una fila. El barrido acepta `Funcion<'guionada'>` y nada más.

### Rebanada 6 — El resto y la entrevista

`calcularResto`, la pantalla de los dos retratos con su frase de conclusión, la entrevista anclada al rastro con su affordance de descartar, y el reporte de huecos tipados con su guarda.

---

## §11 Los archivos

**Nuevos en `packages/civic-core/src/simulacion/espina/`:** `azar.ts` · `escenario.ts` · `cosecha.ts` · `forma.ts` · `veredicto.ts` · `retratar.ts` · `corrida.ts` · `variables.ts` · `estimacion.ts` · `barrer.ts` · `diseno-serie.ts` · `resto.ts` · `metodos/oat.ts` · `metodos/muestreo.ts` · `metodos/umbral.ts`

**Nuevos en `packages/civic-core/src/simulacion/`:** `modo-forma.ts` · `modo-gente.ts` · `poblacion.ts`

**Nuevo en `packages/civic-core/src/senal/`:** `vocabulario.ts`

**Nuevos en `apps/web/src/pages/`:** `LaSimulacion.tsx` y `LaSimulacion/sections/` (`CabeceraDelDiseno` · `MesaDeVariables` · `Variable` · `TablaDeUmbrales` · `Tornado` · `Nube` · `FichaDeCorrida` · `ElResto` · `FichaDePersona` · `ElElenco`), más `LaSimulacion/barrido.worker.ts` · `usarBarrido.ts` · `diseno-url.ts` · `nube-pintor.ts`

**Nuevo en `apps/web/src/components/papel/primitives/`:** `TablaPapel.tsx` (promoción de `ListaDeNucleos`, que hoy vive dentro de una página)

**Nuevos en `scripts/simulacion/`:** `calibrar.ts` · `elenco-ollama.ts` · `completer-ollama.ts` · `escritor-falso.ts`

**Nuevo en `packages/db/migrations/`:** `0021_simulacion.sql`, y `packages/db/src/schema/simulacion.ts`

**Modificados:** `simulacion/procedencia.ts` · `retrato.ts` · `reparto.ts` · `tipos.ts` · `coeficientes.ts` · `apps/web/src/pages/ElMapa/instrumento/modos/useModoSimulacion.tsx` · `simulacion/PanelPalancas.tsx` · `simulacion/palancas.ts` · `simulacion/coropletico.ts` · `simulacion/Cifra.tsx` · `ElMapa/el-mapa-data.ts` · `ElMapa/instrumento/paleta.ts` · `ElMandatoVivo/mandato-regimen.ts` · `components/papel/primitives/ChipTipo.tsx` · `app-pages.tsx` · `app-routes.tsx` · `layouts/papel-routes.ts` · `components/papel/papel-nav.ts` (sólo la franja del footer) · `.size-limit.json`

**Borrados:** `apps/web/src/lib/tipos-voz.ts` y su test — comparan dos copias que dejan de existir.
