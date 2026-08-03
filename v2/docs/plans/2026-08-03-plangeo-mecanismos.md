# PLANGEO — Mecanismos: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar a `PLANGEO_Argentina_ES.md` el bloque MECANISMOS (S26–S28) y las diez ediciones forzadas que la spec declara, sin escribir un solo hecho externo sin fuente primaria y sin romper las remisiones ajenas que las ediciones mueven.

**Architecture:** Este plan **no arranca por la guardia** — arranca por la investigación. La spec §11 declara diez hechos que sostienen el bloque y que provienen de conocimiento del modelo, no de fuente consultada; dos de ellos (V6, V7) pueden invalidar la SECCIÓN 27 entera. Escribir prosa antes de saber si el mecanismo existe es construir sobre una afirmación. La Task 1 los verifica y produce un ledger; la Task 2 recién ahí crea la guardia sobre el documento actual; de la Task 3 en adelante rige el ciclo del repositorio — la guardia se pone en rojo con la expectativa nueva, se escribe la prosa, la guardia queda en verde, se commitea.

**Tech Stack:** Markdown (el documento), TypeScript + `tsx` (la guardia), GitHub Actions (CI). Sin dependencias nuevas. La Task 1 necesita acceso a web (`WebSearch` / `WebFetch`).

**Spec:** `v2/docs/specs/2026-08-03-plangeo-mecanismos.md` — leerla entera antes de la Task 1, con atención especial a §2 (las cuatro condiciones de admisión), §4 (la restricción de tranche) y §6.bis (las anclas de remisión).

---

## Global Constraints

- **Idioma:** español rioplatense, voseo. Es la voz del documento existente: leer el PREÁMBULO, la S2 y la S21 antes de escribir una línea. PLANGEO tiene un registro más frío y más diplomático que PLANSUS o PLANARCO — es un documento de cancillería, no un manifiesto. **Respetarlo.** El bloque nuevo es el más «astuto» del documento y ese es justamente el riesgo §8.6 de la spec: si se escribe con épica de espionaje, contradice al proyecto. Registro de ingeniería institucional — mecanismos, costos, compuertas.
- **`¡BASTA!` siempre con signos de exclamación.**
- **Cero cifras inventadas.** Toda cifra nueva va con su fuente en la misma oración. Si no hay fuente, se escribe como rango declarado incierto o no se escribe. Es la lección de D-015, y en este bloque es más severa que de costumbre porque casi todo el material es fáctico y externo.
- **Nada de universales negativos** —«ninguno», «nadie», «ningún país», «única en el mundo»— salvo que se puedan defender con fuente citada en la misma oración. **Este bloque está lleno de ellos por naturaleza** («la única agencia binacional de salvaguardias del mundo», «el único caso de dos rivales que se desarmaron verificándose»). Cada uno se sostiene con cita o se degrada a una formulación acotada del tipo «no se conoce otro caso de».
- **PLANGEO no reclama piso presupuestario y no lo va a reclamar.** El bloque reasigna la línea naval de S18.1; no agrega dinero. `budget_class` sigue en `XS`.
- **La restricción de tranche es vinculante.** Siete mecanismos son públicos; el Registro de Presión (S27.5) se escribe completo **con compuerta declarada de tranche-3**. La compuerta va en el cuerpo de la sub-sección, no en una nota al pie.
- **Toda edición por script va con `assert` de presencia y unicidad.** Un `str.replace()` que no matcheó sale en verde. Ya pasó en este repositorio.
- **Ruta de commit explícita** en cada `git add`. Hay sesiones concurrentes (deuda D-010); un `git add -A` se lleva trabajo ajeno.
- **Las ediciones forzadas se aplican de abajo hacia arriba** (S24 → S22 → S20 → S19 → S18 → S17 → S11 → S5). Cada inserción corre las líneas de todo lo que está debajo; trabajando al revés, los números de la siguiente edición siguen siendo válidos mientras se trabaja.

---

## Mapa de archivos

| Archivo | Responsabilidad | Tareas |
|---|---|---|
| `v2/docs/specs/2026-08-03-plangeo-mecanismos.md` | La spec. Se **corrige** en la Task 1 con lo que la verificación devuelva | 1 |
| `Iniciativas Estratégicas/PLANGEO_Argentina_ES.md` | El documento. Única fuente de verdad del contenido | 3–7 |
| `SocialJusticeHub/scripts/verificar-plangeo.ts` | Guardia mecánica: secciones, epígrafes, correlatividad, cifras con domicilio, prohibidos, compuerta de tranche | 2–7, 9 |
| `.github/workflows/socialjusticehub-ci.yml` | Enganche de la guardia en CI | 2 |
| `SocialJusticeHub/scripts/verificar-planpuerta.ts` | **Guardia ajena.** Lleva anclas `PLANGEO:425` y `PLANGEO:1148-1149` | 8 |
| `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md` | Documento ajeno con anclas a PLANGEO | 8 |
| `v2/docs/specs/2026-08-02-planpuerta.md`, `v2/docs/plans/2026-08-02-planpuerta.md` | Spec y plan ajenos con anclas a PLANGEO | 8 |
| `SocialJusticeHub/shared/arquitecto-data.ts` | Aristas del grafo + ancla `PLANGEO:207` en `d200` | 8 |
| `Iniciativas Estratégicas/DEPENDENCY_GRAPH.yml` | Grafo canónico | 8 |
| `Iniciativas Estratégicas/PLAN_REGISTRY.yml` | `version` y `last_updated` de PLANGEO | 9 |
| `SocialJusticeHub/client/public/docs/PLANGEO_Argentina_ES.md` | Copia servida al front (la sincroniza `sync-docs-publicos.ts`) | 9 |
| `docs/DEUDAS.md` | Registro de deficiencias | 9 |

---

## Task 1: Las diez verificaciones — y la decisión sobre la S27

**Esta tarea puede matar una sección entera y hay que dejarla que lo haga.** No se escribe una línea de PLANGEO hasta que esté cerrada.

**Files:**
- Create: `v2/docs/specs/2026-08-03-plangeo-verificaciones.md` (el ledger)
- Modify: `v2/docs/specs/2026-08-03-plangeo-mecanismos.md` (correcciones que salgan de la verificación)

**Interfaces:**
- Produces: un ledger con una fila por afirmación — `id | afirmación | veredicto | fuente primaria | cómo se escribe en el documento`. Las tareas 3 a 7 **solo pueden escribir hechos que estén en el ledger con veredicto verde**.

- [ ] **Step 1: V6 y V7 primero, y solos**

Son las dos que pueden invalidar la S27 completa. Se resuelven antes que las otras ocho para no gastar trabajo en un bloque que no va.

- **V6 — SAOCOM.** ¿El SAR en banda L de la constelación resuelve embarcaciones pesqueras a escala útil, sobre la ZEE argentina, con la cadencia de revisita que tiene hoy? Fuente: CONAE. **Si la respuesta es que no**, S27.1 no puede apoyarse en SAOCOM y hay que decidir entre (a) apoyarse en AIS + drones + datos de terceros y bajar la ambición, o (b) retirar S27 del bloque. La decisión sube al autor; no la toma el agente.
- **V7 — la capa aseguradora.** ¿Qué proporción del tonelaje pesquero de altura cubre el International Group of P&I Clubs, y hay evidencia de que las mesas de suscripción usen datos de monitoreo satelital abierto en su análisis de riesgo? **Si no hay evidencia de la práctica**, S27.3 pasa de mecanismo a hipótesis y hay que escribirlo como tal, con esa palabra.

- [ ] **Step 2: V1 — ABACC, que es de donde cuelga toda la S28 superior**

Acuerdo de Guadalajara (1991); memorias anuales de ABACC; documentación del OIEA. Tres cosas a acreditar por separado, porque el documento las va a afirmar por separado: que existe y funciona de manera continua; que es binacional en el sentido fuerte (inspección mutua, no solo contabilidad compartida); y **si es defendible la afirmación de unicidad**. Si la unicidad no se puede sostener con fuente, se degrada a una formulación acotada — la spec ya avisa que este bloque vive de universales negativos y que hay que domarlos uno por uno.

- [ ] **Step 3: V2 a V5, V8 a V10**

| | Qué cerrar | Nota |
|---|---|---|
| V2 | Resolución 69/319 de la AGNU: número, año, resultado de la votación, carácter no vinculante | **La cifra 136-6 no se escribe sin acta oficial.** Va el acta o va sin número |
| V3 | NY Judiciary Law §489 y el resultado efectivo en el litigio de los holdouts | Chequear contra PLANMON, que es el único documento del corpus que ya nombra `holdout` |
| V4 | Leyes anti-buitre de Bélgica y Reino Unido, y su límite jurisdiccional | El límite jurisdiccional es el argumento de S26.2, no un detalle |
| V5 | INVAP: exportaciones de reactores de investigación y a qué países | **Primero leer cómo lo caracterizan PLANEN, PLAN24CN, PLANMESA y PLANMEMORIA.** Si el corpus ya lo dice, se reusa esa formulación en vez de generar una nueva |
| V8 | Protocolo de Madrid revisable desde 2048; presencia argentina continua desde 1904 | **PLANGEO ya afirma las dos en S1:107 y S5:469. Verificar el documento contra sí mismo antes que contra el mundo** |
| V9 | Saqueo pesquero del Atlántico Sur | **PLANTER ya las trae con fuente. Usar esas. No generar cifras nuevas** |
| V10 | Dependencia argentina de principios activos farmacéuticos importados | PLANSAL y PLANSUS ya tocan producción local: partir de ahí |

- [ ] **Step 4: Aplicar a la spec lo que la verificación cambió**

Toda afirmación que no sobrevivió se corrige **en la spec**, no solo en el ledger — si no, la spec queda mintiendo y la próxima sesión la lee como buena. Si cayó V6 o V7, se reescribe la S27 de la spec antes de seguir.

**Verify:** el ledger tiene diez filas, ninguna vacía, y cada veredicto verde tiene URL o cita bibliográfica. Ninguna fila dice «conocimiento general».

**Commit:** `Add ledger de verificación de PLANGEO mecanismos — diez hechos contra fuente primaria`

---

## Task 2: La guardia, en verde sobre el documento actual

Antes de tocar una coma del documento. Si la guardia no puede describir el PLANGEO que ya existe, no sirve para custodiar el que viene.

**Files:**
- Create: `SocialJusticeHub/scripts/verificar-plangeo.ts`
- Modify: `.github/workflows/socialjusticehub-ci.yml`

**Interfaces:**
- Produces: `SECCIONES_ESPERADAS: string[]`, `CIFRAS_CANONICAS: {cifra, domicilio}[]`, `PROHIBIDOS: {patron, excepcion?}[]`, `ANCLAS_AJENAS: {ancla, contenidoEsperado}[]` — exportados. Las tareas 3 a 8 los consumen agregando entradas.

- [ ] **Step 1: La guardia con las 25 cabeceras H2 actuales**

Modelarla sobre `verificar-plansus.ts` (304 líneas, es la más chica y la más legible de las seis existentes). Hereda la doctrina que ya está escrita en la cabecera de esas guardias: default seguro con opt-out explícito verificado en las dos direcciones; un chequeo que no encuentra ninguna ocurrencia válida es un **error**, no un pase; si el ancla no es única, el chequeo no corre y lo dice; patrón y excepción miden la misma unidad.

- [ ] **Step 2: Lo propio de esta guardia**

Cuatro chequeos que las otras no tienen:

1. **Anclas ajenas.** `PLANGEO:207`, `:223`, `:425`, `:1148-1149`, `:1151` — la guardia verifica que la línea citada siga conteniendo lo que el citador dice que contiene. Es la única guardia del repositorio que se mira desde afuera, y existe porque siete de las diez ediciones forzadas corren dos de esas anclas.
2. **Ausencia de piso.** PLANGEO no reclama piso presupuestario. El chequeo es **afirmativo por la negativa**: falla si aparece un patrón de reclamo de piso en el documento.
3. **La compuerta de tranche del Registro de Presión.** S27.5 tiene que contener la palabra que declara la compuerta. Si alguien la borra, el documento pasa a proponer material confrontacional público sin condición, contra la corrección 13.B de su propia cabecera.
4. **S18.2.4 no vuelve.** La «capacidad ofensiva disuasoria» se elimina en la E2. El prohibido evita que reaparezca por un merge.

- [ ] **Step 3: Engancharla en CI**

Debajo de la guardia de PLANSUS, antes de la de remisiones. Anotar en el YAML —como hacen las otras— qué archivos lee y si eso abre hueco de `paths`. Lee el documento (`Iniciativas Estratégicas/**`) y el canon de pisos (`SocialJusticeHub/**`): los dos ya disparan el workflow, sin hueco.

**Verify:** `npx tsx scripts/verificar-plangeo.ts` en verde sobre el documento **sin modificar**. Si sale en rojo acá, el chequeo está mal escrito, no el documento.

**Commit:** `Add la guardia de PLANGEO — verde sobre el documento actual`

---

## Task 3: SECCIÓN 26 — El contrato como defensa

**Files:**
- Modify: `Iniciativas Estratégicas/PLANGEO_Argentina_ES.md`, `SocialJusticeHub/scripts/verificar-plangeo.ts`

- [ ] **Step 1: Rojo primero.** Agregar `SECCIÓN 26: EL CONTRATO COMO DEFENSA` a `SECCIONES_ESPERADAS` y las subsecciones 26.1–26.8 al chequeo de correlatividad. Agregar además el chequeo del **test de tres condiciones** de la 26.8: si el Horizonte queda en el documento sin sus tres condiciones enunciadas, la guardia falla. Correr la guardia y verla fallar.

- [ ] **Step 2: Escribir la sección.** Se inserta **después de la S25 y antes del bloque `INTEGRACIÓN CON EL MARCO ¡BASTA!`**. Epígrafe: *«Un acuerdo bien escrito es un ejército que no come.»*

Contenido, según spec §5:

- **26.1 El problema de la jurisdicción.** El caso testigo y por qué se perdió: la doctrina de *champerty* exige acreditar la intención de un tercero, que es inverificable por construcción. **El punto no es que la estrategia fue mala — es que el terreno tenía un hecho decisivo imposible de probar.** Esa formulación es la bisagra de toda la sección; si se escribe como lamento, la sección pierde el argumento.
- **26.2 La Cláusula del Buitre.** Texto tipo para prospecto. Explicitar los dos límites: **no prohíbe el mercado secundario y no toca al tenedor de buena fe** — a quien compró a la par se le paga la par. Lo que elimina es la asimetría, no al actor. Y la ventaja sobre Bélgica y Reino Unido (V4): esas son leyes de una jurisdicción y se esquivan litigando en otra; la cláusula viaja con el instrumento.
- **26.3 La conversión automática de jurisdicción.** La cautelar que el litigante necesita es la que destruye el foro donde puede cobrarla. Costo cero en tiempos normales.
- **26.4 La Cláusula Espejo.** Texto tipo. **Escribir el riesgo en la misma sub-sección, no en la S22** — riesgo §8.2 de la spec: puede leerse como riesgo expropiatorio. Las cuatro mitigaciones de diseño (simetría, publicidad, no discriminación por país, activación solo ante sanción estatal) van en el cuerpo.
- **26.5 Lo que sigue vivo de 2015.** La Resolución 69/319 según el ledger V2. **Si el acta no se consiguió, va sin cifra de votación.**
- **26.6 Costo declarado.** La sobretasa **no se inventa**. Va como tarea de la Pre-Fase con el precedente de PLANSUS citado.
- **26.7 El Compromiso de Horizonte.** La pieza que sostiene a las otras siete. **Precondición: leer PLANMESA y nombrar su mecanismo popular de decisión con el nombre que tenga ahí** — la condición (c) de la 26.8 depende de que ese mecanismo exista, y si PLANMESA no lo provee, spec §7 dice que el Horizonte **no se escribe**. Verificarlo antes de redactar, no después. El vehículo jurídico concreto queda declarado como abierto (spec §10): se describe el efecto y se dice que la figura es pregunta para Cancillería. **No inventar un instrumento.**
- **26.8 El límite del Horizonte.** Las tres condiciones —preserva opciones y no impone políticas; es recíproco; pasó por el mecanismo popular— enunciadas como test, cada una verificable por separado, más la lista de lo que queda afuera por aplicarlas. **Esta sub-sección debilita la propuesta y va igual, en el cuerpo y no en un anexo.** Escribir la objeción democrática con su mejor forma, no con una versión de paja: un mecanismo que ata a los gobiernos que vienen es lo que hace un tecnócrata para escapar del control democrático, y este es el PLAN de un proyecto cuya premisa es que la gente gobierna. La tensión se acota, no se resuelve, y así se escribe.

- [ ] **Step 3: Verde.** Guardia en verde. Releer en voz alta contra el registro de la S17, que es la sección tonalmente más cercana.

**Commit:** `Add la SECCIÓN 26 de PLANGEO — el contrato como defensa`

---

## Task 4: SECCIÓN 27 — La visibilidad como poder

**Precondición:** el ledger cerró V6 y V7. Si alguno quedó en rojo, esta tarea no arranca — vuelve al autor.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANGEO_Argentina_ES.md`, `SocialJusticeHub/scripts/verificar-plangeo.ts`

- [ ] **Step 1: Rojo primero.** `SECCIÓN 27: LA VISIBILIDAD COMO PODER` + subsecciones 27.1–27.6. Agregar además el chequeo de la compuerta de tranche.

- [ ] **Step 2: Escribir la sección.** Epígrafe: *«No hay que perseguirlos. Hay que hacer que sean vistos.»*

- **27.1 El Mar Transparente.** **Abre con la remisión explícita a S19.3.2 y S19.3.4** — el lector tiene que saber en la primera oración que esto extiende algo que ya está, no que lo reemplaza. Las tres piezas. Cifras de saqueo: las de PLANTER (V9), citadas como de PLANTER.
- **27.2 El certificado que se regala.** Gratis, automático, sin trámite. El que lo rechaza se declara solo. Argentina no acusa a nadie.
- **27.3 La capa que aplica el castigo.** Según V7. **Si V7 volvió sin evidencia de la práctica de suscripción, esta sub-sección se escribe como hipótesis y usa esa palabra.** Es la pieza más elegante del bloque y la más frágil, y la spec ya lo dice en §8.3.
- **27.4 Reemplazo de la línea naval.** La consecuencia presupuestaria sobre S18.1. El rango de reasignación va declarado como pendiente si no hay estimación.
- **27.5 El Registro de Presión.** **Con la compuerta de tranche-3 en el cuerpo.** El texto de la obligación, la tenaza sin salida, y —lo que no se puede omitir porque es el argumento— **el valor interno: le saca al funcionario el peso de tener que ser valiente.** Deja de ser una decisión de coraje y pasa a ser un trámite cuya omisión es falta grave.
- **27.6 El commons antártico.** Remisión a S5 y S20.1.1. S5:475 ya dice que cada dataset compartido «cuenta en 2048» y nunca dice dónde vive: **esa es la frase que esta sub-sección completa**, y conviene citarla. Datos de V8 verificados contra el propio documento.

- [ ] **Step 3: Verde.**

**Commit:** `Add la SECCIÓN 27 de PLANGEO — la visibilidad como poder`

---

## Task 5: SECCIÓN 28 — La capacidad que ya existe

**Files:**
- Modify: `Iniciativas Estratégicas/PLANGEO_Argentina_ES.md`, `SocialJusticeHub/scripts/verificar-plangeo.ts`

- [ ] **Step 1: Rojo primero.** `SECCIÓN 28: LA CAPACIDAD QUE YA EXISTE` + subsecciones 28.1–28.6.

- [ ] **Step 2: Escribir la sección.** Epígrafe: *«No hay que construirlas. Hay que darse cuenta de que están.»*

- **28.1 ABACC**, según V1, con la unicidad en la formulación que el ledger habilite y no más fuerte.
- **28.2 El Protocolo ABACC como producto.** Enganche con S16 y S21.7.
- **28.3 El anexo de exportación.** El argumento central en una línea: **no se castiga al proveedor que hace el trabajo del régimen mejor que el estándar.** INVAP entra a PLANGEO por primera vez (V5) — usar la caracterización que ya tienen los otros PLANes.
- **28.4 La Ley del Segundo Proveedor.** Remisión a S18.2.3. **El umbral va como parámetro a fijar, no como número** — el 60% de la ideación no tiene respaldo y la spec §10 ya lo marca. Los tres efectos, en orden: el segundo lugar garantizado, el ahorro que paga la redundancia, y el que más importa — no se pueden operar dos stacks sin gente propia que entienda, así que la regla reconstruye capacidad técnica estatal.
- **28.5 Insumos críticos.** Las tres capas y las Reservas Estratégicas Cruzadas. Cifras según V10, apoyadas en PLANSAL/PLANSUS.
- **28.6 La Doctrina del Erizo.** Se escribe acá; la eliminación de S18.2.4 es la E2 de la Task 6. **No hay que ser peligroso: hay que ser poco rentable de atacar.** Enganche con el Kit de Despliegue de Crisis de PLANRUTA.

- [ ] **Step 3: Verde.**

**Commit:** `Add la SECCIÓN 28 de PLANGEO — la capacidad que ya existe`

---

## Task 6: Las diez ediciones forzadas, de abajo hacia arriba

**Files:**
- Modify: `Iniciativas Estratégicas/PLANGEO_Argentina_ES.md`, `SocialJusticeHub/scripts/verificar-plangeo.ts`

El orden es **E9 → E10 → E8 → E7 → E6 → E2 → E1 → E3 → E4 → E5**, de la línea más alta a la más baja. Cada `assert` de presencia y unicidad antes de tocar.

- [ ] **Step 1: E9 — S24.1** (~1383). Filas nuevas en la tabla de servicio a cada PLAN: PLANMON (jurisdicción de deuda), PLANSEG (armas — **como remisión a que el tema es de PLANSEG, no que PLANGEO lo resuelva**), PLANTER (mar), PLANMESA (el mecanismo popular que habilita el Horizonte).
- [ ] **Step 2: E10 — S22.3** (~1310). El Horizonte como **complemento** del blindaje constitucional, con remisión a S26.7 y S26.8. **No como reemplazo** — S22.3 hoy propone constitucionalizar y esa vía sigue siendo válida para lo que se hace adentro; el Horizonte cubre lo que solo rinde a veinte años. Si queda escrito como sustituto, el documento se contradice consigo mismo a cuatro secciones de distancia.
- [ ] **Step 3: E8 — S22.2** (~1298). Cláusula Espejo y Cláusula del Buitre al bloque de pre-sanción. El protocolo actual es enteramente reactivo salvo por el colchón financiero.
- [ ] **Step 4: E7 — S20.1.1** (~1120). Remisión a S27.6. *(El bloque 2048 de S5 se hace en el Step 10, por estar más arriba.)*
- [ ] **Step 5: E6 — S19.3.2 y S19.3.4** (~1090-1110). Remisión a S27.1-27.3, para que nadie lea el monitoreo y el sello como el mecanismo completo.
- [ ] **Step 6: E2 — S18.2.4** (~1050). **Reescritura completa**, la edición más delicada del plan. Sale «capacidad ofensiva disuasoria»; entra la Doctrina del Erizo con remisión a S28.6. Escribir el porqué sin denigrar el documento: la escalada cibernética ofensiva contra un actor capaz de atacar en serio no es una pelea que Argentina gane, y prometerla debilita al resto de la sección. Agregar el prohibido a la guardia.
- [ ] **Step 7: E1 — S18.1** (~1010). Reasignar la línea naval de USD 500-800M hacia constelación + enjambre, con remisión a S27.4. **Reasignar, no sumar** — el total de la TABLA 14 de S23.1 no cambia; verificar que siga cerrando.
- [ ] **Step 8: E3 — S17.4** (~990). Jurisdicción de la deuda en la fase de convivencia, con remisión a S26.
- [ ] **Step 9: E4 y E5 — S11** (~700-737). Fila de calificadoras de la TABLA 11 con la Cláusula del Buitre junto al ISN; y el Protocolo Anti-Cascada de S11.2 con los mecanismos que se activan sin decisión humana — **que es el punto entero: la cascada es justo el momento en que un funcionario bajo presión cede.**
- [ ] **Step 10: E7-bis — el bloque 2048 de S5** (~469). Remisión a S27.6.

**Verify:** guardia en verde; `npx tsx scripts/verificar-remisiones.ts` **va a fallar acá** y está bien — lo arregla la Task 8. Anotar el fallo, no taparlo.

**Commit:** `Fix las diez ediciones forzadas de PLANGEO — de abajo hacia arriba`

---

## Task 7: Cabecera, numeración y la nota editorial

**Files:**
- Modify: `Iniciativas Estratégicas/PLANGEO_Argentina_ES.md`

- [ ] **Step 1:** Cabecera a **v1.2**, conteo de secciones 25 → 28, y el bloque de portada ASCII con las tres líneas temáticas nuevas.
- [ ] **Step 2:** La nota al pie de la S25 que declara el costo editorial de la decisión de numeración: la Visión 2040 debería cerrar el documento y no lo hace, porque renumerar cuatro secciones rompe remisiones ajenas. **Se escribe, no se disimula.**

**Commit:** `Fix la cabecera de PLANGEO a v1.2 — 28 secciones`

---

## Task 8: Las anclas ajenas y la integración con el corpus

Esta es la tarea que la spec §6.bis existe para forzar. Siete de las diez ediciones corrieron `PLANGEO:1148-1149` y `PLANGEO:1151`.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`, `SocialJusticeHub/scripts/verificar-planpuerta.ts`, `v2/docs/specs/2026-08-02-planpuerta.md`, `v2/docs/plans/2026-08-02-planpuerta.md`, `SocialJusticeHub/shared/arquitecto-data.ts`, `Iniciativas Estratégicas/DEPENDENCY_GRAPH.yml`

- [ ] **Step 1: Recalcular las anclas.** Buscar el contenido —no el número— en el PLANGEO nuevo: la adopción municipal de la Red Soberana (S21.1) y el «Por qué es poderosa». Actualizar los cuatro archivos que las llevan. **`verificar-planpuerta.ts` es una guardia ajena: si queda desactualizada, rompe el CI de otro PLAN.**
- [ ] **Step 2: Confirmar que `:207`, `:223` y `:425` no se movieron.** Deberían estar intactas — toda edición cayó por debajo de 425. Confirmarlo, no asumirlo.
- [ ] **Step 3: `verificar-remisiones.ts` en verde.** Es la red que ya existe; acá es donde se cobra.
- [ ] **Step 4: Las aristas del grafo.** Aristas nuevas en `arquitecto-data.ts` y `DEPENDENCY_GRAPH.yml` según spec §7: PLANMON (jurisdicción de deuda), PLANTER (el mar), PLANRUTA (modo degradado), PLANDIG (commons antártico y regla de compras), PLANSAL/PLANSUS (reserva de esenciales). Usar `kind: 'requires' | 'provides'` como el resto del archivo. **`DEPENDENCY_GRAPH.yml:159-164` dice hoy `provides_to: [análisis interno]`** — eso deja de ser cierto con este bloque y hay que actualizarlo.

**Verify:** `npm run check`, `npx tsx scripts/verificar-remisiones.ts`, `npx tsx scripts/verificar-planpuerta.ts`, `npx tsx scripts/verificar-plangeo.ts` — los cuatro en verde.

**Commit:** `Fix las anclas de remisión a PLANGEO y las aristas del grafo`

---

## Task 9: Verificación final, registro y deudas

**Files:**
- Modify: `Iniciativas Estratégicas/PLAN_REGISTRY.yml`, `SocialJusticeHub/client/public/docs/PLANGEO_Argentina_ES.md`, `docs/DEUDAS.md`

- [ ] **Step 1:** `PLAN_REGISTRY.yml` con `version` y `last_updated` nuevos. **`budget_class` sigue en `XS` y `phase` sigue en `research-only`.** Si alguna de las dos cambió, algo se salió del diseño.
- [ ] **Step 2:** `npx tsx scripts/sync-docs-publicos.ts` para la copia pública, y `--check` después.
- [ ] **Step 3: La suite entera.** `npm run verify` + las seis guardias de PLANes + remisiones. Ninguna se saltea.
- [ ] **Step 4: Deudas.** Revisar D-017 (las secciones `[INTERNO]` que no existen) — **este bloque la vuelve más urgente, porque la compuerta de tranche del Registro de Presión no se puede hacer operativa sin ese marcado.** Actualizar la entrada con esa consecuencia. Anotar cualquier deficiencia nueva encontrada en el camino, con id correlativo — y leer el índice, no el final del archivo, para elegir el número (deuda D-016).

**Commit:** `Fix el registro de PLANGEO y sincronizá la copia pública`

---

## Self-review de este plan

**Lo que más probablemente salga mal:** que la Task 1 devuelva V6 o V7 en rojo y el agente escriba la S27 igual, porque la sección está diseñada y es linda. La precondición de la Task 4 existe por eso y es una precondición dura: **si V7 no acredita la práctica de suscripción, la S27.3 dice «hipótesis» o el bloque pierde la sección.** No hay tercera salida.

**Lo segundo:** que las ediciones forzadas se hagan de arriba hacia abajo por costumbre y cada una invalide los números de la siguiente. El orden E9→E10→E8→…→E5 no es cosmético.

**Lo tercero, y es el que más fácil se pasa por alto:** que la S26.8 se escriba como trámite. Es la sub-sección que ataca a la propuesta del propio documento, y la tentación de redactarla en una versión débil —para que la objeción se caiga sola— es enorme. **Si la objeción escrita no es la mejor versión de la objeción, la sub-sección no cumple su función y conviene no tenerla.** El chequeo de las tres condiciones en la guardia detecta que estén; no detecta que estén bien escritas. Eso lo mira el autor.

**Lo que este plan no cubre y hay que saberlo:** la sobretasa de la Cláusula del Buitre, la opinión legal sobre si la conversión de foro es ejecutable bajo ley extranjera, el umbral del Segundo Proveedor y el costo de la constelación contra la línea naval que reemplaza. Los cuatro están en spec §10 como abiertos. **Este plan escribe el documento con esos huecos declarados adentro** — no los cierra, y un documento que declara sus huecos es más honesto que uno que los rellena con números plausibles. Es exactamente lo que D-015 enseñó a costa de PLANSUS.
