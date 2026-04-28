# Refresh de Baselines — Pre-publicación

> **STATUS:** current
> **CANONICAL_ARCHITECTURE:** 22 thematic + PLANRUTA protocol
> **REGISTRY:** ver `PLAN_REGISTRY.yml`
> **PRINCIPIO:** ningún número ni cita legal se publica externamente sin baseline verificada en los últimos 90 días.
> **LAST_AUDIT:** 2026-04-26

## Tabla de baselines a verificar

| Baseline | Fuente sugerida | Última verificación | Estado | Owner |
|----------|-----------------|---------------------|--------|-------|
| PBI 2026 nominal y real | INDEC + IMF WEO | pendiente | TODO | Tesorero PEO |
| Gasto público consolidado / PBI | MinEconomía + ASAP | pendiente | TODO | Tesorero PEO |
| Capacidad multilateral (BID, BM, CAF) | reportes anuales 2025 | pendiente | TODO | Oficial Legal PEO |
| Estado del RIGI | BORA + jurisprudencia | pendiente | TODO | Oficial Legal PEO |
| Carta orgánica BCRA vigente | BCRA | pendiente | TODO | Oficial Legal PEO |
| FONAVI / RENABAP | MinHabitat | pendiente | TODO | Cabeza PLANVIV |
| Ley de Bosques + ambiente | Min Ambiente | pendiente | TODO | Cabeza PLANTER |
| Concesiones de transporte | CNRT | pendiente | TODO | Cabeza PLANMOV |
| Federalismo fiscal | Coparticipación 2025 | pendiente | TODO | Tesorero PEO |
| Estatus AV regulación | reglas de tránsito provinciales | pendiente | TODO | Cabeza PLANMOV |
| Identidad digital (RENAPER) | reportes públicos | pendiente | TODO | Cabeza PLANDIG |
| Tokenización legal | CNV + UIF | pendiente | TODO | Oficial Legal PEO |
| Drogas / regulación | Sedronar + jurisprudencia | pendiente | TODO | Cabeza PLANSUS |
| Cobertura APS y stock medicamentos esenciales | MinSalud + REMEDIAR | pendiente | TODO | Cabeza PLANSAL |
| Censo escolar y alfabetización | INEE / Aprender 2024-2025 | pendiente | TODO | Cabeza PLANEDU |
| Datos hídricos por cuenca | INA + provincias | pendiente | TODO | Cabeza PLANAGUA |
| Datos de suelo nacional | INTA + INDEC | pendiente | TODO | Cabeza PLANISV |
| Tarifas eléctricas y pobreza energética | ENRE + INDEC | pendiente | TODO | Cabeza PLANEN |

## Regla operativa

- **Antes de cualquier release público:** verificar baselines relevantes.
- **Cualquier número en plataforma pública** requiere fecha de fuente y enlace en versión técnica.
- **Cualquier cita legal** requiere referencia a artículo + última modificación + jurisprudencia relevante.
- **Auditor externo** valida cada release público.

## Cadencia

- **Trimestral:** revisión de baselines críticos (PBI, gasto, multilateral).
- **Anual:** refresh completo.
- **Antes de cada release:** verificación específica de baselines tocados en el release.

## Cómo se actualiza esta tabla

- Cada owner reporta al cierre de cada trimestre.
- Cambios requieren commit con justificación.
- Si un baseline crítico cambia (ej. PBI revisión INDEC), Tesorero PEO convoca revisión extraordinaria.
