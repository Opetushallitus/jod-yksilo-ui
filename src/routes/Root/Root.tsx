import { FeedbackModal } from '@/components';
import { NavMenu } from '@/components/NavMenu/NavMenu';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { Toaster } from '@/components/Toaster/Toaster';
import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useSessionExpirationTimer } from '@/hooks/useSessionExpirationTimer';
import { langLabels, supportedLanguageCodes, type LangCode } from '@/i18n/config';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useToolStore } from '@/stores/useToolStore';
import { getNotifications } from '@/utils/notifications';
import { getLinkTo } from '@/utils/routeUtils';
import {
  Button,
  Chatbot,
  Footer,
  LanguageButton,
  MatomoTracker,
  MenuButton,
  NavigationBar,
  ServiceVariantProvider,
  SkipLink,
  useMediaQueries,
  useNoteStack,
  UserButton,
} from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link,
  NavLink,
  Outlet,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
  useLocation,
  useMatch,
} from 'react-router';
import { LogoutFormContext } from '.';

const Root = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const fetcher = useFetcher();
  const resetToolStore = useToolStore((state) => state.reset);
  const location = useLocation();
  const { addPermanentNote, removePermanentNote, addTemporaryNote, removeTemporaryNote } = useNoteStack();
  const [navMenuOpen, setNavMenuOpen] = React.useState(false);
  const [feedbackVisible, setFeedbackVisible] = React.useState(false);
  const [searchInputVisible, setSearchInputVisible] = React.useState(false);
  const logoutForm = React.useRef<HTMLFormElement>(null);
  const isCvPage = !!useMatch(`/${language}/cv`);

  const data = useLoaderData();
  const hostname = globalThis.location.hostname;
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const { siteId } = React.useMemo(() => {
    if (hostname === 'osaamispolku.fi') {
      return { siteId: 36 };
    } else if (hostname === 'jodtestaus.fi') {
      return { siteId: 38 };
    } else {
      return { siteId: 37 };
    }
  }, [hostname]);

  const { generateLocalizedPath } = useLocalizedRoutes();
  const isLoggedIn = !!data;
  const loginLink = useLoginLink({ callbackURL: location.pathname + location.search + location.hash });
  const sessionWarningNoteId = 'session-expiration-warning';
  const sessionExpiredNoteId = 'session-expired';
  const isOnProtectedRoute = useMatch(`/${language}/${t('slugs.profile.index')}/*`);
  const { sm } = useMediaQueries();
  const showServiceName = sm || !searchInputVisible;

  const { extend, disable } = useSessionExpirationTimer({
    isLoggedIn: isLoggedIn,
    onExtended: () => {
      setTimeout(() => {
        // Wrapping the removal in timeout makes this more reliable, otherwise the note sometimes doesn't get removed
        removeTemporaryNote(sessionWarningNoteId);
      }, 50);
    },
    onWarning: () => {
      if (!isLoggedIn) {
        return;
      }
      addTemporaryNote(() => ({
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
              removeTemporaryNote(sessionWarningNoteId);
              await extend();
            }}
          />
        ),
        isCollapsed: false,
      }));
    },
    onExpired: async () => {
      if (!isLoggedIn) {
        return;
      }
      removeTemporaryNote(sessionWarningNoteId);
      // Clear stores to avoid stale data
      useToolStore.getState().reset();
      useSuosikitStore.getState().reset();
      // Reload root loader, this should set CSRF data to null
      await fetcher.load(`/${language}`);

      addPermanentNote(() => ({
        id: sessionExpiredNoteId,
        title: t('session.expired.title'),
        description: t('session.expired.description'),
        variant: 'error',
        readMoreComponent: (
          <div className="flex gap-4">
            <Button
              size="sm"
              variant="white"
              label={t('session.expired.login')}
              linkComponent={getLinkTo(loginLink, {
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
                removePermanentNote(sessionExpiredNoteId);
                if (isOnProtectedRoute) {
                  globalThis.location.replace(globalThis.location.origin + `/yksilo/${language}`);
                } else {
                  globalThis.location.reload();
                }
              }}
            />
          </div>
        ),
      }));
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
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const moreInfoLinks = [
    {
      href: `/${language}/${t('common:slugs.about-service')}`,
      label: t('common:footer.more-info-links.about-service'),
    },
    {
      href: `/${language}/${t('common:slugs.privacy-and-cookies')}`,
      label: t('common:footer.more-info-links.privacy-and-cookies'),
    },
    { href: `/${language}/${t('common:slugs.data-sources')}`, label: t('common:footer.more-info-links.data-sources') },
    { href: `/${language}/${t('common:slugs.ai-usage')}`, label: t('common:footer.more-info-links.ai-usage') },
    {
      href: `/${language}/${t('common:slugs.accessibility')}`,
      label: t('common:footer.more-info-links.accessibility'),
    },
  ];

  const userMenuProfileFrontUrl = `${t('slugs.profile.index')}/${t('slugs.profile.front')}`;
  const loginPageUrl = `/${language}/${t('slugs.profile.login')}`;
  const isProfileActive = !!useMatch(`/${language}/${t('slugs.profile.index')}/*`);

  React.useEffect(() => {
    getNotifications().forEach((notification) => {
      addTemporaryNote(() => ({
        id: notification.id,
        title: notification.title[language as LangCode],
        description: notification.description[language as LangCode],
        variant: notification.variant,
        readMoreComponent: notification.link ? (
          <Button
            size="sm"
            variant="white"
            label={notification.link.label[language as LangCode]}
            linkComponent={getLinkTo(notification.link.url[language as LangCode], {
              useAnchor: true,
              target: '_blank',
            })}
          />
        ) : undefined,
        isCollapsed: false,
      }));
    });
  }, [addTemporaryNote, t, language]);

  return (
    <div className="flex flex-col min-h-screen bg-bg-gray" data-testid="app-root">
      <link rel="manifest" href={`/manifest-${language}.json`} crossOrigin="use-credentials" />
      <header role="banner" className="sticky top-0 z-30 print:hidden" data-testid="app-header">
        <SkipLink hash="#jod-main" label={t('common:skiplinks.main')} />
        <form action="/yksilo/logout" method="POST" hidden ref={logoutForm}>
          <input type="hidden" name="_csrf" value={data?.csrf.token} />
          <input type="hidden" name="lang" value={language} />
        </form>
        <NavigationBar
          logo={{ to: `/${language}`, language, srText: t('common:osaamispolku') }}
          menuComponent={
            isCvPage ? null : <MenuButton onClick={() => setNavMenuOpen(!navMenuOpen)} label={t('common:menu')} />
          }
          languageButtonComponent={
            <LanguageButton
              serviceVariant="yksilo"
              testId="language-button"
              language={language as LangCode}
              supportedLanguageCodes={supportedLanguageCodes}
              generateLocalizedPath={generateLocalizedPath}
              linkComponent={Link}
              translations={{
                fi: { change: 'Vaihda kieli.', label: langLabels.fi },
                sv: { change: 'Andra språk.', label: langLabels.sv },
                en: { change: 'Change language.', label: langLabels.en },
              }}
            />
          }
          userButtonComponent={
            isCvPage ? null : (
              <UserButton
                serviceVariant="yksilo"
                firstName={data?.etunimi}
                isProfileActive={isProfileActive}
                profileLabel={t('profile.index')}
                // eslint-disable-next-line react/no-unstable-nested-components
                profileLinkComponent={(props) => <NavLink to={userMenuProfileFrontUrl} {...props} />}
                isLoggedIn={!!data?.csrf}
                loginLabel={t('common:login')}
                // eslint-disable-next-line react/no-unstable-nested-components
                loginLinkComponent={(props) => <NavLink to={loginPageUrl} {...props} />}
                logoutLabel={t('common:logout')}
                onLogout={logout}
              />
            )
          }
          renderLink={({ to, className, children }) => (
            <Link to={to} className={className}>
              {children as React.ReactNode}
            </Link>
          )}
          serviceBarVariant="yksilo"
          serviceBarTitle={showServiceName ? t('my-competence-path') : undefined}
          serviceBarContent={
            <SearchBar searchInputVisible={searchInputVisible} setSearchInputVisible={setSearchInputVisible} />
          }
          translations={{
            showAllNotesLabel: t('common:show-all'),
            ariaLabelCloseNote: t('close'),
          }}
          testId="navigation-bar"
        />
      </header>

      {/* eslint-disable-next-line react-hooks/refs */}
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

      <Chatbot />

      <Footer
        language={language}
        okmLabel={t('common:footer.logos.okm-label')}
        temLabel={t('common:footer.logos.tem-label')}
        ophLabel={t('common:footer.logos.oph-label')}
        kehaLabel={t('common:footer.logos.keha-label')}
        cooperationTitle={t('common:footer.cooperation-title')}
        fundingTitle={t('common:footer.funding-title')}
        moreInfoTitle={t('common:footer.more-info-title')}
        moreInfoDescription={t('common:footer.more-info-description')}
        moreInfoLinks={moreInfoLinks}
        feedbackTitle={t('common:footer.feedback-title')}
        feedbackContent={t('common:footer.feedback-content')}
        feedbackButtonLabel={t('common:footer.feedback-button-label')}
        feedbackOnClick={() => setFeedbackVisible(true)}
        feedbackBgImageClassName="bg-[url(@/../assets/feedback.jpg)] bg-cover bg-[50%_50%]"
        copyright={t('common:footer.copyright')}
        externalLinkIconAriaLabel={t('common:external-link')}
        testId="footer"
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
