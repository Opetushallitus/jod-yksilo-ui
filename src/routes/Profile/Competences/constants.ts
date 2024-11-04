import { components } from '@/api/schema';

export const GROUP_BY_SOURCE = 'a';
export const GROUP_BY_THEME = 'b';
export const GROUP_BY_ALPHABET = 'c';

export const groupByHeaderClasses = 'mb-5 mt-8 pb-3 border-b border-border-gray truncate text-heading-3';
export interface FilterData {
  label: string;
  value: string;
  checked: boolean;
}

export const FILTERS_ORDER = ['TOIMENKUVA', 'KOULUTUS', 'PATEVYYS', 'MUU_OSAAMINEN'] as const;
export type CompetenceFilter = (typeof FILTERS_ORDER)[number];

export type FiltersType = Record<CompetenceFilter, FilterData[]>;

export interface GroupByProps {
  filters: FiltersType;
  filterKeys: (keyof FiltersType)[];
  locale: 'fi' | 'sv';
  osaamiset: components['schemas']['YksilonOsaaminenDto'][];
  isOsaaminenVisible: (key: CompetenceFilter, id?: string) => boolean;
}

export interface MobileFilterButton {
  mobileFilterOpenerComponent: React.ReactNode;
}
