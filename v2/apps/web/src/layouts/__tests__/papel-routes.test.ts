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
    expect(esRutaPapel('/biblioteca')).toBe(true);
    // El frame del redirect de /ensayos no debe mostrar el chrome v1.
    expect(esRutaPapel('/ensayos')).toBe(true);
  });

  it('matchea el lector de ensayo por prefijo (T5, spec «Ruta y navegación»)', () => {
    expect(esRutaPapel('/ensayos/presidencia')).toBe(true);
  });

  it('matchea el manifiesto y la bitácora (spec 3.3/3.4, T8)', () => {
    expect(esRutaPapel('/manifiesto')).toBe(true);
    expect(esRutaPapel('/bitacora')).toBe(true);
    expect(esRutaPapel('/bitacora/quien-tiene-el-timon')).toBe(true);
  });

  it('NO matchea una ruta que solo comparte el prefijo de texto de /bitacora sin la barra', () => {
    expect(esRutaPapel('/bitacoraque')).toBe(false);
  });

  it('matchea /blog y sus crónicas — es el frame del redirect a /bitacora (spec 3.4)', () => {
    expect(esRutaPapel('/blog')).toBe(true);
    expect(esRutaPapel('/blog/lo-que-sea')).toBe(true);
  });

  it('NO matchea /blog/escribir — herramienta de plataforma, no crónica (spec 3.4, Decisión 11)', () => {
    expect(esRutaPapel('/blog/escribir')).toBe(false);
  });

  it('NO matchea una ruta que solo comparte el prefijo de texto de /ensayos sin la barra', () => {
    expect(esRutaPapel('/ensayosque')).toBe(false);
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
    expect(esRutaPapel('/ingresar')).toBe(false);
    expect(esRutaPapel('/cuaderno')).toBe(false);
  });

  it('matchea el catálogo de entrenamientos y sus rutas dinámicas por prefijo (spec 3.5, T5)', () => {
    expect(esRutaPapel('/entrenamientos')).toBe(true);
    expect(esRutaPapel('/entrenamientos/la-metamorfosis')).toBe(true);
  });

  it('NO matchea una ruta que solo comparte el prefijo de texto de /entrenamientos sin la barra', () => {
    expect(esRutaPapel('/entrenamientosque')).toBe(false);
  });
});
