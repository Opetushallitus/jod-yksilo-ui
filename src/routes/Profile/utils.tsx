import { JSX } from 'react';
import { Link, type LinkProps } from 'react-router';

import { cx } from '@jod/design-system';
import {
  JodCheckmarkAlt,
  JodCog,
  JodFavorite,
  JodFavs,
  JodFlag,
  JodInterests,
  JodOther,
  JodShare,
  JodSkills,
  JodWork,
} from '@jod/design-system/icons';

import type { components } from '@/api/schema';
import i18n from '@/i18n/config';
import type { CompetenceSourceType } from '@/routes/Profile/Competences/constants';
import type { MahdollisuusTyyppi } from '@/routes/types';

export type ProfileLink =
  | {
      to: string;
      component: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
    }
  | {
      to: string;
      component: ({
        to,
        className,
        children,
      }: {
        to: object | string;
        className?: string;
        children: React.ReactNode;
      }) => JSX.Element;
    };

export const generateProfileLink = (
  profilePageSlugs: string[],
  data: { etunimi?: string; sukunimi?: string; csrf: components['schemas']['CsrfTokenDto'] } | null,
  language: string,
  t: (key: string) => string,
): ProfileLink => {
  const profilePageSlug = profilePageSlugs.join('/');
  const callbackUrl = `/${language}/${t('slugs.profile.index')}/${profilePageSlug}`;
  const landingPageURL = `/${language}/${t('slugs.profile.login')}`;

  if (data) {
    return {
      to: `/${language}/${t('slugs.profile.index')}/${profilePageSlug}`,
      component: Link,
    };
  } else {
    const params = new URLSearchParams();
    params.set('lang', language);
    params.set('callback', `/${language}/${t('slugs.profile.index')}/${profilePageSlug}`);
    return {
      to: landingPageURL,
      component: ({
        to,
        className,
        children,
      }: {
        to: object | string;
        className?: string;
        children: React.ReactNode;
      }) => (
        <Link to={to} className={className} state={callbackUrl}>
          {children}
        </Link>
      ),
    };
  }
};

export const GENDER_VALUES = ['MIES', 'NAINEN'] as const;
export type GenderValue = (typeof GENDER_VALUES)[number];

export const getTypeSlug = (type: MahdollisuusTyyppi) =>
  type === 'TYOMAHDOLLISUUS' ? i18n.t('slugs.job-opportunity.index') : i18n.t('slugs.education-opportunity.index');

export type ProfileSectionType =
  | CompetenceSourceType
  | 'SUOSIKKI'
  | 'KIINNOSTUS'
  | 'OSAAMISENI'
  | 'TAVOITTEENI'
  | 'TUO_JA_VIE_TIETOJA'
  | 'ASETUKSENI';

export const getTextClassByCompetenceSourceType = (type: ProfileSectionType) =>
  cx({
    'text-primary-4-dark': type === 'TOIMENKUVA',
    'text-primary-2-dark': type === 'KOULUTUS',
    'text-primary-1-dark': type === 'TOIMINTO',
    'text-secondary-gray': type === 'MUU_OSAAMINEN',
    'text-primary-3': type === 'KIINNOSTUS',
    'text-primary-1-dark-2': ['SUOSIKKI', 'OSAAMISENI', 'TAVOITTEENI', 'TUO_JA_VIE_TIETOJA', 'ASETUKSENI'].includes(
      type,
    ),
  });

export const getIconByProfileSectionType = (type: ProfileSectionType): React.ReactNode => {
  const iconMap: Record<ProfileSectionType, React.ReactNode> = {
    TOIMENKUVA: <JodWork />,
    KOULUTUS: <JodSkills />,
    TOIMINTO: <JodInterests />,
    MUU_OSAAMINEN: <JodOther />,
    KIINNOSTUS: <JodFavs />,
    SUOSIKKI: <JodFavorite />,
    OSAAMISENI: <JodCheckmarkAlt />,
    TAVOITTEENI: <JodFlag />,
    TUO_JA_VIE_TIETOJA: <JodShare />,
    ASETUKSENI: <JodCog />,
  };
  return iconMap[type];
};

export const getBgClassByProfileSectionType = (type: ProfileSectionType) =>
  cx({
    'bg-primary-4-dark': type === 'TOIMENKUVA',
    'bg-primary-2-dark': type === 'KOULUTUS',
    'bg-primary-1-dark': type === 'TOIMINTO',
    'bg-secondary-gray': type === 'MUU_OSAAMINEN',
    'bg-primary-3': type === 'KIINNOSTUS',
    'bg-primary-1-dark-2': ['SUOSIKKI', 'OSAAMISENI', 'TAVOITTEENI', 'TUO_JA_VIE_TIETOJA', 'ASETUKSENI'].includes(type),
  });
