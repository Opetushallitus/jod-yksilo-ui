import { ammatit } from '@/api/ammatit';
import { client } from '@/api/client';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from '@/api/mahdollisuusService';
import type { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import type { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { paginate, sortByProperty } from '@/utils';
import type { PageChangeDetails } from '@jod/design-system';
import { create } from 'zustand';

interface FavoritesState {
  ammattiryhmaNimet?: Record<string, components['schemas']['LokalisoituTeksti']>;
  deleteSuosikki: (kohdeId: string) => Promise<void>;
  excludedIds: string[];
  fetchPage: (details: PageChangeDetails) => Promise<void>;
  fetchSuosikit: () => Promise<void>;
  filters: MahdollisuusTyyppi[];
  pageData: TypedMahdollisuus[];
  pageNr: number;
  pageSize: number;
  reset: () => void;
  setExcludedIds: (state: string[]) => void;
  setFilters: (state: MahdollisuusTyyppi[]) => void;
  setSuosikit: (state: components['schemas']['SuosikkiDto'][]) => void;
  suosikit: components['schemas']['SuosikkiDto'][];
  suosikitLoading: boolean;
  totalItems: number;
  totalPages: number;
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

const initialState: Pick<
  FavoritesState,
  | 'suosikit'
  | 'suosikitLoading'
  | 'pageNr'
  | 'totalItems'
  | 'totalPages'
  | 'pageSize'
  | 'filters'
  | 'pageData'
  | 'excludedIds'
> = {
  suosikit: [],
  suosikitLoading: false,
  pageNr: 1,
  totalItems: 0,
  totalPages: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  filters: ['TYOMAHDOLLISUUS', 'KOULUTUSMAHDOLLISUUS'],
  pageData: [],
  excludedIds: [],
};

export const useSuosikitStore = create<FavoritesState>()((set, get) => ({
  ...initialState,
  ammattiryhmaNimet: {},
  reset: () => {
    set(initialState);
  },
  setSuosikit: (state) => set({ suosikit: state }),
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
        totalPages: Math.ceil(filteredSuosikit.length / pageSize),
      });
    }
    const paginated = paginate(filteredSuosikit, safePageNr, pageSize);
    const hasTyomahdollisuus = paginated.findIndex((s) => s.tyyppi === 'TYOMAHDOLLISUUS') > -1;
    const hasKoulutusMahdollisuus = paginated.findIndex((s) => s.tyyppi === 'KOULUTUSMAHDOLLISUUS') > -1;

    const [typedTyomahdollisuudet, typedKoulutusmahdollisuudet] = await Promise.all([
      hasTyomahdollisuus
        ? getTypedTyoMahdollisuusDetails(
            paginated.filter((item) => item.tyyppi === 'TYOMAHDOLLISUUS').map((item) => item.kohdeId),
          )
        : [],

      hasKoulutusMahdollisuus
        ? getTypedKoulutusMahdollisuusDetails(
            paginated.filter((item) => item.tyyppi === 'KOULUTUSMAHDOLLISUUS').map((item) => item.kohdeId),
          )
        : [],
    ]);

    const sortedResultBySuosikkiOrder = [...typedTyomahdollisuudet, ...typedKoulutusmahdollisuudet].sort(
      (a, b) =>
        suosikit.findIndex((item) => item.kohdeId === b.id) - suosikit.findIndex((item) => item.kohdeId === a.id),
    );

    const ammattiryhmaNimet = { ...get().ammattiryhmaNimet };

    const ammattiryhmaUris = sortedResultBySuosikkiOrder
      .filter((m) => m.ammattiryhma && !ammattiryhmaNimet?.[m.ammattiryhma])
      .map((m) => m.ammattiryhma!);

    if (ammattiryhmaUris.length > 0) {
      const ammattiryhmat = await ammatit.find(ammattiryhmaUris);

      ammattiryhmat.forEach((ar) => {
        ammattiryhmaNimet[ar.uri] = ar.nimi;
      });
    }

    set({
      ammattiryhmaNimet,
      pageData: sortedResultBySuosikkiOrder,
      pageNr: safePageNr,
      totalItems: filteredSuosikit.length,
      totalPages: Math.ceil(filteredSuosikit.length / pageSize),
    });
  },
}));
