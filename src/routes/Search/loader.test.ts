import { describe, expect, it, vi } from 'vitest';

import loader from './loader';

const mocks = vi.hoisted(() => {
  const search = vi.fn();

  return {
    search,
    getState: vi.fn(() => ({
      search,
      query: '',
    })),
  };
});

vi.mock('@/stores/useSearchStore', () => ({
  useSearchStore: {
    getState: mocks.getState,
  },
}));

describe('search loader', () => {
  it('runs unfiltered search when q parameter is missing', async () => {
    const request = new Request('https://example.test/fi/haku');

    await loader({
      context: undefined,
      params: {},
      request,
      url: new URL(request.url),
      pattern: '',
    });

    expect(mocks.search).toHaveBeenCalledWith('');
  });

  it('normalizes short query to empty before searching', async () => {
    const request = new Request('https://example.test/fi/haku?q=ab');

    await loader({
      context: undefined,
      params: {},
      request,
      url: new URL(request.url),
      pattern: '',
    });

    expect(mocks.search).toHaveBeenCalledWith('');
  });

  it('keeps 3+ query trimmed before searching', async () => {
    const request = new Request('https://example.test/fi/haku?q=%20abc%20');

    await loader({
      context: undefined,
      params: {},
      request,
      url: new URL(request.url),
      pattern: '',
    });

    expect(mocks.search).toHaveBeenCalledWith('abc');
  });
});
