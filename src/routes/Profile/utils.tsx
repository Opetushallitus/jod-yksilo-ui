import type { components } from '@/api/schema';
import i18n from '@/i18n/config';
import type { CompetenceSourceType } from '@/routes/Profile/Competences/constants';
import type { MahdollisuusTyyppi } from '@/routes/types';
import { cx } from '@jod/design-system';
import { JSX } from 'react';
import { Link, type LinkProps } from 'react-router';

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
  const profilePageSlug = profilePageSlugs.map((slug) => t(slug)).join('/');
  const callbackURL = `/${language}/${t('slugs.profile.index')}/${profilePageSlug}`;
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
        <Link to={to} className={className} state={callbackURL}>
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
  | 'ASETUKSENI';

export const getTextClassByCompetenceSourceType = (type: ProfileSectionType) =>
  cx({
    'text-secondary-4-dark': type === 'TOIMENKUVA',
    'text-secondary-2-dark': type === 'KOULUTUS',
    'text-secondary-1': type === 'PATEVYYS',
    'text-secondary-gray': type === 'MUU_OSAAMINEN',
    'text-secondary-3': type === 'KIINNOSTUS',
    'text-secondary-1-dark-2': ['SUOSIKKI', 'OSAAMISENI', 'tavoite', 'ASETUKSENI'].includes(type),
  });
