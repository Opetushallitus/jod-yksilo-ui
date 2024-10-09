import { useToolStore } from '@/stores/useToolStore';
import { Middleware } from 'openapi-fetch';

// API paths that should not reset the tool state
const ignoredPaths = ['/api/profiili/suosikki'];

export const resetTool: Middleware = {
  onRequest(request) {
    const { schemaPath } = request;
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
