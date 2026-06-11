# EL MAPA Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix EL MAPA's collection integrity (no fake coords, server-side geo resolution, privacy snap) and presentation (all signals — not 20 —, filters that drive the whole Radiografía, time filter, mobile polish).

**Architecture:** A unified `GET /api/map/signals` endpoint replaces the triplicated 3-query client merge. A server-side geo resolver (point-in-polygon over the existing province GeoJSON + nearest-city) classifies signals at write time into new `dreams.province/city` columns. `ExplorarDatos` lifts filter state above `ConvergenceMap` so Sankey/Chord/stats react to map filters.

**Tech Stack:** Express + Drizzle (Neon PG), React 18 + wouter + react-query, Deck.GL, vitest.

**Spec:** `docs/superpowers/specs/2026-06-11-el-mapa-overhaul-design.md`

All paths relative to `SocialJusticeHub/`.

---

### Task 1: Shared MapSignal type
- Create `shared/map-signals.ts`: `SignalType` union (6 tipos), `SIGNAL_TYPES`, `MapSignal { id, type, text, lat|null, lng|null, location, province, city, category, createdAt }`.
- Verify `npm run check`; commit.

### Task 2: Server geo resolver (pure, TDD)
- Generate `server/data/argentina-provinces.ts` from `client/public/data/argentina-provinces-simplified.geojson` (embedded module so esbuild inlines it in the Vercel bundle).
- Test first: `tests/unit/geo-resolver.test.ts` — snapCoords (2 decimales), pointInPolygonFeature (cuadrado sintético), resolveProvince (CABA → "Ciudad Autónoma de Buenos Aires", Córdoba, océano → null), nearestCity (≤50 km, lista vacía).
- Implement `server/geo-resolver.ts`: ray-casting Polygon/MultiPolygon con agujeros, mapping Natural Earth → nombre oficial, haversineKm, nearestCity, snapCoords.
- `npx vitest run tests/unit/geo-resolver.test.ts` → pass; commit.

### Task 3: Schema columns + DB migration
- `shared/schema.ts` y `shared/schema-sqlite.ts`: dreams += `province: text("province")`, `city: text("city")`.
- `scripts/migrate-dreams-geo.ts`: `ALTER TABLE dreams ADD COLUMN IF NOT EXISTS province TEXT` / `city TEXT` via neon + dotenv; imprime verificación.
- `cp` del `.env` del checkout principal (gitignored), correr migración, `npm run check`.
- MemStorage.createDream: agregar `province/city ?? null` si construye el objeto campo por campo. Commit.

### Task 4: Geo resolution at write time
- `server/geo-service.ts`: `resolveSignalGeo(rawLat, rawLng)` = snap + resolveProvince + nearestCity (ciudades de geographic_locations cacheadas 10 min). Nunca lanza.
- `POST /api/dreams`: coords numéricas → resolver y persistir snap+province+city; sin coords → null (jamás inventar). Acepta `body.province` del modo "elegir provincia" como fallback.
- `POST /api/resources-map`: mismo patrón (lat/lng numéricos).
- `storage.resolveLocationFromCoordinates` (DatabaseStorage): delega en `resolveSignalGeo` (provincia por polígono en vez de centroide más cercano). `saveCommitment` persiste coords snapeadas.
- `npm run check` + vitest; commit.

### Task 5: Unified GET /api/map/signals
- `server/routes-map-signals.ts`: `registerMapSignalsRoutes(app)`; query a dreams + user_commitments + user_resources(isActive), normaliza a MapSignal, sort desc por createdAt, cap 5000, `publicReadRateLimit`. Respuesta `{ signals, total }`.
- Registrar en `server/routes.ts` junto a los otros register*Routes.
- `npm run check && npm run check:routes`; smoke con curl; commit.

### Task 6: Client useMapSignals + filtros tiempo
- `client/src/hooks/useMapSignals.ts` (+ `MAP_SIGNALS_QUERY_KEY`).
- `radiografia-map/types.ts`: MapEntry lat/lng nullable, += createdAt, category; MapFilters += `timeRange: '7d'|'30d'|'all'`.
- `radiografia-map/utils.ts`: `toMapEntries(signals)`, `parseSignalDate` (tolerante a "YYYY-MM-DD HH:mm:ss+00").
- `useConvergenceAnalysis(entries?)`: parametrizado; queries internas con `enabled: entries === undefined` (compat con otros consumidores); análisis itera `{type, text}`.
- `useRadiografiaFilters`: cutoff temporal, guard de coords null en lasso, `setTimeRange`, `hasActiveFilters` incluye timeRange.

### Task 7: ExplorarDatos owns filters + ConvergenceMap props + mobile filter bar
- `ConvergenceMap({ entries, filtersApi, isLoading })`: sin hooks de datos internos; `geoEntries` memo (coords no-null) para hex/scatter/arc.
- `useProvinceClassifier.classify`: guard `entry.lat == null → return entry`.
- `MapFiltersBar`: chips de período (7d/30d/Todo) + props timeRange/onSetTimeRange; mobile: contenedor `flex-col sm:flex-row`, selects `w-full sm:w-auto`, Limpiar `sm:ml-auto`.
- `ExplorarDatos`: useMapSignals → toMapEntries → classify → useRadiografiaFilters; `convergence = useConvergenceAnalysis(hasActiveFilters ? filteredEntries : enrichedEntries)`; `filterNote` ("Mostrando X de Y señales") en Scrollytelling/Sankey/Chord.
- Borrar `useDeckGLLayers.ts` si quedó sin consumidores. `npm run check`; commit.

### Task 8: Honest collection — SovereignInput modes + SovereignMap
- `SovereignInput`: modos `geo | province | none` (chips) en lugar del checkbox; dropdown de provincias (`/api/geographic/provinces`, enabled solo en modo province); submit deshabilitado si province sin elegir; en error `GEOLOCATION_FAILED` cambia a modo province sin borrar el texto; payload `{ type, content, locationMode, province, resourceCategory? }`.
- `SovereignMap.handleCreate`: geo → geolocation o throw GEOLOCATION_FAILED (toast claro); province → centroide + nombre; none → todo null. Nunca más CABA por defecto. `setView` solo con coords. Re-throw GEOLOCATION_FAILED.
- `SovereignMap` consume `useMapSignals` (markers con lat/lng numéricos, popup con shape legacy inline para EnhancedPopup, pulse feed = slice(0,5), contador = signals.length, invalidaciones MAP_SIGNALS_QUERY_KEY + legacy key).
- `npm run check`; commit.

### Task 9: Backfills
- `scripts/backfill-city-coords.ts`: georef API (municipios + localidades, paginado 1000, aplanar), match por nombre+provincia normalizados, UPDATE solo filas NULL. Reporta updated/missed.
- `scripts/backfill-signal-geo.ts`: dreams/user_commitments/user_resources con coords y province NULL → resolveProvince + nearestCity → UPDATE. NO redondea coords históricas.
- Correr ambos en orden; spot-check `SELECT province, count(*) FROM dreams … GROUP BY 1`. Commit.

### Task 10: Full verification + mobile pass
- `npm run verify` + `npx vitest run`.
- Preview desktop y 380×800: `/el-mapa` (markers, pulse, FAB, modos de ubicación) y `/explorar-datos` (hexágonos, chips → Sankey/números reaccionan, período, lasso, "Mostrando X de Y", filter bar sin overflow, bottom-sheet).
- Fix + re-verify + screenshots + commit final.
