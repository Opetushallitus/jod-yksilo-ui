import createClient from 'openapi-fetch';
import { contentTypeMiddleware } from './middlewares/contentType';
import { sessionExpiredMiddleware } from './middlewares/sessionExpired';
import type { paths } from './schema';

export const client = createClient<paths>({
  baseUrl: '/yksilo',
});

client.use(contentTypeMiddleware);
client.use(sessionExpiredMiddleware);
