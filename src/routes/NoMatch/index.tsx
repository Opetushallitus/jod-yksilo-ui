import { Title } from '@/components';
import { useTranslation } from 'react-i18next';

const NoMatch = () => {
  const { t } = useTranslation();

  return (
    <>
      <Title value={t('no-match')} />
      <div>{t('no-match')}</div>
    </>
  );
};

export default NoMatch;
