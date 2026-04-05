// Flywheel Integration — Cross-system mappings
// Connects civic assessment archetypes, life areas, and national missions
// into a coherent recommendation engine.

import type { MissionSlug, CitizenRole } from './strategic-initiatives';
import { MISSIONS } from './mission-registry';

// === Archetype → Mission Role ===

export const ARCHETYPE_TO_ROLE: Record<string, CitizenRole> = {
  el_vigia: 'custodio',        // Both: vigilance, accountability
  el_catalizador: 'organizador', // Both: mobilize, coordinate
  el_puente: 'narrador',       // Both: connect through communication
  la_raiz: 'constructor',      // Both: build at the local level
  el_sembrador: 'testigo',     // Both: observe and document
  el_espejo: 'declarante',     // Both: reflect and express truth
};

// === Life Area → Mission ===

export const LIFE_AREA_TO_MISSION: Record<string, MissionSlug> = {
  'Salud': 'la-base-esta',
  'Entorno': 'la-base-esta',
  'Comunidad': 'territorio-legible',
  'Amigos': 'territorio-legible',
  'Carrera': 'produccion-y-suelo-vivo',
  'Dinero': 'produccion-y-suelo-vivo',
  'Crecimiento personal': 'infancia-escuela-cultura',
  'Espiritualidad': 'infancia-escuela-cultura',
  'Amor': 'infancia-escuela-cultura',
  'Familia': 'la-base-esta',
  'Apariencia': 'la-base-esta',
  'Recreación': 'infancia-escuela-cultura',
};

// === Role Labels (Spanish) ===

export const ROLE_LABELS: Record<CitizenRole, string> = {
  testigo: 'Testigo',
  declarante: 'Declarante',
  constructor: 'Constructor',
  custodio: 'Custodio',
  organizador: 'Organizador',
  narrador: 'Narrador',
};

// === Alignment Computation ===

export interface LifeAreaGap {
  area: string;
  current: number;
  desired: number;
  gap: number;
}

export interface MissionAlignment {
  recommendedMission: MissionSlug;
  recommendedMissionLabel: string;
  recommendedMissionNumber: number;
  recommendedRole: CitizenRole;
  recommendedRoleLabel: string;
  reason: string;
  secondaryMission?: MissionSlug;
}

export function computeMissionAlignment(
  archetype: string | null,
  lifeAreaGaps: LifeAreaGap[],
): MissionAlignment {
  // Determine role from archetype
  const role: CitizenRole = (archetype && ARCHETYPE_TO_ROLE[archetype]) || 'testigo';
  const roleLabel = ROLE_LABELS[role];

  // Determine mission from weakest life area
  let missionSlug: MissionSlug = 'instituciones-y-futuro'; // default if all areas strong
  let reason = 'Tus areas de vida estan equilibradas — podes contribuir a nivel institucional.';
  let secondaryMission: MissionSlug | undefined;

  if (lifeAreaGaps.length > 0) {
    // Sort by gap descending (biggest gap = most need)
    const sorted = [...lifeAreaGaps].sort((a, b) => b.gap - a.gap);
    const weakest = sorted[0];

    // Check if all areas are above 60 (meaning generally strong)
    const allStrong = sorted.every(g => g.current >= 60);

    if (!allStrong && weakest.gap > 0) {
      const mapped = LIFE_AREA_TO_MISSION[weakest.area];
      if (mapped) {
        missionSlug = mapped;
        const mission = MISSIONS.find(m => m.slug === mapped);
        reason = `Tu area mas debil es ${weakest.area} (${weakest.current}/100). La ${mission?.label || 'mision'} trabaja exactamente en eso.`;
      }
    }

    // Secondary mission from second weakest area (if different mission)
    if (sorted.length > 1) {
      const secondWeakest = sorted[1];
      const secondMapped = LIFE_AREA_TO_MISSION[secondWeakest.area];
      if (secondMapped && secondMapped !== missionSlug) {
        secondaryMission = secondMapped;
      }
    }
  }

  const mission = MISSIONS.find(m => m.slug === missionSlug);

  return {
    recommendedMission: missionSlug,
    recommendedMissionLabel: mission?.label || missionSlug,
    recommendedMissionNumber: mission?.number || 0,
    recommendedRole: role,
    recommendedRoleLabel: roleLabel,
    reason,
    secondaryMission,
  };
}
