import { components } from '@/api/schema';
import { ErrorNote } from '@/features';
import { ActionBarContext } from '@/hooks/useActionBar';
import { AuthContext } from '@/hooks/useAuth';
import { clearCsrfToken } from '@/state/csrf/csrfSlice';
import { store } from '@/state/store';
import { Footer, NavigationBar, PopupList, PopupListItem, SkipLink } from '@jod/design-system';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, ScrollRestoration, useLoaderData } from 'react-router-dom';

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
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userGuide = `/${i18n.language}/${t('slugs.user-guide.index')}`;
  const basicInformation = `/${i18n.language}/${t('slugs.basic-information')}`;
  const footerItems: React.ComponentProps<typeof Footer>['items'] = [
    NavigationBarItem(`${userGuide}/${t('slugs.user-guide.what-is-the-service')}`, t('about-us-and-user-guide')),
    NavigationBarItem(`${basicInformation}/${t('slugs.cookie-policy')}`, t('cookie-policy')),
    NavigationBarItem(`${basicInformation}/${t('slugs.data-sources')}`, t('data-sources')),
    NavigationBarItem(`${basicInformation}/${t('slugs.terms-of-service')}`, t('terms-of-service')),
    NavigationBarItem(`${basicInformation}/${t('slugs.accessibility-statement')}`, t('accessibility-statement')),
    NavigationBarItem(`${basicInformation}/${t('slugs.privacy-policy')}`, t('privacy-policy')),
  ];

  const logout = () => {
    store.dispatch(clearCsrfToken());
    logoutForm.current?.submit();
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
  const footerRef = React.useRef<HTMLDivElement>(null);
  const logoutForm = React.useRef<HTMLFormElement>(null);

  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;
  const getActiveClassNames = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-secondary-1-50 w-full rounded-sm py-3 pl-5 -ml-5' : '';
  const name = `${data?.etunimi} ${data?.sukunimi}`;

  return (
    <AuthContext.Provider value={data}>
      <ScrollRestoration />
      <Helmet>
        <html lang={i18n.language} />
        <body className="bg-bg-gray" />
      </Helmet>
      <header role="banner" className="sticky top-0 z-10 print:hidden">
        <SkipLink hash="#jod-main" label={t('skiplinks.main')} />
        <NavigationBar
          logo={
            <NavLink to={`/${i18n.language}`} className="flex">
              <div className="inline-flex select-none items-center gap-4 text-[24px] leading-[140%] text-secondary-gray">
                <div className="h-8 w-8 bg-secondary-gray"></div>JOD
              </div>
            </NavLink>
          }
          user={
            data?.csrf && {
              name,
              component: ({ children, className }) => {
                return (
                  <div className="relative">
                    <form action="/logout" method="POST" hidden ref={logoutForm}>
                      <input type="hidden" name="_csrf" value={data.csrf.token} />
                      <input type="hidden" name="lang" value={i18n.language} />
                    </form>
                    <button
                      type="button"
                      className={`${className} bg-cover bg-center`}
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                      {children}
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 min-w-max translate-y-8 transform">
                        <PopupList>
                          <PopupListItem>
                            <NavLink
                              to={userMenuUrls.preferences}
                              onClick={() => setUserMenuOpen(false)}
                              className={getActiveClassNames}
                            >
                              {t('profile.index')}
                            </NavLink>
                          </PopupListItem>
                          <PopupListItem>
                            <button type="button" onClick={logout}>
                              {t('logout')}
                            </button>
                          </PopupListItem>
                        </PopupList>
                      </div>
                    )}
                  </div>
                );
              },
            }
          }
          login={{ url: `/login?lang=${i18n.language}`, text: 'Login' }}
        />
        <ErrorNote />
      </header>
      <ActionBarContext.Provider value={footerRef.current}>
        <Outlet />
      </ActionBarContext.Provider>
      <Footer ref={footerRef} items={footerItems} logos={logos} copyright={t('copyright')} variant="light" />
    </AuthContext.Provider>
  );
};

export default Root;
