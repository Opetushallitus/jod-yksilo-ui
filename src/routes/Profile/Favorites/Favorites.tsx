import { FilterList, MainLayout, OpportunityCard } from '@/components';
import { MahdollisuusTyyppiFilter } from '@/components/MahdollisuusTyyppiFilter/MahdollisuusTyyppiFilter';
import { FilterButton } from '@/components/MobileFilterButton/MobileFilterButton';
import { usePaginationTranslations } from '@/hooks/usePaginationTranslations';
import FavoritesOpportunityCardActionMenu from '@/routes/Profile/Favorites/FavoritesOpportunityCardMenu';
import type { MahdollisuusTyyppi } from '@/routes/types';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { getLocalizedText } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';
import { Button, EmptyState, Modal, Pagination, tidyClasses as tc, useMediaQueries } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { ProfileNavigationList, ProfileSectionTitle } from '../components';
import { getTypeSlug } from '../utils';

const GoalsCard = ({ testId, className = '' }: { testId: string; className?: string }) => {
  const { t, i18n } = useTranslation();
  const to = `/${i18n.language}/${t('slugs.profile.index')}/${t('slugs.profile.my-goals')}`;

  return (
    <div
      className={tc(`flex flex-col bg-secondary-1-dark-2 rounded-lg p-6 gap-3 text-white ${className}`)}
      data-testid={testId}
    >
      <h2 className="text-heading-2">{t('profile.favorites.goals-card.title')}</h2>
      <div className="flex flex-col gap-6">
        <p className="text-body-lg">{t('profile.favorites.goals-card.description')}</p>
        <Button
          label={t('profile.favorites.goals-card.link-text')}
          iconSide="right"
          icon={<JodArrowRight />}
          variant="white"
          linkComponent={getLinkTo(to)}
          className="w-fit"
          testId="goals-card-button"
        />
      </div>
    </div>
  );
};

const Favorites = () => {
  const {
    ammattiryhmaNimet,
    deleteSuosikki,
    filters,
    fetchPage,
    pageData,
    pageNr,
    pageSize,
    setFilters,
    suosikit,
    totalItems,
    totalPages,
  } = useSuosikitStore(
    useShallow((state) => ({
      ammattiryhmaNimet: state.ammattiryhmaNimet,
      deleteSuosikki: state.deleteSuosikki,
      fetchPage: state.fetchPage,
      filters: state.filters,
      pageData: state.pageData,
      pageNr: state.pageNr,
      pageSize: state.pageSize,
      setFilters: state.setFilters,
      suosikit: state.suosikit,
      totalItems: state.totalItems,
      totalPages: state.totalPages,
    })),
  );
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const title = t('profile.favorites.title');
  const jobFilterText = t('job-opportunities');
  const educationFilterText = t('education-opportunities');
  const { lg } = useMediaQueries();
  const [showFilters, setShowFilters] = React.useState(false);

  const descriptions = {
    KAIKKI: t('profile.favorites.you-have-no-job-nor-education-opportunities'),
    TYOMAHDOLLISUUS: t('profile.favorites.you-have-no-job-opportunities'),
    KOULUTUSMAHDOLLISUUS: t('profile.favorites.you-have-no-education-opportunities'),
  };

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

  const getFavoriteCountsForKaikki = React.useCallback(() => {
    const jobCount = suosikit.filter((s) => s.tyyppi === 'TYOMAHDOLLISUUS').length;
    const educationCount = suosikit.filter((s) => s.tyyppi === 'KOULUTUSMAHDOLLISUUS').length;
    return { jobCount, educationCount };
  }, [suosikit]);

  const getFavoriteCount = React.useCallback(() => {
    const { jobCount, educationCount } = getFavoriteCountsForKaikki();
    if (selectedFilter === 'KAIKKI') {
      return jobCount + educationCount;
    }
    if (selectedFilter === 'TYOMAHDOLLISUUS') {
      return jobCount;
    }
    if (selectedFilter === 'KOULUTUSMAHDOLLISUUS') {
      return educationCount;
    }
    return jobCount + educationCount;
  }, [getFavoriteCountsForKaikki, selectedFilter]);

  const getFavoriteCountText = React.useMemo(() => {
    const { jobCount, educationCount } = getFavoriteCountsForKaikki();
    switch (selectedFilter) {
      case 'KAIKKI': {
        return t('profile.favorites.you-have-saved-opportunities', {
          jobOpportunitiesCount: jobCount,
          educationOpportunitiesCount: educationCount,
        });
      }
      case 'TYOMAHDOLLISUUS':
        return t('profile.favorites.you-have-saved-job-opportunities', {
          jobOpportunitiesCount: jobCount,
        });
      case 'KOULUTUSMAHDOLLISUUS':
        return t('profile.favorites.you-have-saved-education-opportunities', {
          educationOpportunitiesCount: educationCount,
        });
    }
  }, [getFavoriteCountsForKaikki, selectedFilter, t]);

  const to = `/${language}/${t('slugs.tool.index')}`;

  const paginationTranslations = usePaginationTranslations();

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <FilterList title={t('content')} className="bg-bg-gray-2" collapsible>
            <MahdollisuusTyyppiFilter
              jobFilterText={jobFilterText}
              educationFilterText={educationFilterText}
              isFilterChecked={isFilterChecked}
              handleFilterChange={handleFilterChange}
            />
          </FilterList>
          <GoalsCard testId="favorites-go-to-goals" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <ProfileSectionTitle type="SUOSIKKI" title={title} />
      <p className="mb-8 text-body-lg">{t('profile.favorites.description')}</p>

      <div className="flex flex-row justify-between">
        <h2 className="text-heading-2-mobile sm:text-heading-2">{subtitleToShow}</h2>
        <FilterButton
          onClick={() => setShowFilters(true)}
          label={t('profile.favorites.show-filters')}
          hideAfterBreakpoint="lg"
        />
      </div>

      {getFavoriteCount() > 0 ? (
        <p className="mt-2">{getFavoriteCountText}</p>
      ) : (
        <div className="mt-5 mb-6">
          <EmptyState text={descriptions[selectedFilter]} testId="favorites-empty-state" />
        </div>
      )}

      <div>
        {!lg && (
          <Modal
            name={t('filters')}
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
              <div className="flex flex-row justify-end gap-4 flex-1">
                <Button
                  variant="white"
                  label={t('close')}
                  onClick={() => setShowFilters(false)}
                  className="whitespace-nowrap"
                  testId="favorites-close-filters"
                />
              </div>
            }
          />
        )}
      </div>

      <div className="flex flex-col gap-5 mb-8" data-testid="favorites-list">
        {favoritesPerType.map((mahdollisuus) => {
          const { id, mahdollisuusTyyppi, tyyppi, aineisto } = mahdollisuus;
          return (
            <OpportunityCard
              key={id}
              to={`/${language}/${getTypeSlug(mahdollisuusTyyppi)}/${id}?origin=favorites`}
              description={getLocalizedText(mahdollisuus.tiivistelma)}
              from="favorite"
              ammattiryhma={mahdollisuus?.ammattiryhma}
              ammattiryhmaNimet={ammattiryhmaNimet}
              isFavorite={true}
              isLoggedIn={true}
              name={getLocalizedText(mahdollisuus.otsikko)}
              toggleFavorite={() => void deleteSuosikki(id)}
              aineisto={aineisto}
              tyyppi={tyyppi}
              type={mahdollisuusTyyppi}
              kesto={mahdollisuus.kesto}
              yleisinKoulutusala={mahdollisuus.yleisinKoulutusala}
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
      {getFavoriteCount() > 0 && totalPages > 1 && (
        <Pagination
          currentPage={pageNr}
          onPageChange={(data) => {
            void fetchPage(data);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          pageSize={pageSize}
          siblingCount={1}
          translations={paginationTranslations}
          totalItems={totalItems}
          type="button"
          testId="favorites-pagination"
        />
      )}
      <Button
        variant="accent"
        label={t('profile.favorites.link-to-opportunities')}
        linkComponent={getLinkTo(to)}
        icon={<JodArrowRight />}
        iconSide="right"
      />
      {lg ? null : <GoalsCard testId="favorites-go-to-goals" className="mt-6" />}
    </MainLayout>
  );
};

export default Favorites;
