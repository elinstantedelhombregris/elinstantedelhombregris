# C · La corroboración

**Serie:** cuatro specs · A la tierra · B la señal · C la corroboración · D el registro público
**Fecha:** 2026-08-11
**Migración:** `0016` (A emite `0013` y `0014` · B `0015` · D `0017`)
**Deudas que abre:** D-041, D-042, D-043
**Alcance:** `packages/db` (esquema y repositorios) · `apps/api` (`features/civic-map`, `features/evidencia`, cron de vigencia) · `packages/civic-core` (coeficientes, canonicalización, redondeo) · `apps/mobile` (el gesto de confirmar) · `apps/web` (el estado en la ficha y en el mapa)
**Documento vinculante:** `apps/mobile/docs/PRODUCT_CONSTITUTION.md` — reglas 2, 3, 4, 5, 6, 7, 8, 9, 11 y la métrica norte
**Se apoya en:** `docs/specs/2026-08-11-b-la-senal.md` §2.7 (la tabla `senales`), §3.1 (los catálogos `tipos_senal` y `estados_senal`) y §3.2 (la tabla `actores`) · `docs/specs/2026-08-04-el-registro.md` §4, §6 y §7 · `docs/specs/2026-07-26-mapa-2-la-verdad-de-la-ubicacion.md` §3 · `docs/DEUDAS.md` D-014, D-026, D-028 (la segunda entrada con ese id)
**Naturaleza:** spec de producto y de datos. Necesita plan de implementación antes de tocar código.

> **Qué resuelve.** Cómo un dicho se vuelve un hecho comprobado: quién confirma, cuántos hacen falta, qué cuenta como independiente, dónde vive la evidencia, cómo envejece un hecho, cómo se conecta con lo que podría resolverlo, cómo se cierra una necesidad, y cómo queda escrito todo eso de manera que se pueda auditar sin exponer a nadie. Al terminar esto, `verificables` y `confirmaciones` —los dos números que `brillo.ts` pide desde julio y que ninguna tabla sabe producir— existen en la base y se consultan por celda, y la métrica norte pasa de ser una frase a ser una consulta.
>
> **Qué NO resuelve.** El vocabulario de los tipos, la tabla `senales`, el actor y la adhesión (spec B). El callejero y la jerarquía territorial (spec A). El feed, la API abierta y el volcado (spec D). Esta spec construye la máquina de estados encima del vocabulario de B; no lo inventa.
>
> **Y una cosa que no se construye y se declara:** la deliberación. La regla 11 se cumple entera del lado de corroborar y a la mitad del lado de deliberar, y el producto lo dice en pantalla (§6).

---

## §1 El problema

### 1.1 La regla 4 no tiene una sola línea de código

La Constitución dice, textual: *«Una señal siempre muestra su estado de calidad: borrador, enviada, por verificar, corroborada, resuelta o desactualizada.»* No existe. Lo verificable en el árbol hoy:

- `packages/db/src/schema/dreams.ts:34-35` — `status text not null default 'approved'`, con el comentario `'pending' | 'approved' | 'rejected'`. Eso es **moderación**, no calidad: el default es `approved`, o sea que nadie modera, y ninguno de sus tres valores es uno de los seis de la regla 4. B retira esa columna con la tabla; no hay nada que preservar.
- `packages/db/src/schema/pulso.ts` — `proposals.status` corre `'draft|voting|accepted|rejected|archived'`, que es un ciclo de **deliberación**. Tercer eje. `pulse_signals` no tiene estado ninguno.
- `packages/civic-core/src/coverage.ts:48-51` y su `CoverageStatus` de siete valores (`'unknown' | 'assigned' | 'visited_empty' | 'observed' | 'contested' | 'corroborated' | 'stale'`) es el estado de una **celda**. Comparte dos palabras con la regla 4 y no es lo mismo. Confundirlas sería el error más caro de este documento.

El único precedente de transición auditada del repo es `proposal_status_history`, y lo escribe `setProposalStatus` (`packages/db/src/repositories/pulso.ts:113-122`), una función que ningún endpoint HTTP llama.

### 1.2 `brillo.ts` pide números que la base no sabe contar

`packages/civic-core/src/brillo.ts:21-35` declara `ConteoCelda` con `cellId`, `vocesDistintas`, `habitantes`, `verificables` y `confirmaciones`. `nitidezDeCelda` (línea 87) divide uno por el otro y devuelve `inaplicable` cuando el denominador es cero. La fórmula está escrita, testeada y compartida por dos apps. Y **no hay tabla de confirmaciones en `packages/db`**, ni columna de corroboración en ninguna tabla de señal. El eje de nitidez del mapa está calculado sobre datos que no existen.

Peor: el único puente que sí existe, `apps/mobile/src/civic/conteos.ts:47-52`, cuenta `confirmaciones` como `verificables.filter((s) => s.confirmada).length` — es decir **señales confirmadas**, no eventos de confirmación. El comentario de `brillo.ts:34` se lee como eventos. Las dos lecturas dan números distintos y sólo una mantiene `nitidez ≤ 1` sin que el `Math.min(1, …)` de la línea 93 tenga que tapar nada. Nadie decidió cuál es. Esta spec decide (§2.8).

### 1.3 La única lógica de corroboración que existe vive en el teléfono y es un literal

`apps/mobile/src/civic/quality.ts:35`:

```ts
status: confirmations >= 2 && corrections === 0 ? 'corroborated' : 'needs_review',
```

Ese `2` es el umbral de corroboración de todo el sistema, escrito una vez, en un archivo de la app de campo, sin justificación al lado y sin viajar al servidor. Y quince líneas más arriba (`quality.ts:20`) el archivo hace lo que `brillo.ts` existe para prohibir: `return { confidence: 0, status: 'unsafe', … }`. `confidence: 0` no significa «medimos y dio cero» sino «se apartó del circuito y no tiene confianza definida». Es un `0` para decir «no sé», en el módulo que decide si un hecho está comprobado (D-041).

### 1.4 El rastro no se puede seguir

Ninguna transición, ninguna corrección, ningún reintento deja registro. `dreams.updated_at` tiene `default now()` y **ningún trigger** (`packages/db/src/schema/dreams.ts:37-39`): en la práctica es una copia de `created_at`. Y la fuga de identidad que hoy publica el UUID estable del teléfono como nombre de autor (`capturas.ts:134-136` → `open-data/routes.ts:69`) la cierra B en la misma migración que mata `marcaDeCaptura`; esta spec la hereda cerrada y la verifica (§7).

### 1.5 No hay transacciones, y eso cambia el diseño

Verificado en `node_modules`: `drizzle-orm/neon-http/session.js:138` y `:144` lanzan `Error("No transactions support in neon-http driver")`. `packages/db/src/client.ts:20` construye el cliente con `drizzle-orm/neon-http`. **`db.transaction()` no existe en este repo.** Lo que sí existe es `db.batch()` (`neon-http/driver.js:60`), que empaqueta consultas ya construidas en una sola transacción HTTP pero **no deja usar el resultado de una como entrada de la siguiente**.

Eso ya produjo un defecto vivo: `castVote` (`packages/db/src/repositories/pulso.ts:126-148`) hace `DELETE`, `INSERT` y recálculo del agregado en tres sentencias sin transacción y sin único sobre `(proposal_id, user_id)`, así que dos pestañas dejan dos votos de la misma persona y un `vote_count` mentiroso. Es el precedente más parecido a una confirmación que hay en el sistema, y está mal implementado. Toda escritura de esta spec que tenga que ser atómica se escribe **en una sola sentencia** —con CTEs modificantes, con `ON CONFLICT`, o con un índice único que arbitre— y nunca copiando ese patrón.

### 1.6 La desactualización, la resolución y la conexión no existen en ninguna forma

La Constitución nombra «revisión de vigencia» en el piloto de luminarias y pone la resolución confirmada en la métrica norte; el ciclo soberano nombra Tejer. En el esquema no hay ni una fecha de vencimiento, ni un estado terminal, ni un enlace entre una necesidad y lo que podría resolverla. Un pozo tapado hace seis meses sigue dibujado como pozo, una olla que dejó de funcionar sigue mandando gente a una puerta cerrada, y un `recurso` es un tipo que se escribe, se adhiere y no se conecta con nada — una captura sin destino por diseño, en un producto cuya frase vinculante es que una captura sin destino no es éxito.

---

## §2 La decisión

### 2.1 Confirmar es que otra persona diga «sí, está», y declare desde dónde

Una confirmación es un acto con cuatro partes, y las cuatro se guardan:

1. **Quién** — un actor seudónimo distinto del autor y distinto de cualquier otro confirmante de esa misma ronda.
2. **Qué dijo** — uno de los seis veredictos que `apps/mobile/src/civic/verification-provenance.ts:71-120` ya escribió en castellano rioplatense y con su consecuencia declarada: `confirm`, `correct`, `duplicate`, `stale`, `unsafe`, `cannot_verify`. **No se inventa vocabulario nuevo: se cierra el que ya está redactado, y los seis tienen consecuencia en §2.6.** Cerrar una resolución no es un séptimo veredicto: es otra ronda en otra tabla (§2.7).
3. **Cómo lo sabe** — uno de los cinco métodos de `verification-provenance.ts:28-69`. El método es procedencia **con peso**: sólo `saw_now` y `field_visit` suman al umbral cuando la señal tiene punto. `know_place` y `checked_source` se registran con `cuenta = false` y aparecen en la ficha con su procedencia; `cannot_verify` nunca suma, y un `CHECK` cruzado impide la fila absurda «lo confirmo y no tengo cómo comprobarlo».
4. **Desde dónde** — la proximidad al punto publicado, como categoría, nunca como punto, y **con su procedencia**: la ubicación la declara el cliente y el servidor no la puede atestar (§2.3).

**Dos confirmaciones independientes pasan un hecho de `por_verificar` a `corroborada`.** Por qué dos y no otro número:

- **Dos ya es la regla del sistema.** `apps/mobile/src/civic/quality.ts:35` la escribió y 398 tests corren encima. Cambiarla acá reinterpretaría en silencio todo lo que ese archivo afirma.
- **Uno no es corroboración, es un par.** El autor más un confirmante son dos aparatos, y El Registro §6 ya aceptó por escrito la debilidad de que *una persona con dos teléfonos cuenta dos veces*. Con dos confirmantes hacen falta tres actores distintos, y cada actor de campo cuesta una instalación con su secreto propio. **Lo que el umbral NO compra: presencias.** La puerta de proximidad no atesta nada (§2.3), así que falsificar cuesta aparatos, no desplazamiento. Decirlo al revés sería inflar la garantía.
- **Tres es inalcanzable el día uno.** Hoy las tablas cívicas están en cero. Con base de confirmantes chica, un umbral de tres deja `confirmaciones = 0` para siempre, y `brillo.ts:89-95` dice que cero nitidez significa «hay hechos sin confirmar»: el mapa afirmaría que nada se comprobó nunca, que es falso y desmoralizante. Dos es el número más chico que no es un par y el más grande que se alcanza sin usuarios.
- **El umbral no se congela: se sella.** Vive en `packages/civic-core/src/coeficientes-corroboracion.ts` con su razón escrita al lado, igual que `COEFICIENTES_LUZ`. **El valor que juzga una corroboración es el que quedó estampado en el evento `transicion` del rastro**, y ésa es la única fuente autoritativa: `confirmaciones.umbral_vigente` se guarda por fila para auditar la fila, no para juzgar la señal. Subirlo a tres mañana no reescribe la historia.
- **Qué lo cambiaría.** Cuando existan 1.000 corroboraciones reales se audita a mano una muestra en campo. Si más del 5% de los hechos corroborados no resiste la auditoría, sube a tres. Ese es el disparador, escrito antes de tener el dato.

### 2.2 Qué cuenta como independiente, sin fingerprinting

Se descarta de entrada cualquier cosa que huela a huella de dispositivo: no se guarda IP, ni user-agent, ni resolución de pantalla, ni fuentes, ni canvas, ni nada que la persona no haya elegido darnos. La regla 9 pide consentimiento *comprensible y revocable*, y una huella no es ninguna de las dos cosas.

Lo que sí se hace, y lo que **no**:

| Criterio | Cómo se garantiza | Qué NO garantiza |
|---|---|---|
| No es el mismo actor dos veces | Índice único `(senal_id, ronda, actor_id)` | Que dos `actor_id` sean dos personas |
| No es quien cargó la señal | `s.actor_id IS DISTINCT FROM $actor` en la misma sentencia, **más** `s.actor_id is not null`: una señal sin autor atribuible no entra al circuito de corroboración | Que el autor no tenga un segundo aparato |
| Declaró estar cerca del hecho | Puerta de proximidad server-side (§2.3) | **Nada, si el cliente miente.** La posición es declarada, no atestada |
| Sybil | No se impide: se encarece y se declara | Que no existan. Un actor de campo cuesta una instalación con secreto propio; en la web, un perfil de navegador |
| No son dos personas del mismo hogar | **No se intenta** | — |

**Una señal sin actor sigue siendo una señal.** Se descartó el `CHECK` que exigía actor para todo hecho: prohibía cargar un `¡basta!` desde un navegador que rechaza cookies, castigaba con un `INSERT` fallido a quien tiene el navegador más cerrado, y dejaba en `NULL` la comparación del autor para los actos, que sí admitía. La guarda que ese `CHECK` buscaba la da mejor la regla de B (`docs/specs/2026-08-11-b-la-senal.md` §4.3): las señales sin actor no entran al circuito de corroboración en absoluto, se cuentan aparte en `senalesSinActor`, y toda comparación de actor se escribe con `IS DISTINCT FROM` y nunca con `<>`.

**El hogar no se puede detectar sin fingerprinting, así que no se detecta.** Dos personas del mismo hogar que confirman el mismo pozo son dos miradas independientes en el único sentido que el sistema puede sostener honestamente: dos aparatos, dos decisiones. Se declara como debilidad conocida, con la misma disciplina con la que El Registro §6 declaró la de los dos teléfonos: *se documenta, no se disimula*.

**El actor, en dos piezas, y la de afuera se puede tirar.** Toda fila que necesita saber «la misma persona» lleva `actor_id bigint` —un subrogado sin significado— y el seudónimo criptográfico vive en **una sola tabla lateral**, `actores`, que **crea B** (`docs/specs/2026-08-11-b-la-senal.md` §3.2) en la migración `0015` con la estructura de esta spec más el `user_id` con unique parcial que la decisión 7 necesita:

```
actor_hash = HMAC-SHA256(ACTOR_PEPPER, actor_key)     // 32 bytes, sólo en `actores`
```

- `actor_key` es lo que ya emite `apps/mobile/src/civic/identity.ts:32` para las instalaciones que existen; **desde el enrolamiento nuevo la emite el servidor** (256 bits, §4.8). La web gana su equivalente: cookie httpOnly `basta_actor`, `SameSite=Lax`, 128 bits, un año.
- **Se pregunta antes de plantarla, con un solo texto.** El consentimiento del identificador es **una constante compartida en `packages/shared/src/open-data/`**, la misma que D exporta para la publicación y el volcado (`docs/specs/2026-08-11-d-el-registro-publico.md` §7.3.4). Tres pantallas distintas antes del mismo submit es la manera de que ninguna se lea; esta spec no escribe su propia redacción y la importa.
- **Se puede tirar, y en las dos superficies.** La rotación expira la cookie y emite otra —es httpOnly y ningún script de la página la puede borrar, así que es un endpoint y no un botón de JavaScript—; en el teléfono es `resetCivicActorKey`. Y hay un segundo grado: **retirar** pone en `null` el `actor_hash` y el `secreto_hash` de la fila. Después de eso nadie —ni con la base entera y el pepper en la mano— puede volver de una `actor_key` a las filas de esa persona; el subrogado queda y los conteos históricos no se rompen. Es lo que hace que «revocable» sea cierto y no una figura: el rastro es append-only, pero **el vínculo con la persona no vive adentro del rastro**. Y se le dice lo que pasa: *«tus voces anteriores siguen contadas, pero desde ahora vas a contar como otra persona»*. Ocultarlo sería más cómodo y sería mentir. Retirar **lo escrito** es otra cosa y la hace B: `estado = 'retirada'`.
- `ACTOR_PEPPER` es secreto de entorno (`apps/api/src/lib/config.ts`), **nunca en la base**. `actor_hash` **no sale nunca**: ni en una respuesta, ni en la descarga masiva, ni en una línea de log — y tampoco `actor_key` ni `deviceSecret`, que van en la lista de redacción del logger. Rotar el pepper destruye la distinguibilidad histórica, así que cada fila lleva `pepper_version`; los conteos van por `actor_id` y no lo sufren.

### 2.3 La puerta de proximidad, y lo que no compra

Una confirmación suma al umbral **sólo si el aparato declara una ubicación dentro del radio de confirmación del punto publicado**:

```
radio = 150 m + publicLocationUncertaintyKm(precision_publicada) × 1000
```

- Los 150 m salen de una cuenta: el error típico de GPS de consumo en calle abierta es de 5 a 15 m y se degrada a ~100 m entre edificios altos; la manzana estándar del damero argentino mide 100 m de lado (110 m en CABA). 150 m es *una cuadra y media*: alcanza para confirmar una luminaria desde la esquina de enfrente y no alcanza para confirmarla desde otro barrio.
- El sumando de incertidumbre reusa `publicLocationUncertaintyKm` de `packages/civic-core/src/geo.ts`, que es exactamente la función con la que el servidor decidió cuánto correr el punto. Si el punto se publicó a 500 m, exigir 150 m sería exigirle a la persona una precisión que el propio sistema le borró.
- **Es una fricción de honestidad, no un control.** El punto lo manda el cliente en el cuerpo del POST y el servidor lo compara contra el punto publicado, que quien confirma ya tiene. Falsificar «estuve ahí» es copiar dos números. Por eso la fila guarda `proximidad_procedencia = 'declarada_por_cliente'` y **todo texto de cara al usuario dice «declaró estar en el lugar», nunca «estuvo»**. Una puerta con dientes pediría atestación de app (Play Integrity / DeviceCheck), que atesta la app y no a la persona y por lo tanto no viola la regla 9 — pero es una dependencia nueva y necesita ADR. Mientras no exista, la puerta es blanda y está escrito que lo es.
- **La ubicación del confirmante no se guarda.** Se compara en memoria y lo que queda en la fila es una categoría: `en_el_lugar`, `lejos`, `no_declarada`, `inaplicable`. Ni el punto, ni los metros, ni un bucket de distancia — un `<50m` contra un punto `exact` es una ubicación más fina que la que la política le concede a un `subject`. Y el instante se guarda redondeado por **la única regla de redondeo del sistema** (§2.11): hora por defecto, día cuando `sensitivity = 'high'`.
- Si la persona no da ubicación, la confirmación **se registra igual** —es una segunda mirada y el rastro vale— pero con `proximidad: 'no_declarada'` y `cuenta = false`. No es cero: es una tercera categoría con nombre.
- Señales sin punto (precisión `province`) no tienen puerta: la proximidad es `inaplicable` y la confirmación cuenta. Una necesidad provincial no se comprueba parándose en un lugar.

### 2.4 La máquina de calidad, sobre la columna que fija B

El estado vive en una sola columna de `senales`, y su vocabulario lo fija el catálogo `estados_senal` de B (`docs/specs/2026-08-11-b-la-senal.md` §3.1) con **FK compuesta `(estado, clase)`**: cada clase admite exactamente los estados que le corresponden, y el par que no existe no se puede insertar.

Esta spec **no declara ningún `CHECK` de enum paralelo**. Se descartaron los dos que tenía —el de los cinco valores y el que clavaba a `deseo` y `meta` en `enviada`—: la FK compuesta expresa lo mismo con más precisión, sin el agujero de `NULL or false` que hacía pasar un `CHECK` sobre una `clase` nullable, y sin rechazar dos valores que el sistema necesita. `retirada` es la única reparación que la regla 9 tiene para cuando la exposición ya ocurrió, y `no_cumplida` es lo que impide que la consulta de la métrica norte sume un compromiso incumplido con una necesidad resuelta. Los dos son de B; C no los produce y no los estorba.

Lo que esta spec sí decide es **el recorrido de calidad**:

```
                    ┌──── corrección neta ────┐        ┌── stale ×2 ──┐
                    │                         │        │              │
  (borrador)  →  enviada  →  por_verificar  →  corroborada  →  resuelta
   teléfono        ↑              ↑  ↑              │              │
   nunca sale      │  publicación │  └── revisión ──┘              │
   del aparato     │              │      de vigencia               │
                   │              └──── confirm sobre ──────┐      │
                   │                                        │      ↓
                   └────────────────────────────→  desactualizada ←┘
```

- **`borrador`** vive sólo en el teléfono. Es la regla 1 (offline-first). Nunca llega al servidor y el servidor nunca lo escribe: no está en `estados_senal`, y que no exista en la base es la garantía, no una omisión.
- **`enviada`** es «llegó y la aceptamos», antes de estar mirable por terceros. **Su salida es una regla, no una intención:** una señal pasa a `por_verificar` cuando (a) tiene provincia resuelta server-side y (b) su evidencia terminó de procesarse, o no tiene evidencia. Cuando las dos ya se cumplen al llegar —el caso normal— lo hace **la misma sentencia del ingreso**, así que una voz de campo sin evidencia queda mirable por terceros en el mismo POST. Las que quedan esperando un blob las destraba la pasada 5 del cron (§4.9). Sin esta regla escrita, toda señal nace y muere en `enviada` y la nitidez del país entero es `inaplicable`. El `POST /senales/:idPublico/segunda-mirada` de B (`§4.3`) es otra cosa y no colisiona: sirve para **reabrir una `corroborada`**, no para publicar lo que ya llegó completo.
- **`por_verificar`** es «publicada, pidiendo un segundo par de ojos». Es la cola de trabajo de la app: lo que alimenta el *«¿sigue así?»* de El Registro §5.2 — **con una exclusión**: las señales con `sensitivity = 'high'` siguen en `por_verificar` y siguen siendo corroborables por quien ya las conoce, pero **no se reparten como tarea a desconocidos** y sólo admiten métodos `know_place` y `checked_source`. La llave es la sensibilidad sola y no el par rol + sensibilidad: la sensibilidad alta ya declara que hay una persona identificable, y el rol gobierna el punto, que es otro eje. Mandar gente a verificar en el lugar la carencia de un hogar identificable es la exposición que el resto de la spec desarma con tanto cuidado.
- **`corroborada`** es alcanzar el umbral con `confirm` contados **y sin corrección neta vigente**: `corrects contados ≥ confirms contados` en la ronda impide la transición.
- **`resuelta`** es el cierre del ciclo (§2.7). **No es terminal:** tiene vida útil propia (180 días) y al vencer vuelve a `por_verificar` con motivo `revision_de_resolucion`. Dos `stale` la devuelven a `por_verificar` con `ronda + 1` y ponen la resolución en `retirada`. Marcar resuelto lo que no lo está no puede ser permanente: sería la herramienta perfecta para borrar un pozo del mapa. Una `meta` también llega a `resuelta`, cuando la respuesta que la contesta se corrobora: la operación `responder(pregunta, hecho)` de B no tiene otro destino, y una pregunta contestada que dijera «enviada» sería la regla 4 mintiendo.
- **`desactualizada`** es «esto ya no está», y llega por caminos que **nunca se escriben con la misma palabra** (§2.6). Un `confirm` la devuelve a `por_verificar` sin subir la ronda: reabrir la pregunta no es afirmar la respuesta.

**Quién corre la máquina.** Los **hechos** y los **actos**. Un `compromiso` corre `enviada → por_verificar → corroborada` (alguien vio que se cumplió) `→ resuelta`; los pares `('por_verificar','acto')` y `('corroborada','acto')` tienen que existir en `estados_senal` o ningún compromiso alcanza jamás un estado confirmable y el desenlace se queda en `abierto` para siempre, sin error y sin aviso (§7). «Vencido» y «no cumplido» los escribe B con su desenlace y con `motivo`, cuyo vocabulario cerrado es el de §2.6. Los **deseos** no corren la máquina de corroboración: se deliberan (regla 11), y esa mitad **no se construye** — se declara en pantalla (§6).

### 2.5 Lo que se afirma es un hecho vigente, no un hecho eterno

Un hecho nace con dos relojes, los dos derivados de su tipo y **los dos seteados al publicar** (`enviada → por_verificar`), no al corroborarse:

| Reloj | Qué hace | De dónde sale |
|---|---|---|
| `vence_el` | Cumplido, la señal **vuelve a `por_verificar`** con motivo `revision_de_vigencia` y entra a la cola del *«¿sigue así?»* | `publicada_en + vida_util(tipo)`, y se recalcula desde `corroborada_en` cuando se corrobora |
| `caduca_el` | Cumplido sin que nadie haya vuelto a mirarla, pasa a **`desactualizada`** con motivo `caducidad_por_silencio` | `vence_el + gracia(tipo)` |

Se descartó el «NULL mientras no esté corroborada». Sonaba honesto —no inventar una fecha para algo que nadie comprobó— y abría el agujero peor: una señal que llega a `por_verificar` y no recibe ninguna confirmación no tenía ningún reloj, afirmaba para siempre, y seguía contando en el denominador de `verificables` de su celda bajándole la nitidez al barrio indefinidamente. Un hecho que nadie miró **también** envejece; de hecho es el que más necesita envejecer.

| tipo | vida útil | gracia | por qué |
|---|---|---|---|
| `basta` | 90 d | 45 d | Un desperfecto de vía pública se repara en semanas o meses; 90 días es el trimestre, el ciclo presupuestario más corto de una comuna. |
| `necesidad` | 180 d | 90 d | Una carencia estructural no cambia en un trimestre, y quien la sostiene suele ser la persona afectada: repreguntarle cada 90 días es desgaste sin ganancia de verdad. |
| `recurso` | 30 d | 15 d | Una olla o un punto de entrega puede dejar de funcionar el mes que viene, y un recurso vencido manda gente a una puerta cerrada. El daño es inmediato y físico. |
| `práctica` | 180 d | 90 d | Lo que un barrio hace tiene la inercia de una costumbre, no la de una lamparita. |
| `saber` | 365 d | 182 d | Un oficio no se pierde en un trimestre. Preguntarle a alguien cada tres meses si sigue sabiendo soldar es una falta de respeto y no agrega verdad. |
| `compromiso` | del plazo que declara | 30 d | Un acto trae su propia fecha (spec B). Vencida, y con la gracia consumida, cierra con su desenlace. |
| *(resuelta)* | 180 d | 90 d | Una resolución también envejece: lo que se arregló se puede volver a romper. |

La gracia es **el 50% de la vida útil** en todos los casos, uniforme a propósito: mantiene constante la relación entre las dos, así que subir una vida útil sube su gracia sin abrir una segunda discusión. Los plazos fijos por clase que esta tabla no cubre —`deseo` 730 d y `meta` 365 d— los decide B y viven en la **misma** constante, `coeficientes-corroboracion.ts`, para que nadie tenga que buscar en dos archivos cuánto dura algo.

**Vencerse no es desactualizarse.** Una señal vencida está diciendo la verdad: *nadie volvió a mirar esto*. Su nitidez baja, y eso es correcto — el conocimiento del mapa decayó y el mapa lo dice. Confundir «alguien fue y ya no está» con «nadie fue a fijarse» sería la versión temporal del `0` que significa «no sé», y este repo tiene un módulo entero escrito para no hacer eso.

### 2.6 Los seis veredictos tienen los seis su consecuencia

| Veredicto | Umbral | Consecuencia | Reversible |
|---|---|---|---|
| `confirm` | 2 contados | `por_verificar` → `corroborada`. Sobre una `desactualizada`, la devuelve a `por_verificar` (reabrir no es afirmar) | Sí |
| `correct` | neto: `corrects ≥ confirms` de la ronda | `corroborada` → `por_verificar`, `ronda + 1`, motivo `correccion`. **Exige `nota`** (`CHECK`) | Sí |
| `stale` | 2 contados | → `desactualizada`, motivo `ya_no_esta`. Sobre una `resuelta`, además retira la resolución | Sí: dos `confirm` nuevos |
| `unsafe` | **1** | **Retiene**: la señal sale de `/map/signals`, de `/map/cells`, de la cola de verificación **y del registro público de D** —feed, recurso individual, API abierta y volcado—, con evento `retencion_por_exposicion`. **No cambia el `estado`** — la retención es visibilidad, no calidad — y abre una revisión humana con plazo de 72 h que la reactiva o dispara `redaccion` | Sí, por revisión humana |
| `duplicate` | 2 contados | Marca a la señal como candidata a duplicado y alimenta la conexión `duplica` de §2.14. **No mueve el estado**: fusionar o no es una decisión humana | Sí |
| `cannot_verify` | — | Se registra, `cuenta = false`, no suma ni resta. Es lo que su propio texto promete: «deja constancia de que hace falta otra mirada» | — |

**El uno de `unsafe` está elegido con el filo a la vista.** Esperar dos es esperar a que el daño se duplique, y `unsafe` es el único canal por el que alguien puede decir «esto expone a una persona» — la mitad literal de la métrica norte. Pero una asimetría de uno también es una palanca de censura, y no se disimula: retener **no borra, no cambia el estado y es reversible**, toda retención abre una revisión con plazo, y el rastro guarda quién la disparó. El costo de un abuso son 72 horas de ocultamiento; el costo del error inverso es exponer a una persona. Se elige el primero.

**Y la retención tiene que llegar al archivo, o no sirve para nada.** El volcado de D es la superficie más difícil de deshacer: los cortes mensuales se firman con sha256 y son irrevocables hacia atrás. Una retención que apaga el mapa y deja la señal en el CSV es la métrica norte rota en su segunda mitad por omisión de una línea. Por eso es una obligación con nombre en §7, y por eso la pasada 4 del cron corre **antes** que el cron del volcado en el orden del día.

Y la desactualización llega por caminos que quedan distinguidos, porque la métrica norte depende de no mezclarlos. El vocabulario de `senales.motivo` es cerrado y lo fija esta spec: `ya_no_esta`, `caducidad_por_silencio`, `correccion`, `revision_de_vigencia`, `revision_de_resolucion`, `compromiso_vencido`, `compromiso_incumplido`. Un hecho que *se resolvió* y un hecho que *se cayó del mapa por olvido* son cosas opuestas.

### 2.7 La resolución: quién la declara, quién la cierra

La métrica norte, textual: *«Necesidades verificadas que alcanzan una resolución confirmada sin exponer a personas vulnerables.»* Y el ciclo soberano: *«Una necesidad no se considera resuelta hasta que el resultado se confirma.»* El cierre tiene tres piezas:

1. **Alguien propone la resolución.** Cualquiera —quien la resolvió, quien pasó y la vio resuelta, quien coordinó— emite una *afirmación de resolución*. Eso **no cambia el estado**: escribe una fila en `resoluciones` con estado `propuesta` y un evento en el rastro. Quien resuelve no cierra. **Sólo se acepta sobre una señal `corroborada`** (o una `desactualizada` que volvió por confirmación): la métrica norte dice «necesidades **verificadas**», y cerrar algo cuya existencia nadie corroboró contaría que se resolvió sin haber contado que existía.
2. **Dos personas independientes confirman el cierre**, con la misma puerta y el mismo umbral. **Es su propia ronda en su propia tabla, `confirmaciones_de_resolucion`**, y no un veredicto más de `confirmaciones`: no hay ni habrá un veredicto `resuelta` —el catálogo de `verification-provenance.ts` tiene seis y esta spec no lo amplía—, el índice único de la corroboración no colisiona con el del cierre, y las mismas dos confirmaciones que corroboraron el hecho no sirven de confirmaciones de su cierre. Simetría deliberada: cerrar cuesta lo mismo que abrir, y cuesta aparte. Con tres identidades gratis alguien propone y confirma un cierre falso, y como `resuelta` está en el numerador **y** en el denominador de la nitidez (§2.8), cerrar en falso además ilumina la zona: por eso dos, por eso aparte, y por eso `resuelta` no es terminal.
3. **La palabra de quien la cargó, cuando se le pudo preguntar.** Si la necesidad tiene autor identificable, su confirmación es requisito — es la persona a la que le faltaba la cosa. **Y acá el autor sí confirma lo suyo**: la exclusión del autor rige la corroboración del hecho, no el cierre.

Y acá no se devuelve `0` ni `false` para decir «no sé»:

```ts
type PalabraDelAutor =
  | { tipo: 'confirmo'; en: string }
  | { tipo: 'no_hay_autor_identificable'; razon: string }   // carga sin actor, o actor retirado
  | { tipo: 'no_hubo_como_preguntar'; razon: string }       // hay autor y no llegó la pregunta
  | { tipo: 'sin_respuesta'; desde: string; venceEl: string }
  | { tipo: 'pendiente'; desde: string };
```

**El reloj arranca con la entrega, no con la propuesta.** El autor es un `actor_id`: no hay cuenta ni mail. `autor_vence_el` se setea **en el primer intento de entrega efectivo** —push a un dispositivo enrolado, o el primer render de «tenés una pregunta pendiente» cuando esa cookie vuelve—, nunca en `propuesta_en`. Mientras no haya entrega, `autor_estado` se queda en `pendiente`, y si a los 90 días de la propuesta no hubo ninguna, pasa a `no_hubo_como_preguntar` y la resolución cierra **en su propio bucket**. Sin esto, `sin_respuesta` no significa «le preguntamos y no contestó» sino «nunca tuvimos cómo preguntarle», y ése es exactamente el `0` que quiere decir «no sé» metido adentro de la métrica norte.

Los **30 días** de espera del autor: es la ventana más chica que sobrevive a perder un teléfono o a estar sin datos unas semanas, y es del mismo orden que la vida útil más corta del sistema (`recurso`, 30 días), así que el producto tiene un solo «un mes» y significa una sola cosa. Cumplido el plazo, la resolución cierra y **el bucket queda separado para siempre**: la métrica norte se reporta como cuatro números con nombre, jamás como un total. Un total escondería precisamente la pregunta que importa —¿le preguntamos a la persona afectada?— y eso es lo que la métrica norte existe para no dejar esconder.

**Qué la resolvió.** La resolución se enlaza con la señal que la produjo: `enlazada` (un compromiso cumplido, una práctica), `resuelta_por_un_tercero` con nota (el municipio tapó el pozo), o `sin_enlace`. `resuelta_por_un_tercero` no es un caso residual: la mayoría de los pozos los tapa el Estado, y fingir que hubo un compromiso en el sistema sería inventar un dato. **Y cuando no hay autor identificable, `sin_enlace` no se acepta**: cerrar sin autor obliga a decir *qué* la resolvió, o el camino más barato del sistema sería también el más opaco.

### 2.8 El enganche con `brillo.ts`: la fórmula no se toca, el conteo gana un campo

`ConteoCelda` **gana un quinto campo, `senalesSinActor`**, y ni la fórmula ni las variantes de `Brillo` cambian una línea. Se descartó el «cuatro campos siguen siendo cuatro campos»: `brilloDeCelda` sólo lee `vocesDistintas` y `habitantes`, así que una celda con cincuenta señales sin actor daba `participacion: 0` e `intensidad: 0` —el `0` que significa «nadie habló», que es el pecado que el módulo existe para prohibir— y encima sesgado justo contra las celdas que cubrió la app de campo. El campo es un cambio rompedor de interfaz y se toma ahora, entero, porque el número tiene que viajar: `celda_luz` ya lo guarda (§3.7), o sea que esta spec lo necesitaba y lo negaba en la interfaz.

Lo que sigue en pie es **dónde va la distinción**: en `CeldaPublicada`, el tipo del endpoint (§2.9), y no como cuarta variante de `Brillo`. La supresión corre **antes** de `luzDeCeldas`, así que `brilloDeCelda` nunca se invoca sobre una celda con `vocesDistintas === 0 && senalesSinActor > 0`, y meter la variante adentro rompería una unión que dos apps importan sin comprar nada — que es la advertencia literal de D-028.

Y esta spec agrega la definición exacta de cada campo, que hoy falta:

| Campo | Definición exacta | Nota |
|---|---|---|
| `vocesDistintas` | Actores distintos con **una señal en la celda** ∪ actores distintos que **adhirieron a una señal de la celda**, cualquier clase, **excluyendo las retenidas** | Deseos y hechos encienden igual (El Registro §3). **Una adhesión enciende la celda de la señal que apoya**, no la del adherente: un adherente no tiene punto propio |
| `senalesSinActor` | Señales de la celda con `actor_id IS NULL` | No se pliega a cero: es «no sé quién», no «nadie» |
| `verificables` | Señales de clase **hecho** o **acto** en estado ∈ {`por_verificar`, `corroborada`, `resuelta`, `desactualizada`}, **topeadas a 20 por actor por celda** | `enviada` no está publicada. `desactualizada` **sí** está: un hecho caído es precisamente un hecho que pide otra mirada |
| `confirmaciones` | De ese mismo conjunto, las que están en {`corroborada`, `resuelta`} | **Señales, no eventos.** Así `confirmaciones ≤ verificables` por construcción y el `Math.min(1, …)` de `brillo.ts:93` deja de ser un parche |
| `habitantes` | `habitantesDeCelda(cell, provinciaDe(cell.center))` | Ya existe en `poblacion.ts`, ya devuelve `null` y no `0` |

**La adhesión enciende la celda porque es el gesto más barato y el que más gente va a hacer.** Si no mueve el brillo, el mapa vuelve a medir a quien tuvo tiempo y teclado para escribir, y la palanca principal del producto no aparece en el único canal visual que mide participación.

**Por qué `desactualizada` cuenta en el denominador y no en el numerador.** Si quedara afuera, una celda donde *todos* los hechos caducaron daría `verificables = 0` → `Nitidez.inaplicable` → y `focoDeNitidez` devuelve **1** para `inaplicable` (`brillo.ts:127`, y está bien que lo haga): un barrio donde el conocimiento se pudrió entero se dibujaría tan nítido como uno que nunca tuvo nada que comprobar. Adentro del denominador, la nitidez baja y **se queda abajo**, que es lo que §2.5 dice que pasa.

**El tope de 20 por actor por celda** existe porque `verificables` es el denominador y cargar señales no cuesta nada: cien hechos plausibles de una sola persona en una celda de 200 m apagarían su nitidez a ~0,02. Contar más de veinte hechos de un solo actor convierte el denominador en el diario de una persona. El número vive en `coeficientes-corroboracion.ts` con esa razón al lado.

**Y `ConteoCelda` no gana un sexto campo por la métrica norte.** No es una propiedad de celda —no hay un tercer canal visual, hay dos: brillo y nitidez— así que vive en su propia lectura (`GET /api/v1/civic/metrica-norte`), no en la grilla.

### 2.9 La supresión va antes de la luz, y son cuatro estados

D-028 (la segunda entrada con ese id, `docs/DEUDAS.md:677`) está verificada numéricamente: con los coeficientes públicos, `voces = habitantes × PARTICIPACION_PLENA × intensidad^(1/CURVA)`, y una intensidad de 0,1720 sobre 1.000 habitantes despeja exactamente **1 voz**. El dibujo delata a la persona.

La supresión se aplica **sobre los `ConteoCelda` que entran**, nunca sobre las `LuzCelda` que salen:

- `vocesDistintas === 0` y `senalesSinActor === 0` → `silencio`.
- `vocesDistintas === 0` y `senalesSinActor > 0` → **`sin_actor_conocido`**. Se declara el hueco en vez de plegarlo a cero, igual que `Retrato.sinDato`.
- `1 ≤ vocesDistintas ≤ 4` → `suprimida`. **k = 5**, el piso habitual de anonimato en publicación de tablas de área chica.
- `vocesDistintas ≥ 5` → `luz`, y recién ahí entra a `luzDeCeldas`.

```ts
export type CeldaPublicada =
  | { cellId: string; tipo: 'luz'; luz: LuzCelda }
  | { cellId: string; tipo: 'silencio' }
  | { cellId: string; tipo: 'sin_actor_conocido'; senales: number; razon: string }
  | { cellId: string; tipo: 'suprimida'; minimoDeVoces: number; razon: string };
```

`sinDenominador` se queda donde ya vive, adentro de `LuzCelda.brillo`. **El 5 se declara una sola vez**, como `UMBRAL_SUPRESION` en `coeficientes-corroboracion.ts`; `coeficientes-luz.ts` lo importa y no crea un hermano con el mismo valor. Dos constantes con el mismo número para la misma decisión es cómo empieza toda deriva: dentro de seis meses alguien sube una y el mapa suprime distinto según qué superficie pregunte.

**k = 5 protege contra un lector, no contra un contribuyente.** Quien puede crear actores puede empujar una celda de 1 voz a `luz`, invertir la intensidad y restar los suyos. Se encarece (§2.2, §4.8) y se declara — y `vocesDistintas` sólo cuenta actores cuyo primer evento es de hace más de 24 h, que es el mismo dato que el detector de ráfagas ya necesita.

**El reloj, congelado entero y no a medias.** Publicar `suprimida` como estado distinto de `silencio` ya dice «acá habló al menos una persona»; y peor: `verificables` y `confirmaciones` se leen del `estado`, que es mutable, así que un observador que pollea vería la nitidez de una celda de 200 m cambiar en el instante en que alguien confirma. Como confirmar pide estar en el lugar, eso sería un sensor de presencia de dos cuadras. Por eso el agregado **no se calcula por pedido**: se materializa en `celda_luz` (§3.7) al cambio de hora y el endpoint lee esa tabla tal cual, con su `calculadoALas` a la vista. Congela el CUÁNDO de las cuatro variables a la vez, hace el endpoint cacheable, y de paso lo saca del camino de un DoS.

**Y el sesgo que la celda fija introduce.** Con lado fijo, k = 5 en una celda del interior con veinte habitantes es el 25% de la población: un umbral que en el microcentro se cruza con un grupo de WhatsApp y en el campo no se cruza nunca. No se baja k —el piso de anonimato es correcto—: se **adapta el lado**. El endpoint rechaza con `422` un plan cuyo lado deje celdas por debajo de los `k ÷ PARTICIPACION_PLENA = 100` habitantes que hacen el umbral alcanzable con la participación que `COEFICIENTES_LUZ` define como meta, y devuelve el `ladoSugerido` que sí funciona. Así el cliente y el servidor siguen cayendo sobre el mismo plan y el sesgo se vuelve un error visible en vez de un interior apagado en silencio. Lo que queda igual va escrito en el campo `sesgo` de la respuesta (§4.5) y en §9 (D-043).

### 2.10 La evidencia: en Blob, re-codificada en el teléfono, rechazada si trae metadatos

**A la base no va, y el número lo prueba.** El techo de la rama es 512 MB y hoy se usan 38 MB. Una foto procesada pesa ~250 KB: `512 MB ÷ 250 KB ≈ 2.048 fotos` y la plataforma entera queda muerta. El piloto de luminarias de una ciudad media —8.000 luminarias, una foto cada una— son 2 GB procesadas y 16 GB sin procesar: **cuatro veces y treinta y dos veces el techo de toda la base**. No es una preferencia de arquitectura, es aritmética, y no cambia con el plan que se pague (§3.8).

**Va a Vercel Blob**, por el motivo del ADR 0008 D1: origen único y un solo lugar donde viven los secretos. Sumar S3 o R2 es una credencial más, una región más y una frontera de origen más — cada una una superficie donde las reglas duras de `v2/CLAUDE.md` se aflojan. El precio es el lock-in, y la mitigación está en el dato: la fila guarda el `sha256`, así que migrar es una re-subida dirigida por la base.

**El EXIF se mata en origen, no en el servidor.** El pipeline:

1. **El teléfono re-codifica antes de subir** (`expo-image-manipulator` ya está en la app). Re-codificar no es «borrar tags»: es decodificar a píxeles y volver a codificar, así que GPS, fecha, número de serie, notas del fabricante y —sobre todo— la **miniatura embebida**, que suele conservar la foto *antes* del recorte, desaparecen por construcción y no por confianza en un parser. Y la consecuencia fuerte de hacerlo en el teléfono: **la coordenada exacta nunca sale del aparato**, que es la versión más fuerte posible de la regla 2.
2. **El servidor rechaza, no arregla.** Se olfatean los bytes mágicos (no el `content-type` declarado) y se rechaza cualquier archivo que todavía traiga marcadores de metadatos: `APP1`/`APP13` en JPEG, `eXIf`/`tEXt`/`iTXt` en PNG, chunks `EXIF`/`XMP` en WebP. Ese mismo recorrido de bytes lee `ancho` y `alto` del `IHDR` de PNG o del marcador `SOF` de JPEG: **no se decodifican píxeles**, porque decodificar pediría `sharp` —dep nativa que `v2/CLAUDE.md` exige justificar con ADR— y además abriría la bomba de descompresión (un PNG de 4 MB que expande a 40.000 × 40.000 px es un OOM en una función serverless). Por la misma razón **`hash_percep` sale de esta spec**: la sugerencia de duplicados espera a que exista un lugar donde decodificar sea barato.
3. **La evidencia de una señal sensible no se sube.** Si la señal tiene `sensitivity = 'high'`, su foto se queda en el teléfono bajo la custodia que `apps/mobile/src/civic/` ya implementa, y lo que viaja al servidor es su hash y su recibo. La llave es la sensibilidad sola: pedir además `location_role = 'subject'` dejaba afuera al `saber`, que es el tipo diseñado para responder preguntas sobre gente y que sale `service_area` siempre — o sea que la protección más fuerte del sistema cubría menos de la mitad del vocabulario. No hay «blob semi-privado»: hay público o no hay. Es la regla 3 al pie de la letra. **Depende de que alguien escriba ese campo** — hoy nadie lo escribe, y por eso §7 se lo pide a B con nombre, en los nueve tipos y no en cuatro.
4. **Los píxeles también filtran.** Ninguna limpieza de metadatos evita que la foto muestre el número de una puerta. Por eso el piloto pide *fotografía guiada*: la evidencia se encuadra sobre la cosa, no sobre la casa. Se dice en pantalla, en el momento de sacarla, y queda en el recibo.

**Metadatos que se conservan** — lo que hace auditable la evidencia, nada que exponga a quien la sacó: `sha256` de los bytes almacenados (cualquiera verifica que el archivo servido es el que el rastro firma), `bytes`/`ancho`/`alto`/`mime`, `tomada_en` **redondeada por la regla única de §2.11** con procedencia `declarado` (una foto tomada ocho meses antes de la señal es otra afirmación; hora exacta + punto público es un rastro de movimiento y la hora redondeada no), y el `actor_id` de quien la subió, sólo para auditoría. **No se guarda**: nombre de archivo, modelo del aparato, bytes originales, ni ninguna coordenada propia de la foto. La ubicación de la evidencia es la de su señal.

**Costo y borrado.** A ~250 KB, 10.000 evidencias son 2,5 GB, y la transferencia domina cuando se ven en el mapa: la lista **nunca** trae la imagen (trae el hash y una miniatura de 32 KB), la imagen entera se pide al abrir la ficha, y como son inmutables van con `cache-control` largo desde el borde. Si hay que borrar una, el blob se borra y el rastro **agrega** un evento `evidencia_borrada` con el hash y el motivo: la cadena sigue verificando porque lo encadenado es el evento, no el archivo. **El contenido se va; el rastro de que existió, se queda** — y ese rastro es un hash y una hora.

### 2.11 El rastro: inmutable de verdad contra la aplicación, detectable contra el operador

La verdad primero: **Postgres no tiene tablas append-only.** No hay WORM, no hay «insert only» a prueba de superusuario. Cualquiera que diga que un Postgres se puede hacer inmutable contra su propio administrador está mintiendo o vendiendo algo. Lo que sí se puede, en tres capas de fuerza decreciente:

1. **Contra la aplicación: inmutable de verdad, y es barato.** La API deja de conectarse como dueña. Se crea un rol `v2_app` y `DATABASE_URL` apunta ahí; el rol dueño queda para migraciones, que es lo que `packages/db/src/client.ts:4-5` ya reserva para `DATABASE_URL_UNPOOLED` en un comentario. El rol tiene los privilegios normales sobre el esquema **menos** `UPDATE`, `DELETE`, `TRUNCATE` y `REFERENCES` sobre `rastro_senal` (§3.5): un bug de la API no puede reescribir el rastro ni queriendo, porque el motor no se lo permite. **Y como la contraseña del rol y el cambio de `DATABASE_URL` los hace una persona en Neon, el arranque de la API chequea el privilegio y loguea `WARN` si la conexión todavía puede escribir el rastro**: sin ese chequeo, la capa 1 existe sólo en el archivo de migración y nada avisa.
2. **Contra el operador: no imposible, detectable, y verificable desde afuera.** Cadena de hash **por señal** —una cadena global serializaría todas las escrituras y sin transacciones interactivas (§1.5) eso no se puede hacer con seguridad—. La preimagen se parte en dos para que el rastro público alcance para recomputarla:

```
compromiso = sha256( actor_id ‖ canonJSON(datos, con `ocurrio_en` exacto adentro) ‖ nonce )
hash       = sha256( hash_previo ‖ seq ‖ senal_id ‖ publicado_en ‖ tipo_evento
                     ‖ estado_previo ‖ estado_nuevo ‖ compromiso )
```

   El `compromiso` viaja en el evento público junto con el `nonce`, y el `hash` se encadena con campos que también son públicos: cualquiera camina la cadena entera sin ver un campo privado, y quien tiene los campos privados abre el compromiso. **El instante exacto vive del lado privado.** El primer evento de toda señal es `ingreso` y su `ocurrio_en` *es* el instante de creación: publicarlo exacto devolvía por un GET el timestamp que las otras tres specs redondean en cuatro lugares distintos, y con el `idPublico` de cada fila del feed reconstruir la sesión de campo costaba N requests — el ataque que §2.3 define textualmente como «hora exacta + punto público = rastro de movimiento». Por eso el exacto entra en `canonJSON(datos)` y la preimagen externa usa `publicado_en`, que es lo redondeado.
   **El redondeo se decide una vez, en `packages/civic-core/src/tiempo-publico.ts`:** hora por defecto, día cuando `sensitivity = 'high'`, día siempre en el volcado. Tres specs lo importan; ninguna lo re-declara. Y `publicado_en` se **estampa** como columna al escribir el evento, no se deriva al leer: si se derivara, cambiar la sensibilidad de una señal cambiaría el redondeo y la cadena dejaría de cerrar.
   La cabeza de cada cadena se sella a diario, y el sello se ancla **fuera del operador**: la raíz Merkle del día se commitea al repo público, que ya tiene historia fechada por un tercero. Un sello que publica el mismo servidor del que hay que desconfiar no prueba nada.
3. **Contra el código que todavía no se escribió: una guarda de tests.** Un test recorre `packages/db/src/repositories/` y falla si aparece un `.update(rastroSenal)` o un `.delete(rastroSenal)`. La capa 1 protege producción; ésta protege el desarrollo local, donde todos son dueños.

Las tres, escritas juntas, para que nadie confunda la fuerza de una con la de otra. **Y una cosa que el rastro deliberadamente no hace:** guardar el vínculo con la persona. Ese vínculo vive en `actores`, que no es append-only, y por eso «revocable» de la regla 9 es cierto (§2.2).

### 2.12 La IA sugiere y se le nota en el dato

Regla 6: *«La IA puede sugerir; nunca determina la verdad de una señal.»* Se cumple por **forma del dato**, no por buena voluntad:

- Un evento de tipo `sugerencia_automatica` **no tiene campo `estado_nuevo`**. No es que no se use: no existe en su carga tipada, y hay un `CHECK` que lo impide. Una sugerencia es estructuralmente incapaz de mover el estado de una señal.
- Toda sugerencia lleva `motor`, `version`, `confianza` y `propuesta`, y viaja hacia la pantalla como una pregunta con dos botones: *«puede que sea la misma que #123 — ¿lo es?»*.
- La respuesta humana es un evento aparte, `decision_humana`, que apunta a la sugerencia por id. Efecto secundario buenísimo y gratis: **la precisión del modelo se calcula desde el rastro**, sin instrumentar nada. El error de la máquina es auditable por cualquiera.
- Y alcanza para atrás: `apps/api/src/features/mandato/classifier.ts` hoy escribe `theme` directamente sobre la fila, sin rastro y sin procedencia. Toda escritura de máquina **que cambie un valor** de una fila de señal pasa a dejar su evento con `actor_clase: 'maquina'`. **El intento que no escribe nada no deja evento**: para eso está `senales.tema_intentado_en` de B (`§2.11`), que es la constancia del intento y gobierna la cola. Un evento por cada intento fallido de clasificación sumaba una fila de rastro a **toda** señal en el renglón que ya es cuatro quintos del consumo de la base (§3.8), a cambio de repetir un dato que la propia columna ya guarda.

### 2.13 El antiabuso, adentro de la regla 7 y de la 8

No hay reputación de personas. Ni pública, ni privada-pero-consultable, ni «karma». La palanca es **estructural y territorial**:

| Mecanismo | Qué frena | Qué NO frena |
|---|---|---|
| Único por `(senal_id, ronda, actor_id)` | Confirmar diez veces la misma cosa | Que sean diez actores de la misma persona |
| El autor no confirma lo suyo (`IS DISTINCT FROM`), y las señales sin actor no entran al circuito | El par autor-confirmante | Que el autor tenga un segundo aparato |
| Puerta de proximidad | El descuido | **Nada contra un atacante: la posición es declarada** |
| Techo horario de confirmaciones | Scripts | Un atacante paciente |
| Corrección **neta**, no umbral fijo | Tumbar una señal de diez confirmaciones con dos correcciones | — |
| Ronda nueva en cada revisión de vigencia | Que un veredicto viejo congele el estado | — |
| Enrolamiento con binding de secreto (§4.8) | Suplantar a un actor ajeno; enrolamiento masivo gratis | Que alguien instale la app N veces |

**Las 90 por hora, y con qué techo corre de verdad.** Confirmar cuesta unos dos segundos; un relevamiento a pie a 4,5 km/h con luminarias cada ~35 m pasa junto a ~128 objetos confirmables en una hora, y confirmar 90 es una hora saturada de trabajo real. Pero `anonSubmitRateLimit` es **30/hora/IP** (`middleware/rate-limit.ts:92`): si corriera acá, el techo real sería 30 y las 90 serían decorativas — y con CGNAT una campaña de veinte personas sobre la misma red móvil se bloquearía a sí misma. Por eso en `/confirmaciones` **la clave del limitador es el `actor_id` cuando la petición trae dispositivo enrolado**, y el techo por IP queda alto y sólo para el camino sin enrolar. **Qué lo cambiaría:** la distribución medida de la primera campaña real.

**La regla 8 sin brasas.** La regla nombra un mecanismo que el producto ya borró (El Registro R7). Se cita por su contenido, que sigue vivo: *premiar utilidad, corroboración, cobertura difícil y resolución; no volumen bruto*. Se cumple mudando el premio de la persona al territorio: **lo que se enciende es la celda**. La app puede decir «sos parte de las 7 personas que encendieron esta celda» —un plural, un lugar— y no puede decir en qué puesto estás, porque no hay ningún lugar del esquema con un contador público por persona.

**Detección de brigada: retiene, no sanciona.** Un detector marca ráfagas (muchas confirmaciones sobre una señal desde actores cuyo primer evento es de hace menos de 24 h) y su único efecto es poner `cuenta = false`, pendiente de revisión humana. **El flip de `cuenta` no se hace suelto**: la misma tanda escribe el evento `retencion_antiabuso` con su razón, y una guarda lo verifica — es el bit que decide si un hecho está comprobado y no puede moverse sin rastro. Si la señal ya estaba `corroborada`, vuelve a `por_verificar` **sin subir la ronda**, para que las confirmaciones honestas sigan contando cuando se revierta. **Riesgo residual, dicho y no escondido:** alguien podría disparar el detector *confirmando* una señal honesta en patrón sospechoso. Se auto-delata y el costo son horas. Se acepta a cambio de no construir reputación.

### 2.14 Tejer: la conexión entre lo que falta y lo que hay

La etapa Tejer del ciclo soberano —el piloto «Ollas del barrio», la decisión 10 del proyecto («qué se cruzó con lo que ofreciste»)— no la construía ninguna de las cuatro specs. Entra acá porque **una conexión aceptada es una confirmación con otro sujeto**: la pregunta no es «¿esto está?» sino «¿esto sirve para aquello?», y la responden dos lados. La forma la fijó B (`§7`) y esta spec la implementa.

- Una **conexión** es una arista dirigida entre dos señales, con su clase en la arista: `atiende` (un `recurso` o un `compromiso` hacia una `necesidad` o un `¡basta!`), `responde` (un `hecho` hacia una `meta`) y `duplica` (dos señales del mismo tipo, que es donde aterriza el veredicto `duplicate` de §2.6). Proponerla puede cualquiera, incluida la máquina como `sugerencia_automatica` (§2.12), y **proponer no cambia ningún estado**.
- **La aceptación es mutua y son dos filas**, una por lado: el actor que sostiene la necesidad y el actor que ofrece el recurso. Con una sola fila, cualquiera podría colgar su olla de la carencia de otro sin que esa persona se enterara — y la carencia de otro es exactamente lo que la métrica norte pide no exponer. Con las dos, la conexión queda `aceptada`; con una, `propuesta`; el rechazo de cualquiera de los dos la deja `rechazada` y no se vuelve a sugerir.
- **Una conexión aceptada no resuelve nada.** Es la entrada informativa de `resoluciones.enlace_senal_id`, y el enlace es informativo, nunca disparador (§2.7). Que alguien ofrezca una olla no significa que la persona haya comido, y el día que las dos cosas se confundan la métrica norte empieza a contar promesas.
- **Cuando un lado no tiene actor identificable, la conexión se propone y no se puede aceptar**: queda `propuesta` con razón `sin_actor_de_un_lado` y aparece como sugerencia en la ficha, para que alguien la retome a mano. El «no sé quién es el otro lado» no se pliega a un `false`.

---

## §3 El esquema

Migración **`0016`**. Siete tablas nuevas, seis columnas sobre `senales`, y ni un `CHECK` de enum de estado. Los `CHECK` se declaran con `check()` en el tercer argumento de `pgTable` (drizzle-orm 0.36.4 ya lo trae en `pg-core/checks.js`), no como SQL suelto: un constraint que sólo vive en el archivo de migración es invisible para `drizzle-kit` y el próximo `generate` lo duplica. Va en SQL crudo sólo lo que drizzle no modela: los `grant`/`revoke` y los índices únicos parciales.

**Orden y precondición.** `0016` corre después de `0015`, y no antes: necesita `senales`, `actores`, `tipos_senal` y `estados_senal` ya creadas por B. Adentro de `0016`: columnas sobre `senales` → `evidencia` → `confirmaciones` → `resoluciones` → `confirmaciones_de_resolucion` → `conexiones` → `aceptaciones_de_conexion` → `rastro_senal` → `celda_luz`.

Se descartó la precondición vieja («la migración no aplica hasta que `dreams.clase` exista como columna `NOT NULL`»). Era el costo de atornillarle una clase a `dreams`: en `senales` la clase es `NOT NULL` con FK compuesta desde el primer minuto, así que el `CHECK` decorativo que `NULL or false` volvía inofensivo no puede existir. La dependencia sobre B sigue siendo dura, pero ahora es de orden de migración y no de forma de columna.

Los nombres van en plural donde la familia de B ya lo está (`senales`, `actores`, `adhesiones`, `confirmaciones`, `resoluciones`, `conexiones`); `evidencia`, `celda_luz` y `rastro_senal` quedan en singular porque nombran una cosa y no una colección de actos.

### 3.1 Las columnas de calidad, sobre `senales`

Se descartó `estadoColumns` como objeto compartido en `_geo-columns.ts`. Ese archivo existe para que **tres** tablas no diverjan, y queda una; el objeto además duplicaba `estado`, `actor_id` e `id_local`, que `senales` ya trae de B, y su `idempotencia_local` global era la más débil de las dos idempotencias en disputa: la de B, `unique (origen, id_local)`, separa los tres espacios de nombres (navegador, campo, adaptador viejo) para que el reintento de uno no colisione con el envío legítimo de otro.

Lo que sí agrega esta spec, con `ALTER TABLE`:

```sql
alter table senales
  add column estado_desde    timestamptz not null default now(),
  add column ronda           integer     not null default 1,
  add column publicada_en    timestamptz,
  add column vence_el        timestamptz,
  add column caduca_el       timestamptz,
  add column retenida_en     timestamptz,
  add column retenida_motivo text;

-- La máquina la corren hechos y actos; qué estado admite cada clase lo dice la FK
-- compuesta (estado, clase) contra `estados_senal`, no un CHECK de esta spec.
create index senales_vigencia_idx  on senales (vence_el)  where estado in ('corroborada','resuelta');
create index senales_caducidad_idx on senales (caduca_el) where estado = 'por_verificar';
create index senales_publicacion_idx on senales (id)      where estado = 'enviada';
create index senales_retenidas_idx on senales (retenida_en) where retenida_en is not null;
```

`ronda` es lo que hace posible la revisión de vigencia: cada vuelta reabre la confirmación para todos, incluido quien ya miró. `publicada_en` es de dónde salen los dos relojes (§2.5) y no se deriva de `created_at`, porque una señal puede quedar en `enviada` esperando un blob. Los índices parciales son los que hacen que el cron sea una consulta y no un barrido.

El `customType` de `bytea` vive en `packages/db/src/schema/_bytea.ts` y lo usan las dos specs: `actores.actor_hash`/`secreto_hash` (B) y las cinco columnas de hash de acá. **Se declara con `toDriver`**: un `Uint8Array` plano no es `instanceof Buffer`, y el driver de neon serializa con `r instanceof Buffer ? '\\x'+hex : r`, así que sin él el parámetro sale como `{"0":12,…}` y Postgres recibe basura.

### 3.2 `evidencia`

```sql
create table evidencia (
  id             bigserial primary key,
  senal_id       bigint not null references senales(id) on delete restrict,
  url            text not null,          -- Vercel Blob, inmutable
  sha256         bytea not null,
  bytes          integer not null,
  ancho          integer not null,       -- del header, sin decodificar píxeles
  alto           integer not null,
  mime           text not null,
  tomada_en      timestamptz,            -- redondeada por tiempo-publico.ts (§2.11)
  tomada_en_procedencia text not null default 'declarado',
  subida_por     bigint not null references actores(id),
  creado_en      timestamptz not null default now(),
  borrada_en     timestamptz,
  borrada_motivo text,
  constraint evidencia_mime_check check (mime in ('image/webp','image/jpeg','image/png')),
  constraint evidencia_procedencia_check check (tomada_en_procedencia in ('declarado','medido')),
  constraint evidencia_borrado_check check ((borrada_en is null) = (borrada_motivo is null))
);

-- Por señal y no global: la misma foto puede respaldar dos señales legítimamente
-- (un acta que cubre dos necesidades), y un único global vuelve el 409 un oráculo
-- —subís un archivo y aprendés si alguien más lo subió— y una forma de ocupación.
create unique index evidencia_sha256_uq on evidencia (senal_id, sha256) where borrada_en is null;
create index evidencia_senal_idx on evidencia (senal_id);
```

`tomada_en_procedencia` es `declarado` por default y no `medido`, porque el instante lo dice el cliente. Es la primitiva `Procedencia` de `simulacion/procedencia.ts` aplicada a una columna: un número sin procedencia en pantalla es un bug, y una fecha sin procedencia en la base es el mismo bug un paso antes.

### 3.3 `confirmaciones` y `confirmaciones_de_resolucion`

El nombre es el que fijó B (`§7`), plural y de la familia de `adhesiones`. La clave única es la de esta spec, **con `ronda` adentro**: sin ella, una señal que vuelve a `por_verificar` después de vencer no puede ser re-confirmada por nadie que la haya mirado alguna vez, y todo el ciclo de §2.5 queda muerto al primer vencimiento. Una spec puede fijarle a otra una restricción; no puede fijarle una que le impide funcionar.

```sql
create table confirmaciones (
  id            bigserial primary key,
  senal_id      bigint  not null references senales(id) on delete restrict,
  ronda         integer not null,
  actor_id      bigint  not null references actores(id),
  veredicto     text not null,
  metodo        text not null,
  nota          text,
  -- Categoría, no punto y no metros: la ubicación del confirmante no se guarda.
  proximidad    text not null,
  proximidad_procedencia text not null default 'declarada_por_cliente',
  -- Guardado por fila para auditar la fila. El umbral que JUZGA la señal es el
  -- que quedó estampado en el evento `transicion` del rastro (§2.1).
  cuenta        boolean not null,
  umbral_vigente smallint not null,
  evidencia_id  bigint references evidencia(id) on delete set null,
  creado_en     timestamptz not null,   -- redondeado por tiempo-publico.ts (§2.3)

  constraint confirmaciones_veredicto_check check (
    veredicto in ('confirm','correct','duplicate','stale','unsafe','cannot_verify')),
  constraint confirmaciones_metodo_check check (
    metodo in ('saw_now','know_place','checked_source','field_visit','cannot_verify')),
  -- «Lo confirmo y no tengo cómo comprobarlo» no es una fila válida.
  constraint confirmaciones_coherencia_check check (
    veredicto = 'cannot_verify' or metodo <> 'cannot_verify'),
  -- Una corrección sin decir qué está mal no es revisable por nadie.
  constraint confirmaciones_nota_check check (veredicto <> 'correct' or nota is not null),
  constraint confirmaciones_proximidad_check check (
    proximidad in ('en_el_lugar','lejos','no_declarada','inaplicable')),
  constraint confirmaciones_proc_check check (
    proximidad_procedencia in ('declarada_por_cliente','no_declarada','inaplicable'))
);

-- Una mirada por actor por ronda. Es la pieza que `proposal_votes` nunca tuvo.
create unique index confirmaciones_uq on confirmaciones (senal_id, ronda, actor_id);
create index confirmaciones_senal_idx on confirmaciones (senal_id, ronda);

-- El cierre es otra ronda en otra tabla (§2.7): ni colisiona con el único de arriba,
-- ni las confirmaciones del hecho sirven de confirmaciones de su cierre.
create table confirmaciones_de_resolucion (
  id             bigserial primary key,
  resolucion_id  bigint not null references resoluciones(id) on delete restrict,
  actor_id       bigint not null references actores(id),
  es_el_autor    boolean not null default false,
  proximidad     text not null,
  proximidad_procedencia text not null default 'declarada_por_cliente',
  cuenta         boolean not null,
  umbral_vigente smallint not null,
  creado_en      timestamptz not null,
  constraint confirmaciones_res_proximidad_check check (
    proximidad in ('en_el_lugar','lejos','no_declarada','inaplicable'))
);
create unique index confirmaciones_de_resolucion_uq
  on confirmaciones_de_resolucion (resolucion_id, actor_id);
```

Los seis veredictos y los cinco métodos son **literalmente** los de `verification-provenance.ts:71-120` y `:28-69`. No se traduce, no se reordena y **no se agrega ninguno**: el archivo que ya tiene la redacción rioplatense y la consecuencia declarada de cada opción pasa a ser el catálogo, y el `CHECK` es su copia en SQL.

**No hay `distancia_bucket` y no hay índice `(actor_id, creado_en)`.** La columna no la leía nadie y un `<50m` contra un punto `exact` es una ubicación más fina que la que la política le concede a un `subject`; el índice era, literalmente, «traeme el recorrido de esta persona ordenado por hora» sobre una tabla de presencias declaradas. Con `creado_en` redondeado y sin ese índice, reconstruir una trayectoria deja de ser una consulta y pasa a ser un barrido con resolución horaria. `on delete restrict` en el FK a `senales`: una señal con confirmaciones no se borra; si hay que borrar contenido, se retira (B) o se redacta (§3.5).

### 3.4 `resoluciones`

```sql
create table resoluciones (
  id                bigserial primary key,
  senal_id          bigint not null references senales(id) on delete restrict,
  estado            text not null default 'propuesta',   -- 'propuesta' | 'confirmada' | 'retirada'
  propuesta_por     bigint references actores(id),
  propuesta_en      timestamptz not null default now(),
  enlace_tipo       text not null,
  enlace_senal_id   bigint references senales(id) on delete set null,
  enlace_nota       text,
  autor_estado      text not null default 'pendiente',
  autor_preguntado_en timestamptz,       -- el primer intento de entrega EFECTIVO
  autor_respondio_en  timestamptz,
  autor_vence_el    timestamptz,         -- = autor_preguntado_en + 30 d. NULL sin entrega
  cierre_tipo       text,
  confirmada_en     timestamptz,
  constraint resoluciones_estado_check check (estado in ('propuesta','confirmada','retirada')),
  constraint resoluciones_enlace_check check (
    (enlace_tipo = 'enlazada' and enlace_senal_id is not null)
    or (enlace_tipo = 'resuelta_por_un_tercero' and enlace_nota is not null)
    or (enlace_tipo = 'sin_enlace')),
  constraint resoluciones_autor_check check (autor_estado in (
    'confirmo','no_hay_autor_identificable','no_hubo_como_preguntar','sin_respuesta','pendiente')),
  -- Cerrar sin autor obliga a decir QUÉ la resolvió (§2.7).
  constraint resoluciones_sin_autor_check check (
    autor_estado <> 'no_hay_autor_identificable' or enlace_tipo <> 'sin_enlace'),
  constraint resoluciones_cierre_check check (cierre_tipo is null or cierre_tipo in (
    'confirmado_con_el_autor','confirmado_sin_autor',
    'confirmado_sin_respuesta_del_autor','confirmado_sin_poder_preguntar')),
  constraint resoluciones_reloj_check check (
    (autor_vence_el is null) = (autor_preguntado_en is null))
);

-- A lo sumo una resolución VIVA por señal. Un `unique` sobre la columna dejaba a una
-- necesidad mal cerrada y después retirada sin forma de volver a resolverse nunca.
create unique index resoluciones_activa_uq on resoluciones (senal_id) where estado <> 'retirada';
```

El `CHECK` del enlace es el que impide la fila deshonesta: no se puede decir «enlazada» sin decir a qué, ni «la resolvió un tercero» sin decir quién. La base rechaza el «no sé» disfrazado.

### 3.5 `rastro_senal`

```sql
create table rastro_senal (
  id            bigserial primary key,
  senal_id      bigint not null references senales(id) on delete restrict,
  seq           integer not null,          -- posición en la cadena de ESTA señal
  ocurrio_en    timestamptz not null,      -- EXACTO, privado: entra en canonJSON(datos)
  publicado_en  timestamptz not null,      -- redondeado, público: entra en la preimagen
  tipo_evento   text not null,
  estado_previo text,
  estado_nuevo  text,
  motivo        text,
  actor_id      bigint references actores(id),  -- NULL cuando el actor no es una persona
  actor_clase   text not null,                  -- 'persona' | 'sistema' | 'maquina'
  superficie    text not null,                  -- 'web' | 'campo' | 'cron' | 'admin'
  cliente       text,
  datos         jsonb not null default '{}'::jsonb,
  nonce         bytea not null,
  compromiso    bytea not null,
  hash_previo   bytea,                         -- NULL sólo en seq = 1
  hash          bytea not null,

  constraint rastro_actor_clase_check check (actor_clase in ('persona','sistema','maquina')),
  constraint rastro_superficie_check check (superficie in ('web','campo','cron','admin')),
  constraint rastro_tipo_check check (tipo_evento in (
    'ingreso','publicacion','transicion','confirmacion','correccion','revision_de_vigencia',
    'revision_de_resolucion','caducidad_por_silencio','resolucion_propuesta','resolucion_confirmada',
    'conexion_propuesta','conexion_aceptada','conexion_rechazada',
    'retencion_por_exposicion','evidencia_adjuntada','evidencia_borrada','redaccion','retiro',
    'sugerencia_automatica','decision_humana','retencion_antiabuso')),
  -- Una sugerencia de máquina NO mueve el estado. Lo impide el motor, no la buena voluntad.
  constraint rastro_sugerencia_no_mueve_estado_check check (
    tipo_evento <> 'sugerencia_automatica' or estado_nuevo is null),
  constraint rastro_cadena_check check ((seq = 1) = (hash_previo is null))
);

create unique index rastro_cadena_uq on rastro_senal (senal_id, seq);
create index rastro_senal_idx on rastro_senal (senal_id, publicado_en);

-- Inmutable contra la aplicación (§2.11, capa 1). El bloque completo, en este orden:
do $$ begin if not exists (select 1 from pg_roles where rolname = 'v2_app')
     then create role v2_app login; end if; end $$;
grant usage on schema public to v2_app;
grant select, insert, update, delete on all tables in schema public to v2_app;
grant usage, select on all sequences in schema public to v2_app;
alter default privileges in schema public grant select, insert, update, delete on tables to v2_app;
alter default privileges in schema public grant usage, select on sequences to v2_app;
revoke update, delete, truncate, references on rastro_senal from v2_app;
```

El rol se crea de forma idempotente porque la migración también corre en ramas frescas (CI, local, el branch efímero que pide D-014) donde nadie lo creó. Sin `grant` general, `v2_app` no puede leer ni `senales`; sin `usage, select on sequences`, ni siquiera insertar en el rastro; sin `alter default privileges`, la migración siguiente rompe la API. **La contraseña del rol y el cambio de `DATABASE_URL` los hace una persona en Neon**, y por eso el arranque chequea el privilegio y loguea `WARN` si todavía puede escribir el rastro (§2.11, §7). El nombre es `rastro_senal` y no `bitacora_senal` a propósito: la regla 3 dice *«bitácora y reflexión personal nunca se publican»*, y una ruta pública llamada `bitacora` al lado de esa regla se resuelve dentro de seis meses asumiendo que la regla ya no se cumple. La palabra queda para lo privado.

Los tres eventos de conexión y el de `retiro` están en el catálogo porque el rastro es **el único** libro de transiciones del sistema: se descartó `senal_estado_historia`, la segunda bitácora que B había diseñado en paralelo. Dos libros habrían dejado la guarda de cadena completa roja de forma permanente y la pasada 7 del cron «reconciliando» transiciones legítimas — la reparación que esta spec dice que no hay que disimular, disimulando. El `disparador` de B se mapea sin pérdida: `persona` → `actor_clase='persona'`; `conteo` → `'sistema'` con `tipo_evento='transicion'`; `reloj` → `'sistema'` con `superficie='cron'`. La ausencia de un `'ia'` que B celebra ya está en el `CHECK`.

**La cadena.** El canonicalizador vive en `packages/civic-core/src/rastro.ts` — puro, sin reloj, sin red, sin disco. `canonJSON` ordena claves, normaliza números y escapa igual siempre: dos implementaciones distintas tienen que dar el mismo byte o la cadena no vale nada. **El hash lo inyecta quien llama**: civic-core exporta el canonicalizador y recibe `(bytes: Uint8Array) => Promise<Uint8Array>` como parámetro, porque `crypto.subtle` de Node y `expo-crypto` del teléfono no son la misma API. Misma disciplina que el reloj de la Simulación. El redondeo de `publicado_en` sale de `tiempo-publico.ts` y `datos.ocurrio_en` tiene que coincidir con la columna `ocurrio_en`: hay una guarda que lo verifica, porque si divergen el compromiso no abre.

**La escritura, en una sola sentencia**, y con `seq`, `hash_previo`, `ocurrio_en` y `publicado_en` **como parámetros**:

```sql
insert into rastro_senal (senal_id, seq, ocurrio_en, publicado_en, tipo_evento, ..., hash_previo, hash)
values ($1, $2, $3, $4, $5, ..., $9, $10)
on conflict (senal_id, seq) do nothing
returning seq;
```

Se lee la cabeza, se canonicaliza con **ese** `seq`, **esa** cabeza y **esos** dos instantes, y si el `returning` vuelve vacío se relee y se reintenta, con tope de tres. Calcular el `seq` adentro del SQL —`coalesce(max(seq),0)+1`— parecía más limpio y era un bug callado: la sentencia se autoasigna el hueco libre, así que el índice único **nunca dispara**, no hay perdedor, y el ganador guarda un hash calculado contra una cabeza que ya no es la cabeza. Lo mismo con `default now()`: el instante que hashea la app y el que escribe el motor serían distintos, y en un reintento cambiaría otra vez. Las columnas no tienen default.

**La redacción.** Si hay que borrar texto de una señal —un nombre, una amenaza— se agrega un evento `redaccion` con el hash del texto retirado, y el campo de la señal queda en blanco. La cadena sigue verificando porque lo encadenado es el evento, no la fila.

### 3.6 `conexiones` y `aceptaciones_de_conexion`

```sql
create table conexiones (
  id            bigserial primary key,
  desde_id      bigint not null references senales(id) on delete restrict,
  hacia_id      bigint not null references senales(id) on delete restrict,
  clase         text not null,          -- 'atiende' | 'responde' | 'duplica'
  estado        text not null default 'propuesta',
  razon_bloqueo text,                   -- 'sin_actor_de_un_lado', y nunca un false
  propuesta_por bigint references actores(id),
  origen        text not null,           -- 'persona' | 'maquina'
  creado_en     timestamptz not null default now(),
  cerrada_en    timestamptz,
  constraint conexiones_clase_check check (clase in ('atiende','responde','duplica')),
  constraint conexiones_estado_check check (estado in ('propuesta','aceptada','rechazada')),
  constraint conexiones_origen_check check (origen in ('persona','maquina')),
  constraint conexiones_no_reflexiva_check check (desde_id <> hacia_id)
);
create unique index conexiones_uq on conexiones (desde_id, hacia_id, clase)
  where estado <> 'rechazada';
create index conexiones_hacia_idx on conexiones (hacia_id) where estado = 'aceptada';

-- Aceptación mutua: dos filas, una por lado. Con una sola, cualquiera cuelga su olla
-- de la carencia de otro sin que esa persona se entere (§2.14).
create table aceptaciones_de_conexion (
  id            bigserial primary key,
  conexion_id   bigint not null references conexiones(id) on delete restrict,
  lado          text not null,           -- 'desde' | 'hacia'
  actor_id      bigint not null references actores(id),
  respuesta     text not null,           -- 'acepta' | 'rechaza'
  creado_en     timestamptz not null,
  constraint aceptaciones_lado_check check (lado in ('desde','hacia')),
  constraint aceptaciones_respuesta_check check (respuesta in ('acepta','rechaza'))
);
create unique index aceptaciones_de_conexion_uq on aceptaciones_de_conexion (conexion_id, lado);
```

`estado = 'aceptada'` la escribe la segunda fila `acepta`, en la misma sentencia que la inserta; cualquier `rechaza` la deja `rechazada` y el único parcial deja volver a proponerla más adelante sin reabrir la anterior. El único por `(desde_id, hacia_id, clase)` impide que la máquina sugiera diez veces el mismo cruce.

### 3.7 `celda_luz` — el agregado congelado

```sql
create table celda_luz (
  plan_id        text not null,      -- hash de polígono canonicalizado + namespace + lado
  cell_id        text not null,
  calculado_a_las timestamptz not null,
  voces_distintas integer not null,  -- autores ∪ adherentes (§2.8)
  senales_sin_actor integer not null,
  verificables   integer not null,
  confirmaciones integer not null,
  habitantes     integer,            -- NULL, nunca 0, cuando no se sabe
  primary key (plan_id, cell_id)
);
```

Sólo se guardan las celdas con algo: **la ausencia de fila es `silencio`**, así que la tabla crece con las señales y no con la superficie del país. El cron la reescribe al cambio de hora para los planes publicados (`apps/api/src/features/civic-map/planes.ts`: provincia × lado ∈ {100, 200, 250, 500}, ids que ya calcula `planTerritorialCoverage`), uniendo los actores de `adhesiones` a la celda de la señal apoyada. El endpoint no calcula: lee.

### 3.8 Lo que ocupa esto en la base, y la suma que nadie había hecho

| Tabla | Heap | Índices | Bytes/fila | 100.000 señales |
|---|---|---|---|---|
| Columnas de esta spec sobre `senales` | ~55 | ~40 | ~95 | 9,5 MB |
| `confirmaciones` (≈2 por hecho) | ~150 | ~70 | ~220 | 44 MB |
| `rastro_senal` (≈8 eventos por señal) | ~310 | ~75 | ~385 | 308 MB |
| `resoluciones` + `confirmaciones_de_resolucion` (≈5%) | — | — | ~330 | 1,7 MB |
| `conexiones` + `aceptaciones_de_conexion` (≈3%) | — | — | ~130 | 0,4 MB |
| `evidencia` (≈30% con foto) | ~140 | ~55 | ~195 | 5,9 MB |
| `celda_luz` | ~90 | ~40 | ~130 | 13 MB |

Total de esta spec ≈ **380 MB para 100.000 señales**, con los índices de PK adentro, que es lo que la hace auditable. **El rastro es cuatro quintos.**

**Y la suma conjunta, que es el número que importa.** Las cuatro specs presupuestaron contra denominadores distintos y ninguna sumó: 38 MB de hoy + 163 MB de incremental de A (el callejero) + 80 MB de B a 100.000 señales + 380 MB de acá = **≈660 MB**. Contra los 512 MB de la rama, son 145 MB de más, y **el techo conjunto real es ~68.000 señales**, no las 460.000 de B ni las 115.000 que esta spec calculaba sola. Nadie había escrito ese número y las tres alarmas estaban puestas contra denominadores distintos.

**Los 512 MB son el límite del plan gratuito, no una restricción de diseño**, y por eso el orden es medir y después decidir: se corre la suma con el incremental **medido** de A y de B antes de escribir una línea de `rastro_senal`, y el número decide si se paga el plan o si se diseña para caber. Lo que **no** depende de esa decisión: a 380 MB el rastro es cuatro quintos de esta spec en cualquier plan, así que **el archivado frío del rastro entra en esta rebanada** y deja de ser una tarea de «la spec siguiente». Sus filas son inmutables y su verificación es una cadena que se recorre offline: es el candidato natural, y es la única decisión de capacidad que no se puede posponer con una nota al pie — cuando se descubra, la base ya va a estar llena.

---

## §4 El comportamiento

Las rutas van por `idPublico`, nunca por el serial: `senales.id` no cruza el borde (B `§3.3`), porque un id ordinal permite enumerar el corpus y emparejar por vecindad dos señales de la misma sesión.

### 4.1 `POST /api/v1/civic/senales/:idPublico/confirmaciones`

Auth: token de dispositivo (móvil) o cookie `basta_actor` (web). CSRF por doble cookie en web. **La exención de campo se declara por patrón exacto, no por prefijo:** se descartó colgarse de la rama `path.startsWith(...)` de `isAnonAllowed`, que B borra por escrito y con este endpoint como ejemplo — una ruta que escribe el estado de calidad de una señal quedaría exenta sin que nadie lo decida. En campo autentica el portador; en web el actor nace con su par de cookies, así que el doble envío funciona sin excepción ninguna. Techo: 90/hora **por `actor_id`** para peticiones con dispositivo enrolado; el techo por IP queda alto y sólo para el camino sin enrolar (§2.13).

```ts
interface ConfirmacionInput {
  veredicto: 'confirm'|'correct'|'duplicate'|'stale'|'unsafe'|'cannot_verify';
  metodo: 'saw_now'|'know_place'|'checked_source'|'field_visit'|'cannot_verify';
  punto?: { lat: number; lng: number } | null;   // se compara y se descarta
  nota?: string;                                  // obligatoria si veredicto = 'correct'
  evidenciaId?: number;
}

type ReciboConfirmacion =
  | { tipo: 'registrada'; cuenta: boolean; proximidad: Proximidad; estado: EstadoDeCalidad;
      faltan: { tipo: 'para_corroborar'; cuantas: number } | { tipo: 'ya_corroborada' }
            | { tipo: 'no_aplica'; razon: string } }
  | { tipo: 'ya_confirmaste'; en: string }
  | { tipo: 'no_registrada'; razon: 'es_tuya' | 'sin_autor_atribuible' | 'clase_no_se_corrobora'
                                   | 'estado_no_admite' | 'metodo_no_habilitado_para_esta_senal' };
```

`registrada: true` como literal no podía expresar «no se registró», y §4.10 promete cinco casos que lo necesitan. `faltan` es unión discriminada y no un número: «faltan 0» y «esto no se corrobora» son cosas distintas. Es la misma disciplina de `Brillo`. La razón `sin_autor_atribuible` es la rama explícita de la regla de §2.2: una señal sin actor no entra al circuito, y el recibo lo dice en vez de fallar en silencio.

**La transición, en una sentencia**, con un CTE de diagnóstico adelante para que la respuesta siempre pueda decir *por qué* no insertó:

```sql
with actual as (
  select id, clase, estado, ronda, actor_id from senales where id_publico = $1
), nueva as (
  insert into confirmaciones (senal_id, ronda, actor_id, veredicto, metodo, nota,
                              proximidad, cuenta, umbral_vigente, creado_en)
  select a.id, a.ronda, $2, $3, $4, $5, $6, $7, $8, $14
  from actual a
  where a.clase in ('hecho','acto')
    and a.estado in ('por_verificar','corroborada','resuelta','desactualizada')
    and a.actor_id is not null                   -- sin autor atribuible no entra al circuito
    and a.actor_id is distinct from $2           -- nadie corrobora lo suyo
  on conflict (senal_id, ronda, actor_id) do nothing
  returning ronda
), neto as (
  select count(*) filter (where veredicto = 'confirm' and cuenta) as confirms,
         count(*) filter (where veredicto = 'correct' and cuenta) as corrects,
         count(*) filter (where veredicto = 'stale'   and cuenta) as stales
  from confirmaciones c, actual a where c.senal_id = a.id and c.ronda = a.ronda
), movido as (
  update senales s set estado = $9, estado_desde = now(), ronda = s.ronda + $10,
         vence_el = $11, caduca_el = $12
    from nueva, neto, actual a
   where s.id = a.id and s.estado = a.estado and $7 = true and $13 = true
  returning s.id, s.estado
)
select a.*, (select count(*) from nueva) as inserto, (select estado from movido) as movido;
```

`$9`–`$13` los arma el llamador desde el veredicto y `neto`, según esta tabla — y `$13` es la condición, evaluada del lado de la app con los números que `neto` devuelve en el mismo viaje. `$14` es el instante redondeado por `tiempo-publico.ts`.

| Veredicto | Desde | Condición | Destino | Ronda |
|---|---|---|---|---|
| `confirm` | `por_verificar` | `1 + confirms ≥ umbral` **y** `corrects = 0` | `corroborada` | = |
| `confirm` | `desactualizada` | siempre | `por_verificar` | = |
| `correct` | `corroborada` | `1 + corrects ≥ confirms` | `por_verificar` | +1 |
| `stale` | `por_verificar`, `corroborada`, `resuelta` | `1 + stales ≥ umbral` | `desactualizada` | = |
| `unsafe` | cualquiera | siempre (N=1) | **no toca `estado`**: setea `retenida_en` | = |

El `1 +` no es un truco: un CTE hermano **no ve** las filas que otro escribió en la misma sentencia —los `SELECT` corren contra el snapshot del inicio— y ésa es la clase de detalle que, sin escribirlo, produce un doble conteo silencioso. Carrera de dos confirmaciones que empatan en el umbral: las dos intentan el `UPDATE`, el bloqueo de fila las serializa, y la segunda falla su `s.estado = a.estado`. No hay transición doble.

La corrección usa **neto** y no un 2 fijo porque el reinicio de ronda es una palanca de censura barata: con umbral fijo, dos `correct` tumban una señal de diez confirmaciones y la ronda nueva borra el efecto de las diez. Con neto, tumbar una señal de diez confirmaciones cuesta diez correcciones — y cada una con su `nota`, que es lo que una revisión humana puede leer.

Después, el evento del rastro con la sentencia de §3.5. Si esa segunda escritura falla, la confirmación queda registrada y sin rastro — inaceptable. Por eso el evento va con `db.batch()` cuando sus valores ya se conocen, y cuando no, la reconciliación la hace el cron, dejando el evento con `motivo: 'reconciliado'` para que la reparación también se vea. **La reparación que no se declara es una mentira prolija.**

### 4.2 `POST …/resolucion` y `…/resolucion/confirmaciones`

El primero registra la afirmación de resolución. **Nunca cambia el estado**, y **sólo se acepta sobre una señal `corroborada`** (§2.7): sobre una `por_verificar` devuelve `422` diciendo que primero hay que comprobar que existe. Devuelve el recibo con las tres condiciones y su estado: `confirmacionesDeCierre: { hechas, faltan }`, `palabraDelAutor` (las cinco variantes de §2.7) y `enlace`.

El segundo escribe en `confirmaciones_de_resolucion`, con la misma puerta de proximidad y el mismo umbral. **Acá el autor sí puede confirmar** —`es_el_autor` lo marca— y es requisito cuando existe. El cierre efectivo lo dispara la segunda confirmación contada, y sólo si `autor_estado` ya es `confirmo`, `no_hay_autor_identificable`, `no_hubo_como_preguntar` o `sin_respuesta`. Si es `pendiente`, el cierre espera: el cron lo destraba (§4.9).

### 4.3 `POST …/conexiones` y `POST /api/v1/civic/conexiones/:id/respuesta`

El primero propone la arista (§2.14) y devuelve el estado con su razón: `propuesta`, o `propuesta` con `razonBloqueo: 'sin_actor_de_un_lado'` cuando alguno de los dos extremos no tiene autor identificable. El segundo escribe la fila de aceptación del lado que corresponde al actor que responde —y `403` si no es de ninguno de los dos lados—; la segunda `acepta` cierra la conexión en la misma sentencia, y cualquier `rechaza` la deja `rechazada`. Los tres movimientos dejan evento (`conexion_propuesta`, `conexion_aceptada`, `conexion_rechazada`), porque una conexión aceptada es lo que después va a aparecer como enlace de una resolución y tiene que poder auditarse igual que una confirmación.

### 4.4 `GET …/rastro`

El rastro público de una señal. **Redactado en el serializador, no en la consulta**, y con una guarda que lo verifica:

```ts
interface EventoPublico {
  cuando: string;                  // `publicado_en`: redondeado por tiempo-publico.ts
  que: string;                     // 'confirmación', 'corrección', 'revisión de vigencia'...
  quien: 'una persona' | 'el sistema' | 'una sugerencia automática';
  estadoPrevio: string | null;
  estadoNuevo: string | null;
  motivo: string | null;
  seq: number;
  nonce: string; compromiso: string; hashPrevio: string | null; hash: string;   // hex
}
```

Ni `actor_id`, ni `datos`, ni `ocurrio_en` están, y no pueden estar: el tipo no los tiene. Y con `compromiso` y `nonce` afuera, **cualquiera recomputa la cadena entera sin ver un campo privado** — sin eso, «verificalo vos» era mirar una lista de bytes y creer. `cuando` es el instante redondeado y no el exacto: el exacto vive adentro del compromiso (§2.11), porque el primer evento de toda señal es `ingreso` y publicarlo exacto devolvía por este GET el timestamp que las otras tres specs redondean en cuatro lugares distintos.

### 4.5 `GET /api/v1/civic/map/cells`

El endpoint que El Registro §7 declaró y que no existe (`apps/api/src/features/civic-map/routes.ts` tiene exactamente tres rutas). Lo construye entero esta spec —la tabla, la política de supresión, los cuatro estados, el `422`— y `UMBRAL_SUPRESION` es la única constante que fija su k. La razón por la que existe es de privacidad y no de rendimiento: contar personas distintas en el cliente exigiría mandarle identificadores de persona al cliente.

```
GET /api/v1/civic/map/cells?plan=<planId>
```

**Se pide un plan publicado, no un polígono arbitrario.** El `planId` es el mismo hash de polígono canonicalizado + namespace + lado que `coverage.ts:828-829` ya calcula, y el catálogo está en `apps/api/src/features/civic-map/planes.ts`. Tres cosas de una: servidor y teléfono caen sobre exactamente las mismas celdas sin negociar nada; un polígono de 10.000 vértices con 4.000 celdas deja de ser un DoS de ray-casting sobre la función que también sirve la ingesta (ADR 0008); y el `maxCells` es explícito y coherente con `coverage.ts` (`DEFAULT_MAX_CELLS = 2.500`, `ABSOLUTE_MAX_CELLS = 10.000`) en vez de clampearse en silencio y romper la coincidencia de `cellId`. Un lado que deje celdas bajo 100 habitantes se rechaza con `422` y `ladoSugerido` (§2.9).

El servidor **no calcula: lee `celda_luz`** (§3.7), aplica la supresión de §2.9 y llama a `luzDeCeldas`. El cálculo lo hace el cron al cambio de hora, invirtiendo el bucle: recorta por el bbox del plan en SQL, proyecta cada señal una vez y saca `(row, col)` con dos divisiones sobre la grilla regular que `planTerritorialCoverage` ya devuelve, y usa `pointInCoverageArea` sólo para las celdas de frontera. El bucle de `conteos.ts:37` —`cells.map(… senales.filter(…))`— es O(celdas × señales) y `pointInCoverageArea` renormaliza el polígono en cada invocación: a 4.000 celdas y 10.000 señales son 40 millones de normalizaciones por corrida, y eso no entra en una función.

**El sobre lleva cobertura y sesgo**, porque la regla 5 pide las dos y hasta ahora sólo se entregaba una:

```ts
interface RespuestaCeldas {
  celdas: CeldaPublicada[];
  calculadoALas: string;
  cobertura: { celdasDelPlan: Magnitud; conSenal: Magnitud; suprimidas: Magnitud;
               sinDenominador: Magnitud };
  sesgo: readonly Sesgo[];
}
type Sesgo = { que: string; direccion: 'sobreestima'|'subestima'|'desconocida';
               sobre: string; fuente: string };
```

Tres entradas fijas, como mínimo: **densidad provincial pareja** (D-026: sobreestima la población del campo y por lo tanto **subestima su brillo**), **participación por teléfono y tiempo disponible** (dirección desconocida), y **supresión k = 5 sobre celda fija** (D-043: subestima las zonas de baja densidad, §2.9). Normalizar por población **no es** declarar sesgo: es una corrección, y encima una con sesgo propio, medido y citado en la cabecera de este documento. Un consumidor que recibe intensidades sin saber que el campo sale más apagado *por método* está haciendo exactamente la lectura que la regla 5 existe para prohibir.

### 4.6 `GET /api/v1/civic/metrica-norte`

```ts
interface MetricaNorte {
  necesidadesVerificadas: Magnitud;
  resueltasConElAutor: Magnitud;
  resueltasSinAutorIdentificable: Magnitud;
  resueltasSinRespuestaDelAutor: Magnitud;
  resueltasSinPoderPreguntar: Magnitud;
  expuestasYReparadas: Magnitud;
  cobertura: { celdasConSenal: Magnitud; celdasDelPlan: Magnitud | { tipo: 'sin_plan'; razon: string } };
  sesgo: readonly Sesgo[];
}
```

**Todo `Magnitud`, incluida la cobertura.** Hay un test que recorre el resultado y falla si encuentra un `number` pelado (`guardas-simulacion.test.ts`), y este endpoint entra bajo esa guarda: dejar `celdasConSenal: number` habría obligado, el primer día, a excluir el campo del test — y ahí muere la guarda. `celdasDelPlan` es una unión y no `number | null`, que preserva mejor la honestidad de `shareOfPlan`.

**`expuestasYReparadas` es la mitad de la métrica que hasta ahora no se medía.** La frase dice «sin exponer a personas vulnerables» y las cuatro specs la afirmaban por construcción en su §6 sin un solo término que la contara, cuando el dato ya está en la base: `count(distinct senal_id) from rastro_senal where tipo_evento in ('retencion_por_exposicion','redaccion')`. Se publica **al lado** y no se resta de los otros cuatro: no es un descuento, es el número de veces que el sistema tuvo que reparar una exposición. Un cero acá con miles de señales significa una de dos cosas —no pasó, o nadie lo reportó— y por eso va con su `Magnitud` y su nota, no como un logro.

**Nunca se suman los buckets en un total.** El número que oculta si le preguntamos a la persona afectada es exactamente el número que la métrica norte existe para no dejar publicar. Y el cuarto bucket existe porque «no contestó» y «nunca tuvimos cómo preguntarle» no son lo mismo (§2.7). La consulta:

```sql
with corroborada_alguna_vez as (
  select distinct senal_id from rastro_senal
  where tipo_evento = 'transicion' and estado_nuevo = 'corroborada'
)
select r.cierre_tipo, count(*) as n
from resoluciones r
join senales s on s.id = r.senal_id
join corroborada_alguna_vez c on c.senal_id = s.id
where s.tipo = 'necesidad'
  and r.estado = 'confirmada'
  and s.estado <> 'retirada'
  and s.retenida_en is null
  and (select count(*) from confirmaciones_de_resolucion rc
        where rc.resolucion_id = r.id and rc.cuenta) >= 2
group by r.cierre_tipo;
```

Selecciona por `s.tipo = 'necesidad'` y no por `clase = 'hecho'`, que mezclaría un pozo tapado con un saber corroborado y una olla que sigue abierta y los reportaría a los tres como necesidades resueltas; eso sólo es posible porque `tipo` vive en la **misma** tabla que la maquinaria de resolución, con FK compuesta `(tipo, clase)` al catálogo de B. Y el join contra el rastro es lo que hace verdadera la palabra «verificadas»: `estado = 'corroborada'` no alcanza, porque una señal que se corroboró y después venció está en `desactualizada` y sí califica.

### 4.7 `POST /api/v1/civic/evidencias`

Multipart, **máximo 4 MB**, con auth obligatoria (cookie `basta_actor` o Bearer de dispositivo) y cuota por actor y por día. Los 4 MB no son un gusto: el límite de cuerpo de una función serverless de Vercel es 4,5 MB y `vercel.json` reescribe todo `/api/…` a la única función, así que un multipart de 8 MB muere con 413 **antes** de llegar al handler — y el arreglo estándar, subida directa del cliente a Blob con token, elimina justo el punto donde el servidor olfatea los magic bytes. La subida pasa por la función, a propósito. Una foto re-codificada pesa ~250 KB: 4 MB sobra.

Olfatea magic bytes, rechaza si sobrevive un marcador de metadatos, lee `ancho`/`alto` del header sin decodificar píxeles, calcula `sha256`, sube a Blob con sufijo aleatorio y devuelve `{ id, url, sha256 }`. Las evidencias que no se enlazan a una señal o a una confirmación en 30 minutos se recolectan. Si la señal tiene `sensitivity = 'high'`, **rechaza con 409 y un texto que explica** que esa evidencia se queda en el teléfono; no es un error del usuario, es la política funcionando.

### 4.8 El alta del actor: lo que esta spec le exige

El actor se crea **una sola vez y en un solo lugar**, el de B (`§3.2`, `§4.8`): `POST /api/v1/civic/actor` es el camino web y `POST /api/v1/civic/devices/enroll` el camino de campo del mismo alta, no dos endpoints hermanos. `apps/mobile/src/civic/device-auth.ts:108` ya postea al segundo desde hace meses y el endpoint no existe; recibe `{ actorKey?, deviceSecret, platform, clientVersion }` y devuelve `{ actorKey, role: 'contributor', linked: false, accessToken, expiresAt }`, la forma exacta que el cliente ya valida en `device-auth.ts:58-64`.

Tres requisitos que esta spec le pone a esa alta, porque de ellos cuelga el umbral entero:

- **La `actorKey` la emite el servidor** (256 bits) en el primer enrolamiento. Que la eligiera el cliente la volvía gratis y adivinable: `for i in {1..10000}` y hay diez mil actores.
- **Se guardan dos hashes, no uno**: `actor_hash` (identidad) y `HMAC(pepper, deviceSecret)` (posesión). Un enrolamiento posterior de la misma `actorKey` con otro secreto se rechaza con `401`. Sin esto el `deviceSecret` es decorativo y cualquiera que aprenda una `actorKey` ajena puede enrolarse como esa persona, quemarle el cupo de unicidad en una señal y dispararle el detector de ráfagas encima.
- **Techo de enrolamientos por IP y por día.** No impide Sybil —nada lo impide sin fingerprinting— pero lo saca del terreno del `curl` gratis, y eso está declarado en §2.2 en vez de vendido como garantía.

Ni el `deviceSecret` ni la `actorKey` cruda se guardan: sólo sus hashes y `primer_evento_en`, que es lo que el detector de ráfagas necesita.

### 4.9 El cron de vigencia

Handler en `apps/api/src/features/civic-map/cron-vigencia.ts`, entrada en `scripts/build/bundle-api.ts` que emite `apps/api/dist-bundle/cron-vigencia.mjs`, stub commiteado `api/cron/vigencia.mjs` que lo reexporta, y las dos entradas en `vercel.json` (`functions` con `maxDuration`, `crons` con el schedule). Es el patrón exacto de `api/cron/rankings.mjs`: un `.ts` suelto en `api/cron/` no lo compila nadie y el cron devuelve 404 en producción sin fallar el build. Protegido con `CRON_SECRET` (ADR 0008 D3). Diario, salvo la pasada 6 que corre cada hora. Todas idempotentes, todas dejando evento:

1. `corroborada` / `resuelta` con `vence_el < now()` → `por_verificar`, motivo `revision_de_vigencia` o `revision_de_resolucion`, `ronda + 1`.
2. `por_verificar` con `caduca_el < now()` → `desactualizada`, motivo `caducidad_por_silencio`.
3. Resoluciones con `autor_vence_el < now()` y `autor_estado = 'pendiente'` → `sin_respuesta`, y cierre si las dos confirmaciones ya estaban. Resoluciones con 90 días desde `propuesta_en` y `autor_preguntado_en is null` → `no_hubo_como_preguntar`.
4. Retenciones por `unsafe` de más de 72 h sin revisión humana → se listan para revisión y se loguean. **Esta pasada corre antes que el cron del volcado de D en el orden del día**: una retención que llega después del corte queda estampada en un CSV firmado que ya no se puede retirar. Una retención que nadie mira es un borrado con otro nombre.
5. **Publicación**: `enviada` de clase `hecho` o `acto`, con `province_id not null` y sin evidencia pendiente → `por_verificar`, `publicada_en = now()`, los dos relojes seteados, evento `publicacion`. Es la pasada que hace que la máquina arranque (§2.4).
6. **Recálculo de `celda_luz`** para los planes publicados, al cambio de hora, uniendo adherentes (§2.8, §3.7).
7. Reconciliación: transiciones sin evento → evento con `motivo: 'reconciliado'`.

Cada pasada es una sentencia con `returning`, y el conteo de lo que hizo se loguea. Un cron que no dice cuánto movió es un cron que nadie va a auditar.

### 4.10 Casos límite, decididos

| Caso | Qué pasa |
|---|---|
| Confirmo dos veces la misma señal en la misma ronda | `409`, recibo `ya_confirmaste`. No es error: el outbox reintenta y tiene que poder. El índice único `(senal_id, ronda, actor_id)` **es** la idempotencia; no hace falta una columna aparte |
| Confirmo mi propia señal | No se inserta; recibo `no_registrada` con razón `es_tuya`. No se oculta |
| Confirmo una señal sin autor atribuible | No se inserta; razón `sin_autor_atribuible`. La señal existe, se cuenta y no entra al circuito (§2.2) |
| Confirmo sin dar ubicación | Se registra, `cuenta: false`, `proximidad: 'no_declarada'` |
| Confirmo con `know_place` una señal con punto | Se registra, `cuenta: false`: queda su palabra con su procedencia (§2.1) |
| Confirmo una señal `province` sin punto | `proximidad: 'inaplicable'`, `cuenta: true` |
| Confirmo un sueño | `422` con texto: los deseos se deliberan, no se comprueban (regla 11) |
| Corrección neta sobre una corroborada | Vuelve a `por_verificar`, `ronda + 1`, motivo `correccion`, con la `nota` que el `CHECK` exigió |
| Una `stale` sobre una `por_verificar` | Se registra; no desactualiza hasta la segunda |
| Confirmo una `desactualizada` con `confirm` | Vuelve a `por_verificar` en la misma ronda: reabrir la pregunta no es afirmar la respuesta |
| Un `unsafe` sobre una corroborada | Sale de las cuatro superficies públicas —mapa, celdas, cola y registro de D—, **el estado no cambia** y se abre revisión con plazo (§2.6) |
| Propongo resolver una `por_verificar` | `422`: primero hay que comprobar que existe (§2.7) |
| Acepto una conexión de la que no soy ninguno de los dos lados | `403`. La conexión queda como estaba |
| Propongo una conexión con un extremo sin actor | Queda `propuesta` con `razonBloqueo: 'sin_actor_de_un_lado'`, visible en la ficha (§2.14) |
| El pepper rota entre dos confirmaciones de la misma persona | Cuentan como una: el `actor_id` es el mismo. El sobreconteo sólo aparece si además se rota la `actor_key` |
| Se borra la evidencia de una confirmación | `evidencia_id` queda `null`, la confirmación sigue contando, el rastro guarda el hash |

---

## §5 Lo que se rompe

| Archivo | Qué cambia | Por qué |
|---|---|---|
| `packages/civic-core/src/brillo.ts:21-35` | `ConteoCelda` gana **`senalesSinActor`**, y los comentarios de `verificables` y `confirmaciones` pasan a decir la definición exacta de §2.8. **La fórmula y las variantes de `Brillo` no cambian una línea** | Sin el campo, una celda de cincuenta señales sin actor da `participacion: 0`: el `0` que significa «nadie habló» en el módulo escrito para prohibirlo |
| `packages/civic-core/src/coeficientes-luz.ts` | **Importa** `UMBRAL_SUPRESION` de su hermano nuevo. No declara `VOCES_MINIMAS_POR_CELDA` | Un umbral de privacidad en dos archivos se desincroniza la primera vez que alguien lo sube |
| `packages/civic-core/src/coeficientes-corroboracion.ts` | **Nuevo.** `UMBRAL_CORROBORACION = 2`, `UMBRAL_SUPRESION = 5`, `RADIO_CONFIRMACION_M = 150`, `TECHO_CONFIRMACIONES_HORA = 90`, `ESPERA_AUTOR_DIAS = 30`, `ESPERA_ENTREGA_DIAS = 90`, `RETENCION_REVISION_H = 72`, `MAX_HECHOS_POR_ACTOR_POR_CELDA = 20` y **todas** las vidas útiles, incluidas las de clase de B | Mismo patrón que `simulacion/coeficientes.ts`: cambiar una constante es cambiar una constante a la vista, y cuánto dura algo se busca en un solo archivo |
| `packages/civic-core/src/rastro.ts` | **Nuevo.** Canonicalizador + preimagen partida (`compromiso` / `hash`). Sin reloj, sin red, sin disco; el hash entra por parámetro | El paquete no puede depender de `crypto.subtle` ni de `expo-crypto` |
| `packages/civic-core/src/tiempo-publico.ts` | **Nuevo.** La única regla de redondeo: hora por defecto, día con `sensitivity='high'`, día en el volcado. B y D la importan | Tres redondeos distintos para el mismo riesgo es la manera de que uno se olvide |
| `packages/civic-core/src/coverage.ts` | Gana `asignarACelda(plan, punto): string \| null` sobre la grilla regular | El bucle de `conteos.ts` es O(celdas × señales) y renormaliza el polígono en cada punto (§4.5) |
| `packages/db/src/schema/_bytea.ts` | **Nuevo**, con `toDriver`. Lo usan `actores` (B) y las cinco columnas de hash de acá | Sin `toDriver`, un `Uint8Array` no es `instanceof Buffer` y las columnas guardan basura |
| `packages/db/src/repositories/civic-map.ts:27-43` | `SenalMapa` gana `clase` y `estado`, y el estado sale del catálogo `estados_senal`, no de una unión inventada por capa | Con una sola tabla y `estado NOT NULL`, la regla 4 se cumple con la columna: ninguna capa tiene que inventar un valor ni mandar `null` bajo un tipo que no lo admite |
| `apps/api/src/features/mandato/classifier.ts` | Toda escritura de máquina que cambie un valor deja evento con `actor_clase: 'maquina'`. El intento que no escribe nada usa `tema_intentado_en` (B) y no deja evento | Regla 6 auditable, sin sumar una fila de rastro a toda señal (§2.12) |
| `apps/api/src/features/civic-map/routes.ts` | Nueve rutas nuevas: `confirmaciones`, `resolucion`, `resolucion/confirmaciones`, `conexiones`, `conexiones/:id/respuesta`, `rastro`, `map/cells`, `evidencias`, `metrica-norte` | — |
| `apps/api/src/lib/config.ts` | `ACTOR_PEPPER`, `BLOB_READ_WRITE_TOKEN`, `DATABASE_URL` apuntando a `v2_app`, y el chequeo de arranque que loguea `WARN` si la conexión puede escribir `rastro_senal`. `actor_key`, `deviceSecret` y la cookie entran a la lista de redacción del logger | §2.11 capas 1 y 2, y §2.2: un trace de error no puede capturar la identidad |
| `apps/mobile/src/civic/quality.ts:20,23,35` | El `2` se importa de `coeficientes-corroboracion.ts`; `confidence: 0` y `0.15` pasan a unión discriminada; `assessObservation` deja de ser fuente de verdad — es el eco local de lo que el servidor decidió | Un `0` que significa «no sé» adentro del módulo que decide si algo está comprobado (D-041) |
| `apps/mobile/src/civic/conteos.ts:22-26,47-52` | `confirmada` pasa a «estado ∈ {corroborada, resuelta}»; `verificable` lo determina la clase que trae la señal; `vocesDistintas` suma adherentes | La lista de tres del comentario es del mundo de seis tipos, y la adhesión enciende la celda (§2.8) |
| `apps/web/src/components/papel/primitives/ChipEstado.tsx` | **Lo define B** con el vocabulario de `estados_senal`; esta spec lo consume tal cual | Un chip con tres juegos de valores distintos escritos por tres specs es el defecto de origen otra vez |
| `apps/web/src/pages/ElMapa/instrumento/useVistaMapa.ts:73` | La derivación de tipo trae también el estado | — |
| `docs/DEUDAS.md` | D-028 (la segunda, `:677`) **resuelta** por §2.9. Entran **D-041** (`quality.ts:20` devuelve `confidence: 0` para decir «no evaluada»), **D-042** (`useModoMapa.tsx:30` duplica a mano el halo que `publicLocationUncertaintyKm` ya calcula) y **D-043** (k = 5 sobre celda fija suprime estructuralmente la baja densidad; §2.9 lo acota con el `422` y lo declara en `sesgo`, no lo elimina) | Los ordinales están repartidos por spec: A D-034/D-035, B D-036 a D-040, C D-041 a D-043. Tres entradas con el mismo id pasan la guarda de CI, que mide por título, y dejan el registro inservible |

**Lo que NO se toca:** la fórmula de `brillo.ts`, `location-policy.ts`, `poblacion.ts`, `geo.ts` y los 18 archivos de test de civic-core. Y **nada de `pulso.ts`**: `proposals` y `pulse_signals` dejan de recibir escrituras con B, así que arreglar `castVote` habría sido reparar una puerta de una casa que se demuele.

---

## §6 Contra la Constitución

| Regla | Qué exige | Cómo la cumple esta spec |
|---|---|---|
| **1 · Offline-first** | Nunca offline-only | `borrador` vive sólo en el teléfono y no está en `estados_senal` (§2.4). Confirmar entra por el outbox y el índice único `(senal_id, ronda, actor_id)` hace la idempotencia real (§4.1) |
| **2 · Ubicación exacta privada por defecto** | Lo público usa precisión reducida | La ubicación del confirmante **no se guarda**: se compara y se descarta, sin bucket de distancia (§2.3). El EXIF muere en el teléfono, así que la coordenada exacta nunca sale del aparato (§2.10). Y el instante público lo redondea una sola función para las cuatro specs (§2.11) |
| **3 · Bitácora personal nunca se publica** | — | La palabra «bitácora» queda para lo privado: lo que esta spec publica se llama `rastro` y es otra cosa (§3.5). La evidencia de una señal `sensitivity='high'` **no se sube** (§2.10), y una necesidad sensible no se reparte como tarea a desconocidos (§2.4) |
| **4 · Estado de calidad siempre visible** | Seis estados | Los seis del recorrido de calidad, en **una** columna, con el catálogo `(estado, clase)` de B decidiendo cuál admite cada clase (§2.4). Un conflicto vuelve a `por_verificar`, no a un séptimo estado inventado. Los actos corren la máquina en la misma columna, para que «su estado» sea uno solo |
| **5 · Participación ≠ representatividad** | Toda síntesis muestra cobertura **y sesgo** | `/map/cells` y `/metrica-norte` devuelven `cobertura` **y `sesgo`** en el mismo sobre, con las tres entradas fijas —densidad pareja de D-026, participación por teléfono, supresión k=5 de D-043— y su dirección declarada (§4.5) |
| **6 · La IA sugiere, no determina** | — | El evento `sugerencia_automatica` **no tiene** `estado_nuevo`, y hay un `CHECK` que lo impide (§3.5). La respuesta humana es un evento aparte, así que la precisión del modelo se audita desde el rastro (§2.12) |
| **7 · Sin ranking público individual** | — | No existe ningún lugar del esquema con un contador público por persona. `actor_hash` no sale nunca y vive en una tabla lateral que se puede vaciar. El premio es la celda encendida, en plural y con lugar (§2.13) |
| **8 · Premiar utilidad, corroboración, cobertura difícil y resolución; no volumen** | La regla nombra las brasas, que El Registro R7 borró | Se cita por su **contenido**. `brillo` cuenta personas distintas y no señales, así que el volumen bruto no compra luz —y `verificables` se topea por actor para que tampoco compre oscuridad (§2.8)—; la nitidez sólo sube confirmando; la métrica norte mide resolución. La cobertura difícil es lo que k=5 castiga, y por eso el lado se adapta o se declara (§2.9). Nota: el sujeto de la regla ya no existe y le corresponde una enmienda (§7) |
| **9 · Consentimiento comprensible y revocable** | — | Cero fingerprinting (§2.2). Se pregunta antes de plantar el identificador, **con el texto único que exporta D**, se puede rotar por endpoint —la cookie es httpOnly y ningún script la borra— y se puede **retirar**, que vacía el `actor_hash` y corta el vínculo para siempre sin romper los conteos. Retirar *lo escrito* es `estado = 'retirada'`, y esta spec no lo estorba con ningún `CHECK` propio (§2.4). Cada confirmación devuelve un recibo que dice si contó y por qué |
| **10 · Teléfonos modestos y redes intermitentes** | — | Confirmar es un POST de ~200 bytes con reintento idempotente. La evidencia se re-codifica en el aparato (~250 KB). El mapa nunca trae imágenes en la lista, y `/map/cells` lee una tabla materializada y cacheable |
| **11 · Hechos se corroboran, deseos se deliberan** | Nunca se confunden | La mitad de corroborar está entera: un `422` al confirmar un deseo, y el catálogo `(estado, clase)` que impide desde la base que un deseo entre a la máquina. **La mitad de deliberar no se construye, y se declara en pantalla**, con este texto en la ficha de todo deseo: *«Todavía no se puede deliberar. Por ahora un sueño sólo recibe adhesiones. Lo estamos construyendo.»* Decirlo es peor para la demo y mejor para la regla: un producto que muestra un botón de deliberar que no delibera confunde las dos cosas exactamente como la regla prohíbe |
| **Métrica norte** | Necesidades verificadas con resolución confirmada, sin exponer a personas vulnerables | Cuatro buckets que **nunca** se suman, sobre `tipo = 'necesidad'` y sobre señales que estuvieron `corroborada` según el rastro (§4.6). Y la segunda mitad, que hasta ahora sólo se afirmaba, ahora se cuenta: `expuestasYReparadas`. El «sin exponer» lo sostienen la supresión k=5, el congelamiento horario, la evidencia sensible que no viaja, la cola que no reparte necesidades sensibles, y el `unsafe` de umbral uno que ahora también apaga el archivo |
| **Ciclo soberano** | *«Una necesidad no se considera resuelta hasta que el resultado se confirma»* | Quien resuelve no cierra; hacen falta dos confirmaciones **en su propia ronda y su propia tabla** y la palabra del autor cuando se le pudo preguntar (§2.7). Y la etapa Tejer deja de ser una palabra: `conexiones` con aceptación mutua (§2.14) |

---

## §7 Lo que esta spec NO hace

Las obligaciones van dirigidas **por documento y por sección**. Las cuatro cabeceras nombraban cuatro series distintas, y por eso tres de los huecos bloqueantes de la revisión nacieron de obligaciones firmadas y mandadas a un documento que no las iba a leer.

**A · `docs/specs/2026-08-11-a-la-tierra.md` — el callejero y la jerarquía territorial.**
- No siembra calles ni arregla `geographic_locations.province_id`.
- **Le pide a A §2.5:** que la precisión que produce una dirección verificada siga siendo un valor de `LocationPrecision`, porque la puerta de proximidad (§2.3) lo usa como sumando. Si A inserta un escalón nuevo entre `exact` y `100m` para «calle sí, altura no», el radio de esas señales lo hereda solo. Lo que A **no puede** hacer es publicar una precisión que no esté en `PRECISION_ORDER`: `publicLocationUncertaintyKm` devolvería un número indefinido y la puerta se abriría sola.
- **Toma de A §7.2** la mitad que sí le corresponde: el gesto de confirmar en campo. El cliente del paquete offline y el «cerca tuyo» no son de acá (van a B §5 y a D).

**B · `docs/specs/2026-08-11-b-la-senal.md` — la señal, el actor y la ingesta.**
- No define el vocabulario, no crea `senales`, no crea `actores`, no diseña la adhesión ni el retiro de lo escrito.
- **Le pide a B §3.1**, y es lo que decide si esta spec funciona: que `estados_senal` incluya los pares `('por_verificar','acto')` y `('corroborada','acto')`, y que `acto_coherente` los admita con `desenlace = 'abierto'`. Sin ellos ningún `compromiso` alcanza jamás un estado confirmable, la sentencia de §4.1 nunca inserta, el desenlace nunca sale de `abierto` y todo compromiso queda pinchado para siempre — **sin error y sin aviso**, que es la peor forma de romperse.
- **Le pide a B §3.1:** que `senales.motivo` exista con el vocabulario cerrado de §2.6 (`ya_no_esta`, `caducidad_por_silencio`, `correccion`, `revision_de_vigencia`, `revision_de_resolucion`, `compromiso_vencido`, `compromiso_incumplido`). El cierre de un compromiso escribe `estado` + `motivo` + su desenlace, y **no cierra automáticamente** la necesidad que decía atender, ni al revés: el enlace de una resolución es informativo, nunca disparador.
- **Le pide a B §4.7:** que la ingesta **pregunte y setee `location_role` y `sensitivity` en los nueve tipos, no en cuatro**. Hoy toda voz web entra como `subject`/`low`, así que `publishedPrecision` no engrosa nunca, el 409 de §4.7 no se dispara nunca y la cola protegida de §2.4 no protege a nadie; y con la pregunta de la casa en sólo cuatro tipos, un `saber` —el tipo diseñado para hablar de lo que pasa en un lugar— nunca alcanza `high` y su foto se sube igual. La mitad «sin exponer» de la métrica norte cuelga de una columna que hoy nadie escribe.
- **Le pide a B §3.6:** que borre `senal_estado_historia`. Hay un solo libro de transiciones y es `rastro_senal` (§3.5); dos dejarían la guarda de cadena completa roja de forma permanente.
- **Le pide a B §5:** que la `adhesión` no se cuente como confirmación. Un «yo también» es una voz que suma a `vocesDistintas` —y enciende la celda de la señal que apoya (§2.8)—; una confirmación es «fui y está».
- **Le pide a B §4.9:** que cierre la fuga viva de identidad (`submitted_as` con `captura:<uuid>`) en la misma migración que mata `marcaDeCaptura`. Esta spec la da por cerrada y la verifica en §8.1.
- **Le ofrece a B:** el `bytea` con `toDriver` de §3.1, y la estructura de `actores` entera —subrogado, `actor_hash`, `secreto_hash`, `pepper_version`, `primer_evento_en`, `retirado_en`— con su consentimiento y su retiro. B agrega `user_id` con unique parcial y la fusión al linkear, que la decisión 7 necesita y esta spec no cubre.

**D · `docs/specs/2026-08-11-d-el-registro-publico.md` — el feed, la API abierta y el volcado.**
- No diseña el feed, ni la paginación por cursor, ni el formato de la descarga.
- **Le pide a D §2.7, y es bloqueante:** que el predicado incondicional de publicabilidad gane **`and retenida_en is null`** (más la exclusión de `retirada`), y que la guarda de filas de D §8.4.4 siembre una señal retenida y afirme su ausencia en los tres formatos. Sin esa línea, el único canal por el que alguien puede decir «esto expone a una persona» apaga el mapa y deja la señal estampada en un CSV firmado con sha256 y retención perpetua — la métrica norte rota en su segunda mitad, por omisión.
- **Le pide a D §4.3.4:** que el campo por fila deje de llamarse `confirmaciones`. `confirmaciones` es la definición de celda de §2.8 —señales corroboradas— y el campo de D son actores que confirmaron una señal: dos cantidades con el mismo nombre alimentando dos números públicos. Pasa a `confirmacionesContadas`, y `/esquema` lleva las dos definiciones al lado para que nadie las vuelva a mezclar.
- **Le pide a D §4.4.5:** que `PROCEDENCIA.md` **cite** `/metrica-norte` y no recalcule la métrica sobre las filas del volcado. Dos números públicos sobre el mismo hecho, de dos tablas y con dos unidades, y el que va a terminar citado afuera es el del archivo.
- **Le pide a D §4.3.4:** que el volcado **no exporte** `actor_hash`, ni `actor_id`, ni `evidencia.subida_por`, ni ninguna columna del rastro que los lleve; que exporte por señal el `estado`, la `ronda` y el conteo, **nunca las filas** de confirmación (exportar filas permitiría reconstruir la coactividad de una persona por coincidencia temporal); y que el feed muestre el estado de calidad en cada fila, porque la regla 4 dice *siempre*.
- **Le pide a D §4.7:** que importe `tiempo-publico.ts` (§2.11) en vez de declarar su propio redondeo, y que su cron del volcado corra **después** de la pasada 4 del cron de vigencia (§4.9).
- **Le ofrece a D:** el texto de consentimiento del identificador se unifica en la constante que D ya especificó en `packages/shared/src/open-data/`; esta spec la importa y no escribe la suya. Y el sello diario de las cabezas de cadena, anclado en el repo público (§2.11): es lo que convierte la trazabilidad en verificable por terceros, y son 32 bytes por señal activa.

**Lo que no le corresponde a ninguna de las cuatro:**
- **La deliberación no se construye.** Es la decisión del dueño del producto, tomada con el alcance a la vista: el sistema sale con la corroboración blindada y la deliberación en cero, y lo dice en pantalla (§6, regla 11). Cuando entre, entra como spec propia y con la tabla `deliberaciones` que B ya nombró.
- **El documento vinculante necesita dos enmiendas:** la regla 8 nombra las brasas, que R7 borró; y «Las tres superficies» dice tres y lista cuatro, y una de las cuatro es El Cielo, que también se borró.
- La contraseña del rol `v2_app` y el cambio de `DATABASE_URL` los hace **una persona en Neon**. La migración escribe el `revoke`; el `WARN` de arranque (§2.11) es lo que avisa si el paso humano no ocurrió.
- **La decisión de plan de Neon**, después de correr la suma conjunta de §3.8 con los incrementales medidos de A y de B.
- La atestación de app (Play Integrity / DeviceCheck) que le daría dientes a la puerta de proximidad necesita un ADR (§2.3).
- D-014 sigue viva: los tests de integración corren contra la misma base que sirve el sitio. Esta spec agrega endpoints de escritura y **hereda el riesgo**.

---

## §8 Verificación

### 8.1 Guardas ejecutables

Con la misma redacción de frase-afirmación de `packages/civic-core/src/__tests__/brillo-guardas.test.ts`, y las fixtures de `__tests__/_conteo.ts`, que está fuera del glob a propósito por el guión bajo. Las de tipos van en `__guardas__/imposibles.ts` y no en un `*.test.ts`, porque en este repo los tests no se type-checkean nunca.

| Guarda | Qué protege |
|---|---|
| «una confirmación no alcanza; dos alcanzan» | El umbral, leído del coeficiente y no de un literal |
| «una voz de campo sin evidencia queda mirable por terceros en el mismo POST» | Que `enviada` tenga salida y la máquina arranque |
| «nadie corrobora lo suyo, y una señal sin autor atribuible no entra al circuito y el recibo lo dice» | El par autor-confirmante, con `IS DISTINCT FROM` y sin prohibir cargar sin actor |
| «un compromiso llega a corroborada y de ahí a resuelta» | Los dos pares de `estados_senal` que B tiene que poblar; sin ellos falla en silencio |
| «la misma persona no cuenta dos veces en la misma ronda; sí cuenta en la siguiente» | El índice único con `ronda` adentro y que la revisión reabra de verdad |
| «una confirmación sin ubicación se registra y no cuenta» | Que `no_declarada` sea un tercer estado y no un `false` |
| «a 400 m de un punto exacto no cuenta; a 400 m de un punto de 500 m sí» | Que la puerta sume la incertidumbre publicada |
| «`know_place` sobre una señal con punto no suma al umbral» | Que el método sea procedencia con peso y no adorno |
| «un `unsafe` saca la señal del mapa, de las celdas, de la cola **y del volcado** en el mismo POST, y no toca su estado» | Que la retención sea visibilidad y no calidad, y que llegue a la superficie irreversible |
| «una necesidad sensible no aparece en la cola de verificación de un desconocido» | La métrica norte, del lado del gesto, con la llave en `sensitivity` y no en el rol |
| «un sueño no se puede confirmar, y su ficha dice que todavía no se puede deliberar» | Regla 11, las dos mitades: la que se construyó y la que se declara |
| «una sugerencia automática no puede mover el estado» | Regla 6, contra el `CHECK`, no contra el código |
| «dos confirmaciones simultáneas en el umbral producen una sola transición» | La carrera de §4.1, con dos `POST` en paralelo |
| «dos correcciones no tumban una señal con diez confirmaciones» | La corrección neta, contra la censura barata |
| «`confirmaciones` nunca supera a `verificables`» | Que la definición de §2.8 sea la que se implementó |
| «una adhesión enciende la celda de la señal que apoya, no la del adherente» | La palanca principal del producto en el único canal visual |
| «cien hechos de una sola persona en una celda no apagan su nitidez» | El tope por actor en el denominador |
| «una celda con todos sus hechos desactualizados no se dibuja igual que una de puros sueños» | Que `desactualizada` esté en el denominador |
| «con 4 voces sale suprimida; con 0 y sin señales, silencio; con 0 y señales sin actor, `sin_actor_conocido`; con 5, luz» | D-028, los cuatro estados, y que `senalesSinActor` viaje |
| «el endpoint de celdas no devuelve identificadores de persona, y declara su sesgo» | La razón por la que existe, y la regla 5 entera |
| «una escritura cívica web sin consentimiento no planta el identificador; retirar un actor corta el vínculo y no mueve un conteo» | Regla 9: el momento del sí y que «revocable» sea cierto |
| «ni `actor_hash` ni `actor_key` ni `deviceSecret` aparecen en ninguna línea de log ni en la respuesta del rastro, y `submitted_as` no sale por `/api/open-data/dreams`» | Recorrido del objeto serializado y del logger, no inspección del tipo |
| «una fila de confirmación no permite reconstruir dónde estuvo una persona» | Sin bucket, sin índice por actor, con el instante redondeado |
| «el rastro público no devuelve el instante exacto de creación, y aun así el verificador cierra la cadena» | La partición de la preimagen: `ocurrio_en` adentro del compromiso, `publicado_en` afuera |
| «`datos.ocurrio_en` y la columna `ocurrio_en` coinciden en toda fila del rastro» | Si divergen, el compromiso no abre y la cadena queda invalidada en silencio |
| «una señal corroborada con `vence_el` cumplido vuelve a por_verificar, no a desactualizada» | Que vencerse y desactualizarse no sean la misma palabra |
| «una señal publicada y nunca confirmada tiene los dos relojes seteados y termina caducando» | Que los relojes se seteen al publicar y no al corroborar |
| «una necesidad que nunca se corroboró no puede cerrarse como resuelta» | La palabra «verificadas» de la métrica norte, contra el rastro y no contra el estado actual |
| «una resolución cuyo autor nunca pudo ser contactado cierra en su propio bucket, no en el de sin respuesta» | Que los cuatro buckets nunca se sumen |
| «la métrica norte no devuelve un `number` pelado, ni en `cobertura`, y publica `expuestasYReparadas`» | Extensión de `guardas-simulacion.test.ts`, y la segunda mitad de la frase |
| «una conexión con una sola aceptación no queda aceptada, y quien no es de ninguno de los dos lados recibe 403» | Que nadie cuelgue su olla de la carencia de otro |
| «una foto con EXIF se rechaza; la misma sin EXIF entra; una de 5 MB se rechaza antes; una de una señal `high` se rechaza con explicación» | El pipeline de evidencia, el techo de 4 MB y la regla 3 |
| «borrar una evidencia deja el evento y conserva el hash» | Append-only compatible con el borrado |
| «reescribir una fila del rastro rompe la cadena, y el verificador la recorre con sólo la respuesta pública» | La capa 2 de §2.11, sobre datos y desde afuera |
| «ninguna confirmación cambia de `cuenta` sin su evento» | Que el bit que decide si algo está comprobado no se mueva en silencio |
| «ningún repositorio hace `.update()` ni `.delete()` sobre `rastroSenal`» | La capa 3 de §2.11, por grep |
| «la API arranca contra un rol sin `UPDATE` sobre `rastro_senal`, y loguea WARN si lo tiene» | Que la capa 1 no exista sólo en el archivo de migración |
| «veinte confirmantes detrás de una misma IP saliente no se bloquean entre sí» | CGNAT, contra el DoS accidental sobre una campaña |
| «`UMBRAL_SUPRESION` es la única constante con el k de la supresión en todo el árbol» | Que no vuelva a haber dos números iguales para la misma decisión |

### 8.2 Consultas concretas

**Nitidez de una celda, a mano, para contrastar con el endpoint:**

```sql
with en_celda as (
  select s.id, s.clase, s.estado, s.actor_id
  from senales s
  where s.lat between $1 and $2 and s.lng between $3 and $4
    and s.retenida_en is null and s.estado <> 'retirada'
    and s.creada_en < date_trunc('hour', now())
)
select
  count(*) filter (where clase in ('hecho','acto')
                     and estado in ('por_verificar','corroborada','resuelta','desactualizada')) as verificables,
  count(*) filter (where clase in ('hecho','acto') and estado in ('corroborada','resuelta'))    as confirmaciones,
  count(*) filter (where actor_id is null)                                                      as senales_sin_actor,
  (select count(distinct a) from (
      select actor_id as a from en_celda where actor_id is not null
      union
      select ad.actor_id from adhesiones ad join en_celda c on c.id = ad.senal_id
   ) v)                                                                                         as voces_distintas
from en_celda;
```

`senales_sin_actor` sale al lado y no plegado en `voces_distintas`: `count(distinct)` ignora los NULL, y un cero que significa «no sé quién» pintaría la celda como «nadie habló». El `union` con `adhesiones` es lo que hace que una adhesión encienda la celda de la señal que apoya y no la del adherente, que no tiene punto propio.

**Que ninguna señal esté corroborada sin las confirmaciones que lo justifiquen** (cero filas, siempre):

```sql
select s.id
from senales s
join lateral (select (b.datos->>'umbral_vigente')::int as umbral
              from rastro_senal b
              where b.senal_id = s.id and b.tipo_evento = 'transicion'
                and b.estado_nuevo = 'corroborada'
              order by b.seq desc limit 1) t on true
where s.estado in ('corroborada','resuelta')
  and (select count(*) from confirmaciones c
        where c.senal_id = s.id and c.ronda = s.ronda
          and c.veredicto = 'confirm' and c.cuenta) < t.umbral;
```

El umbral sale **del evento de transición** y no de `max(umbral_vigente)` sobre las filas: con `max`, una confirmación posterior estampada con un umbral más alto —y que ni siquiera cuenta— convertiría en inválida una corroboración perfectamente legítima. La consulta tiene que juzgar cada señal con la regla que corría el día en que se corroboró.

**Que ninguna transición carezca de evento** (cero filas):

```sql
select s.id, s.estado
from senales s
where s.estado <> 'enviada'
  and not exists (select 1 from rastro_senal b
                   where b.senal_id = s.id and b.estado_nuevo = s.estado
                     and b.ocurrio_en >= s.estado_desde - interval '5 seconds');
```

La ventana contra `estado_desde` es lo que evita el falso negativo del caso reincidente: una señal corroborada, vencida y re-corroborada tiene un evento viejo con ese mismo `estado_nuevo` y pasaría el test aunque la segunda transición no haya dejado rastro. La pasada 7 del cron usa la misma condición.

**Que la cadena de una señal esté entera** (cero huecos):

```sql
select senal_id, count(*) as eventos, max(seq) as ultimo
from rastro_senal group by senal_id having count(*) <> max(seq);
```

**La precisión del detector de duplicados, sin instrumentar nada:**

```sql
select s.datos->>'motor' as motor, s.datos->>'version' as version,
       count(*) filter (where h.datos->>'respuesta' = 'si')::float / count(*) as acierto
from rastro_senal s
join rastro_senal h on h.tipo_evento = 'decision_humana'
                   and (h.datos->>'sugerencia_id')::bigint = s.id
where s.tipo_evento = 'sugerencia_automatica'
group by 1, 2;
```

### 8.3 Listo cuando

0. La migración `0015` de B está aplicada: `senales`, `actores`, `tipos_senal` y `estados_senal` existen, y `estados_senal` incluye `('por_verificar','acto')` y `('corroborada','acto')`.
1. **La suma conjunta de §3.8 está corrida con los incrementales medidos de A y de B, y la decisión de plan tomada.** Antes de escribir una línea de `rastro_senal`.
2. `pnpm verify` verde, con tests de integración contra Postgres real —en una rama fresca, donde `create role v2_app` corre por primera vez— para las nueve rutas nuevas.
3. Una voz de campo pasa de `enviada` a `por_verificar` en el mismo POST y de ahí a `corroborada` con dos confirmaciones de dos aparatos enrolados distintos a menos de 150 m; la tercera no cambia nada y lo dice.
4. `GET /api/v1/civic/map/cells` devuelve `suprimida` con cuatro voces y `luz` con cinco, las cuatro variantes son distinguibles, una adhesión mueve `vocesDistintas`, y el sobre trae `cobertura`, `sesgo` y `calculadoALas`.
5. `nitidezDeCelda` recibe números que vienen de la base y no de una fixture, y **la fórmula de `brillo.ts` no cambió una línea** aunque `ConteoCelda` haya ganado su campo.
6. El rastro de una señal se lee entero desde la API sin que aparezca un solo identificador de persona **ni un instante exacto**, y un verificador externo recorre su cadena usando sólo esa respuesta.
7. `revoke update, delete, truncate on rastro_senal from v2_app` está aplicado, la API arranca con `v2_app`, lee todo lo que necesita, un intento de `UPDATE` falla con error del motor y no con un `if`, y el `WARN` de arranque aparece si se la conecta como dueña.
8. `GET /api/v1/civic/metrica-norte` devuelve `Magnitud` en todos sus números, cuatro buckets que no se suman en ningún lado, y `expuestasYReparadas` al lado.
9. Un `unsafe` deja la señal fuera del volcado del día siguiente, verificado sobre el archivo y no sobre el endpoint.
10. Una conexión `recurso → necesidad` se propone, se acepta de los dos lados, y aparece como enlace disponible al proponer la resolución sin haberla disparado.
11. Retirar un actor deja el `actor_hash` en `null` y **no mueve un solo conteo por celda**.
12. D-028 (la segunda) está marcada resuelta con su diseño citado, y D-041, D-042 y D-043 están anotadas en su rango.

---

## §9 Riesgos

| Riesgo | Mitigación |
|---|---|
| **Sybil: la identidad seudónima es barata** | No se impide sin fingerprinting, así que se encarece (binding de secreto, `actorKey` del servidor, techo de enrolamientos) y se **declara** en la tabla de §2.2. Es el riesgo del que cuelgan el umbral, k=5 y `vocesDistintas`, y no tiene solución limpia dentro de la regla 9 |
| **La puerta de proximidad no atesta nada** | Está escrito en §2.1, §2.3 y §2.13 en vez de vendido como garantía, y la fila guarda `proximidad_procedencia`. Con dientes pediría atestación de app, que necesita ADR |
| k = 5 sobre celda fija suprime estructuralmente la baja densidad (D-043) | El endpoint rechaza con `422` y `ladoSugerido` los lados que dejan celdas bajo 100 habitantes, y el resto va escrito en el campo `sesgo`. Es un sesgo que se apila con el de D-026 en la misma dirección: el interior sale doblemente apagado y **la respuesta lo dice** |
| La puerta deja fuera a quien confirma desde su casa mirando por la ventana | Su confirmación se registra y aparece en la ficha con `know_place`: su palabra queda, con su procedencia. Sólo no suma al umbral |
| Con cero usuarios, todo el mapa sale suprimido y parece roto | Es la verdad, y El Registro §6.2 ya decidió que el gris es la marca. `silencio`, `sin_actor_conocido` y `suprimida` se distinguen, así que el mapa dice cuál de las tres cosas pasa |
| **Las cuatro specs juntas no entran en la rama** | ≈660 MB a 100.000 señales contra 512 MB, techo conjunto ~68.000 (§3.8). El número existe y está escrito; la medición va antes de la decisión de plan, y el archivado frío del rastro entra en esta rebanada porque a cuatro quintos del consumo ninguna decisión de plan lo vuelve irrelevante |
| `unsafe` con umbral uno es una palanca de censura | Retener no borra, no cambia el estado, es reversible, deja rastro de quién lo disparó y abre revisión con plazo de 72 h que el cron vigila. El costo del abuso son horas; el del error inverso, exponer a una persona |
| Vercel Blob es lock-in | El `sha256` en la fila hace que migrar sea una re-subida dirigida por la base. Se paga a cambio de no sumar un segundo lugar donde viven secretos (ADR 0008 D1) |
| Alguien dispara el detector de brigada para retener una señal honesta | El ataque consiste en confirmar la señal, así que se auto-delata. Costo de horas. Declarado, no escondido |
| Rotar `ACTOR_PEPPER` rompe los conteos históricos | Los conteos van por `actor_id`, que el pepper no toca; `pepper_version` queda para poder reconstruir el vínculo. Rotar dejó de ser catastrófico y sigue siendo último recurso |
| **La deliberación queda en cero** | Es la decisión tomada, no un olvido: el producto lo dice en pantalla con las palabras de §6 en vez de mostrar un botón que no delibera. El costo es un deseo que sólo recibe adhesiones; el costo de la alternativa era una regla 11 cumplida a medias y disimulada |
| Los tests de integración ensucian el mapa público (D-014) | Cada test barre lo suyo, y esta spec no lo resuelve: lo hereda y lo anota |
| La reconciliación del cron tapa un bug en vez de mostrarlo | El evento reparado lleva `motivo: 'reconciliado'`, el cron loguea cuántos reparó, y la consulta que los detecta compara contra `estado_desde` para no darse por satisfecha con un evento viejo |
| Las vidas útiles están elegidas sin datos | Igual que `COEFICIENTES_LUZ`: decisiones de diseño declaradas como tales, en un módulo propio con su razón al lado. Lo que las cambiaría: la distribución medida de cuántas señales se confirman después de vencer |
