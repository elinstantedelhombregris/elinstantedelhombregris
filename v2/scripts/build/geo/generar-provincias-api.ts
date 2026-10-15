/** Regenera el resolvedor compilado desde la edición publicada, sin red ni base. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { archivoGeografico, GEOGRAFIA } from '../../../packages/shared/src/datos/geografia.js';
import { escribirAtomico } from '../datos/archivo-atomico.js';

import { moduloProvincias } from './modulo-provincias.js';

const fuente = new URL(`../../../apps/web/public${archivoGeografico('provincias')}`, import.meta.url);
const destino = fileURLToPath(new URL('../../../apps/api/src/features/geographic/provincias.generated.ts', import.meta.url));
escribirAtomico(destino, moduloProvincias(readFileSync(fuente, 'utf8'), GEOGRAFIA.version));
process.stdout.write(`${GEOGRAFIA.version}: módulo provincial generado.\n`);
