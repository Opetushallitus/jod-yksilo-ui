import { useToolStore } from '@/stores/useToolStore';
import { Checkbox } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const FilterJobOpportunityType = () => {
  const { t } = useTranslation();
  const { filters, setFilter } = useToolStore(
    useShallow((state) => ({
      filters: state.filters,
      setFilter: state.setArrayFilter,
    })),
  );

  const filter = filters.jobOpportunityType;

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      <Checkbox
        ariaLabel={t('tool.settings.job-opportunity.type-ammatit')}
        className="font-poppins!"
        checked={filter.includes('ammatit')}
        label={t('tool.settings.job-opportunity.type-ammatit')}
        name="type-ammatit"
        onChange={() => {
          setFilter('jobOpportunityType', 'ammatit');
        }}
        value="ammatit"
        data-testid="filter-job-opportunities-by-ammatit"
      />
      <Checkbox
        ariaLabel={t('tool.settings.type-tyomahdollisuudet')}
        className="font-poppins!"
        checked={filter.includes('tyomahdollisuudet')}
        label={t('tool.settings.job-opportunity.type-tyomahdollisuudet')}
        name="type-tyomahdollisuudet"
        onChange={() => {
          setFilter('jobOpportunityType', 'tyomahdollisuudet');
        }}
        value="tyomahdollisuudet"
        data-testid="filter-job-opportunities-by-tyomahdollisuudet"
      />
    </fieldset>
  );
};

export default FilterJobOpportunityType;
