import { useTranslation } from 'react-i18next';

const useToolRoutes = () => {
  const { t } = useTranslation();

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

  return { toolRoutes };
};

export default useToolRoutes;
