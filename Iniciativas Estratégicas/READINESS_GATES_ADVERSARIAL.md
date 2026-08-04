# Compuertas de Readiness Adversarial — Top-3 Attack Paths por PLAN

> **STATUS:** current
> **CANONICAL_ARCHITECTURE:** 27 thematic + PLANRUTA protocol
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

### PLANPACTO

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | No ratificación de la ley-convenio (Fase 2 nunca llega) | Fase 0 partida: núcleo unilateral por decreto (Libro Mayor + mitad nacional del Recibo) que no requiere ratificación; Fórmula en modo sombra publicada igual; corte Fase 0 / Fase 2 declarado en la Sección 11 | Oficial Legal PEO + Cabeza PLANPACTO | hasta USD 700M/año — extremo alto de la banda de régimen; sin partida adicional | 12 legislaturas sin tratamiento a 24 meses de elevada la ley-convenio |
| 2 | Reversión por decreto de la Fase 0 | Adhesión con caja desde el día uno (adherir paga, desadherir cuesta); convenio que subsiste sin la Nación; feed de datos por ley con obligación de espejo; el Libro Mayor sobre reforma de la Ley 24.156, que solo cae con otra ley | Director PEO + Oficial Legal PEO | hasta USD 700M/año — extremo alto de la banda de régimen; el litigio por incumplimiento del convenio no está costeado aparte | 1 decreto que derogue la publicación de datos fiscales abiertos, o 2 provincias que desadhieran en 12m |
| 3 | Captura del padrón poblacional | INDEC produce con registro civil y ARCA como contraste; auditoría anual por muestreo en terreno con equipos sorteados entre jurisdicciones distintas de la auditada; doble mayoría del CFF para certificar; microdatos y metodología publicados; impugnación abierta que no congela el giro | Oficial Evaluación PEO + sala del Padrón y la Fórmula del CFF | hasta USD 700M/año — extremo alto de la banda de régimen; un recuento extraordinario excede la banda y no está costeado | 1 impugnación de padrón con diferencia >5% confirmada, o intervención del organismo que produce el padrón |

### PLANARCO

> **Nota de habilitación:** este PLAN **no superó** el gate de spin-off de la regla 3 — pasa contra cada huésped por separado (1,77–2,13x contra PLANCUIDADO, 8,83–16,00x contra PLANSAL) y falla contra los dos sumados, 1,47–1,88x contra un umbral de 1,5. Existe por derogación expresa de la regla 5 y de la condición temporal de la regla 3 (`ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md`). La banda de régimen que acota los fallbacks es **USD 6.000–10.900M/año**, derivada en la Sección 9 del PLAN.

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Vaciamiento de la Capa de Forma por no ejecución (la Fase 3 nunca se ejecuta y el PLAN queda como régimen previsional) | Razón de ejecución en la misma ley que crea la renta: el gasto ejecutado de la Capa de Forma no puede ser, en un ejercicio, menor a un veinteavo del de la Capa de Renta; Tablero Nacional del Arco con brecha publicada por estación, mes a mes; estaciones que coinciden con un pago ejecutadas en el mismo acto de liquidación; lista nominada en la Sección 12 de qué sobrevive y qué no si la Fase 3 no se ejecuta | Oficial Evaluación PEO + Cabeza PLANARCO | hasta USD 10.900M/año — extremo alto de la banda de régimen; el sostenimiento de la Capa de Forma no tiene partida adicional y compite adentro de la misma banda | Razón de ejecución por debajo de 1/20 en 1 ejercicio, o brecha del tablero creciente durante 6 meses en 3 estaciones |
| 2 | Reposición de la regla derogada: se restaura la regla 5 del acta y el arco vuelve adentro de PLANCUIDADO y PLANSAL | Acta de habilitación publicada con su motivo y su medición, y el cociente que falla escrito en la cabecera del propio PLAN con su umbral al lado, de modo que reponer la regla obliga a contestar el hallazgo y no solo a invocarla; frontera declarada —el acta retira la porción de vejez y la discapacidad queda entera en PLANCUIDADO y PLANSAL—; ley del Congreso para la Renta de Arco y la ANAV antes del cierre de la Fase 1 | Oficial Legal PEO + Director PEO | hasta USD 10.900M/año — extremo alto de la banda de régimen; la reabsorción del arco por sus dos huéspedes no está costeada aparte | 1 acto formal que reponga la regla 5 o la condición temporal de la regla 3, o 1 impugnación de la habilitación por escrito |
| 3 | El Alto de los Cuarenta y Cinco se vuelve descarte por edad (el corte del adelanto y la interacción con la jornada 6+2 caen sobre la misma nómina) | Crédito fiscal al 100% igual para todos y proporcional a las horas, sin umbral por tamaño de empresa; el corte del adelanto se fija en días de financiamiento y no en cantidad de empleados; medición obligatoria en la ventana en que la jornada 6+2 todavía no es obligatoria (tranche-3, empresas de más de 500 empleados), y sin esa medición el Alto no promueve de tranche | Oficial Capacidad PEO + Cabeza PLANARCO | hasta USD 10.900M/año — extremo alto de la banda de régimen; el reintegro del Alto sale de la partida común del PLAN y la interacción con la jornada 6+2 no está modelada ni acá ni en PLANCUIDADO | Tasa de toma del Alto entre 45 y 50 años 30% menor en empresas sin acceso al adelanto durante 12m, o caída de contrataciones de 45+ en 2 sectores medidos |


### PLANPREGUNTA

> **Nota de habilitación:** este PLAN **no superó** el gate de spin-off de la regla 3 — pasa contra PLANEB (33,00–43,33x) y contra PLANDIG (3,51–2,63x), y **falla contra PLANEDU solo (0,21–0,26x) y contra los tres huéspedes sumados (0,19–0,24x)**. Se habilita por derogación expresa de la regla 5 y de la condición temporal de la regla 3 (`ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md`). El acta agrega la lectura y corresponde citarla acá: la regla 3 mide tamaño relativo, y un sub-mandato alojado en un huésped de USD 80.000–100.000M tendría que costar 120.000M contra el extremo bajo y 150.000M contra el alto para superar el umbral, de modo que ningún hueco de conocimiento científico va a pasarlo jamás. **Escribir que pasó el gate sería falso, y la guardia del documento lo prohíbe.**

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | Captura por el establishment científico: quienes están en condiciones de formular Preguntas escriben las que ellos mismos pueden contestar, sin que nadie actúe de mala fe | Incompatibilidad de autoría en la ley que crea la ANCON —quien escribe una Pregunta no dirige el equipo que la contesta, verificable cruzando el registro del Censo contra el acta de apertura—; habilitación de jurados sobre padrones que administran otros PLANes (Credencial de Materia de PLANMESA, Registro Nacional de Peritos de PLANJUS, Síndicos de Archivo de PLANMEMORIA); tope de mayoría del directorio: la mayoría no puede provenir del sistema científico | Oficial Integridad PEO + Cabeza PLANPREGUNTA | hasta USD 2.300M/año — extremo alto de la banda de régimen; la salvaguarda no tiene partida propia y se ejecuta adentro del circuito | Proporción de Preguntas abiertas cuyo enunciado provino del Censo por debajo del 50% durante 3 años consecutivos |
| 2 | Agencia vaciada sin derogación: ley intacta, sigla en el organigrama, directorio nombrado y ninguna Pregunta abierta — el método que `BLINDAJE:44` documenta para INTA y CONICET | Indicador público principal único y no simulable con actividad: Preguntas cerradas con Prueba de Barro en los últimos 12 meses, no presupuesto ejecutado ni dotación; los cuatro gates entre fases se miden contra entregables y ninguno contra ejecución presupuestaria; el registro, el catálogo y la Serie se transfieren y no se cierran (Sección 21) | Oficial Evaluación PEO + Cabeza PLANPREGUNTA | hasta USD 2.300M/año — extremo alto de la banda de régimen; el vaciamiento no consume partida, la libera | Cero Preguntas cerradas con Prueba de Barro durante 2 años consecutivos, o más del 50% de devoluciones del Censo fuera del plazo de 120 días durante 3 años |
| 3 | La fuente se cae: `PLANTER` no reabre el protocolo del Fondo Soberano Ciudadano, o lo reabre y el ciclo de commodities deja el flujo por debajo del piso del régimen | Fase 0 diseñada para no necesitar el nuevo split —célula de ejecución y formulario, USD 150–200M/año—; cláusula de subordinación escrita en los dos documentos, que hace la reapertura defendible del lado de PLANTER; criterio publicado de atraso de Preguntas por menor costo declarado de no saber, en vez de pedir partida adicional; **sin modo degradado para el régimen pleno, y así está declarado en la Sección 13** | Oficial Financiero PEO + Cabeza PLANPREGUNTA | USD 150–200M/año — el costo de la Fase 0, que es lo único que sobrevive sin el split; el hueco de 180M/año del extremo bajo del ciclo se cubre con atraso de Preguntas y no con partida | Ocho puntos del FSC no girados en 1 ejercicio, o aporte anual del Fondo de la Pregunta por debajo de USD 1.500M en 2 ejercicios consecutivos |

---

### PLANFOCO

> **Nota de habilitación:** este PLAN **no falla** el gate de spin-off de la regla 3 — **el gate no lo alcanza.** Nunca tuvo huésped asignado (`ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:31`, `:59`, `:97`), así que no hay denominador y no hay cociente: el hueco «Cultura/Medios/Artes» quedó calificado IMPORTANTE en la auditoría de marzo y `COVERAGE_GAPS_ASSIGNMENTS.md` no le asignó ninguno. No es un spin-off — es un hueco que el freeze dejó abierto. `MASTER_COHERENCE_REPORT.md:399` lo marca «RESUELTO: PLANCUL» y no alcanza, porque PLANCUL no tiene agencia, ni presupuesto, ni piso (`PLANCUL:106`) y trata la concentración mediática como acción «deseable, no esencial» de la que declara no depender (`PLANCUL:383`). Se habilita por derogación expresa de la regla 5 y de la condición temporal de la regla 3. **Este PLAN no tiene piso constitucional** y lo difiere a Visión 2040+: su única defensa contra la reversión es que el retroceso tenga que ser explícito, y por eso los tres attack paths de abajo son, todos, formas de que el retroceso sea silencioso.

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | **Captura de la Biblioteca por el aparato político local.** Mil quinientos empleos calificados, uno por barrio, en localidades donde el Estado nacional no emplea a nadie: es la superficie clientelar más grande del corpus. No llega como captura sino como propuesta de mejora — «que se pondere el arraigo», «que se valore la trayectoria», «que haya una instancia final de evaluación» —, y cada una de esas mejoras es la puerta | Concurso ciego —antecedentes anonimizados, prueba de trabajo corregida sin saber de quién es— **y después sorteo entre los aprobados** con la mecánica de `PLANMESA:297`; mandato a término y renovación **por sorteo, no por evaluación de la agencia**; actas de todos los sorteos publicadas con semilla y padrón. Formación abierta pagada por adelantado, para que haya entre quiénes sortear | ANBAC + Directorio (2 sillones sorteados entre ciudadanos con Credencial) | Hasta el 15% de la línea de la Biblioteca Viva (USD 28–41M/año) para repetir concursos anulados y sostener la formación abierta un año más | Cualquier propuesta normativa que agregue un criterio de desempate **posterior** al sorteo; o un acta de sorteo sin semilla publicada; o más del 5% de designaciones «transitorias» sobre el total de sedes |
| 2 | **La Antena usada para hostigar, y la presión pública que sigue.** Alguien va a usar un canal dotado por el Estado para difamar, para hostigar o para decir que el gobierno es una porquería. Es certero, no probable. La captura no es el hecho: es la causal de baja que se va a crear después, «acotada», «excepcional» y «con debido proceso», y que convierte la dotación en un permiso revocable — que disciplina más que la prohibición | La ley **no prevé ninguna causal de contenido** y la respuesta institucional de ANBAC es ninguna: no interviene, no advierte, no suspende y no comenta. Si hay delito, justicia ordinaria, con el mismo procedimiento y la misma carga de prueba que para cualquier publicación; **la dotación no crea jurisdicción especial ni procedimiento abreviado**. Lo único que la ley le exige a la agencia es no borrar el registro de la dotación | ANBAC + PLANJUS (justicia ordinaria, no fuero propio) | Hasta el 10% de la línea de La Antena (USD 2,5–4,5M/año) para defensa jurídica del régimen y para sostener el registro si el servicio se corta | Cualquier proyecto —normativo o reglamentario— que introduzca una causal de baja por contenido, por «uso indebido» o por «apartamiento de los fines»; o un registro de dotaciones con bajas sin motivo asentado |
| 3 | **La pauta vuelve por decreto, y vuelve callada.** Un decreto se deroga con otro decreto. Este PLAN no tiene piso constitucional, no reclama escalón de la Escalera de `PLANPACTO` y es de los primeros que se recorta en una crisis fiscal, porque una biblioteca cerrada no mata a nadie esta semana. El riesgo terminal es que la partida vuelva a crearse en un artículo de una ley de presupuesto que nadie lee | No hay blindaje: hay **costo explícito**. Derogar el cronograma no basta — hay que **recrear la partida, con firma, monto y nombre en el Boletín Oficial**, mientras esos 450 millones están visiblemente pagando sedes abiertas con gente adentro. Más el indicador de tablero de pauta colocada, publicado todos los meses aunque valga cero, y el orden de preservación de la Sección 21 (el Acervo primero, porque es lo único irreversible) | ANBAC + PLANPACTO (Techo B y LIFO) | Ninguno: si la fuente se cae, este PLAN opera lo construido con presupuesto ordinario y sin expansión. **No propone fuente de reemplazo** —canon, impuesto a plataformas, tasa sobre publicidad privada— porque cualquiera de las tres recrea la bolsa que este PLAN existe para apagar | Cualquier partida de publicidad oficial superior a cero después de 2031; o el indicador mensual de pauta colocada dejando de publicarse; o la línea de ANBAC pasando del 5% al 8% del total del PLAN, que es la señal de que la agencia empezó a crecer hacia el contenido |

---

### PLANPUERTA

> **Nota de habilitación:** este PLAN **no falla** el gate de spin-off de la regla 3 — **el gate no lo alcanza**, por la misma razón que PLANFOCO y no por analogía con él. Nunca tuvo huésped: el barrido de `COVERAGE_GAPS_ASSIGNMENTS.md` por `migra|inmigra|extranjer|refugiad` da **cero resultados**, así que la inmigración no fue sub-mandato de nadie, no hay denominador y no hay cociente. Se habilita por `ACTA_EXCEPCION_FREEZE_2026-08-02.md`, que deroga expresamente la regla 5 y la condición temporal de la regla 3 para este PLAN y sólo para él. **No es un spin-off: es un hueco que la auditoría de marzo-abril de 2026 nunca vio, y por eso no le saca un peso a ningún PLAN existente.** La banda de régimen que acota los fallbacks es **USD 30–60M/año** —USD 450-900M a quince años, clase S, derivados en la SECCIÓN 12— y es de las más chicas del corpus. Eso obliga a una honestidad que las otras filas de este archivo no necesitaron: **dos de los tres fallbacks de abajo son visiblemente insuficientes contra el daño que dicen respaldar, y se escriben igual, con el monto y con la insuficiencia declarada.** Inflarlos sería estrenar una cifra; omitirlos dejaría un attack path sin presupuesto de respaldo, que es lo que el principio del archivo prohíbe.

> **Verificación externa pendiente, con owner y fecha — la SECCIÓN 2 remite acá por ellos.** El propio documento declara que **ninguna** de las cifras de sus cinco precedentes internacionales —Start-Up Chile, Canadá, Italia, España, Nueva Zelanda— está verificada adentro del proyecto. **Owner: Oficial Evaluación PEO.** **Fecha: antes del cierre de la Fase 0 (mes 12)**, que es la última ventana en la que el PLAN todavía no comprometió una exención ni un lote. Se pide con fecha porque dos afirmaciones de esa sección ya se cayeron durante la escritura del documento —la Immigration Salary List británica, abolida el 22/07/2025 por HC 997, y la atribución causal del salto italiano— y porque la SECCIÓN 2 es la única del documento cuyo material no lo produce el corpus.

| # | Attack path | Mitigación | Owner | Fallback budget | Indicador de activación |
|---|-------------|------------|-------|-----------------|-------------------------|
| 1 | **El Paquete se vuelve casta, y el indicador que lo mediría no muerde.** Nadie decide fabricar una casta: un gobierno ensancha la brecha entre el invitado y el residente MERCOSUR que ya está acá haciendo bien todo lo demás. Y las dos defensas escritas fallan por lugares distintos. **Si el Tablero sale sin la fila de brecha de casta, no pasa nada:** la sanción de la SECCIÓN 15 —la Ventana no abre y la falta se inscribe en PLANMEMORIA— está escrita contra el Tablero entero, y un tablero con nueve indicadores de diez no es un tablero que no salió. **Y si sale, tampoco pasa nada:** la alarma de esa fila dice «que se abra», que es una dirección y no un umbral, y de ella no depende que ninguna ventana abra — eso depende sólo del indicador rector de permanencia. La brecha puede publicarse creciendo diez años sin cerrar una sola ventana. Debajo de las dos, el hueco que el propio PLAN declara: **el mecanismo por el cual el ~1,9M de residentes MERCOSUR que ya está acá toma una fila de la Lista no existe.** Con la cláusula anti-casta atada a la fila y sin camino a la fila, la cláusula es verdadera y vacía | La cláusula anti-casta con la fila y no el pasaporte como unidad, que hay que derogar en el Congreso (SECCIÓN 9); el Paquete alcanzable desde la Puerta de Derecho (SECCIÓN 5); ningún estatus atado a un empleador, a un contrato ni a un proyecto (séptimo renglón del Límite II). **Y las tres que faltan, que son las que este attack path pide:** la fila de brecha de casta con la misma consecuencia que el rector —sin esa fila, la Ventana no abre—; un umbral numérico escrito antes del primer dato, como lo tienen los otros nueve indicadores; y el mecanismo de acceso de los que ya están, que hoy es hueco declarado y no diseño | Oficial Evaluación PEO + Cabeza PLANPUERTA (ANAR) + PLANMESA (Caso de Mesa) | Hasta el 15% de la única línea operativa del PLAN — **USD 4,5–9M/año** contra el extremo alto de la banda de régimen. **Declarado insuficiente y escrito igual:** alcanza para producir la serie desagregada y auditarla, y no alcanza para nada más. Una casta ya formada no se compra de vuelta con nueve millones — se deroga el Paquete, y eso no es un fallback presupuestario sino el fin del PLAN | Un Tablero publicado sin la fila de brecha de casta; o la brecha creciendo dos cohortes consecutivas sin que ninguna ventana se cierre; o Contratos de Puerta firmados por residentes que ya estaban en el país por debajo del 10% del total durante 3 cohortes |
| 2 | **La revocación usada como castigo político — la 4.144 entrando por la ventana del contrato.** El Contrato de Puerta redactado con compromisos tan vagos que revocarlo equivale a expulsar. La lista de actos es taxativa y son tres, pero **sólo el primero y el tercero llevan sentencia firme; el segundo —cumplir lo firmado— el propio documento lo declara sin juez**, y es el único que se va a usar. «Producirla» y «hacer el trabajo» admiten lectura política sin torcer una palabra, y quien constata es el PLAN que paga la fila, que no es el empleador pero tampoco es un tercero. El Caso de Mesa existe, pero **abre a pedido de la persona y después del hecho**: la carga de impugnar queda del lado del que ya perdió. Y la segunda defensa —«la residencia queda intacta»— es jurídicamente exacta y económicamente incompleta: al que mudó una familia contra un lote y una exención, revocarle el Paquete puede ser funcionalmente irse, sin que el Estado dicte una sola orden de expulsión. **La arquitectura entera descansa en que ampliar la lista cuesta una ley del Congreso: eso es un costo, no un muro**, y el corpus ya conoce la diferencia porque es lo único que PLANFOCO tiene contra la vuelta de la pauta | Lista taxativa de tres actos que no se amplía por decreto, con el primero y el tercero atados a sentencia firme (SECCIÓN 9); se revoca el Paquete y jamás la residencia, y ANAR no tiene facultad de expulsión, de control migratorio ni de sanción sobre personas (SECCIONES 10 y 11); el segundo acto lo constata el PLAN que paga la fila o el municipio que entregó el lote, nunca el empleador, y ANAR registra sin decidir; irretroactividad absoluta; y **la única fila del Tablero cuya alarma es una sola ocurrencia: una causal fuera de la lista taxativa**. Lo que falta y este attack path exige: **Caso de Mesa automático, y no a pedido, para toda revocación por el segundo acto**, y la causal desagregada por origen y por jurisdicción, porque una revocación política no se ve en el total | Oficial Legal PEO + PLANMESA + Cabeza PLANPUERTA | Hasta el 10% de la única línea operativa del PLAN — **USD 3–6M/año** contra el extremo alto de la banda de régimen, para defensa jurídica del régimen y para sostener el registro de Contratos mientras se litiga. **Declarado insuficiente:** la restitución de lo revocado —lote, exención, anticipación— no está costeada en ninguna fila de este PLAN ni de ningún otro, y es el número que importaría | Una sola revocación por el segundo acto sin informe escrito del PLAN que paga la fila; o una sola causal fuera de la lista taxativa, que el Tablero ya declara alarma máxima del sistema; o cualquier proyecto —normativo o reglamentario— que agregue un renglón a los tres actos, o que le saque la sentencia firme al primero o al tercero; o revocaciones por el segundo acto concentradas por encima del 30% en un origen o en una jurisdicción |
| 3 | **El freno de infraestructura se desactiva sin tocar la fórmula.** El ataque obvio —derogar el freno por decreto en un año electoral— no es el que va a pasar, porque la fórmula vive en el Marco y el Marco es ley. El que va a pasar es más barato: **la fórmula lee tres márgenes que produce otro, y quién define qué es un margen no lo fija esta ley.** PLANVIV, PLANAGUA y PLANEDU declaran los suyos; que el agua se informe como capacidad instalada en vez de como disponible menos comprometido es una decisión reglamentaria del que la informa, y el documento escribe él mismo que medida así **«el agua no muerde nunca»**. La fórmula queda intacta, el semáforo pasa a verde y nadie derogó nada. Dos aceleradores más: los insumos se cortan al 31 de diciembre y se recalculan una vez por año, y **la ventana ya abierta corre con el número con el que abrió** — un año electoral entero puede correr con un margen fijado antes. Y el daño llega tarde por diseño: el backlash canadiense se dio vuelta en veinticuatro meses sobre un sistema que aceleraba; acá llegaría a los quince años, con las cohortes adentro y con los lotes ya consolidados, que al consolidarse salieron del Paquete y **no dejan nada que revocar** | Fórmula publicada en el Marco antes de la primera ventana, con sus insumos y su fecha, de modo que cualquiera llega al mismo número (SECCIÓN 9); el cupo es **el menor de los tres márgenes y jamás el promedio**; ningún insumo lo produce ANAR; irretroactividad —el freno se aplica sobre la ventana que todavía no abrió y nunca hacia atrás—; y el rojo publicado como lista de obras con nombre y jurisdicción, que le deja a la provincia frenada el papel con el que reclamar. Lo que falta y este attack path exige: **la definición operativa de cada margen en la misma ley que la fórmula, y no en el reglamento del que lo produce**, más recálculo obligatorio antes de cada ventana en vez de una vez por año | Cabeza PLANPUERTA + PLANVIV, PLANAGUA y PLANEDU (cada uno declara su margen) + Oficial Evaluación PEO | **Ninguno, y la razón va escrita en vez de disimulada: el freno que falla no consume presupuesto de este PLAN — lo libera.** La ventana abre donde no debía y el costo cae sobre vivienda, agua y escuela, que están dos órdenes de magnitud por encima de la banda de régimen de acá (PLANVIV solo son USD 80.000-120.000M a quince años, `PRESUPUESTO_CONSOLIDADO_BASTA.md:37`). Respaldar eso con una partida de USD 30–60M/año sería teatro contable. **El único fallback real es la ventana que no abre** | Cualquier cambio en la definición de un margen que no pase por la ley del Marco; o un margen publicado como capacidad instalada en vez de como disponible menos comprometido; o una ventana abierta con insumos posteriores a su apertura, o con insumos de más de doce meses; o dos ejercicios seguidos sin recálculo antes de la primera ventana |

---

## Cierre

Este documento se actualiza al cierre de cada wave (cada 6 meses). Cada attack path activado se documenta en `portfolio_risk_register.md` y dispara el playbook de respuesta correspondiente.
