import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = {
  status: 'authenticated',
  extendSession: vi.fn<() => Promise<void>>(),
  expireSession: vi.fn<() => Promise<void>>(),
  resetYksiloContextRequest: vi.fn(),
};

const storeHasActiveYksiloSessionMock = vi.fn();
const unregisterCsrfMiddleware = vi.fn();
const resetToolStore = vi.fn();
const resetSuosikitStore = vi.fn();

vi.mock('@/stores/useSessionManagerStore', () => ({
  useSessionManagerStore: {
    getState: () => state,
  },
  isSessionExpiredState: (status: string) => status === 'expired',
  storeHasActiveYksiloSession: (...args: unknown[]) => storeHasActiveYksiloSessionMock(...args),
}));

vi.mock('./csrf', () => ({
  unregisterCsrfMiddleware: () => unregisterCsrfMiddleware(),
}));

vi.mock('@/stores/useToolStore', () => ({
  useToolStore: {
    getState: () => ({
      reset: () => resetToolStore(),
    }),
  },
}));

vi.mock('@/stores/useSuosikitStore', () => ({
  useSuosikitStore: {
    getState: () => ({
      reset: () => resetSuosikitStore(),
    }),
  },
}));

import { sessionExpiredMiddleware } from './sessionExpired';

describe('sessionExpiredMiddleware', () => {
  beforeEach(() => {
    state.status = 'authenticated';
    state.extendSession.mockReset();
    state.extendSession.mockResolvedValue();
    state.expireSession.mockReset();
    state.expireSession.mockResolvedValue();
    state.resetYksiloContextRequest.mockReset();
    storeHasActiveYksiloSessionMock.mockReset();
    unregisterCsrfMiddleware.mockReset();
    resetToolStore.mockReset();
    resetSuosikitStore.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('extends session on 2xx only when active session exists', async () => {
    storeHasActiveYksiloSessionMock.mockReturnValue(true);

    await sessionExpiredMiddleware.onResponse?.({
      response: { status: 200, url: 'https://example.test/yksilo/api/foo' },
    } as never);

    expect(state.extendSession).toHaveBeenCalledOnce();
  });

  it('does not extend session on 2xx when active session is missing', async () => {
    storeHasActiveYksiloSessionMock.mockReturnValue(false);

    await sessionExpiredMiddleware.onResponse?.({
      response: { status: 200, url: 'https://example.test/yksilo/api/foo' },
    } as never);

    expect(state.extendSession).not.toHaveBeenCalled();
  });

  it('ignores configured 403 endpoints even with query parameters', async () => {
    storeHasActiveYksiloSessionMock.mockReturnValue(true);

    await sessionExpiredMiddleware.onResponse?.({
      response: {
        status: 403,
        url: 'https://example.test/yksilo/api/profiili/yksilo?refresh=true',
      },
    } as never);

    expect(state.expireSession).not.toHaveBeenCalled();
    expect(state.resetYksiloContextRequest).not.toHaveBeenCalled();
    expect(unregisterCsrfMiddleware).not.toHaveBeenCalled();
  });

  it('expires and clears state on non-ignored 403', async () => {
    storeHasActiveYksiloSessionMock.mockReturnValue(true);

    await sessionExpiredMiddleware.onResponse?.({
      response: {
        status: 403,
        url: 'https://example.test/yksilo/api/profiili/tavoitteet',
      },
    } as never);

    expect(state.resetYksiloContextRequest).toHaveBeenCalledOnce();
    expect(unregisterCsrfMiddleware).toHaveBeenCalledOnce();
    expect(resetToolStore).toHaveBeenCalledOnce();
    expect(resetSuosikitStore).toHaveBeenCalledOnce();
    expect(state.expireSession).toHaveBeenCalledWith('server-403');
  });
});
