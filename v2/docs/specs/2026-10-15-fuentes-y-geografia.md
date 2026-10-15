# Fuentes consultables y geografía versionada

## Problema y alcance

Las fichas documentan fuentes manualmente, pero no permiten distinguir una referencia contrastada con una publicación primaria de una carga libre. Los GeoJSON del IGN se reemplazan por nombre; el importador escribe cada capa antes de validar el conjunto. Una falla tardía puede mezclar versiones. «Imaginar mi Argentina» sí abre tres preguntas dentro del mapa, pero los títulos de la entrada no explican ese recorrido.

Esta entrega prepara una selección editorial de dos temas cotidianos (servicios básicos y conectividad), con cuatro indicadores censales. La selección sirve como punto de partida y no acredita un piloto real ni representa preferencias ciudadanas. Cada cifra identifica universo, fecha, escala, localizador en el original, condiciones de uso y limitaciones. Verificar la transcripción y procedencia no equivale a certificar la realidad actual ni a una auditoría independiente.

## Implementación

1. Catálogo versionado con validación compartida, referencias primarias y huellas del material consultado. Consulta pública y uso explícito en el borrador de una ficha. Una referencia al catálogo nunca convierte texto modificado en dato verificado.
2. Publicaciones geográficas inmutables con manifiesto de capas, códigos, cobertura, simplificación y huellas. El navegador solicita la versión declarada; la API conserva la misma geometría provincial. Validar todas las capas antes de activar una versión. Historial de intentos, incluidos fallos, manteniendo la última publicación válida.
3. Mantener explícitas las correspondencias sin verificar: municipio no equivale a departamento; localidad censal no equivale a municipio; un radio censal necesita fuente y edición propias. No habilitar agregados departamentales ni municipales sin sus controles pendientes.
4. Entrada de participación con título y explicación de las preguntas; conservar mapa, contexto, rutas y borradores existentes.
5. Pruebas de integridad, preservación tras fallo, referencias alteradas, interfaz y navegación. Verificación completa aislada de producción.

## Límites

No se actualizan datos de producción ni asignaciones territoriales históricas. La cartografía conservada procede de la descarga documentada del 22/9/2026; sellarla hoy no constituye una descarga nueva. La geometría simplificada sirve al instrumento y no a determinar límites catastrales. La edición censal y la cartografía actual no se declaran intercambiables. Los radios censales, áreas habitadas y conciliación completa con el catálogo operativo requieren conjuntos específicos. El trabajo con personas reales, publicación institucional y pruebas físicas de la app siguen siendo actividades externas al desarrollo local.
