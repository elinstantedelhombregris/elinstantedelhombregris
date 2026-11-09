# Cierre editorial — ¿Quién firma tu vida?

4 de noviembre de 2026, Mendoza. Incorporado a la Bitácora de v2 en `/bitacora/quien-firma-tu-vida`; verificado como primera entrada del índice. Entrega local, sin publicación en un servidor ni cambios en el sitio legado.

## Artículo y criterio

`../../content/blog/quien-firma-tu-vida.mdx`. Unas 3.400 palabras de texto y epígrafes; lectura estimada de 18 minutos. Voz rioplatense, íntima y sistémica, usando los dos documentos del personaje como referencias literarias. La imagen aportada se trata como provocación y se cuestiona su lenguaje deshumanizante. La atribución bibliográfica y su límite quedan en una nota, sin inventar edición o página.

Tesis: recuperar autoría requiere revisar las propias razones, responder por los costos sobre otros y crear condiciones materiales e institucionales para poder elegir. Seis propuestas cubren decisiones personales, encuentros vecinales, aprendizaje, trabajo, producto digital y participación municipal. El recorrido de noventa días es una propuesta de evaluación, sin beneficios garantizados.

## Panel hostil de tres agentes

El panel es una revisión editorial con agentes independientes, no una evaluación de expertos humanos. Los informes conservan los hallazgos del primer borrador; las resoluciones se resumen aquí.

| Perspectiva | Objeción principal | Cambio incorporado | Segunda lectura |
| --- | --- | --- | --- |
| Filosofía y voz | Una explicación convincente puede racionalizar obediencia; la libertad propia puede cargar costos sobre otros. | Pruebas contra las propias razones, obligaciones compartidas, legitimidad del ocio y organización para disputar reglas. | Sin defectos sustanciales pendientes, según dictamen final del agente. |
| Viabilidad institucional | Voluntarismo, exposición laboral, participación decorativa e inclusión subordinada al presupuesto. | Acuerdos de disponibilidad y evaluación; objeciones fuera del mando directo; no recoger testimonios si no se protege identidad; decisión municipal abierta, alcance consultivo explícito, recursos previos y vía de reclamo. | Sin P1/P2 sustanciales pendientes para un ensayo. |
| Evidencia | Confusión entre dos trabajos de Brady; selección parcial de resultados sobre feeds. | Referencia correcta de 2021, inclusión del experimento de X de 2026, distinción entre activar y desactivar, límites de población/período. | Sin bloqueos factuales. Gráfico contrastado con fuente primaria. |

Informes: `2026-11-04-identidad-revision-filosofica.md`, `2026-11-04-identidad-revision-viabilidad.md` y `2026-11-04-identidad-evidencia.md`. La preparación de cualquier piloto concreto requiere sus propios recursos, acuerdos y revisión; el artículo no certifica su eficacia.

## Medios

Todos los medios del artículo viven en `../../apps/web/public/media/bitacora/editorial/`.

| Archivo | Función | Formato y comportamiento |
| --- | --- | --- |
| `quien-firma-tu-vida.webp` | Portada: mesa, espejo, cuaderno y raíces compartidas. | Ilustración generada con la herramienta integrada de imágenes; 1672 × 941; 692.444 bytes. |
| `identidad-mesa-comun.webp` | Autonomía, escucha y trabajo común. | Ilustración generada con la herramienta integrada de imágenes; 1672 × 941; 694.182 bytes. |
| `identidad-circuito.svg` | Circuito hipotético de atención y cansancio. | Vector original; cuatro énfasis de color, una sola secuencia de 4,4 segundos; movimiento reducido desactiva la secuencia. |
| `identidad-evidencia.svg` | Punto e intervalo del índice agregado de opiniones. | Vector original estático; unidad y contraste explícitos, incertidumbre visible; ningún resultado no significativo se dibuja como cero. |
| `identidad-90-dias.svg` | Calendario propuesto para acordar, probar y revisar. | Vector original; tres énfasis de color, una sola secuencia de 3,3 segundos; movimiento reducido desactiva la secuencia. Las tarjetas no dibujan duraciones a escala. |

Los dos prompts íntegros, el modo de generación y los destinos están guardados en `2026-11-04-identidad-imagenes.prompts.txt`. Los PNG originales se conservan en la carpeta de imágenes generadas de Codex; el proyecto consume copias WebP. La conversión solo comprime el formato, sin alterar la composición. Las cinco imágenes llevan texto alternativo y dimensiones; los epígrafes explican los modelos también sin animación.

## Verificación

- 68 pruebas aprobadas en siete archivos: registro, fechas y navegación, índice y lector, metadatos, Markdown y escenas existentes.
- Compilación web de producción completada. No se ejecutó el conjunto completo de comprobaciones de API/base de datos, ajeno a estos archivos de contenido y medios.
- SVG analizados como XML; títulos, descripciones, ausencia de scripts, secuencias finitas y regla de movimiento reducido verificados en los archivos.
- Revisión visual del artículo en escritorio y móvil, incluidos portada, diagrama conceptual, gráfico de evidencia y calendario. Sin desbordamiento horizontal en los tamaños comprobados; los cinco medios cargaron correctamente. Dimensiones intrínsecas incorporadas al cuerpo para reservar espacio antes de cargar imágenes.
- Verificada la primera fila del índice: título, fecha del 4 de noviembre y categoría Sociedad.
- El gráfico cuantitativo fue revisado por el agente de evidencia: dato, intervalo, unidad, contraste y escala coherentes con su fuente. El circuito y el calendario se rotulan como hipótesis y propuesta.

La compilación emite advertencias existentes sobre Browserslist y la clase `duration-[1400ms]`; no impiden compilar y no se modificaron dependencias ni estilos de la aplicación.

## Edición autónoma y capturas

`../../../output/bitacora-quien-firma-tu-vida/lectura.html` contiene el mismo cuerpo del artículo, renderizado con el lector Markdown del proyecto, con sus cinco imágenes incorporadas. Se puede abrir sin servidor y conserva las animaciones SVG. Usa una hoja de estilos de lectura propia, con la paleta de papel y tinta.

En esa misma carpeta están `portada-escritorio.jpg`, `evidencia-escritorio.jpg` y `recorrido-movil.jpg`, capturadas del lector real. Los archivos iniciales ajenos a esta tarea no se modificaron.
