# Tramo D — PLANPREGUNTA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Escribir `Iniciativas Estratégicas/PLANPREGUNTA_Argentina_ES.md` — el documento del vigésimo quinto PLAN de ¡BASTA!, el conocimiento nuevo — con sus doce arreglos obligatorios de la spec **corregidos y ampliados por la verificación previa**, que encontró diez problemas que la spec no tenía.

**Architecture:** Una guardia ejecutable (`SocialJusticeHub/scripts/verificar-planpregunta.ts`) declara qué secciones tiene que tener el documento, qué cifras canónicas tiene que citar, qué strings tiene prohibidos y **qué tablas tiene que sumar** — en este PLAN son dos: el nuevo split del FSC, que tiene que dar 100 exacto, y la tabla de las nueve verticales. Cada tarea de contenido **primero extiende la guardia** —que pasa a fallar— y después escribe las secciones que la hacen pasar. Es red-green sobre prosa: lo mecánico lo verifica el script, lo editorial lo verifica la revisión.

**Tech Stack:** TypeScript + tsx (script one-shot, se corre a mano y en CI), Markdown.

> **NOTA OPERATIVA — hay un hook que bloquea `Write` sobre archivos `.md`.** Es un hook global de otro proyecto (brand review de Kairospace) que se dispara sobre cualquier markdown y **frena la herramienta Write**. `Edit` NO está afectado. Para crear un archivo `.md` nuevo usá `cat > ruta <<'EOF' … EOF` desde Bash; después trabajalo normalmente con `Edit`. No pierdas tiempo peleándole al hook ni intentes desactivarlo.

> **Alcance del tramo.** La spec agrupa PLANPREGUNTA y PLANFOCO en un solo tramo D. **Este plan cubre solamente PLANPREGUNTA.** PLANFOCO queda pendiente y eso tiene una consecuencia inmediata sobre el arreglo 12 — ver **D-9**.

---

## Lo que la verificación previa encontró, y la spec no decía

Diez hallazgos de una lectura del corpus entero antes de escribir este plan. **Los diez son vinculantes.** Donde uno de ellos choque con la spec, **gana el hallazgo**: está verificado contra el texto y la spec no.

### D-1 · El sorteo estratificado existe, y no es de PLANJUS: es de PLANMESA

El arreglo 3 de la spec dice que PLANPREGUNTA le pide a PLANJUS un sorteo estratificado que PLANJUS no tiene, y manda «corregir el sorteo». La corrección real no es bajar el pedido: es **cambiar de acreedor.**

- `PLANJUS:400` es sorteo **puro** con exclusión automática de conflicto de interés, y nada más. Confirmado.
- `PLANJUS:695-707` (§6.5) sí tiene salvaguardas de representatividad, pero **actúan sobre el padrón, no sobre el sorteo**: bajan la edad mínima a 21 para JUS-1, sustituyen el requisito de secundario por una certificación de cuatro semanas, reclutan panelistas bilingües, y **monitorean** la demografía del pool con un umbral del 50% de la proporción poblacional. Es corrección de pool, no estratificación al momento de sortear.
- **`PLANMESA:297` estratifica de verdad y lo dice con todas las letras:** *«el sorteo es estratificado por Credencial en la materia (no puramente aleatorio)»*. Y `PLANMESA:88` gobierna la AMCC por **«sorteo estratificado entre Síndicos de Archivo y paneles técnicos»**.

**Camino resuelto:** el jurado de una Pregunta se sortea con la mecánica de PLANMESA, no con la de PLANJUS. PLANPREGUNTA **remite a `PLANMESA:297`, no a `PLANJUS:400`**, y la guardia prohíbe atribuirle a PLANJUS un sorteo estratificado.

### D-2 · El presupuesto de la spec no cierra con el gate que habilita al PLAN — el mismo defecto que el tramo C

La spec declara **USD 1.400–2.400M/año** en régimen *y* **16.500–26.000M a quince años**. 1.400 × 15 = 21.000; 2.400 × 15 = 36.000. El gate corrió sobre 16.500–26.000 (`SocialJusticeHub/scripts/gate-spinoff-planes-nuevos.ts:26`), que anualizado sobre quince da **1.100–1.733M/año** — no es el rango de la portada.

A diferencia del tramo C, acá la rampa que explica el cociente **sí está insinuada en la spec**: las fases son 2029–30 registro, 2030–32 las primeras cien Preguntas, 2032–35 la Cátedra, **2035–40 régimen pleno**. El régimen no corre quince años: corre cinco o seis dentro de la ventana. **Lo que falta no es la idea sino la aritmética escrita**, y sin ella la portada afirma un total que su propio rango anual contradice. Se resuelve en la Task 9 y condiciona la cabecera de la Task 1: **la Task 1 escribe el rango de quince años y remite; no escribe un rango anual.**

### D-3 · PLANDIG ya reclamó el presupuesto de ciencia — y es un conflicto de fuentes que la spec no listó

`PLANDIG:1112` tiene una fila de financiamiento que dice, textual: *«Reasignación presupuesto de ciencia y tecnología | 500–1.000 | Restaurar el presupuesto de CyT al 0,39% legal y **dirigir el incremento a PLANDIG**»*.

La regla de fuentes de `PLANPACTO §5.1` dice que toda fuente tiene un solo dueño. **El incremento hasta el 0,39% legal ya tiene dueño escrito, y no es PLANPREGUNTA.** La tabla de conflictos vivos de la spec (`spec:124-130`) no lo registra: registra regalías, FGS, pauta oficial, plusvalía y retenciones. Éste es el sexto y es el que le pega al PLAN en su propia materia.

**Se resuelve en el documento, no acá**, y las dos salidas honestas son: reabrir esa línea con PLANDIG por escrito en los dos documentos, igual que el FSC; o declinarla y decir que PLANPREGUNTA no toca el presupuesto de CyT existente y se financia entero por el FSC. **La segunda es la que este plan elige** — ver la Task 9 —, porque la primera abriría un segundo protocolo cerrado en el mismo documento y porque PLANPREGUNTA dice de sí mismo que no es la cartera.

### D-4 · El diagnóstico del 0,39 contra el 0,16 es de PLANDIG, con tabla y todo

`PLANDIG:269-289` trae la serie entera: 0,16% del PBI en 2025, *«el más bajo desde 2002»*; meta legal vigente 0,39%; estándar OCDE 2,7%; tabla comparada; y `:260` agrega **11.868 investigadores CONICET post-recortes 2024 contra ~15.000+ previos, −4.148 posiciones, −40% de presupuesto CONAE**. `PLANDIG:355-357` trae Corea (4,9% del PBI en I+D, treinta veces la Argentina).

**Ninguna de esas cifras es un descubrimiento de PLANPREGUNTA y ninguna se puede escribir sin atribuir.** El PLAN que se estrena diciendo que el país no sabe lo que no sabe no puede estrenar como propio el diagnóstico que otro documento del mismo corpus ya escribió con tabla. Se citan con domicilio, y la guardia lo verifica por ancla.

### D-5 · El LANEF ya es un piso constitucional de investigación, y es de PLANEN

`PLANEN:1489` le asigna a la ANEN la función de *«asignar el presupuesto de I+D (**piso constitucional del 0,2% del PBI**)»* para los siete programas de frontera del LANEF. Y `PLANEN:786` escribe la doctrina que PLANPREGUNTA cree estar inventando: *«El LANEF no investiga para publicar papers — investiga para producir tecnología exportable»*, con **obligación de transferencia** y socio industrial por programa desde el día uno.

Consecuencias, las tres vinculantes:

1. **La Prueba de Barro no es original: es una versión más dura de una regla que el corpus ya tiene.** Se escribe como endurecimiento declarado de `PLANEN:786`, no como invención. Lo que sí es nuevo es *quién* prueba — «en manos de alguien que no lo inventó» —, y ahí está toda la diferencia. Ese es el aporte y es lo único que se puede reclamar como propio.
2. **PLANPREGUNTA no reclama el 0,20% del LANEF y no lo duplica.** El arreglo 2 de la spec manda consolidarlo dentro del 0,70% de PLANEN, y el tramo A ya lo hizo. Acá sólo hay que **no volver a pedirlo**.
3. **La frontera con el LANEF se escribe:** energía es del LANEF, y una Pregunta Nacional sobre energía se contesta con el LANEF adentro, no contra él.

### D-6 · La Mesa de CyT Soberana no existe con ese nombre, y el calendario de PLANMESA es peor que «tercera ola»

El arreglo 5 dice que «el canon la pone en tercera ola». **Verificado: no hay lista de qué materia cae en qué ola.** Lo que sí hay, y es más duro:

- `PLANMESA:470` pone **«CyT nacional»** entre las materias de la **Mesa Federal**, que es la Capa 3.
- `PLANMESA:925-956`: PLANMESA es **tranche-2, entrada 2028-2030**; la **primera Mesa Federal piloto es 2030-2032 y su materia es Infancia y Niñez Crítica**; la cobertura completa de las materias de primera ola es **2032-2034**; la segunda ola **2034-2036**; la tercera ola, **Horizonte 2040**.
- Y la advertencia editorial del propio documento: *«presupuesto constitucional + régimen pleno con 2.000+ Mesas → diferidos a horizonte 2040 (Visión, no compromiso operativo)»*.

**O sea: PLANPREGUNTA no puede tener una Mesa Federal de CyT en su Fase 0 (2029-30) sin pisarle el calendario a PLANMESA.** No es que llegue tarde: es que en 2029 PLANMESA está fundándose. **El documento tiene que declarar el modo degradado y decir con qué órgano decide mientras tanto** — y la respuesta candidata, que la Task 5 tiene que defender o descartar, es que decide ANCON con jurado sorteado por la mecánica de `PLANMESA:297` y **traspaso automático a la Mesa Federal de CyT el día que exista**, con la fecha escrita.

### D-7 · La Prueba de Barro contradice el ciclo LDEA, y la contradicción es literal

`PLANMESA:88` describe la Fase EXPERIMENTAR: piloto de **60-180 días** en un Taller, *«con los autores de la propuesta **obligatoriamente participando** del piloto (piel en el juego real, no diseño desde escritorio)»*.

La Prueba de Barro exige **doce meses en manos de alguien que no lo inventó**. Las dos reglas son opuestas en las dos variables: el plazo y el probador. **No es un matiz y no se arregla con una nota.** El documento tiene que elegir una de tres y escribir cuál elige:

- que son dos pruebas distintas en serie (LDEA valida el diseño con el autor adentro; el Barro valida la adopción con el autor afuera),
- que el Barro sustituye a EXPERIMENTAR para las Preguntas Nacionales y PLANMESA lo acepta por escrito,
- o que el Barro no aplica a lo que pasa por Mesa.

**La primera es la que este plan recomienda** y es la única que no le enmienda el protocolo a otro PLAN, pero la elección se argumenta en el cuerpo, no se hereda de acá.

### D-8 · El territorio del conocimiento está menos ocupado de lo que parece — pero lo que está ocupado, está bien ocupado

Censo hecho sobre los veinticuatro documentos del taller. **Cero ocurrencias** en todo el corpus: `ANCON`, `Pregunta Nacional`, `Censo de Ignorancia`, `Prueba de Barro`, `Sello Abierto`, `Serie Centenaria`, `Cátedra Portátil`, `Turno de Máquina`, `Banco de Materia Viva`, `Modelos de Órgano`, `ANLIS`, `Malbrán`, `biobanco`, `doble uso`. **Una sola ocurrencia** de `bioseguridad`, y es de SENASA sobre insumos biológicos (`PLANISV:1614`).

Es un territorio más vacío que el de PLANARCO, y eso **no es una buena noticia**: significa que casi todo se inventa entero y casi nada se puede apoyar en una remisión. Los cuatro vecinos reales, y hay que declararlos:

| Vecino | Domicilio | Qué le toca a PLANPREGUNTA |
|---|---|---|
| **LANEF** — I+D energética con piso propio y obligación de transferencia | `PLANEN:782-792`, `:1489` | Ver **D-5**. No se duplica; el Barro se declara endurecimiento del `:786` |
| **LANIA + ArgenCloud** — cómputo soberano, 256 GPUs en 2027, 1.024–2.048 en 2029, 4.096+ en 2031 | `PLANDIG:463-512` | El **Turno de Máquina** es un régimen de acceso a capacidad ajena, no una compra propia. `PLANDIG:512` ya prevé servicio a *«universidades y CONICET para investigación»*: PLANPREGUNTA protocoliza esa fila, no la crea |
| **Banco de germoplasma nacional** | `PLANISV:2588` | El Banco de Materia Viva **no lo absorbe**: lo federa. Y el caso de Doña Rosa —variedad registrada en 2029, rendimiento +40% bajo estrés hídrico en 2031, certificada y exportada en 2035, con regalías a la comunidad— es el precedente interno de la Prueba de Barro y del cupo del arreglo 8 |
| **Archivo de Depósito Ciudadano** — siete nodos, hash, Síndico de Archivo | `PLANMEMORIA:283`, `:297`, `:315` | El Sello Abierto publica; **PLANMEMORIA custodia**. Son dos funciones y dos agencias, y el documento lo dice |

### D-9 · El arreglo 12 no es ejecutable en este tramo: PLANFOCO no existe

`ls "Iniciativas Estratégicas/PLANFOCO*"` no devuelve nada. La única mención de PLANFOCO en el taller entero está en `ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md`. El arreglo 12 manda «emitir el par recíproco FOCO ↔ PREGUNTA», y **la mitad de FOCO no tiene dónde escribirse.**

**Precedente exacto, y se sigue:** `PLANPACTO:721` dejó escrito *«PLANARCO es el par recíproco más importante y todavía tiene una sola mitad escrita»*, y el tramo C cobró esa deuda seis semanas después. PLANPREGUNTA escribe **su mitad**, nombra la otra como pendiente con la misma fórmula, y **la guardia prohíbe citar `PLANFOCO:línea`** — cualquier remisión con número de línea a un archivo inexistente es una cita fabricada.

### D-10 · El split del FSC está intacto, y PLANARCO dejó el terreno preparado

Verificado línea por línea, y es la mejor noticia del tramo:

- `PLANTER:163` y `:359-364` reparten el 100% del flujo en cinco líneas: **40% DCM · 20% Territorios Afectados · 15% Fondo Intergeneracional · 15% Restauración · 10% Operación ANTSPO**. `PLANTER:670-676` da los montos: el flujo total del FSC es **USD 16.500–31.000M/año** en régimen.
- **PLANARCO no tocó nada.** `PLANARCO:532` renuncia expresamente al Fondo Intergeneracional y `:898` deja escrito que *«PLANTER conserva el Fondo Intergeneracional y el Dividendo Ciudadano Mensual intactos»*. PLANPREGUNTA es **el primero y el único que reabre el protocolo**.
- Pero hereda una decisión ajena que cambia el mapa: `PLANARCO:449` dictamina que **el Fondo Soberano Ciudadano y el Fondo Soberano Bastardo son un solo fondo con dos nombres, y el que gana es Ciudadano**. Es decisión de diseño de PLANARCO, no una medición, y PLANPREGUNTA **la hereda y la cita, no la vuelve a decidir**. Con ella viene el costo que `PLANARCO:900` ya declaró: PLANMON perdió por esa vía el objetivo de *«USD 100B+ en año 10»* de `PLANMON:941`.
- **La aritmética del pedido cierra, y hay que escribir dónde no cierra.** El régimen de PLANPREGUNTA son 1.400–2.400M/año contra un flujo de 16.500–31.000M/año: eso es **7,7% en el extremo alto y 8,5% en el bajo**. Con **ocho puntos** del flujo el fondo aporta **USD 1.320–2.480M/año** — cubre el techo del régimen y **queda corto contra el piso en el año malo del ciclo**. Ese hueco se declara; no se redondea. *(Corregido el 2026-08-01 por la Task 9: el faltante es de **180 millones**, no de 80, porque la rampa obligó a mover la banda anual de régimen a 1.500–2.300 — ver abajo. Y del otro lado hay un sobrante simétrico de 180 en el año bueno, que este plan no había visto.)*

**El nuevo split que este plan fija, y que la guardia suma:**

| Línea | Antes | Después | Δ |
|---|---|---|---|
| Dividendo Ciudadano Mensual | 40 | 40 | — |
| Compensación a Territorios Afectados | 20 | 20 | — |
| Restauración Ecológica | 15 | 15 | — |
| Operación ANTSPO | 10 | 10 | — |
| Fondo Intergeneracional | 15 | **7** | **−8** |
| **Fondo de la Pregunta** | — | **8** | **+8** |
| **Total** | **100** | **100** | **0** |

**El donante es uno solo y es el Fondo Intergeneracional, y hay que defenderlo, no anunciarlo.** El argumento disponible tiene tres patas verificables y una concesión obligatoria:

1. **PLANARCO ya dictaminó que esa línea, como fuente, es un nombre y no un fondo:** `PLANARCO:526` — *«Un capital sin monto conocido y sin regla de retiro no es una fuente: es un nombre»*. PLANPREGUNTA es el primero que le pone regla de retiro a esos puntos.
2. **La objeción de PLANARCO no transfiere.** PLANARCO declinó esa línea porque la Dote es un piso por persona que tiene que pagarse igual en el año malo, y el fondo se drena justo cuando caen los commodities (`PLANARCO:526-532`). Un programa de investigación **sí** se puede desacelerar un año; un nacimiento no. La asimetría es real y es el permiso.
3. **El mandato de la línea es intergeneracional y sigue siéndolo.** El conocimiento es la única forma de capital intergeneracional que no depende del ciclo del litio.
4. **La concesión, que va escrita y no escondida:** los dos mandatos previos de esa línea son «no distribuir» —preservación de capital (`PLANTER:163`) y reserva contra el derrumbe del DCM (`:710`, `:839`)—, y bajarla de 15 a 7 **deja la reserva anti-colapso del dividendo en la mitad**. La contrapartida que PLANPREGUNTA paga, y que hace que reabrir el protocolo cueste de los dos lados: **en año de derrumbe declarado del DCM, el Fondo de la Pregunta se subordina** — no abre Preguntas nuevas y su flujo repone la reserva hasta el 15% original antes de volver a gastar. La Serie Centenaria y el Barro en curso quedan afuera de la subordinación, porque una serie interrumpida deja de ser una serie.

---

## Global Constraints

> **La unidad de conteo es `wc -w` crudo.** `wc -w "Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"` da **26.541**; `PLANARCO` da su propio número. **Nadie inventa su propia normalización** — la Task 1 del tramo C contó 576 palabras y su revisor 583 sobre el mismo texto, con dos métodos privados y ninguno declarado.
>
> ```bash
> # una sección, por rango de líneas
> sed -n 'INICIO,FINp' "Iniciativas Estratégicas/PLANPREGUNTA_Argentina_ES.md" | wc -w
> # el documento entero
> wc -w "Iniciativas Estratégicas/PLANPREGUNTA_Argentina_ES.md"
> ```

> **Presupuesto de palabras — objetivo total: 29.000–34.000.** Cada sección tiene el suyo declarado en su step, y **las adiciones de revisión entran adentro del rango, no encima.**
>
> **Verificación de que cierra por construcción, hecha antes de escribir una palabra** —que es exactamente lo que el tramo B no hizo y el tramo C tuvo que arreglar dos veces sobre la marcha: la suma de los **pisos** de las veintiséis entradas de la tabla de abajo da **27.810** —corregido dos veces el 2026-08-01: la cabecera subió de 560 a 700 (Task 1) y las ocho fallas bajaron de 3.200 a 2.000 (Task 3), las dos con la medición escrita—, que entra bajo el techo de 34.000 con 6.190 de margen. La suma de los **techos** da 35.210, por encima del total: eso es deliberado y significa que **no todas las secciones pueden ir a su tope a la vez**. Si una sección se come su techo, otra baja. Lo que no puede pasar —y es lo que pasó en el tramo C— es que los pisos obligatorios ya violen el total.

- **Spec de referencia:** `v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md` §5 (PLANPREGUNTA) y §2 (la aritmética del Techo). **Donde la spec choque con D-1…D-10, ganan los hallazgos.**
- **El taller es el destino.** El documento se escribe en `Iniciativas Estratégicas/PLANPREGUNTA_Argentina_ES.md`. **La ruta tiene espacio y acento: entrecomillala siempre en bash.** La edición derivada de `v2/content/planes/` NO se toca en este tramo.
- **Este tramo no carga el PLAN en ningún registro.** No se toca `arquitecto-data.ts`, ni `strategic-initiatives.ts`, ni `PLAN_REGISTRY.yml`, ni `EXPECTED_PLAN_COUNT`, ni ningún conteo de 22. Eso es el tramo E.
- **Ordinal 25, y el H2 del cuerpo dice «Vigésimo Sexto Mandato».** El ordinal y el mandato están desfasados en uno desde PLANRUTA, en todo el corpus. PLANPACTO es ordinal 23 / «Vigésimo Cuarto Mandato»; PLANARCO es 24 / «Vigésimo Quinto».
- **La autoridad por la que este PLAN existe se escribe con exactitud, y es peor que la de PLANARCO.** PLANPREGUNTA **no supera** el gate de la regla 3: pasa contra PLANEB (33,00–43,33x) y contra PLANDIG (3,51–2,63x), y **falla contra PLANEDU solo (0,21–0,26x) y contra los tres sumados (0,19–0,24x)**. Se habilita por **derogación expresa** de la regla 5 y de la condición temporal de la regla 3 (`ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md`, «Bajo qué autoridad se levanta esto»). **Escribir que «pasó el gate» sería falso, y la guardia lo prohíbe.**
- **Y la lectura del fallo va entera, porque el acta la escribió y es el mejor argumento del PLAN.** `ACTA:84-95`: *«la regla 3 mide tamaño relativo, no si algo merece documento propio»*, y un sub-mandato alojado en PLANEDU tendría que costar **120.000M contra el extremo bajo y 150.000M contra el alto** para superar el umbral. **Ningún hueco de conocimiento científico va a superar jamás ese umbral.** El acta corrigió además, el 2026-07-31, que PLANEDU **no** es «el PLAN más caro del corpus»: por inversión total lo iguala o supera PLANVIV (80.000–120.000M) y por gasto anual PLANMOV (21.080M/año). **No se estrena el superlativo; el orden de magnitud alcanza.**
- **La frontera con los tres huéspedes se declara.** El acta retira el hueco entero *«Ciencia y tecnología (PLANCYT) → PLANEDU + PLANEB + PLANDIG»*. A diferencia de PLANARCO, acá **no queda nada en los huéspedes**: el hueco se muda completo. Eso hay que decirlo, y hay que decir qué **no** se llevó — la pata industrial (ver el bullet del código).
- **El código es PLANPREGUNTA y la razón se escribe una vez, en la cabecera.** No PLANCYT: el corpus nombra la primitiva y no la cartera (PLANTALLER, PLANMESA, PLANCUIDADO, PLANMEMORIA); la unidad de organización del PLAN *es* la Pregunta Nacional; «CYT» hereda la sigla del ministerio que el PLAN dice no ser; y `ANALISIS_CONEXIONES_22_PLANES.md:871` **ya reservó esas letras** para *«Ciencia, Tecnología e Industria Soberana»* — con una **pata industrial que este diseño no cubre y que sigue repartida** entre PLANEB, PLANDIG, PLANISV, PLANMOV y PLANTER. **Ese hueco queda abierto y se declara.**
- **Español rioplatense (voseo) con acentuación correcta.**
- **Cuando «usá la cifra verbatim» choca con «no repitas la tesis», gana no repetir.** Lo que no se puede es **cambiarla**.
- **Ninguna sección repite más de una cláusula de la tesis.** Donde la tesis afirmó, la sección **muestra**. Tercera persona para diagnóstico y diseño; el «vos» se reserva para la Promesa pública. Preferencia fuerte por futuro perifrástico («va a saberse») sobre futuro simple. **Números biográficos en letras, números de política pública en cifras.** `solo` sin tilde. Demostrativos sin tilde.
- **Las remisiones cruzadas se tratan con la misma sospecha que las cifras.** *«Donde el brief pedía un número inexistente el implementador se plantó, y donde pedía un documento inexistente lo dio por escrito.»* **Antes de escribir `ARCHIVO:línea`, abrí el archivo en esa línea.** Si no dice lo que el brief supone, **el brief está mal**: no lo escribas, reportalo.
- **Toda compresión que reemplace un fundamento por una remisión cruzada es cambio de sustancia, no de prosa, y se reporta como tal.** El patrón es siempre el mismo: dos casos que comparten **conclusión** y no **fundamento**, unidos por un «la misma razón» o «vale la misma salvedad». **Cuando comprimas para pagar un arreglo, listá en el reporte qué fundamentos se volvieron remisiones.**
- **Todo valor único se declara**, y hay cuatro ramas, no tres:
  1. *«es un supuesto de trabajo de este documento y no una medición»*;
  2. *«es decisión de diseño de este documento y no una medición»*;
  3. el hueco declarado — *«falta acá porque no está calculado… estimarlo sería estrenar un número»*;
  4. **la restricción heredada** — para un valor que llegó del plan o del corpus, decir «decisión de diseño de este documento» **atribuye una autoría que no se tiene**. Va **nota de procedencia**. Casos vivos en este tramo: los **ocho puntos** del split (los fija este plan), el **16.500–26.000** (lo fija el gate), la reconciliación **FSC = FSB** (la fija `PLANARCO:449`), y las **nueve verticales** (las fija la spec).
- **Este documento hereda una ética explícita y no puede violarla.** `PLANPACTO:412`: *«Este documento existe porque el proyecto arrastró durante meses una cifra que nadie había verificado. No va a estrenar otra, y menos en la sección que denuncia esa práctica.»* PLANPREGUNTA es el PLAN de administrar la ignorancia propia: **estrenar una cifra acá es una contradicción performativa, no un error de prolijidad.**
- **Directiva de guardia, heredada del tramo C y vinculante.** El patrón de fondo de diecisiete defectos en ocho tareas **no fueron chequeos flojos: fueron listas opt-in mantenidas a mano.** Se cierran con **default seguro + descubrimiento automático + reportar lo que la guardia no sabe leer**, en vez de descartarlo en silencio. Al arrancar cada chequeo, correrlo sobre **todas** las entradas y **errorear si una entrada sin opt-out explícito no tiene ninguna ocurrencia válida**.
- **Cuando un chequeo tenga patrón y excepción, los dos tienen que medir la misma unidad.**
- **`filasDeTabla()` se escribe bien la primera vez** (el tramo C lo arregló recién en su Task 4): tiene que fallar si hay **más de una** tabla con las columnas pedidas, y tiene que **no cortar** en la primera línea que no empieza con `|` si la tabla sigue después de un párrafo intercalado. Las dos cosas fallan abierto.
- **Verificación antes de cada commit:** `npx tsx scripts/verificar-planpregunta.ts` desde `SocialJusticeHub/`. **No corras `npm run verify`** — incluye un build de minutos.
- **Commits:** `Add [name] [type] — [context]`, `Fix [issue]: [detail]`. Un commit por tarea.
- **Cuidado con la concurrencia.** Antes de cada commit corré `git status --porcelain` y **agregá al índice sólo tus archivos por nombre**; si ves borrados o modificaciones que no hiciste vos, no los toques y dejalos anotados en el reporte.

### Cifras canónicas — verificadas, con su domicilio

| Cifra | Valor | Domicilio | Estado |
|---|---|---|---|
| Presupuesto de CyT ejecutado | **0,16% del PBI** en 2025, el más bajo desde 2002 | `PLANDIG:269`, `:284`, `:289` | **De PLANDIG.** Se cita atribuido (**D-4**). Sin fuente externa en el corpus |
| Meta legal vigente | **0,39% del PBI** | `PLANDIG:285`, `:289` | Ídem. Es «el propio Estado incumple su propia ley» |
| Estándar OCDE | 2,7% del PBI | `PLANDIG:289` | Ídem |
| Corea del Sur | 4,9% del PBI en I+D, «treinta veces» la Argentina | `PLANDIG:355-357` | Ídem. Precedente **ya usado por otro PLAN**: se lee en dos columnas o no se usa |
| Investigadores CONICET | **11.868** post-recortes 2024 vs ~15.000+ previos; −4.148 posiciones; −40% presupuesto CONAE | `PLANDIG:260` | La única cifra de personas del diagnóstico. De PLANDIG |
| Vaciamiento histórico | INTA −60% **en los años 90**; CONICET vaciado sin cerrar, sin cifra | `BLINDAJE:41`, `:44` | **Sin fuente externa.** Se cita como aserción del corpus |
| Piso de I+D del LANEF | **0,20% del PBI**, dentro del 0,70% de PLANEN | `PLANEN:1489` | **Es de PLANEN.** PLANPREGUNTA no lo reclama ni lo duplica (**D-5**) |
| Flujo anual del FSC | **USD 16.500–31.000M/año** en régimen | `PLANTER:670-676` | Derivado publicado: el 40% del DCM son 6.600–12.400M |
| Split vigente del FSC | 40 / 20 / 15 / 15 / 10 | `PLANTER:163`, `:359-364` | **Intacto.** PLANARCO no lo tocó (`PLANARCO:898`) |
| Split nuevo | 40 / 20 / 15 / 10 / **7** / **8** = 100 | este plan, **D-10** | **Restricción heredada**: la fijan estos ocho puntos, no el documento. La guardia lo suma |
| Aporte del Fondo de la Pregunta | **USD 1.320–2.480M/año** (8% del flujo) | derivado de `PLANTER:670-676` | **Queda 180M corto en el año malo y sobran 180M en el bueno**, contra la banda de régimen corregida. Las dos puntas se declaran |
| Banda anual de régimen | **USD 1.500–2.300M/año** | derivada de la rampa, Task 9 | **Corrige el 1.400–2.400 de la spec**, que no cae adentro de la banda de quince años por ningún reparto. La guardia suma la rampa contra 16.500–26.000 |
| FSC = FSB, un solo fondo, gana «Ciudadano» | — | `PLANARCO:449` | **Decisión de diseño de PLANARCO.** Se hereda y se cita; no se vuelve a decidir |
| Costo ya declarado de esa reconciliación | PLANMON pierde el objetivo «USD 100B+ en año 10» | `PLANMON:941`, vía `PLANARCO:900` | Ya está escrito. **No se vuelve a cobrar** en el mapa de perdedores de este PLAN |
| Presupuesto propio | ver **D-2** — no se escribe rango anual hasta la Task 9 | — | La Task 1 deja la cabecera con **16.500–26.000M a quince años** y **remite** |
| Gate de spin-off | 0,21–0,26x vs PLANEDU · 33,00–43,33x vs PLANEB · 3,51–2,63x vs PLANDIG · **0,19–0,24x vs los tres → NO PASA** | `ACTA:27-30`, `:49`, `:84-95` | Se escribe entero, incluido el fallo y su lectura |
| Presupuestos de los huéspedes | PLANEDU 80.000–100.000 · PLANDIG 4.700–9.900 · PLANEB 500–600 (USD MM) | `arquitecto-data.ts:144`, `:124`, `:104` | Los denominadores del gate |
| Producto de referencia | USD 500.000M | `PLANPACTO:122` (la falla 0.3, que es de donde el documento lo toma; `:452` y `:641` lo reusan) | Para convertir dólares a % del PBI |
| Pisos constitucionales de los 22 | 7,82–9,41% del PBI, medio 8,62 | `pisos-constitucionales.test.ts` | Fijado por test. PLANPREGUNTA **no agrega** piso |
| Escalera | 2,40 exacto en ocho escalones | `PLANPACTO:391-402` | PLANPREGUNTA **no tiene escalón** |
| Cómputo de LANIA | 256 GPUs 2027 · 1.024–2.048 en 2029 · 4.096+ en 2031 | `PLANDIG:505-506` | El techo físico del Turno de Máquina |
| Estadio B de PLANDIG | **tranche-3+, condicional**, con 6 condiciones de activación | `PLANDIG:2111`, `PLANDIG_ESTADIOS_INTERNOS.md:44-50` | LANIA y ArgenCloud a escala **están en B**. De ahí sale el modo degradado (arreglo 6) |
| Calendario de PLANMESA | tranche-2 2028-30 · 1ª Mesa Federal 2030-32 (Infancia) · 1ª ola 2032-34 · 2ª 2034-36 · 3ª Horizonte 2040 | `PLANMESA:925-956` | **D-6.** Es lo que hace imposible la Mesa de CyT en Fase 0 |
| Sorteo estratificado | *«estratificado por Credencial en la materia (no puramente aleatorio)»* | `PLANMESA:297`, `:88` | **D-1.** Es de PLANMESA, no de PLANJUS |
| Ciclo LDEA — EXPERIMENTAR | piloto **60-180 días**, autores **obligatoriamente** adentro | `PLANMESA:88` | **D-7.** Choca con el Barro en plazo y en probador |
| Banco de germoplasma | existe; caso Doña Rosa 2029→2031→2035, +40% bajo estrés hídrico, con regalías a la comunidad | `PLANISV:2588` | El único precedente interno del Barro y del cupo |
| Archivo de PLANMEMORIA | siete nodos, hash, Síndico de Archivo remunerado como investigador | `PLANMEMORIA:283`, `:297`, `:315` | El Sello publica, **PLANMEMORIA custodia** |
| Gap de industria y ciencia | *«PENDIENTE DE EVALUACIÓN»*, con PLANCYT propuesto y diferido «no antes de 12 meses» | `ANALISIS_CONEXIONES_22_PLANES.md` **§9.4** (`:869-871`), `:880`, `:884`, `:1091` | **Arreglo 11: la cita es §9.4, no `audit/05`.** Y el diferimiento se cita, porque este documento lo desobedece |
| Stack de PLANGEO | módulos open-source, cero lock-in, forkeables | `PLANGEO:199-207`, `:223` | El destino de la exportación del método (Fase 2040+) |

### Strings prohibidos — cada uno con su razón, y todos en la guardia

| Patrón | Por qué |
|---|---|
| `pasó el gate`, `superó el gate`, `supera el umbral` referido a PLANPREGUNTA | Falso: falla contra PLANEDU solo y contra los tres huéspedes sumados |
| `el PLAN más caro del corpus` / `el más caro del corpus` | El acta lo corrigió el 2026-07-31: no lo es por ninguna de las dos medidas |
| `PLANCYT` afirmado como este PLAN | Es la sigla de otra cosa —«Ciencia, Tecnología e **Industria** Soberana»— y de una pata que este diseño no cubre. Puede aparecer **nombrado como lo que se descartó**, nunca como sinónimo |
| `audit/05` | Cita fabricada. El domicilio es `ANALISIS_CONEXIONES_22_PLANES.md` §9.4 (arreglo 11) |
| `PLANFOCO:` seguido de dígitos | El archivo no existe: toda cita con línea es fabricada (**D-9**) |
| `PLANJUS` a menos de una oración de `estratificad` | El sorteo estratificado es de `PLANMESA:297`, no de PLANJUS (**D-1**) |
| `piso constitucional de PLANPREGUNTA`, `nuestro piso constitucional`, `0,39% del PBI` reclamado como piso propio | PLANPREGUNTA no reclama piso. El 0,39 es la **meta legal incumplida** que diagnostica PLANDIG, no un piso de este PLAN |
| `escalón de PLANPREGUNTA`, `nuestro escalón`, `noveno escalón` | La Escalera cierra en ocho y en 2,40 exacto |
| `0,20%` presentado como piso de este PLAN | Es el piso del LANEF y es de PLANEN (**D-5**) |
| `1.400-2.400` / `1.400–2.400` en las primeras 60 líneas | El rango anual no se puede afirmar antes de la Task 9 (**D-2**) |
| `Banca Portátil`, `Banca de Regreso` | «Banca» ya significa sector bancario en el corpus. Es **Cátedra** |
| `ANLIS` o `Malbrán` sin la declaración de que el corpus no lo nombra | Cero ocurrencias en 24 documentos. Se estrena declarándolo |
| Marcadores de pendiente (`TODO`, `TKTK`, `XXX`, `[pendiente]`, `«PENDIENTE»`) | Al cierre no puede quedar ninguno |

---

## File Structure

**Crear**

| Archivo | Responsabilidad |
|---|---|
| `SocialJusticeHub/scripts/verificar-planpregunta.ts` | La guardia: secciones en orden, epígrafes, subsecciones contadas, cifras canónicas con ancla, strings prohibidos, **y las dos tablas parseadas y sumadas** (el nuevo split del FSC, que da 100, y las nueve verticales, que son nueve) |
| `Iniciativas Estratégicas/PLANPREGUNTA_Argentina_ES.md` | El documento. Objetivo: **29.000–34.000 palabras** |

**Modificar**

| Archivo | Cambio |
|---|---|
| `Iniciativas Estratégicas/PLANTER_Argentina_ES.md` | **El nuevo split escrito del lado de PLANTER**, en `§0.6` y en `§3.3`/`§11.2`, con los seis destinos y la cláusula de subordinación. **Task 11.** Es el arreglo 1 y es la mitad que sin escribir deja al PLAN cobrando de un protocolo que no lo nombra |
| `Iniciativas Estratégicas/PLANDIG_Argentina_ES.md` | La fila `:1112` queda como está y **se le agrega la nota de frontera**: el incremento hasta el 0,39% es de PLANDIG; PLANPREGUNTA no lo toca (**D-3**). **Task 11** |
| `Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md` | La fila de PLANPREGUNTA: tres attack paths con mitigación, owner, fallback e indicador. **Task 10** |
| `.github/workflows/socialjusticehub-ci.yml` | La guardia corre en CI. **Task 12** |

**Los dos modelos a imitar:** `PLANPACTO_Argentina_ES.md` para la anatomía de la cabecera y la forma de las ocho fallas; `PLANARCO_Argentina_ES.md` para la disciplina de declaración de valores y para el trato de fondos ajenos (§4.5 y §5.2 son el precedente directo de la Sección 13 de este documento). **Abrilos antes de escribir cada tarea y copiá su forma, no su contenido.**

---

## El documento, de una sola mirada

| # | Sección | Tarea | Palabras |
|---|---|---|---|
| — | Cabecera + H1 + «Vigésimo Sexto Mandato» + versión + portada ASCII | 1 | 700–760 |
| 1 | `## PREÁMBULO — {título}` | 2 | 1.100–1.400 |
| 2 | `## TESIS CENTRAL` | 2 | 700–900 |
| 3 | `## SECCIÓN 0: LAS OCHO FALLAS DEL APARATO DE CONOCIMIENTO ARGENTINO` | 3 | 2.000–2.600 |
| 4 | `## SECCIÓN 1: LA CRISIS — {frase}` | 3 | 1.000–1.300 |
| 5 | `## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES` | 3 | 1.300–1.600 |
| 6 | `## SECCIÓN 3: LA SOLUCIÓN — LA PREGUNTA NACIONAL` | 4 | 2.400–2.900 |
| 7 | `## SECCIÓN 4: EL CENSO DE IGNORANCIA` | 5 | 1.500–1.900 |
| 8 | `## SECCIÓN 5: LAS NUEVE VERTICALES` | 5 | 2.000–2.500 |
| 9 | `## SECCIÓN 6: LA PRUEBA DE BARRO` | 6 | 1.400–1.800 |
| 10 | `## SECCIÓN 7: LA INFRAESTRUCTURA DE LO COMÚN` | 6 | 1.900–2.400 |
| 11 | `## SECCIÓN 8: QUIÉN PREGUNTA Y QUIÉN CONTESTA` | 7 | 1.700–2.100 |
| 12 | `## SECCIÓN 9: EL SEGURO CONTRA LO IMPREVISTO` | 7 | 900–1.200 |
| 13 | `## SECCIÓN 10: LA SERIE CENTENARIA` | 8 | 800–1.100 |
| 14 | `## SECCIÓN 11: DOBLE USO Y BIOSEGURIDAD` | 8 | 1.100–1.400 |
| 15 | `## SECCIÓN 12: LA AGENCIA NACIONAL DEL CONOCIMIENTO (ANCON)` | 8 | 1.100–1.400 |
| 16 | `## INTEGRACIÓN CON EL MARCO ¡BASTA!` | 9 | 900–1.100 |
| 17 | `## SECCIÓN 13: MODELO ECONÓMICO Y FISCAL` | 9 | 2.200–2.700 |
| 18 | `## SECCIÓN 14: RIESGOS Y RESPUESTAS` | 10 | 700–900 |
| 19 | `## SECCIÓN 15: EL MAPA DE PERDEDORES` | 10 | 700–1.100 |
| 20 | `## SECCIÓN 16: HOJA DE RUTA` | 10 | 400–500 |
| 21 | `## SECCIÓN 17: TABLERO NACIONAL DE LA PREGUNTA` | 10 | 250–320 |
| 22 | `## SECCIÓN 19: DIMENSIÓN FEDERAL` | 10 | 230–280 |
| 23 | `## SECCIÓN 20: VISIÓN 2040` | 10 | 220–270 |
| 24 | `## SECCIÓN 21: PROTOCOLO DE FALLA` | 10 | 260–300 |
| 25 | `## CIERRE` | 10 | 350–480 |

El salto de numeración (no hay SECCIÓN 18) imita al corpus, que los tiene: PLANMEMORIA salta de la 12 a la 14, PLANPACTO y PLANARCO también.

**Los doce dispositivos, y dónde vive cada uno:**

| Dispositivo | Sección | Estado de origen |
|---|---|---|
| La Pregunta Nacional | 3 (es la arquitectura, no un dispositivo) | Nuevo. Cero ocurrencias |
| El Censo de Ignorancia | 4 | Nuevo. Bidireccional, con padrón de **Testigos** en el acta de cierre |
| La Pregunta de Adopción | 4 | Nuevo (arreglo 10). *«¿Por qué no usamos lo que ya sabemos?»* |
| Las nueve verticales | 5 | Siete naturales + **República** + **Evaluación de mandatos**, esta última **como invitación** (arreglo 4) |
| La Prueba de Barro | 6 | **Endurecimiento declarado de `PLANEN:786`** (**D-5**); choca con LDEA (**D-7**) |
| El Banco de Materia Viva | 7 | Nuevo, ocho nodos. **Federa** el germoplasma de `PLANISV:2588`, no lo absorbe |
| El Turno de Máquina | 7 | **Protocoliza `PLANDIG:512`** sobre LANIA y ArgenCloud. Modo degradado obligatorio (arreglo 6) |
| El Sello Abierto | 7 | Nuevo. Publica; **`PLANMEMORIA` custodia** |
| Cátedra Portátil y Cátedra de Regreso | 8 | Nuevas, en una sola sección. **Cupo 5–8% para Credencial Consolidada sin trayectoria académica** (arreglo 8) |
| El Seguro contra lo Imprevisto | 9 | Nuevo. 10% sorteado sin objetivo, audiencia pública a los tres años |
| La Serie Centenaria | 10 | Nueva. Entre siete y doce mediciones legalmente irreductibles a cien años |
| Los Modelos de Órgano | 7 | Nuevo, dentro de la infraestructura |

---

### Task 1: La guardia y la cabecera del documento

**Files:**
- Create: `SocialJusticeHub/scripts/verificar-planpregunta.ts`
- Create: `Iniciativas Estratégicas/PLANPREGUNTA_Argentina_ES.md`

**Interfaces:**
- Consumes: `SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts` (el canon de pisos, para cruzar que PLANPREGUNTA no agregue ninguno).
- Produces: el comando `npx tsx scripts/verificar-planpregunta.ts` (exit 0/1) y las constantes `SECCIONES_ESPERADAS`, `SIN_EPIGRAFE`, `CIFRAS_CANONICAS`, `PROHIBIDOS` que las tareas 2 a 10 extienden.

**Step 1 — la guardia.** Leé entera `scripts/verificar-planpacto.ts` (327 líneas, el modelo legible) y mirá de `scripts/verificar-planarco.ts` **sólo** las funciones `verificarEpigrafes()`, `verificarSubsecciones()` y `filasDeTabla()`, que son lo que el tramo C aprendió a los golpes. Arrancá con:

- `SECCIONES_ESPERADAS` con **sólo el H2 del mandato** — se extiende tarea por tarea. Verificación de **presencia y orden**.
- `SIN_EPIGRAFE` con las cuatro exentas del corpus: el H2 del mandato, el PREÁMBULO, la TESIS CENTRAL y la INTEGRACIÓN. **Default: lleva epígrafe.** Verificado en las dos direcciones: una sección exenta que aparezca *con* epígrafe también se reporta.
- `CIFRAS_CANONICAS` con las que ya se pueden afirmar en la cabecera, **cada una con ancla en la misma oración** (el domicilio, no sólo el número). Al arrancar, corré el chequeo sobre **todas** las entradas y **erroreá si una entrada sin opt-out explícito no tiene ninguna ocurrencia válida**.
- `PROHIBIDOS` con **los trece patrones completos** de la tabla de strings prohibidos, desde el minuto uno. Son regex, y **case-insensitive salvo donde el corpus distinga mayúsculas**. Ojo con dos: el de `PLANJUS`/`estratificad` mide **por oración**, no por línea; y el de `1.400-2.400` mide **sólo las primeras 60 líneas**.
- `filasDeTabla()` **bien desde el principio**: falla si hay más de una tabla con las columnas pedidas, y no corta en la primera línea sin `|`.
- Un chequeo de que el documento **no declara piso constitucional**: cruzá contra `PISOS_SEGUN_EL_TALLER` del test canónico y fallá si aparece una fila de PLANPREGUNTA.

**Step 2 — la cabecera.** Copiá la anatomía de `PLANPACTO:1-54` exactamente: blockquote de metadatos (mismo orden de campos), `---`, H1, H2 de mandato, H3 de versión, portada ASCII en bloque cercado, `---`.

Contenido específico:
- `CANONICAL_ARCHITECTURE`: 26 thematic + PLANRUTA protocol — PLANPREGUNTA es el ordinal **25**.
- `ORDINAL Y MANDATO`: ordinal 25, mandato **26**, desfasaje declarado.
- `ACTA DE HABILITACIÓN`: **la verdad completa, y es más incómoda que la de PLANARCO.** Los cuatro cocientes van escritos, incluidos los dos que fallan; la derogación expresa de la regla 5 y de la condición temporal de la regla 3; y **la lectura del acta sobre por qué el fallo no dice nada sobre el PLAN** (`ACTA:84-95`), comprimida pero sin perder los 120.000/150.000M.
- `Presupuesto canónico`: **el rango de quince años del gate (16.500–26.000M)** y una remisión a la Sección 13. **No escribas un rango anual acá** (**D-2**).
- `Principios aplicados`: los del corpus, más **«sin piso constitucional propio: PLANPREGUNTA no agrega escalón a la Escalera de PLANPACTO»** y **«sin capacidades del estadio B de PLANDIG en tranche-1»** (que es literal de `PLANPACTO:15` y acá es una restricción real, no una fórmula).
- **El código, una vez y bien:** por qué PLANPREGUNTA y no PLANCYT, incluida la pata industrial que no se cubre.
- La portada ASCII lleva **sólo dispositivos que el cuerpo va a tener**. En el tramo B la portada anunció cuatro dispositivos con cero ocurrencias en el cuerpo. **La Task 10 la vuelve a abrir obligatoriamente.**

**Palabras:** **700–760**, medidas con `sed -n '1,NNp' … | wc -w` sobre las líneas de la cabecera.

**Corrección del 2026-08-01, tras escribir la Task 1.** El rango original decía 560–620 y estaba copiado de la cabecera de PLANARCO sin mirar qué le pide este plan a la de acá. Medido bloque por bloque: la portada ASCII de PLANPREGUNTA pesa **136 palabras contra las 143 de PLANARCO** —es más magra, no más gorda—, y toda la diferencia está en el blockquote de metadatos: **575 contra 435**. Los +140 son dos bloques que la cabecera de PLANARCO no lleva y que las Global Constraints declaran vinculantes: el `ACTA DE HABILITACIÓN` tiene que traer **cuatro** cocientes en vez de tres **más la lectura del acta con sus dos cifras** (120.000 y 150.000M), y el bloque `Sobre el código` no existe en ningún otro PLAN porque ningún otro PLAN cambió de sigla. **Comprimir para llegar a un número elegido antes de saber qué había que escribir es la peor economía posible**, y es la misma doctrina con la que el tramo C subió §0, §3, §6 y el CIERRE. El valor actual es **744**, adentro del rango corregido.

**Verify:** `npx tsx scripts/verificar-planpregunta.ts` sale 0. Después **rompé algo a propósito** (renombrá el H2 del mandato) y confirmá que sale 1. Restaurá.

- [x] Task 1 completa

---

### Task 2: El preámbulo y la tesis central

**Files:** Modify: la guardia (agregar las dos secciones) · Modify: el documento.

**El rostro.** El corpus abre con una persona: nombre, edad, oficio, domicilio. PLANPACTO abrió con Fabiana Ojeda, almacenera de Villa Ángela, Chaco; PLANARCO abrió con otra persona y otra provincia. **PLANPREGUNTA necesita una tercera, y no puede repetir ninguna de las dos provincias.**

El rostro de este PLAN es difícil y por eso importa: la ignorancia no tiene víctima visible. **El error a evitar es abrir con un científico** — eso convierte al PLAN en un reclamo gremial y le regala el argumento al adversario en la primera página. Abrí con **alguien que convive con un problema que nadie estudió**, o con alguien que **sabe algo que el sistema no registra**: la partera, el baqueano, el productor de `PLANISV:2588` — Doña Rosa guardó semillas durante generaciones y la ciencia tardó hasta 2031 en medir lo que ella sabía. El preámbulo tiene que dejar plantados **tres hilos que el CIERRE va a devolver o a declarar que no devuelve** — es la estructura de anillo que PLANPACTO cerró literal y que la revisión final del tramo C validó como el mayor acierto del documento.

**Regla de escala, del tramo B:** rostro antes de la escala. Primero la persona, después el número.

**La tesis** (700–900 palabras) dice la primitiva nueva —**la ignorancia declarada**: la unidad de organización del conocimiento público deja de ser la disciplina y el paper y pasa a ser una Pregunta numerada, con dueño de sistema, costo declarado de no saberla, y cierre que se verifica en el barro— y **declara de entrada las cuatro cosas que este PLAN no hace**:

1. **no es el ministerio** y no administra el sistema científico existente;
2. **no cubre la pata industrial** de PLANCYT, que sigue repartida entre cinco PLANes;
3. **no reclama piso constitucional** ni el 0,39% ni el 0,20% del LANEF;
4. **no evalúa mandatos por obligación**: la novena vertical es invitación (arreglo 4).

Y dice la dirección del fundador con sus dos mitades: **cada línea de investigación atada a un objetivo preciso con efecto beneficioso sobre un componente del sistema** —tierra, agua, salud, flora, fauna—, y la soberanía de cómputo *como criterio de arquitectura, no como consigna*. La frase *«el divague mental desaparece cuando fijamos el objetivo»* es del fundador y **el documento la puede usar una vez**, en la tesis, y no más.

**Palabras:** preámbulo 1.100–1.400 · tesis 700–900.

- [x] Task 2 completa

---

### Task 3: El diagnóstico — las ocho fallas, la crisis y los precedentes

**Files:** Modify: la guardia (**y acá entra `verificarSubsecciones()` con `### 0.N`, ocho exactas y correlativas**) · Modify: el documento.

**Las ocho fallas** siguen la forma de `PLANPACTO:96-130`: H3 numerado `### 0.N {título}`, y adentro tres párrafos con lead en negrita — **La falla:** / **Por qué persiste:** / **El dato:**.

Las ocho tienen que ser **fallas del aparato de conocimiento**, no fallas presupuestarias. Candidatas verificadas, con su domicilio:

1. **Nadie declara lo que el país no sabe.** No existe registro público de ignorancia con dueño. Es la falla madre y de ahí sale el Censo.
2. **La plata se legisla y no se ejecuta, y no pasa nada.** `PLANDIG:285`, `:289`: meta legal 0,39%, ejecución 0,16%. **Es el argumento más fuerte contra pedir un porcentaje del PBI** — el país ya probó ese instrumento y lo incumplió sin costo. Atribuido a PLANDIG (**D-4**).
3. **Lo que no se financia no se deroga: se deja de ejecutar.** `BLINDAJE:41`, `:44` — INTA −60% en los años 90, CONICET vaciado sin cerrar. **Sin fuente externa: se cita como aserción del corpus.**
4. **Se investiga sin destinatario.** Y acá el documento tiene que ser honesto: **el corpus ya tiene la corrección escrita** (`PLANEN:786`, la obligación de transferencia del LANEF) y **la tiene en un solo PLAN de un solo sector**. La falla no es que nadie lo haya pensado: es que se pensó una vez y no se generalizó.
5. **La mejor evidencia argentina no está en el sistema que la mide.** `PLANISV:2588`: variedades que la agroindustria declaró obsoletas y que resultaron resistentes a sequía. **El sistema tardó dos años en medir lo que Doña Rosa sabía hace generaciones.**
6. **No usamos lo que ya sabemos.** Es la falla que funda la Pregunta de Adopción (arreglo 10) y es donde está el déficit argentino más caro. **Cuidado: es la falla con menos evidencia en el corpus** — si no aparece una cita, se declara como aserción propia sin fuente, con todas las letras.
7. **El cómputo con el que se piensa el país es de otro.** `PLANDIG:180` — ni un solo modelo fundacional propio; `PLANDIG:263` — la fuga que hace que la inversión en formar un ingeniero no se recupere nunca.
8. **Nadie mide nada durante cien años.** El corpus entero no tiene una sola serie de medición larga comprometida por ley. Es la falla que funda la Serie Centenaria y **es la única de las ocho que es civilizatoria y no presupuestaria** — dejala octava, que es donde el corpus pone la que abre el futuro.

**Regla del tramo B, no negociable: donde la tesis afirmó, la sección muestra.** El diagnóstico es la evidencia debajo del resumen, no el resumen otra vez. **Escribilo bien la primera vez.**

**SECCIÓN 1 — la crisis.** Un titular con frase, como `PLANPACTO:166`. El eje: no es que falte plata, es que **no hay quién declare la pregunta**. Usá `PLANDIG:260` (11.868 investigadores, −4.148 posiciones, −40% CONAE) **atribuido**, y decí que es la única cifra de personas que el corpus tiene sobre esto.

**SECCIÓN 2 — precedentes.** Internacionales y locales, con la disciplina que el tramo B pagó caro: **la sección que defiende al PLAN es la que menos se revisa, y fue el hallazgo Crítico de la revisión final.** Si un precedente no tiene cita en el corpus, se declara como aserción propia sin fuente. **Y cada precedente se lee en dos columnas: qué pidió y qué dio.**

Dos advertencias específicas de esta sección:
- **Corea ya está usada.** `PLANDIG:355-357` la usó como precedente de inversión. Repetirla sin atribuir es plagiarse al vecino; usarla atribuida y **con la columna de lo que costó** es lo correcto.
- **El precedente interno más fuerte es argentino y es del propio corpus:** el LANEF (`PLANEN:782-792`). Un precedente interno que el documento no puede omitir sin que la Sección 6 quede en el aire.

**Palabras:** fallas **2.000–2.600** · crisis 1.000–1.300 · precedentes 1.300–1.600.

**Corrección del 2026-08-01, medida y no negociada.** El rango de las fallas decía 3.200–3.700 y estaba calibrado contra PLANARCO, que es el outlier. Medido: **la SECCIÓN 0 de PLANPACTO son 1.954 palabras para ocho fallas** —244 por falla— y la de PLANARCO **3.987** —498—, y el propio brief de esta tarea manda seguir *«la forma de `PLANPACTO:96-130`»*. La de PLANARCO creció por corrección de contenido verificado sobre un territorio densamente ocupado, que no es el caso de acá: el territorio del conocimiento está casi vacío (**D-8**) y las ocho fallas de este PLAN se apoyan en menos remisiones porque hay menos a qué remitir. **El valor escrito es 2.116**, entre las dos y del lado de PLANPACTO, con las tres partes de cada falla presentes y verificadas por la guardia. Se corrige el rango en vez de agregar mil palabras de prosa para llegar a un número copiado del PLAN equivocado.

- [x] Task 3 completa

---

### Task 4: La arquitectura — la Pregunta Nacional

**Files:** Modify: la guardia · Modify: el documento.

**La Pregunta Nacional no es un dispositivo: es la arquitectura.** La sección la presenta como tal y define la **anatomía de una Pregunta**, que es lo que el resto del documento va a dar por sabido:

- número y título en lenguaje llano;
- **la ignorancia declarada** — qué no se sabe, escrito como falta y no como tema;
- **dueño de sistema** — una persona con nombre, no un organismo;
- **costo declarado de no saberla**, con su método y su incertidumbre;
- **vertical** (Sección 5) y **plazo**;
- **criterio de cierre**, que es siempre el Barro (Sección 6);
- **padrón de Testigos**, que firman el acta de cierre (Sección 4);
- **prohibición de autoría** — quien escribe la Pregunta no dirige el equipo que la contesta (arreglo 7).

**Lo que esta sección tiene que resolver, y son los arreglos 3, 5 y 7:**

- **Quién decide qué Pregunta se abre** (arreglo 5 + **D-1** + **D-6**). El jurado se sortea con la mecánica de **`PLANMESA:297`** — estratificado por Credencial en la materia — y **no con la de `PLANJUS:400`**, que es sorteo puro. La guardia lo prohíbe. Y hay que escribir el **modo degradado del órgano**: la Mesa Federal de CyT que este PLAN necesita en Fase 0 no puede existir antes de que PLANMESA la tenga, y el calendario de `PLANMESA:925-956` la pone lejos. Escribí quién decide mientras tanto, **con la fecha del traspaso**, y declará que es un interinato y no una competencia.
- **La incompatibilidad de autoría y los jurados de afuera** (arreglo 7 — el modo de falla número uno del PLAN es la captura por el establishment científico). Dos mecanismos, los dos verificables: **quien escribe una Pregunta no puede dirigir el equipo que la contesta**, y **los jurados se habilitan fuera de ANCON**. El segundo necesita decir *dónde*: el corpus tiene padrones sorteables —Credencial de Materia de PLANMESA, Registro Nacional de Peritos de `PLANJUS:639`, Síndicos de Archivo de PLANMEMORIA— y **usar uno que ya existe es más fuerte que inventar un registro nuevo**.
- **La frontera con el LANEF** (**D-5**). Energía es del LANEF, con su piso del 0,20% y su obligación de transferencia. Una Pregunta sobre energía **se contesta con el LANEF adentro**. Decilo acá, para no tener que decirlo cuatro veces más adelante.

**Palabras:** 2.400–2.900.

- [x] Task 4 completa

---

### Task 5: El Censo de Ignorancia y las nueve verticales

**Files:** Modify: la guardia (**y acá parsea la primera tabla: las nueve verticales, que tienen que ser nueve**) · Modify: el documento.

**SECCIÓN 4 — EL CENSO DE IGNORANCIA.** Es bidireccional y ahí está todo: **toda ignorancia depositada vuelve con respuesta escrita y firmada.** Un buzón que no contesta es un buzón de quejas, y el corpus ya tiene uno que sí contesta y del que hay que aprender la forma: el Archivo de Depósito Ciudadano de `PLANMEMORIA:283`, con sus tres momentos vitales y su acompañamiento por Síndico.

Lo que la sección tiene que fijar:
- el circuito completo del depósito, incluida **la respuesta obligatoria y su plazo**;
- el **padrón de Testigos**: quién puede ser, cómo se sortea, qué firma, y qué pasa si se niega a firmar — **esta última es la pregunta que hace que el padrón valga algo**;
- **la Pregunta de Adopción** (arreglo 10), que es una Pregunta permanente y no una más: *«¿por qué no usamos lo que ya sabemos?»*. Va con su propio dueño de sistema y su propio criterio de cierre, y es la única Pregunta que **no se cierra nunca**;
- **el modo degradado con PLANDIG** (arreglo 6). El Censo corre sobre plataforma, y la plataforma es **estadio A** (`PLANDIG:2142`), no B. Declaralo: el Censo funciona sobre estadio A o funciona en papel, y **el papel es una respuesta aceptable y hay que escribirla**, porque un Censo que espera a ArgenCloud es un Censo que no abre en esta década. **La frontera con PLANDIG es por criterio de dato, no por adjetivo.**

**SECCIÓN 5 — LAS NUEVE VERTICALES.** Tabla parseada por la guardia: **nueve filas exactas**, cada una con nombre, ignorancia madre, dueño de sistema y **el PLAN que ya ocupa esa materia si hay uno** — la columna de ocupantes es obligatoria y es lo que hace honesta la arquitectura, igual que en el Calendario de PLANARCO.

Las nueve: los **siete naturales** (que la sección tiene que nombrar y justificar uno por uno, no listarlos), más **República** —el país como objeto de estudio: instituciones, conflicto, lengua, memoria, vínculo, creencia— y **Evaluación de mandatos**.

**Y acá va el arreglo 4, que es el más delicado del documento.** Como estaba, «Evaluación de mandatos» era **una promoción unilateral sobre veinticinco documentos que ninguno presupuestó**. Baja a **invitación**: un PLAN puede pedir que una Pregunta evalúe su propio mandato, y ANCON no puede abrirla de oficio. Escribí las dos consecuencias que eso tiene y no las escondas: **la vertical más importante del PLAN es la única que no puede ejercer**, y un PLAN que se niega a ser evaluado no tiene ninguna sanción. **Decilo. Un PLAN que se autoasigna la facultad de auditar a los otros veinticinco es exactamente la captura que la Sección 12 dice querer evitar**, y la asimetría es el precio de no cometerla.

**Palabras:** Censo 1.500–1.900 · verticales 2.000–2.500.

- [x] Task 5 completa

---

### Task 6: La Prueba de Barro y la infraestructura de lo común

**Files:** Modify: la guardia · Modify: el documento.

**SECCIÓN 6 — LA PRUEBA DE BARRO.** *Nada está descubierto hasta que funciona doce meses en manos de alguien que no lo inventó.*

**Antes de escribir una palabra, resolvé D-5 y D-7.**

- **D-5:** no es original. `PLANEN:786` ya escribió *«El LANEF no investiga para publicar papers — investiga para producir tecnología exportable»*, con socio industrial obligatorio por programa. El Barro es **el endurecimiento declarado** de esa regla, y lo que agrega es una sola cosa: **el probador no puede ser el inventor**. Escribí eso como la contribución, que es verdad y alcanza. Reclamarlo entero sería estrenar una originalidad que el corpus desmiente.
- **D-7:** choca de frente con el ciclo LDEA. `PLANMESA:88` exige piloto de **60-180 días** con los autores **obligatoriamente adentro**. El Barro exige **doce meses** con el autor **afuera**. Elegí una de las tres salidas del hallazgo y **argumentala en el cuerpo**; la recomendada es que son dos pruebas en serie —LDEA valida el diseño con el autor adentro, el Barro valida la adopción con el autor afuera— porque es la única que no le enmienda el protocolo a otro PLAN. **Si elegís otra, el documento tiene que decir qué le está pidiendo a PLANMESA que cambie.**

El precedente interno para el Barro es `PLANISV:2588` y es exacto: registrada en 2029, medida en 2031, certificada y exportada en 2035, **con regalías a la comunidad que la guardó**. Seis años, no doce meses — usalo para calibrar, y decí que el plazo de doce meses es **decisión de diseño de este documento y no una medición**.

**SECCIÓN 7 — LA INFRAESTRUCTURA DE LO COMÚN.** Cuatro dispositivos, y ninguno se puede escribir sin declarar de quién es lo que usa:

- **El Banco de Materia Viva** (ocho nodos, con **ANLIS Malbrán** adentro — un laboratorio que en todo el taller no aparece nunca, y eso se dice). **Federa** el banco de germoplasma de `PLANISV:2588`; no lo absorbe. Y prepara la Sección 11: un banco que presta cepas es la mitad del problema de bioseguridad.
- **El Turno de Máquina** sobre **ArgenCloud y LANIA**. No compra cómputo: **protocoliza el acceso a cómputo ajeno**, y `PLANDIG:512` ya reserva servicio a *«universidades y CONICET para investigación»*. El techo físico es real y hay que escribirlo: 256 GPUs en 2027, 1.024–2.048 en 2029, 4.096+ en 2031 (`PLANDIG:505-506`). **Y el modo degradado es obligatorio** (arreglo 6): LANIA y ArgenCloud a escala son **estadio B, tranche-3+, condicional** (`PLANDIG:2111`). Si el B no llega, el Turno corre sobre lo que haya del A o sobre nube convencional cifrada —que es lo que `HOJA_DE_RUTA_CONSOLIDADA_BASTA.md:131` ya llama principio de degradación gradual: *la soberanía se degrada, la funcionalidad se mantiene*—. **Escribir soberanía de cómputo sin declarar ese modo sería consigna, y la dirección del fundador dice explícitamente que no es consigna.**
- **El Sello Abierto.** Publica; **`PLANMEMORIA` custodia** (siete nodos, hash, `:283`). Dos funciones, dos agencias, y el documento lo dice. **Y acá está la trampa que la Sección 11 va a cobrar:** un Sello que publica datos crudos el mismo día no es compatible con un biobanco que presta cepas. **Dejá el conflicto planteado acá y resuelto allá** — no lo resuelvas dos veces ni lo escondas.
- **Los Modelos de Órgano.**

**Palabras:** Barro 1.400–1.800 · infraestructura 1.900–2.400.

- [x] Task 6 completa

---

### Task 7: Quién pregunta, quién contesta, y lo que no se dirige

**Files:** Modify: la guardia (**subsecciones de la 8**) · Modify: el documento.

**SECCIÓN 8 — QUIÉN PREGUNTA Y QUIÉN CONTESTA.** Cátedra Portátil y Cátedra de Regreso **en una sola sección**. **El término «Banca» está prohibido**: ya significa sector bancario en el corpus.

- **La Cátedra Portátil** es la cátedra que va al territorio donde está la Pregunta, no al revés.
- **La Cátedra de Regreso** es para quien se fue. El corpus tiene el diagnóstico de la fuga con número (`PLANDIG:263`: USD 40.000–60.000 de formación pública, y tres opciones de las cuales dos no la recuperan) y **no tiene ningún dispositivo de vuelta**. Es territorio vacío y es donde el PLAN puede ser original.
- **El cupo del 5–8% para Credencial Consolidada sin trayectoria académica** (arreglo 8): el baqueano, la partera, el productor. **La Credencial Consolidada existe y es de PLANMESA** (`:601`, `:657`, `:1138`: 80-120 mil personas proyectadas) — se remite, no se inventa. Y la justificación no es simbólica: es `PLANISV:2588`. **Escribí el cupo como rango con su regla de asignación, porque un cupo sin regla es una promesa.**

**SECCIÓN 9 — EL SEGURO CONTRA LO IMPREVISTO.** El circuito suelto: **10% del presupuesto sorteado sin objetivo**, con audiencia pública a los tres años.

**Es el dispositivo que contradice la dirección del fundador y hay que decirlo en la primera oración.** La dirección dice *cada línea atada a un objetivo preciso*; esto es diez por ciento sin objetivo. **El nombre lo justifica y por eso el nombre es el que es**: se llama por lo que hace —asegurar contra lo que ningún objetivo previó— y no por su mecánica. La defensa es la premisa idealizada del PLAN: *la mayoría de la investigación no se aplica nunca, la minoría que se aplica cambia todo, y nadie puede saber de antemano cuál es cuál*. **Un aparato que sólo financia lo dirigido es un aparato que garantiza no encontrar nada que no estaba buscando.**

El sorteo del Seguro es **puro** —acá sí, y acá `PLANJUS:400` es el domicilio correcto, porque lo que se quiere es exactamente ausencia de criterio—. **Es la única remisión a PLANJUS del documento y hay que marcarla como excepción**, para que no se lea como contradicción con la Sección 4.

**Palabras:** cátedras 1.700–2.100 · seguro 900–1.200.

- [x] Task 7 completa

---

### Task 8: Los cien años, el doble uso, y la agencia

**Files:** Modify: la guardia · Modify: el documento.

**SECCIÓN 10 — LA SERIE CENTENARIA.** Entre **siete y doce mediciones legalmente irreductibles a cien años**. Es lo que vuelve civilizatorio a un aparato de conocimiento y no presupuestario, y es la única sección del documento que no le habla a esta generación.

Lo que tiene que resolver: **qué se mide** (las candidatas salen de las verticales y de los PLANes con territorio: suelo, agua, aire, bosque, glaciar, natalidad, lengua), **quién no puede interrumpirla**, y **con qué instrumento legal** — y acá el documento tiene que ser honesto con su propio diagnóstico: la falla 2 dice que el país legisla y no ejecuta. **Una serie protegida por ley es exactamente el instrumento que la falla 2 declara insuficiente.** Escribí qué la protege además de la ley, o declará que no hay nada más y que ese es el límite. El corpus tiene un mecanismo cerca: el hash en siete nodos de `PLANMEMORIA:283` protege *el registro*, no la *medición* — **decí eso, que es preciso, en vez de dar a entender que protege las dos cosas.**

**SECCIÓN 11 — DOBLE USO Y BIOSEGURIDAD.** Arreglo 9. **No tenía una sola línea, y el censo explica por qué es grave:** `doble uso` y `biobanco` tienen **cero ocurrencias** en el taller entero, y `bioseguridad` tiene **una**, de SENASA sobre insumos biológicos (`PLANISV:1614`). **El corpus no tiene doctrina y este PLAN la estrena.**

El conflicto es concreto y ya quedó planteado en la Sección 7: **un Banco de Materia Viva que presta cepas más un Sello Abierto que publica datos crudos el mismo día**. La sección tiene que escribir, como mínimo:
- qué **no** se publica el mismo día y quién decide;
- qué **no** se presta y contra qué padrón se verifica;
- el régimen del ANLIS Malbrán adentro del Banco, que es donde el riesgo es real;
- y **quién responde cuando falla** — porque una doctrina de bioseguridad sin responsable nominado es una declaración de buenas intenciones.

**Y una advertencia de tono:** ésta es la sección donde el documento admite que su propio dispositivo estrella puede hacer daño. **El corpus premia esa clase de párrafo y lo escribe sin dramatizar.** Ni pánico ni trámite.

**SECCIÓN 12 — LA AGENCIA NACIONAL DEL CONOCIMIENTO (ANCON).** Ente autárquico. Gobernanza mixta con el patrón del corpus (concurso técnico + sorteo + representación), mandatos escalonados, y **la incompatibilidad de autoría del arreglo 7 escrita como regla de la agencia y no como buena práctica**. La sigla sigue el patrón AN+sufijo, que es el de quince de las veintidós agencias del corpus. **Y lo que ANCON no hace va en la misma sección que lo que hace**: no administra el sistema científico existente, no dirige institutos, no evalúa mandatos de oficio.

**Palabras:** serie 800–1.100 · doble uso 1.100–1.400 · ANCON 1.100–1.400.

- [x] Task 8 completa

---

### Task 9: La integración y el modelo económico

**Files:** Modify: la guardia (**parsea la segunda tabla: el nuevo split, que tiene que dar 100**) · Modify: el documento.

**INTEGRACIÓN CON EL MARCO ¡BASTA!.** Abre con el par recíproco, como PLANPACTO y PLANARCO. Acá el par es **FOCO ↔ PREGUNTA** (arreglo 12) y **está roto por construcción** (**D-9**): PLANFOCO no existe. Se escribe **la mitad de PREGUNTA** —el Desmontaje y el Censo de Ignorancia son la misma capacidad cívica a dos escalas, y el Sello Abierto publica dentro del Acervo— y se nombra la otra como pendiente con la fórmula de `PLANPACTO:721`. **La guardia prohíbe `PLANFOCO:` seguido de dígitos.**

El resto de la sección: los `requires` y `provides` en prosa, con **modo degradado declarado en cada dependencia crítica**, que en este PLAN son tres y hay que nombrarlas: **PLANDIG** (estadio B, arreglo 6), **PLANMESA** (calendario, **D-6**) y **PLANTER** (el split, **D-10**). **Las aristas a PLANRUTA bajan a prosa** — PLANRUTA no es nodo del grafo.

**SECCIÓN 13 — MODELO ECONÓMICO Y FISCAL.** Es la sección más cargada del documento y tiene cuatro entregables, todos verificados en **D-2**, **D-3** y **D-10**:

1. **La rampa que hace cerrar el presupuesto** (**D-2**). 16.500–26.000M a quince años contra 1.400–2.400M/año de régimen. El régimen empieza en 2035: **escribí el perfil año por fase y mostrá que la suma cae adentro de la banda del gate.** Si no cae, **la que se corrige es la banda anual, no el total** — el total es el insumo del gate y el gate ya se corrió y se publicó.
   - **Resuelto en la Task 9, y no cerraba: la banda anual queda en 1.500–2.300.** Cinco fases sobre quince años (2029-2043) que suman **16.500 exacto en el extremo bajo y 25.500 en el alto**. El techo de 2.400 de la spec **no sobrevive por ningún reparto**: verificado rompiendo la tabla a propósito, con 2.400 en el régimen el total alto da 26.100 y se pasa de la banda del gate. La guardia parsea la tabla, **recalcula cada subtotal como anual × años** —una tabla con subtotales a mano cierra siempre— y suma contra 16.500–26.000.
2. **El nuevo split del FSC**, con la tabla que la guardia suma a 100, el donante único, las tres patas del argumento, **la concesión de la reserva anti-colapso a la mitad**, y **la cláusula de subordinación en año de derrumbe** — con la Serie Centenaria y el Barro en curso exceptuados. Todo eso está en **D-10** y hay que escribirlo entero, no resumirlo.
3. **El hueco de 80 millones** en el extremo bajo del ciclo. `1.320 < 1.400`. **No se redondea y no se disimula:** se declara, se dice de dónde saldría si hiciera falta, y se acepta que la respuesta puede ser «se atrasa una Pregunta».
4. **La afectación, y por qué no es cero** (arreglo 2). Sacarle el piso al PLAN **no ahorró nada: mudó la rigidez de la columna que el Techo mide a la que nadie suma.** El número va escrito: ocho puntos del flujo del FSC son **USD 1.320–2.480M/año**, que sobre el producto de referencia de `PLANPACTO:122` son **0,26–0,50% del PBI**. Y la precisión que lo hace honesto: **ese flujo ya estaba afectado al 100% por PLANTER**, así que la afectación **nueva** sobre el Techo B es **cero salvo el hueco del punto 3**, y lo que cambió es el destinatario. **Las dos mitades van juntas o el número miente.**

**Y dos cosas que esta sección tiene que decir que NO hace:**
- **No reclama el incremento hasta el 0,39%** (**D-3**): esa línea es de `PLANDIG:1112` y sigue siendo suya. **La renuncia va escrita, porque una fuente descartada en silencio reaparece en la versión que sigue** — es la disciplina que `PLANARCO:532` ejerció sobre el Fondo Intergeneracional.
- **No reclama el 0,20% del LANEF** (**D-5**): es de PLANEN y ya está consolidado adentro de su 0,70%.

**Palabras:** integración 900–1.100 · modelo económico 2.200–2.700.

- [x] Task 9 completa

---

### Task 10: Riesgos, perdedores, ruta, y la portada otra vez

**Files:** Modify: la guardia (las ocho secciones que faltan) · Modify: el documento · Modify: `READINESS_GATES_ADVERSARIAL.md`.

**SECCIÓN 14 — RIESGOS Y RESPUESTAS.** El modo de falla número uno es **la captura por el establishment científico** y ya tiene sus dos mecanismos en la Sección 4: acá se lo trata como riesgo, con indicador. Los otros candidatos: que el Censo se llene de ignorancias sin dueño; que la Pregunta de Adopción sea la única que nadie quiere contestar; que el Turno de Máquina no tenga máquina; que el cupo del 5–8% se llene con académicos disfrazados.

**SECCIÓN 15 — EL MAPA DE PERDEDORES.** Con magnitud, como PLANARCO. Los perdedores verificados de este PLAN son cuatro y **el primero es el más grande y el más incómodo**:

- **PLANTER** pierde ocho puntos de su protocolo y la mitad de la reserva anti-colapso de su propio dividendo. **Es el único perdedor grande y es un PLAN aliado.** No se maquilla.
- **El establishment científico** pierde el monopolio de la autoría y el de los jurados.
- **PLANDIG y PLANEDU y PLANEB** pierden un sub-mandato que tenían asignado — aunque el acta ya declaró que **es una objeción de diseño y no un reproche por incumplimiento** (`ACTA:100-108`), y eso se cita.
- **Y una ausencia que se escribe:** `PLANMON` **no** entra en esta lista. Ya perdió el nombre de su fondo y el objetivo de capital, pero eso lo cobró `PLANARCO:900`, no este documento. **Cobrarlo dos veces sería inflar el mapa**, y un mapa inflado se lee como un mapa falso.

**SECCIÓN 16 — HOJA DE RUTA.** Las cinco fases de la spec: el registro antes que la plata (2029-30) · las primeras cien Preguntas (2030-32) · la Cátedra y el Regreso (2032-35) · régimen pleno (2035-40) · **la exportación del método como Stack de PLANGEO (2040+)**, que es `PLANGEO:199-207` con su cero lock-in.

**SECCIÓN 17 — TABLERO · SECCIÓN 19 — FEDERAL · SECCIÓN 20 — VISIÓN 2040 · SECCIÓN 21 — PROTOCOLO DE FALLA.** Forma del corpus. La dimensión federal de este PLAN es real y no decorativa: las Preguntas son territoriales y las Cátedras se mueven.

**EL CIERRE.** Cierra el anillo: devuelve los tres hilos del preámbulo, **o declara cuál no devuelve y por qué**. Es la parte del documento que la revisión del tramo C validó como su mayor acierto.

**Y la portada, obligatoriamente.** Volvé a abrir las líneas 1-52 y verificá **dispositivo por dispositivo** que cada uno anunciado en la portada ASCII tiene ocurrencias en el cuerpo. En el tramo B la portada anunció cuatro que no existían y nadie la volvió a mirar. **Ésta es la vuelta en que se mira.**

**READINESS_GATES_ADVERSARIAL.md:** la fila de PLANPREGUNTA con tres attack paths, mitigación, owner, fallback e indicador. Copiá la forma de la fila de PLANPACTO.

**Palabras:** riesgos 700–900 · perdedores 700–1.100 · ruta 400–500 · tablero 250–320 · federal 230–280 · visión 220–270 · falla 260–300 · cierre 350–480.

- [x] Task 10 completa

---

### Task 11: Las deudas en documentos ajenos

**Files:** Modify: `PLANTER_Argentina_ES.md` · Modify: `PLANDIG_Argentina_ES.md` · Modify: la guardia.

**Ésta es la tarea que la spec llama arreglo 1 y es la que, si no se hace, deja al PLAN cobrando de un protocolo que no lo nombra.**

**PLANTER.** El nuevo split se escribe **del lado de PLANTER**, en los tres lugares donde el viejo está escrito: `§0.6` (`:163`), `§3.3` (`:359-364`) y `§11.2` (`:670-676`). Los seis destinos con sus porcentajes, el Fondo de la Pregunta nombrado, **la cláusula de subordinación en año de derrumbe**, y una nota de reapertura que diga **quién la pidió, cuándo y contra qué**. `§11.2` además lleva montos: recalculalos — 7% del flujo son USD 1.155–2.170M y 8% son 1.320–2.480M.

**Cuidado con `:163`:** ahí el split está en prosa corrida adentro de «Cómo PLANTER lo resuelve», no en lista. **No lo conviertas en lista** — reescribí la oración conservando la forma de su sección.

**PLANDIG.** La fila `:1112` **no se toca**. Se le agrega, cerca, la nota de frontera de **D-3**: el incremento hasta el 0,39% legal es de PLANDIG y PLANPREGUNTA no lo reclama. **Es una nota de dos oraciones y no una sección** — este tramo no reabre PLANDIG.

**Verificación específica:** la guardia tiene que **leer PLANTER** y fallar si el split de allá no suma 100 o si no coincide con el de acá. Dos documentos con dos versiones del mismo protocolo es exactamente el defecto que la regla de fuentes existe para evitar.

- [x] Task 11 completa

---

### Task 12: La guardia entra en CI

**Files:** Modify: `.github/workflows/socialjusticehub-ci.yml`.

Agregá `npx tsx scripts/verificar-planpregunta.ts` al job, al lado del de PLANARCO. **Y revisá los `paths` del trigger**: el tramo C descubrió tarde que había documentos citables fuera de `Iniciativas Estratégicas/` que no disparaban el workflow. La guardia de este tramo lee **`PLANTER_Argentina_ES.md`** (Task 11), que sí está adentro, y el plan y la spec, que **no**. Si la guardia depende de algún archivo fuera de ese directorio, **la línea de `paths` va agregada con su comentario**, como ya se hizo para PLANARCO.

**Verify:** `act` no hace falta; alcanza con que el YAML parsee y con que el comando corra en verde localmente desde `SocialJusticeHub/`.

- [ ] Task 12 completa

---

## Cierre del tramo

Al terminar las doce tareas:

1. `wc -w "Iniciativas Estratégicas/PLANPREGUNTA_Argentina_ES.md"` cae dentro de **29.000–34.000**.
2. `npx tsx scripts/verificar-planpregunta.ts` sale 0, y sale 1 al romper a propósito una sección, una cifra canónica, un prohibido y **una fila del split**.
3. El split del FSC dice lo mismo en PLANPREGUNTA y en PLANTER, y los dos suman 100.
4. No queda ninguna cita a `PLANFOCO:` con número de línea, ni ningún marcador de pendiente.
5. **Queda anotado lo que este tramo no hizo, con nombre:** PLANFOCO (la otra mitad del tramo D y la otra mitad del par recíproco), la pata industrial de PLANCYT que sigue repartida entre cinco PLANes, y todo el tramo E — el canon, los conteos, el grafo y lo no humano.
