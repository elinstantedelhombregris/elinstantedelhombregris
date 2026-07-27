import type { TerritoryPoint, TerritorySelection } from '@/civic/lasso';
import type { CoverageCell } from '@/civic/coverage';

export interface TerritoryMapProps {
  points: TerritoryPoint[];
  coverageCells?: Pick<CoverageCell, 'id' | 'polygon'>[];
  highlightedPointId?: string | null;
  selectedPointId?: string | null;
  onPointPress?: (pointId: string) => void;
  onSelection: (selection: TerritorySelection | null) => void;
}
