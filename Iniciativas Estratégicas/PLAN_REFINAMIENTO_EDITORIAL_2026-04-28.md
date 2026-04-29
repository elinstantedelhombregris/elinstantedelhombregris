# Plan de Refinamiento Editorial Profundo de los PLANes (Fase 13.B+)

> **Para ejecutores agénticos:** Este plan se ejecuta tarea por tarea con checkboxes (`- [ ]`). Está diseñado para sobrevivir al límite global de subagents — ningún paso requiere despachar más de 1 subagent simultáneo.

**Goal:** Mover de "REVISION blocks declaran autoridad en frontmatter" → "edits quirúrgicos inline en el cuerpo de cada PLAN, con REVIEW MARKERS antes de cada bloque editado, según los 13 pasos del `PLAYBOOK_REVISION_PROFUNDA.md`".

**Architecture:** Trabajo incremental por PLAN con dos modos intercambiables:
- **Modo A (subagent):** un subagent por PLAN, dispachado de forma SECUENCIAL (no paralelo) para evitar hit de límite global.
- **Modo B (inline):** edits ejecutados en sesión actual, un PLAN por turno.

Cada PLAN se completa con **diagnóstico → edits → verificación → commit** antes de pasar al siguiente.

**Restricción dura:** sin splits. PLANDIG/PLANTER/PLANMOV mantienen sus estadios/líneas internas como secciones del mismo archivo.

---

## Diagnóstico del estado actual

| Estado | Count | Detalle |
|--------|-------|---------|
| REVISION_PROFUNDA marker en top | 23/23 | ✅ |
| Standard patch al final | 23/23 | ✅ |
| Estructura interna explícita en cuerpo | 3/3 críticos | ✅ PLANDIG, PLANTER, PLANMOV |
| Edits quirúrgicos inline en cuerpo | 1/23 | Solo PLANRUTA (subagent 54586ad) — el resto sin edits granulares |
| REVIEW MARKERS antes de bloques editados | 1/23 | Solo PLANRUTA |
| Anexo histórico Visión 2040 estructurado | 0/23 | Ninguno tiene anexo formalmente separado |

**Brecha:** 22 PLANes tienen REVISION block declarativo al inicio que **contradice** prosa específica del cuerpo (ej. constitucionalización, agencias autónomas, future returns, capacidades estadio B en tranche-1, verbos operativos en Rojo, fechas relativas). Sin edit inline, la contradicción existe; el lector tiene que confiar en la regla de precedencia del frontmatter.

---

## Inventario de archivos a tocar

### Crear (artefactos nuevos)
- `Iniciativas Estratégicas/diagnostico/DIAGNOSTICO_{CODE}.md` × 22 (uno por PLAN excepto PLANRUTA ya hecho)
- `Iniciativas Estratégicas/REFINAMIENTO_REPORT.md` — reporte final consolidado

### Modificar (cada uno con edits inline + REVIEW MARKERS)
- 22 archivos `PLAN*_Argentina_ES.md` (todos excepto PLANRUTA que ya recibió revisión profunda completa)

---

## Patrones de búsqueda y corrección

### Patrón 1 — Reformas constitucionales sin diferimiento
**Buscar:** `reforma constitucional|enmienda constitucional|constitucionaliz|personería jurídica de` en secciones tranche-1 o tranche-2.
**Edit:** insertar antes `> **REVISIÓN 2026-04-28:** diferida a tranche-3+ por defecto. Ver \`CASCADA_LEGAL_BASTA.md\` LMV.`
**Anexar al final del párrafo:** `(diferida a tranche-3+ por defecto)`.

### Patrón 2 — Agencias autónomas en tranche-1/2
**Buscar:** `agencia (?!provincial)|ente autónomo|autoridad nacional|instituto autónomo|autarquía constitucional|presupuesto protegido` en tranche-1/2.
**Edit:** insertar antes `> **REVISIÓN 2026-04-28:** reemplazada por execution cell en {ministerio}. Ver \`TABLA_AGENCIAS_BASTA.md\`. Autonomía solo tras 24m de prueba.`
**Reescribir:** sustituir por "execution cell en {ministerio existente}".

### Patrón 3 — Future returns como fuente activa de tranche-1
**Buscar:** `ahorro PLANREP|reflujo|renta capturada|canon AV|fondo soberano|retorno futuro` cerca de "presupuesto" o "financiamiento" en tranche-1.
**Edit:** insertar antes `> **REVISIÓN 2026-04-28:** future return prohibida en tranche-1. Ver \`SOURCE_OF_FUNDS_LEDGER.md\`.`
**Reescribir:** "se evaluará al cierre de tranche-1 según el libro mayor".

### Patrón 4 — Capacidades estadio B PLANDIG en tranche-1/2
**Buscar:** `ArgenCloud|SAPI completa|LANIA|gemelo digital|frontier AI|gobernanza algorítmica|rieles monetarios|cloud soberano|IA generativa|biometría masiva|voto digital vinculante` en tranche-1/2.
**Edit:** insertar antes `> **REVISIÓN 2026-04-28:** capacidad del estadio B de PLANDIG; diferida a tranche-3+ con condiciones de \`PLANDIG_ESTADIOS_INTERNOS.md\`.`
**Reescribir:** apuntar al estadio A si es viable; si no, diferir explícitamente.

### Patrón 5 — Verbos operativos en PLANes Rojo (MON, SUS, 24CN)
**Buscar:** `lanzaremos|implementaremos|construiremos|inauguraremos|ejecutaremos|operativizaremos` fuera de contextos "investigación|laboratorio|research|piloto académico".
**Edit:** insertar antes `> **REVISIÓN 2026-04-28:** PLAN Rojo / research-only / diferido. Verbo operativo demoted.`
**Reescribir:** "investigaremos / evaluaremos / publicaremos resultados de laboratorio".

### Patrón 6 — Fechas relativas conviven con tranches
**Buscar:** `Año 0|Año 1|Año 2|Año 3|Año 4|Año 5|Año 6` en tablas de cronograma o fases.
**Edit:** insertar antes `> **REVISIÓN 2026-04-28:** convertida a ventana absoluta de tranche.`
**Reescribir:** "Año 1" → "2026-2027" (tranche-1) / "2028-2029" (tranche-2) / "2030+" (tranche-3) según corresponda.

### Patrón 7 — Sortición sin justificación
**Buscar:** `sortición|sortear|jurado popular|panel ciudadano` sin contexto adyacente "control|veeduría|consulta|legitimidad|oversight".
**Edit:** insertar antes `> **REVISIÓN 2026-04-28:** sortición sólo donde resuelva un problema concreto de oversight; uso ornamental podado.`
**Reescribir:** eliminar o reemplazar con mecanismo más simple si no resuelve un problema real.

### Patrón 8 — Lenguaje místico/espiritual en plataforma pública
**Buscar:** `Hombre Gris|sagrado|alma|espíritu de la nación|místico|trascendente` en secciones marcadas como "público" / "comunicación" / "campaña" / "narrativa pública".
**Edit:** mover a doctrina (`VEHICULO_POLITICO_BASTA.md`) si aplica; reescribir en plataforma con lenguaje civil.

---

## Etapa R1 — Diagnóstico Automatizado per PLAN

> **Propósito:** generar un archivo de diagnóstico por PLAN con las líneas exactas que violan los 8 patrones. Esto convierte el trabajo de revisión profunda en una lista mecánica de edits.

### Tarea R1.1: Crear carpeta de diagnósticos

- [ ] **Step 1:** `mkdir -p "Iniciativas Estratégicas/diagnostico"`
- [ ] **Step 2:** Commit: `chore(refinamiento): create diagnostico/ folder`

### Tarea R1.2: Script de diagnóstico

**Files:**
- Create: `Iniciativas Estratégicas/diagnostico/_run_diagnostico.sh`

- [ ] **Step 1: Escribir script bash que para cada PLAN ejecute los 8 patrones y genere `DIAGNOSTICO_{CODE}.md` con findings exactos (línea + texto).**

```bash
#!/bin/bash
set -e
cd "$(dirname "$0")/.."  # Iniciativas Estratégicas/

PLAN="$1"
F="${PLAN}_Argentina_ES.md"
OUT="diagnostico/DIAGNOSTICO_${PLAN}.md"

echo "# Diagnóstico de Refinamiento — ${PLAN}" > "$OUT"
echo "" >> "$OUT"
echo "Generado: $(date +%Y-%m-%d)" >> "$OUT"
echo "" >> "$OUT"

# Patrón 1
echo "## Patrón 1 — Reformas constitucionales sin diferimiento" >> "$OUT"
grep -n "reforma constitucional\|enmienda constitucional\|constitucionaliz\|personería jurídica de" "$F" \
  | grep -v "diferid\|tranche-3\|2040\|anexo\|histórico\|REVISIÓN\|\bSTATUS:\b" >> "$OUT" || echo "(no findings)" >> "$OUT"
echo "" >> "$OUT"

# Patrón 2
echo "## Patrón 2 — Agencias autónomas en tranche-1/2" >> "$OUT"
grep -n "agencia\|ente autónomo\|autoridad nacional\|instituto autónomo\|autarquía constitucional\|presupuesto protegido" "$F" \
  | grep -v "execution cell\|diferid\|REVISIÓN\|\bSTATUS:\b\|TABLA_AGENCIAS" >> "$OUT" || echo "(no findings)" >> "$OUT"
echo "" >> "$OUT"

# Patrón 3
echo "## Patrón 3 — Future returns como fuente activa" >> "$OUT"
grep -n "ahorro PLANREP\|reflujo\|renta capturada\|canon AV\|fondo soberano\|retorno futuro" "$F" \
  | grep -v "diferid\|tranche-2\|tranche-3\|prohibid\|REVISIÓN" >> "$OUT" || echo "(no findings)" >> "$OUT"
echo "" >> "$OUT"

# Patrón 4
echo "## Patrón 4 — Capacidades estadio B PLANDIG en tranche-1/2" >> "$OUT"
grep -n "ArgenCloud\|SAPI completa\|LANIA\|gemelo digital\|frontier AI\|gobernanza algorítmica\|rieles monetarios\|cloud soberano\|IA generativa\|biometría masiva\|voto digital vinculante" "$F" \
  | grep -v "estadio B\|diferid\|tranche-3\|REVISIÓN" >> "$OUT" || echo "(no findings)" >> "$OUT"
echo "" >> "$OUT"

# Patrón 5 (solo Rojo)
if echo "$PLAN" | grep -qE "PLANMON|PLANSUS|PLAN24CN"; then
  echo "## Patrón 5 — Verbos operativos en PLAN Rojo" >> "$OUT"
  grep -n "lanzaremos\|implementaremos\|construiremos\|inauguraremos\|ejecutaremos\|operativizaremos" "$F" \
    | grep -v "investigación\|laboratorio\|research\|piloto académico\|REVISIÓN" >> "$OUT" || echo "(no findings)" >> "$OUT"
  echo "" >> "$OUT"
fi

# Patrón 6
echo "## Patrón 6 — Fechas relativas en cronograma" >> "$OUT"
grep -nE "Año [0-9]" "$F" \
  | grep -v "REVISIÓN\|anexo\|histórico\|2040" >> "$OUT" || echo "(no findings)" >> "$OUT"
echo "" >> "$OUT"

# Patrón 7
echo "## Patrón 7 — Sortición sin justificación" >> "$OUT"
grep -nE "sortición|sortear|jurado popular|panel ciudadano" "$F" \
  | grep -v "control\|veeduría\|consulta\|legitimidad\|oversight\|REVISIÓN" >> "$OUT" || echo "(no findings)" >> "$OUT"
echo "" >> "$OUT"

# Conteo total de findings
TOTAL=$(grep -cE "^[0-9]+:" "$OUT" || echo 0)
echo "## Total findings: ${TOTAL}" >> "$OUT"

echo "Diagnóstico de ${PLAN}: ${TOTAL} findings → ${OUT}"
```

- [ ] **Step 2: Hacer ejecutable y correr para los 22 PLANes (excluir PLANRUTA)**

```bash
chmod +x "Iniciativas Estratégicas/diagnostico/_run_diagnostico.sh"
for code in PLANAGUA PLANVIV PLANSAL PLANSEG PLANDIG PLANISV PLANEB PLANREP PLANEN PLANEDU PLANCUL PLANJUS PLANSUS PLANMON PLANGEO PLAN24CN PLANMESA PLANTALLER PLANCUIDADO PLANMEMORIA PLANTER PLANMOV; do
  "Iniciativas Estratégicas/diagnostico/_run_diagnostico.sh" "$code"
done
```

- [ ] **Step 3: Generar índice consolidado**

```bash
cat > "Iniciativas Estratégicas/diagnostico/INDEX.md" <<'EOF'
# Índice de Diagnósticos de Refinamiento

| PLAN | Findings | Archivo |
|------|---------:|---------|
EOF
for code in PLANAGUA PLANVIV PLANSAL PLANSEG PLANDIG PLANISV PLANEB PLANREP PLANEN PLANEDU PLANCUL PLANJUS PLANSUS PLANMON PLANGEO PLAN24CN PLANMESA PLANTALLER PLANCUIDADO PLANMEMORIA PLANTER PLANMOV; do
  COUNT=$(grep -E "^Total findings:" "Iniciativas Estratégicas/diagnostico/DIAGNOSTICO_${code}.md" | grep -oE "[0-9]+" || echo 0)
  echo "| ${code} | ${COUNT} | DIAGNOSTICO_${code}.md |" >> "Iniciativas Estratégicas/diagnostico/INDEX.md"
done
```

- [ ] **Step 4: Commit**

```bash
git add "Iniciativas Estratégicas/diagnostico/"
git commit -m "feat(refinamiento): R1 diagnóstico automatizado per PLAN — 8 patrones × 22 PLANes"
```

### Resultado esperado de R1
- Carpeta `diagnostico/` con 22 archivos (1 por PLAN excluyendo RUTA) + script + INDEX.
- Cada PLAN con su lista de findings exactos (line:text) por patrón.
- Permite priorizar PLANes por volumen de findings.

---

## Etapa R2 — Edits Quirúrgicos en Cuerpo

> **Propósito:** aplicar los edits a cada PLAN según su diagnóstico. Modo intercambiable subagent / inline.

### Modo A — Subagent por PLAN (preferido cuando límite global está OK)

**Restricción:** subagents dispachados **secuencialmente** (uno a la vez), no en paralelo. Esto evita el hit de límite global que ocurrió en el dispatch anterior.

#### Plantilla de prompt para subagent (R2.subagent)

```
You are dispatched to apply Fase 13.B refinamiento profundo to a SINGLE PLAN file.

PLAN: {CODE}
File: /Users/juanb/Desktop/ElInstantedelHombreGris/Iniciativas Estratégicas/{CODE}_Argentina_ES.md
Diagnostic: /Users/juanb/Desktop/ElInstantedelHombreGris/Iniciativas Estratégicas/diagnostico/DIAGNOSTICO_{CODE}.md

Read in order:
1. The diagnostic file (your worklist with line numbers and texts to edit)
2. PLAYBOOK_REVISION_PROFUNDA.md (the 13-step protocol)
3. PLAN_REGISTRY.yml + DEPENDENCY_GRAPH.yml + SOURCE_OF_FUNDS_LEDGER.md + CASCADA_LEGAL_BASTA.md + READINESS_GATES_ADVERSARIAL.md + KILL_SCALE_GATES.md
4. The PLAN file itself

For each finding in the diagnostic, apply the corresponding correction pattern from the playbook:
- Pattern 1 (constitutional): defer to tranche-3+ with explicit clause
- Pattern 2 (agency): replace with execution cell in {existing ministry}
- Pattern 3 (future return): defer to "se evaluará al cierre de tranche-1"
- Pattern 4 (estadio B PLANDIG): mark as "estadio B condicional" or defer
- Pattern 5 (operational verb in Rojo): demote to research/laboratorio
- Pattern 6 (relative date): convert to absolute window
- Pattern 7 (unjustified sortición): prune or replace
- Pattern 8 (mystical in public): move to doctrine

For EACH edit, insert REVIEW MARKER above the edited block:
> **REVISIÓN 2026-04-28:** {what was changed and why}

Move displaced content to "## Anexo histórico — Visión 2040 (post-auditoría)" at the end of the file (before the existing standard patch).

Constraints:
- Stay on main. No branches.
- Modify ONLY {CODE}_Argentina_ES.md.
- Do NOT split the PLAN.
- Do NOT use Agent tool yourself.
- Do NOT touch other PLANes.
- After all edits, commit with: patch({CODE}): R2 refinamiento profundo — {N findings resolved} co-authored.

Report: 2-3 sentences + commit hash + count of findings resolved.
```

#### Tareas R2.A.1 a R2.A.22 — un subagent por PLAN

Lista de PLANes en orden de prioridad (R2.A.1 primero, R2.A.22 último):

**Prioridad 1 — Tranche-1 (mayor impacto operativo):**
- [ ] R2.A.1: PLANAGUA
- [ ] R2.A.2: PLANVIV
- [ ] R2.A.3: PLANSAL
- [ ] R2.A.4: PLANEDU
- [ ] R2.A.5: PLANISV
- [ ] R2.A.6: PLANEB
- [ ] R2.A.7: PLANDIG (refinamiento del cuerpo; las estadios A/B ya están al final)

**Prioridad 2 — Tranche-2:**
- [ ] R2.A.8: PLANSEG
- [ ] R2.A.9: PLANREP
- [ ] R2.A.10: PLANMESA
- [ ] R2.A.11: PLANTALLER
- [ ] R2.A.12: PLANCUIDADO
- [ ] R2.A.13: PLANEN
- [ ] R2.A.14: PLANCUL

**Prioridad 3 — Tranche-3 (con líneas internas):**
- [ ] R2.A.15: PLANJUS
- [ ] R2.A.16: PLANTER (refinamiento del cuerpo; las líneas L1/L2/L3 ya están al final)
- [ ] R2.A.17: PLANMOV (refinamiento del cuerpo; las líneas L1/L2/L3/L4 ya están al final)
- [ ] R2.A.18: PLANMEMORIA

**Prioridad 4 — Diferidos / Rojo (patrón 5 obligatorio):**
- [ ] R2.A.19: PLANSUS
- [ ] R2.A.20: PLANMON
- [ ] R2.A.21: PLAN24CN
- [ ] R2.A.22: PLANGEO

**Cadencia recomendada:**
- 1 subagent por turno conversacional.
- Verificar que el subagent commitee antes de despachar el siguiente.
- Si el límite global está cerca, pausar y reanudar después del reset.

### Modo B — Inline secuencial (fallback si límite global persiste)

#### Tareas R2.B.1 a R2.B.22

Idéntica lista y prioridad que Modo A, pero ejecutadas en sesión actual:

- [ ] **Step 1:** Leer `diagnostico/DIAGNOSTICO_{CODE}.md`.
- [ ] **Step 2:** Por cada finding, ejecutar `Edit` con el patrón de corrección correspondiente:
  - Insertar REVIEW MARKER antes del bloque editado.
  - Reescribir el bloque siguiendo el patrón.
- [ ] **Step 3:** Si hay contenido desplazado significativo, agregar al final del archivo (antes del standard patch) una sección `## Anexo histórico — Visión 2040 (post-auditoría)` con el contenido movido.
- [ ] **Step 4:** Commit: `patch({CODE}): R2 refinamiento profundo — {N findings resolved}`.

**Cadencia inline:**
- 1-3 PLANes por sesión según volumen de findings.
- Findings simples (fechas relativas, sortición ornamental) son rápidos.
- Findings complejos (constitucionalización entrelazada con narrativa) pueden requerir reescritura de un párrafo.

---

## Etapa R3 — Anexos Históricos Estructurados

> **Propósito:** todo contenido desplazado de tranche-1 (visión 2040, agencia plena, constitucionalización, AV pleno, moneda nueva, etc.) se preserva en una sección "Anexo histórico — Visión 2040" claramente separada al final de cada PLAN.

### Tarea R3.1: Patrón estandarizado de anexo

Cada PLAN que reciba contenido desplazado obtiene una sección al final (antes del Parche post-auditoría):

```markdown
---

## Anexo histórico — Visión 2040 (post-auditoría 2026-04-26)

> **STATUS LOCAL:** preservado como visión de largo plazo, sin compromiso de tranche-1/2/3.
> **AUTORIDAD:** este anexo describe el horizonte de diseño. Los compromisos operativos viven en el cuerpo del PLAN + el REVISION block del frontmatter.

### {nombre del componente desplazado}

{contenido movido del cuerpo}

> **NOTA REVISIÓN 2026-04-28:** este componente fue desplazado del cuerpo operativo de tranche-1/2 a este anexo porque {razón: requiere reforma constitucional / requiere estadio B PLANDIG / requiere estabilización macro previa / etc.}.
```

- [ ] **Tareas R3.1 a R3.22:** una por PLAN, ejecutada como sub-paso del modo de R2 elegido.

---

## Etapa R4 — Re-ejecución de Sweeps

> **Propósito:** después del refinamiento, los 14 sweeps de Fase 13.C deben dar 0 findings (excluyendo los justificados como conceptuales).

### Tarea R4.1: Re-ejecutar los 14 sweeps

- [ ] **Step 1:** ejecutar los sweeps 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 del `PLAN_REMEDIACION_AUDITORIA_2026-04-26.md`.
- [ ] **Step 2:** comparar findings con el reporte previo (`REVISION_PROFUNDA_REPORT.md`).
- [ ] **Step 3:** los findings que persisten deben tener justificación documentada (referencias conceptuales como "Noruega" en PLANMON) o disparar otro ciclo de R2.

### Tarea R4.2: Checkpoint de calidad

Métricas objetivo:
- **Sweep 2 (estadio B en tranche-1/2):** 0 findings reales (textuales conceptuales pueden persistir si están claramente marcados).
- **Sweep 3 (constitucional sin diferimiento):** 0 findings.
- **Sweep 4 (verbos operativos en Rojo):** 0 findings.
- **Sweep 5 (Ámbar sin "qué simplificamos"):** 0 findings (ya cubierto por standard patch sec 2; verificar).
- **Sweep 9 (sortición ornamental):** ≤ 2 findings con justificación.
- **Sweep 10 (fechas relativas):** ≤ 5 findings con justificación (anexos históricos OK).

---

## Etapa R5 — Reporte Final + Closeout

### Tarea R5.1: Generar `REFINAMIENTO_REPORT.md`

**Files:**
- Create: `Iniciativas Estratégicas/REFINAMIENTO_REPORT.md`

Estructura:
1. Resumen ejecutivo (cobertura de R1–R4).
2. Tabla por PLAN: findings antes / findings después / commits.
3. Hallazgos transversales tras refinamiento.
4. Comparación con `REVISION_PROFUNDA_REPORT.md`.
5. Trabajo residual (si lo hay) con justificación.

### Tarea R5.2: Update closeout y master coherence

- [ ] **Step 1:** actualizar `REMEDIATION_CLOSEOUT_2026-04-26.md` para reflejar que la Fase 13.B+ refinamiento está cerrada.
- [ ] **Step 2:** actualizar `MASTER_COHERENCE_REPORT.md` con referencia al refinamiento.
- [ ] **Step 3:** commit final: `feat(refinamiento): R5 closeout — Fase 13.B+ deep editorial review fully complete`.

---

## Cronograma realista

### Escenario óptimo (subagents disponibles)
- R1 diagnóstico: 1 sesión (45 min).
- R2 modo A: 22 subagents secuenciales × ~2 min cada uno = 1-2 sesiones.
- R3 (integrado a R2): incluido.
- R4 sweeps: 1 sesión (15 min).
- R5 reporte: 1 sesión (30 min).
- **Total:** 4-5 sesiones.

### Escenario conservador (límite global persiste, modo inline)
- R1: 1 sesión.
- R2 modo B: 22 PLANes × 1 PLAN/sesión = 22 sesiones (puede acelerarse a 2-3 PLANes/sesión para PLANes pequeños).
- R3: integrado.
- R4: 1 sesión.
- R5: 1 sesión.
- **Total:** 8-15 sesiones distribuidas.

### Escenario híbrido (recomendado)
- R1 inline en sesión actual.
- R2 priority 1 (tranche-1) inline en próximas 2 sesiones.
- R2 priority 2-4 con subagents secuenciales cuando límite resetee.
- R4-R5 inline.
- **Total:** 4-8 sesiones.

---

## Priorización por urgencia operativa

**Más urgente** (tranche-1, ya operando dependencias en cascada):
1. PLANDIG — refinamiento del cuerpo es crítico porque PLANDIG es PUF de 21 PLANes.
2. PLANAGUA, PLANSAL, PLANVIV — métricas de 90 días públicas.
3. PLANEDU, PLANISV, PLANEB — métricas de 24 meses cuantificables.

**Menos urgente** (diferidos / research-only, no afectan tranche-1):
- PLANMON, PLANSUS, PLAN24CN, PLANGEO confrontacional.

---

## Self-Review

### Cobertura
- Cubre los findings transversales identificados en `REVISION_PROFUNDA_REPORT.md`.
- Cubre los 13 pasos del playbook traducidos a 8 patrones automáticos + edits manuales para casos atípicos.
- Cubre el modo subagent y el modo inline para evitar hit del límite global.

### Riesgos del plan
- **Riesgo A:** los subagents secuenciales aún pueden hit límite si la cuenta tiene cap de tokens diario. Mitigación: pausar y reanudar.
- **Riesgo B:** PLANes con anidamiento profundo (PLANDIG) pueden requerir más de un ciclo de refinamiento. Mitigación: re-ejecutar diagnóstico tras R2.
- **Riesgo C:** el patrón automático puede generar falsos positivos (ej. mención conceptual de Noruega en PLANMON). Mitigación: cada finding requiere revisión humana antes de edit.

### Lo que NO hace este plan
- No reescribe la voz literaria de los PLANes — solo aplica correcciones quirúrgicas.
- No reorganiza las estructuras internas (estadios A/B, líneas L1-L4) — eso ya está en cuerpo de DIG/TER/MOV.
- No genera narrativa pública nueva — eso vive en `PLATAFORMA_PUBLICA_5_MISIONES.md`.
- No opera ningún cambio sobre artefactos canónicos (registry, libro mayor, gates) — esos están firmes.

---

## Execution Handoff

**Plan completo guardado en `Iniciativas Estratégicas/PLAN_REFINAMIENTO_EDITORIAL_2026-04-28.md`.**

Próxima acción concreta: **comenzar Etapa R1 (diagnóstico automatizado)** — corre rápido, no consume subagents, genera la hoja de ruta exacta para R2.

¿Modo? **Inline para R1**, después decidir Modo A vs B según estado del límite global.
