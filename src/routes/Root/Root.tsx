import { components } from '@/api/schema';
import { LanguageButton, LanguageMenu, UserButton } from '@/components';
import { ErrorNote, useErrorNote } from '@/components/ErrorNote';
import { MegaMenu } from '@/components/MegaMenu/MegaMenu';
import { ActionBarContext } from '@/hooks/useActionBar';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import i18n from '@/i18n/config';
import { useToolStore } from '@/stores/useToolStore';
import { Footer, NavigationBar, SkipLink, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdMenu } from 'react-icons/md';
import { NavLink, Outlet, ScrollRestoration, useLoaderData } from 'react-router';

const NavigationBarItem = (to: string, text: string) => ({
  key: to,
  component: ({ className }: { className: string }) => (
    <NavLink to={to} className={className}>
      {text}
    </NavLink>
  ),
});

const Root = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const toolStore = useToolStore();
  const { error, clearErrorNote } = useErrorNote();

  const { sm } = useMediaQueries();
  const [megaMenuOpen, setMegaMenuOpen] = React.useState(false);
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
  const logoutForm = React.useRef<HTMLFormElement>(null);
  const megaMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const langMenuButtonRef = React.useRef<HTMLLIElement>(null);

  const megaMenuRef = useMenuClickHandler(() => setMegaMenuOpen(false), megaMenuButtonRef);
  const langMenuRef = useMenuClickHandler(() => setLangMenuOpen(false), langMenuButtonRef);

  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;
  const footerRef = React.useRef<HTMLDivElement>(null);

  const toggleMenu = (menu: 'mega' | 'lang') => () => {
    setMegaMenuOpen(false);
    setLangMenuOpen(false);

    switch (menu) {
      case 'mega':
        setMegaMenuOpen(!megaMenuOpen);
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

  const logout = () => {
    toolStore.reset();
    logoutForm.current?.submit();
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  return (
    <div className="bg-bg-gray">
      <link rel="manifest" href={`/yksilo/manifest-${language}.json`} crossOrigin="use-credentials" />
      <header role="banner" className="sticky top-0 z-30 print:hidden">
        <SkipLink hash="#jod-main" label={t('skiplinks.main')} />
        <form action="/yksilo/logout" method="POST" hidden ref={logoutForm}>
          <input type="hidden" name="_csrf" value={data?.csrf.token} />
          <input type="hidden" name="lang" value={language} />
        </form>
        <NavigationBar
          languageButtonComponent={<LanguageButton onClick={toggleMenu('lang')} />}
          userButtonComponent={<UserButton onLogout={logout} />}
          logo={{
            to: `/${language}`,
            language,
            srText: t('osaamispolku'),
          }}
          menuComponent={
            sm ? (
              <button
                className="cursor-pointer flex gap-4 justify-center items-center select-none"
                aria-label={megaMenuOpen ? t('close-menu') : t('open-menu')}
                onClick={toggleMenu('mega')}
                ref={megaMenuButtonRef}
              >
                <span className="py-3 pl-3">{t('menu')}</span>
                <span className="size-7 flex justify-center items-center">
                  <MdMenu size={24} />
                </span>
              </button>
            ) : (
              !megaMenuOpen && (
                <button
                  className="cursor-pointer flex justify-self-end p-3"
                  aria-label={t('open-menu')}
                  onClick={toggleMenu('mega')}
                  ref={megaMenuButtonRef}
                >
                  <span className="size-7 flex justify-center items-center">
                    <MdMenu size={24} />
                  </span>
                </button>
              )
            )
          }
          refs={{ langMenuButtonRef: langMenuButtonRef }}
          renderLink={({ to, className, children }) => (
            <NavLink to={to} className={className}>
              {children as React.ReactNode}
            </NavLink>
          )}
        />
        {langMenuOpen && (
          <div className="relative xl:container mx-auto">
            <div ref={langMenuRef} className="absolute right-[50px] translate-y-7">
              <LanguageMenu onClick={changeLanguage} />
            </div>
          </div>
        )}
        {error && <ErrorNote error={error} onCloseClick={clearErrorNote} />}
        {megaMenuOpen && (
          <div ref={megaMenuRef}>
            <MegaMenu
              loggedIn={!!data}
              onLogout={logout}
              onClose={() => setMegaMenuOpen(false)}
              onLanguageClick={changeLanguage}
            />
          </div>
        )}
      </header>
      <ActionBarContext.Provider value={footerRef.current}>
        <Outlet />
      </ActionBarContext.Provider>
      <Footer
        ref={footerRef}
        items={footerItems}
        language={language}
        copyright={t('copyright')}
        variant="light"
        className={!sm ? 'py-7' : undefined}
      />
      <ScrollRestoration />
    </div>
  );
};

export default Root;
