# D · El registro público

**Fecha:** 2026-08-11
**Serie:** cuarta de cuatro (A callejero · B vocabulario y adhesión · C ingesta · **D registro público**)
**Documento vinculante:** `apps/mobile/docs/PRODUCT_CONSTITUTION.md`
**Decisiones que aplica:** 8 (feed cronológico, cerca tuyo, sin ranking), 9 (descarga con el punto engrosado), 10 (red de coincidencias, no red social), 7 (conteos de personas distintas), 5 (`valor` sale del mapa)

> **Qué resuelve.** Que lo que el país dice se pueda leer entero y llevar entero: un feed debajo del mapa que es la misma consulta que el mapa, paginado por cursor y con la cobertura declarada arriba; y un volcado diario de todo el registro en CSV, JSONL y GeoJSON, con el punto engrosado por un piso propio, licencia y archivo de procedencia. **Qué NO resuelve:** no define el vocabulario de tipos ni la máquina de estados ni la adhesión (spec B), no siembra el callejero ni arregla la jerarquía de `geographic_locations` (spec A), no toca la ingesta ni el contrato de sync con el teléfono (spec C), y no construye `GET /api/v1/civic/map/cells` — sí escribe la política de supresión que ese endpoint tiene que obedecer.

---

## §1 El problema — qué está roto hoy

### 1.1 Hay dos feeds y ninguno es el feed

`FeedVoces.tsx:8` fija `FEED_MAX = 12` y `:38` encierra la lista en `max-h-[380px]`. Doce voces, sin paginación, sin cercanía, sin cabecera de cobertura, sin estado de calidad, sin adhesiones, y sólo la capa voz (`GET /api/open-data/dreams?limit=500`). No es un feed: es una vitrina que prueba que lo dicho queda. Vale por eso y por su costo cero, pero no es lo que la decisión 8 describe. El instrumento, mientras tanto, trae las cuatro capas por `GET /api/v1/civic/map/signals` sin bbox (`Instrumento.tsx:34`) y recorta en el cliente. Los dos leen del mismo registro y ninguno sabe del otro: el día que haya datos, la página va a mostrar dos números de «lo último» que no coinciden, y no va a haber forma de decir cuál miente.

### 1.2 El recuadro del mapa no sale del mapa

`useVistaMapa()` se crea adentro de `Instrumento.tsx:32`. El `recuadro` vive en el estado de un componente perezoso que se monta con `lazy()` y no sube a `ElMapa.tsx`. Cualquier cosa fuera del instrumento que quiera decir «cerca tuyo» tiene que inventar su propia noción de cercanía. Ése es el único cambio estructural que el feed obliga, y es el que hace difícil esta spec.

### 1.3 El conteo del mapa cuenta lo que trajo, no lo que hay

`listSignals` topea en `LIMITE_POR_CAPA_DEFECTO = 500` (`civic-map.ts:61`) y el `ContadorEnVista` cuenta filas del array que recibió. Con 12 filas de demo es correcto por accidente. Con 40.000 señales el contador va a decir «2.000 en vista» para siempre, en silencio, sin ninguna marca de que está topeado. Es una mentira sin mecanismo de aviso.

### 1.4 El bbox descarta las señales sin coordenada, y eso no está resuelto: está anotado

El propio repositorio lo dice, en `civic-map.ts:115-118`:

> «pedir un recorte descarta las señales sin coordenada, cuya ubicación es la provincia. El instrumento las trae aparte y las cuenta aparte — son la clase "provincias tocadas" del conteo honesto, que se nombra y no se suma.»

La política existe del lado del lazo (`instrumento/conteo.ts:131-136`, que escribe literalmente «no sabemos si son de esta zona»). Del lado del bbox no existe: el `WHERE lat is not null` de las líneas 121-127 las tira y nadie las nombra. Un feed «cerca tuyo» que use bbox sin resolver esto va a borrar del registro a toda la gente que cargó su voz eligiendo sólo la provincia — que hoy, con `precision` default `'province'` en `_geo-columns.ts`, es *toda* la gente.

### 1.5 La descarga masiva no existe, y la página que la promete no habla con la API

`packages/shared/src/datasets/index.ts` es un catálogo estático de cuatro datasets, los cuatro con `available: false`, apuntando a un `apps/web/public/datasets/` que no existe. `DatosAbiertos.tsx` lo renderiza en el sistema de diseño viejo (`glass`, `iris-violet`, `Button` de shadcn), promete «changelog público + scripts de generación reproducibles» que no existen, y linkea a `/explorar-datos`, que en `app-routes.tsx:157` es un `<Redirect to="/el-mapa#instrumento" />`. **Hoy no hay una sola descarga en toda la plataforma.**

### 1.6 La API abierta publica el UUID del teléfono como nombre de autor

`apps/api/src/features/open-data/routes.ts:69` devuelve `submittedAs` en la respuesta pública de `GET /api/open-data/dreams`. `submitted_as` carga dos conceptos: el nombre público de un envío anónimo y la marca de idempotencia que la ingesta de campo escribe como `captura:<uuid-del-dispositivo>`. O sea que el identificador estable de un teléfono se publica como el autor de cada captura, y todas las capturas de ese teléfono quedan correlacionables por cualquiera con `curl`. Es una violación directa de la regla 2 y de la métrica norte, y es lo primero que arregla esta spec.

### 1.7 El punto que se guarda es exacto, y nada lo engrosa después

`publishedPrecision` (`location-policy.ts:88`) engrosa **sólo** con `role === 'subject'` **y** `sensitivity === 'high'`. El panel web no manda ninguno de los dos (`PanelSoltarVoz.tsx:38-43`) y el servidor defaultea a `subject`/`low` (`open-data/routes.ts:113-117`). Peor: `SelectorPrecision.tsx:57` **auto-promueve a `'exact'`** apenas alguien clava un punto. Y `obfuscatePoint(p, 'exact')` devuelve `p` sin tocar (`geo.ts:31`).

Encadenado: hoy una `necesidad` sobre la casa de quien la carga se guarda con la coordenada literal a seis decimales y nada la engrosa nunca. **El engrosado por precisión almacenada no es una protección: es un espejo de lo que el cliente declaró.** Cualquier volcado que se apoye en ella publica un padrón de domicilios.

### 1.8 Y lo que le falta a `/api/open-data` para ser una API

Cuatro rutas, todas sobre `dreams`. `GET /dreams` acepta `limit` con techo 500 (`routes.ts:42`) y nada más: sin cursor, sin bbox, sin rango de fechas, sin filtro por estado, sin las otras capas, sin metadatos de licencia ni de corte, sin versión, sin diccionario de campos, sin CSV. `POST /dreams` acepta `category` como `z.string().trim().max(60)` (`routes.ts:21`) — cualquier cosa.

---

## §2 La decisión

### 2.1 Un solo estado, una sola serialización, dos consumidores

El feed y el mapa **no son dos vistas de dos consultas**. Son dos representaciones de una `ConsultaTerritorial` única que vive en `ElMapa.tsx` y baja por contexto. Mover el mapa cambia la consulta; cambiar un filtro del feed cambia la consulta; los dos se redibujan desde el mismo objeto.

Que sea una sola consulta no significa una sola *request*: el mapa necesita todo lo que cae en el encuadre para dibujar, y el feed necesita cuarenta filas por vez para leer. Son requests distintas contra el mismo endpoint y con **la misma función pura de serialización** — `aParametros(consulta)`. Lo único que el feed agrega es `cursor` y `limite`. Hay una guarda que lo afirma (§8.1): si algún día un filtro se aplica de un lado y no del otro, el test falla antes que la pantalla mienta.

**El conteo autoritativo tiene una sola fuente y no es el feed: es `GET /senales/conteos`.** El sobre de una página de feed **no lleva `total`** — llevarlo ahí lo ataría al corte de esa paginación, y el mapa, que no pagina y por lo tanto no tiene corte, contaría sobre otro conjunto: dos números otra vez, ahora con más ceremonia. El `ContadorEnVista` y la cabecera del feed llaman los dos a `/conteos` con los mismos parámetros, y por eso son el mismo número. Eso arregla §1.3 de paso: un conteo del servidor no tiene techo de 500.

**Qué entra al registro: dos capas, `voz` y `propuesta`.** `pulso` y `mandato` quedan afuera, y no por alcance sino porque no se pueden publicar honestamente hoy. `pulse_signals` **no tiene ninguna columna de publicabilidad** —ni `status` ni nada que diga si una fila puede salir—, tampoco tiene `updated_at`, y no tiene cliente vivo (nada llama a `addSignal` salvo `POST /api/pulso`, que ninguna superficie invoca): publicar una tabla sin condición de publicación es publicar por default, lo contrario de §2.7. Y `territory_mandates` es **un agregado que sintetiza un LLM**, no algo que alguien dijo; además no tiene `created_at` —sólo `last_computed_at` y `updated_at`, que el cron reescribe en cada corrida—, así que no tiene lugar en una línea de tiempo ni conjunto congelable por corte, y no tiene punto, así que no cae ni adentro ni afuera de un recuadro. Meterla en el mismo array que la frase de un vecino, con el mismo peso y en el archivo que la spec quiere que alguien cite, sería que la IA determine la verdad de una señal (regla 6). Las dos siguen siendo capas del mapa por `/api/v1/civic/map/signals`, que esta spec no toca; entran al registro cuando B les dé estado de calidad y C una ingesta con vocabulario (§7.2.9).

### 2.2 El ámbito es una unión, no un bbox

El feed no filtra por bbox. Filtra por **ámbito**, que es una unión discriminada:

```
{ tipo: 'pais' }                                    → todo el registro
{ tipo: 'recuadro'; bbox; provinciasTocadas }       → lo que se encuadró
```

Con `recuadro`, la respuesta trae **dos cosas separadas y nombradas**:

- `senales` — las que tienen punto adentro del rectángulo. Son las que se listan y se cuentan.
- `sinPunto` — cuántas señales sin coordenada hay en las provincias que el rectángulo toca, desglosadas por provincia. **No se listan mezcladas, no se suman, no se paginan.** Se muestran al pie del feed en un renglón plegado que dice la frase que `conteo.ts:134` ya escribió: *no sabemos si son de esta zona*.

Ese renglón es la parte más importante del feed durante los primeros meses, porque con la ingesta actual **la mayoría de las señales van a caer ahí**. Un feed que las tirara en silencio mostraría un país vacío y sería falso.

`provinciasTocadas` lo calcula el servidor contra `MASCARA_PROVINCIAS` (§3.4). Sigue siendo una sobre-estimación deliberada —nombra de más, y como no se suma nada, nombrar de más agrega un renglón que dice «no sabemos», nunca un número inflado—, pero tiene que ser **chica**: por qué, y cómo, en §3.4.

### 2.3 El feed es cronológico y no tiene una sola línea de ranking

Orden: `creadaEn DESC`. Nada más. No hay score, no hay engagement, no hay boost por adhesiones, no hay «destacadas», no hay reordenamiento por afinidad. `listSignals` ya ordena así (`civic-map.ts:106`) y no hay nada que desarmar: hay que evitar agregarlo.

Default: **el encuadre actual del mapa**, no el país. Si todavía no hay encuadre, el ámbito es `pais` y la cabecera lo dice. **El primer `recuadro` que maplibre emite al montar no cambia el ámbito**: sólo lo cambia un movimiento de la persona. Si no fuera así, en un teléfono modesto el feed arrancaría en `pais`, alguien empezaría a leer, y al terminar de montar el instrumento perezoso la lectura se resetearía sola a un encuadre que nadie eligió — y la justificación de esta sección («la cercanía es la del mapa que la persona movió») sería falsa justo en el momento en que nadie movió nada.

No se adivina la ubicación de nadie por IP ni se pide geolocalización: la cercanía es visible y es la que la persona eligió.

### 2.4 El scroll infinito honesto: se puede scrollear para siempre, no está diseñado para eso

1. **Cursor, no offset.** El orden es descendente por fecha, o sea que lo nuevo entra *arriba*. Con offset, una sola inserción entre la página 1 y la 2 hace que la fila 40 aparezca dos veces y que una se pierda. El techo de ingesta anónima es 30 por hora por IP (`rate-limit.ts:92-95`) y hay cuatro ingestas: la colisión no es teórica.
2. **Corte fijo.** La primera página fija un `corte` (el `now()` del servidor) y lo devuelve **adentro del cursor**, no como parámetro de URL. El conjunto que estás leyendo no cambia mientras lo leés. Es a la vez la corrección técnica de la paginación y la decisión de diseño: **no hay badge de «3 nuevas»**. La cabecera dice la hora de corte. Una hora de corte es un dato; un contador de nuevos es un empujón.
3. **Autocarga acotada.** Las primeras tres páginas se cargan al llegar al fondo; de la cuarta en adelante hay un botón «Cargar 40 más». Tres páginas son 120 filas ≈ nueve pantallas de 900 px: quien pasó nueve pantallas está leyendo a propósito y merece que se lo pregunten. El botón dice cuántas llevás y cuántas hay (`120 de 3.412`).
4. **Nada se carga con la pestaña oculta** (`document.visibilityState === 'visible'`). Un feed que sigue pidiendo mientras mirás otra cosa está optimizando una métrica que este producto no tiene.
5. **Sin autoplay.** Hoy el feed no tiene media. La regla se escribe ahora, antes de que la tenga: nada se reproduce solo, nada se anima en bucle, y ninguna fila cambia de altura sin que alguien la haya tocado.

### 2.5 La descarga es un volcado periódico, no una generación al vuelo

- **La función no está hecha para streamear.** La API entera corre detrás de un rewrite a `api/index.mjs` y responde con `res.json()`. Un CSV de decenas de MB pide streaming real; hoy no hay un handler que lo haga.
- **El presupuesto de tiempo es chico y no está declarado.** `vercel.json` sólo declara `maxDuration` para `api/cron/rankings.mjs` (60 s); la función de API corre con el default de la plataforma.
- **Una descarga al vuelo no es reproducible.** Dos personas que bajan «el registro» con cinco minutos de diferencia obtienen dos archivos distintos y no pueden compararlos ni citarlos. Un volcado con fecha de corte, conteo de filas y sha256 es citable. El objetivo de esta pieza es que alguien pueda escribir «según el corte del 11 de agosto de 2026» y que eso signifique algo.

Volcado diario a las 09:00 UTC (06:00 en Argentina), tres formatos, comprimidos, con su archivo de procedencia y su hash.

### 2.6 El punto sale engrosado por un piso propio, no por la precisión que declaró el cliente

**El serializador no le cree a `dreams.precision`.** Aplica un **piso de publicación** sobre el eje que la persona no elige:

```
si rol === 'subject' y la precisión almacenada es más fina que '500m'
   → precisión publicada = '500m'   (PROTECTED_FLOOR de location-policy.ts)
otros roles → la precisión almacenada
después, siempre: obfuscatePoint(punto, precisiónPublicada)
```

Por qué el piso y no `publishedPrecision`: esa función engrosa sólo con `subject && high`, y `sensitivity` **la elige quien envía**, así que no puede ser la única llave de la protección de quien envía. `rol` sí es del sistema: `subject` significa «el punto es de la persona o del asunto», y ahí el piso es incondicional. `capture` (la esquina del pozo) y `meeting_point` (el punto de entrega) siguen saliendo finos, porque publicarlos exactos es el objetivo — el argumento ya está escrito en `ROL_POR_TIPO` (`capturas.ts:42`). Y es **incondicional hasta que exista un registro persistido de que la persona rechazó el engrosado con la propuesta a la vista**: `prepareRecordLocation` ya acepta `overrideCoarsening` y hoy **nadie lo persiste**, así que mientras no exista esa columna no hay excepción — una excepción que no se puede auditar no es un consentimiento.

`incertidumbreKm` sale de la precisión **publicada**; la almacenada nunca se publica. Y `obfuscatePoint` se aplica igual aunque el punto ya venga engrosado, porque es idempotente y no cuesta nada: es el cinturón sobre los tirantes para el día que una ingesta nueva guarde un punto crudo por error. Que sea determinístico importa y hay que decirlo en la procedencia: dos descargas del mismo dato dan el mismo punto, así que nadie recupera el original promediando N descargas. Un jitter aleatorio sí lo permitiría. Ésa es la diferencia entre proteger y aparentar que se protege.

### 2.7 Lo que nunca sale es una lista blanca — de campos y de filas

**Campos.** La respuesta pública no se arma desde la fila de base: se arma desde `FilaPublicable`, con sus campos enumerados y mapeados uno por uno. **No hay spread en ningún punto del camino.** Un campo nuevo en una tabla de señal no aparece en ninguna respuesta ni en ningún volcado hasta que alguien lo escribe a mano en el mapeo — y hay guardas que fallan si lo escribe sin clasificarlo (§8.4).

**Filas.** Antes de cualquier filtro que pida quien consulta, el repositorio público aplica un **predicado incondicional de publicabilidad**, que no es parametrizable por nadie:

```
voz       → dreams.status = 'approved'
propuesta → proposals.status in ('voting','accepted')
ambas     → estado <> 'borrador'   (cuando B agregue la columna)
```

Sin eso el registro publica propuestas en borrador y propuestas rechazadas: `listSignals` filtra `status` **sólo en voces** (`civic-map.ts:120`) y `propuestas()` no filtra nada. La guarda de centinelas no lo cazaría, porque busca campos sensibles y acá el problema es una fila entera que no debía existir. Por eso hay una guarda de filas (§8.4.4).

Una lista negra falla el día que alguien agrega la columna que nadie previó. Una lista blanca falla al revés: en la dirección segura.

### 2.8 Licencia: dos licencias, porque son dos cosas

El catálogo actual dice `CC0` (`datasets/index.ts:31`). Cambia, y se parte en dos:

- **La compilación y los metadatos** —conteos, cobertura, geografía, tipos, estados, procedencia, la estructura del archivo— salen bajo **CC BY 4.0**. Eso el proyecto sí lo puede otorgar: es obra suya. CC0 renuncia a la atribución, y la atribución es lo único que permite que quien lea un número publicado vuelva a la fuente y vea con qué cobertura se midió. Un número de participación sin trazabilidad a su cobertura es el mal uso que la regla 5 existe para impedir.
- **El texto de cada señal lo escribió una persona.** El proyecto es custodio, no titular, y **un custodio no puede licenciar obra ajena**. La columna `texto` sale bajo CC BY 4.0 **sólo para las filas con cesión**, obtenida en el momento del envío (§7.3.4). Las filas sin cesión salen completas menos `texto`: `texto: null` y `textoOmitido: 'sin cesión de licencia'`. Sirven igual para cobertura, geografía y conteos — y salir con menos es preferible a estampar una licencia inventada sobre un archivo con sha256 y retención perpetua.

El campo `licencia` del sobre distingue las dos y `/esquema` dice cuál cubre qué. Hasta que C implemente la cesión, el volcado sale **sin la columna `texto` en ninguna fila**, y `PROCEDENCIA.md` lo dice en su primera plana.

---

## §3 El esquema

### 3.1 `volcados` — el índice de lo bajable

Tabla nueva. Una fila **por archivo**, no por corte: cuando el volcado se parta por mes (§4.4.4) el índice ya lo soporta sin migrar.

```ts
// packages/db/src/schema/volcados.ts
export const volcados = pgTable(
  'volcados',
  {
    id: serial('id').primaryKey(),
    /** El instante de corte. Todo lo creado <= corte entra; nada después. */
    corte: timestamp('corte', { withTimezone: true }).notNull(),
    /** Versión del esquema del VOLCADO, no de la base: le permite a alguien con
     *  un script viejo saber que el CSV cambió de forma antes de parsearlo mal.
     *  `0` es pre-release y puede romper (§4.5.3); de 1 en adelante sube sólo
     *  con cambios rompientes. */
    esquema: integer('esquema').notNull(),
    /** Un corte tiene SEIS archivos, no tres: los tres formatos, el hermano
     *  `sin-punto.csv` que el GeoJSON exige (§4.4.1) y los dos de procedencia
     *  (uno para leer, uno para parsear). El dominio los nombra a todos; si no,
     *  el segundo INSERT choca contra el índice único y el corte aborta a mitad. */
    formato: text('formato').notNull(),
    /** 'todo' o 'YYYY-MM' cuando el volcado se parte por mes. */
    particion: text('particion').notNull().default('todo'),

    /** Null cuando `estado = 'purgado'`: el archivo existió y ya no se baja. */
    url: text('url'),
    /** Bytes DEL ARCHIVO COMPRIMIDO, que es el que se baja y el que hashea. */
    bytes: bigint('bytes', { mode: 'number' }).notNull(),
    sha256: text('sha256').notNull(),

    filas: integer('filas').notNull(),
    /** {"voz": 812, "propuesta": 0} — el desglose que la procedencia publica. */
    filasPorCapa: jsonb('filas_por_capa').notNull(),
    /** Filas que un serializador no pudo escribir. Cero es un renglón que dice cero. */
    filasOmitidas: integer('filas_omitidas').notNull().default(0),

    estado: text('estado').notNull().default('generando'),
    /** La CLASE del fallo, de un dominio cerrado. El detalle crudo va al logger
     *  con el id del corte y NO sale por HTTP: un error de Postgres trae con
     *  frecuencia el fragmento de la fila que falló, y `/volcados` es la única
     *  superficie del sistema pensada para mirarse con `curl`. */
    causa: text('causa'),

    generadoEn: timestamp('generado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /** Un corte + formato + partición es único: dos filas serían dos verdades. */
    uniqueIndex('volcados_corte_formato_idx').on(t.corte, t.formato, t.particion),
    index('volcados_listado_idx').on(t.corte.desc()),
    /** Los PRIMEROS checks de todo el esquema. Las 13 migraciones anteriores no
     *  tienen ninguno, y por eso `category`, `theme`, `status`, `precision` y
     *  `level` son texto libre. Acá se corta: un dominio que gobierna si un
     *  archivo se sirve o no no puede depender de que el writer se acuerde. */
    check('volcados_estado_ck', sql`estado in ('generando','listo','fallido','purgado')`),
    check('volcados_formato_ck', sql`formato in ('csv','jsonl','geojson','sin-punto-csv','procedencia-md','procedencia-json')`),
    check('volcados_causa_ck', sql`causa is null or causa in ('lectura','serializacion','compresion','subida','tiempo','desconocido')`),
    /** Un corte listo sin URL sería una descarga que 404ea. */
    check('volcados_url_ck', sql`estado <> 'listo' or url is not null`),
  ],
);
```

**Lo que esta tabla NO guarda: el contenido.** El techo duro de Neon es 512 MB por rama y hoy usa 38 MB. Un volcado diario de ~8 MB comprimido × 3 formatos, retenido 30 días, son 720 MB: rompe el techo con un archivo derivado, o sea con lo único que se puede regenerar. La regla queda escrita: **la base guarda lo que no se puede reconstruir.** Los archivos van a un blob store (§4.4.3).

### 3.2 Los índices del keyset — y el que sirve el caso por defecto

```sql
-- El caso `pais`.
create index dreams_feed_idx    on dreams    (created_at desc, id desc) where status = 'approved';
create index proposals_feed_idx on proposals (created_at desc, id desc) where status in ('voting','accepted');

-- El caso `recuadro`, que es el DEFAULT del feed (§2.3) y el que ningún índice
-- cronológico cubre: `lat` recorta por latitud y el orden sale del índice;
-- `lng` queda como filtro residual.
create index dreams_feed_geo_idx    on dreams    (lat, created_at desc, id desc)
  where lat is not null and status = 'approved';
create index proposals_feed_geo_idx on proposals (lat, created_at desc, id desc)
  where lat is not null and status in ('voting','accepted');
```

Los índices geo que ya existen (`dreams_geo_idx on (lat,lng) where lat is not null`, `dreams.ts:46`) sirven para el dibujo del mapa y se quedan; no sirven para el feed. Con 100.000 filas y un recuadro de barrio el planner tiene dos opciones y las dos son malas: escanear el índice cronológico entero descartando por bbox fila por fila hasta juntar 41, o traer los candidatos del bbox y **ordenarlos** — el sort de tabla que estos índices vienen a evitar. Con el debounce de 400 ms de §4.2, cada arrastre dispara ese plan de nuevo. Cuando B agregue el estado de calidad, los cuatro `WHERE` ganan `and estado <> 'borrador'` en la misma migración que lo agrega.

### 3.3 Nada de vistas materializadas — y qué entra en su lugar

Un conteo agregado sobre dos tablas vacías tarda menos de un milisegundo; una MV hoy es peso muerto en un presupuesto de 512 MB. Pero cuando `/conteos` duela, **una MV refrescada una vez por día tampoco lo resuelve**: no puede responder una consulta parametrizada por bbox arbitrario cruzada con tipo, clase, estado, tema, provincia y rango. Lo que entra, en orden: (1) **los índices de recuadro de §3.2**, que ya están arriba porque el caso por defecto los necesita desde el día 1; (2) **caché de `/conteos` por clave de consulta, TTL 45 s**, que es lo que un feed con debounce necesita de verdad —un arrastre genera decenas de consultas casi iguales y las repeticiones exactas son la mayoría—; (3) **MV sólo para lo que no depende del ámbito**: total nacional, desglose por provincia y `provinciasSinSenal`, que son los que más se piden (el ámbito `pais` arranca toda sesión) y los que menos cambian, refrescados por el cron del volcado.

No se declara umbral en milisegundos: con el compute de Neon en autosuspend, un arranque en frío se come cualquier p95 y el número mediría la siesta de la base. El disparador es el escalón 2 cuando el caché deje de tener hit rate útil, medido en el logger.

### 3.4 `MASCARA_PROVINCIAS` en `civic-core`

Constante nueva en `packages/civic-core/src/poblacion.ts`, al lado de `PROVINCIAS_REF`: son la misma clase de cosa, una tabla de referencia territorial precomputada con las mismas 24 claves canónicas.

```ts
export interface CajaProvincia { oeste: number; sur: number; este: number; norte: number }
/** Celdas de una grilla de 0,5° que la provincia efectivamente cubre. */
export const MASCARA_PROVINCIAS: Record<string, readonly string[]> = { /* 24 entradas */ };
export const RESOLUCION_MASCARA = 0.5;
/** Provincias cuya máscara interseca el rectángulo. SOBRE-estima a propósito. */
export const provinciasQueTocan = (caja: CajaProvincia): string[] => { /* O(24 × celdas) */ };
```

Máscara de celdas y no bounding box: la caja cruda de Buenos Aires va del paralelo 33 al 41 y se solapa con La Pampa, Río Negro, Santa Fe, Entre Ríos, Córdoba y CABA, así que un recuadro en el centro de La Pampa listaría «Buenos Aires: 6.100 sin punto» en el pie. Un aviso que aparece siempre y casi siempre sobra deja de leerse — y éste es el aviso que impide que el feed muestre un país vacío. Con 0,5° la sobre-estimación baja al borde de la celda (~55 km) y sigue siendo una constante commiteada, sin GeoJSON en runtime. Se genera desde el mismo GeoJSON de Natural Earth que ya lee `scripts/build/geo/generar-provincias-api.ts`, **reusando sus helpers de `capas/` y su normalización de nombres** — que es donde vive D-012 y donde CABA se rompe si se duplica. Por eso el script va en `scripts/build/geo/` y no en `scripts/content/` (que además arrastra D-033).

**Del nombre al id.** `provinciasQueTocan` devuelve **nombres**; el sobre publica ids y `sinPunto.porProvincia` agrupa por `province_id`. El paso intermedio es una tabla `NOMBRE_A_ID` **cacheada en memoria de módulo**: las 24 no cambian, se cargan una vez por proceso desde `geographic_locations` pasando por `normalizeProvinceName`, y se reusan — no es un lookup por request. Si una clave no resuelve, la respuesta **no la omite**: trae el renglón con `provinciaId: null` y el nombre, porque omitirla borraría en silencio a la gente de esa provincia, que es lo que §2.2 existe para impedir. Y dice `aproximacion: 'grilla-0.5'`, para que nadie lo lea como una intersección geométrica exacta; cuando A siembre los polígonos de departamento y municipio esto se afina sin cambiar la firma.

### 3.5 Lo que D **no** agrega al esquema, y lo que sí necesita que exista

- **No crea la tabla de adhesiones** (es de B; D declara qué necesita leer, §7.2), **ni la columna de estado de calidad** (ídem), **ni toca `geographic_locations`** (el `province_id serial NOT NULL` sin FK lo arregla A).
- **Sí depende de columnas que hoy no existen, y hay que decirlo.** `dreams.updated_at` existe pero **no tiene trigger** y ningún repositorio lo setea: en la práctica es una copia de `created_at`. Por eso `actualizadaEn` **no está en `FilaPublicable`**: publicar una fecha de actualización que nunca se actualiza es publicar un dato falso en un archivo que se cita por fecha. Entra cuando B, que es quien va a mover el estado de calidad, la haga significar algo.

---

## §4 El comportamiento

### 4.1 El estado compartido en la web

**Archivo nuevo:** `apps/web/src/pages/ElMapa/contexto-territorio.tsx`.

```ts
export type Ambito = { tipo: 'pais' } | { tipo: 'recuadro'; recuadro: Recuadro };

export interface ConsultaTerritorial {
  ambito: Ambito;
  capas: readonly CapaMapa[];
  /** 'todos' es distinto de la lista completa: significa «no filtré», y se
   *  serializa omitiendo el parámetro. Filtrar por los 8 y no filtrar son dos
   *  consultas distintas para el que lee la URL. */
  tipos: readonly TipoSenal[] | 'todos';
  clases: readonly ClaseSenal[] | 'todas';
  estados: readonly EstadoSenal[] | 'todos';
  rango: '7d' | '30d' | 'todo';
}

export interface Territorio {
  consulta: ConsultaTerritorial;
  /** 'usuario' remonta el feed. 'montaje' no cambia nada (§2.3): el primer
   *  recuadro que emite maplibre al montar sólo se guarda. 'easeTo' cambia el
   *  ámbito pero preserva la página cargada (§4.2). */
  fijarAmbito: (a: Ambito, origen: 'usuario' | 'montaje' | 'easeTo') => void;
  fijarFiltro: <K extends keyof ConsultaTerritorial>(k: K, v: ConsultaTerritorial[K]) => void;
  /** La señal iluminada, compartida por mapa y feed. */
  enfocada: string | null;
  enfocar: (id: string | null) => void;
}
```

`useVistaMapa()` se iza: deja de crearse en `Instrumento.tsx:32` y pasa a crearse en el proveedor, que vive en `ElMapa.tsx`. `Instrumento` lo consume.

**La serialización compartida** vive en `apps/web/src/pages/ElMapa/consulta-territorial.ts`: `aParametros(c: ConsultaTerritorial): URLSearchParams`, pura, sin React, testeada. La llaman los tres consumidores —`useSenalesMapa` (dibujo), `useRegistroPublico` (feed) y `useConteos` (las dos cabeceras)—. El feed agrega `cursor` y `limite`; el mapa agrega su `limite` de dibujo. **El corte no es parámetro de URL**: viaja adentro del cursor (§4.3.2).

### 4.2 La sincronía, caso por caso

| Gesto | Qué pasa |
|---|---|
| Arrastrás o hacés zoom en el mapa | `fijarAmbito(..., 'usuario')` → el feed se remonta desde la página 1 con corte nuevo. **Con debounce de 400 ms**: sin eso, un arrastre de dos segundos dispara veinte requests. |
| Mientras el feed refetchea | **Se conservan las filas anteriores** (`placeholderData` de react-query) y la cabecera marca «actualizando». Nunca hay vacío intermedio: en una red mala eso haría parpadear el feed en cada paneo (regla 10). |
| maplibre monta y emite su primer `recuadro` | **No cambia nada.** `fijarAmbito(..., 'montaje')` sólo lo guarda para cuando la persona mueva. Un feed que se resetea solo al terminar de montar el instrumento perezoso reinicia una lectura que nadie interrumpió. |
| Tocás un chip de tipo o de estado | `fijarFiltro` → mapa y feed cambian juntos, misma request base. |
| Pasás el mouse o el foco por una fila | `enfocar(id)` → el punto gana anillo y halo. **El mapa no se mueve.** Mover el encuadre por un hover cambiaría la consulta y recargaría el feed que estás leyendo: un bucle. |
| Abrís el pliegue de una fila | `enfocar(id)` y el mapa hace `easeTo` al punto **sin cambiar el zoom**, sólo si está fuera del encuadre. Es un gesto deliberado, no un hover, y por eso sí puede mover. Si el `easeTo` cambia el recuadro, el feed **no se remonta**: entra por `fijarAmbito(..., 'easeTo')`, y la cabecera marca que el encuadre se movió por vos. |
| Clickeás un punto en el mapa | `enfocar(id)`; el feed abre esa fila con `scrollIntoView({ block: 'nearest' })`. |
| Clickeás un punto fuera de las páginas cargadas | Se pide `GET /senales/:id` (§4.3.5) y la cabecera muestra esa señal sola («seleccionada, fuera de las 120 filas cargadas») con un botón para saltar. **No se autopagina para ir a buscarla**: sería scroll que vos no pediste. |
| Enfocás una señal sin coordenada | El mapa no mueve nada: enciende el lavado de su provincia (`opacidadLavado`, `lienzo/precision.ts:120`) y la fila dice «a nivel provincia» con `etiquetaDePrecision` (`precision.ts:104`). |

### 4.3 El endpoint del feed

```
GET /api/v1/open-data/senales
```

Prefijo versionado propio. `/api/v1/civic/*` es el puente con la app de campo y su contrato lo gobierna el sync; `/api/open-data/*` no tiene versión ninguna. El registro público es una tercera cosa: `/api/v1/open-data/*`.

**Es el mismo endpoint que usa la web.** El feed del sitio no tiene privilegios, ni un campo de más ni un límite mayor. Si algo se ve en `/el-mapa`, se puede pedir con `curl`. Es la única forma de que la promesa de datos abiertos sea comprobable en vez de declarativa.

#### 4.3.1 Parámetros

| Parámetro | Forma | Nota |
|---|---|---|
| `ambito` | `pais` \| `recuadro` | default `pais` |
| `bbox` | `oeste,sur,este,norte` | obligatorio si `ambito=recuadro`; orden y rango con el esquema de `civic-map/validation.ts`, **más un lado mínimo** (abajo) |
| `capa` | `voz,propuesta` | ausente = las dos. `pulso` y `mandato` no están en el registro (§2.1) y pedirlos es 400 |
| `tipo` | los 8 de la spec B | ausente = todos |
| `clase` | `hecho,deseo,acto,meta` | ausente = todas |
| `tema` | slug | el eje ortogonal al tipo |
| `estado` | los 5 publicables | `borrador` es rechazado con 400, no ignorado (§4.6) |
| `provincia`, `ciudad` | id | |
| `desde`, `hasta` | ISO 8601 | filtro de quien consulta. **No es el corte**: el corte viaja en el cursor |
| `cursor` | opaco | |
| `limite` | 1–200, default 40 | |

**El lado mínimo del bbox.** Se rechaza con 400 —«el recuadro es más chico que la precisión del dato»— todo rectángulo con un lado menor a 100 m (la grilla pública más fina que se publica); ídem en `/conteos`. Es un control barato y correcto, pero **no es lo que sostiene la regla 2**: aunque no existiera, un recuadro chico no revelaría nada que la fila no diga ya, porque la fila sale con el piso de §2.6. El que carga el peso es el piso; esto es higiene.

**Por qué 40.** Una `FilaIndiceExpandible` colapsada mide ~72 px, así que 40 filas son ~2.900 px ≈ 3,2 pantallas de 900 px: alcanza para scrollear un rato sin pedir de nuevo, y la respuesta pesa ~20 KB crudos, que baja bien en una red intermitente (regla 10). El techo de 200 es para quien scriptea, no para la pantalla.

#### 4.3.2 El cursor

Opaco para quien lo usa, y adentro:

```
base64url({ t: "2026-08-11T14:32:11.004Z", c: 0, i: 412,
            corte: "2026-08-11T17:00:00.000Z", h: "9f3a1c" })
```

`t` es `creadaEn`, `c` el rango de capa (`voz`=0, `propuesta`=1), `i` el id dentro de la capa, `corte` el instante que fijó la página 1, y `h` el hash corto de los filtros. El orden total es `(creadaEn DESC, capaRank ASC, id DESC)` — el desempate por capa hace falta porque `voz:412` y `propuesta:412` pueden compartir `created_at` al milisegundo.

`corte` viaja adentro y **no es parámetro de URL**: si fuera parámetro, o entra al hash de filtros y entonces toda página 2 es 400 (la 1 se pide sin él), o no entra y entonces un cliente puede cambiarlo entre páginas y mezclar dos conjuntos. Adentro del cursor no puede pasar ninguna. `h` cubre `ambito`, `bbox`, `capa`, `tipo`, `clase`, `estado`, `tema`, `provincia`, `ciudad`, `desde` y `hasta` — todo lo que cambia el conjunto. No cubre `limite`: cambiar el tamaño de página no cambia qué filas hay.

**Es opaco a propósito:** si fuera `?offset=80` cualquiera lo tocaría a mano y el día que el orden interno cambie se rompería en silencio. Opaco significa que su forma puede cambiar sin subir la versión del esquema; el contrato es *devolvé el cursor que te di*.

**Los predicados de keyset no son el mismo en las dos subconsultas**, y escribirlos iguales saltea filas en silencio. Para la subconsulta de rango `r`, dado el cursor `{t, c, i}` y siempre con `created_at <= corte`:

```
r <  c   →  created_at < t
r == c   →  created_at < t OR (created_at = t AND id < i)
r >  c   →  created_at <= t
```

Con un `(created_at, id) < (t, i)` idéntico en las dos, una propuesta con el mismo `created_at` al milisegundo y `id` mayor que la voz del cursor desaparece del feed y del volcado, y no hay forma de notarlo mirando la pantalla. Es el bug que §2.4.1 argumenta contra offset, reintroducido por la puerta de atrás.

Implementación en `packages/db/src/repositories/civic-feed.ts`: `listSignalsPage(consulta, cursor, limite)`. Cada subconsulta pide `limite + 1` con su predicado; el resultado es un merge en memoria de dos listas ya ordenadas, cortado en `limite`. Costo: `2 × 41 = 82` filas leídas para devolver 40. `hayMas` es `true` si el merge se cortó o si alguna lista quedó con sobrante; **nunca se calcula pidiendo el total**.

#### 4.3.3 El sobre del feed

```jsonc
{
  "data": {
    "senales": [ /* FilaPublicable[] */ ],
    "pagina": { "cursor": "eyJ0IjoiMjAyNi0wOC0xMV…", "hayMas": true, "limite": 40, "corte": "2026-08-11T17:00:00.000Z" },
    "ambito": {
      "tipo": "recuadro",
      "bbox": [-58.7, -34.8, -58.2, -34.4],
      "provinciasTocadas": [ { "provinciaId": 1, "nombre": "Buenos Aires" } ],
      "aproximacion": "grilla-0.5"
    },
    // Regla 5. El NÚMERO no viaja acá: viaja en /conteos, que es su única
    // fuente (§2.1). Lo que sí viaja es la advertencia y el puntero, para que
    // una página de filas nunca circule sin decir qué mide.
    "cobertura": {
      "ver": "/api/v1/open-data/senales/conteos?ambito=recuadro&bbox=…",
      "advertencia": "Esto mide quién habló, no qué pasa. Un silencio puede ser un problema resuelto o un lugar donde nadie sabe que esto existe. Y cuenta señales: una persona puede dejar muchas."
    },
    "esquema": 1,
    "licencia": {
      "compilacion": { "id": "CC-BY-4.0", "url": "https://creativecommons.org/licenses/by/4.0/deed.es", "atribucion": "¡BASTA! — El Instante del Hombre Gris" },
      "textos": { "id": "CC-BY-4.0", "otorgadaPor": "quien escribió cada señal", "nota": "Sólo las filas con cesión traen `texto`; las demás traen `textoOmitido`." }
    }
  }
}
```

**La regla del sobre, en una línea:** *todo número que alguien puede citar en público viaja con procedencia; los de transporte, no.* Con procedencia (`Magnitud` de `simulacion/procedencia.ts`): `total`, `actoresDistintos`, `fraccionConPunto`, `fraccionCorroborada`, `sinPunto.total`, `porCanal[].n`, `adhesiones`, `confirmaciones`. Sin: `limite`, `hayMas`, `provinciasTotales`. La guarda que hoy existe recorre el resultado de la Simulación y **no cubre una respuesta HTTP**: por eso §8.4.5 escribe la que falta, sobre el sobre serializado.

#### 4.3.4 `FilaPublicable` — la lista blanca

```ts
export interface FilaPublicable {
  id: string;                    // "voz:412"
  capa: 'voz' | 'propuesta';

  /** Quién produjo esta fila. Una propuesta con author_id null la produjo un
   *  clustering, no una persona: publicarla con la misma forma y el mismo peso
   *  que la frase de un vecino sería que la IA determine la verdad de una señal
   *  (regla 6). Es la disciplina de `Procedencia`, aplicada a la fila.
   *  `de` en castellano: «cluster de 9 señales de pulso». */
  origen: { tipo: 'persona' } | { tipo: 'derivado'; de: string };

  tipo: TipoSenal | null;        // los 8 de la spec B
  /** Lo que llegó cuando `tipo` es null. Nunca se pliega a un tipo real: el
   *  `?? 'valor'` de hoy (mandato-regimen.ts:46, paleta.ts, el-mapa-data.ts) es
   *  la versión de tipos de «devolver 0 para decir no sé». Se publica acotado
   *  —≤60 caracteres, sólo imprimibles, sin controles ni marcas de dirección—
   *  porque su valor típico es, por construcción, lo que alguien mandó fuera de
   *  vocabulario contra un `z.string().max(60)` sin enum. */
  tipoCrudo: string | null;
  clase: 'hecho' | 'deseo' | 'acto' | 'meta' | null;
  tema: string | null;           // eje ortogonal, lo pone el clasificador

  /** Regla 4. Unión, no enum pelado: hay capas que todavía no tienen con qué
   *  llenarlo, y un default inventado ('enviada' para todo) publicaría un juicio
   *  de calidad que nadie emitió. Hoy `propuesta` sale entera en `sinEstado`:
   *  `proposals.status` es un ciclo de deliberación, que es otro eje. */
  estado:
    | { tipo: 'estado'; valor: 'enviada' | 'por_verificar' | 'corroborada' | 'resuelta' | 'desactualizada' }
    | { tipo: 'sinEstado'; razon: string };
  /** Sólo con `estado.valor === 'resuelta'`. Sin esto no se puede ver cuánto
   *  estuvo abierta una necesidad, que es la mitad de la métrica norte. */
  resueltaEn: string | null;

  /** `null` cuando la fila no trae cesión de licencia (§2.8). */
  texto: string | null;
  textoOmitido: string | null;

  lat: number | null;
  lng: number | null;
  /** La precisión PUBLICADA, después del piso de §2.6. La almacenada no sale. */
  precision: LocationPrecision;
  /** El halo ES el dato: publicar el punto sin su incertidumbre invita a leerlo
   *  como exacto. Sale de publicLocationUncertaintyKm (geo.ts:58) sobre la
   *  precisión publicada. */
  incertidumbreKm: number;
  rol: LocationRole;

  provinciaId: number | null;
  provincia: string | null;
  ciudadId: number | null;
  ciudad: string | null;

  /** Claves de actor distintas que adhirieron (spec B). Cero es cero. */
  adhesiones: number;
  /** `null` cuando `clase` es null: no es «esto no es un hecho», es que nadie lo
   *  clasificó. Publicar `false` ahí sería el mismo pecado que `?? 'valor'`. */
  corroborable: boolean | null;
  /** Claves de actor distintas que corroboraron. `null` cuando `corroborable`
   *  es `false` o `null`: no es cero, es inaplicable. En CSV, celda vacía. */
  confirmaciones: number | null;

  /** Redondeado a la HORA en la API y al DÍA en el volcado (§4.7). */
  creadaEn: string;
}
```

**`adhesiones` y `confirmaciones` no son «personas».** Son **claves de actor distintas, sin verificación de identidad**, y `/esquema` y `PROCEDENCIA.md` lo dicen en la misma línea que el número. Con mil UUID generados y rotación de IP contra un techo de 30/hora, alguien publica `adhesiones: 1000` sobre una necesidad inventada y nada lo distingue de mil personas — y `confirmaciones` alimenta `nitidezDeCelda`, así que esa celda saldría nítida y en foco. Lo que lo acota vive en B (§7.2.2 y 7.2.3); lo que lo hace **auditable desde afuera** vive acá: `cobertura.actoresDistintos` publicado junto al total, para que una relación filas/actores que se desploma sea visible sin acceso a la base.

`provincia` y `ciudad` se resuelven a nombre con un solo `LEFT JOIN` sobre `geographic_locations`, **con `and level in ('city','localidad')` explícito**. Sin esa condición, el día que A siembre 326.832 calles en esa misma tabla y una ingesta escriba en `city_id` la unidad más fina que resolvió, la fila publicaría «Ciudad: SAN MARTIN» — y una señal con el punto engrosado a 500 m volvería a ser localizable a la cuadra por el campo de texto. La guarda de columnas no lo vería: no aparece ninguna columna nueva, cambia lo que apunta una vieja.

#### 4.3.5 Los otros endpoints

| Ruta | Qué devuelve |
|---|---|
| `GET /senales/conteos` | **La única fuente del conteo.** Mismos filtros. Alimenta la cabecera del feed y el `ContadorEnVista`. Sobre abajo. |
| `GET /senales/:id` | Una fila, **mismo serializador y mismo predicado incondicional de publicabilidad**. **404 para todo lo no publicable, nunca 403**: un 403 sería un oráculo para confirmar la existencia de borradores y rechazadas probando ids. Entra explícitamente en el recorrido de las guardas de §8.4. |
| `GET /volcados` | El índice en estado `listo`, más nuevo primero, con url, bytes, sha256, filas y corte. `?incluirFallidos=true` agrega los `fallido` (con su `causa`) y los `purgado`. Alimenta `/datos-abiertos`. |
| `GET /esquema` | El diccionario de campos, servido **desde el mismo descriptor runtime del que se deriva `FilaPublicable`** (§8.4.1): nombre, tipo, nulabilidad, qué significa el null, valores de cada enum, y la política de compatibilidad (§4.5.3). |
| `GET /provincias` | Las 24. Reemplaza `/api/open-data/provinces`. |

El sobre de `/conteos`:

```jsonc
{ "data": {
  // Acotado a propósito: la subconsulta pide COTA+1 y no hay count(*) sin techo.
  // «Al menos 50.000» es más veraz que un exacto que cuesta un escaneo, y le
  // pone presupuesto al abuso (§4.6).
  "total": { "tipo": "exacto", "magnitud": { "valor": 3412, "unidad": "señales",
             "procedencia": { "tipo": "medido", "fuente": "conteo sobre voz y propuesta al corte" } } },
  "cobertura": {
    "actoresDistintos": { "valor": 812, "unidad": "claves de actor", "procedencia": { "tipo": "derivado",
        "formula": "actorKeys distintas al corte, sin verificación de identidad", "de": ["senales"] } },
    "provinciasConSenal": 7, "provinciasTotales": 24,
    "provinciasSinSenal": ["Catamarca", "Formosa", "…"],
    "fraccionConPunto": { "valor": 0.41, "unidad": "fracción", "procedencia": { "tipo": "derivado",
        "formula": "señales con lat no nula ÷ señales", "de": ["senales"] } },
    "fraccionCorroborada": { "tipo": "inaplicable", "razon": "No hay hechos que comprobar en este ámbito." },
    "porCanal": [ { "canal": "web", "n": { "valor": 3180, "unidad": "señales", "procedencia": { "tipo": "medido", "fuente": "canal de ingesta" } } } ],
    "advertencia": "Esto mide quién habló, no qué pasa. …"
  },
  "sinPunto": {
    "total": { "valor": 87, "unidad": "señales", "procedencia": { "tipo": "medido", "fuente": "señales sin coordenada en las provincias tocadas" } },
    "porProvincia": [ { "provinciaId": 1, "provincia": "Buenos Aires", "n": 61 } ],
    "razon": "Estas señales sólo declararon su provincia. No sabemos si son de esta zona."
  },
  "porCapa": { "voz": 3390, "propuesta": 22 }, "porTipo": {}, "porClase": {}, "porEstado": {}, "porProvincia": {}
} }
```

`fraccionCorroborada` usa la forma de `Nitidez` y **su razón es propia**, no la de `nitidezDeCelda`: ésa dice «en esta celda» (`brillo.ts:76`) y acá el sujeto es un ámbito. Misma doctrina, texto distinto y declarado como distinto.

**`sinPunto` está afuera de `senales` y afuera de `total`.** Nunca se suman. Ése es el respeto literal a la nota de `civic-map.ts:115-118`.

### 4.4 El volcado

#### 4.4.1 Los tres formatos, y por qué tres

- **CSV** — la planilla. Es lo que abre un periodista, un concejal y una maestra. Sin ella, «datos abiertos» significa «abiertos para programadores».
- **GeoJSON** — QGIS, Datawrapper, Felt. **Sólo las señales con punto**: una señal provincial no es un `Feature`. Va con un hermano obligatorio `sin-punto.csv` con el conteo por provincia, para que quien lo abra en QGIS no crea que el registro son sólo los puntos. Si saliera solo, sería el mismo borrado silencioso que §1.4 denuncia.
- **JSONL** — el único de los tres que se lee sin cargar el archivo entero en memoria **y** sin un parser de CSV que sepa de comillas y saltos adentro del campo. El `texto` de una señal puede tener comas, comillas dobles y saltos: el CSV es la forma más fácil de que alguien lo parsee mal y publique un análisis roto. Una línea = un objeto = `JSON.parse` no se equivoca. Cuesta un serializador de doce líneas.

Los campos de unión salen como **dos columnas** en CSV, no como una: `estado`/`estado_razon`, `origen`/`origen_detalle`, `texto`/`texto_omitido`, `corroborable` con tres valores documentados (`si`/`no`/vacío) y `confirmaciones` vacío cuando es inaplicable. Una planilla no puede leer una celda vacía como cero si la columna de al lado dice por qué está vacía.

#### 4.4.2 Cuánto pesa — con la cuenta a la vista

Hoy las tablas están en cero, así que todo esto es proyección declarada. El escenario que se dimensiona es **100.000 señales**: la suma de `PROVINCIAS_REF` da 45.860.000 habitantes, y el `PISO_MANDATO` de 100 voces cada 100.000 pide 45.860 voces distintas para que exista un mandato nacional. 100.000 señales es «el mandato existe y sobra»: el orden de magnitud correcto para dimensionar, no un piso ni un techo. Bytes por fila, sumando campo por campo con `texto` en 120 caracteres de mediana (el máximo es 2.000, pero la mediana de un texto libre corto en castellano ronda una o dos oraciones):

| Formato | Bytes/fila | 100.000 filas | gzip (×5 conservador sobre texto con claves repetidas) |
|---|---|---|---|
| CSV | ~325 | 32,5 MB | **6,5 MB** |
| JSONL | ~490 | 49,0 MB | **9,8 MB** |
| GeoJSON (60% con punto) | ~610 × 60.000 | 36,6 MB | **7,3 MB** |
| **Total** | | **118 MB** | **~24 MB** |

El 60% con punto es proyección declarada, no medición: la captura de campo siempre trae punto y la web lo trae sólo si la persona lo clava. Con 0 filas hoy la fracción real es desconocida — y por eso `cobertura.fraccionConPunto` la publica en cada respuesta, para que la proyección se corrija con el dato en vez de con otra proyección.

#### 4.4.3 Cuánto tarda, cómo se protege y dónde vive

Cron a las `0 9 * * *` (06:00 en Argentina, antes del horario en que alguien mira el sitio), `maxDuration: 60`.

**La ruta exige `Authorization: Bearer ${CRON_SECRET}`; sin secreto válido devuelve 401 y loguea**, con el mismo helper que `apps/api/src/vercel/cron-rankings.ts:16-30` ya implementa. Los paths de cron están excluidos del rewrite de `vercel.json` (`"source": "/api/((?!cron/).*)"`), o sea que la función es alcanzable por GET desde cualquier lado: sin la guardia, un `while true; do curl …; done` lee las tablas enteras contra la misma Neon que sirve el sitio, comprime 118 MB y sube 24 MB al blob pago **en cada vuelta** — y como el `corte` sería el `now()` de cada corrida, el índice único no colisionaría nunca y `volcados` se llenaría de cortes basura que `/datos-abiertos` listaría como buenos. Dos defensas más, por si el secreto se filtra o Vercel reintenta: **idempotencia por día UTC** (si ya hay un volcado `listo` para el día del corte, la corrida devuelve 200 con «ya existe») y **advisory lock de Postgres** sobre una clave fija.

Presupuesto para 100.000 filas: lectura 2 consultas paginadas a 10.000 filas, ~10 round-trips a ~200 ms → **~2,0 s**; serialización 300.000 objetos a ~1 µs → **~0,3 s**; gzip 118 MB a ~50 MB/s → **~2,4 s**; subida 24 MB a ~20 MB/s → **~1,2 s**. Total **~6 s**, holgura de 10× contra los 60. **La restricción que sí aprieta no es el tiempo: es la memoria.** 118 MB de strings en el heap de una función, con la copia comprimida al lado, es imprudente; por eso el generador **escribe por chunks a un stream** y nunca arma el archivo completo: cada 5.000 filas se serializa, se pasa por el gzip stream y se suelta. Tres requisitos que no son detalles de implementación:

1. **Toda página filtra por el corte y pagina por keyset**, con el mismo predicado del feed. Nunca por `offset`. El cliente es `drizzle-orm/neon-http` (`client.ts:11`): HTTP sin sesión, cada página es su propia transacción y no hay snapshot que sostener entre las diez. La consistencia la da el predicado, no la transacción. Con offset y una inserción entre la página 3 y la 4, el CSV duplica una fila y pierde otra — y el archivo lleva `filas` y `sha256` publicados, así que el error queda firmado y citable.
2. **Aislamiento por fila.** `try/catch` por fila: la que falla se omite y se cuenta en `filasOmitidas`, que `PROCEDENCIA.md` publica por clase de razón (cero omitidas es un renglón que dice cero). El corte se marca `fallido` sólo si falla la subida, el hash o el presupuesto. Sin esto, una fila con `lat` fuera de rango escrita por una ingesta futura tumba la descarga del día entero — y la palanca la tiene cualquiera con `curl`.
3. **Las filas se escriben barajadas dentro de cada chunk**, con orden determinístico `sha256(id ++ corte)`. Motivo en §4.7: con las filas de una sesión de campo contiguas y ordenadas por fecha, unir los puntos reconstruye el recorrido a pie de un voluntario. Determinístico para que dos generaciones del mismo corte den el mismo archivo y el sha256 siga significando algo.

**Dónde viven los archivos:** `@vercel/blob`, con ADR. Suma la dep número **39 de un tope de 45** que aplica `pnpm deps:check` (`scripts/build/deps.ts:32`) — `v2/CLAUDE.md` todavía dice 60 y está desactualizado. La justificación: un cron no puede escribir el filesystem de una función serverless, `apps/web/public/datasets/` se hornea en build, y las dos alternativas son peores — commitear el volcado al repo dispara un deploy por día y engorda el repo linealmente para siempre; guardarlo en Postgres rompe el techo de 512 MB con lo único que se puede regenerar (§3.1). Queda **externa al bundle** (`dependenciasExternas()` lee `apps/api/package.json`), lo que implica que Vercel la instala en `apps/api/node_modules`, no en la raíz.

**Retención, con su mecanismo.** Los **7 cortes diarios** más recientes, más el **corte del día 1 de cada mes**. A 100.000 filas: 168 MB de rolling más 288 MB por año de mensuales. Por qué 7 y no 30: quien necesita un corte de hace más de una semana en realidad necesita una serie, y para eso están los mensuales. **El barrido corre en el mismo cron, después de subir el corte del día**: borra del blob los diarios fuera de la ventana y pasa sus filas a `estado = 'purgado'` con `url = null`. Sin ese paso, al día 8 `/volcados` listaría filas `listo` con `url` y `sha256` de archivos borrados, y `/datos-abiertos` ofrecería descargas 404. **Los mensuales no se borran, y eso es una decisión, no un default:** la publicación de un mensual es **irrevocable hacia atrás**, quien lo bajó lo tiene. Por eso ese hecho no vive sólo en `PROCEDENCIA.md` —que lo lee quien baja— sino en el texto de consentimiento que la superficie de carga muestra **antes** de enviar (§7.3.4). Si esa pantalla no existe, D no publica.

**Se publican con extensión `.gz` explícita y sin `Content-Encoding: gzip`.** Razón: si el blob descomprimiera en tránsito, el archivo que llega al disco no sería el que hashea el `sha256` publicado, y un hash que no se puede verificar contra lo que bajaste no sirve para nada.

#### 4.4.4 Cuándo se parte

**Cuando el volcado pase de 200.000 filas** se parte por mes (`senales-2027-03.csv.gz`) y `volcados` gana una fila por partición — para eso existe `particion` desde el día 1. El umbral es dos tercios del presupuesto medido: a 200.000 filas el volcado tarda ~12 s de los 60, y el margen que queda absorbe un día lento de Neon sin que el cron muera a mitad de la subida y deje un archivo truncado marcado `listo`. (Por eso `estado` arranca en `generando` y sólo pasa a `listo` después de que la subida terminó y el hash se calculó sobre lo subido.)

#### 4.4.5 El archivo de procedencia

Cada corte lleva `PROCEDENCIA.md` (para leer) y `procedencia.json` (para parsear). En este orden:

1. **La advertencia de la regla 5, primera línea, antes de cualquier número.** «Esto mide quién habló, no qué pasa.» Y en el mismo párrafo, la distinción que el número no lleva pegada: **esto cuenta señales, no personas**; el conteo de claves de actor distintas está al lado y no verifica identidad.
2. El corte exacto y la versión de esquema.
3. Filas por capa, tipo, clase, estado y **origen** (persona / derivado), cada una como `Magnitud` con procedencia `medido`. Más `filasOmitidas` por clase de razón.
4. **La política de engrosado aplicada**: el piso de §2.6 con su regla escrita, a qué grilla se engrosó, y que `obfuscatePoint` es determinístico — con la frase de por qué eso importa.
5. **Los campos excluidos, con su razón**, uno por uno (§4.7), generados desde el mapa de clasificación (§8.4.3). No basta decir «anonimizado».
6. La cobertura: provincias con señal y sin señal, nombradas.
7. **Cuántas filas `resuelta` tienen una sola confirmación.** Es el piso de la métrica norte y merece verse.
8. El sha256 y los bytes de cada archivo del corte.
9. Las dos licencias (§2.8) y cuántas filas salieron sin `texto` por falta de cesión.
10. Los defectos conocidos que afectan al dato, linkeados a `docs/DEUDAS.md`. Hoy: `D-011` (la geometría de Natural Earth erra en los bordes provinciales) y `D-026` (la población de celda se estima con densidad provincial pareja, lo que subestima el brillo del campo).

El punto 10 es el que hace que este archivo valga: un volcado que no publica sus propios defectos conocidos le pasa el problema al que lo baje.

### 4.5 La API abierta: versionado y política de rotura

#### 4.5.1 Lo viejo se congela

`/api/open-data/*` sigue funcionando y gana en toda respuesta:

```
Deprecation: true
Sunset: Thu, 11 Feb 2027 00:00:00 GMT
Link: </api/v1/open-data/senales>; rel="successor-version"
```

(El 11 de febrero de 2027 es jueves. Un HTTP-date con el día de semana equivocado lo rechaza un parser estricto, y los parsers son los únicos que leen esta cabecera.)

Menos un cambio, inmediato y sin esperar al sunset: **`submittedAs` sale de la respuesta de `GET /api/open-data/dreams` hoy** (`routes.ts:69`). Una fuga de identificadores no se depreca, se corta.

#### 4.5.2 Qué es aditivo

Un campo nuevo en la respuesta, o un valor nuevo en un enum de salida, **no rompe y no sube versión**. La consecuencia se declara y va escrita en `/esquema`: **todo cliente tiene que tolerar campos desconocidos y valores de enum desconocidos.** Un cliente que hace `switch` exhaustivo sobre `estado` y tira si no matchea se va a romper, y eso está avisado desde el principio.

#### 4.5.3 Qué rompe y qué pasa entonces

Rompen: sacar un campo, cambiarle el tipo, sacar un valor de un enum, cambiar el significado de un campo sin cambiarle el nombre, y cambiar el orden por defecto.

Cuando algo de eso hace falta: sube `/api/v2/open-data/*`, la v1 vive **seis meses** con `Sunset` y los dos últimos devuelven además `Warning: 299`. Seis meses son dos ciclos de un trabajo trimestral: menos obliga a alguien a rehacer un análisis a mitad de camino, que es el costo que una API pública existe para no imponer.

**El esquema `0` es la salida honesta cuando B llega tarde.** Si el registro sale antes de que existan la máquina de estados y la adhesión, sale con `esquema: 0`, `/esquema` lo declara pre-release, **no** se emite `X-Registro-Esquema`, y la política de compatibilidad **no rige hasta el esquema 1**. Un esquema que puede romper y lo dice es honesto. Lo que no se hace es inventar un valor de enum «pendiente»: no es ninguno de los seis estados de la regla 4, y sacarlo después sería un cambio rompedor que forzaría `/api/v2` a semanas del lanzamiento. Con `esquema >= 1` cada respuesta lleva `X-Registro-Esquema: 1` además del campo del sobre.

### 4.6 Casos límite

| Caso | Qué hace |
|---|---|
| `estado=borrador` en la query | **400**: «Los borradores no se publican: un borrador no fue enviado (regla 4).» No se ignora en silencio: eso devolvería resultados y dejaría creer que no hay borradores. |
| `capa=pulso` o `capa=mandato` | **400**: «Esa capa no está en el registro público todavía (§2.1).» Se dice, no se filtra en silencio. |
| `bbox` invertido o fuera de rango | 400 con el mensaje que ya existe en `civic-map/validation.ts`. |
| `bbox` con un lado menor a 100 m | 400: «el recuadro es más chico que la precisión del dato». Ídem en `/conteos`. |
| `bbox` que cruza el antimeridiano | 400. Argentina no lo cruza. Aceptarlo pediría partir el rectángulo y devolver resultados que nadie va a auditar. |
| Cursor corrupto o de otro esquema | 400 «Cursor inválido: pedí la primera página de nuevo». Nunca se cae a la página 1 en silencio: eso haría que un scroll roto se vea como un scroll que vuelve a empezar. |
| Cursor con filtros distintos a los de la página 1 | 400: el `h` no coincide y seguir sería mezclar dos consultas. |
| `recuadro` sin ninguna señal con punto adentro | 200 con `senales: []`, `sinPunto` poblado, y `AREA_VACIA` (`conteo.ts:141`): «No hay nada acá todavía. Que un área esté vacía también es información.» |
| Cero señales en todo el registro (el día 1) | El estado por defecto. El feed monta `Vacio` (`instrumento/Vacio.tsx`), que contesta la pregunta en su versión de cero en vez de decir «sin datos». |
| El volcado del día falló | La fila queda `fallido` con su `causa` (dominio cerrado), `/volcados` **no la lista** pero `?incluirFallidos=true` sí, y `/datos-abiertos` muestra el último `listo` con su fecha real. Un corte faltante que aparece como «no hubo actividad» sería una mentira por omisión. |
| El cron corre dos veces el mismo día | La segunda no genera nada: idempotencia por día UTC más advisory lock (§4.4.3). |
| Una fila rompe un serializador | Se omite, se cuenta en `filasOmitidas` y el corte sale igual. Un corte caído por una fila es una palanca de denegación al alcance de cualquiera. |
| Una señal cambia de estado mientras paginás | No la ves cambiar: el corte fija el conjunto. La ves cambiada la próxima vez que arranca el feed. |
| Una señal se despublica o se retira después del corte | Sale de la API y del corte siguiente **dentro de 24 h** (§7.3.5). Los volcados viejos la conservan: **un volcado es una foto, no un estado vigente**, y eso está en el texto de consentimiento del envío, no sólo en `PROCEDENCIA.md`. |
| `sinPunto` supera a `senales` | Pasa, y es el caso normal al principio. La cabecera lo dice sin disculparse. |

### 4.7 Lo que NUNCA sale, por la API ni por el volcado

| Campo / cosa | Por qué |
|---|---|
| `user_id` y todo derivado (nombre, email, avatar, handle) | Regla 7: sin autor no hay ranking posible. La red sigue lugares y necesidades, no personas (decisión 10). |
| `submitted_as` | Carga el UUID del dispositivo como `captura:<uuid>`. Sale hoy (`routes.ts:69`) y es la fuga viva. |
| `actorKey` / cualquier identificador seudónimo de persona o dispositivo | Es lo que hace posible contar personas distintas. Publicarlo permitiría reconstruir la trayectoria de alguien por el territorio. Los conteos salen agregados; los identificadores, nunca. |
| **El `canal` por fila** | Sólo sale agregado, en `cobertura.porCanal`. Por fila, `canal='campo'` más punto exacto de rol `capture` más orden cronológico une los puntos de una sesión: el recorrido a pie de un voluntario, con horarios, repetido día a día. En una plataforma que se define como crítica del Estado, ese archivo es una lista de objetivos. |
| **El timestamp fino** | Por lo mismo. `creadaEn` se redondea **a la hora** en la API y **al día** en el volcado, y las filas del volcado salen barajadas dentro del chunk (§4.4.3). El cursor no se ve afectado: es opaco y lleva el instante completo del lado del servidor, que es parte de por qué es opaco. |
| **El punto sin el piso de publicación** | Toda fila de rol `subject` sale a `'500m'` o más grueso (§2.6), sea cual sea la precisión almacenada y sea cual sea la sensibilidad declarada. |
| La lista de quiénes adhirieron o corroboraron | Sale el número, no el conjunto. Publicar el conjunto convierte una adhesión en una firma pública. |
| El punto crudo pre-engrosado | No vive de este lado (`_geo-columns.ts` lo dice), y la guarda lo afirma igual. |
| IP, user-agent, headers, timing | Nada del transporte entra al registro. |
| El detalle crudo de un error del volcado | Va al logger con el id del corte. Público sale sólo la `causa`, de un dominio de seis valores: un error de Postgres trae con frecuencia el fragmento de la fila que falló. |
| Bitácora, reflexión personal, notas privadas | Regla 3. Hoy no existe esa tabla en v2; la guarda se escribe ahora, **antes** de que exista, que es el único momento en que escribirla es barato. |
| El vínculo faceta → entrada privada que la originó | Regla 12. Ni el campo ni un id que permita inferirlo. |
| Señales `borrador`; propuestas `draft`, `rejected` o `archived`; voces `pending` o `rejected` | Predicado incondicional de publicabilidad (§2.7). Un borrador no fue enviado. Publicarlo sería publicar algo que nadie decidió publicar. |
| `moderation_notes`, `flagged_by`, `rejected_reason` | Publicar quién reportó a quién es una superficie de represalia. |
| `dreams.status` (moderación) | Es un eje interno. El estado que sale es el de calidad de la regla 4, que es otra cosa. |

---

## §5 Lo que se rompe — archivo por archivo

| Archivo | Qué cambia |
|---|---|
| `apps/api/src/features/open-data/routes.ts:69` | Se borra `submittedAs` de la respuesta. Inmediato, no esperando el sunset. |
| `apps/api/src/features/open-data/routes.ts` (todo) | Cabeceras `Deprecation`/`Sunset`/`Link` en las cuatro rutas. |
| `apps/api/src/features/open-data/v1/` | **Nace**: `{routes,service,serializadores,validation}.ts` y `volcado.ts`. El **piso de publicación de §2.6 vive en `serializadores.ts`** y se aplica igual a la API y a los tres formatos. Montada en `app.ts:79-85`. |
| `apps/api/src/vercel/cron-volcado.ts` | **Nace.** Handler del cron con la guardia de `CRON_SECRET`, calcada de `cron-rankings.ts:16-30`. |
| `api/cron/volcado.mjs` | **Nace.** Stub commiteado que reexporta `../../apps/api/dist-bundle/cron-volcado.mjs`, igual que `api/cron/rankings.mjs`. |
| `scripts/build/bundle-api.ts:56-59` | Entrada nueva en `ENTRIES`: `{ desde: [...'vercel','cron-volcado.ts'], hacia: 'cron-volcado' }`. **Sin esto el stub reexporta un archivo que ningún build genera** y el cron tira 500 todos los días a las 09:00 sin que nadie mire (el pozo de D-029). |
| `apps/api/src/middleware/rate-limit.ts` | Limitador propio para `/conteos` y la primera página del feed, más estricto que el `generalRateLimit` de 120/min. Sin él, `?bbox=<aleatorio>` repetido 120 veces por minuto por IP son 120 conteos con predicados que nunca repiten, contra la misma base que sirve el sitio. |
| `packages/db/src/repositories/civic-feed.ts` | **Nuevo**: `listSignalsPage` (keyset con los tres predicados, cursor, merge). No entra en `civic-map.ts`: ese archivo tiene 315 LOC y lo que entraría son 200-300 más, contra el tope duro de 400. |
| `packages/db/src/repositories/civic-conteos.ts` | **Nuevo**: `countSignals` (con cota), `countSinPunto`, `countByLayer` (mudada desde `civic-map.ts`). |
| `packages/db/src/repositories/civic-map.ts` | Queda con `listSignals` para el dibujo. Pierde `countByLayer`. |
| `packages/db/src/schema/volcados.ts` | Archivo nuevo, más su export en el barril `schema/index.ts`. |
| `packages/db/drizzle.config.ts` | Suma `'./src/schema/volcados.ts'` al array `schema`. **El barril no se usa acá** (drizzle-kit corre en CJS y se atraganta con los imports `.js`): sin esta línea `pnpm db:generate` no ve la tabla y genera una migración sin ella, en silencio. Nota: los schemas importan sin extensión (`from './geographic'`), a diferencia del barril. |
| `packages/db/src/schema/dreams.ts`, `pulso.ts` | Los cuatro índices de feed de §3.2. |
| `packages/db/migrations/` | Migración nueva: `volcados` con sus cuatro CHECK y los cuatro índices. |
| `apps/web/src/pages/ElMapa.tsx` | El `<ProveedorTerritorio>` envuelve el `<main>`; entra la cuarta sección `<RegistroPublico />` **después** de `<SeccionInstrumento />` (hoy línea 32). Después es deliberado: el ancla `#instrumento` es el destino del `Redirect` de `/explorar-datos` (`app-routes.tsx:157`) y hay un test que la verifica. |
| `.../ElMapa/contexto-territorio.tsx`, `.../consulta-territorial.ts` | Archivos nuevos: el proveedor y `aParametros` (puro, testeado). |
| `.../instrumento/Instrumento.tsx:32` | `useVistaMapa()` deja de crearse acá; se consume del contexto. |
| `.../instrumento/Chrome.tsx` | `ContadorEnVista` deja de contar `senales.length` y lee `/conteos`. `FiltroTipos` escribe en el contexto. |
| `.../instrumento/useVistaMapa.ts:67` | `useSenalesEnVista` deja de ser la fuente del conteo (sigue siendo la del dibujo). |
| `.../sections/FeedVoces.tsx` | Se declara teaser: gana el remate «las últimas 12 · leer todo abajo ↓». No se infla ni se borra — su valor es el costo cero. |
| `.../sections/RegistroPublico.tsx` + `registro/*` | Sección nueva: cabecera de cobertura, filas, pie de `sinPunto`, botón de página. |
| `.../papel/primitives/ChipEstado.tsx` + `index.ts` | Primitiva nueva, hermana de `ChipTipo.tsx` y en su mismo molde. Tiene que poder dibujar `sinEstado` con su razón en `title`, no sólo los cinco valores. |
| `.../papel/primitives/Sello.tsx` | `SelloColor` gana valores: hoy son tres y los estados terminales ruidosos —`resuelta`, `desactualizada`— piden más. Se extiende, no se duplica. |
| `apps/web/src/lib/queries/civic-map.ts` | `useSenalesMapa` construye su querystring con `aParametros`. Nacen `useRegistroPublico` (`useInfiniteQuery` con `placeholderData`) y `useConteos`. `SenalMapa.tipo: string \| null` pasa a la unión de B. |
| `apps/web/src/lib/queries/open-data.ts` | `VozAbierta.submittedAs` se borra del tipo. `SoltarVozInput.category` pasa a los 8 tipos de B. |
| `.../sections/__tests__/FeedVoces.test.tsx:25-26`, `.../sections/__tests__/MapaArgentina.test.tsx:27,28,82`, `.../lienzo/__tests__/Lienzo.test.tsx:25,36` | Se borra la clave `submittedAs` de las fixtures tipadas `VozAbierta[]`. Con `strict`, una propiedad de más en un object literal es error de compilación: el cambio es borrar la clave, no ajustar la aserción. |
| `packages/shared/src/open-data/campos.ts` | **Nuevo**: el descriptor runtime del que se derivan `FilaPublicable` y `/esquema` (§8.4.1). Y la constante con el texto de consentimiento que C tiene que mostrar (§7.3.4). |
| `packages/shared/src/datasets/index.ts` | `OPEN_DATASETS` deja de ser el catálogo: pasa a ser la **descripción** de los formatos; disponibilidad y URLs vienen de `/volcados`. `licenseHint: 'CC0'` (línea 31) pasa a las dos licencias de §2.8. |
| `apps/web/src/pages/DatosAbiertos.tsx` | Reescritura completa a Papel y Tinta. Se van `glass`, `iris-violet` y el `Button` de shadcn. Se va el link a `/explorar-datos` (es un `Redirect`) y la promesa de «changelog + scripts reproducibles»; en su lugar, el link real al `PROCEDENCIA.md` del último corte. |
| `vercel.json` | `functions` gana `api/cron/volcado.mjs` con `maxDuration: 60`; `crons` gana `{ "path": "/api/cron/volcado", "schedule": "0 9 * * *" }`. |
| `packages/civic-core/src/poblacion.ts` | Gana `MASCARA_PROVINCIAS`, `RESOLUCION_MASCARA`, `CajaProvincia` y `provinciasQueTocan`. |
| `scripts/build/geo/generar-mascara-provincias.ts` + `package.json` raíz | Script nuevo al lado de `generar-provincias-api.ts`, reusando `capas/` y `centroide.ts`; su comando junto a `geo:provincias`. |
| `docs/adr/` | ADR nuevo: `@vercel/blob` como store del volcado, con las dos alternativas descartadas y sus cuentas. |
| `apps/api/package.json` | `@vercel/blob`. Única dep nueva de esta spec. |

**Lo que NO se toca:** `middleware/csrf.ts` (las rutas nuevas son todas GET), `civic-core/src/brillo.ts` (§7.4), `features/civic-map/routes.ts` (`pulso` y `mandato` siguen siendo capas del mapa, sin cambios).

---

## §6 Contra la Constitución

| Regla | Cómo la cumple esta spec |
|---|---|
| **1 · Offline-first, nunca offline-only** | No aplica directo a la lectura web, pero el volcado ES la forma offline del registro: el archivo bajado se lee sin red, y por eso lleva su procedencia adentro en vez de linkear a una página. |
| **2 · La ubicación exacta es privada por defecto** | **El piso de publicación de §2.6**: toda fila de rol `subject` sale a `'500m'` o más grueso, decidido por el serializador y no por la precisión que declaró el cliente — que hoy es `exact` por default (§1.7). La precisión publicada viaja en cada fila con su `incertidumbreKm`; la almacenada y el punto crudo no salen. El lado mínimo del bbox (§4.3.1) es higiene, no la protección. |
| **3 · Bitácora y reflexión personal nunca se publican** | §4.7 las enumera aunque hoy la tabla no exista, y §8.4.3 escribe la guarda que falla el día que exista y alguien la conecte. |
| **4 · Una señal siempre muestra su estado de calidad** | `estado` es una unión: un valor de la regla 4, o `sinEstado` con su razón textual. Nunca un default inventado. Cada fila del feed lleva `ChipEstado`; el CSV lleva dos columnas; el filtro por estado es de primera clase; `borrador` no es publicable ni por parámetro ni por predicado. |
| **5 · Participación ≠ representatividad** | `cobertura` va en toda respuesta agregada: provincias sin señal nombradas, fracción con punto, fracción corroborada como unión, desglose por canal y la advertencia en castellano. Y publica **`actoresDistintos` junto al total**, porque un conteo de filas presentado como participación, con `PROVINCIAS_REF` a mano para dividir, es la lectura errónea servida en bandeja. La página de filas no lleva el número pero sí la advertencia y el puntero. |
| **6 · La IA puede sugerir, nunca determina la verdad** | `tema` viaja aparte de `tipo`, se etiqueta en `/esquema` como «detectado automáticamente, no verificado», y **nunca ordena el feed**. Y `origen` distingue en cada fila lo que escribió una persona de lo que produjo una máquina: por eso `mandato` —24 filas sintetizadas por un LLM— **no entra al registro** (§2.1), y una propuesta derivada por clustering sale marcada como derivada, con su detalle en castellano. |
| **7 · No hay ranking público individual** | No hay autor en ninguna respuesta ni en ningún volcado. No hay score, ni orden por popularidad, ni perfil. Las adhesiones son un número por señal, nunca por persona. |
| **8 · Se premia utilidad, corroboración, cobertura difícil y resolución; no volumen** | El mecanismo que nombraba (las brasas) lo borró El Registro R7, así que se cita por su contenido: el feed no premia nada porque no ordena por nada, y lo único que el registro destaca estructuralmente es `resuelta` con su `resueltaEn` — la métrica norte, no volumen. Y `resuelta` no la escribe cualquiera: exige confirmación de un actor distinto (§7.2.6). |
| **9 · Consentimiento comprensible y revocable** | Las dos mitades, del lado de quien aporta y no de quien descarga. **Comprensible:** antes del submit, la superficie de carga dice en castellano llano que el texto entra a un registro público, que se descarga entero en archivo, y que lo que salió en un corte mensual no se puede retirar de ese corte (§7.3.4). Sin esa pantalla, D no publica. **Revocable:** una señal retirada desaparece de la API y de todo corte posterior **dentro de 24 h**, publicado como compromiso con plazo en `/esquema`. La irrevocabilidad hacia atrás está decidida a la vista (§4.4.3), no heredada de un default. |
| **10 · Teléfonos modestos y redes intermitentes** | Página de 40 filas ≈ 20 KB crudos. Sin autocarga con la pestaña oculta, sin polling, sin vacío intermedio al refetchear, y el montaje del mapa no resetea la lectura. El feed no monta maplibre: vive en papel, fuera del instrumento. |
| **11 · Los hechos se corroboran; los deseos se deliberan** | `clase` es columna de primera clase y filtro. `corroborable` es `boolean \| null` — `null` cuando nadie clasificó, porque `false` afirmaría «esto no es un hecho» sobre lo que no se sabe. `confirmaciones` es `null` —no cero— cuando no aplica, y el CSV lo resuelve con columnas separadas para que una planilla no lo lea como cero. |
| **12 · Compartir una faceta no publica la entrada privada** | §4.7 excluye el vínculo faceta→origen, y la guarda de clasificación de columnas obliga a que cualquier columna futura de ese vínculo se declare privada antes de compilar. |

---

## §7 Lo que esta spec NO hace

### 7.1 Le corresponde a A (el callejero y la jerarquía territorial)

Sembrar las 326.832 calles, los 529 departamentos, los 2.082 municipios y las 4.037 localidades, y arreglar `geographic_locations.province_id` (hoy `serial NOT NULL` sin FK). D las lee para resolver `ciudad` y `provincia` a nombre; no las carga, y **depende** de que la jerarquía esté arreglada.

**Lo que D le obliga a A:**

1. Si A inserta un valor nuevo en `LocationPrecision` —el escalón «calle sí, altura no», que en Córdoba es 0 de 500 calles con rango— tiene que darle en el mismo commit su etiqueta en castellano en `precision.ts:57-64` y su radio en `publicLocationUncertaintyKm` (`geo.ts:58`), porque la fila del feed y la columna `incertidumbreKm` dependen de las dos. Y tiene que ubicarlo en `PRECISION_ORDER` explícitamente respecto de `'500m'`, porque el piso de §2.6 compara contra ese orden.
2. La resolución de nombre tiene que ser un join, no una función por fila: el volcado hace 100.000 filas en un pase y un N+1 lo saca del presupuesto de 60 s.
3. **`city_id` sólo puede apuntar a filas de nivel localidad o municipio.** La jerarquía fina (calle, altura) vive en columnas propias que nacen clasificadas como privadas en `COLUMNAS_CLASIFICADAS`. D se defiende igual sin confiar en A (el `and level in (...)` de §4.3.4), pero si A escribe una calle en `city_id` el dato queda mal en la base aunque no salga.

### 7.2 Le corresponde a B (vocabulario, clases, estado, adhesión)

Los 8 tipos en 3 clases, la muerte del `?? 'valor'` en los cinco `Record` paralelos, la salida de `valor` del mapa, la máquina de estados de la regla 4 y su columna propia, la adhesión y su conteo por clave de actor distinta.

**Lo que D le obliga a B:**

1. **La adhesión necesita índice único** sobre `(senal, actor)`. D publica un conteo de actores distintos; si cuenta filas duplicadas, publica un número falso. El patrón de `castVote` —DELETE + INSERT en dos sentencias sin transacción, sobre `proposal_votes`, que no tiene ni PK ni unique— **no se puede copiar**.
2. **El `actorKey` lo emite el SERVIDOR**, no lo elige el cliente: una clave por dispositivo, sellada, con costo de obtención. Un seudónimo que el cliente genera es un UUID que cualquiera fabrica a mil por minuto, y entonces «claves de actor distintas» no acota nada. D lo publica como «sin verificación de identidad» mientras eso no exista, pero la etiqueta honesta no reemplaza al control.
3. **El actor que creó una señal no puede adherirla ni corroborarla.** Constraint, no convención.
4. **`estado` tiene que ser su propia columna**, distinta de `dreams.status` (moderación) y de `proposals.status` (deliberación). Si los tres ejes comparten columna, el filtro devuelve cualquier cosa.
5. **`borrador` tiene que ser representable y nunca alcanzar una lectura pública**, y no «por default»: por predicado incondicional, como el de §2.7.
6. **La transición a `resuelta` exige al menos una confirmación de un actor distinto del que creó la señal, y es reversible** (`desactualizada` la reabre) con bitácora — el precedente de `proposal_status_history` ya existe. Sin eso, cualquiera apaga la necesidad real de su cuadra marcándola resuelta, y contamina la única métrica con la que el proyecto se juzga. La Constitución dice textual: «Una necesidad no se considera resuelta hasta que el resultado se confirma».
7. **El tipo desconocido tiene que ser una unión discriminada, no un fallback.** D publica `tipo: null` + `tipoCrudo`. Si B pliega lo desconocido a un tipo real, el volcado publica una clasificación inventada y ya no hay forma de auditarla.
8. **Las clases tienen que ser cuatro y estables**, porque `corroborable` sale de `clase === 'hecho'`.
9. **`pulse_signals` y `territory_mandates` entran al registro** cuando la primera tenga una condición de publicabilidad explícita y la segunda un lugar en la línea de tiempo que no sea `updated_at` reescrito por un cron (§2.1).

### 7.3 Le corresponde a C (la ingesta)

El vocabulario unificado en el borde, el cierre del enum de `category`, la traducción entre los cinco vocabularios vivos, el contrato de sync con el teléfono.

**Lo que D le obliga a C:**

1. **El UUID del dispositivo nunca más va en `submitted_as`.** D deja de publicarlo hoy, pero mientras siga escribiéndose ahí, cualquier consulta futura que lea esa columna reintroduce la fuga. C tiene que darle su propia tabla con índice único sobre `id_local`, como el propio `capturas.ts` ya declara que corresponde.
2. **Toda ingesta emite un `actorKey`** (seudónimo, emitido por el servidor: §7.2.2) y un `canal` (`web` \| `campo`). Sin `actorKey` no hay conteo de actores distintos; sin `canal`, `cobertura.porCanal` no se puede publicar y el sesgo más grande del registro —que mide a quien tiene computadora— queda invisible.
3. **`POST /api/open-data/dreams` tiene que aceptar y exigir `locationRole` y `sensitivity`, y derivar `province_id` del punto.** Hoy el panel no manda ninguno de los tres (§1.7), así que toda voz web es `subject`/`low` y la más precisa que existe puede quedar sin provincia. Además: `necesidad` nace con `sensitivity` `'moderate'` como mínimo, el auto-ascenso a `exact` de `SelectorPrecision.tsx:57` muere, y el panel muestra el recibo de engrosado que `capturas.ts` ya devuelve. Mientras esto no exista, el piso de §2.6 es lo único que separa al registro de la regla 2.
4. **La superficie de carga muestra el consentimiento antes del submit, y obtiene la cesión de licencia.** Una línea rioplatense, no un párrafo legal: qué se publica, que se descarga entero en archivo, que lo que ya salió en un corte mensual no se puede retirar de ese corte, y que lo que escribas se publica bajo CC BY 4.0. `dreams` gana la marca de que esa cesión existe para esa fila; sin la marca, el volcado publica la fila **sin `texto`** (§2.8). **El texto de esa pantalla lo exporta D**, como constante en `packages/shared/src/open-data/`, y es la misma que imprime `PROCEDENCIA.md`: si los dos textos pueden divergir, van a divergir.
5. **El retiro.** C expone el camino para que una persona retire una señal; D se compromete a que una señal retirada desaparezca de la API y de todo corte posterior **dentro de 24 h**, y a que ese plazo esté publicado en `/esquema`.

### 7.4 Lo que D deja escrito pero no construye

- **`GET /api/v1/civic/map/cells`** es de la rebanada 4 de El Registro. D **sí** decide su política de supresión, porque es una política de publicación y `D-028` pide que se decida al diseñar el endpoint y no después:
  - **Umbral k = 5 actores distintos por celda.** Por debajo, la celda no entra a `luzDeCeldas`. Es el umbral de tabulación de área chica que usan las oficinas de estadística, y el mínimo que hace que despejar `voces = habitantes × PARTICIPACION_PLENA × intensidad^(1/CURVA)` no señale a un individuo ni a una familia.
  - **La supresión se aplica a los `ConteoCelda` que ENTRAN**, nunca a las `LuzCelda` que salen. La intensidad es invertible; filtrar después no protege nada.
  - **El piso de publicación de la fila (§2.6) es la precondición de esta política, no un tema aparte.** Mientras las filas salgan con punto fino, nadie necesita invertir nada: baja el CSV, agrupa por la misma grilla de `planTerritorialCoverage` y cuenta. k = 5 protegería un agregado mientras el mismo servidor publica las filas que lo forman. El control que carga el peso es el piso; k = 5 es lo que queda después.
  - **`adhesiones` y `confirmaciones` no se suprimen, y no es una inconsistencia.** k = 5 protege un conteo de personas **atado a un lugar y a un denominador de población**, que es invertible. `adhesiones` y `confirmaciones` son conteos sin ubicación de quien adhirió: se muestran con `regimenDe` (`mandato-regimen.ts:14`), palitos abajo de 100. Aplicarles k = 5 mataría la lectura honesta de los números chicos, que es la que va a haber el primer año.
  - **`Brillo` no gana una cuarta variante.** D-028 advierte que sería un cambio rompedor sobre una unión que dos apps van a estar importando. La distinción de tres estados vive en el tipo de respuesta del endpoint, no en `civic-core`: `{ estado: 'luz'; luz } | { estado: 'suprimida'; razon } | { estado: 'muda' }`, más el `sinDenominador` que `Brillo` ya distingue adentro de `luz`.
- **La moderación.** `dreams.status` tiene default `'approved'`: hoy no hay moderación y esta spec no la agrega. Lo que sí hace es no publicar el eje de moderación (§4.7), para que agregarla después no obligue a sacar campos de una API pública.
- **El feed personalizado.** No hay ninguno. Seguir un lugar es guardar un `ambito`, y eso es una preferencia de cliente que no necesita servidor.

---

## §8 Verificación

### 8.1 La sincronía

- **`aParametros` es determinística y total.** Test de tabla sobre `ambito` × `tipos` × `clases` × `estados` × `rango`: `'todos'` omite el parámetro y la lista completa lo incluye — son dos consultas distintas y la URL tiene que decirlo.
- **«El mapa y el feed piden lo mismo».** 100 `ConsultaTerritorial` al azar con seed fijo: las URLs de los tres hooks son idénticas salvo por `cursor` y `limite`. Es la guarda que impide que un filtro se aplique de un lado y no del otro.
- **«Mover el mapa recorta el feed».** `onMove` con un recuadro que excluye una señal sembrada: la fila desapareció y el `total` de `/conteos` bajó.
- **«El montaje del mapa no resetea el feed».** Con el feed en `pais`, maplibre emite su primer `recuadro`: el ámbito **no** cambia y no hay refetch.
- **«Refetchear no vacía el feed».** Durante el `isFetching` las filas anteriores siguen en el árbol y la cabecera dice «actualizando».
- **«El hover no mueve el mapa».** `enfocar(id)` no llama a `easeTo` ni cambia el ámbito.
- **«El `easeTo` de abrir una fila no remonta el feed».** El cursor de la página cargada sigue siendo el mismo.

### 8.2 Las señales sin punto

- **«Una señal provincial nunca se cuenta como si estuviera adentro».** `precision='province'`, `lat=null`, `provinceId` de Buenos Aires; recuadro sobre el conurbano: **no** está en `senales`, **sí** en `sinPunto.porProvincia`, y `total` **no** la incluye.
- **«El total y el sinPunto nunca se suman».** Son dos `Magnitud` con fórmulas distintas; test de grep sobre el módulo del feed que falla si aparece `total + sinPunto` en cualquier forma.
- **«`provinciasQueTocan` sobre-estima, nunca sub-estima».** Para cada provincia, centroide + recuadro de 0,01°: la provincia está en el resultado.
- **«Las 24 claves resuelven a 24 ids».** Test de arranque contra la base sembrada: cada clave de `MASCARA_PROVINCIAS` resuelve 1:1 contra `geographic_locations` pasando por `normalizeProvinceName`, y falla **nombrando la clave huérfana**. Un tipeo acá borra en silencio el renglón de una provincia entera del pie del feed.

### 8.3 La paginación

- **«El cursor no repite ni saltea con inserciones concurrentes».** 100 señales sembradas, página 1 (40), se **insertan 5** con `created_at` posterior, página 2 con el cursor: las 5 nuevas no aparecen (el corte las excluye) y las 80 filas son 80 ids distintos. El mismo test con `offset` **debe fallar** — se escribe primero contra offset para demostrar el bug y después contra el cursor.
- **«El desempate por capa funciona en el caso que rompe».** Una voz y una propuesta con el mismo `created_at` exacto, y **la propuesta con el id MAYOR** (es el caso que un predicado uniforme saltea; con ids al azar el test pasaría la mitad de las veces). Con `limite=1` la paginación devuelve las dos, en orden estable, sin repetir.
- **«El cursor con filtros distintos es 400».** Página 1 con `capa=voz`, página 2 con el mismo cursor y `capa=propuesta`: 400.
- **«El corte no se puede cambiar entre páginas».** No hay parámetro que lo permita: sólo existe adentro del cursor.
- **«No hay autocarga con la pestaña oculta».** `visibilityState` en `'hidden'`: el observer no dispara fetch.
- **«De la cuarta página en adelante hay un click».**
- **«No hay badge de nuevos».** Guarda de texto sobre el árbol renderizado: falla si aparece «nuevas» o «nuevos» seguida de un número.

### 8.4 Lo que nunca sale — cinco guardas, porque una sola no alcanza

**8.4.1 · Guarda de tipo (no compila).** En `packages/shared/src/open-data/campos.ts` el descriptor es **runtime y es la fuente**; el tipo se deriva de él, no al revés:

```ts
export const filaPublicableSchema = z.object({ /* con .describe() por campo */ });
export type FilaPublicable = z.infer<typeof filaPublicableSchema>;
export const CAMPOS_PUBLICABLES = Object.keys(filaPublicableSchema.shape);
```

Una `interface` de TypeScript se borra en compilación: `/esquema` no puede «generarse desde `FilaPublicable`» si `FilaPublicable` no existe en runtime, y lo que iba a pasar es que alguien escribiera el diccionario a mano y se desincronizara en el tercer campo nuevo. Con el descriptor como fuente, `/esquema` y el tipo **no pueden divergir**: son el mismo objeto.

**8.4.2 · Guarda de runtime sobre la respuesta cruda.** `apps/api/tests/open-data-superficie.test.ts`: siembra una señal con **todos** los campos sensibles poblados con centinelas irrepetibles (`user_id` de un usuario con email `centinela-a1b2@ejemplo.test`, `submitted_as = 'captura:0f3c-CENTINELA-9d21'`), golpea cada endpoint público —incluido `/senales/:id`— y cada uno de los tres serializadores, y afirma que **la cadena centinela no aparece en el body serializado**, buscando en el texto crudo y no en el objeto parseado. Buscar en el objeto parseado exige saber dónde mirar; buscar la cadena encuentra el campo anidado que nadie previó.

**8.4.3 · Guarda de clasificación de columnas.** Introspecciona las columnas de las tablas de señal más `volcados` desde el schema de Drizzle, las compara contra `COLUMNAS_CLASIFICADAS: Record<string, 'publicable' | 'privada'>` con su razón al lado, y **falla si aparece una columna sin clasificar**. Es la única que caza el campo nuevo *el día que se agrega a la tabla*. La razón se guarda como texto y la lista de exclusiones de `PROCEDENCIA.md` se genera desde acá, no se escribe a mano.

**8.4.4 · Guarda de FILAS.** Las tres de arriba son de columnas. Ésta siembra una fila de cada estado no publicable en cada tabla —`dreams.status` `'pending'` y `'rejected'`; `proposals.status` `'draft'`, `'rejected'` y `'archived'`; `estado='borrador'` cuando B lo agregue— y afirma que **su id no aparece en ningún endpoint ni en ninguno de los tres formatos**, y que `/senales/:id` devuelve **404** (no 403) para cada uno. Mismo patrón de centinela, sobre ids.

**8.4.5 · Guarda de números pelados en el sobre.** Recorre el sobre serializado de `/senales` y de `/conteos` y falla si alguno de los campos citables de §4.3.3 llega como `number` sin procedencia. La guarda que ya existe recorre el resultado de la Simulación y no cubre HTTP: ésta es la que faltaba.

Las cinco corren en CI. La 8.4.2 y la 8.4.4 corren parametrizadas por los tres formatos: un CSV que filtra un campo es la misma fuga que un JSON que lo filtra.

### 8.5 El volcado

- **«El piso protege aunque la fila diga `exact`».** Señal con `precision='exact'`, `locationRole='subject'`, `sensitivity='low'` y punto conocido: las coordenadas publicadas —API, CSV, JSONL y GeoJSON— **no son las sembradas**, la `precision` publicada es `'500m'` y `incertidumbreKm` es la de `'500m'`. **Escrito contra el código de hoy, este test tiene que fallar.**
- **«El punto del volcado es el engrosado».** Con `precision='500m'`: las coordenadas de los tres formatos son exactamente `obfuscatePoint(punto, '500m')`, iguales entre sí y distintas de la sembrada.
- **«Engrosar es idempotente».** `obfuscatePoint(obfuscatePoint(p, x), x) === obfuscatePoint(p, x)` para las seis precisiones.
- **«Una señal de rol `capture` no se engrosa».** El piso es por rol, no por precisión: la esquina del pozo sale fina.
- **«Un tipo desconocido no publica `corroborable=false`».** `tipo: null`, `tipoCrudo` con lo que llegó, `clase: null`, `corroborable: null` y celda **vacía** en el CSV, no `no`.
- **«`resuelta` sin confirmación no existe».** Sobre las filas del volcado: `estado === 'resuelta'` implica `confirmaciones >= 1`. Y `PROCEDENCIA.md` publica cuántas tienen exactamente una.
- **«Los tres formatos tienen las mismas filas».** El conjunto de `id` de CSV y JSONL es idéntico; el de GeoJSON es exactamente el subconjunto con `lat` no nula, y la diferencia coincide con `sin-punto.csv`.
- **«El CSV sobrevive al texto adversario, en TODO campo string».** Parametrizado sobre los campos string de `CAMPOS_PUBLICABLES`, no sólo `texto`: comas, comillas dobles, salto de línea, `=cmd()` al principio, U+202E. El round-trip por un parser estándar devuelve el original y la celda que arranca con `=` sale escapada. `tipoCrudo` es el campo más probable de traer basura y el que un test que nombra sólo `texto` deja pasar.
- **«Los timestamps publicados son gruesos y la sesión no se reconstruye».** Dos señales de campo cargadas con dos minutos de diferencia publican el **mismo** `creadaEn` en el volcado (día) y **no quedan adyacentes** en el archivo.
- **«Una fila corrupta no tumba el corte».** El corte sale `listo`, la fila se omite, `filasOmitidas` es 1 y la razón aparece en la procedencia.
- **«El cron sin `CRON_SECRET` es 401»** y **«una segunda invocación el mismo día no crea una segunda fila»**.
- **«Un volcado a medio subir nunca se lista».** Fallo simulado en la subida: la fila queda `fallido` con su `causa`, `/volcados` no la devuelve, `?incluirFallidos=true` sí, y **el body no contiene el texto crudo del error**.
- **«Todo archivo servible del corte tiene fila, bytes y sha256».** Se listan los archivos del blob para un corte y se afirma que el conjunto es **exactamente** el de las filas de `volcados` — los seis, incluidos `sin-punto.csv` y los dos de procedencia.
- **«El sha256 corresponde al archivo que se baja».** Se baja la URL publicada y se compara. Es lo que verifica la decisión de no usar `Content-Encoding`.
- **«Los purgados no se ofrecen».** Después del barrido, ninguna fila `purgado` aparece en `/volcados` ni trae `url`.
- **«El presupuesto de 60 s».** Test de carga con 200.000 filas en una rama efímera de Neon: termina en menos de 40 s y el pico de heap no pasa los 400 MB. Es el que avisa cuándo hay que partir por mes, en vez de descubrirlo con un cron muerto.

### 8.6 Las consultas concretas que hay que poder correr

```sql
-- ¿Cuántas señales del corte no tienen punto? `nullif` porque con la tabla
-- vacía —el estado de hoy— un count(*) en el divisor es división por cero, y
-- «no sé» se devuelve como null, nunca como cero.
select count(*) filter (where lat is null) * 1.0 / nullif(count(*), 0) as fraccion_sin_punto
from dreams where status='approved';

-- ¿Hay alguna provincia con señales que no aparezca en la cobertura publicada?
select distinct province_id from dreams where status='approved' and province_id is not null;

-- ¿Quedó algún submitted_as con forma de uuid de dispositivo? (la fuga de §1.6)
select count(*) from dreams where submitted_as like 'captura:%';

-- ¿Cuántas filas de rol subject se publicarían finas sin el piso? (el de §1.7)
select count(*) from dreams where location_role='subject' and precision in ('exact','100m');

-- ¿El keyset usa el índice? (Index Scan, no Seq Scan + Sort) — las dos
-- variantes, porque el caso `recuadro` es el DEFAULT y no lo cubre el primero.
explain analyze select id, created_at from dreams
where status='approved' and (created_at, id) < ('2026-08-11T14:32:11.004Z', 412)
order by created_at desc, id desc limit 41;

explain analyze select id, created_at from dreams
where status='approved' and lat between -34.8 and -34.4 and lng between -58.7 and -58.2
  and (created_at, id) < ('2026-08-11T14:32:11.004Z', 412)
order by created_at desc, id desc limit 41;
```

La tercera hay que correrla **antes** de considerar cerrada esta spec y **después** de que C toque la ingesta: mientras devuelva más de cero, la fuga sigue escrita en la base aunque ya no se publique. La cuarta mide el tamaño del problema que el piso de §2.6 tapa del lado de la salida y que C tiene que cerrar del lado de la entrada.

### 8.7 Listo cuando

1. `pnpm verify` verde, con las cinco guardas de §8.4 en CI.
2. `submittedAs` no aparece en ninguna respuesta pública ni en ningún volcado, verificado por la guarda de centinelas.
3. Una señal `subject` sembrada en `exact` se publica a `'500m'` en los cuatro caminos, y el test escrito contra el código de hoy falla antes del arreglo.
4. Mover el mapa recorta el feed, y el número de la cabecera del mapa y el del feed son el mismo número, porque los dos salen de `/conteos` con los mismos parámetros.
5. Una señal sin coordenada, dentro de una provincia que el recuadro toca, aparece nombrada en el pie del feed y **no** sumada en ningún total.
6. Ninguna fila no publicable aparece en ningún endpoint ni en ningún formato, y `/senales/:id` devuelve 404 para todas.
7. Hay un volcado del día con sus **seis** archivos, su `PROCEDENCIA.md` y su sha256 verificable, listado en `/datos-abiertos` con su fecha de corte real; y el cron sin `CRON_SECRET` devuelve 401.
8. El cursor sobrevive al test de inserción concurrente y el mismo test contra offset falla.
9. `/esquema` sale del mismo descriptor runtime que `FilaPublicable`, no de un diccionario escrito a mano.
10. La superficie de carga muestra el consentimiento y la cesión **antes** del submit, con el texto que exporta D. Sin esto, D no publica.
11. `/datos-abiertos` no tiene una sola clase `glass` ni un solo `iris-violet`, y no linkea a `/explorar-datos`.

---

## §9 Riesgos

| Riesgo | Mitigación |
|---|---|
| Izar `useVistaMapa` rompe el instrumento, la pieza más cara de la página | El contexto se agrega **antes** de tocar `Instrumento.tsx`, con el hook leyendo del contexto y el proveedor devolviendo exactamente lo que hoy devuelve el hook local. El instrumento se toca en un commit propio y sus tests existentes pasan sin cambios. |
| El piso de publicación engrosa de más y el mapa pierde detalle real | Sólo aplica a rol `subject`; `capture` y `meeting_point` —lo que produce la captura de campo— siguen finos. Y el costo de errar hacia el otro lado es publicar domicilios: la asimetría del daño decide la dirección del default. |
| Con las tablas en cero, todo el dimensionado es proyección | Declarado como proyección en §4.4.2, `fraccionConPunto` publica la fracción real en cada respuesta, y §8.5 tiene el test de carga a 200.000 filas. |
| El volcado corre contra la misma base que sirve el sitio | Es una lectura, paginada por keyset, fuera del horario de uso, con el perfil de una consulta del mapa repetida diez veces, y detrás de `CRON_SECRET`. `D-014` sigue abierta para los tests de integración: los de esta spec siembran con prefijo de centinela y barren en `afterAll`. |
| `/conteos` es la superficie más barata de abusar | Limitador propio más estricto que el general (§5), `total` acotado por cota en vez de `count(*)` sin techo, caché de 45 s por clave, y el agregado nacional precomputado por el cron (§3.3). |
| `@vercel/blob` es una dep nueva | ADR con las dos alternativas y sus cuentas (§4.4.3). Es la dep 39 de un tope efectivo de 45 (`scripts/build/deps.ts:32`), de la API y no del cliente: no entra al bundle. |
| El feed y el mapa divergen igual, por dos caminos de conteo | Hay un solo camino: `/conteos`. El sobre del feed **no lleva `total`** justamente para que no exista un segundo. El test de §8.1 afirma que las URLs son la misma, y `ContadorEnVista` deja de tener acceso al array para contar. |
| Publicar la fracción de cobertura invita a que alguien titule mal igual | Es la razón de CC BY sobre CC0 (§2.8), de `actoresDistintos` publicado junto al total, y de la advertencia en primera línea de `PROCEDENCIA.md`. No se puede impedir el mal uso; se puede hacer que sea trazable y que la corrección esté a un click. |
| **La spec B llega tarde y el feed no tiene ni estado ni adhesión** | Dos salidas, y ninguna inventa un valor de enum. (a) El feed no se monta: `FeedVoces` queda como está, que ya funciona. (b) El registro sale con **`esquema: 0`** declarado pre-release en `/esquema`, sin `X-Registro-Esquema`, con la política de compatibilidad explícitamente no vigente, `estado` en `sinEstado` con su razón y `adhesiones` ausente del descriptor. Un esquema 0 que puede romper y lo dice es honesto; un valor «pendiente» que hay que retirar apenas B aterrice forzaría `/api/v2` a semanas del lanzamiento, contra la promesa de seis meses de §4.5.3. |
