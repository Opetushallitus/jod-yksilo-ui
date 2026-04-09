import { client } from '@/api/client';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from '@/api/mahdollisuusService';
import type { components } from '@/api/schema';
import i18n from '@/i18n/config';
import type { OpportunitySortingValue } from '@/routes/Tool/utils';
import type { TypedMahdollisuus } from '@/routes/types';
import { DEFAULT_SORTING } from '@/stores/useToolStore/ToolStoreModel';
import { paginate } from '@/utils';
import { getEducationCodesetValues } from '@/utils/codes/codes';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

let abortController = new AbortController();
const UNFILTERED_SEARCH_PAGE_SIZE = 500;

interface UnfilteredPageResponse<T> {
  data?: {
    sisalto?: T[];
    sivuja?: number;
  };
  error?: unknown;
}

const fetchAllUnfilteredPages = async <T>(
  path: '/api/tyomahdollisuudet' | '/api/koulutusmahdollisuudet',
  signal: AbortSignal,
): Promise<T[]> => {
  const firstPage = (await client.GET(path, {
    params: {
      query: {
        sivu: 0,
        koko: UNFILTERED_SEARCH_PAGE_SIZE,
      },
    },
    signal,
  })) as UnfilteredPageResponse<T>;

  if (firstPage.error) {
    return [];
  }

  const firstContent = firstPage.data?.sisalto ?? [];
  const totalPages = firstPage.data?.sivuja ?? 1;

  if (totalPages <= 1) {
    return firstContent;
  }

  const remainingRequests = Array.from(
    { length: totalPages - 1 },
    (_, index) =>
      client.GET(path, {
        params: {
          query: {
            sivu: index + 1,
            koko: UNFILTERED_SEARCH_PAGE_SIZE,
          },
        },
        signal,
      }) as Promise<UnfilteredPageResponse<T>>,
  );

  const remainingPages = await Promise.all(remainingRequests);
  const remainingContent = remainingPages.flatMap((page) => page.data?.sisalto ?? []);

  return firstContent.concat(remainingContent);
};
interface SearchStoreState {
  query: string;
  allMetadata: components['schemas']['MahdollisuusDto'][];
  filteredMetadata: components['schemas']['MahdollisuusDto'][];
  filteredResults: TypedMahdollisuus[];
  isLoading: boolean;
  resultsPageSize: number;
  resultsPageNr: number;
  sorting: OpportunitySortingValue;
  previousEhdotusUpdateLang: string;
  settingsHaveChanged?: boolean;
  hasSearchedOnce?: boolean;
  koulutusalaNimet: Awaited<ReturnType<typeof getEducationCodesetValues>>;
  filters: {
    ammatti: boolean;
    muuTyomahdollisuus: boolean;
    tutkinto: boolean;
    muuKoulutusmahdollisuus: boolean;
  };

  search: (query: string) => Promise<void>;
  setQuery: (query: string) => void;
  fetchPage: (pageNr?: number) => Promise<void>;
  setPageNr: (pageNr: number) => void;
  toggleFilter: (name: keyof SearchStoreState['filters']) => void;
  applyFilters: () => components['schemas']['MahdollisuusDto'][];
}

export const useSearchStore = create<SearchStoreState>()(
  persist(
    (set, get) => ({
      allMetadata: [],
      filteredMetadata: [],
      filteredResults: [],

      toggleFilter: (name) => {
        const { filters, fetchPage } = get();
        set({ filters: { ...filters, [name]: !filters[name] } });
        fetchPage(1);
      },
      filters: {
        ammatti: false,
        muuTyomahdollisuus: false,
        tutkinto: false,
        muuKoulutusmahdollisuus: false,
      },
      isLoading: false,
      previousEhdotusUpdateLang: '',
      query: '',
      resultsPageNr: 1,
      resultsPageSize: 10,
      settingsHaveChanged: false,
      sorting: DEFAULT_SORTING,
      koulutusalaNimet: [],
      setPageNr: (resultsPageNr: number) => set({ resultsPageNr }),
      setQuery: (query: string) => set({ query }),
      fetchPage: async (pageNr = 1) => {
        const { resultsPageSize, applyFilters } = get();
        const filteredMetadata = applyFilters();

        set({ isLoading: true });

        const ids = paginate(
          filteredMetadata.map((item) => item.id),
          pageNr,
          resultsPageSize,
        );

        const tyomahdollisuusIds = ids.filter(
          (id) => filteredMetadata.find((item) => item.id === id)?.tyyppi === 'TYOMAHDOLLISUUS',
        );

        const koulutusmahdollisuusIds = ids.filter(
          (id) => filteredMetadata.find((item) => item.id === id)?.tyyppi === 'KOULUTUSMAHDOLLISUUS',
        );

        const [tyomahdollisuudet, koulutusmahdollisuudet] = await Promise.all([
          getTypedTyoMahdollisuusDetails(tyomahdollisuusIds),
          getTypedKoulutusMahdollisuusDetails(koulutusmahdollisuusIds),
        ]);

        const koulutusalaNimet =
          koulutusmahdollisuusIds.length > 0
            ? await getEducationCodesetValues(
                koulutusmahdollisuudet.filter((k) => !!k.yleisinKoulutusala).map((k) => k.yleisinKoulutusala as string),
              ).then((res) => res.map((r) => ({ code: `${r.code}#1`, value: r.value })))
            : [];

        // Re-order results to match the original backend ranking (ids order)
        const allResults = tyomahdollisuudet.concat(koulutusmahdollisuudet);
        const resultsById = new Map(allResults.map((item) => [item.id, item]));
        const orderedResults = ids.map((id) => resultsById.get(id)).filter((item) => item !== undefined);

        set({
          isLoading: false,
          resultsPageNr: pageNr,
          koulutusalaNimet,
          filteredResults: orderedResults,
        });
      },
      applyFilters: () => {
        // Apply filters
        const { filters, allMetadata } = get();

        const filteredMetadata = [];
        const allFalseOrTrue =
          Object.values(filters).every((value) => value === false) ||
          Object.values(filters).every((value) => value === true);

        // If all or no filters are selected, return all results
        if (allFalseOrTrue) {
          filteredMetadata.push(...allMetadata);
        }
        if (filters.ammatti) {
          filteredMetadata.push(...allMetadata.filter((item) => item.aineisto === 'AMMATTITIETO'));
        }
        if (filters.muuTyomahdollisuus) {
          filteredMetadata.push(...allMetadata.filter((item) => item.aineisto === 'TMT'));
        }
        if (filters.tutkinto) {
          filteredMetadata.push(...allMetadata.filter((item) => item.koulutusTyyppi === 'TUTKINTO'));
        }
        if (filters.muuKoulutusmahdollisuus) {
          filteredMetadata.push(...allMetadata.filter((item) => item.koulutusTyyppi === 'EI_TUTKINTO'));
        }
        set({ filteredMetadata });
        return filteredMetadata;
      },
      search: async (query: string) => {
        const trimmedQuery = query.trim();
        const normalizedQuery = trimmedQuery.length >= 3 ? trimmedQuery : '';

        set({ query: normalizedQuery, hasSearchedOnce: true, isLoading: true });

        // Abort previous request if exists
        abortController.abort();
        abortController = new AbortController();

        if (normalizedQuery === '') {
          const [tyomahdollisuudet, koulutusmahdollisuudet] = await Promise.all([
            fetchAllUnfilteredPages<components['schemas']['TyomahdollisuusDto']>(
              '/api/tyomahdollisuudet',
              abortController.signal,
            ),
            fetchAllUnfilteredPages<components['schemas']['KoulutusmahdollisuusDto']>(
              '/api/koulutusmahdollisuudet',
              abortController.signal,
            ),
          ]);

          const allMetadata: components['schemas']['MahdollisuusDto'][] = [
            ...tyomahdollisuudet.map((item) => ({
              id: item.id,
              tyyppi: 'TYOMAHDOLLISUUS' as const,
              aineisto: item.aineisto,
              ammattiryhma: item.ammattiryhma?.uri,
            })),
            ...koulutusmahdollisuudet.map((item) => ({
              id: item.id,
              tyyppi: 'KOULUTUSMAHDOLLISUUS' as const,
              koulutusTyyppi: item.tyyppi,
              kestoMinimi: item.kesto?.minimi,
              kesto: item.kesto?.mediaani,
              kestoMaksimi: item.kesto?.maksimi,
            })),
          ];

          set({ allMetadata, isLoading: false });
          await get().fetchPage(1);
          return;
        }

        const { data = [], error } = await client.GET('/api/mahdollisuudet/haku', {
          params: {
            query: {
              kieli: i18n.language as 'fi' | 'sv' | 'en',
              teksti: normalizedQuery,
            },
          },
          signal: abortController.signal,
        });

        if (error || !data || data.length === 0) {
          set({ isLoading: false, allMetadata: [], filteredResults: [], filteredMetadata: [] });
          if (error) {
            // eslint-disable-next-line no-console
            console.error('Search error:', error);
          }
        }

        set({ allMetadata: data, isLoading: false });

        await get().fetchPage(1);
      },
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => sessionStorage),
      version: 0,
      migrate: () => {
        sessionStorage.removeItem('search-storage');
      },
    },
  ),
);
