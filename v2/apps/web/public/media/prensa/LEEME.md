# Marca para prensa

Los archivos que ofrece `/kit-de-prensa`. Antes la página enlazaba cinco
descargas en `/assets/` que no existían (D-157).

| Archivo | Qué es |
|---|---|
| `basta-marca.svg` | La marca para fondos claros: letras en tinta `#16130E`, signos en violeta `#5227CC`. |
| `basta-marca-clara.svg` | La marca para fondos oscuros: letras en papel `#F2EFE7`, signos en violeta claro `#9D85E8`. |
| `basta-marca-fondo-claro.png` | `basta-marca.svg` sobre papel `#F2EFE7`, 2000 × 1000 px. |
| `basta-marca-fondo-oscuro.png` | `basta-marca-clara.svg` sobre tinta `#16130E`, 2000 × 1000 px. |

## De dónde salen

¡BASTA! no tiene logo: tiene una marca tipográfica. Es la palabra en Anton con
los signos `¡` `!` siempre en violeta (`docs/design-system/README.md` §1).

Los SVG llevan los **contornos** de las letras y no texto, para que no dependan
de que quien los abre tenga Anton instalada. Los genera
`scripts/build/marca/generar_marca.py` a partir de la misma subfuente que sirve
el sitio (`public/fonts-ui/anton-latin-normal-400.woff2`), con el avance de cada
glifo y el kerning de la fuente. El resultado coincide con lo que dibuja el
navegador: 5.630 unidades de avance y la misma caja de tinta.

Los PNG son cada SVG centrado, a 1400 px de ancho, sobre un lienzo de
2000 × 1000 px del color de fondo. Se sacaron con una captura del navegador; no
hay script porque son dos archivos que no cambian mientras no cambie la marca.

Anton se distribuye bajo la SIL Open Font License, que permite usar sus
contornos en una marca.

## Si cambia la marca

Regenerar los SVG con el script, rehacer los dos PNG y correr
`pages/__tests__/KitDePrensa.test.tsx`: comprueba que cada descarga de la página
exista, que los SVG no lleven texto, que los signos sigan en violeta y que los
PNG midan lo que la página dice.
