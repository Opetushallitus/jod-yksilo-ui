import { components } from '@/api/schema';

export const GROUP_BY_SOURCE = 'GROUP_BY_SOURCE';
export const GROUP_BY_ALPHABET = 'GROUP_BY_ALPHABET';

export interface FilterData {
  label: Record<string, string | undefined>;
  value: string[];
  checked: boolean;
}

export const FILTERS_ORDER = ['TOIMENKUVA', 'KOULUTUS', 'PATEVYYS', 'MUU_OSAAMINEN', 'KIINNOSTUS'] as const;
export type CompetenceSourceType = (typeof FILTERS_ORDER)[number];
export interface FiltersType {
  TOIMENKUVA: FilterData[];
  KOULUTUS: FilterData[];
  PATEVYYS: FilterData[];
  MUU_OSAAMINEN: FilterData[];
  KIINNOSTUS?: FilterData[];
}

export interface GroupByProps {
  filters: FiltersType;
  filterKeys: (keyof FiltersType)[];
  locale: 'fi' | 'sv';
  osaamiset: components['schemas']['YksilonOsaaminenDto'][];
  isOsaaminenVisible: (key: CompetenceSourceType, id?: string) => boolean;
}
export interface MobileFilterButton {
  mobileFilterOpenerComponent: React.ReactNode;
}
