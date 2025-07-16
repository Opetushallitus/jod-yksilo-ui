import { MainLayout } from '@/components';
import { useAppRoutes } from '@/hooks/useAppRoutes';
import { generateMenuItems } from '@/utils/routeUtils';
import { PageNavigation, type MenuSection } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';

const UserGuide = () => {
  const { t } = useTranslation();
  const { userGuideRoutes } = useAppRoutes();
  const { pathname } = useLocation();
  const menuSection: MenuSection = {
    title: t('on-this-page'),
    linkItems: generateMenuItems({
      menuRoutes: userGuideRoutes,
      pathPrefix: t('slugs.user-guide.index'),
      pathname,
    }),
  };

  return (
    <MainLayout navChildren={<PageNavigation menuSection={menuSection} openSubMenuLabel="" activeIndicator="dot" />}>
      <Outlet />
    </MainLayout>
  );
};

export default UserGuide;
