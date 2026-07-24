import { describe, expect, it } from 'vitest';

import { esRutaPapel } from '../papel-routes';

describe('esRutaPapel (spec 2.3, Decisión 10 — PAPEL_ROUTES aprende prefijos)', () => {
  it('matchea las rutas exactas ya migradas', () => {
    expect(esRutaPapel('/')).toBe(true);
    expect(esRutaPapel('/la-idea')).toBe(true);
    expect(esRutaPapel('/el-mapa')).toBe(true);
    expect(esRutaPapel('/mandato-vivo')).toBe(true);
    expect(esRutaPapel('/planes')).toBe(true);
    expect(esRutaPapel('/sembrar')).toBe(true);
  });

  it('NO matchea una ruta que solo comparte el prefijo de texto de /sembrar sin la barra (no hay sub-rutas)', () => {
    expect(esRutaPapel('/sembrarque')).toBe(false);
  });

  it('matchea los anexos dinámicos del mandato por prefijo', () => {
    expect(esRutaPapel('/mandato-vivo/pulso/42')).toBe(true);
    expect(esRutaPapel('/mandato-vivo/propuesta/7')).toBe(true);
  });

  it('matchea los expedientes de planes por prefijo', () => {
    expect(esRutaPapel('/planes/plansal')).toBe(true);
  });

  it('NO matchea una ruta que solo comparte el prefijo de texto de /planes sin la barra', () => {
    expect(esRutaPapel('/planesque')).toBe(false);
  });

  it('NO matchea una ruta que solo comparte el prefijo de texto sin la barra', () => {
    // Pin contra un `startsWith('/mandato-vivo')` sin barra, que colaría
    // cualquier ruta futura tipo /mandato-vivo-archivado.
    expect(esRutaPapel('/mandato-vivo-archivado')).toBe(false);
  });

  it('NO matchea rutas v1 sin migrar', () => {
    expect(esRutaPapel('/blog')).toBe(false);
    expect(esRutaPapel('/ingresar')).toBe(false);
    expect(esRutaPapel('/cuaderno')).toBe(false);
  });
});
