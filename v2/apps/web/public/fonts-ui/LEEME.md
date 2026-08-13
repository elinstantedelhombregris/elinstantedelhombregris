# Tipografías de la interfaz

Las seis familias con las que se dibuja el sitio entero. Salen del mismo origen que la
app: ningún host de terceros ve tu IP por abrir una página. Cierra
[D-049](../../../../../docs/DEUDAS.md).

**Esto no son los glyphs del mapa.** Los del mapa están en `../fonts/` y son otra cosa:
rangos en PBF que MapLibre le pide al estilo para escribir los nombres de las calles. Acá
hay `.woff2` que el navegador usa para el HTML. Confundirlos cuesta caro — borrar una
carpeta creyendo que era la otra deja el sitio en Times New Roman o el mapa sin una sola
etiqueta, y ninguna de las dos cosas tira un error.

## Qué hay acá

|               |                                                                                       |
| ------------- | ------------------------------------------------------------------------------------- |
| 32 `.woff2`   | **563 KB en el repo**, un archivo por (familia, estilo, subconjunto)                  |
| `fuentes.css` | Los 32 `@font-face`. **Generado**: no se edita a mano                                 |
| `licencias/`  | Las seis SIL OFL 1.1, una por familia, que la licencia exige que viajen con la fuente |

Las seis familias, y para qué:

| Familia          | Peso(s)               | Dónde se usa                                             |
| ---------------- | --------------------- | -------------------------------------------------------- |
| Anton            | 400                   | Los titulares del sistema «Papel y Tinta» (`font-anton`) |
| Archivo          | 300–800 + itálica 400 | El cuerpo de texto (`font-archivo`)                      |
| Space Mono       | 400, 700              | Kickers y metadatos (`font-space`)                       |
| Inter            | 300–700               | `font-sans` — páginas legado                             |
| Playfair Display | 400–700               | `font-serif` — páginas legado                            |
| JetBrains Mono   | 400–500               | `font-mono` — páginas legado                             |

**Los 563 KB no son lo que baja un visitante.** Cada `@font-face` lleva su `unicode-range`:
el navegador baja el archivo cirílico de Inter sólo si la página tiene un carácter cirílico,
y no lo tiene nunca. Medido en el home el 12/8/2026: **cinco archivos, 95 KB** (Anton latin,
Archivo latin, Space Mono latin 400 y 700, JetBrains Mono latin). Los otros 27 no se piden.

## De dónde salieron

De Google Fonts, con `scripts/build/tipografias/bajar-tipografias.ts`:

```bash
cd v2
./apps/api/node_modules/.bin/tsx scripts/build/tipografias/bajar-tipografias.ts
```

(`pnpm exec tsx` no resuelve `tsx` desde la raíz del workspace; es el mismo arranque que
documenta `scripts/build/mapa/README.md`.)

El script le pide a Google **la misma hoja de estilo que le pedía el navegador**: la
constante `PEDIDO` es, carácter por carácter, la query que tenía el `<link>` de
`apps/web/index.html` hasta el 12/8/2026. Por eso el sitio se ve igual. Si algún día hace
falta un peso o una familia nueva, se agrega ahí y se vuelve a correr — el HTML ya no habla
con Google.

Bajadas el 12/8/2026. Una fuente no se pone vieja como una tesela: esto no hay que
regenerarlo salvo que cambie la lista de familias o de pesos.

## Lo que se recortó y lo que no

**Los pesos, sí.** Se piden exactamente los que el sitio declara y ni uno más. Un peso que
nadie usa se baja siempre —no tiene `unicode-range` que lo frene— y es peso muerto.

**Los subconjuntos, no.** Están los siete que Google publica (latin, latin-ext, vietnamese,
cirílico, cirílico-ext, griego, griego-ext) porque `unicode-range` los vuelve gratis en
tiempo de carga y recortarlos **cambiaría cómo se ve el sitio**: la `φ` de una fórmula o la
`μ` de un caudal caerían a la fuente del sistema en medio de un párrafo. Cuestan KB de repo,
no de red.

Cuatro de las seis familias son **variables**: un solo archivo cubre todo el rango de pesos
(`archivo-latin-normal-300-800.woff2` son los seis pesos de Archivo). Google devuelve un
bloque `@font-face` por peso apuntando todos al mismo archivo; el script los colapsa en un
`font-weight: 300 800`. Anton (un peso) y Space Mono (dos archivos estáticos) no son
variables.

## La trampa

**Sin `User-Agent` de navegador moderno, la API `css2` de Google devuelve TTF.** Con el UA
por defecto de Node contesta una hoja que apunta a `.ttf`: pesa el triple y no trae
`unicode-range`, así que se bajaría todo siempre. El script manda un UA de Chrome y aborta
si la hoja no menciona `woff2`.

## Lo que falta

Traer estos archivos es la mitad del trabajo: la otra mitad es que la CSP del documento
prohíba salir a buscar tipografías afuera. Hoy la CSP viaja sólo en las respuestas de
`/api/` y nunca llega al HTML ([D-048](../../../../../docs/DEUDAS.md)). Con las fuentes ya
locales, aplicar `font-src 'self'` al documento dejó de romper nada.
