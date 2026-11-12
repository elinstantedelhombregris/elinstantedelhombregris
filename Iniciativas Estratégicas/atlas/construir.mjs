#!/usr/bin/env node
/**
 * El atlas del corpus: lee el taller entero y arma el grafo de los PLANes.
 *
 *   node "Iniciativas Estratégicas/atlas/construir.mjs"                 arma grafo.json, atlas.html y DESARMONIAS.md
 *   node "Iniciativas Estratégicas/atlas/construir.mjs" --impacto PLANDIG        quién depende de PLANDIG, por sección
 *   node "Iniciativas Estratégicas/atlas/construir.mjs" --impacto PLANDIG §8     quién apunta a esa sección
 *   node "Iniciativas Estratégicas/atlas/construir.mjs" --impacto PLANDIG:788    quién apunta a esa línea
 *   node "Iniciativas Estratégicas/atlas/construir.mjs" --fijar                  acepta el estado actual de las anclas
 *
 * ── POR QUÉ EXISTE ───────────────────────────────────────────────────────────
 * El corpus son 28 documentos y más de un millón de palabras que se citan entre
 * sí de tres maneras —por nombre, por sección y por número de línea— y que además
 * declaran sus dependencias en cuatro lugares distintos que nadie compara. Quien
 * edita un PLAN no ve lo que rompe en los otros hasta que una guardia grita, o no
 * grita. Este script invierte el índice: para cada PLAN, sección y línea dice
 * quién le apunta, desde dónde y con qué texto.
 *
 * ── QUÉ LEE ──────────────────────────────────────────────────────────────────
 *   · los 28 `PLAN*_Argentina_ES.md` del taller (la fuente que se edita)
 *   · los demás `.md` del taller (documentos transversales)
 *   · PLAN_REGISTRY.yml, DEPENDENCY_GRAPH.yml y shared/arquitecto-data.ts
 *     (las tres declaraciones de dependencias que viven fuera de los documentos)
 *   · atlas/fichas/*.json (la capa leída: qué es cada PLAN y qué nombra)
 *   · atlas/relaciones.json (relaciones auditadas y sus citas)
 *   · atlas/anclas.lock.json (qué decía cada línea citada la última vez)
 *
 * ── QUÉ NO HACE ──────────────────────────────────────────────────────────────
 * No edita ningún PLAN. No reemplaza a `verificar-remisiones.ts` ni a las guardias
 * por PLAN: aquéllas fallan el CI, esto explica. Y no juzga contenido: todo lo que
 * informa sale de un patrón sobre el texto, con archivo y línea para ir a mirar.
 *
 * Sin dependencias: Node 20+ y nada más.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

const AQUI = dirname(fileURLToPath(import.meta.url));
const TALLER = resolve(AQUI, '..');
const REPO = resolve(TALLER, '..');
const leer = (p) => readFileSync(p, 'utf8');
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const contarPalabras = (s) => (s.match(/\S+/g) ?? []).length;

// ════════════════════════════════════════════════════════════════════════════
// 1. EL CORPUS
// ════════════════════════════════════════════════════════════════════════════

const ARCHIVOS_PLAN = readdirSync(TALLER).filter((f) => /^PLAN[A-Z0-9]+_Argentina_ES\.md$/.test(f)).sort();
const CODIGOS = ARCHIVOS_PLAN.map((f) => f.replace('_Argentina_ES.md', ''));
const ES_PLAN = new Set(CODIGOS);

/**
 * Códigos que el corpus nombra y que no son documento. No son error por sí solos:
 * varios se discuten a propósito («PLANJUB, que nunca existió»). Se informan como
 * «revisar» y acá se anota lo que el propio corpus dice de cada uno.
 */
const FANTASMAS_CONOCIDOS = {
  PLANJUB: 'nunca existió como documento; su materia la sucede PLANARCO (PLANARCO, «La sucesión»)',
  PLANCYT: 'sigla reservada y nunca escrita; la primitiva la tomó PLANPREGUNTA',
  PLANCOG: 'absorbido por PLANDIG 2.0 sin documento propio',
  PLANSALUD: 'no existe; el PLAN de salud es PLANSAL',
  PLANTRA: 'no existe en el registro; la movilidad es PLANMOV',
  PLANVEJ: 'no existe en el registro; la vejez es materia de PLANARCO',
  PLANED: 'no existe; el PLAN de educación es PLANEDU',
};
/** Palabras que empiezan con PLAN en mayúscula y no pretenden ser código. */
const NO_ES_CODIGO = new Set(['PLANES', 'PLANXXX', 'PLANIFICAR', 'PLANIFICACIÓN', 'PLANIFICACION', 'PLANETA', 'PLANETARIO', 'PLANTA', 'PLANTAS', 'PLANO', 'PLANOS', 'PLANILLA', 'PLANTEL', 'PLANTEO', 'PLANNCN']);

const RE_CODIGO = /(?<![\p{L}\p{N}_])PLAN(?:24CN|[A-ZÁÉÍÓÚÑ]{2,})(?![\p{Ll}\p{Lu}])/gu;
const RE_ID_SECCION = String.raw`(\d{1,3}(?:\.\d{1,2}){0,2})(?![\d])`;

function idDeTitulo(titulo) {
  const t = titulo.replace(/[*`_]/g, '').trim();
  let m;
  if ((m = /^SECCI[ÓO]N\s+(\d+[A-Z]?)\b/i.exec(t))) return m[1];
  if ((m = /^(CAPA|PARTE|CAP[ÍI]TULO)\s+([\dIVX]+)\b/i.exec(t))) return `${m[1].toUpperCase()} ${m[2]}`;
  if ((m = /^(?:ANEXO|AP[ÉE]NDICE)\s+([A-Z0-9]+)\b/i.exec(t))) return `Anexo ${m[1].toUpperCase()}`;
  if ((m = /^(\d{1,2}(?:\.\d{1,2}){0,2})[.:)]?\s/.exec(t))) return m[1];
  return null;
}

function limpiarTitulo(titulo) {
  return titulo
    .replace(/[*`]/g, '')
    .replace(/^SECCI[ÓO]N\s+\d+[A-Z]?\s*[:—–-]\s*/i, '')
    .replace(/^\d{1,2}(?:\.\d{1,2}){0,2}[.:)]?\s+/, '')
    .trim();
}

/** Mayúsculas sostenidas → tipo oración, sin tocar siglas ni códigos. */
function suavizar(t) {
  const letras = t.replace(/[^\p{L}]/gu, '');
  if (letras.length < 8 || letras !== letras.toUpperCase()) return t;
  return t
    .split(/(\s+|—|–)/)
    .map((w, i) => {
      if (!/\p{L}/u.test(w)) return w;
      if (ES_PLAN.has(w.replace(/[^\p{L}\p{N}]/gu, '')) || /^¡?BASTA!?$/.test(w)) return w;
      if (/^[A-ZÁÉÍÓÚÑ]{2,5}$/.test(w) && SIGLAS_VISTAS.has(w)) return w;
      const min = w.toLowerCase();
      return i === 0 ? min.charAt(0).toUpperCase() + min.slice(1) : min;
    })
    .join('')
    .replace(/(^|[.:—–]\s+)(\p{Ll})/gu, (_, a, b) => a + b.toUpperCase());
}
const SIGLAS_VISTAS = new Set();

function parsearDocumento(archivo, code) {
  const texto = leer(join(TALLER, archivo));
  const lineas = texto.split('\n');
  const titulos = [];
  let enCerca = false;
  lineas.forEach((l, i) => {
    if (/^\s*```/.test(l)) enCerca = !enCerca;
    if (enCerca) return;
    const m = /^(#{1,4})\s+(.+?)\s*#*\s*$/.exec(l);
    if (m) titulos.push({ nivel: m[1].length, crudo: m[2], linea: i + 1, id: idDeTitulo(m[2]) });
  });

  // La cabecera de auditoría: las líneas `>` que anteceden a todo título.
  const primerTitulo = titulos[0]?.linea ?? lineas.length + 1;
  const cabecera = lineas.slice(0, primerTitulo - 1).some((l) => l.startsWith('>')) ? primerTitulo - 1 : 0;

  // Bloques: los títulos de nivel 1 y 2 parten el documento; todo lo demás cuelga.
  const bloques = [];
  if (primerTitulo > 1) bloques.push({ id: null, titulo: 'Cabecera de auditoría', nivel: 0, linea: 1, cabecera: true, sub: [] });
  for (const t of titulos) {
    if (t.nivel <= 2) bloques.push({ id: t.id, titulo: limpiarTitulo(t.crudo), crudo: t.crudo, nivel: t.nivel, linea: t.linea, sub: [] });
    else if (bloques.length && t.nivel === 3) bloques.at(-1).sub.push({ id: t.id, titulo: limpiarTitulo(t.crudo), linea: t.linea });
  }
  bloques.forEach((b, i) => {
    b.fin = (bloques[i + 1]?.linea ?? lineas.length + 1) - 1;
    b.palabras = contarPalabras(lineas.slice(b.linea - 1, b.fin).join(' '));
  });

  const ids = new Map();
  const duplicados = [];
  for (const t of titulos) {
    if (!t.id) continue;
    // «### 1. Algo» es un ítem de lista con forma de título, no una sección: los
    // apéndices post-auditoría numeran así y repetían «§1…§8» en 22 documentos.
    if (/^\d+$/.test(t.id) && t.nivel >= 3 && !/^SECCI[ÓO]N/i.test(t.crudo.replace(/[*`_]/g, ''))) continue;
    if (ids.has(t.id)) duplicados.push({ id: t.id, linea: t.linea, antes: ids.get(t.id) });
    else ids.set(t.id, t.linea);
  }

  const bloqueDe = (linea) => {
    let lo = 0;
    let hi = bloques.length - 1;
    let r = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (bloques[mid].linea <= linea) { r = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return r;
  };

  /** Resuelve «§3.2» contra los títulos reales. Devuelve línea, o 0 si no existe. */
  const resolverSeccion = (id) => {
    if (ids.has(id)) return { linea: ids.get(id), exacta: true };
    // «§5» en un documento que numera «5.1, 5.2» bajo «CAPA 5»: existe, sin título propio.
    for (const [k, v] of ids) if (k.startsWith(`${id}.`) || k === `CAPA ${id}` || k === `PARTE ${id}`) return { linea: v, exacta: false };
    // «§3.2.1» cuando solo hay título hasta «3.2».
    const padre = id.split('.').slice(0, -1).join('.');
    if (padre && ids.has(padre)) return { linea: ids.get(padre), exacta: false };
    return null;
  };

  const h1 = titulos.find((t) => t.nivel === 1 && /—|PLAN/.test(t.crudo)) ?? titulos.find((t) => /Plan Nacional|Protocolo Nacional/.test(t.crudo));
  return { code, archivo, texto, lineas, titulos, bloques, ids, duplicados, cabecera, bloqueDe, resolverSeccion, tituloDoc: h1?.crudo.replace(/[*`]/g, '') ?? code, palabras: contarPalabras(texto) };
}

const DOCS = Object.fromEntries(ARCHIVOS_PLAN.map((f, i) => [CODIGOS[i], parsearDocumento(f, CODIGOS[i])]));

const TRANSVERSALES = readdirSync(TALLER)
  .filter((f) => f.endsWith('.md') && !ARCHIVOS_PLAN.includes(f))
  .sort()
  .map((archivo) => {
    const texto = leer(join(TALLER, archivo));
    const lineas = texto.split('\n');
    const titulo = (lineas.find((l) => /^#\s+/.test(l)) ?? archivo).replace(/^#\s+/, '').replace(/[*`]/g, '');
    const estado = /\*\*STATUS:\*\*\s*([a-záéíóú-]+)/i.exec(texto.slice(0, 1500))?.[1]?.toLowerCase() ?? null;
    return { archivo, texto, lineas, titulo, estado, palabras: contarPalabras(texto) };
  });

// ════════════════════════════════════════════════════════════════════════════
// 2. LAS REMISIONES: quién nombra a quién, por nombre, por sección y por línea
// ════════════════════════════════════════════════════════════════════════════

function recorte(linea, pos, ancho = 120) {
  const a = Math.max(0, pos - ancho);
  const b = Math.min(linea.length, pos + ancho);
  let s = linea.slice(a, b).replace(/\s+/g, ' ');
  if (a > 0) s = `…${s.replace(/^\S*\s/, '')}`;
  if (b < linea.length) s = `${s.replace(/\s\S*$/, '')}…`;
  return s.trim();
}

const RE_TRAS_CODIGO_LINEA = /^(?:_Argentina_ES\.md)?:(\d{1,5})(?:[-–](\d{1,5}))?/;
const RE_TRAS_CODIGO_SECCION = new RegExp(String.raw`^[\`*]*[\s,(—–-]{0,4}(?:ver\s+|véase\s+|en\s+(?:su|la)\s+)?(?:§\s?|Secci[oó]n(?:es)?\s+|SECCI[ÓO]N\s+|S(?=\d))` + RE_ID_SECCION);
const RE_MAS_SECCIONES = new RegExp(String.raw`^(?:\s?(?:,|y|e)\s?(?:§\s?)?)` + RE_ID_SECCION + String.raw`(?![\d%])`);
const RE_ANTES_DE_CODIGO = new RegExp(String.raw`(?:§\s?|Secci[oó]n\s+|SECCI[ÓO]N\s+)` + RE_ID_SECCION + String.raw`\s+(?:de|del|en)\s+(?:el\s+|la\s+)?[\`*]*$`);
const RE_LINEA_SUELTA = /`:(\d{1,5})(?:[-–](\d{1,5}))?`|(?<=[\s(,;])`?:(\d{2,5})(?:[-–](\d{1,5}))?`?(?=[\s),.;]|$)/g;
const RE_SECCION_SUELTA = new RegExp(String.raw`(?:§\s?|Secci[oó]n\s+|SECCI[ÓO]N\s+)` + RE_ID_SECCION + String.raw`(?!\d)`, 'g');
const RE_SECCION_AJENA = /^\s*(?:,\s*)?(?:de|del)\s+(?:la\s+|el\s+|los\s+)?(?:Ley|Código|Constituci|CN\b|Decreto|Reglamento|Estatuto|Tratado|Convenio|Acuerdo|documento|informe|Informe|Anexo|PLAYBOOK|READINESS|KILL|PRESUPUESTO)/;

/**
 * Remisiones: una por (documento que cita, línea, PLAN citado).
 *   n         veces que lo nombra en esa línea
 *   secs      secciones citadas  [{id, ok, linea}]
 *   lins      líneas citadas     [{de, a, ok}]
 */
const REMISIONES = [];
const INTERNAS_ROTAS = [];
const FANTASMAS = [];
const CONTEOS_VIEJOS = [];

const NUMEROS_EN_LETRAS = { dieciséis: 16, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiún: 21, veintiun: 21, veintiuno: 21, veintidós: 22, veintidos: 22, veintitrés: 23, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiséis: 26, veintiseis: 26 };
const RE_CONTEO = /\b(1[6-9]|2[0-6]|dieciséis|dieciseis|diecisiete|dieciocho|diecinueve|veinte|veintiún|veintiun|veintiuno|veintidós|veintidos|veintitrés|veintitres|veinticuatro|veinticinco|veintiséis|veintiseis)\s+(?:\*\*)?(PLANes|PLANs|PLANES|planes nacionales|mandatos|Mandatos|MANDATOS|iniciativas estratégicas|Iniciativas Estratégicas)\b/gi;

function barrer(origen, esPlan) {
  const { lineas } = origen;
  const propio = esPlan ? origen.code : null;
  lineas.forEach((linea, i) => {
    const nLinea = i + 1;
    if (!linea.includes('PLAN') && !linea.includes('§') && !/Secci[oó]n|SECCIÓN/.test(linea)) return;
    const esTitulo = /^#{1,4}\s/.test(linea);
    const porDestino = new Map();
    const consumido = [];
    let ultimoCitado = null;

    const anotar = (dst, pos) => {
      if (!porDestino.has(dst)) porDestino.set(dst, { n: 0, pos, secs: [], lins: [] });
      return porDestino.get(dst);
    };
    const citarLinea = (dst, de, a, pos) => {
      const doc = DOCS[dst];
      const hasta = a ?? de;
      const ok = de >= 1 && hasta <= doc.lineas.length && hasta >= de && doc.lineas[de - 1].trim() !== '';
      anotar(dst, pos).lins.push({ de, a: a ?? null, ok });
    };

    RE_CODIGO.lastIndex = 0;
    let m;
    const menciones = [];
    while ((m = RE_CODIGO.exec(linea))) menciones.push({ code: m[0], pos: m.index, fin: m.index + m[0].length });

    for (const men of menciones) {
      if (!ES_PLAN.has(men.code)) {
        if (!NO_ES_CODIGO.has(men.code) && men.code.length <= 13) {
          FANTASMAS.push({ en: origen.code ?? origen.archivo, esPlan, linea: nLinea, codigo: men.code, texto: recorte(linea, men.pos, 100) });
        }
        continue;
      }
      const r = anotar(men.code, men.pos);
      r.n++;
      const resto = linea.slice(men.fin, men.fin + 60);
      let x;
      if ((x = RE_TRAS_CODIGO_LINEA.exec(resto))) {
        citarLinea(men.code, +x[1], x[2] ? +x[2] : null, men.pos);
        ultimoCitado = men.code;
        consumido.push([men.fin, men.fin + x[0].length]);
      } else if ((x = RE_TRAS_CODIGO_SECCION.exec(resto))) {
        let cursor = men.fin + x[0].length;
        const idsCitados = [x[1]];
        let y;
        while ((y = RE_MAS_SECCIONES.exec(linea.slice(cursor, cursor + 14)))) { idsCitados.push(y[1]); cursor += y[0].length; }
        for (const id of idsCitados) {
          const res = DOCS[men.code].resolverSeccion(id);
          r.secs.push({ id, ok: !!res, linea: res?.linea ?? 0, exacta: res?.exacta ?? false });
        }
        consumido.push([men.fin, cursor]);
        ultimoCitado = men.code;
      } else {
        const antes = linea.slice(Math.max(0, men.pos - 48), men.pos);
        if ((x = RE_ANTES_DE_CODIGO.exec(antes))) {
          const res = DOCS[men.code].resolverSeccion(x[1]);
          r.secs.push({ id: x[1], ok: !!res, linea: res?.linea ?? 0, exacta: res?.exacta ?? false });
          consumido.push([men.pos - x[0].length, men.pos]);
        }
      }
    }

    // «`PLANVIV:1566` … y el TOTAL de `:1567`»: la línea suelta hereda el documento recién citado.
    if (ultimoCitado && linea.includes(':')) {
      RE_LINEA_SUELTA.lastIndex = 0;
      let s;
      while ((s = RE_LINEA_SUELTA.exec(linea))) {
        if (!s[1]) continue; // solo la forma entre backticks: la otra confunde horas y proporciones
        const antes = linea.slice(0, s.index);
        let dst = null;
        let lejos = -1;
        for (const men of menciones) if (ES_PLAN.has(men.code) && men.pos < s.index && men.pos > lejos && RE_TRAS_CODIGO_LINEA.test(linea.slice(men.fin, men.fin + 30))) { dst = men.code; lejos = men.pos; }
        if (dst && !/[A-Za-z_.]$/.test(antes.replace(/`$/, ''))) citarLinea(dst, +s[1], s[2] ? +s[2] : null, s.index);
      }
    }

    for (const [dst, r] of porDestino) {
      if (dst === propio && !r.secs.length && !r.lins.length) continue; // nombrarse a sí mismo no es remisión
      REMISIONES.push({ src: origen.code ?? origen.archivo, esPlan, linea: nLinea, dst, n: r.n, secs: r.secs, lins: r.lins, texto: recorte(linea, r.pos), bloque: esPlan ? origen.bloqueDe(nLinea) : -1 });
    }

    // Remisiones internas: «ver Sección 12» sin PLAN a la vista. Solo se juzgan
    // cuando la línea no nombra a ningún otro documento: ahí «§3» es de acá sin duda.
    if (esPlan && !esTitulo && nLinea > origen.cabecera) {
      const ajenos = menciones.some((x) => x.code !== propio);
      if (!ajenos && !/\.md|\.yml|Ley\s+\d|Código|Constituci/.test(linea)) {
        RE_SECCION_SUELTA.lastIndex = 0;
        let s;
        while ((s = RE_SECCION_SUELTA.exec(linea))) {
          if (consumido.some(([a, b]) => s.index >= a - 2 && s.index < b)) continue;
          if (RE_SECCION_AJENA.test(linea.slice(s.index + s[0].length, s.index + s[0].length + 40))) continue;
          if (!origen.resolverSeccion(s[1])) INTERNAS_ROTAS.push({ en: propio, linea: nLinea, id: s[1], texto: recorte(linea, s.index, 100) });
        }
      }
    }

    // Conteos del canon que quedaron viejos. El canon son 27 temáticos + PLANRUTA.
    if (linea.length < 4000 || /PLAN|andato/.test(linea)) {
      RE_CONTEO.lastIndex = 0;
      let c;
      while ((c = RE_CONTEO.exec(linea))) {
        const n = NUMEROS_EN_LETRAS[c[1].toLowerCase()] ?? +c[1];
        const cerca = linea.slice(Math.max(0, c.index - 90), c.index + 140);
        const fechado = /al \d+ de \w+ de 20\d\d|originales|en ese momento|entonces|histór|HISTÓR|versión anterior|v1\.0|los otros|restantes|demás|de los 27|nuevos|antes de|anteriores|previos|primeros/i.test(cerca);
        CONTEOS_VIEJOS.push({ en: origen.code ?? origen.archivo, esPlan, linea: nLinea, n, que: c[2], fechado, cabecera: esPlan && nLinea <= origen.cabecera, texto: recorte(linea, c.index, 110) });
      }
    }
  });
}

for (const c of CODIGOS) barrer(DOCS[c], true);
for (const t of TRANSVERSALES) barrer(t, false);

// ════════════════════════════════════════════════════════════════════════════
// 3. LAS CUATRO DECLARACIONES DE DEPENDENCIAS
// ════════════════════════════════════════════════════════════════════════════

const codigosEn = (s) => [...new Set((s.match(RE_CODIGO) ?? []).filter((c) => ES_PLAN.has(c)))];

/** PLAN_REGISTRY.yml — bloques `- code: X`, sin parser de YAML: el archivo es plano. */
function leerRegistro() {
  const p = join(TALLER, 'PLAN_REGISTRY.yml');
  if (!existsSync(p)) return {};
  const out = {};
  const bloques = leer(p).split(/\n\s*- code:\s*/).slice(1);
  for (const b of bloques) {
    const code = b.split('\n')[0].trim();
    if (!ES_PLAN.has(code)) continue;
    const campo = (k) => new RegExp(String.raw`^\s+${k}:\s*(.+)$`, 'm').exec(b)?.[1]?.replace(/^["']|["']$/g, '').trim() ?? null;
    const deps = /^\s+dependencies:\s*\[(.*)\]/m.exec(b)?.[1] ?? '';
    out[code] = {
      titulo: campo('title'), fase: campo('phase'), mision: campo('mission_matrix'), tamano: campo('budget_class'),
      estado: campo('status'), ordinal: campo('ordinal') ? +campo('ordinal') : null, version: campo('version'),
      actualizado: campo('last_updated'), necesita: codigosEn(deps),
    };
  }
  return out;
}

/** DEPENDENCY_GRAPH.yml — `  PLANX:` y debajo depends_on / provides_to. */
function leerGrafoYml() {
  const p = join(TALLER, 'DEPENDENCY_GRAPH.yml');
  if (!existsSync(p)) return {};
  const out = {};
  const bloques = leer(p).split(/\n {2}(?=PLAN[A-Z0-9]+:\s*\n)/).slice(1);
  for (const b of bloques) {
    const code = b.split(':')[0].trim();
    if (!ES_PLAN.has(code)) continue;
    const lista = (k) => new RegExp(String.raw`^\s+${k}:\s*\[(.*)\]`, 'm').exec(b)?.[1] ?? '';
    const dep = lista('depends_on');
    const prov = lista('provides_to');
    out[code] = { necesita: codigosEn(dep), aporta: codigosEn(prov), aportaATodos: /\btodos?\b/.test(prov), fuerza: /integration_strength:\s*(\S+)/.exec(b)?.[1] ?? null };
  }
  return out;
}

/** shared/arquitecto-data.ts — se lee como texto: una arista por línea, y los nodos por bloque. */
function leerArquitecto() {
  const p = join(REPO, 'SocialJusticeHub/shared/arquitecto-data.ts');
  if (!existsSync(p)) return { aristas: [], nodos: {} };
  const t = leer(p);
  const aristas = [];
  const re = /\{\s*id:\s*'(d\d+)',(?:\s*kind:\s*'(\w+)',)?\s*source:\s*'(\w+)',\s*target:\s*'(\w+)',\s*nature:\s*'(\w+)',\s*type:\s*'(\w+)',\s*description:\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(t))) aristas.push({ id: m[1], clase: m[2] ?? 'requires', src: m[3], dst: m[4], peso: m[5], tipo: m[6], que: m[7].replace(/\\'/g, "'") });
  const nodos = {};
  const reN = /id:\s*'(PLAN\w+)',\s*name:\s*'([^']+)',\s*ordinal:\s*(\d+),([\s\S]*?)\n {2}\},/g;
  while ((m = reN.exec(t))) {
    const cuerpo = m[4];
    const c = (k) => new RegExp(String.raw`${k}:\s*'([^']*)'`).exec(cuerpo)?.[1] ?? null;
    const num = (k) => { const x = new RegExp(String.raw`${k}:\s*(-?[\d.]+)`).exec(cuerpo); return x ? +x[1] : null; };
    nodos[m[1]] = { nombre: m[2], ordinal: +m[3], categoria: c('category'), agencia: c('agency'), agenciaNombre: c('agencyFull'), organo: c('organMetaphor'), presupuestoMin: num('budgetLow'), presupuestoMax: num('budgetHigh'), anios: num('timelineYears'), piso: c('constitutionalFloor'), fuente: c('mainSource'), mision: c('missionSlug'), color: c('color') };
  }
  return { aristas, nodos };
}

/** Las tablas «Lo que X aporta / necesita» dentro de cada documento. */
function leerTablas(doc) {
  const ini = doc.bloques.find((b) => /^INTEGRACI[ÓO]N CON EL MARCO/i.test(b.titulo));
  if (!ini) return { forma: 'ausente', aporta: [], necesita: [], linea: 0 };
  const out = { forma: 'prosa', aporta: [], necesita: [], linea: ini.linea, fin: ini.fin };
  let modo = null;
  for (let i = ini.linea; i < ini.fin; i++) {
    const l = doc.lineas[i];
    const h = /^###\s+(.*)$/.exec(l);
    if (h) {
      modo = /aporta/i.test(h[1]) ? 'aporta' : /necesita|recibe/i.test(h[1]) ? 'necesita' : null;
      continue;
    }
    if (!modo || !l.startsWith('|') || /^\|\s*[-:]+/.test(l) || /^\|\s*Plan\b|^\|\s*PLAN\s*\|/i.test(l)) continue;
    const celdas = l.split('|').slice(1, -1).map((c) => c.trim());
    const cods = codigosEn(celdas[0] ?? '');
    if (!cods.length) continue;
    out.forma = 'tabla';
    const tieneTipos = celdas.length >= 4;
    for (const c of cods) {
      if (c === doc.code) continue;
      out[modo].push({ plan: c, peso: tieneTipos ? celdas[1] : null, tipo: tieneTipos ? celdas[2] : null, que: celdas.at(-1).replace(/[*`]/g, ''), linea: i + 1 });
    }
  }
  return out;
}

const REGISTRO = leerRegistro();
const GRAFO_YML = leerGrafoYml();
const ARQ = leerArquitecto();
const TABLAS = Object.fromEntries(CODIGOS.map((c) => [c, leerTablas(DOCS[c])]));

/**
 * Las aristas, todas en una sola dirección: «A necesita a B».
 * Cada arista recuerda en qué capas está declarada y cuánto la sostiene el texto.
 */
const ARISTAS = new Map();
const arista = (a, b) => {
  const k = `${a}>${b}`;
  if (!ARISTAS.has(k)) ARISTAS.set(k, { a, b, capas: {}, txtAB: 0, txtBA: 0, que: null, peso: null, tipo: null });
  return ARISTAS.get(k);
};
for (const [a, r] of Object.entries(REGISTRO)) for (const b of r.necesita) if (a !== b) arista(a, b).capas.registro = 1;
for (const [a, g] of Object.entries(GRAFO_YML)) {
  for (const b of g.necesita) if (a !== b) arista(a, b).capas.ymlNecesita = 1;
  for (const b of g.aporta) if (a !== b) arista(b, a).capas.ymlAporta = 1;
}
for (const e of ARQ.aristas) {
  if (!ES_PLAN.has(e.src) || !ES_PLAN.has(e.dst) || e.src === e.dst) continue;
  const x = e.clase === 'provides' ? arista(e.dst, e.src) : arista(e.src, e.dst);
  x.capas[e.clase === 'provides' ? 'arqAporta' : 'arqNecesita'] = e.id;
  if (e.clase !== 'provides' || !x.que) { x.que = e.que; x.peso = e.peso; x.tipo = e.tipo; }
}
for (const [a, t] of Object.entries(TABLAS)) {
  for (const f of t.necesita) { const x = arista(a, f.plan); x.capas.docNecesita = f.linea; x.que ??= f.que; x.peso ??= f.peso; x.tipo ??= f.tipo; }
  for (const f of t.aporta) { const x = arista(f.plan, a); x.capas.docAporta = f.linea; x.que ??= f.que; x.peso ??= f.peso; x.tipo ??= f.tipo; }
}
const TXT = new Map(); // «A>B» → veces que el texto de A nombra a B
for (const r of REMISIONES) if (r.esPlan && r.src !== r.dst) TXT.set(`${r.src}>${r.dst}`, (TXT.get(`${r.src}>${r.dst}`) ?? 0) + r.n);
for (const x of ARISTAS.values()) { x.txtAB = TXT.get(`${x.a}>${x.b}`) ?? 0; x.txtBA = TXT.get(`${x.b}>${x.a}`) ?? 0; }

// ════════════════════════════════════════════════════════════════════════════
// 4. LA CAPA LEÍDA: fichas y conceptos con dueño
// ════════════════════════════════════════════════════════════════════════════

const FICHAS = {};
for (const c of CODIGOS) {
  const p = join(AQUI, 'fichas', `${c}.json`);
  if (!existsSync(p)) continue;
  try { FICHAS[c] = JSON.parse(leer(p)); } catch { /* una ficha rota no frena el atlas: validar-ficha.mjs la denuncia */ }
}

const escaparRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const reAlias = (a) => new RegExp(String.raw`(?<![\p{L}\p{N}_])${escaparRe(a)}(?![\p{L}\p{N}_])`, 'u');

/** Dónde aparece un alias, documento por documento. */
function buscarAlias(aliases) {
  const usos = {};
  const res = aliases.map((a) => [a, reAlias(a)]);
  const mirar = (clave, doc) => {
    const vivos = res.filter(([a]) => doc.texto.includes(a));
    if (!vivos.length) return;
    const ls = [];
    // La cabecera de auditoría repite las mismas siglas en los 28 documentos: no es uso.
    doc.lineas.forEach((l, i) => { if (i >= (doc.cabecera ?? 0) && vivos.some(([a, re]) => l.includes(a) && re.test(l))) ls.push(i + 1); });
    if (ls.length) usos[clave] = ls;
  };
  for (const c of CODIGOS) mirar(c, DOCS[c]);
  for (const t of TRANSVERSALES) mirar(t.archivo, t);
  return usos;
}

const CONCEPTOS = [];
for (const [code, f] of Object.entries(FICHAS)) {
  for (const c of f.conceptos ?? []) {
    const alias = [...new Set((c.alias ?? []).filter((a) => typeof a === 'string' && a.trim().length >= 3))];
    if (!alias.length) continue;
    // Un nombre de archivo del taller (PLAN_REGISTRY.yml, SOURCE_OF_FUNDS_LEDGER) no es un concepto.
    if (alias.some((x) => /_|\.ya?ml$|\.md$/.test(x))) continue;
    for (const a of alias) if (/^[A-ZÁÉÍÓÚÑ0-9]{2,6}$/.test(a)) SIGLAS_VISTAS.add(a);
    const usos = buscarAlias(alias);
    const propios = usos[code]?.length ?? 0;
    const afuera = Object.entries(usos).filter(([k]) => k !== code);
    CONCEPTOS.push({
      id: `${code}/${alias[0]}`, dueno: code, nombre: c.nombre, alias, tipo: c.tipo, que: c.que_es, seccion: c.seccion ?? null, linea: c.linea,
      usos, propios, planesAjenos: afuera.filter(([k]) => ES_PLAN.has(k)).length, totalAfuera: afuera.reduce((s, [, v]) => s + v.length, 0),
    });
  }
}
// Un alias con dos dueños es la desarmonía más cara: dos documentos creen definir lo mismo.
const DUENOS_POR_ALIAS = new Map();
for (const c of CONCEPTOS) for (const a of c.alias) { if (!DUENOS_POR_ALIAS.has(a)) DUENOS_POR_ALIAS.set(a, []); DUENOS_POR_ALIAS.get(a).push(c); }
const DISPUTADOS = [...DUENOS_POR_ALIAS].filter(([, cs]) => new Set(cs.map((c) => c.dueno)).size > 1);

// Lo que un PLAN dice tomar de otro, contra lo que ese otro dice tener.
const PRESTAMOS = [];
for (const [code, f] of Object.entries(FICHAS)) {
  for (const u of f.usa ?? []) {
    if (!ES_PLAN.has(u.origen)) continue;
    const alias = (u.alias ?? []).filter((a) => typeof a === 'string');
    const reconocido = CONCEPTOS.find((c) => c.dueno === u.origen && c.alias.some((a) => alias.includes(a)));
    const otroDueno = reconocido ? null : CONCEPTOS.find((c) => c.dueno !== code && c.alias.some((a) => alias.includes(a)));
    const enOrigen = alias.some((a) => DOCS[u.origen].texto.includes(a));
    PRESTAMOS.push({ quien: code, origen: u.origen, nombre: u.nombre, alias, para: u.para_que, linea: u.linea, concepto: reconocido?.id ?? null, otroDueno: otroDueno?.dueno ?? null, enOrigen });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 5. LAS ANCLAS: qué decía cada línea citada la última vez que se miró
// ════════════════════════════════════════════════════════════════════════════

const RUTA_ANCLAS = join(AQUI, 'anclas.lock.json');
const anclasViejas = existsSync(RUTA_ANCLAS) ? JSON.parse(leer(RUTA_ANCLAS)) : null;
const anclasNuevas = {};
const ANCLAS_CORRIDAS = [];
const citasPorAncla = new Map();
for (const r of REMISIONES) for (const l of r.lins) {
  const k = `${r.dst}:${l.de}`;
  if (!citasPorAncla.has(k)) citasPorAncla.set(k, []);
  citasPorAncla.get(k).push({ src: r.src, linea: r.linea });
}
const huella = (s) => norm(s).slice(0, 180);
for (const [k, citas] of citasPorAncla) {
  const [dst, n] = k.split(':');
  const doc = DOCS[dst];
  const ahora = doc.lineas[+n - 1] !== undefined ? huella(doc.lineas[+n - 1]) : '';
  const antes = anclasViejas?.[k];
  if (antes === undefined || antes === ahora) { anclasNuevas[k] = ahora; continue; }
  // La línea ya no dice lo que decía: se busca adónde se fue ese texto.
  const cabeza = antes.slice(0, 70);
  const nueva = cabeza.length >= 20 ? doc.lineas.findIndex((l) => huella(l).startsWith(cabeza)) : -1;
  ANCLAS_CORRIDAS.push({ ancla: k, dst, linea: +n, decia: antes.slice(0, 140), dice: ahora.slice(0, 140), ahoraEn: nueva === -1 ? 0 : nueva + 1, citas });
  anclasNuevas[k] = process.argv.includes('--fijar') ? ahora : antes;
}

// ════════════════════════════════════════════════════════════════════════════
// 6. LAS DESARMONÍAS
// ════════════════════════════════════════════════════════════════════════════

/** grav: 'rota' (está mal y se puede probar) · 'revisar' (probablemente) · 'nota' (para saber). */
const HALLAZGOS = [];
const hallar = (tipo, grav, plan, linea, titulo, detalle, texto = null, otro = null) => { const h = { tipo, grav, plan, linea, titulo, detalle, texto, otro }; HALLAZGOS.push(h); return h; };

for (const r of REMISIONES) {
  for (const s of r.secs) if (!s.ok) hallar('seccion-inexistente', 'rota', r.src, r.linea, `Cita ${r.dst} §${s.id} y esa sección no existe`, +s.id >= 100 ? `${r.dst} no tiene cien secciones: parece una cita por línea (\`${r.dst}:${s.id}\`) escrita con «§». La línea ${s.id} de ${r.dst} dice: «${(DOCS[r.dst].lineas[+s.id - 1] ?? '').slice(0, 110).trim()}…»` : `${r.dst} tiene estas secciones numeradas: ${[...DOCS[r.dst].ids.keys()].filter((k) => /^\d+$/.test(k)).join(', ') || '(sin numeración)'}.`, r.texto, r.dst);
  for (const l of r.lins) if (!l.ok) hallar('linea-rota', 'rota', r.src, r.linea, `Cita ${r.dst}:${l.de}${l.a ? `-${l.a}` : ''} y esa línea no existe o está vacía`, `${r.dst} tiene ${DOCS[r.dst].lineas.length} líneas.`, r.texto, r.dst);
}
for (const a of ANCLAS_CORRIDAS) {
  const donde = a.citas.map((c) => `${c.src}:${c.linea}`).join(', ');
  hallar(a.ahoraEn ? 'ancla-corrida' : 'ancla-reescrita', a.ahoraEn ? 'rota' : 'revisar', a.dst, a.linea,
    a.ahoraEn ? `${a.ancla} se corrió a la línea ${a.ahoraEn}` : `${a.ancla} ya no dice lo que decía`,
    a.ahoraEn ? `Hay que renumerar la cita en: ${donde}.` : `La citan ${donde}. Releer si la cita sigue valiendo. Decía: «${a.decia}»`, a.dice, null);
}
for (const x of INTERNAS_ROTAS) hallar('remision-interna-rota', 'revisar', x.en, x.linea, `Remite a su propia §${x.id}, que no existe`, 'Puede ser una sección renumerada o eliminada, o una remisión a otro documento escrita sin nombrarlo.', x.texto);
{
  const vistos = new Set();
  for (const f of FANTASMAS) {
    if (!f.esPlan || vistos.has(`${f.en}:${f.linea}:${f.codigo}`)) continue;
    vistos.add(`${f.en}:${f.linea}:${f.codigo}`);
    const linea = DOCS[f.en].lineas[f.linea - 1];
    const discutido = /nunca existi|NOTA DE SUCESIÓN|absorb|reservad|fantasma|no es un PLAN|y no PLAN|sigla|sucesor|sucesi[óo]n/i.test(linea);
    hallar('codigo-fantasma', discutido ? 'nota' : 'revisar', f.en, f.linea, `Nombra a ${f.codigo}, que no es un PLAN del registro`, `${FANTASMAS_CONOCIDOS[f.codigo] ?? 'No figura en PLAN_REGISTRY.yml ni tiene documento.'}${discutido ? ' Esta línea lo discute a propósito.' : ''}`, f.texto, f.codigo);
  }
}
for (const c of CONTEOS_VIEJOS) {
  if (!c.esPlan || c.fechado) continue;
  hallar('conteo-viejo', c.cabecera ? 'revisar' : 'revisar', c.en, c.linea, `Dice «${c.n} ${c.que}»`, 'El canon son 27 PLANes temáticos más PLANRUTA. Un conteo viejo vale si está fechado; sin fecha se lee como vigente.', c.texto);
}
for (const c of CODIGOS) {
  const d = DOCS[c];
  for (const dup of d.duplicados) hallar('seccion-duplicada', 'revisar', c, dup.linea, `Dos títulos llevan el número ${dup.id}`, `El otro está en la línea ${dup.antes}. Una remisión a «§${dup.id}» es ambigua.`);
  const nums = [...d.ids.keys()].filter((k) => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
  if (nums.length > 3) {
    const faltan = [];
    for (let n = nums[0]; n < nums.at(-1); n++) if (!nums.includes(n)) faltan.push(n);
    const integ = d.bloques.find((b) => /^INTEGRACI[ÓO]N CON EL MARCO/i.test(b.titulo));
    if (faltan.length) hallar('numeracion-con-huecos', 'nota', c, d.ids.get(String(nums[0])), `La numeración de secciones salta: falta${faltan.length > 1 ? 'n' : ''} ${faltan.join(', ')}`, integ && faltan.length === 1 ? `«INTEGRACIÓN CON EL MARCO ¡BASTA!» (línea ${integ.linea}) ocupa ese lugar sin número: una remisión a «§${faltan[0]}» no resuelve.` : 'Una remisión a esos números no resuelve.');
  }
  const t = TABLAS[c];
  if (t.forma === 'ausente' && c !== 'PLANRUTA') hallar('sin-integracion', 'nota', c, 1, 'No tiene sección «INTEGRACIÓN CON EL MARCO ¡BASTA!»', 'El resto del corpus declara ahí lo que aporta y lo que necesita.');
  if (t.forma === 'prosa') hallar('integracion-en-prosa', 'nota', c, t.linea, 'Declara su integración en prosa, no en las tablas del TEMPLATE_INTERCONEXIONES', 'No es un error —los PLANes nuevos lo hacen a propósito—, pero sus aristas no se pueden espejar contra las tablas ajenas.');
}
// El espejo: «todo vínculo declarado acá tiene su contraparte en el plan referenciado».
for (const a of CODIGOS) {
  const ta = TABLAS[a];
  if (ta.forma !== 'tabla') continue;
  for (const f of ta.aporta) {
    const tb = TABLAS[f.plan];
    if (tb?.forma !== 'tabla') continue;
    if (!tb.necesita.some((x) => x.plan === a)) hallar('espejo-roto', f.peso ? 'rota' : 'revisar', a, f.linea, `Dice que le aporta a ${f.plan}, y ${f.plan} no dice que lo recibe`, `Falta la fila «${a}» en «Lo que ${f.plan} necesita de otros» (${f.plan}:${tb.linea}). Lo declarado: ${f.que}`, null, f.plan);
  }
  for (const f of ta.necesita) {
    const tb = TABLAS[f.plan];
    if (tb?.forma !== 'tabla') continue;
    if (!tb.aporta.some((x) => x.plan === a)) hallar('espejo-roto', f.peso ? 'rota' : 'revisar', a, f.linea, `Dice que necesita a ${f.plan}, y ${f.plan} no dice que le aporta`, `Falta la fila «${a}» en «Lo que ${f.plan} aporta al ecosistema» (${f.plan}:${tb.linea}). Lo declarado: ${f.que}`, null, f.plan);
  }
  // La misma fila en las dos tablas con el mismo texto: el vínculo quedó copiado sin orientar.
  for (const f of ta.aporta) {
    const g = ta.necesita.find((x) => x.plan === f.plan && norm(x.que) === norm(f.que));
    if (g) hallar('fila-sin-orientar', 'revisar', a, f.linea, `La fila de ${f.plan} dice lo mismo en «aporta» y en «necesita»`, `El mismo texto está en las líneas ${f.linea} y ${g.linea}: una de las dos direcciones está copiada. Texto: ${f.que}`, null, f.plan);
  }
}
// Capas que no se conocen entre sí.
for (const c of CODIGOS) {
  if (!REGISTRO[c]) hallar('fuera-de-capa', 'rota', c, 0, 'No está en PLAN_REGISTRY.yml', 'El registro se declara «fuente única de verdad» del conteo.');
  if (!GRAFO_YML[c]) hallar('fuera-de-capa', 'rota', c, 0, 'No está en DEPENDENCY_GRAPH.yml', 'El grafo estructurado dice tener autoridad sobre la prosa; un PLAN que no figura ahí no tiene dependencias declaradas en esa capa.');
  if (!ARQ.nodos[c] && c !== 'PLANRUTA') hallar('fuera-de-capa', 'rota', c, 0, 'No es nodo en shared/arquitecto-data.ts', 'La app dibuja su grafo desde ese archivo.');
}
const DOBLES = {};
// Cada arista se lee «A recibe de B». La declara A cuando dice que lo necesita, o B
// cuando dice que se lo aporta: son dos afirmaciones distintas y se juzgan aparte.
for (const x of ARISTAS.values()) {
  const k = x.capas;
  const pideA = !!(k.registro || k.ymlNecesita || k.arqNecesita);
  const ofreceB = !!(k.ymlAporta || k.arqAporta || k.docAporta);
  const enArq = !!(k.arqNecesita || k.arqAporta);
  const enDoc = !!(k.docNecesita || k.docAporta);
  if (pideA && x.txtAB === 0) hallar('necesita-sin-nombrar', 'revisar', x.a, 0, `Se declara que ${x.a} necesita a ${x.b}, y el texto de ${x.a} no nombra a ${x.b} ni una vez`, `Declarada en: ${nombresCapas(k)}.${x.txtBA ? ` ${x.b} sí nombra a ${x.a} (${x.txtBA} veces).` : ''}`, null, x.b);
  else if (ofreceB && !pideA && !k.docNecesita && x.txtAB === 0) hallar('aporte-sin-acuse', 'nota', x.a, 0, `${x.b} dice aportarle a ${x.a}, y ${x.a} no nombra a ${x.b} ni una vez`, `Declarada en: ${nombresCapas(k)}. ${x.b} nombra a ${x.a} ${x.txtBA} veces. Suele pasar con los PLANes nuevos: el documento anterior no se enteró.`, null, x.b);
  if (enDoc && !enArq && ARQ.nodos[x.a] && ARQ.nodos[x.b]) {
    const inv = ARISTAS.get(`${x.b}>${x.a}`);
    const invEnArq = inv && (inv.capas.arqNecesita || inv.capas.arqAporta);
    if (invEnArq) {
      // Se agrupa por documento: es una sola causa (la tabla lista cada vínculo en las dos columnas).
      const doc = k.docNecesita ? x.a : x.b;
      const otro = k.docNecesita ? x.b : x.a;
      (DOBLES[doc] ??= []).push({ otro, linea: k.docNecesita ?? k.docAporta });
    }
    else hallar('tabla-sin-arista', 'revisar', x.a, k.docNecesita ?? k.docAporta ?? 0, `Las tablas dicen que ${x.a} recibe de ${x.b}, y arquitecto-data.ts no tiene arista entre los dos`, `${nombresCapas(k)}. Lo que dice la fila: ${x.que ?? ''}`, null, x.b);
  }
}
for (const [doc, lista] of Object.entries(DOBLES)) {
  const otros = [...new Set(lista.map((l) => l.otro))].sort();
  hallar('vinculo-en-dos-direcciones', 'revisar', doc, Math.min(...lista.map((l) => l.linea)), `Sus tablas ponen a ${otros.length} PLAN${otros.length > 1 ? 'es' : ''} a la vez en «aporta» y en «necesita»; la app dibuja una sola dirección`, `Con: ${otros.join(', ')}. O el vínculo es recíproco y a arquitecto-data.ts le falta la arista de vuelta, o una de las dos filas se copió del espejo sin orientar. Conviene leer cada par: la fila de «aporta» tiene que decir qué entrega ${doc}, y la de «necesita» qué recibe.`);
}
function nombresCapas(k) {
  const n = [];
  if (k.registro) n.push('PLAN_REGISTRY.yml');
  if (k.ymlNecesita) n.push('DEPENDENCY_GRAPH.yml (depends_on)');
  if (k.ymlAporta) n.push('DEPENDENCY_GRAPH.yml (provides_to)');
  if (k.arqNecesita) n.push(`arquitecto-data.ts (${k.arqNecesita})`);
  if (k.arqAporta) n.push(`arquitecto-data.ts (${k.arqAporta}, espejo)`);
  if (k.docNecesita) n.push(`tabla «necesita» del documento (línea ${k.docNecesita})`);
  if (k.docAporta) n.push(`tabla «aporta» de la contraparte (línea ${k.docAporta})`);
  return n.join(' · ');
}
// Vínculos que el texto sostiene y nadie declaró.
for (const a of CODIGOS) for (const b of CODIGOS) {
  if (a >= b) continue;
  if (ARISTAS.has(`${a}>${b}`) || ARISTAS.has(`${b}>${a}`)) continue;
  const ab = TXT.get(`${a}>${b}`) ?? 0;
  const ba = TXT.get(`${b}>${a}`) ?? 0;
  if (ab + ba >= 12 && a !== 'PLANRUTA' && b !== 'PLANRUTA') hallar('texto-sin-declarar', 'nota', ab >= ba ? a : b, 0, `${a} y ${b} se nombran ${ab + ba} veces y ninguna capa declara un vínculo`, `${a} nombra a ${b} ${ab} veces; ${b} nombra a ${a} ${ba} veces.`, null, ab >= ba ? b : a);
}
const disputasVistas = new Set();
for (const [alias, cs] of DISPUTADOS) {
  const duenos = [...new Set(cs.map((c) => c.dueno))];
  const clave = cs.map((c) => c.id.split('/')[0] + c.linea).sort().join('|');
  if (disputasVistas.has(clave)) continue;
  disputasVistas.add(clave);
  hallar('concepto-con-dos-duenos', 'revisar', duenos[0], cs[0].linea, `«${alias}» figura como propio en ${duenos.join(' y ')}`, cs.map((c) => `${c.dueno}:${c.linea} — ${c.que}`).join(' ║ '), null, duenos[1]);
}
for (const p of PRESTAMOS) {
  if (!p.enOrigen) hallar('prestamo-sin-origen', 'revisar', p.quien, p.linea, `Dice tomar «${p.nombre}» de ${p.origen}, y ${p.origen} no lo nombra`, `Ninguno de estos textos aparece en ${p.origen}: ${p.alias.join(', ')}.${p.otroDueno ? ` Quien sí lo define es ${p.otroDueno}.` : ''}`, null, p.origen);
}

// Lo que vieron los lectores al fichar: no sale de un patrón, sale de leer.
const LECTURAS = [];
const LEIDO = {};
{
  const dir = join(AQUI, 'lecturas');
  for (const f of existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith('.json')).sort() : []) {
    let datos;
    try { datos = JSON.parse(leer(join(dir, f))); } catch { continue; }
    for (const d of Array.isArray(datos) ? datos : [datos]) {
      if (!ES_PLAN.has(d.code)) continue;
      LEIDO[d.code] = d.leido ?? null;
      for (const h of d.hallazgos ?? []) {
        const lineas = (h.lineas ?? []).filter((n) => Number.isInteger(n) && n >= 1 && n <= DOCS[d.code].lineas.length);
        if (!h.que || !lineas.length) continue;
        LECTURAS.push({ plan: d.code, lineas, que: h.que, textos: lineas.slice(0, 4).map((n) => norm(DOCS[d.code].lineas[n - 1]).slice(0, 260)) });
        hallar('lectura', 'revisar', d.code, lineas[0], h.que.replace(/\.$/, ''), `Líneas ${lineas.join(', ')}.`, null).leido = LECTURAS.at(-1).textos;
      }
    }
  }
}

// Los cruces: un lector comparó cómo usa cada PLAN un concepto ajeno contra la
// definición de su dueño. Solo entran los que citan literal a los dos lados.
const CRUCES = [];
{
  const dir = join(AQUI, 'lecturas');
  const esta = (code, n, cita) => ES_PLAN.has(code) && Number.isInteger(n) && n >= 1 && n <= DOCS[code].lineas.length && norm(cita ?? '').length >= 10 && norm(DOCS[code].lineas[n - 1]).includes(norm(cita));
  for (const f of existsSync(dir) ? readdirSync(dir).filter((x) => /^cruces-.*\.json$/.test(x)).sort() : []) {
    let datos;
    try { datos = JSON.parse(leer(join(dir, f))); } catch { continue; }
    for (const c of datos.cruces ?? []) {
      if (!c.que || !ES_PLAN.has(c.dueno) || !ES_PLAN.has(c.otro) || c.dueno === c.otro) continue;
      if (!esta(c.dueno, c.lineaDueno, c.citaDueno) || !esta(c.otro, c.lineaOtro, c.citaOtro)) {
        // Las citas pasaron la comprobación cuando el lector las escribió; si hoy no están en su
        // línea, el texto se editó. No se descarta: queda a la vista hasta que alguien lo cierre.
        hallar('cruce', 'revisar', c.otro, 0, `«${c.concepto}»: ${c.que.replace(/\.$/, '')}`, `Decía ${c.dueno}:${c.lineaDueno} «${norm(c.citaDueno ?? '')}» y ${c.otro}:${c.lineaOtro} «${norm(c.citaOtro ?? '')}».`, null, c.dueno).tocada = true;
        continue;
      }
      CRUCES.push(c);
      hallar('cruce', 'revisar', c.otro, c.lineaOtro, `«${c.concepto}»: ${c.que.replace(/\.$/, '')}`, `${c.dueno}:${c.lineaDueno} dice «${norm(c.citaDueno)}». ${c.otro}:${c.lineaOtro} dice «${norm(c.citaOtro)}».`, null, c.dueno);
    }
  }
}

const ORDEN_GRAV = { rota: 0, revisar: 1, nota: 2 };
HALLAZGOS.sort((x, y) => ORDEN_GRAV[x.grav] - ORDEN_GRAV[y.grav] || x.tipo.localeCompare(y.tipo) || x.plan.localeCompare(y.plan) || x.linea - y.linea);

// ════════════════════════════════════════════════════════════════════════════
// 6 bis. EL REGISTRO: qué desarmonía es cuál, en qué estado está y qué cambió
// ════════════════════════════════════════════════════════════════════════════
//
// Para llevar la cuenta de cómo se van resolviendo hace falta que una desarmonía
// conserve su nombre aunque se le corran las líneas. El id sale del tipo, el
// documento y lo que dice —nunca del número de línea—, más un ordinal si hay dos
// iguales en el mismo documento.
{
  const vistos = new Map();
  const sinTitulo = new Set(['vinculo-en-dos-direcciones', 'numeracion-con-huecos']); // su título lleva una cuenta que cambia
  for (const h of HALLAZGOS) {
    const base = `${h.tipo}|${h.plan}|${sinTitulo.has(h.tipo) ? '' : h.titulo}`;
    const n = (vistos.get(base) ?? 0) + 1;
    vistos.set(base, n);
    h.id = createHash('sha1').update(`${base}#${n}`).digest('hex').slice(0, 8);
  }
}

// Lo que un lector vio no desaparece solo cuando el texto se corrige: no hay patrón que
// lo vuelva a buscar. Se guarda lo que decían las líneas el día de la lectura; si cambian,
// el hallazgo queda «tocado» y pide que alguien confirme si quedó resuelto.
const RUTA_LEIDO = join(AQUI, 'lecturas.lock.json');
{
  const antes = existsSync(RUTA_LEIDO) ? JSON.parse(leer(RUTA_LEIDO)) : {};
  const ahora = {};
  for (const h of HALLAZGOS) {
    if (!h.leido) continue;
    const previo = antes[h.id];
    if (previo && JSON.stringify(previo) !== JSON.stringify(h.leido)) h.tocada = true;
    ahora[h.id] = previo && !process.argv.includes('--fijar') ? previo : h.leido;
    delete h.leido;
  }
  writeFileSync(RUTA_LEIDO, `${JSON.stringify(ahora, Object.keys(ahora).sort(), 1)}\n`);
}

// Los cierres a mano: «resuelta» (se corrigió y el script no puede verlo) o
// «descartada» (se miró y no era un error). Siempre con su razón.
const RUTA_RES = join(AQUI, 'resoluciones.json');
const RES = existsSync(RUTA_RES) ? JSON.parse(leer(RUTA_RES)) : {};
const HOY = new Date().toISOString().slice(0, 10);
{
  let cambio = false;
  for (const [bandera, estado] of [['--resolver', 'resuelta'], ['--descartar', 'descartada'], ['--reabrir', null]]) {
    const i = process.argv.indexOf(bandera);
    if (i === -1) continue;
    const id = process.argv[i + 1];
    const nota = process.argv[i + 2];
    const h = HALLAZGOS.find((x) => x.id === id);
    if (!h && !(estado === null && RES[id])) { console.error(`No hay ninguna desarmonía con id «${id}». Los ids están en DESARMONIAS.md y en el atlas.`); process.exit(2); }
    if (estado && (!nota || nota.startsWith('--'))) { console.error(`${bandera} necesita la razón: ${bandera} ${id} "por qué"`); process.exit(2); }
    if (estado) RES[id] = { estado, nota, fecha: HOY, tipo: h.tipo, plan: h.plan, titulo: h.titulo }; else delete RES[id];
    cambio = true;
  }
  if (cambio) writeFileSync(RUTA_RES, `${JSON.stringify(RES, null, 1)}\n`);
}
const CERRADAS = [];
for (const h of HALLAZGOS) { const r = RES[h.id]; if (r) { h.estado = r.estado; h.razon = r.nota; h.cerrada = r.fecha; CERRADAS.push(h); } }
// De acá para abajo HALLAZGOS son solo las abiertas: todas las cuentas hablan de lo que falta.
HALLAZGOS.splice(0, HALLAZGOS.length, ...HALLAZGOS.filter((h) => !h.estado));

// El historial. Cada entrada es una foto: qué documentos cambiaron desde la anterior,
// qué desarmonías dejaron de estar y cuáles aparecieron.
const RUTA_HIST = join(AQUI, 'historial.json');
const HIST = existsSync(RUTA_HIST) ? JSON.parse(leer(RUTA_HIST)) : { catalogo: {}, entradas: [] };
const fichaDoc = (c) => { const d = DOCS[c]; const v = /versi[óo]n\s+v?(\d+(?:\.\d+)*)/i.exec(d.lineas.slice(d.cabecera, d.cabecera + 120).join('\n'))?.[1] ?? /(\d+(?:\.\d+)+)/.exec(FICHAS[c]?.version ?? '')?.[1] ?? null; return { version: v, palabras: d.palabras, lineas: d.lineas.length, huella: createHash('sha1').update(d.texto).digest('hex').slice(0, 8) }; };
const ESTADO_DOCS = Object.fromEntries(CODIGOS.map((c) => [c, fichaDoc(c)]));
const cuentaGrav = (hs) => { const c = { rota: 0, revisar: 0, nota: 0 }; for (const h of hs) c[h.grav]++; return c; };
function diferencia(ultima) {
  const antes = new Set(ultima.abiertas);
  const ahora = new Set(HALLAZGOS.map((h) => h.id));
  const cerradaHoy = new Map(CERRADAS.map((h) => [h.id, h]));
  return {
    cambios: CODIGOS.filter((c) => ultima.planes[c]?.huella !== ESTADO_DOCS[c].huella).map((c) => ({ code: c, de: ultima.planes[c] ?? null, a: ESTADO_DOCS[c] })),
    resueltas: [...antes].filter((id) => !ahora.has(id)).map((id) => { const m = cerradaHoy.get(id); return { id, ...(HIST.catalogo[id] ?? {}), como: m ? (m.estado === 'descartada' ? 'descartada' : 'resuelta a mano') : 'dejó de aparecer', razon: m?.razon ?? null }; }),
    nuevas: HALLAZGOS.filter((h) => !antes.has(h.id)).map((h) => ({ id: h.id, tipo: h.tipo, plan: h.plan, titulo: h.titulo, grav: h.grav })),
  };
}
if (process.argv.includes('--registrar')) {
  const nota = process.argv[process.argv.indexOf('--registrar') + 1];
  if (!nota || nota.startsWith('--')) { console.error('--registrar necesita decir qué se hizo: --registrar "PLANPACTO: las dos citas a PLANJUS pasan a ser por línea"'); process.exit(2); }
  let base = null;
  try { base = execSync('git rev-parse --short HEAD', { cwd: REPO, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { /* fuera de git el registro igual sirve */ }
  const ultima = HIST.entradas.at(-1);
  const d = ultima ? diferencia(ultima) : { cambios: [], resueltas: [], nuevas: [] };
  for (const h of [...HALLAZGOS, ...CERRADAS]) HIST.catalogo[h.id] = { tipo: h.tipo, plan: h.plan, titulo: h.titulo, grav: h.grav };
  HIST.entradas.push({ n: HIST.entradas.length, fecha: HOY, base, nota, totales: { ...cuentaGrav(HALLAZGOS), cerradas: CERRADAS.length }, ...d, planes: ESTADO_DOCS, abiertas: HALLAZGOS.map((h) => h.id) });
  writeFileSync(RUTA_HIST, `${JSON.stringify(HIST, null, 1)}\n`);
}
const PENDIENTE = HIST.entradas.length ? diferencia(HIST.entradas.at(-1)) : null;

const TIPOS = {
  'ancla-corrida': ['Anclas corridas', 'Una cita por número de línea apunta a un texto que se movió. Se arregla renumerando la cita.'],
  'ancla-reescrita': ['Anclas reescritas', 'La línea citada cambió de texto desde la última vez que se fijaron las anclas.'],
  'linea-rota': ['Citas a líneas que no existen', 'El número está fuera del documento o cae en una línea vacía.'],
  'seccion-inexistente': ['Citas a secciones que no existen', '«PLANX §N» donde PLANX no tiene sección N.'],
  'espejo-roto': ['Espejos rotos', 'El TEMPLATE_INTERCONEXIONES pide que cada vínculo figure en los dos documentos. Acá figura en uno solo.'],
  'fuera-de-capa': ['PLANes ausentes de una declaración', 'Un PLAN que existe como documento y falta en uno de los archivos que dicen listar a todos.'],
  'fila-sin-orientar': ['Filas copiadas en las dos direcciones', 'La misma frase está en «aporta» y en «necesita»: el vínculo existe pero no se sabe hacia dónde corre.'],
  'remision-interna-rota': ['Remisiones internas que no resuelven', 'El documento remite a una sección propia que no tiene.'],
  'codigo-fantasma': ['Códigos que no son PLAN', 'Siglas con forma de PLAN que no están en el registro. Algunas se discuten a propósito.'],
  'conteo-viejo': ['Conteos del canon sin fechar', '«22 PLANes», «18 mandatos»: valen fechados; sin fecha se leen como vigentes.'],
  'seccion-duplicada': ['Números de sección repetidos', 'Dos títulos con el mismo número dentro de un documento.'],
  'necesita-sin-nombrar': ['Dependencias que el propio texto no nombra', 'Una declaración dice que A necesita a B, y A no nombra a B en todo su documento.'],
  'vinculo-en-dos-direcciones': ['Tablas de integración sin orientar', 'El documento pone a los mismos PLANes en «aporta» y en «necesita»; la app solo dibuja una dirección. Un hallazgo por documento.'],
  'tabla-sin-arista': ['Vínculos del documento que la app no dibuja', 'Las tablas de integración declaran un vínculo que arquitecto-data.ts no tiene en ninguna dirección.'],
  'aporte-sin-acuse': ['Aportes sin acuse', 'B dice aportarle a A, y A no nombra a B. Casi siempre un PLAN nuevo frente a un documento anterior.'],
  'cruce': ['Conceptos que dos PLANes cuentan distinto', 'Un lector comparó la definición del dueño con el uso en otro PLAN y encontró una diferencia. Las dos citas son literales; el juicio es de un modelo.'],
  'lectura': ['Lo que vieron los lectores', 'Contradicciones internas que encontró un lector (un modelo) al fichar cada documento. No las verificó nadie más: cada una trae las líneas para ir a mirar.'],
  'concepto-con-dos-duenos': ['Conceptos con dos dueños', 'Dos fichas reclaman como propio el mismo nombre o la misma sigla.'],
  'prestamo-sin-origen': ['Préstamos sin origen', 'Un PLAN dice tomar algo de otro, y ese otro no lo nombra.'],
  'texto-sin-declarar': ['Vínculos que el texto sostiene y nadie declaró', 'Dos PLANes se nombran mucho y ninguna capa los une.'],
  'numeracion-con-huecos': ['Numeración con huecos', 'La secuencia de secciones salta un número.'],
  'integracion-en-prosa': ['Integración en prosa', 'Declara sus vínculos sin las tablas del template.'],
  'sin-integracion': ['Sin sección de integración', ''],
};

// ════════════════════════════════════════════════════════════════════════════
// 7. --impacto: la consulta de terminal para antes de editar
// ════════════════════════════════════════════════════════════════════════════

function impacto(arg, extra) {
  const m = /^(PLAN[A-Z0-9]+)(?::(\d+))?$/.exec(arg ?? '');
  if (!m || !ES_PLAN.has(m[1])) { console.error(`No conozco «${arg}». Uso: --impacto PLANDIG | PLANDIG §8 | PLANDIG:788`); process.exit(2); }
  const code = m[1];
  const doc = DOCS[code];
  let desde = 1;
  let hasta = doc.lineas.length;
  let rotulo = code;
  if (m[2]) { desde = hasta = +m[2]; rotulo = `${code}:${m[2]}`; }
  const sec = /^§?\s*([\d.]+)$/.exec(extra ?? '')?.[1];
  if (sec) {
    const res = doc.resolverSeccion(sec);
    if (!res) { console.error(`${code} no tiene §${sec}`); process.exit(2); }
    const b = doc.bloques[doc.bloqueDe(res.linea)];
    const sub = b.sub.find((s) => s.id === sec);
    desde = res.linea;
    hasta = sub ? (b.sub[b.sub.indexOf(sub) + 1]?.linea ?? b.fin + 1) - 1 : b.fin;
    rotulo = `${code} §${sec} (líneas ${desde}–${hasta})`;
  }
  const todo = desde === 1 && hasta === doc.lineas.length;
  const dentro = (n) => n >= desde && n <= hasta;
  const entrantes = REMISIONES.filter((r) => r.dst === code && r.src !== code);
  const porLinea = entrantes.flatMap((r) => r.lins.filter((l) => dentro(l.de) || (l.a && l.de <= hasta && l.a >= desde)).map((l) => ({ r, l })));
  const porSeccion = entrantes.flatMap((r) => r.secs.filter((s) => s.ok && dentro(s.linea)).map((s) => ({ r, s })));
  const conceptos = CONCEPTOS.filter((c) => c.dueno === code && dentro(c.linea) && c.totalAfuera > 0);

  console.log(`\n  Antes de editar ${rotulo}\n  ${'─'.repeat(16 + rotulo.length)}`);
  if (todo) {
    const porSrc = {};
    for (const r of entrantes) porSrc[r.src] = (porSrc[r.src] ?? 0) + r.n;
    console.log(`\n  Lo nombran ${Object.keys(porSrc).length} documentos, ${Object.values(porSrc).reduce((a, b) => a + b, 0)} veces:`);
    console.log('  ' + Object.entries(porSrc).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k.replace('.md', '')} ${v}`).join(' · '));
  }
  console.log(`\n  Citas por número de línea que caen acá: ${porLinea.length}${porLinea.length ? '  ← si agregás o quitás líneas ANTES de estas, hay que renumerarlas' : ''}`);
  for (const { r, l } of porLinea.sort((a, b) => a.l.de - b.l.de)) console.log(`    ${code}:${l.de}${l.a ? `-${l.a}` : ''}  ←  ${r.src}:${r.linea}   «${doc.lineas[l.de - 1]?.slice(0, 70).trim() ?? ''}…»`);
  if (!todo) {
    const abajo = entrantes.flatMap((r) => r.lins.filter((l) => l.de > hasta).map(() => 1)).length;
    console.log(`\n  Citas por línea que caen DESPUÉS de este tramo: ${abajo}  ← todas se corren si cambia el largo del tramo`);
  }
  console.log(`\n  Citas por sección: ${porSeccion.length}`);
  for (const { r, s } of porSeccion) console.log(`    §${s.id}  ←  ${r.src}:${r.linea}   ${r.texto.slice(0, 90)}`);
  console.log(`\n  Conceptos definidos acá que usan otros documentos: ${conceptos.length}`);
  for (const c of conceptos.sort((a, b) => b.totalAfuera - a.totalAfuera)) {
    const quien = Object.entries(c.usos).filter(([k]) => k !== code).sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `${k.replace('.md', '')} ${v.length}`).join(' · ');
    console.log(`    ${c.nombre} [${c.alias.join(' / ')}] — línea ${c.linea}\n        ${quien}`);
  }
  const hs = HALLAZGOS.filter((h) => h.plan === code && (todo || dentro(h.linea)) && h.grav !== 'nota');
  if (hs.length) { console.log(`\n  Desarmonías abiertas en este tramo: ${hs.length}`); for (const h of hs.slice(0, 25)) console.log(`    [${h.grav}] ${code}:${h.linea}  ${h.titulo}`); }
  console.log('');
}

/**
 * --dossiers <dir> [n]: vuelca, para los conceptos más usados fuera de su dueño,
 * la definición y cada uso ajeno con su línea. Es el insumo de los lectores de cruces.
 */
if (process.argv.includes('--dossiers')) {
  const i = process.argv.indexOf('--dossiers');
  const dir = process.argv[i + 1];
  const porGrupo = 6;
  const elegidos = CONCEPTOS.filter((c) => c.planesAjenos >= 3 && !/\.yml$|_/.test(c.alias[0])).sort((a, b) => b.planesAjenos - a.planesAjenos || b.totalAfuera - a.totalAfuera).filter((c, k, arr) => arr.findIndex((d) => d.alias.some((a) => c.alias.includes(a))) === k).slice(0, +(process.argv[i + 2] ?? 48)).sort((a, b) => a.dueno.localeCompare(b.dueno));
  const cerca = (l, alias) => { const p = Math.max(0, ...alias.map((a) => l.indexOf(a))); return norm(l.slice(Math.max(0, p - 260), p + 340)); };
  let g = 0;
  for (let k = 0; k < elegidos.length; k += porGrupo) {
    const L = [];
    for (const c of elegidos.slice(k, k + porGrupo)) {
      const d = DOCS[c.dueno];
      L.push(`\n# CONCEPTO: ${c.nombre}\nalias: ${c.alias.join(' | ')}\ndueño: ${c.dueno} — definido en ${c.dueno}:${c.linea}\n\n## Cómo lo define su dueño\n`);
      const propias = [...new Set([c.linea, ...(c.usos[c.dueno] ?? [])])].slice(0, 14);
      for (const n of propias) L.push(`${c.dueno}:${n}: ${cerca(d.lineas[n - 1], c.alias)}`);
      L.push('\n## Cómo lo usan los otros\n');
      for (const [doc, ls] of Object.entries(c.usos)) {
        if (doc === c.dueno || !ES_PLAN.has(doc)) continue;
        for (const n of ls.slice(0, 9)) L.push(`${doc}:${n}: ${cerca(DOCS[doc].lineas[n - 1], c.alias)}`);
      }
    }
    writeFileSync(join(dir, `grupo-${++g}.md`), L.join('\n') + '\n');
  }
  console.log(`${elegidos.length} conceptos en ${g} dossiers → ${dir}`);
  for (let k = 0; k < elegidos.length; k += porGrupo) console.log(`  grupo-${k / porGrupo + 1}: ${elegidos.slice(k, k + porGrupo).map((c) => c.alias[0]).join(' · ')}`);
  process.exit(0);
}

if (process.argv.includes('--impacto')) {
  const i = process.argv.indexOf('--impacto');
  impacto(process.argv[i + 1], process.argv[i + 2]);
  process.exit(0);
}

// ════════════════════════════════════════════════════════════════════════════
// 8. LA SALIDA
// ════════════════════════════════════════════════════════════════════════════

// Diecinueve documentos listan cada vínculo en sus dos tablas, «aporta» y «necesita», sin
// orientarlo. Si una dirección solo la sostiene esa tabla y la contraria la sostienen el
// registro, el grafo o la app, la primera es eco de la segunda: los visores no la dibujan.
const esFirme = (x) => !!(x.capas.registro || x.capas.ymlNecesita || x.capas.ymlAporta || x.capas.arqNecesita || x.capas.arqAporta);
for (const x of ARISTAS.values()) { const inv = ARISTAS.get(`${x.b}>${x.a}`); x.eco = !esFirme(x) && !!inv && esFirme(inv); }

const idx = Object.fromEntries(CODIGOS.map((c, i) => [c, i]));
const paresAuditados = new Set();
const documentosAuditados = new Map(TRANSVERSALES.map((doc) => [doc.archivo, doc]));
const relaciones = JSON.parse(leer(join(AQUI, 'relaciones.json'))).map(({ planes, estado, resumen, fuentes }) => {
  const [a, b] = [...planes].sort();
  const par = `${a}/${b}`;
  if (planes.length !== 2 || a === b || !ES_PLAN.has(a) || !ES_PLAN.has(b) || paresAuditados.has(par) ||
      !['documentada', 'inferida'].includes(estado) || !resumen?.trim() || !fuentes?.length) {
    throw new Error(`Relación inválida o repetida en relaciones.json: ${par}`);
  }
  paresAuditados.add(par);
  return {
    a: idx[a], b: idx[b], estado, resumen,
    fuentes: fuentes.map(({ doc, linea, cita }) => {
      const origen = ES_PLAN.has(doc) ? DOCS[doc] : documentosAuditados.get(doc);
      if (!origen || !Number.isInteger(linea) || linea < 1 || typeof cita !== 'string' || !cita.trim()) {
        throw new Error(`Fuente inválida en relaciones.json: ${par} · ${doc}:${linea}`);
      }
      const coincide = (texto) => texto?.includes(cita);
      if (coincide(origen.lineas[linea - 1])) return { doc, linea, cita, vigente: true };
      const primera = origen.lineas.findIndex(coincide);
      const unica = primera >= 0 && primera === origen.lineas.findLastIndex(coincide);
      return { doc, linea: unica ? primera + 1 : linea, cita, vigente: unica };
    }),
  };
});
const planes = CODIGOS.map((c) => {
  const d = DOCS[c];
  const reg = REGISTRO[c] ?? {};
  const nodo = ARQ.nodos[c] ?? {};
  const f = FICHAS[c] ?? null;
  const entrantes = REMISIONES.filter((r) => r.dst === c && r.src !== c);
  const citasPorBloque = new Array(d.bloques.length).fill(0);
  for (const r of entrantes) {
    for (const s of r.secs) if (s.ok) citasPorBloque[d.bloqueDe(s.linea)]++;
    for (const l of r.lins) if (l.ok) citasPorBloque[d.bloqueDe(l.de)]++;
  }
  return {
    code: c, archivo: d.archivo, nombre: nodo.nombre ?? f?.nombre ?? reg.titulo ?? c, corto: reg.titulo ?? null,
    ordinal: nodo.ordinal ?? reg.ordinal ?? null, fase: reg.fase, mision: reg.mision, tamano: reg.tamano, estado: reg.estado,
    categoria: nodo.categoria ?? null, agencia: nodo.agencia ?? null, agenciaNombre: nodo.agenciaNombre ?? null, organo: nodo.organo ?? null,
    presupuesto: nodo.presupuestoMin != null ? [nodo.presupuestoMin, nodo.presupuestoMax] : null, anios: nodo.anios ?? null, piso: nodo.piso ?? null, fuente: nodo.fuente ?? null,
    palabras: d.palabras, lineas: d.lineas.length, cabecera: d.cabecera,
    bloques: d.bloques.map((b, i) => ({ id: b.id, t: suavizar(b.titulo), l: b.linea, f: b.fin, p: b.palabras, n: b.nivel, c: citasPorBloque[i], sub: b.sub.map((s) => ({ id: s.id, t: suavizar(s.titulo), l: s.linea })) })),
    integracion: { forma: TABLAS[c].forma, linea: TABLAS[c].linea, aporta: TABLAS[c].aporta, necesita: TABLAS[c].necesita },
    ficha: f && { version: f.version, tesis: f.tesis, problema: f.problema, resumen: f.resumen, horizonte: f.horizonte, financiamiento: f.financiamiento, temas: f.temas, cifras: f.cifras, acoples: f.acoples, tensiones: f.tensiones, sin_resolver: f.sin_resolver, usa: f.usa },
    leido: LEIDO[c] ?? null,
    nombradoPor: entrantes.reduce((s, r) => s + r.n, 0), nombra: REMISIONES.filter((r) => r.src === c && r.dst !== c).reduce((s, r) => s + r.n, 0),
  };
});

const grafo = {
  generado: new Date().toISOString().slice(0, 10),
  canon: { tematicos: CODIGOS.length - 1, documentos: CODIGOS.length, palabras: planes.reduce((s, p) => s + p.palabras, 0) },
  planes,
  transversales: TRANSVERSALES.map((t) => ({ archivo: t.archivo, titulo: t.titulo, estado: t.estado, palabras: t.palabras })),
  aristas: [...ARISTAS.values()].map((x) => ({ a: idx[x.a], b: idx[x.b], k: x.capas, ab: x.txtAB, ba: x.txtBA, que: x.que, peso: x.peso, tipo: x.tipo, eco: x.eco })),
  relaciones,
  texto: [...TXT].map(([k, n]) => { const [a, b] = k.split('>'); return [idx[a], idx[b], n]; }),
  // remisiones: [origen, línea, destino, veces, bloque de origen, secciones, líneas, recorte]
  remisiones: REMISIONES.filter((r) => r.src !== r.dst || r.secs.length || r.lins.length).map((r) => [r.esPlan ? idx[r.src] : r.src, r.linea, idx[r.dst], r.n, r.bloque, r.secs.map((s) => [s.id, s.ok ? s.linea : 0]), r.lins.map((l) => [l.de, l.a ?? 0, l.ok ? 1 : 0]), r.texto]),
  conceptos: CONCEPTOS.map((c) => ({ ...c, dueno: idx[c.dueno], disputado: c.alias.some((a) => DISPUTADOS.some(([d]) => d === a)) })),
  prestamos: PRESTAMOS.map((p) => ({ ...p, quien: idx[p.quien], origen: idx[p.origen] })),
  hallazgos: HALLAZGOS,
  cerradas: CERRADAS,
  historial: { entradas: HIST.entradas.map(({ abiertas, planes, ...e }) => e), pendiente: PENDIENTE },
  cruces: CRUCES.map((c) => ({ ...c, dueno: idx[c.dueno], otro: idx[c.otro] })),
  lecturas: LECTURAS.map((l) => ({ ...l, plan: idx[l.plan] })),
  tipos: TIPOS,
  fantasmas: FANTASMAS_CONOCIDOS,
};

if (!anclasViejas || process.argv.includes('--fijar')) writeFileSync(RUTA_ANCLAS, `${JSON.stringify(anclasNuevas, Object.keys(anclasNuevas).sort((a, b) => a.localeCompare(b, 'es', { numeric: true })), 1)}\n`);
else {
  // Las anclas nuevas entran solas; las que cambiaron esperan a `--fijar`.
  const fusion = { ...anclasViejas };
  for (const [k, v] of Object.entries(anclasNuevas)) if (!(k in fusion)) fusion[k] = v;
  for (const k of Object.keys(fusion)) if (!(k in anclasNuevas)) delete fusion[k];
  writeFileSync(RUTA_ANCLAS, `${JSON.stringify(fusion, Object.keys(fusion).sort((a, b) => a.localeCompare(b, 'es', { numeric: true })), 1)}\n`);
}

writeFileSync(join(AQUI, 'grafo.json'), JSON.stringify(grafo));

const PLANTILLA = join(AQUI, 'plantilla.html');
if (existsSync(PLANTILLA)) {
  const plantilla = leer(PLANTILLA);
  // 1. El archivo suelto: todo adentro, para abrir con doble clic.
  writeFileSync(join(AQUI, 'atlas.html'), plantilla.replace('/*__GRAFO__*/null', () => JSON.stringify(grafo).replace(/</g, '\\u003c')));

  // 2. El visor para la app (v2). La página es una ruta de la app —`/atlas`,
  // `v2/apps/web/src/pages/Atlas.tsx`—, que pone el encabezado y el pie del sitio y monta
  // este visor adentro. Acá salen sus tres piezas: los estilos, todos bajo `.atlas`; el
  // código, que deja `window.__atlasBASTA.iniciar(grafo, elemento)`; y los datos. Van en
  // archivos propios porque la política de seguridad del sitio (`script-src 'self'` en
  // v2/vercel.json) no deja correr scripts en línea.
  const SITIO_DIR = join(REPO, 'v2/apps/web/public');
  if (existsSync(SITIO_DIR)) {
    const entre = (a, z) => plantilla.slice(plantilla.indexOf(a) + a.length, plantilla.indexOf(z, plantilla.indexOf(a)));
    // En la app el registro es papel, siempre: se van los tokens de noche y las reglas del
    // documento suelto (`:root`, `html`, `body`); los tokens pasan a colgar de `.atlas`.
    const estilo = entre('<style>', '</style>')
      .replace(/@media \(prefers-color-scheme:dark\)\{:root:not\(\[data-theme="light"\]\)\{[^}]*\}\}\n?/, '')
      .replace(/:root\[data-theme="dark"\]\{[^}]*\}\n?/, '')
      .replace(/^:root\{/m, '.atlas{')
      .replace(/^html,body\{[^}]*\}\n?/m, '')
      .replace(/^body\{[^}]*\}\n?/m, '');
    if (/:root|prefers-color-scheme|(^|\})\s*(html|body)\b/.test(estilo)) throw new Error('Los estilos del visor tienen reglas fuera de `.atlas`: en la app pisarían al sitio. Revisar la plantilla.');
    const codigo = entre('<script>', '</script>')
      .replace('/*__SITIO__*/false', 'true')
      .replace('iniciar(/*__GRAFO__*/null);', 'window.__atlasBASTA = { iniciar };');
    if (codigo.includes('__GRAFO__') || codigo.includes('__SITIO__')) throw new Error('La plantilla cambió y la versión del sitio quedó sin armar: revisar los marcadores __SITIO__ y __GRAFO__.');
    const dir = join(SITIO_DIR, 'atlas');
    mkdirSync(dir, { recursive: true });
    rmSync(join(dir, 'index.html'), { force: true }); // era la página suelta: con ella ahí, /atlas no llega a la app
    writeFileSync(join(dir, 'atlas.css'), `/* Generado por «Iniciativas Estratégicas/atlas/construir.mjs». No editar: se reescribe. */\n${estilo.trim()}\n`);
    writeFileSync(join(dir, 'atlas.js'), `// Generado por «Iniciativas Estratégicas/atlas/construir.mjs». No editar: se reescribe.\n(() => {\n${codigo.trim()}\n})();\n`);
    writeFileSync(join(dir, 'grafo.json'), JSON.stringify(grafo));
    // mapa.json: nodos y relaciones para un mapa compacto, sin el detalle de las citas.
    const cuenta = (hs) => { const c = { rota: 0, revisar: 0, nota: 0 }; for (const h of hs) c[h.grav]++; return c; };
    writeFileSync(join(dir, 'mapa.json'), JSON.stringify({
      generado: grafo.generado,
      canon: grafo.canon,
      desarmonias: cuenta(HALLAZGOS),
      planes: planes.map((p) => ({ code: p.code, slug: p.code.toLowerCase(), nombre: p.nombre, tramo: p.fase ?? null, ordinal: p.ordinal ?? null, palabras: p.palabras, nombradoPor: p.nombradoPor, tesis: p.ficha?.tesis ?? null, resumen: p.ficha?.resumen ?? null, desarmonias: cuenta(HALLAZGOS.filter((h) => h.plan === p.code)) })),
      // «a recibe de b». Solo vínculos firmes; peso = veces que los dos documentos se nombran.
      vinculos: [...ARISTAS.values()].filter((x) => !x.eco).map((x) => ({ a: idx[x.a], b: idx[x.b], peso: x.txtAB + x.txtBA, que: x.que ?? null })),
      relaciones: relaciones.map(({ a, b, estado, resumen }) => ({ a, b, estado, resumen })),
    }));
    writeFileSync(join(dir, 'atlas.js'), `// Generado por «Iniciativas Estratégicas/atlas/construir.mjs». No editar: se reescribe.\n${codigo.trim()}\n`);
  }
}

// DESARMONIAS.md — lo mismo que muestra el atlas, para leer en el editor o en un diff.
{
  const porTipo = {};
  for (const h of HALLAZGOS) (porTipo[h.tipo] ??= []).push(h);
  const cuenta = (g) => HALLAZGOS.filter((h) => h.grav === g).length;
  const L = [];
  L.push('# Desarmonías del corpus', '', `> Generado por \`atlas/construir.mjs\` el ${grafo.generado}. **No editar a mano**: se reescribe en cada corrida.`, `> ${cuenta('rota')} rotas · ${cuenta('revisar')} para revisar · ${cuenta('nota')} notas.`, '',
    'Tres gravedades. **Rota**: se puede probar contra el texto y está mal. **Revisar**: el patrón casi siempre señala un problema, pero hay que leer la línea. **Nota**: no es un error; conviene saberlo antes de editar.', '',
    '| Tipo | Gravedad | Cuántas |', '|---|---|---|');
  for (const [t, hs] of Object.entries(porTipo)) L.push(`| [${TIPOS[t]?.[0] ?? t}](#${t}) | ${hs[0].grav} | ${hs.length} |`);
  for (const [t, hs] of Object.entries(porTipo)) {
    const t0 = t;
    L.push('', `## ${TIPOS[t]?.[0] ?? t}`, `<a id="${t}"></a>`, '', TIPOS[t]?.[1] ?? '', '');
    // `verificar-remisiones.ts` lee todo `.md` del taller, este incluido. Una cita rota
    // copiada acá tal cual la haría fallar dos veces, y seguiría fallando con el original
    // ya arreglado hasta que alguien regenere: se escribe «PLANX, línea N», que no matchea.
    const desarmar = (t) => (/^(linea-rota|ancla-)/.test(t0) ? t.replace(/(PLAN[A-Z0-9]+):(\d+)/g, '$1, línea $2') : t);
    for (const h of hs) {
      L.push(`- \`${h.id}\` **${h.plan}${h.linea ? `:${h.linea}` : ''}** — ${desarmar(h.titulo)}.${h.tocada ? ' **El texto citado cambió desde que se leyó: confirmar si quedó resuelta.**' : ''} ${desarmar(h.detalle)}`);
      if (h.texto) L.push(`  > ${desarmar(h.texto.replace(/\n/g, ' '))}`);
    }
  }
  if (CERRADAS.length) {
    L.push('', '## Cerradas a mano', '', 'Las que alguien miró y cerró, con su razón. Se reabren con `--reabrir <id>`.', '');
    for (const h of CERRADAS) L.push(`- \`${h.id}\` **${h.plan}** — ${h.titulo}. _${h.estado === 'descartada' ? 'Descartada' : 'Resuelta'} el ${h.cerrada}: ${h.razon}_`);
  }
  writeFileSync(join(AQUI, 'DESARMONIAS.md'), `${L.join('\n')}\n`);

  // HISTORIAL.md — el registro, de lo último a lo primero.
  const M = ['# Historial del corpus', '', '> Lo escribe `atlas/construir.mjs --registrar "qué se hizo"`. **No editar a mano.**', '',
    'Cada entrada es una foto del corpus: qué documentos cambiaron desde la anterior, qué desarmonías dejaron de estar y cuáles aparecieron. El número entre paréntesis es el commit sobre el que se tomó.', ''];
  const lista = (xs, f) => xs.map((x) => `  - \`${x.id}\` ${x.plan ?? ''} — ${x.titulo ?? '(sin título en el catálogo)'}${f ? f(x) : ''}`);
  if (PENDIENTE && (PENDIENTE.cambios.length || PENDIENTE.resueltas.length || PENDIENTE.nuevas.length)) {
    M.push('## Sin registrar todavía', '', `Desde la última entrada: ${PENDIENTE.cambios.length} documentos cambiaron, ${PENDIENTE.resueltas.length} desarmonías dejaron de estar, ${PENDIENTE.nuevas.length} aparecieron.`, '');
  }
  for (const e of [...HIST.entradas].reverse()) {
    M.push(`## ${e.n} · ${e.fecha} — ${e.nota}`, '', `Quedan abiertas ${e.totales.rota} rotas, ${e.totales.revisar} para revisar y ${e.totales.nota} notas${e.totales.cerradas ? `; ${e.totales.cerradas} cerradas a mano` : ''}.${e.base ? ` (sobre \`${e.base}\`)` : ''}`, '');
    if (e.cambios.length) M.push('- **Documentos que cambiaron:** ' + e.cambios.map((c) => `${c.code}${c.de && c.de.version !== c.a.version ? ` v${c.de.version ?? '?'} → v${c.a.version ?? '?'}` : ''} (${c.de ? `${c.a.lineas - c.de.lineas >= 0 ? '+' : ''}${c.a.lineas - c.de.lineas} líneas, ${c.a.palabras - c.de.palabras >= 0 ? '+' : ''}${c.a.palabras - c.de.palabras} palabras` : 'nuevo'})`).join(' · '));
    if (e.resueltas.length) M.push(`- **Dejaron de estar (${e.resueltas.length}):**`, ...lista(e.resueltas, (x) => ` _(${x.como}${x.razon ? `: ${x.razon}` : ''})_`));
    if (e.nuevas.length) M.push(`- **Aparecieron (${e.nuevas.length}):**`, ...lista(e.nuevas));
    M.push('');
  }
  writeFileSync(join(AQUI, 'HISTORIAL.md'), `${M.join('\n')}\n`);
}

// Resumen de consola.
{
  const g = (x) => HALLAZGOS.filter((h) => h.grav === x).length;
  const lineasCitadas = REMISIONES.reduce((s, r) => s + r.lins.length, 0);
  const seccionesCitadas = REMISIONES.reduce((s, r) => s + r.secs.length, 0);
  console.log(`\n  Atlas del corpus — ${grafo.generado}`);
  console.log(`  ${CODIGOS.length} PLANes · ${grafo.canon.palabras.toLocaleString('es-AR')} palabras · ${TRANSVERSALES.length} documentos transversales`);
  console.log(`  ${REMISIONES.length.toLocaleString('es-AR')} remisiones (${seccionesCitadas} por sección, ${lineasCitadas} por línea) · ${ARISTAS.size} vínculos declarados`);
  console.log(`  ${Object.keys(FICHAS).length}/${CODIGOS.length} fichas · ${CONCEPTOS.length} conceptos con dueño · ${PRESTAMOS.length} préstamos`);
  console.log(`  Desarmonías: ${g('rota')} rotas · ${g('revisar')} para revisar · ${g('nota')} notas`);
  const porTipo = {};
  for (const h of HALLAZGOS) porTipo[h.tipo] = (porTipo[h.tipo] ?? 0) + 1;
  for (const [t, n] of Object.entries(porTipo)) console.log(`     ${String(n).padStart(4)}  ${TIPOS[t]?.[0] ?? t}`);
  if (CERRADAS.length) console.log(`  ${CERRADAS.length} cerradas a mano (resoluciones.json).`);
  if (PENDIENTE && (PENDIENTE.cambios.length || PENDIENTE.resueltas.length || PENDIENTE.nuevas.length)) console.log(`\n  Desde la última entrada del historial (${HIST.entradas.at(-1).fecha}): cambiaron ${PENDIENTE.cambios.map((c) => c.code).join(', ') || 'ningún PLAN'} · ${PENDIENTE.resueltas.length} dejaron de estar · ${PENDIENTE.nuevas.length} aparecieron.\n  Para dejarlo anotado: --registrar "qué se hizo"`);
  else if (!HIST.entradas.length) console.log('\n  El historial está vacío. La primera entrada: --registrar "Línea de base"');
  if (ANCLAS_CORRIDAS.length) console.log(`\n  ${ANCLAS_CORRIDAS.length} anclas cambiaron desde la última vez. Renumerá las citas y corré con --fijar.`);
  console.log(`\n  → ${join(AQUI, 'atlas.html')}\n`);
}
