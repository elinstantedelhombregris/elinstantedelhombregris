# PDR — SISTEMA DE ESCRITURA DE PLANES NACIONALES ESTRATEGICOS

## Product Design Review — "El Arquitecto"

**Version:** 1.0
**Fecha:** 26 de marzo de 2026
**Autor:** Equipo de Arquitectura de Sistemas
**Clasificacion:** Documento de diseno de producto
**Origen:** Sintesis de 6 auditorias de coherencia sobre el ecosistema ¡BASTA! (16 PLANes nacionales interconectados)

---

> *"La calidad del diseno merece la calidad de la ejecucion. Un reloj de precision no se construye con herramientas de carpintero."*

---

## 0. CONTEXTO Y MOTIVACION

### 0.1 El Problema

La auditoria de 16 planes estrategicos nacionales interconectados (Proyecto ¡BASTA!) revelo que **la calidad del diseno conceptual (9/10) estaba severamente comprometida por la calidad de la ejecucion documental (5/10)**. La brecha no era de concepcion — era de herramientas. *(Nota: la ejecucion documental ha sido corregida a 8/10 tras la resolucion de los hallazgos criticos — ver Addendum.)*

Los planes se escribieron con procesadores de texto plano (Markdown), secuencialmente, sin:
- Validacion cruzada automatica
- Grafo de dependencias vivo
- Presupuesto consolidado
- Diccionario canonico de terminos
- Deteccion de referencias huerfanas
- Simulacion temporal de cascada
- Analisis adversarial estructurado
- Control de versiones semantico

El resultado fue previsible: **los documentos que se escribieron primero nunca se actualizaron cuando se escribieron los siguientes**. La fractura temporal — el hallazgo critico #1 — es un problema de herramientas, no de inteligencia.

### 0.2 Problemas Observados — Taxonomia Completa

De las 6 auditorias se extrajeron **7 clases de falla**, cada una con sub-categorias. Esta taxonomia es la base del diseno del sistema.

| # | Clase de Falla | Ejemplo Concreto | Severidad |
|---|---------------|------------------|-----------|
| F1 | **Fractura de referencias cruzadas** | Solo 17% de pares de planes tenian referencias bidireccionales. Los primeros 5 planes no sabian que los otros existian. **RESUELTO:** 240/240 pares bidireccionales (100%) en 16 PLANes. | ~~CRITICA~~ RESUELTO |
| F2 | **Inconsistencia terminologica** | 7 de 12 planes usaban "acero" donde la metafora canonica dice "plata". El acronimo ¡BASTA! tenia dos definiciones conflictivas (B=Bienestar vs B=Belleza). **RESUELTO:** "plata" en 16/16 planes, B=Bienestar unificado. | ~~CRITICA~~ RESUELTO |
| F3 | **Desalineacion temporal** | PLANMON necesita la Bastarda Financiera en Ano 1; PLANEB no la tiene hasta Ano 3. 11 planes lanzan Fase 0 simultaneamente. | CRITICA |
| F4 | **Incoherencia financiera** | El ahorro de PLANREP se cuenta multiples veces. Los "excedentes" de Bastardas contradicen su operacion al costo. Pisos constitucionales suman 2.5% del PBI. | CRITICA |
| F5 | **Brechas de cobertura** | PLANEN, PLANSEG, PLANVIV no existian pero se referenciaban. **RESUELTO:** PLANEN (energia), PLANSEG (seguridad), PLANVIV (vivienda) y PLANCUL (cultura) escritos como mandatos 13-16. | ~~CRITICA~~ RESUELTO |
| F6 | **Puntos unicos de falla** | Si PLANDIG falla, 5+ planes quedan danados criticamente. No habia Plan B documentado. **RESUELTO:** Pre-Fase + 6 fallbacks documentados en PLANDIG Seccion 33. | ~~CRITICA~~ RESUELTO |
| F7 | **Deficit adversarial** | Ningun plan modela la resistencia coordinada. La estrategia geopolitica esta publicada para que la lean los adversarios. | IMPORTANTE |

### 0.3 Vision del Sistema

Construir una plataforma de diseno, escritura, validacion y mantenimiento de planes nacionales estrategicos que haga **estructuralmente imposible** cometer las 7 clases de falla observadas.

El nombre del sistema es **"El Arquitecto"** — un entorno donde los planes son objetos vivos con relaciones tipadas, restricciones validadas, y coherencia garantizada por diseno, no por inspeccion manual.

---

## 1. ARQUITECTURA DE ALTO NIVEL

### 1.1 Diagrama de Componentes

```
+=========================================================================+
|                           EL ARQUITECTO                                  |
|                                                                          |
|  +------------------+    +------------------+    +------------------+    |
|  |   PLAN EDITOR    |    |  KNOWLEDGE GRAPH |    |  VALIDATION      |    |
|  |                  |    |                  |    |  ENGINE          |    |
|  |  - Structured    |<-->|  - Entities      |<-->|  - Rules         |    |
|  |    authoring     |    |  - Relations     |    |  - Constraints   |    |
|  |  - Templates     |    |  - Dependencies  |    |  - Consistency   |    |
|  |  - Canonical     |    |  - Timelines     |    |  - Completeness  |    |
|  |    dictionary    |    |  - Budgets       |    |  - Adversarial   |    |
|  +--------+---------+    +--------+---------+    +--------+---------+    |
|           |                       |                       |              |
|           v                       v                       v              |
|  +------------------------------------------------------------------+   |
|  |                     CONSOLIDATED VIEWS                            |   |
|  |                                                                    |  |
|  |  +-------------+ +-------------+ +-------------+ +-------------+  |  |
|  |  | Dependency  | | Budget      | | Timeline    | | Adversarial |  |  |
|  |  | Graph       | | Consolidator| | Simulator   | | Simulator   |  |  |
|  |  +-------------+ +-------------+ +-------------+ +-------------+  |  |
|  |  +-------------+ +-------------+ +-------------+ +-------------+  |  |
|  |  | Coverage    | | Terminology | | Reference   | | Failure     |  |  |
|  |  | Matrix      | | Auditor     | | Integrity   | | Cascade     |  |  |
|  |  +-------------+ +-------------+ +-------------+ +-------------+  |  |
|  +------------------------------------------------------------------+   |
|           |                       |                       |              |
|           v                       v                       v              |
|  +------------------------------------------------------------------+   |
|  |                     OUTPUT LAYER                                  |   |
|  |                                                                    |  |
|  |  - Publishable documents (Markdown, PDF, HTML)                    |  |
|  |  - Coherence reports (auto-generated audits)                      |  |
|  |  - Consolidated budget spreadsheets                               |  |
|  |  - Interactive dependency explorer                                |  |
|  |  - Diff reports (what changed since last version)                 |  |
|  +------------------------------------------------------------------+   |
+=========================================================================+
```

### 1.2 Principios de Diseno

| # | Principio | Fundamento |
|---|-----------|-----------|
| P1 | **Los planes son nodos en un grafo, no documentos aislados** | Cada plan es una entidad con relaciones tipadas hacia otros planes, eliminando la fractura de referencias (F1). |
| P2 | **Las referencias son bidireccionales por construccion** | Si el Plan A declara dependencia del Plan B, el sistema automaticamente registra la referencia inversa en B. No existen referencias huerfanas. |
| P3 | **Un termino, una definicion, un diccionario** | Todos los terminos clave (metaforas, acronimos, nombres de agencias, conceptos) se definen una vez en un diccionario canonico. Los planes referencian, no redefinen. |
| P4 | **El presupuesto es una vista consolidada, no una suma de partes** | Cada fuente de financiamiento se asigna a exactamente un plan como receptor primario. El sistema rechaza asignaciones que sumen mas del 100% de una fuente. |
| P5 | **Las dependencias temporales son restricciones, no comentarios** | Si el Plan A necesita un entregable del Plan B en el Ano 2, esa dependencia es una restriccion tipada que el simulador temporal puede verificar. |
| P6 | **Cada plan debe declarar su modo de falla** | El sistema no permite publicar un plan sin escenarios de falla y fallbacks documentados para cada dependencia critica. |
| P7 | **La coherencia se valida en tiempo real, no en auditorias** | Cada vez que un autor modifica un plan, el motor de validacion ejecuta las reglas de consistencia y muestra los conflictos *antes* de guardar. |
| P8 | **Los planes son versionados semanticamente** | Cada plan tiene un numero de version que se incrementa cuando cambia. Las referencias entre planes incluyen la version, y el sistema alerta cuando una referencia apunta a una version obsoleta. |

---

## 2. MODELO DE DATOS

### 2.1 Entidad: Plan

Un plan es la unidad fundamental del sistema. No es un documento — es una **estructura de datos** que genera documentos.

```
Plan {
  id:                  string          // e.g. "PLANDIG"
  name:                string          // e.g. "Plan Nacional de Soberania Digital"
  ordinal:             int             // posicion canonica (e.g. 10)
  version:             semver          // e.g. 3.2.1
  status:              enum            // DRAFT | REVIEW | PUBLISHED | DEPRECATED
  created_at:          datetime
  last_modified:       datetime

  // --- STRUCTURAL SECTIONS ---
  preamble:            NarrativeBlock       // Historia personal de apertura
  philosophical_frame: PhilosophicalFrame   // Hombre Gris paragraph, metal, identity
  epistemology:        EpistemologyBlock     // "Primera mejor alternativa" + cierre
  thesis:              ThesisBlock           // Tesis central
  crisis:              Section              // Diagnostico de la crisis
  lessons:             Section              // Lecciones del mundo
  ingredient:          Section?             // "El Ingrediente" (nullable, documented)
  content_sections:    Section[]            // Secciones de contenido especifico
  integration:         IntegrationMatrix    // <--- GENERADA POR EL SISTEMA
  vision_2040:         Section              // Vision a 15 anos
  closing:             NarrativeBlock       // Cierre

  // --- METADATA ---
  domain:              Domain               // Enum: ENERGY, JUSTICE, DIGITAL, etc.
  domains_covered:     Domain[]             // Subdominios que este plan cubre
  agency:              Agency               // Agencia autonoma asociada
  timeline:            Timeline             // Fases, hitos, fechas absolutas
  budget:              BudgetSheet          // Inversiones y fuentes (tipadas)
  dependencies:        Dependency[]         // <--- TIPADAS Y BIDIRECCIONALES
  failure_modes:       FailureMode[]        // Escenarios de falla + fallbacks
  adversarial:         AdversarialProfile   // Amenazas + contramedidas
  kpis:                KPI[]                // Metricas de exito por fase
  legal_requirements:  LegalRequirement[]   // Leyes necesarias
  human_capital:       HumanCapitalReq[]    // Talento requerido por fase
  tags:                string[]
}
```

### 2.2 Entidad: Dependency (Solucion a F1 — Fractura de referencias)

```
Dependency {
  id:                  string
  source_plan:         Plan.id         // Plan que DEPENDE
  target_plan:         Plan.id         // Plan del que depende
  nature:              enum            // CRITICAL | IMPORTANT | MINOR | ENHANCEMENT
  type:                enum            // FINANCIAL | INSTITUTIONAL | TECHNICAL |
                                       //   LEGAL | LABOR | DATA | TEMPORAL
  description:         string          // Que necesita exactamente
  deliverable:         string          // Que entregable del target_plan se necesita
  required_by_phase:   Phase.id        // En que fase del source se necesita
  available_at_phase:  Phase.id        // En que fase del target esta disponible
  gap_resolution:      string?         // Como se resuelve si hay desfase temporal
  fallback:            string?         // Que pasa si esta dependencia nunca se cumple
  bidirectional_ref:   Dependency.id?  // Auto-generado: la referencia inversa

  // --- VALIDACION ---
  // El sistema calcula automaticamente:
  //   temporal_gap = available_at_phase.start - required_by_phase.start
  //   is_broken = temporal_gap > 0 AND gap_resolution IS NULL
}
```

**Regla de integridad R1:** Cuando se crea una Dependency de A→B, el sistema automaticamente crea una entrada en B.integration que registra "A depende de ti para [deliverable]". Esto elimina las 55 referencias unidireccionales observadas.

**Regla de integridad R2:** Si `temporal_gap > 0` (el recurso no esta disponible cuando se necesita), el campo `gap_resolution` es **obligatorio**. Esto fuerza a resolver el desfase PLANMON-PLANEB observado.

### 2.3 Entidad: CanonicalDictionary (Solucion a F2 — Inconsistencia terminologica)

```
CanonicalDictionary {
  terms: CanonicalTerm[]
}

CanonicalTerm {
  id:                  string          // e.g. "HOMBRE_GRIS_METAL"
  canonical_value:     string          // e.g. "plata"
  forbidden_values:    string[]        // e.g. ["acero"]
  context:             string          // e.g. "La metafora del metal en el parrafo del
                                       //  Hombre Gris. Argentina = argentum = plata."
  scope:               enum            // GLOBAL | PER_PLAN
  required_in_plans:   Plan.id[]       // Planes que DEBEN incluir este termino
  optional_in_plans:   Plan.id[]       // Planes que PUEDEN adaptarlo
  allowed_variants:    Variant[]       // Variantes aceptables por plan
}

Variant {
  plan_id:             Plan.id
  variant_text:        string          // Texto adaptado para ese plan
  justification:       string          // Por que se adapta
}
```

**Regla R3:** El sistema escanea todo documento generado buscando `forbidden_values` y emite error. Esto habria detectado las 7 instancias de "acero" automaticamente.

**Regla R4:** Si un termino tiene `scope: GLOBAL`, solo puede definirse una vez. Si un plan intenta redefinirlo (e.g., ¡BASTA! B=Belleza vs B=Bienestar), el sistema emite un conflicto que debe resolverse antes de publicar.

### 2.4 Entidad: BudgetLine (Solucion a F4 — Incoherencia financiera)

```
BudgetLine {
  id:                  string
  plan_id:             Plan.id         // Plan que reclama el gasto
  category:            enum            // INVESTMENT | OPERATIONAL | CONTINGENCY
  source:              FundingSource.id
  amount_low:          USD             // Rango bajo
  amount_high:         USD             // Rango alto
  period:              YearRange       // e.g. Year 1-3, Year 4-10
  recurrence:          enum            // ONE_TIME | ANNUAL | PHASE
  notes:               string
}

FundingSource {
  id:                  string          // e.g. "PLANREP_SAVINGS"
  name:                string          // e.g. "Ahorro fiscal por eliminacion de sobreempleo"
  origin_plan:         Plan.id         // Plan que genera esta fuente
  total_available_low: USD/year
  total_available_high: USD/year
  availability_start:  Year            // Ano en que empieza a estar disponible
  availability_ramp:   RampProfile     // e.g. Year1: 0%, Year2: 30%, Year3: 100%
  claims:              BudgetClaim[]   // <--- CALCULADO: todos los planes que la reclaman
}

BudgetClaim {
  plan_id:             Plan.id
  amount_low:          USD/year
  amount_high:         USD/year
  percentage_of_source_low:  float     // <--- CALCULADO
  percentage_of_source_high: float     // <--- CALCULADO
}
```

**Regla R5 — Anti-doble-contabilidad:** Para cada `FundingSource`, la suma de `percentage_of_source_high` de todos los claims NO puede superar 100%. Si la suma supera 100%, el sistema emite un error CRITICO y los planes involucrados deben renegociar la asignacion. Esto habria detectado el triple reclamo sobre el ahorro de PLANREP.

**Regla R6 — Disponibilidad temporal:** Si un plan reclama fondos de una fuente que tiene `availability_start = Year 4` pero el plan necesita los fondos en Year 1, el sistema emite un warning con campo obligatorio `bridge_funding` para explicar como se financia el gap.

**Regla R7 — Coherencia con principios:** Si una fuente proviene de un plan cuya tesis central declara "cero ganancia" (e.g., PLANEB), el sistema impide que otro plan reclame "excedentes" de esa fuente salvo que exista un mecanismo explicito documentado y aprobado. Esto habria detectado la contradiccion PLANMON vs PLANEB.

### 2.5 Entidad: Timeline (Solucion a F3 — Desalineacion temporal)

```
Timeline {
  plan_id:             Plan.id
  pre_phase:           Phase?          // Fase de preparacion (antes del Ano 0)
  phases:              Phase[]
}

Phase {
  id:                  string          // e.g. "PLANDIG_PHASE_1"
  name:                string          // e.g. "Fundacion"
  start:               AbsoluteDate   // e.g. 2026-Q1 (NO "Ano 0" — fecha absoluta)
  end:                 AbsoluteDate
  milestones:          Milestone[]
  deliverables:        Deliverable[]   // Que produce esta fase
  prerequisites:       Prerequisite[]  // Que necesita antes de empezar
  resource_demand:     ResourceDemand  // Cuanto talento, leyes, presupuesto
  circuit_breaker:     CircuitBreaker? // Condicion de aborto / pivot
}

Deliverable {
  id:                  string
  name:                string
  available_at:        AbsoluteDate
  consumed_by:         Dependency[]    // <--- AUTO-LINKED: que dependencias esperan esto
}

Prerequisite {
  deliverable_id:      Deliverable.id  // Que necesita
  source_plan:         Plan.id         // De quien
  required_by:         AbsoluteDate    // Para cuando
  // --- VALIDACION ---
  // El sistema verifica: deliverable.available_at <= prerequisite.required_by
  // Si falla: ERROR CRITICO — desfase temporal
}
```

**Regla R8 — Fechas absolutas, no relativas:** Prohibido usar "Ano 0", "Ano 1", etc. Todas las fechas son absolutas (2026-Q1). Esto evita la ambiguedad de 16 planes con "Ano 0" diferentes. Un cambio en la fecha de inicio del ecosistema propaga automaticamente a todos los planes.

**Regla R9 — Capacidad legislativa:** El sistema cuenta cuantas leyes tienen `required_by` en el mismo periodo legislativo. Si excede un umbral configurable (e.g., 4 leyes por semestre), emite un warning: "Sobrecarga legislativa: se requieren N leyes simultaneas." Esto habria detectado las 6+ leyes simultaneas en Ano 0.

**Regla R10 — Capacidad de ejecucion:** El sistema suma la demanda de talento de todos los planes por periodo. Si N planes requieren M profesionales en el mismo trimestre, emite un warning de cuello de botella de recursos humanos.

### 2.6 Entidad: Domain (Solucion a F5 — Brechas de cobertura)

```
Domain {
  id:                  string
  name:                string          // e.g. "Energia"
  description:         string
  is_critical:         bool            // Dominio que un pais DEBE cubrir
  covered_by:          Plan.id[]       // Planes que cubren este dominio
  coverage_quality:    enum            // FULL | PARTIAL | FRAGMENTARY | NONE
  gap_analysis:        string?         // Si no es FULL, que falta
  population_affected: int             // Cuantas personas quedan sin cobertura
}
```

**Regla R11 — Cobertura obligatoria:** El sistema mantiene una lista de dominios criticos para un pais (energia, seguridad, vivienda, justicia, educacion, salud, agua, economia, moneda, relaciones exteriores, infraestructura digital, transporte, ciencia). Cada dominio debe tener al menos un plan con `coverage_quality >= PARTIAL`. Si un dominio critico tiene `coverage_quality = NONE`, el sistema emite una alerta maxima. Esto habria detectado la ausencia de PLANEN, PLANSEG, y vivienda desde el primer dia.

**Regla R12 — Fantasmas prohibidos:** Si un plan referencia otro plan por nombre (e.g., "PLANEN"), ese plan debe existir como entidad en el sistema. Referencias a planes inexistentes son errores de compilacion. Esto habria impedido las 24+ menciones de PLANEN en PLANMON.

### 2.7 Entidad: FailureMode (Solucion a F6 — Puntos unicos de falla)

```
FailureMode {
  plan_id:             Plan.id
  scenario:            string          // "PLANDIG no alcanza masa critica en ArgenCloud"
  probability:         enum            // LOW | MEDIUM | HIGH
  impact:              enum            // LOW | MEDIUM | HIGH | CATASTROPHIC
  cascade_effects:     CascadeEffect[] // Que otros planes se danan
  fallback:            string          // Que se hace si ocurre
  fallback_quality:    enum            // FULL | PARTIAL | DEGRADED | NONE
  residual_risk:       string          // Riesgo que queda despues del fallback
}

CascadeEffect {
  affected_plan:       Plan.id
  nature_of_damage:    string
  severity:            enum            // FATAL | SEVERE | HIGH | MEDIUM | LOW
}
```

**Regla R13 — Modo de falla obligatorio:** Cada plan debe tener al menos un `FailureMode` por cada dependencia con `nature: CRITICAL`. Un plan con dependencias criticas y sin modos de falla documentados no puede publicarse.

**Regla R14 — Analisis de cascada automatico:** El sistema recorre el grafo de dependencias y calcula automaticamente: "si Plan X falla, cuantos planes se danan criticamente?" Un plan que sea punto unico de falla para 3+ planes emite un warning: "SINGLE POINT OF FAILURE — se requiere fallback para cada plan dependiente."

---

## 3. MOTOR DE VALIDACION

El corazon del sistema. Un conjunto de reglas que se ejecutan continuamente y emiten errores, warnings, o pasan.

### 3.1 Reglas de Integridad Referencial (Resuelve F1)

| ID | Regla | Severidad | Descripcion |
|----|-------|-----------|-------------|
| V-REF-01 | Bidireccionalidad | ERROR | Toda dependencia declarada de A→B genera automaticamente una entrada en la seccion de integracion de B. |
| V-REF-02 | Conteo de mandatos | ERROR | Si el ecosistema tiene N planes, todo plan que mencione un conteo (e.g., "dieciseis mandatos") debe usar exactamente N. Si un plan dice "cinco iniciativas" y hay 16, es error. |
| V-REF-03 | Planes fantasma | ERROR | Toda referencia a un Plan.id que no existe en el sistema es error de compilacion. No se permite mencionar PLANEN si PLANEN no existe. |
| V-REF-04 | Integridad de citas | WARNING | Si un plan A describe una integracion con plan B (e.g., "los datos de produccion de PLANISV alimentan la canasta"), el plan B debe tener un protocolo correspondiente o un acknowledgement. Si no lo tiene, warning. |
| V-REF-05 | Discrepancias descriptivas | WARNING | Si plan A dice "resolucion en 15 dias" para un caso y plan B dice "45 dias" para el mismo caso, el sistema detecta la discrepancia por matching semantico. |

### 3.2 Reglas de Consistencia Terminologica (Resuelve F2)

| ID | Regla | Severidad | Descripcion |
|----|-------|-----------|-------------|
| V-TERM-01 | Terminos prohibidos | ERROR | Si el diccionario canonico tiene `forbidden_values: ["acero"]` para un termino, ningun plan puede contener esa palabra en el contexto de ese termino. |
| V-TERM-02 | Acronimo unico | ERROR | Un acronimo (e.g., "¡BASTA!") solo puede tener una definicion en el diccionario. Si dos planes lo definen diferente, es error. |
| V-TERM-03 | Nomenclatura de agencias | WARNING | Si el patron dominante es AN+sufijo, toda agencia que no siga el patron debe tener una justificacion documentada en el diccionario. |
| V-TERM-04 | Tablero Nacional | WARNING | Si la mayoria de los planes usan "Tablero Nacional de X", un plan que use "Dashboard" emite warning sugiriendo estandarizacion. |
| V-TERM-05 | Estructura documental | WARNING | Si un plan no tiene una seccion que el template indica como requerida (e.g., "El Ingrediente"), emite warning con campo para justificacion. |

### 3.3 Reglas de Coherencia Temporal (Resuelve F3)

| ID | Regla | Severidad | Descripcion |
|----|-------|-----------|-------------|
| V-TIME-01 | Prerequisito disponible | ERROR | Si Plan A necesita un deliverable de Plan B antes de que Plan B lo produzca, error. Campo obligatorio: `gap_resolution`. |
| V-TIME-02 | Circularidad | WARNING | Si hay dependencia circular (A necesita B, B necesita A), el sistema la detecta y requiere documentacion de resolucion (e.g., "A arranca sin B y se integra luego"). |
| V-TIME-03 | Sobrecarga legislativa | WARNING | Si >4 leyes requieren aprobacion en el mismo semestre, warning: "Capacidad legislativa excedida." |
| V-TIME-04 | Sobrecarga Year 0 | WARNING | Si >6 planes lanzan Fase 0 en los mismos 6 meses, warning: "Capacidad institucional excedida — definir micro-secuencia." |
| V-TIME-05 | Pre-Fase obligatoria | WARNING | Si un plan tiene >3 dependencias criticas y no tiene Pre-Fase, warning: "Plan complejo sin fase de preparacion." |
| V-TIME-06 | Exportacion prematura | WARNING | Si PLANGEO planea exportar Plan X en el Ano Y, pero Plan X no tiene evaluacion de impacto hasta el Ano Y+2, warning: "Exportacion sin evidencia de resultados." |

### 3.4 Reglas de Coherencia Financiera (Resuelve F4)

| ID | Regla | Severidad | Descripcion |
|----|-------|-----------|-------------|
| V-FIN-01 | Anti-doble-contabilidad | ERROR | La suma de reclamos sobre una fuente de financiamiento no puede superar el 100%. |
| V-FIN-02 | Coherencia de principios | ERROR | Si un plan declara "cero ganancia" o "operacion al costo", ningun otro plan puede reclamar "excedentes" de esa fuente. |
| V-FIN-03 | Fuente disponible | WARNING | Si un plan reclama fondos de una fuente que no estara disponible hasta un ano posterior, el plan debe documentar financiamiento puente. |
| V-FIN-04 | Pisos constitucionales | WARNING | Si la suma de pisos constitucionales de todas las agencias supera el X% del PBI (configurable, default 2%), warning: "Rigidez fiscal excesiva." |
| V-FIN-05 | ROI no duplicado | WARNING | Si dos planes reclaman el mismo beneficio macroeconomico como "su" retorno (e.g., "reduccion de gasto en salud"), warning: "ROI superpuesto — asignar a un solo plan." |
| V-FIN-06 | Rango excesivo | WARNING | Si el rango de inversion de un plan (alto/bajo) tiene un ratio >3x, warning: "Indefinicion presupuestaria — refinar estimaciones." |
| V-FIN-07 | Fuente inexistente | ERROR | Si un presupuesto reclama regalias de un plan que no existe (PLANEN), error. |

### 3.5 Reglas de Cobertura Estrategica (Resuelve F5)

| ID | Regla | Severidad | Descripcion |
|----|-------|-----------|-------------|
| V-COV-01 | Dominio critico descubierto | ERROR | Si un dominio marcado como critico (energia, seguridad, vivienda) tiene `coverage_quality = NONE`, error: "Dominio critico sin plan." |
| V-COV-02 | Plan aislado | WARNING | Si un plan tiene <3 dependencias bidireccionales con otros planes, warning: "Plan potencialmente aislado del ecosistema." (Habria detectado el aislamiento de PLANSAL.) |
| V-COV-03 | Poblacion descubierta | WARNING | Si la suma de poblacion cubierta por planes de un dominio es <90% de la poblacion nacional, warning: "Brecha de cobertura: N millones de personas sin plan para [dominio]." |
| V-COV-04 | Vehiculo politico | WARNING | Si no existe un plan con `domain = POLITICAL_VEHICLE`, warning: "No existe estrategia de obtencion del poder. Los planes asumen que ya se gobierna." |
| V-COV-05 | Cascada legal unificada | WARNING | Si >10 leyes son requeridas por distintos planes y no existe un documento de coordinacion legal, warning: "N leyes sin priorizacion integrada." |

### 3.6 Reglas de Resiliencia (Resuelve F6)

| ID | Regla | Severidad | Descripcion |
|----|-------|-----------|-------------|
| V-RES-01 | Punto unico de falla | ERROR | Si un plan es dependencia critica de 3+ planes y no tiene fallbacks documentados para cada uno, error. |
| V-RES-02 | Cadena de falla | WARNING | Si el grafo de dependencias tiene una cadena de 4+ eslabones donde cada uno es critico (A→B→C→D, todos CRITICAL), warning: "Cadena de falla de longitud N detectada." |
| V-RES-03 | Plan sin Plan B | WARNING | Si un plan no tiene ningun `FailureMode` documentado, warning: "Plan sin escenario de falla." |
| V-RES-04 | Degradacion gradual | WARNING | Si todos los `FailureMode` de un plan tienen `fallback_quality = NONE`, warning: "Plan sin degradacion gradual — es todo-o-nada." |

### 3.7 Reglas Adversariales (Resuelve F7)

| ID | Regla | Severidad | Descripcion |
|----|-------|-----------|-------------|
| V-ADV-01 | Perdedores identificados | WARNING | Si un plan no tiene un campo `losers` (actores que pierden con su implementacion), warning: "No se identifican adversarios." |
| V-ADV-02 | Resistencia coordinada | WARNING | Si >5 planes generan perdedores que podrian coordinarse (e.g., lobby empresarial + judicial + mediatico), warning: "Riesgo de resistencia convergente no modelado." |
| V-ADV-03 | Informacion publicada | WARNING | Si un plan tiene `status: PUBLISHED` y contiene estrategia confrontativa con fecha futura (e.g., "denuncia de convenciones en 2030"), warning: "Estrategia confrontativa visible para adversarios antes de su ejecucion." |
| V-ADV-04 | Ciclo politico | WARNING | Si la linea temporal total de implementacion excede 8 anos (dos mandatos), warning: "Implementacion excede un ciclo politico. Se requiere estrategia de blindaje institucional." |

---

## 4. VISTAS CONSOLIDADAS

### 4.1 Vista: Grafo de Dependencias Interactivo

Un grafo visual donde:
- Cada plan es un nodo
- Cada dependencia es un arco con color segun severidad (rojo=critica, amarillo=importante, gris=menor)
- Los arcos bidireccionales se muestran en verde
- Los arcos unidireccionales se muestran en naranja con alerta
- Los nodos con alto "in-degree" (muchos dependen de el) se muestran mas grandes
- El usuario puede hacer click en un arco para ver la dependencia detallada
- Un boton "Simular falla de X" resalta en rojo todas las cascadas

**Implementacion:** Libreria de grafos reactiva (e.g., D3.js force-directed graph, o Cytoscape.js). Backend: computacion del grafo a partir de las entidades `Dependency`.

### 4.2 Vista: Presupuesto Consolidado

Una tabla maestra que muestra:

```
+------------+--------+--------+--------+--------+--------+-----+--------+
| Fuente     | Total  | PLANEDU| PLANDIG| PLANREP| PLAN24CN| ... | LIBRE  |
+------------+--------+--------+--------+--------+--------+-----+--------+
| Ahorro REP | 15-25B | 8%     | 12%    | 80%(Y1)| --     | ... | 0-80%  |
| BID/BM     | 2-5B   | 30%    | 25%    | --     | --     | ... | 45%    |
| PLANSUS tx | 2-8B   | --     | --     | --     | --     | ... | 100%   |
| FGS-ANSES  | 10-20B | --     | --     | --     | 15%    | ... | 85%    |
+------------+--------+--------+--------+--------+--------+-----+--------+
| TOTAL RECLAM.|      |        |        |        |        |     |        |
| % DEL PBI  |        |        |        |        |        |     |        |
+------------+--------+--------+--------+--------+--------+-----+--------+
```

Celulas en rojo si la suma de una fila supera 100%. Celulas en amarillo si la fuente no esta disponible en el periodo reclamado.

### 4.3 Vista: Simulador Temporal (Linea de Tiempo Consolidada)

Una timeline interactiva (tipo Gantt) que muestra:
- Todas las fases de todos los planes en paralelo
- Arcos de dependencia entre fases
- Desfases resaltados en rojo (prerequisito no disponible cuando se necesita)
- Conteo de leyes requeridas por semestre
- Conteo de talento requerido por trimestre
- Slider para explorar "que pasa si Plan X se retrasa N meses"

**La funcionalidad critica:** El usuario puede arrastrar el inicio de un plan y ver instantaneamente el efecto cascada en todos los demas. Esto habria revelado que retrasar PLANDIG 12 meses retrasa PLANMON, PLANEB (componente digital), PLANEDU (PAA), y PLANAGUA (Gemelo Digital).

### 4.4 Vista: Matriz de Cobertura

Una tabla de dominios criticos vs. planes:

```
+------------------+------+------+------+------+------+------+---+
| Dominio          |PLANEB|PLANDIG|PLANMON| ...  |Total | Gap? |Pop|
+------------------+------+------+------+------+------+------+---+
| Energia          | FULL |   -  |  P   |  -   | FULL | NO   | - | *(PLANEN escrito)*
| Seguridad        | FULL |   P  |  -   |  -   | FULL | NO   | - | *(PLANSEG escrito)*
| Vivienda (exist) | FULL |   -  |  -   |  -   | FULL | NO   | - | *(PLANVIV escrito)*
| Cultura/Medios   | FULL |   -  |  -   |  -   | FULL | NO   | - | *(PLANCUL escrito)*
| Justicia         |  -   |   -  |  -   | FULL | FULL | NO   | - |
+------------------+------+------+------+------+------+------+---+
```

P = Parcial, FULL = Cobertura completa, FRAG = Fragmentaria, NONE = Sin cobertura.

### 4.5 Vista: Auditor Terminologico

Un panel que muestra en tiempo real:
- Cantidad de instancias de cada termino canonico en cada plan
- Instancias de terminos prohibidos resaltadas en rojo
- Inconsistencias entre definiciones
- Planes que carecen de un termino obligatorio (e.g., parrafo del Hombre Gris)

### 4.6 Vista: Simulador Adversarial

Un modulo que, dado el estado actual del ecosistema de planes:
1. Identifica todos los actores perjudicados por plan
2. Calcula las intersecciones (actores perjudicados por 3+ planes que podrian coordinarse)
3. Modela vectores de ataque disponibles (legal, mediatico, financiero, geopolitico)
4. Evalua la defensa de cada plan contra cada vector
5. Genera un informe: "Los 5 puntos mas debiles del ecosistema ante un adversario coordinado"

### 4.7 Vista: Informe de Coherencia Automatico

Un reporte que se genera con un click y replica lo que hicieron las 6 auditorias manuales:
- Matriz 16x16 de referencias cruzadas con conteo
- Lista de discrepancias terminologicas
- Lista de desfases temporales
- Balance de presupuesto consolidado
- Dominios sin cobertura
- Puntos unicos de falla
- Score de coherencia global

---

## 5. FLUJO DE TRABAJO

### 5.1 Creacion de un Nuevo Plan

```
1. Autor selecciona "Nuevo Plan"
2. Sistema presenta el template estructurado (Sec 2.1)
3. Autor completa metadatos: id, nombre, dominio
4. Sistema verifica:
   a. Dominio ya cubierto? Si es nuevo, avanza. Si ya cubierto, warning.
   b. Dominios criticos descubiertos? Sugiere: "Considere cubrir [Energia]."
5. Autor escribe secciones de contenido
6. Sistema pre-carga:
   a. Parrafo del Hombre Gris desde diccionario canonico (con placeholder para adaptacion)
   b. Parrafo de "Primera Mejor Alternativa" desde template
   c. Acronimo ¡BASTA! desde definicion canonica
   d. Conteo de mandatos actual (auto-calculado)
7. Autor declara dependencias:
   a. Para cada dependencia, el sistema muestra las fases del plan destino
   b. Si hay desfase temporal, el sistema exige gap_resolution
   c. El plan destino recibe automaticamente la referencia inversa
8. Autor declara presupuesto:
   a. Para cada fuente, el sistema muestra cuanto queda disponible
   b. Si la fuente esta sobrereclamada, ERROR
9. Autor declara modos de falla (obligatorio para cada dep. critica)
10. El sistema ejecuta TODAS las reglas de validacion (Sec 3)
11. Si hay errores: no se puede publicar
12. Si hay warnings: se muestran con opcion de "acknowledge + justificar"
13. Una vez limpio: el plan se publica y TODOS los planes referenciados
    actualizan automaticamente su seccion de integracion
```

### 5.2 Actualizacion de un Plan Existente

```
1. Autor edita cualquier campo del plan
2. El sistema ejecuta validacion incremental (solo reglas afectadas)
3. Si el cambio afecta a otros planes (e.g., cambio de timeline):
   a. Sistema muestra diff: "Este cambio afecta a N planes"
   b. Lista los impactos (e.g., "PLANMON ya no tiene la Bastarda Financiera a tiempo")
   c. Autor debe resolver los impactos o el cambio no se guarda
4. Cuando se guarda: todos los planes referenciados actualizan su version
5. Los planes que referencian al plan editado reciben notificacion:
   "[PLANEB] actualizo su timeline. Verifique su dependencia."
```

### 5.3 Nuevo Plan en el Ecosistema (Propagacion Retroactiva)

El problema central de ¡BASTA! fue que los planes no se actualizaron hacia atras. En El Arquitecto:

```
1. Se crea el Plan #13 (e.g., PLANEN)
2. El sistema automaticamente:
   a. Actualiza el conteo de mandatos en TODOS los planes existentes
   b. Resuelve todas las "referencias fantasma" que apuntaban a PLANEN
   c. Muestra en el Auditor Terminologico: "16 planes dicen 'dieciseis mandatos',
      conteo unificado — sin errores"
   d. Genera una tarea de revision para cada plan que menciona el dominio
      del nuevo plan (energia) sin referenciarlo
3. Cada autor de plan existente recibe una notificacion:
   "Nuevo plan en el ecosistema: PLANEN. Revise si su plan tiene
   dependencias o sinergias no declaradas."
```

---

## 6. STACK TECNICO

### 6.1 Tecnologias Recomendadas

| Componente | Tecnologia | Justificacion |
|-----------|-----------|---------------|
| **Modelo de datos / Grafo** | PostgreSQL + Apache AGE (extension de grafos) | Necesitamos relaciones tipadas (SQL) + queries de grafos (Cypher). AGE permite ambos sobre Postgres. |
| **Backend API** | Node.js/Express + TypeScript | Consistencia con el stack existente del proyecto. Type-safety para el modelo de datos complejo. |
| **ORM** | Drizzle ORM | Ya en uso en el proyecto. Schema-first, type-safe. |
| **Motor de validacion** | Motor de reglas custom en TypeScript | Las 30+ reglas son especificas al dominio. Un motor de reglas declarativo (JSON-based) permite agregar reglas sin cambiar codigo. |
| **Frontend** | React + TypeScript + Tailwind + shadcn/ui | Stack existente. |
| **Grafo interactivo** | Cytoscape.js o react-flow | Visualizacion de dependencias con drag-and-drop, zoom, y simulacion de cascada. |
| **Timeline** | vis-timeline o custom con D3 | Gantt interactivo con arcos de dependencia. |
| **Editor de contenido** | TipTap (ProseMirror) o Milkdown | Editor WYSIWYG con bloques estructurados. Permite forzar template (secciones obligatorias), embeber referencias tipadas, y validar terminos en tiempo real. |
| **Diff y versionamiento** | Git (bajo la superficie) | Cada plan es un directorio con archivos JSON + Markdown. Los cambios se versionan con git. |
| **Busqueda y NLP** | Embeddings + vector search (pg_vector) | Para deteccion de discrepancias descriptivas (V-REF-05): "dos planes dicen cosas diferentes sobre el mismo tema." |
| **Generacion de documentos** | Pandoc + templates | Para generar los Markdown/PDF publicables desde la estructura de datos. |
| **Hosting** | Neon (PostgreSQL) + Vercel | Ya en el stack del proyecto. |

### 6.2 Esquema de Base de Datos (Simplificado)

```sql
-- Core entities
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ordinal INT NOT NULL UNIQUE,
  version TEXT NOT NULL DEFAULT '0.1.0',
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','REVIEW','PUBLISHED','DEPRECATED')),
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE plan_sections (
  id TEXT PRIMARY KEY,
  plan_id TEXT REFERENCES plans(id),
  section_type TEXT NOT NULL,  -- 'preamble','philosophical','thesis', etc.
  ordinal INT NOT NULL,
  content JSONB NOT NULL,      -- structured content
  is_required BOOLEAN DEFAULT true
);

-- Dependency graph (solves F1)
CREATE TABLE dependencies (
  id TEXT PRIMARY KEY,
  source_plan TEXT REFERENCES plans(id),  -- plan that DEPENDS
  target_plan TEXT REFERENCES plans(id),  -- plan depended ON
  nature TEXT NOT NULL CHECK (nature IN ('CRITICAL','IMPORTANT','MINOR','ENHANCEMENT')),
  dependency_type TEXT NOT NULL,
  description TEXT NOT NULL,
  deliverable TEXT,
  required_by_phase TEXT,
  available_at_phase TEXT,
  gap_resolution TEXT,   -- REQUIRED if temporal gap > 0
  fallback TEXT,         -- REQUIRED if nature = 'CRITICAL'
  inverse_dependency_id TEXT REFERENCES dependencies(id) -- auto-generated
);

-- Canonical dictionary (solves F2)
CREATE TABLE canonical_terms (
  id TEXT PRIMARY KEY,
  canonical_value TEXT NOT NULL,
  forbidden_values TEXT[] DEFAULT '{}',
  context TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('GLOBAL','PER_PLAN')),
  required_in_plans TEXT[] DEFAULT '{}',
  category TEXT  -- 'METAPHOR','ACRONYM','AGENCY','CONCEPT'
);

CREATE TABLE term_variants (
  id TEXT PRIMARY KEY,
  term_id TEXT REFERENCES canonical_terms(id),
  plan_id TEXT REFERENCES plans(id),
  variant_text TEXT NOT NULL,
  justification TEXT NOT NULL
);

-- Budget system (solves F4)
CREATE TABLE funding_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  origin_plan TEXT REFERENCES plans(id),
  total_available_low NUMERIC,   -- USD/year
  total_available_high NUMERIC,
  availability_start INT,        -- year (absolute, e.g. 2026)
  ramp_profile JSONB             -- {2026: 0, 2027: 30, 2028: 70, 2029: 100}
);

CREATE TABLE budget_claims (
  id TEXT PRIMARY KEY,
  plan_id TEXT REFERENCES plans(id),
  source_id TEXT REFERENCES funding_sources(id),
  amount_low NUMERIC NOT NULL,
  amount_high NUMERIC NOT NULL,
  period_start INT NOT NULL,
  period_end INT NOT NULL,
  notes TEXT,
  -- Computed: percentage_of_source = amount / source.total_available
  UNIQUE(plan_id, source_id, period_start)  -- one claim per source per period
);

-- Timeline (solves F3)
CREATE TABLE phases (
  id TEXT PRIMARY KEY,
  plan_id TEXT REFERENCES plans(id),
  name TEXT NOT NULL,
  phase_type TEXT CHECK (phase_type IN ('PRE','PHASE_0','PHASE_1','PHASE_2','PHASE_3','PHASE_4')),
  start_date DATE NOT NULL,     -- ABSOLUTE date
  end_date DATE NOT NULL,
  resource_demand JSONB         -- {engineers: 500, laws: 2, budget_usd_m: 300}
);

CREATE TABLE deliverables (
  id TEXT PRIMARY KEY,
  phase_id TEXT REFERENCES phases(id),
  name TEXT NOT NULL,
  available_at DATE NOT NULL
);

CREATE TABLE prerequisites (
  id TEXT PRIMARY KEY,
  phase_id TEXT REFERENCES phases(id),           -- phase that NEEDS
  deliverable_id TEXT REFERENCES deliverables(id), -- deliverable NEEDED
  required_by DATE NOT NULL
  -- Validation: deliverables.available_at <= prerequisites.required_by
);

-- Domain coverage (solves F5)
CREATE TABLE domains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  population_affected INT
);

CREATE TABLE plan_domain_coverage (
  plan_id TEXT REFERENCES plans(id),
  domain_id TEXT REFERENCES domains(id),
  coverage_quality TEXT CHECK (coverage_quality IN ('FULL','PARTIAL','FRAGMENTARY')),
  gap_analysis TEXT,
  PRIMARY KEY (plan_id, domain_id)
);

-- Failure modes (solves F6)
CREATE TABLE failure_modes (
  id TEXT PRIMARY KEY,
  plan_id TEXT REFERENCES plans(id),
  scenario TEXT NOT NULL,
  probability TEXT CHECK (probability IN ('LOW','MEDIUM','HIGH')),
  impact TEXT CHECK (impact IN ('LOW','MEDIUM','HIGH','CATASTROPHIC')),
  fallback TEXT NOT NULL,
  fallback_quality TEXT CHECK (fallback_quality IN ('FULL','PARTIAL','DEGRADED','NONE')),
  residual_risk TEXT
);

CREATE TABLE cascade_effects (
  id TEXT PRIMARY KEY,
  failure_mode_id TEXT REFERENCES failure_modes(id),
  affected_plan TEXT REFERENCES plans(id),
  severity TEXT CHECK (severity IN ('FATAL','SEVERE','HIGH','MEDIUM','LOW')),
  description TEXT NOT NULL
);

-- Adversarial profiles (solves F7)
CREATE TABLE adversarial_profiles (
  id TEXT PRIMARY KEY,
  plan_id TEXT REFERENCES plans(id),
  actor TEXT NOT NULL,           -- e.g. "FMI", "Big Tech", "lobby farmaceutico"
  threat_type TEXT NOT NULL,     -- LEGAL, FINANCIAL, MEDIA, GEOPOLITICAL, INSTITUTIONAL
  threat_description TEXT NOT NULL,
  countermeasure TEXT,
  countermeasure_quality TEXT CHECK (countermeasure_quality IN ('HIGH','MEDIUM','LOW','NONE'))
);

-- Legal requirements (part of F5)
CREATE TABLE legal_requirements (
  id TEXT PRIMARY KEY,
  plan_id TEXT REFERENCES plans(id),
  law_name TEXT NOT NULL,
  law_type TEXT CHECK (law_type IN ('NEW_LAW','REFORM','DECREE','CONSTITUTIONAL')),
  required_by DATE NOT NULL,
  quorum_type TEXT CHECK (quorum_type IN ('SIMPLE','ABSOLUTE','TWO_THIRDS','CONSTITUTIONAL')),
  legislative_period TEXT       -- e.g. "2026-S1" (Semestre 1 de 2026)
);

-- Validation results
CREATE TABLE validation_results (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,        -- e.g. "V-REF-01"
  severity TEXT CHECK (severity IN ('ERROR','WARNING','INFO')),
  plan_id TEXT REFERENCES plans(id),
  related_plan TEXT REFERENCES plans(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledgement_justification TEXT
);
```

---

## 7. REGLAS DE NEGOCIO DETALLADAS

### 7.1 Propagacion Retroactiva Automatica

**Cuando se agrega un nuevo plan al ecosistema:**

1. Todos los planes existentes que mencionan un conteo de mandatos reciben un validation error hasta que actualicen el conteo.
2. El sistema genera automaticamente una `IntegrationMatrix` actualizada para cada plan existente que incluya una entrada vacia para el nuevo plan.
3. Si el nuevo plan cubre un dominio que otros planes mencionan parcialmente (e.g., se crea PLANEN y PLANMON lo referenciaba como fantasma), el sistema resuelve las referencias fantasma y linkea al plan real.

### 7.2 Seccion de Integracion Autogenerada

Cada plan tiene una seccion de integracion que es **generada por el sistema**, no escrita a mano. Esta seccion contiene:

```markdown
## Integracion con el Ecosistema ¡BASTA! (16 Mandatos)

### Planes que dependen de [este plan]:
- PLANMON: necesita [SAPI como riel de pagos] para [Fase 1, 2027-Q1]
  Estado: disponible en [2027-Q3] → DESFASE 6 meses → Resolucion: [modo puente]
- PLAN24CN: necesita [datacenters soberanos] para [Fase 2, 2028]
  Estado: disponible en [2029] → DESFASE 12 meses → Resolucion: [infraestructura convencional]

### Planes de los que [este plan] depende:
- PLANJUS: necesita [resolucion de disputas] desde [Fase 0, 2026-Q1]
  Estado: disponible en [2026-Q1] → OK
- PLAN24CN: necesita [datacenters fisicos] para [escala, 2030]
  Estado: disponible en [2029] → OK

### Planes sin relacion declarada:
- PLANSAL: sin dependencia mutua declarada. Considere: [integracion salud-digital]
```

Esto elimina el problema de "PLANSAL no menciona a PLANSUS, PLANEB, PLANAGUA, PLANDIG" — la seccion de integracion se genera desde el grafo de dependencias, no desde la voluntad del autor.

### 7.3 Presupuesto Consolidado como Vista, No como Documento

No existe un "documento de presupuesto consolidado" separado. El presupuesto consolidado es una **vista calculada** a partir de las BudgetLines de todos los planes. Esto garantiza que:
- Siempre esta actualizado (no se desincroniza con los planes)
- Las dobles contabilidades se detectan en tiempo real
- Los cambios en un plan propagan inmediatamente al consolidado

### 7.4 Circuit Breakers Obligatorios

Cada plan debe declarar al menos un circuit breaker: una condicion medible que, si se cumple, detiene o pivotea el plan.

```
CircuitBreaker {
  condition:     "Si la adopcion del Pulso no alcanza 100K usuarios en 18 meses"
  action:        "Revertir a modo dual peso/Pulso y reevaluar arquitectura"
  kpi:           KPI.id    // linked to measurable metric
  threshold:     number
  evaluation_at: AbsoluteDate
}
```

---

## 8. SOLUCIONES ESPECIFICAS A CADA HALLAZGO DE AUDITORIA

### 8.1 Mapa de Hallazgos a Soluciones

| Hallazgo | Cod. Auditoria | Solucion en El Arquitecto |
|----------|---------------|---------------------------|
| Solo 17% de pares bidireccionales | C1 / Aud.01 | V-REF-01: bidireccionalidad por construccion. Las dependencias crean automaticamente la referencia inversa. |
| 10 de 16 planes con conteo obsoleto (original) | C1 / Aud.01 | V-REF-02: conteo auto-calculado. No es texto manual — es un campo computado. |
| "acero" en lugar de "plata" en 7 planes | C2 / Aud.02 | V-TERM-01: diccionario canonico con forbidden_values. El sistema rechaza "acero" en contexto de metafora del metal. |
| ¡BASTA! B=Bienestar vs B=Belleza | C7 / Aud.02 | V-TERM-02: acronimo unico. Solo una definicion permitida. |
| PLANEN referenciado 24+ veces pero no existe | C3 / Aud.01,04,05 | V-REF-03: planes fantasma prohibidos. No se puede referenciar un Plan.id inexistente. |
| Ahorro PLANREP contado 3+ veces | C4 / Aud.04 | V-FIN-01: anti-doble-contabilidad. Claims sobre una fuente no pueden sumar >100%. |
| "Excedentes" de Bastardas vs "cero ganancia" | C4 / Aud.04 | V-FIN-02: coherencia de principios. Si PLANEB declara "cero ganancia", no se permiten claims de excedentes. |
| PLANMON necesita Bastarda Financiera 2 anos antes | C6 / Aud.03 | V-TIME-01: prerequisito disponible. El sistema detecta el desfase y exige gap_resolution. |
| 11 planes en Fase 0 simultaneamente | C6 / Aud.03 | V-TIME-04: sobrecarga Year 0. Warning automatico cuando >6 planes lanzan simultaneamente. |
| PLANDIG punto unico de falla sin Plan B | C5 / Aud.05 | V-RES-01: punto unico de falla. ERROR si no tiene fallbacks documentados. |
| PLANSAL aislado (no menciona 6+ planes) | I4 / Aud.01 | V-COV-02: plan aislado. Warning si <3 dependencias bidireccionales. |
| Agencias con nombres inconsistentes | I5 / Aud.02 | V-TERM-03: nomenclatura de agencias. Warning si no sigue patron dominante. |
| Pisos constitucionales suman 2.5% PBI | C4 / Aud.04 | V-FIN-04: rigidez fiscal. Warning si pisos superan umbral. |
| ROI superpuesto entre planes | I3 / Aud.04 | V-FIN-05: ROI no duplicado. Warning si dos planes reclaman el mismo beneficio. |
| PLANGEO exporta PLANEDU sin evaluacion | I2 / Aud.03 | V-TIME-06: exportacion prematura. Warning si se exporta antes de tener evidencia. |
| Sin vehiculo politico | I1 / Aud.05 | V-COV-04: vehiculo politico. Warning si no existe plan de obtencion del poder. |
| Sin cascada legal unificada | I1 / Aud.05 | V-COV-05: cascada legal. Warning si >10 leyes sin priorizacion. |
| 6+ leyes al Congreso en el mismo semestre | C6 / Aud.03 | V-TIME-03: sobrecarga legislativa. Warning si >4 leyes en mismo semestre. |
| Energia sin plan (45M sin cobertura) | I1 / Aud.05 | V-COV-01: dominio critico descubierto. ERROR si dominio critico tiene coverage NONE. |
| Vivienda existente sin plan (45M) | I1 / Aud.05 | V-COV-03: poblacion descubierta. Warning si <90% poblacion cubierta. |
| PLANDIG sin Pre-Fase | C5 / Aud.03 | V-TIME-05: pre-fase obligatoria. Warning si plan complejo sin fase de preparacion. |
| Resistencia coordinada no modelada | V7 / Aud.06 | V-ADV-02: resistencia coordinada. Warning si >5 planes generan adversarios coordinables. |
| Estrategia publicada para adversarios | I2 / Aud.06 | V-ADV-03: informacion publicada. Warning si plan publicado contiene estrategia confrontativa futura. |

---

## 9. ROADMAP DE IMPLEMENTACION

### 9.1 Fases del Producto

| Fase | Nombre | Duracion | Entregable |
|------|--------|----------|-----------|
| **0** | **Foundation** | 4 semanas | Modelo de datos (Sec 2), schema SQL, API CRUD basica para Plans, Dependencies, Dictionary |
| **1** | **Validation Engine** | 6 semanas | Motor de reglas (Sec 3): todas las reglas V-REF, V-TERM, V-FIN, V-TIME, V-COV, V-RES, V-ADV. Ejecucion batch y en tiempo real. |
| **2** | **Consolidated Views** | 6 semanas | Grafo de dependencias interactivo, presupuesto consolidado, timeline Gantt, matriz de cobertura, auditor terminologico. |
| **3** | **Plan Editor** | 6 semanas | Editor estructurado con templates, autocompletado de terminos canonicos, declaracion de dependencias con validacion inline, seccion de integracion autogenerada. |
| **4** | **Adversarial & Cascade** | 4 semanas | Simulador adversarial, analisis de cascada de fallas, simulador "que pasa si Plan X falla/se retrasa". |
| **5** | **Document Generation** | 3 semanas | Generacion de documentos publicables (MD, PDF, HTML) desde la estructura de datos, incluyendo la seccion de integracion autogenerada. |
| **6** | **Migration** | 4 semanas | Importacion de los 16 PLANes existentes de ¡BASTA! al sistema. Ejecucion del motor de validacion. Generacion del primer informe de coherencia automatico. Comparacion con las 6 auditorias manuales para verificar que el sistema detecta los mismos problemas. |

**Total estimado:** ~33 semanas de desarrollo.

### 9.2 MVP (Minimum Viable Product)

Si hay restriccion de tiempo, el MVP es **Fase 0 + Fase 1 + Fase 6**: el modelo de datos, el motor de validacion, y la migracion de los planes existentes. Esto ya genera valor porque:
- Detecta automaticamente los problemas que las 6 auditorias encontraron manualmente
- Impide que nuevos planes se escriban con los mismos errores
- Genera el informe de coherencia que hoy no existe

Las vistas visuales (Fases 2-5) se agregan iterativamente.

---

## 10. METRICAS DE EXITO

### 10.1 KPIs del Sistema

| KPI | Definicion | Meta |
|-----|-----------|------|
| **Tasa de bidireccionalidad** | % de pares de planes con referencias bidireccionales | >95% (original: 17%; actual: 100% — 240/240 pares en 16 PLANes) |
| **Conteos sincronizados** | % de planes con conteo de mandatos correcto | 100% (original: 17%; actual: 100% — "dieciseis mandatos" en 16/16) |
| **Terminos consistentes** | % de terminos canonicos sin violacion | 100% (original: 42% por "acero"; actual: 100% — "plata" en 16/16) |
| **Presupuesto consolidado** | Suma de claims sobre cada fuente <=100% | 100% de fuentes balanceadas (original: 3+ sobrereclamadas; actual: resuelto — USD 283-526B consolidado) |
| **Cobertura de dominios criticos** | % de dominios criticos con al menos PARTIAL coverage | 100% (original: 77%; actual: 100% — PLANEN, PLANSEG, PLANVIV, PLANCUL escritos) |
| **Desfases temporales resueltos** | % de dependencias sin desfase temporal sin resolver | 100% (original: ~85%; actual: resuelto — puente bancario PLANMON-PLANEB documentado) |
| **Modos de falla documentados** | % de planes con al menos un FailureMode por dependencia critica | 100% |
| **Tiempo de deteccion de incoherencia** | Tiempo desde la introduccion de una incoherencia hasta su deteccion | <1 segundo (vs semanas/meses con auditorias manuales) |

---

## 11. CONSIDERACIONES DE SEGURIDAD Y ACCESO

### 11.1 Modelo de Permisos

| Rol | Puede hacer | No puede hacer |
|-----|------------|----------------|
| **Autor de Plan** | Editar su plan, declarar dependencias, resolver warnings | Editar otros planes, modificar diccionario canonico, ignorar errores |
| **Coordinador de Ecosistema** | Editar diccionario canonico, definir dominios criticos, configurar umbrales de reglas | Editar contenido de planes directamente |
| **Auditor** | Ver todo, generar informes, ejecutar simulaciones | Editar nada |
| **Administrador** | Todo | — |

### 11.2 Sensibilidad de los Datos

Los planes estrategicos nacionales son documentos sensibles. V-ADV-03 senala que publicar estrategias confrontativas permite a adversarios reaccionar preventivamente.

El sistema debe soportar:
- **Planes con status DRAFT/REVIEW**: solo visibles para roles autorizados
- **Planes con status PUBLISHED**: exportables como documentos publicos
- **Secciones clasificadas**: una seccion de un plan puede marcarse como "no publicable" (e.g., la hoja de ruta de confrontacion geopolitica)
- **Vista publica vs vista interna**: el sistema genera dos versiones del mismo plan — la publica (sin secciones clasificadas) y la interna (completa)

---

## 12. EXTENSIONES FUTURAS

### 12.1 Inteligencia Artificial

| Extension | Descripcion |
|----------|-----------|
| **Deteccion semantica de discrepancias** | Usar embeddings para detectar cuando dos planes dicen cosas contradictorias sobre el mismo tema, incluso sin usar las mismas palabras (e.g., "15 dias" vs "45 dias"). |
| **Sugerencia de sinergias** | Dado el contenido de dos planes, el LLM sugiere sinergias no declaradas: "PLANSAL habla de agua contaminada y PLANAGUA habla de remediacion — considere una dependencia." |
| **Generacion de escenarios adversariales** | Dado el perfil de perdedores de cada plan, el LLM genera escenarios de ataque coordinado y evalua la defensa. |
| **Drafting asistido** | El autor describe la intencion del plan y el LLM genera un primer borrador siguiendo el template estructurado, pre-cargando terminos canonicos y sugiriendo dependencias basadas en el dominio. |
| **Resolucion de conflictos** | Cuando V-FIN-01 detecta doble contabilidad, el LLM sugiere una distribucion alternativa de la fuente entre los planes reclamantes. |

### 12.2 Colaboracion Multi-Pais

Si el sistema demuestra valor, puede extenderse para:
- Ecosistemas de planes de multiples paises (la Red Soberana de PLANGEO)
- Dependencias trans-nacionales (e.g., Argentina necesita que Uruguay adopte el protocolo)
- Diccionarios canonicos compartidos entre paises aliados
- Grafos de dependencia inter-ecosistemas

### 12.3 Simulacion Monte Carlo

Agregar distribucion probabilistica a las BudgetLines y Timelines:
- En vez de "USD 15-25B/ano", modelar como distribucion normal(20B, stdev=5B)
- Correr 10.000 simulaciones de la cascada temporal
- Calcular: "Probabilidad de que el ecosistema se complete antes de 2040: 34%"
- Identificar las variables con mayor impacto en la probabilidad de exito

---

## 13. APENDICE: REGLAS DE VALIDACION — REFERENCIA COMPLETA

### 13.1 Tabla Maestra

| ID | Clase | Nombre | Severidad | Condicion de disparo |
|----|-------|--------|-----------|---------------------|
| V-REF-01 | Referencial | Bidireccionalidad | ERROR | Dep. de A→B sin entrada inversa en B |
| V-REF-02 | Referencial | Conteo de mandatos | ERROR | Plan dice "N mandatos" y hay M (N≠M) |
| V-REF-03 | Referencial | Plan fantasma | ERROR | Referencia a Plan.id inexistente |
| V-REF-04 | Referencial | Integridad de citas | WARNING | Plan A describe integracion con B, B no tiene protocolo correspondiente |
| V-REF-05 | Referencial | Discrepancias descriptivas | WARNING | Dos planes dan datos diferentes sobre el mismo deliverable |
| V-TERM-01 | Terminologica | Termino prohibido | ERROR | Uso de valor en forbidden_values de un CanonicalTerm |
| V-TERM-02 | Terminologica | Acronimo unico | ERROR | Dos definiciones para el mismo acronimo |
| V-TERM-03 | Terminologica | Nomenclatura agencias | WARNING | Agencia no sigue patron dominante sin justificacion |
| V-TERM-04 | Terminologica | Tablero Nacional | WARNING | Uso de "Dashboard" en vez de "Tablero Nacional" |
| V-TERM-05 | Terminologica | Estructura documental | WARNING | Seccion requerida ausente sin justificacion |
| V-TIME-01 | Temporal | Prerequisito disponible | ERROR | Deliverable no disponible cuando se necesita |
| V-TIME-02 | Temporal | Circularidad | WARNING | Dependencia circular A→B→A sin resolucion |
| V-TIME-03 | Temporal | Sobrecarga legislativa | WARNING | >4 leyes en mismo semestre |
| V-TIME-04 | Temporal | Sobrecarga Year 0 | WARNING | >6 planes en Fase 0 simultanea |
| V-TIME-05 | Temporal | Pre-Fase obligatoria | WARNING | Plan con >3 deps. criticas sin Pre-Fase |
| V-TIME-06 | Temporal | Exportacion prematura | WARNING | Exportacion sin evaluacion de impacto |
| V-FIN-01 | Financiera | Anti-doble-contabilidad | ERROR | Claims sobre fuente >100% |
| V-FIN-02 | Financiera | Coherencia de principios | ERROR | Excedentes reclamados de fuente "sin ganancia" |
| V-FIN-03 | Financiera | Fuente disponible | WARNING | Reclamo antes de disponibilidad de fuente |
| V-FIN-04 | Financiera | Pisos constitucionales | WARNING | Suma pisos >2% PBI |
| V-FIN-05 | Financiera | ROI no duplicado | WARNING | Mismo beneficio reclamado por 2+ planes |
| V-FIN-06 | Financiera | Rango excesivo | WARNING | Rango alto/bajo >3x |
| V-FIN-07 | Financiera | Fuente inexistente | ERROR | Reclamo de fuente de plan fantasma |
| V-COV-01 | Cobertura | Dominio critico | ERROR | Dominio critico sin plan |
| V-COV-02 | Cobertura | Plan aislado | WARNING | <3 dependencias bidireccionales |
| V-COV-03 | Cobertura | Poblacion descubierta | WARNING | <90% poblacion cubierta en dominio |
| V-COV-04 | Cobertura | Vehiculo politico | WARNING | Sin plan de obtencion del poder |
| V-COV-05 | Cobertura | Cascada legal | WARNING | >10 leyes sin priorizacion |
| V-RES-01 | Resiliencia | Punto unico de falla | ERROR | Plan es dep. critica de 3+ planes sin fallback |
| V-RES-02 | Resiliencia | Cadena de falla | WARNING | Cadena de 4+ eslabones criticos |
| V-RES-03 | Resiliencia | Plan sin Plan B | WARNING | Sin FailureMode documentado |
| V-RES-04 | Resiliencia | Degradacion gradual | WARNING | Todos fallbacks = NONE |
| V-ADV-01 | Adversarial | Perdedores identificados | WARNING | Sin campo "losers" |
| V-ADV-02 | Adversarial | Resistencia coordinada | WARNING | >5 planes con adversarios coordinables |
| V-ADV-03 | Adversarial | Info publicada | WARNING | Estrategia confrontativa visible antes de ejecucion |
| V-ADV-04 | Adversarial | Ciclo politico | WARNING | Implementacion >8 anos |

---

## 14. CONCLUSION

El Arquitecto no es un procesador de texto con validaciones. Es un **entorno de diseno de sistemas nacionales** donde la coherencia es una propiedad emergente de la estructura, no del esfuerzo humano.

Las 7 clases de falla detectadas en ¡BASTA! no son errores de inteligencia — son errores de herramientas. Un equipo que produce un diseno conceptual de 9.5/10 merece un entorno que produzca una ejecucion documental de 9/10. La brecha remanente entre ambos es el problema que este sistema resuelve.

**El objetivo final:** Que sea **estructuralmente imposible** publicar un ecosistema de planes con:
- Referencias huerfanas
- Terminos contradictorios
- Presupuestos con doble contabilidad
- Dependencias temporales rotas
- Dominios criticos descubiertos
- Puntos unicos de falla sin contingencia
- Estrategias confrontativas visibles sin proteccion

Si las 6 auditorias de ¡BASTA! se ejecutan como reglas automaticas, los problemas se detectan en el momento de escribir — no semanas despues, cuando la fractura ya se propago a 16 documentos.

---

*PDR producido como sintesis de 6 auditorias especializadas sobre el ecosistema ¡BASTA! (16 PLANes). Cada regla de validacion corresponde a un hallazgo concreto documentado con citas textuales y numeros de linea.*

*El sistema propuesto convierte la inspeccion reactiva en prevencion proactiva: no audita documentos terminados — impide que los errores se cometan.*

*Nota: Las 7 clases de falla (F1-F7) fueron resueltas manualmente durante marzo de 2026. El Arquitecto automatizaria la prevencion de recurrencias a medida que el ecosistema crece mas alla de 16 PLANes.*
