# PLANMOV v2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refundar el documento `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` de v1.0 (781 líneas, 7 dispositivos) a v2.0 (2.800-3.200 líneas, tres capas con 11 dispositivos + Doctrina del Doble Desplazamiento), integrando IA/AV y Doctrina de Activos Disponibles como capa estructural, y actualizando los documentos de ecosistema relacionados.

**Architecture:** Preservación de todo el contenido narrativo de v1.0 (Héctor, Florencia, 7 fallas, 7 dispositivos originales) + reorganización en 3 capas + expansión a paridad con pares PLANEN/PLANDIG/PLANEB. Capa III es 100% nueva y constituye el núcleo de la v2.0.

**Tech Stack:** Markdown rioplatense; documento fuente y destino en la misma ruta (sobreescritura); tablas Markdown para métricas; cross-references a otros PLANes del ecosistema.

**Spec de referencia:** `SocialJusticeHub/docs/superpowers/specs/2026-04-17-planmov-v2-ia-av-activos-disponibles-design.md`

---

## Contexto y principios de ejecución

1. **Nunca borrar contenido de v1.0.** Todo lo existente se preserva (puede moverse, integrarse, reenumerarse), nunca se elimina. Héctor y Florencia siguen. Los 7 dispositivos siguen. Las 7 fallas siguen.
2. **Voz rioplatense consistente.** "Vos", "pará", "mirá", "acá". Hombre Gris. Argumentación directa con datos. Protagonistas concretos con nombre/edad/lugar.
3. **Densidad narrativa a nivel PLANEN/PLANDIG.** Párrafos largos densos, no bullets decorativos. Tablas con números. Narrativa que se sostiene párrafo a párrafo.
4. **Coherencia con PLANDIG v2.0.** LNMA se monta sobre LANIA, no duplica. Data-logging vía ArgenCloud. Articulado con Arquitecto de Fuerza Laboral IA.
5. **Coherencia con PLANREP.** Reconversión del transportista se articula con ruta "Reconversión Móvil" y Pensión Puente Móvil.
6. **Coherencia con PLANEB.** BAMD respeta arquitectura Fideicomiso + DAO + panel ciudadano. Canon se incorpora al Protocolo Bastardo.
7. **Commit por fase.** Cada fase del plan termina en un commit. Permite rollback y revisión incremental.
8. **Auto-verificación estructural.** Cada tarea termina con un comando `grep`/`wc` que verifica que las secciones esperadas existen y tienen los headers correctos.

---

## Estructura de archivos

**Archivo principal:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` (sobreescritura progresiva de v1.0 a v2.0)

**Archivos de ecosistema a actualizar al final:**
- Modify: `SocialJusticeHub/shared/arquitecto-data.ts` (agregar dispositivos Capa III, actualizar fases)
- Modify: `SocialJusticeHub/shared/strategic-initiatives.ts` (actualizar PLANMOV con v2.0)
- Modify: `Iniciativas Estratégicas/MATRIZ_MISIONES_Y_PLANES_ES.md`
- Modify: `Iniciativas Estratégicas/HOJA_DE_RUTA_CONSOLIDADA_BASTA.md`
- Modify: `Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md`
- Modify: `Iniciativas Estratégicas/TABLA_AGENCIAS_BASTA.md`
- Modify: `Iniciativas Estratégicas/CASCADA_LEGAL_BASTA.md`
- Modify: `Iniciativas Estratégicas/ANALISIS_CONEXIONES_20_PLANES.md`
- Modify: `Iniciativas Estratégicas/SIMULACION_ADVERSARIAL_BASTA.md`
- Modify: `Iniciativas Estratégicas/PDR_NATIONAL_PLAN_SYSTEM.md`
- Modify: `Iniciativas Estratégicas/MASTER_COHERENCE_REPORT.md`

---

# FASE 1 — Nota v2.0, Epígrafe Ampliado, Preámbulo Cuatrivocal, Tesis Central

### Task 1.1 — Actualizar epígrafe de apertura y agregar Nota v2.0

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` líneas 1-31

- [ ] **Step 1: Leer líneas 1-31 actuales para conservar estructura tipográfica**

Run: `sed -n '1,31p' "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"`

- [ ] **Step 2: Agregar al bloque tipográfico (líneas ~10-26) las nuevas líneas después de "Movilidad como Derecho, Logística como Commons At-Cost":**

```
Bastarda de Activos Móviles Disponibles · Laboratorio Nacional de Movilidad Autónoma
Fondo de Reconversión Móvil · Canon de Automatización Logística
Doctrina del Doble Desplazamiento · Datos de Movilidad como Commons
Corredores Duales · Certificación PCAV · Operador AV Certificado
```

- [ ] **Step 3: Agregar a la línea de agencias (~23-26) "ANMov · BAMD · LNMA · FRM · AMBA-T":**

```
ANMov · BAMD · LNMA · FRM · AMBA-T · PCAV
```

- [ ] **Step 4: Cambiar versión y fecha (línea ~27):**

```
Abril 2026 | Versión 2.0 (refundación con IA/AV y Doctrina de Activos Disponibles)
```

- [ ] **Step 5: Insertar bloque "NOTA DE LA VERSIÓN 2.0" después del cierre del epígrafe (línea 29-31), antes del Preámbulo:**

Usar el template de `PLANDIG_Argentina_ES.md:34-36` como modelo. La Nota v2.0 debe explicar:
- Qué absorbió la v2.0 desde la v1.0 (todo el contenido narrativo).
- Qué agregó (Capa III completa con BAMD, LNMA, FRM+Canon, Doctrina del Doble Desplazamiento).
- Qué reorganizó (de 7 dispositivos a 3 capas con 11 dispositivos + doctrina).
- Qué secciones completamente nuevas incorpora (Marco Legal, Stakeholders, Reconversión del Transportista, Comunicación, Migración de Datos, Financiera, Ciberseguridad AV, Diplomacia, Nexos Multi-Recurso, Métricas Humanas, Visión 2046, Anexos A-G).
- Longitud: un párrafo denso de 200-300 palabras.

- [ ] **Step 6: Verificar estructura**

```bash
grep -n "NOTA DE LA VERSIÓN 2.0\|PREÁMBULO" "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md" | head -5
```
Expected: línea con "NOTA DE LA VERSIÓN 2.0" antes de línea con "PREÁMBULO".

### Task 1.2 — Reescribir Preámbulo como "Cuatro Voces, Una Misma Doctrina"

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` sección PREÁMBULO (líneas ~33-59 actuales)

- [ ] **Step 1: Cambiar título de la sección**

De: `## PREÁMBULO — EL FLETE QUE SE COME EL PAÍS`
A: `## PREÁMBULO — CUATRO VOCES, UNA MISMA DOCTRINA`

- [ ] **Step 2: Estructurar en cuatro sub-secciones**

Agregar sub-headings con `### I. Héctor — el ferroviario con biblioteca técnica`, `### II. Florencia — la productora con flete asesino`, `### III. Diego — el camionero que ve venir la ola AV`, `### IV. Julia — la vecina con el auto parado 22 horas por día`.

- [ ] **Step 3: Preservar y enmarcar las voces de Héctor y Florencia (ya escritas)**

Las voces I y II se preservan textualmente del v1.0 (párrafos actuales líneas 35, 38-41). Solo se enmarcan bajo los sub-headings. Cada sub-sección termina con la "pregunta al plan" de ese personaje.

- [ ] **Step 4: Escribir voz III — Diego Maidana**

Párrafo denso de 400-500 palabras con estos anclajes narrativos obligatorios:
- Nombre: Diego Maidana, 47 años, Pergamino, Buenos Aires.
- Oficio: chofer de larga distancia, 25 años en la ruta, dueño de un Scania con 1,2 millones de km.
- Familia: mujer (Laura, enfermera en hospital municipal), dos hijos, uno en la UTN Pergamino estudiando ingeniería en sistemas.
- Contexto industrial: leyó en marzo 2026 que Daimler y Tesla Semi iniciaron la ruta Los Ángeles-Phoenix con camiones autónomos sin chofer, 120 unidades operando. Calculó: cuando llegue a Argentina con el atraso tecnológico estimado de 6-8 años, va a tener 54-56 años.
- Su "instante del Hombre Gris": sentado en la cocina el 15 de marzo de 2026, con el diario abierto, la frase *"El ferroviario del 94 fue mi viejo. El camionero del 32 voy a ser yo, si nadie arma algo."*
- Contrapunto histórico: su padre, Ramón Maidana, fue ferroviario del Mitre carga en los '80s y perdió el trabajo en el 94 a los 48 años; vio de primera mano qué le pasa a un oficio sin plan estatal.
- Pregunta al plan: *¿qué país me está preparando para esta transición, o me está dejando tirado como al ferroviario del 94? ¿Existe un plan donde mi oficio se reconvierte en vez de extinguirse?*

- [ ] **Step 5: Escribir voz IV — Julia Iannelli**

Párrafo denso de 400-500 palabras con estos anclajes narrativos obligatorios:
- Nombre: Julia Iannelli, 52 años, Villa Devoto, CABA.
- Oficio: bibliotecaria municipal en biblioteca barrial del barrio.
- Situación económica: sueldo bruto de bibliotecaria + incremento por antigüedad. Tiene un Ford Fiesta 2018 que heredó más o menos pagado de sus años como docente suplente.
- Patrón de uso del auto: lo usa lunes y viernes que falla el tren (2h cada día) + sábados al super (2h). Total 6 h/semana, 312 h/año.
- Costos fijos anuales: patente + seguro + cochera + amortización + service = $4.300.000/año (en 2026 pesos). Excluye nafta.
- Cálculo de "costo por hora de uso real": $4.300.000 / 312 = **$13.782/h**.
- Comparación dolorosa: más caro que un taxi profesional promedio que cobra $9.500/h efectiva.
- Su "instante del Hombre Gris": el domingo 8 de marzo de 2026, con lápiz y hoja en la mesa, calcula el número y se queda mirando el auto por la ventana 20 minutos. *"Está comiendo patente y no se mueve"*.
- Pregunta al plan: *¿por qué este auto no puede trabajar para la malla pública cuando yo no lo uso, con seguro, con protocolo, con créditos de kilómetros, en vez de quedarse parado comiendo patente? ¿Existe un lugar donde mis kilómetros disponibles valgan algo?*

- [ ] **Step 6: Reescribir párrafo de cierre del Preámbulo**

Reemplazar el párrafo actual ("Hoy no hay esa Argentina...") por un párrafo nuevo de ~300 palabras que:
- Une las cuatro voces en una pregunta compuesta (ver Sección 2.2 del spec).
- Enuncia la tesis de tres capas (Derecho / Infraestructura / Soberanía Cognitiva y Activos).
- Cierra con la cita preservada de v1.0 ("Un país no está conectado...") pero ampliada: *"Un país no está conectado cuando tiene rutas entre sus ciudades. Está conectado cuando un producto del norte puede llegar al sur sin perder en flete la mitad de su valor; cuando un ciudadano de Patagonia puede viajar a Buenos Aires sin cargar una hipoteca; cuando un chofer de Pergamino puede ver venir la ola AV sin aterrorizarse porque su país armó un plan para él; cuando el auto de una bibliotecaria de Villa Devoto trabaja para la malla pública los días que su dueña no lo necesita. Todo lo demás es literatura de camino."*

- [ ] **Step 7: Verificar estructura del Preámbulo**

```bash
grep -n "^### I\.\|^### II\.\|^### III\.\|^### IV\." "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
```
Expected: cuatro líneas, una por voz, en el rango de líneas del Preámbulo.

- [ ] **Step 8: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Nota, epígrafe ampliado y Preámbulo cuatrivocal

Agrega voces de Diego Maidana (camionero frente a la ola AV) y Julia Iannelli (vecina con auto ocioso). Preserva voces de Héctor y Florencia del v1.0."
```

### Task 1.3 — Reescribir Tesis Central en 9 movimientos

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` sección "## TESIS CENTRAL" (línea ~63 actual, párrafo línea 65)

- [ ] **Step 1: Leer Tesis Central actual (línea 65)**

Preservar los contenidos fácticos: 77% camión, 15% ferroviario, 30% flete, 60.000 km históricos → <20% operativo, concesión Hidrovía 25 años, AMBA 8M personas/día, los ahorros USD 12.000-22.000M si se reequilibra la matriz, USD 99.500M inversión a 20 años en v1.0.

- [ ] **Step 2: Reescribir Tesis Central como un único párrafo denso de 1.200-1.500 palabras organizado en 9 movimientos identificables**

Los 9 movimientos (no separar con sub-headings; son articulaciones internas del mismo párrafo):

1. **El país estructuralmente más chico** (preservado): 77% camión, matriz desbalanceada, costos comparados con Canadá/Australia/Brasil/Rusia, 60.000 km históricos reducidos a <20% operativo, AMBA saturado, puertos concentrados, Hidrovía concesionada.

2. **La liquidación 1990-1995** (preservado): privatización ferroviaria, consolidación del oligopolio del camión, desfinanciamiento del Estado técnico ferroviario.

3. **El problema que se viene** (NUEVO): en menos de una década, AV Nivel 4 en rutas principales (~2032 en escenario moderado argentino), AV Nivel 5 comercial (~2040), trenes autónomos en corredores dedicados (~2029), automatización portuaria parcial (~2030). La ola llega con atraso 5-8 años respecto a EE.UU./China. O Argentina la captura con soberanía pública, o la padece como segundo desguace.

4. **El activo ocioso como categoría económica** (NUEVO): 13 millones de autos particulares argentinos parados 22 horas por día. Galpones ferroviarios cerrados. Estaciones clausuradas. Flotas estatales subutilizadas (Correo Argentino, YPF, ENARSA, Ejército, municipales). Capacidad computacional dispersa sin agregación. Trabajo humano que la automatización desplazará (500.000+ choferes, taxistas, colectiveros, portuarios). Todo eso es valor económico que se evapora, y que una malla pública bien diseñada puede convertir en columna de movilidad ciudadana.

5. **La respuesta ¡BASTA! en tres capas, once dispositivos + una doctrina transversal** (NUEVO): Capa I Derecho a Moverse (MKC + MRM + Red Metropolitana Federal + Accesibilidad Universal); Capa II Infraestructura Común (BLF + Reactivación Ferroviaria con Rieles Columna Múltiple + Red Federal de Puertos + Hidrovía Soberana); Capa III Soberanía Cognitiva y Activos Disponibles (BAMD + LNMA + FRM con Canon + Doctrina del Doble Desplazamiento).

6. **Doctrina del Doble Desplazamiento** (NUEVO): toda automatización desplaza *renta capturada* antes que *trabajo humano*. Si una flota AV se despliega sin plan de reconversión demostrable del trabajo que desplaza, no se autoriza. El ahorro por automatización se reparte entre usuarios (tarifas bajas) y reconvertidos (FRM), no entre accionistas. Los datos generados por algoritmos en rutas argentinas son commons argentino.

7. **Activos disponibles al servicio** (NUEVO): cuatro tipologías (flotas privadas ociosas, cómputo, infraestructura subutilizada, trabajo desplazado) convergen en la Bastarda de Activos Móviles Disponibles — empresa bastarda PLANEB que opera a-costo, remunera aportantes en Créditos de Kilómetros intercambiables, cubre seguro colectivo bastardo y certificación técnica.

8. **Síntesis filosófica** (NUEVO): la postura ¡BASTA! frente a IA/AV tiene cuatro capas ordenadas: aceleracionismo soberano en la malla pública (Bastardas y Laboratorio Nacional); moratoria para operadores privados sin plan de reconversión demostrable (o pagan Canon o no operan); corredores duales como dispositivo de piloto y escalamiento (AV en infraestructura dedicada antes que en uso mixto); doble desplazamiento como principio económico transversal.

9. **Inversión y retorno** (AMPLIADO): USD 104.000M en 20 años, retorno bruto anual USD 23.400-32.000M en régimen pleno (Fase 4, 2041-2046), ROI break-even año 10-12, 415.000 trabajadores formales (60K ferroviarios + 30K portuarios + 45K en LNMA + 80K en BAMD + 200K reconvertidos vía FRM), MKC para 45M argentinos, flete bajando de 30% a 10-11%.

Cerrar el párrafo con la cita preservada/adaptada: *"La distancia no es destino. Es infraestructura. Y la infraestructura se elige — se construye o se entrega. La automatización tampoco es destino. Es decisión política sobre quién gana y quién pierde cuando la ola llega. Argentina llevaba cincuenta años entregando la infraestructura logística. Es hora de construirla — esta vez con volante, y con el dueño del volante decidido."*

- [ ] **Step 3: Verificar longitud y estructura**

```bash
sed -n '/^## TESIS CENTRAL/,/^---/p' "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md" | wc -w
```
Expected: 1.200-1.500 palabras.

- [ ] **Step 4: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Tesis Central reescrita en 9 movimientos

Preserva argumentación de v1.0 y agrega disrupción IA/AV, activo ocioso como categoría económica, doctrina del doble desplazamiento, tres capas, once dispositivos, inversión USD 104.000M."
```

---

# FASE 2 — Sección 0 ampliada con dos fallas nuevas

### Task 2.1 — Agregar Falla 0.8 (Captura Algorítmica) y 0.9 (Activo Ocioso)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIÓN 0

- [ ] **Step 1: Preservar fallas 0.1-0.7 actuales sin cambios**

- [ ] **Step 2: Cambiar título de sección**

De: `## SECCIÓN 0: LAS SIETE FALLAS ESTRUCTURALES DEL RÉGIMEN DE MOVILIDAD ARGENTINO`
A: `## SECCIÓN 0: LAS NUEVE FALLAS ESTRUCTURALES DEL RÉGIMEN DE MOVILIDAD ARGENTINO`

- [ ] **Step 3: Agregar sub-sección 0.8 — La Falla de la Captura Algorítmica**

Estructura obligatoria (siguiendo el patrón de 0.1-0.7):
- **La falla:** 2-3 párrafos. Los algoritmos de ruteo, matching y dispatching que hoy usan operadores logísticos en Argentina (Google Maps, Uber, Cabify, Rappi, PedidosYa, Samsara, Fleet Complete) son propiedad de corporaciones extranjeras. Cada trayecto genera datos que se guardan en servidores en EE.UU., Irlanda, Alemania. Argentina no tiene un solo algoritmo de ruteo propio operando a escala en infraestructura argentina. Cada mensajería, cada camión, cada taxi, cada colectivo es entrenamiento gratuito para inteligencias artificiales que después nos cobran suscripción. El valor extraído se estima en USD 600-1.400M/año solo en movilidad urbana (componente software).
- **Por qué persiste:** ningún actor argentino tiene incentivo ni escala para entrenar un algoritmo de ruteo propio; el costo marginal de usar Google Maps es cero para el operador. El Estado no ha encargado ni financiado el stack soberano.
- **Cómo PLANMOV lo resuelve:** Laboratorio Nacional de Movilidad Autónoma (LNMA) sobre LANIA; Protocolo PCAV obliga data-logging en ArgenCloud; Doctrina del Doble Desplazamiento mandamiento tercero.
- **Riesgo residual:** resistencia de operadores extranjeros a migrar. Mitigación: plazo de transición 2028-2035 con penalidad progresiva.

- [ ] **Step 4: Agregar sub-sección 0.9 — La Falla del Activo Ocioso y la Infraestructura Desaprovechada**

Estructura obligatoria:
- **La falla:** 2-3 párrafos. Argentina tiene 13M de autos particulares parados 22 horas por día (≈USD 30.000M en valor de activos en stock ocioso). Tiene galpones ferroviarios cerrados con 9.000 m² de superficie cubierta inutilizada en las estaciones del interior. Tiene 2.800 km de ramales levantados con durmientes de quebracho todavía sólidos. Tiene flotas estatales (Correo, YPF, ENARSA, Ejército) subutilizadas. Tiene capacidad computacional doméstica sin agregar. El patrimonio ocioso nacional en movilidad supera los USD 50.000M cuyo valor hoy se evapora por ausencia de plataforma agregadora.
- **Por qué persiste:** no hay mecanismo institucional ni empresa bastarda capaz de agregar micro-activos dispersos con seguro, protocolo técnico, y modelo económico justo para el aportante.
- **Cómo PLANMOV lo resuelve:** Bastarda de Activos Móviles Disponibles (BAMD) con arquitectura PLANEB, Créditos de Kilómetros como remuneración, pilotos por región.
- **Riesgo residual:** adopción lenta por desconfianza inicial del aportante. Mitigación: seguro bastardo integral + transparencia radical + panel ciudadano rotativo en gobernanza.

- [ ] **Step 5: Verificar**

```bash
grep -n "### 0\." "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
```
Expected: 9 sub-secciones (0.1 a 0.9).

- [ ] **Step 6: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 0 — fallas 0.8 Captura Algorítmica y 0.9 Activo Ocioso"
```

---

# FASE 3 — Secciones 1 y 2 ampliadas

### Task 3.1 — Sección 1 con subsecciones 1.2 (ola AV/IA) y 1.4 (activo ocioso) nuevas

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIÓN 1

- [ ] **Step 1: Cambiar título de sección**

De: `## SECCIÓN 1: LA CRISIS — EL PAÍS QUE NO PUEDE MOVERSE`
A: `## SECCIÓN 1: LA CRISIS — EL PAÍS QUE NO PUEDE MOVERSE Y ESTÁ POR PERDER EL VOLANTE`

- [ ] **Step 2: Preservar 1.1 actual (Dimensión del Problema Logístico) y renumerar el "Lo Que Sí Funcionó" a 1.5**

- [ ] **Step 3: Insertar subsección 1.2 nueva — La ola AV/IA que se viene**

Contenido obligatorio (400-600 palabras, 2 tablas):
- Párrafo introductorio: el régimen logístico argentino entra en la década 2030 sin plan para la mayor disrupción técnica desde la contenedorización marítima de los '60s.
- **TABLA 1.2-A: Escenarios de despliegue AV en Argentina** (Conservador / Moderado baseline / Acelerado) con hitos: AV Nivel 4 en rutas principales, AV Nivel 5 comercial, trenes autónomos en corredores dedicados, automatización portuaria parcial, penetración AV (año 10), penetración AV (año 15).
- Párrafo sobre atraso argentino 5-8 años respecto a EE.UU./China y por qué el atraso es ventana de soberanía.
- **TABLA 1.2-B: Efectos esperados por dispositivo del régimen actual** con columnas: Dispositivo afectado / Efecto si Argentina no planifica / Efecto si Argentina captura la disrupción / Ventana temporal.
- Párrafo cierre sobre urgencia del plan contra ventana de 6-8 años.

- [ ] **Step 4: Renumerar 1.2 actual (Costo Social del Desbalance) a 1.3 y ampliar con el costo de la captura algorítmica**

Agregar una fila a la TABLA 1.2 actual (Costos Estimados Anuales):
`| Renta extractiva de plataformas logísticas extranjeras | 600-1.400 |`
Y actualizar total estimado a 18.600-29.500.

- [ ] **Step 5: Insertar subsección 1.4 nueva — El valor del activo ocioso**

Contenido obligatorio (400-500 palabras, 1 tabla):
- Párrafo introductorio sobre el concepto: activo ocioso no es falla individual, es falla sistémica.
- **TABLA 1.4: Inventario aproximado de activos ociosos movilizables**

```
| Tipología | Volumen nacional | Valor estimado USD M | Utilización actual |
|---|---|---|---|
| Autos particulares | 13,2M unidades | 28.000-32.000 | ~3% del tiempo |
| Utilitarios PyMEs | 1,8M unidades | 7.500 | ~15% del tiempo |
| Galpones ferroviarios cerrados | ~450 inmuebles, 380.000 m² | 1.200 | 0% |
| Estaciones clausuradas | ~280 inmuebles | 600 | 0% |
| Ramales levantados recuperables | ~2.800 km | 2.100 | 0% |
| Flotas estatales subutilizadas (Correo, YPF, ENARSA, Ejército, municipales) | ~85.000 unidades | 4.300 | ~20% del tiempo |
| Capacidad computacional doméstica agregable | ~2,4M GPUs viables | 5.800 | <1% para cómputo útil |
| **Total stock ocioso movilizable** | | **~49.500-52.500** | |
```
- Párrafo sobre cómo la BAMD convierte este stock en flujo de malla pública, con referencia a Julia del Preámbulo.

- [ ] **Step 6: Preservar 1.3 actual (Lo Que Sí Funcionó) renumerada a 1.5**

- [ ] **Step 7: Verificar**

```bash
grep -n "^### 1\." "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
```
Expected: 5 sub-secciones (1.1 a 1.5).

- [ ] **Step 8: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 1 — subsecciones 1.2 (ola AV/IA) y 1.4 (activo ocioso) nuevas"
```

### Task 3.2 — Sección 2 con subsecciones 2.5 (AV en movilidad pública) y 2.6 (commons vehiculares)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIÓN 2

- [ ] **Step 1: Preservar 2.1-2.4 actuales**

- [ ] **Step 2: Insertar subsección 2.5 — AV e IA en movilidad pública (precedentes)**

Casos obligatorios (1 párrafo por caso):
- **Helsinki — MaaS (Mobility as a Service) desde 2016.** Modelo de suscripción multimodal pública con integración tarifaria, dispatching centralizado, app Whim. Lección: la plataforma tiene que ser pública o reguladamente pública, no propiedad privada.
- **Shenzhen — corredor AV AutoX desde 2020.** Piloto de robotaxis Nivel 4 en área delimitada con autorización gradual. Lección: certificación por corredor, no general; datos al regulador.
- **Oslo — zero-emissions metropolitano.** Electrificación de flotas municipales y peaje por CO2. Lección: palanca fiscal para reorientar comportamiento sin prohibir.
- **Singapur — LTA (Land Transport Authority).** Autoridad unificada con control técnico+regulación+operación parcial; modelo de gobernanza.
- **China — trenes autónomos Guangzhou-Zhuhai (Guangdong).** Nivel 4 en operación comercial desde 2023. Lección: viabilidad técnica probada en corredores dedicados.
- **EE.UU. — Waymo en Phoenix y SF.** Robotaxis Nivel 4 comerciales. Lección: modelo de despliegue urbano con supervisión.
- **Alemania — Deutschlandticket.** Pase federal de transporte público unificado a €49/mes. Lección: el MKC es política pública estándar internacional.

- [ ] **Step 3: Insertar subsección 2.6 — Commons vehiculares y asset-sharing cooperativo**

Casos obligatorios:
- **BlaBlaCar (Francia/Europa).** Plataforma de carpooling de larga distancia; cooperativa-frustrada porque ganó la lógica privada, pero demuestra viabilidad del matching.
- **Modo Berlín / CarUnity (Alemania).** Modelo cooperativo de auto-compartido entre vecinos con seguro mutualista. Caso de estudio obligatorio para BAMD.
- **Shinkansen Commuter Pass (Japón).** Derecho kilométrico mensual para trabajadores; precedente del MKC.
- **Zaragoza Bike Sharing y Bicing Barcelona.** Public bike como infraestructura municipal.
- **BlaBlaCar Daily (commuting corto).** Carpooling diario intraurbano.
- **Avancar Barcelona.** Carsharing cooperativo barcelonés.

- [ ] **Step 4: Actualizar 2.7 (Combinación argentina)**

La lista ya tiene 7 ítems. Agregar dos ítems:
```
8. Laboratorio Nacional de Movilidad Autónoma sobre LANIA (PLANDIG).
9. Doctrina del Doble Desplazamiento operativizada por Canon de Automatización.
```

- [ ] **Step 5: Verificar**

```bash
grep -n "^### 2\." "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
```
Expected: 7 sub-secciones (2.1 a 2.7).

- [ ] **Step 6: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 2 — precedentes AV (Helsinki/Shenzhen/Oslo/Singapur) y commons vehiculares"
```

---

# FASE 4 — Sección 3 refundada en Tres Capas

### Task 4.1 — Capa I (Derecho a Moverse)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIÓN 3 — reorganizar completamente

- [ ] **Step 1: Cambiar título de Sección 3**

De: `## SECCIÓN 3: LA SOLUCIÓN — ARQUITECTURA DE LOS SIETE DISPOSITIVOS`
A: `## SECCIÓN 3: LA SOLUCIÓN — TRES CAPAS, ONCE DISPOSITIVOS + UNA DOCTRINA TRANSVERSAL`

- [ ] **Step 2: Agregar párrafo introductorio (200-300 palabras) explicando las tres capas y por qué se reorganizaron los siete dispositivos de v1.0**

Tres capas, fundamento ontológico:
- Capa I Derecho a Moverse — lo que se le garantiza a cada ciudadano.
- Capa II Infraestructura Común — lo que se construye y opera para que el derecho sea real.
- Capa III Soberanía Cognitiva y Activos Disponibles — lo que se pone al servicio del derecho cuando la ola AV/IA y los activos ociosos entran en juego.

- [ ] **Step 3: Agregar encabezado `### 3.A CAPA I — DERECHO A MOVERSE` con párrafo de 100 palabras introduciéndola**

- [ ] **Step 4: Preservar 3.1 MKC de v1.0, agregar subsección "Integración con BAMD" al final de 3.1**

Texto nuevo ~80 palabras: el MKC se puede consumir en vehículos BAMD al mismo tarifario que en transporte público formal; aportante a BAMD recibe CK convertibles con MKC+.

- [ ] **Step 5: Promover "Movilidad Rural Mínima" a dispositivo 3.2 propio**

Contenido (400-500 palabras):
- Concepto: garantía de conexión mínima semanal (tres frecuencias/semana) entre todo núcleo rural >80 habitantes y su cabecera departamental.
- Modalidades: colectivo rural operado por Bastarda Logística + Ambulancia Territorial articulada con PLANSAL + Tren Rural si hay vía disponible + Bote fluvial en litoral/Patagonia-Andes.
- Financiamiento: cupo dentro del MKC de USD 4,20/habitante rural/mes en régimen pleno.
- Métricas: cobertura, frecuencia, costo por viaje, satisfacción usuaria.
- Articulación con Mesa Civil de Corredor (PLANMESA) para definir prioridades.

- [ ] **Step 6: Ampliar AMBA Estructural a "3.3 Red Metropolitana Federal"**

Agregar contenido (350 palabras):
- Extensión más allá del AMBA: Gran Córdoba (1,6M hab.), Gran Rosario (1,4M), Gran Mendoza (1,1M), Gran Tucumán (870K), Gran La Plata (870K).
- Cada metrópoli tiene su Autoridad Metropolitana de Transporte bajo protocolo AMBA-T.
- Integración tarifaria nacional con MKC.
- Inversión específica por metrópoli en rango USD 600M-2.800M.

- [ ] **Step 7: Agregar 3.4 Protocolo de Accesibilidad Universal**

Contenido (300-400 palabras):
- Principio: la movilidad como derecho incluye discapacidad, edad avanzada, movilidad reducida temporal (embarazo, postoperatorios), cuidadores.
- Requisitos técnicos: todo vehículo nuevo de flota pública o de Bastarda debe ser accesible; 40% mínimo de vehículos BAMD certificados accesibles; toda estación nueva con rampa y ascensor.
- Articulación con PLANCUIDADO (Pacto de Cuidado con prioridad de movilidad).
- Presupuesto específico USD 1.400M en 15 años.

- [ ] **Step 8: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 3 Capa I — MKC + MRM (promovida) + Red Metropolitana Federal + Accesibilidad"
```

### Task 4.2 — Capa II (Infraestructura Común) reorganizada

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIÓN 3

- [ ] **Step 1: Agregar encabezado `### 3.B CAPA II — INFRAESTRUCTURA COMÚN` con párrafo introductorio de 100 palabras**

- [ ] **Step 2: Mover BLF a 3.5 (preservar contenido v1.0)**

- [ ] **Step 3: Fusionar Reactivación Ferroviaria + Rieles Columna Múltiple en 3.6**

Contenido combinado (preservar todo el material v1.0 de ambos dispositivos originales), con nuevo párrafo de apertura que justifica la fusión: *"Separar reactivación ferroviaria y rieles como columna múltiple en dispositivos distintos fue un error arquitectónico de v1.0: ningún km de riel se reactiva sin decidir al mismo tiempo si es multicapa. Los dos son una sola decisión técnica y presupuestaria."*

Agregar al final de 3.6 una subsección nueva "3.6.4 Capa Autónoma del Ferrocarril" con contenido (200 palabras): trenes autónomos en corredores dedicados Fase 2 (2031-2034) con tren autónomo Retiro-Tigre como piloto; integración con LNMA; certificación PCAV ferroviaria; operador humano en cabina durante transición.

- [ ] **Step 4: Mover Red Federal de Puertos a 3.7 (preservar contenido v1.0)**

Agregar subsección "3.7.3 Automatización Portuaria Gradual" con contenido (200 palabras): piloto Dock Sud en Fase 2 con sistemas automatizados de grúa y transporte intraportuario; Operador Portuario AV con credencial PLANREP; cero despidos, reconversión directa con FRM.

- [ ] **Step 5: Mover Hidrovía Soberana a 3.8 (preservar contenido v1.0)**

Agregar subsección "3.8.6 Capa Cognitiva Fluvial" con contenido (150 palabras): sistema de monitoreo de calado y navegación soberano; data-logging obligatorio; dragado asistido por IA en articulación con Astilleros Argentinos.

- [ ] **Step 6: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 3 Capa II — BLF, Reactivación+Columna Múltiple fusionadas, Puertos, Hidrovía con capas AV"
```

### Task 4.3 — Capa III completa (BAMD, LNMA, FRM+Canon, Doctrina)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIÓN 3

- [ ] **Step 1: Agregar encabezado `### 3.C CAPA III — SOBERANÍA COGNITIVA Y ACTIVOS DISPONIBLES` con párrafo introductorio (200 palabras)**

Explicar: esta es la capa enteramente nueva de v2.0. Responde a la disrupción IA/AV (mandamientos de soberanía cognitiva) y a la existencia de activos ociosos (Doctrina de Activos Disponibles). Cuatro elementos: tres dispositivos técnicos + una doctrina constitucional transversal.

- [ ] **Step 2: Escribir 3.9 Bastarda de Activos Móviles Disponibles (BAMD)**

Contenido (500-600 palabras). Estructura:
- **Concepto**
- **Cuatro tipologías de activo** (tabla)
- **Modelo económico del aportante** (Contratos Bastardos 12 meses, Créditos de Kilómetros, seguro colectivo, mantenimiento, certificación)
- **Garantías al usuario BAMD** (tarifa ≤ 60% taxi/Uber, seguro, rastreo, certificación trimestral)
- **Escala proyectada** (Año 2: 8K; Año 5: 180K; Año 10: 900K activos)
- **Pilotos regionales** (AMBA → Córdoba/Rosario/Mendoza → interior productivo → rural)
- **Gobernanza** (Fideicomiso PLANEB + DAO + panel ciudadano rotativo)
- **Inversión estimada:** USD 450M en 10 años.

- [ ] **Step 3: Escribir 3.10 Laboratorio Nacional de Movilidad Autónoma (LNMA)**

Contenido (500-600 palabras). Estructura:
- **Concepto** (capa vertical sobre LANIA, no duplicación)
- **Stack soberano** (tabla 6 capas: Percepción / Planificación / Control / Simulación / V2X / Certificación)
- **Principios no-negociables** (código abierto default, datos argentinos en Argentina, commons público, human-in-the-loop)
- **Corredores piloto AV** (Fase 1/2/3 con detalles)
- **Protocolo PCAV** (5 niveles × por corredor, auditoría semestral, revocable)
- **Presupuesto:** USD 1.200M en 10 años (compute compartido con LANIA reduce costo 60%)

- [ ] **Step 4: Escribir 3.11 Fondo de Reconversión Móvil + Canon de Automatización Logística**

Contenido (500-600 palabras). Estructura:
- **Concepto**
- **Fórmula del Canon:** `Canon_Anual(AV_k) = HEDA(AV_k) × CAR` con definiciones
- **Factor HEDA por nivel SAE** (Nivel 2: 0,10; Nivel 3: 0,35; Nivel 4: 0,75; Nivel 5: 1,00)
- **Ejemplo operativo:** camión AV Nivel 4 → USD 22.800/año/vehículo
- **Destino del Fondo** (tabla: PPM 45%, formación 20%, salud/aportes 15%, subsidio reconversión 12%, kit emprendedor 5%, admin 3%)
- **Otras fuentes** (20% excedente BAMD, 10% CK no cobrados, 0,08% PBI, contribuciones cruzadas)
- **Articulación con PLANREP** (ruta "Reconversión Móvil")

- [ ] **Step 5: Escribir 3.12 Doctrina del Doble Desplazamiento**

Contenido (400-500 palabras). Estructura:
- **Marco transversal** (no dispositivo técnico, principio constitucional)
- **Los Tres Mandamientos** (expandido cada uno en 3-4 oraciones)
  1. La automatización desplaza renta capturada, no trabajo humano.
  2. El ahorro por automatización se reparte entre usuarios y reconvertidos, no accionistas.
  3. Los datos en rutas argentinas son commons argentino.
- **Implementación operativa:** ANMov ejecuta, Síndicos + Coordinadores auditan, excepcionable solo por ley con mayoría de dos tercios.

- [ ] **Step 6: Verificar**

```bash
grep -n "^### 3\." "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
```
Expected: 3.A, 3.1-3.4 (Capa I); 3.B, 3.5-3.8 (Capa II); 3.C, 3.9-3.12 (Capa III). 12 sub-secciones + 3 headers de capa.

- [ ] **Step 7: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 3 Capa III completa — BAMD, LNMA, FRM+Canon, Doctrina del Doble Desplazamiento"
```

---

# FASE 5 — Secciones 4-6 ampliadas

### Task 5.1 — Sección 4 ANMov (gobernanza 3 capas) y Sección 5 BLF (con capa AV)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIONES 4 y 5

- [ ] **Step 1: Ampliar Sección 4 — ANMov Gobernanza de Tres Capas**

Preservar todo contenido v1.0. Ampliar:
- 4.1.1 nueva: Presupuesto dividido por capa (0,20% PBI Capa I, 0,20% Capa II, 0,10% Capa III).
- 4.2.1 nueva: agregar 2 miembros al Directorio: 1 Coordinador LNMA + 1 representante del FRM (desplazados reconvertidos). Directorio ahora 13 miembros.
- 4.3.1 nueva: funciones adicionales (administración BAMD, supervisión LNMA, gestión FRM y Canon, auditoría Doctrina del Doble Desplazamiento).
- 4.5 nueva: Relación ANMov ↔ ANDIG (PLANDIG): protocolo de co-gobernanza de datos de movilidad.

- [ ] **Step 2: Ampliar Sección 5 — BLF con Capa AV**

Preservar 5.1-5.3. Agregar:
- 5.4 nueva: Integración de AV supervisado en flota BLF (fases y porcentajes por año).
- 5.5 nueva: Data-logging BLF al LNMA.
- 5.6 nueva: Operadores AV certificados de BLF con credencial PLANREP.
- 5.7 nueva: Ejemplo operativo — corredor Humahuaca-Buenos Aires con flota mixta 2030 (70% humano + 30% AV supervisado).

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Secciones 4-5 — ANMov 3 capas + BLF con capa AV"
```

### Task 5.2 — Sección 6 Reactivación Ferroviaria ampliada

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIÓN 6

- [ ] **Step 1: Preservar 6.1-6.3**

- [ ] **Step 2: Agregar 6.4 Trenes autónomos en corredores dedicados**

Contenido (400 palabras):
- Corredor piloto 1: Retiro-Tigre (Mitre eléctrico existente, 30 km, Fase 2 2031-2034).
- Corredor piloto 2: Rosario-San Lorenzo cargas (Fase 3 2035-2040).
- Integración con LNMA (percepción ferroviaria específica).
- Operador humano obligatorio en cabina hasta 2040 bajo PCAV.

- [ ] **Step 3: Agregar 6.5 Mantenimiento predictivo con IA**

Contenido (300 palabras):
- Sensores en material rodante reportando al LNMA.
- Detección de fallos 60-90 días antes de falla crítica.
- Articulación con saber de Héctor (Archivo Ferroviario + datos IA) — ejemplo concreto: modelos LNMA entrenados sobre la biblioteca técnica de Héctor (Sección 7.5 del PLANMEMORIA).
- Reducción estimada 30% costo mantenimiento en régimen pleno.

- [ ] **Step 4: Agregar 6.6 Columna Múltiple — Especificación Técnica por Km**

Contenido (400 palabras):
- Tabla de costos por km: riel solo / riel+electricidad / riel+fibra / riel+ducto gas/agua / multicapa completa.
- Márgenes de amortización por utilidad.
- Convenios institucionales ANMov-ANEN-ANDIG-ARSAT.
- Ejemplo corredor Belgrano Cargas multicapa: USD 2.800M riel solo vs. USD 3.780M riel multicapa que vale por 4 infraestructuras.

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 6 — trenes autónomos, mantenimiento predictivo, columna múltiple técnica"
```

---

# FASE 6 — Secciones 7, 8, 9 nuevas en profundidad

### Task 6.1 — Sección 7: BAMD en profundidad

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` — insertar SECCIÓN 7 nueva completa

- [ ] **Step 1: Escribir sección completa (800-1.000 palabras)**

Estructura:
- Título: `## SECCIÓN 7: BASTARDA DE ACTIVOS MÓVILES DISPONIBLES EN PROFUNDIDAD`
- Epígrafe-cita similar a patrón PLANEN.
- 7.1 Tipología de Activos (expansión detallada de las cuatro tipologías, con ejemplos concretos, tasas de onboarding por región).
- 7.2 Arquitectura Técnica de la Plataforma (dispatching, matching, seguridad, seguro, interface móvil ciudadano aportante y ciudadano usuario).
- 7.3 Modelo Económico del Aportante (fórmula de Créditos de Kilómetros, escala, ejemplo de Julia con $4,3M costo anual actual vs. $1,9M neto con BAMD + USD 380 en CK anuales).
- 7.4 Protocolo de Seguridad, Privacidad y Seguro Colectivo Bastardo (bastardeo de seguro; pool mutualista; precios al costo).
- 7.5 Pilotos por Región (roadmap detallado fase por fase).
- 7.6 Interoperabilidad con BLF, LNMA, MKC.
- 7.7 Gobernanza (Fideicomiso, DAO, panel ciudadano).

- [ ] **Step 2: Verificar**

```bash
sed -n '/^## SECCIÓN 7:/,/^## SECCIÓN 8:/p' "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md" | wc -l
```
Expected: 80-150 líneas.

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 7 — BAMD en profundidad (800-1000 palabras, 7 subsecciones)"
```

### Task 6.2 — Sección 8: LNMA en profundidad

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` — insertar SECCIÓN 8 nueva

- [ ] **Step 1: Escribir sección completa (800-1.000 palabras)**

Estructura:
- Título: `## SECCIÓN 8: LABORATORIO NACIONAL DE MOVILIDAD AUTÓNOMA EN PROFUNDIDAD`
- Epígrafe-cita.
- 8.1 Misión y Relación con LANIA (PLANDIG) — diagrama conceptual en texto, división de responsabilidades.
- 8.2 Stack Técnico Soberano — 6 capas expandidas con ejemplos concretos de condiciones argentinas (ripio, animales en ruta, viento patagónico, neblina litoral).
- 8.3 Corredores Piloto AV — detalle fase por fase con km, tipo de vehículo, nivel SAE, fecha de apertura.
- 8.4 Código Abierto como Default — política de licencias, contribución, excepciones.
- 8.5 Datos de Movilidad como Commons — arquitectura del repositorio LNMA, acceso diferenciado.
- 8.6 Certificación PCAV — Protocolo de Certificación de Autonomía Vehicular (proceso, plazos, revocación, 5 niveles × por corredor).
- 8.7 Formación y Talento — articulación con PLANEDU e institutos técnicos.
- 8.8 Gobernanza y Anti-Captura.

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 8 — LNMA en profundidad (stack, corredores piloto, PCAV)"
```

### Task 6.3 — Sección 9: FRM + Canon en detalle

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` — insertar SECCIÓN 9 nueva

- [ ] **Step 1: Escribir sección completa (700-900 palabras)**

Estructura:
- Título: `## SECCIÓN 9: FONDO DE RECONVERSIÓN MÓVIL + CANON DE AUTOMATIZACIÓN EN DETALLE`
- Epígrafe-cita.
- 9.1 La Doctrina del Doble Desplazamiento operativizada.
- 9.2 Fórmula del Canon (formal) con explicación de cada variable.
- 9.3 Casos de Cálculo del Canon (usar CAR = USD 9,50/h):
  - Camión Nivel 4, 3.200 h/año: HEDA 2.400 → **USD 22.800/año/vehículo**.
  - Taxi Nivel 5, 2.800 h/año: HEDA 2.800 → **USD 26.600/año/vehículo**.
  - Colectivo Nivel 3, 4.200 h/año: HEDA 1.470 → **USD 13.965/año/vehículo**.
  - Locomotora Nivel 4, 4.500 h/año: HEDA 3.375 → **USD 32.063/año/locomotora**.
  - Buque fluvial Nivel 3, 7.200 h/año: HEDA 2.520 → **USD 23.940/año/buque**.
- 9.4 Destino del Fondo (PPM 45%, formación 20%, salud 15%, subsidio reconversión 12%, kit emprendedor 5%, admin 3%).
- 9.5 Otras Fuentes del Fondo (20% excedente BAMD, 10% CK no cobrados, 0,08% PBI, contribuciones Protocolo Bastardo).
- 9.6 Articulación con PLANREP — Ruta "Reconversión Móvil".
- 9.7 Pensión Puente Móvil (PPM): monto, duración, cobertura, condiciones.
- 9.8 Caso concreto — Diego Maidana: proyección su trayectoria a 20 años desde 2026, con cálculo de PPM y reconversión como Coordinador de Corredor AV Supervisado.

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 9 — FRM + Canon en detalle con caso Diego Maidana"
```

---

# FASE 7 — Secciones 10-11 ampliadas

### Task 7.1 — Sección 10 integración ¡BASTA! ampliada y Sección 11 modelo económico actualizado

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIONES 10 y 11

- [ ] **Step 1: Reemplazar Sección 10 actual con versión ampliada**

Preservar todas las sub-secciones existentes (10.1-10.10). Agregar:
- 10.11 Con PLANDIG (ampliada): LNMA host, ArgenCloud data-logging, ecología de atención en apps de movilidad.
- 10.12 Con PLANREP (ampliada): ruta Reconversión Móvil dedicada.
- 10.13 Con PLANEB: BAMD como caso piloto Bastarda de Activos, Canon replicable a otros sectores.
- 10.14 Con PLANEN: electrificación coordinada + cómputo LNMA abastecido.
- 10.15 Con PLANMON: Fondo Soberano de Contingencia AV + Bonos Soberanos Infraestructura 30-40 años.

- [ ] **Step 2: Reescribir Sección 11 Modelo Económico con tablas actualizadas**

Reemplazar 8.1 (Inversión 20 años) por tabla de tres capas:
```
| Concepto | F0-1 | F2 | F3 | F4 | Total |
|---|---|---|---|---|---|
| Capa I | 1.200 | 3.500 | 5.800 | 3.000 | 13.500 |
| Capa II | 7.000 | 19.000 | 37.000 | 17.500 | 80.500 |
| Capa III | 800 | 2.500 | 4.500 | 2.200 | 10.000 |
| Total | 9.000 | 25.000 | 47.300 | 22.700 | 104.000 |
```

Actualizar 8.2 Operación anual régimen pleno a USD 15.880M con línea para LNMA y FRM.
Actualizar 8.3 Retorno a USD 23.400-32.000M con línea para activos movilizados y Canon recaudado.
Agregar 8.5 Sensibilidad del Modelo con tres escenarios.

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Secciones 10-11 — integración ¡BASTA! ampliada + modelo económico en tres capas"
```

---

# FASE 8 — Secciones 12-20 completamente nuevas (tipo PLANEN/PLANDIG)

### Task 8.1 — Sección 12: Marco Legal

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` — insertar SECCIÓN 12

- [ ] **Step 1: Escribir sección (800-1.000 palabras) con nueve leyes detalladas**

Estructura:
- Título: `## SECCIÓN 12: MARCO LEGAL — QUÉ LEYES SE NECESITAN`
- Para cada ley, una sub-sección de 80-120 palabras con: objetivo, pilares articulados, articulación con otras leyes, cronograma de sanción.

Nueve leyes obligatorias:
12.1 Ley de Movilidad y Logística Federal (creación ANMov).
12.2 Ley BAMD.
12.3 Ley LNMA y PCAV.
12.4 Ley del Canon de Automatización Logística.
12.5 Ley de la Autoridad Metropolitana de Transporte (AMBA-T y homólogas).
12.6 Ley de Hidrovía Soberana.
12.7 Reformas al Código de Tránsito (niveles SAE, responsabilidad AV, seguro AV).
12.8 Régimen del Mandato Kilométrico Ciudadano.
12.9 Régimen Laboral de Transición del Transportista.

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 12 — Marco Legal con nueve leyes necesarias"
```

### Task 8.2 — Sección 13: Estrategia de Stakeholders

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` — insertar SECCIÓN 13

- [ ] **Step 1: Escribir sección (800-1.000 palabras)**

Estructura:
- Título: `## SECCIÓN 13: ESTRATEGIA DE STAKEHOLDERS — TEJER, NO DESTRUIR`
- Por grupo, sub-sección de 80-120 palabras con: identificación, intereses, puntos de dolor, propuesta de integración al plan.

Grupos obligatorios:
13.1 Sindicatos del camión (Camioneros, FeTCAP).
13.2 Sindicatos ferroviarios (La Fraternidad, Unión Ferroviaria).
13.3 Taxistas y remiseros.
13.4 Colectiveros (UTA).
13.5 Operadores privados del camión (Expreso Lo Bruno, Expreso Norte, TNT Argentina).
13.6 Concesionarios ferroviarios actuales.
13.7 Plataformas digitales extranjeras (Uber, Cabify, DiDi, Rappi, PedidosYa).
13.8 Operadores logísticos globales (Mercado Libre, Amazon, DHL, MSC).
13.9 Provincias (24).
13.10 Municipios del AMBA y grandes metropolitanos.
13.11 Usuarios y organizaciones barriales.
13.12 Comunidad tech/AV internacional (convenios de transferencia).

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 13 — Estrategia de Stakeholders (12 grupos)"
```

### Task 8.3 — Sección 14: Reconversión Laboral del Transportista

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` — insertar SECCIÓN 14

- [ ] **Step 1: Escribir sección (800-1.000 palabras) — análoga a PLANEN §14**

Estructura:
- Título: `## SECCIÓN 14: RECONVERSIÓN LABORAL DEL TRANSPORTISTA — NINGÚN CHOFER QUEDA ATRÁS`
- 14.1 Mapa de Puestos en Riesgo (con estimación: choferes larga distancia 120K, taxistas/remiseros 180K, colectiveros 80K, operarios portuarios 35K, dispatchers/logísticos 25K, mecánicos 60K).
- 14.2 Rutas de Reconversión (tabla):
  - Chofer larga distancia → Coordinador de Corredor AV Supervisado.
  - Taxista/remisero → Operador BAMD / Gestor de Flota Bastarda.
  - Colectivero → Operador de Red Metropolitana + Técnico de Mantenimiento.
  - Operario portuario → Técnico de Automatización Portuaria.
  - Dispatcher privado → Operador LNMA / Analista de Tablero.
  - Mecánico → Técnico de Mantenimiento AV certificado (Tallers).
- 14.3 Programa "Cinco Años Dignos" para mayores de 50 (pensión puente + media jornada + capacitación).
- 14.4 Articulación con Arquitecto de Fuerza Laboral IA (PLANDIG).
- 14.5 Formación en Tallers (PLANTALLER) y UTNs regionales.
- 14.6 Caso Diego (ampliación del caso presentado en §9.8) con su trayectoria año por año.
- 14.7 Métricas de reconversión (ingreso ≥ 80% previo a los 3 años, dignidad percibida, continuidad en sector movilidad).

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Sección 14 — Reconversión Laboral del Transportista con programa Cinco Años Dignos"
```

### Task 8.4 — Sección 15 Comunicación + Sección 16 Migración de Datos

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` — insertar SECCIONES 15 y 16

- [ ] **Step 1: Sección 15 Estrategia de Comunicación (500-700 palabras)**

Estructura:
- Mensaje central: *"La distancia no es destino. La automatización tampoco. Las dos se eligen."*
- 15.1 Narrativa por audiencia (trabajador del camión, usuario metropolitano, productor regional, propietario de auto ocioso, votante general).
- 15.2 Canales y fases (Fase 0: pre-ley con pedagogía; Fase 1: lanzamiento con pilotos; Fase 2: expansión con casos reales).
- 15.3 Respuesta a Críticas Anticipadas (10 críticas con respuesta de 30 palabras cada una).
- 15.4 Campaña "El Instante del Hombre Gris en Movimiento" — uso de las cuatro voces del Preámbulo.

- [ ] **Step 2: Sección 16 Migración de Datos y Soberanía Operativa (500-700 palabras)**

Estructura:
- 16.1 Sistemas a migrar (ruteo Google Maps/ORS → LNMA; matching Uber/Cabify → plataforma pública; dispatching Samsara/Fleet Complete → LNMA; payment rails → pagos soberanos PLANDIG).
- 16.2 Cronograma 2028-2035 en cuatro olas.
- 16.3 Penalidades por no migrar (progresivas: cuotas de tráfico → auditoría fiscal → revocación de licencia operativa).
- 16.4 Caso de estudio — migración de un operador logístico grande (proyección 18 meses).

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Secciones 15-16 — Comunicación + Migración de Datos"
```

### Task 8.5 — Sección 17 Financiera + Sección 18 Ciberseguridad AV

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` — insertar SECCIONES 17 y 18

- [ ] **Step 1: Sección 17 Infraestructura Financiera (500-700 palabras)**

Estructura:
- 17.1 Bonos Soberanos PLANMOV 30/40 años (estructuración, emisión, tramos).
- 17.2 Créditos de Kilómetros como cuasi-moneda regulada (convertibilidad, emisión controlada, curso legal acotado).
- 17.3 Flujos mensuales del Canon de Automatización Logística.
- 17.4 Fondo Fiduciario BAMD (operado con Banco Nación).
- 17.5 Integración con PLANMON (Fondo Soberano de Contingencia AV).
- 17.6 Instrumento de Bonos Bastardos del Protocolo Bastardo PLANEB.

- [ ] **Step 2: Sección 18 Seguridad Operativa y Ciberseguridad AV (500-700 palabras)**

Estructura:
- 18.1 Arquitectura de ciberseguridad de flota (articulada con Sistema Inmune PLANDIG §10).
- 18.2 Protocolo de incidente AV (cascada de respuesta, CAAAV, comunicación pública).
- 18.3 Protección física de infraestructura (rieles, puertos, centros LNMA).
- 18.4 Mitigación de interferencias GPS/GNSS.
- 18.5 Chain of custody de datos de movilidad.
- 18.6 Kill-switch soberano ante ciberataque masivo.
- 18.7 Auditoría anual del LNMA en ciberseguridad.

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Secciones 17-18 — Infraestructura Financiera + Ciberseguridad AV"
```

### Task 8.6 — Sección 19 Diplomacia + Sección 20 Nexos Multi-Recurso

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` — insertar SECCIONES 19 y 20

- [ ] **Step 1: Sección 19 Diplomacia Logística (500-700 palabras)**

Estructura:
- 19.1 Corredores binacionales (Chile trasandino; Bolivia; Paraguay; Uruguay; Brasil).
- 19.2 Coordinación Hidrovía con países ribereños.
- 19.3 Estándares AV regionales — propuesta argentina de Protocolo Mercosur AV basado en PCAV.
- 19.4 Convenios de transferencia tecnológica (España AVE, Francia SNCF, Alemania DB, Suecia VR, China trenes).
- 19.5 Posición argentina ante regulaciones AV internacionales (ONU, UNECE).
- 19.6 Articulación con PLANGEO (política exterior integrada).

- [ ] **Step 2: Sección 20 Nexos Multi-Recurso (600-800 palabras) — análoga a PLANEN §7**

Cinco nexos:
- 20.1 Movilidad-Energía (PLANEN).
- 20.2 Movilidad-Digital (PLANDIG).
- 20.3 Movilidad-Hábitat (PLANVIV).
- 20.4 Movilidad-Trabajo (PLANREP).
- 20.5 Movilidad-Territorio (PLANTER).

Cada nexo: 100-150 palabras con decisión integrada, trade-offs y mecanismo de gobernanza conjunta.

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Secciones 19-20 — Diplomacia Logística + Nexos Multi-Recurso"
```

---

# FASE 9 — Secciones 21-27 cierre del plan

### Task 9.1 — Sección 21 Tablero + Métricas Humanas + Sección 22 Riesgos ampliados

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIONES 21 y 22

- [ ] **Step 1: Sección 21 — renumerar v1.0 §11 a §21, preservar 21.1 y 21.3, agregar 21.2**

Nueva 21.2 Métricas Humanas y Civilizatorias (250-350 palabras):
- Dignidad del transportista reconvertido (% con ingreso ≥ 80% previo a 3 años).
- Tiempo familiar recuperado en AMBA y metropolitanas.
- Acceso ciudadanos rurales a servicios críticos (% con MRM a salud, educación, justicia).
- Soberanía cognitiva de movilidad (% de datos argentinos en ArgenCloud).
- Participación ciudadana en BAMD (aportantes por 1.000 hab.).
- Poder adquisitivo vía MKC (% del sueldo liberado).
- Confianza en la flota autónoma pública (encuestas semestrales).

- [ ] **Step 2: Sección 22 — renumerar v1.0 §9 a §22 y expandir matriz de riesgos**

Preservar R1-R10. Agregar:
- R11 Fallas masivas de flota AV por bug o ataque.
- R12 Captura regulatoria del PCAV por operadores.
- R13 Concentración en BAMD.
- R14 Resistencia sindical extrema si PPM no llega a tiempo.
- R15 Obsolescencia tecnológica del LNMA.
- R16 Litigio internacional por Canon de Automatización (demandas de operadores extranjeros).
- R17 Fuga de datos de movilidad.

Cada uno con probabilidad / impacto / mitigación / residual (formato de tabla existente).

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Secciones 21-22 — Tablero con métricas humanas + Riesgos ampliados a R17"
```

### Task 9.2 — Sección 23 Protocolo de Falla + Sección 24 Dimensión Federal

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIONES 23 y 24

- [ ] **Step 1: Sección 23 — renumerar v1.0 §15 a §23 y agregar F6-F9**

Preservar F1-F5 y Cláusula de Continuidad. Agregar:
- F6 — Falla de algoritmo AV en flota pública: revocación PCAV en corredor, modo degradado supervisado, investigación por CAAAV.
- F7 — Concentración indebida en BAMD (>3% activos por grupo económico): auditoría antimonopolio automática, desinversión forzosa.
- F8 — Captura del LNMA por intereses privados: activación del protocolo Síndicos de Archivo + rotación obligatoria + vuelco a open-source en 90 días.
- F9 — Fuga masiva de datos de movilidad: plan con ANDIG, notificación obligatoria a ciudadanos, sanciones económicas proporcionales.

- [ ] **Step 2: Sección 24 — renumerar v1.0 §13 a §24 y ampliar**

Preservar 24.1 y 24.2. Agregar:
- 24.3 Pacto Federal AV: estándares PCAV aplicables en todas las provincias, Canon recaudado 50% federal / 50% provincial (provincia de origen del AV).
- 24.4 Pacto Federal BAMD: cada provincia define pilotos regionales con apoyo técnico ANMov.
- 24.5 Representación provincial en Directorio ANMov (rotación cada 2 años entre bloques regionales).

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Secciones 23-24 — Protocolo de Falla F6-F9 + Dimensión Federal ampliada"
```

### Task 9.3 — Sección 25 Hoja de Ruta + Sección 26 Visión 2046 + Sección 27 Cierre

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` SECCIONES 25, 26 y 27

- [ ] **Step 1: Sección 25 — renumerar v1.0 §10 a §25 y expandir con fases AV**

Reemplazar cronograma existente con la tabla de 5 fases del spec §9:
- Fase 0 Preparación 2026-2027.
- Fase 1 Arranque 2028-2030.
- Fase 2 Consolidación 2031-2034.
- Fase 3 Maduración 2035-2040.
- Fase 4 Régimen Pleno 2041-2046.

Cada fase con hitos (~5-7 bullets) e inversión acumulada.

Agregar 25.3 Triggers de Activación (A1, A2, M1, M2) como en spec §8.2.

- [ ] **Step 2: Sección 26 — renumerar v1.0 §14 a §26 y extender horizonte a 2046**

Preservar 14.1-14.3 de v1.0 (Lo Que Se Ve / Lo Que No Se Ve Pero Está / Pregunta Final) reubicadas a 26.1-26.3.

Agregar 26.4 2046 Extendido: flete en 10-11%, BAMD con 900K activos, 415K trabajadores formales, MKC para 45M argentinos, Canon AV recaudado USD 2.8K M/año, 200K reconvertidos con dignidad.

Agregar 26.5 Lo Que Podría Salir Mal (resumen de riesgos residuales con escenarios).

- [ ] **Step 3: Sección 27 Cierre — reescribir completamente**

Reemplazar el cierre actual de v1.0 por cuatro escenas — una por voz del Preámbulo — a 20 años:

27.1 Héctor a los 84. Preservar texto v1.0 con ajustes menores.
27.2 Florencia a los 62. Preservar con ajustes menores (exporta a Chile vía trasandino reactivado, flete 11%, contrató dos vecinas, hijo en UTN Ingeniería Ferroviaria).
27.3 Diego a los 67. Reconvertido a Coordinador de Corredor AV Supervisado ruta 5 durante sus últimos 10 años laborales con PPM puente. Pensión normal a los 65. Sigue manejando (pero con co-piloto AV). Sus hijos ya son ingenieros LNMA.
27.4 Julia a los 72. Cobró en 20 años USD 38.000 en CK por poner el Fiesta al servicio de la BAMD; compró un Peugeot 208 eléctrico nuevo; sigue en la biblioteca media jornada; el auto nuevo también está en BAMD.

Cerrar con una cita final nueva:
*"Un país no se conoce en el mapa. Se conoce en los movimientos que permite, y en las inteligencias que pone al servicio del movimiento. Argentina se conoció demasiado tiempo como filamento frágil con algoritmos ajenos decidiendo por ella. Puede conocerse de otra manera."*

- [ ] **Step 4: Verificar**

```bash
grep -n "^## SECCIÓN\|^## CIERRE\|^## ANEXO" "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
```
Expected: 28 headers (27 secciones + ANEXO A, B, C, D, E, F, G — pero anexos aún no están, se agregan en Task 10.1).

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Secciones 25-27 — Hoja de ruta en 5 fases, Visión 2046, Cierre cuatrivocal"
```

---

# FASE 10 — Anexos A-G

### Task 10.1 — Anexos A-G

**Files:**
- Modify: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md` — agregar después de Sección 27

- [ ] **Step 1: Anexo A — Glosario Técnico (60-80 entradas)**

Ordenado alfabéticamente. Cada entrada en una línea con término en **negrita** seguido de definición de 1-3 oraciones. Términos obligatorios:
ADIF, AGP, AMBA-T, ANDIG, ANMov, ArgenCloud, BAMD, BLF, CAAAV, Canon de Automatización Logística, CAR (Costo Anual de Reconversión), CK (Créditos de Kilómetros), Commons Vehicular, Corredor Dual, Credencial de Materia Movilidad, Doctrina del Doble Desplazamiento, FRM, HEDA (Horas de Trabajo Humano Equivalente Desplazadas Anualmente), Hidrovía Paraná-Paraguay, Human-in-the-Loop, LANIA, LNMA, MaaS, Mandato Kilométrico Ciudadano, MKC+, MRM (Movilidad Rural Mínima), Nivel SAE, PCAV (Protocolo de Certificación de Autonomía Vehicular), PPM (Pensión Puente Móvil), Protocolo Bastardo, Red Federal de Puertos, Red Metropolitana Federal, Rieles Columna Múltiple, SOFSE, Síndicos de Archivo, V2X, y ~25-35 más relevantes.

- [ ] **Step 2: Anexo B — Especificación Técnica BAMD (300-400 palabras)**

- Arquitectura de plataforma (backend, app aportante, app usuario).
- APIs públicas (reserva, matching, telemetría, pagos CK).
- SLAs operativos.
- Modelo de datos (sin PII, anonimización).
- Seguridad y certificados.
- Interoperabilidad con MKC, BLF, LNMA.

- [ ] **Step 3: Anexo C — Fórmula y Cálculo del Canon de Automatización (300-400 palabras)**

- Derivación de la fórmula `Canon_Anual(AV_k) = HEDA(AV_k) × CAR`.
- Tabla de factores HEDA por nivel SAE y modo (camión, taxi, colectivo, tren, buque).
- Ejemplo paso-a-paso para 5 casos.
- Mecanismo de indexación del CAR.
- Aplicación a flotas mixtas.

- [ ] **Step 4: Anexo D — Escenarios de Despliegue AV (350-500 palabras)**

- Tabla completa Conservador / Moderado / Acelerado (extensión de §8.1 del spec).
- Asunciones de cada escenario.
- Triggers de transición entre escenarios.
- Sensibilidad del modelo financiero a cada escenario.

- [ ] **Step 5: Anexo E — Protocolo PCAV (300-400 palabras)**

- Proceso de solicitud de certificación.
- Auditoría semestral (proceso, auditores, reporte público).
- Revocación (causales, proceso, apelación).
- Niveles SAE × Corredor (matriz).

- [ ] **Step 6: Anexo F — Impacto Ambiental y Emisiones (300-400 palabras)**

- CO2 evitable por modo transportado.
- NOx y PM2.5 (contaminación local urbana).
- Ruido urbano (AMBA, metropolitanas).
- Agua: operación ferroviaria vs. camión por ton-km.
- Articulación con PLANAGUA y PLANISV.

- [ ] **Step 7: Anexo G — Datos de Movilidad como Commons (300-400 palabras)**

- Gobernanza del repositorio LNMA.
- Acceso diferenciado (público / investigadores / Bastardas / usuarios individuales de sus propios datos).
- Anonimización técnica (k-anonimato, differential privacy).
- Relación con el esquema de tres capas de datos de PLANDIG.
- Ejemplos de datasets públicos liberados por el LNMA.

- [ ] **Step 8: Commit**

```bash
git add "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
git commit -m "docs(planmov v2.0): Anexos A-G (Glosario, BAMD, Canon, Escenarios AV, PCAV, Ambiental, Datos Commons)"
```

---

# FASE 11 — Actualización del ecosistema

### Task 11.1 — Actualizar arquitecto-data.ts y strategic-initiatives.ts

**Files:**
- Modify: `SocialJusticeHub/shared/arquitecto-data.ts`
- Modify: `SocialJusticeHub/shared/strategic-initiatives.ts`

- [ ] **Step 1: Leer arquitecto-data.ts para entender estructura**

Run: `grep -n "planmov\|PLANMOV\|movilidad\|Movilidad" SocialJusticeHub/shared/arquitecto-data.ts`

- [ ] **Step 2: Agregar entradas para los nuevos dispositivos (si la estructura lo permite) y actualizar fase/presupuesto de PLANMOV v2.0**

Si la estructura del archivo tiene listas de dispositivos, mandatos, o fases, actualizarlas:
- Mandato 23 PLANMOV: versión 2.0.
- Dispositivos Capa I: MKC, MRM, Red Metropolitana Federal, Protocolo Accesibilidad.
- Dispositivos Capa II: BLF, Reactivación+Columna Múltiple, Red Federal Puertos, Hidrovía Soberana.
- Dispositivos Capa III: BAMD, LNMA, FRM+Canon, Doctrina Doble Desplazamiento.
- Inversión: USD 104.000M.

- [ ] **Step 3: Actualizar strategic-initiatives.ts similar**

Run: `grep -n "planmov\|PLANMOV\|movilidad\|Movilidad" SocialJusticeHub/shared/strategic-initiatives.ts`

Aplicar cambios análogos: descripción, fases, presupuesto, agencias (ANMov, BAMD, LNMA, FRM, AMBA-T, PCAV).

- [ ] **Step 4: Correr type check**

```bash
cd SocialJusticeHub && npm run check
```
Expected: sin errores nuevos introducidos por el cambio (el error pre-existente de routes.ts es aceptable).

- [ ] **Step 5: Commit**

```bash
git add SocialJusticeHub/shared/arquitecto-data.ts SocialJusticeHub/shared/strategic-initiatives.ts
git commit -m "feat(ecosystem): actualizar arquitecto y strategic-initiatives con PLANMOV v2.0"
```

### Task 11.2 — Actualizar MATRIZ, HOJA_DE_RUTA, PRESUPUESTO, TABLA_AGENCIAS

**Files:**
- Modify: `Iniciativas Estratégicas/MATRIZ_MISIONES_Y_PLANES_ES.md`
- Modify: `Iniciativas Estratégicas/HOJA_DE_RUTA_CONSOLIDADA_BASTA.md`
- Modify: `Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md`
- Modify: `Iniciativas Estratégicas/TABLA_AGENCIAS_BASTA.md`

- [ ] **Step 1: MATRIZ — actualizar fila PLANMOV**

Run: `grep -n "PLANMOV\|Movilidad" "Iniciativas Estratégicas/MATRIZ_MISIONES_Y_PLANES_ES.md"`

Actualizar celdas: versión 2.0, 3 capas, inversión USD 104.000M, agencias (ANMov, BAMD, LNMA, FRM, AMBA-T).

- [ ] **Step 2: HOJA_DE_RUTA — actualizar cronograma PLANMOV**

Run: `grep -n "PLANMOV\|Movilidad" "Iniciativas Estratégicas/HOJA_DE_RUTA_CONSOLIDADA_BASTA.md"`

Actualizar con las 5 fases nuevas (Preparación / Arranque / Consolidación / Maduración / Régimen Pleno) y hitos.

- [ ] **Step 3: PRESUPUESTO — actualizar inversión PLANMOV**

Run: `grep -n "PLANMOV\|Movilidad" "Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md"`

Cambiar de USD 99.500M a USD 104.000M con desglose por 3 capas.

- [ ] **Step 4: TABLA_AGENCIAS — agregar nuevas agencias**

Run: `grep -n "ANMov\|Movilidad" "Iniciativas Estratégicas/TABLA_AGENCIAS_BASTA.md"`

Agregar filas nuevas: BAMD, LNMA, FRM, AMBA-T (y homólogas metropolitanas), PCAV como protocolo (no agencia).

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/MATRIZ_MISIONES_Y_PLANES_ES.md" "Iniciativas Estratégicas/HOJA_DE_RUTA_CONSOLIDADA_BASTA.md" "Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md" "Iniciativas Estratégicas/TABLA_AGENCIAS_BASTA.md"
git commit -m "docs(ecosystem): actualizar MATRIZ, HOJA_DE_RUTA, PRESUPUESTO y TABLA_AGENCIAS para PLANMOV v2.0"
```

### Task 11.3 — Actualizar CASCADA_LEGAL, CONEXIONES, SIMULACION, PDR, MASTER

**Files:**
- Modify: `Iniciativas Estratégicas/CASCADA_LEGAL_BASTA.md`
- Modify: `Iniciativas Estratégicas/ANALISIS_CONEXIONES_20_PLANES.md`
- Modify: `Iniciativas Estratégicas/SIMULACION_ADVERSARIAL_BASTA.md`
- Modify: `Iniciativas Estratégicas/PDR_NATIONAL_PLAN_SYSTEM.md`
- Modify: `Iniciativas Estratégicas/MASTER_COHERENCE_REPORT.md`

- [ ] **Step 1: CASCADA_LEGAL — agregar 9 leyes de PLANMOV v2.0**

Integrar las 9 leyes de la Sección 12 del plan en la cascada legal existente.

- [ ] **Step 2: ANALISIS_CONEXIONES — actualizar fila PLANMOV y sinergias**

Reflejar: 11 dispositivos + 1 doctrina; sinergia ampliada con PLANDIG (LNMA), PLANREP (ruta móvil), PLANEB (Canon), PLANEN (columna múltiple).

- [ ] **Step 3: SIMULACION_ADVERSARIAL — agregar ataques AV**

Agregar escenarios adversariales: ciberataque a flota AV, captura del PCAV, litigio internacional por Canon, huelga del sector camión ante anuncio de moratoria.

- [ ] **Step 4: PDR_NATIONAL_PLAN_SYSTEM — actualizar PLANMOV entry**

Versión 2.0, tres capas, descripción ampliada.

- [ ] **Step 5: MASTER_COHERENCE_REPORT — recomputar métricas globales**

Incluir: 22 planes aún (PLANMOV no cambia el conteo), pero PLANMOV ahora tiene mayor densidad; actualizar inversión ecosistema total (suma de todos los PLANes).

- [ ] **Step 6: Commit**

```bash
git add "Iniciativas Estratégicas/CASCADA_LEGAL_BASTA.md" "Iniciativas Estratégicas/ANALISIS_CONEXIONES_20_PLANES.md" "Iniciativas Estratégicas/SIMULACION_ADVERSARIAL_BASTA.md" "Iniciativas Estratégicas/PDR_NATIONAL_PLAN_SYSTEM.md" "Iniciativas Estratégicas/MASTER_COHERENCE_REPORT.md"
git commit -m "docs(ecosystem): actualizar CASCADA_LEGAL, CONEXIONES, SIMULACION, PDR, MASTER para PLANMOV v2.0"
```

---

# FASE 12 — Verificación final

### Task 12.1 — Auditoría estructural del documento v2.0

**Files:**
- Read: `Iniciativas Estratégicas/PLANMOV_Argentina_ES.md`

- [ ] **Step 1: Contar líneas totales**

```bash
wc -l "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
```
Expected: 2.800-3.200 líneas.

- [ ] **Step 2: Verificar presencia de todas las secciones esperadas**

```bash
grep -n "^## " "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md" | head -40
```
Expected: 27 secciones + 7 anexos + Preámbulo + Tesis Central + Cierre + Nota v2.0.

- [ ] **Step 3: Verificar presencia de los 11 dispositivos + doctrina**

```bash
grep -n "^### 3\." "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
```
Expected: 3.A, 3.1, 3.2, 3.3, 3.4, 3.B, 3.5, 3.6, 3.7, 3.8, 3.C, 3.9, 3.10, 3.11, 3.12.

- [ ] **Step 4: Verificar presencia de las cuatro voces**

```bash
grep -n "Héctor\|Florencia\|Diego\|Julia" "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md" | head -20
```
Expected: menciones en Preámbulo y en Cierre (Sección 27).

- [ ] **Step 5: Verificar referencias a planes del ecosistema**

```bash
grep -c "PLANDIG\|PLANEB\|PLANREP\|PLANEN\|LANIA\|ArgenCloud" "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
```
Expected: ≥40 menciones acumuladas.

- [ ] **Step 6: Verificar coherencia Capa III — BAMD, LNMA, FRM, Canon, Doctrina**

```bash
grep -c "BAMD\|LNMA\|FRM\|Canon de Automatización\|Doctrina del Doble Desplazamiento\|HEDA\|PCAV" "Iniciativas Estratégicas/PLANMOV_Argentina_ES.md"
```
Expected: ≥80 menciones acumuladas.

- [ ] **Step 7: Si hay gaps, agregar tareas correctivas y resolver**

### Task 12.2 — Commit final de verificación

- [ ] **Step 1: Git status confirma árbol limpio**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris && git status
```
Expected: "nothing to commit, working tree clean" para los archivos del plan (pueden quedar modificados archivos no relacionados al plan).

- [ ] **Step 2: Git log revisa historia de commits del plan**

```bash
git log --oneline -25
```
Expected: ~20 commits con prefijo `docs(planmov v2.0)` o `docs(ecosystem)` o `feat(ecosystem)`.

- [ ] **Step 3: Commit final con tag opcional**

```bash
git tag -a planmov-v2.0 -m "PLANMOV v2.0 — Refundación con IA/AV y Doctrina de Activos Disponibles"
```
(Opcional — solo si el usuario quiere marcar el hito.)

---

## Resumen de entregables

Al completar este plan:

1. **PLANMOV_Argentina_ES.md v2.0** — 2.800-3.200 líneas, 27 secciones + 7 anexos + Preámbulo cuatrivocal + Tesis Central en 9 movimientos + Cierre cuatrivocal a 20 años.
2. **Capa III completa** — BAMD, LNMA, FRM+Canon, Doctrina del Doble Desplazamiento como elementos estructurales no residuales.
3. **Coherencia de ecosistema** — 11 archivos del ecosistema actualizados (2 en `SocialJusticeHub/shared/` + 9 en `Iniciativas Estratégicas/`).
4. **Historia de commits incremental** — cada fase es un commit revisable, permite rollback selectivo.
5. **Auditoría estructural automatizada** — comandos `grep`/`wc` que verifican presencia de todos los elementos críticos.

## Criterios de aceptación

- [ ] Líneas totales del documento entre 2.800 y 3.200.
- [ ] Las cuatro voces del Preámbulo están presentes y tienen arco cerrado en Sección 27.
- [ ] Tesis Central incluye los 9 movimientos (incluyendo IA/AV, activo ocioso, tres capas, Doctrina, síntesis filosófica).
- [ ] Los 11 dispositivos están presentes y cada uno tiene al menos 200 palabras de desarrollo en Sección 3.
- [ ] Las secciones 7, 8, 9 (BAMD/LNMA/FRM+Canon en profundidad) tienen cada una 700-1.000 palabras.
- [ ] Anexos A-G están presentes.
- [ ] No quedan TBD / TODO / FIXME en el documento.
- [ ] `npm run check` pasa sin errores nuevos.
- [ ] Los documentos del ecosistema referencian coherentemente a PLANMOV v2.0.
