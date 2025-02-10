import { OpportunityCard } from '@/components';
import { SimpleNavigationList } from '@/components/MainLayout/SimpleNavigationList';
import MyGoalsOpportunityCardMenu from '@/routes/Profile/MyGoals/MyGoalsOpportunityCardMenu';
import { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { usePaamaaratStore } from '@/stores/usePaamaratStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { getLocalizedText } from '@/utils';
import { Button, Checkbox, Modal, PageChangeDetails, Pagination, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const AddGoalModal = ({ isOpen, onClose }: AddGoalModalProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const {
    fetchPage,
    fetchSuosikit,
    filters,
    pageData,
    pageNr,
    pageSize,
    setFilters,
    suosikit,
    setExcludedIds,
    totalItems,
  } = useSuosikitStore(
    useShallow((state) => ({
      fetchPage: state.fetchPage,
      fetchSuosikit: state.fetchSuosikit,
      filters: state.filters,
      pageData: state.pageData,
      pageNr: state.pageNr,
      pageSize: state.pageSize,
      setFilters: state.setFilters,
      suosikit: state.suosikit,
      setExcludedIds: state.setExcludedIds,
      totalItems: state.totalItems,
    })),
  );

  const paamaarat = usePaamaaratStore((state) => state.paamaarat);
  const [listItems, setListItems] = React.useState<TypedMahdollisuus[]>([]);

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
    setListItems(favoritesPerType.filter((item) => !paamaarat.find((pm) => pm.mahdollisuusId === item.id)));
  }, [favoritesPerType, paamaarat]);

  // Initial fetch
  React.useEffect(() => {
    const fetchData = async () => {
      setExcludedIds(paamaarat.map((pm) => pm.mahdollisuusId));

      if (suosikit.length === 0) {
        await fetchSuosikit();
      }
      await fetchPage({ page: 1, pageSize });
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jobFilterText = t('job-opportunities');
  const educationFilterText = t('education-opportunities');
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
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const onPageChange = async (data: PageChangeDetails) => {
    await fetchPage(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      content={
        <>
          <div className="sticky top-0 bg-bg-gray z-10 pb-3">
            <h1 className="text-heading-1">{t('profile.my-goals.add-modal-title')}</h1>
          </div>
          <div className="flex flex-row mt-6 gap-5" ref={scrollRef}>
            <div className="flex flex-col gap-3 w-full">
              {listItems.map((mahdollisuus) => {
                const { id, mahdollisuusTyyppi } = mahdollisuus;
                return (
                  <OpportunityCard
                    key={id}
                    description={getLocalizedText(mahdollisuus.tiivistelma)}
                    employmentOutlook={2}
                    hasRestrictions
                    industryName="TODO: Lorem ipsum dolor"
                    mostCommonEducationBackground="TODO: Lorem ipsum dolor"
                    name={getLocalizedText(mahdollisuus.otsikko)}
                    trend="LASKEVA"
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
                    totalItems={totalItems}
                    type="button"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      }
      sidePanel={
        <div className="pt-6">
          <SimpleNavigationList title={t('content')} backgroundClassName="bg-bg-gray-2 mt-11" collapsible>
            <div className="flex flex-col gap-4 hyphens-auto">
              <Checkbox
                ariaLabel={jobFilterText}
                checked={isFilterChecked('TYOMAHDOLLISUUS')}
                label={jobFilterText}
                name={jobFilterText}
                onChange={handleFilterChange}
                value="TYOMAHDOLLISUUS"
              />
              <Checkbox
                ariaLabel={educationFilterText}
                checked={isFilterChecked('KOULUTUSMAHDOLLISUUS')}
                label={educationFilterText}
                name={educationFilterText}
                onChange={handleFilterChange}
                value="KOULUTUSMAHDOLLISUUS"
              />
            </div>
          </SimpleNavigationList>
        </div>
      }
      footer={
        <div className="flex justify-end">
          <Button variant="white" label={t('close')} onClick={onClose} />
        </div>
      }
    />
  );
};

export default AddGoalModal;
