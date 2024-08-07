import { Tag } from '@jod/design-system';

export const GROUP_BY_SOURCE = 'a';
export const GROUP_BY_THEME = 'b';
export const GROUP_BY_ALPHABET = 'c';

type TagProps = React.ComponentProps<typeof Tag>;
export const osaaminenColorMap: Record<OsaaminenLahdeTyyppi, NonNullable<TagProps['color']>> = {
  KOULUTUS: 'secondary-4',
  TOIMENKUVA: 'secondary-3',
  PATEVYYS: 'secondary-2',
};

export const groupByHeaderClasses = 'font-poppins mb-5 mt-8 pb-3 border-b border-border-gray truncate text-heading-3';
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
