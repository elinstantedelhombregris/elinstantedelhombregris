# Privacy Impact Assessment Stub — PLANDIG

> **STATUS:** stub
> **OBLIGATORIO ANTES DE:** entrada a piloto del estadio A. Estadio B requiere PIA por componente.
> **PLAN:** PLANDIG (un solo PLAN; este PIA aplica al estadio A; estadio B requiere PIAs separados por componente)

## 1. Datos involucrados

- Datos de identidad básica (nombre, DNI, fecha de nacimiento, foto opcional).
- Mapeos cruzados entre agencias para servicios (vivienda, salud, educación, asistencia).
- Logs de actividad ciudadana en servicios públicos digitales.
- Volumen estimado: hasta 10M usuarios en tranche-1.

**Categorías especiales que NO se incluyen en estadio A:**
- Biometría masiva (excluida).
- Datos genéticos (excluidos).
- Datos de geolocalización vehicular (excluidos; podrían entrar al estadio B).

## 2. Bases de licitud

- Función pública para identidad-lite.
- Interés legítimo + consentimiento explícito para mapeos cruzados.
- Obligación legal cuando aplique LMV-02 firmada.

## 3. Riesgos

- **Re-identificación** desde datos pseudonimizados.
- **Brecha de seguridad** con exfiltración masiva.
- **Discriminación algorítmica** en dashboards (excluida en estadio A; sin algoritmos automáticos).
- **Vigilancia desproporcionada** si se cruzan datos sin consentimiento.
- **Captura por proveedor cloud** si se viola multi-cloud.

## 4. Mitigaciones

- Minimización: solo datos esenciales para servicios.
- Cifrado E2E + cifrado en reposo.
- Auditoría externa anual + red team trimestral.
- Derecho de acceso/rectificación/eliminación documentado y operativo.
- Retención limitada con purga automática.
- Multi-cloud + portabilidad + datos en territorio nacional.

## 5. Algoritmos

- Estadio A: **NO** hay algoritmos de decisión automatizada.
- Estadio B: cualquier algoritmo requiere PIA específico + decisión humana obligatoria.

## 6. Veredicto

**Avanza con condiciones** para estadio A. Estadio B **diferido** hasta cumplimiento de 6 condiciones de `PLANDIG_ESTADIOS_INTERNOS.md`.

## 7. Firmantes pendientes

- Oficial Seguridad PEO.
- Sociedad civil técnica (Fundación Vía Libre, ADC, otras).
- Autoridad de protección de datos cuando se constituya.
