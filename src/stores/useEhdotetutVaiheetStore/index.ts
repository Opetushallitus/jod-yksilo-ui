import { client } from '@/api/client';
import { getTypedKoulutusMahdollisuusDetails } from '@/api/mahdollisuusService';
import { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE } from '@/constants';
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
    const sorted = [...filteredEhdotukset].sort((a, b) => {
      return a.ehdotusMetadata?.pisteet !== undefined && b.ehdotusMetadata?.pisteet !== undefined
        ? sortByProperty<components['schemas']['EhdotusMetadata']>('pisteet', true)(
            a.ehdotusMetadata,
            b.ehdotusMetadata,
          )
        : 0;
    });

    const paginated = paginate(sorted, safePageNr, pageSize);
    const koulutusIds = paginated.map((s) => s.mahdollisuusId ?? '').filter(Boolean);

    set({ isLoading: true });

    const typedKoulutusmahdollisuudet = (await getTypedKoulutusMahdollisuusDetails(koulutusIds)).sort(
      (a, b) => sorted.findIndex((e) => e.mahdollisuusId === a.id) - sorted.findIndex((e) => e.mahdollisuusId === b.id),
    );

    set({
      pageData: typedKoulutusmahdollisuudet.map((mahdollisuus) => ({
        ...mahdollisuus,
        osaamisetCount: ehdotukset.find((e) => e.mahdollisuusId === mahdollisuus.id)?.ehdotusMetadata?.osaamisia ?? 0,
      })),
      pageNr: safePageNr,
      totalItems: filteredEhdotukset.length,
      isLoading: false,
    });
  },
}));
