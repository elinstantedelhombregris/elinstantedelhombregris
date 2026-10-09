# Propuesta de modificaciones de v2 para el diseño idealizado

Fecha: 8 de octubre de 2026. Estado: especificación implementada y verificada en v2 local, revisión 4. El plan registra la entrega de software y las condiciones pendientes de lanzamiento.

La web debe permitir que una persona imagine la vida que quiere vivir, revise lo que se entendió y siga cómo su aporte participa en un diseño colectivo. La primera experiencia se organiza alrededor de **MI ARGENTINA IDEAL**. El mapa conecta futuros con territorios; las campañas abren preguntas específicas; las fichas reúnen fuentes, condiciones deseadas y próximos pasos.

El recorrido incluye continuidad personal, análisis público y descarga. Una persona puede empezar sin cuenta y luego elegir cómo recuperar sus aportes y seguir procesos. La implementación reúne devolución humana revisable, respuestas explícitas, análisis exploratorio, alternativas y pruebas con responsabilidad aceptada. Cada operación conserva su alcance y sus límites.

## Decisiones principales

1. El CTA principal lleva a `/imaginar`. La persona puede empezar a escribir sin elegir tipo, tema, cuenta ni ubicación.
2. La conversación usa preguntas de diseño idealizado. El contexto actual se explora después y es opcional al comenzar.
3. El aporte se revisa antes de publicarse. El relato privado y la lectura sugerida no se publican automáticamente.
4. Las campañas son procesos con pregunta, territorio, fases y devolución. No se modelan como simples etiquetas.
5. Las fichas de futuro existentes se amplían progresivamente; conservan sus rutas, identificadores e historial.
6. El mapa incorpora una lectura de futuros y campañas. Los modos técnicos de análisis siguen disponibles en una superficie secundaria.
7. La biblioteca de PLANes funciona como referencia abierta. Los diseños ciudadanos pueden cuestionarla y ampliarla.
8. La app Expo existente se adapta al trabajo recurrente después de probar el circuito web. No se inicia otra app.
9. Radiografía conserva su página y motor semántico; se convierte en la entrada al análisis de patrones, cobertura y acuerdos cuando existan respuestas explícitas.
10. Datos Abiertos ofrece descargas públicas sin cuenta. Mi espacio ofrece gestión y descarga privada de datos propios; ambas operaciones tienen contratos separados.
11. Iniciar sesión no cambia la firma pública, los permisos ni el estado de un aporte. Recuperar aportes anónimos exige demostrar control y elegir la vinculación.

## Base de v2 que se reutiliza

| Base existente              | Operaciones observadas en código                                       | Modificación propuesta                                                                           |
| --------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Home y chrome Papel y Tinta | Portada por secciones y navegación compartida                          | Cambiar jerarquía, copy y CTA; incorporar campañas y futuros reales                              |
| Señales                     | Canon de nueve tipos, ingesta, corroboración, adhesiones y gestión     | Mantener significado y conectar fuentes de conversación y campaña                                |
| Geografía e instrumento     | Búsqueda territorial, filtros, lista y modos de mapa                   | Añadir futuros y campañas conservando alcance, cobertura y procedencia                           |
| Fichas                      | Listar, leer, crear y editar borradores con control de revisión        | Facilitar vínculos desde interfaz y desarrollar condiciones y alternativas                       |
| Radiografía                 | Grafos de similitud semántica, modelo, corte, umbral y lista accesible | Añadir filtros de procesos, claridad de cobertura y exportación; acuerdos en una vista posterior |
| Datos Abiertos              | Catálogo estático con cuatro conjuntos pendientes                      | Sustituirlo por un catálogo operativo, manifiestos y descargas elegibles                         |
| Cuenta y perfil             | Registro, login, perfil orientado a gamificación y notificaciones      | Construir Mi espacio, recuperación de aportes y seguimientos privados                            |
| Sembrar                     | Tres frases y certificado con datos existentes                         | Pasar a un recorrido de compromiso posterior al diseño, preservando lo anterior                  |
| Mandato y Radiografía       | Lecturas de señales y contenido agregado                               | Mostrar devoluciones y acuerdos identificados según funciones disponibles                        |
| Iniciativas                 | Entidades de miembros, tareas, hitos y actividad                       | Evaluar operaciones y permisos antes de reutilizarlas para ejecutar pruebas                      |
| App Expo                    | Escucha privada local, territorio y sincronización                     | Compartir contratos de campañas y aportes autorizados; conservar separación privada              |

Al iniciar esta revisión, las fichas existían como borradores con título, territorio, temas, situación, futuro, próxima tarea y vínculos a señales. La implementación agrega condiciones, alternativas, respuestas y resultados sin reinterpretar ese registro histórico. La existencia de código no certifica su despliegue ni una prueba de campo.

## Arquitectura del producto

El conjunto tiene cinco funciones que comparten entidades y contexto. Cada una termina con una salida que otra puede usar.

| Función                | Entrada                                          | Salida                                              | Superficie principal        |
| ---------------------- | ------------------------------------------------ | --------------------------------------------------- | --------------------------- |
| Expresión              | Vida imaginada, experiencia o capacidad          | Aporte autorizado y recibo                          | Imaginar                    |
| Organización           | Aportes y una pregunta territorial o temática    | Campaña y ficha de futuro                           | Campañas y Mapa             |
| Análisis               | Conjunto elegible con alcance y corte            | Patrones, diferencias y preguntas pendientes        | Radiografía                 |
| Diseño y acción        | Condiciones deseadas y alternativas              | Decisión con efecto declarado, prueba y aprendizaje | Fichas y Seguimiento        |
| Continuidad y apertura | Aportes propios, seguimientos y registro público | Gestión personal y archivos utilizables             | Mi espacio y Datos Abiertos |

Una señal tiene un identificador único. Campañas, fichas, hallazgos y acciones la enlazan; no crean copias independientes de su texto. Una corrección o retiro se refleja en las lecturas vivas. Los archivos ya descargados mantienen el límite explicado antes de publicar.

Ejemplo: alguien imagina estudiar cerca de su familia; comparte una versión en una campaña; el equipo la vincula a una ficha; Radiografía sugiere relaciones con otras voces; un proceso contrasta una condición deseada; una alternativa se prueba; la persona sigue ese recorrido desde Mi espacio. La descarga pública permite revisar las fuentes exportables y el método utilizado.

### Unidades que no se confunden

- **Aporte:** una expresión con origen y permisos, que puede dar lugar a señales confirmadas.
- **Campaña:** una convocatoria y un proceso, con ediciones y devolución.
- **Ficha:** una pregunta de futuro con fuentes, alternativas y revisión.
- **Análisis:** una lectura de un conjunto identificado, con método y corte.
- **Acuerdo:** un resultado de un proceso con regla, alcance y efecto publicados.
- **Acción:** algo que una parte aceptó hacer y cuyo resultado se comprueba.

Los roles describen permisos para una tarea, no jerarquía de valor de una voz. Quien participa, facilita, analiza, revisa o representa una institución tiene operaciones diferentes. Una institución acepta su responsabilidad por un procedimiento explícito; una cuenta con su nombre no acredita representación.

## Pantallas y navegación

### Navegación principal

**La idea · Mapa · Campañas · Radiografía · Biblioteca**, con CTA **Imaginar mi Argentina**. A la derecha: **Ingresar** o **Mi espacio**, según sesión.

Radiografía enlaza de forma visible a Datos Abiertos. Datos Abiertos también tiene acceso en el footer, el mapa y las devoluciones. Biblioteca mantiene accesos a PLANes, ensayos y entrenamientos. Las fichas se encuentran desde el mapa y las campañas, con su listado accesible. Sembrar y Mandato conservan rutas y enlaces contextuales. La navegación móvil ofrece los mismos destinos.

Registrar las nuevas rutas en `app-routes.tsx`, `app-pages.tsx` y `layouts/papel-routes.ts`. Mantener redirecciones y enlaces existentes. Los procesos administrativos usan autenticación y permisos específicos.

### Inicio

En `Home/sections/HeroBasta.tsx`:

- Conservar el wordmark y los materiales Papel y Tinta.
- Texto principal: **Diseñemos la Argentina que queremos vivir.**
- Pregunta: **En tu Argentina ideal, ¿qué sería posible en tu vida?**
- CTA primario: **Imaginar mi Argentina** → `/imaginar`.
- CTA secundario: **Explorar el país** → `/el-mapa`.
- Enlace de explicación: **Cómo funciona** → `/la-idea`.

Orden de contenido: invitación, tres pasos del ejercicio, campañas abiertas, futuros en elaboración, biblioteca de ejemplos y siguiente invitación. En móvil, la pregunta y el CTA deben verse al comienzo; reducir el peso del título monumental si los desplaza.

`VocesTicker` solo muestra material elegible y autorizado. No fabricar actividad inicial ni incluir texto retirado. Las cifras distinguen aportes, actores y resultados. Con cero, la portada invita a empezar y explica la devolución prevista.

Los colores y estados de información se leen sin completar el rito de despertar. El rito puede acompañar una acción, pero no condicionar legibilidad, publicación ni acceso.

### Imaginar

Nueva ruta `/imaginar`, con contexto opcional de campaña y territorio. El contexto propone un lugar; la persona puede corregirlo. Abrir por un enlace de campaña nunca equivale a aceptar participar ni publicar.

| Paso        | Pregunta o acción                                     | Comportamiento                                                      |
| ----------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| Imaginar    | En tu Argentina ideal, ¿qué sería posible en tu vida? | Texto inicial y opción de continuar; ningún tipo obligatorio        |
| Profundizar | ¿Por qué eso es importante para vos?                  | Respuesta opcional; botón para terminar la reflexión                |
| Relacionar  | ¿Qué tendría que funcionar para hacerlo posible?      | Condiciones, vínculos o capacidades; admitir que todavía no lo sabe |
| Revisar     | Esto entendimos de lo que contaste                    | Original y lectura sugerida separados; corregir o rechazar          |
| Compartir   | Qué querés compartir y dónde                          | Vista previa, alcance territorial, permisos y tipo confirmado       |
| Recibir     | Tu aporte y su próximo paso                           | Recibo recuperable, corrección, retiro y devolución prevista        |

La entrega inicial usa texto y preguntas guiadas. Puede funcionar sin un modelo de IA. La asistencia con IA se habilita mediante una elección informada antes de enviarle contenido; las sugerencias no alteran automáticamente el original. El audio se añade con captura, conservación, transcripción revisable y controles completos, no como un botón sin circuito.

La escritura permanece en memoria por defecto. Guardar un borrador en el dispositivo es una acción explícita, con aviso sobre equipos compartidos, recuperación y borrado. No guardar relatos personales silenciosamente en localStorage.

Cada turno puede respetar un límite visible de longitud. Si la conversación supera el texto permitido por una señal, la persona selecciona fragmentos o confirma un resumen; el sistema conserva el original autorizado en una entidad de origen separada. No truncar ni transformar una conversación extensa en múltiples señales públicas sin revisión.

El nuevo flujo y el formulario directo del mapa usan un núcleo común de ubicación, consentimiento, validación y recibo. No mantener dos contratos incompatibles.

### Recibo del aporte

El recibo muestra el texto efectivamente compartido, territorio y precisión autorizados, campaña y edición, y estado real. La sesión autenticada y la autoría se resuelven en servidor para que el aporte publicado con cuenta aparezca en Mi espacio. Ofrece ver el aporte, corregir, retirar y seguir la campaña. Después del recibo se ofrece **Guardar en mi espacio** y **Seguir esta campaña**. La cuenta es una opción para continuidad; el mecanismo anónimo de gestión se comprueba antes de anunciarlo.

Los secretos de gestión nunca viajan en enlaces compartibles. Si todavía no hay aportes relacionados, se dice; la devolución inicial puede publicarse por el equipo en la fecha anunciada.

### Mapa

`/el-mapa` empieza con búsqueda territorial, tema, período y selección de lectura. En escritorio: mapa y panel lateral. En móvil: mapa acotado, resumen y panel plegable, con lista equivalente. Se puede aportar sin usar lazo ni GPS.

**Futuro** se incorpora como primera lectura del nuevo ejercicio cuando haya fichas consultables, con entradas por pregunta, territorio y tema. Un territorio sin fichas explica qué falta y permite proponer una.

| Lectura de producto | Contenido                                             | Primera operación útil                     |
| ------------------- | ----------------------------------------------------- | ------------------------------------------ |
| Futuro              | Fichas y condiciones deseadas, con revisión y alcance | Abrir ficha y aportar una mirada           |
| Situación           | Señales declaradas, estado y fuentes                  | Consultar origen o corroborar lo permitido |
| Capacidades         | Recursos y prácticas con disponibilidad               | Ofrecer capacidad o conocer una práctica   |
| Caminos             | Alternativas y dependencias explícitas                | Comparar y proponer un cambio              |
| Seguimiento         | Acciones aceptadas, hitos y resultados                | Leer evidencia y aportar una observación   |

Las lecturas se incorporan por entrega; no mostrar cinco pestañas sin tarea. Los modos actuales Mapa, Análisis, Tiempo, Cobertura y Simulación son herramientas de representación. No se renombran como si fueran las cinco lecturas: pueden apoyar varias. Análisis, tiempo y cobertura quedan en controles secundarios; la simulación existente conserva su identificación y aislamiento.

El mapa dibuja señales y territorios relacionados con fichas. Una ficha puede abarcar varios lugares sin fabricar un punto preciso. Conservar la distinción entre lugar de quien habla y territorio al que se refiere.

Cada ficha, territorio y campaña ofrece **Ver en Radiografía**, **Seguir** y **Descargar estos datos** cuando la operación esté disponible. Todos los filtros usan el mismo alcance en mapa, lista y agregados. Los totales no se calculan a partir de los puntos cargados. Cobertura expresa participación observada y sus límites, no apoyo ni necesidad de la población. Una intensidad visual no concede prioridad ni autoridad.

### Fichas de futuro

Mantener `/fichas`, `/fichas/nueva` y `/fichas/:id`. Presentarlas como espacios para desarrollar una pregunta compartida.

Primera modificación del formulario: futuro deseado antes de situación actual; temas seleccionables con opción de sugerir otros; selección de aportes desde mapa, recibo o lista, evitando exigir pegar identificadores; siguiente pregunta visible. Los vínculos siguen mostrando quién los propuso y no cambian la corroboración de la fuente.

La relación nueva **inspira** permite vincular una aspiración al futuro sin etiquetarla como descripción de una situación actual. Requiere ampliar validación, contrato, interfaz y cualquier lectura que asuma cuatro relaciones. No reinterpretar los vínculos históricos.

Después se añaden condiciones deseadas, alternativas con responsables, diferencias, revisión y siguiente acción. Una alternativa compara funcionamiento, dependencias, costo con supuestos, prueba inicial y resultado esperado. Una ficha permanece borrador hasta que el proceso correspondiente permita otro estado.

La colaboración se incorpora mediante permisos de creador, facilitador y editor. Conservar control de revisión y recuperación del texto ante conflictos. Seguir mostrando cuándo una fuente se retiró o dejó de estar disponible.

### Campañas

Rutas propuestas:

- `/campanas`: catálogo por zona, tema y fase.
- `/campanas/:slug`: pregunta, alcance, participación, fases y devolución.
- `/campanas/:slug/participar`: entrada de Imaginar con contexto confirmado.
- `/campanas/:slug/devolucion`: lectura pública revisada y correcciones.
- `/gestion/campanas`: administración para equipos autorizados.

La campaña nacional permanente **MI ARGENTINA IDEAL** usa ediciones para publicar cortes y devoluciones. Que permanezca abierta no elimina fechas de revisión.

Las campañas específicas cruzan territorio y tema. Ejemplo: **La salud en nuestra vida ideal**, en localidades de Mendoza por acordar. Pregunta: **Cómo sería cuidar tu salud en tu comunidad ideal**. La situación actual y las capacidades se exploran después.

El contrato público contiene propósito, pregunta, territorios, temas, personas convocadas, canales, fases y fechas, equipo, uso de datos, método de lectura, devolución y efecto esperado. Identifica si hay una institución que aceptó responder. Los lugares de convocatoria no se presentan como representación de sus habitantes.

Estados de operación: borrador, programada, abierta, pausada, en devolución, cerrada. El seguimiento de acciones puede continuar después del cierre. Pasar de estado requiere permisos, razón y registro. Una campaña no cierra sin devolución o una explicación pública del incumplimiento.

Cambiar pregunta, alcance sustantivo o uso de datos crea una edición nueva. No trasladar consentimientos ni respuestas silenciosamente. Duplicar una campaña copia configuración, no aportes.

El administrador elige territorios mediante el catálogo geográfico existente, define fases y pregunta, revisa la vista ciudadana y publica. Puede preparar escucha presencial y recibir aportes asistidos con revisión y permiso del autor. No inferir la ubicación de un participante de la zona de campaña.

### Radiografía

Mantener `/la-radiografia` como superficie analítica propia. El mapa responde dónde y en qué contexto; Radiografía estudia relaciones y permite examinar el conjunto. Las campañas y fichas enlazan al análisis con su contexto visible.

La pantalla incorpora filtros de campaña, edición, territorio, tema, período y clase de señal. Los filtros se aplican en servidor al conjunto elegido antes de calcular relaciones; no basta con esconder puntos después de un análisis nacional. La URL conserva esos filtros y parámetros públicos para compartir la vista.

Primera pestaña: **Patrones**. Reutiliza el grafo semántico, umbral, composición por clase y lista accesible. Una relación de similitud se nombra como tal. Ni cercanía semántica ni adhesión prueban apoyo explícito a una afirmación. La etiqueta de núcleo conserva la fuente real y sus permisos.

Segunda pestaña: **Cobertura**. Muestra registro elegible, registros incluidos, sin vector, excluidos, límite de lectura, fecha de las fuentes y fecha de análisis. Los datos que falten se declaran. El código actual limita la lectura a 500 señales; ese conjunto no puede anunciarse como total del registro.

**Acuerdos y diferencias** se añade en E3, cuando existan afirmaciones y respuestas. Distingue matriz de opiniones y grafo semántico, con métodos y denominadores propios. No reemplazar el motor actual por PCA sobre texto ni dibujar sus puntos como personas.

La selección de un patrón abre fuentes elegibles, condiciones que lo matizan y fichas relacionadas. **Usar este patrón para formular un futuro** abre una ficha o una propuesta de vínculo autenticada; Radiografía sigue siendo una lectura y no crea acuerdos automáticamente.

Acciones visibles: **Compartir análisis**, **Guardar análisis** con cuenta, **Descargar estos datos** y **Descargar el registro público**. Guardar conserva filtros, parámetros y referencia al corte, no una copia privada perpetua del texto público. Si las fuentes cambian, la persona ve la nueva versión o la indisponibilidad del corte anterior.

### Datos Abiertos y descargas

Mantener `/datos-abiertos`, adaptado a Papel y Tinta. Se convierte en catálogo de archivos publicados y preparados desde el registro elegible, con acceso sin cuenta.

Tres acciones distintas:

| Acción                        | Destino                            | Contenido                                                                   |
| ----------------------------- | ---------------------------------- | --------------------------------------------------------------------------- |
| Descargar estos datos         | Mapa, campaña, ficha o Radiografía | Subconjunto público con filtros, corte y parámetros efectivos               |
| Descargar el registro público | Datos Abiertos y Radiografía       | Paquete completo de los conjuntos públicamente exportables                  |
| Descargar mis datos           | Mi espacio                         | Datos propios autorizados, con acceso privado y comprobación de titularidad |

La palabra **completo** se refiere al alcance público declarado. El paquete no contiene base interna, email, identificadores de cuenta o dispositivo, hashes de actor, secretos, vínculos privados, ubicación sensible, relatos privados ni matrices individuales de opiniones por defecto. Cada exportación publica sus exclusiones.

Paquete público propuesto: `senales.csv` o JSONL, campañas y ediciones, fichas y vínculos exportables, resultados agregados, geografía pública cuando corresponda, `manifest.json`, diccionario de campos y metodología. Las coordenadas respetan la política de exportación, que puede ser más gruesa que la vista. No fabricar puntos para registros de alcance provincial.

El manifiesto lleva versión de esquema, identificador del corte, generación, alcance, filtros, conteos por conjunto, completitud, exclusiones, licencias y checksums. Un análisis añade modelo, parámetros y referencia a sus insumos exportables. Fechas de registro y análisis se mantienen separadas.

La reproducción externa puede alcanzar únicamente el subconjunto divulgado. Si el análisis interno usó texto reservado, el paquete debe decir que no permite reconstruirlo íntegramente. Los vectores o respuestas individuales no se publican por asumir que están anonimizados: requieren un contrato y evaluación específicos.

Los textos siguen la elección y el contrato actuales por señal. El catálogo debe derivar las licencias de esa misma fuente: hoy anuncia CC0 mientras el contrato público establece CC BY 4.0 y cesión por texto. No atribuir una licencia única a contenido que el proyecto no puede publicar.

No usar una cifra universal de mil registros para habilitar una descarga. La elegibilidad depende de permisos y privacidad del conjunto. Una tabla de información pública institucional puede abrirse pequeña; un cruce de personas o grupos pequeños puede requerir agregación o supresión aunque el total sea grande.

La primera versión permite CSV y JSONL; GeoJSON solo para datos geográficos publicables. Los botones explican si se descarga una vista limitada o el conjunto completo. Descargar todo no usa el límite del feed ni los 500 puntos de una visualización.

Preparar exportaciones grandes como trabajos desacoplados, con estados solicitado, preparando, disponible, vencido o fallido. Archivos públicos versionados pueden generarse periódicamente cuando haya un operador y un mecanismo de actualización; los personales usan autorización y enlaces privados de corta duración. Validar salida CSV, escapado, permisos y actualización de archivos al retirar contenido.

Los archivos gestionados por la plataforma tienen política de vigencia y corrección. Los cortes archivados se distinguen de la lectura vigente. Una descarga previa de terceros no puede recuperarse. El plazo de retiro anunciado debe corresponder al proceso operativo real antes de abrir la función.

### Cuenta y Mi espacio

Añadir `/mi-espacio` como área privada. Reutilizar registro, login, verificación, sesiones y notificaciones existentes. La primera versión usa esos mecanismos; no depende de añadir proveedores de identidad.

| Sección        | Qué permite                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| Mis aportes    | Ver lo compartido, estado, precisión, origen, permiso y relaciones con fichas; corregir o retirar según autoría |
| Lo que sigo    | Campañas, fichas, territorios o temas elegidos; ver novedades y dejar de seguir                                 |
| Mis borradores | Retomar reflexiones guardadas explícitamente y distinguir lo local de lo sincronizado                           |
| Mis análisis   | Recuperar filtros y cortes guardados, con fuentes actualizadas o cambio declarado                               |
| Avisos         | Devoluciones, solicitudes de revisión, cambios de fase y resultados relevantes                                  |
| Cuenta y datos | Datos de cuenta, sesiones, preferencias, exportación propia y opciones de cierre                                |

Mi espacio no es un perfil público. Nombre de cuenta, email, intereses seguidos y borradores no se exponen por registrarse. Una firma pública se elige por aporte. Verificar email no acredita identidad civil, residencia ni mandato para representar a otros.

`/mi-perfil` puede mantenerse como edición de datos y acceso a actividad histórica. Puntos, insignias y clasificación no encabezan el espacio de participación ni determinan autoridad. Sus funciones existentes se conservan aparte hasta revisar su utilidad.

### Continuidad entre aporte anónimo y cuenta

Tres estados requieren comportamientos diferentes:

1. **Sin cuenta:** escribir y compartir con los permisos elegidos; gestionar desde el navegador que conserva la credencial de autoría. Explicar qué pasa si se pierde.
2. **Cuenta activa:** guardar la relación privada con el titular en servidor; publicar la firma elegida sin revelar la cuenta.
3. **Aportes anteriores controlados por este navegador:** después de ingresar, ofrecer una revisión para vincularlos. Requiere sesión, credencial de actor y confirmación; no basta comparar texto, firma, email o ubicación.

La elección se puede posponer. En un dispositivo compartido, poseer la credencial no demuestra que todo lo escrito sea de la misma persona: mostrar alcance y aportes antes de aceptar. Los borradores íntimos no se suben en ese paso ni al iniciar sesión.

El repositorio de actores tiene una operación de enlace a cuenta sin un flujo HTTP observado. Construir el circuito con validación de propiedad, conflictos y controles. La restricción de un actor por cuenta obliga a diseñar qué pasa cuando se accede desde otro navegador; no ejecutar un UPDATE y asumir que la fusión existe.

La consolidación mantiene referencias, auditoría y deduplicación de adhesiones y corroboraciones. No convierte dos navegadores de la misma cuenta en dos participantes independientes. A la vez, no atribuye como persona verificada a quien solo conserva una cookie. Los conteos publican la unidad realmente medida.

Si no hay credencial ni vínculo previo, no prometer recuperación de una autoría perdida. Cerrar sesión, olvidar el navegador, desvincular autoría, retirar una publicación y cerrar una cuenta son acciones diferentes; explicar sus efectos y aplicar una política coherente antes de habilitarlas.

### Seguimientos y avisos

**Seguir** expresa una preferencia privada; no es adhesión, respuesta, voto ni afiliación. Se puede seguir una campaña sin haber aportado y aportar sin suscribirse. No seguir temas automáticamente porque aparecieron en el relato.

Avisos iniciales dentro de Mi espacio: devolución publicada, revisión solicitada sobre un aporte, cambio de fase y resultado de una acción seguida. Una fuente retirada o una edición de campaña modificada también puede generar un aviso pertinente. Enunciar eventos observados: **Tu aporte se vinculó a esta ficha**; no afirmar que produjo un resultado por el mero vínculo.

Reutilizar el inbox actual y extender tipos y referencias para identificadores UUID de campañas y fichas. Las preferencias separan cuenta y gestión de autoría de comunicaciones opcionales. El silencio o dejar de seguir se respetan. Email y push requieren elección; el MVP puede devolver novedades dentro de la web.

Los avisos cívicos se generan desde eventos persistidos, con clave de deduplicación y reintentos. La devolución queda disponible en la campaña y el espacio personal aunque falle una notificación. Evitar convertir el actual productor que solo registra fallas en el único mecanismo de una promesa de devolución.

### La idea y biblioteca

`LaIdea` explica el recorrido con un caso: una vida deseada, condiciones necesarias, futuros relacionados, alternativas, prueba y resultado. Evitar presentar la cantidad de voces como mecanismo suficiente para que emerja un plan.

Los PLANes conservan contenido y lectores. Sus enlaces contextuales pueden mostrar diseños que los usan como referencia o que los cuestionan. La biblioteca no se convierte en una lista de soluciones que el participante debe elegir.

### Sembrar y Mandato

Sembrar se invita después de identificar una acción posible. Un compromiso requiere alcance, fecha y forma de cierre. Las semillas históricas mantienen su significado y no se convierten automáticamente en compromisos corroborados.

Mandato distingue registro de aportes, devolución del equipo, síntesis provisional y acuerdo de un proceso identificado. Publicar un acuerdo exige convocatoria, participantes según unidad medida, regla anunciada, resultado, objeciones, efecto y revisión. Un umbral de volumen no habilita el estado acordado.

Radiografía conserva el análisis de patrones y añade acuerdos en una vista posterior con respuestas explícitas. Las decisiones y compromisos se leen en la ficha y Mandato, con enlace al análisis que los sostuvo. La biblioteca sigue aportando referencias y el área personal permite acompañar el recorrido.

## Modelo de datos propuesto

Se conserva Postgres, señales y fichas existentes. Las entidades siguientes se añaden progresivamente mediante migraciones y repositorios por dominio.

| Entidad                        | Datos y relaciones principales                                                          | Entrega                      |
| ------------------------------ | --------------------------------------------------------------------------------------- | ---------------------------- |
| Campaña y edición              | Pregunta, alcance, contrato, fases, responsables y versión                              | E1                           |
| Territorios y temas de campaña | Relaciones con geografía y vocabulario; tema sugerido separado                          | E1                           |
| Aporte de conversación         | Parte autorizada del original, canal, edición, permisos y señales derivadas             | E1                           |
| Titularidad y recuperación     | Vínculo privado con cuenta o actor, comprobación de control y registro de consolidación | E1                           |
| Seguimiento y preferencias     | Cuenta, objeto seguido, canales y frecuencia elegidos; sin visibilidad pública          | E1                           |
| Evento cívico y aviso          | Objeto y versión, destinatarios autorizados, clave de deduplicación y entrega           | E1 y E2                      |
| Exportación y manifiesto       | Alcance, corte, elegibilidad, formatos, completitud, archivo y vigencia                 | E1 básico y E2 ampliación    |
| Análisis guardado              | Referencia a consulta y corte; cuenta propietaria, sin copia de textos                  | E2                           |
| Interpretación                 | Fragmentos de origen, versión y confirmación o rechazo                                  | E1 manual, E3 automatización |
| Devolución                     | Versión, fuentes elegibles, límites, responsable y correcciones                         | E2                           |
| Ampliación de ficha            | Condiciones, alternativas, diferencias y vínculos con campañas                          | E2 y E3                      |
| Afirmación y respuesta         | Texto versionado, exposición, acuerdo, desacuerdo o paso                                | E3                           |
| Corte y hallazgo               | Datos elegibles, parámetros, método, revisión y vigencia                                | E3                           |
| Prueba y resultado             | Alternativa, responsables, hitos, evidencia y precedente                                | E4                           |

No introducir una décima señal llamada conversación, acuerdo o campaña. La conversación es un origen; una campaña es un proceso; un acuerdo es un resultado de un proceso.

Para E1, el aporte público puede derivar una señal de sueño confirmada por su autor. Un relato con varios contenidos se divide solo con revisión. Corroborar, adherir y responder mantienen operaciones separadas.

Original e interpretación se publican únicamente según la autorización elegida. Las lecturas y exportaciones respetan la política actual de publicación y licencia, incluidos textos reservados. Crear un dominio nuevo no puede abrir una vía para exponer textos protegidos. Las devoluciones consultadas en la plataforma resuelven el texto vigente y respetan retiros; una descarga ya obtenida por terceros no puede recuperarse desde el sistema. Ese límite se explica antes de publicar.

La publicación debe resolver juntas la señal derivada, el vínculo de campaña, el origen autorizado y el recibo. Reusar la ingesta de señales con una transacción común o un mecanismo de recuperación explícito. Reintentar no duplica señales ni deja un recibo que promete un vínculo inexistente.

## Servicios y contratos

Crear dominios `campanas`, `contribuciones`, `mi-espacio`, `seguimientos` y `exportaciones`; ampliar `fichas`, `radiografia` y notificaciones. La granularidad final respeta operaciones y límites de archivos, sin duplicar identidad ni lectura pública. La API pública propuesta usa `/api/v1/campanas` y `/api/v1/contribuciones`. La escritura de aportes integra la validación y el servicio existentes de señales; no crea otra taxonomía ni confía en origen declarado por el cliente.

El contrato de contribución referencia edición activa, clave de envío estable, partes autorizadas, tipo confirmado, territorio y permisos. El servidor valida el contexto de campaña, aplica precisión y devuelve lo efectivamente guardado. Una edición cerrada permite recuperar el borrador y explica cómo volver a participar.

Una consulta compartida describe campaña y edición, territorio, tema, período, tipos, estados y corte. Mapa, Radiografía y exportación la aplican al mismo ámbito elegible y publican diferencias si requieren subconjuntos distintos. Guardar un filtro no concede acceso a una fuente.

Los endpoints personales derivan usuario de la sesión, nunca de un `userId` libre del cliente. Los administrativos combinan rol con alcance de campaña. Los archivos privados revalidan autorización.

La administración exige cuenta y rol autorizado. Visitar una URL de gestión o ser creador de una ficha no concede permiso para publicar campañas. Registrar cambios y separar la edición de contenido de la aprobación de una devolución cuando el equipo tenga revisión independiente.

El análisis implementado es una adaptación propia y exploratoria, con límites declarados y revisión humana del significado. Radiografía conserva la separación entre semejanza textual y respuestas explícitas. El cálculo fuera de los límites actuales requiere trabajos desacoplados y validación de cobertura; permanece registrado en D-102. La interfaz depende de nuestros contratos versionados, no del formato interno de un proveedor.

## App móvil

La primera publicación del nuevo ejercicio es web. La app existente se adapta después para campañas seguidas, captura asistida, recorridos y continuidad sin conexión.

Los relatos privados de `civic_listenings` y la bitácora conservan su separación. La sincronización solo envía derivados o partes expresamente autorizadas. Una actualización de app no publica contenido anterior.

Compartir contratos de campaña, edición y contribución con web. La adaptación implementada usa el AsyncStorage existente para borradores y envíos pendientes elegidos; conserva el aviso de que no tiene cifrado propio de la app. La API valida permisos y contexto al reintentar. Si la campaña cambió o cerró, conservar el aporte y solicitar una nueva elección cuando corresponda. No atribuir fecha de recepción anterior porque el equipo estuvo sin conexión.

La adaptación nativa avanza cuando un piloto demuestre una tarea recurrente que mejore con ella. E1 no depende de instalar la app.

## Primera entrega que recomiendo

**Inicio y navegación nuevos, Imaginar por texto, una campaña, publicación revisada, recibo recuperable, Mi espacio con aportes y seguimientos, y una descarga pública básica con alcance explícito.**

E2 conecta esos aportes con fichas, publica una devolución real, incorpora filtros a Radiografía y amplía las descargas. La primera campaña focalizada se opera con facilitación humana; ese circuito valida el producto antes de automatizar agrupamiento o desplegar todas las lentes.

## Criterios de aceptación

- Una persona empieza sin cuenta, tipo ni GPS y entiende qué compartirá antes de enviar.
- Con cuenta, encuentra sus aportes en otro dispositivo; vincular antecedentes requiere credencial y elección y no publica identidad ni borradores.
- Seguir y dejar de seguir un proceso modifica únicamente preferencias; no modifica apoyo ni participación medida.
- Un análisis guardado conserva corte y filtros. Cambios o retiros de fuentes no se esconden.
- Descargar la vista devuelve el conjunto y parámetros anunciados; descargar todo no repite el límite del mapa o Radiografía.
- El exportador omite texto reservado y datos privados, cuenta exclusiones y presenta licencias desde el contrato vigente.
- Descargar mis datos exige sesión y propiedad; probar acceso cruzado, caducidad, retiro y cierre de cuenta.
- Volver, corregir, rechazar una interpretación y fallar la red no pierde el borrador activo.
- Doble envío o reintento recupera el mismo resultado.
- El relato privado no aparece en APIs, exportaciones, telemetría ni procesamiento externo sin la elección correspondiente.
- Recibo, mapa, campaña y ficha muestran el mismo alcance y permisos; retirar actualiza esas lecturas.
- Una ficha muestra fuentes retiradas sin recuperar sus textos antiguos públicamente.
- Una campaña declara responsable y devolución; los cambios sustantivos crean edición.
- El mapa diferencia error, datos parciales y falta real de registros.
- Los nuevos recorridos funcionan con teclado y a 360, 390, 768 y 1440 píxeles.
- Las pruebas de API usan una base de test identificada; no se publica contenido de demostración en producción.

## Relación con documentos anteriores

Esta propuesta desarrolla la ficha y las cinco lecturas de [Mapa y visión de país](2026-09-09-mapa-vision-de-pais.md). Actualiza su puerta de entrada hacia el diseño idealizado y añade campañas de diseño. Mantiene el canon de señales, precisión protegida, retiro y aislamiento de ejemplos.

El [plan de septiembre](../plans/2026-09-09-mapa-vision-de-pais-plan.md) sigue aportando tareas de confianza y geografía. Sus casillas se verifican antes de repetir trabajo. La [revisión general de octubre](../plans/2026-10-07-revision-hombre-gris.md) conserva la dirección editorial; el recorrido de participación y campañas se concreta en esta propuesta.

La spec de [Radiografía](2026-08-12-la-radiografia.md) conserva su motor y sus límites de significado. El [registro público](2026-08-11-d-el-registro-publico.md) aporta criterios para descargas; esta propuesta concreta su integración con cuenta, campañas y análisis. El procesamiento semántico existente sigue local; un asistente conversacional externo, si se añade, tiene autorización y circuito separados.

La revisión 2 del PDF orienta el producto. Para el inventario técnico prevalece el código actual: las fichas ya poseen una primera implementación y aquí se propone ampliarla.

Implementación por entregas: [Plan de modificaciones de v2](../plans/2026-10-08-diseno-idealizado-y-campanas-plan.md).
