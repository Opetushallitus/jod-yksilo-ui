import { components } from '@/api/schema';
import { describe, expect, it, vi } from 'vitest';
import loader from './loader';

const mockCsrf: components['schemas']['YksiloCsrfDto']['csrf'] = {
  headerName: 'headerName',
  parameterName: 'parameterName',
  token: 'token',
};

vi.mock('@/api/client', () => ({
  client: {
    GET: () => Promise.resolve({ data: { csrf: { ...mockCsrf } } }),
  },
}));

describe('loader', () => {
  it('should fetch CSRF token if the request is successful', async () => {
    const result = await loader({
      request: {} as Request,
      params: {
        lng: 'fi',
      },
    });

    expect(result).toEqual({ csrf: mockCsrf });
  });
});
