"""Extrae nomencladores INDEC sin modificar XLSX. Uso: python3 extraer.py carpeta.
Solo biblioteca estándar. Edición fija: cualquier descarga distinta requiere otra edición.
"""
import hashlib
import json
import os
import pathlib
import sys
import xml.etree.ElementTree as ET
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[3]
EDICION = 'indec-c2022-codigos-20261015-r1'
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
FILES = [('provincias', 'province', 'c2022_codigos_jurisdicciones.xlsx', 0, 1, 2),
         ('departamentos', 'department', 'c2022_codigos_departamentos.xlsx', 2, 3, 5),
         ('municipios', 'municipality', 'c2022_gobiernos_locales.xlsx', 1, 2, 6),
         ('localidades', 'locality', 'c2022_codigos_localidades.xlsx', 6, 7, 8)]

def rows(path):
    with zipfile.ZipFile(path) as z:
        strings = [''.join(s.itertext()) for s in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si', NS)]
        for row in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//s:row', NS):
            values = {}
            for cell in row.findall('s:c', NS):
                col = ''.join(c for c in cell.attrib['r'] if c.isalpha())
                v = cell.find('s:v', NS)
                if v is not None:
                    values[col] = strings[int(v.text)] if cell.attrib.get('t') == 's' else v.text
            yield [values.get(chr(65+i)) for i in range(12)]

def main():
    folder = pathlib.Path(sys.argv[1]); units = []; sources = []
    dest = ROOT / 'apps/web/public/geo/censo' / EDICION
    prepared = []
    for name, level, filename, ci, ni, width in FILES:
        path = folder / (name+'.xlsx'); raw = path.read_bytes(); seen = set()
        for line, row in enumerate(rows(path), 1):
            code = row[ci]
            if not code or not code.isdigit():
                continue
            if len(code) != width or code in seen or not isinstance(row[ni], str) or not row[ni].strip():
                raise ValueError(f'Código inválido o duplicado en {name}:{line}: {code}')
            seen.add(code)
            category = row[3] if level == 'municipality' else row[8] if level == 'locality' else None
            units.append(dict(nivel=level,codigo=code,nombre=row[ni],provincia=code[:2],
                departamento=row[2] if level=='locality' else None,
                gobiernoLocal=row[9] if level=='locality' else None,
                aglomerado=row[4] if level=='locality' else None,categoria=category,
                residual=level=='municipality' and category is None,fila=line))
        sources.append(dict(nivel=level,archivo=name+'.xlsx',url='https://redatam.indec.gob.ar/redarg/CENSOS/CPV2022/Docs/'+filename,
            sha256=hashlib.sha256(raw).hexdigest(),registros=len(seen)))
        prepared.append((name+'.xlsx',raw))
    by_level = {(u['nivel'],u['codigo']) for u in units}
    for u in units:
        for level,code in [('province',u['provincia']),('department',u['departamento']),('municipality',u['gobiernoLocal'])]:
            if code and (level,code) not in by_level:
                raise ValueError(f'Pertenencia ausente: {u["codigo"]} -> {level}/{code}')
    data=dict(version=EDICION,consultada='2026-10-15',referencia='Censo 2022',fuentes=sources,unidades=units)
    encoded=(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n').encode()
    prepared.append(('nomenclador.json',encoded))
    for name,raw in prepared:
        target=dest/name
        if target.exists() and target.read_bytes()!=raw:
            raise ValueError('Una edición publicada no puede sobrescribirse: '+str(target))
    dest.mkdir(parents=True,exist_ok=True)
    for name,raw in prepared:
        target=dest/name
        if not target.exists():
            with target.open('xb') as handle: handle.write(raw)
    target=ROOT/'apps/api/src/features/conciliacion/censo.generated.json'
    temporary=target.with_suffix('.tmp')
    try:
        with temporary.open('xb') as handle: handle.write(encoded)
        os.replace(temporary,target)
    finally:
        temporary.unlink(missing_ok=True)
    print(json.dumps({s['nivel']:s['registros'] for s in sources}))

if __name__=='__main__': main()
