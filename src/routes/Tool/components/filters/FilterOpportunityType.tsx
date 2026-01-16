import { FilterKesto } from '@/routes/Tool/components/filters/FilterKesto.tsx';
import type { MahdollisuusTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import type { FilterName } from '@/stores/useToolStore/ToolStoreModel';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { filterValues, type OpportunityFilterValue } from '../../utils';
import { Setting } from '../Settings';
import { FilterAmmattiryhma } from './FilterAmmattiryhma';
import { FilterEducationOpportunityType } from './FilterEducationOpportunityType';
import { FilterJobOpportunityType } from './FilterJobOpportunityType';

export const FilterOpportunityType = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const { ehdotuksetCount, filter, setFilter, tyomahdollisuudetCount, koulutusmahdollisuudetCount } = useToolStore(
    useShallow((state) => ({
      ehdotuksetCount: state.ehdotuksetCount,
      filter: state.filters.opportunityType,
      setFilter: state.setArrayFilter,
      tyomahdollisuudetCount: state.filteredTyomahdollisuudetCount,
      koulutusmahdollisuudetCount: state.filteredKoulutusMahdollisuudetCount,
    })),
  );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value as MahdollisuusTyyppi;
    setFilter('opportunityType', newFilter);
  };
  const filters = useToolStore((state) => state.filters);

  const getFilterCount = (filterList: FilterName[]) => {
    if (!filters) {
      return 0;
    }

    return filterList.reduce((sum, filter) => {
      const value = filters[filter];
      if (Array.isArray(value)) {
        return sum + value.length;
      } else if (typeof value === 'number') {
        return sum + 1;
      } else {
        return sum;
      }
    }, 0);
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
      ? t('n-job-opportunities', { count: tyomahdollisuudetCount, total: ehdotuksetCount.TYOMAHDOLLISUUS })
      : t('n-education-opportunities', {
          count: koulutusmahdollisuudetCount,
          total: ehdotuksetCount.KOULUTUSMAHDOLLISUUS,
        });

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      <Checkbox
        ariaLabel={getCheckboxLabel('KOULUTUSMAHDOLLISUUS')}
        className="font-poppins!"
        checked={filter.includes('ALL') || filter.includes('KOULUTUSMAHDOLLISUUS')}
        label={getCheckboxLabel('KOULUTUSMAHDOLLISUUS')}
        name={filterValues.KOULUTUSMAHDOLLISUUS}
        onChange={onFilterChange}
        value={filterValues.KOULUTUSMAHDOLLISUUS}
        testId="filter-education-opportunities"
      />

      <ul className="flex flex-col gap-3 ml-5">
        <Setting
          id="education-opportunity-type"
          title={t('tool.settings.general.education-opportunity-type')}
          count={getFilterCount(['educationOpportunityType'])}
          className="pb-3"
          testId="education-opportunity-type-setting"
        >
          <FilterEducationOpportunityType />
        </Setting>
        <Setting
          id="duration-filter"
          title={t('tool.settings.general.duration')}
          count={filters.maxDuration || filters.minDuration ? 1 : 0}
          className="pb-3"
          testId="duration-filter-setting"
        >
          <FilterKesto />
        </Setting>
      </ul>

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

      <ul className="flex flex-col gap-3 ml-5">
        <Setting
          id="job-opportunity-type"
          title={t('tool.settings.general.job-opportunity-type')}
          count={getFilterCount(['jobOpportunityType'])}
          data-testid="job-opportunity-type-setting"
        >
          <FilterJobOpportunityType />
        </Setting>
        <Setting
          title={t('tool.settings.general.occupation-type')}
          count={getFilterCount(['ammattiryhmat'])}
          data-testid="occupation-type-setting"
        >
          <FilterAmmattiryhma />
        </Setting>
      </ul>
    </fieldset>
  );
};
