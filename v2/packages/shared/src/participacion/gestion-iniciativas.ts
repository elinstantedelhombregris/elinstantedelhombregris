import type { PlanEscucha, ResultadoEscucha } from '../validation/gestion-iniciativas';
export interface PaginaGestion<T> {
  items: T[];
  siguiente: number | null;
}
export interface PermisosIniciativa {
  miembro: boolean;
  administrar: boolean;
  propietario: boolean;
  aceptarTraspaso: boolean;
}
export interface MiembroIniciativa {
  usuario: string;
  rol: string;
  id: number;
}
export interface HitoIniciativa {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  revision: number;
  completado: boolean;
  derivado: boolean;
}
export interface TareaIniciativa {
  fichaId?: string | null;
  id: number;
  titulo: string;
  alcance: string;
  fecha: string;
  hitoId: number | null;
  revision: number;
  estado: string;
  firma: string | null;
  recursos: string;
  escucha: PlanEscucha | null;
  puedoGestionar: boolean;
  puedoAceptar: boolean;
  puedoEditar: boolean;
  puedoEvidenciar: boolean;
  derivada: boolean;
}
export interface EvidenciaIniciativa {
  id: number;
  titulo: string;
  texto: string;
  url: string | null;
  revision: number;
  revisada: boolean;
  firmaRevision: string | null;
  notaRevision: string | null;
  resultadoEscucha: ResultadoEscucha | null;
  puedoRetirar: boolean;
  puedoRevisar: boolean;
}
export interface EscuchaPublica extends Omit<
  TareaIniciativa,
  'puedoGestionar' | 'puedoAceptar' | 'puedoEditar' | 'puedoEvidenciar' | 'derivada'
> {
  iniciativaSlug: string;
  iniciativaTitulo: string;
  revisiones: number;
}
