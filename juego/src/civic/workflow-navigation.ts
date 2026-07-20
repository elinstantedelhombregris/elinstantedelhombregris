/**
 * Reglas puras que mantienen honestos los relevos entre pantallas cívicas.
 * No consultan SQLite ni la red: las vistas les entregan el estado que ya
 * conocen y reciben una decisión navegable y testeable.
 */

export type CivicNetworkState = 'checking' | 'local' | 'link_required' | 'connected';

export interface ConnectionEmptyState {
  title: string;
  description: string;
  primary: { label: string; route: '/aportar' | '/circulos' } | null;
  secondary: { label: string; route: '/territorio' | '/mis-datos' } | null;
}

export const connectionEmptyState = (state: CivicNetworkState): ConnectionEmptyState => {
  if (state === 'checking') {
    return {
      title: 'Buscando el otro lado…',
      description: 'Estamos revisando lo que llegó a este dispositivo y lo que todavía espera sincronización.',
      primary: null,
      secondary: null,
    };
  }
  if (state === 'local') {
    return {
      title: 'Podés preparar el terreno, todavía no abrir un puente.',
      description: 'En modo local podés registrar un recurso y conservarlo en este teléfono. La contraparte remota aparecerá recién cuando esta instalación tenga una red cívica configurada y sincronice.',
      primary: { label: 'Preparar un recurso', route: '/aportar' },
      secondary: { label: 'Revisar mis datos', route: '/mis-datos' },
    };
  }
  if (state === 'link_required') {
    return {
      title: 'La red está disponible; falta vincularte.',
      description: 'Vinculá una cuenta para recibir necesidades y recursos de otras personas. Tu bitácora privada no se comparte.',
      primary: { label: 'Vincular mi cuenta', route: '/circulos' },
      secondary: { label: 'Volver al territorio', route: '/territorio' },
    };
  }
  return {
    title: 'Todavía falta el otro lado.',
    description: 'La red está conectada, pero todavía no llegó una contraparte compatible. Podés preparar un aporte concreto o volver más tarde.',
    primary: { label: 'Ofrecer un recurso', route: '/aportar' },
    secondary: { label: 'Volver al territorio', route: '/territorio' },
  };
};

export const unreviewedObservationsForActor = <T extends { id: string }>(
  observations: readonly T[],
  actorKey: string | null,
  verificationsForObservation: (observationId: string) => readonly { verifierKey: string }[],
): T[] => {
  if (!actorKey) return [];
  return observations.filter((observation) =>
    !verificationsForObservation(observation.id).some(
      (verification) => verification.verifierKey === actorKey,
    ));
};

export const missionExpeditionLinkKey = (missionId: string): string => {
  const clean = missionId.trim();
  if (!clean) throw new Error('mission_id_required');
  return `civic.mission-expedition.v1:${clean}`;
};
