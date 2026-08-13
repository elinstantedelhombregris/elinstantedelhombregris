# La cartografía del mapa

Los dos scripts que producen lo que `/el-mapa` dibuja de fondo. **Ninguno corre en el
build**: se corren a mano y su salida se revisa a ojo, porque un mapa que compila no es lo
mismo que un mapa que se entiende.

| Script | Qué produce | Se commitea |
|---|---|---|
| `extraer-teselas.ts` | `apps/web/public/tiles/argentina.pmtiles` — 1,2 GB | **No.** Está en `.gitignore` |
| `generar-estilo.ts` (`pnpm mapa:estilo`) | `apps/web/public/maps/oscuro.json` — 66 capas | Sí |

Los dos existen por el plan `docs/plans/2026-08-12-teselas-propias.md`, que cerró
[D-003](../../../../docs/DEUDAS.md): las teselas y las tipografías del mapa salían de cinco
CDN de Carto y de `fonts.openmaptiles.org`, y ahora salen del mismo origen que la app.
Ningún tercero ve la IP de quien abre el mapa.

## Cada cuánto se regeneran las teselas

**Cadencia: mensual.** Para un basemap cívico alcanza y sobra — lo que el mapa dibuja son
provincias, calles y manzanas, que cambian en años, no en semanas.

| Última extracción | Build de Protomaps | Datos de OpenStreetMap |
|---|---|---|
| **2026-08-12** | `20260812.pmtiles` | 2026-08-12 04:00 UTC |

**Actualizá esta tabla cada vez que corras el script.** Es lo único que avisa de que el
basemap quedó viejo: un mapa desactualizado se ve perfecto, sólo que le faltan las calles
nuevas. No hay error, no hay log, no hay síntoma.

Está anotado como [D-047](../../../../docs/DEUDAS.md) con la razón por la que todavía no es
un cron: el extract necesita el binario de Go de `pmtiles`, 1,2 GB de disco y un lugar donde
publicar el resultado — y ese lugar todavía no está decidido
([D-051](../../../../docs/DEUDAS.md)). El cron que el proyecto ya tiene es una función
serverless de Vercel: no puede correr un binario nativo ni escribir un archivo de este
tamaño. Cuando el archivo tenga domicilio, automatizarlo es invocar el script sin
argumentos desde la máquina que lo aloja: **resuelve solo el build vigente**, así que no
lleva parámetros que se pongan viejos.

## Cómo se corren

```bash
brew install pmtiles                                   # una sola vez

cd v2
./apps/api/node_modules/.bin/tsx scripts/build/mapa/extraer-teselas.ts --dry-run
./apps/api/node_modules/.bin/tsx scripts/build/mapa/extraer-teselas.ts

pnpm mapa:estilo                                       # el estilo, cuando cambia la paleta
```

(`pnpm exec tsx` no resuelve `tsx` desde la raíz del workspace; es el mismo arranque que
documenta `scripts/build/data/README.md`.)

El `--dry-run` no baja nada y dice cuánto va a pesar. Corrélo primero siempre: es la
verificación de que el recorte y el zoom son los que creés.

### Lo que tarda y lo que pesa, medido el 12/8/2026

| | |
|---|---|
| Archivo | **1.206.728.792 bytes (1,2 GB)**, zoom máximo 15 |
| Tiempo | **2 minutos** con 4 hilos, a ~20 MB/s |
| Costo | 481 range requests, 1,3 GB transferidos |
| Proporción del planet de Protomaps (137 GB) | 0,9% |

**El tamaño en disco no es una barra de progreso:** `pmtiles extract` prealoca el archivo
entero, así que `ls -l` marca 1,2 GB a los pocos segundos de arrancar. La barra del CLI sí
avanza.

## Las decisiones que ya están tomadas

**Zoom máximo 15, y con los edificios encendidos.** El plan argumentaba z14 (592 MB) porque
el salto a z15 son ~600 MB de detalle que el estilo declaraba apagado. El dueño eligió z15
**y con él las huellas de edificio**: la trama de manzanas dice algo cívico, se ve la
cuadra. Los POIs y los comercios siguen apagados — un cartel de farmacia es ruido de mapa de
navegación. Bajar el zoom vuelve a abrir esa decisión: no se toca sin el dueño.

**El recorte son las 24 provincias**, no una caja rectangular: 1,2 GB contra 2,2 GB al mismo
zoom. El costo es que el borde del recorte se ve en el agua
([D-050](../../../../docs/DEUDAS.md)); se arregla dándole un buffer a la región, que son dos
minutos y unos pocos MB más.

**El `.pmtiles` no va al repo.** 1,2 GB en git es irreversible. Este script es la fuente de
verdad de cómo se regenera: si el archivo se pierde, se vuelve a correr y listo.

## Las dos trampas, para no redescubrirlas

Las dos están resueltas adentro de `extraer-teselas.ts` y explicadas en su cabecera. Acá
quedan nombradas por si alguna vez alguien hace esto a mano:

1. **El binario de Go se cuelga en IPv6** contra el bucket de Protomaps
   (`dial tcp [2606:4700:20::...]:443: i/o timeout`), aunque `curl -6` contra el mismo host
   devuelva 200. El script levanta un proxy CONNECT local que fuerza `family: 4` y le
   exporta `HTTPS_PROXY`.
2. **`--region` quiere un `Polygon` o un `MultiPolygon` suelto**, y rechaza un
   `FeatureCollection`. `apps/web/public/geo/provincias.geojson` es una colección de 24
   `Polygon`: el script funde las coordenadas antes de pasárselo.

Y una tercera, que es de tipografías y no de teselas: **`fonts.openmaptiles.org` no tiene la
familia `Noto Sans Regular`** —publica `Klokantech Noto Sans Regular`, que es otra— y ante
un fontstack desconocido **devuelve su página de inicio con estado 200** en vez de un 404.
MapLibre parsea ese HTML como protobuf y no dibuja **ni una geometría**. Es la razón por la
que los glyphs viven en `apps/web/public/fonts/`; ver el `LEEME.md` de esa carpeta.
