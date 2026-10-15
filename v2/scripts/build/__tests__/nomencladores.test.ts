import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import censoJson from '../../../apps/api/src/features/conciliacion/censo.generated.json';
import ign from '../../../apps/api/src/features/conciliacion/ign.generated.json';
import geo from '../../../packages/shared/src/datos/geografia.generated.json';

import type { NomencladorCensal } from '@v2/shared';

const censo: NomencladorCensal = censoJson;
const raiz=fileURLToPath(new URL('../../../',import.meta.url));
describe('Nomencladores trazables',()=>{
  it('conserva originales exactos y todas las referencias cruzadas con ceros',()=>{
    const claves=new Set(censo.unidades.map(u=>`${u.nivel}/${u.codigo}`));
    expect(claves.size).toBe(censo.unidades.length);
    expect(censo.fuentes.map(f=>f.registros)).toEqual([24,529,2315,4023]);
    for(const f of censo.fuentes) {
      const original=readFileSync(`${raiz}apps/web/public/geo/censo/${censo.version}/${f.archivo}`);
      expect(createHash('sha256').update(original).digest('hex')).toBe(f.sha256);
      expect(censo.unidades.filter(u=>u.nivel===f.nivel)).toHaveLength(f.registros);
    }
    for(const u of censo.unidades) {
      expect(claves.has(`province/${u.provincia}`)).toBe(true);
      if(u.departamento)expect(claves.has(`department/${u.departamento}`)).toBe(true);
      if(u.gobiernoLocal)expect(claves.has(`municipality/${u.gobiernoLocal}`)).toBe(true);
    }
    expect(JSON.parse(readFileSync(`${raiz}apps/web/public/geo/censo/${censo.version}/nomenclador.json`,'utf8'))).toEqual(censo);
  });
  it('el índice IGN corresponde a la misma geometría activa, incluso registros sin código',()=>{
    expect(ign.version).toBe(geo.version);
    const niveles={provincias:'province',departamentos:'department',municipios:'municipality'};
    for(const capa of geo.capas) {
      const datos=JSON.parse(readFileSync(`${raiz}apps/web/public${capa.archivo}`,'utf8')) as {features:{properties:{georefId:string|null;name:string}}[]};
      const nivel=niveles[capa.nombre as keyof typeof niveles];
      expect(ign.unidades.filter(u=>u.nivel===nivel)).toEqual(datos.features.map(f=>({nivel,codigo:f.properties.georefId,nombre:f.properties.name})));
    }
  });
});
