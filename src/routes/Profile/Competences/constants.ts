import { components } from '@/api/schema';
import { OsaaminenLahdeTyyppi } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';

export const GROUP_BY_SOURCE = 'a';
export const GROUP_BY_THEME = 'b';
export const GROUP_BY_ALPHABET = 'c';

export const groupByHeaderClasses = 'mb-5 mt-8 pb-3 border-b border-border-gray truncate text-heading-3';
export interface FilterData {
  label: string;
  value: string;
  checked: boolean;
}

export type FiltersType = Record<OsaaminenLahdeTyyppi, FilterData[]>;
export const FILTERS_ORDER = ['TOIMENKUVA', 'KOULUTUS', 'PATEVYYS', 'KIINNOSTUS', 'MUU_OSAAMINEN'] as const;
export const COMPETENCE_TYPES = ['TOIMENKUVA', 'KOULUTUS', 'PATEVYYS', 'MUU_OSAAMINEN'] as const;

export interface GroupByProps {
  filters: FiltersType;
  filterKeys: (keyof FiltersType)[];
  locale: 'fi' | 'sv';
  osaamiset: components['schemas']['YksilonOsaaminenDto'][];
  isOsaaminenVisible: (key: OsaaminenLahdeTyyppi, id?: string) => boolean;
}

export interface MobileFilterButton {
  mobileFilterOpenerComponent: React.ReactNode;
}
