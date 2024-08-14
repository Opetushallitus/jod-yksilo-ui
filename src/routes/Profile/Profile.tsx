import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

const Profile = () => {
  const { t } = useTranslation();

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
  ];

  return <Outlet context={routes} />;
};

export default Profile;
