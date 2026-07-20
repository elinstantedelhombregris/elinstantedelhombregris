import { beforeEach, describe, expect, it, vi } from 'vitest';

import { civicObservations, civicRecordContexts } from '@/db/schema';

import { clearOperationalFeed } from './feed';

const mocks = vi.hoisted(() => ({
  selectResults: [] as unknown[][],
  select: vi.fn(),
  delete: vi.fn(),
  setSetting: vi.fn(),
}));

vi.mock('@/db/client', () => ({
  db: {
    select: mocks.select,
    delete: mocks.delete,
  },
}));

vi.mock('@/db/repos', () => ({
  ahoraISO: () => '2026-07-14T12:00:00.000Z',
  setSetting: mocks.setSetting,
}));

vi.mock('./record-context', () => ({
  recordContextFor: vi.fn(),
  saveRecordContext: vi.fn(),
  setRecordContextAudience: vi.fn(),
}));

describe('operational feed data lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selectResults = [
      [{ id: 'remote-observation' }],
      [],
      [],
    ];
    mocks.select.mockImplementation(() => ({
      from: () => ({
        where: () => ({ all: () => mocks.selectResults.shift() ?? [] }),
      }),
    }));
    mocks.delete.mockImplementation(() => ({
      where: () => ({ run: () => ({ changes: 1 }) }),
    }));
  });

  it('removes geographic passports together with remote projections on logout', () => {
    clearOperationalFeed();

    const deletedTables = mocks.delete.mock.calls.map(([table]) => table);
    expect(deletedTables).toContain(civicRecordContexts);
    expect(deletedTables).toContain(civicObservations);
    expect(mocks.setSetting).toHaveBeenCalledWith('civic_feed_cursor_v1', '0');
  });
});
