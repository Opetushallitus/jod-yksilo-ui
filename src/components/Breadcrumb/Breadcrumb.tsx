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
  const history = globalThis.history;
  const matches = useTypedMatches();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [items, setItems] = React.useState<BreadcrumbItem[]>([]);

  React.useEffect(() => {
    const validMatches = matches.filter((m) => m.handle?.title || m.id === 'root' || m.handle?.type);
    const crumbs: BreadcrumbItem[] = [
      {
        label: t('front-page'),
        to: `/${language}`,
      },
    ];

    const opportunityIndex = validMatches.findIndex(
      (item) => item?.handle?.type && ['jobOpportunity', 'educationOpportunity'].includes(item?.handle?.type),
    );
    const opportunity = opportunityIndex >= 0 ? validMatches[opportunityIndex] : null;

    /**
     * Gets the parent breadcrumbs for the opportunity based on the "from" parameter from state
     * @returns Breadcrumb items array
     */
    const getOpportunityParents = () => {
      const from: 'tool' | 'favorite' | 'path' | 'goal' | 'search' = history.state?.usr?.from ?? 'tool';
      const profileIndex: BreadcrumbItem = {
        label: t('profile.index'),
        to: `/${language}/${t('slugs.profile.index')}`,
      };

      if (from === 'tool') {
        return [{ label: t('tool.title'), to: `/${language}/${t('slugs.tool.index')}` }];
      } else if (from === 'search') {
        return [{ label: t('search.title'), to: `/${language}/${t('slugs.search')}` }];
      } else if (from === 'favorite') {
        return [
          profileIndex,
          {
            label: t('profile.favorites.title'),
            to: `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.favorites')}`,
          },
        ];
      } else if (from === 'goal') {
        return [
          profileIndex,
          {
            label: t('profile.my-goals.title'),
            to: `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.my-goals')}`,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches]);

  return (
    <DSBreadCrumb
      items={items}
      serviceVariant="yksilo"
      linkComponent={BreadcrumbLink}
      testId="breadcrumb"
      ariaLabel={t('common:breadcrumb')}
    />
  );
};
