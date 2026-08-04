import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * El conteo canónico, **leído del registro y no escrito a mano**.
 *
 * `PLAN_REGISTRY.yml` se declara a sí mismo «única fuente de verdad sobre el
 * conteo, estado y secuencia», y sin embargo tres tests de este directorio lo
 * copiaban como literal. Los tres se pusieron rojos el mismo día por la misma
 * causa —entró PLANPUERTA y el corpus pasó de 27 a 28 documentos—, y ya se
 * habían puesto rojos antes cuando entró PLANPACTO. Es la clase de defecto que
 * `docs/DEUDAS.md` D-020 describe: el conteo vive hardcodeado en varios lugares
 * y ninguno avisa cuando queda viejo.
 *
 * Se lee con regex y no con un parser de YAML a propósito: el archivo es la
 * fuente de verdad de un corpus de prosa, no una config, y sumar una
 * dependencia para leer dos enteros sería peor que el problema.
 */
const REGISTRO = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../Iniciativas Estratégicas/PLAN_REGISTRY.yml',
);

function campoDelRegistro(nombre: string): number {
  const texto = readFileSync(REGISTRO, 'utf8');
  const m = new RegExp(`^\\s*${nombre}:\\s*(\\d+)\\s*$`, 'm').exec(texto);
  if (m?.[1] === undefined) {
    throw new Error(
      `PLAN_REGISTRY.yml no declara \`${nombre}\`: sin ese campo los tests del canon no ` +
        'tienen contra qué medir, y volver al literal es lo que los rompió dos veces',
    );
  }
  return Number(m[1]);
}

/** Los PLANes temáticos. Hoy 27; era 26 hasta PLANPUERTA y 22 hasta PLANPACTO. */
export const TEMATICOS_SEGUN_REGISTRO = campoDelRegistro('thematic_count');

/** Los temáticos más PLANRUTA, que es un documento del corpus como los demás. */
export const TOTAL_SEGUN_REGISTRO = campoDelRegistro('total_documents');
