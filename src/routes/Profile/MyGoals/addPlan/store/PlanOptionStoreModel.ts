import { components } from '@/api/schema';
import { OsaaminenValue } from '@/components';
import { EhdotusRecord, OpportunitySortingValue, sortingValues } from '@/routes/Tool/utils.ts';
import { Tavoite } from '@/stores/useTavoitteetStore';

export type FilterName = keyof PlanFilters;
export const DEFAULT_SORTING = sortingValues.RELEVANCE;
export const MAX_KESTO_VALUE = 1000;
export const MIN_KESTO_VALUE = 0;

export const getKestoCount = (minDuration: number | null, maxDuration: number | null) => {
  const sixYears = 6 * 12;
  const isMinValue = minDuration === MIN_KESTO_VALUE || minDuration === null;
  const isMaxValue = maxDuration === MAX_KESTO_VALUE || maxDuration === null || maxDuration === sixYears;
  const isDefaultValue = isMinValue && isMaxValue;
  return isDefaultValue ? 0 : 1;
};

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
  initialPlanListLoaded: boolean;
  tavoite: Tavoite | null;
  selectedPlans: string[];
  osaamiset: OsaaminenValue[];
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
