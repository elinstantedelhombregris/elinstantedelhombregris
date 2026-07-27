/**
 * Guardia de campos planos del frontmatter de planes.
 *
 * Extraído de migrate-planes-v1-to-v2.ts para que se pueda importar desde un
 * test sin ejecutar el `main()` de la migración (que borra y reescribe
 * content/planes/).
 */
import type { FuentePlan } from './planes-sources';

/**
 * yamlSingle() escapa `'` como `''` (la convención YAML), pero el parser de
 * frontmatter que lee estos archivos — `leerFrontmatter()` en
 * `scripts/content/verify-planes-index.ts`, el mismo que usa la guardia de
 * CI — es línea por línea: si algún día un title, nombreInstitucional o
 * summary trajera una comilla simple, el YAML emitido sería válido pero esa
 * guardia des-escaparía `''` de vuelta a `'` y compararía contra un valor
 * que no es el que se commiteó. Un salto de línea es peor todavía — parte
 * la línea `clave: valor` en dos y el resto del frontmatter deja de parsear.
 * Frenamos acá, antes de escribir un solo archivo, en vez de dejar que este
 * desacople data-fix ↔ parser rompa la guardia sin que nadie lo note.
 */
export function validarCamposPlanos(fuente: FuentePlan): void {
  const campos: readonly (readonly [string, string])[] = [
    ['title', fuente.title],
    ['nombreInstitucional', fuente.nombreInstitucional],
    ['summary', fuente.summary],
  ];
  for (const [campo, valor] of campos) {
    if (valor.includes("'")) {
      throw new Error(
        `${fuente.code}.${campo} contiene una comilla simple ('): ` +
          'leerFrontmatter() en scripts/content/verify-planes-index.ts des-escapa `\'\'` de vuelta a `\'`, ' +
          'así que la guardia de CI compararía contra un valor distinto del commiteado. Corregí PLANES_SOURCES antes de migrar.',
      );
    }
    if (valor.includes('\n')) {
      throw new Error(
        `${fuente.code}.${campo} contiene un salto de línea: ` +
          'rompe la línea "clave: valor" del frontmatter YAML. Corregí PLANES_SOURCES antes de migrar.',
      );
    }
  }
}
