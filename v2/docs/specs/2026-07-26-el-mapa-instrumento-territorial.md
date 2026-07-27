# El mapa como instrumento territorial — spec paraguas

**Fecha:** 2026-07-26
**Alcance:** `v2/apps/web` (`/el-mapa`) · `v2/apps/api` · `v2/packages/*` · `juego/src/civic`
**Reemplaza parcialmente:** `docs/specs/2026-07-22-el-mapa-papel-y-tinta.md` (la portada, el panel y el feed sobreviven intactos; muere el jitter decorativo y la leyenda de provincia)
**Se apoya en:** `docs/plans/2026-07-24-v2-integrated-civic-platform-mobile-blueprint.md` (§1.1 el puente web↔móvil, §1.2 la unidad de valor)
**Naturaleza:** spec paraguas. Fija el vocabulario, la política y las interfaces. **No se implementa directo:** de acá salen cuatro specs hijas, una por sub-proyecto (§10).

> **Tesis.** `/el-mapa` hoy convierte y no analiza; `/explorar-datos` de v1 analiza y nadie lo ve. El mapa de v2 tiene que hacer las dos cosas en una sola página — soltar la primera voz en 30 segundos arriba, y abajo un instrumento con el que alguien pueda cercar su barrio y entender qué pasa ahí. Y lo que se carga en el mapa se localiza **donde efectivamente está**: un pozo, un semáforo roto, un punto donde se reparte algo o una necesidad declarada no sirven a 100 metros de distancia.

---

## 1. Por qué

### 1.1 El estado de las dos versiones

**v1** tiene el instrumento y no lo muestra. `/explorar-datos` (La Radiografía) corre deck.gl con `HexagonLayer` + `ArcLayer`, lazo funcionando sobre turf (`client/src/components/radiografia-map/LassoOverlay.tsx`, 181 líneas), panel de selección virtualizado con extracción de temas (267), barra de filtros por tipo/provincia/ciudad/rango temporal, fly-to y tooltips. Más `MapPulseAnalytics` (573) sobre `useMapPulseAnalysis` (442). Las señales tienen lat/lng reales y hay ciudades con coordenadas backfilleadas.

**v2** tiene la belleza y no analiza. `/el-mapa` dibuja un SVG de Argentina precomputado en build (`scripts/build/build-mapa-argentina.ts` → `argentina-mapa.generated.ts`, 10 KB), con las voces reales de la base y un panel de conversión que funciona. Pero cada voz está anclada **solo a su provincia**: los puntos que se ven son *jitter decorativo* alrededor del centroide provincial.

**`/explorar-datos` en v2** quedó como scaffold sin convertir a Papel y Tinta: maplibre con marcadores en centroides provinciales y un formulario de carga duplicado.

### 1.2 El hallazgo que reordena el trabajo

La app móvil (`juego/`) **no está atrás del mapa web: está muy adelante**. En `juego/src/civic/` hay ~18.600 líneas con tests que ya resolvieron los problemas que el mapa web está por enfrentar:

| Módulo | Qué resuelve |
|---|---|
| `types.ts` | `LocationPrecision`, `LocationRole`, `CivicSensitivity`, `CivicAudience`, `GeoPoint` |
| `location-policy.ts` | qué precisión se publica según audiencia |
| `geo.ts` | `publicLocation()` — derivar el punto público del exacto |
| `lasso.ts` | `pointInPolygon`, `selectTerritoryPoints`, `polygonCenter` (con tests) |
| `coverage.ts` | grilla de celdas derivada del polígono de un lazo |
| `public-intelligence.ts` | territorio + período → prioridades cívicas rankeadas con evidencia y confianza |
| `disclosure-ledger.ts` · `disclosure-receipt.ts` | los recibos de divulgación que el blueprint exige |
| `map-point-action.ts` | qué acción ofrece cada punto del mapa (verificar, conectar, aportar, misión) |
| `need-access-grants.ts` · `need-access-grant-delivery.ts` | entregar el dato de una necesidad a quien se ofrece a ayudar |

Construir el lazo del mapa web desde cero significaría escribir una **segunda definición divergente** de precisión, divulgación y selección. Dos aplicaciones que mienten distinto sobre lo mismo. Ese es el riesgo central que esta spec existe para evitar.

---

## 2. Decisiones tomadas

Las specs hijas citan estas decisiones por número.

| # | Decisión | Descarta |
|---|---|---|
| **D1** | **Una sola página.** `/el-mapa` mantiene la conversión arriba y crece hacia abajo con el instrumento. La Radiografía deja de ser otra URL. | Mantener dos páginas como v1 |
| **D2** | **La precisión la elige quien habla** — de provincia hasta punto exacto clavado en el mapa. | Precisión fija por el sistema |
| **D3** | **Se sostiene «sin librería de mapas»** — la misma D3 del master plan Papel y Tinta, ratificada acá — y se le da profundidad con capas de geografía precomputada por altitud. | maplibre/deck.gl como motor; el híbrido de dos motores |
| **D4** | **Calles del esqueleto siempre; calles finas bajo demanda** solo en el momento de clavar un pin. | PMTiles auto-hospedado; renunciar a las calles |
| **D5** | **Cuatro capas de datos:** voces, pulso, propuestas, mandato. El mapa es la columna vertebral territorial de la plataforma. | Solo voces |
| **D6** | **Núcleo de código compartido con el móvil + captura en campo** hacia el mapa público. | Solo contrato de API; solo flujo de datos |
| **D7** | **Exactitud por defecto.** Ver §3.2 — reemplaza la política vigente del núcleo. | La regla actual: `exact` degradado a `100m` en todo canal colectivo |

---

## 3. El vocabulario compartido — `packages/civic-core`

### 3.1 Qué es y dónde vive

Un paquete de **lógica pura**: sin UI, sin APIs de plataforma, sin acceso a red ni a disco. Se extrae de `juego/src/civic/`:

- `types` — el subconjunto geográfico: `GeoPoint`, `LocationPrecision`, `LocationRole`, `CivicAudience`, `CivicSensitivity`
- `location-policy` — reescrito según §3.2
- `geo` — `publicLocation()`
- `lasso` — `pointInPolygon`, `selectTerritoryPoints`, `polygonCenter`
- `coverage` — la grilla sobre un polígono

Vive en `v2/packages/civic-core/`, donde ya hay workspace pnpm, CI, TypeScript estricto y disciplina de tests. `juego/` lo consume como **paquete versionado**, no como código copiado: eso preserva su independencia deliberada y hace que divergir requiera un bump de versión explícito — que es exactamente lo que el blueprint pide de un contrato entre las dos aplicaciones.

**ADR requerido:** cómo se distribuye el paquete. `juego/` usa npm con `package-lock.json` y está fuera del workspace de v2. Las opciones son publicar a un registry, fijar un tarball versionado, o mover `juego/` al workspace como `apps/mobile`. La spec hija de §10.2 decide y lo documenta.

### 3.2 La política nueva de exactitud (D7)

**La política vigente es más tosca que los tipos donde vive.** `sharedPrecisionForAudience` degrada `exact` a `100m` para toda audiencia que no sea privada, sin mirar `LocationRole` ni `CivicSensitivity` — que ya existen en el mismo archivo de tipos, bajo un comentario que dice literalmente que *lo que sabemos del lugar y lo que autorizamos compartir son ejes distintos*.

La regla nueva:

> **La precisión no se gobierna. Se gobierna el rol de la ubicación.**

`exact` es publicable y es el default. Lo que se carga en el mapa se localiza donde está.

| Rol | Qué es | En público |
|---|---|---|
| `capture` | dónde estaba parado quien observó | **exacto** — es la esquina del pozo, no la casa de nadie |
| `meeting_point` | dónde se entrega o se retira algo, dónde se juntan | **exacto** — sin exactitud el recurso no se puede usar |
| `service_area` | zona donde un recurso funciona | es un área; la precisión se expresa como radio, no como punto |
| `subject` | el lugar del que trata el registro | **exacto por defecto** |

La única excepción deja de ser ley del sistema y pasa a ser una **protección ofrecida y rechazable**:

```
publishedPrecision(pedida, rol, sensibilidad, audiencia):
  si rol === 'subject' && sensibilidad === 'high' && audiencia !== 'private':
      → se PROPONE engrosar, se explica por qué, la persona puede rechazarlo
  en cualquier otro caso:
      → se publica la precisión pedida, incluido 'exact'
```

Para el caso protegido, `need-access-grants` sigue siendo la máquina correcta: publicar grueso **y entregar el punto exacto a quien se ofrece a ayudar**. Pero es una opción que se elige, no una regla que se sufre.

### 3.3 Un valor nuevo en el enum

`LocationPrecision` hoy es `'exact' | '100m' | '500m' | 'neighborhood' | 'city'`. Le falta el nivel más grueso, que es donde vive el 100% de las voces web existentes. Se agrega **`'province'`** como sexto valor y como default del esquema de v2.

### 3.4 Consecuencias que se pagan

1. **Cambia el comportamiento de la app móvil ya publicada.** El núcleo es compartido: reescribir `location-policy.ts` reescribe lo que hace `juego/` en campo. No es un cambio solo web, y necesita su propia nota de versión.
2. **Hay ~1.600 líneas que codifican la regla vieja.** `need-access-grant-delivery.ts` (843) tiene `precision: '500m' | 'neighborhood' | 'city'` clavado en el payload del grant, y sus tests (739) afirman que el punto exacto nunca sale. Ensanchar el payload y reescribir esos tests es trabajo real, contabilizado dentro del sub-proyecto de §10.2.
3. **La leyenda pública miente a partir del cambio.** Hoy `/el-mapa` afirma *«Cada punto es una voz real, ubicada en su provincia — no en una dirección»*. Muere con la política (§9).

---

## 4. El lienzo — geografía por altitud

Cuatro altitudes. Cada una es un régimen de dibujo, no un nivel de zoom.

| Altitud | Qué se dibuja | Unidad interactiva | Peso |
|---|---|---|---|
| **País** | 24 provincias + esqueleto grueso: costa, ríos mayores, rutas nacionales | provincia | ~210 KB |
| **Provincia** | departamentos/partidos, rutas provinciales, manchas urbanas, localidades | departamento | +50–200 KB *(chunk por provincia)* |
| **Localidad** | mancha urbana detallada, calles troncales, los puntos | localidad | +30 KB |
| **Cuadra** | solo al clavar un pin: recuadro de calles bajo demanda (D4) | el pin | ~50 KB efímero |

Los pesos son estimaciones de diseño. La spec hija de §10.1 los mide contra los datos reales y ajusta el nivel de simplificación para respetarlos; si un chunk se pasa, se simplifica más, no se sube el techo en silencio.

### 4.1 Pipeline

`scripts/build/build-mapa-argentina.ts` se extiende a `scripts/build/geo/`, un módulo por capa, y emite dos clases de salida:

- `apps/web/src/geo/pais.generated.ts` — siempre en el bundle, se commitea (mismo patrón que hoy)
- `apps/web/public/geo/prov-{iso}.json` — fetch perezoso al entrar a una provincia

Fuentes: Natural Earth para provincias (ya en uso, dominio público); extracto OSM de Argentina para departamentos, rutas, ríos y manchas urbanas; y las localidades. Cada fuente se documenta con su licencia en el header del módulo generado, como ya hace el script actual.

### 4.2 La proyección tiene que ser invertible y exportarse

La proyección actual — equirectangular corregida por `cos(latitud media)` — **es** invertible, pero hoy el script no exporta la inversa. Hay que exportar el par `proyectar()` / `desproyectar()`.

Sin eso el lazo no puede compartir código con el móvil: se dibuja en píxeles y tiene que volverse polígono en lng/lat para pasar por el `pointInPolygon` del núcleo. Es la costura más fácil de olvidar y la que rompe D6.

---

## 5. El render honesto de la precisión

Lo que v1 no hacía. Cada registro se dibuja según la precisión con la que fue publicado:

| Precisión | Cómo se dibuja | Por qué |
|---|---|---|
| `province` | lavado de tinta sobre la provincia entera, intensidad = cantidad | no hay un punto; hay una provincia |
| `city` · `neighborhood` | punto en el centroide con halo difuso del radio de incertidumbre | **el halo es el dato** |
| `500m` · `100m` | punto nítido con halo chico | casi exacto |
| `exact` | punto nítido, sin halo | está ahí |

El jitter decorativo muere. Son puntos inventados alrededor de un centroide: hoy son adorno, pero bajo un lazo pasarían a ser una mentira medible.

La leyenda deja de afirmar una precisión fija y nombra la precisión de lo que se está mirando.

---

## 6. El instrumento — el lazo y lo que produce

### 6.1 El lazo

Se dibuja en píxeles sobre el SVG — el patrón de `LassoOverlay` de v1 está bien resuelto y se porta, incluida la cancelación con `Escape` y la barra de instrucción táctil. Se desproyecta con `desproyectar()` (§4.2) y pasa por `selectTerritoryPoints` del núcleo compartido: **el mismo código que corre en el móvil**.

### 6.2 El conteo honesto

Aun con exactitud por defecto, la precisión sigue siendo mixta: una voz vieja a nivel provincia y un pozo clavado en la esquina conviven dentro del mismo lazo. El área reporta **por clase**, nunca un total indiferenciado:

> En esta área: **34** con punto exacto · **12** a ±100 m · **120** de localidades cuyo centro cae adentro · **3 provincias tocadas parcialmente** — sus 4.200 voces no se cuentan acá.

Es lo que vuelve al número citable en vez de decorativo, y es requisito, no adorno: un total único sobre precisión mixta es un dato falso.

### 6.3 Los cinco productos de un área cerrada

1. **Composición** — cuánto de cada tipo de voz y de cada capa (D5)
2. **Lista** — panel virtualizado; cada registro con su acción, tomadas de `map-point-action.ts`: verificar, conectar, aportar, misión
3. **Temas** — lo que emerge del texto de los registros
4. **Cobertura — el mapa del silencio.** `coverage.ts` tira una grilla sobre el polígono y marca qué celdas tienen señal y cuáles están mudas. **Dónde nadie habló es tan informativo como dónde sí.** No existe en v1
5. **URL propia** — el área queda citable: se manda el link y la otra persona ve la misma zona con el mismo recorte. Sin esto el lazo es un juguete

### 6.4 El área es accionable

Desde un área cerrada se declara una necesidad acá, se ofrece un recurso acá, se propone. El instrumento de abajo alimenta la conversión de arriba en vez de competir con ella.

---

## 7. El campo — el móvil

El móvil captura con GPS y custodia, sincroniza, y el registro aparece en el mapa público **en su punto exacto** (D7). El recibo de divulgación (`disclosure-receipt.ts`) le dice a la persona qué se publicó y dónde.

Web y móvil comparten el **núcleo, no el render**: `react-native-maps` allá, SVG acá, y está bien así — el render es donde cada plataforma tiene que ser nativa.

*Anotado y fuera de alcance:* `juego/` ya tiene `react-native-svg`. El lienzo de papel podría renderizarse igual en el móvil para la vista país algún día.

---

## 8. El modelo de datos

### 8.1 Columnas nuevas

Para señales territoriales. Arranca en `dreams`; el mismo shape se aplica a `pulseSignals` y `proposals`:

```sql
lat            decimal(9,6)                                   -- el punto publicado
lng            decimal(9,6)
precision      text not null default 'province'
location_role  text not null default 'subject'
sensitivity    text not null default 'low'
localidad_id   integer references geographic_locations(id)
```

Los defaults dejan a toda fila existente exactamente donde está hoy: precisión provincial, sin coordenada. Ninguna migración reinterpreta datos viejos.

### 8.2 Backfill de localidades

`geographic_locations` ya tiene `level: 'province' | 'city'` y lat/lng nullable — **el esquema fue diseñado para esto y no hay que tocarlo**. El header del módulo describe el estado de la base de v1, no la de v2: el seed de v2 son las 24 provincias (23 + CABA), así que traer las localidades es un INSERT y no un UPDATE. Cualquiera de los dos casos es carga de datos, no migración.

*A verificar antes de importar:* el registro del proyecto dice que el backfill georef de v1 completó 518 de 525 ciudades. Se confirma contra la base cuántas filas de `level: 'city'` existen en v2 y cuántas coordenadas hay realmente en v1. Las que falten se marcan como tales en vez de inventarles centroide.

### 8.3 Endpoint

`GET /api/v1/civic/map/signals?capas=&bbox=&desde=` — forma unificada de señal con su precisión y su rol, para las cuatro capas de D5. **El prefijo va versionado:** la app móvil ya habla `/api/v1/civic/*` y el blueprint pide una API cívica versionada como único puente entre las dos aplicaciones.

**El panel de conversión no lo usa.** Sigue con sus llamadas livianas de hoy (`/api/open-data/dreams`, `/by-province`, `/provinces`): el instrumento no se paga en el camino crítico de los 30 segundos.

---

## 9. Qué muere

| Qué | Por qué |
|---|---|
| `/explorar-datos` | scaffold sin convertir a Papel y Tinta; se absorbe en `/el-mapa` (D1) y queda redirect |
| El jitter decorativo de `MapaArgentina.tsx` | puntos inventados; bajo un lazo pasan de adorno a mentira medible (§5) |
| `apps/web/public/maps/dark-matter.json` | estilo de basemap heredado de v1, sin uso bajo D3' |
| La leyenda «ubicada en su provincia — no en una dirección» | deja de ser verdad bajo D7 (§3.4) |
| `sharedPrecisionForAudience` en su forma actual | reemplazada por `publishedPrecision` (§3.2) |

---

## 10. Los cuatro sub-proyectos

Cada uno recibe su propia spec hija y su propio plan. Cada uno es entregable y visible por sí solo. **Las cuatro specs hijas están escritas** (2026-07-26):

| # | Spec hija |
|---|---|
| 10.1 | `docs/specs/2026-07-26-mapa-1-el-lienzo.md` |
| 10.2 | `docs/specs/2026-07-26-mapa-2-la-verdad-de-la-ubicacion.md` |
| 10.3 | `docs/specs/2026-07-26-mapa-3-el-instrumento.md` |
| 10.4 | `docs/specs/2026-07-26-mapa-4-el-campo.md` |

### 10.1 El lienzo
Geografía profunda precomputada y zoom por altitud (§4), más el render honesto de precisión sobre los datos que ya existen (§5, nivel `province`). **Depende de:** nada. **Entrega:** la página se ve y se navega distinto sin tocar la base de datos.

### 10.2 La verdad de la ubicación
Extracción de `packages/civic-core` con la política reescrita (§3), el ADR de distribución hacia `juego/`, la reescritura de los tests de grants (§3.4), y el modelo de datos de v2 (§8). **Depende de:** 10.1 para el render. **Entrega:** una voz puede clavarse exacta y el mapa la dibuja honestamente.

### 10.3 El instrumento
El lazo, el conteo honesto, los cinco productos del área, las cuatro capas prendibles (§6, D5). **Depende de:** 10.1, 10.2. **Entrega:** cercar el barrio y entender qué pasa ahí.

### 10.4 El campo
Captura del móvil fluyendo al mapa público: sync, custodia, recibos (§7). **Depende de:** 10.2, 10.3. **Entrega:** lo que se levanta caminando aparece en el mapa.

La extracción del núcleo (parte de 10.2) no toca UI web y puede arrancar en paralelo con 10.1 sin bloquear nada.

---

## 11. Las costuras

Lo que esta spec deja clavado para que ningún sub-proyecto se pinte en un rincón.

| Interfaz | Quién la define | Quién la consume |
|---|---|---|
| `LocationPrecision` · `LocationRole` · `publishedPrecision()` | núcleo (10.2) | modelo de datos (10.2), render (10.1, 10.3), móvil (10.4) |
| `proyectar()` / `desproyectar()` | lienzo (10.1) | lazo (10.3) |
| Forma unificada de señal | modelo (10.2) | instrumento (10.3), campo (10.4) |
| `selectTerritoryPoints` · `coverage` | núcleo (10.2) | instrumento (10.3), móvil (10.4) |

---

## 12. Riesgos

| Riesgo | Mitigación |
|---|---|
| Cambiar el núcleo rompe la app móvil en campo | El núcleo va versionado; `juego/` fija una versión y sube cuando puede probar. Los tests de grants se reescriben antes de publicar, no después |
| Exactitud por defecto expone a alguien vulnerable | La protección de `subject` + alta sensibilidad sigue existiendo, ofrecida y explicada; `need-access-grants` sigue siendo la vía para el caso protegido |
| El instrumento arruina la conversión de 30 segundos | El instrumento vive abajo del pliegue y usa su propio endpoint; el panel de arriba no cambia sus llamadas (§8.3) |
| Los chunks de geografía inflan la página | Presupuesto por altitud declarado en §4 y verificado en CI; si un chunk se pasa, se simplifica más |
| Dos lazos que divergen | Uno solo: el del núcleo. El web aporta la desproyección, no una segunda implementación |

---

## 13. Cómo se verifica

Cada spec hija define sus casos, pero el paraguas fija los mínimos:

- **`packages/civic-core`** — los tests que ya existen en `juego/src/civic` migran con el código. `publishedPrecision` cubre la matriz completa rol × sensibilidad × audiencia
- **El pipeline de geografía** — el output generado se commitea; un test verifica que regenerar desde la fuente produce el mismo archivo (misma garantía que el script actual)
- **`proyectar`/`desproyectar`** — ida y vuelta sobre las 24 capitales provinciales, con tolerancia declarada
- **El conteo honesto** — test con un lazo sobre un conjunto de precisión mixta que afirma que el total indiferenciado *no* se muestra
- **Endpoint** — ≥1 test de integración contra Postgres real, según el estándar de `v2/CLAUDE.md`
- **Migraciones** — cada cambio de esquema viaja con su migración en el mismo commit

---

## 14. Fuera de alcance

- Renderizar el lienzo de papel dentro de `juego/` (§7)
- PMTiles auto-hospedado y calles completas a nivel manzana (descartado en D4)
- Geografía para `iniciativas` y `semillas` — hoy no tienen territorio en el esquema
- Migrar señales de la base de v1 hacia v2
- SEO y títulos por página (llega con la Fase 8.1)

---

## 15. Preguntas abiertas

*(Estado al 2026-07-26, después de escribir las cuatro specs hijas.)*

1. **ADR de distribución de `civic-core`** hacia `juego/` (§3.1) — **sigue abierta.** La spec 2 §2.2 plantea los tres caminos y recomienda el tarball versionado, pero el ADR hay que escribirlo.
2. **Fuente de las localidades** (§8.2) — **sigue abierta**, y se resuelve contando: cuántas filas `level: 'city'` hay en v2 y cuántas coordenadas hay del lado de v1. Se verifica antes de escribir, no se asume.
3. ~~**Ancla del instrumento.**~~ **Resuelta** en la spec 3 §2: `/el-mapa#instrumento`, con montaje perezoso, y `/explorar-datos` redirige ahí.
4. **Prefijo de la API cívica** — **resuelta** escribiendo la spec 4: todo cuelga de `/api/v1/civic/`, porque la app móvil ya habla ese prefijo (`community-api.ts`) y el blueprint pide una API versionada como único puente. Corregido en §8.3 y en la spec 2 §5.

### Lo que apareció escribiendo las hijas

**El contrato de sync del móvil no tiene servidor.** `juego/src/civic/sync.ts` tiene un outbox completo — batching, arriendos de envío, barrido de reintentos, cursor de feed, autenticación por dispositivo — que postea a `/api/v1/civic/custody/grants/*` y `/api/circulos`. Ninguno de esos endpoints existe en `v2/apps/api`: el único router `civic` que hay es `civic-assessment`, que es otra cosa. La spec 4 construye **solo la ruta de la captura al mapa**; el resto del contrato es del blueprint y necesita sus propias specs.
