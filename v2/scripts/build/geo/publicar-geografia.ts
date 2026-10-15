import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CAPAS_VERSIONADAS, validarGeografia } from '../../../packages/shared/src/datos/geografia-schema.js';
import { escribirAtomico, reemplazarConRollback, conCandado } from '../datos/archivo-atomico.js';

import { moduloProvincias } from './modulo-provincias.js';


export const sha256 = (texto: string | Buffer) => createHash('sha256').update(texto).digest('hex');

/** Solo prepara archivos de una edición del sitio, nunca escribe en una base. */
export function publicarGeografia(raiz: string, fuente: string, obtenida: string) {
  return conCandado(join(raiz, 'apps/web/public/geo/.importacion.lock'), () => preparar(raiz, fuente, obtenida));
}
function preparar(raiz: string, fuente: string, obtenida: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(obtenida) || Number.isNaN(Date.parse(obtenida)) || new Date(obtenida).toISOString().slice(0, 10) !== obtenida) throw new Error('Indicá la fecha de obtención de la fuente.');
  const capas = CAPAS_VERSIONADAS.map((capa) => {
    const texto = readFileSync(join(fuente, `${capa}.geojson`), 'utf8');
    const { datos, ...resumen } = validarGeografia(texto, capa);
    return { capa, texto, resumen, hash: sha256(texto), datos };
  });
  const hash = sha256(capas.map((c) => c.hash).join(''));
  const version = `ign-${obtenida.replaceAll('-', '')}-${hash.slice(0, 12)}`;
  const destino = join(raiz, 'apps/web/public/geo/versiones', version);
  mkdirSync(destino, { recursive: true });
  for (const c of capas) {
    const ruta = join(destino, `${c.capa}.geojson`);
    if (existsSync(ruta)) {
      if (sha256(readFileSync(ruta)) !== c.hash) throw new Error('Una versión existente fue alterada.');
    } else writeFileSync(ruta, c.texto, { flag: 'wx' });
  }
  const manifiesto = {
    version, obtenida, fuente: 'Instituto Geográfico Nacional',
    url: 'https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/CapasSIG',
    crs: 'EPSG:4326', marco: [-74.5, -56.5, -53, -21],
    limites: 'Marco continental e islas dentro del recorte; Antártida, Georgias y Sandwich del Sur fuera. Sin radios censales ni máscara de áreas habitadas. No usar para límites catastrales.',
    controles: 'Coordenadas, anillos cerrados y con área, códigos únicos y peso. Simplificación topológica del importador IGN; estas comprobaciones no certifican todos los bordes ni equivalencias censales.',
    capas: capas.map((c) => ({
      nombre: c.capa, ...c.resumen, sha256: c.hash,
      archivo: `/geo/versiones/${version}/${c.capa}.geojson`,
      toleranciaM: { provincias: 200, departamentos: 500, municipios: 400 }[c.capa],
      union: c.capa === 'provincias' ? 'Códigos provinciales; correspondencia con el catálogo canónico comprobada en pruebas.' : 'Correspondencia con el catálogo operativo pendiente; no se infiere por nombre.',
    })),
  };
  const serializado = `${JSON.stringify(manifiesto, null, 2)}\n`;
  const rutaManifiesto = join(destino, 'manifiesto.json');
  if (existsSync(rutaManifiesto) && readFileSync(rutaManifiesto, 'utf8') !== serializado)
    throw new Error('No se puede reescribir el manifiesto de una versión.');
  if (!existsSync(rutaManifiesto)) writeFileSync(rutaManifiesto, serializado, { flag: 'wx' });
  // Único punto de activación. Los archivos anteriores se conservan con su URL.
  const provincia = capas.find((c) => c.capa === 'provincias');
  if (!provincia) throw new Error('Falta la capa provincial.');
  reemplazarConRollback([
    { ruta: join(raiz, 'apps/api/src/features/geographic/provincias.generated.ts'), contenido: moduloProvincias(provincia.texto, version) },
    { ruta: join(raiz, 'packages/shared/src/datos/geografia.generated.json'), contenido: serializado },
  ]);
  return manifiesto;
}

export function registrarIntentoGeo(raiz: string, estado: 'correcta' | 'fallida', detalle: string) {
  const carpeta = join(raiz, 'apps/web/public/geo/intentos');
  mkdirSync(carpeta, { recursive: true });
  const fecha = new Date().toISOString();
  const intento = { fecha, estado, detalle };
  writeFileSync(join(carpeta, `${fecha.replaceAll(':', '-')}.json`), `${JSON.stringify(intento, null, 2)}\n`, { flag: 'wx' });
  escribirAtomico(join(raiz, 'apps/web/public/geo/ultimo-intento.json'), `${JSON.stringify(intento, null, 2)}\n`);
}
