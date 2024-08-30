import { LangCode, supportedLanguageCodes } from '@/i18n/config';
import { RouteObject } from 'react-router-dom';

export const formatDate = (date: Date) => {
  const month = date.getMonth();
  const fullYear = date.getFullYear();
  return isNaN(month) || isNaN(fullYear) ? '' : `${month + 1}/${fullYear}`;
};

/**
 * Flattens the routes and adds the parent path to the child paths.
 * This is used for looking up the new current path after language change.
 * Used internally in getLocalizedRoutesMap.
 * @param routes The nested routes array
 * @param parentPath Parent of the current route
 * @returns A flat array of routes with the full path
 */
const flattenRoutes = (routes: RouteObject[], parentPath = ''): RouteObject[] => {
  return routes.reduce((flatRoutes: RouteObject[], route: RouteObject) => {
    const routePath = route.path ? `/${route.path}` : '';
    const fullPath = `${parentPath}${routePath}`.replace(/\/+/g, '/');

    const { children, ...routeWithoutChildren } = route;

    flatRoutes.push({
      ...routeWithoutChildren,
      path: fullPath,
    });

    if (children) {
      flatRoutes.push(...flattenRoutes(children, fullPath));
    }

    return flatRoutes;
  }, []);
};

/**
 * Creates a map of flattened routes for each language.
 * This map is used to figure out the new path after language change.
 * @param routes The routes object with all the apps routes and language code.
 * @returns A map like: { "fi": [finnish routes], "en": [english routes], ... }
 */
export const getLocalizedRoutesMap = (routes: { lang: LangCode; routes: RouteObject[] }[]) =>
  new Map(
    supportedLanguageCodes.map((lang) => {
      const langRoutes = routes.find((lr) => lr.lang === lang)?.routes ?? [];
      const flatRoutes = flattenRoutes(langRoutes);
      return [lang, flatRoutes];
    }),
  );
