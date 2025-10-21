import { ammatit } from '@/api/ammatit';
import { client } from '@/api/client';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from '@/api/mahdollisuusService';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import i18n from '@/i18n/config';
import { EhdotusRecord, type OpportunitySortingValue, ehdotusDataToRecord, sortingValues } from '@/routes/Tool/utils';
import { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import {
  filterByAmmattiryhmat,
  filterByEducationType,
  filterByJobType,
  filterByRegion,
} from '@/stores/useToolStore/filters.ts';
import { DEFAULT_FILTERS, DEFAULT_SORTING, ToolFilters, ToolState } from '@/stores/useToolStore/ToolStoreModel.ts';
import { paginate } from '@/utils';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const SUOSIKIT_PATH = '/api/profiili/suosikit';

let abortController = new AbortController();

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
      filteredMahdollisuudetCount: 0,
      ehdotuksetPageNr: 1,
      ehdotuksetCount: { TYOMAHDOLLISUUS: 0, KOULUTUSMAHDOLLISUUS: 0 },
      sorting: DEFAULT_SORTING,
      filters: DEFAULT_FILTERS,
      settingsHaveChanged: false,
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
          filters: DEFAULT_FILTERS,
          sorting: DEFAULT_SORTING,
        });
      },
      resetSettings: () => {
        set({
          filters: DEFAULT_FILTERS,
          sorting: DEFAULT_SORTING,
          settingsHaveChanged: true,
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
        set({ osaamisKiinnostusPainotus: state });
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
        const { filters, ehdotuksetPageSize, sorting } = get();
        const { opportunityType } = filters;
        let ehdotukset: EhdotusRecord = get().mahdollisuusEhdotukset;
        const updateTyoMahdollisuudet = async (sortedMixedMahdollisuudet: TypedMahdollisuus[], pagedIds: string[]) => {
          const ehdotukset = get().mahdollisuusEhdotukset;
          const tyomahdollisuusIds = pagedIds.filter((id) => ehdotukset[id].tyyppi === 'TYOMAHDOLLISUUS');
          const tyomahdollisuudet = await getTypedTyoMahdollisuusDetails(tyomahdollisuusIds);
          sortedMixedMahdollisuudet.push(...tyomahdollisuudet);
          set({ tyomahdollisuudet });
        };
        const updateKoulutusMahdollisuudet = async (
          sortedMixedMahdollisuudet: TypedMahdollisuus[],
          pagedIds: string[],
        ) => {
          const ehdotukset = get().mahdollisuusEhdotukset;
          const koulutusmahdollisuusIds = pagedIds.filter((id) => ehdotukset[id].tyyppi === 'KOULUTUSMAHDOLLISUUS');
          const koulutusmahdollisuudet = await getTypedKoulutusMahdollisuusDetails(koulutusmahdollisuusIds);
          sortedMixedMahdollisuudet.push(...koulutusmahdollisuudet);
          set({ koulutusmahdollisuudet });
        };

        // apply ID sorting and filter
        const allSortedIds = await filterEhdotukset(filters);
        set({ filteredMahdollisuudetCount: allSortedIds.length });
        set({ mahdollisuudetLoading: true });
        try {
          const sortedMixedMahdollisuudet: TypedMahdollisuus[] = [];

          // paginate before fetch to fetch only the ids of selected newPage
          const pagedIds = paginate(allSortedIds, newPage, ehdotuksetPageSize);

          if (opportunityType.includes('ALL') || opportunityType.length == 0) {
            await updateKoulutusMahdollisuudet(sortedMixedMahdollisuudet, pagedIds);
            await updateTyoMahdollisuudet(sortedMixedMahdollisuudet, pagedIds);
          } else {
            if (opportunityType.includes('TYOMAHDOLLISUUS') || opportunityType.length === 0) {
              await updateTyoMahdollisuudet(sortedMixedMahdollisuudet, pagedIds);
            }
            if (opportunityType.includes('KOULUTUSMAHDOLLISUUS') || opportunityType.length === 0) {
              await updateKoulutusMahdollisuudet(sortedMixedMahdollisuudet, pagedIds);
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
            .filter((m) => m.ammattiryhma?.uri && !ammattiryhmaNimet?.[m.ammattiryhma.uri])
            .map((m) => m.ammattiryhma!.uri)
            .filter((uri): uri is string => uri !== undefined);

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
          /* eslint-disable no-console */
          console.error(_error);
          set({
            mixedMahdollisuudet: [],
            koulutusmahdollisuudet: [],
            tyomahdollisuudet: [],
            mahdollisuudetLoading: false,
          });
        }

        async function filterEhdotukset(filters: ToolFilters) {
          const {
            opportunityType: filter,
            region,
            ammattiryhmat,
            jobOpportunityType,
            educationOpportunityType,
          } = filters;
          if (Object.keys(ehdotukset).length === 0 || i18n.language !== get().previousEhdotusUpdateLang) {
            await get().updateEhdotukset(i18n.language, signal);
            set({ previousEhdotusUpdateLang: i18n.language });
          }
          ehdotukset = get().mahdollisuusEhdotukset;

          return Object.entries(ehdotukset ?? [])
            .filter(([, meta]) => {
              // If filter is empty, return all items
              if (filter.length === 0) {
                return true;
              }
              // If 'ALL' is included, return all items regardless of type
              if (filter.includes('ALL')) {
                return true;
              }
              // Otherwise, only include items whose type is in the filter
              return filter.includes(meta.tyyppi);
            })
            .filter(([, meta]) => {
              return (
                filterByJobType(jobOpportunityType, meta) &&
                filterByEducationType(educationOpportunityType, meta) &&
                filterByAmmattiryhmat(ammattiryhmat, meta) &&
                filterByRegion(region, meta)
              );
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
        set({ settingsHaveChanged: false });
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
            globalThis._paq?.push(['trackEvent', 'yksilo.Suosikit', 'Lisäys', kohdeId]);
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
        set({ sorting: state as OpportunitySortingValue, settingsHaveChanged: true });
      },

      setArrayFilter: (name, value) => {
        const { filters } = get();

        // Init if not exists
        if (!filters[name]) {
          filters[name] = [];
        }

        set((state) => ({
          settingsHaveChanged: true,
          filters: {
            ...state.filters,
            [name]:
              value && filters[name] && (filters[name] as string[]).includes(value)
                ? filters[name].filter((v) => v !== value)
                : [...(state.filters[name] ?? []), value],
          },
        }));
      },

      addAmmattiryhmaToFilter: (ammattiryhma: string) => {
        set((state) => ({
          settingsHaveChanged: true,
          filters: {
            ...state.filters,
            ammattiryhmat: [...state.filters.ammattiryhmat, ammattiryhma],
          },
        }));
      },

      removeAmmattiryhmaFromFilter: (ammattiryhma: string) => {
        set((state) => ({
          settingsHaveChanged: true,
          filters: {
            ...state.filters,
            ammattiryhmat: state.filters.ammattiryhmat.filter((ar: string) => ar !== ammattiryhma),
          },
        }));
      },

      fillAmmattiryhmaNimet: async (ammattiryhmaUrit: string[]) => {
        const ammattiryhmaNimet = { ...get().ammattiryhmaNimet };
        const ammattiryhmat = await ammatit.find(ammattiryhmaUrit);
        ammattiryhmat.forEach((ar) => {
          ammattiryhmaNimet[ar.uri] = ar.nimi;
        });
        set({
          ammattiryhmaNimet,
        });
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
