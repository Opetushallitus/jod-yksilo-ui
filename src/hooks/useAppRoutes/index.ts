import { useTranslation } from 'react-i18next';

export const useAppRoutes = () => {
  const { t } = useTranslation();

  const profileRoutes = [
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
      name: t('profile.interests.title'),
      path: t('slugs.profile.interests'),
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
      name: t('profile.something-else.title'),
      path: t('slugs.profile.something-else'),
    },
  ];

  const toolRoutes = [
    {
      name: t('menus.tool-navigation.goals'),
      path: t('slugs.tool.goals'),
    },
    {
      name: t('menus.tool-navigation.competences'),
      path: t('slugs.tool.competences'),
    },
    {
      name: t('menus.tool-navigation.interests'),
      path: t('slugs.tool.interests'),
    },
    {
      name: t('menus.tool-navigation.restrictions'),
      path: t('slugs.tool.restrictions'),
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
