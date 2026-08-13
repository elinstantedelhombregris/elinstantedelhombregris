#!/usr/bin/env tsx
/**
 * Escribe en `vercel.json` las cabeceras de seguridad del documento.
 *
 * Correr desde `v2/`:
 *
 *   pnpm csp:generar
 *
 * La política sale de `packages/shared/src/seguridad/csp.ts` —la misma tabla
 * que emite helmet en la API— y la traducción a JSON está en `csp-vercel.ts`,
 * al lado. Este archivo sólo lee, transforma y escribe.
 *
 * No hace falta acordarse de correrlo: `scripts/build/__tests__/csp-vercel.test.ts`
 * falla si `vercel.json` quedó viejo, y dice esta línea de comando.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { conBloqueDeHeaders, hostsExternosDe } from './csp-vercel.js';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');
const rutaVercel = join(raizV2, 'vercel.json');
const rutaIndex = join(raizV2, 'apps', 'web', 'index.html');

const externos = hostsExternosDe(readFileSync(rutaIndex, 'utf8'));
if (externos.length > 0) {
  process.stderr.write(
    `apps/web/index.html pide ${externos.length} host(es) de afuera: ${externos.join(', ')}.\n` +
      'La CSP no nombra ninguno, así que el navegador va a bloquearlos. Traé el recurso\n' +
      'al origen (como se hizo con las tipografías en D-049) antes de generar.\n',
  );
  process.exit(1);
}

const antes = readFileSync(rutaVercel, 'utf8');
const despues = conBloqueDeHeaders(antes);
writeFileSync(rutaVercel, despues, 'utf8');

process.stdout.write(
  antes === despues
    ? 'vercel.json ya estaba al día.\n'
    : 'vercel.json: cabeceras de seguridad actualizadas.\n',
);
