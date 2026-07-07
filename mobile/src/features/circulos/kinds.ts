import type { CircleGovernance, CircleKind } from '@/api/circulos';

/** Vocabulario de los tipos de círculo — una sola fuente para toda la UI. */
export interface KindDef {
  key: CircleKind;
  label: string;
  /** Nombre de ícono Ionicons */
  icon: string;
  description: string;
}

export const CIRCLE_KINDS: KindDef[] = [
  {
    key: 'territorial',
    label: 'Territorial',
    icon: 'location-outline',
    description: 'La gente de tu barrio, tu ciudad o tu provincia. Se organiza por lugar.',
  },
  {
    key: 'tematica',
    label: 'Temática',
    icon: 'bulb-outline',
    description: 'Una causa o un PLAN que te importa, sin importar dónde vivas.',
  },
  {
    key: 'celula',
    label: 'Célula',
    icon: 'shield-checkmark-outline',
    description:
      'Gente que se conoce y se tiene confianza. Se entra solo con invitación y con nombre real.',
  },
];

export const KIND_MAP: Record<CircleKind, KindDef> = Object.fromEntries(
  CIRCLE_KINDS.map((k) => [k.key, k]),
) as Record<CircleKind, KindDef>;

export interface GovernanceDef {
  key: CircleGovernance;
  label: string;
  description: string;
}

export const GOVERNANCES: GovernanceDef[] = [
  {
    key: 'coordinado',
    label: 'Coordinado',
    description: 'Las campañas las lanzan quienes coordinan. Más orden, decisiones claras.',
  },
  {
    key: 'abierto',
    label: 'Abierto',
    description: 'Cualquier miembro puede lanzar campañas. Más horizontal, más movimiento.',
  },
];
