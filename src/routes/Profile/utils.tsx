import { components } from '@/api/schema';
import { type RoutesNavigationListProps } from '@/components';
import { Link } from 'react-router-dom';

export const mapNavigationRoutes = (routes: RoutesNavigationListProps['routes']) =>
  routes.map((route) => ({ ...route, path: `../${route.path}` }));

export const generateProfileLink = (
  profilePageSlug: string,
  data: { etunimi?: string; sukunimi?: string; csrf: components['schemas']['CsrfTokenDto'] } | null,
  language: string,
  t: (key: string) => string,
) => {
  if (data) {
    return {
      to: `/${language}/${t('slugs.profile.index')}/${t(profilePageSlug)}`,
      component: Link,
    };
  } else {
    const params = new URLSearchParams();
    params.set('lang', language);
    params.set('callback', `/${language}/${t('slugs.profile.index')}/${t(profilePageSlug)}`);
    return {
      to: `/login?${params.toString()}`,
      component: ({
        to,
        className,
        children,
      }: {
        to: object | string;
        className?: string;
        children: React.ReactNode;
      }) => (
        <a href={to as string} className={className}>
          {children}
        </a>
      ),
    };
  }
};
