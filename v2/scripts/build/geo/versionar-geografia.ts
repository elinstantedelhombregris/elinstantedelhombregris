import { fileURLToPath } from 'node:url';

import { publicarGeografia, registrarIntentoGeo } from './publicar-geografia.js';

const raiz = fileURLToPath(new URL('../../../', import.meta.url));
try {
  const fuente = process.argv.find((a) => a.startsWith('--fuente='))?.slice(9);
  const fecha = process.argv.find((a) => a.startsWith('--obtenida='))?.slice(11);
  if (!fuente || !fecha) throw new Error('Usá --fuente=carpeta --obtenida=AAAA-MM-DD.');
  const resultado = publicarGeografia(raiz, fuente, fecha);
  registrarIntentoGeo(raiz, 'correcta', resultado.version);
  process.stdout.write(`${resultado.version}\n`);
} catch (error) {
  registrarIntentoGeo(raiz, 'fallida', error instanceof Error ? error.message : 'No se pudo preparar la geografía.');
  process.exitCode = 1;
}
