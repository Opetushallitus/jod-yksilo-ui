import { registerCsrfMiddleware, unregisterCsrfMiddleware } from '@/api/middlewares/csrf';
import type { components } from '@/api/schema';
import { resetWelcomePathGate } from '@/auth/welcomePathGate';
import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';

export type YksiloCsrfDto = components['schemas']['YksiloCsrfDto'];
export type YksiloLoaderContext = YksiloCsrfDto | null;

type SessionStatus = 'anonymous' | 'authenticated' | 'warning' | 'recovering' | 'expired';
type SessionEvent = 'session:authenticated' | 'session:extended' | 'session:expired' | 'session:logout';
type SessionExpireReason = 'timer' | 'server-403' | 'logout' | 'manual' | 'validation-failed';

interface SessionManagerState {
  sessionStartTime?: number;
  sessionLengthMs: number;
  warningThresholdMs: number;
  status: SessionStatus;
  csrf?: components['schemas']['CsrfTokenDto'];
  user?: { etunimi?: string; sukunimi?: string };
  lastValidatedAt?: number;
  disabled: boolean;
  onWarning?: () => void;
  onExpired?: (reason?: SessionExpireReason) => void | Promise<void>;
  onSessionExtended?: () => void;
  setOnWarning: (callback?: () => void) => void;
  setOnExpired: (callback?: (reason?: SessionExpireReason) => void | Promise<void>) => void;
  setOnSessionExtended: (callback?: () => void) => void;
  start: () => void;
  stop: () => void;
  disable: () => void;
  extendSession: () => Promise<void> | void;
  initializeFromLoader: (data?: YksiloLoaderContext) => void;
  /** GET `/yksilo/api/profiili/yksilo`, then updates store (CSRF, user, timers). */
  syncYksiloFromServer: (force?: boolean) => Promise<YksiloLoaderContext>;
  resetYksiloContextRequest: () => void;
  validateSession: (force?: boolean) => Promise<boolean>;
  expireSession: (reason?: SessionExpireReason) => Promise<void>;
}

const SESSION_SYNC_CHANNEL = 'jod-session-sync';
const SESSION_SYNC_TAB_ID = globalThis.crypto.randomUUID();
const SESSION_LENGTH_MS = 30 * 60 * 1000; // 30 min
const SESSION_WARNING_THRESHOLD_MS = 25 * 60 * 1000; // 25 min

export const useSessionManagerStore = create<SessionManagerState>()((set, get) => {
  let warningShown = false;
  let intervalId: ReturnType<typeof setInterval> | undefined;
  let isSyncInitialized = false;
  let sessionSyncChannel: BroadcastChannel | undefined;
  let yksiloContextPromise: Promise<YksiloLoaderContext> | undefined;
  let visibilityHandler: (() => void) | undefined;

  const getTimeSinceSessionStarted = () => {
    const { sessionStartTime } = get();
    return sessionStartTime ? Date.now() - sessionStartTime : 0;
  };

  const fetchYksiloContext = async (force = false) => {
    if (force) {
      yksiloContextPromise = undefined;
    }
    yksiloContextPromise ??= (async () => {
      const response = await fetch('/yksilo/api/profiili/yksilo', {
        method: 'GET',
        credentials: 'same-origin',
      });
      if (!response.ok) {
        return null;
      }
      const data = (await response.json()) as components['schemas']['YksiloCsrfDto'] | null;
      return data ?? null;
    })();
    try {
      return await yksiloContextPromise;
    } finally {
      // Keep request deduplication short-lived to avoid stale cache.
      yksiloContextPromise = undefined;
    }
  };

  const emitSessionEvent = (event: SessionEvent) => {
    if (!sessionSyncChannel) {
      return;
    }
    sessionSyncChannel.postMessage({ tabId: SESSION_SYNC_TAB_ID, event, timestamp: Date.now() });
  };

  const ensureSessionSyncChannel = () => {
    if (isSyncInitialized || typeof BroadcastChannel === 'undefined') {
      return;
    }
    isSyncInitialized = true;
    sessionSyncChannel = new BroadcastChannel(SESSION_SYNC_CHANNEL);
    sessionSyncChannel.onmessage = (messageEvent: MessageEvent<{ tabId?: string; event?: SessionEvent }>) => {
      const payload = messageEvent.data;
      if (!payload || payload.tabId === SESSION_SYNC_TAB_ID) {
        return;
      }

      if (payload.event === 'session:expired' || payload.event === 'session:logout') {
        const reason: SessionExpireReason = payload.event === 'session:logout' ? 'logout' : 'manual';
        const prevStatus = get().status;
        get().stop();
        warningShown = false;
        unregisterCsrfMiddleware();
        resetWelcomePathGate();
        set({
          status: reason === 'logout' ? 'anonymous' : 'expired',
          disabled: reason !== 'logout',
          sessionStartTime: undefined,
          lastValidatedAt: undefined,
          csrf: undefined,
          user: undefined,
        });
        if (reason === 'logout' || prevStatus !== 'expired') {
          void (async () => {
            await get().onExpired?.(reason);
          })();
        }
        return;
      }

      if (payload.event === 'session:authenticated') {
        void (async () => {
          const data = await fetchYksiloContext(true);
          if (!data?.csrf) {
            return;
          }
          warningShown = false;
          registerCsrfMiddleware(data.csrf);
          set({
            status: 'authenticated',
            disabled: false,
            sessionStartTime: Date.now(),
            csrf: data.csrf,
            user: { etunimi: data.etunimi, sukunimi: data.sukunimi },
            lastValidatedAt: Date.now(),
          });
          get().start();
          get().onSessionExtended?.();
        })();
        return;
      }

      if (payload.event === 'session:extended') {
        const s = get();
        const loggedIn = s.status === 'authenticated' || s.status === 'warning' || s.status === 'recovering';
        if (!loggedIn || !s.csrf) {
          return;
        }
        warningShown = false;
        set({
          status: 'authenticated',
          disabled: false,
          sessionStartTime: Date.now(),
        });
        get().start();
        get().onSessionExtended?.();
      }
    };
  };

  return {
    sessionStartTime: undefined,
    sessionLengthMs: SESSION_LENGTH_MS,
    warningThresholdMs: SESSION_WARNING_THRESHOLD_MS,
    status: 'anonymous',
    csrf: undefined,
    user: undefined,
    lastValidatedAt: undefined,
    disabled: false,
    onWarning: undefined,
    onExpired: undefined,
    onSessionExtended: undefined,
    setOnWarning: (callback) => set({ onWarning: callback }),
    setOnExpired: (callback) => set({ onExpired: callback }),
    setOnSessionExtended: (callback) => set({ onSessionExtended: callback }),
    start: () => {
      ensureSessionSyncChannel();
      const state = get();
      if (intervalId || state.disabled || !isSessionValidState(state.status)) {
        return;
      }
      if (!state.sessionStartTime) {
        set({ sessionStartTime: Date.now() });
      }

      const checkSessionTimer = async () => {
        const currentState = get();
        if (currentState.disabled || !isSessionValidState(currentState.status)) {
          return;
        }
        const timeSinceSessionStart = getTimeSinceSessionStarted();
        if (timeSinceSessionStart >= currentState.sessionLengthMs) {
          await currentState.expireSession('timer');
          return;
        }
        if (
          timeSinceSessionStart >= currentState.warningThresholdMs &&
          timeSinceSessionStart < currentState.sessionLengthMs
        ) {
          if (!warningShown) {
            warningShown = true;
            set({ status: 'warning' });
            currentState.onWarning?.();
          }
        } else if (timeSinceSessionStart < currentState.warningThresholdMs && warningShown) {
          warningShown = false;
          set({ status: 'authenticated' });
        }
      };

      intervalId = globalThis.setInterval(checkSessionTimer, 1000);

      if (typeof document !== 'undefined' && !visibilityHandler) {
        visibilityHandler = () => {
          if (document.visibilityState === 'visible') {
            void checkSessionTimer();
          }
        };
        document.addEventListener('visibilitychange', visibilityHandler);
      }
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
        visibilityHandler = undefined;
      }
    },
    disable: () => {
      get().stop();
      warningShown = false;
      unregisterCsrfMiddleware();
      resetWelcomePathGate();
      set({ disabled: true, status: 'expired', csrf: undefined, user: undefined });
    },
    extendSession: () => {
      warningShown = false;
      set({
        sessionStartTime: Date.now(),
        status: 'authenticated',
        disabled: false,
      });
      get().onSessionExtended?.();
      emitSessionEvent('session:extended');
    },
    initializeFromLoader: (data) => {
      ensureSessionSyncChannel();
      const state = get();
      const isAuthenticated = !!data?.csrf;
      const nextToken = data?.csrf?.token;

      if (!isAuthenticated) {
        if (state.status === 'anonymous' && !state.csrf) {
          return;
        }
        warningShown = false;
        unregisterCsrfMiddleware();
        set({
          status: 'anonymous',
          disabled: false,
          sessionStartTime: undefined,
          csrf: undefined,
          user: undefined,
          lastValidatedAt: undefined,
        });
        get().stop();
        return;
      }

      const stillLoggedIn =
        state.status === 'authenticated' || state.status === 'warning' || state.status === 'recovering';
      if (stillLoggedIn && state.csrf?.token === nextToken) {
        const nextUser = { etunimi: data?.etunimi, sukunimi: data?.sukunimi };
        if (!state.user || state.user.etunimi !== nextUser.etunimi || state.user.sukunimi !== nextUser.sukunimi) {
          set({ user: nextUser, lastValidatedAt: Date.now() });
        }
        return;
      }

      warningShown = false;
      registerCsrfMiddleware(data.csrf);
      set({
        status: 'authenticated',
        disabled: false,
        sessionStartTime: Date.now(),
        csrf: data.csrf,
        user: { etunimi: data.etunimi, sukunimi: data.sukunimi },
        lastValidatedAt: Date.now(),
      });
      emitSessionEvent('session:authenticated');
      get().start();
      get().onSessionExtended?.();
    },
    syncYksiloFromServer: async (force = false) => {
      const data = await fetchYksiloContext(force);
      get().initializeFromLoader(data);
      return yksiloLoaderContextHasSession(data) ? data : null;
    },
    resetYksiloContextRequest: () => {
      yksiloContextPromise = undefined;
    },
    validateSession: async (force = false) => {
      const { lastValidatedAt, status } = get();
      if (!force && status !== 'expired' && lastValidatedAt && Date.now() - lastValidatedAt < 10_000) {
        return isSessionValidState(get().status);
      }
      try {
        set({ status: 'recovering' });
        const data = await fetchYksiloContext(force);
        if (!data?.csrf) {
          await get().expireSession('validation-failed');
          return false;
        }
        warningShown = false;
        registerCsrfMiddleware(data.csrf);
        set({
          status: 'authenticated',
          disabled: false,
          sessionStartTime: Date.now(),
          csrf: data.csrf,
          user: { etunimi: data?.etunimi, sukunimi: data?.sukunimi },
          lastValidatedAt: Date.now(),
        });
        emitSessionEvent('session:authenticated');
        get().start();
        get().onSessionExtended?.();
        return true;
      } catch (_error) {
        await get().expireSession('validation-failed');
        return false;
      }
    },
    expireSession: async (reason = 'manual') => {
      const shouldBecomeAnonymous = reason === 'logout';
      if (get().status === 'expired' && !shouldBecomeAnonymous) {
        return;
      }
      ensureSessionSyncChannel();
      get().stop();
      warningShown = false;
      unregisterCsrfMiddleware();
      resetWelcomePathGate();
      set({
        status: shouldBecomeAnonymous ? 'anonymous' : 'expired',
        disabled: !shouldBecomeAnonymous,
        sessionStartTime: undefined,
        lastValidatedAt: undefined,
        csrf: undefined,
        user: undefined,
      });
      emitSessionEvent(reason === 'logout' ? 'session:logout' : 'session:expired');
      await get().onExpired?.(reason);
    },
  };
});

export const isSessionExpiredState = (status: SessionStatus) => status === 'expired';
export const isSessionValidState = (status: SessionStatus) => status === 'authenticated' || status === 'warning';

const sessionStatusClaimsYksiloSession = (status: SessionStatus) =>
  status === 'authenticated' || status === 'warning' || status === 'recovering';

/**
 * Session store looks ready for API calls: status is authenticated, warning, or recovering, and a CSRF token is set.
 * For React Router loader `context`, use {@link yksiloLoaderContextHasSession}.
 */
export const storeHasActiveYksiloSession = (state: SessionManagerState) =>
  sessionStatusClaimsYksiloSession(state.status) && Boolean(state.csrf?.token);

/** `YksiloLoaderContext` from a loader includes a CSRF token (authenticated snapshot). */
export function yksiloLoaderContextHasSession(ctx: YksiloLoaderContext): ctx is YksiloCsrfDto {
  return ctx != null && Boolean(ctx.csrf?.token);
}

export const useIsSessionExpired = () => useSessionManagerStore((state) => isSessionExpiredState(state.status));
export const useIsLoggedIn = () => useSessionManagerStore((state) => storeHasActiveYksiloSession(state));

/** Shape expected by `generateProfileLink` — null when not authenticated. */
export const useYksiloProfileLinkData = () =>
  useSessionManagerStore(
    useShallow((state) =>
      state.csrf ? { etunimi: state.user?.etunimi, sukunimi: state.user?.sukunimi, csrf: state.csrf } : null,
    ),
  );
