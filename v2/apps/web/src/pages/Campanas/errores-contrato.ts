/** Cómo se llama cada campo del formulario de una campaña para quien lo completa. */
export const ROTULOS_CAMPO: Readonly<Record<string, string>> = {
  titulo: 'Nombre de la campaña',
  pregunta: 'La pregunta que nos reúne',
  proposito: 'Para qué abrimos esta campaña',
  participantes: 'A quiénes queremos escuchar',
  responsable: 'Equipo que acepta facilitar y devolver',
  devolucion: 'Qué vamos a devolver',
  usoDatos: 'Cómo usaremos los datos compartidos',
  metodoLectura: 'Cómo leeremos y revisaremos lo escuchado',
  efecto: 'Qué efecto puede tener la campaña',
  institucion: 'Institución mencionada',
  temas: 'Temas',
  territorios: 'Lugares incluidos',
  canales: 'Canales de participación',
  fases: 'Etapas y fechas',
  fechaDevolucion: 'Fecha prevista de devolución',
};

/** Los errores por campo. La clave es el camino del campo: `titulo`, `fases.0.nombre`. */
export type ErroresContrato = Readonly<Record<string, string>>;

interface Problema {
  path: readonly (string | number)[];
  message: string;
  code?: string;
  validation?: unknown;
}

/** Lo que el esquema no dice en español (una fecha vacía llega como «Invalid date»). */
function mensajeDe(p: Problema) {
  if (p.code === 'invalid_string' && p.validation === 'date') return 'Elegí una fecha válida.';
  if (p.code === 'invalid_type') return 'Completá este campo.';
  return p.message;
}

/** Un mensaje por campo —el primero—, con la clave del campo como camino. */
export function erroresDelContrato(problemas: readonly Problema[]): ErroresContrato {
  const errores: Record<string, string> = {};
  for (const p of problemas) {
    const clave = p.path.join('.');
    errores[clave] ??= mensajeDe(p);
  }
  return errores;
}

/** El error de un campo o de cualquiera de sus partes (`temas` incluye `temas.1`). */
export function errorDeCampo(errores: ErroresContrato, campo: string): string | undefined {
  const clave = Object.keys(errores).find((k) => k === campo || k.startsWith(`${campo}.`));
  return clave === undefined ? undefined : errores[clave];
}

/** Los nombres de los campos con error, en el orden del formulario. */
export function camposConError(errores: ErroresContrato): string[] {
  const vistos: string[] = [];
  for (const clave of Object.keys(errores)) {
    const campo = clave.split('.')[0] ?? clave;
    const nombre = ROTULOS_CAMPO[campo] ?? campo;
    if (!vistos.includes(nombre)) vistos.push(nombre);
  }
  return vistos;
}
