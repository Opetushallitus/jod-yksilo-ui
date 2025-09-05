import { NavLinkBasedOnAuth } from '@/components/NavMenu/NavLinkBasedOnAuth';
import i18n, { LangCode } from '@/i18n/config';
import { LinkComponent, MenuItem } from '@jod/design-system';
import React from 'react';
import { Link } from 'react-router';

export interface MenuRoute {
  authRequired?: boolean;
  path: string;
  name: string;
}

export interface GenerateMenuItemsOptions {
  /* List of routes, eg: [{ name: 'Profile', path: 'profile', authRequired: false }, ...] */
  menuRoutes: MenuRoute[];
  /* If user is not logged in and route has "authRequired" set to true, the user will be redirected to login page */
  loggedIn?: boolean;
  /* Current UI language */
  language?: LangCode;
  /* Pathname from "useLocation" hook, used to determine if the link is selected/active */
  pathname: string;
  /* Optional prefix to be added to the route path */
  pathPrefix?: string;
  /* Optional callback to be called when the link is clicked, useful for closing menus */
  onClose?: () => void;
}
export const generateMenuItems = (opts: GenerateMenuItemsOptions): MenuItem[] => {
  const { menuRoutes, loggedIn, language = i18n.language, pathname, pathPrefix, onClose } = opts;
  const routes = pathPrefix ? menuRoutes.map((r) => ({ ...r, path: `${pathPrefix}/${r.path}` })) : menuRoutes;

  const topLevelRoutes: MenuRoute[] = [];

  routes.forEach((route) => {
    const pathSegments = route.path.split('/');
    if (pathSegments.length <= 2) {
      topLevelRoutes.push(route);
    }
  });

  const subRoutesByParent = routes.reduce(
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
          shouldLogin={!!route.authRequired && !loggedIn}
          lang={language}
        >
          {children}
        </NavLinkBasedOnAuth>
      ),
      selected: pathname === `/${language}/${route.path}`,
    };

    if (subRoutesByParent[route.path]) {
      menuItem.childItems = subRoutesByParent[route.path].map((childRoute) => ({
        label: childRoute.name,
        LinkComponent: ({ children, className }: LinkComponent) => (
          <NavLinkBasedOnAuth
            className={className}
            to={childRoute.path}
            onClose={onClose}
            shouldLogin={!!route.authRequired && !loggedIn}
            lang={language}
          >
            {children}
          </NavLinkBasedOnAuth>
        ),
        selected: pathname === `/${language}/${childRoute.path}`,
      }));
    }

    return menuItem;
  });

  return menuItems;
};

export interface LinkToOpts {
  useAnchor?: boolean;
  target?: string;
  className?: string;
  rel?: string;
  queryParams?: Record<string, string>;
  state?: Record<string, unknown>;
}
/**
 * A function for creating DS style link components, to avoid creating components during runtime.
 * @param to Same as react-routers Link 'to' prop, can be a string or an object.
 * @param opts Options for the link component
 * @returns A Link component
 */
export const getLinkTo = (
  to: React.ComponentProps<typeof Link>['to'],
  opts: LinkToOpts = { useAnchor: false, target: '_self', rel: 'noreferrer' },
): LinkComponent => {
  const LinkToComponent = ({ children, className = opts.className }: LinkComponent) =>
    opts.useAnchor ? (
      <a className={className} href={typeof to === 'string' ? to : to.pathname} target={opts.target} rel={opts.rel}>
        {children}
      </a>
    ) : (
      <Link className={className} to={to} target={opts.target} rel={opts.rel} state={opts.state}>
        {children}
      </Link>
    );
  return LinkToComponent;
};
