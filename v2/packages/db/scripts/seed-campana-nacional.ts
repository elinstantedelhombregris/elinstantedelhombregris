#!/usr/bin/env tsx
/**
 * Siembra la campaña nacional permanente «Mi Argentina ideal».
 *
 *   pnpm --filter @v2/db db:seed-campana-nacional \
 *     --url=postgresql://postgres@127.0.0.1:55440/basta_descartable_test \
 *     --owner-username=<usuario>                    # en seco
 *   … --aplicar                                      # escribe
 *   … --url=<base remota> --produccion [--aplicar]   # solo con la orden explícita
 *
 * **No carga `v2/.env`.** `v2/.env` apunta a producción: un script que lo lee
 * por costumbre escribe ahí sin que nadie lo haya decidido (D-014). El único
 * destino es `--url`. Antes de hacer nada imprime host, base y responsable
 * —nunca la clave— y, sin `--aplicar`, solo lee.
 *
 * Idempotente: si la campaña ya existe y es de la misma cuenta, dice «ya
 * existe» y sale con 0 sin cambiar nada; si es de otra, sale con 1.
 *
 * Necesita las migraciones 0025 a 0030 aplicadas y que `--owner-username`
 * sea una cuenta activa con el correo verificado. Guía de uso y de la puesta en
 * producción: `docs/operations/campana-nacional.md`.
 */
import { pathToFileURL } from 'node:url';

import { getDb } from '../src/client.js';
import { puentearNeonAPostgresLocal } from '../tests/helpers/neon-local.js';

import { hoyEnArgentina } from './campana-nacional/contrato.js';
import {
  AYUDA,
  ErrorDeUso,
  describirDestino,
  elegirDestino,
  leerOpciones,
} from './campana-nacional/opciones.js';
import { ErrorDeSiembra, sembrarCampanaNacional } from './campana-nacional/sembrar.js';

export { construirContratoNacional } from './campana-nacional/contrato.js';

const escribir = (texto: string): void => void process.stdout.write(`${texto}\n`);
const avisar = (texto: string): void => void process.stderr.write(`${texto}\n`);

async function main(argv: readonly string[]): Promise<number> {
  let opciones: ReturnType<typeof leerOpciones>;
  let destino: ReturnType<typeof elegirDestino>;
  try {
    opciones = leerOpciones(argv);
    destino = elegirDestino(opciones.url, opciones.produccion);
  } catch (e) {
    if (!(e instanceof ErrorDeUso)) throw e;
    avisar(e.message);
    avisar(AYUDA);
    return 2;
  }

  const { host, base } = describirDestino(opciones.url);
  escribir(`Host:          ${host}`);
  escribir(`Base:          ${base}`);
  escribir(`Responsable:   ${opciones.username}`);
  escribir(`Modo:          ${opciones.aplicar ? 'APLICAR (escribe)' : 'en seco (solo lee)'}`);

  // `getDb()` lee `DATABASE_URL`; acá se fija a mano, sin pasar por ningún .env.
  process.env['DATABASE_URL'] = opciones.url.href;
  const cerrar =
    destino.tipo === 'local' ? puentearNeonAPostgresLocal(opciones.url.href) : undefined;
  try {
    const r = await sembrarCampanaNacional(getDb(), {
      username: opciones.username,
      aplicar: opciones.aplicar,
      hoy: hoyEnArgentina(),
    });
    if (r.resultado === 'ya_existe') {
      escribir(
        `La campaña ya existe (${r.campanaId}, edición ${String(r.revision)}, ${r.estado}) y es de ${opciones.username}. No se cambió nada.`,
      );
    } else if (r.resultado === 'a_crear') {
      escribir('\nEn seco: la campaña no existe y esto es lo que se crearía.\n');
      escribir(JSON.stringify(r.contrato, null, 2));
      escribir('\nPara escribirla, volvé a correr con --aplicar.');
    } else {
      escribir(`Campaña creada: ${r.campanaId} (edición 1, abierta).`);
    }
    return 0;
  } catch (e) {
    if (e instanceof ErrorDeSiembra) {
      avisar(e.message);
      return 1;
    }
    avisar(`La siembra falló: ${e instanceof Error ? e.message : 'error desconocido'}`);
    return 1;
  } finally {
    await cerrar?.();
  }
}

// Importable sin efectos (la prueba lo hace); se ejecuta solo cuando es el archivo que corre.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}
