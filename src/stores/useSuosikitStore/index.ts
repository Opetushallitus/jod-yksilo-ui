import { client } from '@/api/client';
import { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE, PageChangeDetails } from '@/constants';
import { paginate, sortByProperty } from '@/utils';
import { create } from 'zustand';

interface FavoritesState {
  suosikit: components['schemas']['SuosikkiDto'][];
  suosikitLoading: boolean;
  pageNr: number;
  pageSize: number;
  filters: string[];
  pageData: components['schemas']['TyomahdollisuusDto'][];

  setFilters: (state: string[]) => void;
  setSuosikit: (state: components['schemas']['SuosikkiDto'][]) => void;
  setPageData: (state: components['schemas']['TyomahdollisuusDto'][]) => void;
  fetchSuosikit: () => Promise<void>;
  deleteSuosikki: (suosionKohdeId: string, type: 'work' | 'education') => Promise<void>;
  fetchPage: (details: PageChangeDetails) => Promise<void>;
}

export const useSuosikitStore = create<FavoritesState>()((set, get) => ({
  suosikit: [],
  suosikitLoading: false,
  pageNr: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  filters: [],
  pageData: [],
  setSuosikit: (state) => set({ suosikit: state }),
  setPageData: (state) => set({ pageData: state }),
  setFilters: (state) => set({ filters: state }),

  deleteSuosikki: async (mahdollisuusId: string, type: 'work' | 'education') => {
    const { suosikitLoading, suosikit, fetchSuosikit, pageData, pageNr, pageSize, fetchPage } = get();
    if (suosikitLoading) {
      return;
    }

    let suosikkiId = null;
    if (type === 'work') {
      suosikkiId = suosikit.find((s) => s.tyyppi === 'TYOMAHDOLLISUUS' && s.suosionKohdeId === mahdollisuusId)?.id;
    }

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
        await fetchPage({ page: pageNr - 1 });
      } else {
        await fetchPage({ page: pageNr });
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
    const { pageSize, suosikit } = get();

    // Do not fetch data for opportunities if there are no favorites
    if (!suosikit.length) {
      set({ pageData: [] });
      return;
    }

    const paginated = paginate(suosikit, page, pageSize);
    const { data } = await client.GET('/api/tyomahdollisuudet', {
      params: {
        query: {
          id: paginated.map((item) => item.suosionKohdeId),
        },
      },
    });
    set({ pageData: data?.sisalto ?? [] });
    set({ pageNr: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
}));
