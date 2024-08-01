import { store } from '@/state/store';
import createClient, { Middleware } from 'openapi-fetch';
import type { paths } from './schema';

export const client = createClient<paths>();

const csrfMiddleware: Middleware = {
  onRequest(request) {
    const state = store.getState();
    const { csrf } = state.root;
    if (csrf?.headerName && csrf?.token) {
      request.headers.set(csrf.headerName, csrf.token);
    }
    return request;
  },
};

const contentTypeMiddleware: Middleware = {
  onRequest(request) {
    if (['PUT', 'POST', 'PATCH'].includes(request.method) && !request.headers.get('Content-Type')) {
      request.headers.set('Content-Type', 'application/json');
    }
    return request;
  },
};

client.use(csrfMiddleware, contentTypeMiddleware);
