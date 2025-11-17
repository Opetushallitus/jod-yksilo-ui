import { client } from '@/api/client.ts';
import { getKoulutusMahdollisuusDetailsFullPage } from '@/api/mahdollisuusService.ts';
import { osaamiset } from '@/api/osaamiset.ts';
import { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE } from '@/constants.ts';
import i18n from '@/i18n/config.ts';
import {
  AddPlanState,
  DEFAULT_FILTERS,
  DEFAULT_SORTING,
  PlanFilters,
} from '@/routes/Profile/MyGoals/addPlan/store/PlanOptionStoreModel.ts';
import { mapOsaaminenToUri } from '@/routes/Profile/Path/utils.ts';
import { ehdotusDataToRecord, EhdotusRecord } from '@/routes/Tool/utils.ts';
import { filterByEducationType, filterByRegion } from '@/stores/useToolStore/filters.ts';
import { paginate, removeDuplicatesByKey } from '@/utils';
import { create } from 'zustand';

let abortController = new AbortController();
/**
 * This store is used to handle state of AddPlanModal and its steps
 */
const initialState = {
  tavoitteet: {},
  osaamiset: [],
  osaamisetVapaateksti: undefined,
  kiinnostukset: [],
  kiinnostuksetVapaateksti: undefined,
  mahdollisuusEhdotukset: {},
  tyomahdollisuudet: [],
  koulutusmahdollisuudet: [],
  selectedPlans: [],
  mixedMahdollisuudet: [],
  filters: DEFAULT_FILTERS,
  sorting: DEFAULT_SORTING,
  planName: {
    fi: '',
    sv: '',
    en: '',
  },
  planDescription: {
    fi: '',
    sv: '',
    en: '',
  },
};
export const addPlanStore = create<AddPlanState>((set, get) => ({
  osaamiset: [],
  selectedPlans: [],
  selectedOsaamiset: [],
  tavoite: {},
  vaaditutOsaamiset: [],
  mahdollisuusEhdotukset: {},
  koulutusmahdollisuudet: [],
  ehdotuksetLoading: false,
  ehdotuksetPageSize: DEFAULT_PAGE_SIZE,
  mahdollisuudetLoading: false,
  filteredMahdollisuudetCount: 0,
  ehdotuksetPageNr: 1,
  filters: DEFAULT_FILTERS,
  settingsHaveChanged: false,

  reset: () => set(initialState),
  addSelectedOsaaminen: (osaaminenUri: components['schemas']['OsaaminenDto']) =>
    set({ selectedOsaamiset: [...get().selectedOsaamiset, osaaminenUri] }),
  removeSelectedOsaaminen: (osaaminenUri: components['schemas']['OsaaminenDto']) =>
    set({ selectedOsaamiset: get().selectedOsaamiset.filter((o) => o !== osaaminenUri) }),
  resetSettings: () => set({ filters: DEFAULT_FILTERS, sorting: DEFAULT_SORTING, settingsHaveChanged: true }),
  setSelectedPlans: (state) => set({ selectedPlans: state }),
  setTavoitteet: (state) => set({ tavoitteet: state }),
  setOsaamiset: (state) => set({ osaamiset: state }),
  setPlanName: (newPlanNameValue: string) => {
    const currentLang = i18n.language;
    set((state) => ({
      planName: {
        ...state.planName, // keep other languages as is
        [currentLang]: newPlanNameValue, // replace value only for current language
      },
    }));
  },
  setPlanDescription: (newPlanNameValue: string) => {
    const currentLang = i18n.language;

    set((state) => ({
      planDescription: {
        ...state.planDescription, // keep other languages as is
        [currentLang]: newPlanNameValue, // replace value only for current language
      },
    }));
  },
  updateEhdotukset: async () => {
    set({ ehdotuksetLoading: true });
    const mahdollisuusOpts = {
      params: { path: { id: get().tavoite?.mahdollisuusId } },
    };

    const { data: tavoiteMahdollisuus } = await client.GET('/api/tyomahdollisuudet/{id}', mahdollisuusOpts);
    const vaaditutOsaamiset = await osaamiset.combine(
      tavoiteMahdollisuus?.jakaumat?.osaaminen?.arvot,
      (value) => value.arvo,
      (value, osaaminen) => ({ ...osaaminen, osuus: value.osuus }),
    );
    set({ vaaditutOsaamiset });
    const { data: profiiliOsaamisetRes } = await client.GET('/api/profiili/osaamiset');
    const profiiliOsaamiset = removeDuplicatesByKey(profiiliOsaamisetRes, (o) => o.osaaminen?.uri).filter((osaaminen) =>
      vaaditutOsaamiset.some((vaadittu) => vaadittu.uri === osaaminen.osaaminen.uri),
    );

    const missingOsaamiset = vaaditutOsaamiset.map(mapOsaaminenToUri).filter((uri) => !profiiliOsaamiset.includes(uri));

    try {
      const { data: mahdollisuusData } = await client.POST('/api/ehdotus/mahdollisuudet/polku', {
        body: missingOsaamiset,
        headers: { 'Content-Language': i18n.language },
      });
      const mahdollisuusEhdotukset = ehdotusDataToRecord(mahdollisuusData ?? []);
      set({
        mahdollisuusEhdotukset,
        ehdotuksetLoading: false,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        set({
          mahdollisuusEhdotukset: {},
          ehdotuksetLoading: false,
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

    await updateEhdotukset(i18n.language, signal);
    await fetchMahdollisuudetPage(signal, 1);
    set({ settingsHaveChanged: false });
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
      const { region, educationOpportunityType } = filters;
      if (Object.keys(ehdotukset).length === 0 || i18n.language !== get().previousEhdotusUpdateLang) {
        await get().updateEhdotukset(i18n.language, signal);
        set({ previousEhdotusUpdateLang: i18n.language });
      }
      ehdotukset = get().mahdollisuusEhdotukset;
      const alreadyChosenKoulutusmahdollisuudet = get().tavoite.suunnitelmat.map((s) => s.koulutusmahdollisuusId);

      return Object.entries(ehdotukset ?? [])
        .filter(
          ([key, ehdotusMetadata]) =>
            !alreadyChosenKoulutusmahdollisuudet.includes(key) &&
            filterByEducationType(educationOpportunityType, ehdotusMetadata) &&
            filterByRegion(region, ehdotusMetadata),
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
      set({ mixedMahdollisuudet: [], koulutusmahdollisuudet: [], tyomahdollisuudet: [], mahdollisuudetLoading: false });
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
