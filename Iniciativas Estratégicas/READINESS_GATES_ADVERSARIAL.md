# Compuertas de Readiness Adversarial — Top-3 Attack Paths por PLAN

> **STATUS:** current
> **CANONICAL_ARCHITECTURE:** 22 thematic + PLANRUTA protocol
> **REGISTRY:** ver `PLAN_REGISTRY.yml`
> **PRINCIPIO:** un PLAN no avanza de diseño a piloto sin que sus 3 attack paths principales tengan **mitigación nombrada, owner accountable, presupuesto de respaldo, e indicador de activación documentado**.
> **FUENTE:** `SIMULACION_ADVERSARIAL_BASTA.md` + auditoría 2026-04-26.
> **VINCULANTE:** sí. El PEO no firma promoción de tranche sin gate adversarial cerrado.
> **LAST_AUDIT:** 2026-04-26

## Reglas de gates

- **Gate de promoción a piloto:** los 3 attack paths deben tener mitigación firmada.
- **Gate de promoción a sistema:** los 3 deben tener mitigación operativa medida durante ≥ 12m.
- **Activación:** si el indicador del attack path se cumple, el fallback budget se libera + se reúne el owner + Director PEO en 72hs.

---

### PLANAGUA

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Captura provincial de cánones | Auditoría externa permanente + redistribución federal con cláusula anti-captura | Oficial Legal PEO + Cabeza PLANAGUA | USD 50M anuales | 2 provincias con desvíos documentados en 12m |
| 2 | Sabotaje de mediciones | Triple medición (estado + comunidad + universidad) con publicación abierta | Cabeza PLANAGUA + universidades convenio | USD 20M anuales | Discrepancia >15% entre fuentes en 3 cuencas |
| 3 | Judicialización por cuencas privadas | Pre-clearance CSJN + adhesión provincial documentada antes de launch | Oficial Legal PEO | USD 30M reserva legal | 1 cautelar nacional firmada |

### PLANVIV

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Litigio masivo de propietarios | Expediente individual + cláusulas de transición + diálogo previo con asociaciones | Oficial Legal PEO + MinHabitat | USD 80M reserva legal | 100 amparos en 6m |
| 2 | Captura municipal de fondos | Auditoría externa por programa + canal denuncia + transferencia escalonada por hito | Oficial Riesgo PEO | USD 60M anuales | 1 municipio con desvío documentado |
| 3 | Fraude en RENABAP | Triple firma (federación cooperativas + INDEC + auditoría comunitaria) por transferencia | Cabeza PLANVIV + Oficial Evaluación | USD 40M anuales | 5% transferencias con discrepancia |

### PLANSAL

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Desabastecimiento crítico de medicamentos esenciales | Stock estratégico nacional + canal multilateral activado + producción Bastarda piloto | Cabeza PLANSAL + Tesorero PEO | USD 100M reserva | Stock <30 días en 3 medicamentos críticos |
| 2 | Sindicatos médicos bloquean | Mesa permanente + compensación + recategorización transparente | Cabeza PLANSAL + Oficial Capacidad PEO | USD 40M anuales | Paro general >7 días |
| 3 | Judicialización de Programa Médico Obligatorio | Marco legal claro + pre-clearance CSJN | Oficial Legal PEO | USD 30M reserva legal | 1 cautelar nacional firmada |

### PLANEDU

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Sindicatos docentes bloquean censo de asistencia | Auditoría comunitaria de asistencia (no policial) + diálogo + compensación | Cabeza PLANEDU + Oficial Capacidad PEO | USD 30M anuales | Paro nacional >5 días |
| 2 | Captura provincial de fondos educativos | Transferencia condicionada a métricas publicadas + auditoría externa | Oficial Legal PEO | USD 25M anuales | 1 provincia con desvío |
| 3 | Falsificación de asistencia | Triple verificación (estado + cooperativa estudiantil + comunidad) con publicación | Cabeza PLANEDU | USD 15M anuales | Discrepancia >10% entre fuentes |

### PLANISV

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Captura agroempresaria de pilotos | Declaración obligatoria de conflicto de interés + rotación de sitios + auditoría INTA | Cabeza PLANISV + INTA | USD 10M anuales | 2 sitios con desvío documentado |
| 2 | Falsificación de mediciones | Triple medición (estado + universidad + cooperativa de productores) | Cabeza PLANISV + universidades | USD 8M anuales | Discrepancia >15% |
| 3 | Retiro de INTA por presión política | Convenios redundantes con universidades públicas como backup | Cabeza PLANISV + Director PEO | USD 12M anuales | 30% reducción de personal INTA en piloto |

### PLANEB

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Captura de gestión interna | Rotación obligatoria + auditoría externa + transparencia salarial | Cabeza PLANEB + ANEB | USD 15M anuales | 1 escándalo de gestión documentado |
| 2 | Ataques de competidores establecidos (cárteles) | Marco legal claro + denuncia anti-trust + auditoría de precios competidores | Oficial Legal PEO + CNDC | USD 20M reserva legal | Caída de precios competidor >40% post-launch |
| 3 | Fraude contable | Marco contable público obligatorio + auditoría trimestral externa | Cabeza PLANEB + Tesorero PEO | USD 10M anuales | 1 desvío contable detectado |

### PLANDIG

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Ciberataque crítico (downtime, ransomware, exfiltración) | SOC 24/7 + red team trimestral + fallback offline-first + backups inmutables | Oficial Seguridad PEO | USD 80M reserva | Downtime >24h o brecha confirmada |
| 2 | Brecha de identidad-lite | Cifrado E2E + auditoría externa anual + canal denuncia | Subsecretaría Datos + Oficial Seguridad | USD 50M reserva | 1 brecha con datos de >10k usuarios |
| 3 | Captura de proveedor cloud (lock-in) | Multi-cloud + open source + cláusulas de portabilidad + datos en territorio nacional | Cabeza PLANDIG | USD 60M reserva | Proveedor único >70% capacidad |

### PLANRUTA

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Captura interna del PEO | Auditor externo permanente + rotación + transparencia + canal denuncia OEA | Director PEO + auditor externo | USD 20M | 2 vetos del PEO sin justificación documentada |
| 2 | Parálisis por consenso | Reglas de plazos + escalación automática a Mesa Gobierno + auditor externo como tie-breaker | Director PEO | USD 5M | 3 decisiones cruzadas sin resolución en 60 días |
| 3 | Dilución de gates por presión política | Matriz vinculante publicada + costos políticos de saltar gate documentados | Director PEO + Mesa Gobierno | USD 10M | 1 gate saltado sin justificación |

### PLANSEG

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Captura policial / corrupción interna | Auditoría externa permanente + rotación de mandos + canal anónimo OEA | Oficial Seguridad PEO + Cabeza PLANSEG | USD 50M anuales | 3 incidentes de captura documentados en 12m |
| 2 | Militarización política (uso de fuerzas para política partidaria) | Mando civil + transparencia operativa + revisión judicial obligatoria | Director PEO + Mesa Gobierno | USD 30M | 1 operativo cuestionado por organismos derechos humanos |
| 3 | Captura sindical (resistencia a auditoría) | Mesa tripartita + compensación + auditoría comunitaria | Oficial Capacidad PEO + sindicatos | USD 20M anuales | Paro federal >7 días |

### PLANREP

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Sindicatos bloquean transición voluntaria | Compensación generosa + capacitación + retiro voluntario asistido | Cabeza PLANREP + Oficial Capacidad | USD 100M reserva | Paro general estatal >7 días |
| 2 | Político de turno acelera para "racionalizar" forzado | Matriz vinculante + Mesa Gobierno + protección legal de proceso voluntario | Director PEO | USD 30M | Decreto que acelera fuera de marco |
| 3 | Trauma social por nombre "racionalización" | Renombrar como "modernización con transición digna" + comunicación cuidadosa | Oficial Comunicación PEO | USD 10M | Encuesta con >50% rechazo del programa |

### PLANEN

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Captura corporativa (generadoras + petroleras) | Datos energéticos abiertos + auditoría externa + competencia abierta | Cabeza PLANEN + Tesorero PEO | USD 60M reserva | 1 contrato con sobreprecio documentado |
| 2 | Conflicto provincial (regalías, jurisdicción) | Mapa de adhesión + acuerdos federales claros + arbitraje neutral | Oficial Legal PEO | USD 40M anuales | 1 cautelar provincial |
| 3 | Sabotaje sindical durante reforma | Mesa tripartita + transición de empleos + compensación | Oficial Capacidad PEO | USD 30M anuales | Paro sectorial >5 días |

### PLANCUL

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Ataque ideológico (derecha religiosa o izquierda dura) | Pluralidad de jurados + transparencia + métricas de servicio | Cabeza PLANCUL + Oficial Comunicación | USD 5M | Campaña sostenida >3 meses |
| 2 | Captura sectorial (clientelismo cultural) | Rotación de jurados + auditoría externa + concursos abiertos | Cabeza PLANCUL | USD 5M anuales | 2 quejas formales de jurados |
| 3 | Reducción a "ornamento simbólico" sin métricas | Vinculación obligatoria a PLANEDU/PLANMEMORIA/PLANCUIDADO con KPIs publicados | Oficial Evaluación PEO | USD 3M anuales | <50% acciones con métricas en 12m |

### PLANJUS

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Corporación judicial bloquea pilotos | Diálogo con asociaciones + pilotos en fueros administrativos primero + auditoría externa | Cabeza PLANJUS + Oficial Legal | USD 40M reserva | 1 cautelar contra el plan |
| 2 | Judicialización del propio plan | Marco legal claro + pre-clearance CSJN | Oficial Legal PEO | USD 30M reserva | Cautelar firmada |
| 3 | "Replantear el Poder Judicial" como narrativa pública | Mantener doctrina interna; comunicación pública sobre tiempos de resolución y resultados concretos | Oficial Comunicación PEO | USD 5M | Encuesta con >40% percibe el plan como amenaza |

### PLANSUS

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Captura narco / crimen organizado en transición | Inteligencia + cooperación internacional + harm reduction sin comercialización | Oficial Seguridad PEO | research budget | Cualquier indicador de violencia organizada |
| 2 | Ataque internacional (DEA, UNODC, sanciones) | Cooperación pre-anuncio + research académico + sin compromiso operativo | Cancillería + Director PEO | USD 5M reserva diplomática | 1 nota diplomática adversa |
| 3 | Backlash religioso / educativo | Diálogo iglesias y comunidades educativas + lenguaje cuidadoso | Oficial Comunicación PEO | USD 3M | Campaña sostenida >3 meses |

### PLANMON

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Corrida cambiaria por anuncio | Mantener research-only sin anuncios públicos; coordinación BCRA + multilateral | BCRA + Director PEO | research budget | Anuncio filtrado |
| 2 | Ataque mediático "hiperinflación inminente" | Mantener doctrina interna; sin compromiso operativo | Oficial Comunicación + BCRA | USD 2M | Campaña sostenida |
| 3 | Ataque al BCRA (independencia o reservas) | Coordinación FMI + transparencia + sin curso legal alternativo en tranche-1/2 | BCRA | research budget | Presión política sobre BCRA |

### PLANGEO

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Retaliación geopolítica por material confrontacional filtrado | Mantener material privado; diplomacia sobria pública | Cabeza PLANGEO + Cancillería | USD 5M reserva diplomática | 1 nota diplomática adversa |
| 2 | Fuga de capitales por percepción anti-extranjera | Comunicación pública medida + acuerdos bilaterales sostenidos | Tesorero PEO + Cancillería | USD 30M reserva | Salida >5% reservas en 30 días |
| 3 | Ataque mediático extranjero | Comunicación interna fuerte; pública medida | Oficial Comunicación PEO | USD 3M | Campaña sostenida |

### PLAN24CN

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Captura inmobiliaria de sitios potenciales | Sin compromisos de tierra hasta resultados PLANVIV; labs académicos | Cabeza PLAN24CN | research budget | Especulación documentada |
| 2 | Conflicto provincial por sede | Sin selección de sede en research-only; diálogo provincial diferido | Cabeza PLAN24CN + Cancillería interna | USD 5M | Disputa interjurisdiccional |
| 3 | Escándalo ambiental por estudios | Auditoría externa + transparencia | Oficial Evaluación PEO | USD 3M | Denuncia ambiental fundada |

### PLANMESA

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Captura partidaria | Rotación + reglas de incompatibilidad + auditoría externa | Cabeza PLANMESA + auditor externo | USD 5M | 2 deliberaciones con sesgo documentado |
| 2 | Fatiga participativa | Sortición rotativa + remuneración + comunicación clara | Cabeza PLANMESA | USD 5M | Participación <60% |
| 3 | Deslegitimación pública | Transparencia total + disenso público publicable | Oficial Comunicación PEO | USD 2M | Encuesta con >30% rechazo |

### PLANTALLER

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Accidente con víctima | Estándares de seguridad firmados + seguro obligatorio + protocolo de cierre + investigación + reparación | Cabeza PLANTALLER + Oficial Seguridad | USD 20M reserva | Cualquier accidente con lesión |
| 2 | Fraude (talleres fantasma) | Auditoría trimestral externa + verificación comunitaria | Cabeza PLANTALLER | USD 5M anuales | 1 caso de fraude detectado |
| 3 | Captura corporativa (oficios convertidos en mano de obra barata) | Cooperativas como vehículo preferido + transparencia financiera | Cabeza PLANTALLER + ANEB | USD 5M | Salarios <salario mínimo regional |

### PLANCUIDADO

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Ataque de privacidad (datos sensibles) | PIA aprobado + cifrado + cláusula de revocabilidad | Oficial Seguridad + Cabeza PLANCUIDADO | USD 15M reserva | 1 brecha confirmada |
| 2 | Backlash religioso / familias tradicionales | Mesa de diálogo + lenguaje cuidadoso + transparencia de uso | Oficial Comunicación PEO | USD 5M | Campaña sostenida >3 meses |
| 3 | Captura sindical de servicios de cuidado | Mesa tripartita + compensación + transición | Oficial Capacidad PEO | USD 10M anuales | Paro sectorial >7 días |

### PLANMEMORIA

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Politización del archivo (uso partidario) | Consejo plural rotativo + auditoría externa + transparencia procesos | Cabeza PLANMEMORIA + auditor externo | USD 5M | 1 decisión con sesgo documentado |
| 2 | Captura ideológica | Pluralidad obligatoria + métricas objetivas | Oficial Evaluación PEO | USD 3M | Imbalance ideológico documentado |
| 3 | Ataque privacidad (archivos personales sensibles) | Comenzar con políticas públicas, no archivos personales; PIA reforzado | Oficial Seguridad + Cabeza PLANMEMORIA | USD 10M reserva | Solicitud de archivos personales sin marco legal |

### PLANTER

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Litigio extractivo masivo (CIADI) | Pre-clearance CSJN + cláusulas anti-CIADI + escalonamiento por línea (L1 antes que L2) | Oficial Legal PEO + Cancillería | USD 100M reserva | 1 arbitraje internacional iniciado |
| 2 | Conflicto comunidades originarias | Consulta previa documentada por proyecto + INAI como observador permanente | Cabeza PLANTER + INAI | USD 30M anuales | Demanda comunitaria sin resolver |
| 3 | Retaliación provincial (RIGI, regalías) | Mapa de adhesión + diálogo + arbitraje neutral | Oficial Legal PEO | USD 40M | 1 cautelar provincial |

### PLANMOV

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Captura sindical transporte (UTA, SMATA, Camioneros, ferroviarios) | Mesa tripartita + transición de empleos + compensación + diálogo previo | Oficial Capacidad PEO + Cabeza PLANMOV | USD 80M anuales | Paro nacional transporte >7 días |
| 2 | Conflicto AMBA-provincias en línea L3 | Acuerdo interjurisdiccional documentado pre-launch + mediación neutral | Cabeza PLANMOV + Director PEO | USD 30M | Disputa formal entre CABA y Provincia BA |
| 3 | Escándalo AV (línea L4 research) | Mantener research-only; sin operación pública; auditoría externa de research | Cabeza PLANMOV + Oficial Seguridad | USD 5M | Filtración de operación AV no autorizada |

---

## Cierre

Este documento se actualiza al cierre de cada wave (cada 6 meses). Cada attack path activado se documenta en `portfolio_risk_register.md` y dispara el playbook de respuesta correspondiente.
