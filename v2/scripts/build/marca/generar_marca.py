"""Genera la marca ¡BASTA! como SVG con los contornos de Anton.

Un archivo de marca no puede depender de que quien lo abre tenga la tipografía
instalada, así que lleva los contornos y no texto. Las posiciones salen de la
propia fuente: el avance de cada glifo y el kerning de la tabla GPOS. Con la
subfuente que sirve el sitio el resultado coincide con lo que dibuja el
navegador: 5.630 unidades de avance y la misma caja de tinta.

Uso, desde v2/:

    python3 scripts/build/marca/generar_marca.py \
        apps/web/public/fonts-ui/anton-latin-normal-400.woff2 \
        apps/web/public/media/prensa

Necesita fontTools y brotli (`pip install fonttools brotli`).

Colores y regla: `docs/design-system/README.md` §1 y §2. Letras en tinta y los
signos ¡ ! siempre en violeta; sobre oscuro, letras en papel y signos en
violeta claro. Los PNG se hacen aparte: ver `apps/web/public/media/prensa/LEEME.md`.
"""
import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

TEXTO = "¡BASTA!"
SIGNOS = {"¡", "!"}
VARIANTES = {
    "basta-marca.svg": {"letras": "#16130E", "signos": "#5227CC"},
    "basta-marca-clara.svg": {"letras": "#F2EFE7", "signos": "#9D85E8"},
}
# Aire alrededor de la tinta, como fracción del cuadratín.
MARGEN = 0.08


def kerning(fuente, izquierdo, derecho):
    """Ajuste de avance del par según GPOS, característica `kern`."""
    if "GPOS" not in fuente:
        return 0
    gpos = fuente["GPOS"].table
    indices = set()
    for registro in gpos.FeatureList.FeatureRecord:
        if registro.FeatureTag == "kern":
            indices.update(registro.Feature.LookupListIndex)
    total = 0
    for indice in sorted(indices):
        lookup = gpos.LookupList.Lookup[indice]
        for subtabla in lookup.SubTable:
            if lookup.LookupType == 9:  # extensión: la subtabla real va adentro
                subtabla = subtabla.ExtSubTable
            if not hasattr(subtabla, "PairSet") and not hasattr(subtabla, "Class1Record"):
                continue  # no es de pares
            if izquierdo not in subtabla.Coverage.glyphs:
                continue
            valor = None
            if subtabla.Format == 1:
                pares = subtabla.PairSet[subtabla.Coverage.glyphs.index(izquierdo)]
                for par in pares.PairValueRecord:
                    if par.SecondGlyph == derecho:
                        valor = par.Value1
                        break
            else:
                clase1 = subtabla.ClassDef1.classDefs.get(izquierdo, 0)
                clase2 = subtabla.ClassDef2.classDefs.get(derecho, 0)
                valor = subtabla.Class1Record[clase1].Class2Record[clase2].Value1
            if valor is not None:
                total += getattr(valor, "XAdvance", 0) or 0
                break  # la primera subtabla que cubre el par gana, como al componer
    return total


def main(ruta_fuente, salida):
    fuente = TTFont(ruta_fuente)
    glifos = fuente.getGlyphSet()
    cmap = fuente.getBestCmap()
    nombres = [cmap[ord(letra)] for letra in TEXTO]

    x = 0
    posiciones = []
    for i, nombre in enumerate(nombres):
        if i > 0:
            x += kerning(fuente, nombres[i - 1], nombre)
        posiciones.append(x)
        x += glifos[nombre].width

    caja = BoundsPen(glifos)
    for nombre, px in zip(nombres, posiciones):
        glifos[nombre].draw(TransformPen(caja, (1, 0, 0, 1, px, 0)))
    x0, y0, x1, y1 = caja.bounds
    margen = round(MARGEN * fuente["head"].unitsPerEm)
    ancho = round(x1 - x0 + 2 * margen)
    alto = round(y1 - y0 + 2 * margen)

    def trazo(nombre, px):
        pluma = SVGPathPen(glifos, ntos=lambda v: ("%.1f" % v).rstrip("0").rstrip("."))
        # El eje y de la fuente va hacia arriba; el del SVG, hacia abajo.
        glifos[nombre].draw(TransformPen(pluma, (1, 0, 0, -1, px - x0 + margen, y1 + margen)))
        return pluma.getCommands()

    partes = list(zip(TEXTO, nombres, posiciones))
    for archivo, color in VARIANTES.items():
        letras = " ".join(trazo(n, p) for letra, n, p in partes if letra not in SIGNOS)
        signos = " ".join(trazo(n, p) for letra, n, p in partes if letra in SIGNOS)
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho} {alto}" '
            f'role="img" aria-label="¡BASTA!">\n'
            f"  <title>¡BASTA!</title>\n"
            f'  <path fill="{color["letras"]}" d="{letras}"/>\n'
            f'  <path fill="{color["signos"]}" d="{signos}"/>\n'
            f"</svg>\n"
        )
        with open(f"{salida}/{archivo}", "w", encoding="utf-8") as destino:
            destino.write(svg)
        print(archivo, len(svg.encode("utf-8")), "bytes")
    print("avance total:", x, "· caja de tinta:", (x0, y0, x1, y1), "· viewBox:", ancho, alto)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
