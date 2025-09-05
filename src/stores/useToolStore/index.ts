import { ammatit } from '@/api/ammatit';
import { client } from '@/api/client';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from '@/api/mahdollisuusService';
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
  ammattiryhmaNimet?: Record<string, components['schemas']['LokalisoituTeksti']>;
  osaamiset: OsaaminenValue[];
  osaamisetVapaateksti?: components['schemas']['LokalisoituTeksti'];
  kiinnostukset: OsaaminenValue[];
  kiinnostuksetVapaateksti?: components['schemas']['LokalisoituTeksti'];
  suosikit: components['schemas']['SuosikkiDto'][];
  suosikitLoading: boolean;
  osaamisKiinnostusPainotus: number;
  rajoitePainotus: number;
  mahdollisuusEhdotukset: EhdotusRecord;
  tyomahdollisuudet: TypedMahdollisuus[];
  koulutusmahdollisuudet: TypedMahdollisuus[];
  mixedMahdollisuudet: TypedMahdollisuus[];
  ehdotuksetLoading: boolean;
  mahdollisuudetLoading: boolean;
  ehdotuksetPageSize: number;
  ehdotuksetPageNr: number;
  ehdotuksetCount: Record<MahdollisuusTyyppi, number>;
  sorting: OpportunitySortingValue;
  filter: OpportunityFilterValue[];
  previousEhdotusUpdateLang: string;
  weightChanged: boolean;
  reset: () => void;

  setTavoitteet: (state: ToolState['tavoitteet']) => void;
  setOsaamiset: (state: OsaaminenValue[]) => void;
  setOsaamisetVapaateksti: (state?: components['schemas']['LokalisoituTeksti']) => void;
  setKiinnostukset: (state: OsaaminenValue[]) => void;
  setKiinnostuksetVapaateksti: (state?: components['schemas']['LokalisoituTeksti']) => void;
  setSuosikit: (state: components['schemas']['SuosikkiDto'][]) => void;
  updateSuosikit: (loggedIn: boolean) => Promise<void>;
  toggleSuosikki: (kohdeId: string, tyyppi: MahdollisuusTyyppi) => Promise<void>;

  setOsaamisKiinnostusPainotus: (state: number) => void;

  updateEhdotukset: (lang: string, signal?: AbortSignal) => Promise<void>;
  fetchMahdollisuudetPage: (signal?: AbortSignal, page?: number) => Promise<void>;
  updateEhdotuksetAndTyomahdollisuudet: (loggedIn: boolean) => Promise<void>;

  setSorting: (state: string) => void;
  setFilter: (state: OpportunityFilterValue[]) => void;

  virtualAssistantOpen: boolean;
  setVirtualAssistantOpen: (state: boolean) => void;
}

export const useToolStore = create<ToolState>()(
  persist(
    (set, get) => ({
      tavoitteet: {},
      ammattiryhmaNimet: {},
      osaamiset: [],
      kiinnostukset: [],
      kiinnostuksetVapaateksti: undefined,
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
      weightChanged: false,
      previousEhdotusUpdateLang: '',
      reset: () => {
        set({
          tavoitteet: {},
          osaamiset: [],
          osaamisetVapaateksti: undefined,
          kiinnostukset: [],
          kiinnostuksetVapaateksti: undefined,
          mahdollisuusEhdotukset: {},
          tyomahdollisuudet: [],
          koulutusmahdollisuudet: [],
          mixedMahdollisuudet: [],
          weightChanged: false,
        });
      },

      setTavoitteet: (state) => set({ tavoitteet: state }),
      setOsaamiset: (state) => {
        set({ osaamiset: state });
      },
      setOsaamisetVapaateksti: (state) => {
        set({ osaamisetVapaateksti: state });
      },
      setKiinnostukset: (state) => {
        set({ kiinnostukset: state });
      },
      setKiinnostuksetVapaateksti: (state) => {
        set({ kiinnostuksetVapaateksti: state });
      },
      setSuosikit: (state) => set({ suosikit: state }),
      setOsaamisKiinnostusPainotus: (state: number) => {
        set({ osaamisKiinnostusPainotus: state, weightChanged: true });
      },
      updateEhdotukset: async (lang: string, signal?: AbortSignal) => {
        const {
          osaamiset,
          osaamisetVapaateksti,
          kiinnostukset,
          kiinnostuksetVapaateksti,
          osaamisKiinnostusPainotus,
          rajoitePainotus,
        } = get();

        set({ ehdotuksetLoading: true });
        try {
          const { data: mahdollisuusData } = await client.POST('/api/ehdotus/mahdollisuudet', {
            body: {
              osaamiset: osaamiset.map((item) => item.id),
              osaamisetText: osaamisetVapaateksti?.[lang],
              osaamisPainotus: (100 - osaamisKiinnostusPainotus) / 100,
              kiinnostukset: kiinnostukset.map((item) => item.id),
              kiinnostuksetText: kiinnostuksetVapaateksti?.[lang],
              kiinnostusPainotus: osaamisKiinnostusPainotus / 100,
              escoListPainotus: 0.5,
              openTextPainotus: 0.5,
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
          const sortedMixedMahdollisuudet: TypedMahdollisuus[] = [];

          // paginate before fetch to fetch only the ids of selected newPage
          const pagedIds = paginate(allSortedIds, newPage, ehdotuksetPageSize);
          if (filter.includes('ALL')) {
            const koulutusmahdollisuusIds = pagedIds.filter((id) => ehdotukset[id].tyyppi === 'KOULUTUSMAHDOLLISUUS');
            const koulutusmahdollisuudet = await getTypedKoulutusMahdollisuusDetails(koulutusmahdollisuusIds);
            sortedMixedMahdollisuudet.push(...koulutusmahdollisuudet);
            set({ koulutusmahdollisuudet });

            const tyomahdollisuusIds = pagedIds.filter((id) => ehdotukset[id].tyyppi === 'TYOMAHDOLLISUUS');
            const tyomahdollisuudet = await getTypedTyoMahdollisuusDetails(tyomahdollisuusIds);
            sortedMixedMahdollisuudet.push(...tyomahdollisuudet);
            set({ tyomahdollisuudet });
          } else {
            if (filter.includes('TYOMAHDOLLISUUS') || filter.length === 0) {
              const ids = pagedIds.filter((id) => ehdotukset[id].tyyppi === 'TYOMAHDOLLISUUS');
              const tyomahdollisuudet = await getTypedTyoMahdollisuusDetails(ids);
              sortedMixedMahdollisuudet.push(...tyomahdollisuudet);
              set({ tyomahdollisuudet });
            }

            if (filter.includes('KOULUTUSMAHDOLLISUUS') || filter.length === 0) {
              const ids = pagedIds.filter((id) => ehdotukset[id].tyyppi === 'KOULUTUSMAHDOLLISUUS');
              const koulutusmahdollisuudet = await getTypedKoulutusMahdollisuusDetails(ids);
              sortedMixedMahdollisuudet.push(...koulutusmahdollisuudet);
              set({ koulutusmahdollisuudet });
            }
          }

          // Apply final sorting of page items based on selected sorting
          sortedMixedMahdollisuudet.sort((a, b) =>
            sorting === sortingValues.RELEVANCE
              ? // sort by scores
                (ehdotukset[b.id]?.pisteet ?? 0) - (ehdotukset[a.id]?.pisteet ?? 0)
              : // sort by backend provided lexicalOrder
                ehdotukset[a.id].aakkosIndeksi - ehdotukset[b.id].aakkosIndeksi,
          );

          // Fetch ammattiryhma names if they are not already loaded
          const ammattiryhmaNimet = { ...get().ammattiryhmaNimet };

          const ammattiryhmaUris = sortedMixedMahdollisuudet
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

        async function fetchSortedAndFilteredEhdotusIds(filter: OpportunityFilterValue[]) {
          if (Object.keys(ehdotukset).length === 0 || i18n.language !== get().previousEhdotusUpdateLang) {
            await get().updateEhdotukset(i18n.language, signal);
            ehdotukset = get().mahdollisuusEhdotukset;
            set({ previousEhdotusUpdateLang: i18n.language });
          }

          return Object.entries(ehdotukset ?? [])
            .filter(([, meta]) => {
              // If filter is empty, return all items
              if (filter.length === 0) return true;
              // If 'ALL' is included, return all items regardless of type
              if (filter.includes('ALL')) return true;
              // Otherwise, only include items whose type is in the filter
              return filter.includes(meta.tyyppi);
            })
            .sort(([, metadataA], [, metadataB]) =>
              sorting === sortingValues.RELEVANCE
                ? (metadataB?.pisteet ?? 0) - (metadataA?.pisteet ?? 0)
                : (metadataA?.aakkosIndeksi ?? 0) - (metadataB?.aakkosIndeksi ?? 0),
            )
            .map(([key]) => key);
        }
      },

      updateEhdotuksetAndTyomahdollisuudet: async (loggedIn: boolean) => {
        const { updateEhdotukset, fetchMahdollisuudetPage, updateSuosikit } = get();

        abortController.abort();
        abortController = new AbortController();
        const signal = abortController.signal;

        await updateEhdotukset(i18n.language, signal);
        await fetchMahdollisuudetPage(signal, 1);
        await updateSuosikit(loggedIn);
        set({ weightChanged: false });
      },

      toggleSuosikki: async (kohdeId: string, tyyppi: MahdollisuusTyyppi) => {
        const { suosikitLoading, suosikit, updateSuosikit } = get();

        if (suosikitLoading) {
          return;
        }

        const favorite = suosikit.find((s) => s.kohdeId === kohdeId);
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
                kohdeId,
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
        set({
          // Make sure only allowed filter values are set
          filter: state.filter((f) => Object.values(filterValues).includes(f)),
          ehdotuksetPageNr: 1,
        });
        void get().fetchMahdollisuudetPage(abortController.signal, 1);
      },
      virtualAssistantOpen: false,
      setVirtualAssistantOpen: (state) => {
        set({ virtualAssistantOpen: state });
      },
    }),
    {
      name: 'tool-storage',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
    },
  ),
);
