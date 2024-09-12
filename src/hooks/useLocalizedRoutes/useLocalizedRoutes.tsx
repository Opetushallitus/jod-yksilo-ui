import { supportedLanguageCodes, type LangCode } from '@/i18n/config';
import { AuthGuard } from '@/routes/AuthGuard';
import {
  AccessibilityStatement,
  BasicInformation,
  CookiePolicy,
  DataSources,
  PrivacyPolicy,
  TermsOfService,
} from '@/routes/BasicInformation';
import { Home } from '@/routes/Home';
import {
  JobOpportunity,
  Competences as JobOpportunityCompetences,
  Overview,
  loader as jobOpportunityLoader,
} from '@/routes/JobOpportunity';
import { Favorites, Preferences, Profile, SomethingElse } from '@/routes/Profile';
import { Competences, competencesLoader } from '@/routes/Profile/Competences';
import { EducationHistory, loader as educationHistoryLoader } from '@/routes/Profile/EducationHistory';
import { FreeTimeActivities, loader as freeTimeActivitiesLoader } from '@/routes/Profile/FreeTimeActivities';
import { WorkHistory, loader as workHistoryLoader } from '@/routes/Profile/WorkHistory';
import { ErrorElement, NoMatch, Root, loader as rootLoader } from '@/routes/Root';
import {
  Goals,
  Instructions,
  Interests,
  Restrictions,
  Tool,
  Competences as ToolCompetences,
  toolLoader,
} from '@/routes/Tool';
import {
  HowDoIGiveFeedback,
  HowDoIUseTheService,
  UserGuide,
  WhatIsTheService,
  WhereCanIGetMoreHelp,
  WhoIsTheServiceFor,
  WhoProvidesTheService,
} from '@/routes/UserGuide';
import { getLocalizedRoutesMap } from '@/utils';
import { useTranslation } from 'react-i18next';
import { RouteObject, createBrowserRouter, generatePath, matchRoutes, redirect } from 'react-router-dom';

const useLocalizedRoutes = () => {
  const { i18n } = useTranslation();

  const localizedRoutes = supportedLanguageCodes.map((lng) => ({
    lang: lng,
    routes: [
      {
        id: lng,
        path: `/:lng`,
        loader: rootLoader,
        element: <Root />,
        errorElement: <ErrorElement />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            id: `job-opportunity-${lng}`,
            path: `${i18n.t('slugs.job-opportunity.index', { lng })}/:id`,
            element: <JobOpportunity />,
            loader: jobOpportunityLoader,
            children: [
              {
                index: true,
                loader: () => redirect(i18n.t('slugs.job-opportunity.overview', { lng })),
              },
              {
                path: i18n.t('slugs.job-opportunity.overview', { lng }),
                element: <Overview />,
              },
              {
                path: i18n.t('slugs.job-opportunity.competences', { lng }),
                element: <JobOpportunityCompetences />,
              },
            ],
          },
          {
            path: i18n.t('slugs.tool.index', { lng }),
            element: <Tool />,
            loader: toolLoader,
            children: [
              {
                index: true,
                loader: () => redirect(i18n.t('slugs.tool.instructions', { lng })),
              },
              {
                path: i18n.t('slugs.tool.instructions', { lng }),
                element: <Instructions />,
              },
              {
                path: i18n.t('slugs.tool.goals', { lng }),
                element: <Goals />,
              },
              {
                path: i18n.t('slugs.tool.competences', { lng }),
                element: <ToolCompetences />,
              },
              {
                path: i18n.t('slugs.tool.interests', { lng }),
                element: <Interests />,
              },
              {
                path: i18n.t('slugs.tool.restrictions', { lng }),
                element: <Restrictions />,
              },
            ],
          },
          {
            path: i18n.t('slugs.profile.index', { lng }),
            element: (
              <AuthGuard>
                <Profile />
              </AuthGuard>
            ),
            children: [
              {
                index: true,
                loader: () => redirect(i18n.t('slugs.profile.preferences', { lng })),
              },
              {
                path: i18n.t('slugs.profile.preferences', { lng }),
                element: <Preferences />,
              },
              {
                path: i18n.t('slugs.profile.favorites', { lng }),
                element: <Favorites />,
              },
              {
                path: i18n.t('slugs.profile.competences', { lng }),
                loader: competencesLoader,
                element: <Competences />,
              },
              {
                path: i18n.t('slugs.profile.work-history', { lng }),
                loader: workHistoryLoader,
                element: <WorkHistory />,
              },
              {
                path: i18n.t('slugs.profile.education-history', { lng }),
                loader: educationHistoryLoader,
                element: <EducationHistory />,
              },
              {
                path: i18n.t('slugs.profile.free-time-activities', { lng }),
                loader: freeTimeActivitiesLoader,
                element: <FreeTimeActivities />,
              },
              {
                path: i18n.t('slugs.profile.something-else', { lng }),
                element: <SomethingElse />,
              },
            ],
          },
          {
            path: i18n.t('slugs.user-guide.index', { lng }),
            element: <UserGuide />,
            children: [
              {
                index: true,
                loader: () => redirect(i18n.t('slugs.user-guide.what-is-the-service', { lng })),
              },
              {
                path: i18n.t('slugs.user-guide.what-is-the-service', { lng }),
                element: <WhatIsTheService />,
              },
              {
                path: i18n.t('slugs.user-guide.who-is-the-service-for', { lng }),
                element: <WhoIsTheServiceFor />,
              },
              {
                path: i18n.t('slugs.user-guide.how-do-i-use-the-service', { lng }),
                element: <HowDoIUseTheService />,
              },
              {
                path: i18n.t('slugs.user-guide.where-can-i-get-more-help', { lng }),
                element: <WhereCanIGetMoreHelp />,
              },
              {
                path: i18n.t('slugs.user-guide.who-provides-the-service', { lng }),
                element: <WhoProvidesTheService />,
              },
              {
                path: i18n.t('slugs.user-guide.how-do-i-give-feedback', { lng }),
                element: <HowDoIGiveFeedback />,
              },
            ],
          },
          {
            path: i18n.t('slugs.basic-information', { lng }),
            element: <BasicInformation />,
            children: [
              {
                index: true,
                loader: () => redirect(i18n.t('slugs.cookie-policy', { lng })),
              },
              {
                path: i18n.t('slugs.cookie-policy', { lng }),
                element: <CookiePolicy />,
              },
              {
                path: i18n.t('slugs.data-sources', { lng }),
                element: <DataSources />,
              },
              {
                path: i18n.t('slugs.terms-of-service', { lng }),
                element: <TermsOfService />,
              },
              {
                path: i18n.t('slugs.accessibility-statement', { lng }),
                element: <AccessibilityStatement />,
              },
              {
                path: i18n.t('slugs.privacy-policy', { lng }),
                element: <PrivacyPolicy />,
              },
            ],
          },
        ],
      },
    ],
  }));

  /**
   * Mapper function to get path and index. Indices are used to look up the correct path in the new language.
   * @param routeObject The route object
   * @param index Index of array map iterator
   * @returns Object with path and index
   */
  const mapRouteToPathAndIndex = ({ path }: RouteObject, index: number) => ({
    path,
    index,
  });

  /**
   * Resolves the current path to the new language path.
   * It works like so:
   * 1. Create flat lists of routes with the full path. The lists are in a map like: {fi: <flat list of routes in finnish>, en...}
   * 2. Convert the lists for the current and new language into a list of paths and indices.
   * 3. Since the paths are in the same order in both lists, the new path can be found by the index of the old path.
   * @param lang The new language to change to
   * @returns The pathname for the new language
   */
  const resolveLocalizedUrl = (lang: LangCode) => {
    const currentPath = window.location.pathname;
    const oldLang = i18n.language as LangCode;
    const languageRouteMap = getLocalizedRoutesMap(localizedRoutes);
    const oldLangRoutes = languageRouteMap.get(oldLang);

    if (oldLangRoutes) {
      // Find the current route in the old language. We need it for the path and it's params.
      const matches = matchRoutes(oldLangRoutes, currentPath);

      if (matches?.[0]) {
        // If current path is found, map the old language routes into a list of paths and indices.
        const match = matches[0];
        const oldPath = match.route.path ?? currentPath;
        const oldLangIndexList = oldLangRoutes.map(mapRouteToPathAndIndex);
        const indexOfOldPath = oldLangIndexList.findIndex((o) => o.path === oldPath);

        if (indexOfOldPath > -1) {
          // Once we know the index of the current path, we can find the new path in the new language.
          const newLangIndexList = languageRouteMap.get(lang)?.map(mapRouteToPathAndIndex) ?? [];
          const resolvedPath = newLangIndexList.find((v) => v.index === indexOfOldPath)?.path;
          const newPath = resolvedPath ?? oldPath;
          return generatePath(newPath, { ...match.params, lng: lang });
        }
      }
    }

    // return current path if route was not found
    return currentPath;
  };

  // For the case where the user navigates to the root path without language part
  const rootRoute = {
    path: '/',
    loader: () => redirect(`/${i18n.language}`),
  };

  const unexpectedRoute = { path: '*', element: <NoMatch /> };
  const langRoutes: RouteObject[] = localizedRoutes.flatMap((r) => r.routes);
  const router = createBrowserRouter([...langRoutes, rootRoute, unexpectedRoute]);

  return { router, resolveLocalizedUrl };
};

export default useLocalizedRoutes;
