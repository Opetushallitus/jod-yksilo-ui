import type { LoaderData as EducationOpportunityData } from '@/routes/EducationOpportunity/loader';
import type { LoaderData as JobOpportunityData } from '@/routes/JobOpportunity/loader';
import { getLocalizedText } from '@/utils';
import { type BreadcrumbItem, Breadcrumb as DSBreadCrumb } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UIMatch, useMatches } from 'react-router';
import { BreadcrumbLink } from '../BreadcrumbLink/BreadcrumbLink';

interface YksiloHandle {
  title?: string;
  type?: string;
}

const useTypedMatches = () => useMatches() as UIMatch<unknown, YksiloHandle>[];

export const Breadcrumb = () => {
  const history = window.history;
  const matches = useTypedMatches();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [items, setItems] = React.useState<BreadcrumbItem[]>([]);

  React.useEffect(() => {
    const opts = { lng: language };

    const validMatches = matches.filter((m) => m.handle?.title || m.id === 'root' || m.handle?.type);
    const crumbs: BreadcrumbItem[] = [
      {
        label: t('front-page', opts),
        to: `/${language}`,
      },
    ];

    const opportunityIndex = validMatches.findIndex(
      (item) => item?.handle?.type && ['jobOpportunity', 'educationOpportunity'].includes(item?.handle?.type),
    );
    const opportunity = opportunityIndex !== -1 ? validMatches[opportunityIndex] : null;

    /**
     * Gets the parent breadcrumbs for the opportunity based on the "from" parameter from state
     * @returns Breadcrumb items array
     */
    const getOpportunityParents = () => {
      const from: 'tool' | 'favorite' | 'path' | 'goal' = history.state?.usr?.from ?? 'tool';
      const profileIndex: BreadcrumbItem = {
        label: t('profile.index', opts),
        to: `/${language}/${t('slugs.profile.index', opts)}`,
      };

      if (from === 'tool') {
        return [{ label: t('tool.title', opts), to: `/${language}/${t('slugs.tool.index', opts)}` }];
      } else if (from === 'favorite') {
        return [
          profileIndex,
          {
            label: t('profile.favorites.title', opts),
            to: `/${language}/${t('slugs.profile.index', opts)}/${t('slugs.profile.favorites', opts)}`,
          },
        ];
      } else if (from === 'goal') {
        return [
          profileIndex,
          {
            label: t('profile.my-goals.title', opts),
            to: `/${language}/${t('slugs.profile.index', opts)}/${t('slugs.profile.my-goals', opts)}`,
          },
        ];
      } else {
        return [];
      }
    };

    // Opportunities need some special handling
    if (opportunity) {
      crumbs.push(...(getOpportunityParents() || []));

      if (opportunity.handle.type === 'jobOpportunity') {
        const loaderData = opportunity.loaderData as JobOpportunityData;
        crumbs.push({
          label: getLocalizedText(loaderData?.tyomahdollisuus?.otsikko),
        });
      } else if (opportunity.handle.type === 'educationOpportunity') {
        const loaderData = opportunity.loaderData as EducationOpportunityData;
        crumbs.push({
          label: getLocalizedText(loaderData?.koulutusmahdollisuus.otsikko),
        });
      }

      setItems(crumbs);
    } else {
      setItems(
        validMatches.map((match) => {
          const isRoot = match.id === 'root';
          return {
            label: isRoot ? t('front-page') : match.handle?.title || '',
            to: match.pathname,
          };
        }),
      );
    }
    // Breadcrumb only needs to be initialized once per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DSBreadCrumb
      items={items}
      serviceVariant="yksilo"
      linkComponent={BreadcrumbLink}
      testId="breadcrumb"
      ariaLabel={t('breadcrumb')}
    />
  );
};
