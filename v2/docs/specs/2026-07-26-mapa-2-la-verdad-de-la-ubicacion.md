# Mapa · 2 — La verdad de la ubicación

**Fecha:** 2026-07-26
**Paraguas:** `docs/specs/2026-07-26-el-mapa-instrumento-territorial.md` — implementa §3 y §8
**Decisiones que aplica:** D2 (la precisión la elige quien habla), D6 (núcleo compartido), **D7 (exactitud por defecto)**
**Depende de:** spec 1 para el render (la parte de datos puede arrancar en paralelo)
**Habilita:** el lazo de la spec 3, la captura en campo de la spec 4

> **Qué entrega.** Que un pozo esté donde está el pozo. Hoy toda voz es «Buenos Aires» y el punto que se ve es inventado. Al terminar esto, quien carga algo elige hasta dónde localizarlo — provincia, localidad, o el punto exacto clavado en el mapa — y el mapa lo dibuja con la precisión que realmente tiene.

---

## 1. Alcance

**Entra:** el paquete `packages/civic-core` extraído de `juego/`, la política nueva de exactitud, el ADR de distribución, las columnas de geografía en el esquema de v2, la carga de localidades, el selector de precisión en el panel, y el endpoint unificado.

**No entra:** el lazo (spec 3), el sync con el móvil (spec 4). El móvil cambia de comportamiento acá porque comparte el núcleo, pero su flujo de captura hacia el mapa público llega en la 4.

---

## 2. El paquete `packages/civic-core`

### 2.1 Qué se extrae

De `juego/src/civic/`, solo lógica pura — sin UI, sin APIs de plataforma, sin red ni disco:

| Origen | Destino | Cambia |
|---|---|---|
| `types.ts` *(subconjunto geográfico)* | `src/types.ts` | `LocationPrecision` gana `'province'` |
| `location-policy.ts` | `src/location-policy.ts` | **reescrito** — §3 |
| `geo.ts` | `src/geo.ts` | `precisionMeters` gana el caso `'province'` |
| `lasso.ts` | `src/lasso.ts` | sin cambios |
| `coverage.ts` | `src/coverage.ts` | sin cambios |

Los tests que ya existen (`lasso.test.ts`, `coverage.test.ts`, `location-policy.test.ts`, `geo.test.ts`) **migran con el código**. No se reescriben desde cero: se migran, y después se ajustan los que afirman la política vieja.

`juego/src/civic/` pasa a importar del paquete en vez de definir. Los archivos que se quedan allá — `need-access-grants`, `disclosure-*`, `sync`, `repo`, `missions`, `public-intelligence` — son lógica de la app de campo, no del contrato.

### 2.2 El ADR de distribución

`juego/` usa npm con `package-lock.json` y está fuera del workspace pnpm de v2. Tres caminos, y hay que elegir uno y escribirlo en `docs/adr/`:

| Camino | A favor | En contra |
|---|---|---|
| **Tarball versionado** commiteado en `juego/vendor/` y fijado por `file:` | cero infraestructura, funciona hoy mismo, la versión es visible en el diff | actualizar es manual; hay un binario en el repo |
| **Publicar `@basta/civic-core`** a un registry | el flujo estándar, `juego` hace `npm update` | hay que administrar un registry y credenciales de publicación |
| **Mover `juego/` al workspace** como `apps/mobile` | una sola instalación, refactors atómicos entre web y móvil | contradice la independencia deliberada de `juego/`, mezcla pnpm con el tooling de Expo, y es un movimiento grande de por sí |

**Recomendación: el tarball versionado.** Es el que menos infraestructura pide y el que hace más visible el bump de versión, que es justo lo que el paraguas quiere que sea difícil de hacer sin querer. Si el ritmo de cambios lo vuelve molesto, migrar a registry después es barato.

---

## 3. La política nueva

### 3.1 El cambio es de una función

`obfuscatePoint` **ya devuelve el punto intacto** cuando la precisión es `exact`. La única cosa entre el núcleo actual y publicar exacto es `sharedPrecisionForAudience`, que degrada `exact` a `100m` para toda audiencia que no sea privada sin mirar `LocationRole` ni `CivicSensitivity` — que ya existen en el mismo archivo de tipos.

Se reemplaza por:

```ts
export interface PublishedPrecisionInput {
  requested: LocationPrecision;
  role: LocationRole;
  sensitivity: CivicSensitivity;
  audience: CivicAudience;
}

export interface PublishedPrecisionResult {
  /** Lo que efectivamente se publica. */
  precision: LocationPrecision;
  /** Cuando difiere de lo pedido: por qué, en castellano, para mostrárselo a la persona. */
  coarsenedBecause: string | null;
  /** Si la persona puede rechazar el engrosado y publicar igual lo que pidió. */
  overridable: boolean;
}

export function publishedPrecision(input: PublishedPrecisionInput): PublishedPrecisionResult
```

La regla:

```
si role === 'subject' && sensitivity === 'high' && audience !== 'private':
    precision        = engrosar(requested, mínimo '500m')
    coarsenedBecause = "Este registro habla de un lugar donde vive o está una
                        persona. Te proponemos publicarlo con menos precisión."
    overridable      = true
en cualquier otro caso:
    precision        = requested        // incluido 'exact'
    coarsenedBecause = null
    overridable      = true
```

`overridable: true` en ambas ramas es a propósito: la persona siempre manda sobre su propia ubicación, y el sistema propone en vez de imponer. Que el campo exista igual permite que un futuro régimen legal lo ponga en `false` sin cambiar la forma del resultado.

### 3.2 `'province'` en el enum

`LocationPrecision` pasa a `'exact' | '100m' | '500m' | 'neighborhood' | 'city' | 'province'`. En `precisionMeters` es el caso más grueso; su radio de incertidumbre no se usa para dibujar un halo — a nivel provincia se dibuja el lavado (spec 1 §5), no un punto.

### 3.3 Lo que hay que reescribir en `juego/`

`need-access-grant-delivery.ts` (843 líneas) tiene `precision: '500m' | 'neighborhood' | 'city'` clavado en el payload del grant, y `need-access-grants.ts` tiene un `SAFE_PRECISIONS` que excluye `exact`. Sus tests (739 + 370 líneas) afirman que el punto exacto nunca sale de un grant.

Bajo la política nueva el grant puede llevar el punto exacto **cuando la persona lo autorizó**. El payload se ensancha, `SAFE_PRECISIONS` deja de ser una lista blanca de precisiones y pasa a ser una función de la autorización, y los tests se reescriben para afirmar la regla nueva: *sale lo que la persona autorizó, ni más ni menos*.

Es el trabajo más grande y menos vistoso de este sub-proyecto. Está contabilizado acá y no en ningún otro lado.

### 3.4 La app móvil cambia de comportamiento

El núcleo es compartido: esto reescribe lo que hace `juego/` en campo. Se publica con nota de versión propia, `juego/` fija la versión nueva cuando puede probarla, y los tests de grants se reescriben **antes** de publicar el paquete, no después.

---

## 4. El esquema

### 4.1 Columnas

Sobre `dreams` primero; el mismo shape se aplica después a `pulseSignals` y `proposals`:

```sql
lat            decimal(9,6)                                    -- el punto publicado, ya con su precisión aplicada
lng            decimal(9,6)
precision      text    not null default 'province'
location_role  text    not null default 'subject'
sensitivity    text    not null default 'low'
localidad_id   integer references geographic_locations(id)
```

Más un índice para el filtro por área del endpoint:

```sql
create index dreams_geo_idx on dreams (lat, lng) where lat is not null;
```

Los defaults dejan a cada fila existente exactamente donde está: precisión provincial, sin coordenada. **Ninguna migración reinterpreta datos viejos** — una voz cargada antes de esto no se convierte en un punto que nadie clavó.

`lat`/`lng` guardan el punto **ya publicado**, es decir el resultado de `publicLocation(exacto, publishedPrecision(...))`. El punto exacto crudo no se guarda en la base pública: cuando la precisión publicada es `exact` coinciden, y cuando no, el crudo simplemente no existe de este lado. La custodia del punto crudo es del móvil (spec 4).

### 4.2 Las localidades

`geographic_locations` ya tiene `level: 'province' | 'city'` y lat/lng nullable. **No hay cambio de esquema**, solo carga de datos.

Primer paso, antes de escribir nada: contar cuántas filas de `level: 'city'` hay realmente en la base de v2 (el seed conocido son las 24 provincias) y cuántas coordenadas hay del lado de v1. Según eso es INSERT o UPDATE. El registro del proyecto dice 518 de 525 en v1; se verifica, no se asume.

Las que queden sin coordenada **se marcan como tales** y no se pueden elegir como precisión `city` en el panel. No se les inventa centroide: una localidad sin coordenada es un dato faltante, no un punto en el medio de la provincia.

---

## 5. El endpoint

```
GET /api/v1/civic/map/signals?capas=voces,pulso,propuestas&bbox=&desde=&hasta=
```

**El prefijo va versionado.** La app móvil ya habla `/api/v1/civic/*` (`community-api.ts`) y el blueprint pide explícitamente una API cívica versionada como único puente entre las dos aplicaciones. Todo lo cívico cuelga de ahí.

Feature slice nueva: `apps/api/src/features/civic-map/{routes,service,validation}.ts`, registrada en `app.ts` como `app.use('/api/v1/civic', civicRouter)`. Sigue el envoltorio `{ data: ... }` del resto de la API.

Forma unificada de señal:

```ts
interface SenalMapa {
  id: string;              // "voz:412" — la capa va en el id para que sea único entre capas
  capa: 'voz' | 'pulso' | 'propuesta' | 'mandato';
  tipo: string | null;     // los 6 tipos de voz, o el tipo propio de la capa
  texto: string;
  lat: number | null;
  lng: number | null;
  precision: LocationPrecision;
  role: LocationRole;
  provinceId: number | null;
  localidadId: number | null;
  createdAt: string;
}
```

**El panel de conversión no usa este endpoint.** Sigue con `/api/open-data/dreams`, `/by-province` y `/provinces`: el instrumento no se paga en el camino crítico de los 30 segundos.

`bbox` recorta del lado del servidor. El lazo **no** se manda al servidor: se resuelve en el cliente sobre lo que el bbox ya trajo (spec 3), porque el polígono es una interacción viva y no vale un round-trip por vértice.

---

## 6. El panel: elegir la precisión

`PanelSoltarVoz.tsx` gana un paso, y el paso es **opcional y salteable**: los 30 segundos son la ley de esta página y esto no puede alargarlos.

Después del textarea y antes de «Soltar la voz», una línea:

> **¿Dónde?** [ Mi provincia ▾ ] · [ Mi localidad ] · [ Clavarlo en el mapa ]

- **Mi provincia** — el select que ya existe. Es el default y no cambia nada del flujo actual.
- **Mi localidad** — segundo select, poblado con las localidades de la provincia que tengan coordenada.
- **Clavarlo en el mapa** — el lienzo entra en modo de colocación, la altitud baja a `localidad`, y aparece el recuadro de calles bajo demanda de D4. Dos maneras de llegar: «usar mi ubicación» (geolocalización del navegador) o clavarlo mirando.

Cuando `publishedPrecision` devuelve `coarsenedBecause`, se muestra el texto y el botón para rechazarlo. Nunca se engrosa en silencio.

### 6.1 Las calles bajo demanda

Solo en modo de colocación, y solo alrededor del punto actual: una request a un recorte chico de OSM (~50 KB), dibujada en el mismo lienzo con el mismo trazo de tinta. Se descarta al salir del modo. No se cachea, no se precarga, no aparece en ninguna otra parte del mapa.

**Depende de un servicio externo**, así que: falla en silencio hacia el modo sin calles (con las manchas urbanas y las rutas del esqueleto, que ya están precomputadas y siempre sirven de referencia), tiene timeout, y su origen entra en la CSP. Si el ADR de la CSP resulta molesto, el modo sin calles es un fallback digno y no un error.

---

## 7. Cómo se verifica

- **`publishedPrecision`** — la matriz completa `role × sensitivity × audience`, con el caso protegido y su override. Es la función más importante del paquete
- **Los tests migrados** de `lasso`, `coverage`, `geo` pasan sin cambios en su nuevo hogar
- **Los tests de grants reescritos** afirman la regla nueva y ya no la vieja
- **Migración** — sobre una base con filas existentes: todas quedan en `province` sin coordenada, ninguna se mueve
- **Endpoint** — ≥1 test de integración contra Postgres real, según el estándar de `v2/CLAUDE.md`; incluye un caso de `bbox` y uno de capas mezcladas
- **Localidades sin coordenada** — un test afirma que no aparecen como opción en el panel
- **El panel** — test de que la precisión por defecto sigue siendo provincia y que el flujo de 30 segundos no gana un paso obligatorio

---

## 8. Listo cuando

1. `pnpm verify` verde en v2, y los tests de `juego/` verdes con el paquete nuevo
2. `publishedPrecision` cubre la matriz completa y `sharedPrecisionForAudience` ya no existe
3. El ADR de distribución está escrito en `docs/adr/`
4. Una voz se puede clavar en un punto exacto y el mapa la dibuja como punto nítido sin halo
5. Una voz de alta sensibilidad con rol `subject` recibe la propuesta de engrosado, con su texto, y se puede rechazar
6. Ninguna fila existente cambió de lugar

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| El paquete rompe la app móvil en campo | Versionado; los tests de grants se reescriben antes de publicar; `juego/` sube cuando puede probar (§3.4) |
| El paso de precisión alarga los 30 segundos | Es opcional y salteable, el default es el comportamiento de hoy, y hay un test que lo afirma |
| Exactitud por defecto expone a alguien | La protección de `subject` + alta sensibilidad existe, se explica y se ofrece; `need-access-grants` sigue siendo la vía del caso protegido |
| Las localidades de v1 no están donde el registro dice | Se cuenta antes de escribir (§4.2); las que falten se marcan y no se ofrecen |
| El servicio de calles bajo demanda cae o la CSP lo bloquea | Fallback al modo sin calles, que igual tiene manchas urbanas y rutas precomputadas |
