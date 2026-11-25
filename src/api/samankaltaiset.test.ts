import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/api/client';

import { ammatit } from './ammatit';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from './mahdollisuusService';
import { getKohtaantoSamankaltaiset } from './samankaltaiset';

const mocks = vi.hoisted(() => ({
  GET: vi.fn(),
  getTypedTyoMahdollisuusDetails: vi.fn(),
  getTypedKoulutusMahdollisuusDetails: vi.fn(),
  ammatitFind: vi.fn(),
  mapKoulutusCodesToLabels: vi.fn(),
}));
vi.mock('@/utils/codes/codes', () => ({
  mapKoulutusCodesToLabels: mocks.mapKoulutusCodesToLabels,
}));
vi.mock('./ammatit', () => ({
  ammatit: { find: mocks.ammatitFind },
}));
vi.mock('@/api/client', () => ({
  client: {
    GET: mocks.GET,
  },
}));
vi.mock('./mahdollisuusService', () => ({
  getTypedTyoMahdollisuusDetails: mocks.getTypedTyoMahdollisuusDetails,
  getTypedKoulutusMahdollisuusDetails: mocks.getTypedKoulutusMahdollisuusDetails,
}));

const otsikko = { fi: 'Ohjelmistokehittäjä', sv: 'Programutvecklare', en: 'Software developer' };

describe('getKohtaantoSamankaltaiset', () => {
  const GET = client.GET as Mock;
  const source = { id: 'id-1', tyyppi: 'TYOMAHDOLLISUUS' as const };
  const ehdotus = (id: string, tyyppi: 'TYOMAHDOLLISUUS' | 'KOULUTUSMAHDOLLISUUS', pisteet = 0.9) => ({
    id,
    tyyppi,
    pisteet,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (getTypedTyoMahdollisuusDetails as Mock).mockImplementation((ids: string[]) =>
      Promise.resolve(ids.map((id) => ({ id, otsikko, mahdollisuusTyyppi: 'TYOMAHDOLLISUUS' }))),
    );
    (getTypedKoulutusMahdollisuusDetails as Mock).mockImplementation((ids: string[]) =>
      Promise.resolve(ids.map((id) => ({ id, otsikko, mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS' }))),
    );
    (ammatit.find as Mock).mockResolvedValue([]);
    mocks.mapKoulutusCodesToLabels.mockImplementation((items: object[]) =>
      Promise.resolve(items.map((m) => ({ ...m, yleisinKoulutusala: 'Tekniikan alat' }))),
    );
  });

  it.each([
    ['TYOMAHDOLLISUUS', '/api/tyomahdollisuudet/{id}/samankaltaiset'],
    ['KOULUTUSMAHDOLLISUUS', '/api/koulutusmahdollisuudet/{id}/samankaltaiset'],
  ] as const)(
    'fetches the suggestions of a %s with a cacheable GET request without the language',
    async (tyyppi, path) => {
      GET.mockResolvedValue({ data: [] });

      await getKohtaantoSamankaltaiset({ id: 'id-1', tyyppi });

      expect(GET).toHaveBeenCalledWith(
        path,
        expect.objectContaining({
          params: { path: { id: 'id-1' } },
        }),
      );
    },
  );

  it('shows the labels of the yleisinKoulutusala codes of the koulutusmahdollisuudet', async () => {
    GET.mockResolvedValue({ data: [ehdotus('k-1', 'KOULUTUSMAHDOLLISUUS')] });

    const { opportunities } = await getKohtaantoSamankaltaiset(source);

    expect(opportunities.map((o) => o.yleisinKoulutusala)).toEqual(['Tekniikan alat']);
  });

  it('keeps the opportunities without the koulutusala when the labels cannot be fetched', async () => {
    mocks.mapKoulutusCodesToLabels.mockRejectedValue(new Error('failed'));
    GET.mockResolvedValue({ data: [ehdotus('k-1', 'KOULUTUSMAHDOLLISUUS')] });

    const { opportunities } = await getKohtaantoSamankaltaiset(source);

    expect(opportunities.map((o) => [o.id, o.yleisinKoulutusala])).toEqual([['k-1', undefined]]);
  });

  it('keeps the order of the backend', async () => {
    GET.mockResolvedValue({
      data: [
        ehdotus('t-high', 'TYOMAHDOLLISUUS', 0.7),
        ehdotus('t-low', 'TYOMAHDOLLISUUS', 0.6),
        ehdotus('k-high', 'KOULUTUSMAHDOLLISUUS', 0.99),
        ehdotus('k-low', 'KOULUTUSMAHDOLLISUUS', 0.95),
      ],
    });

    const result = await getKohtaantoSamankaltaiset(source);

    expect(result.opportunities.map((o) => o.id)).toEqual(['t-high', 't-low', 'k-high', 'k-low']);
  });

  it('returns the details and the score of the suggestions', async () => {
    GET.mockResolvedValue({ data: [ehdotus('t-1', 'TYOMAHDOLLISUUS', 0.75)] });

    const result = await getKohtaantoSamankaltaiset(source);

    expect(result.opportunities[0]).toMatchObject({ id: 't-1', otsikko, pisteet: 0.75 });
  });

  it('leaves out the suggestions whose details are not found', async () => {
    GET.mockResolvedValue({ data: [ehdotus('t-1', 'TYOMAHDOLLISUUS'), ehdotus('t-2', 'TYOMAHDOLLISUUS')] });
    (getTypedTyoMahdollisuusDetails as Mock).mockResolvedValue([{ id: 't-2', otsikko }]);

    const result = await getKohtaantoSamankaltaiset(source);

    expect(result.opportunities.map((o) => o.id)).toEqual(['t-2']);
  });

  it('fetches the names of the ammattiryhmat of the työmahdollisuudet', async () => {
    GET.mockResolvedValue({ data: [ehdotus('t-1', 'TYOMAHDOLLISUUS'), ehdotus('t-2', 'TYOMAHDOLLISUUS')] });
    (getTypedTyoMahdollisuusDetails as Mock).mockResolvedValue([
      { id: 't-1', otsikko, ammattiryhma: { uri: 'ryhma-1' } },
      { id: 't-2', otsikko, ammattiryhma: { uri: 'ryhma-1' } },
    ]);
    (ammatit.find as Mock).mockResolvedValue([{ uri: 'ryhma-1', nimi: otsikko }]);

    const result = await getKohtaantoSamankaltaiset(source);

    expect(ammatit.find).toHaveBeenCalledWith(['ryhma-1'], undefined);
    expect(result.ammattiryhmaNimet).toEqual({ 'ryhma-1': otsikko });
  });

  it('returns empty lists on an error response', async () => {
    GET.mockResolvedValue({ data: undefined, error: {} });

    expect(await getKohtaantoSamankaltaiset(source)).toEqual({
      opportunities: [],
      ammattiryhmaNimet: {},
    });
  });

  it('resolves to an empty result when the request fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    GET.mockRejectedValue(new Error('network error'));

    expect(await getKohtaantoSamankaltaiset(source)).toEqual({ opportunities: [], ammattiryhmaNimet: {} });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('resolves quietly to an empty result when the request is aborted', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    GET.mockRejectedValue(new DOMException('aborted', 'AbortError'));

    expect(await getKohtaantoSamankaltaiset(source)).toEqual({ opportunities: [], ammattiryhmaNimet: {} });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
