import { Tag } from '@jod/design-system';

export const LANG_SESSION_STORAGE_KEY = 'i18nextLng';

type TagProps = React.ComponentProps<typeof Tag>;
export const OSAAMINEN_COLOR_MAP: Record<OsaaminenLahdeTyyppi, NonNullable<TagProps['sourceType']>> = {
  TOIMENKUVA: 'tyopaikka',
  KOULUTUS: 'koulutus',
  PATEVYYS: 'vapaa-ajan-toiminto',
  JOTAIN_MUUTA: 'jotain-muuta',
  KIINNOSTUS: 'kiinnostus',
};
