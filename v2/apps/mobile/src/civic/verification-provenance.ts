import type { LocationPrecision, VerificationVerdict } from './types';

export type VerificationMethod =
  | 'saw_now'
  | 'know_place'
  | 'checked_source'
  | 'field_visit'
  | 'cannot_verify';

export interface VerificationMethodOption {
  key: VerificationMethod;
  label: string;
  description: string;
  instruction: string;
  icon: string;
  color: string;
}

export interface VerificationVerdictOption {
  key: VerificationVerdict;
  label: string;
  description: string;
  consequence: string;
  icon: string;
  color: string;
}

export const VERIFICATION_METHODS: VerificationMethodOption[] = [
  {
    key: 'saw_now',
    label: 'Lo estoy viendo ahora',
    description: 'Estoy en el lugar y la situación está ocurriendo.',
    instruction: 'Compará la señal con lo que ves en este momento. No supongas la causa ni completes lo que no podés observar.',
    icon: 'eye-outline',
    color: '#38BDF8',
  },
  {
    key: 'know_place',
    label: 'Conozco el lugar',
    description: 'Tengo experiencia directa y frecuente en esta zona.',
    instruction: 'Respondé desde tu conocimiento directo del lugar. Si sólo lo escuchaste de otra persona, elegí “No tengo cómo comprobarlo”.',
    icon: 'home-outline',
    color: '#A78BFA',
  },
  {
    key: 'checked_source',
    label: 'Consulté una fuente',
    description: 'Contrasté la señal con una fuente vigente e identificable.',
    instruction: 'Verificá que la fuente corresponda a esta situación y siga vigente. No compartas nombres, teléfonos ni documentos personales.',
    icon: 'document-text-outline',
    color: '#FBBF24',
  },
  {
    key: 'field_visit',
    label: 'Hice una visita de campo',
    description: 'Fui especialmente a relevar esta señal.',
    instruction: 'Registrá sólo lo que comprobaste durante la visita. Una foto ayuda, pero no reemplaza el contexto ni el cuidado de las personas.',
    icon: 'walk-outline',
    color: '#34D399',
  },
  {
    key: 'cannot_verify',
    label: 'No tengo cómo comprobarlo',
    description: 'No cuento con una base directa o suficiente.',
    instruction: 'Decir “no puedo verificar” protege el mapa. No baja ni sube la señal: deja constancia de que hace falta otra mirada.',
    icon: 'help-circle-outline',
    color: '#94A3B8',
  },
];

export const VERIFICATION_VERDICTS: VerificationVerdictOption[] = [
  {
    key: 'confirm',
    label: 'Coincide',
    description: 'Comprobé que la señal sigue así.',
    consequence: 'Tu corroboración se suma como una mirada independiente; no prueba por sí sola que el hecho sea definitivo.',
    icon: 'checkmark-circle-outline',
    color: '#34D399',
  },
  {
    key: 'correct',
    label: 'Necesita corrección',
    description: 'El hecho existe, pero algún dato no coincide.',
    consequence: 'La señal vuelve a revisión. Esta acción no edita el relato original ni identifica a quien lo publicó.',
    icon: 'create-outline',
    color: '#FBBF24',
  },
  {
    key: 'duplicate',
    label: 'Está duplicada',
    description: 'Representa la misma situación que otra señal.',
    consequence: 'La marca de posible duplicado permite revisar el mapa sin borrar evidencia de forma automática.',
    icon: 'copy-outline',
    color: '#60A5FA',
  },
  {
    key: 'stale',
    label: 'Ya cambió',
    description: 'Pudo ser cierta, pero dejó de estar vigente.',
    consequence: 'La señal queda marcada como desactualizada para no orientar acciones con información vieja.',
    icon: 'time-outline',
    color: '#C084FC',
  },
  {
    key: 'unsafe',
    label: 'Puede causar daño',
    description: 'Expone a alguien o crea un riesgo de seguridad.',
    consequence: 'La señal se aparta del circuito operativo para revisión de cuidado. No uses esta opción para desacuerdos políticos.',
    icon: 'shield-outline',
    color: '#FB7185',
  },
  {
    key: 'cannot_verify',
    label: 'No puedo verificar',
    description: 'No tengo una base suficiente para decidir.',
    consequence: 'Queda registrada la necesidad de otra mirada, sin presentar incertidumbre como confirmación o rechazo.',
    icon: 'help-circle-outline',
    color: '#94A3B8',
  },
];

const EVIDENCE_LABELS: Record<string, string> = {
  photo: 'foto de campo',
  image: 'imagen',
  document: 'documento',
  source: 'fuente',
  audio: 'audio',
  video: 'video',
  location: 'ubicación',
};

export interface EvidenceSummary {
  count: number;
  types: string[];
  label: string;
}

export const summarizeObservationEvidence = (evidenceJson: string): EvidenceSummary => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(evidenceJson);
  } catch {
    parsed = [];
  }
  if (!Array.isArray(parsed)) return { count: 0, types: [], label: 'Sin evidencia adjunta' };

  const types = [...new Set(parsed.map((item) => {
    if (!item || typeof item !== 'object') return 'evidencia';
    const kind = 'kind' in item && typeof item.kind === 'string' ? item.kind : 'evidence';
    return EVIDENCE_LABELS[kind] ?? 'evidencia';
  }))];

  if (parsed.length === 0) return { count: 0, types: [], label: 'Sin evidencia adjunta' };
  return {
    count: parsed.length,
    types,
    label: `${parsed.length} ${parsed.length === 1 ? 'elemento' : 'elementos'} · ${types.join(', ')}`,
  };
};

export const observationAgeLabel = (observedAt: string, now = new Date()): string => {
  const timestamp = Date.parse(observedAt);
  if (!Number.isFinite(timestamp)) return 'Fecha de observación no disponible';
  const elapsedMinutes = Math.max(0, Math.floor((now.getTime() - timestamp) / 60_000));
  if (elapsedMinutes < 2) return 'Observada recién';
  if (elapsedMinutes < 60) return `Observada hace ${elapsedMinutes} min`;
  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return `Observada hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Observada hace ${days} ${days === 1 ? 'día' : 'días'}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Observada hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `Observada hace ${years} ${years === 1 ? 'año' : 'años'}`;
};

export const publicPrecisionLabel = (precision: LocationPrecision): string => ({
  exact: 'Ubicación pública · punto exacto',
  '100m': 'Ubicación aproximada · radio de 100 m',
  '500m': 'Ubicación aproximada · radio de 500 m',
  neighborhood: 'Ubicación aproximada · escala barrial',
  city: 'Ubicación aproximada · escala ciudad',
}[precision]);

export const verdictsForMethod = (method: VerificationMethod): VerificationVerdictOption[] =>
  method === 'cannot_verify'
    ? VERIFICATION_VERDICTS.filter((option) => option.key === 'cannot_verify')
    : VERIFICATION_VERDICTS;

export const verificationProvenance = (input: {
  method: VerificationMethod;
  verdict: VerificationVerdict;
  observedAt: string;
  verifiedAt?: string;
}) => {
  const verifiedAt = input.verifiedAt ?? new Date().toISOString();
  return {
    note: `provenance/v1;method=${input.method};verdict=${input.verdict}`,
    evidence: [{
      kind: `verification_${input.method}`,
      present: true,
      method: input.method,
      protocolVersion: 1,
      capturedAt: verifiedAt,
      observationObservedAt: input.observedAt,
    }],
  };
};
