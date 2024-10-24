import { OsaaminenLahdeTyyppi } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import { Tag } from '@jod/design-system';

type TagProps = React.ComponentProps<typeof Tag>;
export const OSAAMINEN_COLOR_MAP: Record<OsaaminenLahdeTyyppi, NonNullable<TagProps['sourceType']>> = {
  TOIMENKUVA: 'tyopaikka',
  KOULUTUS: 'koulutus',
  PATEVYYS: 'vapaa-ajan-toiminto',
  MUU_OSAAMINEN: 'jotain-muuta',
  KIINNOSTUS: 'kiinnostus',
};

export const DEFAULT_PAGE_SIZE = 20;
