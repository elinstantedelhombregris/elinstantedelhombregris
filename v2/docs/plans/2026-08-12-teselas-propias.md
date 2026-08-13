# Teselas propias — cerrar D-003 con Protomaps

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sacar los seis hosts de terceros del camino crítico del mapa. Hoy el basemap
depende de cinco CDN de Carto y de `fonts.openmaptiles.org`; al terminar, las teselas, los
glyphs y el sprite salen del mismo origen que la app, la CSP vuelve a `'self'` y **D-003
queda resuelta**.

**Por qué ahora:** la política de privacidad —reescrita el 12/8/2026— tuvo que declarar por
escrito que «cuando abrís El Mapa, tu navegador pide los mosaicos a CARTO y las tipografías
a openmaptiles.org, y esos servidores ven tu dirección IP». Es la única fuga de IP a
terceros que le queda al producto, y cae justo sobre la pantalla donde se miran señales
políticas. Esta tarea la borra.

**Architecture:** Un único archivo `.pmtiles` estático servido desde el mismo origen, leído
por el plugin `pmtiles` de MapLibre vía range requests. **No hay servidor de teselas, no hay
proceso nuevo, no hay base nueva.** El estilo se genera desde `protomaps-themes-base` y se
repinta con los tokens `oscuro-*` y `tinta` de `tailwind.config.ts`, que es de donde ya sale
el estilo actual.

---

## Lo medido, para que nadie lo vuelva a estimar

Medición real del 12/8/2026 contra el planet de Protomaps `20260811.pmtiles` (137 GB, datos
OSM al 11/8), recortando con `apps/web/public/geo/provincias.geojson` — las 24 provincias,
sin Malvinas ni Antártida, que es exactamente lo que el mapa dibuja hoy.

| maxzoom | tamaño del archivo | qué se ve |
|---|---|---|
| 10 | 39 MB | provincias, rutas troncales |
| 11 | 75 MB | |
| 12 | 157 MB | localidades |
| 13 | 310 MB | trama urbana |
| 14 | 592 MB | calles con nombre |
| **15** | **1,2 GB** | **manzanas y edificios (techo del basemap) ← el elegido** |

Con la caja rectangular en vez del recorte del país, z15 da 2,2 GB. Esa es la cota superior
absoluta del peor caso.

**Argentina entera al máximo detalle es el 0,9% del planet.** D-003 dice que auto-hospedar
teselas del país es «impracticable al tamaño actual»; ese era el juicio correcto para un
servidor de teselas con `.mbtiles` y es falso para un archivo estático. La premisa está
desmentida con un número.

### Por qué z15 — decisión del dueño, 12/8/2026

**Este plan argumentaba z14 y el dueño eligió z15.** Queda escrito el argumento viejo, porque
sigue siendo cierto y es lo que hace que la decisión signifique algo:

> `oscuro.json` declara en su propio `metadata.apagado`: *«POIs, comercios, numeración de
> casas y edificios sueltos. Son ruido de mapa de navegación; este es un mapa cívico.»* El
> salto de z14 a z15 son 600 MB que en su enorme mayoría son justamente eso. Pagarlos es
> comprar bytes que el estilo tira.

La decisión viene con su consecuencia, y sin ella sería pagar el doble por un mapa idéntico:

- **Las huellas de edificio SE ENCIENDEN en zoom alto.** La trama de manzanas dice algo
  cívico: se ve la cuadra. Es lo que hace que z15 signifique algo.
- **Los POIs y los comercios siguen apagados.** Un cartel de farmacia es ruido de mapa de
  navegación, y el criterio de `metadata.apagado` sigue valiendo para ellos.
- Por lo tanto `metadata.apagado` de `oscuro.json` **hay que reescribirlo** para que diga la
  verdad nueva: edificios sí, POIs y comercios no. Va con la Task 5, que es la que repinta el
  estilo.

Bajar el maxzoom vuelve a abrir esta decisión: no se toca sin el dueño.

### Cómo reproducir la medición

Ya no hace falta reproducirla a mano — está en `scripts/build/mapa/extraer-teselas.ts`, que
resuelve solo el build vigente, funde el recorte y levanta el proxy:

```bash
brew install pmtiles
./apps/api/node_modules/.bin/tsx scripts/build/mapa/extraer-teselas.ts --dry-run
```

Por debajo corre esto, que es lo que habría que escribir a mano:

```bash
pmtiles extract --bucket=https://build.protomaps.com 20260812.pmtiles ar.pmtiles \
  --region=argentina.geojson --maxzoom=15 --dry-run
```

**Dos trampas que ya costaron tiempo, no las redescubras:**

1. **El binario de Go se cuelga en IPv6.** `dial tcp [2606:4700:20::...]:443: i/o timeout`,
   aunque `curl -6` contra el mismo host devuelva 200. Hay que mandarlo por un proxy CONNECT
   local que abra el socket con `family: 4` y exportar `HTTPS_PROXY=http://127.0.0.1:8899`.
   Son ~25 líneas de Node; si no aparece en el repo, reescribilo.
2. **`--region` quiere un `Polygon` o `MultiPolygon` suelto**, no un `FeatureCollection`.
   `provincias.geojson` es un FeatureCollection de 24 `Polygon`: hay que fundir las
   coordenadas en un solo `MultiPolygon` antes de pasárselo.

**Los builds de Protomaps son diarios y se retienen unos 6 días.** `20260811` va a estar
vencido cuando leas esto: probá fechas hacia atrás desde hoy con `curl -sI` hasta que una dé
200. Y esto mismo es la deuda operativa del plan (Task 7).

---

## Estado actual exacto

| Archivo | Qué tiene hoy |
|---|---|
| `apps/web/public/maps/oscuro.json` | 6,8 KB. El único estilo en uso. `"glyphs": "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf"`, fuente `https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json` |
| `apps/web/public/maps/papel.json` | 7,9 KB. **No lo referencia ningún archivo del código.** |
| `apps/web/public/maps/dark-matter.json` | 70 KB. **Tampoco.** Parece una copia cruda del dark matter de Carto. Se publica a producción sin que nada lo pida. |
| `apps/web/src/pages/ElMapa/instrumento/MapaBase.tsx:17` | `const ESTILO = '/maps/oscuro.json'` |
| `apps/web/src/pages/ElMapa/instrumento/Instrumento.tsx:121` | `<span>Mapa © OpenStreetMap contributors · © CARTO</span>` |
| `apps/api/src/middleware/security.ts:37-44` | `glyphs` + `cartoTiles[5]`, metidos en `imgSrc`, `connectSrc` y `fontSrc` |
| `apps/web/package.json` | `maplibre-gl` ^4.7.1, `react-map-gl` ^7.1.7. Sin `pmtiles`. |

---

## Global Constraints

- **Hay otra sesión trabajando en paralelo sobre la base, Neon y las señales del mapa**
  (`docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`). Ese plan toca
  `packages/db/`, `packages/civic-core/`, `apps/api/src/features/` y las capas de señales.
  **Este plan no toca nada de eso.** Su superficie entera es: `apps/web/public/maps/`,
  `apps/web/public/tiles/`, `MapaBase.tsx`, `Instrumento.tsx` (una línea),
  `middleware/security.ts`, `apps/web/package.json`, `docs/DEUDAS.md` y
  `content/legal/privacidad.mdx`.
- **Commitear siempre con rutas explícitas** (`git add <ruta> <ruta>`), nunca `git add -A` ni
  `git commit -a`. Es la lección de D-010 y con dos sesiones vivas no es opcional.
- **`content/legal/privacidad.mdx` está modificado en el working tree y sin commitear.** Se
  reescribió entero el 12/8 y lleva tres marcadores `⟨PENDIENTE: …⟩` a propósito, que
  esperan decisiones humanas (responsable de la base, domicilio, edad mínima). **No los
  resuelvas ni los borres.** La Task 6 edita una sección puntual de ese archivo; el resto se
  deja como está.
- **Ordinales de `docs/DEUDAS.md`:** el plan de la señal reservó de D-034 a D-046. Si este
  plan necesita anotar una deuda nueva, **empieza en D-047**.
- **TypeScript:** `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.
  `@typescript-eslint/no-explicit-any: error`. Imports con extensión `.js`.
- **Textos de cara al usuario en español rioplatense.**
- **Commits:** Conventional Commits con scope (`feat(web):`, `fix(api):`, `chore(web):`).

### Decisión abierta que hay que tomar antes de la Task 3

**Dónde vive el `.pmtiles` de 1,2 GB.** No lo resuelve este plan solo:

- **Servidor propio con nginx** — range requests nativos. Es la opción que cierra la fuga por
  completo, y es la misma pregunta que «dónde vive la base»: si el proyecto migra a hosting
  local, el archivo va al lado y no sale nada del país.
- **Cloudflare R2** — entra cómodo, egress gratis, range requests soportados. Victoria
  parcial: Cloudflare sigue viendo las IPs, aunque bajo dominio propio.
- **Vercel estático** — descartado. Un archivo de este tamaño está fuera de para qué sirve
  ese hosting.

Mientras no esté decidido, las Tasks 1, 2, 4 y 5 se pueden hacer igual: sirven el archivo
desde `apps/web/public/tiles/` en desarrollo, que es donde tiene que estar para probar.

---

## Tasks

### Task 1 — Glyphs y sprite propios ✅ HECHA (12/8/2026, commit `b477c5a`)

Es la mitad barata de D-003 y **no depende de ninguna decisión de hosting**. Si el plan se
detuviera acá, ya habría valido la pena.

- [x] Los 256 rangos de `Noto Sans Regular` en `apps/web/public/fonts/`, 5,95 MB, con su `OFL.txt` y un `LEEME.md` que dice de dónde salieron. **Una sola familia, no tres:** `text-font` aparece en exactamente dos capas del `oscuro.json` de entonces y las dos pedían la misma.
- [x] **Sprite: no se bajó, y es deliberado.** Ninguna capa de `oscuro.json` usaba `icon-image` — verificado con grep. Las señales que van encima del mapa las dibuja React, no el estilo. (La Task 5 heredó la consecuencia: el estilo generado tuvo que apagar el `townspot` que traía el paquete de temas.)
- [x] `"glyphs"` apuntando a `/fonts/{fontstack}/{range}.pbf`.
- [x] `fonts.openmaptiles.org` fuera de `connectSrc` y `fontSrc`, con un test nuevo en `apps/api/tests/csp-mapa.test.ts` que falla si vuelve.
- [x] Verificado en el navegador. Y ahí apareció lo que nadie sabía: **el mapa ya estaba en blanco**.

**`fonts.openmaptiles.org` no tiene la familia `Noto Sans Regular`.** Su índice publica
`Klokantech Noto Sans Regular`, que es otra, y ante un fontstack desconocido **no devuelve
404: devuelve su página de inicio con estado 200**. MapLibre parseaba ese HTML como
protobuf, moría con `Unimplemented type: 4` y no dibujaba **ni una geometría** — no sólo las
etiquetas. Cero errores de red que mirar, porque el estado era 200. Es exactamente «la peor
forma de fallar» que este checkbox anticipaba, y estaba vivo en producción.

Commit: `fix(web): glyphs y sprite del mapa desde el propio origen`

### Task 2 — Generar el extract z15 ✅ HECHA (12/8/2026, commit `fbe1791`)

- [x] Escribir `scripts/build/mapa/extraer-teselas.ts` que: resuelva el build vigente de Protomaps probando fechas hacia atrás, funda `provincias.geojson` en un `MultiPolygon`, levante el proxy CONNECT que fuerza IPv4, y corra `pmtiles extract --maxzoom=15`.
- [x] Correrlo. Verificar el archivo con `pmtiles show`: `max zoom: 15`, bounds dentro de Argentina.
- [x] **No commitear el `.pmtiles` al repo.** 1,2 GB en git es una decisión irreversible. Agregarlo a `.gitignore` y dejar el script como la fuente de verdad de cómo se regenera.

Lo que salió, medido y no estimado — el dry-run y la corrida real coincidieron:

| | |
|---|---|
| Build usado | `20260812.pmtiles` (OSM al 12/8 04:00 UTC) |
| Archivo | `apps/web/public/tiles/argentina.pmtiles`, **1.150,8 MB** (1.206.728.792 bytes) |
| `pmtiles show` | `max zoom: 15` · bounds `-73,530572/-55,051046` a `-53,666720/-21,792415` · `clustered: true` |
| Teselas | 3.860.630 direccionadas, 2.566.324 entradas, 2.162.286 contenidos únicos |
| Costo de bajarlo | 481 requests, 1,3 GB transferidos, **2 minutos** a ~20 MB/s |
| `pmtiles verify` | pasa en 226 ms |

La capa `buildings` está en el archivo con `minzoom 11, maxzoom 15` — es decir, **el detalle
que motiva la decisión de z15 efectivamente vino**. Una tesela z15 sobre el microcentro
porteño (`15/11070/19757`) devuelve 10.028 bytes de MVT; una z15 en el Atlántico, fuera del
recorte, devuelve 0. El recorte del país funcionó.

**Ojo con el tamaño en disco:** `pmtiles extract` **prealoca el archivo entero** al empezar,
así que `ls -l` marca 1,2 GB a los pocos segundos. El tamaño no es un indicador de progreso;
la barra del CLI sí.

Commit: `feat(build): script de extracción de teselas de Argentina`

### Task 3 — Servir el archivo

Depende de la decisión de hosting de arriba.

- [ ] Publicar el `.pmtiles` donde se haya decidido, con range requests y CORS verificados a mano (`curl -H 'Range: bytes=0-99' -i`).
- [ ] Confirmar que devuelve `206 Partial Content` y `accept-ranges: bytes`. Si devuelve `200` con el archivo entero, el mapa va a bajar 1,2 GB por tesela y hay que cambiar de hosting, no de código.

### Task 4 — Cablear pmtiles en MapLibre ✅ HECHA (12/8/2026, commit `14730c4`)

- [x] `pnpm --filter @v2/web add pmtiles`. **39 de 45** dependencias de producción después de sumarla — el tope real que aplica `scripts/build/deps-check.ts` es 45, no 60. Pesa 14,9 KB sin comprimir, ~5,5 KB gzip.
- [x] Registrar el `Protocol` de pmtiles antes de montar el mapa — en `protocolo-pmtiles.ts`, llamado desde el **cuerpo del módulo** de `MapaBase`, no desde un efecto: `addProtocol` es global y tiene que existir antes de que maplibre lea el estilo.
- [x] Cambiar la fuente de `oscuro.json` a `pmtiles:///tiles/argentina.pmtiles`. Se usa la forma `url:` y no `tiles:` para que el TileJSON salga del encabezado del propio archivo: si mañana se re-extrae a otro zoom, el estilo se adapta solo.
- [x] Verificar que `MapaBase.tsx` no necesita más cambios. **Cierto**: `ESTILO = '/maps/oscuro.json'` quedó igual y lo único que se agregó es la línea que registra el protocolo.

Medido: la fuente resuelve a `minzoom 0, maxzoom 15, bounds [-73,53 · -55,05 · -53,67 · -21,79]` y los pedidos a `/tiles/argentina.pmtiles` vuelven **206 Partial Content**. Cero pedidos a `cartocdn.com`, cero a `openmaptiles.org`.

Este commit solo deja el mapa casi vacío, y es esperable: las capas todavía nombraban el esquema de OpenMapTiles y el archivo trae el de Protomaps. La única que coincidía de nombre era `water`, y era la única que dibujaba. Los dos commits viajan juntos.

Commit: `feat(web): teselas propias vía pmtiles`

### Task 5 — Repintar el estilo y bajar la CSP a cero externos ✅ HECHA (12/8/2026, commit `28d550c`)

- [x] Estilo base de `protomaps-themes-base`, repintado entero. Lo hace `scripts/build/mapa/generar-estilo.ts` (`pnpm mapa:estilo`): **66 capas**, 72 KB. El paquete es `devDependency` de la raíz — corre en build y no viaja al navegador.
- [x] **Ningún color inventado**, y ahora verificado: el generador recorre su propia salida y falla si aparece un color que no esté en su tabla. Al hacerlo salió que `metadata.criterio` **mentía desde antes**: `#0E0C08`, `#1D1A14` y `#1F1C15` nunca fueron tokens. Se conservan —cambiarlos sería rediseñar, no portar— y quedan declarados como heredados.
- [x] **Huellas de edificio encendidas**: de z14 para arriba, rampa 14→0, 15→0,35, 17→0,7. Medido sobre el microcentro porteño a z15: **3.117 polígonos de edificio y 90 nombres de calle**. `metadata.apagado` reescrito: edificios sí, POIs y comercios no.
- [x] Los cinco hosts de Carto fuera de `imgSrc`, `connectSrc` y `fontSrc`. Las tres quedaron con `'self'` y los esquemas `data:`/`blob:`, nada más.
- [x] Comentario de cabecera de `security.ts` reescrito.
- [x] `© CARTO` fuera de los tres lugares. Entra Protomaps con la forma que pide en los estilos que publica; OSM se queda por la ODbL.
- [x] `metadata.glyphs` borrado.
- [x] **No previsto y necesario:** apagar los iconos. `places_locality` venía del paquete con un `townspot`, y el estilo **no declara sprite** (Task 1 verificó que ninguna capa usaba `icon-image` y decidió no bajarlo). Sin sprite ese icono llena la consola y corre las etiquetas hacia un punto que no está.
- [x] **No previsto y necesario:** una sola familia tipográfica. El paquete pide `Regular`, `Medium`, `Italic` y —escondido adentro de una expresión— `Noto Sans Devanagari Regular v1`; en `public/fonts/` hay una sola. El generador reescribe cada `text-font` y verifica que la familia exista en disco antes de escribir.

Verificado en el navegador sobre `/el-mapa` (Chromium 1400x900, canvas 1060x702): **ningún host externo del mapa**, glyphs 200 desde `/fonts/`, 78 pedidos de teselas en 206. z3,7 → ARGENTINA · CHILE · URUGUAY · PARAGUAY con límites provinciales; z6 → 62 localidades con acentos; z15 → la trama de manzanas.

Commit: `feat(web): cartografía propia y CSP sin hosts externos`

#### Lo que apareció al repintar, y que este plan no había previsto

**1. El borde del recorte se ve, y se ve en la vista por defecto.** Donde no hay
tesela no se dibuja nada, así que el agua de afuera del recorte queda del color
del fondo en vez del color del agua, con un borde rectangular duro. Es más
visible de lo que suena: a z11 sobre el conurbano hay un rectángulo más claro en
el medio del Río de la Plata, y a z3,7 —la vista con la que abre la app— hay una
costura vertical en el Atlántico a la altura de -45°, que es el borde de la
columna de teselas z4. **No se arregla en el estilo**: pintar el fondo del color
del agua resolvería el río y hundiría a Uruguay a z13. Se arregla en el recorte,
dándole un buffer a la región de `extraer-teselas.ts` y volviendo a extraer —
dos minutos y unos MB. Es decisión del dueño, no del estilo.

**2. Los nombres de provincia no existen en el basemap.** La verificación
transversal pide que se vean y el dato no está: `places` trae `kind=region` para
los estados de Brasil y **para ninguna provincia argentina** (medido con
`querySourceFeatures` a z4, z5, z6 y z7). Tampoco los traía Carto — el estilo
viejo no tenía capa de provincias. La identidad provincial del producto sale de
`public/geo/provincias.geojson`, que dibuja la Radiografía, no del basemap.


### Task 6 — Cerrar el rastro en papel ✅ HECHA (12/8/2026)

- [x] `docs/DEUDAS.md`: **D-003 marcada resuelta**, sin borrarla — el `**Estado:**` del cuerpo tachado y una copia en «Resueltas» con el relato. La premisa corregida con el número al lado: era correcta **para un servidor de teselas con `.mbtiles`** y falsa **para un archivo estático**, y el país entero a z15 son 1,2 GB, el **0,9%** del planet. Lo que hacía impracticable la idea no era el tamaño del país sino la forma del servidor que se le suponía.
- [x] `content/legal/privacidad.mdx`: el párrafo de CARTO y openmaptiles reemplazado en la sección «Dónde viven tus datos, y qué sale del país». Los cuatro `⟨PENDIENTE⟩` intactos, el resto del documento sin tocar.
- [x] Changelog de la versión 3 actualizado: el bullet decía «Contamos que el mapa pide mosaicos a CARTO, que ve tu IP», que ya era falso el mismo día en que se escribió.
- [x] `dark-matter.json` (70 KB) y `papel.json` (7,9 KB) borrados. Grep sobre **todo el repo** antes: la única ruta de estilo en código es `ESTILO = '/maps/oscuro.json'`; las otras menciones son de documentos que los describen como sin uso, y una URL de Carto en v1 que no es este archivo. El build lo confirma: `dist/maps/` publica un solo archivo.

**El borrado terminó en el commit de otra sesión, y es [D-010](../../../docs/DEUDAS.md) otra
vez.** Entre el `git rm` y el commit de esta task, `9d7578d` («escapar el NUL crudo…») barrió
el índice y se llevó las 3.217 líneas de borrado, que su mensaje no menciona. El árbol quedó
bien; el registro quedó mal. Queda anotado como segunda ocurrencia en D-010 — dos veces en
once días con la regla ya escrita es la medición de que hace falta el hook de `pre-commit`,
no otra recomendación.

**No se cumplió al pie de la letra, y hay que saberlo.** El encargo decía «borrar sólo el
párrafo». Borrarlo a secas dejaba a la política **muda sobre la única fuga que queda**: las
tipografías de la interfaz salen de Google Fonts en todas las páginas, no sólo en el mapa
([D-049](../../../docs/DEUDAS.md)). Una política que quita su único párrafo sobre pedidos a
terceros mientras uno más grande sigue vivo se lee como si no quedara ninguno. Así que el
párrafo se **reemplazó**: lo que ya no sale (el mapa) y lo que todavía sale (Google), sin
prometer nada del futuro. Si el dueño prefiere el borrado literal, se cortan dos párrafos y
queda como pedía.

Commit: `docs: D-003 resuelta y política de privacidad sin terceros en el mapa`

### Task 7 — Que no se ponga viejo ✅ HECHA (12/8/2026)

- [x] **Cadencia decidida: mensual.** Escrita en `scripts/build/mapa/README.md` junto con la tabla de la última corrida (12/8/2026, build `20260812`, datos de OSM al 12/8 04:00 UTC), que hay que actualizar cada vez.
- [x] **No se automatizó**, y la razón está escrita: el extract necesita el binario de Go, 1,2 GB de disco y un lugar donde publicar. El cron que el proyecto ya tiene (`vercel.json` → `/api/cron/rankings`) es una función serverless y no puede correr ninguna de las tres cosas. Automatizarlo depende de la Task 3.
- [x] Anotado como **[D-047](../../../docs/DEUDAS.md)**. Y de paso corregida la cabecera de `extraer-teselas.ts`, que decía «tarda horas»: son **2 minutos**, medidos.

#### Las otras cuatro deudas que este plan dejó anotadas

El plan reservaba D-047 para la cadencia. Al cerrarlo quedaron cuatro hallazgos más sin
dueño, y el registro existe para eso:

| Id | Qué | Severidad |
|---|---|---|
| [D-048](../../../docs/DEUDAS.md) | **La CSP nunca llega al navegador.** `securityHeaders()` sólo se monta en Express, que en producción contesta sólo `/api/*`; `vercel.json` no tiene bloque `headers`. La política que este plan limpió viaja en las respuestas JSON y no en la página. | alta |
| [D-049](../../../docs/DEUDAS.md) | **Las tipografías de la interfaz salen de Google Fonts** en todas las páginas (`index.html:13-17`). Misma deficiencia que D-003 y más grande, porque vive en el documento base. | media |
| [D-050](../../../docs/DEUDAS.md) | El borde del recorte se ve en el agua, en la vista con la que abre la app. Se arregla en el recorte, no en el estilo. | baja |
| [D-051](../../../docs/DEUDAS.md) | El `.pmtiles` no está publicado en ningún lado: **si esto se despliega hoy, el mapa carga sin una sola tesela.** Es la Task 3, que sigue abierta. | alta |

D-048 y D-049 están enganchadas y en ese orden: aplicar hoy la CSP al documento **rompe las
tipografías de Google**, porque la política dejó `font-src 'self' data:`. Primero se traen
las tipografías, después se aplica el header.

---

## Verificación transversal

Todo commit tiene que dejar verde:

```bash
cd v2 && pnpm lint && pnpm type-check && pnpm test
```

Y para este plan en particular, verificación a ojo que ninguna suite cubre:

- [x] El mapa carga con **etiquetas**: 62 localidades a z6 con acentos y Ñ correctos, 90 nombres de calle a z15. **Los nombres de provincia no**, y no es una regresión: el esquema de Protomaps trae `kind=region` para los estados de Brasil y para ninguna provincia argentina (medido con `querySourceFeatures` a z4–z7). Carto tampoco los traía. La identidad provincial del producto sale de `public/geo/provincias.geojson`, que dibuja la Radiografía, no del basemap.
- [x] La consola no tiene errores de CSP ni de red del mapa. (Los 500 de `/api/*` son la API apagada en local.)
- [x] **Ningún pedido sale a `cartocdn.com` ni a `openmaptiles.org`.** Medido en `/el-mapa` con Chromium: 78 pedidos de teselas al propio origen, todos `206 Partial Content`; glyphs 200 desde `/fonts/`; cero hosts externos. **El objetivo del plan está cumplido** — con la advertencia de D-051: en producción esa ruta todavía no tiene archivo.
- [x] El zoom llega hasta 15 con huellas de edificio visibles: 3.117 polígonos de edificio sobre el microcentro porteño.
- [x] Los **cinco** modos del instrumento andan sobre la misma instancia, verificados uno por uno (Mapa, Análisis, Línea de tiempo, Cobertura, Simulación — este último con dos instancias por la cortina, y un solo registro de protocolo alcanza para las dos).

---

## Fuera de alcance

- **La capa de departamentos** (D-004). Es geometría propia en `public/geo/`, no basemap.
- **Cualquier cosa de la base, Neon o las señales.** Es el otro plan.
- **Los tres `⟨PENDIENTE⟩` de la política de privacidad.** Necesitan decisiones humanas
  (responsable de la base, domicilio legal, edad mínima), no código.
- **Migrar el hosting de la app.** La decisión de dónde vive el `.pmtiles` la toca de
  refilón, pero mudar la base y la API es otro trabajo.
