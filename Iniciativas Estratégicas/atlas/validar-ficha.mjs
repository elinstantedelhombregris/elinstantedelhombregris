#!/usr/bin/env node
/**
 * Valida una ficha del atlas contra el documento que dice describir.
 *
 * Uso:  node "Iniciativas Estratégicas/atlas/validar-ficha.mjs" PLANTER
 *       node "Iniciativas Estratégicas/atlas/validar-ficha.mjs" --todas
 *
 * Por qué existe: las fichas las escribe un lector (humano o modelo) y un lector
 * se equivoca con confianza. Cada afirmación de una ficha lleva `linea` y `cita`,
 * y esta guardia comprueba que la cita esté LITERALMENTE en esa línea del taller.
 * Lo que no se puede comprobar contra el texto no entra al atlas.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const TALLER = resolve(AQUI, '..');
const FICHAS = join(AQUI, 'fichas');

export const CODIGOS = readdirSync(TALLER)
  .map((f) => /^(PLAN[A-Z0-9]+)_Argentina_ES\.md$/.exec(f)?.[1])
  .filter(Boolean)
  .sort();

export const TEMAS = [
  'territorio-ambiente', 'agua-energia', 'vivienda-ciudad', 'movilidad', 'salud', 'cuidado-ciclo-de-vida',
  'educacion-conocimiento', 'cultura-memoria', 'digital-datos', 'trabajo-produccion', 'moneda-finanzas',
  'fiscal-presupuesto', 'justicia-seguridad', 'estado-instituciones', 'soberania-exterior',
  'democracia-participacion', 'palabra-publica', 'poblacion-migracion', 'transicion-implementacion',
];
const TIPOS_CONCEPTO = ['institucion', 'fondo', 'mecanismo', 'programa', 'figura', 'norma', 'metrica', 'termino'];
const TIPOS_CIFRA = ['presupuesto', 'meta', 'plazo', 'fuente', 'parametro', 'diagnostico'];
const RANGOS = { conceptos: [8, 22], usa: [3, 14], cifras: [6, 16], acoples: [4, 14], tensiones: [0, 6], sin_resolver: [0, 5] };
const LARGOS = { tesis: 45, problema: 70, resumen: 120, horizonte: 40, financiamiento: 45 };

const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
const palabras = (s) => norm(s).split(' ').filter(Boolean).length;

export function validar(code) {
  const errores = [];
  const avisos = [];
  const ruta = join(FICHAS, `${code}.json`);
  if (!CODIGOS.includes(code)) return { errores: [`código desconocido: ${code}`], avisos };
  if (!existsSync(ruta)) return { errores: [`no existe ${ruta}`], avisos };

  let f;
  try {
    f = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    return { errores: [`JSON inválido: ${e.message}`], avisos };
  }
  const texto = readFileSync(join(TALLER, `${code}_Argentina_ES.md`), 'utf8');
  const lineas = texto.split('\n');
  const lineasNorm = lineas.map(norm);

  if (f.code !== code) errores.push(`"code" debe ser "${code}"`);
  for (const k of ['nombre', 'version', 'tesis', 'problema', 'resumen', 'horizonte', 'financiamiento']) {
    if (typeof f[k] !== 'string' || !f[k].trim()) errores.push(`falta el texto "${k}"`);
    else if (LARGOS[k] && palabras(f[k]) > LARGOS[k]) errores.push(`"${k}" tiene ${palabras(f[k])} palabras (máx. ${LARGOS[k]})`);
  }
  if (!Array.isArray(f.temas) || f.temas.length < 2 || f.temas.length > 5) errores.push('"temas": entre 2 y 5');
  for (const t of f.temas ?? []) if (!TEMAS.includes(t)) errores.push(`tema fuera del vocabulario: "${t}"`);

  /** La cita tiene que estar en la línea declarada. Si está en otra, se dice cuál. */
  const anclar = (donde, it) => {
    if (!Number.isInteger(it.linea) || it.linea < 1 || it.linea > lineas.length) {
      errores.push(`${donde}: "linea" ${it.linea} fuera de rango (1–${lineas.length})`);
      return;
    }
    const c = norm(it.cita ?? '');
    if (c.length < 12) return errores.push(`${donde}: "cita" vacía o demasiado corta`);
    if (c.length > 200) return errores.push(`${donde}: "cita" de ${c.length} caracteres (máx. 200)`);
    if (lineasNorm[it.linea - 1].includes(c)) return;
    const real = lineasNorm.findIndex((l) => l.includes(c));
    errores.push(
      real === -1
        ? `${donde}: la cita NO está en el documento → «${c.slice(0, 70)}…»`
        : `${donde}: la cita está en la línea ${real + 1}, no en la ${it.linea}`,
    );
  };

  const lista = (k) => {
    const v = f[k];
    if (!Array.isArray(v)) {
      errores.push(`"${k}" debe ser una lista`);
      return [];
    }
    const [min, max] = RANGOS[k];
    if (v.length < min || v.length > max) errores.push(`"${k}": ${v.length} ítems (se piden ${min}–${max})`);
    return v;
  };

  const aliasOk = (donde, alias, enEsteDoc) => {
    if (!Array.isArray(alias) || !alias.length) return errores.push(`${donde}: falta "alias"`);
    for (const a of alias) {
      if (typeof a !== 'string' || a.trim().length < 3) errores.push(`${donde}: alias demasiado corto «${a}»`);
      else if (/^[a-záéíóúñ]+$/i.test(a) && a.length < 6 && a !== a.toUpperCase()) errores.push(`${donde}: alias genérico «${a}»`);
      else if (enEsteDoc && !texto.includes(a)) errores.push(`${donde}: el alias «${a}» no aparece literal en ${code}`);
    }
  };

  lista('conceptos').forEach((c, i) => {
    const d = `conceptos[${i}] (${c.nombre})`;
    if (!c.nombre || !c.que_es) errores.push(`${d}: faltan "nombre" o "que_es"`);
    if (!TIPOS_CONCEPTO.includes(c.tipo)) errores.push(`${d}: tipo inválido "${c.tipo}"`);
    if (c.que_es && palabras(c.que_es) > 40) errores.push(`${d}: "que_es" de ${palabras(c.que_es)} palabras (máx. 40)`);
    aliasOk(d, c.alias, true);
    anclar(d, c);
  });
  lista('usa').forEach((u, i) => {
    const d = `usa[${i}] (${u.nombre})`;
    if (!CODIGOS.includes(u.origen)) errores.push(`${d}: "origen" no es un PLAN del registro: "${u.origen}"`);
    if (u.origen === code) errores.push(`${d}: "origen" es el propio PLAN — eso va en "conceptos"`);
    if (!u.para_que) errores.push(`${d}: falta "para_que"`);
    aliasOk(d, u.alias, true);
    anclar(d, u);
  });
  lista('cifras').forEach((c, i) => {
    const d = `cifras[${i}] (${c.concepto})`;
    if (!c.concepto || !c.valor) errores.push(`${d}: faltan "concepto" o "valor"`);
    if (!TIPOS_CIFRA.includes(c.tipo)) errores.push(`${d}: tipo inválido "${c.tipo}"`);
    if (c.cita && !/\d/.test(c.cita)) errores.push(`${d}: la cita de una cifra tiene que contener el número`);
    anclar(d, c);
  });
  lista('acoples').forEach((a, i) => {
    const d = `acoples[${i}] (${a.con})`;
    if (!CODIGOS.includes(a.con) || a.con === code) errores.push(`${d}: "con" debe ser OTRO PLAN del registro`);
    if (!a.que) errores.push(`${d}: falta "que"`);
    anclar(d, a);
  });
  lista('tensiones').forEach((t, i) => {
    const d = `tensiones[${i}]`;
    if (t.con !== 'interno' && !CODIGOS.includes(t.con)) errores.push(`${d}: "con" debe ser un PLAN o "interno"`);
    if (!t.que) errores.push(`${d}: falta "que"`);
    anclar(d, t);
  });
  lista('sin_resolver').forEach((s, i) => {
    if (!s.que) errores.push(`sin_resolver[${i}]: falta "que"`);
    anclar(`sin_resolver[${i}]`, s);
  });

  if (JSON.stringify(f).includes('BASTA') && /(?<!¡)BASTA!?/.test(JSON.stringify(f).replace(/¡BASTA!/g, ''))) {
    avisos.push('«¡BASTA!» se escribe siempre con los dos signos');
  }
  return { errores, avisos };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];
  const codigos = arg === '--todas' ? CODIGOS : [arg];
  if (!arg) {
    console.error('Uso: validar-ficha.mjs PLANXXX | --todas');
    process.exit(2);
  }
  let malas = 0;
  for (const c of codigos) {
    const { errores, avisos } = validar(c);
    if (errores.length) malas++;
    console.log(`${errores.length ? '✗' : '✓'} ${c}${errores.length ? ` — ${errores.length} errores` : ''}`);
    for (const e of errores) console.log(`    ${e}`);
    for (const a of avisos) console.log(`    (aviso) ${a}`);
  }
  if (codigos.length > 1) console.log(`\n${codigos.length - malas}/${codigos.length} fichas válidas`);
  process.exit(malas ? 1 : 0);
}
