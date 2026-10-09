# H · Revisión visual después de las unidades (1440 y 390, local)

> Segunda pasada visual de la rama `codex/argentina-ideal`, 2026-10-09, contra el informe de la mañana (`g-revision-visual.md`). Captura local con Playwright; juicio sobre píxeles, números medidos en el navegador. Las citas de copy están tomadas del DOM renderizado.

## 1. Cómo se capturó

- **Base:** Postgres descartable propio (`initdb` + `pg_ctl`) en `127.0.0.1:55461`, base `basta_descartable_test` (el nombre lo exige `preparar-demo-campanas.ts`). Sockets Unix desactivados, solo TCP local. Antes de migrar, sembrar y arrancar la API se imprimió el host efectivo (`127.0.0.1`).
- **Migraciones y siembra base:** las del script `sembrar-base-de-prueba.sh` (migrate, provincias, rellenar, badges, desafíos, áreas de vida).
- **Demo de campañas:** `preparar-demo-campanas.ts --aplicar` (campaña `demo-local-aprender-mendoza`, en pausa, edición 2; 1 ficha; 3 señales sintéticas). Ese script escribe `output/preview/saneamiento-fixtures-campanas.json`, que está **versionado**: se restauró con `git checkout` y el árbol quedó limpio.
- **Campaña nacional:** `db:seed-campana-nacional --url=<local> --owner-username=juan_local --aplicar` → `mi-argentina-ideal`, edición 1, abierta, responsable «Juan Bravin».
- **Usuario local:** `juan_local` (nombre «Juan Bravin»), insertado directo en la base con `psql` y un hash bcrypt de costo 12 de una contraseña aleatoria generada acá (no se muestra ni se reutiliza), `email_verified = true`. La API corrió con `ADMIN_USERNAMES=juan_local`; el login local devolvió `esAdmin: true`. Las cookies de sesión se obtuvieron con el `request` de Playwright y se pusieron en el contexto.
- **API:** wrapper temporal (`v2/apps/api/vis-tmp-api.ts`) que instala `puentearNeonAPostgresLocal` (se niega con una URL no local) y llama a `createApp()`. **No importa `load-env`**: la API nunca leyó `v2/.env`. Puerto 4161. Claves de Resend, Groq y Anthropic vacías. Rate limit alto para no bloquear la captura.
- **Aviso honesto sobre los scripts de la base:** `migrate.ts`, `seed-provinces`, `rellenar-provincias` y `seed-life-areas` llaman a `dotenv.config()` sobre `v2/.env`. `DATABASE_URL` y `DATABASE_URL_UNPOOLED` ya estaban fijadas en local (dotenv no pisa variables existentes) y se verificó el host antes de cada corrida; igualmente esos procesos cargaron el resto de las claves de ese archivo en su entorno.
- **Web:** Vite en `127.0.0.1:5361` (`WEB_PORT=5361`), proxy a la API local.
- **Captura:** un contexto nuevo por ruta y viewport, 3 s de espera para el rito de entrada, recorrido de scroll para disparar los revelados, página completa. Se midió además por ruta: ancho de scroll, foco al cargar, contraste de texto (todo el texto del DOM contra su fondo efectivo), columna de contenido y objetivos táctiles.
- **Límites:** (a) el lienzo del mapa a 390 sale negro en la captura de página completa (WebGL); el mapa se juzgó con capturas de viewport. (b) El registro local tiene 3 aportes de demo, no 4 como en la mañana; los números no son comparables con producción (D-002). (c) Hay un sello «Población sintética» en el laboratorio que mide 1:1 de contraste porque está en estado de animación (opacidad 0); se descartó.
- **PNG completos:** `/private/tmp/claude-501/-Users-juanb-Desktop-ElInstantedelHombreGris/c9b3eaf0-d02e-4eb5-be98-ba84423c1dee/scratchpad/capturas-despues/` (todas las rutas × 1440 y 390, más viewports y los pasos del flujo). Selección de 20 JPG q72 en `capturas-despues/`, junto a este archivo.

## 2. Antes / después

Estados: **arreglado**, **sigue**, **empeoró**. Ninguno empeoró. «(parcial)» marca que quedó un resto.

| Hallazgo de la mañana | Estado | Ruta | Nota |
|---|---|---|---|
| Inputs invisibles (Alta) | arreglado | `/ingresar`, `/registrarse` | Borde de tinta y fondo de papel, visibles en ambos tamaños. |
| Botón violeta pastel, redondeado, 4,1:1 | arreglado | `/ingresar`, `/registrarse` | Botón del kit (cuadrado, mono, violeta oscuro). |
| Barra de modos cortada sin aviso | arreglado (parcial) | `/el-mapa` 390 | Ahora hay degradé y flecha «›»; sigue deslizándose por dentro (541 px en 390). |
| Tarjeta «sin punto» tapa la mitad del mapa | arreglado | `/el-mapa` 390 | Es una línea de 35 px. Todavía cubre la punta norte (Jujuy/Salta). |
| Encuadre inicial corta norte y sur | arreglado | `/el-mapa` 1440/390 | El país entra entero, con Tierra del Fuego; en 390 sin margen arriba. |
| El «4» repetido y columna a 16 px | arreglado (parcial) | `/el-mapa` | Bajó de 5 a 3 apariciones. La columna del instrumento sigue en 16 px frente a los 40 px del título. |
| Atribución OSM 2,6:1 | arreglado | `/el-mapa` | 5,39:1. |
| Cuadro de 7 líneas empuja el paso 1 | arreglado | `/sembrar` 390 | El paso 1 queda sobre el pliegue. |
| «Anónimo si querés…» 1,9:1 y «← Volver» 2,1:1 | arreglado | `/sembrar` | Ningún texto de la página queda bajo 4,5:1. |
| Anillo de foco violeta en el H2 al cargar | **sigue** | `/el-mapa?participar=…`, `/campanas/:slug/participar` | Se mudó al H2 «Sumá tu aporte.» del panel (`:focus-visible` verdadero) en las 4 URLs, 1440 y 390. |
| Barra de 4 segmentos con «1 de 3» | arreglado | panel de aportes | Hay 3 segmentos y «Pregunta 1 de 3». |
| Campaña en pausa: formulario completo | sigue (parcial) | `/campanas/demo…/participar` | El aviso está dentro del panel desde el primer paso («Esta edición no recibe aportes ahora; tu texto queda con vos»), y la revisión deshabilita «Publicar» con motivo, sin pedido a la API. El textarea sigue habilitado. |
| Aviso de ejemplo repetido 5 veces o más | arreglado (parcial) | `/campanas/:slug` | Un solo cuadro de aviso. «Ejemplo» sigue 11 veces en 1440, pero salen del texto del propio contrato demo. |
| «Compartir» pegado; 3 botones de ancho distinto | sigue (parcial) | `/campanas/:slug` 390 | El margen está. Los tres botones apilados miden 328, 350 y 246 px. |
| Filtro de 600 px; chips y select repetidos | arreglado | `/campanas` | Un desplegable cerrado. |
| Fichas sin migrar | arreglado | `/fichas`, `/fichas/:id`, `/fichas/nueva` | Eyebrow, H1 grande, columna 210, botón del kit y una sola miga. |
| «1 últimas fichas de 1» | arreglado | `/fichas` | Ahora «Hay 1 ficha.» |
| «0 cuentas…», doble vacío, historial crudo | arreglado | `/fichas/:id` | Un solo vacío; el historial dice «Cambió: vínculos y próxima tarea». |
| Cuatro vacíos y dígitos «0» | arreglado (parcial) | `/la-radiografia` | No queda ningún «0». Sigue diciendo tres veces lo mismo («Todavía no se corrió ninguno», «ningún aporte analizado», «Hay aportes. Falta poder compararlos») más el vacío de la ficha. |
| «Ver de noche» primero; select truncado | arreglado (parcial) | `/la-radiografia` 390 | El botón pasó al final. El select sigue truncado («…Tiempo para aprender y…»). |
| Panel casi vacío; dos juegos de pestañas; leyenda pisa puntos | sigue (parcial) | `/la-radiografia/ejemplo` | La leyenda ya está fuera del lienzo. El panel (ahora «Volver a un aporte») sigue vacío ~550 px en 1440 y hay dos juegos de pestañas. |
| «0 afirmaciones…», «recursos 0», vacíos repetidos | arreglado (parcial) | `/mandato-vivo` | Ahora «ninguna afirmación · ninguna alternativa…». Queda «recursos 0» en el documento. |
| Barras «finas» sin animar | sigue | `/mandato-vivo` | No es un defecto de animación: cada aporte es una marca de 2 px. Con 1 aporte por tipo parece una raya perdida. |
| Eyebrow violeta 2,2:1 | arreglado | `/mandato-vivo/ejemplo` | Ya no aparece bajo el umbral. |
| Sello rojo 3,1–3,5:1 | sigue | `/mandato-vivo/ejemplo` | 3,07–3,48:1 en 10 px. |
| «0 en el registro»; CSV/JSONL chicos | sigue | `/lo-que-falta` | Eyebrow igual; CSV mide 26×18 y JSONL 43×18 en 390. |
| Aviso técnico sin explicar la página | arreglado (parcial) | `/colaborar` | Hay título y una frase. Queda «fragmento privado». |
| Seis pestañas sobre un login | arreglado | `/mi-espacio` | Sin sesión: aviso de cuenta y «Mis borradores». |
| Pie 2,6:1 | arreglado | todas | Ya no figura bajo 4,5:1. |
| Columna de `/senal/:id` | sigue | `/senal/:id` | Sigue en 380–1060 y la página no tiene ningún H1. |
| Home bien | sigue bien | `/` | En 390 el botón «Imaginar mi Argentina» queda en el borde inferior del primer viewport (768–824 de 844). |
| Tres dialectos de botón | arreglado (parcial) | varias | Se fueron el pastel y el azul. El principal es violeta en el panel y negro en Sembrar («Siguiente»). |

## 3. Problemas nuevos

| Ruta | Viewport | Sev. | Qué se ve | Propuesta |
|---|---|---|---|---|
| Revisión del panel, aporte puntual, `/gestion/campanas` | ambos | **Alta** | `html { color-scheme: dark }` hace que casillas y radios nativos se dibujen oscuros sobre papel: sin marcar parecen marcados (cuadrado negro) y marcados se ven celeste claro. Son las dos casillas obligatorias de publicar. | `color-scheme: light` en el registro de papel, o `accent-color` violeta. |
| Panel «Sumá tu aporte» | 1440 | Media | El panel mide 420 px de ancho y tiene `max-h-[640px]` con scroll interno (976 de contenido). Bajo un viewport de 900 solo entran el título, la introducción y el inicio del textarea; el botón «Seguir imaginando» queda adentro del scroll. En modo directo el formulario «aporte puntual» queda cortado en el borde. | Dejar que el panel crezca con la página o fijar su cabecera y pie. |
| `/la-radiografia` y ejemplo, en noche | ambos | Media | Eyebrows violeta sobre casi negro: 1,96:1 («Los aportes, agrupados por parecido», «El laboratorio», «La Radiografía · ejemplo»). Rótulos de pestañas de escenario 2,8–3,0:1. | Violeta claro en noche, como se hizo en Mandato. |
| Recibo y `/senal/:id` | 390 | Media | «Lugar: todo el país. Precisión: a nivel provincia.» El aporte no tiene provincia (`province_id` nulo); la precisión es el valor por defecto. | No decir precisión cuando no hay lugar. |
| Revisión del panel | 390 | Media | «Mi aporte» es un textarea de 5 filas con 342 caracteres: se ven tres líneas y el resto exige scroll interno, justo donde la persona debe ver todo lo que publica. El panel mide ~2200 px y repite la introducción y «Cargalo directo». | Textarea que crece; ocultar la introducción en la revisión. |
| Recibo, revisión, campaña | 390 | Media | Botones apilados de anchos distintos (recibo: 6 de 200 a 283 px). El recibo ofrece 1 principal, 5 secundarios y 2 enlaces. | Un ancho común; dejar 2 acciones. |
| `/fichas/nueva` con sesión | ambos | Media | Un bloque negro (buscador de lugar) dentro de un formulario de papel. | Variante papel del buscador. |
| `/mi-perfil` | ambos | Media | Sin migrar: sin eyebrow, tres cajas en columna 288–1152, «0 XP», «Racha de 0 días · Récord: 0». | Llevarla a la plantilla. |
| Varias | ambos | Media | Mismo concepto con tres palabras: «edición» (campañas), «versión» (fichas, Mi espacio) y «revisión» (mapa, Mandato). | Una palabra por concepto. |
| `/el-mapa`, `/la-radiografia/ejemplo`, ficha demo, `/colaborar` | ambos | Baja | Quedó jerga: «Soltá una voz o adherí a una, y la cola se llena», «EJEMPLO · VOCES INVENTADAS» (el resto dice «frases inventadas»), «voces reales», «fragmento privado». | Cambiar a «aporte», «frases» y «enlace privado». |
| `/campanas` | 1440/390 | Baja | La tarjeta nacional deja ~300 px vacíos bajo las etiquetas por un párrafo de 15 líneas (20 en 390) que se repite en el detalle; la demo ocupa media columna. | Recortar a 3 líneas. |
| `/campanas/demo…` | ambos | Baja | «3 aportes publicados» en una campaña que dice «sin participantes» y «no recibe aportes»: cuenta los 3 sintéticos. | No contar los de demostración. |
| `/el-mapa?participar=…` | ambos | Baja | «Tu aporte está en elaboración» es un botón activo con apariencia de estado. | Rótulo de acción («Seguir con mi aporte»). |
| 390, varias | 390 | Baja | Objetivos táctiles: CSV 26×18, JSONL 43×18, «← El mapa» 74×16, «Algo le falta a este mapa» 178×15, «Imaginar →» 286×20, filtros de capas 25 px, casillas 13 px. | Mínimo 32 px de alto. |
| `/el-mapa` | 390 | Baja | La línea «Sin ubicación en el mapa» sigue cubriendo la punta norte. | Moverla debajo del lienzo. |
| Cualquiera sin sesión | ambos | Baja | Un 401 en `/api/auth/me` queda como error rojo en la consola de cada primera carga. | Responder 200 con `null`. |
| `/datos-abiertos` | 1440 | Baja | «Formato de los registros» pegado al select. | Separación. |
| `/senal/:id` | ambos | Baja | Sin H1; el autor ve «A mí también me pasa» sobre su propio aporte. | H1 y ocultar ese botón. |

## 4. Overflow horizontal a 390

`scrollWidth` es **390 = innerWidth en todas las rutas medidas**: `/`, `/el-mapa` (también `participar=aportar` y `directo`), `/imaginar` (redirige a `/el-mapa?participar=aportar#instrumento`), `/campanas`, `/campanas/mi-argentina-ideal` (y `/devolucion`), `/campanas/demo-local-aprender-mendoza` (y `/participar`), `/fichas`, `/fichas/:id`, `/fichas/nueva` (sin y con sesión), `/la-radiografia` (día y noche), `/la-radiografia/ejemplo` (día y noche), `/mandato-vivo`, `/mandato-vivo/ejemplo`, `/datos-abiertos`, `/colaborar`, `/sembrar`, `/lo-que-falta`, `/ingresar`, `/registrarse`, `/mi-espacio` (sin y con sesión), `/gestion/campanas` (sin y con sesión), `/senal/:id`, `/mi-perfil`. Recortes locales deliberados: la barra de modos del mapa (541), dos tablas del ejemplo de Radiografía (450 en 350) y la cinta de la home.

## 5. El recorrido de publicar (390, anónimo)

1. **Home** (`flujo-00`): el botón «Imaginar mi Argentina» lleva a `/el-mapa?participar=aportar#instrumento`.
2. **Panel abierto** (`flujo-01`): «Sumá tu aporte.» con el anillo de foco; intro de una frase.
3. **Pregunta 1 de 3** (`flujo-02`): «En tu Argentina ideal, ¿qué sería posible en tu vida?». El botón violeta se habilita al escribir.
4. **Preguntas 2 y 3** (`flujo-03`, `flujo-04`): «¿Por qué eso es importante para vos?» y «¿Qué tendría que funcionar para hacerlo posible?».
5. **Revisión** (`flujo-05`, `flujo-06`): texto unido, tema, lugar «todo el país», casillas, «Tu aporte va a entrar en la campaña nacional «Mi Argentina ideal». Juan Bravin, que la coordina, va a publicar una devolución el 15 de marzo de 2027.».
6. **Publicar** (`POST /api/v1/contribuciones` → 201) y **recibo** (`flujo-07`):

> Tu aporte quedó publicado.
> Ya podés verlo, corregirlo o retirarlo. No es un acuerdo ni un compromiso de nadie.
> Tu aporte entró en la campaña nacional «Mi Argentina ideal». Juan Bravin, que la coordina, va a publicar una devolución el 15 de marzo de 2027 con lo que se leyó.
> Identificador público: `<uuid>`
> Lugar: todo el país. Precisión: a nivel provincia. El texto quedó reservado: el aporte cuenta sin exponer tus palabras.
> Tu aporte se compartió sin una ubicación puntual. No le asignamos un domicilio.
> [Verlo en el mapa] [Ver la Radiografía] [Sumar otro aporte] [Ver y gestionar mi aporte] [Proponer un futuro] [Guardar en mi espacio]
> Este navegador conserva la autoría. Después de ingresar podés elegir vincularla con tu cuenta. Si borrás el identificador antes de hacerlo, no podemos prometer recuperarla.

7. **Gestionar** (`flujo-08`): «Este aporte es tuyo. Podés corregirlo o retirarlo al final de la página.»

**¿Es verdad lo que dice?** Contra la base: la contribución quedó en `mi-argentina-ideal`, edición 1, modo personal; sin cesión de licencia; sin cuenta; el responsable y la fecha son los del contrato. El aporte aparece en el mapa como «Texto reservado por su autoría», y la página de gestión ofrece corregir y retirar. **Falla una frase**: «Precisión: a nivel provincia» con lugar «todo el país» y sin provincia guardada.

La campaña en pausa se probó aparte: la revisión deshabilita «Publicar mi aporte» y dice «Esta edición no recibe aportes ahora. Conservamos tu texto; no lo trasladamos a otra campaña.». No hubo pedidos de escritura.

## 6. Cleanup

Servidores detenidos, `pg_ctl stop` del cluster propio, scripts temporales (`v2/vis-tmp-*.mjs`, `v2/apps/api/vis-tmp-api.ts`) borrados, archivos con la contraseña y el hash locales borrados. `v2/.env` no se tocó. `git status` solo muestra las dos rutas nuevas bajo `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/` (`capturas-despues/` y este archivo).
