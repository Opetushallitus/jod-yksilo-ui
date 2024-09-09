import { authProvider } from '@/providers';
import createClient, { Middleware } from 'openapi-fetch';
import type { components, paths } from './schema';

export const client = createClient<paths>();

const contentTypeMiddleware: Middleware = {
  onRequest(request) {
    if (['PUT', 'POST', 'PATCH'].includes(request.method) && !request.headers.get('Content-Type')) {
      request.headers.set('Content-Type', 'application/json');
    }
    return request;
  },
};

client.use(contentTypeMiddleware);

type CsrfDTO = components['schemas']['CsrfTokenDto'];
const csrfMiddleware = (csrf: CsrfDTO): Middleware => ({
  onRequest(request) {
    request.headers.set(csrf.headerName, csrf.token);
    return request;
  },
});

let csrfMiddlewareRegistered = false;

export const registerCsrfMiddleware = (csrf: CsrfDTO) => {
  if (!csrfMiddlewareRegistered) {
    client.use(csrfMiddleware(csrf));
    csrfMiddlewareRegistered = true;
  }
};

export const unregisterCsrfMiddleware = (csrf: CsrfDTO) => {
  if (csrfMiddlewareRegistered) {
    client.eject(csrfMiddleware(csrf));
    csrfMiddlewareRegistered = false;
  }
};

const errorHandlingMiddleware: Middleware = {
  onResponse(response) {
    if (response.status === 403 && authProvider.loginState === 'loggedIn') {
      authProvider.expireSession();
    }
    return response;
  },
};

client.use(errorHandlingMiddleware);
