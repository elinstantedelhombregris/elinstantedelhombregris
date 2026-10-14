export interface CampoGestion {
  clave: string;
  etiqueta: string;
  tipo?: 'textarea' | 'date' | 'number' | 'checkbox';
  opciones?: readonly { valor: string; etiqueta: string }[];
  ayuda?: string;
}
export type ValoresGestion = Record<string, string | boolean>;
export const AUTORIZACION: CampoGestion = {
  clave: 'autorizo',
  tipo: 'checkbox',
  etiqueta:
    'Autorizo publicar estos datos. Revisé que no incluyan nombres de participantes, domicilios ni información sensible.',
};
export const texto = (v: ValoresGestion, k: string) => String(v[k] ?? '');
export const ESTADOS_INICIATIVA = [
  { valor: 'open', etiqueta: 'Abierta' },
  { valor: 'in_progress', etiqueta: 'En curso' },
  { valor: 'paused', etiqueta: 'Pausada' },
  { valor: 'completed', etiqueta: 'Completada con resultados revisados' },
  { valor: 'archived', etiqueta: 'Archivada' },
];
export const ESTADOS_TAREA: Record<string, string> = {
  todo: 'Pendiente de iniciar',
  in_progress: 'En curso',
  blocked: 'Pausada',
  done: 'Ejecución declarada',
  cancelled: 'Cancelada',
};
