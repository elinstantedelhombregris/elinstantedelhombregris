# Plan detallado de mejoras: del mapa de voces a una visión de país

Fecha: 2026-09-09. Estado: plan propuesto; tareas pendientes de implementación.

Spec: [mapa y visión de país](../specs/2026-09-09-mapa-vision-de-pais.md). Diagnóstico: [análisis previo](../analisis/2026-09-08-web-v2-vision-de-pais.md).

## 1. Objetivo y forma de trabajar

Construir un circuito completo: **explorar → comprender → aportar → formular un futuro → comparar alternativas → acordar con alcance explícito → actuar → comprobar → revisar**.

El trabajo se organiza en entregas utilizables. Cada entrega tiene un responsable funcional, dependencias y una prueba de salida. Los roles describen trabajo necesario; no presuponen personas contratadas. No hay fechas de publicación comprometidas: primero se mide la base técnica y se acuerda disponibilidad de equipo y participantes. Las etapas de campo requieren tiempo humano además de desarrollo.

Roles: **Producto** define alcance y lenguaje; **Diseño** resuelve interacción y accesibilidad; **Desarrollo** implementa datos e interfaz; **Datos** valida fuentes y comparabilidad; **Territorio** convoca y facilita; **Verificación** comprueba comportamiento y resultados. Una misma persona puede cubrir varios roles, pero nadie valida por sí solo sus propios hechos cuando el protocolo exige corroboración independiente.

## 2. Entregas y dependencias

| Entrega | Resultado visible | Depende de | Responsable principal |
|---|---|---|---|
| E0. Base y decisiones | Alcance, contratos y limitaciones conocidos | Diagnóstico | Producto + Desarrollo |
| E1. Confianza | El mapa diferencia fallas, ausencia y datos parciales; las métricas no inventan conclusiones | E0 | Desarrollo + Verificación |
| E2. Exploración y fichas | Encontrar un lugar, entenderlo y abrir una ficha con aportes trazables | E1 | Diseño + Desarrollo |
| E3. Evidencia y capacidades | Contrastar relatos con fuentes, conocer recursos y planificar escucha | E2; catálogo de datos puede prepararse desde E0 | Datos + Territorio |
| E4. Objetivos y deliberación | Formular metas, comparar alternativas y publicar acuerdos con disensos | E2 + contexto mínimo de E3 | Producto + Territorio + Desarrollo |
| E5. Acciones y piloto | Responsables aceptan tareas y la comunidad comprueba resultados | E4; estructura de ejecución puede prepararse desde E2 | Territorio + Desarrollo |
| E6. Visión nacional | Conectar objetivos y tensiones entre territorios | Evidencia del piloto E5 | Producto + Datos + Territorio |
| E7. Escenarios, ampliación opcional | Explorar consecuencias de alternativas con supuestos públicos | E6 + datos adecuados al modelo | Datos + Desarrollo |

La primera entrega al usuario es E1. La primera versión de exploración útil es E2. El primer circuito integral se evalúa al finalizar E5. E6 produce una síntesis de los territorios participantes con sus límites, sin atribuirles representación nacional.

## 3. E0 — Cerrar el alcance y preparar la implementación

- [ ] **E0.1 · Inventario del estado real.** Revisar las rutas públicas y consumidores móviles; comprobar en un entorno autorizado de lectura el origen y tamaño del corpus, disponibilidad geográfica, tareas programadas, protección de coordenadas y política de retiro. Registrar fecha de cada comprobación. No reutilizar como hechos actuales los comentarios que afirman «base en cero».
- [ ] **E0.2 · Matriz de reutilización.** Confirmar qué operaciones están disponibles de punta a punta. Existen rutas para respuestas a preguntas y barrido de vigencia; revisar su uso antes de reabrir deudas históricas. En iniciativas hay estructuras de tareas, hitos y evidencia, pero las rutas principales inspeccionadas solo exponen consulta, ingreso y salida: completar el circuito no equivale a crear únicamente una pantalla.
- [ ] **E0.3 · Contrato del significado.** Publicar definiciones de señal, actor de navegador, participante autenticado, corroboración, adhesión, objetivo, acuerdo, acción y resultado. Escribir qué no se puede deducir de cada uno. Tipo de aporte y tema se mantienen separados.
- [ ] **E0.4 · Escenarios de validación.** Preparar pruebas aisladas de error de red, respuesta parcial, más de 500 señales por origen, registros sin provincia, ubicación aproximada, aporte retirado, edición concurrente y reintento de envío. Datos de prueba solo en entornos de test identificados; nunca alimentar el mapa público.

**Salida:** inventario fechado, dependencias conocidas, casos de prueba definidos y ninguna decisión bloqueante para E1. Validar el estado de las comprobaciones del repositorio antes de atribuir fallas a cambios nuevos.

## 4. E1 — Corregir confianza y consistencia

### E1.1 · Estados de datos explícitos — D-083

- [x] Propagar carga, error y datos previos desde la consulta a todos los modos, contadores y paneles.
- [x] Si no llegó una respuesta válida, mostrar «No pudimos cargar los datos» con reintento. Si existe una respuesta anterior, mostrar fecha y estado de actualización.
- [x] Reservar cero y «sin registros» para consultas completas con resultado vacío.
- [ ] Si falla la geometría pero existen registros, conservar lista y explicar que el mapa no está disponible.

**Archivos existentes:** `apps/web/src/pages/ElMapa/instrumento/Instrumento.tsx`, `modos/`, `Chrome.tsx`, `Vacio.tsx`, `lib/queries/civic-map.ts`.

**Aceptación:** fallo inicial y fallo tras una respuesta exitosa no generan silencio territorial ni borran datos previos como si fueran cero; todos los modos conservan la misma interpretación.

### E1.2 · Agregados completos y dibujo acotado — D-084

- [x] Definir una consulta compartida: ámbito territorial o polígono público, tema, clase, tipo, estado y período. Mantener separados lugar de publicación y territorio afectado cuando se conozcan ambos.
- [x] Agregar una lectura analítica de servidor que calcule totales y distribución sobre el conjunto elegible completo. Resolver de forma explícita convivencia y posible solapamiento entre `senales` y orígenes antiguos; no borrar ni fusionar por semejanza textual.
- [x] La lectura de puntos devuelve paginación estable y metadatos: cantidad coincidente, cantidad entregada, continuación, fecha de corte, filtros efectivos y completitud. El contrato es propuesto, no un endpoint ya existente.
- [x] El contador general usa el agregado; el dibujo usa puntos o agrupaciones. Si el lazo no tiene cálculo completo, rotular «sobre los registros cargados» hasta implementar la consulta geométrica completa.
- [x] Llevar el mismo alcance a Mapa, Análisis, Tiempo, Cobertura y lado medido de Simulación. No obtener una cifra nacional de una página del feed.
- [ ] Incorporar índices después de medir consultas representativas; evitar cargar el corpus entero en cada teléfono.

**Archivos existentes:** `packages/db/src/repositories/civic-map.ts`, `repositories/senales.ts`, `apps/api/src/features/civic-map/`, `features/senales/`, `apps/web/src/lib/queries/civic-map.ts`.

**Aceptación:** con 1.201 registros elegibles de un origen, el total sigue siendo 1.201 aunque el dibujo entregue 500; nuevas páginas no duplican ni pierden registros de la misma fecha. Retirar una señal la excluye de los agregados vigentes. Cambiar filtros modifica todas las superficies de forma coherente.

### E1.3 · Reemplazar afirmaciones sin fundamento — D-085 y D-086

- [x] Mostrar necesidades y recursos declarados por separado; retirar «cubierta si se organiza» hasta que haya correspondencias verificadas.
- [x] Diferenciar registros de recursos y actores que los ofrecen; no llamar personas a filas.
- [x] Sustituir «Documento auditado» por un mensaje sobre la lectura real, sin atribuir verificación.
- [x] Revisar «acciones en votación» y el salto de «ejemplo» a «mandato» para que cada sección exprese el mecanismo disponible. Un umbral para mostrar porcentajes no habilita legitimidad colectiva.

**Aceptación:** una necesidad de agua y una oferta de herramientas no se presentan como cobertura; leer hasta el final no registra una auditoría; una adhesión no se etiqueta como voto.

### E1.4 · Consentimiento, recibo y reintentos — D-087

- [x] Alinear el formulario con el contrato de publicación sin cesión de texto, incluyendo qué muestra el mapa y qué incluye el registro público. Separar elección de licencia de los consentimientos necesarios.
- [x] Mantener una clave de envío estable durante los reintentos del mismo borrador; cambiarla al comenzar un aporte nuevo. Verificar el comportamiento existente antes de editarlo.
- [ ] Mostrar recibo con enlace público y controles de gestión existentes. Los secretos de retiro nunca entran en enlaces compartibles, métricas ni registros públicos.
- [ ] Mantener borrador tras error y mostrar la precisión que el servidor efectivamente autorizó.

**Aceptación:** doble envío o corte de conexión no crea dos señales; licencia desmarcada produce el resultado anunciado o explica un requisito real, sin contradicción; el recibo permite encontrar el aporte.

**Salida E1:** casos anteriores verificados; deudas D-083 a D-087 resueltas solo donde exista evidencia; comparación de contadores entre superficies y control de regresiones de privacidad.

## 5. E2 — Hacer que explorar y aportar sea sencillo

### E2.1 · Entrada al instrumento y navegación

- [x] Reducir la portada del mapa y poner búsqueda, resumen territorial e instrumento al comienzo. Abrir captura desde «Aportar a este lugar» sin ocultar la opción de un aporte de alcance nacional.
- [x] Reutilizar `/api/v1/geo/lugares` para buscar por nombre, con localidad y provincia visibles para desambiguar. No inventar una segunda base de topónimos.
- [x] Añadir selección manual de lugar; GPS es una opción, no condición para participar.
- [x] Compartir en la URL territorio, tema, período y lente; nunca datos privados. Atrás/adelante restaura contexto. Los enlaces antiguos siguen funcionando.
- [ ] Mantener las rutas de Radiografía, Mandato y planes; enlazarlas con el contexto seleccionado y declarar los filtros que todavía no admiten.

### E2.2 · Accesibilidad y uso en móvil

- [x] Ofrecer mapa y lista con el mismo alcance y conteos.
- [ ] En teléfono, ficha inferior plegable y captura por pasos; en escritorio, panel lateral. No exigir lazo ni gestos finos.
- [ ] Garantizar contraste y distinción por texto/forma además de color; excluir la información analítica del velo de desaturación si altera su lectura.
- [ ] Conservar foco de teclado al abrir/cerrar paneles; anunciar carga y errores; permitir ampliar texto y reducir movimiento.
- [ ] Comprobar 360, 390, 768 y 1440 píxeles, navegación de teclado y conexión intermitente. Evitar repetir la regresión móvil ya corregida en D-078. _(22/9: anchos 360, 390, 768 y 1440 comprobados sin scroll lateral y con el mapa en la primera pantalla; faltan teclado y conexión intermitente.)_

### E2.3 · Captura guiada sin cambiar el canon

- [ ] Empezar con preguntas cotidianas y derivar a los nueve tipos existentes. No decidir el tipo automáticamente sin confirmación.
- [ ] Mostrar solo los campos necesarios para el tipo: fuente, fecha o periodicidad según corresponda.
- [ ] Permitir aportar capacidades y prácticas existentes con tanta facilidad como problemas.
- [ ] Después del envío, ofrecer ver el aporte y vincularlo a una ficha; nunca afirmar que ya integra un acuerdo.
- [ ] Reemplazar la promesa de 30 segundos por una indicación respaldada por pruebas con usuarios, o retirarla.

### E2.4 · Primera ficha de futuro, todavía como borrador

- [ ] Crear una ficha con título/pregunta, territorio, temas, situación, futuro deseado y próxima tarea de investigación.
- [ ] Vincular señales mediante identificadores públicos y relaciones explícitas: describe, contradice, aporta evidencia o capacidad. Conservar la fuente; no copiar todo el corpus a otro dominio.
- [ ] Mostrar los apartados incompletos como pendientes y permitir preguntas sin una conclusión prematura.
- [ ] Agregar revisión numerada, historial de cambios y aviso de conflicto si otra persona editó mientras tanto.
- [ ] Definir quién puede proponer cambios, revisar y publicar; colaboradores autenticados para administrar fichas, aportes anónimos conservados según el contrato vigente. No conectar identidades automáticamente.

**Salida E2:** una persona nueva encuentra un lugar, entiende la diferencia entre registros y evidencia, consulta una ficha y aporta sin perder el contexto. Objetivo de prueba inicial: 4 de 5 participantes nuevos completan ese recorrido sin ayuda; es un criterio de usabilidad propuesto, no una medición de representatividad.

## 6. E3 — Incorporar evidencia, capacidades y cobertura útil

### E3.1 · Catálogo mínimo de indicadores

- [ ] Elegir uno o dos temas del piloto y entre tres y cinco indicadores relevantes; no importar indiscriminadamente todos los datos disponibles.
- [ ] Para cada serie: institución, enlace, fecha de referencia, fecha de obtención, unidad, universo, territorio, método, licencia, frecuencia esperada y límites de interpretación.
- [ ] Reutilizar el catálogo geográfico y documentar equivalencias entre municipio, departamento, localidad y unidad censal. Una jerarquía simple no resuelve todas las pertenencias.
- [ ] Validar geometrías y bordes. Incorporar departamentos/municipios para las áreas piloto con fuente identificada; mostrar el resto como pendiente en vez de fingir cobertura nacional.
- [ ] Versionar importaciones y registrar fallos; una actualización fallida conserva la última versión válida con aviso. Cero, dato no publicado y dato no disponible son estados distintos.

**Fuentes de partida verificadas en el análisis:** [INDEC](https://www.indec.gob.ar/indec/web/Nivel4-Tema-2-41-165?lang=es), [REDATAM](https://redatam.indec.gob.ar/) y [Georef](https://www.argentina.gob.ar/georef). Confirmar disponibilidad y escala de cada conjunto específico al importarlo.

### E3.2 · Capacidades con disponibilidad real

- [ ] Extender señales de recurso/práctica mediante detalles tipados: qué ofrece, unidad, cantidad cuando tenga sentido, período, restricciones, alcance, organización que consiente y fecha de última confirmación.
- [ ] No convertir el catálogo editorial `resources` en inventario de stock.
- [ ] Proponer vínculos entre una necesidad y un recurso compatible. La aceptación debe ser explícita por las partes que intervienen; cercanía no prueba compatibilidad.
- [ ] Diferenciar disponibilidad declarada, reservada y entrega confirmada. Aplicar reserva transaccional cuando un recurso sea divisible y cuantificable, evitando ofrecer dos veces la misma capacidad.

### E3.3 · Cobertura que orienta la escucha

- [ ] Separar presencia de registros, vigencia de observaciones y alcance de relevamientos. No presentarlos como porcentaje de población representada.
- [ ] Usar unidades estables y su versión para comparaciones; recortar por el territorio pertinente y distinguir áreas no habitadas cuando haya información adecuada.
- [ ] Tratar señales provinciales, sin punto y con precisión reducida según su alcance; no afirmar que verifican una celda exacta.
- [ ] Generar tareas de escucha con objetivo, zona, método, responsable que acepta, fecha y resultado. Conectar con capacidades de campo existentes, verificando sincronización y protección de datos.
- [ ] Describir procedencia presencial o digital y límites de convocatoria sin crear perfiles públicos sensibles.

**Salida E3:** cada cifra abre su fuente; no se ofrece zoom analítico más preciso que los datos; una ficha puede mostrar evidencia contradictoria; una zona poco relevada produce una tarea de escucha, no una afirmación sobre lo que piensa su población.

## 7. E4 — Formular objetivos y deliberar alternativas

### E4.1 · Objetivos colectivos verificables

- [ ] Agregar resultado deseado, horizonte, indicador, línea de base, meta, unidad y método de verificación. Admitir «línea de base pendiente» con una tarea para establecerla.
- [ ] Registrar población/ámbito afectado, institución competente propuesta y principios que orientan la decisión. La competencia se valida; el sistema no asigna obligaciones a terceros.
- [ ] Mantener separados frecuencia de menciones, gravedad documentada, desigualdad y viabilidad. No calcular una prioridad total con pesos ocultos.
- [ ] Permitir objetivos que atraviesan varios temas y lugares.

### E4.2 · Alternativas comparables

- [ ] Ofrecer una plantilla común: mecanismo, beneficiarios, afectados, capacidades necesarias, costo estimado y fuente, plazo, dependencias, efectos adversos e incertidumbre.
- [ ] Comparar dos o más alternativas cuando existan; incluir mantener la situación actual cuando ayude a entender consecuencias.
- [ ] Enlazar planes editoriales como referencias, sin preseleccionarlos como respuesta de la comunidad.
- [ ] Mantener distinta la propuesta original de cada versión revisada y mostrar qué objeción motivó un cambio.

### E4.3 · Proceso deliberativo y moderación

- [ ] Abrir un proceso con pregunta, ámbito, convocatoria, responsables de facilitación, fechas, reglas de participación y forma prevista de cierre.
- [ ] Registrar argumentos, evidencia, objeciones, respuestas y modificaciones. Las adhesiones continúan siendo adhesiones.
- [ ] Publicar política de moderación, motivos de intervenciones y mecanismo de apelación; ocultar contenido sensible sin replicarlo en el historial público.
- [ ] Identificar cómo se contaron participantes y límites frente a duplicaciones; no llamar persona verificada al identificador de navegador. Aplicar permisos y límites contra abuso en escrituras.
- [ ] Primer cierre: síntesis facilitada y revisable con participantes y objeciones explícitos. La votación vinculante queda fuera de esta primera versión; cualquier mecanismo posterior requiere definir elegibilidad y reglas antes de abrirlo.

### E4.4 · Síntesis trazable

- [ ] Publicar acuerdos parciales, alternativas discutidas, disensos pendientes, ausencias y próxima revisión.
- [ ] Vincular cada afirmación con evidencia o argumentos. La IA puede sugerir redacción y agrupaciones; una persona responsable valida su publicación.
- [ ] Usar Radiografía para descubrir relaciones temáticas, conservando posibilidad de dividir o rechazar agrupaciones.
- [ ] Retirar mensajes de «deliberación no disponible» solo en los ámbitos donde el circuito esté operativo. Mantener una explicación clara para el resto.

**Salida E4:** una objeción puede cambiar una alternativa y quedar visible en la síntesis. Se sabe quién participó según la unidad realmente medida, qué regla se usó y qué diferencias siguen abiertas. El producto no atribuye el resultado al país entero.

## 8. E5 — Ejecutar, comprobar y evaluar el piloto

### E5.1 · Acciones aceptadas y seguimiento

- [ ] Vincular la alternativa a una iniciativa existente o nueva, con tarea, hito, responsable que acepta, fecha y recursos comprometidos.
- [ ] Completar servicios de iniciativas que falten: creación/edición autorizada, tareas, evidencia y transiciones. Reutilizar tablas existentes tras revisar si expresan aceptación y verificación suficientes.
- [ ] Distinguir tarea terminada, entrega declarada y resultado confirmado. Un plazo vencido informa vencimiento; no acusa incumplimiento sin el protocolo correspondiente.
- [ ] Solicitar evidencia mínima pertinente y corroboración independiente cuando aplique. No publicar rostros, domicilios ni documentos sensibles por defecto.
- [ ] Actualizar la ficha y devolver el resultado a quienes decidieron seguirla, mediante preferencias explícitas de notificación.

### E5.2 · Piloto territorial

- [ ] Seleccionar tres contextos por contraste: urbano, localidad intermedia y rural. Es una propuesta de diseño del piloto, no una muestra nacional; elegir lugares con interlocutores disponibles.
- [ ] Acordar uno o dos temas con una pregunta verificable y posibilidad de acción. Los pilotos de luminarias y ollas previstos en la Constitución son candidatos a evaluar, no comunidades ya comprometidas.
- [ ] Realizar una sesión de exploración y escucha, una de formulación/comparación y una revisión posterior de acciones. Registrar invitación, ausencias y límites.
- [ ] Evaluar comprensión, abandono de captura, vinculación de aportes, calidad de síntesis y confirmación de resultados. Documentar observaciones, no solo tasas.
- [ ] Corregir los obstáculos observados antes de extender el alcance a más lugares.

**Salida E5:** cada territorio conserva una ficha revisada, un objetivo, alternativas o justificación de su ausencia, diferencias explícitas y una acción aceptada. Para demostrar el circuito completo debe haber al menos un resultado confirmado; si no lo hay, el piloto sigue en aprendizaje y no se declara éxito por tener más publicaciones.

## 9. E6 — Construir la primera visión de país

- [ ] **E6.1 · Relaciones entre fichas.** Conectar objetivos compartidos, dependencias, complementariedades y tensiones. Usar relaciones tipadas en Postgres antes de considerar infraestructura especializada. Una relación causal sugerida conserva estado de hipótesis y fuente.
- [ ] **E6.2 · Escalas de decisión.** Mostrar qué puede hacer la comunidad y qué requiere coordinación municipal, provincial, nacional o entre territorios, validando cada caso. Incluir cuencas, corredores y redes funcionales cuando sean relevantes.
- [ ] **E6.3 · Síntesis nacional por objetivos.** Publicar futuro deseado, evidencia territorial, variantes, recursos limitantes, alternativas, tensiones y tareas pendientes. Una selección editorial se identifica como tal; popularidad no decide urgencia automáticamente.
- [ ] **E6.4 · Mandato como lectura derivada.** Enlazar objetivos y acciones a procesos identificados. Publicar versión, alcance, metodología, límites y revisión. Mantener separados reclamos corroborados, acuerdos de participantes y propuestas sin deliberar.
- [ ] **E6.5 · Documento compartible.** Exportar una versión citable con fecha, territorio, filtros, fuentes y advertencias. Un enlace a la vista actual no se presenta como copia inmutable de una revisión histórica. Aplicar retiro y redacción a contenido sensible también en las vistas históricas públicas.

**Salida E6:** un lector puede recorrer desde una prioridad de la síntesis hasta las fichas, argumentos y fuentes que la sostienen, y encontrar diferencias entre territorios. La presentación explica a quiénes comprende y a quiénes todavía no escuchó.

## 10. E7 — Escenarios, solo cuando haya una pregunta concreta

- [ ] Conectar una alternativa con un modelo pertinente: presupuesto, tiempos, disponibilidad o acceso, según datos realmente disponibles.
- [ ] Mostrar escenario de referencia, parámetros, procedencia, rangos, sensibilidad y límites. Distinguir ejercicio exploratorio de predicción validada.
- [ ] Conservar la separación entre registros reales, ejemplos y resultados sintéticos; no modificar las enmiendas de ejemplos por conveniencia visual.
- [ ] Evitar una única puntuación de «mejor país»: mostrar efectos en varias dimensiones y posibles perjudicados.

**Salida E7:** cambiar un supuesto explica qué resultado cambia y por qué. Si no hay base para estimar una consecuencia, el modelo lo declara.

## 11. Diseño de datos y contratos propuestos

Los nombres siguientes son propuestas, no tablas ya existentes. Se crean por entrega y no todos juntos.

| Entidad | Datos mínimos | Decisión de integración |
|---|---|---|
| Ficha territorial | ID público, título, ámbito, temas, estado, versión | Dominio nuevo relacionado con geografía y señales |
| Vinculación | Ficha, señal/fuente, función, creador y revisión | Referencia al original; admite retiro y reclasificación |
| Fuente y observación | Procedencia, fecha, unidad, ámbito, valor/ausencia, versión | Recurso de datos separado del testimonio |
| Objetivo colectivo | Resultado, horizonte, indicador, base, meta, método | Dominio colectivo; no reutilizar objetivos personales |
| Detalle de capacidad | Señal, unidad, cantidad, vigencia, restricciones | Extensión tipada del recurso o práctica canónica |
| Alternativa | Objetivo, mecanismo, costos, efectos, dependencias, versión | Puede enlazar un PLAN; no hereda aprobación |
| Proceso y aportes deliberativos | Ámbito, reglas, fechas, argumentos, objeciones y cierre | Operación diferente de confirmar una señal |
| Acción | Iniciativa, tarea/hito, aceptación, evidencia, resultado | Reutilizar ejecución de iniciativas y completar lo que falte |
| Relación entre fichas | Origen, destino, tipo, evidencia, estado | Relación SQL, sin nuevo motor de grafos |

**Lectura pública:** lista blanca de campos y precisión autorizada. **Administración:** permisos por rol y ámbito, comprobados en servidor. **Escrituras:** validación compartida, CSRF/autenticación según contrato, idempotencia y revisión esperada para detectar edición concurrente. **Auditoría:** historial interno protegido; las revisiones públicas no recuperan datos retirados. **Actores:** las identidades anónima, autenticada e institucional no se fusionan por inferencia.

**Contratos de lectura:** filtros canónicos; fecha de corte; unidad contada; total coincidente; cantidad cargada; completitud; procedencia; cobertura. Mantener compatibilidad con consumidores existentes y versionar cambios incompatibles.

## 12. Pruebas y publicación por entrega

1. Pruebas unitarias para reglas con consecuencias: conteos, compatibilidad de unidades, estados, retiro, permisos y conflictos de edición.
2. Al menos una prueba de integración por endpoint nuevo, en Postgres de test aislado. Incluir casos negativos relevantes; el endpoint no se considera validado solo porque responde 200.
3. Pruebas de componentes para interacciones no triviales y recorridos completos de mapa/lista, aporte/recibo, ficha, deliberación y acción.
4. Verificación visual y accesible en los tamaños de E2, junto a falla de red y carga parcial. Medir rendimiento antes/después con corpus de prueba suficientemente grande y un perfil de dispositivo/red declarado.
5. Migraciones aditivas, con identificadores asignados por el sistema existente, ensayadas fuera de producción. Evitar eliminar orígenes anteriores hasta completar conciliación y compatibilidad.
6. Ejecutar las comprobaciones requeridas del repositorio y `pnpm verify` al cerrar la entrega. Si hay fallas, distinguir las previas de las nuevas y resolver lo requerido; no declarar verde una comprobación incompleta.
7. Publicar por entregas con seguimiento de errores y posibilidad de volver a la interfaz anterior conservando registros. Confirmar entorno y mecanismo de despliegue vigentes antes de ejecutar; este plan no ejecuta publicaciones.

No se reescriben archivos ajenos a cada entrega ni se incorporan cambios de otras sesiones. Las modificaciones de producto quedan documentadas en la spec y las deudas se cierran con evidencia.

## 13. Indicadores para decidir si avanzar

| Indicador | Definición | Uso |
|---|---|---|
| Comprensión inicial | Participantes de prueba que distinguen dato, propuesta y ausencia / participantes observados | Mejorar navegación y lenguaje; nunca inferir opinión nacional |
| Aporte con destino | Aportes vinculados a una ficha o tarea / aportes del piloto | Detectar capturas que quedan sin seguimiento |
| Objetivo verificable | Objetivos publicados con base, meta y método, o pendientes explícitos con tarea | Evitar promesas sin forma de revisión |
| Síntesis trazable | Afirmaciones de una muestra revisada con fuente/argumento accesible / afirmaciones revisadas | Detectar interpretaciones sin respaldo |
| Disenso conservado | Objeciones sustantivas con respuesta o estado pendiente visible | Evitar consenso fabricado |
| Resultado confirmado | Necesidades verificadas con resolución confirmada, con ámbito y período | Métrica de resultado principal |
| Calidad de datos | Consultas fallidas/parciales correctamente señaladas; fuentes vigentes y retiros propagados | Condición de confianza |

Los valores iniciales se miden en E0/E2; no se inventa una línea de base. El objetivo 4/5 de usabilidad es un umbral exploratorio. Las métricas de uso serán agregadas y mínimas, sin almacenar texto sensible ni crear rankings individuales.

## 14. Primera cola de trabajo concreta

| Orden | Cambio revisable | Depende de | Evidencia de cierre |
|---|---|---|---|
| 1 | Contrato de estados + error/vacío en todos los modos | E0.1–E0.4 | Falla de red no genera cero ni silencio |
| 2 | Conteos y paginación con completitud | 1 + contrato de orígenes | Prueba de 1.201 registros y filtros coherentes |
| 3 | Corregir brechas, unidades y lenguaje de auditoría | E0.3 | Casos de unidades incompatibles y scroll |
| 4 | Consentimiento, reintentos y recibo | E0.3 | Envío/reintento/retiro consistentes |
| 5 | Entrada del mapa, búsqueda territorial y lista | 1–2 | Recorrido de exploración en móvil y escritorio |
| 6 | Ficha borrador con señales, versiones y permisos | 5 | Aporte enlazado y edición concurrente protegida |
| 7 | Contexto mínimo de fuentes y capacidades | 6 | Fuente visible y recurso con vigencia |
| 8 | Objetivo, alternativas, deliberación y acción del piloto | 6–7 | Circuito E4–E5 completo |

Cada fila puede dividirse en varios cambios pequeños; no obliga a un único commit. Las filas 3 y 4 no dependen de terminar la 2. La selección de interlocutores del piloto y fuentes puede avanzar mientras se desarrolla E1; no se envían invitaciones automáticamente.

## 15. Decisiones que se pueden ajustar sin frenar E1

- **Territorios y temas:** elegir por interlocutores, evidencia disponible y posibilidad de comprobar una acción, no solo por volumen de visitas.
- **Nombre visible de la ficha:** «Ficha de futuro» es el nombre de trabajo; validarlo con participantes antes de extenderlo a toda la navegación.
- **Horizonte nacional:** cada objetivo admite su propio horizonte; no imponer un año único sin discusión.
- **Equipo y calendario:** estimar E2–E5 después del inventario y una primera entrega; separar desarrollo, facilitación y tiempos reales de resultados.
- **Responsabilidad de síntesis:** identificar quién facilita, revisa y publica durante el piloto. La ausencia de un líder político no elimina la responsabilidad operativa.

El siguiente trabajo de implementación queda definido por las primeras cuatro filas: corregir la confianza del instrumento y del mandato antes de pedirles conclusiones nuevas.
