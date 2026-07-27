import type { CivicListeningRow } from '@/db/schema';

import { listeningThemeLabel } from './listening-privacy';

export interface ListeningNeedDraftFieldInput {
  quantity?: number | null;
  unit?: string | null;
  urgency?: number;
}

const cleanUnit = (value?: string | null): string | null => value?.trim().slice(0, 120) || null;

/**
 * Proyección controlada de una escucha hacia un pedido. Nunca copia relato,
 * resultado deseado, referente, organización ni vía de contacto.
 */
export const listeningNeedDraftFields = (
  row: Pick<CivicListeningRow, 'theme' | 'importance'>,
  input: ListeningNeedDraftFieldInput,
) => ({
  category: row.theme,
  title: `Necesidad de ${listeningThemeLabel(row.theme)}`,
  description: null,
  quantity: typeof input.quantity === 'number' && Number.isFinite(input.quantity) && input.quantity > 0
    ? input.quantity
    : null,
  unit: cleanUnit(input.unit),
  urgency: Math.max(1, Math.min(5, Math.round(input.urgency ?? row.importance))),
});
