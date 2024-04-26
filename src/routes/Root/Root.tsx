import { useRef, type ComponentProps } from 'react';
import { Route, Routes, NavLink, useLocation, matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ActionBarContext } from '@/hooks/useActionBar';
import { ErrorNote } from '@/features';
import { NavigationBar, Footer } from '@jod/design-system';
import Home from '@/routes/Home';
import Instructions from '@/routes/Instructions';
import BasicInformation from '@/routes/BasicInformation';
import NoMatch from '@/routes/NoMatch';
import Profile from '@/routes/Profile';

const NavigationBarItem = (to: string, text: string) => ({
  component: ({ className }: { className: string }) => (
    <NavLink to={to} className={className}>
      {text}
    </NavLink>
  ),
});

const Root = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const instructions = `/${i18n.language}/${t('slugs.instructions')}`;
  const basicInformation = `/${i18n.language}/${t('slugs.basic-information')}`;
  const items: ComponentProps<typeof Footer>['items'] = [
    NavigationBarItem(`${instructions}/${t('slugs.what-is-the-service')}`, t('about-us-and-instructions')),
    NavigationBarItem(`${basicInformation}/${t('slugs.cookie-policy')}`, t('cookie-policy')),
    NavigationBarItem(`${basicInformation}/${t('slugs.data-sources')}`, t('data-sources')),
    NavigationBarItem(`${basicInformation}/${t('slugs.terms-of-service')}`, t('terms-of-service')),
    NavigationBarItem(`${basicInformation}/${t('slugs.accessibility-statement')}`, t('accessibility-statement')),
    NavigationBarItem(`${basicInformation}/${t('slugs.privacy-policy')}`, t('privacy-policy')),
  ];
  const logos: ComponentProps<typeof Footer>['logos'] = [1, 2, 3].map((item) => ({
    component: ({ key, className }) => (
      <a key={key} href={`/logo${item}`} className={className}>
        Logo {item}
      </a>
    ),
  }));
  // If homepage, use light variant, otherwise use dark variant
  const variant: ComponentProps<typeof Footer>['variant'] = matchPath(`/${i18n.language}`, pathname) ? 'light' : 'dark';

  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
      </Helmet>
      <header className="sticky top-0 z-10 print:hidden">
        <NavigationBar
          logo={
            <NavLink to={`/${i18n.language}`} className="flex">
              <div className="inline-flex select-none items-center gap-4 text-[24px] leading-[140%] text-accent">
                <div className="h-8 w-8 bg-accent"></div>JOD
              </div>
            </NavLink>
          }
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
        <ErrorNote />
      </header>
      <ActionBarContext.Provider value={ref.current}>
        <Routes>
          <Route index element={<Home />} />
          <Route path={`${t('slugs.profile.index')}/*`} element={<Profile />} />
          <Route path={`${t('slugs.instructions')}/*`} element={<Instructions />} />
          <Route path={`${t('slugs.basic-information')}/*`} element={<BasicInformation />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </ActionBarContext.Provider>
      <Footer ref={ref} items={items} logos={logos} copyright={t('copyright')} variant={variant} />
    </>
  );
};

export default Root;
