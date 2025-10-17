import { create } from 'zustand';

interface SessionExpirationState {
  /** Timestamp of session start time in milliseconds */
  sessionStartTime?: number;
  /** Flag indicating if session has expired */
  sessionExpired: boolean;
  /** Session length in milliseconds */
  sessionLengthMs: number;
  /** Warning threshold in milliseconds before session expiration */
  warningTresholdMs: number;

  /** Callback for when session is extended */
  onSessionExtended?: () => void;
  /** Set callback for when session is extended, it's needed to remove warning note in middleware */
  setOnSessionExtended: (callback: () => void) => void;
  /** Timestamp of session start time */
  setSessionStartTime: (time: number) => void;
  /** Set session expired flag */
  setSessionExpired: (expired: boolean) => void;
  /** Extend session by resetting session start time to now */
  extendSession: () => Promise<void> | void;
  /** Get time since session start time in milliseconds */
  getTimeSinceSessionStarted: () => number;
}

export const useSessionExpirationStore = create<SessionExpirationState>()((set, get) => ({
  sessionStartTime: undefined,
  sessionExpired: false,
  sessionLengthMs: 30 * 60 * 1000, // 30 min
  warningTresholdMs: 25 * 60 * 1000, // 25 min

  onSessionExtended: undefined,
  setOnSessionExtended: (callback) => set({ onSessionExtended: callback }),
  setSessionStartTime: (time) => set({ sessionStartTime: time }),
  setSessionExpired: (expired) => set({ sessionExpired: expired }),
  extendSession: () => {
    set({ sessionStartTime: Date.now() });
  },
  getTimeSinceSessionStarted: () => {
    const { sessionStartTime: userLoginTime } = get();
    return userLoginTime ? Date.now() - userLoginTime : 0;
  },
}));
