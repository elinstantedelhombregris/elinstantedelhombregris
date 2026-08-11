# D · El registro público

**Fecha:** 2026-08-11
**Serie:** cuatro specs · A la tierra · B la señal · C la corroboración · D el registro público
**Documento vinculante:** `apps/mobile/docs/PRODUCT_CONSTITUTION.md`
**Migración:** `0017`. **Ordinales de `docs/DEUDAS.md`:** ninguno. Los rangos están reservados (A: D-034/D-035 · B: D-036 a D-040 · C: D-041 a D-043); si D encuentra un defecto propio arranca en D-044.
**Decisiones que aplica:** 8 (feed cronológico, cerca tuyo, sin ranking), 9 (descarga con el punto engrosado), 10 (red de coincidencias, no red social), 7 (conteos de personas distintas), 5 (`valor` sale del mapa)

> **Qué resuelve.** Que lo que el país dice se pueda leer entero y llevar entero: un feed debajo del mapa que es la misma consulta que el mapa, paginado por cursor y con la cobertura declarada arriba; y un volcado diario de todo el registro en CSV, JSONL y GeoJSON, con el punto engrosado por un piso propio, licencia y archivo de procedencia. **Qué NO resuelve:** no define el vocabulario de tipos ni la máquina de estados ni la adhesión (`2026-08-11-b-la-senal.md`), no siembra el callejero ni arregla la jerarquía de `geographic_locations` (`2026-08-11-a-la-tierra.md`), no construye la corroboración, ni el rastro, ni `celda_luz`, ni `GET /api/v1/civic/map/cells` y su política de supresión (`2026-08-11-c-la-corroboracion.md`), y **no construye la deliberación** — la declara en pantalla (§2.9).

---

## §1 El problema — qué está roto hoy

### 1.1 Hay dos feeds y ninguno es el feed

`FeedVoces.tsx:8` fija `FEED_MAX = 12` y `:38` encierra la lista en `max-h-[380px]`. Doce voces, sin paginación, sin cercanía, sin cabecera de cobertura, sin estado de calidad, sin adhesiones, y sólo lo que hoy vive en `dreams`. No es un feed: es una vitrina que prueba que lo dicho queda. Vale por eso y por su costo cero, pero no es lo que la decisión 8 describe. El instrumento, mientras tanto, trae las cuatro capas de hoy por `GET /api/v1/civic/map/signals` sin bbox (`Instrumento.tsx:34`) y recorta en el cliente. Los dos leen del mismo registro y ninguno sabe del otro: el día que haya datos, la página va a mostrar dos números de «lo último» que no coinciden, y no va a haber forma de decir cuál miente.

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

`apps/api/src/features/open-data/routes.ts:69` devuelve `submittedAs` en la respuesta pública de `GET /api/open-data/dreams`. `submitted_as` carga dos conceptos: el nombre público de un envío anónimo y la marca de idempotencia que la ingesta de campo escribe como `captura:<uuid-del-dispositivo>`. O sea que el identificador estable de un teléfono se publica como el autor de cada captura, y todas las capturas de ese teléfono quedan correlacionables por cualquiera con `curl`. Es una violación directa de la regla 2 y de la métrica norte. La ruta la reescribe B con su adaptador de compatibilidad; **la guarda que verifica que la fuga esté cerrada es de D** (§8.4.2).

### 1.7 El punto que se guarda es exacto, y nada lo engrosa después

`publishedPrecision` (`location-policy.ts:88`) engrosa **sólo** con `role === 'subject'` **y** `sensitivity === 'high'`. El panel web no manda ninguno de los dos (`PanelSoltarVoz.tsx:38-43`) y el servidor defaultea a `subject`/`low` (`open-data/routes.ts:113-117`). Peor: `SelectorPrecision.tsx:57` **auto-promueve a `'exact'`** apenas alguien clava un punto. Y `obfuscatePoint(p, 'exact')` devuelve `p` sin tocar (`geo.ts:31`).

Encadenado: hoy una `necesidad` sobre la casa de quien la carga se guarda con la coordenada literal a seis decimales y nada la engrosa nunca. **El engrosado por precisión almacenada no es una protección: es un espejo de lo que el cliente declaró.** Cualquier volcado que se apoye en ella publica un padrón de domicilios.

### 1.8 Y lo que le falta a `/api/open-data` para ser una API

Cuatro rutas, todas sobre `dreams`. `GET /dreams` acepta `limit` con techo 500 (`routes.ts:42`) y nada más: sin cursor, sin bbox, sin rango de fechas, sin filtro por estado, sin metadatos de licencia ni de corte, sin versión, sin diccionario de campos, sin CSV. `POST /dreams` acepta `category` como `z.string().trim().max(60)` (`routes.ts:21`) — cualquier cosa.

---

## §2 La decisión

### 2.1 Un solo estado, una sola serialización, dos consumidores

El feed y el mapa **no son dos vistas de dos consultas**. Son dos representaciones de una `ConsultaTerritorial` única que vive en `ElMapa.tsx` y baja por contexto. Mover el mapa cambia la consulta; cambiar un filtro del feed cambia la consulta; los dos se redibujan desde el mismo objeto.

Que sea una sola consulta no significa una sola *request*: el mapa necesita todo lo que cae en el encuadre para dibujar, y el feed necesita cuarenta filas por vez para leer. Son requests distintas contra el mismo endpoint y con **la misma función pura de serialización** — `aParametros(consulta)`. Lo único que el feed agrega es `cursor` y `limite`. Hay una guarda que lo afirma (§8.1): si algún día un filtro se aplica de un lado y no del otro, el test falla antes que la pantalla mienta.

**El conteo autoritativo tiene una sola fuente y no es el feed: es `GET /senales/conteos`.** El sobre de una página de feed **no lleva `total`** — llevarlo ahí lo ataría al corte de esa paginación, y el mapa, que no pagina y por lo tanto no tiene corte, contaría sobre otro conjunto: dos números otra vez, ahora con más ceremonia. El `ContadorEnVista` y la cabecera del feed llaman los dos a `/conteos` con los mismos parámetros, y por eso son el mismo número. Eso arregla §1.3 de paso: un conteo del servidor no tiene techo de 500.

**Qué entra al registro: `senales`, entera.** Hay una sola tabla de señal (B §2.7), así que no hay nada que elegir ni que unir: el registro público es esa tabla menos las filas que el predicado incondicional de §2.7 excluye. Lo que agrupa es la **clase** —`hecho`, `deseo`, `acto`, `meta`—, que es lo que el filtro de capa siempre quiso decir.

*Se descartó el modelo de dos capas (`voz` y `propuesta`) y la maquinaria que lo sostenía: el desempate `capaRank`, los tres predicados de keyset asimétricos y el merge de dos listas ordenadas. No era un error de razonamiento —el bug que denunciaban es real y la nota queda en §4.3.2— pero existían sólo porque había dos tablas, y las tablas están en cero: no va a haber otro momento barato.*

`pulse_signals` y `territory_mandates` tampoco entran, y B les corta además la salida del mapa. Un mandato es **un agregado que sintetiza un LLM**, no algo que alguien dijo; darle el mismo array y el mismo peso que a la frase de un vecino sería que la IA determine la verdad de una señal (regla 6). *Esta spec tenía razón en el fondo y se detenía una superficie antes: el argumento vale igual para el mapa, que es lo que más gente mira.*

### 2.2 El ámbito es una unión, no un bbox

El feed no filtra por bbox. Filtra por **ámbito**, que es una unión discriminada:

```
{ tipo: 'pais' }                                    → todo el registro
{ tipo: 'recuadro'; bbox; provinciasTocadas }       → lo que se encuadró
```

Con `recuadro`, la respuesta trae **dos cosas separadas y nombradas**:

- `senales` — las que tienen punto adentro del rectángulo. Son las que se listan y se cuentan.
- `sinPunto` — cuántas señales sin coordenada hay en las provincias que el rectángulo toca, desglosadas por provincia. **No se listan mezcladas, no se suman, no se paginan.** Se muestran al pie del feed en un renglón plegado.

Ese renglón es la parte más importante del feed durante los primeros meses, porque con la ingesta actual **la mayoría de las señales van a caer ahí**. Un feed que las tirara en silencio mostraría un país vacío y sería falso.

**Qué dice el renglón, exactamente:** *«Estas señales no traen punto en el mapa. No sabemos si son de esta zona.»* No dice «sólo declararon su provincia»: A §2.6 declara válido el caso «rol no-`subject`, sin punto», que guarda calle y altura con `lat`/`lng` en NULL. Una fila así está ubicada a quince metros por su dirección y el renglón la presentaba como provincial. La frase corregida es cierta para las dos clases de fila; la otra mitad del arreglo está en §2.6.

`provinciasTocadas` lo calcula el servidor contra `MASCARA_PROVINCIAS` (§3.4). Sigue siendo una sobre-estimación deliberada —nombra de más, y como no se suma nada, nombrar de más agrega un renglón que dice «no sabemos», nunca un número inflado—, pero tiene que ser **chica**: por qué, y cómo, en §3.4.

### 2.3 El feed es cronológico y no tiene una sola línea de ranking

Orden: `creadaEn DESC`. Nada más. No hay score, no hay engagement, no hay boost por adhesiones, no hay «destacadas», no hay reordenamiento por afinidad. `listSignals` ya ordena así (`civic-map.ts:106`) y no hay nada que desarmar: hay que evitar agregarlo.

Default: **el encuadre actual del mapa**, no el país. Si todavía no hay encuadre, el ámbito es `pais` y la cabecera lo dice. **El primer `recuadro` que maplibre emite al montar no cambia el ámbito**: sólo lo cambia un movimiento de la persona. Si no fuera así, en un teléfono modesto el feed arrancaría en `pais`, alguien empezaría a leer, y al terminar de montar el instrumento perezoso la lectura se resetearía sola a un encuadre que nadie eligió — y la justificación de esta sección («la cercanía es la del mapa que la persona movió») sería falsa justo en el momento en que nadie movió nada.

No se adivina la ubicación de nadie por IP ni se pide geolocalización: la cercanía es visible y es la que la persona eligió.

### 2.4 El scroll infinito honesto: se puede scrollear para siempre, no está diseñado para eso

1. **Cursor, no offset.** El orden es descendente por fecha, o sea que lo nuevo entra *arriba*. Con offset, una sola inserción entre la página 1 y la 2 hace que la fila 40 aparezca dos veces y que una se pierda. El techo de ingesta anónima es 30 por hora por IP (`rate-limit.ts:92-95`): la colisión no es teórica.
2. **Corte fijo.** La primera página fija un `corte` (el `now()` del servidor) y lo devuelve **adentro del cursor**, no como parámetro de URL. El conjunto que estás leyendo no cambia mientras lo leés. Es a la vez la corrección técnica de la paginación y la decisión de diseño: **no hay badge de «3 nuevas»**. La cabecera dice la hora de corte. Una hora de corte es un dato; un contador de nuevos es un empujón.
3. **Autocarga acotada.** Las primeras tres páginas se cargan al llegar al fondo; de la cuarta en adelante hay un botón «Cargar 40 más». Tres páginas son 120 filas ≈ nueve pantallas de 900 px: quien pasó nueve pantallas está leyendo a propósito y merece que se lo pregunten. El botón dice cuántas llevás y cuántas hay (`120 de 3.412`).
4. **Nada se carga con la pestaña oculta** (`document.visibilityState === 'visible'`). Un feed que sigue pidiendo mientras mirás otra cosa está optimizando una métrica que este producto no tiene.
5. **Sin autoplay.** Hoy el feed no tiene media. La regla se escribe ahora, antes de que la tenga: nada se reproduce solo, nada se anima en bucle, y ninguna fila cambia de altura sin que alguien la haya tocado.

### 2.5 La descarga es un volcado periódico, no una generación al vuelo

- **La función no está hecha para streamear.** La API entera corre detrás de un rewrite a `api/index.mjs` y responde con `res.json()`. Un CSV de decenas de MB pide streaming real; hoy no hay un handler que lo haga.
- **El presupuesto de tiempo es chico y no está declarado.** `vercel.json` sólo declara `maxDuration` para `api/cron/rankings.mjs` (60 s); la función de API corre con el default de la plataforma.
- **Una descarga al vuelo no es reproducible.** Dos personas que bajan «el registro» con cinco minutos de diferencia obtienen dos archivos distintos y no pueden compararlos ni citarlos. Un volcado con fecha de corte, conteo de filas y sha256 es citable. El objetivo de esta pieza es que alguien pueda escribir «según el corte del 11 de agosto de 2026» y que eso signifique algo.

Volcado diario a las 09:00 UTC (06:00 en Argentina), tres formatos, comprimidos, con su archivo de procedencia y su hash.

### 2.6 El punto sale engrosado por un piso propio, y la dirección no sale

**El serializador no le cree a `senales.precision`.** Aplica un **piso de publicación** sobre el eje que la persona no elige:

```
si rol === 'subject' y engrosado_rechazado = false
   y la precisión almacenada es más fina que '500m'
   → precisión publicada = '500m'   (PROTECTED_FLOOR de location-policy.ts)
otros roles → la precisión almacenada
después, siempre: obfuscatePoint(punto, precisiónPublicada)
```

Por qué el piso y no `publishedPrecision`: esa función engrosa sólo con `subject && high`, y `sensitivity` **la elige quien envía**, así que no puede ser la única llave de la protección de quien envía. `rol` sí es del sistema: `subject` significa «el punto es de la persona o del asunto», y ahí el piso es incondicional. `capture` (la esquina del pozo) y `meeting_point` (el punto de entrega) siguen saliendo finos, porque publicarlos exactos es el objetivo — el argumento ya está escrito en `ROL_POR_TIPO` (`capturas.ts:42`).

**La única excepción es una columna, y ninguna otra cosa.** `senales.engrosado_rechazado` (B) se escribe sólo cuando la persona declaró que el punto es propio **y** declinó el engrosado con la propuesta a la vista. El piso honra esa columna y nada más: no mira `sensitivity`, no mira `overrideCoarsening` en memoria, no acepta un parámetro. *Se descartó la versión anterior de esta regla —piso incondicional para todo rol `subject`, sin excepción posible— porque negarle para siempre a alguien publicar su propia esquina es la otra mitad del error; lo que faltaba no era la decisión sino el lugar donde queda escrita, y una excepción que no se puede auditar sigue sin ser un consentimiento.*

**El piso se llavea en la fila, no en `lat`.** Una fila sin punto no queda fuera del alcance del piso por no tener sobre qué actuar: su ubicación publicable es la que resulte de aplicarle la misma regla a todo lo que la ubica. Y lo que la ubica además del punto es la dirección, así que:

**La dirección no sale, en ninguna forma.** Las cinco columnas de `direccionColumns` (A §3.4) —`calle_id`, `calle_texto`, `altura`, `direccion_texto`, `texto_libre`— nacen **privadas** en `COLUMNAS_CLASIFICADAS`, con su razón al lado, y §8.4.3 falla si alguien las reclasifica. La altura ubica en ~15 m por un campo de texto que el piso del punto no mira: una fila con altura publicada y punto engrosado a 500 m es el piso aparentando proteger. *Se descartó publicar la calle recortada: ninguna superficie pública la necesita hoy, y entra el día que exista la coordinación autenticada, que es donde A argumenta que sirve y donde el lector tiene nombre.*

`incertidumbreKm` sale de la precisión **publicada**; la almacenada nunca se publica. Y `obfuscatePoint` se aplica igual aunque el punto ya venga engrosado, porque es idempotente y no cuesta nada: es el cinturón sobre los tirantes para el día que una ingesta nueva guarde un punto crudo por error. Que sea determinístico importa y hay que decirlo en la procedencia: dos descargas del mismo dato dan el mismo punto, así que nadie recupera el original promediando N descargas. Un jitter aleatorio sí lo permitiría. Ésa es la diferencia entre proteger y aparentar que se protege.

### 2.7 Lo que nunca sale es una lista blanca — de campos y de filas

**Campos.** La respuesta pública no se arma desde la fila de base: se arma desde `FilaPublicable`, con sus campos enumerados y mapeados uno por uno. **No hay spread en ningún punto del camino.** Un campo nuevo en `senales` no aparece en ninguna respuesta ni en ningún volcado hasta que alguien lo escribe a mano en el mapeo — y hay guardas que fallan si lo escribe sin clasificarlo (§8.4).

**Filas.** Antes de cualquier filtro que pida quien consulta, el repositorio público aplica un **predicado incondicional de publicabilidad**, que no es parametrizable por nadie:

```sql
estado <> 'retirada' and retenida_en is null
```

Las dos mitades son necesarias y ninguna estaba antes:

- **`estado <> 'retirada'`** es la mitad revocable de la regla 9. Una señal retirada conserva su fila y su historia con el texto vaciado; sin esta cláusula pasaría el filtro y se publicaría el hueco con todo lo que lo rodea —geografía, estado, adhesiones—, que para una necesidad sobre la casa de alguien es peor que nada.
- **`retenida_en is null`** es el `unsafe` de C §2.6, el único canal por el que alguien puede decir «esto expone a una persona». C lo apaga en `/map/signals`, en `/map/cells` y en la cola de verificación; sin esta cláusula seguía encendido en la superficie más difícil de deshacer. Alguien marca la exposición, el sistema le cree lo suficiente como para sacarla del mapa, y a las 09:00 UTC la estampa en un CSV con sha256 y retención perpetua.

*Se descartó el predicado anterior —`dreams.status='approved'` y `proposals.status in ('voting','accepted')`—: no hay columna de moderación. `dreams.status` tenía default `'approved'`, o sea que era moderación que no existía, y bajo `senales` no queda nada que preservar.*

Una lista negra falla el día que alguien agrega la columna que nadie previó. Una lista blanca falla al revés: en la dirección segura.

### 2.8 Licencia: dos licencias, porque son dos cosas

El catálogo actual dice `CC0` (`datasets/index.ts:31`). Cambia, y se parte en dos:

- **La compilación y los metadatos** —conteos, cobertura, geografía, tipos, clases, estados, procedencia, la estructura del archivo— salen bajo **CC BY 4.0**. Eso el proyecto sí lo puede otorgar: es obra suya. CC0 renuncia a la atribución, y la atribución es lo único que permite que quien lea un número publicado vuelva a la fuente y vea con qué cobertura se midió. Un número de participación sin trazabilidad a su cobertura es el mal uso que la regla 5 existe para impedir.
- **El texto de cada señal lo escribió una persona.** El proyecto es custodio, no titular, y **un custodio no puede licenciar obra ajena**. La columna `texto` sale bajo CC BY 4.0 **sólo para las filas con cesión**, obtenida en el momento del envío. Las filas sin cesión salen completas menos `texto`: `texto: null` y `textoOmitido: 'sin cesión de licencia'`. Sirven igual para cobertura, geografía y conteos — y salir con menos es preferible a estampar una licencia inventada sobre un archivo con sha256 y retención perpetua.

El campo `licencia` del sobre distingue las dos y `/esquema` dice cuál cubre qué. **La cesión la obtiene B**, que es quien escribe el contrato de ingesta y rehace la superficie de carga (§7.2.4); el texto lo exporta D. Hasta que exista la columna que la marca, el volcado sale **sin la columna `texto` en ninguna fila**, y `PROCEDENCIA.md` lo dice en su primera plana.

### 2.9 Lo que el registro todavía no puede hacer, lo dice

La deliberación no se construye en esta serie: un hecho termina con corroboración blindada y un deseo sólo puede recibir adhesiones. La regla 11 queda cumplida entera de un lado y a la mitad del otro. La deuda está anotada como **D-037**.

**Eso no se disimula: se declara en pantalla.** Toda superficie que muestre una señal de clase `deseo` —la fila del feed, el recurso individual, `/esquema`— lleva la línea:

> «Todavía no se puede deliberar. Por ahora un sueño sólo recibe adhesiones. Lo estamos construyendo.»

Vive como constante en `packages/shared/src/open-data/textos.ts`, al lado del consentimiento (§7.2.4), y la imprime también `PROCEDENCIA.md`. Un producto que muestra un contador de adhesiones donde prometió deliberación y no dice nada está enseñando que la promesa era decorativa.

---

## §3 El esquema

### 3.1 `volcados` — el índice de lo bajable

Tabla nueva, migración `0017`. Una fila **por archivo**, no por corte: cuando el volcado se parta por mes (§4.4.4) el índice ya lo soporta sin migrar.

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
    /** {"hecho": 812, "deseo": 90, "acto": 12, "meta": 4} — el desglose que la
     *  procedencia publica. Por CLASE: la capa no existe (§2.1). */
    filasPorClase: jsonb('filas_por_clase').notNull(),
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
    check('volcados_estado_ck', sql`estado in ('generando','listo','fallido','purgado')`),
    check('volcados_formato_ck', sql`formato in ('csv','jsonl','geojson','sin-punto-csv','procedencia-md','procedencia-json')`),
    check('volcados_causa_ck', sql`causa is null or causa in ('lectura','serializacion','compresion','subida','tiempo','desconocido')`),
    /** Un corte listo sin URL sería una descarga que 404ea. */
    check('volcados_url_ck', sql`estado <> 'listo' or url is not null`),
  ],
);
```

**Lo que esta tabla NO guarda: el contenido.** Un volcado diario de ~8 MB comprimido × 3 formatos, retenido 30 días, son 720 MB de archivos derivados, o sea de lo único que se puede regenerar. La regla no depende de ningún techo: **la base guarda lo que no se puede reconstruir.** Los archivos van a un blob store (§4.4.3).

Los 512 MB son el límite del **plan free** de Neon, no una restricción de diseño; la suma conjunta de las cuatro specs se mide antes de decidir si se paga o si se diseña para caber (`2026-08-11-c-la-corroboracion.md` §3.7 es dueña de ese número). D no presupone ninguna de las dos salidas.

### 3.2 Los índices del keyset — y el que sirve el caso por defecto

```sql
-- El caso `pais`.
create index senales_feed_idx on senales (creada_en desc, id desc)
  where estado <> 'retirada' and retenida_en is null;

-- El caso `recuadro`, que es el DEFAULT del feed (§2.3) y el que ningún índice
-- cronológico cubre: `lat` recorta por latitud y el orden sale del índice;
-- `lng` queda como filtro residual.
create index senales_feed_geo_idx on senales (lat, creada_en desc, id desc)
  where lat is not null and estado <> 'retirada' and retenida_en is null;
```

Dos índices y no cuatro: hay una sola tabla. Los índices geo que dibujan el mapa sirven para el dibujo y se quedan; no sirven para el feed. Con 100.000 filas y un recuadro de barrio el planner tiene dos opciones y las dos son malas: escanear el índice cronológico entero descartando por bbox fila por fila hasta juntar 41, o traer los candidatos del bbox y **ordenarlos** — el sort de tabla que estos índices vienen a evitar. Con el debounce de 400 ms de §4.2, cada arrastre dispara ese plan de nuevo.

Los dos predicados parciales repiten el predicado incondicional de §2.7, y eso es a propósito: una fila que se retira o que se retiene **sale del índice** en el mismo UPDATE, y el plan del feed nunca la considera.

### 3.3 Nada de vistas materializadas — y qué entra en su lugar

Un conteo agregado sobre una tabla vacía tarda menos de un milisegundo; una MV hoy es peso muerto. Y cuando `/conteos` duela, **una MV refrescada una vez por día tampoco lo resuelve**: no puede responder una consulta parametrizada por bbox arbitrario cruzada con tipo, clase, estado, tema, provincia y rango. Lo que entra, en orden: (1) **los índices de recuadro de §3.2**, que ya están arriba porque el caso por defecto los necesita desde el día 1; (2) **caché de `/conteos` por clave de consulta, TTL 45 s** —un arrastre genera decenas de consultas casi iguales y las repeticiones exactas son la mayoría—; (3) **MV sólo para lo que no depende del ámbito**: total nacional, desglose por provincia y `provinciasSinSenal`, que son los que más se piden y los que menos cambian, refrescados por el cron del volcado.

No se declara umbral en milisegundos: con el compute de Neon en autosuspend, un arranque en frío se come cualquier p95 y el número mediría la siesta de la base. El disparador es el escalón 2 cuando el caché deje de tener hit rate útil.

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

Máscara de celdas y no bounding box: la caja cruda de Buenos Aires va del paralelo 33 al 41 y se solapa con seis provincias y CABA, así que un recuadro en el centro de La Pampa listaría «Buenos Aires: 6.100 sin punto» en el pie. Un aviso que aparece siempre y casi siempre sobra deja de leerse — y éste es el aviso que impide que el feed muestre un país vacío. Con 0,5° la sobre-estimación baja al borde de la celda (~55 km) y sigue siendo una constante commiteada, sin GeoJSON en runtime. Se genera desde el mismo GeoJSON de Natural Earth que ya lee `scripts/build/geo/generar-provincias-api.ts`, **reusando sus helpers de `capas/` y su normalización de nombres** — que es donde vive D-012 y donde CABA se rompe si se duplica. Por eso el script va en `scripts/build/geo/` y no en `scripts/content/` (que además arrastra D-033).

**Del nombre al id.** `provinciasQueTocan` devuelve **nombres**; el sobre publica ids y `sinPunto.porProvincia` agrupa por `province_id`. El paso intermedio es una tabla `NOMBRE_A_ID` **cacheada en memoria de módulo**: las 24 no cambian, se cargan una vez por proceso desde `geographic_locations` pasando por `normalizeProvinceName`, y se reusan — no es un lookup por request. Si una clave no resuelve, la respuesta **no la omite**: trae el renglón con `provinciaId: null` y el nombre, porque omitirla borraría en silencio a la gente de esa provincia, que es lo que §2.2 existe para impedir. Y dice `aproximacion: 'grilla-0.5'`, para que nadie lo lea como una intersección geométrica exacta; cuando A siembre los polígonos de departamento y municipio esto se afina sin cambiar la firma.

### 3.5 Lo que D **no** agrega al esquema, y lo que sí necesita que exista

- **No crea `senales`, ni `actores`, ni `adhesiones`, ni la columna de estado de calidad, ni `engrosado_rechazado`** (todas de B); **no crea `confirmaciones`, `senal_resolucion`, `rastro_senal`, `evidencia` ni `celda_luz`** (todas de C); **no toca `geographic_locations`** (A).
- **Sí depende de que `actualizada_en` signifique algo antes de publicarse.** Hoy no hay trigger y ningún repositorio la setea. Por eso `actualizadaEn` **no está en `FilaPublicable`**: publicar una fecha de actualización que nunca se actualiza es publicar un dato falso en un archivo que se cita por fecha. Entra cuando B la haga significar algo.
- **Sí depende del redondeo de fecha como función compartida**, no como regla propia: vive una sola vez en `civic-core` (§4.7) y D la importa igual que B y C.

---

## §4 El comportamiento

### 4.1 El estado compartido en la web

**Archivo nuevo:** `apps/web/src/pages/ElMapa/contexto-territorio.tsx`.

```ts
export type Ambito = { tipo: 'pais' } | { tipo: 'recuadro'; recuadro: Recuadro };

export interface ConsultaTerritorial {
  ambito: Ambito;
  /** 'todos' es distinto de la lista completa: significa «no filtré», y se
   *  serializa omitiendo el parámetro. Filtrar por todos los tipos y no filtrar
   *  son dos consultas distintas para el que lee la URL. */
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
  /** La señal iluminada, compartida por mapa y feed. Es el `idPublico`. */
  enfocada: string | null;
  enfocar: (id: string | null) => void;
}
```

No hay campo `capas`: la capa no existe como concepto (§2.1). Lo que agrupaba lo dice `clases`, que ya estaba.

`useVistaMapa()` se iza: deja de crearse en `Instrumento.tsx:32` y pasa a crearse en el proveedor, que vive en `ElMapa.tsx`. `Instrumento` lo consume.

**La serialización compartida** vive en `apps/web/src/pages/ElMapa/consulta-territorial.ts`: `aParametros(c: ConsultaTerritorial): URLSearchParams`, pura, sin React, testeada. La llaman los tres consumidores —`useSenalesMapa` (dibujo), `useRegistroPublico` (feed) y `useConteos` (las dos cabeceras)—. El feed agrega `cursor` y `limite`; el mapa agrega su `limite` de dibujo. **El corte no es parámetro de URL**: viaja adentro del cursor (§4.3.2).

### 4.2 La sincronía, caso por caso

| Gesto | Qué pasa |
|---|---|
| Arrastrás o hacés zoom en el mapa | `fijarAmbito(..., 'usuario')` → el feed se remonta desde la página 1 con corte nuevo. **Con debounce de 400 ms**: sin eso, un arrastre de dos segundos dispara veinte requests. |
| Mientras el feed refetchea | **Se conservan las filas anteriores** (`placeholderData` de react-query) y la cabecera marca «actualizando». Nunca hay vacío intermedio: en una red mala eso haría parpadear el feed en cada paneo (regla 10). |
| maplibre monta y emite su primer `recuadro` | **No cambia nada.** `fijarAmbito(..., 'montaje')` sólo lo guarda para cuando la persona mueva. Un feed que se resetea solo al terminar de montar el instrumento perezoso reinicia una lectura que nadie interrumpió. |
| Tocás un chip de tipo, clase o estado | `fijarFiltro` → mapa y feed cambian juntos, misma request base. |
| Pasás el mouse o el foco por una fila | `enfocar(idPublico)` → el punto gana anillo y halo. **El mapa no se mueve.** Mover el encuadre por un hover cambiaría la consulta y recargaría el feed que estás leyendo: un bucle. |
| Abrís el pliegue de una fila | `enfocar(idPublico)` y el mapa hace `easeTo` al punto **sin cambiar el zoom**, sólo si está fuera del encuadre. Es un gesto deliberado, no un hover, y por eso sí puede mover. Si el `easeTo` cambia el recuadro, el feed **no se remonta**: entra por `fijarAmbito(..., 'easeTo')`, y la cabecera marca que el encuadre se movió por vos. |
| Clickeás un punto en el mapa | `enfocar(idPublico)`; el feed abre esa fila con `scrollIntoView({ block: 'nearest' })`. |
| Clickeás un punto fuera de las páginas cargadas | Se pide `GET /senales/:idPublico` y la cabecera muestra esa señal sola, con un botón para saltar. **No se autopagina para ir a buscarla**: sería scroll que vos no pediste. |
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
| `clase` | `hecho,deseo,acto,meta` | ausente = todas. Reemplaza al viejo `capa` (§2.1) |
| `tipo` | los del catálogo de B §3.1 | ausente = todos |
| `tema` | slug | el eje ortogonal al tipo |
| `estado` | los publicables | `retirada` y cualquier valor fuera del catálogo son 400, no filtro silencioso (§4.6) |
| `provincia`, `ciudad` | id | |
| `desde`, `hasta` | ISO 8601 | filtro de quien consulta. **No es el corte**: el corte viaja en el cursor |
| `cursor` | sellado | |
| `limite` | 1–200, default 40 | |

**El lado mínimo del bbox.** Se rechaza con 400 —«el recuadro es más chico que la precisión del dato»— todo rectángulo con un lado menor a 100 m (la grilla pública más fina que se publica); ídem en `/conteos`. Es un control barato y correcto, pero **no es lo que sostiene la regla 2**: aunque no existiera, un recuadro chico no revelaría nada que la fila no diga ya, porque la fila sale con el piso de §2.6. El que carga el peso es el piso; esto es higiene.

**Por qué 40.** Una `FilaIndiceExpandible` colapsada mide ~72 px: 40 filas son ~3,2 pantallas de 900 px y ~20 KB crudos, que alcanza para scrollear un rato sin pedir de nuevo y baja bien en una red intermitente (regla 10). El techo de 200 es para quien scriptea, no para la pantalla.

#### 4.3.2 El cursor

Con una sola tabla el keyset es simple: orden total `(creada_en DESC, id DESC)`, predicado `(creada_en, id) < (t, i) and creada_en <= corte`, se piden `limite + 1` filas y sobra la última. Sin merge, sin rango de capa, sin predicados asimétricos: 41 filas leídas para devolver 40.

Adentro del cursor viajan cuatro cosas:

```
{ t: "2026-08-11T14:32:11.004Z", i: 412,
  corte: "2026-08-11T17:00:00.000Z", h: "9f3a1c" }
```

`t` es `creada_en` con el milisegundo exacto, `i` el `id` serial, `corte` el instante que fijó la página 1, y `h` el hash corto de los filtros.

**El cursor va sellado, no codificado.** `base64url(iv ++ cifrado ++ mac)`: el payload se cifra y se autentica con HMAC-SHA256 sobre el texto cifrado, con un secreto de servidor. Sólo firmarlo probaría que el cursor es nuestro y dejaría el serial y el milisegundo legibles con un decodificador de dos líneas — que es exactamente el par que §4.7 declara que no sale, publicado por la puerta de atrás y sirviendo el ataque de correlación que B describe. El contrato para quien lo usa no cambia: *devolvé el cursor que te di*. Y por eso su forma puede cambiar sin subir la versión del esquema.

`corte` viaja adentro y **no es parámetro de URL**: si fuera parámetro, o entra al hash de filtros y entonces toda página 2 es 400 (la 1 se pide sin él), o no entra y entonces un cliente puede cambiarlo entre páginas y mezclar dos conjuntos. Adentro del cursor no puede pasar ninguna. `h` cubre `ambito`, `bbox`, `clase`, `tipo`, `estado`, `tema`, `provincia`, `ciudad`, `desde` y `hasta` — todo lo que cambia el conjunto. No cubre `limite`: cambiar el tamaño de página no cambia qué filas hay.

> **Nota para el día que haya una segunda fuente.** Si alguna vez el feed vuelve a unir dos orígenes ordenados, el predicado de keyset **no es el mismo en las dos subconsultas**, y escribirlos iguales saltea filas en silencio: para la subconsulta de rango `r`, dado el cursor `{t, c, i}`, es `created_at < t` cuando `r < c`, `created_at < t OR (created_at = t AND id < i)` cuando `r == c`, y `created_at <= t` cuando `r > c`. Con un `(created_at, id) < (t, i)` idéntico en las dos, una fila con el mismo `created_at` al milisegundo y `id` mayor desaparece del feed y del volcado sin que se note mirando la pantalla. Hoy no aplica —hay una tabla— y por eso el diseño no la paga; queda escrito para que no se redescubra a los golpes.

Implementación en `packages/db/src/repositories/civic-feed.ts`: `listSignalsPage(consulta, cursor, limite)`. `hayMas` es `true` si vino la fila 41; **nunca se calcula pidiendo el total**.

#### 4.3.3 El sobre del feed

```jsonc
{
  "data": {
    "senales": [ /* FilaPublicable[] */ ],
    "pagina": { "cursor": "v1.Zm9vYmFy…", "hayMas": true, "limite": 40, "corte": "2026-08-11T17:00:00.000Z" },
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

**La regla del sobre, en una línea:** *todo número que alguien puede citar en público viaja con procedencia; los de transporte, no.* Con procedencia (`Magnitud` de `simulacion/procedencia.ts`): `total`, `actoresDistintos`, `fraccionConPunto`, `fraccionCorroborada`, `sinPunto.total`, `porCanal[].n`, `adhesiones`, `actoresQueConfirmaron`. Sin: `limite`, `hayMas`, `provinciasTotales`. La guarda que hoy existe recorre el resultado de la Simulación y **no cubre una respuesta HTTP**: por eso §8.4.5 escribe la que falta, sobre el sobre serializado.

#### 4.3.4 `FilaPublicable` — la lista blanca

```ts
export interface FilaPublicable {
  /** `senales.id_publico`. El serial no cruza el borde: un id ordinal permite
   *  enumerar el corpus y emparejar por vecindad dos señales de la misma sesión. */
  idPublico: string;
  clase: 'hecho' | 'deseo' | 'acto' | 'meta' | null;

  /** Quién produjo esta fila: la disciplina de `Procedencia` aplicada a la fila
   *  (regla 6). `de` en castellano. Hoy ninguna ingesta escribe `derivado` —el
   *  clustering murió con `proposals`— y la variante queda igual: el día que una
   *  máquina escriba una señal, la fila tiene que poder decirlo sin migrar. */
  procedencia: { tipo: 'persona' } | { tipo: 'derivado'; de: string };

  tipo: TipoSenal | null;
  /** Lo que llegó cuando `tipo` es null. Nunca se pliega a un tipo real: el
   *  `?? 'valor'` de hoy (mandato-regimen.ts:46, paleta.ts, el-mapa-data.ts) es
   *  la versión de tipos de «devolver 0 para decir no sé». Se publica acotado
   *  —≤60 caracteres, sólo imprimibles, sin controles ni marcas de dirección—
   *  porque su valor típico es, por construcción, lo que alguien mandó fuera de
   *  vocabulario contra un `z.string().max(60)` sin enum. */
  tipoCrudo: string | null;
  tema: string | null;           // eje ortogonal, lo pone el clasificador

  /** Regla 4. Unión, no enum pelado: un default inventado publicaría un juicio
   *  de calidad que nadie emitió. Cubre los SIETE valores de la columna de B, no
   *  cinco: sin rama para `no_cumplida` el serializador o no compila o inventa
   *  un default. `retirada` tiene rama y no llega nunca: la excluye §2.7.
   *  `motivo` es el dominio cerrado de C §2.6, y sin él `desactualizada` vuelve
   *  a ser un 0 que dice «no sé»: «ya no está» y «nadie volvió a mirar» no son
   *  lo mismo. */
  estado:
    | { tipo: 'estado';
        valor: 'enviada' | 'por_verificar' | 'corroborada' | 'resuelta'
             | 'desactualizada' | 'no_cumplida' | 'retirada';
        motivo: MotivoEstado | null }
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
  departamentoId: number | null;
  departamento: string | null;
  ciudadId: number | null;
  ciudad: string | null;

  /** Claves de actor distintas que adhirieron (B). Cero es cero. */
  adhesiones: number;
  /** `null` cuando `clase` es null: no es «esto no es un hecho», es que nadie lo
   *  clasificó. Publicar `false` ahí sería el mismo pecado que `?? 'valor'`. */
  corroborable: boolean | null;
  /** Claves de actor distintas que confirmaron ESTA señal, en la ronda vigente.
   *  NO se llama `confirmaciones`: esa palabra la reserva C §2.8 para las señales
   *  en {corroborada, resuelta} de una CELDA, que es lo que alimenta la nitidez.
   *  Quien bajara el CSV y sumara una columna llamada `confirmaciones` para
   *  reproducir la nitidez publicada obtendría un número que no se parece, sin
   *  forma de darse cuenta — el defecto que originó esta serie. `null` cuando
   *  `corroborable` es `false` o `null`: no es cero, es inaplicable. */
  actoresQueConfirmaron: number | null;

  /** Redondeado por la función compartida de `civic-core` (§4.7): a la hora en
   *  la API, al día cuando `sensitivity='high'`, al día siempre en el volcado. */
  creadaEn: string;
}
```

**`adhesiones` y `actoresQueConfirmaron` no son «personas».** Son **claves de actor distintas, sin verificación de identidad**, y `/esquema` y `PROCEDENCIA.md` lo dicen en la misma línea que el número. Con mil claves fabricadas y rotación de IP contra un techo de 30/hora, alguien publica `adhesiones: 1000` sobre una necesidad inventada y nada lo distingue de mil personas. Lo que lo acota vive en B (§7.2.2 y 7.2.3); lo que lo hace **auditable desde afuera** vive acá: `cobertura.actoresDistintos` publicado junto al total, para que una relación filas/actores que se desploma sea visible sin acceso a la base.

**`provincia`, `departamento` y `ciudad` se resuelven con un solo `LEFT JOIN`** sobre `geographic_locations`, con el filtro de nivel tomado de la constante compartida que A exporta y **nunca de un literal tipeado dos veces**. El vocabulario es el de A §3.1 —`province`, `department`, `municipality`, `locality`, `settlement`—: `'city'` no existe y `'localidad'` en castellano nunca existió. El filtro anterior de esta spec (`level in ('city','localidad')`) no matcheaba ni un valor: habría publicado `ciudad: null` en todas las filas, en silencio, sin que ninguna guarda de §8.4 lo viera, porque no aparece una columna nueva: cambia lo que apunta una vieja. Por eso §8.2 gana la guarda que faltaba.

Qué se publica según a qué apunte `city_id`:

| `city_id` apunta a | Qué sale |
|---|---|
| `locality` | `ciudad` = su nombre |
| `settlement` | **se sube al `parent_id`** y sale la localidad censal. El nombre del asentamiento no se publica: para un paraje de cuarenta casas es bastante más fino que los 500 m del piso de §2.6, y entra por el campo de texto que el piso no mira |
| `department` (el camino protegido de A, cuando `ubicacionPublicable` sube el nivel) | `ciudad = null` y `departamento` = su nombre. Por eso existe el campo: rotular un departamento como «Ciudad» es la fuga por el flanco que A abrió para tapar la otra |

#### 4.3.5 Los otros endpoints

| Ruta | Qué devuelve |
|---|---|
| `GET /senales/conteos` | **La única fuente del conteo.** Mismos filtros. Alimenta la cabecera del feed y el `ContadorEnVista`. Sobre abajo. |
| `GET /senales/:idPublico` | Una fila, **mismo serializador y mismo predicado incondicional de publicabilidad**, más `firma` si la fila la trae. **404 para todo lo no publicable, nunca 403**: un 403 sería un oráculo para confirmar la existencia de señales retiradas o retenidas probando ids. Entra explícitamente en el recorrido de las guardas de §8.4. |
| `GET /volcados` | El índice en estado `listo`, más nuevo primero, con url, bytes, sha256, filas y corte. `?incluirFallidos=true` agrega los `fallido` (con su `causa`) y los `purgado`. Alimenta `/datos-abiertos`. |
| `GET /esquema` | El diccionario de campos, servido **desde el mismo descriptor runtime del que se deriva `FilaPublicable`** (§8.4.1): nombre, tipo, nulabilidad, qué significa el null, valores de cada enum, superficie, y la política de compatibilidad (§4.5.3). |
| `GET /provincias` | Las 24. Reemplaza `/api/open-data/provinces`. |

**`firma` sale en un solo lugar, y por eso el descriptor tiene una columna más.** B la manda al recurso individual y le prohíbe a D publicarla en la descarga masiva: `group by firma order by sum(adhesiones)` sobre un CSV público es un ranking individual construido por el propio proyecto (regla 7). Como el serializador es uno solo, cada campo del descriptor declara `superficie: 'todas' | 'recurso'`, `firma` es el único marcado `recurso`, y §8.4.2 falla si aparece en el feed o en los formatos. Sin esa columna, el único campo de autoría del sistema no se publicaba en ningún lado y el prompt que invita a firmar escribía donde nadie mira.

El sobre de `/conteos`:

```jsonc
{ "data": {
  // Acotado a propósito: la subconsulta pide COTA+1 y no hay count(*) sin techo.
  // «Al menos 50.000» es más veraz que un exacto que cuesta un escaneo, y le
  // pone presupuesto al abuso (§4.6).
  "total": { "tipo": "exacto", "magnitud": { "valor": 3412, "unidad": "señales",
             "procedencia": { "tipo": "medido", "fuente": "conteo sobre senales al corte" } } },
  "cobertura": {
    "actoresDistintos": { "valor": 812, "unidad": "claves de actor", "procedencia": { "tipo": "derivado",
        "formula": "actores distintos al corte, sin verificación de identidad", "de": ["senales"] } },
    "provinciasConSenal": 7, "provinciasTotales": 24,
    "provinciasSinSenal": ["Catamarca", "Formosa", "…"],
    "fraccionConPunto": { "valor": 0.41, "unidad": "fracción", "procedencia": { "tipo": "derivado",
        "formula": "señales con lat no nula ÷ señales", "de": ["senales"] } },
    "fraccionCorroborada": { "tipo": "inaplicable", "razon": "No hay hechos que comprobar en este ámbito." },
    "porCanal": [ { "canal": "web", "n": { "valor": 3180, "unidad": "señales", "procedencia": { "tipo": "medido", "fuente": "senales.origen" } } } ],
    "advertencia": "Esto mide quién habló, no qué pasa. …"
  },
  "sinPunto": {
    "total": { "valor": 87, "unidad": "señales", "procedencia": { "tipo": "medido", "fuente": "señales sin coordenada en las provincias tocadas" } },
    "porProvincia": [ { "provinciaId": 1, "provincia": "Buenos Aires", "n": 61 } ],
    "razon": "Estas señales no traen punto en el mapa. No sabemos si son de esta zona."
  },
  "porClase": { "hecho": 3390, "deseo": 22 }, "porTipo": {}, "porEstado": {}, "porProvincia": {}
} }
```

`porCanal` lee `senales.origen` (`web` | `campo` | `campo-v1`), que es el canal de ingesta y nada más. *El campo de fila que antes se llamaba `origen` pasó a `procedencia`: `origen` ya significa canal en la base de B, y dos ejes ortogonales compartiendo palabra en el mismo sistema es el defecto de origen reproducido en la spec que existe para no reproducirlo.*

`fraccionCorroborada` usa la forma de `Nitidez` y **su razón es propia**, no la de `nitidezDeCelda`: ésa dice «en esta celda» (`brillo.ts:76`) y acá el sujeto es un ámbito. Misma doctrina, texto distinto y declarado como distinto.

**`sinPunto` está afuera de `senales` y afuera de `total`.** Nunca se suman. Ése es el respeto literal a la nota de `civic-map.ts:115-118`.

### 4.4 El volcado

#### 4.4.1 Los tres formatos, y por qué tres

- **CSV** — la planilla: lo que abre un periodista, un concejal, una maestra. Sin ella, «datos abiertos» significa «abiertos para programadores».
- **GeoJSON** — QGIS, Datawrapper, Felt. **Sólo las señales con punto**: una señal provincial no es un `Feature`. Va con un hermano obligatorio `sin-punto.csv` con el conteo por provincia, para que nadie crea que el registro son sólo los puntos. Si saliera solo, sería el mismo borrado silencioso que §1.4 denuncia.
- **JSONL** — el único de los tres que se lee sin cargar el archivo entero en memoria **y** sin un parser de CSV que sepa de comillas y saltos adentro del campo. El `texto` de una señal puede tener los tres: el CSV es la forma más fácil de que alguien lo parsee mal y publique un análisis roto. Una línea = un objeto = `JSON.parse` no se equivoca. Cuesta un serializador de doce líneas.

Los campos de unión salen como **dos columnas** en CSV, no como una: `estado`/`estado_motivo` (más `estado_razon` cuando es `sinEstado`), `procedencia`/`procedencia_detalle`, `texto`/`texto_omitido`, `corroborable` con tres valores documentados (`si`/`no`/vacío) y `actores_que_confirmaron` vacío cuando es inaplicable. Una planilla no puede leer una celda vacía como cero si la columna de al lado dice por qué está vacía.

#### 4.4.2 Cuánto pesa — con la cuenta a la vista

Hoy las tablas están en cero, así que todo esto es proyección declarada. El escenario que se dimensiona es **100.000 señales**: el `PISO_MANDATO` de 100 voces cada 100.000 habitantes pide 45.860 voces distintas para que exista un mandato nacional, así que 100.000 señales es «el mandato existe y sobra» — el orden de magnitud correcto para dimensionar, no un piso ni un techo. Bytes por fila, campo por campo, con `texto` en 120 caracteres de mediana:

| Formato | Bytes/fila | 100.000 filas | gzip (×5 conservador sobre texto con claves repetidas) |
|---|---|---|---|
| CSV | ~325 | 32,5 MB | **6,5 MB** |
| JSONL | ~490 | 49,0 MB | **9,8 MB** |
| GeoJSON (60% con punto) | ~610 × 60.000 | 36,6 MB | **7,3 MB** |
| **Total** | | **118 MB** | **~24 MB** |

El 60% con punto es proyección declarada, no medición: la captura de campo siempre trae punto y la web lo trae sólo si la persona lo clava. Con 0 filas hoy la fracción real es desconocida — y por eso `cobertura.fraccionConPunto` la publica en cada respuesta, para que la proyección se corrija con el dato en vez de con otra proyección.

#### 4.4.3 Cuánto tarda, cómo se protege y dónde vive

Cron a las `0 9 * * *` (06:00 en Argentina, antes del horario en que alguien mira el sitio), `maxDuration: 60`. **Corre después del barrido de retención de C** (la pasada que resuelve los `unsafe` de más de 72 h), no antes: si el orden se invierte, una señal marcada como expuesta entra al corte del día y el corte es lo único que no se puede deshacer.

**La ruta exige `Authorization: Bearer ${CRON_SECRET}`; sin secreto válido devuelve 401 y loguea**, con el helper que `apps/api/src/vercel/cron-rankings.ts:16-30` ya implementa. Los paths de cron están excluidos del rewrite de `vercel.json` (`"source": "/api/((?!cron/).*)"`), o sea que la función es alcanzable por GET desde cualquier lado: sin la guardia, un `while true; do curl …; done` lee la tabla entera contra la misma Neon que sirve el sitio y sube 24 MB al blob pago **en cada vuelta**, con un `corte` distinto por corrida que el índice único no puede frenar. Dos defensas más, por si el secreto se filtra o Vercel reintenta: **idempotencia por día UTC** y **advisory lock de Postgres** sobre una clave fija.

Presupuesto para 100.000 filas: lectura paginada a 10.000 filas, ~10 round-trips a ~200 ms → **~2,0 s**; serialización 300.000 objetos a ~1 µs → **~0,3 s**; gzip 118 MB a ~50 MB/s → **~2,4 s**; subida 24 MB a ~20 MB/s → **~1,2 s**. Total **~6 s**, holgura de 10× contra los 60. **La restricción que sí aprieta no es el tiempo: es la memoria.** 118 MB de strings en el heap de una función, con la copia comprimida al lado, es imprudente; por eso el generador **escribe por chunks a un stream** y nunca arma el archivo completo: cada 5.000 filas se serializa, se pasa por el gzip stream y se suelta. Tres requisitos que no son detalles de implementación:

1. **Toda página filtra por el corte y pagina por keyset**, con el mismo predicado del feed. Nunca por `offset`. El cliente es `drizzle-orm/neon-http` (`client.ts:11`): HTTP sin sesión, cada página es su propia transacción y no hay snapshot que sostener entre las diez. La consistencia la da el predicado, no la transacción. Con offset y una inserción entre la página 3 y la 4, el CSV duplica una fila y pierde otra — y el archivo lleva `filas` y `sha256` publicados, así que el error queda firmado y citable.
2. **Aislamiento por fila.** `try/catch` por fila: la que falla se omite y se cuenta en `filasOmitidas`, que `PROCEDENCIA.md` publica por clase de razón (cero omitidas es un renglón que dice cero). El corte se marca `fallido` sólo si falla la subida, el hash o el presupuesto. Sin esto, una fila con `lat` fuera de rango escrita por una ingesta futura tumba la descarga del día entero — y la palanca la tiene cualquiera con `curl`.
3. **Las filas se escriben barajadas dentro de cada chunk**, con orden determinístico `sha256(idPublico ++ corte)`. Motivo en §4.7: con las filas de una sesión de campo contiguas y ordenadas por fecha, unir los puntos reconstruye el recorrido a pie de un voluntario. Determinístico para que dos generaciones del mismo corte den el mismo archivo y el sha256 siga significando algo.

**Dónde viven los archivos:** `@vercel/blob`, con ADR. Suma la dep número **39 de un tope de 45** que aplica `pnpm deps:check` (`scripts/build/deps.ts:32`) — `v2/CLAUDE.md` todavía dice 60 y está desactualizado. La justificación: un cron no puede escribir el filesystem de una función serverless, `apps/web/public/datasets/` se hornea en build, y las dos alternativas son peores — commitear el volcado al repo dispara un deploy por día y engorda el repo linealmente para siempre; guardarlo en Postgres pone en la base lo único que se puede regenerar (§3.1). Queda **externa al bundle** (`dependenciasExternas()` lee `apps/api/package.json`), lo que implica que Vercel la instala en `apps/api/node_modules`, no en la raíz.

**Retención, con su mecanismo.** Los **7 cortes diarios** más recientes, más el **corte del día 1 de cada mes**: 168 MB de rolling más 288 MB por año a 100.000 filas. Por qué 7 y no 30: quien necesita un corte de hace más de una semana necesita en realidad una serie, y para eso están los mensuales. **El barrido corre en el mismo cron, después de subir el corte del día**: borra del blob los diarios fuera de la ventana y pasa sus filas a `estado = 'purgado'` con `url = null`. Sin ese paso, al día 8 `/volcados` listaría filas `listo` con `sha256` de archivos borrados. **Los mensuales no se borran, y eso es una decisión, no un default:** publicar un mensual es **irrevocable hacia atrás**, quien lo bajó lo tiene. Por eso ese hecho no vive sólo en `PROCEDENCIA.md` —que lo lee quien baja— sino en el consentimiento que la superficie de carga muestra **antes** de enviar (§7.2.4). Si esa pantalla no existe, D no publica.

**Se publican con extensión `.gz` explícita y sin `Content-Encoding: gzip`.** Razón: si el blob descomprimiera en tránsito, el archivo que llega al disco no sería el que hashea el `sha256` publicado, y un hash que no se puede verificar contra lo que bajaste no sirve para nada.

#### 4.4.4 Cuándo se parte

**Cuando el volcado pase de 200.000 filas** se parte por mes (`senales-2027-03.csv.gz`) y `volcados` gana una fila por partición — para eso existe `particion` desde el día 1. El umbral es dos tercios del presupuesto medido: a 200.000 filas el volcado tarda ~12 s de los 60, y el margen que queda absorbe un día lento de Neon sin que el cron muera a mitad de la subida y deje un archivo truncado marcado `listo`. (Por eso `estado` arranca en `generando` y sólo pasa a `listo` después de que la subida terminó y el hash se calculó sobre lo subido.)

#### 4.4.5 El archivo de procedencia

Cada corte lleva `PROCEDENCIA.md` (para leer) y `procedencia.json` (para parsear). En este orden:

1. **La advertencia de la regla 5, primera línea, antes de cualquier número.** «Esto mide quién habló, no qué pasa.» Y en el mismo párrafo, la distinción que el número no lleva pegada: **esto cuenta señales, no personas**; el conteo de claves de actor distintas está al lado y no verifica identidad.
2. El corte exacto y la versión de esquema.
3. Filas por clase, tipo, estado, motivo y **procedencia** (persona / derivado), cada una como `Magnitud` con procedencia `medido`. Más `filasOmitidas` por clase de razón.
4. **La política de engrosado aplicada**: el piso de §2.6 con su regla escrita, a qué grilla se engrosó, que la dirección no sale, y que `obfuscatePoint` es determinístico — con la frase de por qué eso importa.
5. **Los campos excluidos, con su razón**, uno por uno (§4.7), generados desde el mapa de clasificación (§8.4.3). No basta decir «anonimizado».
6. La cobertura: provincias con señal y sin señal, nombradas.
7. **La métrica norte, copiada de `/metrica-norte` y no recalculada.** Los cuatro buckets de `cierre_tipo` de C §4.5, con la prohibición de sumarlos, y el número de la palabra que da nombre a la métrica (`expuestasYReparadas`). El volcado **cita**: no vuelve a contar sobre sus propias filas con su propia unidad, porque el número que va a terminar citado afuera es el del archivo, y dos denominadores para el mismo hecho es la regla 5 rota por la propia plataforma.
8. **La deliberación, declarada** con el texto de §2.9: un deseo sólo recibe adhesiones y todavía no se delibera.
9. El sha256 y los bytes de cada archivo del corte.
10. Las dos licencias (§2.8) y cuántas filas salieron sin `texto` por falta de cesión.
11. Los defectos conocidos que afectan al dato, linkeados a `docs/DEUDAS.md`. Hoy: `D-011` (la geometría de Natural Earth erra en los bordes provinciales), `D-026` (la población de celda se estima con densidad provincial pareja, lo que subestima el brillo del campo) y `D-037` (no hay deliberación).

El punto 11 es el que hace que este archivo valga: un volcado que no publica sus propios defectos conocidos le pasa el problema al que lo baje.

### 4.5 La API abierta: versionado y política de rotura

#### 4.5.1 Lo viejo se congela

`/api/open-data/*` sigue funcionando y gana en toda respuesta:

```
Deprecation: true
Sunset: Thu, 11 Feb 2027 00:00:00 GMT
Link: </api/v1/open-data/senales>; rel="successor-version"
```

(El 11 de febrero de 2027 es jueves. Un HTTP-date con el día de semana equivocado lo rechaza un parser estricto, y los parsers son los únicos que leen esta cabecera.)

**D pone las cabeceras y la fecha; el comportamiento lo describe B en un solo lugar** — el adaptador contra `senales`, sus códigos nuevos y la salida de `submittedAs`. Dos documentos con dos planes sobre el mismo archivo es cómo se promete estabilidad sobre una ruta que se está reescribiendo por dentro. De D queda la promesa de fecha y **la guarda que verifica que la fuga esté cerrada** (§8.4.2): una implementación, dos documentos, una guarda.

#### 4.5.2 Qué es aditivo

Un campo nuevo en la respuesta, o un valor nuevo en un enum de salida, **no rompe y no sube versión**. La consecuencia se declara y va escrita en `/esquema`: **todo cliente tiene que tolerar campos desconocidos y valores de enum desconocidos.** Un cliente que hace `switch` exhaustivo sobre `estado` y tira si no matchea se va a romper, y eso está avisado desde el principio.

#### 4.5.3 Qué rompe y qué pasa entonces

Rompen: sacar un campo, cambiarle el tipo, sacar un valor de un enum, cambiar el significado de un campo sin cambiarle el nombre, y cambiar el orden por defecto.

Cuando algo de eso hace falta: sube `/api/v2/open-data/*`, la v1 vive **seis meses** con `Sunset` y los dos últimos devuelven además `Warning: 299`. Seis meses son dos ciclos de un trabajo trimestral: menos obliga a alguien a rehacer un análisis a mitad de camino, que es el costo que una API pública existe para no imponer.

**El esquema `0` es la salida honesta mientras algo declarado todavía no exista.** Si el registro sale antes de que exista la cesión de licencia, sale con `esquema: 0`, `/esquema` lo declara pre-release, **no** se emite `X-Registro-Esquema`, y la política de compatibilidad **no rige hasta el esquema 1**. Un esquema que puede romper y lo dice es honesto. Lo que no se hace es inventar un valor de enum «pendiente»: sacarlo después sería un cambio rompedor que forzaría `/api/v2` a semanas del lanzamiento. Con `esquema >= 1` cada respuesta lleva `X-Registro-Esquema: 1` además del campo del sobre.

### 4.6 Casos límite

| Caso | Qué hace |
|---|---|
| `estado=retirada` en la query | **400**: «Una señal retirada no se publica (regla 9).» No se ignora en silencio: eso devolvería resultados y dejaría creer que no hay retiradas. |
| Un valor de `estado`, `tipo` o `clase` fuera del catálogo | **400** nombrando el valor. Filtrar en silencio devuelve un conjunto vacío que se lee como «no hay». |
| `capa=…` (parámetro viejo) | **400**: «`capa` no existe: hay una sola tabla de señal. Lo que agrupaba es `clase` (§2.1).» |
| `bbox` invertido o fuera de rango | 400 con el mensaje que ya existe en `civic-map/validation.ts`. |
| `bbox` con un lado menor a 100 m | 400: «el recuadro es más chico que la precisión del dato». Ídem en `/conteos`. |
| `bbox` que cruza el antimeridiano | 400. Argentina no lo cruza. Aceptarlo pediría partir el rectángulo y devolver resultados que nadie va a auditar. |
| Cursor corrupto, de otra clave o de otro esquema | 400 «Cursor inválido: pedí la primera página de nuevo». Nunca se cae a la página 1 en silencio: eso haría que un scroll roto se vea como un scroll que vuelve a empezar. |
| Cursor con filtros distintos a los de la página 1 | 400: el `h` no coincide y seguir sería mezclar dos consultas. |
| `recuadro` sin ninguna señal con punto adentro | 200 con `senales: []`, `sinPunto` poblado, y `AREA_VACIA` (`conteo.ts:141`): «No hay nada acá todavía. Que un área esté vacía también es información.» |
| Cero señales en todo el registro (el día 1) | El estado por defecto. El feed monta `Vacio` (`instrumento/Vacio.tsx`), que contesta la pregunta en su versión de cero en vez de decir «sin datos». |
| El volcado del día falló | La fila queda `fallido` con su `causa` (dominio cerrado), `/volcados` **no la lista** pero `?incluirFallidos=true` sí, y `/datos-abiertos` muestra el último `listo` con su fecha real. Un corte faltante que aparece como «no hubo actividad» sería una mentira por omisión. |
| El cron corre dos veces el mismo día | La segunda no genera nada: idempotencia por día UTC más advisory lock (§4.4.3). |
| Una fila rompe un serializador | Se omite, se cuenta en `filasOmitidas` y el corte sale igual. Un corte caído por una fila es una palanca de denegación al alcance de cualquiera. |
| Una señal cambia de estado mientras paginás | No la ves cambiar: el corte fija el conjunto. La ves cambiada la próxima vez que arranca el feed. |
| Una señal se retira o se retiene después del corte | Sale de la API en el acto —el predicado de §2.7 es incondicional— y del corte siguiente. Los volcados viejos la conservan: **un volcado es una foto, no un estado vigente**, y eso está en el texto de consentimiento del envío, no sólo en `PROCEDENCIA.md`. |
| `sinPunto` supera a `senales` | Pasa, y es el caso normal al principio. La cabecera lo dice sin disculparse. |

### 4.7 Lo que NUNCA sale, por la API ni por el volcado

| Campo / cosa | Por qué |
|---|---|
| `user_id` y todo derivado (nombre, email, avatar, handle) | Regla 7: sin autor no hay ranking posible. La red sigue lugares y necesidades, no personas (decisión 10). |
| `actor_id`, `actor_hash`, `actor_key` — cualquier identificador seudónimo de persona o dispositivo | Es lo que hace posible contar personas distintas. Publicarlo permitiría reconstruir la trayectoria de alguien por el territorio. Los conteos salen agregados; los identificadores, nunca. |
| El `id` serial y el `id_local` | El ordinal permite enumerar el corpus y emparejar por vecindad dos señales de la misma sesión. Lo que sale es `id_publico`, y por eso el cursor va sellado (§4.3.2). |
| `submitted_as` | Carga el UUID del dispositivo como `captura:<uuid>`. La fuga viva de §1.6. |
| **La dirección entera**: `calle_id`, `calle_texto`, `altura`, `direccion_texto`, `texto_libre` | §2.6. La altura ubica en ~15 m y entra por un campo de texto que el piso del punto no mira. Las cinco nacen `privada` en `COLUMNAS_CLASIFICADAS`. |
| **El `canal` por fila** | Sólo sale agregado, en `cobertura.porCanal`. Por fila, `origen='campo'` más punto exacto de rol `capture` más orden cronológico une los puntos de una sesión: el recorrido a pie de un voluntario, con horarios, repetido día a día. En una plataforma que se define como crítica del Estado, ese archivo es una lista de objetivos. |
| **El timestamp fino** | Por lo mismo. El redondeo se decide **una sola vez, en `civic-core`**, y las tres specs lo importan sin re-declararlo: a la **hora** por defecto, al **día** cuando `sensitivity='high'`, al **día** siempre en el volcado. Más las filas barajadas dentro del chunk (§4.4.3). El cursor no se ve afectado: lleva el instante completo cifrado del lado del servidor, que es parte de por qué va sellado. |
| **El punto sin el piso de publicación** | Toda fila de rol `subject` sale a `'500m'` o más grueso (§2.6), sea cual sea la precisión almacenada y sea cual sea la sensibilidad declarada, salvo que `engrosado_rechazado` diga lo contrario. |
| La lista de quiénes adhirieron o confirmaron | Sale el número, no el conjunto. Publicar el conjunto convierte una adhesión en una firma pública. |
| `firma` en el feed y en los tres formatos | Sale sólo en `GET /senales/:idPublico` (§4.3.5). `group by firma` sobre un CSV público es un ranking individual construido por el proyecto. |
| El punto crudo pre-engrosado | No vive de este lado (`_geo-columns.ts` lo dice), y la guarda lo afirma igual. |
| `retenida_en`, `retenida_motivo` y todo lo que rodea a una marca de exposición | Las filas retenidas no salen; y publicar la marca sería decir en público que alguien reportó una exposición. Superficie de represalia. |
| IP, user-agent, headers, timing | Nada del transporte entra. |
| El detalle crudo de un error del volcado | Va al logger con el id del corte. Público sale sólo la `causa`, de un dominio de seis valores. |
| Bitácora, reflexión personal, notas privadas | Regla 3. Hoy no existe esa tabla en v2; la guarda se escribe ahora, **antes** de que exista, que es el único momento en que escribirla es barato. |
| El vínculo faceta → entrada privada que la originó | Regla 12. Ni el campo ni un id que permita inferirlo. |
| Señales `retirada`; señales con `retenida_en` | Predicado incondicional de publicabilidad (§2.7). |

---

## §5 Lo que se rompe — archivo por archivo

| Archivo | Qué cambia |
|---|---|
| `apps/api/src/features/open-data/routes.ts` | Cabeceras `Deprecation`/`Sunset`/`Link` en las cuatro rutas. El resto del archivo lo reescribe B (§4.5.1). |
| `apps/api/src/features/open-data/v1/` | **Nace**: `{routes,service,serializadores,validation}.ts`, `cursor.ts` y `volcado.ts`. El **piso de publicación de §2.6 vive en `serializadores.ts`** y se aplica igual a la API y a los tres formatos. Montada en `app.ts:79-85`. |
| `apps/api/src/vercel/cron-volcado.ts` | **Nace.** Handler del cron con la guardia de `CRON_SECRET`, calcada de `cron-rankings.ts:16-30`. |
| `api/cron/volcado.mjs` | **Nace.** Stub commiteado que reexporta `../../apps/api/dist-bundle/cron-volcado.mjs`, igual que `api/cron/rankings.mjs`. |
| `scripts/build/bundle-api.ts:56-59` | Entrada nueva en `ENTRIES`: `{ desde: [...'vercel','cron-volcado.ts'], hacia: 'cron-volcado' }`. **Sin esto el stub reexporta un archivo que ningún build genera** y el cron tira 500 todos los días a las 09:00 sin que nadie mire (el pozo de D-029). |
| `apps/api/src/middleware/rate-limit.ts` | Limitador propio para `/conteos` y la primera página del feed, más estricto que el `generalRateLimit` de 120/min. Sin él, `?bbox=<aleatorio>` repetido son conteos con predicados que nunca repiten, contra la misma base que sirve el sitio. |
| `packages/db/src/repositories/civic-feed.ts` | **Nuevo**: `listSignalsPage` — keyset simple sobre `senales`, cursor sellado, `limite + 1`. No entra en `civic-map.ts`, que ya está cerca de su tope de 400 LOC. |
| `packages/db/src/repositories/civic-conteos.ts` | **Nuevo**: `countSignals` (con cota), `countSinPunto`, `countByClass`. |
| `packages/db/src/repositories/civic-map.ts` | Queda con `listSignals` para el dibujo, ya reescrito por B contra `senales`. Pierde el conteo. |
| `packages/db/src/schema/volcados.ts` | Archivo nuevo, más su export en el barril `schema/index.ts`. |
| `packages/db/drizzle.config.ts` | Suma `'./src/schema/volcados.ts'` al array `schema`. **El barril no se usa acá** (drizzle-kit corre en CJS y se atraganta con los imports `.js`): sin esta línea `pnpm db:generate` no ve la tabla y genera una migración sin ella, en silencio. |
| `packages/db/src/schema/senales.ts` | Los dos índices de feed de §3.2. |
| `packages/db/migrations/0017_*.sql` | `volcados` con sus cuatro CHECK, más los dos índices de feed. |
| `apps/web/src/pages/ElMapa.tsx` | El `<ProveedorTerritorio>` envuelve el `<main>`; entra la cuarta sección `<RegistroPublico />` **después** de `<SeccionInstrumento />` (hoy línea 32). Después es deliberado: el ancla `#instrumento` es el destino del `Redirect` de `/explorar-datos` (`app-routes.tsx:157`) y hay un test que la verifica. |
| `.../ElMapa/contexto-territorio.tsx`, `.../consulta-territorial.ts` | Archivos nuevos: el proveedor y `aParametros` (puro, testeado). |
| `.../instrumento/Instrumento.tsx:32` | `useVistaMapa()` deja de crearse acá; se consume del contexto. |
| `.../instrumento/Chrome.tsx` | `ContadorEnVista` deja de contar `senales.length` y lee `/conteos`. Los filtros escriben en el contexto. |
| `.../instrumento/useVistaMapa.ts:67` | `useSenalesEnVista` deja de ser la fuente del conteo (sigue siendo la del dibujo). |
| `.../sections/FeedVoces.tsx` | Se declara teaser: gana el remate «las últimas 12 · leer todo abajo ↓». No se infla ni se borra — su valor es el costo cero. |
| `.../sections/RegistroPublico.tsx` + `registro/*` | Sección nueva: cabecera de cobertura, filas, pie de `sinPunto`, botón de página, y la línea de §2.9 en toda fila de clase `deseo`. |
| `.../papel/primitives/ChipEstado.tsx` | **Lo crea B**, que es quien fija el vocabulario de estados; D lo consume y le pide una sola cosa: que pueda dibujar `sinEstado` con su razón en `title`, además de los valores. |
| `.../papel/primitives/Sello.tsx` | `SelloColor` gana valores: hoy son tres y los estados terminales ruidosos —`resuelta`, `no_cumplida`, `desactualizada`— piden más. Se extiende, no se duplica. |
| `apps/web/src/lib/queries/civic-map.ts` | `useSenalesMapa` construye su querystring con `aParametros`. Nacen `useRegistroPublico` (`useInfiniteQuery` con `placeholderData`) y `useConteos`. |
| `apps/web/src/lib/queries/open-data.ts` | `VozAbierta.submittedAs` se borra del tipo. |
| `.../sections/__tests__/FeedVoces.test.tsx:25-26`, `.../sections/__tests__/MapaArgentina.test.tsx:27,28,82`, `.../lienzo/__tests__/Lienzo.test.tsx:25,36` | Se borra la clave `submittedAs` de las fixtures tipadas `VozAbierta[]`. Con `strict`, una propiedad de más en un object literal es error de compilación: el cambio es borrar la clave, no ajustar la aserción. |
| `packages/shared/src/open-data/campos.ts` | **Nuevo**: el descriptor runtime del que se derivan `FilaPublicable` y `/esquema`, con `superficie` por campo (§8.4.1). |
| `packages/shared/src/open-data/textos.ts` | **Nuevo**: el consentimiento (§7.2.4) y la declaración de deliberación (§2.9), una sola fuente para B, C, la web y `PROCEDENCIA.md`. |
| `packages/shared/src/datasets/index.ts` | `OPEN_DATASETS` deja de ser el catálogo: pasa a ser la **descripción** de los formatos; disponibilidad y URLs vienen de `/volcados`. `licenseHint: 'CC0'` (línea 31) pasa a las dos licencias de §2.8. |
| `apps/web/src/pages/DatosAbiertos.tsx` | Reescritura completa a Papel y Tinta. Se van `glass`, `iris-violet` y el `Button` de shadcn. Se va el link a `/explorar-datos` (es un `Redirect`) y la promesa de «changelog + scripts reproducibles»; en su lugar, el link real al `PROCEDENCIA.md` del último corte. |
| `vercel.json` | `functions` gana `api/cron/volcado.mjs` con `maxDuration: 60`; `crons` gana `{ "path": "/api/cron/volcado", "schedule": "0 9 * * *" }`, después del barrido de retención de C. |
| `packages/civic-core/src/poblacion.ts` | Gana `MASCARA_PROVINCIAS`, `RESOLUCION_MASCARA`, `CajaProvincia` y `provinciasQueTocan`. |
| `scripts/build/geo/generar-mascara-provincias.ts` + `package.json` raíz | Script nuevo al lado de `generar-provincias-api.ts`, reusando `capas/` y `centroide.ts`; su comando junto a `geo:provincias`. |
| `docs/adr/` | ADR nuevo: `@vercel/blob` como store del volcado, con las dos alternativas descartadas y sus cuentas. |
| `apps/api/package.json` | `@vercel/blob`. Única dep nueva de esta spec. |

**Lo que NO se toca:** `middleware/csrf.ts` (las rutas nuevas son todas GET) y `civic-core/src/brillo.ts` — la distinción de celdas sin actor vive en `CeldaPublicada`, el tipo de respuesta del endpoint de C, y no como variante de `Brillo`, que es una unión que dos apps importan.

---

## §6 Contra la Constitución

| Regla | Cómo la cumple esta spec |
|---|---|
| **1 · Offline-first, nunca offline-only** | No aplica directo a la lectura web, pero el volcado ES la forma offline del registro: el archivo bajado se lee sin red, y por eso lleva su procedencia adentro en vez de linkear a una página. |
| **2 · La ubicación exacta es privada por defecto** | **El piso de publicación de §2.6**: toda fila de rol `subject` sale a `'500m'` o más grueso, decidido por el serializador y no por la precisión que declaró el cliente — que hoy es `exact` por default (§1.7). La única excepción es `engrosado_rechazado`, una columna auditable. **Y la dirección no sale en ninguna forma**, que es la mitad que el piso del punto no cubría: la altura ubica en ~15 m por texto. El lado mínimo del bbox (§4.3.1) es higiene, no la protección. |
| **3 · Bitácora y reflexión personal nunca se publican** | §4.7 las enumera aunque hoy la tabla no exista, y §8.4.3 escribe la guarda que falla el día que exista y alguien la conecte. |
| **4 · Una señal siempre muestra su estado de calidad** | `estado` es una unión: un valor del catálogo de B con su motivo, o `sinEstado` con su razón textual. Nunca un default inventado, y con rama para los siete valores de la columna — sin la rama de `no_cumplida`, el serializador la tapaba con un default, que es el `?? 'valor'` que esta serie mata. |
| **5 · Participación ≠ representatividad** | `cobertura` va en toda respuesta agregada: provincias sin señal nombradas, fracción con punto, fracción corroborada como unión, desglose por canal y la advertencia en castellano. Y publica **`actoresDistintos` junto al total**. La página de filas no lleva el número pero sí la advertencia y el puntero. Y la métrica norte se **cita** desde `/metrica-norte`, no se recalcula con otra unidad (§4.4.5). |
| **6 · La IA puede sugerir, nunca determina la verdad** | `tema` viaja aparte de `tipo`, se etiqueta en `/esquema` como «detectado automáticamente, no verificado», y **nunca ordena el feed**. Y `procedencia` distingue en cada fila lo que escribió una persona de lo que produjo una máquina: por eso `territory_mandates` —síntesis de un LLM— no entra al registro **ni al mapa** (§2.1). |
| **7 · No hay ranking público individual** | No hay autor en ninguna respuesta ni en ningún volcado. No hay score, ni orden por popularidad, ni perfil. Las adhesiones son un número por señal, nunca por persona. `firma` sale sólo en el recurso individual, nunca en un archivo agrupable. |
| **8 · Se premia utilidad, corroboración, cobertura difícil y resolución; no volumen** | El feed no premia nada porque no ordena por nada, y lo único que el registro destaca estructuralmente es `resuelta` con su `resueltaEn` — la métrica norte, no volumen. Y `resuelta` no la escribe cualquiera: el mecanismo es el de C §2.7, con dos confirmaciones independientes y sin ser terminal. |
| **9 · Consentimiento comprensible y revocable** | Las dos mitades, del lado de quien aporta. **Comprensible:** antes del submit, la superficie de carga dice en castellano llano que el texto entra a un registro público, que se descarga entero en archivo, y que lo que salió en un corte mensual no se puede retirar de ese corte (§7.2.4). Sin esa pantalla, D no publica. **Revocable:** `estado <> 'retirada'` está en el predicado incondicional, así que una señal retirada sale de la API en el acto y de todo corte posterior. La irrevocabilidad hacia atrás está decidida a la vista (§4.4.3), no heredada de un default. |
| **10 · Teléfonos modestos y redes intermitentes** | Página de 40 filas ≈ 20 KB crudos. Sin autocarga con la pestaña oculta, sin polling, sin vacío intermedio al refetchear, y el montaje del mapa no resetea la lectura. El feed no monta maplibre: vive en papel, fuera del instrumento. |
| **11 · Los hechos se corroboran; los deseos se deliberan** | **Cumplida entera de un lado y a la mitad del otro, y el producto lo dice.** `clase` es columna de primera clase y filtro; `corroborable` es `boolean \| null`; `actoresQueConfirmaron` es `null` —no cero— cuando no aplica. Del lado de deliberar no hay mecanismo, y por eso toda superficie que muestra un `deseo` lleva la línea de §2.9 en vez de disimular con un contador de adhesiones. |
| **12 · Compartir una faceta no publica la entrada privada** | §4.7 excluye el vínculo faceta→origen, y la guarda de clasificación de columnas obliga a que cualquier columna futura de ese vínculo se declare privada antes de compilar. |

---

## §7 Lo que esta spec NO hace

Las obligaciones cruzadas van dirigidas **por documento y por sección**. Antes iban por letra recordada, y por eso cinco de ellas —incluida la cesión de licencia, sin la cual D no publica— estaban firmadas a un documento que no las iba a leer.

### 7.1 Le corresponde a `docs/specs/2026-08-11-a-la-tierra.md`

Sembrar las 326.832 calles, los 529 departamentos, los 2.082 municipios y las 4.037 localidades, y arreglar `geographic_locations.province_id` (hoy `serial NOT NULL` sin FK). D las lee para resolver `provincia`, `departamento` y `ciudad` a nombre; no las carga, y **depende** de que la jerarquía esté arreglada.

**Lo que D le obliga a A:**

1. **El vocabulario de niveles se exporta como constante**, no se tipea. D filtra por nivel en un `LEFT JOIN` (§4.3.4) y un literal desincronizado devuelve `null` en todas las filas sin que ninguna guarda de campos lo vea. A publica la constante; D la importa; el test de arranque de §8.2 verifica que todo valor usado en un filtro esté en el CHECK.
2. Si A inserta un valor nuevo en `LocationPrecision` —el escalón «calle sí, altura no», que en Córdoba es 0 de 500 calles con rango— tiene que darle en el mismo commit su etiqueta en castellano en `precision.ts:57-64` y su radio en `publicLocationUncertaintyKm` (`geo.ts:58`), y ubicarlo en `PRECISION_ORDER` explícitamente respecto de `'500m'`, porque el piso de §2.6 compara contra ese orden.
3. La resolución de nombre tiene que ser un join, no una función por fila: el volcado hace 100.000 filas en un pase y un N+1 lo saca del presupuesto de 60 s.
4. **`ubicacionPublicable` es la única función que decide qué queda de una dirección**, y D no la duplica: no publica dirección en absoluto (§2.6). Si algún día la publica, la toma de ahí.

### 7.2 Le corresponde a `docs/specs/2026-08-11-b-la-senal.md`

`senales` como tabla única con `direccionColumns` adentro, `actores`, el vocabulario de tipos y clases, la máquina de estados de la regla 4 con sus siete valores y su `motivo`, la adhesión, `engrosado_rechazado`, el adaptador de `/api/open-data/*`, `ChipEstado`, y el cliente del paquete offline del callejero.

**Lo que D le obliga a B:**

1. **La adhesión necesita índice único** sobre `(senal, actor)`. D publica un conteo de actores distintos; si cuenta filas duplicadas, publica un número falso. El patrón de `castVote` —DELETE + INSERT en dos sentencias sin transacción, sobre `proposal_votes`, que no tiene ni PK ni unique— **no se puede copiar**.
2. **La clave de actor la emite el SERVIDOR**, no la elige el cliente. Un seudónimo que el cliente genera es un identificador que cualquiera fabrica a mil por minuto, y entonces «claves de actor distintas» no acota nada. D lo publica como «sin verificación de identidad» mientras eso no exista, pero la etiqueta honesta no reemplaza al control.
3. **El actor que creó una señal no puede adherirla ni confirmarla.** Constraint, no convención.
4. **La superficie de carga muestra el consentimiento antes del submit y obtiene la cesión de licencia.** Una línea rioplatense, no un párrafo legal: qué se publica, que se descarga entero en archivo, que lo que ya salió en un corte mensual no se puede retirar de ese corte, y que lo que escribas se publica bajo CC BY 4.0. `senales` gana la columna que marca esa cesión; sin la marca, el volcado publica la fila **sin `texto`** (§2.8). **El texto lo exporta D**, en `packages/shared/src/open-data/textos.ts`, y es el mismo que imprime `PROCEDENCIA.md`: si los dos textos pueden divergir, van a divergir. *Esta obligación estaba dirigida a C, que no tiene ingesta; era la más cara del conjunto y se perdía en el desvío.*
5. **La ingesta exige `locationRole` y `sensitivity`, y deriva `province_id` del punto.** Hoy el panel no manda ninguno de los tres (§1.7), así que toda voz web es `subject`/`low` y la más precisa que existe puede quedar sin provincia. Además: el auto-ascenso a `exact` de `SelectorPrecision.tsx:57` muere, y el panel muestra el recibo de engrosado que `capturas.ts` ya devuelve. Mientras esto no exista, el piso de §2.6 es lo único que separa al registro de la regla 2.
6. **El UUID del dispositivo nunca más va en `submitted_as`.** Mientras siga escribiéndose ahí, cualquier consulta futura que lea esa columna reintroduce la fuga. Tabla propia con índice único sobre `id_local`, como el propio `capturas.ts` ya declara que corresponde.
7. **Toda señal trae `origen`** (`web` | `campo` | `campo-v1`). Sin él, `cobertura.porCanal` no se puede publicar y el sesgo más grande del registro —que mide a quien tiene computadora— queda invisible.
8. **El tipo desconocido tiene que ser una unión discriminada, no un fallback.** D publica `tipo: null` + `tipoCrudo`. Si B pliega lo desconocido a un tipo real, el volcado publica una clasificación inventada y ya no hay forma de auditarla.
9. **Las clases tienen que ser cuatro y estables**, porque `corroborable` sale de `clase === 'hecho'` y `filas_por_clase` es el desglose que la procedencia publica.
10. **El retiro es un camino de la persona, no del operador**, y escribe `estado = 'retirada'` vaciando el texto. D se compromete a que una señal retirada desaparezca de la API en el acto y de todo corte posterior, y a que eso esté publicado en `/esquema`.

### 7.3 Le corresponde a `docs/specs/2026-08-11-c-la-corroboracion.md`

Las confirmaciones con su ronda, la evidencia, la resolución con sus cuatro buckets, los dos relojes de vigencia, `rastro_senal`, `celda_luz`, `GET /api/v1/civic/map/cells` **con su política de supresión entera** y `UMBRAL_SUPRESION` como constante única.

*Se descartó que D decidiera la política de supresión del endpoint de celdas, que esta spec reclamaba en su §7.4. C tiene el agregado, la tabla materializada y el argumento del congelamiento horario; tres specs reclamando pedazos de la política del mismo endpoint es la garantía de que nadie la escriba entera, y dos constantes con el mismo valor en dos archivos es cómo empieza toda deriva. El `muda` de D también se retira: los cuatro estados son los de C —`luz`, `silencio`, `sin_actor_conocido`, `suprimida`—, y el que faltaba era el que distingue «no sé quién» de «nadie».*

Lo que sí queda escrito de esa discusión, porque es de D y sigue siendo cierto: **el piso de publicación de la fila (§2.6) es la precondición de cualquier umbral de celda.** Mientras las filas salgan con punto fino, nadie necesita invertir nada: baja el CSV, agrupa por la misma grilla y cuenta. El umbral protegería un agregado mientras el mismo servidor publica las filas que lo forman.

**Lo que D le obliga a C:**

1. **El barrido de retención corre antes del cron del volcado** (§4.4.3). Una señal marcada como expuesta que entra al corte del día queda estampada en un archivo con sha256 que no se puede retirar.
2. **`/metrica-norte` es la única fuente de la métrica norte.** El volcado la cita y `PROCEDENCIA.md` copia sus cuatro buckets con la prohibición de sumarlos. D no la recalcula sobre sus propias filas.
3. **`rastro_senal` no publica el instante exacto de creación** por `GET /senales/:id/rastro`: el primer evento de toda señal es el ingreso, y su `ocurrio_en` es el timestamp que D redondea en cuatro lugares. El instante exacto entra al compromiso, no a la preimagen externa. Sin eso, el redondeo de §4.7 es decorativo y basta con N requests para reconstruir la sesión.
4. **`retenida_en` es la columna que D consulta** en su predicado incondicional. Si cambia de nombre o de semántica, se avisa: es una de las dos mitades de lo que separa al registro público de publicar una exposición.

### 7.4 Lo que D deja escrito pero no construye

- **La deliberación.** No entra en esta serie (D-037). Lo que D hace es no disimularlo: la línea de §2.9 en toda superficie que muestre un `deseo`, en `/esquema` y en `PROCEDENCIA.md`.
- **La moderación.** No existe columna de moderación y esta spec no la agrega. Lo que sí hace es no publicar ningún eje de moderación (§4.7), para que agregarla después no obligue a sacar campos de una API pública.
- **El feed personalizado.** No hay ninguno. Seguir un lugar es guardar un `ambito`, y eso es una preferencia de cliente que no necesita servidor.

---

## §8 Verificación

### 8.1 La sincronía

- **`aParametros` es determinística y total.** Test de tabla sobre `ambito` × `tipos` × `clases` × `estados` × `rango`: `'todos'` omite el parámetro y la lista completa lo incluye — son dos consultas distintas y la URL tiene que decirlo.
- **«El mapa y el feed piden lo mismo».** 100 `ConsultaTerritorial` al azar con seed fijo: las URLs de los tres hooks son idénticas salvo por `cursor` y `limite`.
- **«Mover el mapa recorta el feed».** `onMove` con un recuadro que excluye una señal sembrada: la fila desapareció y el `total` de `/conteos` bajó.
- **«El montaje del mapa no resetea el feed».** Con el feed en `pais`, maplibre emite su primer `recuadro`: el ámbito **no** cambia y no hay refetch.
- **«Refetchear no vacía el feed».** Durante el `isFetching` las filas anteriores siguen en el árbol y la cabecera dice «actualizando».
- **«El hover no mueve el mapa».** `enfocar(id)` no llama a `easeTo` ni cambia el ámbito.
- **«El `easeTo` de abrir una fila no remonta el feed».** El cursor de la página cargada sigue siendo el mismo.

### 8.2 Las señales sin punto y la geografía

- **«Una señal provincial nunca se cuenta como si estuviera adentro».** `precision='province'`, `lat=null`, `provinceId` de Buenos Aires; recuadro sobre el conurbano: **no** está en `senales`, **sí** en `sinPunto.porProvincia`, y `total` **no** la incluye.
- **«El total y el sinPunto nunca se suman».** Son dos `Magnitud` con fórmulas distintas; test de grep sobre el módulo del feed que falla si aparece `total + sinPunto` en cualquier forma.
- **«`provinciasQueTocan` sobre-estima, nunca sub-estima».** Para cada provincia, centroide + recuadro de 0,01°: la provincia está en el resultado.
- **«Las 24 claves resuelven a 24 ids».** Test de arranque contra la base sembrada: cada clave de `MASCARA_PROVINCIAS` resuelve 1:1 contra `geographic_locations` pasando por `normalizeProvinceName`, y falla **nombrando la clave huérfana**.
- **«Ningún filtro de nivel usa un valor que el CHECK no admite».** Test de arranque: todo valor de nivel que aparece en una consulta de D está en el CHECK de `geographic_locations`. Es la guarda que faltaba: un literal desincronizado devuelve `null` en todas las filas, en silencio, y ninguna guarda de campos lo ve.
- **«Una fila con `city_id` publica ciudad o departamento, nunca los dos en null».** Tres filas sembradas —`locality`, `settlement`, `department`—: la primera sale con su nombre, la segunda con el de su `parent_id` y **nunca** con el del asentamiento, la tercera con `ciudad: null` y `departamento` poblado.

### 8.3 La paginación

- **«El cursor no repite ni saltea con inserciones concurrentes».** 100 señales sembradas, página 1 (40), se **insertan 5** con `creada_en` posterior, página 2 con el cursor: las 5 nuevas no aparecen (el corte las excluye) y las 80 filas son 80 ids distintos. El mismo test con `offset` **debe fallar** — se escribe primero contra offset para demostrar el bug y después contra el cursor.
- **«El empate al milisegundo pagina estable».** Dos señales con el mismo `creada_en` exacto y `limite=1`: la paginación devuelve las dos, en orden estable, sin repetir ni saltear.
- **«El cursor no se lee ni se fabrica».** Decodificar el cursor con base64url no devuelve ni el instante ni el serial; un byte cambiado es 400; un cursor emitido con otra clave es 400. Es la guarda de que el serial no cruza el borde.
- **«El cursor con filtros distintos es 400».** Página 1 con `clase=hecho`, página 2 con el mismo cursor y `clase=deseo`: 400.
- **«El corte no se puede cambiar entre páginas».** No hay parámetro que lo permita: sólo existe adentro del cursor.
- **«No hay autocarga con la pestaña oculta».** `visibilityState` en `'hidden'`: el observer no dispara fetch.
- **«De la cuarta página en adelante hay un click».**
- **«No hay badge de nuevos».** Guarda de texto sobre el árbol renderizado: falla si aparece «nuevas» o «nuevos» seguida de un número.

### 8.4 Lo que nunca sale — cinco guardas, porque una sola no alcanza

**8.4.1 · Guarda de tipo (no compila).** En `packages/shared/src/open-data/campos.ts` el descriptor es **runtime y es la fuente**; el tipo se deriva de él, no al revés:

```ts
export const filaPublicableSchema = z.object({ /* con .describe() y superficie por campo */ });
export type FilaPublicable = z.infer<typeof filaPublicableSchema>;
export const CAMPOS_PUBLICABLES = Object.keys(filaPublicableSchema.shape);
```

Una `interface` de TypeScript se borra en compilación: `/esquema` no puede «generarse desde `FilaPublicable`» si `FilaPublicable` no existe en runtime, y lo que iba a pasar es que alguien escribiera el diccionario a mano y se desincronizara en el tercer campo nuevo. El `.describe()` de `actoresQueConfirmaron` lleva **las dos definiciones nombradas** —la de fila y la de celda de C §2.8— para que nadie las vuelva a mezclar.

**8.4.2 · Guarda de runtime sobre la respuesta cruda.** `apps/api/tests/open-data-superficie.test.ts`: siembra una señal con **todos** los campos sensibles poblados con centinelas irrepetibles (`user_id` de un usuario con email `centinela-a1b2@ejemplo.test`, `submitted_as = 'captura:0f3c-CENTINELA-9d21'`, `altura = 1450`, `texto_libre = 'CENTINELA-pasillo-14'`, `firma = 'CENTINELA-firma'`), golpea cada endpoint público —incluido `/senales/:idPublico`— y cada uno de los tres serializadores, y afirma que **la cadena centinela no aparece en el body serializado**, buscando en el texto crudo y no en el objeto parseado. `firma` es el único campo que aparece en `/senales/:idPublico` y en ninguna otra superficie.

**8.4.3 · Guarda de clasificación de columnas.** Introspecciona las columnas de `senales` y `volcados` desde el schema de Drizzle, las compara contra `COLUMNAS_CLASIFICADAS: Record<string, 'publicable' | 'privada'>` con su razón al lado, y **falla si aparece una columna sin clasificar**. Es la única que caza el campo nuevo *el día que se agrega a la tabla*. Las cinco de `direccionColumns` están clasificadas `privada` y hay una aserción con nombre propio para `altura`. La lista de exclusiones de `PROCEDENCIA.md` se genera desde acá, no se escribe a mano.

**8.4.4 · Guarda de FILAS.** Las tres de arriba son de columnas. Ésta siembra **una señal `retirada`** y **una señal con `retenida_en` poblado** y afirma que **su `idPublico` no aparece en ningún endpoint ni en ninguno de los tres formatos**, y que `/senales/:idPublico` devuelve **404** (no 403) para las dos. Es la guarda que ninguna guarda de campos podía cazar: acá el problema es una fila entera que no debía existir.

**8.4.5 · Guarda de números pelados en el sobre.** Recorre el sobre serializado de `/senales` y de `/conteos` y falla si alguno de los campos citables de §4.3.3 llega como `number` sin procedencia. La guarda que ya existe recorre el resultado de la Simulación y no cubre HTTP: ésta es la que faltaba.

Las cinco corren en CI. La 8.4.2 y la 8.4.4 corren parametrizadas por los tres formatos: un CSV que filtra un campo es la misma fuga que un JSON que lo filtra.

### 8.5 El volcado

- **«El piso protege aunque la fila diga `exact`».** Señal con `precision='exact'`, `locationRole='subject'`, `sensitivity='low'`, `engrosado_rechazado=false` y punto conocido: las coordenadas publicadas —API, CSV, JSONL y GeoJSON— **no son las sembradas**, la `precision` publicada es `'500m'` y `incertidumbreKm` es la de `'500m'`. **Escrito contra el código de hoy, este test tiene que fallar.**
- **«El rechazo explícito se honra, y sólo él».** La misma fila con `engrosado_rechazado=true` sale fina. Con `sensitivity='high'` y `engrosado_rechazado=false`, sale engrosada: la sensibilidad no abre ni cierra el piso.
- **«El punto del volcado es el engrosado».** Con `precision='500m'`: las coordenadas de los tres formatos son exactamente `obfuscatePoint(punto, '500m')`, iguales entre sí y distintas de la sembrada.
- **«Engrosar es idempotente».** `obfuscatePoint(obfuscatePoint(p, x), x) === obfuscatePoint(p, x)` para las seis precisiones.
- **«Una señal de rol `capture` no se engrosa».** El piso es por rol, no por precisión: la esquina del pozo sale fina.
- **«La altura no sale, ni siquiera sin punto».** Fila con `lat=null`, `altura` y `texto_libre` poblados, rol `service_area`: ninguno de los dos aparece en ninguna superficie, la fila cae en `sinPunto`, y el renglón dice «no traen punto», no «sólo declararon su provincia».
- **«Un tipo desconocido no publica `corroborable=false`».** `tipo: null`, `tipoCrudo` con lo que llegó, `clase: null`, `corroborable: null` y celda **vacía** en el CSV, no `no`.
- **«`resuelta` sin confirmación no existe».** Sobre las filas del volcado: `estado === 'resuelta'` implica `actoresQueConfirmaron >= 1`. Es un piso que el diseño de C satisface con holgura, y la guarda existe para el día que alguien lo baje.
- **«`no_cumplida` tiene rama».** Una señal en `no_cumplida` se serializa sin default inventado, aparece en los tres formatos y `/esquema` la lista.
- **«Los tres formatos tienen las mismas filas».** El conjunto de `idPublico` de CSV y JSONL es idéntico; el de GeoJSON es exactamente el subconjunto con `lat` no nula, y la diferencia coincide con `sin-punto.csv`.
- **«El CSV sobrevive al texto adversario, en TODO campo string».** Parametrizado sobre los campos string de `CAMPOS_PUBLICABLES`, no sólo `texto`: comas, comillas dobles, salto de línea, `=cmd()` al principio, U+202E. El round-trip por un parser estándar devuelve el original y la celda que arranca con `=` sale escapada. `tipoCrudo` es el campo más probable de traer basura y el que un test que nombra sólo `texto` deja pasar.
- **«Los timestamps publicados son gruesos y la sesión no se reconstruye».** Dos señales de campo cargadas con dos minutos de diferencia publican el **mismo** `creadaEn` en el volcado (día) y **no quedan adyacentes** en el archivo. Y una fila con `sensitivity='high'` sale al día también en la API.
- **«Una fila corrupta no tumba el corte».** El corte sale `listo`, la fila se omite, `filasOmitidas` es 1 y la razón aparece en la procedencia.
- **«El cron sin `CRON_SECRET` es 401»** y **«una segunda invocación el mismo día no crea una segunda fila»**.
- **«Un volcado a medio subir nunca se lista».** Fallo simulado en la subida: la fila queda `fallido` con su `causa`, `/volcados` no la devuelve, `?incluirFallidos=true` sí, y **el body no contiene el texto crudo del error**.
- **«Todo archivo servible del corte tiene fila, bytes y sha256».** Se listan los archivos del blob para un corte y se afirma que el conjunto es **exactamente** el de las filas de `volcados` — los seis, incluidos `sin-punto.csv` y los dos de procedencia.
- **«El sha256 corresponde al archivo que se baja».** Se baja la URL publicada y se compara. Es lo que verifica la decisión de no usar `Content-Encoding`.
- **«Los purgados no se ofrecen».** Después del barrido, ninguna fila `purgado` aparece en `/volcados` ni trae `url`.
- **«La procedencia cita, no recalcula».** Los cuatro buckets de `PROCEDENCIA.md` son byte por byte los de `/metrica-norte` al mismo corte, y no hay ninguna suma de los cuatro en el archivo.
- **«El presupuesto de 60 s».** Test de carga con 200.000 filas en una rama efímera de Neon: termina en menos de 40 s y el pico de heap no pasa los 400 MB. Es el que avisa cuándo hay que partir por mes, en vez de descubrirlo con un cron muerto.

### 8.6 Las consultas concretas que hay que poder correr

```sql
-- ¿Cuántas señales del corte no tienen punto? `nullif` porque con la tabla
-- vacía —el estado de hoy— un count(*) en el divisor es división por cero, y
-- «no sé» se devuelve como null, nunca como cero.
select count(*) filter (where lat is null) * 1.0 / nullif(count(*), 0) as fraccion_sin_punto
from senales where estado <> 'retirada' and retenida_en is null;

-- ¿Hay alguna provincia con señales que no aparezca en la cobertura publicada?
select distinct province_id from senales
where estado <> 'retirada' and retenida_en is null and province_id is not null;

-- ¿Quedó algún submitted_as con forma de uuid de dispositivo? (la fuga de §1.6)
select count(*) from dreams where submitted_as like 'captura:%';

-- ¿Cuántas filas de rol subject se publicarían finas sin el piso? (el de §1.7)
select count(*) from senales
where location_role='subject' and not engrosado_rechazado
  and precision in ('exact','100m');

-- ¿Cuántas filas llevan altura, o sea cuánto tapa la exclusión de la dirección?
select count(*) from senales where altura is not null;

-- ¿El keyset usa el índice? (Index Scan, no Seq Scan + Sort) — las dos
-- variantes, porque el caso `recuadro` es el DEFAULT y no lo cubre el primero.
explain analyze select id, creada_en from senales
where estado <> 'retirada' and retenida_en is null
  and (creada_en, id) < ('2026-08-11T14:32:11.004Z', 412)
order by creada_en desc, id desc limit 41;

explain analyze select id, creada_en from senales
where estado <> 'retirada' and retenida_en is null
  and lat between -34.8 and -34.4 and lng between -58.7 and -58.2
  and (creada_en, id) < ('2026-08-11T14:32:11.004Z', 412)
order by creada_en desc, id desc limit 41;
```

La tercera hay que correrla **antes** de considerar cerrada esta spec y **después** de que B toque la ingesta: mientras devuelva más de cero, la fuga sigue escrita en la base aunque ya no se publique. La cuarta y la quinta miden el tamaño del problema que §2.6 tapa del lado de la salida y que B tiene que cerrar del lado de la entrada.

### 8.7 Listo cuando

1. `pnpm verify` verde, con las cinco guardas de §8.4 en CI.
2. `submittedAs` no aparece en ninguna respuesta pública ni en ningún volcado, verificado por la guarda de centinelas.
3. Una señal `subject` sembrada en `exact` se publica a `'500m'` en los cuatro caminos, y el test escrito contra el código de hoy falla antes del arreglo. La altura y el texto libre no aparecen en ninguno de los cuatro.
4. Mover el mapa recorta el feed, y el número de la cabecera del mapa y el del feed son el mismo número, porque los dos salen de `/conteos` con los mismos parámetros.
5. Una señal sin coordenada, dentro de una provincia que el recuadro toca, aparece nombrada en el pie del feed y **no** sumada en ningún total.
6. Ninguna fila `retirada` ni retenida aparece en ningún endpoint ni en ningún formato, y `/senales/:idPublico` devuelve 404 para todas.
7. `ciudad` sale poblada en una fila con `city_id`, y ninguna fila publica el nombre de un asentamiento.
8. Hay un volcado del día con sus **seis** archivos, su `PROCEDENCIA.md` y su sha256 verificable, listado en `/datos-abiertos` con su fecha de corte real; y el cron sin `CRON_SECRET` devuelve 401.
9. El cursor sobrevive al test de inserción concurrente, el mismo test contra offset falla, y decodificarlo no devuelve ni el serial ni el milisegundo.
10. `/esquema` sale del mismo descriptor runtime que `FilaPublicable`, no de un diccionario escrito a mano.
11. La superficie de carga muestra el consentimiento y la cesión **antes** del submit, con el texto que exporta D. Sin esto, D no publica.
12. Toda superficie que muestra un `deseo` dice que todavía no se puede deliberar (§2.9).
13. `/datos-abiertos` no tiene una sola clase `glass` ni un solo `iris-violet`, y no linkea a `/explorar-datos`.

---

## §9 Riesgos

| Riesgo | Mitigación |
|---|---|
| Izar `useVistaMapa` rompe el instrumento, la pieza más cara de la página | El contexto se agrega **antes** de tocar `Instrumento.tsx`, con el hook leyendo del contexto y el proveedor devolviendo exactamente lo que hoy devuelve el hook local. El instrumento se toca en un commit propio y sus tests existentes pasan sin cambios. |
| El piso de publicación engrosa de más y el mapa pierde detalle real | Sólo aplica a rol `subject`; `capture` y `meeting_point` —lo que produce la captura de campo— siguen finos, y `engrosado_rechazado` deja salir fina la esquina propia de quien lo eligió. El costo de errar hacia el otro lado es publicar domicilios: la asimetría del daño decide la dirección del default. |
| Excluir la dirección entera deja al registro sin el trabajo de A | A sigue haciendo falta para resolver nombres, para el paquete offline y para la coordinación autenticada, que es donde A argumenta que la dirección sirve. Lo que no entra es su publicación masiva, y entra el día que haya una superficie con lector identificado. |
| Con las tablas en cero, todo el dimensionado es proyección | Declarado como proyección en §4.4.2, `fraccionConPunto` publica la fracción real en cada respuesta, y §8.5 tiene el test de carga a 200.000 filas. |
| El volcado corre contra la misma base que sirve el sitio | Es una lectura, paginada por keyset, fuera del horario de uso, con el perfil de una consulta del mapa repetida diez veces, y detrás de `CRON_SECRET`. `D-014` sigue abierta para los tests de integración: los de esta spec siembran con prefijo de centinela y barren en `afterAll`. |
| `/conteos` es la superficie más barata de abusar | Limitador propio más estricto que el general (§5), `total` acotado por cota en vez de `count(*)` sin techo, caché de 45 s por clave, y el agregado nacional precomputado por el cron (§3.3). |
| `@vercel/blob` es una dep nueva | ADR con las dos alternativas y sus cuentas (§4.4.3). Es la dep 39 de un tope efectivo de 45 (`scripts/build/deps.ts:32`), de la API y no del cliente: no entra al bundle. |
| El feed y el mapa divergen igual, por dos caminos de conteo | Hay un solo camino: `/conteos`. El sobre del feed **no lleva `total`** justamente para que no exista un segundo. El test de §8.1 afirma que las URLs son la misma, y `ContadorEnVista` deja de tener acceso al array para contar. |
| Publicar la fracción de cobertura invita a que alguien titule mal igual | Es la razón de CC BY sobre CC0 (§2.8), de `actoresDistintos` publicado junto al total, y de la advertencia en primera línea de `PROCEDENCIA.md`. No se puede impedir el mal uso; se puede hacer que sea trazable y que la corrección esté a un click. |
| **D depende de las otras tres y sale última** | Es el orden correcto: `senales`, `actores`, el estado y las confirmaciones cambian la tabla objetivo de todo lo que D escribe. Si algo declarado no existe el día del despliegue —típicamente la cesión de licencia—, el registro sale con **`esquema: 0`** declarado pre-release, sin `X-Registro-Esquema`, con la compatibilidad explícitamente no vigente y sin la columna `texto`. Un esquema 0 que puede romper y lo dice es honesto; un valor de enum «pendiente» que hay que retirar después forzaría `/api/v2` a semanas del lanzamiento. |
