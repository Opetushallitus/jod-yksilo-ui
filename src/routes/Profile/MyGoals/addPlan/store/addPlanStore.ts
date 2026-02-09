import { client } from '@/api/client';
import { getKoulutusMahdollisuusDetailsFullPage } from '@/api/mahdollisuusService';
import { osaamiset } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import i18n from '@/i18n/config';
import {
  type AddPlanState,
  DEFAULT_FILTERS,
  DEFAULT_SORTING,
  type PlanFilters,
} from '@/routes/Profile/MyGoals/addPlan/store/PlanOptionStoreModel';
import { ehdotusDataToRecord, type EhdotusRecord } from '@/routes/Tool/utils';
import { filterByEducationType, filterByKesto } from '@/stores/useToolStore/filters';
import { paginate, removeDuplicatesByKey } from '@/utils';
import { create } from 'zustand';

let abortController = new AbortController();
/**
 * This store is used to handle state of AddPlanModal and its steps
 */
const initialState = {
  tavoite: null,
  selectedPlans: [],
  osaamiset: [],
  vaaditutOsaamiset: [],
  ehdotuksetLoading: false,
  mahdollisuudetLoading: false,
  tavoitteet: {},
  filteredMahdollisuudetCount: 0,
  previousEhdotusUpdateLang: i18n.language,
  initialPlanListLoaded: false,

  ehdotuksetPageSize: DEFAULT_PAGE_SIZE,
  settingsHaveChanged: false,
  ehdotuksetPageNr: 0,
  mahdollisuusEhdotukset: {},
  tyomahdollisuudet: [],
  koulutusmahdollisuudet: [],
  filters: DEFAULT_FILTERS,
  sorting: DEFAULT_SORTING,
};
export const addPlanStore = create<AddPlanState>((set, get) => ({
  ...initialState,
  reset: () => set(initialState),
  resetSettings: () => set({ filters: DEFAULT_FILTERS, sorting: DEFAULT_SORTING, settingsHaveChanged: true }),
  setSelectedPlans: (state) => set({ selectedPlans: state }),
  setOsaamiset: (state) => set({ osaamiset: state }),
  setDurationFilter: (minDuration: number, maxDuration: number) => {
    set((state) => ({
      settingsHaveChanged: true,
      filters: {
        ...state.filters,
        minDuration,
        maxDuration,
      },
    }));
  },
  updateEhdotukset: async () => {
    set({ ehdotuksetLoading: true });
    const mahdollisuusId = get().tavoite?.mahdollisuusId;

    if (!mahdollisuusId) {
      return;
    }
    const { data: tavoiteMahdollisuus } = await client.GET('/api/tyomahdollisuudet/{id}', {
      params: { path: { id: mahdollisuusId } },
    });
    const vaaditutOsaamiset = await osaamiset.combine(
      tavoiteMahdollisuus?.jakaumat?.osaaminen?.arvot,
      (value) => value.arvo,
      (value, osaaminen) => ({ ...osaaminen, osuus: value.osuus }),
    );
    set({ vaaditutOsaamiset });
    const { data: profiiliOsaamisetRes } = await client.GET('/api/profiili/osaamiset');
    // Type check forces this check. ui-code cant know if the list contains undefineds
    const profiiliOsaamisetFiltered = profiiliOsaamisetRes?.filter(
      (o): o is components['schemas']['YksilonOsaaminenDto'] => o != undefined,
    );
    const profiiliOsaamiset = removeDuplicatesByKey(profiiliOsaamisetFiltered ?? [], (o) => o?.osaaminen?.uri).filter(
      (osaaminen) => vaaditutOsaamiset.some((vaadittu) => vaadittu.uri === osaaminen.osaaminen.uri),
    );

    const missingOsaamiset = vaaditutOsaamiset
      .map((osaaminen) => osaaminen.uri)
      .filter((id): id is string => id != undefined)
      .filter((uri) => !profiiliOsaamiset.map((o) => o?.osaaminen?.uri).includes(uri));

    try {
      const { data: mahdollisuusData } = await client.POST('/api/ehdotus/mahdollisuudet/polku', {
        body: missingOsaamiset,
        headers: { 'Content-Language': i18n.language },
      });
      const mahdollisuusEhdotukset = ehdotusDataToRecord(mahdollisuusData ?? []);
      set({
        mahdollisuusEhdotukset,
        ehdotuksetLoading: false,
        initialPlanListLoaded: true,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        set({
          mahdollisuusEhdotukset: {},
          ehdotuksetLoading: false,
          initialPlanListLoaded: true,
        });
      }
    }
  },

  setTavoite: (tavoite: components['schemas']['TavoiteDto']) => {
    get().reset();
    set({ tavoite });
    get().updateEhdotuksetAndMahdollisuudet();
  },

  updateEhdotuksetAndMahdollisuudet: async () => {
    const { updateEhdotukset, fetchMahdollisuudetPage } = get();

    abortController.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    set({ ehdotuksetLoading: true, mahdollisuudetLoading: true });
    await updateEhdotukset(i18n.language, signal);
    await fetchMahdollisuudetPage(signal, 1);
    set({ settingsHaveChanged: false, ehdotuksetLoading: false, mahdollisuudetLoading: false });
  },

  fetchMahdollisuudetPage: async (signal, newPage = 1) => {
    const { filters, ehdotuksetPageSize } = get();
    let ehdotukset: EhdotusRecord = get().mahdollisuusEhdotukset;

    async function updateKoulutusMahdollisuudet(pagedIds: string[]) {
      const ehdotukset = get().mahdollisuusEhdotukset;
      const koulutusmahdollisuusIds = pagedIds.filter((id) => ehdotukset[id].tyyppi === 'KOULUTUSMAHDOLLISUUS');
      const koulutusmahdollisuudet = await getKoulutusMahdollisuusDetailsFullPage(
        koulutusmahdollisuusIds,
        ehdotuksetPageSize,
      );
      set({ koulutusmahdollisuudet });
    }

    async function filterEhdotukset(filters: PlanFilters) {
      const { minDuration, maxDuration, educationOpportunityType } = filters;
      if (Object.keys(ehdotukset).length === 0 || i18n.language !== get().previousEhdotusUpdateLang) {
        await get().updateEhdotukset(i18n.language, signal);
        set({ previousEhdotusUpdateLang: i18n.language });
      }
      ehdotukset = get().mahdollisuusEhdotukset;
      const alreadyChosenKoulutusmahdollisuudet = get()
        .tavoite?.suunnitelmat?.filter((s) => !!s)
        .map((s) => s.koulutusmahdollisuusId);

      return Object.entries(ehdotukset ?? [])
        .filter(
          ([key, ehdotusMetadata]) =>
            !alreadyChosenKoulutusmahdollisuudet?.includes(key) &&
            filterByEducationType(educationOpportunityType, ehdotusMetadata) &&
            filterByKesto(minDuration, maxDuration, ehdotusMetadata),
        )
        .sort(([, a], [, b]) => (b?.pisteet ?? 0) - (a?.pisteet ?? 0))
        .map(([key]) => key);
    }

    const allSortedIds = await filterEhdotukset(filters);
    set({ filteredMahdollisuudetCount: allSortedIds.length, mahdollisuudetLoading: true });
    try {
      const pagedIds = paginate(allSortedIds, newPage, ehdotuksetPageSize);

      await updateKoulutusMahdollisuudet(pagedIds);

      get().koulutusmahdollisuudet.sort((a, b) => (ehdotukset[b.id]?.pisteet ?? 0) - (ehdotukset[a.id]?.pisteet ?? 0));
      set({
        ehdotuksetPageNr: newPage,
        mahdollisuudetLoading: false,
      });
    } catch {
      set({ koulutusmahdollisuudet: [], mahdollisuudetLoading: false });
    }
  },

  setArrayFilter: (name, value) => {
    const { filters } = get();
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
}));
