import { useToolStore } from '@/stores/useToolStore';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const FilterOpporunityType = () => {
  const { t } = useTranslation();

  const { filter, setFilter } = useToolStore(
    useShallow((state) => ({
      filter: state.filters.jobOpportunityType,
      setFilter: state.setArrayFilter,
    })),
  );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value as string;
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
        data-testid="filter-job-opportunity-ammattitieto"
      />
      <Checkbox
        ariaLabel={t('opportunity-type.work.TMT')}
        className="font-poppins!"
        checked={filter.includes('TMT')}
        label={t('opportunity-type.work.TMT')}
        name={t('opportunity-type.work.TMT')}
        onChange={onFilterChange}
        value="TMT"
        data-testid="filter-job-opportunity-tmt"
      />
    </fieldset>
  );
};

export default FilterOpporunityType;
