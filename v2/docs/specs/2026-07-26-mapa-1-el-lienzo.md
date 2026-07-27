# Mapa · 1 — El lienzo

**Fecha:** 2026-07-26
**Paraguas:** `docs/specs/2026-07-26-el-mapa-instrumento-territorial.md` — implementa §4 y §5
**Decisiones que aplica:** D3 (sin librería de mapas), D4 (esqueleto siempre, calles finas bajo demanda)
**Depende de:** nada. Es el primer sub-proyecto y no toca base de datos ni la app móvil.
**Habilita:** el lazo de la spec 3 (vía `desproyectar`), el render de precisión de la spec 2

> **Qué entrega.** La misma página, con un mapa que tiene adentro. Hoy Argentina es una silueta de 24 formas planas; al terminar esto se le puede entrar: partidos, rutas, ríos, manchas urbanas, localidades — todo dibujado a tinta, todo precomputado, sin una sola dependencia nueva.

---

## 1. Alcance

**Entra:** el pipeline de geografía, el módulo de proyección invertible, el componente de lienzo con zoom por altitud, y el render honesto de precisión al único nivel que hoy existe en la base (`province`).

**No entra:** coordenadas en la base, lazo, capas de datos nuevas, nada del móvil. La página sigue mostrando exactamente los mismos datos que hoy — mejor dibujados y navegables.

---

## 2. El pipeline

`scripts/build/build-mapa-argentina.ts` se convierte en `scripts/build/geo/`, un módulo por capa más un orquestador. El script actual queda como el módulo de provincias, casi sin cambios: su proyección y su centroide por fórmula del cordón (*shoelace*) se extraen a `proyeccion.ts` y `centroide.ts` para que las demás capas los reusen.

```
scripts/build/geo/
  index.ts            # orquestador — corre todas las capas, reporta pesos
  proyeccion.ts       # px/py + las inversas (§3)
  centroide.ts        # shoelace, extraído del script actual
  capas/
    provincias.ts     # el script actual, portado
    departamentos.ts
    localidades.ts
    esqueleto.ts      # costa, ríos mayores, rutas nacionales
    urbano.ts         # manchas urbanas + rutas provinciales, por provincia
  data/               # fuentes commiteadas
```

### 2.1 Salidas

| Salida | Contenido | Cuándo se carga |
|---|---|---|
| `apps/web/src/geo/pais.generated.ts` | 24 provincias + esqueleto grueso | en el bundle, siempre |
| `apps/web/public/geo/prov-{iso}.json` | departamentos, rutas provinciales, manchas urbanas, localidades de esa provincia | fetch al entrar a la provincia |
| `apps/web/src/geo/proyeccion.generated.ts` | las constantes de proyección + `proyectar`/`desproyectar` | en el bundle, siempre |

Los `.generated.ts` se commitean, igual que hoy. Los `.json` de `public/geo/` también: son build-time, no runtime, y commitearlos los hace auditables y reproducibles.

### 2.2 Presupuesto de peso

De §4 del paraguas, y es techo, no aspiración:

| Salida | Techo |
|---|---|
| `pais.generated.ts` | 210 KB |
| `prov-{iso}.json`, el más pesado (Buenos Aires) | 200 KB |
| `prov-{iso}.json`, mediana | 80 KB |

El orquestador imprime el peso de cada salida y **falla con exit 1 si alguna se pasa**. Si un chunk se pasa, se sube la tolerancia de simplificación de esa capa — nunca el techo. La simplificación es Douglas-Peucker con tolerancia por capa y por altitud, declarada en el header del módulo generado.

### 2.3 Fuentes

| Capa | Fuente | Licencia |
|---|---|---|
| Provincias | Natural Earth *(ya commiteada)* | dominio público |
| Departamentos/partidos | IGN Argentina — capa de departamentos | dominio público |
| Rutas, ríos, manchas urbanas | extracto OSM de Argentina (Geofabrik) | ODbL — **exige atribución visible** |
| Localidades | se define en la spec 2 §8.2 del paraguas | a determinar |

La atribución de OSM va en el pie del mapa, no escondida en un `about`. Cada módulo generado lleva su fuente y su licencia en el header, como ya hace el script actual.

El extracto de Geofabrik (~1,2 GB) **no se commitea**. El pipeline documenta cómo bajarlo y `data/` lleva un `README.md` con el comando y el hash del archivo esperado. Correr el pipeline es una operación manual y ocasional, igual que hoy.

---

## 3. La proyección invertible

La actual es equirectangular corregida por `cos(latitud media)`, con `kx`, `k`, `minLon`, `maxLat` y `MARGEN` calculados sobre los bounds del GeoJSON de provincias. **Es invertible; solo falta exportar la inversa.**

`proyeccion.generated.ts` exporta las constantes ya resueltas y el par:

```ts
export function proyectar(lng: number, lat: number): { x: number; y: number }
export function desproyectar(x: number, y: number): { lng: number; lat: number }
```

**Los bounds se congelan.** Hoy salen de los bounds del GeoJSON de provincias; si mañana una capa nueva los corriera un milímetro, todos los paths existentes se moverían y la inversa dejaría de coincidir con lo dibujado. El orquestador calcula los bounds **una sola vez, desde la capa de provincias**, y todas las demás capas los reciben. Un test lo afirma.

Esta es la costura que rompe D6 si se olvida: sin `desproyectar`, el lazo de la spec 3 no puede volverse polígono en lng/lat y no puede compartir código con el móvil.

---

## 4. El lienzo en la página

`MapaArgentina.tsx` (170 líneas hoy) se parte. La página tiene tope de 300 líneas y este componente va a crecer.

```
pages/ElMapa/lienzo/
  Lienzo.tsx           # el <svg>, el estado de altitud, el viewBox animado
  useAltitud.ts        # zoom/pan → altitud + provincia enfocada, y la carga del chunk
  CapaProvincias.tsx
  CapaDepartamentos.tsx
  CapaEsqueleto.tsx    # rutas, ríos, costa
  CapaUrbana.tsx
  CapaSenales.tsx      # el render honesto de §5 del paraguas
```

### 4.1 Las cuatro altitudes

| Altitud | Se entra | Unidad interactiva | Qué se suma |
|---|---|---|---|
| `pais` | inicial | provincia | — |
| `provincia` | click en provincia, o zoom > umbral | departamento | chunk de la provincia |
| `localidad` | click en departamento o localidad | localidad | detalle urbano |
| `cuadra` | solo al clavar un pin (spec 2) | el pin | recuadro de calles bajo demanda |

La transición es del `viewBox`, animada — el mismo lienzo, nunca un remonte. Cada altitud tiene su **miga de pan** («Argentina › Buenos Aires › La Matanza») que es también el camino de vuelta.

### 4.2 Accesibilidad

La spec original resolvió esto con cuidado y hay que no romperlo: la unidad interactiva es la región (24 tab-stops máximo en país), los puntos son textura `aria-hidden`, y el orden del DOM pone el panel de conversión antes del mapa para que el tabulador no pise 24 provincias antes de llegar al formulario.

Se extiende con lo mismo por altitud: al entrar a una provincia, los tab-stops pasan a ser sus departamentos, no las 24 provincias más los departamentos. Un `aria-live` anuncia el cambio de altitud.

**El zoom no puede ser solo gestual.** Botones de más/menos y de volver, operables por teclado, junto a la miga de pan.

---

## 5. El render honesto de precisión

De §5 del paraguas. En este sub-proyecto **toda señal está en `province`**, así que lo único que se implementa hoy es el lavado — pero se implementa con la tabla completa para que la spec 2 solo tenga que empezar a mandar precisiones distintas.

| Precisión | Dibujo | Radio del halo |
|---|---|---|
| `province` | lavado de tinta sobre la provincia, opacidad por cantidad | — |
| `city` · `neighborhood` | punto en el centroide + halo difuso | `publicLocationUncertaintyKm()` |
| `500m` · `100m` | punto nítido + halo chico | `publicLocationUncertaintyKm()` |
| `exact` | punto nítido, sin halo | 0 |

El radio del halo **no se inventa**: `publicLocationUncertaintyKm()` del núcleo ya lo calcula por precisión. Acá solo se convierte de km a unidades del viewBox usando `k` de la proyección.

### 5.1 Lo que muere en este sub-proyecto

- `el-mapa-geo.ts` — `puntosJitter` y `MAX_PUNTOS_PROVINCIA`. Son puntos inventados alrededor de un centroide; bajo un lazo pasan de adorno a mentira medible.
- La leyenda *«Cada punto es una voz real, ubicada en su provincia — no en una dirección»*. Se reemplaza por una que nombra la precisión de lo que se está mirando:

  > **Todas las voces de este mapa están ubicadas a nivel provincia.** Cuando alguien elige un lugar más preciso, el punto se dibuja más chico y el halo se achica con él.

  El segundo período es promesa de lo que viene y hay que **borrarlo si la spec 2 se demora**, para no prometer lo que la página no hace.

- El número sobre el racimo (`total > MAX_PUNTOS_PROVINCIA`) sobrevive: sigue siendo el conteo autoritativo por provincia, ahora sobre el lavado en vez de sobre los puntos.

---

## 6. Cómo se verifica

- **Reproducibilidad** — regenerar desde la fuente produce byte por byte el mismo archivo. Un test lo corre en CI; es la misma garantía que el script actual da hoy de palabra y nadie chequea.
- **Ida y vuelta de la proyección** — `desproyectar(proyectar(lng, lat))` sobre las 24 capitales provinciales, tolerancia declarada (la proyección redondea a un decimal del viewBox, así que la tolerancia es esa, no cero).
- **Bounds congelados** — un test afirma que los bounds salen de la capa de provincias y que agregar capas no los mueve.
- **Presupuesto** — el orquestador falla con exit 1 si una salida se pasa del techo de §2.2.
- **Componentes** — `Lienzo` renderiza las 24 provincias en altitud país; entrar a una provincia carga su chunk y cambia los tab-stops; la miga de pan vuelve.
- **Accesibilidad** — test de que el orden de tabulación sigue siendo panel → mapa, y que los tab-stops del mapa son la unidad de la altitud actual.

---

## 7. Listo cuando

1. `pnpm verify` verde
2. Las cuatro altitudes se navegan con mouse y con teclado, y la miga de pan vuelve desde cualquiera
3. Ninguna salida se pasa de su techo de peso, verificado por el propio pipeline en CI
4. `desproyectar` existe, está exportada y tiene su test de ida y vuelta — sin esto la spec 3 está bloqueada
5. No queda jitter en el código ni leyenda que prometa lo que la página no hace
6. La atribución de OSM está visible al pie del mapa

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Los pesos estimados en el paraguas no aguantan los datos reales | El techo es del pipeline, no del criterio. Si Buenos Aires no entra en 200 KB, se simplifica más — y si aun así no entra, se parte el chunk por departamento y se declara en la spec |
| Cambiar los bounds mueve todos los paths existentes | Bounds congelados desde la capa de provincias, con test (§3) |
| El pipeline se vuelve incorrible porque nadie tiene el extracto de OSM | `data/README.md` con el comando exacto, la URL y el hash esperado. Correrlo es ocasional, no parte del build normal |
| Partir `MapaArgentina.tsx` rompe la conversión | La conversión vive en `PanelSoltarVoz` y `FeedVoces`, que no se tocan. El lienzo es reemplazo interno del `<svg>` |
