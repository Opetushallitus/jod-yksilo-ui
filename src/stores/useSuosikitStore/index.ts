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
  pageData: TypedMahdollisuus[];
  filters: MahdollisuusTyyppi[];

  setFilters: (state: MahdollisuusTyyppi[]) => void;
  setSuosikit: (state: components['schemas']['SuosikkiDto'][]) => void;
  setPageData: (state: TypedMahdollisuus[]) => void;
  fetchSuosikit: () => Promise<void>;
  deleteSuosikki: (suosionKohdeId: string) => Promise<void>;
  fetchPage: (details: PageChangeDetails) => Promise<void>;
}

const filterSuosikit = (suosikit: components['schemas']['SuosikkiDto'][], filters: MahdollisuusTyyppi[]) => {
  if (filters.includes('TYOMAHDOLLISUUS') && filters.includes('KOULUTUSMAHDOLLISUUS')) {
    return suosikit;
  } else if (filters.includes('TYOMAHDOLLISUUS')) {
    return suosikit.filter((item) => item.tyyppi === 'TYOMAHDOLLISUUS');
  } else if (filters.includes('KOULUTUSMAHDOLLISUUS')) {
    return suosikit.filter((item) => item.tyyppi === 'KOULUTUSMAHDOLLISUUS');
  }
  return [];
};

export const useSuosikitStore = create<FavoritesState>()((set, get) => ({
  suosikit: [],
  suosikitLoading: false,
  pageNr: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  filters: ['TYOMAHDOLLISUUS', 'KOULUTUSMAHDOLLISUUS'],
  pageData: [],
  setSuosikit: (state) => set({ suosikit: state }),
  setPageData: (state) => set({ pageData: state }),
  setFilters: (state) => set({ filters: state }),

  deleteSuosikki: async (mahdollisuusId: string) => {
    const { suosikitLoading, suosikit, fetchSuosikit, pageData, pageNr, pageSize, fetchPage } = get();
    if (suosikitLoading) {
      return;
    }

    const suosikkiId = suosikit.find((s) => s.suosionKohdeId === mahdollisuusId)?.id;

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
    try {
      const { data: suosikit = [] } = await client.GET('/api/profiili/suosikit');
      set({ suosikit: [...suosikit].sort(sortByProperty('luotu')) });
    } catch (error) {
      set({ suosikit: get().suosikit ?? [] });
    }
    set({ suosikitLoading: false });
  },

  fetchPage: async ({ page }: PageChangeDetails) => {
    const { pageSize, suosikit, filters } = get();

    // Do not fetch data for opportunities if there are no favorites
    if (!suosikit.length) {
      set({ pageData: [] });
      return;
    }

    const filteredSuosikit = filterSuosikit(suosikit, filters);
    const paginated = paginate(filteredSuosikit, page, pageSize);

    const hasTyomahdollisuus = filteredSuosikit.findIndex((s) => s.tyyppi === 'TYOMAHDOLLISUUS') > -1;
    const hasKoulutusMahdollisuus = filteredSuosikit.findIndex((s) => s.tyyppi === 'KOULUTUSMAHDOLLISUUS') > -1;

    const [tyomahdollisuudetResponse, koulutusmahdollisuudetResponse] = await Promise.all([
      hasTyomahdollisuus
        ? client.GET('/api/tyomahdollisuudet', {
            params: {
              query: {
                id: paginated.filter((item) => item.tyyppi === 'TYOMAHDOLLISUUS').map((item) => item.suosionKohdeId),
              },
            },
          })
        : { data: undefined },

      hasKoulutusMahdollisuus
        ? client.GET('/api/koulutusmahdollisuudet', {
            params: {
              query: {
                id: paginated
                  .filter((item) => item.tyyppi === 'KOULUTUSMAHDOLLISUUS')
                  .map((item) => item.suosionKohdeId),
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
        suosikit.findIndex((item) => item.suosionKohdeId === b.id) -
        suosikit.findIndex((item) => item.suosionKohdeId === a.id),
    ) as TypedMahdollisuus[];

    set({ pageData: sortedResultBySuosikkiOrder });
    set({ pageNr: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
}));
