# PLANSUS — Marcos de Atracción: pacientes, capital y talento

**Fecha:** 2026-08-03
**Documento objetivo:** `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` (ordinal 6, v1.1, 2.134 líneas, 27 secciones)
**Salida:** un bloque nuevo de cuatro secciones (S28–S31), siete ediciones forzadas sobre secciones existentes del mismo documento, y una entrada de deuda ajena
**Plan de implementación:** pendiente (`v2/docs/plans/2026-08-03-plansus-marcos-de-atraccion.md`)
**Precedente de estilo:** `v2/docs/specs/2026-08-02-planpuerta.md`

> **Tesis.** PLANSUS describe qué se produce y nunca dice por qué alguien vendría acá en vez
> de ir a Lisboa, Basilea o Denver. El activo argentino no son las sustancias —las va a tener
> medio mundo en diez años— ni el paisaje ni el precio: es **la evidencia**. Legalidad a escala
> nacional más volumen es una combinación que ninguna jurisdicción del planeta tiene hoy, y es
> la única que produce un registro longitudinal de resultados terapéuticos que ninguna biotech
> puede comprar en otro lado. Los pacientes que vienen pagan su propio tratamiento y, con
> consentimiento, producen el dato que trae al capital. **La clínica no compite con el
> laboratorio: lo financia y lo convoca.**

---

## 1. El hueco

La Sección 9 de PLANSUS ("La Economía Blanca") tiene cinco pilares con tablas de mercado y empleo. La Sección 13 proyecta recaudación, ahorro y ROI. El turismo terapéutico existe: S9.4, un párrafo, con retiros de ayahuasca en el Norte, psilocibina en Patagonia y Córdoba, y cannabis con vino en Mendoza.

Todo eso describe **oferta**. En 2.134 líneas no hay:

| Falta | Estado actual en el documento |
|---|---|
| Régimen de inversión extranjera | La única aparición de «inversión extranjera» está en S21, de pasada, en una frase sobre corresponsalía bancaria |
| Repatriación de dividendos, estabilidad de reglas | Cero menciones |
| Régimen migratorio (investigador, paciente, retorno) | Cero menciones |
| Certificación de centros receptivos | Cero |
| Responsabilidad civil y seguro para no residentes | S21.3 tiene marco asegurador doméstico; nada transfronterizo |
| Integración post-sesión del visitante que se va del país | Cero — y es un hueco de seguridad, no solo comercial |
| El reloj competitivo | S2.9 registra que Australia legalizó terapia psicodélica en 2023 y no extrae ninguna consecuencia estratégica |

Y una asimetría de diseño que ordena todo lo demás: **las cuatro vías de licenciamiento de la Sección 5 están escritas íntegramente para residentes.** La Vía Terapéutica habla de «pacientes bajo supervisión de profesionales licenciados» y de cobertura progresiva en el PMO. Eso es un paciente argentino. No hay un extranjero en ninguna parte de la arquitectura de licencias.

---

## 2. La secuencia, y por qué está ordenada por la macro

La decisión del autor es **C → B → A**: primero la clínica, después el laboratorio, después la fábrica. Esa secuencia no es una preferencia — es la única defendible, y la razón hay que escribirla explícita en el documento porque es el argumento más honesto del bloque.

| Tramo | Qué es | Qué necesita para existir | Bloqueante |
|---|---|---|---|
| **C — la clínica** | El paciente viene acá | Certificación de centros y régimen de visas | Ninguno externo. **Se puede empezar con el cepo puesto** |
| **B — el laboratorio** | Ensayos, I+D, patentes | Estabilidad jurídica con plazo cierto | PLANPACTO |
| **A — la fábrica** | Cultivo, APIs, exportación | Capital + repatriación de utilidades | PLANMON |

C es capital-liviana. No hacen falta cientos de millones de inversión extranjera directa para habilitar un centro en Salta: hacen falta una norma de certificación y una visa. B y A no: nadie muda un pipeline de patentes a un país donde las reglas cambian cada elección, y nadie inmoviliza capital donde no puede sacar la utilidad.

Esto le da a PLANSUS algo que casi ningún PLAN del corpus tiene: **compuertas declaradas hacia afuera.** B y A quedan condicionados por escrito a plexos que PLANSUS no controla, en vez de prometer inversión extranjera como si la ley de drogas fuera el cuello de botella. No lo es. El cuello de botella es la macro argentina, y PLANMON lo dice con todas las letras en su propio documento: *«el cepo no retiene dólares — retiene personas»*.

La mecánica de compuertas ya existe en S18 (Puertas 1A, 2 y 3 con protocolo de falla). El bloque nuevo se cuelga de esa maquinaria en vez de inventar una propia.

**Corolario presupuestario.** PLANPACTO midió que los pisos que los PLANes reclaman por escrito suman entre 7,82% y 9,41% del PBI, y que la Escalera solo conserva 2,40% del gasto primario consolidado. PLANSUS **sí reclama piso** —0,10% del PBI, declarado en `tests/unit/pisos-constitucionales.test.ts:25` con fuente en el propio documento— y ese dato hay que traerlo bien, porque la relación es la posición negociadora del PLAN:

- Es **el piso más chico del canon**, empatado con PLANEB y PLANISV, contra 0,50–1,50% de PLANSAL y 0,50–1,0% de PLANDIG.
- Y contra ese 0,10%, S13.4 proyecta autofinanciamiento desde el primer tranche más excedente fiscal que puede alimentar a otros mandatos.

La formulación correcta no es «PLANSUS no pide piso» —es falsa— sino **«PLANSUS pide el piso más chico y es el que más rápido lo devuelve»**. El bloque nuevo refuerza ese argumento: la clínica genera divisas sin reclamar pesos adicionales del Techo B.

---

## 3. La tesis: el activo es la evidencia

Argentina no puede competir por precio con Costa Rica ni por prestigio institucional con Suiza. Puede competir por algo que hoy no tiene dueño.

La investigación psicodélica está limitada en todo el mundo por el tamaño de muestra. Los ensayos de Johns Hopkins e Imperial College que S2.11 ya cita trabajan con decenas de sujetos. Oregon tiene un estado. Australia tiene un carril clínico angosto. Suiza da excepciones caso por caso. **Nadie tiene legalidad a escala nacional y volumen al mismo tiempo**, porque para eso hay que legalizar un país entero — que es exactamente lo que PLANSUS hace.

El **Registro Nacional de Resultados Terapéuticos** convierte eso en un activo. Decenas de miles de tratamientos con seguimiento longitudinal, consentido, con datos de resultado estandarizados. No es un subproducto de la política sanitaria: es la política industrial.

Y tiene una elegancia operativa que hay que aprovechar: **el seguimiento clínico y la captura del dato son el mismo mecanismo.** El visitante que vuelve a su país necesita integración post-sesión por razones médicas — teleseguimiento a la semana, al mes, a los tres meses. Ese protocolo, que hoy no existe y es un agujero de seguridad, es exactamente el que llena el Registro. Una inversión, dos resultados.

Es también el mejor seguro contra el enclave. Si el activo fuera la tierra o la mano de obra barata, el capital extranjero vendría, extraería y se iría. El activo es un registro público bajo ley argentina: **no se puede llevar en un contenedor.**

---

## 4. La compuerta clínica, y qué mata de verdad

Esta sección existe porque la arquitectura entera descansa sobre una pregunta empírica —por qué se muere gente en el turismo psicodélico— y la primera respuesta que este diseño dio era falsa (ver §12).

### 4.1 Los datos

ICEERS revisó 58 muertes atribuidas a ayahuasca entre 2010 y 2022. Solo en 34 casos pudo verificarse que la persona hubiera consumido. **Ningún análisis toxicológico o examen forense determinó jamás una muerte por intoxicación aguda de ayahuasca**, y de las nueve autopsias públicas ninguna la atribuyó a la sustancia. El contexto de denominador: aproximadamente 4 millones de personas la tomaron alguna vez, unas 820.000 solo en 2019.

Las causas efectivamente identificadas, en orden de casos confirmados:

| Causa | Casos | Qué implica para el diseño |
|---|---|---|
| **Envenenamiento por tabaco** | 4 confirmados | Es la causa identificada más frecuente — y **no es la sustancia del titular**. Es la purga |
| Infarto | 2 (preexistencia no aclarada) | Tamizaje cardiovascular |
| Otras sustancias: escopolamina, 5-MeO-DMT sintético | varios | Se administra en el mismo retiro lo que nadie declaró |
| Intoxicación por agua (hiponatremia) | 1 | Protocolo de hidratación |
| Ahogamientos y accidentes | varios | **Lapsos de supervisión** |
| Homicidios | 8 (solo 2 con el agresor bajo efectos) | Seguridad entre participantes |
| Suicidios | 14 vinculados por prensa, **1 con consumo reciente confirmado** | La prensa atribuye sin causalidad |
| Circunstancias no relacionadas | 9 | — |

Y el factor agravante que nombró la embajada de EE.UU. en Perú en 2024: los incidentes ocurren en **zonas remotas, lejos de atención médica moderna**.

### 4.2 Lo que se deriva

La compuerta no es «revisar el cuerpo». Son cuatro controles que mapean uno a uno contra las causas reales, y ninguno de los cuatro está en PLANSUS hoy:

1. **Se licencia el protocolo completo, no la molécula.** La licencia declara *todo* lo que se administra en la sesión — purgas, rapé, kambó, hidratación, todo — y administrar algo no declarado es causal de revocación inmediata. Es la regla que ataca la causa identificada número uno, y no la escribe ninguna jurisdicción del mundo.
2. **Tamizaje cardiovascular, psiquiátrico y de medicación, remoto y anticipado.** Remoto no por comodidad: por necesidad médica. La reconciliación de medicación requiere ventana de lavado de semanas, así que el tamizaje ocurre **antes de que la persona compre el pasaje**, no al llegar.
3. **Supervisión continua con ratio declarado.** Personal despierto y sobrio durante toda la sesión y el período de descenso, con ratio mínimo por participante. Los ahogamientos y accidentes salen de acá.
4. **Distancia máxima a atención crítica.** Tiempo máximo declarado a un centro con terapia intensiva, verificado en la habilitación.

El punto 4 es **la ventaja estructural argentina y hay que decirla como tal**: Salta, Jujuy, Córdoba, Mendoza y Patagonia tienen hospital de complejidad a distancia razonable. La Amazonia peruana, estructuralmente, no. Argentina puede ofrecer la ceremonia con una terapia intensiva a cuarenta minutos, y puede auditarlo. Es una promesa que un destino de bienestar no puede hacer y una jurisdicción seria sí.

### 4.3 La puerta única, y por qué resuelve la tensión ceremonial

**Todo no residente que acceda a cualquier psicoactivo bajo PLANSUS pasa por una sola admisión clínica** — terapéutica o ceremonial, sin excepción. Después de esa compuerta hay muchas habitaciones.

Esto resuelve sin violencia la tensión que el diseño tenía. S5.1 establece que en la Vía Ceremonial «la comunidad define protocolos, el Estado observa sin intervenir», y prohibirle a una comunidad recibir a un extranjero sería volver a meter al Estado exactamente donde PLANSUS acaba de sacarlo.

No hace falta. **El Estado no toca la ceremonia. Toca al visitante antes de que llegue.** La soberanía comunitaria sobre el protocolo queda intacta; la responsabilidad del Estado sobre la salud de quien pisa su territorio es una competencia que nunca cedió.

### 4.4 El operador comercial: se resuelve con lo que ya está escrito

S5.1 ya exige «atestación comunitaria y documentación de práctica ancestral» para la Vía Ceremonial, que es exenta de impuestos y de supervisión estatal. El riesgo obvio es que la industria del retiro comercial use esa exención de paraguas — que es, textualmente, cómo se deformó el turismo de ayahuasca en Perú.

Se cierra con **una línea que hoy falta: la atestación no es transferible y no se alquila.** El operador no indígena que no puede producirla se licencia como terapéutico — médico, espacio habilitado, impuesto. No hace falta una quinta vía ni una prohibición nueva. La maquinaria ya existe; le falta el candado.

---

## 5. Arquitectura: el bloque MARCOS DE ATRACCIÓN

Cuatro secciones nuevas, S28 a S31, en un bloque paralelo al de MARCOS OPERATIVOS (S21–S27), abierto por una entrada breve sobre el reloj competitivo.

**La entrada — el reloj.** Australia legalizó terapia psicodélica con MDMA y psilocibina en 2023 (S2.9 ya lo registra). Oregon abrió su programa en 2023. La ventana para ser sede y no ser un mercado más tiene fecha de vencimiento, y el corpus todavía no extrajo la consecuencia.

### S28 — EL REGISTRO: LA EVIDENCIA COMO ACTIVO NACIONAL

La sección de tesis. Va primera porque reencuadra todo lo que sigue, siguiendo el patrón de casa: S4 fija el paradigma antes de que S5 despliegue la maquinaria.

- Qué es el Registro y por qué ninguna otra jurisdicción puede construirlo
- Arquitectura de consentimiento: granular, revocable, con opción de participar sin identificación
- **Soberanía del dato**: el Registro es de un fideicomiso público bajo ley argentina, no de quien paga por acceder. No es licenciable en propiedad, no es exportable como base, no se vende — se da acceso
- Modelo de licenciamiento de acceso: gratuito para investigación pública argentina, arancelado para uso comercial, escalonado por tamaño del solicitante
- **Coautoría argentina obligatoria** en toda publicación derivada, y participación en patentes que usen el Registro como evidencia de respaldo
- Estándares de dato: instrumentos validados, medición basal y a 1 semana / 1 mes / 3 meses / 12 meses
- Gobernanza: ANSUS + ANMAT + CONICET + un comité de personas tratadas con voto, no consultivo
- Extiende S27 (propiedad intelectual y anti-biopiratería con Nagoya), que ya tiene el andamiaje conceptual

Remisión conceptual fuerte a **PLANPREGUNTA** (ordinal 25, el PLAN del conocimiento), donde este activo tiene su casa.

### S29 — LA PUERTA CLÍNICA: EL PACIENTE QUE VIENE DE AFUERA

- La compuerta única de §4.3 y los cuatro controles de §4.2
- **Certificación de centros receptivos** en tres niveles: clínico (Vía Terapéutica), comunitario receptivo (Vía Ceremonial que optó por recibir), y centro de integración
- Tamizaje remoto previo al viaje, con ventana de lavado y médico argentino responsable asignado antes del embarque
- **Seguro de responsabilidad civil para no residentes** — engancha con S21.3, que ya tiene el marco asegurador doméstico y le falta la pata transfronteriza
- **Protocolo de integración transfronteriza**: teleseguimiento obligatorio, y convenio de derivación con profesional en el país de origen cuando exista
- **Protocolo de evento adverso**: escalamiento, repatriación médica, notificación consular, y protocolo de prensa. Escrito **antes** del primer incidente, con la misma lógica declarada de S23 — *«que nos ataquen, pero que no nos encuentren improvisando»*
- Régimen fiscal del visitante: la exención de la Vía Ceremonial **no alcanza al no residente**. Quien viene de afuera tributa, vaya a la habitación que vaya
- Posicionamiento: no se compite por precio contra Costa Rica; se compite por credibilidad auditable contra Suiza, a una fracción del precio

### S30 — EL RÉGIMEN DE ATRACCIÓN: CAPITAL, EMPRESAS Y EL PROBLEMA ARGENTINO

La sección honesta. Empieza reconociendo que la ley de drogas no es el cuello de botella.

- Qué necesita realmente una biotech para radicarse, en orden: previsibilidad regulatoria, estabilidad de reglas con plazo, repatriación de utilidades, y recién después incentivo fiscal
- **El producto real: acuerdos de nivel de servicio vinculantes de ANSUS y ANMAT.** En biotech la moneda es el tiempo, no el impuesto. Un dictamen en plazo cierto con penalidad por incumplimiento vale más que una exención, y es lo único de esta lista que PLANSUS puede entregar por sí mismo
- Régimen de estabilidad sectorial: plazo cierto, **con obligaciones** — transferencia tecnológica, copropiedad local, coautoría, participación en patentes
- **El riesgo de enclave, nombrado de frente**: capital que viene, extrae y se va. Contramedidas explícitas, y el argumento estructural de §3 (el activo es un registro bajo ley argentina, no se lleva en un contenedor)
- Las compuertas hacia PLANPACTO y PLANMON de §2, declaradas como tales
- Por qué PLANSUS aporta excedente y no reclama piso, contra la Escalera de PLANPACTO

### S31 — EL TALENTO

Corta. Extiende S25.3 (pipeline de capacitación) en vez de duplicarla.

- Visa de investigador y visa de paciente de corta estadía
- Programa de retorno para investigadores argentinos en el exterior
- Remisión a **PLANPUERTA** (ordinal 27), cuya función objetivo es el arraigo y no las llegadas — que es exactamente el criterio correcto acá: se buscan investigadores que se queden, no que pasen

---

## 6. Ediciones forzadas sobre PLANSUS

No son opcionales. Sin ellas el documento se contradice a sí mismo.

| # | Sección | Edición | Por qué |
|---|---|---|---|
| E1 | **S9.4** (Turismo de Conciencia) | Reescritura | Hoy tiene marco de bienestar («cannabis + vino en Mendoza»). S29 lo vuelve médico. Sin esto, dos secciones del mismo documento describen dos industrias distintas |
| E2 | **S5.1** (Vía Ceremonial) | Cláusula: la atestación comunitaria no es transferible ni alquilable | Cierra el paraguas de la exención (§4.4) |
| E3 | **S5.2** (Vía Terapéutica) | Sub-carril de no residentes | Hoy la vía asume paciente argentino con PMO |
| E4 | **S13.2** | Revisar la fila «Turismo de conciencia expandida» y el total | Las cifras cambian de base al cambiar el modelo |
| E5 | **S15** (matriz de riesgo) | Filas nuevas: muerte de visitante extranjero; captura del Registro por actor externo; enclave de capital | El riesgo nuevo entra a la matriz existente, no a una propia |
| E6 | **S16** (respuesta a críticas) | Dos Q&A: «esto es turismo de drogas» y «están vendiendo el país». La primera se responde con el denominador de §4.1 | Son los dos ataques garantizados |
| E7 | **S18** (hoja de ruta) | El Registro arranca en la **Pre-Fase**, no después | Si arranca después, se pierde el dato desde la primera sesión legal y el activo nace mutilado. Es la decisión de secuencia más importante del bloque |

---

## 7. Integración con el corpus

**Lo que este bloque recibe:** PLANMON (salida del cepo — compuerta de A), PLANPACTO (estabilidad y Escalera — compuerta de B), PLANPUERTA (régimen migratorio — S31), PLANSAL (S24 ya tiene el Puente Sanitario de 36 meses), PLANPREGUNTA (casa conceptual del Registro).

**Lo que aporta:** excedente fiscal contra la Escalera de PLANPACTO; divisas y empleo territorial distribuido; un activo de conocimiento público para PLANPREGUNTA; y un caso de arraigo medible para PLANPUERTA.

**Lo que explícitamente NO hace:** no diseña política monetaria ni cambiaria (es de PLANMON); no crea un régimen general de inversión extranjera para toda la economía (declara uno sectorial); no toca la Vía Recreativa ni el consumo doméstico; y no diseña política de asilo ni migración general.

---

## 8. Riesgos propios del bloque

| Riesgo | Respuesta |
|---|---|
| **Un visitante extranjero muere.** El evento que cierra el país | Los cuatro controles de §4.2 + protocolo de evento adverso y de prensa escrito de antemano (S29) |
| **Argentina queda leída como destino de fiesta** y la pharma seria no viene, matando B | Es la trampa que S2.5 ya describe para Holanda. Se ataca con el encuadre médico de C: si la puerta es clínica, la lectura es clínica |
| **Captura del Registro** por un actor externo con más plata que el Estado | Fideicomiso público, no licenciable en propiedad, coautoría obligatoria (S28) |
| **Enclave**: el capital extrae y se va | Obligaciones en el régimen de estabilidad + el activo no es transportable (S30) |
| **Mercantilización de las comunidades** de la Vía Ceremonial | Atestación no transferible (E2) + la comunidad decide si recibe + contrato de beneficio que la comunidad controla |
| **Las compuertas B y A no se abren nunca** porque PLANMON y PLANPACTO no avanzan | El bloque vale igual: C es autónoma por diseño (§2). Se declara, con la misma lógica con que PLANPACTO declara que «vale la pena aunque la Fase 2 no llegue nunca» |

---

## 9. Decisiones tomadas (registro — no se rediscuten)

1. **La puerta es médica y es una sola.** No se elige vía de entrada para el extranjero: se pone una compuerta clínica única y después hay muchas habitaciones.
2. **No hay quinta vía.** La arquitectura de cuatro vías de S5 se conserva; se le agrega un sub-carril y un candado.
3. **El Estado no toca la ceremonia. Toca al visitante antes de que llegue.** La soberanía comunitaria de S5.1 queda intacta.
4. **Se licencia el protocolo completo, no la molécula.** Es la regla que ataca la causa de muerte identificada más frecuente.
5. **El activo es el Registro, no las sustancias.** La sección de tesis va primera.
6. **El Registro es de un fideicomiso público.** No se vende, no se exporta como base, se da acceso.
7. **C → B → A, ordenado por dependencia macro**, con compuertas declaradas hacia PLANMON y PLANPACTO.
8. **La exención fiscal ceremonial no alcanza al no residente.**
9. **El Registro arranca en la Pre-Fase de S18.**
10. **Bloque nuevo (S28–S31), no reescritura de S9.** S9 se mantiene como matriz productiva; el bloque nuevo es cómo llega el mundo. Solo S9.4 se reescribe, por contradicción directa.

---

## 10. Lo que queda sin resolver

1. **Todas las cifras.** Este bloque no trae ni un número de mercado, empleo o recaudación. Se escriben con fuente al redactar o se declaran como rango incierto. Los últimos commits del repositorio son correcciones de cifras refutadas por auditoría: el default es no inventar.
2. **Qué instrumentos clínicos usa el Registro.** Decisión técnica pendiente, con ANMAT y CONICET.
3. **El visitante de país donde la sustancia es ilegal.** Vuelve a una jurisdicción donde su tratamiento es delito. Afecta el teleseguimiento, la historia clínica y la derivación. **Es el hueco más serio de esta spec.**
4. **Reciprocidad regulatoria.** Si un resultado del Registro respalda una aprobación en otra jurisdicción, ¿qué recibe Argentina? Insinuado en S28, sin mecanismo.
5. **Cómo se articula el sub-carril de no residentes con el PMO** de S5.2 sin crear dos niveles de atención.
6. **Reconciliación presupuestaria** contra `PRESUPUESTO_CONSOLIDADO_BASTA.md` y contra la tabla de costos de S13.1.
7. **Si S31 sobrevive como sección propia** o se pliega dentro de S30. Se escribe última y se decide con el largo a la vista.

---

## 11. Deuda ajena: verificada y descartada

PLANPACTO documenta que la AFIP fue disuelta en octubre de 2024 y reemplazada por ARCA, y que el corpus no se enteró: «AFIP aparece cuarenta y cinco veces en nueve PLANes y ARCA no aparece ninguna vez como agencia». Se verificó si PLANSUS era uno de esos nueve: **no lo es** — cero menciones de AFIP y cero de ARCA. No hay entrada de deuda que abrir por este trabajo.

Queda una consecuencia de diseño, sin embargo: S30 crea acuerdos de nivel de servicio con ANSUS y ANMAT, y el régimen fiscal del visitante de S29 necesita un organismo recaudador nombrado. **Ese nombre es ARCA, no AFIP.** Es la primera vez que PLANSUS va a nombrar al fisco, y hay que nombrarlo bien de entrada en lugar de sumar la mención número cuarenta y seis a un organismo disuelto.

---

## 12. Corrección de hecho aplicada durante el diseño

Una afirmación estructural de la primera versión de esta spec resultó falsa, y como sostenía la arquitectura entera se deja anotada para que no vuelva.

| Decía | Dice ahora | Cómo se cayó |
|---|---|---|
| La gente se muere en los retiros de ayahuasca por **interacción ISRS/IMAO y síndrome serotoninérgico**; el diseño se ordenaba alrededor de esa causa | **Ningún análisis forense determinó jamás una muerte por intoxicación aguda de ayahuasca** (58 muertes atribuidas 2010-2022, 34 con consumo verificado, 9 autopsias públicas, cero atribuciones). Las causas confirmadas son **envenenamiento por tabaco** (4, la más frecuente), infarto, otras sustancias no declaradas, hiponatremia, lapsos de supervisión y homicidio | ICEERS. La primera versión salía de las páginas de los propios centros de retiro, que son fuente interesada, y no de un análisis de casos |
| «PLANSUS llega aportando excedente **en vez de** reclamando piso» | PLANSUS reclama **0,10% del PBI** — el piso más chico del canon, empatado con PLANEB y PLANISV — **y** proyecta autofinanciamiento desde el primer tranche. La formulación correcta es «pide el piso más chico y es el que más rápido lo devuelve» | `tests/unit/pisos-constitucionales.test.ts:25`. La afirmación era una oposición binaria donde había una relación, y el canon de pisos la desmentía en una línea |

La corrección **mejoró** el diseño: la compuerta pasó de un control genérico a cuatro controles específicos que mapean contra las causas reales, y apareció la ventaja estructural argentina —distancia a terapia intensiva— que la versión falsa no veía.

**Regla que queda:** el denominador va siempre. «Cuatro millones de personas, cero muertes forenses por intoxicación aguda» es un argumento más fuerte que cualquier relato de peligro, y es el que responde al crítico de S16.

---

## 13. Fuentes

**Corpus:** `PLANSUS_Argentina_ES.md` (S2.5, S2.9, S2.11, S5.1, S5.2, S9.4, S13.1, S13.2, S13.4, S15, S16, S18, S21.3, S23, S24, S25.3, S27), `PLANMON_Argentina_ES.md`, `PLANPACTO_Argentina_ES.md`, `v2/docs/specs/2026-08-02-planpuerta.md`, `PRESUPUESTO_CONSOLIDADO_BASTA.md`.

**Externas:**
- Muertes atribuidas a ayahuasca, análisis de 58 casos 2010-2022 — [ICEERS](https://www.iceers.org/examining-deaths-ayahuasca/)
- Muerte de turista estadounidense en Perú, dictamen forense y medicación concomitante — [The Tab](https://thetab.com/2025/06/09/forensic-pathologist-reveals-cause-of-death-as-american-tourist-dies-after-taking-ayahuasca)
- Apropiación del conocimiento indígena y turismo de ayahuasca — [Down To Earth](https://www.downtoearth.org.in/wildlife-biodiversity/ayahuasca-us-tourists-death-in-peru-highlights-how-amazonias-sacred-hallucinogenic-ceremony-continues-to-be-the-poster-child-of-indigenous-knowledges-misappropriation)
- Atribución mediática sin causalidad — [Chacruna](https://chacruna.net/can-people-really-die-from-drinking-ayahuasca-as-announced-in-the-media/)

**Pendientes de verificar antes de escribir el documento:** aviso de la embajada de EE.UU. en Perú de 2024 (citado en fuente secundaria, falta la fuente primaria); tamaño del mercado global de turismo terapéutico; costo comparado de ensayo clínico Argentina vs. EE.UU./UE; plazos actuales de dictamen de ANMAT, que son la base del acuerdo de nivel de servicio de S30.
