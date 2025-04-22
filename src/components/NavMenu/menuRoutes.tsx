import { components } from '@/api/schema';
import { useAppRoutes } from '@/hooks/useAppRoutes';
import { LinkComponent, MenuItem } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLoaderData } from 'react-router';
import { NavLinkBasedOnAuth } from './NavLinkBasedOnAuth';

interface MenuRoute {
  authRequired?: boolean;
  path: string;
  name: string;
}

export const useMenuRoutes = (onClose: () => void) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;
  const { profileRoutes, toolRoutes } = useAppRoutes();

  const prefixRoutePath = (prefix: string) => (route: { name: string; path: string }) => ({
    ...route,
    path: `${prefix}/${route.path}`,
  });
  const profileIndexPath = t('slugs.profile.index');
  const profileMenuRoutes: MenuRoute[] = profileRoutes.map((route) => ({
    ...prefixRoutePath(profileIndexPath)(route),
    authRequired: true,
  }));

  const toolMenuRoutes: MenuRoute[] = toolRoutes.map(prefixRoutePath(t('slugs.tool.index')));

  const generatedMenuItems = React.useCallback(
    (menuRoutes: MenuRoute[]) => {
      const topLevelRoutes: MenuRoute[] = [];

      menuRoutes.forEach((route) => {
        const pathSegments = route.path.split('/');
        if (pathSegments.length <= 2) {
          topLevelRoutes.push(route);
        }
      });

      const subRoutesByParent = menuRoutes.reduce(
        (acc, route) => {
          const pathSegments = route.path.split('/');
          if (pathSegments.length > 2) {
            const parentPathSegments = pathSegments.slice(0, -1);
            const parentPath = parentPathSegments.join('/');

            if (!acc[parentPath]) {
              acc[parentPath] = [];
            }
            acc[parentPath].push(route);
          }
          return acc;
        },
        {} as Record<string, MenuRoute[]>,
      );

      const menuItems: MenuItem[] = topLevelRoutes.map((route) => {
        const menuItem: MenuItem = {
          label: route.name,
          LinkComponent: ({ children, className }: LinkComponent) => (
            <NavLinkBasedOnAuth
              className={className}
              to={route.path}
              onClose={onClose}
              shouldLogin={!!route.authRequired && !data}
            >
              {children}
            </NavLinkBasedOnAuth>
          ),
        };

        if (subRoutesByParent[route.path]) {
          menuItem.childItems = subRoutesByParent[route.path].map((childRoute) => ({
            label: childRoute.name,
            // eslint-disable-next-line sonarjs/no-nested-functions
            LinkComponent: ({ children, className }: LinkComponent) => (
              <NavLinkBasedOnAuth
                className={className}
                to={childRoute.path}
                onClose={onClose}
                shouldLogin={!!route.authRequired && !data}
              >
                {children}
              </NavLinkBasedOnAuth>
            ),
          }));
        }

        return menuItem;
      });

      return menuItems;
    },
    [data, onClose],
  );

  const mainLevelMenuItems: MenuItem[] = React.useMemo(() => {
    return [
      {
        label: t('my-competence-path'),
        LinkComponent: ({ children, className }: LinkComponent) => (
          <NavLink to={`/${language}`} className={className} lang={language} onClick={onClose}>
            {children}
          </NavLink>
        ),
      },
      {
        label: t('tool.my-own-data.title'),
        LinkComponent: ({ children, className }: LinkComponent) => (
          <NavLink to={`/${language}/${t('slugs.tool.index')}`} className={className} lang={language} onClick={onClose}>
            {children}
          </NavLink>
        ),
        childItems: generatedMenuItems(toolMenuRoutes),
      },
      {
        label: t('my-competence-profile'),
        LinkComponent: ({ children, className }: LinkComponent) => (
          <NavLink
            to={`/${language}/${t('slugs.profile.index')}`}
            className={className}
            lang={language}
            onClick={onClose}
          >
            {children}
          </NavLink>
        ),
        childItems: generatedMenuItems(profileMenuRoutes),
      },
    ];
  }, [t, language, generatedMenuItems, profileMenuRoutes, toolMenuRoutes, onClose]);

  return mainLevelMenuItems;
};
