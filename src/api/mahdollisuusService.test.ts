import { client } from '@/api/client';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getKoulutusMahdollisuusDetails,
  getTyoMahdollisuusDetails,
  getTypedKoulutusMahdollisuusDetails,
  getTypedTyoMahdollisuusDetails,
} from './mahdollisuusService';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
}));
vi.mock('@/api/client', () => ({
  client: {
    GET: mocks.api,
  },
}));

let id = 0;
// Use different ids for different tests to avoid cache interference between tests
// Not really needed with getTyoMahdollisuusDetails and getKoulutusMahdollisuusDetails but keeps it consistent
const getNextId = () => `${++id}`;
const mockSisalto = (id: string) => [{ id, nimi: 'Test' }];

describe('mahdollisuusService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const GET = client.GET as Mock;

  describe('getTyoMahdollisuusDetails', () => {
    it('returns empty array if ids is empty', async () => {
      const result = await getTyoMahdollisuusDetails([]);
      expect(result).toEqual([]);
    });

    it('returns sisalto when no error', async () => {
      const id = getNextId();
      const sisalto = mockSisalto(id);
      GET.mockResolvedValue({ data: { sisalto }, error: null });
      const result = await getTyoMahdollisuusDetails([id]);
      expect(result).toEqual(sisalto);
      expect(GET).toHaveBeenCalledWith('/api/tyomahdollisuudet', {
        params: { query: { id: [id] } },
      });
    });

    it('returns empty array on error', async () => {
      const id = getNextId();
      GET.mockResolvedValue({ data: null, error: 'error' });
      const result = await getTyoMahdollisuusDetails([id]);
      expect(result).toEqual([]);
    });
  });

  describe('getTypedTyoMahdollisuusDetails', () => {
    it('maps mahdollisuusTyyppi correctly', async () => {
      const id = getNextId();
      const sisalto = mockSisalto(id);
      GET.mockResolvedValue({ data: { sisalto }, error: null });
      const result = await getTypedTyoMahdollisuusDetails([id]);
      expect(result[0].mahdollisuusTyyppi).toBe('TYOMAHDOLLISUUS');
      expect(client.GET).toHaveBeenCalledWith('/api/tyomahdollisuudet', {
        params: { query: { id: [id] } },
      });
    });

    it('returns empty array if no results', async () => {
      const id = getNextId();
      GET.mockResolvedValue({ data: { sisalto: [] }, error: null });
      const result = await getTypedTyoMahdollisuusDetails([id]);
      expect(result).toEqual([]);
    });

    it('gets from cache on subsequent calls', async () => {
      const id = getNextId();
      const sisalto = mockSisalto(id);
      GET.mockResolvedValue({ data: { sisalto }, error: null });

      // First call to populate cache
      const result1 = await getTypedTyoMahdollisuusDetails([id]);
      expect(result1).toEqual(
        sisalto.map((mahdollisuus) => ({
          ...mahdollisuus,
          mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
        })),
      );
      expect(GET).toHaveBeenCalledTimes(1);

      // Clear mock calls
      GET.mockClear();

      // Second call should hit cache
      const result2 = await getTypedTyoMahdollisuusDetails([id]);
      expect(result2).toEqual(
        sisalto.map((mahdollisuus) => ({
          ...mahdollisuus,
          mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
        })),
      );
      expect(GET).toHaveBeenCalledTimes(0);
    });
  });

  describe('getKoulutusMahdollisuusDetails', () => {
    it('returns empty array if ids is empty', async () => {
      const result = await getKoulutusMahdollisuusDetails([]);
      expect(result).toEqual([]);
    });

    it('returns sisalto when no error', async () => {
      const id = getNextId();
      const sisalto = mockSisalto(id);
      GET.mockResolvedValue({ data: { sisalto }, error: null });
      const result = await getKoulutusMahdollisuusDetails([id]);
      expect(result).toEqual(sisalto);
      expect(client.GET).toHaveBeenCalledWith('/api/koulutusmahdollisuudet', {
        params: { query: { id: [id] } },
      });
    });

    it('returns empty array on error', async () => {
      const id = getNextId();
      GET.mockResolvedValue({ data: null, error: 'error' });
      const result = await getKoulutusMahdollisuusDetails([id]);
      expect(result).toEqual([]);
    });
  });

  describe('getTypedKoulutusMahdollisuusDetails', () => {
    it('maps mahdollisuusTyyppi correctly', async () => {
      const id = getNextId();
      const sisalto = mockSisalto(id);
      GET.mockResolvedValue({ data: { sisalto }, error: null });
      const result = await getTypedKoulutusMahdollisuusDetails([id]);
      expect(result[0].mahdollisuusTyyppi).toBe('KOULUTUSMAHDOLLISUUS');
      expect(client.GET).toHaveBeenCalledWith('/api/koulutusmahdollisuudet', {
        params: { query: { id: [id] } },
      });
    });

    it('returns empty array if no results', async () => {
      const id = getNextId();
      GET.mockResolvedValue({ data: { sisalto: [] }, error: null });
      const result = await getTypedKoulutusMahdollisuusDetails([id]);
      expect(result).toEqual([]);
    });

    it('gets from cache on subsequent calls', async () => {
      const id = getNextId();
      const sisalto = mockSisalto(id);
      GET.mockResolvedValue({ data: { sisalto }, error: null });

      // First call to populate cache
      const result1 = await getTypedKoulutusMahdollisuusDetails([id]);
      expect(result1).toEqual(
        sisalto.map((mahdollisuus) => ({
          ...mahdollisuus,
          mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS',
        })),
      );
      expect(GET).toHaveBeenCalledTimes(1);

      // Clear mock calls
      GET.mockClear();

      // Second call should hit cache
      const result2 = await getTypedKoulutusMahdollisuusDetails([id]);
      expect(result2).toEqual(
        sisalto.map((mahdollisuus) => ({
          ...mahdollisuus,
          mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS',
        })),
      );
      expect(GET).toHaveBeenCalledTimes(0);
    });
  });
});
