import { useTranslation } from 'react-i18next';

export const useAppRoutes = () => {
  const { t } = useTranslation();

  const competencesPath = t('slugs.profile.competences');

  const profileRoutes = [
    {
      name: t('profile.front.title'),
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
      name: t('profile.preferences.title'),
      path: t('slugs.profile.preferences'),
      authRequired: true,
    },
    {
      name: t('profile.my-goals.title'),
      path: t('slugs.profile.my-goals'),
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

  const userGuideRoutes = [
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
  ];

  return { profileRoutes, toolRoutes, userGuideRoutes };
};
