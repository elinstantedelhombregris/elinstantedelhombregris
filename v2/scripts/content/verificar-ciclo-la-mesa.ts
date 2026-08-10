/**
 * Guardián del Ciclo IV — La Mesa. Corre sobre Ensayos/la-mesa/*.md y falla
 * mientras el ciclo esté incompleto o fuera de las restricciones del spec
 * (v2/docs/specs/2026-08-10-ciclo-iv-la-mesa.md).
 *
 * Verifica lo que se puede verificar por texto: forma, largo, tics, y que la
 * Cartografía no cite nada que no exista. Los dispositivos de autor —espejo
 * argentino, la parte hermosa, el movimiento— los verifica el revisor humano,
 * no este script: no hay grep honesto para ellos.
 *
 * Run: ./apps/api/node_modules/.bin/tsx scripts/content/verificar-ciclo-la-mesa.ts
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const SRC_DIR = resolve(REPO_ROOT, 'Ensayos/la-mesa');
const ENSAYOS_ROOT = resolve(REPO_ROOT, 'Ensayos');
const PLANES_DIR = resolve(V2_ROOT, 'content/planes');

const MIN_PALABRAS = 2400;
const MAX_PALABRAS = 3200;
const MIN_SECCIONES = 4;
const ESPERADOS = 7;

const TICS: readonly { patron: RegExp; nombre: string }[] = [
  { patron: /quiero ser honesto/i, nombre: 'quiero ser honesto' },
  { patron: /quiero ser claro acá/i, nombre: 'quiero ser claro acá' },
  { patron: /dejame decirlo limpio/i, nombre: 'dejame decirlo limpio' },
  { patron: /escuchá con atención/i, nombre: 'escuchá con atención' },
  { patron: /\bel hombre gris\.\s*$/im, nombre: 'párrafo cerrado con "el hombre gris."' },
  { patron: /decision headline/i, nombre: 'scaffolding: decision headline' },
  { patron: /key assumptions/i, nombre: 'scaffolding: key assumptions' },
  { patron: /proof metrics/i, nombre: 'scaffolding: proof metrics' },
  { patron: /top 5 failure modes/i, nombre: 'scaffolding: top 5 failure modes' },
  { patron: /\bTODO\b|\bTBD\b/, nombre: 'marcador TODO/TBD' },
];

export interface Hallazgo {
  archivo: string;
  regla: string;
  detalle: string;
}

const ROMANO = /^## (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.\s/;

export function auditar(
  docs: { archivo: string; raw: string }[],
  planesConocidos: Set<string>,
  ensayosConocidos: Set<string>,
): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];
  const push = (archivo: string, regla: string, detalle: string): void => {
    hallazgos.push({ archivo, regla, detalle });
  };

  for (const { archivo, raw } of docs) {
    const lineas = raw.split('\n');
    const primera = lineas.find((l) => l.trim() !== '') ?? '';
    const tieneH1 = primera.startsWith('# ');
    const restoTrasH1 = tieneH1 ? lineas.slice(lineas.indexOf(primera) + 1) : [];
    const segunda = restoTrasH1.find((l) => l.trim() !== '') ?? '';
    const tieneH2 = segunda.startsWith('## ') && !ROMANO.test(segunda);
    if (!tieneH1 || !tieneH2) {
      push(archivo, 'encabezado-invalido', 'falta el H1 de título o el H2 de subtítulo');
    }

    const secciones = lineas.filter((l) => ROMANO.test(l)).length;
    if (secciones < MIN_SECCIONES) {
      push(archivo, 'secciones-insuficientes', `${String(secciones)} secciones romanas, mínimo ${String(MIN_SECCIONES)}`);
    }

    const idxCarto = raw.indexOf('\n## Cartografía');
    if (idxCarto < 0) {
      push(archivo, 'cartografia-ausente', 'no hay sección "## Cartografía"');
    }

    const cuerpo = tieneH1 ? raw.slice(raw.indexOf(primera) + primera.length) : raw;
    const palabras = cuerpo.split(/\s+/).filter((w) => w.length > 0).length;
    if (palabras < MIN_PALABRAS || palabras > MAX_PALABRAS) {
      push(
        archivo,
        'largo-fuera-de-banda',
        `${String(palabras)} palabras (banda ${String(MIN_PALABRAS)}–${String(MAX_PALABRAS)})`,
      );
    }

    for (const { patron, nombre } of TICS) {
      if (patron.test(raw)) push(archivo, 'tic-prohibido', nombre);
    }

    if (idxCarto >= 0) {
      const carto = raw.slice(idxCarto);
      for (const m of carto.matchAll(/\bPLAN[A-Z0-9]{2,}\b/g)) {
        if (!planesConocidos.has(m[0])) push(archivo, 'plan-inexistente', m[0]);
      }
      for (const m of carto.matchAll(/\b\d{2}-[a-z0-9-]+\.md\b/g)) {
        if (!ensayosConocidos.has(m[0])) push(archivo, 'ensayo-inexistente', m[0]);
      }
    }
  }

  return hallazgos;
}

function listarPlanes(): Set<string> {
  if (!existsSync(PLANES_DIR)) return new Set();
  return new Set(readdirSync(PLANES_DIR).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, '')));
}

function listarEnsayos(): Set<string> {
  const nombres = new Set<string>();
  const visitar = (dir: string): void => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      if (entrada.isDirectory()) visitar(resolve(dir, entrada.name));
      else if (entrada.name.endsWith('.md')) nombres.add(entrada.name);
    }
  };
  visitar(ENSAYOS_ROOT);
  return nombres;
}

function main(): void {
  if (!existsSync(SRC_DIR)) {
    process.stderr.write(`✗ no existe ${SRC_DIR}\n`);
    process.exit(1);
  }
  const archivos = readdirSync(SRC_DIR).filter((f) => /^0[1-7]-[a-z0-9-]+\.md$/.test(f)).sort();
  const docs = archivos.map((archivo) => ({ archivo, raw: readFileSync(resolve(SRC_DIR, archivo), 'utf-8') }));
  const hallazgos = auditar(docs, listarPlanes(), listarEnsayos());

  for (const h of hallazgos) {
    process.stderr.write(`✗ ${h.archivo} — ${h.regla}: ${h.detalle}\n`);
  }
  process.stdout.write(`${String(archivos.length)}/${String(ESPERADOS)} ensayos · ${String(hallazgos.length)} hallazgos\n`);

  if (hallazgos.length > 0) process.exit(1);
  if (archivos.length !== ESPERADOS) {
    process.stderr.write(`✗ ciclo incompleto: faltan ${String(ESPERADOS - archivos.length)} ensayos\n`);
    process.exit(1);
  }
  process.stdout.write('✓ el ciclo pasa el guardián\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
