import unittest
import json
from pathlib import Path
from auditar_espacio import analizar_capas, auditar


def feature(code, ring, holes=None):
    return {"properties": {"name": code or "Sin código", "georefId": code},
            "geometry": {"type": "Polygon", "coordinates": [ring] + (holes or [])}}


def square(w, s, e, n):
    return [[w, s], [e, s], [e, n], [w, n], [w, s]]


def colecciones(provs, deps, munis):
    return {n: {"features": fs} for n, fs in zip(
        ["provincias", "departamentos", "municipios"], [provs, deps, munis])}


class AuditoriaTest(unittest.TestCase):
    def setUp(self):
        self.prov = feature("06", square(-60, -36, -59, -35))
        self.dep = feature("06007", square(-60, -36, -59, -35))

    def test_limites_identicos_no_generan_falsos_huecos_ni_solapes(self):
        capas, issues = analizar_capas(colecciones([self.prov], [self.dep], []))
        self.assertEqual(issues, [])
        self.assertEqual(capas[0]["invalidos"], 0)

    def test_autointerseccion_y_agujero_exterior_no_se_reparan(self):
        bow = feature("06014", [[-60,-36],[-59,-35],[-60,-35],[-59,-36],[-60,-36]])
        hole = feature("060001", square(-60,-36,-59,-35), [square(-58,-34,-57,-33)])
        capas, issues = analizar_capas(colecciones([self.prov], [bow], [hole]))
        self.assertEqual([c["invalidos"] for c in capas], [0,1,1])
        self.assertEqual(sum(i["tipo"] == "geometria_invalida" for i in issues), 2)
        self.assertTrue(any(i["tipo"] == "control_no_calculable" and "Cobertura" in i["detalle"] for i in issues))
        self.assertFalse(any(i["tipo"] == "sin_cobertura_departamental" for i in issues))

    def test_solapes_y_pertenencia_se_miden_en_metros(self):
        dep2 = feature("06014", square(-59.5,-35.5,-58.5,-34.5))
        _, issues = analizar_capas(colecciones([self.prov], [self.dep, dep2], []))
        overlap = next(i for i in issues if i["tipo"] == "solapamiento")
        self.assertGreater(overlap["areaM2"], 1_000_000_000)
        self.assertEqual(len(overlap["unidades"]), 2)
        self.assertTrue(any(i["tipo"] == "fuera_de_provincia" for i in issues))

    def test_huecos_departamentales_y_municipios_no_exhaustivos(self):
        small = feature("06007", square(-59.9,-35.9,-59.1,-35.1))
        muni = feature(None, square(-59.9,-35.9,-59.1,-35.1))
        _, issues = analizar_capas(colecciones([self.prov], [small], [muni]))
        self.assertTrue(any(i["tipo"] == "sin_cobertura_departamental" for i in issues))
        municipales = [i for i in issues if i["capa"] == "municipios"]
        self.assertEqual([i["tipo"] for i in municipales], ["sin_codigo"])

    def test_informe_publicado_reproduce_los_hallazgos_de_los_archivos(self):
        raiz = Path(__file__).resolve().parents[3]
        referencia = json.loads((raiz / "packages/shared/src/datos/validacion-espacial.generated.json").read_text())
        publicado = json.loads((raiz / "apps/web/public" / referencia["archivo"].lstrip("/")).read_text())
        actual = auditar(raiz / "apps/web/public/geo/versiones" / referencia["version"])
        self.assertEqual(actual["capas"], publicado["capas"])
        # No depende de diferencias submilimétricas entre builds de PROJ/GEOS.
        claves = lambda informe: [(i["tipo"], i["capa"], i["unidades"]) for i in informe["incidencias"]]
        self.assertEqual(claves(actual), claves(publicado))

    def test_provincia_invalida_no_certifica_pertenencia(self):
        prov = feature("06", [[-60,-36],[-59,-35],[-60,-35],[-59,-36],[-60,-36]])
        _, issues = analizar_capas(colecciones([prov], [self.dep], []))
        self.assertTrue(any(i["tipo"] == "control_no_calculable" for i in issues))
        self.assertFalse(any(i["tipo"] == "fuera_de_provincia" for i in issues))


if __name__ == "__main__":
    unittest.main()
