import type { ContenidoSintesisNacional } from '@v2/shared';

export const VACIA: ContenidoSintesisNacional = {
  titulo: '',
  alcance: '',
  metodo: '',
  ausencias: '',
  criterio: '',
  proximaRevision: '',
  referencias: [],
};
export const CAMPOS = [
  ['alcance', 'A quiénes comprende', 'Territorios, procesos y personas participantes.'],
  [
    'criterio',
    'Por qué elegiste estos objetivos',
    'Criterio editorial: gravedad, desigualdad, urgencia o viabilidad; documentá tu decisión.',
  ],
  [
    'metodo',
    'Cómo se elaboró',
    'Cómo contrastaron fuentes, diferencias territoriales y argumentos.',
  ],
  [
    'ausencias',
    'Quiénes y qué faltan',
    'Sectores sin escuchar, información ausente y límites de la selección.',
  ],
] as const;
export const DETALLES = [
  ['variantes', 'Diferencias entre territorios'],
  ['recursos', 'Recursos disponibles y limitantes'],
  ['alternativas', 'Alternativas consideradas'],
  ['tensiones', 'Disensos, tensiones y posibles perjudicados'],
  ['tarea', 'Próxima tarea, responsables propuestos y revisión'],
] as const;
