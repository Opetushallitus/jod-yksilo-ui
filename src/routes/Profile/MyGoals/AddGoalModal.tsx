import { OpportunityCard } from '@/components';
import { MahdollisuusTyyppiFilter } from '@/components/MahdollisuusTyyppiFilter/MahdollisuusTyyppiFilter';
import { FilterButton } from '@/components/MobileFilterButton/MobileFilterButton';
import { useEscHandler } from '@/hooks/useEscHandler';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import MyGoalsOpportunityCardMenu from '@/routes/Profile/MyGoals/MyGoalsOpportunityCardMenu';
import { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { getLocalizedText } from '@/utils';
import { Button, Modal, PageChangeDetails, Pagination, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const Filters = ({
  handleFilterChange,
  filters,
}: {
  handleFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filters: string[];
}) => {
  const { t } = useTranslation();
  const isFilterChecked = (value: MahdollisuusTyyppi) => filters.includes(value);
  const jobFilterText = t('job-opportunities');
  const educationFilterText = t('education-opportunities');

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-heading-2">{t('do-filter')}</h2>
      <div className="flex flex-col gap-5">
        <MahdollisuusTyyppiFilter
          jobFilterText={jobFilterText}
          educationFilterText={educationFilterText}
          isFilterChecked={isFilterChecked}
          handleFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
};

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const AddGoalModal = ({ isOpen, onClose }: AddGoalModalProps) => {
  const { t } = useTranslation();
  const { sm, lg } = useMediaQueries();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const filterMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const filterMenuRef = useMenuClickHandler(() => setFiltersOpen(false), filterMenuButtonRef);
  const {
    fetchPage,
    fetchSuosikit,
    filters,
    pageData,
    pageNr,
    pageSize,
    setFilters,
    setExcludedIds,
    excludedIds,
    totalItems: totalFavorites,
  } = useSuosikitStore(
    useShallow((state) => ({
      fetchPage: state.fetchPage,
      fetchSuosikit: state.fetchSuosikit,
      filters: state.filters,
      pageData: state.pageData,
      pageNr: state.pageNr,
      pageSize: state.pageSize,
      setFilters: state.setFilters,
      excludedIds: state.excludedIds,
      setExcludedIds: state.setExcludedIds,
      totalItems: state.totalItems,
    })),
  );

  const tavoitteet = useTavoitteetStore((state) => state.tavoitteet);
  const [listItems, setListItems] = React.useState<TypedMahdollisuus[]>([]);

  const goalsId = React.useId();
  useEscHandler(onClose, goalsId);

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

  const favoritesPerType = React.useMemo(() => {
    switch (selectedFilter) {
      case 'KAIKKI':
        return pageData;
      case 'TYOMAHDOLLISUUS':
        return pageData.filter((mahdollisuus) => mahdollisuus.mahdollisuusTyyppi === 'TYOMAHDOLLISUUS');
      case 'KOULUTUSMAHDOLLISUUS':
        return pageData.filter((mahdollisuus) => mahdollisuus.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS');
    }
  }, [pageData, selectedFilter]);

  // Show only items that are not already in goals
  React.useEffect(() => {
    setListItems(favoritesPerType.filter((item) => !tavoitteet.find((pm) => pm.mahdollisuusId === item.id)));
  }, [favoritesPerType, tavoitteet]);

  // Initial fetch. Fetch suosikit in case päämäärät have been updated, otherwise
  // page data won't be updated correctly.
  React.useEffect(() => {
    const fetchData = async () => {
      const newExcludeIds = tavoitteet.map((pm) => pm.mahdollisuusId);
      const previousExcludedIds = [...excludedIds];

      if (previousExcludedIds.length !== newExcludeIds.length) {
        setExcludedIds(newExcludeIds);
        await fetchSuosikit();
      }
      await fetchPage({ page: 1, pageSize });
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const onPageChange = async (data: PageChangeDetails) => {
    await fetchPage(data);

    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const headerText = t('profile.my-goals.add-modal-title');
  return (
    <Modal
      name={headerText}
      open={isOpen}
      fullWidthContent
      content={
        <div id={goalsId}>
          <div>
            <div className="bg-bg-gray pb-3 relative">
              <h1 className="text-heading-1-mobile sm:text-heading-1">{headerText}</h1>
              <p className="text-body-sm-mobile sm:text-body-sm">{t('profile.my-goals.add-modal-description')}</p>

              {totalFavorites > 0 && (
                <div className="flex justify-end p-3">
                  <FilterButton
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    label={t('do-filter')}
                    hideAfterBreakpoint="lg"
                    ref={filterMenuButtonRef}
                    inline
                  />
                </div>
              )}
              {totalFavorites > 0 && filtersOpen && !lg && (
                <div
                  className="flex flex-col absolute right-0 top-full z-10 bg-bg-gray-2 p-6 rounded-md mt-4 w-[343px] shadow-border text-left gap-6"
                  ref={filterMenuRef}
                >
                  <Filters handleFilterChange={handleFilterChange} filters={filters} />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row mt-6 gap-5" ref={scrollRef}>
            <div className="flex flex-col gap-3 w-full">
              {listItems.map((mahdollisuus) => {
                const { id, mahdollisuusTyyppi } = mahdollisuus;
                return (
                  <OpportunityCard
                    key={id}
                    description={getLocalizedText(mahdollisuus.tiivistelma)}
                    name={getLocalizedText(mahdollisuus.otsikko)}
                    aineisto={mahdollisuus.aineisto}
                    tyyppi={mahdollisuus.tyyppi}
                    type={mahdollisuusTyyppi}
                    hideFavorite
                    menuContent={
                      <MyGoalsOpportunityCardMenu
                        mahdollisuusId={id}
                        mahdollisuusTyyppi={mahdollisuusTyyppi}
                        menuId={id}
                      />
                    }
                    menuId={id}
                  />
                );
              })}
              {favoritesPerType.length > 0 && (
                <div className="mt-5">
                  <Pagination
                    currentPage={pageNr}
                    onPageChange={onPageChange}
                    pageSize={pageSize}
                    siblingCount={sm ? 1 : 0}
                    translations={{
                      nextTriggerLabel: t('pagination.next'),
                      prevTriggerLabel: t('pagination.previous'),
                    }}
                    totalItems={totalFavorites}
                  />
                </div>
              )}
            </div>
            {lg && (
              <div className="p-5 bg-bg-gray-2 sticky top-0 rounded-md h-min">
                <Filters handleFilterChange={handleFilterChange} filters={filters} />
              </div>
            )}
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end flex-1">
          <Button variant="white" label={t('close')} onClick={onClose} className="whitespace-nowrap" />
        </div>
      }
    />
  );
};

export default AddGoalModal;
