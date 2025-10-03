import { components } from '@/api/schema';
import { FeedbackModal } from '@/components';
import { NavMenu } from '@/components/NavMenu/NavMenu';
import { Toaster } from '@/components/Toaster/Toaster';
import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import { LangCode, langLabels, supportedLanguageCodes } from '@/i18n/config';
import { useNoteStore } from '@/stores/useNoteStore';
import { useToolStore } from '@/stores/useToolStore';
import { getLinkTo } from '@/utils/routeUtils';
import {
  Button,
  Chatbot,
  Footer,
  LanguageButton,
  MatomoTracker,
  MenuButton,
  NavigationBar,
  NoteStack,
  ServiceVariantProvider,
  SkipLink,
  useNoteStack,
  UserButton,
} from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet, ScrollRestoration, useLoaderData, useLocation } from 'react-router';
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

const ProfileLink = ({ to, ...props }: { to: string } & React.ComponentProps<typeof NavLink>) => {
  const { t } = useTranslation();
  const userMenuProfileFrontUrl = `${t('slugs.profile.index')}/${t('slugs.profile.front')}`;
  const getActiveClassNames = ({ isActive }: { isActive: boolean }) => (isActive ? 'bg-secondary-1-50 rounded-sm' : '');

  return (
    <NavLink
      to={userMenuProfileFrontUrl}
      {...props}
      className={(props) => `w-full ${getActiveClassNames(props)}`.trim()}
    />
  );
};

const LoginLink = ({ to, ...props }: { to: string } & React.ComponentProps<typeof Link>) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const landingPageUrl = `/${language}/${t('slugs.profile.login')}`;
  return <Link to={landingPageUrl} {...props} />;
};

const Root = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const resetToolStore = useToolStore((state) => state.reset);
  const { note, clearNote } = useNoteStore(useShallow((state) => ({ note: state.note, clearNote: state.clearNote })));
  const location = useLocation();
  const { addNote, removeNote } = useNoteStack();
  const [navMenuOpen, setNavMenuOpen] = React.useState(false);
  const [feedbackVisible, setFeedbackVisible] = React.useState(false);
  const logoutForm = React.useRef<HTMLFormElement>(null);

  const data = useLoaderData() as components['schemas']['YksiloCsrfDto'] | null;
  const hostname = window.location.hostname;
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

  const logout = () => {
    resetToolStore();
    logoutForm.current?.submit();
  };

  React.useEffect(() => {
    if (!note) {
      return;
    }

    addNote({
      title: t(note.title),
      description: t(note.description),
      variant: 'error',
      permanent: note.permanent ?? false,
      // Prevent multiple session-expired notes with fixed id
      id: note.description.includes('session-expired') ? 'session-expired' : undefined,
    });
    clearNote();
  }, [addNote, clearNote, note, t]);

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
            <MenuButton onClick={() => setNavMenuOpen(!navMenuOpen)} ariaLabel={t('open-menu')} label={t('menu')} />
          }
          languageButtonComponent={
            <LanguageButton
              dataTestId="language-button"
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
          userButtonComponent={
            <UserButton
              firstName={data?.etunimi}
              profileLabel={t('profile.index')}
              ProfileLinkComponent={ProfileLink}
              isLoggedIn={!!data?.csrf}
              loginLabel={t('login')}
              LoginLinkComponent={LoginLink}
              logoutLabel={t('logout')}
              onLogout={logout}
            />
          }
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
        <NavMenu open={navMenuOpen} onClose={() => setNavMenuOpen(false)} />
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
