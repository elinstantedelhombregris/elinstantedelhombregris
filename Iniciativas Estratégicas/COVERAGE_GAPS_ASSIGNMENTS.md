# Asignación de Huecos de Cobertura — Sin Nuevos PLANes

> **STATUS:** current
> **CANONICAL_ARCHITECTURE:** 22 thematic + PLANRUTA protocol
> **REGISTRY:** ver `PLAN_REGISTRY.yml`
> **PRINCIPIO:** todo hueco identificado en la auditoría sección "Coverage Gaps" se asigna como **sub-mandato** (sección interna) de un PLAN existente. **Freeze sigue activo. Sin PLANes nuevos.**
> **LAST_AUDIT:** 2026-04-26

## Tabla de asignación

| Hueco | PLAN huésped | Sub-mandato (sección interna del PLAN huésped, NO PLAN nuevo) | Owner | Tranche |
|-------|--------------|---------------------------------------------------------------|-------|---------|
| Federalismo fiscal y coparticipación | PLANREP | "Coparticipación y Tributación" — sección interna | Tesorero PEO + MinEconomía | tranche-2 |
| Procurement y anti-corrupción | PLANDIG (estadio A) + PLANREP | "Procurement OS" — sección interna conjunta | Custodio Registro PEO | tranche-1 (lanzar) |
| Modelo operativo del Estado civil | PLANREP | "Civil Service Operating Model" — sección interna | PEO Oficial Capacidad | tranche-2 |
| Transición sector privado | PLANEB + PLANEN + PLANEDU | "Transición productiva" — secciones internas en cada PLAN huésped | Mesa de Gobierno | transversal |
| Defensa y ciberdefensa | PLANGEO + PLANDIG (estadio A) | "Cyber Resilience" — sección interna | Oficial Seguridad PEO | tranche-1 (cyber-min) |
| Discapacidad y vejez | PLANCUIDADO + PLANSAL | "Cuidado largo plazo" — sección interna | Cabeza PLANCUIDADO | tranche-2 |
| Cultura de mantenimiento | PLANVIV + PLANAGUA + PLANEN + PLANMOV | "Maintenance discipline" — secciones internas en cada PLAN huésped | Tesorero PEO | transversal |
| Autoridad de evaluación independiente | PLANRUTA | "Evaluador Independiente con poder de stop" — capacidad del PEO | Director PEO | tranche-1 |
| Ciencia y tecnología (PLANCYT) | PLANEDU + PLANEB + PLANDIG (estadio A) | "CyT distribuido" — secciones internas en cada PLAN huésped | Cabeza PLANEDU | tranche-2 |

## Reglas

1. Cada sub-mandato hereda el tranche del PLAN huésped.
2. Cada sub-mandato tiene un párrafo en el archivo del PLAN huésped (a agregar como continuación del parche de Fase 13).
3. **Si un sub-mandato crece más allá de cierto tamaño (≥ 1.5x del PLAN huésped en presupuesto), gateo de spin-off al cierre de tranche** — pero nunca antes y nunca sin auditoría externa firmada.
4. **No es mecánico.** Un sub-mandato no se convierte automáticamente en PLAN nuevo. La conversión requiere: cierre de tranche, propuesta abierta, Director PEO + auditor externo firma, Mesa Gobierno valida.
5. **Mientras el freeze esté activo, ningún sub-mandato puede ser PLAN nuevo.**

## Cómo se anclan los sub-mandatos en los PLANes huésped

En cada PLAN huésped, agregar al final del cuerpo (antes del parche post-auditoría):

```markdown
## Sub-mandato: {nombre}

> **REVISIÓN 2026-04-28:** sub-mandato heredado de COVERAGE_GAPS_ASSIGNMENTS.md. NO es PLAN nuevo. Es una sección interna del PLAN huésped.

### Alcance
{descripción del hueco asignado}

### Tranche
{hereda del PLAN huésped}

### Owner
{owner asignado}

### Pre-requisitos
- Cierre de gate del PLAN huésped
- ...
```

## Sub-mandato Procurement OS — destacable

Es el único sub-mandato que se adelanta a tranche-1. Su importancia: cualquier programa de capital pesado (PLANVIV, PLANAGUA, PLANEN, PLANMOV) requiere un sistema de compras transparente antes del launch. Implementación conjunta entre PLANDIG (datos abiertos + auditoría) y PLANREP (procesos administrativos).
