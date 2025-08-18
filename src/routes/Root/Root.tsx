import { components } from '@/api/schema';
import { LanguageButton, UserButton } from '@/components';
import { ErrorNote } from '@/components/ErrorNote';
import { NavMenu } from '@/components/NavMenu/NavMenu';
import { Toaster } from '@/components/Toaster/Toaster';
import { useInteractionMethod } from '@/hooks/useInteractionMethod';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import { useErrorNoteStore } from '@/stores/useErrorNoteStore';
import { useToolStore } from '@/stores/useToolStore';
import { Chatbot, Footer, MatomoTracker, NavigationBar, ServiceVariantProvider, SkipLink } from '@jod/design-system';
import { JodMenu } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet, ScrollRestoration, useLoaderData, useLocation } from 'react-router';
import { LogoutFormContext } from '.';

const agents: Record<'fi' | 'sv' | 'en', string> = {
  fi: '2c134474-326f-4456-9139-8e585a569a9a',
  sv: 'd41ea75b-628f-4420-9e4a-7431ffabb047',
  en: '37f50124-4dec-4cab-8bc6-f8d2ea5bfe21',
};

const Root = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const toolStore = useToolStore();
  const { error, clearErrorNote } = useErrorNoteStore();
  const isMouseInteraction = useInteractionMethod();
  const location = useLocation();

  const hostname = window.location.hostname;
  const siteId = React.useMemo(() => {
    if (hostname === 'localhost' || hostname === 'jodkehitys.fi') {
      return 37;
    } else if (hostname === 'jodtestaus.fi') {
      return 38;
    } else if (hostname === 'osaamispolku.fi') {
      return 36;
    }
  }, [hostname]);

  const [langMenuOpen, setLangMenuOpen] = React.useState(false);

  const [navMenuOpen, setNavMenuOpen] = React.useState(false);

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

  const infoSlug = t('slugs.basic-information');
  const moreInfoLinks = [
    {
      to: `${t('slugs.user-guide.index')}/${t('slugs.user-guide.what-is-the-service')}`,
      label: t('about-us'),
    },
    {
      to: `${infoSlug}/${t('slugs.privacy-policy')}`,
      label: t('privacy-policy-and-cookies'),
    },
    {
      to: `${infoSlug}/${t('slugs.data-sources')}`,
      label: t('data-sources'),
    },
    {
      to: `${infoSlug}/${t('slugs.about-ai')}`,
      label: t('about-ai'),
    },
    {
      to: `${infoSlug}/${t('slugs.accessibility-statement')}`,
      label: t('accessibility-statement'),
    },
  ];

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
              className="flex flex-col sm:flex-row sm:gap-3 justify-center items-center select-none cursor-pointer"
            >
              <JodMenu className="mx-auto" />
              <span className="md:pr-3 sm:text-button-sm text-[12px]">{t('menu')}</span>
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
          showServiceBar
          serviceBarVariant="yksilo"
          serviceBarTitle={t('my-competence-path')}
        />
        {error && <ErrorNote error={error} onCloseClick={clearErrorNote} />}
      </header>

      <LogoutFormContext.Provider value={logoutForm.current}>
        <NavMenu open={navMenuOpen} onClose={() => setNavMenuOpen(false)} />
        <ServiceVariantProvider value="yksilo">
          <Outlet />
        </ServiceVariantProvider>
      </LogoutFormContext.Provider>

      <Footer
        language={language}
        okmLabel={t('footer.logos.okm-label')}
        temLabel={t('footer.logos.tem-label')}
        ophLabel={t('footer.logos.oph-label')}
        kehaLabel={t('footer.logos.keha-label')}
        cooperationTitle={t('footer.cooperation-title')}
        fundingTitle={t('footer.funding-title')}
        moreInfoTitle={t('footer.more-info-title')}
        moreInfoDescription={t('footer.more-info-description')}
        moreInfoLinks={moreInfoLinks}
        MoreInfoLinkComponent={NavLink}
        feedbackTitle={t('footer.feedback-title')}
        feedbackContent={t('footer.feedback-content')}
        feedbackButtonLabel={t('footer.feedback-button-label')}
        feedbackBgImageClassName="bg-[url(@/../assets/home-1.avif)] bg-cover bg-[length:auto_auto] sm:bg-[length:auto_1000px] bg-[top_-0rem_right_-0rem] sm:bg-[top_-21rem_right_0rem]"
        copyright={t('copyright')}
        // eslint-disable-next-line no-console
        feedbackOnClick={() => console.log('feedbackOnClick')}
      />
      <Toaster />
      <ScrollRestoration />
      <Chatbot
        agent={agents[language as keyof typeof agents]}
        language={language}
        agentIcon={`${import.meta.env.BASE_URL}chatbot-icon.svg`}
        header={t('chatbot.header')}
        openWindowText={t('chatbot.open-window-text')}
        agentName={t('chatbot.agent-name')}
        errorMessage={t('chatbot.error-message')}
        greeting={t('chatbot.greeting')}
        textInputPlaceholder={t('chatbot.text-input-placeholder')}
        textInputHelper={t('chatbot.text-input-helper')}
        eraseChatHistory={t('chatbot.erase-chat-history')}
        saveChatAsCsv={t('chatbot.save-chat-as-csv')}
        close={t('chatbot.close')}
      />
      {siteId && (
        <MatomoTracker trackerUrl="https://analytiikka.opintopolku.fi" siteId={siteId} pathname={location.pathname} />
      )}
    </div>
  );
};

export default Root;
