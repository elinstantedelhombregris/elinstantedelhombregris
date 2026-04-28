# Privacy Impact Assessment Stub — PLANMOV

> **STATUS:** stub
> **OBLIGATORIO ANTES DE:** activación de cada línea interna en tranche-3 (L1, L2, L3). L4 research-only requiere PIA específico antes de cualquier piloto operativo.

## 1. Datos involucrados

- **Línea L1 (movilidad básica):** datos de uso de transporte público (no individuales por defecto).
- **Línea L2 (flete ferroviario):** datos de carga + operadores.
- **Línea L3 (AMBA-T):** datos agregados de movilidad metropolitana.
- **Línea L4 (research AV):** geolocalización vehicular individual + biometría conductor (research-only, sin operación).
- Volumen estimado: alto en L3; muy alto en L4 si se operativiza.

**Categorías especiales:** geolocalización individual + biometría (críticas para L4).

## 2. Bases de licitud

- Función pública para servicio de transporte (L1, L2, L3).
- Consentimiento explícito para cualquier dato individual de movilidad.
- L4 research bajo marco académico estricto.

## 3. Riesgos

- **Vigilancia masiva** (riesgo principal en L3 y L4).
- Captura comercial de datos de movilidad.
- Discriminación algorítmica en asignación de servicios.
- Brecha de datos personales con re-identificación.

## 4. Mitigaciones

- Datos agregados por defecto (L1, L2, L3); no individuales.
- Consentimiento explícito para cualquier dato individual.
- L4 con datos sintéticos en research; datos reales requieren PIA específico.
- Auditoría externa permanente.
- Cifrado E2E.
- Decisión humana obligatoria en cualquier asignación.
- Cláusula de revocabilidad operativa.

## 5. Algoritmos

- L1, L2, L3: estadística agregada únicamente en tranche-3.
- L4: research académico con datos sintéticos. **Prohibida operación pública** sin marco legal + PIA + opinión legal externa + nueva auditoría completa.

## 6. Veredicto

**Avanza con condiciones** para L1, L2, L3 en tranche-3. **L4 research-only indefinida**, sin operación pública en horizonte.

## 7. Firmantes pendientes

- Oficial Seguridad PEO.
- ADC, Fundación Vía Libre.
- Sindicatos transporte (consulta).
- Cancillería (para impacto internacional de L4 research).
