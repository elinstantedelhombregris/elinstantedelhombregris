# Playbook de Revisión Editorial Profunda — PLAN por PLAN

> **STATUS:** current
> **CANONICAL_ARCHITECTURE:** 22 thematic + PLANRUTA protocol
> **REGISTRY:** ver `PLAN_REGISTRY.yml`
> **APLICACIÓN:** ejecutar este protocolo en cada uno de los 23 archivos `PLAN*_Argentina_ES.md` antes de declarar la remediación cerrada.
> **NIVEL DE REVISIÓN:** la Fase 13 (standard patch) ya se aplicó a los 23 archivos. Este playbook es el complemento de **revisión editorial profunda** opcional pero recomendado.
> **LAST_AUDIT:** 2026-04-26

## Objetivo

Llevar cada PLAN del estado "documento ambicioso" al estado "documento gobernable", alineado con los artefactos canónicos creados en Fases 1–12, sin alterar la voz ni eliminar la visión de largo plazo. **Sin partir PLANes**: PLANDIG, PLANTER, PLANMOV mantienen su estructura única con estadios/líneas internas.

## Principios de edición

1. **Preservar el horizonte de 2040.** No borrar visión.
2. **Demarcar fases/estadios/líneas con dureza.** Toda promesa de tranche-1 debe ser ejecutable con instituciones débiles, baja confianza, y datos parciales.
3. **No future returns en tranche-1.** Ningún ahorro o renta futura financia operación inicial.
4. **No nuevas agencias autónomas en tranche-1.** Default: execution cell.
5. **No reformas constitucionales en tranche-1.** Default: ley ordinaria o decreto.
6. **No capacidades del estadio B de PLANDIG en tranche-1.** Toda dependencia digital se ancla al estadio A o se difiere.
7. **Promesa pública medible.** Cada PLAN tiene una frase rioplatense verificable a 24 meses (ya en standard patch).
8. **Top-3 adversarial cerrado.** Sin mitigación operativa, no hay launch.
9. **Voz consistente.** Doctrina interna en docs internos; plataforma pública en `PLATAFORMA_PUBLICA_5_MISIONES.md`.
10. **Sin datos personales sin PIA.** Si el PLAN toca datos personales, su PIA stub debe estar referenciado.
11. **Sin splits.** Si un PLAN es "demasiado grande", se estadía / se separa en líneas internas dentro del mismo archivo.

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
- Sumar el costo declarado de tranche-1 y verificar que cabe bajo la línea del PLAN en `PRIMER_TRANCHE_24M.md`.

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

### Paso 8: Estadios/líneas de PLANDIG / PLANTER / PLANMOV
- **PLANDIG:** insertar dos secciones explícitas: "Estadio A — Núcleo Digital (tranche-1)" y "Estadio B — Capacidades Soberanas (tranche-3+, condicional)". Mover capacidades soberanas del cuerpo principal al estadio B.
- **PLANTER:** insertar tres secciones explícitas: "Línea L1 — Enforcement ambiental", "Línea L2 — Auditoría de regalías extractivas", "Línea L3 — Pilotos de consulta previa originaria". No partir el PLAN.
- **PLANMOV:** insertar cuatro secciones explícitas: "Línea L1 — Movilidad básica", "Línea L2 — Flete ferroviario", "Línea L3 — Gobernanza AMBA-T", "Línea L4 — Investigación AV (research-only indefinida)". No partir el PLAN.
- Para todos los demás PLANes, verificar que cualquier capacidad que dependa de "PLANDIG" se ancle al estadio A en tranche-1, y al estadio B con condiciones si es tranche-3+.

### Paso 9: Promesa pública medible
- Verificar (o ajustar) la sección "Promesa pública medible" del standard patch.
- Una frase rioplatense, verificable, alineada con la promesa de la misión correspondiente en `PLATAFORMA_PUBLICA_5_MISIONES.md`.
- Eliminar tecnicismos de la sección. Mover tecnicismos a sección "Diseño operativo".

### Paso 10: Referencia PIA
- Si el PLAN toca datos personales (DIG, MEMORIA, CUIDADO, SEG, JUS, MOV, MON, SAL, EDU asistencia, VIV registro, REP empleo): verificar referencia a `PIA/{PLAN}.md` y advertencia "no avanza a piloto sin PIA aprobado".

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
grep -A 50 "Tranche-1\|tranche-1\|Fase 1\|Año 1" "$F" | grep -i "future_return\|renta capturada\|ahorro PLANREP\|reflujo" && echo "FALLA: $PLAN tiene future return en tranche-1"
grep -i "reforma constitucional" "$F" | grep -v "diferid\|tranche-3\|fase 2" && echo "FALLA: $PLAN tiene reforma constitucional sin diferimiento"
grep -q "Top-3 attack" "$F" || echo "FALLA: $PLAN sin top-3 adversarial"
grep -q "Promesa pública medible\|notar a 24 meses" "$F" || echo "FALLA: $PLAN sin promesa pública"
grep -q "Parche post-auditoría 2026-04-26" "$F" || echo "FALLA: $PLAN sin standard patch"
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

## Modo de ejecución recomendado

- **Subagent por PLAN en paralelo:** dispatchar 23 subagents en paralelo, uno por PLAN, cada uno con este playbook + correcciones específicas de la Fase 13.B del plan de remediación. Cada subagent edita su PLAN y reporta.
- **Inline secuencial:** un PLAN por sesión, comenzando por los más críticos (PLANDIG, PLANTER, PLANMOV) y terminando por los más livianos.
