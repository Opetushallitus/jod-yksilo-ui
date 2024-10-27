import { useToolStore } from '@/stores/useToolStore';
import { Middleware } from 'openapi-fetch';

// API paths that should not reset the tool state
const ignoredPaths = ['/api/profiili/suosikit'];

export const resetTool: Middleware = {
  onRequest({ request, schemaPath }) {
    if (
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) &&
      schemaPath.startsWith('/api/profiili') &&
      !ignoredPaths.includes(schemaPath)
    ) {
      useToolStore.getState().reset();
    }
    return request;
  },
};
