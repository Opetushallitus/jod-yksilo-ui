import { ErrorNote } from '@/features';
import { ActionBarContext } from '@/hooks/useActionBar';
import { AuthContext } from '@/hooks/useAuth';
import { Footer, NavigationBar, PopupList, SkipLink } from '@jod/design-system';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, ScrollRestoration, matchPath, useLoaderData, useLocation } from 'react-router-dom';
import { RootLoaderData } from './loader';

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
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userGuide = `/${i18n.language}/${t('slugs.user-guide.index')}`;
  const basicInformation = `/${i18n.language}/${t('slugs.basic-information')}`;
  const isCurrentPageActive = (path: string) => path === pathname;
  const footerItems: React.ComponentProps<typeof Footer>['items'] = [
    NavigationBarItem(`${userGuide}/${t('slugs.user-guide.what-is-the-service')}`, t('about-us-and-user-guide')),
    NavigationBarItem(`${basicInformation}/${t('slugs.cookie-policy')}`, t('cookie-policy')),
    NavigationBarItem(`${basicInformation}/${t('slugs.data-sources')}`, t('data-sources')),
    NavigationBarItem(`${basicInformation}/${t('slugs.terms-of-service')}`, t('terms-of-service')),
    NavigationBarItem(`${basicInformation}/${t('slugs.accessibility-statement')}`, t('accessibility-statement')),
    NavigationBarItem(`${basicInformation}/${t('slugs.privacy-policy')}`, t('privacy-policy')),
  ];

  const logout = () => {
    window.location.href = '/logout';
  };

  const userMenuUrls = {
    preferences: `/${i18n.language}/${t('slugs.profile.index')}/${t('slugs.profile.preferences')}`,
  };

  const logos: React.ComponentProps<typeof Footer>['logos'] = [1, 2, 3].map((item) => ({
    key: item,
    component: ({ className }) => (
      <a href={`/logo${item}`} className={className}>
        Logo {item}
      </a>
    ),
  }));
  // If homepage, use light variant, otherwise use dark variant
  const variant: React.ComponentProps<typeof Footer>['variant'] = matchPath(`/${i18n.language}`, pathname)
    ? 'light'
    : 'dark';
  const footerRef = React.useRef<HTMLDivElement>(null);

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
              component: ({ children, className }) => {
                return (
                  <div className="relative">
                    <button type="button" className={className} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                      {children}
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 min-w-max translate-y-8 transform">
                        <PopupList
                          items={[
                            {
                              label: t('profile.index'),
                              href: userMenuUrls.preferences,
                              active: isCurrentPageActive(userMenuUrls.preferences),
                            },
                            {
                              label: t('logout'),
                              type: 'button',
                              onClick: logout,
                            },
                          ]}
                        />
                      </div>
                    )}
                  </div>
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
      <Footer ref={footerRef} items={footerItems} logos={logos} copyright={t('copyright')} variant={variant} />
    </AuthContext.Provider>
  );
};

export default Root;
