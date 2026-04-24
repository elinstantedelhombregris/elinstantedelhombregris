# La Radiografía — Map Interaction Design

**Date:** 2026-04-24
**Page:** `/explorar-datos` (La Radiografía)
**Target section:** `ConvergenceMapSection` in `SocialJusticeHub/client/src/pages/ExplorarDatos.tsx`

## Problem

La Radiografía's 3D map currently renders a `HexagonLayer` (density) and `ArcLayer` (inter-city connections) via `deck.gl` + `maplibre-gl`. Two gaps:

1. **No feedback on hover.** Points/hexagons are visible but you cannot learn what any one of them represents — no tooltip, no picking.
2. **No way to narrow the view.** You can only look at the whole country, never at one province, one city, or a neighborhood you drew on the map.
3. **No type filtering.** Every señal (sueño, valor, necesidad, ¡BASTA!, compromiso, recurso) is mixed in one density rendering.

## Goals

- Hover any point or hexagon and immediately understand what is underneath.
- Narrow the map by province, city, and/or arbitrary hand-drawn area ("lazo").
- Toggle each señal type on/off independently.
- All filters compose (logical AND) and are clearable in one click.
- Self-contained to the map section — does not require touching Sankey, Chord, Constellation, or AI Insights sections in this round. Extension path preserved for a later spec to wire filters into the full page.

## Non-goals

- Filtering the rest of the page (Sankey, Chord, Constellation, AI Insights, counters) based on the map's filters — deferred to a future spec.
- Full GIS editing (vertex manipulation, snapping, polygon union/intersection) — one-shot lasso is enough.
- Saving/sharing a selection via URL or backend — not in this round.
- Server-side filtering endpoints — client-side filtering is sufficient for current data volumes and is required anyway for lasso (arbitrary polygon).
- Changing the existing `GeographicFilters.tsx` component used elsewhere — we build a dark-themed variant for this page only.

## Architecture

### New files

```
client/src/components/radiografia-map/
  ConvergenceMap.tsx          # orchestrator; replaces inline ConvergenceMapSection
  MapFiltersBar.tsx           # province + city dropdowns, type chips, Lazo button, chips
  MapTooltip.tsx              # HTML tooltip content (hexagon vs point variants)
  LassoOverlay.tsx            # SVG polygon capture + screen→world conversion
  SelectionPanel.tsx          # summary + virtualized list drawer
  useRadiografiaFilters.ts    # filter state + filteredEntries pipeline
  useProvinceClassifier.ts    # lazy-load boundaries GeoJSON + classify points
  types.ts                    # MapEntry, MapFilters, LassoPolygon
```

### Changed files

- `client/src/hooks/useDeckGLLayers.ts` — expose a `allEntries` array (each entry carries `id`, `lat`, `lng`, `type`, `text`, `location`, and, when available from the API, `province` and `city`). The existing `hexagonData` and `arcData` are derived from `allEntries` and remain for backward compatibility, but the new map consumes `allEntries` and computes layers from the filtered subset.
- `client/src/pages/ExplorarDatos.tsx` — replace the `ConvergenceMapSection` component body with `<ConvergenceMap />`. Keep the surrounding `NarrativeBridge` and heading copy untouched.

### Static asset

- `client/public/data/argentina-provinces-simplified.geojson` — Argentina's 24 provinces as simplified polygons, ~200 KB. Lazy-loaded only when `ConvergenceMap` mounts. Used by `useProvinceClassifier` to assign a province to dreams that only carry lat/lng.

## Data flow

```
useDeckGLLayers        → allEntries (raw, normalized from /api/dreams, /api/commitments, /api/resources-map)
                              │
useProvinceClassifier  → fills in `province` / nearest-city `city` for entries that lack them
                              │
useRadiografiaFilters  → { filters, setProvince, setCity, setLasso, setType, clear, filteredEntries }
                              │
       ┌──────────────────────┼──────────────────────────────┐
       ▼                      ▼                              ▼
 HexagonLayer          ScatterplotLayer                SelectionPanel (if lasso active)
 (aggregated,          (zoom ≥ 7, pickable,            (summary + list of filteredEntries)
  from filteredEntries) colored by TYPE_COLORS)
```

- **All four filters (type, province, city, lasso) compose with logical AND.**
- **Hexagon / Arc layer toggle** from the current UI is preserved. ScatterplotLayer only renders when the active aggregate layer is `hexagon` — never on top of the `arc` layer (visual noise).
- **ArcLayer**, when active, is also computed from `filteredEntries`.

## Filter semantics

| Filter | Default | Match rule |
|--------|---------|------------|
| type   | all six on | entry's `type` is in the active set |
| province | none (all) | entry's `province` equals the selected province name |
| city | none (all) | entry's `city` equals the selected city name |
| lasso | none | `@turf/boolean-point-in-polygon` returns true for `[lng, lat]` in the lasso polygon |

### Province / city resolution

- **Commitments & resources** already carry `province` and `city` in the DB — used directly.
- **Dreams** only carry free-text `location` plus lat/lng. Resolved client-side:
  - Province via point-in-polygon against `argentina-provinces-simplified.geojson`.
  - City via nearest-centroid lookup within the matched province, using data from `/api/geographic/provinces/:id/cities`. Cap the match at 50 km; beyond that, the entry is province-assigned but city-unassigned.
- Resolution runs once on load, results memoized.

## UI

### Filters bar (top of map section)

Dark glassmorphism: `bg-white/5 backdrop-blur-md border border-white/10`, rounded, sits above the map canvas.

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [Sueños] [Valores] [Necesidades] [¡BASTA!] [Compromisos] [Recursos]      │
│                                                                           │
│ [Provincia ▼] [Ciudad ▼]    ·    [◈ Lazo]    ·    [× Limpiar]            │
│                                                                           │
│ ─ Chips (when filters active) ─────────────────────────────────          │
│ Córdoba ×   Río Cuarto ×   Lazo: 47 señales ×                             │
└───────────────────────────────────────────────────────────────────────────┘
```

- **Type chips** — each uses its `TYPE_COLORS[type]` hue. Selected = full-color background + white text. Unselected = muted outline, background at ~8% opacity. Click to toggle. Keyboard: `role="switch"`, `aria-checked`.
- **Province dropdown** — populated by `/api/geographic/provinces`. Disabled while loading; placeholder "Todas las provincias".
- **City dropdown** — disabled until province is selected. Populated by `/api/geographic/provinces/:id/cities`. Placeholder "Todas las ciudades".
- **Lazo button** — primary when no lazo exists ("◈ Lazo"), active state when in selection mode ("Dibujando…" with pulsing ring + Cancelar affordance), secondary when a lazo exists ("◈ Nuevo lazo").
- **Limpiar button** — only visible when any filter is active. Resets type chips to all-on, clears province/city/lasso, closes the SelectionPanel.
- **Active-filter chips row** — compact summary of non-default state: province name, city name, "Lazo: N señales". Each has its own `×`.
- **Camera fly-to** — selecting a province fans to its centroid; selecting a city fans to its lat/lng. Uses DeckGL `transitionDuration: 1200` with `FlyToInterpolator`.

### Tooltip (via DeckGL `getTooltip`)

Dark card styled with inline Tailwind-equivalent CSS (DeckGL's tooltip is a plain `div`, no React).

**Hexagon (aggregate):**

```
47 señales en esta zona
─────────────────────────
18 sueños · 14 necesidades · 8 ¡BASTA!
7 compromisos
Localidades: Rosario · Córdoba · Santa Fe
```

Only counts entries of active types. Caps localidades at 3, appends "+N más" when more.

**Individual point (zoom ≥ 7):**

```
◉ Necesidad
─────────────────────────
"Educación pública gratuita y laica en todos
los niveles"
Mendoza, Mendoza
```

Truncates `text` to 120 chars + ellipsis. Dot and label colored by `TYPE_COLORS[type]`.

### Lazo interaction

1. Click "◈ Lazo". `controller` on DeckGL set to `false`. Cursor becomes crosshair. `LassoOverlay` mounts on top (absolute-positioned SVG, same dimensions as the map container).
2. Press + drag. Each `pointermove` event pushes a `{ x, y }` to `pathPoints`. Path rendered as SVG `<polyline>` in iris-violet `#7D5BDE` with 30% fill.
3. Release. If `pathPoints.length < 3`, discard and exit silently. Otherwise close the polyline, convert screen points to lat/lng via `deck.getViewports()[0].unproject([x, y])`, store as a GeoJSON Polygon in state.
4. `filteredEntries` recomputes; `SelectionPanel` slides in.
5. Polygon persists on the map as a semi-transparent fill until cleared or redrawn.
6. Starting a new lazo discards the previous polygon.

### Selection panel (when lasso is active)

Desktop: right-anchored drawer, 420 px wide, glass card, sticky header.
Mobile: bottom sheet, ~75 vh, swipe-down dismiss.

```
┌── Zona seleccionada ──────────────── × ──┐
│ 234 señales                              │
│                                          │
│ ├ Sueños            89   ████████        │
│ ├ Necesidades       67   ██████          │
│ ├ ¡BASTA!           45   ████            │
│ ├ Compromisos       33   ███             │
│                                          │
│ Localidades: Rosario, Pergamino, +4      │
│ Temas top: educación, salud, trabajo     │
│ ──────────────────────────────────────── │
│ Voces (234)                              │
│ ◉ Necesidad  "Educación pública…"        │
│ ◉ Sueño      "Un país donde..."          │
│ ◉ ¡BASTA!    "¡Basta de..."              │
│ …                                        │
└──────────────────────────────────────────┘
```

- Summary bars reflect counts after all filters (type/province/city are already applied to `filteredEntries`).
- "Localidades" capped at 5 distinct names; "+N" collapses the rest.
- "Temas top" uses the same theme-extraction used by `useConvergenceAnalysis` — capped at 3.
- List is virtualized with `react-window`'s `FixedSizeList` when entries > 100. Row height ~64 px. Each row shows the type color dot, type label, text truncation, and location.
- Clicking a row scrolls/zooms the map to that entry's lat/lng and briefly highlights it (scale-up pulse on its scatterplot dot, 1.5 s).

## Mobile behavior

- Entering lazo mode on touch: DeckGL `controller={false}` disables pan/zoom. Floating bar at bottom: **"Dibujá el área con el dedo"** + **Cancelar**.
- Releasing draw closes the bar and opens `SelectionPanel` as a bottom sheet.
- LassoOverlay uses `onPointerDown/Move/Up` — works identically for mouse, touch, and pen.
- Filter bar scrolls horizontally on narrow widths; chips wrap below.

## Edge cases

| Case | Handling |
|------|----------|
| Fewer than 3 points drawn | Discard, exit selection mode silently, no panel. |
| Lazo outside Argentina / zero entries | Panel opens with empty state: "No encontramos señales en esta zona. Probá con un área más grande o sin otros filtros." |
| Filters + lazo returns zero | Same empty state, with "Probá limpiando los filtros." |
| `argentina-provinces-simplified.geojson` fails to load | Fall back to DB-provided `province`/`city` fields only. Dreams without them are excluded from province filters but still appear on the map, still hoverable, still lasso-selectable. Log a warning. |
| DeckGL not ready when Lazo button clicked | Button disabled until `onLoad` fires. |
| WebGL2 not supported (`hasWebGL2` false) | Existing fallback message stays. No filter bar, no lazo rendered — they need the map. |
| `unproject` returns invalid coords | Skip that vertex. |
| Turf throws on degenerate / self-intersecting polygon | Toast: "No pudimos procesar el área. Intentá de nuevo." Clear the lasso state. |
| Route change while panel open | Panel unmounts with DeckGL. State is local, nothing persisted. |

## Error handling

- `/api/geographic/provinces` failure → dropdowns show "No se pudieron cargar las provincias" + retry button. Lazo and type filters keep working.
- `/api/geographic/provinces/:id/cities` failure → city dropdown shows retry; province filter still works.
- Classifier fallback above covers the boundaries-file case.

## Performance

- Client-side province classification runs once per session (dreams only), memoized.
- `filteredEntries` recomputed via `useMemo` keyed on filter state and `allEntries` reference.
- Scatterplot uses `updateTriggers` keyed on filter state so layer state rebuilds only on filter change, not on pointer movement.
- Lasso polygon kept as React state (SVG overlay), not as a DeckGL layer — avoids layer churn during draw.
- `SelectionPanel` list virtualized above 100 entries.
- Argentina provinces GeoJSON simplified to ~200 KB; lazy-loaded via `fetch` from `/data/argentina-provinces-simplified.geojson` only when the map section mounts.
- Base map style reused from the existing `MAP_STYLE` constant (CartoDB dark-matter); no additional tile-server cost.

## Testing

### Unit (vitest)

- `useRadiografiaFilters`:
  - AND composition of type, province, city, lasso
  - `clear()` resets type to all-on and all others to empty
  - Adding a lasso after province selection restricts to intersection
  - Toggling off all type chips returns zero entries
- `useProvinceClassifier`:
  - Point in Córdoba returns Córdoba
  - Point in the ocean returns `null`
  - Point on a boundary lands in a province (turf's default behavior treats boundary points as inside; the test documents this)
  - Nearest-city returns closest centroid within 50 km; returns `null` beyond
- Tooltip rendering functions: hexagon summary and point-detail given sample entries

### Component (vitest + RTL)

- `MapFiltersBar`:
  - Loads provinces, cascades cities on province change, clears city when province changes
  - Chips reflect active filters; `×` on a chip clears that filter
  - `Limpiar` hidden when no filters active, visible and resets everything when any filter active
  - Type chips toggle aria-checked
- `SelectionPanel`:
  - Renders summary counts and list
  - Shows empty state for zero entries
  - Row click dispatches the expected `flyTo` call

### Manual smoke

- Draw a lasso that crosses a province boundary → panel count equals sum of two hexagon tooltip counts in that area.
- Zoom past ~7 on a dense area → ScatterplotLayer dots appear, colored by type.
- Toggle "Sueños" off → hexagons shrink, scatterplot dots disappear, Sankey/Chord unchanged (confirms map-only scope).
- Select "Córdoba" → camera flies in, dropdowns cascade, filters compose correctly with a subsequent lasso.
- Mobile (DevTools emulation): Lazo button enters selection mode, finger-drag draws, bottom sheet opens on release.

### Automated guardrails

- `npm run check` and `npm run check:routes` must pass.
- No new e2e tests — existing `verify:full` covers route + build. Pointer-interaction testing is out of scope for the current harness.

## Dependencies to add

- `@turf/boolean-point-in-polygon` — polygon hit-testing. Targeted import, ~10 KB.
- `react-window` (if not already present) — list virtualization; verify in `package.json` before adding.

## Open items for the implementation plan

- Confirm whether `react-window` is already installed; if yes, reuse — otherwise add it.
- Source the simplified provinces GeoJSON (e.g. from Natural Earth Admin-1 clipped to ARG, or IGN open data), verify size is under ~250 KB after simplification, and commit under `client/public/data/`.

## Extension path (future spec)

- Lift the filter state into a page-level context or URL params so other sections (Sankey, Chord, Constellation, AI Insights, counters) can subscribe.
- Add a "Compartir vista" button that encodes filters + lasso in the URL.
- Add a "Descargar CSV" export for the current selection on the panel.
