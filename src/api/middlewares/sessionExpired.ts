import {
  isSessionExpiredState,
  storeHasActiveYksiloSession,
  useSessionManagerStore,
} from '@/stores/useSessionManagerStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useToolStore } from '@/stores/useToolStore';
import type { Middleware } from 'openapi-fetch';
import { unregisterCsrfMiddleware } from './csrf';

const IGNORED_403_SUFFIXES = ['/api/profiili/yksilo', '/api/integraatiot/koski/koulutukset'] as const;

const getResponsePathname = (url: string) => {
  try {
    return new URL(url, globalThis.location.origin).pathname;
  } catch {
    return url;
  }
};

const isIgnored403 = (url: string) => {
  const pathname = getResponsePathname(url);
  return IGNORED_403_SUFFIXES.some((suffix) => pathname.endsWith(suffix));
};

export const sessionExpiredMiddleware: Middleware = {
  async onResponse({ response }) {
    const state = useSessionManagerStore.getState();
    const { status, extendSession, expireSession } = state;

    if (
      response.status >= 200 &&
      response.status < 300 &&
      !isSessionExpiredState(status) &&
      storeHasActiveYksiloSession(state)
    ) {
      await extendSession();
    }

    if (response.status === 403 && !isIgnored403(response.url)) {
      useSessionManagerStore.getState().resetYksiloContextRequest();
      unregisterCsrfMiddleware();
      useToolStore.getState().reset();
      useSuosikitStore.getState().reset();
      await expireSession('server-403');
    }
    return response;
  },
};
