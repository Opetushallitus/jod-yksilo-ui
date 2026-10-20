import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/api/client';

import { ammatit } from './ammatit';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from './mahdollisuusService';
import { KOHTAANTO_MIN_SCORE, getKohtaantoSamankaltaiset } from './samankaltaiset';

const mocks = vi.hoisted(() => ({
  POST: vi.fn(),
  getTypedTyoMahdollisuusDetails: vi.fn(),
  getTypedKoulutusMahdollisuusDetails: vi.fn(),
  ammatitFind: vi.fn(),
}));
vi.mock('./ammatit', () => ({
  ammatit: { find: mocks.ammatitFind },
}));
vi.mock('@/api/client', () => ({
  client: {
    POST: mocks.POST,
  },
}));
vi.mock('./mahdollisuusService', () => ({
  getTypedTyoMahdollisuusDetails: mocks.getTypedTyoMahdollisuusDetails,
  getTypedKoulutusMahdollisuusDetails: mocks.getTypedKoulutusMahdollisuusDetails,
}));

const otsikko = { fi: 'Ohjelmistokehittäjä', sv: 'Programutvecklare', en: 'Software developer' };

describe('getKohtaantoSamankaltaiset', () => {
  const POST = client.POST as Mock;
  const source = {
    tyyppi: 'TYOMAHDOLLISUUS' as const,
    description: 'Kuvaus',
    osaamiset: ['osaaminen-1', 'osaaminen-2'],
  };
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
      Promise.resolve(ids.map((id) => ({ id, otsikko, mahdollisuusTyyppi: 'TYOMAHDOLLISUUS' }))),
    );
    (getTypedKoulutusMahdollisuusDetails as Mock).mockImplementation((ids: string[]) =>
      Promise.resolve(ids.map((id) => ({ id, otsikko, mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS' }))),
    );
    (ammatit.find as Mock).mockResolvedValue([]);
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

  it('leaves out the opportunity itself and limits the results to six of each type', async () => {
    POST.mockResolvedValue({
      data: [
        ehdotus('id-1', 'TYOMAHDOLLISUUS', 0.99),
        ...Array.from({ length: 8 }, (_, i) => ehdotus(`t-${i + 1}`, 'TYOMAHDOLLISUUS', 0.9 - i * 0.01)),
        ...Array.from({ length: 7 }, (_, i) => ehdotus(`k-${i + 1}`, 'KOULUTUSMAHDOLLISUUS', 0.8 - i * 0.01)),
      ],
    });

    const result = await getKohtaantoSamankaltaiset('id-1', source);

    const ids = (tyyppi: string) =>
      result.opportunities.filter((o) => o.mahdollisuusTyyppi === tyyppi).map((o) => o.id);
    expect(ids('TYOMAHDOLLISUUS')).toEqual(['t-1', 't-2', 't-3', 't-4', 't-5', 't-6']);
    expect(ids('KOULUTUSMAHDOLLISUUS')).toEqual(['k-1', 'k-2', 'k-3', 'k-4', 'k-5', 'k-6']);
    expect(result.opportunities).toHaveLength(12);
  });

  describe('ordering', () => {
    const data = () => [
      ehdotus('k-low', 'KOULUTUSMAHDOLLISUUS', 0.95),
      ehdotus('t-low', 'TYOMAHDOLLISUUS', 0.6),
      ehdotus('k-high', 'KOULUTUSMAHDOLLISUUS', 0.99),
      ehdotus('t-high', 'TYOMAHDOLLISUUS', 0.7),
    ];

    it('shows the työmahdollisuudet first for a työmahdollisuus, each type ordered by the score', async () => {
      POST.mockResolvedValue({ data: data() });

      const result = await getKohtaantoSamankaltaiset('id-1', { ...source, tyyppi: 'TYOMAHDOLLISUUS' });

      // The scores of the different types are not comparable, so a higher koulutus score does not come first
      expect(result.opportunities.map((o) => o.id)).toEqual(['t-high', 't-low', 'k-high', 'k-low']);
    });

    it('shows the koulutusmahdollisuudet first for a koulutusmahdollisuus, each type ordered by the score', async () => {
      POST.mockResolvedValue({ data: data() });

      const result = await getKohtaantoSamankaltaiset('id-1', { ...source, tyyppi: 'KOULUTUSMAHDOLLISUUS' });

      expect(result.opportunities.map((o) => o.id)).toEqual(['k-high', 'k-low', 't-high', 't-low']);
    });
  });

  it('returns the details and the score of the suggestions', async () => {
    POST.mockResolvedValue({ data: [ehdotus('t-1', 'TYOMAHDOLLISUUS', 0.75)] });

    const result = await getKohtaantoSamankaltaiset('id-1', source);

    expect(result.opportunities[0]).toMatchObject({ id: 't-1', otsikko, pisteet: 0.75 });
  });

  it('fetches the names of the ammattiryhmat of the työmahdollisuudet', async () => {
    POST.mockResolvedValue({ data: [ehdotus('t-1', 'TYOMAHDOLLISUUS'), ehdotus('t-2', 'TYOMAHDOLLISUUS')] });
    (getTypedTyoMahdollisuusDetails as Mock).mockResolvedValue([
      { id: 't-1', otsikko, ammattiryhma: { uri: 'ryhma-1' } },
      { id: 't-2', otsikko, ammattiryhma: { uri: 'ryhma-1' } },
    ]);
    (ammatit.find as Mock).mockResolvedValue([{ uri: 'ryhma-1', nimi: otsikko }]);

    const result = await getKohtaantoSamankaltaiset('id-1', source);

    expect(ammatit.find).toHaveBeenCalledWith(['ryhma-1'], undefined);
    expect(result.ammattiryhmaNimet).toEqual({ 'ryhma-1': otsikko });
  });

  it('leaves out the suggestions scoring below the minimum or without a score', async () => {
    POST.mockResolvedValue({
      data: [
        ehdotus('t-high', 'TYOMAHDOLLISUUS', 0.9),
        ehdotus('t-limit', 'TYOMAHDOLLISUUS', KOHTAANTO_MIN_SCORE),
        ehdotus('t-low', 'TYOMAHDOLLISUUS', KOHTAANTO_MIN_SCORE - 0.01),
        ehdotus('k-none', 'KOULUTUSMAHDOLLISUUS', null),
      ],
    });

    const result = await getKohtaantoSamankaltaiset('id-1', source);

    expect(result.opportunities.map((o) => o.id)).toEqual(['t-high', 't-limit']);
  });

  it('does not fill the list with low scoring suggestions of a type that has fewer than six good matches', async () => {
    POST.mockResolvedValue({
      data: [
        ehdotus('t-1', 'TYOMAHDOLLISUUS', 0.9),
        ...Array.from({ length: 10 }, (_, i) => ehdotus(`k-low-${i}`, 'KOULUTUSMAHDOLLISUUS', 0.1)),
      ],
    });

    const result = await getKohtaantoSamankaltaiset('id-1', source);

    expect(result.opportunities.map((o) => o.id)).toEqual(['t-1']);
  });

  it('does not call the suggestions without any input', async () => {
    const result = await getKohtaantoSamankaltaiset('id-1', { ...source, description: ' ', osaamiset: [] });

    expect(POST).not.toHaveBeenCalled();
    expect(result).toEqual({ opportunities: [], ammattiryhmaNimet: {} });
  });

  it('returns empty lists on an error response', async () => {
    POST.mockResolvedValue({ data: undefined, error: {} });

    expect(await getKohtaantoSamankaltaiset('id-1', source)).toEqual({
      opportunities: [],
      ammattiryhmaNimet: {},
    });
  });

  it('resolves to an empty result when the request fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    POST.mockRejectedValue(new Error('network error'));

    expect(await getKohtaantoSamankaltaiset('id-1', source)).toEqual({ opportunities: [], ammattiryhmaNimet: {} });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('resolves quietly to an empty result when the request is aborted', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    POST.mockRejectedValue(new DOMException('aborted', 'AbortError'));

    expect(await getKohtaantoSamankaltaiset('id-1', source)).toEqual({ opportunities: [], ammattiryhmaNimet: {} });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
