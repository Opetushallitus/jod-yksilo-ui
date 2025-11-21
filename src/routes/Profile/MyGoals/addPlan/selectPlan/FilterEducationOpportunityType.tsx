import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore.ts';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

export const FilterEducationOpportunityType = () => {
  const { t } = useTranslation();

  const { filter, setFilter } = addPlanStore(
    useShallow((state) => ({
      filter: state.filters.educationOpportunityType,
      setFilter: state.setArrayFilter,
    })),
  );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter: string = event.target.value;
    setFilter('educationOpportunityType', newFilter);
  };

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      <Checkbox
        ariaLabel={t('opportunity-type.education.TUTKINTO')}
        className="font-poppins!"
        checked={filter.includes('TUTKINTO')}
        label={t('opportunity-type.education.TUTKINTO')}
        name={t('opportunity-type.education.TUTKINTO')}
        onChange={onFilterChange}
        value="TUTKINTO"
        data-testid="filter-education-opportunity-tutkinto"
      />
      <Checkbox
        ariaLabel={t('opportunity-type.education.EI_TUTKINTO')}
        className="font-poppins!"
        checked={filter.includes('EI_TUTKINTO')}
        label={t('opportunity-type.education.EI_TUTKINTO')}
        name={t('opportunity-type.education.EI_TUTKINTO')}
        onChange={onFilterChange}
        value="EI_TUTKINTO"
        data-testid="filter-education-opportunity-ei-tutkinto"
      />
    </fieldset>
  );
};
