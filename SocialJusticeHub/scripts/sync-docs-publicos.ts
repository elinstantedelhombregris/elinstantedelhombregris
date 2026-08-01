/**
 * Sincroniza `client/public/docs/` con el taller `Iniciativas Estratégicas/`.
 *
 * Run: npx tsx scripts/sync-docs-publicos.ts          (copia)
 *      npx tsx scripts/sync-docs-publicos.ts --check   (falla si hay drift)
 *
 * ── POR QUÉ EXISTE ───────────────────────────────────────────────────────────
 * `client/public/docs/` es la copia que sirve `IniciativaDocumento.tsx`, y era
 * una **copia manual**. Al 2026-08-01 los veintidós documentos que tenía estaban
 * driftados —PLANMOV con 1.114 líneas contra 2.206 en el taller, PLANSEG con las
 * fechas de tranche viejas de antes de la revisión de abril— y le faltaban cinco
 * enteros: PLANRUTA y los cuatro PLANes nuevos. Un lector de la web estaba
 * leyendo una edición de abril mientras el taller iba por agosto.
 *
 * **La dirección es una sola: el taller manda.** `Iniciativas Estratégicas/` es
 * la fuente de verdad del corpus; esta carpeta es una copia derivada, igual que
 * `v2/content/planes/*.mdx`. Nada se edita acá.
 *
 * ── SOBRE «PERDER TEXTO» ─────────────────────────────────────────────────────
 * Una comparación línea a línea entre las dos carpetas sugiere que la copia vieja
 * tiene miles de líneas que el taller no tiene. **Es un artefacto del método:** el
 * texto está, con otro corte de línea o con la redacción corregida (por ejemplo
 * las fases de PLANSEG, que en abril decían «Año 1» y ahora dicen «Tranche-2
 * inicial, 2028-2030»). Verificado sobre los casos con más diferencias. Aun así,
 * esto reescribe archivos versionados: **el diff se revisa antes de commitear**, y
 * la versión anterior queda en el historial de git.
 */
import { copyFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const TALLER = resolve(REPO_ROOT, 'Iniciativas Estratégicas');
const PUBLICOS = resolve(SCRIPT_DIR, '../client/public/docs');

/** Sólo los documentos de PLAN. El taller tiene además actas, reportes y matrices. */
const ES_DOCUMENTO_DE_PLAN = /^PLAN[A-Z0-9]*_Argentina_ES\.md$/;

function documentosDelTaller(): string[] {
  return readdirSync(TALLER)
    .filter((f) => ES_DOCUMENTO_DE_PLAN.test(f))
    .sort();
}

function main(): void {
  const soloVerificar = process.argv.includes('--check');
  const docs = documentosDelTaller();
  if (docs.length === 0) {
    console.error(`No se encontró ningún documento de PLAN en ${TALLER}`);
    process.exit(1);
  }

  const faltantes: string[] = [];
  const distintos: string[] = [];
  const copiados: string[] = [];

  for (const nombre of docs) {
    const origen = join(TALLER, nombre);
    const destino = join(PUBLICOS, nombre);
    if (!existsSync(destino)) {
      faltantes.push(nombre);
    } else if (readFileSync(origen, 'utf8') !== readFileSync(destino, 'utf8')) {
      distintos.push(nombre);
    } else {
      continue;
    }
    if (!soloVerificar) {
      copyFileSync(origen, destino);
      copiados.push(nombre);
    }
  }

  /**
   * Un `.md` en la copia que el taller no tiene: o se borró del taller y quedó
   * huérfano, o alguien editó acá en vez de allá. No se borra automáticamente —
   * se reporta, porque borrar es la única operación de este script que podría
   * perder algo de verdad.
   */
  const huerfanos = readdirSync(PUBLICOS)
    .filter((f) => ES_DOCUMENTO_DE_PLAN.test(f) && !docs.includes(f))
    .sort();

  if (soloVerificar) {
    const problemas = faltantes.length + distintos.length + huerfanos.length;
    if (problemas > 0) {
      console.error(`client/public/docs/ está desincronizado del taller (${String(problemas)}):\n`);
      for (const f of faltantes) console.error(`  · falta: ${f}`);
      for (const f of distintos) console.error(`  · difiere del taller: ${f}`);
      for (const f of huerfanos) console.error(`  · huérfano (no está en el taller): ${f}`);
      console.error('\nCorré `npx tsx scripts/sync-docs-publicos.ts` y revisá el diff.');
      process.exit(1);
    }
    console.log(`client/public/docs/ OK: ${String(docs.length)} documentos idénticos al taller.`);
    return;
  }

  for (const f of copiados) console.log(`copiado: ${f}`);
  for (const f of huerfanos) {
    console.log(`huérfano (NO se borra, revisalo a mano): ${f}`);
  }
  console.log(
    `\n${String(copiados.length)} archivo(s) sincronizado(s) sobre ${String(docs.length)} del taller. Revisá el diff antes de commitear.`,
  );
}

main();
