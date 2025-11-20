import type { components } from '@/api/schema';
import type { OsaaminenValue } from '@/components';
import {
  type EhdotusRecord,
  type OpportunityFilterValue,
  type OpportunitySortingValue,
  sortingValues,
} from '@/routes/Tool/utils.ts';
import type { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';

export type FilterName = keyof ToolFilters;
export const DEFAULT_SORTING = sortingValues.RELEVANCE;

export interface ToolFilters {
  /** Mahdollisuustyyppi */
  opportunityType: OpportunityFilterValue[];
  /** Maakunta */
  region: string[];
  ammattiryhmat: string[];
  jobOpportunityType: string[];
  educationOpportunityType: string[];
}

export const DEFAULT_FILTERS: ToolFilters = {
  opportunityType: [],
  region: [],
  ammattiryhmat: [],
  jobOpportunityType: [],
  educationOpportunityType: [],
};

export type ArrayFilters = Extract<
  FilterName,
  'opportunityType' | 'region' | 'jobOpportunityType' | 'educationOpportunityType'
>;

export interface ToolState {
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
  filteredMahdollisuudetCount: number;
  filteredKoulutusMahdollisuudetCount: number;
  filteredTyomahdollisuudetCount: number;
  sorting: OpportunitySortingValue;
  previousEhdotusUpdateLang: string;
  filters: ToolFilters;
  settingsHaveChanged?: boolean;
  shouldFetchData: boolean;
  setArrayFilter: (name: ArrayFilters, value: ToolFilters[ArrayFilters][number]) => void;
  reset: () => void;
  resetSettings: () => void;
  addAmmattiryhmaToFilter: (ammattiryhma: string) => void;
  removeAmmattiryhmaFromFilter: (ammattiryhma: string) => void;
  fillAmmattiryhmaNimet: (uris: string[]) => Promise<void>;
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
  updateEhdotuksetAndTyomahdollisuudet: (loggedIn: boolean, forceFetchData: boolean) => Promise<void>;

  setSorting: (state: OpportunitySortingValue) => void;

  virtualAssistantOpen: boolean;
  setVirtualAssistantOpen: (state: boolean) => void;
}
