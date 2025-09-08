import { MainLayout } from '@/components';
import { generateMenuItems } from '@/utils/routeUtils';
import { PageNavigation, type MenuSection } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';

const BasicInformation = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const routes = React.useMemo(
    () => [
      {
        name: t('cookie-policy'),
        path: t('slugs.cookie-policy'),
      },
      {
        name: t('data-sources'),
        path: t('slugs.data-sources'),
      },
      {
        name: t('terms-of-service'),
        path: t('slugs.terms-of-service'),
      },
      {
        name: t('accessibility-statement'),
        path: t('slugs.accessibility-statement'),
      },
    ],
    [t],
  );

  const navChildren = React.useMemo(() => {
    const menuSection: MenuSection = {
      title: t('on-this-page'),
      linkItems: generateMenuItems({
        menuRoutes: routes,
        pathPrefix: t('slugs.basic-information'),
        pathname,
      }),
    };
    return (
      <PageNavigation
        data-testid="basic-information-nav"
        menuSection={menuSection}
        openSubMenuLabel=""
        activeIndicator="dot"
      />
    );
  }, [t, routes, pathname]);

  return (
    <MainLayout navChildren={navChildren}>
      <div data-testid="basic-information-content">
        <Outlet />
      </div>
    </MainLayout>
  );
};

export default BasicInformation;
