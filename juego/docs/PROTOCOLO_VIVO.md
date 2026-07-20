# El Protocolo Vivo — la app como primer cliente del Coordination Protocol

*2026-07-19 · Revisión de primeros principios III. Supersede la sección 3 de
SEMILLA_DE_CIVILIZACION.md. Fuentes: the-coordination-manifesto_1.md y
the-coordination-protocol-v1.md (Desktop/Coordination/).*

---

## 0. El reencuadre que cambia todo

Las revisiones anteriores pensaban "un juego + una capa cívica + un feed".
Ese encuadre se queda corto. El encuadre correcto:

> **Esta app es el primer cliente del Coordination Protocol — su
> implementación de referencia, bootstrapeada territorialmente en Argentina.**
> El juego, el feed, el mapa y los círculos no son features: son cuatro
> *renderizaciones* del mismo estado de protocolo. El protocolo dice M0 es
> "build the protocol"; nuestra M0 es más audaz: **coordinar un país.**

El manifiesto dice que el problema no es conexión sino coordinación: *¿puedo
confiar en vos? ¿podemos acordar qué construimos? ¿dividir el trabajo? ¿rendir
cuentas sin jefe? ¿repartir el valor?* Cada una de esas cinco preguntas ya
tiene un órgano a medio construir en la app. Lo que faltaba era reconocer que
son las capas del protocolo y terminarlas como tales.

## 0.5 El axioma decisivo (Juan, 2026-07-19)

> **"The decisive feature is not data collection. It is returning value to the
> person who contributed the data."**

La regla operativa que sale de ahí — **ninguna captura sin devolución en el
mismo gesto**: toda pantalla que recibe algo de una persona tiene que terminar
devolviéndole, en esa misma sesión, al menos una de estas tres cosas:

1. **Reconocimiento** — tu estrella nace, tu obra recibe pulsos, tu brillo crece.
2. **Insight** — al contribuir VES el patrón: qué dijeron otros sobre tu tema
   en tu territorio, dónde encaja tu voz en la radiografía. El dato te vuelve
   leído, no tragado.
3. **Conexión** — El Llamado te busca, un match aparece, alguien puede
   responder. Ser necesitado con precisión es la devolución más fuerte.

Checklist de revisión para toda pantalla nueva: *¿qué recibe la persona antes
de cerrar esta pantalla?* Si la respuesta es "nada, gracias por su aporte",
la pantalla está mal diseñada. Los incumbentes extraen; nosotros devolvemos.

## 1. El diccionario nuevo (moderno, eléctrico-vital)

El fuego queda adentro del juego (brasas, chispas, encender: tu práctica
privada). La red habla otro idioma — corriente, pulso, señal:

| Primitivo del protocolo | Nombre en la app | Qué es |
|---|---|---|
| Event log del protocolo, legible | **La Corriente** | El feed. "Estar al corriente" ya significa estar al día en castellano — el idioma nos regala el nombre. |
| Attestation (0x04) | **Pulso** | No es un like: es la unidad atómica de confianza computable, disfrazada de gesto social. |
| Peer heartbeat check (7.2) | **Pulso de misión** | El latido periódico que mantiene viva una misión. |
| Agregado nacional | **El Latido** | La frecuencia cardíaca del país: pulsos/hora, en vivo. |
| Matching broadcast (0x03) | **El Llamado** | Las misiones te llaman a vos — no vos a ellas. |
| `STANDBY_MODE` (3.2) | **De Guardia** | Opt-in de crisis: inundación → tu equipo ya está armado. |
| Capability domain (0x02) | **Oficio** | Dominio de capacidad demostrada. |
| Proof-of-Output | **Obra** | La unidad del feed: hecho + evidencia + atestaciones. |

## 2. El pulso — un primitivo, cuatro renderizaciones

Juan pidió "en vez de brasa, un pulso". Es más profundo que un rename: el
protocolo YA tiene el pulso como primitivo (attestations + heartbeat checks).
Un solo objeto de datos, cuatro superficies:

1. **Gesto social** (La Corriente): tocás una obra y le das un pulso. Presupuesto
   diario igual para todos (p.ej. 5, se regeneran como late un corazón):
   sinceridad por escasez, sin plutocracia — el que capturó 500 estrellas tiene
   los mismos pulsos diarios que el que llegó ayer.
2. **Atestación computable** (Trust Layer): el pulso registra quién, a qué obra,
   en qué oficio. El peso varía invisiblemente según el protocolo: el pulso de
   una electricista con obras probadas en `luminarias` vale exponencialmente
   más sobre una obra de luminarias que el de un desconocido (§2.2 Attestation
   Weighting). El gesto es igualitario; el cómputo es meritocrático. Nunca se
   muestra un score.
3. **Latido de misión** (Free-Rider Ejection, §7.2): las misiones activas piden
   pulso semanal ("¿seguís?"). Sin latido, la misión busca reemplazo — sin
   drama, sin jefe: el protocolo hace el trabajo sucio de la accountability.
4. **El Latido** (agregado): la visualización ambiente del país coordinándose —
   pulsos/hora como un monitor cardíaco nacional. Es el "espejo del pulso" de
   la auditoría, ahora con fundamento: no mostramos actividad, mostramos
   *confianza fluyendo*.

## 3. Las seis capas, mapeadas a lo que existe

### 0x01 Misión → las misiones existentes, elevadas a máquina de estados
`PROPUESTA → EQUIPO → ACTIVA → VERIFICACIÓN → RESUELTA`. La capa cívica ya
tiene verificación (corroboración) y entrega (custodias) — son estados de
misión sin nombre. Al resolverse: la obra se publica en La Corriente, el valor
simbólico se reparte, la confianza se escribe en los grafos, la misión se
disuelve. **Nada es permanente; todo es misión.**

**Fractalidad — la integración con ¡BASTA! entera:** los 22 PLANes son
misiones madre ($M_0$). El `arquitecto-data` del sitio v1 ya codifica
`requires/provides` entre PLANes — **ese es literalmente el dependency graph
del Mission Layer, ya escrito.** Un círculo "adopta" una sub-misión de un PLAN
en su territorio (PLANSUS-Córdoba-relevamiento). El progreso agrega hacia
arriba. El framework deja de ser un documento que se lee y pasa a ser un árbol
que se juega. La encapsulación del protocolo (la misión madre no dicta el cómo)
ES la autonomía de círculos que ya definimos.

### 0x02 Capacidad → **tu constelación es tu currículum**
El hallazgo estético-estructural de esta revisión: el Cielo ya es un grafo de
capacidades renderizado. Estrellas = outputs verificados; constelaciones =
oficios; brillo = magnitud. La app no necesita "perfiles con skills": necesita
**constelaciones de oficio** — al resolver misiones de un oficio, esa
constelación tuya gana estrellas y brillo. Mostrarla a alguien (opt-in,
QR o link) es mostrar track record verificado, no CV autodeclarado.
"Proof-of-Output" en plata: *no me digas qué sabés; mostrame tu cielo.*

Micro-capacidades (§2.2): el vecino con pico enorme en `destapar desagües`
y bajo en `plomería general` recibe El Llamado exacto. El protocolo ve el pico.

### 0x03 Matching → El Llamado y De Guardia
Hoy la app espera que encuentres qué hacer. Invertir: cuando una necesidad o
misión entra en PROPUESTA, difunde sus vectores requeridos y **te llama** — por
oficio probado, cercanía y disponibilidad. Optimiza equipo, no individuo
(complementariedad §3.1): "esta misión ya tiene visión, le falta ejecución".
**De Guardia** es el feature civilizatorio: opt-in por oficio y zona; se
declara la inundación y el protocolo comete equipos pre-acordados con
gobernanza de crisis en minutos, no en asambleas. Argentina tiene desastres
recurrentes; ninguna app del mundo le da esto a un barrio.

### 0x04 Confianza → computable, sin score visible, con decay poético
- $R_{contexto} = \sum(\text{impacto} \times \text{peso de atestación})$ — se
  computa, ruta llamados y pesa verificaciones. **Jamás se muestra como
  número**: el anti-social-credit es línea roja. Lo que se ve es el portfolio:
  la constelación.
- **Decay (§4.2)**: el Cielo ya lo implementa sin querer — las estrellas
  viejas se disuelven en polvo estelar (LOD >300). Hacerlo semántico: el
  brillo de tu constelación de oficio refleja obra *reciente*. El trust
  half-life del protocolo, renderizado como cielo que respira. Sos quien sos
  ahora, no quien fuiste en 2012.
- **Sybil (§7.1) — la joya que ya teníamos:** el protocolo exige
  proof-of-personhood + análisis de densidad de grafo. Nuestra respuesta ya
  está construida: **la red solo se entra por QR cara a cara.** La chispa es
  proof-of-personhood físico; un cluster aislado que se auto-atesta no está
  enlazado a la trama QR-verificada y sus pulsos no pesan. La restricción que
  parecía limitación de crecimiento es la defensa contra el ataque más difícil
  del protocolo.
- **Extorsión (§7.3)**: pulsos de misión ciegos hasta RESUELTA; los
  coordinadores también reciben atestaciones.

### 0x05 Gobernanza → menú explícito por misión
Al fundar una misión el círculo elige (y puede cambiar por consenso a mitad de
camino — Governance Override §5.2): **Coordinada** (una responsable, rápido,
crisis) / **Por consentimiento** (m-de-n, custodias y plata) / **Por oficio**
(quien tiene la constelación más probada en el dominio pesa más) / **Rotativa**
(misiones maratón). Los device keys que la capa cívica ya usa (actor keys en
SecureStore) sirven de firma de compromiso al pasar a ACTIVA — la "cryptographic
signature" del protocolo, versión pragmática.

### 0x06 Valor → reconocimiento hoy, PLANEB mañana
Sin dinero en la app (ética intacta). Pero la capa queda *diseñada*: al
RESOLVER, el reparto elegido en génesis distribuye pulsos y crédito de obra
entre contribuyentes (split proporcional peer-evaluado §6.1), y el
**micro-aporte** (§6.2) se etiqueta: la charla de 30 minutos que redirigió la
obra recibe su pulso dirigido. El día que exista valor material — la Red
Bastarda de PLANEB es exactamente una economía at-cost buscando su capa de
valor — el rail ya está tendido. PLANEB sin protocolo es una idea; PLANEB
sobre esta capa es ejecutable.

## 4. La Corriente, revisada con el protocolo

Igual que antes (hechos estructurados, círculos como protagonistas,
cronológico×territorial, "estás al corriente", archivo infinito hacia atrás)
con tres upgrades de protocolo:

1. **El feed es el event log**: cada ítem es una transición de estado real
   (misión resuelta, obra atestada, llamado abierto, guardia activada). No hay
   "contenido" separado de la coordinación — mirar La Corriente ES mirar el
   protocolo latir.
2. **Cada obra porta su cadena**: evidencia → atestaciones (con peso por
   oficio) → estado. El primer feed del mundo donde todo ítem es verificable
   por construcción.
3. **Del ítem a la acción**: cada estado ofrece su verbo — PROPUESTA: "sumarme"
   / ACTIVA: "pulso" / RESUELTA: "replicar en mi barrio" (spawn de sub-misión
   con la misma plantilla: la fractalidad como gesto de un toque).

## 5. Qué resuelve esto que la auditoría no resolvía

- **El techo de contenido desaparece**: el elder game es el país. Las misiones
  las genera Argentina, no un equipo de contenido.
- **El "por qué volver" madura**: día 1 el ritual (juego), semana 2 el barrio
  (Corriente), mes 2 El Llamado te busca a vos — el pull más fuerte que existe
  es ser *necesitado con precisión*.
- **La fama individual muere de diseño**: constelaciones en vez de followers,
  pulsos con presupuesto igualitario, círculos como autores.

## 6. Fases honestas

- **P0 (local, ya):** máquina de estados de misión + obra con evidencia +
  pulso local (círculos QR) + constelaciones de oficio renderizadas del dato
  existente.
- **P1 (API cívica):** La Corriente federada por círculos QR-verificados +
  pulsos con peso + El Llamado v0 (reglas: oficio×distancia×recencia, sin ML).
- **P2:** De Guardia + gobernanza por oficio + El Latido + árboles de PLAN
  sembrados desde arquitecto-data del sitio v1.
- **P3 (cuando exista valor material):** capa de valor con PLANEB.

Todo degrada con dignidad sin red: el juego y la bitácora nunca dependen de
nada. La red enriquece; no condiciona.

## 7. Decisiones tomadas (Juan, 2026-07-19)

1. ✅ **La Corriente** es el nombre del feed.
2. ✅ **Fuego privado, pulso social**: brasas/chispas quedan en el juego
   personal; el pulso es el primitivo de la red.
3. ✅ **5 pulsos diarios iguales para todos, para empezar** (ajustable).
4. ❌ **Los PLANes NO se siembran como misiones madre canónicas.** Juan:
   "quería que la gente construya la visión; darlos cocinados sería fuerte".
   Ver §8 — la visión se construye como mecánica, no se precarga como canon.

## 8. La visión como mecánica (resolución del punto 4)

El principio: **sembrar la gramática, no las oraciones.** Un tablero vacío
mata la app (cold start); un tablero precargado con 22 árboles mata la
legitimidad (la gente ejecuta la visión de otro en vez de construir la suya).
La salida no es elegir un polo sino diseñar el medio:

1. **"Diseñar" es un tipo de misión de primera clase.** El diseño idealizado
   de Ackoff — la metodología que ya funda ¡BASTA! — convertido en wizard
   jugable: un círculo funda una misión de diseño sobre su territorio o tema
   ("¿cómo sería la salud de este barrio si pudiéramos diseñarla de cero?"),
   con los pasos de Ackoff como micro-UIs (disolver lo actual → diseñar el
   ideal → puentear). El producto de una misión de diseño es una PROPUESTA
   publicada en La Corriente, forkeable por cualquier otro círculo.
2. **Las escuchas son la materia prima.** El diseño no arranca de página en
   blanco: arranca de lo que el territorio ya dijo (las escuchas agregadas
   del pulso colectivo alimentan el paso 1 del wizard). La visión emerge de
   la escucha — el orden causal correcto.
3. **Los 22 PLANes entran como propuestas de UN círculo más** — el círculo
   fundador, honestamente etiquetado, sin privilegio estructural: mismo
   formato, mismo estado PROPUESTA, compiten por pulsos y adopción como
   cualquier propuesta vecina. Se introducen DESPUÉS de que la capa de
   escucha tenga datos, presentados como "una respuesta a lo que el país
   dijo — para discutir, adaptar y forkear", con el match explícito contra
   escuchas reales ("este PLAN responde a 340 escuchas de tu provincia").
   La adopción es el voto; la no-adopción es información.
4. **Todo es forkeable con linaje.** Un círculo adopta, adapta o
   contra-propone; las derivaciones guardan su árbol genealógico. La visión
   queda versionada por la gente — viva, como pide el manifiesto.
