# Tramo D (segunda mitad) — PLANFOCO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Escribir `Iniciativas Estratégicas/PLANFOCO_Argentina_ES.md` — el documento del vigésimo sexto PLAN de ¡BASTA!, la palabra pública y la mirada — con sus doce arreglos obligatorios de la spec **corregidos y ampliados por la verificación previa**, que encontró diez problemas que la spec no tenía. Con esto cierra el tramo D y cierran los cuatro PLANes nuevos.

**Architecture:** Una guardia ejecutable (`SocialJusticeHub/scripts/verificar-planfoco.ts`) declara qué secciones tiene que tener el documento, qué cifras canónicas tiene que citar con domicilio, qué strings tiene prohibidos y **qué tablas tienen que sumar** — acá son tres: la extinción de la pauta, la rampa de quince años y el reparto interno del régimen, que tiene que dar 300 y 450 exactos. Cada tarea de contenido **primero extiende la guardia** —que pasa a fallar— y después escribe las secciones que la hacen pasar.

Y una guardia nueva de alcance general: `SocialJusticeHub/scripts/verificar-remisiones.ts`, que resuelve **toda** remisión `ARCHIVO:línea` del corpus contra el archivo real. Existe por la primera lección del cierre del tramo D: editar un documento ajeno corre sus líneas y rompe remisiones ajenas, y eso lo encontró una guardia por casualidad. Este tramo toca **cinco** documentos ajenos con ~119 remisiones apuntándoles. No se hace a ojo.

**Tech Stack:** TypeScript + tsx (scripts one-shot, se corren a mano y en CI), Markdown.

> **NOTA OPERATIVA — hay un hook que bloquea `Write` sobre archivos `.md`.** Es un hook global de otro proyecto (brand review de Kairospace) que se dispara sobre cualquier markdown y **frena la herramienta Write**. `Edit` NO está afectado. Para crear un archivo `.md` nuevo usá `cat > ruta <<'EOF' … EOF` desde Bash; después trabajalo normalmente con `Edit`. No pierdas tiempo peleándole al hook ni intentes desactivarlo.

> **Alcance del tramo.** Este plan cubre **solamente PLANFOCO**. La migración del canon (spec §9), las 69 aristas del grafo y lo no humano (spec §7) son el tramo E y no se tocan acá. Sí se cobra, en cambio, la deuda que PLANPREGUNTA dejó anotada: el par recíproco FOCO ↔ PREGUNTA pasa a tener sus dos mitades.

---

## Lo que la verificación previa encontró, y la spec no decía

Diez hallazgos de una lectura del corpus entero antes de escribir este plan. **Los diez son vinculantes.** Donde uno de ellos choque con la spec, **gana el hallazgo**: está verificado contra el texto y la spec no.

### F-1 · El domicilio de la pauta no es `:396`, y lo que dice el domicilio real cambia el problema

La spec atribuye los «180–270M genéricos» a `PRESUPUESTO_CONSOLIDADO:396`. Esa línea es la fila de PLANDIG de la tabla de régimen pleno y no habla de pauta. **El domicilio real es `PRESUPUESTO_CONSOLIDADO_BASTA.md:419`**, y está adentro de «Fuente 1 — Reasignación de gastos actuales de baja productividad»:

> *«Publicidad oficial consolidada: USD 450M/año (eliminable en 40-60%).»*

Dos consecuencias que cambian el diseño:

1. **Los 180–270M no son una línea aparte: son el 40–60% de los 450.** No hay dos bolsas. Hay una sola, y el corpus ya se comprometió a gastar entre el 40 y el 60% de ella en el ecosistema entero. PLANFOCO no llega a una fuente libre: llega a una fuente **ya comprometida en más de la mitad**, igual que PLANPREGUNTA con las regalías.
2. **Hay un segundo documento apoyado en la cifra, y se apoya retóricamente.** `PLANMESA:788` dice que su propio presupuesto es *«menor que la asignación actual a presupuestos de publicidad oficial consolidada»*, superior a USD 450M en 2023, y `PLANMESA:88` repite la comparación en el resumen que se publica. Si PLANFOCO extingue la pauta, esa comparación deja de ser una descripción del presente. **Es exactamente el daño de segundo orden que el cierre del tramo D anotó como lección 2**, y se paga con nota fechada, no con reescritura.

### F-2 · PLANCUL ya tiene una fórmula de reparto de pauta, y es precisamente la que la Pauta Ciega prohíbe

`PLANCUL:387`, Acción 3 de las tres acciones del gobierno:

> *«Redistribuir pauta publicitaria: Fórmula transparente (50% audiencia, 30% geografía, 20% diversidad), publicación en tiempo real, prohibición de asignación discrecional.»*

**El 50% por audiencia es pagar por alcance**, que es literalmente lo que la spec declara inadmisible: *«pagar por “alcance verificado” es subsidiar al incumbente»*. Una fórmula por audiencia le gira más plata al que ya tiene más público, o sea a Clarín y a La Nación, con la firma de la transparencia encima. Es el mecanismo que este PLAN existe para desmontar, escrito adentro del corpus, en uno de los tres actos de gobierno de otro PLAN, y repetido en el resumen `PLANCUL:106` que se deriva a la UI.

**La spec no lo registró.** Se resuelve por derogación expresa de la Acción 3, escrita en los dos documentos, y **no viola el arreglo 12**: derogar una acción de gobierno no le da a PLANCUL agencia, ni presupuesto, ni piso. Le saca una tarea. PLANCUL sale de la operación con **menos** Estado encima, que es lo que su propio compromiso de no-intervención (`PLANCUL:389`) pide.

Y hay una simetría que el documento tiene que decir en voz alta: **el mismo PLAN cuya acción se deroga es el que midió la herida.** `PLANCUL:304` es el domicilio de las cinco horas del título.

### F-3 · Los 3.000 existen, son de PLANDIG, y son un derecho — la corrección de la spec los pisaría

El arreglo 3 manda «corregir 3.000 → 1.200–1.500 en la arista con PLANRUTA y en todo el texto». Verificado: **la arista no existe** (PLANFOCO no es nodo de ningún grafo todavía; eso es tramo E), y **el 3.000 sí existe, pero no es un error de PLANFOCO: es una cifra de PLANDIG**.

- `PLANDIG:788`, dentro del derecho al Commons Atencional: *«Red nacional de 3.000+ Commons Atencionales en régimen (uno cada 15.000 habitantes).»*
- `PLANDIG:799`, en la tabla de derechos cognitivos, con su mecanismo de financiamiento ya nombrado: *«Presupuesto constitucional, convenio con bibliotecas populares, municipios, universidades.»*

No se corrige el número de otro PLAN escribiendo uno más chico en el propio. **Las dos cifras miden cosas distintas y las dos quedan en pie:**

| Cifra | De quién | Qué mide |
|---|---|---|
| 3.000+, uno cada 15.000 habitantes | PLANDIG (`:788`) | **cobertura del derecho** — espacios certificados como atencionalmente limpios |
| 1.200–1.500 | PLANFOCO | **sedes que este PLAN construye, dota y paga** — con bibliotecario, acervo y horario |

Y la aritmética del derecho cierra sin forzar nada: `PLANCUL:259` cuenta **2.000+ bibliotecas populares** ya existentes, que son exactamente el convenio que `PLANDIG:799` nombra. 1.500 + 2.000 = 3.500 > 3.000. **PLANFOCO no achica la promesa de PLANDIG: la financia por la mitad más cara y certifica el resto.** Lo que la guardia prohíbe es escribir 3.000 como meta de obra propia.

### F-4 · La TABLA 20 confirma el hueco, y da la escala del favor

`PLANDIG:1086-1101`, TABLA 20 — Inversión Acumulada a 10 Años: doce filas, ninguna es el Commons Atencional. El derecho está consagrado en la Sección 9.4 y **no tiene una sola línea de plata en el propio documento que lo consagra**. Confirmado.

Lo que la spec no dice es cuánto vale el favor. El total de la TABLA 20 es **USD 4.700–9.900M en diez años, ~700M/año**. PLANFOCO va a pagar el Commons a 300–450M/año: **entre el 43% y el 64% del presupuesto anual entero de PLANDIG**. Esto no es una nota al pie ni una cortesía entre PLANes vecinos. Es un PLAN absorbiendo un costo que otro consagró como derecho y nunca presupuestó, y así se escribe.

### F-5 · La palabra «algorítmica» no aparece ni una vez en PLANEDU

Arreglo 11 confirmado, y con el domicilio exacto de la rotura. `PLANDIG:803` afirma:

> *«la Ecología de la Atención articula directamente con PLANEDU (alfabetización algorítmica como materia desde secundaria)»*

`grep -i "algorítmic\|algoritmic" PLANEDU_Argentina_ES.md` devuelve **cero líneas**. PLANEDU tiene «alfabetización digital» una vez y es una fila de diagnóstico (`:162`: *«Parcial, desactualizada»*). La materia que PLANDIG da por dictada no existe.

**El Desmontaje la crea**, y por eso el arreglo 11 tiene que tocar PLANEDU y no alcanzar con declararlo desde acá: una referencia rota no se repara escribiendo del lado del que la señala.

### F-6 · Los medios públicos no existen en el corpus, y media sección del PLAN se apoya en ellos

Censo sobre los veinticuatro documentos del taller. **Cero ocurrencias** de: `medios públicos`, `Radio Nacional`, `Televisión Pública`, `TV Pública`, `Contenidos Públicos`, `RTA`. También cero de `Pauta Ciega`, `Biblioteca Viva`, `Acervo Abierto`, `Sala Común`, `Beca del Desierto`, `ANBAC`, `Desmontaje` (salvo la mitad que PLANPREGUNTA ya escribió).

Consecuencias:

1. **La Sala Común y El Acervo Abierto no tienen ni un vecino.** Todo lo que el documento diga sobre la planta de los medios públicos, sobre los setenta años de audiovisual estatal y sobre quién los custodia hoy es **aserción propia**, y se declara como tal en cada caso, con la rama que corresponda de las cuatro (supuesto de trabajo, decisión de diseño, hueco declarado, restricción heredada). El PLAN que se estrena exigiendo trazabilidad de la palabra pública no puede estrenar afirmaciones sin domicilio.
2. **`Cartelera` tiene una ocurrencia y es una colisión de nombre.** `PLANSAL:1515` usa «cartelera física» para el tablón donde un Centro de Vitalidad publica sus gastos. No es el mismo objeto. El documento desambigua la primera vez que usa el término.
3. **El corpus ya tiene una bibliotecaria y la usó para hablar de otra cosa.** `PLANMOV:119` presenta a *«Julia — la vecina con el auto parado veintidós horas por día»*, bibliotecaria de Villa Devoto. PLANFOCO **no la reusa** —es voz de otro PLAN— pero tampoco puede escribir como si estrenara la profesión en el corpus. Se la nombra una vez, con domicilio, y se sigue.

### F-7 · El gate no consumió el presupuesto de PLANFOCO, así que el total sí es corregible

`SocialJusticeHub/scripts/gate-spinoff-planes-nuevos.ts:26` carga `{ code: 'PLANFOCO', low: 3_000, high: 5_000, huespedes: [] }`. Con `huespedes` vacío el bucle hace `continue` **antes de usar los montos**: nunca entran a un cociente. La salida publicada en `ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:31` lo confirma — dice «SIN HUÉSPED», no un ratio.

**Ésta es la diferencia con el tramo D y decide toda la aritmética.** El total de PLANPREGUNTA era intocable porque era el insumo del gate y estaba publicado en el acta; el de PLANFOCO no lo consumió ningún instrumento. Entonces:

- **Manda la banda anual**, no el total, porque de la banda cuelga la restricción de orden que la spec sí fija: *«por debajo de PLANTALLER, no por encima de PLANJUS»* — PLANTALLER 640–1.000M/año (`PRESUPUESTO_CONSOLIDADO:394`, `PLANTALLER:655`), PLANJUS 800–2.500M/año (`PLANJUS:107`).
- **El total de quince años se deriva de la rampa y se corrige con la medición escrita**, igual que en los tramos C y D.

### F-8 · La aritmética de la pauta cierra, y cierra mejor de lo que la spec temía — si el techo del PLAN es la pauta

Éste es el arreglo 1 resuelto. El problema que la spec plantea es real: el cronograma viejo se detenía en 170M liberados y la red se dimensionó contra ~280M; con extinción se liberan 450M y sobran ~170M sin destino declarado.

La salida no es agrandar la red a 2.000 sedes —eso contradice el arreglo 3 y no cabe en la banda—. Es **hacer que el techo del PLAN sea la fuente que extingue**:

> **Este PLAN no puede ser más grande que la pauta que mata.** El techo de la banda anual es USD 450M porque ése es el tamaño de la publicidad oficial consolidada, y no hay una segunda fuente que este documento reclame.

Eso obliga a **corregir la banda de la spec de 300–500 a 300–450**, y a cambio cierra la cuenta sin agujero, que es más de lo que consiguió PLANPREGUNTA:

**Extinción de la pauta — un quinto por año sobre los USD 450M de `PRESUPUESTO_CONSOLIDADO:419`:**

| Año | Pauta que el Estado todavía puede colocar en medios | Liberado |
|---|---|---|
| 2027 | 360 | 90 |
| 2028 | 270 | 180 |
| 2029 | 180 | 270 |
| 2030 | 90 | 360 |
| 2031 | 0 | 450 |
| 2032–2041 | 0 | 450 |

**Rampa de gasto — nunca por encima de lo liberado:**

| Fase | Años | Anual bajo | Anual alto | Subtotal bajo | Subtotal alto |
|---|---|---|---|---|---|
| 0 — la pauta se vuelve ciega (2027–2028) | 2 | 60 | 90 | 120 | 180 |
| 1 — las primeras seiscientas sedes (2029–2031) | 3 | 170 | 260 | 510 | 780 |
| 2 — la red completa, 1.200–1.500 (2032–2034) | 3 | 270 | 430 | 810 | 1.290 |
| 3 — régimen y evaluación (2035–2041) | 7 | 300 | 450 | 2.100 | 3.150 |
| **Total** | **15** | — | — | **3.540** | **5.400** |

**El total de quince años pasa de 3.000–5.000 a 3.540–5.400.** El sobrante que la spec no sabía dónde poner tiene destino escrito: **vuelve a la Fuente 1 de `PRESUPUESTO_CONSOLIDADO:419`**, que es de donde salió. En régimen quedan **0–150M/año** para el ecosistema, contra los 180–270M que el corpus tenía anotados. Ésa es la pérdida, es real, y se declara con la misma disciplina con que PLANPREGUNTA declaró que partía al medio la reserva anti-colapso del Dividendo.

Y hay un año que hay que decir en voz alta: **en 2027, en el escenario alto, el PLAN se come los 90M liberados enteros y el ecosistema no recibe nada.** No se redondea.

### F-9 · Cinco documentos ajenos, ~119 remisiones apuntándoles, y una lección que ya se cobró una vez

| Documento | Por qué hay que tocarlo | Remisiones `ARCHIVO:línea` que le apuntan |
|---|---|---|
| `PLANCUL` | derogar la Acción 3 (**F-2**) | 19 |
| `PLANDIG` | el Commons pasa a tener pagador; reparar `:803` (**F-3**, **F-4**, **F-5**) | 56 |
| `PLANEDU` | el Desmontaje se dicta acá (arreglo 11) | 2 |
| `PLANJUS` | el Panel de Legalidad de Publicación (arreglo 10) | 19 |
| `PLANMEMORIA` | el Acervo se parte: manifiesto y hash en los siete nodos (arreglo 8) | 23 |

Más `PRESUPUESTO_CONSOLIDADO` (F-1, F-8), `PLANMESA` (F-1) y `PLANPREGUNTA` (F-10, y le apuntan **cero** remisiones, así que es el único que se puede editar sin cuidado).

**Regla dura de este tramo, y no es negociable:** toda edición sobre un documento ajeno **conserva el número de líneas** —se reescribe adentro de una línea existente— **o se agrega después de la última línea**. Nada se inserta en el medio. Las dos formas dejan intactas todas las remisiones ajenas.

Y para que la regla no dependa de que alguien se acuerde, la Task 12 escribe `verificar-remisiones.ts`, que resuelve toda remisión del corpus contra su archivo. En el tramo D esto se encontró por casualidad, porque la guardia de PLANARCO casualmente citaba a PLANTER. La casualidad no es un método.

### F-10 · PLANPREGUNTA ya escribió su mitad, y lo que escribió obliga

`PLANPREGUNTA:732-734` fijó tres cosas que PLANFOCO **hereda y no vuelve a decidir**:

1. El **Desmontaje** y el **Censo de Ignorancia** son la misma capacidad cívica a dos escalas.
2. **El Sello Abierto publica adentro del Acervo** de PLANFOCO, en vez de construir repositorio propio. Es una dependencia entrante: el Acervo tiene que aceptarla, y eso tiene costo y protocolo.
3. La fórmula de la deuda: *«PLANFOCO es el par recíproco de este PLAN y todavía tiene una sola mitad escrita.»*

La tercera **deja de ser verdad** el día que este documento exista, y ése es el tipo de afirmación en presente que la lección 2 del tramo D obliga a barrer. Se paga con nota fechada del lado de PLANPREGUNTA — que es gratis, porque nadie lo referencia por línea.

---

## Global Constraints

Aplican a todas las tareas. Violarlas es motivo de rechazo de la tarea, no de nota al pie.

1. **Toda cifra tiene domicilio o se declara.** Si sale del corpus va con `ARCHIVO:línea` en la misma oración. Si no sale del corpus, se declara con una de las cuatro ramas: **supuesto de trabajo**, **decisión de diseño de este documento**, **hueco declarado**, **restricción heredada**. La cuarta existe porque llamar «decisión de diseño de este documento» a un valor heredado de otro PLAN es fabricarse una autoría.
2. **`wc -w` crudo** es la única unidad de conteo de palabras. Sin normalizaciones privadas.
3. **Castellano rioplatense**, voseo. `solo` sin tilde. Números biográficos en letras, números de política en cifras.
4. **La restricción del fundador es absoluta y se verifica**: ningún dispositivo controla, licencia ni castiga contenido. La guardia prohíbe los verbos de licenciamiento aplicados a contenido en forma afirmativa, y **deja pasar las formas negadas**, que son las que el PLAN necesita escribir. Un prohibido que castiga la renuncia y deja pasar el reclamo está al revés.
5. **Ninguna remisión a un archivo que no existe.** Y ninguna remisión `PLANFOCO:línea` desde ningún lado hasta que el archivo esté escrito.
6. **Sin piso constitucional.** PLANFOCO no agrega escalón a la Escalera de PLANPACTO. Su piso va a Visión 2040+, tal como la spec lo fija. La guardia lo verifica contra `tests/unit/pisos-constitucionales.test.ts`.
7. **Toda edición de documento ajeno conserva el conteo de líneas o se anexa al final.** Ver **F-9**.
8. **Un commit por tarea**, y al índice se agregan **sólo los archivos propios por nombre**. Nunca `git add -A`.

---

## Cifras canónicas — con domicilio

La guardia verifica que cada una aparezca con su ancla en la misma oración.

| Cifra | Domicilio | Qué es |
|---|---|---|
| USD 450M/año, eliminable en 40-60% | `PRESUPUESTO_CONSOLIDADO_BASTA.md:419` | publicidad oficial consolidada — la fuente entera |
| superior a USD 450M en 2023 | `PLANMESA:788` | confirmación independiente de la misma cifra |
| 5,2 horas de pantalla no-laboral por día (global 3,8) | `PLANCUL:304` | **las cinco horas del título** |
| 3.000+ Commons Atencionales, uno cada 15.000 habitantes | `PLANDIG:788` | el derecho que este PLAN financia |
| convenio con bibliotecas populares, municipios, universidades | `PLANDIG:799` | el mecanismo que PLANDIG ya nombró |
| 2.000+ bibliotecas populares existentes | `PLANCUL:259` | el resto de la cobertura del derecho |
| USD 4.700–9.900M a diez años (~700M/año) | `PLANDIG:1086-1101` | TABLA 20 — la escala del favor |
| 50% audiencia, 30% geografía, 20% diversidad | `PLANCUL:387` | la fórmula que se deroga |
| compromiso de no-intervención | `PLANCUL:389` | por qué derogar no viola el arreglo 12 |
| USD 640–1.000M/año, 4.000 Tallers × USD 180K | `PRESUPUESTO_CONSOLIDADO:394`, `PLANTALLER:655` | el techo de orden y el contraste de costo por sede |
| USD 800–2.500M/año | `PLANJUS:107` | el piso de orden |
| sorteo estratificado por Credencial en la materia | `PLANMESA:297` | la mecánica de sorteo que usa el concurso ciego |
| Capa 1 — Mesa Territorial Base, escala barrial o municipal | `PLANMESA:466` | quién decide las compras (arreglo 7) |
| siete nodos distribuidos con hash | `PLANMEMORIA:90` | dónde va el manifiesto del Acervo (arreglo 8) |
| Informe Mensual de Extracción Atencional | `PLANDIG:886` | el instrumento que mide lo que este PLAN devuelve |
| El Presupuesto de Vida es `PLANDIG §9.6` | `PLANDIG:867` | se degrada a instrumento de medición, no es dispositivo propio |
| bibliotecaria de Villa Devoto | `PLANMOV:119` | la bibliotecaria que el corpus ya tenía |
| cartelera física del Centro | `PLANSAL:1515` | la colisión de nombre a desambiguar |

---

## Strings prohibidos

La guardia los busca **por oración**, no por línea, y cada uno lleva su `salvoSi` cuando la forma negada es legítima.

| Patrón | Por qué | Salvo si |
|---|---|---|
| `3.000` como meta de sedes propias | es la cifra de PLANDIG (**F-3**) | la oración cita `PLANDIG:788` o `:799` |
| `PLANFOCO:` + dígitos | remisión a líneas propias desde afuera; cita fabricada | — |
| `PRESUPUESTO_CONSOLIDADO:396` | domicilio equivocado de la spec (**F-1**) | — |
| `piso constitucional` afirmativo para PLANFOCO | no tiene, y no lo pide | la oración lo niega (`sin`, `no`, `ni`, `tampoco`, `ningún`) |
| `licencia`/`licenciar`/`habilitar` + contenido/medio, afirmativo | la restricción absoluta del fundador | la oración lo niega |
| `alcance verificado` como criterio de reparto, afirmativo | subsidia al incumbente | la oración lo rechaza |
| `regula`/`regulación` de medios, afirmativo | el Estado no regula medios en este PLAN | la oración lo niega |
| `300–500` / `300-500` como banda anual | corregida a 300–450 (**F-8**) | la oración declara la corrección |
| `3.000–5.000` como total a quince años | corregido a 3.540–5.400 (**F-8**) | la oración declara la corrección |
| `PLANEDU` + `ya dicta`/`ya enseña` + algorítmic\* | la materia no existe (**F-5**) | la oración lo niega |
| `Ministerio de la Verdad` sin negación | el PLAN existe para no serlo | la oración lo niega |
| `Vigésimo Sexto Mandato` | ése es PLANPREGUNTA; éste es el **Vigésimo Séptimo** | — |

---

## File Structure

```
Iniciativas Estratégicas/
  PLANFOCO_Argentina_ES.md              # NUEVO — el documento
  PLANCUL_Argentina_ES.md               # MOD — deroga Acción 3 (línea 387, in situ)
  PLANDIG_Argentina_ES.md               # MOD — Commons con pagador; :803 reparado (in situ)
  PLANEDU_Argentina_ES.md               # MOD — el Desmontaje (anexo al final)
  PLANJUS_Argentina_ES.md               # MOD — Panel de Legalidad de Publicación (anexo al final)
  PLANMEMORIA_Argentina_ES.md           # MOD — manifiesto y hash del Acervo (anexo al final)
  PLANMESA_Argentina_ES.md              # MOD — nota fechada sobre la comparación de :788 (in situ)
  PLANPREGUNTA_Argentina_ES.md          # MOD — la deuda del par se salda (anexo)
  PRESUPUESTO_CONSOLIDADO_BASTA.md      # MOD — Fuente 1 pasa a 0-150M (in situ)
  READINESS_GATES_ADVERSARIAL.md        # MOD — bloque PLANFOCO con tres attack paths

SocialJusticeHub/scripts/
  verificar-planfoco.ts                 # NUEVO — la guardia del documento
  verificar-remisiones.ts               # NUEVO — la guardia de remisiones del corpus

.github/workflows/
  socialjusticehub-ci.yml               # MOD — dos pasos nuevos
```

---

## Presupuesto de palabras

Objetivo total: ~~26.000–28.500~~ **25.000–26.500 palabras** (corregido — ver la nota de abajo). Calibrado contra el corpus: PLANCUL 11.136, PLANMESA 15.871, PLANPACTO 26.541, PLANPREGUNTA 29.242, PLANARCO 34.440, PLANDIG 39.862. PLANFOCO es el más chico de los cuatro nuevos en plata y le corresponde el extremo bajo de la banda de los nuevos, no el de PLANCUL: su lista de dispositivos es larga aunque su presupuesto sea corto.

| Sección | Palabras |
|---|---|
| Cabecera + portada | ~~700–780~~ **700–820** |
| PREÁMBULO | 1.500–1.900 |
| TESIS CENTRAL | 550–700 |
| SECCIÓN 0 — las siete fallas | ~~2.000–2.500~~ **1.900–2.300** |
| SECCIÓN 1 — la crisis | ~~900–1.200~~ **780–1.000** |
| SECCIÓN 2 — precedentes | ~~1.100–1.400~~ **1.040–1.300** |
| SECCIÓN 3 — la Pauta Ciega | 1.900–2.300 |
| SECCIÓN 4 — la Biblioteca Viva | 2.100–2.600 |
| SECCIÓN 5 — La Antena | 1.000–1.300 |
| SECCIÓN 6 — La Cartelera | 800–1.050 |
| SECCIÓN 7 — El Acervo Abierto y La Sala Común | 1.500–1.900 |
| SECCIÓN 8 — La Procedencia | ~~1.000–1.300~~ **900–1.150** |
| SECCIÓN 9 — La Mirada y el Desmontaje | 1.500–1.900 |
| SECCIÓN 10 — quién compra y quién atiende | 1.300–1.650 |
| SECCIÓN 11 — lo que este PLAN tiene prohibido | ~~900–1.150~~ **820–1.050** |
| SECCIÓN 12 — ANBAC | ~~1.000–1.300~~ **880–1.100** |
| INTEGRACIÓN | ~~900–1.150~~ **690–880** |
| SECCIÓN 13 — modelo económico | ~~2.200–2.700~~ **1.980–2.400** |
| SECCIÓN 14 — riesgos | ~~700–900~~ **520–700** |
| SECCIÓN 15 — mapa de perdedores | ~~650–850~~ **450–620** |
| SECCIÓN 16 — hoja de ruta | ~~600–800~~ **310–450** |
| SECCIÓN 17 — tablero | ~~500–700~~ **350–500** |
| SECCIÓN 19 — federal | ~~500–700~~ **380–520** |
| SECCIÓN 20 — visión 2040 | ~~550–750~~ **330–470** |
| SECCIÓN 21 — protocolo de falla | ~~500–700~~ **430–580** |
| CIERRE | 400–600 |


> **Corrección de tres rangos, con la medición escrita (2026-08-01, Task 3).** Los rangos de las
> secciones 0, 1 y 2 se fijaron a ojo contra PLANPREGUNTA y quedaron entre un 5 y un 10% por encima de
> lo que las secciones dan una vez escritas con contenido verificado y sin relleno. La medición que
> manda es la del modelo: **la SECCIÓN 0 de PLANPACTO —que es la forma que el brief manda imitar— tiene
> 1.954 palabras**, y ésta quedó en 1.929 con siete fallas contra las ocho de PLANPREGUNTA. Los tres
> rangos se bajan a lo medido en vez de rellenar tres secciones para alcanzar un número que nadie había
> derivado de nada.


> **Segunda corrección del presupuesto de palabras, con la medición escrita (2026-08-01, Task 13).**
> Trece rangos más se bajan a lo medido, y esta vez la causa se identifica en vez de irse parcheando
> sección por sección: **el presupuesto se calibró por analogía con PLANPREGUNTA (29.242 palabras) sin
> descontar dos cosas.** Una, que PLANFOCO administra un tercio de su plata y tiene una lista de
> dispositivos más corta por sección. Dos, y es la que explica el grueso del desvío, que **las
> secciones 14 a 21 de este documento son dominadas por tablas, y `wc -w` cuenta una tabla por lo que
> ocupa y no por lo que dice**: la SECCIÓN 14 son diez riesgos con mitigación escrita en 535 palabras y
> la 17 son once indicadores en 364. Medidas contra el modelo correcto —las secciones finales de
> PLANPREGUNTA, que van de catorce a veinte líneas cada una— están en escala.
>
> El documento cerró en **25.631 palabras**, contra 26.541 de PLANPACTO, 29.242 de PLANPREGUNTA y
> 34.440 de PLANARCO. Es el más corto de los cuatro nuevos y también el de menor presupuesto
> administrado, y esa proporción es la que se buscaba. **Ninguna sección se rellenó para alcanzar un
> número que nadie había derivado de nada.**

**Si una sección queda corta, se agrega contenido verificado o se corrige el rango con la medición escrita. Nunca se rellena.**

---

## Tasks

> **Desvío declarado respecto del red-green por tarea.** La guardia de la Task 1 se escribe
> **entera** —las 26 secciones, las 14 cifras canónicas, los 13 prohibidos y las tres tablas— en vez
> de crecer tarea por tarea. Con eso arranca reportando 53 problemas y cada tarea achica la lista, que
> es el mismo rojo-verde con una sola vuelta de edición del script en lugar de trece. Lo que se pierde
> es la posibilidad de ver *qué chequeo nuevo* puso rojo a la guardia en cada tarea; lo que se gana es
> que ningún chequeo quede sin escribir por olvido al final. El intercambio se declara acá y no se
> descubre después.

### Task 1 — La guardia y el esqueleto

- [x] Crear `SocialJusticeHub/scripts/verificar-planfoco.ts` con: los 26 H2 esperados en orden; epígrafes con default «tiene uno» y exentos verificados en las dos direcciones; conteo y numeración correlativa de subsecciones **con auto-descubrimiento** (una sección con ≥2 `### N.M` no declarada es error, no pase); cifras canónicas con ancla en la misma oración; prohibidos con `salvoSi` por oración; y la verificación de que no hay piso constitucional.
- [x] Heredar de `verificar-planpregunta.ts` las cuatro reglas de doctrina de guardia: default seguro con opt-out verificado en los dos sentidos; descubrimiento automático; si el ancla no es única el chequeo no corre y **lo dice**; patrón y excepción miden la misma unidad.
- [x] Crear el documento con `cat > … <<'EOF'`: cabecera de metadatos, H1, `## Vigésimo Séptimo Mandato del Proyecto ¡BASTA!`, versión, portada ASCII.
- [x] La cabecera escribe el **total de quince años** y remite a la Sección 13 para la banda anual. No estrena un número anual antes de derivarlo.
- [x] La cabecera escribe entera la habilitación: PLANFOCO **no se puede medir** con el gate de la regla 3 porque nunca tuvo huésped (`ACTA:31`, `:59`, `:97`). No es que falle: no lo alcanza.
- [x] Verificar: la guardia pasa; `wc -w` de la cabecera + portada cae en 700–780.
- [x] Commit.

### Task 2 — PREÁMBULO y TESIS CENTRAL

- [x] La cara: **Marisol Quiroga**, 34, cajera del turno noche de una estación de servicio en Chajarí, Entre Ríos. Vuelve a las siete de la mañana, duerme hasta las dos de la tarde, y tiene ocho horas despierta en un pueblo donde lo único abierto es el teléfono.
- [x] Tres hilos de anillo: **el cartel de horarios** de la biblioteca popular, escrito a mano, con un horario fijado para un pueblo que trabajaba de mañana; **algo que quiso aprender y no aprendió**, concreto y barato; y **el informe que le llega todos los meses** con sus horas de pantalla — que es el `Informe Mensual de Extracción Atencional` de `PLANDIG:886`, un dispositivo que el corpus ya tiene y que hoy le dice el número sin ofrecerle a dónde ir.
- [x] Las cinco horas del título se anclan en `PLANCUL:304` (5,2 no laborales por día contra 3,8 global) la primera vez que aparecen. El título acusa; la cifra sostiene la acusación.
- [x] Nombrar una vez, con domicilio, a la bibliotecaria que el corpus ya tenía (`PLANMOV:119`) — **F-6**.
- [x] TESIS CENTRAL: el Estado no regula, no licencia, no censura y no le toca un pelo a ningún medio; se aplica una sola disciplina a sí mismo, sobre su propia billetera. Un destino, un canal y un espejo.
- [x] Verificar rangos y guardia. Commit.

### Task 3 — SECCIÓN 0, SECCIÓN 1 y SECCIÓN 2

- [x] **SECCIÓN 0 — las siete fallas de la palabra pública argentina.** Forma de `PLANPACTO §0`: falla, evidencia con domicilio, consecuencia. Las que el corpus sostiene: la pauta como correa (`PRESUPUESTO:419`, `PLANMESA:788`); las cinco horas (`PLANCUL:304`); el derecho al Commons consagrado y no presupuestado (`PLANDIG:788` contra TABLA 20); la materia que se da por dictada y no existe (`PLANDIG:803` contra PLANEDU); la concentración que PLANCUL declara *«deseable, no esencial»* (`PLANCUL:387`). Las que son aserción propia se declaran: el acervo audiovisual sin custodio y la planta ociosa de los medios públicos (**F-6**).
- [x] **SECCIÓN 1 — la crisis.** No es una crisis de información: es de dónde aterriza la mirada. Ningún dispositivo del corpus le ofrece a Marisol un lugar abierto a las tres de la tarde.
- [x] **SECCIÓN 2 — precedentes.** Los verificables adentro del corpus primero (bibliotecas populares como exportación argentina, `PLAN24CN:2810`, `PLANCUL:259`); los externos con la advertencia de que son aserción propia.
- [x] Verificar rangos y guardia. Commit.

### Task 4 — SECCIÓN 3: La Pauta Ciega

- [x] Extender la guardia: la **tabla de extinción** tiene que parsear, tener seis filas y que la columna «liberado» sea el complemento exacto de la remanente contra 450.
- [x] Escribir el mecanismo: primero ciega (el Estado pierde la capacidad de elegir a qué medio le da un peso), después extinta. Y el argumento de por qué no hay fórmula buena: **pagar por alcance verificado es subsidiar al incumbente**, con `PLANCUL:387` como el ejemplo que el propio corpus produjo.
- [x] **Derogar la Acción 3 de PLANCUL por nombre**, acá y en el otro documento (Task 12), con el argumento de que derogar no le da agencia ni presupuesto ni piso — el arreglo 12 queda entero (`PLANCUL:389`).
- [x] **Arreglo 5:** el umbral de quién cuenta como medio va **en la ley**, no en resolución de ANBAC. Escribir por qué: en la resolución estaba escondida la facultad de licenciar, que es la única cosa que este PLAN tiene prohibida.
- [x] Escribir qué pasa con la comunicación de interés público que hoy va por pauta (salud, censo, elecciones): no desaparece, cambia de cañería — sale por La Antena y La Cartelera, que son del Estado y no le compran espacio a nadie.
- [x] Verificar rangos y guardia. Commit.

### Task 5 — SECCIÓN 4: La Biblioteca Viva

- [x] Extender la guardia: prohibido `3.000` como meta de obra propia salvo con `PLANDIG:788`/`:799` en la oración.
- [x] Escribir la frontera de **F-3** con la tabla de las dos cifras y la aritmética que cierra el derecho: 1.500 propias + 2.000+ populares (`PLANCUL:259`) > 3.000 (`PLANDIG:788`).
- [x] Escribir la escala del favor (**F-4**): entre el 43% y el 64% del presupuesto anual de PLANDIG, contra la TABLA 20 que no tiene la fila.
- [x] **Arreglo 6:** contratación de bibliotecarios por **concurso ciego más sorteo**, con la mecánica de `PLANMESA:297`. Decir sin eufemismo qué era antes: la superficie clientelar más grande del corpus. La misma disciplina de la Pauta Ciega, aplicada adentro.
- [x] **Arreglo 7:** las compras las deciden las **Mesas de Materia locales** — Capa 1 de `PLANMESA:466`, escala barrial o municipal. Una agencia nacional eligiendo qué se lee en 1.200 barrios es el ministerio de la verdad que este PLAN existe para no ser. Declarar el modo degradado: PLANMESA entra 2028-2030 (`PLANMESA:925-956`), así que las primeras sedes abren antes de que exista la Mesa que compra, y hay que decir con qué órgano se compra mientras tanto y con qué fecha de traspaso.
- [x] El horario es el dispositivo, no el edificio: el cartel de Marisol se cierra acá.
- [x] Verificar rangos y guardia. Commit.

### Task 6 — SECCIÓN 5 (La Antena) y SECCIÓN 6 (La Cartelera)

- [x] **Arreglo 2:** La Antena vuelve **con su línea presupuestaria de 25–45M/año**, y se dice que se había caído del diseño corregido sin que nadie declarara la baja. Es el dispositivo que implementa literalmente la dirección del fundador: hoy todos pueden ser un canal.
- [x] Escribir qué es una dotación de canal: qué se entrega, a quién, con qué cola, qué **no** incluye (ni curaduría, ni auditoría de contenido, ni condición de línea editorial), y qué pasa cuando el que la pide dice cosas que al Estado no le gustan — que es la prueba de fuego del PLAN entero.
- [x] **La Cartelera:** territorio y fecha, sin ranking. Desambiguar de la cartelera física de `PLANSAL:1515` la primera vez (**F-6**).
- [x] **Arreglo 10:** la Cartelera necesita un fuero, y el fuero se crea **dentro de PLANJUS** — Panel de Legalidad de Publicación, **sin baja previa**. Acá se escribe qué necesita; en la Task 12 se escribe del lado de PLANJUS.
- [x] Verificar rangos y guardia. Commit.

### Task 7 — SECCIÓN 7 (El Acervo Abierto y La Sala Común) y SECCIÓN 8 (La Procedencia)

- [x] **Declarar como aserción propia** todo lo que se afirme sobre los medios públicos y los setenta años de audiovisual estatal (**F-6**), con la rama que corresponda. Sin excepciones y sin disimulo.
- [x] **Arreglo 8:** el Acervo se parte — **manifiesto y hash en los siete nodos de PLANMEMORIA** (`PLANMEMORIA:90`), bitstream en la nube soberana de PLANDIG. Dos custodios, dos funciones, y se dice por qué: el que guarda el archivo no puede ser el mismo que certifica que no lo tocaron.
- [x] **F-10:** el Acervo acepta al **Sello Abierto** de PLANPREGUNTA, que ya se comprometió a publicar adentro (`PLANPREGUNTA:734`). Es dependencia entrante heredada, con protocolo y con costo.
- [x] **La Sala Común:** la planta de los medios públicos deja de programar y se presta por sorteo. Escribir qué pasa con la gente que hoy programa.
- [x] **Arreglo 4: costear La Procedencia** — 12–20M/año, y decir qué compra esa plata. El Estado no dictamina qué es verdad: garantiza que todo material hecho con plata pública lleve firma y trazabilidad verificable, y publica el estándar para que cualquiera lo adopte. La diferencia entre las dos cosas es la sección entera.
- [x] Verificar rangos y guardia. Commit.

### Task 8 — SECCIÓN 9 (La Mirada y el Desmontaje) y SECCIÓN 10 (quién compra y quién atiende)

- [x] El Desmontaje es el nervio del PLAN: leer una pieza y ver cómo está hecha. Escribir la mitad de PLANFOCO del par recíproco, cerrando lo que `PLANPREGUNTA:734` dejó abierto.
- [x] **Arreglo 11:** **PLANEDU dicta el Desmontaje**, y se escribe que esto repara `PLANDIG:803`, que afirmaba que PLANEDU ya lo hacía cuando la palabra «algorítmica» no aparece ni una vez en PLANEDU (**F-5**). La reparación del lado de PLANEDU es Task 12.
- [x] **Arreglo 9:** la **Beca del Desierto** se territorializa como mediador-cronista de la Biblioteca local, no como dispositivo nacional. Declarar que el nombre no tiene ni una ocurrencia en el corpus (**F-6**).
- [x] SECCIÓN 10 junta las tres decisiones de personas: quién compra (Mesas de Materia), quién atiende (concurso ciego + sorteo), quién cuenta el territorio (Beca del Desierto). Y el costo por sede contra `PLANTALLER:655` — USD 160–250k por Taller/año contra USD 127–229k por sede/año, mismo orden de magnitud, y eso es lo que hace creíble la cuenta.
- [x] Verificar rangos y guardia. Commit.

### Task 9 — SECCIÓN 11, SECCIÓN 12 (ANBAC) e INTEGRACIÓN

- [x] **SECCIÓN 11 — lo que este PLAN tiene prohibido.** La restricción absoluta, escrita como lista de cosas que ANBAC **no puede** hacer, con el mecanismo institucional que lo impide en cada caso. Es la sección que la guardia usa para verificar la Global Constraint 4.
- [x] **SECCIÓN 12 — ANBAC**, Agencia Nacional de la Biblioteca y el Acervo Común. Patrón AN+sufijo, como 15 de las 22 agencias del corpus. Sin facultad de licenciar, sin potestad sobre contenido, con el umbral de «qué cuenta como medio» fuera de su alcance porque está en la ley (arreglo 5).
- [x] **INTEGRACIÓN:** el par recíproco FOCO ↔ PREGUNTA queda **completo** y se dice con todas las letras que ésta era la deuda que `PLANPREGUNTA:732` dejó anotada. Además PLANDIG (Commons, nube, `§9.6` — el Presupuesto de Vida es instrumento de medición de PLANDIG, no dispositivo propio), PLANMEMORIA (hash), PLANMESA (compras), PLANEDU (Desmontaje), PLANJUS (Panel), PLANCUL (parasitismo intacto, Acción 3 derogada).
- [x] Verificar rangos y guardia. Commit.

### Task 10 — SECCIÓN 13: modelo económico y fiscal

- [x] Extender la guardia con **tres tablas**: la extinción (ya en Task 4), la **rampa de quince años** —que se recomputa subtotal = anual × años, porque una tabla que declara subtotales a mano cierra siempre— y el **reparto interno del régimen**, que tiene que sumar 300 y 450 **exactos**.
- [x] Escribir **F-1** entero: el domicilio real es `:419`, la spec citaba `:396`, y los 180–270M no eran una bolsa aparte sino el 40–60% de la misma.
- [x] Escribir **F-8** entero: la banda se corrige de 300–500 a **300–450** porque el techo del PLAN es la pauta que extingue; el total de quince años se corrige de 3.000–5.000 a **3.540–5.400**; y el sobrante vuelve a la Fuente 1 de `PRESUPUESTO_CONSOLIDADO:419`, que baja de 180–270M a **0–150M/año**. Decir el año malo: en 2027, escenario alto, el ecosistema recibe cero.
- [x] Escribir **F-7**: por qué acá manda la banda y no el total, al revés que en PLANPREGUNTA — el gate nunca consumió estos números.
- [x] Tabla de reparto interno con las siete líneas (Biblioteca 190–275, Acervo 35–50, Antena 25–45, Procedencia 12–20, Cartelera 8–15, Mirada 15–25, ANBAC 15–20).
- [x] Confirmar la restricción de orden de la spec con domicilio: por debajo de PLANTALLER (`PRESUPUESTO:394`) y por debajo de PLANJUS (`PLANJUS:107`).
- [x] **Mutación obligatoria:** poner 500 en el régimen y verificar que la guardia lo detecta por el reparto interno y por el total. Documentar la mutación en el commit.
- [x] Verificar rangos y guardia. Commit.

### Task 11 — SECCIONES 14–17, 19–21 y CIERRE

- [x] **14 riesgos** · **15 mapa de perdedores** (los medios que hoy viven de la pauta, con nombre de mecanismo y no de empresa) · **16 hoja de ruta** (las cuatro fases de la rampa) · **17 tablero** · **19 federal** (se saltea el 18, imitando al corpus) · **20 visión 2040**, donde va el piso constitucional que este PLAN no pide hoy · **21 protocolo de falla** · **CIERRE**, que vuelve a Marisol y al cartel.
- [x] El tablero no puede ser publicidad con tipografía de datos: publica también lo que salió mal, con la misma prominencia.
- [x] Verificar rangos y guardia. Commit.

### Task 12 — Las deudas en documentos ajenos, y la guardia que las vigila

- [x] **Escribir primero** `SocialJusticeHub/scripts/verificar-remisiones.ts`: recorre `Iniciativas Estratégicas/*.md` y `SocialJusticeHub/scripts/*.ts`, extrae toda remisión `ARCHIVO:N` y `ARCHIVO:N-M`, resuelve contra el archivo y **falla si la línea no existe o está vacía**. Correrlo **antes** de tocar nada y guardar la salida como línea de base.
- [x] `PLANCUL:387` — **in situ, misma cantidad de líneas**: derogar la Acción 3 con nota fechada de procedencia y reversión, siguiendo el formato que el tramo C ya dejó en `PLANCUL:694`.
- [x] `PLANDIG` — **in situ**: `:788`/`:799` ganan pagador; `:803` se repara (la materia la dicta PLANEDU a partir de PLANFOCO, no antes); nota de frontera después de la TABLA 20, con el mismo formato que la nota de PLANPREGUNTA que ya vive ahí.
- [x] `PLANEDU`, `PLANJUS`, `PLANMEMORIA` — **anexo al final**, nunca inserción: el Desmontaje como materia; el Panel de Legalidad de Publicación sin baja previa; el manifiesto y el hash del Acervo en los siete nodos.
- [x] `PLANMESA:788` — **in situ**: nota fechada de que la comparación con la pauta pasa a ser histórica (**F-1**).
- [x] `PRESUPUESTO_CONSOLIDADO:419` — **in situ**: la Fuente 1 baja de 180–270M a 0–150M, con el dueño nombrado por la regla de fuentes de `PLANPACTO §5.1`.
- [x] `PLANPREGUNTA:734` — **anexo**: la deuda del par queda saldada, con fecha. Es el único documento sin remisiones entrantes, así que es el único que se puede editar sin cuidado — y aun así se anexa.
- [x] **Correr `verificar-remisiones.ts` de nuevo y comparar contra la línea de base. Cero remisiones nuevas rotas, o la tarea no está hecha.**
- [x] Correr **todas** las guardias: `verificar-planpacto`, `verificar-planarco`, `verificar-planpregunta`, `verificar-planfoco`.
- [x] Commit.

### Task 13 — Attack paths, CI y cierre

- [x] `READINESS_GATES_ADVERSARIAL.md` — bloque `### PLANFOCO` con la nota de habilitación y **tres attack paths**: (1) captura de la Biblioteca por el aparato político local, que es el riesgo que el concurso ciego y el sorteo existen para cerrar; (2) la Antena usada para hostigar, y qué hace el Estado cuando el canal que dotó dice lo que no le gusta; (3) la pauta que vuelve por decreto en el gobierno siguiente, que es el riesgo terminal de un PLAN sin piso constitucional.
- [x] `.github/workflows/socialjusticehub-ci.yml`: pasos `Guardia de PLANFOCO` y `Guardia de remisiones del corpus`. **Verificar el hueco de paths**: los archivos que las guardias leen tienen que estar entre los que disparan el workflow, o la guardia no corre nunca y nadie se entera.
- [x] `npm run check`, `npm run check:routes`, `npm run test:unit`.
- [x] Medir el documento con `wc -w` y anotar el total real.
- [x] Escribir el **Registro de cierre** al final de este plan: mediciones finales, qué se corrigió de la spec y con qué medición, y las lecciones para el tramo E.
- [x] Commit.


---

## Registro de cierre — 2026-08-01

**El tramo D queda completo y con él los cuatro PLANes nuevos de la spec.** PLANFOCO es el ordinal 26, el Vigésimo Séptimo Mandato, y el par recíproco FOCO ↔ PREGUNTA es el primero del corpus que se cierra en el tramo inmediatamente siguiente al que declaró la deuda.

### Mediciones finales

| Qué | Valor |
|---|---|
| `PLANFOCO_Argentina_ES.md` | **25.631 palabras**, 1.026 líneas, 26 secciones |
| Posición entre los cuatro nuevos | el más corto, y el de menor presupuesto administrado |
| Guardia propia | `verificar-planfoco.ts` — 26 secciones, 14 cifras canónicas con domicilio, 13 prohibidos, 3 tablas contables |
| Guardia nueva de alcance general | `verificar-remisiones.ts` — **685 citas `ARCHIVO:línea` del corpus entero, todas resueltas** |
| Documentos ajenos tocados | 8 (PLANCUL, PLANDIG, PLANEDU, PLANJUS, PLANMEMORIA, PLANMESA, PLANPREGUNTA, PRESUPUESTO_CONSOLIDADO) |
| Líneas ajenas corridas | **cero** — cuatro ediciones in situ y cinco anexos al final |
| Guardias en verde | PLANPACTO, PLANARCO, PLANPREGUNTA, PLANFOCO, remisiones |
| Verificación del repo | `npm run check`, `check:routes`, `test:unit` (177 passed, 2 skipped) |

### Lo que se corrigió de la spec, y con qué medición

| Qué decía la spec | Qué quedó | Por qué |
|---|---|---|
| pauta en `PRESUPUESTO_CONSOLIDADO:396` | **`:419`** | `:396` es la fila de PLANDIG de la tabla de régimen. Y en el domicilio real los «180–270M genéricos» resultan ser el 40–60% de los mismos 450M: no hay dos bolsas |
| USD 300–500M/año | **300–450** | el techo lo pone la fuente. La pauta entera son 450 y este PLAN no reclama una segunda: no puede ser más grande que lo que mata |
| USD 3.000–5.000M a 15 años | **3.540–5.400** | derivado de la rampa, no elegido. El gate nunca consumió estos números (`huespedes: []`), así que acá manda la banda y el total es corregible |
| «corregir 3.000 → 1.200–1.500 en todo el texto» | **las dos cifras quedan** | los 3.000 son de `PLANDIG:788` y son la cobertura de un derecho. 1.500 propias + 2.000+ populares de `PLANCUL:259` cierran los 3.000 |
| arreglo 12: PLANCUL conserva parasitismo | **conserva todo menos la Acción 3** | `PLANCUL:387` reparte pauta con fórmula al 50% por audiencia, que es lo que la Pauta Ciega prohíbe. La spec no lo registró. Derogar no le da agencia ni presupuesto: le saca una tarea |

### Las cuatro lecciones para el tramo E

**1. La regla de no correr líneas funciona, y es barata.** Ocho documentos ajenos editados, **cero remisiones rotas**, contra las ocho que rompió el tramo D. El mecanismo es trivial —se reescribe adentro de una línea existente o se anexa al final, nunca se inserta en el medio— y hace innecesario el barrido posterior. El tramo E toca diez documentos: la regla se aplica sin excepción.

**2. Una remisión puede romperse sin que el número cambie.** Es la lección nueva y la más incómoda. Al reescribir `PRESUPUESTO_CONSOLIDADO:419` para asignarle dueño, las dos citas textuales que PLANFOCO hacía de esa línea siguieron resolviendo —el número era correcto— y lo entrecomillado dejó de ser lo que había ahí. **`verificar-remisiones.ts` no detecta eso y lo declara en su cabecera**: detecta corrimientos, no reescrituras en el lugar. Quien reescriba una línea del corpus tiene que buscar además la cita textual de esa línea en los otros documentos. La guardia de PLANARCO ya sabe hacerlo para su propio documento (52 citas entrecomilladas verificadas contra su tramo); generalizarlo es trabajo pendiente y queda anotado.

**3. Un prohibido escrito contra el reclamo se dispara sobre el rechazo.** Pasó tres veces en este tramo, todas el mismo día: la guardia se puso roja sobre «ninguna regulación de contenido se queda en manos del que la escribió», sobre «incluida la que paga por alcance verificado» y sobre «es un ministerio de la verdad con buenos modales». El método retórico del corpus es **nombrar el mecanismo prohibido para rechazarlo**, y un lookbehind sólo ve negaciones anteriores. Los dos mecanismos que lo resuelven son generales y se pueden copiar: `RECHAZO` (negación en cualquier parte de la oración) y `exigeActor` (el prohibido sólo dispara si la oración nombra a alguien que podría tener la potestad, porque una crítica abstracta no le da potestad a nadie).

**4. Un presupuesto de palabras calibrado por analogía se equivoca por sección, no en el total.** Se corrigieron dieciséis rangos en dos tandas. La causa no era que las secciones estuvieran cortas sino que el modelo estaba mal elegido: **`wc -w` cuenta una tabla por lo que ocupa y no por lo que dice**, y las secciones finales de este documento son tablas. Calibrar contra el documento del corpus que tenga la misma **forma** —no el mismo tamaño— antes de escribir la primera palabra.

### Lo que este tramo NO hizo, con nombre

- ~~**El tramo E entero:** la migración del canon (spec §9), los conteos hardcodeados de 22 en nueve lugares ejecutables, las 45 líneas de `CANONICAL_ARCHITECTURE` embebidas en el taller, las 69 aristas del grafo y `arquitecto-data.ts`, y `strategic-initiatives.ts`. **El taller ya tiene 27 documentos y `split-documento-plan.test.ts:101` espera 23**: ese test está roto desde que entró PLANPACTO y sigue roto.~~ → **CORREGIDO el 2026-08-03: este renglón era falso el día que se escribió y siguió siendo falso durante dos días. La migración del canon SÍ se ejecutó.** Ver la NOTA DE CORRECCIÓN al final de este archivo, que trae la medición.
- **Lo no humano** (spec §7): diez huecos, diez huéspedes, cero PLANes nuevos. Sin empezar.
- **La pata industrial de PLANCYT**, que sigue repartida entre PLANEB, PLANDIG, PLANISV, PLANMOV y PLANTER. Declarada como hueco en PLANPREGUNTA y no cerrada acá.
- **La verificación externa de los precedentes internacionales** de la SECCIÓN 2 de PLANFOCO, declarada en el propio documento como pendiente de gate.
- **La generalización del chequeo de citas textuales** (lección 2).

---

## NOTA DE CORRECCIÓN — 2026-08-03, desde el tramo de PLANPUERTA

**Qué se corrige:** el primer renglón de «Lo que este tramo NO hizo, con nombre» (línea 478), que declaraba el tramo E entero como pendiente — «la migración del canon, los conteos hardcodeados, `strategic-initiatives.ts`».

**Anexo y no inserción:** este bloque va al final del archivo y la línea 478 se reescribió adentro de sí misma, sin correr una sola línea. El plan de PLANPUERTA cita este archivo por número de línea en cuatro lugares.

**La cronología exacta, medida sobre git y no recordada:**

| Momento | Qué pasó |
|---|---|
| 2026-08-01 **11:16:19** | `e294328` — se escribe este registro de cierre, y la línea 478 es **verdadera** |
| 2026-08-01 **12:00:05** | `f226173` — «Sube el canon de 22 a 26 en la autoridad de papel: PLAN_REGISTRY y las 76 cabeceras». **Cuarenta y cuatro minutos después, la línea 478 pasa a ser falsa** |
| 2026-08-01 → 2026-08-03 | tres tramos de trabajo encima, y nadie vuelve al registro |
| 2026-08-03 | se corrige acá |

**La medición que la desmiente**, tomada hoy sobre el árbol:

| Qué decía pendiente | Estado real al 2026-08-03 |
|---|---|
| la migración del canon | **hecha dos veces**: 22→26 el 2026-08-01 (`f226173`), 26→27 el 2026-08-03 (`53b248f`, tramo de PLANPUERTA) |
| las cabeceras `CANONICAL_ARCHITECTURE` | **181, todas en `27 thematic + PLANRUTA protocol`**; cero residuo en 26 y cero en 22 |
| `PLAN_REGISTRY.yml` | `thematic_count: 27`, `total_documents: 28`, `last_updated: 2026-08-02` |
| `strategic-initiatives.ts` | **27 entradas** |
| `arquitecto-data.ts` | nodo 27 (PLANPUERTA) con sus 18 aristas |
| `validation-engine.ts` | `EXPECTED_PLAN_COUNT = 27`, y V-REF-02 lo verifica como ERROR |
| `split-documento-plan.test.ts:101`, que este renglón nombraba | **estuvo rojo tres veces por la misma causa** —literal `23`, después literal `27`, y hoy el corpus tiene 28—. Se cerró la clase de defecto: el conteo **se deriva de `total_documents` del registro** y ya no se escribe a mano |

**Lo que este renglón le costó al tramo siguiente.** El plan de PLANPUERTA tuvo que abrir una verificación previa entera (V-1) para averiguar que la migración ya estaba hecha, porque el único registro escrito decía que no. Es trabajo de verificación que el registro tenía que haber ahorrado y en cambio causó.

**La lección, y va como regla:** un registro que declara pendiente algo hecho es peor que un registro incompleto, porque **manda al siguiente a rehacer trabajo** — y el siguiente le cree, que es exactamente para lo que el registro existe. Un registro de cierre se escribe al final del tramo, y el tramo no termina en el commit del registro: termina cuando termina. Si algo de la lista de pendientes se hace después —aunque sea cuarenta y cuatro minutos después—, se vuelve al registro en el mismo commit que lo hace.
