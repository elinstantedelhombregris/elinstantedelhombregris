import type {
  ListeningHorizon,
  ListeningKind,
  ListeningScope,
  ListeningSource,
  ListeningTheme,
} from './types';

const KIND_LABELS: Record<ListeningKind, string> = {
  need: 'Necesito', dream: 'Sueño', proposal: 'Propongo', capacity: 'Puedo aportar',
};
const THEME_LABELS: Record<ListeningTheme, string> = {
  food: 'Alimentación', housing: 'Vivienda', work: 'Trabajo', care: 'Cuidados',
  health: 'Salud', education: 'Educación', environment: 'Ambiente', mobility: 'Movilidad',
  safety: 'Convivencia', culture: 'Cultura y comunidad', democracy: 'Participación',
};
const HORIZON_LABELS: Record<ListeningHorizon, string> = {
  now: 'Ahora', year: 'Este año', generation: 'Una generación',
};
const SCOPE_LABELS: Record<ListeningScope, string> = {
  personal: 'Mi vida', block: 'Mi cuadra', neighborhood: 'Mi barrio', city: 'Mi ciudad', country: 'El país',
};

export const listeningKindLabel = (key: ListeningKind): string => KIND_LABELS[key];
export const listeningThemeLabel = (key: ListeningTheme): string => THEME_LABELS[key];
export const listeningHorizonLabel = (key: ListeningHorizon): string => HORIZON_LABELS[key];
export const listeningScopeLabel = (key: ListeningScope): string => SCOPE_LABELS[key];

interface PublicFacetSource {
  kind: ListeningKind;
  source: ListeningSource;
  theme: ListeningTheme;
  horizon: ListeningHorizon;
  scope: ListeningScope;
  importance: number;
  supportWanted: boolean;
}

/** Allowlist exhaustiva: cualquier campo privado extra es ignorado. */
export const publicListeningFacet = (row: PublicFacetSource): Record<string, string | number | boolean> => ({
  kind: row.kind,
  source: row.source,
  theme: row.theme,
  horizon: row.horizon,
  scope: row.scope,
  importance: row.importance,
  supportWanted: row.supportWanted,
});

export const listeningPublicPreview = (row: Omit<PublicFacetSource, 'source' | 'supportWanted'>): string => [
  listeningKindLabel(row.kind),
  listeningThemeLabel(row.theme),
  listeningHorizonLabel(row.horizon),
  listeningScopeLabel(row.scope),
  `prioridad ${row.importance}/5`,
].join(' · ');

