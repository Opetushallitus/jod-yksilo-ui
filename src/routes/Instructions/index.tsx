import { Title } from '@/components';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <>
      <Title value={t('about-us')} />
      <h2>{t('about-us')}</h2>
    </>
  );
};

const Instructions = () => {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-[1140px] p-6">
      <Routes>
        <Route path={t('slugs.about-us')} element={<AboutUs />} />
      </Routes>
    </main>
  );
};

export default Instructions;
