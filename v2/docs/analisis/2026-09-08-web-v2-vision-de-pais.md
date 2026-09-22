# Web v2: análisis hostil, lectura constructiva y evolución del mapa

Fecha: 8 de septiembre de 2026. Alcance: versión local de `v2`.

Se revisaron la portada y el mapa en navegador de escritorio, y el código de captura, cobertura, análisis, Radiografía, Mandato y simulación del mapa. El servidor de datos local no estaba activo: la revisión visual verifica disposición y comportamiento ante esa falla, no volumen de participación ni funcionamiento de producción. No se enviaron aportes ni se modificó la aplicación. Las propuestas son juicios de diseño, no resultados de una prueba con usuarios.

## Diagnóstico

V2 tiene una identidad editorial clara y una base cívica valiosa. Su desarrollo está más avanzado en recibir, clasificar y visualizar aportes que en construir decisiones colectivas. Para empezar una visión integral de país necesita conectar experiencia, evidencia, futuro deseado, alternativas, recursos y revisión pública.

La unidad de trabajo que falta es una **ficha de futuro territorial**. Un punto registra algo; una ficha relaciona qué sucede, qué se quiere cambiar, quién puede intervenir, qué alternativas existen y cómo se verificará el resultado. Las fichas deben conectarse entre territorios y temas para formar una visión nacional revisable.

## Lectura hostil: las objeciones de alguien que todavía no confía

### 1. La promesa excede el mecanismo

La portada propone que la gente diseña el país y afirma que nadie interpreta por ella. Sin embargo, alguien elige categorías, algoritmos de agrupación, umbrales, prioridades y textos del mandato. Son decisiones editoriales y metodológicas que deben poder conocerse, discutirse y corregirse.

La plataforma declara honestamente que los deseos todavía reciben adhesiones y que no hay deliberación. Eso convive con un Mandato que habla de acciones en votación y presenta una síntesis nacional. La continuidad entre esos regímenes necesita aclararse. Cien aportes pueden habilitar un formato porcentual; no otorgan por sí solos representación ni autorización colectiva.

### 2. El mapa puede amplificar a quienes más publican

Hay normalización provincial por población y por superficie: conservarla. Aun así, publicaciones por habitante no son personas participantes por habitante ni prevalencia de un problema. La Radiografía lo reconoce explícitamente: cuenta señales y una persona puede aportar muchas.

Un identificador de navegador ayuda a limitar duplicaciones, pero no prueba personas únicas. Hace falta declarar qué se cuenta, cómo se estima la diversidad y qué voces faltan. Un espacio abierto puede ser útil sin presentarse como una muestra representativa.

### 3. La contundencia visual supera a veces la contundencia de la evidencia

El Mandato denomina «cubierta si se organiza» a una provincia cuando la cantidad de recursos publicados alcanza la de necesidades. No comprueba que los recursos correspondan al problema, tengan capacidad suficiente, estén disponibles o sean accesibles. Una publicación que ofrece herramientas no compensa una que pide agua.

También muestra «Documento auditado. Ahora sos testigo» cuando un bloque entra en pantalla. Desplazarse hasta el final no equivale a auditar. El sitio debe reservar las palabras corroboración, acuerdo, auditoría y cumplimiento para acciones verificables.

### 4. Se pide contribuir antes de demostrar utilidad

La página del mapa empieza con título, un formulario extenso, feed y verificación; después aparece el instrumento. En la inspección a 1280 × 720, el mapa no estaba en la primera pantalla. El formulario ofrece nueve tipos agrupados, ubicación, pregunta sobre viviendas y consentimiento, mientras promete «30 segundos».

La clasificación tiene sentido para la base de datos, pero el visitante necesita primero reconocer su situación y entender qué obtendrá. La marca y su vocabulario ocupan más espacio inicial que la respuesta práctica.

### 5. Una herramienta de país debe demostrar que admite desacuerdo con su propio marco

Los planes están identificados como ejemplos, lo cual es correcto. Aun así, su presencia y la narrativa de la portada podrían percibirse como una conclusión editorial previa. La prueba de apertura sería permitir que una comunidad formule una alternativa incompatible con un ejemplo, reciba el mismo trato metodológico y conserve su desacuerdo en la síntesis.

«Sin líder» tampoco responde quién mantiene el sistema, modifica sus reglas o resuelve una apelación. Esa responsabilidad debe ser fácil de encontrar y comprender.

## Lectura no hostil: lo que vale la pena desarrollar

1. **La identidad es reconocible.** Papel, tinta, tipografía y tono construyen continuidad. Mantendría ese lenguaje en la narrativa, simplificando la superficie de trabajo.
2. **La taxonomía distingue operaciones diferentes.** Hechos se corroboran, deseos se deliberan, compromisos se siguen y preguntas se responden. Esa separación evita que todo termine reducido a un botón de apoyo.
3. **El territorio ofrece una entrada concreta.** Una persona puede partir de lo que conoce y conectar su experiencia con problemas más amplios.
4. **La cobertura reconoce los límites de la escucha.** Preguntar quién falta es valioso. Hay que mejorar su denominador y su interpretación, no descartar la idea.
5. **Ya existen partes del circuito.** Captura, verificación, Radiografía, Mandato, planes y simulación pueden alimentar el mismo espacio de trabajo. No hace falta construir otro conjunto de páginas desconectadas.
6. **Hay decisiones de transparencia que deben preservarse.** La Radiografía distingue convergencia de corroboración, ofrece lista además de visualización y separa sus ejemplos del corpus. La simulación del mapa declara sus puntos sintéticos. La captura contempla precisión territorial y protección de viviendas.

## Correcciones de confianza antes de ampliar el mapa

| Prioridad | Hallazgo | Evidencia | Corrección propuesta |
|---|---|---|---|
| P0 | Falla de datos presentada como ausencia de voces | En navegador, con API local inaccesible, el feed muestra error pero el mapa dice «Todavía no habló nadie» y Cobertura informa 100% de silencio. `Instrumento.tsx` usa `data ?? []` sin propagar `isError`. | Estados separados: cargando, error, datos vacíos, datos parciales y datos desactualizados. No calcular silencio cuando falta la consulta. |
| P0 | Análisis sobre una respuesta recortada sin advertencia | `civic-map.ts` limita a 500 filas por consulta de origen por defecto; la capa voz une dos orígenes. El cliente no pide paginación ni recibe metadatos de truncamiento y denomina `todas` al resultado. | Agregados completos en servidor; puntos paginados o agrupados para el dibujo. Publicar total coincidente, total cargado, filtros y fecha. Aumentar el límite no resuelve el problema. |
| P0 | Brecha medida con unidades incompatibles | `mandato/service.ts` cuenta necesidades y recursos por provincia; `mandato-regimen.ts` compara ambos conteos. | Mostrar oferta y demanda declaradas por separado hasta disponer de correspondencia temática, capacidad, unidad, disponibilidad, alcance y corroboración. |
| P1 | Auditoría inferida del desplazamiento | `DocumentoMandato.tsx` activa el sello mediante `IntersectionObserver`. | Cambiar a «Llegaste al final». Una revisión real debe registrar qué se revisó, el resultado y las observaciones. |
| P1 | Opción de licencia contradictoria | El consentimiento ofrece publicar el resto sin texto si no se cede licencia, pero `PanelSoltarVoz.tsx` exige `cede` para habilitar el envío. | Alinear texto, elección y comportamiento. Distinguir consentimientos necesarios de la autorización de reutilización del texto. |

La cobertura actual construye una grilla sobre el rectángulo visible y verifica presencia de puntos. No estima habitantes cubiertos, no separa territorio habitado y puede incluir agua o países vecinos. Además, un punto aproximado no prueba que se haya relevado la celda donde se dibuja. Presentaría el resultado como «celdas sin registros localizables bajo estos filtros» hasta contar con un modelo mejor.

## El mapa que permitiría empezar una visión integral

### 1. Abrir por una pregunta útil

Entrada principal: buscar localidad, provincia o problema. Ofrecer explorar Argentina sin registrarse. Mostrar el mapa y una ficha territorial desde el primer encuadre; abrir «Aportar» en un panel contextual.

En móvil: mapa y lista equivalentes, ficha inferior plegable, controles esenciales siempre accesibles y ningún recorrido que dependa de dibujar un polígono. Permitir seleccionar un lugar por nombre o sobre el mapa: el GPS del visitante no necesariamente es el lugar del problema.

La captura puede comenzar con lenguaje cotidiano: «Algo que pasa», «Algo que queremos», «Algo que podemos aportar» y «Una pregunta». La clasificación más fina debe aparecer cuando ayude, conservando las distinciones del canon.

### 2. Organizar las lentes por decisiones

| Lente | Pregunta que responde | Contenido principal |
|---|---|---|
| Situación | ¿Cómo se vive acá? | Experiencias, indicadores, servicios y hechos corroborados. |
| Capacidades | ¿Con qué contamos? | Organizaciones, conocimientos, infraestructura, recursos y disponibilidad. |
| Futuro | ¿Qué queremos lograr? | Objetivos, horizonte, indicadores, acuerdos parciales y diferencias. |
| Caminos | ¿Qué alternativas tenemos? | Propuestas comparables, costos, responsables, dependencias y efectos adversos. |
| Seguimiento | ¿Qué cambió? | Compromisos aceptados, hitos, evidencia de resultados y revisiones. |

Cobertura, fecha y procedencia serían información transversal. La línea de tiempo seguiría disponible como filtro. La simulación se abriría desde una alternativa concreta, manteniendo visibles supuestos, incertidumbre y separación de datos sintéticos.

### 3. Conectar la experiencia con datos de contexto

Agregar indicadores de población, vivienda, agua y saneamiento, educación, salud, movilidad, producción y ambiente de manera gradual. Cada capa necesita fuente, fecha de referencia, unidad, cobertura, método y escala territorial válida. Si un indicador existe solamente a escala provincial, no debe colorear barrios como si fuera local.

Punto de partida verificable: [resultados del Censo 2022 del INDEC](https://www.indec.gob.ar/indec/web/Nivel4-Tema-2-41-165?lang=es) y [REDATAM](https://redatam.indec.gob.ar/). Para normalizar nombres e identificadores de provincias, departamentos, municipios y localidades, [Georef](https://www.argentina.gob.ar/georef). Las geometrías y sus equivalencias con unidades censales necesitan validación específica; esas unidades no son intercambiables automáticamente.

La información oficial y los testimonios deben poder discrepar. Esa discrepancia es una pregunta de investigación, no algo que el sistema deba esconder promediando ambas cosas.

### 4. Crear una ficha de futuro por territorio y tema

Contenido mínimo:

- **Situación actual:** hechos, experiencias, indicadores y vacíos de conocimiento.
- **Futuro deseado:** una frase concreta y un horizonte elegido por los participantes.
- **Objetivo verificable:** indicador, línea de base, meta y fuente de medición; admitir «por determinar».
- **Capacidades:** qué existe, quién lo sostiene y qué disponibilidad está confirmada.
- **Alternativas:** al menos dos caminos comparables cuando corresponda.
- **Tensiones:** costos, efectos adversos, grupos afectados y desacuerdos pendientes.
- **Acción siguiente:** tarea, responsable que la acepta, fecha y evidencia esperada.
- **Procedencia:** aportes originales, autores institucionales cuando corresponda, estado de revisión y versión.

La Radiografía sugeriría agrupaciones para estas fichas. La comunidad podría corregirlas, dividirlas o cuestionarlas. Similaridad textual no basta para afirmar acuerdo: «quiero más policía» y «quiero menos policía» hablan del mismo tema.

### 5. Hacer de la deliberación una función concreta

Separar «me pasa», «lo corroboré», «quiero ese resultado», «apoyo esta alternativa» y «me comprometo». Son actos diferentes.

Cada alternativa debería admitir argumentos, evidencia, objeciones, modificaciones y una respuesta a las objeciones. Una síntesis mostraría acuerdos, desacuerdos y asuntos sin resolver, con enlaces a lo que los sostiene. La IA puede ayudar a ordenar y redactar borradores; la validación tiene que quedar identificada.

Combinar participación abierta con instancias de escucha y deliberación que busquen diversidad de manera explícita. Las [guías de participación de la OCDE](https://www.oecd.org/en/publications/2022/09/oecd-guidelines-for-citizen-participation-processes_63b34541.html) distinguen objetivos, selección de participantes, métodos y evaluación. Sus [principios deliberativos](https://www.oecd.org/en/publications/innovative-citizen-participation-and-new-democratic-institutions_339306da-en/full-report/component-9.html) subrayan tiempo para evaluar evidencia, representatividad y respuesta pública. La elección del método depende de qué decisión se quiera informar.

### 6. Pasar de territorios a país sin borrar las diferencias

Una visión nacional requiere relaciones además de agregados. Vincular fichas por problema compartido, cuenca, corredor productivo, sistema energético, movilidad o dependencia institucional. Mostrar qué decisión corresponde a la comunidad, al municipio, a la provincia o al nivel nacional, validando esa asignación con quienes conocen el caso.

Una mejora de transporte puede afectar acceso al trabajo, educación, salud y emisiones. Esas conexiones deben conservar hipótesis y evidencia; no dibujarse como relaciones causales probadas por defecto.

La síntesis nacional debería registrar objetivos comunes, variantes territoriales, tensiones entre objetivos, recursos limitantes y decisiones pendientes. Frecuencia de menciones, gravedad, desigualdad y factibilidad deben mostrarse como dimensiones distintas, con criterios de priorización públicos y modificables. Una minoría afectada no debe desaparecer por recibir pocos apoyos.

### 7. Convertir la cobertura en un plan de escucha

Usar unidades comparables, población de referencia cuando exista y estado de actualidad. Diferenciar cantidad de registros, actores de navegador, organizaciones, participación presencial y personas verificadas cuando realmente lo estén. No publicar identidades sensibles ni grupos demasiado pequeños.

De cada vacío debería salir una tarea: relevar una localidad, contrastar un indicador, invitar a una institución o renovar información antigua. Esas tareas pueden aprovechar la app de campo existente. Los datos recogidos presencialmente deben conservar procedencia, consentimiento y método.

### 8. Dar a cada aporte un recorrido visible

Después de enviar: enlace al aporte, estado, posibilidad de corrección o retiro según el contrato y la ficha a la que se vinculó. Después de deliberar: resultado y argumentos conservados. Después de actuar: evidencia y revisión. La plataforma debe mostrar qué produjo participar.

## Ejemplo de uso, enteramente hipotético

Una vecina informa que debe hacer un viaje largo para acceder a atención de salud. La ficha permite vincular experiencias similares sin confundirlas con personas distintas, consultar servicios existentes y establecer qué falta conocer sobre horarios y accesibilidad.

La comunidad formula un objetivo de acceso y compara ampliar horarios, mejorar transporte o crear un servicio itinerante. Registra costos estimados, capacidades disponibles, responsables posibles y efectos sobre otras localidades. La meta numérica se fija después de acordar cómo medir la línea de base.

La primera acción puede ser verificar los horarios y recorridos con una institución local. El resultado actualiza la ficha. Otras localidades comparan alternativas y aportan aprendizajes. La síntesis nacional puede entonces discutir acceso territorial a servicios con experiencias, evidencia, propuestas y diferencias explícitas.

## Orden de implementación

**Primera entrega — confianza y entrada.** Resolver error versus vacío, consultas recortadas, brechas incompatibles, lenguaje de auditoría y consentimiento. Subir el instrumento, agregar búsqueda territorial, ficha básica y lista accesible. Verificar con personas nuevas si entienden qué saben y qué no saben los datos.

**Segunda entrega — un circuito completo en pocos territorios.** Pilotear en tres contextos elegidos por contraste —urbano, localidad intermedia y rural—, sin tratarlos como muestra nacional. Elegir uno o dos temas con interlocutores dispuestos a participar. Incorporar fuentes, capacidades, objetivos y devolución al aportante.

**Tercera entrega — decisiones y seguimiento.** Comparar alternativas, conservar desacuerdos, registrar compromisos aceptados y resultados. Integrar Radiografía y Mandato a las mismas fichas y filtros, conservando trazabilidad.

**Cuarta entrega — conexión nacional.** Relacionar objetivos entre territorios, identificar dependencias y producir una primera visión revisable con límites explícitos. Ampliar simulaciones solo donde haya preguntas y supuestos concretos que justifiquen su uso.

No es una estimación de calendario: depende del equipo y del trabajo territorial. La condición para avanzar debería ser que el circuito anterior funcione con participantes reales.

## Cómo comprobar que se está construyendo una visión de país

- Una persona nueva encuentra su territorio y explica una prioridad con evidencia y límites.
- Un aporte llega a una ficha y su autor puede encontrar qué ocurrió con él.
- Cada objetivo tiene una línea de base o declara que todavía falta, y una forma de comprobar avances.
- Las síntesis conservan objeciones y enlazan sus fuentes.
- Una caída de datos, una respuesta parcial o una muestra insuficiente nunca aparece como conclusión sobre el país.
- Los compromisos tienen responsables que los aceptaron y evidencia posterior.
- Los territorios comparten aprendizajes y reconocen diferencias sin convertir popularidad en urgencia.

La primera evidencia de éxito sería una comunidad que pueda usar el mapa para acordar y revisar una acción concreta. El volumen de puntos puede crecer después; por sí solo no prueba una visión compartida.

## Archivos principales revisados

- `apps/web/src/pages/Home/sections/HeroBasta.tsx`
- `apps/web/src/pages/ElMapa.tsx`
- `apps/web/src/pages/ElMapa/sections/PanelSoltarVoz.tsx`
- `apps/web/src/pages/ElMapa/instrumento/Instrumento.tsx`
- `apps/web/src/pages/ElMapa/instrumento/modos/useModoCobertura.tsx`
- `apps/web/src/pages/ElMapa/instrumento/modos/useModoAnalisis.tsx`
- `apps/web/src/pages/ElMapa/instrumento/modos/useModoSimulacion.tsx`
- `apps/web/src/pages/LaRadiografia.tsx`
- `apps/web/src/pages/ElMandatoVivo/sections/DocumentoMandato.tsx`
- `apps/web/src/pages/ElMandatoVivo/sections/DocumentoSecciones.tsx`
- `apps/web/src/pages/ElMandatoVivo/mandato-regimen.ts`
- `apps/web/src/lib/queries/civic-map.ts`
- `apps/api/src/features/civic-map/routes.ts`
- `apps/api/src/features/mandato/service.ts`
- `packages/db/src/repositories/civic-map.ts`
- `packages/shared/src/open-data/consentimiento.ts`
- `../../docs/DEUDAS.md`
