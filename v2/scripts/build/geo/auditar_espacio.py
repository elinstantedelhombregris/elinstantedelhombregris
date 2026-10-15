"""Audita archivos publicados sin reparar ni sustituir geometrías."""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import pyproj
import shapely
from shapely.geometry import shape
from shapely.ops import transform, unary_union
from shapely.strtree import STRtree
from shapely.validation import explain_validity

CAPAS = ("provincias", "departamentos", "municipios")
PROYECCION = "+proj=aea +lat_1=-25 +lat_2=-47 +lat_0=-36 +lon_0=-64 +datum=WGS84 +units=m +no_defs"
UMBRAL_M2 = 1.0
PROYECTAR = pyproj.Transformer.from_crs("EPSG:4326", PROYECCION, always_xy=True).transform


def huella(contenido):
    return hashlib.sha256(contenido).hexdigest()


def referencia(feature, indice):
    p = feature["properties"]
    return {"indice": indice, "codigo": p["georefId"], "nombre": p["name"]}


def analizar_capas(colecciones):
    """Orden estable: capa, índice de rasgo, índice de vecino. Áreas en m²."""
    incidencias, capas, preparadas = [], [], {}

    def anotar(tipo, capa, refs, detalle, geometria=None, area=None):
        item = {"tipo": tipo, "capa": capa, "unidades": refs, "detalle": detalle}
        if geometria is not None and not geometria.is_empty:
            item["extension"] = [round(v, 7) for v in geometria.bounds]
        if area is not None:
            item["areaM2"] = round(area, 3)
        incidencias.append(item)

    for capa in CAPAS:
        elementos = []
        for i, f in enumerate(colecciones[capa]["features"]):
            ref = referencia(f, i)
            g = shape(f["geometry"])
            proyectada = None
            if g.is_empty or not g.is_valid:
                anotar("geometria_invalida", capa, [ref], explain_validity(g), g)
            else:
                proyectada = transform(PROYECTAR, g)
                if not proyectada.is_valid or proyectada.is_empty:
                    anotar("geometria_invalida", capa, [ref],
                           "Geometría inválida después de proyectar: " + explain_validity(proyectada), g)
                    proyectada = None
            if ref["codigo"] is None:
                anotar("sin_codigo", capa, [ref], "No se asigna provincia por nombre ni proximidad.", g)
            elementos.append((ref, g, proyectada))
        preparadas[capa] = elementos
        validos = [e for e in elementos if e[2] is not None]
        arbol = STRtree([e[2] for e in validos])
        for i, (ref, original, geom) in enumerate(validos):
            for j in sorted(int(v) for v in arbol.query(geom)):
                if j <= i:
                    continue
                otro, _, vecina = validos[j]
                interseccion = geom.intersection(vecina)
                if interseccion.area > UMBRAL_M2:
                    # Extensión en WGS84 de los rasgos; no se publica geometría derivada.
                    anotar("solapamiento", capa, [ref, otro],
                           "Intersección de áreas del mismo nivel; requiere revisión de fuente y simplificación.",
                           original, interseccion.area)
        capas.append({"nombre": capa, "rasgos": len(elementos), "validos": len(validos),
                      "invalidos": len(elementos) - len(validos),
                      "sinCodigo": sum(e[0]["codigo"] is None for e in elementos)})

    provincias = {ref["codigo"]: (ref, original, g)
                  for ref, original, g in preparadas["provincias"]}
    for capa in ("departamentos", "municipios"):
        for ref, original, g in preparadas[capa]:
            codigo = ref["codigo"]
            if not codigo:
                continue
            padre = provincias.get(codigo[:2])
            if padre is None or padre[2] is None or g is None:
                anotar("control_no_calculable", capa, [ref],
                       "Pertenencia provincial sin calcular: falta un polígono válido del par.", original)
                continue
            fuera = g.difference(padre[2])
            if fuera.area > UMBRAL_M2:
                anotar("fuera_de_provincia", capa, [ref, padre[0]],
                       "Área fuera de la provincia indicada por el código. Capas simplificadas por separado.",
                       original, fuera.area)

    # No se calcula una cobertura engañosa omitiendo departamentos inválidos.
    for codigo, (ref, original, provincia) in provincias.items():
        hijos = [e for e in preparadas["departamentos"] if e[0]["codigo"] and e[0]["codigo"][:2] == codigo]
        if provincia is None or not hijos or any(e[2] is None for e in hijos):
            anotar("control_no_calculable", "departamentos", [ref],
                   "Cobertura provincial sin calcular: faltan departamentos o hay geometrías inválidas.", original)
            continue
        union = unary_union([e[2] for e in hijos])
        hueco = provincia.difference(union)
        if hueco.area > UMBRAL_M2:
            anotar("sin_cobertura_departamental", "departamentos", [ref],
                   "Área provincial no cubierta por esta capa departamental. No mide población ausente.",
                   original, hueco.area)
    for capa in capas:
        capa["incidencias"] = sum(i["capa"] == capa["nombre"] for i in incidencias)
    return capas, incidencias


def auditar(carpeta):
    manifiesto = json.loads((carpeta / "manifiesto.json").read_text())
    colecciones, fuentes = {}, []
    for capa in CAPAS:
        contenido = (carpeta / (capa + ".geojson")).read_bytes()
        digest = huella(contenido)
        declarada = next(c for c in manifiesto["capas"] if c["nombre"] == capa)
        if digest != declarada["sha256"]:
            raise ValueError("Huella distinta del manifiesto: " + capa)
        colecciones[capa] = json.loads(contenido)
        fuentes.append({"nombre": capa, "sha256": digest, "archivo": declarada["archivo"]})
    capas, incidencias = analizar_capas(colecciones)
    return {
        "version": manifiesto["version"], "generadoEn": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"), "metodoVersion": "espacial-1",
        "motor": {"shapely": shapely.__version__, "geos": shapely.geos_version_string,
                  "pyproj": pyproj.__version__, "proj": pyproj.proj_version_str},
        "proyeccion": PROYECCION, "umbralM2": UMBRAL_M2, "fuentes": fuentes,
        "limites": [
            "Auditoría de la edición simplificada publicada; no de límites legales ni del original sin simplificar.",
            "El umbral de 1 m² descarta ruido numérico; no es una tolerancia cartográfica ni una certificación.",
            "Las áreas son aproximadas en proyección equivalente Albers. Los bordes compartidos solo se controlan entre geometrías válidas.",
            "Municipios no forman necesariamente una partición; no se calcula su cobertura exhaustiva.",
            "Sin comparación espacial con polígonos censales, radios o áreas habitadas. Códigos coincidentes no autorizan transferir estadísticas.",
            "Las extensiones localizan los rasgos involucrados, no el contorno exacto del defecto. No se reparó ninguna geometría.",
        ],
        "capas": capas, "incidencias": incidencias,
        "estado": "con_observaciones" if incidencias else "sin_hallazgos_en_estos_controles",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("carpeta", type=Path, help="Edición con manifiesto.json y tres GeoJSON")
    parser.add_argument("--salida", type=Path)
    parser.add_argument("--comprobar", action="store_true", help="Solo comprueba validez de candidatos, sin publicarlos")
    args = parser.parse_args()
    if args.comprobar:
        invalidas = []
        for capa in CAPAS:
            coleccion = json.loads((args.carpeta / (capa + ".geojson")).read_text())
            for i, f in enumerate(coleccion["features"]):
                g = shape(f["geometry"])
                if g.is_empty or not g.is_valid or not transform(PROYECTAR, g).is_valid:
                    invalidas.append({"capa": capa, **referencia(f, i), "razon": explain_validity(g)})
        print(json.dumps({"invalidas": invalidas}, ensure_ascii=False))
        return
    if not args.salida:
        parser.error("Se necesita --salida o --comprobar")
    informe = auditar(args.carpeta)
    # No reemplazar un informe existente, aunque se repita el comando.
    with args.salida.open("x") as f:
        json.dump(informe, f, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
        f.write("\n")
    print(json.dumps({"estado": informe["estado"], "capas": informe["capas"],
                      "incidencias": len(informe["incidencias"])}, ensure_ascii=False))


if __name__ == "__main__":
    main()
