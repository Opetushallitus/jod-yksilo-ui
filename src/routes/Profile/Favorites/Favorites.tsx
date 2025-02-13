import {
  MainLayout,
  OpportunityCard,
  RoutesNavigationList,
  SimpleNavigationList,
  type RoutesNavigationListProps,
} from '@/components';
import { MahdollisuusTyyppiFilter } from '@/components/MahdollisuusTyyppiFilter/MahdollisuusTyyppiFilter';
import { FilterButton } from '@/components/MobileFilterButton/MobileFilterButton';
import { useActionBar } from '@/hooks/useActionBar';
import FavoritesOpportunityCardActionMenu from '@/routes/Profile/Favorites/FavoritesOpportunityCardMenu';
import { MahdollisuusTyyppi } from '@/routes/types';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { getLocalizedText } from '@/utils';
import { Button, Modal, Pagination, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { getTypeSlug, mapNavigationRoutes } from '../utils';

const Favorites = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();

  const { deleteSuosikki, filters, fetchPage, pageData, pageNr, pageSize, setFilters, suosikit, totalItems } =
    useSuosikitStore(
      useShallow((state) => ({
        deleteSuosikki: state.deleteSuosikki,
        filters: state.filters,
        fetchPage: state.fetchPage,
        pageData: state.pageData,
        pageNr: state.pageNr,
        pageSize: state.pageSize,
        setFilters: state.setFilters,
        suosikit: state.suosikit,
        totalItems: state.totalItems,
      })),
    );
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const title = t('profile.favorites.title');
  const jobFilterText = t('job-opportunities');
  const educationFilterText = t('education-opportunities');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const { sm } = useMediaQueries();
  const [showFilters, setShowFilters] = React.useState(false);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as MahdollisuusTyyppi;
    if (filters.includes(value)) {
      if (filters.length > 1) {
        setFilters(filters.filter((filter) => filter !== value));
      }
    } else {
      setFilters([...filters, value]);
    }
    void fetchPage({ page: 1, pageSize: pageSize });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFilterChecked = (value: MahdollisuusTyyppi) => filters.includes(value);

  type SelectedFilter = 'KAIKKI' | 'TYOMAHDOLLISUUS' | 'KOULUTUSMAHDOLLISUUS';

  const selectedFilter: SelectedFilter = React.useMemo(() => {
    if (filters.includes('TYOMAHDOLLISUUS') && filters.includes('KOULUTUSMAHDOLLISUUS')) {
      return 'KAIKKI';
    } else if (filters.includes('TYOMAHDOLLISUUS')) {
      return 'TYOMAHDOLLISUUS';
    } else if (filters.includes('KOULUTUSMAHDOLLISUUS')) {
      return 'KOULUTUSMAHDOLLISUUS';
    }
    return 'KAIKKI';
  }, [filters]);

  const subtitleToShow = React.useMemo(() => {
    switch (selectedFilter) {
      case 'KAIKKI':
        return t('profile.favorites.job-and-education-opportunities');
      case 'TYOMAHDOLLISUUS':
        return jobFilterText;
      case 'KOULUTUSMAHDOLLISUUS':
        return educationFilterText;
    }
  }, [selectedFilter, jobFilterText, educationFilterText, t]);

  const favoritesPerType = React.useMemo(() => {
    switch (selectedFilter) {
      case 'KAIKKI':
        return pageData;
      case 'TYOMAHDOLLISUUS':
        return pageData.filter((mahdollisuus) => mahdollisuus.mahdollisuusTyyppi === 'TYOMAHDOLLISUUS');
      case 'KOULUTUSMAHDOLLISUUS':
        return pageData.filter((mahdollisuus) => mahdollisuus.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS');
    }
  }, [selectedFilter, pageData]);

  const favoriteCountText = React.useMemo(() => {
    switch (selectedFilter) {
      case 'KAIKKI':
        return t('profile.favorites.you-have-saved-opportunities', {
          jobOpportunitiesCount: suosikit.filter((s) => s.tyyppi === 'TYOMAHDOLLISUUS').length,
          educationOpportunitiesCount: suosikit.filter((s) => s.tyyppi === 'KOULUTUSMAHDOLLISUUS').length,
        });
      case 'TYOMAHDOLLISUUS':
        return t('profile.favorites.you-have-saved-n-job-opportunities', {
          count: totalItems,
        });
      case 'KOULUTUSMAHDOLLISUUS':
        return t('profile.favorites.you-have-saved-n-education-opportunities', {
          count: totalItems,
        });
    }
  }, [selectedFilter, suosikit, t, totalItems]);

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <SimpleNavigationList title={t('profile.index')}>
            <RoutesNavigationList routes={navigationRoutes} />
          </SimpleNavigationList>
          <SimpleNavigationList title={t('content')} backgroundClassName="bg-bg-gray-2" collapsible>
            <MahdollisuusTyyppiFilter
              jobFilterText={jobFilterText}
              educationFilterText={educationFilterText}
              isFilterChecked={isFilterChecked}
              handleFilterChange={handleFilterChange}
            />
          </SimpleNavigationList>
        </div>
      }
    >
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-lg">{t('profile.favorites.description')}</p>

      <div className="flex flex-row justify-between">
        <h2 className="text-heading-2-mobile sm:text-heading-2">{subtitleToShow}</h2>
        <div className="flex flex-row justify-end pb-6">
          <FilterButton onClick={() => setShowFilters(true)} label={t('profile.favorites.show-filters')} />
        </div>
      </div>

      <p className="mb-8">{favoriteCountText}</p>

      <div>
        {!sm && (
          <Modal
            open={showFilters}
            onClose={() => setShowFilters(false)}
            content={
              <div className="py-6 px-[20px] bg-bg-gray">
                <span className="text-heading-3">{t('content')}</span>
                <MahdollisuusTyyppiFilter
                  jobFilterText={jobFilterText}
                  educationFilterText={educationFilterText}
                  isFilterChecked={isFilterChecked}
                  handleFilterChange={handleFilterChange}
                />
              </div>
            }
            footer={
              <div className="flex flex-row justify-end gap-4">
                <Button variant="white" label={t('close')} onClick={() => setShowFilters(false)} />
              </div>
            }
          />
        )}
      </div>

      <div className="flex flex-col gap-5 mb-8">
        {favoritesPerType.map((mahdollisuus) => {
          const { id, mahdollisuusTyyppi } = mahdollisuus;
          return (
            <OpportunityCard
              key={id}
              to={`/${language}/${getTypeSlug(mahdollisuusTyyppi)}/${id}`}
              description={getLocalizedText(mahdollisuus.tiivistelma)}
              employmentOutlook={2}
              hasRestrictions
              industryName="TODO: Lorem ipsum dolor"
              isFavorite={true}
              isLoggedIn={true}
              mostCommonEducationBackground="TODO: Lorem ipsum dolor"
              name={getLocalizedText(mahdollisuus.otsikko)}
              toggleFavorite={() => void deleteSuosikki(id)}
              trend="NOUSEVA"
              type={mahdollisuusTyyppi}
              menuContent={
                <FavoritesOpportunityCardActionMenu
                  mahdollisuusId={id}
                  mahdollisuusTyyppi={mahdollisuusTyyppi}
                  menuId={id}
                />
              }
              menuId={id}
            />
          );
        })}
      </div>
      {suosikit.length > 0 && (
        <Pagination
          currentPage={pageNr}
          onPageChange={(data) => {
            void fetchPage(data);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          pageSize={pageSize}
          siblingCount={1}
          translations={{
            nextTriggerLabel: t('pagination.next'),
            prevTriggerLabel: t('pagination.previous'),
          }}
          totalItems={totalItems}
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
