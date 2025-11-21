import { useTranslation } from 'react-i18next';

export const useAppRoutes = () => {
  const { t } = useTranslation();

  const competencesPath = t('slugs.profile.competences');

  const profileRoutes = [
    {
      name: t('profile.index'),
      path: t('slugs.profile.front'),
      authRequired: true,
    },
    {
      name: t('profile.competences.title'),
      path: competencesPath,
      authRequired: true,
    },
    {
      name: t('profile.work-history.title'),
      path: `${competencesPath}/${t('slugs.profile.work-history')}`,
      authRequired: true,
    },
    {
      name: t('profile.education-history.title'),
      path: `${competencesPath}/${t('slugs.profile.education-history')}`,
      authRequired: true,
    },
    {
      name: t('profile.free-time-activities.title'),
      path: `${competencesPath}/${t('slugs.profile.free-time-activities')}`,
      authRequired: true,
    },
    {
      name: t('profile.something-else.title'),
      path: `${competencesPath}/${t('slugs.profile.something-else')}`,
      authRequired: true,
    },
    {
      name: t('profile.interests.title'),
      path: t('slugs.profile.interests'),
      authRequired: true,
    },
    {
      name: t('profile.favorites.title'),
      path: t('slugs.profile.favorites'),
      authRequired: true,
    },
    {
      name: t('profile.my-goals.title'),
      path: t('slugs.profile.my-goals'),
      authRequired: true,
    },
    {
      name: t('profile.preferences.title'),
      path: t('slugs.profile.preferences'),
      authRequired: true,
    },
  ];

  const toolRoutes = [
    {
      name: t('menus.tool-navigation.competences'),
      path: t('slugs.tool.competences'),
    },
    {
      name: t('menus.tool-navigation.interests'),
      path: t('slugs.tool.interests'),
    },
  ];

  return { profileRoutes, toolRoutes };
};
