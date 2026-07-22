import type { Urgencia } from './mandato-regimen';
import type { TipoVoz } from '~/components/papel/primitives';

/** Relleno de barra/palito por tipo, EN OSCURO ('valor' usa papel: tinta sobre tinta no se ve — Decisión 8). */
export const RELLENO_TIPO_OSCURO: Record<TipoVoz, string> = {
  basta: 'bg-sello',
  sueño: 'bg-violeta',
  necesidad: 'bg-ambar',
  compromiso: 'bg-verde',
  recurso: 'bg-cian',
  valor: 'bg-papel',
};

/** Borde + texto del tag de urgencia (sobre papel). */
export const CLASE_URGENCIA: Record<Urgencia, string> = {
  crítica: 'border-sello text-sello',
  alta: 'border-ambar text-ambar',
  'cubierta si se organiza': 'border-verde text-verde',
};

export const ORIGEN_SENAL: Record<string, string> = {
  mandato_form: 'formulario del mandato',
  community_post: 'publicación de la comunidad',
  comment: 'comentario',
};

export const ESTADO_PROPUESTA: Record<string, string> = {
  draft: 'en borrador',
  voting: 'en votación',
  accepted: 'aceptada',
  rejected: 'rechazada',
  archived: 'archivada',
};

/** Pasos de la convergencia (§2) y grilla «Cómo se usa» (§5) — copy VERBATIM de la spec. */
export const PASOS_CONVERGENCIA = [
  {
    num: '01',
    titulo: 'La voz entra por el mapa',
    cuerpo: 'Alguien suelta lo que no aguanta, lo que sueña o lo que ofrece. Queda pública desde el primer segundo.',
    link: { href: '/el-mapa', etiqueta: 'El mapa →' },
  },
  {
    num: '02',
    titulo: 'Una máquina la lee',
    cuerpo: 'Un clasificador la suma a su tema y le mide el peso. Sin mesa chica: nadie elige a mano qué pesa.',
  },
  {
    num: '03',
    titulo: 'El documento se reescribe',
    cuerpo: 'Cada voz nueva recalcula el registro, las brechas y el diagnóstico. Esta página es siempre la última revisión.',
  },
] as const;

export const COMO_SE_USA = [
  {
    titulo: 'Se firma',
    cuerpo:
      'Cualquiera que aspire a un cargo puede adherir al documento vigente, en público. La firma no se exige: se registra.',
  },
  {
    titulo: 'Se mide',
    cuerpo:
      'Cada prioridad sale con su número al lado: cuántas voces, de dónde, desde cuándo. Lo que se mide no se relativiza.',
  },
  {
    titulo: 'Se recuerda',
    cuerpo: 'Las voces quedan públicas y el documento a la vista. Lo dicho, dicho está: la memoria es la sanción.',
  },
] as const;
