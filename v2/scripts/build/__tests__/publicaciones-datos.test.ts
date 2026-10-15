import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { CATALOGO_FUENTES } from '../../../packages/shared/src/datos/fuentes.js';
import { validarGeografia } from '../../../packages/shared/src/datos/geografia-schema.js';
import { GEOGRAFIA } from '../../../packages/shared/src/datos/geografia.js';
import { publicarFuentes, registrarIntentoFuente } from '../datos/publicar-fuentes.js';
import { publicarGeografia, registrarIntentoGeo, sha256 } from '../geo/publicar-geografia.js';

const raiz = fileURLToPath(new URL('../../../', import.meta.url));
const temporales: string[] = [];
const temporal = () => { const p = mkdtempSync(join(tmpdir(), 'fuentes-')); temporales.push(p); return p; };
afterEach(() => { for (const p of temporales.splice(0)) rmSync(p, { recursive: true, force: true }); });
const textoCapa = (nombre: string) => readFileSync(join(raiz, `apps/web/public/geo/versiones/${GEOGRAFIA.version}/${nombre}.geojson`), 'utf8');

describe('Publicaciones reproducibles', () => {
  it('las huellas publicadas corresponden a cada geometría y sus códigos', () => {
    for (const c of GEOGRAFIA.capas) expect(sha256(textoCapa(c.nombre))).toBe(c.sha256);
    for (const capa of ['provincias', 'departamentos', 'municipios'] as const) {
      const r = validarGeografia(textoCapa(capa), capa);
      expect(r.rasgos).toBe(GEOGRAFIA.capas.find((c) => c.nombre === capa)?.rasgos);
    }
  });
  it('un fallo en la última capa conserva la edición y el resolvedor previos, y deja constancia del intento', () => {
    const r = temporal(), entrada = temporal();
    for (const c of GEOGRAFIA.capas) writeFileSync(join(entrada, `${c.nombre}.geojson`), textoCapa(c.nombre));
    const primera = publicarGeografia(r, entrada, '2026-09-22');
    const manifest = join(r, 'packages/shared/src/datos/geografia.generated.json');
    const api = join(r, 'apps/api/src/features/geographic/provincias.generated.ts');
    const original = readFileSync(manifest, 'utf8'), resolvedor = readFileSync(api, 'utf8');
    writeFileSync(join(entrada, 'municipios.geojson'), '{incompleto');
    expect(() => publicarGeografia(r, entrada, '2026-10-15')).toThrow();
    registrarIntentoGeo(r, 'fallida', 'La capa municipal llegó incompleta.');
    expect(readFileSync(manifest, 'utf8')).toBe(original);
    expect(readFileSync(api, 'utf8')).toBe(resolvedor);
    expect(readFileSync(join(r, 'apps/web/public/geo/ultimo-intento.json'), 'utf8')).toContain('fallida');
    expect(readFileSync(join(r, `apps/web/public/geo/versiones/${primera.version}/provincias.geojson`), 'utf8')).toBe(textoCapa('provincias'));
  });
  it('rechaza anillos abiertos y códigos duplicados', () => {
    const rasgo = { type: 'Feature', properties: { name: 'Ejemplo', georefId: '06007' }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } };
    expect(() => validarGeografia(JSON.stringify({ type: 'FeatureCollection', features: [rasgo, rasgo] }), 'departamentos')).toThrow('duplicados');
    rasgo.geometry.coordinates = [[[0, 0], [1, 0], [1, 1], [0, 1]]];
    expect(() => validarGeografia(JSON.stringify({ type: 'FeatureCollection', features: [rasgo] }), 'departamentos')).toThrow('cerrado');
  });
  it('una nueva fuente conserva ediciones anteriores y una importación fallida conserva la activa', () => {
    const r = temporal(), carpeta = join(r, 'packages/shared/src/datos');
    mkdirSync(carpeta, { recursive: true });
    const ruta = join(carpeta, 'catalogo-fuentes.json');
    writeFileSync(ruta, JSON.stringify({ actual: CATALOGO_FUENTES.version, versiones: [CATALOGO_FUENTES] }));
    const original = Buffer.from('Documento de prueba aislado'), nuevo = { ...CATALOGO_FUENTES, version: 'prueba-r2', archivoSha256: sha256(original) };
    publicarFuentes(r, nuevo, original);
    const publicado = readFileSync(ruta, 'utf8');
    expect(publicado).toContain(CATALOGO_FUENTES.version);
    expect(publicado).toContain('prueba-r2');
    expect(() => publicarFuentes(r, { ...nuevo, publicacion: 'Cambio retroactivo' }, original)).toThrow('reescribir');
    expect(() => publicarFuentes(r, { ...nuevo, version: 'prueba-r3' }, Buffer.from('otro'))).toThrow('huella');
    registrarIntentoFuente(r, 'fallida', 'Huella distinta.');
    expect(readFileSync(ruta, 'utf8')).toBe(publicado);
    expect(readFileSync(join(r, 'apps/web/public/fuentes/ultimo-intento.json'), 'utf8')).toContain('fallida');
  });
  it('la descarga de la selección coincide con los datos del sitio', () => {
    const archivo = JSON.parse(readFileSync(join(raiz, `apps/web/public/fuentes/versiones/${CATALOGO_FUENTES.version}.json`), 'utf8')) as unknown;
    expect(archivo).toEqual(CATALOGO_FUENTES);
  });
});
