# Plan — Mi Argentina ideal, entrega 1: Imaginar y Mirar

> **Spec:** `v2/docs/specs/2026-10-19-mi-argentina-ideal-la-pila.md`, revisión 2: §3, §4, §7 y §8. Las decisiones D1–D4 son del 19/10/2026.
> **Prototipo:** `v2/docs/demos/2026-10-19-mi-argentina-ideal.html`. Las pantallas se construyen contra él, después de probarlo con cinco personas (compuerta antes de la tarea 11).
> **Rama:** la que indique el dueño. Hoy se trabaja en `codex/argentina-ideal`, 15 commits adelante de `main`.
> **Producción:** nada se mergea a `main` ni se pushea sin confirmación del dueño. Un push a `main` despliega v2, esta entrega trae la migración `0040`, y **sale a producción junto con la entrega 2**.

## Qué deja andando

**Imaginar.** Una persona entra por «Imaginar mi Argentina» y llega a `/mi-argentina-ideal/imaginar`. Escribe con ayuda de las puntas, achica su aporte a una línea, confirma el tema sugerido, elige su provincia y publica. En el cierre puede compartir su aporte como imagen y sigue a `/mi-argentina-ideal/mirar`.

**Mirar.** Ahí mira aportes de otras personas de a uno y contesta Yo también, Yo no o Paso. Dos veces por tanda elige cuál de dos va primero. La pila le da prioridad a los aportes donde su región todavía no llega a cinco opiniones. Si algo no va, lo reporta. La tanda termina en una pantalla de cierre.

**Gestión y coherencia.** Juan retiene y devuelve aportes desde `/gestion/pila` y recibe avisos. En `/senal/:id`, los deseos de la campaña usan las mismas tres respuestas.

**No entra en esta entrega:**
- Ver, aportes parecidos y compartir la visión: entrega 2.
- Header nuevo, pregunta en la portada, simulación afuera y panel viejo borrado: entrega 3.
- Capas: entrega 4.

## Decisiones fijas

**Las del dueño (spec §8):**
- D1: sólo aportes reales.
- D2: tres respuestas.
- D3: sin revisión previa; un aporte sale con 13 reportes de actores distintos.
- D4: la simulación sale del recorrido, en la entrega 3.

**Las de diseño de este plan.** P1 necesita el visto bueno del dueño antes de la tarea 11. Las demás valen salvo indicación contraria.

- **P1 — Para entrar a Mirar, el aporte cede su texto.** Hoy un aporte sin cesión muestra «Texto reservado por su autoría.» en toda lectura pública (`textoDeSenalPublica`). La pantalla Publicar pide una elección explícita, sin opción marcada:
  - «Que cualquiera lo pueda leer y citar, sin tu nombre. Entra a Mirar.»
  - «Que cuente, pero que el texto quede reservado. No entra a Mirar.»

  La alternativa, y lo que costaría, está en la spec §8.
- **P2 — El texto del aporte es la línea.** `senales.texto` guarda hasta 140 letras. Lo que se escribió completo va como fragmento `{ pregunta, respuesta }` en `contribuciones.fragmentos`. No hay columna nueva en `senales`, que ya pasa el tope de 300 líneas.
- **P3 — Mirar sólo trae deseos de la campaña nacional.** Clase `deseo`, con cesión, sin retirar ni retener, de hasta 140 letras, con contribución en Mi Argentina ideal (regla 11 de la constitución).
- **P4 — Una tanda tiene hasta diez papelitos y muestra lo que haya.** Más dos duelos como máximo y la tarjeta de escribir. Con cero, el estado vacío.
- **P5 — La provincia de quien opina se pregunta una sola vez.** Viaja con cada opinión. La región se deriva en el servidor y se guarda junto a la provincia, así las consultas de «cuenta en este aporte» no repiten la conversión. No va a `localStorage`.
- **P6 — La escritura vive en memoria.** «Guardar borrador en este dispositivo» sigue siendo explícito (`lib/participacion/borradores.ts`).
- **P7 — La lectura asistida no entra.** No se llama a `/api/v1/contribuciones/interpretar` (D-136).
- **P8 — Hay protecciones que no son moderación:**
  - el filtro local de datos personales en los deseos;
  - la retención inmediata por Juan;
  - un reporte cuenta sólo si quien reporta contestó cinco aportes antes;
  - avisos a los admins.
- **P9 — Tipografía de Papel y Tinta.** Anton para títulos y cifras, Archivo para el texto del papelito, Space Mono para rótulos y sellos.

**Pruebas.** Nunca `pnpm verify` ni `pnpm test` a secas, porque `v2/.env` es producción. Se corre `pnpm lint`, `pnpm type-check`, `pnpm test:unit`, `pnpm test:scripts`, `PUERTO_PRUEBA=<n> pnpm test:integration:local` y `pnpm build`. Un commit por tarea, en Conventional Commits con alcance.

**Orden.**
- Las tareas 1 a 9 no dependen de la prueba con personas y pueden ir en paralelo de a dos: una de datos y API, otra de `shared` y `civic-core`.
- Las tareas 10 a 13 son de pantalla. La 11 y la 12 esperan la compuerta.

---

## Tareas

### 1. [x] Una sola pregunta para la campaña (cierra D-134)

`packages/shared/src/participacion/campanas.ts`:

```ts
/** La pregunta de Mi Argentina ideal. Portada, reglas de la campaña, Imaginar y Mirar leen ésta. */
export const PREGUNTA_MI_ARGENTINA_IDEAL = 'En tu Argentina ideal, ¿qué sería posible en tu vida?';
```

- La importan:
  - `Home/sections/HeroBasta.tsx`;
  - `lib/participacion/armar-aporte.ts`, en `PREGUNTAS_GUIADAS[0]`;
  - `packages/db/scripts/campana-nacional/contrato.ts`, en `pregunta`. La `descripcion` de las reglas se reescribe con la misma pregunta.
- `ElMapa/sections/PortadaMapa.tsx` deja de decir «Contá qué futuro querés, qué lo impide y qué podrías aportar».
- La siembra de producción todavía no corrió (D-121), así que cambiar las reglas ahora no abre una edición nueva. Las bases locales ya sembradas se resiembran.
- Prueba: en `packages/db` se afirma que `contratoNacional().pregunta === PREGUNTA_MI_ARGENTINA_IDEAL`.
- Commit: `fix(participacion): una sola pregunta para Mi Argentina ideal`.

### 2. [x] Regiones, tanda y duelos, en `civic-core`

Es módulo puro: sin red, sin disco, sin reloj.

**`packages/civic-core/src/regiones.ts`**, con clave en el ISO 3166-2 de `PROVINCIAS_CANONICAS`:

```ts
export const REGIONES = ['NOA', 'NEA', 'Cuyo', 'Centro', 'Buenos Aires', 'Patagonia'] as const;
export type Region = (typeof REGIONES)[number];
const REGION_DE: Readonly<Record<string, Region>> = {
  'AR-Y': 'NOA', 'AR-A': 'NOA', 'AR-T': 'NOA', 'AR-K': 'NOA', 'AR-G': 'NOA', 'AR-F': 'NOA',
  'AR-N': 'NEA', 'AR-W': 'NEA', 'AR-H': 'NEA', 'AR-P': 'NEA',
  'AR-M': 'Cuyo', 'AR-J': 'Cuyo', 'AR-D': 'Cuyo',
  'AR-X': 'Centro', 'AR-S': 'Centro', 'AR-E': 'Centro', 'AR-L': 'Centro',
  'AR-B': 'Buenos Aires', 'AR-C': 'Buenos Aires',
  'AR-Q': 'Patagonia', 'AR-R': 'Patagonia', 'AR-U': 'Patagonia', 'AR-Z': 'Patagonia', 'AR-V': 'Patagonia',
};
export function regionDe(isoCode: string | null): Region | null {
  return isoCode === null ? null : (REGION_DE[isoCode] ?? null);
}
```

La Pampa va en Centro, aunque por ley integra la Región Patagónica. El comentario lo dice y el test lo fija.

**`packages/civic-core/src/pila/tanda.ts`:**

```ts
export const TAMANO_DE_TANDA = 10;
export const OPINIONES_PARA_CONTAR = 5; // una región «cuenta» en un aporte con cinco opiniones
export interface CandidatoDeTanda {
  readonly id: string;               // id público
  readonly respuestas: number;       // respuestas con valor, de cualquier actor
  readonly opinionesDeMiRegion: number; // acuerdo + desacuerdo de mi región; 0 si no sé mi región
  readonly publicadaEn: string;      // ISO
  readonly tema: string | null;
  readonly provinciaIso: string | null; // de quien lo escribió
}
/**
 * Orden sin azar: primero donde mi región no llega a OPINIONES_PARA_CONTAR, después
 * menos respuestas, después más viejo, después id. Los lugares 3, 6 y 9 prefieren
 * mi provincia y después mi región; nunca cuatro seguidos del mismo tema si hay alternativa.
 */
export function armarTanda(
  candidatos: readonly CandidatoDeTanda[],
  mia: { provinciaIso: string | null },
  tamano = TAMANO_DE_TANDA,
): string[];
```

**`packages/civic-core/src/pila/duelos.ts`:**

```ts
/** Después de la 4.ª y la 8.ª respuesta: el «yo también» más reciente contra el más antiguo sin duelo. */
export function proximoDuelo(
  acuerdos: readonly string[],                 // ids en orden de respuesta
  yaComparados: ReadonlySet<string>,           // claves de par ordenadas, «a|b» con a < b
  usadosEnDuelo: ReadonlySet<string>,
): readonly [string, string] | null;
export const LUGARES_DE_DUELO = [4, 8] as const;
export const MAXIMO_DE_DUELOS = 2;
export function clavePar(a: string, b: string): string;
```

Pruebas en `__tests__/regiones.test.ts`, `__tests__/tanda.test.ts` y `__tests__/duelos.test.ts`:
- Las 24 provincias tienen región y no sobra ninguna.
- La prioridad por región le gana a la de menos respuestas.
- Sin región conocida, manda la de menos respuestas.
- Los lugares 3, 6 y 9 respetan el orden provincia, región, cualquiera.
- No hay cuatro seguidos del mismo tema cuando hay alternativa.
- Con menos candidatos que el tamaño, devuelve todos.
- Es determinista.
- `proximoDuelo` no repite un par.
- Con menos de dos acuerdos devuelve `null`.
- `clavePar(a, b) === clavePar(b, a)`.

Commit: `feat(civic-core): regiones, armado de la tanda y duelos`.

### 3. [x] La línea, las puntas, el tema sugerido y el filtro, en `@v2/shared`

`packages/shared/src/participacion/pila.ts`:
- `LARGO_LINEA = 140`, `UMBRAL_REPORTES = 13` y `RESPUESTAS_PARA_REPORTAR = 5`.
- `MOTIVOS_DE_REPORTE = ['insulta', 'datos_personales', 'fuera_de_tema'] as const`.
- `lineaSugerida(texto: string): string`:
  - toma la primera oración;
  - le saca la fórmula de arranque con una expresión que tolera variantes: «En mi Argentina ideal», «en mi argentina ideal,», «En una Argentina ideal», con o sin coma, «que» o «podría»;
  - pone mayúscula inicial;
  - si pasa de 140, corta en la última palabra entera, sin puntos suspensivos inventados.
- `PUNTAS`: las siete de la spec §3, como `{ clave, rotulo, pista }`.
- `sugerirTema(texto: string): string | null`:
  - usa un léxico chico por tema, con raíces normalizadas sin tildes. Por ejemplo, para salud: `médic`, `hospital`, `turno`, `salita`, `remedio`, `guardia`;
  - devuelve un tema sólo si gana por al menos dos palabras de diferencia o es el único que aparece. Si no, `null`.
- `buscarDatosPersonales(texto: string): { tipo: 'mail' | 'telefono' | 'dni'; desde: number; hasta: number }[]`, con reglas conservadoras:
  - **mail:** el patrón usual.
  - **teléfono:** de 8 a 13 dígitos con espacios, guiones, paréntesis o `+`, sin puntos de miles.
  - **DNI:** de 7 a 8 dígitos, con o sin puntos, sólo si en los 15 caracteres anteriores aparece «dni», «documento» o «d.n.i.».

Pruebas:
- `lineaSugerida`: cada variante de la fórmula; una oración que ya entra; una de 300 letras.
- `sugerirTema`: un caso por tema; un empate da `null`.
- `buscarDatosPersonales`, casos que **no** tienen que frenar: «1.000.000 de pesos», «la Ruta 40», «para 2030», «100.000 habitantes», «el 0800 de la obra social», «la línea 60».
- `buscarDatosPersonales`, casos que sí: `11 1234-5678`, `+54 9 351 555 1234`, `0351-15-555-1234`, `mi DNI es 30.123.456`.

`packages/shared/src/validation/pila.ts`, todos estrictos y con mensajes en rioplatense:
- `pedidoTandaSchema`: `{ campana?: slug, priorizarRegion?: Region }`
- `opinionSchema`: `{ valor: 'acuerdo' | 'desacuerdo' | 'paso', provinciaId: number | null }`
- `dueloSchema`: `{ a: uuid, b: uuid, primero: uuid | null }`, con un refine: `primero ∈ {a, b, null}` y `a ≠ b`
- `reporteSchema`: `{ motivo }`
- `retencionSchema`: `{ motivo: string 3..200 }`

Commit: `feat(shared): línea, puntas, tema sugerido, filtro de datos personales y contratos de la pila`.

### 4. [x] Migración `0040_la_pila` y esquema

`packages/db/src/schema/pila.ts` va en archivo nuevo, de no más de 300 líneas, y se exporta en el barrel. Después:

```bash
pnpm --filter @v2/db db:generate --name la_pila
```

El SQL que sale se revisa a mano y se compromete con su snapshot y su journal.

```sql
CREATE TABLE "pila_respuestas" (
  "senal_id" bigint NOT NULL REFERENCES "senales"("id") ON DELETE cascade,
  "actor_id" bigint NOT NULL REFERENCES "actores"("id"),
  "user_id" integer REFERENCES "users"("id") ON DELETE set null,
  "valor" text,                                   -- null = se mostró y todavía no contestó
  "provincia_id" integer REFERENCES "geographic_locations"("id"),
  "region" text,                                  -- derivada en el servidor de provincia_id (P5)
  "mostrada_en" timestamptz DEFAULT now() NOT NULL,
  "respondida_en" timestamptz,
  CONSTRAINT "pila_respuestas_pk" PRIMARY KEY ("senal_id","actor_id"),
  CONSTRAINT "pila_respuesta_valor_chk" CHECK ("valor" in ('acuerdo','desacuerdo','paso')),
  CONSTRAINT "pila_respuesta_fecha_chk" CHECK (("valor" is null) = ("respondida_en" is null)),
  CONSTRAINT "pila_respuesta_region_chk" CHECK ("region" in ('NOA','NEA','Cuyo','Centro','Buenos Aires','Patagonia')),
  CONSTRAINT "pila_respuesta_region_provincia_chk" CHECK (("region" is null) = ("provincia_id" is null))
);
CREATE UNIQUE INDEX "pila_respuestas_senal_user_unico" ON "pila_respuestas" ("senal_id","user_id") WHERE "user_id" is not null;
CREATE INDEX "pila_respuestas_actor_idx" ON "pila_respuestas" ("actor_id", "respondida_en");
CREATE INDEX "pila_respuestas_senal_region_idx" ON "pila_respuestas" ("senal_id","region") WHERE "valor" in ('acuerdo','desacuerdo');

-- ¿Cuál va primero? Un par por actor, sin importar el orden: a < b por id.
CREATE TABLE "pila_duelos" (
  "a_id" bigint NOT NULL REFERENCES "senales"("id") ON DELETE cascade,
  "b_id" bigint NOT NULL REFERENCES "senales"("id") ON DELETE cascade,
  "actor_id" bigint NOT NULL REFERENCES "actores"("id"),
  "user_id" integer REFERENCES "users"("id") ON DELETE set null,
  "primero_id" bigint,                            -- null = los dos por igual
  "region" text,
  "creado_en" timestamptz DEFAULT now() NOT NULL,
  "cambiado_en" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "pila_duelos_pk" PRIMARY KEY ("a_id","b_id","actor_id"),
  CONSTRAINT "pila_duelo_orden_chk" CHECK ("a_id" < "b_id"),
  CONSTRAINT "pila_duelo_primero_chk" CHECK ("primero_id" is null or "primero_id" in ("a_id","b_id"))
);
CREATE UNIQUE INDEX "pila_duelos_user_unico" ON "pila_duelos" ("a_id","b_id","user_id") WHERE "user_id" is not null;

CREATE TABLE "pila_reportes" (
  "senal_id" bigint NOT NULL REFERENCES "senales"("id") ON DELETE cascade,
  "actor_id" bigint NOT NULL REFERENCES "actores"("id"),
  "motivo" text NOT NULL,
  "cuenta" boolean NOT NULL,                      -- quien reportó tenía 5 respuestas o más
  "creado_en" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "pila_reportes_pk" PRIMARY KEY ("senal_id","actor_id"),
  CONSTRAINT "pila_reporte_motivo_chk" CHECK ("motivo" in ('insulta','datos_personales','fuera_de_tema'))
);

-- Quién retuvo o devolvió, cuándo y por qué. Los reportes cuentan desde la última devolución.
CREATE TABLE "pila_decisiones" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "senal_id" bigint NOT NULL REFERENCES "senales"("id") ON DELETE cascade,
  "decision" text NOT NULL,
  "origen" text NOT NULL,                         -- 'reportes' | 'gestion'
  "admin_id" integer REFERENCES "users"("id"),
  "motivo" text NOT NULL,
  "creada_en" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "pila_decision_chk" CHECK ("decision" in ('retener','devolver')),
  CONSTRAINT "pila_decision_origen_chk" CHECK ("origen" in ('reportes','gestion')),
  CONSTRAINT "pila_decision_admin_chk" CHECK (("origen" = 'gestion') = ("admin_id" is not null))
);
CREATE INDEX "pila_decisiones_senal_idx" ON "pila_decisiones" ("senal_id","creada_en");
```

`pila_respuestas` reemplaza a `opiniones` para la pila sin tocarla: `opiniones` sigue siendo de las fichas y pide cuenta, y ésta funciona con el actor.

Prueba en `packages/db/tests/migracion-0040.test.ts`, sobre la base descartable:
- Los CHECK rechazan valores fuera del vocabulario.
- `valor` sin `respondida_en` se rechaza.
- `region` sin provincia se rechaza.
- `a_id ≥ b_id` se rechaza.
- Un `primero_id` ajeno al par se rechaza.
- Un segundo reporte del mismo actor no entra.

Commit: `feat(db): migración 0040 — respuestas, duelos, reportes y decisiones de la pila`.

### 5. [x] `PilaRepository`

Va en `packages/db/src/repositories/pila.ts`. Si pasa de 400 líneas, se parte en `pila.ts` (tanda y opiniones) y `pila-gestion.ts` (reportes y decisiones). Devuelve filas tipadas.

El predicado de elegibilidad se escribe una sola vez y lo usan todas las lecturas. Va con referencias de columna de Drizzle y no con alias, para que `textoDeSenalPublica` entre en la misma consulta:

```ts
/** Lo que puede aparecer en Mirar. P3. */
const elegible = (campanaId: string) => sql`
  ${senales.clase} = 'deseo' and ${senales.estado} <> 'retirada' and ${senales.retenidaEn} is null
  and ${senales.cesionLicencia} and char_length(${senales.texto}) <= ${LARGO_LINEA}
  and exists (select 1 from ${contribuciones} c
              where c.senal_id = ${senales.idPublico} and c.campana_id = ${campanaId}::uuid)`;
```

**Métodos:**

- `candidatos({ campanaId, actorId, userId, region, limite = 60 })`:
  - devuelve elegibles, sin los propios (por `actor_id` o `user_id`) y sin los ya contestados por este actor o esta cuenta;
  - trae `respuestas`, `opinionesDeMiRegion` (0 si `region` es `null`), `tema` y su etiqueta, la provincia de quien escribió (nombre e ISO) y `origen`. `origen` es la `respuesta` del fragmento cuando existe y hay cesión; si no, `null`;
  - el orden SQL es grueso (`opinionesDeMiRegion < 5` primero, después `respuestas`, `publicada_en` e `id_publico`); el fino lo hace `armarTanda`.
- `registrarExposicion(senalIds, actorId, userId)`: un INSERT con `on conflict do nothing`.
- `opinar({ idPublico, actorId, userId, valor, provinciaId, region })`:
  - hace upsert y completa `respondida_en`;
  - devuelve `{ coinciden, regionCompleta }`, o `null` si el aporte no es elegible o es propio;
  - `coinciden` cuenta los **otros** actores con el mismo valor, y vale `null` para `paso`;
  - `regionCompleta` es verdadero si esta opinión deja la región en exactamente cinco.
- `comparar({ a, b, primero, actorId, userId, region })`:
  - ordena el par por `senales.id` y hace upsert;
  - exige que los dos aportes sean elegibles y que este actor haya dicho `acuerdo` a los dos; si no, `null`.
- `estadoDelActor(campanaId, actorId, userId)` devuelve `{ provincia, yaPregunto, yaAporto, paresComparados, respuestasDadas }`:
  - `provincia` es la de la última respuesta con provincia o, si no hay, la del aporte propio en la campaña;
  - `yaPregunto` es verdadero si hay cualquier respuesta.
- `reportar({ idPublico, actorId, motivo })` va en una sola sentencia, porque el driver HTTP de Neon no tiene transacción interactiva. Lo que sigue es la forma; los parámetros van con `sql` de Drizzle:

  ```sql
  with s as (select id from senales where id_publico = $1 and <elegible> and actor_id is distinct from $2),
  habil as (select count(*) >= 5 as ok from pila_respuestas where actor_id = $2 and valor is not null),
  nuevo as (insert into pila_reportes(senal_id, actor_id, motivo, cuenta)
            select id, $2, $3, (select ok from habil) from s
            on conflict do nothing returning senal_id, cuenta),
  desde as (select coalesce(max(creada_en), '-infinity') t from pila_decisiones
            where senal_id = (select id from s) and decision = 'devolver'),
  total as (select (select count(*) from pila_reportes r, desde
                    where r.senal_id = (select id from s) and r.cuenta and r.creado_en > desde.t)
                 + (select count(*) from nuevo where cuenta) as n),
  retenida as (update senales set retenida_en = now(), retenida_motivo = 'reportes'
               where id = (select id from s) and retenida_en is null and (select n from total) >= 13
               returning id)
  insert into pila_decisiones(senal_id, decision, origen, motivo)
  select id, 'retener', 'reportes', 'Trece reportes de personas distintas' from retenida
  returning senal_id;
  ```

  - El `+ count(nuevo)` hace falta porque una CTE no ve la fila que inserta otra CTE de la misma sentencia.
  - Devuelve `{ retenido: boolean, primerReporteDeDatos: boolean }` para que el servicio avise.
  - La API no revela nada de esto.
- `paraGestion({ campanaId, cursor })`: los aportes de la campaña con reportes desde la última devolución, retenidos o no, ordenados por reportes que cuentan. Pagina de a 50.
- `retener(idPublico, adminId, motivo)` y `devolver(idPublico, adminId, motivo)`: escriben `senales.retenida_*` y `pila_decisiones` en un `db.batch`.
- `avisarAdmins(userIds, clave, titulo, href)`: un INSERT en `eventos_civicos` con `on conflict (user_id, clave) do nothing`. Las claves son `pila:retenido:<id>` y `pila:datos:<id>`, así el aviso es idempotente.
- `opinionDe(idPublico, actorId, userId)`: para `/senal/:id`.

**Pruebas de integración** en `packages/db/tests/pila.test.ts`:
- No aparecen los propios ni los contestados.
- No aparecen los aportes sin cesión, retirados, retenidos ni los hechos.
- La prioridad por región se cumple.
- Opinar dos veces cambia la opinión y no la duplica.
- Una cuenta en dos actores no opina doble.
- `regionCompleta` vale verdadero sólo en la quinta.
- Comparar sin acuerdo previo da `null`.
- El par se guarda una vez sin importar el orden.
- El reporte de un actor con cuatro respuestas no cuenta.
- El reporte 12 que cuenta no retiene y el 13 sí.
- Después de una devolución hacen falta 13 nuevos.
- No se puede reportar lo propio.
- El aviso no se duplica.

Commit: `feat(db): repositorio de la pila`.

### 6. [x] API de Mirar

Va en `apps/api/src/features/pila/{routes,service,types}.ts` y se monta en `app.ts` como `app.use('/api/v1/pila', pilaRouter)`, después de `csrfProtect`.

CSRF va por doble envío: el token sale de `GET /api/v1/contribuciones/contexto`, igual que en Imaginar. No se agrega ninguna exención.

| Método y ruta | Cuerpo | Responde |
|---|---|---|
| `POST /api/v1/pila/tandas` | `{ campana?, priorizarRegion? }` | `{ tarjetas: { id, texto, origen, provincia, tema }[], estado: { provincia, preguntarProvincia, yaAporto, paresComparados } }` |
| `PUT /api/v1/pila/opiniones/:idPublico` | `{ valor, provinciaId }` | `{ coinciden: number \| null, regionCompleta: { region } \| null }` |
| `PUT /api/v1/pila/duelos` | `{ a, b, primero }` | `204` |
| `POST /api/v1/pila/reportes/:idPublico` | `{ motivo }` | `202 { recibido: true }` |
| `GET /api/v1/pila/aportes/:idPublico` | — | `{ enMirar: boolean, miOpinion }` (para `/senal/:id`) |

**Tandas.**
- La tanda es POST porque registra exposición.
- Crea el actor si hace falta (`resolverActor` + `ponerCookieDeActor`). Sin actor responde 503 `SIN_ACTOR`, con el mensaje de la adhesión.
- `service.armarTanda()` hace cuatro pasos:
  1. pide `estadoDelActor` y `candidatos`;
  2. calcula la región con `regionDe` de `civic-core`;
  3. aplica `armarTanda`;
  4. registra la exposición de los elegidos.
- `priorizarRegion` (desde «Completar los de tu región», entrega 2) sólo se honra si es la región del actor.
- `texto` sale por `textoDeSenalPublica`, aunque el predicado ya exija cesión. La regla vive en un solo lugar.
- La campaña cerrada o inexistente responde 404 `CAMPANA_NO_DISPONIBLE`, con el mensaje en rioplatense.

**Opiniones y reportes.**
- `provinciaId` se valida contra las 24 y se convierte a región en el servidor.
- Un aporte propio o no elegible en una opinión, un duelo o un reporte devuelve 404, sin distinguir el motivo, para no revelar el estado.
- **Avisos.** Cuando `reportar` devuelve `retenido` o `primerReporteDeDatos`, el servicio busca los ids de `ADMIN_USERNAMES` y llama a `avisarAdmins`. Los títulos son «Un aporte salió de Mirar por reportes» y «Reportaron datos personales en un aporte», y los dos llevan a `/gestion/pila`.

**Límites de pedidos.** Va un `pilaRateLimit()` nuevo en `middleware/rate-limit.ts`, de 1.000 pedidos por hora por IP. Una escuela entera sale por una sola IP, y el lanzamiento de la D1 no puede chocar con eso. El techo real es por actor y lo cuenta el servicio:
- 300 opiniones por hora;
- 60 tandas por hora;
- 30 reportes por día.

Los reportes además van con `anonSubmitRateLimit()`.

**Pruebas de integración** en `apps/api/tests/pila.test.ts`, con base descartable y el patrón de `senales-adhesion.test.ts`; la limpieza va de las hojas a la raíz:
- La tanda sin cookie crea actor y no trae aportes propios.
- La tanda vacía devuelve `tarjetas: []`.
- Sin token CSRF responde 403.
- Opinar actualiza, y `coinciden` cuenta a los otros.
- `paso` devuelve `null`.
- La quinta opinión de una región devuelve `regionCompleta`.
- Un duelo sin acuerdos previos responde 404.
- Un duelo válido se puede cambiar.
- El reporte 13 que cuenta saca el aporte de la tanda siguiente y deja un aviso para cada admin.
- `preguntarProvincia` vale verdadero la primera vez y falso después de una respuesta.
- `priorizarRegion` ajena se ignora.
- El techo por actor responde 429 con mensaje en rioplatense.

Commit: `feat(api): tandas, opiniones, duelos y reportes de Mirar`.

### 7. [x] Gestión de Mirar (sólo admin)

`apps/api/src/features/pila/gestion-routes.ts`, montado en `/api/v1/gestion/pila` con `authenticate` y `exigirAdmin`:

- `GET /` → `paraGestion`. Trae texto completo, motivos con su conteo, cuántos reportes no cuentan, estado y última decisión. El admin ve el texto aunque esté reservado, porque lo está juzgando. No se exporta.
- `POST /:idPublico/retencion` `{ motivo }` → `retener`.
- `DELETE /:idPublico/retencion` `{ motivo }` → `devolver`.

Pruebas:
- Sin sesión responde 401.
- Sin admin responde 403.
- Retener lo saca de la tanda.
- Devolver lo vuelve a poner.
- Cada decisión queda en `pila_decisiones` con `admin_id`.

Commit: `feat(api): retener y devolver aportes de Mirar`.

### 8. [x] Contribuciones: filtro, texto protegido y retención visible

- **Filtro.** En `POST /api/v1/contribuciones`, cuando `claseDe(v.senal.tipo) === 'deseo'`, se corre `buscarDatosPersonales` sobre `senal.texto` y cada `fragmentos[].respuesta`.
  - Si encuentra algo, responde 422 `DATOS_PERSONALES` con `{ hallazgos: [{ tipo }] }` y el mensaje «Tu aporte tiene lo que parece un {teléfono|mail|DNI}. Sacalo antes de publicar: el aporte se ve en público.».
  - No devuelve el fragmento, que el cliente ya tiene.
- **Texto protegido.** En `MiEspacioRepository.aportePrivado`, `textoProtegido` también vale verdadero si existe una fila en `pila_respuestas` con valor. Nadie queda contestando una frase que después cambió.
- **Retención visible.** `AportePropio` suma `retenido: { origen: 'reportes' | 'gestion'; desde: string } | null`, leído de `pila_decisiones`.

Pruebas, sumadas a `apps/api/tests/participacion-ideal.test.ts`:
- Un sueño con teléfono responde 422.
- Un `recurso` con teléfono pasa.
- Corregir un aporte ya contestado en Mirar responde 409 `TEXTO_CON_HISTORIA`.
- Mi espacio muestra la retención.

Commit: `feat(api): filtro de datos personales y aportes contestados protegidos`.

### 9. [x] Web: rutas, consultas y la puerta de entrada

**Rutas.**
- En `app-routes.tsx` van `/mi-argentina-ideal/imaginar` y `/mi-argentina-ideal/mirar`.
- `/mi-argentina-ideal` redirige a `/mi-argentina-ideal/imaginar` hasta que la entrega 2 ponga ahí a Ver.
- Las páginas se cargan con `lazy()` en `app-pages-participacion.tsx`, y los prefijos se suman en `layouts/papel-routes.ts`.

**`lib/participacion/aportar.ts`.**
- `APORTAR_HREF = '/mi-argentina-ideal/imaginar'`.
- `aportarHref()` en modo guiado arma `/mi-argentina-ideal/imaginar?campana&edicion&borrador&lugar`.
- El modo directo sigue yendo a `/el-mapa?participar=directo#instrumento`.
- Se reescribe el comentario de cabecera, que dice que «Imaginar vive dentro del mapa».

**Redirección desde el mapa.** En `ElMapa.tsx`, `?participar=aportar|imaginar|guiado` redirige con `replace` a la ruta nueva, conservando la consulta. El panel viejo queda sin entrada y se borra en la entrega 3.

**`lib/queries/pila.ts`.**
- `usePedirTanda()` es una mutación, porque registra exposición.
- `useOpinar()`:
  - optimista;
  - con una cola en memoria que reintenta tres veces con espera creciente;
  - expone `pendientes` y `perdidas` para el aviso «Tus últimas N respuestas no se guardaron».
- `useComparar()`, `useReportar()`, `useOpinionDe(idPublico)` y `useGestionPila()`.

**Pruebas.** Se actualiza `aportar.test.ts` con los enlaces nuevos y la redirección desde el mapa, y se prueba la cola de `useOpinar` con red que falla y se recupera.

Commit: `feat(web): rutas de Mi Argentina ideal y puerta de Imaginar`.

### 10. [x] Web: piezas comunes

En `pages/MiArgentinaIdeal/comun/`:

- **`Pasos.tsx`**: «Imaginar · Mirar · Ver». Marca el momento actual y enlaza a los otros. «Ver» aparece recién con la entrega 2; hasta entonces son dos pasos.
- **`Papelito.tsx`**: la tarjeta.
  - Arriba, en Space Mono, «Alguien de {provincia} imagina», o «Alguien de la Argentina imagina». Al centro, la línea en Archivo de 24 px. Al pie, el tema.
  - Tiene una inclinación fija derivada del id (de −1,5° a 1,5°) y una variante `quieto` para la vista previa.
- **`Sello.tsx`**: YO TAMBIÉN, YO NO, PASO y PRIMERO, en Space Mono 700, con borde de 3 px, rotado y con opacidad controlable.
- **`imagen-para-compartir.ts`**:
  - `partirEnRenglones(texto, medir, ancho)` es puro y se prueba;
  - `dibujarAporte(canvas, { linea, provincia })` dibuja 1080 × 1350 sobre papel, con kicker, línea, «Mi Argentina ideal» y la dirección del sitio;
  - espera `document.fonts.load` de Anton y Archivo antes de dibujar.
- **`Compartir.tsx`**: «Compartir mi aporte».
  - Con `navigator.canShare({ files })`, comparte la imagen.
  - Si no, comparte el enlace con `navigator.share`.
  - Si tampoco, ofrece «Descargar la imagen» y «Copiar el enlace».

Pruebas:
- `partirEnRenglones` con palabras largas y con 140 letras.
- `Compartir` en los tres caminos, con `navigator` simulado.
- `Papelito` con y sin provincia, y con movimiento reducido.

Commit: `feat(web): papelito, sellos e imagen para compartir`.

### 11. [x] Web: Imaginar en tres pantallas

> **Compuerta.** Antes de esta tarea: la prueba con cinco personas de la spec §10, con el prototipo, y lo que salga corregido en el prototipo y en este plan. También el visto bueno del dueño sobre P1.

`pages/MiArgentinaIdeal/Imaginar.tsx` es la página, de no más de 300 líneas, con estado `'pregunta' | 'linea' | 'publicar' | 'listo'`. Las secciones van en `pages/MiArgentinaIdeal/imaginar/`:

1. **`PantallaPregunta.tsx`**: el título es `PREGUNTA_MI_ARGENTINA_IDEAL` en Anton. Abajo, el campo de hasta 2000 (`useAutoAltura`), las `PUNTAS` como chips que cambian la pista visible sin escribir en el campo, «Seguir» y «Guardar borrador en este dispositivo». Un `borrador=` válido se carga.
2. **`PantallaLinea.tsx`**:
   - Arriba dice «Así lo van a ver otras personas. Podés dejarlo como está o achicarlo.»
   - El campo viene con `lineaSugerida(texto)` y contador «N de 140».
   - El tema son 13 chips de `/contribuciones/contexto`, con el que propone `sugerirTema` marcado como «¿Es sobre {tema}?». La persona confirma o cambia, así que sale como `declarado`.
   - La provincia es un `<select>` nativo de `useProvincias()` con «Prefiero no decirlo».
   - `buscarDatosPersonales` corre en vivo y subraya el tramo.
3. **`PantallaPublicar.tsx`**:
   - Muestra la vista previa con `Papelito` en modo quieto.
   - Pide la elección de P1, en dos tarjetas de radio sin opción marcada, con «Qué quiere decir citar» desplegable.
   - El consentimiento es una sola frase.
   - Incluye `DestinoDelAporte` (de `Imaginar/`, se reutiliza) y «Publicar mi aporte».
   - Maneja `CAMPANA_CAMBIADA`, `CUENTA_CAMBIADA`, `ENVIO_DISTINTO` y `DATOS_PERSONALES` sin perder el texto. El reintento es idempotente por `idLocal`.
4. **`Listo.tsx`**:
   - Dice «Tu aporte quedó publicado.» y muestra la imagen para compartir.
   - Ofrece `Compartir` y, como acción principal, «Ahora mirá lo que imaginan otros →», que lleva a `/mi-argentina-ideal/mirar?desde=imaginar`.
   - Debajo, plegado como «Tu recibo», van `FraseCampana` en forma «después», el identificador y «Ver y gestionar mi aporte».
   - Llama a `despertar()` como hoy.

`armarAporteGuiado` se reemplaza por `armarAporteIdeal` en `lib/participacion/armar-aporte.ts`:
- `tipo: 'sueño'`;
- `texto` = la línea;
- `fragmentos` = `[{ pregunta: PREGUNTA_MI_ARGENTINA_IDEAL, respuesta: texto }]`, sólo si el texto completo difiere de la línea;
- `cedeLicencia` según la elección;
- `tema` según lo confirmado.

Pruebas en `pages/MiArgentinaIdeal/__tests__/imaginar.test.tsx`:
- No se puede seguir con el campo vacío.
- Una punta cambia la pista y no el campo.
- La línea viene precargada sin la fórmula y respeta 140.
- El tema sugerido aparece y se puede cambiar.
- Un teléfono se marca y bloquea Publicar.
- Sin elegir quién puede leerlo no se publica.
- El cuerpo enviado tiene la línea como texto y el original como fragmento.
- Un 409 conserva el texto.
- El borrador se carga.

Commit: `feat(web): Imaginar en tres pantallas`.

### 12. [x] Web: Mirar

`pages/MiArgentinaIdeal/Mirar.tsx` es la página, de no más de 300 líneas. Pide la tanda al montar. Si `preguntarProvincia`, muestra antes `PreguntaProvincia`. Después muestra los papelitos de a uno e intercala los duelos según `LUGARES_DE_DUELO` y `proximoDuelo`. Las secciones van en `pages/MiArgentinaIdeal/mirar/`:

- **`PapelitoArrastrable.tsx`**:
  - envuelve `Papelito` con `framer-motion` (`drag`, `dragSnapToOrigin`, `onDrag` para la opacidad del sello, `onDragEnd`);
  - más de 90 px a la derecha, a la izquierda o hacia abajo cuenta como respuesta;
  - con `useReducedMotion()` no vuela: se desvanece;
  - tocarlo abre `DetalleAporte`.
- **`BotonesRespuesta.tsx`**: Yo no, Paso y Yo también, de al menos 44 px. El teclado responde con ←, ↓, → y Enter, sólo con el foco en la pila.
- **`AvisoRespuesta.tsx`**, con `aria-live="polite"`:
  - «Vos y N personas más.»
  - «Vos y N personas más dijeron que no.»
  - «Con tu respuesta, {región} ya cuenta en este aporte.» Le gana a las otras cuando viene.
  - «Sos de los primeros en verlo.»
  - Con paso, nada.
- **`TarjetaDuelo.tsx`**:
  - pregunta «Si sólo uno pudiera pasar primero, ¿cuál elegís?»;
  - los dos papelitos van apilados en el teléfono y lado a lado desde 768 px;
  - tocar uno le pone el sello PRIMERO;
  - tiene «Los dos por igual»; con teclado, 1, 2 e igual;
  - después de elegir avanza solo, a los 600 ms.
- **`TarjetaEscribir.tsx`**: «Te toca. {PREGUNTA}», con «Escribir el mío» → `/mi-argentina-ideal/imaginar?volver=mirar` y «Saltear». Va en el sexto lugar (o al final si hay menos de seis), sólo si `yaAporto` es falso y no se llegó desde Imaginar.
- **`DetalleAporte.tsx`** usa el `Dialog` de Radix, como hoja inferior en el teléfono.
  - Muestra la línea y, si viene `origen`, «Lo que escribió completo».
  - Abajo, «Reportar este aporte», con tres motivos en radio y «Enviar reporte».
  - Al confirmar dice «Gracias. Lo vamos a tener en cuenta.» y pasa al siguiente papelito sin contestarlo.
- **`FinDeTanda.tsx`**:
  - «Listo. Miraste {N}. Dijiste yo también a {M}.» y la lista de esos M.
  - Ofrece «Otra tanda», que nunca empieza sola, y «Escribir el mío» si `yaAporto` es falso.
  - La entrega 2 suma «Ver cómo se va armando →».
- **`MirarVacio.tsx`**: «Todavía nadie más publicó su aporte en Mi Argentina ideal. El tuyo va a ser de los primeros que vean otras personas.» Ofrece «Escribir el mío» o, si ya aportó, «Compartir mi aporte». Nada de «no hay datos» ni «disponible»: el componente se suma a la prueba de frases prohibidas de `ElMapa/instrumento/__tests__/vacios.test.tsx`, o esa prueba se lleva a un helper compartido.
- **`PreguntaProvincia.tsx`**: «¿De qué provincia sos?», con `<select>` nativo, «Prefiero no decirlo» y una línea de para qué sirve.
- **`AvisoPendientes.tsx`**: «Tus últimas N respuestas no se guardaron. Reintentar.» Aparece sólo si hay pérdidas.

Pruebas en `pages/MiArgentinaIdeal/__tests__/mirar.test.tsx`:
- Cada botón manda su valor, y las flechas también.
- El duelo aparece después de la cuarta respuesta con dos acuerdos, y no aparece con uno.
- Elegir en el duelo manda el par correcto.
- La tarjeta de escribir aparece en el sexto lugar y no aparece si `yaAporto` es verdadero.
- La tanda vacía muestra `MirarVacio`.
- El fin de tanda no pide otra solo.
- El aviso de región completa le gana al de coincidencias.
- Un error al opinar deja la cola y avisa.
- Reportar pasa a la siguiente.
- Con movimiento reducido no hay transformación de vuelo.

Commit: `feat(web): Mirar`.

### 13. [x] Web: gestión, Mi espacio y la página del aporte

- **`pages/GestionPila.tsx`** en `/gestion/pila`, sólo para admin; el resto ve el mismo mensaje que `/gestion/campanas`.
  - Lista paginada con texto, provincia, motivos con conteo, reportes que no cuentan, estado y última decisión.
  - «Retener ahora» y «Devolver» piden un motivo.
  - Se enlaza desde `/gestion/campanas` y desde Mi espacio, si `esAdmin`.
- **`MiEspacio`.** En «Mis aportes», un aporte retenido muestra «Salió de Mirar por reportes de otras personas» o «Lo retuvo la coordinación», con fecha y un enlace a `/lo-que-falta` para discutirlo. Los avisos a los admins ya aparecen en «Avisos», que lee `eventos_civicos`.
- **`/senal/:id`.** Si `useOpinionDe` dice `enMirar`, en lugar de `BotonAdherir` se muestran las tres respuestas, con `BotonesRespuesta` reutilizado y la opinión propia marcada. Los hechos siguen con su adhesión y su «¿Sigue así?».

Pruebas de componente para las tres.

Commit: `feat(web): gestión de Mirar y una sola forma de opinar sobre un deseo`.

### 14. [x] Copy, guardias y documentos

- **Glosario.** Se corre la prueba de `scripts/content/glosario.ts`. Las pantallas nuevas dicen «aporte», nunca «voz», «mirada» o «señal». «Línea», «papelito» y «pila» no aparecen en pantalla. La línea de base no puede subir.
- **`docs/DEUDAS.md`.**
  - D-134 queda resuelta con su commit.
  - D-136 suma que el recorrido nuevo no llama a `interpretar` y que el panel viejo se borra en la entrega 3.
  - D-137 suma que los deseos de la campaña ya no usan adhesiones.
- **`docs/operations/campana-nacional.md`.** Se explican para Juan, en pocas líneas:
  - reportes, retención y avisos;
  - cómo imprimir el cartel con QR para el lanzamiento en persona.
- Commit: `docs(participacion): entrega 1 de Mi Argentina ideal`.

### 15. [x] Recorrido de punta a punta en el navegador

`tests/e2e/mi-argentina-ideal.spec.ts` (Playwright), con la API interceptada como en `recorrido-escuela.spec.ts`:

- **A 390 px:**
  1. Portada → «Imaginar mi Argentina».
  2. Una punta, escribir y Seguir.
  3. Línea, tema sugerido y provincia.
  4. Elegir quién puede leerlo y Publicar.
  5. Listo: Compartir con `navigator.share` simulado, y Mirar.
  6. Seis tarjetas: deslizar con `page.mouse` a la derecha, la izquierda y abajo.
  7. El duelo.
  8. Reportar una.
  9. Fin de tanda.
- **A 1440 px**, el mismo recorrido con teclado solamente.
- Mirar vacío.
- En las dos medidas, no hay scroll horizontal.

Commit: `test(e2e): Imaginar y Mirar`.

### 16. [x] Verificación y cierre

- `pnpm lint`, `pnpm type-check`, `pnpm test:unit`, `pnpm test:scripts`, `PUERTO_PRUEBA=55470 pnpm test:integration:local`, `pnpm test:e2e` (proyectos de teléfono y escritorio) y `pnpm build`.
- Revisión en el navegador contra la API local con base descartable, nunca con `v2/.env`:
  - las pantallas a 390 px y a 1440 px;
  - papel y noche;
  - movimiento reducido;
  - lector de pantalla en el papelito, los botones y el duelo.
- Se anota el resultado en el registro de abajo.

---

## Producción, con confirmación del dueño, en este orden y **junto con la entrega 2**

1. **La prueba con cinco personas**, hecha y anotada.
2. **Cerrar D-121.** La cuenta de Juan verificada en v2, después `ADMIN_USERNAMES` en Vercel, después `db:seed-campana-nacional --produccion`. Sin campaña, Mirar responde 404 a todo.
3. **Respaldo de Neon** (`respaldo-antes-mirar-AAAA-MM-DD`), aplicar `0040` (y la de la entrega 2) y comprobar las tablas.
4. **Mergear a `main`**, que despliega. Después se prueba en el dominio:
   - publicar un aporte con la cuenta de Juan;
   - verlo desde otro navegador en Mirar;
   - opinar, compararlo y reportarlo;
   - retenerlo desde `/gestion/pila` y retirarlo.
5. **Lanzamiento en persona (D1).** Carteles con QR en escuelas, clubes y plazas, cada persona con su teléfono. Si hace falta escucha asistida, antes hay que sumar el canal «asistido» a las reglas de la campaña, que es una edición nueva.

## Registro

- 2026-10-19 — Plan escrito y revisado el mismo día (revisión 2: duelos, prioridad por región, reportes con historia, imagen para compartir, una sola forma de opinar sobre un deseo, rutas con el nombre de los momentos, tipografía de Papel y Tinta). Falta el visto bueno sobre P1 y la prueba con cinco personas antes de las tareas 11 y 12.
- 2026-10-20 — Las dieciséis tareas, hechas en ocho frentes e integradas en `codex/argentina-ideal`, junto con el paso previo para proponer campañas (spec §11). Al integrar se cerraron D-133, D-134, D-136, D-137 y D-140, y se mitigó D-138. Verificación: lint, tipos, unitarias (web 1.781, civic-core 519, shared 216, api 53, db 70), scripts (261), integración completa contra Postgres descartable, `mi-argentina-ideal.spec.ts` (390 px con gestos, 1440 px con teclado, Mirar vacío) y build. La revisión en el navegador encontró que la hoja del aporte perdía el foco al abrir el reporte y Escape dejaba de cerrarla; quedó arreglada con su prueba. **Sigue pendiente:** el visto bueno sobre P1 y la prueba con cinco personas, que la sección de producción pide antes de abrir.
