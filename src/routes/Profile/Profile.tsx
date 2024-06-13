import { useTranslation } from 'react-i18next';
import { Outlet, matchPath, useLocation } from 'react-router-dom';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  const routes = [
    {
      name: t('profile.preferences'),
      path: t('slugs.profile.preferences'),
    },
    {
      name: t('profile.favorites'),
      path: t('slugs.profile.favorites'),
    },
    {
      name: t('profile.competences'),
      path: t('slugs.profile.competences'),
    },
    {
      name: t('profile.work-history'),
      path: t('slugs.profile.work-history'),
    },
    {
      name: t('profile.education-history'),
      path: t('slugs.profile.education-history'),
    },
    {
      name: t('profile.free-time-activities'),
      path: t('slugs.profile.free-time-activities'),
    },
    {
      name: t('profile.something-else'),
      path: t('slugs.profile.something-else'),
    },
  ].map((route) => ({
    ...route,
    active: !!matchPath(`/${i18n.language}/${t('slugs.profile.index')}/${route.path}`, pathname),
  }));

  return <Outlet context={routes} />;
};

export default Profile;
