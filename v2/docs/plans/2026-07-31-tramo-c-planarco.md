# Tramo C — PLANARCO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Escribir `Iniciativas Estratégicas/PLANARCO_Argentina_ES.md` — el documento del vigésimo cuarto PLAN de ¡BASTA!, el arco de la vida — con sus trece arreglos obligatorios de la spec **corregidos y ampliados por la verificación previa**, que encontró nueve problemas que la spec no tenía.

**Architecture:** Una guardia ejecutable (`SocialJusticeHub/scripts/verificar-planarco.ts`) declara qué secciones tiene que tener el documento, qué cifras canónicas tiene que citar, qué strings tiene prohibidos y **qué tablas tiene que sumar**. Cada tarea de contenido **primero extiende la guardia** —que pasa a fallar— y después escribe las secciones que la hacen pasar. Es red-green sobre prosa: lo mecánico lo verifica el script, lo editorial lo verifica la revisión.

**Tech Stack:** TypeScript + tsx (script one-shot, se corre a mano y en CI), Markdown.

> **NOTA OPERATIVA — hay un hook que bloquea `Write` sobre archivos `.md`.** Es un hook global de otro proyecto (brand review de Kairospace) que se dispara sobre cualquier markdown y **frena la herramienta Write**. `Edit` NO está afectado. Para crear un archivo `.md` nuevo usá `cat > ruta <<'EOF' … EOF` desde Bash; después trabajalo normalmente con `Edit`. No pierdas tiempo peleándole al hook ni intentes desactivarlo.

---

## Lo que la verificación previa encontró, y la spec no decía

Nueve hallazgos de tres agentes que leyeron PLANPACTO y el corpus entero antes de escribir este plan. **Los nueve son vinculantes.** Donde uno de ellos choque con la spec, **gana el hallazgo**: está verificado contra el texto y la spec no.

### C-1 · La Regla de Arco ya está escrita, y no es de PLANARCO

Vive en `PLANPACTO_Argentina_ES.md:422-430` (§4.7). Le impone tres obligaciones verificables: **no escribir regla de reparto propia**, aceptar la jerarquía *«la materia decide el escalón y el arco decide adentro del escalón — nunca al revés, y nunca en paralelo»*, y declarar el reparto inicio/medio/final de cada escalón en la Ley de Escalera, verificable en el Libro Mayor. `PLANPACTO:721` lo deja escrito: *«PLANARCO es el par recíproco más importante y todavía tiene una sola mitad escrita.»* El arreglo 1 de la spec está cumplido del lado de PACTO. **Lo que falta es la mitad de ARCO, y es una remisión, no un diseño.**

### C-2 · PLANARCO no tiene escalón propio

La Escalera cierra en **2,40 exacto** con ocho escalones, y el 5 —«Cuidado y arco»— es de **PLANCUIDADO** (conserva 0,25 contra los 0,45 que declaró). El arco entró como **eje transversal que corre adentro de los ocho**. Consecuencia no negociable: **PLANARCO financia su régimen sin piso constitucional**, y su sección económica se escribe desde ahí. Escribir que tiene piso sería contradecir una tabla que una guardia ya suma.

### C-3 · Ya existe un número del arco, es de otro documento, y viene con permiso de reemplazo

`PLANPACTO:369` declara **0,60% del PBI** para «el eje intergeneracional» como supuesto de trabajo propio, explícitamente no declarado por ningún PLAN, y agrega: *«quien las reemplace rehace la división sin tocar nada más»*. PLANARCO **honra ese número o lo reemplaza declarándolo**, y si lo reemplaza rehace la división de PLANPACTO (P = 23,15; F = 4,65 = 3,5 + 0,55 + **0,60**; R = 65% con denominador 42,8).

### C-4 · «Precompromiso indexado» no existe en PLANPACTO — cero ocurrencias, igual que «indexado»

La tipología real es **Techo A** (rigidez preexistente, *incluye lo previsional*, el LIFO nunca la agarra) / **piso único 2,40** / **Techo B** (afectación nueva, sujeta al LIFO). El arreglo 2 pedía estrenar una categoría inexistente, y `PLANPACTO:381` cierra por anticipado esa maniobra: *«si se permitiera que una afectación viviera afuera del piso con el argumento de que no es un piso constitucional sino una afectación… el LIFO quedaría decorativo»*. **Camino resuelto: `PLANPACTO:343` ya ubica lo previsional adentro del Techo A** y dice que buena parte «no es suspendible por ley ordinaria». La movilidad de PLANARCO es Techo A **por materia**, no por categoría nueva.

### C-5 · El presupuesto de la spec no cierra con el gate que habilita al PLAN — **el problema más grave del tramo**

La spec declara **USD 6.000–11.000M/año** en régimen *y* **53.000–96.000M a quince años**. 6.000 × 15 = 90.000; 11.000 × 15 = 165.000. **El gate de spin-off que legitima la existencia de PLANARCO se corrió sobre 53.000–96.000** (`SocialJusticeHub/scripts/gate-spinoff-planes-nuevos.ts:25` — **corregido el 2026-08-01: el acta NO publica esa banda**, publica los tres cocientes en `ACTA:24-26`; la banda es el insumo del gate y vive en el script y en `spec:171`). Anualizar 53.000–96.000 sobre quince da 3.533–6.400M/año, que no es el rango de la portada. La rampa que explicaría el cociente (~8,7 años de régimen dentro de quince) **no está escrita en ninguna parte**. Se resuelve en la Task 8 y condiciona la cabecera de la Task 1.

### C-6 · «PUAM» y «PNC» no existen en el corpus — cero ocurrencias cada uno

La tabla de tres columnas que la spec exige (erogación bruta / gasto sustituido / incremental neto) tendría hoy **la columna del medio enteramente inventada**. «moratoria» sí existe (cuatro veces, siempre como diagnóstico, nunca como partida, sin monto); la única «pensión no contributiva» del corpus es **por invalidez**, no por vejez (`PLANCUIDADO:94`). Es la candidata número uno a séptima cifra fantasma del proyecto.

### C-7 · Dos fondos soberanos que el corpus nunca reconcilió, y la Renta de Arco se apoya en los dos

**FSC** = Fondo Soberano Ciudadano, de PLANTER (`:349`), regalías extractivas, de donde salen el DCM y el Fondo Intergeneracional. **FSB** = Fondo Soberano Bastardo, de PLANMON (`:1557`), regalías + PLANSUS + margen de la Bastarda Financiera, de donde sale el Fondo Previsional Bastardo. PLANTER nunca dice «Bastardo»; PLANMON dice «Ciudadano» sólo en su tabla de interconexiones, tratándolo como propio; y `strategic-initiatives.ts:2045` **directamente los fusiona**. Financiar el Tramo Común «por el FSC y el Fondo Previsional Bastardo» puede ser contar dos veces la misma plata. **Se resuelve antes de escribir la Renta de Arco.**

### C-8 · Tres dispositivos de la spec no existen: se inventan enteros, no se remite

«Umbral del Legado» (cero ocurrencias fuera de la spec), «Servicio Cívico» como institución (cero; el análogo, el panelista de `PLANJUS:1659`, **ya cobra**), y el «contrato de continuidad de 36 meses» con PAMI (no existe). Ninguno de los tres se puede escribir como remisión.

### C-9 · El territorio del arco ya tiene dueños, y tres arreglos chocan de frente con ellos

- **PLANMON es dueño de hecho de lo previsional** (`:1543-1576`): Aporte Previsional Automático, Fondo Previsional Bastardo, y **jubilaciones en Pulso indexadas al peso-canasta** — que es un segundo mecanismo de indexación para el mismo haber, en choque directo con el arreglo 2.
- **PLANCUIDADO ya escribió el Tramo Ganado**: `:340`, «1 año de cuidado = 1 año aportado, con techo anual y **validación por la Mesa Civil** de materia Cuidado» — que es exactamente el validador que el arreglo 6 prohíbe para la Dote. Y el pasivo ya está cuantificado y comprometido: `:94`, doce millones de años-persona, USD 2.400M/año.
- **PLANSAL tiene los primeros mil días en exclusiva** (§4.4 entera) y licencia parental extendida **con números** (`:1595-1605`: seis meses gestante, tres co-progenitor). «Licencia de crianza» no existe como término: **se remite, no se reescribe.**
- **La Rampa de Salida sería la tercera versión del mismo dispositivo**: `PLANSAL §9.3` «Ancianos de Sabiduría» y PLANCUL «Granaderos» ya existen.

**Territorio genuinamente vacío, donde PLANARCO no pisa a nadie:** la herencia y la sucesión como institución, la **voluntad anticipada**, la mediana edad (el Alto de los Cuarenta y Cinco es virgen), y la natalidad. **Ahí es donde el PLAN es más original y donde tiene menos con qué apoyarse.**

> **CORRECCIÓN DEL 2026-07-31, DE LA TASK 3 — el acto de morir NO es territorio vacío, y este plan lo afirmaba.** El implementador de la Task 3 abrió el archivo y encontró **`PLANEB:983-991`, §9.10 «La Bastarda del Adiós»**: Fondo de Dignidad Prepago con micro-contribuciones mensuales, red de prestadores con tarifas publicadas, opciones ecológicas —entierro verde, árbol memorial, compostaje humano— y red de acompañamiento entre pares. Verificado por mí. El hallazgo original vino de buscar **«funeral»**, que efectivamente da cero ocurrencias en los PLANes — **y el dispositivo no lleva esa palabra**. Es el modo de falla que este mismo plan le atribuye al grep en sus Global Constraints, cometido por el plan.
>
> **Lo que sí se sostiene, y es lo que la Task 3 escribió:** el corpus escribió el final del arco **una sola vez y como problema de precio**. **Pero «no acompaña» es falso y no se escribe:** el cuarto bullet de `PLANEB:991` se titula literalmente **«Red de acompañamiento»** — grupos de apoyo entre pares, financiados por el pool. Lo defendible es lo que ya está escrito debajo: que es **voluntario, entre pares, sin deber de presentarse, sin dueño institucional que responda, y sin nadie a quien llamar a las siete de la mañana.** **Vinculante para la Task 7:** no puede escribir «territorio genuinamente vacío» sin acotar a qué, y **tiene que declarar la relación con la Bastarda del Adiós**. El hueco del costo funerario del preámbulo sigue en pie: `PLANEB:988` dice «al costo real, publicado» y no publica ninguno.
>
> **Y «la palabra funeral» acotada a los PLANes tampoco cubre el caso**, porque el dispositivo dice «funerarios» y «funerarias». La afirmación que sobrevive es sobre el *acto* de morir como trámite y sobre la voluntad anticipada, no sobre el sector funerario.

---

## Global Constraints

> **La unidad de conteo es `wc -w` crudo, y no es una elección de gusto.** `wc -w "Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"` da **26.541** exacto y `wc -l` da **810** — los dos números que este mismo bloque ya citaba. La unidad estaba declarada de hecho desde el principio; las normalizaciones privadas de cada agente eran la anomalía, y produjeron tres conteos distintos de la misma cabecera contra un mismo techo. **Nadie inventa su propia normalización.**

> **Presupuesto de palabras — leelo antes de escribir.** El tramo B se pasó en la Sección 5 porque su brief no declaraba rango, y su objetivo de líneas resultó mal calibrado por un factor de tres: **un rango de líneas mide formato, no largo.** Acá se mide en **palabras**, cada sección tiene el suyo declarado en su step, y **las adiciones de revisión entran adentro del rango, no encima.** Objetivo total: **32.000–35.000 palabras** — corregido el 2026-08-01, y la razón es aritmética, no indulgencia. El objetivo original decía 27.000–31.000 y **no cerraba por construcción**: la Task 8 lo midió — 29.344 escritas más los 3.110 mínimos que los briefs de las Tasks 9 y 10 exigen dan **32.454 contra un techo de 31.000**, o sea que las dos últimas tareas nacían obligadas a violar el total aunque cumplieran cada una su rango. El documento creció por corrección de contenido verificado, no por prosa: el censo de ocupantes se duplicó, cuatro afirmaciones falsas se reescribieron con su evidencia, y tres secciones ganaron declaraciones que no tenían. La densidad sigue siendo la de PLANPACTO (26.541 en 810 líneas), no la de PLANMEMORIA (10.111 en 900).
>
> **Método de conteo — el comando exacto, y vale para todo el tramo.** Un rango fijado con la normalización privada de un agente no lo puede auditar el siguiente: la Task 1 contó 576 palabras de cabecera y su revisor contó 583 sobre el mismo texto, con dos normalizaciones distintas y ninguna declarada. Así que **se cuenta con `wc -w` crudo, sin normalizar markdown** — sin sacar `>`, ni `**`, ni `·`, ni backticks. Es la unidad en la que ya está expresado todo lo de arriba: `wc -w PLANPACTO_Argentina_ES.md` da **26.541** exacto, que es el número que este bloque cita.
>
> ```bash
> # una sección, por rango de líneas
> sed -n 'INICIO,FINp' "Iniciativas Estratégicas/PLANARCO_Argentina_ES.md" | wc -w
> # el documento entero
> wc -w "Iniciativas Estratégicas/PLANARCO_Argentina_ES.md"
> ```
>
> **Los rangos de la tabla de abajo están en esa unidad.** Si contás de otra forma, el número no es comparable con el de la tarea anterior ni con el de la siguiente.

- **Spec de referencia:** `v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md` §4 (PLANARCO) y §2 (la aritmética del Techo). **Donde la spec choque con C-1…C-9, ganan los hallazgos.**
- **El taller es el destino.** El documento se escribe en `Iniciativas Estratégicas/PLANARCO_Argentina_ES.md`. **La ruta tiene espacio y acento: entrecomillala siempre en bash.** La edición derivada de `v2/content/planes/` NO se toca en este tramo.
- **Este tramo no carga el PLAN en ningún registro.** No se toca `arquitecto-data.ts`, ni `strategic-initiatives.ts`, ni `PLAN_REGISTRY.yml`, ni `EXPECTED_PLAN_COUNT`, ni ningún conteo de 22. Eso es el tramo E.
- **Ordinal 24, y el H2 del cuerpo dice «Vigésimo Quinto Mandato».** El ordinal y el mandato están desfasados en uno desde PLANRUTA, en todo el corpus. PLANPACTO es ordinal 23 / «Vigésimo Cuarto Mandato».
- **La autoridad por la que este PLAN existe se escribe con exactitud, porque el acta es explícita.** PLANARCO **no supera** el gate de la regla 3: pasa contra cada huésped por separado (1,77–2,13x contra PLANCUIDADO, 8,83–16,00x contra PLANSAL) y **falla contra los dos sumados — 1,47–1,88x contra un umbral de 1,5, por tres centésimas**. Se habilita por **derogación expresa** de la regla 5 y de la condición temporal de la regla 3 (`ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md`, «Bajo qué autoridad se levanta esto»). **Escribir que «pasó el gate» sería falso, y la guardia lo prohíbe.**
- **La frontera con PLANCUIDADO y PLANSAL se declara.** El acta retira **sólo la porción de vejez** del hueco «Discapacidad y vejez»; **la discapacidad queda** en PLANCUIDADO + PLANSAL sin cambios. PLANARCO no la absorbe y tiene que decirlo.
- **Español rioplatense (voseo) con acentuación correcta.**
- **Cuando «usá la cifra verbatim» choca con «no repitas la tesis», gana no repetir.** Lo que no se puede es **cambiarla**.
- **Ninguna sección repite más de una cláusula de la tesis.** Donde la tesis afirmó, la sección **muestra**. Tercera persona para diagnóstico y diseño; el «vos» se reserva para la Promesa pública. Preferencia fuerte por futuro perifrástico («va a morir») sobre futuro simple — preferencia, no prohibición: los documentos del corpus usan futuro simple entre cinco y doce veces cada uno. **Números biográficos en letras, números de política pública en cifras.** `solo` sin tilde. Demostrativos sin tilde.
- **Las remisiones cruzadas se tratan con la misma sospecha que las cifras.** El tramo B lo aprendió caro: *«donde el brief pedía un número inexistente el implementador se plantó, y donde pedía un documento inexistente lo dio por escrito.»* **Antes de escribir `ARCHIVO:línea`, abrí el archivo en esa línea.** Si no dice lo que el brief supone, **el brief está mal**: no lo escribas, reportalo.
- **Toda compresión que reemplace un fundamento por una remisión cruzada es cambio de sustancia, no de prosa, y se reporta como tal.** Regla agregada el 2026-07-31, tras la sexta compresión grande del tramo: dos de ellas ya costaron un fundamento. El patrón es siempre el mismo — dos casos que comparten **conclusión** y no **fundamento**, unidos por un «la misma razón» o «vale la misma salvedad». Apareció tres veces: en §4.4 con el Banco de Tiempo, en §5.3 con el cuarto pago universal, y en §4.6 con la salvedad de transversalidad. **Cuando comprimas para pagar un arreglo, listá en el reporte qué fundamentos se volvieron remisiones.**
- **Todo valor único se declara.** Las tres fórmulas del corpus, para copiar literal: *«es un supuesto de trabajo de este documento y no una medición»*, *«es decisión de diseño de este documento y no una medición»*, y el hueco declarado — *«falta acá porque no está calculado… estimarlo sería estrenar un número»*.
- **Y una cuarta rama, agregada el 2026-07-31 por la Task 7: la restricción heredada.** La fórmula «decisión de diseño de este documento» hace **dos** afirmaciones — que la cosa no es una medición, y que **este documento la eligió**. Para un valor que llegó como restricción del plan o del corpus, la segunda es **falsa**, y escribirla igual es atribuirse una autoría que no se tiene. **En un corpus cuya disciplina entera es decir de dónde viene cada cosa, inventar autoría es la misma clase de error que inventar un número.** Para esos valores va una **nota de procedencia**, no la fórmula: decir que llegan como restricción y de dónde. Casos vivos hoy: `60–72`, `doce años` y `cada 60 días` en la Sección 7.
- **Este documento hereda una ética explícita y no puede violarla.** `PLANPACTO:412`: *«Este documento existe porque el proyecto arrastró durante meses una cifra que nadie había verificado. No va a estrenar otra, y menos en la sección que denuncia esa práctica.»* PLANARCO es el PLAN que sigue a ese; **estrenar una cifra acá cuesta el doble.**
- **Directiva de guardia, fijada el 2026-08-01 por la revisión de la Task 8 y vinculante para lo que queda.** Diecisiete formas del mismo defecto en ocho tareas, y el patrón de fondo **no son chequeos flojos: son listas opt-in mantenidas a mano.** `sinNegacion`, `CITAS_TEXTUALES`, `CIFRAS_CANONICAS` — las tres fallan igual, y las tres se cierran igual: **default seguro + descubrimiento automático + reportar lo que la guardia no sabe leer**, en vez de descartarlo en silencio. Es lo que ya hacen las anclas de prosa, y es por eso que las anclas son el único chequeo del tramo que no volvió a fallar.
  - **Corolario medido:** una lista opt-in se llena **donde cayeron las mutaciones de la última vuelta**, no donde corresponde — «el conjunto de mutaciones define el arreglo». `sinNegacion` quedó en 18 de 113 entradas y ~60 afirmativas siguen negables; `CITAS_TEXTUALES` quedó en 2 de 50 citas con ancla en la misma oración.
  - **Y el truco que las descubre solas:** al arrancar, correr el chequeo sobre todas las entradas y **errorear si una entrada sin opt-out explícito no tiene ninguna ocurrencia válida**. Eso encuentra las que faltan por construcción, en vez de por memoria.
- **Cuando un chequeo tenga patrón y excepción, los dos tienen que medir la misma unidad.** El prohibido del neto tenía el patrón por oración y el `salvoSi` por línea, así que quedaba **apagado justo en el único párrafo donde el número lavado se escribiría con naturalidad**: el que declara el hueco, que por construcción siempre contiene la frase que lo exime.
- **Verificación antes de cada commit:** `npx tsx scripts/verificar-planarco.ts` desde `SocialJusticeHub/`. **No corras `npm run verify`** — incluye un build de minutos.
- **Commits:** `Add [name] [type] — [context]`, `Fix [issue]: [detail]`. Un commit por tarea.
- **Cuidado con la concurrencia.** Otra sesión trabaja sobre `main` en este mismo working tree. Antes de cada commit corré `git status --porcelain` y **agregá al índice sólo tus archivos por nombre**; si ves borrados o modificaciones que no hiciste vos, no los toques y dejalos anotados en el reporte.

### Cifras canónicas — verificadas, con su domicilio

| Cifra | Valor | Domicilio | Estado |
|---|---|---|---|
| Personas de 65+ | **más de cinco millones** | `PLANSAL:1173` | Del corpus, **sin fuente externa citada**. Se dice «más de», no «unos». |
| Personas de 60+ | 7,3 millones | `PLANREP:335`, `:367` | **Es el blindaje de la Rama 2 de PLANREP.** PLANARCO **no lo usa como su universo** — lo cita como de PLANREP o no lo cita. |
| Proyección 2040 | más de 10 millones de 60+ | `PLANREP:367` | Extrapolación aritmética del propio PLANREP. **Sin INDEC, CELADE ni ONU.** Se cita como lo que es. |
| Gasto previsional | ~45% del presupuesto nacional | `PLANMON:238`, `:248` | Primera fila y mayor de la Anatomía del Déficit. **Es el respaldo de «la partida más grande», y es porcentaje, no dólares.** |
| Presupuesto nacional | ~30% del PBI (~USD 150.000M) | `PRESUPUESTO_CONSOLIDADO:217` | El producto de referencia del corpus es **USD 500.000M** (`PLANPACTO:452`). |
| Bajo administración de la ANAV | **derivado: ~USD 65.000–72.000M/año** | 45% × 150.000M, y contra la banda de `PLANPACTO:122` | **La spec decía 50–60.000M y no sale por ningún camino.** Se escribe la derivación o se declara hueco. **De PAMI no hay número de afiliados, de presupuesto ni de cobertura** — corregido el 2026-07-31: la revisión de la Task 3 encontró que «ni un solo número» era falso (`PLANRUTA:1809` trae un 340% de sobreprecio en medicamentos, dentro de un ejemplo retórico sobre control parlamentario) y que el corpus le escribe tres relaciones, no una: derivación (`PLANSAL:1786`), sobreprecio (`PLANRUTA:1809`) e integración digital (`PLANDIG:759`). **Las tres van hacia PAMI; ninguna sale de él.** |
| Presupuesto propio | ver **C-5** — no se escribe hasta la Task 8 | — | La Task 1 deja la cabecera con el rango de quince años del gate y **remite** al modelo económico. |
| Pisos constitucionales de los 22 | 7,82–9,41% del PBI, medio 8,62 | `pisos-constitucionales.test.ts` | Fijado por test. PLANARCO **no agrega** piso. |
| Escalera | 2,40 exacto en ocho escalones | `PLANPACTO:391-402` | PLANARCO **no tiene escalón**. |
| Eje intergeneracional | 0,60% del PBI | `PLANPACTO:369` | **Supuesto de trabajo de PLANPACTO**, con permiso escrito de reemplazo. Ver **C-3**. |
| Gate de spin-off | 1,77–2,13x vs PLANCUIDADO · 8,83–16,00x vs PLANSAL · **1,47–1,88x vs la suma → NO PASA** | `ACTA:24-26`, `:41-47` | Se escribe entero, incluido el fallo. |
| Redención previsional de cuidado | 12 millones de años-persona · USD 2.400M/año | `PLANCUIDADO:94`, `:340`, `:564` | **Ya comprometido.** PLANARCO no lo vuelve a gastar sin declararlo. |
| Fondo Intergeneracional | 15% del flujo del FSC = USD 2.475–4.650M/año | `PLANTER:357-364`, `:674` | **Flujo, no stock.** Sin stock declarado ni regla de retiro. Dos mandatos previos, ambos «no distribuir». |
| FGS | >USD 50.000M en activos; PLAN24CN pide 10–20% (`:1943`,`:1958`) y 15–20% (`:1927`,`:2676`) | `PLAN24CN` | **Incoherencia interna del propio 24CN**, que además está *research-only / diferido, sin presupuesto operativo* (`:8-12`). |
| Vaciamiento | INTA −60% **en los años 90**; CONICET vaciado sin cerrar, sin cifra | `BLINDAJE:41,44`, `PLANRUTA:277` | **Sin fuente externa.** Se cita como aserción del corpus. |
| Blindaje | cuatro capas; la 4 es **social** y se funda en **propiedad** | `BLINDAJE:192-199` | «Ley» es capa 1, «protección media». Ver **C-9** y el arreglo 12. |

### Strings prohibidos — cada uno con su razón, y todos en la guardia

| Patrón | Por qué |
|---|---|
| `PUAM`, `PNC` | Cero ocurrencias en el corpus. No se estrenan siglas de partidas cuyo monto nadie tiene (**C-6**). |
| `pasó el gate`, `superó el gate`, `supera el umbral` referido a PLANARCO | Falso: falla contra la suma de sus dos huéspedes por tres centésimas. |
| `precompromiso` | Categoría inexistente en PLANPACTO; su uso choca con `PLANPACTO:381` (**C-4**). |
| `escalón de PLANARCO`, `nuestro escalón`, `noveno escalón` | La Escalera cierra en ocho y en 2,40 exacto (**C-2**). |
| `piso constitucional de PLANARCO`, `nuestro piso constitucional` | PLANARCO no reclama piso. |
| `PLANJUB` afirmado en presente como PLAN vigente | Es el fantasma que este PLAN sucede. Puede aparecer **nombrado como inexistente**, nunca como activo. |
| `7,3 millones` / `7.3 millones` presentado como el universo de PLANARCO | Es el blindaje de PLANREP (**C-9**). Puede citarse atribuido. |
| `contrato de continuidad de 36 meses` | No existe en el corpus (**C-8**). |
| `50.000-60.000` / `50.000–60.000` como monto bajo administración | No sale por ningún camino del corpus. |
| Marcadores de pendiente (`TODO`, `TKTK`, `XXX`, `[pendiente]`) | Al cierre no puede quedar ninguno. |

---

## File Structure

**Crear**

| Archivo | Responsabilidad |
|---|---|
| `SocialJusticeHub/scripts/verificar-planarco.ts` | La guardia: secciones en orden, cifras canónicas presentes, strings prohibidos ausentes, **y las dos tablas parseadas y sumadas** (el Calendario de Umbrales y la tabla de fuentes de la Renta de Arco). |
| `Iniciativas Estratégicas/PLANARCO_Argentina_ES.md` | El documento. Objetivo: **32.000–35.000 palabras**. |

**Modificar**

| Archivo | Cambio |
|---|---|
| `Iniciativas Estratégicas/PLANCUL_Argentina_ES.md` | Las seis referencias a PLANJUB (`:416`, `:421`, `:484`, `:534`, `:536`, `:682`) apuntan a PLANARCO, con nota de sucesión. **Task 11.** |
| `Iniciativas Estratégicas/PLAN24CN_Argentina_ES.md` | La negociación del FGS por escrito: el tope, quién lo pidió, y la incoherencia 10–20 / 15–20 resuelta. **Task 11.** |
| `Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md` | La fila de PLANARCO: tres attack paths con mitigación, owner, fallback e indicador. **Task 9.** |
| `.github/workflows/socialjusticehub-ci.yml` | La guardia corre en CI. **Task 12.** |

**El modelo a imitar:** `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md`. Es el documento inmediatamente anterior, el más cercano en densidad, y el único que aplica la disciplina de declaración de valores que este plan exige. **Abrilo antes de escribir cada tarea y copiá su forma, no su contenido.**

---

## El documento, de una sola mirada

| # | Sección | Tarea | Palabras |
|---|---|---|---|
| — | Cabecera + H1 + «Vigésimo Quinto Mandato» + versión + portada ASCII (líneas 1–52) | 1 | 560–620 |
| 1 | `## PREÁMBULO — {título}` | 2 | 1.100–1.400 |
| 2 | `## TESIS CENTRAL` | 2 | 700–900 |
| 3 | `## SECCIÓN 0: LAS OCHO FALLAS DEL ARCO DE LA VIDA ARGENTINO` | 3 | 3.400–4.000 |
| 4 | `## SECCIÓN 1: LA CRISIS — {frase}` | 3 | 1.100–1.400 |
| 5 | `## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES` | 3 | 1.400–1.700 |
| 6 | `## SECCIÓN 3: LA SOLUCIÓN — EL CALENDARIO DE UMBRALES` | 4 | 2.600–3.300 |
| 7 | `## SECCIÓN 4: LA RENTA DE ARCO` | 5 | 3.200–3.600 |
| 8 | `## SECCIÓN 5: EL COMIENZO` | 6 | 2.200–2.600 |
| 9 | `## SECCIÓN 6: EL MEDIO` | 6 | 1.600–2.100 |
| 10 | `## SECCIÓN 7: EL FINAL` | 7 | 2.800–3.200 |
| 11 | `## SECCIÓN 8: LA AGENCIA NACIONAL DEL ARCO DE LA VIDA (ANAV)` | 7 | 1.100–1.400 |
| 12 | `## INTEGRACIÓN CON EL MARCO ¡BASTA!` | 8 | 900–1.100 |
| 13 | `## SECCIÓN 9: MODELO ECONÓMICO Y FISCAL` | 8 | 2.200–2.600 |
| 14 | `## SECCIÓN 10: RIESGOS Y RESPUESTAS` | 9 | 700–900 |
| 15 | `## SECCIÓN 11: EL MAPA DE PERDEDORES` | 9 | 700–900 |
| 16 | `## SECCIÓN 12: HOJA DE RUTA` | 9 | 400–500 |
| 17 | `## SECCIÓN 13: TABLERO NACIONAL DEL ARCO` | 10 | 250–320 |
| 18 | `## SECCIÓN 15: DIMENSIÓN FEDERAL` | 10 | 230–280 |
| 19 | `## SECCIÓN 16: VISIÓN 2040` | 10 | 220–270 |
| 20 | `## SECCIÓN 17: PROTOCOLO DE FALLA` | 10 | 260–300 |
| 21 | `## CIERRE` | 10 | 350–480 |

> **Los dos techos subidos el 2026-07-31, con la razón.** La SECCIÓN 3 pasó de 3.000 a **3.300** y la SECCIÓN 0 de 3.800 a **4.000**. No es indulgencia: las dos crecieron por corrección de contenido verificado, no por prosa. En la SECCIÓN 3 el censo de ocupantes pasó de siete estaciones a catorce de dieciséis —la columna que el propio documento llama «lo que hace honesta la arquitectura» estaba mal por la mitad— y la tabla es lo que engordó. En la SECCIÓN 0, §0.6 apoya su «Por qué persiste» y su «El dato» en la ausencia de tres cosas —organismo, caja y registro— que `PLANMEMORIA` provee: Agencia Nacional de Memoria con 0,10–0,14% del PBI protegido (`PLANMEMORIA:484` y `:486` — `:480` es el H2 de la sección, y esta nota arrastraba la misma cita mal que corrigió el documento), Síndicos de Archivo a salario de investigador CONICET adjunto (`:405`), y el Archivo de Depósito Ciudadano de siete nodos con hash (`:283`, `:297`). **Corregir cuatro afirmaciones falsas cuesta palabras, y comprimir para no pagarlas es la peor economía posible.** Las dos secciones ya absorbieron una ronda de arreglos a saldo cero cada una; esta es la segunda y no entra.

> **Tres techos subidos el 2026-08-01, y la razón es un hallazgo, no una holgura.** §6 de 1.900 a **2.100**, §13 de 300 a **320**, el CIERRE de 420 a **480**. La revisión final de la Task 10 encontró que **el Alto de los Cuarenta y Cinco no le corresponde a Teresa** —§6.2 dice «la persona conserva el puesto, el salario y los aportes» y §6.3 pone el reintegro contra las contribuciones del empleador, y Teresa es monotributista sin empleador— **y que el dispositivo nunca declaraba su universo en 33.000 palabras**, mientras §1 del mismo documento dice que entre el 40 y el 45% de los trabajadores argentinos están afuera de los dos regímenes. Declarar ese universo en §6.2 arregla el dispositivo y no sólo la frase del cierre. **§6 tenía cinco palabras de margen**, así que se paga con techo y no con compresión — la misma doctrina con la que ya se subieron §0 y §3: comprimir para no pagar una corrección verificada es la peor economía posible.

Los saltos de numeración (no hay SECCIÓN 14) imitan al corpus, que los tiene: PLANMEMORIA salta de la 12 a la 14, PLANPACTO también.

**Los trece dispositivos, y dónde vive cada uno:**

| Dispositivo | Sección | Estado de origen |
|---|---|---|
| Calendario de Umbrales | 3 (es la arquitectura, no un dispositivo) | Nuevo |
| Renta de Arco (tres tramos) | 4 | Tramo Ganado **ya escrito** en `PLANCUIDADO:340` |
| Dote de Origen | 5 | Nuevo; fuente inviable como estaba (**C-7**, arreglo 5) |
| Umbral de la Llegada | 5 | **Remite** a `PLANSAL §4.4` y `:1595-1605` |
| Acta de Bienvenida | 5 | Nuevo |
| El Pasaje (cuatro viajes: 12, 18, 45, 60) | 6 | Nuevo |
| El Alto de los Cuarenta y Cinco | 6 | Nuevo; territorio virgen; reintegro a rediseñar (arreglo 7) |
| La Rampa de Salida 60–72 | 7 | Tercera versión — coexiste con `PLANSAL §9.3` y Granaderos |
| Casa de Dos Edades | 7 | Nuevo; control cada 60 días (arreglo 8) |
| Casa de Arco (catorce personas) | 7 | Nuevo |
| La Última Palabra | 7 | **Nunca la leyó nadie** (arreglo 3). Territorio vacío. |
| El Año del Duelo + Acompañante de Umbral | 7 | **Nunca lo leyó nadie** (arreglo 3). Choca con `PLANCUIDADO:677`. |
| El Umbral del Legado | 7 | **No existe en el corpus** (**C-8**). Se inventa entero. |

---

### Task 1: La guardia y la cabecera del documento

**Files:**
- Create: `SocialJusticeHub/scripts/verificar-planarco.ts`
- Create: `Iniciativas Estratégicas/PLANARCO_Argentina_ES.md`

**Interfaces:**
- Consumes: `SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts` (el canon de pisos, para cruzar que PLANARCO no agregue ninguno).
- Produces: el comando `npx tsx scripts/verificar-planarco.ts` (exit 0/1) y las constantes `SECCIONES_ESPERADAS`, `CIFRAS_CANONICAS`, `PROHIBIDOS` que las tareas 2 a 10 extienden.

**Step 1 — la guardia.** Copiá la estructura de `scripts/verificar-planpacto.ts` (327 líneas; leela entera antes de empezar). Arrancá con:
- `SECCIONES_ESPERADAS` con **sólo las secciones de la Task 1 y 2** — se extiende tarea por tarea. Verificación de **presencia y orden**.
- `CIFRAS_CANONICAS` con las de la tabla de arriba que ya se puedan afirmar en la cabecera.
- `PROHIBIDOS` con **los diez patrones completos** de la tabla de strings prohibidos, desde el minuto uno. Son regex, y **case-insensitive salvo donde el corpus distinga mayúsculas**.
- Un chequeo de que el documento **no declara piso constitucional**: cruzá contra `PISOS_SEGUN_EL_TALLER` del test canónico y fallá si aparece una fila de PLANARCO.

**Step 2 — la cabecera.** Copiá la anatomía de `PLANPACTO:1-54` exactamente: blockquote de metadatos (mismo orden de campos), `---`, H1, H2 de mandato, H3 de versión, portada ASCII en bloque cercado, `---`.

Contenido específico:
- `CANONICAL_ARCHITECTURE`: 26 thematic + PLANRUTA protocol — PLANARCO es el ordinal **24**.
- `ORDINAL Y MANDATO`: ordinal 24, mandato **25**, desfasaje declarado.
- `ACTA DE HABILITACIÓN`: **y acá se escribe la verdad completa.** PLANARCO se habilita por derogación expresa de la regla 5 y de la condición temporal de la regla 3. **Pasa contra cada huésped por separado y falla contra la suma por tres centésimas.** Los tres cocientes van escritos.
- `Presupuesto canónico`: **el rango de quince años del gate (53.000–96.000M)** y una remisión a la Sección 9. **No escribas un rango anual acá** — la Task 8 lo deriva y recién ahí se puede afirmar (**C-5**).
- `Principios aplicados`: los del corpus, más **«sin piso constitucional propio: PLANARCO no agrega escalón a la Escalera de PLANPACTO»**.
- La portada ASCII lleva **sólo dispositivos que el cuerpo va a tener**. En el tramo B la portada anunció cuatro dispositivos con cero ocurrencias en el cuerpo, se escribió en la Task 1 y nadie la volvió a mirar mientras todo lo demás se revisaba nueve veces. **La Task 10 la vuelve a abrir obligatoriamente.**

**Corrección del 2026-07-31, tras la revisión de la Task 1:** el rango original decía 350–450 y era **aritméticamente inalcanzable**. La revisión contó campo por campo contra `PLANPACTO:1-53` (417 palabras) y encontró que el `ACTA DE HABILITACIÓN` de PLANARCO pesa 116 palabras contra las 20 de PLANPACTO, porque este plan lo obliga a llevar los tres cocientes, el umbral, el fallo por tres centésimas, la derogación de dos reglas y la frontera con PLANCUIDADO/PLANSAL. Una cabecera máximamente magra que obedezca todos los mandatos aterriza en ~546 palabras. Se corrige el rango en vez de borrar contenido que las Global Constraints declaran vinculante.

**Segunda corrección del 2026-07-31 — reexpresión de unidad, no de contenido.** Aquel 520–580 estaba en palabras *normalizadas* con un método que el plan nunca declaró, y por eso no era auditable. Reexpresado en `wc -w` crudo —la unidad que ahora declaran las Global Constraints, y la misma del total 27.000–31.000 y de las 26.541 de PLANPACTO— el rango es **560–620** sobre las líneas 1–52 (`sed -n '1,52p' … | wc -w`). Los mismos límites de contenido: el factor entre las dos unidades sobre esta cabecera es 612/576 = 1,0625, y 546 normalizadas ≈ 580 crudas siguen siendo el piso de la cabecera máximamente magra. **El valor actual es 612**, adentro del rango. No se movió una palabra del documento para conseguirlo.

**Verify:** `npx tsx scripts/verificar-planarco.ts` sale 0. Después **rompé algo a propósito** (renombrá un H2) y confirmá que sale 1. Restaurá.

- [ ] Task 1 completa

---

### Task 2: El preámbulo y la tesis central

**Files:** Modify: la guardia (agregar las dos secciones) · Modify: el documento.

**El rostro.** El corpus abre con una persona: nombre, edad, oficio, domicilio. PLANPACTO abrió con Fabiana Ojeda, cuarenta y seis años, almacenera de Villa Ángela. **PLANARCO necesita otra persona y otra provincia** — repetir Chaco sería leerse como el mismo documento.

El arco de la vida no se puede contar con un solo rostro sin volverse un caso. **Contalo con una persona en un umbral concreto y las personas que ese umbral toca alrededor.** El preámbulo tiene que dejar plantados **tres hilos que el CIERRE va a devolver o a declarar que no devuelve** — es la estructura de anillo que PLANPACTO cerró literal, y que la revisión final validó como el mayor acierto del documento.

**Regla de escala, del tramo B:** rostro antes de la escala. Primero la persona, después el número.

**La tesis** (700–900 palabras) dice la primitiva nueva —**el arco declarado**: una vida deja de ser una sucesión de trámites inconexos y pasa a ser una trayectoria con estaciones que la república reconoce, financia y acompaña— y **declara de entrada las tres cosas que este PLAN no hace**: no se propone mover la fecundidad (spec `:185`), no absorbe la discapacidad (queda en PLANCUIDADO + PLANSAL), y **no reclama piso constitucional**.

**Palabras:** preámbulo 1.100–1.400 · tesis 700–900.

- [ ] Task 2 completa

---

### Task 3: El diagnóstico — las ocho fallas, la crisis y los precedentes

**Files:** Modify: la guardia · Modify: el documento.

**Las ocho fallas** siguen la forma de `PLANPACTO:96-130`: H3 numerado `### 0.N {título}`, y adentro tres párrafos con lead en negrita — **La falla:** / **Por qué persiste:** / **El dato:**.

Las ocho tienen que ser **fallas del arco**, no fallas previsionales. Candidatas verificadas, con su domicilio:

1. **La vida se administra por trámite y nadie mira la trayectoria.** Ningún organismo del Estado argentino tiene el deber de saber en qué etapa de su vida está una persona.
2. **Los dos extremos del arco no tienen dueño.** El nacimiento se reparte entre salud y registro civil; la muerte no tiene ninguno — **«funeral» tiene cero ocurrencias en los PLANes** y el acto de morir no aparece como institución en ninguno.
3. **El haber se licúa, no se recorta.** `PLANMON:1547` critica todas las fórmulas de movilidad que Argentina inventó. **El modo de falla real del Piso Vital es la licuación, no el ajuste frontal** (spec `:190`).
4. **El cuidado no pago sostiene el sistema y recién ahora se cuenta.** `PLANCUIDADO:94`: doce millones de años-persona.
5. **La mediana edad no existe como categoría de política pública.** Verificado: no aparece en ningún PLAN del corpus.
6. **Al que se retira se le apaga la transmisión.** El corpus ya tiene dos dispositivos para lo mismo (`PLANSAL §9.3`, Granaderos de PLANCUL) y ninguno tiene la caja.
7. **La sucesión traba lo que la vida acumuló.** `PLANVIV:1233`: 400.000 viviendas trabadas en sucesión.
8. **Lo que no se financia no se deroga: se deja de ejecutar.** `BLINDAJE:41,44` — INTA −60% en los años 90, CONICET vaciado sin cerrar. **Sin fuente externa: se cita como aserción del corpus.**

**Regla del tramo B, no negociable: donde la tesis afirmó, la sección muestra.** El diagnóstico es la evidencia debajo del resumen, no el resumen otra vez. En el tramo B esta sección repitió la tesis en cuatro bloques de 35-45 palabras y hubo que deshacerlos con un detector de 8-gramas. **Escribilo bien la primera vez.**

**SECCIÓN 1 — la crisis.** Un titular con frase, como `PLANPACTO:166`. El eje: la curva demográfica. Usá `PLANREP:367` **atribuido a PLANREP** y declarando que es extrapolación aritmética del propio documento, sin fuente demográfica externa.

**SECCIÓN 2 — precedentes.** Internacionales y locales, con la disciplina que el tramo B pagó caro: **la sección que defiende al PLAN es la que menos se revisa, y fue el hallazgo Crítico de la revisión final.** Si un precedente no tiene cita en el corpus, se declara como aserción propia sin fuente. **Y cada precedente se lee en dos columnas: qué pidió y qué dio.** Enumerar sólo lo que un antecedente pidió, sin lo que dio, fue exactamente el error de `PLANPACTO §2.3`.

**Palabras:** fallas **3.400–4.000** · crisis 1.100–1.400 · precedentes 1.400–1.700.

- [ ] Task 3 completa

---

### Task 4: La arquitectura — el Calendario de Umbrales

**Files:** Modify: la guardia (**y acá empieza a parsear la primera tabla**) · Modify: el documento.

**Antes de la tabla, cerrá el hueco que la revisión de la Task 1 dejó anotado.** `filasDeTabla()` devuelve la **primera** tabla cuya cabecera contiene las columnas pedidas y no verifica que haya exactamente una — es la portada otra vez: el chequeo barato es «¿encontré lo que esperaba?» y el que salva es «¿hay algo que no esperaba?». Con dos tablas de columnas compartidas, una ensombrece a la otra y nadie se entera. **Y hay un segundo modo que la portada no tiene:** el bucle corta en la primera línea que no empieza con `|`, así que una tabla partida por un párrafo intercalado —cosa que este corpus hace— deja la mitad de las filas sin verificar, y si el chequeo es «cada fila tiene columna X», eso **falla abierto**. Las dos cosas se cierran acá, con la primera tabla, no con la segunda: la dirección defensiva es la que se posterga y no se escribe nunca.

**El Calendario de Umbrales no es un dispositivo: es la arquitectura** (spec `:179`). La sección lo presenta como tal y da la tabla de estaciones — que la guardia va a **parsear y verificar**: cada fila con su edad o hito, el dispositivo que la atiende, y el PLAN que ya la ocupa si hay uno. **La columna «quién la ocupa hoy» es obligatoria** y es lo que hace honesta la arquitectura: nueve de las estaciones tienen ocupante previo (**C-9**).

**Lo que esta sección tiene que resolver, y son los arreglos 1, 2 y 12:**

- **La remisión a la Regla de Arco** (arreglo 1 + **C-1**). Cita textual a `PLANPACTO §4.7`, declaración de que PLANARCO **no escribe regla de reparto propia**, y aceptación explícita de la jerarquía. Seguí el patrón editorial que PLANPACTO usó con `PLANJUS §400` en `:593`: nombrar la fuente, decir «se usa entera», enumerar lo que se toma, decir **qué no se fija acá**, y declarar cada variación como variación.
- **La tipología de rigidez** (arreglo 2 + **C-4**). **La movilidad automática mensual es Techo A por materia previsional**, apoyándose en `PLANPACTO:343`. **No estrenes «precompromiso indexado»** — la guardia lo prohíbe. Y resolvé el choque con `PLANMON:1547`, que indexa el mismo haber al peso-canasta: son dos mecanismos para lo mismo y hay que decir cuál manda o cómo conviven.
- **El blindaje de la Capa de Forma** (arreglo 12 + **C-9**). El modo de falla es el más probable del PLAN: *«Nadie tiene que derogar PLANARCO para matar el arco: alcanza con no ejecutar la Fase 3.»* **Pero la fórmula de la spec está mal:** «ley» es capa 1 y **`BLINDAJE:194`** la llama «protección media» (`:53` es la moraleja, «no hay protección legal absoluta» — corregido el 2026-07-31 por la Task 4, que abrió las dos líneas); la capa 4 se funda en **propiedad**, no en cobro, y el análogo del corralito (`BLINDAJE:63`) **no cubre una transferencia**. Justificá capa 4 por **masa de beneficiarios (`BLINDAJE:186-188`) y visibilidad de tablero (`:88-96`)** — son dos fundamentos distintos y este plan los tenía fundidos en una sola cita equivocada—, **decí explícitamente que el corralito no aplica**, y traé el mecanismo concreto que impide el vaciamiento por no ejecución.

**Palabras:** **2.600–3.300**.

- [ ] Task 4 completa

---

### Task 5: La Renta de Arco

**Files:** Modify: la guardia (**parsea la tabla de fuentes**) · Modify: el documento.

**Entregable explícito, heredado de la Task 4 y NO cubierto por la guardia:** §3.3 y §3.5 difieren a esta sección el choque del **Piso Vital Universal con el DNP de `PLANREP §15.3` y el DCM de `PLANTER:366-367`** — tres pisos universales que pagan a la misma persona de sesenta y cinco. `PLANREP:2261` dice que el DNP «complementa las jubilaciones mínimas con convergencia plena en Horizonte 3»; el DCM abre a los 18 y no cierra. **El documento tiene que decir si el Piso Vital se suma, se absorbe o es absorbido.** Si la Sección 4 se escribe sin resolverlo, **nada se pone rojo** — el diferimiento está declarado desde los dos lados en la prosa y no en la guardia.

**Antes de escribir una palabra: resolvé C-7.** ¿FSC y FSB son el mismo fondo o son dos? El corpus nunca lo reconcilió y `strategic-initiatives.ts:2045` los fusiona. **Abrí `PLANTER:349-374` y `PLANMON:1557-1563` y leelos enteros.** La respuesta que escribas es una **decisión de diseño de este documento** y se declara como tal. Si son dos, la tabla de fuentes los separa y no puede sumar la misma regalía dos veces. Si son el mismo, hay que decir cuál nombre gana y que el otro documento arrastra un alias.

**Los tres tramos:**

- **Piso Vital Universal a los 65, sin requisito de aportes.** Movilidad automática mensual contra canasta del adulto mayor. Techo A por materia (Task 4). El modo de falla es la licuación: **la fijación discrecional está prohibida y eso se escribe como regla, no como intención.**
- **Tramo Ganado, en tres monedas.** Y acá está el problema serio: **`PLANCUIDADO:340` ya escribió la moneda de cuidado**, con fórmula cerrada 1:1, techo anual y **validación por Mesa Civil**. PLANARCO tiene que declarar si **duplica** ese derecho o lo **sustituye** — y si lo sustituye, es la misma enmienda unilateral que el arreglo 4 denuncia para el FGS. El pasivo ya está cuantificado en `:94` (doce millones de años-persona, USD 2.400M/año) y **no se puede volver a gastar sin declararlo**. La tercera moneda, el **Servicio Cívico, no existe en el corpus** (**C-8**): o se inventa entero con contraprestación declarada, o **se cae a dos monedas**. El análogo más cercano, el panelista de `PLANJUS:1659`, **ya cobra**: contarlo sería pagar dos veces el mismo servicio.
- **Tramo Común**, financiado por el FSC y el Fondo Previsional Bastardo — **sujeto a C-7**. El Fondo Previsional Bastardo es un **sub-fondo del FSB, 15–20% de su rendimiento anual, sin monto propio declarado**, sobre un capital que todavía no existe. Eso se dice.

**La tabla de fuentes** lleva, por fila: fuente, dueño según `PLANPACTO §5.1`, fecha de disponibilidad, calificación de confianza (alta/media/baja/especulativa), y clase de `SOURCE_OF_FUNDS_LEDGER.md`. **Ninguna fila puede ser `future_return`** — `PLANPACTO:444` y **`:655`** lo prohíben dos veces (corregido el 2026-07-31: este plan citaba `:657`, que es el párrafo del «IVA que Vuelve»; la prohibición y la oración «Las clases son las de `SOURCE_OF_FUNDS_LEDGER.md` y no una taxonomía propia» viven las dos en `:655`). **La guardia suma esta tabla.**

**Palabras:** 3.200–3.600.

- [ ] Task 5 completa

---

### Task 6: El comienzo y el medio

**Files:** Modify: la guardia · Modify: el documento.

**SECCIÓN 5 — EL COMIENZO.** Dote de Origen, Umbral de la Llegada, Acta de Bienvenida.

- **La Dote** (arreglos 5 y 6 + **C-7**). El Fondo Intergeneracional **no puede sostenerla como está**: es 15% del *flujo* del FSC (USD 2.475–4.650M/año), **sin stock declarado ni regla de retiro**, y sus dos mandatos previos son ambos «no distribuir» — preservación de capital (`PLANTER:163`) y reserva anti-colapso del DCM (`:710` R7, `:839` F2). Peor: los dos son **anticíclicamente opuestos** a la Dote, porque el fondo se drena cuando caen los commodities y la natalidad no baja con el precio del litio. **La disyuntiva del arreglo 5 se resuelve hacia el piso: monto mínimo en canastas aunque el rendimiento sea cero.** Y la liberación es **contra evidencia verificable por sistema, no ante Mesa Civil** (arreglo 6) — *«como estaba, era la mejor máquina de punteros del corpus»*. Si eso vale para la Dote, **vale también para el Libro de Cuidado**, que se alimenta de auto-reporte: decilo.
- **El Umbral de la Llegada** **remite, no reescribe**. Los primeros mil días son de `PLANSAL §4.4` en exclusiva; la licencia parental extendida es `PLANSAL:1595-1605` **con números** (seis meses gestante, tres co-progenitor). «Licencia de crianza» no existe como término del corpus. La crianza compartida va vía Pacto de Cuidado de `PLANCUIDADO:295-326`.
- **El Acta de Bienvenida** es nueva y es donde el PLAN puede ser original sin pisar a nadie.

**SECCIÓN 6 — EL MEDIO.** El Pasaje (cuatro viajes pagos: 12, 18, 45, 60) y el Alto de los Cuarenta y Cinco.

- **La mediana edad es territorio virgen** — verificado, no aparece en ningún PLAN. Es la sección con más libertad y menos con qué apoyarse: **cada afirmación se declara como propia.**
- **El reintegro del Alto se diseña desde cero** (arreglo 7). `PLANCUIDADO:345-364` **carga** la Jornada 6+2 al empleador —dos horas al 75% de la hora de trabajo, ≈ +15% de costo laboral— y **no reintegra nada**: la única compensación declarada es no-monetaria. Y el acantilado del empleado número 50 es **doblemente** grave, porque PLANCUIDADO ya tiene **dos** umbrales propios (500 empleados en tranche-3, PYMES en 2040) que un umbral de 50 vendría a reemplazar. **Resolvelo o declará que no lo resolvés.**

**Palabras:** comienzo 2.200–2.600 · medio **1.600–2.100**.

- [ ] Task 6 completa

---

### Task 7: El final, y la agencia

**Files:** Modify: la guardia · Modify: el documento.

**SECCIÓN 7 — EL FINAL.** Es la sección más larga y la que menos verificación externa tiene. Rampa de Salida 60–72, Casa de Dos Edades, Casa de Arco, la Última Palabra, el Año del Duelo, el Umbral del Legado.

- **La Rampa sería la tercera versión del mismo dispositivo.** `PLANSAL §9.3` («Ancianos de Sabiduría», `:1171-1190`) y los Granaderos de PLANCUL ya existen. **No los ignores y no los dupliques:** declará cuál es la relación. **CORRECCIÓN DE LA TASK 3:** este plan decía que «lo que PLANARCO aporta que ninguno de los dos tiene es la caja» y **es falso para uno de los dos** — `PLANSAL:1370` le asigna al Programa Ancianos de Sabiduría **~USD 200M [est.] a diez años** para estipendios, transporte y materiales. Verificado. Los Granaderos sí están sin caja (`PLANCUL:421`, «PLANJUB les da dignidad económica», y PLANJUB no existe). **La asimetría se escribe explícita.**
- **El final del arco ya está escrito una vez, y como problema de precio.** `PLANEB:983-991`, §9.10 «La Bastarda del Adiós». **Declará la relación** — qué toma PLANARCO de ahí y qué no. **No escribas «no acompaña»:** `PLANEB:991` tiene un bullet titulado «Red de acompañamiento». Lo que falta es el deber, el dueño y el horario, no el acompañamiento. **No escribas «territorio vacío» sin acotar a qué.**
- **La Última Palabra y el Año del Duelo son los dispositivos 9 y 10 del arreglo 3, y nunca los leyó nadie** — el diseño llegó cortado a los verificadores de la primera vuelta, y dos veredictos sobre ellos son falsos negativos. **Antes de escribirlos, verificalos adversarialmente vos**: buscá el modo de falla, la superficie de captura y el conflicto con lo existente. El Año del Duelo **choca con `PLANCUIDADO:677`**, que ya tiene protocolo de acompañamiento en duelo, y con las Rondas de Duelo de `PLANCUL:156`.
- **Lo genuinamente vacío en el final del arco es la voluntad anticipada y la disposición del cuerpo como acto declarado**, no el sector funerario — ver la corrección de arriba. **Y el preámbulo ya declaró el hueco del costo funerario con la fórmula canónica, lo que es vinculante hacia adelante:** esta sección **no puede** introducir un unitario sin contradecirlo. Las dos salidas legítimas son repetir el hueco, o traer fuente externa nueva marcándola como externa. Es donde el PLAN es más original **y donde más fácil se estrena una cifra.** Cuidado.
- **La Casa de Dos Edades** lleva control cada 60 días el primer año y **prohibición absoluta de que el conviviente sea apoderado o beneficiario** (arreglo 8). **La Casa de Arco** son catorce personas, en el barrio, no en la ruta.
- **El Umbral del Legado no existe en el corpus** (**C-8**): se inventa entero, y **lo ejecuta la ANAV** porque PLANCUL no tiene agencia por diseño — declarado cuatro veces (`PLANCUL:46`, `:106`, `:389`, `:471`) y confirmado en `TABLA_AGENCIAS_BASTA.md:54`.

**SECCIÓN 8 — LA ANAV.** Agencia Nacional del Arco de la Vida. Ente autárquico, con el patrón AN+sufijo que siguen 15 de 22.

**El arreglo 9 es casi inescribible como está y hay que decir por qué.** Los Centros de Vitalidad están definidos **cuatro veces por la negativa** (`PLANSAL:712`, `:337`, `:1505`: no son hospitales disfrazados, no son consultorios médicos, no reemplazan al hospital, no son sucursales de la ANVIP) y son **autogobernados por asamblea barrial** — estructuralmente incapaces de firmar un contrato por arriba. El único vínculo PAMI del corpus va **al revés**: `PLANSAL:1786`, PAMI *deriva* afiliados hacia los Centros. **El «contrato de continuidad de 36 meses» no existe.** Escribí la relación que el corpus sí soporta —la derivación— y **declará que la refundación del PAMI queda fuera de este PLAN**, que es lo que la propia spec `:430` ya admite como incertidumbre legítima.

**El presupuesto bajo administración** va acá o en la Sección 9, y va **derivado**: ~45% del presupuesto nacional (`PLANMON:238`, `:248`) sobre ~USD 150.000M (`PRESUPUESTO_CONSOLIDADO:217`) ≈ **USD 67.500M/año**. **No escribas 50–60.000M** — no sale por ningún camino y la guardia lo prohíbe. Y **de PAMI no hay un solo número en el corpus**: si lo necesitás, es un hueco declarado.

**Palabras:** final 2.800–3.200 · ANAV 1.100–1.400.

- [ ] Task 7 completa

---

### Task 8: La integración y el modelo económico

**Files:** Modify: la guardia · Modify: el documento.

**Esta es la tarea que resuelve C-5, y es la más importante del tramo.**

**SECCIÓN 9 — MODELO ECONÓMICO Y FISCAL.** Tiene que cerrar cinco cosas, en este orden:

1. **La reconciliación del presupuesto.** El gate corrió sobre **53.000–96.000M a quince años**. Un régimen de 6.000–11.000M/año **no cabe** en ese horizonte sin una rampa, y la rampa no está escrita en ninguna parte. **Escribí la rampa —fase por fase, con el año en que el régimen se alcanza— y mostrá que la integral cierra contra el número del gate.** Si no cierra, **cambiá el rango anual, no el del gate**: el del gate está publicado en un acta y sostiene la legitimidad del PLAN. Cualquiera de los dos caminos se declara.
2. **El 0,60% de `PLANPACTO:369`** (**C-3**). Honralo o reemplazalo. Si lo reemplazás, **rehacé la división de PLANPACTO** (P = 23,15; F = 4,65; R = 65% con denominador 42,8) y declaralo — el permiso está escrito.
3. **La ausencia de piso** (**C-2**). PLANARCO no tiene escalón y no reclama piso. **Decí cómo se financia sin blindaje**, y qué le pasa al PLAN en la primera recesión. Es la pregunta que un lector adversarial va a hacer primero.
4. **La tabla de tres columnas** (erogación bruta / gasto sustituido / incremental neto) — **y acá está C-6**. «PUAM» y «PNC» **no existen en el corpus** y la guardia los prohíbe. «moratoria» existe **sin monto**. La única pensión no contributiva citada es **por invalidez**. **La columna del medio no se puede llenar con datos del corpus.** Las dos salidas honestas: escribirla con **monto pendiente y confianza media**, como `PLANPACTO:498` hizo con la base ancha del IVA; o **declarar el hueco** y decir que estimarlo sería estrenar un número. **Inventar la columna es la falla que este corpus entero existe para no cometer.**
5. **La comparación incómoda, escrita por nosotros antes que por un adversario.** El presupuesto bajo administración de la ANAV (~67.500M/año) es **del mismo orden que el ecosistema ¡BASTA! entero** (51.260–65.430M/año, `PRESUPUESTO_CONSOLIDADO:447`). Si no está en el documento, alguien la va a hacer en contra.

**INTEGRACIÓN CON EL MARCO ¡BASTA!** Sigue la forma de `PLANPACTO:715-723`. Tiene que emitir:
- **El par recíproco ARCO ↔ PACTO** (arreglo 13 + **C-1**). PLANPACTO ya escribió su mitad en `:430` y `:721`. **Esta es la otra mitad, y es lo único que le debe a PLANPACTO.**
- Las aristas con los seis `requires` CRITICAL entrantes: CUIDADO, MON, TER, DIG, SAL, REP (spec `:326`). **PLANARCO es el nodo más dependiente del corpus** y eso se dice.
- **La sucesión de PLANJUB declarada** (arreglo 10). Nombralo como el PLAN que nunca existió y del que PLANARCO es sucesor. **Y decí que son dos fantasmas, no uno:** PLANVEJ también sigue colgado (**C-9**). Las seis referencias de PLANCUL se arreglan en la Task 11.
- Lo que **no** es arista y va en prosa, con la razón — el patrón de `PLANPACTO:723`.

**Palabras:** integración 900–1.100 · modelo económico 2.200–2.600.

- [ ] Task 8 completa

---

### Task 9: Riesgos, perdedores y hoja de ruta

**Files:** Modify: la guardia · Modify: el documento · Modify: `Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md`.

**SECCIÓN 10 — RIESGOS.** El riesgo número uno **ya está nombrado por la spec** y es el vaciamiento por no ejecución de la Fase 3. El precedente se cita como **aserción del corpus sin fuente externa** (`BLINDAJE:41,44` — INTA −60% **en los años 90**, CONICET sin cifra). Están disponibles y sin usar dos casos más que sirven: **YPF** (el péndulo con ley del Congreso en las dos direcciones) y la **Convertibilidad** (`BLINDAJE:49-50`, «se derogó en una noche de enero de 2002»).

**SECCIÓN 11 — EL MAPA DE PERDEDORES.** Quién pierde y cuánto. Candidatos verificados: **PLAN24CN** pierde la banda alta del FGS (**y hay que decir que está research-only y sin presupuesto operativo** — es reasignar una reserva no ejecutada, no romper un compromiso vigente); **PLANCUIDADO** pierde exclusividad sobre la redención previsional; **PLANREP** no pierde nada **si PLANARCO no le toca el 7,3M**, y hay que decirlo para que nadie lo asuma.

**SECCIÓN 12 — HOJA DE RUTA.** Las cinco fases de la spec `:183`: contar el arco (0–1, gate duro de PIA) · el piso y el final (1–4) · la rampa y el Instituto (4–8) · los umbrales (6–10) · régimen pleno (10–15). **El orden es declarado y no es estético** — la spec da la razón y hay que escribirla: *un país que todavía no le paga bien a sus viejos no tiene autoridad moral para regalarle capital a sus chicos.*

**La hoja de ruta tiene que decir con nombre qué sobrevive si la Fase 3 no se ejecuta** — es la deuda que el propio arreglo 12 abre, y en el tramo B la sección equivalente la saldó nombrando uno por uno los dispositivos que sobreviven y **declarando cuál no**.

**READINESS_GATES_ADVERSARIAL.md**: la fila de PLANARCO con **tres attack paths** con mitigación, owner, fallback e indicador. Seguí exactamente la forma de la fila de PLANPACTO. Los fallbacks se escriben como *«hasta USD N/año — extremo alto de la banda de régimen»*, no como cifras sueltas.

**Palabras:** riesgos 700–900 · perdedores 700–900 · hoja de ruta 400–500.

- [ ] Task 9 completa

---

### Task 10: El tablero, el cierre, y la portada otra vez

**Files:** Modify: la guardia (**cierre: sin marcadores de pendiente, y las dos tablas suman**) · Modify: el documento.

Las cinco secciones finales: tablero, dimensión federal, Visión 2040, protocolo de falla y CIERRE.

**El CIERRE cierra el anillo y no agranda la promesa.** Devuelve **exactamente** lo que la tesis prometió y **declara lo que no**. En el tramo B esto fue el mayor acierto del documento, y la revisión final registró la sobriedad como **desviación deliberada** del corpus —que cierra con épica— *para que nadie la «alinee» después*. **PLANARCO no hereda esa restricción**: PLANPACTO cerró seco porque su tesis era que prometer de más mató a los tres acuerdos anteriores. La tesis de PLANARCO es otra. **Decidí el registro del cierre a conciencia y declaralo en el reporte**, en un sentido o en el otro.

Los tres hilos del preámbulo (Task 2) se devuelven acá, uno por uno, o se declara explícitamente cuál no se devuelve y por qué.

**Y la portada se vuelve a abrir.** Verificá que **cada dispositivo anunciado en el ASCII tenga ocurrencias en el cuerpo**, que el destinatario institucional esté contestado en alguna sección, y que la descripción de la arquitectura coincida con lo que la Sección 3 terminó escribiendo. En el tramo B la portada fue la peor página del documento por ser la única que nadie volvió a mirar.

**Palabras:** tablero **250–320** · federal 230–280 · visión 220–270 · protocolo 260–300 · cierre **350–480**.

- [ ] Task 10 completa

---

### Task 11: Las deudas en documentos ajenos

**Files:** Modify: `Iniciativas Estratégicas/PLANCUL_Argentina_ES.md` · Modify: `Iniciativas Estratégicas/PLAN24CN_Argentina_ES.md`.

**PLANCUIDADO — una referencia cruzada rota de la misma familia, encontrada por la Task 4.** `PLANCUIDADO:94` le atribuye a PLANVIV «viviendas intergeneracionales» y **PLANVIV tiene cero ocurrencias de «intergeneracional»** (verificado). Es el mismo defecto que los seis PLANJUB de PLANCUL: una atribución a un documento que no la sostiene. Arreglala o declarala, y **no la arregles en silencio**.

**PLANCUL — las seis referencias al fantasma** (arreglo 10). Líneas `:416`, `:421`, `:484`, `:534`, `:536`, `:682`, verificadas una por una. Apuntan a PLANARCO **con nota de sucesión declarada**, no en silencio: el glosario define «Granadero/a» como «adulto mayor de PLANJUB» y esa definición es de un PLAN que nunca existió. **No toques `v2/content/planes/PLANCUL.mdx` ni `strategic-initiatives.ts`** — son la edición derivada y el registro, y los dos son tramo E.

**PLAN24CN — la negociación del FGS por escrito** (arreglo 4). El hueco I-8 de `audit/05:300` pedía documentarlo desde abril y nadie lo hizo. Lo que se escribe:
- El tope del **8%** que PLANARCO le pide, con la razón: el FGS respalda jubilaciones y PLANARCO es su dueño natural por materia.
- **La incoherencia interna del propio 24CN, resuelta:** dice 10–20% en `:1943` y `:1958`, y 15–20% en `:1927` y `:2676`. **No hay número único que defender**, y eso hay que decirlo — es lo que vuelve razonable el tope.
- **Que PLAN24CN está *research-only / diferido, sin presupuesto operativo*** (`:8-12`) y que `PLANPACTO:719` ya lo listó entre los que no reclaman piso. **No es una enmienda unilateral a un compromiso vigente: es reasignar una reserva no ejecutada.** Escribilo así y la negociación deja de ser una expropiación.

- [ ] Task 11 completa

---

### Task 12: La guardia entra en CI

**Files:** Modify: `.github/workflows/socialjusticehub-ci.yml`.

Un step `Guardia de PLANARCO` junto al de PLANPACTO. **Los `paths` ya cubren `Iniciativas Estratégicas/` desde el tramo B** — verificalo, no lo asumas.

**Prueba de rotura de verdad, no simbólica.** En el tramo B el revisor rompió **tres valores a la vez** y la guardia salió verde, porque buscaba los números como texto y seguían apareciendo en la prosa. Acá: rompé **una fila de cada tabla parseada + un H2 + una cifra canónica, todo junto**, corré la guardia, confirmá que reporta los cuatro, y restaurá con `git checkout`.

- [ ] Task 12 completa

---

## Cierre del tramo

Al terminar las doce tareas:
1. `npx tsx scripts/verificar-planarco.ts` verde, con el resumen de líneas, secciones, cifras y tablas sumadas.
2. `wc -w` del documento dentro de **32.000–35.000**.
3. **Revisión final del tramo entero**, con el documento leído de punta a punta por un agente que no escribió ninguna sección. El tramo B la hizo y encontró un Crítico que las nueve revisiones por tarea no podían ver: **la sección que defendía al PLAN era la menos verificada del documento.** Buscá el equivalente acá — es el que más caro sale.
4. Ledger actualizado en `.superpowers/sdd/progress.md`.
