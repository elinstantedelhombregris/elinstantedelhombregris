import { MAX_TEMAS, contenidoFichaSchema, type ContenidoFicha } from '@v2/shared';

export type CampoDeFicha =
  | 'titulo'
  | 'territorioId'
  | 'temas'
  | 'situacion'
  | 'futuro'
  | 'proximaTarea'
  | 'campanaId'
  | 'condiciones'
  | 'vinculos';
export type ErroresDeFicha = Partial<Record<CampoDeFicha, string>>;

const CAMPOS: readonly CampoDeFicha[] = [
  'titulo',
  'territorioId',
  'temas',
  'situacion',
  'futuro',
  'proximaTarea',
  'campanaId',
  'condiciones',
  'vinculos',
];
const esCampo = (v: unknown): v is CampoDeFicha => CAMPOS.some((c) => c === v);

interface Problema {
  campo: CampoDeFicha;
  codigo: string;
  /** `true` cuando el problema es de un elemento de la lista y no de la lista entera. */
  deElemento: boolean;
  mensaje: string;
}

function decir(p: Problema): string {
  switch (p.campo) {
    case 'titulo':
      return p.codigo === 'too_big' ? 'El título puede tener hasta 180 caracteres.' : p.mensaje;
    case 'condiciones':
      if (p.codigo === 'too_small')
        return 'Cada condición necesita al menos 3 caracteres. Borrá las líneas que sobren.';
      return p.deElemento
        ? 'Cada condición puede tener hasta 500 caracteres.'
        : 'Podés cargar hasta 12 condiciones.';
    case 'temas':
      return `Elegí hasta ${String(MAX_TEMAS)} temas.`;
    case 'vinculos':
      return p.codigo === 'custom' ? p.mensaje : 'Una ficha admite hasta 40 aportes vinculados.';
    case 'situacion':
    case 'futuro':
    case 'proximaTarea':
      return 'Este texto es demasiado largo. Acortalo sin perder lo central.';
    case 'territorioId':
      return 'Elegí un lugar de la lista o dejá «Todo el país».';
    case 'campanaId':
      return 'La campaña de esta ficha no es válida.';
  }
}

/**
 * Valida el contenido de una ficha con el mismo esquema que usa el servidor y
 * devuelve un mensaje por campo, en castellano, para mostrarlo al lado del campo.
 */
export function validarFicha(
  contenido: ContenidoFicha,
): { datos: ContenidoFicha } | { errores: ErroresDeFicha } {
  const resultado = contenidoFichaSchema.safeParse(contenido);
  if (resultado.success) return { datos: resultado.data };
  const errores: ErroresDeFicha = {};
  for (const issue of resultado.error.issues) {
    const campo = issue.path[0];
    if (!esCampo(campo) || errores[campo]) continue;
    errores[campo] = decir({
      campo,
      codigo: issue.code,
      deElemento: issue.path.length > 1,
      mensaje: issue.message,
    });
  }
  return { errores };
}
