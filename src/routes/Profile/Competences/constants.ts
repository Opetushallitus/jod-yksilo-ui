export const GROUP_BY_SOURCE = 'a';
export const GROUP_BY_THEME = 'b';
export const GROUP_BY_ALPHABET = 'c';

export interface FilterData {
  label: string;
  value: string;
  checked: boolean;
}
export type FiltersType = Partial<Record<OsaaminenLahdeTyyppi, FilterData[]>>;

export interface GroupByProps {
  filters: FiltersType;
  filterKeys: (keyof FiltersType)[];
  locale: 'fi' | 'sv';
  osaamiset: OsaaminenApiResponse[];
  deleteOsaaminen: (id: string) => Promise<void>;
  isOsaaminenVisible: (key: OsaaminenLahdeTyyppi, id: string) => boolean;
}
