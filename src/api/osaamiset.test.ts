import { afterEach, describe, expect, it, vi } from 'vitest';
import { OsaaminenDto, osaamiset } from './osaamiset';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
}));
vi.mock('@/api/client', () => ({
  client: {
    GET: mocks.api,
  },
}));

describe('osaamiset.combine', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should combine objects with osaamiset', async () => {
    const mockOsaaminen1: OsaaminenDto = { uri: 'uri1', nimi: { fi: 'osaaminen1' }, kuvaus: { fi: 'kuvaus1' } };
    const mockOsaaminen2: OsaaminenDto = { uri: 'uri2', nimi: { fi: 'osaaminen2' }, kuvaus: { fi: 'kuvaus2' } };

    mocks.api.mockImplementation((_: string, props: { params: { query: { uri: string[] } } }) => {
      expect(props.params.query.uri).toEqual(['uri1', 'uri2', 'uri3']);
      return Promise.resolve({ data: { sisalto: [mockOsaaminen1, mockOsaaminen2] } });
    });

    const objects = [
      { id: 1, osaaminenUri: 'uri1' },
      { id: 2, osaaminenUri: 'uri1' },
      { id: 3, osaaminenUri: 'uri2' },
      { id: 4, osaaminenUri: 'uri3' },
    ];
    const key = (o: { osaaminenUri: string }) => o.osaaminenUri;
    const combiner = (object: { id: number }, osaaminen: OsaaminenDto) => ({
      id: object.id,
      osaaminen,
    });
    const result = await osaamiset.combine('osaamiset', objects, key, combiner);
    expect(result).toEqual([
      { id: 1, osaaminen: mockOsaaminen1 },
      { id: 2, osaaminen: mockOsaaminen1 },
      { id: 3, osaaminen: mockOsaaminen2 },
    ]);
  });
  it('should split long requests', async () => {
    vi.resetAllMocks();
    mocks.api.mockImplementation((_: string, props: { params: { query: { uri: string[] } } }) => {
      return Promise.resolve({ data: { sisalto: [{ uri: props.params.query.uri[0], nimi: { fi: 'osaaminen' } }] } });
    });
    const uri1 = 'urn:' + 'x'.repeat(4096) + '1';
    const uri2 = 'urn:' + 'x'.repeat(4096) + '2';
    const result = await osaamiset.find([uri1, uri2]);
    expect(result.length).toEqual(2);
    expect(mocks.api).toHaveBeenCalledTimes(2);
  });
});
