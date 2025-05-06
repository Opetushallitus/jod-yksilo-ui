import { MahdollisuusTyyppiFilter } from '@/components/MahdollisuusTyyppiFilter/MahdollisuusTyyppiFilter';
import { FilterButton } from '@/components/MobileFilterButton/MobileFilterButton';
import { useMenuClickHandler } from '@/hooks/useMenuClickHandler';
import { mapOsaaminenToUri } from '@/routes/Profile/Path/utils';
import { MahdollisuusTyyppi } from '@/routes/types';
import { useEhdotetutVaiheetStore } from '@/stores/useEhdotetutVaiheetStore';
import { usePolutStore } from '@/stores/usePolutStore';
import { PageChangeDetails, Pagination, RadioButtonGroup, Spinner, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import VaiheOpportunityCard from './VaiheOpportunityCard';

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

const SelectOpportunityStep = ({ vaiheIndex }: { vaiheIndex: number }) => {
  const { t } = useTranslation();
  const { sm, lg } = useMediaQueries();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const filterMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const filterMenuRef = useMenuClickHandler(() => setFiltersOpen(false), filterMenuButtonRef);
  const {
    disabledOsaamiset,
    ignoredOsaamiset,
    osaamisetFromProfile,
    osaamisetFromVaiheet,
    proposedOpportunity,
    selectedOsaamiset,
    setProposedOpportunity,
    vaaditutOsaamiset,
  } = usePolutStore(
    useShallow((state) => ({
      disabledOsaamiset: state.disabledOsaamiset,
      ignoredOsaamiset: state.ignoredOsaamiset,
      osaamisetFromProfile: state.osaamisetFromProfile,
      osaamisetFromVaiheet: state.osaamisetFromVaiheet,
      proposedOpportunity: state.proposedOpportunity,
      selectedOsaamiset: state.selectedOsaamiset,
      setProposedOpportunity: state.setProposedOpportunity,
      vaaditutOsaamiset: state.vaaditutOsaamiset,
    })),
  );

  const { fetchEhdotukset, fetchPage, filters, isLoading, pageData, pageNr, pageSize, setFilters, totalItems } =
    useEhdotetutVaiheetStore(
      useShallow((state) => ({
        fetchEhdotukset: state.fetchEhdotukset,
        fetchPage: state.fetchPage,
        filters: state.filters,
        isLoading: state.isLoading,
        pageData: state.pageData,
        pageNr: state.pageNr,
        pageSize: state.pageSize,
        setFilters: state.setFilters,
        totalItems: state.totalItems,
      })),
    );

  React.useEffect(() => {
    const fetchData = async () => {
      const existingOsaamiset = [
        ...osaamisetFromProfile.map(mapOsaaminenToUri),
        ...osaamisetFromVaiheet.map(mapOsaaminenToUri),
        ...selectedOsaamiset,
        ...disabledOsaamiset,
        ...ignoredOsaamiset,
      ];
      const osaaminenUris = vaaditutOsaamiset.map(mapOsaaminenToUri).filter((uri) => !existingOsaamiset.includes(uri));
      await fetchEhdotukset(osaaminenUris);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as MahdollisuusTyyppi;
    if (filters.includes(value)) {
      if (filters.length > 1) {
        setFilters(filters.filter((filter) => filter !== value));
      }
    } else {
      setFilters([...filters, value]);
    }
    void fetchPage({ page: 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const mahdollisuudetPerType = React.useMemo(() => {
    switch (selectedFilter) {
      case 'KAIKKI':
        return pageData;
      case 'TYOMAHDOLLISUUS':
        return pageData.filter((mahdollisuus) => mahdollisuus.mahdollisuusTyyppi === 'TYOMAHDOLLISUUS');
      case 'KOULUTUSMAHDOLLISUUS':
        return pageData.filter((mahdollisuus) => mahdollisuus.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS');
    }
  }, [pageData, selectedFilter]);

  const onPageChange = async (data: PageChangeDetails) => {
    await fetchPage(data);

    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return isLoading ? (
    <div className="absolute top-1/2 left-1/2 transform -translate-1/2">
      <Spinner size={64} color="accent" />
    </div>
  ) : (
    <>
      <h1 className="text-heading-1-mobile sm:text-heading-1">
        {t('profile.paths.choose-for-phase', { count: vaiheIndex + 1 })}
      </h1>
      {!isLoading && totalItems === 0 ? (
        <p className="mt-7">{t('profile.paths.proposed-opportunities-not-found')}</p>
      ) : (
        <>
          <div className="flex justify-end p-3">
            <FilterButton
              onClick={() => setFiltersOpen(!filtersOpen)}
              label={t('do-filter')}
              breakpoint="lg"
              ref={filterMenuButtonRef}
              inline
            />
          </div>

          {filtersOpen && (
            <div className="relative">
              <div
                className="flex flex-col absolute right-0 top-full z-10 bg-bg-gray-2 p-6 rounded-md mt-4 w-[343px] shadow-border text-left gap-6"
                ref={filterMenuRef}
              >
                <Filters handleFilterChange={handleFilterChange} filters={filters} />
              </div>
            </div>
          )}
          <div className="flex flex-row mt-6 gap-5" ref={scrollRef}>
            <div className="flex flex-col gap-6">
              <RadioButtonGroup
                label={t('profile.paths.choose-one-opportunity')}
                hideLabel
                value={proposedOpportunity?.id ?? ''}
                onChange={(id) => {
                  const opportunity = pageData.find((o) => o.id === id);
                  if (opportunity) {
                    setProposedOpportunity(opportunity);
                  }
                }}
              >
                <div className="flex flex-col gap-5">
                  {pageData.map((mahdollisuus) => (
                    <VaiheOpportunityCard key={mahdollisuus.id} mahdollisuus={mahdollisuus} />
                  ))}
                </div>
              </RadioButtonGroup>
              {mahdollisuudetPerType.length > 0 && (
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
        </>
      )}
    </>
  );
};

export default SelectOpportunityStep;
