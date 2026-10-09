# C · Mapa, Radiografía, Mandato, Datos abiertos

> Informe de subagente (Sonnet), 2026-10-09, rama `codex/argentina-ideal`. Citas verificadas por muestreo; el resto es su lectura.

Revisé el código de las cuatro páginas y las dos capturas de `output/preview`. No ejecuté la app. Las rutas de la tabla son relativas a `/Users/juanb/Desktop/ElInstantedelHombreGris/v2/apps/web/src/pages/`.

## 1. Hallazgos

| Sev. | Tipo | Archivo:línea | Qué pasa | Propuesta |
|---|---|---|---|---|
| Alta | UX | ElMapa/sections/ParticiparEnMapa.tsx:27,36,83,91 | `lugarInicial` queda fijo al montar. Si elegís otra provincia, el panel sigue mostrando y mandando el lugar viejo. | Usar el `lugar` vivo y avisar: «Cambiaste de lugar: ahora es Salta.» |
| Alta | copy | Instrumento.tsx:150; ListaRegistros.tsx:21; FiltrosExploracion.tsx:62; ParticiparEnMapa.tsx:39 | Mirada, aporte, voz, señal y registro nombran lo mismo. «Mirada» (25 usos) es el tic que el dueño rechazó. | Una palabra: «voz», como el header. «Registro» solo en datos. Botón: «Sumá tu voz al mapa →» / «Cerrar el formulario». |
| Alta | copy/IA | PortadaMapa.tsx:18; SeccionInstrumento.tsx:41; FuturosTerritorio.tsx:34-40,118 | El H1 no dice qué es. El titular es simétrico: «Una mirada abre una pregunta. Una pregunta puede cambiar un lugar.» | H1: «Qué dice la gente, dónde y cuándo». Bajada: «Cada punto es algo que alguien contó: un problema, un deseo, algo que ya funciona. Buscá tu zona o dejá tu voz.» Futuros: «Qué se arma con estas voces». Campañas: «Convocatorias abiertas». |
| Alta | UX móvil | SeccionInstrumento.tsx:40; FiltrosExploracion.tsx:116 | Bajo 640 px se ocultan la única bajada y el aviso «no toda la población». | Línea visible: «Solo cuenta lo que la gente cargó con ubicación. No es toda la población.» |
| Alta | copy/dataviz | ListaRegistros.tsx:48-52; DetalleRegistroMapa.tsx:48 | Muestra «Precisión: neighborhood» en inglés crudo. El detalle no dice cuánta precisión hay. | Reusar `etiquetaDePrecision` (`lienzo/precision.ts`): «Ubicación aproximada, en su barrio. No es una dirección.» |
| Alta | principio | instrumento/PanelArea.tsx:111 | «Celdas mudas. Nadie dijo nada ahí» afirma silencio a partir de la ausencia de puntos. Contradice useModoMapa.tsx:168. | «En X de N celdas no hay puntos publicados: nadie cargó nada, o lo cargó sin ubicación.» |
| Alta | UX/consent | sections/PanelSoltarVoz.tsx:108-125 | Tras publicar siguen tildados `publicar`, `cede`, `casa` y `tipo`. La próxima voz sale con el consentimiento irrevocable ya marcado. | Resetear los cuatro en `confirmar`. |
| Media | privacidad | SelectorPrecision.tsx:55-58 | Un toque en «usar mi ubicación» deja el punto exacto. | Default «unas cuadras»: «Por defecto publicamos tu zona aproximada.» |
| Alta | comprensión | LaRadiografia.tsx:13,84-99; sections/ComoLeerElCielo.tsx (huérfano) | Se quitó la leyenda que pidió la revisión del 19/8: «núcleo», «señal», tamaño y color quedan sin definir. La bajada tiene tres imperativos y un aforismo. El aviso clave está en 14 px. | Restaurarla. Bajada: «La Radiografía agrupa lo que la gente cargó según qué tan parecido es el texto. No es una encuesta ni dice qué piensa el país.» Aviso visible sobre el gráfico: «Que muchas voces digan lo mismo no prueba que sea cierto. Contamos registros, no personas.» |
| Alta | copy/a11y | lentes.ts:8-25; ExploradorConstelacion.tsx:101,104-106,117,130 | Núcleo, isla, componente y racimo son cuatro nombres. Hay jerga («semejanza medida», «3 solas»). En modo compacto el texto visible («Por clase») difiere del `aria-label` (WCAG 2.5.3). | Lentes: «Líneas · Grupos · Por tipo». Grupos: «Cada grupo junta voces parecidas según el nivel de abajo. Dónde queda en pantalla no significa nada.» Resumen: «412 voces · 9 grupos · 37 sin grupo». |
| Alta | UX | SelectorDelCielo.tsx:67-74,108 | Seis botones iguales «2 señales · 2 provincias» (se ve en la captura). La frase está solo en `aria-label`. Las voces se llaman «Lo que querés 3». | Mostrar la frase del centro (≤80 caracteres) y los conteos. Voces: «Voz 3 · lo que querés». |
| Alta | dataviz | BarrasOpiniones.tsx:31-32,59-75,85,93-101 | Una métrica por vez, ordenable por «acuerdos» sin aviso al lado. Con n=5 muestra «60,0 %». El aria usa «.» y la vista «,». | Barra apilada acuerdo/desacuerdo/paso con n visible. Con menos de 30 respuestas, sin decimales y «pocas respuestas». Título: «Cómo respondieron a cada afirmación». Nota fija: «Más acuerdo no vuelve cierta una afirmación ni obliga a hacer nada.» |
| Media | copy/dataviz | LecturaOpiniones.tsx:25-36,104-125,150 | Jerga («ficha», «exposición», «proyección», «Condiciones entre grupos»). Las diferencias entre grupos son texto corrido. Los límites están en un `<details>`. | «Acá se ve si hay acuerdo con una afirmación concreta. Estar cerca en el cielo no cuenta: cuenta cuando alguien contesta.» Subtítulo «Cómo respondió cada grupo», una barra por grupo. |
| Alta | datos a mano | sections/LosTresEjemplos.tsx:112-113; TablaDeLosTres.tsx:113,217,297; MandatoDelEjemplo.tsx:42 | «63 señales, 44 personas, 8 territorios, 12 meses», «otras 62» y «63 voces» están escritos a mano. En :297 dice «63 personas» y son 44. | Derivarlos de `LOS_TRES_ESCENARIOS` y el padrón. |
| Media | copy | LaRadiografiaEjemplo.tsx:108-125; LosTresEjemplos.tsx:99,141,165 | H1 «Aprender a mirar.». La frase que explica el laboratorio es `sr-only`. El aviso muestra `pnpm radiografia:ejemplos`. | H1: «Laboratorio: las mismas frases, escritas de tres maneras». Visible: «Son {n} frases inventadas. Elegí cómo están escritas y mirá cómo se agrupan.» |
| Alta | UX móvil | sections/Constelacion.tsx:173; ExploradorConstelacion.tsx:191 | Canvas de 390 px con `touch-none`: no se puede scrollear con el dedo sobre el cielo. | `touch-action: pan-y` y mover con botones. |
| Media | dataviz/a11y | constelacion-pintor.ts:303; ExploradorConstelacion.tsx:220,227; radiografia-data.ts:47 | El radio crece con el tamaño del grupo y no hay leyenda. Las voces sueltas forman un anillo equiespaciado. La clase se codifica solo con color, y acto y meta tienen luminosidad casi igual (0,15 vs 0,12). Los nombres de clase difieren de los del mapa. | «El tamaño marca cuántas voces tiene el grupo, no cuánto importa.» Anillo rotulado «Sin grupo (posición solo de acomodo)». Un solo juego de nombres (`CLASE_ROTULO`) y forma además de color. |
| Media | a11y | Instrumento.tsx:290; RegistroDelMapa.tsx:77; Chrome.tsx:230; useModoAnalisis.tsx:385,406 | `oscuro-tenue` rinde 2,6:1 sobre tinta, y 2,3:1 sobre la barra. Incluye la atribución OSM. Hay texto de 9 px. | `oscuro-meta` (5,4:1) y mínimo 10 px. |
| Media | UX | FiltrosExploracion.tsx:19-21,42; Instrumento.tsx:150,199; catalogo-modos.ts:10 | Filtros plegados en todos los anchos (el comentario dice «teléfono»). En ≤960 px las herramientas quedan debajo del mapa. Las pestañas no dicen su pregunta (`MODOS.descripcion` no se usa). «Tu mirada está en elaboración» parece un estado. | Pestañas: «¿Dónde? ¿Cuánto? ¿Cuándo? ¿Qué falta? ¿Y si…?». Botón: «Cerrar el formulario». |
| Media | copy | ProcedenciaConsulta.tsx:18-28; ListaRegistros.tsx:22-30; Instrumento.tsx:183; Chrome.tsx:142-151,193; CabeceraProcedencia.tsx:94-112; LaRadiografia.tsx:128 | Jerga («consulta/página/lente/corte»). Falla la concordancia («registros… Cada una»). Ceros en dígitos, regresión de D-080. «1 filtros elegidos». | «Mostramos 500 de 1.234 registros que cumplen los filtros. Son lo que dijo cada persona; ninguno es un acuerdo.» Vacío: «Ningún registro cumple estos filtros. Que no haya no quiere decir que no pase nada: nadie lo cargó acá.» Contador: «Sin ubicación en el mapa: 3. Están en la lista.» |
| Media | dataviz | AmbitosProvinciales.tsx:42-54; useModoMapa.tsx:157 | El lavado violeta (color de «deseo») es uniforme en toda provincia con registros y no tiene leyenda. | Color neutro y leyenda: «Sombreado: provincia con registros sin punto. No marca dónde pasó.» |
| Media | copy | ElMandatoVivo/sections/PortadaMandato.tsx:21-25; DocumentoMandato.tsx:109; DocumentoSecciones.tsx:28,89,126,156,196 | No dice que hoy no hay mandato. «Conservamos la forma del documento anterior» es un changelog. Hay cuatro vacíos seguidos con «nadie/ninguna», «Eso también es un dato» y un ranking con 1, 2, 3 grandes. | «Un mandato es una exigencia con fecha, responsables y forma de comprobarla. Hoy no hay ninguno: acá ves qué se arma y qué dijo la gente.» Un solo vacío por sección y sin numeración. |
| Media | copy | ProcesosPublicos.tsx:30-34,45-46,103,107; DocumentoMandato.tsx:58 | «Una voluntad encuentra a otras…». «3 de las 3… El catálogo devuelve hasta 100» filtra un límite de la API. «1 devoluciones». Fecha cruda. «Esto se rompió. Lo decimos porque publicamos todo» se repite 3 veces. | «Campañas y fichas abiertas hoy. Aparecer acá no les da representación ni efecto oficial.» «3 de {n}» solo si n>3. Error: «No pudimos cargar esto. Probá de nuevo en un rato.» |
| Media | dataviz | RegistroDelMapa.tsx:26,43-56 | La barra se normaliza al máximo pero el rótulo es «% del total». El título es de 11 px. | Escalar al total. Título: «Qué dijo la gente, por tipo (N registros, fecha)». |
| Media | copy | DatosAbiertos.tsx:12-13,18-21,46-58; DescargarDatos.tsx:235,293 | H1 de sermón. Muestra «territorio: 14 · campana: uuid» crudo. «Vectores» y «número mágico». «Descargar» solo pide un trabajo. 100.000/256 MB escritos a mano. | H1: «Descargá los datos públicos». «Vas a descargar: campaña Agua, territorio Salta.» Botón: «Preparar el archivo». «Los vectores (huella numérica de cada texto) no se publican: aun sin nombre podrían ligarse a una persona.» |

## 2. Patrones transversales

- **Vocabulario sin dueño.** Hay cuatro familias de nombres para lo mismo:
  - voz, mirada, aporte, señal, registro;
  - núcleo, isla, grupo;
  - Hecho/Deseo/Acto/Meta frente a «Lo que hay/Lo que querés/…»;
  - «ficha», «lectura», «consulta», «corte» y «alcance» sin definir (32 a 77 usos cada uno).

  Conviene un glosario en `lib/vocabulario.ts` y un test que prohíba «mirada».
- **El aviso honesto queda en el lugar equivocado.** «Converger no es corroborar» está en 11-14 px, dentro de `<details>` o escondido en móvil. Los gráficos no traen su n ni un «qué NO concluir» pegado.
- **Kit paralelo.** `participacion/Elementos.tsx` (29 archivos) duplica `BotonPapel`, `Kicker` y `BandaCta`, y sus enlaces no tienen hover ni foco. Además hay glifos crudos y texto de 9-10 px.
- **Móvil.** Lo explicativo se oculta y lo interactivo atrapa el scroll.
- **Voz de desarrollador y aforismos de cierre en la UI.** Ejemplos: `pnpm…`, «documento anterior», «también es información», «número mágico».

## 3. Profundidad

- **Radiografía real:** hoy está casi vacía (el header dice 4 aportes). Lo que enseña vive en el laboratorio, dentro de tres `<details>` (LosTresEjemplos.tsx:106,187,225). Subir «la misma demanda escrita de tres maneras» como pieza principal.
- **Acuerdos y diferencias:** hacen falta barras por grupo con n. Cada afirmación debería enlazar a su ficha y al PLAN que la trata. Ninguna de las cuatro páginas enlaza `/planes/:slug`; solo LasActasDeEjemplo.tsx:100 nombra PLANes, en texto plano.
- **Mapa:** cada pestaña debería llevar la pregunta que contesta y un «qué NO concluir». Falta ligar tema con PLAN, y desde el lazo un «convertir esta área en campaña».
- **Mandato:** reemplazar las tres cards (top-3 de listas) por un embudo con denominadores reales: campañas abiertas, fichas con respuestas, pruebas en curso, resultados revisados.
- **Datos abiertos:** falta un manifiesto vivo (n, corte, formatos), un diccionario de campos, cinco filas de muestra y «cómo citar».

## 4. Lo que funciona

- La cabecera de procedencia («A quien usó la plataforma. No a quien vive acá», CabeceraProcedencia.tsx:118-124) y `RegimenDegenerado` son honestas.
- El sello dentro del lienzo y `data-origen`. El sello EJEMPLO va en flujo (LosTresEjemplos.tsx:103), sin riesgo de D-079.
- `ListaDeNucleos` como tabla accesible. El canvas es `aria-hidden` y tiene selector alternativo.
- El mapa no inventa puntos: el halo sigue la precisión y las provincias se sombrean sin dibujar un punto.
- Voseo limpio en todo el alcance, y buenas frases como «Una lectura fallida no significa que nadie haya respondido».

## 5. Fuera de tu área

- **Conteos de PLAN a mano** (ninguno dentro del alcance):
  - UnaRutaParaArgentina.tsx:15 («22 PLANs»);
  - Bienvenida.tsx:23 («22 PLANes»);
  - UnaRutaParaArgentina/sections/PlanesGrid.tsx:30 («Los 22 PLANs»);
  - lib/planes-index.generated.ts:132 («22 PLANes simultáneos»), que contradice :267 («veintiséis»);
  - docs/design-system/README.md:76,181,187;
  - components/papel/primitives/primitives.test.tsx:20.
- **Código muerto:** `PopoverVoz`, `MapaArgentina` y `FeedVoces` no tienen importadores fuera de tests. Los cambios del diff en `PopoverVoz` no se ven.
- **Glifos:** el README del sistema de diseño cita `primitives/Glifos.tsx`, que no existe. ▾ ↺ ▌ siguen como caracteres crudos (PanelSoltarVoz.tsx:215, CamposPorTipo.tsx:140, DocumentoMandato.tsx:68, DocumentoSecciones.tsx:159).
- **Duplicación:** useModoMapa.tsx:31-37 copia los radios de `publicLocationUncertaintyKm` (civic-core/geo.ts:58).
- **Token inexistente:** ColaDeVerificacion.tsx:55,59 usa `border-tinta-25`, que no está en el config. En :50 hay una tilde obsoleta («Éstas»).
- **Cadena frágil:** DetalleRegistroMapa.tsx:35 compara contra el literal `'Texto reservado por su autoría.'`.
- **Deuda abierta:** D-088 (brillo invertible, privacidad) sigue abierta; revisar Cobertura antes de pulir.
- **Verificar:** FichaDeNucleo.tsx:95 muestra «Los dos más lejanos: N km»; conviene confirmar en el servidor que no mida entre centroides provinciales. DocumentoMandato.tsx:93 usa un sello rojo «Registro» (el rojo es de EJEMPLO) y va absoluto entre 561 y 960 px, así que puede solapar con el texto.
