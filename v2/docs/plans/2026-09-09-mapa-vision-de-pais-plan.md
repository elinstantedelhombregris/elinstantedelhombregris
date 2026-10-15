# Plan detallado de mejoras: del mapa de voces a una visión de país

Fecha: 2026-09-09. Estado: en implementación; última comprobación del mapa: 2026-10-13; capacidades, comparación y ejecución: 2026-10-14. Las casillas abiertas requieren implementación o verificación específica; no significan que todos sus componentes estén ausentes.

Spec: [mapa y visión de país](../specs/2026-09-09-mapa-vision-de-pais.md). Diagnóstico: [análisis previo](../analisis/2026-09-08-web-v2-vision-de-pais.md).

## 1. Objetivo y forma de trabajar

Construir un circuito completo: **explorar → comprender → aportar → formular un futuro → comparar alternativas → acordar con alcance explícito → actuar → comprobar → revisar**.

El trabajo se organiza en entregas utilizables. Cada entrega tiene un responsable funcional, dependencias y una prueba de salida. Los roles describen trabajo necesario; no presuponen personas contratadas. No hay fechas de publicación comprometidas: primero se mide la base técnica y se acuerda disponibilidad de equipo y participantes. Las etapas de campo requieren tiempo humano además de desarrollo.

Roles: **Producto** define alcance y lenguaje; **Diseño** resuelve interacción y accesibilidad; **Desarrollo** implementa datos e interfaz; **Datos** valida fuentes y comparabilidad; **Territorio** convoca y facilita; **Verificación** comprueba comportamiento y resultados. Una misma persona puede cubrir varios roles, pero nadie valida por sí solo sus propios hechos cuando el protocolo exige corroboración independiente.

## 2. Entregas y dependencias

| Entrega                             | Resultado visible                                                                            | Depende de                                            | Responsable principal              |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------- |
| E0. Base y decisiones               | Alcance, contratos y limitaciones conocidos                                                  | Diagnóstico                                           | Producto + Desarrollo              |
| E1. Confianza                       | El mapa diferencia fallas, ausencia y datos parciales; las métricas no inventan conclusiones | E0                                                    | Desarrollo + Verificación          |
| E2. Exploración y fichas            | Encontrar un lugar, entenderlo y abrir una ficha con aportes trazables                       | E1                                                    | Diseño + Desarrollo                |
| E3. Evidencia y capacidades         | Contrastar relatos con fuentes, conocer recursos y planificar escucha                        | E2; catálogo de datos puede prepararse desde E0       | Datos + Territorio                 |
| E4. Objetivos y deliberación        | Formular metas, comparar alternativas y publicar acuerdos con disensos                       | E2 + contexto mínimo de E3                            | Producto + Territorio + Desarrollo |
| E5. Acciones y piloto               | Responsables aceptan tareas y la comunidad comprueba resultados                              | E4; estructura de ejecución puede prepararse desde E2 | Territorio + Desarrollo            |
| E6. Visión nacional                 | Conectar objetivos y tensiones entre territorios                                             | Evidencia del piloto E5                               | Producto + Datos + Territorio      |
| E7. Escenarios, ampliación opcional | Explorar consecuencias de alternativas con supuestos públicos                                | E6 + datos adecuados al modelo                        | Datos + Desarrollo                 |

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
- [x] Si falla la geometría pero existen registros, conservar lista y explicar que el mapa no está disponible. _(13/10: carga compartida y validada de límites provinciales, aviso y reintento; también fallos de teselas en ambos lados de Simulación. El reintento conserva la lista y los borradores.)_

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

- [x] Crear una ficha con título/pregunta, territorio, temas, situación, futuro deseado y próxima tarea de investigación.
- [x] Vincular señales mediante identificadores públicos y relaciones explícitas: describe, contradice, aporta evidencia o capacidad. Conservar la fuente; no copiar todo el corpus a otro dominio.
- [x] Mostrar los apartados incompletos como pendientes y permitir preguntas sin una conclusión prematura.
- [x] Agregar revisión numerada, historial de cambios y aviso de conflicto si otra persona editó mientras tanto.
- [x] Definir quién puede proponer cambios, revisar y publicar; colaboradores autenticados para administrar fichas, aportes anónimos conservados según el contrato vigente. No conectar identidades automáticamente.

**Salida E2:** una persona nueva encuentra un lugar, entiende la diferencia entre registros y evidencia, consulta una ficha y aporta sin perder el contexto. Objetivo de prueba inicial: 4 de 5 participantes nuevos completan ese recorrido sin ayuda; es un criterio de usabilidad propuesto, no una medición de representatividad.

## 6. E3 — Incorporar evidencia, capacidades y cobertura útil

### E3.1 · Catálogo mínimo de indicadores

- [ ] Elegir uno o dos temas del piloto y entre tres y cinco indicadores relevantes; no importar indiscriminadamente todos los datos disponibles.
- [x] Para cada serie: institución, enlace, fecha de referencia, fecha de obtención, unidad, universo, territorio, método, licencia, frecuencia esperada y límites de interpretación.
- [ ] Reutilizar el catálogo geográfico y documentar equivalencias entre municipio, departamento, localidad y unidad censal. Una jerarquía simple no resuelve todas las pertenencias.
- [ ] Validar geometrías y bordes. Incorporar departamentos/municipios para las áreas piloto con fuente identificada; mostrar el resto como pendiente en vez de fingir cobertura nacional.
- [x] Versionar importaciones y registrar fallos; una actualización fallida conserva la última versión válida con aviso. Cero, dato no publicado y dato no disponible son estados distintos.

**Fuentes de partida verificadas en el análisis:** [INDEC](https://www.indec.gob.ar/indec/web/Nivel4-Tema-2-41-165?lang=es), [REDATAM](https://redatam.indec.gob.ar/) y [Georef](https://www.argentina.gob.ar/georef). Confirmar disponibilidad y escala de cada conjunto específico al importarlo.

### E3.2 · Capacidades con disponibilidad real

- [x] Extender señales de recurso/práctica mediante detalles tipados: qué ofrece, unidad, cantidad cuando tenga sentido, período, restricciones, alcance, organización que consiente y fecha de última confirmación.
- [x] No convertir el catálogo editorial `resources` en inventario de stock.
- [x] Proponer vínculos entre una necesidad y un recurso compatible. La aceptación debe ser explícita por las partes que intervienen; cercanía no prueba compatibilidad.
- [x] Diferenciar disponibilidad declarada, reservada y entrega confirmada. Aplicar reserva transaccional cuando un recurso sea divisible y cuantificable, evitando ofrecer dos veces la misma capacidad.

Implementado el 14/10 en `/capacidades`: ofertas ligadas a señales propias, aceptación bilateral, reservas serializadas por capacidad y recepción confirmada. Solicitudes privadas para las dos partes; ejemplo interactivo separado del corpus. Migraciones 0033–0034 preparadas; despliegue pendiente. Recepción parcial con aceptación de cantidad y control de revisión: solo se libera el saldo después de confirmar. [Especificación](../specs/2026-10-14-capacidades-y-reservas.md).

### E3.3 · Cobertura que orienta la escucha

- [x] Separar presencia de registros, vigencia de observaciones y alcance de relevamientos. No presentarlos como porcentaje de población representada.
- [ ] Usar unidades estables y su versión para comparaciones; recortar por el territorio pertinente y distinguir áreas no habitadas cuando haya información adecuada.
- [x] Tratar señales provinciales, sin punto y con precisión reducida según su alcance; no afirmar que verifican una celda exacta.
- [x] Generar tareas de escucha con objetivo, zona, método, responsable que acepta, fecha y resultado. Conectar reservas y sincronización del cuaderno web, verificando autorización y protección de notas privadas.
- [x] Conectar también las tareas de iniciativas con el circuito de campo nativo. Credencial limitada y revocable desde la web, descarga de tareas propias, SQLite por cuenta/origen, autorización separada, recibos y retiro. Sin importación de notas privadas. Ver especificación `2026-10-14-campo-nativo-y-devolucion.md`; queda la comprobación en teléfonos físicos y la configuración de despliegue.
- [x] Describir procedencia presencial o digital y límites de convocatoria sin crear perfiles públicos sensibles.

**Salida E3:** cada cifra abre su fuente; no se ofrece zoom analítico más preciso que los datos; una ficha puede mostrar evidencia contradictoria; una zona poco relevada produce una tarea de escucha, no una afirmación sobre lo que piensa su población.

## 7. E4 — Formular objetivos y deliberar alternativas

### E4.1 · Objetivos colectivos verificables

- [x] Agregar resultado deseado, horizonte, indicador, línea de base, meta, unidad y método de verificación. Admitir «línea de base pendiente» con una tarea para establecerla.
- [x] Registrar población/ámbito afectado, institución competente propuesta y principios que orientan la decisión. La competencia se valida; el sistema no asigna obligaciones a terceros.
- [x] Mantener separados frecuencia de menciones, gravedad documentada, desigualdad y viabilidad. No calcular una prioridad total con pesos ocultos.
- [x] Permitir objetivos que atraviesan varios temas y lugares.

### E4.2 · Alternativas comparables

- [x] Ofrecer una plantilla común: mecanismo, beneficiarios, afectados, capacidades necesarias, costo estimado y fuente, plazo, dependencias, efectos adversos e incertidumbre.
- [x] Comparar dos o más alternativas cuando existan; incluir mantener la situación actual cuando ayude a entender consecuencias.
- [x] Enlazar planes editoriales como referencias, sin preseleccionarlos como respuesta de la comunidad.
- [x] Mantener distinta la propuesta original de cada versión revisada y mostrar qué objeción motivó un cambio.

Implementado el 14/10: detalle común, costos con fuente y unidad/período, comparación de dos a cuatro propuestas, referencia explícita a situación actual y revisiones enlazadas a objeciones activas. El original se conserva; si se retira la objeción, el fundamento asociado se oculta. [Especificación](../specs/2026-10-14-alternativas-comparables.md).

### E4.3 · Proceso deliberativo y moderación

- [x] Abrir un proceso con pregunta, ámbito, convocatoria, responsables de facilitación, fechas, reglas de participación y forma prevista de cierre.
- [ ] Registrar argumentos, evidencia, objeciones, respuestas y modificaciones. Las adhesiones continúan siendo adhesiones.
- [x] Publicar política de moderación, motivos de intervenciones y mecanismo de apelación; ocultar contenido sensible sin replicarlo en el historial público.
- [x] Identificar cómo se contaron participantes y límites frente a duplicaciones; no llamar persona verificada al identificador de navegador. Aplicar permisos y límites contra abuso en escrituras.
- [x] Primer cierre: síntesis facilitada y revisable con participantes y objeciones explícitos. La votación vinculante queda fuera de esta primera versión; cualquier mecanismo posterior requiere definir elegibilidad y reglas antes de abrirlo.

### E4.4 · Síntesis trazable

- [x] Publicar acuerdos parciales, alternativas discutidas, disensos pendientes, ausencias y próxima revisión.
- [ ] Vincular cada afirmación con evidencia o argumentos. La IA puede sugerir redacción y agrupaciones; una persona responsable valida su publicación.
- [ ] Usar Radiografía para descubrir relaciones temáticas, conservando posibilidad de dividir o rechazar agrupaciones.
- [ ] Retirar mensajes de «deliberación no disponible» solo en los ámbitos donde el circuito esté operativo. Mantener una explicación clara para el resto.

**Salida E4:** una objeción puede cambiar una alternativa y quedar visible en la síntesis. Se sabe quién participó según la unidad realmente medida, qué regla se usó y qué diferencias siguen abiertas. El producto no atribuye el resultado al país entero.

## 8. E5 — Ejecutar, comprobar y evaluar el piloto

### E5.1 · Acciones aceptadas y seguimiento

- [x] Vincular la alternativa a una iniciativa existente o nueva, con tarea, hito, responsable que acepta, fecha y recursos comprometidos.
- [x] Completar servicios de iniciativas que falten: creación/edición autorizada, tareas, evidencia y transiciones. Reutilizar tablas existentes tras revisar si expresan aceptación y verificación suficientes.
- [x] Distinguir tarea terminada, entrega declarada y resultado confirmado. Un plazo vencido informa vencimiento; no acusa incumplimiento sin el protocolo correspondiente.
- [x] Solicitar evidencia mínima pertinente y corroboración independiente cuando aplique. No publicar rostros, domicilios ni documentos sensibles por defecto.
- [x] Devolver el resultado a la ficha vinculada explícitamente con la tarea y avisar a sus seguidores según sus preferencias. Se conserva procedencia, ausencias, límites y revisión; retirar la evidencia retira su contenido de la ficha. La formulación del futuro sigue requiriendo edición deliberada.

Avance técnico del 14/10 en E5.1: las pruebas de alternativas pueden crear una iniciativa comunitaria o vincularse a una que se administra, con tarea e hito. Una persona integrante acepta su responsabilidad; los pasos de la prueba actualizan la tarea y la revisión del resultado actualiza el hito. Permisos, idempotencia y concurrencia comprobados en Postgres local. La administración general y las tareas independientes se completan en la entrega de escucha descrita al final. La asociación detallada de reservas a tareas se completa en la entrega de campo registrada al final. [Especificación](../specs/2026-10-14-ejecucion-de-alternativas.md). Migración 0035 preparada, sin aplicar a producción.

### E5.2 · Piloto territorial

- [ ] Seleccionar tres contextos por contraste: urbano, localidad intermedia y rural. Es una propuesta de diseño del piloto, no una muestra nacional; elegir lugares con interlocutores disponibles.
- [ ] Acordar uno o dos temas con una pregunta verificable y posibilidad de acción. Los pilotos de luminarias y ollas previstos en la Constitución son candidatos a evaluar, no comunidades ya comprometidas.
- [ ] Realizar una sesión de exploración y escucha, una de formulación/comparación y una revisión posterior de acciones. Registrar invitación, ausencias y límites.
- [ ] Evaluar comprensión, abandono de captura, vinculación de aportes, calidad de síntesis y confirmación de resultados. Documentar observaciones, no solo tasas.
- [ ] Corregir los obstáculos observados antes de extender el alcance a más lugares.

**Salida E5:** cada territorio conserva una ficha revisada, un objetivo, alternativas o justificación de su ausencia, diferencias explícitas y una acción aceptada. Para demostrar el circuito completo debe haber al menos un resultado confirmado; si no lo hay, el piloto sigue en aprendizaje y no se declara éxito por tener más publicaciones.

## 9. E6 — Construir la primera visión de país

- [x] **E6.1 · Relaciones entre fichas.** Conectar objetivos compartidos, dependencias, complementariedades y tensiones. Usar relaciones tipadas en Postgres antes de considerar infraestructura especializada. Una relación causal sugerida conserva estado de hipótesis y fuente.
- [ ] **E6.2 · Escalas de decisión.** Mostrar qué puede hacer la comunidad y qué requiere coordinación municipal, provincial, nacional o entre territorios, validando cada caso. Incluir cuencas, corredores y redes funcionales cuando sean relevantes.
- [x] **E6.3 · Síntesis nacional por objetivos.** Publicar futuro deseado, evidencia territorial, variantes, recursos limitantes, alternativas, tensiones y tareas pendientes. Una selección editorial se identifica como tal; popularidad no decide urgencia automáticamente.
- [x] **E6.4 · Mandato como lectura derivada.** Enlazar objetivos y acciones a procesos identificados. Publicar versión, alcance, metodología, límites y revisión. Mantener separados reclamos corroborados, acuerdos de participantes y propuestas sin deliberar.
- [x] **E6.5 · Documento compartible.** Exportar una versión citable con fecha, territorio, filtros, fuentes y advertencias. Un enlace a la vista actual no se presenta como copia inmutable de una revisión histórica. Aplicar retiro y redacción a contenido sensible también en las vistas históricas públicas.

**Salida E6:** un lector puede recorrer desde una prioridad de la síntesis hasta las fichas, argumentos y fuentes que la sostienen, y encontrar diferencias entre territorios. La presentación explica a quiénes comprende y a quiénes todavía no escuchó.

## 10. E7 — Escenarios, solo cuando haya una pregunta concreta

- [x] Conectar una alternativa con un modelo pertinente: presupuesto, tiempos, disponibilidad o acceso, según datos realmente disponibles.
- [x] Mostrar escenario de referencia, parámetros, procedencia, rangos, sensibilidad y límites. Distinguir ejercicio exploratorio de predicción validada.
- [x] Conservar la separación entre registros reales, ejemplos y resultados sintéticos; no modificar las enmiendas de ejemplos por conveniencia visual.
- [x] Evitar una única puntuación de «mejor país»: mostrar efectos en varias dimensiones y posibles perjudicados.

**Salida E7:** cambiar un supuesto explica qué resultado cambia y por qué. Si no hay base para estimar una consecuencia, el modelo lo declara.

## 11. Diseño de datos y contratos propuestos

Los nombres siguientes son propuestas, no tablas ya existentes. Se crean por entrega y no todos juntos.

| Entidad                         | Datos mínimos                                               | Decisión de integración                                      |
| ------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| Ficha territorial               | ID público, título, ámbito, temas, estado, versión          | Dominio nuevo relacionado con geografía y señales            |
| Vinculación                     | Ficha, señal/fuente, función, creador y revisión            | Referencia al original; admite retiro y reclasificación      |
| Fuente y observación            | Procedencia, fecha, unidad, ámbito, valor/ausencia, versión | Recurso de datos separado del testimonio                     |
| Objetivo colectivo              | Resultado, horizonte, indicador, base, meta, método         | Dominio colectivo; no reutilizar objetivos personales        |
| Detalle de capacidad            | Señal, unidad, cantidad, vigencia, restricciones            | Extensión tipada del recurso o práctica canónica             |
| Alternativa                     | Objetivo, mecanismo, costos, efectos, dependencias, versión | Puede enlazar un PLAN; no hereda aprobación                  |
| Proceso y aportes deliberativos | Ámbito, reglas, fechas, argumentos, objeciones y cierre     | Operación diferente de confirmar una señal                   |
| Acción                          | Iniciativa, tarea/hito, aceptación, evidencia, resultado    | Reutilizar ejecución de iniciativas y completar lo que falte |
| Relación entre fichas           | Origen, destino, tipo, evidencia, estado                    | Relación SQL, sin nuevo motor de grafos                      |

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

| Indicador            | Definición                                                                                   | Uso                                                           |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Comprensión inicial  | Participantes de prueba que distinguen dato, propuesta y ausencia / participantes observados | Mejorar navegación y lenguaje; nunca inferir opinión nacional |
| Aporte con destino   | Aportes vinculados a una ficha o tarea / aportes del piloto                                  | Detectar capturas que quedan sin seguimiento                  |
| Objetivo verificable | Objetivos publicados con base, meta y método, o pendientes explícitos con tarea              | Evitar promesas sin forma de revisión                         |
| Síntesis trazable    | Afirmaciones de una muestra revisada con fuente/argumento accesible / afirmaciones revisadas | Detectar interpretaciones sin respaldo                        |
| Disenso conservado   | Objeciones sustantivas con respuesta o estado pendiente visible                              | Evitar consenso fabricado                                     |
| Resultado confirmado | Necesidades verificadas con resolución confirmada, con ámbito y período                      | Métrica de resultado principal                                |
| Calidad de datos     | Consultas fallidas/parciales correctamente señaladas; fuentes vigentes y retiros propagados  | Condición de confianza                                        |

Los valores iniciales se miden en E0/E2; no se inventa una línea de base. El objetivo 4/5 de usabilidad es un umbral exploratorio. Las métricas de uso serán agregadas y mínimas, sin almacenar texto sensible ni crear rankings individuales.

## 14. Primera cola de trabajo concreta

| Orden | Cambio revisable                                         | Depende de               | Evidencia de cierre                             |
| ----- | -------------------------------------------------------- | ------------------------ | ----------------------------------------------- |
| 1     | Contrato de estados + error/vacío en todos los modos     | E0.1–E0.4                | Falla de red no genera cero ni silencio         |
| 2     | Conteos y paginación con completitud                     | 1 + contrato de orígenes | Prueba de 1.201 registros y filtros coherentes  |
| 3     | Corregir brechas, unidades y lenguaje de auditoría       | E0.3                     | Casos de unidades incompatibles y scroll        |
| 4     | Consentimiento, reintentos y recibo                      | E0.3                     | Envío/reintento/retiro consistentes             |
| 5     | Entrada del mapa, búsqueda territorial y lista           | 1–2                      | Recorrido de exploración en móvil y escritorio  |
| 6     | Ficha borrador con señales, versiones y permisos         | 5                        | Aporte enlazado y edición concurrente protegida |
| 7     | Contexto mínimo de fuentes y capacidades                 | 6                        | Fuente visible y recurso con vigencia           |
| 8     | Objetivo, alternativas, deliberación y acción del piloto | 6–7                      | Circuito E4–E5 completo                         |

Cada fila puede dividirse en varios cambios pequeños; no obliga a un único commit. Las filas 3 y 4 no dependen de terminar la 2. La selección de interlocutores del piloto y fuentes puede avanzar mientras se desarrolla E1; no se envían invitaciones automáticamente.

## 15. Decisiones que se pueden ajustar sin frenar E1

- **Territorios y temas:** elegir por interlocutores, evidencia disponible y posibilidad de comprobar una acción, no solo por volumen de visitas.
- **Nombre visible de la ficha:** «Ficha de futuro» es el nombre de trabajo; validarlo con participantes antes de extenderlo a toda la navegación.
- **Horizonte nacional:** cada objetivo admite su propio horizonte; no imponer un año único sin discusión.
- **Equipo y calendario:** estimar E2–E5 después del inventario y una primera entrega; separar desarrollo, facilitación y tiempos reales de resultados.
- **Responsabilidad de síntesis:** identificar quién facilita, revisa y publica durante el piloto. La ausencia de un líder político no elimina la responsabilidad operativa.

El siguiente trabajo de implementación queda definido por las primeras cuatro filas: corregir la confianza del instrumento y del mandato antes de pedirles conclusiones nuevas.

## Continuación del 13 de octubre de 2026

El repositorio ya contiene trabajo posterior al plan inicial (campañas, captura guiada, fichas y gestión de aportes). Esta continuación reutiliza esas implementaciones y cierra dos defectos de E1/E2:

- **Recuperación del dibujo.** Mapa, Análisis y Simulación comparten una descarga validada de límites provinciales. Una respuesta HTTP fallida, JSON incompatible o geometría vacía produce un aviso y un reintento. Una actualización fallida conserva la última geometría válida. Los errores de teselas de ambos mapas de la cortina también llegan al aviso. Reintentar el dibujo no desmonta el formulario.
- **Continuidad territorial.** El identificador del lugar en la URL determina también el alcance de las fichas y del aporte. Abrir el formulario desde un enlace no borra ese contexto. Mientras se resuelve el lugar, o si falla su carga, no se muestran fichas nacionales como sustitución ni se habilita una publicación con el territorio anterior. Los dos borradores se conservan y hay reintento explícito.
- **Unidad de lectura.** La explicación de «Por habitante» habla de aportes por población de referencia; dejó de describir ese cociente como cantidad de personas participantes.

Pruebas específicas: `Instrumento.test.tsx`, `geometria-provincial.test.tsx`, `AmbitosProvinciales.test.tsx`, `simulacion-reloj.test.tsx`, `ElMapa.test.tsx` y `ParticiparEnMapa.test.tsx`. Incluyen los tres modos con límites provinciales, archivo geográfico real, fallos HTTP y de conexión, recuperación, conservación de borradores, enlace territorial y limpieza de filtros.

Verificación del 13/10: lint y TypeScript del workspace, 2.391 pruebas unitarias, 244 pruebas de scripts, 631 pruebas de integración aprobadas (20 omitidas por sus condiciones existentes), control del corpus de entrenamientos y compilación web/API. Integración ejecutada con `pnpm test:integration:local`: dos bases locales temporales, eliminadas al terminar. La comprobación final del mapa y sus formularios pasó 219 pruebas. El control de entrenamientos se ejecutó con `node --import tsx scripts/content/entrenamientos-check.ts` porque el entorno restringe el socket interno del ejecutable `tsx`. No se ejecutó un despliegue ni una nueva revisión visual manual.

Esto no completa E3–E7 ni valida el piloto territorial. Siguen pendientes su elección de lugares e interlocutores, evidencia de campo, deliberación y resultados comprobados; no se incorporaron datos sintéticos al mapa público.

## Continuación del 14 de octubre de 2026

El usuario eligió ejemplos cotidianos para explicar el piloto. Se implementaron recorridos de **turnos de salud, transporte cotidiano y continuidad del agua**, accesibles desde el mapa y las fichas. Cada recorrido explica siete operaciones, compara alternativas y prepara una pregunta propia sin copiar situaciones, cifras ni resultados ficticios. No hubo siembra de estos ejemplos en el mapa público.

La entrega añade:

- **Cuaderno versionado:** fuentes y objetivos con metadatos, base, meta, fecha, escala, competencia propuesta y límites. Cero, dato no publicado y dato no disponible se distinguen; un fallo de actualización puede documentarse conservando el valor anterior. La carga es manual: no completa importaciones automatizadas ni validación de indicadores del piloto.
- **Conversación de la ficha:** reglas, fechas, convocatoria, facilitación, argumentos, objeciones, evidencia, respuestas y síntesis con acuerdos referenciados, disensos y ausencias. Autoría autenticada privada, firma pública declarada, permisos de edición existentes y retiros con motivo. La síntesis que cita una intervención retirada queda oculta hasta revisión. No hay votación vinculante ni verificación automática de identidades.
- **Conexiones y lectura conjunta:** relaciones tipadas y justificadas entre fichas; hipótesis causales con fuente. `/vision-compartida` muestra objetivos y revisiones por territorio, distingue propuesta y síntesis, conserva totales completos frente a páginas cargadas y permite imprimir la lectura actual. Es una base para trabajar E6, no una síntesis nacional representativa ya lograda.
- **Continuidad:** el cuaderno, proceso y síntesis fijan la revisión al abrir el editor, mantienen borradores ante errores y conflictos, y sus cambios entran en el historial y las notificaciones de seguimiento existentes. Las intervenciones propias permiten recuperar la ficha desde Mi espacio.

Migración `0032_fichas_deliberacion`: tablas de argumentos y relaciones, claves para reintentos y permisos comprobados en escritura. La cadena de snapshots continúa desde `0031`. Se amplió la guarda de limpieza de fixtures para respetar intervenciones ajenas.

Recorrido de operación y límites: [guía de ejemplos y fichas](../demos/2026-10-14-recorrido-fichas.md). Pruebas nuevas: `evidencia-deliberacion.test.ts`, `deliberacion-fichas.test.ts`, `Cuaderno.test.tsx`, `Deliberacion.test.tsx`, `Relaciones.test.tsx`, `Ejemplos.test.tsx`, `TerritorioDocumentado.test.tsx` y `VisionCompartida.test.tsx`.

Pendientes del plan que esta entrega no cierra: capacidades y reservas, tareas de escucha, importaciones verificadas, versiones y comparación más detallada de alternativas, servicios completos de iniciativas, piloto con personas reales y modelos de escenarios. Las casillas abiertas conservan esos requisitos. No se aplicó la migración a producción ni se desplegó esta entrega.

Verificación final del 14/10: **`pnpm verify` aprobado** con dos bases PostgreSQL locales descartables y limpieza automática; incluye lint, TypeScript, 2.417 pruebas unitarias, 244 pruebas de scripts, 638 pruebas de integración aprobadas (20 omitidas por sus condiciones existentes), control de entrenamientos y compilación web/API. Los casos de integración nuevos incluyen paginación de 205 intervenciones, reintentos de publicación y retiro, referencias cruzadas inválidas, permisos y ocultación de síntesis tras retiros. La revisión del navegador usó respuestas simuladas: ejemplos, ficha y visión sin scroll horizontal a 360, 390, 768 y 1440 píxeles; navegación a nueva ficha sin escrituras, edición de objetivo y recuperación de error comprobadas, sin errores de JavaScript.

## Escucha y administración — continuación del 14 de octubre

Implementadas la escucha territorial y la administración de iniciativas de punta a punta, con la migración 0036 preparada. El detalle está en [la especificación](../specs/2026-10-14-administracion-y-escucha.md) y [el recorrido de operación](../demos/2026-10-14-escucha-e-iniciativas.md).

- Crear y editar propósito/estado, administrar roles y proponer transferencia de propiedad con aceptación. Ingreso/salida atómicos y mensajes de fallo visibles; la migración concilia contadores anteriores.
- Crear hitos y tareas, aceptar personalmente una responsabilidad, iniciar/pausar/retomar/liberar, declarar ejecución y publicar evidencia mínima. Una cuenta distinta de creador, responsable y autor revisa; su cuenta no prueba independencia personal. Retirar evidencia limpia texto/enlace y revisión y reabre resultados completados.
- Planear escucha con zona, método, canal, convocatoria, unidad y versión declaradas; informar período, observaciones, ausencias, límites y próximo paso. Las consultas se paginan y un enlace de tarea puede abrir una fila fuera de la primera página.
- Cobertura excluye puntos de precisión reducida de la presencia exacta por celda. La grilla declara que cambia con el encuadre y que incluye áreas no habitadas; no se presenta como cobertura poblacional ni como unidad persistente.
- Ejemplo separado de apoyo escolar: seis pasos en `/iniciativas/ejemplo`, conectado al ejemplo de reservas. No se siembran participantes ni resultados ficticios en la consulta pública.

**Pendientes precisos:** E3.3 conserva abiertas la geografía estable/versionada con recorte de áreas habitadas y la sincronización del trabajo de campo. La unidad declarada en una tarea no sustituye esos datos. E5.1 conserva la asociación detallada de reservas con tareas y la devolución integrada de resultados independientes a fichas/seguimientos. E3.1 requiere fuentes e importaciones verificadas; E5.2 exige trabajo real con interlocutores; E6–E7 conservan la síntesis nacional revisada, exportación citable con redacción y modelos de escenarios. La entrega no completa el plan entero ni se despliega automáticamente.

Verificación de esta entrega: `pnpm verify` aprobado, **3.349 pruebas** y 20 omisiones existentes; lint, tipos, corpus y compilación web/API correctos. Navegador con respuestas simuladas a 360, 390, 768 y 1440 px, aceptación, revisión, fallo y recuperación comprobados. D-129 conserva la intermitencia observada antes de la repetición completa aprobada. D-130 queda resuelta en código. Migración 0036 validada en bases locales, pendiente de producción.

## Entrega del 14/10: reservas por tarea y cuaderno web de campo

Implementado el vínculo entre reservas aceptadas y tareas, incluidas las derivadas de pruebas cuando corresponde la misma ficha. Una reserva completa abastece una sola tarea; su estado y cantidades se leen desde el acuerdo original. Solicitar, aceptar, recibir, ejecutar y revisar conservan efectos diferentes. Las dos partes de la reserva ven la asociación; no se expone su contenido privado al resto del equipo ni al historial público. Desvincular no libera stock.

`/campo` conserva por cuenta y navegador notas privadas y borradores de resultados. La persona abre el cuaderno desde una tarea de escucha, guarda sin red con la pantalla ya cargada y autoriza un resumen específico. La cola conserva un recibo inmutable, comprueba la cuenta en el servidor, detiene conflictos de versión y permite reconciliar respuestas perdidas sin duplicar evidencia. Declaración de ejecución y evidencia se registran atómicamente; la revisión independiente sigue pendiente. Ediciones entre pestañas no reemplazan texto sin guardar.

El ejemplo de apoyo escolar en `/iniciativas/ejemplo` explica reserva de sala, recepción parcial, escucha, resumen autorizado, recuperación de red y revisión. Es ficción identificada y no escribe en el corpus.

**Alcance:** la web necesita cargarse con conexión antes de salir. No se prometen apertura inicial sin red ni sincronización con la app nativa. Los cuadernos permanecen en el navegador y se pueden borrar explícitamente; borrar la copia local no retira evidencia publicada. La migración 0037 está preparada y probada localmente, sin aplicar en producción.

**Pendientes del plan:** interoperabilidad con campo nativo; geografía estable y versionada; importaciones con fuentes verificadas; devolución de resultados independientes a fichas y seguimientos; piloto con interlocutores reales; síntesis por objetivos y escalas de decisión; documento citable con redacción; escenarios con parámetros y límites explícitos. Estos puntos no se consideran resueltos por incorporar el cuaderno.

[Especificación](../specs/2026-10-14-reservas-tareas-campo.md) · [Recorrido de prueba](../demos/2026-10-14-reservas-tareas-campo.md).

Verificación: `pnpm verify` aprobado con **3.364 pruebas** y 20 omisiones existentes; lint, tipos, corpus y compilación correctos. `tests/e2e/campo.spec.ts` aprobado. D-129 conserva el fallo intermitente previo a la corrida completa aprobada.

### Entrega del 14/10 · Campo nativo y devolución

La app nativa puede descargar tareas de escucha asignadas, conservar notas y
resúmenes en SQLite, autorizar el envío y recuperar el mismo recibo tras un
reintento. La credencial se guarda en SecureStore, dura 30 días y puede revocarse
desde `/campo`. La vinculación no depende de la API comunitaria anterior.

Antes de publicar evidencia, quien administra la iniciativa y edita una ficha
puede elegirla como destino. La ficha muestra resultados pendientes, revisados o
retirados, y sus seguidores reciben avisos sin copias del texto. El ejemplo de
apoyo escolar explica el recorrido en `/iniciativas/ejemplo`.

Pendiente de puesta en servicio: aplicar 0038 a un entorno de despliegue, configurar
`EXPO_PUBLIC_V2_API_URL` con el origen HTTPS de v2, distribuir la compilación y
comprobar el circuito en teléfonos físicos. La migración SQLite 0020 corre al abrir
la app actualizada. No se publicaron cambios ni se migró producción en esta entrega.

Siguen abiertos los ítems no marcados arriba: inventario del corpus real, fuentes
verificadas, geometrías versionadas, sesiones y evaluación del piloto, síntesis
por objetivos y escenarios con datos. Los ejemplos no se cuentan como evidencia
de esos trabajos ni como un piloto realizado.

### Entrega 15/10 — Fuentes contrastadas y cartografía con edición

Implementados `/fuentes`, el uso del catálogo en el borrador de una ficha y la identificación de la edición geográfica utilizada por el mapa y la simulación. Selección editorial inicial: cuatro indicadores nacionales del Censo 2022, agrupados en servicios básicos y conectividad; no acredita elección participativa del piloto. Fuente primaria, localizador, universo, fechas, condiciones de uso y huella del original visibles. Una fuente adaptada pierde su referencia contrastada; el servidor rechaza conservarla si cambia el contenido.

Las capas conservan URL inmutable y manifiesto con huellas, cobertura, códigos faltantes y simplificación. Los importadores preparan todo antes de activar, conservan ediciones anteriores y dejan constancia de fallos. El resolvedor de provincias de la API se genera con la misma edición. Datos observados en los archivos conservados: 24 provincias, 528 departamentos, 2.113 áreas municipales; 10 municipales sin código. Sellar la descarga documentada del 22/9 no la presenta como descarga nueva ni como cartografía censal de 2022.

La entrada «Imaginar mi Argentina» ahora explica su propósito de formular un aporte dentro del mapa y recupera la portada de exploración al cerrar. No se multiplicaron formularios ni se cambió el contrato de los enlaces existentes.

**Alcance de E3:** el mecanismo de importaciones versionadas y fallos queda implementado para esta selección y las capas IGN. La conciliación con el catálogo operativo, los radios y áreas habitadas, la comparabilidad entre ediciones y la validación territorial del piloto siguen abiertos. E5.2 y E6–E7 no se consideran completos. Especificación y recorrido: `2026-10-15-fuentes-y-geografia.md` en `specs/` y `demos/`.

Verificación de esta entrega: `pnpm verify` aprobado con **3.384 pruebas** y 20 omisiones existentes, tipos y 342 pruebas de la app nativa aprobados, recorrido en navegador aprobado a 360, 390, 768 y 1440 px. Sin migración nueva ni despliegue a producción.


## Entrega del 15/10: conciliación documental, síntesis revisada y disponibilidad

`/conciliacion-territorial` cruza por nivel y código los nomencladores oficiales del Censo 2022, la edición IGN y el catálogo operativo. Conserva originales y huellas; muestra denominaciones distintas, unidades ausentes, códigos residuales y pertenencias cruzadas. Las diez geometrías municipales sin código quedan visibles sin filtro provincial. Una coincidencia documental no habilita transferir estadísticas entre polígonos. Por eso E3.1 y E3.3 conservan abierta la validación espacial, los radios/áreas habitadas y la comparabilidad temporal.

`/sintesis-nacional` incorpora ediciones editoriales con selección explícita de objetivos, versiones de fichas, alcance, método, ausencias, recursos, alternativas, tensiones y próxima revisión. La publicación requiere otra persona editora de las fichas citadas; no es una auditoría institucional independiente ni un mandato de la población. Las propuestas, acuerdos del proceso y resultados de campo revisados tienen requisitos distintos comprobados por el servidor. El Mandato enlaza esta lectura derivada.

Cada edición identifica las versiones geográfica y censal y comprueba una huella de las unidades operativas citadas. Cambiar fichas/unidades o retirar apoyos oculta el contenido, incluso desde su dirección histórica y en la descarga. El JSON citable incluye selección, fechas, fuentes, advertencias y referencia de edición; una copia descargada previamente no puede revocarse. E6.3–E6.5 quedan implementadas como herramientas. La primera síntesis nacional real sigue dependiendo de procesos y revisión de equipos reales. E6.2 conserva pendiente la validación de competencias, cuencas y corredores de cada caso.

E7 incorpora un primer modelo exploratorio de disponibilidad en cada alternativa: referencia, supuestos o mediciones documentadas, rangos, sensibilidad, horas de equipo, actividades y plazas. Los parámetros reales empiezan vacíos; los inventados solo aparecen en el ejemplo aislado. No calcula impacto ni representación, no reserva recursos y no produce una puntuación de país. La decisión se documenta en la revisión de la alternativa; el cálculo local no persiste.

Ejemplos separados: agua en casa, llegar a la escuela y conseguir un turno, en `/sintesis-nacional/ejemplo`. Migración 0039 preparada y ensayada localmente. El piloto de E5.2, la validación espacial/temporal y los puntos anteriores todavía abiertos no se consideran completados por esta entrega. Especificación y recorrido: `2026-10-15-conciliacion-y-sintesis.md` en `specs/` y `demos/`.

Verificación final de esta entrega: `pnpm verify` aprobado, 3.411 pruebas y 20 omisiones existentes; aplicación nativa con 342 pruebas y tipos aprobados; tres recorridos de navegador aprobados. Las vistas nuevas se comprobaron a 360, 390, 768 y 1440 píxeles. Persisten las limitaciones operativas y de datos descritas; no se desplegó ni se aplicó 0039 a producción.

## Entrega del 15/10: validación espacial y despliegue de esquema

Implementado `/validacion-espacial`, enlazado desde el mapa, Fuentes y Conciliación.
El informe conserva huellas, edición, motor, método, limitaciones y 1.079
observaciones/controles pendientes, con filtros, búsqueda, paginación y descarga.
Se detectaron 11 polígonos inválidos. La importación ahora los rechaza antes de
activar una edición; las geometrías históricas conservan sus bytes y los hallazgos
quedan en D-131. **E3.1 no se marca completo:** falta contrastar y corregir bordes,
homologar cartografía censal e incorporar radios/áreas habitadas.

Por solicitud explícita se desplegaron **0032–0039 en la base v2**. Se verificó el
historial, guardó respaldo privado, restauró en PostgreSQL local y ensayó la cadena
con reintento idempotente. Comprobación posterior: 37 entradas del diario, ninguna
pendiente, 13 columnas y siete restricciones de síntesis. El comando ya no carga
`.env` y rechaza destinos remotos distintos de v2, cadenas divergentes y aplicación
remota sin destino/revisión explícitos. No se desplegó el código web/API ni la app
nativa por esta operación.

El inventario real del 15/10 confirma el corpus cívico vacío y el cruce documental
municipal (2.080 coincidencias, 23 solo IGN, dos solo catálogo y diez geometrías sin
código). E0.1 avanza con esa lectura fechada; conserva pendiente la comprobación
operativa de crons y consumidores desplegados. Ningún ejemplo se sembró como dato.

Recorridos y evidencia: [validación y despliegue](../demos/2026-10-15-validacion-espacial-y-despliegue.md)
y [inventario operativo](../demos/2026-10-15-inventario-operativo.md). El piloto con
interlocutores y resultados reales (E5.2), competencias/cuencas/corredores (E6.2),
bordes corregidos y comparabilidad censal/temporal siguen requiriendo trabajo
externo verificable. Las demás casillas abiertas anteriores tampoco se cierran
por este despliegue de esquema.

Verificación de esta entrega: `pnpm verify` aprobado (3.419 pruebas, 20 omisiones
preexistentes), seis pruebas geométricas y cinco recorridos de navegador aprobados;
tipos nativos correctos. Vista móvil inspeccionada. D-129 conserva el registro del
fallo intermitente anterior a la corrida completa aprobada.
