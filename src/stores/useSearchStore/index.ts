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

        const tyomahdollisuusIds = ids
          .filter((id) => filteredMetadata.find((item) => item.id === id)?.tyyppi === 'TYOMAHDOLLISUUS')
          .filter(Boolean)
          .map((id) => id as string);

        const koulutusmahdollisuusIds = ids
          .filter((id) => filteredMetadata.find((item) => item.id === id)?.tyyppi === 'KOULUTUSMAHDOLLISUUS')
          .filter(Boolean)
          .map((id) => id as string);

        const tyomahdollisuudet =
          tyomahdollisuusIds.length > 0 ? await getTypedTyoMahdollisuusDetails(tyomahdollisuusIds) : [];

        const koulutusmahdollisuudet =
          koulutusmahdollisuusIds.length > 0 ? await getTypedKoulutusMahdollisuusDetails(koulutusmahdollisuusIds) : [];

        const koulutusalaNimet =
          koulutusmahdollisuusIds.length > 0
            ? await getEducationCodesetValues(
                koulutusmahdollisuudet.filter((k) => !!k.yleisinKoulutusala).map((k) => k.yleisinKoulutusala as string),
              ).then((res) => res.map((r) => ({ code: `${r.code}#1`, value: r.value })))
            : [];

        set({
          isLoading: false,
          resultsPageNr: pageNr,
          koulutusalaNimet,
          filteredResults: tyomahdollisuudet.concat(koulutusmahdollisuudet),
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
        if (!query || query === '') {
          return;
        }

        set({ query, hasSearchedOnce: true, isLoading: true });

        // Abort previous request if exists
        abortController.abort();
        abortController = new AbortController();
        const { data = [], error } = await client.GET('/api/mahdollisuudet/haku', {
          params: {
            query: {
              kieli: i18n.language as 'fi' | 'sv' | 'en',
              teksti: query,
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
