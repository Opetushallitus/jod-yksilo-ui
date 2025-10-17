import type { MahdollisuusTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { filterValues, type OpportunityFilterValue } from '../../utils';

export const FilterOpportunityType = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const { ehdotuksetCount, filter, setFilter } = useToolStore(
    useShallow((state) => ({
      ehdotuksetCount: state.ehdotuksetCount,
      filter: state.filters.opportunityType,
      setFilter: state.setArrayFilter,
    })),
  );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value as MahdollisuusTyyppi;
    setFilter('opportunityType', newFilter);
  };

  React.useEffect(() => {
    if (searchParams.get('origin') === 'favorites') {
      const filterParam = searchParams.get('filter') as OpportunityFilterValue;
      if (filterParam) {
        setFilter('opportunityType', filterParam);
      }
      const opportunitiesTitleElement = document.getElementById('opportunities-title');
      if (opportunitiesTitleElement) {
        opportunitiesTitleElement.scrollIntoView({ behavior: 'smooth' });
        opportunitiesTitleElement.focus();
      }
      const url = new URL(globalThis.location.href);
      url.search = ''; // Clear search parameters
      globalThis.history.replaceState({}, '', url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCheckboxLabel = (type: MahdollisuusTyyppi) =>
    type === 'TYOMAHDOLLISUUS'
      ? t('n-job-opportunities', { count: ehdotuksetCount.TYOMAHDOLLISUUS })
      : t('n-education-opportunities', { count: ehdotuksetCount.KOULUTUSMAHDOLLISUUS });

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      <Checkbox
        ariaLabel={getCheckboxLabel('TYOMAHDOLLISUUS')}
        className="font-poppins!"
        checked={filter.includes('ALL') || filter.includes('TYOMAHDOLLISUUS')}
        label={getCheckboxLabel('TYOMAHDOLLISUUS')}
        name={filterValues.TYOMAHDOLLISUUS}
        onChange={onFilterChange}
        value={filterValues.TYOMAHDOLLISUUS}
        data-testid="filter-job-opportunities"
      />
      <Checkbox
        ariaLabel={getCheckboxLabel('KOULUTUSMAHDOLLISUUS')}
        className="font-poppins!"
        checked={filter.includes('ALL') || filter.includes('KOULUTUSMAHDOLLISUUS')}
        label={getCheckboxLabel('KOULUTUSMAHDOLLISUUS')}
        name={filterValues.KOULUTUSMAHDOLLISUUS}
        onChange={onFilterChange}
        value={filterValues.KOULUTUSMAHDOLLISUUS}
        data-testid="filter-education-opportunities"
      />
    </fieldset>
  );
};
