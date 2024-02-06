import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Home from '../Home';
import AboutUs from '../AboutUs';
import NoMatch from '../NoMatch';

const Root = () => {
  const { t } = useTranslation();

  return (
    <>
      <header>
        <h1>{t('header')}</h1>
      </header>
      <main>
        <Routes>
          <Route index element={<Home />} />
          <Route path={`${t('slugs.about-us')}/*`} element={<AboutUs />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </main>
      <footer>{t('footer')}</footer>
    </>
  );
};

export default Root;
