import { pointInPolygon } from './lasso';
import type { GeoPoint } from './types';

export type GeoJsonPosition = readonly [longitude: number, latitude: number];
export type GeoJsonLinearRing = readonly GeoJsonPosition[];
export type GeoJsonPolygonCoordinates = readonly GeoJsonLinearRing[];

export interface GeoJsonPolygonInput {
  type: 'Polygon';
  coordinates: GeoJsonPolygonCoordinates;
}

export interface LassoCoverageInput {
  points: readonly GeoPoint[];
}

export type CoverageAreaInput = GeoJsonPolygonInput | LassoCoverageInput;

interface CoverageTargetBase {
  /** Stable IDs may be scoped to a campaign or territorial operation. */
  namespace?: string;
  /** Hard safety limit. The engine increases cell size instead of truncating a plan. */
  maxCells?: number;
}

export interface CellCountCoverageTarget extends CoverageTargetBase {
  cellCount: number;
  cellSizeMeters?: never;
}

export interface CellSizeCoverageTarget extends CoverageTargetBase {
  cellSizeMeters: number;
  cellCount?: never;
}

export type CoverageTarget = CellCountCoverageTarget | CellSizeCoverageTarget;

export type CoverageStatus =
  | 'unknown'
  | 'assigned'
  | 'visited_empty'
  | 'observed'
  | 'contested'
  | 'corroborated'
  | 'stale';

export interface CoverageCellStatusInput {
  cellId: string;
  status: CoverageStatus;
}

export interface CoverageCell {
  id: string;
  row: number;
  column: number;
  center: GeoPoint;
  /** Open ring for direct use by native map polygons. */
  polygon: GeoPoint[];
  /** Closed ring in standard GeoJSON longitude/latitude order. */
  geometry: {
    type: 'Polygon';
    coordinates: [GeoJsonPosition[]];
  };
}

export type CoverageIssueCode =
  | 'invalid-polygon'
  | 'invalid-target'
  | 'target-clamped'
  | 'cell-size-adjusted-to-limit'
  | 'target-approximate'
  | 'holes-excluded-conservatively'
  | 'no-cells';

export interface CoverageIssue {
  code: CoverageIssueCode;
  message: string;
}

export interface CoveragePlan {
  valid: boolean;
  id: string | null;
  cells: CoverageCell[];
  /** The only valid denominator for status shares in this plan. */
  plannedDenominator: {
    kind: 'planned-cells';
    value: number;
  };
  requestedTarget:
    | { kind: 'cell-count'; value: number }
    | { kind: 'cell-size-meters'; value: number };
  effectiveCellSizeMeters: number | null;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null;
  issues: CoverageIssue[];
}

export interface CoverageShare {
  numerator: number;
  denominator: number;
  fraction: number;
}

export interface CoverageStatusSummary {
  plannedDenominator: {
    kind: 'planned-cells';
    value: number;
  };
  counts: Record<CoverageStatus, number>;
  /** Null when no plan exists; shares are never inferred from status inputs alone. */
  shareOfPlan: Record<CoverageStatus, CoverageShare> | null;
  ignoredCellIds: string[];
  duplicateCellIds: string[];
}

interface XYPoint {
  x: number;
  y: number;
}

interface NormalizedTerritory {
  outer: GeoPoint[];
  holes: GeoPoint[][];
  canonical: string;
  bounds: NonNullable<CoveragePlan['bounds']>;
}

interface Projection {
  toXY: (point: GeoPoint) => XYPoint;
  toGeo: (point: XYPoint) => GeoPoint;
}

interface ProjectedTerritory {
  outer: XYPoint[];
  holes: XYPoint[][];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  area: number;
}

interface CellDraft {
  row: number;
  column: number;
  center: GeoPoint;
  polygon: GeoPoint[];
}

interface GridResult {
  sideMeters: number;
  cells: CellDraft[];
}

const METERS_PER_DEGREE_LAT = 111_320;
const DEFAULT_MAX_CELLS = 2_500;
const ABSOLUTE_MAX_CELLS = 10_000;
const MAX_GRID_SLOTS_FACTOR = 12;
const COORDINATE_PRECISION = 9;
const STATUS_VALUES: CoverageStatus[] = [
  'unknown',
  'assigned',
  'visited_empty',
  'observed',
  'contested',
  'corroborated',
  'stale',
];

const isCellCountTarget = (target: CoverageTarget): target is CellCountCoverageTarget =>
  typeof target.cellCount === 'number';

const roundCoordinate = (value: number): number =>
  Number(value.toFixed(COORDINATE_PRECISION));

const samePoint = (a: GeoPoint, b: GeoPoint): boolean =>
  Math.abs(a.lat - b.lat) <= 1e-10 && Math.abs(a.lng - b.lng) <= 1e-10;

const cross = (a: XYPoint, b: XYPoint, c: XYPoint): number =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

const pointOnSegment = (point: GeoPoint, a: GeoPoint, b: GeoPoint): boolean => {
  const xyPoint = { x: point.lng, y: point.lat };
  const xyA = { x: a.lng, y: a.lat };
  const xyB = { x: b.lng, y: b.lat };
  const scale = Math.max(1, Math.abs(xyA.x), Math.abs(xyA.y), Math.abs(xyB.x), Math.abs(xyB.y));
  const tolerance = Number.EPSILON * scale * scale * 64;
  if (Math.abs(cross(xyA, xyB, xyPoint)) > tolerance) return false;
  return (
    xyPoint.x >= Math.min(xyA.x, xyB.x) - tolerance &&
    xyPoint.x <= Math.max(xyA.x, xyB.x) + tolerance &&
    xyPoint.y >= Math.min(xyA.y, xyB.y) - tolerance &&
    xyPoint.y <= Math.max(xyA.y, xyB.y) + tolerance
  );
};

const pointRelationToRing = (point: GeoPoint, ring: GeoPoint[]): 0 | 1 | 2 => {
  for (let index = 0; index < ring.length; index += 1) {
    if (pointOnSegment(point, ring[index]!, ring[(index + 1) % ring.length]!)) return 1;
  }
  return pointInPolygon(point, ring) ? 2 : 0;
};

const pointInNormalizedTerritory = (point: GeoPoint, territory: NormalizedTerritory): boolean => {
  if (pointRelationToRing(point, territory.outer) === 0) return false;
  return territory.holes.every((hole) => pointRelationToRing(point, hole) !== 2);
};

const signedArea = (ring: readonly XYPoint[]): number => {
  let total = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const current = ring[index]!;
    const next = ring[(index + 1) % ring.length]!;
    total += current.x * next.y - next.x * current.y;
  }
  return total / 2;
};

const orientation = (a: XYPoint, b: XYPoint, c: XYPoint): -1 | 0 | 1 => {
  const value = cross(a, b, c);
  const scale = Math.max(
    1,
    Math.abs(a.x),
    Math.abs(a.y),
    Math.abs(b.x),
    Math.abs(b.y),
    Math.abs(c.x),
    Math.abs(c.y),
  );
  const tolerance = Number.EPSILON * scale * scale * 64;
  return Math.abs(value) <= tolerance ? 0 : value > 0 ? 1 : -1;
};

const within = (value: number, a: number, b: number): boolean =>
  value >= Math.min(a, b) - 1e-10 && value <= Math.max(a, b) + 1e-10;

const segmentsIntersect = (a: XYPoint, b: XYPoint, c: XYPoint, d: XYPoint): boolean => {
  const abC = orientation(a, b, c);
  const abD = orientation(a, b, d);
  const cdA = orientation(c, d, a);
  const cdB = orientation(c, d, b);
  if (abC !== abD && cdA !== cdB) return true;
  if (abC === 0 && within(c.x, a.x, b.x) && within(c.y, a.y, b.y)) return true;
  if (abD === 0 && within(d.x, a.x, b.x) && within(d.y, a.y, b.y)) return true;
  if (cdA === 0 && within(a.x, c.x, d.x) && within(a.y, c.y, d.y)) return true;
  return cdB === 0 && within(b.x, c.x, d.x) && within(b.y, c.y, d.y);
};

const hasSelfIntersection = (ring: readonly XYPoint[]): boolean => {
  for (let first = 0; first < ring.length; first += 1) {
    const firstNext = (first + 1) % ring.length;
    for (let second = first + 1; second < ring.length; second += 1) {
      const secondNext = (second + 1) % ring.length;
      if (first === second || firstNext === second || secondNext === first) continue;
      if (first === 0 && secondNext === 0) continue;
      if (segmentsIntersect(ring[first]!, ring[firstNext]!, ring[second]!, ring[secondNext]!)) {
        return true;
      }
    }
  }
  return false;
};

const compareStrings = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

const canonicalizeRing = (ring: GeoPoint[]): GeoPoint[] => {
  const variants: GeoPoint[][] = [];
  for (const candidate of [ring, [...ring].reverse()]) {
    for (let offset = 0; offset < candidate.length; offset += 1) {
      variants.push([...candidate.slice(offset), ...candidate.slice(0, offset)]);
    }
  }
  variants.sort((a, b) =>
    compareStrings(
      a.map((point) => `${point.lng},${point.lat}`).join(';'),
      b.map((point) => `${point.lng},${point.lat}`).join(';'),
    ),
  );
  return variants[0]!;
};

const normalizeRing = (input: readonly GeoPoint[]): GeoPoint[] | null => {
  const points: GeoPoint[] = [];
  for (const point of input) {
    if (
      !Number.isFinite(point.lat) ||
      !Number.isFinite(point.lng) ||
      point.lat < -90 ||
      point.lat > 90 ||
      point.lng < -180 ||
      point.lng > 180
    ) {
      return null;
    }
    const normalized = { lat: roundCoordinate(point.lat), lng: roundCoordinate(point.lng) };
    if (!points.at(-1) || !samePoint(points.at(-1)!, normalized)) points.push(normalized);
  }
  if (points.length > 1 && samePoint(points[0]!, points.at(-1)!)) points.pop();
  if (points.length < 3) return null;
  const xy = points.map((point) => ({ x: point.lng, y: point.lat }));
  if (Math.abs(signedArea(xy)) <= Number.EPSILON || hasSelfIntersection(xy)) return null;
  return canonicalizeRing(points);
};

const ringsIntersect = (a: GeoPoint[], b: GeoPoint[]): boolean => {
  for (let first = 0; first < a.length; first += 1) {
    const a1 = { x: a[first]!.lng, y: a[first]!.lat };
    const a2Point = a[(first + 1) % a.length]!;
    const a2 = { x: a2Point.lng, y: a2Point.lat };
    for (let second = 0; second < b.length; second += 1) {
      const b1 = { x: b[second]!.lng, y: b[second]!.lat };
      const b2Point = b[(second + 1) % b.length]!;
      const b2 = { x: b2Point.lng, y: b2Point.lat };
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
};

const normalizeTerritory = (input: CoverageAreaInput): NormalizedTerritory | null => {
  const sourceRings: GeoPoint[][] =
    'points' in input
      ? [[...input.points]]
      : input.coordinates.map((ring) =>
          ring.map(([lng, lat]) => ({ lat, lng })),
        );
  if (sourceRings.length === 0) return null;
  const outer = normalizeRing(sourceRings[0]!);
  if (!outer) return null;
  const holes: GeoPoint[][] = [];
  for (const source of sourceRings.slice(1)) {
    const hole = normalizeRing(source);
    if (
      !hole ||
      pointRelationToRing(hole[0]!, outer) !== 2 ||
      ringsIntersect(outer, hole) ||
      holes.some(
        (existing) =>
          ringsIntersect(existing, hole) ||
          pointRelationToRing(hole[0]!, existing) !== 0 ||
          pointRelationToRing(existing[0]!, hole) !== 0,
      )
    ) {
      return null;
    }
    holes.push(hole);
  }
  holes.sort((a, b) =>
    compareStrings(
      a.map((point) => `${point.lng},${point.lat}`).join(';'),
      b.map((point) => `${point.lng},${point.lat}`).join(';'),
    ),
  );
  const allLongitudes = outer.map((point) => point.lng);
  if (Math.max(...allLongitudes) - Math.min(...allLongitudes) > 180) return null;
  const latitudes = outer.map((point) => point.lat);
  const bounds = {
    north: Math.max(...latitudes),
    south: Math.min(...latitudes),
    east: Math.max(...allLongitudes),
    west: Math.min(...allLongitudes),
  };
  const canonical = [outer, ...holes]
    .map((ring) => ring.map((point) => `${point.lng},${point.lat}`).join(';'))
    .join('|');
  return { outer, holes, canonical, bounds };
};

/** Boundary-inclusive hit test for the same Polygon/lasso inputs accepted by the planner. */
export const pointInCoverageArea = (point: GeoPoint, input: CoverageAreaInput): boolean => {
  const territory = normalizeTerritory(input);
  return territory ? pointInNormalizedTerritory(point, territory) : false;
};

const createProjection = (territory: NormalizedTerritory): Projection => {
  const referenceLatitude = (territory.bounds.north + territory.bounds.south) / 2;
  const longitudeScale = Math.max(0.01, Math.cos((referenceLatitude * Math.PI) / 180));
  return {
    toXY: (point) => ({
      x: point.lng * METERS_PER_DEGREE_LAT * longitudeScale,
      y: point.lat * METERS_PER_DEGREE_LAT,
    }),
    toGeo: (point) => ({
      lat: roundCoordinate(point.y / METERS_PER_DEGREE_LAT),
      lng: roundCoordinate(point.x / (METERS_PER_DEGREE_LAT * longitudeScale)),
    }),
  };
};

const projectTerritory = (
  territory: NormalizedTerritory,
  projection: Projection,
): ProjectedTerritory => {
  const outer = territory.outer.map(projection.toXY);
  const holes = territory.holes.map((ring) => ring.map(projection.toXY));
  const xs = outer.map((point) => point.x);
  const ys = outer.map((point) => point.y);
  return {
    outer,
    holes,
    bounds: {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    },
    area:
      Math.abs(signedArea(outer)) -
      holes.reduce((total, hole) => total + Math.abs(signedArea(hole)), 0),
  };
};

type ClipBoundary = 'left' | 'right' | 'bottom' | 'top';

const clipRing = (
  ring: XYPoint[],
  rectangle: { minX: number; minY: number; maxX: number; maxY: number },
): XYPoint[] => {
  let output = ring;
  const boundaries: ClipBoundary[] = ['left', 'right', 'bottom', 'top'];
  const inside = (point: XYPoint, boundary: ClipBoundary): boolean => {
    if (boundary === 'left') return point.x >= rectangle.minX - 1e-7;
    if (boundary === 'right') return point.x <= rectangle.maxX + 1e-7;
    if (boundary === 'bottom') return point.y >= rectangle.minY - 1e-7;
    return point.y <= rectangle.maxY + 1e-7;
  };
  const intersection = (a: XYPoint, b: XYPoint, boundary: ClipBoundary): XYPoint => {
    if (boundary === 'left' || boundary === 'right') {
      const x = boundary === 'left' ? rectangle.minX : rectangle.maxX;
      const t = Math.abs(b.x - a.x) < 1e-12 ? 0 : (x - a.x) / (b.x - a.x);
      return { x, y: a.y + t * (b.y - a.y) };
    }
    const y = boundary === 'bottom' ? rectangle.minY : rectangle.maxY;
    const t = Math.abs(b.y - a.y) < 1e-12 ? 0 : (y - a.y) / (b.y - a.y);
    return { x: a.x + t * (b.x - a.x), y };
  };
  for (const boundary of boundaries) {
    const input = output;
    output = [];
    if (input.length === 0) break;
    let previous = input.at(-1)!;
    for (const current of input) {
      const currentInside = inside(current, boundary);
      const previousInside = inside(previous, boundary);
      if (currentInside) {
        if (!previousInside) output.push(intersection(previous, current, boundary));
        output.push(current);
      } else if (previousInside) {
        output.push(intersection(previous, current, boundary));
      }
      previous = current;
    }
  }
  const deduplicated: XYPoint[] = [];
  for (const point of output) {
    const previous = deduplicated.at(-1);
    if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > 1e-6) {
      deduplicated.push(point);
    }
  }
  if (
    deduplicated.length > 1 &&
    Math.hypot(
      deduplicated[0]!.x - deduplicated.at(-1)!.x,
      deduplicated[0]!.y - deduplicated.at(-1)!.y,
    ) <= 1e-6
  ) {
    deduplicated.pop();
  }
  return deduplicated;
};

const pointRelationToXYRing = (point: XYPoint, ring: XYPoint[]): 0 | 1 | 2 => {
  const asGeo = ring.map((entry) => ({ lat: entry.y, lng: entry.x }));
  return pointRelationToRing({ lat: point.y, lng: point.x }, asGeo);
};

const pointInProjectedTerritory = (point: XYPoint, territory: ProjectedTerritory): boolean =>
  pointRelationToXYRing(point, territory.outer) !== 0 &&
  territory.holes.every((hole) => pointRelationToXYRing(point, hole) !== 2);

const segmentBoundaryParameters = (
  start: XYPoint,
  end: XYPoint,
  boundaryStart: XYPoint,
  boundaryEnd: XYPoint,
): number[] => {
  const segment = { x: end.x - start.x, y: end.y - start.y };
  const boundary = {
    x: boundaryEnd.x - boundaryStart.x,
    y: boundaryEnd.y - boundaryStart.y,
  };
  const offset = { x: boundaryStart.x - start.x, y: boundaryStart.y - start.y };
  const denominator = segment.x * boundary.y - segment.y * boundary.x;
  const numerator = offset.x * segment.y - offset.y * segment.x;
  if (Math.abs(denominator) > 1e-10) {
    const t = (offset.x * boundary.y - offset.y * boundary.x) / denominator;
    const u = numerator / denominator;
    return t >= -1e-9 && t <= 1 + 1e-9 && u >= -1e-9 && u <= 1 + 1e-9
      ? [Math.min(1, Math.max(0, t))]
      : [];
  }
  if (Math.abs(offset.x * segment.y - offset.y * segment.x) > 1e-8) return [];
  const lengthSquared = segment.x * segment.x + segment.y * segment.y;
  if (lengthSquared <= 1e-12) return [];
  return [boundaryStart, boundaryEnd]
    .map(
      (point) =>
        ((point.x - start.x) * segment.x + (point.y - start.y) * segment.y) / lengthSquared,
    )
    .filter((value) => value >= -1e-9 && value <= 1 + 1e-9)
    .map((value) => Math.min(1, Math.max(0, value)));
};

/**
 * A clipped concave polygon can contain an artificial bridge when one grid
 * rectangle intersects disconnected lobes. Split each candidate edge at every
 * territorial boundary crossing and test every interval, so those bridges are
 * omitted instead of claiming land outside the lasso.
 */
const segmentWithinTerritory = (
  start: XYPoint,
  end: XYPoint,
  territory: ProjectedTerritory,
): boolean => {
  const parameters = [0, 1];
  for (const ring of [territory.outer, ...territory.holes]) {
    for (let index = 0; index < ring.length; index += 1) {
      parameters.push(
        ...segmentBoundaryParameters(start, end, ring[index]!, ring[(index + 1) % ring.length]!),
      );
    }
  }
  parameters.sort((a, b) => a - b);
  const unique = parameters.filter(
    (value, index) => index === 0 || Math.abs(value - parameters[index - 1]!) > 1e-8,
  );
  for (let index = 0; index < unique.length; index += 1) {
    const current = unique[index]!;
    const next = unique[index + 1];
    const probes = next === undefined ? [current] : [current, (current + next) / 2];
    for (const t of probes) {
      if (
        !pointInProjectedTerritory(
          { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t },
          territory,
        )
      ) {
        return false;
      }
    }
  }
  return true;
};

const ringsOverlapXY = (a: XYPoint[], b: XYPoint[]): boolean => {
  if (a.some((point) => pointRelationToXYRing(point, b) !== 0)) return true;
  if (b.some((point) => pointRelationToXYRing(point, a) !== 0)) return true;
  for (let first = 0; first < a.length; first += 1) {
    for (let second = 0; second < b.length; second += 1) {
      if (
        segmentsIntersect(
          a[first]!,
          a[(first + 1) % a.length]!,
          b[second]!,
          b[(second + 1) % b.length]!,
        )
      ) {
        return true;
      }
    }
  }
  return false;
};

const polygonCentroid = (ring: XYPoint[]): XYPoint => {
  const areaFactor = signedArea(ring) * 6;
  if (Math.abs(areaFactor) < 1e-10) {
    return {
      x: ring.reduce((total, point) => total + point.x, 0) / ring.length,
      y: ring.reduce((total, point) => total + point.y, 0) / ring.length,
    };
  }
  let x = 0;
  let y = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const current = ring[index]!;
    const next = ring[(index + 1) % ring.length]!;
    const factor = current.x * next.y - next.x * current.y;
    x += (current.x + next.x) * factor;
    y += (current.y + next.y) * factor;
  }
  return { x: x / areaFactor, y: y / areaFactor };
};

const findCellCenter = (
  ring: XYPoint[],
  territory: NormalizedTerritory,
  projection: Projection,
): GeoPoint => {
  const centroid = polygonCentroid(ring);
  const centroidGeo = projection.toGeo(centroid);
  if (pointInNormalizedTerritory(centroidGeo, territory)) return centroidGeo;
  const xs = ring.map((point) => point.x);
  const ys = ring.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  for (let resolution = 3; resolution <= 15; resolution += 2) {
    for (let row = 1; row < resolution; row += 1) {
      for (let column = 1; column < resolution; column += 1) {
        const candidate = projection.toGeo({
          x: minX + ((maxX - minX) * column) / resolution,
          y: minY + ((maxY - minY) * row) / resolution,
        });
        if (
          pointRelationToXYRing(projection.toXY(candidate), ring) !== 0 &&
          pointInNormalizedTerritory(candidate, territory)
        ) {
          return candidate;
        }
      }
    }
  }
  return projection.toGeo(ring[0]!);
};

const buildGrid = (
  sideMeters: number,
  territory: NormalizedTerritory,
  projected: ProjectedTerritory,
  projection: Projection,
  maxCells: number,
): GridResult => {
  const width = projected.bounds.maxX - projected.bounds.minX;
  const height = projected.bounds.maxY - projected.bounds.minY;
  let effectiveSide = sideMeters;
  const maxGridSlots = maxCells * MAX_GRID_SLOTS_FACTOR;
  let columns = Math.max(1, Math.ceil(width / effectiveSide));
  let rows = Math.max(1, Math.ceil(height / effectiveSide));
  if (rows * columns > maxGridSlots) {
    effectiveSide *= Math.sqrt((rows * columns) / maxGridSlots) * 1.001;
    columns = Math.max(1, Math.ceil(width / effectiveSide));
    rows = Math.max(1, Math.ceil(height / effectiveSide));
  }
  const cells: CellDraft[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const rectangle = {
        minX: projected.bounds.minX + column * effectiveSide,
        minY: projected.bounds.minY + row * effectiveSide,
        maxX: Math.min(projected.bounds.minX + (column + 1) * effectiveSide, projected.bounds.maxX),
        maxY: Math.min(projected.bounds.minY + (row + 1) * effectiveSide, projected.bounds.maxY),
      };
      const clipped = clipRing(projected.outer, rectangle);
      if (
        clipped.length < 3 ||
        Math.abs(signedArea(clipped)) < 1e-4 ||
        hasSelfIntersection(clipped) ||
        projected.holes.some((hole) => ringsOverlapXY(clipped, hole)) ||
        clipped.some(
          (point, index) =>
            !segmentWithinTerritory(point, clipped[(index + 1) % clipped.length]!, projected),
        )
      ) {
        continue;
      }
      const polygon = clipped.map(projection.toGeo);
      if (!polygon.every((point) => pointInNormalizedTerritory(point, territory))) continue;
      cells.push({
        row,
        column,
        center: findCellCenter(clipped, territory, projection),
        polygon,
      });
    }
  }
  return { sideMeters: effectiveSide, cells };
};

const stableHash = (value: string): string => {
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    first ^= code;
    first = Math.imul(first, 0x01000193);
    second ^= code + index;
    second = Math.imul(second, 0x85ebca6b);
  }
  return `${(first >>> 0).toString(16).padStart(8, '0')}${(second >>> 0)
    .toString(16)
    .padStart(8, '0')}`;
};

const invalidPlan = (
  target: CoverageTarget,
  code: 'invalid-polygon' | 'invalid-target',
  message: string,
): CoveragePlan => ({
  valid: false,
  id: null,
  cells: [],
  plannedDenominator: { kind: 'planned-cells', value: 0 },
  requestedTarget:
    isCellCountTarget(target)
      ? { kind: 'cell-count', value: target.cellCount }
      : { kind: 'cell-size-meters', value: target.cellSizeMeters },
  effectiveCellSizeMeters: null,
  bounds: null,
  issues: [{ code, message }],
});

const chooseCountGrid = (
  targetCount: number,
  territory: NormalizedTerritory,
  projected: ProjectedTerritory,
  projection: Projection,
  maxCells: number,
): GridResult => {
  const width = projected.bounds.maxX - projected.bounds.minX;
  const height = projected.bounds.maxY - projected.bounds.minY;
  let side = targetCount === 1 ? Math.max(width, height) : Math.sqrt(projected.area / targetCount);
  side = Math.max(side, 0.01);
  const candidates: GridResult[] = [];
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const result = buildGrid(side, territory, projected, projection, maxCells);
    candidates.push(result);
    if (result.cells.length === targetCount) break;
    if (result.cells.length === 0) {
      side *= 0.6;
    } else {
      const factor = Math.sqrt(result.cells.length / targetCount);
      side *= Math.min(1.7, Math.max(0.65, factor));
    }
  }
  candidates.sort((a, b) => {
    const distance = Math.abs(a.cells.length - targetCount) - Math.abs(b.cells.length - targetCount);
    if (distance !== 0) return distance;
    if ((a.cells.length <= targetCount) !== (b.cells.length <= targetCount)) {
      return a.cells.length <= targetCount ? -1 : 1;
    }
    return a.sideMeters - b.sideMeters;
  });
  return candidates[0]!;
};

/**
 * Builds a deterministic plan of bounded territorial cells. A requested count
 * is a sizing target, not a fabricated denominator: the returned cell count is
 * the plan's explicit denominator, even when an irregular polygon makes the
 * requested count only approximate.
 */
export const planTerritorialCoverage = (
  input: CoverageAreaInput,
  target: CoverageTarget,
): CoveragePlan => {
  const requestedValue = isCellCountTarget(target) ? target.cellCount : target.cellSizeMeters;
  if (!Number.isFinite(requestedValue) || requestedValue <= 0) {
    return invalidPlan(target, 'invalid-target', 'Cell count or size must be a positive finite number.');
  }
  const territory = normalizeTerritory(input);
  if (!territory) {
    return invalidPlan(target, 'invalid-polygon', 'The polygon must be finite, simple, and non-degenerate.');
  }
  const projection = createProjection(territory);
  const projected = projectTerritory(territory, projection);
  if (!Number.isFinite(projected.area) || projected.area <= 1e-6) {
    return invalidPlan(target, 'invalid-polygon', 'The polygon has no usable territorial area.');
  }

  const issues: CoverageIssue[] = [];
  const requestedMax = Number.isFinite(target.maxCells) ? Math.floor(target.maxCells!) : DEFAULT_MAX_CELLS;
  const maxCells = Math.min(ABSOLUTE_MAX_CELLS, Math.max(1, requestedMax));
  let grid: GridResult;
  let intendedCount: number | null = null;
  if (isCellCountTarget(target)) {
    const requestedCount = Math.max(1, Math.round(target.cellCount));
    intendedCount = Math.min(requestedCount, maxCells);
    if (requestedCount !== intendedCount || target.cellCount !== requestedCount) {
      issues.push({
        code: 'target-clamped',
        message: `The requested count was normalized to ${intendedCount} planned cells.`,
      });
    }
    grid = chooseCountGrid(intendedCount, territory, projected, projection, maxCells);
  } else {
    grid = buildGrid(target.cellSizeMeters, territory, projected, projection, maxCells);
    let attempts = 0;
    while (grid.cells.length > maxCells && attempts < 10) {
      const nextSide = grid.sideMeters * Math.sqrt(grid.cells.length / maxCells) * 1.01;
      grid = buildGrid(nextSide, territory, projected, projection, maxCells);
      attempts += 1;
    }
    if (Math.abs(grid.sideMeters - target.cellSizeMeters) > 1e-6) {
      issues.push({
        code: 'cell-size-adjusted-to-limit',
        message: `Cell size increased to ${Math.round(grid.sideMeters)} m to respect the plan limit.`,
      });
    }
  }

  while (grid.cells.length > maxCells) {
    grid = buildGrid(grid.sideMeters * 1.1, territory, projected, projection, maxCells);
  }
  if (intendedCount !== null && grid.cells.length !== intendedCount) {
    issues.push({
      code: 'target-approximate',
      message: `Irregular boundaries produced ${grid.cells.length} safe cells for a target of ${intendedCount}.`,
    });
  }
  if (territory.holes.length > 0) {
    issues.push({
      code: 'holes-excluded-conservatively',
      message: 'Cells touching an interior exclusion were omitted rather than overstating coverage.',
    });
  }
  if (grid.cells.length === 0) {
    issues.push({
      code: 'no-cells',
      message: 'No safely bounded cells fit this polygon and target.',
    });
  }

  const namespace = target.namespace?.trim() || 'territory';
  const planHash = stableHash(`${namespace}|${territory.canonical}|${grid.sideMeters.toFixed(6)}`);
  const cells = grid.cells.map((draft) => {
    const closedPositions: GeoJsonPosition[] = draft.polygon.map(
      (point) => [point.lng, point.lat] as GeoJsonPosition,
    );
    closedPositions.push(closedPositions[0]!);
    return {
      id: `cell_${planHash}_${draft.row.toString(36)}_${draft.column.toString(36)}`,
      row: draft.row,
      column: draft.column,
      center: draft.center,
      polygon: draft.polygon,
      geometry: { type: 'Polygon' as const, coordinates: [closedPositions] as [GeoJsonPosition[]] },
    };
  });

  return {
    valid: true,
    id: `coverage_${planHash}`,
    cells,
    plannedDenominator: { kind: 'planned-cells', value: cells.length },
    requestedTarget:
      isCellCountTarget(target)
        ? { kind: 'cell-count', value: target.cellCount }
        : { kind: 'cell-size-meters', value: target.cellSizeMeters },
    effectiveCellSizeMeters: grid.sideMeters,
    bounds: territory.bounds,
    issues,
  };
};

/** Summarizes only cells in an explicit plan; unknown inputs cannot inflate a share. */
export const summarizeCoverageStatuses = (
  plan: Pick<CoveragePlan, 'cells'>,
  inputs: readonly CoverageCellStatusInput[],
): CoverageStatusSummary => {
  const plannedIds = new Set(plan.cells.map((cell) => cell.id));
  const statuses = new Map<string, CoverageStatus>();
  const ignored = new Set<string>();
  const duplicates = new Set<string>();
  for (const input of inputs) {
    if (!plannedIds.has(input.cellId) || !STATUS_VALUES.includes(input.status)) {
      ignored.add(input.cellId);
      continue;
    }
    if (statuses.has(input.cellId)) duplicates.add(input.cellId);
    statuses.set(input.cellId, input.status);
  }
  const counts: Record<CoverageStatus, number> = {
    unknown: 0,
    assigned: 0,
    visited_empty: 0,
    observed: 0,
    contested: 0,
    corroborated: 0,
    stale: 0,
  };
  for (const cell of plan.cells) counts[statuses.get(cell.id) ?? 'unknown'] += 1;
  const denominator = plan.cells.length;
  const shareOfPlan =
    denominator === 0
      ? null
      : Object.fromEntries(
          STATUS_VALUES.map((status) => [
            status,
            { numerator: counts[status], denominator, fraction: counts[status] / denominator },
          ]),
        ) as Record<CoverageStatus, CoverageShare>;
  return {
    plannedDenominator: { kind: 'planned-cells', value: denominator },
    counts,
    shareOfPlan,
    ignoredCellIds: [...ignored].sort(compareStrings),
    duplicateCellIds: [...duplicates].sort(compareStrings),
  };
};
