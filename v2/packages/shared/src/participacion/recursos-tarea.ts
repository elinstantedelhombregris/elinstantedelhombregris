import type { EstadoReserva } from '../validation/capacidades.js';

export interface RecursoTarea {
  id: string;
  capacidadId: string;
  titulo: string;
  unidad: string;
  cantidad: number | null;
  cantidadDeclarada: number | null;
  paraFecha: string;
  estado: EstadoReserva;
  revision: number;
  fichaId: string;
  tareaId: number | null;
  soySolicitante: boolean;
}
export interface RecursosTarea {
  items: RecursoTarea[];
  siguiente: string | null;
}
