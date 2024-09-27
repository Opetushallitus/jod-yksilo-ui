import { useToolStore } from '@/stores/useToolStore';
import { Middleware } from 'openapi-fetch';

export const resetTool: Middleware = {
  onRequest(request) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && request.schemaPath.startsWith('/api/profiili')) {
      useToolStore.getState().reset();
    }
    return request;
  },
};
