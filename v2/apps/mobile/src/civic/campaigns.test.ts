import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recordCampaignCapture } from './campaigns';

const mocks = vi.hoisted(() => ({
  getActorKey: vi.fn(),
  observationByStarId: vi.fn(),
  createObservation: vi.fn(),
  updateObservationContext: vi.fn(),
  needByObservationId: vi.fn(),
  createNeed: vi.fn(),
  updateNeedContext: vi.fn(),
  publishObservation: vi.fn(),
  missionCellForObservation: vi.fn(),
  completeActiveMissionCell: vi.fn(),
}));

vi.mock('./identity', () => ({ getActorKey: mocks.getActorKey }));
vi.mock('./repo', () => ({
  observationByStarId: mocks.observationByStarId,
  createObservation: mocks.createObservation,
  updateObservationContext: mocks.updateObservationContext,
  needByObservationId: mocks.needByObservationId,
  createNeed: mocks.createNeed,
  updateNeedContext: mocks.updateNeedContext,
  publishObservation: mocks.publishObservation,
}));
vi.mock('./missions', () => ({
  missionCellForObservation: mocks.missionCellForObservation,
  completeActiveMissionCell: mocks.completeActiveMissionCell,
}));

const input = {
  expeditionSlug: 'luminarias',
  starId: 'attempt-as-star',
  data: { estado: 'apagada', urgencia: 4 },
  summary: 'Luminaria apagada',
  coords: { lat: -32.89, lng: -68.84 },
  context: {
    point: { lat: -32.89, lng: -68.84 },
    locationSource: 'gps_current' as const,
    horizontalAccuracyM: 18,
    sharedPrecision: '100m' as const,
    locationLabel: 'Plaza central',
    audience: 'private' as const,
    attributionMode: 'anonymous' as const,
    sensitivity: 'low' as const,
  },
  publish: false,
};

describe('recuperación idempotente de campañas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getActorKey.mockResolvedValue('actor-local');
    mocks.missionCellForObservation.mockReturnValue(null);
    mocks.completeActiveMissionCell.mockReturnValue({ status: 'no_active_cell', cell: null });
  });

  it('reutiliza observación y necesidad si cada inserción alcanzó a persistir antes del error', async () => {
    let observation: Record<string, unknown> | null = null;
    let need: Record<string, unknown> | null = null;
    let observationInterrupted = true;
    let needInterrupted = true;

    mocks.observationByStarId.mockImplementation(() => observation);
    mocks.createObservation.mockImplementation((value: Record<string, unknown>) => {
      observation = { id: 'observation-1', campaignKey: value.campaignKey, creatorKey: 'actor-local' };
      if (observationInterrupted) {
        observationInterrupted = false;
        throw new Error('interrupted_after_observation_insert');
      }
      return observation;
    });
    mocks.needByObservationId.mockImplementation(() => need);
    mocks.createNeed.mockImplementation(() => {
      need = { id: 'need-1', observationId: 'observation-1' };
      if (needInterrupted) {
        needInterrupted = false;
        throw new Error('interrupted_after_need_insert');
      }
      return need;
    });

    await expect(recordCampaignCapture(input)).rejects.toThrow('interrupted_after_observation_insert');
    await expect(recordCampaignCapture(input)).rejects.toThrow('interrupted_after_need_insert');
    await expect(recordCampaignCapture(input)).resolves.toEqual({ status: 'no_active_cell', cell: null });

    expect(mocks.createObservation).toHaveBeenCalledTimes(1);
    expect(mocks.createNeed).toHaveBeenCalledTimes(1);
    expect(mocks.getActorKey).toHaveBeenCalledTimes(1);
    expect(mocks.updateObservationContext).toHaveBeenCalledTimes(2);
    expect(mocks.updateNeedContext).toHaveBeenCalledTimes(1);
    expect(mocks.completeActiveMissionCell).toHaveBeenCalledTimes(1);
  });

  it('recupera una celda ya acreditada y no vuelve a completar la misión', async () => {
    const observation = { id: 'observation-1', campaignKey: 'luminarias-v1', creatorKey: 'actor-local' };
    const need = { id: 'need-1', observationId: 'observation-1' };
    const cell = { id: 'cell-1', observationId: 'observation-1', status: 'observed' };
    let recoveredCell: typeof cell | null = null;
    let firstPublish = true;

    mocks.observationByStarId.mockReturnValue(observation);
    mocks.needByObservationId.mockReturnValue(need);
    mocks.missionCellForObservation.mockImplementation(() => recoveredCell);
    mocks.completeActiveMissionCell.mockImplementation(() => {
      recoveredCell = cell;
      return { status: 'completed', cell };
    });
    mocks.publishObservation.mockImplementation(() => {
      if (firstPublish) {
        firstPublish = false;
        throw new Error('interrupted_after_cell_completion');
      }
      return observation;
    });

    const publishedInput = { ...input, publish: true };
    await expect(recordCampaignCapture(publishedInput)).rejects.toThrow('interrupted_after_cell_completion');
    await expect(recordCampaignCapture(publishedInput)).resolves.toEqual({ status: 'completed', cell });

    expect(mocks.createObservation).not.toHaveBeenCalled();
    expect(mocks.createNeed).not.toHaveBeenCalled();
    expect(mocks.completeActiveMissionCell).toHaveBeenCalledTimes(1);
    expect(mocks.publishObservation).toHaveBeenCalledTimes(2);
  });
});
