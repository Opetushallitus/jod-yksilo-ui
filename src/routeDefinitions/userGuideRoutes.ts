import { useTranslation } from 'react-i18next';

const useUserGuideRoutes = () => {
  const { t } = useTranslation();
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

  return { userGuideRoutes };
};

export default useUserGuideRoutes;
