import {
  MainLayout,
  OpportunityCard,
  RoutesNavigationList,
  SimpleNavigationList,
  Title,
  type RoutesNavigationListProps,
} from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { getLocalizedText } from '@/utils';
import { Button, Checkbox, Pagination } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { NavLink, useOutletContext } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';

const Favorites = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();

  const { deleteSuosikki, filters, fetchPage, pageData, pageNr, pageSize, setFilters, suosikit } = useSuosikitStore();
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const title = t('profile.favorites.title');
  const jobFilterText = t('job-opportunities');
  const educationFilterText = t('education-opportunities');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (filters.includes(value)) {
      setFilters(filters.filter((filter) => filter !== value));
    } else {
      setFilters([...filters, value]);
    }
  };

  const isFilterChecked = (value: string) => filters.includes(value);

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <SimpleNavigationList title={t('profile.index')}>
            <RoutesNavigationList routes={navigationRoutes} />
          </SimpleNavigationList>
          <SimpleNavigationList title={t('content')} backgroundClassName="bg-bg-gray-2" collapsible>
            <div className="flex flex-col gap-4 hyphens-auto">
              <div className="text-todo">TODO</div>
              <Checkbox
                ariaLabel={jobFilterText}
                checked={isFilterChecked('work')}
                label={jobFilterText}
                name={jobFilterText}
                onChange={handleFilterChange}
                value="work"
              />
              <Checkbox
                ariaLabel={educationFilterText}
                checked={isFilterChecked('education')}
                label={educationFilterText}
                name={educationFilterText}
                onChange={handleFilterChange}
                value="education"
              />
            </div>
          </SimpleNavigationList>
        </div>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-lg">{t('profile.favorites.description')}</p>
      <p className="mb-8">{t('profile.favorites.you-have-saved-n-opportunities', { count: suosikit.length })}</p>

      <div className="flex flex-col gap-5 mb-8">
        {pageData.map((mahdollisuus) => {
          const { id } = mahdollisuus;
          return (
            <NavLink
              key={id}
              to={`/${language}/${t('slugs.job-opportunity.index')}/${id}/${t('slugs.job-opportunity.overview')}`}
            >
              <OpportunityCard
                description={getLocalizedText(mahdollisuus.tiivistelma)}
                employmentOutlook={2}
                hasRestrictions
                industryName="TODO: Lorem ipsum dolor"
                isFavorite={true}
                isLoggedIn={true}
                mostCommonEducationBackground="TODO: Lorem ipsum dolor"
                name={getLocalizedText(mahdollisuus.otsikko)}
                toggleFavorite={() => void deleteSuosikki(id, 'work')}
                trend="NOUSEVA"
                type="work"
              />
            </NavLink>
          );
        })}
      </div>
      {suosikit.length > 0 && (
        <Pagination
          currentPage={pageNr}
          onPageChange={(data) => void fetchPage(data)}
          pageSize={pageSize}
          siblingCount={1}
          translations={{
            nextTriggerLabel: t('pagination.next'),
            prevTriggerLabel: t('pagination.previous'),
          }}
          totalItems={suosikit.length}
          type="button"
        />
      )}
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button variant="white" label="TODO: Vertaile" />
            <Button variant="white" label="TODO: Luo polku" />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default Favorites;
