import { useRef, type ComponentProps } from 'react';
import { NavLink, useLocation, matchPath, ScrollRestoration, useLoaderData, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ActionBarContext } from '@/hooks/useActionBar';
import { ErrorNote } from '@/features';
import { NavigationBar, Footer, SkipLink } from '@jod/design-system';
import { RootLoaderData } from './loader';
import { AuthContext } from '@/hooks/useAuth';

const NavigationBarItem = (to: string, text: string) => ({
  key: to,
  component: ({ className }: { className: string }) => (
    <NavLink to={to} className={className}>
      {text}
    </NavLink>
  ),
});

const Root = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const userGuide = `/${i18n.language}/${t('slugs.user-guide.index')}`;
  const basicInformation = `/${i18n.language}/${t('slugs.basic-information')}`;
  const items: ComponentProps<typeof Footer>['items'] = [
    NavigationBarItem(`${userGuide}/${t('slugs.user-guide.what-is-the-service')}`, t('about-us-and-user-guide')),
    NavigationBarItem(`${basicInformation}/${t('slugs.cookie-policy')}`, t('cookie-policy')),
    NavigationBarItem(`${basicInformation}/${t('slugs.data-sources')}`, t('data-sources')),
    NavigationBarItem(`${basicInformation}/${t('slugs.terms-of-service')}`, t('terms-of-service')),
    NavigationBarItem(`${basicInformation}/${t('slugs.accessibility-statement')}`, t('accessibility-statement')),
    NavigationBarItem(`${basicInformation}/${t('slugs.privacy-policy')}`, t('privacy-policy')),
  ];
  const logos: ComponentProps<typeof Footer>['logos'] = [1, 2, 3].map((item) => ({
    key: item,
    component: ({ className }) => (
      <a href={`/logo${item}`} className={className}>
        Logo {item}
      </a>
    ),
  }));
  // If homepage, use light variant, otherwise use dark variant
  const variant: ComponentProps<typeof Footer>['variant'] = matchPath(`/${i18n.language}`, pathname) ? 'light' : 'dark';
  const footerRef = useRef<HTMLDivElement>(null);

  const data = useLoaderData() as RootLoaderData;

  return (
    <AuthContext.Provider value={data}>
      <ScrollRestoration />
      <Helmet>
        <html lang={i18n.language} />
      </Helmet>
      <header role="banner" className="sticky top-0 z-10 print:hidden">
        <SkipLink hash="#jod-main" label={t('skiplinks.main')} />
        <NavigationBar
          logo={
            <NavLink to={`/${i18n.language}`} className="flex">
              <div className="inline-flex select-none items-center gap-4 text-[24px] leading-[140%] text-accent">
                <div className="h-8 w-8 bg-accent"></div>JOD
              </div>
            </NavLink>
          }
          user={
            data.csrf && {
              name: 'Reetta Räppänä',
              component: ({ children, ...rootProps }) => {
                return (
                  <NavLink to={`/${i18n.language}/${t('slugs.profile.index')}`} {...rootProps}>
                    {children}
                  </NavLink>
                );
              },
            }
          }
          login={{ url: '/login', text: 'Login' }}
        />
        <ErrorNote />
      </header>
      <ActionBarContext.Provider value={footerRef.current}>
        <Outlet />
      </ActionBarContext.Provider>
      <Footer ref={footerRef} items={items} logos={logos} copyright={t('copyright')} variant={variant} />
    </AuthContext.Provider>
  );
};

export default Root;
