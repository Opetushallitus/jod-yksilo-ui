import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

const TermsOfService = () => {
  const { t } = useTranslation();

  return <div>{t('terms-of-service')}</div>;
};

const AccessibilityStatement = () => {
  const { t } = useTranslation();

  return <div>{t('accessibility-statement')}</div>;
};

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return <div>{t('privacy-policy')}</div>;
};

const Cookies = () => {
  const { t } = useTranslation();

  return <div>{t('cookies')}</div>;
};

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <>
      <h1>{t('about-us')}</h1>
      <Routes>
        <Route path={t('slugs.terms-of-service')} element={<TermsOfService />} />
        <Route path={t('slugs.accessibility-statement')} element={<AccessibilityStatement />} />
        <Route path={t('slugs.privacy-policy')} element={<PrivacyPolicy />} />
        <Route path={t('slugs.cookies')} element={<Cookies />} />
      </Routes>
    </>
  );
};

export default AboutUs;
