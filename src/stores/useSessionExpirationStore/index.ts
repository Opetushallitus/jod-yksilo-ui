import { create } from 'zustand';

interface SessionExpirationState {
  userLoginTime?: number;
  sessionExpired: boolean;
  sessionLengthMs: number;
  warningTresholdMs: number;

  /** Timestamp of user login */
  setUserLoginTime: (time: number) => void;
  /** Set session expired flag */
  setSessionExpired: (expired: boolean) => void;
  /** Reset session expiration state. If keepStatus is true, do not reset "sessionExpired" */
  resetSessionExpiration: (keepStatus?: boolean) => void;
  /** Extend session by resetting user login time to now */
  extendSession: () => void;
  /** Get time since user login in milliseconds */
  getTimeSinceLogin: () => number;
}

export const useSessionExpirationStore = create<SessionExpirationState>()((set, get) => ({
  userLoginTime: undefined,
  sessionExpired: false,
  sessionLengthMs: 30 * 60 * 1000, // 30 min
  warningTresholdMs: 25 * 60 * 1000, // 25 min

  setUserLoginTime: (time) => set({ userLoginTime: time }),
  setSessionExpired: (expired) => set({ sessionExpired: expired }),

  resetSessionExpiration: () => {
    set({
      sessionExpired: false,
      userLoginTime: undefined,
    });
  },

  extendSession: () => {
    set({ userLoginTime: Date.now() });
  },

  getTimeSinceLogin: () => {
    const { userLoginTime } = get();
    return userLoginTime ? Date.now() - userLoginTime : 0;
  },
}));
