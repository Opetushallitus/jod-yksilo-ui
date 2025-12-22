import { components } from '@/api/schema';
import { OsaaminenValue } from '@/components';
import { EhdotusRecord, OpportunitySortingValue, sortingValues } from '@/routes/Tool/utils.ts';
import { Tavoite } from '@/stores/useTavoitteetStore';

export type FilterName = keyof PlanFilters;
export const DEFAULT_SORTING = sortingValues.RELEVANCE;

export interface PlanFilters {
  educationOpportunityType: string[];
  minDuration: number | null;
  maxDuration: number | null;
}

export const DEFAULT_FILTERS: PlanFilters = {
  educationOpportunityType: [],
  minDuration: null,
  maxDuration: null,
};

export type ArrayFilters = Extract<
  FilterName,
  'opportunityType' | 'region' | 'jobOpportunityType' | 'educationOpportunityType'
>;
export type KoulutusMahdollisuusFull = components['schemas']['KoulutusmahdollisuusFullDto'];
export interface AddPlanState {
  tavoite: Tavoite | null;
  selectedPlans: string[];
  osaamiset: OsaaminenValue[];
  setPlanName: (planName: string) => void;
  setPlanDescription: (planDescription: string) => void;
  planName: components['schemas']['LokalisoituTeksti'];
  planDescription: components['schemas']['LokalisoituTeksti'];
  addSelectedOsaaminen: (osaaminenUri: {
    uri: string;
    nimi: components['schemas']['LokalisoituTeksti'];
    kuvaus: components['schemas']['LokalisoituTeksti'];
  }) => void;
  removeSelectedOsaaminen: (osaaminenUri: {
    uri: string;
    nimi: components['schemas']['LokalisoituTeksti'];
    kuvaus: components['schemas']['LokalisoituTeksti'];
  }) => void;
  selectedOsaamiset: components['schemas']['OsaaminenDto'][];
  vaaditutOsaamiset: components['schemas']['OsaaminenDto'][];
  mahdollisuusEhdotukset: EhdotusRecord;
  koulutusmahdollisuudet: KoulutusMahdollisuusFull[];
  ehdotuksetLoading: boolean;
  mahdollisuudetLoading: boolean;
  ehdotuksetPageSize: number;
  ehdotuksetPageNr: number;
  filteredMahdollisuudetCount: number;
  sorting: OpportunitySortingValue;
  previousEhdotusUpdateLang: string;
  filters: PlanFilters;
  setDurationFilter: (minDuration: number, maxDuration: number) => void;
  settingsHaveChanged?: boolean;
  setArrayFilter: (name: ArrayFilters, value: PlanFilters[ArrayFilters][number]) => void;
  reset: () => void;
  resetSettings: () => void;
  setOsaamiset: (state: OsaaminenValue[]) => void;
  setTavoite: (tavoite: components['schemas']['TavoiteDto']) => void;
  setSelectedPlans: (plans: string[]) => void;
  updateEhdotukset: (lang: string, signal?: AbortSignal) => Promise<void>;
  fetchMahdollisuudetPage: (signal?: AbortSignal, page?: number) => Promise<void>;
  updateEhdotuksetAndMahdollisuudet: () => Promise<void>;
}
