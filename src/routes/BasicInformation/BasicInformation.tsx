import { MainLayout, RoutesNavigationList, SimpleNavigationList } from '@/components';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

const BasicInformation = () => {
  const { t } = useTranslation();
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
  ];

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
