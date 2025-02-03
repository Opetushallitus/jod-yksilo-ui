import { client } from '@/api/client';
import { components } from '@/api/schema';
import { OsaaminenValue } from '@/components';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import i18n from '@/i18n/config';
import {
  DEFAULT_FILTER,
  DEFAULT_SORTING,
  EhdotusRecord,
  OpportunityFilterValue,
  OpportunitySortingValue,
  ehdotusDataToRecord,
  filterValues,
  sortingValues,
} from '@/routes/Tool/utils';
import { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { paginate } from '@/utils';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const SUOSIKIT_PATH = '/api/profiili/suosikit';

let abortController = new AbortController();

interface ToolState {
  tavoitteet: {
    a?: boolean;
    b?: boolean;
    c?: boolean;
    d?: boolean;
    e?: boolean;
  };
  osaamiset: OsaaminenValue[];
  kiinnostukset: OsaaminenValue[];
  suosikit: components['schemas']['SuosikkiDto'][];
  suosikitLoading: boolean;
  osaamisKiinnostusPainotus: number;
  rajoitePainotus: number;
  mahdollisuusEhdotukset: EhdotusRecord;
  tyomahdollisuudet: components['schemas']['TyomahdollisuusDto'][];
  koulutusmahdollisuudet: components['schemas']['KoulutusmahdollisuusDto'][];
  mixedMahdollisuudet: TypedMahdollisuus[];
  ehdotuksetLoading: boolean;
  mahdollisuudetLoading: boolean;
  ehdotuksetPageSize: number;
  ehdotuksetPageNr: number;
  ehdotuksetCount: Record<MahdollisuusTyyppi, number>;
  sorting: OpportunitySortingValue;
  filter: OpportunityFilterValue;
  itemCount: number;
  previousEhdotusUpdateLang: string;
  reset: () => void;

  setTavoitteet: (state: ToolState['tavoitteet']) => void;
  setOsaamiset: (state: OsaaminenValue[]) => void;
  setKiinnostukset: (state: OsaaminenValue[]) => void;
  setSuosikit: (state: components['schemas']['SuosikkiDto'][]) => void;
  updateSuosikit: (loggedIn: boolean) => Promise<void>;
  toggleSuosikki: (suosionKohdeId: string, tyyppi: MahdollisuusTyyppi) => Promise<void>;

  setOsaamisKiinnostusPainotus: (state: number) => void;
  setRajoitePainotus: (state: number) => void;

  updateEhdotukset: (lang: string, signal?: AbortSignal) => Promise<void>;
  fetchMahdollisuudetPage: (signal?: AbortSignal, page?: number) => Promise<void>;
  updateEhdotuksetAndTyomahdollisuudet: (loggedIn: boolean) => Promise<void>;

  setSorting: (state: string) => void;
  setFilter: (state: string) => void;
  updateItemCount: () => void;

  virtualAssistantOpen: boolean;
  setVirtualAssistantOpen: (state: boolean) => void;
}

export const useToolStore = create<ToolState>()(
  persist(
    (set, get) => ({
      tavoitteet: {},
      osaamiset: [],
      kiinnostukset: [],
      suosikit: [],
      suosikitLoading: false,
      osaamisKiinnostusPainotus: 50,
      kiinnostusPainotus: 50,
      rajoitePainotus: 50,
      mahdollisuusEhdotukset: {},
      tyomahdollisuudet: [],
      koulutusmahdollisuudet: [],
      mixedMahdollisuudet: [],
      ehdotuksetLoading: false,
      ehdotuksetPageSize: DEFAULT_PAGE_SIZE,
      mahdollisuudetLoading: false,
      ehdotuksetPageNr: 1,
      ehdotuksetCount: { TYOMAHDOLLISUUS: 0, KOULUTUSMAHDOLLISUUS: 0 },
      sorting: DEFAULT_SORTING,
      filter: DEFAULT_FILTER,
      itemCount: 0,
      previousEhdotusUpdateLang: '',
      reset: () => {
        set({
          tavoitteet: {},
          osaamiset: [],
          kiinnostukset: [],
          mahdollisuusEhdotukset: {},
          tyomahdollisuudet: [],
          koulutusmahdollisuudet: [],
          mixedMahdollisuudet: [],
          itemCount: 0,
        });
      },

      setTavoitteet: (state) => set({ tavoitteet: state }),
      setOsaamiset: (state) => {
        set({ osaamiset: state });
      },
      setKiinnostukset: (state) => {
        set({ kiinnostukset: state });
      },
      setSuosikit: (state) => set({ suosikit: state }),
      setOsaamisKiinnostusPainotus: (state: number) => {
        set({ osaamisKiinnostusPainotus: state });
      },
      setRajoitePainotus: (state: number) => {
        set({ rajoitePainotus: state });
      },
      updateEhdotukset: async (lang: string, signal?: AbortSignal) => {
        const { osaamiset, kiinnostukset, osaamisKiinnostusPainotus, rajoitePainotus } = get();

        set({ ehdotuksetLoading: true });
        try {
          const { data: mahdollisuusData } = await client.POST('/api/ehdotus/mahdollisuudet', {
            body: {
              osaamiset: osaamiset.map((item) => item.id),
              kiinnostukset: kiinnostukset.map((item) => item.id),
              osaamisPainotus: (100 - osaamisKiinnostusPainotus) / 100,
              kiinnostusPainotus: osaamisKiinnostusPainotus / 100,
              rajoitePainotus: rajoitePainotus / 100,
            },
            signal,
            headers: { 'Content-Language': lang },
          });

          const mahdollisuusEhdotukset = ehdotusDataToRecord(mahdollisuusData ?? []);

          set({
            mahdollisuusEhdotukset,
            ehdotuksetLoading: false,
            ehdotuksetCount: {
              TYOMAHDOLLISUUS:
                mahdollisuusData?.filter((m) => m.ehdotusMetadata?.tyyppi === 'TYOMAHDOLLISUUS').length ?? 0,
              KOULUTUSMAHDOLLISUUS:
                mahdollisuusData?.filter((m) => m.ehdotusMetadata?.tyyppi === 'KOULUTUSMAHDOLLISUUS').length ?? 0,
            },
          });
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            set({
              mahdollisuusEhdotukset: {},
              ehdotuksetLoading: false,
              ehdotuksetCount: {
                TYOMAHDOLLISUUS: 0,
                KOULUTUSMAHDOLLISUUS: 0,
              },
            });
          }
        }
      },
      fetchMahdollisuudetPage: async (signal, newPage = 1) => {
        const { filter, ehdotuksetPageSize, sorting } = get();
        let ehdotukset = get().mahdollisuusEhdotukset;

        // apply ID sorting and filter
        const allSortedIds = await fetchSortedAndFilteredEhdotusIds(filter);

        set({ mahdollisuudetLoading: true });
        try {
          const sortedMixedMahdollisuudet = [];

          // paginate before fetch to fetch only the ids of selected newPage
          const pagedIds = paginate(allSortedIds, newPage, ehdotuksetPageSize);

          // fetch tyomahdollisuudet of the page
          if ([filterValues.ALL, filterValues.TYOMAHDOLLISUUS].includes(filter)) {
            const ids = pagedIds.filter((id) => ehdotukset[id].tyyppi === 'TYOMAHDOLLISUUS');
            const tyomahdollisuudet = await fetchTyomahdollisuudet(ids).then((data) =>
              data.tyomahdollisuusResults.map(
                (tm) => ({ ...tm, mahdollisuusTyyppi: 'TYOMAHDOLLISUUS' }) as TypedMahdollisuus,
              ),
            );
            sortedMixedMahdollisuudet.push(...tyomahdollisuudet);
            set({ tyomahdollisuudet });
          }

          // fetch koulutusmahdollisuudet of the page
          if ([filterValues.ALL, filterValues.KOULUTUSMAHDOLLISUUS].includes(filter)) {
            const ids = pagedIds.filter((id) => ehdotukset[id].tyyppi === 'KOULUTUSMAHDOLLISUUS');

            const koulutusmahdollisuudet = await fetchKoulutusMahdollisuudet(ids).then((data) =>
              data.koulutusmahdollisuusResults.map(
                (km) => ({ ...km, mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS' }) as TypedMahdollisuus,
              ),
            );
            sortedMixedMahdollisuudet.push(...koulutusmahdollisuudet);

            set({
              koulutusmahdollisuudet: koulutusmahdollisuudet as (components['schemas']['KoulutusmahdollisuusDto'] & {
                mahdollisuusTyyppi: MahdollisuusTyyppi;
              })[],
            });
          }

          // Apply final sorting of page items based on selected sorting
          sortedMixedMahdollisuudet.sort((a, b) =>
            sorting === sortingValues.RELEVANCE
              ? // sort by scores
                (ehdotukset[b.id]?.pisteet ?? 0) - (ehdotukset[a.id]?.pisteet ?? 0)
              : // sort by backend provided lexicalOrder
                ehdotukset[a.id].aakkosIndeksi - ehdotukset[b.id].aakkosIndeksi,
          );

          set({
            ehdotuksetPageNr: newPage,
            mahdollisuudetLoading: false,
            mixedMahdollisuudet: sortedMixedMahdollisuudet,
          });
        } catch (_error) {
          set({
            mixedMahdollisuudet: [],
            koulutusmahdollisuudet: [],
            tyomahdollisuudet: [],
            mahdollisuudetLoading: false,
          });
        }

        async function fetchSortedAndFilteredEhdotusIds(filter: OpportunityFilterValue) {
          if (Object.keys(ehdotukset).length === 0 || i18n.language !== get().previousEhdotusUpdateLang) {
            await get().updateEhdotukset(i18n.language, signal);
            ehdotukset = get().mahdollisuusEhdotukset;
            set({ previousEhdotusUpdateLang: i18n.language });
          }

          return Object.entries(ehdotukset ?? [])
            .filter(([, meta]) => (filter === 'ALL' ? true : filter === meta.tyyppi))
            .sort(([, metadataA], [, metadataB]) =>
              sorting === sortingValues.RELEVANCE
                ? (metadataB?.pisteet ?? 0) - (metadataA?.pisteet ?? 0)
                : (metadataA?.aakkosIndeksi ?? 0) - (metadataB?.aakkosIndeksi ?? 0),
            )
            .map(([key]) => key);
        }
      },

      updateEhdotuksetAndTyomahdollisuudet: async (loggedIn: boolean) => {
        const { updateEhdotukset, fetchMahdollisuudetPage, updateSuosikit, updateItemCount } = get();

        abortController.abort();
        abortController = new AbortController();
        const signal = abortController.signal;

        await updateEhdotukset(i18n.language, signal);
        await fetchMahdollisuudetPage(signal, 1);
        await updateSuosikit(loggedIn);
        updateItemCount();
      },

      toggleSuosikki: async (suosionKohdeId: string, tyyppi: MahdollisuusTyyppi) => {
        const { suosikitLoading, suosikit, updateSuosikit } = get();

        if (suosikitLoading) {
          return;
        }

        const favorite = suosikit.find((s) => s.suosionKohdeId === suosionKohdeId);
        set({ suosikitLoading: true });
        try {
          if (favorite?.id) {
            await client.DELETE(SUOSIKIT_PATH, {
              params: {
                query: { id: favorite.id },
              },
            });
          } else {
            await client.POST(SUOSIKIT_PATH, {
              body: {
                suosionKohdeId,
                tyyppi,
              },
            });
          }
          await updateSuosikit(true);
        } catch (_error) {
          // Error, do nothing
        }
        set({ suosikitLoading: false });
      },

      updateSuosikit: async (loggedIn: boolean) => {
        set({ suosikitLoading: true });
        try {
          const { data: suosikit = [] } = loggedIn ? await client.GET(SUOSIKIT_PATH) : { data: [] };
          set({ suosikit });
        } catch (_error) {
          set({ suosikit: get().suosikit ?? [] });
        }
        set({ suosikitLoading: false });
      },

      setSorting: (state) => {
        set({ sorting: state as OpportunitySortingValue });
        void get().fetchMahdollisuudetPage(abortController.signal, get().ehdotuksetPageNr);
      },
      setFilter: (state) => {
        set({ filter: state as OpportunityFilterValue, ehdotuksetPageNr: 1 });
        void get().fetchMahdollisuudetPage(abortController.signal, 1);
        get().updateItemCount();
      },
      updateItemCount: () => {
        const { filter, ehdotuksetCount } = get();
        switch (filter) {
          case 'TYOMAHDOLLISUUS':
            set({ itemCount: ehdotuksetCount.TYOMAHDOLLISUUS });
            break;
          case 'KOULUTUSMAHDOLLISUUS':
            set({ itemCount: ehdotuksetCount.KOULUTUSMAHDOLLISUUS });
            break;
          case 'ALL':
            set({ itemCount: ehdotuksetCount.TYOMAHDOLLISUUS + ehdotuksetCount.KOULUTUSMAHDOLLISUUS });
            break;
        }
      },
      virtualAssistantOpen: false,
      setVirtualAssistantOpen: (state) => {
        set({ virtualAssistantOpen: state });
      },
    }),
    {
      name: 'tool-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

async function fetchKoulutusMahdollisuudet(ids: string[]) {
  const { data: koulutusmahdollisuudet } =
    ids.length > 0
      ? await client.GET('/api/koulutusmahdollisuudet', {
          params: {
            query: {
              id: ids,
            },
          },
        })
      : { data: undefined };

  return { koulutusmahdollisuusResults: koulutusmahdollisuudet?.sisalto ?? [] };
}

async function fetchTyomahdollisuudet(ids: string[]) {
  const { data: tyomahdollisuudet } =
    ids.length > 0
      ? await client.GET('/api/tyomahdollisuudet', {
          params: {
            query: {
              id: ids,
            },
          },
        })
      : { data: undefined };

  return { tyomahdollisuusResults: tyomahdollisuudet?.sisalto ?? [] };
}
