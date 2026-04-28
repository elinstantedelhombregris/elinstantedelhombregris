# Libro Mayor de Fuentes de Fondos — ¡BASTA!

> **STATUS:** current
> **CANONICAL_ARCHITECTURE:** 22 thematic + PLANRUTA protocol
> **REGISTRY:** ver `PLAN_REGISTRY.yml`
> **REPLACES:** `PRESUPUESTO_CONSOLIDADO_BASTA.md` (mantener como histórico)
> **PRINCIPIO:** una fuente, un dueño, una fecha de disponibilidad, una calificación de confianza.
> **LAST_AUDIT:** 2026-04-26

## Reglas

1. Cada fuente aparece **una vez**. Sin doble conteo entre PLANes.
2. Cada fuente tiene clasificación: `gross_investment | public_net_cost | private_cooperative_capital | debt_financing | reassignment | future_return`.
3. Cada fuente tiene calificación de confianza: `alta | media | baja | especulativa`.
4. Retornos futuros NO se cuentan como fuente disponible para tranche-1.
5. Las reasignaciones requieren ley o decreto firmado para subir a `alta`.
6. Toda fuente con disponibilidad > 12 meses debe tener fuente de respaldo (cobertura).
7. Constitucionalización de pisos presupuestarios: diferida hasta tranche-3+.

## Tope fiscal del primer tranche (24 meses)

**Tope duro:** **3.5% del PBI anual incremental** sobre la base 2025, sumado por los 24 meses. Ningún PLAN escala su gasto si el agregado del portfolio supera este tope.

## Tabla maestra de fuentes

| ID | Fuente | Clase | Confianza | Disponibilidad | Dueño | PLANes consumidores |
|----|--------|-------|-----------|----------------|-------|---------------------|
| F01 | Reasignación de subsidios energéticos | reassignment | media | 2026-Q4 | Ministerio de Economía | PLANEN, PLANVIV, PLANDIG, PLANEDU |
| F02 | Crédito multilateral (BID línea agua) | debt_financing | media | 2027-Q1 | Hacienda + BID | PLANAGUA |
| F03 | Bonos largos (10-15 años) | debt_financing | baja | 2027-Q2 | Hacienda | PLANVIV, PLANAGUA, PLANDIG |
| F04 | Reasignación FONAVI/RENABAP | reassignment | media | 2026-Q4 | MinHabitat | PLANVIV |
| F05 | Canon de uso de agua | future_return | baja | 2028+ | Agencia Aguas (execution cell) | PLANAGUA (no en tranche-1) |
| F06 | Ahorros PLANREP (atrición voluntaria) | future_return | baja | 2029+ | PEO | reflujo a PLANEDU/PLANSAL (no en tranche-1) |
| F07 | Capital cooperativo (Bastardas) | private_cooperative_capital | media | 2027-Q3 | ANEB execution cell | PLANEB |
| F08 | Rentas capturadas litio/hidrocarburos | future_return | especulativa | 2030+ | PLANTER L2 | reflujo (no en tranche-1/2) |
| F09 | Multilateral salud (Banco Mundial) | debt_financing | media | 2027-Q1 | MinSalud | PLANSAL |
| F10 | Convenios provinciales (adhesión) | reassignment | baja | rolling | PEO | transversal |
| F11 | Ahorros PLANDIG (interoperabilidad) | future_return | baja | 2029+ | reflujo (no en tranche-1) |
| F12 | Captura de evasión (procurement OS) | future_return | media | 2027+ | reflujo |

## Tabla por PLAN — primer tranche

| PLAN | USD anual op | Inversión 24m | Fuente principal | Fuente secundaria | Stress (-30%) |
|------|--------------|---------------|------------------|-------------------|---------------|
| PLANAGUA | 1.2B | 3.5B | F02 | F03 | OK con retraso 12m |
| PLANVIV | 2.5B | 8.0B | F04 | F03 | recortar pilotos 30% |
| PLANSAL | 1.8B | 2.0B | F09 | F01 | priorizar APS |
| PLANEDU | 0.6B | 0.8B | F01 | reasignación interna | OK |
| PLANISV | 0.05B | 0.15B | F02 | INTA convenio | OK |
| PLANEB | 0.1B | 0.5B | F07 | bancarización pública | piloto único |
| PLANDIG (estadio A) | 0.4B | 1.2B | F01 | F03 | mantener identidad-lite |
| PLANRUTA | 0.02B | 0.05B | reasignación interna | — | OK |
| **TOTAL** | **6.67B** | **16.2B** | | | |

## Reconciliación con `PRESUPUESTO_CONSOLIDADO_BASTA.md`

La tabla del 22-plan addendum estimaba USD 51.26–65.43B anuales en régimen. La tabla del análisis daba USD 49.44–61.43B. **Esta divergencia se cierra explicitando que aquellas eran estimaciones de régimen completo (post-2040), no de primer tranche.**

Régimen completo a 2040:
- Estimación reconciliada: **USD 50–60B anuales**, equivalente a **7–9% del PBI estimado 2040**.
- Esta cifra **no es un compromiso**, es un techo de diseño.
- El primer tranche (24 meses) suma USD ~6.7B anuales (~1.0% PBI 2026), bajo el tope de 3.5%.

## Stress tests obligatorios

Cada PLAN en tranche-1 debe modelar 5 escenarios. Detalle por PLAN en `STRESS_TESTS_TRANCHE_1.md`:

1. **Recesión -3% PBI:** ¿qué se recorta?
2. **Sobrecosto +30%:** ¿qué se posterga?
3. **Multilateral demorado 12m:** ¿qué fuente cubre?
4. **Provincias no adhieren:** ¿qué piloto sobrevive?
5. **PLANREP no genera ahorros:** ¿qué reflujos se pierden?

## Fuentes prohibidas en tranche-1

- F05, F06, F08, F11, F12 — todas son `future_return`. No financian launch.
- Constitucionalización de pisos presupuestarios — diferida hasta tranche-3+.
- Cualquier fuente con confianza `especulativa`.

## Cadencia de revisión del libro mayor

- **Mensual:** Tesorero del PEO actualiza confianza por fuente.
- **Trimestral:** revisión con Mesa de Gobierno + reporte público.
- **Anual:** auditoría externa + posible recategorización.
- **Trigger automático:** si una fuente cae a confianza `baja`, activar stress test correspondiente.
