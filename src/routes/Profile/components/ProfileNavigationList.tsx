import type { components } from '@/api/schema';
import { generateMenuItems, type GenerateMenuItemsOptions, type MenuRoute } from '@/utils/routeUtils';
import { MenuSection, PageNavigation } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useLocation, useOutletContext, useRouteLoaderData } from 'react-router';

interface ProfileNavigationListProps {
  collapsed?: boolean;
  activeIndicator?: React.ComponentProps<typeof PageNavigation>['activeIndicator'];
}
export const ProfileNavigationList = ({ collapsed, activeIndicator }: ProfileNavigationListProps) => {
  const { t } = useTranslation();
  const routes = useOutletContext<MenuRoute[]>();
  const rootLoaderData = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'];
  const { pathname } = useLocation();

  const generateRoutesOptions: GenerateMenuItemsOptions = {
    menuRoutes: routes.map((route) => ({
      ...route,
      authRequired: true,
    })),
    loggedIn: !!rootLoaderData?.csrf,
    pathname,
    pathPrefix: t('slugs.profile.index'),
  };
  const menuSection: MenuSection = {
    title: t('in-this-section'),
    linkItems: generateMenuItems(generateRoutesOptions),
  };
  return (
    <PageNavigation
      openSubMenuLabel={t('common:open-submenu')}
      menuSection={menuSection}
      collapsed={collapsed}
      activeIndicator={activeIndicator}
    />
  );
};
