import { MainLayout, RoutesNavigationList, SimpleNavigationList } from '@/components';
import { useAppRoutes } from '@/hooks/useAppRoutes';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

const UserGuide = () => {
  const { t } = useTranslation();
  const { userGuideRoutes } = useAppRoutes();

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
