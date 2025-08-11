import { afterEach, describe, expect, it, vi } from 'vitest';
import { type AmmattiDto, ammatit } from './ammatit';
type DtoType = Partial<AmmattiDto>;
const mocks = vi.hoisted(() => ({
  api: vi.fn(),
}));
vi.mock('@/api/client', () => ({
  client: {
    GET: mocks.api,
  },
}));

describe('ammatit service', () => {
  describe('ammatit.combine', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should combine objects with ammatit', async () => {
      const mockAmmatti1: DtoType = { uri: 'uri1', nimi: { fi: 'ammatti1' } };
      const mockAmmatti2: DtoType = { uri: 'uri2', nimi: { fi: 'ammatti2' } };

      mocks.api.mockImplementation((_: string, props: { params: { query: { uri: string[] } } }) => {
        expect(props.params.query.uri).toEqual(['uri1', 'uri2', 'uri3']);
        return Promise.resolve({ data: { sisalto: [mockAmmatti1, mockAmmatti2] } });
      });

      const objects = [
        { id: 1, ammattiUri: 'uri1' },
        { id: 2, ammattiUri: 'uri1' },
        { id: 3, ammattiUri: 'uri2' },
        { id: 4, ammattiUri: 'uri3' },
      ];
      const key = (o: { ammattiUri: string }) => o.ammattiUri;
      const combiner = (object: { id: number }, ammatti: DtoType) => ({
        id: object.id,
        ammatti,
      });
      const result = await ammatit.combine(objects, key, combiner);
      expect(result).toEqual([
        { id: 1, ammatti: mockAmmatti1 },
        { id: 2, ammatti: mockAmmatti1 },
        { id: 3, ammatti: mockAmmatti2 },
      ]);
    });

    it('should split long requests', async () => {
      vi.resetAllMocks();
      mocks.api.mockImplementation((_: string, props: { params: { query: { uri: string[] } } }) => {
        return Promise.resolve({ data: { sisalto: [{ uri: props.params.query.uri[0], nimi: { fi: 'ammatti' } }] } });
      });
      const uri1 = 'urn:' + 'x'.repeat(4096) + '1';
      const uri2 = 'urn:' + 'x'.repeat(4096) + '2';
      const result = await ammatit.find([uri1, uri2]);
      expect(result.length).toEqual(2);
      expect(mocks.api).toHaveBeenCalledTimes(2);
    });
  });

  describe('ammatit.find', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it('returns empty array if uris is undefined', async () => {
      const result = await ammatit.find();
      expect(result).toEqual([]);
    });

    it('returns ammatit for given uris', async () => {
      const mockAmmatti: DtoType = { uri: 'uri1', nimi: { fi: 'ammatti1' } };
      mocks.api.mockResolvedValue({ data: { sisalto: [mockAmmatti] } });
      const result = await ammatit.find(['uri1']);
      expect(result).toEqual([mockAmmatti]);
    });
  });

  describe('ammatit.get', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it('returns first ammatti for given uri', async () => {
      const mockAmmatti: DtoType = { uri: 'uri1', nimi: { fi: 'ammatti1' } };
      mocks.api.mockResolvedValue({ data: { sisalto: [mockAmmatti] } });
      const result = await ammatit.get('uri1');
      expect(result).toEqual(mockAmmatti);
    });

    it('returns undefined if no ammatti found', async () => {
      mocks.api.mockResolvedValue({ data: { sisalto: [] } });
      const result = await ammatit.get('uri1');
      expect(result).toBeUndefined();
    });
  });
});
