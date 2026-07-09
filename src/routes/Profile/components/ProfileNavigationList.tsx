import { useTranslation } from 'react-i18next';
import { useLocation, useOutletContext } from 'react-router';

import { MenuSection, PageNavigation } from '@jod/design-system';

import { useIsLoggedIn } from '@/stores/useSessionManagerStore';
import { generateMenuItems, type GenerateMenuItemsOptions, type MenuRoute } from '@/utils/routeUtils';

interface ProfileNavigationListProps {
  collapsed?: boolean;
  activeIndicator?: React.ComponentProps<typeof PageNavigation>['activeIndicator'];
}
export const ProfileNavigationList = ({ collapsed, activeIndicator }: ProfileNavigationListProps) => {
  const { t } = useTranslation();
  const routes = useOutletContext<MenuRoute[]>();
  const isLoggedIn = useIsLoggedIn();
  const { pathname } = useLocation();

  const generateRoutesOptions: GenerateMenuItemsOptions = {
    menuRoutes: routes.map((route) => ({
      ...route,
      authRequired: true,
    })),
    loggedIn: isLoggedIn,
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
      testId="profile-navigation-list"
    />
  );
};
