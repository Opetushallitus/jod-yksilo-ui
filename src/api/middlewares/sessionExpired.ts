import { authStore } from '@/auth';
import { Middleware } from 'openapi-fetch';
import { useErrorNoteStore } from '../../stores/useErrorNoteStore';
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

      useErrorNoteStore.setState({
        error: {
          title: 'error-boundary.title',
          description: 'error-boundary.session-expired',
        },
      });
      /* eslint-disable sonarjs/todo-tag */
      throw new Error('session-expired'); // TODO: This should be replaced with a proper handling of session expiration
    }
    return response;
  },
};
