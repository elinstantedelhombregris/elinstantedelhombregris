import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { pullCivicFeed, setCivicFeedPullEnabled } from './sync';

const mocks = vi.hoisted(() => ({
  actorKey: vi.fn(async () => 'actor_local'),
  applyFeed: vi.fn(),
  ensureToken: vi.fn(),
  feedGateDefault: '0',
  feedGateValues: [] as string[],
  getSetting: vi.fn(),
}));

vi.mock('@react-native-community/netinfo', () => ({ default: { addEventListener: vi.fn() } }));
vi.mock('react', () => ({ useEffect: vi.fn() }));
vi.mock('react-native', () => ({
  AppState: { addEventListener: vi.fn() },
  Platform: { OS: 'web' },
}));
vi.mock('@/db/repos', () => ({
  ahoraISO: () => '2026-07-14T12:00:00.000Z',
  getSetting: mocks.getSetting,
  setSetting: vi.fn(),
}));
vi.mock('@/db/client', () => ({ db: {} }));
vi.mock('@/db/schema', () => ({
  civicNeeds: {}, civicObservations: {}, civicResources: {}, syncOutbox: {},
}));
vi.mock('./repo', () => ({ pendingOutbox: vi.fn(() => []) }));
vi.mock('./device-auth', () => ({
  ensureCivicDeviceToken: mocks.ensureToken,
  invalidateCivicDeviceToken: vi.fn(),
}));
vi.mock('./config', () => ({
  CIVIC_API_URL: 'https://civic.example',
  CIVIC_FEED_ENABLED_KEY: 'civic_feed_enabled_v1',
}));
vi.mock('./feed', () => ({
  applyOperationalFeed: mocks.applyFeed,
  isOperationalFeedEvent: vi.fn(),
}));
vi.mock('./identity', () => ({ getActorKey: mocks.actorKey }));
vi.mock('./record-context', () => ({ setRecordContextAudience: vi.fn() }));

describe('operational feed logout gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCivicFeedPullEnabled(true);
    mocks.feedGateDefault = '0';
    mocks.feedGateValues = [];
    mocks.getSetting.mockImplementation((key: string) => key === 'civic_feed_enabled_v1'
      ? mocks.feedGateValues.shift() ?? mocks.feedGateDefault
      : '0');
    mocks.ensureToken.mockResolvedValue('device-token');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not authenticate or fetch after local logout disabled the feed', async () => {
    mocks.feedGateValues = ['0'];
    await expect(pullCivicFeed()).resolves.toEqual({
      received: 0,
      configured: true,
      linked: false,
    });
    expect(mocks.getSetting).toHaveBeenCalledWith('civic_feed_enabled_v1');
    expect(mocks.ensureToken).not.toHaveBeenCalled();
  });

  it('drops a response that arrived after logout while the request was in flight', async () => {
    mocks.feedGateValues = ['1', '0'];
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        contract: 'basta-civic-feed/v1',
        events: [{ entityId: 'must-not-apply' }],
        nextCursor: 1,
        hasMore: false,
      }),
    })));

    await expect(pullCivicFeed()).resolves.toEqual({
      received: 0,
      configured: true,
      linked: false,
    });
    expect(mocks.applyFeed).not.toHaveBeenCalled();
  });

  it('drops an in-flight response even if full local deletion removed the persistent flag', async () => {
    mocks.feedGateDefault = '1';
    mocks.feedGateValues = ['1'];
    let releaseResponse!: () => void;
    const responseReady = new Promise<void>((resolve) => { releaseResponse = resolve; });
    const fetchMock = vi.fn(async () => {
      await responseReady;
      return {
        ok: true,
        json: async () => ({
          contract: 'basta-civic-feed/v1',
          events: [{ entityId: 'must-not-apply' }],
          nextCursor: 1,
          hasMore: false,
        }),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    const pull = pullCivicFeed();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    setCivicFeedPullEnabled(false);
    releaseResponse();

    await expect(pull).resolves.toEqual({
      received: 0,
      configured: true,
      linked: false,
    });
    expect(mocks.applyFeed).not.toHaveBeenCalled();
  });
});
