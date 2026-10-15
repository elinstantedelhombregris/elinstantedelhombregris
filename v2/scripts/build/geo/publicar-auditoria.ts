import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { informeEspacialSchema } from '../../../packages/shared/src/datos/validacion-espacial.js';
import { conCandado, escribirAtomico } from '../datos/archivo-atomico.js';

import { sha256 } from './publicar-geografia.js';

/** Adjunta controles a bytes exactos; nunca sustituye cartografía ni su manifiesto. */
export function publicarAuditoria(raiz: string, texto: string) {
  return conCandado(join(raiz, 'apps/web/public/geo/.importacion.lock'), () => {
    const informe = informeEspacialSchema.parse(JSON.parse(texto));
    const activo = JSON.parse(readFileSync(join(raiz, 'packages/shared/src/datos/geografia.generated.json'), 'utf8')) as { version: string };
    if (informe.version !== activo.version) throw new Error('El informe no corresponde a la edición activa.');
    for (const nombre of ['provincias', 'departamentos', 'municipios']) {
      const fuente = informe.fuentes.filter(f => f.nombre === nombre);
      const archivo = `/geo/versiones/${activo.version}/${nombre}.geojson`;
      if (fuente.length !== 1 || fuente[0]?.archivo !== archivo || sha256(readFileSync(join(raiz, 'apps/web/public', archivo))) !== fuente[0].sha256)
        throw new Error('El informe no corresponde a los archivos publicados.');
    }
    const hash = sha256(texto);
    const archivo = `/geo/validaciones/${informe.version}/${hash}.json`;
    const destino = join(raiz, 'apps/web/public', archivo);
    mkdirSync(join(destino, '..'), { recursive: true });
    if (existsSync(destino)) {
      if (sha256(readFileSync(destino)) !== hash) throw new Error('Informe archivado alterado.');
    } else writeFileSync(destino, texto, { flag: 'wx' });
    const referencia = { version: informe.version, archivo, sha256: hash };
    escribirAtomico(join(raiz, 'packages/shared/src/datos/validacion-espacial.generated.json'), `${JSON.stringify(referencia, null, 2)}\n`);
    return referencia;
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const archivo = process.argv.find(a => a.startsWith('--informe='))?.slice(10);
  if (!archivo) throw new Error('Indicá --informe=<archivo JSON>.');
  const raiz = fileURLToPath(new URL('../../../', import.meta.url));
  process.stdout.write(`${JSON.stringify(publicarAuditoria(raiz, readFileSync(archivo, 'utf8')))}\n`);
}
