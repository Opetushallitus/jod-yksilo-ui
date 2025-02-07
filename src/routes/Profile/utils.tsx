import { components } from '@/api/schema';
import { type RoutesNavigationListProps } from '@/components';
import i18n from '@/i18n/config';
import { MahdollisuusTyyppi } from '@/routes/types';
import { JSX } from 'react';
import { Link, LinkProps } from 'react-router';

export const mapNavigationRoutes = (routes: RoutesNavigationListProps['routes']) =>
  routes.map((route) => ({ ...route, path: `../${route.path}` }));

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

export const getTypeSlug = (type: MahdollisuusTyyppi) =>
  type === 'TYOMAHDOLLISUUS' ? i18n.t('slugs.job-opportunity.index') : i18n.t('slugs.education-opportunity.index');
