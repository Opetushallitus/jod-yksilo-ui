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

const mockSisalto = [{ id: '1', nimi: 'Test' }];

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
      GET.mockResolvedValue({ data: { sisalto: mockSisalto }, error: null });
      const result = await getTyoMahdollisuusDetails(['1']);
      expect(result).toEqual(mockSisalto);
      expect(GET).toHaveBeenCalledWith('/api/tyomahdollisuudet', {
        params: { query: { id: ['1'] } },
      });
    });

    it('returns empty array on error', async () => {
      GET.mockResolvedValue({ data: null, error: 'error' });
      const result = await getTyoMahdollisuusDetails(['1']);
      expect(result).toEqual([]);
    });
  });

  describe('getTypedTyoMahdollisuusDetails', () => {
    it('maps mahdollisuusTyyppi correctly', async () => {
      GET.mockResolvedValue({ data: { sisalto: mockSisalto }, error: null });
      const result = await getTypedTyoMahdollisuusDetails(['1']);
      expect(result[0].mahdollisuusTyyppi).toBe('TYOMAHDOLLISUUS');
    });

    it('returns empty array if no results', async () => {
      GET.mockResolvedValue({ data: { sisalto: [] }, error: null });
      const result = await getTypedTyoMahdollisuusDetails(['1']);
      expect(result).toEqual([]);
    });
  });

  describe('getKoulutusMahdollisuusDetails', () => {
    it('returns empty array if ids is empty', async () => {
      const result = await getKoulutusMahdollisuusDetails([]);
      expect(result).toEqual([]);
    });

    it('returns sisalto when no error', async () => {
      GET.mockResolvedValue({ data: { sisalto: mockSisalto }, error: null });
      const result = await getKoulutusMahdollisuusDetails(['2']);
      expect(result).toEqual(mockSisalto);
      expect(client.GET).toHaveBeenCalledWith('/api/koulutusmahdollisuudet', {
        params: { query: { id: ['2'] } },
      });
    });

    it('returns empty array on error', async () => {
      GET.mockResolvedValue({ data: null, error: 'error' });
      const result = await getKoulutusMahdollisuusDetails(['2']);
      expect(result).toEqual([]);
    });
  });

  describe('getTypedKoulutusMahdollisuusDetails', () => {
    it('maps mahdollisuusTyyppi correctly', async () => {
      GET.mockResolvedValue({ data: { sisalto: mockSisalto }, error: null });
      const result = await getTypedKoulutusMahdollisuusDetails(['2']);
      expect(result[0].mahdollisuusTyyppi).toBe('KOULUTUSMAHDOLLISUUS');
    });

    it('returns empty array if no results', async () => {
      GET.mockResolvedValue({ data: { sisalto: [] }, error: null });
      const result = await getTypedKoulutusMahdollisuusDetails(['2']);
      expect(result).toEqual([]);
    });
  });
});
