# Fuentes de geografía del mapa

Los datos que alimentan `scripts/build/geo/`. El pipeline se corre **a mano y
cada tanto**, no en cada build: su salida se commitea y la app solo importa los
módulos generados (decisión D3 — sin librería de mapas).

```bash
./apps/api/node_modules/.bin/tsx scripts/build/geo/index.ts
```

## Commiteado

| Archivo | Fuente | Licencia |
|---|---|---|
| `argentina-provincias.geojson` | [Natural Earth](https://www.naturalearthdata.com/) admin-1, filtrado a Argentina y simplificado | Dominio público |

Ojo: este archivo alimenta sólo el mapa SVG precomputado (`pais.generated.ts`).
El GeoJSON que sirve la web y que resuelve puntos en la API es otro, y desde el
22/9/2026 sale del IGN (ver abajo).

Es la capa que **congela los bounds** de la proyección (spec 1 §3). Cambiarla
mueve todos los paths de todas las capas: si se reemplaza, hay que regenerar
todo y revisar el mapa a ojo, no solo correr los tests.

## No commiteado — hace falta bajarlo

Las capas de departamentos, esqueleto, manchas urbanas y localidades **del mapa
SVG** están especificadas en la spec 1 §2.3 y **todavía no están
implementadas**: dependen de datasets grandes que no van al repo. (La geometría
de departamentos ya existe como GeoJSON para la web, más abajo; lo que falta es
proyectarla al SVG.)

### Extracto OSM de la Argentina

```bash
curl -L -o argentina-latest.osm.pbf \
  https://download.geofabrik.de/south-america/argentina-latest.osm.pbf
```

Aproximadamente 1,2 GB. Se procesa con [osmium](https://osmcode.org/osmium-tool/)
(`brew install osmium-tool`) filtrando por etiqueta:

| Capa | Filtro |
|---|---|
| Esqueleto — rutas | `w/highway=motorway,trunk,primary` |
| Esqueleto — ríos | `w/waterway=river` |
| Manchas urbanas | `w/landuse=residential` + `r/place=city,town` |

La licencia de OpenStreetMap es **ODbL**, que exige atribución visible. Va al
pie del mapa, no escondida en un «acerca de» (spec 1 §2.3).

### Límites del IGN: provincias, departamentos y municipios

Los tres GeoJSON de `apps/web/public/geo/` —y, derivado del de provincias,
`apps/api/src/features/geographic/provincias.generated.ts`— salen de las capas
de límites del [Instituto Geográfico Nacional](https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/CapasSIG),
por su WFS oficial. Cierran la geometría de D-011, D-004 y D-005.

```bash
pnpm geo:ign -- --fuente=/ruta/fuera/del/repo --bajar   # baja y procesa
pnpm geo:ign -- --fuente=/ruta/fuera/del/repo           # reprocesa lo ya bajado
```

| Capa del IGN | URL (WFS 1.0.0, GeoJSON, EPSG:4326) | Crudo | Salida | Tolerancia |
|---|---|---|---|---|
| `ign:provincia` (24) | `https://wms.ign.gob.ar/geoserver/ign/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ign:provincia&outputFormat=application/json&srsName=EPSG:4326` | 112 MB · 4.051.161 vértices | `provincias.geojson` · 579 KB · 29.820 vértices | DP 200 m, islas < 1 km² fuera |
| `ign:departamento` (529) | ídem con `typeName=ign:departamento` | 141 MB · 5.100.430 vértices | `departamentos.geojson` · 856 KB · 39.790 vértices | DP 500 m, islas < 1 km² fuera |
| `ign:municipio` (2.114) | ídem con `typeName=ign:municipio` | 64 MB · 2.292.600 vértices | `municipios.geojson` · 1.677 KB · 68.798 vértices | DP 400 m, sin filtro de islas |

- **Bajado:** 2026-09-22 (22:56 UTC).
- **Licencia:** la que declara el propio servicio en su `GetCapabilities`
  (`AccessConstraints`): «Se permite buscar, acceder, solicitar, recibir,
  copiar, analizar, reprocesar, reutilizar y redistribuir libremente la
  información publicada por este servicio según el Artículo 2 de la Ley 27.275».
  Se cita la fuente: «Instituto Geográfico Nacional de la República Argentina».
- **Los crudos no se commitean** (~320 MB). La salida sí.
- **Procesado:** `scripts/build/geo/importar-ign.ts`, con `mapshaper@0.7.66`
  por `npx` (herramienta de build, no dependencia). Douglas-Peucker topológico:
  ningún vértice del límite original queda a más de la tolerancia del
  simplificado, y los vecinos comparten el mismo borde simplificado — no hay
  huecos ni solapes entre provincias.
- **Marco:** se recorta a `[-74.5, -56.5, -53, -21]`. Queda Malvinas; quedan
  afuera el sector antártico y las Georgias y Sandwich del Sur, que harían que
  todo lo que encuadra por los bounds del archivo dibujara el continente en un
  rincón. El departamento «Antártida Argentina» (94028) no se escribe; un punto
  ahí resuelve `null`.

**La unión con `geographic_locations`.** Cada rasgo trae `georefId`: el código
INDEC del IGN (`in1`), el mismo que georef usa como id y que el seed del
callejero guarda en `geographic_locations.georef_id`. Se une por ese campo,
nunca por nombre.

- **Provincias:** 24 de 24, y el `name` sale de `PROVINCIAS_CANONICAS` por
  código, no del IGN (que dice «Tierra del Fuego, Antártida e Islas del
  Atlántico Sur»).
- **Departamentos:** 529 códigos de 5 dígitos, únicos, con las 15 comunas de
  CABA como `02007`…`02105` — la convención de georef. La base tiene 529
  departamentos. **Coinciden en cantidad y en forma; no se verificó fila por
  fila contra la base** (hacerlo pide leer producción).
- **Municipios:** la unión es **parcial y no verificada**. El IGN trae 2.114
  rasgos y 2.105 códigos distintos; la base tiene 2.082 municipios, así que al
  menos 23 códigos del IGN no pueden estar en ella. Diez rasgos salen con
  `georefId: null`: ocho sin código en la fuente y El Rabón y Hardy, que
  comparten el 822784 (no se adivina cuál lo tiene bien). Machagai venía en dos
  pedazos con el mismo código y se unió.

### Localidades

Fuente todavía sin decidir — es la pregunta abierta 2 de la spec paraguas. Las
candidatas son el backfill georreferenciado de la base de v1 (unas 518 de 525
ciudades según el registro del proyecto, **a verificar contando**) o un dataset
público nuevo. Las localidades sin coordenada se marcan como tales: no se les
inventa centroide.

## Regla del pipeline

Cada capa declara su tolerancia de simplificación y su techo de peso en
`scripts/build/geo/index.ts`. Si una salida se pasa del techo, el script sale
con código 1. **Se simplifica más la capa; no se sube el techo.**
