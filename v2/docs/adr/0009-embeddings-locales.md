# ADR 0009 — El texto no sale: embeddings y clasificación con Ollama local

**Status:** Accepted · 2026-08-13 · **supersede a `0006-xenova-transformers-status.md`**
**Decisión del dueño, 13/8/2026:** *el texto que escribe la gente no se manda a Groq ni a
ningún proveedor externo, nunca.* Todo lo que sigue es la consecuencia de esa frase.
**Fuente:** la ADR que pide `docs/specs/2026-08-12-la-radiografia.md` §9. Gatea las Tasks 9 y 10
de `docs/plans/2026-08-12-la-radiografia-motor.md`.

## Contexto

La Radiografía mide **convergencia**: cuánto se parece lo que una persona escribió a lo que
escribió otra. La spec descarta el motor de v1 —listas de palabras a mano, que deciden de
antemano de qué puede tratarse el país (§1.2)— y pone embeddings semánticos en su lugar (R1).
Eso obliga a elegir de dónde salen los vectores.

`docs/adr/0006-xenova-transformers-status.md` ya había contestado esa pregunta en mayo, y la
contestó **Defer**: v2 no depende de `@xenova/transformers`, y si algún día hacen falta
embeddings, *«reach for a provider API first»*. La 0006 no era una corazonada: dejó escrito un
gatillo de reapertura con tres condiciones y pidió que se cumplieran **todas**.

### El agujero del borrador del 12/8, que es la razón de esta versión

La versión anterior de este documento decidía que *«el texto de `senales` no sale de nuestra
infraestructura»* y **en el mismo párrafo** aceptaba que el clasificador de `tema` siguiera
yendo a Groq, como si fueran dos cosas separadas. No lo son: son **las mismas filas y el mismo
texto**. `classifySignal(body)` arma `{ role: 'user', content: body }` y se lo pasa al
proveedor, una llamada por fila (hecho 3). Una plataforma que embebe localmente y clasifica
contra un proveedor no protegió nada: mandó afuera el texto entero, sólo que por otra puerta.

La premisa era falsa, así que el alcance cambia. Esta ADR no decide «de dónde salen los
vectores»: decide **que el texto no sale**, y después ordena todo lo que tocaba esa frase.

### Lo que se verificó en el código, no se supuso

1. **No hay nada instalado ni nada que migrar.** `grep -i "xenova|transformers"` sobre v2
   devuelve sólo documentos: `CLAUDE.md`, la 0001, la 0006, dos specs y el plan del motor. Cero
   líneas de código. `grep -i ollama` devuelve **cero**, incluidos los documentos. Se arranca en
   limpio en las dos direcciones.
2. **El camino de proveedor existe y funciona.** `apps/api/src/lib/ai/` tiene `GroqCompleter`,
   `AnthropicCompleter` y `StubCompleter` detrás de la interfaz `AICompleter`, elegidos por
   variable de entorno en `index.ts`. La 0006 no apuntaba a un fantasma.
3. **Y ese camino lleva hoy texto escrito por gente a un proveedor.**
   `apps/api/src/features/mandato/classifier.ts:53-61` le pasa el `body` crudo de una señal a
   `getAICompleter().complete(...)`; `cron.ts` lo llama en lotes de 50 con concurrencia 4, **una
   llamada de LLM por fila**. Y no es una tabla de paso: la spec B (línea 121) dice que
   `pulse_signals` sale del mapa y que **el cron pasa a leer `senales`** — la misma tabla que La
   Radiografía va a embeber.
4. **El clasificador de `tema` de la spec B corre por el mismo caño.** §2.11 fija catálogo
   cerrado de **once claves** (`alimento`, `vivienda`, `trabajo`, `cuidado`, `salud`,
   `educación`, `ambiente`, `movilidad`, `seguridad`, `cultura`, `democracia`), cola gobernada
   por `tema_intentado_en`, escritura sólo con `tema_origen = 'sugerido'` y reversión por
   `PATCH /senales/:id/tema`. Toda esa maquinaria está escrita **suponiendo una llamada de LLM
   por fila** —incluido el argumento del «presupuesto quemado»— y esa spec la implementa otra
   sesión.
5. **La política de privacidad declara menos de lo que el código hace.**
   `content/legal/privacidad.mdx:97` publica la fila «Groq / Anthropic — el texto de tus
   conversaciones con el asistente». El hecho 3 muestra que también sale texto que **no** es una
   conversación con el asistente. Es una afirmación publicada que el código no respalda del todo.
6. **La guardia de dependencias no vería un paquete de `scripts/`, y hoy hay aire.**
   `scripts/build/deps.ts` cuenta la unión de `dependencies` de `apps/*` y `packages/*`;
   `scripts/` **no tiene `package.json`**. `pnpm deps:check` hoy: **39 de 45** en plataforma
   (techo duro 60 de `CLAUDE.md`) y **48 de 52** en móvil.
7. **`packages/civic-core` no tiene una sola dependencia.** Su `package.json` no tiene bloque
   `dependencies` y su propia descripción dice *«lógica pura, sin dependencias»*. Por eso la spec
   §4.1 deja ahí **sólo el puerto** `Embebedor` y manda la implementación a `scripts/`.
8. **No hay dónde meter un modelo en producción.** La 0008 fijó que `apps/api` corre como
   función de Vercel servida desde un bundle de esbuild (D1, D7). No queda proceso largo, ni
   disco, ni presupuesto de cold start.
9. **El repo ya depende de un binario que no está en el árbol, y lo documenta.**
   `scripts/build/mapa/extraer-teselas.ts` exige `brew install pmtiles` —*«una sola vez»*, dice
   su README— y el README explica además por qué eso no puede ser un cron de Vercel. El
   precedente de «una herramienta afuera del árbol, con el comando escrito» existe y funciona.
10. **`scripts/` ya tiene suite propia y corre en CI.** `pnpm test:scripts`
    (`scripts/vitest.config.ts`) está adentro de `pnpm test`, que está adentro de `pnpm verify`.
    Un test de `scripts/` corre en cualquier máquina, sin nada instalado.
11. **El corpus de hoy es cero.** `D-002` cerró el 2/8/2026 borrando las doce filas de
    demostración, y al buscar datos reales encontró que v1 en producción tiene **una sola voz**.
    Cualquier comparación de costo o de calidad se hace sobre un volumen que no existe.
12. **De lo que hoy escribe el clasificador, `topics` no lo lee nadie y `sentiment` sí sale
    publicado.** `topics` se escribe en `pulso.ts:74` y no aparece en ninguna lectura.
    `sentiment` alimenta `territory_mandates.sentiment` y llega a la web, donde ya está tipado
    **`sentiment: number | null`** (`apps/web/src/lib/queries/mandato.ts:11`).

## El gatillo de la 0006, condición por condición

La 0006 pide que se cumplan **las tres**. Se cumplen dos, y una de ellas apunta en contra.

**Condición 1 — «a concrete v2 feature names embeddings as the right primitive». Se cumple.**
`docs/specs/2026-08-12-la-radiografia.md` R1 nombra los embeddings como la primitiva y §1.2
explica por qué el diccionario de v1 no se porta. No es un «estaría bueno»: es la spec de una de
las cuatro superficies de la constitución de producto, con su plan escrito.

**Condición 2 — «provider-API embeddings have been priced … and the cost is non-prohibitive».
Se cumple, y se cumple EN CONTRA de esta ADR.** Una API de embeddings de proveedor está en el
orden de **US$0,02 por millón de tokens**. Con el corpus de hoy (hecho 11), y con cualquier
corpus que esta plataforma alcance en un año, eso es indistinguible de gratis. La condición no
está redactada como una puerta que se abre cuando la API sale cara: está redactada para
confirmar que **la API es viable**, y lo confirma. La 0006 remata la idea con todas las letras:
*«reach for a provider API first»*.

Dicho sin maquillaje: **si esta decisión se tomara por costo, la respuesta correcta sería la API
de proveedor.** No se toma por costo.

**Condición 3 — «a privacy or latency requirement specifically rules out provider embeddings».
No existía, y esta ADR es la que la crea.** No estaba escrita el 11/5/2026, no apareció después
escondida en ningún lado, y no se descubrió midiendo nada. Es una **decisión de producto**
tomada por el dueño el 13/8/2026, asumida acá con nombre y fecha.

El argumento es corto. Una plataforma cuya invitación es escribir **¡BASTA!** sobre el propio
gobierno le está pidiendo a alguien que ponga por escrito una queja política identificable — lo
que la Ley 25.326 llama dato sensible. Que ese texto no viaje a un tercero no es una
optimización: es parte de lo que la plataforma ofrece, y **poder decirlo en la política de
privacidad es un activo del proyecto**. La regla 9 de la constitución —consentimiento
comprensible y revocable— se sostiene mucho mejor sobre un texto que nunca salió que sobre una
casilla que autoriza una transferencia internacional a un proveedor que la persona no eligió y
del que no puede revocar nada.

La latencia no juega: el job corre fuera de banda (R3) y podría tardar horas sin molestar a
nadie. Quien quiera reabrir esta ADR tiene que discutir con la condición 3 y con nada más.

## El scorecard que la 0006 pedía

La 0006 dejó pedido que, cuando llegara la fase, se evaluara *«provider-API embeddings vs. local
inference **on the same scorecard**»*. Acá está, con el eje que más incomoda incluido.

| Eje | API de proveedor | Ollama local (esta ADR) | `@xenova/transformers` (el borrador) |
|---|---|---|---|
| **Texto que viaja** | Todo el corpus, fila por fila | **Ninguno** | Ninguno |
| **Costo monetario** | ~US$0,02 / M tokens ≈ nada | $0 | $0 |
| **Calidad de los vectores** | Modelos punteros, mejores en promedio | `bge-m3`, 1024 dim, multilingüe denso | El mismo `bge-m3`, si hay pesos ONNX |
| **Latencia por corrida** | Red, con límites de tasa | CPU/GPU local, minutos | CPU local, minutos |
| **Peso en el árbol del repo** | 0 | **0** — el modelo vive en el demonio | ~100 MB de pesos cacheados + entrada de `.gitignore` |
| **Dependencias que suma** | 1 (SDK o `fetch`) | **0** — `fetch` contra `127.0.0.1` | 1 `devDependency` de la raíz |
| **Qué hay que instalar a mano** | Nada | El demonio, una vez por máquina | Nada |
| **Corre en CI sin nada instalado** | Con clave y red | **Sí, contra fetch simulado** | Sí, bajando los pesos |
| **Reproducibilidad** | Versión del modelo del proveedor, opaca | Tag + digest del modelo, anotados por corrida | Lockfile + hash de pesos |
| **Qué hay que decir en privacidad** | Ensanchar la tabla de transferencias hasta cubrir todo lo que alguien escribe | **Nada nuevo que declarar** | Nada nuevo que declarar |

**La fila de calidad no se puede zanjar hoy, y decir lo contrario sería inventar.** Comparar
vectores exige un corpus etiquetado a mano contra el cual medir agrupamiento, y el corpus es
cero (hecho 11). Lo único honesto que se puede afirmar es la dirección: un modelo abierto de 568M
parámetros es *peor en promedio* que lo mejor que vende un proveedor, y **para lo que esta página
hace** —vecinos por coseno y componentes conexas sobre texto corto en español— la diferencia es
chica frente al eje de la primera fila. Cuando haya corpus, la medición entra por el gatillo 2 de
abajo.

## Decisión

**D1 · Los embeddings los calcula un Ollama local, y `@xenova/transformers` se descarta como
implementación.** El demonio escucha en `127.0.0.1:11434`; el job le pega con `fetch` a
`POST /api/embed` (`{ model, input: string[] }` → `{ embeddings: number[][] }`) y no importa
nada. Modelo primario **`bge-m3`** — el mismo que eligió la spec §4.2, 1024 dimensiones,
multilingüe denso — bajado con `ollama pull bge-m3`.

Es una **mejora sobre el borrador**, no un empate: da el mismo resultado que `transformers.js`
—modelo local, texto que no viaja— y no paga nada de lo que aquél pagaba. El modelo vive en el
demonio (`~/.ollama/models`), **afuera del árbol del repo**: no hay ~100 MB de pesos cacheados
adentro del workspace, no hay entrada nueva en `.gitignore`, no hay un paquete más en el
lockfile, y no hay una cadena de dependencias nativas (ONNX Runtime) que mantener. La
implementación entera es una clase con un `fetch` adentro.

**Lo que esto desobedece, dicho de frente:** la spec §4.2 eligió `transformers.js` *«no un
demonio externo»*, con tres razones. Dos siguen valiendo y Ollama las cumple **mejor** (no
agrega Python, no agrega una segunda cadena de dependencias al monorepo). La tercera —«no
depende de que alguien instale nada a mano en cada máquina»— es la que se desobedece a
sabiendas, y su precio está en D4. El repo ya tiene exactamente esa forma andando desde el 12/8:
`brew install pmtiles`, una vez, con el comando escrito en un README (hecho 9).

**D2 · El requisito que la condición 3 pedía, escrito: el texto que escribe la gente no sale de
nuestra infraestructura.** Alcanza a `senales.texto` y a **todo lo que se derive de él** — el
vector, el `tema`, cualquier agregado. Ninguna de esas cosas se computa mandando el texto afuera.

**Lo único que sigue saliendo, y queda nombrado en vez de barrido:** el asistente de coaching,
donde la persona sabe que le está escribiendo a una máquina y lo consintió, y así está declarado
en `privacidad.mdx`. Esta ADR no lo cambia. Si el dueño quiere extenderle la regla, el camino ya
está: un `OllamaCompleter` detrás de la misma interfaz `AICompleter` (hecho 2), y una ADR de una
página.

**D3 · El clasificador de `tema` se muda al mismo camino — y esto es una propuesta a acordar con
la spec B, no un hecho consumado.** El catálogo es **cerrado y de once claves** (hecho 4). Con
un embebedor local eso se resuelve sin generar una palabra: se embeben las once claves **una
sola vez** —una frase corta por clave, no la palabra suelta, que en «cuidado» o «cultura» es
demasiado ambigua— y cada señal cae en la más cercana por coseno. Sin llamada por fila, sin
presupuesto que quemar, y sin que el texto salga.

- **Cumple la regla 6 mejor que hoy.** La regla dice que la IA sugiere y no determina. Hoy la
  máquina **escribe** un tema en texto libre y después alguien lo mapea; con esto la máquina
  **elige** de una lista sancionada por la spec. La distancia entre sugerir y determinar se
  achica cuando lo que la máquina puede decir está acotado de antemano.
- **La maquinaria de la spec B sobrevive entera.** `tema_origen = 'sugerido'`,
  `tema_intentado_en` como gobierno de la cola —se escribe pase lo que pase, incluso cuando la
  más cercana no supera el piso y la fila queda sin tema—, el evento en `rastro_senal` con
  `actor_clase: 'maquina'`, y `PATCH /senales/:id/tema` como reversión. No se toca ni una
  columna.
- **El costo, sin maquillaje:** en once categorías gruesas, **un buen LLM suele clasificar mejor
  que vecino-más-cercano**. Lee negación, ironía y contexto; un coseno contra el vector de una
  etiqueta, no. Se acepta esa pérdida a cambio de la primera fila del scorecard, y se la mide
  cuando haya con qué (gatillo 2).
- **Esto toca la spec B, que implementa otra sesión.** Queda como **propuesta**: si se acepta,
  §2.11 conserva catálogo, cola y rastro, y cambia sólo quién escribe el tema. Si no se acepta,
  D2 la contradice y hay que resolverlo antes de que la spec B llegue a producción — porque un
  clasificador de proveedor sobre `senales` reabre el agujero completo.

**D3b · El cron de mandato deja de llamar al proveedor, y eso cuesta un campo.** Si el `tema` se
muda pero el `sentiment` sigue viajando, la decisión se rompe el mismo día que se escribe.
Entonces: `topics` **se borra** —no lo lee nadie (hecho 12)— y `sentiment` **queda sin escribir**
hasta que exista un camino local para calcularlo. La columna se queda en `NULL`, que es lo que la
web ya sabe recibir (`sentiment: number | null`). Es una pérdida de función **declarada**, no un
descuido: la superficie muestra un dato menos y no un dato inventado. En la práctica no
retrocede nada hoy, porque ese cron **todavía no está agendado** — la 0008 D5 pidió medirlo
antes, y la cabecera de `cron.ts` lo dice.

**D4 · Hoy Ollama no está instalado, y la conexión igual se escribe y se prueba.** La
implementación de `Embebedor` toma su `fetch` por inyección, así que el test vive en
`scripts/` y corre en CI **sin demonio y sin red** contra un fetch simulado (hecho 10): se
verifica la forma del pedido, el parseo de la respuesta, el largo del vector contra
`dimensiones`, el batch y el error. El día que el demonio exista, lo único sin probar es el
demonio.

Y cuando no está, **el job falla con el comando exacto**, por `process.stdout.write` (`no-console`
es error en todo el repo):

```
Ollama no contesta en http://127.0.0.1:11434.
Instalalo y bajá el modelo, una sola vez:

  brew install ollama
  ollama serve          # dejalo corriendo en otra terminal
  ollama pull bge-m3

Después volvé a correr:  pnpm radiografia:embeber
```

Falla ruidoso y no escribe nada: media corrida es peor que ninguna.

**D5 · La procedencia se anota por corrida, porque el lockfile no pinea un modelo.** Un `pnpm
install` reproduce paquetes; no reproduce lo que alguien tenga bajado en su demonio.
`analisis_corridas` (spec §4.4) guarda **nombre del modelo, digest** —el que devuelve el propio
demonio al listar sus modelos— **y dimensiones**, además del corte y el conteo. Si dos corridas
salieron de modelos distintos, el dato lo dice en vez de esconderlo, y la cabecera de la página
lo publica (R4, §3.2).

**D6 · El puerto es la garantía de reversibilidad, y por eso va primero.** `Embebedor`
(spec §4.1) es una interfaz de un método en `civic-core`, sin un solo import (hecho 7), y **ya
está en el árbol** —`packages/civic-core/src/radiografia/embebedor.ts`, con su `EmbebedorFalso`
determinista para que el motor se pruebe sin modelo—: las Tasks 1 a 8 se ejecutaron sin esperar a
este documento, que es exactamente lo que el puerto compra. Si mañana
esto se revisa —porque aparece un proveedor con un contrato de no-retención que valga, porque el
demonio molesta, o porque conviene volver a un modelo en proceso— **cambia una clase**. No cambia
el motor, ni el grafo, ni los núcleos, ni la página. Las ocho primeras tasks del plan del motor
se ejecutan sin esperar a este documento justamente por eso.

**D7 · La 0006 pasa a `Superseded by 0009`** y se queda donde está. Su análisis de mayo sigue
siendo correcto para lo que evaluaba —no había consumidor, y una API era más liviana que un
modelo local—; lo que cambió es que hay un consumidor, hay un requisito de producto que antes no
existía, y hay una forma de correr el modelo que no pesa en el repo. **Esta ADR no edita ese
archivo:** el cambio de encabezado va en el commit que instale el job, para que las dos cosas se
muevan juntas.

## Gatillo de reevaluación

**Este gatillo reemplaza al de la 0006**, que queda superseded junto con ella. Se reabre esta
ADR cuando **cualquiera** de estas condiciones se cumpla — cualquiera, no todas, porque acá lo
que se protege es una promesa y basta una grieta:

1. **El dueño revoca por escrito la decisión del 13/8/2026.** La condición 3 es de producto: se
   revoca con una frase, no con un benchmark. Es la única condición que puede tirar abajo D2.
2. **La calidad del `tema` se mide y pierde feo.** Sobre una muestra de **≥ 300 señales reales
   etiquetadas a mano** contra las once claves, si el coseno-contra-etiquetas queda **≥ 10
   puntos de exactitud** por debajo de un LLM sobre la misma muestra, se reabre **D3 y sólo D3**
   — el clasificador vuelve a discutirse; los embeddings no. La salida entonces no es «mandarlo a
   Groq», es un modelo local más grande o etiquetas mejor escritas.
3. **Una corrida completa deja de entrar en una tarde.** Si embeber el pendiente tarda **> 4
   horas** en la máquina donde se corre, el job a mano deja de ser sostenible y hay que decidir
   dónde vive (máquina propia, no Vercel — hecho 8).
4. **El job se abandona.** Si pasan **dos corridas seguidas con más de 30 días de hueco** entre
   una y otra, o el corte publicado en la cabecera queda más de 30 días viejo, se reabre para
   automatizarlo. No para esconderlo: la página ya declara su atraso (§3.2).
5. **Ollama deja de ser una apuesta razonable** — se discontinúa, cambia de licencia, o deja de
   publicar `bge-m3` o equivalente multilingüe. Ahí se vuelve a `transformers.js` en proceso, que
   sigue siendo la segunda mejor forma de cumplir D2. Se reabre por **implementación**, no por
   principio: D2 no se toca.

**Y una condición que explícitamente NO reabre esta ADR: el costo.** Ningún precio de API la
reabre, porque el costo nunca fue el motivo (condición 2). Que sea gratis mandar el texto afuera
es exactamente el argumento que esta ADR rechaza.

## Consecuencias

- **El tope de 60 dependencias no se toca, y esta vez ni siquiera de refilón.** Ollama **no suma
  ninguna dependencia**: ni de producción, ni de desarrollo, ni de `scripts/`. La implementación
  es `fetch` global de Node. La plataforma sigue en **39 de 45** y el móvil en 48 de 52, con o
  sin esta ADR. La variante `@xenova/transformers` sumaba una `devDependency` de la raíz y una
  entrada nueva en `.gitignore` para los pesos; ésta no necesita ni una cosa ni la otra.
- **Instalar el demonio es un paso manual por máquina.** Es el precio de D1 y no se disimula. Se
  paga con tres cosas: el job falla con el comando exacto (D4), CI no lo necesita porque el test
  va contra fetch simulado, y **ninguna superficie pública depende del demonio** — si no está,
  no se embebe; nada se cae.
- **Si nadie corre el job, la página envejece a la vista.** Una señal nueva no tiene vector hasta
  que alguien corre `pnpm radiografia:embeber`, y eso **se declara**: el corte de la última
  corrida sale en la cabecera (R4, spec §3.2) y las señales sin vector se cuentan como
  «esperando análisis» en vez de desaparecer (R3, §6). Es la diferencia exacta con `D-047`, donde
  un artefacto se congela y nadie se entera. Con D3 aceptada, lo mismo vale para el `tema`: la
  cola de `tema_intentado_en` no avanza sola, y una fila sin tema se ve sin tema.
- **Hay que actualizar `content/legal/privacidad.mdx`, y esta ADR no lo hace.** Queda pendiente y
  es parte de la rebanada, con dos cosas adentro: (a) decir que el análisis de convergencia y la
  clasificación de tema corren en nuestra infraestructura y que el texto de las señales no entra
  en la tabla de transferencias; (b) arreglar lo que el hecho 5 dejó a la vista — mientras el
  cron de mandato siga llamando al proveedor, la fila de IA dice menos de lo que el código hace.
  **Entra a `docs/DEUDAS.md` con ordinal nuevo: el próximo libre es `D-061`** (`D-045` a `D-060`
  están ocupados). Esta ADR no edita ninguno de los dos archivos.
- **`docs/adr/0006-xenova-transformers-status.md` necesita su encabezado editado** a
  `Superseded by 0009 — 2026-08-13`, por D7. No se edita acá.
- **La pregunta 2 de la spec §13 cambia de forma.** Ya no es «¿hay pesos ONNX estables de
  `bge-m3` para `transformers.js`?»: es «¿está `bge-m3` en la biblioteca de Ollama con las 1024
  dimensiones que la migración `0020` reserva?». Se verifica en la Task 1, al instalar, contra el
  demonio — no se da por supuesta acá. El endpoint exacto (`/api/embed` con `input`, frente al
  viejo `/api/embeddings` con `prompt`) se fija en el mismo momento, y el test simulado se
  escribe contra el que quede.
- **La spec §4.2 queda desactualizada en su implementación, no en su intención.** Elegía
  `transformers.js`; esta ADR elige Ollama por las mismas razones que ella daba. Se corrige en la
  spec cuando se toque, y hasta entonces manda este documento.
- **Esta ADR no destraba la constelación.** `0003-three-js-status.md` sigue en *Defer* y su
  gatillo pide que el dato no pueda servirse con SVG o canvas-2D a la fidelidad buscada — con
  cero señales, esa condición no se cumple. Las rebanadas 3 y siguientes de la spec §10 siguen
  esperando. Lo que este documento habilita son las **Tasks 9 y 10** del plan del motor: la
  implementación real del embebedor y el job.

## Referencias

- Spec: `docs/specs/2026-08-12-la-radiografia.md` §2 (R1, R2, R3, R4), §3.2, §3.3, §4.1, §4.2,
  §4.3, §4.4, §9, §13
- Spec de la señal: `docs/specs/2026-08-11-b-la-senal.md` §2.11 (el tema y su catálogo cerrado)
- Plan: `docs/plans/2026-08-12-la-radiografia-motor.md` — Tasks 9 y 10, gateadas por este documento
- Supersede: `docs/adr/0006-xenova-transformers-status.md` (y su gatillo, reemplazado acá)
- Hermana no destrabada: `docs/adr/0003-three-js-status.md`
- Host y bundle: `docs/adr/0008-donde-corre-la-api-en-produccion.md` D1, D5, D7
- Constitución de producto: `apps/mobile/docs/PRODUCT_CONSTITUTION.md` reglas 6 y 9
- El texto que hoy sale: `apps/api/src/features/mandato/classifier.ts`,
  `apps/api/src/features/mandato/cron.ts`, `apps/api/src/lib/ai/index.ts`
- Precedente de herramienta afuera del árbol: `scripts/build/mapa/README.md`
- Guardia de dependencias: `scripts/build/deps.ts`, `scripts/build/deps-check.ts`
- Política de privacidad: `content/legal/privacidad.mdx` v3 (pendiente de actualizar)
- Deudas citadas: `docs/DEUDAS.md` en la raíz del repo (`../../../docs/DEUDAS.md` desde acá) —
  `D-002`, `D-047`; el ordinal nuevo que esta ADR deja pendiente es `D-061`
