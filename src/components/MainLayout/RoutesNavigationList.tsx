import { components } from '@/api/schema';
import { cx } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLoaderData } from 'react-router-dom';

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

interface LoginLinkProps {
  children: React.ReactNode;
  path: string;
  lang: string;
}

const LoginLink = ({ children, path, lang }: LoginLinkProps) => {
  const params = new URLSearchParams();
  params.set('lang', lang);
  params.set('callback', `/${lang}/${path}`);

  const href = `/login?${params.toString()}`;
  return (
    <a
      href={href}
      lang={lang}
      className={'hyphens-auto text-button-md text-black hover:underline w-full pl-5 block py-3'}
    >
      {children}
    </a>
  );
};

export const RoutesNavigationList = ({ routes, onClick }: RoutesNavigationListProps) => {
  const { i18n } = useTranslation();
  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;

  return (
    <ul className="flex flex-col gap-y-2 py-4">
      {routes.map((route) => {
        const isSubPage = route.path.split('/').slice(1).length > 1;
        return (
          <li key={route.path} className="flex min-h-7 items-center w-full">
            {route.authRequired && !data ? (
              <LoginLink path={route.path} lang={i18n.language}>
                {route.name}
              </LoginLink>
            ) : (
              <NavLink
                to={route.path}
                replace={route.replace}
                lang={i18n.language}
                className={({ isActive }) =>
                  cx('hyphens-auto text-black w-full block py-3 text-button-md hover:underline', {
                    'bg-secondary-1-50 rounded-md': isActive,
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
