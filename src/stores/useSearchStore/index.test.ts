import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { client } from '@/api/client';

import { useSearchStore } from '.';

const mocks = vi.hoisted(() => ({
  GET: vi.fn(),
}));

vi.mock('@/api/client', () => ({
  client: {
    GET: mocks.GET,
  },
}));

describe('useSearchStore search normalization', () => {
  const GET = client.GET as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    useSearchStore.setState({
      query: '',
      allMetadata: [],
      filteredMetadata: [],
      filteredResults: [],
      hasSearchedOnce: false,
      isLoading: false,
      resultsPageNr: 1,
    });
    GET.mockImplementation((url: string) => {
      if (url === '/api/tyomahdollisuudet' || url === '/api/koulutusmahdollisuudet') {
        return Promise.resolve({
          data: {
            sisalto: [],
            sivuja: 1,
          },
          error: null,
        });
      }

      if (url === '/api/mahdollisuudet/haku') {
        return Promise.resolve({ data: [], error: null });
      }

      return Promise.resolve({ data: { sisalto: [] }, error: null });
    });
  });

  it('normalizes under-3 query to empty and performs unfiltered search', async () => {
    await useSearchStore.getState().search('ab');

    expect(GET).toHaveBeenCalledWith('/api/tyomahdollisuudet', {
      params: {
        query: {
          sivu: 0,
          koko: 500,
        },
      },
      signal: expect.any(AbortSignal),
    });
    expect(GET).toHaveBeenCalledWith('/api/koulutusmahdollisuudet', {
      params: {
        query: {
          sivu: 0,
          koko: 500,
        },
      },
      signal: expect.any(AbortSignal),
    });
    expect(useSearchStore.getState().query).toBe('');
    expect(useSearchStore.getState().hasSearchedOnce).toBe(true);
  });

  it('normalizes whitespace-only query to empty and performs unfiltered search', async () => {
    await useSearchStore.getState().search('   ');

    expect(GET).toHaveBeenCalledWith('/api/tyomahdollisuudet', {
      params: {
        query: {
          sivu: 0,
          koko: 500,
        },
      },
      signal: expect.any(AbortSignal),
    });
    expect(useSearchStore.getState().query).toBe('');
  });

  it('keeps 3+ query and performs normal search', async () => {
    await useSearchStore.getState().search('abc');

    expect(GET).toHaveBeenCalledWith('/api/mahdollisuudet/haku', {
      params: {
        query: {
          kieli: 'fi',
          teksti: 'abc',
        },
      },
      signal: expect.any(AbortSignal),
    });
    expect(useSearchStore.getState().query).toBe('abc');
  });
});
