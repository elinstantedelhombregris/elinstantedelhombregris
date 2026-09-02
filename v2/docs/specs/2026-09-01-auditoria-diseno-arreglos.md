# Los arreglos de la auditoría de diseño — spec

Fecha: 2026-09-01 · Origen: auditoría visual y de lectura del sitio en producción (D-078 a D-082 en `docs/DEUDAS.md`).

## Qué se arregla y qué no

Se arregla lo que el sistema de diseño ya pide y el sitio no cumple, más lo que rompe la lectura en el teléfono. **No se cambia ninguna palabra existente**; se agregan solo las frases de estado vacío que el régimen de cifras exige (§5 «Cifra sin dato») y se reutilizan las que el sitio ya usa.

Fuera de alcance, a propósito: agrupar los 27 planes por tema (el registry no tiene taxonomía y la inventaría el código), acortar el footer en los lectores, y tocar la navegación del header.

## Decisiones

1. **El mapa en móvil (D-078).** La barra de modos del instrumento scrollea horizontal por sí misma (`overflow-x-auto`, botones `shrink-0 whitespace-nowrap`). El documento nunca supera el ancho del viewport.
2. **El sello EJEMPLO del mandato (D-079).** Bajo 560px sale del flujo absoluto y va en línea arriba del título, como ya hace el lector de PLANes.
3. **La franja de cifras (D-080).** Con cero real, el slot dice «Todavía ninguna.» en Anton chico dentro de la misma caja de 46px; el rótulo mono no cambia. La línea de cierre de La idea con cero dice «Nadie habló todavía. Empezá vos.» (las palabras del header). Con dato, números como hasta ahora. El «27» de planes se queda: es contenido, no participación.
4. **Contraste.** `tinta-50` pasa de `#7A756A` a `#6B665C` (4,97:1 sobre papel, 4,66:1 sobre papel presionado: AA para texto chico). `tinta-30` sigue siendo decorativo: numeración y deshabilitado; el texto con significado que hoy lo usa (metadatos, migas, notas de pie de sección, firmas) pasa a `tinta-50`. En la banda gris de Inicio, kicker y leyenda de los palitos van en tinta, no en papel.
5. **El lector de PLANes (D-082).** `renderMarkdown` pone `id` a cada encabezado (slug del texto, único por documento). Un componente `IndiceLector` recibe las secciones (`h2`) y rinde: en ancho ≥1141px una columna fija a la izquierda del papel con scroll-spy (misma receta que el fichero de la biblioteca) y la línea mono «Sección {n} de {total}»; por debajo, un `<details>` plegado arriba del documento con la lista de anclas. Los ids salen de la misma función que usa el renderer, así los links nunca apuntan a nada.
6. **Notas al pie (D-081).** `renderMarkdown` entiende `[^id]` y `[^id]: texto` (una línea): la referencia queda como superíndice con link y las notas se listan al final bajo una regla, con vuelta a la referencia.
7. **El formulario del mapa.** Los textos de consentimiento, las glosas de las opciones y las ayudas de campo pasan de Space Mono 10–11px a Archivo 13–14px en `tinta-75`. Los rótulos, chips y botones siguen en mono.
8. **Las cards de planes de Inicio.** El kicker con el título del plan ya no se trunca con puntos suspensivos: envuelve hasta dos líneas.
9. **El rito, una vez por sesión.** Las animaciones de entrada (`inkfill`, `inkfill-claro`, `vpop`, `fadeup`) corren completas la primera vez que el sitio abre en una pestaña; desde la siguiente navegación o recarga en la misma sesión, la clase `rito-visto` en `<html>` las lleva a duración cero y la página llega leída. Las de interacción (`stampin`, `dropin`, `growbar`, `fadeup-rapido`) no se tocan.
10. **La fila de índice expandible.** Al pasar el mouse por la fila el código y el glifo se ponen en violeta: la fila entera avisa que se abre.
11. **Los CTAs del hero de Inicio.** Van debajo del párrafo de apertura, alineados a la izquierda, en vez de flotar a la derecha.

## Cómo se verifica

Tests unitarios por cada pieza (vitest), `pnpm lint`, `tsc`, build, y una recaptura con Playwright a 390px y 1440px de Inicio, El mapa, El mandato y un PLAN.
