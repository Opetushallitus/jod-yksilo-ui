import { matchPath, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MainLayout, SimpleNavigationList, RoutesNavigationList } from '@/components';

const UserGuide = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const basicInformationPath = `/${i18n.language}/${t('slugs.user-guide.index')}`;
  const routes = [
    {
      name: t('what-is-the-service'),
      path: t('slugs.user-guide.what-is-the-service'),
    },
    {
      name: t('who-is-the-service-for'),
      path: t('slugs.user-guide.who-is-the-service-for'),
    },
    {
      name: t('how-do-i-use-the-service'),
      path: t('slugs.user-guide.how-do-i-use-the-service'),
    },
    {
      name: t('where-can-i-get-more-help'),
      path: t('slugs.user-guide.where-can-i-get-more-help'),
    },
    {
      name: t('who-provides-the-service'),
      path: t('slugs.user-guide.who-provides-the-service'),
    },
    {
      name: t('how-do-i-give-feedback'),
      path: t('slugs.user-guide.how-do-i-give-feedback'),
    },
  ].map((route) => ({
    ...route,
    active: !!matchPath(`${basicInformationPath}/${route.path}`, pathname),
  }));

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('user-guide')}>
          <RoutesNavigationList routes={routes} />
        </SimpleNavigationList>
      }
    >
      <Outlet />
    </MainLayout>
  );
};

export default UserGuide;
