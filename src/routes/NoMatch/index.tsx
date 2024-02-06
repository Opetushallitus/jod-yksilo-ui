import { useTranslation } from 'react-i18next';

const NoMatch = () => {
  const { t } = useTranslation();

  return <div>{t('no-match')}</div>;
};

export default NoMatch;
