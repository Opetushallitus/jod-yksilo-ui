import type { components } from '@/api/schema';
import { FeedbackModal, UserButton } from '@/components';
import { NavMenu } from '@/components/NavMenu/NavMenu';
import { Toaster } from '@/components/Toaster/Toaster';
import { useInteractionMethod } from '@/hooks/useInteractionMethod';
import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import { useSessionExpirationTimer } from '@/hooks/useSessionExpirationTimer';
import { type LangCode, langLabels, supportedLanguageCodes } from '@/i18n/config';
import { useNoteStore } from '@/stores/useNoteStore';
import { useToolStore } from '@/stores/useToolStore';
import { getLinkTo } from '@/utils/routeUtils';
import {
  Button,
  Chatbot,
  Footer,
  LanguageButton,
  MatomoTracker,
  NavigationBar,
  NoteStack,
  ServiceVariantProvider,
  SkipLink,
  useNoteStack,
} from '@jod/design-system';
import { JodMenu, JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link,
  Outlet,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router';
import { useShallow } from 'zustand/shallow';
import { LogoutFormContext } from '.';

const agents = {
  test: {
    fi: 'dea3919a-4f96-436e-a6bd-b24e4218da9f',
    sv: 'fdc65221-a280-48b3-9dbc-9dea053a9cb4',
    en: 'e78e5079-e789-4706-b0a2-e665eb87e7dd',
  },
  prod: {
    fi: '2c134474-326f-4456-9139-8e585a569a9a',
    sv: 'd41ea75b-628f-4420-9e4a-7431ffabb047',
    en: '37f50124-4dec-4cab-8bc6-f8d2ea5bfe21',
  },
};

const Root = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const fetcher = useFetcher();
  const resetToolStore = useToolStore((state) => state.reset);
  const { note, clearNote } = useNoteStore(useShallow((state) => ({ note: state.note, clearNote: state.clearNote })));
  const isMouseInteraction = useInteractionMethod();
  const location = useLocation();
  const navigate = useNavigate();
  const { addNote, removeNote } = useNoteStack();
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const [navMenuOpen, setNavMenuOpen] = React.useState(false);
  const [feedbackVisible, setFeedbackVisible] = React.useState(false);
  const logoutForm = React.useRef<HTMLFormElement>(null);
  const langMenuButtonRef = React.useRef<HTMLLIElement>(null);
  const langMenuRef = useMenuClickHandler(() => setLangMenuOpen(false), langMenuButtonRef);
  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;
  const hostname = window.location.hostname;
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const { siteId, agent } = React.useMemo(() => {
    if (hostname === 'osaamispolku.fi') {
      return { siteId: 36, agent: agents.prod[language as keyof typeof agents.prod] };
    } else if (hostname === 'jodtestaus.fi') {
      return { siteId: 38, agent: agents.test[language as keyof typeof agents.test] };
    } else {
      return { siteId: 37, agent: agents.test[language as keyof typeof agents.test] };
    }
  }, [hostname, language]);

  const { generateLocalizedPath } = useLocalizedRoutes();
  const isLoggedIn = !!data;
  const loginLink = useLoginLink({ callbackURL: location.pathname + location.search + location.hash });
  const sessionWarningNoteId = 'session-expiration-warning';
  const sessionExpiredNoteId = 'session-expired';
  const isOnProtectedRoute = useMatch(`/${language}/${t('slugs.profile.index')}/*`);

  const { extend, disable } = useSessionExpirationTimer({
    isLoggedIn: isLoggedIn,
    onExtended: () => {
      setTimeout(() => {
        // Wrapping the removal in timeout makes this more reliable, otherwise the note sometimes doesn't get removed
        removeNote(sessionWarningNoteId);
      }, 50);
    },
    onWarning: () => {
      if (!isLoggedIn) {
        return;
      }
      addNote({
        id: sessionWarningNoteId,
        title: t('session.warning.title'),
        description: t('session.warning.description'),
        variant: 'warning',
        readMoreComponent: (
          <Button
            size="sm"
            variant="white"
            label={t('session.warning.continue')}
            onClick={async () => {
              removeNote(sessionWarningNoteId);
              await extend();
            }}
          />
        ),
      });
    },
    onExpired: async () => {
      if (!isLoggedIn) {
        return;
      }
      removeNote(sessionWarningNoteId);
      // Reload root loader, this should set CSRF data to null
      await fetcher.load(`/${language}`);

      addNote({
        id: sessionExpiredNoteId,
        title: t('session.expired.title'),
        description: t('session.expired.description'),
        variant: 'error',
        permanent: true,
        readMoreComponent: (
          <div className="flex gap-4">
            <Button
              size="sm"
              variant="white"
              label={t('session.expired.login')}
              LinkComponent={getLinkTo(loginLink, {
                useAnchor: true,
                target: '_blank',
              })}
            />
            <Button
              size="sm"
              variant="white"
              label={t('session.expired.continue')}
              onClick={() => {
                disable(); // Disables any future warnings or expirations
                removeNote(sessionExpiredNoteId);
                if (isOnProtectedRoute) {
                  navigate(`/${language}`);
                }
              }}
            />
          </div>
        ),
      });
    },
  });

  const logout = () => {
    resetToolStore();
    logoutForm.current?.submit();
  };

  // Tries to focus the first h1 inside main content or the skip link if no h1 found
  React.useEffect(() => {
    setTimeout(() => {
      const mainElement = document.querySelector('#jod-main');
      const firstHeading = mainElement?.querySelector('h1') || document.querySelector('h1');

      if (firstHeading) {
        firstHeading.setAttribute('tabIndex', '-1');
        firstHeading.focus({ preventScroll: true });
      } else {
        const skipLink = document.querySelector<HTMLAnchorElement>('a[href="#jod-main"]');
        skipLink?.focus();
      }
    });
  }, [location.pathname]);

  React.useEffect(() => {
    if (!note) {
      return;
    }

    addNote({
      title: t(note.title),
      description: t(note.description),
      variant: 'error',
      permanent: note.permanent ?? false,
      id: note.title,
    });
    clearNote();
  }, [addNote, clearNote, note, t]);

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

  const moreInfoLinks = ['about-service', 'privacy-and-cookies', 'data-sources', 'ai-usage', 'accessibility'].map(
    (key) => {
      const slug = t(`slugs.${key}`);
      return {
        href: `/${language}/${slug}`,
        label: t(`footer.more-info-links.${key}`),
      };
    },
  );

  const [visibleBetaFeedback, setVisibleBetaFeedback] = React.useState(true);

  React.useEffect(() => {
    if (visibleBetaFeedback) {
      addNote({
        title: t('beta.note.title'),
        description: t('beta.note.description'),
        variant: 'feedback',
        onCloseClick: () => {
          setVisibleBetaFeedback(false);
          removeNote('beta-feedback');
        },
        readMoreComponent: (
          <Button
            size="sm"
            variant="white"
            label={t('beta.note.to-feedback')}
            icon={<JodOpenInNew />}
            iconSide="right"
            LinkComponent={getLinkTo('https://link.webropolsurveys.com/S/F27EA876E86B2D74', {
              useAnchor: true,
              target: '_blank',
            })}
          />
        ),
        permanent: false,
        id: 'beta-feedback',
      });
    }
  }, [t, addNote, visibleBetaFeedback, removeNote]);

  return (
    <div className="flex flex-col min-h-screen bg-bg-gray" data-testid="app-root">
      <link rel="manifest" href={`/manifest-${language}.json`} crossOrigin="use-credentials" />
      <header role="banner" className="sticky top-0 z-30 print:hidden" data-testid="app-header">
        <SkipLink hash="#jod-main" label={t('skiplinks.main')} />
        <form action="/yksilo/logout" method="POST" hidden ref={logoutForm}>
          <input type="hidden" name="_csrf" value={data?.csrf.token} />
          <input type="hidden" name="lang" value={language} />
        </form>
        <NavigationBar
          logo={{ to: `/${language}`, language, srText: t('osaamispolku') }}
          menuComponent={
            <button
              ref={menuButtonRef}
              onClick={() => setNavMenuOpen(!navMenuOpen)}
              aria-label={t('open-menu')}
              className="flex flex-col md:flex-row gap-2 md:gap-3 justify-center items-center select-none cursor-pointer"
              data-testid="open-nav-menu"
            >
              <JodMenu className="mx-auto" />
              <span className="md:text-[14px] sm:text-[12px] text-[10px]">{t('menu')}</span>
            </button>
          }
          languageButtonComponent={
            <LanguageButton
              dataTestId="language-button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              langMenuOpen={langMenuOpen}
              menuRef={langMenuRef}
              onMenuBlur={handleBlur}
              onMenuClick={() => setLangMenuOpen(false)}
              language={language as LangCode}
              supportedLanguageCodes={supportedLanguageCodes}
              generateLocalizedPath={generateLocalizedPath}
              LinkComponent={Link}
              translations={{
                fi: { change: 'Vaihda kieli.', label: langLabels.fi },
                sv: { change: 'Andra språk.', label: langLabels.sv },
                en: { change: 'Change language.', label: langLabels.en },
              }}
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

        <NoteStack showAllText={t('show-all')} />
      </header>

      <LogoutFormContext.Provider value={logoutForm.current}>
        <NavMenu
          open={navMenuOpen}
          onClose={() => {
            setNavMenuOpen(false);
            // Return focus to menu button when menu is closed for a11y
            setTimeout(() => {
              menuButtonRef.current?.focus();
            }, 1);
          }}
        />
        <ServiceVariantProvider value="yksilo">
          <Outlet />
        </ServiceVariantProvider>
      </LogoutFormContext.Provider>

      <Chatbot
        agent={agent}
        language={language}
        header={t('chatbot.header')}
        openWindowText={t('chatbot.open-window-text')}
        agentName={t('chatbot.agent-name')}
        errorMessage={t('chatbot.error-message')}
        greeting={t('chatbot.greeting')}
        textInputPlaceholder={t('chatbot.text-input-placeholder')}
        disclaimer={t('chatbot.disclaimer')}
        waitingmessage={t('chatbot.waiting-message')}
      />

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
        feedbackTitle={t('footer.feedback-title')}
        feedbackContent={t('footer.feedback-content')}
        feedbackButtonLabel={t('footer.feedback-button-label')}
        feedbackOnClick={() => setFeedbackVisible(true)}
        feedbackBgImageClassName="bg-[url(@/../assets/feedback.jpg)] bg-cover bg-[50%_50%]"
        copyright={t('footer.copyright')}
        dataTestId="footer"
      />
      <FeedbackModal
        isOpen={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        section="Osaamispolkuni"
        area="Alatunniste"
        language={language as LangCode}
      />
      <Toaster />
      <ScrollRestoration />
      <MatomoTracker trackerUrl="https://analytiikka.opintopolku.fi" siteId={siteId} pathname={location.pathname} />
    </div>
  );
};

export default Root;
