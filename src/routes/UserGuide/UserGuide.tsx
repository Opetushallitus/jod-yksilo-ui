import { MainLayout } from '@/components';
import { useAppRoutes } from '@/hooks/useAppRoutes';
import { generateMenuItems } from '@/utils/routeUtils';
import { PageNavigation, type MenuSection } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';

const UserGuide = () => {
  const { t } = useTranslation();
  const { userGuideRoutes } = useAppRoutes();
  const { pathname } = useLocation();

  const navChildren = React.useMemo(() => {
    const menuSection: MenuSection = {
      title: t('on-this-page'),
      linkItems: generateMenuItems({
        menuRoutes: userGuideRoutes,
        pathPrefix: t('slugs.user-guide.index'),
        pathname,
      }),
    };
    return (
      <PageNavigation
        data-testid="user-guide-nav"
        menuSection={menuSection}
        openSubMenuLabel=""
        activeIndicator="dot"
      />
    );
  }, [t, userGuideRoutes, pathname]);

  return (
    <MainLayout navChildren={navChildren}>
      <div data-testid="user-guide-content">
        <Outlet />
      </div>
    </MainLayout>
  );
};

export default UserGuide;
