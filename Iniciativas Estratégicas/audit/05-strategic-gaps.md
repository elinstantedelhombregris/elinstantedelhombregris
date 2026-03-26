# Auditoría de Completitud Estratégica y Brechas

## Plataforma BASTA — 12 Iniciativas Estratégicas Interconectadas

**Fecha:** Marzo 2026
**Versión:** 1.0
**Clasificación:** DOCUMENTO DE AUDITORÍA INTERNA

---

> *"Un plan que no nombra sus propios agujeros no es un plan — es una fantasía con índice."*

---

## ÍNDICE

1. [Análisis de Dominios Faltantes](#1-análisis-de-dominios-faltantes)
2. [Cobertura del Escudo PLANGEO](#2-cobertura-del-escudo-plangeo)
3. [Mapa de Puntos Únicos de Falla](#3-mapa-de-puntos-únicos-de-falla)
4. [Secuencia Óptima de Lanzamiento](#4-secuencia-óptima-de-lanzamiento)
5. [Resumen de Hallazgos por Severidad](#5-resumen-de-hallazgos-por-severidad)

---

## 1. ANÁLISIS DE DOMINIOS FALTANTES

### 1.1 Matriz de Cobertura por Dominio

| # | Dominio | PLANes que lo tocan | Cobertura actual | Brecha identificada | Severidad |
|---|---------|---------------------|------------------|----------------------|-----------|
| 1 | **Energía (PLANEN)** | PLANMON (canasta commodity), PLANAGUA (tensión agua-energía), PLANGEO (GNL/litio como leverage, Sec 13-14), PLAN24CN (microgrids, net-zero, Sec 3.3.1), PLANEB (Bastarda Energía mencionada) | Fragmentada entre 5+ planes; sin documento rector | **NO EXISTE PLANEN como documento dedicado.** La política energética nacional — matriz de generación, transición fósil-renovable, regulación de tarifas, YPF, nucleoeléctrica, hidrógeno verde — no tiene plan propio. PLAN24CN resuelve energía para ciudades nuevas; nadie resuelve energía para los 45M que viven en ciudades existentes. | **CRÍTICA** |
| 2 | **Defensa/Seguridad (PLANSEG)** | PLANGEO Sec 18 (postura de defensa, cibersoberanía), PLANDIG (ciberdefensa), PLANEB (menciona PLANSEG como mandato separado: *"Si falla en seguridad, la respuesta es PLANSEG"*) | PLANGEO Sec 18 cubre doctrina militar y ciberdefensa a nivel geopolítico; no existe plan doméstico | **NO EXISTE PLANSEG como documento dedicado.** PLANEB lo referencia explícitamente como si existiera. La seguridad ciudadana — reforma policial, política criminal, sistema penitenciario, prevención del delito en ciudades existentes, narcotráfico (transición PLANSUS) — no tiene arquitectura. PLANJUS cubre la justicia pero no las fuerzas de seguridad. | **CRÍTICA** |
| 3 | **Cultura/Medios/Artes** | PLANGEO Sec 24.4 (diplomacia cultural, soft power), PLAN24CN (arte público, identidad regional, Consejo de Sabiduría), PLANEDU (creatividad como capacidad), PLANREP (industria creativa como rama del trabajo vivo) | Dispersa como componente instrumental de otros planes | **NO EXISTE plan de política cultural integral.** La industria cultural (cine, música, editorial, teatro, artes visuales), los medios de comunicación (concentración mediática, soberanía informativa), el patrimonio cultural, y la producción artística como sector económico no tienen arquitectura BASTA. PLANDIG menciona una "red social cívica" y "medios" soberanos pero no los desarrolla como política cultural. La concentración mediática (Grupo Clarín, etc.) y su rol en la resistencia a BASTA no se aborda en ningún plan. | **IMPORTANTE** |
| 4 | **Ciencia/Investigación** | PLANDIG (LANIA — Laboratorio Nacional de IA), PLAN24CN (CONICET como evaluador y ancla institucional), PLANAGUA (ciencia ciudadana, investigación glaciológica), PLANSUS (hub de I+D en sustancias) | LANIA cubre IA; CONICET aparece como ejecutor, no como sujeto de reforma | **Brecha parcial.** No existe una política científica integral. CONICET se usa extensivamente como recurso (evaluador en PLAN24CN, investigador en PLANAGUA, formador en PLANEDU) pero su propia reforma — presupuesto, gobernanza, relación con la producción, sistema de becas, fuga de cerebros en ciencias no-digitales — no se aborda. PLANDIG cubre la reversión de fuga de cerebros para el sector digital; las ciencias básicas, la investigación biomédica, la física, la química, las ciencias sociales quedan sin estrategia de retención. | **IMPORTANTE** |
| 5 | **Vivienda (ciudades existentes)** | PLAN24CN (vivienda cooperativa en ciudades nuevas; critica PROCREAR y Plan Federal de Vivienda), PLANEB (Bastarda Inmobiliaria no existe aún) | PLAN24CN resuelve vivienda para ~1M de personas en ciudades nuevas | **Brecha significativa.** 45 millones de argentinos viven en ciudades existentes. El déficit habitacional es de 3,5M de unidades. PLAN24CN reconoce el problema (Sec 1) pero lo usa como argumento para ciudades nuevas, no para resolverlo *in situ*. El Fideicomiso de Vivienda Social y el modelo FUCVAM se mencionan para ciudades nuevas. No hay plan para: regulación del mercado inmobiliario existente, crédito hipotecario post-PLANMON, reforma de alquileres, urbanización de asentamientos informales, rehabilitación energética del parque edilicio existente. PLAN24CN dice que retrofitar Buenos Aires costaría USD 80-120.000M — pero no propone qué se hace en su lugar para los que ya viven ahí. | **CRÍTICA** |
| 6 | **Transporte/Logística** | PLAN24CN (movilidad interna de ciudades nuevas, corredores interurbanos, rehabilitación de trazas ferroviarias), PLANEB (Bastarda Móvil mencionada en listas pero no desarrollada), PLANGEO (hub logístico Ushuaia) | PLAN24CN tiene un diseño de movilidad excelente para ciudades nuevas y corredores intercélula | **Brecha importante.** No existe plan nacional de transporte. PLAN24CN propone rehabilitar trazas ferroviarias existentes para conectar las 24 ciudades — pero no hay arquitectura para: la reforma del transporte urbano en el AMBA (90+ min de commute), la rehabilitación integral del sistema ferroviario nacional, la aviación civil, la logística portuaria (más allá de Ushuaia), el transporte de carga, la electromovilidad como política nacional. El ferrocarril aparece en cada ficha de ciudad como "traza existente parcialmente operativa" — pero la inversión para rehabilitarlas no se presupuesta integralmente en ningún plan. | **IMPORTANTE** |
| 7 | **Pensiones/Seguridad Social** | PLANMON (menciona sistema previsional), PLANREP (DNP como ingreso universal futuro, fideicomisos), PLANEDU (alfabetización post-laboral) | PLANREP diseña la transición post-laboral a largo plazo (Horizontes 2-3); PLANMON no detalla reforma previsional | **Brecha de transición.** El sistema previsional argentino actual es insolvente y disfuncional. PLANREP propone el DNP como eventual reemplazo del sistema de empleo + jubilación — pero eso es Horizonte 2-3 (2035+). No hay plan para: la transición del sistema previsional actual (ANSES) durante el Horizonte 1, la crisis de sustentabilidad de las jubilaciones existentes, la relación entre PLANMON (peso-canasta) y el ajuste jubilatorio, la situación de los 7+ millones de jubilados y pensionados actuales. El Fondo de Garantía de Sustentabilidad (FGS) se usa como fuente de financiamiento de PLAN24CN (10-20% de activos) — pero su función primaria es respaldar jubilaciones. | **IMPORTANTE** |
| 8 | **Vehículo político (plataforma BASTA)** | PLANGEO Sec 22.3 (blindaje institucional: "BASTA no debe ser un proyecto de un gobierno, debe ser un proyecto del pueblo"), todas las tesis centrales mencionan "plataforma BASTA" | Referencia constante como marco filosófico; sin arquitectura política | **Brecha deliberada pero riesgosa.** En ningún documento se describe: cómo llega BASTA al poder, qué estructura política/partidaria/movimentista lo sostiene, cómo se ganan las elecciones necesarias para implementar los 12 planes, cómo se construye la coalición parlamentaria para aprobar las leyes requeridas, cómo se gestiona la comunicación política durante la implementación. PLANGEO Sec 22.3 dice que BASTA debe blindarse con leyes y agencias autónomas — pero para aprobar esas leyes se necesita poder legislativo. El documento asume implícitamente que BASTA ya gobernó y legisló. La estrategia de obtención del poder es un vacío. | **CRÍTICA** |
| 9 | **Reforma constitucional / cascada legal unificada** | Cada plan propone sus propias leyes. PLAN24CN requiere Ley de Ciudades Nuevas, reforma FONAVI. PLANAGUA requiere Ley de Criosfera, personería jurídica de ríos, presupuesto constitucional. PLANEB requiere Ley de Entidades de Propósito Perpetuo. PLANSUS requiere denuncia de convenciones ONU. PLANMON requiere nueva arquitectura monetaria. PLANJUS requiere reforma judicial. | Cada plan tiene su propio análisis legal. PLAN24CN Sec 10.3 argumenta que no necesita reforma constitucional. | **Brecha de coordinación.** No existe un análisis jurídico transversal que: catalogue todas las leyes requeridas (se estiman 25-40 leyes nuevas y reformas), priorice el orden legislativo, identifique qué requiere reforma constitucional vs. ley simple vs. decreto, evalúe la viabilidad de conseguir quórum parlamentario, mapee las alianzas legislativas necesarias por bloque. Múltiples planes reclaman "presupuesto constitucional protegido" para sus agencias (ANEB, ANAGUA, ANCE, ANDIG, ANSUS, ANMON) — si todos lo logran, el presupuesto discrecional del Estado se reduce dramáticamente. ¿Es eso viable constitucionalmente? Nadie lo analiza de forma integrada. | **CRÍTICA** |

### 1.2 Hallazgos Consolidados sobre Dominios Faltantes

**Cuatro brechas CRÍTICAS:**

1. **PLANEN (Energía)** — Es el plan fantasma más peligroso. PLANMON referencia "commodities energéticas en la canasta" y menciona explícitamente a PLANEN como si existiera. PLANGEO ofrece GNL y litio como leverage geopolítico. PLAN24CN diseña ciudades net-zero. Pero no hay documento que defina: la política de transición de la matriz energética nacional, la reforma tarifaria, el rol de YPF, la estrategia nuclear, el hidrógeno verde a escala nacional, la regulación del mercado eléctrico, la distribución (donde PLANEB menciona una Bastarda Energía). Sin PLANEN, la canasta del peso-canasta (PLANMON) está incompleta, las ciudades existentes siguen dependiendo de subsidios energéticos de USD 10-15.000M/año, y el leverage geopolítico de PLANGEO carece de plan de ejecución.

2. **PLANSEG (Seguridad Ciudadana)** — PLANEB lo nombra como si existiera. PLANSUS crea una transición del narcotráfico que genera vacíos de poder territorial. PLANJUS reforma la justicia pero no las fuerzas de seguridad. La seguridad ciudadana en las ciudades existentes — donde vive el 98% de la población — no tiene arquitectura. La reforma policial, la política penitenciaria, y la transición de seguridad durante la cascada de PLANSUS son omisiones potencialmente desestabilizadoras.

3. **Vivienda para ciudades existentes** — PLAN24CN es brillante para un millón de personas. Los otros 45 millones necesitan: crédito hipotecario accesible (que PLANMON podría habilitar pero no detalla), regulación del mercado inmobiliario, urbanización de villas y asentamientos, rehabilitación edilicia. Es la brecha con mayor impacto poblacional directo.

4. **Vehículo político + Cascada legal** — BASTA no puede existir sin poder político. Ningún documento describe cómo se obtiene. Y una vez obtenido, la coordinación legislativa de 25-40 leyes nuevas requiere una estrategia parlamentaria sofisticada que no existe.

---

## 2. COBERTURA DEL ESCUDO PLANGEO

### 2.1 Matriz de Protección Geopolítica por Plan

PLANGEO Sección 11 (Mapa de Fricción) y Sección 24 (Integración) mapean amenazas para cada plan doméstico. La siguiente matriz evalúa la calidad de esa cobertura.

| Plan Doméstico | Amenaza internacional principal | ¿PLANGEO la identifica? | ¿PLANGEO tiene contramedida? | Evaluación de la contramedida | Brecha residual |
|---|---|---|---|---|---|
| **PLANMON** (desdolarización) | Reacción de EEUU (sanciones financieras, presión FMI, exclusión SWIFT) | **SÍ** — Sec 11, 13, 22.2 | SÍ — sistema de pagos soberano, swap con China, GNL como leverage con UE | **Media-Alta.** La secuencia es correcta (preparar antes de provocar). Pero la velocidad de implementación del sistema de pagos alternativo es incierta. Si PLANDIG no tiene ArgenCloud operativo, el sistema de pagos soberano no tiene infraestructura. | PLANMON depende de PLANDIG para sus rieles de pago. Si PLANDIG se retrasa, PLANMON queda expuesto sin red de seguridad financiera antes de poder desdolarizar. **IMPORTANTE** |
| **PLANSUS** (denuncia de convenciones) | Sanciones EEUU, presión JIFE, aislamiento diplomático | **SÍ** — Sec 11.2 (escenario cascada), Sec 13.3 (judo diplomático), Sec 22.2 | SÍ — coalición reformista, secuenciamiento (lanzar PLANSUS en Fase 3, después de la Red Soberana), sistema de pagos alternativo pre-constituido | **Alta.** Es el plan mejor protegido por PLANGEO. El secuenciamiento es inteligente: no denunciar convenciones hasta tener masa crítica de aliados y sistema de pagos alternativo. El "judo diplomático" (24 estados de EEUU ya legalizaron) es una buena herramienta retórica. | La coalición reformista asume que 8+ países se sumarán a la denuncia. Si solo 2-3 lo hacen, Argentina queda expuesta como líder solitario. No hay protocolo de fallback si la coalición no se materializa. **MENOR** |
| **PLANDIG** (soberanía digital) | Big Tech (CLOUD Act, restricción de servicios, lobby USTR), reacción de EEUU y China | **SÍ** — Sec 11 (tabla corporativa y estatal), Sec 14 (alianza UE) | SÍ — equivalencia GDPR con UE, ArgenCloud con nodos internacionales, alianza UE-Argentina en soberanía digital | **Media.** La alianza UE es una buena estrategia (complementariedad con GDPR/DMA/DSA). Pero la contramedida ante restricción de servicios de Big Tech (Google, AWS, Microsoft) es insuficiente: si Big Tech corta servicios *antes* de que ArgenCloud esté operativo, hay un período de vulnerabilidad crítica. | Fase de transición: entre el anuncio de soberanía digital y la operatividad plena de ArgenCloud (estimada 3-5 años), Argentina depende de la infraestructura que está intentando reemplazar. PLANGEO no tiene protocolo para este período liminal. **IMPORTANTE** |
| **PLANAGUA** (Ley de Criosfera, derechos de ríos) | Empresas mineras (Barrick Gold, Glencore), lobby minero internacional | **SÍ** — Sec 5 (Stack de Soberanía de Recursos) menciona tensión litio-agua | Parcial — PLANGEO ofrece "condicionamiento de litio a transferencia tecnológica" pero no aborda específicamente el pushback minero contra la Ley de Criosfera | **Baja-Media.** La Ley de Glaciares (26.639/2010) ya generó una resistencia feroz del lobby minero. La Ley de Criosfera de PLANAGUA es sustancialmente más ambiciosa. PLANGEO no tiene una estrategia específica para: demandas CIADI de mineras, presión de Canadá (sede de Barrick), presión de Suiza (sede de Glencore), coordinación con Chile (que comparte la criosfera andina). | **Brecha significativa.** Las mineras tienen historia de usar tribunales CIADI contra Argentina (Vivendi, Enron, etc.). La Ley de Criosfera será litigada internacionalmente. PLANGEO necesita una estrategia anti-CIADI específica para recursos naturales. **IMPORTANTE** |
| **PLANEB** (empresas al costo) | Corporaciones incumbentes (seguros, banca, telcos), lobby empresarial, demandas por "competencia desleal" | **SÍ** — Sec 11 (tabla corporativa), Sec 12 (doble capa) | SÍ — publicación preventiva del Protocolo Bastardo como código abierto (hecho irreversible), diseño legal de Bastardas como "sin ánimo de lucro" para evitar alegación de subsidio ante OMC | **Alta.** Es la mejor contramedida del ecosistema PLANGEO. La estrategia de "no destruir sino iluminar" hace que la represalia retórica sea difícil (¿vas a sancionar a un país por tener precios transparentes?). PLANGEO Fase 1 lanza PLANEB primero precisamente porque es "inobjetable". | Riesgo residual menor: lobby doméstico (cámaras empresariales, medios afines) puede ser más peligroso que la represalia internacional. Esta amenaza doméstica no está cubierta por PLANGEO (que mira hacia afuera). **MENOR** |
| **PLAN24CN** (ciudades nuevas) | Banco Mundial (competencia con sus modelos de desarrollo), China (Belt & Road compite) | **SÍ** — Sec 8 (Stack Urbano) | SÍ — Stack Urbano exportable, diplomacia de código, financiamiento sin deuda condicionada | **Media-Alta.** Las ciudades nuevas son difíciles de atacar internacionalmente. El riesgo principal es doméstico (oposición política, captura provincial), no geopolítico. PLANGEO lo reconoce implícitamente al poner PLAN24CN en Fase 2 de lanzamiento internacional. | Sin brecha geopolítica significativa. La resistencia a PLAN24CN es primariamente doméstica. **MENOR** |
| **PLANREP** (modelo post-laboral) | FMI (heterodoxia económica), ortodoxia neoclásica, calificadoras | **SÍ** — Sec 11 (FMI) y Sec 24 (Fase 3: "los confrontativos") | SÍ — diplomacia académica, legitimación en Red Soberana, lanzamiento internacional tardío (Fase 3, cuando ya hay masa crítica) | **Media.** La estrategia de secuenciamiento es correcta. PLANREP se muestra al mundo después de que funcione domésticamente. Pero la reacción del FMI puede anticiparse al lanzamiento internacional si Argentina tiene un programa activo. | Si Argentina tiene deuda con el FMI al momento de implementar PLANREP, el leverage del Fondo es alto. PLANMON y PLANGEO deben lograr independencia financiera del FMI *antes* de escalar PLANREP. La hoja de ruta de PLANGEO ubica "independencia del FMI" en 2033-2035, lo cual es consistente. **MENOR** |
| **PLANEDU** (reforma educativa) | Baja. La educación no genera fricción geopolítica significativa | **SÍ** — Sec 24 (Fase 1: "inobjetable") | No necesita contramedida geopolítica fuerte | **Alta.** Correctamente identificado como plan "inobjetable" — nadie sanciona por mejorar escuelas. | Sin brecha. **MENOR** |
| **PLANISV** (suelo) | Bayer/Monsanto (soberanía de semillas), lobby agroindustrial | **SÍ** — Sec 11 (tabla corporativa: agroindustria) | SÍ — soberanía de semillas + agricultura regenerativa + alineamiento UE (Green Deal, trazabilidad) | **Media-Alta.** La alianza con UE por demanda de alimentos trazables y baja huella de carbono es sólida. La presión de Monsanto/Bayer sobre semillas patentadas es real pero manejable. | Sin brecha significativa. **MENOR** |
| **PLANJUS** (reforma judicial) | Baja directamente, pero alta indirectamente (CIADI, tribunales arbitrales) | Parcial — PLANGEO Sec 9 (Stack Jurídico) | Parcial — propone reconocimiento internacional de mecanismos alternativos de justicia | **Media.** La reforma judicial doméstica no genera fricción internacional directa. El riesgo es que PLANJUS sea el eslabón débil que impide la aplicación de otros planes si la resistencia judicial interna bloquea las leyes de BASTA. | PLANGEO no aborda la resistencia del poder judicial doméstico como amenaza. No es una amenaza *geopolítica* — pero puede ser la amenaza institucional más peligrosa para BASTA. Jueces que declaren inconstitucionales las leyes de BASTA pueden paralizar todo. **IMPORTANTE** |
| **PLANSAL** (salud integral) | Lobby farmacéutico, prepagas | **SÍ** — Sec 7 (Stack Sanitario), Sec 11 (Big Pharma) | SÍ — Protocolo de Innovación Abierta, alianza con India para genéricos | **Media-Alta.** La estrategia farmacéutica es razonable (India como aliado en genéricos, producción local). | Sin brecha significativa. **MENOR** |

### 2.2 Hallazgos Consolidados sobre PLANGEO

**Fortalezas:**
- El Mapa de Fricción (Sec 11) es exhaustivo y honesto sobre las amenazas.
- La Estrategia de Doble Capa (diplomática + infraestructura) es elegante y operativamente sólida.
- El secuenciamiento en 4 fases (Inobjetables -> Estratégicos -> Confrontativos -> Transformativos) es inteligente.
- El Protocolo Anti-Cascada (Sec 11.2) aborda el peor escenario.

**Brechas:**
1. **Período liminal de PLANDIG:** entre el anuncio de soberanía digital y la operatividad plena de ArgenCloud, Argentina es vulnerable. No hay protocolo específico para esta ventana. **(IMPORTANTE)**
2. **Defensa anti-CIADI para recursos naturales:** la Ley de Criosfera y otras restricciones a la minería serán litigadas en tribunales internacionales. No hay estrategia integrada. **(IMPORTANTE)**
3. **Amenazas domésticas:** PLANGEO mira hacia afuera (estados, corporaciones, multilaterales) pero no aborda la resistencia institucional interna — poder judicial que bloquea leyes, gobernadores que capturan procesos, medios de comunicación concentrados que atacan la narrativa. Esto se asume como responsabilidad de cada plan individual, pero ninguno lo aborda de forma integral. **(IMPORTANTE)**
4. **Dependencia de la coalición reformista:** varios protocolos asumen coaliciones internacionales (8+ países para PLANSUS, 15-20 para la Red Soberana en 2030). Si estas coaliciones se forman más lentamente, el calendario completo se retrasa. **(MENOR)**

---

## 3. MAPA DE PUNTOS ÚNICOS DE FALLA

### 3.1 Análisis de Dependencias Cruzadas

La pregunta para cada plan: *"Si este plan falla completamente, ¿cuáles otros se dañan críticamente?"*

#### PLANDIG — NODO NERVIOSO CENTRAL

| Plan dependiente | Naturaleza de la dependencia | Impacto si PLANDIG falla | Severidad |
|---|---|---|---|
| PLANMON | El Pulso (peso-canasta) necesita los rieles de pago del SAPI (PLANDIG) y la Red Bastarda digital | **FATAL.** Sin infraestructura digital soberana, no hay moneda digital soberana. El Pulso no puede correr sobre AWS. | CRÍTICA |
| PLANEB | El Protocolo Bastardo requiere infraestructura blockchain, identidad descentralizada, tesorería on-chain | **SEVERO.** Las Bastardas pueden operar con infraestructura extranjera, pero pierden la soberanía que las define. | ALTA |
| PLAN24CN | Las 24 ciudades dependen de datacenters soberanos, IA para gestión urbana, sensores IoT, cluster de cómputo | **ALTO.** Las ciudades funcionan sin IA soberana pero pierden la Capa Digital que las diferencia. | ALTA |
| PLANAGUA | Gemelo Digital del sistema hídrico, Red IoT de monitoreo, algoritmos de predicción | **MEDIO.** Se puede monitorear agua con tecnología convencional, pero se pierde la capacidad predictiva y la transparencia en tiempo real. | MEDIA |
| PLANGEO | ArgenCloud (nodos internacionales), sistema de pagos alternativo, ciberdefensa | **ALTO.** Sin ArgenCloud, la Red Soberana no tiene infraestructura que ofrecer. La propuesta de PLANGEO se vacía de contenido técnico. | ALTA |
| PLANEDU | PAA (Plataforma Adaptativa de Aprendizaje), datos educativos soberanos | **MEDIO.** La educación puede funcionar sin PAA, pero pierde la personalización y la escala. | MEDIA |
| PLANSUS | Tablero Nacional de Sustancias, trazabilidad del mercado regulado | **BAJO-MEDIO.** PLANSUS puede operar con tecnología convencional. | BAJA |
| PLANJUS | Resolución de disputas en tres niveles con soporte digital | **BAJO.** La justicia puede funcionar analógicamente. | BAJA |

**Conclusión: PLANDIG es el single point of failure más peligroso del ecosistema BASTA.** Si falla, PLANMON queda inviable, PLANEB pierde su esencia, PLAN24CN pierde su diferencial, y PLANGEO pierde su oferta al mundo. La infraestructura digital es el sistema nervioso de todo BASTA.

**Recomendación:** PLANDIG debe tener la mayor redundancia y los menores riesgos de falla de todos los planes. La estrategia de reconversión de infraestructura existente (fábricas cerradas, bases militares) es correcta para reducir costos, pero debe tener fallbacks. Si ArgenCloud no alcanza la masa crítica necesaria, ¿cuál es el Plan B? No hay uno documentado.

---

#### PLANJUS — SISTEMA INMUNOLÓGICO

| Plan dependiente | Naturaleza de la dependencia | Impacto si PLANJUS falla | Severidad |
|---|---|---|---|
| PLANEB | Resolución de disputas de Bastardas en tres niveles (mediación, arbitraje, judicial) | **SEVERO.** Sin sistema de justicia funcional, las Bastardas no pueden resolver conflictos entre usuarios, con reguladores, o internos. La confianza se erosiona. | ALTA |
| PLANAGUA | Disputas hídricas, enforcement de Ley de Criosfera, acción legal de guardianes de ríos | **ALTO.** Los ríos con personería jurídica necesitan un sistema judicial que procese sus demandas. Sin PLANJUS, la personería es simbólica. | ALTA |
| PLAN24CN | Conflictos de gobernanza, auditorías de captura, contratos en blockchain | **MEDIO.** Las ciudades tienen mecanismos internos (Contraloría, Asamblea) pero necesitan PLANJUS para escalamiento. | MEDIA |
| PLANMON | Resolución de disputas financieras | **MEDIO.** El sistema monetario funciona sin justicia perfecta, pero las disputas financieras no resueltas erosionan la confianza. | MEDIA |
| Todos | Anti-corrupción, enforcement legal de reformas BASTA | **ALTO.** Sin un sistema judicial funcional, las leyes de BASTA se aprueban pero no se ejecutan. La impunidad sobrevive. | ALTA |

**Conclusión: PLANJUS es el sistema inmunológico.** No mata directamente ningún plan si falla, pero debilita la capacidad de todos para defenderse contra la corrupción, la captura y el incumplimiento. Sin PLANJUS, BASTA tiene leyes pero no enforcement.

---

#### PLANEB — CAPA DE EJECUCIÓN ECONÓMICA

| Plan dependiente | Naturaleza de la dependencia | Impacto si PLANEB falla | Severidad |
|---|---|---|---|
| PLANMON | Bastarda Financiera como nodo ancla de la Red del Pulso, custodio de reservas | **SEVERO.** Sin Bastarda Financiera, el Pulso no tiene infraestructura bancaria al costo para distribución y custodia. Se depende de banca tradicional. | ALTA |
| PLAN24CN | Ciudades nuevas nacen "Bastardas" — seguros, energía, telco, banca al costo desde el día uno | **ALTO.** Sin Red Bastarda, las ciudades nuevas dependen de servicios privados convencionales. Pierde el diferencial de costo. | ALTA |
| PLANAGUA | Bastardas Hídricas proveen agua al costo | **MEDIO.** El agua puede ser provista por cooperativas convencionales, pero sin la arquitectura de transparencia radical. | MEDIA |
| PLANSAL | Bastarda Sanitaria complementa el sistema público | **MEDIO.** El sistema de salud funciona sin Bastarda Sanitaria, pero pierde la referencia de precio transparente. | MEDIA |
| PLANGEO | Stack de Gobernanza Económica — la oferta central al mundo | **ALTO.** Si PLANEB falla domésticamente, PLANGEO no tiene producto exitoso que exportar. La Red Soberana pierde su caso de éxito. | ALTA |

**Conclusión: PLANEB es la capa de ejecución.** Si falla, la promesa económica de BASTA — "servicios al costo real" — no se materializa. PLANMON pierde su infraestructura de distribución. PLAN24CN pierde su ventaja competitiva. PLANGEO pierde su producto estrella.

---

#### PLANREP — FUENTE DE FUERZA LABORAL Y FINANCIAMIENTO

| Plan dependiente | Naturaleza de la dependencia | Impacto si PLANREP falla | Severidad |
|---|---|---|---|
| PLANEDU | Financiamiento (ahorro fiscal del sobreempleo libera recursos para educación), Maestros Creadores, Nodos de Contribución | **ALTO.** PLANEDU depende de que PLANREP libere recursos fiscales y genere una fuerza de trabajo para los Centros de la Vida. | ALTA |
| PLAN24CN | Fuente demográfica (trabajadores reconvertidos como población fundacional de ciudades) | **MEDIO.** Las ciudades pueden poblarse sin PLANREP, pero pierden una fuente organizada de población. | MEDIA |
| PLANMON | La capacidad de sostener el Fondo Soberano depende de productividad (que PLANREP potencia) | **BAJO-MEDIO.** El Fondo Soberano tiene múltiples fuentes. PLANREP es complementaria. | BAJA |
| Fiscal general | El ahorro de USD 15-25.000M/año en sobreempleo público financia a todos los demás planes | **SEVERO.** Si PLANREP no logra reconvertir y el sobreempleo persiste, el costo fiscal ahoga a los demás planes. | ALTA |

**Conclusión: PLANREP es el financiador silencioso.** Su éxito libera USD 15-25.000M/año en espacio fiscal. Su fracaso mantiene la presión fiscal que impide financiar todo lo demás.

---

#### PLANMON — CAPA DE ESTABILIDAD MONETARIA

| Plan dependiente | Naturaleza de la dependencia | Impacto si PLANMON falla | Severidad |
|---|---|---|---|
| Todos | Todas las proyecciones financieras de todos los planes asumen estabilidad monetaria | **CATASTRÓFICO.** Una crisis monetaria (hiperinflación, corrida, colapso del Pulso) destruye la credibilidad de BASTA, encarece todos los proyectos, y genera el tipo de caos social que permite la desestabilización política. | CRÍTICA |
| PLAN24CN | Los costos de construcción están en UC (Unidades Ciudad) y pesos; una devaluación del 50% impacta el 20% importado | **ALTO.** PLAN24CN tiene blindaje parcial (80% insumos locales), pero una crisis monetaria severa paraliza todo. | ALTA |
| PLANGEO | La desdolarización es la pieza más provocadora y la más visible internacionalmente | **SEVERO.** Si la desdolarización falla públicamente, PLANGEO pierde credibilidad global. Los adoptantes potenciales de la Red Soberana se retraen. | ALTA |

**Conclusión: PLANMON es la sangre.** Si falla, el organismo muere. Es el plan con mayor riesgo sistémico.

---

### 3.2 Mapa Visual de Dependencias Críticas

```
                          ┌─────────────┐
                          │   PLANDIG   │ ← NODO NERVIOSO CENTRAL
                          │ (digital)   │    Falla = 5 planes dañados
                          └──────┬──────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
          ┌──────▼──────┐ ┌─────▼─────┐ ┌───────▼───────┐
          │   PLANMON   │ │  PLANEB   │ │   PLANGEO     │
          │ (moneda)    │ │ (mercado) │ │ (geopolítica) │
          └──────┬──────┘ └─────┬─────┘ └───────┬───────┘
                 │              │                │
                 │         ┌────▼────┐           │
                 └─────────► PLAN24CN◄───────────┘
                           │(ciudades)│
                           └────┬────┘
                                │
                    ┌───────────┼───────────┐
                    │                       │
             ┌──────▼──────┐         ┌──────▼──────┐
             │   PLANREP   │         │   PLANJUS   │
             │ (trabajo)   │         │ (justicia)  │
             └──────┬──────┘         └──────┬──────┘
                    │                       │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  TODOS LOS PLANES     │
                    │  (enforcement + $$$)  │
                    └───────────────────────┘
```

### 3.3 Las Tres Cadenas de Falla Más Peligrosas

**Cadena 1: Colapso Digital**
PLANDIG falla → PLANMON no tiene rieles de pago → desdolarización imposible → PLANGEO pierde oferta al mundo → Red Soberana no se forma → cada plan doméstico queda expuesto a represalia internacional sin escudo.

**Cadena 2: Colapso Fiscal**
PLANREP falla → sobreempleo público persiste → presión fiscal de USD 15-25.000M/año → no hay recursos para PLAN24CN, PLANDIG, PLANAGUA → desfinanciamiento generalizado → PLANMON no puede constituir Fondo Soberano → crisis monetaria.

**Cadena 3: Colapso Institucional**
PLANJUS falla → impunidad persiste → leyes de BASTA se aprueban pero no se aplican → PLANEB no puede resolver disputas → PLANAGUA no puede hacer cumplir derechos de ríos → captura política de PLAN24CN → deslegitimación de BASTA → oposición gana electoralmente → desmantelamiento.

---

## 4. SECUENCIA ÓPTIMA DE LANZAMIENTO

### 4.1 La Secuencia Implícita en los Documentos

PLANGEO Sec 24.2 define un secuenciamiento *internacional* en 4 fases. Pero no hay secuenciamiento *doméstico* consolidado. Cada plan tiene su propia hoja de ruta. La secuencia implícita, reconstruida desde los documentos:

| Año | Lanzamientos domésticos implícitos | Fuente |
|---|---|---|
| 2026 | PLANEB (primera Bastarda), PLANDIG (inicio ArgenCloud) | PLANGEO Tabla 15 |
| 2027 | PLANEDU (reforma operativa), PLANISV (escala) | PLANGEO Tabla 15 |
| 2028 | PLANSUS (cascada cannabis Año 1), PLANSAL (ANVIP) | PLANGEO Tabla 15 |
| 2029 | PLAN24CN (primera ciudad piloto) | PLANGEO Tabla 15 |
| 2030 | PLANSUS cascada completa, PLANREP piloto en 3 regiones | PLANGEO Tabla 15 |
| 2031-2033 | PLANJUS reforma completa, PLANREP escala nacional | PLANGEO Tabla 15 |

**Problemas con esta secuencia:**

1. **PLANJUS llega muy tarde (2031-2033).** Si la reforma judicial es Año 5-7, los primeros 5 años de BASTA operan sin un sistema judicial funcional. Cada ley aprobada entre 2026-2031 puede ser bloqueada por jueces del viejo sistema. Esto es un riesgo existencial.

2. **PLANMON no tiene fecha.** No aparece en la hoja de ruta de PLANGEO. La arquitectura monetaria más ambiciosa del proyecto no tiene cronograma de implementación alineado con los demás.

3. **PLANREP empieza tarde (piloto 2030, escala 2031+).** Si PLANREP es la fuente de financiamiento vía ahorro fiscal, empezar tarde significa que los planes lanzados antes (PLANDIG, PLAN24CN) deben financiarse sin ese ahorro.

4. **PLANAGUA no tiene fecha explícita.** PLANGEO lo ubica en Fase 2 internacional (2028-2030) pero no especifica cuándo arranca domésticamente.

### 4.2 Secuencia Óptima Propuesta

Basada en el análisis de dependencias, las cadenas de falla, y la lógica de "construir las bases antes de provocar al sistema":

| Prioridad | Plan | Inicio | Justificación |
|---|---|---|---|
| **T0 (Prerrequisito)** | **Vehículo político** (no documentado) | Antes de 2026 | Sin poder político, nada se implementa. Necesita existir antes del primer día de gobierno. |
| **T0 (Prerrequisito)** | **Cascada legal** (no documentada) | Antes de 2026 | El paquete legislativo completo debe estar redactado, con estrategia parlamentaria, antes de asumir. |
| **Año 1, Q1** | **PLANJUS** (reforma judicial de emergencia) | 2026 | Mover PLANJUS al inicio. Sin justicia funcional, cada reforma posterior puede ser bloqueada por medidas cautelares. No necesita ser la reforma *completa* — pero sí los mecanismos de resolución rápida y las garantías anti-bloqueo judicial. |
| **Año 1, Q1** | **PLANDIG** (inicio de infraestructura digital) | 2026 | Es el sistema nervioso. Cada mes de retraso retrasa todo lo que depende de infraestructura digital. Reconversión de primeros datacenters (bases militares, fábricas) en paralelo con todo lo demás. |
| **Año 1, Q2** | **PLANREP** (fase diagnóstica + primeros pilotos) | 2026 | Adelantar el inicio de PLANREP para comenzar a liberar espacio fiscal lo antes posible. No significa reconversión masiva inmediata — significa censo de empleo público, identificación de puestos reconvertibles, lanzamiento de primeros Centros de la Vida. |
| **Año 1, Q2** | **PLANEB** (primera Bastarda — seguros) | 2026 | Mantener como está. Es el producto "inobjetable" que demuestra el modelo. |
| **Año 1, Q3** | **PLANEDU** (reforma operativa) | 2026 | Mantener como está. Inobjetable y necesario para PLANREP (formación). |
| **Año 1, Q3** | **PLANISV** (escala) | 2026 | Mantener como está. Base para agricultura regenerativa y datos de producción para PLANMON. |
| **Año 1, Q4** | **PLANAGUA** (Censo Nacional del Agua + Ley de Criosfera) | 2026 | Adelantar. El Censo del Agua es diagnóstico puro (no confrontativo), y la Ley de Criosfera es urgente por el ritmo de pérdida glaciar. |
| **Año 2** | **PLANSAL** (Centros de Vitalidad) | 2027 | Mantener como está. Complementa PLANEDU y PLANREP. |
| **Año 2** | **PLANMON** (fase preparatoria) | 2027 | Iniciar la arquitectura del peso-canasta: definición de la canasta, desarrollo del protocolo, pilotos de wallet soberana. NO lanzar el Pulso — preparar la infraestructura. |
| **Año 3** | **PLAN24CN** (primeras 4 ciudades piloto) | 2028 | Mantener como está. Necesita 18 meses de preparación (ley, tierra, diseño). |
| **Año 3** | **PLANSUS** (cascada cannabis) | 2028 | Mantener como está. Solo después de tener infraestructura de PLANDIG y PLANJUS parcialmente operativas. |
| **Año 4** | **PLANMON** (lanzamiento del Pulso) | 2029 | Lanzar DESPUÉS de que PLANDIG tenga los rieles de pago operativos y PLANEB tenga la Bastarda Financiera funcionando. |
| **Año 4-5** | **PLANGEO** (proyección internacional) | 2029-2030 | La oferta al mundo requiere productos domésticos funcionando. No se puede exportar lo que no se demostró en casa. |

### 4.3 Diferencias Clave con la Secuencia Implícita

| Cambio | Justificación |
|---|---|
| **PLANJUS adelantado 5 años** (de 2031 a 2026) | Sin justicia funcional, las leyes de BASTA se bloquean judicialmente. Es el prerrequisito silencioso de todo. |
| **PLANREP adelantado 4 años** (de 2030 a 2026) | La liberación de espacio fiscal financia a todos los demás. Cada año de retraso cuesta USD 15-25.000M. |
| **PLANMON dado fecha explícita** (2027 preparación, 2029 lanzamiento) | No puede seguir sin cronograma. Es la "sangre" del sistema. |
| **PLANAGUA adelantado** (de sin fecha a 2026) | El Censo del Agua y la Ley de Criosfera son urgentes y no confrontativos. |
| **PLANGEO como *resultado*, no como lanzamiento** | La proyección internacional es la consecuencia del éxito doméstico, no un plan que se "lanza" en paralelo. |

---

## 5. RESUMEN DE HALLAZGOS POR SEVERIDAD

### CRÍTICOS (requieren acción inmediata)

| # | Hallazgo | Descripción | Recomendación |
|---|---|---|---|
| C-1 | **PLANEN no existe** | La energía es un dominio central (transición de matriz, tarifas, YPF, hidrógeno verde, distribución) sin plan dedicado. PLANMON lo referencia como si existiera. | Redactar PLANEN como 13er mandato. Priorizar: transición de matriz energética, reforma tarifaria, estrategia de Vaca Muerta, hidrógeno verde, Bastarda Energía. |
| C-2 | **PLANSEG no existe** | La seguridad ciudadana no tiene arquitectura. PLANEB lo referencia. PLANSUS crea vacíos de poder narcotraficante sin plan de transición de seguridad. | Redactar PLANSEG como 14to mandato. Cubrir: reforma policial, transición de seguridad durante cascada PLANSUS, política penitenciaria, seguridad ciudadana en ciudades existentes. |
| C-3 | **Vivienda para 45M de personas sin plan** | PLAN24CN cubre ~1M en ciudades nuevas. El déficit de 3,5M de viviendas en ciudades existentes no tiene plan. | Desarrollar componente de vivienda existente: puede ser sección de PLAN24CN ampliada, o PLANVIV separado. Incluir: crédito hipotecario post-PLANMON, urbanización de villas, rehabilitación edilicia. |
| C-4 | **Sin vehículo político** | Ningún documento describe cómo BASTA obtiene el poder para implementarse. | Este es probablemente un vacío deliberado (el proyecto es técnico, no partidario). Pero debe documentarse al menos: la estrategia de construcción de coalición, la comunicación política, la gestión parlamentaria. |
| C-5 | **Sin cascada legal unificada** | 25-40 leyes necesarias, sin priorización integrada ni análisis de viabilidad constitucional conjunta. | Producir un documento transversal: "Arquitectura Legal de BASTA" — catálogo de todas las leyes, orden de aprobación, análisis constitucional, estrategia parlamentaria, identificación de reformas que requieren mayorías especiales. |
| C-6 | **PLANDIG como single point of failure** | Si PLANDIG falla, 5+ planes quedan críticamente dañados. No tiene Plan B documentado. | Documentar fallbacks explícitos: ¿qué pasa si ArgenCloud tiene 50% de la capacidad prevista? ¿Qué pasa si tiene 20%? Diseñar degradación gradual, no binaria. |

### IMPORTANTES (requieren atención a mediano plazo)

| # | Hallazgo | Descripción | Recomendación |
|---|---|---|---|
| I-1 | **Política cultural/medios ausente** | No hay plan para la industria cultural, los medios de comunicación, la concentración mediática. Los medios concentrados son un vector de ataque contra BASTA. | Evaluar si merece plan dedicado o integración en PLANDIG (medios digitales) + PLANGEO (soft power). Como mínimo, se necesita estrategia de comunicación anti-resistencia mediática. |
| I-2 | **Ciencia sin reforma propia** | CONICET se usa como recurso en 6+ planes pero no tiene reforma de gobernanza ni presupuesto propio planificado. | Integrar reforma de CONICET en PLANEDU o PLANDIG. Incluir: presupuesto, gobernanza, relación con producción, retención de talento en ciencias no-digitales. |
| I-3 | **Transporte/logística sin plan nacional** | Ferrocarriles mencionados en todas las fichas de PLAN24CN pero sin inversión presupuestada integralmente. | Puede integrarse en PLAN24CN (sección de corredores) o ser plan separado. El sistema ferroviario nacional necesita USD 10-20.000M de inversión que ningún plan presupuesta. |
| I-4 | **Transición previsional sin arquitectura** | 7+ millones de jubilados actuales en un sistema insolvente. PLANREP propone DNP como reemplazo futuro pero sin puente de transición. | Integrar en PLANMON: arquitectura de transición previsional que conecte el sistema actual con el futuro DNP. Proteger jubilaciones existentes mientras se construye lo nuevo. |
| I-5 | **PLANJUS llega tarde en la secuencia** | Reforma judicial planificada para 2031-2033 deja 5 años sin protección contra bloqueo judicial. | Adelantar componentes de emergencia de PLANJUS al Año 1 (mecanismos de resolución rápida, protección anti-medida cautelar abusiva). |
| I-6 | **Período liminal de PLANDIG** | Entre anuncio de soberanía digital y operatividad de ArgenCloud hay 3-5 años de vulnerabilidad. | Documentar protocolo de convivencia: cómo operar con Big Tech durante la transición sin provocar represalias prematuras. "No anunciar hasta tener alternativa parcialmente operativa." |
| I-7 | **Defensa anti-CIADI para recursos naturales** | Ley de Criosfera y restricciones mineras serán litigadas internacionalmente. | Integrar en PLANGEO: estrategia legal específica para tribunales CIADI, posible adhesión a mecanismos alternativos de resolución, coordinación con otros países que enfrentan demandas de mineras. |
| I-8 | **FGS usado para financiar PLAN24CN** | PLAN24CN propone usar 10-20% de activos del FGS, cuya función primaria es respaldar jubilaciones. | Documentar análisis de riesgo: ¿qué pasa con las jubilaciones si la inversión en ciudades no genera el retorno esperado? Proteger al FGS contra pérdida de capital. |

### MENORES (a monitorear)

| # | Hallazgo | Descripción |
|---|---|---|
| M-1 | Coaliciones internacionales pueden formarse más lento de lo previsto | Mitigar con estrategia de adopción municipal (PLANGEO Sec 21.1) como alternativa |
| M-2 | Lobby doméstico de incumbentes contra PLANEB | Cubrir con estrategia de comunicación doméstica (no es responsabilidad de PLANGEO) |
| M-3 | PLANMON sin fecha en hoja de ruta de PLANGEO | Corregir en próxima versión de PLANGEO |
| M-4 | Múltiples agencias con presupuesto constitucional protegido | Evaluar viabilidad fiscal de proteger constitucionalmente a ANEB, ANAGUA, ANCE, ANDIG, ANSUS, ANMON simultáneamente |
| M-5 | El "Hombre Gris" es descrito como "acero" en PLANEB y como "plata" en PLANMON | Unificar la metáfora. El feedback correcto es plata (argentum = Argentina). Corregir en PLANEB. |

---

## CONCLUSIÓN

El ecosistema BASTA es notablemente coherente para un proyecto de 12 iniciativas interconectadas. Las integraciones cruzadas son extensas, las dependencias están mayoritariamente identificadas, y la secuencia geopolítica de PLANGEO es sofisticada.

Sin embargo, la auditoría identifica **seis hallazgos críticos** que requieren atención antes de la implementación:

1. La ausencia de PLANEN (energía) deja un agujero en el centro de la propuesta económica.
2. La ausencia de PLANSEG (seguridad ciudadana) es especialmente peligrosa en combinación con PLANSUS.
3. 45 millones de personas en ciudades existentes no tienen plan de vivienda.
4. No existe vehículo político ni cascada legal unificada.
5. PLANDIG es un single point of failure sin Plan B documentado.
6. PLANJUS está secuenciado demasiado tarde.

**Metáfora final:** BASTA es un organismo con un sistema nervioso fuerte (PLANDIG), sangre nueva (PLANMON), músculos productivos (PLANEB), huesos urbanos (PLAN24CN), y un sistema inmunológico en desarrollo (PLANJUS). Pero le falta el sistema energético (PLANEN), la piel protectora (PLANSEG), y los pulmones (vivienda para las ciudades existentes). Y sobre todo, le falta el corazón que lo impulse hacia la vida: la voluntad política organizada.

---

**Preparado por:** Auditoría Estratégica Interna
**Fecha:** Marzo 2026
**Clasificación:** DOCUMENTO INTERNO — PARA REVISIÓN DEL EQUIPO DE COORDINACIÓN BASTA
