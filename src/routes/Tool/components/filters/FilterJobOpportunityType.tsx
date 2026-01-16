import { useToolStore } from '@/stores/useToolStore';
import { Checkbox } from '@jod/design-system';
import { JodAi } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

export const FilterJobOpportunityType = () => {
  const { t } = useTranslation();

  const { filter, setFilter, addToArray } = useToolStore(
    useShallow((state) => ({
      filter: state.filters.jobOpportunityType,
      setFilter: state.setArrayFilter,
      addToArray: state.addToArray,
    })),
  );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value;
    if (!filter.includes(newFilter)) {
      // this is only true if setFilter is adding stuff
      addToArray('opportunityType', 'TYOMAHDOLLISUUS');
    }
    setFilter('jobOpportunityType', newFilter);
  };

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      <Checkbox
        ariaLabel={t('opportunity-type.work.AMMATTITIETO')}
        className="font-poppins!"
        checked={filter.includes('AMMATTITIETO')}
        label={t('opportunity-type.work.AMMATTITIETO')}
        name={t('opportunity-type.work.AMMATTITIETO')}
        onChange={onFilterChange}
        value="AMMATTITIETO"
        testId="filter-job-opportunity-ammattitieto"
      />
      <Checkbox
        ariaLabel={t('opportunity-type.work.TMT')}
        className="font-poppins!"
        checked={filter.includes('TMT')}
        label={
          <span className="pl-4">
            {t('opportunity-type.work.TMT')} <JodAi className="inline mb-1 ml-3" />
          </span>
        }
        name={t('opportunity-type.work.TMT')}
        onChange={onFilterChange}
        value="TMT"
        testId="filter-job-opportunity-tmt"
      />
    </fieldset>
  );
};
