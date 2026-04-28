# Plan de Remediación de la Auditoría Estratégica 2026-04-26

> **Para ejecutores agénticos:** Este plan se ejecuta tarea por tarea con checkboxes (`- [ ]`). Cada tarea produce un artefacto concreto, verificable y commiteable de forma independiente.

**Goal:** Convertir la biblioteca de 22 PLANes + PLANRUTA en un portfolio gobernable: un registro canónico, un libro mayor presupuestario, una cascada legal recomputada, una hoja de ruta que respeta la matriz de misiones, un grafo de dependencias estructurado, un registro de riesgo, y compuertas kill/scale por cada PLAN.

**Architecture:** Trabajamos en `Iniciativas Estratégicas/`. No creamos nuevos PLANes (freeze). Creamos artefactos de control (registro, libro mayor, RACI, PEO), recomputamos los soportes obsoletos (cascada legal, protocolos, hoja de ruta, análisis de conexiones), y aplicamos un parche estandarizado a cada uno de los 23 archivos `PLAN*.md` (tranche marker, "lo que no haremos en fase 1", kill/scale gates, top-3 adversarial, métrica pública).

**Fuente única de verdad:** `FULL_STRATEGIC_AUDIT_2026-04-26.md`. Donde haya conflicto entre la auditoría y un soporte previo, gana la auditoría. Donde la matriz de misiones (`MATRIZ_MISIONES_Y_PLANES_ES.md`) clasifique un PLAN, gana la matriz para sequenciar.

**Convenciones de archivo:**
- `STATUS: current | superseded | historical | supporting` en frontmatter de TODO doc de soporte.
- `MANDATE_COUNT: 22 thematic + PLANRUTA protocol` — frase canónica.
- Fechas absolutas siempre (no "Año 1", sino "2026-2027" donde sea viable).
- Idioma: castellano rioplatense, salvo nombres técnicos.

**Principio rector (de la auditoría):** *"Minimum viable state capacity"* — toda acción de fase 1 debe funcionar con instituciones débiles, baja confianza y datos parciales.

---

## Inventario de archivos a tocar

### Crear (artefactos nuevos de control)
- `Iniciativas Estratégicas/PLAN_REGISTRY.yml` — registro canónico
- `Iniciativas Estratégicas/SOURCE_OF_FUNDS_LEDGER.md` — libro mayor único
- `Iniciativas Estratégicas/RACI_MATRIX.md` — responsabilidades por dependencia
- `Iniciativas Estratégicas/PORTFOLIO_EXECUTION_OFFICE.md` — diseño PEO
- `Iniciativas Estratégicas/portfolio_risk_register.md` — riesgos por PLAN y transversales
- `Iniciativas Estratégicas/DEPENDENCY_GRAPH.yml` — grafo estructurado
- `Iniciativas Estratégicas/KILL_SCALE_GATES.md` — compuertas por PLAN
- `Iniciativas Estratégicas/PRIMER_TRANCHE_24M.md` — paquete de gobierno inicial
- `Iniciativas Estratégicas/PLATAFORMA_PUBLICA_5_MISIONES.md` — narrativa pública
- `Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md` — top-3 attack paths gates
- `Iniciativas Estratégicas/PIA/` (carpeta) con plantilla + PIAs por plan sensible
- `Iniciativas Estratégicas/LEGAL_OPINIONS/` (carpeta) con opiniones por PLAN de alto riesgo
- `Iniciativas Estratégicas/COVERAGE_GAPS_ASSIGNMENTS.md` — asignación de huecos a PLANes existentes
- `Iniciativas Estratégicas/COALITION_MAP.md` — mapa de aliados (complementa adversarial)
- `Iniciativas Estratégicas/BASELINES_REFRESH_2026.md` — chequeo de PBI/leyes/datos
- `Iniciativas Estratégicas/PLAYBOOK_REVISION_PROFUNDA.md` — protocolo editorial 13 pasos por PLAN
- `Iniciativas Estratégicas/REVISION_PROFUNDA_REPORT.md` — reporte final de revisión profunda + sweeps
- `Iniciativas Estratégicas/STRESS_TESTS_TRANCHE_1.md` — stress tests por PLAN del primer tranche
- `Iniciativas Estratégicas/PLANDIG_ESTADIOS_INTERNOS.md` — estadios internos de PLANDIG (estadio A núcleo tranche-1 + estadio B capacidades soberanas diferidas), todo dentro del mismo PLAN. **No es un split**: PLANDIG sigue siendo un solo PLAN.
- `Iniciativas Estratégicas/REMEDIATION_CLOSEOUT_2026-04-26.md` — cierre de remediación

### Modificar (recomputar / actualizar)
- `MATRIZ_MISIONES_Y_PLANES_ES.md` — marcar como vinculante
- `CASCADA_LEGAL_BASTA.md` — recomputar a 22 plans + paquete legal mínimo viable
- `HOJA_DE_RUTA_CONSOLIDADA_BASTA.md` — reemplazar lógica dual con roadmap único
- `PROTOCOLOS_OPERATIVOS_BASTA.md` — actualizar de 16 → 22 mandatos
- `PRESUPUESTO_CONSOLIDADO_BASTA.md` — reconciliar tablas de % PBI
- `ANALISIS_CONEXIONES_20_PLANES.md` — renombrar y normalizar conteo
- `MASTER_COHERENCE_REPORT.md` — purgar contradicción "23er mandato"
- `TABLA_AGENCIAS_BASTA.md` — reclasificar agencias → execution cells
- `SIMULACION_ADVERSARIAL_BASTA.md` — convertir escenarios en gates
- `BLINDAJE_INSTITUCIONAL_BASTA.md` — alinear con RACI + PEO
- `VEHICULO_POLITICO_BASTA.md` — separar doctrina interna de plataforma pública
- `PLAN_MAESTRO_RECONSTRUCCION_ARGENTINA_ES.md` — alinear con primer tranche
- `ARQUITECTURA_PLATAFORMA_CIVICA_Y_NARRATIVA_ES.md` — reescribir como 5 misiones
- `PLANRUTA_Argentina_ES.md` — convertir en protocolo de readiness vinculante (Fase 13 light + 13.B.1 deep)
- 22 archivos `PLAN*_Argentina_ES.md` — parche estandarizado (Fase 13) + revisión editorial profunda PLAN por PLAN (Fase 13.B) + sweeps de coherencia cruzada (Fase 13.C)

### Limpiar / archivar
- `PLANISV_Argentina_ES.docx` — mover a `audit/legacy/`
- `PLANISV_raw.txt` — mover a `audit/legacy/`

---

## Fase 0 — Preparación (1 sesión)

### Tarea 0.1: Crear estructura de carpetas

**Files:**
- Create: `Iniciativas Estratégicas/audit/legacy/`
- Create: `Iniciativas Estratégicas/PIA/`
- Create: `Iniciativas Estratégicas/LEGAL_OPINIONS/`

- [ ] **Step 1: Crear las 3 carpetas**

```bash
cd "/Users/juanb/Desktop/ElInstantedelHombreGris/Iniciativas Estratégicas"
mkdir -p audit/legacy PIA LEGAL_OPINIONS
```

- [ ] **Step 2: Mover artefactos duplicados**

```bash
mv PLANISV_Argentina_ES.docx audit/legacy/
mv PLANISV_raw.txt audit/legacy/
```

- [ ] **Step 3: Verificar**

```bash
ls audit/legacy/  # debe mostrar PLANISV_Argentina_ES.docx y PLANISV_raw.txt
ls PIA LEGAL_OPINIONS  # vacíos
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(iniciativas): create control folders + archive PLANISV legacy artifacts"
```

---

## Fase 1 — Registro Canónico y Reparación de Drift (C2)

### Tarea 1.1: Crear `PLAN_REGISTRY.yml`

**Files:**
- Create: `Iniciativas Estratégicas/PLAN_REGISTRY.yml`

- [ ] **Step 1: Escribir el registro**

Estructura: una entrada por PLAN. Para cada uno, llenar `code`, `title`, `version`, `status` (current/draft/deferred/research), `phase` (tranche-1, tranche-2, deferred, research), `owner` (a definir; usar `TBD-{PEO-asignar}` permitido SOLO en este campo), `mission_matrix` (Verde/Ámbar/Rojo según `MATRIZ_MISIONES_Y_PLANES_ES.md`), `dependencies` (lista de códigos), `budget_class` (XS/S/M/L/XL), `legal_instruments` (lista nominal), `public_visibility` (interno/plataforma/ambos), `last_updated` (2026-04-22 para los thematic, 2026-03-31 para PLANRUTA).

Plantilla a usar:

```yaml
# PLAN_REGISTRY.yml — Fuente única de verdad de la arquitectura ¡BASTA!
# Generado: 2026-04-26 a partir de FULL_STRATEGIC_AUDIT_2026-04-26.md
# Conteo canónico: 22 thematic + PLANRUTA protocol

architecture:
  thematic_count: 22
  protocol: PLANRUTA
  total_documents: 23
  freeze_status: ACTIVE  # No new PLANes hasta cierre del primer tranche

plans:
  - code: PLANAGUA
    title: Agua, Saneamiento y Cuencas
    version: 2026-04
    status: current
    phase: tranche-1
    mission_matrix: Verde
    budget_class: L
    public_visibility: ambos
    owner: TBD-PEO-asignar
    dependencies: [PLANDIG, PLANISV, PLANTER]
    legal_instruments:
      - Ley marco de Agua y Cuencas
      - Decreto reglamentario de cánones de uso
    last_updated: 2026-04-22

  - code: PLANVIV
    title: Vivienda y Ciudad Existente
    version: 2026-04
    status: current
    phase: tranche-1
    mission_matrix: Verde
    budget_class: XL
    public_visibility: ambos
    owner: TBD-PEO-asignar
    dependencies: [PLANDIG, PLANTER, PLANISV]
    legal_instruments:
      - Ley de Vivienda y Suelo Urbano
      - Reforma del FONAVI
    last_updated: 2026-04-22

  # Repetir para: PLANSAL, PLANSEG, PLANDIG (un solo PLAN con estadios internos), PLANISV,
  # PLANEB, PLANREP, PLANEN, PLANEDU, PLANCUL, PLANJUS, PLANSUS, PLANMON, PLANGEO,
  # PLAN24CN, PLANMESA, PLANTALLER, PLANCUIDADO, PLANMEMORIA, PLANTER, PLANMOV
  # + PLANRUTA como protocol (no plan)

protocol:
  - code: PLANRUTA
    title: Protocolo de Bootstrap, Readiness y Secuenciación
    version: 2026-03
    status: current
    role: bootstrap_protocol
    binding: true
    last_updated: 2026-03-31

support_documents:
  - file: MATRIZ_MISIONES_Y_PLANES_ES.md
    status: current
    role: binding_prioritization
  - file: CASCADA_LEGAL_BASTA.md
    status: superseded  # 16-mandate base; recomputar en Fase 6
    successor: CASCADA_LEGAL_BASTA.md (post-fase-6)
  - file: PROTOCOLOS_OPERATIVOS_BASTA.md
    status: superseded
    successor: PROTOCOLOS_OPERATIVOS_BASTA.md (post-fase-15)
  - file: HOJA_DE_RUTA_CONSOLIDADA_BASTA.md
    status: superseded
    successor: HOJA_DE_RUTA_CONSOLIDADA_BASTA.md (post-fase-2)
  - file: ANALISIS_CONEXIONES_20_PLANES.md
    status: superseded
    successor: ANALISIS_CONEXIONES_22_PLANES.md
  - file: PRESUPUESTO_CONSOLIDADO_BASTA.md
    status: superseded
    successor: SOURCE_OF_FUNDS_LEDGER.md
  - file: TABLA_AGENCIAS_BASTA.md
    status: superseded
    successor: TABLA_AGENCIAS_BASTA.md (post-fase-5)
  - file: SIMULACION_ADVERSARIAL_BASTA.md
    status: current
    transformation_pending: convert to readiness gates (Fase 7)
  - file: BLINDAJE_INSTITUCIONAL_BASTA.md
    status: supporting
  - file: VEHICULO_POLITICO_BASTA.md
    status: supporting
  - file: GUIA_DE_VOZ_HOMBRE_GRIS_APLICADA_A_RECONSTRUCCION_ES.md
    status: current
  - file: ARQUITECTURA_PLATAFORMA_CIVICA_Y_NARRATIVA_ES.md
    status: superseded
    successor: PLATAFORMA_PUBLICA_5_MISIONES.md
  - file: PLAN_MAESTRO_RECONSTRUCCION_ARGENTINA_ES.md
    status: supporting
  - file: MASTER_PLAN HOUSING OS.md
    status: supporting
  - file: MASTER_COHERENCE_REPORT.md
    status: superseded
    successor: MASTER_COHERENCE_REPORT.md (post-fase-15)
  - file: PDR_NATIONAL_PLAN_SYSTEM.md
    status: supporting
  - file: FIRST_PRINCIPLES_STRATEGIC_REVIEW_EN.md
    status: historical
  - file: TEMPLATE_INTERCONEXIONES.md
    status: current
  - file: FULL_STRATEGIC_AUDIT_2026-04-26.md
    status: current
    role: source_of_truth
```

- [ ] **Step 2: Verificar conteo**

```bash
grep -c "^  - code:" "Iniciativas Estratégicas/PLAN_REGISTRY.yml"
# Esperado: 22 (thematic) + 1 (protocol) = 23 entries en plans+protocol
```

- [ ] **Step 3: Verificar nombres canónicos**

```bash
for code in PLANAGUA PLANVIV PLANSAL PLANSEG PLANDIG PLANISV PLANEB PLANREP PLANEN PLANEDU PLANCUL PLANJUS PLANSUS PLANMON PLANGEO PLAN24CN PLANMESA PLANTALLER PLANCUIDADO PLANMEMORIA PLANTER PLANMOV PLANRUTA; do
  grep -q "code: $code" "Iniciativas Estratégicas/PLAN_REGISTRY.yml" || echo "FALTA: $code"
done
# No debe imprimir nada
```

- [ ] **Step 4: Commit**

```bash
git add "Iniciativas Estratégicas/PLAN_REGISTRY.yml"
git commit -m "feat(iniciativas): add PLAN_REGISTRY.yml as canonical source of truth"
```

### Tarea 1.2: Insertar frontmatter `STATUS:` en cada documento de soporte

**Files (modificar inicio de cada uno):**
- `MATRIZ_MISIONES_Y_PLANES_ES.md`
- `CASCADA_LEGAL_BASTA.md`
- `PROTOCOLOS_OPERATIVOS_BASTA.md`
- `HOJA_DE_RUTA_CONSOLIDADA_BASTA.md`
- `ANALISIS_CONEXIONES_20_PLANES.md`
- `PRESUPUESTO_CONSOLIDADO_BASTA.md`
- `TABLA_AGENCIAS_BASTA.md`
- `SIMULACION_ADVERSARIAL_BASTA.md`
- `BLINDAJE_INSTITUCIONAL_BASTA.md`
- `VEHICULO_POLITICO_BASTA.md`
- `ARQUITECTURA_PLATAFORMA_CIVICA_Y_NARRATIVA_ES.md`
- `MASTER_COHERENCE_REPORT.md`
- `FIRST_PRINCIPLES_STRATEGIC_REVIEW_EN.md`

- [ ] **Step 1: Insertar bloque al inicio de cada uno**

Bloque a insertar después del título H1 (debajo de la primera línea `# ...`):

```markdown
> **STATUS:** {current | superseded | historical | supporting}
> **CANONICAL_ARCHITECTURE:** 22 thematic + PLANRUTA protocol
> **REGISTRY:** ver `PLAN_REGISTRY.yml`
> **SUCCESSOR (si superseded):** {nombre del archivo sucesor o "ver registro"}
> **LAST_AUDIT:** 2026-04-26
```

Mapeo exacto de status (de `PLAN_REGISTRY.yml` Tarea 1.1):
- current: MATRIZ, SIMULACION, GUIA_DE_VOZ, TEMPLATE, FULL_STRATEGIC_AUDIT
- superseded: CASCADA, PROTOCOLOS, HOJA_DE_RUTA, ANALISIS_CONEXIONES, PRESUPUESTO, TABLA_AGENCIAS, ARQUITECTURA, MASTER_COHERENCE
- supporting: BLINDAJE, VEHICULO, PLAN_MAESTRO_RECONSTRUCCION, MASTER_PLAN_HOUSING_OS, PDR_NATIONAL_PLAN_SYSTEM
- historical: FIRST_PRINCIPLES_STRATEGIC_REVIEW_EN

- [ ] **Step 2: Verificar**

```bash
cd "/Users/juanb/Desktop/ElInstantedelHombreGris/Iniciativas Estratégicas"
for f in MATRIZ_MISIONES_Y_PLANES_ES.md CASCADA_LEGAL_BASTA.md PROTOCOLOS_OPERATIVOS_BASTA.md HOJA_DE_RUTA_CONSOLIDADA_BASTA.md ANALISIS_CONEXIONES_20_PLANES.md PRESUPUESTO_CONSOLIDADO_BASTA.md TABLA_AGENCIAS_BASTA.md SIMULACION_ADVERSARIAL_BASTA.md BLINDAJE_INSTITUCIONAL_BASTA.md VEHICULO_POLITICO_BASTA.md ARQUITECTURA_PLATAFORMA_CIVICA_Y_NARRATIVA_ES.md MASTER_COHERENCE_REPORT.md FIRST_PRINCIPLES_STRATEGIC_REVIEW_EN.md; do
  grep -q "STATUS:" "$f" || echo "FALTA STATUS: $f"
done
```

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/"
git commit -m "chore(iniciativas): add STATUS frontmatter to all support docs per registry"
```

### Tarea 1.3: Normalizar conteo de mandatos en docs vivos

**Files:**
- Modify: `ANALISIS_CONEXIONES_20_PLANES.md` (renombrar)
- Modify: `MASTER_COHERENCE_REPORT.md` (purgar "23er mandato")

- [ ] **Step 1: Renombrar archivo de análisis**

```bash
cd "/Users/juanb/Desktop/ElInstantedelHombreGris/Iniciativas Estratégicas"
git mv ANALISIS_CONEXIONES_20_PLANES.md ANALISIS_CONEXIONES_22_PLANES.md
```

- [ ] **Step 2: Reemplazar todas las referencias**

```bash
sed -i '' 's/20 PLANes/22 PLANes/g; s/20 planes/22 planes/g; s/21 mandatos/22 mandatos/g; s/20 mandatos/22 mandatos/g' ANALISIS_CONEXIONES_22_PLANES.md
```

- [ ] **Step 3: Editar `MASTER_COHERENCE_REPORT.md`**

Buscar y reemplazar la frase contradictoria sobre PLANMOV como "vigesimo tercer mandato". Reemplazar con: *"PLANMOV es el 22° plan temático del ecosistema canónico (22 thematic + PLANRUTA protocol)."*

Buscar las cadenas: `vigesimo tercer mandato`, `23er mandato`, `mandato 23`. Edit cada una a la frase canónica.

- [ ] **Step 4: Auditar referencias a "16 mandatos" / "20 mandatos" / "21 mandatos" en docs current**

```bash
grep -l "16 mandato\|16 Mandato\|20 mandato\|21 mandato" *.md | grep -v audit/
# Para cada archivo current/superseded reportado, agregar nota inline:
# > **NOTA AUDITORÍA 2026-04-26:** El conteo "16 mandatos" corresponde a versión obsoleta. Conteo canónico: 22 thematic + PLANRUTA. Ver `PLAN_REGISTRY.yml`.
```

- [ ] **Step 5: Actualizar PLAN_REGISTRY.yml**

Cambiar la entrada `ANALISIS_CONEXIONES_20_PLANES.md` → `ANALISIS_CONEXIONES_22_PLANES.md`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix(iniciativas): normalize mandate counts to canonical 22+PLANRUTA, rename analysis file"
```

---

## Fase 2 — Matriz de Misiones Vinculante + Hoja de Ruta Recomputada (C3, C1)

### Tarea 2.1: Marcar `MATRIZ_MISIONES_Y_PLANES_ES.md` como vinculante

**Files:**
- Modify: `MATRIZ_MISIONES_Y_PLANES_ES.md`

- [ ] **Step 1: Insertar sección vinculante al tope (debajo del frontmatter STATUS)**

Texto a insertar:

```markdown
## Carácter Vinculante (post-auditoría 2026-04-26)

Esta matriz es **vinculante** para sequenciación. Reglas:

1. **Ningún PLAN clasificado `Rojo` puede tener launch operativo en el primer tranche (primeros 24 meses).** Solo investigación, diseño, o pilotos contenidos.
2. **PLANes `Ámbar` deben simplificarse o dividirse antes de ingresar al primer tranche.**
3. **Solo PLANes `Verde` o `Verde a Ámbar` con simplificación documentada pueden integrar el paquete inicial de gobierno.**
4. **El PEO (Portfolio Execution Office) es responsable de aplicar esta matriz al recomputar la hoja de ruta.**

Conflictos con `HOJA_DE_RUTA_CONSOLIDADA_BASTA.md` se resuelven a favor de esta matriz hasta que la hoja de ruta sea recomputada (Fase 2 de remediación).
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/MATRIZ_MISIONES_Y_PLANES_ES.md"
git commit -m "feat(matriz): mark mission matrix as binding for sequencing"
```

### Tarea 2.2: Recomputar `HOJA_DE_RUTA_CONSOLIDADA_BASTA.md`

**Files:**
- Modify (replace body): `HOJA_DE_RUTA_CONSOLIDADA_BASTA.md`

- [ ] **Step 1: Leer la hoja de ruta actual**

```bash
wc -l "Iniciativas Estratégicas/HOJA_DE_RUTA_CONSOLIDADA_BASTA.md"
```

- [ ] **Step 2: Reemplazar el cuerpo con la nueva estructura**

Mantener el frontmatter STATUS (que ahora se vuelve `current` ya que reemplazamos). Cambiar `STATUS: superseded` → `STATUS: current` y borrar `SUCCESSOR`. Reemplazar el cuerpo con esta estructura:

```markdown
## Principios de Secuenciación (post-auditoría)

- La matriz de misiones es vinculante (`MATRIZ_MISIONES_Y_PLANES_ES.md`).
- Ningún PLAN `Rojo` arranca en tranche-1.
- Cada wave introduce máximo 2 leyes nuevas y máximo 1 PLAN nuevo a operación.
- Antes de cualquier launch, su PIA, opinión legal y top-3 adversarial deben estar firmados.

## Tranche-1 (Meses 0–24, ventana 2026-05 a 2028-05)

| Mes | PLAN | Acción | Misión | Pre-requisitos |
|-----|------|--------|--------|----------------|
| 0–6  | PLANRUTA | Activar protocolo readiness | Protocolo | Ninguno |
| 0–6  | PLANDIG | Identidad-lite, datos públicos, audit logs | Verde | PEO operativo |
| 0–6  | PLANAGUA | Reparación de emergencia + mapeo de contaminación | Verde | Censo de cuencas críticas |
| 0–6  | PLANSAL | APS + medicamentos esenciales + materno-infantil | Verde | Stock auditado |
| 0–12 | PLANEDU | Alfabetización + asistencia + apoyo docente | Verde | Censo escolar |
| 0–12 | PLANVIV | Retrofit + alquileres + hogares críticos | Verde | RENABAP refresh |
| 6–18 | PLANISV | 50–300 pilotos de suelo medidos | Verde | Convenio INTA |
| 12–24| PLANEB | 1–2 Bastardas piloto bajo riesgo | Verde | Marco contable transparente |

## Tranche-2 (Meses 24–48, ventana 2028-05 a 2030-05)

| Mes | PLAN | Acción | Misión | Gate de entrada |
|-----|------|--------|--------|-----------------|
| 24–36 | PLANREP | Pilotos voluntarios + atrición | Ámbar | Demanda real verificada |
| 24–36 | PLANSEG | Estabilización + mando + integridad | Ámbar | Auditoría de fuerzas |
| 24–36 | PLANMESA | Piloto deliberativo de portfolio | Verde | PEO maduro |
| 24–36 | PLANTALLER | Pilotos certificados con seguro | Verde | Estándares de seguridad firmados |
| 24–36 | PLANCUIDADO | Registro y soporte limitados | Verde | PIA aprobado |
| 36–48 | PLANEN | Nodos de resiliencia + datos energéticos abiertos | Ámbar | Tranche-1 cumplido |
| 36–48 | PLANCUL | Atado a escuelas/memoria/cuidado | Verde | Métricas de servicio |

## Tranche-3 (Meses 48+, ventana 2030+) — sujeto a confianza visible

| PLAN | Condición de activación |
|------|-------------------------|
| PLANJUS (piloto) | PLANSEG estabilizado + PIA aprobado |
| PLANTER (fase 1: enforcement ambiental + auditoría regalías + pilotos consulta) | Sin litigios pendientes federales mayores |
| PLANMOV (fase básica: movilidad + flete ferroviario + AMBA gobernanza) | Tranche-2 cerrado + procurement OS operativo |
| PLANMEMORIA (memoria de política pública) | PEO + PIA |
| PLANGEO (diplomacia sobria) | Solo análisis interno hasta gobierno operativo |

## Diferidos (sin ventana hasta nueva auditoría)

- `PLANMON` — solo laboratorio monetario, sin rollout nacional.
- `PLANSUS` (cascada completa) — solo investigación + reducción de daños.
- `PLAN24CN` — labs de diseño, sin construcción.
- `PLANGEO` confrontacional — material privado.
- Capacidades soberanas dentro de PLANDIG (sovereign cloud, frontier AI, SAPI completo, gemelo digital, gobernanza algorítmica, rieles monetarios) — diferidas a tranche-3+.
- `PLANMOV` régimen AV completo — diferido.

## Reglas de promoción entre tranches

Un PLAN solo avanza al siguiente tranche si:
1. Su fase actual cumplió métricas durante 24 meses continuos.
2. Su gate kill/scale firmó "scale" (ver `KILL_SCALE_GATES.md`).
3. Su top-3 adversarial tiene mitigaciones operativas.
4. Su impacto fiscal está en el `SOURCE_OF_FUNDS_LEDGER.md` con confianza ≥ media.

## Conflictos con la versión anterior

Esta versión reemplaza la lógica dual (16-plan base + 22-plan addendum). Cualquier referencia previa a "Año 0/1/2/3" se reinterpreta a través de las ventanas de meses absolutos especificadas arriba.
```

- [ ] **Step 3: Verificar**

```bash
grep -c "Tranche-" "Iniciativas Estratégicas/HOJA_DE_RUTA_CONSOLIDADA_BASTA.md"
# Esperado: ≥ 4
grep "PLANMON\|PLAN24CN\|PLANSUS" "Iniciativas Estratégicas/HOJA_DE_RUTA_CONSOLIDADA_BASTA.md" | grep -i "tranche-1"
# No debe encontrar nada
```

- [ ] **Step 4: Actualizar registro**

Cambiar `HOJA_DE_RUTA_CONSOLIDADA_BASTA.md` a `status: current` en `PLAN_REGISTRY.yml`.

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/HOJA_DE_RUTA_CONSOLIDADA_BASTA.md" "Iniciativas Estratégicas/PLAN_REGISTRY.yml"
git commit -m "feat(roadmap): rebuild consolidated roadmap honoring binding mission matrix"
```

---

## Fase 3 — Consolidación Fiscal (C4)

### Tarea 3.1: Crear `SOURCE_OF_FUNDS_LEDGER.md`

**Files:**
- Create: `Iniciativas Estratégicas/SOURCE_OF_FUNDS_LEDGER.md`

- [ ] **Step 1: Escribir el libro mayor con la siguiente estructura**

```markdown
# Libro Mayor de Fuentes de Fondos — ¡BASTA!

> **STATUS:** current
> **REPLACES:** PRESUPUESTO_CONSOLIDADO_BASTA.md (mantener como histórico)
> **PRINCIPIO:** una fuente, un dueño, una fecha de disponibilidad, una calificación de confianza.

## Reglas

1. Cada fuente aparece **una vez**. Sin doble conteo entre PLANes.
2. Cada fuente tiene clasificación: `gross_investment | public_net_cost | private_cooperative_capital | debt_financing | reassignment | future_return`.
3. Cada fuente tiene calificación de confianza: `alta | media | baja | especulativa`.
4. Retornos futuros NO se cuentan como fuente disponible para tranche-1.
5. Las reasignaciones requieren ley o decreto firmado para subir a `alta`.

## Tope fiscal del primer tranche (24 meses)

**Tope duro:** **3.5% del PBI anual incremental** sobre la base 2025, sumado por los 24 meses. Ningún PLAN escala su gasto si el agregado del portfolio supera este tope.

## Tabla maestra de fuentes

| ID | Fuente | Clase | Confianza | Disponibilidad | Dueño | PLANes consumidores |
|----|--------|-------|-----------|----------------|-------|---------------------|
| F01 | Reasignación de subsidios energéticos | reassignment | media | 2026-Q4 | Ministerio de Economía | PLANEN, PLANVIV |
| F02 | Crédito multilateral (BID línea agua) | debt_financing | media | 2027-Q1 | Hacienda + BID | PLANAGUA |
| F03 | Bonos largos (10-15 años) | debt_financing | baja | 2027-Q2 | Hacienda | PLANVIV, PLANAGUA |
| F04 | Reasignación FONAVI/RENABAP | reassignment | media | 2026-Q4 | MinHabitat | PLANVIV |
| F05 | Canon de uso de agua | future_return | baja | 2028+ | Agencia Aguas | PLANAGUA |
| F06 | Ahorros PLANREP (atrición) | future_return | baja | 2029+ | PEO | reflujo a PLANEDU/PLANSAL |
| F07 | Capital cooperativo (Bastardas) | private_cooperative_capital | media | 2027-Q3 | ANEB | PLANEB |
| F08 | Rentas capturadas litio/hidrocarburos | future_return | especulativa | 2030+ | PLANTER | reflujo |
| F09 | Multilateral salud (Banco Mundial) | debt_financing | media | 2027-Q1 | MinSalud | PLANSAL |
| F10 | Convenios provinciales (adhesión) | reassignment | baja | rolling | PEO | transversal |
| F11 | Ahorros PLANDIG (interoperabilidad) | future_return | baja | 2029+ | reflujo |
| F12 | Captura de evasión (procurement OS) | future_return | media | 2027+ | reflujo |

## Tabla por PLAN — primer tranche

| PLAN | USD anual op | Inversión 24m | Fuente principal | Fuente secundaria | Stress (-30%) |
|------|--------------|---------------|------------------|-------------------|---------------|
| PLANAGUA | 1.2B | 3.5B | F02 | F03 | OK con retraso 12m |
| PLANVIV | 2.5B | 8.0B | F04 | F03 | recortar pilotos 30% |
| PLANSAL | 1.8B | 2.0B | F09 | F01 | priorizar APS |
| PLANEDU | 0.6B | 0.8B | F01 | reasignación interna | OK |
| PLANISV | 0.05B | 0.15B | F02 | INTA | OK |
| PLANEB | 0.1B | 0.5B | F07 | bancarización pública | piloto único |
| PLANDIG | 0.4B | 1.2B | F01 | F03 | mantener identidad-lite |
| PLANRUTA | 0.02B | 0.05B | reasignación interna | — | OK |
| **TOTAL** | **6.67B** | **16.2B** | | | |

## Reconciliación con `PRESUPUESTO_CONSOLIDADO_BASTA.md`

La tabla del 22-plan addendum estimaba USD 51.26–65.43B anuales en régimen. La tabla del análisis daba USD 49.44–61.43B. **Esta divergencia se cierra explicitando que aquellas eran estimaciones de régimen completo (post-2040), no de primer tranche.**

Régimen completo a 2040:
- Estimación reconciliada: **USD 50–60B anuales**, equivalente a **7–9% del PBI estimado 2040**.
- Esta cifra **no es un compromiso**, es un techo de diseño.
- El primer tranche (24 meses) suma USD ~6.7B anuales (~1.0% PBI 2026), bajo el tope de 3.5%.

## Stress tests obligatorios

Cada PLAN en tranche-1 debe modelar:
1. **Recesión -3% PBI:** ¿qué se recorta?
2. **Sobrecosto +30%:** ¿qué se posterga?
3. **Multilateral demorado 12m:** ¿qué fuente cubre?
4. **Provincias no adhieren:** ¿qué piloto sobrevive?
5. **PLANREP no genera ahorros:** ¿qué reflujos se pierden?

## Fuentes prohibidas en tranche-1

- F05, F06, F08, F11, F12 — todas son `future_return`. No financian launch.
- Constitucionalización de pisos presupuestarios — diferida hasta tranche-3.
```

- [ ] **Step 2: Marcar `PRESUPUESTO_CONSOLIDADO_BASTA.md` como histórico (manteniéndolo)**

Editar el frontmatter STATUS de `PRESUPUESTO_CONSOLIDADO_BASTA.md` a `superseded` y agregar `> **SUCCESSOR:** SOURCE_OF_FUNDS_LEDGER.md`.

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/SOURCE_OF_FUNDS_LEDGER.md" "Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md"
git commit -m "feat(fiscal): single source-of-funds ledger; mark consolidated budget as superseded"
```

### Tarea 3.2: Stress tests por PLAN del primer tranche

**Files:**
- Create: `Iniciativas Estratégicas/STRESS_TESTS_TRANCHE_1.md`

- [ ] **Step 1: Crear el archivo**

Para cada uno de los 8 PLANes del tranche-1 (AGUA, VIV, SAL, EDU, ISV, EB, DIG, RUTA), una sección con los 5 escenarios de la Tarea 3.1, respondiendo:

- Recorte: qué se quita primero (orden de prioridad reverso).
- Postergación: qué se posterga 12 meses.
- Cobertura alternativa: qué fuente alternativa puede activarse.
- Decisión: ¿se mata el PLAN, se reduce o se sostiene?
- Owner del stress: nombre del rol responsable de declarar el escenario.

Plantilla por PLAN:

```markdown
### PLANXXX

**Escenario A — Recesión -3% PBI:**
- Recorte: ...
- Postergación: ...
- Decisión: ...

**Escenario B — Sobrecosto +30%:**
... (idem)

**Escenario C — Multilateral demorado 12m:**
... (idem)

**Escenario D — Provincias no adhieren:**
... (idem)

**Escenario E — PLANREP sin ahorros:**
... (idem)

**Owner del stress:** PEO / Hacienda
**Trigger automático:** activación cuando una fuente caiga a confianza `baja`.
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/STRESS_TESTS_TRANCHE_1.md"
git commit -m "feat(fiscal): stress test scenarios for tranche-1 plans"
```

---

## Fase 4 — Estadios Internos de PLANDIG (C5)

> **PRINCIPIO:** PLANDIG sigue siendo **un solo PLAN**. La auditoría identificó que es punto único de falla sistémico (167 referencias entrantes). La solución no es dividirlo sino **estadiar internamente sus capacidades**: lo que se entrega en tranche-1 (núcleo digital mínimo) vive en el mismo documento que lo que se difiere a tranche-3+ (capacidades soberanas), pero las dos capas tienen gates separados, presupuestos separados y condiciones de activación distintas.

### Tarea 4.1: Documentar los estadios internos de PLANDIG

**Files:**
- Create: `Iniciativas Estratégicas/PLANDIG_ESTADIOS_INTERNOS.md`

- [ ] **Step 1: Escribir documento de estadios internos**

```markdown
# Estadios Internos de PLANDIG — Núcleo y Soberanía

> **STATUS:** current
> **PLAN:** PLANDIG (un solo PLAN, sin división)
> **MOTIVO:** PLANDIG es punto único de falla sistémico. La auditoría 2026-04-26 identificó 167 referencias entrantes. Estadiamos internamente las capacidades para reducir riesgo, sin partir el PLAN.

## Estadio A — Núcleo Digital (tranche-1, dentro de PLANDIG)

**Alcance entregable en tranche-1:**
- Identidad-lite (no biométrica masiva, no SAPI completo).
- Estándares de datos públicos abiertos.
- Logs de auditoría inmutables (stack open source).
- Mensajería segura entre agencias.
- Reglas de interoperabilidad publicadas.
- Dashboards públicos básicos por PLAN.

**Lo que NO se entrega en este estadio:**
- Cloud soberano a escala.
- IA de frontera.
- SAPI completa.
- Gemelo digital nacional.
- Gobernanza algorítmica.
- Rieles monetarios protocolares.
- ArgenCloud, LANIA, El Mapa completos.

**Costo del estadio A:** USD 1.2B en 24 meses (línea PLANDIG del libro mayor).
**Owner del estadio A:** Subsecretaría de Datos (execution cell en Jefatura de Gabinete).

## Estadio B — Capacidades Soberanas (tranche-3+, dentro de PLANDIG)

**Alcance entregable en tranche-3+:** todo lo excluido del estadio A.

**Condiciones para iniciar el estadio B (todas obligatorias):**
1. Estadio A en operación estable ≥ 18 meses.
2. PIA aprobado por cada componente del estadio B.
3. Auditoría externa de seguridad firmada.
4. Demanda concreta documentada de ≥ 3 PLANes consumidores en operación.
5. Marco legal de protección de datos vigente y aplicado.

**Owner del estadio B:** se evalúa al final del estadio A. Hasta entonces no se asigna recurso.

## Cómo otros PLANes consumen capacidades de PLANDIG

Cada PLAN consumidor declara qué capacidad de PLANDIG necesita y de qué estadio. La fila "Acción si el estadio B no está" describe el modo degradado.

| PLAN consumidor | Capacidad estadio A | Capacidad estadio B | Acción si estadio B aún no está |
|-----------------|---------------------|---------------------|----------------------------------|
| PLANAGUA | datos cuenca | — | OK |
| PLANVIV | registro | — | OK |
| PLANSAL | HCE básica | — | OK |
| PLANEDU | asistencia | — | OK |
| PLANSEG | logs | SAPI parcial | operación degradada manual |
| PLANJUS | datos parciales | AI audit | piloto solo en tranche-3 |
| PLANMON | — | rieles | diferido por defecto |
| PLANMOV | datos parciales | LNMA, AV | fase básica solo |
| PLANCUIDADO | registro | automatización parcial | operación con menor automatización |
| PLANMEMORIA | logs | archivo digital | archivo físico+digital simple |
| PLANTER | catastro | parcial | OK |
| PLANGEO | — | parcial | diferido |
| PLAN24CN | — | gemelo digital ciudad | solo labs |
| PLANEN | datos abiertos | — | OK |
| PLANEB | registro DAO básico | — | OK |
| PLANREP | datos empleo | — | OK |
| PLANISV | datos suelo | — | OK |
| PLANCUL | — | — | OK |
| PLANSUS | datos básicos | parcial | investigación solo |
| PLANMESA | datos básicos | parcial | piloto deliberativo OK |
| PLANTALLER | registro talleres | — | OK |

## Anclaje en el archivo PLANDIG

En `PLANDIG_Argentina_ES.md`, la Fase 13.B.2 inserta dos secciones explícitas: "Estadio A — Núcleo Digital (tranche-1)" y "Estadio B — Capacidades Soberanas (tranche-3+, condicional)". Ambas dentro del mismo PLAN. **No se crea PLAN nuevo. No se cambia el conteo canónico (22 thematic + PLANRUTA).**
```

- [ ] **Step 2: Actualizar `PLAN_REGISTRY.yml`**

`PLANDIG` queda como **una sola entrada** en el registro. Agregar dentro de su entrada un campo `internal_stages` con dos elementos (estadio A y estadio B) con sus respectivos `phase` (tranche-1 y deferred). Esto refleja la realidad operativa sin inflar el conteo.

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANDIG_ESTADIOS_INTERNOS.md" "Iniciativas Estratégicas/PLAN_REGISTRY.yml"
git commit -m "feat(plandig): document internal stages (A core / B sovereign) inside one PLAN per audit C5"
```

---

## Fase 5 — Disciplina Institucional: RACI + PEO + Execution Cells (C6, C9)

### Tarea 5.1: Crear `PORTFOLIO_EXECUTION_OFFICE.md`

**Files:**
- Create: `Iniciativas Estratégicas/PORTFOLIO_EXECUTION_OFFICE.md`

- [ ] **Step 1: Escribir el diseño del PEO**

```markdown
# Portfolio Execution Office (PEO)

> **STATUS:** current
> **NATURALEZA:** célula temporal de ejecución, no agencia autónoma.
> **PRINCIPIO:** el PEO NO hace política sectorial. Solo controla registro, secuencia, dependencias, presupuesto, riesgo y publicación.

## Mandato

1. Mantener `PLAN_REGISTRY.yml` como única fuente de verdad.
2. Operar el `SOURCE_OF_FUNDS_LEDGER.md` (libro mayor único).
3. Custodiar `KILL_SCALE_GATES.md` y firmar promociones entre tranches.
4. Ejecutar el `portfolio_risk_register.md` con revisión mensual.
5. Publicar el dashboard de avance del primer tranche cada 30 días.
6. Bloquear creación de nuevos PLANes durante el freeze.
7. Resolver conflictos de recursos entre PLANes (tierra, agua, energía, presupuesto, PLANDIG).
8. Custodia del grafo de dependencias (`DEPENDENCY_GRAPH.yml`).

## Lo que el PEO no hace

- No diseña política sectorial.
- No reemplaza a ministerios.
- No firma leyes ni decretos (solo recomienda secuencia).
- No ejecuta presupuesto (lo hace cada PLAN).
- No comunica políticamente.

## Tamaño y duración

- **Tamaño máximo:** 25 personas.
- **Duración prevista:** 36 meses (vinculada al primer tranche). Se decide su continuidad o sunset al cierre de tranche-1.
- **Reportes a:** Mesa de Coordinación de Gobierno + PLANMESA piloto.

## Roles internos del PEO

| Rol | Responsabilidad |
|-----|-----------------|
| Director del PEO | Decisión final de gates kill/scale |
| Custodio del registro | PLAN_REGISTRY.yml + DEPENDENCY_GRAPH.yml |
| Tesorero del libro mayor | SOURCE_OF_FUNDS_LEDGER.md |
| Oficial de riesgo | portfolio_risk_register.md |
| Oficial de seguridad | adversarial gates + cyber |
| Oficial legal | cascada legal + opiniones |
| Oficial de evaluación | métricas independientes |
| Oficial de comunicación | dashboard público + plataforma 5 misiones |

## Sunset clauses

- Si al mes 36 el primer tranche cumplió ≥ 70% de métricas, el PEO se reduce a oficina de gobernanza permanente de tamaño ≤ 10 personas.
- Si cumplió < 50%, el PEO se disuelve y se reactiva freeze hasta nueva auditoría.
- Si cumplió 50–70%, el PEO continúa otros 12 meses.
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PORTFOLIO_EXECUTION_OFFICE.md"
git commit -m "feat(peo): design portfolio execution office as temporary control cell"
```

### Tarea 5.2: Crear `RACI_MATRIX.md`

**Files:**
- Create: `Iniciativas Estratégicas/RACI_MATRIX.md`

- [ ] **Step 1: Escribir matriz RACI por dependencia inter-PLAN**

```markdown
# Matriz RACI — Dependencias Inter-PLAN

> **STATUS:** current
> **PRINCIPIO:** ninguna decisión inter-PLAN se toma por defecto. Toda colisión tiene un dueño explícito.

R = Responsable de ejecutar
A = Aprobador final (uno solo)
C = Consultado (debe ser oído)
I = Informado

## Decisiones cruzadas críticas

| Decisión | PLAN-A involucrado | PLAN-B involucrado | R | A | C | I |
|----------|--------------------|--------------------|---|---|---|---|
| Asignación de tierra urbana entre vivienda nueva y restauración ecológica | PLANVIV | PLANISV/PLANTER | PEO Oficial Evaluación | Director PEO | Min Habitat, Min Ambiente | Provincias |
| Prioridad fiscal entre cuidado, vivienda, movilidad | PLANCUIDADO | PLANVIV/PLANMOV | Tesorero PEO | Director PEO | Hacienda | Mesa Gobierno |
| Promoción de PLAN Rojo a piloto | matriz misiones | n/a | Director PEO | Mesa Gobierno + auditor externo | Cabezas de PLAN, sociedad civil | público |
| Acceso a PLANDIG entre múltiples PLANes | DIG | todos | Custodio Registro | Director PEO | cabezas de PLAN | público |
| Asignación de agua entre uso humano, agro, industria | PLANAGUA | PLANISV/PLANEN | Cabeza PLANAGUA | Director PEO | Min Ambiente | Provincias, comunidades |
| Reasignación de personal estatal (PLANREP) | PLANREP | todos | Cabeza PLANREP | Director PEO + Hacienda | sindicatos | público |
| Conflicto territorial originario vs extracción | PLANTER | PLANEN/PLAN24CN | Cabeza PLANTER | Director PEO + INAI | comunidades, provincias | público |
| Activación de stress test fiscal | n/a | todos | Tesorero PEO | Director PEO | cabezas de PLAN afectados | público |
| Promoción tranche-1 → tranche-2 | n/a | todos | Director PEO | Mesa Gobierno | auditor externo | público |
| Edición de `PLAN_REGISTRY.yml` | n/a | todos | Custodio Registro | Director PEO | — | público |
| Ingreso de un nuevo PLAN al freeze | n/a | n/a | propuesta abierta | Director PEO + auditor externo | Mesa Gobierno | público |
| Publicación de material PLANGEO confrontacional | PLANGEO | todos | Cabeza PLANGEO | Director PEO + Cancillería | Inteligencia | restringido |
| Promoción de PLANDIG del estadio A al estadio B | PLANDIG | PLANDIG | Cabeza PLANDIG | Director PEO + auditor externo | sociedad civil técnica | público |
| Promoción de PLANEB Bastarda piloto a sistema | PLANEB | n/a | Cabeza PLANEB + ANEB | Director PEO | competencia | público |

## Reglas

1. **Un solo A por decisión.** Si hay dos, falta diseño.
2. **Sin C no hay decisión.** Saltarse a un consultado documentado anula la decisión.
3. **Toda decisión cruzada se registra** en el portfolio_risk_register.md aunque no genere riesgo.
4. **El Director del PEO no es A de su propio plan.** Solo de decisiones inter-PLAN.
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/RACI_MATRIX.md"
git commit -m "feat(raci): add inter-PLAN RACI matrix for portfolio decisions"
```

### Tarea 5.3: Reclasificar `TABLA_AGENCIAS_BASTA.md` — agencias → execution cells

**Files:**
- Modify: `TABLA_AGENCIAS_BASTA.md`

- [ ] **Step 1: Insertar sección reclasificadora al tope (debajo del STATUS)**

```markdown
## Reclasificación post-auditoría 2026-04-26

**Default nuevo:** las funciones nuevas se cumplen mediante **execution cells dentro de ministerios existentes** o programas temporales. Las agencias autónomas se crean **solo después de que un piloto pruebe demanda durable, financiamiento estable y necesidad legal**.

### Tabla de transición

| Agencia propuesta originalmente | Estado revisado | Vehículo recomendado tranche-1 | Condición para autonomía |
|--------------------------------|-----------------|-------------------------------|--------------------------|
| Agencia Nacional de Aguas | piloto como execution cell | Subsecretaría dedicada en MinAmbiente | 24m de operación + ley marco |
| ANEB (Empresas Bastardas) | execution cell + registro | Programa en Min Producción | 12m con ≥ 1 Bastarda viva |
| Agencia de Datos / SAPI | piloto como subsecretaría | Subsecretaría Datos en Jefatura | 36m + PIA aprobado |
| LANIA (IA pública, capacidad del estadio B de PLANDIG) | diferido | n/a hasta estadio B activado | tranche-3+ |
| Agencia de Suelo (PLANISV) | execution cell | Programa en INTA + MinAgro | 24m con resultados públicos |
| Agencia de Cuidado | execution cell | Programa interministerial | 36m + PIA |
| Agencia de Memoria | diferida | Comisión asesora | tranche-3 |
| Agencia de Tierras (PLANTER) | execution cell | Programa interministerial + INAI | 36m sin litigio mayor |
| Agencia de Movilidad (PLANMOV) | piloto AMBA | Coordinación interjurisdiccional | 24m + procurement OS |
| Lab Monetario (PLANMON) | laboratorio académico | Convenio universidades + BCRA | sin rollout nacional |
| Agencias de PLAN24CN | diferidas | labs de diseño | tranche-3+ |

### Principio

Toda agencia con presupuesto protegido por ley/constitución requiere **prueba previa de servicio entregado durante 24+ meses bajo execution cell**. La autonomía se gana por desempeño, no por diseño.
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/TABLA_AGENCIAS_BASTA.md"
git commit -m "fix(agencias): default to execution cells; autonomy earned by 24m proof"
```

---

## Fase 6 — Cascada Legal Recomputada (C7)

### Tarea 6.1: Recomputar `CASCADA_LEGAL_BASTA.md`

**Files:**
- Modify: `CASCADA_LEGAL_BASTA.md` (reemplazar cuerpo, mantener histórico al final)

- [ ] **Step 1: Insertar sección "Paquete Legal Mínimo Viable (LMV) tranche-1"**

Insertar al inicio del cuerpo (debajo del STATUS), conservando el contenido previo bajo una sección "## Anexo histórico — Cascada original 16-mandatos".

Estructura nueva:

```markdown
## Paquete Legal Mínimo Viable (LMV) — Tranche-1

> **PRINCIPIO:** capear la legislación del primer año al mínimo necesario para entregar servicios visibles y proteger pilotos. Diferir reformas constitucionales y leyes estructurales de alto conflicto.

### Clasificación de instrumentos

Cada instrumento legal tiene una clase:
- `pilot_required`: ley/decreto necesario para que un piloto opere legalmente.
- `ordinary_law`: ley nacional, baja conflictividad.
- `decree`: decreto reglamentario.
- `provincial_adhesion`: requiere adhesión provincial.
- `constitutional`: reforma constitucional. **Diferida a tranche-3+ por defecto.**
- `not_needed_phase_1`: existe pero se difiere.

### Tabla LMV

| ID | Instrumento | Clase | PLAN | Ventana | Riesgo legal |
|----|-------------|-------|------|---------|--------------|
| LMV-01 | Decreto de emergencia hídrica + reparaciones | decree | PLANAGUA | 0–3m | bajo |
| LMV-02 | Ley marco PLANDIG (datos abiertos + identidad-lite) | ordinary_law | PLANDIG | 6–12m | medio |
| LMV-03 | Reforma FONAVI/RENABAP integración | ordinary_law | PLANVIV | 6–12m | medio |
| LMV-04 | Decreto APS + medicamentos esenciales | decree | PLANSAL | 3–6m | bajo |
| LMV-05 | Programa de alfabetización + asistencia | decree + adhesion | PLANEDU | 3–9m | bajo |
| LMV-06 | Marco contable de Empresas Bastardas (piloto) | ordinary_law | PLANEB | 12–18m | medio |
| LMV-07 | Convenios INTA-pilotos suelo | decree | PLANISV | 0–6m | bajo |
| LMV-08 | Protocolo PLANRUTA readiness | decreto interno | PLANRUTA | 0m | nulo |

**Total instrumentos LMV: 8** (vs 58 de la cascada original).

### Diferidos por defecto

- Reforma constitucional de la justicia.
- Constitucionalización de pisos presupuestarios.
- Ley nacional PLANSUS de legalización plena.
- Ley marco PLANMON (moneda alternativa).
- Reforma judicial profunda (PLANJUS Fase II).
- Ley de derechos territoriales originarios profunda (PLANTER Fase II).
- Régimen AV pleno (PLANMOV).
- LANIA / SAPI completa.
- Ley de blindaje institucional con mayoría especial.

### Reglas de gobierno legal

1. **Máximo 2 leyes nuevas por wave de 6 meses.**
2. **Toda ley pre-tranche-1 requiere PIA aprobado si toca datos personales.**
3. **Toda ley con conflicto provincial requiere mapa de adhesión antes de envío.**
4. **Ningún instrumento `constitutional` sale de research a project sin gate del PEO.**
5. **Cada instrumento LMV tiene cláusula de revisión a 36m.**

## Anexo histórico — Cascada original 16-mandatos

(contenido previo del archivo conservado debajo)
```

- [ ] **Step 2: Verificar**

```bash
grep -c "LMV-" "Iniciativas Estratégicas/CASCADA_LEGAL_BASTA.md"
# Esperado: ≥ 9 (8 LMV + 1 mención en encabezado)
```

- [ ] **Step 3: Actualizar registro a `current`**

- [ ] **Step 4: Commit**

```bash
git add "Iniciativas Estratégicas/CASCADA_LEGAL_BASTA.md" "Iniciativas Estratégicas/PLAN_REGISTRY.yml"
git commit -m "feat(legal): minimum viable legal package — cap tranche-1 to 8 instruments"
```

### Tarea 6.2: Crear `LEGAL_OPINIONS/` stubs por PLAN de alto riesgo

**Files:**
- Create: `Iniciativas Estratégicas/LEGAL_OPINIONS/PLANMON.md`
- Create: `Iniciativas Estratégicas/LEGAL_OPINIONS/PLANSUS.md`
- Create: `Iniciativas Estratégicas/LEGAL_OPINIONS/PLANTER.md`
- Create: `Iniciativas Estratégicas/LEGAL_OPINIONS/PLANJUS.md`
- Create: `Iniciativas Estratégicas/LEGAL_OPINIONS/PLANMOV.md`
- Create: `Iniciativas Estratégicas/LEGAL_OPINIONS/PLANDIG_estadio_B.md` (capacidades soberanas dentro de PLANDIG)
- Create: `Iniciativas Estratégicas/LEGAL_OPINIONS/_template.md`

- [ ] **Step 1: Crear plantilla**

`_template.md`:

```markdown
# Opinión Legal Stub — {PLAN}

> **STATUS:** stub (a completar por equipo legal externo antes de promoción a piloto)
> **PLAN:** {código}
> **FECHA STUB:** 2026-04-27

## Riesgos legales identificados

1. **Constitucionalidad:** ¿requiere reforma? ¿qué artículo desafía?
2. **Federalismo:** ¿colisión con jurisdicción provincial/municipal?
3. **Derechos individuales:** ¿privacidad, propiedad, debido proceso?
4. **Tratados internacionales:** ¿impacta CIDH, OIT, OMC, BIT?
5. **Precedentes adversos:** ¿qué fallo de la CSJN podría bloquear?
6. **Riesgo de litigio masivo:** ¿clase, amparo, cautelar?

## Vías legales disponibles

- Vía decreto: alcance y vulnerabilidad.
- Vía ley ordinaria: mayoría requerida.
- Vía ley con mayoría especial: factibilidad política.
- Vía constitucional: condiciones de viabilidad.

## Mitigaciones recomendadas

- Pre-clearance ante CSJN.
- Adhesión provincial previa a launch.
- Cláusulas de transición.
- Cláusulas de revisión.

## Veredicto preliminar

Avanzar / Avanzar con condiciones / Re-diseñar / Diferir.

## Pendiente

- Opinión externa de constitucionalista.
- Opinión externa de derecho administrativo.
- Mapa de adhesión provincial.
```

- [ ] **Step 2: Crear los 6 stubs específicos**

Para cada PLAN (MON, SUS, TER, JUS, MOV) y para el **estadio B de PLANDIG** (capacidades soberanas), copiar la plantilla y rellenar el bloque "Riesgos legales identificados" con 3–5 viñetas extraídas directamente de la auditoría (secciones C5, C7 y "Plan-by-Plan Audit Matrix"). El resto puede quedar como pendiente, pero los riesgos deben estar nombrados.

Ejemplo `PLANMON.md`:

```markdown
# Opinión Legal Stub — PLANMON

> **STATUS:** stub
> **PLAN:** PLANMON
> **FECHA STUB:** 2026-04-27

## Riesgos legales identificados

1. **Constitucionalidad — emisión:** la moneda nacional es atributo del BCRA por la Carta Orgánica. Cualquier moneda alternativa con curso legal o cuasi-legal requiere reforma de Carta Orgánica BCRA o constitucional.
2. **Tratados internacionales:** impacto sobre acuerdos con FMI y obligaciones de transparencia.
3. **Riesgo macroeconómico:** la auditoría 2026-04-26 lo clasifica `Rojo`. Sin estabilización macro previa, la legitimidad legal es secundaria al riesgo de default.
4. **Precedentes:** experiencias de cuasi-monedas provinciales (LECOP, Patacón) — riesgo de fragmentación.

[resto: pendiente]
```

Repetir patrón para los otros 5.

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/LEGAL_OPINIONS/"
git commit -m "feat(legal): stubs for high-risk plan legal opinions"
```

---

## Fase 7 — Compuertas Adversariales (C8)

### Tarea 7.1: Crear `READINESS_GATES_ADVERSARIAL.md`

**Files:**
- Create: `Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md`

- [ ] **Step 1: Escribir el archivo**

Por cada uno de los 22 PLANes + PLANRUTA, listar top-3 attack paths y para cada uno: **mitigación nombrada, owner accountable, presupuesto de respaldo, indicador de activación**.

Estructura por PLAN:

```markdown
### PLANXXX

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | ... | ... | ... | USD ...M | ... |
| 2 | ... | ... | ... | ... | ... |
| 3 | ... | ... | ... | ... | ... |

**Gate de promoción a piloto:** los 3 attack paths deben tener mitigación firmada.
**Gate de promoción a sistema:** los 3 deben tener mitigación operativa medida durante ≥ 12m.
```

Para llenar los attack paths usar como fuente: `SIMULACION_ADVERSARIAL_BASTA.md`. Por cada PLAN, los 3 más probables y altos en impacto.

Plan-por-plan, ejemplos extraídos de la auditoría:

- **PLANAGUA:** captura provincial de cánones, sabotaje de mediciones, judicialización por cuencas privadas.
- **PLANVIV:** litigio de propietarios, captura municipal de fondos, fraude en RENABAP.
- **PLANSAL:** desabastecimiento de medicamentos esenciales, sindicatos médicos, judicialización de PMO.
- **PLANEDU:** sindicatos docentes, captura provincial, falsificación de asistencia.
- **PLANISV:** captura agroempresaria, falsificación de mediciones, retiro de INTA.
- **PLANEB:** captura de gestión interna, ataques de competidores, fraude contable.
- **PLANDIG:** ciberataque, brecha de identidad, captura de proveedor cloud.
- **PLANRUTA:** captura interna del PEO, parálisis por consenso, dilución de gates.
- **PLANSEG:** captura policial, militarización política, captura sindical.
- **PLANEN:** captura corporativa eléctrica, conflicto provincial, sabotaje sindical.
- **PLANCUL:** ataque ideológico, captura sectorial.
- **PLANJUS:** ataque corporación judicial, judicialización del propio plan.
- **PLANSUS:** captura narco, ataque internacional, backlash religioso.
- **PLANMON:** corrida cambiaria, ataque mediático, ataque BCRA.
- **PLANGEO:** retaliación geopolítica, fuga de capitales, ataque mediático extranjero.
- **PLAN24CN:** captura inmobiliaria, conflicto provincial, escándalo ambiental.
- **PLANMESA:** captura partidaria, fatiga participativa, deslegitimación.
- **PLANTALLER:** accidente con víctima, fraude, captura corporativa.
- **PLANCUIDADO:** ataque de privacidad, backlash religioso, captura sindical.
- **PLANMEMORIA:** politización archivo, captura ideológica, ataque privacidad.
- **PLANTER:** litigio extractivo, conflicto comunidades, retaliación provincial.
- **PLANMOV:** captura sindical transporte, conflicto AMBA-provincias, escándalo AV.

Para cada uno, completar las celdas con mitigaciones reales (ej. para PLANSEG #1 captura policial: "Auditoría externa permanente + rotación de mandos + canal anónimo OEA"; owner: PEO Oficial Seguridad; fallback budget: USD 50M anuales; indicador: tres incidentes de captura documentados en 12 meses).

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md"
git commit -m "feat(adversarial): convert scenarios into pre-launch readiness gates per plan"
```

### Tarea 7.2: Marcar `SIMULACION_ADVERSARIAL_BASTA.md` como referencia complementaria

**Files:**
- Modify: `SIMULACION_ADVERSARIAL_BASTA.md`

- [ ] **Step 1: Agregar nota al inicio del cuerpo**

```markdown
> **NOTA POST-AUDITORÍA 2026-04-26:** este documento aporta análisis de actores y escenarios. Su **traducción operativa** vive en `READINESS_GATES_ADVERSARIAL.md`, que es **vinculante** para promoción de PLANes entre fases.
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/SIMULACION_ADVERSARIAL_BASTA.md"
git commit -m "chore(adversarial): cross-reference operational gates"
```

---

## Fase 8 — Grafo de Dependencias Estructurado

### Tarea 8.1: Crear `DEPENDENCY_GRAPH.yml`

**Files:**
- Create: `Iniciativas Estratégicas/DEPENDENCY_GRAPH.yml`

- [ ] **Step 1: Escribir el grafo**

```yaml
# DEPENDENCY_GRAPH.yml — grafo estructurado, autoridad sobre prosa de los PLANes individuales
# Generado: 2026-04-27 a partir de auditoría 2026-04-26 (cross-reference scan)

format_version: 1
canonical_count: 22_thematic_plus_PLANRUTA

# Cada nodo declara qué necesita (depends_on) y qué entrega (provides_to).
# Si hay desajuste con el texto del PLAN, gana este grafo.

nodes:
  PLANAGUA:
    depends_on: [PLANDIG, PLANISV, PLANTER, PLANRUTA]
    provides_to: [PLANSAL, PLANISV, PLANVIV, PLANEN, PLANTER]
    integration_strength: alta
    blocking_for_tranche_1: [PLANSAL]

  PLANVIV:
    depends_on: [PLANDIG, PLANTER, PLANISV, PLANRUTA]
    provides_to: [PLANSAL, PLANCUIDADO, PLANEDU]
    integration_strength: alta
    blocking_for_tranche_1: []

  PLANSAL:
    depends_on: [PLANAGUA, PLANDIG, PLANRUTA]
    provides_to: [PLANEDU, PLANCUIDADO]
    integration_strength: alta
    blocking_for_tranche_1: []

  PLANEDU:
    depends_on: [PLANDIG, PLANRUTA]
    provides_to: [PLANCUL, PLANEB, PLANTALLER, PLANCUIDADO]
    integration_strength: media
    blocking_for_tranche_1: []

  PLANISV:
    depends_on: [PLANRUTA]
    provides_to: [PLANAGUA, PLANTER, PLANEN, PLANSAL]
    integration_strength: alta
    blocking_for_tranche_1: [PLANAGUA, PLANVIV]

  PLANEB:
    depends_on: [PLANDIG, PLANRUTA, PLANEDU]
    provides_to: [PLANCUL, PLANCUIDADO, PLANTALLER]
    integration_strength: media
    blocking_for_tranche_1: []

  PLANDIG:
    depends_on: [PLANRUTA]
    provides_to: [todos los thematic salvo PLANGEO en tranche-1]
    integration_strength: critica
    blocking_for_tranche_1: [todo]

  PLANRUTA:
    depends_on: []
    provides_to: [todos]
    integration_strength: protocolo
    blocking_for_tranche_1: [todo]

  # Tranche-2
  PLANSEG:
    depends_on: [PLANRUTA, PLANDIG, PLANJUS-piloto]
    provides_to: [PLANJUS, PLANSUS, PLANTER, PLANMOV, PLANCUIDADO]
    integration_strength: alta
    blocking_for_tranche_2: [PLANJUS-piloto]

  PLANREP:
    depends_on: [PLANRUTA, PLANEDU]
    provides_to: [presupuesto general]
    integration_strength: media
    blocking_for_tranche_2: []

  PLANMESA:
    depends_on: [PLANDIG, PLANRUTA]
    provides_to: [todos]
    integration_strength: alta
    blocking_for_tranche_2: []

  PLANTALLER:
    depends_on: [PLANEDU, PLANRUTA]
    provides_to: [PLANEB, PLANCUL, PLANCUIDADO]
    integration_strength: media
    blocking_for_tranche_2: []

  PLANCUIDADO:
    depends_on: [PLANSAL, PLANEDU, PLANDIG, PLANRUTA]
    provides_to: [PLANEB, PLANCUL]
    integration_strength: media
    blocking_for_tranche_2: []

  PLANEN:
    depends_on: [PLANISV, PLANAGUA, PLANTER, PLANDIG, PLANRUTA]
    provides_to: [PLAN24CN, PLANMOV, PLANEB]
    integration_strength: alta
    blocking_for_tranche_2: []

  PLANCUL:
    depends_on: [PLANEDU, PLANMEMORIA, PLANRUTA]
    provides_to: [legitimidad transversal]
    integration_strength: baja
    blocking_for_tranche_2: []

  # Tranche-3 / diferidos
  PLANJUS:
    depends_on: [PLANSEG, PLANDIG, PLANRUTA]
    provides_to: [PLANSUS, PLANTER, PLANCUIDADO, PLANMEMORIA]
    integration_strength: alta
    blocking_for_tranche_3: [PLANSUS, PLANTER]

  PLANTER:
    depends_on: [PLANISV, PLANJUS-piloto, PLANSEG, PLANDIG, PLANRUTA]
    provides_to: [PLANEN, PLAN24CN, PLANAGUA, PLANMOV]
    integration_strength: alta
    blocking_for_tranche_3: [PLANEN-fase2, PLAN24CN]

  PLANMOV:
    depends_on: [PLANSEG, PLANJUS-piloto, PLANDIG, PLANMESA, PLANMEMORIA, PLANEN, PLANTALLER, PLANCUIDADO, PLANRUTA]
    provides_to: [PLAN24CN]
    integration_strength: critica_pero_subintegrada
    blocking_for_tranche_3: []
    notas: "Auditoría 2026-04-26 advierte 13 inbound vs 41 outbound a PLANDIG. Sub-integrado para su escala. Estadiar internamente en 4 fases operativas dentro del mismo PLAN (movilidad básica, flete ferroviario, gobernanza AMBA, investigación AV)."

  PLANMEMORIA:
    depends_on: [PLANDIG, PLANRUTA]
    provides_to: [PLANCUL, PLANJUS, anti-reversion]
    integration_strength: media
    blocking_for_tranche_3: []

  PLANSUS:
    depends_on: [PLANSEG, PLANJUS, PLANSAL, PLANRUTA]
    provides_to: [PLANSEG-fase2]
    integration_strength: alta
    blocking_for_tranche_3: []
    diferido: true

  PLANMON:
    depends_on: [PLANDIG (estadio B activado), BCRA estabilizado, PLANRUTA]
    provides_to: [reflujos]
    integration_strength: critica
    diferido: true

  PLANGEO:
    depends_on: [PLANRUTA]
    provides_to: [análisis interno]
    integration_strength: baja
    publico: false

  PLAN24CN:
    depends_on: [PLANTER, PLANEN, PLANDIG (estadio B activado), PLANRUTA]
    provides_to: []
    integration_strength: alta
    diferido: true

# Métricas del grafo (de la auditoría 2026-04-26)
metrics:
  total_thematic: 22
  highest_outbound:
    - PLANVIV: 230
    - PLANDIG: 196
    - PLANMON: 193
    - PLANSEG: 189
    - PLANGEO: 184
    - PLANMOV: 181
  highest_inbound:
    - PLANREP: 340
    - PLANISV: 202
    - PLAN24CN: 177
    - PLANDIG: 167
    - PLANEB: 165
  sparse_outbound: [PLANTALLER, PLANJUS, PLANCUL, PLANCUIDADO, PLANMEMORIA, PLAN24CN]
  under_integrated_high_strategic: [PLANMOV (13 inbound), PLANTER (26), PLANCUL (25), PLANCUIDADO (32)]
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/DEPENDENCY_GRAPH.yml"
git commit -m "feat(graph): structured dependency graph supersedes prose dependencies"
```

### Tarea 8.2: Reintegrar PLANMOV y PLANTER al ecosistema

**Files:**
- Modify (apéndices): `PLANAGUA_Argentina_ES.md`, `PLANVIV_Argentina_ES.md`, `PLANEN_Argentina_ES.md`, `PLANEDU_Argentina_ES.md`, `PLANSAL_Argentina_ES.md`, `PLANISV_Argentina_ES.md`, `PLAN24CN_Argentina_ES.md`, `PLANCUIDADO_Argentina_ES.md`

- [ ] **Step 1: Insertar al final de cada archivo (antes de cualquier anexo) un bloque "Interconexiones críticas con PLANMOV y PLANTER"**

```markdown
## Interconexiones críticas con PLANMOV y PLANTER (post-auditoría 2026-04-26)

### Con PLANMOV
- Demanda que este PLAN deposita en PLANMOV: ...
- Demanda que PLANMOV deposita en este PLAN: ...
- Punto de conflicto identificado: ...
- RACI: ver `RACI_MATRIX.md`.

### Con PLANTER
- Demanda territorial que este PLAN deposita en PLANTER: ...
- Restricción ecológica/originaria que PLANTER impone a este PLAN: ...
- Mecanismo de resolución: ver `RACI_MATRIX.md`.
```

Llenar las viñetas con contenido específico por archivo. Por ejemplo:

- En PLANAGUA: con MOV → demanda de logística para químicos de potabilización; con TER → restricción de explotación de cuencas en territorio originario.
- En PLANVIV: con MOV → integración de vivienda con corredores de transporte; con TER → restricción de expansión urbana sobre suelo productivo o ecológico.
- En PLANEN: con MOV → electrificación del transporte y demanda de red; con TER → conflictos por servidumbres y extracción de minerales para baterías.

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PLAN*.md"
git commit -m "fix(integration): wire PLANMOV and PLANTER into 8 high-strategic-weight plans"
```

---

## Fase 9 — Registro de Riesgo + Compuertas Kill/Scale

### Tarea 9.1: Crear `portfolio_risk_register.md`

**Files:**
- Create: `Iniciativas Estratégicas/portfolio_risk_register.md`

- [ ] **Step 1: Escribir el registro**

```markdown
# Registro de Riesgo del Portfolio

> **STATUS:** current
> **CADENCIA:** revisión mensual por PEO + revisión trimestral por Mesa de Gobierno.

## Categorías

- F = fiscal
- L = legal
- T = técnico/digital
- A = adversarial/político
- C = capacidad institucional
- O = operacional

## Tabla maestra

| ID | Riesgo | Cat | PLAN | Probabilidad | Impacto | Mitigación principal | Owner | Trigger |
|----|--------|-----|------|--------------|---------|----------------------|-------|---------|
| R-01 | Sobrecosto agregado tranche-1 > tope 3.5% PBI | F | todos | media | alto | Stress tests + freeze de promociones | Tesorero PEO | gasto > 80% tope |
| R-02 | PLANDIG ciberataque crítico | T | DIG | media | alto | Fallback offline + auditoría externa | Oficial Seguridad | downtime > 24h |
| R-03 | Captura del PEO por intereses sectoriales | A | meta | media | alto | Auditor externo + rotación + transparencia | Director PEO + auditor | 2 vetos sin justificación |
| R-04 | Litigio masivo PLANTER bloquea PLANEN/PLAN24CN | L | TER, EN, 24CN | alta | alto | Pre-clearance CSJN + adhesión provincial | Oficial Legal | 1 cautelar nacional |
| R-05 | Promoción de PLAN Rojo (MON, SUS, 24CN) por presión política | A | matriz | media | alto | Matriz vinculante + auditor externo | Director PEO | propuesta formal de promoción |
| R-06 | Provincias no adhieren a LMV-03 (FONAVI/RENABAP) | C | VIV | alta | medio | Mapa de adhesión + incentivos fiscales | Oficial Legal | < 12 provincias en 12m |
| R-07 | Multilateral demora F02 (BID agua) | F | AGUA | media | medio | Bonos largos como cobertura | Tesorero PEO | retraso > 6m |
| R-08 | Captura sindical PLANSEG (militarización) | A | SEG | alta | alto | Auditoría externa permanente + canal OEA | Oficial Seguridad | 3 incidentes/año |
| R-09 | Fatiga participativa PLANMESA | C | MESA | media | medio | Sortición rotativa + remuneración | Cabeza PLANMESA | participación < 60% |
| R-10 | Backlash religioso PLANCUIDADO/PLANSUS | A | CUIDADO, SUS | alta | medio | Diálogo iglesias + lenguaje aplicable | Oficial Comunicación | campaña sostenida 3m |
| R-11 | Falla en evaluación independiente | C | meta | media | alto | Convenio universitario + auditor externo | Oficial Evaluación | 1 trimestre sin reporte |
| R-12 | Drift documental retorna | O | meta | alta | medio | Custodia registry + commit hooks | Custodio Registro | desviación detectada |
| R-13 | Ahorros PLANREP no se materializan | F | REP | alta | alto | Sin contar como fuente activa en tranche-1 | Tesorero PEO | gap > 30% al mes 18 |
| R-14 | Coalición pierde elección intermedia | A | meta | media | alto | Visibilidad de logros tranche-1 + irreversibilidad operativa | Director PEO + Comunicación | encuestas adversas 3 meses |
| R-15 | PLANMOV mega-presupuesto absorbe fiscalidad | F | MOV | alta | alto | Cuatro líneas internas con gates separados + diferimiento de AV (sin partir el PLAN) | Tesorero PEO | propuesta de adelanto a tranche-2 |
| R-16 | Fragmentación de la 5-misiones narrativa | A | público | media | medio | Guía de voz + entrenamiento de voceros | Oficial Comunicación | desviación pública sostenida |

## Ritmo de revisión

- Mensual: PEO actualiza probabilidad/impacto y dispara mitigaciones.
- Trimestral: revisión con Mesa de Gobierno + publicación de resumen ejecutivo.
- Anual: re-auditoría completa al estilo de la auditoría 2026-04-26.
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/portfolio_risk_register.md"
git commit -m "feat(risk): portfolio risk register with monthly/quarterly cadence"
```

### Tarea 9.2: Crear `KILL_SCALE_GATES.md`

**Files:**
- Create: `Iniciativas Estratégicas/KILL_SCALE_GATES.md`

- [ ] **Step 1: Escribir compuertas por PLAN**

Por cada PLAN, **3 gates**: entrada-a-piloto, piloto-a-escala, escala-a-sistema. Cada gate tiene **5 criterios** binarios y una **condición de kill** automática.

Plantilla:

```markdown
### PLANXXX

**Gate 1 — Entrada a piloto** (ventana: ...m post-launch)
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3
- [ ] Criterio 4 (PIA aprobado si aplica)
- [ ] Criterio 5 (top-3 adversarial firmado)
- KILL si: ... (condición concreta de auto-finalización)

**Gate 2 — Piloto a escala** (ventana: 12–24m)
... (idem)

**Gate 3 — Escala a sistema** (ventana: 36m+)
... (idem)
```

Ejemplo lleno (PLANAGUA):

```markdown
### PLANAGUA

**Gate 1 — Entrada a piloto**
- [ ] Mapa de cuencas críticas publicado
- [ ] LMV-01 firmado
- [ ] Convenio con ≥ 5 provincias
- [ ] PIA datos de cuenca aprobado
- [ ] Top-3 adversarial firmado
- KILL si: ningún convenio en 6m post-launch.

**Gate 2 — Piloto a escala**
- [ ] 80% de poblaciones piloto con agua segura medida
- [ ] Costo por m3 ≤ benchmark internacional + 30%
- [ ] Cero conflictos territoriales no resueltos en piloto
- [ ] Confianza ciudadana ≥ 60% en encuesta
- [ ] Sostenibilidad fiscal F02 + F05 confirmada
- KILL si: < 30% de poblaciones cubiertas a 12m.

**Gate 3 — Escala a sistema**
- [ ] 95% cobertura nacional segura
- [ ] Régimen tarifario sostenible
- [ ] Auditoría provincial firmada
- [ ] Adhesión legal de ≥ 18 provincias
- [ ] Reflujo F05 operativo
- KILL si: regresión > 10% en cobertura medida.
```

Replicar para los otros 22 (incluyendo PLANRUTA con gates específicos de protocolo).

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/KILL_SCALE_GATES.md"
git commit -m "feat(gates): kill/scale gates per plan with binary criteria + auto-kill conditions"
```

---

## Fase 10 — Primer Tranche Pilot Portfolio

### Tarea 10.1: Crear `PRIMER_TRANCHE_24M.md`

**Files:**
- Create: `Iniciativas Estratégicas/PRIMER_TRANCHE_24M.md`

- [ ] **Step 1: Escribir paquete de gobierno inicial**

```markdown
# Paquete de Gobierno — Primer Tranche (Meses 0–24)

> **STATUS:** current
> **PRINCIPIO:** probar competencia antes de transformación total.
> **VENTANA:** 2026-05 a 2028-05.

## Los 8 PLANes del primer tranche

(Por cada uno: budget, owners, sites, métricas a 90 días, métricas a 24 meses, stop conditions.)

### PLANAGUA — Acceso de emergencia + cuencas

- **Budget:** USD 1.2B anual op + USD 3.5B inversión 24m.
- **Owner:** Subsecretaría dedicada en MinAmbiente.
- **Sites piloto:** Riachuelo, Salí-Dulce, Reconquista, Suquía, Mendoza Norte.
- **Métrica 90d:** mapa de contaminación publicado en 5 cuencas piloto; ≥ 100k personas con acceso seguro adicional.
- **Métrica 24m:** ≥ 1M personas con agua segura adicional; canon piloto operativo en 2 cuencas.
- **Stop:** ningún convenio provincial firmado en 6m → reducción a operación nacional únicamente.

### PLANVIV — Ciudad existente

- **Budget:** USD 2.5B anual op + USD 8.0B inversión 24m.
- **Owner:** MinHabitat.
- **Sites piloto:** AMBA, Rosario, Córdoba, Mendoza, Tucumán, Resistencia.
- **Métrica 90d:** retrofit de 5k unidades; programa de alquileres lanzado en 3 ciudades.
- **Métrica 24m:** retrofit 80k unidades; 200k hogares en programa de alquiler protegido.
- **Stop:** captura municipal documentada → suspender por ciudad.

### PLANSAL — APS + esenciales

- **Budget:** USD 1.8B anual op + USD 2.0B inversión 24m.
- **Owner:** MinSalud.
- **Sites:** todas las provincias con APS débil.
- **Métrica 90d:** stock auditado y publicado; rutina materno-infantil garantizada en 1.000 centros.
- **Métrica 24m:** APS funcional en 5.000 centros; nutrición infantil cobertura 100% bajo línea.
- **Stop:** desabastecimiento crítico de medicamentos esenciales > 10% → activar canal multilateral.

### PLANEDU — Fundamentos

- **Budget:** USD 0.6B anual op + USD 0.8B inversión 24m.
- **Owner:** MinEducación + provincias.
- **Métrica 90d:** alfabetización medida + asistencia diaria publicada por escuela.
- **Métrica 24m:** alfabetización ≥ 90% en 3er grado en escuelas piloto; abandono < 5%.
- **Stop:** sindicato bloquea censo de asistencia → re-diseñar como auditoría comunitaria.

### PLANISV — Suelo medido

- **Budget:** USD 50M anual op + USD 150M inversión 24m.
- **Owner:** INTA + MinAgro execution cell.
- **Sites:** 50–300 pilotos de suelo con resultados públicos.
- **Métrica 90d:** 50 pilotos abiertos con baseline.
- **Métrica 24m:** 200+ pilotos con datos comparados; 1 publicación científica.
- **Stop:** retiro de INTA → operar con universidades públicas.

### PLANEB — Bastardas piloto

- **Budget:** USD 100M anual op + USD 500M inversión 24m.
- **Owner:** ANEB execution cell + MinProducción.
- **Sites:** 1 Bastarda baja-conflicto (ej. medicamentos genéricos esenciales) + 1 alternativa (ej. fertilizantes).
- **Métrica 90d:** marco contable público + 1 Bastarda con 25% de capacidad operativa.
- **Métrica 24m:** 1 Bastarda con costos transparentes; ahorro vs benchmark documentado.
- **Stop:** captura de gestión interna → cierre y archivo.

### PLANDIG — Núcleo digital

- **Budget:** USD 400M anual op + USD 1.2B inversión 24m.
- **Owner:** Subsecretaría Datos en Jefatura.
- **Métrica 90d:** logs de auditoría inmutables operativos; 5 dashboards públicos por PLAN tranche-1.
- **Métrica 24m:** identidad-lite con 10M usuarios; estándares de datos abiertos en 6 ministerios.
- **Stop:** brecha de identidad crítica → freeze + auditoría externa.

### PLANRUTA — Protocolo binding

- **Budget:** USD 20M anual op + USD 50M inversión 24m (hosting del PEO incluido).
- **Owner:** Director PEO.
- **Métrica 90d:** PEO operativo + registro vivo + libro mayor activo.
- **Métrica 24m:** 0 desvíos de matriz misiones; 100% gates documentados.
- **Stop:** captura del PEO documentada → reset con auditor externo.

## Métricas agregadas a 24 meses

- Agua: +1M personas con acceso seguro.
- Vivienda: 80k retrofitadas + 200k alquileres.
- Salud: 5.000 APS funcionales.
- Educación: alfabetización 90% en piloto.
- Suelo: 200 pilotos con datos.
- Bastardas: 1 viva con costos públicos.
- Digital: 10M con identidad-lite.
- Gobernanza: PEO con 0 desvíos de matriz.

## Diferidos visibles

PLANMON, PLANSUS, PLAN24CN, PLANGEO confrontacional, capacidades del estadio B de PLANDIG, PLANJUS reforma profunda, fases extendidas de PLANTER, régimen AV completo dentro de PLANMOV.
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PRIMER_TRANCHE_24M.md"
git commit -m "feat(tranche): first 24-month governing package with metrics and stops"
```

---

## Fase 11 — Privacy Impact Assessments

### Tarea 11.1: Crear plantilla y stubs de PIA

**Files:**
- Create: `Iniciativas Estratégicas/PIA/_template.md`
- Create: `Iniciativas Estratégicas/PIA/PLANDIG.md`
- Create: `Iniciativas Estratégicas/PIA/PLANMEMORIA.md`
- Create: `Iniciativas Estratégicas/PIA/PLANCUIDADO.md`
- Create: `Iniciativas Estratégicas/PIA/PLANSEG.md`
- Create: `Iniciativas Estratégicas/PIA/PLANJUS.md`
- Create: `Iniciativas Estratégicas/PIA/PLANMOV.md`
- Create: `Iniciativas Estratégicas/PIA/PLANMON.md`

- [ ] **Step 1: Plantilla**

```markdown
# Privacy Impact Assessment Stub — {PLAN}

> **STATUS:** stub
> **OBLIGATORIO ANTES DE:** entrada a piloto.

## 1. Datos involucrados

- Tipos de datos personales: ...
- Categorías especiales (sensibles): salud / biometría / orientación / política / origen / ...
- Volumen estimado: ...

## 2. Bases de licitud

- Consentimiento / interés legítimo / obligación legal / función pública.
- ¿Hay reuso de datos previos? Sí/No → con qué base.

## 3. Riesgos

- Re-identificación.
- Brecha de seguridad.
- Discriminación algorítmica.
- Vigilancia desproporcionada.
- Captura de mercado por proveedores.

## 4. Mitigaciones

- Minimización.
- Pseudonimización / cifrado en reposo y tránsito.
- Auditoría externa.
- Derecho de acceso/rectificación/eliminación.
- Retención limitada.

## 5. Algoritmos

- ¿Hay algoritmos automatizados? Sí/No.
- ¿Decisión humana obligatoria? Sí/No.
- ¿Auditoría algorítmica externa? Sí/No.

## 6. Veredicto

Avanza / Avanza con condiciones / Re-diseña / Diferir.

## 7. Firmantes pendientes

- Oficial de seguridad PEO.
- Sociedad civil técnica.
- Autoridad de protección de datos (cuando exista).
```

- [ ] **Step 2: Stubs específicos**

Para cada uno de los 7 PLANes sensibles, copiar plantilla y rellenar §1 con los tipos de datos específicos:

- **PLANDIG:** identidad básica, mapeos cruzados, logs de actividad.
- **PLANMEMORIA:** archivos personales y políticos sensibles.
- **PLANCUIDADO:** salud, dependencia, situación familiar, niñez.
- **PLANSEG:** patrones de movimiento, denuncias, reincidencia, relaciones.
- **PLANJUS:** expedientes, antecedentes, sentencias.
- **PLANMOV:** desplazamiento personal, geolocalización vehicular, biometría AV.
- **PLANMON:** transacciones, patrones de consumo.

Resto del documento puede quedar como pendiente.

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PIA/"
git commit -m "feat(pia): privacy impact assessment template + 7 high-risk plan stubs"
```

---

## Fase 12 — Plataforma Pública 5 Misiones (separación doctrina/plataforma)

### Tarea 12.1: Crear `PLATAFORMA_PUBLICA_5_MISIONES.md`

**Files:**
- Create: `Iniciativas Estratégicas/PLATAFORMA_PUBLICA_5_MISIONES.md`

- [ ] **Step 1: Escribir narrativa pública**

```markdown
# Plataforma Pública — 5 Misiones de Reconstrucción

> **STATUS:** current
> **PRINCIPIO:** la calle no necesita 22 PLANes. Necesita 5 promesas comprobables.
> **REEMPLAZA:** ARQUITECTURA_PLATAFORMA_CIVICA_Y_NARRATIVA_ES.md (mantener como histórico).

## Las 5 misiones

### 1. Agua, salud y comida primero
Toda Argentina con agua segura, atención primaria viva, y comida garantizada para todo niño y madre.

**PLANes asociados:** PLANAGUA, PLANSAL, PLANEDU (nutrición escolar), PLANISV.
**Promesa medible 24m:** 1M personas más con agua segura, 5.000 APS funcionales, 0% desnutrición infantil.

### 2. La ciudad que existe, primero
Casas que nos contengan, calles que sirvan, alquileres protegidos. No ciudades nuevas: las que ya tenemos, mejor.

**PLANes asociados:** PLANVIV, PLANTALLER (talleres barriales), PLANEN (eficiencia), PLANCUIDADO.
**Promesa medible 24m:** 80k viviendas mejoradas, 200k familias en alquiler protegido.

### 3. Volver a aprender, volver a producir
Alfabetización plena, asistencia escolar, oficios, empresas comunes con cuentas claras.

**PLANes asociados:** PLANEDU, PLANTALLER, PLANEB, PLANCUL.
**Promesa medible 24m:** 90% de chicos en 3er grado leyendo; 1 empresa común con costos públicos.

### 4. Estado que sirve, no que servís vos
Un Estado que rinde cuentas con datos abiertos, identidad simple, decisiones documentadas. Nada de plataformas que nos vigilan.

**PLANes asociados:** PLANDIG, PLANMESA piloto, PLANRUTA, PLANREP voluntario.
**Promesa medible 24m:** 10M con identidad-lite; dashboards públicos por ministerio; 0 PLAN nuevo creado durante el freeze.

### 5. Justicia y seguridad sin militarización
Que la policía proteja, que la justicia destrabe, que el delito no pague — sin Estado policial.

**PLANes asociados:** PLANSEG estabilización, PLANJUS piloto, PLANCUIDADO (denuncia), PLANMEMORIA (políticas públicas).
**Promesa medible 24m:** auditoría externa permanente de fuerzas; 0 incidentes de captura policial sin sanción.

## Lo que NO prometemos en público en tranche-1

- Moneda nueva.
- Legalización plena.
- Ciudades nuevas.
- Reformas constitucionales.
- AVs en ruta.
- Sovereign cloud.
- Reemplazar la justicia.

Esto se debate en doctrina interna (`VEHICULO_POLITICO_BASTA.md`), no en la plataforma pública.

## Voz pública

Aplicar `GUIA_DE_VOZ_HOMBRE_GRIS_APLICADA_A_RECONSTRUCCION_ES.md`:
- Rioplatense.
- Concreto antes que conceptual.
- Servicios entregados antes que arquitectura.
- "Vos vas a notar X cuando" antes que "el plan establece Y".
```

- [ ] **Step 2: Marcar `ARQUITECTURA_PLATAFORMA_CIVICA_Y_NARRATIVA_ES.md` como `superseded`** (ya hecho en Fase 1, verificar SUCCESSOR).

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLATAFORMA_PUBLICA_5_MISIONES.md"
git commit -m "feat(plataforma): public 5-mission narrative replaces 22-plan architecture for citizens"
```

### Tarea 12.2: Crear `COALITION_MAP.md`

**Files:**
- Create: `Iniciativas Estratégicas/COALITION_MAP.md`

- [ ] **Step 1: Escribir mapa de coalición**

Por cada actor potencialmente aliado: condición de adhesión, qué pierde si no adhiere, qué le ofrece la plataforma, riesgo de captura. Actores a incluir: provincias prioritarias (Buenos Aires, Córdoba, Santa Fe, Mendoza, Tucumán, Salta), municipios grandes, sindicatos no capturados, cooperativas, PYMES, organizaciones territoriales, comunidades originarias, iglesias, academia, medios independientes, exportadores, profesionales, jubilados.

Estructura por actor:

```markdown
### {Actor}
- Aporte esperado: ...
- Lo que le ofrecemos: ...
- Lo que pierde si se opone: ...
- Riesgo de captura sobre el PLAN: ...
- Owner de la relación: ...
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/COALITION_MAP.md"
git commit -m "feat(coalition): coalition map complements adversarial map"
```

---

## Fase 13 — Parche Estandarizado por PLAN (23 archivos)

### Tarea 13.0: Definir el "parche estandarizado"

Cada uno de los 23 archivos `PLAN*_Argentina_ES.md` recibe la misma sección agregada al final (antes de cualquier anexo histórico). El parche tiene 6 sub-secciones idénticas en estructura.

**Sección a agregar:**

```markdown
---

## Parche post-auditoría 2026-04-26

> **STATUS LOCAL:** {alineado | requiere refactor | diferido}

### 1. Tranche assignment
- **Tranche:** {tranche-1 | tranche-2 | tranche-3 | deferred | research-only}
- **Misión matrix:** {Verde | Ámbar | Rojo | Verde→Ámbar | Protocolo}
- **Justificación:** ver `MATRIZ_MISIONES_Y_PLANES_ES.md` y `HOJA_DE_RUTA_CONSOLIDADA_BASTA.md`.

### 2. Lo que NO haremos en fase 1
(Lista explícita de scope OUT, mínimo 5 viñetas concretas.)
- ...
- ...

### 3. Kill/Scale gates
Ver `KILL_SCALE_GATES.md` sección de este PLAN. Resumen aquí del Gate 1 (entrada a piloto):
- Criterio 1: ...
- Criterio 2: ...
- Criterio 3: ...
- Criterio 4: ...
- Criterio 5: ...
- KILL si: ...

### 4. Top-3 attack paths
Ver `READINESS_GATES_ADVERSARIAL.md` sección de este PLAN. Resumen:
- Attack 1 + mitigación: ...
- Attack 2 + mitigación: ...
- Attack 3 + mitigación: ...

### 5. Promesa pública medible
(Una frase rioplatense que el ciudadano puede verificar a 24 meses.)
> "..."

### 6. Dependencias canónicas
Ver `DEPENDENCY_GRAPH.yml`. Esta prosa cede ante el grafo en caso de conflicto.
- Depende de: ...
- Provee a: ...

---
```

### Tareas 13.1 a 13.23: Aplicar el parche

Una tarea por archivo. Cada una llena las 6 sub-secciones con datos del archivo y de los soportes recién creados.

| Tarea | Archivo | Tranche | Matriz |
|-------|---------|---------|--------|
| 13.1 | PLANRUTA_Argentina_ES.md | tranche-1 (protocolo) | Protocolo |
| 13.2 | PLANDIG_Argentina_ES.md (estadios A y B documentados internamente) | tranche-1 (estadio A) | Verde→Ámbar |
| 13.3 | PLANAGUA_Argentina_ES.md | tranche-1 | Verde |
| 13.4 | PLANVIV_Argentina_ES.md | tranche-1 | Verde |
| 13.5 | PLANSAL_Argentina_ES.md | tranche-1 | Verde |
| 13.6 | PLANEDU_Argentina_ES.md | tranche-1 | Verde |
| 13.7 | PLANISV_Argentina_ES.md | tranche-1 | Verde |
| 13.8 | PLANEB_Argentina_ES.md | tranche-1 | Verde |
| 13.9 | PLANSEG_Argentina_ES.md | tranche-2 | Ámbar |
| 13.10 | PLANREP_Argentina_ES.md | tranche-2 | Ámbar |
| 13.11 | PLANMESA_Argentina_ES.md | tranche-2 | Verde |
| 13.12 | PLANTALLER_Argentina_ES.md | tranche-2 | Verde |
| 13.13 | PLANCUIDADO_Argentina_ES.md | tranche-2 | Verde |
| 13.14 | PLANEN_Argentina_ES.md | tranche-2 | Ámbar |
| 13.15 | PLANCUL_Argentina_ES.md | tranche-2 | Verde |
| 13.16 | PLANJUS_Argentina_ES.md | tranche-3 | Ámbar |
| 13.17 | PLANTER_Argentina_ES.md | tranche-3 | Ámbar |
| 13.18 | PLANMOV_Argentina_ES.md | tranche-3 (fase básica), diferido (AV) | Verde→Ámbar |
| 13.19 | PLANMEMORIA_Argentina_ES.md | tranche-3 | Verde |
| 13.20 | PLANSUS_Argentina_ES.md | research-only / diferido | Rojo |
| 13.21 | PLANMON_Argentina_ES.md | research-only / diferido | Rojo |
| 13.22 | PLAN24CN_Argentina_ES.md | research-only / diferido | Rojo |
| 13.23 | PLANGEO_Argentina_ES.md | research-only (interno) | Ámbar (público diferido) |

Cada tarea sigue 4 steps:

- [ ] **Step 1:** Leer el archivo (`Read`).
- [ ] **Step 2:** Insertar el parche al final del cuerpo (antes de cualquier anexo histórico).
- [ ] **Step 3:** Llenar las 6 sub-secciones con datos específicos. Para "Lo que NO haremos en fase 1", al menos 5 viñetas concretas extraídas de la auditoría (Plan-by-Plan Audit Matrix). Para "Promesa pública medible", usar una frase rioplatense de `PLATAFORMA_PUBLICA_5_MISIONES.md` o derivar.
- [ ] **Step 4:** Commit individual.

```bash
git add "Iniciativas Estratégicas/PLAN{X}_Argentina_ES.md"
git commit -m "patch(PLAN{X}): apply post-audit standard patch"
```

**Ejemplo lleno (13.3 PLANAGUA):**

```markdown
## Parche post-auditoría 2026-04-26

> **STATUS LOCAL:** alineado

### 1. Tranche assignment
- **Tranche:** tranche-1
- **Misión matrix:** Verde
- **Justificación:** strong early candidate per audit C1.

### 2. Lo que NO haremos en fase 1
- No lanzaremos un canon nacional de uso de agua antes de los pilotos provinciales.
- No implementaremos sensores IoT a escala nacional (solo en cuencas piloto).
- No crearemos una agencia autónoma — solo execution cell en MinAmbiente.
- No haremos reformas constitucionales sobre titularidad del recurso.
- No litigaremos con propietarios privados de cuencas en tranche-1.

### 3. Kill/Scale gates
Ver `KILL_SCALE_GATES.md`. Resumen Gate 1:
- Criterio 1: mapa de cuencas críticas publicado.
- Criterio 2: LMV-01 firmado.
- Criterio 3: convenio con ≥ 5 provincias.
- Criterio 4: PIA datos de cuenca aprobado.
- Criterio 5: top-3 adversarial firmado.
- KILL si: ningún convenio en 6m post-launch.

### 4. Top-3 attack paths
Ver `READINESS_GATES_ADVERSARIAL.md`. Resumen:
- Captura provincial de cánones → cláusula de auditoría externa + redistribución federal.
- Sabotaje de mediciones → mediciones triplicadas (estado + comunidad + universidad).
- Judicialización por cuencas privadas → pre-clearance CSJN sobre marco jurídico.

### 5. Promesa pública medible
> "En 24 meses, un millón de personas más en Argentina van a tener agua segura medida y publicada."

### 6. Dependencias canónicas
- Depende de: PLANDIG, PLANISV, PLANTER, PLANRUTA.
- Provee a: PLANSAL, PLANISV, PLANVIV, PLANEN, PLANTER.
```

(Replicar patrón para los otros 22.)

---

## Fase 13.A — Playbook de Revisión Editorial Profunda

> **Propósito:** el parche estandarizado de la Fase 13 es metadata. La Fase 13.A define el **protocolo editorial** que cada PLAN recibe. La Fase 13.B aplica el protocolo PLAN por PLAN con correcciones específicas. La Fase 13.C cierra con sweeps de coherencia cruzada.

### Tarea 13.A.1: Crear `PLAYBOOK_REVISION_PROFUNDA.md`

**Files:**
- Create: `Iniciativas Estratégicas/PLAYBOOK_REVISION_PROFUNDA.md`

- [ ] **Step 1: Escribir el playbook**

```markdown
# Playbook de Revisión Editorial Profunda — PLAN por PLAN

> **STATUS:** current
> **APLICACIÓN:** ejecutar este protocolo en cada uno de los 23 archivos `PLAN*_Argentina_ES.md` antes de declarar la remediación cerrada.

## Objetivo

Llevar cada PLAN del estado "documento ambicioso" al estado "documento gobernable", alineado con los artefactos canónicos creados en Fases 1–12, sin alterar la voz ni eliminar la visión de largo plazo.

## Principios de edición

1. **Preservar el horizonte de 2040.** No borrar visión.
2. **Demarcar fases con dureza.** Toda promesa de tranche-1 debe ser ejecutable con instituciones débiles, baja confianza, y datos parciales.
3. **No future returns en tranche-1.** Ningún ahorro o renta futura financia operación inicial.
4. **No nuevas agencias autónomas en tranche-1.** Default: execution cell.
5. **No reformas constitucionales en tranche-1.** Default: ley ordinaria o decreto.
6. **No capacidades del estadio B de PLANDIG en tranche-1.** Toda dependencia digital se ancla al estadio A (núcleo) o se difiere a tranche-3+.
7. **Promesa pública medible.** Cada PLAN tiene una frase rioplatense verificable a 24 meses.
8. **Top-3 adversarial cerrado.** Sin mitigación operativa, no hay launch.
9. **Voz consistente.** Doctrina interna en docs internos; plataforma pública en documento separado.
10. **Sin datos personales sin PIA.** Si el PLAN toca datos personales, su PIA stub debe estar referenciado.

## Protocolo editorial — 13 pasos por PLAN

### Paso 1: Lectura completa
Leer el PLAN entero. Anotar: secciones, tablas, promesas, fechas, presupuestos, leyes propuestas, agencias propuestas, dependencias declaradas, métricas, escenarios adversariales.

### Paso 2: Mapeo de veredicto de auditoría
Tomar la fila correspondiente del "Plan-by-Plan Audit Matrix" de `FULL_STRATEGIC_AUDIT_2026-04-26.md`. Para cada "Main Issue" listado, identificar las secciones del PLAN que materializan el issue y marcarlas para edición.

### Paso 3: Alineación fiscal
- Buscar todo monto en USD/ARS/PBI%.
- Para cada uno: clasificar como `gross_investment | public_net_cost | private_cooperative_capital | debt_financing | reassignment | future_return`.
- Si la sección está en tranche-1 y la fuente es `future_return`, **eliminar la dependencia** o reescribirla como "se evaluará al cierre de tranche-1".
- Reemplazar fuentes vagas ("se financiará con") por referencias a IDs del libro mayor (ej. "fuente F02 del `SOURCE_OF_FUNDS_LEDGER.md`").
- Sumar el costo declarado de tranche-1 y verificar que cabe bajo la línea del PLAN en la tabla de `PRIMER_TRANCHE_24M.md`.

### Paso 4: Alineación legal
- Buscar todo "ley", "decreto", "reforma", "constitucional", "tratado".
- Clasificar cada instrumento contra las clases del LMV (`pilot_required | ordinary_law | decree | provincial_adhesion | constitutional | not_needed_phase_1`).
- Si tranche-1 referencia un instrumento `constitutional` o estructural pesado, **diferirlo explícitamente** con cláusula "fuera de tranche-1".
- Para cada instrumento `pilot_required`, conectar al ID de `CASCADA_LEGAL_BASTA.md` (LMV-XX).
- Si la sección legal del PLAN excede 8 instrumentos en tranche-1, podar.

### Paso 5: Alineación institucional
- Buscar toda "agencia", "ente", "autoridad", "instituto", "organismo autónomo".
- Para cada uno en tranche-1: reemplazar por "execution cell en {ministerio existente}" salvo que figure en `TABLA_AGENCIAS_BASTA.md` con condición de autonomía cumplida.
- Eliminar "presupuesto protegido", "autonomía constitucional" en tranche-1 — reescribir como "presupuesto operativo durante 24 meses; revisión al cierre de tranche".
- Eliminar "directorio independiente nombrado por mayoría especial" de tranche-1.

### Paso 6: Alineación de dependencias
- Buscar toda referencia a otro PLAN.
- Cada referencia debe declarar: tranche del PLAN dependiente, capacidad concreta esperada, fallback si la capacidad no llega.
- Insertar bloque canónico al final: `Ver \`DEPENDENCY_GRAPH.yml\`. Esta prosa cede ante el grafo en caso de conflicto.`

### Paso 7: Alineación adversarial
- Buscar la sección de riesgo / adversarios / oposición.
- Para los top-3 attack paths del PLAN (extraídos de `READINESS_GATES_ADVERSARIAL.md`), verificar que cada uno tiene mitigación nombrada, owner, fallback budget, indicador de activación.
- Si la sección actual del PLAN tiene >5 escenarios sin priorizar, podar a top-3 + mover el resto a anexo.

### Paso 8: Split PLANDIG
- Buscar "PLANDIG", "ArgenCloud", "SAPI", "LANIA", "El Mapa", "AI", "gemelo digital", "rieles digitales".
- Para cada uno en tranche-1: reescribir como capacidad de `PLANDIG` (identidad-lite, datos abiertos, audit logs, mensajería segura) o **diferir** la dependencia.
- Si la dependencia no puede caer en PLANDIG, marcar "fase-2+" o más adelante.

### Paso 9: Promesa pública medible
- Identificar (o crear) una sección "Lo que el ciudadano va a notar a 24 meses".
- Una frase rioplatense, verificable, alineada con la promesa de la misión correspondiente en `PLATAFORMA_PUBLICA_5_MISIONES.md`.
- Eliminar tecnicismos de la sección. Mover tecnicismos a sección "Diseño operativo".

### Paso 10: Referencia PIA
- Si el PLAN toca datos personales (DIG, MEMORIA, CUIDADO, SEG, JUS, MOV, MON, SAL, EDU asistencia, VIV registro, REP empleo): insertar referencia a `PIA/{PLAN}.md` y advertencia "no avanza a piloto sin PIA aprobado".

### Paso 11: Sweep de contradicciones internas
Cada PLAN tiene contradicciones específicas. Documentar y resolver. Patrón típico:
- Resumen ejecutivo promete X, sección detallada lista X+10 cosas.
- Tabla de presupuesto suma distinto al texto.
- Cronograma "Año 0" en una sección, "2027" en otra.
- Lista de PLANes dependientes en intro distinta a la lista en sección de dependencias.

### Paso 12: Sweep de voz
- Documento interno: técnico OK.
- Citar de `GUIA_DE_VOZ_HOMBRE_GRIS_APLICADA_A_RECONSTRUCCION_ES.md` cuando se mezclen registros.
- Excluir lenguaje espiritual/cultural de plataforma pública (queda en doctrina).

### Paso 13: Verificación
Por cada PLAN ejecutar:
```bash
PLAN=PLANXXX
F="Iniciativas Estratégicas/${PLAN}_Argentina_ES.md"
# 1. No "future_return" en sección tranche-1
# 2. No "constitucional" sin "diferido a tranche-3+"
# 3. Top-3 adversarial nombrado
grep -A 50 "Tranche-1\|tranche-1\|Fase 1\|Año 1" "$F" | grep -i "future_return\|renta capturada\|ahorro PLANREP\|reflujo" && echo "FALLA: $PLAN tiene future return en tranche-1"
grep -i "reforma constitucional" "$F" | grep -v "diferid\|tranche-3\|fase 2" && echo "FALLA: $PLAN tiene reforma constitucional sin diferimiento"
grep -q "Top-3 attack" "$F" || echo "FALLA: $PLAN sin top-3 adversarial"
grep -q "Promesa pública medible\|notar a 24 meses" "$F" || echo "FALLA: $PLAN sin promesa pública"
```

## Convenciones editoriales

- **No borrar prosa**, mover a anexo cuando sea problemática. Mantener trazabilidad histórica.
- **Insertar marcadores explícitos** `> **REVISIÓN 2026-04-26:** {qué se cambió y por qué}` antes de cada bloque editado.
- **Anexo histórico** al final del PLAN para todo lo que se sacó de tranche-1 pero no se quiere perder ("## Anexo — Visión 2040 (no compromete tranche-1)").

## Cierre del playbook

Cuando un PLAN haya pasado los 13 pasos, agregar al frontmatter:
```
> **REVISION_PROFUNDA:** completed YYYY-MM-DD per PLAYBOOK_REVISION_PROFUNDA.md
```
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PLAYBOOK_REVISION_PROFUNDA.md"
git commit -m "feat(playbook): editorial deep-review protocol for per-plan corrections"
```

---

## Fase 13.B — Revisión Profunda PLAN por PLAN (23 archivos)

> Una tarea por PLAN. Cada tarea aplica el playbook (13 pasos) **más** las correcciones específicas listadas a continuación. Las correcciones específicas vienen de la auditoría 2026-04-26 (Plan-by-Plan Matrix + secciones C1–C10) y del cruce con los artefactos creados en Fases 1–12.

### Convención por tarea

- [ ] **Step 1: Lectura completa** (`Read` del archivo, anotar mentalmente).
- [ ] **Step 2: Aplicar los 13 pasos del playbook**.
- [ ] **Step 3: Aplicar correcciones específicas listadas debajo**.
- [ ] **Step 4: Insertar bloque `> **REVISIÓN 2026-04-26:**` al inicio de cada sección editada con resumen de cambios**.
- [ ] **Step 5: Verificación grep (Paso 13 del playbook)**.
- [ ] **Step 6: Commit**.
- [ ] **Step 7: Mover a anexo histórico todo lo desplazado** (no borrar).

### Tarea 13.B.1: Revisión profunda — `PLANRUTA_Argentina_ES.md`

**Veredicto auditoría:** "Crucial si redefinido. Riesgo: convertirse en otro mandato. Acción: convertirlo en protocolo de readiness y secuencia vinculante."

**Correcciones específicas:**
1. **Reescribir el preámbulo** para declarar que PLANRUTA es **protocolo, no mandato sectorial**. No tiene políticas públicas propias. Su producto es la disciplina de portfolio.
2. **Eliminar toda referencia a "agencia PLANRUTA"** o "Ministerio de Reconstrucción". El vehículo es el PEO (`PORTFOLIO_EXECUTION_OFFICE.md`), célula temporal.
3. **Convertir las "5 fases" en gates verificables**: cada fase tiene criterios de salida medibles, no solo prosa.
4. **Crisis Deployment Kit:** preservar pero subordinar a la lógica del PEO. Si hay crisis, el kit se activa sin saltarse el registry.
5. **Eliminar "constitucionalización del PLANRUTA"** si aparece. PLANRUTA vive por desempeño, no por blindaje.
6. **Insertar referencia explícita** a `KILL_SCALE_GATES.md`, `RACI_MATRIX.md`, `PLAN_REGISTRY.yml`, `SOURCE_OF_FUNDS_LEDGER.md`.
7. **Insertar sunset clause:** si tranche-1 falla, PLANRUTA vuelve a freeze + auditor externo.

**Promesa pública medible:** "En 24 meses, ningún PLAN del sistema vivió fuera del registro, fuera del libro mayor o fuera de los gates."

- [ ] Steps 1–7 + commit con mensaje: `patch(PLANRUTA): deep review — convert to binding protocol, sunset clauses, PEO-anchored`

### Tarea 13.B.2: Revisión profunda — `PLANDIG_Argentina_ES.md`

**Veredicto auditoría:** "Esencial pero sobrecargado. Single point of failure. Acción: tranche mínimo primero; diferir stack soberano completo."

**Correcciones específicas:**
1. **Estructurar el documento con dos estadios internos explícitos** (sin partir el PLAN; PLANDIG sigue siendo un solo PLAN):
   - **Estadio A — Núcleo Digital (tranche-1):** identidad-lite, datos abiertos, audit logs, mensajería segura, dashboards, interoperabilidad.
   - **Estadio B — Capacidades Soberanas (tranche-3+, condicional):** ArgenCloud, SAPI completa, LANIA, gemelo digital, rieles monetarios, gobernanza algorítmica.
2. **Mover del estadio A al estadio B**: cualquier mención de IA generativa, IA de frontera, computación cuántica, blockchain protocolar, voto digital vinculante.
3. **Reducir el número de servicios listados en estadio A a ≤ 8** (lo que cabe en USD 1.2B/año + 1.2B inversión).
4. **Insertar "Offline-first as policy"** en el estadio A: todo servicio público crítico debe operar 30 días sin PLANDIG.
5. **PIA referenciado:** insertar bloque que apunta a `PIA/PLANDIG.md` y declara que ningún módulo va a piloto sin PIA aprobado. Estadio B requiere PIA por componente.
6. **Cyber resilience:** sub-mandato heredado de Fase 14 (Cobertura). Insertar sección dentro del estadio A: SOC 24/7, red team trimestral, certificación externa anual.
7. **Eliminar "ciudadanía digital obligatoria"** y "identidad biométrica masiva" de cualquier estadio (no solo tranche-1).
8. **Condiciones de paso al estadio B** (las 5 de `PLANDIG_ESTADIOS_INTERNOS.md`) integradas como gate explícito en el cuerpo del PLAN.
9. **Conservar visión 2040** en anexo "Visión 2040 — Estadio B de PLANDIG".

**Promesa pública medible:** "En 24 meses, vas a poder identificarte sin DNI físico para trámites comunes y vas a ver dashboards públicos por ministerio actualizados."

- [ ] Steps 1–7 + commit: `patch(PLANDIG): deep review — split min/sov, offline-first, PIA gate`

### Tarea 13.B.3: Revisión profunda — `PLANAGUA_Argentina_ES.md`

**Veredicto auditoría:** "Strong early candidate. Risk: over-digitalizing before access basics. Acción: emergency repairs, safe water, manual verification first."

**Correcciones específicas:**
1. **Despriorizar la red IoT nacional** en tranche-1. Mantener IoT sólo en cuencas piloto (≤ 5).
2. **Tranche-1 = reparaciones de emergencia + acceso seguro + mapa de contaminación**, no un sistema unificado de gestión hídrica.
3. **Canon de uso** sólo como piloto provincial, no como ley nacional inmediata. Mover a tranche-2.
4. **Eliminar "Agencia Nacional de Aguas"** como vehículo tranche-1 — reemplazar por "Subsecretaría dedicada en MinAmbiente con execution cell".
5. **Verificación manual triplicada:** mediciones de calidad de agua deben tener 3 fuentes (estado + comunidad + universidad) en cada cuenca piloto.
6. **Conflicto provincial:** sección explícita con mapa de adhesión y trato federal antes del launch.
7. **Eliminar "constitucionalización del derecho al agua"** de tranche-1 — diferir.
8. **Top-3 adversarial:** captura provincial de cánones, sabotaje de mediciones, judicialización por cuencas privadas — con mitigaciones.
9. **Conexiones críticas con PLANTER y PLANMOV** (post-auditoría) ya insertadas en Fase 8.2.

**Promesa pública medible:** "En 24 meses, un millón de personas más van a tener agua segura medida y publicada en su barrio."

- [ ] Steps 1–7 + commit: `patch(PLANAGUA): deep review — access first, IoT contained, federal map`

### Tarea 13.B.4: Revisión profunda — `PLANVIV_Argentina_ES.md`

**Veredicto auditoría:** "Strong early candidate. Risk: too large too fast. Acción: existing-city pilots, rentals, retrofit, critical households."

**Correcciones específicas:**
1. **Excluir vivienda nueva en sitios nuevos** del tranche-1. Solo retrofit, regularización, alquiler protegido en ciudad existente.
2. **MASTER_PLAN HOUSING OS** referenciado pero **no requerido para tranche-1**. Su despliegue completo va a tranche-2/3.
3. **FONAVI/RENABAP integración** como única reforma legal de tranche-1 (LMV-03). El resto de leyes habitacionales se difieren.
4. **Eliminar "expropiación masiva"** de tranche-1 — sólo en casos puntuales con expediente individual.
5. **Conflicto con PLANTER**: cualquier expansión urbana sobre suelo productivo o ecológico requiere RACI cruzada (ver `RACI_MATRIX.md`). Insertar nota.
6. **Captura municipal de fondos:** sección de mitigación con auditoría externa por programa.
7. **Sites piloto explícitos:** AMBA, Rosario, Córdoba, Mendoza, Tucumán, Resistencia (de `PRIMER_TRANCHE_24M.md`).
8. **Anti-fraude RENABAP:** tres firmas independientes (federación de cooperativas + INDEC + auditoría comunitaria) antes de transferencia.
9. **Eliminar "ciudades de 15 minutos" como meta tranche-1** — diferir a tranche-2.
10. **Conexión con PLANCUIDADO:** vivienda accesible para dependencia ya en tranche-1; cuidado de largo plazo en tranche-2.

**Promesa pública medible:** "En 24 meses, ochenta mil viviendas mejoradas y doscientas mil familias con alquiler protegido medible."

- [ ] Steps 1–7 + commit: `patch(PLANVIV): deep review — existing city only, FONAVI as sole legal reform`

### Tarea 13.B.5: Revisión profunda — `PLANSAL_Argentina_ES.md`

**Veredicto auditoría:** "Strong if narrowed. Vitality paradigm broader than operational capacity. Acción: APS, essential stock, maternal-child, nutrition first."

**Correcciones específicas:**
1. **Reescribir "Paradigma Vitalidad"** como visión 2040 (anexo). Tranche-1 = APS funcional + stock + materno-infantil + nutrición.
2. **Eliminar "reforma sistema único de salud"** de tranche-1 — diferir.
3. **Stock auditado y publicado** como entregable 90 días.
4. **HCE básica** sólo para los 5.000 centros piloto, no nacional.
5. **PIA referenciado:** datos sensibles (HCE, nutrición infantil) requieren PIA aprobado.
6. **Vinculación con PLANCUIDADO:** materno-infantil compartido entre los dos PLANes; RACI define quién firma.
7. **Vinculación con PLANEDU:** nutrición escolar como entregable conjunto.
8. **Vinculación con PLANAGUA:** agua segura es prerequisito de APS — sección explícita de bloqueo.
9. **Sindicato médico:** sección de mitigación con mesa permanente y compensación de carga.
10. **Eliminar "telemedicina nacional como pilar"** de tranche-1 — solo donde haya conectividad probada.
11. **Medicamentos esenciales:** cadena de suministro auditada externamente; backup multilateral en F09.

**Promesa pública medible:** "En 24 meses, cinco mil centros de salud van a estar funcionando con stock garantizado y atención materno-infantil viva."

- [ ] Steps 1–7 + commit: `patch(PLANSAL): deep review — APS-first, vitality paradigm to 2040 annex`

### Tarea 13.B.6: Revisión profunda — `PLANEDU_Argentina_ES.md`

**Veredicto auditoría:** "High priority. Reform ambition too broad. Acción: literacy, attendance, teacher support, tutoring first."

**Correcciones específicas:**
1. **Tranche-1 = alfabetización + asistencia + apoyo docente + tutoría**. Todo lo demás se mueve a tranche-2/3.
2. **Eliminar "reforma curricular nacional"** de tranche-1 — diferir.
3. **Eliminar "universidad sin ingreso restringido"** de tranche-1 — diferir.
4. **Asistencia diaria por escuela** publicada como métrica abierta.
5. **Censo escolar** como pre-requisito de cualquier intervención sectorial.
6. **PIA** de datos de asistencia y rendimiento — referenciado.
7. **Sindicatos docentes:** mesa permanente + compensación + auditoría comunitaria de asistencia (no auditoría policial).
8. **Conexión con PLANSAL:** nutrición escolar, salud bucal, salud mental adolescente.
9. **Conexión con PLANCUL:** memoria + ciudadanía + arte como contenido transversal de alfabetización.
10. **Sub-mandato CyT** (de `COVERAGE_GAPS_ASSIGNMENTS.md`): integrarlo como anexo de tranche-2, no diluir tranche-1.
11. **Tutoría:** programa nacional con cooperativas estudiantiles + voluntariado universitario, no contratación masiva.

**Promesa pública medible:** "En 24 meses, nueve de cada diez chicos en tercer grado van a leer en las escuelas piloto."

- [ ] Steps 1–7 + commit: `patch(PLANEDU): deep review — literacy/attendance only, curriculum reform deferred`

### Tarea 13.B.7: Revisión profunda — `PLANISV_Argentina_ES.md`

**Veredicto auditoría:** "Strong early pilot. Risk: scaling before proof. Acción: keep as measured pilots with INTA/extension discipline."

**Correcciones específicas:**
1. **Cap de 50–300 pilotos** en tranche-1. Eliminar cualquier promesa de "rollout nacional" antes de cierre tranche.
2. **Convenio INTA** como pre-requisito; backup con universidades públicas si INTA bloquea.
3. **Datos abiertos de suelo** publicados trimestralmente.
4. **Eliminar "agencia de suelo"** como vehículo tranche-1 — execution cell en INTA + MinAgro.
5. **Captura agroempresaria:** sección de mitigación con declaración de conflicto de interés obligatoria por sitio piloto.
6. **Falsificación de mediciones:** triplicación (estado + comunidad + universidad).
7. **Conexión con PLANAGUA:** datos de cuenca + suelo cruzados; RACI para conflictos de uso.
8. **Conexión con PLANTER:** suelo en territorio originario requiere consulta previa documentada.
9. **Conexión con PLANEN:** servidumbres de explotación (litio, gas) tienen impacto en suelo — sección de control cruzado.
10. **No subsidio sin medición:** todo apoyo a productor en piloto requiere baseline + targets + verificación.

**Promesa pública medible:** "En 24 meses, doscientos pilotos de suelo con datos públicos van a estar mostrando qué prácticas funcionan en tu provincia."

- [ ] Steps 1–7 + commit: `patch(PLANISV): deep review — measured pilots only, INTA-anchored`

### Tarea 13.B.8: Revisión profunda — `PLANEB_Argentina_ES.md`

**Veredicto auditoría:** "Useful institutional prototype. Risk: legal and governance complexity. Acción: launch 1–2 low-risk Bastardas before systemwide law."

**Correcciones específicas:**
1. **Cap de 1–2 Bastardas piloto** en tranche-1. Una sugerida: medicamentos genéricos esenciales. Otra: fertilizantes o materiales de construcción.
2. **ANEB como execution cell** en MinProducción, no agencia autónoma con presupuesto protegido. Autonomía a tranche-2 si Bastardas viven.
3. **Marco contable transparente** publicado **antes** de la primera Bastarda — pre-requisito.
4. **DAO governance:** describir mecanismos sin asumir blockchain. Los pilotos pueden operar con votación sortición + auditoría comunitaria primero.
5. **Eliminar "Red Bastarda Nacional"** como entregable tranche-1 — diferir.
6. **Eliminar "ley sistema Bastardo"** de tranche-1 — sólo marco contable de pilotos (LMV-06).
7. **Captura de gestión interna:** rotación obligatoria + auditoría externa + transparencia salarial.
8. **Conexión con PLANCUIDADO:** Bastardas de cuidado largo plazo a tranche-2/3.
9. **Conexión con PLANEDU:** Bastardas educativas (oficios) cruzadas con PLANTALLER en tranche-2.
10. **Capital cooperativo F07** como fuente principal; bancarización pública como secundaria.

**Promesa pública medible:** "En 24 meses, una empresa común va a publicar costos y márgenes para que veas si te conviene comprarle ahí."

- [ ] Steps 1–7 + commit: `patch(PLANEB): deep review — 1-2 pilots, framework before scale-up law`

### Tarea 13.B.9: Revisión profunda — `PLANSEG_Argentina_ES.md`

**Veredicto auditoría:** "Necessary but risky. Must precede PLANSUS but avoid militarization. Acción: simplify to public safety, command, integrity, community presence."

**Correcciones específicas:**
1. **Tranche-2 reentrada**: no tranche-1 launch operativo.
2. **Eliminar "fuerza federal de intervención rápida"** de tranche-1.
3. **Auditoría externa permanente de fuerzas** como gate de entrada a tranche-2.
4. **Mando unificado** documentado por jurisdicción.
5. **Integridad:** declaración patrimonial + rotación + canal anónimo internacional (OEA).
6. **Presencia comunitaria** sin patrullaje militarizado.
7. **PLANSUS no avanza** mientras PLANSEG no esté estabilizado — referenciar.
8. **Conexión con PLANJUS-piloto:** fueros, traspaso, antibacklog.
9. **Conexión con PLANCUIDADO:** denuncias de violencia de género, infancia.
10. **PIA referenciado:** datos de denuncias, reincidencia, relaciones — gate.
11. **Eliminar "narcotest universal"** y "vigilancia masiva" de cualquier sección tranche-1/2.
12. **Captura sindical/policial:** rotación + canal denuncia + sanción visible.
13. **Sortición ciudadana** sólo para juntas de control, no para mandos operativos.

**Promesa pública medible:** "En 24 meses, una auditoría externa va a publicar trimestralmente cuántos casos de captura policial tuvieron sanción."

- [ ] Steps 1–7 + commit: `patch(PLANSEG): deep review — tranche-2 only, demilitarized, audit-anchored`

### Tarea 13.B.10: Revisión profunda — `PLANREP_Argentina_ES.md`

**Veredicto auditoría:** "High potential, high social risk. Risk: fiscal promise and labor trauma. Acción: voluntary/attrition pilots and real demand."

**Correcciones específicas:**
1. **Pilotos voluntarios + atrición** en tranche-2. **Cero despidos masivos** mencionados en tranche-1/2.
2. **Eliminar "racionalización del Estado"** como término — reemplazar por "modernización con transición digna".
3. **Sub-mandato Procurement OS** (de `COVERAGE_GAPS_ASSIGNMENTS.md`) — adelantar a tranche-1 como entregable conjunto con PLANDIG.
4. **Sub-mandato Civil Service Operating Model** — tranche-2.
5. **Sub-mandato Coparticipación y Tributación** — tranche-2.
6. **Demanda real verificada** = pre-requisito de cualquier reasignación.
7. **Ahorros prometidos NO se cuentan** como fuente activa hasta cierre tranche-2 (referencia F06 del libro mayor).
8. **Conexión con PLANEDU:** capacitación obligatoria como puente, no como castigo.
9. **PIA referenciado:** datos de empleo, antigüedad, salario — sensibles.
10. **Sindicatos:** mesa tripartita + compensación + retiro voluntario asistido.

**Promesa pública medible:** "En 24 meses, ningún empleado público va a perder el trabajo por reforma; los que se vayan van a ser los que decidieron irse."

- [ ] Steps 1–7 + commit: `patch(PLANREP): deep review — voluntary attrition only, savings deferred`

### Tarea 13.B.11: Revisión profunda — `PLANMESA_Argentina_ES.md`

**Veredicto auditoría:** "Useful decision layer. Risk: parallel legitimacy/bureaucracy. Acción: pilot as portfolio review method, not full agency."

**Correcciones específicas:**
1. **Tranche-2 como piloto de revisión de portfolio**, no como agencia autónoma.
2. **Eliminar "Agencia PLANMESA"** de tranche-1/2 — execution cell en PEO + Jefatura.
3. **Sortición rotativa** + remuneración (combatir fatiga participativa).
4. **No reemplazar al Congreso.** Mesa = consulta, no decisión vinculante en tranche-2.
5. **Conexión con PLANRUTA:** PLANMESA NO sustituye al PEO; es una de las funciones consultivas.
6. **Captura partidaria:** rotación + reglas de incompatibilidad + auditoría externa.
7. **Deslegitimación:** transparencia integral de deliberaciones + disenso público.
8. **Eliminar "constitucionalización de PLANMESA"** de tranche-2 — evaluar al cierre.
9. **PIA:** datos de participantes y deliberaciones — gate.

**Promesa pública medible:** "En 24 meses, vas a poder mirar las deliberaciones del piloto de Mesa y la respuesta del gobierno a cada recomendación."

- [ ] Steps 1–7 + commit: `patch(PLANMESA): deep review — pilot review method, no parallel agency`

### Tarea 13.B.12: Revisión profunda — `PLANTALLER_Argentina_ES.md`

**Veredicto auditoría:** "Strong pilot infrastructure. Risk: safety, standards, capture. Acción: certified pilots with insurance and audit."

**Correcciones específicas:**
1. **Estándares de seguridad firmados** como pre-requisito.
2. **Seguro obligatorio** por taller piloto.
3. **Auditoría externa** trimestral.
4. **Eliminar "red nacional de talleres"** de tranche-1/2 — diferir.
5. **Conexión con PLANEDU:** oficios + alfabetización en talleres barriales.
6. **Conexión con PLANEB:** Bastardas educativas + talleres certificados — RACI.
7. **Conexión con PLANCUIDADO:** talleres como espacio de cuidado comunitario.
8. **Captura corporativa:** transparencia financiera + cooperativas como vehículo preferido.
9. **Accidente con víctima:** protocolo de cierre + investigación + reparación obligatorio antes de relaunch.

**Promesa pública medible:** "En 24 meses, vas a poder formarte en oficios certificados en un taller cerca de tu casa."

- [ ] Steps 1–7 + commit: `patch(PLANTALLER): deep review — certified, insured, audited`

### Tarea 13.B.13: Revisión profunda — `PLANCUIDADO_Argentina_ES.md`

**Veredicto auditoría:** "Important social layer. Risk: privacy, backlash, fiscal exposure. Acción: limited registry and support pilots before broad rights regime."

**Correcciones específicas:**
1. **Registro limitado** en tranche-2, no universal en tranche-1.
2. **PIA aprobado** como gate (datos de salud, dependencia, infancia).
3. **Eliminar "ley nacional de cuidado como derecho exigible"** de tranche-1 — diferir a tranche-2/3.
4. **Backlash religioso/conservador:** mesa de diálogo + lenguaje aplicable + transparencia de uso.
5. **Conexión con PLANSAL:** materno-infantil + dependencia largo plazo.
6. **Conexión con PLANEDU:** primera infancia + escolarización inicial.
7. **Conexión con PLANVIV:** vivienda accesible para dependencia.
8. **Sub-mandato discapacidad y vejez** (de `COVERAGE_GAPS_ASSIGNMENTS.md`) — integrar a tranche-2.
9. **Eliminar "agencia de cuidado autónoma"** — programa interministerial + sunset evaluado.

**Promesa pública medible:** "En 24 meses, las familias en piloto van a tener apoyo medible para cuidar adultos mayores, niñez y personas con discapacidad."

- [ ] Steps 1–7 + commit: `patch(PLANCUIDADO): deep review — limited pilots, PIA-gated, no universal regime in tranche-1`

### Tarea 13.B.14: Revisión profunda — `PLANEN_Argentina_ES.md`

**Veredicto auditoría:** "Necessary but capital-heavy. Risk: corporate, provincial, union conflict. Acción: simplify around resilience nodes and transparent energy data."

**Correcciones específicas:**
1. **Tranche-2 = nodos de resiliencia + datos energéticos abiertos**. Sin reforma corporativa profunda en tranche-1/2.
2. **Eliminar "estatización de generadoras"** o equivalentes — diferir, evaluar caso por caso.
3. **Datos energéticos abiertos** publicados con SLA + auditoría externa.
4. **Conflicto provincial:** mapa de adhesión + incentivos a integración.
5. **Conexión con PLANTER:** litio, hidrocarburos, servidumbres — RACI clara.
6. **Conexión con PLANISV:** suelo bajo servidumbre extractiva.
7. **Conexión con PLANMOV:** electrificación gradual, no régimen acelerado.
8. **Eliminar "transición acelerada"** como compromiso tranche-2 — gradual con métricas.
9. **Captura sindical:** mesa tripartita + transparencia + transición de empleos.
10. **Sub-mandato cyber resilience eléctrica** — heredar de PLANDIG.

**Promesa pública medible:** "En 24 meses, vas a ver datos energéticos abiertos y nodos de resiliencia en provincias prioritarias."

- [ ] Steps 1–7 + commit: `patch(PLANEN): deep review — resilience+data first, structural reforms deferred`

### Tarea 13.B.15: Revisión profunda — `PLANCUL_Argentina_ES.md`

**Veredicto auditoría:** "Low-cost legitimacy asset. Risk: symbolic ornament. Acción: tie to schools, memory, care, and service metrics."

**Correcciones específicas:**
1. **Cada acción cultural amarrada** a una métrica de servicio (PLANEDU, PLANMEMORIA, PLANCUIDADO).
2. **Eliminar "ministerio de cultura ampliado"** o equivalente — execution cell en MinCultura existente.
3. **Eliminar "fondo cultural protegido constitucionalmente"** de tranche-2 — defer.
4. **Captura ideológica:** plurarias + auditoría comunitaria + transparencia de jurados.
5. **Conexión con PLANEDU:** contenido cultural en alfabetización.
6. **Conexión con PLANMEMORIA:** archivos públicos en bibliotecas/escuelas.
7. **Conexión con PLANTALLER:** producción cultural en talleres barriales.
8. **Eliminar "lengua oficial dual"** o reformas constitucionales lingüísticas de cualquier tranche.
9. **Métricas:** asistencia, contenidos producidos, escuelas y bibliotecas vivas.

**Promesa pública medible:** "En 24 meses, las bibliotecas y los talleres culturales van a estar abiertos y conectados con las escuelas en cada barrio piloto."

- [ ] Steps 1–7 + commit: `patch(PLANCUL): deep review — service-tied, no constitutional ornament`

### Tarea 13.B.16: Revisión profunda — `PLANJUS_Argentina_ES.md`

**Veredicto auditoría:** "Important but confrontational. Risk: judicial replacement narrative risky. Acción: pilot dispute resolution and anti-backlog services first."

**Correcciones específicas:**
1. **Tranche-3 como piloto** de resolución de disputas y antibacklog. **Sin reforma judicial profunda en tranche-1/2**.
2. **Eliminar "reforma constitucional de la justicia"** de tranche-1/2/3 — diferir explícitamente.
3. **Pilotos de mediación + anti-backlog** primero, no replantear el Poder Judicial.
4. **Conexión con PLANSEG:** PLANJUS no avanza sin PLANSEG estabilizado.
5. **Conexión con PLANCUIDADO:** violencia de género, niñez — fueros especiales pilotos.
6. **Conexión con PLANTER:** disputas territoriales originarias — fueros pilotos.
7. **Captura corporativa judicial:** auditoría externa de tiempos + transparencia + canales OEA.
8. **PIA:** datos de expedientes, antecedentes — sensibles.
9. **Eliminar "tribunales populares"** de cualquier tranche.
10. **Sortición de juradistas** sólo en delitos menores; no en delitos federales en piloto.

**Promesa pública medible:** "En 24 meses, los tiempos de resolución en los juzgados piloto van a estar publicados y comparables."

- [ ] Steps 1–7 + commit: `patch(PLANJUS): deep review — pilots only, no judicial replacement, no constitutional reform`

### Tarea 13.B.17: Revisión profunda — `PLANTER_Argentina_ES.md`

**Veredicto auditoría:** "Major strategic domain. Risk: litigation and federal conflict. Acción: separar internamente en tres líneas de trabajo (enforcement ambiental, auditoría de regalías, pilotos de consulta previa), pero todo dentro del mismo PLAN."

**Correcciones específicas:**
1. **Reorganizar el PLAN en tres líneas operativas internas** (sin partir el PLAN; PLANTER sigue siendo un solo PLAN):
   - **Línea 1 — Enforcement ambiental:** la línea que entra primero al piloto.
   - **Línea 2 — Auditoría de regalías extractivas:** segunda en activación, requiere convenio con provincias.
   - **Línea 3 — Pilotos de consulta previa originaria:** tercera, requiere convenio con INAI y comunidades.
   Cada línea es una sección del mismo `PLANTER_Argentina_ES.md` con sus propios gates, presupuesto y owner. **Una sola entrada en `PLAN_REGISTRY.yml`, un solo nodo en el grafo, un solo top-3 adversarial agregado.**
2. **Tranche-3 entrada** sólo si tranche-2 cerró sin litigios federales mayores. Las tres líneas pueden activarse en paralelo o secuencialmente; el PEO decide.
3. **Eliminar "personería jurídica de la naturaleza"** y "derechos territoriales constitucionalizados" de tranche-1/2 — diferir a anexo de visión 2040.
4. **Eliminar "expropiación de extracción"** de tranche-1/2/3 — diferir o evaluar caso por caso vía RACI.
5. **Pre-clearance CSJN** del marco jurídico antes de cualquier launch de cualquier línea.
6. **Adhesión provincial** crítica — mapa explícito por línea.
7. **Conexión con PLANISV:** datos de suelo cruzados (línea 1 principalmente).
8. **Conexión con PLANEN:** litio, hidrocarburos — RACI (línea 2 principalmente).
9. **Conexión con PLANAGUA:** cuencas en territorio (línea 1).
10. **Conexión con PLANVIV:** expansión urbana — RACI.
11. **PIA:** datos catastrales, comunidades — gate por línea.
12. **Comunidades originarias:** consulta previa documentada por proyecto (línea 3).

**Promesa pública medible:** "En 24 meses, las regalías extractivas y los conflictos territoriales van a estar auditados públicamente, sin sumar litigios federales."

- [ ] Steps 1–7 + commit: `patch(PLANTER): deep review — split A/B/C, defer constitutional, federal pre-clearance`

### Tarea 13.B.18: Revisión profunda — `PLANMOV_Argentina_ES.md`

**Veredicto auditoría:** "Huge strategic value but oversized. Risk: largest new budget and integration burden. Acción: estadiar internamente en cuatro líneas (movilidad básica, flete ferroviario, gobernanza AMBA, investigación AV) dentro del mismo PLAN."

**Correcciones específicas:**
1. **Reorganizar el PLAN en cuatro líneas operativas internas** (sin partir el PLAN; PLANMOV sigue siendo un solo PLAN):
   - **Línea 1 — Movilidad básica:** transporte público existente, peatonal, ciclovías. Primera en activarse.
   - **Línea 2 — Flete ferroviario:** datos abiertos + plan de inversión gradual.
   - **Línea 3 — Gobernanza AMBA-T:** acuerdo interjurisdiccional + coordinación de transporte metropolitano.
   - **Línea 4 — Investigación AV:** SOLO research. **Sin implementación operativa en ningún tranche** mientras no haya evaluación independiente firmada.
   Cada línea es una sección del mismo `PLANMOV_Argentina_ES.md` con sus propios gates, presupuesto y owner. **Una sola entrada en `PLAN_REGISTRY.yml`, un solo nodo en el grafo, un solo top-3 adversarial agregado.**
2. **Eliminar régimen AV pleno** de cualquier tranche operativo — la línea 4 es investigación indefinida hasta que existan condiciones macro y evaluación.
3. **Eliminar LNMA / PCAV / Canon de Automatización** como entregables tranche-1/2.
4. **Eliminar BAMD/MKC** como leyes tranche-1.
5. **Tranche-3 entrada** sólo para líneas 1, 2 y 3. La línea 4 permanece en research indefinida.
6. **Conflicto AMBA-provincias:** acuerdo interjurisdiccional documentado pre-launch (línea 3 principalmente).
7. **Captura sindical transporte:** mesa tripartita + transición digna (líneas 1 y 2).
8. **Procurement OS** (heredado) operativo antes de capital pesado.
9. **PIA:** desplazamiento personal, geolocalización vehicular — gate por línea.
10. **Conexión con PLANEN:** electrificación gradual (líneas 1 y 2).
11. **Conexión con PLANTER:** servidumbres ferroviarias (línea 2).
12. **Conexión con PLANCUIDADO:** accesibilidad universal (línea 1).
13. **Reintegración cruzada** post-auditoría (Tarea 8.2) ya hecha — verificar coherencia.
14. **Cap presupuestario:** sin exceder 25% del libro mayor anual de tranche-3, sumadas las cuatro líneas.

**Promesa pública medible:** "En 24 meses, vas a tener transporte público mejorado en AMBA y datos abiertos de flete ferroviario; AV queda en investigación."

- [ ] Steps 1–7 + commit: `patch(PLANMOV): deep review — 4 internal lines (no plan split), AV research-only, AMBA governance pilot`

### Tarea 13.B.19: Revisión profunda — `PLANMEMORIA_Argentina_ES.md`

**Veredicto auditoría:** "Good anti-reversion layer. Risk: privacy and politicization. Acción: start with public-policy memory, not sensitive personal archives."

**Correcciones específicas:**
1. **Tranche-3 entrada** con archivos de **políticas públicas**, no archivos personales sensibles.
2. **Eliminar "archivo nacional de violaciones"** o equivalentes con datos personales sensibles de tranche-1/2/3 — diferir + PIA reforzado.
3. **PIA aprobado** como gate.
4. **Captura ideológica:** consejo plural rotativo + auditoría externa.
5. **Conexión con PLANCUL:** memoria pública en bibliotecas/escuelas.
6. **Conexión con PLANJUS:** memoria de fallos y precedentes — pública.
7. **Conexión con PLANRUTA:** memoria del PEO + ledger de decisiones — vinculante.
8. **Eliminar "ley nacional de memoria"** de tranche-3 si requiere mayoría especial — diferir o reformular como decreto.

**Promesa pública medible:** "En 24 meses, vas a poder mirar la memoria documentada de las decisiones de gobierno y por qué se tomaron."

- [ ] Steps 1–7 + commit: `patch(PLANMEMORIA): deep review — policy memory first, sensitive archives deferred`

### Tarea 13.B.20: Revisión profunda — `PLANSUS_Argentina_ES.md`

**Veredicto auditoría:** "Strategically serious but too early. Risk: high political, security, diplomatic risk. Acción: research and harm-reduction only until safety capacity exists."

**Correcciones específicas:**
1. **Estado: research-only / diferido** en tranche-1/2/3.
2. **Eliminar "legalización plena"** de cualquier ventana de tranche — solo research + reducción de daños.
3. **PLANSUS no avanza** a piloto operativo mientras PLANSEG no haya estabilizado fuerzas (referenciar).
4. **Reducción de daños** sí en tranche-2/3 (programas de salud, no comercialización).
5. **Captura narco:** sección de mitigación con inteligencia + auditoría + cooperación internacional.
6. **Backlash religioso:** diálogo + lenguaje aplicable + transparencia.
7. **Conexión con PLANSAL:** salud mental + adicciones — sí en tranche-1/2.
8. **Conexión con PLANJUS:** despenalización selectiva pre-comercialización — investigación.
9. **Eliminar "ANRD agencia"** como vehículo cualquier tranche — research cell académica.
10. **Conservar visión 2040** en anexo.

**Promesa pública medible:** "En 24 meses, los programas de reducción de daños van a estar funcionando con datos públicos; la legalización queda en investigación."

- [ ] Steps 1–7 + commit: `patch(PLANSUS): deep review — research+harm-reduction only, deferred operationally`

### Tarea 13.B.21: Revisión profunda — `PLANMON_Argentina_ES.md`

**Veredicto auditoría:** "Elegant but premature. Risk: macro destabilization and trust risk. Acción: keep as monetary lab; no national rollout."

**Correcciones específicas:**
1. **Estado: research-only / diferido**.
2. **Eliminar "moneda nacional alternativa"** de cualquier ventana de tranche — laboratorio académico (convenio universidades + BCRA).
3. **Eliminar "DCM nacional"**, "Canon de Automatización monetario" como entregables tranche-1/2/3.
4. **Eliminar reforma de Carta Orgánica BCRA** de tranche-1/2 — opinión legal stub (`LEGAL_OPINIONS/PLANMON.md`) requerida para cualquier consideración tranche-3+.
5. **Estabilización macro previa** como pre-requisito explícito.
6. **Corrida cambiaria:** sección de mitigación con coordinación BCRA + multilateral.
7. **Conexión con capacidades del estadio B de PLANDIG:** los rieles monetarios dependen del estadio B, también diferido.
8. **Sin presupuesto operativo** en tranche-1/2 — sólo gasto de research bajo F01 reasignación interna mínima.
9. **Conservar visión 2040** en anexo.

**Promesa pública medible:** "En 24 meses, no vamos a haber lanzado moneda nueva; vamos a tener resultados de laboratorio publicados sin compromiso de implementación."

- [ ] Steps 1–7 + commit: `patch(PLANMON): deep review — academic lab only, no rollout, BCRA-coordinated`

### Tarea 13.B.22: Revisión profunda — `PLANGEO_Argentina_ES.md`

**Veredicto auditoría:** "Useful as internal shield. Risk: public confrontational posture risky. Acción: keep as private strategic analysis and sober diplomacy."

**Correcciones específicas:**
1. **Estado: research interno + diplomacia sobria**. Sin material confrontacional público en tranche-1/2/3.
2. **Eliminar "doctrina antiimperialista"** o similares de plataforma pública — queda en doctrina interna (`VEHICULO_POLITICO_BASTA.md`).
3. **Diplomacia sobria** como modo público.
4. **Conexión con PLANDIG:** ciberdefensa básica como sub-mandato (de `COVERAGE_GAPS_ASSIGNMENTS.md`).
5. **Retaliación geopolítica:** mitigación con relaciones multilaterales + comunicación medida.
6. **Eliminar "soberanía total"** como término — reformular como "autonomía estratégica selectiva".
7. **PLANGEO no firma** declaraciones unilaterales sin RACI cruzada con Cancillería.

**Promesa pública medible:** No aplica plataforma pública confrontacional. Promesa interna: "El análisis estratégico va a estar listo para que el gobierno tome decisiones informadas sin exponernos."

- [ ] Steps 1–7 + commit: `patch(PLANGEO): deep review — internal shield, sober public diplomacy, no confrontational platform`

### Tarea 13.B.23: Revisión profunda — `PLAN24CN_Argentina_ES.md`

**Veredicto auditoría:** "Visionary but deferred. Risk: new cities before existing habitat wins. Acción: pause; use design labs only."

**Correcciones específicas:**
1. **Estado: research-only / diferido completo**.
2. **Eliminar "construcción de Capital Nacional"** o ciudades nuevas de tranche-1/2/3 — solo labs de diseño.
3. **PLANVIV gana** la competencia por presupuesto urbano en tranche-1/2/3.
4. **Conexión con PLANTER:** ningún sitio de ciudad nueva sin consulta previa documentada.
5. **Conexión con PLANEN:** sin compromisos energéticos de gran escala.
6. **Conexión con capacidades del estadio B de PLANDIG:** gemelo digital de ciudad — diferido.
7. **Captura inmobiliaria:** sin compromisos de tierra hasta que existan resultados de PLANVIV.
8. **Labs de diseño:** convenio con universidades, sin presupuesto de inversión.
9. **Conservar visión 2040** en anexo.

**Promesa pública medible:** "En 24 meses, no vamos a haber empezado ninguna ciudad nueva; vamos a tener diseños y aprendizajes publicados."

- [ ] Steps 1–7 + commit: `patch(PLAN24CN): deep review — design labs only, no construction, PLANVIV priority`

---

## Fase 13.C — Sweeps de Coherencia Cruzada (post-revisión profunda)

> Después de Fase 13.B, ejecutar los siguientes sweeps automatizables como verificación final. Cada sweep es un grep contra los 23 archivos. Si encuentra coincidencias, abrir el archivo, corregir, commitear con `fix(sweep-N): {descripción}`.

### Tarea 13.C.1: Sweep 1 — Future returns en tranche-1

- [ ] **Step 1: Buscar referencias a `future_return` en secciones tranche-1**

```bash
cd "/Users/juanb/Desktop/ElInstantedelHombreGris"
for f in "Iniciativas Estratégicas"/PLAN*_Argentina_ES.md; do
  awk '/[Tt]ranche-1|[Ff]ase 1|[Aa]ño 1/,/[Tt]ranche-2|[Ff]ase 2|[Aa]ño 2/' "$f" \
    | grep -E "ahorro PLANREP|reflujo|renta capturada|canon AV|future_return|retorno futuro|fondo soberano" \
    && echo "FALLA tranche-1 future return: $f"
done
```

- [ ] **Step 2:** Para cada FALLA, editar el archivo: reescribir la línea como "se evaluará al cierre de tranche-1" o eliminar.
- [ ] **Step 3:** Commit por archivo afectado: `fix(sweep-1): remove future returns from tranche-1 in {PLAN}`.

### Tarea 13.C.2: Sweep 2 — Dependencia de capacidades del estadio B de PLANDIG en tranche-1/2

- [ ] **Step 1: Buscar capacidades del estadio B de PLANDIG en secciones tempranas**

```bash
for f in "Iniciativas Estratégicas"/PLAN*_Argentina_ES.md; do
  awk '/[Tt]ranche-1|[Tt]ranche-2|[Ff]ase 1|[Ff]ase 2/,/[Tt]ranche-3|[Ff]ase 3/' "$f" \
    | grep -E "ArgenCloud|SAPI completa|LANIA|gemelo digital|frontier AI|gobernanza algorítmica|rieles monetarios|cloud soberano" \
    && echo "FALLA dep estadio B PLANDIG: $f"
done
```

- [ ] **Step 2:** Para cada FALLA, reescribir como "capacidad del estadio A de PLANDIG" o "diferido al estadio B de PLANDIG (tranche-3+)".
- [ ] **Step 3:** Commit: `fix(sweep-2): defer PLANDIG stage-B dependencies in {PLAN}`.

### Tarea 13.C.3: Sweep 3 — Reformas constitucionales en tranche-1/2

- [ ] **Step 1: Buscar reformas constitucionales sin cláusula de diferimiento**

```bash
for f in "Iniciativas Estratégicas"/PLAN*_Argentina_ES.md; do
  grep -n "reforma constitucional\|enmienda constitucional\|constitucionaliz" "$f" \
    | grep -v "diferid\|tranche-3\|fase 3\|2040\|anexo\|visión\|investigación" \
    && echo "FALLA constitucional sin diferir: $f"
done
```

- [ ] **Step 2:** Cada FALLA → agregar cláusula `(diferida a tranche-3+ por defecto, ver CASCADA_LEGAL_BASTA.md)`.
- [ ] **Step 3:** Commit: `fix(sweep-3): mark constitutional reforms as deferred in {PLAN}`.

### Tarea 13.C.4: Sweep 4 — PLANes Rojo con lenguaje de implementación

- [ ] **Step 1: Buscar verbos operativos en PLANMON, PLANSUS, PLAN24CN**

```bash
for f in "Iniciativas Estratégicas"/PLANMON_Argentina_ES.md "Iniciativas Estratégicas"/PLANSUS_Argentina_ES.md "Iniciativas Estratégicas"/PLAN24CN_Argentina_ES.md; do
  grep -nE "lanzaremos|implementaremos|construiremos|inauguraremos|ejecutaremos|operativizaremos" "$f" \
    | grep -v "investigación\|laboratorio\|research\|piloto académico" \
    && echo "FALLA verbo operativo en Rojo: $f"
done
```

- [ ] **Step 2:** Cada FALLA → demote a "investigaremos / evaluaremos / publicaremos resultados de laboratorio".
- [ ] **Step 3:** Commit: `fix(sweep-4): demote operational verbs in Rojo plans`.

### Tarea 13.C.5: Sweep 5 — PLANes Ámbar sin sección "qué simplificamos"

- [ ] **Step 1: Verificar presencia de la sección**

```bash
for code in PLANSEG PLANJUS PLANEN PLANREP PLANMOV PLANTER; do
  f="Iniciativas Estratégicas/${code}_Argentina_ES.md"
  grep -q "Lo que simplificamos\|Qué simplificamos\|Simplificación post-auditoría" "$f" \
    || echo "FALLA sección simplificación: $code"
done
```

- [ ] **Step 2:** Cada FALLA → insertar al inicio del cuerpo:

```markdown
## Simplificación post-auditoría 2026-04-26 (PLAN clasificado Ámbar)

La auditoría 2026-04-26 clasificó este PLAN como `Ámbar`, requiriendo simplificación o división. Las decisiones tomadas:

- {3-5 viñetas concretas de qué se sacó / pospuso / dividió, con justificación}.
```

- [ ] **Step 3:** Commit: `fix(sweep-5): explicit simplification block in Ámbar plan {code}`.

### Tarea 13.C.6: Sweep 6 — Anclaje a líneas internas de PLANMOV y PLANTER

- [ ] **Step 1: Verificar que las dependencias con PLANMOV nombren su línea interna**

```bash
for f in "Iniciativas Estratégicas"/PLAN*_Argentina_ES.md; do
  if grep -q "PLANMOV" "$f" && [ "$(basename "$f")" != "PLANMOV_Argentina_ES.md" ]; then
    grep -q "línea 1\|línea 2\|línea 3\|línea 4\|movilidad básica\|flete ferroviario\|AMBA-T\|investigación AV" "$f" \
      || echo "INFO: $f referencia PLANMOV pero no la línea interna aplicable"
  fi
done
```

- [ ] **Step 2: Verificar lo mismo para PLANTER**

```bash
for f in "Iniciativas Estratégicas"/PLAN*_Argentina_ES.md; do
  if grep -q "PLANTER" "$f" && [ "$(basename "$f")" != "PLANTER_Argentina_ES.md" ]; then
    grep -q "línea 1\|línea 2\|línea 3\|enforcement ambiental\|regalías\|consulta previa originaria" "$f" \
      || echo "INFO: $f referencia PLANTER pero no la línea interna aplicable"
  fi
done
```

- [ ] **Step 3:** Para cada INFO crítico (PLANAGUA, PLANVIV, PLANEN, PLANSAL, PLANEDU, PLANISV, PLAN24CN, PLANCUIDADO), agregar nota: "La dependencia con PLANMOV/PLANTER se especifica respecto de la línea interna aplicable (sin que esto implique partir el PLAN). Ver `DEPENDENCY_GRAPH.yml`."
- [ ] **Step 4:** Commit: `fix(sweep-6): anchor dependencies to internal lines of PLANMOV/PLANTER (no plan split)`.

### Tarea 13.C.7: Sweep 7 — Voz pública vs doctrina interna

- [ ] **Step 1: Buscar lenguaje espiritual/cultural en plataforma pública**

```bash
grep -n "Hombre Gris\|sagrado\|alma\|espíritu de la nación\|místico\|trascendente" \
  "Iniciativas Estratégicas/PLATAFORMA_PUBLICA_5_MISIONES.md" \
  && echo "FALLA voz pública con doctrina"
```

- [ ] **Step 2:** Cada FALLA → mover a doctrina (`VEHICULO_POLITICO_BASTA.md`) y reemplazar en plataforma con lenguaje civil.
- [ ] **Step 3:** Commit: `fix(sweep-7): separate doctrine from public platform language`.

### Tarea 13.C.8: Sweep 8 — Agencias autónomas redundantes

- [ ] **Step 1: Listar todas las agencias propuestas en tranche-1**

```bash
for f in "Iniciativas Estratégicas"/PLAN*_Argentina_ES.md; do
  awk '/[Tt]ranche-1|[Ff]ase 1/,/[Tt]ranche-2|[Ff]ase 2/' "$f" \
    | grep -iE "agencia|ente autónomo|autoridad nacional|instituto autónomo" \
    | head -5 \
    && echo "REVISAR agencias en: $f"
done
```

- [ ] **Step 2:** Cada agencia listada en tranche-1 que no esté en `TABLA_AGENCIAS_BASTA.md` con condición autonomía cumplida → reemplazar por "execution cell en {ministerio}".
- [ ] **Step 3:** Commit: `fix(sweep-8): replace redundant tranche-1 agencies with execution cells in {PLAN}`.

### Tarea 13.C.9: Sweep 9 — Sortición sin justificación

- [ ] **Step 1: Buscar usos de sortición**

```bash
for f in "Iniciativas Estratégicas"/PLAN*_Argentina_ES.md; do
  grep -nE "sortición|sortear|sortição|jurado popular|panel ciudadano" "$f" \
    | grep -v "control\|veeduría\|consulta\|legitimidad\|oversight" \
    && echo "REVISAR sortición: $f"
done
```

- [ ] **Step 2:** Cada uso revisado: si no resuelve un problema concreto de legitimidad o supervisión, eliminar o reemplazar con un mecanismo más simple.
- [ ] **Step 3:** Commit: `fix(sweep-9): prune sortition without legitimacy/oversight justification in {PLAN}`.

### Tarea 13.C.10: Sweep 10 — Re-anchor de fechas relativas

- [ ] **Step 1: Buscar "Año 0/1/2/3" en tablas de cronograma**

```bash
for f in "Iniciativas Estratégicas"/PLAN*_Argentina_ES.md; do
  grep -nE "Año 0|Año 1|Año 2|Año 3|Año 4|Año 5" "$f" \
    | grep -v "anexo\|visión\|2040\|histórico" \
    && echo "REVISAR fecha relativa: $f"
done
```

- [ ] **Step 2:** Cada uso → reemplazar por ventana absoluta (ej. "Año 1" → "2026-2027" si tranche-1; "2028-2029" si tranche-2; etc.).
- [ ] **Step 3:** Commit: `fix(sweep-10): convert relative dates to absolute windows in {PLAN}`.

### Tarea 13.C.11: Sweep 11 — Promesa pública presente

- [ ] **Step 1: Verificar que cada PLAN tenga la promesa**

```bash
for code in PLANAGUA PLANVIV PLANSAL PLANSEG PLANDIG PLANISV PLANEB PLANREP PLANEN PLANEDU PLANCUL PLANJUS PLANSUS PLANMON PLANGEO PLAN24CN PLANMESA PLANTALLER PLANCUIDADO PLANMEMORIA PLANTER PLANMOV PLANRUTA; do
  f="Iniciativas Estratégicas/${code}_Argentina_ES.md"
  grep -q "Promesa pública medible\|notar a 24 meses\|vas a notar\|vas a tener\|vas a poder\|vas a ver" "$f" \
    || echo "FALLA promesa pública: $code"
done
```

- [ ] **Step 2:** Cada FALLA → insertar la promesa de la Tarea 13.B correspondiente.
- [ ] **Step 3:** Commit: `fix(sweep-11): insert public promise in {PLAN}`.

### Tarea 13.C.12: Sweep 12 — Top-3 adversarial presente

- [ ] **Step 1: Verificar**

```bash
for code in PLANAGUA PLANVIV PLANSAL PLANSEG PLANDIG PLANISV PLANEB PLANREP PLANEN PLANEDU PLANCUL PLANJUS PLANSUS PLANMON PLANGEO PLAN24CN PLANMESA PLANTALLER PLANCUIDADO PLANMEMORIA PLANTER PLANMOV PLANRUTA; do
  f="Iniciativas Estratégicas/${code}_Argentina_ES.md"
  grep -q "Top-3 attack paths\|Top 3 adversarial\|tres ataques\|attack paths" "$f" \
    || echo "FALLA top-3: $code"
done
```

- [ ] **Step 2:** Cada FALLA → insertar el top-3 desde `READINESS_GATES_ADVERSARIAL.md`.
- [ ] **Step 3:** Commit: `fix(sweep-12): insert top-3 adversarial paths in {PLAN}`.

### Tarea 13.C.13: Sweep 13 — PIA referenciada cuando hay datos personales

- [ ] **Step 1: Verificar que los PLANes con datos personales referencien su PIA**

```bash
for code in PLANDIG PLANMEMORIA PLANCUIDADO PLANSEG PLANJUS PLANMOV PLANMON PLANSAL PLANEDU PLANVIV PLANREP; do
  f="Iniciativas Estratégicas/${code}_Argentina_ES.md"
  grep -q "PIA/\|Privacy Impact\|Evaluación de Impacto en Privacidad" "$f" \
    || echo "FALLA PIA: $code"
done
```

- [ ] **Step 2:** Cada FALLA → insertar bloque: `> **PIA gate:** este PLAN no avanza a piloto sin PIA aprobado. Ver \`PIA/{PLAN}.md\`.`
- [ ] **Step 3:** Commit: `fix(sweep-13): wire PIA gates in data-touching plans`.

### Tarea 13.C.14: Sweep 14 — Frontmatter REVISION_PROFUNDA

- [ ] **Step 1: Verificar que cada PLAN tenga marcador de revisión**

```bash
for code in PLANAGUA PLANVIV PLANSAL PLANSEG PLANDIG PLANISV PLANEB PLANREP PLANEN PLANEDU PLANCUL PLANJUS PLANSUS PLANMON PLANGEO PLAN24CN PLANMESA PLANTALLER PLANCUIDADO PLANMEMORIA PLANTER PLANMOV PLANRUTA; do
  f="Iniciativas Estratégicas/${code}_Argentina_ES.md"
  grep -q "REVISION_PROFUNDA: completed" "$f" \
    || echo "FALTA marcador completed: $code"
done
```

- [ ] **Step 2:** Cada FALTA → agregar al frontmatter: `> **REVISION_PROFUNDA:** completed 2026-MM-DD per PLAYBOOK_REVISION_PROFUNDA.md`.
- [ ] **Step 3:** Commit final del sweep: `chore(sweeps): close out deep-review markers across all 23 plans`.

### Tarea 13.C.15: Reporte final de revisión profunda

**Files:**
- Create: `Iniciativas Estratégicas/REVISION_PROFUNDA_REPORT.md`

- [ ] **Step 1: Generar reporte automatizado**

```markdown
# Reporte de Revisión Profunda — 23 PLANes

> **STATUS:** current
> **FECHA:** {fecha al cierre}

## Resumen por PLAN

| PLAN | Tranche | Misión | Sweeps fallidos | Editorial completado | Commits |
|------|---------|--------|-----------------|----------------------|---------|
| ... | ... | ... | ... | ... | ... |

(Una fila por PLAN. Llenar con los resultados de los sweeps 13.C.1 a 13.C.14.)

## Métricas agregadas

- Sweeps ejecutados: 14.
- PLANes con cero fallas: ...
- PLANes con remediación adicional requerida: ...
- Líneas modificadas: ...
- Anexos históricos creados: ...

## Hallazgos transversales

(Lista de patrones repetidos: ej. "tres PLANes referían a PLANMOV sin nombrar la línea interna aplicable", "cinco PLANes mantenían fechas relativas en tablas de presupuesto", etc.)

## Próximos pasos

- Cierre de remediación → ver `REMEDIATION_CLOSEOUT_2026-04-26.md`.
- Evaluación al mes 12 de tranche-1.
```

- [ ] **Step 2: Commit final**

```bash
git add "Iniciativas Estratégicas/REVISION_PROFUNDA_REPORT.md"
git commit -m "feat(report): deep-review final report consolidates 23-plan corrections"
```

---

## Fase 14 — Cobertura de Huecos sin Crear PLANes

### Tarea 14.1: Crear `COVERAGE_GAPS_ASSIGNMENTS.md`

**Files:**
- Create: `Iniciativas Estratégicas/COVERAGE_GAPS_ASSIGNMENTS.md`

- [ ] **Step 1: Asignar cada hueco a un PLAN existente**

```markdown
# Asignación de Huecos de Cobertura — Sin Nuevos PLANes

> **STATUS:** current
> **PRINCIPIO:** todo hueco identificado en la auditoría sección "Coverage Gaps" se asigna como sub-mandato de un PLAN existente. Freeze sigue activo.

| Hueco | PLAN huésped | Sub-mandato | Owner | Tranche |
|-------|--------------|-------------|-------|---------|
| Federalismo fiscal y coparticipación | PLANREP | sub-mandato "Coparticipación y Tributación" (sección interna del PLAN huésped, no PLAN nuevo) | Tesorero PEO + MinEconomía | tranche-2 |
| Procurement y anti-corrupción | PLANDIG + PLANREP | "Procurement OS" | Custodio Registro PEO | tranche-1 (lanzar) |
| Modelo operativo del Estado civil | PLANREP | "Civil Service Operating Model" | PEO Oficial Capacidad | tranche-2 |
| Transición sector privado | PLANEB + PLANEN + PLANEDU | "Transición productiva" | Mesa de Gobierno | transversal |
| Defensa y ciberdefensa | PLANGEO + PLANDIG | "Cyber Resilience" | Oficial Seguridad PEO | tranche-1 (cyber-min) |
| Discapacidad y vejez | PLANCUIDADO + PLANSAL | "Cuidado largo plazo" | Cabeza PLANCUIDADO | tranche-2 |
| Cultura de mantenimiento | PLANVIV + PLANAGUA + PLANEN + PLANMOV | "Maintenance discipline" | Tesorero PEO | transversal |
| Autoridad de evaluación independiente | PLANRUTA | "Evaluador Independiente con poder de stop" | Director PEO | tranche-1 |
| Ciencia y tecnología (PLANCYT) | PLANEDU + PLANEB + PLANDIG | sub-mandato "CyT distribuido" (secciones internas dentro de cada PLAN huésped, no PLAN nuevo) | Cabeza PLANEDU | tranche-2 |

## Reglas

1. Cada sub-mandato hereda el tranche del PLAN huésped.
2. Cada sub-mandato tiene un párrafo en el archivo del PLAN huésped (a agregar como continuación del parche de Fase 13).
3. Si un sub-mandato crece más allá de cierto tamaño (≥ 1.5x del PLAN huésped en presupuesto), gateo de spin-off al cierre de tranche.
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/COVERAGE_GAPS_ASSIGNMENTS.md"
git commit -m "feat(gaps): assign coverage gaps to existing plans (no new PLANes)"
```

### Tarea 14.2: Refrescar baselines

**Files:**
- Create: `Iniciativas Estratégicas/BASELINES_REFRESH_2026.md`

- [ ] **Step 1: Lista de baselines a verificar antes de cualquier release público**

```markdown
# Refresh de Baselines — Pre-publicación

| Baseline | Fuente sugerida | Última verificación | Estado |
|----------|-----------------|---------------------|--------|
| PBI 2026 nominal y real | INDEC + IMF WEO | pendiente | TODO |
| Gasto público consolidado / PBI | MinEconomía + ASAP | pendiente | TODO |
| Capacidad multilateral (BID, BM, CAF) | reportes anuales 2025 | pendiente | TODO |
| Estado del RIGI | BORA + jurisprudencia | pendiente | TODO |
| Carta orgánica BCRA vigente | BCRA | pendiente | TODO |
| FONAVI / RENABAP | MinHabitat | pendiente | TODO |
| Ley de Bosques + ambiente | Min Ambiente | pendiente | TODO |
| Concesiones de transporte | CNRT | pendiente | TODO |
| Federalismo fiscal | Coparticipación 2025 | pendiente | TODO |
| Estatus AV regulación | reglas de tránsito provinciales | pendiente | TODO |
| Identidad digital (RENAPER) | reportes públicos | pendiente | TODO |
| Tokenización legal | CNV + UIF | pendiente | TODO |
| Drogas / regulación | Sedronar + jurisprudencia | pendiente | TODO |

**Regla:** ningún número ni cita legal se publica externamente sin baseline verificada en los últimos 90 días.
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/BASELINES_REFRESH_2026.md"
git commit -m "feat(baselines): pre-publication baseline refresh checklist"
```

---

## Fase 15 — Coherencia Final

### Tarea 15.1: Recomputar `PROTOCOLOS_OPERATIVOS_BASTA.md`

**Files:**
- Modify: `PROTOCOLOS_OPERATIVOS_BASTA.md`

- [ ] **Step 1: Reescribir cuerpo principal**

Cambiar STATUS a `current` y SUCCESSOR a none. Conservar análisis previo bajo "## Anexo histórico — Protocolos 16-mandatos". Agregar al inicio:

```markdown
## Protocolos Operativos — Versión 22 PLANes + PLANRUTA

> **PRINCIPIO:** los flujos críticos se enumeran respecto del registro canónico (`PLAN_REGISTRY.yml`) y del grafo (`DEPENDENCY_GRAPH.yml`).

### Flujos críticos

(Listar 20–25 flujos inter-PLAN, cada uno con: origen, destino, dato/recurso transferido, frecuencia, owner del flujo, fallback.)

| ID | Flujo | Origen | Destino | Dato | Frecuencia | Owner | Fallback |
|----|-------|--------|---------|------|------------|-------|----------|
| F-01 | Datos de cuenca | PLANAGUA | PLANISV | métricas hídricas | mensual | Cabeza PLANAGUA | reportes manuales |
| F-02 | Métricas escolares | PLANEDU | PLANCUIDADO | asistencia | semanal | Cabeza PLANEDU | reportes provinciales |
| F-03 | Identidad-lite | PLANDIG | todos | autenticación | tiempo real | Subsecretaría Datos | DNI físico |
| F-04 | Stock medicamentos | PLANSAL | PLANCUIDADO | inventario | semanal | Cabeza PLANSAL | reportes manuales |
| F-05 | Mapa de pobreza | PLANVIV | PLANSAL/PLANEDU | RENABAP | mensual | MinHabitat | INDEC |
| F-06 | Suelo medido | PLANISV | PLANAGUA/PLANEN/PLANTER | datos | trimestral | INTA | universidades |
| F-07 | Costos Bastardas | PLANEB | público + PEO | precios | mensual | ANEB | publicación manual |
| F-08 | Logs auditoría | PLANDIG | PEO | inmutables | tiempo real | Subsecretaría Datos | logs locales firmados |
| F-09 | Riesgo fiscal | Tesorero PEO | Mesa Gobierno | libro mayor | mensual | Tesorero PEO | reporte físico |
| F-10 | Avance gates | Director PEO | Mesa Gobierno | matriz | mensual | Director PEO | reporte físico |
| F-11 | Adhesión provincial | PEO Legal | PEO + cabezas | estado | mensual | Oficial Legal | reporte físico |
| F-12 | Coalición | Oficial Comunicación | Mesa Gobierno | mapa | trimestral | Oficial Comunicación | reporte físico |
| F-13 | Investigación PLANSUS | research cell | PEO | informes | trimestral | Cabeza PLANSUS | reporte físico |
| F-14 | Métricas evaluación | Oficial Evaluación | Mesa Gobierno | KPIs | trimestral | Oficial Evaluación | reporte físico |
| F-15 | PIA status | Oficial Seguridad | PEO + Mesa | tablero | mensual | Oficial Seguridad | reporte físico |
| F-16 | Gates kill/scale | Director PEO | público | dashboard | mensual | Director PEO | publicación manual |
| F-17 | Conflictos territoriales | PLANTER | PEO | bitácora | semanal | Cabeza PLANTER | reporte físico |
| F-18 | Pulso PLANMESA | PLANMESA | PEO | resumen deliberativo | mensual | Cabeza PLANMESA | reporte físico |
| F-19 | Stress tests | Tesorero PEO | Mesa | escenarios | trimestral | Tesorero PEO | reporte físico |
| F-20 | Convenios multilaterales | Oficial Legal | Tesorero | estado | mensual | Oficial Legal | reporte físico |
| F-21 | Censo escolar | PLANEDU | PEO | rendimiento | trimestral | Cabeza PLANEDU | INDEC |
| F-22 | Salud APS | PLANSAL | PEO | cobertura | mensual | Cabeza PLANSAL | provincias |
| F-23 | Ciberseguridad | Oficial Seguridad | PEO + Mesa | incidentes | tiempo real | Oficial Seguridad | reporte físico firmado |
| F-24 | Coalición pública | Oficial Comunicación | público | dashboard | mensual | Oficial Comunicación | publicación manual |
| F-25 | Re-auditoría anual | auditor externo | Mesa | informe | anual | auditor externo | reporte físico |

### Reglas

1. Todo flujo crítico tiene fallback manual operable durante 30 días.
2. La indisponibilidad de PLANDIG activa los fallbacks manuales automáticamente.
3. Cada flujo tiene retención clara y privacy class por su PIA.
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PROTOCOLOS_OPERATIVOS_BASTA.md" "Iniciativas Estratégicas/PLAN_REGISTRY.yml"
git commit -m "feat(protocolos): rebuild critical flows for 22 plans with manual fallbacks"
```

### Tarea 15.2: Recomputar `MASTER_COHERENCE_REPORT.md`

**Files:**
- Modify: `MASTER_COHERENCE_REPORT.md`

- [ ] **Step 1: Reemplazar resumen ejecutivo**

Cambiar STATUS a `current`. Insertar al inicio del cuerpo:

```markdown
## Estado canónico (post-auditoría 2026-04-26)

- Conteo: **22 PLANes temáticos + PLANRUTA protocolo**.
- Registro: `PLAN_REGISTRY.yml` (única fuente de verdad).
- Grafo: `DEPENDENCY_GRAPH.yml`.
- Hoja de ruta: `HOJA_DE_RUTA_CONSOLIDADA_BASTA.md` (recomputada).
- Cascada legal: `CASCADA_LEGAL_BASTA.md` (LMV con 8 instrumentos en tranche-1).
- Libro mayor: `SOURCE_OF_FUNDS_LEDGER.md`.
- RACI: `RACI_MATRIX.md`.
- PEO: `PORTFOLIO_EXECUTION_OFFICE.md`.
- Riesgo: `portfolio_risk_register.md`.
- Gates: `KILL_SCALE_GATES.md`, `READINESS_GATES_ADVERSARIAL.md`.
- Plataforma pública: `PLATAFORMA_PUBLICA_5_MISIONES.md`.

**Eliminado:** la frase "vigesimo tercer mandato" referida a PLANMOV. PLANMOV es el 22° plan temático.

**Eliminado:** referencias a "20/21/16 mandatos" en docs current. Se conservan en histórico/superseded con nota.
```

Conservar el resto del archivo bajo "## Análisis previo de coherencia (mantener como referencia)".

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/MASTER_COHERENCE_REPORT.md" "Iniciativas Estratégicas/PLAN_REGISTRY.yml"
git commit -m "feat(coherence): canonical state summary supersedes contradictory passages"
```

### Tarea 15.3: Auditoría final de cross-references rotos

**Files:** ninguno (verificación)

- [ ] **Step 1: Buscar referencias a archivos renombrados o eliminados**

```bash
cd "/Users/juanb/Desktop/ElInstantedelHombreGris/Iniciativas Estratégicas"
grep -rn "ANALISIS_CONEXIONES_20_PLANES" . --include="*.md" --include="*.yml" || echo "OK: ninguna referencia rota al archivo renombrado"
grep -rn "PLANISV_Argentina_ES.docx\|PLANISV_raw.txt" . --include="*.md" --include="*.yml" | grep -v audit/legacy || echo "OK: ninguna referencia al artefacto archivado fuera de audit/legacy"
grep -rn "23er mandato\|vigesimo tercer mandato\|mandato 23" . --include="*.md" || echo "OK: ninguna referencia residual al 23er mandato"
grep -rn "16 mandato\|16 Mandato" . --include="*.md" | grep -v "STATUS: superseded\|histórico\|Anexo" || echo "OK: ninguna referencia a 16 mandatos fuera de anexos históricos"
```

- [ ] **Step 2: Si algo aparece, abrir el archivo, corregir y commitear con `fix(refs): repair broken cross-reference in {file}`**

- [ ] **Step 3: Commit final si hubo cambios; si no, no commit**

### Tarea 15.4: Verificación de integridad del registro

**Files:** ninguno (verificación)

- [ ] **Step 1: Verificar que cada PLAN del registro tiene archivo presente**

```bash
cd "/Users/juanb/Desktop/ElInstantedelHombreGris/Iniciativas Estratégicas"
for code in PLANAGUA PLANVIV PLANSAL PLANSEG PLANDIG PLANISV PLANEB PLANREP PLANEN PLANEDU PLANCUL PLANJUS PLANSUS PLANMON PLANGEO PLAN24CN PLANMESA PLANTALLER PLANCUIDADO PLANMEMORIA PLANTER PLANMOV PLANRUTA; do
  test -f "${code}_Argentina_ES.md" || echo "FALTA archivo: ${code}_Argentina_ES.md"
done
# No debe imprimir nada
```

- [ ] **Step 2: Verificar que todos los PLAN files tienen el parche post-auditoría**

```bash
for code in PLANAGUA PLANVIV PLANSAL PLANSEG PLANDIG PLANISV PLANEB PLANREP PLANEN PLANEDU PLANCUL PLANJUS PLANSUS PLANMON PLANGEO PLAN24CN PLANMESA PLANTALLER PLANCUIDADO PLANMEMORIA PLANTER PLANMOV PLANRUTA; do
  grep -q "Parche post-auditoría 2026-04-26" "${code}_Argentina_ES.md" || echo "FALTA parche en: ${code}"
done
# No debe imprimir nada
```

- [ ] **Step 3: Verificar que todos los soportes tienen STATUS frontmatter**

```bash
for f in MATRIZ_MISIONES_Y_PLANES_ES.md CASCADA_LEGAL_BASTA.md PROTOCOLOS_OPERATIVOS_BASTA.md HOJA_DE_RUTA_CONSOLIDADA_BASTA.md ANALISIS_CONEXIONES_22_PLANES.md PRESUPUESTO_CONSOLIDADO_BASTA.md TABLA_AGENCIAS_BASTA.md SIMULACION_ADVERSARIAL_BASTA.md BLINDAJE_INSTITUCIONAL_BASTA.md VEHICULO_POLITICO_BASTA.md ARQUITECTURA_PLATAFORMA_CIVICA_Y_NARRATIVA_ES.md MASTER_COHERENCE_REPORT.md FIRST_PRINCIPLES_STRATEGIC_REVIEW_EN.md GUIA_DE_VOZ_HOMBRE_GRIS_APLICADA_A_RECONSTRUCCION_ES.md; do
  grep -q "STATUS:" "$f" || echo "FALTA STATUS: $f"
done
```

- [ ] **Step 4: Si todo verde, commit del checkpoint final**

```bash
git commit --allow-empty -m "checkpoint: portfolio remediation complete — registry, ledger, gates, patches in place"
```

---

## Fase 16 — Apertura del Freeze (cierre de remediación)

### Tarea 16.1: Documento de cierre

**Files:**
- Create: `Iniciativas Estratégicas/REMEDIATION_CLOSEOUT_2026-04-26.md`

- [ ] **Step 1: Escribir cierre**

```markdown
# Cierre de Remediación de Auditoría 2026-04-26

> **STATUS:** current
> **FECHA CIERRE:** {fecha al completar}

## Hallazgos de la auditoría — Estado

| ID | Hallazgo | Estado | Artefacto |
|----|----------|--------|-----------|
| C1 | Capacidad de coordinación excedida | resuelto en diseño | PRIMER_TRANCHE_24M.md (8 PLANes) |
| C2 | Drift canónico | resuelto | PLAN_REGISTRY.yml + STATUS frontmatter |
| C3 | Roadmap viola matriz misiones | resuelto | HOJA_DE_RUTA_CONSOLIDADA_BASTA.md recomputada |
| C4 | Modelo fiscal no implementable | resuelto en diseño | SOURCE_OF_FUNDS_LEDGER.md + STRESS_TESTS_TRANCHE_1.md |
| C5 | PLANDIG punto único de falla | resuelto en diseño | PLANDIG_ESTADIOS_INTERNOS.md (estadios A/B internos al mismo PLAN) + reescritura de dependencias |
| C6 | Invención institucional excesiva | resuelto en diseño | TABLA_AGENCIAS_BASTA.md reclasificada + PEO |
| C7 | Saturación legal | resuelto en diseño | CASCADA_LEGAL_BASTA.md (LMV de 8 instrumentos) |
| C8 | Riesgo adversarial sub-mitigado | resuelto en diseño | READINESS_GATES_ADVERSARIAL.md |
| C9 | RACI ausente | resuelto | RACI_MATRIX.md + PORTFOLIO_EXECUTION_OFFICE.md |
| C10 | Baselines obsoletos | proceso definido | BASELINES_REFRESH_2026.md |

## Métricas del freeze

- PLANes thematic: 22 (sin nuevos creados durante remediación).
- Documentos canónicos creados: 14.
- Documentos recomputados: 7.
- Archivos legacy archivados: 2.
- Patches aplicados a PLANes: 23/23.

## Condiciones para abrir el freeze

El freeze de creación de nuevos PLANes se mantiene activo hasta que:
1. Tranche-1 cumpla métricas a 12 meses ≥ 70%.
2. PEO firme apertura controlada.
3. Auditor externo apruebe.
4. Mesa de Gobierno valide.

Hasta entonces, todo nuevo dominio temático se asigna como sub-mandato según `COVERAGE_GAPS_ASSIGNMENTS.md`.
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/REMEDIATION_CLOSEOUT_2026-04-26.md"
git commit -m "feat(closeout): mark portfolio remediation complete with C1-C10 status"
```

---

## Self-Review

### Cobertura del spec (FULL_STRATEGIC_AUDIT_2026-04-26.md)

- C1 → Fase 10 (PRIMER_TRANCHE_24M, 8 plans).
- C2 → Fase 1 (registry + STATUS + normalización).
- C3 → Fase 2 (matriz vinculante + roadmap recomputado).
- C4 → Fase 3 (libro mayor + stress tests).
- C5 → Fase 4 (PLANDIG split).
- C6 → Fase 5 (TABLA_AGENCIAS reclasificada + PEO).
- C7 → Fase 6 (cascada LMV + LEGAL_OPINIONS).
- C8 → Fase 7 (READINESS_GATES_ADVERSARIAL).
- C9 → Fases 5 y 9 (RACI + risk register + kill/scale gates).
- C10 → Fase 14 (BASELINES_REFRESH_2026).
- Coordination Audit → Fase 8 (DEPENDENCY_GRAPH + integración PLANMOV/PLANTER).
- Timeline Audit → Fase 2 (roadmap recomputado).
- Financial Audit → Fase 3.
- Legal/Institutional Audit → Fase 6 + Fase 5.
- Technical/Data Audit → Fase 4 + Fase 11 (PIAs).
- Political/Legitimacy Audit → Fase 12 (PLATAFORMA + COALITION_MAP).
- Coverage Gaps → Fase 14 (asignación sin nuevos PLANes).
- Plan-by-Plan Matrix → Fase 13 (parche estandarizado x23) + Fase 13.B (revisión editorial profunda con correcciones específicas por PLAN) + Fase 13.C (14 sweeps de coherencia cruzada).
- Recommended Remediation Program 30/60/90d → cubierto end-to-end.
- Highest-Value Enhancements → reflejados en PRIMER_TRANCHE, PEO, PLATAFORMA, COALITION_MAP, BASELINES, PLAYBOOK.
- Final Judgment (one registry/ledger/cascade/roadmap/graph/risk register/first tranche) → cubierto en Fases 1, 2, 3, 6, 8, 9, 10.

### Type/name consistency

- `PLAN_REGISTRY.yml` → referenciado en RACI, PEO, KILL_SCALE_GATES, parche, MASTER_COHERENCE.
- `DEPENDENCY_GRAPH.yml` → referenciado en parche y PEO.
- `SOURCE_OF_FUNDS_LEDGER.md` → referenciado en STRESS_TESTS, PEO, RACI, parche.
- `RACI_MATRIX.md` → referenciado en PEO, parche, decisiones cruzadas.
- `KILL_SCALE_GATES.md` → referenciado en parche, hoja de ruta.
- `READINESS_GATES_ADVERSARIAL.md` → referenciado en parche, SIMULACION nota.
- `PRIMER_TRANCHE_24M.md` → referenciado en PLATAFORMA, PEO.
- `PLATAFORMA_PUBLICA_5_MISIONES.md` → referenciado en MASTER_COHERENCE, ARQUITECTURA superseded.
- `PLAYBOOK_REVISION_PROFUNDA.md` → invocado por las 23 tareas de Fase 13.B.
- `REVISION_PROFUNDA_REPORT.md` → consolidación de 13.B + 13.C, alimenta REMEDIATION_CLOSEOUT.
- **Sin splits de PLANes:** los 22 PLANes temáticos + PLANRUTA permanecen intactos. Cuando la auditoría sugería partir un PLAN (PLANDIG, PLANTER, PLANMOV), aplicamos **estadios internos / líneas internas** dentro del mismo PLAN. Una sola entrada en el registro, un solo nodo en el grafo, un solo top-3 adversarial agregado.
- Vocabulario consistente: "estadio A / estadio B" para PLANDIG; "línea 1 / línea 2 / línea 3" para PLANTER; "línea 1 / línea 2 / línea 3 / línea 4" para PLANMOV. Cada uno opera con sus propios gates, presupuesto y owner internos.

Nomenclatura unificada: tranche-1/2/3/deferred/research-only en todo el plan.

### Placeholders

- `TBD-PEO-asignar` solo permitido en `owner` de PLAN_REGISTRY.yml (Tarea 1.1) — explicitado.
- `pendiente` en stubs PIA y LEGAL_OPINIONS — explicitado como diseño deliberado.
- Resto del plan: cada tarea tiene contenido concreto.

---

## Execution Handoff

**Plan completo guardado en `Iniciativas Estratégicas/PLAN_REMEDIACION_AUDITORIA_2026-04-26.md`.**

Recomendación de ejecución: **inline en sesiones acotadas**, una Fase por sesión, commiteando al cierre de cada Fase. Las Fases 1, 2, 3, 8, 9, 10, 13, 13.B, 13.C, 15 son las de mayor densidad — conviene hacerlas dedicadas. Las Fases 4, 5, 6, 7, 11, 12, 14, 16 son más livianas y pueden combinarse. Fase 13.B se puede paralelizar con un subagent por PLAN (23 dispatches) si se quiere acelerar.

Si preferís ejecución autónoma con subagents, dispatcho un subagent por Fase (19 dispatches considerando 13.A/B/C separadas) con review checkpoint entre cada uno. Para Fase 13.B específicamente, se puede dispachar 23 subagents en paralelo (uno por PLAN) bajo el playbook.
