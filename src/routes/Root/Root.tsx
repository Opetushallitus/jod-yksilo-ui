/* eslint-disable sonarjs/no-duplicate-string */
import { Route, Routes, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Home from '@/routes/Home';
import AboutUs from '@/routes/AboutUs';
import NoMatch from '@/routes/NoMatch';
import './Root.css';

const Root = () => {
  const { t, i18n } = useTranslation();

  const links = [
    { to: `/${i18n.language}`, text: t('home') },
    { to: `/${i18n.language}/${t('slugs.about-us')}`, text: t('about-us') },
    { to: `/${i18n.language}/${t('slugs.about-us')}/${t('slugs.terms-of-service')}`, text: t('terms-of-service') },
    {
      to: `/${i18n.language}/${t('slugs.about-us')}/${t('slugs.accessibility-statement')}`,
      text: t('accessibility-statement'),
    },
    { to: `/${i18n.language}/${t('slugs.about-us')}/${t('slugs.privacy-policy')}`, text: t('privacy-policy') },
    { to: `/${i18n.language}/${t('slugs.about-us')}/${t('slugs.cookies')}`, text: t('cookies') },
  ];

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
      </Helmet>
      <header className="bg-jod-primary p-3">
        <h1>{t('header')}</h1>
        <ul className="flex flex-wrap gap-3">
          {['en', 'fi', 'sv'].map((lng) => (
            <li key={lng}>
              <NavLink to={`/${lng}`} className="block p-3">
                {lng}
              </NavLink>
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.text}>
              <NavLink to={link.to} className="block p-3">
                {link.text}
              </NavLink>
            </li>
          ))}
        </ul>
      </header>
      <main className="p-3">
        <Routes>
          <Route index element={<Home />} />
          <Route path={`${t('slugs.about-us')}/*`} element={<AboutUs />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </main>
      <footer className="bg-jod-secondary p-3">{t('footer')}</footer>
    </>
  );
};

export default Root;
