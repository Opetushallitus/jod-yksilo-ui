import {
  AccessibilityStatement,
  BasicInformation,
  CookiePolicy,
  DataSources,
  PrivacyPolicy,
  TermsOfService,
} from '@/routes/BasicInformation';
import { Home } from '@/routes/Home';
import { Favorites, Preferences, Profile, SomethingElse } from '@/routes/Profile';
import { Competences, competencesLoader } from '@/routes/Profile/Competences';
import { EducationHistory, loader as educationHistoryLoader } from '@/routes/Profile/EducationHistory';
import { FreeTimeActivities, loader as freeTimeActivitiesLoader } from '@/routes/Profile/FreeTimeActivities';
import { WorkHistory, loader as workHistoryLoader } from '@/routes/Profile/WorkHistory';
import { ErrorElement, NoMatch, Root, loader as rootLoader } from '@/routes/Root';
import { Goals, Instructions, Interests, Restrictions, Tool, Competences as ToolCompetences } from '@/routes/Tool';
import {
  HowDoIGiveFeedback,
  HowDoIUseTheService,
  UserGuide,
  WhatIsTheService,
  WhereCanIGetMoreHelp,
  WhoIsTheServiceFor,
  WhoProvidesTheService,
} from '@/routes/UserGuide';
import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
import i18n from './i18n/config';
import './index.css';
import { JobOpportunity, Competences as JobOpportunityCompetences, Overview } from './routes/JobOpportunity';

const router = createBrowserRouter([
  {
    path: '/',
    loader: () => redirect(`/${i18n.language}`),
  },
  {
    path: '/:lng',
    loader: rootLoader,
    element: <Root />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: `${i18n.t('slugs.job-opportunity.index')}/:id`,
        element: <JobOpportunity />,
        children: [
          {
            index: true,
            loader: () => redirect(i18n.t('slugs.job-opportunity.overview')),
          },
          {
            path: i18n.t('slugs.job-opportunity.overview'),
            element: <Overview />,
          },
          {
            path: i18n.t('slugs.job-opportunity.competences'),
            element: <JobOpportunityCompetences />,
          },
        ],
      },
      {
        path: i18n.t('slugs.tool.index'),
        element: <Tool />,
        children: [
          {
            index: true,
            loader: () => redirect(i18n.t('slugs.tool.instructions')),
          },
          {
            path: i18n.t('slugs.tool.instructions'),
            element: <Instructions />,
          },
          {
            path: i18n.t('slugs.tool.goals'),
            element: <Goals />,
          },
          {
            path: i18n.t('slugs.tool.competences'),
            element: <ToolCompetences />,
          },
          {
            path: i18n.t('slugs.tool.interests'),
            element: <Interests />,
          },
          {
            path: i18n.t('slugs.tool.restrictions'),
            element: <Restrictions />,
          },
        ],
      },
      {
        path: i18n.t('slugs.profile.index'),
        element: <Profile />,
        children: [
          {
            index: true,
            loader: () => redirect(i18n.t('slugs.profile.preferences')),
          },
          {
            path: i18n.t('slugs.profile.preferences'),
            element: <Preferences />,
          },
          {
            path: i18n.t('slugs.profile.favorites'),
            element: <Favorites />,
          },
          {
            path: i18n.t('slugs.profile.competences'),
            loader: competencesLoader,
            element: <Competences />,
          },
          {
            path: i18n.t('slugs.profile.work-history'),
            loader: workHistoryLoader,
            element: <WorkHistory />,
          },
          {
            path: i18n.t('slugs.profile.education-history'),
            loader: educationHistoryLoader,
            element: <EducationHistory />,
          },
          {
            path: i18n.t('slugs.profile.free-time-activities'),
            loader: freeTimeActivitiesLoader,
            element: <FreeTimeActivities />,
          },
          {
            path: i18n.t('slugs.profile.something-else'),
            element: <SomethingElse />,
          },
        ],
      },
      {
        path: i18n.t('slugs.user-guide.index'),
        element: <UserGuide />,
        children: [
          {
            index: true,
            loader: () => redirect(i18n.t('slugs.user-guide.what-is-the-service')),
          },
          {
            path: i18n.t('slugs.user-guide.what-is-the-service'),
            element: <WhatIsTheService />,
          },
          {
            path: i18n.t('slugs.user-guide.who-is-the-service-for'),
            element: <WhoIsTheServiceFor />,
          },
          {
            path: i18n.t('slugs.user-guide.how-do-i-use-the-service'),
            element: <HowDoIUseTheService />,
          },
          {
            path: i18n.t('slugs.user-guide.where-can-i-get-more-help'),
            element: <WhereCanIGetMoreHelp />,
          },
          {
            path: i18n.t('slugs.user-guide.who-provides-the-service'),
            element: <WhoProvidesTheService />,
          },
          {
            path: i18n.t('slugs.user-guide.how-do-i-give-feedback'),
            element: <HowDoIGiveFeedback />,
          },
        ],
      },
      {
        path: i18n.t('slugs.basic-information'),
        element: <BasicInformation />,
        children: [
          {
            index: true,
            loader: () => redirect(i18n.t('slugs.cookie-policy')),
          },
          {
            path: i18n.t('slugs.cookie-policy'),
            element: <CookiePolicy />,
          },
          {
            path: i18n.t('slugs.data-sources'),
            element: <DataSources />,
          },
          {
            path: i18n.t('slugs.terms-of-service'),
            element: <TermsOfService />,
          },
          {
            path: i18n.t('slugs.accessibility-statement'),
            element: <AccessibilityStatement />,
          },
          {
            path: i18n.t('slugs.privacy-policy'),
            element: <PrivacyPolicy />,
          },
        ],
      },
      { path: '*', element: <NoMatch /> },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
