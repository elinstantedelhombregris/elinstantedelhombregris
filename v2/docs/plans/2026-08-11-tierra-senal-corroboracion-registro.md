# La tierra, la señal, la corroboración y el registro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar el defecto de origen del mapa —un campo `tipo` que son cuatro vocabularios— construyendo, en orden de dependencia real, las cuatro piezas que lo reemplazan: el callejero del Estado espejado en Neon, una sola tabla de señales con vocabulario cerrado en la base, la máquina de corroboración con su rastro verificable, y el registro público con feed cronológico y volcado diario. Al terminar, `verificables` y `confirmaciones` —los dos números que `brillo.ts` pide desde julio y que ninguna tabla sabe producir— existen, y la métrica norte pasa de frase a consulta.

**Architecture:** Una sola tabla `senales` reemplaza a `dreams`, `pulse_signals` y `proposals`. El vocabulario vive en `packages/civic-core/src/senal/` y la base lo copia con FK compuestas contra tres catálogos sembrados dentro de la migración: el par `('sueño','hecho')` no existe, así que no se puede insertar. Encima de esa tabla se cuelgan cinco tablas de corroboración (`confirmaciones`, `senal_resolucion`, `resolucion_confirmacion`, `rastro_senal`, `evidencia`) y una materializada (`celda_luz`). El callejero crece hacia abajo en `geographic_locations` (17.986 filas medidas) más `geo_calles` (326.832 medidas), y una señal guarda calle + altura + texto normalizado con nueve CHECK que hacen inexpresable publicar la altura de la casa de alguien. El registro público lee de esa misma tabla con keyset simple y serializa desde una lista blanca con piso de publicación por rol.

**Tech Stack:** TypeScript ESM estricto · Drizzle ORM 0.36.4 sobre Neon Postgres 17 · Express en función serverless (ADR 0008) · React 18 + Vite + Tailwind · vitest 2.1.8 · Expo SDK 57 en `apps/mobile` · sin dependencias nuevas salvo `@vercel/blob` (rebanada 6, con ADR).

---

## Global Constraints

- **Las cinco tablas cívicas están en CERO.** `dreams`, `pulse_signals`, `proposals`, `territory_mandates` y `semillas` no tienen una sola fila. **No hay migración de datos que hacer en ninguna tarea de este plan, y no va a haber otro momento más barato.** Cada vez que una tarea parezca cara, mirar si lo es por la forma o por los datos: si es por los datos, no lo es. Esto es lo que hace triviales hoy —y carísimas en tres meses— la tabla única, el vocabulario en FK compuesta, los CHECK de dirección y el cambio de `ConteoCelda`.
- **Base:** Neon `cool-bird-63087148`, Postgres 17, us-east-2. **Techo duro 512 MB**, hoy 38 MB. **Producción sirve v2 desde esta misma base y un push a `main` despliega.** Toda escritura en Neon es irreversible: está marcada tarea por tarea.
- **TypeScript:** `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. `@typescript-eslint/no-explicit-any: error`. `@ts-ignore` prohibido. Imports con extensión `.js` aunque el archivo sea `.ts`.
- **civic-core no depende de nada:** ni de una app, ni de red, ni de disco, ni de `Date.now()`. El reloj y el hash entran por parámetro.
- **Nunca devolver `0` para significar «no sé»,** ni `'valor'` para significar «no sé qué tipo es». Uniones discriminadas.
- **Textos de cara al usuario en español rioplatense.**
- **Ningún archivo del array `schema` de `packages/db/drizzle.config.ts` puede importar `@v2/civic-core`:** drizzle-kit corre en CJS y se atraganta con los imports ESM con sufijo `.js`. El amarre entre TypeScript y Postgres es la guarda SQL de la Task 12, no un import.
- **Commits:** Conventional Commits con scope (`feat(db):`, `feat(api):`, `feat(civic-core):`, `feat(web):`, `feat(mobile):`).

### Reserva de ordinales y de números de migración

Tres specs reclamaron `D-034` con tres significados distintos y dos reclamaron `0013`. Dos archivos `0013_*.sql` en la misma carpeta con un solo `_journal.json` es peor que una colisión de ids: `migrate()` lee el journal, así que el segundo o no se aplica y no avisa, o se aplica en un orden que ninguna spec previó. La asignación vinculante para todo este plan:

| Rebanada | Migraciones | Ordinales de `docs/DEUDAS.md` |
|---|---|---|
| 1–2 · La tierra | `0013`, `0014`, **`0015`** | D-034, D-035 |
| 3 · La señal | ~~`0015`~~ → **`0016`** | D-036 a D-040 |
| 5 · La corroboración | ~~`0016`~~ → **`0017`** | D-041 a D-043 |
| 6 · El registro público | ~~`0017`~~ → **`0018`** | D-044 a D-046 |

**CORRIMIENTO DE UN NÚMERO, 2026-08-12 — la rebanada 1 se llevó tres migraciones y no dos.** La Task 6 necesitaba archivo propio: su `0013b_georef_not_null.sql` era «o append al `0013` si todavía no se aplicó», y el `0013` **se aplicó** (commit `91ef699`), así que appendear dejaría de existir como opción. Se escribió como **`0015_georef_not_null.sql`**, detrás del `0014_trigram_calles.sql` de la Task 7 — ese orden y no el inverso porque `repositories/geo-calles.ts` ya nombra al GIN como «la migración `0014`» en dos comentarios y `tests/geo-calles.test.ts` en uno, y renumerar el GIN sería editar prosa ya commiteada para no ganar nada.

**Todo lo que este plan escribe de la `0015` para abajo corre un número: la señal es la `0016`, la corroboración la `0017`, el `senales_feed_idx` la `0018`.** Las cabeceras de las Tasks 11, 21 y 29 quedaron con el número viejo y llevan su nota; el que las implemente que deje que `drizzle-kit generate` asigne el número y no lo escriba a mano. Los números de la sección de medición (`las cinco migraciones 0013–0017`) son el registro de la corrida del 11/8 sobre la rama efímera y se quedan como están: describen lo que se corrió ese día.

**Serie corregida, y hay que corregirla en las cuatro cabeceras (Task 1, Step 1):** *A la tierra · B la señal · C la corroboración · D el registro público.* Las cuatro specs nombran cuatro series distintas, y por eso tres obligaciones cruzadas quedaron dirigidas a documentos que no las iban a leer. Este plan las reasigna por documento y no por letra recordada.

### Verificación transversal

Todo commit tiene que dejar verde:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm lint && pnpm type-check && pnpm test:unit
```

Y antes de cerrar cada rebanada:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm verify
```

---

# REBANADA 1 · La tierra (backend)

Sale primero porque nada de esto depende de las otras tres, y las otras tres dependen de que `geographic_locations.province_id` deje de ser un `serial` sin FK. **Se recorta:** `direccionColumns` NO se spread-ea en `dreams`/`pulse_signals`/`proposals` —esas tablas mueren en la rebanada 3—, sus columnas y sus nueve CHECK se definen acá y se aplican en la Task 11 sobre `senales`. El selector de calle de la web tampoco entra: ese campo no se enciende hasta que la ingesta pregunte de verdad por el rol y la sensibilidad, y esa pregunta es de la rebanada 3. Así se parte la única dependencia circular real entre A y B por donde no duele: **A define, B aplica.**

---

### Task 1: La migración 0013 — reparar la jerarquía y crear el callejero

**Files:**
- Modify: `packages/db/src/schema/geographic.ts`
- Create: `packages/db/src/schema/geo-calles.ts`
- Create: `packages/db/src/schema/geo-seed.ts`
- Modify: `packages/db/src/schema/index.ts`
- Modify: `packages/db/drizzle.config.ts`
- Create: `packages/db/migrations/0013_la_tierra.sql` + entrada en `migrations/meta/_journal.json`
- Modify: `docs/specs/2026-08-11-{a-la-tierra,b-la-senal,c-la-corroboracion,d-el-registro-publico}.md` (sólo la cabecera de serie)
- Test: `packages/db/tests/migracion-0013.test.ts`

**Interfaces:**
- Consumes: nada. Es la primera tarea del plan.
- Produces: `geographicLocations` reparada con `parentId`/`departmentId`/`municipalityId`/`georefId`/`nameNorm`/`vigenteHasta`; `geoCalles`, `geoCalleCategorias`, `geoSeedProgreso`, `geoCatalogoVersion`.

**Reversibilidad:** **IRREVERSIBLE en producción.** `DROP SEQUENCE` y `DROP INDEX` no se deshacen con un `git revert`. Pero **las tablas cívicas están en cero y `geographic_locations` tiene 24 filas conocidas**, así que el peor caso es re-sembrar 24 provincias desde `seed-provinces.ts`. Correr primero contra una rama efímera de Neon.

- [ ] **Step 1: Corregir las cuatro cabeceras de serie**

En las cuatro specs, la línea `**Serie:**` pasa a decir exactamente: `cuatro specs · A la tierra · B la señal · C la corroboración · D el registro público`. Es veinte minutos y evita que las obligaciones cruzadas sigan apuntando a documentos equivocados.

- [ ] **Step 2: Escribir el test de migración (falla)**

Create `packages/db/tests/migracion-0013.test.ts`. Cinco afirmaciones, todas contra Postgres real:

```ts
it('ninguna provincia queda sin padre y toda provincia es su propio padre', async () => {
  const [{ huerfanas }] = await db.execute(sql`
    select count(*)::int as huerfanas from geographic_locations g
    left join geographic_locations p on p.id = g.province_id where p.id is null`);
  expect(huerfanas).toBe(0);
  const [{ malas }] = await db.execute(sql`
    select count(*)::int as malas from geographic_locations
    where level = 'province' and province_id <> id`);
  expect(malas).toBe(0);
});

it('la secuencia de province_id no existe más', async () => {
  const [{ n }] = await db.execute(sql`
    select count(*)::int as n from pg_class where relname = 'geographic_locations_province_id_seq'`);
  expect(n).toBe(0);
});

it('el vocabulario de niveles está cerrado y no incluye city', async () => {
  const [{ def }] = await db.execute(sql`
    select pg_get_constraintdef(oid) as def from pg_constraint
     where conname = 'geographic_locations_level_chk'`);
  expect(def).toContain("'locality'");
  expect(def).toContain("'settlement'");
  expect(def).not.toContain("'city'");
});

it('el cero de georef no puede entrar como altura', async () => {
  await expect(db.execute(sql`
    insert into geo_calles (georef_id, localidad_id, departamento_id, provincia_id,
      nombre, nombre_norm, nombre_clase, categoria, altura_desde)
    values ('0000000000001', 1, 1, 1, 'X', 'X', 'nominada', 'CALLE', 0)`)).rejects.toThrow();
});

it('sobre base vacía, sembrar las 24 provincias funciona', async () => { /* Step 6 */ });
```

Run: `cd v2 && pnpm --filter @v2/db test:integration`
Expected: FAIL — las tablas no existen.

- [ ] **Step 3: El schema de Drizzle**

En `geographic.ts`, `provinceId: serial('province_id')` pasa a `integer('province_id').notNull()`. **Las cuatro FK auto-referenciales no compilan sin anotar el callback:** con `strict` TypeScript rechaza la inferencia circular (TS7022/7023) y `no-explicit-any` cierra la salida fácil. Hay que importar `type AnyPgColumn` de `drizzle-orm/pg-core`:

```ts
import { type AnyPgColumn, check, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

provinceId: integer('province_id').notNull().references((): AnyPgColumn => geographicLocations.id),
parentId: integer('parent_id').references((): AnyPgColumn => geographicLocations.id),
departmentId: integer('department_id').references((): AnyPgColumn => geographicLocations.id),
/** Pertenencia CRUZADA, no escalón del árbol: en Buenos Aires el partido es
 *  departamento y municipio a la vez, y en Córdoba los municipios cruzan
 *  límites departamentales. NULL significa «el Estado no la lista dentro de
 *  ningún municipio» — un hecho sobre el país, no un dato faltante. */
municipalityId: integer('municipality_id').references((): AnyPgColumn => geographicLocations.id),
georefId: text('georef_id'),
nameNorm: text('name_norm'),
vigenteHasta: timestamp('vigente_hasta', { withTimezone: true }),
```

Se cae `uniqueIndex('geographic_locations_level_name_unique')` — con 4.027 localidades censales, el país tiene decenas de «San Martín» y «25 de Mayo» y la segunda revienta. Entran **los cuatro índices de A §3.1** y no dos: `uniqueIndex('geographic_locations_georef_unique').on(georefId)`, `index('geographic_locations_level_norm_idx').on(level, nameNorm)`, `index('geographic_locations_parent_idx').on(parentId)` e `index('geographic_locations_municipality_idx').on(municipalityId)`. El Step 3 de este plan enumeraba sólo los dos primeros y A declara cuatro: **gana la spec, que es la que los razonó**. Medidos, los cuatro juntos son 3,78 MB sobre 17.986 filas — dentro del ruido del presupuesto de la Task 19.

**`UNIQUE (georef_id)` se queda, y el seed deduplica. Es la decisión, y sale de la medición del 2026-08-11.** El supuesto de A §3.1 es falso: los ids de georef son únicos **dentro** de cada recurso y no **entre** recursos. **3.349 de los 14.673 asentamientos traen el mismo id que una localidad censal** —son el mismo lugar listado en los dos niveles, con `localidad_censal.id === id`; el caso testigo es `58112040`, Zapala— y el `COPY` revienta en la fila 6.690 de asentamientos.

Las dos salidas son mover la clave a `(level, georef_id)` o deduplicar. **Gana deduplicar**, y la razón es la misma por la que existe toda esta tarea: con la clave compuesta, el mismo lugar entra dos veces con dos `id` distintos, y entonces dos señales cargadas en Zapala pueden resolver a filas distintas según por qué recurso las alcanzó el resolvedor. **Dos filas para el mismo lugar es exactamente el defecto que `georef_id` vino a cerrar**, y se manifestaría como un mapa donde una localidad aparece dos veces con la mitad de las señales cada una — visible recién con datos, o sea tarde.

Deduplicar es correcto además por contenido: el lugar **ya entró como `locality`**, que es el nivel más informativo de los dos. El seed saltea el asentamiento cuyo `georef_id` ya existe **y lo cuenta en el reporte de la corrida**, porque un salteo silencioso sería un `filas_escritas <> total_declarado` sin explicación (Task 5, Step 4). **Consecuencia en los conteos, y hay que propagarla:** la jerarquía son **17.986 filas y no 21.345**, con `settlement` en 11.324 y no 14.673.

`geo-calles.ts` y `geo-seed.ts` según A §3.2, §3.3 y §4.7, con los cinco CHECK de `geo_calles` (`georef_id ~ '^[0-9]{13}$'`, `nombre_clase`, los dos de altura `> 0`, y `desde <= hasta`) declarados con `check()` de `drizzle-orm/pg-core` para que el snapshot de `migrations/meta/` los conozca. **`geographic_locations.parent_id` vale distinto en cada nivel y esa tabla no es opcional** (A §3.1): provincia NULL, departamento y **municipio** cuelgan de la provincia, localidad del departamento, asentamiento de su localidad censal o del departamento si BAHRA no la trae.

Agregar las dos rutas nuevas al array `schema` de `drizzle.config.ts`. **Sin esto `db:generate` no ve las tablas y genera una migración vacía, en silencio.**

- [ ] **Step 4: Generar y editar a mano la migración**

```bash
cd v2 && pnpm --filter @v2/db db:generate
```

drizzle-kit genera las columnas y las tablas nuevas, y **no genera la mitad interesante**: sobre `serial → integer` emite un `SET DATA TYPE` y deja secuencia y default en pie. Editar el `.sql` generado y meter, **en este orden y antes de las columnas nuevas**:

```sql
UPDATE geographic_locations SET province_id = id WHERE level = 'province';
ALTER TABLE geographic_locations ALTER COLUMN province_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS geographic_locations_province_id_seq;
ALTER TABLE geographic_locations
  ADD CONSTRAINT geographic_locations_province_fk
  FOREIGN KEY (province_id) REFERENCES geographic_locations(id);
DROP INDEX geographic_locations_level_name_unique;
```

El `DROP INDEX` y no `DROP CONSTRAINT`: se creó con `CREATE UNIQUE INDEX` en `0002_charming_scrambler.sql:33`, así que `DROP CONSTRAINT` fallaría.

Verificar que el archivo tiene entrada en `_journal.json`. **Un `.sql` dejado en la carpeta sin entrada en el journal nunca se aplica y no avisa.**

- [ ] **Step 5: `georef_id` entra nullable**

`NOT NULL` sobre 24 filas que todavía no lo cumplen no se puede aplicar. Se hace `NOT NULL` en la Task 8, después de que el seed lo llene.

- [ ] **Step 6: Reservar el id antes de insertar una provincia**

`province_id` es `NOT NULL` sin default desde este minuto, y una provincia es su propio padre: hay que reservar el id antes del INSERT. Va en `seed-provinces.ts`, reemplazando el `values({...})` de las líneas 69-75:

```sql
WITH nuevo AS (SELECT nextval('geographic_locations_id_seq')::int AS id)
INSERT INTO geographic_locations (id, province_id, level, name, iso_code, latitude, longitude, georef_id, name_norm)
SELECT nuevo.id, nuevo.id, 'province', $1, $2, $3, $4, $5, $6 FROM nuevo
ON CONFLICT (georef_id) DO UPDATE SET name_norm = EXCLUDED.name_norm
  WHERE geographic_locations.name_norm IS DISTINCT FROM EXCLUDED.name_norm;
```

Sin esto, sembrar una base vacía —CI con branch limpio, un dev local, la fase 1 del seed— muere con `null value in column "province_id" violates not-null constraint`. El quinto test del Step 2 lo prueba sobre base vacía, no sólo sobre la que ya tiene las 24 filas.

`name_norm` se escribe con `claveDeProvincia`, que es **la misma expresión que corre `findProvinceByName`** (`normalizarNombreDeLugar(normalizeProvinceName(x))`) y vive en `packages/db/scripts/clave-de-provincia.ts`, del lado de la base porque depende de la tabla de alias. La lista canónica sale de `@v2/civic-core` (`PROVINCIAS_CANONICAS`), que es datos sin efectos: el seed la sembraba, el relleno la necesita, el test de la migración la copiaba y el test del mapa de la web la tenía hardcodeada —`apps/web` no puede importar de `packages/db`—, y una lista copiada cuatro veces es una lista que va a divergir en la copia que nadie mira.

- [ ] **Step 7: Rellenar las 24 filas que YA existen — sin esto la migración rompe producción**

**El Step 6 hace nacer bien una base vacía y no repara la que ya existe.** Las 24 filas vivas entraron antes de la `0013` y quedan con `name_norm` y `georef_id` en NULL; `seed-provinces.ts` las saltea por su guard de existencia, y el guard tiene que quedarse: `ON CONFLICT (georef_id)` no alcanza a una fila cuyo `georef_id` es NULL —en Postgres un NULL no conflictúa con nada— así que sin el guard esas 24 filas se **duplicarían**.

O sea que el minuto siguiente a aplicar la migración, sin este paso, se ve así:

```
findProvinceByName(...)  → undefined  para las 24
provinciaIdDePunto(...)  → null       para todo punto del país
toda señal nueva         → se guarda sin provincia
```

y desaparece del coroplético, del detalle por provincia y de todo lo que agrega por territorio, **sin un solo error en ningún lado**. Eso es **D-001, que ya estaba arreglado y desplegado**. Medido sobre una base con la `0013` aplicada y sin rellenar: `findProvinceByName` devuelve `undefined` para **24 de 24**.

```bash
cd v2
pnpm --filter @v2/db geo:rellenar-provincias            # en seco: muestra qué haría
pnpm --filter @v2/db geo:rellenar-provincias --aplicar  # escribe
```

`scripts/rellenar-provincias.ts`. Cuatro propiedades, y ninguna es adorno:

- **Un solo normalizador.** La clave sale de `claveDeProvincia`, la misma función que corre la consulta. La spec A §5 prohíbe el segundo normalizador y no hay versión en SQL de esto: la diferencia entre dos normalizadores no aparece como un error sino como resultados que faltan.
- **En seco por defecto**, escribe con `--aplicar`. Es el patrón de `geo:backfill`.
- **Idempotente.** Cada UPDATE lleva su `IS DISTINCT FROM` y sólo se emite para las filas que difieren. Medido: segunda corrida, `0 a rellenar · 24 ya estaban`.
- **Falla cerrado.** Ante una fila de nivel `province` que no es ninguna de las 24, ante dos filas que caen en la misma clave, o ante una provincia del catálogo que no tiene fila, **no escribe nada** y sale con código distinto de cero. Un relleno a medias deja la mitad de las provincias encontrables y la otra mitad no, que es la forma más cara de fallar.

El driver es `pg` y no el HTTP de Neon, igual que `migrate.ts`: corre en el mismo minuto que la migración, con la conexión sin pooler, y con `pg` el script se puede ensayar contra cualquier Postgres. Contra el HTTP de Neon sólo se podría probar en la base que repara.

El script cierra diciendo **la cuenta que la Task 6 necesita**: cuántas filas quedan sin `georef_id`.

- [ ] **Step 8: Aplicar contra una rama efímera y después contra la base**

```bash
# Rama efímera primero. La irreversibilidad no se ensaya en producción.
cd v2 && DATABASE_URL_UNPOOLED="$NEON_BRANCH_URL" pnpm --filter @v2/db db:migrate
cd v2 && DATABASE_URL_UNPOOLED="$NEON_BRANCH_URL" pnpm --filter @v2/db geo:rellenar-provincias --aplicar
cd v2 && DATABASE_URL_DESCARTABLE="$NEON_BRANCH_URL" pnpm --filter @v2/db test:integration
```

Expected: todos verdes. Recién después, contra la base real — y ahí también los dos comandos, migración **y** relleno, en ese orden y sin nada en el medio.

`DATABASE_URL_DESCARTABLE` no es un adorno del ejemplo: la suite de `migracion-0013.test.ts` que prueba «sobre base vacía» crea un esquema, lo llena y lo tira, y por eso **no corre contra `DATABASE_URL` y no cae a ella por default**. Sin esa variable se saltea con un mensaje; apuntada a la misma base que sirve el sitio —incluso por el otro endpoint de Neon, que es el error fácil— se saltea igual **y** un test se pone rojo.

- [ ] **Step 9: Commit**

```bash
git add v2/packages/db/src/schema v2/packages/db/migrations v2/packages/db/drizzle.config.ts \
        v2/packages/db/scripts v2/packages/db/package.json v2/packages/db/tests v2/docs/specs
git commit -m "feat(db): la jerarquía territorial deja de colgar de un serial sin destino"
```

---

### Task 2: `direcciones.ts` en civic-core — el rango, el estado y lo que se puede publicar

**Files:**
- Create: `packages/civic-core/src/direcciones.ts`
- Modify: `packages/civic-core/src/index.ts`
- Modify: `packages/civic-core/src/location-policy.ts`
- Test: `packages/civic-core/src/__tests__/direcciones.test.ts`
- Test: `packages/civic-core/src/__tests__/direcciones-guardas.test.ts`

**Interfaces:**
- Consumes: `LocationPrecision`, `LocationRole`, `CivicSensitivity`, `PublishedPrecisionResult`, `normalizedLocationLabel`.
- Produces: `normalizarNombreDeCalle`, `normalizarNombreDeLugar`, `RangoDeAltura`, `clasificarAltura`, `DireccionEstado`, `componerDireccion`, **`direccionPermitida(tipo, role, sensitivity)`**, `techoDeTipo(tipo)`, `TIPOS_CON_TECHO_DE_DIRECCION`, `permisoMasRestrictivo`, `ubicacionPublicable`, `etiquetaDeDireccion`, `direccionSinAltura`.
  > **`direccionPermitida` toma TRES ejes y es la única puerta.** El piso por rol y sensibilidad —dos ejes— vive adentro del módulo y no se exporta desde `civic-core/src/index.ts`: mirar sólo el rol deja publicar la altura de un `saber` sobre la casa de otro (§2.6 de la spec A), que es el hueco entero que esta tabla existe para cerrar. La tabla cruda `TECHO_POR_TIPO` tampoco se exporta; se lee con `techoDeTipo`, que normaliza a NFC y devuelve una unión discriminada en vez de `undefined`.

**Resolución de contradicción (A vs B, `service_area` hereda la dirección completa):** la spec A razonó la fila «rol no-`subject`» sobre `capture` y `meeting_point`, y B metió cuatro tipos más en `service_area`. Bajo la tabla de A, un `saber` cargado como «en el pasillo del fondo del 340 vive una señora sola sin agua» se guarda y se publica entero. **Se separan los dos ejes:** el rol sigue gobernando el punto, y la dirección se gobierna por una función propia con su `Record` exhaustivo. Sólo `capture` y `meeting_point` llevan altura y `texto_libre`; `service_area` lleva calle y nada más; `subject` lleva calle sólo si la sensibilidad no es alta, y nada si lo es.

**Resolución de contradicción (A vs B, `subject ⇒ high` deja muerta la fila del medio):** gana A. «Es mi casa» produce `subject` + **`moderate`**, no `high`. Con la regla de B no existía ninguna combinación que produjera `subject` sin `high`, así que la segunda fila de la tabla de A era código muerto y un `¡basta!` sobre tu propio techo que se llueve perdía la dirección entera. El piso de publicación del punto es por ROL (rebanada 6), así que `subject`+`moderate` sigue saliendo engrosado a 500 m: la gradación no cuesta nada en protección del punto y recupera la cuadra en la dirección.

**Reversibilidad:** REVERSIBLE. Es un módulo puro sin escrituras.

- [ ] **Step 1: Escribir los tests (fallan)**

`direcciones.test.ts` cubre la tabla completa de `clasificarAltura` de A §4.5, con el caso `AV JUAN BAUTISTA ALBERDI` (`parcialHasta: 3200`) verificado contra la API: 4000 → `altura_fuera_de_rango`, 100 → `altura_sin_rango`. Un booleano `tiene_rango` los trataría igual y mentiría en las dos direcciones.

`direcciones-guardas.test.ts` son las diez guardas de A §8.1, con la redacción de frase-afirmación de `brillo-guardas.test.ts`. La cuarta es un property test sobre **6 estados × 6 precisiones × 4 roles × 3 sensibilidades × hayPunto**, con tres afirmaciones: con rol `subject` nunca vuelve altura ni `texto_libre`; con `coarsenedBecause !== null` vuelve `sin_direccion` **y** `cityId: null` con el departamento en su lugar; y **sin punto, con rol no-`subject` y sin protección, la dirección vuelve entera**. Ese último es el caso emblemático de la spec —Córdoba, sin GPS, calle escrita a mano— y el que un diseño llaveado en `LocationPrecision` borraba en silencio.

Run: `cd v2/packages/civic-core && pnpm vitest run src/__tests__/direcciones`
Expected: FAIL — `Failed to resolve import "../direcciones.js"`.

- [ ] **Step 2: Implementar**

```ts
export type RangoDeAltura =
  | { tipo: 'completo'; desde: number; hasta: number }
  | { tipo: 'parcialDesde'; desde: number }
  | { tipo: 'parcialHasta'; hasta: number }
  | { tipo: 'ausente' };

export type DireccionEstado =
  | 'sin_direccion' | 'calle' | 'altura_en_rango'
  | 'altura_sin_rango' | 'altura_fuera_de_rango' | 'texto_libre';

/** Qué parte de una dirección se puede guardar. Eje SEPARADO del punto: el rol
 *  gobierna la coordenada, esto gobierna el texto. Sin la separación, `sueño` y
 *  `saber` —que B manda a `service_area` con un argumento sobre el PUNTO—
 *  heredaban calle, altura y texto libre sin ninguna compuerta. */
export type PermisoDireccion = 'completa' | 'solo_calle' | 'ninguna';

/** El techo de un tipo, o la constancia de que el tipo no se reconoce. Unión y
 *  no `PermisoDireccion | undefined`: «no está en la tabla» y «está y no
 *  permite nada» son afirmaciones distintas, y sólo una habilita rechazar en el
 *  borde en vez de degradar en silencio. Acepta `string` porque el borde de la
 *  API todavía no validó nada. La búsqueda normaliza a NFC las dos puntas:
 *  `'práctica'` con la tilde combinante es OTRO string para JavaScript. */
export const techoDeTipo = (tipo: string): TechoDeTipo => { ... };

/** **La ÚNICA puerta de §2.6, y son TRES ejes.** El mínimo entre el techo del
 *  tipo y el piso del rol. El piso por rol y sensibilidad existe adentro del
 *  módulo y NO se exporta: mirar sólo el rol deja publicar la altura de un
 *  `saber` sobre la casa de otro, y mientras hubo dos funciones exportadas la
 *  forma de equivocarse era llamar a la que estaba a mano. Un tipo que no está
 *  en la tabla vale `'ninguna'`, nunca el techo más permisivo. */
export const direccionPermitida = (
  tipo: TipoConTechoDeDireccion, role: LocationRole, sensitivity: CivicSensitivity,
): PermisoDireccion => { ... };
```

**Nada de acá puede fallar abierto, y ésa es la única regla que gobierna el módulo.** `permisoMasRestrictivo` devuelve el MÁS restrictivo ante cualquier valor que no esté en la escala —con `PERMISOS.indexOf` daba `-1`, `-1` es menor que todo, y devolvía el permiso menos restrictivo—, la tabla `TECHO_POR_TIPO` **no se exporta** porque su uso natural (`TABLA[tipo]`) es exactamente el camino que devuelve `undefined` sin que el compilador lo vea, y `direccionSinAltura` ante un texto que no termina en la altura registrada devuelve el nombre de la calle o `null`, nunca el texto crudo con el número adentro.

`clasificarAltura` es total sobre las cuatro variantes de `RangoDeAltura`. **El estado se llama `altura_en_rango` y no `altura_confirmada` a propósito:** conseguir ese valor cuesta cero —cualquiera elige una calle con rango publicado y escribe un número adentro— y no prueba presencia ni existencia del domicilio. Es una afirmación sobre el **catálogo**, nunca sobre la señal.

`normalizarNombreDeCalle(texto, categorias)`: NFD, saca diacríticos combinantes, **elimina todo lo que no sea alfanumérico o espacio** (así `%` y `_` desaparecen antes de tocar cualquier `LIKE`), mayúsculas, colapsa espacios, y si el primer **token completo** está en `categorias` lo saca —salvo que sacarlo dejara el resultado vacío, que es el caso de `nombre: "CALLE"` con `categoria: "CALLE"` y que contra una columna `NOT NULL` reventaría. El corte por token completo es lo que hace que `AVELLANEDA` con categoría `AV` siga siendo `AVELLANEDA`.

`etiquetaDeDireccion` devuelve las cinco frases de A §6 y **no puede contener «confirmada», «confirmado» ni «verificada»**. **Y la que hay que escribir con más cuidado es la de `altura_sin_rango`, porque es la que va a ver la mayoría de la gente:** medido sobre el callejero real, sólo el 24,3% de las calles tiene rango publicado y apenas el 18,5% de las señales con altura cae en `altura_en_rango` (Task 5, Step 6). La etiqueta del caso mayoritario tiene que decir que **el catálogo no publica el rango de esa calle** —un hecho sobre el Estado— y no insinuar que la dirección es dudosa, que es un hecho sobre la persona que la escribió. Como esta rebanada sale antes que la máquina de estados, durante esa ventana la única etiqueta con pinta de estado en una fila va a ser la de la dirección: si dijera «confirmada», quien la lea entendería que alguien corroboró la señal, cuando lo único que pasó es que un número cayó dentro de un rango del INDEC.

En `location-policy.ts`, `PublishedPrecisionInput` gana `sujeto: 'propio' | 'tercero'` (default `'propio'`) y `overridable` pasa a `false` cuando vale `'tercero'`. El campo estaba previsto: su comentario dice «la persona manda sobre **su propia** ubicación» y «existe igual para que un régimen legal futuro pueda ponerlo en `false`».

- [ ] **Step 3: Verificar**

```bash
cd v2/packages/civic-core && pnpm test && pnpm type-check && pnpm lint
```

Expected: PASS — las 18 suites existentes más las dos nuevas. Las diez guardas verdes.

- [ ] **Step 4: Commit**

```bash
git add v2/packages/civic-core/src/direcciones.ts v2/packages/civic-core/src/index.ts v2/packages/civic-core/src/location-policy.ts v2/packages/civic-core/src/__tests__
git commit -m "feat(civic-core): una dirección dice hasta dónde se pudo verificar, y el rol decide qué se guarda"
```

---

### Task 3: El repositorio del callejero y la reparación de `GeographicRepository`

**Files:**
- Create: `packages/db/src/repositories/geo-calles.ts`
- Modify: `packages/db/src/repositories/geographic.ts`
- Modify: `packages/db/src/repositories/index.ts`
- Test: `packages/db/tests/geo-calles.test.ts`

**Interfaces:**
- Consumes: el schema de la Task 1, `normalizarNombreDeCalle` de la Task 2.
- Produces: `buscarCalles`, `porId`, `paqueteDeLocalidad`, `paqueteDeDepartamento`, `upsertLote`; y en `geographic.ts`: `findLocalidad`, `listChildren`, `findByGeorefId`, `resolveAncestors`.

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: El test que caza la regresión silenciosa**

`findProvinceByName` (`geographic.ts:37-45`) matchea `name` con tildes apoyado en el índice que la Task 1 dropeó. Si nadie lo toca, pasa a ser seq scan sobre 17.986 filas **en cada escritura que resuelve provincia** —o sea en el camino que cerró D-001— y sigue funcionando, que es lo peor que puede pasar. El test es la guarda 9 de A §8.1: las 24 provincias, con los nombres exactos de `provincias.generated.ts`, contra `findProvinceByName` sobre `name_norm`.

- [ ] **Step 2: Reparar `geographic.ts`**

- `findCity` filtra `level = 'city'`, valor que el CHECK de la Task 1 vuelve imposible: pasa a `findLocalidad`, con `level IN ('locality','settlement')` y `name_norm` con igualdad exacta.
- `findProvinceByName` pasa a `name_norm`, con **la misma función** que escribió la columna, sobre el índice `(level, name_norm)`.
- `normalizeProvinceName` queda como **tabla de alias** («CABA» → el nombre canónico) POR ENCIMA del normalizador, nunca como un segundo normalizador. Dos normalizadores es cómo vuelve D-012.
- `upsertLocation` **se llama upsert y es un INSERT pelado**: pasa a `ON CONFLICT (georef_id) DO UPDATE`.

- [ ] **Step 3: `geo-calles.ts`**

`buscarCalles` implementa la tabla de scopes de A §4.2: `localidad` con `q` de 1 carácter por substring sobre `(localidad_id, nombre_norm)`; `departamento` con 2 por `(departamento_id, nombre_norm)`; `provincia` con 3 por substring apoyado en el GIN de trigramas, y **ordenado** por `similarity()` (corregido 2026-08-12: el operador de los tres scopes es el mismo `LIKE '%…%'`; el GIN indexa eso y no `similarity()`, que sólo ordena — ver Task 7). **El scope es obligatorio**; sin él, 400. Nunca devuelve filas `nombre_clase = 'sin_nombre'` ni con `vigente_hasta` seteado — las dos **sí** salen por `porId`, con su marca, para que una señal vieja pueda seguir mostrando la dirección que tenía.

- [ ] **Step 4: Verificar**

```bash
cd v2 && pnpm --filter @v2/db test:integration && pnpm --filter @v2/db type-check
```

- [ ] **Step 5: Commit**

```bash
git add v2/packages/db/src/repositories v2/packages/db/tests
git commit -m "feat(db): el repositorio geográfico deja de buscar un nivel que ya no existe"
```

---

### Task 4: Los seis endpoints `/api/v1/geo/*` y el resolvedor de escritura

**Files:**
- Create: `apps/api/src/features/geo/{routes,service,validation,resolver}.ts`
- Modify: `apps/api/src/app.ts`
- Test: `apps/api/tests/geo-catalogo.test.ts`

**Interfaces:**
- Consumes: `geo-calles.ts`, `geographic.ts`, `provinciaIdDePunto`.
- Produces: `GET /lugares`, `/calles`, `/calles/:id`, `/paquete/:corrida/localidad/:id`, `/paquete/:corrida/departamento/:id`, `/version`; `DELETE /api/v1/geo/direccion/:tabla/:id?c=<código>`; y `resolverUbicacion(db, entrada): Promise<UbicacionResuelta>`.

**Reversibilidad:** REVERSIBLE (sólo lectura, salvo el `DELETE` de olvido, que es idempotente).

- [ ] **Step 1: Los tests de integración (fallan)**

De A §8.4: scope de localidad con `q` de un carácter; de provincia con `q` de tres; sin scope → 400; `limite=100000` → 400; `q=%` no devuelve la localidad entera; una `sin_nombre` no aparece y una con `vigente_hasta` tampoco; `/calles/:id` sí devuelve las dos con su marca; `/version` trae la cobertura por provincia y responde `no-cache`; un `settlement` resuelve al paquete de su localidad ancestro y uno sin localidad al de su departamento.

Y las cinco vías de `resolverUbicacion` en orden, con **un test que afirma explícitamente que no se guardó ningún centroide**.

- [ ] **Step 2: Implementar**

Las cuatro políticas de caché de A §4.1 —`/version` `no-cache`, `/paquete/:corrida/...` `immutable`, `/calles/:id` y `/lugares` 24 h, `/calles?q=` 300 s— porque los espacios de URL son distintos y `/calles?q=` es **infinito**: cachear 24 h ahí no protege nada y le regala al atacante un fallo de caché por tipeo. `limite` se valida `min(1).max(50).default(20)` y el servidor pone `LIMIT` **siempre**, aunque el cliente no mande nada; `statement_timeout` de 2 s en el router; y si el `q` recibido difiere de su forma normalizada, **308 a la URL canónica**, así el edge tiene un objeto por consulta real y no uno por tipeo.

`resolverUbicacion` devuelve la unión de A §4.4 con el orden de precedencia `calleId → localidadId → provinciaId → punto → ninguna`. **`calleId` se valida antes de insertar, no en la FK**: un `calleId` inexistente o `sin_nombre` responde **400 en castellano**, no una violación de FK convertida en 500. Y cuando hay punto **y** calle se corre `provinciaIdDePunto` igual: si no coincide, la fila se guarda con `origen: 'catalogo'` **y** `discrepancia` puesta, que el recibo dice. Es la única verificación cruzada gratis del sistema.

Cuando un nivel no se puede resolver: `NULL` en su id, con `ubicacion_origen` diciendo por qué vía se intentó. **Nunca un centroide, nunca un vecino, nunca un cero.**

- [ ] **Step 3: Verificar con curl**

```bash
cd v2 && pnpm --filter @v2/api dev &
sleep 4
curl -s 'http://localhost:3001/api/v1/geo/calles?q=mor' | head -c 400   # 400: falta scope
curl -s 'http://localhost:3001/api/v1/geo/version' -D - -o /dev/null | grep -i cache-control
# Expected: cache-control: no-cache
cd v2 && pnpm --filter @v2/api test:integration
```

- [ ] **Step 4: Commit**

```bash
git add v2/apps/api/src/features/geo v2/apps/api/src/app.ts v2/apps/api/tests/geo-catalogo.test.ts
git commit -m "feat(api): el callejero del Estado se sirve desde casa, con su cobertura declarada"
```

---

# REBANADA 2 · El seed del callejero

Va en su propia rebanada porque es la única del plan que depende de una API de terceros, la única que tarda minutos en vez de segundos, y la única cuyo fracaso a mitad de camino deja la base en un estado intermedio. Reanudable, idempotente, y verificada contra el conteo de la propia fuente.

---

### Task 5: El seed en tres capas, reanudable e idempotente

**Files:**
- Create: `packages/db/scripts/seed-callejero.ts`
- Modify: `packages/db/scripts/seed-provinces.ts`
- Modify: `packages/db/package.json` (script `db:seed-callejero`)
- Test: `packages/db/tests/seed-callejero-idempotencia.test.ts`

**Interfaces:**
- Consumes: `geo_seed_progreso`, `geo_catalogo_version`, `geo_calle_categorias`, `normalizarNombreDeCalle`.
- Produces: **17.986** filas en `geographic_locations` (medidas 2026-08-11, no las 21.345 estimadas: ver la deduplicación de la Task 1 Step 3) y **326.832** en `geo_calles` (medidas, exactamente el número esperado).

**Reversibilidad:** **IRREVERSIBLE.** Escribe ~347.000 filas en la base de producción. Correr **primero completo contra una rama efímera de Neon**, medir el pico con las consultas del Step 6, y recién después contra la base real.

- [ ] **Step 1: Las tres capas separadas**

`traer → normalizar → escribir`, en tres módulos, para que cambiar la fuente sea cambiar una capa. **Los paths exactos, porque el recurso se equivoca fácil y el error no falla:** `/provincias`, `/departamentos`, `/municipios`, **`/localidades-censales`** (con guión, y **no** `/localidades`, que es otro recurso: sembrar el equivocado entra filas plausibles y el `filas_escritas = total_declarado` cierra igual), `/asentamientos`, `/calles`.

**LA PAGINACIÓN QUE ESTE PLAN ESCRIBIÓ NO EXISTE. Corregido con la corrida real del 2026-08-11.** El plan decía «con `max=1000` son 327 requests de calles», o sea caminar `?inicio=` de mil en mil hasta 326.832. **La API topea `inicio` en 10.000 y `max` en 5.000: son 15.000 filas por combinación de filtros, y no hay ninguna forma de pedir la 15.001.** Con el callejero como una sola consulta, es inalcanzable — y el modo de falla es el peor de todos: las primeras 15.000 filas entran perfecto, el script no falla, y el país queda con el 4,6% de sus calles.

**La partición es por departamento y es obligatoria.** 529 departamentos más 5 llamadas de jerarquía = **534 requests con `max=5000`, serializadas, concurrencia 1, 350 ms de pausa entre una y otra: 268 segundos, cero 429.** Ningún departamento se acerca al techo de 15.000 —el mayor es Córdoba Capital con 8.542— así que la partición no sólo alcanza: sobra. Backoff exponencial y reintento por página igual, y **la unidad de `geo_seed_progreso` pasa a ser el departamento y no la provincia**, que además hace la reanudación nueve veces más fina.

**Y el chequeo que no puede faltar: si alguna partición devuelve exactamente 15.000 filas, el seed aborta.** Es la firma de que se tocó el techo y de que faltan filas que la API no va a entregar nunca con esa consulta. Sin ese chequeo, el día que un departamento crezca el país pierde calles en silencio y `filas_escritas = total_declarado` cierra igual, porque `total` viene truncado en la misma respuesta.

**El orden es obligatorio:** provincias → departamentos → municipios → localidades censales → asentamientos → calles. Las FK no dejan otra. La **fase 1 son las 24 provincias** con la sentencia de `nextval` de la Task 1 Step 6, y `seed-provinces.ts` deja de ser un script suelto.

- [ ] **Step 2: La normalización, con su asimetría declarada**

El seed normaliza **cada fila con su propio campo `categoria`** (`normalizar(fila.nombre, [fila.categoria])`), y la consulta pasa la lista entera de `geo_calle_categorias`. **El seed no lee esa tabla, y no leerla es la decisión:** sería circular —carga de a una provincia y la tabla se llena a medida que avanza, así que las primeras provincias se normalizarían contra una lista incompleta y `nombre_norm` quedaría inconsistente a lo largo de la tabla, en silencio, devolviendo menos resultados en unas provincias que en otras. La guarda 7 de la Task 2 afirma que los dos lados dan el mismo resultado igual.

El `0` de georef se traduce a `NULL` **en el borde del seed**, y el CHECK de la Task 1 le prohíbe la entrada para siempre.

**Tres cosas más que el borde tiene que limpiar, encontradas cargando el corpus real el 2026-08-11:**

1. **30 calles vienen con el rango invertido** (`altura_desde > altura_hasta`), y el CHECK `desde <= hasta` de la Task 1 las rechaza. **Se anula el `desde` y se conserva el `hasta`**, o sea la fila entra como `parcialHasta`: el `hasta` es el dato que `clasificarAltura` usa para decir «fuera de rango», que es la afirmación útil, y el `desde` invertido no se puede reparar sin inventar. **No se descarta la calle** — una calle sin rango sigue sirviendo para elegirla por nombre. Se cuenta en el reporte de la corrida.
2. **La provincia no matchea por nombre en 1 de 24.** Georef dice «Tierra del Fuego, Antártida e Islas del Atlántico Sur» y la base dice «Tierra del Fuego». **El seed resuelve la provincia por `georef_id` y no por nombre**, y donde necesite el nombre usa la tabla de alias de `normalizeProvinceName` (Task 3, Step 2) — **nunca un segundo normalizador**, que es cómo vuelve D-012. Sin esto el seed falla en la provincia 24 de 24, o sea después de cuatro minutos de corrida.
3. **`geo_calles.categoria` trae basura del Estado y hay que dejarla entrar.** 23 categorías distintas, cinco numéricas («0» ×3, «101», «330», «1015», «301050»), una literal «TIPO», y cuatro que no son calles: `LINEA FERREA` (23), `LIMITE DE PROPIEDAD` (20), `LINEA IMAGINARIA` (20), `CURSO DE AGUA` (13). **Valida la decisión de A de no ponerle CHECK a `categoria` y publicar el dominio en `geo_calle_categorias`:** con un CHECK, el seed habría muerto en la primera «301050» y alguien habría «arreglado» el dato del Estado a mano. El dominio se descubre, se publica y se puede mirar; no se decreta.

- [ ] **Step 3: La escritura, en dos sentencias porque `COPY` no acepta `ON CONFLICT`**

Por provincia: `TRUNCATE geo_calles_stage`, `COPY` adentro de una staging **`UNLOGGED`**, y después

```sql
INSERT INTO geo_calles SELECT * FROM geo_calles_stage
ON CONFLICT (georef_id) DO UPDATE SET ... WHERE (algo cambió);
```

**La cláusula `WHERE` en el `DO UPDATE` es lo que hace que una re-corrida sin cambios escriba cero filas** — sin tuplas muertas, sin WAL, sin bloat. Sin ella, cada re-corrida duplica el WAL y con él el almacenamiento.

Cuatro cosas protegen el pico, las cuatro obligatorias: staging `UNLOGGED`; **los tres btree compuestos se construyen después de la carga** (el único índice vivo durante el seed es el UNIQUE de `georef_id`, que el `ON CONFLICT` necesita); el GIN va en otra corrida (Task 7); y el re-seed sin cambios escribe cero filas.

**La identidad de una calle es su `georef_id` más su localidad.** Si georef recodifica y un `georef_id` que existía pasa a nombrar una calle de OTRA localidad, el `DO UPDATE` **no corre**: se trata como retiro + alta. La fila vieja recibe `vigente_hasta = now()` y conserva su `id` y sus señales; entra una fila nueva. Sin esta regla, `calle_id` de N señales pasaría a apuntar a otra calle en silencio, y eso no se reconstruye dos años después.

**Las desapariciones no borran.** Que el Estado deje de listar un paraje no lo hace desaparecer del barrio, y puede haber señales apuntando.

- [ ] **Step 4: La reanudación**

Al arrancar, lee `offset_siguiente` de cada partición `en_curso` y sigue desde ahí: un corte a la mitad cuesta una página, no una corrida. **«Completa» es todas las particiones en `completa` Y `filas_escritas = total_declarado`** — contra el conteo de la propia fuente, no contra una expectativa nuestra. El `hash_fuente` por partición hace que una partición sin cambios se saltee entera sin tocar la base, y que la corrida reporte el diff: altas, modificaciones, recodificaciones y desapariciones.

La corrida nueva se marca `vigente` al final, en la misma transacción que cierra la última partición: hasta que termine, el catálogo que sirven los endpoints es el anterior. El unique parcial `ON geo_catalogo_version (vigente) WHERE vigente` garantiza que no haya dos.

- [ ] **Step 5: Correr contra rama efímera**

```bash
cd v2 && DATABASE_URL_UNPOOLED="$NEON_BRANCH_URL" pnpm --filter @v2/db db:seed-callejero
```

- [ ] **Step 6: LA verificación — los conteos por nivel y por provincia contra la fuente**

```bash
cd v2 && pnpm --filter @v2/db exec tsx scripts/verificar-callejero.ts
```

Ese script corre, imprime y compara, y **falla con exit 1 si algo no da**:

```sql
-- Los cinco niveles, contra los totales verificados de la API.
SELECT level, count(*) FROM geographic_locations GROUP BY level;
-- MEDIDOS 2026-08-11, no estimados:
-- province 24 · department 529 · municipality 2082 · locality 4027 · settlement 11324
-- Total 17.986. `settlement` NO da los 14.673 que declara la fuente: 3.349 son el
-- mismo lugar que una localidad censal y el seed los saltea (Task 1, Step 3).
-- `locality` son 4.027 y no 4.037: el 4.037 era un número de spec, no de la API.
SELECT count(*) FROM geo_calles;                      -- 326832 ± el diff de la corrida

-- La reparación de la Task 1: las tres tienen que dar 0.
SELECT count(*) FROM geographic_locations WHERE province_id IS NULL;
SELECT count(*) FROM geographic_locations g
  LEFT JOIN geographic_locations p ON p.id = g.province_id WHERE p.id IS NULL;
SELECT count(*) FROM geographic_locations WHERE level='province' AND province_id <> id;

-- Ningún municipio cuelga de un departamento (§2.2). 0.
SELECT count(*) FROM geographic_locations m JOIN geographic_locations p ON p.id = m.parent_id
  WHERE m.level='municipality' AND p.level <> 'province';

-- Ninguna calle huérfana, y el cero de georef no entró. Las dos, 0.
SELECT count(*) FROM geo_calles c
  LEFT JOIN geographic_locations l ON l.id = c.localidad_id WHERE l.id IS NULL;
SELECT count(*) FROM geo_calles WHERE altura_desde = 0 OR altura_hasta = 0;

-- LA cobertura, que se publica y no se esconde: cuánto del país puede confirmar
-- una altura. Córdoba tiene que salir arriba de todo; si no sale, la traducción
-- del 0 falló y hay que volver al Step 2.
SELECT p.name,
       count(*) FILTER (WHERE c.altura_desde IS NOT NULL OR c.altura_hasta IS NOT NULL) AS con_rango,
       count(*) FILTER (WHERE c.altura_desde IS NULL AND c.altura_hasta IS NULL)        AS sin_rango
FROM geo_calles c JOIN geographic_locations p ON p.id = c.provincia_id
GROUP BY p.name ORDER BY sin_rango DESC;

-- El progreso, filtrado por la corrida vigente. Cero filas.
SELECT * FROM geo_seed_progreso WHERE corrida = $vigente
  AND (estado <> 'completa' OR filas_escritas <> total_declarado);

-- El presupuesto. `pg_total_relation_size` incluye heap MÁS índices.
-- MEDIDOS 2026-08-11 con el corpus completo y VACUUM ANALYZE corrido:
SELECT pg_size_pretty(pg_total_relation_size('geo_calles'));   -- 89,87 MB (37,6 datos + 52,2 índices)
SELECT pg_size_pretty(pg_database_size(current_database()));   -- 153,58 MB con el GIN y sin señales
```

**El umbral que dispara un rediseño: si `pg_total_relation_size('geo_calles')` pasa de 200 MB con el GIN puesto.** Medido dio **89,87 MB, o sea el 45% del umbral**: no hay rediseño que hacer y la palanca de normalizar los nombres a una tabla `geo_calle_nombres` queda guardada sin usar. **El umbral se conserva igual**, porque el que corre este script dentro de dos años, después de una re-siembra, necesita saber contra qué comparar; un umbral que se borra porque esta vez dio bien es un umbral que la próxima vez no está.

**Y una sorpresa que hay que dejar escrita: el índice más caro del callejero no es el GIN.** El GIN de trigramas mide **9,1 MB** —el plan y D-035 lo presupuestaban en el 22% del budget, ~72 MB— porque **120.115 calles se llaman «CALLE SN»** y los trigramas deduplican. El más caro es `geo_calles_georef_unique`, con **17,4 MB**, que es justo el que no se puede sacar: es el que sostiene el `ON CONFLICT` del Step 3 y la identidad de una calle.

**LA COBERTURA MEDIDA, que cambia lo que el producto puede prometer:** de las 326.832 calles, **120.115 (36,8%) son `sin_nombre`** y sólo **79.441 (24,3%) tienen algún rango de altura**. Sobre datos sintéticos con esa distribución, de 4.064 señales con altura sólo **752 quedaron `altura_en_rango`**; 3.067 fueron `altura_sin_rango` y 245 `altura_fuera_de_rango`. **`altura_en_rango` es la rama minoritaria de la unión discriminada, no el caso normal** — un booleano `tiene_rango` habría dicho «no» tres de cada cuatro veces y nadie habría sabido si era «no hay rango» o «está fuera». Es el mejor argumento a favor del diseño de la Task 2, y hay que decirlo en la etiqueta de pantalla: la frase que ve la mayoría de la gente es la de `altura_sin_rango`.

- [ ] **Step 7: La auditoría contra la fuente, a mano y nunca en CI**

24 llamadas a `GET /calles?provincia=<id>&max=1` leyendo `total`, comparadas contra `SELECT provincia_id, count(*) FROM geo_calles GROUP BY provincia_id`. **Se corre a mano después de cada siembra, nunca en CI:** un test que dependa de una API de terceros convierte una caída de georef en un build roto, y esta plataforma tiene el argumento de la soberanía del dato justamente para no depender de eso.

- [ ] **Step 8: Re-sembrar sin cambios escribe cero filas**

```bash
cd v2 && pnpm --filter @v2/db test:integration -- seed-callejero-idempotencia
```

Compara `n_tup_upd + n_tup_ins` de `pg_stat_user_tables` antes y después de una segunda corrida. Si escribe, el `WHERE` del `DO UPDATE` está mal y el argumento de almacenamiento del Step 3 se cayó. El mismo test cubre la recodificación: un `georef_id` que vuelve con otra localidad deja la fila vieja con `vigente_hasta` y su `id` intacto, y crea una nueva; **ninguna señal cambia de calle**.

- [ ] **Step 9: Correr contra la base real y commitear**

```bash
cd v2 && pnpm --filter @v2/db db:seed-callejero && pnpm --filter @v2/db exec tsx scripts/verificar-callejero.ts
git add v2/packages/db/scripts v2/packages/db/package.json v2/packages/db/tests
git commit -m "feat(db): las 326.832 calles del país entran de a una provincia y se pueden volver a entrar"
```

---

### Task 6: `georef_id NOT NULL` y el cierre de la jerarquía

**Files:**
- Modify: `packages/db/src/schema/geographic.ts` — HECHO 2026-08-12: `georefId: text('georef_id').notNull()`
- Create: ~~`packages/db/migrations/0013b_georef_not_null.sql` (o append al 0013 si todavía no se aplicó)~~ → **`packages/db/migrations/0015_georef_not_null.sql`**, ESCRITA Y NO APLICADA 2026-08-12, con su entrada en `meta/_journal.json` (idx 15) y su `meta/0015_snapshot.json`. Appendear al `0013` dejó de ser una opción cuando el `0013` se aplicó (`91ef699`), y `0013b` no es un nombre que `drizzle-kit generate` sepa producir.

**Reversibilidad:** IRREVERSIBLE (constraint sobre datos vivos), trivial de revertir con `ALTER COLUMN georef_id DROP NOT NULL` — instantáneo y sin reescritura.

- [x] **Step 1:** Con el seed completo, `georef_id` ya está lleno en las 17.986 filas. Recién ahora `ALTER TABLE geographic_locations ALTER COLUMN georef_id SET NOT NULL` se puede aplicar. Un `NOT NULL` sobre filas que no lo cumplen no se puede aplicar, y por eso esto no estaba en la Task 1.

**EN QUÉ MOMENTO EXACTO DE LA SECUENCIA VA — corregido 2026-08-12, y la respuesta es «no es esta migración la que pide un orden».** Con las 24 filas ya rellenadas, el `SET NOT NULL` valida HOY, antes del seed: el orden no lo impone la Task 6 sino la Task 7, que quiere ir después del seed del callejero para no sumarle su WAL. Y como el migrador de drizzle (`drizzle-orm/node-postgres/migrator`) aplica **todas las pendientes dentro de UNA transacción**, la `0014` y la `0015` entran juntas en un solo `pnpm db:migrate` y no hay manera de aplicar una sin la otra. O sea: **la secuencia es seed → migrate**, y en esa secuencia el NOT NULL valida contra las 17.986 filas que el seed ya escribió con su `georef_id` (que es su clave de deduplicación, así que la restricción no le pide nada nuevo).

El orden inverso —migrate → seed, que es el único posible en una base nueva, CI o un dev recién clonado— **también es válido, y para esta restricción es estrictamente mejor**: aplicada antes del seed, «a la Task 5 se le escapó una fila sin `georef_id`» deja de ser un hueco silencioso y pasa a ser un INSERT que falla. Lo que ese orden cuesta lo paga la `0014` (índice construido vacío y mantenido fila por fila durante el seed), no ésta.

**Las 24 filas viejas ya no son el obstáculo — la cuenta está hecha (2026-08-11).** Hoy `geographic_locations` tiene **24 filas y ninguna otra**: las 24 provincias, `level = 'province'`, ids 1 a 24, y cero filas de cualquier otro nivel (leído de la base viva). El Step 7 de la Task 1 les escribe `georef_id` a las 24, así que el `SET NOT NULL` de acá arranca desde **0 filas incumplidoras de las 24 preexistentes** y sólo tiene que esperar a las 17.962 que agrega el seed. Ensayado sobre una copia local con la `0013` aplicada y el relleno corrido: el `ALTER TABLE` pasa y `is_nullable` queda en `NO`.

Sin el Step 7, en cambio, este `ALTER` falla con `column "georef_id" contains null values` en 24 filas — o sea que la Task 6 es el segundo lugar donde se nota que faltó el relleno; el primero, y silencioso, es el coroplético vacío.

- [ ] **Step 2:** Verificar y commitear. **`db:migrate` aplica también la `0014`** — son las dos únicas pendientes y viajan en la misma transacción, así que este comando es el de la Task 7 al mismo tiempo. Correrlo con el callejero ya sembrado.

```bash
cd v2 && pnpm --filter @v2/db db:migrate && pnpm --filter @v2/db test:integration
git commit -am "feat(db): el id del Estado deja de poder faltar"
```

**Qué mirar después de aplicar, porque `migrations applied` no dice nada de esto:**

```sql
-- Las dos afirmaciones de esta tarea, una consulta cada una.
SELECT is_nullable FROM information_schema.columns
 WHERE table_name = 'geographic_locations' AND column_name = 'georef_id';  -- NO
SELECT count(*) FROM geographic_locations;                                  -- 17.986
```

---

### Task 7: La migración 0014 — `pg_trgm` y el GIN, en corrida aparte

**Files:**
- Create: `packages/db/migrations/0014_trigram_calles.sql` + entrada en el journal — **ESCRITA Y NO APLICADA 2026-08-12**, journal idx 14 y `meta/0014_snapshot.json` (copia del `0013`, que es lo que `--custom` produce).

**Reversibilidad:** REVERSIBLE **a medias, y la mitad importa.** `DROP INDEX geo_calles_nombre_trgm` se hace sin migración inversa y el producto sigue funcionando peor pero funcionando. **`DROP EXTENSION pg_trgm` no**: `similarity()` sale de ahí y el scope de provincia deja de responder — no más lento, con error. Lo reversible es el índice, no la migración.

- [x] **Step 1: Generar con `--custom` para que obtenga entrada en el journal**

```bash
cd v2 && pnpm --filter @v2/db exec drizzle-kit generate --custom --name trigram_calles
```

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX geo_calles_nombre_trgm ON geo_calles USING gin (nombre_norm gin_trgm_ops);
```

**Va separado por dos razones, y la tercera se cayó al medir:** sirve sólo al caso frío (buscar por provincia con un tipeo, no un prefijo), y **si se construye en la misma corrida que el seed, su WAL se suma al del seed**. La que se cayó es la de los bytes: el plan lo presupuestaba en el 22% del budget del callejero y **midió 9,1 MB**.

**El tamaño, reconciliado (2026-08-12).** La medición del 11/8 dice **9,1 MB** con `pg_relation_size` sobre las 326.832 calles reales; el traspaso de esta tarea circuló **8,9 MB**. Son 0,2 MB sobre la misma corrida, ninguna decisión depende de cuál sea, y lo que las dos descartan es el **~72 MB** que D-035 presupuestaba (la spec A §3.5 lo presupuestaba en 45 y lo estimaba en 27,7). El número que se cita de acá en adelante es **9,1 MB**, que es el que tiene la corrida al lado.

**«CORRIDA APARTE» NO LA HACEN LOS ARCHIVOS — corrección 2026-08-12.** `drizzle-orm/node-postgres/migrator` aplica **todas las migraciones pendientes dentro de UNA transacción**. La `0014` y la `0015` entran juntas en un solo `pnpm db:migrate` y no existe la opción de aplicar una sola. Lo que tiene que quedar aparte no es esta migración de su vecina —eso no cuesta nada— sino **esta construcción del seed**, y eso es una cuestión de ORDEN y no de numeración:

- **`seed → migrate`** es el orden para el que está escrita: el GIN se construye de una sobre la tabla llena, en su propia transacción, y su WAL no se suma al de las 326.832 inserciones.
- **`migrate → seed`** es correcto también, pero el índice nace vacío y lo mantiene el seed fila por fila: vuelve el pico que la partición evita. En una base nueva —CI, un dev recién clonado— es el único orden posible, y está bien: no hay nada que indexar todavía.

**Y no hay guarda automática que lo avise, ni la va a haber en el `.sql`:** un `RAISE WARNING` desde una migración no se ve, porque `scripts/migrate.ts` usa `pg.Pool` sin escuchar el evento `notice` de node-postgres y el aviso se descarta en silencio. Una guarda que no se ve es peor que ninguna; el lugar donde esto se chequea es `verificar-callejero.ts` (Step 2), que corre después y sí imprime.

**QUÉ ACELERA EL GIN Y QUÉ NO — corrección 2026-08-12, y desmiente dos frases de la spec A.**

1. **El GIN acelera `nombre_norm LIKE '%…%'`, no `similarity()`.** `gin_trgm_ops` indexa el operador `%` (que consulta `pg_trgm.similarity_threshold`) y los `LIKE`/`ILIKE` con trigramas extraíbles. `similarity(a, b) > umbral` **escrito como llamada a función no es indexable**, y `repositories/geo-calles.ts` ni siquiera lo usa en el `WHERE`: usa `similarity()` sólo en el `ORDER BY` del scope de provincia. **Un `ORDER BY similarity(...) DESC` no lo sirve ningún GIN** —ordenar por operador de distancia es de GiST (`<->`)—, así que en ese scope el `LIMIT` **no corta temprano**: el motor filtra la rebanada entera, calcula la similitud fila por fila y ordena todo. La tabla de A §4.2 dice «`provincia` · operador: `similarity()` con umbral · índice: GIN» y la línea 374 de este plan decía «`provincia` con 3 por `similarity()` sobre el GIN»: **el operador del scope de provincia es el mismo `LIKE '%…%'` que el de los otros dos**; lo que cambia es que ahí el territorio no acota nada y por eso hace falta el GIN.
2. **«No hay seq scan» no es «el índice entrega la rebanada sin tocar el heap».** A §3.2 escribió «el filtro corre sobre las entradas del índice, sin tocar el heap hasta el LIMIT» y §4.2 lo repite: **es falso en Postgres.** Un Index Scan aplica como `Index Cond` sólo los quals que el índice sabe resolver y todo lo demás como `Filter` **sobre la tupla del heap ya traída**; `LIKE '%…%'` no tiene prefijo, así que nunca es `Index Cond` — por el btree es `Filter` después del fetch, por el GIN es `Recheck Cond` de un Bitmap Heap Scan, que también es después. Un Index Only Scan tampoco está disponible: la consulta selecciona `nombre`, `categoria` y cuatro nombres de lugar por join. Lo cierto es lo que el test afirma —no hay `Seq Scan on geo_calles`—: el índice ahorra recorrer las otras ~318.000 filas, no el acceso al heap de la rebanada que devuelve.
3. **Ningún test de hoy prueba que este índice se use.** Con `provincia_id = $1` disponible, el planificador tiene dos candidatos: el btree `(provincia_id, nombre_norm)` con el `LIKE` como `Filter`, o un BitmapAnd de este GIN con ese btree. **Los dos pasan el `not.toContain('Seq Scan on geo_calles')`** de `tests/geo-calles.test.ts`, así que esa suite en verde no distingue «el GIN se usa» de «el GIN son 9 MB muertos». Lo que sí es seguro es que la **extensión** es obligatoria: sin `pg_trgm` el scope de provincia falla con «function similarity(text, text) does not exist». Qué haría falta para cerrarlo: un test que afirme `Bitmap Index Scan on geo_calles_nombre_trgm` en el `EXPLAIN` del scope de provincia, contra el callejero sembrado.

**Los picos también estaban sobreestimados, y por mucho.** El plan calculaba pico del seed ≈ 337 MB y pico del GIN ≈ 290 MB, «juntos ~471, con el margen en 41». **Medido con el corpus completo: el máximo de toda la corrida fue 162,23 MB** —calles 85,88 · los tres btree 106,70 · el GIN 115,88 · las señales 162,23—. **La partición se conserva igual**: cuesta una migración de tres líneas y protege contra un pico cuyo tamaño real recién se sabe después de correr, que es cuando ya no se puede decidir.

**Una advertencia sobre esa medición, para que nadie la lea como más firme de lo que es:** el GIN se construyó en 2,2 segundos y el muestreador toma una lectura cada 2 segundos, o sea **dos muestras**. Los 9,1 MB del artefacto final son sólidos y descartan un pico *permanente*; **un pico transitorio de memoria o de WAL durante el build no lo habría visto ningún muestreo a esa cadencia.**

- [ ] **Step 2: Verificar el tamaño medido**

```bash
cd v2 && pnpm --filter @v2/db exec tsx scripts/verificar-callejero.ts --con-gin
# MEDIDOS 2026-08-11 con las 326.832 calles reales:
# SELECT pg_size_pretty(pg_relation_size('geo_calles_nombre_trgm'));  -- 9,1 MB (~45 presupuestados)
# SELECT pg_size_pretty(pg_database_size(current_database()));        -- 153,58 MB (~201 presupuestados)
```

- [ ] **Step 3: Commit**

```bash
git add v2/packages/db/migrations
git commit -m "feat(db): el índice trigram entra en su propia corrida, para no sumar su WAL al del seed"
```

---

# REBANADA 3 · La señal

Cambia la tabla objetivo de todo lo demás: cualquier línea que las rebanadas 5 y 6 escriban antes se reescribe. **Las cuatro tablas de señal están en cero**, así que la tabla única no tiene migración de datos, el vocabulario en FK compuesta no tiene backfill, y los nueve CHECK de dirección no tienen filas que los violen. En tres meses, cada una de esas tres cosas cuesta una migración de datos con ventana de indisponibilidad.

---

### Task 8: El vocabulario en civic-core, con las guardas que no compilan

**Files:**
- Create: `packages/civic-core/src/senal/vocabulario.ts`
- Create: `packages/civic-core/src/senal/senal.ts`
- Create: `packages/civic-core/src/senal/transiciones.ts`
- Create: `packages/civic-core/src/senal/__guardas__/imposibles.ts`
- Modify: `packages/civic-core/src/simulacion/tipos.ts`
- Modify: `packages/civic-core/src/index.ts`
- Test: `packages/civic-core/src/__tests__/senal.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `TipoSenal`, `ClaseSenal`, `TIPOS_SENAL`, `CLASE_POR_TIPO`, `claseDe`, `esVerificable`, `EstadoSenal` y sus cuatro sub-uniones, `Senal` y sus cuatro variantes, `corroborar`, `cerrar`, `responder`, `vencer`, `retirar`, `transicionesLegales`, `leerSenal`.

**Resolución de contradicción (cuántos estados tiene una señal):** gana B en el vocabulario —`retirada` y `no_cumplida` **entran**— y gana C en que `meta` no queda clavada en `enviada`. `retirada` no es opcional: la regla 9 pide consentimiento revocable, publicar es LA acción sensible, y el «retiro» de C es del ACTOR y deja el texto publicado para siempre. `no_cumplida` entra porque si comparte `resuelta` con `cumplido`, la consulta obvia de la métrica norte suma los dos. Y `meta → resuelta` entra porque `responder(pregunta, hecho)` no tiene destino sin ese estado.

**Resolución de contradicción (un `compromiso` no puede llegar nunca a `cumplido`):** gana C. `estados_senal` le da a la clase `acto` los estados `por_verificar` y `corroborada`. Con el catálogo de B tal como estaba, ningún compromiso alcanzaba jamás un estado confirmable, la sentencia de C nunca insertaba, `desenlace` nunca salía de `'abierto'`, y `acto_coherente` pinchaba a todo compromiso en `enviada`/`abierto` para siempre. Fallaba en silencio: no había error, simplemente no pasaba nada nunca.

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: El vocabulario**

```ts
export type TipoHecho = 'basta' | 'necesidad' | 'práctica' | 'recurso' | 'saber';
export type TipoDeseo = 'sueño' | 'propuesta';
export type TipoActo  = 'compromiso';
export type TipoMeta  = 'pregunta';
export type TipoSenal = TipoHecho | TipoDeseo | TipoActo | TipoMeta;
export type ClaseSenal = 'hecho' | 'deseo' | 'acto' | 'meta';

export const TIPOS_SENAL = [
  'basta', 'necesidad', 'práctica', 'recurso', 'saber',
  'sueño', 'propuesta', 'compromiso', 'pregunta',
] as const satisfies readonly TipoSenal[];

/** Exhaustivo: agregar un tipo rompe la compilación hasta que alguien lo clasifique. */
export const CLASE_POR_TIPO: Record<TipoSenal, ClaseSenal> = { /* … */ };
export const esVerificable = (tipo: TipoSenal): boolean => claseDe(tipo) === 'hecho';
```

`adhesión` **no está en la lista y no es un tipo de señal**: no tiene texto ni punto propio, es una arista entre una persona y una señal ajena, y por eso tiene tabla propia. Un tipo de señal que no puede existir sin otra señal no es un tipo de señal.

**Las claves son español, con ñ y con tilde**, y eso trae un bug real y silencioso: `'sueño'` en NFC (`U+00F1`) y en NFD (`n` + `U+0303`) son dos strings distintos y JavaScript no los iguala. Un teclado de macOS puede emitir NFD. **El orden importa y es fácil escribirlo al revés:** `z.enum(...).transform(...)` normaliza *después* de validar, o sea nunca. La forma correcta, y la que va en `packages/shared`:

```ts
const tipoSenal = z.string().transform((s) => s.normalize('NFC')).pipe(z.enum(TIPOS_SENAL));
```

- [ ] **Step 2: Los estados y las operaciones que aceptan una sola variante**

```ts
export type EstadoHecho = 'enviada'|'por_verificar'|'corroborada'|'resuelta'|'desactualizada'|'retirada';
export type EstadoActo  = 'enviada'|'por_verificar'|'corroborada'|'resuelta'|'no_cumplida'|'desactualizada'|'retirada';
export type EstadoDeseo = 'enviada'|'desactualizada'|'retirada';
export type EstadoMeta  = 'enviada'|'resuelta'|'desactualizada'|'retirada';
/** `'borrador'` existe en el tipo y NO en la columna: vive en el dispositivo. */
export type EstadoSenal = 'borrador' | EstadoHecho | EstadoActo | EstadoDeseo | EstadoMeta;

export const corroborar = (s: SenalHecho | SenalActo, /* … */): ResultadoTransicion => /* … */;
export const cerrar     = (s: SenalActo, d: Desenlace, /* … */): ResultadoTransicion => /* … */;
export const responder  = (p: SenalMeta, r: SenalHecho, /* … */): ResultadoTransicion => /* … */;
```

`corroborar(unSueño)` no compila. `responder(pregunta, unSueño)` no compila. `cerrar(unaPráctica, 'cumplido')` no compila.

- [ ] **Step 3: Las guardas van en un archivo que NO es un test**

`packages/config/typescript/base.json` excluye `**/*.test.ts`, así que **ningún archivo de test se type-checkea nunca** y vitest sin `--typecheck` transpila y tira los tipos: un `@ts-expect-error` adentro de un test es texto muerto — no falla si el error aparece ni si deja de aparecer. Por eso las guardas de tipo van en `src/senal/__guardas__/imposibles.ts`, que sí entra en `include`, con `export {}` al final. Si alguien relaja `corroborar` a `(s: Senal)`, el `@ts-expect-error` se queda sin error que suprimir y **la compilación falla**.

- [ ] **Step 4: `leerSenal` no inventa un tipo**

```ts
export type Lectura =
  | { ok: true;  senal: Senal }
  | { ok: false; motivo: 'tipoDesconocido'; tipoCrudo: string }
  | { ok: false; motivo: 'estadoImposible'; tipo: TipoSenal; estadoCrudo: string };
```

Sin `??`, sin `default:`, sin valor de reserva. Es la versión honesta de `?? 'valor'`.

- [ ] **Step 5: Verificar que el `@ts-expect-error` muerde de verdad**

```bash
cd v2/packages/civic-core && pnpm test && pnpm type-check && pnpm lint
# Y la prueba de que la guarda vive:
sed -i.bak 's|// @ts-expect-error||' src/senal/__guardas__/imposibles.ts
pnpm type-check   # Expected: FAIL
mv src/senal/__guardas__/imposibles.ts.bak src/senal/__guardas__/imposibles.ts
pnpm type-check   # Expected: PASS
```

- [ ] **Step 6: Commit**

```bash
git add v2/packages/civic-core/src/senal v2/packages/civic-core/src/simulacion/tipos.ts v2/packages/civic-core/src/index.ts v2/packages/civic-core/src/__tests__/senal.test.ts
git commit -m "feat(civic-core): la clase de una señal decide qué se le puede hacer, y el compilador lo hace cumplir"
```

---

### Task 9: `ConteoCelda` gana el residuo sin que `Brillo` gane una variante

**Files:**
- Modify: `packages/civic-core/src/brillo.ts`
- Modify: `packages/civic-core/src/coeficientes-luz.ts`
- Test: `packages/civic-core/src/__tests__/brillo-guardas.test.ts`
- Test: `packages/civic-core/src/__tests__/_conteo.ts`

**Resolución de contradicción (`ConteoCelda` y `Brillo`), partida en dos porque las dos mitades tienen razón:**

1. **Gana B en que el número tiene que viajar.** `ConteoCelda` gana `senalesSinActor`. `brilloDeCelda` sólo lee `vocesDistintas` y `habitantes`: sin el campo, una celda con cincuenta señales sin actor da `participacion: 0` e `intensidad: 0`, que el comentario de esa misma función define como «nadie habló» — el pecado que el módulo existe para prohibir, y encima sesgado justo contra las celdas que cubrió la app de campo. C lo necesita y lo niega: su propia tabla `celda_luz` tiene la columna `senales_sin_actor`.
2. **Ganan C y D en la ubicación: la variante NO entra a `Brillo`.** La supresión corre **antes** de `luzDeCeldas` —las tres specs coinciden—, así que `brilloDeCelda` nunca se invoca sobre una celda con `vocesDistintas===0 && senalesSinActor>0`. Meter la variante adentro rompe una unión que dos apps importan sin comprar nada, que es la advertencia literal de D-028.
3. **Nombres: los cuatro estados de C, con `silencio` y no `muda`.** `muda` de D pierde porque D tiene tres estados y le falta el que distingue «no sé quién» de «nadie».
4. **`VOCES_MINIMAS_POR_CELDA` no se crea.** El 5 se declara **una** vez, en `coeficientes-corroboracion.ts` (Task 20), como `UMBRAL_SUPRESION`. Dos constantes con el mismo valor en dos archivos para la misma decisión es cómo empieza toda deriva: dentro de seis meses alguien sube una y el mapa suprime distinto según qué superficie pregunte.

**Reversibilidad:** REVERSIBLE, pero **es un cambio rompedor sobre una interfaz que ya importan dos apps** y se toma ahora, entero, con las tablas en cero.

- [ ] **Step 1: La guarda primero**

En `brillo-guardas.test.ts`, agregar: «una celda de puras señales sin actor no se dibuja como una celda callada» — pero afirmando lo que corresponde después de la resolución: `brilloDeCelda({ vocesDistintas: 0, senalesSinActor: 12, habitantes: 1000 })` sigue devolviendo `{ tipo: 'valor', participacion: 0 }` **y el campo viaja intacto en `LuzCelda.senalesSinActor`**, para que el endpoint de la Task 25 pueda rutearla a `sin_actor_conocido` antes de llamar a `luzDeCeldas`.

- [ ] **Step 2: El campo, y sólo el campo**

`ConteoCelda` gana `senalesSinActor: number`; `LuzCelda` lo propaga. `Brillo` **no cambia**. `intensidadDeBrillo` **no cambia**. El comentario de `verificables` deja de decir «necesidad, ¡basta!, recurso» —la lista del mundo de seis tipos— y pasa a decir «señales de clase `hecho` o `acto` en `por_verificar`, `corroborada`, `resuelta` o `desactualizada`», y el de `confirmaciones` deja de ser ambiguo: **señales, no eventos** (Task 25 lo fija en el agregado).

Actualizar `__tests__/_conteo.ts`, la fábrica compartida, con el campo nuevo en `0`.

- [ ] **Step 3: Verificar que las dos apps siguen compilando**

```bash
cd v2/packages/civic-core && pnpm test && pnpm type-check
cd v2/apps/web && pnpm type-check && pnpm test:unit
cd v2/apps/mobile && pnpm check && pnpm test
```

- [ ] **Step 4: Commit**

```bash
git add v2/packages/civic-core/src/brillo.ts v2/packages/civic-core/src/coeficientes-luz.ts v2/packages/civic-core/src/__tests__
git commit -m "feat(civic-core): no saber quién habló deja de contarse como que nadie habló"
```

---

### Task 10: El texto de consentimiento y de cesión, en un solo lugar

**Files:**
- Create: `packages/shared/src/open-data/consentimiento.ts`
- Modify: `packages/shared/src/index.ts`
- Test: `packages/shared/src/open-data/__tests__/consentimiento.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `TEXTO_CONSENTIMIENTO_ACTOR`, `TEXTO_CESION_LICENCIA`, `TEXTO_PUBLICACION_IRREVOCABLE`, `DECLARACION_DELIBERACION`, `LICENCIAS`.

**Hueco bloqueante que cierra: la cesión de licencia del texto no la escribe nadie.** D §2.8 decide que el proyecto es custodio y no titular, que `texto` sólo sale bajo CC BY para las filas con cesión explícita, y §8.7 punto 10 dice «sin esa pantalla, D no publica». D le asignó la cesión a C; C no menciona licencias en ninguna sección; B, que escribe el contrato de ingesta y rehace `PanelSoltarVoz`, no tiene campo de cesión ni columna que la marque. **Resultado si nadie la escribe: el entregable central de D —el registro público bajable— sale sin la columna que le da sentido, indefinidamente.** La cesión es una columna de `senales` (Task 11) y una casilla en el contrato de ingesta (Task 13); el texto vive acá.

**Hueco serio que cierra de paso: tres textos de consentimiento para actos superpuestos.** B §2.9 escribe la línea del actor, C §2.2 escribe otra distinta para el mismo acto, y D §7.3.4 escribe una tercera sobre publicación e irrevocabilidad — y la exporta como constante compartida diciendo, con razón, «si los dos textos pueden divergir, van a divergir». Tres pantallas antes del mismo submit es la manera de que ninguna se lea. Se unifican acá, y B, C y D las importan.

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: Los tres textos del consentimiento, en rioplatense y sin párrafo legal**

```ts
/** Va pegada a los DOS botones que crean un actor —el de enviar una señal y el
 *  «Yo también»— y a la cola del outbox del móvil. Una sola redacción: la del
 *  actor es la misma acción en las tres superficies. */
export const TEXTO_CONSENTIMIENTO_ACTOR =
  'Para contar personas y no clicks, guardamos un identificador al azar en este ' +
  'navegador. No lleva tu nombre, dura un año, y lo podés borrar cuando quieras.';

/** La cesión. Sin la marca en la fila, el volcado publica la fila SIN `texto`. */
export const TEXTO_CESION_LICENCIA =
  'Lo que escribas se publica bajo CC BY 4.0: cualquiera lo puede citar y reusar ' +
  'diciendo de dónde salió. Si no querés, se publica todo lo demás y el texto no.';

/** La irrevocabilidad hacia atrás. Es una decisión a la vista, no un default. */
export const TEXTO_PUBLICACION_IRREVOCABLE =
  'Esto entra a un registro público que se descarga entero en un archivo. Podés ' +
  'retirarlo cuando quieras y desaparece en menos de 24 horas — menos de los ' +
  'archivos mensuales que ya se publicaron, que quien los bajó ya los tiene.';
```

- [ ] **Step 1b: La declaración de deliberación — DECISIÓN DEL DUEÑO DEL PRODUCTO, 2026-08-11**

**La deliberación no se construye y no se disimula: se declara en pantalla.** D-037 deja de ser una decisión pendiente. La regla 11 se cumple entera del lado de corroborar y a la mitad del lado de deliberar, **y el producto lo dice**. Cuatro superficies, un solo texto:

```ts
/** La mitad deliberativa de la regla 11 no tiene mecanismo (D-037) y el producto
 *  lo dice en vez de disimularlo. Va en la superficie de TODA señal de clase
 *  `deseo` —`sueño` y `propuesta`—, en el body de los tres 410 de la Task 16, y
 *  en `PROCEDENCIA.md`. Las tres frases del medio no son relleno: dicen qué NO
 *  es una adhesión, que es lo único que evita que «yo también» se lea como voto. */
export const DECLARACION_DELIBERACION = {
  sueño:
    'Todavía no se puede deliberar. Por ahora un sueño sólo recibe adhesiones ' +
    '—«yo también»—, y eso no es una votación ni un acuerdo: nadie está midiendo ' +
    'quién gana. Lo estamos construyendo.',
  propuesta:
    'Todavía no se puede deliberar. Esta propuesta sólo recibe adhesiones ' +
    '—«yo también»—: nadie está votando, y una adhesión no la aprueba ni la ' +
    'rechaza. Lo estamos construyendo.',
} as const satisfies Record<TipoDeseo, string>;
```

**El `satisfies Record<TipoDeseo, string>` no es adorno:** el día que la clase `deseo` gane un tercer tipo, la constante no compila hasta que alguien escriba su frase, en vez de que ese tipo salga a producción sin aviso. `TipoDeseo` se importa de `@v2/civic-core` (Task 8) — es el único import de este archivo.

**«Lo estamos construyendo» es una promesa y por eso está al final y no al principio:** lo primero que se lee es la limitación, no el consuelo. Si algún día se decide que la deliberación no se construye, esa frase se saca y las dos anteriores siguen siendo verdad.

- [ ] **Step 2: La guarda de la fuente única**

El test afirma que `PROCEDENCIA.md` (Task 33) imprime **estas mismas constantes** y no una copia, y hace grep sobre `apps/web/src` y `apps/mobile/src` buscando fragmentos literales de los cuatro textos: si aparecen escritos a mano, falla nombrando el archivo. **`'Todavía no se puede deliberar'` entra a esa lista de fragmentos**: es el que más tentación da de copiar, porque va en cuatro superficies.

- [ ] **Step 3: Verificar y commitear**

```bash
cd v2 && pnpm --filter @v2/shared test:unit && pnpm --filter @v2/shared type-check
git add v2/packages/shared/src/open-data
git commit -m "feat(shared): un solo texto de consentimiento para el mismo sí"
```

---

### Task 11: La migración 0015 — `senales`, `actores`, `adhesiones`, `respuestas` y los tres catálogos

> **ES LA `0016`, no la `0015` (corrimiento del 2026-08-12).** La `0015` se la llevó `0015_georef_not_null.sql` de la Task 6. Dejá que `drizzle-kit generate` asigne el número; escribir `0015_la_senal.sql` a mano choca con un archivo que ya existe. Todas las apariciones de «la `0015`» de esta tarea para abajo, incluidas las de las Tasks 21 y 29, corren un número.

**Files:**
- Create: `packages/db/src/schema/senales.ts`
- Create: `packages/db/src/schema/_catalogos.ts`
- Modify: `packages/db/src/schema/_geo-columns.ts`
- Modify: `packages/db/src/schema/{index,dreams,pulso,mandato}.ts`
- Modify: `packages/db/drizzle.config.ts`
- Create: `packages/db/migrations/0015_la_senal.sql` + journal
- Test: `packages/db/tests/senales-imposibles.test.ts`

**Interfaces:**
- Consumes: `direccionColumns` de la Task 2, `TIPOS_SENAL` de la Task 8 (**sólo para la guarda de la Task 12, nunca como import del schema**).
- Produces: `tipos_senal`, `estados_senal`, `temas`, `actores`, `senales`, `adhesiones`, `respuestas`, `actores_por_origen`.

**Resolución de contradicción (dónde vive una señal) — LA decisión de la que cuelga todo el plan:** gana **B: una sola tabla `senales`.** C está escrita entera contra `dreams` (cinco FK, `estadoColumns` spread-eado, sus consultas de §8.2) y D construye índices y un predicado de publicabilidad sobre `dreams` + `proposals`. Implementar B y después C da una migración que no corre; implementar B y después D da un registro público sin filtro de publicabilidad, o sea publicando todo. Gana B por tres razones: las tablas están en cero y no va a haber otro momento barato; **la contradicción se resuelve sola por el propio trabajo de D** —los tres predicados de keyset diferenciados, el desempate `capaRank`, el merge en memoria y el `id: "voz:412"` existen ÚNICAMENTE porque hay dos tablas, y con una sola todo eso es `order by creada_en desc, id desc`—; y la precondición dura de C («si B no está, C no entra») era el costo de atornillarle una `clase` a `dreams`, mientras que en `senales` la clase es `NOT NULL` con FK compuesta por construcción y el CHECK decorativo por `NULL or false` no puede existir.

**Resolución de contradicción (la tabla de actor):** fusión, con la estructura de **C** como base: nombre `actores` (plural, como el resto del esquema), `id bigserial` (C), `actor_hash`/`secreto_hash`/`pepper_version`/`primer_evento_en`/`retirado_en` (C), **más `user_id` con unique parcial y la fusión al linkear** (B). **El retiro es el UPDATE de C, no el DELETE de B:** el `on delete set null` sobre `senales.actor_id` y el `cascade` sobre `adhesiones` mueven RETROACTIVAMENTE el brillo de las celdas donde esa persona habló, y sus señales pasan a `senalesSinActor`. La indirección de C es lo que hace que «revocable» sea cierto sin reescribir el pasado. El `id uuid` de B tampoco se defiende: su propio §3.7 cuenta 48 B por las tres uuid de cada fila, y como el `actor_id` nunca cruza el borde, un `bigserial` de 8 B hace lo mismo por menos. Pero C no tiene `user_id`, y sin esa columna la decisión 7 es imposible: `conCuenta` vs `seudonimas`, el `count(distinct user_id) filter (where email_verified)` y el bloqueo del lavado de actores dependen de ella.

**Resolución de contradicción (dos columnas para la misma idempotencia):** gana B. `id_local uuid not null` con `unique (origen, id_local)`. `idempotencia_local` de C no existe, y `estadoColumns` **deja de existir como objeto compartido**: sus columnas útiles (`estado_desde`, `ronda`, `vence_el`, `caduca_el`, `retenida_en`, `retenida_motivo`) van directo en `senales`. El archivo `_geo-columns.ts` existe para que TRES tablas no diverjan, y queda una.

**Resolución de contradicción (`dreams.status`, moderación):** gana B. **No hay columna de moderación.** `dreams.status` tenía default `'approved'`: era moderación que no existía, y las tres specs lo dicen. Bajo `senales` no hay nada que preservar. El predicado de publicabilidad de D se reapunta en la Task 30.

**Resolución de contradicción (si una señal puede existir sin actor):** gana B. El CHECK `dreams_hecho_con_actor_check` de C **se cae**: prohibía que existiera un `¡basta!` sin actor, o sea que un navegador que rechaza cookies no podía cargar nada — el INSERT fallaba. Eso contradice de frente toda la maquinaria de `senalesSinActor` y castiga con silencio a la gente con el navegador más cerrado. Toda comparación de actor se escribe con `IS DISTINCT FROM`, nunca con `<>`, y el rechazo por «sin autor atribuible» es una rama explícita del recibo.

**Reversibilidad:** **IRREVERSIBLE.** Crea nueve tablas y sus catálogos. No borra nada: el `DROP` de las seis viejas es la Task 36.

- [ ] **Step 1: Los tests imposibles (fallan)**

`senales-imposibles.test.ts`, con la redacción de frase-afirmación:

- «el par (sueño, hecho) no existe» y «el par (corroborada, deseo) no existe» — violan las FK compuestas.
- «un compromiso sin fecha, un saber sin fuente y una práctica sin periodicidad no entran» — `acto_tiene_fecha`, `saber_trae_fuente`, `practica_tiene_periodicidad`.
- «una pregunta no se responde con un sueño» **y su gemela** «una necesidad no es una pregunta» — las dos FK compuestas de `respuestas`.
- «un compromiso incumplido no dice resuelta» — `acto_coherente`.
- «una altura con rol `subject` no entra», «un `texto_libre` con rol `subject` no entra», «una dirección con `subject`+`high` no entra», «una altura con punto y `precision='500m'` no entra», «`province_id` con `ubicacion_origen='ninguna'` no entra» — los CHECK de dirección.
- «dos adhesiones de la misma persona son una» — la PK `(senal_id, actor_id)`.

- [ ] **Step 2: Los catálogos, sembrados DENTRO de la migración**

Las 9 + 20 + 11 filas van como INSERT literales en el mismo `.sql`, con `on conflict do nothing`: son menos de 1 KB, y si fueran un script aparte una base nueva —la de CI, un branch efímero, el dev que clona— arrancaría con `senales` inservible y todo insert fallaría con una violación de FK que parece un bug del código y es un setup faltante. **`drizzle-kit generate` NO produce estos INSERT: hay que escribirlos a mano en el `.sql` generado.**

`estados_senal`, **20 filas** y no 18 (la corrección de la Task 8):

| clase | estados permitidos | filas |
|---|---|---:|
| hecho | `enviada` · `por_verificar` · `corroborada` · `resuelta` · `desactualizada` · `retirada` | 6 |
| **acto** | `enviada` · **`por_verificar`** · **`corroborada`** · `resuelta` · `no_cumplida` · `desactualizada` · `retirada` | 7 |
| deseo | `enviada` · `desactualizada` · `retirada` | 3 |
| meta | `enviada` · **`resuelta`** · `desactualizada` · `retirada` | 4 |
| | **total** | **20** |

**Corrección al plan, 2026-08-11 (encontrada escribiendo el DDL y confirmada al medir):** este plan decía «22 filas» y su propia tabla daba 20. **Gana la tabla, no el número escrito**, porque la tabla es lo que gobierna las FK compuestas: es el objeto que dice qué pares `(clase, estado)` existen, y el 22 era una cuenta hecha de memoria sobre una versión anterior de la tabla. Las filas se cuentan al escribir el INSERT, no antes. **La columna de totales entra a la tabla justamente para que el número y las filas no puedan volver a divergir sin que se vea.**

`estados_senal.orden` es `NOT NULL` y ninguna spec da los valores. **Van `1..n` dentro de cada clase, en el orden en que esta tabla los lista** —que es el orden del ciclo de vida, no alfabético—, así que `hecho` va 1–6, `acto` 1–7, `deseo` 1–3 y `meta` 1–4. La guarda de la Task 12 lee `order by clase, orden` y compara contra el código: sin un criterio escrito acá, el primero que reordene una sub-unión de TypeScript pone la guarda roja sin haber roto nada.

`temas.etiqueta` es `NOT NULL` y tampoco estaba especificada. **Es la clave con mayúscula inicial** (`alimento` → «Alimento», `educación` → «Educación»). Es texto de pantalla y se cambia ahí el día que el producto quiera otra cosa; lo que no puede quedar es la columna sin valor y el `INSERT` sin compilar.

`borrador` **no está**, y esa ausencia es la decisión: un borrador vive en el dispositivo y nunca llega al servidor. Si el servidor tuviera el borrador, tendría copia de lo que la persona todavía no decidió publicar — la regla 3 y la regla 12 rotas de un saque.

- [ ] **Step 3: `actores`, con las dos mitades**

```sql
create table actores (
  id             bigserial primary key,
  actor_hash     bytea unique,          -- HMAC(ACTOR_PEPPER, actor_key). NULL = retirado
  secreto_hash   bytea,                 -- HMAC(pepper, deviceSecret). Prueba de posesión
  pepper_version smallint not null default 1,
  user_id        integer references users(id) on delete set null,
  origen         text not null check (origen in ('web','campo')),
  creado_en      timestamptz not null default now(),
  primer_evento_en timestamptz,         -- lo que el detector de ráfagas necesita
  retirado_en    timestamptz,
  constraint actores_retiro_chk check ((retirado_en is null) = (actor_hash is not null))
);
-- Sin esto, una persona puede quedar linkeada a N actores: adherir, borrar la
-- cookie, repetir 20 veces, loguearse y linkear los 20 → veinte filas contadas
-- como «cuentas verificadas». El bucket de mayor calidad sería el más fácil de
-- inflar. Con él, linkear un actor nuevo a una cuenta que ya tiene actor no crea
-- un segundo vínculo: FUSIONA.
create unique index actores_user_unico on actores (user_id) where user_id is not null;
```

Ninguna columna derivada del dispositivo: ni user-agent, ni idioma, ni zona horaria, ni IP. La guarda de la Task 16 falla si alguien agrega una.

**`actores_por_origen` — la tabla que sostiene el techo de D-036 y que ninguna spec tipó.** Aparece nombrada con sus tres campos (`hora`, `bucket`, `creados`) y sin tipos ni clave, y sin clave el contador no se puede upsertear: cada alta insertaría una fila nueva y el `WHERE creados >= 20` no encontraría nunca nada. El techo existiría en prosa y no en la base.

```sql
create table actores_por_origen (
  hora    timestamptz not null,          -- truncada a la hora, no `now()` crudo
  bucket  bytea       not null,          -- HMAC(pepper, prefijo de red). Mismo tipo
                                         -- que los otros hash del esquema: la IP
                                         -- cruda no se guarda en ninguna forma.
  creados integer     not null default 0,
  primary key (hora, bucket)
);
```

**El `bucket` es `bytea` y no `text` a propósito:** es el mismo HMAC con pepper que `actor_hash`, así que rota con `pepper_version` y no hay ninguna fila del esquema desde la que se pueda reconstruir un prefijo de red. Las filas viejas las barre la pasada del cron de la Task 23; sin barrido esta tabla es un registro perpetuo de desde qué redes se habló, que es exactamente lo que la regla 3 prohíbe.

- [ ] **Step 4: `senales`, con `direccionColumns` adentro desde el primer minuto**

Las columnas de la Task 2 se spread-ean acá —no en una migración posterior— con sus nueve CHECK renombrados a `senales_*`. **Sin eso, toda la defensa de A queda escrita sobre tablas muertas:** A declaró sus CHECK sobre `dreams`, `pulse_signals` y `proposals`, que son las tres que esta migración retira de la ingesta, y en `senales` no habría nada que impida guardar una altura con rol `subject`. La regla pasaría a depender de que alguien llame a `ubicacionPublicable`, o sea de la costumbre que A rechaza tres veces.

Columnas propias de esta resolución, además del DDL de B §3.3:

```sql
-- Hueco de A que B nunca nombró. `punto` es exactamente el conjunto de filas
-- cuya provincia sale del polígono malo de D-011: convierte esa deuda de
-- anécdota en consulta exacta.
ubicacion_origen text not null default 'ninguna'
  check (ubicacion_origen in ('catalogo','punto','declarada','ninguna')),
constraint senales_origen_provincia_chk
  check (province_id is null or ubicacion_origen <> 'ninguna'),

-- La respuesta a la pregunta de la casa, PERSISTIDA. Es `sujeto` de
-- `PublishedPrecisionInput` (Task 2) escrito en la fila: sin esta columna,
-- `senales_rechazo_chk` no compila —cita una columna que no existe— y el
-- `overridable = false` para ubicación de terceros vive sólo en memoria del
-- request. Default `true` porque es el default de la Task 2: la mayoría de las
-- señales hablan del lugar donde está quien las carga.
sujeto_propio boolean not null default true,

-- Resolución de la contradicción «¿puede alguien publicar exacto el punto de su
-- propia casa?». Gana D en el piso y B en el mecanismo: el piso de publicación
-- honra ESTA columna y ninguna otra. Se escribe sólo cuando la respuesta a la
-- pregunta de la casa fue «es mía» y la persona declinó explícitamente. Hoy
-- `overridable` es siempre `true` en `location-policy.ts` y nadie persiste el
-- rechazo: un consentimiento que no se puede auditar no es un consentimiento.
engrosado_rechazado boolean not null default false,
constraint senales_rechazo_chk
  check (not engrosado_rechazado or (location_role = 'subject' and sujeto_propio)),

-- La cesión de la Task 10. Sin la marca, el volcado publica la fila sin `texto`.
cesion_licencia boolean not null default false,
cesion_en timestamptz,
constraint senales_cesion_chk check ((cesion_en is null) <> cesion_licencia),

-- Vigencia: los dos relojes de C, no el `vigencia_hasta` único de B (Task 23).
estado_desde timestamptz not null default now(),
ronda integer not null default 1,
vence_el_revision timestamptz,
caduca_el timestamptz,
retenida_en timestamptz,
retenida_motivo text,

-- El origen de los dos relojes, que ninguna de las dos specs declaró acá: B no
-- la nombra en ninguna parte y C la agregaba con un `ALTER TABLE` que sobre
-- esta tabla ya no tiene nada que agregar. Nace acá y la 0016 no la toca.
-- NO se deriva de `creada_en`: hay señales que esperan provincia o evidencia y
-- pueden publicarse horas después. Sin ella, `vence_el_revision` queda sin
-- procedencia auditable y la pasada 5 del cron no tiene dónde escribir.
publicada_en timestamptz,
```

`vence_el` (fecha del compromiso, de B) y `vence_el_revision` (reloj de vigencia, de C) son **dos columnas y no una**: B usaba `vence_el` para «plazo del compromiso» y C para «hora de revisar», sobre la misma fila conceptual, y fusionarlas es cómo se reintroduce el defecto que este plan existe para cerrar. El nombre largo es a propósito.

**Lo que se cae al sacar `vigencia_hasta`, y que ninguna spec dijo que se caía (encontrado escribiendo el DDL, 2026-08-11):** B §3.3 colgaba de esa columna dos CHECK y un índice. Los dos CHECK —`solo_hecho_tiene_vigencia` y `hecho_tiene_vigencia`— **no entran**, y el segundo no es opcional que no entre: con los relojes seteados al publicar y no al crear, `hecho_tiene_vigencia` haría fallar **todo INSERT de un hecho**, porque en el momento del alta la columna todavía es `NULL`. Un CHECK que hace inexpresable el camino normal es peor que ningún CHECK.

El índice `senales_vigencia_idx` de B **no se crea acá**, y su reemplazo son **los tres parciales de C §3.2 con `vence_el` reapuntado a `vence_el_revision`, que entran en la `0016`** (Task 21, Step 1) junto con el cron que los barre. Son los que hacen que las pasadas 1, 2 y 5 de la Task 23 sean una consulta y no un barrido de la tabla entera cada hora:

```sql
-- Van en la 0016, no acá: hasta la rebanada 5 ninguna consulta los usa.
create index senales_vigencia_idx    on senales (vence_el_revision)
  where vence_el_revision is not null and estado in ('corroborada','resuelta');
create index senales_caducidad_idx   on senales (caduca_el)
  where caduca_el is not null and estado = 'por_verificar';
create index senales_publicacion_idx on senales (id) where estado = 'enviada';
```

**Las columnas van en la `0015` y los índices en la `0016`, y la asimetría es a propósito:** una columna que llega tarde exige un `ALTER TABLE` sobre una tabla con filas, y un índice que llega tarde exige un `CREATE INDEX` y nada más. Se paga lo caro temprano y lo barato cuando se usa.

**`senales_feed_idx` NO se crea en la 0015.** B §3.3 lo declara sobre `(creada_en desc)` y la Task 29 lo declara sobre `(creada_en desc, id desc)` con predicado — mismo nombre, dos definiciones, y dos índices no pueden compartir nombre. **Gana la 0017**, que es la que lo usa: el feed no existe hasta la rebanada 6, y un índice sin consulta es bytes en el presupuesto de la Task 19 y nada más. Si alguien concatena los dos bloques tal como las specs los escriben, la 0017 aborta con `relation "senales_feed_idx" already exists`.

**`senales_calle_idx` va UNA sola vez.** A §3.4 lo cierra su bloque de DDL y B §3.3 lo repite en su lista de siete, con el mismo nombre y el mismo predicado, y los dos bloques van a este mismo archivo. **Viene con el bloque de A y no se repite:** los nueve CHECK de dirección coincidieron exactamente entre las dos specs y el índice es lo único que quedó declarado dos veces, así que quien escriba la migración concatenando aborta con `relation "senales_calle_idx" already exists` **en la migración que crea la tabla**, o sea antes de que exista nada que salvar.

`senal_estado_historia` de B **no se crea**: la bitácora es `rastro_senal` (Task 21), que hace todo lo que hacía y además es verificable desde afuera y protegida por privilegios del motor. Si se construyeran las dos, las transiciones que escribiera B no dejarían evento en la cadena de C y la guarda «que la cadena de una señal esté entera» quedaría roja de forma permanente.

- [ ] **Step 5: Las tablas viejas quedan, con comentario de cabecera**

`dreams`, `pulse_signals`, `proposals`, `proposal_votes`, `proposal_status_history` y `mandate_suggestions` **no se borran en esta migración**: borrar es irreversible y no tiene por qué compartir transacción con la que crea la nueva. Cada una gana un comentario que dice que ya no recibe escrituras y apunta a la Task 36. **El texto exacto, porque «un comentario de cabecera» sin texto se escribe distinto seis veces:**

```sql
comment on table dreams is
  'RETIRADA 2026-08-11 (migración 0015). Ya no recibe escrituras: toda señal
   vive en `senales`. Se conserva sólo para poder auditar lo que quedó escrito
   antes del corte. El DROP es la Task 36 del plan
   docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md.';
```

Igual para las otras cinco, cambiando el nombre. **Va la fecha y el número de migración adentro del comentario**: dentro de un año, «ya no recibe escrituras» sin fecha obliga a abrir el historial de git para saber desde cuándo, y el que abre `psql` para entender una tabla rara casi nunca tiene el repo al lado.

- [ ] **Step 6: Generar, editar, aplicar contra rama efímera**

```bash
cd v2 && pnpm --filter @v2/db db:generate
# editar el .sql: los INSERT de catálogo y los nueve CHECK de dirección
cd v2 && DATABASE_URL_UNPOOLED="$NEON_BRANCH_URL" pnpm --filter @v2/db db:migrate
cd v2 && pnpm --filter @v2/db test:integration -- senales-imposibles
```

Expected: PASS — los doce imposibles rechazados por la base, cada uno con su error del motor.

**Ya ensayado el 2026-08-11 (Task 19):** la `0015` escrita a mano —con los tres catálogos adentro y los nueve CHECK de dirección— aplicó limpia sobre el esquema real, y los doce imposibles de este Step 1 mordieron, más los de `geo_calles`, `rastro_cadena_check`, `senal_resolucion_enlace_check`, `confirmaciones_coherencia_check` y los dos de `volcados`. **Lo que falta acá no es el SQL sino que `db:generate` lo produzca y que el journal lo registre**: los archivos de la medición eran SQL plano, sin `--> statement-breakpoint` ni entrada en `_journal.json`, y un `.sql` sin entrada en el journal no se aplica nunca y no avisa.

- [ ] **Step 7: Commit**

```bash
git add v2/packages/db/src/schema v2/packages/db/migrations v2/packages/db/drizzle.config.ts v2/packages/db/tests
git commit -m "feat(db): una sola tabla de señales, con el vocabulario atornillado por clave foránea"
```

---

### Task 12: La guarda del vocabulario — que TypeScript y Postgres no deriven

**Files:**
- Create: `apps/api/tests/vocabulario-guarda.test.ts`

**Interfaces:**
- Consumes: `TIPOS_SENAL`, `claseDe`, las cuatro uniones de estado, las once claves de tema.
- Produces: nada. Es una guarda.

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: Las tres consultas**

```sql
select tipo, clase, orden from tipos_senal order by orden;
select estado, clase from estados_senal order by clase, orden;
select clave from temas order by orden;
```

La primera tiene que dar exactamente `TIPOS_SENAL.map((t, i) => ({ tipo: t, clase: claseDe(t), orden: i + 1 }))`. **Es la única forma de que TypeScript y Postgres no deriven**, porque el schema no puede importar civic-core. Como los catálogos se siembran dentro de la migración, esta guarda no verifica «alguien corrió el seed» sino «la migración y `TIPOS_SENAL` no derivaron», que es lo que importa.

La segunda tiene que dar **20 filas, no 22** —6 de `hecho`, 7 de `acto`, 3 de `deseo`, 4 de `meta`— y su `orden` reinicia en 1 dentro de cada clase (Task 11, Step 2). **El número va afirmado explícitamente y no sólo derivado de las cuatro uniones:**

```ts
expect(filas).toHaveLength(20);   // 6 + 7 + 3 + 4, la tabla de la Task 11 Step 2
```

Sin esa línea, el día que alguien borre un estado de una sub-unión de TypeScript **y** su fila del catálogo, la guarda sigue verde y el vocabulario se achicó sin que nadie lo decidiera. La comparación de conjuntos prueba que los dos lados coinciden; el número prueba contra qué coinciden.

- [ ] **Step 2: Verificar y commitear**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- vocabulario-guarda
git add v2/apps/api/tests/vocabulario-guarda.test.ts
git commit -m "test(api): el vocabulario de la base y el del código son el mismo o el test es rojo"
```

---

### Task 13: `POST /api/v1/civic/senales` — el contrato único, con la secuencia numerada de A adentro

**Files:**
- Create: `apps/api/src/features/senales/{routes,service,validation}.ts`
- Create: `packages/shared/src/validation/senal.ts`
- Modify: `apps/api/src/app.ts`
- Test: `apps/api/tests/senales-ingesta.test.ts`

**Interfaces:**
- Consumes: `resolverUbicacion` (Task 4), `ubicacionPublicable`/`componerDireccion`/**`direccionPermitida(tipo, role, sensitivity)`**/`techoDeTipo`/`TIPOS_CON_TECHO_DE_DIRECCION` (Task 2), `prepareRecordLocation`, `normalizedLocationLabel`, los textos de la Task 10.
- Produces: el endpoint y su recibo.

> **Los tres ejes, no dos.** `direccionPermitida` toma `tipo` primero. No existe una versión de dos ejes exportada —el piso por rol es interno— justamente para que este endpoint no pueda llamar a la que no mira el tipo. El enum de Zod de `senal.ts` se arma con `TIPOS_CON_TECHO_DE_DIRECCION` y **normaliza el `tipo` del cuerpo a NFC antes de validar**: `'práctica'` con la tilde combinante es otro string, lo manda un cliente iOS sin querer, y un 400 sobre una palabra bien escrita es un defecto propio. Si aun así llega un tipo que no está en la tabla, `techoDeTipo` lo dice y el endpoint responde 400 en castellano; nada de eso depende de que alguien se acuerde, porque `ubicacionPublicable` con un tipo desconocido ya devuelve `sin_direccion`.

**Hueco bloqueante que cierra: el orden de cinco pasos de A §4.5 no viajaba al `POST` de B.** A declara obligatorio el orden y explica que invertirlo deja «AV JOSE MARIA MORENO 1450» adentro de `direccion_texto` con `altura IS NULL`, texto que sale por la API y por el volcado. Pero A lo especificó para `capturas.ts` y `open-data/routes.ts`, y B reemplaza a los dos por un endpoint nuevo del que A no sabe nada. **La ingesta primaria del sistema quedaba sin la secuencia que hace inexpresable el error, y el CHECK no lo caza: `direccion_texto` es texto libre con tope de largo.**

**Reversibilidad:** REVERSIBLE (el endpoint), IRREVERSIBLE (las filas que escriba).

- [ ] **Step 1: El test de la secuencia, que es la guarda 5 de A §8.1 heredada**

«lo que no se publica no deja rastro, tampoco en el texto»: con precisión engrosada, la fila resultante tiene `altura IS NULL` **y** `direccion_texto` sin la altura. Fixture con una calle cuyo nombre tenga números: `25 DE MAYO 1450` degradado da `25 DE MAYO`, **no** `DE MAYO`. Por eso `componerDireccion` es una función testeada y no un regex en la base.

- [ ] **Step 2: La secuencia, numerada y en este orden**

```ts
// 1. La jerarquía y su origen.
const ubicacion = await resolverUbicacion(db, { calleId, localidadId, provinceId, punto });
// 2. El punto publicado. SIN `locationLabel`: el label se compone después.
const lugar = prepareRecordLocation({ point: punto, requested, role, sensitivity, sujeto, overrideCoarsening });
// 3. La dirección y la jerarquía YA degradadas. No recibe ni devuelve el texto.
const publicable = ubicacionPublicable({ direccion, rango, jerarquia, precision: lugar.publishedPrecision, hayPunto, role, sensitivity });
// 4. El texto, SOBRE lo que salió del paso 3.
const direccionTexto = componerDireccion(publicable, calle);
// 5. La etiqueta, con la MISMA función que usa prepareRecordLocation.
const etiqueta = normalizedLocationLabel(direccionTexto);
```

- [ ] **Step 3: La pregunta de la casa, en los NUEVE tipos**

> **¿Esto habla de una casa donde vive alguien?** · *Es mi casa* · *Es la casa de otra persona* · *No*

| respuesta | rol | sensibilidad | `overridable` |
|---|---|---|---|
| *es mi casa* | `subject` | **`moderate`** | `true` — mi ubicación, mi decisión, y se persiste en `engrosado_rechazado` |
| *es la casa de otra persona* | `subject` | `high` | `false` — no puedo consentir por otro |
| *no* | el rol de la tabla de B §4.7 | `low` | n/a |
| **sin respuesta** | `subject` | `high` | `false` |

**La pregunta corre en los nueve tipos, no en cuatro,** y ésta es una decisión de este plan que ninguna spec tomó sola. B la ponía sólo en `basta`, `necesidad`, `recurso` y `compromiso`; los otros cinco quedaban clavados en `low`, y la protección de evidencia de C (§2.10.3) —que no sube la foto de una señal sensible— cubría menos de la mitad del vocabulario. El agujero concreto: un `saber` es el tipo diseñado para hablar de gente («me lo dijo la enfermera del turno tarde»), salía `service_area`+`low` siempre, y su foto se subía a Blob y se servía con cache largo desde el borde. En los cinco tipos que hoy no la tienen, «sí» **sube la sensibilidad sin cambiar el rol**: el rol sigue gobernando el punto, la sensibilidad gobierna la evidencia y la dirección.

Y la compuerta de evidencia de la Task 26 pasa de `subject && high` a **`sensitivity IN ('moderate','high')`**: con «es mi casa» en `moderate`, una compuerta sobre `high` sola dejaría subir la foto de la casa propia, que es justo el agujero que se acaba de cerrar por el otro lado.

- [ ] **Step 4: Lo que el cliente no manda**

`actor_id` lo emite el servidor. `origen` lo deciden la ruta y la credencial (si lo declarara el cliente, un script se diría `'campo'` y lavaría spam de web como captura de terreno). `sensitivity` sale de `hablaDeUnaCasa`. **El servidor sigue recalculando la precisión con `prepareRecordLocation` y nunca le cree al cliente.** La cesión de licencia viaja como casilla explícita y escribe `cesion_licencia` + `cesion_en`.

**Idempotencia:** `insert … on conflict (origen, id_local) do nothing returning id`, **una sentencia**. Si no devuelve fila, se hace el `select` y se contesta `yaExistia: true`. El `SELECT`-antes-de-`INSERT` de `capturas.ts:52-58`, que tiene carrera, muere.

El recibo nunca devuelve `actorId`, `userId`, `id` ni el `serial`: sólo `idPublico`.

- [ ] **Step 5: Verificar**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- senales-ingesta
# Los nueve tipos con sus campos obligatorios; el mismo idLocal dos veces →
# `yaExistia: true`; una necesidad de casa propia con `aceptaEngrosado: false`
# persiste `engrosado_rechazado` y el recibo lo dice; la de un tercero se
# engrosa igual y el recibo también lo dice.
```

- [ ] **Step 6: Commit**

```bash
git add v2/apps/api/src/features/senales v2/packages/shared/src/validation/senal.ts v2/apps/api/src/app.ts v2/apps/api/tests/senales-ingesta.test.ts
git commit -m "feat(api): una sola puerta de entrada, y la dirección se degrada antes de escribirse"
```

---

### Task 14: El actor — emisión, cookies, CSRF y el techo que no ata a nadie a una IP

**Files:**
- Create: `apps/api/src/features/senales/actor.ts`
- Modify: `apps/api/src/features/auth/tokens.ts`
- Modify: `apps/api/src/middleware/csrf.ts`
- Modify: `apps/api/src/middleware/rate-limit.ts`
- Modify: `apps/api/src/lib/config.ts`
- Test: `apps/api/tests/actor.test.ts`

**Interfaces:**
- Produces: `POST /api/v1/civic/actor` (camino web de `devices/enroll`), `DELETE /api/v1/civic/actor` con dos modos, `POST /api/v1/civic/actor/rotar`, `setActorCookies`.

**Resolución de contradicción (la allow-list de CSRF por prefijo):** gana B. Se borra la rama `path.startsWith(\`${p}/\`)` de `isAnonAllowed` (`csrf.ts:54-70`). Su comentario dice «defensive — none of the current entries have sub-routes», y **B predijo el caso con nombre y apellido y C lo cumplió sin leerlo**: C §4.1 dice que sus confirmaciones van «por la misma allow-list explícita que ya tiene `/capturas`», o sea exactamente por la rama que B borra — un endpoint que escribe el estado de calidad, exento sin que nadie lo decida. La exención va por patrón **exacto**.

**Reversibilidad:** REVERSIBLE, salvo las filas de `actores`.

- [ ] **Step 1: El actor nace con su PAR de cookies**

La de identidad (`httpOnly`, `SameSite=Lax`, `Secure`, un año) y la de CSRF (`eihg_csrf`, `httpOnly: false`, mismo `baseCookieOptions` de `tokens.ts:103-107`). **Sin eso `DELETE /api/v1/civic/actor` devolvía 403 a todo el mundo**, porque hoy esa cookie sólo la emite `setAuthCookies`, o sea el login, o sea justo lo que un actor seudónimo no tiene. Con el par, ninguna de estas rutas necesita estar en la allow-list: el doble envío funciona igual para un actor seudónimo que para una sesión.

Un `actor_id` propuesto por el cliente **no se acepta**: si se aceptara, un script manda un uuid nuevo por request, hay actores infinitos y el unique deduplica una clave que controla el atacante. La `actorKey` la emite el servidor, 256 bits, y se guardan **dos hashes**: `actor_hash` (identidad) y `HMAC(pepper, deviceSecret)` (posesión). Un enrolamiento posterior de la misma `actorKey` con otro secreto se rechaza con **401** — sin esto, cualquiera que aprendiera una `actorKey` ajena podía enrolarse como esa persona, quemarle el cupo de unicidad en una señal y dispararle el detector de ráfagas encima.

- [ ] **Step 2: El retiro es un UPDATE, y pregunta cuál de las dos cosas**

| modo | qué hace |
|---|---|
| «borrá mi identidad» | `actor_hash = null`, `secreto_hash = null`, `retirado_en = now()`. **Las adhesiones y las señales quedan y siguen contadas.** Después de esto nadie —ni con la base entera y el pepper en la mano— puede volver de una `actor_key` a las filas de esa persona |
| «borrá también lo que escribí» | además retira todas sus señales (`retirada`, texto vacío) |

Y se le dice lo que pasa: *«tus voces anteriores siguen contadas, pero desde ahora vas a contar como otra persona»*. Ocultarlo sería más cómodo y sería mentir.

- [ ] **Step 3: El limitador que no persiste nada que ate un actor a una IP**

`actores_por_origen (hora, bucket, creados)` donde `bucket` es un HMAC del prefijo de red (**/32 en IPv4, /64 en IPv6** — el /64 hace falta porque un cliente IPv6 dispone de 2⁶⁴ direcciones y `req.ip` le daría un cupo nuevo a cada una) con una **sal que rota cada hora y no se guarda**. No tiene ninguna referencia a `actor_id`: no existe consulta que vincule un actor con su origen de red, y por eso el retiro no tiene nada más que borrar.

Es una tabla y no memoria de proceso porque la API corre como función serverless (ADR 0008): `express-rate-limit` con `MemoryStore` se resetea en cada cold start y cuenta por instancia, o sea que un techo de ventana larga en memoria es decorativo.

**20 actores nuevos por bucket por HORA, no por día.** Un día es un cupo, y un cupo castiga al vecino antes que al script: detrás de un CGNAT —Movistar, Claro, Personal: miles de abonados por IPv4 pública— un cupo diario de 20 deja sin actor al vecino 21 y le falla en silencio, como «tu voz no se contó».

- [ ] **Step 4: Cerrar los dos flancos del middleware**

Además de borrar la rama de prefijo: las rutas exentas **chequean el origen** (se rechaza cuando llega `Origin`/`Sec-Fetch-Site` y no es el propio; se permite cuando no llega ninguno, porque la app nativa no manda `Origin`), y `/senales` rechaza todo `content-type` que no sea `application/json`. Sin eso, un `<form method=POST>` oculto con `application/x-www-form-urlencoded` en cualquier página de tráfico escribe señales desde el navegador de cada visitante —sin preflight CORS, con `express.urlencoded` parseándolo en `app.ts:48`— y cada una llega desde una IP residencial distinta, así que ningún techo por bucket la ve.

- [ ] **Step 5: Verificar**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- actor
# `DELETE /actor` SIN cookie de sesión funciona (es la guarda de que no volvió el
# 403 para todos); agotar el techo por bucket devuelve 429; un cuerpo con
# `"origen": "campo"` entra igual como 'web'; retirar un actor no mueve un solo
# conteo por celda.
```

- [ ] **Step 6: Commit**

```bash
git add v2/apps/api/src/features/senales/actor.ts v2/apps/api/src/middleware v2/apps/api/src/features/auth/tokens.ts v2/apps/api/src/lib/config.ts v2/apps/api/tests/actor.test.ts
git commit -m "feat(api): el sistema te DA un identificador, no te lo saca — y lo podés tirar"
```

---

### Task 15: La adhesión — el conteo parte en dos y enciende la celda

**Files:**
- Create: `apps/api/src/features/senales/adhesiones.ts`
- Modify: `apps/mobile/src/civic/conteos.ts`
- Test: `apps/api/tests/adhesiones.test.ts`

**Interfaces:**
- Produces: `POST`/`DELETE /api/v1/civic/senales/:idPublico/adhesion`, `ConteoAdhesiones`.

**Resolución de contradicción (si una adhesión enciende la celda):** gana B. El cron de `celda_luz` (Task 25) **tiene que unir los actores que adhirieron a la celda de la señal que apoyan**. Con la definición de C —`count(distinct actor_id)` sobre las SEÑALES de la celda— adherir no enciende nada, y la decisión 7 existe porque la adhesión es el gesto más barato y el que más gente va a hacer: si no mueve el brillo, el mapa vuelve a medir a quien tuvo tiempo y teclado. C no puede expresarlo con su consulta actual: necesita un join contra `adhesiones` con **el punto de la señal apoyada, no del adherente** — que es lo correcto, porque un adherente no tiene punto propio.

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: `mandate_suggestions` se miró y no sirve**

La decisión 7 pide mirarla antes de inventar la adhesión desde cero. Tiene `support_count integer not null default 0` y un `incrementSupport` que hace `support_count + 1`: **exactamente el antipatrón que la decisión 7 existe para corregir** — un contador de filas guardado en la fila del objeto, en vez de un conteo de personas distintas derivado de una tabla de aristas. Y su `user_id NOT NULL` es la respuesta cómoda que la Task 14 se niega a dar. No se reusa.

- [ ] **Step 2: El conteo, con `count(distinct)` y no `count(*)`**

```sql
select count(distinct a.user_id) filter (where u.email_verified)                 as con_cuenta,
       count(*) filter (where a.user_id is null or u.email_verified is not true) as seudonimas
  from adhesiones a left join users u on u.id = a.user_id
 where a.senal_id = $1;
```

**Dos magnitudes y no una.** Una adhesión seudónima y una con cuenta no valen lo mismo y no se suman en un solo número sin mentir. `conCuenta` cuenta personas con `users.email_verified = true`; las cuentas sin verificar caen en `seudonimas`, que es lo que efectivamente son — llamar «verificada» a cualquier cuenta sería un rótulo falso, y un rótulo falso es peor que un número sin rótulo: el segundo se duda, el primero se cita. Las dos viajan como `Magnitud`, porque `guardas-simulacion.test.ts` ya falla si encuentra un número pelado.

`regimenDe(n+m)` de `mandato-regimen.ts` gobierna la presentación: cero → se invita; <100 → palitos; ≥100 → porcentaje. **No se reimplementa el umbral de 100 en el feed.**

- [ ] **Step 3: Adherir es idempotente y no se puede a lo propio**

`insert … on conflict (senal_id, actor_id) do nothing`. **No se puede adherir a la propia señal:** 409, comparando con `IS DISTINCT FROM`. El 409 cuesta dos clicks de esquivar borrando la cookie, así que no se vende como defensa: la defensa es el techo por bucket más `UMBRAL_SUPRESION`.

**La adhesión no es una confirmación.** Un hecho no se comprueba con un click: mueve el brillo y nunca la nitidez.

- [ ] **Step 4: `conteos.ts` del móvil suma los adherentes al `Set`**

```ts
const voces = new Set([...actorKeys, ...adherentes]);
```

Con la guarda «una adhesión enciende la celda de la señal que apoya». Y `SenalParaConteo.verificable` se deriva con `esVerificable(tipo)` en vez de la lista de tres hardcodeada en un comentario, que es del mundo de seis tipos: sin eso, ampliar los hechos de tres a cinco haría que brillo y nitidez midieran el corte viejo en silencio.

- [ ] **Step 5: Verificar**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- adhesiones && cd apps/mobile && pnpm test
# «dos adhesiones de la misma persona son una» (dos POST concurrentes con la
# misma cookie dejan UNA fila — el test que `proposal_votes` nunca tuvo);
# «una persona con veinte actores adhiere una vez» (el lavado de actores);
# «una cuenta sin correo verificado cae en seudonimas»; «no me puedo adherir a
# lo mío»; «una adhesión no confirma nada».
```

- [ ] **Step 6: Commit**

```bash
git add v2/apps/api/src/features/senales/adhesiones.ts v2/apps/mobile/src/civic/conteos.ts v2/apps/api/tests/adhesiones.test.ts
git commit -m "feat(api): el yo también cuenta personas distintas y enciende la celda que apoya"
```

---

### Task 16: Los adaptadores de las ingestas viejas, y los tres 410

**Files:**
- Modify: `apps/api/src/features/open-data/routes.ts`
- Modify: `apps/api/src/features/civic-map/capturas.ts`
- Modify: `apps/api/src/features/pulso/routes.ts`
- Modify: `apps/api/src/features/mandato/{classifier,cron}.ts`
- Test: `apps/api/tests/adaptadores.test.ts`
- Test: `apps/api/tests/privacidad-superficie.test.ts`

**Resolución de contradicción (dos adaptadores para la misma ruta vieja):** **una sola sección de comportamiento, y vive acá.** B convierte `POST /api/open-data/dreams` en adaptador con códigos nuevos (410 para `'valor'`, 400 si falta `category`); D lo congela con `Deprecation`/`Sunset` a febrero de 2027 apoyada en que sigue leyendo `dreams`. La cabecera `Sunset` prometería seis meses de vida estable a una ruta que cambia de tabla y de códigos mucho antes. **Esta tarea describe el adaptador completo con sus códigos; la Task 32 pone las cabeceras y la fecha y cita esta tarea.** Una implementación, dos documentos, una guarda.

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: La guarda de privacidad primero, porque es la fuga viva**

`privacidad-superficie.test.ts` siembra una señal con todos los campos sensibles poblados con centinelas irrepetibles (`submitted_as = 'captura:0f3c-CENTINELA-9d21'`), golpea cada endpoint público **incluido el recurso individual**, y afirma que la cadena centinela **no aparece en el body serializado, buscando en el texto crudo y no en el objeto parseado**. Buscar en el objeto parseado exige saber dónde mirar; buscar la cadena encuentra el campo anidado que nadie previó.

Hoy `open-data/routes.ts:69` devuelve `submittedAs` en la respuesta pública, y `capturas.ts:120-127` escribe ahí `captura:<uuid-del-dispositivo>`: **el UUID estable del teléfono se publica como nombre de autor y todas las capturas de un mismo aparato quedan correlacionables por cualquiera con `curl`.** Una fuga de identificadores no se depreca: se corta.

- [ ] **Step 2: El adaptador de `POST /api/open-data/dreams`**

Acepta los seis tipos viejos, genera `id_local` server-side, escribe `origen='web'` contra `senales`, y **no acepta los tres tipos nuevos**. `category` ausente → **400** (`tipo` es `NOT NULL` y adivinarlo sería inventar; hoy `category` es `.optional()`, o sea que un envío sin categoría es legal en producción ahora mismo). `'valor'` → **410 Gone**: «Los valores ya no se cargan en el mapa: van al Acta de la Interdependencia.» **No se traduce a otro tipo** — traducirlo sería inventarle una intención a alguien.

`GET /api/open-data/dreams` lee de `senales` y conserva la forma vieja **menos `submittedAs`**, que pasa a llamarse `firma` y ya no puede contener el UUID de ningún dispositivo.

- [ ] **Step 3: El adaptador de `POST /api/v1/civic/capturas`**

`observation → basta` (es lo que el piloto «luminarias apagadas» captura: algo que existe y está roto), `need → necesidad`, `resource → recurso`. Escribe `origen = 'campo-v1'`, **para que se sepa que ese tipo se dedujo y no se eligió** — cosa que importa para declarar sesgo (regla 5) y para saber cuándo se puede retirar:

```sql
select count(*) from senales
 where origen = 'campo-v1' and creada_en > now() - interval '90 days';
```

Eso es una consulta, no una promesa. `marcaDeCaptura` se borra.

- [ ] **Step 4: Los tres 410**

`POST /api/pulso`, `POST /api/propuestas` y `POST /api/propuestas/:id/vote` responden **410 Gone**, con el mismo criterio con que `'valor'` recibe 410: el recurso existía y ya no. **Apagar el voto apaga la única superficie de deliberación que el sistema tenía, y eso no se disimula.**

El body de los tres 410 lleva **`DECLARACION_DELIBERACION.propuesta` de la Task 10, textual**, y no una redacción propia. Es el cuarto lugar donde aparece la misma frase, con los otros tres en la web (Task 17) y en `PROCEDENCIA.md` (Task 33). Un 410 que dice «este recurso ya no existe» y nada más le hace creer a quien integró que el reemplazo está en otro path; **el que dice que la deliberación todavía no existe en ningún path es el único honesto.** Queda declarado además en «Lo que este plan NO hace» y como D-037, ahora **decidida**.

- [ ] **Step 5: El clasificador, con el sentinel arreglado**

`'sin_clasificar'` se borra. La cola la gobierna `tema_intentado_en`, que el clasificador escribe **pase lo que pase**, con tema o sin tema. Sin eso, con el catálogo cerrado de once temas, cada fila que el modelo no logra mapear vuelve a quedar `NULL`, vuelve a ser la más vieja, y el lote de 50 se llena para siempre con las mismas filas irreducibles: **una llamada de LLM por fila por tick, cola bloqueada, presupuesto quemado.** El defecto simétrico y peor del que hay hoy.

El LLM escribe **una** columna, `tema`, y sólo con `tema_origen='sugerido'`. El cron agrega por **actores distintos, no por filas**: sin esa línea, 400 señales tildadas `seguridad` desde un navegador dominan la composición de un barrio.

- [ ] **Step 6: Verificar**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- adaptadores privacidad-superficie
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3001/api/open-data/dreams \
  -H 'content-type: application/json' -d '{"body":"x","category":"valor"}'   # 410
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3001/api/pulso \
  -H 'content-type: application/json' -d '{"body":"x"}'                       # 410
```

- [ ] **Step 7: Commit**

```bash
git commit -am "feat(api): las ingestas viejas se traducen, y el UUID del teléfono deja de publicarse"
```

---

### Task 17: La web — cuatro colores por clase, nueve prompts, y el chip de estado

**Files:**
- Delete: `apps/web/src/lib/tipos-voz.ts` y su test
- Modify: `apps/web/src/components/papel/primitives/{ChipTipo,Sello}.tsx`
- Create: `apps/web/src/components/papel/primitives/ChipEstado.tsx`
- Create: `apps/web/src/components/papel/primitives/NotaDeAlcance.tsx`
- Modify: `apps/web/src/components/papel/primitives/index.ts`
- Modify: `apps/web/src/pages/ElMapa/el-mapa-data.ts`
- Modify: `apps/web/src/pages/ElMapa/instrumento/{paleta,Chrome}.tsx`, `useVistaMapa.ts`
- Modify: `apps/web/src/pages/ElMandatoVivo/{el-mandato-data,mandato-regimen}.ts`
- Modify: `apps/web/src/lib/queries/{civic-map,open-data}.ts`
- Modify: `apps/web/src/pages/ElMapa/sections/PanelSoltarVoz.tsx`
- Modify: `apps/web/src/pages/ElMapa/sections/` — la ficha de una señal (el detalle de `deseo`)
- Test: `apps/web/src/components/papel/__tests__/declaracion-deliberacion.test.tsx`

**Resolución de contradicción (`ChipEstado.tsx` lo crean las tres, con tres juegos de valores):** gana **B**, que es quien fija el vocabulario de estados; C y D lo consumen. Las siete entradas: `enviada`, `por_verificar`, `corroborada`, `resuelta`, `desactualizada`, `no_cumplida`, `retirada`, más la variante `sinEstado` con su razón en `title` que D necesita para el esquema 0. Mismo molde que `ChipTipo`: unión de literales + `Record` exhaustivo + un span. **No una card nueva, no un badge de shadcn.**

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: El fallback a `'valor'` muere en los cinco Records**

`tipoDe()` (`paleta.ts:34`) y `tipoDeCategoria()` (`el-mapa-data.ts:9`) son la misma función copiada dos veces, con `TIPOS.find(t => t === valor) ?? 'valor'`. **El defecto ya está en pantalla, no latente:** como pulso trae `'salud'`, propuesta trae `null` y mandato trae `'mandato'`, ninguno matchea y **tres de las cuatro capas se pintan enteras como `valor`** — la barra del contador dice que el país habla de «valor» y el chip `valor` del filtro apaga tres capas de un click.

Las dos derivaciones colapsan en una y después desaparecen: el tipo viene tipado del servidor. Los colores sí se quedan separados (papel vs oscuro), y por buena razón: maplibre pinta en WebGL y no entiende clases de Tailwind.

- [ ] **Step 2: Cuatro colores por CLASE, no nueve por tipo**

Nueve colores que se distingan en AA sobre papel **y** sobre fondo oscuro, a seis píxeles de diámetro, no existen. Y no es lo que el mapa tiene que decir de un vistazo: la lectura que importa es la regla 11 —esto se comprueba, esto se delibera— no «esto es un saber y aquello una práctica», que se lee en el chip, que lleva el nombre escrito.

| clase | token | hex |
|---|---|---|
| hecho | `ambar` | `#A16C00` |
| deseo | `violeta` | `#5227CC` |
| acto | `verde` | `#1A7A4A` |
| meta | `cian` | `#0F6B8A` |

Los cuatro salen de `tailwind.config.ts:41-49`. **Cero tokens nuevos.** Y `sello` `#C23B22` deja de ser color de tipo y vuelve a lo que su nombre dice: el color del estado ruidoso — `desactualizada`, `no_cumplida` y `retirada` llevan sello; los otros llevan chip, porque un sello rotado repetido en cuarenta filas de lista es ruido.

`FiltroTipos` itera **4 clases, no 9 tipos**: con nueve chips la columna de 340 px no da.

- [ ] **Step 3: Los nueve prompts, con los tres viejos verbatim**

Los de `necesidad`, `recurso` y `sueño` se conservan letra por letra. **El de `basta` cambia y es la decisión 4:** «¿De qué te cansaste? Decilo sin filtro» era puro afecto y por lo tanto no se podía comprobar —nadie puede ir a ver si vos seguís cansado—. Pasa a **«¿Qué hay roto donde vivís? Nombrá la cosa, no la bronca.»** El afecto no se pierde, cambia de lugar: la bronca es lo que te hace escribir, y lo escrito es la cosa.

El prompt de `valor` —«¿Qué no se negocia para vos? Dejalo por escrito.»— **se muda entero, sin reescribir**, al Acta de la Interdependencia. Es bueno y ya está probado; lo que estaba mal era el mapa, no la pregunta.

- [ ] **Step 4: `PanelSoltarVoz` con la pregunta, la cesión y las heurísticas**

Los nueve tipos, los campos condicionales, la pregunta de la casa, la línea de consentimiento del actor **pegada al botón de envío** (no en un pie), la casilla de cesión, y las tres heurísticas de datos personales —teléfono, dirección postal, firma institucional— que **advierten y piden confirmar, no bloquean**, y se declaran heurística en pantalla igual que `AVISO_TEMAS`. La tercera no es opcional: sin ella, un `compromiso` firmado «Secretaría de Obras — Municipalidad de Vicente López» vence, el reloj lo marca, y el mapa muestra un compromiso oficial incumplido que nadie del municipio escribió. `firma` se renderiza **siempre** con «firmado como … · sin verificar». Nunca sola.

- [ ] **Step 5: `NotaDeAlcance` — la primitiva del kit que dice lo que el producto todavía no hace**

**Decisión del dueño del producto, 2026-08-11 (D-037): la deliberación no se construye, y se declara en pantalla.** Hace falta una superficie para decirlo, y el kit Papel y Tinta no tiene ninguna: `NotaDemo` es la más cercana —es literalmente «esto que estás mirando no es real todavía»— pero su texto es fijo, sin props, y su micro-tipografía (`text-[10px] uppercase tracking-[0.12em]`) es ilegible para una frase de tres oraciones. **Se agrega la duodécima primitiva y no se estira `NotaDemo`:** son dos afirmaciones distintas —«el dato es de mentira» contra «el mecanismo todavía no existe»— y colapsarlas haría que el día que los datos sean reales alguien borre la nota y se lleve puesta la otra declaración.

```tsx
/** Lo que el producto TODAVÍA no hace, dicho en la superficie donde se nota.
 *  Hermana de NotaDemo: misma familia tipográfica, tamaño legible, porque esto
 *  se lee entero y aquello se reconoce de un vistazo. Filete arriba, no caja:
 *  una card la convertiría en un aviso que se cierra, y esto no se cierra. */
export function NotaDeAlcance({ children }: { children: ReactNode }) {
  return (
    <p className="font-space text-tinta-60 border-tinta-15 mt-4 border-t pt-3 text-[12px] leading-relaxed">
      {children}
    </p>
  );
}
```

**Cero tokens nuevos** (`font-space`, `tinta-60`, `tinta-15` ya existen), y va exportada desde `primitives/index.ts` como las otras once.

- [ ] **Step 6: Dónde aparece la declaración, y el texto exacto**

`DECLARACION_DELIBERACION` de la Task 10, importada, **nunca escrita a mano**. Dos superficies en la web, y en las dos la nota va **debajo del botón de adhesión**, no arriba: primero se ve qué se puede hacer, después qué no.

| superficie | qué tipo | texto |
|---|---|---|
| `PanelSoltarVoz`, con `tipo = 'sueño'` seleccionado | `sueño` | «Todavía no se puede deliberar. Por ahora un sueño sólo recibe adhesiones —«yo también»—, y eso no es una votación ni un acuerdo: nadie está midiendo quién gana. Lo estamos construyendo.» |
| `PanelSoltarVoz`, con `tipo = 'propuesta'` seleccionado | `propuesta` | «Todavía no se puede deliberar. Esta propuesta sólo recibe adhesiones —«yo también»—: nadie está votando, y una adhesión no la aprueba ni la rechaza. Lo estamos construyendo.» |
| la ficha de una señal ya publicada, al lado del «Yo también» | el de la señal | el mismo, por tipo |

**Sólo la clase `deseo`.** Un `¡basta!` o un `compromiso` con esa nota abajo sería falso —esos sí tienen su mecanismo entero, que es la corroboración— y el aviso repetido en las nueve superficies se vuelve mobiliario que nadie lee. **La regla es `claseDe(tipo) === 'deseo'`, derivada del vocabulario, no una lista de dos strings escrita a mano acá.**

- [ ] **Step 7: La guarda de que el aviso está**

`declaracion-deliberacion.test.tsx`, con la redacción de frase-afirmación:

```
«el panel de un sueño declara que no se puede deliberar»       → render tipo='sueño',    el texto está
«el panel de una propuesta declara que no se puede deliberar»  → render tipo='propuesta', el texto está
«el panel de un ¡basta! NO lo declara»                         → render tipo='basta',    el texto NO está
«la ficha de un deseo publicado lo declara al lado del Yo también»
«ninguna de las dos frases está escrita a mano en apps/web»    → grep, cero resultados fuera del import
«toda clase deseo tiene su frase»                              → Object.keys(DECLARACION_DELIBERACION)
                                                                 cubre TIPOS_SENAL.filter(t => claseDe(t)==='deseo')
```

La última es la que sobrevive al tiempo: es la misma afirmación que el `satisfies` de la Task 10 hace en tipos, hecha otra vez en runtime, **porque el día que alguien cambie la clase de `propuesta` el `satisfies` sigue compilando y esta guarda no.**

- [ ] **Step 8: Verificar**

```bash
cd v2/apps/web && pnpm type-check && pnpm test:unit
cd v2 && grep -rn "?? 'valor'" apps packages --include=*.ts --include=*.tsx   # cero resultados
cd v2 && grep -rn "'sueño'" packages apps --include=*.ts --include=*.tsx      # sólo vocabulario, guardas y tests
cd v2 && grep -rn "no se puede deliberar" apps packages --include=*.ts --include=*.tsx
# Expected: UNA sola definición (packages/shared/src/open-data/consentimiento.ts)
# más los imports. Cualquier otra ocurrencia literal es una copia y hay que borrarla.
```

- [ ] **Step 9: Commit**

```bash
git commit -am "feat(web): el color dice si se comprueba o se delibera, y lo que todavía no se puede hacer está escrito"
```

---

### Task 18: El cliente del paquete offline y el canje de actor en la app de campo

**Files:**
- Create: `apps/mobile/src/civic/callejero-offline.ts`
- Modify: `apps/mobile/src/civic/{sync,identity,map-point-action,listening}.ts`
- Modify: `apps/mobile/src/content/senales.ts`
- Test: `apps/mobile/src/civic/__tests__/callejero-offline.test.ts`

**Hueco bloqueante que cierra: el paquete offline del callejero no tiene cliente.** A §4.3 construye `/paquete/:corrida/localidad/:id` y `/departamento/:id`, dimensiona el peor caso (Córdoba capital, 8.542 calles, ~107 KB gzip) y le asigna el cliente «a la spec C». C no menciona el paquete, ni el catálogo, ni el autocompletado offline. D tampoco. **Queda un endpoint cuyo único llamador es su test de integración, y la decisión 1 del proyecto —soberanía del dato porque la app de campo tiene que autocompletar sin señal— sin ninguna implementación en las cuatro specs.** La regla 1 («offline-first, nunca offline-only») quedaba cumplida sólo del lado del servidor.

Va acá y no en la rebanada 5 porque **ésta es la única tarea del plan que toca `apps/mobile` en serio**: si no entra con el resto del trabajo de móvil, no entra en ningún lado.

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: El cliente del paquete**

Baja `/api/v1/geo/paquete/:corrida/departamento/:id` (el de departamento, no el de localidad: **una campaña cubre una zona y no una localidad**, y si el offline fuera sólo por localidad la superficie sin señal sería más angosta que la que el buscador online permite, justo en el caso de uso que justifica toda la rebanada 1). Lo guarda en el sistema de archivos de Expo, no en memoria.

**El teléfono compara su `corrida` contra la de `/version`, que responde `no-cache`, y baja de nuevo sólo cuando cambió.** Los paquetes son `immutable` con la corrida en la ruta: es más barato y más honesto que revalidar cada paquete. Un `settlement` no tiene paquete propio y resuelve a su localidad ancestro por `parent_id`.

- [ ] **Step 2: El autocompletado local usa la MISMA función que el servidor**

`normalizarNombreDeCalle` de civic-core, que corre igual en Hermes porque el paquete no toca red ni disco. Sin eso, la app filtraría distinto que el buscador online y la persona vería resultados distintos con y sin señal.

- [ ] **Step 3: El outbox canjea el actor ANTES de vaciarse**

`sync.ts` postea a `POST /api/v1/civic/actor`, guarda el portador en SecureStore, y recién después postea `/api/v1/civic/senales` con el contrato de la Task 13. **Sin el canje, toda captura de campo llegaría con `actor_id = null` y el brillo subcontaría justo donde la app trabaja.** El canje ocurre al sincronizar, que por definición es online: no rompe el offline-first.

`identity.ts` deja de ser la identidad y pasa a ser lo que ya era: la clave de la cola local. `resetCivicActorKey` también borra el portador.

- [ ] **Step 4: El vocabulario**

`MapPointKind`, `ListeningKind` y `LISTENING_THEMES` (once claves en inglés) se borran; se usan `TIPOS_SENAL` y el catálogo `temas` en español. `senales.ts` pasa de seis con claves en dos idiomas a nueve en español, con los prompts de la Task 17.

- [ ] **Step 5: Verificar**

```bash
cd v2/apps/mobile && pnpm check && pnpm test
# «el paquete de Córdoba capital entra bajo 150 KB», «el autocompletado offline y
# el online devuelven el mismo conjunto para el mismo texto», «una captura de
# campo llega con actor», «un settlement resuelve al paquete de su localidad».
```

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(mobile): el callejero viaja en el aparato y la captura de campo llega con actor"
```

---

# REBANADA 4 · El presupuesto, antes que el código

Una sola tarea, y va acá porque **es la única decisión de las cuatro specs que no se puede posponer con una nota al pie: cuando se descubra, la base ya va a estar llena.**

---

### Task 19: La suma conjunta de los 512 MB — MEDIDA, ya no estimada

**Files:**
- Create: `packages/db/scripts/presupuesto.ts`
- Create: `apps/api/src/features/civic-map/cron-presupuesto.ts` (chequeo programado)
- Modify: `docs/DEUDAS.md` (D-041, D-035)

**Hueco bloqueante que cerró: las cuatro specs presupuestaron por separado y ninguna hizo la suma.** A estimaba 201 MB (el callejero, incluidos los 38 de hoy). B estimaba ~800 B por señal con su adhesión y calculaba «≈460.000 señales» asumiendo un callejero de 100 MB. C estimaba 376 MB para 100.000 señales —«el rastro es cuatro quintos»— «contra 474 MB libres», **ignorando el callejero Y las filas de B**. La suma de esas tres estimaciones daba 657 MB a 100.000 señales y un techo conjunto de **~68.000 señales**, que es lo que este plan escribió antes de medir.

**LA MEDICIÓN CORRIÓ EL 2026-08-11 Y LOS NÚMEROS DE ABAJO SON MEDIDOS.** Rama de Neon `medicion-512mb-2026-08-11` (padre `br-wild-meadow-ajvpwwdh`, **no** producción). Las cinco migraciones `0013`–`0017` aplicaron limpias y sin una corrección al SQL. **El callejero entró COMPLETO y real —326.832 calles del Ministerio del Interior, no una muestra extrapolada—** más la jerarquía entera (24 provincias · 529 departamentos · 2.082 municipios · 4.027 localidades censales · 11.324 asentamientos = 17.986 filas) y 10.000 señales sintéticas **con su cola entera**: adhesiones con su distribución larga (7,98 por señal, cola hasta 399), confirmaciones, evidencia sin blobs, rastro, resoluciones y celdas. Las diez `COPY` entraron sin una sola violación de constraint, lo que además valida el DDL contra datos realistas. Todos los tamaños con `VACUUM ANALYZE` corrido.

**PISO FIJO — lo que no crece con las señales: 115.965.952 B = 110,59 MB (21,6% del techo)**

| renglón | filas | bytes | MB | origen |
|---|---:|---:|---:|---|
| `geo_calles` (39,4 MB de datos + 54,7 de índices) | 326.832 | 94.232.576 | 89,87 | medido |
| `geographic_locations` | 17.986 | 6.332.416 | 6,04 | medido |
| catálogos geo (`geo_calle_categorias`, `geo_catalogo_version`, `geo_seed_progreso`) | 24 | 163.840 | 0,16 | medido |
| catálogos de señal (`tipos_senal`, `estados_senal`, `temas`, `actores_por_origen`) | 40 | 262.144 | 0,25 | medido |
| `volcados` (vacía) | 0 | 32.768 | 0,03 | medido |
| tablas v1 preexistentes + catálogos del sistema + `pg_trgm` | — | 14.942.208 | 14,25 | medido |
| **piso fijo** | | **115.965.952** | **110,59** | |

**Callejero + jerarquía solos: 100.728.832 B = 96,06 MB.** La estimación de A decía 163 MB de incremental: **sobrestimaba en un 70%**.

**COSTO MARGINAL POR SEÑAL — medido sobre 10.000 señales con su cola entera: 4.506 B**

| tabla | filas / señal | bytes totales | B por señal |
|---|---:|---:|---:|
| `rastro_senal` | 3,86 | 14.344.192 | 1.434 |
| `senales` | 1 | 9.101.312 | 910 |
| `adhesiones` | 7,98 | 8.249.344 | 825 |
| `actores` | **2,5 (hipótesis, ver abajo)** | 6.004.736 | 600 |
| `confirmaciones` | 1,27 (1,65 por hecho) | 2.785.280 | 279 |
| `celda_luz` | 0,69 | 2.015.232 | 202 |
| `evidencia` (sin blobs) | 0,50 | 1.777.664 | 178 |
| `resolucion_confirmacion` | 0,19 | 385.024 | 39 |
| `senal_resolucion` | 0,10 | 294.912 | 29 |
| `respuestas` | 0,05 | 106.496 | 11 |
| **total** | | **45.064.192** | **4.506** |

**La fórmula, para que cualquiera rehaga la cuenta:**

```
TOTAL(n) = 115.965.952 + n × 4.506,4   bytes
TECHO    = (512 × 1024² − 115.965.952) / 4.506,4 = 93.401 señales
```

| n señales | MB | % del techo |
|---:|---:|---:|
| 10.000 (medido, no extrapolado) | 153,6 | 30,0% |
| 53.400 | 340,0 | 66,4% ← **la alarma** |
| 68.000 (el techo que este plan creía) | 402,8 | 78,7% |
| **93.401** | **512,0** | **100% ← el techo real** |
| 100.000 | 540,4 | 105,5% |
| 1.000.000 | 4.408,2 | 861,0% |

**Tres cosas que la medición dio vuelta y hay que decirlas:**

1. **El pico no era el problema.** El máximo observado en toda la corrida fue **162,23 MB**, contra los ~337 MB que el plan presupuestaba para el momento de construir el GIN. La cuatro protecciones del Step 3 de la Task 5 alcanzan y sobran.
2. **El GIN de trigramas mide 9,1 MB, no ~72.** D-035 lo presupuestaba en el 22% del budget del callejero. Midió **ocho veces menos**, porque 120.115 calles se llaman «CALLE SN» y los trigramas deduplican. **El índice más caro del callejero no es el GIN sino `geo_calles_georef_unique`, con 17,4 MB.** D-035 baja de «baja» a informativa: dropear el GIN ya no compra nada.
3. **El rastro no es cuatro quintos: es el 31,8% del costo por señal.** C lo estimaba como el renglón dominante y de ahí salía la urgencia del archivado frío. Archivarlo entero baja el marginal de 4.506 a 3.072 B y sube el techo de 93.401 a ~137.000 señales: sigue siendo la palanca más grande que hay, **pero ya no es una emergencia** (ver la decisión del Step 3).

**LO QUE SIGUE SIENDO ESTIMACIÓN, marcado como tal:**

- **`actores` a 2,5 por señal es una hipótesis, no una medición.** Los actores escalan con personas, no con señales. Aportan 600 de los 4.506 B. **Si el ratio real es menor, el marginal baja a 3.906 B y el techo sube a ~107.700 señales;** si es mayor, baja. Es el primer número a re-medir con tráfico real.
- **El texto de las señales salió con media 155 caracteres** (p50 127, p95 352, máx 1.522) contra los ~180 del diseño, así que `bytesPorSenal` queda subestimado en torno al 0,5%. **Nada TOASTeó** —los TOAST de `senales` y `rastro_senal` quedaron en el mínimo de 8 KB—, y eso importa: al cruzar ~2 KB de texto el costo cambia de régimen y deja de ser lineal.
- **El pico medido es una COTA INFERIOR del que Neon factura.** `pg_database_size` no incluye WAL, y Neon guarda el WAL aparte y su storage incluye historia dentro de la ventana de retención. **Si la decisión de pagar se juega en el margen, el número que manda es el de la consola de Neon, no éste.**

**Reversibilidad:** REVERSIBLE (es medición y una alarma).

- [x] **Step 1: Medir el incremental de A y de B con datos reales, no con la estimación** — HECHO 2026-08-11

Corrió contra la rama `medicion-512mb-2026-08-11`. Las dos consultas que produjeron la tabla de arriba, y que `presupuesto.ts` tiene que seguir corriendo:

```sql
-- El total lógico, que es el que entra al techo del tier.
select pg_size_pretty(sum(pg_total_relation_size(c.oid))) from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relkind in ('r','i');

-- El renglón por renglón, que es lo que hace auditable la suma.
select relname, pg_size_pretty(pg_total_relation_size(oid))
  from pg_class where relkind = 'r' and relnamespace = 'public'::regnamespace
 order by pg_total_relation_size(oid) desc limit 20;
```

**Corrección a lo que este plan escribió antes de medir:** decía que «`pg_database_size` NO sirve». Sirve, con su límite dicho: es exactamente el tamaño lógico, y el tamaño lógico es lo que el tier cuenta. Lo que **no** incluye es el WAL ni la historia de PITR, que Neon guarda aparte. Por eso el script reporta **los dos números**: el lógico (que es el que la fórmula proyecta) y una nota de que el de la consola de Neon es el que factura. Un solo número acá sería otra vez el `0` que significa «no sé».

- [x] **Step 2: Sembrar 10.000 señales sintéticas con su cola entera y extrapolar** — HECHO 2026-08-11

`~800 B/señal` era la aritmética de la spec. **Medido: 4.506 B/señal**, o sea 5,6 veces más. La diferencia no está en `senales` (910 B, del orden de lo estimado) sino en la cola que B no contaba: el rastro, las 7,98 adhesiones y los actores.

**Dos cosas del generador que hay que conservar en `presupuesto.ts`, porque sin ellas la medición miente hacia abajo:**

1. **La cola de adhesiones tiene que ser larga, no plana.** Con media 7,98 y máximo 399 salieron 6.865 celdas encendidas; con una distribución plana salen 212 y el costo de `celda_luz` desaparece de la cuenta.
2. **El PRNG no puede ser un LCG en JavaScript.** `semilla × 1103515245` desborda 2^53, pierde los bits bajos y degenera: la primera corrida de esta medición midió 3,5 adhesiones por señal por ese bug. **Usar `mulberry32`.** Si alguien reproduce con un LCG, va a medir de menos y va a creer que hay más margen del que hay.

- [x] **Step 3: LA DECISIÓN — se queda en free, y el archivado frío baja a deuda** — TOMADA 2026-08-11

**Se queda en el plan free.** Los tres números que la sostienen:

- **Entran 93.401 señales en 512 MB**, un 37% más que las ~68.000 que este plan daba por techo.
- **Después del callejero quedan 401,41 MB libres** (78,4% del techo) para señales, y el callejero **ya no crece**: es una foto del Estado (D-034), no una tabla que se llena con el uso.
- **La alarma de 340 MB se cruza a las ~53.400 señales.** Entre esa alarma y el techo hay 40.000 señales de aire, o sea meses de margen para decidir con datos de tráfico reales en vez de con una hipótesis sobre `actores`.

**El archivado frío del rastro SALE de la rebanada 5 y baja a deuda (D-041 reformulada).** El argumento con el que entraba era que «el rastro es cuatro quintos del consumo»: **es el 31,8%**. Sigue siendo la palanca más grande —implementarlo sube el techo de 93.401 a ~137.000 señales— pero comprarla hoy cuesta una columna, una pasada de cron, un store de blobs y una verificación de cadena que cruza el borde de la base, **a cambio de un margen que recién aprieta a las 93.000 señales sobre una tabla que hoy tiene cero filas**. Se implementa cuando la alarma de 340 MB suene, no antes. **La deuda queda escrita con su disparador, que es lo que la hace una deuda y no un olvido.**

Las dos palancas quedan escritas para ese día, en orden de preferencia:

1. **Archivar el rastro por corte** a un blob (el mismo store del volcado), dejando en la base sólo la cabeza de cadena por señal y el sello diario. Recupera 1.434 de los 4.506 B por señal.
2. Si eso no alcanza: **pagar el tier**. La segunda rama de Neon para el rastro se descarta: hace que la verificación de la cadena cruce un límite de base para ahorrar un costo que ya sabemos acotado, y una verificación que cruza dos bases es una verificación que en la práctica nadie corre.

- [ ] **Step 4: La alarma es programada, no una consulta que alguien recuerda correr**

Alarma en **340 MB** (66% del techo ≈ 53.400 señales), como chequeo del cron diario. **Una alarma que depende de que alguien se acuerde no es una alarma.**

El chequeo emite **dos** números y nunca uno solo: `pg_database_size` (el lógico, contra el que corre el umbral) y un recordatorio en el mismo log de que la consola de Neon reporta lógico **más** historia de PITR. Y emite el `n` de señales al que corresponde el tamaño de hoy, para que el número diga cuánto falta y no sólo dónde estamos.

- [ ] **Step 5: Anotar D-041 y D-035 con los números medidos, y commitear**

D-041 pasa de «el techo es ~68.000 señales» a **«el techo medido es 93.401 señales, el archivado frío es la palanca y su disparador es la alarma de 340 MB»**. D-035 pasa a informativa: el GIN mide 9,1 MB y no el 22% del presupuesto, así que dropearlo no compra nada.

```bash
git add v2/packages/db/scripts/presupuesto.ts v2/apps/api/src/features/civic-map/cron-presupuesto.ts docs/DEUDAS.md
git commit -m "feat(db): el techo conjunto de la rama es un número medido y una alarma, no tres cuentas sueltas"
```

---

# REBANADA 5 · La corroboración

Depende de la rebanada 3 de forma dura y la propia spec C lo declara: sin `clase` como columna `NOT NULL` con dominio cerrado, sus CHECK son decorativos —`NULL or false` da `NULL` y un CHECK que devuelve `NULL` **pasa**—. Entra entera contra `senales`.

---

### Task 20: Los coeficientes de la corroboración y el canonicalizador del rastro

**Files:**
- Create: `packages/civic-core/src/coeficientes-corroboracion.ts`
- Create: `packages/civic-core/src/rastro.ts`
- Modify: `packages/civic-core/src/coverage.ts`
- Modify: `packages/civic-core/src/index.ts`
- Test: `packages/civic-core/src/__tests__/rastro.test.ts`

**Interfaces:**
- Produces: `UMBRAL_CORROBORACION = 2`, `UMBRAL_SUPRESION = 5`, `RADIO_CONFIRMACION_M = 150`, `TECHO_CONFIRMACIONES_HORA = 90`, `ESPERA_AUTOR_DIAS = 30`, `ESPERA_ENTREGA_DIAS = 90`, `RETENCION_REVISION_H = 72`, `MAX_HECHOS_POR_ACTOR_POR_CELDA = 20`, `VIDA_UTIL` y `GRACIA` por tipo; `canonJSON`, `armarPreimagen`; `asignarACelda`.

**Resolución de contradicción (dónde vive el umbral de supresión):** gana C, entero — el endpoint, la tabla, la política y **UNA sola constante, `UMBRAL_SUPRESION` acá**. `VOCES_MINIMAS_POR_CELDA` de B **no se crea**. C es la única que tiene el agregado, la tabla materializada y el argumento del congelamiento horario, sin el cual el endpoint es un sensor de presencia de dos cuadras. Dos constantes con el mismo valor en dos archivos para la misma decisión es cómo empieza toda deriva.

**Resolución de contradicción (cuánto dura una afirmación):** gana **C en el mecanismo y en los números**, con una corrección. «Vencerse no es desactualizarse» es la distinción correcta: confundir «alguien fue y ya no está» con «nadie fue a fijarse» es la versión temporal del `0` que significa «no sé». Y los números de C salen del daño y no del calendario: `recurso` a 30 días porque **un recurso vencido manda gente a una puerta cerrada**, y los 90 de B son un trimestre de gente golpeando una puerta que no abre.

**La corrección, y cierra un hueco serio que estaba en la intersección y que ninguna de las dos miraba:** los dos relojes se setean **al PUBLICAR** (`enviada → por_verificar`), no al corroborar. Con el «NULL hasta corroborada» de C, un hecho que nadie corrobora nunca no tiene ningún reloj y **afirma para siempre**, contando en el denominador de `verificables` de su celda y bajando la nitidez del barrio indefinidamente. Bajo B el problema no existía (`vigencia_hasta` NOT NULL desde el insert) pero B perdía la distinción vencer/desactualizar. Los deseos (730 d) y las metas (365 d) vencen por plazo fijo de clase contado desde `creada_en`, que es lo que C no cubre.

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: Los coeficientes con su razón al lado**

Mismo patrón que `simulacion/coeficientes.ts` y `coeficientes-luz.ts`: valor + justificación en el comentario, y cambiarlo es cambiar una constante a la vista.

**El 2 de `UMBRAL_CORROBORACION`, con su argumento y su límite:** dos ya es la regla del sistema (`quality.ts:35` la escribió y 398 tests corren encima); uno no es corroboración sino un par, y El Registro §6 ya aceptó por escrito que una persona con dos teléfonos cuenta dos veces; tres es inalcanzable el día uno con las tablas en cero, y `brillo.ts:89-95` dice que cero nitidez significa «hay hechos sin confirmar» — el mapa afirmaría que nada se comprobó nunca. **Lo que el umbral NO compra: presencias.** La puerta de proximidad no atesta nada, así que falsificar cuesta aparatos, no desplazamiento. Decirlo al revés sería inflar la garantía. **Qué lo cambiaría:** cuando existan 1.000 corroboraciones reales se audita a mano una muestra en campo; si más del 5% no resiste, sube a tres.

`MAX_HECHOS_POR_ACTOR_POR_CELDA = 20` existe porque `verificables` es el denominador y cargar señales no cuesta nada: cien hechos plausibles de una sola persona en una celda de 200 m apagarían su nitidez a ~0,02. **Contar más de veinte hechos de un solo actor convierte el denominador en el diario de una persona.**

- [ ] **Step 2: `rastro.ts`, con el hash inyectado**

`canonJSON` ordena claves, normaliza números y escapa igual siempre: **dos implementaciones distintas tienen que dar el mismo byte o la cadena no vale nada.** El hash entra por parámetro `(bytes: Uint8Array) => Promise<Uint8Array>`, porque `crypto.subtle` de Node y `expo-crypto` del teléfono no son la misma API. Misma disciplina que el reloj de la Simulación.

**La preimagen se parte en dos**, y esta partición es lo que hace que el rastro público alcance para recomputarla:

```
compromiso = sha256(actor_id ‖ canonJSON(datos) ‖ nonce)      // viaja público con el nonce
hash       = sha256(hash_previo ‖ seq ‖ senal_id ‖ ocurrio_en_publicado ‖ tipo_evento
                    ‖ estado_previo ‖ estado_nuevo ‖ compromiso)
```

**Resolución de contradicción (a qué resolución se publica el tiempo):** una sola regla, en un solo lugar. `redondearParaPublicar(instante, sensitivity)`: **a la hora por defecto, al día cuando `sensitivity='high'`, al día siempre en el volcado.** El minuto de B no alcanza —sesenta segundos de granularidad más un punto engrosado siguen emparejando dos señales de la misma sesión, que es el ataque que el propio B describe— y tener tres resoluciones distintas para el mismo riesgo es la manera de que una se olvide.

Y el `ocurrio_en` **exacto** de C sale de la preimagen externa y **entra en `canonJSON(datos)`**, o sea adentro del `compromiso`, que ya viaja con su `nonce`. La preimagen externa usa el instante redondeado. Sin esto, `GET /senales/:idPublico/rastro` devolvía exacto el timestamp que las otras dos specs redondean en cuatro lugares —el primer evento de toda señal es `ingreso`, y su `ocurrio_en` ES el instante de creación—, y reconstruir la sesión de campo costaba N requests. El verificador externo sigue cerrando la cadena con lo que la respuesta pública le da; quien tiene los campos privados abre el compromiso y ve el instante exacto.

- [ ] **Step 3: `asignarACelda` en `coverage.ts`**

`asignarACelda(plan, punto): string | null` sobre la grilla regular. El bucle de `conteos.ts:37` —`cells.map(… senales.filter(…))`— es O(celdas × señales) y `pointInCoverageArea` renormaliza el polígono en cada invocación: **a 4.000 celdas y 10.000 señales son 40 millones de normalizaciones por corrida**, y eso no entra en una función serverless.

- [ ] **Step 4: Verificar y commitear**

```bash
cd v2/packages/civic-core && pnpm test && pnpm type-check && pnpm lint
git add v2/packages/civic-core/src/{coeficientes-corroboracion,rastro,coverage,index}.ts v2/packages/civic-core/src/__tests__/rastro.test.ts
git commit -m "feat(civic-core): los coeficientes de la corroboración con su razón, y una cadena que un tercero puede recorrer"
```

---

### Task 21: La migración 0016 — las cinco tablas del rastro y el rol que no puede reescribirlo

> **ES LA `0017` (corrimiento del 2026-08-12, ver la Task 11).** Y «la `0015`» que esta tarea nombra —la de la señal— es la `0016`.

**Files:**
- Create: `packages/db/src/schema/corroboracion.ts`
- Modify: `packages/db/src/schema/{senales,index}.ts`
- Modify: `packages/db/drizzle.config.ts`
- Create: `packages/db/migrations/0016_la_corroboracion.sql` + journal
- Create: `apps/api/src/lib/arranque-privilegios.ts`
- Test: `packages/db/tests/rastro-inmutable.test.ts`

**Interfaces:**
- Produces: `confirmaciones`, `senal_resolucion`, `resolucion_confirmacion`, `rastro_senal`, `evidencia`, `celda_luz`; el rol `v2_app`.

**Resolución de contradicción (el nombre y la clave única de la tabla de confirmaciones):** **nombre `confirmaciones`** (B, plural, familia de `adhesiones` y `respuestas`); **clave `(senal_id, ronda, actor_id)`** (C). B se excedió al fijarle `unique (senal_id, actor_id)`: la `ronda` no es un detalle de implementación de C, es el mecanismo entero de la revisión de vigencia. Sin ella en la clave, una señal que vuelve a `por_verificar` después de vencer **no puede ser re-confirmada por nadie que ya la haya mirado alguna vez**, y todo el ciclo queda muerto al primer vencimiento. Una spec puede fijarle a otra una restricción; no puede fijarle una que le impide funcionar.

**Resolución de contradicción (dos bitácoras de estado):** gana `rastro_senal`. `senal_estado_historia` de B no se creó (Task 11). Si se construyeran las dos, las transiciones que escribe B no dejarían evento en la cadena de C, la guarda «que la cadena de una señal esté entera» quedaría roja de forma permanente, y la pasada de reconciliación del cron empezaría a «reparar» transiciones legítimas con `motivo: 'reconciliado'` — la reparación que C dice que no hay que disimular, disimulando. El `disparador` de B se mapea: `persona`→`actor_clase='persona'`, `conteo`→`'sistema'` con `tipo_evento='transicion'`, `reloj`→`'sistema'` con `superficie='cron'`. La ausencia de `'ia'` que B celebra ya está en el CHECK de C.

**Reversibilidad:** **IRREVERSIBLE.** Crea seis tablas y **revoca privilegios**. El `revoke` es reversible con un `grant`, pero el paso humano en Neon no.

- [ ] **Step 1: Las tablas, con las cinco FK apuntando a `senales(id)`**

`senal_confirmacion` → `confirmaciones`. Todas las `references dreams(id)` de C pasan a `references senales(id)`. Se cae `dreams_hecho_con_actor_check` (Task 11). Se cae `estadoColumns` como objeto compartido: sus columnas ya viven en `senales`. Se cae `dreams_estado_check` y `dreams_estado_por_clase_check`: las FK compuestas contra `estados_senal` expresan lo mismo con más precisión y **sin el agujero de `NULL or false`**.

**Los constraints se renombran CON la tabla**, cosa que el renombre no dice y que hay que decir: `confirmaciones_veredicto_check`, `confirmaciones_coherencia_check`, `confirmaciones_uq`, y así con todos. Un `senal_confirmacion_veredicto_check` colgando de una tabla que se llama `confirmaciones` es la clase de resto que dentro de un año hace que alguien busque una tabla `senal_confirmacion` que no existe — y los nombres de constraint son lo que Postgres devuelve en el mensaje de error, o sea lo que la gente googlea.

**Y el `ALTER TABLE senales` de C §3.1 no entra en esta migración: no le queda ninguna columna que agregar.** Las seis de vigencia y `publicada_en` nacen todas en la `0015` (Task 11, Step 4). C agregaba siete columnas con `add column` sin `if not exists`, así que copiar ese bloque tal cual **aborta la `0016` en su primera línea** con `column "estado_desde" of relation "senales" already exists` — y con ella caen `evidencia`, `confirmaciones`, las resoluciones, `rastro_senal`, `celda_luz` y el bloque de privilegios, o sea la rebanada 5 entera, en la primera corrida. Los índices parciales de los relojes —los tres del bloque de la Task 11 Step 4, con `vence_el` reapuntado a `vence_el_revision`— **sí** son de C y sí entran acá, junto con el cron que los barre; no colisionan con ningún nombre de la `0015`.

`on delete restrict` en las FK a `senales`: una señal con confirmaciones no se borra; si hay que borrar contenido, se redacta.

**Y `evidencia` no lleva `hash_percep`:** la sugerencia de duplicados espera a que exista un lugar donde decodificar píxeles sea barato. Decodificar pediría `sharp` —dep nativa que exige ADR— y abriría la bomba de descompresión (un PNG de 4 MB que expande a 40.000 × 40.000 px es un OOM en una función serverless).

- [ ] **Step 2: El `customType` `bytea` COMPLETO, con `toDriver`**

```ts
export const bytea = customType<{ data: Uint8Array; driverData: Buffer }>({
  dataType: () => 'bytea',
  toDriver: (v) => Buffer.from(v),
  fromDriver: (v) => new Uint8Array(v),
});
```

Un `Uint8Array` plano **no es** `instanceof Buffer`, y el driver de neon serializa con `r instanceof Buffer ? '\\x'+hex : r`: **sin `toDriver` el parámetro sale como `{"0":12,…}` y Postgres recibe basura** en las cinco columnas de hash.

- [ ] **Step 3: El bloque de privilegios, completo y en este orden**

```sql
do $$ begin if not exists (select 1 from pg_roles where rolname = 'v2_app')
     then create role v2_app login; end if; end $$;
grant usage on schema public to v2_app;
grant select, insert, update, delete on all tables in schema public to v2_app;
grant usage, select on all sequences in schema public to v2_app;
alter default privileges in schema public grant select, insert, update, delete on tables to v2_app;
alter default privileges in schema public grant usage, select on sequences to v2_app;
revoke update, delete, truncate, references on rastro_senal from v2_app;
```

Idempotente porque la migración también corre en ramas frescas donde nadie creó el rol. **Sin el `grant` general, `v2_app` no puede leer ni `senales`; sin `usage, select on sequences`, ni siquiera insertar en el rastro; sin `alter default privileges`, la migración siguiente rompe la API.**

El nombre es `rastro_senal` y no `bitacora_senal` a propósito: la regla 3 dice «bitácora y reflexión personal nunca se publican», y una ruta pública llamada `bitacora` al lado de esa regla se resuelve dentro de seis meses asumiendo que la regla ya no se cumple. **La palabra queda para lo privado.**

- [ ] **Step 4: El chequeo de arranque que caza el paso humano faltante**

**Hueco menor con dueño:** la contraseña del rol y el cambio de `DATABASE_URL` los hace **una persona en Neon**, y ninguna spec lo agenda. Si ese paso no ocurre, la API sigue conectándose como dueña, el revoke no protege nada, y la capa 1 de inmutabilidad —la única que C califica de «inmutable de verdad»— existe sólo en el archivo de migración. **No hay guarda que lo detecte: la migración aplica igual.**

`arranque-privilegios.ts` corre al levantar la API, pregunta `has_table_privilege(current_user, 'rastro_senal', 'UPDATE')`, y si da `true` **loguea en WARN con el texto exacto de qué falta hacer en Neon**. Es lo más que se puede hacer sin bloquear el arranque de producción por una tarea de infraestructura.

- [ ] **Step 5: El archivado frío NO entra — la medición de la Task 19 lo bajó a deuda**

Esta migración iba a crear `rastro_senal.archivado_en` y a cargarle al cron de la Task 23 una pasada de archivado, condicionado a que la Task 19 confirmara el techo conjunto de ~68.000 señales. **La medición corrió el 2026-08-11 y no lo confirmó: el techo es 93.401 señales y el rastro es el 31,8% del costo marginal, no los «cuatro quintos» que C estimaba.**

**`archivado_en` no se crea, la pasada de archivado no se escribe, y el store de blobs no se toca en la rebanada 5.** Queda como D-041 con su disparador escrito: cuando la alarma de 340 MB suene (≈53.400 señales), `rastro_senal` gana `archivado_en timestamptz` en una migración propia y el cron gana la pasada que mueve los eventos de señales cerradas hace más de 90 días al blob, dejando la cabeza de cadena y el sello. Sube el techo a ~137.000 señales.

**Agregar la columna hoy no es gratis y por eso no se agrega:** una columna que ningún código escribe se lee dentro de seis meses como una que sí, y la primera consulta que alguien escriba con `where archivado_en is null` va a estar filtrando por una condición que siempre es verdadera —o sea, no filtrando— sin que nada falle. **Una columna sin escritor es un `0` que significa «no sé» con forma de esquema.**

- [ ] **Step 6: Verificar**

```bash
cd v2 && DATABASE_URL_UNPOOLED="$NEON_BRANCH_URL" pnpm --filter @v2/db db:migrate
cd v2 && pnpm --filter @v2/db test:integration -- rastro-inmutable
# «un UPDATE sobre rastro_senal falla con error del MOTOR, no con un `if`»
# «ningún repositorio hace .update() ni .delete() sobre rastroSenal» (por grep:
#  la capa 3, que protege el desarrollo local donde todos son dueños)
```

- [ ] **Step 7: Commit**

```bash
git add v2/packages/db/src/schema v2/packages/db/migrations v2/apps/api/src/lib/arranque-privilegios.ts v2/packages/db/tests
git commit -m "feat(db): el rastro no lo puede reescribir ni la aplicación queriendo"
```

---

### Task 22: `POST /senales/:idPublico/confirmaciones` — la transición en una sola sentencia

> **Corrección de nomenclatura que vale para TODO el plan: ninguna ruta pública recibe el ordinal.** B §4.8 escribe `:id` en cinco endpoints públicos —adhesión, `segunda-mirada`, `PATCH /tema`, `DELETE` y el recurso individual— y su propia §3.3 explica por qué eso no puede ser: «un ordinal en la URL permite enumerar el corpus y emparejar dos señales de la misma sesión». C y D escriben `:idPublico` en todas las suyas. **El plan usa `:idPublico` en las cinco**, y la guarda de la Task 34 gana una afirmación más: **ninguna ruta pública recibe el ordinal.** La guarda que ya existía busca la cadena en el JSON serializado, y **un ordinal que viaja en el path no lo ve nadie** — pasa por afuera del único lugar donde se estaba mirando.

**Files:**
- Create: `apps/api/src/features/civic-map/confirmaciones.ts`
- Modify: `apps/api/src/features/civic-map/routes.ts`
- Modify: `apps/api/src/middleware/{csrf,rate-limit}.ts`
- Test: `apps/api/tests/confirmaciones.test.ts`

**Interfaces:**
- Consumes: los coeficientes de la Task 20, `publicLocationUncertaintyKm`.
- Produces: el endpoint, `ReciboConfirmacion`.

**Reversibilidad:** REVERSIBLE (el endpoint), IRREVERSIBLE (las filas).

- [ ] **Step 1: No hay transacciones, y eso cambia el diseño**

Verificado en `node_modules`: `drizzle-orm/neon-http/session.js:138` y `:144` lanzan `Error("No transactions support in neon-http driver")`. **`db.transaction()` no existe en este repo.** Lo que sí existe es `db.batch()`, que empaqueta consultas ya construidas en una sola transacción HTTP pero no deja usar el resultado de una como entrada de la siguiente.

Eso ya produjo un defecto vivo: `castVote` hace `DELETE`, después `INSERT`, después recalcula el agregado, en tres sentencias sin transacción y sin índice único. **Es el precedente más parecido a una confirmación que hay en el sistema, y está mal implementado.** Toda escritura de esta tarea que tenga que ser atómica se escribe **en una sola sentencia** —CTEs modificantes, `ON CONFLICT`, o un índice único que arbitre— y nunca copiando ese patrón.

- [ ] **Step 2: La sentencia, con el `1 +` que no es un truco**

El CTE de diagnóstico va adelante para que la respuesta siempre pueda decir *por qué* no insertó. La comparación de autor se escribe `a.actor_id IS DISTINCT FROM $2`, **nunca con `<>`**: con la columna en `NULL`, `<>` devuelve `NULL` y según cómo lo escriba quien implemente pasa una de dos cosas opuestas y las dos son malas —como filtro `WHERE`, toda señal anónima queda imposible de corroborar; como «rechazá sólo cuando son iguales», toda señal anónima es **auto-corroborable por su propio autor**, que es el ataque canónico contra un mapa cívico.

**El `1 +` en la condición del umbral:** un CTE hermano **no ve** las filas que otro escribió en la misma sentencia —los `SELECT` corren contra el snapshot del inicio— y ésa es la clase de detalle que, sin escribirlo, produce un doble conteo silencioso. La carrera de dos confirmaciones que empatan en el umbral la serializa el bloqueo de fila: la segunda falla su `d.estado = a.estado`. No hay transición doble.

**La corrección usa NETO y no un 2 fijo** porque el reinicio de ronda es una palanca de censura barata: con umbral fijo, dos `correct` tumban una señal de diez confirmaciones y la ronda nueva borra el efecto de las diez. Con neto, tumbar una señal de diez cuesta diez correcciones — y cada una con su `nota`, que el CHECK exige y que una revisión humana puede leer.

- [ ] **Step 3: La puerta de proximidad, y lo que no compra**

```
radio = 150 m + publicLocationUncertaintyKm(precision_publicada) × 1000
```

Los 150 m salen de una cuenta: el GPS de consumo erra de 5 a 15 m en calle abierta y se degrada a ~100 m entre edificios altos; la manzana del damero argentino mide 100 m de lado. **Una cuadra y media:** alcanza para confirmar una luminaria desde la esquina de enfrente y no desde otro barrio. El sumando reusa la misma función con la que el servidor decidió cuánto correr el punto — si el punto se publicó a 500 m, exigir 150 sería exigirle a la persona una precisión que el propio sistema le borró.

**Es una fricción de honestidad, no un control.** El punto lo manda el cliente y falsificar «estuve ahí» es copiar dos números. Por eso la fila guarda `proximidad_procedencia = 'declarada_por_cliente'` y **todo texto de cara al usuario dice «declaró estar en el lugar», nunca «estuvo»**.

**La ubicación del confirmante no se guarda:** se compara en memoria y queda una categoría (`en_el_lugar`, `lejos`, `no_declarada`, `inaplicable`). Ni el punto, ni los metros, ni un bucket de distancia — un `<50m` contra un punto `exact` es una ubicación más fina que la que la política le concede a un `subject`. Y **no hay índice `(actor_id, creado_en)`**: era, literalmente, «traeme el recorrido de esta persona ordenado por hora» sobre una tabla de presencias declaradas.

- [ ] **Step 4: Los seis veredictos con sus seis consecuencias**

No se inventa vocabulario: los seis de `verification-provenance.ts:71-120` ya están redactados en rioplatense con su consecuencia declarada, y el CHECK es su copia en SQL.

**El `unsafe` con umbral 1 está elegido con el filo a la vista.** Esperar dos es esperar a que el daño se duplique, y es el único canal por el que alguien puede decir «esto expone a una persona» — la mitad literal de la métrica norte. Pero una asimetría de uno también es una palanca de censura, y no se disimula: retener **no borra, no cambia el `estado` y es reversible**, abre una revisión con plazo de 72 h, y el rastro guarda quién la disparó. El costo de un abuso son 72 horas de ocultamiento; el del error inverso es exponer a una persona.

- [ ] **Step 5: CSRF por patrón exacto y limitador por actor**

La ruta se exime por patrón **EXACTO**, no por prefijo (Task 14). Y **la clave del limitador es el `actor_id` cuando la petición trae dispositivo enrolado**: `anonSubmitRateLimit` es 30/hora/IP, así que si corriera acá el techo real sería 30 y las 90 serían decorativas — y con CGNAT **una campaña de veinte personas sobre la misma red móvil se bloquearía a sí misma**.

- [ ] **Step 6: Verificar**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- confirmaciones
# «una confirmación no alcanza; dos alcanzan»; «nadie corrobora lo suyo, ni
# cargando anónimo»; «dos confirmaciones simultáneas en el umbral producen UNA
# sola transición» (dos POST en paralelo); «dos correcciones no tumban una señal
# con diez confirmaciones»; «a 400 m de un punto exacto no cuenta, a 400 m de uno
# de 500 m sí»; «know_place sobre una señal con punto no suma»; «un sueño no se
# puede confirmar» (422); «un unsafe saca la señal del mapa en el mismo POST y no
# toca su estado»; «veinte confirmantes detrás de una misma IP no se bloquean».
```

- [ ] **Step 7: Commit**

```bash
git commit -am "feat(api): un dicho se vuelve hecho con dos miradas ajenas, y la calidad puede bajar"
```

---

### Task 23: Los dos relojes y el cron de vigencia

**Files:**
- Create: `apps/api/src/features/civic-map/cron-vigencia.ts`
- Modify: `scripts/build/bundle-api.ts`
- Create: `api/cron/vigencia.mjs`
- Modify: `vercel.json`
- Test: `apps/api/tests/vigencia.test.ts`

**Interfaces:**
- Consumes: `VIDA_UTIL`, `GRACIA` de la Task 20.
- Produces: las siete pasadas del cron.

**Reversibilidad:** REVERSIBLE (el handler), IRREVERSIBLE (las transiciones que escriba, aunque cada una deja evento y es reversible por confirmación).

- [ ] **Step 1: El patrón de despliegue, que es donde esto se muere en silencio**

Handler en `apps/api/src/features/civic-map/cron-vigencia.ts`, entrada en `scripts/build/bundle-api.ts` que emite `apps/api/dist-bundle/cron-vigencia.mjs`, **stub commiteado** `api/cron/vigencia.mjs` que lo reexporta, y las dos entradas en `vercel.json` (`functions` con `maxDuration`, `crons` con el schedule). Es el patrón exacto de `api/cron/rankings.mjs`. **Un `.ts` suelto en `api/cron/` no lo compila nadie y el cron devuelve 404 en producción sin fallar el build** — es el pozo de D-029. Protegido con `CRON_SECRET`.

- [ ] **Step 2: Los dos relojes se setean al PUBLICAR**

`vence_el_revision = ahora + VIDA_UTIL[tipo]` y `caduca_el = vence_el_revision + GRACIA[tipo]` se escriben en la transición `enviada → por_verificar`, no en la corroboración. Es la corrección de la Task 20, y cierra el hueco de que **un hecho que nadie corrobora nunca no tenía ningún reloj y afirmaba para siempre**.

La gracia es **el 50% de la vida útil en todos los casos, uniforme a propósito**: mantiene constante la relación entre las dos, así que subir una vida útil sube su gracia sin abrir una segunda discusión.

- [ ] **Step 3: Las siete pasadas, todas idempotentes y todas dejando evento**

1. `corroborada`/`resuelta` con `vence_el_revision < now()` → `por_verificar`, motivo `revision_de_vigencia` o `revision_de_resolucion`, `ronda + 1`.
2. `por_verificar` con `caduca_el < now()` → `desactualizada`, motivo `caducidad_por_silencio`.
3. Resoluciones con `autor_vence_el < now()` y `autor_estado='pendiente'` → `sin_respuesta`; con 90 días desde `propuesta_en` y `autor_preguntado_en is null` → `no_hubo_como_preguntar`.
4. Retenciones por `unsafe` de más de 72 h sin revisión → se listan y se loguean. **Una retención que nadie mira es un borrado con otro nombre.**
5. **Publicación:** `enviada` de clase `hecho` o `acto`, con `province_id not null` y sin evidencia pendiente → `por_verificar`, evento `publicacion`, y **acá se setean los dos relojes**. Cuando las dos condiciones ya se cumplen al llegar —el caso normal— lo hace la misma sentencia del ingreso, así que una voz de campo sin evidencia queda mirable por terceros en el mismo POST. **Sin esta regla escrita, toda señal nace y muere en `enviada` y la nitidez del país entero es `inaplicable`.**
6. Recálculo de `celda_luz` para los planes publicados, **al cambio de hora**.
7. Reconciliación: transiciones sin evento → evento con `motivo: 'reconciliado'`. **La reparación que no se declara es una mentira prolija.**

Deseos (730 d) y metas (365 d) vencen por plazo fijo de clase sobre `creada_en`, en una consulta aparte: los 730 porque dos años es el tramo más corto en el que el país cambia visiblemente —una renovación parcial del Congreso— y por debajo de eso desactualizar un sueño sería castigar a quien piensa largo.

**Cada pasada es una sentencia con `returning`, y el conteo de lo que hizo se loguea.** Un cron que no dice cuánto movió es un cron que nadie va a auditar.

- [ ] **Step 4: `compromiso` — la salida honesta que el reloj no puede cerrar**

Apenas pasa `vence_el`, el reloj escribe `desenlace='vencido'` y estado `desactualizada`. Si esa fuera la única salida, el autor ya no podría declarar `no_cumplido` nunca. Por eso existe `desactualizada → no_cumplida`, disparador `persona`, **sólo el actor autor, hasta 30 días después del vencimiento**. La asimetría es deliberada: `cumplido` lo escribe el conteo con una confirmación ajena —**nadie se puede marcar cumplido a sí mismo**— y `no_cumplido` lo puede escribir el autor solo, porque **nadie miente para quedar mal** y el sistema necesita una salida honesta que no sea el silencio.

- [ ] **Step 5: Verificar**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- vigencia
# «una señal corroborada con vence_el cumplido vuelve a por_verificar, NO a
# desactualizada» (vencerse y desactualizarse no son la misma palabra);
# «un hecho que nadie corrobora igual vence» (el hueco de la intersección);
# «una voz de campo sin evidencia queda mirable por terceros en el mismo POST».
curl -s -o /dev/null -w '%{http_code}\n' localhost:3001/api/cron/vigencia   # 401 sin secreto
```

- [ ] **Step 6: Commit**

```bash
git add v2/apps/api/src/features/civic-map/cron-vigencia.ts v2/scripts/build/bundle-api.ts v2/api/cron/vigencia.mjs v2/vercel.json v2/apps/api/tests/vigencia.test.ts
git commit -m "feat(api): un hecho envejece desde que se publica, y vencerse no es desactualizarse"
```

---

### Task 24: La resolución y la métrica norte, que hasta acá no se podía calcular

**Files:**
- Create: `apps/api/src/features/civic-map/resolucion.ts`
- Create: `apps/api/src/features/civic-map/metrica-norte.ts`
- Test: `apps/api/tests/metrica-norte.test.ts`

**Interfaces:**
- Produces: `POST /senales/:idPublico/resolucion`, `POST /senales/:idPublico/resolucion/confirmaciones`, `GET /api/v1/civic/metrica-norte`.

**Resolución de contradicción (cuántas confirmaciones hacen falta para `resuelta`):** gana **C**, entero. Es su dominio y es la única que razona el ataque: **con tres identidades gratis alguien propone y confirma un cierre, y como `resuelta` está en el numerador Y en el denominador de la nitidez, cerrar falsamente además ILUMINA la zona** — herramienta perfecta para borrar un pozo del mapa. Que `resuelta` **no sea terminal** (180 días y vuelve a `por_verificar`) es la contracautela. El «al menos una confirmación de un actor distinto» que D obliga es un piso que su propia guarda de volcado verifica y que el diseño de C satisface con holgura.

**Defecto de la auditoría que se arregla acá: la métrica norte no se podía calcular.** La consulta pide seleccionar NECESIDADES, y la maquinaria de resolución la construía C sobre `dreams`, que no tiene columna de tipo: tiene `category text` sin constraint, que es el defecto de origen del encargo. C le pedía a B `clase` y **no le pedía `tipo`** — y con `clase='hecho'` se seleccionan basta, necesidad, recurso, práctica y saber juntos, o sea que se reportaría «un pozo tapado, un saber corroborado y una olla que sigue abierta» como si fueran necesidades. Bajo `senales` (Task 11) `tipo` vive en la misma tabla que la maquinaria de resolución, con FK compuesta al catálogo, y la consulta se puede escribir.

**Reversibilidad:** REVERSIBLE (endpoints), IRREVERSIBLE (filas).

- [ ] **Step 1: Las tres piezas del cierre**

1. **Alguien propone.** Cualquiera —quien la resolvió, quien pasó y la vio resuelta, quien coordinó— emite una afirmación de resolución. **No cambia el estado.** Quien resuelve no cierra. **Sólo se acepta sobre una señal `corroborada`**: la métrica norte dice «necesidades **verificadas**», y cerrar algo cuya existencia nadie corroboró contaría que se resolvió sin haber contado que existía. Sobre una `por_verificar`, **422**.
2. **Dos personas independientes confirman el cierre**, con la misma puerta y el mismo umbral, **en su propia ronda y su propia tabla**. No hay ni habrá un séptimo veredicto `resuelta`: el índice único de la corroboración no colisiona con el del cierre, y **las mismas dos confirmaciones que corroboraron el hecho no sirven de confirmaciones de su cierre**. Cerrar cuesta lo mismo que abrir, y cuesta aparte.
3. **La palabra de quien la cargó, cuando se le pudo preguntar.** Y acá el autor **sí** confirma lo suyo: la exclusión del autor rige la corroboración del hecho, no el cierre.

- [ ] **Step 2: El reloj arranca con la ENTREGA, no con la propuesta**

`autor_vence_el` se setea en el primer intento de entrega **efectivo** —push a un dispositivo enrolado, o el primer render de «tenés una pregunta pendiente» cuando esa cookie vuelve—, nunca en `propuesta_en`. Mientras no haya entrega, `autor_estado` se queda en `pendiente`; a los 90 días de la propuesta sin ninguna, pasa a `no_hubo_como_preguntar` y la resolución cierra **en su propio bucket**.

**Sin esto, `sin_respuesta` no significa «le preguntamos y no contestó» sino «nunca tuvimos cómo preguntarle», y ése es exactamente el `0` que quiere decir «no sé» metido adentro de la métrica norte.**

Y `PalabraDelAutor` es una unión de cinco variantes, no un booleano: `confirmo`, `no_hay_autor_identificable`, `no_hubo_como_preguntar`, `sin_respuesta`, `pendiente`.

- [ ] **Step 3: La consulta de la métrica norte, que ahora corre**

```sql
WITH corroborada_alguna_vez AS (
  SELECT DISTINCT senal_id FROM rastro_senal
   WHERE tipo_evento = 'transicion' AND estado_nuevo = 'corroborada'
)
SELECT r.cierre_tipo, count(*) AS n
FROM senal_resolucion r
JOIN senales s ON s.id = r.senal_id
JOIN corroborada_alguna_vez c ON c.senal_id = s.id
WHERE s.tipo = 'necesidad'
  AND r.estado = 'confirmada'
  AND s.estado <> 'retirada'
  AND s.retenida_en IS NULL
  AND (SELECT count(*) FROM resolucion_confirmacion rc
        WHERE rc.resolucion_id = r.id AND rc.cuenta) >= 2
GROUP BY r.cierre_tipo;
```

**El join contra el rastro es lo que hace verdadera la palabra «verificadas»:** `estado='corroborada'` no alcanza, porque una señal que se corroboró y después venció está en `desactualizada` y sí califica.

**Los cuatro buckets salen del `group by` y NUNCA se suman en un total.** Un total escondería precisamente la pregunta que importa —¿le preguntamos a la persona afectada?— y eso es lo que la métrica norte existe para no dejar esconder.

- [ ] **Step 4: El sexto campo, porque la tercera cláusula no tenía ni un término**

«…sin exponer a personas vulnerables» se afirma por construcción en el §6 de las cuatro specs y **no se mide en ninguna**, cuando el dato ya está en la base:

```ts
expuestasYReparadas: Magnitud   // derivado de:
// count(distinct senal_id) from rastro_senal
//  where tipo_evento in ('retencion_por_exposicion','redaccion')
```

Se publica **al lado** de los cuatro buckets y **nunca se resta de ellos**. Todo `Magnitud`, incluida la cobertura: hay un test que recorre el resultado y falla si encuentra un `number` pelado, y este endpoint entra bajo esa guarda — dejar `celdasConSenal: number` habría obligado, el primer día, a excluir el campo del test, y ahí muere la guarda.

- [ ] **Step 5: Verificar**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- metrica-norte
# «una necesidad que nunca se corroboró no puede cerrarse como resuelta»;
# «una resolución cuyo autor nunca pudo ser contactado cierra en su propio
# bucket, no en el de sin respuesta»; «la métrica norte no devuelve un number
# pelado, ni en cobertura»; «los cuatro buckets no se suman en ningún lado».
```

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(api): la métrica norte deja de ser una frase y pasa a ser una consulta con cuatro buckets"
```

---

### Task 25: `GET /api/v1/civic/map/cells` — cuatro estados y la supresión antes de la luz

**Files:**
- Create: `apps/api/src/features/civic-map/cells.ts`
- Create: `apps/api/src/features/civic-map/planes.ts`
- Modify: `apps/api/src/features/civic-map/cron-vigencia.ts` (pasada 6)
- Test: `apps/api/tests/map-cells.test.ts`

**Interfaces:**
- Produces: `CeldaPublicada`, `RespuestaCeldas`, el endpoint y el cálculo de `celda_luz`.

**Resolución de contradicción (quién construye `/map/cells`):** gana **C, entero**. D decía que «es de la rebanada 4 de El Registro» pero que «sí decide su política de supresión», y B declaraba la constante en otro archivo: tres specs reclamando pedazos de la política del mismo endpoint es la garantía de que nadie la escriba entera. **Los cuatro nombres de estado son los de C** —`luz | silencio | sin_actor_conocido | suprimida`—; el `muda` de D se retira porque le falta el que distingue «no sé quién» de «nadie».

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: La supresión sobre lo que ENTRA, nunca sobre lo que sale**

D-028 está verificada numéricamente: con los coeficientes públicos, `voces = habitantes × PARTICIPACION_PLENA × intensidad^(1/CURVA)`, y **una intensidad de 0,1720 sobre 1.000 habitantes despeja exactamente 1 voz**. El dibujo delata a la persona.

- `vocesDistintas === 0` y ninguna señal sin actor → `silencio`.
- `vocesDistintas === 0` y hay señales sin actor → **`sin_actor_conocido`**. `count(distinct)` ignora los NULL, así que una celda de cincuenta voces anónimas daría cero y se pintaría «nadie habló acá»: el pecado exacto que `brillo.ts` existe para prohibir, **por la puerta de atrás del agregado**.
- `1 ≤ vocesDistintas ≤ 4` → `suprimida`. **k = 5**, el piso habitual de anonimato en publicación de tablas de área chica.
- `vocesDistintas ≥ 5` → `luz`, y **recién ahí entra a `luzDeCeldas`**.

Por eso `brillo.ts` no cambia una línea de lógica (Task 9): `brilloDeCelda` nunca se invoca sobre una celda que este ruteo ya apartó.

**k = 5 protege contra un lector, no contra un contribuyente.** Quien puede crear actores puede empujar una celda de 1 voz a `luz`, invertir la intensidad y restar los suyos. Se encarece y se declara — y `vocesDistintas` sólo cuenta actores cuyo `primer_evento_en` es de hace más de 24 h, que es el mismo dato que el detector de ráfagas ya necesita.

- [ ] **Step 2: El reloj, congelado entero y no a medias**

`verificables` y `confirmaciones` se leen del `estado`, que es mutable, así que un observador que pollea vería la nitidez de una celda de 200 m cambiar en el instante en que alguien confirma. **Como confirmar pide estar en el lugar, eso sería un sensor de presencia de dos cuadras.** Por eso el agregado no se calcula por pedido: se materializa en `celda_luz` al cambio de hora y el endpoint lee esa tabla tal cual, con su `calculadoALas` a la vista. Congela el CUÁNDO de las tres variables a la vez, hace el endpoint cacheable, y de paso lo saca del camino de un DoS.

**Sólo se guardan las celdas con algo: la ausencia de fila es `silencio`**, así que la tabla crece con las señales y no con la superficie del país.

Y el cálculo **une los adherentes a la celda de la señal que apoyan** (Task 15): un join contra `adhesiones` con el punto de la señal apoyada, no del adherente.

- [ ] **Step 3: Se pide un plan publicado, no un polígono arbitrario**

El `planId` es el mismo hash de polígono canonicalizado + namespace + lado que `coverage.ts:828-829` ya calcula. Tres cosas de una: **servidor y teléfono caen sobre exactamente las mismas celdas sin negociar nada**; un polígono de 10.000 vértices con 4.000 celdas deja de ser un DoS de ray-casting sobre la función que también sirve la ingesta; y el `maxCells` es explícito en vez de clampearse en silencio y romper la coincidencia de `cellId`.

**El sesgo de la celda fija, y su `422`.** Con lado fijo, k=5 en una celda del interior con veinte habitantes es el 25% de la población: un umbral que en el microcentro se cruza con un grupo de WhatsApp y en el campo no se cruza nunca. **No se baja k —el piso de anonimato es correcto—: se adapta el lado.** El endpoint rechaza con `422` un plan cuyo lado deje celdas por debajo de los `k ÷ PARTICIPACION_PLENA = 100` habitantes, y devuelve el `ladoSugerido` que sí funciona. Así el sesgo se vuelve un error visible en vez de un interior apagado en silencio.

- [ ] **Step 4: El sobre lleva cobertura Y sesgo**

Tres entradas fijas como mínimo: **densidad provincial pareja** (D-026: sobreestima la población del campo y por lo tanto **subestima su brillo**), **participación por teléfono y tiempo disponible** (dirección desconocida), y **supresión k=5 sobre celda fija** (subestima la baja densidad). Los dos primeros se apilan en la misma dirección: **el interior sale doblemente apagado y la respuesta lo dice.**

Normalizar por población **no es** declarar sesgo: es una corrección, y encima una con sesgo propio.

- [ ] **Step 5: Verificar**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- map-cells
# «con 4 voces sale suprimida; con 0 y sin señales, silencio; con 0 y señales sin
# actor, sin_actor_conocido; con 5, luz»; «el endpoint no devuelve identificadores
# de persona y declara su sesgo»; «cien hechos de una sola persona en una celda no
# apagan su nitidez»; «una celda con todos sus hechos desactualizados no se dibuja
# igual que una de puros sueños»; «un lado que deja celdas bajo 100 habitantes da
# 422 con ladoSugerido».
```

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(api): la celda se suprime antes de encenderse, y decir no sé quién no es decir nadie"
```

---

### Task 26: La evidencia — el EXIF muere en el teléfono y el servidor rechaza, no arregla

**Files:**
- Create: `apps/api/src/features/evidencia/{routes,service,olfato}.ts`
- Modify: `apps/mobile/src/civic/` (re-codificación con `expo-image-manipulator`)
- Test: `apps/api/tests/evidencia.test.ts`

**Reversibilidad:** REVERSIBLE (endpoint), IRREVERSIBLE (los blobs subidos).

- [ ] **Step 1: A la base no va, y el número lo prueba**

Una foto procesada pesa ~250 KB: `512 MB ÷ 250 KB ≈ 2.048 fotos` y la plataforma entera queda muerta. El piloto de luminarias de una ciudad media —8.000 luminarias, una foto cada una— son **2 GB procesadas y 16 GB sin procesar: cuatro y treinta y dos veces el techo de toda la base.** No es una preferencia de arquitectura, es aritmética. Va a Vercel Blob, por el motivo del ADR 0008 D1: origen único y un solo lugar donde viven los secretos. El precio es el lock-in, y la mitigación está en el dato: la fila guarda el `sha256`, así que migrar es una re-subida dirigida por la base.

- [ ] **Step 2: El teléfono re-codifica antes de subir**

**Re-codificar no es «borrar tags»:** es decodificar a píxeles y volver a codificar, así que GPS, fecha, número de serie, notas del fabricante y —sobre todo— **la miniatura embebida, que suele conservar la foto antes del recorte**, desaparecen por construcción y no por confianza en un parser. Y la consecuencia fuerte de hacerlo en el aparato: **la coordenada exacta nunca sale del teléfono**, que es la versión más fuerte posible de la regla 2.

- [ ] **Step 3: El servidor rechaza, no arregla**

Olfatea los **bytes mágicos** (no el `content-type` declarado) y rechaza cualquier archivo que todavía traiga marcadores de metadatos: `APP1`/`APP13` en JPEG, `eXIf`/`tEXt`/`iTXt` en PNG, chunks `EXIF`/`XMP` en WebP. Ese mismo recorrido lee `ancho` y `alto` del `IHDR` o del marcador `SOF`: **no se decodifican píxeles**, porque decodificar pediría `sharp` —dep nativa que exige ADR— y abriría la bomba de descompresión.

**Máximo 4 MB, y no es un gusto:** el límite de cuerpo de una función de Vercel es 4,5 MB y `vercel.json` reescribe todo `/api/…` a la única función, así que un multipart de 8 MB muere con 413 **antes** de llegar al handler. Y el arreglo estándar —subida directa del cliente a Blob con token— **elimina justo el punto donde el servidor olfatea los magic bytes**. La subida pasa por la función, a propósito.

- [ ] **Step 4: La evidencia de una señal sensible no se sube**

La compuerta es **`sensitivity IN ('moderate','high')`**, no `subject && high` (resolución de la Task 13, Step 3): con «es mi casa» en `moderate`, una compuerta sobre `high` sola dejaría subir la foto de la casa propia. La foto se queda en el teléfono bajo la custodia que `apps/mobile/src/civic/` ya implementa, y lo que viaja es su hash y su recibo. **No hay «blob semi-privado»: hay público o no hay.** Se rechaza con **409 y un texto que explica** — no es un error del usuario, es la política funcionando.

**Y los píxeles también filtran.** Ninguna limpieza de metadatos evita que la foto muestre el número de una puerta. Por eso el piloto pide *fotografía guiada*: la evidencia se encuadra sobre la cosa, no sobre la casa. Se dice en pantalla, en el momento de sacarla, y queda en el recibo.

- [ ] **Step 5: El índice único es por señal y no global**

```sql
create unique index evidencia_sha256_uq on evidencia (senal_id, sha256) where borrada_en is null;
```

La misma foto puede respaldar dos señales legítimamente (un acta que cubre dos necesidades), y **un único global vuelve el 409 un oráculo —subís un archivo y aprendés si alguien más lo subió— y una forma de ocupación.**

Y el borrado: el blob se borra y el rastro **agrega** un evento `evidencia_borrada` con el hash y el motivo. La cadena sigue verificando porque lo encadenado es el evento, no el archivo. **El contenido se va; el rastro de que existió se queda** — y ese rastro es un hash y una hora.

- [ ] **Step 6: Verificar y commitear**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- evidencia
# «una foto con EXIF se rechaza; la misma sin EXIF entra; una de 5 MB se rechaza
# antes; una de una señal sensible se rechaza con explicación»; «borrar una
# evidencia deja el evento y conserva el hash».
git commit -am "feat(api): la coordenada de una foto no sale del aparato, y el servidor rechaza en vez de arreglar"
```

---

### Task 27: `recurso ↔ necesidad` — la etapa Tejer, que ninguna spec construía

**Files:**
- Create: `packages/db/src/schema/conexiones.ts`
- Create: `apps/api/src/features/senales/conexiones.ts`
- Modify: `packages/db/migrations/0016_la_corroboracion.sql` (o `0016b`)
- Test: `apps/api/tests/conexiones.test.ts`

**Hueco bloqueante que cierra: la conexión `recurso ↔ necesidad` no la construye ninguna.** Es la etapa **Tejer** del ciclo soberano, el piloto «Ollas del barrio» y la decisión 10 del proyecto («red de coincidencias: qué se cruzó con lo que ofreciste»). B la difiere a C con la forma ya decidida; **C no la menciona una sola vez**; D cita la decisión 10 únicamente para justificar que no hay autor en las respuestas. **Quedaba `recurso` como un tipo que se escribe, se adhiere y no se conecta con nada: una captura sin destino por diseño, en un producto cuya frase vinculante es «una captura sin destino no es éxito».**

Va en la rebanada 5 y no antes porque **la aceptación mutua es una confirmación con otro sujeto**: reusa el actor, la puerta de proximidad y el rastro que esta rebanada ya construyó.

**Reversibilidad:** IRREVERSIBLE (la tabla), REVERSIBLE (los endpoints).

- [ ] **Step 1: La forma, que B ya dejó decidida y hay que respetar**

Tabla de aristas entre dos `senales.id`, **con la clase declarada en la arista** (mismo patrón de FK compuesta que `respuestas`), el `actor_id` de quien la propone, y **la aceptación mutua son dos filas y no un booleano**. Y **no reusa `estado`**, porque la conexión tiene su propio ciclo — calidad y conexión son dos ejes, y ya se pisaron una vez.

```sql
create table conexiones (
  id              bigserial primary key,
  ofrece_id       integer not null,
  ofrece_clase    text not null check (ofrece_clase = 'hecho'),
  necesita_id     integer not null,
  necesita_clase  text not null check (necesita_clase = 'hecho'),
  propuesta_por   bigint references actores(id),
  estado_conexion text not null default 'propuesta'
    check (estado_conexion in ('propuesta','aceptada','entregada','confirmada','retirada')),
  creada_en       timestamptz not null default now(),
  foreign key (ofrece_id, ofrece_clase)     references senales (id, clase),
  foreign key (necesita_id, necesita_clase) references senales (id, clase),
  unique (ofrece_id, necesita_id)
);
create table conexion_aceptacion (
  conexion_id bigint  not null references conexiones(id) on delete cascade,
  actor_id    bigint  not null references actores(id),
  lado        text    not null check (lado in ('ofrece','necesita')),
  aceptada_en timestamptz not null default now(),
  primary key (conexion_id, lado)
);
```

El servicio valida que `ofrece_id` sea de tipo `recurso` o `práctica` y `necesita_id` de tipo `necesidad` o `basta`, **en el servicio y no en la FK**, para que un id equivocado sea 400 en castellano y no una violación convertida en 500.

- [ ] **Step 2: El cierre de la conexión NO cierra la necesidad**

Es la obligación literal de C a B, y vale igual acá: **el cierre de un compromiso no cierra automáticamente la necesidad que decía atender, ni al revés.** Son dos hechos distintos, y el enlace de `senal_resolucion` es **informativo, nunca disparador**. Una conexión `confirmada` habilita a proponer la resolución de la necesidad (Task 24) con `enlace_tipo='enlazada'`, y ahí empieza el circuito de cierre, con sus dos confirmaciones propias.

- [ ] **Step 3: El feed de coincidencias, sin red social**

`GET /api/v1/civic/senales/:idPublico/coincidencias` devuelve recursos y prácticas cuya celda cruza la de la necesidad. **Se siguen LUGARES y NECESIDADES, no personas** (decisión 10): la respuesta no trae autor, no trae `firma`, y no hay «qué publicó quien seguís».

- [ ] **Step 4: Verificar y commitear**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- conexiones
# «un sueño no se puede ofrecer ni pedir» (la FK compuesta); «la aceptación son
# dos filas»; «una conexión confirmada NO cierra la necesidad sola»; «las
# coincidencias no traen autor».
git commit -am "feat(api): un recurso se puede cruzar con una necesidad, que es para lo que existía"
```

---

# REBANADA 6 · El registro público

Depende de las tres anteriores y se reescribe entera contra `senales`. **Lo que D conserva intacto y es lo mejor que trae:** el piso de publicación por rol, las cinco guardas de lo que nunca sale, la partición de licencias y el archivo de procedencia con sus defectos conocidos publicados.

---

### Task 28: `MASCARA_PROVINCIAS` — el pie del feed que impide mostrar un país vacío

**Files:**
- Modify: `packages/civic-core/src/poblacion.ts`
- Create: `scripts/build/geo/generar-mascara-provincias.ts`
- Modify: `package.json` raíz
- Test: `packages/civic-core/src/__tests__/mascara-provincias.test.ts`

**Interfaces:**
- Produces: `MASCARA_PROVINCIAS`, `RESOLUCION_MASCARA = 0.5`, `CajaProvincia`, `provinciasQueTocan`.

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: Máscara de celdas y no bounding box**

La caja cruda de Buenos Aires va del paralelo 33 al 41 y se solapa con La Pampa, Río Negro, Santa Fe, Entre Ríos, Córdoba y CABA: **un recuadro en el centro de La Pampa listaría «Buenos Aires: 6.100 sin punto» en el pie.** Un aviso que aparece siempre y casi siempre sobra deja de leerse — y **éste es el aviso que impide que el feed muestre un país vacío**, porque con la ingesta actual la mayoría de las señales van a caer ahí. Con 0,5° la sobre-estimación baja al borde de la celda (~55 km) y sigue siendo una constante commiteada, sin GeoJSON en runtime.

Va en `poblacion.ts`, al lado de `PROVINCIAS_REF`: son la misma clase de cosa, una tabla de referencia territorial precomputada con las mismas 24 claves canónicas.

- [ ] **Step 2: El script reusa los helpers de `generar-provincias-api.ts`**

Reusando sus helpers de `capas/` y su normalización de nombres — **que es donde vive D-012 y donde CABA se rompe si se duplica**. Por eso va en `scripts/build/geo/` y no en `scripts/content/`.

- [ ] **Step 3: Del nombre al id, cacheado en memoria de módulo**

`provinciasQueTocan` devuelve **nombres**; el sobre publica ids. Las 24 no cambian, se cargan una vez por proceso desde `geographic_locations` pasando por `normalizeProvinceName`, y se reusan — **no es un lookup por request**. Si una clave no resuelve, la respuesta **no la omite**: trae el renglón con `provinciaId: null` y el nombre, **porque omitirla borraría en silencio a la gente de esa provincia**.

- [ ] **Step 4: Verificar y commitear**

```bash
cd v2 && pnpm geo:mascara && pnpm --filter @v2/civic-core test
# «provinciasQueTocan sobre-estima, nunca sub-estima»: para cada provincia,
# centroide + recuadro de 0,01° → la provincia está en el resultado.
# «Las 24 claves resuelven a 24 ids», y falla NOMBRANDO la clave huérfana: un
# tipeo acá borra en silencio el renglón de una provincia entera del pie del feed.
git commit -am "feat(civic-core): qué provincias toca un recuadro, sin GeoJSON en runtime"
```

---

### Task 29: La migración 0017 — `volcados` y los índices del feed

> **ES LA `0018` (corrimiento del 2026-08-12, ver la Task 11).** El razonamiento sobre `senales_feed_idx` no cambia —lo crea esta migración y no la de la señal—, sólo su número.

**Files:**
- Create: `packages/db/src/schema/volcados.ts`
- Modify: `packages/db/src/schema/{senales,index}.ts`
- Modify: `packages/db/drizzle.config.ts`
- Create: `packages/db/migrations/0017_el_registro.sql` + journal

**Resolución de contradicción (`capa` como concepto, y qué id sale al público):** gana **B**. `volcados.filas_por_capa` pasa a **`filas_por_clase`**; `FilaPublicable.capa` pasa a `clase`; `id: "voz:412"` pasa a `idPublico`. La capa ERA la tabla; con una sola tabla la agrupación es la clase, que es lo que el filtro siempre quiso decir.

**Reversibilidad:** IRREVERSIBLE (crea una tabla), REVERSIBLE (los índices).

- [ ] **Step 1: `volcados`, una fila por ARCHIVO y no por corte**

Cuando el volcado se parta por mes el índice ya lo soporta sin migrar. **Un corte tiene SEIS archivos, no tres:** los tres formatos, el hermano `sin-punto.csv` que el GeoJSON exige, y los dos de procedencia (uno para leer, uno para parsear). El dominio de `formato` los nombra a todos; **si no, el segundo INSERT choca contra el índice único y el corte aborta a mitad.**

Los cuatro CHECK: `estado in ('generando','listo','fallido','purgado')`, el dominio de `formato`, `causa` de seis valores, y **`estado <> 'listo' or url is not null`** — un corte listo sin URL sería una descarga que 404ea.

**Lo que esta tabla NO guarda: el contenido.** Un volcado diario de ~8 MB × 3 formatos, retenido 30 días, son 720 MB: rompe el techo con un archivo derivado, o sea con lo único que se puede regenerar. **La regla queda escrita: la base guarda lo que no se puede reconstruir.**

- [ ] **Step 2: Los índices del feed, sobre `senales` y ya no cuatro**

Con una sola tabla son **dos** y no cuatro:

```sql
-- El caso `pais`.
create index senales_feed_idx on senales (creada_en desc, id desc)
  where estado <> 'retirada' and retenida_en is null;

-- El caso `recuadro`, que es el DEFAULT del feed y el que ningún índice
-- cronológico cubre: `lat` recorta por latitud y el orden sale del índice;
-- `lng` queda como filtro residual.
create index senales_feed_geo_idx on senales (lat, creada_en desc, id desc)
  where lat is not null and estado <> 'retirada' and retenida_en is null;
```

Con 100.000 filas y un recuadro de barrio, sin el segundo el planner tiene dos opciones y las dos son malas: escanear el índice cronológico entero descartando por bbox fila por fila hasta juntar 41, o traer los candidatos del bbox y **ordenarlos** — el sort de tabla que estos índices vienen a evitar. Con el debounce de 400 ms, cada arrastre dispara ese plan de nuevo.

El índice geo que ya existe (`senales_geo_idx on (lat,lng) where lat is not null`) sirve para el dibujo del mapa y se queda; no sirve para el feed.

**`senales_feed_idx` es nombre libre acá y no hace falta ningún `drop index if exists`,** porque la Task 11 Step 4 decidió que la `0015` no lo crea. Esta tarea se acordaba de que `senales_geo_idx` ya existía y no se acordaba de éste: **la spec B declara un `senales_feed_idx on (creada_en desc)` sin predicado en la misma `0015`,** y con los dos escritos tal como están las specs, la `0017` aborta con `relation "senales_feed_idx" already exists`. Si alguien implementa la `0015` copiando el bloque de índices de B sin leer la corrección, la falla aparece **dos rebanadas después** de la causa, que es la peor distancia posible entre un error y su origen.

- [ ] **Step 3: Verificar el plan, que es lo único que prueba que el índice sirve**

```bash
cd v2 && pnpm --filter @v2/db exec tsx scripts/explain-feed.ts
# Las dos variantes, porque el caso `recuadro` es el DEFAULT y no lo cubre el primero.
# Expected en las dos: Index Scan, NO Seq Scan + Sort.
```

- [ ] **Step 4: Commit**

```bash
git add v2/packages/db/src/schema/volcados.ts v2/packages/db/migrations v2/packages/db/drizzle.config.ts
git commit -m "feat(db): el índice de lo bajable, y los dos índices que el feed necesita de verdad"
```

---

### Task 30: El feed — keyset simple, cursor firmado, y el predicado que sí mira `retenida_en`

**Files:**
- Create: `packages/db/src/repositories/civic-feed.ts`
- Create: `packages/db/src/repositories/civic-conteos.ts`
- Modify: `packages/db/src/repositories/civic-map.ts`
- Create: `apps/api/src/features/open-data/v1/{routes,service,serializadores,validation}.ts`
- Modify: `apps/api/src/app.ts`, `apps/api/src/middleware/rate-limit.ts`
- Test: `apps/api/tests/registro-feed.test.ts`

**Resolución de contradicción (el cursor de dos capas sobre una tabla única):** todo el diseño de D §4.3.2 —el rango de capa `c`, los tres predicados de keyset asimétricos, el merge en memoria de dos listas, el `2 × 41 = 82` filas leídas para devolver 40— **existe únicamente porque hay dos tablas**. Sobre `senales` el keyset es `(creada_en desc, id desc)` y punto. **No es un error de razonamiento: el análisis de los tres predicados es correcto y el bug que denuncia es real.** Se conserva como nota en el archivo, porque vuelve a hacer falta el día que haya una segunda fuente.

**Y el cursor se firma con HMAC.** `base64url` no es cifrado: `{t: "…T14:32:11.004Z", i: 412}` es legible por cualquiera con un decodificador de dos líneas, así que D publicaba el serial y el milisegundo exacto por la puerta de atrás **mientras §4.7 declaraba que ninguno de los dos sale** — que es exactamente el ataque de correlación que B describe. Firmarlo cuesta nada y cierra el flanco sin cambiar el contrato («devolvé el cursor que te di»).

**Hueco bloqueante que cierra: una señal retenida por `unsafe` seguía saliendo por el feed y por el volcado.** C define la retención como «sale de `/map/signals`, de `/map/cells` y de la cola de verificación», y D no conoce esa columna: su predicado miraba `status`, y `retenida_en` no aparecía ni en `FilaPublicable`, ni en el predicado, ni en la guarda de filas. **El único canal por el que alguien puede decir «esto expone a una persona» apagaba las dos superficies internas y dejaba la señal en el registro público descargable, firmado con sha256 y retenido para siempre en los cortes mensuales — que es la superficie donde más daño hace.** Durante las 72 h de revisión, y después si la revisión no llega, a las 09:00 UTC se estampaba en un CSV que ya no se puede retirar.

**Resolución de contradicción (si sobrevive `dreams.status`):** gana B, no hay columna de moderación, y **eso deja el predicado de D sin nada que leer**. Se reapunta, y de paso gana:

```sql
-- Predicado incondicional de publicabilidad. No es parametrizable por nadie.
estado <> 'retirada' AND retenida_en IS NULL
```

**Resolución de contradicción (qué unidad es `confirmaciones`):** `confirmaciones` queda reservado para la definición de celda de C —**señales** en {`corroborada`,`resuelta`}, así `confirmaciones ≤ verificables` por construcción— y el campo por fila de D se renombra a **`confirmacionesContadas`** (filas de confirmación con `cuenta=true` en la ronda vigente). Son dos cosas distintas con el mismo identificador alimentando dos números públicos: **es literalmente el defecto que originó todo este trabajo.** Y no es cosmético: quien baje el CSV y sume la columna creyendo que reproduce el denominador de la nitidez obtiene un número que no se parece en nada al del mapa, y **no hay forma de darse cuenta mirando la pantalla**.

**Resolución de contradicción (`origen` significa dos cosas):** B se queda con `origen` en la base (el canal de ingesta). El campo de D se renombra a **`procedencia`** (`{ tipo: 'persona' } | { tipo: 'derivado'; de }`), y `cobertura.porCanal` lee `senales.origen`. Es el defecto de origen reproducido en la spec que existe para no reproducirlo: dos ejes ortogonales compartiendo palabra. **Efecto colateral:** bajo la Task 11, `proposals` muere y no queda ningún writer de señales derivadas por clustering, así que la variante `derivado` se queda sin fuente por ahora y el ejemplo que la ilustra ya no puede ocurrir. El campo se conserva —lo va a necesitar la deliberación diferida— con su único valor actual `{ tipo: 'persona' }`.

**Resolución de contradicción (`pulso` y `mandato` como capas del mapa):** gana **B: salen también del mapa.** D argumenta bien para dejar `mandato` fuera del registro —publicar una síntesis de LLM en el mismo array y con el mismo peso que la frase de un vecino sería que la IA determine la verdad de una señal— **y el argumento vale igual de fuerte para el mapa, que es la superficie que más gente mira.** D tenía razón en el fondo y se detenía una superficie antes. Un mandato es una lectura agregada, del mismo género que el brillo, y va a su propia superficie.

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: El ámbito es una unión, no un bbox**

Con `recuadro`, la respuesta trae **dos cosas separadas y nombradas**: `senales` (las que tienen punto adentro) y `sinPunto` (cuántas sin coordenada hay en las provincias que el rectángulo toca, por provincia). **No se listan mezcladas, no se suman, no se paginan.** Se muestran al pie en un renglón plegado con la frase que `conteo.ts:134` ya escribió: *no sabemos si son de esta zona*.

El repositorio ya lo dice, en `civic-map.ts:115-118`: pedir un recorte descarta las señales sin coordenada. **La política existe del lado del lazo y no del lado del bbox: el `WHERE lat is not null` las tira y nadie las nombra.** Un feed «cerca tuyo» que use bbox sin resolver esto **borra del registro a toda la gente que cargó su voz eligiendo sólo la provincia** — que hoy, con `precision` default `'province'`, es *toda* la gente.

- [ ] **Step 2: El conteo autoritativo tiene UNA sola fuente y no es el feed**

`GET /senales/conteos`. **El sobre de una página de feed no lleva `total`**: llevarlo ahí lo ataría al corte de esa paginación, y el mapa, que no pagina y por lo tanto no tiene corte, contaría sobre otro conjunto — dos números otra vez, ahora con más ceremonia. El `ContadorEnVista` y la cabecera del feed llaman los dos a `/conteos` con los mismos parámetros, y por eso son el mismo número.

Eso arregla de paso que `listSignals` topea en 500 y el contador cuenta filas del array recibido: con 40.000 señales diría «2.000 en vista» para siempre, **en silencio, sin ninguna marca de que está topeado. Es una mentira sin mecanismo de aviso.**

`total` viene acotado por cota (`COTA+1`, sin `count(*)` sin techo): «al menos 50.000» es más veraz que un exacto que cuesta un escaneo, y le pone presupuesto al abuso.

- [ ] **Step 3: El cursor**

```
firmar(base64url({ t, i, corte, h }))   con HMAC del secreto del servidor
```

`corte` viaja **adentro** y no como parámetro de URL: si fuera parámetro, o entra al hash de filtros y entonces toda página 2 es 400 (la 1 se pide sin él), o no entra y entonces un cliente puede cambiarlo entre páginas y mezclar dos conjuntos. **Adentro no puede pasar ninguna.** `h` cubre todo lo que cambia el conjunto y **no cubre `limite`**: cambiar el tamaño de página no cambia qué filas hay.

**Cursor y no offset:** el orden es descendente por fecha, o sea que lo nuevo entra *arriba*, y una sola inserción entre la página 1 y la 2 hace que la fila 40 aparezca dos veces y que una se pierda.

- [ ] **Step 4: El feed es cronológico y no tiene una sola línea de ranking**

`creadaEn DESC`. Nada más. No hay score, no hay engagement, no hay boost por adhesiones, no hay «destacadas», no hay reordenamiento por afinidad. `listSignals` ya ordena así **y no hay nada que desarmar: hay que evitar agregarlo.**

**Corte fijo, y no hay badge de «3 nuevas».** La cabecera dice la hora de corte. **Una hora de corte es un dato; un contador de nuevos es un empujón.** Autocarga acotada: las primeras tres páginas al llegar al fondo, de la cuarta en adelante un botón que dice cuántas llevás y cuántas hay. Tres páginas son 120 filas ≈ nueve pantallas: quien pasó nueve pantallas está leyendo a propósito y merece que se lo pregunten. **Nada se carga con la pestaña oculta.** Sin autoplay: la regla se escribe ahora, antes de que haya media.

- [ ] **Step 5: `FilaPublicable` es una lista blanca, sin spread en ningún punto del camino**

Un campo nuevo en la tabla no aparece en ninguna respuesta ni en ningún volcado hasta que alguien lo escribe a mano en el mapeo. **Una lista negra falla el día que alguien agrega la columna que nadie previó. Una lista blanca falla al revés: en la dirección segura.**

**Resolución del defecto A×D (`ciudad` no resuelve, y si se arregla mal, expone):** el filtro de D era `level in ('city','localidad')` y **no matchea ni un solo valor del CHECK de A** — `'city'` deja de existir y `'localidad'` nunca existió (el término es `'locality'`, en inglés, por paridad con `'province'`). Ese LEFT JOIN devolvería NULL para todas las filas y el registro publicaría `ciudad: null` para siempre, en silencio, **sin que ninguna guarda lo cace: la de A verifica el CHECK, la de D verifica exclusión de campos, y ninguna verifica que un campo incluido traiga valor.**

Y el arreglo obvio —ampliar el `in` para que entre lo que hay— **publica los 11.324 asentamientos de BAHRA como «Ciudad»**: para un paraje de cuarenta casas, el nombre del asentamiento es bastante más fino que los 500 m del piso de publicación, y entra por el campo de texto que el piso no mira. La resolución, que toma lo mejor de los dos informes:

- `ciudad` se resuelve **sólo de `level = 'locality'`**, con el valor tomado de una constante compartida y no de un literal tipeado dos veces.
- Si `city_id` apunta a un `settlement`, **se sube al `parent_id`** (su localidad censal) y se publica ésa.
- **`FilaPublicable` gana `departamento`**, resuelto de `department_id`, para no rotular como ciudad lo que es un departamento — que es lo que pasaría cuando la protección de dirección hace que `city_id` suba a `department_id`.
- Un test de arranque afirma que **todo valor usado en un filtro de nivel está en el CHECK de `geographic_locations`**.

- [ ] **Step 6: Verificar**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- registro-feed
# «el cursor no repite ni saltea con inserciones concurrentes» — 100 sembradas,
#   página 1 (40), se insertan 5 posteriores, página 2: las 5 no aparecen y las 80
#   son 80 ids distintos. El MISMO test contra offset DEBE fallar: se escribe
#   primero contra offset para demostrar el bug.
# «el cursor con filtros distintos es 400»; «un cursor con firma inválida es 400»;
# «una señal provincial nunca se cuenta como si estuviera adentro»;
# «una señal retenida no aparece en el feed ni en /senales/:idPublico (404, no 403)»;
# «ciudad no sale null para una fila con city_id de una locality».
```

- [ ] **Step 7: Commit**

```bash
git add v2/packages/db/src/repositories v2/apps/api/src/features/open-data/v1 v2/apps/api/tests/registro-feed.test.ts
git commit -m "feat(api): el registro se lee entero, cronológico, y lo retenido no sale por ningún lado"
```

---

### Task 31: El contexto territorial en la web y la cuarta sección

**Files:**
- Create: `apps/web/src/pages/ElMapa/contexto-territorio.tsx`
- Create: `apps/web/src/pages/ElMapa/consulta-territorial.ts`
- Create: `apps/web/src/pages/ElMapa/sections/RegistroPublico.tsx` + `registro/*`
- Modify: `apps/web/src/pages/ElMapa.tsx`
- Modify: `apps/web/src/pages/ElMapa/instrumento/{Instrumento,Chrome}.tsx`, `useVistaMapa.ts`
- Modify: `apps/web/src/pages/ElMapa/sections/FeedVoces.tsx`
- Modify: `apps/web/src/lib/queries/civic-map.ts`

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: El único cambio estructural que el feed obliga**

`useVistaMapa()` se crea adentro de `Instrumento.tsx:32`: el `recuadro` vive en el estado de un componente perezoso que se monta con `lazy()` y **no sube a `ElMapa.tsx`**. Cualquier cosa fuera del instrumento que quiera decir «cerca tuyo» tiene que inventar su propia noción de cercanía, y van a existir dos.

**El riesgo se mitiga con el orden:** el contexto se agrega **antes** de tocar `Instrumento.tsx`, con el proveedor devolviendo exactamente lo que hoy devuelve el hook local. El instrumento se toca en un commit propio y **sus tests existentes pasan sin cambios**. Es la pieza más cara de la página.

- [ ] **Step 2: Una consulta, dos consumidores, una función de serialización**

El feed y el mapa **no son dos vistas de dos consultas**: son dos representaciones de una `ConsultaTerritorial` única que baja por contexto. Que sea una sola consulta no significa una sola request —el mapa necesita todo lo del encuadre para dibujar, el feed cuarenta filas para leer— pero **la misma función pura `aParametros(consulta)`**. Hay una guarda que lo afirma: si algún día un filtro se aplica de un lado y no del otro, el test falla antes que la pantalla mienta.

- [ ] **Step 3: Los siete gestos, decididos**

| Gesto | Qué pasa |
|---|---|
| Arrastrás o hacés zoom | el feed se remonta desde la página 1 con corte nuevo, **con debounce de 400 ms** |
| Mientras refetchea | **se conservan las filas anteriores** y la cabecera marca «actualizando». Nunca hay vacío intermedio: en una red mala eso haría parpadear el feed en cada paneo |
| maplibre monta y emite su primer `recuadro` | **no cambia nada.** Un feed que se resetea solo al terminar de montar el instrumento perezoso reinicia una lectura que nadie interrumpió, y haría falsa la justificación entera de «la cercanía es la que la persona eligió» |
| Hover o foco en una fila | el punto gana anillo. **El mapa no se mueve** — moverlo por un hover recargaría el feed que estás leyendo: un bucle |
| Abrís el pliegue de una fila | `easeTo` al punto **sin cambiar el zoom** y sólo si está fuera del encuadre. Es un gesto deliberado, y **el feed no se remonta** |
| Clickeás un punto fuera de las páginas cargadas | se pide `GET /senales/:idPublico` y la cabecera muestra esa señal sola. **No se autopagina para ir a buscarla:** sería scroll que vos no pediste |
| Enfocás una señal sin coordenada | se enciende el lavado de su provincia y la fila dice «a nivel provincia» |

No se adivina la ubicación de nadie por IP ni se pide geolocalización: **la cercanía es visible y es la que la persona eligió.**

- [ ] **Step 4: `FilaIndiceExpandible` es la unidad, y no hay que inventar nada**

Grid 56/1fr/40 (44/1fr/32 bajo 560px), botón real de ancho completo, `aria-expanded` + `aria-controls` ya cableados, panel con `.anim-fadeup-rapido`. Una señal = una fila: `num` la hora, `encabezado` el `ChipTipo` + `ChipEstado` + lugar + texto recortado, y el pliegue lleva texto entero + `etiquetaDePrecision` + `etiquetaDeDireccion` + adhesiones + acciones. Con eso el feed hereda accesibilidad y ritmo tipográfico gratis.

La cabecera de cobertura sale de `renglonesDeConteo` (`instrumento/conteo.ts`), que **devuelve renglones por clase de precisión y NUNCA un total indiferenciado**. El feed vacío monta `Vacio`, que contesta la pregunta de la lente en su versión de cero en vez de decir «sin datos» — **con las tablas en cero, es el estado por defecto del día 1 y el componente más importante del lanzamiento, y ya existe.**

- [ ] **Step 5: `FeedVoces` se declara teaser, no se infla ni se borra**

Gana el remate «las últimas 12 · leer todo abajo ↓». **Dos feeds que cuenten distinto en la misma página es exactamente el tipo de mentira que el resto del código se esfuerza por evitar**, y `FeedVoces` vale por su costo cero —reusa las queries del mapa, no pide un byte extra—, propiedad que se pierde si se lo infla.

- [ ] **Step 6: La cuarta sección va DESPUÉS del instrumento**

Razones concretas: el instrumento es la única superficie oscura de la página y lo es a propósito —meter el feed adentro lo obliga al chrome oscuro y a competir con el panel lateral de 340 px, mientras que colgarlo abajo lo devuelve al papel, que es donde `FilaIndiceExpandible` ya sabe vivir—; **el ancla `#instrumento` es el destino del `Redirect` de `/explorar-datos` y hay un test que lo verifica**, así que insertar ANTES mueve el ancla y DESPUÉS no toca nada; y es la lectura natural: mirás el mapa, elegís un encuadre, leés lo que hay ahí.

- [ ] **Step 7: Verificar y commitear**

```bash
cd v2/apps/web && pnpm type-check && pnpm test:unit
# «el mapa y el feed piden lo mismo» (100 consultas al azar con seed fijo: las URLs
#   de los tres hooks son idénticas salvo `cursor` y `limite`);
# «mover el mapa recorta el feed»; «el montaje del mapa NO resetea el feed»;
# «refetchear no vacía el feed»; «el hover no mueve el mapa»;
# «no hay badge de nuevos» (guarda de texto: falla si aparece «nuevas»/«nuevos»
#   seguida de un número).
git commit -am "feat(web): el encuadre del mapa es la cobertura declarada del feed, y hay un solo número"
```

---

### Task 32: El piso de publicación, `/esquema` y las cabeceras de la API vieja

**Files:**
- Modify: `apps/api/src/features/open-data/v1/serializadores.ts`
- Modify: `apps/api/src/features/open-data/routes.ts`
- Create: `packages/shared/src/open-data/campos.ts`
- Test: `apps/api/tests/piso-publicacion.test.ts`

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: El serializador NO le cree a `precision`**

Hoy `publishedPrecision` engrosa **sólo** con `role === 'subject'` **y** `sensitivity === 'high'`; el panel web no manda ninguno de los dos y el servidor defaultea a `subject`/`low`; y `SelectorPrecision.tsx:57` **auto-promueve a `'exact'`** apenas alguien clava un punto. Encadenado: **una `necesidad` sobre la casa de quien la carga se guarda con la coordenada literal a seis decimales y nada la engrosa nunca.** El engrosado por precisión almacenada no es una protección: es un espejo de lo que el cliente declaró, y cualquier volcado que se apoye en ella publica un padrón de domicilios.

```
si rol === 'subject' y la precisión almacenada es más fina que '500m'
   y NO hay `engrosado_rechazado`   → precisión publicada = '500m'
otros roles → la precisión almacenada
después, siempre: obfuscatePoint(punto, precisiónPublicada)
```

**El piso es por ROL y no por `sensitivity`,** porque `sensitivity` la elige quien envía y no puede ser la única llave de la protección de quien envía. `rol` sí es del sistema. `capture` (la esquina del pozo) y `meeting_point` (el punto de entrega) siguen saliendo finos, porque **publicarlos exactos es el objetivo**.

**Y honra `engrosado_rechazado` y ninguna otra columna** (resolución de la Task 11): D tenía razón en que «la persona lo eligió» era una afirmación que la base no podía sostener —hoy `overridable` es siempre `true` y nadie persiste el rechazo, y un consentimiento que no se puede auditar no es un consentimiento— pero negarle para siempre a alguien publicar su propia esquina es la otra mitad del error. La columna cierra la excepción y la hace auditable.

`obfuscatePoint` se aplica **igual aunque el punto ya venga engrosado**, porque es idempotente y no cuesta nada: es el cinturón sobre los tirantes para el día que una ingesta nueva guarde un punto crudo por error. **Que sea determinístico importa y va escrito en la procedencia:** dos descargas del mismo dato dan el mismo punto, así que **nadie recupera el original promediando N descargas**. Un jitter aleatorio sí lo permitiría. Ésa es la diferencia entre proteger y aparentar que se protege.

`incertidumbreKm` sale de la precisión **publicada**; la almacenada nunca se publica. **El halo ES el dato:** publicar el punto sin su incertidumbre invita a leerlo como exacto.

- [ ] **Step 2: `/esquema` sale del mismo descriptor runtime que el tipo**

```ts
export const filaPublicableSchema = z.object({ /* con .describe() por campo */ });
export type FilaPublicable = z.infer<typeof filaPublicableSchema>;
export const CAMPOS_PUBLICABLES = Object.keys(filaPublicableSchema.shape);
```

Una `interface` de TypeScript se borra en compilación: **`/esquema` no puede «generarse desde `FilaPublicable`» si `FilaPublicable` no existe en runtime**, y lo que iba a pasar es que alguien escribiera el diccionario a mano y se desincronizara en el tercer campo nuevo. Con el descriptor como fuente, no pueden divergir: son el mismo objeto.

El `.describe()` de `confirmacionesContadas` lleva **las dos definiciones nombradas** —la de fila y la de celda— para que nadie las vuelva a mezclar.

- [ ] **Step 3: El esquema `0` es la salida honesta**

Si el registro sale antes de que la máquina de estados esté completa, sale con `esquema: 0`, `/esquema` lo declara pre-release, no se emite `X-Registro-Esquema`, y **la política de compatibilidad no rige hasta el esquema 1**. Un esquema que puede romper y lo dice es honesto. **Lo que no se hace es inventar un valor de enum «pendiente»:** no es ninguno de los estados de la regla 4, y sacarlo después sería un cambio rompedor que forzaría `/api/v2` a semanas del lanzamiento.

- [ ] **Step 4: Lo viejo se congela, y una cosa no espera al sunset**

`/api/open-data/*` gana `Deprecation: true`, `Sunset: Thu, 11 Feb 2027 00:00:00 GMT`, `Link: </api/v1/open-data/senales>; rel="successor-version"`. (El 11 de febrero de 2027 **es jueves**; un HTTP-date con el día de semana equivocado lo rechaza un parser estricto, y los parsers son los únicos que leen esta cabecera.)

**El comportamiento del adaptador ya lo describió la Task 16** y esta tarea sólo pone las cabeceras y la fecha: una implementación, dos documentos, una guarda.

`submittedAs` ya salió en la Task 16. **Una fuga de identificadores no se depreca, se corta.**

- [ ] **Step 5: Verificar**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- piso-publicacion
# «el piso protege aunque la fila diga exact»: señal con `precision='exact'`,
#   `location_role='subject'`, `sensitivity='low'` y punto conocido → las
#   coordenadas publicadas NO son las sembradas, la precisión publicada es '500m'
#   y `incertidumbreKm` es la de '500m'. **Escrito contra el código de hoy, este
#   test tiene que fallar antes del arreglo.**
# «una señal de rol capture no se engrosa»; «engrosar es idempotente para las seis
#   precisiones»; «una señal con engrosado_rechazado sale exacta y sólo si es propia».
```

Y la consulta que mide el tamaño del problema:

```sql
select count(*) from senales where location_role='subject' and precision in ('exact','100m');
```

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(api): el punto sale engrosado por un piso propio, no por lo que declaró el cliente"
```

---

### Task 33: El volcado diario, sus seis archivos y `PROCEDENCIA.md`

**Files:**
- Create: `apps/api/src/features/open-data/v1/volcado.ts`
- Create: `apps/api/src/vercel/cron-volcado.ts`
- Create: `api/cron/volcado.mjs`
- Modify: `scripts/build/bundle-api.ts`, `vercel.json`, `apps/api/package.json`
- Create: `docs/adr/00XX-vercel-blob.md`
- Test: `apps/api/tests/volcado.test.ts`

**Resolución de contradicción (la métrica norte tiene dos denominadores):** **el volcado CITA `/metrica-norte`, no lo recalcula.** C la sirve desde `senal_resolucion` como cuatro buckets; D publicaba en `PROCEDENCIA.md` «cuántas filas `resuelta` tienen una sola confirmación» contado sobre las filas del volcado con su propia definición. Dos números públicos sobre el mismo hecho, de dos tablas distintas con dos unidades distintas, **y el que va a terminar citado afuera es el del archivo, no el del endpoint.** `PROCEDENCIA.md` copia los cuatro buckets del endpoint.

**Reversibilidad:** REVERSIBLE (el código), IRREVERSIBLE (los archivos publicados: un mensual, una vez publicado, no se puede retirar de la mano de quien lo bajó — y por eso ese hecho vive en el texto de consentimiento de la Task 10 y no sólo en `PROCEDENCIA.md`).

- [ ] **Step 1: Volcado periódico, no generación al vuelo**

Tres razones: la función no está hecha para streamear (responde con `res.json()`); el presupuesto de tiempo es chico y no está declarado (`vercel.json` sólo declara `maxDuration` para `rankings.mjs`); y **una descarga al vuelo no es reproducible** — dos personas que bajan «el registro» con cinco minutos de diferencia obtienen dos archivos distintos y no pueden compararlos ni citarlos. **El objetivo de esta pieza es que alguien pueda escribir «según el corte del 11 de agosto de 2026» y que eso signifique algo.**

- [ ] **Step 2: Los tres formatos, y por qué tres**

- **CSV** — la planilla. Es lo que abre un periodista, un concejal y una maestra. **Sin ella, «datos abiertos» significa «abiertos para programadores».**
- **GeoJSON** — sólo las señales con punto: una señal provincial no es un `Feature`. Va con un hermano **obligatorio** `sin-punto.csv` con el conteo por provincia, para que quien lo abra en QGIS no crea que el registro son sólo los puntos. Si saliera solo, sería el mismo borrado silencioso.
- **JSONL** — el único que se lee sin cargar el archivo entero en memoria **y** sin un parser de CSV que sepa de comillas y saltos adentro del campo. **El `texto` de una señal puede tener comas, comillas dobles y saltos: el CSV es la forma más fácil de que alguien lo parsee mal y publique un análisis roto.** Cuesta un serializador de doce líneas.

Los campos de unión salen como **dos columnas** en CSV: `estado`/`estado_razon`, `procedencia`/`procedencia_detalle`, `texto`/`texto_omitido`, `corroborable` con tres valores documentados y `confirmacionesContadas` **vacío** cuando es inaplicable. **Una planilla no puede leer una celda vacía como cero si la columna de al lado dice por qué está vacía.**

**Corrección obligatoria a la definición que D §7.2.9 deja escrita: `corroborable` es `clase === 'hecho' || clase === 'acto'`, no `clase === 'hecho'`.** D se escribió cuando la clase `acto` no corría la máquina de corroboración, y la reconciliación se la dio: `estados_senal` le da a `acto` los estados `por_verificar` y `corroborada` (Task 11, Step 2) y la guarda de la Task 8 es «un compromiso llega a cumplido — alta → `por_verificar` → confirmación ajena → `corroborada` → cierre». Con la definición vieja, **un compromiso que tres vecinos confirmaron se publica con `corroborable: false` y `confirmacionesContadas` vacío** —la afirmación invertida sobre el eje de calidad, en el archivo que se firma con sha256 y se retiene para siempre— y la guarda «`estado === 'resuelta'` implica al menos una confirmación» queda **roja de forma permanente**, o sea `pnpm verify` inalcanzable. `deseo` y `meta` siguen en `false` y vacío. El `.describe()` de la Task 32 dice **de qué clases sale un número y de cuáles sale vacío**, porque el CSV lo lee una planilla y una planilla no lee prosa.

- [ ] **Step 3: Los tres requisitos que no son detalles de implementación**

1. **Toda página filtra por el corte y pagina por keyset**, nunca por `offset`. El cliente es `neon-http`: HTTP sin sesión, cada página es su propia transacción y no hay snapshot que sostener entre las diez. **La consistencia la da el predicado, no la transacción.** Con offset y una inserción entre la página 3 y la 4, el CSV duplica una fila y pierde otra — **y el archivo lleva `filas` y `sha256` publicados, así que el error queda firmado y citable.**
2. **Aislamiento por fila.** `try/catch` por fila: la que falla se omite y se cuenta en `filasOmitidas`, que `PROCEDENCIA.md` publica por clase de razón (**cero omitidas es un renglón que dice cero**). Sin esto, una fila con `lat` fuera de rango escrita por una ingesta futura tumba la descarga del día entero — **y la palanca la tiene cualquiera con `curl`.**
3. **Las filas se escriben barajadas dentro de cada chunk**, con orden determinístico `sha256(id ++ corte)`. Con las filas de una sesión de campo contiguas y ordenadas por fecha, **unir los puntos reconstruye el recorrido a pie de un voluntario**. Determinístico para que dos generaciones del mismo corte den el mismo archivo y el sha256 siga significando algo.

**La restricción que aprieta no es el tiempo, es la memoria:** 118 MB de strings en el heap de una función, con la copia comprimida al lado, es imprudente. El generador **escribe por chunks a un stream** y nunca arma el archivo completo.

- [ ] **Step 4: La guardia del cron, que no es opcional**

`Authorization: Bearer ${CRON_SECRET}`; sin secreto válido, 401 y log. **Los paths de cron están excluidos del rewrite de `vercel.json`, o sea que la función es alcanzable por GET desde cualquier lado:** sin la guardia, un `while true; do curl …; done` lee las tablas enteras contra la misma Neon que sirve el sitio, comprime, sube al blob pago **en cada vuelta**, y como el `corte` sería el `now()` de cada corrida **el índice único no colisionaría nunca y `volcados` se llenaría de cortes basura que `/datos-abiertos` listaría como buenos.**

Dos defensas más: **idempotencia por día UTC** y **advisory lock** sobre una clave fija.

- [ ] **Step 5: Retención, con su mecanismo**

Los **7 cortes diarios** más recientes, más el **corte del día 1 de cada mes**. Por qué 7 y no 30: quien necesita un corte de hace más de una semana en realidad necesita una serie, y para eso están los mensuales. **El barrido corre en el mismo cron, después de subir el corte del día:** sin ese paso, al día 8 `/volcados` listaría filas `listo` con `url` y `sha256` de archivos borrados.

**Se publican con extensión `.gz` explícita y sin `Content-Encoding: gzip`:** si el blob descomprimiera en tránsito, el archivo que llega al disco no sería el que hashea el `sha256` publicado, **y un hash que no se puede verificar contra lo que bajaste no sirve para nada.**

- [ ] **Step 6: `PROCEDENCIA.md`, en este orden**

1. **La advertencia de la regla 5, primera línea, antes de cualquier número:** «Esto mide quién habló, no qué pasa.» Y en el mismo párrafo, la distinción que el número no lleva pegada: **esto cuenta señales, no personas.**
2. El corte exacto y la versión de esquema.
3. Filas por clase, tipo, estado y procedencia, cada una como `Magnitud`. Más `filasOmitidas` por clase de razón.
4. **La política de engrosado aplicada**, con la frase de por qué el determinismo importa.
5. **Los campos excluidos, con su razón, uno por uno**, generados desde el mapa de clasificación de la Task 34. **No basta decir «anonimizado».**
6. La cobertura: provincias con señal y sin señal, **nombradas**.
7. Los cuatro buckets de la métrica norte, **citados de `/metrica-norte`**.
8. El sha256 y los bytes de cada uno de los seis archivos.
9. Las dos licencias y cuántas filas salieron **sin `texto`** por falta de cesión.
10. **Los defectos conocidos que afectan al dato**, linkeados a `docs/DEUDAS.md`: hoy `D-011` (Natural Earth erra en los bordes provinciales) y `D-026` (densidad provincial pareja, que subestima el brillo del campo).
11. **Lo que el sistema todavía no hace y afecta cómo se lee el archivo:** `DECLARACION_DELIBERACION.propuesta` de la Task 10, **textual**, más la frase que la traduce al lenguaje del volcado: *en este registro, las filas de clase `deseo` sólo acumulan adhesiones; ninguna columna de este archivo mide acuerdo, rechazo ni resultado de una deliberación, porque el sistema todavía no delibera*. Sin ese renglón, alguien va a leer la columna de adhesiones de una `propuesta` como un recuento de votos —es la lectura obvia— y a publicar «el 68% apoya X» sobre un dato que no dice eso.

**Los puntos 10 y 11 son los que hacen que este archivo valga: un volcado que no publica sus propios defectos conocidos ni lo que su sistema todavía no hace le pasa el problema al que lo baje.**

- [ ] **Step 7: Las dos licencias, porque son dos cosas**

La compilación y los metadatos salen bajo **CC BY 4.0** — eso el proyecto sí lo puede otorgar, es obra suya. **CC0 renuncia a la atribución, y la atribución es lo único que permite que quien lea un número publicado vuelva a la fuente y vea con qué cobertura se midió.**

**El texto de cada señal lo escribió una persona: el proyecto es custodio, no titular, y un custodio no puede licenciar obra ajena.** Sale bajo CC BY sólo para las filas con `cesion_licencia` (Task 10, Task 13). Las filas sin cesión salen completas menos `texto`, con `textoOmitido: 'sin cesión de licencia'`: sirven igual para cobertura, geografía y conteos, **y salir con menos es preferible a estampar una licencia inventada sobre un archivo con sha256 y retención perpetua.**

- [ ] **Step 8: Verificar**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- volcado
# «los tres formatos tienen las mismas filas» (el conjunto de GeoJSON es
#   exactamente el subconjunto con lat no nula, y la diferencia coincide con
#   sin-punto.csv); «el CSV sobrevive al texto adversario en TODO campo string»
#   (parametrizado sobre CAMPOS_PUBLICABLES, no sólo `texto`: comas, comillas,
#   salto, `=cmd()` al principio, U+202E — `tipoCrudo` es el campo más probable de
#   traer basura y el que un test que nombra sólo `texto` deja pasar);
# «los timestamps son gruesos y la sesión no se reconstruye» (dos señales de campo
#   con dos minutos de diferencia publican el MISMO creadaEn y NO quedan adyacentes);
# «una fila corrupta no tumba el corte»; «el cron sin CRON_SECRET es 401»;
# «una segunda invocación el mismo día no crea una segunda fila»;
# «todo archivo servible del corte tiene fila, bytes y sha256» — los SEIS;
# «el sha256 corresponde al archivo que se baja»; «los purgados no se ofrecen»;
# «resuelta sin confirmación no existe» (estado==='resuelta' ⟹ confirmacionesContadas >= 1);
# «el presupuesto de 60 s» con 200.000 filas en rama efímera: <40 s, heap <400 MB.
```

- [ ] **Step 9: Commit**

```bash
git add v2/apps/api/src/features/open-data/v1/volcado.ts v2/apps/api/src/vercel/cron-volcado.ts v2/api/cron/volcado.mjs v2/scripts/build/bundle-api.ts v2/vercel.json v2/docs/adr v2/apps/api/package.json
git commit -m "feat(api): el registro se baja entero, con su corte, su hash y sus defectos publicados"
```

---

### Task 34: Las cinco guardas de lo que nunca sale

**Files:**
- Create: `apps/api/tests/open-data-superficie.test.ts`
- Create: `apps/api/tests/open-data-filas.test.ts`
- Create: `packages/shared/src/open-data/columnas-clasificadas.ts`
- Modify: `.github/workflows/ci.yml`

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: Las cinco, porque una sola no alcanza**

1. **Guarda de tipo (no compila).** El descriptor runtime de la Task 32 es la fuente y el tipo se deriva de él, no al revés.
2. **Guarda de runtime sobre la respuesta CRUDA.** Siembra una señal con todos los campos sensibles poblados con centinelas irrepetibles, golpea cada endpoint público —**incluido `/senales/:idPublico`**— y cada uno de los tres serializadores, y afirma que la cadena centinela **no aparece en el body serializado, buscando en el texto crudo y no en el objeto parseado**. Buscar en el objeto parseado exige saber dónde mirar; **buscar la cadena encuentra el campo anidado que nadie previó.**
3. **Guarda de clasificación de columnas.** Introspecciona las columnas de `senales` y `volcados` desde el schema de Drizzle, las compara contra `COLUMNAS_CLASIFICADAS: Record<string, 'publicable' | 'privada'>` con su razón al lado, y **falla si aparece una columna sin clasificar**. Es la única que caza el campo nuevo **el día que se agrega a la tabla**. La lista de exclusiones de `PROCEDENCIA.md` se genera desde acá, no se escribe a mano.
4. **Guarda de FILAS.** Las tres de arriba son de columnas. Ésta siembra **una señal `retirada` y una `retenida_en` no nula** y afirma que su `idPublico` **no aparece en ningún endpoint ni en ninguno de los tres formatos**, y que `/senales/:idPublico` devuelve **404 y no 403** — un 403 sería un oráculo para confirmar la existencia probando ids. **Es la guarda que la resolución de la Task 30 reapunta:** D la había escrito sembrando `pending`/`rejected`/`draft`/`archived`, que bajo `senales` son estados imposibles, y sin reapuntar quedaba verde sin probar nada.
5. **Guarda de números pelados en el sobre.** Recorre el sobre serializado de `/senales` y de `/conteos` y falla si alguno de los campos citables llega como `number` sin procedencia. **La guarda que ya existe recorre el resultado de la Simulación y no cubre HTTP: ésta es la que faltaba.**

**Las cinco corren en CI**, y la 2 y la 4 **parametrizadas por los tres formatos**: un CSV que filtra un campo es la misma fuga que un JSON que lo filtra.

- [ ] **Step 2: `firma` — decidir de una vez, porque hoy no sale por ningún lado**

B le prohíbe a D publicarla en la descarga masiva, **con buen argumento**: `group by firma order by sum(adhesiones)` sobre un CSV público es un ranking público individual **que construiría el propio proyecto**, y `firma` es texto libre que la gente va a llenar con su nombre, porque para eso está. Pero B la manda al recurso individual, y D declara que `GET /senales/:idPublico` usa **el mismo serializador** que el feed, o sea la misma lista blanca — donde `firma` no está. **Resultado: el único campo de autoría del sistema no se publica en ningún lado, y el prompt que invita a firmar escribe en un campo que nadie ve.**

**Resolución:** `firma` entra a `FilaPublicable` **con la restricción escrita en el descriptor**: se serializa en `GET /senales/:idPublico`, y el serializador del **feed y del volcado la omite**, con la razón en `.describe()`. Es una excepción a «un solo serializador» y por lo tanto **necesita su propia guarda**, que va en el Step 1 punto 2: la cadena centinela de `firma` no aparece en el feed ni en ninguno de los tres formatos, y **sí** aparece en el recurso individual.

- [ ] **Step 3: Verificar y commitear**

```bash
cd v2 && pnpm --filter @v2/api test:integration -- open-data-superficie open-data-filas
git add v2/apps/api/tests/open-data-*.test.ts v2/packages/shared/src/open-data/columnas-clasificadas.ts v2/.github/workflows/ci.yml
git commit -m "test(api): cinco guardas, porque una sola no caza la columna que nadie previó"
```

---

### Task 35: `/datos-abiertos` y el primer dataset, que existe hoy

**Files:**
- Modify: `apps/web/src/pages/DatosAbiertos.tsx`
- Modify: `packages/shared/src/datasets/index.ts`

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: La página no habla con la API y hay que arreglarlo**

Hoy renderiza un catálogo estático de cuatro datasets, **los cuatro con `available: false`**, apuntando a un `apps/web/public/datasets/` que **no existe**. Sigue en el sistema de diseño viejo (`glass`, `iris-violet`, `Button` de shadcn), promete «changelog público + scripts de generación reproducibles» que no existen, y linkea a `/explorar-datos`, que es un `Redirect`. **Hoy no hay una sola descarga en toda la plataforma.**

`OPEN_DATASETS` deja de ser el catálogo y pasa a ser la **descripción** de los formatos; disponibilidad y URLs vienen de `/volcados`. `licenseHint: 'CC0'` pasa a las dos licencias de la Task 33.

- [ ] **Step 2: El catálogo geográfico es el primer dataset y se puede publicar HOY**

17.986 lugares + 326.832 calles (los dos medidos), con licencia, corte y procedencia. **Es el único de la plataforma que se puede publicar con las tablas cívicas en cero, y prueba el formato antes de que haya nada en juego.** `geo_catalogo_version.corrida` es el número de versión que su sobre cita — con el unique parcial de la Task 1, no hay dos.

Y un volcado cívico vacío pero bien formado y versionado **vale más que un botón deshabilitado**: el texto «se publican cuando alcanzan masa crítica (~1000 registros)» con las tablas en cero es un cheque a un año.

- [ ] **Step 3: Verificar y commitear**

```bash
cd v2/apps/web && pnpm type-check && pnpm test:unit
cd v2 && grep -rn "glass\|iris-violet\|explorar-datos" apps/web/src/pages/DatosAbiertos.tsx   # cero
git commit -am "feat(web): datos abiertos deja de prometer y empieza a servir"
```

---

### Task 36: El `DROP` de las seis tablas viejas

**Files:**
- Delete: `packages/db/src/schema/{dreams,pulso}.ts` y las partes muertas de `mandato.ts`
- Delete: `packages/db/src/repositories/{dreams,pulso}.ts`
- Create: `packages/db/migrations/0018_adios.sql` + journal
- Modify: `packages/db/drizzle.config.ts`

**Reversibilidad:** **IRREVERSIBLE Y DEFINITIVO.** Es la única tarea del plan que destruye estructura. Va última, después de que el volcado esté cerrado, y **sólo cuando estas dos consultas den cero**:

```sql
select count(*) from dreams;         -- 0
select count(*) from proposals;      -- 0
select count(*) from pulse_signals;  -- 0
```

- [ ] **Step 1: Verificar que ninguna superficie las lee**

```bash
cd v2 && grep -rn "from dreams\|dreams\.\|pulseSignals\|proposals\b" apps packages --include=*.ts --include=*.tsx \
  | grep -v migrations | grep -v '\.test\.'
# Expected: sólo los adaptadores de la Task 16, que ya leen `senales`.
```

- [ ] **Step 2: `DROP` de `dreams`, `pulse_signals`, `proposals`, `proposal_votes`, `proposal_status_history`, `mandate_suggestions`**

`territory_mandates` **sobrevive**: no es una señal, es una lectura agregada, y su cron pasa a leer `senales`.

- [ ] **Step 3: Verificar y commitear**

```bash
cd v2 && pnpm verify
git commit -am "chore(db): mueren las seis tablas que quedaron vacías y sin escritores"
```

---

### Task 37: Las entradas de `docs/DEUDAS.md`

**Files:**
- Modify: `docs/DEUDAS.md` (en la RAÍZ del repo, un nivel arriba de `v2/`)

**Reversibilidad:** REVERSIBLE.

- [ ] **Step 1: Un commit propio y con rutas explícitas**

`docs/DEUDAS.md` es archivo compartido y hay sesiones concurrentes (**D-010**): se commitea aparte, con la ruta explícita, nunca con `git commit -am`.

- [ ] **Step 2: Actualizar las tres que cambian**

1. **D-004** pasa a «Falta la **geometría** de departamentos» y suma una línea: las filas existen desde la rebanada 1. Severidad media, sin cambio.
2. **D-005** pasa a «Falta la **geometría** de municipios» y **baja de media a baja**, con las dos condiciones escritas en la entrada: no hay población por municipio (`poblacion.ts` sólo tiene `PROVINCIAS_REF`, así que `brillo` devuelve `sinDenominador` y no un número) y la supresión de grupo chico tiene que correr antes de pintar nada. **Agrupar no es publicar**, y publicar hoy un ranking municipal sería la regla 7 por la puerta de atrás: con 2.082 municipios y las tablas en cero, la cabeza sería un municipio donde habló una sola persona.
3. **D-011** suma la frase que la hace medible: `where ubicacion_origen = 'punto'` es el conjunto **exacto** de filas cuya provincia puede estar mal, y es exacto de verdad porque `senales_origen_provincia_chk` impide la fila con provincia y sin origen. **Cuando entre geometría del IGN, ese `where` es el backfill.**
4. **D-028** (la segunda entrada con ese id, `docs/DEUDAS.md:677`) se marca **resuelta** con su diseño citado: los cuatro estados de celda y la supresión sobre lo que entra. **Y de paso hay que arreglar el índice:** D-028 nombra dos deficiencias distintas y el índice sólo lista la primera, así que la segunda —la que importa para el endpoint— es invisible desde arriba del archivo. Es exactamente la colisión que D-016 documentó para D-013 y que la guarda `deudas-registro.test.ts` fue escrita para cazar, midiendo por título y no por conteo.

- [ ] **Step 3: Escribir las trece entradas nuevas**

Las de la sección «Deudas nuevas» de este plan, textuales, en el formato del archivo.

- [ ] **Step 4: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add docs/DEUDAS.md
git commit -m "docs(deudas): lo que las cuatro rebanadas dejan abierto, con id propio"
```

---

## Lo que este plan NO hace

- **El ciclo de deliberación de una `propuesta` — DECIDIDO 2026-08-11: no se construye, y se declara en pantalla.** Es el agujero más grande del alcance y hay que decirlo así. Los tres `POST` de deliberación se apagan con 410 (Task 16) y el reemplazo no entra: deliberar de verdad —quórum, ventana, quién puede votar, qué pasa con el empate— es un mecanismo entero. **Al terminar este plan, el sistema tiene la mitad de corroboración blindada con FK compuesta y unión discriminada, y la mitad de deliberación en cero: un deseo sólo puede recibir «yo también».** La decisión del dueño del producto ya está tomada y no es «entra una quinta spec»: **se acepta que la regla 11 se cumple a la mitad y el producto lo dice**, con `DECLARACION_DELIBERACION` (Task 10) en las cuatro superficies donde se nota —los dos paneles de carga, la ficha de un deseo publicado y el body de los tres 410— más `PROCEDENCIA.md`, y con la guarda que verifica que el aviso está (Task 17, Steps 5–7). Lo que **sí** queda decidido para el día que se construya, con el mismo detalle con que las otras piezas se le fijaron a sus dueños: tabla `deliberaciones`, `unique (propuesta_id, actor_id)`, y **no reusa `estado`**, porque calidad y deliberación son dos ejes y ya se pisaron una vez. Sigue en D-037, ahora con estado «decidida».
- **La geocodificación inversa.** Un punto no produce una dirección. Traerla pediría la traza de las 326.832 calles, que georef no publica (~90 MB en una tabla lateral, probablemente PostGIS, o sea ADR). Consecuencia concreta y correcta: **una captura hecha con GPS y sin que la persona elija la calle se guarda con punto y sin dirección** — la alternativa sería adivinar en qué cuadra estaba parada.
- **La geometría de departamentos y municipios** (D-004, D-005). Se cargan las **filas**, no los polígonos: no se puede dibujar un coroplético por departamento ni hacer point-in-polygon por debajo de provincia, y el modo Análisis sigue con el escalón «departamento» deshabilitado. Costo de traerla, para que la decisión futura tenga número: ~860 KB de TS generado para departamentos, ~2,2 MB para municipios.
- **La moderación.** No hay columna. `dreams.status` tenía default `'approved'`, o sea moderación que no existía. **Diferirla se puede porque el retiro por parte de quien publicó no está diferido** (Task 14): lo que no era defendible era diferir las dos.
- **Derivar tres señales de cada `semilla`.** Una semilla no tiene geografía ni actor, y meterla al mapa como tres señales provinciales sin punto sería ruido. Lo que lo cambiaría: si `semillas` ganara `province_id` y `actor_id`.
- **La atestación de app** (Play Integrity / DeviceCheck) que le daría dientes a la puerta de proximidad. Necesita ADR. Mientras no exista, **la puerta es blanda y está escrito que lo es**: la posición la declara el cliente y el servidor no la puede atestar.
- **La rama efímera de Neon por corrida de tests** (D-014). Los tests de integración siguen corriendo contra la misma base que sirve el sitio. Este plan **agrega muchos endpoints de escritura y hereda el riesgo**: cada test siembra con prefijo de centinela y barre en `afterAll`, que es un parche.
- **Las dos enmiendas al documento vinculante.** La regla 8 nombra las brasas, que El Registro R7 borró —su contenido sigue vivo y este plan lo cita por contenido, pero su sujeto ya no existe—; y «Las tres superficies» dice tres y lista **cuatro**, y una de las cuatro es El Cielo, que también se borró. **Hay que pedírselas al dueño del producto.**
- **El feed personalizado.** No hay ninguno. Seguir un lugar es guardar un `ambito`, y eso es una preferencia de cliente que no necesita servidor. **No es una red social, es una red de coincidencias.**

### No corrige las cuatro specs: quedan 30 defectos vivos en los documentos

**Este plan es la autoridad y las specs no lo son.** Cada contradicción que aparece abajo está resuelta *acá*, en la tarea que la ejecuta, y quien implemente siguiendo el plan no se topa con ninguna. **Pero los cuatro documentos siguen diciendo lo que decían**, y alguien que abra una spec suelta para entender una pieza va a leer la versión vieja. Se listan con nombre para que la corrección sea una tarea que se puede agendar, y no un descubrimiento.

**Regla que resuelve el 90% de los casos: si el plan y una spec se contradicen, gana el plan.** Los tres únicos lugares donde eso no alcanza están marcados con ⚠ — son decisiones de producto que ninguna de las dos partes puede tomar sola.

**En A — la tierra (8):**
1. ⚠ **A §7.3 le ordena a D publicar la dirección recortada; D §2.6 decide no publicar ninguna.** SERIA. El plan sigue a D (Tasks 32 y 34 no publican dirección en ninguna forma), así que `direccionSinAltura` y `etiquetaDeDireccion` nacen **sin llamador de producción público** —el defecto de `city_id` que A §1.3 denuncia, cometido por A— y A §5 no las incluye en su lista de «sale sin cablear». **Es decisión de producto: si el registro público no muestra ni la calle, hay que decir por qué, no dejar dos órdenes opuestas escritas.**
2. ⚠ **`ubicacion_origen` no sale por ningún canal público.** SERIA. A §7.3 la da por publicada en el volcado; en D la palabra no aparece. El plan **crea la columna** (Task 11) y **no la publica**, así que D-011 sigue sin canal auditable desde afuera: nadie que baje el CSV puede saber qué filas tienen la provincia sacada del polígono malo.
3. **`direccionPermitida` tiene dos firmas y dos casas.** SERIA. A §2.6 la pone en `direcciones.ts` devolviendo `'calle_altura_y_texto' | 'solo_calle' | 'ninguna'`; B §4.7 la pone en `location-policy.ts` devolviendo `'altura_y_texto_libre' | 'solo_calle' | 'nada'`. **Resuelto en la Task 2** (`PermisoDireccion` en `direcciones.ts`, tercer juego de nombres); las dos specs siguen con el suyo.
4. **El paquete de departamento se quedaba sin cliente.** SERIA. **Resuelto en la Task 18, Step 1**, que baja el de departamento con el argumento de A §4.3 textual. B §5 sigue diciendo que descarga sólo el de localidad.
5. **`C §3.7` debe ser `C §3.8`** — el presupuesto conjunto. MENOR. Tres veces en A (§3.5, §7.2, §8.2), una en B §3.7, una en D §3.1. **Cinco punteros muertos hacia el número que decide si se paga el plan**, y que la Task 19 ya midió.
6. **`TipoDeSenal` no existe: es `TipoSenal`, y vive en B §4.1 y no en §3.1.** MENOR. Tres apariciones en A.
7. **B §3.3 y C §7 citan una versión de A que ya no existe.** MENOR. El comentario de `senales_altura_rol_chk` dice que es «más apretado que el de A», y A §3.4 ya escribe el mismo `in ('capture','meeting_point')`; C §7 le atribuye a A §7.2 un encargo que A §7.2 ya no hace.
8. **A §7.3 le asigna a D dos cosas que D no recoge:** el volcado del catálogo geográfico con `geo_catalogo_version.corrida` como versión, y el filtro `departamento` del feed. MENOR (ver D-5 y D-8).

**En B — la señal (8):**
1. **BLOQUEANTE. El `ALTER TABLE senales` de C §3.1 aborta la `0016` en su primera línea**, porque seis de sus siete columnas ya están en el `create table` de B §3.3. **Resuelto en el plan** (Task 11 Step 4 crea las siete, Task 21 Step 1 declara que el `ALTER` no entra). **En las specs sigue vivo, y es el defecto que rompe la rebanada 5 entera en la primera corrida.**
2. **`publicada_en` no tenía dueño.** SERIA. **Resuelto en la Task 11 Step 4.** Queda vivo el pedazo de mapeo: B §3.6 no mapea el disparador `alta` a ningún `tipo_evento`, y el catálogo de C tiene `publicacion` esperándolo — sin esa fila, la guarda «que ninguna transición carezca de evento» devuelve toda señal recién publicada, todos los días.
3. ⚠ **Nadie acordó si `enviada` es una cola, y el contrato de ingesta no acepta evidencia.** SERIA. B dice «`enviada` es un instante»; C sostiene una cola con `senales_publicacion_idx`. El plan sigue a C (Task 23, pasada 5) con el atajo de que el caso normal se resuelve en el mismo POST. **Lo que sigue sin dueño es el productor de evidencia: `evidencia.senal_id` es `NOT NULL` y el contrato único de ingesta de B §4.7 no tiene ningún campo para enlazarla.** Decisión de producto: o el contrato gana `evidenciaId` y el recibo devuelve `'enviada' | 'por_verificar'`, o la evidencia de señal no existe en esta rebanada y hay que borrar media pasada 5.
4. **Dos módulos para la única regla de redondeo del instante público.** SERIA. B §4.10 crea `senal/tiempo.ts` con `instantePublico`; C §2.11 crea `tiempo-publico.ts`; **cada una le dice a la otra que importe el suyo**, y D no nombra ninguno. Es el mismo patrón que `UMBRAL_SUPRESION` vs `VOCES_MINIMAS_POR_CELDA`, que las dos specs sí mataron. Con los dos vivos, el día que alguien mueva el escalón de `high` la superficie que quede atrás no falla: **publica más fino.**
5. **El conteo por fila tiene dos nombres.** MENOR. B §7 y C §7 obligan `confirmacionesContadas`; D ya lo llama `actoresQueConfirmaron` en cinco lugares. **El plan usa `confirmacionesContadas`** (Tasks 32 y 33). El nombre de D es mejor —dice la unidad— y la corrección es barata mientras `/esquema` no exista.
6. **El texto de consentimiento tiene tres archivos.** MENOR. B lo manda a `open-data/campos.ts`, D lo crea en `open-data/textos.ts`, **y el plan lo pone en `open-data/consentimiento.ts`** (Task 10). Gana el plan; las tres menciones de B y la de C a «D §7.3.4» quedan muertas.
7. **`:id` en cinco rutas públicas.** MENOR. **Corregido en el plan** (nota de la Task 22): `:idPublico` en las cinco, más la afirmación nueva en la guarda de la Task 34.
8. **`senales_calle_idx` declarado dos veces**, en A §3.4 y en B §3.3, los dos hacia la `0015`. MENOR. **Corregido en la Task 11 Step 4.**

**En C — la corroboración (6):**
1. **BLOQUEANTE.** Es el mismo que B-1, visto desde C. **Resuelto en el plan.** C además se cuenta mal a sí misma: dice «seis columnas» y su SQL lista siete.
2. **Los dos módulos del redondeo.** SERIA. Mismo que B-4.
3. **`corroborada_en` es una columna que no existe.** MENOR. C §2.5 dice que `vence_el` «se recalcula desde `corroborada_en`». La columna que contiene ese instante es `estado_desde`. **El riesgo es que alguien la invente**, y una columna más sobre `senales` es el renglón más caro del presupuesto.
4. **C §7 le pide a D un renombre que D ya hizo con otro nombre.** MENOR. Mismo que B-5, y el riesgo es que alguien agregue un **segundo** campo por fila para satisfacer la letra.
5. **`senal_resolucion` es el nombre viejo: C la renombró a `resoluciones`.** MENOR. **El plan y el DDL medido usan `senal_resolucion`** (Architecture, Task 21) y son internamente consistentes, así que el renombre de C no se adoptó. Hay que elegir uno de los dos y escribirlo en los dos lados; hoy el corpus tiene los dos nombres vivos para la misma tabla.
6. **`C §4.5` debe ser `C §4.6`** en la entrada de la métrica norte del volcado de D. MENOR.

**En D — el registro público (8):**
1. **BLOQUEANTE. `corroborable` está definido como `clase === 'hecho'`** y la reconciliación le dio la máquina de corroboración también a `acto`. **Corregido en la Task 33 Step 2.** Sin corregir, un compromiso confirmado por tres vecinos se publica con `corroborable: false` en un archivo firmado y perpetuo, **y la guarda de D §8.5 queda roja para siempre**, o sea `pnpm verify` inalcanzable.
2. ⚠ **La dirección.** SERIA. Mismo que A-1, del otro lado.
3. **La lista de `direccionColumns` de D nombra dos columnas que no existen** (`calle_texto`, `texto_libre` —que es un *valor* de `direccion_estado`, no una columna—) **y omite las dos que sí** (`direccion_estado`, `ubicacion_origen`). SERIA. **Consecuencia directa: la guarda 8.4.3 —la mejor de D, la que caza la columna nueva el día que se agrega— arranca roja**, y su falla tapa justamente las dos columnas cuya clasificación había que decidir.
4. **Las filas centinela de D §8.4.2 y §8.5 violan tres de los nueve CHECK de A §3.4.** SERIA. Siembran `altura` + `texto_libre` juntos y con rol `service_area`: son ramas mutuamente excluyentes y el rol no admite ninguna de las dos. **El INSERT falla antes de la primera aserción, y una guarda que muere en el setup se arregla borrándola.** Además prueban el caso equivocado: el caso donde la altura existe y hay que probar que no sale es `capture`/`meeting_point` sin punto — el de Córdoba sin GPS. La reescritura va contra la Task 34.
5. **El volcado del catálogo geográfico no tiene lugar en `volcados`.** SERIA. A se lo asigna con nombre; el `check formato in (...)` de D no lo admite y su índice único `(corte, formato, particion)` haría chocar el CSV del catálogo con el de señales. **Cuesta una columna `dataset` hoy y una migración después.** Y es el único dataset publicable con las tablas cívicas en cero, o sea la única forma de probar el pipeline entero —cron, blob, sha256, `PROCEDENCIA.md`— **sin datos de personas adentro**.
6. **`textos.ts` vs `campos.ts` vs `consentimiento.ts`.** MENOR. Mismo que B-6.
7. **Qué estados llevan sello.** MENOR. D pide `resuelta`/`no_cumplida`/`desactualizada`; B decide `desactualizada`/`no_cumplida`/`retirada`. **El plan sigue a B** (Task 17 Step 2), así que la fila que D quiere destacar —`resuelta`, lo único que el registro destaca estructuralmente— no lleva sello. Lo razonable es que B agregue `resuelta` y deje `retirada` para las superficies internas, porque el registro público no la ve nunca.
8. **`C §3.7` debe ser `C §3.8`** en D §3.1. MENOR. Mismo que A-5.

---

## Deudas nuevas para `docs/DEUDAS.md`

> Redactadas en el formato del archivo. El último id usado es **D-033**. Los rangos están reservados en «Global Constraints».

### D-034 · El callejero es una foto y georef no tiene feed de cambios

**Dónde:** `v2/packages/db/scripts/seed-callejero.ts`, `geo_seed_progreso.hash_fuente`
**Encontrada:** 2026-08-11, escribiendo el plan de la rebanada 2
**Severidad:** media — el dato envejece en silencio
**Estado:** abierta

La API del Ministerio del Interior no expone `?desde=`: detectar deriva exige re-descargar el corpus entero y comparar el `hash_fuente`. **Medido el 2026-08-11: son 534 requests y 268 segundos**, y no los 327 requests que esta deuda decía — la API topea `inicio` en 10.000 y `max` en 5.000, así que el callejero hay que pedirlo partido por departamento (529) y no por provincia (24). Mitigación: la re-siembra es barata en escrituras (cero filas si nada cambió, por el `WHERE` del `DO UPDATE`) y cara en requests (~4,5 minutos), así que corre a mano y no en cron. **Qué haría falta:** una fuente con changelog, o aceptar una re-siembra trimestral agendada.

### D-035 · El scope de provincia del buscador de calles depende de un GIN que resultó costar ocho veces menos de lo presupuestado

**Dónde:** `v2/packages/db/migrations/0014_trigram_calles.sql`
**Encontrada:** 2026-08-11, presupuestando la rebanada 2
**Medida:** 2026-08-11 (Task 19 del plan)
**Severidad:** **informativa** — era baja, y el argumento de bytes que la sostenía se cayó
**Estado:** abierta sin acción

La deuda decía que el índice trigram es «el 22% del presupuesto de bytes del callejero» (~45–72 MB) y sirve **sólo** al caso frío: buscar por provincia con un tipeo en vez de un prefijo. **Medido sobre las 326.832 calles reales: 9,1 MB.** Ocho veces menos, y la razón es que **120.115 calles se llaman «CALLE SN»** y los trigramas deduplican. **Dropearlo ya no compra nada** —son el 1,8% del techo— así que la palanca «si el presupuesto aprieta, se dropea» deja de existir como palanca.

**Y el hallazgo que la reemplaza: el índice más caro del callejero es `geo_calles_georef_unique`, con 17,4 MB**, que es justo el que no se puede sacar — sostiene el `ON CONFLICT` del seed y la identidad de una calle. **Qué haría falta para cerrarla:** nada que valga la pena. Queda anotada para que nadie vuelva a proponer dropear el GIN citando un número que ya no es cierto.

### D-036 · Las adhesiones seudónimas se pueden inflar borrando la cookie

**Dónde:** `v2/apps/api/src/features/senales/{actor,adhesiones}.ts`
**Encontrada:** 2026-08-11, diseñando la identidad seudónima
**Severidad:** media
**Estado:** abierta (mitigada, no cerrada)

Borrar la cookie y volver a adherir cuesta unos segundos. El techo es de **20 altas de actor por bucket de red por hora** y persiste en `actores_por_origen`: frena el bucle automatizado, no frena a quien tenga paciencia. **La defensa real contra encender una celda falsa es `UMBRAL_SUPRESION = 5`**, y contra el techo hay que medirlo donde importa: en Santa Cruz (~1,4 hab/km²) una celda de 1 km² se satura con **0,07 voces** —un actor la desborda y le sobra—; en CABA (~15.600 hab/km²) una celda de 250 m estima ~975 habitantes, o sea **49 voces**: dos horas y media al techo. **El techo por bucket no alcanza y no se puede fingir que alcanza.**

### D-037 · La mitad deliberativa de la regla 11 queda sin mecanismo, y el producto lo declara

**Dónde:** `v2/apps/api/src/features/pulso/routes.ts` (tres `POST` en 410); `packages/shared/src/open-data/consentimiento.ts` (`DECLARACION_DELIBERACION`); `apps/web/src/components/papel/primitives/NotaDeAlcance.tsx`
**Encontrada:** 2026-08-11, cerrando el alcance de las cuatro rebanadas
**Severidad:** alta — es media regla constitucional sin implementación
**Estado:** abierta · **decisión tomada 2026-08-11: se declara, no se construye**

El voto se apaga y el reemplazo está diferido. Hasta que llegue, **un deseo sólo puede recibir «yo también»**. La regla 11 se cumple entera del lado de la corroboración —la clase está en el tipo, el tipo en el catálogo, el catálogo atado por FK compuesta, y `corroborar(unSueño)` no compila— **y se cumple a la mitad del lado de la deliberación**.

**La decisión del dueño del producto ya no está pendiente: sale con corroboración blindada y deliberación en cero, y se dice en pantalla.** No entra una quinta spec. `DECLARACION_DELIBERACION` es una constante única que aparece en cuatro superficies —el panel de un `sueño`, el panel de una `propuesta`, la ficha de un deseo publicado, y el body de los tres 410— más `PROCEDENCIA.md`, con la guarda `declaracion-deliberacion.test.tsx` que verifica que el aviso está donde tiene que estar, que **no** está donde sería falso (clase `hecho` o `acto`), y que no hay una segunda redacción escrita a mano.

**Lo que sigue abierto es el mecanismo, no la honestidad sobre su ausencia.** Lo que queda decidido para el día que se construya: tabla `deliberaciones`, `unique (propuesta_id, actor_id)`, y **no reusa `estado`**, porque calidad y deliberación son dos ejes y ya se pisaron una vez. **Qué haría falta para cerrarla:** el mecanismo entero —quórum, ventana, quién puede votar, qué pasa con el empate—, que es una spec propia. **Cuándo se borra el aviso: sólo cuando ese mecanismo esté en producción, nunca antes.** Un aviso que se saca porque molesta deja al producto afirmando lo que no hace.

### D-038 · La adhesión con cuenta se puede lavar si alguien afloja el unique parcial de `actores.user_id`

**Dónde:** `v2/packages/db/src/schema/senales.ts`, índice `actores_user_unico`
**Encontrada:** 2026-08-11, escribiendo la fusión de actores
**Severidad:** media — hoy está cerrada por índice, la deuda es que no hay guarda de que siga
**Estado:** abierta

El ataque es trivial sin ese índice: adherir, borrar la cookie, repetir 20 veces, loguearse una vez y linkear los 20 → veinte filas de `adhesiones` sobre la misma señal, **las veinte contadas como «cuentas verificadas»**, o sea que el bucket de mayor calidad sería el más fácil de inflar. El test «una persona con veinte actores adhiere una vez» lo cubre hoy, pero **no hay nada que impida que alguien cambie el índice a no-único en una migración futura sin que ese test falle por la razón correcta.**

### D-039 · El adaptador `campo-v1` deduce el tipo y nadie sabe cuándo se puede retirar sin correr una consulta

**Dónde:** `v2/apps/api/src/features/civic-map/capturas.ts`
**Encontrada:** 2026-08-11, escribiendo los adaptadores
**Severidad:** baja
**Estado:** abierta

`observation → basta`, `need → necesidad`, `resource → recurso`: el tipo **se dedujo y no se eligió**, y eso importa para declarar sesgo (regla 5). Se retira cuando `select count(*) from senales where origen = 'campo-v1' and creada_en > now() - interval '90 days'` dé cero. **Eso es una consulta, no una promesa** — pero nadie la corre sola.

### D-040 · `firma` sale por una excepción a la lista blanca, y una excepción tiene una guarda sola

**Dónde:** `v2/packages/shared/src/open-data/campos.ts`
**Encontrada:** 2026-08-11, resolviendo el conflicto entre B §7 y D §4.3.5
**Severidad:** media
**Estado:** abierta

`firma` se serializa en `GET /senales/:idPublico` y **se omite en el feed y en los tres formatos**, porque `group by firma order by sum(adhesiones)` sobre un CSV público es un ranking público individual que construiría el propio proyecto. Es la única excepción a «un solo serializador» de todo el registro, y por lo tanto **el único campo cuya corrección depende de una guarda y no de la forma del código**. **Qué haría falta:** o un segundo serializador con su propio descriptor, o sacar `firma` del contrato.

### D-041 · El techo conjunto de la rama es 93.401 señales, y el archivado frío del rastro es la palanca que no se compró

**Dónde:** Neon `cool-bird-63087148`, rama de producción
**Encontrada:** 2026-08-11, sumando los presupuestos de las cuatro specs por primera vez
**Medida:** 2026-08-11, rama `medicion-512mb-2026-08-11` (Task 19 del plan)
**Severidad:** media — era alta hasta que se midió
**Estado:** abierta, **acotada y con disparador escrito**

Las cuatro specs presupuestaron por separado y ninguna hizo la suma: A 201 MB (callejero), B ~800 B/señal asumiendo 100 MB de callejero, C 376 MB para 100.000 señales «contra 474 libres» **ignorando el callejero Y las filas de B**. Sumadas daban 657 MB a 100.000 señales y un techo conjunto de ~68.000.

**Medido con el callejero completo y real (326.832 calles) más 10.000 señales con su cola entera:**

```
piso fijo (callejero + jerarquía + catálogos + v1) = 115.965.952 B = 110,59 MB
costo marginal por señal                           = 4.506 B
TOTAL(n) = 115.965.952 + n × 4.506,4
TECHO en 512 MB = 93.401 señales
```

**Tres correcciones a lo que la deuda decía:** el techo es 93.401 y no ~68.000 (37% más aire); el callejero pesa 96,06 MB y no los 163 que A estimaba; y **`rastro_senal` es el 31,8% del costo por señal, no «cuatro quintos»** — de ahí salía la urgencia y la urgencia no existía.

**Mitigación implementada:** alarma programada en **340 MB ≈ 53.400 señales**, con `pg_database_size` (que sí es el tamaño lógico, o sea lo que el tier cuenta) **más** el recordatorio de que la consola de Neon reporta lógico *más* historia de PITR y es la que factura. **El archivado frío del rastro NO se implementó**: sube el techo de 93.401 a ~137.000 señales y cuesta una columna, una pasada de cron, un store de blobs y una verificación de cadena que cruza el borde de la base. **Su disparador es la alarma de 340 MB**, no una fecha.

**Qué haría falta para cerrarla:** re-medir `actores` con tráfico real. Los 2,5 actores por señal son la única hipótesis que queda adentro del número, y aportan 600 de los 4.506 B: si el ratio real es menor, el techo sube a ~107.700.

### D-042 · `quality.ts` devuelve `confidence: 0` para decir «no evaluada»

**Dónde:** `v2/apps/mobile/src/civic/quality.ts:20`
**Encontrada:** 2026-08-11, auditando la lógica de corroboración del teléfono
**Severidad:** media
**Estado:** abierta

`return { confidence: 0, status: 'unsafe', … }` — `confidence: 0` no significa «medimos y dio cero» sino «se apartó del circuito y no tiene confianza definida». **Es un `0` para decir «no sé», en el módulo que decide si un hecho está comprobado**, o sea el pecado exacto que `brillo.ts` existe para prohibir, cometido en la pieza más sensible. La rebanada 5 hace que `assessObservation` deje de ser fuente de verdad —pasa a ser el eco local de lo que el servidor decidió— pero **la unión discriminada que reemplaza al `0` y al `0.15` queda pendiente.**

### D-043 · `useModoMapa` duplica a mano el halo que `publicLocationUncertaintyKm` ya calcula

**Dónde:** `v2/apps/web/src/pages/ElMapa/instrumento/modos/useModoMapa.tsx:30`
**Encontrada:** 2026-08-11, comparando los dos motores de dibujo de `/el-mapa`
**Severidad:** media
**Estado:** abierta

`lienzo/precision.ts` deriva el radio del halo de `publicLocationUncertaintyKm` de civic-core —la misma función con la que el servidor decidió cuánto correr el punto— y `useModoMapa.tsx:30` tiene `METROS_POR_PRECISION` escrita a mano (`exact:0, 100m:71, 500m:354, neighborhood:1061, city:3536`). **Son dos fuentes para el mismo número: el día que civic-core cambie una constante, el mapa de arriba y el de abajo van a dibujar duda distinta para la misma señal**, y nadie va a notarlo mirando la pantalla.

### D-044 · La supresión k=5 sobre celda fija castiga estructuralmente a la baja densidad

**Dónde:** `v2/packages/civic-core/src/coeficientes-corroboracion.ts`, `apps/api/src/features/civic-map/cells.ts`
**Encontrada:** 2026-08-11, diseñando `/map/cells`
**Severidad:** media
**Estado:** abierta (acotada, no eliminada)

Con lado fijo, k=5 en una celda del interior con veinte habitantes es el **25% de la población**: un umbral que en el microcentro se cruza con un grupo de WhatsApp y en el campo no se cruza nunca. No se baja k —el piso de anonimato es correcto—: **se adapta el lado**, y el endpoint rechaza con `422` y `ladoSugerido` los planes cuyo lado deje celdas bajo 100 habitantes. **Se apila con D-026 en la misma dirección: el interior sale doblemente apagado, y la respuesta lo dice en su campo `sesgo`.**

### D-045 · El paso humano en Neon que hace verdadera la inmutabilidad del rastro no lo agenda nadie

**Dónde:** `v2/packages/db/migrations/0016_la_corroboracion.sql`, `apps/api/src/lib/arranque-privilegios.ts`
**Encontrada:** 2026-08-11, escribiendo la capa 1 de inmutabilidad
**Severidad:** media
**Estado:** abierta

La migración crea el rol `v2_app` de forma idempotente y le revoca `update/delete/truncate` sobre `rastro_senal`, pero **la contraseña del rol y el cambio de `DATABASE_URL` los hace una persona en Neon**. Si ese paso no ocurre, la API sigue conectándose como dueña, el revoke no protege nada, y **la capa que C califica de «inmutable de verdad» existe sólo en el archivo de migración. No hay guarda que lo detecte: la migración aplica igual.** Mitigación: chequeo de arranque que loguea en WARN si la conexión tiene privilegio de `UPDATE` sobre `rastro_senal`.

**Confirmada dos veces el 2026-08-11 y sigue abierta:** quien escribió el DDL dejó el bloque `create role` / `grant` / `revoke` deliberadamente fuera de los archivos de migración porque necesita el paso humano, y la medición de la Task 19 corrió sin él. **La capa 1 de inmutabilidad del rastro existe hoy sólo en prosa, y la medición no lo cambió.**

### D-046 · El clasificador de temas agrega un evento de rastro por señal que el presupuesto no contaba

**Dónde:** `v2/apps/api/src/features/mandato/classifier.ts`, `rastro_senal`
**Encontrada:** 2026-08-11, cruzando B §2.11 con C §2.12
**Severidad:** baja
**Estado:** abierta

C exige que **toda escritura de máquina sobre una fila de señal deje su evento** con `actor_clase: 'maquina'`, y B hace que el clasificador escriba `tema_intentado_en` en **toda** fila, incluidas las que no logra mapear. Cruzadas: **un evento más por señal**, en el renglón más grande del costo marginal (D-041). **La medición del 2026-08-11 acota el daño y hay que decirlo:** `rastro_senal` promedió **3,86 eventos por señal** —no los ~8 que el presupuesto contaba— y pesa el 31,8% del marginal, no los «cuatro quintos» que C estimaba. Un evento más por señal es **+371 B sobre 4.506**, o sea el techo baja de 93.401 a ~86.300 señales: real, medible, y no una emergencia. Hay que decidir igual si el intento de clasificación deja evento o si `tema_intentado_en` es su propia constancia.
