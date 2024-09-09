import { registerCsrfMiddleware, unregisterCsrfMiddleware } from '@/api/client';
import { components } from '@/api/schema';

export class EventEmitter {
  readonly EVENT = 'sessionExpired';
  private events: Record<string, (() => void)[]> = {};

  on(listener: () => void) {
    if (!this.events[this.EVENT]) {
      this.events[this.EVENT] = [];
    }
    this.events[this.EVENT].push(listener);
  }

  off(listener: () => void) {
    if (!this.events[this.EVENT]) return;
    this.events[this.EVENT] = this.events[this.EVENT].filter((l) => l !== listener);
  }

  sessionExpired() {
    if (!this.events[this.EVENT]) return;
    this.events[this.EVENT].forEach((listener) => listener());
  }
}

export type LoginState = 'unknown' | 'loggedIn' | 'loggedOut' | 'sessionExpired';

interface AuthProvider {
  loginState: LoginState;

  login: (newData: components['schemas']['YksiloCsrfDto']) => void;
  logout: () => void;
  expireSession: () => void;
  data?: components['schemas']['YksiloCsrfDto'] | null;
  on: (listener: () => void) => void;
  off: (listener: () => void) => void;
}

const eventEmitter = new EventEmitter();

export const authProvider: AuthProvider = {
  loginState: 'unknown',
  data: null,

  login(newData: components['schemas']['YksiloCsrfDto'] | null) {
    // Unregister the current CSRF middleware because the token has changed
    if (authProvider.data?.csrf) {
      unregisterCsrfMiddleware(authProvider.data.csrf);
    }
    if (newData) {
      registerCsrfMiddleware(newData.csrf);
    }

    authProvider.loginState = 'loggedIn';
    authProvider.data = newData;
  },

  logout() {
    if (authProvider.data?.csrf) {
      unregisterCsrfMiddleware(authProvider.data.csrf);
    }
    authProvider.loginState = 'loggedOut';
    authProvider.data = null;
  },

  expireSession() {
    authProvider.loginState = 'sessionExpired';
    eventEmitter.sessionExpired();
    authProvider.data = null;
  },
  on(listener) {
    eventEmitter.on(listener);
  },

  off(listener) {
    eventEmitter.off(listener);
  },
};
