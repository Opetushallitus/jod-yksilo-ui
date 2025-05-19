import { components } from '@/api/schema';
import { LanguageButton, UserButton } from '@/components';
import { ErrorNote } from '@/components/ErrorNote';
import { NavMenu } from '@/components/NavMenu/NavMenu';
import { Toaster } from '@/components/Toaster/Toaster';
import { useInteractionMethod } from '@/hooks/useInteractionMethod';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import { useErrorNoteStore } from '@/stores/useErrorNoteStore';
import { useToolStore } from '@/stores/useToolStore';
import { Footer, NavigationBar, SkipLink, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdMenu } from 'react-icons/md';
import { Link, NavLink, Outlet, ScrollRestoration, useLoaderData } from 'react-router';
import { LogoutFormContext } from '.';

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
  const { error, clearErrorNote } = useErrorNoteStore();
  const isMouseInteraction = useInteractionMethod();

  const { sm } = useMediaQueries();
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);

  const [navMenuOpen, setNavMenuOpen] = React.useState(false);

  const userGuide = t('slugs.user-guide.index');
  const basicInformation = t('slugs.basic-information');
  const footerItems: React.ComponentProps<typeof Footer>['items'] = [
    NavigationBarItem(`${userGuide}/${t('slugs.user-guide.what-is-the-service')}`, t('about-us-and-user-guide')),
    NavigationBarItem(`${basicInformation}/${t('slugs.cookie-policy')}`, t('cookie-policy')),
    NavigationBarItem(`${basicInformation}/${t('slugs.data-sources')}`, t('data-sources')),
    NavigationBarItem(`${basicInformation}/${t('slugs.terms-of-service')}`, t('terms-of-service')),
    NavigationBarItem(`${basicInformation}/${t('slugs.accessibility-statement')}`, t('accessibility-statement')),
    NavigationBarItem(`${basicInformation}/${t('slugs.privacy-policy')}`, t('privacy-policy')),
    NavigationBarItem(`${basicInformation}/${t('slugs.about-ai')}`, t('about-ai')),
  ];
  const logoutForm = React.useRef<HTMLFormElement>(null);
  const langMenuButtonRef = React.useRef<HTMLLIElement>(null);

  const langMenuRef = useMenuClickHandler(() => setLangMenuOpen(false), langMenuButtonRef);

  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;

  const logout = () => {
    toolStore.reset();
    logoutForm.current?.submit();
  };

  // Move focus to menu content when opened
  React.useEffect(() => {
    if (langMenuOpen && !isMouseInteraction && langMenuRef.current) {
      const firstChild = langMenuRef.current.querySelector('a, button');
      if (firstChild) {
        (firstChild as HTMLElement).focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langMenuOpen]);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (langMenuRef.current && !langMenuRef.current.contains(event.relatedTarget as Node)) {
      setLangMenuOpen(false);
    }
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  return (
    <div className="flex flex-col min-h-screen bg-bg-gray">
      <link rel="manifest" href={`/yksilo/manifest-${language}.json`} crossOrigin="use-credentials" />
      <header role="banner" className="sticky top-0 z-30 print:hidden">
        <SkipLink hash="#jod-main" label={t('skiplinks.main')} />
        <form action="/yksilo/logout" method="POST" hidden ref={logoutForm}>
          <input type="hidden" name="_csrf" value={data?.csrf.token} />
          <input type="hidden" name="lang" value={language} />
        </form>
        <NavigationBar
          logo={{ to: `/${language}`, language, srText: t('osaamispolku') }}
          menuComponent={
            <button
              onClick={() => setNavMenuOpen(!navMenuOpen)}
              aria-label={t('open-menu')}
              className="flex gap-2 justify-center items-center select-none cursor-pointer"
            >
              <span className="size-7 flex justify-center items-center">
                <MdMenu size={24} />
              </span>
              <span className="py-3 pr-2">{t('menu')}</span>
            </button>
          }
          languageButtonComponent={
            <LanguageButton
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              langMenuOpen={langMenuOpen}
              menuRef={langMenuRef}
              onMenuBlur={handleBlur}
              onMenuClick={() => setLangMenuOpen(false)}
            />
          }
          userButtonComponent={<UserButton onLogout={logout} />}
          refs={{ langMenuButtonRef: langMenuButtonRef }}
          renderLink={({ to, className, children }) => (
            <Link to={to} className={className}>
              {children as React.ReactNode}
            </Link>
          )}
        />
        {error && <ErrorNote error={error} onCloseClick={clearErrorNote} />}
      </header>
      <LogoutFormContext.Provider value={logoutForm.current}>
        <NavMenu open={navMenuOpen} onClose={() => setNavMenuOpen(false)} />
        <Outlet />
      </LogoutFormContext.Provider>
      <Footer
        items={footerItems}
        language={language}
        copyright={t('copyright')}
        variant="light"
        className={!sm ? 'py-7' : undefined}
      />
      <Toaster />
      <ScrollRestoration />
    </div>
  );
};

export default Root;
