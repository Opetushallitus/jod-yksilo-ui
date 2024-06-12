import { type RoutesNavigationListProps } from '@/components';

export const mapNavigationRoutes = (routes: RoutesNavigationListProps['routes']) =>
  routes.map((route) => ({ ...route, path: `../${route.path}` }));
