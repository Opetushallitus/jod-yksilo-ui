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
import { muuOsaaminenLoader } from '@/routes/Profile/SomethingElse';
import { WorkHistory, loader as workHistoryLoader } from '@/routes/Profile/WorkHistory';
import { Tool, toolLoader } from '@/routes/Tool';
import { isFeatureEnabled } from '@/utils/features';
import { NoteStackProvider } from '@jod/design-system';
import { type RouteObject, replace } from 'react-router';
import { withYksiloContext } from '../auth';
import { Cv, cvLoader } from './Cv';
import { Home } from './Home';
import { Favorites, LandingPage, Preferences, Profile, SomethingElse } from './Profile';
import { EducationHistory } from './Profile/EducationHistory';
import { FreeTimeActivities } from './Profile/FreeTimeActivities';
import { profilePreferencesLoader } from './Profile/Preferences';
import ProfileFront from './Profile/ProfileFront/ProfileFront';
import { ErrorBoundary, NoMatch, Root, loader as rootLoader } from './Root';
import { ServiceBreak } from './ServiceBreak/ServiceBreak';

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
          loader: withYksiloContext(profilePreferencesLoader),
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
          id: `{${competencesSlug}}|${lng}`,
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
      handle: {
        title: i18n.t('tool.title', { lng }),
      },
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

const getCvRoute = (): RouteObject[] =>
  isFeatureEnabled('JAKOLINKKI')
    ? supportedLanguageCodes.map(
        (lng) =>
          ({
            id: `cv/:ulkoinenJakolinkkiId|${lng}`,
            path: 'cv/:ulkoinenJakolinkkiId',
            element: <Cv />,
            loader: cvLoader,
          }) as RouteObject,
      )
    : [];

const getRootRoute = (): RouteObject => ({
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
    ...getCvRoute(),
    ...profileRoutes,
    ...toolRoutes,
    ...jobOpportunityRoutes,
    ...educationOpportunityRoutes,
    ...profileLandingPageRoutes,
    { path: '*', element: <NoMatch /> },
  ],
});

export const serviceBreakRoutes: RouteObject[] = [
  {
    path: '*',
    loader: () => replace(`/service-break`),
  },
  {
    id: `service-break`,
    path: '/service-break',
    element: (
      <NoteStackProvider>
        <ServiceBreak />,
      </NoteStackProvider>
    ),
  },
];

export const getRoutes = (): RouteObject[] => [
  {
    path: '/',
    loader: () => replace(`/${i18n.language}`),
  },
  getRootRoute(),
];
