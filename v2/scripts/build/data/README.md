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

Es la capa que **congela los bounds** de la proyección (spec 1 §3). Cambiarla
mueve todos los paths de todas las capas: si se reemplaza, hay que regenerar
todo y revisar el mapa a ojo, no solo correr los tests.

## No commiteado — hace falta bajarlo

Las capas de departamentos, esqueleto, manchas urbanas y localidades están
especificadas en la spec 1 §2.3 y **todavía no están implementadas**: dependen
de datasets grandes que no van al repo.

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

### Departamentos y partidos

Capa de departamentos del [IGN](https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/CapasSIG)
(~530 unidades). Dominio público.

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
