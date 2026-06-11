# EL MAPA — Overhaul de recolección y presentación

**Fecha:** 2026-06-11
**Alcance:** `/el-mapa` (SovereignMap + SovereignInput) y `/explorar-datos` (ConvergenceMap + La Radiografía)

## Por qué

La auditoría del flujo completo (formulario → API → DB → mapa) encontró estos problemas, ordenados por gravedad:

- **P1 — El mapa corre sobre 20 sueños.** `GET /api/dreams` usa `parsePagination` con default `limit=20` y tope absoluto 100. Todos los mapas y todas las visualizaciones de La Radiografía solo ven los 20 dreams más recientes.
- **P2 — Coordenadas falsas de CABA.** En `SovereignMap.handleCreate`, si el usuario desmarca "Usar mi ubicación" **o** la geolocalización falla, se persiste el centro de Buenos Aires (`-34.6037, -58.3816`) como si fuera una señal real. Sesga el mapa y el análisis de convergencia hacia CABA.
- **P3 — Sin ubicación estructurada al escribir.** `dreams` no tiene columnas `province`/`city`; la clasificación se hace client-side (point-in-polygon + haversine) en cada carga de La Radiografía, y El Mapa ni siquiera la hace.
- **P4 — Ciudades sin coordenadas.** Todas las filas `city` de `geographic_locations` tienen lat/lng NULL → la resolución de ciudad y el fly-to de ciudad nunca funcionan.
- **P5 — Privacidad.** Se guarda la posición GPS exacta del usuario (efectivamente su domicilio).
- **P6 — Filtros que no se propagan.** Filtrar el mapa de La Radiografía no afecta Sankey, Chord, ni las estadísticas del scrollytelling (deferred en spec 2026-04-24).
- **P7 — Sin dimensión temporal.** Todo se muestra como presente eterno; `createdAt` existe pero no se usa.
- **P8 — Mobile.** Filter bar con selects que desbordan en ~380px; lasso táctil sin verificar; alturas de mapa sin verificar.
- **P9 — Triplicación client-side.** `SovereignMap`, `useDeckGLLayers` y `useConvergenceAnalysis` repiten la misma fusión de 3 queries (dreams + commitments + resources) con normalizaciones levemente distintas.

## Diseño

### 1. Tipo compartido — `shared/map-signals.ts`

```ts
export type SignalType = 'dream' | 'value' | 'need' | 'basta' | 'compromiso' | 'recurso';
export interface MapSignal {
  id: string;            // "dream-12" | "commitment-3" | "resource-7"
  type: SignalType;
  text: string;
  lat: number | null;
  lng: number | null;
  location: string | null;
  province: string | null;
  city: string | null;
  category: string | null;   // solo recursos
  createdAt: string | null;
}
```

### 2. Endpoint unificado — `server/routes-map-signals.ts`

`GET /api/map/signals` (público, `publicReadRateLimit`): devuelve **todas** las señales de las tres tablas normalizadas a `MapSignal[]`, ordenadas por fecha desc, tope de seguridad 5000. Selecciona solo las columnas necesarias. Registrado vía `registerMapSignalsRoutes(app)` siguiendo el patrón `routes-*.ts`. Resuelve P1 y P9.

### 3. Esquema — columnas aditivas

`dreams` gana `province: text` y `city: text` en `shared/schema.ts` **y** `shared/schema-sqlite.ts`. En la DB Neon se aplica con `ALTER TABLE dreams ADD COLUMN IF NOT EXISTS …` (aditivo, sin riesgo). No se tocan los tipos de `latitude`/`longitude` (text) ni se consolidan las 4 columnas de texto — fuera de alcance.

### 4. Resolución geográfica al escribir — `server/geo-resolver.ts`

- Carga `client/public/data/argentina-provinces-simplified.geojson` una vez (lazy, cacheado en módulo).
- `resolveProvince(lat, lng)`: ray-casting punto-en-polígono (Polygon/MultiPolygon, ~40 líneas, sin dependencias nuevas), con la normalización "Ciudad de Buenos Aires" → "Ciudad Autónoma de Buenos Aires".
- `resolveCity(lat, lng, province)`: ciudad más cercana (haversine ≤ 50 km) entre las ciudades con coordenadas de esa provincia (lookup en `geographic_locations`).
- `snapCoords(lat, lng)`: redondeo a 2 decimales (~1.1 km) — privacidad por defecto.

`POST /api/dreams`, `POST /api/commitment` y `POST /api/resources-map` llaman al resolver cuando reciben coordenadas: snap + province + city se persisten. Si el resolver falla, la señal se guarda igual sin province/city (nunca bloquea el envío). Coordenadas ausentes se guardan como NULL — **nunca se fabrican**. Resuelve P2 (lado servidor), P3 y P5 para datos nuevos.

### 5. Recolección honesta — `SovereignInput` + `SovereignMap`

El checkbox "Usar mi ubicación" se reemplaza por un selector de modo de ubicación:

- **Mi ubicación** (default): geolocalización del navegador.
- **Elegir provincia**: dropdown de `/api/geographic/provinces`; se envía el centroide de la provincia (el server lo snapea y clasifica).
- **Sin ubicación**: se envía sin coordenadas; la señal cuenta en estadísticas pero no aparece en el mapa.

Si la geolocalización falla o se deniega, el form cambia automáticamente a "Elegir provincia" con un mensaje claro — nunca más CABA silenciosa. Resuelve P2 (lado cliente).

### 6. Presentación — un solo origen de datos + filtros que mandan

- Nuevo hook `client/src/hooks/useMapSignals.ts`: una query a `/api/map/signals`.
- `useDeckGLLayers`, `useConvergenceAnalysis` y `SovereignMap` consumen ese hook (se eliminan las 3 fusiones duplicadas).
- `useConvergenceAnalysis(entries)` se parametriza: recibe las señales (filtradas o no) en lugar de fetchear.
- `ExplorarDatos` pasa a ser el dueño del estado de filtros: `useMapSignals` → clasificador (fallback para filas viejas sin province) → `useRadiografiaFilters` → `filteredEntries` fluye a `ConvergenceMap` (por props) **y** a `useConvergenceAnalysis`, así Sankey, Chord y los números del scrollytelling reaccionan a los filtros del mapa. Cuando hay filtros activos se muestra un indicador "Mostrando X de Y señales" en las secciones afectadas. Resuelve P6.
- El clasificador client-side queda como fallback para señales sin `province` persistida.

### 7. Dimensión temporal

`MapEntry`/`MapSignal` ganan `createdAt`. `MapFilters` gana `timeRange: '7d' | '30d' | 'all'` (default `'all'`), expuesto como chips en `MapFiltersBar`. El filtro compone con AND igual que los demás. Resuelve P7.

### 8. Backfills — `scripts/`

- `backfill-city-coords.ts`: trae municipios y localidades del API georef oficial (`apis.datos.gob.ar/georef`), matchea por nombre normalizado contra las ciudades de `geographic_locations` y completa lat/lng. Idempotente (solo filas con NULL).
- `backfill-signal-geo.ts`: para dreams/commitments/resources con coordenadas y sin province, corre el resolver y persiste province/city. Idempotente. **No** redondea coordenadas históricas (irreversible; solo datos nuevos se snapean).

Resuelve P4 y completa P3 para datos históricos.

### 9. Mobile

- `MapFiltersBar`: selects y botones `w-full sm:w-auto`, type chips con scroll horizontal en mobile.
- Lasso: ya usa pointer events + `touch-action: none` (debería funcionar en táctil); se verifica en viewport 380px.
- Verificación visual de ambas páginas a 380px con el preview. Resuelve P8.

## Manejo de errores

- Resolver geográfico: cualquier excepción → señal se guarda sin province/city, se loggea warning.
- `/api/map/signals` caído → los mapas muestran su estado de carga/vacío existente; sin crash.
- georef API caído → el script de backfill reporta y sale sin tocar la DB; re-ejecutable.
- Geolocalización denegada → cambio de modo visible al usuario, sin coordenadas inventadas.

## Verificación

1. `npm run check` + `npm run check:routes` + `npm run build` (lo que corre CI).
2. Dev server + preview: `/el-mapa` y `/explorar-datos` en desktop y 380px.
3. Smoke de endpoints: `GET /api/map/signals` devuelve las tres familias unificadas; POST de dream con coordenadas reales persiste province/city snapeadas.
4. Backfills ejecutados contra la DB de `.env` y verificados con counts antes/después.

## Fuera de alcance (documentado para futuro)

Choropleth provincial, matching necesidades↔recursos, estado compartible en URL, clasificación temática por LLM, consolidación de las 4 columnas de texto de `dreams`, envíos anónimos, migración JWT→cookies.
