# Glyphs del mapa

Rangos de glyphs en PBF que MapLibre pide para dibujar las etiquetas de
`/maps/oscuro.json`. Salen del mismo origen que la app: ningún host de terceros ve
tu IP por abrir el mapa.

## Qué hay acá

- `Noto Sans Regular/{rango}.pbf` — 256 rangos, 6,2 MB. Es la única familia que el
  estilo pide (`text-font` en las capas `localidades` y `calles-nombres`).
  192 de los 256 archivos vienen vacíos: son los rangos Unicode que Noto Sans no
  cubre. Van igual, porque un rango que falta es un 404 en la consola y un rango
  vacío no es nada.
- `OFL.txt` — la SIL Open Font License 1.1, que la licencia exige que viaje con la
  fuente.

## De dónde salieron

De `protomaps/basemaps-assets`, generados con
[font-maker](https://github.com/maplibre/font-maker):

```bash
curl -L https://codeload.github.com/protomaps/basemaps-assets/tar.gz/refs/heads/main -o assets.tgz
tar -xzf assets.tgz --strip-components=1 \
  'basemaps-assets-main/fonts/Noto Sans Regular' 'basemaps-assets-main/fonts/OFL.txt'
```

Copiados el 12/8/2026. Una fuente no se pone vieja como una tesela: esto no hay que
regenerarlo salvo que el estilo pida una familia nueva.

## Lo que NO hay, a propósito

**No hay sprite.** Un sprite sirve iconos, y ninguna capa de `oscuro.json` usa
`icon-image` — las señales que van encima del mapa las dibuja React, no el estilo.
Un archivo que nadie pide es peso muerto.

## La trampa

`fonts.openmaptiles.org` —de donde salían estos glyphs hasta el 12/8/2026— **no
tiene la familia `Noto Sans Regular`**. Tiene `Klokantech Noto Sans Regular`, que no
es el mismo nombre. Ante un fontstack que no conoce devuelve su página de inicio en
HTML con estado 200, así que no hay error de red que mirar: MapLibre baja el HTML,
no lo puede parsear como protobuf, y el mapa se queda sin una sola etiqueta.
Verificado contra el endpoint.
