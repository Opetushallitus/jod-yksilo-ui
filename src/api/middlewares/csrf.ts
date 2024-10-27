import { Middleware } from 'openapi-fetch';
import { client } from '../client';
import type { components } from '../schema';

type CsrfDTO = components['schemas']['CsrfTokenDto'];
const csrfMiddleware = (csrf: CsrfDTO): Middleware => ({
  onRequest({ request }) {
    request.headers.set(csrf.headerName, csrf.token);
    return request;
  },
});

let registeredCsrfMiddleware: CsrfDTO | null = null;

export const registerCsrfMiddleware = (csrf: CsrfDTO) => {
  if (registeredCsrfMiddleware) {
    unregisterCsrfMiddleware();
  }

  client.use(csrfMiddleware(csrf));
  registeredCsrfMiddleware = csrf;
};

export const unregisterCsrfMiddleware = () => {
  if (registeredCsrfMiddleware) {
    client.eject(csrfMiddleware(registeredCsrfMiddleware));
    registeredCsrfMiddleware = null;
  }
};
