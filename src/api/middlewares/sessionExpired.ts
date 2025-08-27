import { authStore } from '@/auth';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useToolStore } from '@/stores/useToolStore';
import { Middleware } from 'openapi-fetch';
import { useNoteStore } from '../../stores/useNoteStore';
import { unregisterCsrfMiddleware } from './csrf';

export const sessionExpiredMiddleware: Middleware = {
  onResponse({ response }) {
    if (
      response.status === 403 &&
      !response.url.endsWith('/api/profiili/yksilo') &&
      !response.url.endsWith('/api/integraatiot/koski/koulutukset')
    ) {
      authStore.yksiloPromise = undefined;
      unregisterCsrfMiddleware();

      useNoteStore.getState().setNote({
        title: 'error-boundary.title',
        description: 'error-boundary.session-expired',
        variant: 'error',
      });

      useToolStore.getState().reset();
      useSuosikitStore.getState().reset();

      /* eslint-disable sonarjs/todo-tag */
      throw new Error('session-expired'); // TODO: This should be replaced with a proper handling of session expiration
    }
    return response;
  },
};
