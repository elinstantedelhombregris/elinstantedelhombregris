# C · La corroboración

**Fecha:** 2026-08-11
**Alcance:** `packages/db` (esquema y repositorios) · `apps/api` (`features/civic-map`, `features/evidencia`, cron de vigencia) · `packages/civic-core` (coeficientes y canonicalización) · `apps/mobile` (el gesto de confirmar) · `apps/web` (el estado en la ficha y en el mapa)
**Documento vinculante:** `apps/mobile/docs/PRODUCT_CONSTITUTION.md` — reglas 2, 3, 4, 5, 6, 7, 8, 9, 11 y la métrica norte
**Se apoya en:** `docs/specs/2026-08-04-el-registro.md` §4, §6 y §7 · `docs/specs/2026-07-26-mapa-2-la-verdad-de-la-ubicacion.md` §3 · `docs/DEUDAS.md` D-014, D-026, D-028 (la segunda entrada con ese id)
**Naturaleza:** spec de producto y de datos. Necesita plan de implementación antes de tocar código.

> **Qué resuelve.** Cómo un dicho se vuelve un hecho comprobado: quién confirma, cuántos hacen falta, qué cuenta como independiente, dónde vive la evidencia, cómo envejece un hecho, cómo se cierra una necesidad, y cómo queda escrito todo eso de manera que se pueda auditar sin exponer a nadie. Al terminar esto, `verificables` y `confirmaciones` —los dos números que `brillo.ts` pide desde julio y que ninguna tabla sabe producir— existen en la base y se consultan por celda, y la métrica norte pasa de ser una frase a ser una consulta.
>
> **Qué NO resuelve.** El vocabulario de los ocho tipos (spec B), el callejero y la jerarquía territorial (spec A), el feed y la descarga masiva (spec D). Esta spec asume que existe una clase por señal y construye la máquina de estados encima; no la inventa.

---

## §1 El problema

### 1.1 La regla 4 no tiene una sola línea de código

La Constitución dice, textual: *«Una señal siempre muestra su estado de calidad: borrador, enviada, por verificar, corroborada, resuelta o desactualizada.»* No existe. Lo verificable en el árbol hoy:

- `packages/db/src/schema/dreams.ts:34-35` — `status text not null default 'approved'`, con el comentario `'pending' | 'approved' | 'rejected'`. Eso es **moderación**, no calidad: el default es `approved`, o sea que nadie modera, y ninguno de sus tres valores es uno de los seis de la regla 4.
- `packages/db/src/schema/pulso.ts` — `proposals.status` corre `'draft|voting|accepted|rejected|archived'`, que es un ciclo de **deliberación**. Tercer eje. `pulse_signals` no tiene estado ninguno.
- `packages/civic-core/src/coverage.ts:48-51` y su `CoverageStatus` de siete valores (`'unknown' | 'assigned' | 'visited_empty' | 'observed' | 'contested' | 'corroborated' | 'stale'`) es el estado de una **celda**. Comparte dos palabras con la regla 4 y no es lo mismo. Confundirlas sería el error más caro de este documento.

El único precedente de transición auditada del repo es `proposal_status_history`, y lo escribe `setProposalStatus` (`packages/db/src/repositories/pulso.ts:113-122`), una función que ningún endpoint HTTP llama.

### 1.2 `brillo.ts` pide dos números que la base no sabe contar

`packages/civic-core/src/brillo.ts:21-35` declara `ConteoCelda` con `cellId`, `vocesDistintas`, `habitantes`, `verificables` y `confirmaciones`. `nitidezDeCelda` (línea 87) divide uno por el otro y devuelve `inaplicable` cuando el denominador es cero. La fórmula está escrita, testeada y compartida por dos apps. Y **no hay tabla de confirmaciones en `packages/db`**, ni columna de corroboración en ninguna de las cuatro tablas de señal. El eje de nitidez del mapa está calculado sobre datos que no existen.

Peor: el único puente que sí existe, `apps/mobile/src/civic/conteos.ts:47-52`, cuenta `confirmaciones` como `verificables.filter((s) => s.confirmada).length` — es decir **señales confirmadas**, no eventos de confirmación. El comentario de `brillo.ts:34` dice «Confirmaciones registradas sobre esas verificables», que se lee como eventos. Las dos lecturas dan números distintos y sólo una mantiene `nitidez ≤ 1` sin que el `Math.min(1, …)` de la línea 93 tenga que tapar nada. Nadie decidió cuál es. Esta spec decide.

### 1.3 La única lógica de corroboración que existe vive en el teléfono y es un literal

`apps/mobile/src/civic/quality.ts:35`:

```ts
status: confirmations >= 2 && corrections === 0 ? 'corroborated' : 'needs_review',
```

Ese `2` es el umbral de corroboración de todo el sistema, escrito una vez, en un archivo de la app de campo, sin justificación al lado y sin viajar al servidor. Y quince líneas más arriba (`quality.ts:20`) el archivo hace lo que `brillo.ts` existe para prohibir: `return { confidence: 0, status: 'unsafe', … }`. `confidence: 0` no significa «medimos y dio cero» sino «se apartó del circuito y no tiene confianza definida». Es un `0` para decir «no sé», en el módulo que decide si un hecho está comprobado.

### 1.4 El rastro no se puede seguir y la identidad se publica

- No hay rastro. Ninguna transición, ninguna corrección, ningún reintento deja registro. `dreams.updated_at` tiene `default now()` y **ningún trigger** (`packages/db/src/schema/dreams.ts:37-39`): en la práctica es una copia de `created_at`.
- `apps/api/src/features/civic-map/capturas.ts:134-136` mete la marca de idempotencia `captura:<uuid-del-dispositivo>` en `submitted_as`, y `apps/api/src/features/open-data/routes.ts:69` devuelve `submittedAs` **al público**. El UUID estable del teléfono se publica como nombre de autor, y todas las capturas de un mismo aparato quedan correlacionadas por cualquiera. Es una violación directa de la regla 2 y de la métrica norte.
- La idempotencia de `capturas.ts:53-56` es un `SELECT` seguido de un `INSERT` sin índice único: dos reintentos simultáneos publican dos veces.

### 1.5 No hay transacciones, y eso cambia el diseño

Verificado en `node_modules`: `drizzle-orm/neon-http/session.js:138` y `:144` lanzan `Error("No transactions support in neon-http driver")`. `packages/db/src/client.ts:20` construye el cliente con `drizzle-orm/neon-http`. **`db.transaction()` no existe en este repo.** Lo que sí existe es `db.batch()` (`neon-http/driver.js:60`), que empaqueta consultas ya construidas en una sola transacción HTTP pero **no deja usar el resultado de una como entrada de la siguiente**.

Eso ya produjo un defecto vivo: `castVote` (`packages/db/src/repositories/pulso.ts:126-148`) hace `DELETE`, después `INSERT`, después recalcula el agregado, en tres sentencias sin transacción y sin índice único sobre `(proposal_id, user_id)`. Dos pestañas dejan dos votos de la misma persona y un `vote_count` mentiroso. Es el precedente más parecido a una confirmación que hay en el sistema, y está mal implementado.

Toda escritura de esta spec que tenga que ser atómica se escribe **en una sola sentencia** —con CTEs modificantes, con `ON CONFLICT`, o con un índice único que arbitre— y nunca copiando ese patrón.

### 1.6 La desactualización y la resolución no existen en ninguna forma

La Constitución nombra «revisión de vigencia» en el piloto de luminarias y pone la resolución confirmada en la métrica norte. En el esquema no hay ni una fecha de vencimiento, ni un estado terminal, ni un enlace entre una necesidad y lo que la resolvió. Un pozo tapado hace seis meses sigue dibujado como pozo, y una olla que dejó de funcionar sigue mandando gente a una puerta cerrada.

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
- **Uno no es corroboración, es un par.** El autor más un confirmante son dos aparatos, y El Registro §6 ya aceptó por escrito la debilidad de que *una persona con dos teléfonos cuenta dos veces*. Con dos confirmantes hacen falta tres actores distintos, y desde el enrolamiento con binding (§4.7) cada actor de campo cuesta una instalación con su secreto propio. **Lo que el umbral NO compra: presencias.** La puerta de proximidad no atesta nada (§2.3), así que falsificar cuesta aparatos, no desplazamiento. Decirlo al revés sería inflar la garantía.
- **Tres es inalcanzable el día uno.** Hoy las tablas cívicas están en cero. Con base de confirmantes chica, un umbral de tres deja `confirmaciones = 0` para siempre, y `brillo.ts:89-95` dice que cero nitidez significa «hay hechos sin confirmar»: el mapa afirmaría que nada se comprobó nunca, que es falso y desmoralizante. Dos es el número más chico que no es un par y el más grande que se alcanza sin usuarios.
- **El umbral no se congela: se sella.** Vive en `packages/civic-core/src/coeficientes-corroboracion.ts` con su razón escrita al lado, igual que `COEFICIENTES_LUZ`. **El valor que juzga una corroboración es el que quedó estampado en el evento `transicion` del rastro**, y ésa es la única fuente autoritativa: `senal_confirmacion.umbral_vigente` se guarda por fila para auditar la fila, no para juzgar la señal. Subirlo a tres mañana no reescribe la historia.
- **Qué lo cambiaría.** Cuando existan 1.000 corroboraciones reales se audita a mano una muestra en campo. Si más del 5% de los hechos corroborados no resiste la auditoría, sube a tres. Ese es el disparador, escrito antes de tener el dato.

### 2.2 Qué cuenta como independiente, sin fingerprinting

Se descarta de entrada cualquier cosa que huela a huella de dispositivo: no se guarda IP, ni user-agent, ni resolución de pantalla, ni fuentes, ni canvas, ni nada que la persona no haya elegido darnos. La regla 9 pide consentimiento *comprensible y revocable*, y una huella no es ninguna de las dos cosas.

Lo que sí se hace, y lo que **no**:

| Criterio | Cómo se garantiza | Qué NO garantiza |
|---|---|---|
| No es el mismo actor dos veces | Índice único `(senal_id, ronda, actor_id)` | Que dos `actor_id` sean dos personas |
| No es quien cargó la señal | Comparación de `actor_id` en la misma sentencia, y todo hecho llega **con actor** (`CHECK`) | Que el autor no tenga un segundo aparato |
| Declaró estar cerca del hecho | Puerta de proximidad server-side (§2.3) | **Nada, si el cliente miente.** La posición es declarada, no atestada |
| Sybil | No se impide: se encarece y se declara | Que no existan. Un actor de campo cuesta una instalación con secreto propio; en la web, un perfil de navegador |
| No son dos personas del mismo hogar | **No se intenta** | — |

**El hogar no se puede detectar sin fingerprinting, así que no se detecta.** Dos personas del mismo hogar que confirman el mismo pozo son dos miradas independientes en el único sentido que el sistema puede sostener honestamente: dos aparatos, dos decisiones. Se declara como debilidad conocida, con la misma disciplina con la que El Registro §6 declaró la de los dos teléfonos: *se documenta, no se disimula*.

**El actor, en dos piezas, y la de afuera se puede tirar.** Toda fila que necesita saber «la misma persona» lleva `actor_id bigint` —un subrogado sin significado— y el seudónimo criptográfico vive en **una sola tabla lateral** `actor` (§3.1):

```
actor_hash = HMAC-SHA256(ACTOR_PEPPER, actor_key)     // 32 bytes, sólo en la tabla `actor`
```

- `actor_key` es lo que ya emite `apps/mobile/src/civic/identity.ts:32` para las instalaciones que ya existen; **desde el enrolamiento nuevo la emite el servidor** (256 bits, §4.7). La web gana su equivalente: cookie httpOnly `basta_actor`, `SameSite=Lax`, 128 bits, un año.
- **Se pregunta antes de plantarla.** La primera escritura cívica de la web muestra, *antes* de mandar: *«vamos a guardar un identificador anónimo en este navegador para poder contar personas y no publicaciones. No lleva tu nombre, dura un año, y lo podés borrar cuando quieras»*, con el link a «Mis datos». Sin ese sí, no hay cookie y no hay escritura por el camino con actor.
- **Se puede tirar, y en las dos superficies.** `POST /api/v1/civic/actor/rotar` expira la cookie y emite otra —es httpOnly y ningún script de la página la puede borrar, así que la rotación es un endpoint y no un botón de JavaScript—; en el teléfono es `resetCivicActorKey`. Y hay un segundo grado: **retirar** pone en `null` el `actor_hash` y el `secreto_hash` de la fila `actor`. Después de eso nadie —ni con la base entera y el pepper en la mano— puede volver de una `actor_key` a las filas de esa persona; el subrogado queda y los conteos históricos no se rompen. Es lo que hace que «revocable» sea cierto y no una figura: el rastro es append-only, pero **el vínculo con la persona no vive adentro del rastro**. Y se le dice lo que pasa: *«tus voces anteriores siguen contadas, pero desde ahora vas a contar como otra persona»*. Ocultarlo sería más cómodo y sería mentir.
- `ACTOR_PEPPER` es secreto de entorno (`apps/api/src/lib/config.ts`), **nunca en la base**. `actor_hash` **no sale nunca**: ni en una respuesta, ni en la descarga masiva, ni en una línea de log — y tampoco `actor_key` ni `deviceSecret`, que van en la lista de redacción del logger. Rotar el pepper destruye la distinguibilidad histórica, así que cada fila lleva `pepper_version`; los conteos van por `actor_id` y no lo sufren.

### 2.3 La puerta de proximidad, y lo que no compra

Una confirmación suma al umbral **sólo si el aparato declara una ubicación dentro del radio de confirmación del punto publicado**:

```
radio = 150 m + publicLocationUncertaintyKm(precision_publicada) × 1000
```

- Los 150 m salen de una cuenta: el error típico de GPS de consumo en calle abierta es de 5 a 15 m y se degrada a ~100 m entre edificios altos; la manzana estándar del damero argentino mide 100 m de lado (110 m en CABA). 150 m es *una cuadra y media*: alcanza para confirmar una luminaria desde la esquina de enfrente y no alcanza para confirmarla desde otro barrio.
- El sumando de incertidumbre reusa `publicLocationUncertaintyKm` de `packages/civic-core/src/geo.ts`, que es exactamente la función con la que el servidor decidió cuánto correr el punto. Si el punto se publicó a 500 m, exigir 150 m sería exigirle a la persona una precisión que el propio sistema le borró.
- **Es una fricción de honestidad, no un control.** El punto lo manda el cliente en el cuerpo del POST y el servidor lo compara contra el punto publicado, que quien confirma ya tiene. Falsificar «estuve ahí» es copiar dos números. Por eso la fila guarda `proximidad_procedencia = 'declarada_por_cliente'` y **todo texto de cara al usuario dice «declaró estar en el lugar», nunca «estuvo»**. Una puerta con dientes pediría atestación de app (Play Integrity / DeviceCheck), que atesta la app y no a la persona y por lo tanto no viola la regla 9 — pero es una dependencia nueva y necesita ADR. Mientras no exista, la puerta es blanda y está escrito que lo es.
- **La ubicación del confirmante no se guarda.** Se compara en memoria y lo que queda en la fila es una categoría: `en_el_lugar`, `lejos`, `no_declarada`, `inaplicable`. Ni el punto, ni los metros, ni un bucket de distancia — un `<50m` contra un punto `exact` es una ubicación más fina que la que la política le concede a un `subject`. Y `creado_en` se redondea a la hora, por el mismo motivo por el que se redondea `tomada_en` (§2.10): hora exacta + punto público = rastro de movimiento.
- Si la persona no da ubicación, la confirmación **se registra igual** —es una segunda mirada y el rastro vale— pero con `proximidad: 'no_declarada'` y `cuenta = false`. No es cero: es una tercera categoría con nombre.
- Señales sin punto (precisión `province`) no tienen puerta: la proximidad es `inaplicable` y la confirmación cuenta. Una necesidad provincial no se comprueba parándose en un lugar.

### 2.4 Los seis estados, y ni uno más

La regla 4 enumera seis. **No se inventa un séptimo.** Ni `en_disputa`, ni `en_revisión`, ni `sospechosa`. Cuando un hecho corroborado entra en conflicto, vuelve a **`por_verificar`**, que es precisamente lo que significa «hace falta otra mirada», y el motivo va en el rastro.

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

- **`borrador`** vive sólo en el teléfono. Es la regla 1 (offline-first). Nunca llega al servidor y el servidor nunca lo escribe.
- **`enviada`** es «llegó y la aceptamos», antes de estar mirable por terceros. **Su salida es una regla, no una intención:** un hecho o un acto pasa a `por_verificar` cuando (a) tiene provincia resuelta server-side y (b) su evidencia terminó de procesarse, o no tiene evidencia. Cuando las dos ya se cumplen al llegar —el caso normal— lo hace **la misma sentencia del ingreso**, así que una voz de campo sin evidencia queda mirable por terceros en el mismo POST. Las que quedan esperando un blob las destraba la pasada 5 del cron (§4.8). Sin esta regla escrita, toda señal nace y muere en `enviada` y la nitidez del país entero es `inaplicable`.
- **`por_verificar`** es «publicada, pidiendo un segundo par de ojos». Es la cola de trabajo de la app: lo que alimenta el *«¿sigue así?»* de El Registro §5.2 — **con una exclusión**: las señales con `location_role = 'subject'` y `sensitivity = 'high'` siguen en `por_verificar` y siguen siendo corroborables por quien ya las conoce, pero **no se reparten como tarea a desconocidos** y sólo admiten métodos `know_place` y `checked_source`. Es la misma frontera de §2.10.3 aplicada al gesto en vez de al archivo: mandar gente a verificar en el lugar la carencia de un hogar identificable es la exposición que el resto de la spec desarma con tanto cuidado.
- **`corroborada`** es alcanzar el umbral con `confirm` contados **y sin corrección neta vigente**: `corrects contados ≥ confirms contados` en la ronda impide la transición.
- **`resuelta`** es el cierre del ciclo (§2.7). **No es terminal:** tiene vida útil propia (180 días) y al vencer vuelve a `por_verificar` con motivo `revision_de_resolucion`. Dos `stale` la devuelven a `por_verificar` con `ronda + 1` y ponen la resolución en `retirada`. Marcar resuelto lo que no lo está no puede ser permanente: sería la herramienta perfecta para borrar un pozo del mapa.
- **`desactualizada`** es «esto ya no está», y llega por caminos que **nunca se escriben con la misma palabra** (§2.6). Un `confirm` la devuelve a `por_verificar` sin subir la ronda: reabrir la pregunta no es afirmar la respuesta.

**Quién corre la máquina.** Los **hechos** y los **actos**. Un `compromiso` (decisión 6) corre `enviada → por_verificar → corroborada` (alguien vio que se cumplió) `→ resuelta`, y «vencido» / «no cumplido» son `desactualizada` con motivo `compromiso_vencido` / `compromiso_incumplido`. El motivo ya es una columna de vocabulario cerrado y para eso sirve: un acto no necesita una columna de estado propia, y **la regla 4 dice que una señal muestra *su* estado — con dos columnas de calidad no habría un «su»**. Los **deseos** y la clase **meta** no corren la máquina: se deliberan (regla 11), su estado es `enviada` y ahí se queda. Un deseo muestra `enviada` y muestra, al lado, que su clase no se corrobora. Mostrar un estado y correr una máquina de seis pasos no son la misma exigencia.

### 2.5 Lo que se afirma es un hecho vigente, no un hecho eterno

Un hecho corroborado nace con dos relojes, los dos derivados de su tipo:

| Reloj | Qué hace | De dónde sale |
|---|---|---|
| `vence_el` | Cumplido, la señal **vuelve a `por_verificar`** con motivo `revision_de_vigencia` y entra a la cola del *«¿sigue así?»* | `corroborada_en + vida_util(tipo)` |
| `caduca_el` | Cumplido sin que nadie haya vuelto a mirarla, pasa a **`desactualizada`** con motivo `caducidad_por_silencio` | `vence_el + gracia(tipo)` |

| tipo | vida útil | gracia | por qué |
|---|---|---|---|
| `basta` | 90 d | 45 d | Un desperfecto de vía pública se repara en semanas o meses; 90 días es el trimestre, el ciclo presupuestario más corto de una comuna. |
| `necesidad` | 180 d | 90 d | Una carencia estructural no cambia en un trimestre, y quien la sostiene suele ser la persona afectada: repreguntarle cada 90 días es desgaste sin ganancia de verdad. |
| `recurso` | 30 d | 15 d | Una olla o un punto de entrega puede dejar de funcionar el mes que viene, y un recurso vencido manda gente a una puerta cerrada. El daño es inmediato y físico. |
| `práctica` | 180 d | 90 d | Lo que un barrio hace tiene la inercia de una costumbre, no la de una lamparita. |
| `saber` | 365 d | 182 d | Un oficio no se pierde en un trimestre. Preguntarle a alguien cada tres meses si sigue sabiendo soldar es una falta de respeto y no agrega verdad. |
| `compromiso` | del plazo que declara | 30 d | Un acto trae su propia fecha (spec B). Vencida, y con la gracia consumida, es `desactualizada` con motivo. |
| *(resuelta)* | 180 d | 90 d | Una resolución también envejece: lo que se arregló se puede volver a romper. |

La gracia es **el 50% de la vida útil** en todos los casos, uniforme a propósito: mantiene constante la relación entre las dos, así que subir una vida útil sube su gracia sin abrir una segunda discusión.

**Vencerse no es desactualizarse.** Una señal vencida está diciendo la verdad: *nadie volvió a mirar esto*. Su nitidez baja, y eso es correcto — el conocimiento del mapa decayó y el mapa lo dice. Confundir «alguien fue y ya no está» con «nadie fue a fijarse» sería la versión temporal del `0` que significa «no sé», y este repo tiene un módulo entero escrito para no hacer eso.

### 2.6 Los seis veredictos tienen los seis su consecuencia

| Veredicto | Umbral | Consecuencia | Reversible |
|---|---|---|---|
| `confirm` | 2 contados | `por_verificar` → `corroborada`. Sobre una `desactualizada`, la devuelve a `por_verificar` (reabrir no es afirmar) | Sí |
| `correct` | neto: `corrects ≥ confirms` de la ronda | `corroborada` → `por_verificar`, `ronda + 1`, motivo `correccion`. **Exige `nota`** (`CHECK`) | Sí |
| `stale` | 2 contados | → `desactualizada`, motivo `ya_no_esta`. Sobre una `resuelta`, además retira la resolución | Sí: dos `confirm` nuevos |
| `unsafe` | **1** | **Retiene**: la señal sale de `/map/signals`, de `/map/cells` y de la cola de verificación, con evento `retencion_por_exposicion`. **No cambia el `estado`** — la retención es visibilidad, no calidad — y abre una revisión humana con plazo de 72 h que la reactiva o dispara `redaccion` | Sí, por revisión humana |
| `duplicate` | 2 contados | Marca a la señal como candidata a duplicado y alimenta la sugerencia de §2.12. **No mueve el estado**: fusionar o no es una decisión humana | Sí |
| `cannot_verify` | — | Se registra, `cuenta = false`, no suma ni resta. Es lo que su propio texto promete: «deja constancia de que hace falta otra mirada» | — |

**El uno de `unsafe` está elegido con el filo a la vista.** Esperar dos es esperar a que el daño se duplique, y `unsafe` es el único canal por el que alguien puede decir «esto expone a una persona» — la mitad literal de la métrica norte. Pero una asimetría de uno también es una palanca de censura, y no se disimula: retener **no borra, no cambia el estado y es reversible**, toda retención abre una revisión con plazo, y el rastro guarda quién la disparó. El costo de un abuso son 72 horas de ocultamiento; el costo del error inverso es exponer a una persona. Se elige el primero.

Y la desactualización llega por tres caminos que quedan distinguidos, porque la métrica norte depende de no mezclarlos: `ya_no_esta` (dos `stale`), `caducidad_por_silencio` (se cumplió `caduca_el` y nadie volvió), `compromiso_vencido` / `compromiso_incumplido` (los actos). Un hecho que *se resolvió* y un hecho que *se cayó del mapa por olvido* son cosas opuestas. Por eso el motivo es una columna con vocabulario cerrado y no un texto libre.

### 2.7 La resolución: quién la declara, quién la cierra

La métrica norte, textual: *«Necesidades verificadas que alcanzan una resolución confirmada sin exponer a personas vulnerables.»* Y el ciclo soberano: *«Una necesidad no se considera resuelta hasta que el resultado se confirma.»* El cierre tiene tres piezas:

1. **Alguien propone la resolución.** Cualquiera —quien la resolvió, quien pasó y la vio resuelta, quien coordinó— emite una *afirmación de resolución*. Eso **no cambia el estado**: escribe una fila en `senal_resolucion` con estado `propuesta` y un evento en el rastro. Quien resuelve no cierra. **Sólo se acepta sobre una señal `corroborada`** (o una `desactualizada` que volvió por confirmación): la métrica norte dice «necesidades **verificadas**», y cerrar algo cuya existencia nadie corroboró contaría que se resolvió sin haber contado que existía.
2. **Dos personas independientes confirman el cierre**, con la misma puerta y el mismo umbral. **Es su propia ronda en su propia tabla `resolucion_confirmacion`**, y no un veredicto más de `senal_confirmacion`: no hay ni habrá un veredicto `resuelta` —el catálogo de `verification-provenance.ts` tiene seis y esta spec no lo amplía—, el índice único de la corroboración no colisiona con el del cierre, y las mismas dos confirmaciones que corroboraron el hecho no sirven de confirmaciones de su cierre. Simetría deliberada: cerrar cuesta lo mismo que abrir, y cuesta aparte.
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

### 2.8 El enganche con `brillo.ts`: se reusa, no se toca

`ConteoCelda` **no cambia**. Cuatro campos siguen siendo cuatro campos. Lo que esta spec agrega es la definición exacta —que hoy falta— de qué es cada uno:

| Campo | Definición exacta | Nota |
|---|---|---|
| `vocesDistintas` | `count(distinct actor_id)` sobre las señales de la celda, cualquier clase, **excluyendo las retenidas** | Deseos y hechos encienden igual (El Registro §3). Las filas sin actor **no cuentan cero**: salen aparte (§2.9) |
| `verificables` | Señales de clase **hecho** o **acto** en estado ∈ {`por_verificar`, `corroborada`, `resuelta`, `desactualizada`}, **topeadas a 20 por actor por celda** | `enviada` no está publicada. `desactualizada` **sí** está: un hecho caído es precisamente un hecho que pide otra mirada |
| `confirmaciones` | De ese mismo conjunto, las que están en {`corroborada`, `resuelta`} | **Señales, no eventos.** Así `confirmaciones ≤ verificables` por construcción y el `Math.min(1, …)` de `brillo.ts:93` deja de ser un parche |
| `habitantes` | `habitantesDeCelda(cell, provinciaDe(cell.center))` | Ya existe en `poblacion.ts`, ya devuelve `null` y no `0` |

**Por qué `desactualizada` cuenta en el denominador y no en el numerador.** Si quedara afuera, una celda donde *todos* los hechos caducaron daría `verificables = 0` → `Nitidez.inaplicable` → y `focoDeNitidez` devuelve **1** para `inaplicable` (`brillo.ts:127`, y está bien que lo haga): un barrio donde el conocimiento se pudrió entero se dibujaría tan nítido como uno que nunca tuvo nada que comprobar. Adentro del denominador, la nitidez baja y **se queda abajo**, que es lo que §2.5 dice que pasa. Es una línea de definición y no rompe ninguna interfaz.

**El tope de 20 por actor por celda** existe porque `verificables` es el denominador y cargar señales no cuesta nada: cien hechos plausibles de una sola persona en una celda de 200 m apagarían su nitidez a ~0,02. Contar más de veinte hechos de un solo actor convierte el denominador en el diario de una persona. El número vive en `coeficientes-corroboracion.ts` con esa razón al lado.

**Y `ConteoCelda` no gana un quinto campo por la métrica norte.** D-028 dejó escrita la advertencia: agregar una variante o un campo a una interfaz que ya importan dos apps es un cambio rompedor. La métrica norte no es una propiedad de celda —no hay un tercer canal visual, hay dos: brillo y nitidez— así que vive en su propia lectura (`GET /api/v1/civic/metrica-norte`), no en la grilla.

### 2.9 La supresión va antes de la luz, y son cuatro estados

D-028 (la segunda entrada con ese id, `docs/DEUDAS.md:677`) está verificada numéricamente: con los coeficientes públicos, `voces = habitantes × PARTICIPACION_PLENA × intensidad^(1/CURVA)`, y una intensidad de 0,1720 sobre 1.000 habitantes despeja exactamente **1 voz**. El dibujo delata a la persona.

La supresión se aplica **sobre los `ConteoCelda` que entran**, nunca sobre las `LuzCelda` que salen:

- `vocesDistintas === 0` y ninguna señal sin actor → `silencio`.
- `vocesDistintas === 0` y hay señales sin actor → **`sin_actor_conocido`**. `count(distinct)` ignora los NULL, así que una celda de cincuenta voces anónimas daría cero y se pintaría «nadie habló acá»: el pecado exacto que `brillo.ts` existe para prohibir, por la puerta de atrás del agregado. Se declara el hueco en vez de plegarlo a cero, igual que `Retrato.sinDato`.
- `1 ≤ vocesDistintas ≤ 4` → `suprimida`. **k = 5**, el piso habitual de anonimato en publicación de tablas de área chica.
- `vocesDistintas ≥ 5` → `luz`, y recién ahí entra a `luzDeCeldas`.

Y —esto es lo que D-028 pedía decidir al diseñar el endpoint— **la variante nueva no va adentro de `Brillo`**. Va en un tipo del endpoint que envuelve a `LuzCelda`:

```ts
export type CeldaPublicada =
  | { cellId: string; tipo: 'luz'; luz: LuzCelda }
  | { cellId: string; tipo: 'silencio' }
  | { cellId: string; tipo: 'sin_actor_conocido'; senales: number; razon: string }
  | { cellId: string; tipo: 'suprimida'; minimoDeVoces: number; razon: string };
```

`sinDenominador` se queda donde ya vive, adentro de `LuzCelda.brillo`. Cero líneas de `brillo.ts` cambian.

**k = 5 protege contra un lector, no contra un contribuyente.** Quien puede crear actores puede empujar una celda de 1 voz a `luz`, invertir la intensidad y restar los suyos. Se encarece (§2.2, §4.7) y se declara — y `vocesDistintas` sólo cuenta actores cuyo primer evento es de hace más de 24 h, que es el mismo dato que el detector de ráfagas ya necesita.

**El reloj, congelado entero y no a medias.** Publicar `suprimida` como estado distinto de `silencio` ya dice «acá habló al menos una persona»; y peor: `verificables` y `confirmaciones` se leen del `estado`, que es mutable, así que un observador que pollea vería la nitidez de una celda de 200 m cambiar en el instante en que alguien confirma. Como confirmar pide estar en el lugar, eso sería un sensor de presencia de dos cuadras. Por eso el agregado **no se calcula por pedido**: se materializa en `celda_luz` (§3.7) al cambio de hora y el endpoint lee esa tabla tal cual, con su `calculadoALas` a la vista. Congela el CUÁNDO de las tres variables a la vez, hace el endpoint cacheable, y de paso lo saca del camino de un DoS. Lo que **no** cierra, y queda dicho: la señal individual la sigue publicando `/map/signals` con su hora exacta, y esa fuga la cierra o la declara la spec D.

**Y el sesgo que la celda fija introduce.** Con lado fijo, k = 5 en una celda del interior con veinte habitantes es el 25% de la población: un umbral que en el microcentro se cruza con un grupo de WhatsApp y en el campo no se cruza nunca. No se baja k —el piso de anonimato es correcto—: se **adapta el lado**. El endpoint rechaza con `422` un plan cuyo lado deje celdas por debajo de los `k ÷ PARTICIPACION_PLENA = 100` habitantes que hacen el umbral alcanzable con la participación que `COEFICIENTES_LUZ` define como meta, y devuelve el `ladoSugerido` que sí funciona. Así el cliente y el servidor siguen cayendo sobre el mismo plan y el sesgo se vuelve un error visible en vez de un interior apagado en silencio. Lo que queda igual va escrito en el campo `sesgo` de la respuesta (§4.4) y en §9.

### 2.10 La evidencia: en Blob, re-codificada en el teléfono, rechazada si trae metadatos

**A la base no va, y el número lo prueba.** El techo duro de Neon es 512 MB por rama y hoy se usan 38 MB. Una foto procesada pesa ~250 KB: `512 MB ÷ 250 KB ≈ 2.048 fotos` y la plataforma entera queda muerta. El piloto de luminarias de una ciudad media —8.000 luminarias, una foto cada una— son 2 GB procesadas y 16 GB sin procesar: **cuatro veces y treinta y dos veces el techo de toda la base**. No es una preferencia de arquitectura, es aritmética.

**Va a Vercel Blob**, por el motivo del ADR 0008 D1: origen único y un solo lugar donde viven los secretos. Sumar S3 o R2 es una credencial más, una región más y una frontera de origen más — cada una una superficie donde las reglas duras de `v2/CLAUDE.md` se aflojan. El precio es el lock-in, y la mitigación está en el dato: la fila guarda el `sha256`, así que migrar es una re-subida dirigida por la base.

**El EXIF se mata en origen, no en el servidor.** El pipeline:

1. **El teléfono re-codifica antes de subir** (`expo-image-manipulator` ya está en la app). Re-codificar no es «borrar tags»: es decodificar a píxeles y volver a codificar, así que GPS, fecha, número de serie, notas del fabricante y —sobre todo— la **miniatura embebida**, que suele conservar la foto *antes* del recorte, desaparecen por construcción y no por confianza en un parser. Y la consecuencia fuerte de hacerlo en el teléfono: **la coordenada exacta nunca sale del aparato**, que es la versión más fuerte posible de la regla 2.
2. **El servidor rechaza, no arregla.** Se olfatean los bytes mágicos (no el `content-type` declarado) y se rechaza cualquier archivo que todavía traiga marcadores de metadatos: `APP1`/`APP13` en JPEG, `eXIf`/`tEXt`/`iTXt` en PNG, chunks `EXIF`/`XMP` en WebP. Ese mismo recorrido de bytes lee `ancho` y `alto` del `IHDR` de PNG o del marcador `SOF` de JPEG: **no se decodifican píxeles**, porque decodificar pediría `sharp` —dep nativa que `v2/CLAUDE.md` exige justificar con ADR— y además abriría la bomba de descompresión (un PNG de 4 MB que expande a 40.000 × 40.000 px es un OOM en una función serverless). Por la misma razón **`hash_percep` sale de esta spec**: la sugerencia de duplicados espera a que exista un lugar donde decodificar sea barato.
3. **La evidencia de una señal protegida no se sube.** Si la señal tiene `location_role = 'subject'` y `sensitivity = 'high'`, su foto se queda en el teléfono bajo la custodia que `apps/mobile/src/civic/` ya implementa, y lo que viaja al servidor es su hash y su recibo. No hay «blob semi-privado»: hay público o no hay. Es la regla 3 al pie de la letra. **Depende de que alguien escriba esos dos campos** — hoy nadie los escribe, y por eso §7 se lo pide a B con nombre.
4. **Los píxeles también filtran.** Ninguna limpieza de metadatos evita que la foto muestre el número de una puerta. Por eso el piloto pide *fotografía guiada*: la evidencia se encuadra sobre la cosa, no sobre la casa. Se dice en pantalla, en el momento de sacarla, y queda en el recibo.

**Metadatos que se conservan** — lo que hace auditable la evidencia, nada que exponga a quien la sacó: `sha256` de los bytes almacenados (cualquiera verifica que el archivo servido es el que el rastro firma), `bytes`/`ancho`/`alto`/`mime`, `tomada_en` **redondeada a la hora** con procedencia `declarado` (una foto tomada ocho meses antes de la señal es otra afirmación; hora exacta + punto público es un rastro de movimiento y la hora redondeada no), y el `actor_id` de quien la subió, sólo para auditoría. **No se guarda**: nombre de archivo, modelo del aparato, bytes originales, ni ninguna coordenada propia de la foto. La ubicación de la evidencia es la de su señal.

**Costo y borrado.** A ~250 KB, 10.000 evidencias son 2,5 GB, y la transferencia domina cuando se ven en el mapa: la lista **nunca** trae la imagen (trae el hash y una miniatura de 32 KB), la imagen entera se pide al abrir la ficha, y como son inmutables van con `cache-control` largo desde el borde. Si hay que borrar una, el blob se borra y el rastro **agrega** un evento `evidencia_borrada` con el hash y el motivo: la cadena sigue verificando porque lo encadenado es el evento, no el archivo. **El contenido se va; el rastro de que existió, se queda** — y ese rastro es un hash y una hora.

### 2.11 El rastro: inmutable de verdad contra la aplicación, detectable contra el operador

La verdad primero: **Postgres no tiene tablas append-only.** No hay WORM, no hay «insert only» a prueba de superusuario. Cualquiera que diga que un Postgres se puede hacer inmutable contra su propio administrador está mintiendo o vendiendo algo. Lo que sí se puede, en tres capas de fuerza decreciente:

1. **Contra la aplicación: inmutable de verdad, y es barato.** La API deja de conectarse como dueño. Se crea un rol `v2_app` y `DATABASE_URL` apunta ahí; el rol dueño queda para migraciones, que es lo que `packages/db/src/client.ts:4-5` ya reserva para `DATABASE_URL_UNPOOLED` en un comentario. El rol tiene los privilegios normales sobre el esquema **menos** `UPDATE`, `DELETE`, `TRUNCATE` y `REFERENCES` sobre `rastro_senal` (§3.5): un bug de la API no puede reescribir el rastro ni queriendo, porque el motor no se lo permite.
2. **Contra el operador: no imposible, detectable, y verificable desde afuera.** Cadena de hash **por señal** —una cadena global serializaría todas las escrituras y sin transacciones interactivas (§1.5) eso no se puede hacer con seguridad—. La preimagen se parte en dos para que el rastro público alcance para recomputarla: `compromiso = sha256(actor_id ‖ canonJSON(datos) ‖ nonce)` viaja en el evento público junto con el `nonce`, y `hash = sha256(hash_previo ‖ seq ‖ senal_id ‖ ocurrio_en ‖ tipo_evento ‖ estado_previo ‖ estado_nuevo ‖ compromiso)` se encadena con campos que también son públicos. Cualquiera camina la cadena entera sin ver un campo privado; quien tiene los campos privados puede abrir el compromiso. Sin esta partición, «verificalo vos» era mirar una lista de bytes y creer. La cabeza de cada cadena se sella a diario, y el sello se ancla **fuera del operador**: la raíz Merkle del día se commitea al repo público, que ya tiene historia fechada por un tercero. Un sello que publica el mismo servidor del que hay que desconfiar no prueba nada.
3. **Contra el código que todavía no se escribió: una guarda de tests.** Un test recorre `packages/db/src/repositories/` y falla si aparece un `.update(rastroSenal)` o un `.delete(rastroSenal)`. La capa 1 protege producción; ésta protege el desarrollo local, donde todos son dueños.

Las tres, escritas juntas, para que nadie confunda la fuerza de una con la de otra. **Y una cosa que el rastro deliberadamente no hace:** guardar el vínculo con la persona. Ese vínculo vive en la tabla `actor`, que no es append-only, y por eso «revocable» de la regla 9 es cierto (§2.2).

### 2.12 La IA sugiere y se le nota en el dato

Regla 6: *«La IA puede sugerir; nunca determina la verdad de una señal.»* Se cumple por **forma del dato**, no por buena voluntad:

- Un evento de tipo `sugerencia_automatica` **no tiene campo `estado_nuevo`**. No es que no se use: no existe en su carga tipada, y hay un `CHECK` que lo impide. Una sugerencia es estructuralmente incapaz de mover el estado de una señal.
- Toda sugerencia lleva `motor`, `version`, `confianza` y `propuesta`, y viaja hacia la pantalla como una pregunta con dos botones: *«puede que sea la misma que #123 — ¿lo es?»*.
- La respuesta humana es un evento aparte, `decision_humana`, que apunta a la sugerencia por id. Efecto secundario buenísimo y gratis: **la precisión del modelo se calcula desde el rastro**, sin instrumentar nada. El error de la máquina es auditable por cualquiera.
- Y alcanza para atrás: `apps/api/src/features/mandato/classifier.ts` hoy escribe `theme` directamente sobre la fila, sin rastro y sin procedencia. Un tema no es la verdad de una señal, así que no viola la regla 6 en su letra — pero escribir sin dejar rastro sí rompe esta spec. Toda escritura de máquina sobre una fila de señal pasa a dejar su evento con `actor_clase: 'maquina'`.

### 2.13 El antiabuso, adentro de la regla 7 y de la 8

No hay reputación de personas. Ni pública, ni privada-pero-consultable, ni «karma». La palanca es **estructural y territorial**:

| Mecanismo | Qué frena | Qué NO frena |
|---|---|---|
| Único por `(senal_id, ronda, actor_id)` | Confirmar diez veces la misma cosa | Que sean diez actores de la misma persona |
| El autor no confirma lo suyo, y todo hecho llega con actor | El par autor-confirmante | Que el autor tenga un segundo aparato |
| Puerta de proximidad | El descuido | **Nada contra un atacante: la posición es declarada** |
| Techo horario de confirmaciones | Scripts | Un atacante paciente |
| Corrección **neta**, no umbral fijo | Tumbar una señal de diez confirmaciones con dos correcciones | — |
| Ronda nueva en cada revisión de vigencia | Que un veredicto viejo congele el estado | — |
| Enrolamiento con binding de secreto (§4.7) | Suplantar a un actor ajeno; enrolamiento masivo gratis | Que alguien instale la app N veces |

**Las 90 por hora, y con qué techo corre de verdad.** Confirmar cuesta unos dos segundos; un relevamiento a pie a 4,5 km/h con luminarias cada ~35 m pasa junto a ~128 objetos confirmables en una hora, y confirmar 90 es una hora saturada de trabajo real. Pero `anonSubmitRateLimit` es **30/hora/IP** (`middleware/rate-limit.ts:92`): si corriera acá, el techo real sería 30 y las 90 serían decorativas — y con CGNAT una campaña de veinte personas sobre la misma red móvil se bloquearía a sí misma. Por eso en `/confirmaciones` **la clave del limitador es el `actor_id` cuando la petición trae dispositivo enrolado**, y el techo por IP queda alto y sólo para el camino sin enrolar. **Qué lo cambiaría:** la distribución medida de la primera campaña real.

**La regla 8 sin brasas.** La regla nombra un mecanismo que el producto ya borró (El Registro R7). Se cita por su contenido, que sigue vivo: *premiar utilidad, corroboración, cobertura difícil y resolución; no volumen bruto*. Se cumple mudando el premio de la persona al territorio: **lo que se enciende es la celda**. La app puede decir «sos parte de las 7 personas que encendieron esta celda» —un plural, un lugar— y no puede decir en qué puesto estás, porque no hay ningún lugar del esquema con un contador público por persona.

**Detección de brigada: retiene, no sanciona.** Un detector marca ráfagas (muchas confirmaciones sobre una señal desde actores cuyo primer evento es de hace menos de 24 h) y su único efecto es poner `cuenta = false`, pendiente de revisión humana. **El flip de `cuenta` no se hace suelto**: la misma tanda escribe el evento `retencion_antiabuso` con su razón, y una guarda lo verifica — es el bit que decide si un hecho está comprobado y no puede moverse sin rastro. Si la señal ya estaba `corroborada`, vuelve a `por_verificar` **sin subir la ronda**, para que las confirmaciones honestas sigan contando cuando se revierta. **Riesgo residual, dicho y no escondido:** alguien podría disparar el detector *confirmando* una señal honesta en patrón sospechoso. Se auto-delata y el costo son horas. Se acepta a cambio de no construir reputación.

---

## §3 El esquema

Migración `0013`. Siete tablas nuevas, un puñado de columnas compartidas, y **los primeros `CHECK` del repo** — hoy las trece migraciones no tienen ninguno. Los `CHECK` se declaran con `check()` en el tercer argumento de `pgTable` (drizzle-orm 0.36.4 ya lo trae en `pg-core/checks.js`), no como SQL suelto: un constraint que sólo vive en el archivo de migración es invisible para `drizzle-kit` y el próximo `generate` lo duplica. El SQL de abajo es lo que la migración emite, en este orden. Va en SQL crudo sólo lo que drizzle no modela: los `grant`/`revoke` y los índices únicos parciales.

**Orden y precondición.** `actor` → `evidencia` → `senal_confirmacion` → `senal_resolucion` → `resolucion_confirmacion` → `rastro_senal` → `celda_luz`. Y un paso cero: **la migración no aplica hasta que `dreams.clase` exista como columna `NOT NULL` con dominio cerrado. Si B no está, C no entra** — un `CHECK` sobre una `clase` nullable es decorativo, porque `NULL or false` da `NULL` y un `CHECK` que devuelve `NULL` **pasa**.

### 3.1 `actor` — el vínculo que se puede cortar

```sql
create table actor (
  id             bigserial primary key,
  actor_hash     bytea unique,      -- HMAC(ACTOR_PEPPER, actor_key). NULL = retirado
  secreto_hash   bytea,             -- HMAC(ACTOR_PEPPER, deviceSecret). Prueba de posesión
  pepper_version smallint not null default 1,
  origen         text not null,     -- 'campo' | 'web'
  creado_en      timestamptz not null default now(),
  primer_evento_en timestamptz,     -- lo que el detector de ráfagas necesita
  retirado_en    timestamptz,
  constraint actor_origen_check check (origen in ('campo','web')),
  constraint actor_retiro_check check ((retirado_en is null) = (actor_hash is not null))
);
```

Es **la única tabla de esta spec que no es append-only**, y a propósito: retirar a una persona es un `UPDATE` que pone `actor_hash` y `secreto_hash` en `null`. El subrogado `id` queda, así que las cuentas históricas por celda no se rompen; lo que desaparece es la capacidad de volver de una `actor_key` a sus filas, incluso con el pepper en la mano. Esto es lo que hace que la palabra «revocable» de la regla 9 sea verdad y no una figura.

`actor_hash` **jamás** se selecciona a una respuesta pública, y las tablas de señal, confirmación y evidencia guardan `actor_id`, nunca el hash.

### 3.2 Las columnas de estado, compartidas

Junto a `geoColumns` en `packages/db/src/schema/_geo-columns.ts`, por la misma razón que ese archivo existe. **Con una asimetría declarada:** los `CHECK` y los índices de la máquina se aplican **sólo a `dreams`**, porque `pulse_signals`, `proposals` y `territory_mandates` no corren la máquina (§5). Las columnas se comparten para que el día que corran no diverjan; los constraints no se reparten a ciegas.

```ts
/** Un `Uint8Array` plano no es `instanceof Buffer`, y el driver de neon serializa
 *  con `r instanceof Buffer ? '\\x'+hex : r`: sin `toDriver` el parámetro sale
 *  como `{"0":12,…}` y Postgres recibe basura. Se declara una vez y se reusa. */
export const bytea = customType<{ data: Uint8Array; driverData: Buffer }>({
  dataType: () => 'bytea',
  toDriver: (v) => Buffer.from(v),
  fromDriver: (v) => new Uint8Array(v),
});

export const estadoColumns = {
  /** Los seis de la regla 4. Default `enviada`: toda fila existente queda donde está. */
  estado: text('estado').notNull().default('enviada'),
  estadoDesde: timestamp('estado_desde', { withTimezone: true }).notNull().defaultNow(),
  /** Vueltas de vigencia. Cada ronda reabre la confirmación para todos. */
  ronda: integer('ronda').notNull().default(1),
  /** Los dos relojes de §2.5. NULL mientras no esté corroborada — no 0, no una fecha inventada. */
  venceEl: timestamp('vence_el', { withTimezone: true }),
  caducaEl: timestamp('caduca_el', { withTimezone: true }),
  /** Quién la cargó, por subrogado. El seudónimo vive en `actor` (§3.1). */
  actorId: bigint('actor_id', { mode: 'number' }).references(() => actor.id),
  /** Retención de cuidado (§2.6, `unsafe`). Es visibilidad, no calidad: no toca `estado`. */
  retenidaEn: timestamp('retenida_en', { withTimezone: true }),
  retenidaMotivo: text('retenida_motivo'),
  /** Idempotencia del outbox. Reemplaza el `captura:<uuid>` metido en `submitted_as`. */
  idempotenciaLocal: text('idempotencia_local'),
} as const;
```

```sql
alter table dreams add constraint dreams_estado_check check (
  estado in ('enviada','por_verificar','corroborada','resuelta','desactualizada'));

-- La máquina la corren hechos y actos. `clase` la aporta la spec B (§7).
-- `clase is not null` primero: sin eso, `NULL or false` = NULL y el CHECK pasa.
alter table dreams add constraint dreams_estado_por_clase_check check (
  clase is not null and (clase in ('hecho','acto') or estado = 'enviada'));

-- Un hecho sin autor identificable no se corrobora por el camino barato: sin esto,
-- cargar anónimo desactiva la única defensa estructural contra el par autor-confirmante.
alter table dreams add constraint dreams_hecho_con_actor_check check (
  clase <> 'hecho' or actor_id is not null);

create unique index dreams_idempotencia_uq on dreams (idempotencia_local)
  where idempotencia_local is not null;
create index dreams_actor_idx on dreams (actor_id) where actor_id is not null;
create index dreams_vigencia_idx on dreams (vence_el) where estado in ('corroborada','resuelta');
create index dreams_caducidad_idx on dreams (caduca_el) where estado = 'por_verificar';
create index dreams_publicacion_idx on dreams (id) where estado = 'enviada';
```

`borrador` **no está en el CHECK**: es un estado del teléfono y el servidor no lo escribe nunca. Que no exista en la base es la garantía de que la regla 1 se respeta y no una omisión. Los índices parciales son los que hacen que el cron sea una consulta y no un barrido.

### 3.3 `evidencia`

```sql
create table evidencia (
  id             bigserial primary key,
  senal_id       integer not null references dreams(id) on delete restrict,
  url            text not null,          -- Vercel Blob, inmutable
  sha256         bytea not null,
  bytes          integer not null,
  ancho          integer not null,       -- del header, sin decodificar píxeles
  alto           integer not null,
  mime           text not null,
  tomada_en_hora timestamptz,            -- redondeada: hora exacta + punto público = rastro
  tomada_en_procedencia text not null default 'declarado',
  subida_por     bigint not null references actor(id),
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

### 3.4 `senal_confirmacion` y `resolucion_confirmacion`

```sql
create table senal_confirmacion (
  id            bigserial primary key,
  senal_id      integer not null references dreams(id) on delete restrict,
  ronda         integer not null,
  actor_id      bigint  not null references actor(id),
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
  creado_en     timestamptz not null,   -- lo pasa la app, redondeado a la hora (§2.3)

  constraint senal_confirmacion_veredicto_check check (
    veredicto in ('confirm','correct','duplicate','stale','unsafe','cannot_verify')),
  constraint senal_confirmacion_metodo_check check (
    metodo in ('saw_now','know_place','checked_source','field_visit','cannot_verify')),
  -- «Lo confirmo y no tengo cómo comprobarlo» no es una fila válida.
  constraint senal_confirmacion_coherencia_check check (
    veredicto = 'cannot_verify' or metodo <> 'cannot_verify'),
  -- Una corrección sin decir qué está mal no es revisable por nadie.
  constraint senal_confirmacion_nota_check check (veredicto <> 'correct' or nota is not null),
  constraint senal_confirmacion_proximidad_check check (
    proximidad in ('en_el_lugar','lejos','no_declarada','inaplicable')),
  constraint senal_confirmacion_proc_check check (
    proximidad_procedencia in ('declarada_por_cliente','no_declarada','inaplicable'))
);

-- Una mirada por actor por ronda. Es la pieza que `proposal_votes` nunca tuvo.
create unique index senal_confirmacion_uq on senal_confirmacion (senal_id, ronda, actor_id);
create index senal_confirmacion_senal_idx on senal_confirmacion (senal_id, ronda);

-- El cierre es otra ronda en otra tabla (§2.7): ni colisiona con el único de arriba,
-- ni las confirmaciones del hecho sirven de confirmaciones de su cierre.
create table resolucion_confirmacion (
  id             bigserial primary key,
  resolucion_id  bigint not null references senal_resolucion(id) on delete restrict,
  actor_id       bigint not null references actor(id),
  es_el_autor    boolean not null default false,
  proximidad     text not null,
  proximidad_procedencia text not null default 'declarada_por_cliente',
  cuenta         boolean not null,
  umbral_vigente smallint not null,
  creado_en      timestamptz not null,
  constraint resolucion_confirmacion_proximidad_check check (
    proximidad in ('en_el_lugar','lejos','no_declarada','inaplicable'))
);
create unique index resolucion_confirmacion_uq on resolucion_confirmacion (resolucion_id, actor_id);
```

Los seis veredictos y los cinco métodos son **literalmente** los de `verification-provenance.ts:71-120` y `:28-69`. No se traduce, no se reordena y **no se agrega ninguno**: el archivo que ya tiene la redacción rioplatense y la consecuencia declarada de cada opción pasa a ser el catálogo, y el `CHECK` es su copia en SQL.

**No hay `distancia_bucket` y no hay índice `(actor_id, creado_en)`.** La columna no la leía nadie y un `<50m` contra un punto `exact` es una ubicación más fina que la que la política le concede a un `subject`; el índice era, literalmente, «traeme el recorrido de esta persona ordenado por hora» sobre una tabla de presencias declaradas. Con `creado_en` a la hora y sin ese índice, reconstruir una trayectoria deja de ser una consulta y pasa a ser un barrido con resolución horaria. `on delete restrict` en el FK a `dreams`: una señal con confirmaciones no se borra; si hay que borrar contenido, se redacta (§3.5).

### 3.5 `senal_resolucion` y `rastro_senal`

```sql
create table senal_resolucion (
  id                bigserial primary key,
  senal_id          integer not null references dreams(id) on delete restrict,
  estado            text not null default 'propuesta',   -- 'propuesta' | 'confirmada' | 'retirada'
  propuesta_por     bigint references actor(id),
  propuesta_en      timestamptz not null default now(),
  enlace_tipo       text not null,
  enlace_senal_id   integer references dreams(id) on delete set null,
  enlace_nota       text,
  autor_estado      text not null default 'pendiente',
  autor_preguntado_en timestamptz,       -- el primer intento de entrega EFECTIVO
  autor_respondio_en  timestamptz,
  autor_vence_el    timestamptz,         -- = autor_preguntado_en + 30 d. NULL sin entrega
  cierre_tipo       text,
  confirmada_en     timestamptz,
  constraint senal_resolucion_estado_check check (estado in ('propuesta','confirmada','retirada')),
  constraint senal_resolucion_enlace_check check (
    (enlace_tipo = 'enlazada' and enlace_senal_id is not null)
    or (enlace_tipo = 'resuelta_por_un_tercero' and enlace_nota is not null)
    or (enlace_tipo = 'sin_enlace')),
  constraint senal_resolucion_autor_check check (autor_estado in (
    'confirmo','no_hay_autor_identificable','no_hubo_como_preguntar','sin_respuesta','pendiente')),
  -- Cerrar sin autor obliga a decir QUÉ la resolvió (§2.7).
  constraint senal_resolucion_sin_autor_check check (
    autor_estado <> 'no_hay_autor_identificable' or enlace_tipo <> 'sin_enlace'),
  constraint senal_resolucion_cierre_check check (cierre_tipo is null or cierre_tipo in (
    'confirmado_con_el_autor','confirmado_sin_autor',
    'confirmado_sin_respuesta_del_autor','confirmado_sin_poder_preguntar')),
  constraint senal_resolucion_reloj_check check (
    (autor_vence_el is null) = (autor_preguntado_en is null))
);

-- A lo sumo una resolución VIVA por señal. Un `unique` sobre la columna dejaba a una
-- necesidad mal cerrada y después retirada sin forma de volver a resolverse nunca.
create unique index senal_resolucion_activa_uq on senal_resolucion (senal_id)
  where estado <> 'retirada';
```

El `CHECK` del enlace es el que impide la fila deshonesta: no se puede decir «enlazada» sin decir a qué, ni «la resolvió un tercero» sin decir quién. La base rechaza el «no sé» disfrazado.

```sql
create table rastro_senal (
  id            bigserial primary key,
  senal_id      integer not null references dreams(id) on delete restrict,
  seq           integer not null,          -- posición en la cadena de ESTA señal
  ocurrio_en    timestamptz not null,      -- lo pasa la app: si lo pone el motor, el hash no cierra
  tipo_evento   text not null,
  estado_previo text,
  estado_nuevo  text,
  motivo        text,
  actor_id      bigint references actor(id),   -- NULL cuando el actor no es una persona
  actor_clase   text not null,                 -- 'persona' | 'sistema' | 'maquina'
  superficie    text not null,                 -- 'web' | 'campo' | 'cron' | 'admin'
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
    'retencion_por_exposicion','evidencia_adjuntada','evidencia_borrada','redaccion',
    'sugerencia_automatica','decision_humana','retencion_antiabuso')),
  -- Una sugerencia de máquina NO mueve el estado. Lo impide el motor, no la buena voluntad.
  constraint rastro_sugerencia_no_mueve_estado_check check (
    tipo_evento <> 'sugerencia_automatica' or estado_nuevo is null),
  constraint rastro_cadena_check check ((seq = 1) = (hash_previo is null))
);

create unique index rastro_cadena_uq on rastro_senal (senal_id, seq);
create index rastro_senal_idx on rastro_senal (senal_id, ocurrio_en);

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

El rol se crea de forma idempotente porque la migración también corre en ramas frescas (CI, local, el branch efímero que pide D-014) donde nadie lo creó. Sin `grant` general, `v2_app` no puede leer ni `dreams`; sin `usage, select on sequences`, ni siquiera insertar en el rastro; sin `alter default privileges`, la migración 0014 rompe la API. **La contraseña del rol la crea una persona en Neon, no la migración** (§7). El nombre es `rastro_senal` y no `bitacora_senal` a propósito: la regla 3 dice *«bitácora y reflexión personal nunca se publican»*, y una ruta pública llamada `bitacora` al lado de esa regla se resuelve dentro de seis meses asumiendo que la regla ya no se cumple. La palabra queda para lo privado.

**La cadena.** El canonicalizador vive en `packages/civic-core/src/rastro.ts` — puro, sin reloj, sin red, sin disco. `canonJSON` ordena claves, normaliza números y escapa igual siempre: dos implementaciones distintas tienen que dar el mismo byte o la cadena no vale nada. **El hash lo inyecta quien llama**: civic-core exporta el canonicalizador y recibe `(bytes: Uint8Array) => Promise<Uint8Array>` como parámetro, porque `crypto.subtle` de Node y `expo-crypto` del teléfono no son la misma API. Misma disciplina que el reloj de la Simulación.

**La escritura, en una sola sentencia**, y con `seq`, `hash_previo` y `ocurrio_en` **como parámetros**:

```sql
insert into rastro_senal (senal_id, seq, ocurrio_en, tipo_evento, ..., hash_previo, hash)
values ($1, $2, $3, $4, ..., $8, $9)
on conflict (senal_id, seq) do nothing
returning seq;
```

Se lee la cabeza, se canonicaliza con **ese** `seq`, **esa** cabeza y **ese** `ocurrio_en`, y si el `returning` vuelve vacío se relee y se reintenta, con tope de tres. Calcular el `seq` adentro del SQL —`coalesce(max(seq),0)+1`— parecía más limpio y era un bug callado: la sentencia se autoasigna el hueco libre, así que el índice único **nunca dispara**, no hay perdedor, y el ganador guarda un hash calculado contra una cabeza que ya no es la cabeza. Lo mismo con `default now()`: el instante que hashea la app y el que escribe el motor serían distintos, y en un reintento cambiaría otra vez. La columna no tiene default.

**La redacción.** Si hay que borrar texto de una señal —un nombre, una amenaza— se agrega un evento `redaccion` con el hash del texto retirado, y el campo de la señal queda en blanco. La cadena sigue verificando porque lo encadenado es el evento, no la fila.

### 3.6 `celda_luz` — el agregado congelado

```sql
create table celda_luz (
  plan_id        text not null,      -- hash de polígono canonicalizado + namespace + lado
  cell_id        text not null,
  calculado_a_las timestamptz not null,
  voces_distintas integer not null,
  senales_sin_actor integer not null,
  verificables   integer not null,
  confirmaciones integer not null,
  habitantes     integer,            -- NULL, nunca 0, cuando no se sabe
  primary key (plan_id, cell_id)
);
```

Sólo se guardan las celdas con algo: **la ausencia de fila es `silencio`**, así que la tabla crece con las señales y no con la superficie del país. El cron la reescribe al cambio de hora para los planes publicados (`apps/api/src/features/civic-map/planes.ts`: provincia × lado ∈ {100, 200, 250, 500}, ids que ya calcula `planTerritorialCoverage`). El endpoint no calcula: lee.

### 3.7 Lo que ocupa esto en la base

Con el techo de 512 MB a la vista y 38 MB usados. La cuenta incluye el índice de la PK `bigserial` y pesa cada índice declarado, que es lo que la hace auditable:

| Tabla | Heap | Índices | Bytes/fila | 100.000 señales |
|---|---|---|---|---|
| Columnas nuevas sobre `dreams` | ~70 | ~40 | ~110 | 11 MB |
| `senal_confirmacion` (≈2 por hecho) | ~150 | ~70 | ~220 | 44 MB |
| `rastro_senal` (≈8 eventos por señal) | ~300 | ~75 | ~375 | 300 MB |
| `senal_resolucion` + `resolucion_confirmacion` (≈5%) | — | — | ~330 | 1,7 MB |
| `evidencia` (≈30% con foto) | ~140 | ~55 | ~195 | 5,9 MB |
| `celda_luz` | ~90 | ~40 | ~130 | 13 MB |

Total ≈ **376 MB para 100.000 señales**, contra 474 MB libres. **El techo real es ~115.000 señales, no 190.000**: el rastro es cuatro quintos y es lo que marca el límite. Es la mitad del margen que una cuenta sin los índices de PK prometía, y por eso el archivado frío del rastro deja de ser «cuando llegue» y pasa a §7 como algo que D o la spec siguiente tiene que resolver. Sus filas son inmutables y su verificación es una cadena que se recorre offline: es el candidato natural.

---

## §4 El comportamiento

### 4.1 `POST /api/v1/civic/senales/:id/confirmaciones`

Auth: token de dispositivo (móvil) o cookie `basta_actor` (web). CSRF por doble cookie en web; en campo por la misma allow-list explícita que ya tiene `/capturas`. Techo: 90/hora **por `actor_id`** para peticiones con dispositivo enrolado; el techo por IP queda alto y sólo para el camino sin enrolar (§2.13).

```ts
interface ConfirmacionInput {
  veredicto: 'confirm'|'correct'|'duplicate'|'stale'|'unsafe'|'cannot_verify';
  metodo: 'saw_now'|'know_place'|'checked_source'|'field_visit'|'cannot_verify';
  punto?: { lat: number; lng: number } | null;   // se compara y se descarta
  nota?: string;                                  // obligatoria si veredicto = 'correct'
  evidenciaId?: number;
  idLocal: string;                                // idempotencia del outbox
}

type ReciboConfirmacion =
  | { tipo: 'registrada'; cuenta: boolean; proximidad: Proximidad; estado: EstadoDeCalidad;
      faltan: { tipo: 'para_corroborar'; cuantas: number } | { tipo: 'ya_corroborada' }
            | { tipo: 'no_aplica'; razon: string } }
  | { tipo: 'ya_confirmaste'; en: string }
  | { tipo: 'no_registrada'; razon: 'es_tuya' | 'clase_no_se_corrobora' | 'estado_no_admite'
                                   | 'metodo_no_habilitado_para_esta_senal' };
```

`registrada: true` como literal no podía expresar «no se registró», y §4.9 promete tres casos que lo necesitan. `faltan` es unión discriminada y no un número: «faltan 0» y «esto no se corrobora» son cosas distintas. Es la misma disciplina de `Brillo`.

**La transición, en una sentencia**, con un CTE de diagnóstico adelante para que la respuesta siempre pueda decir *por qué* no insertó:

```sql
with actual as (
  select id, clase, estado, ronda, actor_id from dreams where id = $1
), nueva as (
  insert into senal_confirmacion (senal_id, ronda, actor_id, veredicto, metodo, nota,
                                  proximidad, cuenta, umbral_vigente, creado_en)
  select $1, a.ronda, $2, $3, $4, $5, $6, $7, $8, date_trunc('hour', now())
  from actual a
  where a.clase in ('hecho','acto')
    and a.estado in ('por_verificar','corroborada','resuelta','desactualizada')
    and a.actor_id <> $2                 -- nadie corrobora lo suyo; sin rama para NULL
  on conflict (senal_id, ronda, actor_id) do nothing
  returning ronda
), neto as (
  select count(*) filter (where veredicto = 'confirm' and cuenta) as confirms,
         count(*) filter (where veredicto = 'correct' and cuenta) as corrects,
         count(*) filter (where veredicto = 'stale'   and cuenta) as stales
  from senal_confirmacion c, actual a where c.senal_id = $1 and c.ronda = a.ronda
), movido as (
  update dreams d set estado = $9, estado_desde = now(), ronda = d.ronda + $10,
         vence_el = $11, caduca_el = $12
    from nueva, neto, actual a
   where d.id = a.id and d.estado = a.estado and $7 = true and $13 = true
  returning d.id, d.estado
)
select a.*, (select count(*) from nueva) as inserto, (select estado from movido) as movido;
```

`$9`–`$13` los arma el llamador desde el veredicto y `neto`, según esta tabla — y `$13` es la condición, evaluada del lado de la app con los números que `neto` devuelve en el mismo viaje:

| Veredicto | Desde | Condición | Destino | Ronda |
|---|---|---|---|---|
| `confirm` | `por_verificar` | `1 + confirms ≥ umbral` **y** `corrects = 0` | `corroborada` | = |
| `confirm` | `desactualizada` | siempre | `por_verificar` | = |
| `correct` | `corroborada` | `1 + corrects ≥ confirms` | `por_verificar` | +1 |
| `stale` | `por_verificar`, `corroborada`, `resuelta` | `1 + stales ≥ umbral` | `desactualizada` | = |
| `unsafe` | cualquiera | siempre (N=1) | **no toca `estado`**: setea `retenida_en` | = |

El `1 +` no es un truco: un CTE hermano **no ve** las filas que otro escribió en la misma sentencia —los `SELECT` corren contra el snapshot del inicio— y ésa es la clase de detalle que, sin escribirlo, produce un doble conteo silencioso. Carrera de dos confirmaciones que empatan en el umbral: las dos intentan el `UPDATE`, el bloqueo de fila las serializa, y la segunda falla su `d.estado = a.estado`. No hay transición doble.

La corrección usa **neto** y no un 2 fijo porque el reinicio de ronda es una palanca de censura barata: con umbral fijo, dos `correct` tumban una señal de diez confirmaciones y la ronda nueva borra el efecto de las diez. Con neto, tumbar una señal de diez confirmaciones cuesta diez correcciones — y cada una con su `nota`, que es lo que una revisión humana puede leer.

Después, el evento del rastro con la sentencia de §3.5. Si esa segunda escritura falla, la confirmación queda registrada y sin rastro — inaceptable. Por eso el evento va con `db.batch()` cuando sus valores ya se conocen, y cuando no, la reconciliación la hace el cron, dejando el evento con `motivo: 'reconciliado'` para que la reparación también se vea. **La reparación que no se declara es una mentira prolija.**

### 4.2 `POST /api/v1/civic/senales/:id/resolucion` y `…/resolucion/confirmaciones`

El primero registra la afirmación de resolución. **Nunca cambia el estado**, y **sólo se acepta sobre una señal `corroborada`** (§2.7): sobre una `por_verificar` devuelve `422` diciendo que primero hay que comprobar que existe. Devuelve el recibo con las tres condiciones y su estado: `confirmacionesDeCierre: { hechas, faltan }`, `palabraDelAutor` (las cinco variantes de §2.7) y `enlace`.

El segundo escribe en `resolucion_confirmacion`, con la misma puerta de proximidad y el mismo umbral. **Acá el autor sí puede confirmar** —`es_el_autor` lo marca— y es requisito cuando existe. El cierre efectivo lo dispara la segunda confirmación contada, y sólo si `autor_estado` ya es `confirmo`, `no_hay_autor_identificable`, `no_hubo_como_preguntar` o `sin_respuesta`. Si es `pendiente`, el cierre espera: el cron lo destraba (§4.8).

### 4.3 `GET /api/v1/civic/senales/:id/rastro`

El rastro público de una señal. **Redactado en el serializador, no en la consulta**, y con una guarda que lo verifica:

```ts
interface EventoPublico {
  cuando: string;                  // ISO, exacto — la cadena lo encadena y tiene que cerrar
  que: string;                     // 'confirmación', 'corrección', 'revisión de vigencia'...
  quien: 'una persona' | 'el sistema' | 'una sugerencia automática';
  estadoPrevio: string | null;
  estadoNuevo: string | null;
  motivo: string | null;
  seq: number;
  nonce: string; compromiso: string; hashPrevio: string | null; hash: string;   // hex
}
```

Ni `actor_id` ni `datos` están, y no pueden estar: el tipo no los tiene. Y con `compromiso` y `nonce` afuera, **cualquiera recomputa la cadena entera sin ver un campo privado** — sin eso, «verificalo vos» era mirar una lista de bytes y creer. `cuando` va exacto porque entra en la preimagen; la protección del rastro de movimiento vive en `senal_confirmacion.creado_en` y en `evidencia.tomada_en_hora`, que son las filas que ubican a una persona.

### 4.4 `GET /api/v1/civic/map/cells`

El endpoint que El Registro §7 declaró y que no existe (`apps/api/src/features/civic-map/routes.ts` tiene exactamente tres rutas). La razón por la que existe es de privacidad y no de rendimiento: contar personas distintas en el cliente exigiría mandarle identificadores de persona al cliente.

```
GET /api/v1/civic/map/cells?plan=<planId>
```

**Se pide un plan publicado, no un polígono arbitrario.** El `planId` es el mismo hash de polígono canonicalizado + namespace + lado que `coverage.ts:828-829` ya calcula, y el catálogo está en `apps/api/src/features/civic-map/planes.ts` (provincia × lado ∈ {100, 200, 250, 500}). Tres cosas de una: servidor y teléfono caen sobre exactamente las mismas celdas sin negociar nada; un polígono de 10.000 vértices con 4.000 celdas deja de ser un DoS de ray-casting sobre la función que también sirve la ingesta (ADR 0008); y el `maxCells` es explícito y coherente con `coverage.ts` (`DEFAULT_MAX_CELLS = 2.500`, `ABSOLUTE_MAX_CELLS = 10.000`) en vez de clampearse en silencio y romper la coincidencia de `cellId`. Un lado que deje celdas bajo 100 habitantes se rechaza con `422` y `ladoSugerido` (§2.9).

El servidor **no calcula: lee `celda_luz`** (§3.6), aplica la supresión de §2.9 y llama a `luzDeCeldas`. El cálculo lo hace el cron al cambio de hora, invirtiendo el bucle: recorta por el bbox del plan en SQL, proyecta cada señal una vez y saca `(row, col)` con dos divisiones sobre la grilla regular que `planTerritorialCoverage` ya devuelve, y usa `pointInCoverageArea` sólo para las celdas de frontera. El bucle de `conteos.ts:37` —`cells.map(… senales.filter(…))`— es O(celdas × señales) y `pointInCoverageArea` renormaliza el polígono en cada invocación: a 4.000 celdas y 10.000 señales son 40 millones de normalizaciones por corrida, y eso no entra en una función.

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

Tres entradas fijas, como mínimo: **densidad provincial pareja** (D-026: sobreestima la población del campo y por lo tanto **subestima su brillo**), **participación por teléfono y tiempo disponible** (dirección desconocida), y **supresión k = 5 sobre celda fija** (subestima las zonas de baja densidad, §2.9). Normalizar por población **no es** declarar sesgo: es una corrección, y encima una con sesgo propio, medido y citado en la cabecera de este documento. Un consumidor que recibe intensidades sin saber que el campo sale más apagado *por método* está haciendo exactamente la lectura que la regla 5 existe para prohibir.

### 4.5 `GET /api/v1/civic/metrica-norte`

```ts
interface MetricaNorte {
  necesidadesVerificadas: Magnitud;
  resueltasConElAutor: Magnitud;
  resueltasSinAutorIdentificable: Magnitud;
  resueltasSinRespuestaDelAutor: Magnitud;
  resueltasSinPoderPreguntar: Magnitud;
  cobertura: { celdasConSenal: Magnitud; celdasDelPlan: Magnitud | { tipo: 'sin_plan'; razon: string } };
  sesgo: readonly Sesgo[];
}
```

**Todo `Magnitud`, incluida la cobertura.** Hay un test que recorre el resultado y falla si encuentra un `number` pelado (`guardas-simulacion.test.ts`), y este endpoint entra bajo esa guarda: dejar `celdasConSenal: number` habría obligado, el primer día, a excluir el campo del test — y ahí muere la guarda. `celdasDelPlan` es una unión y no `number | null`, que preserva mejor la honestidad de `shareOfPlan`. **Nunca se suman los buckets en un total**: el número que oculta si le preguntamos a la persona afectada es exactamente el número que la métrica norte existe para no dejar publicar. Y el cuarto bucket existe porque «no contestó» y «nunca tuvimos cómo preguntarle» no son lo mismo (§2.7).

### 4.6 `POST /api/v1/civic/evidencias`

Multipart, **máximo 4 MB**, con auth obligatoria (cookie `basta_actor` o Bearer de dispositivo) y cuota por actor y por día. Los 4 MB no son un gusto: el límite de cuerpo de una función serverless de Vercel es 4,5 MB y `vercel.json` reescribe todo `/api/…` a la única función, así que un multipart de 8 MB muere con 413 **antes** de llegar al handler — y el arreglo estándar, subida directa del cliente a Blob con token, elimina justo el punto donde el servidor olfatea los magic bytes. La subida pasa por la función, a propósito. Una foto re-codificada pesa ~250 KB: 4 MB sobra.

Olfatea magic bytes, rechaza si sobrevive un marcador de metadatos, lee `ancho`/`alto` del header sin decodificar píxeles, calcula `sha256`, sube a Blob con sufijo aleatorio y devuelve `{ id, url, sha256 }`. Las evidencias que no se enlazan a una señal o a una confirmación en 30 minutos se recolectan. Si la señal es `subject` + `high`, **rechaza con 409 y un texto que explica** que esa evidencia se queda en el teléfono; no es un error del usuario, es la política funcionando.

### 4.7 `POST /api/v1/civic/devices/enroll` y `POST /api/v1/civic/actor/rotar`

`apps/mobile/src/civic/device-auth.ts:108` ya postea al primero desde hace meses y **el endpoint no existe**. Recibe `{ actorKey?, deviceSecret, platform, clientVersion }` y devuelve `{ actorKey, role: 'contributor', linked: false, accessToken, expiresAt }` — la forma exacta que el cliente ya valida en `device-auth.ts:58-64`. Tres cosas que no estaban:

- **La `actorKey` la emite el servidor** (256 bits) en el primer enrolamiento. Que la eligiera el cliente la volvía gratis y adivinable: `for i in {1..10000}` y hay diez mil actores.
- **Se guardan dos hashes, no uno**: `actor_hash` (identidad) y `HMAC(pepper, deviceSecret)` (posesión). Un enrolamiento posterior de la misma `actorKey` con otro secreto se rechaza con `401`. Sin esto el `deviceSecret` era decorativo y cualquiera que aprendiera una `actorKey` ajena podía enrolarse como esa persona, quemarle el cupo de unicidad en una señal y dispararle el detector de ráfagas encima.
- **Techo de enrolamientos por IP y por día.** No impide Sybil —nada lo impide sin fingerprinting— pero lo saca del terreno del `curl` gratis, y eso está declarado en §2.2 en vez de vendido como garantía.

Ni el `deviceSecret` ni la `actorKey` cruda se guardan: sólo sus hashes y la fecha de primer enrolamiento, que es lo que el detector de ráfagas necesita. `/actor/rotar` expira la cookie `basta_actor` y emite una nueva; el retiro completo (§2.2) es el `UPDATE` sobre la fila `actor`. El contrato de sync completo (`/events`, `/feed`, `/custody/*`) **no** entra acá.

### 4.8 El cron de vigencia

Handler en `apps/api/src/features/civic-map/cron-vigencia.ts`, entrada en `scripts/build/bundle-api.ts` que emite `apps/api/dist-bundle/cron-vigencia.mjs`, stub commiteado `api/cron/vigencia.mjs` que lo reexporta, y las dos entradas en `vercel.json` (`functions` con `maxDuration`, `crons` con el schedule). Es el patrón exacto de `api/cron/rankings.mjs`: un `.ts` suelto en `api/cron/` no lo compila nadie y el cron devuelve 404 en producción sin fallar el build. Protegido con `CRON_SECRET` (ADR 0008 D3). Diario, salvo la pasada 6 que corre cada hora. Todas idempotentes, todas dejando evento:

1. `corroborada` / `resuelta` con `vence_el < now()` → `por_verificar`, motivo `revision_de_vigencia` o `revision_de_resolucion`, `ronda + 1`.
2. `por_verificar` con `caduca_el < now()` → `desactualizada`, motivo `caducidad_por_silencio`.
3. Resoluciones con `autor_vence_el < now()` y `autor_estado = 'pendiente'` → `sin_respuesta`, y cierre si las dos confirmaciones ya estaban. Resoluciones con 90 días desde `propuesta_en` y `autor_preguntado_en is null` → `no_hubo_como_preguntar`.
4. Retenciones por `unsafe` de más de 72 h sin revisión humana → se listan para revisión y se loguean. Una retención que nadie mira es un borrado con otro nombre.
5. **Publicación**: `enviada` de clase `hecho` o `acto`, con `province_id not null` y sin evidencia pendiente → `por_verificar`, evento `publicacion`. Es la pasada que hace que la máquina arranque (§2.4).
6. **Recálculo de `celda_luz`** para los planes publicados, al cambio de hora (§3.6).
7. Reconciliación: transiciones sin evento → evento con `motivo: 'reconciliado'`.

Cada pasada es una sentencia con `returning`, y el conteo de lo que hizo se loguea. Un cron que no dice cuánto movió es un cron que nadie va a auditar.

### 4.9 Casos límite, decididos

| Caso | Qué pasa |
|---|---|
| Confirmo dos veces la misma señal en la misma ronda | `409`, recibo `ya_confirmaste`. No es error: el outbox reintenta y tiene que poder |
| Confirmo mi propia señal | No se inserta; recibo `no_registrada` con razón `es_tuya`. No se oculta |
| Confirmo sin dar ubicación | Se registra, `cuenta: false`, `proximidad: 'no_declarada'` |
| Confirmo con `know_place` una señal con punto | Se registra, `cuenta: false`: queda su palabra con su procedencia (§2.1) |
| Confirmo una señal `province` sin punto | `proximidad: 'inaplicable'`, `cuenta: true` |
| Confirmo un sueño | `422` con texto: los deseos se deliberan, no se comprueban (regla 11) |
| Corrección neta sobre una corroborada | Vuelve a `por_verificar`, `ronda + 1`, motivo `correccion`, con la `nota` que el `CHECK` exigió |
| Una `stale` sobre una `por_verificar` | Se registra; no desactualiza hasta la segunda |
| Confirmo una `desactualizada` con `confirm` | Vuelve a `por_verificar` en la misma ronda: reabrir la pregunta no es afirmar la respuesta |
| Un `unsafe` sobre una corroborada | Sale de las superficies públicas, **el estado no cambia** y se abre revisión con plazo (§2.6) |
| Propongo resolver una `por_verificar` | `422`: primero hay que comprobar que existe (§2.7) |
| El pepper rota entre dos confirmaciones de la misma persona | Cuentan como una: el `actor_id` es el mismo. El sobreconteo sólo aparece si además se rota la `actor_key` |
| Se borra la evidencia de una confirmación | `evidencia_id` queda `null`, la confirmación sigue contando, el rastro guarda el hash |
| Dos aportes idénticos del mismo aparato (outbox) | El índice único sobre `idempotencia_local` los colapsa. Sin carrera |

---

## §5 Lo que se rompe

| Archivo | Qué cambia | Por qué |
|---|---|---|
| `packages/civic-core/src/brillo.ts:31-34` | **Sólo comentarios.** `verificables` pasa a decir «hechos y actos en por_verificar, corroborada, resuelta o desactualizada» y `confirmaciones` deja de ser ambiguo: **señales**, no eventos | Hoy el comentario y `conteos.ts:51` dicen cosas distintas. La fórmula no se toca |
| `packages/civic-core/src/coeficientes-luz.ts` | Gana hermano: `coeficientes-corroboracion.ts` con `UMBRAL_CORROBORACION = 2`, `UMBRAL_SUPRESION = 5`, `RADIO_CONFIRMACION_M = 150`, `TECHO_CONFIRMACIONES_HORA = 90`, `ESPERA_AUTOR_DIAS = 30`, `ESPERA_ENTREGA_DIAS = 90`, `RETENCION_REVISION_H = 72`, `MAX_HECHOS_POR_ACTOR_POR_CELDA = 20` y las vidas útiles, cada uno con su razón | Mismo patrón que `simulacion/coeficientes.ts`: cambiar una constante es cambiar una constante a la vista |
| `packages/civic-core/src/rastro.ts` | **Nuevo.** Canonicalizador + armado de preimagen partida (`compromiso` / `hash`). Sin reloj, sin red, sin disco; el hash entra por parámetro | El paquete no puede depender de `crypto.subtle` ni de `expo-crypto` |
| `packages/civic-core/src/coverage.ts` | Gana `asignarACelda(plan, punto): string \| null` sobre la grilla regular | El bucle de `conteos.ts` es O(celdas × señales) y renormaliza el polígono en cada punto (§4.4) |
| `packages/db/src/schema/_geo-columns.ts` | Gana `estadoColumns` y el `customType` `bytea` **completo, con `toDriver`** | Sin `toDriver`, un `Uint8Array` no es `instanceof Buffer` y las cinco columnas de hash guardan basura |
| `packages/db/src/schema/dreams.ts:34-39` | `status` (moderación) **se queda** y convive con `estado` (calidad). Son dos ejes y mezclarlos sería empezar de nuevo el problema | El comentario tiene que decirlo o alguien los va a fusionar en seis meses |
| `packages/db/src/repositories/civic-map.ts:27-43` | `SenalMapa` gana `clase` y `estado` **como unión**: `{ tipo: 'calidad'; valor: EstadoDeCalidad } \| { tipo: 'no_corre_la_maquina'; razon: string }` | La regla 4 dice **siempre**, y sólo `dreams` corre la máquina. `estado: string` habría obligado a las otras tres capas a inventar un valor o a mandar `null` bajo un tipo que no lo admite — el `?? 'valor'` de `tipoDe()` otra vez |
| `packages/db/src/repositories/pulso.ts:126-148` | `castVote` gana índice único `(proposal_id, user_id)` y pasa a `on conflict do update`. Una sentencia | No es de esta spec, pero es el patrón que esta spec no puede copiar, y dejarlo roto al lado del bueno invita a copiar el malo |
| `apps/api/src/features/civic-map/capturas.ts:53-56,134-136` | El `SELECT`-después-`INSERT` muere (`on conflict (idempotencia_local) do nothing returning`), `marcaDeCaptura` se borra, y la ingesta **resuelve provincia y publica en la misma sentencia** | Idempotencia sin carrera, muere la fuga del UUID del teléfono, y `enviada` deja de ser una trampa sin salida |
| `apps/api/src/features/open-data/routes.ts:69,86` | Deja de devolver `submittedAs`. Y `POST /dreams` **emite y persiste `actor_id`** desde la cookie, previo consentimiento, y resuelve `province_id` del punto | Publicaba el identificador estable del aparato como nombre de autor (regla 2), y sin actor sus filas nunca encenderían una celda (§2.9) |
| `apps/api/src/features/civic-map/routes.ts` | Siete rutas nuevas (`confirmaciones`, `resolucion`, `resolucion/confirmaciones`, `rastro`, `map/cells`, `evidencias`, `devices/enroll`) más `actor/rotar` | — |
| `apps/api/src/features/mandato/classifier.ts` | Toda escritura de máquina deja evento con `actor_clase: 'maquina'` | Regla 6 auditable, no declamada |
| `apps/api/src/lib/config.ts` | `ACTOR_PEPPER`, `BLOB_READ_WRITE_TOKEN`, y `DATABASE_URL` apuntando al rol `v2_app`. Y `actor_key`, `deviceSecret` y la cookie entran a la lista de redacción del logger | §2.11 capa 1, y §2.2: un trace de error no puede capturar la identidad |
| `apps/mobile/src/civic/quality.ts:20,23,35` | El `2` se importa de `coeficientes-corroboracion.ts`; `confidence: 0` y `0.15` pasan a unión discriminada; `assessObservation` deja de ser fuente de verdad — es el eco local de lo que el servidor decidió | Un `0` que significa «no sé» adentro del módulo que decide si algo está comprobado |
| `apps/mobile/src/civic/conteos.ts:22-26` | `confirmada` pasa a «estado ∈ {corroborada, resuelta}»; `verificable` lo determina la clase que trae la señal, no una lista hardcodeada en un comentario | La lista de tres del comentario es del mundo de seis tipos |
| `apps/mobile/src/civic/device-auth.ts` | Acepta la `actorKey` que emite el servidor en el primer enrolamiento | §4.7 |
| `apps/web/src/components/papel/primitives/` | `ChipEstado`, hermano de `ChipTipo.tsx` — mismo molde: unión de literales + `Record` de clases + un span. Y una variante para `no_corre_la_maquina` | `Sello` (rotado, `anim-stampin`) queda para `resuelta` y `desactualizada`, que gritan; en cuarenta filas de lista pesa demasiado |
| `apps/web/src/pages/ElMapa/instrumento/useVistaMapa.ts:73` | La derivación de tipo tiene que traer también el estado | — |
| `docs/DEUDAS.md` | D-028 (la segunda, `:677`) **resuelta por esta spec** con §2.9. Entran **D-034** (`quality.ts:20` devuelve `confidence: 0` para decir «no evaluada»), **D-035** (`useModoMapa.tsx:30` duplica a mano el halo que `publicLocationUncertaintyKm` ya calcula) y **D-036** (k = 5 sobre celda fija suprime estructuralmente la baja densidad; §2.9 lo acota con el `422` y lo declara en `sesgo`, no lo elimina) | El último id usado es D-033 |

**Lo que NO se toca:** la fórmula de `brillo.ts`, `location-policy.ts`, `poblacion.ts`, `geo.ts` y los 18 archivos de test de civic-core. Esta spec agrega los números que esas piezas ya saben usar; no reescribe ninguna.

---

## §6 Contra la Constitución

| Regla | Qué exige | Cómo la cumple esta spec |
|---|---|---|
| **1 · Offline-first** | Nunca offline-only | `borrador` vive sólo en el teléfono y no está en el `CHECK` (§3.2). Confirmar entra por el outbox con `idLocal` y el índice único hace la idempotencia real (§4.1) |
| **2 · Ubicación exacta privada por defecto** | Lo público usa precisión reducida | La ubicación del confirmante **no se guarda**: se compara y se descarta, sin bucket de distancia y con `creado_en` a la hora (§2.3). El EXIF muere en el teléfono (§2.10). Y se cierra la fuga viva: `submitted_as` deja de publicar el UUID del dispositivo (§5) |
| **3 · Bitácora personal nunca se publica** | — | La palabra «bitácora» queda para lo privado: lo que esta spec publica se llama `rastro` y es otra cosa (§3.5). La evidencia de una señal `subject` + `high` **no se sube** (§2.10.3), y una necesidad protegida no se reparte como tarea a desconocidos (§2.4) |
| **4 · Estado de calidad siempre visible** | Seis estados | Los seis, ni uno más: un conflicto vuelve a `por_verificar` (§2.4). Los actos corren la máquina en la **misma** columna, para que «su estado» sea uno solo. `SenalMapa.estado` es unión discriminada, así que ninguna capa inventa un estado (§5) |
| **5 · Participación ≠ representatividad** | Toda síntesis muestra cobertura **y sesgo** | `/map/cells` y `/metrica-norte` devuelven `cobertura` **y `sesgo`** en el mismo sobre, con las tres entradas fijas —densidad pareja de D-026, participación por teléfono, supresión k=5— y su dirección declarada (§4.4). Normalizar por población es una corrección, no una declaración de sesgo |
| **6 · La IA sugiere, no determina** | — | El evento `sugerencia_automatica` **no tiene** `estado_nuevo`, y hay un `CHECK` que lo impide (§3.5). La respuesta humana es un evento aparte, así que la precisión del modelo se audita desde el rastro (§2.12) |
| **7 · Sin ranking público individual** | — | No existe ningún lugar del esquema con un contador público por persona. `actor_hash` no sale nunca y vive en una tabla lateral que se puede vaciar. El premio es la celda encendida, en plural y con lugar (§2.13) |
| **8 · Premiar utilidad, corroboración, cobertura difícil y resolución; no volumen** | La regla nombra las brasas, que El Registro R7 borró | Se cita por su **contenido**. `brillo` cuenta personas distintas y no señales, así que el volumen bruto no compra luz —y `verificables` se topea por actor para que tampoco compre oscuridad (§2.8)—; la nitidez sólo sube confirmando; la métrica norte mide resolución. La cobertura difícil es lo que k=5 castiga, y por eso el lado se adapta o se declara (§2.9). Nota: el sujeto de la regla ya no existe y le corresponde una enmienda (§7) |
| **9 · Consentimiento comprensible y revocable** | — | Cero fingerprinting (§2.2). **Se pregunta antes de plantar el identificador**, se puede rotar por endpoint —la cookie es httpOnly y ningún script la borra— y se puede **retirar**, que vacía el `actor_hash` de la fila `actor` y corta el vínculo para siempre sin romper los conteos. Cada confirmación devuelve un recibo que dice si contó y por qué |
| **10 · Teléfonos modestos y redes intermitentes** | — | Confirmar es un POST de ~200 bytes con reintento idempotente. La evidencia se re-codifica en el aparato (~250 KB). El mapa nunca trae imágenes en la lista, y `/map/cells` lee una tabla materializada y cacheable |
| **11 · Hechos se corroboran, deseos se deliberan** | Nunca se confunden | Un `422` al confirmar un deseo, y un `CHECK` —con `clase is not null` adelante, o no chequearía nada— que impide que un deseo tenga estado distinto de `enviada` (§3.2). No es una convención de UI: no entra a la base |
| **Métrica norte** | Necesidades verificadas con resolución confirmada, sin exponer a personas vulnerables | Cuatro buckets que **nunca** se suman (§4.5), sobre necesidades que estuvieron `corroborada` antes de poder cerrarse. El «sin exponer» lo sostienen la supresión k=5, el congelamiento horario, la evidencia protegida que no viaja, la cola que no reparte necesidades sensibles, y el `unsafe` de umbral uno |
| **Ciclo soberano** | *«Una necesidad no se considera resuelta hasta que el resultado se confirma»* | Quien resuelve no cierra; hacen falta dos confirmaciones **en su propia ronda y su propia tabla** y la palabra del autor cuando se le pudo preguntar (§2.7) |

---

## §7 Lo que esta spec NO hace

**A · El callejero y la jerarquía territorial.**
- No siembra calles ni arregla `geographic_locations.province_id`, que hoy es `serial NOT NULL` sin FK y no puede ser lo que su comentario dice.
- **Le pide a A:** que la precisión que produce una dirección verificada siga siendo un valor de `LocationPrecision`, porque la puerta de proximidad (§2.3) lo usa como sumando. Si A inserta un escalón nuevo entre `exact` y `100m` para «calle sí, altura no», el radio de esas señales lo hereda solo; si lo mapea a `100m`, también. Lo que A **no puede** hacer es publicar una precisión que no esté en `PRECISION_ORDER`: `publicLocationUncertaintyKm` devolvería un número indefinido y la puerta se abriría sola.

**B · Los ocho tipos y la ingesta.**
- No define el vocabulario, no afila `basta`, no saca `valor`, no diseña la adhesión.
- **Le pide a B, y es duro:** que `clase` sea una **columna `NOT NULL` con dominio cerrado**, no una función de TypeScript. Los `CHECK` de §3.2 están escritos en SQL y necesitan la clase en SQL — y con `clase` nullable el `CHECK` de la regla 11 **pasa siempre**, porque `NULL or false` da `NULL`. **Si B no está, C no entra**: no hay orden en que la migración 0013 aplique sola.
- **Le pide a B, y es igual de duro:** que la ingesta web **pregunte y setee `location_role` y `sensitivity`**, con la tabla de los ocho tipos × rol × sensibilidad por defecto —la extensión del `ROL_POR_TIPO` de `capturas.ts`—. Hoy toda voz web entra como `subject`/`low`, así que `publishedPrecision` no engrosa nunca, el 409 de §4.6 no se dispara nunca y la cola protegida de §2.4 no protege a nadie. La mitad «sin exponer» de la métrica norte cuelga de dos columnas que hoy nadie escribe.
- **Le pide a B:** que el `compromiso` cierre **escribiendo en `estado` y en `motivo`**, no en una columna nueva. Un acto corre la máquina de §2.4; «vencido» y «no cumplido» son `desactualizada` con motivo. Tres columnas de estado sobre `dreams` dejarían indefinido cuál es «su estado» para la regla 4. Y el cierre de un compromiso **no cierra automáticamente** la necesidad que decía atender, ni al revés: son dos hechos distintos, y el enlace de `senal_resolucion` es informativo, nunca disparador.
- **Le pide a B:** que la `adhesión` no se cuente como confirmación. Un «yo también» es una voz que suma a `vocesDistintas`; una confirmación es «fui y está».
- **Le ofrece a B:** el `actor_id`, la tabla `actor` y la columna `idempotencia_local` son de esta spec y son exactamente lo que la adhesión necesita para contar personas distintas. B no tiene que inventar identidad seudónima: ya está, con consentimiento y con retiro.

**D · El feed y la descarga masiva.**
- No diseña el feed, ni la paginación por cursor, ni el formato de la descarga.
- **Le pide a D:** que el volcado público **no exporte** `actor_hash`, ni `actor_id`, ni `evidencia.subida_por`, ni ninguna columna del rastro que los lleve. El rastro, si se exporta, sale por la forma redactada de §4.3.
- **Le pide a D:** que exporte por señal el `estado`, la `ronda` y `confirmaciones` como **conteo**, nunca como filas. Exportar filas permitiría reconstruir la coactividad de una persona por coincidencia temporal.
- **Le pide a D:** que decida qué hacer con el `createdAt` exacto de `/map/signals`. El agregado de §2.9 está congelado a la hora; la señal individual no, y esa fuga es de D.
- **Le pide a D:** que el feed muestre el estado de calidad en cada fila. La regla 4 dice *siempre*.
- **Le ofrece a D:** el sello diario de las cabezas de cadena, anclado en el repo público (§2.11). Es lo que convierte la trazabilidad en verificable por terceros, y son 32 bytes por señal activa.

**Lo que no le corresponde a ninguna de las cuatro:**
- **El documento vinculante necesita dos enmiendas**, y hay que pedirlas al dueño del producto: la regla 8 nombra las brasas, que R7 borró; y «Las tres superficies» dice tres y lista cuatro, y una de las cuatro es El Cielo, que también se borró.
- La revocación de privilegios al rol de la aplicación toca producción: la migración la escribe esta spec, **la contraseña del rol y el cambio de `DATABASE_URL` los hace una persona en Neon**.
- **El archivado frío del rastro.** Con el techo real en ~115.000 señales (§3.7), no es un problema del año que viene: es la próxima decisión de capacidad y hay que asignarla.
- La atestación de app (Play Integrity / DeviceCheck) que le daría dientes a la puerta de proximidad necesita un ADR (§2.3).
- D-014 sigue viva: los tests de integración corren contra la misma base que sirve el sitio. Esta spec agrega endpoints de escritura y **hereda el riesgo**.

---

## §8 Verificación

### 8.1 Guardas ejecutables

Con la misma redacción de frase-afirmación de `packages/civic-core/src/__tests__/brillo-guardas.test.ts`, y las fixtures de `__tests__/_conteo.ts`, que está fuera del glob a propósito por el guión bajo.

| Guarda | Qué protege |
|---|---|
| «una confirmación no alcanza; dos alcanzan» | El umbral, leído del coeficiente y no de un literal |
| «una voz de campo sin evidencia queda mirable por terceros en el mismo POST» | Que `enviada` tenga salida y la máquina arranque |
| «nadie corrobora lo suyo, ni cargando anónimo» | El par autor-confirmante, contra el `CHECK` de actor obligatorio |
| «la misma persona no cuenta dos veces en la misma ronda; sí cuenta en la siguiente» | El índice único y que la revisión reabra de verdad |
| «una confirmación sin ubicación se registra y no cuenta» | Que `no_declarada` sea un tercer estado y no un `false` |
| «a 400 m de un punto exacto no cuenta; a 400 m de un punto de 500 m sí» | Que la puerta sume la incertidumbre publicada |
| «`know_place` sobre una señal con punto no suma al umbral» | Que el método sea procedencia con peso y no adorno |
| «un `unsafe` saca la señal del mapa en el mismo POST y no toca su estado» | Que la retención sea visibilidad y no calidad |
| «una necesidad protegida no aparece en la cola de verificación de un desconocido» | La métrica norte, del lado del gesto |
| «un sueño no se puede confirmar» | Regla 11, y que el `CHECK` la sostenga desde la base |
| «una sugerencia automática no puede mover el estado» | Regla 6, contra el `CHECK`, no contra el código |
| «dos confirmaciones simultáneas en el umbral producen una sola transición» | La carrera de §4.1, con dos `POST` en paralelo |
| «dos correcciones no tumban una señal con diez confirmaciones» | La corrección neta, contra la censura barata |
| «`confirmaciones` nunca supera a `verificables`» | Que la definición de §2.8 sea la que se implementó |
| «cien hechos de una sola persona en una celda no apagan su nitidez» | El tope por actor en el denominador |
| «una celda con todos sus hechos desactualizados no se dibuja igual que una de puros sueños» | Que `desactualizada` esté en el denominador |
| «con 4 voces sale suprimida; con 0 y sin señales, silencio; con 0 y señales sin actor, `sin_actor_conocido`; con 5, luz» | D-028, los cuatro estados |
| «el endpoint de celdas no devuelve identificadores de persona, y declara su sesgo» | La razón por la que existe, y la regla 5 entera |
| «una escritura cívica web sin consentimiento no planta el identificador; retirar un actor corta el vínculo y no mueve un conteo» | Regla 9: el momento del sí y que «revocable» sea cierto |
| «ni `actor_hash` ni `actor_key` ni `deviceSecret` aparecen en ninguna línea de log ni en la respuesta del rastro» | Recorrido del objeto serializado y del logger, no inspección del tipo |
| «una fila de confirmación no permite reconstruir dónde estuvo una persona» | Sin bucket, sin índice por actor, con hora redondeada |
| «una señal corroborada con `vence_el` cumplido vuelve a por_verificar, no a desactualizada» | Que vencerse y desactualizarse no sean la misma palabra |
| «una necesidad que nunca se corroboró no puede cerrarse como resuelta» | La palabra «verificadas» de la métrica norte |
| «una resolución cuyo autor nunca pudo ser contactado cierra en su propio bucket, no en el de sin respuesta» | Que los cuatro buckets nunca se sumen |
| «la métrica norte no devuelve un `number` pelado, ni en `cobertura`» | Extensión de `guardas-simulacion.test.ts` |
| «una foto con EXIF se rechaza; la misma sin EXIF entra; una de 5 MB se rechaza antes; una de subject+high se rechaza con explicación» | El pipeline de evidencia, el techo de 4 MB y la regla 3 |
| «borrar una evidencia deja el evento y conserva el hash» | Append-only compatible con el borrado |
| «reescribir una fila del rastro rompe la cadena, y el verificador la recorre con sólo la respuesta pública» | La capa 2 de §2.11, sobre datos y desde afuera |
| «ninguna confirmación cambia de `cuenta` sin su evento» | Que el bit que decide si algo está comprobado no se mueva en silencio |
| «ningún repositorio hace `.update()` ni `.delete()` sobre `rastroSenal`» | La capa 3 de §2.11, por grep |
| «veinte confirmantes detrás de una misma IP saliente no se bloquean entre sí» | CGNAT, contra el DoS accidental sobre una campaña |

### 8.2 Consultas concretas

**Nitidez de una celda, a mano, para contrastar con el endpoint:**

```sql
select
  count(*) filter (where clase in ('hecho','acto')
                     and estado in ('por_verificar','corroborada','resuelta','desactualizada')) as verificables,
  count(*) filter (where clase in ('hecho','acto') and estado in ('corroborada','resuelta'))    as confirmaciones,
  count(distinct actor_id)                                as voces_distintas,
  count(*) filter (where actor_id is null)                as senales_sin_actor
from dreams
where lat between $1 and $2 and lng between $3 and $4
  and retenida_en is null
  and created_at < date_trunc('hour', now());
```

`senales_sin_actor` sale al lado y no plegado en `voces_distintas`: `count(distinct)` ignora los NULL, y un cero que significa «no sé quién» pintaría la celda como «nadie habló».

**Que ninguna señal esté corroborada sin las confirmaciones que lo justifiquen** (cero filas, siempre):

```sql
select d.id
from dreams d
join lateral (select (b.datos->>'umbral_vigente')::int as umbral
              from rastro_senal b
              where b.senal_id = d.id and b.tipo_evento = 'transicion'
                and b.estado_nuevo = 'corroborada'
              order by b.seq desc limit 1) t on true
where d.estado in ('corroborada','resuelta')
  and (select count(*) from senal_confirmacion c
        where c.senal_id = d.id and c.ronda = d.ronda
          and c.veredicto = 'confirm' and c.cuenta) < t.umbral;
```

El umbral sale **del evento de transición** y no de `max(umbral_vigente)` sobre las filas: con `max`, una confirmación posterior estampada con un umbral más alto —y que ni siquiera cuenta— convertiría en inválida una corroboración perfectamente legítima. La consulta tiene que juzgar cada señal con la regla que corría el día en que se corroboró.

**Que ninguna transición carezca de evento** (cero filas):

```sql
select d.id, d.estado
from dreams d
where d.estado <> 'enviada'
  and not exists (select 1 from rastro_senal b
                   where b.senal_id = d.id and b.estado_nuevo = d.estado
                     and b.ocurrio_en >= d.estado_desde - interval '5 seconds');
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

0. `dreams.clase` existe como columna `NOT NULL` con dominio cerrado (spec B). Sin eso la migración 0013 no aplica, y forzarla con una `clase` nullable dejaría los `CHECK` decorativos.
1. `pnpm verify` verde, con tests de integración contra Postgres real —en una rama fresca, donde `create role v2_app` corre por primera vez— para las ocho rutas nuevas.
2. Una voz de campo pasa de `enviada` a `por_verificar` en el mismo POST y de ahí a `corroborada` con dos confirmaciones de dos aparatos enrolados distintos a menos de 150 m; la tercera no cambia nada y lo dice.
3. `GET /api/v1/civic/map/cells` devuelve `suprimida` con cuatro voces y `luz` con cinco, las cuatro variantes son distinguibles, y el sobre trae `cobertura`, `sesgo` y `calculadoALas`.
4. `nitidezDeCelda` recibe números que vienen de la base y no de una fixture, y `brillo.ts` no cambió una línea de lógica.
5. El rastro de una señal se lee entero desde la API sin que aparezca un solo identificador de persona, y **un verificador externo recorre su cadena usando sólo esa respuesta**.
6. `revoke update, delete, truncate on rastro_senal from v2_app` está aplicado, la API arranca con `v2_app` y lee todo lo que necesita, y un intento de `UPDATE` falla con error del motor, no con un `if`.
7. `GET /api/v1/civic/metrica-norte` devuelve `Magnitud` en todos sus números y cuatro buckets que no se suman en ningún lado.
8. Un enrolamiento con la `actorKey` de otro y un `deviceSecret` distinto devuelve `401`.
9. Retirar un actor desde «Mis datos» deja el `actor_hash` en `null` y **no mueve un solo conteo por celda**.
10. `submitted_as` ya no sale por `/api/open-data/dreams` y `captura:<uuid>` no existe más en el código.
11. D-028 (la segunda) está marcada resuelta con su diseño citado, y D-034, D-035 y D-036 están anotadas.

---

## §9 Riesgos

| Riesgo | Mitigación |
|---|---|
| **Sybil: la identidad seudónima es barata** | No se impide sin fingerprinting, así que se encarece (binding de secreto, `actorKey` del servidor, techo de enrolamientos) y se **declara** en la tabla de §2.2. Es el riesgo del que cuelgan el umbral, k=5 y `vocesDistintas`, y no tiene solución limpia dentro de la regla 9 |
| **La puerta de proximidad no atesta nada** | Está escrito en §2.1, §2.3 y §2.13 en vez de vendido como garantía, y la fila guarda `proximidad_procedencia`. Con dientes pediría atestación de app, que necesita ADR |
| k = 5 sobre celda fija suprime estructuralmente la baja densidad (D-036) | El endpoint rechaza con `422` y `ladoSugerido` los lados que dejan celdas bajo 100 habitantes, y el resto va escrito en el campo `sesgo`. Es un sesgo que se apila con el de D-026 en la misma dirección: el interior sale doblemente apagado y **la respuesta lo dice** |
| La puerta deja fuera a quien confirma desde su casa mirando por la ventana | Su confirmación se registra y aparece en la ficha con `know_place`: su palabra queda, con su procedencia. Sólo no suma al umbral |
| Con cero usuarios, todo el mapa sale suprimido y parece roto | Es la verdad, y El Registro §6.2 ya decidió que el gris es la marca. `silencio`, `sin_actor_conocido` y `suprimida` se distinguen, así que el mapa dice cuál de las tres cosas pasa |
| El rastro crece más rápido que la base | 376 MB a 100.000 señales, techo real **~115.000** (§3.7). Está medido con los índices de PK adentro, y el archivado frío pasa a ser una tarea asignada (§7), no una nota al pie |
| `unsafe` con umbral uno es una palanca de censura | Retener no borra, no cambia el estado, es reversible, deja rastro de quién lo disparó y abre revisión con plazo de 72 h que el cron vigila. El costo del abuso son horas; el del error inverso, exponer a una persona |
| Vercel Blob es lock-in | El `sha256` en la fila hace que migrar sea una re-subida dirigida por la base. Se paga a cambio de no sumar un segundo lugar donde viven secretos (ADR 0008 D1) |
| Alguien dispara el detector de brigada para retener una señal honesta | El ataque consiste en confirmar la señal, así que se auto-delata. Costo de horas. Declarado, no escondido |
| Rotar `ACTOR_PEPPER` rompe los conteos históricos | Los conteos van por `actor_id`, que el pepper no toca; `pepper_version` queda para poder reconstruir el vínculo. Rotar dejó de ser catastrófico y sigue siendo último recurso |
| Los tests de integración ensucian el mapa público (D-014) | Cada test barre lo suyo, y esta spec no lo resuelve: lo hereda y lo anota |
| La reconciliación del cron tapa un bug en vez de mostrarlo | El evento reparado lleva `motivo: 'reconciliado'`, el cron loguea cuántos reparó, y la consulta que los detecta compara contra `estado_desde` para no darse por satisfecha con un evento viejo |
| Las vidas útiles están elegidas sin datos | Igual que `COEFICIENTES_LUZ`: decisiones de diseño declaradas como tales, en un módulo propio con su razón al lado. Lo que las cambiaría: la distribución medida de cuántas señales se confirman después de vencer |
