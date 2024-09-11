import { Tag } from '@jod/design-system';

export const LANG_SESSION_STORAGE_KEY = 'i18nextLng';

type TagProps = React.ComponentProps<typeof Tag>;
export const OSAAMINEN_COLOR_MAP: Record<OsaaminenLahdeTyyppi, NonNullable<TagProps['color']>> = {
  KOULUTUS: 'secondary-4',
  TOIMENKUVA: 'secondary-3',
  PATEVYYS: 'secondary-2',
};
