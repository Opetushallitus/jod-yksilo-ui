import { Middleware } from 'openapi-fetch';

export const contentTypeMiddleware: Middleware = {
  onRequest({ request }) {
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && !request.headers.get('Content-Type')) {
      request.headers.set('Content-Type', 'application/json');
    }
    return request;
  },
};
