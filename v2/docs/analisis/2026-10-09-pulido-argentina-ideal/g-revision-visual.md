# G · Revisión visual (capturas locales 1440 y 390)

> Informe de subagente (Sonnet), 2026-10-09, rama `codex/argentina-ideal`. Citas verificadas por muestreo; el resto es su lectura.

## 1. Cómo se capturó

- **Base local: sí.** Levanté mi propio Postgres con `initdb` y `pg_ctl` en `127.0.0.1:55441`, base `basta_descartable_test`.
- **API arriba: sí.** Corrió en el puerto 4100 con `DATABASE_URL=postgresql://postgres@127.0.0.1:55441/…`. Antes de arrancar imprimí el host (`127.0.0.1`). Después comprobé con `lsof` que el proceso solo tenía su socket de escucha, sin conexiones a Neon.
  - Para hablar con Postgres local usé un wrapper temporal que instalaba el puente de `@v2/db/testing/neon-local`. El puente se niega a arrancar con una URL que no sea local.
  - Vacié las claves de Resend, Groq y Anthropic para que no hubiera llamadas externas.
  - Nunca toqué `v2/.env` ni la base de producción.
- **Datos de demo: sí.** Hice `pg_dump` de solo lectura de la base descartable que ya corría en `:55440` (no es mía) y la restauré en mi cluster. Quedó la demo curada: 1 campaña, 1 ficha y 4 señales.
- **Web:** Vite en el puerto 5273, porque el 5173 estaba ocupado por otro proyecto.
- **Usuario logueado: no.** No creé cuentas ni inicié sesión. La regla de pruebas locales exige que lo pida el usuario en el chat, y un pedido de otro agente no alcanza. Por eso Mi espacio, Gestión y Colaborar están en estado deslogueado. Si querés ver Mi espacio con sesión, hace falta que el usuario lo autorice.
- **Cómo se tomó:** Playwright, un contexto nuevo por ruta y viewport, así que el rito corrió completo. Esperé 3 s, recorrí la página para disparar los revelados y saqué página completa.
- **Limitación:** el cielo del mapa se ve con la base de 4 señales de ejemplo, así que "vacío" no dice nada sobre producción (D-002).

PNG originales en el scratchpad de la sesión (efímero); una selección quedó en `capturas/` con nombre `<ruta>-<1440|390>.jpg`. Rutas: home, imaginar, campanas, campana-detalle, campana-participar, campana-devolucion, fichas, ficha-detalle, ficha-nueva, colaborar, sembrar, mi-espacio, gestion-campanas, ingresar, registrarse, el-mapa, la-radiografia, la-radiografia-ejemplo, mandato-vivo, mandato-vivo-ejemplo, datos-abiertos, senal, lo-que-falta. Hay recortes en `cortes/` y mediciones en `informe*.json`. Las capturas `_mapa-vp-*` y `_ej390-vp` son de viewport.

## 2. Hallazgos visuales

| Ruta | Viewport | Sev. | Qué se ve | Propuesta |
|---|---|---|---|---|
| /ingresar, /registrarse | ambos | **Alta** | Los inputs son invisibles: parecen etiquetas flotando sobre espacio vacío. El componente usa tokens del tema oscuro (`border-white/10`, `bg-white/5`) sobre papel. | Dar a `ui/input` borde y fondo de papel (`border-tinta`, `bg-papel`). |
| /ingresar, /registrarse | ambos | Media | Botón "Iniciar sesión" violeta pastel, de esquinas redondeadas y con letra normal. Es un segundo dialecto de botón respecto del cuadrado, mono y en mayúsculas del resto. Su contraste es 4,1:1. | Usar el botón de papel; subir el contraste. |
| /el-mapa | 390 | Media | La barra de modos mide 541 px en 390: "COBERTU…" queda cortado y "Simulación" no se ve, sin degradé ni flecha que avise que se desliza. | Agregar degradé en el borde, o dos filas, o scroll-snap con indicador. |
| /el-mapa | 390 | Media | La tarjeta "Registros sin punto publicado" (4) tapa casi la mitad superior del mapa de 440 px, incluida Mendoza. | Pasarla debajo del mapa o colapsarla en una línea. |
| /el-mapa | 1440 y 390 | Media | El encuadre inicial no cubre el país: se corta el norte (Jujuy, Salta) y el sur (Tierra del Fuego). Mendoza cae a un costado y el Atlántico ocupa el centro. | `fitBounds` de Argentina con padding. |
| /el-mapa | 1440 | Baja | El número 4 aparece 5 veces: "4 registros en la consulta · 4 en esta página", "4 sin punto", "4 de 4 coincidentes" y el título de sección. Los textos del instrumento arrancan a 16 px, fuera de la columna de 40 px. | Consolidar los contadores. |
| /el-mapa | ambos | Baja | La atribución OSM/Protomaps tiene contraste 2,6:1 en 10 px. | Subir el tono. |
| /sembrar | 390 | Media | El cuadro "Una voluntad puede sostener una prueba" ocupa 7 líneas y empuja el paso 1 (la acción) bajo el primer viewport. | Plegarlo o ponerlo después del formulario. |
| /sembrar | ambos | Media | "Anónimo si querés · sin registro · sin spam" tiene contraste 1,9:1 y "← Volver" 2,1:1. | Oscurecer. |
| /imaginar, /campanas/…/participar | ambos | Media | Se ve un anillo de foco violeta alrededor del H2 al cargar, por foco programático (`tabindex=-1`, `:focus-visible` verdadero). Parece un error. | Enfocar sin anillo (`focus:outline-none` solo para el foco programático). |
| /imaginar, /participar | ambos | Baja | La barra tiene 4 segmentos pero la leyenda dice "1 de 3". | Alinear el conteo. |
| /campanas/…/participar | ambos | Media | Con la campaña en pausa se muestra el formulario completo (textarea habilitada) y un botón apagado. El aviso arriba lo explica, pero la pantalla invita a escribir. | Deshabilitar el textarea o ir directo a "guardar en este dispositivo". |
| /campanas/:slug | 1440 y 390 | Media | El mismo aviso de "ejemplo/pausa/sin participación real" se repite 5 o más veces: banda, caja, "Qué podés esperar", "Lo que llegó", "Uso de los datos", "Lo que escuchamos". "Ejemplo" aparece unas 8 veces. | Un aviso fuerte arriba; el resto, una frase. |
| /campanas/:slug | ambos | Baja | "Compartir esta pregunta" queda pegado al párrafo sin margen. En 390 los 3 botones apilados tienen anchos distintos. | Margen y ancho uniforme. |
| /campanas | 390 | Baja | El filtro ocupa unos 600 px y la única campaña queda bajo el primer viewport. En 1440, tema se repite como chips y como select. | Colapsar filtros si hay pocos resultados. |
| /fichas, /fichas/:id, /fichas/nueva | ambos | **Media** | Se ven sin migrar: sin eyebrow, H1 chico, columna de 260–1180 (otras páginas usan 210–1230), botón "Crear una ficha →" en azul con letra normal, enlaces subrayados, y dos migas "Volver al mapa / Todas las fichas" también en el listado de fichas. | Llevar a la plantilla de Imaginar/Campañas. |
| /fichas | ambos | Baja | Dice "1 últimas fichas de 1 en este ámbito". | Pluralizar. |
| /fichas/:id | ambos | Media | "0 cuentas con exposición o respuesta · 0 incluidas en la proyección". Además "Todavía no hay afirmaciones" y "Hace falta más conversación" son dos vacíos seguidos. El Historial muestra identificadores crudos: "vinculos, proximaTarea". | Frase en vez de "0 …", un solo estado vacío, etiquetas en castellano. |
| /la-radiografia | ambos | Media | Cuatro vacíos en una pantalla: "Todavía no corrió / nadie midió nada todavía", "0 analizadas", "Hay miradas. Falta poder compararlas", "Estructura insuficiente". También "0 cuentas… 0 incluidas… 0 afirmaciones públicas". | Un estado vacío central; los "0" en palabras. |
| /la-radiografia | 390 | Baja | "VER DE NOCHE" aparece como primer botón sobre los CTAs reales. El select de conversación queda truncado ("…aprender y"). | Moverlo al final de la fila. |
| /la-radiografia/ejemplo | 1440 | Baja | El panel "Volver a una voz" es una columna de unos 550 px casi vacía. Hay dos juegos de pestañas (3 escenarios y 3 lentes). En 390, la leyenda "Arrastrá…" pisa puntos del grafo. | Panel más corto o con ejemplo; leyenda fuera del lienzo. |
| /mandato-vivo | 1440 y 390 | Media | "0 afirmaciones · 0 alternativas · 0 pruebas", "recursos 0" y "0 propuestas registradas" (dígito 0). Los vacíos se repiten: "Todavía no hay devolución", "Nadie ofreció nada", "Ninguna propuesta registrada". Las barras de "El registro del mapa" son marcas finas (¿sin animar?). | Mismo tratamiento que en Radiografía. |
| /mandato-vivo/ejemplo | ambos | **Media** | El eyebrow "UN EJEMPLO, NO EL PAÍS" es violeta sobre casi negro, 2,2:1 (casi ilegible). El sello rojo de las tarjetas da 3,1–3,5:1. | Violeta claro y rojo más claro en noche. |
| /lo-que-falta | ambos | Baja | Eyebrow "CANAL DE ESCUCHA · 0 EN EL REGISTRO". En 390, "CSV" mide 26×18 y "JSONL" 43×18 como blanco táctil. | "Sin registros todavía"; botones más grandes. |
| /colaborar | ambos | Media | Sin invitación solo se ve un aviso técnico ("fragmento privado… copiar el código"), sin explicar qué es la página. | Una frase de qué es y cómo se llega. |
| /mi-espacio | 1440 | Baja | Deslogueado muestra 6 pestañas sobre un solo mensaje de login. En 390 se parten en 3 filas. | Ocultar pestañas hasta tener sesión. |
| Todas (pie) | ambos | Media | Las etiquetas del pie ("RECORRIDO", "PRINCIPIOS"), la línea legal y los enlaces tienen contraste 2,6:1 en 11 px. | Subir el gris del pie. |
| /senal/:id | 1440 | Baja | Un ancho de columna más (380–1060). | Unificar. |
| / (home) | 390 | Baja | Se ve bien. Hay unos 9 "Ejemplo local" entre cinta y tarjetas. | Sin cambios. |

## 3. Overflow horizontal a 390 px

`scrollWidth` es **390 = innerWidth en las 23 rutas**: no hay scroll horizontal de página. Hay recortes locales:

- **/el-mapa:** la barra de modos hace scroll interno (541 en 390).
- **/la-radiografia/ejemplo:** dos tablas con scroll interno (438 y 760 en 350). Eso es intencional.
- **/ (home):** la cinta animada recorta su contenido a propósito.

## 4. Consistencia entre páginas

- **Plantilla de página.** Imaginar, Campañas, Colaborar, Gestión, Mi espacio y Datos abiertos comparten eyebrow, H1 grande y columna 210–1230. Sembrar (310–1130), Fichas (260–1180), Señal y Lo que falta (380–1060 y 310–1130) usan otros anchos.
- **Fichas sin migrar:** botones, enlaces y tipografía distintos de los del resto.
- **Tres dialectos de botón:** el cuadrado mono, el azul de letra normal de Fichas y el redondeado violeta pastel de Login y Register.
- **Mensajes de vacío y "0":** cada página inventa los suyos y muestra el dígito "0" en Fichas, Radiografía, Mandato Vivo y Lo que falta.
- **Pie con contraste bajo en todas las páginas.**
- **Registro noche/papel:** funciona bien. Mandato Vivo y su ejemplo, y el Mapa, van en noche. El documento de papel dentro del fondo oscuro está resuelto.

## 5. Lo que se ve bien

- **Home:** jerarquía clara y una acción evidente en el primer viewport, en 1440 y 390.
- **Campañas y su detalle:** claros, y el ejemplo se distingue de una convocatoria abierta.
- **La Radiografía/ejemplo:** el sello "EJEMPLO · VOCES INVENTADAS" no pisa el título y es legible en ambos tamaños.
- **Mandato Vivo:** el documento de papel dentro de la página en noche.
- **Datos abiertos:** limpia y sin desborde.

## 6. Cleanup

- **Detenidos:** la API (puerto 4100), Vite (5273) y mi Postgres (`pg_ctl stop`, 55441).
- **Sin tocar:** el Postgres del owner en `:55440` y el Vite de otro proyecto en `:5173`.
- **Borrado:** los scripts temporales (`v2/captura-tmp*.mjs`, `v2/apps/api/captura-local.tmp.ts`), el data dir y el dump.
- **`git status`:** no hay cambios en archivos tracked. Solo aparece `?? v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`, un directorio sin trackear que no creé yo.
