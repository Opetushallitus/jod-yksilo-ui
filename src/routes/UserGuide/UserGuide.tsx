import { MainLayout, RoutesNavigationList, SimpleNavigationList } from '@/components';
import { userGuideRoutes } from '@/routeDefinitions/userGuideRoutes';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

const UserGuide = () => {
  const { t } = useTranslation();

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('user-guide')}>
          <RoutesNavigationList routes={userGuideRoutes} />
        </SimpleNavigationList>
      }
    >
      <Outlet />
    </MainLayout>
  );
};

export default UserGuide;
