import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/api/client';

import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from './mahdollisuusService';
import { KOHTAANTO_MIN_SCORE, getKohtaantoSamankaltaiset, getSamankaltaiset } from './samankaltaiset';

const mocks = vi.hoisted(() => ({
  GET: vi.fn(),
  POST: vi.fn(),
  getTypedTyoMahdollisuusDetails: vi.fn(),
  getTypedKoulutusMahdollisuusDetails: vi.fn(),
}));
vi.mock('@/api/client', () => ({
  client: {
    GET: mocks.GET,
    POST: mocks.POST,
  },
}));
vi.mock('./mahdollisuusService', () => ({
  getTypedTyoMahdollisuusDetails: mocks.getTypedTyoMahdollisuusDetails,
  getTypedKoulutusMahdollisuusDetails: mocks.getTypedKoulutusMahdollisuusDetails,
}));

const otsikko = { fi: 'Ohjelmistokehittäjä', sv: 'Programutvecklare', en: 'Software developer' };

describe('getSamankaltaiset', () => {
  const GET = client.GET as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches both types for a työmahdollisuus and maps the localized titles', async () => {
    GET.mockImplementation((_path: string, { params }: { params: { query: { tyyppi: string } } }) =>
      Promise.resolve({
        data: [{ id: params.query.tyyppi === 'TYOMAHDOLLISUUS' ? 'tyo-1' : 'koulutus-1', otsikko }],
      }),
    );

    const result = await getSamankaltaiset('TYOMAHDOLLISUUS', 'id-1');

    expect(GET).toHaveBeenCalledTimes(2);
    expect(GET).toHaveBeenCalledWith('/api/tyomahdollisuudet/{id}/samankaltaiset', {
      signal: undefined,
      params: { path: { id: 'id-1' }, query: { tyyppi: 'TYOMAHDOLLISUUS' } },
    });
    expect(GET).toHaveBeenCalledWith('/api/tyomahdollisuudet/{id}/samankaltaiset', {
      signal: undefined,
      params: { path: { id: 'id-1' }, query: { tyyppi: 'KOULUTUSMAHDOLLISUUS' } },
    });
    expect(result.TYOMAHDOLLISUUS.map((o) => o.id)).toEqual(['tyo-1']);
    expect(result.KOULUTUSMAHDOLLISUUS.map((o) => o.id)).toEqual(['koulutus-1']);
    expect(result.TYOMAHDOLLISUUS[0].title).not.toBe('');
  });

  it('fetches both types for a koulutusmahdollisuus', async () => {
    GET.mockResolvedValue({ data: [] });

    await getSamankaltaiset('KOULUTUSMAHDOLLISUUS', 'id-2');

    expect(GET).toHaveBeenCalledTimes(2);
    expect(GET).toHaveBeenCalledWith('/api/koulutusmahdollisuudet/{id}/samankaltaiset', {
      signal: undefined,
      params: { path: { id: 'id-2' }, query: { tyyppi: 'TYOMAHDOLLISUUS' } },
    });
    expect(GET).toHaveBeenCalledWith('/api/koulutusmahdollisuudet/{id}/samankaltaiset', {
      signal: undefined,
      params: { path: { id: 'id-2' }, query: { tyyppi: 'KOULUTUSMAHDOLLISUUS' } },
    });
  });

  it('returns empty lists on an error response', async () => {
    GET.mockResolvedValue({ data: undefined, error: {} });

    expect(await getSamankaltaiset('TYOMAHDOLLISUUS', 'id-3')).toEqual({
      TYOMAHDOLLISUUS: [],
      KOULUTUSMAHDOLLISUUS: [],
    });
  });
});

describe('getKohtaantoSamankaltaiset', () => {
  const POST = client.POST as Mock;
  const source = { description: 'Kuvaus', osaamiset: ['osaaminen-1', 'osaaminen-2'] };
  const ehdotus = (
    mahdollisuusId: string,
    tyyppi: 'TYOMAHDOLLISUUS' | 'KOULUTUSMAHDOLLISUUS',
    pisteet: number | null = 0.9,
  ) => ({
    mahdollisuusId,
    ehdotusMetadata: { tyyppi, pisteet, aakkosIndeksi: 0 },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (getTypedTyoMahdollisuusDetails as Mock).mockImplementation((ids: string[]) =>
      Promise.resolve(ids.map((id) => ({ id, otsikko }))),
    );
    (getTypedKoulutusMahdollisuusDetails as Mock).mockImplementation((ids: string[]) =>
      Promise.resolve(ids.map((id) => ({ id, otsikko }))),
    );
  });

  it('sends the osaamiset and the description of the opportunity to the suggestions', async () => {
    POST.mockResolvedValue({ data: [] });

    await getKohtaantoSamankaltaiset('id-1', source);

    expect(POST).toHaveBeenCalledWith(
      '/api/ehdotus/mahdollisuudet',
      expect.objectContaining({
        body: expect.objectContaining({
          osaamiset: ['osaaminen-1', 'osaaminen-2'],
          osaamisetVapaateksti: 'Kuvaus',
        }),
      }),
    );
  });

  it('leaves out the opportunity itself and limits the results to five per type', async () => {
    POST.mockResolvedValue({
      data: [
        ehdotus('id-1', 'TYOMAHDOLLISUUS'),
        ...['t-1', 't-2', 't-3', 't-4', 't-5', 't-6'].map((id) => ehdotus(id, 'TYOMAHDOLLISUUS')),
        ehdotus('k-1', 'KOULUTUSMAHDOLLISUUS'),
      ],
    });

    const result = await getKohtaantoSamankaltaiset('id-1', source);

    expect(result.TYOMAHDOLLISUUS.map((o) => o.id)).toEqual(['t-1', 't-2', 't-3', 't-4', 't-5']);
    expect(result.KOULUTUSMAHDOLLISUUS.map((o) => o.id)).toEqual(['k-1']);
    expect(result.TYOMAHDOLLISUUS[0].title).not.toBe('');
  });

  it('marks the suggestions scoring below the minimum or without a score instead of leaving them out', async () => {
    POST.mockResolvedValue({
      data: [
        ehdotus('t-high', 'TYOMAHDOLLISUUS', 0.9),
        ehdotus('t-limit', 'TYOMAHDOLLISUUS', KOHTAANTO_MIN_SCORE),
        ehdotus('t-low', 'TYOMAHDOLLISUUS', KOHTAANTO_MIN_SCORE - 0.01),
        ehdotus('k-none', 'KOULUTUSMAHDOLLISUUS', null),
      ],
    });

    const result = await getKohtaantoSamankaltaiset('id-1', source);

    expect(result.TYOMAHDOLLISUUS.map((o) => [o.id, o.lowSimilarity])).toEqual([
      ['t-high', false],
      ['t-limit', false],
      ['t-low', true],
    ]);
    expect(result.KOULUTUSMAHDOLLISUUS.map((o) => [o.id, o.lowSimilarity])).toEqual([['k-none', true]]);
  });

  it('does not call the suggestions without any input', async () => {
    const result = await getKohtaantoSamankaltaiset('id-1', { description: ' ', osaamiset: [] });

    expect(POST).not.toHaveBeenCalled();
    expect(result).toEqual({ TYOMAHDOLLISUUS: [], KOULUTUSMAHDOLLISUUS: [] });
  });

  it('returns empty lists on an error response', async () => {
    POST.mockResolvedValue({ data: undefined, error: {} });

    expect(await getKohtaantoSamankaltaiset('id-1', source)).toEqual({
      TYOMAHDOLLISUUS: [],
      KOULUTUSMAHDOLLISUUS: [],
    });
  });
});
