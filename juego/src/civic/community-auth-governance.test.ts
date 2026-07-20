import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  communityFetchForUser,
  loginCommunity,
  logoutCommunity,
  resetCommunitySessionAndFeed,
} from './community-auth';

const mocks = vi.hoisted(() => ({
  clearFeed: vi.fn(),
  setFeedEnabled: vi.fn(),
  removeItem: vi.fn(async () => undefined),
  getItem: vi.fn<() => Promise<string | null>>(async () => null),
  setItem: vi.fn<(key: string, value: string) => Promise<void>>(async () => undefined),
  storedValue: null as string | null,
  setSetting: vi.fn(),
  ensureCivicDeviceToken: vi.fn(async () => 'device-proof'),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: mocks.getItem,
    setItem: mocks.setItem,
    removeItem: mocks.removeItem,
  },
}));
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));
vi.mock('react-native', () => ({ Platform: { OS: 'web' } }));
vi.mock('@/db/repos', () => ({ setSetting: mocks.setSetting }));
vi.mock('./config', () => ({
  CIVIC_API_URL: 'https://civic.test',
  CIVIC_FEED_ENABLED_KEY: 'civic_feed_enabled_v1',
}));
vi.mock('./device-auth', () => ({ ensureCivicDeviceToken: mocks.ensureCivicDeviceToken }));
vi.mock('./feed', () => ({ clearOperationalFeed: mocks.clearFeed }));
vi.mock('./sync', () => ({
  setCivicFeedPullEnabled: mocks.setFeedEnabled,
  syncCivicNetwork: vi.fn(),
}));

describe('community session data lifecycle', () => {
  beforeEach(() => {
    mocks.getItem.mockReset();
    mocks.setItem.mockReset();
    mocks.removeItem.mockReset();
    mocks.storedValue = null;
    mocks.getItem.mockImplementation(async () => mocks.storedValue);
    mocks.setItem.mockImplementation(async (_key, value) => { mocks.storedValue = value; });
    mocks.removeItem.mockImplementation(async () => { mocks.storedValue = null; });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists the fail-closed gate before removing a downloaded feed', async () => {
    await resetCommunitySessionAndFeed();

    expect(mocks.setFeedEnabled).toHaveBeenCalledWith(false);
    expect(mocks.setSetting).toHaveBeenCalledWith('civic_feed_enabled_v1', '0');
    expect(mocks.clearFeed).toHaveBeenCalledOnce();
    expect(mocks.removeItem).toHaveBeenCalledWith('basta.community-session.v1');
    expect(mocks.setSetting.mock.invocationCallOrder[0])
      .toBeLessThan(mocks.clearFeed.mock.invocationCallOrder[0]);
  });

  it('liga el token del fetch privado al userId esperado y falla antes de enviar si cambió', async () => {
    mocks.storedValue = JSON.stringify({
      user: { id: 2, username: 'coord', email: 'coord@example.test', name: 'Coord' },
      accessToken: 'token-user-2',
      refreshToken: 'refresh-user-2',
    });
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(communityFetchForUser(2, '/private', { method: 'POST' }))
      .resolves.toMatchObject({ status: 200 });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer token-user-2');

    fetchMock.mockClear();
    await expect(communityFetchForUser(3, '/private', { method: 'POST' }))
      .rejects.toMatchObject({ code: 'AUTH_SESSION_CHANGED' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([200, 401])('no sobrescribe ni borra la cuenta B si el refresh de A termina tarde (HTTP %s)', async (refreshStatus) => {
    const sessionA = {
      user: { id: 2, username: 'a', email: 'a@example.test', name: 'A' },
      accessToken: 'token-a',
      refreshToken: 'refresh-a',
    };
    const sessionB = {
      user: { id: 3, username: 'b', email: 'b@example.test', name: 'B' },
      accessToken: 'token-b',
      refreshToken: 'refresh-b',
    };
    mocks.storedValue = JSON.stringify(sessionA);

    let finishRefresh: ((response: Response) => void) | null = null;
    const refreshPending = new Promise<Response>((resolve) => { finishRefresh = resolve; });
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/private')) return new Response('{}', { status: 401 });
      if (url.endsWith('/api/auth/refresh')) return refreshPending;
      throw new Error(`unexpected ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = communityFetchForUser(2, '/private', { method: 'POST' });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    mocks.storedValue = JSON.stringify(sessionB);
    finishRefresh!(new Response(
      refreshStatus === 200
        ? JSON.stringify({ user: sessionA.user, tokens: { accessToken: 'token-a-2', refreshToken: 'refresh-a-2' } })
        : JSON.stringify({ code: 'INVALID_TOKEN' }),
      { status: refreshStatus, headers: { 'content-type': 'application/json' } },
    ));

    await expect(request).rejects.toMatchObject({ code: 'AUTH_SESSION_CHANGED' });
    expect(JSON.parse(mocks.storedValue!) as unknown).toEqual(sessionB);
  });

  it('un link tardío fallido de A no borra un login B más reciente', async () => {
    const sessionA = {
      user: { id: 2, username: 'a', email: 'a@example.test', name: 'A' },
      accessToken: 'token-a',
      refreshToken: 'refresh-a',
    };
    const sessionB = {
      user: { id: 3, username: 'b', email: 'b@example.test', name: 'B' },
      accessToken: 'token-b',
      refreshToken: 'refresh-b',
    };
    let finishLink: ((response: Response) => void) | null = null;
    const linkPending = new Promise<Response>((resolve) => { finishLink = resolve; });
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/api/login')) {
        return new Response(JSON.stringify({
          user: sessionA.user,
          tokens: { accessToken: sessionA.accessToken, refreshToken: sessionA.refreshToken },
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      if (url.endsWith('/api/v1/civic/devices/link')) return linkPending;
      throw new Error(`unexpected ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const login = loginCommunity('a', 'password');
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    mocks.storedValue = JSON.stringify(sessionB);
    finishLink!(new Response(JSON.stringify({ code: 'LINK_FAILED' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    }));

    await expect(login).rejects.toMatchObject({ code: 'LINK_FAILED' });
    expect(JSON.parse(mocks.storedValue!) as unknown).toEqual(sessionB);
  });

  it('un logout tardío de A no borra ni limpia la sesión B más reciente', async () => {
    mocks.clearFeed.mockClear();
    const sessionA = {
      user: { id: 2, username: 'a', email: 'a@example.test', name: 'A' },
      accessToken: 'token-a',
      refreshToken: 'refresh-a',
    };
    const sessionB = {
      user: { id: 3, username: 'b', email: 'b@example.test', name: 'B' },
      accessToken: 'token-b',
      refreshToken: 'refresh-b',
    };
    mocks.storedValue = JSON.stringify(sessionA);
    let finishUnlink: ((response: Response) => void) | null = null;
    const unlinkPending = new Promise<Response>((resolve) => { finishUnlink = resolve; });
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/api/v1/civic/devices/unlink')) return unlinkPending;
      throw new Error(`unexpected ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    const logout = logoutCommunity(2);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    mocks.storedValue = JSON.stringify(sessionB);
    finishUnlink!(new Response('{}', { status: 200 }));

    await expect(logout).rejects.toMatchObject({ code: 'AUTH_SESSION_CHANGED' });
    expect(JSON.parse(mocks.storedValue!) as unknown).toEqual(sessionB);
    expect(mocks.removeItem).not.toHaveBeenCalled();
    expect(mocks.clearFeed).not.toHaveBeenCalled();
  });
});
