# El mapa como herramienta para construir una visión de país

Fecha: 2026-09-09. Estado: propuesta de producto para implementación por entregas.

Base: [análisis del 8/9](../analisis/2026-09-08-web-v2-vision-de-pais.md). Ejecución: [plan detallado](../plans/2026-09-09-mapa-vision-de-pais-plan.md).

## Resultado buscado

Una persona encuentra su territorio, comprende qué se sabe y qué falta conocer, aporta una experiencia o capacidad y puede seguir cómo ese aporte participa en la formulación de un objetivo, una alternativa y una acción. Las comunidades conectan esos objetivos entre territorios para construir una visión nacional revisable.

La métrica de resultado conserva la de `apps/mobile/docs/PRODUCT_CONSTITUTION.md`: necesidades verificadas con resolución confirmada sin exponer a personas vulnerables. La elaboración de objetivos compartidos agrega una etapa anterior, no sustituye la comprobación del resultado.

## Decisiones de diseño propuestas

1. El instrumento y la búsqueda territorial pasan al comienzo de `/el-mapa`. La captura se abre de forma contextual y mantiene una ruta accesible propia dentro de la página.
2. La ficha de futuro vincula territorio, temas, señales, evidencia, capacidades, objetivos, alternativas, acuerdos, objeciones y acciones. No reemplaza la señal ni duplica sus textos.
3. El tipo de señal sigue describiendo la naturaleza del aporte; el tema describe sobre qué trata. Un principio o valor puede orientar un objetivo sin introducir de nuevo `valor` como punto geográfico.
4. Se conservan las rutas de Radiografía, Mandato, planes y simulación. Comparten contexto mediante enlaces y filtros compatibles. No se monta toda la plataforma dentro del mapa.
5. Las lentes finales serán Situación, Capacidades, Futuro, Caminos y Seguimiento. Se incorporan progresivamente cuando tengan una tarea real que resolver. Cobertura y procedencia permanecen visibles como información transversal; no se publican pestañas vacías por anticipado.
6. Los agregados analíticos se calculan sobre el corpus elegible completo. Los puntos visibles pueden paginarse o agruparse y nunca determinan por sí solos los totales.
7. No se presenta representatividad, acuerdo, urgencia, resolución o auditoría como consecuencia automática de un conteo, una similitud textual, una visita o un umbral de volumen.
8. La identidad editorial se mantiene. La superficie de trabajo no depende de un rito de activación para tener contraste y colores legibles.

## Qué constituye una ficha útil

La ficha tiene identificador público y versión; una pregunta concreta; territorio o ámbito temático; situación actual con sus límites; futuro deseado; un objetivo verificable o la explicación de qué falta para medirlo; capacidades; alternativas; desacuerdos; una acción siguiente; y responsables identificados por su rol y aceptación.

Una ficha en borrador puede estar incompleta. Publicar una síntesis exige que las ausencias estén declaradas. Nombrar un objetivo «acordado» requiere un proceso identificado: convocatoria, alcance, participantes según la unidad realmente medida, regla anunciada, resultado, objeciones y fecha de revisión. No significa autorización de toda una localidad ni mandato estatal.

## Reutilización

- `senales`, su vocabulario y confirmaciones: fuente de aportes y estados de corroboración.
- Actores y adhesiones: participación con límites explícitos; un actor de navegador no se renombra como persona única verificada.
- Catálogo y búsqueda geográfica existentes: selección de lugares y pertenencias territoriales.
- Iniciativas, tareas, hitos y evidencia: ejecución de acciones, después de completar los permisos y operaciones que falten.
- Radiografía: sugerencias temáticas corregibles, sin aprobar objetivos automáticamente.
- Mandato: síntesis trazable de procesos y resultados reales.

Los objetivos personales de `civic_goals` y el catálogo editorial `resources` no pasan a ser objetivos colectivos ni inventario de capacidades por compartir un nombre parecido.

## Límites del primer alcance

La primera versión útil se centra en territorios piloto y uno o dos temas. La búsqueda nacional puede existir antes de que haya fichas o geometrías detalladas en todo el país: esos vacíos se muestran. No se requieren nuevas bases de datos, un motor de grafos, un índice universal de bienestar ni predicciones nacionales para completar el circuito inicial.

Los datos simulados y los ejemplos existentes conservan su aislamiento. Las pruebas automatizadas usan entornos de test; no se siembran datos de demostración en el registro público.

## Evolución respecto de documentos anteriores

Esta propuesta actualiza el orden de entrada de la spec de mapa del 22/7 y la organización de modos del instrumento del 26/7. Propone construir la deliberación que la spec de señal del 11/8 dejó fuera de alcance; sus mensajes de indisponibilidad solo cambiarán cuando la función esté disponible en la superficie correspondiente.

Se mantienen la Constitución de producto, los nueve tipos en cuatro clases, la distinción adhesión/votación/corroboración, la precisión protegida, el retiro y las separaciones de ejemplos de las enmiendas del 16/8 y 20/8. Las afirmaciones históricas de esos documentos sobre una base vacía no se consideran estado actual sin verificación.

## Prueba de aceptación global

Un equipo territorial puede abrir una ficha, vincular aportes y fuentes, formular un objetivo, discutir alternativas, registrar diferencias, aceptar una acción y comprobar su resultado. Una persona ajena al equipo puede leer ese recorrido y explicar qué está confirmado, qué es propuesta y quién falta participar.

El [plan](../plans/2026-09-09-mapa-vision-de-pais-plan.md) descompone esta prueba en entregas verificables.
