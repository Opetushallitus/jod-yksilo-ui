import { client } from '@/api/client';
import { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { paginate, sortByProperty } from '@/utils';
import { PageChangeDetails } from '@jod/design-system';
import { create } from 'zustand';

interface FavoritesState {
  suosikit: components['schemas']['SuosikkiDto'][];
  suosikitLoading: boolean;
  pageNr: number;
  pageSize: number;
  totalItems: number;
  pageData: TypedMahdollisuus[];
  filters: MahdollisuusTyyppi[];
  excludedIds: string[];

  setFilters: (state: MahdollisuusTyyppi[]) => void;
  setTotalItems: (state: number) => void;
  setExcludedIds: (state: string[]) => void;
  setSuosikit: (state: components['schemas']['SuosikkiDto'][]) => void;
  setPageData: (state: TypedMahdollisuus[]) => void;
  fetchSuosikit: () => Promise<void>;
  deleteSuosikki: (kohdeId: string) => Promise<void>;
  fetchPage: (details: PageChangeDetails) => Promise<void>;
}

const filterSuosikit = (
  suosikit: components['schemas']['SuosikkiDto'][],
  filters: MahdollisuusTyyppi[],
  excludedIds: string[] = [],
) => {
  const withoutExcluded = suosikit.filter((item) => !excludedIds.includes(item.kohdeId));

  if (filters.includes('TYOMAHDOLLISUUS') && filters.includes('KOULUTUSMAHDOLLISUUS')) {
    return withoutExcluded;
  } else if (filters.includes('TYOMAHDOLLISUUS')) {
    return withoutExcluded.filter((item) => item.tyyppi === 'TYOMAHDOLLISUUS');
  } else if (filters.includes('KOULUTUSMAHDOLLISUUS')) {
    return withoutExcluded.filter((item) => item.tyyppi === 'KOULUTUSMAHDOLLISUUS');
  }
  return [];
};

export const useSuosikitStore = create<FavoritesState>()((set, get) => ({
  suosikit: [],
  suosikitLoading: false,
  pageNr: 1,
  totalItems: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  filters: ['TYOMAHDOLLISUUS', 'KOULUTUSMAHDOLLISUUS'],
  pageData: [],
  excludedIds: [],
  setTotalItems: (state) => set({ totalItems: state }),
  setSuosikit: (state) => set({ suosikit: state }),
  setPageData: (state) => set({ pageData: state }),
  setFilters: (state) => set({ filters: state }),
  setExcludedIds: (state) => set({ excludedIds: state }),

  deleteSuosikki: async (mahdollisuusId: string) => {
    const { suosikitLoading, suosikit, fetchSuosikit, pageData, pageNr, pageSize, fetchPage } = get();
    if (suosikitLoading) {
      return;
    }

    const suosikkiId = suosikit.find((s) => s.kohdeId === mahdollisuusId)?.id;

    if (!suosikkiId) {
      return;
    }

    set({ suosikitLoading: true });
    await client.DELETE('/api/profiili/suosikit', {
      params: {
        query: { id: suosikkiId },
      },
    });

    // Remove the deleted item from the pageData
    set({ pageData: pageData.filter((t) => t.id !== mahdollisuusId) });

    await fetchSuosikit();

    // Page data hasn't been updated yet after filtering, so we can check if the length is 1
    if (pageData.length === 1) {
      const isLastPage = Math.ceil(suosikit.length / pageSize) === pageNr;
      // When on last page, fetch the previous page, otherwise reload the current page.
      if (isLastPage) {
        await fetchPage({ page: pageNr - 1, pageSize });
      } else {
        await fetchPage({ page: pageNr, pageSize });
      }
    }
    set({ suosikitLoading: false });
  },

  fetchSuosikit: async () => {
    set({ suosikitLoading: true });
    const { excludedIds = [] } = get();
    try {
      const { data = [] } = await client.GET('/api/profiili/suosikit');
      const suosikit = [...data].filter((s) => !excludedIds.includes(s.kohdeId)).sort(sortByProperty('luotu'));
      set({ suosikit });
    } catch (_error) {
      set({ suosikit: get().suosikit ?? [] });
    }
    set({ suosikitLoading: false });
  },

  fetchPage: async ({ page: requestedPage }: PageChangeDetails) => {
    const { pageSize, suosikit, filters, excludedIds, pageData, pageNr } = get();
    let safePageNr = requestedPage;

    // Do not fetch data for opportunities if there are no favorites
    if (!suosikit.length) {
      set({ pageData: [] });
      return;
    }

    const filteredSuosikit = filterSuosikit(suosikit, filters, excludedIds);
    const totalPages = Math.ceil(filteredSuosikit.length / pageSize);

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
        totalItems: filteredSuosikit.length,
      });
    }
    const paginated = paginate(filteredSuosikit, safePageNr, pageSize);
    const hasTyomahdollisuus = paginated.findIndex((s) => s.tyyppi === 'TYOMAHDOLLISUUS') > -1;
    const hasKoulutusMahdollisuus = paginated.findIndex((s) => s.tyyppi === 'KOULUTUSMAHDOLLISUUS') > -1;

    const [tyomahdollisuudetResponse, koulutusmahdollisuudetResponse] = await Promise.all([
      hasTyomahdollisuus
        ? client.GET('/api/tyomahdollisuudet', {
            params: {
              query: {
                id: paginated.filter((item) => item.tyyppi === 'TYOMAHDOLLISUUS').map((item) => item.kohdeId),
              },
            },
          })
        : { data: undefined },

      hasKoulutusMahdollisuus
        ? client.GET('/api/koulutusmahdollisuudet', {
            params: {
              query: {
                id: paginated.filter((item) => item.tyyppi === 'KOULUTUSMAHDOLLISUUS').map((item) => item.kohdeId),
              },
            },
          })
        : { data: undefined },
    ]);

    const { data: tyomahdollisuudet } = tyomahdollisuudetResponse;
    const { data: koulutusmahdollisuudet } = koulutusmahdollisuudetResponse;

    const typedTyomahdollisuudet = (tyomahdollisuudet?.sisalto ?? []).map((tm) => ({
      ...tm,
      mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
    }));
    const typedKoulutusmahdollisuudet = (koulutusmahdollisuudet?.sisalto ?? []).map((tm) => ({
      ...tm,
      mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS',
    }));
    const sortedResultBySuosikkiOrder = [...typedTyomahdollisuudet, ...typedKoulutusmahdollisuudet].sort(
      (a, b) =>
        suosikit.findIndex((item) => item.kohdeId === b.id) - suosikit.findIndex((item) => item.kohdeId === a.id),
    ) as TypedMahdollisuus[];

    set({ pageData: sortedResultBySuosikkiOrder, pageNr: safePageNr, totalItems: filteredSuosikit.length });
  },
}));
