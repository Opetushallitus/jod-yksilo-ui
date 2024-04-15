import { Title } from '@/components';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

const CookiePolicy = () => {
  const { t } = useTranslation();

  return (
    <>
      <Title value={t('cookie-policy')} />
      <h2>{t('cookie-policy')}</h2>
    </>
  );
};

const DataSources = () => {
  const { t } = useTranslation();

  return (
    <>
      <Title value={t('data-sources')} />
      <h2>{t('data-sources')}</h2>
    </>
  );
};

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <>
      <Title value={t('terms-of-service')} />
      <h2>{t('terms-of-service')}</h2>
    </>
  );
};

const AccessibilityStatement = () => {
  const { t } = useTranslation();

  return (
    <>
      <Title value={t('accessibility-statement')} />
      <h2>{t('accessibility-statement')}</h2>
    </>
  );
};

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <>
      <Title value={t('privacy-policy')} />
      <h2>{t('privacy-policy')}</h2>
    </>
  );
};

const BasicInformation = () => {
  const { t } = useTranslation();

  return (
    <>
      <Routes>
        <Route path={t('slugs.cookie-policy')} element={<CookiePolicy />} />
        <Route path={t('slugs.data-sources')} element={<DataSources />} />
        <Route path={t('slugs.terms-of-service')} element={<TermsOfService />} />
        <Route path={t('slugs.accessibility-statement')} element={<AccessibilityStatement />} />
        <Route path={t('slugs.privacy-policy')} element={<PrivacyPolicy />} />
      </Routes>
    </>
  );
};

export default BasicInformation;
