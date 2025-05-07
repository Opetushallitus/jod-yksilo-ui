/* eslint-disable sonarjs/no-clear-text-protocols */
import { client } from '@/api/client';
import { getTypedKoulutusMahdollisuusDetails } from '@/api/mahdollisuusService';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import i18n from '@/i18n/config';
import { TypedMahdollisuus } from '@/routes/types';
import { paginate, sortByProperty } from '@/utils';
import { PageChangeDetails } from '@jod/design-system';
import { create } from 'zustand/react';
export interface EhdotetutVaiheetState {
  ehdotukset: components['schemas']['EhdotusDto'][];
  isLoading: boolean;
  pageNr: number;
  pageSize: number;
  totalItems: number;
  pageData: TypedMahdollisuus[];
  excludedIds: string[];

  setTotalItems: (state: number) => void;
  setExcludedIds: (state: string[]) => void;
  setEhdotukset: (state: components['schemas']['EhdotusDto'][]) => void;
  setPageData: (state: TypedMahdollisuus[]) => void;
  fetchPage: (details: Pick<PageChangeDetails, 'page'>) => Promise<void>;
  fetchEhdotukset: (ids: string[]) => Promise<void>;
  setIsLoading: (state: boolean) => void;
}

export const useEhdotetutVaiheetStore = create<EhdotetutVaiheetState>()((set, get) => ({
  ehdotukset: [],
  isLoading: false,
  pageNr: 1,
  totalItems: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  pageData: [],
  excludedIds: [],
  setTotalItems: (state) => set({ totalItems: state }),
  setEhdotukset: (state) => set({ ehdotukset: state }),
  setPageData: (state) => set({ pageData: state }),
  setExcludedIds: (state) => set({ excludedIds: state }),
  setIsLoading: (state) => set({ isLoading: state }),
  fetchEhdotukset: async (ids: string[]) => {
    set({ isLoading: true });
    const { data, error } = await client.POST('/api/ehdotus/mahdollisuudet/polku', {
      body: ids,
    });

    if (!error) {
      set({ ehdotukset: data });
      await get().fetchPage({ page: 1 });
    } else {
      set({ ehdotukset: [], pageData: [], totalItems: 0 });
    }

    set({ isLoading: false });
  },
  fetchPage: async ({ page: requestedPage }: Pick<PageChangeDetails, 'page'>) => {
    const { pageSize, ehdotukset, excludedIds, pageData, pageNr } = get();
    let safePageNr = requestedPage;

    // Do not fetch data for opportunities if there are no ehdotukset
    if (!ehdotukset.length) {
      set({ pageData: [], isLoading: false });
      return;
    }

    const filteredEhdotukset = ehdotukset.filter((e) => e.ehdotusMetadata?.tyyppi === 'KOULUTUSMAHDOLLISUUS');
    const totalPages = Math.ceil(filteredEhdotukset.length / pageSize);

    // If the page number is too high, set it to the last page
    if (safePageNr > totalPages) {
      safePageNr = totalPages;
    }

    // If fetching the same page that is already fetched, check the excludedIds and update the current pageData.
    if (pageNr === requestedPage && pageData.length > 0) {
      const newPageData = pageData.filter((item) => !excludedIds.includes(item.id));
      set({
        pageData: newPageData,
        pageNr: safePageNr,
        totalItems: filteredEhdotukset.length,
      });
    }
    const paginated = paginate(filteredEhdotukset, safePageNr, pageSize);
    const koulutusIds = paginated.map((s) => s.mahdollisuusId ?? '').filter(Boolean);

    set({ isLoading: true });

    const typedKoulutusmahdollisuudet = await getTypedKoulutusMahdollisuusDetails(koulutusIds);

    const mockOsaamiset = await osaamiset.find([
      'http://data.europa.eu/esco/skill/089ddb19-1c7a-43ff-ba64-070f7ce4787a',
      'http://data.europa.eu/esco/skill/09fd83e2-2e47-4e56-9200-0393c05f9a71',
      'http://data.europa.eu/esco/skill/0cf27a00-947f-473d-af1a-24028c17ba27',
      'http://data.europa.eu/esco/skill/0e89c75a-0f10-4d4c-b85c-ca7cfbeb9352',
      'http://data.europa.eu/esco/skill/120e54ef-b480-4d49-bf8d-591dbd3598f5',
    ]);

    set({
      pageData: typedKoulutusmahdollisuudet.map((m) => ({
        ...m,
        osaamiset: [...mockOsaamiset].sort(sortByProperty(`nimi.${i18n.language}`)),
      })),
      pageNr: safePageNr,
      totalItems: filteredEhdotukset.length,
      isLoading: false,
    });
  },
}));
