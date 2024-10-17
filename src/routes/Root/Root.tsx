import { components } from '@/api/schema';
import { LanguageMenu, LogoIconRgb, LogoRgbEn, LogoRgbFi, LogoRgbSv, NavigationBar } from '@/components';
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
import {
  LogoEuEn,
  LogoEuFi,
  LogoEuSv,
  LogoKehaEn,
  LogoKehaFi,
  LogoKehaSv,
  LogoOkmEn,
  LogoOkmFiSv,
  LogoOphEn,
  LogoOphFiSv,
  LogoTemEn,
  LogoTemFiSv,
} from './logos';

const NavigationBarItem = (to: string, text: string) => ({
  key: to,
  component: ({ className }: { className: string }) => (
    <NavLink to={to} className={className}>
      {text}
    </NavLink>
  ),
});

const LogoRgb = ({ language, size }: { language: string; size: number }) => {
  switch (language) {
    case 'sv':
      return <LogoRgbSv size={size} />;
    case 'en':
      return <LogoRgbEn size={size} />;
    default:
      return <LogoRgbFi size={size} />;
  }
};

const Root = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
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
  const logos = React.useMemo(() => {
    switch (language) {
      case 'sv':
        return [
          <div key="LogoEuSv" className="flex">
            <LogoEuSv className="h-10" />
          </div>,
          <div key="LogoOkmFiSv" className="flex">
            <LogoOkmFiSv className="h-10" />
          </div>,
          <div key="LogoTemFiSv" className="flex">
            <LogoTemFiSv className="h-10" />
          </div>,
          <div key="LogoKehaSv" className="flex">
            <LogoKehaSv className="h-10" />
          </div>,
          <div key="LogoOphFiSv" className="flex">
            <LogoOphFiSv className="h-10" />
          </div>,
        ];
      case 'en':
        return [
          <div key="LogoEuEn" className="flex">
            <LogoEuEn className="h-10" />
          </div>,
          <div key="LogoOkmEn" className="flex">
            <LogoOkmEn className="h-10" />
          </div>,
          <div key="LogoTemEn" className="flex">
            <LogoTemEn className="h-10" />
          </div>,
          <div key="LogoKehaEn" className="flex">
            <LogoKehaEn className="h-10" />
          </div>,
          <div key="LogoOphEn" className="flex">
            <LogoOphEn className="h-10" />
          </div>,
        ];
      default:
        return [
          <div key="LogoEuFi" className="flex">
            <LogoEuFi className="h-10" />
          </div>,
          <div key="LogoOkmFiSv" className="flex">
            <LogoOkmFiSv className="h-10" />
          </div>,
          <div key="LogoTemFiSv" className="flex">
            <LogoTemFiSv className="h-10" />
          </div>,
          <div key="LogoKehaFi" className="flex">
            <LogoKehaFi className="h-10" />
          </div>,
          <div key="LogoOphFiSv" className="flex">
            <LogoOphFiSv className="h-10" />
          </div>,
        ];
    }
  }, [language]);

  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;

  const logout = () => {
    logoutForm.current?.submit();
  };

  const profileIndexPath = t('slugs.profile.index');
  const userMenuUrls = {
    preferences: `${profileIndexPath}/${t('slugs.profile.preferences')}`,
  };

  const footerRef = React.useRef<HTMLDivElement>(null);
  const logoutForm = React.useRef<HTMLFormElement>(null);

  const getActiveClassNames = ({ isActive }: { isActive: boolean }) => (isActive ? 'bg-secondary-1-50 rounded-sm' : '');
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
              <input type="hidden" name="lang" value={language} />
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
                <PopupList classNames="gap-2">
                  <NavLink
                    to={userMenuUrls.preferences}
                    onClick={() => setUserMenuOpen(false)}
                    className={(props) => `w-full ${getActiveClassNames(props)}`.trim()}
                  >
                    <PopupListItem>{t('profile.index')}</PopupListItem>
                  </NavLink>
                  <button type="button" onClick={logout} className="w-full">
                    <PopupListItem classNames="w-full">{t('logout')}</PopupListItem>
                  </button>
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
        <html lang={language} />
        <link rel="manifest" href={`/manifest-${language}.json`} />
        <body className="bg-bg-gray" />
      </Helmet>
      <header role="banner" className="sticky top-0 z-30 print:hidden">
        <SkipLink hash="#jod-main" label={t('skiplinks.main')} />
        <NavigationBar
          onLanguageClick={toggleMenu('lang')}
          logo={
            <NavLink to={`/${language}`} className="flex">
              <div className="inline-flex select-none items-center gap-4">
                {sm ? <LogoRgb language={language} size={32} /> : <LogoIconRgb size={32} />}
                <span className="sr-only">{t('osaamispolku')}</span>
              </div>
            </NavLink>
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
        logos={
          logos ? (
            <div className="px-5 sm:px-0 grid sm:grid-cols-3 gap-6 sm:gap-9 items-center">{logos}</div>
          ) : undefined
        }
        copyright={t('copyright')}
        variant="light"
        className={!sm ? 'py-7' : undefined}
      />
      <ScrollRestoration />
    </>
  );
};

export default Root;
