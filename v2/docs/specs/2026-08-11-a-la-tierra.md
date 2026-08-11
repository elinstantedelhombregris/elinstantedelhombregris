# A · La tierra

**Fecha:** 2026-08-11
**Serie:** cuatro specs · A la tierra · B la señal · C la corroboración · D el registro público
**Documento vinculante:** `apps/mobile/docs/PRODUCT_CONSTITUTION.md`
**Migraciones:** `0013` (reparación + catálogo) y `0014` (pg_trgm + GIN)
**Deudas nuevas:** D-034 y D-035
**Cierra a medias:** [D-004](../../../docs/DEUDAS.md) y [D-005](../../../docs/DEUDAS.md) — ver §7.4
**Hace medible:** D-011

> **Qué resuelve.** Que una señal pueda decir *dónde* con las palabras del país y no con un punto solo: el callejero completo del Estado espejado en nuestra base — 24 provincias, 529 departamentos, 2.082 municipios, 4.037 localidades censales, 14.673 asentamientos y 326.832 calles — más una dirección normalizada en cada señal, verificada contra ese catálogo, que declara *hasta dónde* pudo verificarse.
>
> **Qué NO resuelve.** No define qué tipo de señal es ni dónde vive (spec B), no la corrobora (spec C), no la publica (spec D). No dibuja departamentos ni municipios: carga sus **filas**, no su **geometría**. Y no convierte una dirección en un punto: acá una dirección y una coordenada son dos hechos independientes, y ninguno se deriva del otro.
>
> **Dónde viven las columnas de dirección.** En `senales`, la tabla única de `docs/specs/2026-08-11-b-la-senal.md` §2.7 — no en `dreams`, `pulse_signals` ni `proposals`, que mueren sin escrituras y están en cero. **A define las columnas y sus CHECK; B los aplica en la misma migración que crea la tabla.** Es la única dependencia circular real entre las dos specs, partida por donde no duele.

---

## §1 El problema — qué está roto hoy

### 1.1 La jerarquía tiene un solo escalón, y el escalón que la sostiene es un bug

`geographic_locations` tiene **24 filas, todas `level='province'`**: el comentario del schema promete dos niveles y hay uno. Peor: la columna con la que se cuelga la jerarquía está declarada mal (`packages/db/src/schema/geographic.ts:31`):

```ts
/** Province this location belongs to. NULL for province-level rows. */
provinceId: serial('province_id'),
```

`serial` en Postgres no es un tipo: es azúcar para `integer NOT NULL DEFAULT nextval(seq)`. La migración lo confirma — `0002_charming_scrambler.sql:22` dice literal `"province_id" serial NOT NULL`. O sea: **es `NOT NULL`** y el comentario promete lo contrario; **tiene secuencia propia**, así que cada fila nueva recibe un `province_id` autoincremental que no señala nada; y **no tiene foreign key**, así que nada impide que apunte al vacío. Las 24 provincias que sembró `seed-provinces.ts` —que nunca setea `provinceId`: el `values({...})` de las líneas 69-75 pasa `level`, `name`, `isoCode`, `latitude`, `longitude` y nada más— tienen todas un `province_id` autoasignado sin sentido, del 1 al 24 en orden de inserción.

La columna sobre la que hay que colgar 21.321 filas nuevas hoy está rota.

### 1.2 El índice único no sobrevive a la escala

`geographic_locations_level_name_unique` es `UNIQUE (level, name)` (`geographic.ts:40`). Con 24 provincias no molesta. Con 4.037 localidades censales, el país tiene decenas de «San Martín», «Belgrano», «Villa Nueva» y «25 de Mayo» en provincias distintas: la segunda revienta. La unicidad de una unidad territorial no es su nombre: es su identificador en el registro del Estado.

### 1.3 `city_id` existe, se lee y nadie la escribe

`cityColumn` de `_geo-columns.ts:49-53` la aporta a las tres tablas de señal. `CivicMapRepository` la selecciona y la devuelve en cada `SenalMapa` (`civic-map.ts:143, 190`). El cliente web ya la tipó (`queries/civic-map.ts:36`). **No hay un solo writer en toda la API.** Es una columna muerta que el mapa ya lee — y, por ser leída, es ubicación *publicada* que ninguna función de privacidad gobierna. §2.6 la mete bajo la misma regla que la calle. No está muerta por descuido: no hay ninguna fila de localidad a la que pudiera apuntar. La hereda `senales`, con writer desde el primer día (§4.4).

### 1.4 La resolución al escribir llega hasta provincia, y la geometría con la que llega es mala

`provincias.ts:46` resuelve `provinciaIdDePunto` con point-in-polygon contra `provincias.generated.ts`. Es correcto y cerró D-001 a la mitad — `capturas.ts:94` lo llama, `POST /api/open-data/dreams` no. Pero por debajo de provincia no hay nada, y a nivel provincia la geometría promedia **29 vértices** (684 / 24 provincias, 18.310 bytes). D-011 lo tiene documentado con dos casos confirmados: Neuquén capital cae en Río Negro, y **CABA es un triángulo de tres puntos**. Hoy no hay forma de saber cuántas filas están mal atribuidas, porque la fila no guarda de dónde salió su provincia.

### 1.5 Una dirección no se puede guardar, y la que se guardara hoy saldría desnuda

No hay `calle_id`, no hay altura, no hay texto de dirección: una necesidad cargada desde una vereda concreta se guarda como «Santa Fe» o como un punto sin nombre.

Y hay un segundo hecho, verificado, que condiciona toda esta spec: **la compuerta que protegería esa dirección hoy está abierta en el camino principal.** `publishedPrecision` (`location-policy.ts:88-91`) solo engrosa cuando `role==='subject' && sensitivity==='high' && audience!=='private'`. `PanelSoltarVoz.tsx:38-44` manda `body`, `category`, `provinceId` y —si hay punto— `punto` + `precisionPedida`, y **nunca** `locationRole` ni `sensitivity`. `POST /api/open-data/dreams` defaultea `sensitivity: 'low'`. O sea: toda voz web es `subject`/`low`, la protección nunca dispara, y el selector de precisión pone `exact` en el mismo instante en que la persona toca el GPS.

B reemplaza esa ingesta por una que pregunta de verdad. Pero la defensa no puede colgar de que la ingesta nueva se acuerde: §2.6 y §3.4 existen para que la regla viva en la base, donde no se olvida.

### 1.6 Y georef está del otro lado de la red

La API del Ministerio del Interior tiene los datos. Verificado: `GET /calles?provincia=02` devuelve `total: 3127` para CABA; `campos=completo` trae `id`, `nombre`, `categoria`, `nomenclatura`, `altura.{inicio,fin}.{izquierda,derecha}`, `provincia`, `departamento`, `localidad_censal`, `fuente`. Depender de ella en captura es inaceptable por dos razones que se suman: esta plataforma critica al Estado y no puede apagarse cuando el Estado apague un servidor, y la app de campo tiene que autocompletar sin señal. **Decisión 1 del proyecto, ya tomada: georef es fuente al sembrar, nunca camino de captura.**

---

## §2 La decisión

### 2.1 El callejero se espeja entero, y se parte en dos tablas

`geographic_locations` **crece hacia abajo**: se le agregan los cuatro niveles que faltan y queda con 21.345 filas. No se toca su `id`, no se borran las 24 provincias, no se rompe una sola foreign key. Las calles van a una tabla nueva, `geo_calles`. No es una preferencia estética; son tres razones que se suman:
1. **Volumen.** 326.832 calles contra 21.345 unidades administrativas: juntas, toda consulta de provincias recorre una tabla quince veces más grande que el resto del catálogo.
2. **Naturaleza.** Una calle no es una unidad administrativa: no tiene punto ni población, no es ámbito de nada ni sujeto de ningún agregado. Es un nombre con un rango de numeración colgado de una localidad.
3. **Índices.** Necesitan un índice trigram que ninguna otra cosa del catálogo necesita, y que en una tabla compartida se pagaría sobre las 21.345 filas que no lo usan.

Y una razón que las cierra: **nueve columnas de seis tablas apuntan hoy a `geographic_locations.id`** — `province_id` y `city_id` de `dreams`, `pulse_signals` y `proposals`, más `territory_mandates.province_id` (`mandato.ts:24`), `mandate_suggestions.province_id` (`mandato.ts:48`) y `gamification.scope_id` (`gamification.ts:205`); después de B serán cinco. Partir la jerarquía en cinco tablas obligaría a decidir a cuál apunta cada una y a reescribirlas. Crecer hacia abajo no toca ninguna, ni antes ni después.

### 2.2 El municipio no es un escalón del árbol

Esto se equivoca fácil y es caro equivocarlo. En Argentina el municipio **no está siempre entre el departamento y la localidad**: en la provincia de Buenos Aires el partido *es* a la vez departamento y municipio; en Córdoba los municipios y las comunas cruzan los límites departamentales; y hay localidades que no están dentro de ningún municipio. Entonces el catálogo tiene **un árbol de dos ramas y una pertenencia cruzada**:

```
provincia ─┬→ departamento → localidad → asentamiento     (parent_id)
           └→ municipio ┈┈┈┈┈→ localidad.municipio_id      (pertenencia, nullable)
```

El municipio cuelga de la **provincia** y no del departamento, justamente porque puede cruzarlos. Y `municipio_id IS NULL` en una localidad no significa «no sabemos»: significa **«el Estado no la lista dentro de ningún municipio»**, que es un hecho sobre el país, no un dato faltante. Está escrito en el comentario de la columna porque un NULL sin explicación es la clase de silencio que este repo no acepta.

### 2.3 Los ids del Estado son clave única, no clave primaria

`geographic_locations` y `geo_calles` conservan un `serial id` como PK y ganan `georef_id text NOT NULL UNIQUE`. Tres razones, en orden de peso:
1. **Compatibilidad.** Las columnas que apuntan a la jerarquía son `integer`. Cambiar la PK a texto las reescribe todas, con sus índices, para ganar nada.
2. **Soberanía del identificador.** El id de georef es del Estado. Una recodificación —departamentos que se renumeran, localidades que se fusionan— es un evento del Estado que no puede cascadear dentro de nuestros datos. Como clave única nos da lo que necesitamos (re-sembrar sin duplicar, auditar contra la fuente) sin darnos lo que no queremos (que nuestra identidad interna dependa de la suya).
3. **Bytes.** Un `integer` son 4 bytes; el id de georef son 13 caracteres, 14 bytes con cabecera varlena. Multiplicado por cada FK y cada entrada de índice sobre `senales`, que es la tabla que crece sin techo.

El id de georef tiene 13 dígitos y su prefijo es jerárquico. Verificado contra la API: `"0204901005420"` → los primeros 5 dígitos, `"02049"`, son exactamente `departamento.id`; `"1400707000220"` → `"14007"` es `departamento.id`. La descomposición es `provincia(2) + departamento(3) + localidad(2) + calle(6)`. **Pero el componente de localidad no reconstruye `localidad_censal.id`.** Para la calle de CABA el componente es `01` y la localidad censal es `02000010`; para la de Córdoba es `07` y la localidad censal es `14007070`. Se parecen y no son lo mismo. Por eso: **la FK a la localidad se toma del campo `localidad_censal.id` del payload, nunca de cortar el id de la calle.** El prefijo de departamento sí se usa —está verificado en dos provincias— pero como comprobación cruzada, no como fuente.

### 2.4 Las calles no tienen coordenada, y una dirección no produce un punto

Esta es la decisión que más gente va a querer discutir, así que va con todo su argumento. `/calles` no devuelve geometría — verificado: `campos=completo` trae nombre, categoría, alturas y jerarquía, y ningún vértice. La API tiene otro recurso, `/direcciones`, que interpola un punto sobre la traza, pero llamarlo en captura viola la decisión 1 y reproducirlo offline exige la traza de las 326.832 calles, que georef no publica.

Entonces se decide lo honesto: **la dirección y el punto son dos hechos independientes, y ninguno se deriva del otro.**

- El punto viene del mapa o del GPS. Siempre. Nunca de la dirección.
- La dirección viene del catálogo (la calle, confirmada) más un número que la persona escribe (la altura, que puede o no confirmarse).
- Una señal puede tener dirección sin punto, punto sin dirección, las dos o ninguna.
- **Escribir «San Martín 1234» nunca sube la precisión del punto.** Si el único dato de ubicación es la dirección, `lat`/`lng` quedan en NULL y `precision` no describe nada, porque no hay punto que describir.

Lo que compra: cero dependencia de red en captura, cero geometría que mantener, ninguna coordenada inventada. Lo que cuesta: no hay geocodificación. Se acepta, porque la alternativa es que el mapa dibuje puntos que nadie clavó. **Qué lo cambiaría, y cuánto pesa.** Si más adelante entra la traza —de OSM o del IGN, no de georef— va en una tabla lateral `geo_calles_traza` (`calle_id` PK, la polilínea, y un bounding box indexable), estimada en §3.6 en ~90 MB. Y el punto interpolado que salga de ahí **no sería `exact`**: sería un valor nuevo de `LocationPrecision`, porque una interpolación sobre un rango de numeración no es una medición. Esa decisión le corresponde a quien traiga la traza.

### 2.5 La altura es el caso donde un booleano miente

El dato del Estado es desparejo y la muestra ya lo dijo: CABA 466/500 calles con rango, Santa Fe 450, Buenos Aires 327, Mendoza 290, Salta 43, **Córdoba 0**. Verificado además que georef codifica «no sé» como **`0`** — el ejemplo textual de Córdoba trae `inicio: {derecha: 0, izquierda: 0}, fin: {derecha: 0, izquierda: 0}`. Un `0` que significa «no sé» es exactamente el pecado del que sale `brillo.ts`.

Y hay algo peor, verificado, que un diseño ingenuo no ve venir: **el rango puede estar a medias.** `AV JUAN BAUTISTA ALBERDI`, CABA, id `0204901001480`:

```json
"altura": { "inicio": {"derecha": 0, "izquierda": 0}, "fin": {"derecha": 3199, "izquierda": 3200} }
```

Se conoce dónde termina y no dónde empieza. Con esa calle, la altura 4000 es **demostrablemente** de más y la altura 100 es **indecidible**. Un booleano `tiene_rango` las trata igual y miente en las dos direcciones. Entonces el rango de una calle es una unión discriminada de cuatro casos, y el `0` se traduce a `NULL` en la frontera del seed, con un CHECK que le prohíbe la entrada para siempre.

Y el estado de la dirección de una señal es una unión discriminada de **seis** casos, con la forma de sus columnas verificada por un CHECK. Los seis, y por qué ninguno se puede fusionar con otro:

| estado | qué dice | por qué existe solo |
|---|---|---|
| `sin_direccion` | no hay dirección | el caso normal hoy |
| `calle` | la calle está confirmada, no se dio altura | una esquina, una plaza, «sobre Mitre» |
| `altura_en_rango` | la altura cae dentro de la numeración que publica el callejero | el único caso en que podemos afirmar algo, y lo que afirmamos es sobre el **catálogo** |
| `altura_sin_rango` | hay altura y el Estado no publica rango | **medio país**. No es un error de la persona |
| `altura_fuera_de_rango` | hay altura y cae fuera del rango conocido | puede ser un tipeo o un catálogo viejo. **La altura se guarda igual** |
| `texto_libre` | no matcheó ninguna calle del catálogo | un barrio nuevo, un asentamiento, una calle sin nomenclar |

**El estado se llama `altura_en_rango` y no `altura_confirmada` a propósito.** Conseguir ese valor cuesta cero: cualquiera elige una calle con rango publicado y escribe un número adentro. No prueba presencia, ni existencia del domicilio, ni nada sobre la señal. Llamarlo «confirmada» lo hacía contable como corroboración por cualquiera que leyera el volcado, que es justo lo que la regla 11 y `brillo.ts` existen para impedir: es una afirmación sobre el catálogo, nunca sobre la señal (§6, regla 11).

`texto_libre` no es una concesión: es constitucional. Las 326.832 calles del INDEC no son todas las calles del país. Negarse a guardar lo que no está en el catálogo del Estado sería que esta plataforma le diga a un barrio que no existe. **Con un límite que §2.6 le pone y que hay que leer sin confundirlo con lo anterior:** el texto libre sobrevive para el lugar de una *cosa* — un pozo, una olla, un depósito en un barrio sin nomenclar. Para el lugar de una *persona* no sobrevive ninguna dirección, y menos una que la escribe alguien sin que ningún catálogo la acote («al fondo del pasillo, casilla 14» es una puerta).

### 2.6 La dirección se gobierna por su propio eje, y el rol solo pone el piso

Es la interacción más peligrosa de esta spec y merece una regla propia. Hubo dos ejes candidatos y los dos, solos, fallan.

**No es `LocationPrecision`.** Deja pasar el caso desprotegido (rol `subject` + sensibilidad `low` + `exact`, que es el default de la web, §1.5) y borra la dirección del caso inofensivo (una señal sin punto, cuya precisión es gruesa porque no hay punto, no porque haya protección).

**Y no alcanza con el rol.** `ROL_POR_TIPO` tiene nueve entradas en B (`docs/specs/2026-08-11-b-la-senal.md` §4.7) y cuatro tipos —`sueño`, `saber`, `propuesta`, `pregunta`— salen `service_area`, que es no-`subject`. Bajo una regla que solo mire el rol, un `saber` se publica con calle, altura y texto libre íntegro y sin piso posible: el ejemplo con el que esta misma sección prohíbe el texto libre —«en el pasillo del fondo del 340 vive una señora sola sin agua»— entra entero por la puerta de al lado. B movió esos cuatro fuera de `subject` con un argumento sobre el **punto** («un sueño habla de un lugar, no señala un punto»), correcto para el punto y ciego para la dirección.

Entonces son **dos ejes separados**, y la dirección tiene función propia:

```ts
// Implementado en `packages/civic-core/src/direcciones.ts` con estos nombres.
export type PermisoDireccion = 'completa' | 'solo_calle' | 'ninguna';

export function direccionPermitida(
  tipo: TipoConTechoDeDireccion, role: LocationRole, sensitivity: CivicSensitivity,
): PermisoDireccion;
```

Devuelve **el mínimo entre el techo del tipo y el piso del rol**. Nunca amplía: ningún tipo puede subir lo que el rol bajó, y ningún rol puede subir lo que el tipo no admite.

**Son tres ejes y hay una sola función exportada con ese nombre.** El piso por rol y sensibilidad —la tabla de cuatro filas de más abajo— existe adentro del módulo y **no sale por `civic-core/src/index.ts`**. La razón es la de esta misma sección: una función que mira sólo el rol deja publicar la altura de un `saber` sobre la casa de otro, y mientras las dos estuvieron exportadas la de dos ejes se llamaba `direccionPermitida` y era la que el contrato citaba — de modo que la forma de equivocarse era llamar a la que estaba a mano y tenía el nombre correcto. Que la insegura no exista como símbolo importable no es higiene: es lo que convierte el error de desalentado en inexpresable.

**Y ninguna de estas funciones puede fallar abierto.** Es una regla del módulo, no un detalle de implementación: cuando algo que decide cuánto se publica recibe un valor que no entiende, la respuesta es publicar **menos**. En concreto — el mínimo de la escala devuelve `'ninguna'` ante cualquier valor que no esté en ella (una comparación por `indexOf` devolvía el permiso *menos* restrictivo, porque `-1` es menor que todo); la tabla de techos por tipo **no se exporta**, se lee con `techoDeTipo(tipo: string)`, que **normaliza a NFC las dos puntas** —`'práctica'` con la tilde combinante es otro string y lo manda un cliente iOS sin querer— y devuelve una unión discriminada `{reconocido: true, techo} | {reconocido: false}` en vez de `undefined`; y un tipo no reconocido vale `'ninguna'`, con su propia frase en el recibo para no inventarle a la persona un motivo que no es.

**El techo por tipo** — nueve entradas, exhaustivas sobre el vocabulario de B:

| tipo | techo | por qué |
|---|---|---|
| `basta` | calle + altura + texto | habla de una cosa en un lugar: un pozo, una luminaria, una vereda rota |
| `recurso` | calle + altura + texto | es un punto de entrega: a 100 m no sirve |
| `práctica` | calle + altura + texto | es un lugar al que se va |
| `compromiso` | calle + altura + texto | es una obra en una dirección, y su incumplimiento se comprueba ahí |
| `necesidad` | solo calle | habla del lugar de una persona |
| `saber`, `sueño`, `propuesta`, `pregunta` | solo calle | hablan **sobre** un lugar y a menudo sobre quien vive ahí. Es el hueco que abría `service_area` |

**El piso por rol y sensibilidad** — cuatro filas, y ninguna se puede fusionar:

| situación de la fila | dirección | por qué |
|---|---|---|
| rol `subject` **y** sensibilidad alta | **ninguna.** `sin_direccion`, y `city_id` sube a `department_id` | el punto quedó en una celda de 500 m *conocida* (`obfuscatePoint` redondea a grilla fija, no agrega ruido); cruzarla con un nombre de calle deja un segmento de a lo sumo 500 m, o una cortada entera |
| rol `subject`, sensibilidad no alta | solo la calle. Nunca la altura, nunca `texto_libre` | una altura ubica en ~15 m sobre el lugar de una persona. Y la calle **sí** sobrevive: mide entre 100 m y 2 km, o sea que nombrarla es del orden del punto engrosado |
| rol `service_area` | solo la calle | un ámbito no es una puerta |
| rol `capture` o `meeting_point` | lo que permita el tipo | un pozo y un punto de entrega son cosas, no personas |

La segunda fila existe de verdad, y es la mitad de para qué existe esta spec. Con «es mi casa» mapeado a `subject`+`high` ninguna combinación producía `subject` sin `high`: la fila quedaba muerta y un `¡basta!` sobre tu propio techo que se llueve perdía la dirección entera, ni siquiera la calle. **La pregunta de la casa mapea «es mi casa» a `subject`+`moderate`**; «es la casa de otra persona» y «sin respuesta» quedan en `subject`+`high` con `overridable: false` (obligación en §7.1). El piso de publicación del punto es por rol, así que `subject`+`moderate` sigue saliendo engrosado a 500 m: la gradación no cuesta un metro de protección y recupera la cuadra.

Tres consecuencias que hay que leer completas. **La primera: la altura sirve para el lugar de una cosa, no para el de una persona.** No es una pérdida: una necesidad se resuelve coordinando, no yendo a una puerta que se publicó en un `GET` abierto.

**La segunda: lo que no se publica no se guarda**, igual que el punto crudo (`_geo-columns.ts:22-27`). Y no se marca reservado: un estado que dijera «hay una altura que no te muestro» filtraría que el registro es preciso y está protegido, que es justo lo que hay que no decir.

**Y la tercera: esto no es un contrato de equipo.** Las columnas de la regla (`location_role`, `sensitivity`, `precision`, `lat`) y las de la dirección viven en la **misma fila de la misma tabla**, así que el piso entero es expresable como CHECK y va como CHECK (§3.4). El techo por tipo lo fuerza el compilador; el piso lo fuerza el motor. Sin eso, la próxima ingesta que alguien escriba guarda una altura protegida sin error, sin test rojo y sin que nadie se entere.

### 2.7 Resolver la jerarquía: por catálogo cuando se puede, por punto cuando no queda otra, nunca por cercanía

Extender `provinciaIdDePunto` a los cuatro niveles con point-in-polygon exige geometría de departamentos y municipios que no tenemos (D-004, D-005). La alternativa tentadora —la localidad *más cercana*— se rechaza: en la provincia de Buenos Aires el centroide más cercano puede estar a 40 km y en otro partido. Atribuir por cercanía es inventar con cara de dato.

La salida está en el propio callejero: **la calle trae la jerarquía puesta.** Si la persona elige una calle, sale con su localidad, su departamento, su municipio y su provincia — del registro del Estado, no de un polígono de 29 vértices. Queda un resolvedor que devuelve una unión discriminada y guarda **de dónde salió cada nivel**: `type OrigenDeUbicacion = 'catalogo' | 'punto' | 'declarada' | 'ninguna'`.

Es la idea de `Procedencia` (`simulacion/procedencia.ts`) aplicada a la geografía, en una columna de texto. Y tiene un efecto colateral que vale por sí solo: **`where ubicacion_origen = 'punto'` es, por primera vez, el conjunto exacto de filas cuya provincia sale del polígono malo de D-011.** El daño de esa deuda pasa de anécdota a consulta. Para que el conjunto sea *exacto* y no aproximado, un CHECK impide que una fila tenga provincia y origen `'ninguna'` (§3.4): si no, quedaría incompleto en silencio y la declaración de sesgo de la regla 5 dejaría de ser confiable. Y cuando un nivel no se puede resolver se guarda `NULL` en su id, con `ubicacion_origen` diciendo por qué vía se intentó: nunca un centroide, nunca un vecino, nunca un cero.

`catalogo` es el rótulo de más confianza del sistema y es **enteramente declarado por quien carga**: `calleId` es un entero que manda el cliente contra un catálogo público. Por eso §4.4 lo valida antes de insertar y lo cruza con el punto. «Origen catálogo» quiere decir que la jerarquía sale del registro del Estado, no que la señal sea verdadera.

---

## §3 El esquema

### 3.1 `geographic_locations` — la reparación y el crecimiento

```sql
-- 1. Las 24 filas conservan su id; se arregla el valor basura que la secuencia
--    les puso. Una provincia se pertenece a sí misma: apuntar a sí misma (y no
--    a NULL) hace que `where province_id = 6` devuelva la provincia Y todo lo
--    que cuelga de ella, en vez de `where id = 6 or province_id = 6` en cada
--    agregado del sistema.
UPDATE geographic_locations SET province_id = id WHERE level = 'province';

-- 2. Se desarma el `serial`. No es un tipo: la columna ya es integer, lo que
--    sobra es el default de secuencia.
ALTER TABLE geographic_locations ALTER COLUMN province_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS geographic_locations_province_id_seq;

-- 3. El NOT NULL se queda —nunca se sacó— pero ahora está por la razón
--    correcta: no existe unidad territorial argentina que no pertenezca a una
--    provincia. Con foreign key, que es lo que nunca tuvo.
ALTER TABLE geographic_locations
  ADD CONSTRAINT geographic_locations_province_fk
  FOREIGN KEY (province_id) REFERENCES geographic_locations(id);

-- 4. El nombre deja de ser identidad. Se creó con CREATE UNIQUE INDEX
--    (0002_charming_scrambler.sql:33), no como constraint: se tira con DROP
--    INDEX. `DROP CONSTRAINT` fallaría.
DROP INDEX geographic_locations_level_name_unique;
```

**`province_id` es `NOT NULL` y sin default desde el primer minuto, y eso cambia cómo se inserta una provincia.** Antes la secuencia le ponía cualquier cosa; ahora todo INSERT tiene que traer el valor, y una provincia es su propio padre, así que tiene que **reservarse el id antes de insertar**. Es una sentencia y va en el seed (§4.7, fase 1):

```sql
WITH nuevo AS (SELECT nextval('geographic_locations_id_seq')::int AS id)
INSERT INTO geographic_locations (id, province_id, level, name, iso_code, latitude, longitude, georef_id, name_norm)
SELECT nuevo.id, nuevo.id, 'province', $1, $2, $3, $4, $5, $6 FROM nuevo
ON CONFLICT (georef_id) DO UPDATE SET name_norm = EXCLUDED.name_norm
  WHERE geographic_locations.name_norm IS DISTINCT FROM EXCLUDED.name_norm;
```

Sin eso, sembrar una base vacía —CI con branch limpio, un dev local, la fase 1 del seed— muere con `null value in column "province_id" violates not-null constraint`. §8.5 lo prueba sobre base vacía, no solo sobre la base que ya tiene las 24 filas. Columnas nuevas:

```sql
ALTER TABLE geographic_locations
  -- El id del Estado. UNIQUE y no PK: §2.3.
  ADD COLUMN georef_id   text,
  -- El padre en el ÁRBOL. Qué vale en cada nivel: la tabla de abajo.
  ADD COLUMN parent_id   integer REFERENCES geographic_locations(id),
  -- El departamento ancestro, desnormalizado.
  ADD COLUMN department_id integer REFERENCES geographic_locations(id),
  -- La pertenencia CRUZADA (§2.2). NULL = el Estado no la lista dentro de
  -- ningún municipio: un hecho sobre el país, no un dato faltante.
  ADD COLUMN municipality_id integer REFERENCES geographic_locations(id),
  -- Normalizado por `normalizarNombreDeLugar` de civic-core. Lo escribe el
  -- seed; la consulta normaliza con LA MISMA función (guarda 7 y 9, §8.1).
  ADD COLUMN name_norm   text,
  -- Cuándo el Estado dejó de listarla. NULL = vigente. Nunca se borra una
  -- fila: puede haber señales apuntando, y que el Estado deje de listar un
  -- paraje no lo hace desaparecer del mapa.
  ADD COLUMN vigente_hasta timestamptz;

-- El vocabulario de niveles, por primera vez restringido. En 13 migraciones
-- no hay un solo CHECK; acá empieza.
ALTER TABLE geographic_locations
  ADD CONSTRAINT geographic_locations_level_chk
  CHECK (level IN ('province','department','municipality','locality','settlement'));

CREATE UNIQUE INDEX geographic_locations_georef_unique ON geographic_locations (georef_id);
CREATE INDEX geographic_locations_parent_idx          ON geographic_locations (parent_id);
CREATE INDEX geographic_locations_municipality_idx    ON geographic_locations (municipality_id);
CREATE INDEX geographic_locations_level_norm_idx      ON geographic_locations (level, name_norm);
```

**Qué vale cada columna de jerarquía en cada nivel** — sin esta tabla, `listChildren` y `resolveAncestors` (§5) se escriben adivinando, y las dos adivinanzas dan árboles distintos:

| nivel | `parent_id` | `department_id` | `municipality_id` |
|---|---|---|---|
| `province` | NULL — es la raíz, y es el único nivel donde NULL significa eso | NULL | NULL |
| `department` | la provincia | NULL | NULL |
| `municipality` | **la provincia** — no el departamento: un municipio puede cruzarlos (§2.2) | NULL | NULL |
| `locality` | el departamento | el departamento | el municipio, o NULL si el Estado no la lista en ninguno |
| `settlement` | la localidad censal del payload; si BAHRA no la trae, el departamento | el departamento | el de su localidad, o NULL |

`listChildren(provincia)` devuelve departamentos **y** municipios, y es correcto: el árbol de una provincia tiene dos ramas. Los asentamientos que cuelgan del departamento por falta de localidad se cuentan en el reporte de la corrida (§4.7): es un dato sobre BAHRA, no un error nuestro.

**El vocabulario es éste y estos cinco valores son los únicos que existen.** `city` sale porque no hay ni una fila con ese valor, y `'localidad'` en castellano nunca existió: el término es `'locality'`, en inglés, por paridad con `'province'`. Cualquier filtro por nivel escrito en cualquier spec de la serie se escribe contra estos cinco, tomados de una constante compartida y no de un literal tipeado dos veces (obligación a D en §7.3). `city_id` en las señales se queda con su nombre y pasa a apuntar a una fila `locality` o `settlement` — renombrar la columna, el repositorio y el tipo del cliente web no compra nada que un comentario no compre. Lo que sí hay que tocar es `GeographicRepository.findCity`, que filtra `level = 'city'` y desde este CHECK solo puede devolver `undefined` (§5). Y `georef_id` entra nullable y se hace `NOT NULL` en una segunda migración, después de que el seed lo llene en las 24 filas: un `NOT NULL` sobre filas que no lo cumplen no se puede aplicar.

Y **las 24 filas no se borran, no cambian de id, y `seed-provinces.ts` sigue siendo su origen**: lo único que se les escribe es `georef_id` (`"02"`, `"06"`, `"14"`…), `province_id = id` y `name_norm`; sus `iso_code` y centroides quedan como están, y un test fija sus ids por `iso_code` (§8.5).

### 3.2 `geo_calles` — la tabla nueva

```sql
CREATE TABLE geo_calles (
  id             serial PRIMARY KEY,

  -- 13 dígitos, prefijo jerárquico (§2.3). El CHECK es barato y caza un
  -- payload cambiado de forma antes de que entren 300.000 filas raras.
  georef_id      text    NOT NULL,

  -- La jerarquía DESNORMALIZADA: 8 bytes por fila (2,6 MB) que ahorran dos
  -- joins en cada agregado por territorio. La asimetría con las señales (§2.7)
  -- es deliberada: esto es un catálogo de solo lectura que se re-siembra
  -- entero por provincia; una señal se escribe de a una fila.
  localidad_id   integer NOT NULL REFERENCES geographic_locations(id),
  departamento_id integer NOT NULL REFERENCES geographic_locations(id),
  provincia_id   integer NOT NULL REFERENCES geographic_locations(id),

  -- Tal como lo da el Estado ("AV JOSE MARIA MORENO"): lo que se MUESTRA.
  nombre         text    NOT NULL,
  -- Normalizado y sin el prefijo de categoría ("JOSE MARIA MORENO"): lo que se
  -- BUSCA. La consulta le saca el mismo prefijo al texto de la persona, así que
  -- "AV JOSE" también encuentra (§4.2).
  nombre_norm    text    NOT NULL,
  -- 'nominada' | 'sin_nombre'. "CALLE S N" es una calle que el Estado registró
  -- SIN nombre: un hecho, no un vacío. No entra en el autocompletado (elegirla
  -- no querría decir nada) y sí en los totales, para que la auditoría cierre.
  nombre_clase   text    NOT NULL,
  -- 'CALLE' | 'AV' | lo que el Estado use. Sin CHECK a propósito: el dominio lo
  -- descubre el seed y lo publica en `geo_calle_categorias`, porque el
  -- normalizador de consultas necesita esa lista COMO DATO (§4.2).
  categoria      text    NOT NULL,

  -- El rango, con el 0 de georef ya traducido a NULL en el borde del seed. Los
  -- cuatro estados de §2.5 se derivan de estos dos NULL, y la derivación es
  -- total: ausente / parcialDesde / parcialHasta / completo.
  altura_desde   integer,
  altura_hasta   integer,

  vigente_hasta  timestamptz,
  actualizado_en timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT geo_calles_georef_chk  CHECK (georef_id ~ '^[0-9]{13}$'),
  CONSTRAINT geo_calles_clase_chk   CHECK (nombre_clase IN ('nominada','sin_nombre')),
  -- EL constraint de esta spec: el 0 de georef no entra nunca más.
  CONSTRAINT geo_calles_desde_chk   CHECK (altura_desde IS NULL OR altura_desde > 0),
  CONSTRAINT geo_calles_hasta_chk   CHECK (altura_hasta IS NULL OR altura_hasta > 0),
  CONSTRAINT geo_calles_rango_chk   CHECK (altura_desde IS NULL OR altura_hasta IS NULL
                                           OR altura_desde <= altura_hasta)
);

-- Se crea CON la tabla, no al final: el ON CONFLICT del seed lo necesita.
CREATE UNIQUE INDEX geo_calles_georef_unique ON geo_calles (georef_id);

-- Los tres índices del autocompletado, uno por scope de §4.2. Los tres son
-- compuestos (territorio, nombre) porque el match es SUBSTRING sobre la
-- rebanada del territorio: el btree acota la rebanada y el filtro corre sobre
-- las entradas del índice, sin tocar el heap hasta el LIMIT.
CREATE INDEX geo_calles_localidad_nombre_idx   ON geo_calles (localidad_id, nombre_norm);
CREATE INDEX geo_calles_departamento_nombre_idx ON geo_calles (departamento_id, nombre_norm);
CREATE INDEX geo_calles_provincia_nombre_idx    ON geo_calles (provincia_id, nombre_norm);
```

**El tamaño de la rebanada, con el peor caso verificado y no con el promedio.** El promedio es 326.832/4.037 ≈ 81 calles por localidad, pero no es lo que hay que dimensionar: **Córdoba capital (localidad censal `14014010`) tiene 8.542 calles**, verificado contra la API — 2,7× CABA, que tiene 3.127. Es el peor caso del scope `localidad` y también el del `departamento`, porque el departamento Capital (`14014`) devuelve el mismo total. Un scan de 8.542 entradas de índice por tecla es del orden de milisegundos y no toca el heap. Sin el índice por departamento, en cambio, un `q` de 2 caracteres con ese scope cae en seq scan sobre 326.832 filas —el GIN no puede ayudar: de un patrón de 2 caracteres no se extrae un trigrama completo— y es un endpoint público cuyo espacio de URLs es infinito, así que el scan se pagaría en cada tipeo nuevo.

Y en **una migración aparte** (`0014`), corrida en una pasada distinta de la del seed:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX geo_calles_nombre_trgm ON geo_calles USING gin (nombre_norm gin_trgm_ops);
```

Va separado por tres razones que se suman: es el 22% del presupuesto de bytes (§3.5); sirve solo al caso frío (buscar por provincia con un tipeo, no un prefijo); y **si se construye en la misma corrida que el seed, su WAL se suma al del seed** y el pico sube 90 MB, así que correrlo después parte el pico en dos. Si la medición lo pone arriba de lo estimado, se dropea sin migración inversa y el producto sigue funcionando peor pero funcionando.

### 3.3 `geo_calle_categorias` — el dominio como dato

`CREATE TABLE geo_calle_categorias (categoria text PRIMARY KEY, cantidad integer NOT NULL, corrida text NOT NULL)`. Diez filas o menos. Existe porque el normalizador **de consultas** necesita saber qué tokens iniciales son categoría para sacárselos al texto que escribe la persona (§4.2), y porque el dominio de `categoria` sale de la fuente y no de mi cabeza. **Pero el seed no la lee**, porque sería circular: carga de a una provincia y la tabla se llena a medida que avanza, así que las primeras provincias se normalizarían contra una lista incompleta y `nombre_norm` quedaría inconsistente a lo largo de la tabla —en silencio, devolviendo menos resultados en unas provincias que en otras—. El seed normaliza **cada fila con su propio campo `categoria`**, que viene en el payload (verificado: `{"categoria":"CALLE","nombre":"CALLE S N"}`); la tabla acumulada sirve solo al lado de la consulta, que sí necesita la lista entera porque todavía no sabe de qué calle está hablando.

### 3.4 `direccionColumns` — lo que gana una señal

**Estas columnas y estos CHECK viven en `senales`, la tabla única de B, y entran en la migración `0015` — la misma que crea la tabla, no una posterior.** A los define, B los aplica: A necesita que la ingesta pregunte por el rol y la sensibilidad, y B necesita que alguien defina qué se hace con la respuesta.

Se descartó spread-earlos en `dreams`, `pulse_signals` y `proposals`: defender con nueve CHECK tres tablas que dejan de recibir escrituras y están en cero (`b-la-senal.md` §2.7) era escribir la defensa entera sobre el lado que se apaga. Con eso se retira también la D-035 reservada para «`direccionColumns` sin writer en `pulse_signals` y `proposals`»: el problema deja de existir antes de nacer, y el ordinal se reusa en §7.4. `direccionColumns` sigue siendo un objeto exportado de `_geo-columns.ts` aunque hoy tenga un solo consumidor: es el vehículo de esa partición, y su comentario lo dice.

```ts
/** La dirección normalizada de una señal (spec A §2.5). Se spread-ea en
 *  `senales` junto con `geoColumns`, en la migración que crea la tabla.
 *
 *  Regla que gobierna todo lo de acá: lo que se guarda es lo PUBLICABLE. Lo
 *  que §2.6 no deja publicar no se guarda, igual que el punto crudo. Y lo hace
 *  cumplir la base, no la costumbre: los CHECK de abajo. */
export const direccionColumns = {
  calleId: integer('calle_id').references(() => geoCalles.id),

  /** Siempre > 0. El 0 es el «no sé» de georef y acá no significa nada. */
  altura: integer('altura'),

  /** La unión discriminada de §2.5, verificada por CHECK. `sin_direccion` es
   *  el default: una señal sin dirección nace válida. */
  direccionEstado: text('direccion_estado').notNull().default('sin_direccion'),

  /** El texto presentable, compuesto AL ESCRIBIR —y después de degradar,
   *  §4.5— y guardado. No se compone al leer a propósito: el catálogo se
   *  re-siembra y una calle puede cambiar de nombre, y el registro de una
   *  persona tiene que seguir diciendo lo que decía. Tope 120, el mismo de
   *  `normalizedLocationLabel`, y acá sí hecho cumplir por CHECK: esa función
   *  recorta la copia que viaja como etiqueta, no la columna. */
  direccionTexto: text('direccion_texto'),

  /** De dónde salió la jerarquía (§2.7). `punto` es exactamente el conjunto
   *  que D-011 puede estar atribuyendo mal. */
  ubicacionOrigen: text('ubicacion_origen').notNull().default('ninguna'),
} as const;
```

Los nueve CHECK, en `0015`, sobre `senales`:

```sql
-- La unión discriminada, hecha cumplir por la base. Cada rama fija QUÉ columnas
-- tienen que estar y cuáles faltar, y de paso cierra el dominio de
-- `direccion_estado`: un valor desconocido no satisface ninguna rama y la fila
-- se rechaza. Por eso no hay un CHECK de enum aparte.
ALTER TABLE senales ADD CONSTRAINT senales_direccion_chk CHECK (
     (direccion_estado = 'sin_direccion'
        AND calle_id IS NULL AND altura IS NULL AND direccion_texto IS NULL)
  OR (direccion_estado = 'calle'
        AND calle_id IS NOT NULL AND altura IS NULL AND direccion_texto IS NOT NULL)
  OR (direccion_estado IN ('altura_en_rango','altura_sin_rango','altura_fuera_de_rango')
        AND calle_id IS NOT NULL AND altura IS NOT NULL AND direccion_texto IS NOT NULL)
  OR (direccion_estado = 'texto_libre'
        AND calle_id IS NULL AND altura IS NULL AND direccion_texto IS NOT NULL));

ALTER TABLE senales ADD CONSTRAINT senales_direccion_origen_chk
  CHECK (ubicacion_origen IN ('catalogo','punto','declarada','ninguna'));
ALTER TABLE senales ADD CONSTRAINT senales_altura_chk
  CHECK (altura IS NULL OR (altura > 0 AND altura < 1000000));
ALTER TABLE senales ADD CONSTRAINT senales_direccion_texto_len_chk
  CHECK (direccion_texto IS NULL OR length(direccion_texto) <= 120);

-- §2.6, hecho estructura. El piso por rol, que no depende del tipo y por lo
-- tanto sí es expresable en SQL. La ingesta que se olvide de
-- `ubicacionPublicable` falla el INSERT en vez de filtrar en silencio.
ALTER TABLE senales ADD CONSTRAINT senales_altura_punto_chk
  CHECK (altura IS NULL OR lat IS NULL OR precision = 'exact');
ALTER TABLE senales ADD CONSTRAINT senales_altura_rol_chk
  CHECK (altura IS NULL OR location_role IN ('capture','meeting_point'));
ALTER TABLE senales ADD CONSTRAINT senales_texto_libre_rol_chk
  CHECK (direccion_estado <> 'texto_libre'
         OR location_role IN ('capture','meeting_point'));
ALTER TABLE senales ADD CONSTRAINT senales_direccion_protegida_chk
  CHECK (NOT (location_role = 'subject' AND sensitivity = 'high')
         OR direccion_estado = 'sin_direccion');

-- §2.7: una fila con provincia tiene que decir de dónde salió, o el conjunto de
-- D-011 queda incompleto sin que nada avise.
ALTER TABLE senales ADD CONSTRAINT senales_origen_provincia_chk
  CHECK (province_id IS NULL OR ubicacion_origen <> 'ninguna');

CREATE INDEX senales_calle_idx ON senales (calle_id) WHERE calle_id IS NOT NULL;
```

Los dos CHECK de rol subieron de fuerza al separarse los ejes: antes decían `location_role <> 'subject'` y ahora enumeran los dos roles que sí pueden llevar altura. Es la diferencia entre «no es una persona» y «es una cosa»: `service_area` no es ninguna de las dos y por eso caía en el medio.

`senales` nace vacía, así que ningún CHECK puede fallar por datos: se descarta el `UPDATE ... SET ubicacion_origen = 'declarada' WHERE province_id IS NOT NULL` que este documento tenía escrito para las filas viejas de `dreams`.

El techo de `altura < 1000000`: la numeración más alta del país está en cinco cifras (Rivadavia llega a ~11.500; las rutas numeradas por kilómetro, a decenas de miles). Seis cifras es generoso para una dirección real y caza un teléfono tipeado en el campo equivocado.

### 3.5 El presupuesto de bytes

**Qué es el techo, dicho con precisión.** Los 512 MB son el límite del **plan free de Neon**, no una restricción de diseño: la organización está hoy en ese plan y por eso el número manda. Lo que esta sección entrega es **un renglón medido**, no un veredicto: el conjunto —callejero + señales + rastro— lo cierra `docs/specs/2026-08-11-c-la-corroboracion.md` §3.7 antes de escribir una línea de `rastro_senal`, y con ese número en la mano se decide si se paga el plan o si se diseña para caber. Lo que no se hace es descubrirlo con la base llena.

Uso actual: **38 MB**. **`geo_calles`, heap.** Ancho de fila con las reglas de alineación de Postgres (MAXALIGN 8, varlena con cabecera corta de 1 byte para textos < 127 bytes):

| campo | bytes | de dónde sale |
|---|---:|---|
| cabecera de tupla + bitmap de nulls (12 columnas) | 32 | 23 + 2 de bitmap, MAXALIGNeado |
| `id`, `localidad_id`, `departamento_id`, `provincia_id`, `altura_desde`, `altura_hasta` | 24 | 6 × int4 |
| `georef_id` | 14 | 1 + 13, verificado: los ids son de 13 dígitos |
| `nombre` | 19 | 1 + 18 |
| `nombre_norm` | 19 | 1 + 18 |
| `nombre_clase` | 9 | 1 + 8 (`nominada`) |
| `categoria` | 6 | 1 + 5 (`CALLE`) |
| `vigente_hasta` + `actualizado_en` | 16 | 2 × timestamptz |
| relleno de alineación | 4 | conservador |
| **fila** | **143** | |
| + puntero de item en la página | 4 | |
| **por calle** | **147** | |

Los 18 caracteres de nombre promedio son una **estimación** apoyada en los cuatro nombres que verifiqué contra la API (`CALLE S N` 9, `FARADAY` 7, `AV JOSE MARIA MORENO` 20, `AV JUAN BAUTISTA ALBERDI` 24 → media 15) redondeada hacia arriba, porque el nomenclátor argentino tiene muchos «AV PRESIDENTE JUAN DOMINGO PERON». Sensibilidad: a 25 caracteres la fila pasa de 147 a 161 bytes y el heap de 48 a 53 MB. No cambia ninguna decisión. Filas por página: (8192 − 24) / 147 = 55,5 → 5.888 páginas × 8 KB = **48 MB**.

**`geo_calles`, índices.** Una entrada de btree son 8 bytes de `IndexTupleData` + la clave, MAXALIGNeada, más 4 de puntero; con fillfactor 90 sobre una construcción en bloque:

| índice | clave | bytes/entrada | entradas/hoja | páginas | MB |
|---|---|---:|---:|---:|---:|
| PK `(id)` | int4 | 20 | 367 | 895 | **8** |
| UNIQUE `(georef_id)` | text 13 | 28 | 262 | 1.253 | **11** |
| `(localidad_id, nombre_norm)` | int4 + text 18 | 36 | 204 | 1.610 | **14** |
| `(departamento_id, nombre_norm)` | ídem | 36 | 204 | 1.610 | **14** |
| `(provincia_id, nombre_norm)` | ídem | 36 | 204 | 1.610 | **14** |

**El GIN trigram**, aparte porque es el grande. `pg_trgm` genera por palabra de largo *L* unos *L+1* trigramas; un nombre de 18 caracteres con ~2,5 palabras da ≈ 19. Ocurrencias: 326.832 × 19 = **6,21 M**. Trigramas distintos sobre nomenclatura española: del orden de 35.000. Lista de posteo promedio 6,21 M / 35.000 = 177 entradas, y las largas se comprimen a ~3 bytes por TID por delta varbyte → 18,6 MB de posteo. Árbol de entradas: 35.000 × 24 ≈ 0,8 MB. Llenado típico de páginas GIN 70% → 19,4 / 0,7 = **27,7 MB estimados**. Se presupuestan **45 MB**, margen de 1,6×, porque la fragmentación de las listas y un conteo de trigramas más alto que 35.000 son ambos plausibles y ninguno lo medí.

**El total:**

| | MB |
|---|---:|
| hoy | 38 |
| `geo_calles` heap | 48 |
| `geo_calles` índices btree (8+11+14+14+14) | 61 |
| `geo_calles` GIN trigram | 45 |
| `geographic_locations` a 21.345 filas (3,1 heap + 4 índices) | 8 |
| `geo_seed_progreso`, `geo_calle_categorias`, `geo_catalogo_version` | <1 |
| **total del renglón de A** | **201** |
| **incremental sobre hoy** | **163** |

**163 MB de incremental, contra un límite de rediseño propio de 250.** Los dos índices que esta revisión agregó (`departamento_id`, y el `nombre_norm` de `provincia_id`) valen 20 de esos MB y compran no hacer seq scan de 326.832 filas en un endpoint público sin auth. **El número que le sigue, y que va a la suma conjunta:** las columnas de dirección le agregan a cada fila de `senales` 4 (`calle_id`) + 4 (`altura`) + 15 (`direccion_estado`) + 56 (`direccion_texto`, 55 caracteres promedio con tope de 120 hecho cumplir) + 10 (`ubicacion_origen`) ≈ **90 bytes**, más ~28 de índice sobre `calle_id` cuando no es nulo. Ese número entra en la cuenta de C junto con la fila base de la señal y el rastro; **no se divide 512 por 90 acá**, porque el techo no es de esta spec sola y hacerlo daría un número tranquilizador y falso.

**El pico durante el seed, que es el riesgo real.** Cargar heap e índices genera WAL con imágenes de página completa, y Neon cuenta el historial de la ventana de retención contra el almacenamiento de la rama. Cuatro cosas lo protegen, las cuatro obligatorias:
1. **El staging es `UNLOGGED`.** `CREATE UNLOGGED TABLE geo_calles_stage (LIKE geo_calles INCLUDING DEFAULTS)`, `COPY` adentro, y de ahí el `INSERT ... SELECT ... ON CONFLICT` a la tabla real (§4.7). Una staging logueada re-escribiría ~48 MB de WAL en cada re-corrida.
2. **Los tres btree compuestos se construyen después de la carga.** El único índice que existe durante el seed es el UNIQUE de `georef_id`, porque el `ON CONFLICT` lo necesita.
3. **El GIN va en otra corrida** (§3.2), así que su WAL no se suma al del seed. Con esa partición: pico del seed ≈ 155 de almacenamiento + ~182 de WAL = **337 MB**; pico del GIN ≈ 200 + ~90 = **290 MB**. Juntos serían ~471, con el margen en 41 MB.
4. **Un re-seed sin cambios escribe cero filas.** El `ON CONFLICT DO UPDATE ... WHERE` de §4.7 lo garantiza.

### 3.6 Lo que NO se guarda

**La traza de las calles.** No entra ninguna geometría de calle (razones en §2.4). Costo de traerla más adelante, para que la decisión futura tenga número: 326.832 polilíneas de ~8 vértices, como pares de coordenadas más un bounding box indexable, ≈ 200 bytes/fila → **65 MB de heap + ~25 de índice = 90 MB**, en una tabla lateral `geo_calles_traza` con `calle_id` como PK. Pide una fuente que no es georef y probablemente PostGIS, que es dependencia pesada y por lo tanto un ADR.

**La geometría de departamentos y municipios.** Tampoco entra, y su costo no es de base sino de bundle: `provincias.generated.ts` son 18.310 bytes para 684 vértices, o sea **27 bytes por vértice**. Un layer de departamentos usable (529 × ~60 vértices) son ~860 KB de TS generado; municipios (2.082 × ~40), ~2,2 MB. Eso es D-004 y D-005, y sigue siendo de ellos (§7.4).

**La paridad de la numeración.** georef da cuatro números —`inicio.izquierda`, `inicio.derecha`, `fin.izquierda`, `fin.derecha`— y guardamos dos: `desde = mínimo de los no-cero`, `hasta = máximo de los no-cero`. Estamos validando un número tipeado, no repartiendo correo. La paridad importaría el día que se interpole un punto sobre la traza, porque las dos veredas son lados opuestos de la calle — el mismo día que haría falta la traza. Las dos postergaciones son la misma postergación.

---

## §4 El comportamiento

### 4.1 Los endpoints del catálogo

Todos `GET`, públicos, sin autenticación, sin costo de escritura. Feature slice nueva en `apps/api/src/features/geo/{routes,service,validation,resolver}.ts`. Envoltorio `{ data: ... }` del resto de la API, y bajo `/api/v1` porque es contrato entre la web y la app de campo, igual que `/api/v1/civic`.

```
GET /api/v1/geo/lugares?nivel=&padre=&municipio=&q=&limite=
GET /api/v1/geo/calles?localidad=&departamento=&provincia=&q=&limite=
GET /api/v1/geo/calles/:id
GET /api/v1/geo/paquete/:corrida/localidad/:id
GET /api/v1/geo/paquete/:corrida/departamento/:id
GET /api/v1/geo/version
```

**Las políticas de caché son cuatro y no una**, porque los espacios de URL son distintos:

| ruta | caché | por qué |
|---|---|---|
| `/version` | `no-cache` | 200 bytes, y es lo que le dice al teléfono si su catálogo quedó viejo. Un `max-age` de 24 h acá haría falsa la frase de §4.3 |
| `/paquete/:corrida/...` | `max-age=31536000, immutable` | el contenido de una corrida no cambia nunca; una corrida nueva es una URL nueva |
| `/calles/:id`, `/lugares` | `max-age=86400` | inmutables entre siembras, espacio de URLs acotado |
| `/calles?q=` | `max-age=300` | espacio de URLs **infinito**: cachear 24 h no protege nada y le regala al atacante un fallo de caché por tipeo |

**El costo por request está acotado, y no por el rate limit** — `generalRateLimit()` son 120 req/min por IP con estado en memoria, o sea por instancia de lambda, y bajo concurrencia deja de ser un límite. Entonces: `limite` se valida `z.coerce.number().int().min(1).max(50).default(20)` y el servidor pone `LIMIT` **siempre**, aunque el cliente no mande nada; el router geo corre con `statement_timeout` de 2 s; y `normalizarNombreDeCalle` **elimina todo carácter que no sea alfanumérico o espacio**, con lo que `%` y `_` —que sobreviven a NFD, mayúsculas y colapso de espacios— desaparecen antes de tocar el `LIKE`. Y para que la caché sirva de algo: si el `q` recibido difiere de su forma normalizada, se responde **308 a la URL canónica**, así el edge tiene un objeto por consulta real y no uno por tipeo.

`GET /api/v1/geo/calles` devuelve, por calle:
```ts
interface CalleDelCatalogo {
  id: number; georefId: string;
  nombre: string;                 // "AV JOSE MARIA MORENO" — lo que se muestra
  categoria: string;              // "AV"
  nomenclatura: string;           // "AV JOSE MARIA MORENO, Comuna 7, CABA"
  localidad: { id: number; nombre: string };
  departamento: { id: number; nombre: string };
  municipio: { id: number; nombre: string } | null;   // el de su LOCALIDAD, no un campo propio
  provincia: { id: number; nombre: string };
  rango: RangoDeAltura;           // la unión de §2.5, NUNCA un par de ceros
  vigente: boolean;
}
```

`nomenclatura` y los cuatro nombres **no son columnas de `geo_calles`: se componen al leer**, con cuatro lookups por PK sobre `geographic_locations`, que son 21.345 filas y ~8 MB — la tabla entera vive en caché de Postgres. Por eso el camino caliente de §3.2 es «un scan de la rebanada del territorio más cuatro lookups por PK sobre una tabla cacheada», y por eso no aparecen en el presupuesto de bytes.

`GET /api/v1/geo/version` devuelve lo que la regla 5 exige de cualquier síntesis — la cobertura del propio catálogo:

```ts
interface VersionDelCatalogo {
  corrida: string; fuente: 'georef/api'; fechaDeCorte: string;  // ISO
  totales: Record<'provincias'|'departamentos'|'municipios'|'localidades'|'asentamientos'|'calles', number>;
  cobertura: {
    /** Por provincia: cuántas calles tienen rango de altura y cuántas no. */
    rangoDeAltura: Array<{ provinciaId: number; conRango: number; sinRango: number }>;
    /** Cuántas calles el Estado registró sin nombre. */
    sinNombre: number;
  };
}
```

Ese `cobertura.rangoDeAltura` es la razón por la que el endpoint existe. Sin él, alguien lee «en Córdoba nadie confirma alturas» como un dato sobre Córdoba, cuando es un dato sobre el INDEC.

### 4.2 La búsqueda de calle

**El scope es obligatorio.** Un `q` sin `localidad`, `departamento` ni `provincia` responde 400 con «Decinos dónde buscar: una localidad, un departamento o una provincia.». No es seguridad —el callejero es dato público— es que «SAN MARTIN» sin scope devuelve cientos de resultados indistinguibles y no le sirve a nadie. **Qué operador usa cada scope, y qué índice lo resuelve**, porque sin declararlo no se puede validar ningún índice:

| scope | mínimo `q` | operador | índice | peor caso |
|---|---:|---|---|---|
| `localidad` | 1 | substring sobre la rebanada | btree `(localidad_id, nombre_norm)` | 8.542 entradas (Córdoba capital) |
| `departamento` | 2 | substring sobre la rebanada | btree `(departamento_id, nombre_norm)` | 8.542 (departamento Capital, Córdoba) |
| `provincia` | 3 | `similarity()` con umbral, `ORDER BY`, `LIMIT` | GIN `nombre_norm gin_trgm_ops` | acotado por `LIMIT` y `statement_timeout` |

El substring es lo que el ejemplo de abajo exige —«MORENO» está en el medio de `JOSE MARIA MORENO`— y por eso los índices de localidad y departamento son compuestos: el btree acota la rebanada y el filtro corre sobre las entradas del índice. Con menos de 3 caracteres no hay trigrama completo que buscar, y por eso el scope de provincia pide 3.

**La normalización es simétrica y es una sola función** — `normalizarNombreDeCalle(texto: string, categorias: readonly string[]): string` en `packages/civic-core/src/direcciones.ts`, pura y sin dependencias, con la lista de categorías **inyectada** porque civic-core no lee la base. Qué hace, en orden: NFD, saca los diacríticos combinantes, **elimina todo lo que no sea alfanumérico o espacio**, mayúsculas, colapsa espacios, y **si el primer token completo está en `categorias`, lo saca** — salvo que sacarlo dejara el resultado vacío, que es el caso de una calle cuyo nombre entero *es* su categoría (`nombre: "CALLE"`, `categoria: "CALLE"`) y que contra una columna `nombre_norm text NOT NULL` reventaría.

El corte de la categoría está apoyado en datos verificados: `"AV JOSE MARIA MORENO"` tiene `categoria: "AV"` y repite el prefijo en el nombre; `"FARADAY"` tiene `categoria: "CALLE"` y no lo repite. Como georef es inconsistente, se guarda `nombre_norm` sin prefijo y se le saca el prefijo también a lo que escribe la persona: así «MORENO», «JOSE MARIA» y «AV JOSE» encuentran la misma calle. El corte solo dispara con **token completo**: «AVELLANEDA» no se rompe porque `AVELLANEDA ≠ AV`. Los dos lados no reciben el mismo segundo argumento, y es deliberado (§3.3): el seed pasa `[fila.categoria]`, la consulta pasa la lista entera, y la guarda 7 afirma que el resultado coincide igual.

**Las abreviaturas no se expanden.** «GRAL» no se convierte en «GENERAL». Expandir es adivinar qué quiso decir el Estado, y la persona está eligiendo de una lista que ve. Lo que lo cambiaría: una tasa de búsquedas vacías medida en producción; el arreglo sería una tabla de alias sembrada, no una heurística. **Y nunca aparecen en resultados** las filas `nombre_clase = 'sin_nombre'` (elegir «CALLE S N» no querría decir nada) ni las que tienen `vigente_hasta` seteado: las dos **sí** se devuelven por `/calles/:id`, con su marca, para que una señal vieja pueda seguir mostrando la dirección que tenía.

### 4.3 El paquete offline

La regla 1 es «offline-first, nunca offline-only» y la decisión 1 pide autocompletado sin señal. Mandar 326.832 calles a un teléfono no es viable; mandar **el territorio donde se trabaja** sí. Hay **dos** paquetes y no uno, porque una campaña cubre una zona y no una localidad: si el offline fuera solo por localidad, la superficie sin señal sería más angosta que la que §4.2 permite online, justo en el caso de uso que justifica toda la spec. Los dos devuelven las calles en forma compacta (array de arrays, sin claves repetidas) más la `corrida` del catálogo, que va en la ruta.

| paquete | promedio | peor caso verificado |
|---|---|---|
| `localidad/:id` | 81 calles ≈ 4 KB crudos | Córdoba capital, **8.542 calles** ≈ 427 KB crudos, **~107 KB gzip** |
| `departamento/:id` | 618 calles ≈ 31 KB crudos, ~8 KB gzip | departamento Capital de Córdoba: las mismas 8.542, ~107 KB gzip |

El peor caso no es CABA. Verificado contra la API: CABA es una sola localidad censal (`02000010`) con **3.127** calles (~39 KB gzip), y **Córdoba capital (`14014010`) tiene 8.542** — 2,7× más. Con 107 KB gzip para el peor caso del país, la regla 10 sigue cumplida por un orden de magnitud.

**Un `settlement` no tiene paquete propio y resuelve a su localidad ancestro** por `parent_id` (§3.1); los que BAHRA deja sin localidad cuelgan del departamento y resuelven a su paquete. Y la `corrida` va en la ruta, con el paquete servido `immutable` (§4.1): el teléfono compara su `corrida` contra la de `/version`, que responde `no-cache`, y baja de nuevo solo cuando cambió.

**El cliente de estos dos endpoints lo escribe B** (`b-la-senal.md`, la rebanada de `apps/mobile`): es el único momento en que alguien toca la app de campo en serio, y sin él la decisión 1 del proyecto queda sin implementación. Se descartó asignárselo a C, que no toca el móvil. Hasta entonces el único llamador es el test de integración de §8.4, y se dice acá en vez de dejarlo implícito.

### 4.4 La resolución al escribir

No es un endpoint: es la función que la ingesta llama antes de insertar. Vive en `features/geo/resolver.ts` y devuelve una unión discriminada.
```ts
export type UbicacionResuelta =
  | { origen: 'catalogo';  provinciaId: number; departamentoId: number; localidadId: number;
      municipioId: number | null; calleId: number;
      /** Cuando hay punto y no cae en la provincia de la calle. Va al recibo. */
      discrepancia: string | null }
  | { origen: 'declarada'; provinciaId: number; localidadId: number | null }
  | { origen: 'punto';     provinciaId: number; advertencia: string }
  | { origen: 'ninguna';   razon: string };

export async function resolverUbicacion(db: Db, entrada:
  { calleId?: number; localidadId?: number; provinciaId?: number; punto: GeoPoint | null },
): Promise<UbicacionResuelta>;
```

**El orden de precedencia, y por qué:**
1. **`calleId`** — si la persona eligió una calle, la jerarquía sale del registro del Estado. Es la única vía que resuelve los cuatro niveles.
2. **`localidadId`** — la persona la eligió; sube por `parent_id` a departamento y provincia.
3. **`provinciaId` declarado** — lo que hace hoy `POST /api/open-data/dreams`.
4. **`punto`** — `provinciaIdDePunto`, con `advertencia` puesta: *«Provincia derivada de un polígono simplificado; puede errar cerca de un límite.»* Y `ubicacion_origen = 'punto'`, que deja la fila marcada para el día que entre geometría decente.
5. **Nada** — `origen: 'ninguna'` con su razón. Se guarda `province_id = NULL`. **No se guarda un centroide, no se busca la localidad más cercana, no se pone cero.**

**`calleId` se valida antes de insertar, no en la FK.** Es un entero que manda el cliente contra un catálogo público: cualquiera puede pedir 200 ids de un barrio con `GET /calles?localidad=…&q=a` y plantar N señales con jerarquía de ese barrio y una altura adentro del rango que el mismo endpoint le devolvió. La validación no lo impide —nada lo impide sin cuentas— pero sí impide las dos formas silenciosas del problema: un `calleId` inexistente o `sin_nombre` responde **400 en castellano**, no una violación de FK convertida en 500; y cuando hay punto **y** calle se corre `provinciaIdDePunto` igual y, si no coincide con `geo_calles.provincia_id`, la fila se guarda con `origen: 'catalogo'` **y** `discrepancia` puesta, que el recibo dice: *«El punto que marcaste no cae en la provincia de esa calle.»* Es la única verificación cruzada gratis que el sistema tiene y no hay razón para tirarla. Igual gana la calle para la jerarquía y el punto sigue siendo el punto: son dos hechos y no compiten.

**Efecto colateral que cierra §1.3:** la vía 1 escribe `city_id`. Es el primer writer que esa columna tiene desde que existe — y por eso §2.6 la mete bajo la política de exactitud, en vez de dejarla como el único campo de ubicación publicada que nadie gobierna.

### 4.5 La dirección: degradar, componer, y poder olvidar

En `packages/civic-core/src/direcciones.ts`, puro, sin base:
```ts
export type RangoDeAltura =
  | { tipo: 'completo'; desde: number; hasta: number } | { tipo: 'parcialDesde'; desde: number }
  | { tipo: 'parcialHasta'; hasta: number }            | { tipo: 'ausente' };

export function clasificarAltura(rango: RangoDeAltura, altura: number):
  'altura_en_rango' | 'altura_sin_rango' | 'altura_fuera_de_rango';
```

La tabla completa, con `AV JUAN BAUTISTA ALBERDI` (`parcialHasta: 3200`) verificado contra la API:

| rango | altura | resultado | por qué |
|---|---:|---|---|
| `completo` 1301–1600 | 1450 | `altura_en_rango` | adentro |
| `completo` 1301–1600 | 2000 | `altura_fuera_de_rango` | afuera, demostrable |
| `parcialHasta` 3200 | 4000 | `altura_fuera_de_rango` | por encima del fin conocido |
| `parcialHasta` 3200 | 100 | `altura_sin_rango` | **no se sabe dónde empieza**. No se afirma nada |
| `parcialDesde` 801 | 400 | `altura_fuera_de_rango` | por debajo del inicio conocido |
| `parcialDesde` 801 | 5000 | `altura_sin_rango` | no se sabe dónde termina |
| `ausente` | cualquiera | `altura_sin_rango` | Córdoba entera |

**El orden es obligatorio y va numerado, porque invertirlo anula §2.6 con una columna de texto:** si el texto se compusiera primero, la fila quedaría con `altura IS NULL` y con «AV JOSE MARIA MORENO 1450» adentro de `direccion_texto`, que sale por la API pública y por el volcado de D. Los CHECK no lo cazan —`direccion_texto` es texto libre con tope de largo—, y por eso **es la única parte de §2.6 que la base no puede defender sola.**
1. `resolverUbicacion` (§4.4) → jerarquía + origen.
2. `prepareRecordLocation` **sin `locationLabel`** → punto publicado + `PublishedPrecisionResult`.
3. `ubicacionPublicable(...)` → la dirección y la jerarquía ya degradadas.
4. `componerDireccion(...)` **sobre lo que salió del paso 3** → `direccion_texto`.
5. `normalizedLocationLabel(direccionTexto)` → la etiqueta de la fila. Es la misma función que usa `prepareRecordLocation`, así que columna y etiqueta no pueden divergir.

**Esta secuencia es obligación de `b-la-senal.md` §4.7**, que es donde vive la ingesta única. Se descartó especificarla contra `capturas.ts` y `open-data/routes.ts`: B los reemplaza por `POST /api/v1/civic/senales` y una secuencia escrita contra dos endpoints que se apagan no protege el que queda.

`ubicacionPublicable` **no recibe ni devuelve el texto**, y esa es la parte del diseño que hace el error inexpresable:
```ts
export function ubicacionPublicable(input: {
  tipo: TipoDeSenal;                     // el techo de §2.6, vía `direccionPermitida`
  direccion: { calleId: number | null; altura: number | null; textoLibre: string | null };
  rango: RangoDeAltura;
  jerarquia: { cityId: number | null; departmentId: number | null };
  precision: PublishedPrecisionResult;   // el resultado ENTERO, no solo la etiqueta
  hayPunto: boolean; role: LocationRole; sensitivity: CivicSensitivity;
}): { calleId: number | null; altura: number | null; estado: DireccionEstado;
      cityId: number | null; departmentId: number | null;
      /** Qué se retiró y por qué, en castellano, para el recibo. */
      retirado: string | null };
```

Implementa la tabla de §2.6 y es **total sobre los seis estados, las seis precisiones, los cuatro roles y los nueve tipos**. Tres cosas que la hacen distinta de un `if` suelto:
- **Se llavea en `direccionPermitida` y en `coarsenedBecause`, no en `LocationPrecision`.** Una precisión gruesa porque no hay punto no es lo mismo que una gruesa porque corrió la protección, y `PublishedPrecisionResult` ya trae el campo que las distingue.
- **`city_id` es su salida también.** Cuando corrió la protección, la localidad se retira y queda el departamento (§3.1 lo desnormaliza en la fila: es leer un campo). Publicar el paraje exacto al lado de un punto engrosado a 500 m es la misma fuga por el otro flanco, y `city_id` es público desde que `CivicMapRepository` lo devuelve.
- **`texto_libre` tiene rama.** Solo sobrevive con `capture` o `meeting_point` y techo `completa`. Y no deja rastro, igual que la altura.

**`TipoDeSenal` lo declara B** (`b-la-senal.md` §3.1). A escribe `direccionPermitida` y su tabla de nueve entradas hoy, declarada con `satisfies Record<string, PermisoDireccion>` y **sin exportar** (se lee con `techoDeTipo`); cuando B declara el union, la guarda de exhaustividad entra y un tipo décimo sin fila no compila. Es la misma partición A-define/B-aplica de §3.4.

**Y se puede olvidar.** La regla 9 pide consentimiento comprensible **y revocable**, y sobre el dato más sensible que la plataforma guardó nunca hacen falta las dos mitades. `olvidarDireccion(db, idPublico)` es **una sola sentencia**: `SET direccion_estado='sin_direccion', calle_id=NULL, altura=NULL, direccion_texto=NULL`. Una sola transición, y el CHECK de §3.4 garantiza que esa es la **única forma legal** de la fila después — no queda residuo en una columna que la función olvidó. La superficie es `DELETE /api/v1/geo/direccion/:idPublico?c=<código>`, con el código un HMAC del id contra el secreto del servidor: cero columnas nuevas, sin cuenta, y solo lo tiene quien recibió el recibo. Su límite se dice en vez de disimularse: **el código vive en el recibo y no se regenera.** Es la mitad de dirección del retiro que B construye para el texto (`estado = 'retirada'`) y C para el actor (vaciar `actor_hash`): tres verbos sobre tres objetos, ninguno sustituye a otro.

### 4.6 Casos límite

| caso | qué pasa |
|---|---|
| `altura = 0` | Zod la rechaza (`z.number().int().positive()`) y el CHECK la rechazaría igual. Es el centinela de georef, no un número de puerta |
| `altura = 999999999` | rechazada por el CHECK `< 1000000` |
| altura fuera del rango conocido | **se guarda**, con estado `altura_fuera_de_rango`. Nunca se descarta lo que escribió una persona |
| `calleId` que no existe, o `sin_nombre` | **400 en castellano**, antes del insert. Nunca una violación de FK convertida en 500 |
| la calle elegida pertenece a otra localidad que la declarada | **gana el catálogo**. El select es una comodidad de UI; la pertenencia es del Estado. El recibo lo dice |
| la calle elegida contradice el **punto** | se guarda con `origen: 'catalogo'` y `discrepancia` puesta; el recibo dice «el punto que marcaste no cae en la provincia de esa calle» |
| dos calles con el mismo nombre en el scope | las dos vuelven, con su `nomenclatura` completa. La persona elige. Nunca se resuelve sola |
| altura o texto libre en un tipo de techo `solo_calle` (`saber`, `sueño`, `propuesta`, `pregunta`, `necesidad`) | se guarda `calle`, sin altura y sin texto libre. El recibo dice qué se retiró y por qué |
| texto libre con rol `subject` o `service_area` | no se guarda; el recibo ofrece elegir una calle o cargar sin dirección |
| **señal con dirección y sin punto** | **válida, y conserva lo que su tipo permita.** `lat`/`lng` en NULL; `precision` describe un punto que no existe y no gobierna nada; la dirección se gobierna sola por tipo, rol y sensibilidad (§2.6) |
| señal con punto y sin dirección | válida. Es todo lo que existe hoy |
| la calle referida dejó de estar en georef | `vigente_hasta` seteado, la fila sigue, la FK no cuelga. Por eso el catálogo no borra |
| `q` con tildes, minúsculas o `%` | el mismo normalizador de los dos lados; los metacaracteres se eliminan antes del `LIKE`: «josé maría moreno» encuentra `JOSE MARIA MORENO`. Y `limite=100000` da 400: el servidor topea en 50 y pone `LIMIT` aunque el cliente no mande nada |

### 4.7 El seed

`packages/db/scripts/seed-callejero.ts`, en tres capas separadas —**traer → normalizar → escribir**— para que cambiar la fuente sea cambiar una capa.

**La fuente**, con los paths exactos, porque el recurso se equivoca fácil y el error no falla: `/provincias`, `/departamentos`, `/municipios`, **`/localidades-censales`** (con guión, y **no** `/localidades`, que es otro recurso: sembrar el equivocado entra filas plausibles y el `filas_escritas = total_declarado` cierra igual), `/asentamientos`, `/calles`. Paginada: `?inicio=` y `?max=` andan, y `total` viene en cada respuesta (CABA: `total: 3127`). Con `max=1000` el tirón completo son 327 requests de calles más 22 de jerarquía: **349 requests**, serializadas, **concurrencia 1**, porque en las pruebas de este proyecto georef cortó a la tercera llamada concurrente. Con backoff exponencial y reintento por página, a ~1 req/s son unos 6 minutos. Si georef rechaza `max=1000`, baja a `max=100`: 3.269 requests y ~55 minutos, y sigue siendo un costo de una sola vez.

**El progreso, que es lo que la hace reanudable y auditable:**
```sql
CREATE TABLE geo_seed_progreso (
  corrida    text    NOT NULL,
  recurso    text    NOT NULL,   -- 'provincias'|'departamentos'|'municipios'
                                 -- |'localidades_censales'|'asentamientos'|'calles'
  particion  text    NOT NULL,   -- id de provincia; '00' para los que no se parten
  total_declarado  integer,      -- lo que dijo la API en `total`
  filas_escritas   integer NOT NULL DEFAULT 0,
  offset_siguiente integer NOT NULL DEFAULT 0,
  estado     text    NOT NULL,   -- 'pendiente'|'en_curso'|'completa'|'fallida'
  hash_fuente text,              -- sha256 del payload normalizado de la partición
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  -- La corrida va DENTRO de la clave: si no, una segunda siembra pisa el
  -- registro de la primera con su hash_fuente, que es justo el insumo del diff.
  PRIMARY KEY (corrida, recurso, particion),
  CONSTRAINT geo_seed_estado_chk CHECK (estado IN ('pendiente','en_curso','completa','fallida'))
);
```

- **Reanudable:** al arrancar lee `offset_siguiente` de cada partición `en_curso` y sigue desde ahí; un corte a la mitad cuesta una página, no una corrida. **Completa** es todas las particiones en `completa` **y** `filas_escritas = total_declarado`: contra el conteo de la propia fuente, no contra una expectativa nuestra.
- **Idempotente, y con el mecanismo nombrado:** `COPY` no acepta `ON CONFLICT`, así que las dos cosas que §3.5 promete no pueden estar en la misma sentencia. Se hacen en dos: `TRUNCATE geo_calles_stage` por provincia, `COPY` adentro de la staging **UNLOGGED**, y después `INSERT INTO geo_calles SELECT * FROM geo_calles_stage ON CONFLICT (georef_id) DO UPDATE SET ... WHERE (algo cambió)`. La cláusula `WHERE` en el `DO UPDATE` es lo que hace que una re-corrida sin cambios escriba **cero filas** — sin tuplas muertas, sin WAL, sin bloat.
- **La identidad de una calle es su `georef_id` más su localidad.** Si georef recodifica y un `georef_id` que existía pasa a nombrar una calle de OTRA localidad, el `DO UPDATE` no corre: se trata como **retiro + alta**. La fila vieja recibe `vigente_hasta = now()` y conserva su `id` y sus señales; entra una fila nueva. Sin esta regla, `calle_id` de N señales pasaría a apuntar a otra calle en silencio, y eso no se reconstruye dos años después. La corrida reporta esos casos aparte, como «recodificación».
- **Si georef cambió:** el `hash_fuente` por partición se recalcula; si coincide, la partición se saltea entera sin tocar la base, y si difiere se re-upsertea y la corrida **reporta el diff**: altas, modificaciones, recodificaciones y desapariciones.
- **Las desapariciones no borran.** Una calle que georef dejó de listar recibe `vigente_hasta = now()`. Que el Estado deje de listarla no la hace desaparecer del barrio, y puede haber señales apuntando: por eso la FK nunca cuelga y no necesita `ON DELETE SET NULL`.
- **El orden es obligatorio:** provincias → departamentos → municipios → localidades censales → asentamientos → calles; las FK no dejan otra. La **fase 1 son las 24 provincias** con la sentencia de `nextval` de §3.1, y `seed-provinces.ts` deja de ser un script suelto. Los tres btree compuestos se crean al final; el GIN, en otra corrida (§3.5).

**La versión del catálogo**, que es lo que citan `/api/v1/geo/version` y el volcado de la spec D:

```sql
CREATE TABLE geo_catalogo_version (
  corrida       text PRIMARY KEY,
  fuente        text NOT NULL,          -- 'georef/api'
  fecha_de_corte timestamptz NOT NULL,
  totales       json NOT NULL,          -- por recurso
  cobertura     json NOT NULL,          -- rango de altura por provincia, sin_nombre
  vigente       boolean NOT NULL DEFAULT false
);
-- Una sola fila vigente, y hecho cumplir: dos vigentes harían que /version y el
-- sobre de la spec D citaran versiones distintas del mismo catálogo, que es lo
-- que `corrida` existe para impedir.
CREATE UNIQUE INDEX geo_catalogo_version_vigente_unique
  ON geo_catalogo_version (vigente) WHERE vigente;
```

La corrida nueva se marca vigente al final, en la misma transacción que cierra la última partición: hasta que termine, el catálogo que sirven los endpoints es el anterior.

---

## §5 Lo que se rompe

Archivo por archivo, con lo que hay que tocar. **Todo lo de acá entra en las migraciones `0013` y `0014` y no toca ninguna tabla de señal:** las cinco columnas de dirección y sus nueve CHECK se definen en `_geo-columns.ts` y los aplica B en `0015` (§3.4).

| archivo | qué cambia |
|---|---|
| `packages/db/src/schema/geographic.ts` | `provinceId: serial('province_id')` → `integer` notNull con self-FK (línea 31). Columnas nuevas `georefId`, `parentId`, `departmentId`, `municipalityId`, `nameNorm`, `vigenteHasta`. Se cae `uniqueIndex('geographic_locations_level_name_unique')` (línea 40), entra el unique sobre `georef_id`. **Las cuatro FK auto-referenciales no compilan sin anotar el callback**: con `strict: true` TypeScript rechaza la inferencia circular (TS7022/7023), y `no-explicit-any` cierra la salida fácil. Hay que importar `type AnyPgColumn` de `drizzle-orm/pg-core` y escribir `.references((): AnyPgColumn => geographicLocations.id)` en las cuatro. No hay un solo precedente en el repo: éste es el molde |
| `packages/db/src/schema/geo-calles.ts` · `geo-seed.ts` | **nuevos.** `geoCalles`, `geoCalleCategorias`, `geoSeedProgreso`, `geoCatalogoVersion`, y `schema/index.ts` los exporta |
| `packages/db/src/schema/_geo-columns.ts` | `direccionColumns` nuevo, al lado de `geoColumns`, **exportado y sin consumidor hasta `0015`**. El comentario de `cityColumn` (líneas 41-48) se actualiza: `city_id` apunta a `level='locality'` o `'settlement'`, y es ubicación publicada que `ubicacionPublicable` gobierna |
| `packages/db/src/repositories/geographic.ts` | `findCity` filtra `level='city'`, valor que el CHECK nuevo vuelve imposible: pasa a `findLocalidad`, con `level IN ('locality','settlement')` **y** `name_norm` con igualdad exacta. `findProvinceByName` (líneas 37-45) matchea `name` con tildes apoyado en el índice que §3.1 dropea: pasa a `name_norm`, con la MISMA función que escribió la columna, y usa `(level, name_norm)`. Si no, es seq scan sobre 21.345 filas en cada escritura que resuelve provincia — o sea en el camino que cerró D-001. `normalizeProvinceName` queda como **tabla de alias** («CABA» → el nombre canónico) POR ENCIMA del normalizador, nunca como un segundo normalizador. `upsertLocation` **se llama upsert y es un INSERT pelado**: pasa a `ON CONFLICT (georef_id) DO UPDATE`. Métodos nuevos: `listChildren`, `findByGeorefId`, `resolveAncestors` |
| `packages/db/src/repositories/geo-calles.ts` | **nuevo.** `buscarCalles`, `porId`, `paqueteDeLocalidad`, `paqueteDeDepartamento`, `upsertLote` |
| `packages/db/scripts/seed-provinces.ts` | el `values({...})` de las líneas 69-75 se reemplaza por la sentencia con `nextval` de §3.1 (`province_id` es NOT NULL sin default: el insert de hoy fallaría), y suma `georefId` y `nameNorm`. Pasa a ser la fase 1 de `seed-callejero.ts` |
| `packages/db/scripts/seed-callejero.ts` | **nuevo.** §4.7 |
| `packages/db/migrations/0013_*.sql` + `meta/_journal.json` | reparación de `province_id`, columnas nuevas, CHECK de nivel, las cuatro tablas del catálogo. **La receta importa:** `pnpm --filter @v2/db db:generate` para columnas y tablas nuevas, después editar a mano el archivo generado para meterle el bloque de reparación de §3.1. Un `.sql` dejado en la carpeta **sin entrada en el journal nunca se aplica y no avisa** — `migrate.ts` usa el `migrate()` de drizzle, que lee el journal. Y drizzle-kit no genera la mitad interesante: sobre `serial → integer` emite un `SET DATA TYPE` y deja secuencia y default en pie |
| `packages/db/migrations/0014_*.sql` | `CREATE EXTENSION pg_trgm` + el índice GIN. Se genera con `drizzle-kit generate --custom` para que obtenga su entrada en el journal. Corrida aparte de la del seed (§3.5) |
| `packages/civic-core/src/direcciones.ts` | **nuevo.** `normalizarNombreDeCalle`, `normalizarNombreDeLugar`, `RangoDeAltura`, `clasificarAltura`, `PermisoDireccion`, **`direccionPermitida(tipo, role, sensitivity)`**, `techoDeTipo`, `TIPOS_CON_TECHO_DE_DIRECCION`, `permisoMasRestrictivo`, `componerDireccion`, `direccionSinAltura`, `DireccionDeSenal`, `ubicacionPublicable`, `etiquetaDeDireccion`; `civic-core/src/index.ts` lo reexporta. **El piso por rol y la tabla de techos por tipo NO se exportan** (§2.6) |
| `apps/api/src/features/geo/{routes,service,validation,resolver}.ts` | **nuevo.** §4.1, §4.4 y el `DELETE /direccion/:idPublico` de §4.5; se monta en `app.ts` con `app.use('/api/v1/geo', geoRouter)` |
| `apps/api/src/features/geographic/provincias.ts` · `backfill-provincias.ts` | `provinciaIdDePunto` (línea 46) se queda tal cual y gana un llamador nuevo; su comentario de cabecera se amplía, porque la resolución por punto ahora es la **última** opción y no la única. El backfill, además de `province_id`, escribe `ubicacion_origen = 'punto'` cuando esa columna exista, para que el conjunto de D-011 quede marcado también hacia atrás |

**Lo que NO se rompe, y es la mitad del argumento de §2.1:** ninguna columna que apunta a `geographic_locations.id` cambia de tipo ni de destino.

**Y lo que esta spec deja sin cablear, dicho en voz alta para no repetir el defecto de §1.3:** `resolverUbicacion`, `ubicacionPublicable`, `direccionPermitida` y los dos paquetes offline salen sin llamador de producción. No es descuido: la ingesta única es de B, y encender un campo de dirección sobre una ingesta que defaultea `subject`/`low` (§1.5) sería exactamente el daño que §2.6 existe para impedir. El selector de calle de `PanelSoltarVoz.tsx` y la columna `direccion` de `SenalMapa` entran con B, en la misma rebanada que la pregunta en castellano. Las obligaciones están en §7.1.

---

## §6 Contra la Constitución

**Regla 1 — «Offline-first, nunca offline-only.»** El callejero se espeja localmente (decisión 1) y se reparte por paquete de localidad **y de departamento** (§4.3), para que la superficie offline no sea más angosta que la online: 107 KB gzip para el peor caso del país, verificado. El normalizador vive en civic-core, que no toca red ni disco, así que corre igual en Hermes. Georef no está en el camino de captura, ni siquiera con red. **La regla queda cumplida del lado del servidor acá y del lado del teléfono cuando B escriba el cliente** (§7.1): mientras tanto se dice, no se supone.

**Regla 2 — «La ubicación exacta es privada por defecto; lo público usa precisión reducida.»** Es la regla que esta spec pone más en riesgo, y hay que empezar por lo incómodo: **hoy el default es lo contrario de lo que la regla dice.** `publishedPrecision` solo engrosa con `role='subject' && sensitivity='high'`, y la superficie de carga más usada no manda ninguno de los dos (§1.5). Citar esa función como si fuera restrictiva sería citar código que no se ejecuta.

Esta spec cierra la compuerta en tres lugares a la vez, para que no dependa de que nadie se acuerde. **En el eje:** la dirección tiene función propia, `direccionPermitida` (§2.6), con techo por tipo y piso por rol — de modo que un `saber` o un `sueño`, que no son `subject` y por lo tanto nunca se engrosan, tampoco puedan llevar altura ni texto libre. **En la base:** los nueve CHECK de §3.4 son el piso entero, sobre columnas de la misma fila, así que una ingesta que se olvide de `ubicacionPublicable` **falla el INSERT**. **En la ingesta:** la pregunta por el rol y la sensibilidad se hace de verdad y en castellano antes de que el campo de dirección exista (§7.1). Y lo que no se publica no se guarda: `prepareRecordLocation` sigue siendo el único dueño de la decisión sobre el punto, y `ubicacionPublicable` es su par para la dirección y para `city_id`.

**Regla 4 — «Una señal siempre muestra su estado de calidad.»** El estado de la dirección **no es** el estado de calidad de la señal. Son dos ejes: uno dice hasta dónde se pudo verificar la ubicación contra el catálogo del Estado, el otro si la señal fue corroborada por gente. Confundirlos sería fusionar «la altura no se pudo confirmar» con «nadie corroboró esto». La máquina de la regla 4 es de B y de C — pero **A escribe ya el texto de pantalla y prohíbe la palabra**, porque `etiquetaDeDireccion` va a convivir con el chip de estado y una etiqueta que dijera «confirmada» haría entender que alguien corroboró la señal, cuando lo único que pasó es que un número cayó dentro de un rango del INDEC. Devuelve, y no puede contener «confirmada», «confirmado» ni «verificada»:

| estado | etiqueta |
|---|---|
| `altura_en_rango` | «la altura está dentro de la numeración que publica el callejero» |
| `altura_sin_rango` | «el Estado no publica la numeración de esta calle» |
| `altura_fuera_de_rango` | «la altura no coincide con la numeración del callejero» |
| `calle` | «calle del callejero del Estado, sin altura» |
| `texto_libre` | «escrito a mano: no está en el callejero del Estado» |

**Regla 5 — «Toda síntesis muestra cobertura y sesgo.»** `/api/v1/geo/version` publica la cobertura del catálogo por provincia: cuántas calles tienen rango y cuántas no. Es la única forma de que «en Córdoba nadie confirma alturas» se lea como lo que es —un dato sobre el INDEC— y no sobre Córdoba. Y `ubicacion_origen`, con su CHECK, hace que el sesgo de D-011 sea una consulta exacta y no aproximada.

**Regla 6 — «La IA puede sugerir; nunca determina la verdad de una señal.»** Acá no hay modelo. El match de una calle es comparación determinística contra el catálogo del Estado. El match difuso (trigram) **propone** y la persona elige de una lista; no hay auto-aceptación por debajo de la igualdad exacta del nombre normalizado. Una dirección nunca se resuelve sola.

**Regla 7 — «No hay ranking público individual ni puntaje ideológico.»** Esta spec no crea ningún ranking. Habilita **uno**, el municipal de la Simulación (§7.4), con dos condiciones nombradas y no opcionales, porque con 2.082 municipios y las tablas cívicas en cero la cabeza de ese ranking sería un municipio donde habló una sola persona — o sea una etiqueta territorial alrededor de un individuo, que es la regla 7 por la puerta de atrás.

**Regla 9 — «Consentimiento comprensible y revocable.»** Las dos mitades, no una. *Comprensible:* el recibo de captura ya existe (`ReciboCaptura` con `precisionPublicada` y `engrosado`) y gana la dirección, en castellano y sin eufemismos: *«Confirmamos la calle. La altura no la pudimos confirmar: el Estado no publica el rango de numeración de esta calle.»* Y cuando §2.6 se lleva algo: *«No publicamos la altura: esta señal habla del lugar de una persona.»*

*Revocable:* `olvidarDireccion` (§4.5), expuesta como `DELETE /api/v1/geo/direccion/:idPublico?c=<código>`, con el código en el recibo. Una sola transición, y el CHECK de §3.4 garantiza que no queda residuo en ninguna columna — incluido `direccion_texto`, que es donde una implementación descuidada lo dejaría. El límite se declara: el código no se regenera; con ingesta anónima no hay a quién probarle que la señal es suya.

**Regla 11 — «Los hechos se corroboran; los sueños y propuestas se deliberan.»** La dirección es un hecho sobre el mundo y se corrobora contra el registro del Estado. Y una frase vinculante que sale del renombre de §2.5: **`direccion_estado` es una afirmación sobre el CATÁLOGO, nunca sobre la señal.** No entra en `verificables` ni en `confirmaciones` de `brillo.ts`, y ninguna etiqueta derivada de él puede contener la palabra «verificada».

La otra mitad de la regla hay que decirla acá aunque no sea de esta spec, porque el barrido tiene que ser completo: **la deliberación no se construye en esta serie** (decisión del dueño del producto, D-037). El sistema sale con la corroboración blindada y la deliberación en cero, y se declara en pantalla sin eufemismo: *«Todavía no se puede deliberar. Por ahora un sueño sólo recibe adhesiones. Lo estamos construyendo.»* Nada de esta spec lo contradice y nada de esta spec lo repara.

**Reglas 3, 8 y 12 — no se tocan.** Esta spec no escribe bitácora ni reflexión personal (3), no crea facetas ni las comparte (12), y no reparte recompensas (8 — cuyo sujeto, las brasas, ya no existe: El Registro R7 las eliminó; su contenido, premiar utilidad, corroboración, cobertura difícil y resolución y no volumen bruto, sigue valiendo y nada de acá lo contradice). Se listan para que el barrido sea completo: uno que omite reglas sin nombrarlas no se distingue de uno que las olvidó, y es así como el ranking municipal de §7.4 casi pasa sin que nadie mirara la regla 7.

**Métrica norte — «Necesidades verificadas que alcanzan una resolución confirmada sin exponer a personas vulnerables.»** Esta spec empuja las dos mitades en direcciones opuestas y hay que decirlo así. Sube la primera: una necesidad con dirección normalizada es infinitamente más **accionable** que una con la etiqueta «Santa Fe» — accionable, no verificada: una dirección plantada es más específica y más falsa a la vez. Y sube el riesgo de la segunda: una dirección es una dirección. La respuesta es §2.6, y está en la base y no en el manual de estilo del equipo porque una costumbre se olvida en el tercer endpoint que escriba una señal. Y una consecuencia que sobrevive a la reconciliación: **una `necesidad` es siempre techo `solo_calle`**, así que la clase de señal que da nombre a la métrica es exactamente la que nunca lleva altura.

---

## §7 Lo que esta spec NO hace

### 7.1 Lo que le debe a `docs/specs/2026-08-11-b-la-senal.md`

Cinco obligaciones, dirigidas por documento y sección. Las cinco son bloqueantes para que §2.6 signifique algo.

1. **`senales` nace con `direccionColumns` adentro y con los nueve CHECK de §3.4, en la migración `0015`** — la misma que crea la tabla. Sin eso, §2.6 pasa a depender de que alguien llame a `ubicacionPublicable`, que es la costumbre que esta spec rechaza tres veces.
2. **El contrato de ingesta de `b-la-senal.md` §4.7 cita la secuencia numerada de §4.5** y hereda la guarda 5 de §8.1 («lo que no se publica no deja rastro, tampoco en el texto»).
3. **`ubicacion_origen` entra en ese contrato**, con el valor correcto y no con el default. `senales_origen_provincia_chk` impide la fila incoherente, pero impedir no es setear: si B escribe `province_id` sin origen, el INSERT falla — mejor que el silencio, peor que hacerlo bien.
4. **La pregunta de la casa se hace en los nueve tipos**, no en cuatro, y «es mi casa» mapea a `subject`+`moderate` (§2.6) mientras «es la casa de otra persona» y «sin respuesta» quedan en `subject`+`high` con `overridable: false`. El campo de dirección **no se enciende en la web** hasta que esa pregunta exista: sin ella todo es `subject`/`low` (§1.5).
5. **El cliente del paquete offline** (§4.3) se cablea en `apps/mobile`, en la rebanada de campo de B.

Y lo que A le presta a B: `ROL_POR_TIPO` de `capturas.ts:42` es el `Record` que hay que extender de 3 a 9, y los CHECK de §3.4 son el molde de cómo se cierra un dominio de texto en este esquema. **Un tipo nuevo mal mapeado a `subject` no expone nada; uno mal mapeado a `capture` sí.**

### 7.2 Lo que le debe a `docs/specs/2026-08-11-c-la-corroboracion.md`

- **El presupuesto conjunto es de C** (§3.5): el renglón del callejero está medido acá y entra en la suma de C §3.7, que es la que decide si el plan free alcanza. Esta spec no declara un techo de señales propio, porque un techo calculado sobre un solo renglón es un número tranquilizador y falso.
- **Lo que C no puede hacer:** mostrar la altura de una señal que no la tiene, recomponiéndola desde otra tabla ni desde el rastro. La fila no la tiene porque §2.6 no la dejó entrar, y una reconstrucción sería la fuga por la ventana después de haber cerrado la puerta.

### 7.3 Lo que le debe a `docs/specs/2026-08-11-d-el-registro-publico.md`

- **La altura no sale al registro público.** Ni en la API, ni en el CSV, ni en el JSONL, ni en el GeoJSON. Lo que sale es `direccionSinAltura(fila)` —el texto recortado a la calle— más `direccion_estado` y su etiqueta. Razón: una fila con dirección y sin punto es válida y emblemática (§4.6), y el piso de publicación de D se llavea en `lat`/`precision`, así que sobre esa fila no tiene sobre qué actuar; publicar la altura ubicaría en ~15 m justo en la clase de fila que el filtro por bbox nunca alcanza y el archivo mensual retiene para siempre. La altura queda para la superficie autenticada de coordinación, el único lugar donde esta spec argumenta que sirve. Si el producto decide publicarla igual, la palabra «altura» tiene que estar adentro del texto de consentimiento.
- **Una fila con dirección no puede etiquetarse «sólo declaró su provincia».** El bucket `sinPunto` de D se llavea en la fila entera y no en `lat`.
- **Los cinco niveles son los de §3.1**, tomados de una constante compartida: `('province','department','municipality','locality','settlement')`. `'city'` no existe y `'localidad'` en castellano nunca existió. **`settlement` no se publica como nombre de ciudad:** si `city_id` apunta a un asentamiento, D sube al `parent_id` (la localidad censal) y publica ése — el mismo movimiento que §4.3 hace para el paquete offline —, porque el nombre de un paraje de cuarenta casas es más fino que los 500 m del piso de publicación y entra por un campo de texto que el piso no mira. Y cuando corrió la protección, `city_id` apunta a un **departamento**: se rotula como departamento, nunca como ciudad.
- **`direccion_texto` se exporta tal como está guardado**, ya degradado por §2.6 y después recortado por `direccionSinAltura`. Nunca se recompone desde `calle_id` + `altura`: recomponer saltearía el degradado. Y **`ubicacion_origen` va en el volcado**: quien baje el CSV tiene derecho a saber que la provincia de una fila salió de un polígono de 29 vértices.
- **El volcado del catálogo geográfico es un dataset propio y bueno**, y el único publicable hoy con las tablas cívicas en cero: 21.345 lugares + 326.832 calles, con licencia, corte y procedencia. Prueba el formato antes de que haya algo en juego. **`geo_catalogo_version.corrida` es el número de versión** que su sobre tiene que citar — con el unique parcial de §4.7, no hay dos.
- **El «cerca tuyo» del feed es de D**, no de C: con `city_id` escrito, «mi localidad» y «mi departamento» son consultas exactas contra la jerarquía en vez de recortes de rectángulo, y la cabecera de cobertura puede citar `/api/v1/geo/version`.

### 7.4 D-004 y D-005: no se cierran, se parten. Y las dos deudas nuevas

**Cada una era dos deudas juntas. La mitad del catálogo se cierra:** las 529 filas de departamento y las 2.082 de municipio existen, con id del Estado, nombre y jerarquía, y una señal se puede atribuir a las dos **exactamente**, por catálogo, sin geometría de por medio (§2.7). **La mitad de la geometría queda abierta, y es la que da nombre a las deudas:** D-004 apunta a `apps/web/public/geo/` y dice «solo hay `provincias.geojson`», y sigue siendo cierto — no se puede dibujar un coroplético por departamento, ni hacer point-in-polygon por debajo de provincia, y el modo Análisis sigue con el escalón «departamento» deshabilitado.

**El ranking municipal de la Simulación se desbloquea para AGRUPAR, no para PUBLICAR.** D-005 lo declara bloqueado por falta de geometría, y `municipality_id` lo desbloquea sin un solo polígono. Pero agrupar no es publicar, y publicarlo hoy sería la regla 7 por la puerta de atrás (§6). Quien lo use tiene dos condiciones, nombradas:
1. **No hay población por municipio.** `poblacion.ts` solo tiene `PROVINCIAS_REF`, las 24, así que `habitantesDeCelda` devuelve `null` para cualquier municipio. Hasta que exista ese denominador, `brillo` devuelve `sinDenominador` y **no un número**: sin denominador el ranking mide quién tuvo tiempo y teclado, que es el enemigo declarado de la decisión 7 del proyecto.
2. **No hay supresión de grupo chico.** Es D-028 y sigue abierta. Con 2.082 municipios y las tablas en cero, la cabeza del ranking sería un municipio con una sola voz. Hay que suprimir por mínimo de voces distintas **antes** de pintar nada, y sobre los `ConteoCelda` que entran, no sobre las luces que salen. El umbral es uno solo y vive en `coeficientes-corroboracion.ts` (C).

**Lo que hay que editar en `docs/DEUDAS.md`** — ordinales reservados para A: **D-034 y D-035**. Se edita en un commit propio con ruta explícita (archivo compartido, sesiones concurrentes, D-010).
1. **D-004** pasa a «Falta la **geometría** de departamentos» y suma una línea: las filas existen desde esta spec. Severidad media, sin cambio.
2. **D-005** pasa a «Falta la **geometría** de municipios», y **baja de media a baja**, con la salvedad de las dos condiciones de arriba escrita en la entrada.
3. **D-011** suma la frase que la hace medible: `where ubicacion_origen = 'punto'` es el conjunto exacto de filas cuya provincia puede estar mal, y ahora es exacto de verdad porque un CHECK impide la fila con provincia y sin origen. Cuando entre geometría del IGN, ese `where` es el backfill.
4. **D-034** — nueva: *«El callejero es una foto y georef no tiene feed de cambios.»* Detectar deriva exige re-descargar una provincia entera y comparar el `hash_fuente`: 327 requests para saber si algo se movió. No hay `?desde=`. Mitigación: la re-siembra es barata en escrituras (cero filas si nada cambió) y cara en requests (~6 minutos), así que corre a mano y no en cron.
5. **D-035** — nueva: *«La dirección sólo se puede revocar con el recibo original.»* El código de `olvidarDireccion` es un HMAC del id que viaja en el recibo y no se regenera (§4.5): quien pierde el recibo pierde la revocación, y con ingesta anónima no hay a quién probarle que la señal es suya. Severidad baja: es el límite de un mecanismo que hoy no existe en ninguna otra columna del sistema, no una regresión. Se cierra el día que haya cuentas. **Reemplaza al D-035 que este documento tenía reservado** —«`direccionColumns` sin writer en `pulse_signals` y `proposals`»—, que se retira antes de nacer: esas tablas dejan de recibir escrituras y las columnas viven en `senales`, que nace con writer.

### 7.5 Lo que nadie hace y hay que saberlo

No hay geocodificación inversa: un punto no produce una dirección. Ninguna de las cuatro specs la trae, y traerla pediría la traza (§3.6). Consecuencia concreta: **una captura hecha con GPS y sin que la persona elija la calle se guarda con punto y sin dirección.** Es correcto — la alternativa sería adivinar en qué cuadra estaba parada.

**Y nadie puede llamar al piso por rol, porque no existe como símbolo importable.** La única función de §2.6 que sale del paquete es `direccionPermitida(tipo, role, sensitivity)`, de tres ejes. Quien escriba la ingesta (§7.1, obligación 2) no tiene a mano una versión de dos ejes a la que llamar por costumbre, y la tabla de techos por tipo se lee con `techoDeTipo`, nunca por índice. Está dicho acá y no sólo en §2.6 porque el defecto que lo motivó no fue de razonamiento sino de contrato: **la spec declaraba la función de tres ejes y la implementación le puso ese nombre a la de dos**, así que quien siguiera el documento al pie de la letra escribía la llamada segura y conseguía el comportamiento inseguro, sin un test rojo y sin nada que avisara.

---

## §8 Verificación

### 8.1 Las guardas, en el registro de `brillo-guardas.test.ts`

En `packages/civic-core/src/__tests__/direcciones-guardas.test.ts`, con la misma redacción de frase-afirmación:
1. **«el cero de georef nunca entra como altura»** — el normalizador del seed traduce los cuatro ceros a `RangoDeAltura.ausente`, y ningún camino produce `desde: 0` ni `hasta: 0`.
2. **«una calle sin rango no dice que la altura esté bien ni que esté mal»** — `clasificarAltura({tipo:'ausente'}, 1234)` → `'altura_sin_rango'`, y ese valor no es igual ni a en-rango ni a fuera-de-rango.
3. **«medio rango clasifica lo que puede y no clasifica lo que no»** — el caso `AV JUAN BAUTISTA ALBERDI` textual: `{tipo:'parcialHasta', hasta:3200}` con 4000 → `fuera_de_rango`; con 100 → `sin_rango`.
4. **«la dirección se retira cuando corrió la protección o cuando el tipo no la admite, no cuando falta el punto»** — property test sobre **(6 estados × 6 precisiones × 4 roles × 3 sensibilidades × 9 tipos × hayPunto)**. Cuatro afirmaciones: con rol `subject` nunca vuelve altura ni `texto_libre`; con rol `service_area` tampoco, cualquiera sea el tipo; con `coarsenedBecause !== null` vuelve `sin_direccion` **y** `cityId: null` con el departamento en su lugar; y **sin punto, con rol `capture` o `meeting_point` y sin protección, la dirección vuelve entera** — que es el caso emblemático de la spec (Córdoba, sin GPS, calle escrita a mano). El oráculo es el CHECK de §3.4: cada resultado tiene que satisfacer la disyunción de `senales_direccion_chk` y los cuatro CHECK de piso.
5. **«lo que no se publica no deja rastro, tampoco en el texto»** — con precisión engrosada, `componerDireccion` sobre la salida de `ubicacionPublicable` produce un texto **sin la altura**, con una fixture de calle cuyo nombre tenga números: `25 DE MAYO 1450` degradado da `25 DE MAYO`, no `DE MAYO`. Lo mismo para `direccionSinAltura` sobre una fila con altura guardada legítimamente. Por eso son funciones testeadas y no un regex en la base.
6. **«lo que no está en el callejero se guarda igual»** — un texto sin match, con rol `capture` y tipo de techo `completa`, produce `texto_libre` con el texto íntegro, no un descarte.
7. **«el mismo texto normaliza igual en el seed y en la consulta»** — fixture de 50 nombres: `normalizar(fila.nombre, [fila.categoria])` (el seed) == `normalizar(texto, todasLasCategorias)` (la consulta). Incluye el caso degenerado `nombre: "CALLE"` con `categoria: "CALLE"`, que no puede dar cadena vacía.
8. **«el prefijo de categoría no come una calle que empieza parecido»** — `AVELLANEDA` con categoría `AV` sigue siendo `AVELLANEDA`, en los dos lados: el corte es por token completo.
9. **«una provincia se sigue encontrando por su nombre después de la migración»** — las 24 filas, con los nombres exactos de `provincias.generated.ts`, contra `findProvinceByName` sobre `name_norm`. Es el camino de escritura que cerró D-001 y D-012; si falla, falla en silencio devolviendo `undefined`.
10. **«la etiqueta de dirección no usa la palabra de la regla 4»** — ninguna salida de `etiquetaDeDireccion` contiene «confirmada», «confirmado» ni «verificada».
11. **«todo nivel usado en un filtro está en el CHECK»** — la constante compartida de niveles (§3.1) y los filtros que la consumen se afirman contra el dominio de `geographic_locations_level_chk`. Es la guarda que caza el `level in ('city','localidad')` que devolvería NULL en silencio.

### 8.2 Las consultas después del seed

Se corren y se pegan en el reporte de la corrida. Ninguna admite «debería».
```sql
-- Los cinco niveles, con los totales verificados contra la API.
SELECT level, count(*) FROM geographic_locations GROUP BY level;
-- province 24 · department 529 · municipality 2082 · locality 4037 · settlement 14673
SELECT count(*) FROM geo_calles;                      -- 326832 ± el diff de la corrida

-- La reparación de §3.1: las tres tienen que dar 0.
SELECT count(*) FROM geographic_locations WHERE province_id IS NULL;
SELECT count(*) FROM geographic_locations g
  LEFT JOIN geographic_locations p ON p.id = g.province_id WHERE p.id IS NULL;
SELECT count(*) FROM geographic_locations WHERE level='province' AND province_id <> id;

-- La jerarquía de §3.1: ningún municipio cuelga de un departamento.  -- 0
SELECT count(*) FROM geographic_locations m JOIN geographic_locations p ON p.id = m.parent_id
  WHERE m.level='municipality' AND p.level <> 'province';

-- Ninguna calle huérfana, y el cero de georef no entró. Las dos, 0.
SELECT count(*) FROM geo_calles c
  LEFT JOIN geographic_locations l ON l.id = c.localidad_id WHERE l.id IS NULL;
SELECT count(*) FROM geo_calles WHERE altura_desde = 0 OR altura_hasta = 0;

-- LA cobertura: cuánto del país puede confirmar una altura. Se publica, no se esconde.
SELECT p.name,
       count(*) FILTER (WHERE c.altura_desde IS NOT NULL OR c.altura_hasta IS NOT NULL) AS con_rango,
       count(*) FILTER (WHERE c.altura_desde IS NULL AND c.altura_hasta IS NULL)        AS sin_rango
FROM geo_calles c JOIN geographic_locations p ON p.id = c.provincia_id
GROUP BY p.name ORDER BY sin_rango DESC;
-- Córdoba tiene que salir arriba de todo. Si no sale, la traducción del 0 falló.

-- El presupuesto de §3.5, medido y no estimado, y con el número que va a la suma
-- conjunta de C §3.7. `pg_total_relation_size` incluye heap MÁS todos los
-- índices: 48 + 61 (btree) + 45 (GIN) = 154, no 126.
SELECT pg_size_pretty(pg_total_relation_size('geo_calles'));       -- 154 MB (109 sin el GIN)
SELECT pg_size_pretty(pg_relation_size('geo_calles_nombre_trgm')); -- 45 MB
SELECT pg_size_pretty(pg_database_size(current_database()));       -- 201 MB
```

**El umbral que dispara un rediseño:** si `pg_total_relation_size('geo_calles')` pasa de **200 MB** (46 MB sobre el presupuesto, 30%), la primera palanca es normalizar los nombres a una tabla `geo_calle_nombres` de nombres distintos —el nomenclátor argentino repite muchísimo: San Martín, Belgrano, Sarmiento, 25 de Mayo— lo que achica el heap y hace que el GIN corra sobre decenas de miles de filas en vez de 326.832. No se hace ahora porque un join en el camino caliente del autocompletado cuesta más que 45 MB de un índice que podemos pagar. **El número medido acá se le entrega a C**, que es quien cierra la suma de los cuatro renglones contra el techo del plan.

### 8.3 La auditoría contra la fuente

24 llamadas a `GET /calles?provincia=<id>&max=1` leyendo `total`, comparadas contra `SELECT provincia_id, count(*) FROM geo_calles GROUP BY provincia_id`. Se corre **a mano después de cada siembra, nunca en CI**: un test que dependa de una API de terceros convierte una caída de georef en un build roto, y esta plataforma tiene el argumento de la soberanía del dato justamente para no depender de eso. Lo mismo con el progreso, filtrado por la corrida vigente: `SELECT * FROM geo_seed_progreso WHERE corrida = $vigente AND (estado <> 'completa' OR filas_escritas <> total_declarado)` tiene que devolver cero filas. Eso es «quedó completo», dicho con el conteo de la fuente y no con el nuestro.

### 8.4 Los tests de integración

Contra Postgres real, según el estándar de `v2/CLAUDE.md` (≥ 1 por endpoint nuevo):
- **`GET /api/v1/geo/calles`** — scope de localidad con `q` de un carácter; de provincia con `q` de tres; sin scope → 400; `limite=100000` → 400; `q=%` no devuelve la localidad entera; una `sin_nombre` no aparece y una con `vigente_hasta` tampoco.
- **`GET /api/v1/geo/calles/:id`** — sí devuelve la `sin_nombre` y la no vigente, con su marca. **`/version`** trae la cobertura por provincia y no un total pelado, y responde `no-cache`. **`/paquete/:corrida/localidad/:id`** y **`/departamento/:id`** — tamaño y `ETag`; un `settlement` resuelve al paquete de su localidad ancestro, y uno sin localidad al de su departamento.
- **`resolverUbicacion`** — las cinco vías en orden; `calleId` inexistente → 400 y no 500; punto que contradice la provincia de la calle → se guarda con `catalogo` y `discrepancia`; sin nada resoluble → `origen: 'ninguna'` con razón y `province_id` NULL. **Un test afirma explícitamente que no se guardó ningún centroide.**

Y los que necesitan una fila de señal, o sea que **corren con la migración `0015` y son definición de terminado de B**, listados acá porque la regla que prueban es de esta spec:
- **Los CHECK rechazan, cada uno con su INSERT directo sobre `senales`:** `calle` con altura · `altura_en_rango` sin `calle_id` · `texto_libre` con `calle_id` · `sin_direccion` con texto · altura con `precision='500m'` y punto · altura con `location_role='subject'` · altura con `location_role='service_area'` · `texto_libre` con `location_role='service_area'` · dirección con `subject`+`high` · `province_id` con `ubicacion_origen='ninguna'` · `direccion_texto` de 121 caracteres.
- **Una señal punta a punta:** elegir calle → `altura_sin_rango` en Córdoba → se guarda con el texto compuesto → el recibo dice por qué no se pudo afirmar.
- **El caso protegido:** señal con rol `subject` + dirección con altura → se guarda `direccion_estado='calle'` y `altura IS NULL`; con sensibilidad alta además → `sin_direccion` y `city_id` con el departamento. Un `saber` con altura → `calle`. El recibo lo explica en los tres casos.
- **El caso sin punto:** señal de tipo `basta`, rol `capture`, dirección con altura y **sin** `punto` → se guarda la dirección entera, `lat`/`lng` en NULL. Y esa misma fila, pedida por el registro público, sale **sin la altura** (§7.3).
- **Una dirección revocada no deja rastro, tampoco en el texto:** `DELETE /api/v1/geo/direccion/:idPublico` con el código del recibo deja la fila en `sin_direccion` con las cuatro columnas en NULL; un segundo pedido con el mismo código sigue siendo válido (es idempotente) y uno con código ajeno da 403.

### 8.5 Los tests de migración

- **Sobre base VACÍA:** migrar y después sembrar las 24 provincias termina con las 24 filas y `province_id = id` en todas. Es el caso que la migración rompe si `seed-provinces.ts` no reserva su id (§3.1), y el que un test sobre la base actual no ve.
- **Sobre una base con las 24 filas actuales:** después de migrar, los 24 `id` son los mismos (fijados por `iso_code`) y `province_id = id` en las 24.
- `DROP SEQUENCE geographic_locations_province_id_seq` no deja huérfano ningún default.
- **Re-sembrar sin cambios escribe cero filas:** se compara `n_tup_upd` + `n_tup_ins` de `pg_stat_user_tables` antes y después de una segunda corrida. Si escribe, el `WHERE` del `DO UPDATE` está mal y el argumento de almacenamiento de §3.5 se cayó.
- **Una recodificación no muta una calle en su lugar:** un `georef_id` que vuelve con otra localidad deja la fila vieja con `vigente_hasta` y su `id` intacto, y crea una nueva. Ninguna señal cambia de calle.
