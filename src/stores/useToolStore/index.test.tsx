import { components } from '@/api/schema';
import { EhdotusRecord } from '@/routes/Tool/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToolStore } from '.';
import { DEFAULT_FILTERS } from './ToolStoreModel';

const mocks = vi.hoisted(() => ({
  GET: vi.fn(),
  POST: vi.fn(),
}));
vi.mock('@/api/client', () => ({
  client: {
    GET: mocks.GET,
    POST: mocks.POST,
  },
}));

const mockOsaamiset = [
  { id: '1', nimi: { fi: 'JavaScript' }, kuvaus: { fi: 'JavaScript ohjelmointikieli' } },
  { id: '2', nimi: { fi: 'TypeScript' }, kuvaus: { fi: 'TypeScript on JavaScriptin superset' } },
];

const mockOsaamisetVapaateksti = {
  fi: 'Minulla on kokemusta web-kehityksestä ja pilvipalveluista.',
  sv: 'Jag har erfarenhet av webbutveckling och molntjänster.',
};

const mockKiinnostukset = [
  { id: '1', nimi: { fi: 'Urheilu' }, kuvaus: { fi: 'Kaikki urheiluun liittyvä' } },
  { id: '2', nimi: { fi: 'Musiikki' }, kuvaus: { fi: 'Musiikki ja soittaminen' } },
];

const mockKiinnostuksetVapaateksti = {
  fi: 'Olen kiinnostunut taiteesta ja kulttuurista.',
  sv: 'Jag är intresserad av konst och kultur.',
};

const mockAmmattiRyhmaURI = (ammattiRyhmaKoodi: string) => `http://data.europa.eu/esco/isco/C${ammattiRyhmaKoodi}`;
const ammattiRyhmaKoodi1 = '2642';
const ammattiRyhmaKoodi2 = '3630';

const mockKoulutusMahdollisuusEhdotus = (
  id: string,
  aakkosIndeksi: number,
  koulutusmahdollisuusTyyppi: 'TUTKINTO' | 'EI_TUTKINTO',
  pisteet: number,
  maakunnat: string[],
): components['schemas']['EhdotusDto'] => ({
  mahdollisuusId: id,
  ehdotusMetadata: {
    aakkosIndeksi,
    tyyppi: 'KOULUTUSMAHDOLLISUUS',
    koulutusmahdollisuusTyyppi,
    maakunnat,
    pisteet,
  },
});

const mockTyomahdollisuusEhdotus = (
  id: string,
  aakkosIndeksi: number,
  aineisto: 'AMMATTITIETO' | 'TMT' | undefined,
  ammattiryhmaTunnus: string,
  pisteet: number,
  maakunnat: string[],
): components['schemas']['EhdotusDto'] => ({
  mahdollisuusId: id,
  ehdotusMetadata: {
    aakkosIndeksi,
    tyyppi: 'TYOMAHDOLLISUUS',
    aineisto,
    ammattiryhma: mockAmmattiRyhmaURI(ammattiryhmaTunnus),
    maakunnat,
    pisteet,
  },
});

const mockKoulutusMahdollisuus = (
  id: string,
  tyyppi: 'EI_TUTKINTO' | 'TUTKINTO',
  kesto?: { minimi: number; mediaani: number; maksimi: number },
): components['schemas']['KoulutusmahdollisuusDto'] => ({
  id,
  aktiivinen: true,
  kesto: kesto ?? { minimi: 0, mediaani: 1, maksimi: 2 },
  kuvaus: { fi: `Koulutus ${id} kuvaus` },
  otsikko: { fi: `Koulutus ${id} otsikko` },
  tiivistelma: { fi: `Koulutus ${id} tiivistelma` },
  tyyppi,
});

const mockTyomahdollisuus = (
  id: string,
  aineisto: 'AMMATTITIETO' | 'TMT' | undefined,
  ammattiryhmaTunnus: string,
): components['schemas']['TyomahdollisuusDto'] => ({
  id,
  aktiivinen: true,
  aineisto,
  ammattiryhma: {
    mediaaniPalkka: 3000,
    uri: mockAmmattiRyhmaURI(ammattiryhmaTunnus),
  },
  kuvaus: { fi: `Työmahdollisuus ${id} kuvaus` },
  otsikko: { fi: `Työmahdollisuus ${id} otsikko` },
  tiivistelma: { fi: `Työmahdollisuus ${id} tiivistelma` },
});

const mockAmmatti = (ammattiryhmaTunnus: string): components['schemas']['AmmattiDto'] => ({
  uri: mockAmmattiRyhmaURI(ammattiryhmaTunnus),
  kuvaus: { fi: `Ammatti ${ammattiryhmaTunnus} kuvaus` },
  nimi: { fi: `Ammatti ${ammattiryhmaTunnus} otsikko` },
  koodi: ammattiryhmaTunnus,
});

const mockGetRequests = () => {
  mocks.GET.mockImplementation((url: string, options?: { params?: { query?: { id?: string[] } } }) => {
    const ids = options?.params?.query?.id ?? [];

    if (url === '/api/tyomahdollisuudet') {
      const mahdollisuudet = [
        mockTyomahdollisuus('1', 'AMMATTITIETO', ammattiRyhmaKoodi1),
        mockTyomahdollisuus('3', 'AMMATTITIETO', ammattiRyhmaKoodi2),
      ].filter((mahdollisuus) => {
        if (ids.length > 0) {
          return ids.includes(mahdollisuus.id);
        }
        return true;
      });

      return Promise.resolve({
        data: {
          maara: mahdollisuudet.length,
          sivuja: 1,
          sisalto: mahdollisuudet,
        },
      });
    } else if (url === '/api/koulutusmahdollisuudet') {
      const mahdollisuudet = [mockKoulutusMahdollisuus('2', 'TUTKINTO')].filter((mahdollisuus) => {
        if (ids.length > 0) {
          return ids.includes(mahdollisuus.id);
        }
        return true;
      });
      return Promise.resolve({
        data: {
          maara: mahdollisuudet.length,
          sivuja: 1,
          sisalto: mahdollisuudet,
        },
      });
    } else if (url === '/api/ammatit') {
      return Promise.resolve({
        data: {
          sisalto: [mockAmmatti(ammattiRyhmaKoodi1), mockAmmatti(ammattiRyhmaKoodi2)],
        },
      });
    }
  });
};

const mockEhdotukset = [
  mockKoulutusMahdollisuusEhdotus('2', 1, 'TUTKINTO', 0.9, []),
  mockTyomahdollisuusEhdotus('1', 4, 'AMMATTITIETO', ammattiRyhmaKoodi1, 0.8, []),
  mockTyomahdollisuusEhdotus('3', 3, 'AMMATTITIETO', ammattiRyhmaKoodi2, 0.7, []),
];

describe('useToolStore', () => {
  afterEach(() => {
    vi.resetAllMocks();
    useToolStore.getState().reset();
  });
  it('should have initially shoudFetchData as true and settingsHaveChanged as false', () => {
    const { getState } = useToolStore;
    const shouldFetchData = getState().shouldFetchData;
    expect(shouldFetchData).toBe(true);
    const settingsHaveChanged = getState().settingsHaveChanged;
    expect(settingsHaveChanged).toBe(false);
  });

  it('should set shouldFetchData to true and settingsHaveChanged to true when osaamiset are set', () => {
    const { getState, setState } = useToolStore;
    setState({ shouldFetchData: false, settingsHaveChanged: false });
    getState().setOsaamiset(mockOsaamiset);

    const osaamiset = getState().osaamiset;
    expect(osaamiset).toEqual(mockOsaamiset);
    const shouldFetchData = getState().shouldFetchData;
    expect(shouldFetchData).toBe(true);
    const settingsHaveChanged = getState().settingsHaveChanged;
    expect(settingsHaveChanged).toBe(true);
  });

  it('should set shouldFetchData to true and settingsHaveChanged to true when OsaamisetVapaateksti is set', () => {
    const { getState, setState } = useToolStore;
    setState({ shouldFetchData: false, settingsHaveChanged: false });
    getState().setOsaamisetVapaateksti(mockOsaamisetVapaateksti);

    const osaamisetVapaateksti = getState().osaamisetVapaateksti;
    expect(osaamisetVapaateksti).toEqual(mockOsaamisetVapaateksti);

    const shouldFetchData = getState().shouldFetchData;
    expect(shouldFetchData).toBe(true);
    const settingsHaveChanged = getState().settingsHaveChanged;
    expect(settingsHaveChanged).toBe(true);
  });

  it('should set shouldFetchData to true and settingsHaveChanged to true when kiinnostukset are set', () => {
    const { getState, setState } = useToolStore;
    setState({ shouldFetchData: false, settingsHaveChanged: false });
    getState().setKiinnostukset(mockKiinnostukset);

    const kiinnostukset = getState().kiinnostukset;
    expect(kiinnostukset).toEqual(mockKiinnostukset);
    const shouldFetchData = getState().shouldFetchData;
    expect(shouldFetchData).toBe(true);
    const settingsHaveChanged = getState().settingsHaveChanged;
    expect(settingsHaveChanged).toBe(true);
  });

  it('should set shouldFetchData to true and settingsHaveChanged to true when KiinnostuksetVapaateksti is set', () => {
    const { getState, setState } = useToolStore;
    setState({ shouldFetchData: false, settingsHaveChanged: false });
    getState().setKiinnostuksetVapaateksti(mockKiinnostuksetVapaateksti);

    const kiinnostuksetVapaateksti = getState().kiinnostuksetVapaateksti;
    expect(kiinnostuksetVapaateksti).toEqual(mockKiinnostuksetVapaateksti);
    const shouldFetchData = getState().shouldFetchData;
    expect(shouldFetchData).toBe(true);
    const settingsHaveChanged = getState().settingsHaveChanged;
    expect(settingsHaveChanged).toBe(true);
  });

  it('should set shouldFetchData to true and settingsHaveChanged to true when OsaamisKiinnostusPainotus is set', () => {
    const { getState, setState } = useToolStore;
    setState({ shouldFetchData: false, settingsHaveChanged: false });
    getState().setOsaamisKiinnostusPainotus(70);

    const osaamisKiinnostusPainotus = getState().osaamisKiinnostusPainotus;
    expect(osaamisKiinnostusPainotus).toBe(70);
    const shouldFetchData = getState().shouldFetchData;
    expect(shouldFetchData).toBe(true);
    const settingsHaveChanged = getState().settingsHaveChanged;
    expect(settingsHaveChanged).toBe(true);
  });

  describe('updateEhdotukset', () => {
    it('should update ehdotukset', async () => {
      const mockData = [
        mockKoulutusMahdollisuusEhdotus('1', 3, 'TUTKINTO', 0.79, []),
        mockTyomahdollisuusEhdotus('2', 1, 'AMMATTITIETO', ammattiRyhmaKoodi1, 0.89, []),
      ];
      const { getState, setState } = useToolStore;
      setState({ ehdotuksetLoading: false });

      mocks.POST.mockResolvedValue({ data: mockData });

      getState().setOsaamiset(mockOsaamiset);
      getState().setOsaamisetVapaateksti(mockOsaamisetVapaateksti);
      getState().setKiinnostukset(mockKiinnostukset);
      getState().setKiinnostuksetVapaateksti(mockKiinnostuksetVapaateksti);
      getState().setOsaamisKiinnostusPainotus(10);

      const ehdotuksetLoadingBefore = getState().ehdotuksetLoading;
      expect(ehdotuksetLoadingBefore).toBe(false);

      const updateEhdotuksetPromise = getState().updateEhdotukset('fi');

      await updateEhdotuksetPromise;

      expect(mocks.POST).toHaveBeenCalledWith(
        '/api/ehdotus/mahdollisuudet',
        expect.objectContaining({
          body: {
            osaamiset: [mockOsaamiset[0].id, mockOsaamiset[1].id],
            osaamisetText: mockOsaamisetVapaateksti.fi,
            osaamisPainotus: 0.9,
            kiinnostukset: [mockKiinnostukset[0].id, mockKiinnostukset[1].id],
            kiinnostuksetText: mockKiinnostuksetVapaateksti.fi,
            kiinnostusPainotus: 0.1,
            escoListPainotus: 0.5,
            openTextPainotus: 0.5,
            rajoitePainotus: 0.5,
          },
          headers: { 'Content-Language': 'fi' },
          signal: undefined,
        }),
      );

      const ehdotuksetLoadingAfter = getState().ehdotuksetLoading;
      expect(ehdotuksetLoadingAfter).toBe(false);

      const mahdollisuusEhdotukset = getState().mahdollisuusEhdotukset;
      expect(mahdollisuusEhdotukset).toEqual({
        [mockData[0].mahdollisuusId ?? '']: mockData[0].ehdotusMetadata,
        [mockData[1].mahdollisuusId ?? '']: mockData[1].ehdotusMetadata,
      });

      const ehdotuksetCount = getState().ehdotuksetCount;
      expect(ehdotuksetCount).toEqual({ KOULUTUSMAHDOLLISUUS: 1, TYOMAHDOLLISUUS: 1 });

      const shouldFetchData = getState().shouldFetchData;
      expect(shouldFetchData).toBe(false);
    });

    it('should handle abortsignal gracefully', async () => {
      const { getState, setState } = useToolStore;
      setState({ ehdotuksetLoading: false });
      mocks.POST.mockResolvedValue({ data: [] });
      const abortController = new AbortController();

      const updateEhdotuksetPromise = getState().updateEhdotukset('fi', abortController.signal);

      abortController.abort();

      await updateEhdotuksetPromise;

      const ehdotuksetLoadingAfter = getState().ehdotuksetLoading;
      expect(ehdotuksetLoadingAfter).toBe(false);

      const mahdollisuusEhdotukset = getState().mahdollisuusEhdotukset;
      expect(mahdollisuusEhdotukset).toEqual({});

      const ehdotuksetCount = getState().ehdotuksetCount;
      expect(ehdotuksetCount).toEqual({ KOULUTUSMAHDOLLISUUS: 0, TYOMAHDOLLISUUS: 0 });
    });
  });

  describe('fetchMahdollisuudetPage', () => {
    beforeEach(() => {
      mockGetRequests();
      const { setState } = useToolStore;
      setState({ previousEhdotusUpdateLang: 'fi' });

      const mockMahdollisuusEhdotukset = mockEhdotukset.reduce((acc, ehdotus) => {
        if (ehdotus.mahdollisuusId && ehdotus.ehdotusMetadata) {
          acc[ehdotus.mahdollisuusId] = ehdotus.ehdotusMetadata;
        }
        return acc;
      }, {} as EhdotusRecord);
      setState({ mahdollisuusEhdotukset: mockMahdollisuusEhdotukset });
    });

    it('should fetch and process data correctly without filters', async () => {
      const { getState } = useToolStore;

      await getState().fetchMahdollisuudetPage();

      // Verify pagination state
      expect(getState().ehdotuksetPageNr).toBe(1);
      expect(getState().filteredMahdollisuudetCount).toBe(3);
      expect(getState().mahdollisuudetLoading).toBe(false);

      // Verify mixed opportunities are sorted correctly
      const mixedMahdollisuudet = getState().mixedMahdollisuudet;
      expect(mixedMahdollisuudet).toHaveLength(3);
      expect(mixedMahdollisuudet).toEqual([
        expect.objectContaining({
          id: '2',
          mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS',
          tyyppi: 'TUTKINTO',
        }),
        expect.objectContaining({
          id: '1',
          mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
          aineisto: 'AMMATTITIETO',
        }),
        expect.objectContaining({
          id: '3',
          mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
          aineisto: 'AMMATTITIETO',
        }),
      ]);

      // Verify ammattiryhmaNimet mapping
      const ammattiryhmaNimet = getState().ammattiryhmaNimet;
      expect(Object.keys(ammattiryhmaNimet ?? {})).toHaveLength(2);
      expect(ammattiryhmaNimet).toEqual({
        [mockAmmattiRyhmaURI(ammattiRyhmaKoodi1)]: mockAmmatti(ammattiRyhmaKoodi1).nimi,
        [mockAmmattiRyhmaURI(ammattiRyhmaKoodi2)]: mockAmmatti(ammattiRyhmaKoodi2).nimi,
      });

      // Verify API calls
      expect(mocks.GET).toHaveBeenCalledTimes(3);
      expect(mocks.GET).toHaveBeenCalledWith('/api/koulutusmahdollisuudet', expect.any(Object));
      expect(mocks.GET).toHaveBeenCalledWith('/api/tyomahdollisuudet', expect.any(Object));
      expect(mocks.GET).toHaveBeenCalledWith('/api/ammatit', expect.any(Object));
    });

    it('should sort mahdollisuudet correctly by alphabetical order', async () => {
      const { getState, setState } = useToolStore;
      // Set filter to sort by alphabetical order
      setState({ sorting: 'ALPHABET' });

      await getState().fetchMahdollisuudetPage();
      const mixedMahdollisuudet = getState().mixedMahdollisuudet;

      expect(mixedMahdollisuudet).toHaveLength(3);
      expect(mixedMahdollisuudet).toEqual([
        expect.objectContaining({
          id: '2',
          mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS',
          tyyppi: 'TUTKINTO',
        }),
        expect.objectContaining({
          id: '3',
          mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
          aineisto: 'AMMATTITIETO',
        }),
        expect.objectContaining({
          id: '1',
          mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
          aineisto: 'AMMATTITIETO',
        }),
      ]);
    });

    it('should filter mahdollisuudet by KOULUTUSMAHDOLLISUUS type correctly', async () => {
      const { getState, setState } = useToolStore;
      // Set filter to only include KOULUTUSMAHDOLLISUUS
      setState({ filters: { ...DEFAULT_FILTERS, opportunityType: ['KOULUTUSMAHDOLLISUUS'] } });
      await getState().fetchMahdollisuudetPage();

      const mixedMahdollisuudet = getState().mixedMahdollisuudet;
      expect(mixedMahdollisuudet).toHaveLength(1);
      expect(mixedMahdollisuudet).toEqual([
        expect.objectContaining({
          id: '2',
          mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS',
          tyyppi: 'TUTKINTO',
        }),
      ]);
    });

    it('should filter mahdollisuudet by TYOMAHDOLLISUUS type correctly', async () => {
      const { getState, setState } = useToolStore;
      // Set filter to only include TYOMAHDOLLISUUS
      setState({ filters: { ...DEFAULT_FILTERS, opportunityType: ['TYOMAHDOLLISUUS'] } });
      await getState().fetchMahdollisuudetPage();

      const mixedMahdollisuudet = getState().mixedMahdollisuudet;
      expect(mixedMahdollisuudet).toHaveLength(2);
      expect(mixedMahdollisuudet).toEqual([
        expect.objectContaining({
          id: '1',
          mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
          aineisto: 'AMMATTITIETO',
        }),
        expect.objectContaining({
          id: '3',
          mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
          aineisto: 'AMMATTITIETO',
        }),
      ]);
    });

    it('should filter mahdollisuudet by education type TUTKINTO and opportunity type KOULUTUSMAHDOLLISUUS correctly', async () => {
      const { getState, setState } = useToolStore;
      // Set filter to only include education type TUTKINTO
      setState({
        filters: {
          ...DEFAULT_FILTERS,
          opportunityType: ['KOULUTUSMAHDOLLISUUS'],
          educationOpportunityType: ['TUTKINTO'],
        },
      });
      await getState().fetchMahdollisuudetPage();

      const mixedMahdollisuudet = getState().mixedMahdollisuudet;
      expect(mixedMahdollisuudet).toHaveLength(1);
      expect(mixedMahdollisuudet).toEqual([
        expect.objectContaining({
          id: '2',
          mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS',
          tyyppi: 'TUTKINTO',
        }),
      ]);
    });

    it('should filter mahdollisuudet by education type EI_TUTKINTO and opportunity type KOULUTUSMAHDOLLISUUS correctly', async () => {
      const { getState, setState } = useToolStore;
      // Set filter to only include education type EI_TUTKINTO
      setState({
        filters: {
          ...DEFAULT_FILTERS,
          opportunityType: ['KOULUTUSMAHDOLLISUUS'],
          educationOpportunityType: ['EI_TUTKINTO'],
        },
      });
      await getState().fetchMahdollisuudetPage();

      const mixedMahdollisuudet = getState().mixedMahdollisuudet;
      expect(mixedMahdollisuudet).toHaveLength(0);
    });
    it('should filter mahdollisuudet by job type AMMATTITIETO and opportunity type TYOMAHDOLLISUUS correctly', async () => {
      const { getState, setState } = useToolStore;
      // Set filter to only include job type AMMATTITIETO
      setState({
        filters: {
          ...DEFAULT_FILTERS,
          opportunityType: ['TYOMAHDOLLISUUS'],
          jobOpportunityType: ['AMMATTITIETO'],
        },
      });
      await getState().fetchMahdollisuudetPage();

      const mixedMahdollisuudet = getState().mixedMahdollisuudet;
      expect(mixedMahdollisuudet).toHaveLength(2);
    });

    it('should filter mahdollisuudet by job type TMT and opportunity type TYOMAHDOLLISUUS correctly', async () => {
      const { getState, setState } = useToolStore;
      // Set filter to only include job type TMT
      setState({
        filters: {
          ...DEFAULT_FILTERS,
          opportunityType: ['TYOMAHDOLLISUUS'],
          jobOpportunityType: ['TMT'],
        },
      });
      await getState().fetchMahdollisuudetPage();

      const mixedMahdollisuudet = getState().mixedMahdollisuudet;
      expect(mixedMahdollisuudet).toHaveLength(0);
    });

    it('should filter mahdollisuudet by ammattiryhmat correctly', async () => {
      const { getState, setState } = useToolStore;
      // Set filter to only include ammattiryhmaTunnus2
      setState({
        filters: {
          ...DEFAULT_FILTERS,
          ammattiryhmat: [mockAmmattiRyhmaURI('2')],
        },
      });
      await getState().fetchMahdollisuudetPage();
      const mixedMahdollisuudet = getState().mixedMahdollisuudet;
      expect(mixedMahdollisuudet).toHaveLength(2);
      expect(mixedMahdollisuudet).toEqual([
        expect.objectContaining({
          id: '2',
          mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS',
          tyyppi: 'TUTKINTO',
        }),
        expect.objectContaining({
          id: '1',
          mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
          aineisto: 'AMMATTITIETO',
        }),
      ]);
    });

    it('should try to fetch mahdollisuudet with empty ehdotukset', async () => {
      const { getState, setState } = useToolStore;
      setState({ mahdollisuusEhdotukset: {} });

      mocks.POST.mockResolvedValueOnce({ data: [] });

      await getState().fetchMahdollisuudetPage();

      expect(getState().mixedMahdollisuudet).toEqual([]);
      expect(getState().filteredMahdollisuudetCount).toBe(0);
      expect(getState().mahdollisuudetLoading).toBe(false);

      expect(mocks.POST).toHaveBeenCalledWith('/api/ehdotus/mahdollisuudet', expect.any(Object));
    });
  });
});
