import { MainLayout } from '@/components';
import { generateMenuItems } from '@/utils/routeUtils';
import { PageNavigation, type MenuSection } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';

const BasicInformation = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const routes = [
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
    {
      name: t('privacy-policy'),
      path: t('slugs.privacy-policy'),
    },
    {
      name: t('about-ai'),
      path: t('slugs.about-ai'),
    },
  ];

  const menuSection: MenuSection = {
    title: t('on-this-page'),
    linkItems: generateMenuItems({
      menuRoutes: routes,
      pathPrefix: t('slugs.basic-information'),
      pathname,
    }),
  };

  return (
    <MainLayout navChildren={<PageNavigation menuSection={menuSection} openSubMenuLabel="" activeIndicator="dot" />}>
      <Outlet />
    </MainLayout>
  );
};

export default BasicInformation;
