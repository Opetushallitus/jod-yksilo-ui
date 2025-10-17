import { authStore } from '@/auth';
import { useSessionExpirationStore } from '@/stores/useSessionExpirationStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useToolStore } from '@/stores/useToolStore';
import type { Middleware } from 'openapi-fetch';
import { unregisterCsrfMiddleware } from './csrf';

export const sessionExpiredMiddleware: Middleware = {
  async onResponse({ response }) {
    const { sessionExpired, extendSession, setSessionExpired, onSessionExtended } =
      useSessionExpirationStore.getState();

    // Reset session expiration on successful response
    if (response.status >= 200 && response.status < 300 && !sessionExpired) {
      onSessionExtended?.();
      await extendSession();
    }

    if (
      response.status === 403 &&
      !response.url.endsWith('/api/profiili/yksilo') &&
      !response.url.endsWith('/api/integraatiot/koski/koulutukset')
    ) {
      authStore.yksiloPromise = undefined;
      unregisterCsrfMiddleware();
      useToolStore.getState().reset();
      useSuosikitStore.getState().reset();
      setSessionExpired(true);

      /* eslint-disable sonarjs/todo-tag */
      throw new Error('session-expired'); // TODO: This should be replaced with a proper handling of session expiration
    }
    return response;
  },
};
