import { ModalProvider } from '@/hooks/useModal/ModalProvider';
import i18n, { supportedLanguageCodes } from '@/i18n/config';
import { EducationOpportunity, educationOpportunityLoader } from '@/routes/EducationOpportunity';
import { JobOpportunity, loader as jobOpportunityLoader } from '@/routes/JobOpportunity';
import { Competences as ProfileCompetences, competencesLoader } from '@/routes/Profile/Competences';
import { loader as educationHistoryLoader } from '@/routes/Profile/EducationHistory';
import { favoritesLoader } from '@/routes/Profile/Favorites';
import { loader as freeTimeActivitiesLoader } from '@/routes/Profile/FreeTimeActivities';
import { Interests as ProfileInterests, interestsLoader } from '@/routes/Profile/Interests';
import { MyGoals, goalsLoader } from '@/routes/Profile/MyGoals';
import { Path, newPolkuLoader, polkuLoader } from '@/routes/Profile/Path';
import { muuOsaaminenLoader } from '@/routes/Profile/SomethingElse';
import { WorkHistory, loader as workHistoryLoader } from '@/routes/Profile/WorkHistory';
import { Tool, Competences as ToolCompetences, Interests as ToolInterests, toolLoader } from '@/routes/Tool';
import { NoteStackProvider } from '@jod/design-system';
import { type RouteObject, replace } from 'react-router';
import { withYksiloContext } from '../auth';
import {
  AboutAi,
  AccessibilityStatement,
  BasicInformation,
  CookiePolicy,
  DataSources,
  PrivacyPolicy,
  TermsOfService,
} from './BasicInformation';
import { Home } from './Home';
import { Favorites, LandingPage, Preferences, Profile, SomethingElse } from './Profile';
import { EducationHistory } from './Profile/EducationHistory';
import { FreeTimeActivities } from './Profile/FreeTimeActivities';
import ProfileFront from './Profile/ProfileFront/ProfileFront';
import { ErrorBoundary, NoMatch, Root, loader as rootLoader } from './Root';
import {
  HowDoIGiveFeedback,
  HowDoIUseTheService,
  UserGuide,
  WhatIsTheService,
  WhereCanIGetMoreHelp,
  WhoIsTheServiceFor,
  WhoProvidesTheService,
} from './UserGuide';

const competencesSlug = 'slugs.profile.competences';

const profileRoutes = supportedLanguageCodes.map(
  (lng) =>
    ({
      id: `{slugs.profile.index}|${lng}`,
      path: i18n.t('slugs.profile.index', { lng }),
      element: <Profile />,
      loader: withYksiloContext(() => null),
      handle: {
        title: i18n.t('profile.index', { lng }),
      },
      children: [
        {
          index: true,
          loader: () => replace(i18n.t('slugs.profile.front', { lng })),
        },
        {
          id: `{slugs.profile.front}|${lng}`,
          path: i18n.t('slugs.profile.front', { lng }),
          element: <ProfileFront />,
        },
        {
          id: `{slugs.profile.preferences}|${lng}`,
          path: i18n.t('slugs.profile.preferences', { lng }),
          element: <Preferences />,
          handle: {
            title: i18n.t('profile.preferences.title', { lng }),
          },
        },
        {
          id: `{slugs.profile.favorites}|${lng}`,
          path: i18n.t('slugs.profile.favorites', { lng }),
          element: <Favorites />,
          loader: withYksiloContext(favoritesLoader),
          handle: {
            title: i18n.t('profile.favorites.title', { lng }),
          },
        },
        {
          id: `{${competencesSlug}}/{slugs.profile.competences}|${lng}`,
          path: i18n.t(competencesSlug, { lng }),
          loader: withYksiloContext(competencesLoader),
          element: <ProfileCompetences />,
          handle: {
            title: i18n.t('profile.competences.title', { lng }),
          },
        },
        {
          id: `{${competencesSlug}}/{slugs.profile.work-history}|${lng}`,
          path: `${i18n.t(competencesSlug, { lng })}/${i18n.t('slugs.profile.work-history', { lng })}`,
          loader: withYksiloContext(workHistoryLoader),
          element: <WorkHistory />,
          handle: {
            title: i18n.t('profile.work-history.title', { lng }),
          },
        },
        {
          id: `{${competencesSlug}}/{slugs.profile.education-history}|${lng}`,
          path: `${i18n.t(competencesSlug, { lng })}/${i18n.t('slugs.profile.education-history', { lng })}`,
          loader: withYksiloContext(educationHistoryLoader),
          element: <EducationHistory />,
          handle: {
            title: i18n.t('profile.education-history.title', { lng }),
          },
        },
        {
          id: `{${competencesSlug}}/{slugs.profile.free-time-activities}|${lng}`,
          path: `${i18n.t(competencesSlug, { lng })}/${i18n.t('slugs.profile.free-time-activities', { lng })}`,
          loader: withYksiloContext(freeTimeActivitiesLoader),
          element: <FreeTimeActivities />,
          handle: {
            title: i18n.t('profile.free-time-activities.title', { lng }),
          },
        },
        {
          id: `{${competencesSlug}}/{slugs.profile.something-else}|${lng}`,
          path: `${i18n.t(competencesSlug, { lng })}/${i18n.t('slugs.profile.something-else', { lng })}`,
          element: <SomethingElse />,
          loader: withYksiloContext(muuOsaaminenLoader),
          handle: {
            title: i18n.t('profile.something-else.title', { lng }),
          },
        },
        {
          id: `{slugs.profile.my-goals}|${lng}`,
          path: i18n.t('slugs.profile.my-goals', { lng }),
          handle: {
            title: i18n.t('profile.my-goals.title', { lng }),
          },

          children: [
            {
              index: true,
              element: <MyGoals />,
              loader: withYksiloContext(goalsLoader),
            },
            {
              id: `:paamaaraId/{slugs.profile.path}|${lng}`,
              path: `:paamaaraId/${i18n.t('slugs.profile.path', { lng })}`,
              loader: withYksiloContext(newPolkuLoader),
            },
            {
              id: `:paamaaraId/{slugs.profile.path}/:suunnitelmaId|${lng}`,
              path: `:paamaaraId/${i18n.t('slugs.profile.path', { lng })}/:suunnitelmaId`,
              element: <Path />,
              loader: withYksiloContext(polkuLoader),
            },
          ],
        },
        {
          id: `{slugs.profile.interests}|${lng}`,
          path: i18n.t('slugs.profile.interests', { lng }),
          loader: withYksiloContext(interestsLoader),
          element: <ProfileInterests />,
          handle: {
            title: i18n.t('profile.interests.title', { lng }),
          },
        },
      ],
    }) as RouteObject,
);

const toolRoutes = supportedLanguageCodes.map(
  (lng) =>
    ({
      id: `{slugs.tool.index}|${lng}`,
      path: i18n.t('slugs.tool.index', { lng }),
      element: <Tool />,
      loader: withYksiloContext(toolLoader, false),
      children: [
        {
          index: true,
          loader: () => replace(i18n.t('slugs.tool.competences', { lng })),
        },
        {
          id: `{slugs.tool.competences}|${lng}`,
          path: i18n.t('slugs.tool.competences', { lng }),
          element: <ToolCompetences />,
          loader: withYksiloContext(competencesLoader, false),
        },
        {
          id: `{slugs.tool.interests}|${lng}`,
          path: i18n.t('slugs.tool.interests', { lng }),
          element: <ToolInterests />,
        },
      ],
    }) as RouteObject,
);

const jobOpportunityRoutes = supportedLanguageCodes.map(
  (lng) =>
    ({
      id: `{slugs.job-opportunity.index}/:id|${lng}`,
      path: `${i18n.t('slugs.job-opportunity.index', { lng })}/:id`,
      element: <JobOpportunity />,
      loader: withYksiloContext(jobOpportunityLoader, false),
      handle: {
        type: 'jobOpportunity',
      },
    }) as RouteObject,
);

const profileLandingPageRoutes = supportedLanguageCodes.map(
  (lng) =>
    ({
      id: `{slugs.profile.login}|${lng}`,
      path: i18n.t('slugs.profile.login', { lng }),
      element: <LandingPage />,
      handle: {
        title: i18n.t('login-to-service', { lng }),
      },
    }) as RouteObject,
);

const educationOpportunityRoutes = supportedLanguageCodes.map(
  (lng) =>
    ({
      id: `{slugs.education-opportunity.index}/:id|${lng}`,
      path: `${i18n.t('slugs.education-opportunity.index', { lng })}/:id`,
      element: <EducationOpportunity />,
      loader: withYksiloContext(educationOpportunityLoader, false),
      handle: {
        type: 'educationOpportunity',
      },
    }) as RouteObject,
);

const userGuideRoutes: RouteObject[] = supportedLanguageCodes.map((lng) => ({
  id: `{slugs.user-guide.index}|${lng}`,
  path: i18n.t('slugs.user-guide.index', { lng }),
  element: <UserGuide />,
  handle: {
    title: i18n.t('user-guide', { lng }),
  },
  children: [
    {
      index: true,
      loader: () => replace(i18n.t('slugs.user-guide.what-is-the-service', { lng })),
    },
    {
      id: `{slugs.user-guide.what-is-the-service}|${lng}`,
      path: i18n.t('slugs.user-guide.what-is-the-service', { lng }),
      element: <WhatIsTheService />,
      handle: {
        title: i18n.t('what-is-the-service', { lng }),
      },
    },
    {
      id: `{slugs.user-guide.who-is-the-service-for}|${lng}`,
      path: i18n.t('slugs.user-guide.who-is-the-service-for', { lng }),
      element: <WhoIsTheServiceFor />,
      handle: {
        title: i18n.t('who-is-the-service-for', { lng }),
      },
    },
    {
      id: `{slugs.user-guide.how-do-i-use-the-service}|${lng}`,
      path: i18n.t('slugs.user-guide.how-do-i-use-the-service', { lng }),
      element: <HowDoIUseTheService />,
      handle: {
        title: i18n.t('how-do-i-use-the-service', { lng }),
      },
    },
    {
      id: `{slugs.user-guide.where-can-i-get-more-help}|${lng}`,
      path: i18n.t('slugs.user-guide.where-can-i-get-more-help', { lng }),
      element: <WhereCanIGetMoreHelp />,
      handle: {
        title: i18n.t('where-can-i-get-more-help', { lng }),
      },
    },
    {
      id: `{slugs.user-guide.who-provides-the-service}|${lng}`,
      path: i18n.t('slugs.user-guide.who-provides-the-service', { lng }),
      element: <WhoProvidesTheService />,
      handle: {
        title: i18n.t('who-provides-the-service', { lng }),
      },
    },
    {
      id: `{slugs.user-guide.how-do-i-give-feedback}|${lng}`,
      path: i18n.t('slugs.user-guide.how-do-i-give-feedback', { lng }),
      element: <HowDoIGiveFeedback />,
      handle: {
        title: i18n.t('how-do-i-give-feedback', { lng }),
      },
    },
  ],
}));

const basicInformationRoutes: RouteObject[] = supportedLanguageCodes.map((lng) => ({
  id: `{slugs.basic-information}|${lng}`,
  path: i18n.t('slugs.basic-information', { lng }),
  element: <BasicInformation />,
  handle: {
    title: i18n.t('basic-information', { lng }),
  },
  children: [
    {
      index: true,
      loader: () => replace(i18n.t('slugs.cookie-policy', { lng })),
    },
    {
      id: `{slugs.cookie-policy}|${lng}`,
      path: i18n.t('slugs.cookie-policy', { lng }),
      element: <CookiePolicy />,
      handle: {
        title: i18n.t('cookie-policy', { lng }),
      },
    },
    {
      id: `{slugs.data-sources}|${lng}`,
      path: i18n.t('slugs.data-sources', { lng }),
      element: <DataSources />,
      handle: {
        title: i18n.t('data-sources', { lng }),
      },
    },
    {
      id: `{slugs.terms-of-service}|${lng}`,
      path: i18n.t('slugs.terms-of-service', { lng }),
      element: <TermsOfService />,
      handle: {
        title: i18n.t('terms-of-service', { lng }),
      },
    },
    {
      id: `{slugs.accessibility-statement}|${lng}`,
      path: i18n.t('slugs.accessibility-statement', { lng }),
      element: <AccessibilityStatement />,
      handle: {
        title: i18n.t('accessibility-statement', { lng }),
      },
    },
    {
      id: `{slugs.privacy-policy}|${lng}`,
      path: i18n.t('slugs.privacy-policy', { lng }),
      element: <PrivacyPolicy />,
      handle: {
        title: i18n.t('privacy-policy', { lng }),
      },
    },
    {
      id: `{slugs.about-ai}|${lng}`,
      path: i18n.t('slugs.about-ai', { lng }),
      element: <AboutAi />,
      handle: {
        title: i18n.t('about-ai', { lng }),
      },
    },
  ],
}));

const rootRoute: RouteObject = {
  id: 'root',
  path: '/:lng',
  loader: withYksiloContext(rootLoader, false),
  element: (
    <NoteStackProvider>
      <ModalProvider>
        <Root />
      </ModalProvider>
    </NoteStackProvider>
  ),
  errorElement: <ErrorBoundary />,
  children: [
    {
      index: true,
      element: <Home />,
    },
    ...profileRoutes,
    ...toolRoutes,
    ...jobOpportunityRoutes,
    ...educationOpportunityRoutes,
    ...userGuideRoutes,
    ...basicInformationRoutes,
    ...profileLandingPageRoutes,
  ],
};

export const routes: RouteObject[] = [
  {
    path: '/',
    loader: () => replace(`/${i18n.language}`),
  },
  rootRoute,
  { path: '*', element: <NoMatch /> },
];
