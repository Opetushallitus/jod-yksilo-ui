import { useTranslation } from 'react-i18next';
import { Counter } from '../../features';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('home')}</h1>
      <Counter />
    </div>
  );
};

export default Home;
