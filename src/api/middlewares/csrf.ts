import { Middleware } from 'openapi-fetch';
import { client } from '../client';
import type { components } from '../schema';

type CsrfDTO = components['schemas']['CsrfTokenDto'];
const csrfMiddleware = (csrf: CsrfDTO): Middleware => {
  const { headerName, token } = csrf;
  return {
    onRequest({ request }) {
      request.headers.set(headerName, token);
      return request;
    },
  };
};

let registeredCsrfMiddleware: Middleware | undefined = undefined;

export const registerCsrfMiddleware = (csrf: CsrfDTO) => {
  if (registeredCsrfMiddleware) {
    unregisterCsrfMiddleware();
  }

  registeredCsrfMiddleware = csrfMiddleware(csrf);
  client.use(registeredCsrfMiddleware);
};

export const unregisterCsrfMiddleware = () => {
  if (registeredCsrfMiddleware) {
    client.eject(registeredCsrfMiddleware);
    registeredCsrfMiddleware = undefined;
  }
};
