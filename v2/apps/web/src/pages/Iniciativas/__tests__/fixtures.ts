import type { EvidenciaIniciativa, PermisosIniciativa, TareaIniciativa } from '@v2/shared';
import type { Iniciativa } from '~/lib/queries/iniciativas';

export const iniciativa: Iniciativa = {
  id: 10,
  slug: 'escuela',
  title: 'Horarios de la escuela',
  summary: 'Escuchar a las familias y revisar horarios.',
  kind: 'community',
  planCode: null,
  bodyMarkdown: '',
  coverImageUrl: null,
  status: 'open',
  memberCount: 3,
  revision: 2,
  createdAt: '2026-10-14',
  updatedAt: '2026-10-14',
};
export const permisos: PermisosIniciativa = {
  miembro: true,
  administrar: true,
  propietario: true,
  aceptarTraspaso: false,
};
export const tarea: TareaIniciativa = {
  id: 31,
  titulo: 'Escuchar horarios familiares',
  alcance: 'Conversar sin registrar datos personales.',
  fecha: '2099-01-01',
  hitoId: null,
  revision: 1,
  estado: 'todo',
  firma: null,
  recursos: 'Sala pendiente.',
  escucha: {
    territorioId: null,
    zona: 'Zona escolar',
    metodo: 'conversacion',
    canal: 'mixta',
    convocatoria: 'Invitar también a quienes trabajan de noche.',
    unidad: 'Tres encuentros en zona escolar',
    versionUnidad: '1',
  },
  puedoGestionar: false,
  puedoAceptar: true,
  puedoEditar: false,
  puedoEvidenciar: false,
  derivada: false,
};
export const evidencia: EvidenciaIniciativa = {
  id: 71,
  titulo: 'Resumen de escucha',
  texto: 'Se conversó sobre horarios y quedaron ausencias.',
  url: null,
  revision: 1,
  revisada: false,
  firmaRevision: null,
  notaRevision: null,
  puedoRevisar: true,
  puedoRetirar: false,
  resultadoEscucha: {
    desde: '2026-10-01',
    hasta: '2026-10-03',
    observaciones: 0,
    ausencias: 'Faltan quienes trabajan de noche.',
    limites: 'No describe a todo el barrio.',
    proximoPaso: 'Convocar por la mañana.',
  },
};
