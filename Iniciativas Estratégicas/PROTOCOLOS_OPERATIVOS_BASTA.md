# PROTOCOLOS OPERATIVOS INTER-PLAN ¡BASTA!

**Documento Complementario al Marco ¡BASTA!**
Versión 1.0 | Marzo 2026

---

## 1. Propósito

Las secciones de integración de los 16 mandatos describen QUE fluye entre planes. Este documento describe COMO: formato, frecuencia, gobernanza, SLA, fallback.

Cada mandato ¡BASTA! tiene su sección de integración donde enumera sus conexiones con los demas. PLANDIG (Seccion 18) mapea 14 conexiones. PLANAGUA (Seccion 18) mapea 9. PLANSEG (Seccion 10) mapea 14. PLANMON (Anexo C) mapea 15. Esas secciones definen la arquitectura logica — que dato necesita quien, y para que.

Pero un flujo de datos sin protocolo operativo es una promesa vacia. Este documento convierte cada promesa en un contrato tecnico con formato, frecuencia, agencia responsable, tiempo maximo de entrega, calidad minima, y plan de contingencia.

**Alcance:** 20 flujos de datos criticos seleccionados por impacto sistemico — aquellos cuya interrupcion afecta a mas de un mandato o compromete la operacion de infraestructura compartida (ArgenCloud, SAPI, Tableros Nacionales, Red Bastarda).

**Principio rector:** Ningun flujo de datos entre agencias depende de buena voluntad. Cada flujo tiene un protocolo publicado, un SLA medible, y un fallback automatico. Si ANAGUA no entrega datos a ANSAL, el Tablero Nacional lo publica. Si ANDIG no procesa los sensores de ANISV, la cache local opera hasta la reconexion. La transparencia radical de ¡BASTA! se aplica a la propia maquinaria de ¡BASTA!.

---

## 2. Protocolos de Datos Criticos (Top 20)

### PROTOCOLO 01 — Produccion Agricola para Canasta de Respaldo

- **Flujo:** ISV-MON-CANASTA
- **Origen -> Destino:** PLANISV -> PLANMON
- **Datos:** Volumenes de produccion agricola por cultivo, por region, por trimestre. Precios en origen. Stocks disponibles. Proyecciones de cosecha. Calidad nutricional promedio por lote.
- **Formato:** JSON API REST (endpoints /api/v1/produccion/agricola/{region}/{cultivo}). Schema publicado en ArgenCloud Developer Portal. Firmado digitalmente por ANISV.
- **Frecuencia:** Diaria (volumenes y precios). Trimestral (proyecciones de cosecha y calidad).
- **Gobernanza:** ANISV (Agencia Nacional de Suelo Vivo) envia -> ANMON (Agencia Nacional Monetaria) recibe. El Indice Canasta Argentina de PLANMON consume estos datos para ponderar el componente alimentario del peso-canasta.
- **SLA:** Datos diarios entregados antes de las 08:00 ART. Datos trimestrales entregados dentro de los primeros 15 dias del trimestre. Tasa de completitud minima: 95% de cultivos monitoreados. Latencia maxima del API: 500ms.
- **Fallback:** Si el flujo se interrumpe >24 hs, ANMON usa datos SENASA/Bolsa de Comercio de Rosario como fuente secundaria. Si la interrupcion supera 72 hs, el Indice Canasta congela el componente alimentario en el ultimo valor valido y el Tablero Nacional Monetario publica alerta automatica.

### PROTOCOLO 02 — Calidad de Agua para Tablero de Salud Ambiental

- **Flujo:** AGUA-SAL-CALIDAD
- **Origen -> Destino:** PLANAGUA -> PLANSAL
- **Datos:** Indice de Calidad del Agua (ICA) por cuenca. Concentraciones de arsenico, nitratos, E. coli, residuos de agroquimicos, disruptores endocrinos. Alertas de contaminacion activas. Poblacion expuesta por localidad.
- **Formato:** IoT stream via protocolo MQTT sobre ArgenCloud. Datos agregados en JSON cada hora. Alertas en tiempo real via webhook al Sistema Integral de Vitalidad de PLANSAL.
- **Frecuencia:** Tiempo real (sensores IoT). Agregacion horaria (tablero). Informe epidemiologico mensual.
- **Gobernanza:** ANAGUA (Red IoT hidrica, 15.000+ sensores) envia -> ANSAL (Agencia Nacional de Salud) recibe. El Tablero Nacional del Agua es la fuente primaria. PLANSAL consume para correlacionar calidad del agua con carga de enfermedad por localidad (arsenicosis, SUH, resistencia antimicrobiana).
- **SLA:** Datos de sensores: latencia maxima 5 minutos desde medicion hasta disponibilidad en ArgenCloud. Alertas de contaminacion: notificacion a ANSAL en <15 minutos. Informe mensual: entregado dentro de los primeros 5 dias habiles del mes. Cobertura minima: 90% de cuencas con poblacion >10.000 habitantes.
- **Fallback:** Si un sensor falla, los sensores contiguos de la red asumen cobertura interpolada. Si el stream IoT se interrumpe por falla de conectividad, los nodos locales almacenan datos en cache LoRaWAN y retransmiten al reconectarse. Si la interrupcion es regional (>100 sensores), ANAGUA activa protocolo de muestreo manual con laboratorios moviles y ANSAL eleva alerta preventiva a los Centros de Vitalidad de la zona.

### PROTOCOLO 03 — Regalias Energeticas al Fondo Soberano

- **Flujo:** EN-MON-REGALIAS
- **Origen -> Destino:** PLANEN -> PLANMON
- **Datos:** Recaudacion de regalias por fuente (gas/petroleo, litio, creditos de carbono). Desglose por concesion, por provincia. Tipo de cambio aplicado. Proyeccion mensual de flujo. Estado de cumplimiento de concesionarios.
- **Formato:** Transaccion on-chain en la Red del Pulso (capa de transparencia blockchain). Complemento con informe mensual estructurado (JSON + PDF firmado digitalmente). Cada transferencia es verificable publicamente en el Tablero Nacional Monetario.
- **Frecuencia:** Mensual (liquidacion de regalias). Tiempo real (registro on-chain de cada pago individual de concesionario). Proyeccion trimestral.
- **Gobernanza:** ANEN (Agencia Nacional de Energia) liquida -> Bastarda Financiera (PLANEB) custodia -> ANMON supervisa. El Panel Ciudadano del Fondo Soberano audita trimestralmente. Estimacion de flujo: USD 2.000-4.800M/ano (Tabla 6.4 de PLANEN).
- **SLA:** Liquidacion mensual completada antes del dia 10 del mes siguiente. Diferencia entre recaudacion declarada y recaudacion recibida: <0,5%. Auditoria on-chain disponible en <1 hora desde cada transaccion.
- **Fallback:** Si un concesionario no paga, ANEN activa clausula de suspension de concesion (72 hs de gracia). Si la Bastarda Financiera tiene falla operativa, el BCRA actua como custodio transitorio. Si la blockchain tiene congestion, los pagos se registran en cola FIFO y se confirman en el proximo bloque disponible.

### PROTOCOLO 04 — Ahorro Fiscal para Asignacion Educativa

- **Flujo:** REP-EDU-AHORRO
- **Origen -> Destino:** PLANREP -> PLANEDU
- **Datos:** Ahorro fiscal neto por reconversion de empleo publico (salarios liberados menos costos de reconversion). Desglose por jurisdiccion. Porcentaje asignado a PLANEDU segun tabla de asignacion inter-plan. Proyeccion anual.
- **Formato:** Informe trimestral estructurado (JSON + PDF). Publicado en Tablero Nacional de Reconversion. Verificado por Auditoria Ciudadana de PLANREP.
- **Frecuencia:** Trimestral (liquidacion). Mensual (estimacion preliminar). Anual (auditoria integral).
- **Gobernanza:** ANREP (Agencia Nacional de Reconversion) calcula y certifica el ahorro -> ANCE (Agencia Nacional de Calidad Educativa, PLANEDU) recibe la asignacion consolidada. El Consejo de Coordinacion ¡BASTA! valida que la asignacion no exceda el ahorro neto real (prevencion de doble contabilidad detectada en la auditoria de coherencia).
- **SLA:** Informe trimestral entregado dentro de los primeros 20 dias del trimestre siguiente. Auditoria anual completada antes del 31 de marzo. Discrepancia maxima entre estimacion y liquidacion final: <10%.
- **Fallback:** Si el ahorro real es menor al proyectado, PLANEDU opera con presupuesto base garantizado (partida federal minima no sujeta a ahorro). Si ANREP no entrega datos a tiempo, ANCE usa la proyeccion del trimestre anterior. El Tablero publica la demora automaticamente.

### PROTOCOLO 05 — Datos de Suelo para Calibracion Satelital

- **Flujo:** ISV-DIG-SAOCOM
- **Origen -> Destino:** PLANISV -> PLANDIG
- **Datos:** Mediciones terrestres de humedad de suelo, biomasa microbiana, carbono organico, pH, conductividad electrica. Geolocalizacion precisa (GPS RTK, <2cm). Fecha y hora de muestreo. Metadatos de metodologia de laboratorio.
- **Formato:** GeoJSON con campos estandarizados (schema ISO 28258 para datos de suelo). Subida a ArgenCloud via API REST autenticada. Integrado en El Mapa como capa de calibracion terrestre.
- **Frecuencia:** Semanal (datos de sensores IoT in situ). Mensual (muestras de laboratorio). Estacional (muestreo intensivo de calibracion en campana agricola).
- **Gobernanza:** ANISV (estaciones INTA + red de sensores de suelo) envia -> ANDIG (Division de El Mapa + integracion CONAE) recibe. CONAE usa estos datos para calibrar las imagenes SAR del SAOCOM-1A/1B (humedad de suelo por radar vs. medicion directa).
- **SLA:** Datos de sensores IoT: latencia maxima 1 hora. Datos de laboratorio: subidos dentro de 48 hs del analisis. Cobertura geografica minima: 500 puntos de calibracion distribuidos en las 6 regiones agroecologicas. Precision de geolocalizacion: <5m.
- **Fallback:** Si los sensores de campo fallan, CONAE usa datos historicos + modelos de estimacion. Si PLANISV no entrega datos de calibracion por >30 dias, ANDIG emite alerta de degradacion de precision en los productos SAOCOM y el Tablero del Suelo muestra margen de error ampliado.

### PROTOCOLO 06 — Sensores IoT para Gemelo Digital del Agua

- **Flujo:** DIG-AGUA-GEMELO
- **Origen -> Destino:** PLANDIG -> PLANAGUA
- **Datos:** Lecturas crudas de sensores hidricos: caudal, nivel, turbidez, pH, temperatura, conductividad, oxigeno disuelto, presion en red. Estado operativo de cada sensor. Datos meteorologicos de estaciones asociadas.
- **Formato:** IoT stream MQTT con QoS nivel 1 (entrega garantizada al menos una vez). Datos en formato SenML (Sensor Markup Language, RFC 8428). Almacenamiento en series temporales (TimescaleDB sobre ArgenCloud).
- **Frecuencia:** Tiempo real (cada 5 minutos para caudal/nivel, cada 15 minutos para quimicos). Datos meteorologicos cada hora.
- **Gobernanza:** ANDIG (infraestructura IoT, conectividad, ArgenCloud) opera la red fisica de sensores -> ANAGUA (Gemelo Digital Nacional del Agua) consume los datos para modelado predictivo (inundaciones, sequias, contaminacion). Costos de infraestructura compartidos segun Tabla 18A de PLANAGUA.
- **SLA:** Disponibilidad de la red IoT: 99,5% (uptime mensual). Latencia sensor-a-ArgenCloud: <30 segundos. Tasa de perdida de paquetes: <2%. Mantenimiento preventivo de sensores: ciclo de 6 meses.
- **Fallback:** Tres vias de comunicacion redundantes: (1) fibra REFEFO, (2) satelital ARSAT, (3) mesh LoRaWAN local. Si las tres fallan simultaneamente (catastrofe regional), los nodos locales almacenan datos hasta 72 hs en memoria interna. ANAGUA opera el Gemelo en modo degradado con ultima lectura valida + modelos predictivos basados en datos historicos.

### PROTOCOLO 07 — Sensores IoT para Salud del Suelo

- **Flujo:** DIG-ISV-SUELO
- **Origen -> Destino:** PLANDIG -> PLANISV
- **Datos:** Humedad del suelo a multiples profundidades (10cm, 30cm, 60cm). Temperatura del suelo. Nitratos en napa freatica. Escorrentia hacia arroyos. Residuos de agroquimicos. Actividad microbiana (sensores de CO2 del suelo).
- **Formato:** IoT stream MQTT. Datos en SenML. Integrados en El Mapa como capa edafica. Disponibles tambien via API REST para el Tablero Nacional de Salud del Suelo.
- **Frecuencia:** Cada 15 minutos (humedad, temperatura). Cada hora (quimicos). Diario (agregados para el Tablero).
- **Gobernanza:** ANDIG (red IoT compartida con PLANAGUA en zonas agricolas — un solo nodo mide suelo + agua) opera -> ANISV consume para monitoreo de 25+ millones de hectareas. Red integrada de 15.000+ nodos en zonas agricolas (Tabla 18A de PLANAGUA).
- **SLA:** Disponibilidad: 99% en campana agricola (septiembre-abril), 95% fuera de campana. Precision de sensores de humedad: +/-2% volumetrico. Calibracion anual obligatoria con muestreo de laboratorio.
- **Fallback:** Si un nodo falla, interpolacion con sensores contiguos + datos SAOCOM (banda L para humedad). Si la red falla regionalmente, ANISV activa protocolo de muestreo manual por tecnicos de campo y publica datos con periodicidad semanal en vez de horaria.

### PROTOCOLO 08 — Trazabilidad Blockchain Campo a Mesa

- **Flujo:** EB-ISV-TRAZA
- **Origen -> Destino:** PLANEB -> PLANISV
- **Datos:** Registro completo de cadena de custodia: origen de produccion (finca, lote, coordenadas), insumos utilizados, fecha de cosecha, condiciones de transporte (temperatura, humedad), procesamiento, distribucion. Certificacion de suelo vivo. Denominacion de origen verificada.
- **Formato:** Registros inmutables en blockchain Layer 2 (Red Bastarda). Codigo QR en cada producto con link a registro verificable. Smart contracts para validacion automatica de cumplimiento de estandares PLANISV. API REST para consulta publica.
- **Frecuencia:** Tiempo real (cada evento de la cadena genera un registro). Consolidacion diaria para reportes agregados.
- **Gobernanza:** ANEB (Red Bastarda, Bastarda Alimentaria) opera la infraestructura blockchain -> ANISV certifica que la produccion cumple estandares de suelo regenerativo. Consumidor final puede escanear QR y ver toda la cadena. Auditoria cruzada: ANISV verifica datos de campo vs. registro blockchain trimestralmente.
- **SLA:** Registro de evento en blockchain: <60 segundos. Disponibilidad del sistema de consulta QR: 99,9%. Costo de gas por transaccion: absorbido por la Bastarda Alimentaria (<USD 0,01 en L2). Cobertura: 100% de productos de la Bastarda Alimentaria, 50% de produccion PLANISV general en Ano 5.
- **Fallback:** Si la blockchain tiene congestion o falla, los registros se almacenan en cola local firmada digitalmente y se confirman al restaurarse el servicio. La trazabilidad funciona offline: cada punto de la cadena tiene un registro local que se sincroniza cuando hay conectividad. Auditoria manual trimestral como verificacion independiente.

### PROTOCOLO 09 — Disputas y Resolucion de Conflictos Inter-Plan

- **Flujo:** JUS-TODOS-DISPUTAS
- **Origen -> Destino:** PLANJUS -> todos los mandatos
- **Datos:** Solicitudes de resolucion de conflictos inter-agencia. Expedientes digitales con evidencia. Resoluciones de paneles ciudadanos. Registros de cumplimiento. Precedentes jurisprudenciales del sistema JUS.
- **Formato:** Plataforma JUS Digital sobre ArgenCloud. Expedientes estructurados en JSON con audit trail completo. Resoluciones firmadas digitalmente por el panel y publicadas en Capa 1 (acceso publico). Comunicacion via Mensajero Nacional cifrado.
- **Frecuencia:** Bajo demanda (cada agencia puede iniciar un caso). JUS-1 resuelve en 15 dias. JUS-2 en 45 dias. JUS-3 en 90 dias.
- **Gobernanza:** ANJUS (Agencia Nacional de Justicia Popular) administra -> todas las agencias ¡BASTA! son potenciales usuarios. Paneles ciudadanos sorteados con expertise tecnico relevante al conflicto. La IA del Modelo Legal Argentino (LANIA/PLANDIG) asiste al panel pero nunca decide.
- **SLA:** Admision del caso: <48 hs habiles. Resolucion JUS-1: 15 dias calendario. JUS-2: 45 dias. JUS-3: 90 dias. Publicacion de resolucion: <24 hs post-firma. Tasa de cumplimiento de resoluciones: >90% en plazo fijado.
- **Fallback:** Si ANJUS no puede constituir panel (insuficiencia de ciudadanos sorteados con expertise), se amplia el radio de sorteo. Si la plataforma digital falla, los expedientes se procesan en formato documental via las Casas JUS fisicas. Si una agencia se niega a cumplir una resolucion JUS, el Consejo de Coordinacion ¡BASTA! puede retener transferencias presupuestarias (modelo ANCE).

### PROTOCOLO 10 — Datos de Empleo para Navegante Ciudadano

- **Flujo:** REP-DIG-EMPLEO
- **Origen -> Destino:** PLANREP -> PLANDIG
- **Datos:** Estado de reconversion de cada trabajador (anonimizado para agregacion, nominativo con consentimiento para el Navegante personal). Perfiles de competencias. Oferta de capacitacion disponible por Centro de la Vida. Demanda laboral por sector y region. Tasas de colocacion. Oportunidades activas en las Ocho Ramas de la Economia de la Vida.
- **Formato:** JSON API REST. Datos anonimizados en Capa 1 (agregados para politica publica). Datos personales en Capa 3 (cofre digital del ciudadano, acceso solo con consentimiento). El Arquitecto de Fuerza Laboral IA consume ambas capas.
- **Frecuencia:** Diaria (oferta/demanda laboral). Semanal (perfiles actualizados). Mensual (metricas agregadas para Tablero Nacional de Reconversion).
- **Gobernanza:** ANREP (Centros de la Vida, sistema de reconversion) envia -> ANDIG (Arquitecto de Fuerza Laboral IA, Navegante Ciudadano) procesa y presenta al ciudadano su mapa personalizado de opciones.
- **SLA:** Actualizacion de oferta laboral: <24 hs desde publicacion. Respuesta del Navegante Ciudadano al usuario: <3 segundos. Precision de matcheo perfil-oportunidad: >70% de relevancia segun evaluacion del usuario. Disponibilidad del servicio: 99,5%.
- **Fallback:** Si el Arquitecto de Fuerza Laboral falla, el Navegante muestra busqueda manual basica (filtros por region, sector, salario). Si ANREP no actualiza datos >72 hs, el sistema marca las oportunidades como "sin verificar reciente" y alerta al usuario. Los Centros de la Vida operan orientacion presencial como canal paralelo.

### PROTOCOLO 11 — Datos de Seguridad para Tablero Nacional

- **Flujo:** SEG-DIG-TABLERO
- **Origen -> Destino:** PLANSEG -> PLANDIG
- **Datos:** Incidentes por tipo (homicidios, robos, lesiones, violencia de genero). Estado del Protocolo VERDE/AMARILLO/ROJO por zona. Datos de camaras corporales (metadatos, no video completo — video accesible solo con orden judicial). Metricas de Estaciones Barriales. Percepcion ciudadana de seguridad. Indicadores de transicion narco.
- **Formato:** JSON API para datos estructurados. Video almacenado en ArgenCloud con cifrado y control de acceso (Capa 2 con restriccion judicial). Dashboard web publico del Tablero Nacional de Seguridad en Capa 1.
- **Frecuencia:** Tiempo real (incidentes criticos, cambios de protocolo). Diaria (metricas agregadas). Trimestral (informe de percepcion ciudadana).
- **Gobernanza:** ANSEG (Agencia Nacional de Seguridad) genera y certifica datos -> ANDIG (El Mapa, Tablero Nacional de Seguridad) publica y visualiza. Los datos sensibles (videos, inteligencia) permanecen en Capa 2 con acceso restringido. PLANJUS supervisa el acceso a datos de vigilancia.
- **SLA:** Publicacion de incidentes en tablero publico: <1 hora. Actualizacion de protocolo de zona (VERDE/AMARILLO/ROJO): <30 minutos. Almacenamiento de video de camaras corporales: minimo 180 dias. Disponibilidad del tablero publico: 99,9%.
- **Fallback:** Si ArgenCloud falla, ANSEG opera con sistemas de comunicacion propios (radio, mensajeria cifrada) y publica datos en modo diferido al restaurarse. Los datos operativos de seguridad NUNCA dependen exclusivamente de infraestructura digital — las Estaciones Barriales tienen protocolos analogicos de emergencia.

### PROTOCOLO 12 — Regulacion de Sustancias para Protocolo de Seguridad

- **Flujo:** SUS-SEG-PROTOCOLO
- **Origen -> Destino:** PLANSUS -> PLANSEG
- **Datos:** Estado de la cascada de legalizacion por fase y por sustancia. Mapa de dispensarios autorizados (ubicacion, horario, inventario). Datos de El Puente (operadores en transicion por tier). Indicadores de mercado negro residual estimado. Alertas de adulteracion de sustancias.
- **Formato:** JSON API REST (datos operativos). Blockchain de la Red Bastarda (registro de licencias y trazabilidad de sustancias legales). Dashboard compartido ANSUS-ANSEG con acceso en tiempo real. Mensajero Nacional cifrado para alertas operativas.
- **Frecuencia:** Tiempo real (alertas de adulteracion, cambios de estado de operadores de El Puente). Diaria (actualizacion de mapa de dispensarios e inventario). Semanal (estimacion de mercado negro). Mensual (informe de avance de cascada). El estado del protocolo VERDE/AMARILLO/ROJO se evalua trimestralmente pero puede cambiar por evento critico.
- **Gobernanza:** ANSUS (Agencia Nacional de Sustancias) define estado de la cascada y gestiona licencias -> ANSEG aplica protocolo de seguridad correspondiente. Coordinacion permanente: si ANSEG declara ROJO en una zona, ANSUS puede pausar la cascada en esa zona hasta que vuelva a AMARILLO.
- **SLA:** Alerta de adulteracion: notificacion a ANSEG en <15 minutos. Actualizacion de estado de cascada: inmediata. Informe mensual: entregado dentro de los primeros 5 dias habiles. Sincronizacion de mapas de dispensarios: <6 horas.
- **Fallback:** Si la plataforma digital falla, ANSUS y ANSEG operan por comunicacion directa (Mensajero Nacional o radio). El protocolo VERDE/AMARILLO/ROJO es operativo con o sin sistema digital — la evaluacion de indicadores puede hacerse manualmente. Si la blockchain de trazabilidad falla, los dispensarios operan con registro local que se sincroniza al restaurarse.

### PROTOCOLO 13 — Datos de Vivienda para Tablero Nacional

- **Flujo:** VIV-DIG-TABLERO
- **Origen -> Destino:** PLANVIV -> PLANDIG
- **Datos:** Avance de construccion por proyecto (unidades iniciadas, en proceso, terminadas, entregadas). Estado de urbanizacion de asentamientos informales (1.800 villas). Sensores IoT de edificios inteligentes (monitoreo estructural: humedad, vibraciones, asentamientos). Titulacion digital emitida. Creditos hipotecarios bastardos otorgados.
- **Formato:** JSON API REST para datos de avance. IoT stream para sensores de edificios. Blockchain para titulacion digital (registro inmutable de propiedad). Integrado en El Mapa como capa de habitat.
- **Frecuencia:** Semanal (avance de obras). Tiempo real (sensores de edificios). Mensual (titulacion y creditos). Trimestral (informe consolidado de habitat).
- **Gobernanza:** ANVIV (Agencia Nacional de Vivienda) y Bastarda Inmobiliaria generan datos -> ANDIG (El Mapa, Tablero Nacional de Vivienda) publica y visualiza. PLANDIG digitaliza la titulacion via IDS + blockchain.
- **SLA:** Actualizacion de avance de obras: semanal, antes del lunes 10:00 ART. Latencia de sensores de edificio: <5 minutos. Emision de titulo digital: <48 hs desde aprobacion de regularizacion. Disponibilidad del tablero: 99,5%.
- **Fallback:** Si los sensores de edificios fallan, se activa inspeccion presencial programada (frecuencia trimestral). Si el sistema de titulacion blockchain falla, se emite titulo provisorio en formato digital firmado, con confirmacion on-chain posterior. Si ArgenCloud falla, los datos de avance de obras se publican via Tablero offline de cada Bastarda Inmobiliaria.

### PROTOCOLO 14 — Produccion Energetica para Red Inteligente

- **Flujo:** EN-DIG-GRID
- **Origen -> Destino:** PLANEN -> PLANDIG
- **Datos:** Generacion en tiempo real por fuente (eolica, solar, termica, hidro, nuclear, bioenergia). Consumo por nodo de distribucion. Estado de la red (frecuencia, tension, perdidas). Produccion de prosumidores (net metering ciudadano). Precio spot de energia.
- **Formato:** IoT stream via protocolo IEC 61850 (estandar internacional de redes electricas inteligentes) sobre ArgenCloud. Datos agregados en JSON para Tablero Nacional de Energia (capa de El Mapa). IA de optimizacion de PLANDIG consume datos crudos.
- **Frecuencia:** Tiempo real (cada segundo para frecuencia/tension, cada minuto para generacion/consumo). Horaria (precios spot). Diaria (agregados para tablero publico).
- **Gobernanza:** ANEN (Agencia Nacional de Energia) y Bastarda Energetica generan datos -> ANDIG (El Mapa, Smart Grid IA) optimiza distribucion. SAPI (PLANDIG) es el riel de cobro de la Bastarda Energetica.
- **SLA:** Latencia de datos de red: <1 segundo para parametros criticos (frecuencia, tension). Disponibilidad del flujo: 99,99% (infraestructura critica). Precision de medidores inteligentes: clase 0,5S (norma IEC 62053). Tiempo de respuesta de la IA de optimizacion: <100ms para decisiones de despacho.
- **Fallback:** La red electrica tiene protocolos de operacion autonoma pre-PLANDIG que siguen activos como fallback. Si ArgenCloud falla, los centros de control regionales de CAMMESA operan en modo manual. Si la IA de optimizacion falla, el sistema opera con reglas estaticas de despacho (merito economico clasico). Los sensores de red tienen alimentacion ininterrumpida (UPS + bateria).

### PROTOCOLO 15 — Pagos y Transacciones via SAPI

- **Flujo:** MON-DIG-SAPI
- **Origen -> Destino:** PLANMON -> PLANDIG
- **Datos:** Transacciones en peso-canasta (Pulso). Conversiones Pulso-peso y Pulso-crypto. Estado de wallets (saldos agregados, no individuales). Volumen transaccional por region. Velocidad de circulacion. Datos para oracles del Indice Canasta Argentina.
- **Formato:** Protocolo transaccional nativo del SAPI (Sistema Abierto de Pagos e Identidad) sobre nucleo soberano de PLANDIG. API REST publica para consultas de estado. Blockchain como capa de verificacion. Cifrado de extremo a extremo para transacciones individuales (Capa 3).
- **Frecuencia:** Tiempo real (cada transaccion). Agregacion diaria para tablero publico. Publicacion horaria de metricas monetarias.
- **Gobernanza:** ANMON (protocolo monetario del Pulso) define reglas -> ANDIG (SAPI, nucleo soberano) ejecuta procesamiento. La Bastarda Financiera (PLANEB) es nodo ancla. 100.000 nodos comunitarios actuan como validadores distribuidos. Ningun actor individual puede manipular el registro.
- **SLA:** Tiempo de procesamiento de transaccion: <10 segundos. Disponibilidad de SAPI: 99,99% (infraestructura critica). Cero comisiones para el usuario. Capacidad: 10.000 transacciones por segundo (escalable). Latencia de publicacion de Indice Canasta: <1 minuto.
- **Fallback:** Si el nucleo soberano falla, los nodos comunitarios mantienen operacion local (transacciones entre usuarios del mismo nodo). Si la red completa falla, la tarjeta fisica del Pulso opera en modo offline (transacciones firmadas criptograficamente que se sincronizan al reconectarse). Si una falla excede 24 hs, ANMON activa el Fondo de Garantia de Red.

### PROTOCOLO 16 — Datos de Salud para Plataforma de Autodiagnostico

- **Flujo:** SAL-DIG-VITALIDAD
- **Origen -> Destino:** PLANSAL -> PLANDIG
- **Datos:** Datos epidemiologicos agregados (anonimizados, Capa 1). Protocolos de atencion actualizados para el co-tutor de salud IA. Contenidos educativos de las 12 areas de vida. Derivaciones a Centros de Vitalidad. Datos individuales de quiz y seguimiento (Capa 3 — propiedad del ciudadano).
- **Formato:** JSON API REST para datos agregados. FHIR (Fast Healthcare Interoperability Resources, HL7) para datos clinicos interoperables. Contenidos educativos en formato estandarizado para el Modelo de Salud del LANIA. Capa 3 via Cofre Digital del ciudadano (acceso solo con consentimiento explicito).
- **Frecuencia:** Diaria (datos epidemiologicos agregados). Semanal (actualizacion de contenidos y protocolos). Tiempo real (interacciones del usuario con la plataforma de autodiagnostico, almacenadas en Capa 3).
- **Gobernanza:** ANSAL (Agencia Nacional de Salud, Centros de Vitalidad) genera datos clinicos y protocolos -> ANDIG (Plataforma de Vitalidad, LANIA) opera la infraestructura digital. Los datos personales de salud NUNCA salen de la Capa 3 sin consentimiento. ANDIG no puede acceder a datos individuales — solo procesa agregados anonimizados.
- **SLA:** Actualizacion de datos epidemiologicos: <24 hs. Disponibilidad de la plataforma: 99,5%. Tiempo de respuesta del co-tutor de salud IA: <2 segundos. Auditoria trimestral de privacidad por la Division de Gobernanza del LANIA.
- **Fallback:** Si la plataforma digital falla, los Centros de Vitalidad operan presencialmente (su funcion primaria es presencial, la plataforma es complemento). Si los datos epidemiologicos se interrumpen, el co-tutor de salud opera con la ultima version de protocolos hasta actualizacion. Ningun dato de salud se pierde: los Cofres Digitales tienen backup cifrado en el nucleo soberano.

### PROTOCOLO 17 — Exportaciones para Flujo de Divisas

- **Flujo:** GEO-MON-DIVISAS
- **Origen -> Destino:** PLANGEO -> PLANMON
- **Datos:** Exportaciones por destino, por producto, por moneda de liquidacion. Importaciones y balanza comercial. Estado de acuerdos bilaterales de comercio en monedas locales. Flujos del Bancor Sudamericano (cuando operativo). Datos de Aduana.
- **Formato:** Informe diario estructurado (JSON) con datos de Aduana. Informe mensual detallado (JSON + PDF). Transacciones del Bancor via protocolo especifico de camara de compensacion regional.
- **Frecuencia:** Diaria (datos aduaneros brutos). Mensual (balanza comercial consolidada). Trimestral (informe de posicionamiento geoeconomico).
- **Gobernanza:** ANGEO (Agencia Nacional de Geopolitica) y Aduana generan datos -> ANMON consume para gestion de reservas y calibracion del Indice Canasta Argentina (componente importado).
- **SLA:** Datos aduaneros diarios: entregados antes de las 20:00 ART. Informe mensual: dentro de los primeros 10 dias habiles. Precision de datos: <1% de discrepancia con registros de contraparte.
- **Fallback:** Si el flujo se interrumpe, ANMON usa datos de bancos corresponsales y fuentes secundarias (BIS, FMI, datos de contrapartes comerciales). El Indice Canasta mantiene el componente de importaciones con datos de la semana anterior hasta actualizacion.

### PROTOCOLO 18 — Datos de Construccion para Demanda Laboral

- **Flujo:** VIV-REP-LABORAL
- **Origen -> Destino:** PLANVIV -> PLANREP
- **Datos:** Proyectos de construccion planificados (ubicacion, escala, cronograma). Perfiles laborales requeridos por proyecto (albaniles, electricistas, plomeros, operadores de maquinaria, ingenieros, arquitectos). Cantidad de puestos disponibles por trimestre. Nivel salarial estimado.
- **Formato:** JSON API REST integrado con el Arquitecto de Fuerza Laboral de PLANDIG. Publicacion en el Tablero Nacional de Reconversion.
- **Frecuencia:** Mensual (actualizacion de proyectos y demanda). Trimestral (proyeccion de demanda laboral a 12 meses). Anual (plan maestro de construccion).
- **Gobernanza:** ANVIV (planificacion de vivienda) y Bastarda Inmobiliaria (ejecucion) generan la demanda -> ANREP (Centros de la Vida) forma trabajadores en los perfiles requeridos. El Arquitecto de Fuerza Laboral hace el matcheo automatico.
- **SLA:** Publicacion de demanda laboral: dentro de los primeros 5 dias del mes. Anticipacion minima de proyectos nuevos: 6 meses antes del inicio de obra. Precision de proyeccion de demanda: +/-20%.
- **Fallback:** Si ANVIV no publica demanda a tiempo, ANREP usa datos del sector privado de construccion (IERIC, Camaras sectoriales) como proxy. Los Centros de la Vida mantienen formacion en oficios de construccion como programa permanente independientemente del flujo de datos.

### PROTOCOLO 19 — Curriculum para Plataforma Educativa

- **Flujo:** EDU-DIG-PAA
- **Origen -> Destino:** PLANEDU -> PLANDIG
- **Datos:** Contenidos curriculares de las Siete Capacidades. Materiales pedagogicos para el co-tutor de IA educativo. Datos de aprendizaje anonimizados (patrones de error comun, tiempos de respuesta, areas de dificultad por region). Portfolio Ciudadano Unico (propiedad del estudiante, Capa 3). Actualizaciones de curriculum.
- **Formato:** Contenidos en formato SCORM 2004 / xAPI (estandares internacionales de e-learning). Datos de aprendizaje anonimizados en JSON (Capa 1, para mejora del modelo educativo). Datos personales en Cofre Digital del estudiante (Capa 3). Plataforma educativa soberana reemplaza Google Classroom.
- **Frecuencia:** Semestral (actualizaciones curriculares). Continua (datos de aprendizaje del co-tutor). Trimestral (auditoria de sesgos del modelo educativo por el LANIA).
- **Gobernanza:** ANCE (Agencia Nacional de Calidad Educativa, PLANEDU) define contenidos y estandares -> ANDIG (LANIA, Modelo Educativo Argentino) opera la infraestructura del co-tutor de IA. Google no ve nada: los patrones cognitivos de los estudiantes quedan en Argentina. El LANIA audita trimestralmente por sesgos (genero, nivel socioeconomico, region).
- **SLA:** Disponibilidad de la plataforma educativa: 99,5% en horario escolar (07:00-19:00). Tiempo de respuesta del co-tutor: <2 segundos. Actualizacion de contenidos: <48 hs desde aprobacion por ANCE. Cobertura: 5.000 escuelas en Ano 3, 15.000 en Ano 5, cobertura nacional en Ano 10.
- **Fallback:** Si la plataforma falla durante horario escolar, los docentes operan con materiales descargados localmente (cada escuela con nodo comunitario tiene cache de contenidos). Si el co-tutor de IA falla, el sistema degrada a busqueda de contenidos estatica. Las escuelas rurales sin conectividad estable reciben paquetes de contenido via satelite ARSAT con sincronizacion periodica.

### PROTOCOLO 20 — Datos de Ciudad para Gemelo Digital Urbano

- **Flujo:** 24CN-DIG-GEMELO
- **Origen -> Destino:** PLAN24CN -> PLANDIG
- **Datos:** Diseno urbano de cada ciudad nueva (CAD/BIM). Datos IoT de infraestructura urbana: trafico, energia, agua, residuos, calidad del aire, ruido. Estado de servicios publicos. Ocupacion de viviendas. Actividad comercial. Datos de transporte publico. Clima interior de edificios.
- **Formato:** BIM (Building Information Modeling) en formato IFC para diseno. IoT stream para sensores urbanos. JSON API para datos administrativos. Integrado en El Mapa como gemelo digital de cada ciudad nueva. Interoperable con Gemelo Digital del Agua (PLANAGUA) y Red Inteligente (PLANEN).
- **Frecuencia:** Tiempo real (sensores IoT: trafico, energia, agua). Semanal (actualizacion de modelos BIM durante construccion). Mensual (datos administrativos y de actividad).
- **Gobernanza:** Gobiernos de ciudades PLAN24CN y sus Bastardas de servicio generan datos -> ANDIG (El Mapa, Gemelo Digital Nacional) integra. Cada ciudad tiene su gemelo local que se conecta al gemelo nacional. Lo que se aprende en una ciudad alimenta a todas las demas.
- **SLA:** Latencia de sensores urbanos: <1 minuto. Actualizacion de gemelo digital: <5 minutos para datos criticos (trafico, emergencias). Disponibilidad: 99,5%. Interoperabilidad: 100% de los gemelos de ciudades nuevas compatibles con El Mapa desde el dia uno.
- **Fallback:** Si ArgenCloud falla, cada ciudad opera su gemelo local autonomamente (nodo de datacenter soberano de 2-5 MW por ciudad). Si los sensores urbanos fallan, los servicios publicos operan en modo manual con protocolos pre-digitales. Las ciudades PLAN24CN nacen con gemelo digital, pero estan disenadas para funcionar sin el — la tecnologia mejora la ciudad, no la sostiene.

---

## 3. Infraestructura Compartida

Todos los flujos anteriores dependen de cuatro capas de infraestructura compartida. Ningun flujo es viable sin al menos una de ellas.

### 3.1 ArgenCloud (PLANDIG) — Backbone de Datos

ArgenCloud es el nucleo soberano de computo donde residen todos los datos de todos los mandatos ¡BASTA!. Sin ArgenCloud, no hay Tableros Nacionales, no hay Gemelo Digital, no hay Arquitecto de Fuerza Laboral, no hay co-tutor educativo.

- **Arquitectura:** 24 nodos soberanos (uno por ciudad PLAN24CN, 2-5 MW cada uno) + 100.000 nodos comunitarios (la malla).
- **SLA global:** Disponibilidad 99,95% (maximo 4,4 hs de downtime por ano). Replicacion geografica: cada dato critico almacenado en minimo 3 nodos en distintas provincias.
- **Gobernanza:** ANDIG opera. Panel Ciudadano Digital audita. Codigo de la plataforma es abierto. Ningun dato de ciudadano sale de Argentina sin consentimiento explicito.

### 3.2 SAPI (PLANDIG) — Riel de Pagos

El Sistema Abierto de Pagos e Identidad es el riel financiero de todas las Bastardas y del Pulso. Sin SAPI, no hay transacciones en la economia ¡BASTA!.

- **Capacidad:** 10.000 transacciones por segundo (escalable). Cero comisiones para el usuario.
- **Integracion:** Todos los bancos + fintechs + Bastardas (PLANEB) + cooperativas.
- **SLA global:** Disponibilidad 99,99%. Latencia de transaccion <10 segundos.
- **Gobernanza:** ANDIG opera la infraestructura. ANMON define las reglas monetarias. ANEB define las reglas del Protocolo Bastardo.

### 3.3 Blockchain de la Red Bastarda (PLANEB) — Capa de Trazabilidad

La blockchain Layer 2 de la Red Bastarda es la capa de transparencia y auditabilidad de todo el ecosistema ¡BASTA!.

- **Usos:** Tesoreria on-chain de cada Bastarda. Trazabilidad de cadena de suministro (campo a mesa). Registro de propiedad (titulacion digital PLANVIV). Resoluciones de PLANJUS. Registro de decisiones de gobierno.
- **SLA global:** Tiempo de confirmacion <60 segundos. Inmutabilidad garantizada por consenso distribuido. Costo por transaccion <USD 0,01.
- **Gobernanza:** ANEB define el protocolo. ANDIG opera los nodos del nucleo. Los nodos comunitarios participan en validacion. Codigo abierto, auditable por cualquiera.

### 3.4 Tableros Nacionales — Capa de Visualizacion

Cada mandato tiene su Tablero Nacional (Agua, Suelo, Energia, Seguridad, Educacion, Salud, Vivienda, Reconversion, Monetario, Digital). Todos son capas de El Mapa de PLANDIG.

- **Acceso:** Capa 1 (publico). Cualquier ciudadano puede ver cualquier tablero desde cualquier dispositivo.
- **Actualizacion:** Segun el protocolo especifico de cada flujo (tiempo real para datos IoT, diaria para datos agregados, trimestral para informes).
- **Gobernanza:** Cada agencia certifica sus datos. ANDIG opera la infraestructura de visualizacion. Los Paneles Ciudadanos de cada mandato auditan la veracidad.

---

## 4. Gobernanza de Conflictos Inter-Agencia

### 4.1 El Problema

Dieciséis agencias autonomas operando sobre el mismo territorio inevitablemente generan conflictos de jurisdiccion, prioridad y recursos. Ejemplos concretos:

- **ANAGUA vs. ANEN:** Uso del agua para fracking en Vaca Muerta. PLANAGUA protege cuencas. PLANEN necesita agua para la extraccion de gas que capitaliza el Fondo Soberano. Quien prevalece?
- **ANSEG vs. ANJUS:** Un caso de violencia que podria resolverse en JUS-1 (mediacion comunitaria) pero que ANSEG quiere escalar por riesgo de seguridad. Jurisdiccion superpuesta.
- **ANISV vs. ANVIV:** Un terreno que PLANISV designa como corredor de biodiversidad y que PLANVIV necesita para un proyecto de vivienda.
- **ANDIG vs. todas:** Una agencia que se niega a migrar sus datos a ArgenCloud por "razones operativas" (tradicion, inercia, resistencia al cambio).

### 4.2 Protocolo de Arbitraje (Tres Niveles)

**NIVEL 1 — Mediacion Tecnica (15 dias)**
Las agencias en conflicto designan un representante tecnico cada una. Un mediador neutral (sorteado de un panel de expertos en politica publica) facilita la negociacion. El objetivo es acuerdo por consenso. El 70% de los conflictos deberia resolverse aca.

**NIVEL 2 — Panel Ciudadano Inter-Agencia (45 dias)**
Si el Nivel 1 falla, se sortea un Panel Ciudadano de 7 miembros con expertise relevante al conflicto (ej: para ANAGUA vs. ANEN, el panel incluye un hidrologo, un ingeniero de energia, y cinco ciudadanos de las comunidades afectadas). El Panel escucha a ambas agencias, consulta datos del Tablero Nacional relevante, y emite resolucion vinculante. La IA del Modelo Legal Argentino (LANIA) asiste al panel con analisis de precedentes, pero no decide.

**NIVEL 3 — Consejo de Coordinacion ¡BASTA! (90 dias)**
Para conflictos sistemicos que afectan a mas de dos mandatos. El Consejo de Coordinacion ¡BASTA! — un representante tecnico de cada una de las 16 agencias + 3 ciudadanos sorteados — delibera y resuelve. El Consejo puede: reasignar recursos, modificar cronogramas, establecer prioridades temporales, o derivar a PLANJUS (JUS-3) si el conflicto tiene dimension juridica.

**ULTIMO RECURSO — PLANJUS (JUS-3)**
Si una agencia se niega a cumplir una resolucion del Consejo de Coordinacion, PLANJUS arbitra con caracter vinculante e inapelable. El mecanismo de cumplimiento es presupuestario: el Consejo puede retener transferencias a la agencia incumplidora. La justicia popular es el sistema inmunologico de ¡BASTA! — protege al sistema de sus propios organos cuando estos dejan de cooperar.

### 4.3 Principios de Priorizacion

Cuando dos mandatos compiten por el mismo recurso, el orden de prioridad es:

1. **Vida humana** — PLANSAL y seguridad de personas siempre prevalecen.
2. **Agua potable** — PLANAGUA para consumo humano prevalece sobre uso industrial o energetico.
3. **Alimentacion** — PLANISV para produccion alimentaria prevalece sobre uso no alimentario del suelo.
4. **Vivienda** — PLANVIV cuando hay personas sin techo inmediato.
5. **Todo lo demas** — se resuelve caso por caso segun impacto medido en personas afectadas.

---

## 5. Resiliencia y Fallbacks

### 5.1 Escenarios de Falla y Respuesta

**ESCENARIO A: Caida de ArgenCloud (regional)**
- **Impacto:** Todos los flujos que pasan por la region afectada se interrumpen. Tableros Nacionales muestran datos incompletos. SAPI podria degradarse.
- **Respuesta:** Los nodos de otras regiones asumen carga (replicacion geografica). Los nodos comunitarios locales operan en modo cache: sirven contenidos estaticos y procesan transacciones locales que se sincronizan al reconectarse. Cada agencia tiene protocolos analogicos de emergencia para sus funciones criticas.
- **Tiempo maximo de interrupcion:** 4 horas para servicios criticos (SAPI, alertas de seguridad, alertas de agua). 24 horas para servicios no criticos (tableros, co-tutor educativo, navegante ciudadano).

**ESCENARIO B: Falla masiva de sensores IoT (desastre natural)**
- **Impacto:** Gemelo Digital del Agua pierde datos de la zona. El Mapa muestra zonas ciegas. El Tablero del Suelo pierde cobertura.
- **Respuesta:** Los modelos predictivos del Gemelo operan con datos historicos + datos satelitales (SAOCOM es autonomo respecto de la red terrestre). ANAGUA y ANISV activan protocolo de muestreo manual de emergencia. Los sensores tienen diseno IP67 (resistentes a inmersion temporal) pero un terremoto o inundacion severa puede destruir nodos completos.
- **Reconstruccion:** Stock de sensores de repuesto (5% de la red) almacenado en depositos regionales. Despliegue de emergencia en <72 hs para zonas criticas.

**ESCENARIO C: Agencia que no entrega datos a tiempo**
- **Impacto:** El flujo especifico se interrumpe. Los sistemas que dependen de ese flujo operan con datos degradados.
- **Respuesta:** El Tablero Nacional correspondiente publica automaticamente que la agencia no entrego datos y desde cuando. La transparencia radical es el mecanismo de presion: la ciudadania ve en tiempo real que agencia esta incumpliendo. Si la demora excede el SLA, el Consejo de Coordinacion ¡BASTA! notifica formalmente. Si excede el doble del SLA, se activa mediacion tecnica (Nivel 1 del protocolo de arbitraje).
- **Prevencion:** Cada agencia designa un Oficial de Datos Interoperables responsable de garantizar que los flujos salientes cumplan SLA. El cargo es nominativo y publicado en el tablero de la agencia.

**ESCENARIO D: Ciberataque al nucleo soberano**
- **Impacto:** Potencialmente catastrofico. Todos los flujos comprometidos.
- **Respuesta:** El SOC (Centro de Operaciones de Seguridad) de PLANDIG opera 24/7. Aislamiento automatico de nodos comprometidos. Activacion del protocolo de PLANSEG para ciberdefensa (personal reconvertido a ciberseguridad). Backups cifrados en almacenamiento frio (air-gapped) con restauracion en <6 hs para datos criticos. La arquitectura distribuida (24 nodos + malla comunitaria) hace que comprometer todo el sistema requiera comprometer simultaneamente multiples nodos geograficamente dispersos — un orden de magnitud mas dificil que atacar un datacenter centralizado.
- **Prevencion:** Auditorias de seguridad semestrales por equipos red team nacionales e internacionales. Bug bounty publico. Codigo abierto permite auditoria comunitaria permanente.

**ESCENARIO E: Falla de la blockchain de la Red Bastarda**
- **Impacto:** Trazabilidad de cadena de suministro interrumpida. Tesorerías de Bastardas operan sin verificacion on-chain. Titulacion digital en pausa.
- **Respuesta:** Todas las Bastardas tienen registros locales firmados digitalmente que operan independientemente de la blockchain. La blockchain es capa de verificacion, no de operacion: la Bastarda Alimentaria sigue vendiendo, la Bastarda Financiera sigue procesando pagos, la Bastarda Inmobiliaria sigue construyendo. Al restaurarse la blockchain, los registros locales se sincronizan y se confirman on-chain.
- **Tiempo maximo aceptable:** 48 hs para confirmar transacciones pendientes post-restauracion.

### 5.2 Principio General de Degradacion Elegante

Ningun servicio ¡BASTA! deja de funcionar completamente porque fallo un sistema digital. Cada servicio tiene tres capas:

1. **Digital completa** — modo normal de operacion, con todos los flujos activos.
2. **Digital degradada** — con datos parciales, cache local, modelos predictivos en vez de datos reales.
3. **Analogica** — los Centros de Vitalidad atienden presencialmente, las Estaciones Barriales patrullan, los Centros de la Vida forman, los dispensarios venden, las escuelas ensenan. La tecnologia mejora — no reemplaza — el servicio presencial.

La Argentina funciono sin sistemas digitales durante siglos. ¡BASTA! construye infraestructura digital que potencia exponencialmente la capacidad del Estado, pero disena cada servicio para que sobreviva sin ella. Porque un Estado que depende de un server para existir no es soberano — es fragil.

---

> *"Los datos que fluyen entre los dieciséis mandatos son la sangre de ¡BASTA!. Este documento es el sistema circulatorio: las arterias, las valvulas, los protocolos de coagulacion cuando algo se corta. Sin este documento, las integraciones son poesia. Con el, son ingenieria."*

---

**PROTOCOLOS OPERATIVOS INTER-PLAN ¡BASTA!**
Version 1.0 | Marzo 2026
Preparado bajo el marco ¡BASTA! — Basta de vivir apagados!
