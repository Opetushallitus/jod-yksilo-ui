import { components } from '@/api/schema';
import { LanguageMenu, NavigationBar } from '@/components';
import { ErrorNote, useErrorNote } from '@/components/ErrorNote';
import { MegaMenu } from '@/components/MegaMenu/MegaMenu';
import { NavigationBarProps } from '@/components/NavigationBar/NavigationBar';
import { ActionBarContext } from '@/hooks/useActionBar';
import { Footer, PopupList, PopupListItem, SkipLink, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { MdClose, MdMenu } from 'react-icons/md';
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
  const { error, clearErrorNote } = useErrorNote();

  const { sm } = useMediaQueries();
  const [megaMenuOpen, setMegaMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);

  const userGuide = t('slugs.user-guide.index');
  const basicInformation = t('slugs.basic-information');
  const footerItems: React.ComponentProps<typeof Footer>['items'] = [
    NavigationBarItem(`${userGuide}/${t('slugs.user-guide.what-is-the-service')}`, t('about-us-and-user-guide')),
    NavigationBarItem(`${basicInformation}/${t('slugs.cookie-policy')}`, t('cookie-policy')),
    NavigationBarItem(`${basicInformation}/${t('slugs.data-sources')}`, t('data-sources')),
    NavigationBarItem(`${basicInformation}/${t('slugs.terms-of-service')}`, t('terms-of-service')),
    NavigationBarItem(`${basicInformation}/${t('slugs.accessibility-statement')}`, t('accessibility-statement')),
    NavigationBarItem(`${basicInformation}/${t('slugs.privacy-policy')}`, t('privacy-policy')),
  ];

  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;

  const logout = () => {
    logoutForm.current?.submit();
  };

  const profileIndexPath = t('slugs.profile.index');
  const userMenuUrls = {
    preferences: `${profileIndexPath}/${t('slugs.profile.preferences')}`,
  };

  const logos: React.ComponentProps<typeof Footer>['logos'] = [1, 2, 3].map((item) => ({
    key: item,
    component: ({ className }) => (
      <a href={`/logo${item}`} className={className}>
        TODO: Logo {item}
      </a>
    ),
  }));

  const footerRef = React.useRef<HTMLDivElement>(null);
  const logoutForm = React.useRef<HTMLFormElement>(null);

  const getActiveClassNames = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-secondary-1-50 w-full rounded-sm py-3 pl-5 -ml-5' : '';
  const name = `${data?.etunimi} ${data?.sukunimi}`;

  const toggleMenu = (menu: 'mega' | 'user' | 'lang') => () => {
    setMegaMenuOpen(false);
    setUserMenuOpen(false);
    setLangMenuOpen(false);
    switch (menu) {
      case 'mega':
        setMegaMenuOpen(!megaMenuOpen);
        break;
      case 'user':
        setUserMenuOpen(!userMenuOpen);
        break;
      case 'lang':
        setLangMenuOpen(!langMenuOpen);
        break;
    }
  };

  const changeLanguage = () => {
    setLangMenuOpen(false);
    setMegaMenuOpen(false);
  };

  const getUserData: () => NavigationBarProps['user'] = () =>
    data?.csrf && {
      name,
      component: ({ children, className }) => {
        return (
          <div className="relative">
            <form action="/logout" method="POST" hidden ref={logoutForm}>
              <input type="hidden" name="_csrf" value={data?.csrf.token} />
              <input type="hidden" name="lang" value={i18n.language} />
            </form>
            <button
              type="button"
              className={`${className} bg-cover bg-center`}
              onClick={sm ? toggleMenu('user') : void 0}
            >
              {children}
            </button>
            {sm && userMenuOpen && (
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
    };

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <body className="bg-bg-gray" />
      </Helmet>
      <header role="banner" className="sticky top-0 z-30 print:hidden">
        <SkipLink hash="#jod-main" label={t('skiplinks.main')} />
        <NavigationBar
          onLanguageClick={toggleMenu('lang')}
          logo={
            sm && (
              <NavLink to={`/${i18n.language}`} className="flex">
                <div className="inline-flex select-none items-center gap-4 text-[24px] leading-[140%] text-secondary-gray">
                  <div className="h-8 w-8 bg-secondary-gray"></div>JOD
                </div>
              </NavLink>
            )
          }
          menuComponent={
            sm ? (
              <button
                className="flex gap-4 justify-center items-center"
                aria-label={t('open-menu')}
                onClick={toggleMenu('mega')}
              >
                <>
                  <span>{t('menu')}</span>
                  <span className="size-7 flex justify-center items-center">
                    <MdMenu size={24} />
                  </span>
                </>
              </button>
            ) : (
              <button className="flex justify-self-end" aria-label={t('open-menu')} onClick={toggleMenu('mega')}>
                <>
                  {megaMenuOpen ? (
                    <span className="size-7 flex justify-center items-center">
                      <MdClose size={24} />
                    </span>
                  ) : (
                    <span className="size-7 flex justify-center items-center">
                      <MdMenu size={24} />
                    </span>
                  )}
                </>
              </button>
            )
          }
          user={getUserData()}
        />
        {langMenuOpen && (
          <div className="relative lg:container mx-auto">
            <div className="absolute right-[50px] translate-y-7">
              <LanguageMenu onClick={changeLanguage} />
            </div>
          </div>
        )}
        {error && <ErrorNote error={error} onCloseClick={clearErrorNote} />}
        {megaMenuOpen && (
          <MegaMenu
            loggedIn={!!data}
            user={getUserData()}
            logout={logout}
            onClose={() => setMegaMenuOpen(false)}
            onLanguageClick={changeLanguage}
          />
        )}
      </header>
      <ActionBarContext.Provider value={footerRef.current}>
        <Outlet />
      </ActionBarContext.Provider>
      <Footer
        ref={footerRef}
        items={footerItems}
        logos={logos}
        copyright={t('copyright')}
        variant="light"
        className={!sm ? 'pt-0' : undefined}
      />
      <ScrollRestoration />
    </>
  );
};

export default Root;
