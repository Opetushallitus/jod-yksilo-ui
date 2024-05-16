import './index.css';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Root, ErrorElement, loader as rootLoader, NoMatch } from '@/routes/Root';
import { Home } from '@/routes/Home';
import {
  Tool,
  Instructions,
  Goals,
  Competences as ToolCompetences,
  Interests,
  Restrictions,
  Search,
} from '@/routes/Tool';
import {
  Profile,
  Preferences,
  Favorites,
  Competences,
  EducationHistory,
  FreeTimeActivities,
  SomethingElse,
} from '@/routes/Profile';
import { WorkHistory, loader as workHistoryloader } from '@/routes/Profile/WorkHistory';
import {
  UserGuide,
  WhatIsTheService,
  WhoIsTheServiceFor,
  HowDoIUseTheService,
  WhereCanIGetMoreHelp,
  WhoProvidesTheService,
  HowDoIGiveFeedback,
} from '@/routes/UserGuide';
import {
  BasicInformation,
  CookiePolicy,
  DataSources,
  TermsOfService,
  AccessibilityStatement,
  PrivacyPolicy,
} from '@/routes/BasicInformation';

const App = () => {
  const { t, i18n } = useTranslation();

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
          path: t('slugs.tool.index'),
          element: <Tool />,
          children: [
            {
              index: true,
              loader: () => redirect(t('slugs.tool.instructions')),
            },
            {
              path: t('slugs.tool.instructions'),
              element: <Instructions />,
            },
            {
              path: t('slugs.tool.goals'),
              element: <Goals />,
            },
            {
              path: t('slugs.tool.competences'),
              element: <ToolCompetences />,
            },
            {
              path: t('slugs.tool.interests'),
              element: <Interests />,
            },
            {
              path: t('slugs.tool.restrictions'),
              element: <Restrictions />,
            },
            {
              path: t('slugs.tool.search'),
              element: <Search />,
            },
          ],
        },
        {
          path: t('slugs.profile.index'),
          element: <Profile />,
          children: [
            {
              index: true,
              loader: () => redirect(t('slugs.profile.preferences')),
            },
            {
              path: t('slugs.profile.preferences'),
              element: <Preferences />,
            },
            {
              path: t('slugs.profile.favorites'),
              element: <Favorites />,
            },
            {
              path: t('slugs.profile.competences'),
              element: <Competences />,
            },
            {
              path: t('slugs.profile.work-history'),
              loader: workHistoryloader,
              element: <WorkHistory />,
            },
            {
              path: t('slugs.profile.education-history'),
              element: <EducationHistory />,
            },
            {
              path: t('slugs.profile.free-time-activities'),
              element: <FreeTimeActivities />,
            },
            {
              path: t('slugs.profile.something-else'),
              element: <SomethingElse />,
            },
          ],
        },
        {
          path: t('slugs.user-guide.index'),
          element: <UserGuide />,
          children: [
            {
              index: true,
              loader: () => redirect('mika-palvelu-on'),
            },
            {
              path: t('slugs.user-guide.what-is-the-service'),
              element: <WhatIsTheService />,
            },
            {
              path: t('slugs.user-guide.who-is-the-service-for'),
              element: <WhoIsTheServiceFor />,
            },
            {
              path: t('slugs.user-guide.how-do-i-use-the-service'),
              element: <HowDoIUseTheService />,
            },
            {
              path: t('slugs.user-guide.where-can-i-get-more-help'),
              element: <WhereCanIGetMoreHelp />,
            },
            {
              path: t('slugs.user-guide.who-provides-the-service'),
              element: <WhoProvidesTheService />,
            },
            {
              path: t('slugs.user-guide.how-do-i-give-feedback'),
              element: <HowDoIGiveFeedback />,
            },
          ],
        },
        {
          path: t('slugs.basic-information'),
          element: <BasicInformation />,
          children: [
            {
              index: true,
              loader: () => redirect(t('slugs.cookie-policy')),
            },
            {
              path: t('slugs.cookie-policy'),
              element: <CookiePolicy />,
            },
            {
              path: t('slugs.data-sources'),
              element: <DataSources />,
            },
            {
              path: t('slugs.terms-of-service'),
              element: <TermsOfService />,
            },
            {
              path: t('slugs.accessibility-statement'),
              element: <AccessibilityStatement />,
            },
            {
              path: t('slugs.privacy-policy'),
              element: <PrivacyPolicy />,
            },
          ],
        },
        { path: '*', element: <NoMatch /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
