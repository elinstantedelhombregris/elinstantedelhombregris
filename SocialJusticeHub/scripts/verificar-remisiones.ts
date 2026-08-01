/**
 * Guardia de remisiones del corpus: resuelve TODA cita `ARCHIVO:línea` contra el
 * archivo real y falla si apunta a nada.
 *
 * Run: npx tsx scripts/verificar-remisiones.ts
 *
 * ── POR QUÉ EXISTE ───────────────────────────────────────────────────────────
 * La primera lección del cierre del tramo D: **editar un documento ajeno corre
 * sus líneas y rompe remisiones ajenas.** Escribir el split del FSC del lado de
 * PLANTER movió sus líneas +9 desde §3.3 y +12 desde §11.2, y con eso rompió
 * ocho remisiones `PLANTER:línea` de PLANARCO. Lo encontró la guardia de
 * PLANARCO, y lo encontró **por casualidad**, porque esa guardia casualmente
 * citaba a PLANTER para verificar otra cosa.
 *
 * La casualidad no es un método. El tramo de PLANFOCO toca cinco documentos
 * ajenos con ~119 remisiones apuntándoles, así que el chequeo se hace explícito
 * y genérico: no verifica a PLANFOCO, verifica al corpus entero.
 *
 * ── QUÉ CUENTA COMO ROTA ─────────────────────────────────────────────────────
 * Una remisión está rota si el archivo no existe, si la línea está fuera de
 * rango, o si la línea está **vacía** — que es el síntoma exacto de un
 * corrimiento: la cita sigue siendo un número válido y ya no apunta a nada.
 *
 * Lo que esta guardia NO puede verificar es si la línea sigue diciendo lo
 * mismo. Una remisión que ahora apunta a un párrafo distinto pero no vacío pasa
 * en verde, y eso queda declarado acá en vez de descubrirse después: esto
 * detecta corrimientos grandes, no reescrituras en el lugar.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const TALLER = resolve(REPO_ROOT, 'Iniciativas Estratégicas');

/** Dónde se buscan remisiones. El taller y las guardias, que también citan. */
const FUENTES: { dir: string; ext: string }[] = [
  { dir: TALLER, ext: '.md' },
  { dir: SCRIPT_DIR, ext: '.ts' },
];

/**
 * `PLANTER:163`, `PLANARCO:670-676`, `PRESUPUESTO_CONSOLIDADO:419`,
 * `PLANMESA_Argentina_ES.md:297`. El nombre puede venir con o sin sufijo.
 *
 * **Sin espacio después de los dos puntos**, y ésa es la regla que separa una
 * remisión de una lista. El corpus escribe sus citas pegadas —`PLANTER:163`— y
 * escribe otras cosas con espacio: «PLANPREGUNTA vs PLANEDU: 0.21x» es la salida
 * de un gate, y «- PLANVIV: 230» es un ítem de un inventario. Las tres primeras
 * versiones de esta guardia reportaron esas cinco como rotas, que es un falso
 * positivo caro: una guardia que grita sobre lo que está bien enseña a ignorarla.
 *
 * Y el número no puede seguir con decimal ni con «x»: `0.21x` es un cociente.
 */
const REMISION = /\b([A-Z][A-Z0-9_]{2,})(?:_Argentina_ES)?(?:\.md)?:(\d+)(?!\s*[.,]\d)(?!\s*[xX%])(?:\s*[–—-]\s*(\d+))?\b/g;

/**
 * Nombres que matchean la forma y no son archivos del taller. Se declaran acá
 * con su razón: un opt-out sin razón escrita no se puede auditar cuando el
 * corpus cambie.
 */
const NO_SON_ARCHIVOS: { patron: RegExp; porQue: string }[] = [
  { patron: /^(TABLA|ANEXO|FASE|CAPA|RAMA|NIVEL|JUS|USD|ARS|PBI|IVA|LDEA|AMBA|NOA|NEA|CABA)$/u, porQue: 'etiquetas internas de los documentos, no archivos' },
  { patron: /^(HTTP|HTTPS|FTP)$/u, porQue: 'esquemas de URL' },
  { patron: /^(GET|POST|PUT|PATCH|DELETE)$/u, porQue: 'métodos HTTP en documentación técnica' },
  { patron: /^[A-Z]{2,3}$/u, porQue: 'siglas de dos o tres letras: demasiado ambiguas para resolver a un archivo' },
];

/**
 * Citas que **no son remisiones sino ejemplos**: viven adentro de comentarios de
 * otras guardias que documentan un bug con una cita inventada. Se listan una por
 * una, con archivo y motivo, porque una regla genérica para detectarlas —«si el
 * número es absurdo, es un ejemplo»— dejaría pasar remisiones genuinamente rotas.
 */
const ILUSTRATIVAS: { cita: string; en: string; porQue: string }[] = [
  {
    cita: 'BLINDAJE:19400',
    en: 'verificar-planarco.ts',
    porQue: 'ejemplo de un bug de parseo documentado en el comentario de esa guardia, no una cita',
  },
  {
    cita: 'PLANJUB:100',
    en: 'verificar-planarco.ts',
    porQue: 'cita inventada en un comentario para explicar qué NO tiene que pasar',
  },
];

interface Rota {
  desde: string;
  linea: number;
  cita: string;
  motivo: string;
}

/**
 * Este mismo archivo se excluye del barrido. Contiene, por necesidad, las citas
 * ilustrativas de `ILUSTRATIVAS` escritas como texto, y una guardia que se
 * escanea a sí misma se reporta a sí misma: la primera corrida después de
 * agregar la allowlist falló acusando a la allowlist.
 */
const YO = 'verificar-remisiones.ts';

function archivosDe(dir: string, ext: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(ext) && f !== YO)
    .map((f) => join(dir, f));
}

/**
 * Índice de los documentos del taller por su nombre corto, **con resolución por
 * prefijo**: el corpus cita `PRESUPUESTO_CONSOLIDADO:419` y el archivo se llama
 * `PRESUPUESTO_CONSOLIDADO_BASTA.md`, igual que cita `BLINDAJE:28` y `ACTA:31`.
 * Sin esto, 55 remisiones de las 653 quedaban sin verificar y la guardia las
 * informaba como «nombres desconocidos», que es la forma silenciosa de no mirar.
 *
 * Si un prefijo matchea **más de un archivo**, el nombre NO se resuelve y se
 * reporta: resolver a uno elegido por orden de directorio es verificar contra el
 * archivo equivocado, que es peor que no verificar.
 */
function indiceDelTaller(): { exactos: Map<string, string[]>; ambiguos: Map<string, string[]> } {
  const exactos = new Map<string, string[]>();
  const nombres: string[] = [];
  for (const ruta of archivosDe(TALLER, '.md')) {
    const base = (ruta.split('/').pop() ?? '').replace(/\.md$/, '');
    const corto = base.replace(/_Argentina_ES$/, '');
    nombres.push(corto);
    exactos.set(corto, readFileSync(ruta, 'utf8').split('\n'));
  }
  const ambiguos = new Map<string, string[]>();
  for (const corto of nombres) {
    // Prefijos PROGRESIVOS y no partes sueltas: el corpus cita
    // `PRESUPUESTO_CONSOLIDADO:419`, que es dos palabras de
    // `PRESUPUESTO_CONSOLIDADO_BASTA`. Partir por «_» y probar cada parte por
    // separado nunca produce ese prefijo, y quince remisiones quedaban afuera.
    const partes = corto.split('_');
    for (let n = 1; n < partes.length; n++) {
      const prefijo = partes.slice(0, n).join('_');
      if (prefijo.length < 4 || exactos.has(prefijo)) continue;
      const candidatos = nombres.filter((x) => x.startsWith(prefijo));
      if (candidatos.length === 1) {
        exactos.set(prefijo, exactos.get(candidatos[0] ?? '') ?? []);
      } else if (candidatos.length > 1) {
        ambiguos.set(prefijo, candidatos);
      }
    }
  }
  return { exactos, ambiguos };
}

function main(): void {
  const { exactos: taller, ambiguos } = indiceDelTaller();
  if (taller.size === 0) {
    console.error(`No se encontró ningún documento en ${TALLER}`);
    process.exit(1);
  }

  const rotas: Rota[] = [];
  const desconocidos = new Map<string, number>();
  let total = 0;

  for (const { dir, ext } of FUENTES) {
    for (const ruta of archivosDe(dir, ext)) {
      const relativo = ruta.replace(`${REPO_ROOT}/`, '');
      const lineas = readFileSync(ruta, 'utf8').split('\n');
      lineas.forEach((linea, k) => {
        const re = new RegExp(REMISION.source, REMISION.flags);
        let m: RegExpExecArray | null;
        while ((m = re.exec(linea)) !== null) {
          const nombre = m[1] ?? '';
          if (NO_SON_ARCHIVOS.some((x) => x.patron.test(nombre))) continue;
          if (ILUSTRATIVAS.some((x) => m?.[0] === x.cita && relativo.endsWith(x.en))) continue;

          if (ambiguos.has(nombre)) {
            rotas.push({
              desde: relativo,
              linea: k + 1,
              cita: m[0],
              motivo:
                `«${nombre}» matchea ${String((ambiguos.get(nombre) ?? []).length)} archivos ` +
                `(${(ambiguos.get(nombre) ?? []).join(', ')}): la cita no se puede resolver, y ` +
                'resolverla al primero por orden de directorio sería verificar contra el equivocado',
            });
            continue;
          }
          const destino = taller.get(nombre);
          if (destino === undefined) {
            // No es un archivo del taller. Se cuenta y se informa agregado: puede
            // ser una etiqueta nueva que merece entrar a NO_SON_ARCHIVOS, o un
            // archivo que se borró. Las dos cosas hay que enterarse.
            desconocidos.set(nombre, (desconocidos.get(nombre) ?? 0) + 1);
            continue;
          }

          total += 1;
          const desde = Number(m[2]);
          const hasta = m[3] === undefined ? desde : Number(m[3]);
          const cita = m[0];

          if (hasta > destino.length) {
            rotas.push({
              desde: relativo,
              linea: k + 1,
              cita,
              motivo: `${nombre} tiene ${String(destino.length)} líneas y la cita pide hasta la ${String(hasta)}`,
            });
            continue;
          }
          const vacias: number[] = [];
          for (let n = desde; n <= hasta; n++) {
            if ((destino[n - 1] ?? '').trim() === '') vacias.push(n);
          }
          // Un rango puede legítimamente incluir una línea en blanco entre párrafos.
          // Lo que no puede es estar ENTERO en blanco: eso es un corrimiento.
          if (vacias.length === hasta - desde + 1) {
            rotas.push({
              desde: relativo,
              linea: k + 1,
              cita,
              motivo: `apunta a línea(s) vacía(s) de ${nombre}: una remisión a nada`,
            });
          }
        }
      });
    }
  }

  if (desconocidos.size > 0) {
    console.log(`Nombres con forma de remisión que no son documentos del taller (${String(desconocidos.size)}):`);
    for (const [nombre, veces] of [...desconocidos].sort((a, b) => b[1] - a[1])) {
      console.log(`  · ${nombre} (${String(veces)} vez/veces)`);
    }
    console.log('');
  }

  if (rotas.length > 0) {
    console.error(`Remisiones rotas: ${String(rotas.length)} de ${String(total)} verificadas\n`);
    for (const r of rotas) {
      console.error(`  · ${r.desde}:${String(r.linea)} — «${r.cita}» ${r.motivo}`);
    }
    process.exit(1);
  }

  console.log(
    `Remisiones OK: ${String(total)} citas ARCHIVO:línea resueltas contra ${String(taller.size)} documentos del taller. ` +
      'Ninguna apunta a una línea vacía ni fuera de rango.',
  );
}

main();
