import { describe, expect, it } from 'vitest';

import {
  planTerritorialCoverage,
  pointInCoverageArea,
  summarizeCoverageStatuses,
  type CoverageAreaInput,
} from './coverage';

const rectangle: CoverageAreaInput = {
  type: 'Polygon',
  coordinates: [[
    [-68.85, -32.9],
    [-68.84, -32.9],
    [-68.84, -32.89],
    [-68.85, -32.89],
    [-68.85, -32.9],
  ]],
};

describe('territorial coverage planning', () => {
  it('plans a rectangular GeoJSON polygon with an explicit denominator', () => {
    const plan = planTerritorialCoverage(rectangle, { cellCount: 4 });

    expect(plan.valid).toBe(true);
    expect(plan.cells).toHaveLength(4);
    expect(plan.plannedDenominator).toEqual({ kind: 'planned-cells', value: 4 });
    expect(plan.cells.every((cell) => cell.geometry.coordinates[0].length >= 4)).toBe(true);
    expect(plan.cells.every((cell) => pointInCoverageArea(cell.center, rectangle))).toBe(true);
  });

  it('supports an irregular lasso and keeps every cell vertex inside its territory', () => {
    const lasso: CoverageAreaInput = {
      points: [
        { lat: -32.9, lng: -68.85 },
        { lat: -32.9, lng: -68.84 },
        { lat: -32.895, lng: -68.844 },
        { lat: -32.89, lng: -68.84 },
        { lat: -32.89, lng: -68.85 },
      ],
    };
    const plan = planTerritorialCoverage(lasso, { cellCount: 12 });

    expect(plan.valid).toBe(true);
    expect(plan.cells.length).toBeGreaterThan(0);
    for (const cell of plan.cells) {
      expect(pointInCoverageArea(cell.center, lasso)).toBe(true);
      for (const point of cell.polygon) expect(pointInCoverageArea(point, lasso)).toBe(true);
    }
  });

  it('does not bridge across the empty middle of a concave lasso', () => {
    const concave: CoverageAreaInput = {
      points: [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 0.006 },
        { lat: 0.002, lng: 0.006 },
        { lat: 0.002, lng: 0.002 },
        { lat: 0.004, lng: 0.002 },
        { lat: 0.004, lng: 0.006 },
        { lat: 0.006, lng: 0.006 },
        { lat: 0.006, lng: 0 },
      ],
    };
    const plan = planTerritorialCoverage(concave, { cellCount: 8 });

    expect(plan.cells.length).toBeGreaterThan(0);
    for (const cell of plan.cells) {
      for (let index = 0; index < cell.polygon.length; index += 1) {
        const start = cell.polygon[index]!;
        const end = cell.polygon[(index + 1) % cell.polygon.length]!;
        for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
          expect(
            pointInCoverageArea(
              {
                lat: start.lat + (end.lat - start.lat) * fraction,
                lng: start.lng + (end.lng - start.lng) * fraction,
              },
              concave,
            ),
          ).toBe(true);
        }
      }
    }
  });

  it('uses a requested metric cell size and safely handles polygons smaller than it', () => {
    const plan = planTerritorialCoverage(rectangle, { cellSizeMeters: 5_000 });

    expect(plan.valid).toBe(true);
    expect(plan.cells).toHaveLength(1);
    expect(plan.effectiveCellSizeMeters).toBe(5_000);
    expect(plan.cells[0]!.polygon.every((point) => pointInCoverageArea(point, rectangle))).toBe(true);
  });

  it('returns an empty invalid plan for malformed, self-intersecting, and invalid targets', () => {
    const malformed = planTerritorialCoverage({ points: [{ lat: 0, lng: 0 }] }, { cellCount: 5 });
    const bowTie = planTerritorialCoverage(
      {
        points: [
          { lat: 0, lng: 0 },
          { lat: 1, lng: 1 },
          { lat: 0, lng: 1 },
          { lat: 1, lng: 0 },
        ],
      },
      { cellCount: 5 },
    );
    const badTarget = planTerritorialCoverage(rectangle, { cellSizeMeters: 0 });

    for (const plan of [malformed, bowTie, badTarget]) {
      expect(plan.valid).toBe(false);
      expect(plan.cells).toEqual([]);
      expect(plan.plannedDenominator.value).toBe(0);
      expect(plan.id).toBeNull();
    }
  });

  it('keeps plan and cell IDs stable across closure, rotation, and winding changes', () => {
    const equivalent: CoverageAreaInput = {
      type: 'Polygon',
      coordinates: [[
        [-68.84, -32.89],
        [-68.84, -32.9],
        [-68.85, -32.9],
        [-68.85, -32.89],
      ]],
    };
    const first = planTerritorialCoverage(rectangle, { cellCount: 9, namespace: 'mission-a' });
    const second = planTerritorialCoverage(equivalent, { cellCount: 9, namespace: 'mission-a' });

    expect(second.id).toBe(first.id);
    expect(second.cells.map((cell) => cell.id)).toEqual(first.cells.map((cell) => cell.id));
    expect(second.cells.map((cell) => cell.geometry)).toEqual(first.cells.map((cell) => cell.geometry));
  });

  it('summarizes all statuses against planned cells and never status inputs alone', () => {
    const plan = planTerritorialCoverage(rectangle, { cellCount: 6 });
    expect(plan.cells).toHaveLength(6);
    const [assigned, observed, contested, corroborated, stale] = plan.cells;
    const summary = summarizeCoverageStatuses(plan, [
      { cellId: assigned!.id, status: 'assigned' },
      { cellId: observed!.id, status: 'observed' },
      { cellId: contested!.id, status: 'contested' },
      { cellId: corroborated!.id, status: 'corroborated' },
      { cellId: stale!.id, status: 'stale' },
      { cellId: 'not-in-the-plan', status: 'corroborated' },
    ]);

    expect(summary.counts).toEqual({
      unknown: 1,
      assigned: 1,
      visited_empty: 0,
      observed: 1,
      contested: 1,
      corroborated: 1,
      stale: 1,
    });
    expect(summary.plannedDenominator).toEqual({ kind: 'planned-cells', value: 6 });
    expect(summary.shareOfPlan?.corroborated).toEqual({
      numerator: 1,
      denominator: 6,
      fraction: 1 / 6,
    });
    expect(summary.ignoredCellIds).toEqual(['not-in-the-plan']);

    const noFinding = summarizeCoverageStatuses({ cells: [plan.cells[0]!] }, [
      { cellId: plan.cells[0]!.id, status: 'visited_empty' },
    ]);
    expect(noFinding.counts.visited_empty).toBe(1);
    expect(noFinding.shareOfPlan?.visited_empty.fraction).toBe(1);

    const withoutPlan = summarizeCoverageStatuses({ cells: [] }, [
      { cellId: 'orphan', status: 'corroborated' },
    ]);
    expect(withoutPlan.shareOfPlan).toBeNull();
    expect(withoutPlan.plannedDenominator.value).toBe(0);
  });
});
