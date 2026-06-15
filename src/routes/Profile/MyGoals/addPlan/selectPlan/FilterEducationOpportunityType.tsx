import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { Checkbox } from '@jod/design-system';
import { JodAi } from '@jod/design-system/icons';

import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore.ts';

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
      <legend className="sr-only mb-5 text-heading-4-mobile sm:text-heading-4">{t('show')}</legend>
      <Checkbox
        ariaLabel={t('opportunity-type.education.TUTKINTO')}
        className="font-poppins!"
        checked={filter.includes('TUTKINTO')}
        label={
          <span className="pl-4">
            {t('opportunity-type.education.TUTKINTO')}{' '}
            <JodAi className="mb-1 ml-3 inline" aria-label={t('ai-icon-alt')} />
          </span>
        }
        name={t('opportunity-type.education.TUTKINTO')}
        onChange={onFilterChange}
        value="TUTKINTO"
        data-testid="filter-education-opportunity-tutkinto"
      />
      <Checkbox
        ariaLabel={t('opportunity-type.education.EI_TUTKINTO')}
        className="font-poppins!"
        checked={filter.includes('EI_TUTKINTO')}
        label={
          <span className="pl-4">
            {t('opportunity-type.education.EI_TUTKINTO')}{' '}
            <JodAi className="mb-1 ml-3 inline" aria-label={t('ai-icon-alt')} />
          </span>
        }
        name={t('opportunity-type.education.EI_TUTKINTO')}
        onChange={onFilterChange}
        value="EI_TUTKINTO"
        data-testid="filter-education-opportunity-ei-tutkinto"
      />
    </fieldset>
  );
};
