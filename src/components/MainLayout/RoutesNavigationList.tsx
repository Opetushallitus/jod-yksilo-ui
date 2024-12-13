import { components } from '@/api/schema';
import { cx } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { NavLink, useLoaderData } from 'react-router';

export interface RoutesNavigationListProps {
  routes: {
    path: string;
    name: string;
    active?: boolean;
    authRequired?: boolean;
    replace?: boolean;
  }[];
  onClick?: () => void;
}

export const RoutesNavigationList = ({ routes, onClick }: RoutesNavigationListProps) => {
  const { i18n, t } = useTranslation();
  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;
  const landingPageUrl = `/${i18n.language}/${t('slugs.profile.login')}`;

  return (
    <ul className="flex flex-col gap-y-2 py-4">
      {routes.map((route) => {
        const isSubPage = route.path.split('/').slice(1).length > 1;
        const isAnchorLink = route.path.startsWith('#');
        return (
          <li key={route.path} className="flex min-h-7 items-center w-full">
            {route.authRequired && !data ? (
              <NavLink
                state={{ callbackURL: route.path }}
                to={landingPageUrl}
                className={'hyphens-auto text-button-md text-black hover:underline w-full pl-5 block py-3'}
                aria-label={t('login')}
                onClick={onClick}
              >
                {route.name}
              </NavLink>
            ) : (
              <NavLink
                to={route.path}
                replace={route.replace}
                lang={i18n.language}
                className={({ isActive }) =>
                  cx('hyphens-auto text-black w-full block py-3 text-button-md hover:underline', {
                    'bg-secondary-1-50 rounded-md': isActive && !isAnchorLink,
                    'pl-7': isSubPage,
                    'pl-5': !isSubPage,
                  })
                }
                onClick={onClick}
                end
              >
                {route.name}
              </NavLink>
            )}
          </li>
        );
      })}
    </ul>
  );
};
