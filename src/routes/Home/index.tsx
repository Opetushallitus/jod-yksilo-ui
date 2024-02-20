import { useTranslation } from 'react-i18next';
import { Counter } from '@/features';
import { Title } from '@/components';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Title value={t('home')} />
      <h1>{t('home')}</h1>
      <Counter />
    </div>
  );
};

export default Home;
