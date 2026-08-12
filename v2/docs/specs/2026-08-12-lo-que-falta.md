# Lo que falta — el canal de escucha

**Fecha:** 2026-08-12
**Ruta pública:** `/lo-que-falta`
**Migración:** la primera libre después de la serie tierra/señal/corroboración/registro
**Ordinal de `docs/DEUDAS.md` que abre:** el primero libre después de `D-044`

> **Qué resuelve.** Que la plataforma tenga una boca por donde entre lo que le falta, dicho por cualquiera, sin cuenta y sin dar un dato — y que lo dicho quede público, con estado visible y con respuesta. **Qué NO resuelve:** no toca `senales` ni el mapa civil, no manda un solo mail, no construye panel de administración, y no modera automáticamente nada.

---

## §1 El problema

### 1.1 No hay canal de escucha. Ninguno.

No existe formulario de contacto, ni de reporte, ni de sugerencia, en ninguna de las 50 páginas de `apps/web/src/pages/`. Las únicas apariciones de la palabra «contacto» son `KitDePrensa.tsx` y `DatosAbiertos.tsx`, y las dos son prosa. Una plataforma cuya tesis es *la ciudadanía diseña* no tiene por dónde recibir un diseño.

### 1.2 Hay una tabla de feedback, y está muerta

`packages/db/src/schema/feedback.ts` define `platform_feedback` desde la migración `0005_greedy_mindworm.sql`, con `kind` / `subject` / `body` / `status` / `adminResponse` / `pageUrl` / `userAgent`. `packages/db/src/repositories/feedback.ts` la envuelve en un `FeedbackRepository` de seis métodos, exportado desde el barril. **Ninguna ruta de API la toca, ninguna pantalla la muestra, ningún test la ejerce.** Las únicas referencias fuera del propio esquema están en `apps/api/dist-bundle/*.mjs` — o sea, en artefactos compilados que la arrastran por el barril.

Y no es sólo que esté muerta: modela lo contrario de lo que hace falta. `userId` con `references(users.id)`, comentario «Admins review via the admin dashboard» — un panel que en v2 no existe—, `adminResponse` «visible to user via their feedback list» —una lista privada por usuario—, y `userAgent` guardado crudo. Es un buzón privado atado a cuenta. Se reemplaza; no se recicla.

### 1.3 El registro de lo que falta ya existe, pero es interno

`docs/DEUDAS.md` lleva 33 entradas con un método bueno y ya establecido: se anota cuando se encuentra y no cuando se resuelve, id correlativo que no se reusa, y las resueltas se marcan resueltas en vez de borrarse. Ese archivo es exactamente el registro que este canal necesita — sólo que hoy lo lee una sola persona.

---

## §2 La decisión

### 2.1 Un solo registro de lo que falta, dos orígenes

La deuda que encontró quien programa y la idea que dejó quien usa **son la misma clase de objeto**: algo que le falta a esto. Entran a la misma tabla, tienen la misma ficha, corren la misma máquina de estados y salen por la misma descarga. Lo único que las distingue es la columna `origen`:

- `adentro` — viene de `docs/DEUDAS.md`, id público `D-0NN`
- `afuera` — viene del panel público, id público `I-0NN`

Los rangos de id son disjuntos por construcción (prefijo distinto), así que las dos numeraciones corren sin coordinarse.

*Se descartó el modelo de dos registros con una vista que los une: la vista que junta dos modelos distintos termina teniendo reglas propias, y esas reglas son un tercer modelo que nadie declaró.*

### 2.2 Público al instante, con baja que deja marca

Lo que alguien deja **es público en el mismo momento en que lo deja**. No hay cola de revisión, no hay promoción, no hay zona de espera.

Cuando algo hay que bajarlo —insulto, spam, un dato personal de un tercero— la fila **no se borra**: pasa a estado `bajada`, se vacía `titulo` y `cuerpo`, y quedan el id, la fecha y el motivo. Es la misma regla que gobierna `docs/DEUDAS.md`: un registro que se vacía pierde la memoria de por qué las cosas están como están.

El riesgo está aceptado con nombre: la portada de `/lo-que-falta` es lo primero que va a atacar quien quiera ensuciarla. Los frenos de §2.6 son la respuesta, y ninguno es un tercero.

### 2.3 La máquina de estados, y el `no va` con razón obligatoria

```
dicha ──► anotada ──► en curso ──► hecha
  │          │
  └──────────┴──────────────────► no va
  │
  └─────────────────────────────► bajada
```

| Estado | Qué significa |
|---|---|
| `dicha` | entró, ya es pública, nadie la miró todavía |
| `anotada` | se leyó y entra al registro de verdad; si es de afuera y se acepta, se copia a `DEUDAS.md` y la ficha guarda el `D-0NN` que le tocó |
| `en_curso` | se está haciendo |
| `hecha` | se hizo, con enlace al commit o a la Bitácora |
| `no_va` | **con razón escrita obligatoria** |
| `bajada` | contenido retirado; la fila queda |

**La transición a `no_va` sin `razon` no escrita se rechaza del lado del servidor, no del formulario.** Ésta es la pieza que hace que el canal signifique algo: un no argumentado a los tres días vale más que un sí que nunca llega. La regla vive en `@v2/civic-core` como función pura, se testea sin base y sin HTTP, y la API la llama — no la reimplementa.

`bajada` es terminal y se puede alcanzar desde cualquier estado. `hecha` y `no_va` son terminales.

### 2.4 Firmar, no votar

Firmar una falta es decir *me pasa lo mismo*. Una por persona por falta, sin cuenta, deduplicada por la llave de §2.5. El número se muestra en la ficha y **no reordena nada**: el orden del registro es cronológico descendente, siempre.

Es la misma decisión que la 8 del registro público (feed cronológico, sin ranking) y por la misma razón: si el orden lo decide la popularidad, la idea rara y correcta se hunde.

### 2.5 Sin cuenta, sin nombre, sin dato de contacto

Al dejar una falta la respuesta trae `{ id, url, llave }`. La llave es un secreto de 32 bytes generado en el servidor, **devuelto una sola vez** y guardado del lado del servidor **sólo hasheado** (SHA-256). El cliente la guarda en `localStorage`. Sirve para dos cosas:

1. retirar lo propio (`DELETE`, que lleva a `bajada` con motivo `retirada por quien la dejó`);
2. deduplicar firmas.

**No se pide ni se almacena ningún dato de contacto.** La respuesta a una falta vive en su ficha pública, para quien la dejó y para cualquiera. Si se pierde el link, se pierde el hilo — es el precio explícito de no guardar nada.

`user_agent` no se guarda. La IP no se guarda: se usa en memoria para el freno de cadencia y no se persiste en ninguna columna.

### 2.6 Cuatro frenos, ninguno de terceros

1. **Freno de cadencia** por IP, reusando `anonSubmitRateLimit()` (30/hora), más un freno propio más duro para el `POST` de creación.
2. **Los enlaces nunca se renderizan como enlaces.** El cuerpo se muestra como texto plano, siempre, en toda superficie. Le saca al spam todo su valor.
3. **Rito de tinta** — la primitiva `RitoTinta` que ya existe: fricción deliberada antes de mandar.
4. **La baja deja marca**, así que ensuciar no borra: deja el número tachado en el registro para siempre.

No hay CAPTCHA. `D-003` ya prohíbe depender de CDNs de terceros, y un CAPTCHA es exactamente eso.

### 2.7 El archivo manda, la base recibe

```
docs/DEUDAS.md ──[importar-deudas.ts, en cada despliegue]──► faltas (origen: adentro)
panel público ───[POST /api/v1/faltas]─────────────────────► faltas (origen: afuera)
```

El importador parsea `### D-0NN · título` con su bloque `**Dónde:** / **Encontrada:** / **Severidad:** / **Estado:**`, y es **idempotente por id público**. Reglas:

- id nuevo en el archivo → fila nueva
- id existente con contenido distinto → se actualiza
- `**Estado:** Resuelta` (o `**Resuelta**`) en el archivo → la falta pasa a `hecha`
- id que está en la base y ya no en el archivo → **no se borra**: se marca `huerfana = true` y se reporta en el log

No cambia el bucle de trabajo: se sigue anotando en el archivo mientras se programa.

Cuando se acepta una idea de afuera, el flujo es al revés y es manual: se copia a `DEUDAS.md` como deuda nueva, y el `PATCH` que la pasa a `anotada` guarda el `D-0NN` asignado en `anotada_como`. La ficha pública dice *«se anotó como D-047»*, la deuda dice de dónde vino, y el bucle cierra.

### 2.8 Cuatro bocas, un panel

| Boca | Qué adjunta |
|---|---|
| `/lo-que-falta` | nada; es la página del registro y del panel |
| el instrumento del mapa | **el encuadre y la capa que se estaba mirando** |
| el pie, en todas las páginas | la ruta actual |
| `/datos-abiertos` | nada — ahí el registro se descarga, no se escribe |

Un solo componente, `PanelDejarFalta`, montado desde las cuatro. El contexto llega por props, no lo lee el panel.

### 2.9 Se descarga

El registro sale entero por `GET /api/v1/faltas` con cursor, y por descarga en CSV y JSONL desde `/datos-abiertos`. Nada de lo que la plataforma guarda es privado de la plataforma, y eso incluye la lista de sus propios defectos.

---

## §3 El modelo

### 3.1 `faltas`

| Columna | Tipo | Nota |
|---|---|---|
| `id` | `serial` pk | interno |
| `id_publico` | `text` unique notNull | `D-034` \| `I-007` |
| `origen` | `text` notNull + CHECK | `adentro` \| `afuera` |
| `superficie` | `text` notNull + CHECK | `el-mapa` \| `los-planes` \| `la-biblioteca` \| `los-entrenamientos` \| `la-plataforma` |
| `titulo` | `text` notNull | una línea, 3–140 |
| `cuerpo` | `text` notNull | 10–4000 |
| `contexto` | `jsonb` | `{ ruta?, encuadre?, capa? }` — nunca PII |
| `severidad` | `text` + CHECK | **sólo `origen = 'adentro'`**; CHECK cruzado lo impone |
| `estado` | `text` notNull + CHECK default `dicha` | los seis de §2.3 |
| `razon` | `text` | obligatoria para `no_va` y `bajada` (CHECK) |
| `anotada_como` | `text` | el `D-0NN` cuando una idea se acepta |
| `cierre_url` | `text` | commit o entrada de Bitácora |
| `llave_hash` | `text` | SHA-256 de la llave; nunca sale en una respuesta |
| `huerfana` | `boolean` notNull default false | §2.7 |
| `firmas` | `integer` notNull default 0 | denormalizado, lo mantiene el `POST` de firma |
| `creada_en` / `movida_en` | `timestamptz` notNull | |

Los `CHECK` se declaran con `check()` en el tercer argumento de `pgTable` — no como SQL suelto en el archivo de migración, que `drizzle-kit` no ve y el próximo `generate` duplica.

### 3.2 `faltas_firmas`

`falta_id` → `faltas.id` (cascade) · `llave_hash text notNull` · `creada_en`. Unique `(falta_id, llave_hash)`: firmar dos veces con la misma llave cuenta una.

### 3.3 Qué sale por la API pública

Todo menos `llave_hash` y el `id` interno. **Ni IP, ni hash de IP, ni user-agent, ni la llave.** Hay una guarda que lo afirma (§5), y existe porque `submittedAs` publicó el UUID del teléfono como nombre de autor (`docs/specs/2026-08-11-d-el-registro-publico.md` §1.6). Esa clase de fuga no se repite dos veces en el mismo sistema.

---

## §4 Las piezas

| Pieza | Qué hace |
|---|---|
| `packages/civic-core/src/faltas.ts` | vocabulario (estados, orígenes, superficies, severidades) y `transicionValida(desde, hacia, patch)`. Puro: sin base, sin HTTP, sin UI |
| `packages/db/src/schema/faltas.ts` | las dos tablas con sus CHECK |
| `packages/db/src/repositories/faltas.ts` | `FaltasRepository`: crear, listar por cursor, leer por id público, firmar, mover de estado, upsert del importador |
| `apps/api/src/features/faltas/routes.ts` | `GET /` · `GET /:idPublico` · `POST /` · `POST /:idPublico/firmas` · `DELETE /:idPublico` (con llave) · `PATCH /:idPublico` (admin) |
| `scripts/content/importar-deudas.ts` | el importador de §2.7 |
| `apps/web/src/pages/LoQueFalta/` | la página, con `sections/` y `lo-que-falta-data.ts` |
| `apps/web/src/components/papel/PanelDejarFalta.tsx` | el panel compartido por las cuatro bocas |

Dos detalles que muerden si no se dicen: el `POST` anónimo entra a `ANON_ALLOWED` de `apps/api/src/middleware/csrf.ts` (sin eso, un envío sin sesión se rechaza siempre), y el guardado de admin reusa el patrón `requireAdmin(username)` de `apps/api/src/features/blog/routes.ts:67`, que muestrea `getConfig().admin.usernames`.

---

## §5 Qué se prueba

- **civic-core** — la máquina entera: cada transición válida, cada inválida, y `no_va` sin razón rechazado.
- **el importador** — contra el `docs/DEUDAS.md` real: una entrada abierta, una resuelta, doble corrida sin duplicar, y una huérfana que no se borra.
- **la API** — que `bajada` deje la fila y vacíe el cuerpo; que firmar dos veces con la misma llave cuente una; que `PATCH` a `no_va` sin razón devuelva 400.
- **la guarda de fuga** — que ninguna respuesta de `/api/v1/faltas` contenga `llave_hash`, IP, ni user-agent.
- **la web** — que el panel abierto desde el mapa adjunte el encuadre; que un enlace en el cuerpo se renderice como texto y no como `<a>`.

---

## §6 Fuera de alcance

Panel de administración con UI. Envío de mail. Moderación automática. Notificaciones. Traducción. Adjuntar imágenes. Y cualquier cambio a `senales`, al mapa civil o al feed del registro público.
