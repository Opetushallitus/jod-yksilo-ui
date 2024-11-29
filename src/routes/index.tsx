import i18n, { supportedLanguageCodes } from '@/i18n/config';
import {
  EducationOpportunity,
  Competences as EducationOpportunityCompetences,
  Overview as EducationOpportunityOverview,
  educationOpportunityLoader,
} from '@/routes/EducationOpportunity';
import { JobOpportunity, loader as jobOpportunityLoader } from '@/routes/JobOpportunity';
import { Competences as ProfileCompetences, competencesLoader } from '@/routes/Profile/Competences';
import { loader as educationHistoryLoader } from '@/routes/Profile/EducationHistory';
import { favoritesLoader } from '@/routes/Profile/Favorites';
import { loader as freeTimeActivitiesLoader } from '@/routes/Profile/FreeTimeActivities';
import { Interests as ProfileInterests, interestsLoader } from '@/routes/Profile/Interests';
import { muuOsaaminenLoader } from '@/routes/Profile/SomethingElse';
import { WorkHistory, loader as workHistoryLoader } from '@/routes/Profile/WorkHistory';
import {
  Goals,
  Restrictions,
  Tool,
  Competences as ToolCompetences,
  Interests as ToolInterests,
  toolLoader,
} from '@/routes/Tool';
import { RouteObject, redirect } from 'react-router-dom';
import { withYksiloContext } from '../auth';
import {
  AccessibilityStatement,
  BasicInformation,
  CookiePolicy,
  DataSources,
  PrivacyPolicy,
  TermsOfService,
} from './BasicInformation';
import { Home } from './Home';
import { Favorites, Preferences, Profile, SomethingElse } from './Profile';
import { EducationHistory } from './Profile/EducationHistory';
import { FreeTimeActivities } from './Profile/FreeTimeActivities';
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
      children: [
        {
          index: true,
          loader: () => redirect(i18n.t('slugs.profile.preferences', { lng })),
        },
        {
          id: `{slugs.profile.preferences}|${lng}`,
          path: i18n.t('slugs.profile.preferences', { lng }),
          element: <Preferences />,
        },
        {
          id: `{slugs.profile.favorites}|${lng}`,
          path: i18n.t('slugs.profile.favorites', { lng }),
          element: <Favorites />,
          loader: withYksiloContext(favoritesLoader),
        },
        {
          id: `{${competencesSlug}}/{slugs.profile.competences}|${lng}`,
          path: i18n.t(competencesSlug, { lng }),
          loader: withYksiloContext(competencesLoader),
          element: <ProfileCompetences />,
        },
        {
          id: `{${competencesSlug}}/{slugs.profile.work-history}|${lng}`,
          path: `${i18n.t(competencesSlug, { lng })}/${i18n.t('slugs.profile.work-history', { lng })}`,
          loader: withYksiloContext(workHistoryLoader),
          element: <WorkHistory />,
        },
        {
          id: `{${competencesSlug}}/{slugs.profile.education-history}|${lng}`,
          path: `${i18n.t(competencesSlug, { lng })}/${i18n.t('slugs.profile.education-history', { lng })}`,
          loader: withYksiloContext(educationHistoryLoader),
          element: <EducationHistory />,
        },
        {
          id: `{${competencesSlug}}/{slugs.profile.free-time-activities}|${lng}`,
          path: `${i18n.t(competencesSlug, { lng })}/${i18n.t('slugs.profile.free-time-activities', { lng })}`,
          loader: withYksiloContext(freeTimeActivitiesLoader),
          element: <FreeTimeActivities />,
        },
        {
          id: `{${competencesSlug}}/{slugs.profile.something-else}|${lng}`,
          path: `${i18n.t(competencesSlug, { lng })}/${i18n.t('slugs.profile.something-else', { lng })}`,
          element: <SomethingElse />,
          loader: withYksiloContext(muuOsaaminenLoader),
        },
        {
          id: `{slugs.profile.interests}|${lng}`,
          path: i18n.t('slugs.profile.interests', { lng }),
          loader: withYksiloContext(interestsLoader),
          element: <ProfileInterests />,
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
          loader: () => redirect(i18n.t('slugs.tool.goals', { lng })),
        },
        {
          id: `{slugs.tool.goals}|${lng}`,
          path: i18n.t('slugs.tool.goals', { lng }),
          element: <Goals />,
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
        {
          id: `{slugs.tool.restrictions}|${lng}`,
          path: i18n.t('slugs.tool.restrictions', { lng }),
          element: <Restrictions />,
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
    }) as RouteObject,
);

const educationOpportunityRoutes = supportedLanguageCodes.map(
  (lng) =>
    ({
      id: `{slugs.education-opportunity.index}/:id|${lng}`,
      path: `${i18n.t('slugs.education-opportunity.index', { lng })}/:id`,
      element: <EducationOpportunity />,
      loader: educationOpportunityLoader,
      children: [
        {
          index: true,
          loader: () => redirect(i18n.t('slugs.education-opportunity.overview', { lng })),
        },
        {
          id: `{slugs.education-opportunity.overview}|${lng}`,
          path: i18n.t('slugs.education-opportunity.overview', { lng }),
          element: <EducationOpportunityOverview />,
        },
        {
          id: `{slugs.education-opportunity.competences}|${lng}`,
          path: i18n.t('slugs.education-opportunity.competences', { lng }),
          element: <EducationOpportunityCompetences />,
        },
      ],
    }) as RouteObject,
);

const userGuideRoutes: RouteObject[] = supportedLanguageCodes.map((lng) => ({
  id: `{slugs.user-guide.index}|${lng}`,
  path: i18n.t('slugs.user-guide.index', { lng }),
  element: <UserGuide />,
  children: [
    {
      index: true,
      loader: () => redirect(i18n.t('slugs.user-guide.what-is-the-service', { lng })),
    },
    {
      id: `{slugs.user-guide.what-is-the-service}|${lng}`,
      path: i18n.t('slugs.user-guide.what-is-the-service', { lng }),
      element: <WhatIsTheService />,
    },
    {
      id: `{slugs.user-guide.who-is-the-service-for}|${lng}`,
      path: i18n.t('slugs.user-guide.who-is-the-service-for', { lng }),
      element: <WhoIsTheServiceFor />,
    },
    {
      id: `{slugs.user-guide.how-do-i-use-the-service}|${lng}`,
      path: i18n.t('slugs.user-guide.how-do-i-use-the-service', { lng }),
      element: <HowDoIUseTheService />,
    },
    {
      id: `{slugs.user-guide.where-can-i-get-more-help}|${lng}`,
      path: i18n.t('slugs.user-guide.where-can-i-get-more-help', { lng }),
      element: <WhereCanIGetMoreHelp />,
    },
    {
      id: `{slugs.user-guide.who-provides-the-service}|${lng}`,
      path: i18n.t('slugs.user-guide.who-provides-the-service', { lng }),
      element: <WhoProvidesTheService />,
    },
    {
      id: `{slugs.user-guide.how-do-i-give-feedback}|${lng}`,
      path: i18n.t('slugs.user-guide.how-do-i-give-feedback', { lng }),
      element: <HowDoIGiveFeedback />,
    },
  ],
}));

const basicInformationRoutes: RouteObject[] = supportedLanguageCodes.map((lng) => ({
  id: `{slugs.basic-information}|${lng}`,
  path: i18n.t('slugs.basic-information', { lng }),
  element: <BasicInformation />,
  children: [
    {
      index: true,
      loader: () => redirect(i18n.t('slugs.cookie-policy', { lng })),
    },
    {
      id: `{slugs.cookie-policy}|${lng}`,
      path: i18n.t('slugs.cookie-policy', { lng }),
      element: <CookiePolicy />,
    },
    {
      id: `{slugs.data-sources}|${lng}`,
      path: i18n.t('slugs.data-sources', { lng }),
      element: <DataSources />,
    },
    {
      id: `{slugs.terms-of-service}|${lng}`,
      path: i18n.t('slugs.terms-of-service', { lng }),
      element: <TermsOfService />,
    },
    {
      id: `{slugs.accessibility-statement}|${lng}`,
      path: i18n.t('slugs.accessibility-statement', { lng }),
      element: <AccessibilityStatement />,
    },
    {
      id: `{slugs.privacy-policy}|${lng}`,
      path: i18n.t('slugs.privacy-policy', { lng }),
      element: <PrivacyPolicy />,
    },
  ],
}));

const rootRoute: RouteObject = {
  id: 'root',
  path: '/:lng',
  loader: withYksiloContext(rootLoader, false),
  element: <Root />,
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
  ],
};

export const routes: RouteObject[] = [
  {
    path: '/',
    loader: () => redirect(`/${i18n.language}`),
  },
  rootRoute,
  { path: '*', element: <NoMatch /> },
];
