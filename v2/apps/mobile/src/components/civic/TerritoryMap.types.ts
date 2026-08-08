import type { LuzCelda } from '@v2/civic-core';

import type { TerritoryPoint, TerritorySelection } from '@/civic/lasso';
import type { CoverageCell } from '@/civic/coverage';

export interface TerritoryMapProps {
  points: TerritoryPoint[];
  coverageCells?: Pick<CoverageCell, 'id' | 'polygon'>[];
  /** La luz por celda. Cuando viene, manda sobre `coverageCells`. */
  luces?: LuzCelda[];
  highlightedPointId?: string | null;
  selectedPointId?: string | null;
  onPointPress?: (pointId: string) => void;
  onSelection: (selection: TerritorySelection | null) => void;
}
