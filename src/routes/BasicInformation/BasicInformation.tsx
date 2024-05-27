import { useTranslation } from 'react-i18next';
import { matchPath, useLocation, Outlet } from 'react-router-dom';
import { MainLayout, SimpleNavigationList, RoutesNavigationList } from '@/components';

const BasicInformation = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const basicInformationPath = `/${i18n.language}/${t('slugs.basic-information')}`;
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
  ].map((route) => ({
    ...route,
    active: !!matchPath(`${basicInformationPath}/${route.path}`, pathname),
  }));

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('basic-information')}>
          <RoutesNavigationList routes={routes} />
        </SimpleNavigationList>
      }
    >
      <Outlet />
    </MainLayout>
  );
};

export default BasicInformation;
