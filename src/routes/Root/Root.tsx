import { Route, Routes, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { NavigationBar } from '@jod/design-system';
import Home from '@/routes/Home';
import AboutUs from '@/routes/AboutUs';
import NoMatch from '@/routes/NoMatch';
import Profile from '@/routes/Profile';
import './Root.css';

const Root = () => {
  const { t, i18n } = useTranslation();
  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
      </Helmet>
      <header className="sticky top-0 z-10">
        <NavigationBar
          user={{
            name: 'John Doe',
            component: ({ children, ...rootProps }) => {
              return (
                <NavLink to={`/${i18n.language}/${t('slugs.user')}`} {...rootProps}>
                  {children}
                </NavLink>
              );
            },
          }}
        />
      </header>
      <main className="p-3">
        <Routes>
          <Route index element={<Home />} />
          <Route path={`${t('slugs.profile.index')}/*`} element={<Profile />} />
          <Route path={`${t('slugs.about-us')}/*`} element={<AboutUs />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </main>
      <footer className="bg-[#AFB3F3] p-3">{t('footer')}</footer>
    </>
  );
};

export default Root;
